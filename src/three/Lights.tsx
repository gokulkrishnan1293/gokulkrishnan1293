import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { useWorkshop } from "@/state/store";
import { L, reveal, range, smooth, SCENES } from "@/experience/timeline";

// RectAreaLight needs its LTC lookup tables initialized once
RectAreaLightUniformsLib.init();

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

/**
 * A fluorescent-style tube mounted above a wall piece: a long thin
 * RectAreaLight does the even linear wash, and an emissive cylinder
 * makes the tube itself visibly glow as it fades up.
 */
function TubeLight({
  lightRef,
  glowRef,
  position,
  targetPos,
  length,
  emitWidth,
  color,
}: {
  lightRef: RefObject<THREE.RectAreaLight | null>;
  glowRef: RefObject<THREE.MeshStandardMaterial | null>;
  position: [number, number, number];
  targetPos: [number, number, number];
  length: number;
  /** emitting panel width — narrower than the visible tube to limit spill onto side walls */
  emitWidth?: number;
  color: string;
}) {
  const wallZ = targetPos[2];
  return (
    <group>
      <rectAreaLight
        ref={lightRef}
        position={position}
        args={[color, 0, emitWidth ?? length, 0.08]}
        onUpdate={(l) => l.lookAt(...targetPos)}
      />
      {/* the glowing tube */}
      <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, length, 16]} />
        <meshStandardMaterial ref={glowRef} color="#3a3d44" emissive={color} emissiveIntensity={0} toneMapped={false} />
      </mesh>
      {/* slim housing above the tube */}
      <mesh position={[position[0], position[1] + 0.035, position[2] - 0.01]}>
        <boxGeometry args={[length + 0.06, 0.04, 0.06]} />
        <meshStandardMaterial color="#23262c" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* wall-mount brackets at each end */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[position[0] + side * (length / 2 - 0.05), position[1] + 0.035, (position[2] + wallZ) / 2]}
        >
          <boxGeometry args={[0.03, 0.025, Math.abs(position[2] - wallZ)]} />
          <meshStandardMaterial color="#23262c" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function Lights() {
  const screenGlow = useRef<THREE.PointLight>(null);
  const porch = useRef<THREE.PointLight>(null);
  const deskSpot = useRef<THREE.SpotLight>(null);
  const boardTube = useRef<THREE.RectAreaLight>(null);
  const frameTube = useRef<THREE.RectAreaLight>(null);
  const boardGlow = useRef<THREE.MeshStandardMaterial>(null);
  const frameGlow = useRef<THREE.MeshStandardMaterial>(null);
  const roomLight = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const { progress: p, mode, phase } = useWorkshop.getState();
    // before the visitor is inside, the room stays dark whatever the mode
    const ov = mode === "overview" && phase === "ready";
    const full = ov ? 1 : smooth(range(p, SCENES.finale.start, 0.95));
    const lit = (s: Parameters<typeof reveal>[0]) => reveal(s, p, ov);

    // three.js physical lighting: point/spot intensity ≈ candela — needs big numbers
    // the screen is already on while the door is ajar — it's what pulls you in
    if (screenGlow.current)
      screenGlow.current.intensity = phase === "loading" ? 0 : phase === "ready" ? 2.8 : 4.5;
    // a whisper of cool light outside so the doorway silhouette reads
    if (porch.current) porch.current.intensity = phase === "ready" ? 0 : 0.5;
    if (deskSpot.current) deskSpot.current.intensity = lit("desk") * 26 + full * 14;
    // RectAreaLight intensity is luminance (nits) — small emitter area needs big numbers
    const board = lit("whiteboard");
    const frame = lit("frame");
    if (boardTube.current) boardTube.current.intensity = board * 110;
    if (frameTube.current) frameTube.current.intensity = frame * 40;
    if (boardGlow.current) boardGlow.current.emissiveIntensity = board * 2.4;
    if (frameGlow.current) frameGlow.current.emissiveIntensity = frame * 2.4;
    // before entry only the screen glows; the room base light waits inside
    const base = phase === "ready" ? 1 : 0.4;
    if (roomLight.current) roomLight.current.intensity = 0.25 * base + full * 0.9;
    if (ambient.current) ambient.current.intensity = 0.16 * base + full * 0.5;
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
        distance={6}
        decay={2}
      />

      {/* dim corridor light behind the visitor during the door scene */}
      <pointLight ref={porch} position={[0.8, 2.3, 4.9]} color="#8b95b8" intensity={0} distance={3.5} decay={2} />

      <Spot lightRef={deskSpot} position={[0, 2.6, 0.6]} angle={0.75} color="#fff1d8" targetPos={[0, L.deskTop, 0]} />
      {/* fluorescent tubes mounted above the wall pieces */}
      <TubeLight
        lightRef={boardTube}
        glowRef={boardGlow}
        position={[L.whiteboard.x, L.whiteboard.y + L.whiteboardSize.h / 2 + 0.14, L.whiteboard.z + 0.16]}
        targetPos={[L.whiteboard.x, L.whiteboard.y, L.whiteboard.z]}
        length={L.whiteboardSize.w * 0.92}
        emitWidth={L.whiteboardSize.w * 0.65}
        color="#f4ecff"
      />
      <TubeLight
        lightRef={frameTube}
        glowRef={frameGlow}
        position={[L.frame.x, L.frame.y + L.frameSize.h / 2 + 0.12, L.frame.z + 0.14]}
        targetPos={[L.frame.x, L.frame.y, L.frame.z]}
        length={L.frameSize.w * 0.9}
        emitWidth={L.frameSize.w * 0.55}
        color="#ffe9c8"
      />
      <directionalLight ref={roomLight} position={[1.5, 3, 2.5]} intensity={0} color="#fff6e8" />
    </>
  );
}
