'use client'

import { Trash2, Loader2, GitGraph } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WorkflowCardProps {
    id: string
    name: string
    updatedAt: string | Date
    thumbnailUrl?: string
    onDelete?: (id: string) => Promise<void>
}

export default function WorkflowCard({ id, name, updatedAt, thumbnailUrl, onDelete }: WorkflowCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!confirm('Are you sure you want to delete this workflow?')) return

        if (onDelete) {
            setIsDeleting(true)
            try {
                await onDelete(id)
            } catch (error) {
                setIsDeleting(false)
            }
            return
        }

        // Fallback for non-optimistic usage
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/workflows/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete')
            router.refresh()
        } catch (error) {
            console.error('Error deleting workflow:', error)
            alert('Failed to delete workflow')
            setIsDeleting(false)
        }
    }

    return (
        <div className="group flex flex-col gap-3 w-full">
            <Link href={`/workflow/${id}`} className="block relative">
                {/* Card Container */}
                <div className="relative aspect-[3/4] bg-[#1C1C1C] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#404040] transition-colors flex items-center justify-center">
                    
                    {/* Delete Button - Visible on Hover */}
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-lg transition-all duration-200 z-10 backdrop-blur-sm ${
                            isDeleting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        title="Delete Workflow"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>

                    {/* Content / Thumbnail */}
                    {thumbnailUrl ? (
                        <img 
                            src={thumbnailUrl} 
                            alt={name} 
                            className="w-full h-full object-cover opacity-80" 
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-[#444] group-hover:text-[#666] transition-colors">
                            {/* Using GitGraph as a proxy for the node/workflow icon shown in screenshot */}
                            <GitGraph className="w-12 h-12" strokeWidth={1.5} />
                        </div>
                    )}
                    
                    {/* Hover Overlay (Optional subtly lighten) */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
                </div>
            </Link>

            {/* Metadata Text (Below Card) */}
            <div className="flex flex-col gap-1 px-1">
                <Link href={`/workflow/${id}`} className="block">
                    <h3 className="text-base font-medium text-white truncate hover:text-gray-300 transition-colors" title={name}>
                        {name}
                    </h3>
                </Link>
                <div className="text-xs text-[#666]">
                    Last edited {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                </div>
            </div>
        </div>
    )
}
