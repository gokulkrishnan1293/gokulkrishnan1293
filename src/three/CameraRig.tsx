import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useWorkspace } from "@/state/store";
import { lookInput } from "@/state/lookInput";
import {
  sampleCamera,
  clamp01,
  smooth,
  ENTRY_P,
  OVERVIEW_CAM,
  SEATED_CAM,
  SCENES,
} from "@/experience/timeline";

/**
 * One camera, four masters: the walk through the door (intro), the scroll
 * timeline (tour), free look in overview (the gaze follows the mouse, the
 * wheel zooms, and the view can be locked in place to study something),
 * and the seated-in-the-chair preset. Everything is damped so
 * master-switches feel like camera moves.
 */

/** the begin-click scrubs the first stretch of the timeline (0 → ENTRY_P) */
const ENTER_MS = 3400;

const _dir = new THREE.Vector3();

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gate = sampleCamera(0);
  const target = useRef({ pos: gate.pos.clone(), look: gate.look.clone(), fov: gate.fov });
  const currentLook = useRef(gate.look.clone());
  /** wheel dolly: 1 = the wide shot, smaller = closer to the desk */
  const zoom = useRef(1);
  const zoomDir = useRef(new THREE.Vector3());
  /** orb-driven pan, accumulated while the orb is held (overview / seated) */
  const orbLook = useRef({ x: 0, y: 0 });
  /** orb-driven lean during the tour — springs back on release */
  const lean = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const s = useWorkspace.getState();
      if (s.phase !== "ready" || s.mode !== "overview" || s.seated || s.viewLocked || s.overlay) return;
      zoom.current = Math.min(1.45, Math.max(0.42, zoom.current + e.deltaY * 0.0012));
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame((state, delta) => {
    const { progress, mode, seated, phase, viewLocked, activeProjectId, enteredAt, finishEnter } =
      useWorkspace.getState();
    const t = target.current;

    if (phase !== "ready") {
      // outside, at the half-open door — the begin-click walks the first
      // stretch of the same timeline the scroll drives afterwards
      const k =
        phase === "entering" && enteredAt !== null
          ? clamp01((performance.now() - enteredAt) / ENTER_MS)
          : 0;
      const sample = sampleCamera(ENTRY_P * smooth(k));
      t.pos.copy(sample.pos);
      t.look.copy(sample.look);
      t.fov = sample.fov;
      if (k === 0) {
        // idle sway while waiting at the door
        const time = state.clock.elapsedTime;
        t.pos.x += Math.sin(time * 0.35) * 0.012;
        t.pos.y += Math.sin(time * 0.5) * 0.008;
      }
      if (k >= 1) finishEnter();
    } else if (mode === "overview") {
      if (seated) {
        // in the chair: a gentle glance around the working position
        const o = orbLook.current;
        o.x = THREE.MathUtils.clamp(o.x + lookInput.x * delta * 0.9, -0.55, 0.55);
        o.y = THREE.MathUtils.clamp(o.y + lookInput.y * delta * 0.6, -0.35, 0.35);
        t.pos.copy(SEATED_CAM.pos);
        t.look.set(SEATED_CAM.look.x + o.x, SEATED_CAM.look.y + o.y, SEATED_CAM.look.z);
        t.fov = SEATED_CAM.fov;
      } else if (!viewLocked) {
        // free look: hold the orb to pan the gaze, the wheel walks you in
        const o = orbLook.current;
        o.x = THREE.MathUtils.clamp(o.x + lookInput.x * delta * 2.4, -2.0, 2.0);
        o.y = THREE.MathUtils.clamp(o.y + lookInput.y * delta * 1.6, -1.15, 1.15);
        t.look.set(OVERVIEW_CAM.look.x + o.x, OVERVIEW_CAM.look.y + o.y, OVERVIEW_CAM.look.z);
        zoomDir.current.copy(OVERVIEW_CAM.pos).sub(OVERVIEW_CAM.look);
        t.pos.copy(OVERVIEW_CAM.look).addScaledVector(zoomDir.current, zoom.current);
        t.fov = OVERVIEW_CAM.fov;
      }
      // locked: targets stay frozen where they were
    } else {
      zoom.current = 1;
      if (activeProjectId && progress >= SCENES.cards.start - 0.02 && progress < SCENES.finale.start) {
        // a pendrive is plugged in — take the visitor to the monitor,
        // desk and wall kept in frame
        t.pos.set(0.04, 1.17, 0.95);
        t.look.set(0, 1.05, -0.2);
        t.fov = 44;
      } else {
        const sample = sampleCamera(phase === "ready" ? progress : 0);
        t.pos.copy(sample.pos);
        t.look.copy(sample.look);
        t.fov = sample.fov;
      }
      // the gaze leans while the orb is held, and settles back on release
      const l = lean.current;
      if (lookInput.active) {
        l.x = THREE.MathUtils.clamp(l.x + lookInput.x * delta * 0.4, -0.16, 0.16);
        l.y = THREE.MathUtils.clamp(l.y + lookInput.y * delta * 0.28, -0.1, 0.1);
      } else {
        const d = Math.exp(-2.5 * delta);
        l.x *= d;
        l.y *= d;
      }
      t.look.x += l.x;
      t.look.y += l.y;
      // breathing: tiny idle drift so held shots stay alive
      const time = state.clock.elapsedTime;
      t.pos.x += Math.sin(time * 0.4) * 0.008;
      t.pos.y += Math.sin(time * 0.53) * 0.006;
    }

    // narrow viewports: dolly back along the view axis so the whole set
    // survives the crop (fov alone distorts; distance doesn't)
    const aspect = state.size.width / state.size.height;
    if (aspect < 0.95 && !seated) {
      _dir.copy(t.pos).sub(t.look).normalize();
      t.pos.addScaledVector(_dir, (0.95 - aspect) * 1.5);
    }

    const k = 1 - Math.exp(-4.5 * delta);
    camera.position.lerp(t.pos, k);
    currentLook.current.lerp(t.look, k);
    camera.lookAt(currentLook.current);
    camera.fov += (t.fov - camera.fov) * k;

    // …and a touch of extra width on true phone portrait
    if (aspect < 0.8) camera.fov = Math.min(70, camera.fov + (0.8 - aspect) * 18);
    camera.updateProjectionMatrix();
  });

  return null;
}
