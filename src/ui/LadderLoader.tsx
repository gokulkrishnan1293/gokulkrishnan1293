import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { useWorkshop } from "@/state/store";
import { copy } from "@/content";

const LETTERS = ["W", "E", "L", "C", "O", "M", "E"];

/**
 * Scene 0 — the horizontal ladder. Rungs appear as assets stream in;
 * each rung reveals a letter of WELCOME. The climb motif from second zero.
 * The click-to-begin gate doubles as the browser audio-unlock gesture.
 */
export function LadderLoader() {
  const phase = useWorkshop((s) => s.phase);
  const begin = useWorkshop((s) => s.begin);
  const setPhase = useWorkshop((s) => s.setPhase);
  const { progress } = useProgress();
  const [gone, setGone] = useState(false);

  const loaded = progress >= 100;
  const rungs = loaded ? 7 : Math.min(6, Math.floor((progress / 100) * 7));

  useEffect(() => {
    if (loaded && phase === "loading") setPhase("gate");
  }, [loaded, phase, setPhase]);

  useEffect(() => {
    if (phase === "ready") {
      const t = setTimeout(() => setGone(true), 900);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0c] transition-opacity duration-700 ${
        phase === "ready" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onClick={() => phase === "gate" && begin()}
    >
      {/* the ladder — two rails, seven rungs */}
      <div className="relative h-[72px] w-[min(420px,80vw)]">
        <div className="absolute top-0 h-[3px] w-full rounded bg-[#3d3f48]" />
        <div className="absolute bottom-0 h-[3px] w-full rounded bg-[#3d3f48]" />
        <div className="absolute inset-x-[2%] top-[3px] bottom-[3px] flex items-stretch justify-between">
          {LETTERS.map((letter, i) => (
            <div key={i} className="flex w-[10px] flex-col items-center">
              {i < rungs ? (
                <div className="rung-in h-full w-[3px] rounded bg-[#e8e4da]" style={{ animationDelay: `${i * 60}ms` }} />
              ) : (
                <div className="h-full w-[3px]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex w-[min(420px,80vw)] justify-between px-[2%] font-mono text-[15px] tracking-widest">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className={`w-[10px] text-center transition-all duration-500 ${
              i < rungs ? "text-[#e8e4da] opacity-100" : "opacity-0"
            }`}
          >
            {letter}
          </span>
        ))}
      </div>

      <div
        className={`mt-14 font-mono text-[13px] text-[#9a958a] transition-opacity duration-700 ${
          phase === "gate" ? "cursor-pointer opacity-100" : "opacity-0"
        }`}
      >
        <span className="cursor-blink">▸</span> {copy.loading.hint}
      </div>
    </div>
  );
}
