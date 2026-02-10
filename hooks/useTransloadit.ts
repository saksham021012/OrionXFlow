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
                // Create FormData for server-side upload
                const formData = new FormData()
                formData.append('file', file)
                formData.append('fileType', fileType)

                // Upload via server-side API route
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Upload failed')
                }

                const uploadResult: TransloaditUploadResult = await response.json()

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
