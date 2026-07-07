import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useWorkshop } from "@/state/store";
import { reveal, type Section } from "@/experience/timeline";

/**
 * A stage prop that fades in when its section's moment arrives.
 *
 * StrictMode-safe: the memo never reparents the model and the frame loop
 * reads materials live off the meshes (memo may run more than once).
 */

function prepare(model: THREE.Group): THREE.Mesh[] {
  const fillMeshes: THREE.Mesh[] = [];
  model.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const clones = mats.map((m) => {
      const c = m.clone();
      c.transparent = true;
      c.opacity = 0;
      return c;
    });
    mesh.material = Array.isArray(mesh.material) ? clones : clones[0];
    fillMeshes.push(mesh);
  });
  return fillMeshes;
}

export function Sketchable({
  model,
  section,
  position,
  rotation,
  onClick,
  onPointerDown,
  onPointerOver,
  onPointerOut,
}: {
  model: THREE.Group;
  section: Section;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}) {
  const fillMeshes = useMemo(() => prepare(model), [model]);
  const visRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const { progress, mode } = useWorkshop.getState();
    const r = reveal(section, progress, mode === "overview");

    if (visRef.current) visRef.current.visible = r > 0.005;

    for (const mesh of fillMeshes) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        m.opacity = r;
        // solid once fully in — avoids transparent-sorting artifacts
        m.transparent = r < 0.999;
        m.depthWrite = r > 0.05;
      }
    }
  });

  return (
    <group
      ref={visRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerOver={
        onPointerOver &&
        ((e) => {
          e.stopPropagation();
          onPointerOver();
        })
      }
      onPointerOut={onPointerOut && (() => onPointerOut())}
    >
      <primitive object={model} />
    </group>
  );
}
