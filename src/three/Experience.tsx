import { Suspense } from "react";
import type * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Stage } from "./Stage";
import { Lights } from "./Lights";
import { CameraRig } from "./CameraRig";
import { preloadModels } from "./useNormalizedModel";
// phone GPUs choke on dpr 2 + MSAA for a scene this size — cap resolution
// on touch devices so the frame loop keeps up with scroll
import { COARSE_POINTER } from "@/utils/device";

preloadModels([
  "/models/desk.glb",
  "/models/monitor.glb",
  "/models/speaker.glb",
  "/models/keyboard.glb",
  "/models/mouse.glb",
  "/models/chair.glb",
  "/models/whiteboard.glb",
  "/models/frame.glb",
  "/models/usb.glb",
  "/models/couple.glb",
]);

export function Experience() {
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={COARSE_POINTER ? [1, 1.5] : [1, 2]}
      camera={{ position: [0.42, 1.22, 4.55], fov: 46, near: 0.05, far: 30 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ scene }) => {
        if (import.meta.env.DEV) (window as unknown as { __scene: THREE.Scene }).__scene = scene;
      }}
    >
      <color attach="background" args={["#0a0a0c"]} />
      <fog attach="fog" args={["#0a0a0c", 4.5, 9]} />
      <Suspense fallback={null}>
        <Stage />
        <Preload all />
      </Suspense>
      <Lights />
      <CameraRig />
    </Canvas>
  );
}
