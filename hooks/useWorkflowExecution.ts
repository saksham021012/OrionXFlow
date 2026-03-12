'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkflowStore } from '@/store/workflowStore'

export function useWorkflowExecution() {
    const router = useRouter()
    const [loading, setLoading] = useState({ saving: false, executing: false, cancelling: false })
    const {
        setWorkflowId, setNodes, setEdges, setLastRunId,
        setTriggerRunId, setPublicAccessToken,
        lastRunCompleted, setLastRunCompleted, runs, setRuns,
        updateRunStatus,
    } = useWorkflowStore()

    // Helper to update loading state
    const setLoadingState = (key: keyof typeof loading, value: boolean) =>
        setLoading(prev => ({ ...prev, [key]: value }))

    // Clear executing state when realtime hook signals completion.
    useEffect(() => {
        if (lastRunCompleted) {
            setLoadingState('executing', false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastRunCompleted])

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

        if (isNew) {
            return await res.json()
        }
        return data
    }

    const handleSave = async () => {
        setLoadingState('saving', true)
        try {
            const { workflowName, nodes, edges, workflowId } = useWorkflowStore.getState()
            const result = await saveWorkflow(workflowId, { name: workflowName, nodes, edges })

            if (!workflowId || workflowId === 'new') {
                setWorkflowId(result.id)
                router.replace(`/workflow/${result.id}`)
            }
            alert('Workflow saved successfully!')
        } catch (error) {
            console.error(error)
            alert('Failed to save workflow')
        } finally {
            setLoadingState('saving', false)
        }
    }

    const handleRunWorkflow = async () => {
        setLoadingState('executing', true)
        try {
            const { workflowName, nodes, edges, workflowId: currentId } = useWorkflowStore.getState()

            // Save first
            const savedData = await saveWorkflow(currentId, { name: workflowName, nodes, edges })
            const wId = (!currentId || currentId === 'new') ? savedData.id : currentId
            if (!currentId || currentId === 'new') setWorkflowId(wId)

            // Optimistic update: all nodes get reset to queued for a full run
            setNodes(useWorkflowStore.getState().nodes.map(n => ({
                ...n,
                data: { ...n.data, status: 'queued', result: undefined, error: undefined }
            })))

            // Execute
            const execRes = await fetch(`/api/workflows/${wId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executionType: 'full' }),
            })

            if (!execRes.ok) throw new Error('Execution failed')

            const execData = await execRes.json()
            const { runId, triggerRunId, publicAccessToken, run } = execData
            const currentRuns = useWorkflowStore.getState().runs
            setRuns([run, ...currentRuns])
            setLastRunId(runId)
            setTriggerRunId(triggerRunId)
            setPublicAccessToken(publicAccessToken)
            // executing stays true — cleared by lastRunCompleted effect above
        } catch (error) {
            console.error(error)
            setLoadingState('executing', false)
            setNodes(useWorkflowStore.getState().nodes.map(n => ({
                ...n,
                data: { ...n.data, status: n.data.status === 'running' ? 'idle' : n.data.status }
            })))
            alert('Failed to start workflow')
        }
    }

    const handleCancelWorkflow = async () => {
        const { workflowId, nodes, lastRunId } = useWorkflowStore.getState()
        if (!workflowId || workflowId === 'new') return

        setLoadingState('cancelling', true)
        try {
            await fetch(`/api/workflows/${workflowId}/cancel`, { method: 'POST' })
            setLoadingState('executing', false)

            // Kill the WebSocket subscription — the CANCELED event won't fire after this,
            // so we must handle all cleanup here rather than relying on useWorkflowRealtimeStatus.
            setTriggerRunId(null)
            setPublicAccessToken(null)

            // Update nodes: both 'queued' (never started) and 'running' nodes are cancelled.
            // 'completed' and 'failed' nodes keep their terminal status.
            setNodes(nodes.map(n => ({
                ...n,
                data: {
                    ...n.data,
                    status: (n.data.status === 'running' || n.data.status === 'queued')
                        ? 'failed'
                        : n.data.status,
                    error: (n.data.status === 'running' || n.data.status === 'queued')
                        ? 'Cancelled'
                        : n.data.error,
                }
            })))

            // Update run status in the store immediately so the history panel
            // shows 'cancelled' without waiting for a re-fetch.
            if (lastRunId) {
                updateRunStatus(lastRunId, 'cancelled')
            }

            // Signal RunHistoryList to re-fetch from DB (gets terminal NodeExecution records)
            // and stops the pulsating animation.
            setLastRunCompleted(true)
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

            const savedData = await saveWorkflow(currentId, { name: workflowName, nodes, edges })
            const wId = (!currentId || currentId === 'new') ? savedData.id : currentId
            if (!currentId || currentId === 'new') setWorkflowId(wId)

            // Reset selected nodes to queued, and ALL other nodes to idle
            // so we don't have stale 'failed' or 'cancelled' statuses from the previous run
            setNodes(useWorkflowStore.getState().nodes.map(n =>
                nodeIds.includes(n.id)
                    ? { ...n, data: { ...n.data, status: 'queued', result: undefined, error: undefined } }
                    : { ...n, data: { ...n.data, status: 'idle', result: undefined, error: undefined } }
            ))

            const execRes = await fetch(`/api/workflows/${wId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ executionType: 'selected', selectedNodeIds: nodeIds }),
            })

            if (!execRes.ok) throw new Error('Execution failed')

            const execData = await execRes.json()
            const { runId, triggerRunId, publicAccessToken, run } = execData
            const currentRuns = useWorkflowStore.getState().runs
            setRuns([run, ...currentRuns])
            setLastRunId(runId)
            setTriggerRunId(triggerRunId)
            setPublicAccessToken(publicAccessToken)
        } catch (error) {
            console.error(error)
            setLoadingState('executing', false)
            alert('Failed to start selective execution')
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
        handleCancelWorkflow,
    }
}
