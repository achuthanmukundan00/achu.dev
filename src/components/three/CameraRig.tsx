/**
 * CameraRig — Scroll-driven camera with mouse parallax.
 * Uses useFrame to smoothly interpolate toward target based on scroll progress.
 */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { lerpConfig } from "./ScrollStateController";

interface CameraRigProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

export default function CameraRig({ scrollProgress, reducedMotion }: CameraRigProps) {
  const { camera, pointer } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0.15, 6.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const config = lerpConfig(scrollProgress);
    const t = Math.min(delta * 3, 1); // smooth interpolation speed

    // Target position from state config
    targetPos.current.set(config.camera.x, config.camera.y, config.camera.z);

    // Mouse parallax offset
    const parallaxStrength = reducedMotion ? 0 : 0.3;
    const px = pointer.x * parallaxStrength;
    const py = -pointer.y * parallaxStrength * 0.5;

    // Lerp camera toward target
    camera.position.lerp(
      new THREE.Vector3(
        targetPos.current.x + px,
        targetPos.current.y + py,
        targetPos.current.z,
      ),
      t,
    );

    // Look-at target
    targetLookAt.current.set(config.lookAt.x, config.lookAt.y, config.lookAt.z);
    currentLookAt.current.lerp(targetLookAt.current, t);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
