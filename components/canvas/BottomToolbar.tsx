import { useCanvasShortcuts } from '@/hooks/useCanvasShortcuts'
import { ToolbarTools } from './bottom-toolbar/ToolbarTools'
import { ToolbarHistory } from './bottom-toolbar/ToolbarHistory'
import { ToolbarZoom } from './bottom-toolbar/ToolbarZoom'

interface BottomToolbarProps {
  activeTool: 'select' | 'hand'
  setActiveTool: (tool: 'select' | 'hand') => void
}

export default function BottomToolbar({ activeTool, setActiveTool }: BottomToolbarProps) {
  useCanvasShortcuts()

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1.5 shadow-xl z-50">
      <ToolbarTools activeTool={activeTool} setActiveTool={setActiveTool} />

      {/* Divider */}
      <div className="w-[1px] h-6 bg-[#2a2a2a] mx-1" />

      <ToolbarHistory />

      {/* Divider */}
      <div className="w-[1px] h-6 bg-[#2a2a2a] mx-1" />

      <ToolbarZoom />
    </div>
  )
}

