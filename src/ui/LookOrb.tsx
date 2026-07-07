import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/state/store";
import { lookInput } from "@/state/lookInput";

const RADIUS = 26; // px the knob can travel from center
const IDLE_MS = 5000;

/**
 * The look orb — hold and drag to turn the camera in that direction;
 * release and it springs back. A plain tap locks / unlocks the view.
 * It surfaces on any pointer activity and fades away after 5 idle
 * seconds. One control for mouse and thumb alike; kept deliberately
 * quiet: a translucent white orb, no gamepad chrome.
 */
export function LookOrb() {
  const phase = useWorkspace((s) => s.phase);
  const overlay = useWorkspace((s) => s.overlay);
  const mode = useWorkspace((s) => s.mode);
  const seated = useWorkspace((s) => s.seated);
  const viewLocked = useWorkspace((s) => s.viewLocked);
  const setViewLock = useWorkspace((s) => s.setViewLock);
  const [awake, setAwake] = useState(true);
  const knob = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const moved = useRef(0);

  // any pointer activity wakes the orb; 5 idle seconds put it back to sleep
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const wake = () => {
      setAwake(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!lookInput.active) setAwake(false);
      }, IDLE_MS);
    };
    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, []);

  if (phase !== "ready" || overlay) return null;

  const release = (el: HTMLDivElement) => {
    if (lookInput.active && moved.current < 6 && mode === "overview" && !seated) {
      // a tap, not a drag — freeze / release the view
      setViewLock(!viewLocked);
    }
    lookInput.x = 0;
    lookInput.y = 0;
    lookInput.active = false;
    el.style.transition = "transform 180ms ease-out";
    el.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      className={`fixed right-6 bottom-16 z-30 flex h-[76px] w-[76px] cursor-grab items-center justify-center rounded-full border backdrop-blur-sm transition-opacity duration-700 select-none active:cursor-grabbing ${
        viewLocked ? "border-[#ffb45466] bg-[#ffb4540d]" : "border-[#ffffff26] bg-[#ffffff0a]"
      } ${awake ? "opacity-100" : "pointer-events-none opacity-0"}`}
      style={{ touchAction: "none" }}
      title={viewLocked ? "view locked — tap to release" : "drag to look around · tap to lock the view"}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        origin.current = { x: e.clientX, y: e.clientY };
        moved.current = 0;
        lookInput.active = true;
        if (knob.current) knob.current.style.transition = "none";
      }}
      onPointerMove={(e) => {
        if (!lookInput.active || !knob.current) return;
        let dx = e.clientX - origin.current.x;
        let dy = e.clientY - origin.current.y;
        moved.current = Math.max(moved.current, Math.hypot(dx, dy));
        const len = Math.hypot(dx, dy);
        if (len > RADIUS) {
          dx = (dx / len) * RADIUS;
          dy = (dy / len) * RADIUS;
        }
        knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
        lookInput.x = dx / RADIUS;
        lookInput.y = -dy / RADIUS;
      }}
      onPointerUp={() => knob.current && release(knob.current)}
      onPointerCancel={() => knob.current && release(knob.current)}
    >
      <div
        ref={knob}
        className={`h-[30px] w-[30px] rounded-full transition-colors ${
          viewLocked ? "bg-[#ffb454] shadow-[0_0_14px_#ffb45466]" : "bg-[#ffffffcc] shadow-[0_0_14px_#ffffff55]"
        }`}
      />
    </div>
  );
}
