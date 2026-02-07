import { useState } from 'react'
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution'
import { SidebarIconBar } from './left-sidebar/SidebarIconBar'
import { WorkflowNodesPanel } from './left-sidebar/WorkflowNodesPanel'
import { WorkflowToolsPanel } from './left-sidebar/WorkflowToolsPanel'
import { WorkflowActionsPanel } from './left-sidebar/WorkflowActionsPanel'
import { SidebarFooter } from './left-sidebar/SidebarFooter'

type PanelType = 'none' | 'search' | 'nodes'

export default function LeftSidebar() {
  const [activePanel, setActivePanel] = useState<PanelType>('nodes')
  const [isNavigating, setIsNavigating] = useState(false)
  
  const togglePanel = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? 'none' : panel)
  }

  // Workflow actions
  const { 
    saving, 
    executing, 
    cancelling, 
    handleSave, 
    handleRunWorkflow, 
    handleCancelWorkflow 
  } = useWorkflowExecution()

  const isExpanded = activePanel !== 'none'

  return (
    <div className="relative h-full flex bg-[#0a0a0a]">
      {/* Icon Bar - Always Visible */}
      <SidebarIconBar 
        activePanel={activePanel} 
        togglePanel={togglePanel} 
        isNavigating={isNavigating}
        setIsNavigating={setIsNavigating}
        isExpanded={isExpanded}
      />

      {/* Expandable Panel */}
      <div
        className={`bg-[#0a0a0a] border-r border-[#2a2a2a] transition-all duration-300 overflow-hidden ${
          isExpanded ? 'w-64' : 'w-0'
        }`}
      >
        <div className="w-64 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {/* Top Spacer for floating bubble */}
          <div className="h-16" />
          
          {(activePanel === 'search' || activePanel === 'nodes') && (
            <div className="p-4 pt-0 space-y-6">
              {/* Nodes Panel */}
              <WorkflowNodesPanel />

              {/* Tools */}
              <WorkflowToolsPanel />

              {/* Actions */}
              <WorkflowActionsPanel 
                executing={executing}
                cancelling={cancelling}
                saving={saving}
                handleRunWorkflow={handleRunWorkflow}
                handleCancelWorkflow={handleCancelWorkflow}
                handleSave={handleSave}
              />
            </div>
          )}
        </div>
        
        {/* Footer - Run/Cancel Button */}
        <SidebarFooter 
          isExpanded={isExpanded}
          executing={executing}
          cancelling={cancelling}
          handleRunWorkflow={handleRunWorkflow}
          handleCancelWorkflow={handleCancelWorkflow}
        />
      </div>
    </div>
  )
}
