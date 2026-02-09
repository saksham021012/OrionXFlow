'use client'

import { Folder } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserMenu } from './dashboard-sidebar/UserMenu'
import { CreateWorkflowButton } from './dashboard-sidebar/CreateWorkflowButton'

export default function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-48 sm:w-56 md:w-64 bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col h-full">
      {/* User Profile Section */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1.5 sm:pb-2">
         <UserMenu />
      </div>

      {/* Create New File Button */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <CreateWorkflowButton />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-1.5 sm:px-2 py-1.5 sm:py-2 space-y-0.5 sm:space-y-1">
        
        
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm transition-colors ${
            isActive('/dashboard') 
              ? 'text-white bg-[#1a1a1a]' 
              : 'text-[#a1a1a1] hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          My Files
        </Link>


      </div>

      {/* Footer / User Settings */}
      <div className="p-3 sm:p-4 border-t border-[#2a2a2a]">
         <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
             <span className="text-[10px] sm:text-xs text-[#666666]">Discord</span>
         </div>
      </div>
    </div>
  )
}
