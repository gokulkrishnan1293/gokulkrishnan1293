import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import { useNormalizedModel } from "./useNormalizedModel";
import { useArc } from "../state/store";
import { DISTRICTS, districtById } from "../content/districts";

const CITY_RADIUS = 110;
const TOWER_FALLBACK = new THREE.Vector3(0, 14, 0);

/**
 * Districts bind to real geometry: pick the tallest well-separated towers in
 * the (normalized) model and use their rooftops as district anchors. Beacons,
 * labels, the intro's destination tower and district fly-tos all derive from
 * this — so the annotation layer survives any asset swap.
 */
function computeDistrictAnchors(group: THREE.Group): Map<string, THREE.Vector3> {
  const candidates: { pos: THREE.Vector3; h: number }[] = [];
  const box = new THREE.Box3();
  group.updateMatrixWorld(true);
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    box.setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const foot = Math.max(size.x, size.z);
    // building-shaped: tall, bounded footprint (excludes ground plane / props)
    if (size.y > 16 && foot > 4 && foot < 75) {
      candidates.push({ pos: new THREE.Vector3(center.x, box.max.y, center.z), h: size.y });
    }
  });
  candidates.sort((a, b) => b.h - a.h);
  const picked: THREE.Vector3[] = [];
  for (const c of candidates) {
    if (picked.every((p) => p.distanceTo(c.pos) > 30)) picked.push(c.pos);
    if (picked.length >= 6) break;
  }
  const order = ["core", "ai", "engineering", "architecture", "research", "future"];
  const map = new Map<string, THREE.Vector3>();
  order.forEach((id, i) => {
    const d = DISTRICTS.find((x) => x.id === id)!;
    map.set(id, picked[i] ?? new THREE.Vector3(...d.pos));
  });
  return map;
}

/** Intro fly-through spline, authored in normalized city space. */
const INTRO_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(190, 95, 210),
    new THREE.Vector3(90, 60, 150),
    new THREE.Vector3(-70, 42, 95),
    new THREE.Vector3(-95, 30, -20),
    new THREE.Vector3(-30, 22, -70),
    new THREE.Vector3(35, 18, -30),
    new THREE.Vector3(10, 15, 30),
    new THREE.Vector3(0, 13.5, 12),
  ],
  false,
  "centripetal",
);

export const INTRO_DURATION = 38; // seconds; narration beats key off this

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Ambient "data traffic": glowing motes drifting along lanes over the city. */
function Traffic() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const lanes = useMemo(() => {
    const rng = (seed: number) => {
      let s = seed;
      return () => ((s = (s * 16807) % 2147483647) / 2147483647);
    };
    const r = rng(42);
    return new Array(70).fill(0).map(() => ({
      y: 4 + r() * 26,
      radius: 20 + r() * 85,
      speed: (0.02 + r() * 0.05) * (r() > 0.5 ? 1 : -1),
      phase: r() * Math.PI * 2,
      wobble: r() * 6,
    }));
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    lanes.forEach((l, i) => {
      const a = l.phase + t * l.speed;
      dummy.position.set(
        Math.cos(a) * l.radius,
        l.y + Math.sin(t * 0.7 + l.phase) * 0.8,
        Math.sin(a) * (l.radius * 0.82) + Math.sin(a * 2.3) * l.wobble,
      );
      const s = 0.35 + 0.2 * Math.sin(t * 2 + i);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 70]}>
      <sphereGeometry args={[0.5, 6, 6]} />
      <meshBasicMaterial color="#6fd3ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

/** Light column rising from a district's anchor tower. */
function Beacon({ anchor, color, active }: { anchor: THREE.Vector3; color: string; active: boolean }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const h = anchor.y + 26;
  useFrame(({ clock }) => {
    if (mat.current)
      mat.current.opacity = (active ? 0.34 : 0.1) + Math.sin(clock.elapsedTime * 1.4 + anchor.x) * 0.04;
  });
  return (
    <mesh position={[anchor.x, h / 2, anchor.z]}>
      <cylinderGeometry args={[0.5, 1.4, h, 12, 1, true]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0.12} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export function CityScene() {
  const { group } = useNormalizedModel("/models/city.glb", CITY_RADIUS, 1.6);
  const phase = useArc((s) => s.phase);
  const flyTarget = useArc((s) => s.flyTarget);
  const reducedMotion = useArc((s) => s.reducedMotion);
  const setPhase = useArc((s) => s.setPhase);
  const camera = useThree((s) => s.camera);

  const anchors = useMemo(() => computeDistrictAnchors(group), [group]);
  const tower = useMemo(() => {
    const core = anchors.get("core") ?? TOWER_FALLBACK;
    // gaze/approach point: partway up the core tower, not its rooftop
    return new THREE.Vector3(core.x, Math.max(12, core.y * 0.4), core.z);
  }, [anchors]);

  const introStart = useRef<number | null>(null);
  const lookAt = useRef(new THREE.Vector3().copy(tower));
  const desiredPos = useRef(new THREE.Vector3(190, 95, 210));

  useFrame(({ clock }, dt) => {
    const damp = 1 - Math.exp(-2.2 * dt);

    if (phase === "intro") {
      if (introStart.current === null) introStart.current = clock.elapsedTime;
      const raw = (clock.elapsedTime - introStart.current) / INTRO_DURATION;
      const t = easeInOut(Math.min(raw, 1));
      if (reducedMotion) {
        // reduced motion: locked wide shot, no flight
        desiredPos.current.set(120, 70, 140);
        lookAt.current.lerp(tower, damp);
      } else {
        INTRO_PATH.getPointAt(t, desiredPos.current);
        // gaze leads the camera along the path, settling on the core tower
        const ahead = INTRO_PATH.getPointAt(Math.min(t + 0.06, 1));
        const gaze = ahead.lerp(tower, Math.pow(t, 1.6));
        lookAt.current.lerp(gaze, damp * 1.6);
      }
      if (raw >= 1) {
        introStart.current = null;
        setPhase("threshold");
      }
    } else if (phase === "threshold") {
      // push into the tower doors; the DOM light-flood covers the scene swap
      desiredPos.current.lerp(new THREE.Vector3(tower.x, 12.5, tower.z + 16), damp * 0.9);
      lookAt.current.lerp(new THREE.Vector3(tower.x, 12.5, tower.z), damp);
    } else if (phase === "cityFly" && flyTarget) {
      const anchor = anchors.get(flyTarget);
      if (anchor) {
        // approach every district from the key-light quadrant (+x/+z) so
        // facades read lit, not silhouetted
        desiredPos.current.lerp(
          new THREE.Vector3(anchor.x + 88, anchor.y + 66, anchor.z + 108),
          damp * 0.8,
        );
        lookAt.current.lerp(new THREE.Vector3(anchor.x, anchor.y * 0.5, anchor.z), damp);
      }
    } else if (phase === "finale") {
      // wide oblique orbit — the whole skyline in frame, facades lit,
      // starting from the same quadrant the intro's hero shot uses
      const a = Math.PI * 0.25 + clock.elapsedTime * (reducedMotion ? 0 : 0.04);
      desiredPos.current.lerp(
        new THREE.Vector3(Math.sin(a) * 205, 135, Math.cos(a) * 205),
        damp * 0.6,
      );
      lookAt.current.lerp(new THREE.Vector3(0, 8, 0), damp * 0.7);
    } else if (phase === "boot") {
      desiredPos.current.set(190, 95, 210);
      lookAt.current.copy(tower);
    }

    camera.position.lerp(desiredPos.current, phase === "intro" ? 1 : damp);
    if (phase === "intro" && introStart.current !== null && !reducedMotion) {
      camera.position.copy(desiredPos.current);
    }
    camera.lookAt(lookAt.current);
  });

  const showBeacons = phase === "cityFly" || phase === "finale";
  const showLabels = phase === "cityFly" || phase === "finale";

  return (
    <group>
      <color attach="background" args={["#05070d"]} />
      <fog attach="fog" args={["#070b14", 90, 460]} />
      <ambientLight intensity={0.75} color="#8fa8d8" />
      <directionalLight position={[120, 180, 60]} intensity={1.2} color="#a8c4ff" />
      <directionalLight position={[-100, 60, -120]} intensity={0.7} color="#ff9a5c" />
      <Stars radius={380} depth={60} count={1600} factor={3} saturation={0} fade speed={0.4} />

      <primitive object={group} />
      <Traffic />

      {showBeacons &&
        DISTRICTS.map((d) => (
          <Beacon key={d.id} anchor={anchors.get(d.id)!} color={d.color} active={flyTarget === d.id || phase === "finale"} />
        ))}

      {showLabels &&
        DISTRICTS.map((d) => (
          <Html
            key={`lbl-${d.id}`}
            position={[anchors.get(d.id)!.x, anchors.get(d.id)!.y + 18, anchors.get(d.id)!.z]}
            center
            distanceFactor={140}
            style={{ pointerEvents: "none" }}
          >
            <div className="flex flex-col items-center gap-1 select-none" style={{ opacity: flyTarget && flyTarget !== d.id ? 0.35 : 1 }}>
              <div
                className="px-3 py-1 font-mono text-[11px] tracking-[0.25em] uppercase whitespace-nowrap"
                style={{ color: d.color, background: "rgba(5,7,13,0.72)", border: `1px solid ${d.color}44` }}
              >
                {d.name}
              </div>
              <div className="w-px h-6" style={{ background: `linear-gradient(${d.color}, transparent)` }} />
            </div>
          </Html>
        ))}
    </group>
  );
}
