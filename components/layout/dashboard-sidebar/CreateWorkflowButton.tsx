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
            className="w-full h-9 sm:h-10 bg-[#e3ff74] hover:bg-[#d0eb60] text-black font-medium rounded-md sm:rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
        >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden xs:inline">Create New File</span>
            <span className="inline xs:hidden">New File</span>
        </button>
    )
}
