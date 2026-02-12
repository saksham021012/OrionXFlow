"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const tools = [
    { name: "Crop", image: "tool-crop.avif", top: "15%", left: "8%" },
    { name: "Inpaint", image: "tool-inpaint.avif", top: "55%", left: "8%" },
    { name: "Outpaint", image: "tool-outpaint.avif", top: "35%", left: "18%" },
    { name: "Upscale", image: "tool-upscale.avif", top: "75%", left: "18%" },
    { name: "Invert", image: "tool-invert.avif", top: "25%", left: "28%" },
    { name: "Mask Extractor", image: "tool-mask.avif", top: "60%", left: "28%" },
    { name: "Painter", image: "tool-painter.avif", top: "15%", right: "18%" },
    { name: "Channels", image: "tool-channels.avif", top: "30%", right: "15%" },
    { name: "Image Describer", image: "tool-image-describer.avif", top: "45%", right: "20%" },
    { name: "Relight", image: "tool-relight.avif", top: "60%", right: "18%" },
    { name: "Z Depth Extractor", image: "tool-zdepth.avif", top: "75%", right: "10%" },
];

export default function ToolsSection() {
    const [activeTool, setActiveTool] = React.useState<string | null>(null);

    return (
        <section className="relative w-full min-h-[600px] sm:min-h-[800px] lg:min-h-[1000px] bg-[#f5f7fa] overflow-hidden flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 pb-0">
            {/* Background Grid */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundColor: "#eff1f5", // Cool gray/off-white match
                    backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                }}
            />

            {/* Header */}
            <div className="z-10 text-center relative px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] leading-[1.1] lg:leading-[1] font-normal text-[#1a1a1a] tracking-tight">
                    With all the professional
                    <br className="hidden sm:block" />
                    tools you rely on
                </h2>
                <p className="mt-4 sm:mt-6 lg:mt-8 text-[#555] text-base sm:text-lg font-normal">In one seamless workflow</p>
            </div>

            {/* Main Content Area */}
            <div className="relative w-full max-w-[1400px] h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] -mt-8 sm:-mt-12 lg:-mt-20 flex items-center justify-center z-10 px-4">

                {/* Central Vase Image */}
                <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] lg:w-[900px] lg:h-[900px] xl:w-[1100px] xl:h-[1100px] z-20 mb-32 sm:mb-48 md:mb-64 lg:mb-80 pointer-events-none">
                    <Image
                        key={activeTool || "default"}
                        src={activeTool ? `/weavy/section1-tools/${tools.find(t => t.name === activeTool)?.image}` : "/weavy/section1-tools/vase-default.avif"}
                        alt="Central Vase"
                        fill
                        sizes="(max-width: 640px) 280px, (max-width: 768px) 400px, (max-width: 1024px) 600px, (max-width: 1280px) 900px, 1100px"
                        className="object-contain drop-shadow-2xl transition-opacity duration-300"
                        priority
                    />
                </div>

                {/* Floating Tools */}
                {tools.map((tool, index) => {
                    const isActive = activeTool === tool.name;
                    return (
                        <motion.div
                            key={index}
                            className={`absolute flex items-center justify-center px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer z-30
                                ${isActive
                                    ? "bg-[#feff9d] border-2 border-[#feff9d] scale-110 !z-40"
                                    : "bg-white/95 border border-transparent hover:scale-105 hover:bg-white"
                                }`}
                            style={{
                                top: tool.top,
                                left: tool.left,
                                right: tool.right,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
                            onMouseEnter={() => setActiveTool(tool.name)}
                            onMouseLeave={() => setActiveTool(null)}
                        >
                            <p className={`text-xs sm:text-sm lg:text-[15px] font-medium whitespace-nowrap transition-colors ${isActive ? "text-black" : "text-[#444]"}`}>
                                {tool.name}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}