import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import WorkflowGrid from '@/components/dashboard/WorkflowGrid'
import CreateWorkflowButton from '@/components/dashboard/CreateWorkflowButton'
import { Search } from 'lucide-react'

import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient'

export default async function DashboardPage() {
    const user = await currentUser()
    const { userId } = await auth()
    
    if (!userId || !user) {
       redirect('/sign-in')
    }

    // Initialize user in DB if not exists
    const clerkUser = await auth().then(a => a.userId ? {id: a.userId} : null)

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    // If dbUser exists, fetch workflows
    const workflows = dbUser ? await prisma.workflow.findMany({
        where: { userId: dbUser.id },
        select: {
            id: true,
            name: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' }
    }) : []
    
    const workspaceName = user.firstName 
        ? `${user.firstName}'s Workspace` 
        : (user.emailAddresses[0]?.emailAddress ? `${user.emailAddresses[0].emailAddress.split('@')[0]}'s Workspace` : 'My Workspace')

    return (
        <DashboardLayoutClient 
            workspaceName={workspaceName}
            headerActions={<CreateWorkflowButton />}
        >
            <div className="min-h-[400px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-base sm:text-lg font-medium text-white">My files</h2>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                            <input 
                                type="text" 
                                placeholder="Search" 
                                className="w-full sm:w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-[#666] focus:outline-none focus:border-[#404040]"
                            />
                        </div>
                    </div>
                </div>

                <WorkflowGrid initialWorkflows={workflows} />
            </div>
        </DashboardLayoutClient>
    )
}
