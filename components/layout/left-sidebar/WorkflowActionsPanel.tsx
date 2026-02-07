'use client'

import { Plus, Save, Play, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'

interface WorkflowActionsPanelProps {
  executing: boolean
  cancelling: boolean
  saving: boolean
  handleRunWorkflow: () => void
  handleCancelWorkflow: () => void
  handleSave: () => void
}

export function WorkflowActionsPanel({
  executing,
  cancelling,
  saving,
  handleRunWorkflow,
  handleCancelWorkflow,
  handleSave
}: WorkflowActionsPanelProps) {
  const { nodes } = useWorkflowStore()

  return (
    <div>
      <h3 className="text-xs font-semibold text-[#a0a0a0] uppercase mb-3 tracking-wider">
        Actions
      </h3>
      <div className="space-y-2">
        {/* Run Workflow - Full Width */}
        {executing ? (
          <button
            onClick={handleCancelWorkflow}
            disabled={cancelling}
            className="w-full h-12 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-semibold"
          >
            {cancelling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            <span>
              {cancelling ? 'Stopping...' : 'Stop Execution'}
            </span>
          </button>
        ) : (
          <button
            onClick={handleRunWorkflow}
            disabled={executing || nodes.length === 0}
            className="w-full h-12 rounded-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            <Play className="w-4 h-4 text-white fill-white" />
            <span className="text-sm text-white font-semibold">
              Run Workflow
            </span>
          </button>
        )}
        
        {/* New and Save */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              useWorkflowStore.getState().setNodes([])
              useWorkflowStore.getState().setEdges([])
              useWorkflowStore.getState().setWorkflowName('Untitled Workflow')
              useWorkflowStore.getState().setWorkflowId(null)
            }}
            className="h-12 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">New</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-12 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
            <span className="text-sm text-white font-medium">Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}
