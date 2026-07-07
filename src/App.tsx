import { useEffect, useRef } from "react";
import { useWorkspace } from "@/state/store";
import { SCENES, ENTRY_P } from "@/experience/timeline";
import { Experience } from "@/three/Experience";
import { DoorGate } from "@/ui/DoorGate";
import { Hud } from "@/ui/Hud";
import { JourneyOverlay } from "@/ui/JourneyOverlay";
import { ReadingPanel } from "@/ui/ReadingPanel";
import { SceneCaptions } from "@/ui/SceneCaptions";
import { LookOrb } from "@/ui/LookOrb";
import { StageRail } from "@/ui/StageRail";
import { useAmbientAudio } from "@/ui/useAmbientAudio";

/** Total scroll length of the tour, in viewport-heights. */
const TRACK_VH = 900;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function App() {
  const phase = useWorkspace((s) => s.phase);
  const mode = useWorkspace((s) => s.mode);
  const scrollTarget = useWorkspace((s) => s.scrollTarget);
  const trackRef = useRef<HTMLDivElement>(null);

  useAmbientAudio();

  // scroll → progress
  useEffect(() => {
    const onScroll = () => {
      const s = useWorkspace.getState();
      if (s.phase !== "ready" || s.mode !== "tour") return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      s.setProgress(p);
      // the end of the track IS the full switch — no click needed
      if (p >= 0.999) {
        s.setMode("overview");
        return;
      }
      // scrolling away from the desk ejects the plugged-in pendrive
      if (s.activeProjectId && (p >= SCENES.finale.start || p < SCENES.cards.start - 0.02)) {
        s.plugCard(null);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
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
    const to = max * scrollTarget;
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
    window.scrollTo({ top: max * ENTRY_P });
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
