import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/state/store";
import { lookInput } from "@/state/lookInput";

const RADIUS = 26; // px the knob can travel from center
const IDLE_MS = 5000;
const DOUBLE_TAP_MS = 280;
const RING_C = 2 * Math.PI * 35; // circumference of the progress ring

/**
 * The look orb — hold and drag to turn the camera in that direction;
 * release and it springs back. Double-tap the knob to lock or unlock the
 * view. It surfaces on any pointer activity and fades away after 5 idle
 * seconds. One control for mouse and thumb alike; kept deliberately quiet:
 * a translucent white orb, no gamepad chrome.
 */
export function LookOrb() {
  const phase = useWorkspace((s) => s.phase);
  const overlay = useWorkspace((s) => s.overlay);
  const viewLocked = useWorkspace((s) => s.viewLocked);
  const [awake, setAwake] = useState(true);
  const knob = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const drag = useRef({ dx: 0, dy: 0, zoneStart: 0, latched: false, raf: 0 });
  const tapState = useRef({ count: 0, lastTapAt: 0, timeout: 0 as ReturnType<typeof setTimeout> | 0 });

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

  useEffect(() => () => {
    cancelAnimationFrame(drag.current.raf);
    if (tapState.current.timeout) clearTimeout(tapState.current.timeout);
  }, []);

  if (phase !== "ready" || overlay) return null;

  const setRing = (t: number) => {
    if (ring.current) ring.current.style.strokeDashoffset = `${RING_C * (1 - t)}`;
  };

  const release = (el: HTMLDivElement) => {
    lookInput.x = 0;
    lookInput.y = 0;
    lookInput.active = false;
    cancelAnimationFrame(drag.current.raf);
    drag.current.zoneStart = 0;
    drag.current.latched = false;
    setRing(0);
    el.style.transition = "transform 180ms ease-out";
    el.style.transform = "translate(0px, 0px)";
  };

  const toggleLock = () => {
    const s = useWorkspace.getState();
    s.setViewLock(!s.viewLocked);
  };

  return (
    <div
      className={`fixed right-6 bottom-16 z-30 flex h-[76px] w-[76px] cursor-grab items-center justify-center rounded-full border backdrop-blur-sm transition-opacity duration-700 select-none active:cursor-grabbing ${
        viewLocked ? "border-[#ffb45466] bg-[#ffb4540d]" : "border-[#ffffff26] bg-[#ffffff0a]"
      } ${awake ? "opacity-100" : "pointer-events-none opacity-0"}`}
      style={{ touchAction: "none" }}
      title={
        viewLocked
          ? "view locked — double-tap to unlock"
          : "drag to look around · double-tap to lock the view"
      }
      onPointerDown={(e) => {
        const now = performance.now();
        const tap = tapState.current;
        if (tap.count > 0 && now - tap.lastTapAt <= DOUBLE_TAP_MS) {
          clearTimeout(tap.timeout);
          tap.count = 0;
          tap.lastTapAt = 0;
          e.preventDefault();
          e.stopPropagation();
          toggleLock();
          if (knob.current) {
            knob.current.style.transition = "transform 180ms ease-out";
            knob.current.style.transform = "translate(0px, 0px)";
          }
          release(knob.current ?? e.currentTarget as HTMLDivElement);
          return;
        }

        e.currentTarget.setPointerCapture(e.pointerId);
        origin.current = { x: e.clientX, y: e.clientY };
        drag.current.dx = 0;
        drag.current.dy = 0;
        lookInput.active = true;
        if (knob.current) knob.current.style.transition = "none";
        tap.count = 1;
        tap.lastTapAt = now;
        tap.timeout = window.setTimeout(() => {
          tap.count = 0;
          tap.lastTapAt = 0;
        }, DOUBLE_TAP_MS);
      }}
      onPointerMove={(e) => {
        if (!lookInput.active || !knob.current) return;
        let dx = e.clientX - origin.current.x;
        let dy = e.clientY - origin.current.y;
        const len = Math.hypot(dx, dy);
        if (len > RADIUS) {
          dx = (dx / len) * RADIUS;
          dy = (dy / len) * RADIUS;
        }
        drag.current.dx = dx;
        drag.current.dy = dy;
        knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
        lookInput.x = dx / RADIUS;
        lookInput.y = -dy / RADIUS;
      }}
      onPointerUp={() => knob.current && release(knob.current)}
      onPointerCancel={() => knob.current && release(knob.current)}
    >
      {/* hold-to-lock progress ring, filling from the top */}
      <svg className="pointer-events-none absolute inset-0" width="76" height="76" viewBox="0 0 76 76">
        <circle
          ref={ring}
          cx="38"
          cy="38"
          r="35"
          fill="none"
          stroke="#ffb454"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C}
          transform="rotate(-90 38 38)"
        />
      </svg>
      <div
        ref={knob}
        className={`h-[30px] w-[30px] rounded-full transition-colors ${
          viewLocked ? "bg-[#ffb454] shadow-[0_0_14px_#ffb45466]" : "bg-[#ffffffcc] shadow-[0_0_14px_#ffffff55]"
        }`}
      />
    </div>
  );
}
