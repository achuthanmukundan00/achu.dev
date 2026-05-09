/**
 * PostProcessingRig — Optical instrument pipeline.
 * Restrained bloom, chromatic aberration, film grain, scanline, vignette.
 * All subtle — like looking through an expensive lens.
 */
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, Scanline } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { lerpConfig } from "./ScrollStateController";

export default function PostProcessingRig({
  scrollProgress, lowPower = false,
}: { scrollProgress: number; lowPower?: boolean }) {
  const bloomRef = useRef<any>(null);
  const vignetteRef = useRef<any>(null);
  const caRef = useRef<any>(null);
  const grainRef = useRef<any>(null);
  const scanRef = useRef<any>(null);

  if (lowPower) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.88} luminanceSmoothing={0.95} intensity={0.1} mipmapBlur={false} />
        <Vignette offset={0.5} darkness={0.5} blendFunction={BlendFunction.NORMAL} opacity={0.15} />
      </EffectComposer>
    );
  }

  useFrame((_, delta) => {
    const config = lerpConfig(scrollProgress);
    const t = Math.min(delta * 2, 1);
    if (bloomRef.current) bloomRef.current.intensity = THREE.MathUtils.lerp(bloomRef.current.intensity, config.bloomIntensity, t);
    if (vignetteRef.current) vignetteRef.current.opacity = THREE.MathUtils.lerp(vignetteRef.current.opacity, config.vignetteOpacity, t);
    if (caRef.current) caRef.current.offset.x = THREE.MathUtils.lerp(caRef.current.offset.x, config.chromaticAberration, t);
    if (grainRef.current) grainRef.current.opacity = THREE.MathUtils.lerp(grainRef.current.opacity, config.grainOpacity, t);
    if (scanRef.current) scanRef.current.opacity = THREE.MathUtils.lerp(scanRef.current.opacity, config.scanlineOpacity, t);
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloomRef} luminanceThreshold={0.8} luminanceSmoothing={0.92}
        intensity={0.2} mipmapBlur={false} radius={0.4} />
      <ChromaticAberration ref={caRef} blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0012, 0.0012)} radialModulation={true}
        modulationOffset={0.15} opacity={0.35} />
      <Noise ref={grainRef} premultiply blendFunction={BlendFunction.COLOR_DODGE} opacity={0.006} />
      <Scanline ref={scanRef} blendFunction={BlendFunction.OVERLAY} density={2048} opacity={0.012} />
      <Vignette ref={vignetteRef} offset={0.35} darkness={0.55}
        blendFunction={BlendFunction.NORMAL} opacity={0.2} />
    </EffectComposer>
  );
}
