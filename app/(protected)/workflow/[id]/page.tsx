'use client'

import { ReactFlowProvider } from 'reactflow'
import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas'
import { Plus, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { useRouter } from 'next/navigation'

import { use } from 'react'

export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { workflowName, nodes, edges, setWorkflowId, setWorkflowName, setNodes, setEdges } = useWorkflowStore()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const router = useRouter()

  // Load workflow data on mount
  useEffect(() => {
    const loadWorkflow = async () => {
        // If the ID in the URL matches the ID in our store and we have nodes, 
        // we can skip the fetch to provide an "instant" experience (e.g., after import)
        const store = useWorkflowStore.getState()
        if (id !== 'new' && store.workflowId === id && store.nodes.length > 0) {
            setEditName(store.workflowName)
            setLoading(false)
            return
        }

        if (id === 'new') {
            setWorkflowId('new')
            setWorkflowName('Untitled Workflow')
            setNodes([])
            setEdges([])
            setEditName('Untitled Workflow')
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const response = await fetch(`/api/workflows/${id}`)
            if (response.ok) {
                const workflow = await response.json()
                setWorkflowId(workflow.id)
                setWorkflowName(workflow.name)
                setNodes(workflow.nodes || [])
                setEdges(workflow.edges || [])
                setEditName(workflow.name)
            }
        } catch (error) {
            console.error('Error loading workflow:', error)
        } finally {
            setLoading(false)
        }
    }
    
    if (id) {
        loadWorkflow()
    }
  }, [id, setWorkflowId, setWorkflowName, setNodes, setEdges])


  const handleNameClick = () => {
    setIsEditingName(true)
    setEditName(workflowName)
  }

  const handleNameFinish = async () => {
    setIsEditingName(false)
    if (editName && editName.trim() !== '' && editName !== workflowName) {
      setWorkflowName(editName)
      // Auto-save name change
      await saveWorkflow(editName)
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

  const saveWorkflow = async (nameOverride?: string) => {
      setSaving(true)
      try {
        const data = {
            name: nameOverride || workflowName,
            nodes,
            edges,
        }
        
        if (id === 'new') {
            const response = await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) throw new Error('Failed to create workflow')
            
            const newWorkflow = await response.json()
            setWorkflowId(newWorkflow.id)
            router.replace(`/workflow/${newWorkflow.id}`)
            return
        }
        
        const response = await fetch(`/api/workflows/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('Save failed')
      } catch (error) {
          console.error('Error saving workflow:', error)
          alert('Failed to save workflow')
      } finally {
          setSaving(false)
      }
  }

  if (loading) {
      return (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white gap-3 sm:gap-4 px-4">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
              <p className="text-xs sm:text-sm font-medium tracking-wide animate-pulse">Loading Workflow</p>
          </div>
      )
  }

  return (
    <ReactFlowProvider>
      <MainLayout>
        {/* Floating Workflow Name Bubble */}
        <div className="absolute top-3 sm:top-4 left-14 sm:left-[64px] z-50 pointer-events-none">
          <div className="pointer-events-auto">
            {isEditingName ? (
              <div className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#1a1a1a] border border-[#333] shadow-2xl backdrop-blur-md">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameFinish}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="text-xs sm:text-sm font-medium text-white bg-transparent outline-none w-full min-w-[100px] sm:min-w-[120px]"
                />
              </div>
            ) : (
              <div 
                className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#404040] cursor-pointer transition-all duration-200 shadow-xl backdrop-blur-md group"
                onClick={handleNameClick}
              >
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-medium text-white/90 group-hover:text-white transition-colors truncate max-w-[150px] sm:max-w-none">
                    {workflowName.toLowerCase()}
                  </h1>
                  {saving && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" title="Saving..." />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative h-full">
          <WorkflowCanvas />
        </div>
      </MainLayout>
    </ReactFlowProvider>
  )
}