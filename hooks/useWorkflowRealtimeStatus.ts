'use client'

import { useEffect, useCallback } from 'react'
import { useRealtimeRun } from '@trigger.dev/react-hooks'
import { useWorkflowStore } from '@/store/workflowStore'

/**
 * Subscribes to the active Trigger.dev orchestrator run via WebSocket.
 * Reads per-node metadata keys pushed by executeNodeTask (metadata.root.set)
 * and updates the canvas nodes in real-time — zero DB reads during execution.
 *
 * Mounted once in WorkflowCanvas so it's always active during a run.
 */
export function useWorkflowRealtimeStatus() {
    const {
        workflowId,
        triggerRunId,
        publicAccessToken,
        setNodes,
        setEdges,
        setRuns,
        setTriggerRunId,
        setPublicAccessToken,
        setLastRunCompleted,
        lastRunId,
        updateRunStatus,
    } = useWorkflowStore()

    const { run } = useRealtimeRun(triggerRunId ?? '', {
        accessToken: publicAccessToken ?? '',
        enabled: !!triggerRunId && !!publicAccessToken,
    })

    // On completion: only update edges — nodes already have correct status/results
    // from realtime metadata. Calling setNodes here would overwrite live results
    // with clean workflow node definitions (which have no execution results).
    const fetchFinalWorkflowState = useCallback(async () => {
        if (!workflowId || workflowId === 'new') return
        try {
            const res = await fetch(`/api/workflows/${workflowId}`)
            if (!res.ok) return
            const data = await res.json()
            setEdges(data.edges || [])
            // Picks up the real status the orchestrator wrote (partial/completed/failed)
            setRuns(data.runs || [])
        } catch (e) {
            console.error('[Realtime] Failed to fetch final workflow state:', e)
        }
    }, [workflowId, setEdges, setRuns])

    const clearSubscriptionState = useCallback(() => {
        setTriggerRunId(null)
        setPublicAccessToken(null)
        // Signals both RunHistoryList (re-fetch + reset) and
        // useWorkflowExecution (clear executing state, no reset)
        setLastRunCompleted(true)
    }, [setTriggerRunId, setPublicAccessToken, setLastRunCompleted])

    useEffect(() => {
        if (!run) return

        // Run already finished — handles reconnect case
        // isCompleted covers SUCCESS, FAILED, CANCELED, TIMED_OUT, etc. in v3 SDK
        if (run.isCompleted) {
            // Guard: if handleCancelWorkflow already cleared triggerRunId and lastRunId,
            // this completion event is stale — skip to avoid clobbering post-cancel state.
            const currentState = useWorkflowStore.getState()
            if (!currentState.triggerRunId || !currentState.lastRunId) return

            if (run.status === 'CANCELED') {
                // Cancel is handled by handleCancelWorkflow — skip
            } else if (run.status === 'FAILED' || run.status === 'TIMED_OUT' || run.status === 'CRASHED') {
                // Orchestrator itself crashed — set failed immediately, then sync
                if (lastRunId) updateRunStatus(lastRunId, 'failed')
                fetchFinalWorkflowState().then(() => clearSubscriptionState())
            } else {
                // COMPLETED: the orchestrator wrote the real status (completed/partial/failed)
                // to the DB. fetchFinalWorkflowState calls setRuns which picks it up — no
                // need to call updateRunStatus with a guessed value here.
                fetchFinalWorkflowState().then(() => clearSubscriptionState())
            }
            return
        }

        // Live update: read flat per-node metadata keys.
        // Guard: if triggerRunId was already cleared (e.g. user just cancelled),
        // skip this update — handleCancelWorkflow already wrote the terminal state.
        if (run.metadata && useWorkflowStore.getState().triggerRunId) {
            const currentNodes = useWorkflowStore.getState().nodes
            const updatedNodes = currentNodes.map((n) => {
                const nodeMeta = (run.metadata as any)?.[`node_${n.id}`]
                if (!nodeMeta) return n
                return {
                    ...n,
                    data: {
                        ...n.data,
                        status: nodeMeta.status,
                        result: nodeMeta.result ?? n.data.result,
                        error: nodeMeta.error,
                    },
                }
            })
            setNodes(updatedNodes)
        }
    }, [run?.status, run?.metadata])
}
