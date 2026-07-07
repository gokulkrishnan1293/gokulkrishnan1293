import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useWorkspace } from "@/state/store";
import { L } from "@/experience/timeline";
import { projects, type Project } from "@/content";
import { useNormalizedModel } from "./useNormalizedModel";
import { Sketchable } from "./Sketchable";

/**
 * Projects = memory cards scattered on the desk. One card per content file;
 * add a project in git → a new card appears. Scatter is seeded → identical
 * every visit, grows with the list.
 */

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 19) % 2147483647;
    return (s % 10000) / 10000;
  };
}

function useScatter(count: number) {
  return useMemo(() => {
    const rand = seededRand(1293);
    return Array.from({ length: count }, (_, i) => {
      // alternate sides: even → right of the mouse, odd → left of the keyboard
      const base = i % 2 === 0 ? L.cardsR : L.cardsL;
      const row = Math.floor(i / 2);
      return {
        x: base.x + (rand() - 0.5) * 0.05,
        z: base.z + row * 0.12 + (rand() - 0.5) * 0.04,
        rot: (rand() - 0.5) * 1.6,
      };
    });
  }, [count]);
}

function Card({
  project,
  slot,
}: {
  project: Project;
  slot: { x: number; z: number; rot: number };
}) {
  // every project is a pendrive — one shape, easy to spot on the desk
  const model = useNormalizedModel("/models/usb.glb", 0.1, { rotateY: slot.rot });
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const { activeProjectId } = useWorkspace.getState();
    const active = activeProjectId === project.id;
    const targetY = active ? L.deskTop + 0.035 + Math.sin(state.clock.elapsedTime * 2) * 0.006 : L.deskTop;
    group.current.position.y += (targetY - group.current.position.y) * 0.12;
  });

  return (
    <group ref={group} position={[slot.x, L.deskTop, slot.z]}>
      <Sketchable model={model} section="cards" />
      {/* generous invisible hit box — the cards themselves are tiny */}
      <mesh
        position={[0, 0.03, 0]}
        onClick={(e) => {
          e.stopPropagation();
          const s = useWorkspace.getState();
          s.plugCard(s.activeProjectId === project.id ? null : project.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          useWorkspace.getState().hoverCard(project.id);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          useWorkspace.getState().hoverCard(null);
        }}
      >
        <boxGeometry args={[0.11, 0.08, 0.13]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* own suspense boundary: the label's font streams from a CDN —
          if that hangs (blocked network), only the label goes missing,
          not the whole room */}
      <Suspense fallback={null}>
        <CardLabel project={project} />
      </Suspense>
    </group>
  );
}

function CardLabel({ project }: { project: Project }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const { activeProjectId, hoveredCardId } = useWorkspace.getState();
    ref.current.visible = activeProjectId === project.id || hoveredCardId === project.id;
  });
  return (
    <group ref={ref} position={[0, 0.085, 0]}>
      <Text
        fontSize={0.028}
        color={project.card.color}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.002}
        outlineColor="#0a0a0c"
      >
        {project.card.label}
      </Text>
    </group>
  );
}

export function MemoryCards() {
  const slots = useScatter(projects.length);
  return (
    <group>
      {projects.map((p, i) => (
        <Card key={p.id} project={p} slot={slots[i]} />
      ))}
    </group>
  );
}
