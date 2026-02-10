import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ExecuteWorkflowSchema } from '@/lib/schemas'

export const dynamic = 'force-dynamic'
import { executeWorkflow } from '@/lib/workflow-execution/workflow-orchestrator'
import type { Node, Edge } from 'reactflow'

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

        // Debug: Check LLM nodes data
        nodes.forEach(n => {
            if (n.type === 'llm') {
                console.log(`[DEBUG] Node ${n.id} data:`, JSON.stringify(n.data, null, 2))
                console.log(`[DEBUG] Node ${n.id} model:`, n.data.model)
            }
        })

        // Determine which nodes to execute
        let nodesToExecute: string[]
        if (validated.executionType === 'full') {
            nodesToExecute = nodes.map((n) => n.id)
        } else if (validated.executionType === 'selected' || validated.executionType === 'single') {
            nodesToExecute = validated.selectedNodeIds || []
        } else {
            nodesToExecute = []
        }

        // Create workflow run
        const run = await prisma.workflowRun.create({
            data: {
                workflowId: workflow.id,
                status: 'running',
                executionType: validated.executionType,
                selectedNodeIds: nodesToExecute,
            },
        })

        // Execute workflow asynchronously
        executeWorkflow(run.id, nodes, edges, nodesToExecute).catch(console.error)

        return NextResponse.json({ runId: run.id })
    } catch (error) {
        console.error('Error executing workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
