import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useWorkshop } from "@/state/store";
import { sampleCamera, OVERVIEW_CAM, SEATED_CAM, SCENES } from "@/experience/timeline";

/**
 * One camera, three masters: the scroll timeline (tour), free look in
 * overview (the gaze follows the mouse, the wheel zooms, and the view can
 * be locked in place to study something), and the seated-in-the-chair
 * preset. Everything is damped so master-switches feel like camera moves.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const target = useRef({
    pos: new THREE.Vector3(0, 1.06, 0.62),
    look: new THREE.Vector3(0, 1.07, -0.26),
    fov: 42,
  });
  const currentLook = useRef(new THREE.Vector3(0, 1.07, -0.26));
  /** wheel dolly: 1 = the wide shot, smaller = closer to the desk */
  const zoom = useRef(1);
  const zoomDir = useRef(new THREE.Vector3());

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const s = useWorkshop.getState();
      if (s.mode !== "overview" || s.seated || s.viewLocked || s.overlay) return;
      zoom.current = Math.min(1.45, Math.max(0.42, zoom.current + e.deltaY * 0.0012));
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useFrame((state, delta) => {
    const { progress, mode, seated, phase, viewLocked, activeProjectId } = useWorkshop.getState();
    const t = target.current;

    if (mode === "overview") {
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
