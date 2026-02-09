import { task } from '@trigger.dev/sdk/v3'
import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { Transloadit } from 'transloadit'

export const cropImageTask = task({
    id: 'crop-image',
    run: async (payload: {
        imageUrl: string
        xPercent: number
        yPercent: number
        widthPercent: number
        heightPercent: number
    }) => {
        try {
            // Download image
            const response = await fetch(payload.imageUrl)
            const buffer = await response.arrayBuffer()

            // Create temp files
            const tempDir = os.tmpdir()
            const inputPath = path.join(tempDir, `input-${Date.now()}.jpg`)
            const outputPath = path.join(tempDir, `output-${Date.now()}.jpg`)

            await fs.writeFile(inputPath, Buffer.from(buffer))

            // Get image dimensions first
            const metadata = await new Promise<{ width: number; height: number }>((resolve, reject) => {
                ffmpeg.ffprobe(inputPath, (err, metadata) => {
                    if (err) reject(err)
                    else {
                        const stream = metadata.streams[0]
                        resolve({ width: stream.width!, height: stream.height! })
                    }
                })
            })

            // Calculate crop dimensions
            const cropX = Math.floor((metadata.width * payload.xPercent) / 100)
            const cropY = Math.floor((metadata.height * payload.yPercent) / 100)
            const cropWidth = Math.floor((metadata.width * payload.widthPercent) / 100)
            const cropHeight = Math.floor((metadata.height * payload.heightPercent) / 100)

            // Crop image using FFmpeg
            await new Promise<void>((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([
                        `-vf crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`
                    ])
                    .output(outputPath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run()
            })

            // Upload cropped image to Transloadit
            const transloadit = new Transloadit({
                authKey: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!,
                authSecret: process.env.TRANSLOADIT_SECRET!,
            })

            const assembly = await transloadit.createAssembly({
                params: {
                    steps: {
                        ':original': {
                            robot: '/upload/handle',
                        }
                    }
                },
                files: {
                    file: outputPath
                }
            })

            const completedAssembly = await transloadit.awaitAssemblyCompletion(assembly.assembly_id!)

            // Try to get file from results first, then fall back to uploads
            const uploadedFile = completedAssembly.results?.[':original']?.[0] || completedAssembly.uploads?.[0]

            if (!uploadedFile?.ssl_url) {
                console.error('Transloadit Response:', JSON.stringify(completedAssembly, null, 2))
                throw new Error('Transloadit upload failed: No URL returned')
            }

            // Cleanup
            await fs.unlink(inputPath)
            await fs.unlink(outputPath)

            return {
                success: true,
                imageUrl: uploadedFile.ssl_url,
            }
        } catch (error: any) {
            console.error('Crop Image Error:', error)
            return {
                success: false,
                error: error.message || 'Image crop failed',
            }
        }
    },
})
