import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { fileType } = await request.json()

        const expires = new Date()
        expires.setHours(expires.getHours() + 2)
        const expiresString = expires.toISOString().replace(/\.\d{3}/, '+00:00')

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
                    preset: 'hls-1080p',
                    ffmpeg_stack: 'v6.0.0',
                },
            }

        const params = {
            auth: {
                key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY,
                expires: expiresString,
            },
            steps,
        }

        const paramsString = JSON.stringify(params)
        const signature = crypto
            .createHmac('sha384', process.env.TRANSLOADIT_SECRET!)
            .update(Buffer.from(paramsString, 'utf-8'))
            .digest('hex')

        return NextResponse.json({
            params: paramsString,
            signature: `sha384:${signature}`,  // ← fixed: Transloadit requires this prefix
        })
    } catch (error) {
        console.error('Signature error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate signature' },
            { status: 500 }
        )
    }
}