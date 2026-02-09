'use client'

import { memo, useCallback, useMemo, useEffect, useState, useRef } from 'react'
import { NodeProps } from 'reactflow'
import BaseNode from './BaseNode'
import { NodeData } from '@/store/workflowStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { Play, Loader2 } from 'lucide-react'
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution'
import { ParamInput, CropOverlay, ASPECT_RATIOS, INPUT_BASE_CLASS } from './Helpers/CropImageHelpers'

function CropImageNode(props: NodeProps<NodeData>) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  const { executing, handleRunSingleNode } = useWorkflowExecution()
  const [imageUrl, setImageUrl] = useState<string>('')
  const [selectedRatio, setSelectedRatio] = useState<string>('Custom')
  const prevConnectedRef = useRef<Set<string>>(new Set())

  const isHandleConnected = useCallback((handleId: string) =>
    edges.some(edge => edge.target === props.id && edge.targetHandle === handleId),
    [edges, props.id]
  )

  const isRunning = props.data.status === 'running'

  useEffect(() => {
    const findConnectedValue = (handleId: string) => {
      const edge = edges.find(e => e.target === props.id && e.targetHandle === handleId)
      if (!edge) return null
      const sourceNode = nodes.find(n => n.id === edge.source)
      return sourceNode?.data.result || sourceNode?.data.value || null
    }

    const connImageUrl = findConnectedValue('image_url')
    if (connImageUrl && typeof connImageUrl === 'string' && connImageUrl !== imageUrl) {
      setImageUrl(connImageUrl)
    }

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
        updates[param] = param.includes('width') || param.includes('height') ? 100 : 0
      }
    })

    prevConnectedRef.current = currentlyConnected
    if (Object.keys(updates).length > 0) {
      updateNodeData(props.id, updates)
    }
  }, [edges, nodes, props.id, props.data.x_percent, props.data.y_percent, props.data.width_percent, props.data.height_percent, updateNodeData, imageUrl])

  const handleChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    updateNodeData(props.id, { [field]: Math.max(0, Math.min(100, value)) })
    setSelectedRatio('Custom')
  }, [props.id, updateNodeData])

  const handleReset = useCallback(() => {
    updateNodeData(props.id, { x_percent: 0, y_percent: 0, width_percent: 100, height_percent: 100 })
    setSelectedRatio('Custom')
  }, [props.id, updateNodeData])

  const applyAspectRatio = useCallback((ratio: string) => {
    if (!ratio || ratio === 'Custom') return
    setSelectedRatio(ratio)
    const preset = ASPECT_RATIOS[ratio]
    if (preset) updateNodeData(props.id, preset)
  }, [props.id, updateNodeData])

  const dimensions = useMemo(() => ({
    width: Math.round(((props.data.width_percent || 100) / 100) * 1024),
    height: Math.round(((props.data.height_percent || 100) / 100) * 1024),
  }), [props.data.width_percent, props.data.height_percent])

  const handleDimensionChange = useCallback((field: 'width' | 'height') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    const percent = (value / 1024) * 100
    const fieldName = field === 'width' ? 'width_percent' : 'height_percent'
    updateNodeData(props.id, { [fieldName]: Math.max(0, Math.min(100, percent)) })
    setSelectedRatio('Custom')
  }, [props.id, updateNodeData])

  const paramInputs = [
    { label: 'X (%)', field: 'x_percent', value: props.data.x_percent || 0 },
    { label: 'Y (%)', field: 'y_percent', value: props.data.y_percent || 0 },
    { label: 'Width (%)', field: 'width_percent', value: props.data.width_percent || 100 },
    { label: 'Height (%)', field: 'height_percent', value: props.data.height_percent || 100 },
  ]

  const isAnyConnected = ['width_percent', 'height_percent', 'x_percent', 'y_percent'].some(isHandleConnected)

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
        <button onClick={() => handleRunSingleNode(props.id)} disabled={executing || isRunning}
          className={`w-full h-8 rounded bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] flex items-center justify-center gap-2 transition-all ${isRunning || executing ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:border-primary/50'}`}>
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-primary" />}
          <span className="text-xs font-semibold uppercase tracking-wider">{isRunning ? 'Cropping...' : 'Run Crop'}</span>
        </button>

        {imageUrl && <CropOverlay imageUrl={imageUrl} x={props.data.x_percent || 0} y={props.data.y_percent || 0}
          w={props.data.width_percent || 100} h={props.data.height_percent || 100} />}

        <div className="grid grid-cols-2 gap-3">
          {paramInputs.map(({ label, field, value }) => (
            <ParamInput key={field} label={label} value={value} onChange={handleChange(field)} disabled={isHandleConnected(field)} />
          ))}
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-[#a0a0a0] mb-1.5 block">Aspect ratio</label>
            <select value={selectedRatio} onChange={(e) => applyAspectRatio(e.target.value)}
              disabled={isHandleConnected('width_percent') || isHandleConnected('height_percent')}
              className={`${INPUT_BASE_CLASS} ${(isHandleConnected('width_percent') || isHandleConnected('height_percent')) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <option value="Custom">Custom</option>
              {Object.keys(ASPECT_RATIOS).map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
            </select>
          </div>
          <button onClick={handleReset} disabled={isAnyConnected}
            className={`px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] rounded-md text-sm text-white transition-all ${isAnyConnected ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Reset
          </button>
        </div>

        <div>
          <label className="text-xs text-[#a0a0a0] mb-1.5 block">Dimensions</label>
          <div className="flex items-center gap-2">
            {[{ label: 'W', field: 'width' as const, value: dimensions.width }, { label: 'H', field: 'height' as const, value: dimensions.height }].map(({ label, field, value }) => (
              <div key={field} className="flex items-center gap-2 flex-1">
                <span className="text-xs text-[#6b6b6b] min-w-[12px]">{label}</span>
                <input type="text" value={value} onChange={handleDimensionChange(field)}
                  disabled={isHandleConnected(`${field}_percent`)} placeholder={isHandleConnected(`${field}_percent`) ? 'Auto' : ''}
                  className={`${INPUT_BASE_CLASS} ${isHandleConnected(`${field}_percent`) ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            ))}
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
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Execution Error
            </p>
            <p className="text-sm text-red-500 italic whitespace-pre-wrap">{props.data.error}</p>
          </div>
        ) : props.data.result?.imageUrl ? (
          <div className="bg-[#0a0a0a] border border-success/30 rounded-md p-3">
            <p className="text-xs text-success mb-2 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              Cropped Image
            </p>
            <img src={props.data.result.imageUrl} alt="Cropped image" className="w-full h-auto rounded border border-[#2a2a2a]" />
          </div>
        ) : null}
      </div>
    </BaseNode>
  )
}

export default memo(CropImageNode)
