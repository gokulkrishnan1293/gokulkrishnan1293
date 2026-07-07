import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useWorkshop } from "@/state/store";
import { L, reveal, range, smooth, SCENES } from "@/experience/timeline";

/**
 * Light follows story. Each section's lamp fades up with its
 * materialization; the finale converges them all (the full switch).
 */

function Spot({
  lightRef,
  position,
  targetPos,
  angle,
  color,
}: {
  lightRef: RefObject<THREE.SpotLight | null>;
  position: [number, number, number];
  targetPos: [number, number, number];
  angle: number;
  color: string;
}) {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <spotLight
        ref={lightRef}
        position={position}
        angle={angle}
        penumbra={0.7}
        color={color}
        intensity={0}
        target={target}
      />
      <primitive object={target} position={targetPos} />
    </>
  );
}

export function Lights() {
  const screenGlow = useRef<THREE.PointLight>(null);
  const deskSpot = useRef<THREE.SpotLight>(null);
  const boardSpot = useRef<THREE.SpotLight>(null);
  const frameSpot = useRef<THREE.SpotLight>(null);
  const roomLight = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const { progress: p, mode, phase } = useWorkshop.getState();
    const ov = mode === "overview";
    const full = ov ? 1 : smooth(range(p, SCENES.finale.start, 0.95));
    const lit = (s: Parameters<typeof reveal>[0]) => reveal(s, p, ov);

    // three.js physical lighting: point/spot intensity ≈ candela — needs big numbers
    if (screenGlow.current)
      screenGlow.current.intensity = phase === "ready" || ov ? 2.8 : 0;
    if (deskSpot.current) deskSpot.current.intensity = lit("desk") * 26 + full * 14;
    if (boardSpot.current) boardSpot.current.intensity = lit("whiteboard") * 30;
    if (frameSpot.current) frameSpot.current.intensity = lit("frame") * 26;
    if (roomLight.current) roomLight.current.intensity = 0.25 + full * 0.9;
    if (ambient.current) ambient.current.intensity = 0.16 + full * 0.5;
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.07} color="#cdd3e0" />

      {/* the monitor's screen-glow — the first light in the room */}
      <pointLight
        ref={screenGlow}
        position={[L.screenCenter.x, L.screenCenter.y, L.screenCenter.z + 0.25]}
        color="#ffe6c0"
        intensity={0}
        distance={3.2}
        decay={2}
      />

      <Spot lightRef={deskSpot} position={[0, 2.6, 0.6]} angle={0.75} color="#fff1d8" targetPos={[0, L.deskTop, 0]} />
      <Spot
        lightRef={boardSpot}
        position={[-1.05, 2.5, 0.4]}
        angle={0.6}
        color="#f4ecff"
        targetPos={[L.whiteboard.x, L.whiteboard.y, L.whiteboard.z]}
      />
      <Spot
        lightRef={frameSpot}
        position={[1.1, 2.6, 0.3]}
        angle={0.5}
        color="#ffe9c8"
        targetPos={[L.frame.x, L.frame.y, L.frame.z]}
      />
      <directionalLight ref={roomLight} position={[1.5, 3, 2.5]} intensity={0} color="#fff6e8" />
    </>
  );
}
