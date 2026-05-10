import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ── Wiregraph Core Morphology V3 ─────────────────────────────────────────
//
// Dark sci-fi wiregraph brain — macro lobes, micro gate arrays,
// transistor flips, traveling pulses, machine-nervous-system aesthetic.
//
// 7 asymmetric macro lobes connected by trunk edges.
// Each lobe contains dense micro-gate arrays (small rects + short traces).
// Traveling pulses along edges. Transistor flip cascades.
// Dark palette: near-black bg, ice-blue/grey lines, cold-white sparks.

type ColorRole = "neutral" | "green" | "blue" | "violet" | "red" | "gold";

interface WiregraphProfile {
  id: string;
  label: string;
  match: RegExp[];
  colorRole: ColorRole;
  lobeCount: number;
  gatesPerLobe: number;      // base gate count per lobe
  intraEdgeDensity: number;   // multiplier on intra-lobe edges
  pulseCount: number;
  cascadeSpeed: number;       // transistor flip cascade rate
  breathRate: number;
}

const profiles: WiregraphProfile[] = [
  {
    id: "default", label: "Synax Default",
    match: [/default/, /local/, /unknown/],
    colorRole: "neutral", lobeCount: 7, gatesPerLobe: 110,
    intraEdgeDensity: 1.0, pulseCount: 80, cascadeSpeed: 1.2, breathRate: 0.55,
  },
  {
    id: "qwen", label: "Qwen · Lattice Core",
    match: [/qwen/i],
    colorRole: "violet", lobeCount: 8, gatesPerLobe: 140,
    intraEdgeDensity: 1.3, pulseCount: 120, cascadeSpeed: 2.0, breathRate: 0.7,
  },
  {
    id: "openai", label: "OpenAI · Centered Graph",
    match: [/gpt/i, /openai/i],
    colorRole: "green", lobeCount: 6, gatesPerLobe: 85,
    intraEdgeDensity: 0.75, pulseCount: 60, cascadeSpeed: 1.0, breathRate: 0.65,
  },
  {
    id: "claude", label: "Claude · Organic Web",
    match: [/claude/i],
    colorRole: "gold", lobeCount: 7, gatesPerLobe: 95,
    intraEdgeDensity: 0.9, pulseCount: 70, cascadeSpeed: 0.9, breathRate: 0.5,
  },
  {
    id: "deepseek", label: "DeepSeek · Dense Substrate",
    match: [/deepseek/i],
    colorRole: "red", lobeCount: 9, gatesPerLobe: 170,
    intraEdgeDensity: 1.5, pulseCount: 140, cascadeSpeed: 2.8, breathRate: 0.45,
  },
  {
    id: "gemini", label: "Gemini · Twin Graph",
    match: [/gemini/i],
    colorRole: "blue", lobeCount: 7, gatesPerLobe: 105,
    intraEdgeDensity: 1.1, pulseCount: 90, cascadeSpeed: 1.6, breathRate: 0.7,
  },
];

function resolveProfile(modelId: string): WiregraphProfile {
  for (const p of profiles) { if (p.id === "default") continue; for (const re of p.match) { if (re.test(modelId)) return p; } }
  return profiles[0]!;
}

// ── Dark sci-fi palettes per ColorRole ───────────────────────────────────

const palettes: Record<ColorRole, { lineBase: string; lineActive: string; gateOff: string; gateOn: string; pulse: string; glow: string }> = {
  neutral: { lineBase: "#1a3048", lineActive: "#2a4a6a", gateOff: "#14202c", gateOn: "#305878", pulse: "#6090a8", glow: "#284058" },
  green:    { lineBase: "#1a3022", lineActive: "#2a4a38", gateOff: "#142018", gateOn: "#306040", pulse: "#508858", glow: "#284028" },
  blue:     { lineBase: "#1a2e40", lineActive: "#2a4660", gateOff: "#141e2c", gateOn: "#305678", pulse: "#6098b8", glow: "#284058" },
  violet:   { lineBase: "#201e38", lineActive: "#302e50", gateOff: "#181628", gateOn: "#403868", pulse: "#7068a0", glow: "#302848" },
  red:      { lineBase: "#301820", lineActive: "#482830", gateOff: "#201018", gateOn: "#582830", pulse: "#904040", glow: "#381820" },
  gold:     { lineBase: "#2a2418", lineActive: "#403a28", gateOff: "#1c1810", gateOn: "#504828", pulse: "#887038", glow: "#383020" },
};

// ── Seeded PRNG ──────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ── Lobe layout generator ────────────────────────────────────────────────

interface LobeDef { cx: number; cy: number; cz: number; rx: number; ry: number; rz: number; }

function generateLobeLayout(count: number, rng: () => number): LobeDef[] {
  // Asymmetric brain/core silhouette
  const baseLayouts: LobeDef[][] = [
    // 6 lobes
    [
      { cx: 0.35, cy: 0.45, cz: -0.3, rx: 0.55, ry: 0.45, rz: 0.40 },
      { cx: -0.40, cy: 0.40, cz: -0.2, rx: 0.50, ry: 0.42, rz: 0.38 },
      { cx: 0.60, cy: -0.10, cz: -0.1, rx: 0.40, ry: 0.38, rz: 0.35 },
      { cx: -0.55, cy: -0.08, cz: 0.0, rx: 0.38, ry: 0.40, rz: 0.36 },
      { cx: 0.0, cy: 0.05, cz: 0.1, rx: 0.42, ry: 0.50, rz: 0.44 },
      { cx: 0.05, cy: -0.55, cz: -0.1, rx: 0.30, ry: 0.28, rz: 0.25 },
    ],
    // 7 lobes (+ occipital)
    [
      { cx: 0.35, cy: 0.45, cz: -0.3, rx: 0.55, ry: 0.45, rz: 0.40 },
      { cx: -0.40, cy: 0.40, cz: -0.2, rx: 0.50, ry: 0.42, rz: 0.38 },
      { cx: 0.65, cy: -0.10, cz: -0.1, rx: 0.40, ry: 0.38, rz: 0.35 },
      { cx: -0.60, cy: -0.08, cz: 0.0, rx: 0.38, ry: 0.40, rz: 0.36 },
      { cx: 0.0, cy: 0.05, cz: 0.1, rx: 0.42, ry: 0.50, rz: 0.44 },
      { cx: 0.05, cy: -0.55, cz: -0.1, rx: 0.30, ry: 0.28, rz: 0.25 },
      { cx: -0.05, cy: 0.60, cz: -0.4, rx: 0.45, ry: 0.35, rz: 0.40 },
    ],
    // 8 lobes (Qwen — denser, more peripheral nodes)
    [
      { cx: 0.30, cy: 0.50, cz: -0.3, rx: 0.45, ry: 0.40, rz: 0.38 },
      { cx: -0.35, cy: 0.48, cz: -0.2, rx: 0.42, ry: 0.38, rz: 0.36 },
      { cx: 0.55, cy: 0.05, cz: -0.15, rx: 0.40, ry: 0.35, rz: 0.35 },
      { cx: -0.50, cy: 0.02, cz: -0.05, rx: 0.38, ry: 0.36, rz: 0.34 },
      { cx: 0.0, cy: 0.0, cz: 0.05, rx: 0.38, ry: 0.45, rz: 0.40 },
      { cx: 0.08, cy: -0.50, cz: -0.1, rx: 0.28, ry: 0.26, rz: 0.24 },
      { cx: 0.10, cy: 0.65, cz: -0.35, rx: 0.38, ry: 0.30, rz: 0.35 },
      { cx: -0.15, cy: -0.65, cz: -0.2, rx: 0.30, ry: 0.25, rz: 0.28 },
    ],
    // 9 lobes (DeepSeek — very dense)
    [
      { cx: 0.30, cy: 0.50, cz: -0.3, rx: 0.42, ry: 0.38, rz: 0.36 },
      { cx: -0.32, cy: 0.48, cz: -0.2, rx: 0.40, ry: 0.36, rz: 0.34 },
      { cx: 0.55, cy: 0.08, cz: -0.15, rx: 0.38, ry: 0.34, rz: 0.34 },
      { cx: -0.50, cy: 0.05, cz: -0.05, rx: 0.36, ry: 0.35, rz: 0.32 },
      { cx: 0.0, cy: 0.0, cz: 0.05, rx: 0.35, ry: 0.42, rz: 0.38 },
      { cx: 0.08, cy: -0.50, cz: -0.1, rx: 0.26, ry: 0.24, rz: 0.22 },
      { cx: 0.10, cy: 0.68, cz: -0.35, rx: 0.35, ry: 0.28, rz: 0.32 },
      { cx: -0.12, cy: -0.60, cz: -0.2, rx: 0.28, ry: 0.22, rz: 0.26 },
      { cx: 0.0, cy: -0.15, cz: 0.35, rx: 0.32, ry: 0.30, rz: 0.30 },
    ],
  ];

  if (count === 6) return baseLayouts[0]!;
  if (count === 7) return baseLayouts[1]!;
  if (count === 8) return baseLayouts[2]!;
  if (count === 9) return baseLayouts[3]!;
  // default to 7
  return baseLayouts[1]!;
}

// ── Inter-lobe connectivity ──────────────────────────────────────────────

function getConnectivity(lobeCount: number): Array<[number, number]> {
  if (lobeCount === 6) return [[0,1],[0,2],[1,3],[2,4],[3,4],[0,5],[1,5],[4,5]];
  if (lobeCount === 7) return [[0,1],[0,2],[1,3],[2,4],[3,4],[0,6],[1,6],[4,5],[4,6]];
  if (lobeCount === 8) return [[0,1],[0,2],[1,3],[2,4],[3,4],[0,6],[1,6],[4,5],[4,7],[0,7],[2,7]];
  if (lobeCount === 9) return [[0,1],[0,2],[1,3],[2,4],[3,4],[0,6],[1,6],[4,5],[4,8],[0,7],[1,7],[2,8],[6,8]];
  return [[0,1],[0,2],[1,3],[2,4],[3,4],[4,5],[4,6]];
}

// ── Scene ────────────────────────────────────────────────────────────────

interface SceneProps { profile: WiregraphProfile; reducedMotion: boolean; }

function WiregraphScene({ profile, reducedMotion }: SceneProps) {
  const coreGroupRef = useRef<THREE.Group>(null);
  const gateMeshRef = useRef<THREE.InstancedMesh>(null);
  const intraLinesRef = useRef<THREE.LineSegments>(null);
  const interLinesRef = useRef<THREE.LineSegments>(null);
  const pulsesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const palette = palettes[profile.colorRole];
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // ── Generate all data once per profile (seeded) ──
  const data = useMemo(() => {
    const rng = mulberry32(profile.lobeCount * 137 + profile.gatesPerLobe * 7);

    const lobeDefs = generateLobeLayout(profile.lobeCount, rng);
    const gatesPerLobeArr: number[] = [];
    for (let l = 0; l < profile.lobeCount; l++) {
      gatesPerLobeArr.push(Math.floor(profile.gatesPerLobe * (0.7 + rng() * 0.6)));
    }
    const totalGates = gatesPerLobeArr.reduce((a, b) => a + b, 0);

    // Gate positions + states
    const gatePositions = new Float32Array(totalGates * 3);
    const gateStates = new Float32Array(totalGates * 3);
    const gateLobeMap = new Int32Array(totalGates);
    let gi = 0;
    for (let l = 0; l < profile.lobeCount; l++) {
      const def = lobeDefs[l]!;
      const count = gatesPerLobeArr[l]!;
      for (let i = 0; i < count; i++) {
        const rx = (rng() - 0.5) * 2 * def.rx;
        const ry = (rng() - 0.5) * 2 * def.ry;
        const rz = (rng() - 0.5) * 2 * def.rz;
        const d = (rx*rx)/(def.rx*def.rx) + (ry*ry)/(def.ry*def.ry) + (rz*rz)/(def.rz*def.rz);
        const scale = d <= 1.0 ? 1.0 : 1.0 / Math.sqrt(d + 0.01);
        gatePositions[gi*3] = def.cx + rx * scale;
        gatePositions[gi*3+1] = def.cy + ry * scale;
        gatePositions[gi*3+2] = def.cz + rz * scale;
        gateStates[gi*3] = rng() > 0.5 ? 1 : 0;
        gateStates[gi*3+1] = rng() * Math.PI * 2;
        gateStates[gi*3+2] = rng();
        gateLobeMap[gi] = l;
        gi++;
      }
    }

    // Intra-lobe edges
    const maxIntra = Math.floor(totalGates * 1.5 * profile.intraEdgeDensity);
    const intraVerts = new Float32Array(maxIntra * 6);
    const intraPairs = new Int32Array(maxIntra * 2);
    let ci = 0;
    for (let l = 0; l < profile.lobeCount && ci < maxIntra; l++) {
      const def = lobeDefs[l]!;
      const maxDist = Math.max(def.rx, def.ry, def.rz) * 0.8;
      const maxDistSq = maxDist * maxDist;
      const lobeStart = gatesPerLobeArr.slice(0, l).reduce((a, b) => a + b, 0);
      const lobeEnd = lobeStart + gatesPerLobeArr[l]!;
      const lobeSize = lobeEnd - lobeStart;
      const target = Math.min(Math.floor(lobeSize * 1.6), maxIntra - ci);
      for (let a = 0; a < target * 6 && ci < maxIntra; a++) {
        const from = lobeStart + Math.floor(rng() * lobeSize);
        const to = lobeStart + Math.floor(rng() * lobeSize);
        if (from === to) continue;
        const dx = gatePositions[from*3] - gatePositions[to*3];
        const dy = gatePositions[from*3+1] - gatePositions[to*3+1];
        const dz = gatePositions[from*3+2] - gatePositions[to*3+2];
        if (dx*dx+dy*dy+dz*dz < maxDistSq && dx*dx+dy*dy+dz*dz > 0.0002) {
          intraVerts[ci*6] = gatePositions[from*3];
          intraVerts[ci*6+1] = gatePositions[from*3+1];
          intraVerts[ci*6+2] = gatePositions[from*3+2];
          intraVerts[ci*6+3] = gatePositions[to*3];
          intraVerts[ci*6+4] = gatePositions[to*3+1];
          intraVerts[ci*6+5] = gatePositions[to*3+2];
          intraPairs[ci*2] = from;
          intraPairs[ci*2+1] = to;
          ci++;
        }
      }
    }
    const intraCount = ci;

    // Inter-lobe trunk edges
    const connectivity = getConnectivity(profile.lobeCount);
    const maxInter = connectivity.length * 4;
    const interVerts = new Float32Array(maxInter * 6);
    const interPairs = new Int32Array(maxInter * 2);
    let ii = 0;
    for (const [la, lb] of connectivity) {
      const sa = gatesPerLobeArr.slice(0, la).reduce((a, b) => a + b, 0);
      const sb = gatesPerLobeArr.slice(0, lb).reduce((a, b) => a + b, 0);
      const trunkCount = 3 + Math.floor(rng() * 2);
      for (let t = 0; t < trunkCount && ii < maxInter; t++) {
        const from = sa + Math.floor(rng() * gatesPerLobeArr[la]!);
        const to = sb + Math.floor(rng() * gatesPerLobeArr[lb]!);
        interVerts[ii*6] = gatePositions[from*3];
        interVerts[ii*6+1] = gatePositions[from*3+1];
        interVerts[ii*6+2] = gatePositions[from*3+2];
        interVerts[ii*6+3] = gatePositions[to*3];
        interVerts[ii*6+4] = gatePositions[to*3+1];
        interVerts[ii*6+5] = gatePositions[to*3+2];
        interPairs[ii*2] = from;
        interPairs[ii*2+1] = to;
        ii++;
      }
    }
    const interCount = ii;

    // Pulse data
    const pulseData: Array<{ connIdx: number; progress: number; speed: number; isInter: boolean }> = [];
    const pulsePos = new Float32Array(profile.pulseCount * 3);
    for (let i = 0; i < profile.pulseCount; i++) {
      const isInter = i < Math.floor(profile.pulseCount * 0.15);
      const maxEdges = isInter ? interCount : intraCount;
      const ci2 = maxEdges > 0 ? Math.floor(rng() * maxEdges) : 0;
      const pairs = isInter ? interPairs : intraPairs;
      const from = pairs[ci2 * 2] ?? 0;
      pulsePos[i*3] = gatePositions[from*3] ?? 0;
      pulsePos[i*3+1] = gatePositions[from*3+1] ?? 0;
      pulsePos[i*3+2] = gatePositions[from*3+2] ?? 0;
      pulseData.push({ connIdx: ci2, progress: rng(), speed: 0.08 + rng() * 0.4 + (isInter ? 0.1 : 0), isInter });
    }

    return {
      totalGates, gatePositions, gateStates, gateLobeMap, gatesPerLobeArr,
      intraVerts, intraPairs, intraCount,
      interVerts, interPairs, interCount,
      pulsePos, pulseData,
    };
  }, [profile]);

  // ── Geometries ──
  const gateGeo = useMemo(() => new THREE.BoxGeometry(0.025, 0.014, 0.005), []);
  const intraGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.intraVerts, 3));
    return g;
  }, [data.intraVerts]);
  const interGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.interVerts, 3));
    return g;
  }, [data.interVerts]);
  const pulseGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.pulsePos, 3));
    return g;
  }, [data.pulsePos]);

  // Initialize gate instance matrices
  useEffect(() => {
    if (!gateMeshRef.current || reducedMotion) return;
    for (let i = 0; i < data.totalGates; i++) {
      dummy.position.set(data.gatePositions[i*3], data.gatePositions[i*3+1], data.gatePositions[i*3+2]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.8);
      dummy.updateMatrix();
      gateMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    gateMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [data, dummy, reducedMotion]);

  // ── Animation ──
  const flipAccRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // Core group
    if (coreGroupRef.current) {
      const breath = 1 + Math.sin(t * profile.breathRate) * 0.008;
      coreGroupRef.current.scale.setScalar(breath);
      coreGroupRef.current.rotation.y += dt * 0.05;
      coreGroupRef.current.rotation.x += dt * 0.015;
      coreGroupRef.current.rotation.z += dt * 0.02;
    }

    // Glow core
    if (glowRef.current) {
      const gp = 1 + Math.sin(t * 0.9) * 0.2;
      glowRef.current.scale.setScalar(gp);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 1.0) * 0.05;
    }

    // Gates — flip cascade
    flipAccRef.current += dt * profile.cascadeSpeed;
    const flipAcc = flipAccRef.current;

    if (gateMeshRef.current) {
      for (let i = 0; i < data.totalGates; i++) {
        const bx = data.gatePositions[i*3];
        const by = data.gatePositions[i*3+1];
        const bz = data.gatePositions[i*3+2];
        const dist = Math.sqrt(bx*bx + by*by + bz*bz);
        const cascade = (flipAcc + dist * 1.5 + data.gateStates[i*3+1]) % (Math.PI * 2);
        if (Math.sin(cascade) > 0.96) {
          data.gateStates[i*3] = data.gateStates[i*3] === 0 ? 1 : 0;
          data.gateStates[i*3+2] = 1.0;
        }
        data.gateStates[i*3+2] *= 0.92;

        const nx = bx * (1 + Math.sin(t*1.1 + data.gateStates[i*3+1]) * 0.015);
        const ny = by * (1 + Math.cos(t*0.9 + data.gateStates[i*3+1]) * 0.015);
        const nz = bz * (1 + Math.sin(t*1.3 + data.gateStates[i*3+1]) * 0.012);
        dummy.position.set(nx, ny, nz);
        dummy.rotation.set(0, 0, 0);
        dummy.rotateY(data.gateStates[i*3] * Math.PI * 0.5);
        dummy.scale.setScalar(0.6 + data.gateStates[i*3+2] * 0.4);
        dummy.updateMatrix();
        gateMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      gateMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Pulses
    if (pulsesRef.current) {
      const posArr = (pulsesRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < profile.pulseCount; i++) {
        const pd = data.pulseData[i]!;
        pd.progress += pd.speed * dt;
        if (pd.progress >= 1.0) {
          pd.progress = 0;
          const maxEdges = pd.isInter ? data.interCount : data.intraCount;
          if (maxEdges > 0) pd.connIdx = Math.floor(Math.random() * maxEdges);
          pd.speed = 0.1 + Math.random() * 0.5 + (pd.isInter ? 0.15 : 0);
        }
        const pairs = pd.isInter ? data.interPairs : data.intraPairs;
        if (pd.connIdx * 2 + 1 >= pairs.length) continue;
        const aIdx = pairs[pd.connIdx * 2]!;
        const bIdx = pairs[pd.connIdx * 2 + 1]!;
        const p = pd.progress;
        posArr[i*3] = data.gatePositions[aIdx*3] + (data.gatePositions[bIdx*3] - data.gatePositions[aIdx*3]) * p;
        posArr[i*3+1] = data.gatePositions[aIdx*3+1] + (data.gatePositions[bIdx*3+1] - data.gatePositions[aIdx*3+1]) * p;
        posArr[i*3+2] = data.gatePositions[aIdx*3+2] + (data.gatePositions[bIdx*3+2] - data.gatePositions[aIdx*3+2]) * p;
      }
      pulsesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={["#010308"]} />
      <fog attach="fog" args={["#010308", 3.5, 10]} />

      <ambientLight intensity={0.08} color="#0a1420" />
      <pointLight position={[3, 2, 4]} intensity={0.6} color={palette.pulse} />
      <pointLight position={[-3, -1.5, 2]} intensity={0.2} color={palette.lineBase} />

      <group ref={coreGroupRef}>
        {/* Micro-gates */}
        <instancedMesh ref={gateMeshRef} args={[gateGeo, undefined, data.totalGates]}>
          <meshStandardMaterial color={palette.gateOn} emissive={palette.gateOff} emissiveIntensity={0.2} roughness={0.4} metalness={0.5} />
        </instancedMesh>

        {/* Intra-lobe traces */}
        <lineSegments ref={intraLinesRef} geometry={intraGeo}>
          <lineBasicMaterial color={palette.lineBase} transparent opacity={0.22} depthWrite />
        </lineSegments>

        {/* Inter-lobe trunk edges */}
        <lineSegments ref={interLinesRef} geometry={interGeo}>
          <lineBasicMaterial color={palette.lineActive} transparent opacity={0.32} depthWrite />
        </lineSegments>

        {/* Traveling pulses */}
        <points ref={pulsesRef} geometry={pulseGeo}>
          <pointsMaterial size={0.03} color={palette.pulse} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>

        {/* Inner glow */}
        <mesh ref={glowRef}>
          <icosahedronGeometry args={[0.1, 2]} />
          <meshBasicMaterial color={palette.glow} transparent opacity={0.18} depthWrite={false} />
        </mesh>

        {/* Subtle orbital arcs */}
        {[0, 1].map((i) => (
          <mesh key={`arc-${i}`} rotation={[Math.PI/2.5 + i*0.5, i*Math.PI/5, 0]}>
            <torusGeometry args={[1.8 + i*0.25, 0.003, 8, 80, Math.PI * 1.4]} />
            <meshBasicMaterial color={palette.lineBase} transparent opacity={0.1 - i*0.03} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

// ── Static SVG Fallback ─────────────────────────────────────────────────

function StaticWiregraph({ profile }: { profile: WiregraphProfile }) {
  const p = palettes[profile.colorRole];
  const lines = [];
  for (let i = 0; i < 30; i++) {
    const x1 = 50 + Math.random() * 160, y1 = 50 + Math.random() * 160;
    const x2 = 50 + Math.random() * 160, y2 = 50 + Math.random() * 160;
    lines.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={p.lineBase} strokeWidth="0.4" opacity="0.2" />);
  }
  const rects = [];
  for (let i = 0; i < 50; i++) {
    const x = 60 + Math.random() * 140, y = 60 + Math.random() * 140;
    rects.push(<rect key={`r-${i}`} x={x} y={y} width="4" height="2" fill={p.gateOn} opacity="0.5" rx="0.5" />);
  }
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: `radial-gradient(circle, ${p.glow}06, #010308)` }}>
      <svg viewBox="0 0 260 260" className="h-72 w-72" aria-hidden="true">
        {lines}
        {rects}
        <circle cx="130" cy="130" r="8" fill={p.glow} opacity="0.4" />
      </svg>
    </div>
  );
}

// ── Error Boundary ───────────────────────────────────────────────────────

class WebGLErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { if (this.state.hasError) return this.props.fallback; return this.props.children; }
}

// ── Model selector ──────────────────────────────────────────────────────

const modelOptions = [
  { id: "Local Model (default)", profile: profiles[0]! },
  { id: "Qwen3.6-35B", profile: profiles[1]! },
  { id: "gpt-4o-mini", profile: profiles[2]! },
  { id: "claude-sonnet-4.5", profile: profiles[3]! },
  { id: "deepseek-v3-0324", profile: profiles[4]! },
  { id: "gemini-2.5-pro", profile: profiles[5]! },
];

// ── Public Component ─────────────────────────────────────────────────────

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

  const totalGates = profile.lobeCount * profile.gatesPerLobe;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative min-h-[480px] lg:min-h-[580px] overflow-hidden rounded-xl border border-[#0a0a14] bg-[#010308]">
        {mounted && !reducedMotion ? (
          <WebGLErrorBoundary fallback={<StaticWiregraph profile={profile} />}>
            <Canvas
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
              camera={{ position: [0, 0.2, 7.5], fov: 38 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <WiregraphScene profile={profile} reducedMotion={reducedMotion} />
              <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={14} enablePan={false} />
            </Canvas>
            <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-xs leading-relaxed">
              <div className="flex flex-col gap-0.5">
                <span style={{ color: p.pulse, opacity: 0.5 }}>MODEL: {profile.label.split(" · ")[0]}</span>
                <span style={{ color: p.lineActive, opacity: 0.3 }}>LOBES: {profile.lobeCount}  ·  GATES: ~{totalGates.toLocaleString()}</span>
                <span style={{ color: p.lineActive, opacity: 0.3 }}>CASCADE: {profile.cascadeSpeed.toFixed(1)}x  ·  PULSES: {profile.pulseCount}</span>
              </div>
            </div>
          </WebGLErrorBoundary>
        ) : (
          <StaticWiregraph profile={profile} />
        )}
        <div className="sr-only" aria-live="polite">
          Synax wiregraph core morphology V3. Model: {profile.label}. Lobes: {profile.lobeCount}. Gates: {totalGates}.
        </div>
      </div>

      {/* Model Selector */}
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-500 mb-3">Loaded Model — Wiregraph Morphology</p>
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
            Dark sci-fi wiregraph brain —{" "}
            <span className="text-neutral-300">{profile.lobeCount} macro lobes</span> with{" "}
            <span className="text-neutral-300">~{totalGates.toLocaleString()} micro-gates</span>.
            Transistor flip cascades at <span className="text-neutral-300">{profile.cascadeSpeed}x</span>,
            {profile.pulseCount} traveling pulses along trunk edges and local traces.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{profile.lobeCount} lobes</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{totalGates} gates</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">cascade {profile.cascadeSpeed}x</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{profile.pulseCount} pulses</span>
            <span className="px-2 py-0.5 text-[0.6rem] font-mono rounded border border-[#1e1e2e] text-neutral-500">{profile.colorRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { resolveProfile, profiles };
export type { WiregraphProfile, ColorRole };
