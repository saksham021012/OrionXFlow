import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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
        // Note: workflow.userId refers to internal User ID. We need to check if that user has clerkId === userId
        // But for now, let's assume we trust the ID if we can find it? 
        // Better: ensure we find user first.
        // Or check run.workflow.userId against current user.

        // Actually, let's just update it. If user knows the ID, it's probably fine for V1.
        // But cleaner:
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
