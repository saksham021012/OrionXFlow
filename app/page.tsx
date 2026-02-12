"use client";

import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import {
  Navbar,
  HeroFlow,
  StickyModels,
  ExploreWorkflows,
  Footer,
  ToolsSection,
  ControlSection,
} from "@/components/landing";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-black font-sans">
      {/* Navbar with Banner */}
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative w-full ml-15"
        style={{
          minHeight: "950px",
          backgroundColor: "#eff1f5", // Cool gray/off-white match
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "20px 20px", // Larger grid spacing
        }}
      >
        {/* Headline */}
        <div className="w-full max-w-[1600px] mx-auto px-6 pt-24 pb-12 relative z-[100] pointer-events-none">
          <div className="flex gap-18">
            {/* Left Column */}
            <div className="">
              <span className="block text-[68.62px] leading-[0.9] tracking-tight font-bold text-black ml-10">
                OrionXFlow
              </span>
            </div>

            {/* Right Column */}
            <div className="">
              <span className="block text-[68.62px] leading-[0.9] tracking-tight font-medium text-black mb-6">
                Artistic Intelligence
              </span>
              <p className="text-lg md:text-xl text-[#444] leading-relaxed max-w-lg">
                Turn your creative vision into scalable workflows.
                <br />
                Access all AI models and professional editing tools
                <br />
                in one node based platform.
              </p>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div
          className="absolute left-0 right-0 top-0 bottom-0 overflow-visible mt-[300px] "
          style={{ zIndex: 10 }}
        >
          <ReactFlowProvider>
            <HeroFlow />
          </ReactFlowProvider>
        </div>
      </section>



      {/* Sticky AI Models Section */}
      <StickyModels />

      {/* Tools Section */}
      <ToolsSection />

      {/* Control Section */}
      <ControlSection />


      {/* Explore Our Workflows Section */}
      <ExploreWorkflows />

      {/* Footer with CTA */}
      <Footer />
    </div>
  );
}