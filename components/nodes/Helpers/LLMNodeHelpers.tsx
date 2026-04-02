import React from 'react'
import { Loader2, AlertCircle, Play, Clock } from 'lucide-react'

interface OutputDisplayProps {
  isRunning: boolean
  status?: string
  error?: string
  result?: string
}

export const OutputDisplay = ({ isRunning, status, error, result }: OutputDisplayProps) => (
  <div className={`bg-[#0a0a0a] border ${error ? 'border-red-500/50 bg-red-500/5' : 'border-[#2a2a2a]'} rounded-md p-4 min-h-[320px] max-h-[400px] flex flex-col relative group transition-all`}>
    {status === 'running' ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    ) : status === 'queued' ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Clock className="w-6 h-6 text-[#888]" />
        <span className="text-xs text-[#888] font-medium">Waiting in queue…</span>
      </div>
    ) : error ? (
      <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="space-y-1">
          <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Execution Error</span>
          <p className="text-[10px] text-red-500/80 font-medium">Please check the history sidebar<br />for detailed error logs</p>
        </div>
      </div>
    ) : result ? (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{result}</p>
      </div>
    ) : (
      <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
        <p className="text-sm font-medium">The generated text will appear here</p>
      </div>
    )}
  </div>
)

interface RunButtonProps {
  isRunning: boolean
  status?: string
  onRun: () => void
}

export const RunButton = ({ isRunning, status, onRun }: RunButtonProps) => {
  const isActuallyRunning = status === 'running'
  const isDisabled = isRunning || status === 'queued' || status === 'running'

  return (
    <button
      onClick={onRun}
      disabled={isDisabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
        ${isDisabled
          ? 'bg-[#2a2a2a] border border-[#404040] text-white opacity-70 cursor-not-allowed'
          : 'bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] text-white'}
      `}
    >
      {isActuallyRunning ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Running...
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5" />
          Run Model
        </>
      )}
    </button>
  )
}

export const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-flash'
]

export const SELECT_CLASS = 'w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all'
