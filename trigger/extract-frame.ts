import { task } from '@trigger.dev/sdk/v3'
import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export const extractFrameTask = task({
    id: 'extract-frame',
    run: async (payload: {
        videoUrl: string
        timestamp: string | number
    }) => {
        try {
            // Create temp file for output only
            const tempDir = os.tmpdir()
            const outputPath = path.join(tempDir, `frame-${Date.now()}.jpg`)

            // Parse timestamp
            let seekTime: string
            // We need to probe the remote URL for duration if using percentage
            if (typeof payload.timestamp === 'string' && payload.timestamp.includes('%')) {
                // Percentage-based timestamp
                const percentage = parseFloat(payload.timestamp.replace('%', ''))

                // Get video duration from remote URL
                const duration = await new Promise<number>((resolve, reject) => {
                    ffmpeg.ffprobe(payload.videoUrl, (err, metadata) => {
                        if (err) reject(err)
                        else resolve(metadata.format.duration || 0)
                    })
                })

                seekTime = ((duration * percentage) / 100).toFixed(2)
            } else {
                // Seconds-based timestamp
                seekTime = payload.timestamp.toString()
            }

            // Extract frame using FFmpeg directly from URL
            await new Promise<void>((resolve, reject) => {
                ffmpeg(payload.videoUrl)
                    .seekInput(seekTime)
                    .frames(1)
                    .output(outputPath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run()
            })

            // Read extracted frame
            const frameBuffer = await fs.readFile(outputPath)
            const base64 = frameBuffer.toString('base64')
            const dataUrl = `data:image/jpeg;base64,${base64}`

            // Cleanup
            await fs.unlink(outputPath)

            return {
                success: true,
                frameUrl: dataUrl,
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Frame extraction failed',
            }
        }
    },
})
