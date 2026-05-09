/**
 * SceneRoot — Main 3D containment scene.
 *
 * Depth layers:
 *   Background — deep graphite space, faint traces, far particles
 *   Midground — AI containment core (arc-reactor style)
 *   Foreground — HTML overlay (UI text, sections)
 *
 * No floating cards, no folders, no green. Just the core.
 * Scroll drives camera, lighting, and post-processing through six states.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CameraRig from "./CameraRig";
import LightingRig from "./LightingRig";
import RefractiveCore from "./RefractiveCore";
import PostProcessingRig from "./PostProcessingRig";
import TraceGraph from "./TraceGraph";
import { lerpConfig } from "./ScrollStateController";

// ── GPU tier ────────────────────────────────────────────────────────────

function detectGpuTier(): "high" | "low" {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return "low";
    const ext = (gl as WebGL2RenderingContext).getExtension?.("WEBGL_debug_renderer_info");
    if (!ext) return "high";
    const r = String((gl as WebGL2RenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase();
    if (r.includes("intel") || r.includes("apple m1") || r.includes("apple m2") ||
        r.includes("mali") || r.includes("adreno 5") || r.includes("adreno 6")) return "low";
    return "high";
  } catch { return "low"; }
}

// ── Background ──────────────────────────────────────────────────────────

function DeepSpace() {
  return (
    <>
      <color attach="background" args={["#020407"]} />
      <fog attach="fog" args={["#020407", 5, 24]} />
    </>
  );
}

// ── Fallback (no WebGL) ─────────────────────────────────────────────────

function StaticFallback() {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#020407] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(176,200,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(176,200,255,0.12) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle at 50% 40%, black 30%, transparent 70%)",
        }} />
      <div className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(176,200,255,0.1) 0%, transparent 65%)",
          animation: "pulse 6s ease-in-out infinite", opacity: 0.6,
        }} />
      <div className="text-center space-y-6 px-6 relative z-10">
        <svg viewBox="0 0 260 260" className="h-48 w-48 mx-auto" style={{ opacity: 0.4 }}>
          <circle cx="130" cy="130" r="95" fill="none" stroke="#b0c8ff" strokeWidth="1" opacity="0.25" />
          <circle cx="130" cy="130" r="58" fill="none" stroke="#b0c8ff" strokeWidth="2" opacity="0.35">
            <animate attributeName="r" values="58;62;58" dur="4s" repeatCount="indefinite" />
          </circle>
          <polygon points="130,100 152,130 130,160 108,130" fill="#c0d8ff" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 130 130" to="360 130 130" dur="30s" repeatCount="indefinite" />
          </polygon>
          <line x1="30" y1="130" x2="230" y2="130" stroke="#b0c8ff" strokeWidth="1" opacity="0.12" />
        </svg>
        <h1 className="text-5xl font-bold text-white">achu</h1>
        <p className="text-lg text-neutral-400 max-w-md mx-auto">
          i build fast local-first ai tools, developer systems, and inhabitable worlds.
        </p>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.08;transform:scale(1)}50%{opacity:.16;transform:scale(1.05)}}`}</style>
    </div>
  );
}

// ── Error boundary ──────────────────────────────────────────────────────

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode }, { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? <StaticFallback /> : this.props.children; }
}

function ContextLossGuard({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); onLost(); };
    gl.domElement.addEventListener("webglcontextlost", h);
    return () => gl.domElement.removeEventListener("webglcontextlost", h);
  }, [gl, onLost]);
  return null;
}

// ── Scene Content ───────────────────────────────────────────────────────

function SceneContent({
  scrollProgress, hoverEnergy, reducedMotion, lowPower,
}: {
  scrollProgress: number; hoverEnergy: number;
  reducedMotion: boolean; lowPower: boolean;
}) {
  const config = lerpConfig(scrollProgress);

  return (
    <>
      <DeepSpace />
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      <LightingRig scrollProgress={scrollProgress} hoverEnergy={hoverEnergy} />

      {/* Trace graph — deep background diagnostic lines */}
      <TraceGraph scrollProgress={scrollProgress} hoverEnergy={hoverEnergy}
        reducedMotion={reducedMotion} lowPower={lowPower} />

      {/* AI containment core — the hero */}
      <RefractiveCore scrollProgress={scrollProgress} hoverEnergy={hoverEnergy}
        reducedMotion={reducedMotion} lowPower={lowPower} />
    </>
  );
}

// ── Public Component ────────────────────────────────────────────────────

export default function SceneRoot({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [lost, setLost] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [hoverEnergy, setHoverEnergy] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const gpuTier = useRef<"high" | "low">("high");

  useEffect(() => {
    setMounted(true);
    gpuTier.current = detectGpuTier();

    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mm.matches);
    const mmh = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mm.addEventListener("change", mmh);

    const onScroll = () => {
      const h = document.body.scrollHeight - window.innerHeight;
      setScroll(h > 0 ? Math.max(0, Math.min(1, window.scrollY / h)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => { window.removeEventListener("scroll", onScroll); mm.removeEventListener("change", mmh); };
  }, []);

  const lowPower = gpuTier.current === "low";

  if (!mounted || lost) return <StaticFallback />;

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1]} gl={{ antialias: false }}
          camera={{ position: [0, 0.15, 6.5], fov: 45 }}>
          <DeepSpace />
          <ambientLight intensity={0.1} />
          <RefractiveCore scrollProgress={0} hoverEnergy={0} reducedMotion={true} lowPower={lowPower} />
        </Canvas>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-0 ${className}`}>
      <WebGLErrorBoundary>
        <Canvas
          dpr={lowPower ? [1, 1] : [1, 1.5]}
          gl={{ antialias: !lowPower, alpha: false, powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0,
            failIfMajorPerformanceCaveat: false }}
          camera={{ position: [0, 0.15, 6.5], fov: 45 }}>
          <ContextLossGuard onLost={() => setLost(true)} />
          <SceneContent scrollProgress={scroll} hoverEnergy={hoverEnergy}
            reducedMotion={reducedMotion} lowPower={lowPower} />
          <PostProcessingRig scrollProgress={scroll} lowPower={lowPower} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
