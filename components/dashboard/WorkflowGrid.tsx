'use client'

import { useState } from 'react'
import WorkflowCard from './WorkflowCard'
import CreateWorkflowButton from './CreateWorkflowButton'
import { Folder } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Workflow {
    id: string
    name: string
    updatedAt: string | Date
}

interface WorkflowGridProps {
    initialWorkflows: Workflow[]
}

export default function WorkflowGrid({ initialWorkflows }: WorkflowGridProps) {
    const [workflows, setWorkflows] = useState(initialWorkflows)
    const router = useRouter()

    const handleDelete = async (id: string) => {
        // Optimistic Remove
        const originalWorkflows = [...workflows]
        setWorkflows(prev => prev.filter(w => w.id !== id))

        try {
            const response = await fetch(`/api/workflows/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete')
            }
            
            // Revalidate server data in background
            router.refresh()
        } catch (error) {
            console.error('Delete failed, rolling back:', error)
            // Rollback
            setWorkflows(originalWorkflows)
            alert('Failed to delete workflow. Please try again.')
            throw error // Re-throw so card can reset its loading state
        }
    }

    if (workflows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-xl flex items-center justify-center mb-4">
                    <Folder className="w-8 h-8 text-[#333]" />
                </div>
                <h3 className="text-white font-medium mb-1">No files yet</h3>
                <p className="text-[#666] text-sm mb-4">Create your first workflow to get started.</p>
                <CreateWorkflowButton />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workflows.map((workflow) => (
                <WorkflowCard 
                    key={workflow.id}
                    id={workflow.id}
                    name={workflow.name}
                    updatedAt={workflow.updatedAt}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    )
}
