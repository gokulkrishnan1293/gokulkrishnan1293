import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useWorkshop } from "@/state/store";
import { sampleCamera, clamp01, smooth, OVERVIEW_CAM, SEATED_CAM, SCENES } from "@/experience/timeline";

/**
 * One camera, four masters: the walk through the door (intro), the scroll
 * timeline (tour), free look in overview (the gaze follows the mouse, the
 * wheel zooms, and the view can be locked in place to study something),
 * and the seated-in-the-chair preset. Everything is damped so
 * master-switches feel like camera moves.
 */

/** waiting at the half-open door, peeking through the gap at the glow */
const GATE_CAM = {
  pos: new THREE.Vector3(0.42, 1.22, 4.55),
  look: new THREE.Vector3(0, 1.05, 1.0),
  fov: 46,
};
/** just past the threshold, mid walk-in */
const THRESHOLD = {
  pos: new THREE.Vector3(0.1, 1.16, 3.1),
  look: new THREE.Vector3(0, 1.08, 1.2),
};
const ENTER_MS = 3400;

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const target = useRef({
    pos: GATE_CAM.pos.clone(),
    look: GATE_CAM.look.clone(),
    fov: GATE_CAM.fov,
  });
  const currentLook = useRef(GATE_CAM.look.clone());
  /** wheel dolly: 1 = the wide shot, smaller = closer to the desk */
  const zoom = useRef(1);
  const zoomDir = useRef(new THREE.Vector3());

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const s = useWorkshop.getState();
      if (s.phase !== "ready" || s.mode !== "overview" || s.seated || s.viewLocked || s.overlay) return;
      zoom.current = Math.min(1.45, Math.max(0.42, zoom.current + e.deltaY * 0.0012));
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame((state, delta) => {
    const { progress, mode, seated, phase, viewLocked, activeProjectId, enteredAt, finishEnter } =
      useWorkshop.getState();
    const t = target.current;

    if (phase !== "ready") {
      // outside, at the half-open door — then the walk in
      const end = mode === "overview" ? OVERVIEW_CAM : sampleCamera(0);
      if (phase === "entering" && enteredAt !== null) {
        const k = clamp01((performance.now() - enteredAt) / ENTER_MS);
        if (k < 0.3) {
          // the door swings; a small lean toward the light
          const u = smooth(k / 0.3);
          t.pos.lerpVectors(GATE_CAM.pos, THRESHOLD.pos, u * 0.35);
          t.look.lerpVectors(GATE_CAM.look, THRESHOLD.look, u * 0.5);
          t.fov = GATE_CAM.fov;
        } else {
          // step through and up to the glowing screen
          const u = smooth((k - 0.3) / 0.7);
          _a.lerpVectors(GATE_CAM.pos, THRESHOLD.pos, 0.35);
          _b.lerpVectors(GATE_CAM.look, THRESHOLD.look, 0.5);
          t.pos.lerpVectors(_a, end.pos, u);
          t.look.lerpVectors(_b, end.look, u);
          t.fov = GATE_CAM.fov + (end.fov - GATE_CAM.fov) * u;
        }
        if (k >= 1) finishEnter();
      } else {
        t.pos.copy(GATE_CAM.pos);
        t.look.copy(GATE_CAM.look);
        t.fov = GATE_CAM.fov;
        // idle sway while waiting at the door
        const time = state.clock.elapsedTime;
        t.pos.x += Math.sin(time * 0.35) * 0.012;
        t.pos.y += Math.sin(time * 0.5) * 0.008;
      }
    } else if (mode === "overview") {
      if (seated) {
        // in the chair: a gentle glance around the working position
        t.pos.copy(SEATED_CAM.pos);
        t.look.set(
          SEATED_CAM.look.x + state.pointer.x * 0.55,
          SEATED_CAM.look.y + state.pointer.y * 0.35,
          SEATED_CAM.look.z,
        );
        t.fov = SEATED_CAM.fov;
      } else if (!viewLocked) {
        // free look: the gaze follows the mouse, the wheel walks you in
        t.look.set(
          OVERVIEW_CAM.look.x + state.pointer.x * 2.0,
          OVERVIEW_CAM.look.y + state.pointer.y * 1.15,
          OVERVIEW_CAM.look.z,
        );
        zoomDir.current.copy(OVERVIEW_CAM.pos).sub(OVERVIEW_CAM.look);
        t.pos.copy(OVERVIEW_CAM.look).addScaledVector(zoomDir.current, zoom.current);
        t.fov = OVERVIEW_CAM.fov;
      }
      // locked: targets stay frozen where they were
    } else {
      zoom.current = 1;
      if (activeProjectId && progress >= SCENES.cards.start - 0.02 && progress < SCENES.finale.start) {
        // a pendrive is plugged in — take the visitor to the monitor
        t.pos.set(0.04, 1.13, 0.74);
        t.look.set(0, 1.09, -0.2);
        t.fov = 42;
      } else {
        const sample = sampleCamera(phase === "ready" ? progress : 0);
        t.pos.copy(sample.pos);
        t.look.copy(sample.look);
        t.fov = sample.fov;
      }
      // the gaze leans with the cursor at every beat of the tour
      t.look.x += state.pointer.x * 0.14;
      t.look.y += state.pointer.y * 0.09;
      // breathing: tiny idle drift so held shots stay alive
      const time = state.clock.elapsedTime;
      t.pos.x += Math.sin(time * 0.4) * 0.008;
      t.pos.y += Math.sin(time * 0.53) * 0.006;
    }

    const k = 1 - Math.exp(-4.5 * delta);
    camera.position.lerp(t.pos, k);
    currentLook.current.lerp(t.look, k);
    camera.lookAt(currentLook.current);
    camera.fov += (t.fov - camera.fov) * k;

    // portrait phones need a wider view to keep the desk in frame
    const aspect = state.size.width / state.size.height;
    if (aspect < 0.8) camera.fov = Math.min(75, camera.fov + (0.8 - aspect) * 30);
    camera.updateProjectionMatrix();
  });

  return null;
}
