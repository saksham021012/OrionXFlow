'use client'

import { LogOut, ChevronDown, Loader2 } from 'lucide-react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'

export function UserMenu() {
    const { user, isLoaded } = useUser()
    const { signOut } = useClerk()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
            setIsLoggingOut(false)
        }
    }

    if (!isLoaded) {
        return (
            <div className="h-10 flex items-center gap-2 px-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#2a2a2a]"></div>
                <div className="h-4 w-24 bg-[#2a2a2a] rounded"></div>
            </div>
        )
    }

    if (!user) return null

    const identifier = user.fullName || user.primaryEmailAddress?.emailAddress || 'User'
    const initial = identifier[0].toUpperCase()

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left group cursor-pointer"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium text-sm shrink-0 overflow-hidden">
                    {user.imageUrl ? (
                        <img src={user.imageUrl} alt={identifier} className="w-full h-full object-cover" />
                    ) : (
                        initial
                    )}
                </div>
                
                {/* Name */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {identifier}
                    </p>
                </div>

                {/* Chevron */}
                <ChevronDown className={`w-4 h-4 text-[#666] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-20 overflow-hidden py-1">
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-[#2a2a2a] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isLoggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}
