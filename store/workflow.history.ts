import { Node, Edge } from 'reactflow'
import { NodeData, HistorySnapshot } from './workflow.types'

/**
 * Creates a new history snapshot and limits the history size to 50 entries.
 */
export const takeSnapshot = (
    nodes: Node<NodeData>[],
    edges: Edge[],
    past: HistorySnapshot[]
): { past: HistorySnapshot[]; future: HistorySnapshot[] } => {
    const newPast = [...past, { nodes: [...nodes], edges: [...edges] }].slice(-50)
    return {
        past: newPast,
        future: [],
    }
}

/**
 * Performs an undo operation and returns the new state.
 */
export const undo = (
    past: HistorySnapshot[],
    future: HistorySnapshot[],
    currentNodes: Node<NodeData>[],
    currentEdges: Edge[]
): {
    past: HistorySnapshot[]
    future: HistorySnapshot[]
    nodes: Node<NodeData>[]
    edges: Edge[]
} | null => {
    if (past.length === 0) return null

    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    const newFuture = [{ nodes: [...currentNodes], edges: [...currentEdges] }, ...future]

    return {
        past: newPast,
        future: newFuture,
        nodes: previous.nodes,
        edges: previous.edges,
    }
}

/**
 * Performs a redo operation and returns the new state.
 */
export const redo = (
    past: HistorySnapshot[],
    future: HistorySnapshot[],
    currentNodes: Node<NodeData>[],
    currentEdges: Edge[]
): {
    past: HistorySnapshot[]
    future: HistorySnapshot[]
    nodes: Node<NodeData>[]
    edges: Edge[]
} | null => {
    if (future.length === 0) return null

    const next = future[0]
    const newFuture = future.slice(1)
    const newPast = [...past, { nodes: [...currentNodes], edges: [...currentEdges] }]

    return {
        past: newPast,
        future: newFuture,
        nodes: next.nodes,
        edges: next.edges,
    }
}
