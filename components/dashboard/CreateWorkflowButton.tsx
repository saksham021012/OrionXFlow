'use client'

import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateWorkflowButton() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = () => {
        router.push('/workflow/new')
    }

    return (
        <button 
            onClick={handleCreate}
            disabled={isLoading}
            className="h-8 sm:h-9 px-3 sm:px-4 bg-[#e3ff74] hover:bg-[#d0eb60] text-black text-xs sm:text-sm font-medium rounded-md sm:rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden xs:inline sm:inline">Create New File</span>
            <span className="xs:hidden sm:hidden">New</span>
        </button>
    )
}
