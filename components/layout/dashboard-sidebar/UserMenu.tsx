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
            await signOut({ redirectUrl: '/sign-in' })
        } catch (error) {
            console.error('Error signing out:', error)
            setIsLoggingOut(false)
        }
    }

    if (!isLoaded) {
        return (
            <div className="h-9 sm:h-10 flex items-center gap-2 px-1.5 sm:px-2 animate-pulse">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2a2a2a]"></div>
                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-[#2a2a2a] rounded hidden md:block"></div>
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
                className="w-full flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-[#1a1a1a] transition-colors text-left group cursor-pointer"
            >
                {/* Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm shrink-0 overflow-hidden">
                    {user.imageUrl ? (
                        <img src={user.imageUrl} alt={identifier} className="w-full h-full object-cover" />
                    ) : (
                        initial
                    )}
                </div>
                
                {/* Name */}
                <div className="flex-1 min-w-0 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {identifier}
                    </p>
                </div>

                {/* Chevron */}
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#666] transition-transform duration-200 hidden md:block ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md sm:rounded-lg shadow-xl z-20 overflow-hidden py-1">
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-red-400 hover:bg-[#2a2a2a] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isLoggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}