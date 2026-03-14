import { batch } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'
import { Node, Edge } from 'reactflow'

export type DepMap = Record<string, string[]>  // nodeId → upstream node IDs
export type DownstreamMap = Record<string, string[]>  // nodeId → downstream node IDs
export type OutputMap = Record<string, any>    // nodeId → output value

export interface NodeExecutionPayload {
    runId: string
    nodeId: string
    nodes: Node[]
    edges: Edge[]
    depMap: DepMap
    downstreamMap: DownstreamMap
    inputs: Record<string, any>
}

// ─── Graph Mapping ────────────────────────────────────────────────────────────

export function buildGraphMaps(
    nodes: Node[],
    edges: Edge[],
    executionSet: Set<string>
): { depMap: DepMap; downstreamMap: DownstreamMap } {
    const depMap: DepMap = {}
    const downstreamMap: DownstreamMap = {}

    for (const node of nodes) {
        if (!executionSet.has(node.id)) continue
        depMap[node.id] = []
        downstreamMap[node.id] = []
    }

    for (const edge of edges) {
        const src = edge.source
        const tgt = edge.target
        if (!executionSet.has(src) || !executionSet.has(tgt)) continue
        depMap[tgt].push(src)
        downstreamMap[src].push(tgt)
    }

    return { depMap, downstreamMap }
}

export function findSourceNodes(depMap: DepMap): string[] {
    return Object.entries(depMap)
        .filter(([, deps]) => deps.length === 0)
        .map(([id]) => id)
}

// ─── Task Resolution ──────────────────────────────────────────────────────────

export function getTaskForNodeType(type: string): string {
    switch (type) {
        case 'text': return 'text-execution'
        case 'uploadImage': return 'upload-image-execution'
        case 'uploadVideo': return 'upload-video-execution'
        case 'llm': return 'llm-execution'
        case 'cropImage': return 'crop-image'
        case 'extractFrame': return 'extract-frame'
        default: throw new Error(`Unknown node type: ${type}`)
    }
}

// ─── Input Resolution ─────────────────────────────────────────────────────────

function extractScalar(rawOutput: any): any {
    if (!rawOutput) return null
    if (typeof rawOutput === 'string') return rawOutput
    if (rawOutput.imageUrl) return rawOutput.imageUrl
    if (rawOutput.frameUrl) return rawOutput.frameUrl
    if (rawOutput.result !== undefined) return rawOutput.result
    return rawOutput
}

function getInput(
    edges: Edge[],
    outputs: OutputMap,
    nodeId: string,
    handle: string,
    fallback?: any
): any {
    const edge = edges.find((e) => e.target === nodeId && e.targetHandle === handle)
    if (!edge) return fallback
    const raw = outputs[edge.source]
    return raw !== undefined ? extractScalar(raw) : fallback
}

export function resolveNodeInputs(node: Node, edges: Edge[], outputs: OutputMap): Record<string, any> {
    const nodeId = node.id

    switch (node.type) {
        case 'llm': {
            const systemPrompt = getInput(edges, outputs, nodeId, 'system_prompt')
            const userMessage = getInput(edges, outputs, nodeId, 'user_message', node.data.value || '')
            const imageEdges = edges.filter(
                (e) => e.target === nodeId &&
                    (e.targetHandle?.startsWith('image_') || e.targetHandle === 'images')
            )
            const images = imageEdges
                .map((e) => extractScalar(outputs[e.source]))
                .filter(Boolean) as string[]
            const model = node.data.model || 'gemini-2.5-flash-lite'
            return { model, systemPrompt, userMessage, images }
        }

        case 'cropImage': {
            return {
                imageUrl: getInput(edges, outputs, nodeId, 'image_url', ''),
                xPercent: Number(getInput(edges, outputs, nodeId, 'x_percent', node.data.x_percent ?? 0)),
                yPercent: Number(getInput(edges, outputs, nodeId, 'y_percent', node.data.y_percent ?? 0)),
                widthPercent: Number(getInput(edges, outputs, nodeId, 'width_percent', node.data.width_percent ?? 100)),
                heightPercent: Number(getInput(edges, outputs, nodeId, 'height_percent', node.data.height_percent ?? 100)),
            }
        }

        case 'extractFrame': {
            return {
                videoUrl: getInput(edges, outputs, nodeId, 'video_url', ''),
                timestamp: String(getInput(edges, outputs, nodeId, 'timestamp', node.data.timestamp ?? '50%')),
            }
        }

        case 'text':
        case 'uploadImage':
        case 'uploadVideo':
            return { value: node.data.value }

        default:
            throw new Error(`Unknown node type: ${node.type} (node ${nodeId})`)
    }
}

// ─── Forward Propagation (Convergence) ────────────────────────────────────────

/**
 * Called by EVERY node task upon completion.
 * Checks downstream children, checks DB to see if their dependencies are fully satisfied,
 * and if so, triggers them identically using batch.triggerAndWait to prevent duplicate triggers.
 */
export async function checkAndTriggerDownstream(
    runId: string,
    nodeId: string, // the node that just finished
    nodes: Node[],
    edges: Edge[],
    depMap: DepMap,
    downstreamMap: DownstreamMap
) {
    const downstreamIds = downstreamMap[nodeId] || []
    if (downstreamIds.length === 0) return

    const tasksToTrigger: any[] = []

    for (const childId of downstreamIds) {
        const requiredDepIds = depMap[childId] || []
        
        // Query the DB to check status of all upstream dependencies for this child
        const siblingExecutions = await prisma.nodeExecution.findMany({
            where: {
                runId,
                nodeId: { in: requiredDepIds }
            }
        })

        // Check if all required deps have a 'completed' status
        const completedDeps = siblingExecutions.filter(ex => ex.status === 'completed')
        
        if (completedDeps.length === requiredDepIds.length) {
            // All deps are completed! We can trigger the child.
            // Assemble the outputs maps from the DB records
            const outputs: OutputMap = {}
            for (const exec of completedDeps) {
                outputs[exec.nodeId] = exec.outputs
            }

            const childNode = nodes.find(n => n.id === childId)!
            const taskId = getTaskForNodeType(childNode.type || 'unknown')
            const inputs = resolveNodeInputs(childNode, edges, outputs)

            const childPayload: NodeExecutionPayload = {
                runId,
                nodeId: childId,
                nodes,
                edges,
                depMap,
                downstreamMap,
                inputs
            }

            tasksToTrigger.push({
                id: taskId,
                payload: childPayload,
                options: {
                    idempotencyKey: `${runId}-${childId}`,
                    idempotencyKeyTTL: '1h',
                }
            })
        }
    }

    if (tasksToTrigger.length > 0) {
        // We do NOT wait here. We trigger asynchronously so this task can finish and exit immediately.
        // Waiting here would lock the worker and defeat the purpose.
        await batch.triggerAndWait(tasksToTrigger)
    }
}

// ─── Node Execution Wrapper ───────────────────────────────────────────────────

/**
 * Standardizes execution across all 6 node task types.
 * Connects the actual work (executeFn) with graph traversal checks and DB upserts.
 */
import { metadata } from '@trigger.dev/sdk/v3'

export async function handleNodeExecution(
    payload: NodeExecutionPayload,
    nodeType: string,
    executeFn: (inputs: any) => Promise<any>
): Promise<any> {
    const { runId, nodeId, nodes, edges, depMap, downstreamMap, inputs } = payload
    const setNodeMeta = (value: any) => metadata.root.set(`node_${nodeId}`, value)

    const run = await prisma.workflowRun.findUnique({ where: { id: runId } })
    if (run?.status === 'cancelled') {
        setNodeMeta({ status: 'cancelled' })
        return null
    }

    setNodeMeta({ status: 'running' })

    const startTime = Date.now()
    let resultOutput: any

    try {
        resultOutput = await executeFn(inputs)
        
        if (resultOutput?.success === false) {
             throw new Error(resultOutput.error || 'Execution failed')
        }

        const elapsed = Date.now() - startTime
        
        await prisma.nodeExecution.upsert({
            where: { runId_nodeId: { runId, nodeId } },
            update: { status: 'completed', outputs: resultOutput, inputs, executionTime: elapsed, completedAt: new Date() },
            create: { runId, nodeId, nodeType, status: 'completed', outputs: resultOutput, inputs, executionTime: elapsed, completedAt: new Date() }
        })

        setNodeMeta({ status: 'completed', result: extractScalar(resultOutput) })

    } catch (error: any) {
        const elapsed = Date.now() - startTime
        const errMsg = error.message || 'Task failed'
        
        await prisma.nodeExecution.upsert({
            where: { runId_nodeId: { runId, nodeId } },
            update: { status: 'failed', error: errMsg, inputs, executionTime: elapsed, completedAt: new Date() },
            create: { runId, nodeId, nodeType, status: 'failed', error: errMsg, inputs, executionTime: elapsed, completedAt: new Date() }
        })

        setNodeMeta({ status: 'failed', error: errMsg })
        throw error
    }

    // Trigger downstream children if their dependencies are fully satisfied
    await checkAndTriggerDownstream(runId, nodeId, nodes, edges, depMap, downstreamMap)

    return resultOutput
}
