import { task, batch } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'
import { Node, Edge } from 'reactflow'

// Types

type NodeSpec = {
    nodeId: string
    node: Node
    taskId: string
    /** Payload sent to the child task AND stored in nodeExecution.inputs */
    inputs: Record<string, any>
}

// Dependency graph + topological levels

function buildDependencyGraph(edges: Edge[], nodesToExecute: string[]): Map<string, string[]> {
    const deps = new Map<string, string[]>()
    for (const nodeId of nodesToExecute) {
        const incoming = edges.filter((e) => e.target === nodeId && nodesToExecute.includes(e.source)) //incoming edges to node where targer = nodeId and also node is in nodesToExecute
        deps.set(nodeId, incoming.map((e) => e.source)) //set incoming edges to node in deps map
    }
    return deps
}

/** Kahn's algorithm — returns execution levels (each level can run in parallel) */
function buildTopologicalLevels(nodesToExecute: string[], deps: Map<string, string[]>): string[][] {
    const inDegree = new Map<string, number>()
    const dependents = new Map<string, string[]>()

    for (const nodeId of nodesToExecute) {
        inDegree.set(nodeId, deps.get(nodeId)?.length ?? 0) //set indegree
        dependents.set(nodeId, []) //set dependents
    }
    for (const [nodeId, nodeDeps] of deps) {
        for (const dep of nodeDeps) {
            dependents.get(dep)?.push(nodeId) //add dependents
        }
    }

    const levels: string[][] = []
    let queue = nodesToExecute.filter((id) => inDegree.get(id) === 0) //nodes with 0 indegree

    while (queue.length > 0) {
        levels.push([...queue])
        const nextQueue: string[] = []
        for (const nodeId of queue) {
            for (const dependent of dependents.get(nodeId) ?? []) {
                const newDegree = (inDegree.get(dependent) ?? 1) - 1 //decrease in degree by 1 after processing
                inDegree.set(dependent, newDegree) //replace indegree with newDegree
                if (newDegree === 0) nextQueue.push(dependent) //add to queue if indegree is 0
            }
        }
        queue = nextQueue //update queue
    }

    return levels
}

/**
Extracts a scalar value (string URL or text) from a raw task output object.
*/

function extractScalar(rawOutput: any): any {
    if (!rawOutput) return null
    if (typeof rawOutput === 'string') return rawOutput
    if (rawOutput.imageUrl) return rawOutput.imageUrl   // crop-image
    if (rawOutput.frameUrl) return rawOutput.frameUrl   // extract-frame
    if (rawOutput.result !== undefined) return rawOutput.result  // text / upload / llm
    return rawOutput
}

/** Read the resolved scalar from an upstream node's output via a named edge handle */
function getInput(edges: Edge[], outputs: Map<string, any>, nodeId: string, handle: string, fallback?: any): any {
    const edge = edges.find((e) => e.target === nodeId && e.targetHandle === handle)   //find edge where target = nodeId and targetHandle = handle
    if (!edge) return fallback
    const raw = outputs.get(edge.source) //get output from source
    return raw !== undefined ? extractScalar(raw) : fallback //return scalar value
}

/**Convert a graph node into a runnable task specification. 
*/
function resolveNodeSpec(node: Node, edges: Edge[], outputs: Map<string, any>): NodeSpec {

    const nodeId = node.id

    switch (node.type) {
        case 'llm': {
            const systemPrompt = getInput(edges, outputs, nodeId, 'system_prompt')
            const userMessage = getInput(edges, outputs, nodeId, 'user_message', node.data.value || '')

            const imageEdges = edges.filter(
                (e) => e.target === nodeId && (e.targetHandle?.startsWith('image_') || e.targetHandle === 'images')
            )

            const images = imageEdges.map((e) => extractScalar(outputs.get(e.source))).filter(Boolean) as string[]

            const model = node.data.model || 'gemini-2.5-flash-lite'

            const inputs = { model, systemPrompt, userMessage, images }
            return { nodeId, node, taskId: 'llm-execution', inputs }
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

// DB helpers

async function createNodeExecution(runId: string, node: Node) {
    return prisma.nodeExecution.create({
        data: { runId, nodeId: node.id, nodeType: node.type || 'unknown', status: 'queued' },
    })
}

async function isRunCancelled(runId: string): Promise<boolean> {
    const run = await prisma.workflowRun.findUnique({ where: { id: runId }, select: { status: true } })
    return run?.status === 'cancelled'
}

async function determineRunStatus(runId: string): Promise<'completed' | 'failed'> {
    const failed = await prisma.nodeExecution.findFirst({ where: { runId, status: 'failed' } })
    return failed ? 'failed' : 'completed'
}


// orchestrator task

export const workflowOrchestratorTask = task({
    id: 'workflow-orchestrator',
    maxDuration: 3600,
    run: async (payload: {
        runId: string
        nodes: Node[]
        edges: Edge[]
        nodesToExecute: string[]
    }) => {
        const { runId, nodes, edges, nodesToExecute } = payload

        try {
            const workflowRun = await prisma.workflowRun.findUnique({
                where: { id: runId },
                select: { workflowId: true },
            })
            if (!workflowRun) throw new Error('Workflow run not found')

            // Expand nodesToExecute to include all upstream dependencies
            const allNodesToExecute = new Set(nodesToExecute)
            const addDependencies = (nodeId: string) => {
                for (const edge of edges.filter((e) => e.target === nodeId)) {
                    if (!allNodesToExecute.has(edge.source)) {
                        allNodesToExecute.add(edge.source)
                        addDependencies(edge.source)
                    }
                }
            }
            nodesToExecute.forEach(addDependencies)

            const finalNodesToExecute = Array.from(allNodesToExecute)
            const deps = buildDependencyGraph(edges, finalNodesToExecute)
            const levels = buildTopologicalLevels(finalNodesToExecute, deps)
            const outputs = new Map<string, any>()

            console.log(`[Orchestrator] Execution levels:`, levels)

            // Execute level by level. All nodes within a level are parallel via batch.triggerAndWait.
            for (const level of levels) {
                if (await isRunCancelled(runId)) {
                    console.log(`[Orchestrator] Run cancelled, stopping.`)
                    break
                }

                const levelNodes = level.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean)
                const specs = levelNodes.map((n) => resolveNodeSpec(n, edges, outputs))

                // Create DB records for this level before firing tasks
                const execRecords = await Promise.all(specs.map((s) => createNodeExecution(runId, s.node)))
                await Promise.all(
                    execRecords.map((rec) =>
                        prisma.nodeExecution.update({ where: { id: rec.id }, data: { status: 'running' } })
                    )
                )

                const startTime = Date.now()
                const batchResults = await batch.triggerAndWait(
                    specs.map((s) => ({ id: s.taskId, payload: s.inputs }))
                )
                const elapsed = Date.now() - startTime

                await Promise.all(
                    batchResults.runs.map(async (result: { ok: boolean; output?: any; error?: any }, i: number) => {
                        const { nodeId, inputs } = specs[i]
                        const exec = execRecords[i]

                        if (result.ok) {
                            outputs.set(nodeId, result.output)
                            await prisma.nodeExecution.update({
                                where: { id: exec.id },
                                data: {
                                    status: 'completed',
                                    outputs: result.output,
                                    inputs,
                                    executionTime: elapsed,
                                    completedAt: new Date(),
                                },
                            })
                        } else {
                            const errMsg = (result.error as any)?.message ?? String(result.error) ?? 'Task failed'
                            console.error(`[Orchestrator] Node ${nodeId} failed:`, errMsg)
                            await prisma.nodeExecution.update({
                                where: { id: exec.id },
                                data: {
                                    status: 'failed',
                                    error: errMsg,
                                    inputs,
                                    executionTime: elapsed,
                                    completedAt: new Date(),
                                },
                            })
                        }
                    })
                )
            }

            const status = await determineRunStatus(runId)
            await prisma.workflowRun.update({
                where: { id: runId },
                data: { status, completedAt: new Date() },
            })
            console.log(`[Orchestrator] Run status: ${status}`)

            // Write the scalar result back to each node for inline display on the canvas
            const updatedNodes = nodes.map((n) => {
                const rawOutput = outputs.get(n.id)
                if (rawOutput === undefined) return n
                return { ...n, data: { ...n.data, result: extractScalar(rawOutput) } }
            })
            await prisma.workflow.update({
                where: { id: workflowRun.workflowId },
                data: { nodes: updatedNodes as any },
            })
        } catch (error: any) {
            await prisma.workflowRun.update({
                where: { id: runId },
                data: { status: 'failed', error: error.message, completedAt: new Date() },
            })
        }
    },
})
