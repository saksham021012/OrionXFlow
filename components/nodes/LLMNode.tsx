'use client'

import { memo, useCallback } from 'react'
import { NodeProps } from 'reactflow'
import { Plus } from 'lucide-react'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution'
import { OutputDisplay, RunButton, GEMINI_MODELS, SELECT_CLASS } from './Helpers/LLMNodeHelpers'

function LLMNode(props: NodeProps<NodeData>) {
  const imageInputCount = props.data.imageInputCount || 1
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)
  const { executing, handleRunSingleNode } = useWorkflowExecution()

  const inputs = [
    { id: 'system_prompt', label: 'System Prompt', color: 'handle-purple' },
    { id: 'user_message', label: 'User Message', color: 'handle-green' },
    ...Array.from({ length: imageInputCount }).map((_, i) => ({
      id: `image_${i + 1}`,
      label: `Image/Video ${i + 1}`,
      color: 'handle-cyan'
    }))
  ]

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateNodeData(props.id, { model: e.target.value })
    },
    [props.id, updateNodeData]
  )

  const handleRunModel = useCallback(() => {
    handleRunSingleNode(props.id)
  }, [props.id, handleRunSingleNode])


  return (
    <BaseNode
      {...props}
      inputs={inputs}
      outputs={[{ id: 'text_output', label: 'LLM Response', color: 'handle-cyan' }]}
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">Model</label>
          <select
            value={props.data.model || GEMINI_MODELS[0]}
            onChange={handleModelChange}
            className={SELECT_CLASS}
          >
            {GEMINI_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <OutputDisplay
          isRunning={executing}
          status={props.data.status}
          error={props.data.error}
          result={props.data.result}
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => updateNodeData(props.id, { imageInputCount: imageInputCount + 1 })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a] rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add another image input
          </button>

          <RunButton
            isRunning={executing}
            status={props.data.status}
            onRun={handleRunModel}
          />
        </div>
      </div>
    </BaseNode>
  )
}

export default memo(LLMNode)