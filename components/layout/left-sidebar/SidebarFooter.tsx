'use client'

import { Play, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'

interface SidebarFooterProps {
  isExpanded: boolean
  executing: boolean
  cancelling: boolean
  handleRunWorkflow: () => void
  handleCancelWorkflow: () => void
}

export function SidebarFooter({
  isExpanded,
  executing,
  cancelling,
  handleRunWorkflow,
  handleCancelWorkflow
}: SidebarFooterProps) {
  const { nodes } = useWorkflowStore()

  if (!isExpanded) return null

  return (
    <div className="p-3 sm:p-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
      {executing ? (
          <button
            onClick={handleCancelWorkflow}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-md text-sm sm:text-base font-medium transition-all disabled:opacity-50"
          >
            {cancelling ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            {cancelling ? 'Stopping...' : 'Stop Execution'}
          </button>
      ) : (
          <button
            onClick={handleRunWorkflow}
            disabled={executing || nodes.length === 0}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm sm:text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-primary/20"
          >
            {executing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                Run Workflow
              </>
            )}
          </button>
      )}
    </div>
  )
}
