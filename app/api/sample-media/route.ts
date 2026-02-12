import { NextRequest, NextResponse } from 'next/server'
import { Transloadit } from 'transloadit'
import { join } from 'path'

// Optionally cache in-memory for the life of the server process
let cachedImageUrl: string | null = null
let cachedVideoUrl: string | null = null

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    if (cachedImageUrl && cachedVideoUrl) {
      return NextResponse.json({
        imageUrl: cachedImageUrl,
        videoUrl: cachedVideoUrl,
      })
    }

    const transloadit = new Transloadit({
      authKey: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!,
      authSecret: process.env.TRANSLOADIT_SECRET!,
    })

    // ----- Upload headphone image from public to Transloadit -----
    const imagePath = join(process.cwd(), 'public', 'headphone.webp')

    const imageAssembly = await transloadit.createAssembly({
      params: {
        steps: {
          ':original': {
            robot: '/upload/handle',
          },
          optimized: {
            use: ':original',
            robot: '/image/resize',
            width: 2048,
            height: 2048,
            resize_strategy: 'fit',
            imagemagick_stack: 'v3.0.0',
          },
        },
      },
      files: {
        file: imagePath,
      },
    })

    const completedImageAssembly = await transloadit.awaitAssemblyCompletion(
      imageAssembly.assembly_id!
    )

    const imageResult =
      completedImageAssembly.results?.optimized?.[0] ??
      completedImageAssembly.results?.[':original']?.[0]

    if (!imageResult?.ssl_url) {
      throw new Error('Image upload completed but no URL returned')
    }

    const imageUrl = imageResult.ssl_url as string

    // ----- Upload headphone video from public to Transloadit -----
    const videoPath = join(process.cwd(), 'public', 'headphonevideo.mp4')

    const videoAssembly = await transloadit.createAssembly({
      params: {
        steps: {
          ':original': {
            robot: '/upload/handle',
          },
          encoded: {
            use: ':original',
            robot: '/video/encode',
            preset: 'webm',
            ffmpeg_stack: 'v6.0.0',
          },
        },
      },
      files: {
        file: videoPath,
      },
    })

    const completedVideoAssembly = await transloadit.awaitAssemblyCompletion(
      videoAssembly.assembly_id!
    )

    const videoResult =
      completedVideoAssembly.results?.encoded?.[0] ??
      completedVideoAssembly.results?.[':original']?.[0]

    if (!videoResult?.ssl_url) {
      throw new Error('Video upload completed but no URL returned')
    }

    const videoUrl = videoResult.ssl_url as string

    cachedImageUrl = imageUrl
    cachedVideoUrl = videoUrl

    return NextResponse.json({ imageUrl, videoUrl })
  } catch (error) {
    console.error('sample-media error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to prepare sample media',
      },
      { status: 500 }
    )
  }
}

