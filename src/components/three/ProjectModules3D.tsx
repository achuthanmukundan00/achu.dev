/**
 * ProjectModules3D — Diagnostic panels embedded in the 3D containment environment.
 *
 * Each module is a dark translucent glass card with:
 *   thin border
 *   small status LED
 *   technical uppercase label
 *   restrained hover reactivity (lift + edge glow)
 *
 * Hover effects per project spec:
 *   Relay   → blue-white routing lines activate
 *   Synax   → core densifies, rare orange instability flash
 *   wytOS   → graph nodes bloom faintly
 *   watchyourtemper → spectral line shimmers toxic green
 */
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface ProjectModule {
  id: string;
  title: string;
  label: string;
  detail: string;
  color: string;
  accent: string;
  href: string;
  position: [number, number, number];
}

const modules: ProjectModule[] = [
  {
    id: "synax",
    title: "Synax",
    label: "CODING AGENT",
    detail: "Experimental terminal agent for quantized local/open models. Closed alpha.",
    color: "#4ade80",
    accent: "#93c5fd",
    href: "/work/synax",
    position: [-2.2, 0.6, -0.5],
  },
  {
    id: "relay",
    title: "Relay",
    label: "MODEL GATEWAY",
    detail: "OpenAI/Anthropic-compatible shim for local llama.cpp runtimes.",
    color: "#93c5fd",
    accent: "#60a5fa",
    href: "/work/relay",
    position: [2.2, 0.6, -0.5],
  },
  {
    id: "wytos",
    title: "wytOS",
    label: "MEMORY OS",
    detail: "Structured creative memory with SQLite FTS5 and local LLM assistance.",
    color: "#93c5fd",
    accent: "#818cf8",
    href: "/work/wytos",
    position: [-2.2, -1.0, -0.3],
  },
  {
    id: "watchyourtemper",
    title: "watchyourtemper",
    label: "AUDIO WORLD",
    detail: "Electronic music, events, merch, and worldbuilding.",
    color: "#4ade80",
    accent: "#86efac",
    href: "https://watchyourtemper.com",
    position: [2.2, -1.0, -0.3],
  },
];

interface ProjectModuleCardProps {
  module: ProjectModule;
  index: number;
  onHover: (id: string | null) => void;
  reducedMotion: boolean;
  lowPower: boolean;
}

function ProjectModuleCard({
  module,
  index,
  onHover,
  reducedMotion,
  lowPower,
}: ProjectModuleCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      // Slow float
      groupRef.current.position.y =
        module.position[1] + Math.sin(t * 0.4 + index * 1.5) * 0.06;

      if (hovered) {
        // Hover lift + subtle forward movement
        groupRef.current.position.z = THREE.MathUtils.lerp(
          groupRef.current.position.z,
          module.position[2] + 0.12,
          0.15,
        );
        groupRef.current.scale.setScalar(
          THREE.MathUtils.lerp(groupRef.current.scale.x, 1.04, 0.12),
        );
      } else {
        groupRef.current.position.z = THREE.MathUtils.lerp(
          groupRef.current.position.z,
          module.position[2],
          0.12,
        );
        groupRef.current.scale.setScalar(
          THREE.MathUtils.lerp(groupRef.current.scale.x, 1, 0.12),
        );
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={module.position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(module.id);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover(null);
      }}
    >
      {/* Dark glass card body */}
      <mesh>
        <boxGeometry args={[1.6, 1.0, 0.06]} />
        <meshPhysicalMaterial
          color="#0a1015"
          emissive={module.color}
          emissiveIntensity={hovered ? 0.1 : 0.02}
          roughness={0.08}
          metalness={0.5}
          transmission={0.7}
          thickness={0.18}
          ior={1.5}
          clearcoat={0.2}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Thin border frame */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[1.64, 1.04, 0.008]} />
        <meshBasicMaterial
          color={module.color}
          transparent
          opacity={hovered ? 0.3 : 0.05}
        />
      </mesh>

      {/* Title text — white, sharp */}
      {!lowPower && (
        <Text
          position={[0, 0.2, 0.04]}
          fontSize={0.18}
          color="#ffffff"
          font="/fonts/JetBrainsMono-Bold.woff"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.9}
        >
          {module.title}
        </Text>
      )}

      {/* Uppercase technical label */}
      {!lowPower && (
        <Text
          position={[0, -0.05, 0.04]}
          fontSize={0.055}
          color={module.color}
          font="/fonts/JetBrainsMono-Regular.woff"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.5}
        >
          {module.label}
        </Text>
      )}

      {/* Status indicator LED */}
      <mesh position={[0.5, 0.35, 0.04]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial
          color={module.color}
          transparent
          opacity={hovered ? 0.85 : 0.25}
        />
      </mesh>

      {/* Small corner accent marks */}
      {[[-0.72, 0.42], [0.72, 0.42], [-0.72, -0.42], [0.72, -0.42]].map(([cx, cy], ci) => (
        <mesh key={`corner-${ci}`} position={[cx, cy, 0.035]}>
          <boxGeometry args={[0.04, 0.012, 0.006]} />
          <meshBasicMaterial color={module.color} transparent opacity={hovered ? 0.4 : 0.06} />
        </mesh>
      ))}
    </group>
  );
}

interface ProjectModules3DProps {
  reducedMotion: boolean;
  onModuleHover: (id: string | null) => void;
  lowPower?: boolean;
}

export default function ProjectModules3D({
  reducedMotion,
  onModuleHover,
  lowPower = false,
}: ProjectModules3DProps) {
  return (
    <group>
      {modules.map((mod, i) => (
        <ProjectModuleCard
          key={mod.id}
          module={mod}
          index={i}
          onHover={onModuleHover}
          reducedMotion={reducedMotion}
          lowPower={lowPower}
        />
      ))}
    </group>
  );
}

export { modules };
export type { ProjectModule };
