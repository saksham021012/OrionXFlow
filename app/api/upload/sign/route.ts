import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { fileType } = body

        if (!fileType || (fileType !== 'image' && fileType !== 'video')) {
            return NextResponse.json({ error: 'Invalid fileType' }, { status: 400 })
        }

        // Set expiration for 1 hour from now
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '+00:00')

        // Define steps based on fileType (same as in the original upload route)
        const steps = fileType === 'image'
            ? {
                ':original': {
                    robot: '/upload/handle',
                },
                'optimized': {
                    use: ':original',
                    robot: '/image/resize',
                    width: 2048,
                    height: 2048,
                    resize_strategy: 'fit',
                    imagemagick_stack: 'v3.0.0',
                },
            }
            : {
                ':original': {
                    robot: '/upload/handle',
                },
                'encoded': {
                    use: ':original',
                    robot: '/video/encode',
                    preset: 'webm',
                    ffmpeg_stack: 'v6.0.0',
                },
            }

        const params = JSON.stringify({
            auth: {
                key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!,
                expires,
            },
            steps,
        })

        // Generate signature using HMAC-SHA384
        const signature = crypto
            .createHmac('sha384', process.env.TRANSLOADIT_SECRET!)
            .update(Buffer.from(params, 'utf-8'))
            .digest('hex')

        return NextResponse.json({
            params,
            signature,
        })

    } catch (error) {
        console.error('Signing error:', error)
        return NextResponse.json(
            { error: 'Failed to generate upload signature' },
            { status: 500 }
        )
    }
}
