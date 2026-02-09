import { task } from '@trigger.dev/sdk/v3'
import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { Transloadit } from 'transloadit'

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

            // Upload extracted frame to Transloadit
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
                throw new Error('Transloadit upload failed: No URL returned')
            }

            // Cleanup
            await fs.unlink(outputPath)

            return {
                success: true,
                frameUrl: uploadedFile.ssl_url,
            }
        } catch (error: any) {
            console.error('Extract Frame Error:', error)
            return {
                success: false,
                error: error.message || 'Frame extraction failed',
            }
        }
    },
})
