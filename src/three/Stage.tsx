import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useWorkshop } from "@/state/store";
import { L, reveal, type Section } from "@/experience/timeline";
import { useNormalizedModel } from "./useNormalizedModel";
import { Sketchable } from "./Sketchable";
import { MonitorScreen } from "./MonitorScreen";
import { WhiteboardSurface } from "./WhiteboardSurface";
import { MemoryCards } from "./MemoryCards";
import { SpeakerLeds } from "./SpeakerLeds";

const v = (vec: THREE.Vector3): [number, number, number] => [vec.x, vec.y, vec.z];

/** fades a plain material in sync with its section's materialization */
function useRevealOpacity(section: Section, max = 1) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (!ref.current) return;
    const { progress, mode } = useWorkshop.getState();
    const r = reveal(section, progress, mode === "overview");
    ref.current.opacity = r * max;
  });
  return ref;
}

function Desk() {
  const model = useNormalizedModel("/models/desk.glb", L.deskTop, { axis: "y", rotateY: Math.PI / 2 });
  return <Sketchable model={model} section="desk" position={[0, 0, -0.12]} />;
}

function Monitor() {
  const model = useNormalizedModel("/models/monitor.glb", 0.52, { axis: "y", rotateY: -Math.PI / 2 });
  return <Sketchable model={model} section="monitor" position={v(L.monitor)} />;
}

function Speaker({ side }: { side: "L" | "R" }) {
  const model = useNormalizedModel("/models/speaker.glb", 0.3, { axis: "y" });
  const pos = side === "L" ? L.speakerL : L.speakerR;
  const toggleAudio = useWorkshop((s) => s.toggleAudio);
  return (
    <Sketchable
      model={model}
      section="speakers"
      position={v(pos)}
      onClick={(e) => {
        e.stopPropagation();
        toggleAudio();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    />
  );
}

function Keyboard() {
  const model = useNormalizedModel("/models/keyboard.glb", 0.36, { axis: "max" });
  return <Sketchable model={model} section="peripherals" position={v(L.keyboard)} />;
}

function Mouse() {
  const model = useNormalizedModel("/models/mouse.glb", 0.12, { axis: "max" });
  return <Sketchable model={model} section="peripherals" position={v(L.mouse)} />;
}

function Couple() {
  // faces the camera (+z)
  const model = useNormalizedModel("/models/couple.glb", 0.13, { axis: "y", rotateY: -Math.PI / 2 });
  return <Sketchable model={model} section="peripherals" position={v(L.couple)} />;
}

function Chair() {
  const model = useNormalizedModel("/models/chair.glb", 1.05, { axis: "y", rotateY: Math.PI });
  const isOverview = useWorkshop((s) => s.mode === "overview");
  return (
    <Sketchable
      model={model}
      section="chair"
      position={v(L.chair)}
      onClick={(e) => {
        e.stopPropagation();
        const s = useWorkshop.getState();
        if (s.mode === "overview") s.sit(true);
      }}
      onPointerOver={isOverview ? () => (document.body.style.cursor = "pointer") : undefined}
      onPointerOut={isOverview ? () => (document.body.style.cursor = "") : undefined}
    />
  );
}

function Whiteboard() {
  // big board on the back wall, facing the camera
  const model = useNormalizedModel("/models/whiteboard.glb", 1.7, {
    axis: "max",
    rotateY: -Math.PI / 2,
    align: "center",
  });
  return (
    <group>
      <Sketchable model={model} section="whiteboard" position={v(L.whiteboard)} rotation={[0, 0, 0]} />
      <WhiteboardSurface />
    </group>
  );
}

function PanoramaFrame() {
  // small framed print on the back wall, right of the monitor
  const model = useNormalizedModel("/models/frame.glb", 1.0, {
    axis: "max",
    rotateY: 0,
    align: "center",
  });
  const texture = useTexture("/img/mountain-range.png");
  const openOverlay = useWorkshop((s) => s.openOverlay);
  const isOverview = useWorkshop((s) => s.mode === "overview");
  return (
    <group>
      <Sketchable
        model={model}
        section="frame"
        position={v(L.frame)}
        onClick={
          isOverview
            ? (e) => {
                e.stopPropagation();
                openOverlay({ kind: "philosophy", id: "journey" });
              }
            : undefined
        }
        onPointerOver={isOverview ? () => (document.body.style.cursor = "pointer") : undefined}
        onPointerOut={isOverview ? () => (document.body.style.cursor = "") : undefined}
      />
      {/* the panorama art, mapped just in front of the frame plane */}
      <PanoramaArt texture={texture} />
    </group>
  );
}

function PanoramaArt({ texture }: { texture: THREE.Texture }) {
  const mat = useRevealOpacity("frame");
  return (
    <mesh position={[L.frame.x, L.frame.y, L.frame.z + 0.03]}>
      <planeGeometry args={[L.frameSize.w * 0.92, L.frameSize.h * 0.82]} />
      <meshStandardMaterial ref={mat} map={texture} toneMapped={false} transparent opacity={0} />
    </mesh>
  );
}

function DeskMat() {
  const texture = useTexture("/img/desk-mat.png");
  const mat = useRevealOpacity("desk", 0.9);
  return (
    <mesh position={v(L.deskMat)} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.95, 0.42]} />
      <meshStandardMaterial ref={mat} map={texture} transparent opacity={0} />
    </mesh>
  );
}

function Backdrop() {
  return (
    <>
      {/* back wall — dusty blue */}
      <mesh position={[0, 1.6, L.backWallZ - 0.06]}>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial color="#5c6f9e" roughness={0.95} />
      </mesh>
      {/* left wall — terracotta · right wall — teal */}
      <mesh position={[L.leftWallX - 0.08, 1.6, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#b87455" roughness={0.95} />
      </mesh>
      <mesh position={[L.rightWallX + 0.02, 1.6, 0.6]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#5d968b" roughness={0.95} />
      </mesh>
      {/* floor — warm wood */}
      <mesh position={[0, -0.001, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#5a4634" roughness={0.9} />
      </mesh>
      {/* rug under the chair */}
      <mesh position={[0.05, 0.002, 0.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 48]} />
        <meshStandardMaterial color="#7a4a3a" roughness={1} />
      </mesh>
    </>
  );
}

export function Stage() {
  return (
    <group>
      <Backdrop />
      <Desk />
      <DeskMat />
      <Monitor />
      <MonitorScreen />
      <Speaker side="L" />
      <Speaker side="R" />
      <SpeakerLeds />
      <Keyboard />
      <Mouse />
      <Couple />
      <Chair />
      <Whiteboard />
      <PanoramaFrame />
      <MemoryCards />
    </group>
  );
}
