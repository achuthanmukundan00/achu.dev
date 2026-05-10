import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// ── Transformer Morphology V4 ────────────────────────────────────────────
//
// Architecture-faithful Transformer visualization:
//   - Central residual-stream spine (brightest)
//   - Repeated layer rings/wafers stacked along the spine
//   - Attention-head fiber bundles radiating from each layer ring
//   - MLP/FFN slabs offset from attention fibers
//   - KV cache lattice behind the stack
//   - Output surface at one end
//   - Token pulses traveling along the residual spine
//
// Visual hierarchy:
//   brightest  → residual stream spine + token pulses
//   medium     → layer rings/wafers
//   subtle     → attention fibers + head micro-elements
//   dense      → MLP slabs
//   background → KV cache lattice, faint framing arcs

type ColorRole = "neutral" | "green" | "blue" | "violet" | "red" | "gold";

interface TransformerProfile {
  id: string; label: string; match: RegExp[];
  colorRole: ColorRole;
  layerCount: number;        // 24–48
  attentionHeads: number;    // 8–16
  mlpWidth: number;          // relative MLP slab width
  pulseCount: number;        // traveling tokens
  breathRate: number;
  cascadeSpeed: number;
}

const profiles: TransformerProfile[] = [
  { id: "default", label: "Synax Default", match: [/default/, /local/, /unknown/],
    colorRole: "neutral", layerCount: 32, attentionHeads: 8, mlpWidth: 1.0, pulseCount: 25, breathRate: 0.45, cascadeSpeed: 1.0 },
  { id: "qwen", label: "Qwen · Dense Lattice", match: [/qwen/i],
    colorRole: "violet", layerCount: 40, attentionHeads: 12, mlpWidth: 1.15, pulseCount: 30, breathRate: 0.55, cascadeSpeed: 1.3 },
  { id: "openai", label: "OpenAI · Clean Stack", match: [/gpt/i, /openai/i],
    colorRole: "green", layerCount: 24, attentionHeads: 8, mlpWidth: 0.9, pulseCount: 20, breathRate: 0.5, cascadeSpeed: 0.9 },
  { id: "claude", label: "Claude · Organic Stack", match: [/claude/i],
    colorRole: "gold", layerCount: 32, attentionHeads: 8, mlpWidth: 1.0, pulseCount: 22, breathRate: 0.4, cascadeSpeed: 0.85 },
  { id: "deepseek", label: "DeepSeek · Deep Stack", match: [/deepseek/i],
    colorRole: "red", layerCount: 48, attentionHeads: 16, mlpWidth: 1.3, pulseCount: 35, breathRate: 0.38, cascadeSpeed: 1.6 },
  { id: "gemini", label: "Gemini · Twin Engine", match: [/gemini/i],
    colorRole: "blue", layerCount: 32, attentionHeads: 12, mlpWidth: 1.05, pulseCount: 28, breathRate: 0.52, cascadeSpeed: 1.1 },
];

function resolveProfile(modelId: string): TransformerProfile {
  for (const p of profiles) { if (p.id === "default") continue; for (const re of p.match) { if (re.test(modelId)) return p; } }
  return profiles[0]!;
}

const palettes: Record<ColorRole, { spine: string; ring: string; fiber: string; mlp: string; kv: string; pulse: string; glow: string }> = {
  neutral: { spine: "#5080a8", ring: "#2a4a68", fiber: "#1e3850", mlp: "#182838", kv: "#101828", pulse: "#80c0e0", glow: "#284860" },
  green:    { spine: "#489860", ring: "#285838", fiber: "#1c4028", mlp: "#142818", kv: "#0c1810", pulse: "#70c880", glow: "#285838" },
  blue:     { spine: "#5090b8", ring: "#2a4e68", fiber: "#1e3a50", mlp: "#182a38", kv: "#101c28", pulse: "#80c8e8", glow: "#284a60" },
  violet:   { spine: "#6058a0", ring: "#383060", fiber: "#282048", mlp: "#1c1830", kv: "#101020", pulse: "#9088d0", glow: "#383050" },
  red:      { spine: "#984840", ring: "#583028", fiber: "#402018", mlp: "#281810", kv: "#180808", pulse: "#c06050", glow: "#483028" },
  gold:     { spine: "#887040", ring: "#504428", fiber: "#383018", mlp: "#241c10", kv: "#141008", pulse: "#b09858", glow: "#484020" },
};

// ── Scene ────────────────────────────────────────────────────────────────

interface SceneProps { profile: TransformerProfile; reducedMotion: boolean; }

function TransformerScene({ profile, reducedMotion }: SceneProps) {
  const coreGroupRef = useRef<THREE.Group>(null);
  const ringMeshRef = useRef<THREE.InstancedMesh>(null);
  const mlpMeshRef = useRef<THREE.InstancedMesh>(null);
  const headDotRef = useRef<THREE.InstancedMesh>(null);
  const spineRef = useRef<THREE.Mesh>(null);
  const outputRef = useRef<THREE.Mesh>(null);
  const tokensRef = useRef<THREE.Points>(null);

  const p = palettes[profile.colorRole];
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const L = profile.layerCount;
  const H = profile.attentionHeads;

  const STACK_LENGTH = 7.2;
  const LAYER_SPACING = STACK_LENGTH / (L - 1);
  const STACK_START = -STACK_LENGTH / 2;
  const STACK_END = STACK_LENGTH / 2;
  const RING_RADIUS = 0.6;
  const FIBER_OUTER = 1.05;
  const MLP_Z = 0.45;
  const KV_Z = 1.3;
  const OUTPUT_X = STACK_END + 0.35;
  const TOKEN_COUNT = profile.pulseCount;

  // ── Fiber directions ──
  const fiberDirs = useMemo(() => {
    const dirs = new Float32Array(L * H * 2);
    for (let l = 0; l < L; l++)
      for (let h = 0; h < H; h++) {
        const angle = (h / H) * Math.PI * 2 + l * 0.15;
        dirs[(l * H + h) * 2] = Math.cos(angle);
        dirs[(l * H + h) * 2 + 1] = Math.sin(angle);
      }
    return dirs;
  }, [L, H]);

  // ── Fiber line geometry ──
  const fiberGeo = useMemo(() => {
    const verts = new Float32Array(L * H * 6);
    for (let l = 0; l < L; l++) {
      const x = STACK_START + l * LAYER_SPACING;
      for (let h = 0; h < H; h++) {
        const idx = l * H + h;
        const dy = fiberDirs[idx * 2];
        const dz = fiberDirs[idx * 2 + 1];
        verts[idx * 6] = x; verts[idx * 6 + 1] = dy * (RING_RADIUS - 0.02); verts[idx * 6 + 2] = dz * (RING_RADIUS - 0.02);
        verts[idx * 6 + 3] = x; verts[idx * 6 + 4] = dy * FIBER_OUTER; verts[idx * 6 + 5] = dz * FIBER_OUTER;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    return g;
  }, [L, H, fiberDirs]);

  // ── KV cache lattice ──
  const kvGeo = useMemo(() => {
    const cols = 28, rows = 10, w = STACK_LENGTH + 0.8, h = 2.0;
    const verts: number[] = [];
    for (let c = 0; c <= cols; c++) { const x = STACK_START - 0.4 + (c / cols) * w; verts.push(x, -h / 2, KV_Z, x, h / 2, KV_Z); }
    for (let r = 0; r <= rows; r++) { const y = -h / 2 + (r / rows) * h; verts.push(STACK_START - 0.4, y, KV_Z, STACK_START - 0.4 + w, y, KV_Z); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
    return g;
  }, []);

  // ── Token pulses ──
  const tokenData = useMemo(() => {
    const pos = new Float32Array(TOKEN_COUNT * 3);
    const prog = new Float32Array(TOKEN_COUNT);
    for (let i = 0; i < TOKEN_COUNT; i++) {
      prog[i] = Math.random();
      pos[i * 3] = STACK_START + prog[i] * STACK_LENGTH;
      pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
    }
    return { pos, prog };
  }, [TOKEN_COUNT]);

  const tokenGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(tokenData.pos, 3));
    return g;
  }, [tokenData.pos]);

  // ── Geometries ──
  const ringGeo = useMemo(() => new THREE.TorusGeometry(RING_RADIUS, 0.015, 12, 48), []);
  const mlpGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.55 * profile.mlpWidth, 0.22), [profile.mlpWidth]);
  const headDotGeo = useMemo(() => new THREE.BoxGeometry(0.03, 0.015, 0.015), []);
  const spineGeo = useMemo(() => { const g = new THREE.CylinderGeometry(0.04, 0.04, STACK_LENGTH + 0.4, 16, 1); g.rotateZ(Math.PI / 2); return g; }, []);
  const spineHaloGeo = useMemo(() => { const g = new THREE.CylinderGeometry(0.09, 0.09, STACK_LENGTH + 0.3, 16, 1); g.rotateZ(Math.PI / 2); return g; }, []);
  const outputGeo = useMemo(() => { const g = new THREE.CylinderGeometry(0.5, 0.5, 0.03, 32); g.rotateZ(Math.PI / 2); return g; }, []);

  // ── Init instance matrices ──
  useEffect(() => {
    if (reducedMotion) return;
    if (ringMeshRef.current) {
      for (let l = 0; l < L; l++) {
        dummy.position.set(STACK_START + l * LAYER_SPACING, 0, 0);
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        ringMeshRef.current.setMatrixAt(l, dummy.matrix);
      }
      ringMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (mlpMeshRef.current) {
      for (let l = 0; l < L; l++) {
        dummy.position.set(STACK_START + l * LAYER_SPACING, 0, MLP_Z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0.9 + (l % 3) * 0.05);
        dummy.updateMatrix();
        mlpMeshRef.current.setMatrixAt(l, dummy.matrix);
      }
      mlpMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (headDotRef.current) {
      for (let l = 0; l < L; l++) {
        const x = STACK_START + l * LAYER_SPACING;
        for (let h = 0; h < H; h++) {
          const idx = l * H + h;
          const dy = fiberDirs[idx * 2], dz = fiberDirs[idx * 2 + 1];
          const midR = RING_RADIUS + (FIBER_OUTER - RING_RADIUS) * 0.55;
          dummy.position.set(x, dy * midR, dz * midR);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.setScalar(0.5 + (h % 3) * 0.2);
          dummy.updateMatrix();
          headDotRef.current.setMatrixAt(idx, dummy.matrix);
        }
      }
      headDotRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [L, H, fiberDirs, dummy, reducedMotion]);

  // ── Animation ──
  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    if (coreGroupRef.current) {
      coreGroupRef.current.rotation.y += dt * 0.04;
      coreGroupRef.current.rotation.x += dt * 0.01;
      coreGroupRef.current.scale.setScalar(1 + Math.sin(t * profile.breathRate) * 0.006);
    }

    // Spine
    if (spineRef.current) {
      spineRef.current.scale.set(1, 1 + Math.sin(t * 1.5) * 0.03, 1 + Math.sin(t * 1.5) * 0.03);
    }

    // Rings
    if (ringMeshRef.current) {
      for (let l = 0; l < L; l++) {
        dummy.position.set(STACK_START + l * LAYER_SPACING, 0, 0);
        dummy.rotation.set(0, Math.PI / 2 + Math.sin(t * 0.7 + l * 0.2) * 0.03, 0);
        dummy.scale.setScalar(1 + Math.sin(t * 1.3 + l * 0.4) * 0.02);
        dummy.updateMatrix();
        ringMeshRef.current.setMatrixAt(l, dummy.matrix);
      }
      ringMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // MLP slabs
    if (mlpMeshRef.current) {
      for (let l = 0; l < L; l++) {
        dummy.position.set(STACK_START + l * LAYER_SPACING, 0, MLP_Z);
        dummy.scale.set(1, 1 + Math.sin(t * 1.1 + l * 0.3) * 0.04, 1);
        dummy.rotation.set(0, 0, Math.sin(t * 0.5 + l * 0.1) * 0.02);
        dummy.updateMatrix();
        mlpMeshRef.current.setMatrixAt(l, dummy.matrix);
      }
      mlpMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Head dots
    if (headDotRef.current) {
      for (let l = 0; l < L; l++) {
        const x = STACK_START + l * LAYER_SPACING;
        for (let h = 0; h < H; h++) {
          const idx = l * H + h;
          const dy = fiberDirs[idx * 2], dz = fiberDirs[idx * 2 + 1];
          const midR = RING_RADIUS + (FIBER_OUTER - RING_RADIUS) * (0.5 + Math.sin(t * 2.5 + l * 0.5 + h * 0.7) * 0.1);
          dummy.position.set(x, dy * midR, dz * midR);
          dummy.scale.setScalar(0.5 + Math.abs(Math.sin(t * 2.0 + l * 0.8 + h * 0.6)) * 0.5);
          dummy.updateMatrix();
          headDotRef.current.setMatrixAt(idx, dummy.matrix);
        }
      }
      headDotRef.current.instanceMatrix.needsUpdate = true;
    }

    // Tokens
    if (tokensRef.current) {
      const arr = (tokensRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
      const speed = profile.cascadeSpeed;
      for (let i = 0; i < TOKEN_COUNT; i++) {
        let prog = tokenData.prog[i] + dt * (0.08 + (i % 5) * 0.04) * speed;
        if (prog > 1) prog -= 1;
        tokenData.prog[i] = prog;
        arr[i * 3] = STACK_START + prog * STACK_LENGTH;
        arr[i * 3 + 1] = Math.sin(t * 4 + i) * 0.02;
        arr[i * 3 + 2] = Math.cos(t * 3.5 + i * 1.3) * 0.02;
      }
      tokensRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Output
    if (outputRef.current) {
      outputRef.current.scale.setScalar(1 + Math.sin(t * 1.0) * 0.04);
    }
  });

  return (
    <>
      <color attach="background" args={["#010308"]} />
      <fog attach="fog" args={["#010308", 4, 13]} />
      <ambientLight intensity={0.06} color="#0a1420" />
      <pointLight position={[0, 2, 3]} intensity={0.5} color={p.spine} />
      <pointLight position={[-2, -1, 1.5]} intensity={0.15} color={p.kv} />

      <group ref={coreGroupRef}>
        {/* Residual stream spine */}
        <mesh ref={spineRef} geometry={spineGeo}>
          <meshStandardMaterial color="#204060" emissive={p.spine} emissiveIntensity={0.8} roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh geometry={spineHaloGeo}>
          <meshBasicMaterial color={p.spine} transparent opacity={0.06} depthWrite={false} />
        </mesh>

        {/* Layer rings */}
        <instancedMesh ref={ringMeshRef} args={[ringGeo, undefined, L]}>
          <meshStandardMaterial color={p.ring} emissive={p.ring} emissiveIntensity={0.3} roughness={0.35} metalness={0.5} />
        </instancedMesh>

        {/* Attention fibers */}
        <lineSegments geometry={fiberGeo}>
          <lineBasicMaterial color={p.fiber} transparent opacity={0.26} depthWrite />
        </lineSegments>

        {/* MLP slabs */}
        <instancedMesh ref={mlpMeshRef} args={[mlpGeo, undefined, L]}>
          <meshStandardMaterial color={p.mlp} emissive={p.mlp} emissiveIntensity={0.15} roughness={0.5} metalness={0.3} />
        </instancedMesh>

        {/* Attention-head micro-elements */}
        <instancedMesh ref={headDotRef} args={[headDotGeo, undefined, L * H]}>
          <meshStandardMaterial color={p.fiber} emissive={p.fiber} emissiveIntensity={0.2} roughness={0.4} metalness={0.4} />
        </instancedMesh>

        {/* KV cache lattice */}
        <lineSegments geometry={kvGeo}>
          <lineBasicMaterial color={p.kv} transparent opacity={0.13} depthWrite />
        </lineSegments>

        {/* Output surface */}
        <mesh ref={outputRef} position={[OUTPUT_X, 0, 0]} geometry={outputGeo}>
          <meshStandardMaterial color="#204060" emissive={p.spine} emissiveIntensity={0.35} roughness={0.2} metalness={0.7} />
        </mesh>
        <mesh position={[OUTPUT_X, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.55, 0.008, 8, 48]} />
          <meshBasicMaterial color={p.spine} transparent opacity={0.18} depthWrite={false} />
        </mesh>

        {/* Token pulses */}
        <points ref={tokensRef} geometry={tokenGeo}>
          <pointsMaterial size={0.05} color={p.pulse} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>

        {/* Faint framing arcs */}
        {[0, 1].map((i) => (
          <mesh key={`arc-${i}`} rotation={[Math.PI / 2.5 + i * 0.5, 0, 0]}>
            <torusGeometry args={[1.35 + i * 0.3, 0.002, 8, 64, Math.PI * 1.3]} />
            <meshBasicMaterial color={p.kv} transparent opacity={0.06} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* ── Post-processing ── */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          intensity={0.4}
          radius={0.5}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0004)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Noise opacity={0.012} />
        <Vignette eskil={false} offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  );
}

// ── Static SVG ───────────────────────────────────────────────────────────

function StaticTransformer({ profile }: { profile: TransformerProfile }) {
  const p = palettes[profile.colorRole];
  const L = Math.min(profile.layerCount, 32);
  const w = 240, sx = 20, sw = 200, sp = sw / (L - 1);
  const rings = [];
  for (let l = 0; l < L; l++) {
    const cx = sx + l * sp, r = 30;
    rings.push(<ellipse key={l} cx={cx} cy={130} rx={r} ry={r * 0.5} fill="none" stroke={p.ring} strokeWidth="1" opacity="0.4" />);
    rings.push(<rect key={`m-${l}`} x={cx - 2} y={150} width="4" height="20" fill={p.mlp} opacity="0.3" rx="0.5" />);
  }
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: `radial-gradient(circle, ${p.glow}04, #010308)` }}>
      <svg viewBox="0 0 260 260" className="h-72 w-72" aria-hidden="true">
        <line x1="15" y1="130" x2="245" y2="130" stroke={p.spine} strokeWidth="3" opacity="0.7" />
        <line x1="15" y1="130" x2="245" y2="130" stroke={p.pulse} strokeWidth="1" opacity="0.2" strokeDasharray="4 12" />
        {rings}
        <circle cx={30} cy={130} r="6" fill={p.pulse} opacity="0.5" />
      </svg>
    </div>
  );
}

class WebGLErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { if (this.state.hasError) return this.props.fallback; return this.props.children; }
}

const modelOptions = [
  { id: "Local Model (default)", profile: profiles[0]! },
  { id: "Qwen3.6-35B", profile: profiles[1]! },
  { id: "gpt-4o-mini", profile: profiles[2]! },
  { id: "claude-sonnet-4.5", profile: profiles[3]! },
  { id: "deepseek-v3-0324", profile: profiles[4]! },
  { id: "gemini-2.5-pro", profile: profiles[5]! },
];

interface SynaxCoreMorphologyV2Props { className?: string; }

export default function SynaxCoreMorphologyV2({ className = "" }: SynaxCoreMorphologyV2Props) {
  const [mounted, setMounted] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(modelOptions[0]!.id);
  const [reducedMotion, setReducedMotion] = useState(false);
  const profile = useMemo(() => resolveProfile(selectedModelId), [selectedModelId]);
  const p = palettes[profile.colorRole];

  useEffect(() => {
    setMounted(true);
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mm.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mm.addEventListener("change", h);
    return () => mm.removeEventListener("change", h);
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative min-h-[480px] lg:min-h-[580px] overflow-hidden rounded-xl border border-[#0a0a14] bg-[#010308]">
        {mounted && !reducedMotion ? (
          <WebGLErrorBoundary fallback={<StaticTransformer profile={profile} />}>
            <Canvas
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
              camera={{ position: [0, 0.15, 6.5], fov: 40 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <TransformerScene profile={profile} reducedMotion={reducedMotion} />
              <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={14} enablePan={false} />
            </Canvas>
            <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-xs leading-relaxed">
              <div className="flex flex-col gap-0.5">
                <span style={{ color: p.pulse, opacity: 0.5 }}>{profile.label}</span>
                <span style={{ color: p.ring, opacity: 0.3 }}>LAYERS: {profile.layerCount}  ·  HEADS: {profile.attentionHeads}</span>
                <span style={{ color: p.ring, opacity: 0.3 }}>TOKENS: {profile.pulseCount}  ·  MLP: {profile.mlpWidth.toFixed(2)}x</span>
              </div>
            </div>
          </WebGLErrorBoundary>
        ) : (
          <StaticTransformer profile={profile} />
        )}
        <div className="sr-only" aria-live="polite">
          Synax transformer morphology. Model: {profile.label}. Layers: {profile.layerCount}.
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-500 mb-3">Loaded Model — Transformer Morphology</p>
          <div className="flex flex-wrap gap-2">
            {modelOptions.map((opt) => {
              const active = selectedModelId === opt.id;
              return (
                <button key={opt.id} type="button" onClick={() => setSelectedModelId(opt.id)}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-all duration-200 ${active ? "border-current text-white" : "border-[#1e1e2e] text-neutral-500 hover:text-neutral-300 hover:border-neutral-600"}`}
                  style={active ? { borderColor: p.pulse, color: p.pulse } : undefined}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: active ? p.pulse : "transparent" }} />
                  {opt.profile.label.split(" · ")[0]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 rounded-lg border transition-colors duration-500" style={{ borderColor: `${p.glow}20`, backgroundColor: `${p.glow}06` }}>
          <h3 className="text-sm font-semibold font-mono mb-1" style={{ color: p.pulse }}>{profile.label}</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Architecture-faithful Transformer visualization —{" "}
            <span className="text-neutral-300">{profile.layerCount} layer wafers</span> stacked
            along a central residual stream spine,{" "}
            <span className="text-neutral-300">{profile.attentionHeads} attention heads</span> per layer
            with fiber bundles and MLP slabs. Token pulses travel the spine.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{profile.layerCount} layers</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{profile.attentionHeads} heads</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">MLP {profile.mlpWidth}x</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{profile.pulseCount} tokens</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{profile.colorRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { resolveProfile, profiles };
export type { TransformerProfile, ColorRole };
