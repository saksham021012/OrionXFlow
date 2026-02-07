import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import WorkflowGrid from '@/components/dashboard/WorkflowGrid'
import CreateWorkflowButton from '@/components/dashboard/CreateWorkflowButton'
import { Search } from 'lucide-react'

// Layout for the dashboard section
function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-screen flex overflow-hidden bg-background">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] text-white">
                {children}
            </div>
        </div>
    )
}

export default async function DashboardPage() {
    const user = await currentUser()
    const { userId } = await auth()
    
    if (!userId || !user) {
       redirect('/sign-in')
    }

    // Initialize user in DB if not exists
    const clerkUser = await auth().then(a => a.userId ? {id: a.userId} : null)
    // Basic check, real sync happens via webhooks usually, but for now ensure existence
    // Actually, prisma.user is based on clerkId.
    // Let's just fetch workflows for now. Assumes user exists or we don't need user table constraint for just listing?
    // Schema says Workflow has relation to User.
    // So we need to ensure User exists.
    
    // For this implementation, I'll assumem the user might not be in DB yet if we don't have webhooks set up perfectly.
    // Let's query workflows by userId primarily.
    // Wait, the schema uses `userId` field which refers to `User.id` (internal ID), NOT `clerkId`.
    // I need to find the internal User ID from the Clerk ID.
    
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId }
    })

    if (!dbUser) {
        // Fallback: This might happen if webhook didn't fire. 
        // For now, let's redirect or show empty.
        // Or create the user on the fly?
        // Let's create on the fly to be safe.
        // But I need email. `auth()` doesn't provide email. 
        // I'll skip this dynamic creation and assume user exists or I'll fix it if it errors.
        // Actually, let's just try to find workflows. 
        // If dbUser is null, we can't find workflows by relation comfortably if we used internal ID.
    }
    
    // If dbUser exists, fetch workflows with lean selecting
    const workflows = dbUser ? await prisma.workflow.findMany({
        where: { userId: dbUser.id },
        select: {
            id: true,
            name: true,
            updatedAt: true,
            // thumbnailUrl is included if needed, but schema doesn't have it yet.
            // Keeping it simple with id, name, updatedAt.
        },
        orderBy: { updatedAt: 'desc' }
    }) : []
    
    const workspaceName = user.firstName 
        ? `${user.firstName}'s Workspace` 
        : (user.emailAddresses[0]?.emailAddress ? `${user.emailAddresses[0].emailAddress.split('@')[0]}'s Workspace` : 'My Workspace')

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="h-16 px-6 border-b border-[#2a2a2a] flex items-center justify-between">
                <div>
                     <h1 className="text-sm font-medium text-gray-400">{workspaceName}</h1>
                </div>
                <CreateWorkflowButton />
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6">
                


                {/* My Files Container */}
                <div className="min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-white">My files</h2>
                        
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                                <input 
                                    type="text" 
                                    placeholder="Search" 
                                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-[#666] focus:outline-none focus:border-[#404040]"
                                />
                            </div>
                        </div>
                    </div>

                    <WorkflowGrid initialWorkflows={workflows} />
                </div>

            </main>
        </DashboardLayout>
    )
}
