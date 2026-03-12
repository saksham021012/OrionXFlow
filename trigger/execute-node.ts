import { task, batch, metadata } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'
import { Node, Edge } from 'reactflow'

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeSpec = {
    nodeId: string
    node: Node
    taskId: string
    inputs: Record<string, any>
}

// ─── Scalar extractor ─────────────────────────────────────────────────────────

function extractScalar(rawOutput: any): any {
    if (!rawOutput) return null
    if (typeof rawOutput === 'string') return rawOutput
    if (rawOutput.imageUrl) return rawOutput.imageUrl
    if (rawOutput.frameUrl) return rawOutput.frameUrl
    if (rawOutput.result !== undefined) return rawOutput.result
    return rawOutput
}

// ─── Input resolver ───────────────────────────────────────────────────────────

function getInput(
    edges: Edge[],
    outputs: Map<string, any>,
    nodeId: string,
    handle: string,
    fallback?: any
): any {
    const edge = edges.find((e) => e.target === nodeId && e.targetHandle === handle)
    if (!edge) return fallback
    const raw = outputs.get(edge.source)
    return raw !== undefined ? extractScalar(raw) : fallback
}

// ─── Node spec resolver ───────────────────────────────────────────────────────

function resolveNodeSpec(node: Node, edges: Edge[], outputs: Map<string, any>): NodeSpec {
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
                .map((e) => extractScalar(outputs.get(e.source)))
                .filter(Boolean) as string[]
            const model = node.data.model || 'gemini-2.5-flash-lite'
            return { nodeId, node, taskId: 'llm-execution', inputs: { model, systemPrompt, userMessage, images } }
        }

        case 'cropImage': {
            const inputs = {
                imageUrl: getInput(edges, outputs, nodeId, 'image_url', ''),
                xPercent: Number(getInput(edges, outputs, nodeId, 'x_percent', node.data.x_percent ?? 0)),
                yPercent: Number(getInput(edges, outputs, nodeId, 'y_percent', node.data.y_percent ?? 0)),
                widthPercent: Number(getInput(edges, outputs, nodeId, 'width_percent', node.data.width_percent ?? 100)),
                heightPercent: Number(getInput(edges, outputs, nodeId, 'height_percent', node.data.height_percent ?? 100)),
            }
            return { nodeId, node, taskId: 'crop-image', inputs }
        }

        case 'extractFrame': {
            const inputs = {
                videoUrl: getInput(edges, outputs, nodeId, 'video_url', ''),
                timestamp: String(getInput(edges, outputs, nodeId, 'timestamp', node.data.timestamp ?? '50%')),
            }
            return { nodeId, node, taskId: 'extract-frame', inputs }
        }

        case 'text':
            return { nodeId, node, taskId: 'text-execution', inputs: { value: node.data.value } }

        case 'uploadImage':
            return { nodeId, node, taskId: 'upload-image-execution', inputs: { value: node.data.value } }

        case 'uploadVideo':
            return { nodeId, node, taskId: 'upload-video-execution', inputs: { value: node.data.value } }

        default:
            throw new Error(`Unknown node type: ${node.type} (node ${nodeId})`)
    }
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function isRunCancelled(runId: string): Promise<boolean> {
    const run = await prisma.workflowRun.findUnique({
        where: { id: runId },
        select: { status: true },
    })
    return run?.status === 'cancelled'
}

async function upsertNodeExecution(data: {
    runId: string
    nodeId: string
    nodeType: string
    status: string
    error?: string
    completedAt?: Date
}) {
    // Guard: if trying to set to 'running', we must ensure it's not already terminal
    if (data.status === 'running') {
        const existing = await prisma.nodeExecution.findUnique({
            where: {
                runId_nodeId: {
                    runId: data.runId,
                    nodeId: data.nodeId,
                }
            }
        })
        if (existing && (existing.status === 'failed' || existing.status === 'completed' || existing.status === 'cancelled')) {
            return existing
        }
    }

    try {
        // Atomic upsert for safe concurrent creation
        return await prisma.nodeExecution.upsert({
            where: {
                runId_nodeId: {
                    runId: data.runId,
                    nodeId: data.nodeId,
                }
            },
            update: data,
            create: data,
        })
    } catch (error) {
        console.error("Error upserting node execution:", error)
        throw error
    }
}


// ─── executeNodeTask ──────────────────────────────────────────────────────────

export const executeNodeTask = task({
    id: 'execute-node',
    maxDuration: 300,
    run: async (payload: {
        runId: string
        nodeId: string
        nodes: Node[]
        edges: Edge[]
        allNodeIds: string[]
    }) => {
        const { runId, nodeId, nodes, edges, allNodeIds } = payload

        // 1. Cancellation check (DB-based)
        if (await isRunCancelled(runId)) {
            metadata.root.set(`node_${nodeId}`, { status: 'cancelled' })
            return null
        }

        // 2. Pull upstream deps recursively
        //    Use batchTriggerAndWait — never Promise.all(triggerAndWait)
        const upstreamEdges = edges.filter(
            (e) => e.target === nodeId && allNodeIds.includes(e.source)
        )
        const upstreamOutputs = new Map<string, any>()

        if (upstreamEdges.length > 0) {
            const depResults = await executeNodeTask.batchTriggerAndWait(
                upstreamEdges.map((e) => ({
                    payload: { runId, nodeId: e.source, nodes, edges, allNodeIds },
                    options: {
                        idempotencyKey: `${runId}-${e.source}`,
                        idempotencyKeyTTL: '1h',
                    },
                }))
            )

            for (let i = 0; i < depResults.runs.length; i++) {
                const result = depResults.runs[i]

                if (result.ok) {
                    upstreamOutputs.set(upstreamEdges[i].source, result.output)
                } else {
                    const errMessage = (result as any).error?.message || String((result as any).error) || 'Upstream dependency failed'
                    // Upstream failed — single DB write directly to 'failed'
                    const node = nodes.find((n) => n.id === nodeId)!
                    await upsertNodeExecution({
                        runId,
                        nodeId: node.id,
                        nodeType: node.type || 'unknown',
                        status: 'failed',
                        error: errMessage,
                        completedAt: new Date(),
                    })
                    metadata.root.set(`node_${nodeId}`, {
                        status: 'failed',
                        error: errMessage,
                    })
                    // THROW instead of returning gracefully, so Trigger.dev registers THIS execute-node task as failed
                    // which appropriately stops DOWNSTREAM execution that depends on it.
                    throw new Error(`Upstream dependency ${upstreamEdges[i].source} failed`)
                }
            }
        }

        // 3. Re-check cancellation after deps resolved — catches cancels that
        //    arrived while upstream nodes were running.
        if (await isRunCancelled(runId)) {
            metadata.root.set(`node_${nodeId}`, { status: 'cancelled' })
            return null
        }

        // 4. Resolve spec
        const node = nodes.find((n) => n.id === nodeId)!
        const spec = resolveNodeSpec(node, edges, upstreamOutputs)

        // 5. Upsert DB record as 'running' (returns existing if already terminal/cancelled)
        const exec = await upsertNodeExecution({
            runId,
            nodeId: node.id,
            nodeType: node.type || 'unknown',
            status: 'running',
        })

        // If cancel API already marked this node as failed/cancelled, abort execution
        if (exec.status === 'failed' && exec.error === 'Cancelled') {
            metadata.root.set(`node_${nodeId}`, { status: 'failed', error: 'Cancelled' })
            return null
        }

        metadata.root.set(`node_${nodeId}`, { status: 'running' })

        // 6. Execute child task
        const startTime = Date.now()
        try {
            const batchResult = await batch.triggerAndWait([
                { id: spec.taskId, payload: spec.inputs },
            ])
            const childResult = batchResult.runs[0]
            const elapsed = Date.now() - startTime

            if (childResult.ok) {
                const output = childResult.output
                await prisma.nodeExecution.update({
                    where: { id: exec.id },
                    data: {
                        status: 'completed',
                        outputs: output,
                        inputs: spec.inputs,
                        executionTime: elapsed,
                        completedAt: new Date(),
                    },
                })
                metadata.root.set(`node_${nodeId}`, {
                    status: 'completed',
                    result: extractScalar(output),
                })
                return output
            } else {
                const errMsg =
                    (childResult.error as any)?.message ??
                    String(childResult.error) ??
                    'Task failed'
                await prisma.nodeExecution.update({
                    where: { id: exec.id },
                    data: {
                        status: 'failed',
                        error: errMsg,
                        inputs: spec.inputs,
                        executionTime: elapsed,
                        completedAt: new Date(),
                    },
                })
                metadata.root.set(`node_${nodeId}`, { status: 'failed', error: errMsg })
                throw new Error(errMsg)
            }
        } catch (error: any) {
            const elapsed = Date.now() - startTime
            await prisma.nodeExecution.update({
                where: { id: exec.id },
                data: {
                    status: 'failed',
                    error: error.message,
                    inputs: spec.inputs,
                    executionTime: elapsed,
                    completedAt: new Date(),
                },
            })
            metadata.root.set(`node_${nodeId}`, { status: 'failed', error: error.message })
            throw error
        }
    },
})
