import { task, metadata, batch } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'
import { Node, Edge } from 'reactflow'
import { buildGraphMaps, findSourceNodes, getTaskForNodeType, resolveNodeInputs, NodeExecutionPayload } from './utils/graph-traversal'

/**
 * Workflow Orchestrator — Push Model (Direct Dispatch)
 *
 * Architecture:
 *   1. workflowOrchestratorTask resolves the full execution set, builds
 *      dependency maps, and identifies source nodes (in-degree = 0).
 *   2. All source nodes are triggered in parallel DIRECTLY to their actual task 
 *      (e.g., text-execution) via batch.triggerAndWait. execute-node is deleted.
 *   3. Each node task receives its inputs. Upon completion, it checks the DB 
 *      to see if its downstream children have ALL upstream dependencies satisfied.
 *   4. If yes, it triggers the downstream child. Execution propagates forward 
 *      through the graph recursively, avoiding 4-deep task nesting.
 */

async function determineRunStatus(runId: string): Promise<'completed' | 'failed' | 'partial'> {
    const [failed, total] = await Promise.all([
        prisma.nodeExecution.count({ where: { runId, status: 'failed' } }),
        prisma.nodeExecution.count({ where: { runId } }),
    ])
    if (failed === 0) return 'completed'
    if (failed === total) return 'failed'
    return 'partial'
}

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

            const executionSet = new Set(nodesToExecute)
            const addDependencies = (nodeId: string) => {
                for (const edge of edges.filter((e) => e.target === nodeId)) {
                    if (!executionSet.has(edge.source)) {
                        executionSet.add(edge.source)
                        addDependencies(edge.source)
                    }
                }
            }
            nodesToExecute.forEach(addDependencies)

            const { depMap, downstreamMap } = buildGraphMaps(nodes, edges, executionSet)

            for (const nodeId of executionSet) {
                metadata.set(`node_${nodeId}`, { status: 'queued' })
            }

            const sourceNodeIds = findSourceNodes(depMap)

            // Trigger ALL source nodes in parallel via batch.triggerAndWait using direct task IDs.
            // Sinks will trigger downstream recursively upon completion.
            const tasksToTrigger: any[] = sourceNodeIds.map((nodeId) => {
                const node = nodes.find(n => n.id === nodeId)!
                const taskId = getTaskForNodeType(node.type || 'unknown')
                
                // Source nodes have no upstream outputs, pass empty {}
                const inputs = resolveNodeInputs(node, edges, {})
                
                const taskPayload: NodeExecutionPayload = {
                    runId,
                    nodeId,
                    nodes,
                    edges,
                    depMap,
                    downstreamMap,
                    inputs
                }

                return {
                    id: taskId,
                    payload: taskPayload,
                    options: {
                        idempotencyKey: `${runId}-${nodeId}`,
                        idempotencyKeyTTL: '1h',
                    }
                }
            })

            if (tasksToTrigger.length > 0) {
                await batch.triggerAndWait(tasksToTrigger)
            }

            const currentRun = await prisma.workflowRun.findUnique({
                where: { id: runId },
                select: { status: true },
            })
            if (currentRun?.status === 'cancelled') return

            const status = await determineRunStatus(runId)
            await prisma.workflowRun.update({
                where: { id: runId },
                data: { status, completedAt: new Date() },
            })

        } catch (error: any) {
            const currentRun = await prisma.workflowRun.findUnique({
                where: { id: runId },
                select: { status: true },
            })
            if (currentRun?.status === 'cancelled') return

            await prisma.workflowRun.update({
                where: { id: runId },
                data: { status: 'failed', error: error.message, completedAt: new Date() },
            })
        }
    },
})
