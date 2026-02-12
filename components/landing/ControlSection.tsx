import React, { useState } from 'react';
import Image from 'next/image';

const ControlOutcome = () => {
    const [selectedLayer, setSelectedLayer] = useState('TEXT LAYER');

    const layers = [
        { id: 'canvas', icon: 'canvas', name: 'CANVAS', type: 'canvas' },
        { id: 'walkie', icon: 'image', name: 'WALKIE TALKIE', type: 'image', src: '/weavy/section2-control/phone.avif' },
        { id: 'text1', icon: 'text', name: 'TEXT LAYER', type: 'text' },
        { id: 'text2', icon: 'text', name: 'TEXT LAYER', type: 'text' },
        { id: 'astronaut', icon: 'image', name: 'ASTRONAUT', type: 'image', src: '/weavy/section2-control/astro.avif' },
        { id: 'spaceship', icon: 'image', name: 'SPACESHIP', type: 'image', src: '/weavy/section2-control/spaceship.avif' },
    ];

    interface LayerIconProps {
        type: string;
    }

    const LayerIcon = ({ type }: LayerIconProps) => {
        if (type === 'canvas') {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" strokeWidth="2" />
                    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                    <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" />
                </svg>
            );
        }
        if (type === 'image') {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M21 15l-5-5L5 21" strokeWidth="2" />
                </svg>
            );
        }
        return <span className="text-sm font-medium">T</span>;
    };

    return (
        <div
            style={{
                backgroundColor: "#eff1f5", // Cool gray/off-white match
                backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "20px 20px", // Larger grid spacing
            }}
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-8">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] leading-[1.1] font-light tracking-tight text-[#1a1a1a] mb-4 sm:mb-6">
                    Control the<br />Outcome
                </h1>
                <p className="text-sm sm:text-[15px] text-[#6b6b6b] leading-relaxed px-4">
                    Layers, type, and blends—all the tools to bring your wildest ideas to<br className="hidden sm:block" />
                    life. Your creativity, our compositing power.
                </p>
            </div>

            {/* Main Editor Interface */}
            <div className="w-full max-w-[1300px] bg-[#1a1a1a] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex flex-col lg:flex-row h-auto lg:h-[640px]">
                    {/* Left Panel - Layers */}
                    <div className="w-full lg:w-[340px] bg-[#1a1a1a] border-b lg:border-b-0 lg:border-r border-[#2a2a2a] p-4 sm:p-6 flex flex-col">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-white text-xs sm:text-[13px] font-normal">Title sequence</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-3 font-medium">
                                LAYERS
                            </div>

                            <div className="space-y-0.5">
                                {layers.map((layer) => (
                                    <div
                                        key={layer.id}
                                        onClick={() => setSelectedLayer(layer.name)}
                                        className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-all ${selectedLayer === layer.name
                                            ? 'bg-[#2a2a2a]'
                                            : 'hover:bg-[#252525]'
                                            }`}
                                    >
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[#8a8a8a]">
                                            <LayerIcon type={layer.type} />
                                        </div>
                                        <span className="text-xs sm:text-[13px] text-[#d4d4d4] tracking-wide font-normal">
                                            {layer.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center - Canvas */}
                    <div className="flex-1 bg-[#2a2a2a] flex items-center justify-center p-6 sm:p-8 lg:p-12">
                        <div className="relative w-full h-64 sm:h-96 lg:h-full rounded-lg overflow-hidden bg-[#1a1a1a]">
                            {/* Layer 1: UI Desktop Background */}
                            <Image
                                src="/weavy/section2-control/ui-desktop.avif"
                                alt="UI Desktop background"
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Layer 2: Spaceship - Full width/height centered */}
                            <div className="absolute inset-0">
                                <Image
                                    src="/weavy/section2-control/spaceship.avif"
                                    alt="Spaceship"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Layer 3: Astronaut */}
                            <div className="absolute inset-0">
                                <Image
                                    src="/weavy/section2-control/astro.avif"
                                    alt="Astronaut"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Layer 4: Text Layers (text-in-astro) */}
                            <div className="absolute inset-0">
                                <Image
                                    src="/weavy/section2-control/text-in-astro.svg"
                                    alt="Text in Astronaut"
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            {/* Layer 5: Walkie Talkie - Topmost */}
                            <div className="absolute top-[20%] left-[25%] w-16 h-16 sm:w-20 sm:h-20 lg:w-[120px] lg:h-[120px]">
                                <Image
                                    src="/weavy/section2-control/phone.avif"
                                    alt="Walkie Talkie"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Properties */}
                    <div className="w-full lg:w-[300px] bg-[#1a1a1a] border-t lg:border-t-0 lg:border-l border-[#2a2a2a] p-4 sm:p-6 overflow-y-auto max-h-96 lg:max-h-none lg:overflow-y-hidden">
                        <div className="space-y-4 sm:space-y-6">
                            {/* Layer Type Header */}
                            <div className="flex items-center gap-2 text-[#8a8a8a] text-[11px] uppercase tracking-wider pb-3 sm:pb-4 border-b border-[#2a2a2a]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span>TEXT LAYER</span>
                            </div>

                            {/* Dimensions */}
                            <div>
                                <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                    DIMENSIONS
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div>
                                        <div className="text-[10px] text-[#6b6b6b] mb-1.5 uppercase">W</div>
                                        <input
                                            type="text"
                                            value="1024"
                                            readOnly
                                            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a]"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[#6b6b6b] mb-1.5 uppercase">H</div>
                                        <input
                                            type="text"
                                            value="1240"
                                            readOnly
                                            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Position */}
                            <div>
                                <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                    POSITION
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div>
                                        <div className="text-[10px] text-[#6b6b6b] mb-1.5 uppercase">X</div>
                                        <input
                                            type="text"
                                            value="240"
                                            readOnly
                                            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a]"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[#6b6b6b] mb-1.5 uppercase">Y</div>
                                        <input
                                            type="text"
                                            value="724"
                                            readOnly
                                            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rotation */}
                            <div>
                                <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                    ROTATION
                                </div>
                                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 12a8 8 0 018-8V0l4 4-4 4V4a6 6 0 00-6 6" strokeWidth="2" />
                                    </svg>
                                    <span>90°</span>
                                </div>
                            </div>

                            {/* Opacity & Blend Mode */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <div>
                                    <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                        OPACITY
                                    </div>
                                    <input
                                        type="text"
                                        value="100%"
                                        readOnly
                                        className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a]"
                                    />
                                </div>
                                <div>
                                    <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                        BLEND MODE
                                    </div>
                                    <select className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a] appearance-none">
                                        <option>NORMAL</option>
                                        <option>MULTIPLY</option>
                                        <option>SCREEN</option>
                                        <option>OVERLAY</option>
                                    </select>
                                </div>
                            </div>

                            {/* Font */}
                            <div>
                                <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                    FONT
                                </div>
                                <select className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a] appearance-none mb-2 sm:mb-3">
                                    <option>JETBRAINS MONO</option>
                                    <option>INTER</option>
                                    <option>ROBOTO</option>
                                </select>

                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div>
                                        <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                            STYLE
                                        </div>
                                        <select className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a] appearance-none">
                                            <option>MEDIUM</option>
                                            <option>REGULAR</option>
                                            <option>BOLD</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                            SIZE
                                        </div>
                                        <input
                                            type="text"
                                            value="12"
                                            readOnly
                                            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fill */}
                            <div>
                                <div className="text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-2 sm:mb-3 font-medium">
                                    FILL
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white border border-[#3a3a3a] rounded-md flex-shrink-0"></div>
                                    <input
                                        type="text"
                                        value="FFFFFF"
                                        readOnly
                                        className="flex-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-[13px] focus:outline-none focus:border-[#4a4a4a]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlOutcome;