import { useEffect, useRef } from "react";
import { useWorkspace } from "@/state/store";
import { SCENES, ENTRY_P, scrollToProgress, progressToScroll } from "@/experience/timeline";
import { COARSE_POINTER } from "@/utils/device";
import { Experience } from "@/three/Experience";
import { DoorGate } from "@/ui/DoorGate";
import { Hud } from "@/ui/Hud";
import { JourneyOverlay } from "@/ui/JourneyOverlay";
import { ReadingPanel } from "@/ui/ReadingPanel";
import { SceneCaptions } from "@/ui/SceneCaptions";
import { LookOrb } from "@/ui/LookOrb";
import { StageRail } from "@/ui/StageRail";
import { useAmbientAudio } from "@/ui/useAmbientAudio";

/** Total scroll length of the tour, in viewport-heights. 765 keeps every
 *  beat's scroll length from the 900vh track except cards, which now takes
 *  as much scroll as the desk beat (see SCROLL_MAP in the timeline). */
const TRACK_VH = 765;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function App() {
  const phase = useWorkspace((s) => s.phase);
  const mode = useWorkspace((s) => s.mode);
  const scrollTarget = useWorkspace((s) => s.scrollTarget);
  const trackRef = useRef<HTMLDivElement>(null);

  useAmbientAudio();

  // scroll → progress, damped in a rAF loop. Mobile scroll events arrive in
  // coarse steps (touch + momentum), so the raw value is smoothed here once
  // and everything downstream — camera, overlays, reveals — reads the same
  // jitter-free progress.
  useEffect(() => {
    let raf = 0;
    let current: number | null = null;
    let lastWritten: number | null = null;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const s = useWorkspace.getState();
      if (s.phase !== "ready" || s.mode !== "tour") {
        current = null;
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const frac = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const target = scrollToProgress(frac);
      // resync after external writes (the ENTRY_P park) or on (re)entry
      if (current === null || s.progress !== lastWritten) current = s.progress;
      current += (target - current) * (1 - Math.exp(-10 * dt));
      if (Math.abs(target - current) < 0.0004) current = target;
      if (current !== s.progress) {
        lastWritten = current;
        s.setProgress(current);
      }
      // the end of the track IS the full switch — no click needed.
      // 0.995, not 0.999: mobile momentum often stops a few px short of
      // the absolute bottom, and the finale must still land.
      if (target >= 0.995) {
        s.setMode("overview");
        // phones: land straight in the builder's seat, nose to the monitor,
        // so the contact screen is readable without a chair click
        if (COARSE_POINTER) s.sit(true);
        return;
      }
      // scrolling away from the desk ejects the plugged-in pendrive
      if (s.activeProjectId && (current >= SCENES.finale.start || current < SCENES.cards.start - 0.02)) {
        s.plugCard(null);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // overview mode / loading: lock the page scroll
  useEffect(() => {
    const lock = phase !== "ready" || mode === "overview";
    document.documentElement.style.overflow = lock ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase, mode]);

  // stage rail: ease the scroll to the requested beat; manual input cancels
  useEffect(() => {
    if (scrollTarget === null || phase !== "ready") return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const from = window.scrollY;
    const to = max * progressToScroll(scrollTarget);
    const dur = Math.min(1600, 500 + (Math.abs(to - from) / max) * 1400);
    const t0 = performance.now();
    let raf = 0;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const step = (now: number) => {
      if (cancelled) return done();
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo({ top: from + (to - from) * easeInOut(k) });
      if (k < 1) raf = requestAnimationFrame(step);
      else done();
    };
    const done = () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchmove", cancel);
      useWorkspace.getState().clearScrollTarget();
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchmove", cancel, { passive: true });
    raf = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchmove", cancel);
    };
  }, [scrollTarget, phase]);

  // the walk-in ends at ENTRY_P — park the scroll there so the tour picks
  // up seamlessly and scrolling backward walks you back out the door
  useEffect(() => {
    if (phase !== "ready" || useWorkspace.getState().mode !== "tour") return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * progressToScroll(ENTRY_P) });
    // park progress too, so the damped driver doesn't swoop up from 0
    useWorkspace.getState().setProgress(ENTRY_P);
  }, [phase]);

  return (
    <>
      {/* scroll driver — an invisible track behind the fixed canvas */}
      <div ref={trackRef} className="scroll-track" style={{ height: `${TRACK_VH}vh` }} aria-hidden />

      <Experience />

      {phase === "ready" && (
        <>
          <SceneCaptions />
          <JourneyOverlay />
          <Hud />
          <LookOrb />
          <StageRail />
          <ReadingPanel />
        </>
      )}

      <DoorGate />
    </>
  );
}
