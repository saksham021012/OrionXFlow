'use client'

import { FileDown, FileUp, Folder } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useWorkflowStore } from '@/store/workflowStore'

export function WorkflowToolsPanel() {
  const { nodes, edges, workflowName } = useWorkflowStore()

  const handleExport = () => {
    const data = { 
      name: workflowName,
      nodes, 
      edges 
    }
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
          const importedNodes = data.nodes || []
          const importedEdges = data.edges || []
          const importedName = data.name || 'Imported Workflow'

          // 1. Update store IMMEDIATELY (Instant Canvas Update)
          const store = useWorkflowStore.getState()
          store.takeSnapshot()
          store.setNodes(importedNodes)
          store.setEdges(importedEdges)
          store.setWorkflowName(importedName)
          // We set the ID to a temporary state 'importing' to distinguish it until DB returns
          store.setWorkflowId('importing')

          // 2. Persist to database in BACKGROUND
          fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: importedName,
              nodes: importedNodes,
              edges: importedEdges
            })
          })
          .then(async (response) => {
            if (!response.ok) throw new Error('Background save failed')
            const workflow = await response.json()
            
            // 3. Sync ID and URL without blocking UI
            useWorkflowStore.getState().setWorkflowId(workflow.id)
            router.replace(`/workflow/${workflow.id}`)
          })
          .catch(error => {
            console.error('Failed to persist imported workflow:', error)
          })

        } catch (error) {
          console.error('Failed to parse import file:', error)
          alert('Invalid workflow file format')
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
      <h3 className="text-[10px] sm:text-xs font-semibold text-[#a0a0a0] uppercase mb-2 sm:mb-3 tracking-wider">
        Tools
      </h3>
      <div className="space-y-1.5 sm:space-y-2">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            onClick={handleExport}
            className="h-16 sm:h-20 rounded-md sm:rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2"
          >
            <FileDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-[10px] sm:text-xs text-white font-medium">Export</span>
          </button>
          <button
            onClick={handleImport}
            className="h-16 sm:h-20 rounded-md sm:rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2"
          >
            <FileUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-[10px] sm:text-xs text-white font-medium">Import</span>
          </button>
        </div>
        <button
          onClick={handleLoadSample}
          className="w-full h-16 sm:h-20 rounded-md sm:rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#404040] transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2"
        >
          <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span className="text-[10px] sm:text-xs text-white font-medium">Sample Workflow</span>
        </button>
      </div>
    </div>
  )
}
