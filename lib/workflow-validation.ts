import { Connection, Node, Edge } from 'reactflow'
import { NodeData } from '@/store/workflowStore'

/**
 * Type definitions for handle compatibility
 */
export type HandleType =
    | 'system'    // System prompts (purple)
    | 'user'      // User messages/text (green)
    | 'text'      // Text data (green/purple)
    | 'image'     // Image data (cyan)
    | 'video'     // Video data (pink)
    | 'param'     // Parameters/config (orange)
    | 'output'    // Generic output (cyan)
    | 'unknown'   // Fallback

/**
 * Compatibility matrix: defines which handle types can connect to each other
 * true = compatible, false = incompatible
 */
const COMPATIBILITY_MATRIX: Record<HandleType, HandleType[]> = {
    system: ['system', 'user', 'output'],  // System prompts accept text-like inputs
    user: ['user', 'output'],               // User messages accept text-like inputs
    text: ['system', 'user', 'param', 'output'], // Text can go to text inputs
    image: ['image', 'video', 'output'],    // Images accept image and video data (multimodal)
    video: ['video', 'image', 'output'],    // Videos can connect to video inputs OR image inputs (for LLMs)
    param: ['param', 'output'],             // Params accept param data
    output: ['system', 'user', 'image', 'video', 'param', 'text'], // Generic output can go anywhere
    unknown: ['unknown'],                   // Unknown types only connect to unknown
}

/**
 * Extract handle type from handle ID
 */
export function getHandleType(handleId: string): HandleType {
    const id = handleId.toLowerCase()

    if (id.includes('system') || id.includes('prompt')) return 'system'
    if (id.includes('user') || id.includes('message')) return 'user'
    if (id.includes('text')) return 'text'
    if (id.includes('image')) return 'image'
    if (id.includes('video')) return 'video'
    if (id.includes('param') || id.includes('config') || id.includes('percent') || id.includes('timestamp')) return 'param'
    if (id.includes('output')) return 'output'

    return 'unknown'
}

/**
 * Check if two handle types are compatible
 */
export function areHandlesCompatible(sourceType: HandleType, targetType: HandleType): boolean {
    const compatibleTargets = COMPATIBILITY_MATRIX[sourceType]
    return compatibleTargets.includes(targetType)
}

/**
 * Validate if a connection is allowed based on handle types
 * This is the main function used by React Flow's isValidConnection prop
 */
export function isValidConnection(
    connection: Connection,
    nodes: Node<NodeData>[],
    edges: Edge[]
): boolean {
    const { source, target, sourceHandle, targetHandle } = connection

    // Basic validation
    if (!source || !target || !sourceHandle || !targetHandle) {
        return false
    }

    // Prevent self-connections
    if (source === target) {
        return false
    }

    // Check handle type compatibility
    const sourceType = getHandleType(sourceHandle)
    const targetType = getHandleType(targetHandle)

    if (!areHandlesCompatible(sourceType, targetType)) {
        return false
    }

    // Check for cycles (DAG validation)
    if (wouldCreateCycle(connection, edges)) {
        return false
    }

    return true
}

/**
 * Check if adding this connection would create a cycle in the graph
 * Uses depth-first search to detect cycles
 */
export function wouldCreateCycle(connection: Connection, edges: Edge[]): boolean {
    const { source, target } = connection

    // Build adjacency list from existing edges plus the new connection
    const adjacencyList = new Map<string, string[]>()

    // Add existing edges
    edges.forEach(edge => {
        if (!adjacencyList.has(edge.source)) {
            adjacencyList.set(edge.source, [])
        }
        adjacencyList.get(edge.source)!.push(edge.target)
    })

    // Add the proposed new edge
    if (!adjacencyList.has(source!)) {
        adjacencyList.set(source!, [])
    }
    adjacencyList.get(source!)!.push(target!)

    // Check if there's a path from target back to source (which would create a cycle)
    return hasPath(adjacencyList, target!, source!)
}

/**
 * Check if there's a path from start to end using DFS
 */
function hasPath(
    adjacencyList: Map<string, string[]>,
    start: string,
    end: string,
    visited = new Set<string>()
): boolean {
    if (start === end) return true
    if (visited.has(start)) return false

    visited.add(start)
    const neighbors = adjacencyList.get(start) || []

    for (const neighbor of neighbors) {
        if (hasPath(adjacencyList, neighbor, end, visited)) {
            return true
        }
    }

    return false
}

/**
 * Validate the entire workflow graph for cycles
 * Returns true if the graph is a valid DAG (no cycles)
 */
export function validateDAG(nodes: Node<NodeData>[], edges: Edge[]): {
    isValid: boolean
    cycles?: string[][]
} {
    const adjacencyList = new Map<string, string[]>()

    // Build adjacency list
    edges.forEach(edge => {
        if (!adjacencyList.has(edge.source)) {
            adjacencyList.set(edge.source, [])
        }
        adjacencyList.get(edge.source)!.push(edge.target)
    })

    // Detect cycles using DFS
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: string[][] = []

    function dfs(nodeId: string, path: string[] = []): void {
        visited.add(nodeId)
        recursionStack.add(nodeId)
        path.push(nodeId)

        const neighbors = adjacencyList.get(nodeId) || []
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                dfs(neighbor, [...path])
            } else if (recursionStack.has(neighbor)) {
                // Found a cycle
                const cycleStart = path.indexOf(neighbor)
                cycles.push([...path.slice(cycleStart), neighbor])
            }
        }

        recursionStack.delete(nodeId)
    }

    // Check all nodes
    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            dfs(node.id)
        }
    })

    return {
        isValid: cycles.length === 0,
        cycles: cycles.length > 0 ? cycles : undefined,
    }
}
