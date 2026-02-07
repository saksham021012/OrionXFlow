import { useEffect } from 'react'
import { useReactFlow } from 'reactflow'

import { useWorkflowStore } from '@/store/workflowStore'

export function useCanvasShortcuts() {
    const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow()
    const { undo, redo } = useWorkflowStore()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl/Cmd key and ensure no other modifiers are pressed (except maybe Shift for +)
            if ((e.metaKey || e.ctrlKey) && !e.altKey) {
                // Prevent default browser zooming for these keys to handle it within ReactFlow

                switch (e.key) {
                    case '=': // Ctrl + (often equals key without shift)
                    case '+': // Ctrl + (with shift or numpad)
                        e.preventDefault()
                        zoomIn()
                        break
                    case '-': // Ctrl -
                    case '_':
                        e.preventDefault()
                        zoomOut()
                        break
                    case '0': // Ctrl 0 -> 100%
                        e.preventDefault()
                        zoomTo(1)
                        break
                    case '1': // Ctrl 1 -> Fit View
                        e.preventDefault()
                        fitView({ duration: 800 })
                        break
                    case 'z': // Ctrl + Z (Undo)
                    case 'Z':
                        e.preventDefault()
                        if (e.shiftKey) {
                            redo()
                        } else {
                            undo()
                        }
                        break
                    case 'y': // Ctrl + Y (Redo)
                    case 'Y':
                        e.preventDefault()
                        redo()
                        break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [zoomIn, zoomOut, zoomTo, fitView])
}
