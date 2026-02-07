import { task } from '@trigger.dev/sdk/v3'
import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

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

            // Read cropped image
            const croppedBuffer = await fs.readFile(outputPath)
            const base64 = croppedBuffer.toString('base64')
            const dataUrl = `data:image/jpeg;base64,${base64}`

            // Cleanup
            await fs.unlink(inputPath)
            await fs.unlink(outputPath)

            return {
                success: true,
                result: dataUrl,
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Image crop failed',
            }
        }
    },
})
