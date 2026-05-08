import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type CoreState = "default" | "relay" | "synax" | "wytos" | "watchyourtemper";

const stateColors: Record<
  CoreState,
  { primary: string; accent: string; secondary: string; haze: string }
> = {
  default: {
    primary: "#f5f8ff",
    accent: "#77e7ff",
    secondary: "#284255",
    haze: "#03070c",
  },
  relay: {
    primary: "#e8f7ff",
    accent: "#55d6ff",
    secondary: "#173d50",
    haze: "#031019",
  },
  synax: {
    primary: "#f4fbff",
    accent: "#7fffd1",
    secondary: "#174c45",
    haze: "#031311",
  },
  wytos: {
    primary: "#f2f6ff",
    accent: "#a9c6ff",
    secondary: "#2a3555",
    haze: "#050914",
  },
  watchyourtemper: {
    primary: "#f2ffe9",
    accent: "#9cff4f",
    secondary: "#244a1f",
    haze: "#061006",
  },
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

function RailSegment({
  angle,
  radius,
  length,
  color,
  opacity,
  depth = 0,
}: {
  angle: number;
  radius: number;
  length: number;
  color: string;
  opacity: number;
  depth?: number;
}) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <mesh position={[x, y, depth]} rotation={[0, 0, angle + Math.PI / 2]}>
      <boxGeometry args={[length, 0.028, 0.035]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function RoutePath({
  points,
  color,
  opacity,
}: {
  points: THREE.Vector3[];
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    [color, opacity],
  );
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  return <primitive object={line} />;
}

function ScanBars({ color }: { color: string }) {
  return (
    <group position={[0, 0, 0.14]}>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={index} position={[0, (index - 4) * 0.18, 0]}>
          <boxGeometry args={[2.8 - Math.abs(index - 4) * 0.18, 0.008, 0.01]} />
          <meshBasicMaterial color={color} transparent opacity={0.1 + (index % 3) * 0.045} />
        </mesh>
      ))}
    </group>
  );
}

function AchuScene({ state }: { state: CoreState }) {
  const machineRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const railARef = useRef<THREE.Group>(null);
  const railBRef = useRef<THREE.Group>(null);
  const packetRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Group>(null);
  const reducedMotion = usePrefersReducedMotion();
  const colors = stateColors[state];

  const energy = state === "watchyourtemper" ? 1.35 : state === "relay" ? 1.18 : state === "synax" ? 1.08 : 0.92;

  const paths = useMemo(() => {
    const routeCount = state === "relay" ? 7 : state === "wytos" ? 8 : 6;
    return Array.from({ length: routeCount }, (_, index) => {
      const a = (index / routeCount) * Math.PI * 2 + Math.PI / 10;
      const inner = new THREE.Vector3(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.08);
      const bend = new THREE.Vector3(Math.cos(a) * 1.18, Math.sin(a) * 1.18, 0.03);
      const outer = new THREE.Vector3(Math.cos(a) * 2.02, Math.sin(a) * 2.02, -0.03);
      return [inner, bend, outer];
    });
  }, [state]);

  const packets = useMemo(() => {
    const count = state === "wytos" ? 18 : 14;
    return Array.from({ length: count }, (_, index) => ({
      angle: (index / count) * Math.PI * 2,
      radius: 1.18 + (index % 3) * 0.33,
      size: index % 4 === 0 ? 0.038 : 0.024,
      speed: 0.16 + (index % 5) * 0.025,
    }));
  }, [state]);

  useFrame(({ clock, pointer }, delta) => {
    if (reducedMotion) return;

    const elapsed = clock.getElapsedTime();

    if (machineRef.current) {
      machineRef.current.rotation.x = THREE.MathUtils.lerp(machineRef.current.rotation.x, pointer.y * 0.11, 0.04);
      machineRef.current.rotation.y = THREE.MathUtils.lerp(machineRef.current.rotation.y, pointer.x * 0.18, 0.04);
    }

    if (coreRef.current) {
      const pulse = 1 + Math.sin(elapsed * 1.7 * energy) * 0.025;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.z += delta * 0.12 * energy;
      coreRef.current.rotation.y -= delta * 0.22;
    }

    if (railARef.current) railARef.current.rotation.z -= delta * 0.09 * energy;
    if (railBRef.current) railBRef.current.rotation.z += delta * 0.07 * energy;

    if (scanRef.current) {
      scanRef.current.position.y = ((elapsed * 0.32) % 1.8) - 0.9;
    }

    if (packetRef.current) {
      packetRef.current.children.forEach((child, index) => {
        const packet = packets[index];
        if (!packet) return;
        const angle = packet.angle + elapsed * packet.speed * energy;
        child.position.set(
          Math.cos(angle) * packet.radius,
          Math.sin(angle) * packet.radius,
          0.16 + Math.sin(elapsed * 1.9 + index) * 0.025,
        );
        const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        material.opacity = 0.32 + Math.abs(Math.sin(elapsed * 2.5 + index)) * 0.48;
      });
    }
  });

  return (
    <>
      <color attach="background" args={["#020407"]} />
      <fog attach="fog" args={[colors.haze, 5.5, 9]} />
      <ambientLight intensity={0.22} />
      <pointLight position={[2.4, 2.1, 3]} intensity={1.6} color={colors.accent} />
      <pointLight position={[-2.4, -2, 2]} intensity={0.45} color="#ffffff" />

      <group ref={machineRef}>
        <group position={[0, 0, -0.18]}>
          {Array.from({ length: 18 }, (_, index) => (
            <RailSegment
              key={`outer-${index}`}
              angle={(index / 18) * Math.PI * 2}
              radius={2.12}
              length={index % 3 === 0 ? 0.38 : 0.24}
              color={index % 4 === 0 ? colors.primary : colors.accent}
              opacity={index % 4 === 0 ? 0.5 : 0.28}
              depth={-0.06}
            />
          ))}
        </group>

        <group ref={railARef}>
          {Array.from({ length: 12 }, (_, index) => (
            <RailSegment
              key={`mid-${index}`}
              angle={(index / 12) * Math.PI * 2 + Math.PI / 12}
              radius={1.54}
              length={0.34}
              color={colors.accent}
              opacity={0.36}
              depth={0.03}
            />
          ))}
        </group>

        <group ref={railBRef} rotation={[0, 0, Math.PI / 8]}>
          {Array.from({ length: 8 }, (_, index) => (
            <RailSegment
              key={`inner-${index}`}
              angle={(index / 8) * Math.PI * 2}
              radius={1.02}
              length={0.3}
              color={colors.primary}
              opacity={0.46}
              depth={0.08}
            />
          ))}
        </group>

        {paths.map((points, index) => (
          <RoutePath
            key={`${state}-${index}`}
            points={points}
            color={index % 2 === 0 ? colors.accent : colors.primary}
            opacity={state === "relay" ? 0.44 : 0.24}
          />
        ))}

        <group ref={packetRef}>
          {packets.map((packet, index) => (
            <mesh key={index}>
              <boxGeometry args={[packet.size, packet.size, packet.size]} />
              <meshBasicMaterial color={index % 3 === 0 ? colors.primary : colors.accent} transparent opacity={0.55} />
            </mesh>
          ))}
        </group>

        <group ref={scanRef}>
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[3.4, 0.018, 0.018]} />
            <meshBasicMaterial color={colors.accent} transparent opacity={0.34} />
          </mesh>
        </group>

        <ScanBars color={colors.accent} />

        <group ref={coreRef}>
          <mesh rotation={[0.6, 0.35, 0.78]}>
            <octahedronGeometry args={[0.52, 1]} />
            <meshStandardMaterial
              color="#111923"
              emissive={colors.accent}
              emissiveIntensity={0.52}
              roughness={0.22}
              metalness={0.84}
              flatShading
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.05, 1.05, 0.04]} />
            <meshBasicMaterial color={colors.accent} transparent opacity={0.08} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.36, 0.36, 0.08]} />
            <meshBasicMaterial color={colors.primary} transparent opacity={0.72} />
          </mesh>
        </group>

        <group position={[0, -2.58, 0.12]}>
          {Array.from({ length: 22 }, (_, index) => (
            <mesh key={index} position={[(index - 10.5) * 0.12, 0, 0]}>
              <boxGeometry args={[0.048, 0.18 + ((index * 7) % 5) * 0.08, 0.035]} />
              <meshBasicMaterial color={colors.accent} transparent opacity={0.2 + (index % 4) * 0.08} />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

function StaticCore({ state }: { state: CoreState }) {
  const colors = stateColors[state];

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[radial-gradient(circle_at_center,#08111a_0%,#020407_68%)]">
      <svg viewBox="0 0 260 260" className="h-72 w-72" aria-hidden="true">
        <rect x="88" y="88" width="84" height="84" transform="rotate(45 130 130)" fill="none" stroke={colors.accent} strokeWidth="2" opacity="0.44" />
        <path d="M130 42 212 82 218 178 130 218 42 178 48 82Z" fill="none" stroke={colors.primary} strokeWidth="1.5" opacity="0.58" />
        <path d="M130 72 182 130 130 188 78 130Z" fill="none" stroke={colors.secondary} strokeWidth="5" opacity="0.7" />
        <rect x="111" y="111" width="38" height="38" transform="rotate(45 130 130)" fill={colors.primary} opacity="0.9" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect
            key={angle}
            x={127 + Math.cos((angle * Math.PI) / 180) * 92}
            y={127 + Math.sin((angle * Math.PI) / 180) * 92}
            width="6"
            height="6"
            transform={`rotate(45 ${130 + Math.cos((angle * Math.PI) / 180) * 92} ${130 + Math.sin((angle * Math.PI) / 180) * 92})`}
            fill={colors.accent}
            opacity="0.76"
          />
        ))}
      </svg>
    </div>
  );
}

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

interface AchuCoreProps {
  state?: CoreState;
  className?: string;
}

export default function AchuCore({ state = "default", className = "" }: AchuCoreProps) {
  const [mounted, setMounted] = useState(false);
  const fallback = <StaticCore state={state} />;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative min-h-[420px] w-full overflow-hidden ${className}`}>
      {mounted ? (
        <WebGLErrorBoundary fallback={fallback}>
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 5.4], fov: 42 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <AchuScene state={state} />
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        fallback
      )}
      <div className="sr-only" aria-live="polite">
        Achu runtime core visual state: {state}.
      </div>
    </div>
  );
}
