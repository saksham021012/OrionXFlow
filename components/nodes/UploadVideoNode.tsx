'use client'

import { memo, useCallback, useRef } from 'react'
import { NodeProps } from 'reactflow'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { Upload, RefreshCw } from 'lucide-react'
import { useTransloadit } from '@/hooks/useTransloadit'

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v'
]

function UploadVideoNode(props: NodeProps<NodeData>) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, uploading } = useTransloadit({
    allowedFileTypes: ALLOWED_VIDEO_TYPES,
    fileType: 'video',
    onSuccess: (result) => {
      updateNodeData(props.id, {
        value: result.url,
        fileName: result.fileName,
        error: undefined,
      })
    },
    onError: (error) => {
      updateNodeData(props.id, { error })
    },
  })

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      await upload(file)
    },
    [upload]
  )

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <BaseNode
      {...props}
      outputs={[{ id: 'video_output', label: 'Video URL', color: 'handle-cyan' }]}
    >
      <div className="space-y-2">
        {/* Hidden file input — triggered by label (empty state) or button (replace state) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.mov,.webm,.m4v"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#404040] rounded-lg">
            <span className="text-sm text-[#a0a0a0]">Uploading...</span>
          </div>
        ) : props.data.value ? (
          <div className="space-y-2">
            {/* Video preview — controls work normally */}
            <div className="w-full h-32 rounded-lg overflow-hidden border border-[#404040]">
              <video
                src={props.data.value}
                controls
                className="w-full h-full rounded object-contain"
              />
            </div>
            {/* Replace button — separate from video so clicks aren't swallowed */}
            <button
              onClick={triggerFileInput}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-[#404040] hover:border-primary bg-[#1a1a1a] hover:bg-[#222] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#a0a0a0]" />
              <span className="text-xs text-[#a0a0a0] font-medium">Replace Video</span>
            </button>
          </div>
        ) : (
          <label
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-[#404040] rounded-lg cursor-pointer hover:border-primary transition-all"
          >
            <Upload className="w-6 h-6 text-[#a0a0a0]" />
            <span className="text-sm text-[#a0a0a0]">Upload Video</span>
          </label>
        )}

        {props.data.error && (
          <div className="text-xs text-red-500 bg-red-500/5 p-2 rounded border border-red-500/20 italic max-h-32 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase not-italic opacity-70 block mb-1">Upload Error</span>
            {props.data.error}
          </div>
        )}
      </div>
    </BaseNode>
  )
}

export default memo(UploadVideoNode)

