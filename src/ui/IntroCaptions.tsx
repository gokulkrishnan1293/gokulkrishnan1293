import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArc } from "../state/store";
import { INTRO_DURATION } from "../three/CityScene";

/** Narration beats keyed to the camera path (fractions of INTRO_DURATION). */
const BEATS: { at: number; text: string; sub?: boolean }[] = [
  { at: 0.02, text: "Welcome." },
  { at: 0.13, text: "Every portfolio shows what someone built." },
  { at: 0.30, text: "This city shows how one architect thinks." },
  { at: 0.48, text: "Every district contains ideas." },
  { at: 0.63, text: "Every building contains decisions." },
  { at: 0.80, text: "Let's begin." },
];

export function IntroCaptions() {
  const setPhase = useArc((s) => s.setPhase);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setElapsed((performance.now() - start) / 1000), 100);
    return () => clearInterval(id);
  }, []);

  const frac = elapsed / INTRO_DURATION;
  const current = [...BEATS].reverse().find((b) => frac >= b.at);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-end pb-24">
      <AnimatePresence mode="wait">
        {current && (
          <motion.p
            key={current.text}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="max-w-xl px-6 text-center text-xl font-light tracking-wide text-fg/95 sm:text-2xl"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.8)" }}
          >
            {current.text}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        onClick={() => setPhase("threshold")}
        className="pointer-events-auto absolute bottom-6 right-6 cursor-pointer px-3 py-2 font-mono text-[10px] tracking-[0.25em] text-dim transition-colors hover:text-fg"
      >
        SKIP FLYOVER →
      </button>
    </div>
  );
}
