import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify run belongs to user's workflow
        const run = await prisma.workflowRun.findUnique({
            where: { id },
            include: {
                workflow: true
            }
        })

        if (!run) {
            return NextResponse.json({ error: 'Run not found' }, { status: 404 })
        }

        // Check ownership via Clerk ID
        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user || run.workflow.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Update status to cancelled
        await prisma.workflowRun.update({
            where: { id },
            data: {
                status: 'cancelled',
                completedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error cancelling run:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
