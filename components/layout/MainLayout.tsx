import { useState } from 'react'
import { Menu, PanelLeftOpen } from 'lucide-react'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  return (
    <div className="h-screen w-screen flex bg-background overflow-hidden relative">
      {/* Mobile Overlays */}
      {isLeftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] sm:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}
      
      {/* Left Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-[101] sm:relative sm:z-0
        transition-transform duration-300 ease-in-out
        ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0 sm:flex'}
        h-full
      `}>
        <LeftSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Mobile Sidebar Toggle Button */}
        <button 
          onClick={() => setIsLeftSidebarOpen(true)}
          className="sm:hidden absolute top-3 left-3 z-50 p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>

        {children}
      </div>

      {/* Right Sidebar - Logic similar if needed, keeping it hidden for now on mobile to save space */}
      <div className="hidden sm:flex h-full">
        <RightSidebar />
      </div>
    </div>
  )
}
