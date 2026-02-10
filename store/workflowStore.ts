import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow'
import { NodeData, HistorySnapshot } from './workflow.types'
export type { NodeData, HistorySnapshot }
import { createNode, updateNodeData, deleteNode } from './workflow.nodes'
import { takeSnapshot, undo, redo } from './workflow.history'

interface WorkflowState {
    nodes: Node<NodeData>[]
    edges: Edge[]
    selectedNodes: string[]
    workflowId: string | null
    workflowName: string
    lastRunId: string | null

    // History
    past: HistorySnapshot[]
    future: HistorySnapshot[]

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
                set(takeSnapshot(nodes, edges, past))
            },

            undo: () => {
                const { past, future, nodes, edges } = get()
                const result = undo(past, future, nodes, edges)
                if (result) set(result)
            },

            redo: () => {
                const { past, future, nodes, edges } = get()
                const result = redo(past, future, nodes, edges)
                if (result) set(result)
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
                const newNode = createNode(type, position)
                set({ nodes: [...get().nodes, newNode] })
            },

            updateNodeData: (nodeId, data) => {
                set({
                    nodes: updateNodeData(get().nodes, nodeId, data),
                })
            },

            deleteNode: (nodeId) => {
                get().takeSnapshot()
                const { nodes, edges } = get()
                set(deleteNode(nodes, edges, nodeId))
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
            name: 'workflow-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
                workflowId: state.workflowId,
                workflowName: state.workflowName
            }),
        }
    )
)
