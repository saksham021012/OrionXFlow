import { task, tasks } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { Node, Edge } from "reactflow";
import { executeNodeByType } from "@/lib/workflow-execution/node-executors";

// Build dependency graph from edges
function buildDependencyGraph(
    edges: Edge[],
    nodesToExecute: string[]
): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();

    for (const nodeId of nodesToExecute) {
        const incomingEdges = edges.filter((e) => e.target === nodeId);
        dependencies.set(nodeId, incomingEdges.map((e) => e.source));
    }

    return dependencies;
}

// Check if workflow run was cancelled
async function isRunCancelled(runId: string): Promise<boolean> {
    const run = await prisma.workflowRun.findUnique({ where: { id: runId } });
    return run?.status === "cancelled";
}

// Create node execution record
async function createNodeExecution(runId: string, node: Node) {
    return await prisma.nodeExecution.create({
        data: {
            runId,
            nodeId: node.id,
            nodeType: node.type || "unknown",
            status: "running",
        },
    });
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
            status: "completed",
            outputs: result,
            inputs: inputs,
            executionTime,
            completedAt: new Date(),
        },
    });
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
            status: "failed",
            error,
            inputs: inputs,
            executionTime,
            completedAt: new Date(),
        },
    });
}

// Execute a single node with dependencies
async function executeNode(
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
        return nodePromises.get(nodeId)!;
    }

    const promise = (async () => {
        if (!nodesToExecute.includes(nodeId)) return;

        // Wait for dependencies
        const deps = dependencies.get(nodeId) || [];
        await Promise.all(
            deps.map((dep) =>
                executeNode(
                    dep,
                    runId,
                    nodes,
                    edges,
                    nodesToExecute,
                    dependencies,
                    outputs,
                    nodePromises
                )
            )
        );

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        // Check for cancellation
        if (await isRunCancelled(runId)) {
            console.log(`[DEBUG] Run ${runId} was cancelled. Skipping node ${nodeId}`);
            return;
        }

        const startTime = Date.now();
        let nodeExecution = await createNodeExecution(runId, node);
        let capturedInputs: any = null;

        try {
            // In the Trigger.dev environment, executeNodeByType will trigger other tasks
            const executionResult = await executeNodeByType(node, edges, outputs, runId);
            const { result, inputs } = executionResult;
            capturedInputs = inputs;

            if (await isRunCancelled(runId)) {
                throw new Error("Workflow run cancelled");
            }

            outputs.set(nodeId, result);
            await completeNodeExecution(
                nodeExecution.id,
                result,
                inputs,
                Date.now() - startTime
            );
        } catch (error: any) {
            await failNodeExecution(
                nodeExecution.id,
                error.message,
                capturedInputs,
                Date.now() - startTime
            );
            throw error;
        }
    })();

    nodePromises.set(nodeId, promise);
    return promise;
}

// Update workflow nodes with execution results
async function updateWorkflowNodes(
    runId: string,
    nodes: Node[],
    outputs: Map<string, any>
) {
    const updatedNodes = nodes.map((node) => {
        const result = outputs.get(node.id);
        if (result !== undefined) {
            return { ...node, data: { ...node.data, result } };
        }
        return node;
    });

    const workflowRun = await prisma.workflowRun.findUnique({
        where: { id: runId },
    });
    if (workflowRun) {
        await prisma.workflow.update({
            where: { id: workflowRun.workflowId },
            data: { nodes: updatedNodes as any },
        });
        console.log("Updated workflow nodes with results");
    }
}

// Determine final run status
async function determineRunStatus(
    runId: string
): Promise<"completed" | "failed"> {
    const failedNode = await prisma.nodeExecution.findFirst({
        where: { runId, status: "failed" },
    });
    return failedNode ? "failed" : "completed";
}

export const workflowOrchestrator = task({
    id: "workflow-orchestrator",
    run: async (payload: {
        runId: string;
        nodes: Node[];
        edges: Edge[];
        nodesToExecute: string[];
    }) => {
        const { runId, nodes, edges, nodesToExecute } = payload;

        try {
            // Resolve dependencies for all explicitly requested nodes
            const allNodesToExecute = new Set(nodesToExecute);
            const addDependencies = (nodeId: string) => {
                const incomingEdges = edges.filter((e) => e.target === nodeId);
                for (const edge of incomingEdges) {
                    if (!allNodesToExecute.has(edge.source)) {
                        allNodesToExecute.add(edge.source);
                        addDependencies(edge.source);
                    }
                }
            };
            nodesToExecute.forEach((nodeId) => addDependencies(nodeId));

            const finalNodesToExecute = Array.from(allNodesToExecute);
            const dependencies = buildDependencyGraph(edges, finalNodesToExecute);
            const outputs = new Map<string, any>();
            const nodePromises = new Map<string, Promise<void>>();

            // Execute all nodes
            await Promise.allSettled(
                finalNodesToExecute.map((nodeId) =>
                    executeNode(
                        nodeId,
                        runId,
                        nodes,
                        edges,
                        finalNodesToExecute,
                        dependencies,
                        outputs,
                        nodePromises
                    )
                )
            );

            // Update workflow with results
            await updateWorkflowNodes(runId, nodes, outputs);

            // Determine and update final status
            const status = await determineRunStatus(runId);
            await prisma.workflowRun.update({
                where: { id: runId },
                data: { status, completedAt: new Date() },
            });

            return { success: true };
        } catch (error: any) {
            const isCancelled = error.message === "Workflow run cancelled";
            await prisma.workflowRun.update({
                where: { id: runId },
                data: {
                    status: isCancelled ? "cancelled" : "failed",
                    error: isCancelled ? undefined : error.message,
                    completedAt: new Date(),
                },
            });
            return { success: false, error: error.message };
        }
    },
});
