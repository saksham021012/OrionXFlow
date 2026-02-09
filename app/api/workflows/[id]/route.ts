import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UpdateWorkflowSchema } from '@/lib/schemas'

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

        const workflow = await prisma.workflow.findFirst({
            where: {
                id,
                user: { clerkId: userId },
            },
            include: {
                runs: {
                    orderBy: { startedAt: 'desc' },
                    include: {
                        nodeExecutions: true,
                    },
                },
            },
        })

        if (!workflow) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        return NextResponse.json(workflow)
    } catch (error) {
        console.error('Error fetching workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validated = UpdateWorkflowSchema.parse(body)

        const workflow = await prisma.workflow.updateMany({
            where: {
                id,
                user: { clerkId: userId },
            },
            data: validated,
        })

        if (workflow.count === 0) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // First verify ownership and get the internal ID
        const workflowToVerify = await prisma.workflow.findFirst({
            where: {
                id,
                user: { clerkId: userId },
            },
            select: { id: true }
        })

        if (!workflowToVerify) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }


        await prisma.workflow.delete({
            where: { id: workflowToVerify.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
