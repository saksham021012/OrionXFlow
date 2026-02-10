'use client'

import { Play, X } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution'

export function SelectionActions() {
    const { selectedNodes, setSelectedNodes } = useWorkflowStore()
    const { handleRunSelected, executing } = useWorkflowExecution()

    if (selectedNodes.length === 0) return null

    return (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-[#1a1a1a] border border-primary/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-2xl z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[90vw] sm:max-w-none">
            <span className="text-[10px] sm:text-xs font-medium text-white/70 mr-1 sm:mr-2 truncate">
                {selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected
            </span>
            
            <div className="w-[1px] h-3 sm:h-4 bg-[#2a2a2a] mx-0.5 sm:mx-1 flex-shrink-0" />

            <button 
                onClick={() => handleRunSelected(selectedNodes)}
                disabled={executing}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-primary text-black rounded-full text-[10px] sm:text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap flex-shrink-0"
            >
                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                <span className="hidden xs:inline">Run Selected</span>
                <span className="xs:hidden">Run</span>
            </button>

            <button 
                onClick={() => setSelectedNodes([])}
                className="p-1 hover:bg-[#2a2a2a] rounded-full transition-all text-[#666] hover:text-white flex-shrink-0"
                title="Clear selection"
            >
                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
        </div>
    )
}
