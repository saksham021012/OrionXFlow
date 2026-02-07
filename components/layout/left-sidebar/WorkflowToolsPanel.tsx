'use client'

import { FileDown, FileUp, Folder } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useWorkflowStore } from '@/store/workflowStore'

export function WorkflowToolsPanel() {
  const { nodes, edges, workflowName } = useWorkflowStore()

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

  const router = useRouter()

  const handleLoadSample = async () => {
    try {
      const module = await import('@/lib/sample-workflow')
      const { nodes, edges, name } = module.SAMPLE_WORKFLOW
      
      // 1. Update store immediately for instant rendering
      useWorkflowStore.getState().setNodes(nodes)
      useWorkflowStore.getState().setEdges(edges)
      useWorkflowStore.getState().setWorkflowName(name)
      useWorkflowStore.getState().setWorkflowId('') // Temporary clear ID
      
      // 2. Create the workflow in background
      fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          nodes: nodes,
          edges: edges
        })
      })
      .then(async (response) => {
        if (!response.ok) throw new Error('Background save failed')
        const workflow = await response.json()
        
        // 3. Update store and URL with new ID
        useWorkflowStore.getState().setWorkflowId(workflow.id)
        router.replace(`/workflow/${workflow.id}`)
      })
      .catch(error => {
        console.error('Failed to save sample to database:', error)
      })
      
    } catch (error) {
      console.error('Failed to load sample workflow:', error)
      alert('Failed to load sample workflow')
    }
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-[#a0a0a0] uppercase mb-3 tracking-wider">
        Tools
      </h3>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="h-20 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex flex-col items-center justify-center gap-2"
          >
            <FileDown className="w-5 h-5 text-white" />
            <span className="text-xs text-white font-medium">Export</span>
          </button>
          <button
            onClick={handleImport}
            className="h-20 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex flex-col items-center justify-center gap-2"
          >
            <FileUp className="w-5 h-5 text-white" />
            <span className="text-xs text-white font-medium">Import</span>
          </button>
        </div>
        <button
          onClick={handleLoadSample}
          className="w-full h-20 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex flex-col items-center justify-center gap-2"
        >
          <Folder className="w-5 h-5 text-white" />
          <span className="text-xs text-white font-medium">Sample Workflow</span>
        </button>
      </div>
    </div>
  )
}
