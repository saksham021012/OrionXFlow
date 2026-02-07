'use client'

import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { NodeExecutionDetails, NodeExecution } from './NodeExecutionDetails'

export interface WorkflowRun {
  id: string
  startedAt: string
  completedAt?: string
  status: 'completed' | 'failed' | 'running' | 'partial'
  executionType: 'full' | 'selected' | 'single'
  nodeExecutions?: NodeExecution[]
}

interface HistoryItemProps {
  run: WorkflowRun
  isExpanded: boolean
  onToggle: () => void
}

export function HistoryItem({ run, isExpanded, onToggle }: HistoryItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10'
      case 'failed': return 'text-error bg-error/10'
      case 'running': return 'text-warning bg-warning/10'
      case 'partial': return 'text-warning bg-warning/10'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg border border-[#404040] overflow-hidden hover:border-primary/30 transition-all">
      <button
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-[#333333] transition-all"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white">
            Run #{run.id.slice(-6)}
          </span>
          <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(run.status)}`}>
            {run.status}
          </span>
        </div>
        <p className="text-xs text-[#a0a0a0]">
          {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
        </p>
        <p className="text-xs text-[#a0a0a0] capitalize">
          {run.executionType}
        </p>
      </button>

      {isExpanded && run.nodeExecutions && (
        <div className="border-t border-[#404040] p-3 space-y-2">
          {run.nodeExecutions.length === 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin"/> Initializing nodes...
            </p>
          )}
          {run.nodeExecutions.map((node, index) => (
            <NodeExecutionDetails key={index} node={node} />
          ))}
        </div>
      )}
    </div>
  )
}
