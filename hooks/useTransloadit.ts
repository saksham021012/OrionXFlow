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

const PENDING_STATUSES = ['ASSEMBLY_UPLOADING', 'ASSEMBLY_EXECUTING', 'ASSEMBLY_REPLAYING']
const MAX_POLL_ATTEMPTS = 60 // ~2 minutes with 2s delay

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
                // 1. Get signature from our API
                const sigResponse = await fetch('/api/transloadit-signature', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileType }),
                })

                if (!sigResponse.ok) {
                    const errorData = await sigResponse.json()
                    throw new Error(errorData.error || 'Failed to get upload signature')
                }

                const { params, signature } = await sigResponse.json()

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
                    const errorData = await uploadResponse.json()
                    throw new Error(errorData.message || 'Upload to Transloadit failed')
                }

                // 3. Poll until assembly completes or times out
                let assemblyData = await uploadResponse.json()
                let attempts = 0

                while (PENDING_STATUSES.includes(assemblyData.ok) && attempts < MAX_POLL_ATTEMPTS) {
                    attempts++
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    const pollResponse = await fetch(assemblyData.assembly_ssl_url)
                    if (!pollResponse.ok) break
                    assemblyData = await pollResponse.json()
                }

                if (attempts >= MAX_POLL_ATTEMPTS) {
                    throw new Error('Upload timed out after 2 minutes')
                }

                if (assemblyData.ok !== 'ASSEMBLY_COMPLETED') {
                    throw new Error(assemblyData.message || 'Assembly failed to complete')
                }

                // 4. Extract results
                const resultKey = fileType === 'image' ? 'optimized' : 'encoded'
                const uploadedFile = assemblyData.results?.[resultKey]?.[0] || assemblyData.results?.[':original']?.[0]

                if (!uploadedFile?.ssl_url) {
                    throw new Error('Upload completed but no URL returned')
                }

                const uploadResult: TransloaditUploadResult = {
                    url: uploadedFile.ssl_url,
                    fileName: file.name
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