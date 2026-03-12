'use client'

import { useState, useEffect } from 'react'
import { Clock, RefreshCw, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { HistoryItem, WorkflowRun } from './HistoryItem'

export function RunHistoryList() {
  const { workflowId, lastRunId, lastRunCompleted, setLastRunCompleted, nodes, runs, setRuns } = useWorkflowStore()
  const [loading, setLoading] = useState(false)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)

  const fetchRuns = async () => {
    if (!workflowId || workflowId === 'new') return

    try {
      setLoading(true)
      const response = await fetch(`/api/workflows/${workflowId}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch workflow')

      const data = await response.json()
      setRuns(data.runs || [])
    } catch (error) {
      console.error('Error fetching runs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch when workflow changes
  useEffect(() => {
    if (!workflowId || workflowId === 'new') {
      setRuns([])
      return
    }
    fetchRuns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId])

  // Re-fetch from DB when run completes/is cancelled so history shows final NodeExecution records
  useEffect(() => {
    if (!lastRunCompleted) return
    fetchRuns().finally(() => setLastRunCompleted(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastRunCompleted])

  // Compute live display runs: merge real-time node statuses for the currently active run
  // Terminal statuses — runs in these states must never be overlaid with live node data
  const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled', 'partial'])

  // Compute live display runs: merge real-time node statuses for the currently active run ONLY
  const displayRuns = runs.map((run) => {
    // Only overlay live data onto the active run, and only while it's still running
    const isActiveRun = run.id === lastRunId
    const isTerminal = TERMINAL_STATUSES.has(run.status)

    if (isActiveRun && !isTerminal) {
      const existingExecs = run.nodeExecutions || []
      const execMap = new Map<string, any>()

      existingExecs.forEach((e: any) => execMap.set(e.nodeId, e))

      nodes.forEach(n => {
        const liveStatus = n.data.status
        if (liveStatus && liveStatus !== 'idle') {
          const existing = execMap.get(n.id) || {
            id: `live-${n.id}`,
            nodeId: n.id,
            nodeType: n.type || 'unknown',
            startedAt: new Date().toISOString()
          }
          execMap.set(n.id, {
            ...existing,
            status: liveStatus,
            outputs: n.data.result !== undefined ? n.data.result : existing.outputs,
            error: n.data.error || existing.error,
          })
        }
      })

      return {
        ...run,
        status: 'running' as const,
        nodeExecutions: Array.from(execMap.values())
      }
    }
    return run
  }) as WorkflowRun[]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5 sm:gap-2">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          History
        </h2>
        <button
          onClick={fetchRuns}
          className="p-1 hover:bg-[#2a2a2a] rounded text-[#a0a0a0] hover:text-white transition-all"
          title="Refresh"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>

      {/* Runs List */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2"
        data-lenis-prevent
      >
        {!workflowId ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <p className="text-xs sm:text-sm text-[#a0a0a0]">Save the workflow first</p>
            <p className="text-[10px] sm:text-xs text-[#6b6b6b] mt-1">
              History is tracked for saved workflows
            </p>
          </div>
        ) : loading && runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#a0a0a0]" />
            <p className="text-[10px] sm:text-xs text-[#6b6b6b]">Loading history...</p>
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <p className="text-xs sm:text-sm text-[#a0a0a0]">No workflow runs yet</p>
            <p className="text-[10px] sm:text-xs text-[#6b6b6b] mt-1">
              Execute the workflow to see history
            </p>
          </div>
        ) : (
          displayRuns.map((run) => (
            <HistoryItem
              key={run.id}
              run={run}
              isExpanded={expandedRun === run.id}
              onToggle={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
