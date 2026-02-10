'use client'

import { useCallback, useRef, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  useReactFlow,
  Connection,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useWorkflowStore } from '@/store/workflowStore'
import TextNode from '@/components/nodes/TextNode'
import UploadImageNode from '@/components/nodes/UploadImageNode'
import UploadVideoNode from '@/components/nodes/UploadVideoNode'
import LLMNode from '@/components/nodes/LLMNode'
import CropImageNode from '@/components/nodes/CropImageNode'
import ExtractFrameNode from '@/components/nodes/ExtractFrameNode'
import BottomToolbar from './BottomToolbar'
import { SelectionActions } from './SelectionActions'
import { isValidConnection as validateConnection } from '@/lib/workflow-validation'

const nodeTypes: NodeTypes = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  llm: LLMNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
}

export default function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    takeSnapshot,
    setSelectedNodes
  } = useWorkflowStore()

  const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(type, position)
    },
    [screenToFlowPosition, addNode]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    // Handle node click if needed
  }, [])

  const onNodeDragStart = useCallback(() => {
    takeSnapshot()
  }, [takeSnapshot])

  // Validate connections before allowing them
  const handleIsValidConnection = useCallback(
    (connection: Connection) => {
      return validateConnection(connection, nodes, edges)
    },
    [nodes, edges]
  )

  const handleSelectionChange = useCallback(({ nodes }: { nodes: any[] }) => {
    setSelectedNodes(nodes.map(n => n.id))
  }, [setSelectedNodes])

  return (
    <div className="h-full w-full relative z-0" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        snapToGrid={false}
        nodesDraggable={true} 
        panOnDrag={activeTool === 'hand' || (typeof window !== 'undefined' && window.innerWidth < 640)} // Always pan on drag for mobile
        selectionOnDrag={activeTool === 'select' && (typeof window !== 'undefined' && window.innerWidth >= 640)}
        panOnScroll={true}
        zoomOnScroll={true}
        nodesConnectable={true}
        isValidConnection={handleIsValidConnection}
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
        // Improve mobile touch performance
        zoomOnPinch={true}
        panOnScrollMode={'free' as any}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#262626"
        />
        <MiniMap
          className="bg-secondary border border-border !w-32 !h-24 sm:!w-40 sm:!h-32 md:!w-48 md:!h-36"
          nodeColor="#8b5cf6"
          maskColor="rgba(0, 0, 0, 0.6)"
        />
        <SelectionActions />
        <BottomToolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      </ReactFlow>
    </div>
  )
}
