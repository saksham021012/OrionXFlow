import { MousePointer2, Hand } from 'lucide-react'

interface ToolbarToolsProps {
    activeTool: 'select' | 'hand'
    setActiveTool: (tool: 'select' | 'hand') => void
}

export function ToolbarTools({ activeTool, setActiveTool }: ToolbarToolsProps) {
    return (
        <div className="flex items-center gap-0.5 sm:gap-1">
            <button
                onClick={() => setActiveTool('select')}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                    activeTool === 'select'
                        ? 'bg-[#FFFFA5] text-black shadow-sm'
                        : 'text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a]'
                }`}
                title="Select Tool"
            >
                <MousePointer2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            </button>
            <button
                onClick={() => setActiveTool('hand')}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                    activeTool === 'hand'
                        ? 'bg-[#FFFFA5] text-black shadow-sm'
                        : 'text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a]'
                }`}
                title="Hand Tool"
            >
                <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
        </div>
    )
}
