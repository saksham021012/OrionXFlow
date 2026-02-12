'use client';

import { useCallback, useEffect, useState } from "react";
import {
    ReactFlow,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    ConnectionLineType,
    NodeChange,
    useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import * as Cards from "./HeroCards";

const nodeTypes = {
    card3d: Cards.Card3D,
    colorRef: Cards.ColorRefCard,
    stableDiffusion: Cards.StableDiffusionCard,
    textCard: Cards.TextCard,
    fluxCard: Cards.FluxCard,
    videoCard: Cards.VideoCard,
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

// Responsive node dimensions
const getResponsiveDimensions = (width: number): Record<string, { width: number; height: number }> => {
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    return {
        "3d": { width: isMobile ? 110 : isTablet ? 150 : 200, height: isMobile ? 160 : isTablet ? 230 : 304 },
        "color": { width: isMobile ? 110 : isTablet ? 150 : 200, height: isMobile ? 100 : isTablet ? 140 : 184 },
        "stable": { width: isMobile ? 180 : isTablet ? 260 : 340, height: isMobile ? 280 : isTablet ? 420 : 544 },
        "text": { width: isMobile ? 100 : isTablet ? 140 : 190, height: isMobile ? 100 : isTablet ? 120 : 150 },
        "flux": { width: isMobile ? 110 : isTablet ? 160 : 220, height: isMobile ? 130 : isTablet ? 190 : 264 },
        "video": { width: isMobile ? 180 : isTablet ? 260 : 340, height: isMobile ? 280 : isTablet ? 420 : 544 },
    };
};

export default function HeroFlow() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges] = useEdgesState(initialEdges);
    const [containerWidth, setContainerWidth] = useState(1400);
    const { setViewport } = useReactFlow();

    // Handle window resize
    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            setContainerWidth(width);

            // Adjust zoom and position based on screen width
            if (width < 640) {
                setViewport({ x: 10, y: 0, zoom: 0.45 }, { duration: 0 });
            } else if (width < 1024) {
                setViewport({ x: 20, y: 0, zoom: 0.7 }, { duration: 0 });
            } else {
                setViewport({ x: 0, y: 0, zoom: 1.0 }, { duration: 0 });
            }

            // Update initial positions for mobile if needed
            if (width < 640) {
                setNodes((nds) => nds.map((node) => {
                    if (node.id === "3d") return { ...node, position: { x: 10, y: 20 } };
                    if (node.id === "color") return { ...node, position: { x: 10, y: 200 } };
                    if (node.id === "stable") return { ...node, position: { x: 140, y: 50 } };
                    if (node.id === "text") return { ...node, position: { x: 340, y: 20 } };
                    if (node.id === "flux") return { ...node, position: { x: 340, y: 150 } };
                    if (node.id === "video") return { ...node, position: { x: 470, y: 50 } };
                    return node;
                }));
            } else {
                setNodes(initialNodes);
            }
        };

        updateLayout();
        window.addEventListener("resize", updateLayout);
        return () => window.removeEventListener("resize", updateLayout);
    }, [setViewport, setNodes]);

    // Custom handler to clamp node positions within bounds
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const clampedChanges = changes.map((change) => {
                if (change.type === "position" && change.dragging && change.position) {
                    const node = nodes.find((n) => n.id === change.id);
                    if (!node) return change;

                    const dimensions = getResponsiveDimensions(containerWidth)[change.id] || { width: 200, height: 300 };

                    // Allow some overflow for better feel, or strict clamping
                    const maxX = Math.max(1400, containerWidth * 1.5); // Allow dragging beyond window width if zoomed
                    const maxY = 1000;

                    return {
                        ...change,
                        position: {
                            x: Math.max(-100, Math.min(maxX, change.position.x)),
                            y: Math.max(-50, Math.min(maxY, change.position.y)),
                        },
                    };
                }
                return change;
            });
            onNodesChange(clampedChanges);
        },
        [nodes, onNodesChange, containerWidth]
    );

    return (
        <div className="w-full h-full relative px-30">
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
                panOnDrag={true}
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
                minZoom={0.2}
                maxZoom={2}
                autoPanOnNodeDrag={false}
            />
        </div>
    );
}
