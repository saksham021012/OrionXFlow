import { Node, Edge } from 'reactflow'

export type NodeStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'

export type NodeData = {
    label: string
    type: string
    value?: any
    result?: any
    status?: NodeStatus
    error?: string
    model?: string
    [key: string]: any
}

export type HistorySnapshot = {
    nodes: Node<NodeData>[]
    edges: Edge[]
}
