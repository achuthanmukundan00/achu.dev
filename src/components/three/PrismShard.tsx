/**
 * PrismShard — Smoked glass optical fragments for the inhabitable worlds section.
 *
 * These are dark, refractive glass fragments (not colorful floating blocks).
 * They feel like optical components — lenses, prisms, wafers — suspended
 * in the containment volume. Restrained toxic-green edge glow only.
 */
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PrismShardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  index: number;
  reducedMotion: boolean;
  lowPower?: boolean;
}

export default function PrismShard({
  position,
  rotation,
  scale,
  color,
  index,
  reducedMotion,
  lowPower = false,
}: PrismShardProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      meshRef.current.position.y =
        position[1] + Math.sin(t * 0.35 + index * 1.7) * 0.15;
      meshRef.current.position.x =
        position[0] + Math.cos(t * 0.25 + index * 1.3) * 0.1;
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.z += 0.0015;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      {lowPower ? (
        <meshStandardMaterial
          color="#0a1015"
          emissive={color}
          emissiveIntensity={0.08}
          roughness={0.12}
          metalness={0.5}
          transparent
          opacity={0.25}
        />
      ) : (
        <meshPhysicalMaterial
          color="#0a1015"
          roughness={0.06}
          metalness={0.5}
          transmission={0.85}
          thickness={0.25}
          ior={1.52}
          clearcoat={0.25}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.35}
          envMapIntensity={0.3}
        />
      )}
    </mesh>
  );
}

/** Generate a field of dark glass fragments */
export function PrismShardField({
  reducedMotion,
  lowPower = false,
}: {
  reducedMotion: boolean;
  lowPower?: boolean;
}) {
  const shards = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const theta = (i / 10) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 2;
      // Dark restrained palette — toxic green and cool blue-white only
      const colors = ["#4ade80", "#93c5fd", "#4ade80"];
      return {
        position: [
          Math.cos(theta) * radius,
          (Math.random() - 0.5) * 3.5,
          Math.sin(theta) * radius * 0.6 - 1.5,
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ] as [number, number, number],
        scale: 0.12 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        index: i,
      };
    });
  }, []);

  return (
    <group>
      {shards.map((shard, i) => (
        <PrismShard
          key={i}
          position={shard.position}
          rotation={shard.rotation}
          scale={shard.scale}
          color={shard.color}
          index={shard.index}
          reducedMotion={reducedMotion}
          lowPower={lowPower}
        />
      ))}
    </group>
  );
}
