import { useEffect, useRef } from "react";
import { useWorkshop } from "@/state/store";
import { SCENES } from "@/experience/timeline";
import { Experience } from "@/three/Experience";
import { LadderLoader } from "@/ui/LadderLoader";
import { Hud } from "@/ui/Hud";
import { ModeChoice } from "@/ui/ModeChoice";
import { JourneyOverlay } from "@/ui/JourneyOverlay";
import { ReadingPanel } from "@/ui/ReadingPanel";
import { SceneCaptions } from "@/ui/SceneCaptions";
import { useAmbientAudio } from "@/ui/useAmbientAudio";

/** Total scroll length of the tour, in viewport-heights. */
const TRACK_VH = 900;

export function App() {
  const phase = useWorkshop((s) => s.phase);
  const mode = useWorkshop((s) => s.mode);
  const trackRef = useRef<HTMLDivElement>(null);

  useAmbientAudio();

  // scroll → progress
  useEffect(() => {
    const onScroll = () => {
      const s = useWorkshop.getState();
      if (s.phase !== "ready" || s.mode !== "tour") return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      s.setProgress(p);
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

  // replay intro → scroll back to top instantly
  useEffect(() => {
    if (mode === "tour") window.scrollTo({ top: 0 });
  }, [mode]);

  return (
    <>
      {/* scroll driver — an invisible track behind the fixed canvas */}
      <div ref={trackRef} className="scroll-track" style={{ height: `${TRACK_VH}vh` }} aria-hidden />

      <Experience />

      {phase === "ready" && (
        <>
          <SceneCaptions />
          <ModeChoice />
          <JourneyOverlay />
          <Hud />
          <ReadingPanel />
        </>
      )}

      <LadderLoader />
    </>
  );
}
