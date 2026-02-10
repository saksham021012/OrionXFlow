import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const run = await prisma.workflowRun.findUnique({
            where: { id },
            include: {
                workflow: {
                    include: {
                        user: true
                    }
                },
                nodeExecutions: true,
            }
        })

        if (!run) {
            return NextResponse.json({ error: 'Run not found' }, { status: 404 })
        }

        // Verify ownership via the parent workflow
        // @ts-ignore - Prisma types might not fully infer the nested relation check easily here
        if (run.workflow.user.clerkId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json(run)
    } catch (error) {
        console.error('Error fetching run:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
