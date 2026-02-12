'use client';

import Image from "next/image";
import { Handle, Position } from "reactflow";

export const Card3D = () => (
    <div className="bg-[#d8dce6] p-2 sm:p-3 lg:p-4 w-[110px] sm:w-[150px] lg:w-[200px] cursor-grab active:cursor-grabbing  border-0">
        <div className="flex justify-between mb-1 sm:mb-2">
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#555] uppercase tracking-wide font-medium">
                3D
            </span>
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#888]">RODIN 2.0</span>
        </div>
        <div className="h-[120px] sm:h-[180px] lg:h-[240px] overflow-hidden bg-[#e8e5e0]">
            <Image
                src="/images/3d_card.avif"
                alt="3D"
                width={180}
                height={230}
                priority
                className="object-contain w-full h-full"
                draggable={false}
            />
        </div>
        <Handle
            type="source"
            position={Position.Right}
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0!"
        />
    </div>
);

export const ColorRefCard = () => (
    <div className="p-2 sm:p-3 lg:p-4 w-[110px] sm:w-[150px] lg:w-[200px] bg-[#4a7aa8] cursor-grab active:cursor-grabbing border-0">
        <div className="mb-1 sm:mb-2">
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-white uppercase tracking-wide font-medium">
                Color Reference
            </span>
        </div>
        <div className="h-[60px] sm:h-[80px] lg:h-[120px] overflow-hidden">
            <Image
                src="/images/hero_mobile.avif"
                alt="Color"
                width={180}
                height={110}
                priority
                className="object-contain w-full h-full"
                draggable={false}
            />
        </div>
        <Handle
            type="source"
            position={Position.Right}
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0!"
        />
    </div>
);

export const StableDiffusionCard = () => (
    <div className="bg-[#e8e4dc] p-2 sm:p-3 lg:p-4 w-[180px] sm:w-[260px] lg:w-[340px] cursor-grab active:cursor-grabbing border-0">
        <div className="flex justify-between mb-1 sm:mb-2">
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Image
            </span>
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#888]">STABLE DIFFUSION</span>
        </div>
        <div className="h-[240px] sm:h-[360px] lg:h-[480px] overflow-hidden">
            <Image
                src="/images/STABLE_DIFFUSION.avif"
                alt="Stable Diffusion"
                width={320}
                height={470}
                priority
                className="object-contain w-full h-full"
                draggable={false}
            />
        </div>
        <Handle
            type="target"
            position={Position.Left}
            id="left-top"
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0! top-[30%]!"
        />
        <Handle
            type="target"
            position={Position.Left}
            id="left-bottom"
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0! top-[70%]!"
        />
        <Handle
            type="source"
            position={Position.Right}
            id="right-top"
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0! top-[30%]!"
        />
        <Handle
            type="source"
            position={Position.Right}
            id="right-bottom"
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0! top-[70%]!"
        />
    </div>
);

export const TextCard = () => (
    <div className="bg-white p-3 sm:p-4 lg:p-5 w-[100px] sm:w-[140px] lg:w-[190px] cursor-grab active:cursor-grabbing border-0">
        <div className="mb-2 sm:mb-3">
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Text
            </span>
        </div>
        <p className="text-[5px] sm:text-[7px] lg:text-[10px] text-[#444] leading-relaxed">
            A Great-Tailed Grackle bird is flying from the background and settling on
            the model&apos;s shoulder slowly and barely moves. The model looks at the
            camera, then bird flies away. cinematic.
        </p>
        <Handle
            type="target"
            position={Position.Left}
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0!"
        />
        <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0!"
        />
    </div>
);

export const FluxCard = () => (
    <div className="bg-[#f0ede4] p-2 sm:p-3 lg:p-4 w-[110px] sm:w-[160px] lg:w-[220px] cursor-grab active:cursor-grabbing border-0">
        <div className="flex justify-between mb-1 sm:mb-2">
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Image
            </span>
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#888]">FLUX PRO 1.1</span>
        </div>
        <div className="h-[90px] sm:h-[140px] lg:h-[200px] overflow-hidden">
            <Image
                src="/images/bird_desktop.avif"
                alt="Flux Pro Bird"
                width={200}
                height={190}
                className="object-cover w-full h-full"
                draggable={false}
            />
        </div>
        <Handle
            type="target"
            position={Position.Top}
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0!"
        />
        <Handle
            type="source"
            position={Position.Right}
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0!"
        />
    </div>
);

export const VideoCard = () => (
    <div className="bg-[#f5f0e8] p-2 sm:p-3 lg:p-4 w-[180px] sm:w-[260px] lg:w-[340px] cursor-grab active:cursor-grabbing border-0">
        <div className="flex justify-between mb-1 sm:mb-2">
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Video
            </span>
            <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-[#888]">MINIMAX VIDEO</span>
        </div>
        <div className="h-[240px] sm:h-[360px] lg:h-[480px] overflow-hidden">
            <Image
                src="/images/minimax.png"
                alt="Minimax Video"
                width={320}
                height={470}
                className="object-contain w-full h-full"
                draggable={false}
            />
        </div>
        <Handle
            type="target"
            position={Position.Left}
            id="left-top"
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0! top-[30%]!"
        />
        <Handle
            type="target"
            position={Position.Left}
            id="left-bottom"
            className="bg-[#aaa]! w-1.5! h-1.5! sm:w-2.5! sm:h-2.5! lg:w-3! lg:h-3! border-0! top-[70%]!"
        />
    </div>
);
