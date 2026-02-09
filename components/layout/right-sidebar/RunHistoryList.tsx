'use client'

import { useState, useEffect } from 'react'
import { Clock, RefreshCw, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { HistoryItem, WorkflowRun } from './HistoryItem'

export function RunHistoryList() {
  const { workflowId, lastRunId } = useWorkflowStore()
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
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

  useEffect(() => {
    if (!workflowId || workflowId === 'new') {
      setRuns([])
      return
    }

    fetchRuns()

    const hasRunning = runs.some((r) => r.status === 'running')
    // Check if the run we just started is missing from the list (wait for it to appear)
    const missingLastRun = lastRunId && !runs.find(r => r.id === lastRunId)

    if (hasRunning || missingLastRun) {
      setIsPolling(true)
      const interval = setInterval(fetchRuns, 1000)
      return () => clearInterval(interval)
    } else {
      setIsPolling(false)
    }
  }, [workflowId, lastRunId, runs.some((r) => r.status === 'running'), runs.length])

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
          {isPolling ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>

      {/* Runs List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        {!workflowId ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <p className="text-xs sm:text-sm text-[#a0a0a0]">Save the workflow first</p>
            <p className="text-[10px] sm:text-xs text-[#6b6b6b] mt-1">
              History is tracked for saved workflows
            </p>
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <p className="text-xs sm:text-sm text-[#a0a0a0]">No workflow runs yet</p>
            <p className="text-[10px] sm:text-xs text-[#6b6b6b] mt-1">
              Execute the workflow to see history
            </p>
          </div>
        ) : (
          runs.map((run) => (
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
