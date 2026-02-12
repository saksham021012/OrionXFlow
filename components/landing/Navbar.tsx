'use client';

import Link from "next/link";

export default function Navbar() {
    return (
        <>
            {/* Banner */}
            <div className="bg-black py-2  text-center text-sm font-medium flex items-center justify-center gap-2">
                <span className="text-white">
                    <strong>🚀 OrionXFlow — The AI Workflow Platform</strong>
                </span>
            </div>

            {/* Nav */}
            <nav
                className="sticky top-0 z-[500] h-12"
            >
                <div className="w-full h-full pl-5 flex items-center justify-between">
                    {/* Left Section: Logo & Branding */}
                    <div className="flex items-center gap-0">
                        <Link href="/" className="flex items-center gap-2.5 pr-4 border-r border-gray-400">
                            {/* Logo Icon - "O" Logo */}
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-xl select-none">O</span>
                            </div>
                            <span className="text-black font-semibold text-[14px] tracking-wide uppercase">
                                ORIONXFLOW
                            </span>
                        </Link>

                        <div className="pl-4 leading-[1.1]">
                            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-700">
                                ARTISTIC
                            </div>
                            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-700">
                                INTELLIGENCE
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Nav Items + Actions */}
                    <div className="flex h-full items-center">
                        <div className="flex items-center gap-6 pr-8">
                            <Link
                                href="#"
                                className="text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                COLLECTIVE
                            </Link>
                            <Link
                                href="#"
                                className="text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                ENTERPRISE
                            </Link>
                            <Link
                                href="#"
                                className="text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                PRICING
                            </Link>
                            <Link
                                href="#"
                                className="text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                REQUEST A DEMO
                            </Link>
                            <Link
                                href="/sign-in"
                                className="text-[13px] font-medium text-black uppercase tracking-wide hover:opacity-70 transition-opacity"
                            >
                                SIGN IN
                            </Link>
                        </div>

                        <Link
                            href="/sign-up"
                            className="bg-[#F7FF9E] hover:bg-[#333] hover:text-white text-[#333] text-[40px] font-medium pt-6 px-7 pb-3  mt-12 flex items-center justify-center transition-colors rounded-bl-xl"
                        >
                            Start Now
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
}