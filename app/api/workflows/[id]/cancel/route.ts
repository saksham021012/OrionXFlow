import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the latest running workflow run for this workflow
        const activeRun = await prisma.workflowRun.findFirst({
            where: {
                workflowId: id,
                status: 'running',
                workflow: { user: { clerkId: userId } }
            },
            orderBy: { startedAt: 'desc' }
        })

        if (!activeRun) {
            return NextResponse.json({ message: 'No active run found to cancel' }, { status: 404 })
        }

        // Update status to cancelled
        await prisma.workflowRun.update({
            where: { id: activeRun.id },
            data: {
                status: 'cancelled',
                completedAt: new Date(),
                error: 'Cancelled by user'
            }
        })

        return NextResponse.json({ success: true, runId: activeRun.id })
    } catch (error) {
        console.error('Error cancelling workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
