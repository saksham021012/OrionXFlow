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
    <div className="w-64 bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col h-full">
      {/* User Profile Section */}
      <div className="px-4 pt-4 pb-2">
         <UserMenu />
      </div>

      {/* Create New File Button */}
      <div className="px-4 pb-4">
        <CreateWorkflowButton />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-2 space-y-1">
        
        
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive('/dashboard') 
              ? 'text-white bg-[#1a1a1a]' 
              : 'text-[#a1a1a1] hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Folder className="w-4 h-4" />
          My Files
        </Link>


      </div>

      {/* Footer / User Settings */}
      <div className="p-4 border-t border-[#2a2a2a]">
         <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <span className="text-xs text-[#666666]">Discord</span>
         </div>
      </div>
    </div>
  )
}
