import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ── Model Visual Profile System (from synax-ai-core-morphology-spec.md) ─
//
// Synax = the containment chamber
// Model = the intelligence morphology inside it
//
// Profiles match model IDs case-insensitively per the canonical spec.

type ModelGeometry = "lens" | "lattice" | "organic" | "furnace" | "twin" | "default";
type PhaseStyle = "smooth" | "snap" | "elastic" | "compressed" | "mirrored";
type HoverBias = "focus" | "magnetic" | "elastic" | "minimal" | "split";
type ScanStyle = "soft" | "beam" | "inward" | "split" | "precise";
type ColorRole = "neutral" | "green" | "blue" | "violet" | "red" | "gold";

interface CoreVisualProfile {
  id: string;
  label: string;
  match: RegExp[];
  geometry: ModelGeometry;
  phaseStyle: PhaseStyle;
  hoverBias: HoverBias;
  scanStyle: ScanStyle;
  breathRate: number;
  colorRole: ColorRole;
  // 3D-specific tuning
  nucleusShape: "octahedron" | "icosahedron" | "dodecahedron" | "torusKnot" | "box" | "twinSphere";
  nucleusScale: number;
  ringDensity: number; // 0–1
  particleSpread: number;
  particleCount: number;
  innerFieldOpacity: number;
}

const profiles: CoreVisualProfile[] = [
  {
    id: "default",
    label: "Synax Default",
    match: [/default/, /local/, /unknown/],
    geometry: "default",
    phaseStyle: "smooth",
    hoverBias: "focus",
    scanStyle: "soft",
    breathRate: 1.0,
    colorRole: "neutral",
    nucleusShape: "octahedron",
    nucleusScale: 1.0,
    ringDensity: 0.5,
    particleSpread: 1.0,
    particleCount: 200,
    innerFieldOpacity: 0.45,
  },
  {
    id: "qwen",
    label: "Qwen — Crystalline Lattice",
    match: [/qwen/i],
    geometry: "lattice",
    phaseStyle: "snap",
    hoverBias: "magnetic",
    scanStyle: "precise",
    breathRate: 0.8,
    colorRole: "violet",
    nucleusShape: "icosahedron",
    nucleusScale: 0.85,
    ringDensity: 0.8,
    particleSpread: 0.6,
    particleCount: 280,
    innerFieldOpacity: 0.6,
  },
  {
    id: "openai",
    label: "OpenAI / GPT — Clean Centered Lens",
    match: [/gpt/i, /openai/i],
    geometry: "lens",
    phaseStyle: "smooth",
    hoverBias: "focus",
    scanStyle: "soft",
    breathRate: 1.1,
    colorRole: "green",
    nucleusShape: "octahedron",
    nucleusScale: 1.05,
    ringDensity: 0.4,
    particleSpread: 0.9,
    particleCount: 160,
    innerFieldOpacity: 0.35,
  },
  {
    id: "claude",
    label: "Claude — Soft Organic Aperture",
    match: [/claude/i],
    geometry: "organic",
    phaseStyle: "elastic",
    hoverBias: "elastic",
    scanStyle: "soft",
    breathRate: 0.65,
    colorRole: "gold",
    nucleusShape: "dodecahedron",
    nucleusScale: 1.15,
    ringDensity: 0.35,
    particleSpread: 1.4,
    particleCount: 150,
    innerFieldOpacity: 0.3,
  },
  {
    id: "deepseek",
    label: "DeepSeek — Dense Pressure Furnace",
    match: [/deepseek/i],
    geometry: "furnace",
    phaseStyle: "compressed",
    hoverBias: "minimal",
    scanStyle: "beam",
    breathRate: 0.5,
    colorRole: "red",
    nucleusShape: "box",
    nucleusScale: 0.7,
    ringDensity: 0.9,
    particleSpread: 0.45,
    particleCount: 350,
    innerFieldOpacity: 0.7,
  },
  {
    id: "gemini",
    label: "Gemini — Mirrored Twin Field",
    match: [/gemini/i],
    geometry: "twin",
    phaseStyle: "mirrored",
    hoverBias: "split",
    scanStyle: "split",
    breathRate: 1.2,
    colorRole: "blue",
    nucleusShape: "twinSphere",
    nucleusScale: 0.9,
    ringDensity: 0.45,
    particleSpread: 1.1,
    particleCount: 220,
    innerFieldOpacity: 0.4,
  },
];

function resolveCoreVisualProfile(modelId: string): CoreVisualProfile {
  for (const profile of profiles) {
    if (profile.id === "default") continue;
    for (const re of profile.match) {
      if (re.test(modelId)) return profile;
    }
  }
  return profiles[0]!; // default
}

// ── Color palette per ColorRole ─────────────────────────────────────────

const colorPalettes: Record<ColorRole, { primary: string; secondary: string; accent: string }> = {
  neutral: { primary: "#7fffd1", secondary: "#ffffff", accent: "#284255" },
  green: { primary: "#4ade80", secondary: "#bbf7d0", accent: "#1a3a2a" },
  blue: { primary: "#67e8f9", secondary: "#cffafe", accent: "#163344" },
  violet: { primary: "#a78bfa", secondary: "#ddd6fe", accent: "#2a1a44" },
  red: { primary: "#fb7185", secondary: "#fecdd3", accent: "#3a1a22" },
  gold: { primary: "#fbbf24", secondary: "#fef3c7", accent: "#3a3020" },
};

// ── Containment Scene ───────────────────────────────────────────────────

interface ContainmentSceneProps {
  profile: CoreVisualProfile;
  reducedMotion: boolean;
}

function ContainmentScene({ profile, reducedMotion }: ContainmentSceneProps) {
  const coreGroupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const nucleus2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const furnaceScanRef = useRef<THREE.Mesh>(null);

  const palette = colorPalettes[profile.colorRole];

  // Particle field
  const particleGeometry = useMemo(() => {
    const count = profile.particleCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1.0 + Math.random() * profile.particleSpread * 1.4;

      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.7;
      positions[i * 3 + 2] = Math.cos(phi) * radius * 0.5;
      sizes[i] = Math.random() * 3 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [profile.particleCount, profile.particleSpread]);

  // Ring segments for inner field
  const ringSegments = useMemo(() => {
    const density = Math.floor(20 + profile.ringDensity * 20);
    return Array.from({ length: density }, (_, i) => {
      const angle = (i / density) * Math.PI * 2;
      return { angle, length: 0.06 + (i % 3) * 0.06 };
    });
  }, [profile.ringDensity]);

  // Twin nucleus positions for gemini
  const twinOffsets = profile.nucleusShape === "twinSphere"
    ? [[-0.25, 0, 0], [0.25, 0, 0]]
    : [[0, 0, 0]];

  const nucleusGeo = useMemo(() => {
    const shape = profile.nucleusShape;
    if (shape === "twinSphere") return <sphereGeometry args={[0.18, 16, 16]} />;
    switch (shape) {
      case "octahedron": return <octahedronGeometry args={[0.3, 1]} />;
      case "icosahedron": return <icosahedronGeometry args={[0.24, 0]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[0.3, 0]} />;
      case "torusKnot": return <torusKnotGeometry args={[0.18, 0.06, 64, 8]} />;
      case "box": return <boxGeometry args={[0.35, 0.35, 0.35]} />;
      default: return <octahedronGeometry args={[0.3, 1]} />;
    }
  }, [profile.nucleusShape]);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.getElapsedTime();
    if (reducedMotion) return;

    // ── Phase style drives group-level animation ──
    const breathBase = Math.sin(t * profile.breathRate);
    let breathAmplitude: number;

    switch (profile.phaseStyle) {
      case "snap":
        breathAmplitude = 0.015 + Math.abs(Math.round(breathBase * 3) / 3) * 0.03;
        break;
      case "elastic":
        breathAmplitude = 0.035 + Math.abs(breathBase) * 0.03;
        break;
      case "compressed":
        breathAmplitude = 0.01 + Math.max(0, breathBase * 0.02);
        break;
      case "mirrored":
        breathAmplitude = 0.025 + breathBase * 0.02;
        break;
      default: // smooth
        breathAmplitude = 0.025 + breathBase * 0.015;
    }

    if (coreGroupRef.current) {
      const breath = 1 + Math.sin(t * profile.breathRate) * breathAmplitude;
      coreGroupRef.current.scale.setScalar(breath);
      coreGroupRef.current.rotation.y += delta * 0.12;
      coreGroupRef.current.rotation.z += delta * 0.05 * profile.breathRate;

      // Pointer tracking per hoverBias
      const factor = profile.hoverBias === "magnetic" ? 0.25
        : profile.hoverBias === "split" ? 0.1
        : profile.hoverBias === "minimal" ? 0.05
        : 0.15;
      coreGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        coreGroupRef.current.rotation.y, pointer.x * factor, 0.02,
      );
      coreGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        coreGroupRef.current.rotation.x, pointer.y * factor * 0.6, 0.02,
      );
    }

    // Nucleus
    if (nucleusRef.current) {
      const pulse = 1 + Math.sin(t * profile.breathRate * 2) * 0.04;
      nucleusRef.current.scale.setScalar(pulse * profile.nucleusScale);
      const mat = nucleusRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.45 + Math.sin(t * profile.breathRate) * 0.2;
    }

    // Twin nucleus (gemini)
    if (nucleus2Ref.current && profile.nucleusShape === "twinSphere") {
      const pulse2 = 1 + Math.sin(t * profile.breathRate * 2 + Math.PI) * 0.04;
      nucleus2Ref.current.scale.setScalar(pulse2 * profile.nucleusScale);
      const mat2 = nucleus2Ref.current.material as THREE.MeshStandardMaterial;
      mat2.emissiveIntensity = 0.45 + Math.sin(t * profile.breathRate + Math.PI) * 0.2;
    }

    // Scan line
    if (scanLineRef.current) {
      const range = 3.0;
      const speed = profile.scanStyle === "beam" ? 0.6 : 0.25;
      scanLineRef.current.position.y = ((t * speed) % range) - range / 2;
      const mat = scanLineRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = profile.scanStyle === "beam" ? 0.22 : 0.12;
    }

    // Furnace secondary scan (DeepSeek)
    if (furnaceScanRef.current && profile.scanStyle === "beam") {
      furnaceScanRef.current.position.y = ((t * 0.6 + 1.5) % 3.0) - 1.5;
    }

    // Particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.08 * (1 - profile.ringDensity * 0.5);
      particlesRef.current.rotation.z += delta * 0.05 * profile.ringDensity;
    }
  });

  const ringCount = Math.max(2, Math.floor(3 + profile.ringDensity * 4));

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 2, 4]} intensity={1.2} color={palette.primary} />
      <pointLight position={[-3, -1.5, 2]} intensity={0.4} color={palette.secondary} />
      <pointLight position={[0, -3, 1]} intensity={0.6} color="#ffffff" />

      {/* ── Outer containment rings (fixed — Synax identity) ── */}
      <group ref={coreGroupRef}>
        {Array.from({ length: ringCount }, (_, i) => (
          <mesh
            key={`ring-${i}`}
            rotation={[Math.PI / (2.2 + i * 0.3), i * Math.PI / 8, i * Math.PI / 12]}
          >
            <torusGeometry args={[1.4 + i * 0.25, 0.01 + i * 0.005, 16, 80]} />
            <meshBasicMaterial
              color={i === 0 ? palette.primary : palette.secondary}
              transparent
              opacity={0.35 - i * 0.08}
            />
          </mesh>
        ))}

        {/* ── Inner field ring segments ── */}
        <group>
          {ringSegments.map((seg, i) => {
            const radius = 1.18;
            const x = Math.cos(seg.angle) * radius;
            const y = Math.sin(seg.angle) * radius;
            return (
              <mesh
                key={`seg-${i}`}
                position={[x, y, 0]}
                rotation={[0, 0, seg.angle + Math.PI / 2]}
              >
                <boxGeometry args={[seg.length, 0.02, 0.015]} />
                <meshBasicMaterial
                  color={i % 3 === 0 ? palette.secondary : palette.primary}
                  transparent
                  opacity={profile.innerFieldOpacity * (i % 4 === 0 ? 0.8 : 0.4)}
                />
              </mesh>
            );
          })}
        </group>

        {/* ── Nucleus — the intelligence morphology inside ── */}
        {profile.nucleusShape === "twinSphere" ? (
          <>
            <mesh
              ref={nucleusRef}
              position={[twinOffsets[0]![0], twinOffsets[0]![1], twinOffsets[0]![2]]}
            >
              {nucleusGeo}
              <meshStandardMaterial
                color="#0a1a14"
                emissive={palette.primary}
                emissiveIntensity={0.55}
                roughness={0.15}
                metalness={0.8}
                flatShading
              />
            </mesh>
            <mesh
              ref={nucleus2Ref}
              position={[twinOffsets[1]![0], twinOffsets[1]![1], twinOffsets[1]![2]]}
            >
              {nucleusGeo}
              <meshStandardMaterial
                color="#0a1a14"
                emissive={palette.secondary}
                emissiveIntensity={0.45}
                roughness={0.15}
                metalness={0.8}
                flatShading
              />
            </mesh>
          </>
        ) : (
          <mesh ref={nucleusRef} rotation={[0.5, 0.3, 1.2]}>
            {nucleusGeo}
            <meshStandardMaterial
              color="#0a1a14"
              emissive={palette.primary}
              emissiveIntensity={0.55}
              roughness={profile.phaseStyle === "compressed" ? 0.08 : 0.18}
              metalness={0.75}
              flatShading
            />
          </mesh>
        )}

        {/* Nucleus halo */}
        <mesh>
          <sphereGeometry args={[
            profile.nucleusShape === "twinSphere" ? 0.35 : 0.42,
            16, 16,
          ]} />
          <meshBasicMaterial color={palette.primary} transparent opacity={0.06} />
        </mesh>

        {/* ── Scan line ── */}
        <mesh ref={scanLineRef} position={[0, 0, 0.15]}>
          <boxGeometry
            args={[profile.scanStyle === "beam" ? 4.5 : 3.8, 0.012, 0.012]}
          />
          <meshBasicMaterial color={palette.primary} transparent opacity={0.14} />
        </mesh>

        {/* DeepSeek furnace secondary scan */}
        {profile.scanStyle === "beam" && (
          <mesh ref={furnaceScanRef} position={[0, 1.5, 0.1]}>
            <boxGeometry args={[4.5, 0.02, 0.02]} />
            <meshBasicMaterial color={palette.primary} transparent opacity={0.1} />
          </mesh>
        )}

        {/* ── Vertical containment bars ── */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`bar-${i}`} position={[-1.2 + i * 0.6, 0, -0.05]}>
            <boxGeometry args={[0.008, 2.8, 0.008]} />
            <meshBasicMaterial
              color={palette.primary}
              transparent
              opacity={profile.phaseStyle === "compressed" ? 0.15 : 0.08}
            />
          </mesh>
        ))}
      </group>

      {/* ── Particle field ── */}
      <points ref={particlesRef}>
        <primitive object={particleGeometry} />
        <pointsMaterial
          color={palette.primary}
          size={0.025}
          transparent
          opacity={profile.innerFieldOpacity * 0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Background specks */}
      {Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2;
        const r = 3.5 + (i % 3) * 0.8;
        return (
          <mesh
            key={`bg-${i}`}
            position={[Math.cos(a + i * 0.3) * r, Math.sin(a + i * 0.3) * r * 0.6, -1 - (i % 4) * 0.25]}
          >
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial color={palette.primary} transparent opacity={0.15} />
          </mesh>
        );
      })}
    </>
  );
}

// ── Static SVG fallback ─────────────────────────────────────────────────

function StaticContainment({ profile }: { profile: CoreVisualProfile }) {
  const palette = colorPalettes[profile.colorRole];
  const ringCount = Math.max(2, Math.floor(3 + profile.ringDensity * 4));

  return (
    <div
      className="flex h-full w-full items-center justify-center transition-colors duration-700"
      style={{ background: `radial-gradient(circle at center, ${palette.primary}08, #03080f)` }}
    >
      <svg viewBox="0 0 260 260" className="h-72 w-72" aria-hidden="true">
        {Array.from({ length: ringCount }, (_, i) => (
          <circle
            key={i}
            cx="130" cy="130" r={65 + i * 20}
            fill="none"
            stroke={i === 0 ? palette.primary : palette.secondary}
            strokeWidth={1.5 - i * 0.2}
            opacity={0.35 - i * 0.08}
          />
        ))}
        <circle cx="130" cy="130" r="42" fill="none" stroke={palette.primary} strokeWidth="2" opacity={profile.innerFieldOpacity} />
        {profile.nucleusShape === "twinSphere" ? (
          <>
            <circle cx="115" cy="130" r="12" fill={palette.primary} opacity="0.55" />
            <circle cx="145" cy="130" r="12" fill={palette.secondary} opacity="0.45" />
          </>
        ) : profile.nucleusShape === "box" ? (
          <rect x="112" y="112" width="36" height="36" rx="2" fill={palette.primary} opacity="0.5" />
        ) : (
          <polygon points="130,100 152,130 130,160 108,130" fill={palette.primary} opacity="0.7" />
        )}
        <circle cx="130" cy="130" r="26" fill="none" stroke={palette.primary} strokeWidth="1" opacity="0.12" />
        <line x1="30" y1="130" x2="230" y2="130" stroke={palette.primary} strokeWidth={profile.scanStyle === "beam" ? "2" : "1"} opacity="0.2" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r = 55 + (i % 3) * 20;
          return (
            <circle key={i} cx={130 + Math.cos(a) * r} cy={130 + Math.sin(a) * r * 0.7} r="1.5" fill={palette.primary} opacity={profile.innerFieldOpacity * 0.5} />
          );
        })}
      </svg>
    </div>
  );
}

// ── Error Boundary ───────────────────────────────────────────────────────

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ── Model selector data ─────────────────────────────────────────────────

const modelOptions = [
  { id: "Local Model (default)", profile: profiles[0]! },
  { id: "Qwen3.6-35B-A3B-UD-IQ3_XXS.gguf", profile: profiles[1]! },
  { id: "gpt-4o-mini", profile: profiles[2]! },
  { id: "claude-sonnet-4.5", profile: profiles[3]! },
  { id: "deepseek-v3-0324", profile: profiles[4]! },
  { id: "gemini-2.5-pro", profile: profiles[5]! },
];

// ── Public Component ─────────────────────────────────────────────────────

interface SynaxCoreMorphologyProps {
  className?: string;
}

export default function SynaxCoreMorphology({ className = "" }: SynaxCoreMorphologyProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(modelOptions[0]!.id);
  const [reducedMotion, setReducedMotion] = useState(false);

  const profile = useMemo(() => resolveCoreVisualProfile(selectedModelId), [selectedModelId]);
  const palette = colorPalettes[profile.colorRole];

  useEffect(() => {
    setMounted(true);
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mm.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mm.addEventListener("change", handler);
    return () => mm.removeEventListener("change", handler);
  }, []);

  const fallback = <StaticContainment profile={profile} />;

  return (
    <div className={`relative w-full ${className}`}>
      {/* ── 3D Canvas ── */}
      <div className="relative min-h-[480px] lg:min-h-[580px] overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#03080f]">
        {mounted && !reducedMotion ? (
          <WebGLErrorBoundary fallback={fallback}>
            <Canvas
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
              camera={{ position: [0, 0, 6.5], fov: 45 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <color attach="background" args={["#03080f"]} />
              <fog attach="fog" args={["#03080f", 5, 12]} />
              <ContainmentScene profile={profile} reducedMotion={reducedMotion} />
              <OrbitControls
                enableDamping
                dampingFactor={0.08}
                minDistance={3}
                maxDistance={12}
                enablePan={false}
              />
            </Canvas>
            {/* HUD overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-xs leading-relaxed">
              <div className="flex flex-col gap-0.5">
                <span style={{ color: palette.primary, opacity: 0.6 }}>
                  MODEL: {profile.label.split(" — ")[0]}
                </span>
                <span style={{ color: palette.secondary, opacity: 0.35 }}>
                  GEOMETRY: {profile.geometry.toUpperCase()}
                </span>
                <span style={{ color: palette.secondary, opacity: 0.35 }}>
                  PHASE: {profile.phaseStyle.toUpperCase()}
                  {"  "}BREATH: {profile.breathRate.toFixed(1)}Hz
                </span>
                <span style={{ color: palette.secondary, opacity: 0.35 }}>
                  NUCLEUS: {profile.nucleusShape}
                  {"  "}RING DENSITY: {(profile.ringDensity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </WebGLErrorBoundary>
        ) : (
          fallback
        )}

        <div className="sr-only" aria-live="polite">
          Synax AI core morphology viewer. Model: {profile.label}. Geometry: {profile.geometry}.
        </div>
      </div>

      {/* ── Model Selector ── */}
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-500 mb-3">
            Loaded Model — Core Morphology
          </p>
          <div className="flex flex-wrap gap-2">
            {modelOptions.map((opt) => {
              const isActive = selectedModelId === opt.id;
              const p = colorPalettes[opt.profile.colorRole];
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedModelId(opt.id)}
                  className={`
                    px-3 py-1.5 text-xs font-mono rounded border transition-all duration-200
                    ${isActive
                      ? "border-current text-white"
                      : "border-[#1e1e2e] text-neutral-500 hover:text-neutral-300 hover:border-neutral-600"
                    }
                  `}
                  style={isActive ? { borderColor: p.primary, color: p.primary } : undefined}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                    style={{ backgroundColor: isActive ? p.primary : "transparent" }}
                  />
                  {opt.profile.label.split(" — ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Profile Detail ── */}
        <div
          className="p-4 rounded-lg border transition-colors duration-500"
          style={{
            borderColor: `${palette.primary}20`,
            backgroundColor: `${palette.primary}06`,
          }}
        >
          <h3 className="text-sm font-semibold font-mono mb-1" style={{ color: palette.primary }}>
            {profile.label}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Synax containment chamber with{" "}
            <span className="text-neutral-300">{profile.geometry}</span> inner morphology.
            Phase style: <span className="text-neutral-300">{profile.phaseStyle}</span>.
            Hover bias: <span className="text-neutral-300">{profile.hoverBias}</span>.
            Scan: <span className="text-neutral-300">{profile.scanStyle}</span>.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">
              {profile.nucleusShape}
            </span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">
              {profile.geometry}
            </span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">
              {profile.phaseStyle}
            </span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">
              {profile.particleCount} particles
            </span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">
              color: {profile.colorRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Also export for potential reuse
export { resolveCoreVisualProfile, profiles };
export type { CoreVisualProfile, ModelGeometry, PhaseStyle, ColorRole };
