import { Undo2, Redo2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'

export function ToolbarHistory() {
    const { undo, redo, past, future } = useWorkflowStore()
    
    const canUndo = past.length > 0
    const canRedo = future.length > 0

return (
        <div className="flex items-center gap-0.5 sm:gap-1">
            <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                    !canUndo
                        ? 'text-[#404040] cursor-not-allowed'
                        : 'text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a]'
                }`}
                title="Undo"
            >
                <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                    !canRedo
                        ? 'text-[#404040] cursor-not-allowed'
                        : 'text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a]'
                }`}
                title="Redo"
            >
                <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
        </div>
    )
}
