'use client';

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const workflowCards = [
    { title: "Relight – Product", image: "/infinite-scroll/Product.avif", highlight: false },
    { title: "Wan Lora – Rotate", image: "/infinite-scroll/Rotate.avif", highlight: true },
    { title: "Workflow 01", image: "/infinite-scroll/Workflow01.avif", highlight: false },
    { title: "Workflow 02", image: "/infinite-scroll/Workflow02.avif", highlight: false },
    { title: "Workflow 03", image: "/infinite-scroll/Workflow03.avif", highlight: false },
];

export default function ExploreWorkflows() {
    const [singleSetWidth, setSingleSetWidth] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);

    // Triple the cards for infinite buffer
    const tripleCards = [...workflowCards, ...workflowCards, ...workflowCards];

    useEffect(() => {
        if (carouselRef.current) {
            // Calculate width of exactly one set of cards
            const totalWidth = carouselRef.current.scrollWidth;
            const singleWidth = totalWidth / 3;
            setSingleSetWidth(singleWidth);

            // Start in the middle set
            x.set(-singleWidth);
        }
    }, [x]);

    // Handle wrapping on every frame, including during momentum/inertia
    useMotionValueEvent(x, "change", (latest) => {
        if (singleSetWidth === 0) return;

        // If we slide too far left (past the second set), loop back to the first set equivalent
        if (latest <= -singleSetWidth * 2) {
            x.set(latest + singleSetWidth);
        }
        // If we slide too far right (moving into the first set), loop forward to the second set equivalent
        else if (latest >= 0) {
            x.set(latest - singleSetWidth);
        }
    });

    return (
        <section className="bg-[#252525] text-white py-20 px-12 overflow-hidden">
            <h2 className="text-6xl md:text-7xl ml-50 lg:text-8xl font-normal leading-none mb-8">
                Explore Our
                <br />
                Workflows
            </h2>
            <p className="text-white text-lg max-w-lg mb-12 ml-50 leading-relaxed">
                From multi-layer compositing to matte manipulation, Nodefy keeps up
                with your creativity with all the editing tools you recognize and rely
                on.
            </p>

            {/* Draggable Cards Section */}
            <div className="relative -mx-12 cursor-grab active:cursor-grabbing">
                <motion.div
                    ref={carouselRef}
                    drag="x"
                    style={{ x }}
                    dragElastic={0} // Prevents "bouncing" against virtual boundaries
                    className="flex gap-6 px-12"
                >
                    {tripleCards.map((card, index) => (
                        <div
                            key={`${card.title}-${index}`}
                            className="min-w-[420px] flex-shrink-0"
                        >
                            <h3 className="text-xl font-normal mb-4">
                                {card.highlight ? (
                                    <span className="text-[#e2ff66]">{card.title}</span>
                                ) : (
                                    card.title
                                )}
                            </h3>
                            <div className="relative h-[250px] rounded-xl overflow-hidden pointer-events-none">
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 420px"
                                    className="object-cover"
                                />
                                <div className="absolute bottom-4 left-4 pointer-events-auto">
                                    <Link href="/sign-up">
                                        <span className="bg-[#e2ff66] text-black px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer">
                                            Try
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
