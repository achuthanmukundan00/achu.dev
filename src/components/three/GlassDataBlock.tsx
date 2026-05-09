/**
 * GlassDataBlock — Smoked glass optical elements floating in the scene.
 *
 * Uses MeshPhysicalMaterial for dark glass / black chrome appearance.
 * Restrained emissive glow only on edges when hover energy is high.
 * These are optical components suspended in the containment volume.
 */
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlassDataBlockProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  color?: string;
  hoverEnergy: number;
  index: number;
  lowPower?: boolean;
}

export default function GlassDataBlock({
  position,
  rotation = [0, 0, 0],
  size,
  color = "#4ade80",
  hoverEnergy,
  index,
  lowPower = false,
}: GlassDataBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Slow drift
    meshRef.current.position.y = position[1] + Math.sin(t * 0.4 + index) * 0.05;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.35 + index) * 0.04;
    meshRef.current.rotation.y += 0.0015;

    // Edge glow only when hover energy is present
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    mat.emissiveIntensity = 0.03 + hoverEnergy * 0.1 + Math.sin(t * 0.6 + index) * 0.02;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={size} />
      {lowPower ? (
        <meshStandardMaterial
          color="#0a1015"
          emissive={color}
          emissiveIntensity={0.06}
          roughness={0.15}
          metalness={0.65}
          transparent
          opacity={0.3}
        />
      ) : (
        <meshPhysicalMaterial
          color="#0a1015"
          emissive={color}
          emissiveIntensity={0.03}
          roughness={0.08}
          metalness={0.6}
          transmission={0.8}
          thickness={0.35}
          ior={1.52}
          clearcoat={0.2}
          clearcoatRoughness={0.15}
          transparent
          opacity={0.4}
          envMapIntensity={0.3}
        />
      )}
    </mesh>
  );
}
