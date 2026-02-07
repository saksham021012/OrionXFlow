import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow'

export type NodeData = {
    label: string
    type: string
    value?: any
    result?: any
    status?: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'
    error?: string
    model?: string
    [key: string]: any
}

interface WorkflowState {
    nodes: Node<NodeData>[]
    edges: Edge[]
    selectedNodes: string[]
    workflowId: string | null
    workflowName: string
    lastRunId: string | null

    // History
    past: { nodes: Node<NodeData>[]; edges: Edge[] }[]
    future: { nodes: Node<NodeData>[]; edges: Edge[] }[]

    // Actions
    setNodes: (nodes: Node<NodeData>[]) => void
    setEdges: (edges: Edge[]) => void
    onNodesChange: (changes: NodeChange[]) => void
    onEdgesChange: (changes: EdgeChange[]) => void
    onConnect: (connection: Connection) => void
    addNode: (type: string, position: { x: number; y: number }) => void
    updateNodeData: (nodeId: string, data: Partial<NodeData>) => void
    deleteNode: (nodeId: string) => void
    setSelectedNodes: (nodeIds: string[]) => void
    setWorkflowId: (id: string | null) => void
    setWorkflowName: (name: string) => void
    setLastRunId: (id: string | null) => void
    resetWorkflow: () => void

    // History Actions
    takeSnapshot: () => void
    undo: () => void
    redo: () => void
}

let nodeIdCounter = 0

export const useWorkflowStore = create<WorkflowState>()(
    persist(
        (set, get) => ({
            nodes: [],
            edges: [],
            selectedNodes: [],
            workflowId: null,
            workflowName: 'Untitled Workflow',
            lastRunId: null,
            past: [],
            future: [],

            setNodes: (nodes) => set({ nodes }),

            setEdges: (edges) => set({ edges }),

            setLastRunId: (id) => set({ lastRunId: id }),

            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                })
            },

            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                })
            },

            takeSnapshot: () => {
                const { nodes, edges, past } = get()
                // Limit history to 50 steps
                const newPast = [...past, { nodes: [...nodes], edges: [...edges] }].slice(-50)
                set({ past: newPast, future: [] })
            },

            undo: () => {
                const { past, future, nodes, edges } = get()
                if (past.length === 0) return

                const previous = past[past.length - 1]
                const newPast = past.slice(0, past.length - 1)

                set({
                    past: newPast,
                    future: [{ nodes: [...nodes], edges: [...edges] }, ...future],
                    nodes: previous.nodes,
                    edges: previous.edges,
                })
            },

            redo: () => {
                const { past, future, nodes, edges } = get()
                if (future.length === 0) return

                const next = future[0]
                const newFuture = future.slice(1)

                set({
                    past: [...past, { nodes: [...nodes], edges: [...edges] }],
                    future: newFuture,
                    nodes: next.nodes,
                    edges: next.edges,
                })
            },

            onConnect: (connection) => {
                get().takeSnapshot()
                const stroke = '#c084fc' // Uniform Indigo/Purple

                set({
                    edges: addEdge({
                        ...connection,
                        animated: true,
                        style: { stroke, strokeWidth: 2 }
                    }, get().edges),
                })
            },

            addNode: (type, position) => {
                get().takeSnapshot()
                const id = `node-${++nodeIdCounter}`
                const newNode: Node<NodeData> = {
                    id,
                    type,
                    position,
                    data: {
                        label: type.charAt(0).toUpperCase() + type.slice(1),
                        type,
                        status: 'idle',
                    },
                }
                set({ nodes: [...get().nodes, newNode] })
            },

            updateNodeData: (nodeId, data) => {
                set({
                    nodes: get().nodes.map((node) =>
                        node.id === nodeId
                            ? { ...node, data: { ...node.data, ...data } }
                            : node
                    ),
                })
            },

            deleteNode: (nodeId) => {
                get().takeSnapshot()
                set({
                    nodes: get().nodes.filter((node) => node.id !== nodeId),
                    edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
                })
            },

            setSelectedNodes: (nodeIds) => {
                const current = get().selectedNodes
                if (
                    nodeIds.length === current.length &&
                    nodeIds.every((id, index) => id === current[index])
                ) {
                    return
                }
                set({ selectedNodes: nodeIds })
            },

            setWorkflowId: (id) => set({ workflowId: id }),

            setWorkflowName: (name) => set({ workflowName: name }),

            resetWorkflow: () => set({
                nodes: [],
                edges: [],
                selectedNodes: [],
                workflowId: null,
                workflowName: 'Untitled Workflow',
                past: [],
                future: [],
            }),
        }),
        {
            name: 'workflow-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
                workflowId: state.workflowId,
                workflowName: state.workflowName
            }),
        }
    )
)
