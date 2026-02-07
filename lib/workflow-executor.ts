import { Node, Edge } from 'reactflow'

export interface ExecutionNode {
    id: string
    type: string
    data: any
    dependencies: string[] // IDs of nodes this depends on
    dependents: string[] // IDs of nodes that depend on this
    level: number // Execution level (0 = no dependencies)
}

export interface ExecutionGraph {
    nodes: Map<string, ExecutionNode>
    levels: ExecutionNode[][] // Nodes grouped by execution level
    branches: ExecutionNode[][] // Independent parallel branches
}

/**
 * Build execution graph from React Flow nodes and edges
 */
export function buildExecutionGraph(nodes: Node[], edges: Edge[]): ExecutionGraph {
    const execNodes = new Map<string, ExecutionNode>()

    // Initialize execution nodes
    nodes.forEach((node) => {
        execNodes.set(node.id, {
            id: node.id,
            type: node.type || 'unknown',
            data: node.data,
            dependencies: [],
            dependents: [],
            level: 0,
        })
    })

    // Build dependency relationships
    edges.forEach((edge) => {
        const sourceNode = execNodes.get(edge.source)
        const targetNode = execNodes.get(edge.target)

        if (sourceNode && targetNode) {
            targetNode.dependencies.push(edge.source)
            sourceNode.dependents.push(edge.target)
        }
    })

    // Calculate execution levels using topological sort
    const levels = calculateExecutionLevels(execNodes)

    // Detect independent branches
    const branches = detectIndependentBranches(execNodes, levels)

    return {
        nodes: execNodes,
        levels,
        branches,
    }
}

/**
 * Calculate execution levels using topological sort (Kahn's algorithm)
 */
function calculateExecutionLevels(
    nodes: Map<string, ExecutionNode>
): ExecutionNode[][] {
    const levels: ExecutionNode[][] = []
    const inDegree = new Map<string, number>()
    const queue: ExecutionNode[] = []

    // Calculate in-degree for each node
    nodes.forEach((node) => {
        inDegree.set(node.id, node.dependencies.length)
        if (node.dependencies.length === 0) {
            node.level = 0
            queue.push(node)
        }
    })

    // Process nodes level by level
    let currentLevel = 0
    while (queue.length > 0) {
        const levelSize = queue.length
        const currentLevelNodes: ExecutionNode[] = []

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!
            currentLevelNodes.push(node)

            // Process dependents
            node.dependents.forEach((depId) => {
                const depNode = nodes.get(depId)
                if (depNode) {
                    const newInDegree = (inDegree.get(depId) || 0) - 1
                    inDegree.set(depId, newInDegree)

                    if (newInDegree === 0) {
                        depNode.level = currentLevel + 1
                        queue.push(depNode)
                    }
                }
            })
        }

        if (currentLevelNodes.length > 0) {
            levels.push(currentLevelNodes)
            currentLevel++
        }
    }

    // Check for cycles
    const processedNodes = levels.flat().length
    if (processedNodes !== nodes.size) {
        throw new Error('Workflow contains cycles - DAG validation failed')
    }

    return levels
}

/**
 * Detect independent branches that can run in parallel
 */
function detectIndependentBranches(
    nodes: Map<string, ExecutionNode>,
    levels: ExecutionNode[][]
): ExecutionNode[][] {
    const branches: ExecutionNode[][] = []

    // For each level, group nodes into independent branches
    levels.forEach((levelNodes) => {
        if (levelNodes.length <= 1) {
            // Single node, not a branch point
            return
        }

        // Check if nodes at this level are independent
        const independentGroups = groupIndependentNodes(levelNodes, nodes)

        if (independentGroups.length > 1) {
            branches.push(...independentGroups)
        }
    })

    return branches
}

/**
 * Group nodes that have no shared dependencies or dependents
 */
function groupIndependentNodes(
    levelNodes: ExecutionNode[],
    allNodes: Map<string, ExecutionNode>
): ExecutionNode[][] {
    const groups: ExecutionNode[][] = []
    const visited = new Set<string>()

    levelNodes.forEach((node) => {
        if (visited.has(node.id)) return

        const group: ExecutionNode[] = [node]
        visited.add(node.id)

        // Find all nodes in the same branch
        const relatedNodes = findRelatedNodes(node, allNodes)
        relatedNodes.forEach((relatedNode) => {
            if (!visited.has(relatedNode.id) && levelNodes.includes(relatedNode)) {
                group.push(relatedNode)
                visited.add(relatedNode.id)
            }
        })

        groups.push(group)
    })

    return groups
}

/**
 * Find all nodes related to a given node (upstream and downstream)
 */
function findRelatedNodes(
    node: ExecutionNode,
    allNodes: Map<string, ExecutionNode>
): ExecutionNode[] {
    const related = new Set<ExecutionNode>()
    const queue = [node]
    const visited = new Set<string>([node.id])

    while (queue.length > 0) {
        const current = queue.shift()!

        // Add upstream dependencies
        current.dependencies.forEach((depId) => {
            if (!visited.has(depId)) {
                const depNode = allNodes.get(depId)
                if (depNode) {
                    related.add(depNode)
                    visited.add(depId)
                    queue.push(depNode)
                }
            }
        })

        // Add downstream dependents
        current.dependents.forEach((depId) => {
            if (!visited.has(depId)) {
                const depNode = allNodes.get(depId)
                if (depNode) {
                    related.add(depNode)
                    visited.add(depId)
                    queue.push(depNode)
                }
            }
        })
    }

    return Array.from(related)
}

/**
 * Get nodes that can be executed in parallel at a given level
 */
export function getParallelExecutableNodes(
    graph: ExecutionGraph,
    level: number
): ExecutionNode[] {
    if (level >= graph.levels.length) {
        return []
    }
    return graph.levels[level]
}

/**
 * Check if a node's dependencies are satisfied
 */
export function areDependenciesSatisfied(
    node: ExecutionNode,
    completedNodeIds: Set<string>
): boolean {
    return node.dependencies.every((depId) => completedNodeIds.has(depId))
}

/**
 * Get execution order for the entire workflow
 */
export function getExecutionOrder(graph: ExecutionGraph): string[] {
    return graph.levels.flat().map((node) => node.id)
}
