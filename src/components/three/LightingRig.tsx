/**
 * LightingRig — Cold, precise lighting for AI-core containment.
 * White/blue-white only. Scene stays dark until light catches an edge.
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerpConfig } from "./ScrollStateController";

export default function LightingRig({
  scrollProgress, hoverEnergy,
}: { scrollProgress: number; hoverEnergy: number }) {
  const keyRef = useRef<THREE.PointLight>(null);
  const rimRef = useRef<THREE.PointLight>(null);
  const specRef = useRef<THREE.PointLight>(null);
  const keyTarget = useRef(new THREE.Color("#d0dcff"));

  useFrame(({ clock }, delta) => {
    const config = lerpConfig(scrollProgress);
    const t = Math.min(delta * 2.5, 1);
    const time = clock.getElapsedTime();

    keyTarget.current.set(config.keyLightColor);
    if (keyRef.current) {
      keyRef.current.intensity = THREE.MathUtils.lerp(
        keyRef.current.intensity, config.keyLightIntensity + hoverEnergy * 0.15, t);
      keyRef.current.color.lerp(keyTarget.current, t);
    }
    if (rimRef.current) {
      rimRef.current.intensity = THREE.MathUtils.lerp(
        rimRef.current.intensity, config.rimLightIntensity, t);
    }
    if (specRef.current) {
      specRef.current.position.x = Math.sin(time * 0.4 + scrollProgress * 3) * 2.5;
      specRef.current.position.y = 1.2 + Math.cos(time * 0.3) * 0.8;
      specRef.current.intensity = 0.2 + Math.sin(time * 0.6) * 0.08 + hoverEnergy * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight ref={keyRef} position={[3, 2, 4]} intensity={0.8} color="#d0dcff" />
      <pointLight ref={rimRef} position={[-3, -1, 2]} intensity={0.25} color="#e8f0ff" />
      <pointLight ref={specRef} position={[2, 1, 2]} intensity={0.2} color="#c0d8ff" />
    </>
  );
}
