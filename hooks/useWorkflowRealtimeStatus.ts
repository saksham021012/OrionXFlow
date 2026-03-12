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
        } catch (e) {
            console.error('[Realtime] Failed to fetch final workflow state:', e)
        }
    }, [workflowId, setEdges])

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
            // Map trigger status to local run status
            let finalStatus = 'completed'
            if (run.status === 'FAILED' || run.status === 'TIMED_OUT' || run.status === 'CRASHED') finalStatus = 'failed'
            if (run.status === 'CANCELED') finalStatus = 'cancelled'

            if (lastRunId) {
                updateRunStatus(lastRunId, finalStatus)
            }

            // Await fetch before clearing so RunHistoryList doesn't see stale data
            fetchFinalWorkflowState().then(() => {
                clearSubscriptionState()
            })
            return
        }

        // Live update: read flat per-node metadata keys
        // Use getState() to avoid stale closure on nodes — avoids adding nodes
        // to deps array which would cause infinite re-run loop
        if (run.metadata) {
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
