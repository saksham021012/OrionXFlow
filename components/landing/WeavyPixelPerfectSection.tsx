import React, { useState, useEffect, useRef } from 'react';
import { Camera, Crop, Wand2, Sparkles, Layers, ZoomIn, Box, Image as ImageIcon, Palette, Sun, CloudCog, LucideIcon } from 'lucide-react';

interface Tool {
    name: string;
    icon: LucideIcon;
}

interface WeavyToolsSectionProps {
    className?: string;
}

const WeavyToolsSection: React.FC<WeavyToolsSectionProps> = ({ className = '' }) => {
    const [activeToolIndex, setActiveToolIndex] = useState<number>(0);
    const [scrollProgress, setScrollProgress] = useState<number>(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState<boolean>(false);

    const tools: Tool[] = [
        { name: 'Default', icon: ImageIcon },
        { name: 'Crop', icon: Crop },
        { name: 'Invert', icon: Sparkles },
        { name: 'Outpaint', icon: Box },
        { name: 'Inpaint', icon: Wand2 },
        { name: 'Mask Extractor', icon: Layers },
        { name: 'Upscale', icon: ZoomIn },
        { name: 'Painter', icon: Palette },
        { name: 'Channels', icon: CloudCog },
        { name: 'Image Describer', icon: Camera },
        { name: 'Relight', icon: Sun },
        { name: 'Z Depth Extractor', icon: Box }
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
            setScrollProgress(progress);
            setIsInView(rect.top < windowHeight && rect.bottom > 0);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-rotate carousel on mobile
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveToolIndex((prev) => (prev + 1) % tools.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [tools.length]);

    return (
        <div ref={sectionRef} className={`weavy-tools-wrapper ${className}`}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #F5F3EF;
          overflow-x: hidden;
        }

        .weavy-tools-wrapper {
          background: #F5F3EF;
          position: relative;
          overflow: hidden;
        }

        /* Part 1: Professional Tools Section */
        .tools-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px;
          position: relative;
        }

        .tools-header {
          text-align: center;
          margin-bottom: 80px;
          opacity: 0;
          animation: fadeInUp 1s ease-out forwards;
        }

        .tools-title {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 400;
          color: #1a1a1a;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .tools-subtitle {
          font-size: clamp(16px, 2vw, 20px);
          color: #666;
          font-weight: 400;
        }

        /* Desktop Layout */
        .tools-container {
          position: relative;
          width: 100%;
          max-width: 1400px;
          height: 600px;
          display: none;
        }

        @media (min-width: 1024px) {
          .tools-container {
            display: block;
          }
        }

        .center-product {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          animation: scaleIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }

        .product-stage {
          position: relative;
          width: 400px;
          height: 450px;
        }

        .pedestal {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 280px;
          height: 280px;
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }

        .vase {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -60%);
          width: 240px;
          height: 280px;
          z-index: 2;
        }

        .vase-body {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .vase-top {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 80px;
          background: linear-gradient(135deg, #B8E6D5 0%, #7EC8A3 100%);
          border-radius: 50% 50% 0 0 / 60% 60% 0 0;
          border: 4px solid #2d3436;
          border-bottom: none;
          box-shadow: 
            inset 0 -10px 20px rgba(0, 0, 0, 0.1),
            0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .vase-top::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 30px;
          background: #2d3436;
          border-radius: 50% 50% 0 0 / 80% 80% 0 0;
        }

        .vase-top::after {
          content: '';
          position: absolute;
          top: 5px;
          left: 10%;
          width: 80%;
          height: 60%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent);
          border-radius: 50%;
          filter: blur(8px);
        }

        .vase-neck {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 60px;
          background: linear-gradient(135deg, #7EC8A3 0%, #4A9B7F 100%);
          clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
        }

        .vase-middle {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 120px;
          background: linear-gradient(180deg, #2d3436 0%, #1a1d1f 100%);
          border-radius: 50% / 30%;
          box-shadow: 
            inset 0 10px 30px rgba(0, 0, 0, 0.3),
            0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .vase-bottom {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 100px;
          background: linear-gradient(180deg, #1a1d1f 0%, #0d0f10 100%);
          border-radius: 0 0 50% 50% / 0 0 40% 40%;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .texture-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 3%),
            radial-gradient(circle at 60% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 2%),
            radial-gradient(circle at 40% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 2%),
            radial-gradient(circle at 75% 45%, rgba(255, 255, 255, 0.09) 0%, transparent 3%);
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .backdrop {
          position: absolute;
          right: -100px;
          top: 50%;
          transform: translateY(-50%);
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #FFD54F 0%, #FFA726 100%);
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.6;
          z-index: 1;
        }

        .tool-label {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          font-size: 15px;
          color: #2d3436;
          font-weight: 500;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .tool-label.visible {
          opacity: 1;
        }

        .tool-label:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 1);
        }

        .tool-icon {
          width: 20px;
          height: 20px;
          color: #6C63FF;
        }

        /* Tool positions - Left side */
        .tool-label:nth-child(1) { left: 5%; top: 15%; animation: fadeInLeft 0.8s ease-out 0.2s both; }
        .tool-label:nth-child(2) { left: 8%; top: 30%; animation: fadeInLeft 0.8s ease-out 0.3s both; }
        .tool-label:nth-child(3) { left: 3%; top: 45%; animation: fadeInLeft 0.8s ease-out 0.4s both; }
        .tool-label:nth-child(4) { left: 6%; top: 60%; animation: fadeInLeft 0.8s ease-out 0.5s both; }
        .tool-label:nth-child(5) { left: 8%; top: 75%; animation: fadeInLeft 0.8s ease-out 0.6s both; }

        /* Tool positions - Right side */
        .tool-label:nth-child(7) { right: 5%; top: 15%; animation: fadeInRight 0.8s ease-out 0.2s both; }
        .tool-label:nth-child(8) { right: 8%; top: 30%; animation: fadeInRight 0.8s ease-out 0.3s both; }
        .tool-label:nth-child(9) { right: 3%; top: 45%; animation: fadeInRight 0.8s ease-out 0.4s both; }
        .tool-label:nth-child(10) { right: 6%; top: 60%; animation: fadeInRight 0.8s ease-out 0.5s both; }
        .tool-label:nth-child(11) { right: 8%; top: 75%; animation: fadeInRight 0.8s ease-out 0.6s both; }

        /* Mobile Carousel */
        .mobile-carousel {
          display: block;
          width: 100%;
          overflow: hidden;
          position: relative;
          padding: 40px 0;
        }

        @media (min-width: 1024px) {
          .mobile-carousel {
            display: none;
          }
        }

        .carousel-track {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .carousel-slide {
          flex-shrink: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 0 24px;
        }

        .carousel-product {
          position: relative;
          width: 300px;
          height: 350px;
        }

        .carousel-label {
          font-size: 20px;
          font-weight: 500;
          color: #2d3436;
          text-align: center;
        }

        /* Part 2: Control the Outcome */
        .control-section {
          min-height: 100vh;
          padding: 120px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .control-header {
          text-align: center;
          margin-bottom: 60px;
          opacity: 0;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .control-title {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 20px;
          letter-spacing: -0.03em;
        }

        .control-subtitle {
          font-size: clamp(16px, 2vw, 20px);
          color: #666;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .interface-container {
          width: 100%;
          max-width: 1400px;
          background: #1a1d1f;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.3);
          opacity: 0;
          animation: scaleIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
        }

        .interface-layout {
          display: grid;
          grid-template-columns: 280px 1fr 320px;
          height: 700px;
        }

        @media (max-width: 1024px) {
          .interface-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
        }

        .layers-panel {
          background: #0d0f10;
          border-right: 1px solid #2d3436;
          padding: 24px;
          overflow-y: auto;
        }

        .panel-title {
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .layer-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #1a1d1f;
          border-radius: 6px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .layer-item:hover {
          background: #252a2e;
        }

        .layer-item.active {
          background: #2d3436;
          border-color: #6C63FF;
        }

        .layer-icon {
          width: 16px;
          height: 16px;
          color: #888;
        }

        .layer-name {
          font-size: 13px;
          color: #e0e0e0;
          flex: 1;
        }

        .canvas-area {
          background: #252a2e;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .canvas-content {
          position: relative;
          width: 80%;
          aspect-ratio: 1024/1240;
          background: linear-gradient(135deg, #D4C5A9 0%, #E8DCC4 50%, #F5E6D3 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .astronaut-scene {
          width: 100%;
          height: 100%;
          position: relative;
          background: 
            radial-gradient(circle at 30% 40%, rgba(255, 230, 180, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(230, 210, 160, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, #D4C5A9 0%, #E8DCC4 100%);
        }

        .circular-window {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          aspect-ratio: 1;
          border: 8px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          backdrop-filter: blur(5px);
        }

        .astronaut-figure {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40%;
          height: 50%;
          background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
          border-radius: 50% 50% 40% 40%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .astronaut-helmet {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 80%;
          background: radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.9), rgba(200, 220, 240, 0.7));
          border-radius: 50%;
          border: 4px solid #bbb;
        }

        .text-overlay {
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(240, 235, 220, 0.95);
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 18px;
          font-weight: 500;
          color: #2d3436;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: fadeInUp 0.8s ease-out 1s both;
        }

        .properties-panel {
          background: #0d0f10;
          border-left: 1px solid #2d3436;
          padding: 24px;
          overflow-y: auto;
        }

        .property-group {
          margin-bottom: 24px;
        }

        .property-label {
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .property-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .property-input {
          background: #1a1d1f;
          border: 1px solid #2d3436;
          border-radius: 6px;
          padding: 8px 12px;
          color: #e0e0e0;
          font-size: 13px;
          transition: all 0.2s;
        }

        .property-input:focus {
          outline: none;
          border-color: #6C63FF;
        }

        .property-input-label {
          font-size: 10px;
          color: #666;
          margin-bottom: 4px;
        }

        /* Part 3: Workflow to App Mode */
        .workflow-section {
          min-height: 100vh;
          padding: 120px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .workflow-header {
          text-align: center;
          margin-bottom: 40px;
          opacity: 0;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .workflow-subtitle-top {
          font-size: 14px;
          color: #888;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .workflow-title {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 400;
          color: #1a1a1a;
          margin-bottom: 8px;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .workflow-title-split {
          display: block;
        }

        .workflow-subtitle-bottom {
          font-size: clamp(14px, 1.5vw, 16px);
          color: #666;
          margin-top: 16px;
        }

        .transformation-sequence {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1400px;
          opacity: 0;
          animation: fadeInUp 1s ease-out 0.4s both;
        }

        .transform-frame {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          transform: translateY(30px);
        }

        .transform-frame.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .transform-frame:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .frame-visual {
          width: 100%;
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
          border-radius: 8px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .frame-nodes {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          padding: 20px;
        }

        .node {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6C63FF 0%, #5A52D5 100%);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(108, 99, 255, 0.3);
          transition: all 0.3s;
        }

        .node.simplified {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }

        .frame-label {
          text-align: center;
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Scroll-triggered animations */
        .scroll-animate {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .scroll-animate.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

            {/* Part 1: Professional Tools Section */}
            <section className="tools-section">
                <div className="tools-header">
                    <h2 className="tools-title">With all the professional tools you rely on</h2>
                    <p className="tools-subtitle">In one seamless workflow</p>
                </div>

                {/* Desktop Layout */}
                <div className="tools-container">
                    <div className="backdrop"></div>

                    <div className="center-product">
                        <div className="product-stage">
                            <div className="pedestal"></div>
                            <div className="vase">
                                <div className="vase-body">
                                    <div className="vase-top"></div>
                                    <div className="vase-neck"></div>
                                    <div className="vase-middle"></div>
                                    <div className="vase-bottom"></div>
                                    <div className="texture-overlay"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left side tools */}
                    {tools.slice(0, 6).map((tool, index) => (
                        <div key={`left-${index}`} className={`tool-label ${isInView ? 'visible' : ''}`}>
                            <tool.icon className="tool-icon" />
                            <span>{tool.name}</span>
                        </div>
                    ))}

                    {/* Right side tools */}
                    {tools.slice(6).map((tool, index) => (
                        <div key={`right-${index}`} className={`tool-label ${isInView ? 'visible' : ''}`}>
                            <tool.icon className="tool-icon" />
                            <span>{tool.name}</span>
                        </div>
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="mobile-carousel">
                    <div
                        className="carousel-track"
                        style={{ transform: `translateX(-${activeToolIndex * 100}%)` }}
                    >
                        {tools.map((tool, index) => (
                            <div key={`mobile-${index}`} className="carousel-slide">
                                <div className="carousel-product">
                                    <div className="product-stage">
                                        <div className="pedestal"></div>
                                        <div className="vase">
                                            <div className="vase-body">
                                                <div className="vase-top"></div>
                                                <div className="vase-neck"></div>
                                                <div className="vase-middle"></div>
                                                <div className="vase-bottom"></div>
                                                <div className="texture-overlay"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="carousel-label">{tool.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Part 2: Control the Outcome */}
            <section className="control-section">
                <div className="control-header">
                    <h2 className="control-title">Control the Outcome</h2>
                    <p className="control-subtitle">
                        Layers, type, and blends—all the tools to bring your wildest ideas to life.
                        Your creativity, our compositing power.
                    </p>
                </div>

                <div className="interface-container">
                    <div className="interface-layout">
                        {/* Left Panel - Layers */}
                        <div className="layers-panel">
                            <div className="panel-title">Title sequence</div>
                            <div className="panel-title" style={{ marginTop: '24px' }}>LAYERS</div>

                            <div className="layer-item">
                                <Layers className="layer-icon" />
                                <span className="layer-name">CANVAS</span>
                            </div>

                            <div className="layer-item">
                                <ImageIcon className="layer-icon" />
                                <span className="layer-name">WALKIE TALKIE</span>
                            </div>

                            <div className="layer-item active">
                                <span className="layer-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px' }}>T</span> TEXT LAYER
                                </span>
                            </div>

                            <div className="layer-item">
                                <span className="layer-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px' }}>T</span> TEXT LAYER
                                </span>
                            </div>

                            <div className="layer-item">
                                <ImageIcon className="layer-icon" />
                                <span className="layer-name">ASTRONAUT</span>
                            </div>

                            <div className="layer-item">
                                <ImageIcon className="layer-icon" />
                                <span className="layer-name">SPACESHIP</span>
                            </div>
                        </div>

                        {/* Center - Canvas */}
                        <div className="canvas-area">
                            <div className="canvas-content">
                                <div className="astronaut-scene">
                                    <div className="circular-window"></div>
                                    <div className="astronaut-figure">
                                        <div className="astronaut-helmet"></div>
                                    </div>
                                    <div className="text-overlay">Directed by Michael Aber</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Properties */}
                        <div className="properties-panel">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '18px', color: '#e0e0e0' }}>T</span>
                                <span style={{ fontSize: '14px', color: '#e0e0e0', fontWeight: '500' }}>TEXT LAYER</span>
                            </div>

                            <div className="property-group">
                                <div className="property-label">DIMENSIONS</div>
                                <div className="property-grid">
                                    <div>
                                        <div className="property-input-label">W</div>
                                        <input type="text" className="property-input" value="1024" readOnly />
                                    </div>
                                    <div>
                                        <div className="property-input-label">H</div>
                                        <input type="text" className="property-input" value="1240" readOnly />
                                    </div>
                                </div>
                            </div>

                            <div className="property-group">
                                <div className="property-label">POSITION</div>
                                <div className="property-grid">
                                    <div>
                                        <div className="property-input-label">X</div>
                                        <input type="text" className="property-input" value="240" readOnly />
                                    </div>
                                    <div>
                                        <div className="property-input-label">Y</div>
                                        <input type="text" className="property-input" value="724" readOnly />
                                    </div>
                                </div>
                            </div>

                            <div className="property-group">
                                <div className="property-label">ROTATION</div>
                                <input type="text" className="property-input" value="90°" readOnly />
                            </div>

                            <div className="property-group">
                                <div className="property-label">OPACITY</div>
                                <input type="text" className="property-input" value="100%" readOnly />
                            </div>

                            <div className="property-group">
                                <div className="property-label">BLEND MODE</div>
                                <select className="property-input" style={{ width: '100%' }}>
                                    <option>NORMAL</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Part 3: Workflow to App Mode */}
            <section className="workflow-section">
                <div className="workflow-header">
                    <div className="workflow-subtitle-top">Maximize your team ability, by automatically generating a simplified UI</div>
                    <h2 className="workflow-title">
                        <span className="workflow-title-split">From Workflow</span>
                        <span className="workflow-title-split">to App Mode</span>
                    </h2>
                    <p className="workflow-subtitle-bottom">Maximize your team ability, by automatically generating a simplified UI</p>
                </div>

                <div className="transformation-sequence">
                    {[...Array(7)].map((_, index) => (
                        <div
                            key={index}
                            className={`transform-frame ${scrollProgress > 0.7 ? 'visible' : ''}`}
                            style={{ transitionDelay: `${index * 0.1}s` }}
                        >
                            <div className="frame-visual">
                                <div className="frame-nodes">
                                    {index < 3 && [...Array(9)].map((_, i) => (
                                        <div key={i} className="node"></div>
                                    ))}
                                    {index >= 3 && index < 5 && [...Array(6)].map((_, i) => (
                                        <div key={i} className="node"></div>
                                    ))}
                                    {index >= 5 && [...Array(2)].map((_, i) => (
                                        <div key={i} className="node simplified"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="frame-label">
                                {index < 3 && 'Complex Workflow'}
                                {index >= 3 && index < 5 && 'Streamlining'}
                                {index >= 5 && 'Simplified App'}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default WeavyToolsSection;