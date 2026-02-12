'use client';

import Link from "next/link";
import { useState } from 'react';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (
        <>
            {/* Banner */}
            <div className="bg-black py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 px-4">
                <span className="text-white">
                    <strong>🚀 OrionXFlow — The AI Workflow Platform</strong>
                </span>
            </div>

            {/* Nav */}
            <nav className="sticky top-0 z-[500] h-12 sm:h-14 lg:h-16 bg-white">
                <div className="w-full h-full px-4 sm:px-5 flex items-center justify-between">
                    {/* Left Section: Logo & Branding */}
                    <div className="flex items-center gap-0">
                        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 pr-3 sm:pr-4 border-r border-gray-400">
                            {/* Logo Icon - "O" Logo */}
                            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-black rounded-md sm:rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-base sm:text-lg lg:text-xl select-none">O</span>
                            </div>
                            <span className="text-black font-semibold text-xs sm:text-[13px] lg:text-[14px] tracking-wide uppercase">
                                ORIONXFLOW
                            </span>
                        </Link>

                        <div className="hidden md:block pl-3 sm:pl-4 leading-[1.1]">
                            <div className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-gray-700">
                                ARTISTIC
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-gray-700">
                                INTELLIGENCE
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden flex items-center justify-center w-8 h-8 text-black"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>

                    {/* Desktop Right Section: Nav Items + Actions */}
                    <div className="hidden lg:flex h-full items-center">
                        <div className="flex items-center gap-4 xl:gap-6 pr-6 xl:pr-8">
                            <Link
                                href="#"
                                className="text-[12px] xl:text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                COLLECTIVE
                            </Link>
                            <Link
                                href="#"
                                className="text-[12px] xl:text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                ENTERPRISE
                            </Link>
                            <Link
                                href="#"
                                className="text-[12px] xl:text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                PRICING
                            </Link>
                            <Link
                                href="#"
                                className="text-[12px] xl:text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
                            >
                                REQUEST A DEMO
                            </Link>
                            <Link
                                href="/sign-in"
                                className="text-[12px] xl:text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                SIGN IN
                            </Link>
                        </div>

                        <Link
                            href="/sign-up"
                            className="bg-[#F7FF9E] hover:bg-[#333] hover:text-white text-[#333] text-2xl sm:text-3xl lg:text-[32px] xl:text-[40px] font-medium pt-4 sm:pt-5 lg:pt-6 px-4 sm:px-5 lg:px-7 pb-2 sm:pb-2.5 lg:pb-3 mt-8 sm:mt-10 lg:mt-12 flex items-center justify-center transition-colors rounded-bl-lg sm:rounded-bl-xl"
                        >
                            Start Now
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg">
                        <div className="flex flex-col p-4 space-y-3">
                            <Link
                                href="#"
                                className="text-sm font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                COLLECTIVE
                            </Link>
                            <Link
                                href="#"
                                className="text-sm font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                ENTERPRISE
                            </Link>
                            <Link
                                href="#"
                                className="text-sm font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                PRICING
                            </Link>
                            <Link
                                href="#"
                                className="text-sm font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                REQUEST A DEMO
                            </Link>
                            <Link
                                href="/sign-in"
                                className="text-sm font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                SIGN IN
                            </Link>
                            <Link
                                href="/sign-up"
                                className="bg-[#F7FF9E] hover:bg-[#333] hover:text-white text-[#333] text-lg font-medium py-3 px-4 text-center transition-colors rounded-lg mt-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Start Now
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}