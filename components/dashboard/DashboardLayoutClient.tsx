'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import DashboardSidebar from '@/components/layout/DashboardSidebar'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  workspaceName: string
  headerActions?: React.ReactNode
}

export default function DashboardLayoutClient({ 
  children, 
  workspaceName,
  headerActions 
}: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] text-white">
        {/* Header */}
        <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-[#2a2a2a] flex items-center justify-between gap-3 bg-[#0a0a0a] z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-shrink">
              <h1 className="text-xs sm:text-sm font-medium text-gray-400 truncate">{workspaceName}</h1>
            </div>
          </div>
          {headerActions}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
