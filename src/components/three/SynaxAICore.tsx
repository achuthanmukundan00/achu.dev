import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Synax AI Core ────────────────────────────────────────────────────────
// Visual concept (from synax-ai-core-morphology-spec.md):
//   Synax = the containment chamber
//   Model  = the intelligence morphology inside it
//
//   A breathing machine eye / contained AI organica:
//   - Outer containment shell / field
//   - Inner glowing nucleus
//   - Orbiting particle field
//   - Subtle scan lines
//   - Calm, restrained, premium terminal-native aesthetic
//
// Designed as a decorative background for the synax featured card on /work.
// ─────────────────────────────────────────────────────────────────────────

function SynaxScene() {
  const coreGroupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const containmentRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);

  // Particle field geometry
  const particleGeometry = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1.4 + Math.random() * 1.2;

      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.7;
      positions[i * 3 + 2] = Math.cos(phi) * radius * 0.5;
      sizes[i] = Math.random() * 3 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  // Inner field ring segments
  const ringSegments = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * Math.PI * 2;
      return { angle, length: 0.12 + (i % 3) * 0.06 };
    });
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.getElapsedTime();

    // Core breathing
    if (coreGroupRef.current) {
      const breath = 1 + Math.sin(t * 0.7) * 0.025;
      coreGroupRef.current.scale.setScalar(breath);

      // Subtle pointer tracking
      const targetRotY = pointer.x * 0.15;
      const targetRotX = pointer.y * 0.08;
      coreGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        coreGroupRef.current.rotation.y,
        targetRotY,
        0.03,
      );
      coreGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        coreGroupRef.current.rotation.x,
        targetRotX,
        0.03,
      );
    }

    // Nucleus pulse
    if (nucleusRef.current) {
      const pulse = 1 + Math.sin(t * 1.3) * 0.06;
      nucleusRef.current.scale.setScalar(pulse);
      const mat = nucleusRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + Math.sin(t * 1.3) * 0.2;
    }

    // Scan line sweep
    if (scanLineRef.current) {
      scanLineRef.current.position.y = ((t * 0.25) % 2.8) - 1.4;
      const mat = scanLineRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.abs(Math.sin(t * 2)) * 0.08;
    }

    // Particle rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.08;
      particlesRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <>
      <color attach="background" args={["#03080f"]} />
      <fog attach="fog" args={["#03080f", 5, 12]} />
      <ambientLight intensity={0.15} />

      {/* Accent lights */}
      <pointLight position={[3, 2, 4]} intensity={1.2} color="#7fffd1" />
      <pointLight position={[-3, -1.5, 2]} intensity={0.4} color="#7fffd1" />
      <pointLight position={[0, -3, 1]} intensity={0.6} color="#ffffff" />

      {/* Outer containment shell */}
      <group ref={coreGroupRef}>
        {/* Outer glow ring — torus */}
        <mesh ref={containmentRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[1.6, 0.015, 16, 80]} />
          <meshBasicMaterial color="#7fffd1" transparent opacity={0.35} />
        </mesh>

        {/* Second subtle ring — offset rotation */}
        <mesh rotation={[Math.PI / 3, Math.PI / 5, Math.PI / 7]}>
          <torusGeometry args={[1.45, 0.01, 16, 64]} />
          <meshBasicMaterial color="#7fffd1" transparent opacity={0.18} />
        </mesh>

        {/* Inner field — dense ring made of segments */}
        <group rotation={[0, 0, 0]}>
          {ringSegments.map((seg, i) => {
            const x = Math.cos(seg.angle) * 1.18;
            const y = Math.sin(seg.angle) * 1.18;
            return (
              <mesh
                key={`ring-${i}`}
                position={[x, y, 0]}
                rotation={[0, 0, seg.angle + Math.PI / 2]}
              >
                <boxGeometry args={[seg.length, 0.02, 0.015]} />
                <meshBasicMaterial
                  color={i % 3 === 0 ? "#ffffff" : "#7fffd1"}
                  transparent
                  opacity={i % 4 === 0 ? 0.5 : 0.25}
                />
              </mesh>
            );
          })}
        </group>

        {/* Inner aperture ring — more defined */}
        <mesh rotation={[Math.PI / 2, 0.2, 0.3]}>
          <torusGeometry args={[0.9, 0.025, 8, 48]} />
          <meshBasicMaterial color="#7fffd1" transparent opacity={0.45} />
        </mesh>

        {/* Nucleus — the "eye" */}
        <mesh ref={nucleusRef} rotation={[0.5, 0.3, 1.2]}>
          <octahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial
            color="#0a1a14"
            emissive="#7fffd1"
            emissiveIntensity={0.55}
            roughness={0.18}
            metalness={0.75}
            flatShading
          />
        </mesh>

        {/* Nucleus glow halo */}
        <mesh>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial color="#7fffd1" transparent opacity={0.06} />
        </mesh>

        {/* Scan line — horizontal beam */}
        <mesh ref={scanLineRef} position={[0, 0, 0.15]}>
          <boxGeometry args={[3.8, 0.012, 0.012]} />
          <meshBasicMaterial color="#7fffd1" transparent opacity={0.14} />
        </mesh>

        {/* Vertical containment bars — subtle */}
        {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
          <mesh key={`vbar-${i}`} position={[x, 0, -0.05]}>
            <boxGeometry args={[0.008, 2.8, 0.008]} />
            <meshBasicMaterial
              color="#7fffd1"
              transparent
              opacity={0.08 + Math.abs(i - 2) * 0.02}
            />
          </mesh>
        ))}
      </group>

      {/* Particle field */}
      <points ref={particlesRef}>
        <primitive object={particleGeometry} />
        <pointsMaterial
          color="#7fffd1"
          size={0.025}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Far background specks */}
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        const r = 3 + (i % 3) * 0.8;
        return (
          <mesh
            key={`bg-${i}`}
            position={[
              Math.cos(a + i * 0.3) * r,
              Math.sin(a + i * 0.3) * r * 0.6,
              -1 - (i % 4) * 0.25,
            ]}
          >
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial color="#7fffd1" transparent opacity={0.18} />
          </mesh>
        );
      })}
    </>
  );
}

// ── Fallback: static SVG for when WebGL is unavailable ──────────────────

function StaticSynax() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#03080f]">
      <svg viewBox="0 0 260 260" className="h-72 w-72" aria-hidden="true">
        {/* Outer containment ring */}
        <circle cx="130" cy="130" r="95" fill="none" stroke="#7fffd1" strokeWidth="1.5" opacity="0.3" />
        <circle cx="130" cy="130" r="82" fill="none" stroke="#7fffd1" strokeWidth="1" opacity="0.18" />

        {/* Inner field ring */}
        <circle cx="130" cy="130" r="58" fill="none" stroke="#7fffd1" strokeWidth="2" opacity="0.45" />

        {/* Nucleus */}
        <circle cx="130" cy="130" r="18" fill="#7fffd1" opacity="0.7" />
        <circle cx="130" cy="130" r="26" fill="none" stroke="#7fffd1" strokeWidth="1" opacity="0.12" />

        {/* Scan line */}
        <line x1="40" y1="130" x2="220" y2="130" stroke="#7fffd1" strokeWidth="1" opacity="0.2" />

        {/* Vertical bars */}
        {[70, 100, 130, 160, 190].map((x) => (
          <line key={x} x1={x} y1="50" x2={x} y2="210" stroke="#7fffd1" strokeWidth="0.5" opacity="0.1" />
        ))}

        {/* Particles */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={130 + Math.cos(a) * 72}
              cy={130 + Math.sin(a) * 52}
              r="2"
              fill="#7fffd1"
              opacity="0.3"
            />
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
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ── Public Component ─────────────────────────────────────────────────────

interface SynaxAICoreProps {
  className?: string;
}

export default function SynaxAICore({ className = "" }: SynaxAICoreProps) {
  const [mounted, setMounted] = useState(false);
  const fallback = <StaticSynax />;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {mounted ? (
        <WebGLErrorBoundary fallback={fallback}>
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 6.5], fov: 45 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <SynaxScene />
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        fallback
      )}
      <div className="sr-only" aria-live="polite">
        Synax AI core — animated containment chamber visualization.
      </div>
    </div>
  );
}
