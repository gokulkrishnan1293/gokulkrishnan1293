import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { useNormalizedModel } from "./useNormalizedModel";
import { useArc } from "../state/store";

/**
 * Elevator interior. The cab is normalized to ~radius 2.2; the camera sits
 * inside at eye height with a gentle idle sway and mouse parallax. The GLB's
 * bundled animation (doors) plays once on arrival.
 *
 * During floor travel the cab itself stays still — motion is communicated by
 * the HUD (counter, streak overlay) and a subtle vertical camera tremor,
 * which is how real elevators feel: you read the display, not the walls.
 */
export function ElevatorScene() {
  const { group, size, animations, inner } = useNormalizedModel("/models/elevator.glb", 2.2, 1.2);
  const { actions } = useAnimations(animations, inner);
  const traveling = useArc((s) => s.traveling);
  const phase = useArc((s) => s.phase);
  const reducedMotion = useArc((s) => s.reducedMotion);
  const camera = useThree((s) => s.camera);
  const mouse = useRef({ x: 0, y: 0 });

  // door animation: play once, slow, hold the final frame
  useEffect(() => {
    const name = Object.keys(actions)[0];
    const action = name ? actions[name] : null;
    if (action) {
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.timeScale = 0.55;
      action.play();
    }
    return () => {
      action?.stop();
    };
  }, [actions]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const eye = useMemo(() => {
    // dev override: ?elevcam=x,y,z&elevlook=x,y,z for camera scouting
    const params = new URLSearchParams(window.location.search);
    const parse = (s: string | null) => {
      const p = s?.split(",").map(Number);
      return p && p.length === 3 && p.every((n) => !isNaN(n)) ? new THREE.Vector3(p[0], p[1], p[2]) : null;
    };
    const camOverride = parse(params.get("elevcam"));
    const lookOverride = parse(params.get("elevlook"));
    if (camOverride) return { pos: camOverride, look: lookOverride ?? new THREE.Vector3(0, size.y * 0.5, 0) };

    // camera-scouted interior framing: back corner of the cab, gazing across
    // toward the doors (positions are in normalized cab space)
    return {
      pos: new THREE.Vector3(-0.5, 1.32, -0.5),
      look: new THREE.Vector3(1.8, 1.02, 1.8),
    };
  }, [size]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const damp = 1 - Math.exp(-3 * dt);
    const sway = reducedMotion ? 0 : 1;
    const tremor = traveling && !reducedMotion ? Math.sin(t * 30) * 0.006 + Math.sin(t * 7.3) * 0.004 : 0;

    const target = eye.pos.clone();
    target.y += Math.sin(t * 0.8) * 0.015 * sway + tremor;
    target.x += mouse.current.x * 0.09 * sway;

    camera.position.lerp(target, damp);
    const look = eye.look.clone();
    look.y -= mouse.current.y * 0.35 * sway;
    look.x += mouse.current.x * 0.4 * sway;
    camera.lookAt(look);
  });

  const cabLight = traveling ? 2.2 : 3.2;

  return (
    <group>
      <color attach="background" args={["#04060b"]} />
      <ambientLight intensity={0.85} color="#aebcdc" />
      <pointLight position={[0, size.y * 0.92, 0]} intensity={cabLight} distance={12} decay={1.4} color="#e8eeff" />
      <pointLight position={[1.2, 1.4, 1.2]} intensity={1.2} distance={8} decay={1.6} color="#dfe8ff" />
      <pointLight position={[-0.8, 1.2, -0.8]} intensity={0.7} distance={6} color="#6fd3ff" />
      {/* warm strip near the floor — premium cab feel, also lifts textures */}
      <pointLight position={[0, 0.25, 0]} intensity={0.6} distance={5} color="#ffb86f" />
      <primitive object={group} />
      {phase === "floor" && (
        <mesh position={[0, size.y * 0.5, 0]}>
          {/* faint cool volume while a chapter is open, so the cab reads "dimmed" */}
          <sphereGeometry args={[3.4, 16, 16]} />
          <meshBasicMaterial color="#05070d" transparent opacity={0.35} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
