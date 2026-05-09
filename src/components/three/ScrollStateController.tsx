/**
 * ScrollStateController — Central config mapping scroll progress to scene states.
 *
 * Six states driving camera, lighting, post-processing, and object behavior.
 *
 * Palette (dark industrial AI-core):
 *   background: near-black / graphite / deep blue-black
 *   primary material: smoked glass, black chrome, dark carbon
 *   light: cold white / blue-white only — no green
 *   accent: #c0d8ff (blue-white glints), used sparingly
 *   warning: unstable orange #f97316, very rare
 */
import * as THREE from "three";

export type SceneState =
  | "core_boot" | "developer_systems" | "agent_trace"
  | "inhabitable_worlds" | "project_modules" | "stable_output";

export interface SceneStateConfig {
  state: SceneState;
  range: [number, number];
  camera: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
  ambientIntensity: number;
  keyLightIntensity: number;
  keyLightColor: string;
  rimLightIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  dofFocusDistance: number;
  dofBokehScale: number;
  vignetteOpacity: number;
  chromaticAberration: number;
  grainOpacity: number;
  scanlineOpacity: number;
  particleDensity: number;
  traceOpacity: number;
  fogDensity: number;
  overlayOpacity: number;
  overlayBlur: number;
}

export const SCENE_STATES: SceneStateConfig[] = [
  {
    state: "core_boot",
    range: [0, 0.18],
    camera: { x: 0, y: 0.15, z: 6.5 },
    lookAt: { x: 0, y: 0, z: 0 },
    ambientIntensity: 0.06,
    keyLightIntensity: 0.8,
    keyLightColor: "#d0dcff",
    rimLightIntensity: 0.25,
    bloomIntensity: 0.2,
    bloomThreshold: 0.82,
    dofFocusDistance: 6.5,
    dofBokehScale: 1.2,
    vignetteOpacity: 0.22,
    chromaticAberration: 0.0012,
    grainOpacity: 0.006,
    scanlineOpacity: 0.012,
    particleDensity: 0.1,
    traceOpacity: 0.02,
    fogDensity: 0.04,
    overlayOpacity: 1,
    overlayBlur: 0,
  },
  {
    state: "developer_systems",
    range: [0.18, 0.36],
    camera: { x: 0.8, y: 0.05, z: 5.5 },
    lookAt: { x: -0.2, y: 0, z: 0 },
    ambientIntensity: 0.07,
    keyLightIntensity: 0.9,
    keyLightColor: "#d0dcff",
    rimLightIntensity: 0.4,
    bloomIntensity: 0.25,
    bloomThreshold: 0.8,
    dofFocusDistance: 5.0,
    dofBokehScale: 2.0,
    vignetteOpacity: 0.18,
    chromaticAberration: 0.0025,
    grainOpacity: 0.008,
    scanlineOpacity: 0.016,
    particleDensity: 0.15,
    traceOpacity: 0.12,
    fogDensity: 0.05,
    overlayOpacity: 0.9,
    overlayBlur: 0,
  },
  {
    state: "agent_trace",
    range: [0.36, 0.54],
    camera: { x: -0.3, y: -0.1, z: 4.2 },
    lookAt: { x: 0.1, y: 0.05, z: 0 },
    ambientIntensity: 0.05,
    keyLightIntensity: 0.7,
    keyLightColor: "#b0c8ff",
    rimLightIntensity: 0.6,
    bloomIntensity: 0.3,
    bloomThreshold: 0.75,
    dofFocusDistance: 3.8,
    dofBokehScale: 2.5,
    vignetteOpacity: 0.14,
    chromaticAberration: 0.004,
    grainOpacity: 0.01,
    scanlineOpacity: 0.02,
    particleDensity: 0.2,
    traceOpacity: 0.35,
    fogDensity: 0.06,
    overlayOpacity: 0.85,
    overlayBlur: 0,
  },
  {
    state: "inhabitable_worlds",
    range: [0.54, 0.72],
    camera: { x: 0.5, y: -0.25, z: 3.2 },
    lookAt: { x: 0, y: 0.1, z: 0 },
    ambientIntensity: 0.04,
    keyLightIntensity: 0.5,
    keyLightColor: "#b0c8ff",
    rimLightIntensity: 0.8,
    bloomIntensity: 0.38,
    bloomThreshold: 0.68,
    dofFocusDistance: 2.8,
    dofBokehScale: 3.5,
    vignetteOpacity: 0.1,
    chromaticAberration: 0.007,
    grainOpacity: 0.012,
    scanlineOpacity: 0.025,
    particleDensity: 0.22,
    traceOpacity: 0.2,
    fogDensity: 0.08,
    overlayOpacity: 0.8,
    overlayBlur: 0,
  },
  {
    state: "project_modules",
    range: [0.72, 0.88],
    camera: { x: -0.2, y: 0.2, z: 5.0 },
    lookAt: { x: 0, y: 0, z: 0 },
    ambientIntensity: 0.08,
    keyLightIntensity: 0.85,
    keyLightColor: "#d0dcff",
    rimLightIntensity: 0.5,
    bloomIntensity: 0.22,
    bloomThreshold: 0.8,
    dofFocusDistance: 4.5,
    dofBokehScale: 2.0,
    vignetteOpacity: 0.2,
    chromaticAberration: 0.0018,
    grainOpacity: 0.007,
    scanlineOpacity: 0.014,
    particleDensity: 0.14,
    traceOpacity: 0.1,
    fogDensity: 0.05,
    overlayOpacity: 1,
    overlayBlur: 0,
  },
  {
    state: "stable_output",
    range: [0.88, 1.0],
    camera: { x: 0, y: 0, z: 7.0 },
    lookAt: { x: 0, y: 0, z: 0 },
    ambientIntensity: 0.1,
    keyLightIntensity: 0.6,
    keyLightColor: "#d0dcff",
    rimLightIntensity: 0.2,
    bloomIntensity: 0.12,
    bloomThreshold: 0.88,
    dofFocusDistance: 7.0,
    dofBokehScale: 1.0,
    vignetteOpacity: 0.25,
    chromaticAberration: 0.001,
    grainOpacity: 0.005,
    scanlineOpacity: 0.01,
    particleDensity: 0.05,
    traceOpacity: 0.0,
    fogDensity: 0.03,
    overlayOpacity: 1,
    overlayBlur: 0,
  },
];

export function getSceneState(progress: number): SceneState {
  for (const s of SCENE_STATES) {
    if (progress >= s.range[0] && progress < s.range[1]) return s.state;
  }
  return "stable_output";
}

export function lerpConfig(progress: number): SceneStateConfig & { blendFactor: number } {
  const clamped = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < SCENE_STATES.length; i++) {
    const s = SCENE_STATES[i]!;
    if (clamped >= s.range[0] && clamped < s.range[1]) {
      const t = (clamped - s.range[0]) / (s.range[1] - s.range[0]);
      const next = SCENE_STATES[i + 1];
      if (next && t > 0.7) {
        return { ...s, blendFactor: (t - 0.7) / 0.3 };
      }
      return { ...s, blendFactor: 0 };
    }
  }
  return { ...SCENE_STATES[SCENE_STATES.length - 1]!, blendFactor: 0 };
}

export function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
