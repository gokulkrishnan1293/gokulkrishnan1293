import { useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { useWorkspace } from "@/state/store";
import { copy } from "@/content";

/**
 * Scene 0 — the way in. No splash, no word: the 3D door scene IS the
 * welcome. This overlay only turns asset streaming into the gate phase
 * and catches the begin-click (which doubles as the audio-unlock gesture).
 */
export function DoorGate() {
  const phase = useWorkspace((s) => s.phase);
  const begin = useWorkspace((s) => s.begin);
  const setPhase = useWorkspace((s) => s.setPhase);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress >= 100 && phase === "loading") setPhase("gate");
  }, [progress, phase, setPhase]);

  if (phase === "entering" || phase === "ready") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-16"
      onClick={() => phase === "gate" && begin()}
      style={{ cursor: phase === "gate" ? "pointer" : "default" }}
    >
      {phase === "loading" ? (
        <div className="font-mono text-[12px] tracking-widest text-[#4a463e]">
          <span className="cursor-blink">·</span> {Math.round(progress)}%
        </div>
      ) : (
        <div className="fade-up font-mono text-[13px] text-[#9a958a]">
          <span className="cursor-blink">▸</span> {copy.loading.hint}
        </div>
      )}
    </div>
  );
}
