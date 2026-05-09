/**
 * TraceGraph — Diagnostic trace lines. Smooth tube geometry, blue-white only.
 */
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function genPath(seed: number, nodes: number): THREE.Vector3[] {
  const rng = mulberry32(seed);
  const pts: THREE.Vector3[] = [];
  let x = (rng() - 0.5) * 3, y = (rng() - 0.5) * 2.5, z = (rng() - 0.5) * 1.5;
  for (let i = 0; i < nodes; i++) {
    pts.push(new THREE.Vector3(x, y, z));
    x += (rng() - 0.5) * 0.8; y += (rng() - 0.5) * 0.6; z += (rng() - 0.5) * 0.4;
  }
  return pts;
}

export default function TraceGraph({
  scrollProgress: _sp, hoverEnergy, reducedMotion, lowPower = false,
}: { scrollProgress: number; hoverEnergy: number; reducedMotion: boolean; lowPower?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = lowPower ? 5 : 10;
  const nodeCount = 5;

  const traces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      path: genPath(i * 42 + 17, nodeCount),
      nodes: genPath(i * 137 + 91, nodeCount).map(p => p.clone()),
    })), [count]);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const line = child as THREE.Line;
      if (!line.geometry) return;
      const arr = line.geometry.attributes.position.array as Float32Array;
      const tr = traces[i]; if (!tr) return;
      for (let j = 0; j < nodeCount; j++) {
        const n = tr.nodes[j]!;
        arr[j * 3] = n.x + Math.sin(t * 0.8 + i + j) * 0.04;
        arr[j * 3 + 1] = n.y + Math.cos(t * 0.6 + i + j) * 0.04;
        arr[j * 3 + 2] = n.z;
      }
      line.geometry.attributes.position.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).opacity =
        0.02 + hoverEnergy * 0.12 + Math.sin(t * 1 + i) * 0.01;
    });
  });

  return (
    <group ref={groupRef}>
      {traces.map((tr, i) => (
        <primitive key={i} object={
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(tr.path),
            new THREE.LineBasicMaterial({ color: "#8899bb", transparent: true, opacity: 0.02 })
          )
        } />
      ))}
      {traces.map((tr, i) => tr.nodes.map((n, j) => (
        <mesh key={`n-${i}-${j}`} position={n}>
          <sphereGeometry args={[0.008, 4, 4]} />
          <meshBasicMaterial color="#8899bb" transparent opacity={0.08} />
        </mesh>
      )))}
    </group>
  );
}
