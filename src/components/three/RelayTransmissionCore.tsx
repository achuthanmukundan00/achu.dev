import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Relay Transmission Core ──────────────────────────────────────────────
// Visual concept:
//   Data packets stream through horizontal routing rails across a
//   central "compatibility membrane" — amber on ingress, green on egress.
//   Mirrors how Relay translates between agent expectations and local
//   model realities. Designed as a decorative background for the relay
//   featured card on /work. Text is overlaid by the parent component.
// ─────────────────────────────────────────────────────────────────────────

function TransmissionScene() {
  const packetGroupRef = useRef<THREE.Group>(null);
  const membraneRef = useRef<THREE.Mesh>(null);
  const railsRef = useRef<THREE.Group>(null);

  const railYs = useMemo(() => [-2.4, -1.2, 0, 1.2, 2.4], []);

  // Packets: position, speed, rail assignment
  const packets = useMemo(() => {
    const count = 28;
    return Array.from({ length: count }, (_, i) => ({
      rail: i % railYs.length,
      x: Math.random() * 12 - 6,
      speed: 0.4 + Math.random() * 1.4,
      size: 0.03 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [railYs.length]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Pulse membrane glow
    if (membraneRef.current) {
      const mat = membraneRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.06 + Math.sin(t * 0.7) * 0.03;
    }

    // Move packets
    if (packetGroupRef.current) {
      packetGroupRef.current.children.forEach((child, idx) => {
        const p = packets[idx];
        if (!p) return;
        p.x += p.speed * delta;
        if (p.x > 6.5) p.x = -6.5;

        child.position.x = p.x;
        child.position.y = railYs[p.rail];
        // subtle z oscillation
        child.position.z = Math.sin(t * 2.5 + p.phase) * 0.15;

        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;

        // Color transition: amber (ingress) → blue (membrane) → green (egress)
        const absX = Math.abs(p.x);
        if (absX < 0.6) {
          mat.color.setHex(0x3b82f6); // blue — inside membrane
        } else if (p.x < 0) {
          mat.color.copy(
            new THREE.Color(0xf59e0b).lerp(new THREE.Color(0x3b82f6), Math.min(absX / 3, 1) * 0.35),
          );
        } else {
          mat.color.copy(
            new THREE.Color(0x3b82f6).lerp(new THREE.Color(0x4ade80), Math.min((p.x - 0.6) / 2.5, 1)),
          );
        }

        // Pulse opacity
        mat.opacity = 0.4 + Math.abs(Math.sin(t * 3 + p.phase)) * 0.35;
      });
    }
  });

  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog attach="fog" args={["#03050a", 6, 14]} />
      <ambientLight intensity={0.18} />

      {/* Subtle grid on floor */}
      <group position={[0, 0, -1.2]}>
        {Array.from({ length: 24 }, (_, i) => (
          <mesh key={`grid-v-${i}`} position={[(i - 11.5) * 0.55, 0, 0]}>
            <boxGeometry args={[0.01, 6, 0.01]} />
            <meshBasicMaterial color="#1e293b" transparent opacity={0.15} />
          </mesh>
        ))}
        {railYs.map((y, i) => (
          <mesh key={`grid-h-${i}`} position={[0, y, 0]}>
            <boxGeometry args={[12, 0.01, 0.01]} />
            <meshBasicMaterial color="#1e293b" transparent opacity={0.12} />
          </mesh>
        ))}
      </group>

      {/* Routing rails — subtle glowing lines */}
      <group ref={railsRef}>
        {railYs.map((y, i) => (
          <mesh key={`rail-${i}`} position={[0, y, 0.05]}>
            <boxGeometry args={[11.5, 0.012, 0.012]} />
            <meshBasicMaterial color="#334155" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Membrane zone — vertical glow planes */}
      <mesh ref={membraneRef} position={[0, 0, -0.08]}>
        <planeGeometry args={[0.35, 6.2]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Membrane edge accent lines */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={`edge-${i}`} position={[x, 0, 0.04]}>
          <boxGeometry args={[0.008, 6, 0.008]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.22} />
        </mesh>
      ))}

      {/* Membrane label nodes — small dots along edges */}
      {railYs.map((y, i) => (
        <mesh key={`node-${i}`} position={[0, y, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Data packets */}
      <group ref={packetGroupRef}>
        {packets.map((p, i) => (
          <mesh key={i}>
            <boxGeometry args={[p.size * 3.5, p.size, p.size * 1.5]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>

      {/* Floating ambient particles */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const r = 3.5 + (i % 3) * 0.6;
        return (
          <mesh
            key={`amb-${i}`}
            position={[
              Math.cos(a) * r,
              Math.sin(a) * r * 0.6,
              -0.5 - (i % 4) * 0.2,
            ]}
          >
            <sphereGeometry args={[0.015, 4, 4]} />
            <meshBasicMaterial color="#475569" transparent opacity={0.25} />
          </mesh>
        );
      })}
    </>
  );
}

// ── Fallback: static SVG for when WebGL is unavailable ──────────────────

function StaticRelay() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#03050a]">
      <svg viewBox="0 0 400 200" className="h-48 w-full max-w-md opacity-30" aria-hidden="true">
        {/* Rails */}
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="#334155" strokeWidth="0.5" />
        ))}
        {/* Membrane */}
        <rect x="195" y="20" width="10" height="160" fill="#3b82f6" opacity="0.15" />
        {/* Packets */}
        {[60, 100, 60, 140, 100].map((y, i) => (
          <rect
            key={i}
            x={60 + (i % 3) * 80}
            y={y - 3}
            width="14"
            height="6"
            rx="1"
            fill={i < 2 ? "#f59e0b" : i < 3 ? "#3b82f6" : "#4ade80"}
            opacity="0.5"
          />
        ))}
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

interface RelayTransmissionCoreProps {
  className?: string;
}

export default function RelayTransmissionCore({ className = "" }: RelayTransmissionCoreProps) {
  const [mounted, setMounted] = React.useState(false);
  const fallback = <StaticRelay />;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {mounted ? (
        <WebGLErrorBoundary fallback={fallback}>
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 7.5], fov: 48 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <TransmissionScene />
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        fallback
      )}
      <div className="sr-only" aria-live="polite">
        Relay transmission core — animated protocol visualization.
      </div>
    </div>
  );
}
