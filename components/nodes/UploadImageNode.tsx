'use client'

import { memo, useCallback } from 'react'
import { NodeProps } from 'reactflow'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { Upload, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useTransloadit } from '@/hooks/useTransloadit'

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

function UploadImageNode(props: NodeProps<NodeData>) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

  const { upload, uploading } = useTransloadit({
    allowedFileTypes: ALLOWED_IMAGE_TYPES,
    fileType: 'image',
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

  return (
    <BaseNode
      {...props}
      outputs={[{ id: 'image_output', label: 'Image URL', color: 'handle-cyan' }]}
    >
      <div className="space-y-2">
        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#404040] rounded-lg cursor-pointer hover:border-primary transition-all">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <span className="text-sm text-[#a0a0a0]">Uploading...</span>
          ) : props.data.value ? (
            <div className="relative w-full h-full p-2">
              <Image
                src={props.data.value}
                alt="Uploaded"
                fill
                className="object-contain rounded"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-[#a0a0a0]" />
              <span className="text-sm text-[#a0a0a0]">Upload Image</span>
            </div>
          )}
        </label>
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

export default memo(UploadImageNode)
