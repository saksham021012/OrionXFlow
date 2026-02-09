import React from 'react'
import { Loader2, AlertCircle, Play } from 'lucide-react'

interface OutputDisplayProps {
  isRunning: boolean
  status?: string
  error?: string
  result?: string
}

export const OutputDisplay = ({ isRunning, status, error, result }: OutputDisplayProps) => (
  <div className={`bg-[#0a0a0a] border ${error ? 'border-red-500/50 bg-red-500/5' : 'border-[#2a2a2a]'} rounded-md p-4 min-h-[320px] max-h-[400px] flex flex-col relative group transition-all`}>
    {isRunning || status === 'running' ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    ) : error ? (
      <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="space-y-1">
          <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Execution Error</span>
          <p className="text-[10px] text-red-500/80 font-medium">Please check the history sidebar<br/>for detailed error logs</p>
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
  isStopping: boolean
  onRun: () => void
  onStop: (e: React.MouseEvent) => void
}

export const RunButton = ({ isRunning, isStopping, onRun, onStop }: RunButtonProps) => (
  <button
    onClick={isRunning ? onStop : onRun}
    disabled={isStopping}
    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
      ${isRunning 
        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50' 
        : 'bg-[#2a2a2a] hover:bg-[#333333] border border-[#404040] text-white'}
      ${isStopping ? 'opacity-70 cursor-not-allowed' : ''}
    `}
  >
    {isStopping ? (
      <>
        <Loader2 className="w-3 h-3 animate-spin" />
        Stopping...
      </>
    ) : isRunning ? (
      <>
        <div className="w-2 h-2 bg-red-500 rounded-sm" />
        Stop
      </>
    ) : (
      <>
        <Play className="w-3.5 h-3.5" />
        Run Model
      </>
    )}
  </button>
)

export const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3-flash-preview',
]

export const SELECT_CLASS = 'w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all'
