'use client';

import Image from "next/image";
import { useCallback } from "react";
import {
    ReactFlow,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    ConnectionLineType,
    NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom nodes for React Flow
const Card3D = () => (
    <div className="bg-[#d8dce6] p-4 w-[200px] cursor-grab active:cursor-grabbing border-0">
        <div className="flex justify-between mb-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wide font-medium">
                3D
            </span>
            <span className="text-[10px] text-[#888]">RODIN 2.0</span>
        </div>
        <div className="h-[240px] overflow-hidden bg-[#e8e5e0]">
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
            className="!bg-[#aaa] !w-3 !h-3 !border-0"
        />
    </div>
);

const ColorRefCard = () => (
    <div className="p-4 w-[200px] bg-[#4a7aa8] cursor-grab active:cursor-grabbing border-0">
        <div className="mb-2">
            <span className="text-[10px] text-white uppercase tracking-wide font-medium">
                Color Reference
            </span>
        </div>
        <div className="h-[120px] overflow-hidden">
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
            className="!bg-[#aaa] !w-3 !h-3 !border-0"
        />
    </div>
);

const StableDiffusionCard = () => (
    <div className="bg-[#e8e4dc] p-4 w-[340px] cursor-grab active:cursor-grabbing border-0">
        <div className="flex justify-between mb-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Image
            </span>
            <span className="text-[10px] text-[#888]">STABLE DIFFUSION</span>
        </div>
        <div className="h-[480px] overflow-hidden">
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
            className="!bg-[#aaa] !w-3 !h-3 !border-0 !top-[30%]"
        />
        <Handle
            type="target"
            position={Position.Left}
            id="left-bottom"
            className="!bg-[#aaa] !w-3 !h-3 !border-0 !top-[70%]"
        />
        <Handle
            type="source"
            position={Position.Right}
            id="right-top"
            className="!bg-[#aaa] !w-3 !h-3 !border-0 !top-[30%]"
        />
        <Handle
            type="source"
            position={Position.Right}
            id="right-bottom"
            className="!bg-[#aaa] !w-3 !h-3 !border-0 !top-[70%]"
        />
    </div>
);

const TextCard = () => (
    <div className="bg-white p-5 w-[190px] cursor-grab active:cursor-grabbing border-0">
        <div className="mb-3">
            <span className="text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Text
            </span>
        </div>
        <p className="text-[10px] text-[#444] leading-relaxed">
            A Great-Tailed Grackle bird is flying from the background and settling on
            the model&apos;s shoulder slowly and barely moves. The model looks at the
            camera, then bird flies away. cinematic.
        </p>
        <Handle
            type="target"
            position={Position.Left}
            className="!bg-[#aaa] !w-3 !h-3 !border-0"
        />
        <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="!bg-[#aaa] !w-3 !h-3 !border-0"
        />
    </div>
);

const FluxCard = () => (
    <div className="bg-[#f0ede4] p-4 w-[220px] cursor-grab active:cursor-grabbing border-0">
        <div className="flex justify-between mb-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Image
            </span>
            <span className="text-[10px] text-[#888]">FLUX PRO 1.1</span>
        </div>
        <div className="h-[200px] overflow-hidden">
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
            className="!bg-[#aaa] !w-3 !h-3 !border-0"
        />
        <Handle
            type="source"
            position={Position.Right}
            className="!bg-[#aaa] !w-3 !h-3 !border-0"
        />
    </div>
);

const VideoCard = () => (
    <div className="bg-[#f5f0e8] p-4 w-[340px] cursor-grab active:cursor-grabbing border-0">
        <div className="flex justify-between mb-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wide font-medium">
                Video
            </span>
            <span className="text-[10px] text-[#888]">MINIMAX VIDEO</span>
        </div>
        <div className="h-[480px] overflow-hidden">
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
            className="!bg-[#aaa] !w-3 !h-3 !border-0 !top-[30%]"
        />
        <Handle
            type="target"
            position={Position.Left}
            id="left-bottom"
            className="!bg-[#aaa] !w-3 !h-3 !border-0 !top-[70%]"
        />
    </div>
);

const nodeTypes = {
    card3d: Card3D,
    colorRef: ColorRefCard,
    stableDiffusion: StableDiffusionCard,
    textCard: TextCard,
    fluxCard: FluxCard,
    videoCard: VideoCard,
};

const initialNodes: Node[] = [
    { id: "3d", type: "card3d", position: { x: 20, y: 50 }, data: {} },
    { id: "color", type: "colorRef", position: { x: 20, y: 400 }, data: {} },
    {
        id: "stable",
        type: "stableDiffusion",
        position: { x: 300, y: 100 },
        data: {},
    },
    { id: "text", type: "textCard", position: { x: 750, y: 50 }, data: {} },
    { id: "flux", type: "fluxCard", position: { x: 750, y: 350 }, data: {} },
    { id: "video", type: "videoCard", position: { x: 1050, y: 100 }, data: {} },
];

const initialEdges: Edge[] = [
    {
        id: "e1",
        source: "3d",
        target: "stable",
        targetHandle: "left-top",
        type: "default",
        style: { stroke: "#bbb", strokeWidth: 1.5 },
        animated: false,
    },
    {
        id: "e2",
        source: "color",
        target: "stable",
        targetHandle: "left-bottom",
        type: "default",
        style: { stroke: "#bbb", strokeWidth: 1.5 },
        animated: false,
    },
    {
        id: "e3",
        source: "stable",
        sourceHandle: "right-top",
        target: "text",
        type: "default",
        style: { stroke: "#bbb", strokeWidth: 1.5 },
        animated: false,
    },
    {
        id: "e4",
        source: "stable",
        sourceHandle: "right-bottom",
        target: "flux",
        type: "default",
        style: { stroke: "#bbb", strokeWidth: 1.5 },
        animated: false,
    },
    {
        id: "e5",
        source: "text",
        sourceHandle: "right",
        target: "video",
        targetHandle: "left-top",
        type: "default",
        style: { stroke: "#bbb", strokeWidth: 1.5 },
        animated: false,
    },
    {
        id: "e6",
        source: "flux",
        target: "video",
        targetHandle: "left-bottom",
        type: "default",
        style: { stroke: "#bbb", strokeWidth: 1.5 },
        animated: false,
    },
];

// Node dimensions for boundary calculations
const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
    "3d": { width: 200, height: 304 }, // padding + content
    "color": { width: 200, height: 184 },
    "stable": { width: 340, height: 544 },
    "text": { width: 190, height: 150 },
    "flux": { width: 220, height: 264 },
    "video": { width: 340, height: 544 },
};

const HERO_SECTION_HEIGHT = 900; // Match the container height

export default function HeroFlow() {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges] = useEdgesState(initialEdges);

    // Custom handler to clamp node positions within bounds
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const clampedChanges = changes.map((change) => {
                // Only process position changes with dragging flag
                if (change.type === "position" && change.dragging && change.position) {
                    const node = nodes.find((n) => n.id === change.id);
                    if (!node) return change;

                    const nodeDimensions = NODE_DIMENSIONS[change.id] || { width: 200, height: 300 };

                    return {
                        ...change,
                        position: {
                            x: Math.max(0, Math.min(1400 - nodeDimensions.width, change.position.x)),
                            y: Math.max(0, Math.min(HERO_SECTION_HEIGHT - nodeDimensions.height, change.position.y)),
                        },
                    };
                }
                return change;
            });
            onNodesChange(clampedChanges);
        },
        [nodes, onNodesChange]
    );

    return (
        <div className="w-full h-[900px] relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                defaultEdgeOptions={{
                    type: "default",
                    style: {},
                }}
                defaultViewport={{ x: 0, y: 0, zoom: 1.1 }}
                panOnDrag={false}
                panOnScroll={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                preventScrolling={false}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                proOptions={{ hideAttribution: true }}
                className="!bg-transparent !bg-none"
                minZoom={1}
                maxZoom={1}
                autoPanOnNodeDrag={false}
            />
        </div>
    );
}