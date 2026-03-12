import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { runs } from '@trigger.dev/sdk/v3'

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
        const activeRunRaw = await prisma.workflowRun.findFirst({
            where: {
                workflowId: id,
                status: 'running',
                workflow: { user: { clerkId: userId } }
            },
            orderBy: { startedAt: 'desc' },
            include: {
                workflow: true,
                nodeExecutions: true
            }
        })

        if (!activeRunRaw) {
            return NextResponse.json({ message: 'No active run found to cancel' }, { status: 404 })
        }
        
        const activeRun = activeRunRaw as any

        // Determine which nodes were supposed to run
        let nodesToExecute: string[] = []
        if (activeRun.executionType === 'full') {
            nodesToExecute = (activeRun.workflow.nodes as any[]).map(n => n.id)
        } else if (activeRun.executionType === 'selected' || activeRun.executionType === 'single') {
            nodesToExecute = (activeRun.selectedNodeIds as string[]) || []
        }

        // Prepare NodeExecution updates/creations
        const existingExecs = new Map(activeRun.nodeExecutions.map((e: any) => [e.nodeId, e.status]))
        const upserts = nodesToExecute.map(nodeId => {
            const nodeDef = (activeRun.workflow.nodes as any[]).find(n => n.id === nodeId)
            const status = existingExecs.get(nodeId)
            
            if (status === 'completed' || status === 'failed') {
                return null // Terminal, leave as is
            }
            
            if (status === 'running' || status === 'queued') {
                // Update existing stuck record
                return prisma.nodeExecution.updateMany({
                    where: { runId: activeRun.id, nodeId },
                    data: { status: 'failed', error: 'Cancelled', completedAt: new Date() }
                })
            }
            
            // Doesn't exist yet, create it
            return prisma.nodeExecution.create({
                data: {
                    runId: activeRun.id,
                    nodeId,
                    nodeType: nodeDef?.type || 'unknown',
                    status: 'failed',
                    error: 'Cancelled',
                    completedAt: new Date(),
                }
            })
        }).filter(Boolean)

        // Execute all updates in a transaction
        await prisma.$transaction([
            prisma.workflowRun.update({
                where: { id: activeRun.id },
                data: {
                    status: 'cancelled',
                    completedAt: new Date(),
                    error: 'Cancelled by user'
                }
            }),
            ...(upserts as any[])
        ])
        
        // Fetch trigger run from trigger db to cancel
        if (activeRun.triggerRunId) {
            try {
                await runs.cancel(activeRun.triggerRunId)
            } catch (e) {
                console.error('Failed to cancel run on trigger.dev:', e)
            }
        }

        return NextResponse.json({ success: true, runId: activeRun.id })
    } catch (error) {
        console.error('Error cancelling workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
