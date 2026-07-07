import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useWorkshop } from "@/state/store";
import { clamp01, smooth } from "@/experience/timeline";

/**
 * Scene 0 — the way in. A front wall with a door left ajar; the monitor's
 * glow leaks through the gap. The begin-click swings it open and the
 * camera walks through (see CameraRig's intro branch).
 */

export const DOOR = {
  z: 3.45,
  w: 0.92,
  h: 2.1,
  wallW: 5.2,
  wallH: 3.4,
  /** how far the door hangs open before the visitor arrives (~half open) */
  ajar: 0.45,
  openMs: 1200,
};

export function Door() {
  const hinge = useRef<THREE.Group>(null);

  useFrame(() => {
    const { phase, enteredAt } = useWorkshop.getState();
    let open = DOOR.ajar;
    if (phase === "entering" || phase === "ready") {
      const k = enteredAt ? clamp01((performance.now() - enteredAt) / DOOR.openMs) : 1;
      open = DOOR.ajar + (1 - DOOR.ajar) * smooth(k);
    }
    // swings inward, coming to rest along the inside of the front wall
    if (hinge.current) hinge.current.rotation.y = open * 1.92;
  });

  const sideW = (DOOR.wallW - DOOR.w) / 2;
  const headH = DOOR.wallH - DOOR.h;
  return (
    <group>
      {/* front wall around the doorway — dusty blue like the back wall */}
      <mesh position={[-(DOOR.w / 2 + sideW / 2), DOOR.wallH / 2, DOOR.z]}>
        <planeGeometry args={[sideW, DOOR.wallH]} />
        <meshStandardMaterial color="#5c6f9e" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[DOOR.w / 2 + sideW / 2, DOOR.wallH / 2, DOOR.z]}>
        <planeGeometry args={[sideW, DOOR.wallH]} />
        <meshStandardMaterial color="#5c6f9e" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, DOOR.h + headH / 2, DOOR.z]}>
        <planeGeometry args={[DOOR.w, headH]} />
        <meshStandardMaterial color="#5c6f9e" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* door frame */}
      <mesh position={[-DOOR.w / 2 - 0.03, DOOR.h / 2, DOOR.z]}>
        <boxGeometry args={[0.07, DOOR.h + 0.12, 0.12]} />
        <meshStandardMaterial color="#3a2f26" roughness={0.8} />
      </mesh>
      <mesh position={[DOOR.w / 2 + 0.03, DOOR.h / 2, DOOR.z]}>
        <boxGeometry args={[0.07, DOOR.h + 0.12, 0.12]} />
        <meshStandardMaterial color="#3a2f26" roughness={0.8} />
      </mesh>
      <mesh position={[0, DOOR.h + 0.035, DOOR.z]}>
        <boxGeometry args={[DOOR.w + 0.13, 0.07, 0.12]} />
        <meshStandardMaterial color="#3a2f26" roughness={0.8} />
      </mesh>

      {/* the door itself, hinged on the left */}
      <group ref={hinge} position={[-DOOR.w / 2, 0, DOOR.z]}>
        <mesh position={[DOOR.w / 2, DOOR.h / 2, 0]}>
          <boxGeometry args={[DOOR.w, DOOR.h, 0.045]} />
          <meshStandardMaterial color="#5a4634" roughness={0.7} />
        </mesh>
        {/* handle on the opening edge, both faces */}
        <mesh position={[DOOR.w - 0.08, 1.02, 0.05]}>
          <sphereGeometry args={[0.028, 16, 12]} />
          <meshStandardMaterial color="#c9b37e" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[DOOR.w - 0.08, 1.02, -0.05]}>
          <sphereGeometry args={[0.028, 16, 12]} />
          <meshStandardMaterial color="#c9b37e" metalness={0.8} roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}
