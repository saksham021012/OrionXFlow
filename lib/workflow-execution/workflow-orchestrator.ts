import { prisma } from '@/lib/prisma'
import { Node, Edge } from 'reactflow'
import { executeNodeByType } from './node-executors'

// Build dependency graph from edges
function buildDependencyGraph(
    edges: Edge[],
    nodesToExecute: string[]
): Map<string, string[]> {
    const dependencies = new Map<string, string[]>()

    for (const nodeId of nodesToExecute) {
        const incomingEdges = edges.filter((e) => e.target === nodeId)
        dependencies.set(nodeId, incomingEdges.map((e) => e.source))
    }

    return dependencies
}

// Check if workflow run was cancelled
async function isRunCancelled(runId: string): Promise<boolean> {
    const run = await prisma.workflowRun.findUnique({ where: { id: runId } })
    return run?.status === 'cancelled'
}

// Create node execution record
async function createNodeExecution(runId: string, node: Node) {
    return await prisma.nodeExecution.create({
        data: {
            runId,
            nodeId: node.id,
            nodeType: node.type || 'unknown',
            status: 'running',
        },
    })
}

// Update node execution on success
async function completeNodeExecution(
    executionId: string,
    result: any,
    inputs: any,
    executionTime: number
) {
    await prisma.nodeExecution.update({
        where: { id: executionId },
        data: {
            status: 'completed',
            outputs: result,
            inputs: inputs,
            executionTime,
            completedAt: new Date(),
        },
    })
}

// Update node execution on failure
async function failNodeExecution(
    executionId: string,
    error: string,
    inputs: any,
    executionTime: number
) {
    await prisma.nodeExecution.update({
        where: { id: executionId },
        data: {
            status: 'failed',
            error,
            inputs: inputs,
            executionTime,
            completedAt: new Date(),
        },
    })
}

// Execute a single node with dependencies
export async function executeNode(
    nodeId: string,
    runId: string,
    nodes: Node[],
    edges: Edge[],
    nodesToExecute: string[],
    dependencies: Map<string, string[]>,
    outputs: Map<string, any>,
    nodePromises: Map<string, Promise<void>>
): Promise<void> {
    // Return existing promise if already executing
    if (nodePromises.has(nodeId)) {
        return nodePromises.get(nodeId)!
    }

    const promise = (async () => {
        if (!nodesToExecute.includes(nodeId)) return

        const node = nodes.find((n) => n.id === nodeId)
        if (!node) return

        // Create node execution record IMMEDIATELY so it shows up in history
        let nodeExecution = await createNodeExecution(runId, node)
        let capturedInputs: any = null
        const startTime = Date.now()

        try {
            // Wait for dependencies
            const deps = dependencies.get(nodeId) || []
            try {
                await Promise.all(deps.map((dep) =>
                    executeNode(dep, runId, nodes, edges, nodesToExecute, dependencies, outputs, nodePromises)
                ))
            } catch (depError: any) {
                // If dependencies fail, this node is effectively failed/skipped
                throw new Error(`Dependency failed: ${depError.message}`)
            }

            // Check for cancellation
            if (await isRunCancelled(runId)) {
                console.log(`[DEBUG] Run ${runId} was cancelled. Skipping node ${nodeId}`)
                throw new Error('Workflow run cancelled')
            }

            const executionResult = await executeNodeByType(node, edges, outputs, runId)
            const { result, inputs } = executionResult
            capturedInputs = inputs

            if (await isRunCancelled(runId)) {
                throw new Error('Workflow run cancelled')
            }

            outputs.set(nodeId, result)
            await completeNodeExecution(nodeExecution.id, result, inputs, Date.now() - startTime)
        } catch (error: any) {
            const isCancelled = error.message === 'Workflow run cancelled'
            if (isCancelled) {
                await prisma.nodeExecution.update({
                    where: { id: nodeExecution.id },
                    data: {
                        status: 'failed',
                        error: 'Cancelled',
                        completedAt: new Date(),
                    },
                })
            } else {
                await failNodeExecution(nodeExecution.id, error.message, capturedInputs, Date.now() - startTime)
            }
            throw error // Re-throw to propagate to downstream
        }
    })()

    nodePromises.set(nodeId, promise)
    return promise
}

// Update workflow nodes with execution results
async function updateWorkflowNodes(
    workflowId: string,
    nodes: Node[],
    outputs: Map<string, any>
) {
    const updatedNodes = nodes.map((node) => {
        const result = outputs.get(node.id)
        if (result !== undefined) {
            return { ...node, data: { ...node.data, result } }
        }
        return node
    })

    await prisma.workflow.update({
        where: { id: workflowId },
        data: { nodes: updatedNodes as any },
    })
    console.log('Updated workflow nodes with results')
}

// Determine final run status
async function determineRunStatus(runId: string): Promise<'completed' | 'failed'> {
    const failedNode = await prisma.nodeExecution.findFirst({
        where: { runId, status: 'failed' },
    })
    return failedNode ? 'failed' : 'completed'
}

// Main workflow execution orchestrator
export async function executeWorkflow(
    runId: string,
    nodes: Node[],
    edges: Edge[],
    nodesToExecute: string[]
) {
    try {
        // Fetch workflowId once at the start to avoid redundant queries later
        const workflowRun = await prisma.workflowRun.findUnique({
            where: { id: runId },
            select: { workflowId: true }
        })

        if (!workflowRun) {
            throw new Error('Workflow run not found')
        }

        // If specific nodes are selected, we must also execute their upstream dependencies
        // to ensure they have the data they need.
        const allNodesToExecute = new Set(nodesToExecute)

        // Helper to recursively find dependencies
        const addDependencies = (nodeId: string) => {
            const incomingEdges = edges.filter(e => e.target === nodeId)
            for (const edge of incomingEdges) {
                if (!allNodesToExecute.has(edge.source)) {
                    allNodesToExecute.add(edge.source)
                    addDependencies(edge.source)
                }
            }
        }

        // Resolve dependencies for all explicitly requested nodes
        nodesToExecute.forEach(nodeId => addDependencies(nodeId))

        // Convert back to array for execution
        const finalNodesToExecute = Array.from(allNodesToExecute)
        console.log(`[DEBUG] Executing nodes (including dependencies):`, finalNodesToExecute)

        const dependencies = buildDependencyGraph(edges, finalNodesToExecute)
        const outputs = new Map<string, any>()
        const nodePromises = new Map<string, Promise<void>>()

        // Execute all nodes (use allSettled to ensure all branches attempt to run)
        await Promise.allSettled(
            finalNodesToExecute.map((nodeId) =>
                executeNode(nodeId, runId, nodes, edges, finalNodesToExecute, dependencies, outputs, nodePromises)
            )
        )

        console.log(`[DEBUG] All nodes finished executing. Updating run status...`)

        // Immediately update run status (before updating workflow nodes)
        // This ensures the history sidebar shows the correct status ASAP
        const status = await determineRunStatus(runId)
        await prisma.workflowRun.update({
            where: { id: runId },
            data: { status, completedAt: new Date() },
        })
        console.log(`[DEBUG] Run status updated to: ${status}`)

        // Update workflow nodes with results (non-blocking for status visibility)
        await updateWorkflowNodes(workflowRun.workflowId, nodes, outputs)
    } catch (error: any) {
        const isCancelled = error.message === 'Workflow run cancelled'

        await prisma.workflowRun.update({
            where: { id: runId },
            data: {
                status: isCancelled ? 'cancelled' : 'failed',
                error: isCancelled ? undefined : error.message,
                completedAt: new Date(),
            },
        })
    }
}
