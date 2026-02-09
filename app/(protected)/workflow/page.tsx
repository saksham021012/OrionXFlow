'use client'

import { ReactFlowProvider } from 'reactflow'
import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas'
import { Play, Save, Download, Upload, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'

export default function WorkflowPage() {
  const { workflowName, workflowId, nodes, edges, setWorkflowId, setWorkflowName } = useWorkflowStore()
  const [saving, setSaving] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(workflowName)
  const handleNameClick = () => {
    setIsEditingName(true)
    setEditName(workflowName)
  }

  const handleNameFinish = () => {
    setIsEditingName(false)
    if (editName && editName.trim() !== '') {
      setWorkflowName(editName)
    } else {
      setEditName(workflowName)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameFinish()
    }
    if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditName(workflowName)
    }
  }

  const handleRunWorkflow = async () => {
    if (!workflowId) {
      alert('Please save the workflow first')
      return
    }

    setExecuting(true)
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionType: 'full',
        }),
      })

      if (!response.ok) throw new Error('Execution failed')

      const { runId } = await response.json()
      console.log('Workflow execution started:', runId)
      alert('Workflow execution started! Check the history panel for results.')
    } catch (error) {
      console.error('Error executing workflow:', error)
      alert('Failed to execute workflow')
    } finally {
      setExecuting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        name: workflowName,
        nodes,
        edges,
      }

      if (workflowId) {
        // Update existing workflow
        const response = await fetch(`/api/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('Save failed')
      } else {
        // Create new workflow
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('Save failed')

        const workflow = await response.json()
        setWorkflowId(workflow.id)
      }

      alert('Workflow saved successfully!')
    } catch (error) {
      console.error('Error saving workflow:', error)
      alert('Failed to save workflow')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const data = { nodes, edges }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName}.json`
    a.click()
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          useWorkflowStore.getState().setNodes(data.nodes || [])
          useWorkflowStore.getState().setEdges(data.edges || [])
          alert('Workflow imported successfully!')
        } catch (error) {
          console.error('Failed to import workflow:', error)
          alert('Failed to import workflow')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <ReactFlowProvider>
      <MainLayout>
        {/* Top Bar - Simplified */}
        <div className="h-12 sm:h-14 border-b border-[#2a2a2a] bg-[#0a0a0a] px-4 sm:px-6 flex items-center">
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameFinish}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="text-xs sm:text-sm font-medium text-white bg-transparent border-b border-primary outline-none min-w-[150px] sm:min-w-[200px] w-full max-w-[300px] sm:max-w-none"
            />
          ) : (
            <h1 
              className="text-xs sm:text-sm font-medium text-white cursor-pointer hover:text-primary transition-colors truncate max-w-[250px] sm:max-w-none"
              onClick={handleNameClick}
              title="Click to rename workflow"
            >
              {workflowName}
            </h1>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas />
        </div>
      </MainLayout>
    </ReactFlowProvider>
  )
}
