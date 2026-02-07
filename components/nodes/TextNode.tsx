'use client'

import { memo, useCallback } from 'react'
import { NodeProps } from 'reactflow'
import { AlertCircle } from 'lucide-react'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'

function TextNode(props: NodeProps<NodeData>) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(props.id, { value: e.target.value })
    },
    [props.id, updateNodeData]
  )

  return (
    <BaseNode
      {...props}
      outputs={[{ id: 'text_output', label: 'Text Output', color: 'handle-green' }]}
    >
      <div>
        <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">Text Content</label>
        <textarea
          value={props.data.value || ''}
          onChange={handleChange}
          placeholder="Enter text..."
          className="w-full min-h-[100px] bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:ring-1 focus:ring-[#404040] resize-none transition-all"
        />
        {props.data.error && (
          <div className="mt-2 text-xs text-red-500 bg-red-500/5 p-2 rounded border border-red-500/20 italic max-h-32 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase not-italic opacity-70 block mb-1">Processing Error</span>
            {props.data.error}
          </div>
        )}
      </div>
    </BaseNode>
  )
}

export default memo(TextNode)
