import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ExecuteWorkflowSchema } from '@/lib/schemas'
import { tasks, auth as triggerAuth } from '@trigger.dev/sdk/v3'
import type { Node, Edge } from 'reactflow'

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

        const body = await request.json()
        const validated = ExecuteWorkflowSchema.parse(body)

        // Get workflow
        const workflow = await prisma.workflow.findFirst({
            where: {
                id,
                user: { clerkId: userId },
            },
        })

        if (!workflow) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        const nodes = workflow.nodes as unknown as Node[]
        const edges = workflow.edges as unknown as Edge[]

        // Determine which nodes to execute
        let nodesToExecute: string[]
        if (validated.executionType === 'full') {
            nodesToExecute = nodes.map((n) => n.id)
        } else if (validated.executionType === 'selected' || validated.executionType === 'single') {
            nodesToExecute = validated.selectedNodeIds || []
        } else {
            nodesToExecute = []
        }

        // Create workflow run record
        const run = await prisma.workflowRun.create({
            data: {
                workflowId: workflow.id,
                status: 'running',
                executionType: validated.executionType,
                selectedNodeIds: nodesToExecute,
            },
        })

        // Trigger orchestrator — returns a handle with the Trigger.dev run ID
        const handle = await tasks.trigger('workflow-orchestrator', {
            runId: run.id,
            nodes,
            edges,
            nodesToExecute,
        })

        // Persist Trigger.dev run ID IMMEDIATELY so the cancel route can always
        // find it. Guard: don't overwrite if cancel already flipped status to 'cancelled'.
        await prisma.workflowRun.updateMany({
            where: { id: run.id, status: 'running' },
            data: { triggerRunId: handle.id },
        })

        // Scoped public token — client subscribes to this run only
        const publicAccessToken = await triggerAuth.createPublicToken({
            scopes: { read: { runs: [handle.id] } },
            expirationTime: '1hr',
        })

        return NextResponse.json({
            runId: run.id,
            triggerRunId: handle.id,
            publicAccessToken,
            run: {
                ...run,
                triggerRunId: handle.id,
                nodeExecutions: []
            }
        })
    } catch (error) {
        console.error('Error executing workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
