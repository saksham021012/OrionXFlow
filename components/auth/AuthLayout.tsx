'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
  type: 'signin' | 'signup'
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white px-4 py-12 selection:bg-primary/30">
      {/* Brand Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center gap-3 mb-10"
      >
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <span className="text-black font-black text-xl select-none">O</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white/90">OrionXFlow</span>
      </motion.div>

      {/* Auth Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden">
          
          {/* Header Toggle */}
          <div className="flex p-1 bg-black rounded-xl border border-[#1f1f1f] relative">
            <Link 
              href="/sign-in"
              className={`flex-1 relative z-10 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                type === 'signin' ? 'text-white' : 'text-[#666] hover:text-[#999]'
              }`}
            >
              Log In
              {type === 'signin' && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#1f1f1f] rounded-lg shadow-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
            <Link 
              href="/sign-up"
              className={`flex-1 relative z-10 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                type === 'signup' ? 'text-white' : 'text-[#666] hover:text-[#999]'
              }`}
            >
              Sign Up
              {type === 'signup' && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#1f1f1f] rounded-lg shadow-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          </div>

          {/* Clerk Component Slot with fade transition */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={type}
              initial={{ opacity: 0, x: type === 'signin' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: type === 'signin' ? 10 : -10 }}
              transition={{ duration: 0.3 }}
              className="clerk-custom-container flex flex-col items-center w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#666] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
