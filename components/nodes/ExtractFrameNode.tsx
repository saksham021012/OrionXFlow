'use client'

import { memo, useCallback, useEffect, useRef } from 'react'
import { NodeProps } from 'reactflow'
import { Play, Loader2, AlertCircle } from 'lucide-react'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution'

function ExtractFrameNode(props: NodeProps<NodeData>) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  const { executing, handleRunSingleNode } = useWorkflowExecution()
  
  const isHandleConnected = useCallback((handleId: string) => {
    return edges.some(edge => edge.target === props.id && edge.targetHandle === handleId)
  }, [edges, props.id])

  const isRunning = props.data.status === 'running'

  const prevConnectedRef = useRef<Set<string>>(new Set())

  // Reactive input syncing
  useEffect(() => {
    const findConnectedValue = (handleId: string) => {
        const edge = edges.find(e => e.target === props.id && e.targetHandle === handleId)
        if (!edge) return null
        const sourceNode = nodes.find(n => n.id === edge.source)
        return sourceNode?.data.result || sourceNode?.data.value || null
    }

    const updates: Partial<NodeData> = {}
    const currentlyConnected = new Set<string>()
    
    const connTimestamp = findConnectedValue('timestamp')
    if (connTimestamp !== null) {
        currentlyConnected.add('timestamp')
        const stringVal = String(connTimestamp)
        if (props.data.timestamp !== stringVal) {
            updates.timestamp = stringVal
        }
    } else if (prevConnectedRef.current.has('timestamp')) {
        // Disconnected
        updates.timestamp = '50%'
    }

    prevConnectedRef.current = currentlyConnected

    if (Object.keys(updates).length > 0) {
        updateNodeData(props.id, updates)
    }
  }, [edges, nodes, props.id, props.data.timestamp, updateNodeData])

  const handleRun = () => {
    handleRunSingleNode(props.id)
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(props.id, { timestamp: e.target.value })
    },
    [props.id, updateNodeData]
  )

  return (
    <BaseNode
      {...props}
      inputs={[
        { id: 'video_url', label: 'Video URL', color: 'handle-cyan' },
        { id: 'timestamp', label: 'Timestamp', color: 'handle-orange' },
      ]}
      outputs={[{ id: 'image_output', label: 'Frame Image', color: 'handle-cyan' }]}
    >
      <div className="space-y-4">
        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={executing || isRunning}
          className={`
            w-full h-8 rounded bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] flex items-center justify-center gap-2 transition-all
            ${isRunning || executing ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:border-primary/50'}
          `}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-primary" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isRunning ? 'Extracting...' : 'Run Extraction'}
          </span>
        </button>

        <div>
          <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">Timestamp</label>
          <input
            type="text"
            value={props.data.timestamp || '50%'}
            onChange={handleChange}
            disabled={isHandleConnected('timestamp')}
            placeholder="e.g., 10 or 50%"
            className={`w-full bg-[#1a1a1a] border border-[#404040] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isHandleConnected('timestamp') ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter seconds (e.g., 10) or percentage (e.g., 50%)
          </p>
        </div>

        {props.data.error ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-md p-3 max-h-40 overflow-y-auto">
            <p className="text-[10px] text-red-500 mb-1 font-bold uppercase opacity-70 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              Execution Error
            </p>
            <p className="text-sm text-red-500 italic whitespace-pre-wrap">
              {props.data.error}
            </p>
          </div>
        ) : props.data.result?.frameUrl ? (
          <div className="bg-[#0a0a0a] border border-success/30 rounded-md p-3">
            <p className="text-xs text-success mb-2 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
              Extracted Frame
            </p>
            <img 
              src={props.data.result.frameUrl} 
              alt="Extracted frame" 
              className="w-full h-auto rounded border border-[#2a2a2a]"
            />
          </div>
        ) : null}
      </div>
    </BaseNode>
  )
}

export default memo(ExtractFrameNode)
