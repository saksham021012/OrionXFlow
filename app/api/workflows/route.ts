import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { CreateWorkflowSchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get or create user
        let user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) {
            const clerkUser = await (await import('@clerk/nextjs/server')).currentUser()
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: clerkUser?.emailAddresses[0]?.emailAddress || '',
                    name: clerkUser?.fullName,
                },
            })
        }

        const workflows = await prisma.workflow.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                name: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(workflows)
    } catch (error) {
        console.error('Error fetching workflows:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validated = CreateWorkflowSchema.parse(body)

        // Get or create user
        let user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) {
            const clerkUser = await (await import('@clerk/nextjs/server')).currentUser()
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: clerkUser?.emailAddresses[0]?.emailAddress || '',
                    name: clerkUser?.fullName,
                },
            })
        }

        const workflow = await prisma.workflow.create({
            data: {
                name: validated.name,
                description: validated.description,
                nodes: validated.nodes,
                edges: validated.edges,
                userId: user.id,
            },
        })

        return NextResponse.json(workflow)
    } catch (error) {
        console.error('Error creating workflow:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
