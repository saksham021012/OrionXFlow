'use client'

import { memo, useCallback, useState, useEffect, useRef } from 'react' // ADDED useEffect, useRef
import { NodeProps } from 'reactflow'
import { Plus } from 'lucide-react'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { OutputDisplay, RunButton, GEMINI_MODELS, SELECT_CLASS } from './Helpers/LLMNodeHelpers'

const JSON_HEADERS = { 'Content-Type': 'application/json' }
const DELAYS = {
  STATE_FLUSH: 300,
  WORKFLOW_UPDATE: 500,
  POLLING_INTERVAL: 1000
}

function LLMNode(props: NodeProps<NodeData>) {
  const [isRunning, setIsRunning] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const isMountedRef = useRef(true) // ADDED: Track if component is mounted
  const imageInputCount = props.data.imageInputCount || 1
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

  // ADDED: Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

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

  // Helper: Ensure workflow is saved (create or update)
  const ensureWorkflowSaved = async () => {
    const store = useWorkflowStore.getState()
    let workflowId = store.workflowId
    const { nodes, edges, workflowName } = store

    if (!workflowId || workflowId === 'new') {
      console.log('Creating new workflow...')
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ name: workflowName, nodes, edges }),
      })
      
      if (!response.ok) throw new Error('Failed to save workflow')
      
      const workflow = await response.json()
      useWorkflowStore.getState().setWorkflowId(workflow.id)
      console.log('Workflow created:', workflow.id)
      return workflow.id
    }

    console.log('Updating existing workflow:', workflowId)
    const { nodes: currentNodes, edges: currentEdges, workflowName: currentName } = useWorkflowStore.getState()
    
    const response = await fetch(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: currentName, nodes: currentNodes, edges: currentEdges }),
    })
    
    if (response.ok) {
      console.log('Workflow updated successfully')
      await new Promise(resolve => setTimeout(resolve, DELAYS.WORKFLOW_UPDATE))
    } else {
      console.error('Failed to update workflow')
    }
    
    return workflowId
  }

  // Helper: Execute a single node
  const executeWorkflowNode = async (workflowId: string, nodeId: string) => {
    console.log('Executing node:', nodeId)
    const response = await fetch(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ 
        executionType: 'single',
        selectedNodeIds: [nodeId]
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Execution failed:', error)
      throw new Error('Execution failed')
    }

    const { runId } = await response.json()
    console.log('Execution started successfully:', runId)
    return runId
  }

  // Helper: Poll for execution completion
  const pollForCompletion = async (runId: string, workflowId: string) => {
    while (isMountedRef.current) { // CHANGED: was "while (true)"
      await new Promise(resolve => setTimeout(resolve, DELAYS.POLLING_INTERVAL))
      
      // ADDED: Check if component is still mounted before continuing
      if (!isMountedRef.current) break
      
      const response = await fetch(`/api/workflow-runs/${runId}`)
      if (!response.ok) continue
      
      const run = await response.json()
      
      if (run.nodeExecutions) {
        const storeUpdate = useWorkflowStore.getState().updateNodeData
        run.nodeExecutions.forEach((exec: any) => {
          storeUpdate(exec.nodeId, {
            status: exec.status,
            error: exec.error,
            result: exec.status === 'completed' && exec.outputs ? exec.outputs : undefined
          })
        })
      }
      
      if (run.status === 'completed') {
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
  }

  const handleRunModel = async () => {
    if (isRunning) return // ADDED: Prevent double-click execution
    
    setIsRunning(true)
    try {
      // Small delay to ensure React state updates are flushed before API call
      await new Promise(resolve => setTimeout(resolve, DELAYS.STATE_FLUSH))
      
      const currentNode = useWorkflowStore.getState().nodes.find(n => n.id === props.id)
      console.log('Running node:', props.id, 'with data:', currentNode?.data)
      
      const workflowId = await ensureWorkflowSaved()
      const newRunId = await executeWorkflowNode(workflowId, props.id)
      
      setRunId(newRunId)
      useWorkflowStore.getState().setLastRunId(newRunId)
      
      await pollForCompletion(newRunId, workflowId)
    } catch (error: any) {
      console.error('Error running model:', error)
      updateNodeData(props.id, { 
        error: error.message || 'Failed to run model. Please try again.', // IMPROVED: Better error message
        status: 'failed' 
      })
    } finally {
      // ADDED: Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsRunning(false)
        setIsStopping(false)
        setRunId(null)
      }
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
      if (isMountedRef.current) { // ADDED: Check before updating state
        setIsStopping(false)
      }
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
          isRunning={isRunning} 
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
              isRunning={isRunning} 
              isStopping={isStopping} 
              onRun={handleRunModel} 
              onStop={handleStop} 
            />
        </div>
      </div>
    </BaseNode>
  )
}

export default memo(LLMNode)