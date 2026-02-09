'use client'

import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
