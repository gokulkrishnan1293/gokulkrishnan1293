import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useWorkshop } from "@/state/store";
import { L } from "@/experience/timeline";

/**
 * The RGB light bars really glow — Scene 1 is the desk at night.
 * They double as the sound toggle (handled on the speaker meshes);
 * these are just the LED strips.
 */
export function SpeakerLeds() {
  const matL = useRef<THREE.MeshStandardMaterial>(null);
  const matR = useRef<THREE.MeshStandardMaterial>(null);
  const color = useRef(new THREE.Color());

  useFrame((state) => {
    const { phase, audioOn, mode } = useWorkshop.getState();
    const on = phase === "ready" || mode === "overview";
    const t = state.clock.elapsedTime;
    // slow hue drift; faster + brighter when audio is on
    const hue = (t * (audioOn ? 0.12 : 0.03)) % 1;
    color.current.setHSL(hue, 0.75, 0.55);
    for (const m of [matL.current, matR.current]) {
      if (!m) continue;
      m.emissive.copy(color.current);
      m.emissiveIntensity = on ? (audioOn ? 2.2 + Math.sin(t * 6) * 0.5 : 1.1) : 0;
    }
  });

  const bar = (x: number, ref: React.RefObject<THREE.MeshStandardMaterial | null>) => (
    <mesh position={[x, L.deskTop + 0.15, L.speakerL.z + 0.045]}>
      <boxGeometry args={[0.02, 0.22, 0.008]} />
      <meshStandardMaterial ref={ref} color="#111114" emissiveIntensity={0} toneMapped={false} />
    </mesh>
  );

  return (
    <>
      {bar(L.speakerL.x, matL)}
      {bar(L.speakerR.x, matR)}
    </>
  );
}
