'use client'

import { 
  Search, 
  Grid3x3, 
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type PanelType = 'none' | 'search' | 'nodes'

interface SidebarIconBarProps {
  activePanel: PanelType
  togglePanel: (panel: PanelType) => void
  isNavigating: boolean
  setIsNavigating: (value: boolean) => void
  isExpanded: boolean
}

export function SidebarIconBar({
  activePanel,
  togglePanel,
  isNavigating,
  setIsNavigating,
  isExpanded
}: SidebarIconBarProps) {
  const router = useRouter()

  return (
    <div className="w-12 bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col items-center py-4 gap-2">
      {/* Brand Logo */}
      <div className="mb-2 flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <span className="text-black font-black text-lg select-none">O</span>
        </div>
      </div>

      <button
        onClick={() => {
          setIsNavigating(true)
          router.push('/dashboard')
        }}
        className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
          isExpanded
            ? 'bg-[#2a2a2a] text-white hover:bg-[#333333]'
            : 'text-[#6b6b6b] hover:text-white hover:bg-[#1a1a1a]'
        } ${isNavigating ? 'opacity-80' : ''}`}
        title="Go to Dashboard"
      >
        {isNavigating ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ArrowLeft className="w-4 h-4" />}
      </button>

      <button
        onClick={() => togglePanel('search')}
        className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
          activePanel === 'search'
            ? 'bg-[#2a2a2a] text-white'
            : 'text-[#6b6b6b] hover:text-white hover:bg-[#1a1a1a]'
        }`}
        title="Search"
      >
        <Search className="w-4 h-4" />
      </button>

      <button
        onClick={() => togglePanel('nodes')}
        className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
          activePanel === 'nodes'
            ? 'bg-[#2a2a2a] text-white'
            : 'text-[#6b6b6b] hover:text-white hover:bg-[#1a1a1a]'
        }`}
        title="Quick Access"
      >
        <Grid3x3 className="w-4 h-4" />
      </button>
    </div>
  )
}
