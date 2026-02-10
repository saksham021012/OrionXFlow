import { Node, Edge } from 'reactflow'
import { NodeData } from './workflow.types'

/**
 * Creates a new node with a unique ID and initial data.
 */
export const createNode = (type: string, position: { x: number; y: number }): Node<NodeData> => {
    const id = crypto.randomUUID()
    return {
        id,
        type,
        position,
        data: {
            label: type.charAt(0).toUpperCase() + type.slice(1),
            type,
            status: 'idle',
        },
    }
}

/**
 * Updates the data of a specific node within the nodes array.
 */
export const updateNodeData = (
    nodes: Node<NodeData>[],
    nodeId: string,
    data: Partial<NodeData>
): Node<NodeData>[] => {
    return nodes.map((node) =>
        node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
    )
}

/**
 * Deletes a node and all edges connected to it.
 */
export const deleteNode = (
    nodes: Node<NodeData>[],
    edges: Edge[],
    nodeId: string
): { nodes: Node<NodeData>[]; edges: Edge[] } => {
    return {
        nodes: nodes.filter((node) => node.id !== nodeId),
        edges: edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    }
}
