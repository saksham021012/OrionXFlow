'use client'

import { useState, useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'

export function useWorkflowExecution() {
    const [loading, setLoading] = useState({ saving: false, executing: false, cancelling: false })
    const { workflowName, workflowId, nodes, edges, setWorkflowId, setNodes, setEdges, setLastRunId } = useWorkflowStore()

    // Helper to update loading state
    const setLoadingState = (key: keyof typeof loading, value: boolean) =>
        setLoading(prev => ({ ...prev, [key]: value }))

    const saveWorkflow = async (id: string | null, data: any) => {
        const isNew = !id || id === 'new'
        const method = isNew ? 'POST' : 'PUT'
        const url = isNew ? '/api/workflows' : `/api/workflows/${id}`

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) throw new Error('Save failed')

        // Return full response for new workflows to get ID
        if (isNew) {
            return await res.json()
        }
        return data
    }

    const handleSave = async () => {
        setLoadingState('saving', true)
        try {
            // Fetch latest state to ensure accuracy
            const { workflowName, nodes, edges, workflowId } = useWorkflowStore.getState()
            const result = await saveWorkflow(workflowId, { name: workflowName, nodes, edges })

            if (!workflowId || workflowId === 'new') setWorkflowId(result.id)
            alert('Workflow saved successfully!')
        } catch (error) {
            console.error(error)
            alert('Failed to save workflow')
        } finally {
            setLoadingState('saving', false)
        }
    }

    const pollForCompletion = useCallback((wId: string, rId: string) => {
        let attempts = 0
        let timeoutId: NodeJS.Timeout

        const poll = async () => {
            try {
                if (attempts++ > 150) {
                    setLoadingState('executing', false)
                    return
                }

                const res = await fetch(`/api/workflows/${wId}`)
                if (!res.ok) {
                    setLoadingState('executing', false)
                    return
                }

                const { runs, nodes, edges } = await res.json()
                const run = runs?.find((r: any) => r.id === rId)

                if (run?.status === 'completed' || run?.status === 'failed' || run?.status === 'cancelled') {
                    setNodes(nodes || [])
                    setEdges(edges || [])
                    setLoadingState('executing', false)
                } else {
                    timeoutId = setTimeout(poll, 2000)
                }
            } catch (e) {
                setLoadingState('executing', false)
            }
        }

        poll()
    }, [setNodes, setEdges])

    const handleRunWorkflow = async () => {
        setLoadingState('executing', true)
        try {
            const { workflowName, nodes, edges, workflowId: currentId } = useWorkflowStore.getState()

            // Save first
            const savedData = await saveWorkflow(currentId, { name: workflowName, nodes, edges })

            // If new, get the ID from response
            const wId = (!currentId || currentId === 'new') ? savedData.id : currentId

            if (!currentId || currentId === 'new') setWorkflowId(wId)

            // Optimistic Update
            setNodes(nodes.map(n => ({ ...n, data: { ...n.data, status: 'running', result: undefined, error: undefined } })))

            // Execute
            const execRes = await fetch(`/api/workflows/${wId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executionType: 'full' }),
            })

            if (!execRes.ok) throw new Error('Execution failed')
            const { runId } = await execRes.json()
            setLastRunId(runId)

            pollForCompletion(wId, runId)
        } catch (error) {
            console.error(error)
            setLoadingState('executing', false)

            // Revert optimistic update on failure
            setNodes(useWorkflowStore.getState().nodes.map(n => ({
                ...n,
                data: { ...n.data, status: n.data.status === 'running' ? 'idle' : n.data.status }
            })))
            alert('Failed to start workflow')
        }
    }

    const handleCancelWorkflow = async () => {
        const { workflowId, nodes } = useWorkflowStore.getState()
        if (!workflowId || workflowId === 'new') return

        setLoadingState('cancelling', true)
        try {
            await fetch(`/api/workflows/${workflowId}/cancel`, { method: 'POST' })
            setLoadingState('executing', false)

            // Optimistic Update
            setNodes(nodes.map(n => ({
                ...n,
                data: {
                    ...n.data,
                    status: n.data.status === 'running' ? 'failed' : n.data.status,
                    error: n.data.status === 'running' ? 'Cancelled' : n.data.error
                }
            })))
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingState('cancelling', false)
        }
    }

    const handleRunSelected = async (nodeIds: string[]) => {
        if (!nodeIds.length) return
        setLoadingState('executing', true)
        try {
            const { workflowName, nodes, edges, workflowId: currentId } = useWorkflowStore.getState()

            // Save first
            const savedData = await saveWorkflow(currentId, { name: workflowName, nodes, edges })

            // If new, get the ID from response
            const wId = (!currentId || currentId === 'new') ? savedData.id : currentId

            if (!currentId || currentId === 'new') setWorkflowId(wId)

            // Optimistic Update: Set selected nodes to running
            setNodes(nodes.map(n =>
                nodeIds.includes(n.id)
                    ? { ...n, data: { ...n.data, status: 'running', result: undefined, error: undefined } }
                    : n
            ))

            // Execute
            const execRes = await fetch(`/api/workflows/${wId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executionType: 'selected', selectedNodeIds: nodeIds }),
            })

            if (!execRes.ok) throw new Error('Execution failed')
            const { runId } = await execRes.json()
            setLastRunId(runId)

            pollForCompletion(wId, runId)
        } catch (error) {
            console.error(error)
            setLoadingState('executing', false)
            alert('Failed to start selective execution')

            // Revert status
            setNodes(useWorkflowStore.getState().nodes.map(n => ({
                ...n,
                data: { ...n.data, status: nodeIds.includes(n.id) && n.data.status === 'running' ? 'idle' : n.data.status }
            })))
        }
    }

    const handleRunSingleNode = async (nodeId: string) => {
        return handleRunSelected([nodeId])
    }

    return {
        saving: loading.saving,
        executing: loading.executing,
        cancelling: loading.cancelling,
        handleSave,
        handleRunWorkflow,
        handleRunSingleNode,
        handleRunSelected,
        handleCancelWorkflow
    }
}
