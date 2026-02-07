'use client'

import { Play, X } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution'

export function SelectionActions() {
    const { selectedNodes, setSelectedNodes } = useWorkflowStore()
    const { handleRunSelected, executing } = useWorkflowExecution()

    if (selectedNodes.length === 0) return null

    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a1a] border border-primary/50 rounded-full px-4 py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span className="text-xs font-medium text-white/70 mr-2">
                {selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected
            </span>
            
            <div className="w-[1px] h-4 bg-[#2a2a2a] mx-1" />

            <button 
                onClick={() => handleRunSelected(selectedNodes)}
                disabled={executing}
                className="flex items-center gap-2 px-3 py-1 bg-primary text-black rounded-full text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
                <Play className="w-3 h-3 fill-current" />
                Run Selected
            </button>

            <button 
                onClick={() => setSelectedNodes([])}
                className="p-1 hover:bg-[#2a2a2a] rounded-full transition-all text-[#666] hover:text-white"
                title="Clear selection"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}
