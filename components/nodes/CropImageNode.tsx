'use client'

import { memo, useCallback, useMemo, useEffect, useState, useRef } from 'react'
import { NodeProps } from 'reactflow'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { Play, Loader2, RotateCcw, AlertCircle } from 'lucide-react'
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution'

function CropImageNode(props: NodeProps<NodeData>) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  const { executing, handleRunSingleNode } = useWorkflowExecution()
  const [imageUrl, setImageUrl] = useState<string>('')
  const [selectedRatio, setSelectedRatio] = useState<string>('Custom')

  const isHandleConnected = useCallback((handleId: string) => {
    return edges.some(edge => edge.target === props.id && edge.targetHandle === handleId)
  }, [edges, props.id])

  const isRunning = props.data.status === 'running'

  const handleRun = () => {
    handleRunSingleNode(props.id)
  }

  const prevConnectedRef = useRef<Set<string>>(new Set())

  // Reactive input syncing (Real-time Preview)
  useEffect(() => {
    const findConnectedValue = (handleId: string) => {
        const edge = edges.find(e => e.target === props.id && e.targetHandle === handleId)
        if (!edge) return null
        const sourceNode = nodes.find(n => n.id === edge.source)
        return sourceNode?.data.result || sourceNode?.data.value || null
    }

    // 1. Sync Image URL
    const connImageUrl = findConnectedValue('image_url')
    if (connImageUrl && typeof connImageUrl === 'string' && connImageUrl !== imageUrl) {
        setImageUrl(connImageUrl)
    }

    // 2. Sync Parameters (only if connected)
    const updates: Partial<NodeData> = {}
    const params = ['x_percent', 'y_percent', 'width_percent', 'height_percent'] as const
    const currentlyConnected = new Set<string>()
    
    params.forEach(param => {
        const val = findConnectedValue(param)
        if (val !== null) {
            currentlyConnected.add(param)
            const numVal = parseFloat(val)
            if (!isNaN(numVal) && Number(props.data[param]) !== numVal) {
                updates[param] = numVal
            }
        } else if (prevConnectedRef.current.has(param)) {
            // It was connected, now it's not -> Reset to 0/100
            updates[param] = param.includes('width') || param.includes('height') ? 100 : 0
        }
    })

    // Update ref for next run
    prevConnectedRef.current = currentlyConnected

    if (Object.keys(updates).length > 0) {
        updateNodeData(props.id, updates)
    }
  }, [
    edges, 
    nodes, 
    props.id, 
    props.data.x_percent, 
    props.data.y_percent, 
    props.data.width_percent, 
    props.data.height_percent, 
    updateNodeData
  ])

  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0
      updateNodeData(props.id, { [field]: Math.max(0, Math.min(100, value)) })
      setSelectedRatio('Custom') // Reset to custom when manually changing
    },
    [props.id, updateNodeData]
  )

  const handleReset = useCallback(() => {
    updateNodeData(props.id, {
      x_percent: 0,
      y_percent: 0,
      width_percent: 100,
      height_percent: 100,
    })
    setSelectedRatio('Custom')
  }, [props.id, updateNodeData])

  // Aspect ratio presets
  const applyAspectRatio = useCallback((ratio: string) => {
    if (!ratio) return
    
    setSelectedRatio(ratio)
    
    switch (ratio) {
      case '1:1': // Square
        updateNodeData(props.id, { width_percent: 50, height_percent: 50 })
        break
      case '16:9': // Landscape
        updateNodeData(props.id, { width_percent: 80, height_percent: 45 })
        break
      case '4:3': // Classic
        updateNodeData(props.id, { width_percent: 80, height_percent: 60 })
        break
      case '9:16': // Portrait
        updateNodeData(props.id, { width_percent: 45, height_percent: 80 })
        break
      case '3:4': // Portrait Classic
        updateNodeData(props.id, { width_percent: 60, height_percent: 80 })
        break
    }
  }, [props.id, updateNodeData])

  // Calculate aspect ratio
  const aspectRatio = useMemo(() => {
    const width = props.data.width_percent || 100
    const height = props.data.height_percent || 100
    const ratio = width / height
    return ratio.toFixed(2)
  }, [props.data.width_percent, props.data.height_percent])

  // Calculate dimensions for display
  const dimensions = useMemo(() => {
    const width = props.data.width_percent || 100
    const height = props.data.height_percent || 100
    // Assuming a base size for display purposes
    return {
      width: Math.round((width / 100) * 1024),
      height: Math.round((height / 100) * 1024),
    }
  }, [props.data.width_percent, props.data.height_percent])

  const handleDimensionChange = useCallback(
    (field: 'width' | 'height') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0
      const percent = (value / 1024) * 100
      const fieldName = field === 'width' ? 'width_percent' : 'height_percent'
      updateNodeData(props.id, { [fieldName]: Math.max(0, Math.min(100, percent)) })
      setSelectedRatio('Custom') // Reset to custom when manually changing
    },
    [props.id, updateNodeData]
  )

  return (
    <BaseNode
      {...props}
      inputs={[
        { id: 'image_url', label: 'Image URL', color: 'handle-cyan' },
        { id: 'x_percent', label: 'X %', color: 'handle-orange' },
        { id: 'y_percent', label: 'Y %', color: 'handle-orange' },
        { id: 'width_percent', label: 'Width %', color: 'handle-orange' },
        { id: 'height_percent', label: 'Height %', color: 'handle-orange' },
      ]}
      outputs={[{ id: 'image_output', label: 'Cropped Image', color: 'handle-cyan' }]}
    >
      <div className="space-y-3">
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
            {isRunning ? 'Cropping...' : 'Run Crop'}
          </span>
        </button>
        
        {/* Title */}
        

        {/* Image Preview with Crop Grid Overlay */}
        {imageUrl && (
          <div className="relative w-full aspect-square bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#2a2a2a]">
            <img
              src={imageUrl}
              alt="Crop preview"
              className="w-full h-full object-cover"
            />
            {/* Grid Overlay - 3x3 dotted grid */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical lines */}
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-dotted border-white/40"></div>
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-dotted border-white/40"></div>
              {/* Horizontal lines */}
              <div className="absolute top-1/3 left-0 right-0 border-t border-dotted border-white/40"></div>
              <div className="absolute top-2/3 left-0 right-0 border-t border-dotted border-white/40"></div>
            </div>
            
            {/* Crop Selection Box */}
            <div
              className="absolute border-2 border-white/80"
              style={{
                left: `${props.data.x_percent || 0}%`,
                top: `${props.data.y_percent || 0}%`,
                width: `${props.data.width_percent || 100}%`,
                height: `${props.data.height_percent || 100}%`,
              }}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
              
              {/* Edge handles */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-[#0a0a0a]"></div>
            </div>
          </div>
        )}

        {/* Percentage Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">X (%)</label>
            <input
              type="text"
              value={props.data.x_percent || 0}
              onChange={handleChange('x_percent')}
              disabled={isHandleConnected('x_percent')}
              placeholder={isHandleConnected('x_percent') ? 'Auto' : ''}
              className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all ${isHandleConnected('x_percent') ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">Y (%)</label>
            <input
              type="text"
              value={props.data.y_percent || 0}
              onChange={handleChange('y_percent')}
              disabled={isHandleConnected('y_percent')}
              placeholder={isHandleConnected('y_percent') ? 'Auto' : ''}
              className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all ${isHandleConnected('y_percent') ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">Width (%)</label>
            <input
              type="text"
              value={props.data.width_percent || 100}
              onChange={handleChange('width_percent')}
              disabled={isHandleConnected('width_percent')}
              placeholder={isHandleConnected('width_percent') ? 'Auto' : ''}
              className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all ${isHandleConnected('width_percent') ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">Height (%)</label>
            <input
              type="text"
              value={props.data.height_percent || 100}
              onChange={handleChange('height_percent')}
              disabled={isHandleConnected('height_percent')}
              placeholder={isHandleConnected('height_percent') ? 'Auto' : ''}
              className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all ${isHandleConnected('height_percent') ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
        
        {/* Aspect Ratio and Reset */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-[#a0a0a0] mb-1.5 block">Aspect ratio</label>
            <select
              value={selectedRatio}
              onChange={(e) => applyAspectRatio(e.target.value)}
              disabled={isHandleConnected('width_percent') || isHandleConnected('height_percent')}
              className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all ${(isHandleConnected('width_percent') || isHandleConnected('height_percent')) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="Custom">Custom</option>
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="9:16">9:16</option>
              <option value="3:4">3:4</option>
            </select>
          </div>
          <button
            onClick={handleReset}
            disabled={isHandleConnected('width_percent') || isHandleConnected('height_percent') || isHandleConnected('x_percent') || isHandleConnected('y_percent')}
            className={`px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] rounded-md text-sm text-white transition-all ${(isHandleConnected('width_percent') || isHandleConnected('height_percent') || isHandleConnected('x_percent') || isHandleConnected('y_percent')) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Reset
          </button>
        </div>

        {/* Dimensions */}
        <div>
          <label className="text-xs text-[#a0a0a0] mb-1.5 block">Dimensions</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-[#6b6b6b] min-w-[12px]">W</span>
              <input
                type="text"
                value={dimensions.width}
                onChange={handleDimensionChange('width')}
                disabled={isHandleConnected('width_percent')}
                placeholder={isHandleConnected('width_percent') ? 'Auto' : ''}
                className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all ${isHandleConnected('width_percent') ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-[#6b6b6b] min-w-[12px]">H</span>
              <input
                type="text"
                value={dimensions.height}
                onChange={handleDimensionChange('height')}
                disabled={isHandleConnected('height_percent')}
                placeholder={isHandleConnected('height_percent') ? 'Auto' : ''}
                className={`w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all ${isHandleConnected('height_percent') ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            <button className="p-2 hover:bg-[#1a1a1a] rounded transition-colors flex-shrink-0" title="Link dimensions">
              <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </div>
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
        ) : props.data.result?.imageUrl ? (
          <div className="bg-[#0a0a0a] border border-success/30 rounded-md p-3">
            <p className="text-xs text-success mb-2 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
              Cropped Image
            </p>
            <img 
              src={props.data.result.imageUrl} 
              alt="Cropped image" 
              className="w-full h-auto rounded border border-[#2a2a2a]"
            />
          </div>
        ) : null}
      </div>
    </BaseNode>
  )
}

export default memo(CropImageNode)
