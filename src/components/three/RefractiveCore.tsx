/**
 * RefractiveCore — Contained local AI runtime. Arc-reactor inspired.
 *
 * Not a stock Three.js demo. Precision-engineered containment geometry:
 *   Outer shell   — faceted smoked glass (refractive prism)
 *   Aperture iris — rotating blade ring (camera-aperture style)
 *   Energy coils  — concentric rings of luminous spheres (not random)
 *   Nucleus       — dense bright center cluster
 *   Diagnostic    — concentric chrome rings at precise radii
 *   Scan beam     — horizontal sweep line
 *
 * Motion: controlled, mechanical breathing. Counter-rotating rings.
 * Hover: lens compression, iris tightens, rare orange instability.
 * Palette: near-black / graphite / chrome / blue-white. No green.
 */
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════════════
// ENERGY COIL — spheres in precise concentric rings (not random)
// ═══════════════════════════════════════════════════════════════════════

interface CoilRing {
  radius: number;
  count: number;
  sphereRadius: number;
  rotation: [number, number, number];
  brightness: number; // 0–1 base brightness
  phaseOffset: number;
}

const COIL_RINGS: CoilRing[] = [
  { radius: 0.18, count: 12, sphereRadius: 0.018, rotation: [0, 0, 0], brightness: 0.9, phaseOffset: 0 },
  { radius: 0.28, count: 18, sphereRadius: 0.016, rotation: [Math.PI / 7, 0, 0], brightness: 0.75, phaseOffset: 0.5 },
  { radius: 0.38, count: 24, sphereRadius: 0.014, rotation: [0, Math.PI / 6, 0], brightness: 0.6, phaseOffset: 1.0 },
  { radius: 0.48, count: 30, sphereRadius: 0.012, rotation: [Math.PI / 9, Math.PI / 8, 0], brightness: 0.45, phaseOffset: 1.5 },
  { radius: 0.56, count: 36, sphereRadius: 0.01, rotation: [0, 0, Math.PI / 10], brightness: 0.3, phaseOffset: 2.0 },
];

// ── Coil Spheres (instanced, arranged in rings) ─────────────────────────

function EnergyCoils({
  hoverEnergy,
  reducedMotion,
}: {
  hoverEnergy: number;
  reducedMotion: boolean;
}) {
  const totalSpheres = COIL_RINGS.reduce((s, r) => s + r.count, 0);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const flashRef = useRef({ timer: 0, end: 0, idx: new Set<number>() });

  // Precompute sphere positions along rings
  const ringData = useMemo(() => {
    const data: { pos: THREE.Vector3; ring: CoilRing; localAngle: number }[] = [];
    for (const ring of COIL_RINGS) {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;
        const x = Math.cos(angle) * ring.radius;
        const y = Math.sin(angle) * ring.radius;
        data.push({ pos: new THREE.Vector3(x, y, 0), ring, localAngle: angle });
      }
    }
    return data;
  }, []);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Orange flash
    const now = performance.now();
    if (hoverEnergy > 0.3 && flashRef.current.timer === 0) {
      if (Math.random() < delta * hoverEnergy * 0.06) {
        flashRef.current.timer = now;
        flashRef.current.end = now + 200 + Math.random() * 150;
        const c = Math.floor(totalSpheres * 0.05);
        const s = new Set<number>();
        while (s.size < c) s.add(Math.floor(Math.random() * totalSpheres));
        flashRef.current.idx = s;
      }
    }
    const inFlash = now < flashRef.current.end;
    if (!inFlash) { flashRef.current.timer = 0; flashRef.current.idx = new Set(); }
    const fp = inFlash ? 1 - (flashRef.current.end - now) / (flashRef.current.end - flashRef.current.timer) : 0;

    let idx = 0;
    for (const ring of COIL_RINGS) {
      for (let i = 0; i < ring.count; i++) {
        const d = ringData[idx]!;
        const angle = d.localAngle;

        // Breathing: radial pulse
        const breath = reducedMotion ? 0 : Math.sin(t * 1.2 + ring.phaseOffset + i * 0.3) * 0.015
          + hoverEnergy * 0.01;
        const r = ring.radius + breath;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        dummy.position.set(x, y, 0);
        dummy.scale.setScalar(ring.sphereRadius / 0.02); // normalized by base geo size
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        // Color
        if (inFlash && flashRef.current.idx.has(idx)) {
          const f = fp < 0.5 ? fp * 2 : (1 - fp) * 2;
          tempColor.setRGB(0.98 * f + 0.8 * (1 - f), 0.45 * f + 0.85 * (1 - f), 0.1 * f + 1.0 * (1 - f));
        } else {
          const b = ring.brightness + (reducedMotion ? 0 : Math.sin(t * 1.5 + ring.phaseOffset) * 0.08) + hoverEnergy * 0.12;
          tempColor.setRGB(0.78 * b, 0.85 * b, 0.98 * b);
        }
        meshRef.current.setColorAt(idx, tempColor);
        idx++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalSpheres]} frustumCulled={false}>
      <sphereGeometry args={[0.02, 10, 6]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.85} depthWrite={false} />
    </instancedMesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APERTURE IRIS — rotating camera-aperture blades
// ═══════════════════════════════════════════════════════════════════════

const BLADE_COUNT = 10;

function ApertureIris({ hoverEnergy, reducedMotion }: { hoverEnergy: number; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const blades = useMemo(() => {
    return Array.from({ length: BLADE_COUNT }, (_, i) => {
      const angle = (i / BLADE_COUNT) * Math.PI * 2;
      const baseRot = angle + Math.PI / 2; // blade tangent to circle
      return { angle, baseRot };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    // Iris tightens with hover energy
    const irisScale = 0.55 - hoverEnergy * 0.12;
    groupRef.current.scale.setScalar(irisScale);
    groupRef.current.rotation.z += 0.003 + hoverEnergy * 0.008;
  });

  return (
    <group ref={groupRef}>
      {blades.map((b, i) => (
        <mesh
          key={i}
          position={[Math.cos(b.angle) * 0.42, Math.sin(b.angle) * 0.42, 0]}
          rotation={[0, 0, b.baseRot]}
        >
          <boxGeometry args={[0.35, 0.015, 0.01]} />
          <meshStandardMaterial
            color="#8899aa" roughness={0.2} metalness={0.95}
            transparent opacity={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CONTAINMENT RINGS — precise chrome torus rings
// ═══════════════════════════════════════════════════════════════════════

const CHROME_RINGS = [
  { radius: 0.92, thickness: 0.003, rotation: [Math.PI / 2.4, 0, 0] as [number, number, number] },
  { radius: 0.86, thickness: 0.004, rotation: [Math.PI / 3.2, Math.PI / 7, 0] as [number, number, number] },
  { radius: 0.66, thickness: 0.005, rotation: [Math.PI / 2, Math.PI / 5, Math.PI / 9] as [number, number, number] },
  { radius: 0.22, thickness: 0.003, rotation: [0, 0, 0] as [number, number, number] },
];

function ContainmentRings() {
  return (
    <group>
      {CHROME_RINGS.map((r, i) => (
        <mesh key={i} rotation={r.rotation}>
          <torusGeometry args={[r.radius, r.thickness, 20, 180]} />
          <meshStandardMaterial
            color="#8899aa" roughness={0.18} metalness={0.95}
            emissive="#445566" emissiveIntensity={0.15}
            transparent opacity={0.3 - i * 0.04}
          />
        </mesh>
      ))}

      {/* Tick marks on outermost ring */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return (
          <mesh key={`tick-${i}`}
            position={[Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0]}
            rotation={[0, 0, a + Math.PI / 2]}>
            <boxGeometry args={[0.015, 0.001, 0.001]} />
            <meshBasicMaterial color="#556677" transparent opacity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NUCLEUS — dense bright center
// ═══════════════════════════════════════════════════════════════════════

function Nucleus({ hoverEnergy, reducedMotion }: { hoverEnergy: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.03 + hoverEnergy * 0.05;
      ref.current.scale.setScalar(pulse);
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.06 + hoverEnergy * 0.04 + Math.sin(t * 1.5) * 0.02;
    }
  });

  return (
    <group>
      {/* Bright core sphere */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial
          color="#8899aa" roughness={0.1} metalness={0.9}
          emissive="#d0e0ff" emissiveIntensity={0.6 + hoverEnergy * 0.4}
        />
      </mesh>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshBasicMaterial color="#c0d8ff" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// AMBIENT FIELD — distant faint particles
// ═══════════════════════════════════════════════════════════════════════

function AmbientField({ lowPower }: { lowPower: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = lowPower ? 30 : 60;
  const base = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.0 + Math.random() * 2.0;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r * 0.5;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] = base[i * 3]! + Math.sin(t * 0.3 + i) * 0.12;
      arr[i * 3 + 1] = base[i * 3 + 1]! + Math.cos(t * 0.25 + i) * 0.12;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(base, 3));
    return g;
  }, [base]);

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.006} color="#8899cc" transparent opacity={0.06}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

interface RefractiveCoreProps {
  scrollProgress: number;
  hoverEnergy: number;
  reducedMotion: boolean;
  lowPower?: boolean;
}

export default function RefractiveCore({
  scrollProgress: _sp,
  hoverEnergy,
  reducedMotion,
  lowPower = false,
}: RefractiveCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;

    // Overall breathing
    groupRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.008);

    if (!reducedMotion) {
      // Slow drift + pointer parallax
      groupRef.current.rotation.y += delta * 0.035;
      groupRef.current.rotation.x += delta * 0.008;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, pointer.x * 0.04, 0.01,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, -pointer.y * 0.025, 0.01,
      );
    }

    // Shell counter-rotates
    if (shellRef.current && !reducedMotion) {
      shellRef.current.rotation.y += delta * 0.018;
    }

    // Rings counter-rotate
    if (ringGroupRef.current && !reducedMotion) {
      ringGroupRef.current.rotation.z += delta * 0.025;
    }

    // Scan beam
    if (scanRef.current && !reducedMotion) {
      scanRef.current.position.y = ((t * 0.15) % 2.8) - 1.4;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.025 + hoverEnergy * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── OUTER SHELL — faceted smoked glass ── */}
      <group ref={shellRef}>
        {lowPower ? (
          <mesh scale={[1, 1, 0.85]}>
            <icosahedronGeometry args={[0.88, 1]} />
            <meshStandardMaterial color="#080c12" roughness={0.15} metalness={0.7}
              transparent opacity={0.22} />
          </mesh>
        ) : (
          <mesh scale={[1, 1, 0.85]}>
            <icosahedronGeometry args={[0.88, 2]} />
            <MeshTransmissionMaterial
              background={new THREE.Color("#020407")}
              transmission={0.94} thickness={0.28} roughness={0.13} ior={1.55}
              chromaticAberration={0.03} anisotropy={0.22}
              distortion={0.05} distortionScale={0.28} temporalDistortion={0.04}
              iridescence={0.04} iridescenceIOR={1.2} samples={5} resolution={256}
            />
          </mesh>
        )}
      </group>

      {/* ── CHROME CONTAINMENT RINGS ── */}
      <group ref={ringGroupRef}>
        <ContainmentRings />
      </group>

      {/* ── APERTURE IRIS ── */}
      <ApertureIris hoverEnergy={hoverEnergy} reducedMotion={reducedMotion} />

      {/* ── ENERGY COILS — the contained intelligence ── */}
      <EnergyCoils hoverEnergy={hoverEnergy} reducedMotion={reducedMotion} />

      {/* ── NUCLEUS — dense bright center ── */}
      <Nucleus hoverEnergy={hoverEnergy} reducedMotion={reducedMotion} />

      {/* ── SCAN BEAM ── */}
      <mesh ref={scanRef} position={[0, 0, 0.2]}>
        <planeGeometry args={[2.4, 0.005]} />
        <meshBasicMaterial color="#c0d8ff" transparent opacity={0.025} />
      </mesh>

      {/* ── CONTAINMENT BARS ── */}
      {[-0.35, -0.15, 0, 0.15, 0.35].map(x => (
        <mesh key={x} position={[x, 0, 0.28]}>
          <boxGeometry args={[0.002, 2.4, 0.002]} />
          <meshBasicMaterial color="#8899aa" transparent opacity={0.02} />
        </mesh>
      ))}

      {/* ── AMBIENT DISTANT FIELD ── */}
      <AmbientField lowPower={lowPower} />
    </group>
  );
}
