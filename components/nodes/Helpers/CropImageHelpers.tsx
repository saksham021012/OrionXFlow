import React from 'react'

const INPUT_CLASS = 'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#404040] transition-all'

interface ParamInputProps {
  label: string
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled: boolean
}

export const ParamInput = ({ label, value, onChange, disabled }: ParamInputProps) => (
  <div>
    <label className="text-xs text-[#a0a0a0] mb-1.5 block font-medium">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={disabled ? 'Auto' : ''}
      className={`${INPUT_CLASS} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  </div>
)

interface CropOverlayProps {
  imageUrl: string
  x: number
  y: number
  w: number
  h: number
}

export const CropOverlay = ({ imageUrl, x, y, w, h }: CropOverlayProps) => (
  <div className="relative w-full aspect-square bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#2a2a2a]">
    <img src={imageUrl} alt="Crop preview" className="w-full h-full object-cover" />
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-1/3 top-0 bottom-0 border-l border-dotted border-white/40" />
      <div className="absolute left-2/3 top-0 bottom-0 border-l border-dotted border-white/40" />
      <div className="absolute top-1/3 left-0 right-0 border-t border-dotted border-white/40" />
      <div className="absolute top-2/3 left-0 right-0 border-t border-dotted border-white/40" />
    </div>
    <div className="absolute border-2 border-white/80" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
      {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1',
        '-top-1 left-1/2 -translate-x-1/2', '-bottom-1 left-1/2 -translate-x-1/2',
        '-left-1 top-1/2 -translate-y-1/2', '-right-1 top-1/2 -translate-y-1/2'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-2 h-2 bg-white border border-[#0a0a0a]`} />
      ))}
    </div>
  </div>
)

export const ASPECT_RATIOS: Record<string, { width_percent: number; height_percent: number }> = {
  '1:1': { width_percent: 50, height_percent: 50 },
  '16:9': { width_percent: 80, height_percent: 45 },
  '4:3': { width_percent: 80, height_percent: 60 },
  '9:16': { width_percent: 45, height_percent: 80 },
  '3:4': { width_percent: 60, height_percent: 80 },
}

export const INPUT_BASE_CLASS = INPUT_CLASS
