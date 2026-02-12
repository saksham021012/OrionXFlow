'use client';

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

// AI Model names for the sticky scroll section
const aiModels = [
    { name: "GPT img 1", highlighted: true },
    { name: "Wan", highlighted: false },
    { name: "SD 3.5", highlighted: true },
    { name: "Runway Gen-4", highlighted: true },
    { name: "Imagen 3", highlighted: true },
    { name: "Veo 3", highlighted: false },
    { name: "Recraft V3", highlighted: false },
    { name: "Kling", highlighted: false },
    { name: "Flux Pro 1.1 Ultra", highlighted: false },
    { name: "Minimax video", highlighted: false },
    { name: "Ideogram V3", highlighted: false },
    { name: "Luma ray 2", highlighted: false },
    { name: "Minimax image 01", highlighted: false },
    { name: "Bria", highlighted: false },
];

// Background images for the sticky section
const bgImages = [
    "/background/GPTimg1.avif",
    "/background/SD3.5.avif",
    "/background/Imagen3.avif",
    "/background/RecraftV3.avif",
    "/background/FluxProUltra.avif",
    "/background/Minimaximage01.avif",
    "/background/IdeogramV2.avif",
    "/background/Bria.avif",
];

export default function StickyModels() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            const sectionHeight = sectionRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;

            const scrollableAmount = sectionHeight - viewportHeight;

            if (scrollableAmount <= 0) {
                setScrollProgress(0);
                return;
            }

            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / scrollableAmount));

            setScrollProgress(progress);

            const bgIndex = Math.min(
                bgImages.length - 1,
                Math.floor(progress * bgImages.length)
            );
            setCurrentBgIndex(bgIndex);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const highlightedModelIndex = Math.min(
        aiModels.length - 1,
        Math.floor(scrollProgress * aiModels.length)
    );

    // Responsive item heights
    const getItemHeight = () => {
        if (typeof window === 'undefined') return 90;
        const width = window.innerWidth;
        if (width < 640) return 50; // mobile
        if (width < 768) return 60; // small tablet
        if (width < 1024) return 70; // tablet
        return 90; // desktop
    };

    const [itemHeight, setItemHeight] = useState(90);

    useEffect(() => {
        const updateHeight = () => setItemHeight(getItemHeight());
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const totalListHeight = aiModels.length * itemHeight;
    const modelListOffset = scrollProgress * totalListHeight;

    return (
        <section
            ref={sectionRef}
            className="relative z-20 bg-black"
            style={{ height: '400vh' }}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Background images with crossfade */}
                {bgImages.map((bg, index) => (
                    <div
                        key={bg}
                        className="absolute inset-0 transition-opacity duration-700 ease-out"
                        style={{
                            opacity: index === currentBgIndex ? 1 : 0,
                        }}
                    >
                        <Image
                            src={bg}
                            alt="AI Generated"
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                    </div>
                ))}

                <div className="absolute inset-0 bg-black/40" />

                <div className="relative h-full flex flex-col lg:flex-row items-start pt-16 sm:pt-20 md:pt-24 lg:pt-32 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 gap-8 sm:gap-12 lg:gap-20">
                    {/* Left content */}
                    <div className="w-full lg:w-2/5">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-normal text-white leading-[1.1] mb-4 sm:mb-6">
                            Use all AI<br />
                            models,<br />
                            together at<br />
                            last
                        </h2>
                        <p className="text-white/70 text-xs sm:text-sm md:text-base max-w-md leading-relaxed">
                            AI models and professional editing tools in one node-based
                            platform. Turn creative vision into scalable workflows without
                            compromising quality.
                        </p>
                    </div>

                    {/* Right content - AI models list */}
                    <div className="w-full lg:w-3/5 overflow-hidden flex-1 lg:flex-initial">
                        <div
                            className="transition-transform duration-200 ease-out"
                            style={{
                                transform: `translateY(-${modelListOffset}px)`,
                            }}
                        >
                            {aiModels.map((model, index) => (
                                <div
                                    key={model.name}
                                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-[1.2] transition-all duration-300 ${index === highlightedModelIndex
                                            ? "text-[#e2ff66]"
                                            : "text-white"
                                        }`}
                                    style={{
                                        height: `${itemHeight}px`,
                                    }}
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}