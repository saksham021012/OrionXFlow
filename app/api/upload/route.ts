import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Transloadit } from 'transloadit'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

// Route segment config
export const maxDuration = 60 // 60 seconds timeout
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    let tempFilePath: string | null = null

    try {
        // Verify authentication
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the file from the request
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const fileType = formData.get('fileType') as string
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']

        const isValidType = fileType === 'image'
            ? validImageTypes.includes(file.type)
            : validVideoTypes.includes(file.type)

        if (!isValidType) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
        }

        // Initialize Transloadit with server-side credentials
        const transloadit = new Transloadit({
            authKey: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!,
            authSecret: process.env.TRANSLOADIT_SECRET!,
        })

        // Create assembly with appropriate steps based on file type
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

        // Write file to temp directory
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        tempFilePath = join(tmpdir(), `upload-${Date.now()}-${file.name}`)
        await writeFile(tempFilePath, buffer)

        // Create the assembly with file path
        const assembly = await transloadit.createAssembly({
            params: {
                steps,
            },
            files: {
                file: tempFilePath,
            },
        })

        // Wait for the assembly to complete processing
        console.log('Assembly created, waiting for completion...')
        const completedAssembly = await transloadit.awaitAssemblyCompletion(assembly.assembly_id!)

        // Clean up temp file
        await unlink(tempFilePath)
        tempFilePath = null

        // Debug: Log the completed assembly response
        console.log('Assembly completed:', completedAssembly.ok)
        console.log('Assembly results keys:', Object.keys(completedAssembly.results || {}))

        // Get the uploaded file URL
        const resultKey = fileType === 'image' ? 'optimized' : 'encoded'
        const uploadedFile = completedAssembly.results?.[resultKey]?.[0] || completedAssembly.results?.[':original']?.[0]

        console.log('Result key:', resultKey)
        console.log('Uploaded file URL:', uploadedFile?.ssl_url)

        if (!uploadedFile?.ssl_url) {
            throw new Error('Upload completed but no URL returned')
        }

        return NextResponse.json({
            url: uploadedFile.ssl_url,
            fileName: file.name,
            assemblyId: completedAssembly.assembly_id,
        })

    } catch (error) {
        console.error('Upload error:', error)

        // Clean up temp file if it exists
        if (tempFilePath) {
            try {
                await unlink(tempFilePath)
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        )
    }
}
