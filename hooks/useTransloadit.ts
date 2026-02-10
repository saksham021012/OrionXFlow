import { useState, useCallback } from 'react'

export interface TransloaditUploadResult {
    url: string
    fileName: string
}

export interface UseTransloaditOptions {
    allowedFileTypes: string[]
    fileType: 'image' | 'video'
    onSuccess?: (result: TransloaditUploadResult) => void
    onError?: (error: string) => void
}

export interface UseTransloaditReturn {
    upload: (file: File) => Promise<void>
    uploading: boolean
    error: string | null
    result: TransloaditUploadResult | null
    reset: () => void
}

/**
 * Custom hook to handle Transloadit file uploads via server-side API
 * Centralizes upload logic and state management
 */
export function useTransloadit(options: UseTransloaditOptions): UseTransloaditReturn {
    const { allowedFileTypes, fileType, onSuccess, onError } = options

    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<TransloaditUploadResult | null>(null)

    const reset = useCallback(() => {
        setUploading(false)
        setError(null)
        setResult(null)
    }, [])

    const upload = useCallback(
        async (file: File) => {
            // Validate file type
            if (!allowedFileTypes.includes(file.type)) {
                const errorMsg = `Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`
                setError(errorMsg)
                onError?.(errorMsg)
                return
            }

            setUploading(true)
            setError(null)

            try {
                // 1. Get signature and params from our server
                const signResponse = await fetch('/api/upload/sign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileType }),
                })

                if (!signResponse.ok) {
                    const signError = await signResponse.json()
                    throw new Error(signError.error || 'Failed to get upload signature')
                }

                const { params, signature } = await signResponse.json()

                // 2. Upload directly to Transloadit
                const formData = new FormData()
                formData.append('params', params)
                formData.append('signature', signature)
                formData.append('file', file)

                const uploadResponse = await fetch('https://api2.transloadit.com/assemblies', {
                    method: 'POST',
                    body: formData,
                })

                if (!uploadResponse.ok) {
                    const uploadError = await uploadResponse.json()
                    throw new Error(uploadError.message || 'Upload to Transloadit failed')
                }

                const assembly = await uploadResponse.json()
                let statusUrl = assembly.status_url

                // 3. Poll for completion
                let completed = false
                let resultUrl = ''

                while (!completed) {
                    const statusResponse = await fetch(statusUrl)
                    const statusData = await statusResponse.json()

                    if (statusData.ok === 'ASSEMBLY_COMPLETED') {
                        const resultKey = fileType === 'image' ? 'optimized' : 'encoded'
                        resultUrl = statusData.results?.[resultKey]?.[0]?.ssl_url || statusData.results?.[':original']?.[0]?.ssl_url
                        completed = true
                    } else if (statusData.error || statusData.ok === 'ASSEMBLY_ERROR') {
                        throw new Error(statusData.message || 'Processing failed')
                    } else {
                        // Wait 1 second before polling again
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }
                }

                if (!resultUrl) {
                    throw new Error('Upload completed but no URL returned')
                }

                const uploadResult: TransloaditUploadResult = {
                    url: resultUrl,
                    fileName: file.name,
                }

                setResult(uploadResult)
                onSuccess?.(uploadResult)
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Upload failed'
                setError(errorMsg)
                onError?.(errorMsg)
            } finally {
                setUploading(false)
            }
        },
        [allowedFileTypes, fileType, onSuccess, onError]
    )

    return {
        upload,
        uploading,
        error,
        result,
        reset,
    }
}
