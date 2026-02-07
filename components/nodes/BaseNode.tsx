'use client'

import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { MoreHorizontal, Loader2, Check, X, Ban } from 'lucide-react'
import { NodeData } from '@/store/workflowStore'

interface BaseNodeProps extends NodeProps<NodeData> {
  children: React.ReactNode
  inputs?: Array<{ id: string; label: string; color?: string }>
  outputs?: Array<{ id: string; label: string; color?: string }>
}

import { useWorkflowStore } from '@/store/workflowStore'
import { Pencil, Trash2 } from 'lucide-react'

// ... existing interfaces ...

// Handle color mapping based on type
const getHandleColor = (id: string): string => {
  if (id.includes('system') || id.includes('prompt')) return 'handle-purple'
  if (id.includes('user') || id.includes('message')) return 'handle-green'
  if (id.includes('image') || id.includes('video') || id.includes('output')) return 'handle-cyan'
  if (id.includes('param') || id.includes('config')) return 'handle-orange'
  return 'handle-purple' // default
}

function BaseNode({ id, data, children, inputs = [], outputs = [], selected }: BaseNodeProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(data.label)
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)
  const deleteNode = useWorkflowStore((state) => state.deleteNode)

  const isRunning = data.status === 'running'
  const isFailed = data.status === 'failed'
  const isCompleted = data.status === 'completed'

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    deleteNode(id)
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    setIsEditing(true)
    setEditLabel(data.label)
  }

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditLabel(data.label)
  }

  const handleLabelFinish = () => {
    setIsEditing(false)
    if (editLabel && editLabel.trim() !== '') {
      updateNodeData(id, { label: editLabel })
    } else {
      setEditLabel(data.label) // Revert if empty
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelFinish()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditLabel(data.label)
    }
  }

  return (
    <div
      className={`
        min-w-[280px] max-w-[400px] rounded-lg border bg-[#1a1a1a] p-4 shadow-md transition-all relative group
        ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-[#2a2a2a]'}
        ${isRunning ? 'border-primary shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-primary/50' : ''}
        ${isFailed ? 'border-error shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-error/50' : ''}
        ${isCompleted ? 'border-success/50' : ''}
      `}
    >
      {/* Input Handles with Labels */}
      {inputs.map((input, index) => (
        <div
          key={input.id}
          className="absolute left-0 flex items-center"
          style={{ top: `${((index + 1) * 100) / (inputs.length + 1)}%`, transform: 'translateY(-50%)' }}
        >
          <span className="absolute right-full mr-2 text-[11px] text-[#a0a0a0] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {input.label}
          </span>
          <Handle
            type="target"
            position={Position.Left}
            id={input.id}
            className={`!w-3 !h-3 !border-2 !border-[#1a1a1a] ${input.color || getHandleColor(input.id)}`}
          />
        </div>
      ))}

      {/* Node Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleLabelFinish}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-sm font-semibold text-white bg-transparent border-b border-primary outline-none w-full"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 
              className="text-sm font-semibold text-white cursor-pointer hover:text-primary transition-colors"
              onClick={handleLabelClick}
              title="Click to rename"
            >
              {data.label}
            </h3>
          )}
          
          <div className="flex items-center gap-2">
            {data.status && data.status !== 'idle' && (
              <div
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded bg-[#1a1a1a] border
                  ${data.status === 'running' ? 'border-primary/20 text-primary' : ''}
                  ${data.status === 'completed' ? 'border-success/20 text-success' : ''}
                  ${data.status === 'failed' ? 'border-error/20 text-error' : ''}
                  ${data.status === 'cancelled' ? 'border-yellow-500/20 text-yellow-500' : ''}
                `}
              >
                {data.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                {data.status === 'completed' && <Check className="w-3 h-3" />}
                {data.status === 'failed' && <X className="w-3 h-3" />}
                {data.status === 'cancelled' && <Ban className="w-3 h-3" />}
                <span className="text-[10px] font-medium uppercase tracking-wider">{data.status}</span>
              </div>
            )}
            {/* Three-dot menu */}
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="w-8 h-8 rounded-md hover:bg-[#2a2a2a] transition-all flex items-center justify-center"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4 text-white" />
              </button>
              
              {/* Dropdown menu */}
              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  {/* Menu content */}
                  <div className="absolute right-0 top-10 w-32 bg-[#2a2a2a] border border-[#404040] rounded-lg shadow-lg z-20 overflow-hidden py-1">
                    <button
                      onClick={handleRename}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Rename
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-[#333333] transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>

      {/* Output Handles with Labels */}
      {outputs.map((output, index) => (
        <div
          key={output.id}
          className="absolute right-0 flex items-center"
          style={{ top: `${((index + 1) * 100) / (outputs.length + 1)}%`, transform: 'translateY(-50%)' }}
        >
          <span className="absolute left-full ml-2 text-[11px] text-[#a0a0a0] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {output.label}
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id={output.id}
            className={`!w-3 !h-3 !border-2 !border-[#1a1a1a] ${output.color || getHandleColor(output.id)}`}
          />
        </div>
      ))}
    </div>
  )
}

export default memo(BaseNode)
