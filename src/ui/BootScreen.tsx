import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@react-three/drei";
import { useArc } from "../state/store";
import { profile } from "../content/profile";
import { CORPUS } from "../engine/corpus";
import { DIMS } from "../engine/embedding";

/**
 * Boot readout gated on REAL asset progress (drei useProgress) — the
 * percentages are the actual GLB download, not a timer pretending to load.
 */
const BOOT_LINES = [
  "mounting districts…",
  "hydrating knowledge corpus…",
  "indexing vectors…",
  "calibrating elevator…",
];

export function BootScreen() {
  const { progress, active } = useProgress();
  const setPhase = useArc((s) => s.setPhase);
  const log = useArc((s) => s.log);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setReady(true), 400);
      return () => clearTimeout(t);
    }
  }, [progress, active]);

  const lineCount = Math.min(BOOT_LINES.length, Math.floor(progress / 25) + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void">
      <div className="w-[420px] max-w-[88vw]">
        <div className="mb-8">
          <div className="font-mono text-2xl tracking-[0.35em] text-fg">
            ARC<span className="text-accent">//</span>OS
          </div>
          <div className="hud-label mt-2">
            THE OPERATING SYSTEM OF AN AI ARCHITECT&apos;S MIND
          </div>
        </div>

        <div className="mb-6 space-y-1.5 font-mono text-[11px] text-dim">
          {BOOT_LINES.slice(0, lineCount).map((l, i) => (
            <motion.div key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between">
              <span>{l}</span>
              <span className="text-ok">{i < lineCount - 1 || ready ? "ok" : "…"}</span>
            </motion.div>
          ))}
          {ready && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between">
              <span>
                corpus: {CORPUS.length} docs embedded · {DIMS}-dim · in this browser
              </span>
              <span className="text-ok">ok</span>
            </motion.div>
          )}
        </div>

        <div className="mb-2 h-px w-full bg-line relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-dim">
          <span>city + elevator assets</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <AnimatePresence>
          {ready && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                log("SYS", `session start · ${profile.osName} v${profile.osVersion}`);
                setPhase("intro");
              }}
              className="glass mt-10 w-full cursor-pointer px-6 py-4 font-mono text-[12px] tracking-[0.3em] text-accent transition-colors hover:border-accent/40 hover:text-fg"
            >
              ENTER THE CITY ↵
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
