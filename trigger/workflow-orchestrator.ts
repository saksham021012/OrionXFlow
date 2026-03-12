import { task, metadata } from '@trigger.dev/sdk/v3'
import { prisma } from '@/lib/prisma'
import { Node, Edge } from 'reactflow'
import { executeNodeTask } from './execute-node'

/**
 * Workflow Orchestrator — Pull Model
 *
 * Architecture:
 *   1. workflowOrchestratorTask finds sink nodes (no downstream) and triggers them.
 *   2. Each executeNodeTask PULLS its own upstream deps via batchTriggerAndWait
 *      with idempotency keys — shared deps run exactly once even when triggered
 *      by multiple downstream nodes.
 *   3. Outputs flow through return values, not in-memory maps or extra DB reads.
 *   4. Node status is pushed to the root orchestrator run's metadata so the
 *      client can subscribe via useRealtimeRun with zero polling.
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

// ─── workflowOrchestratorTask ─────────────────────────────────────────────────

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

            // metadata.set() — orchestrator IS the root run the client subscribes to.
            // executeNodeTask children use metadata.root.set() to push back up here.
            for (const nodeId of finalNodesToExecute) {
                metadata.set(`node_${nodeId}`, { status: 'queued' })
            }

            // Sink nodes have no outgoing edges within the execution set.
            // Triggering sinks pulls the entire graph recursively.
            const sinkNodes = finalNodesToExecute.filter(
                (id) => !edges.some(
                    (e) => e.source === id && finalNodesToExecute.includes(e.target)
                )
            )

            await executeNodeTask.batchTriggerAndWait(
                sinkNodes.map((nodeId) => ({
                    payload: { runId, nodeId, nodes, edges, allNodeIds: finalNodesToExecute },
                    options: {
                        idempotencyKey: `${runId}-${nodeId}`,
                        idempotencyKeyTTL: '1h',
                    },
                }))
            )

            // Guard against cancelled run overwriting status
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
            // Results live in NodeExecution records — do NOT write back to workflow.nodes
            // (would cause stale pre-populated results on next workflow open)

        } catch (error: any) {
            await prisma.workflowRun.update({
                where: { id: runId },
                data: { status: 'failed', error: error.message, completedAt: new Date() },
            })
        }
    },
})
