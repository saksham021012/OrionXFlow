'use client'

import { Loader2 } from 'lucide-react'

// Define the interface locally or import it if shared 
export interface NodeExecution {
  nodeId: string
  nodeType: string
  status: string
  executionTime?: number
  error?: string
  inputs?: any
  outputs?: any
}

interface NodeExecutionDetailsProps {
  node: NodeExecution
}

export function NodeExecutionDetails({ node }: NodeExecutionDetailsProps) {
  const renderInputs = () => {
    if (!node.inputs || typeof node.inputs !== 'object' || Object.keys(node.inputs).length === 0) return null

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(node.inputs).map(([key, value]) => {
            const displayValue = typeof value === 'string' && value.length > 50 
                ? value.substring(0, 50) + '...' 
                : (typeof value === 'object' ? JSON.stringify(value) : String(value))
            
            return (
                <div key={key} className="flex items-start gap-1.5 pl-0.5">
                    <span className="text-[#a0a0a0] font-medium">i</span>
                    <p className="text-[11px] text-[#a0a0a0] break-all">
                        {key}: <span className="text-white/80">{displayValue}</span>
                    </p>
                </div>
            )
        })}
      </div>
    )
  }

  const renderOutput = () => {
    if (node.outputs === undefined || node.outputs === null) return null

    let value = ''
    if (typeof node.outputs === 'string') {
      value = node.outputs
    } else if (typeof node.outputs === 'object') {
      
      const data = node.outputs.result || node.outputs.outputs || node.outputs
      
      // Extract URL or specific field
      value = data.imageUrl || data.url || data.videoUrl || data.response || data.value || (typeof data === 'string' ? data : JSON.stringify(data))
    }

    // Truncate excessively long values (like base64 data)
    const displayValue = value.length > 100 ? value.substring(0, 100) + '...' : value

    return (
      <div className="mt-1 flex items-start gap-1.5 pl-0.5 border-t border-white/5 pt-1">
        <span className="text-[#a0a0a0] font-medium">o</span>
        <p className="text-[11px] text-[#a0a0a0] break-all">
          Output: <span className="text-white italic">{displayValue}</span>
        </p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10'
      case 'failed': return 'text-error bg-error/10'
      case 'running': return 'text-warning bg-warning/10'
      case 'partial': return 'text-warning bg-warning/10'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <div className="text-xs bg-background rounded p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-foreground capitalize">
          {node.nodeType}
        </span>
        <span className={`px-2 py-0.5 rounded capitalize ${getStatusColor(node.status)}`}>
          {node.status}
        </span>
      </div>
      {node.executionTime && (
        <p className="text-muted-foreground">
          {node.executionTime}ms
        </p>
      )}
      {node.error && (
        <details className="mt-1 group">
          <summary className="text-error text-[11px] cursor-pointer hover:underline list-none flex items-center gap-1 font-medium">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Execution Error
          </summary>
          <p className="text-error mt-1 break-words opacity-80 italic pl-3 border-l border-error/20 ml-1">
            {node.error}
          </p>
        </details>
      )}
      
      {node.status === 'completed' && (
        <div className="mt-1 space-y-1">
            {renderInputs()}
            {renderOutput()}
        </div>
      )}
    </div>
  )
}
