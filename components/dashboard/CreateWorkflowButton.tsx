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
            className="h-9 px-4 bg-[#e3ff74] hover:bg-[#d0eb60] text-black text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Plus className="w-4 h-4" />
            )}
            Create New File
        </button>
    )
}
