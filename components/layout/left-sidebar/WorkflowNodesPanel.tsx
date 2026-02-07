'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { NODE_TYPES } from '@/lib/constants'

export function WorkflowNodesPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const { addNode } = useWorkflowStore()

  const filteredNodes = NODE_TYPES.filter((node) =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddNode = (type: string) => {
    addNode(type, { x: 250, y: 250 })
  }

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="p-4 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search nodes..."
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all shadow-sm"
        />
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="text-xs font-semibold text-[#a0a0a0] uppercase mb-3 tracking-wider">
          Quick Access
        </h3>
        <div className="space-y-2">
          {/* First row: Text and Image */}
          <div className="grid grid-cols-2 gap-2">
            {filteredNodes.slice(0, 2).map((node) => {
              const Icon = node.icon
              return (
                <button
                  key={node.type}
                  onClick={() => handleAddNode(node.type)}
                  onDragStart={(e) => onDragStart(e, node.type)}
                  draggable
                  className="h-20 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all group flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing"
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-xs text-white font-medium">{node.label}</span>
                </button>
              )
            })}
          </div>
          
          {/* Second row: Video */}
          <div className="grid grid-cols-2 gap-2">
            {filteredNodes.slice(2, 3).map((node) => {
              const Icon = node.icon
              return (
                <button
                  key={node.type}
                  onClick={() => handleAddNode(node.type)}
                  onDragStart={(e) => onDragStart(e, node.type)}
                  draggable
                  className="h-20 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all group flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing"
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-xs text-white font-medium">{node.label}</span>
                </button>
              )
            })}
          </div>

          {/* Run Any LLM - Full width */}
          {filteredNodes.slice(3, 4).map((node) => {
            const Icon = node.icon
            return (
              <button
                key={node.type}
                onClick={() => handleAddNode(node.type)}
                onDragStart={(e) => onDragStart(e, node.type)}
                draggable
                className="w-full h-20 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all group flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing"
              >
                <Icon className="w-5 h-5 text-white" />
                <span className="text-xs text-white font-medium">{node.label}</span>
              </button>
            )
          })}

          {/* Remaining nodes: Crop Image and Extract Frame */}
          <div className="grid grid-cols-2 gap-2">
            {filteredNodes.slice(4, 6).map((node) => {
              const Icon = node.icon
              return (
                <button
                  key={node.type}
                  onClick={() => handleAddNode(node.type)}
                  onDragStart={(e) => onDragStart(e, node.type)}
                  draggable
                  className="h-20 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all group flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing"
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-xs text-white font-medium">{node.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
