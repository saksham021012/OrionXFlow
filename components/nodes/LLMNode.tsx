'use client'

import { memo, useCallback, useState } from 'react'
import { NodeProps } from 'reactflow'
import { Play, Loader2, Plus, AlertCircle } from 'lucide-react'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3-flash-preview',
]

function LLMNode(props: NodeProps<NodeData>) {
  const [isRunning, setIsRunning] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const imageInputCount = props.data.imageInputCount || 1
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

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

  const handleRunModel = async () => {
    setIsRunning(true)
    try {
      // Longer delay to ensure any pending state updates are flushed
      await new Promise(resolve => setTimeout(resolve, 300))
      
      let workflowId = useWorkflowStore.getState().workflowId
      const { nodes, edges, workflowName } = useWorkflowStore.getState()
      
      // Log current node data for debugging
      const currentNode = nodes.find(n => n.id === props.id)
      console.log('Running node:', props.id, 'with data:', currentNode?.data)
      
      // Auto-save workflow if not already saved or if ID is 'new'
      if (!workflowId || workflowId === 'new') {
        console.log('Creating new workflow...')
        const saveResponse = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes, edges }),
        })
        
        if (saveResponse.ok) {
          const workflow = await saveResponse.json()
          workflowId = workflow.id
          useWorkflowStore.getState().setWorkflowId(workflow.id)
          console.log('Workflow created:', workflowId)
        } else {
          throw new Error('Failed to save workflow')
        }
      } else {
        // Update existing workflow with latest state
        console.log('Updating existing workflow:', workflowId)
        const currentNodes = useWorkflowStore.getState().nodes
        const currentEdges = useWorkflowStore.getState().edges
        const currentName = useWorkflowStore.getState().workflowName

        const updateResponse = await fetch(`/api/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: currentName, nodes: currentNodes, edges: currentEdges }),
        })
        
        if (!updateResponse.ok) {
          console.error('Failed to update workflow')
        } else {
          console.log('Workflow updated successfully')
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      // Execute the node
      console.log('Executing node:', props.id)
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          executionType: 'single',
          selectedNodeIds: [props.id]
        }),
      })
      
      if (!response.ok) {
        const error = await response.text()
        console.error('Execution failed:', error)
        throw new Error('Execution failed')
      }

      const { runId: newRunId } = await response.json()
      console.log('Execution started successfully:', newRunId)
      
      setRunId(newRunId)
      useWorkflowStore.getState().setLastRunId(newRunId)

      // Poll for completion
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const runResponse = await fetch(`/api/workflow-runs/${newRunId}`)
        if (!runResponse.ok) continue
        
        const run = await runResponse.json()
        
        // Sync status of all nodes involved in this run
        if (run.nodeExecutions) {
            run.nodeExecutions.forEach((exec: any) => {
                 useWorkflowStore.getState().updateNodeData(exec.nodeId, {
                     status: exec.status,
                     error: exec.error,
                     // Update result if completed
                     result: exec.status === 'completed' && exec.outputs ? exec.outputs : undefined
                 })
            })
        }
        
        if (run.status === 'completed') {
          // Execution finished successfully, fetch full workflow to be safe
          const workflowResponse = await fetch(`/api/workflows/${workflowId}`)
          if (workflowResponse.ok) {
              const workflow = await workflowResponse.json()
              if (workflow.nodes) {
                  useWorkflowStore.getState().setNodes(workflow.nodes)
              }
          }
          break
        } else if (run.status === 'failed' || run.status === 'cancelled') {
          break
        }
      }
    } catch (error: any) {
      console.error('Error running model:', error)
      updateNodeData(props.id, { error: error.message, status: 'failed' })
    } finally {
      setIsRunning(false)
      setIsStopping(false)
      setRunId(null)
    }
  }

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!runId) return

    setIsStopping(true)
    try {
        await fetch(`/api/workflow-runs/${runId}/cancel`, { method: 'POST' })
    } catch (error) {
        console.error('Failed to stop run:', error)
        setIsStopping(false)
    }
  }

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
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all"
          >
            {GEMINI_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Output Display Area */}
        <div className={`bg-[#0a0a0a] border ${props.data.error ? 'border-red-500/50 bg-red-500/5' : 'border-[#2a2a2a]'} rounded-md p-4 min-h-[320px] max-h-[400px] flex flex-col relative group transition-all`}>
          {isRunning || props.data.status === 'running' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : props.data.error ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-1">
                <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Execution Error</span>
                <p className="text-[10px] text-red-500/80 font-medium">Please check the history sidebar<br/>for detailed error logs</p>
              </div>
            </div>
          ) : props.data.result ? (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                {props.data.result}
              </p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              <p className="text-sm font-medium">The generated text will appear here</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => updateNodeData(props.id, { imageInputCount: imageInputCount + 1 })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a] rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another image input
            </button>

            <button
              onClick={isRunning ? handleStop : handleRunModel}
              disabled={isStopping || (!isRunning && (!props.data.result && !props.data.value && false))} // Always allow run
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${isRunning 
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50' 
                    : 'bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] text-white'}
                ${isStopping ? 'opacity-70 cursor-not-allowed' : ''}
                `}
            >
              {isStopping ? (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Stopping...
                </>
              ) : isRunning ? (
                <>
                    <div className="w-2 h-2 bg-red-500 rounded-sm" />
                    Stop
                </>
              ) : (
                <>
                    <Play className="w-3.5 h-3.5" />
                    Run Model
                </>
              )}
            </button>
        </div>
      </div>
    </BaseNode>
  )
}

export default memo(LLMNode)
