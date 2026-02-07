'use client'

import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CreateWorkflowButton() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = () => {
        router.push('/workflow/new')
    }
    
    return (
        <button 
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full h-10 bg-[#e3ff74] hover:bg-[#d0eb60] text-black font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create New File
        </button>
    )
}
