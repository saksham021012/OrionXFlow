'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { RunHistoryList } from './right-sidebar/RunHistoryList'

export default function RightSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`
        relative h-full bg-[#1a1a1a] border-l border-[#2a2a2a] transition-all duration-300
        ${isCollapsed ? 'w-10 sm:w-12 hover:bg-[#2a2a2a]' : 'w-64 sm:w-72 md:w-80'}
      `}
    >
      {/* Collapsed Icon - Show History Symbol */}
      {isCollapsed && (
        <div className="absolute inset-0 flex flex-col items-center pt-12 sm:pt-14 md:pt-16 gap-3 sm:gap-4 animate-in fade-in duration-300">
           <button 
             onClick={() => setIsCollapsed(false)}
             className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-[#6b6b6b] hover:text-white hover:bg-[#2a2a2a] transition-all"
             title="Expand History"
           >
             <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-2.5 sm:-left-3 top-3 sm:top-4 z-10 bg-[#2a2a2a] border border-[#404040] rounded-full p-0.5 sm:p-1 hover:bg-[#333333] transition-all"
      >
        {isCollapsed ? (
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        )}
      </button>

      {!isCollapsed && <RunHistoryList />}
    </div>
  )
}
