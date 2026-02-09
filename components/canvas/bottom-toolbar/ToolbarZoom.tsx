import React, { useRef, useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
// @ts-ignore
import { useReactFlow, useStore } from 'reactflow'

export function ToolbarZoom() {
    const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow()
    const zoom = useStore((s: any) => s.transform[2])
    const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsZoomMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    // Format zoom to percentage
    const zoomPercentage = Math.round(zoom * 100)

    const handleZoomIn = () => {
        zoomIn()
        setIsZoomMenuOpen(false)
    }

    const handleZoomOut = () => {
        zoomOut()
        setIsZoomMenuOpen(false)
    }

    const handleZoomTo100 = () => {
        zoomTo(1)
        setIsZoomMenuOpen(false)
    }

    const handleFitView = () => {
        fitView({ duration: 800 })
        setIsZoomMenuOpen(false)
    }

    return (
        <div className="relative flex items-center gap-1 sm:gap-2 px-1 sm:px-2" ref={menuRef}>
            <button 
                onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
                className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-white hover:bg-[#2a2a2a] py-1 px-1.5 sm:px-2 rounded cursor-pointer transition-colors"
            >
                <span className="min-w-[1.5rem] sm:min-w-[2rem] text-right">{zoomPercentage}%</span>
                <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#6b6b6b] transition-transform ${isZoomMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Zoom Dropdown Menu */}
            {isZoomMenuOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 sm:mb-3 w-40 sm:w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button
                        onClick={handleZoomIn}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs text-white hover:bg-[#2a2a2a] flex items-center justify-between group"
                    >
                        <span>Zoom in</span>
                        <span className="text-[#666] group-hover:text-[#888] hidden sm:inline">Ctrl +</span>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs text-white hover:bg-[#2a2a2a] flex items-center justify-between group"
                    >
                        <span>Zoom out</span>
                        <span className="text-[#666] group-hover:text-[#888] hidden sm:inline">Ctrl -</span>
                    </button>
                    <button
                        onClick={handleZoomTo100}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs text-white hover:bg-[#2a2a2a] flex items-center justify-between group"
                    >
                        <span>Zoom to 100%</span>
                        <span className="text-[#666] group-hover:text-[#888] hidden sm:inline">Ctrl 0</span>
                    </button>
                    <button
                        onClick={handleFitView}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs text-white hover:bg-[#2a2a2a] flex items-center justify-between group"
                    >
                        <span>Zoom to fit</span>
                        <span className="text-[#666] group-hover:text-[#888] hidden sm:inline">Ctrl 1</span>
                    </button>
                </div>
            )}
        </div>
    )
}
