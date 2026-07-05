import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArc } from "../state/store";
import { profile } from "../content/profile";

const LINES = [
  "This city is still expanding.",
  "The next district hasn't been built yet.",
  "Let's build it together.",
];

/** The roof. Replaces a Contact page with an invitation. */
export function FinaleOverlay() {
  const setPhase = useArc((s) => s.setPhase);
  const visited = useArc((s) => s.visited);
  const pipelineRuns = useArc((s) => s.pipelineRuns);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= LINES.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 2200 : 2600);
    return () => clearTimeout(t);
  }, [step]);

  const done = step >= LINES.length;

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-end pb-16">
      <div className="flex min-h-[120px] flex-col items-center justify-end">
        <AnimatePresence mode="wait">
          {!done && step < LINES.length && (
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.0 }}
              className="px-6 text-center text-2xl font-light tracking-wide text-fg"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.85)" }}
            >
              {LINES[step]}
            </motion.p>
          )}
        </AnimatePresence>

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="glass w-[440px] max-w-[92vw] p-6 text-center"
          >
            <div className="hud-label mb-2">THE NEXT DISTRICT</div>
            <p className="mb-4 text-[14px] font-light leading-relaxed text-fg/90">
              You visited {visited.length} chapter{visited.length === 1 ? "" : "s"}
              {pipelineRuns > 0 && <> and ran the pipeline {pipelineRuns} time{pipelineRuns === 1 ? "" : "s"}</>}.
              If what you saw matches what you're building — the skyline has room.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${profile.email}?subject=Let's build the next district`}
                className="border border-accent/50 px-4 py-3 font-mono text-[11px] tracking-[0.25em] text-accent transition-colors hover:bg-accent/10"
              >
                ✉ {profile.email.toUpperCase()}
              </a>
              <div className="flex gap-2">
                <a href={profile.github} target="_blank" rel="noreferrer" className="flex-1 border border-line px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-dim transition-colors hover:border-accent/40 hover:text-accent">
                  GITHUB ↗
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex-1 border border-line px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-dim transition-colors hover:border-accent/40 hover:text-accent">
                  LINKEDIN ↗
                </a>
              </div>
              <button
                onClick={() => setPhase("ride")}
                className="cursor-pointer pt-2 font-mono text-[10px] tracking-[0.25em] text-dim transition-colors hover:text-fg"
              >
                ▼ BACK DOWN TO THE ELEVATOR
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
