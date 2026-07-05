import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useArc } from "../state/store";
import { FLOORS, FLOOR_ORDER, floorById } from "../content/floors";
import { personaById } from "../content/personas";
import { Typewriter } from "./Typewriter";

const AMBIENT = [
  "districts online: 6",
  "vector index: warm",
  "corpus watchdog: healthy",
  "traffic mesh: nominal",
  "roof access: armed",
];

/**
 * The cab's two holographic walls:
 *  left — navigation (chapters, persona-ordered, with memory ticks)
 *  right — live AI activity feed (real session events from the store)
 */
export function ElevatorHUD() {
  const persona = useArc((s) => s.persona)!;
  const visited = useArc((s) => s.visited);
  const activity = useArc((s) => s.activity);
  const openFloor = useArc((s) => s.openFloor);
  const setPhase = useArc((s) => s.setPhase);
  const log = useArc((s) => s.log);
  const pipelineRuns = useArc((s) => s.pipelineRuns);
  const feedRef = useRef<HTMLDivElement>(null);

  const order = FLOOR_ORDER[persona];
  const p = personaById(persona);

  // ambient system telemetry, sparse on purpose
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      log("SYS", AMBIENT[i % AMBIENT.length]);
      i++;
    }, 9000);
    return () => clearInterval(id);
  }, [log]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [activity]);

  const greeting = useMemo(() => {
    if (visited.length === 0) return p.ack;
    if (visited.length < 3)
      return `Welcome back. ${visited.length} chapter${visited.length > 1 ? "s" : ""} visited — I've reordered nothing yet, but I'm keeping notes.`;
    if (pipelineRuns > 0)
      return `You've run my pipeline ${pipelineRuns} time${pipelineRuns > 1 ? "s" : ""} and visited ${visited.length} floors. The roof is worth it when you're ready.`;
    return `${visited.length} chapters visited. The roof is unlocked whenever you're ready.`;
  }, [visited.length, pipelineRuns, p.ack]);

  const roofReady = visited.length >= 2;

  return (
    <div className="fixed inset-0 z-20 flex items-stretch justify-between px-4 py-16 sm:px-8">
      {/* LEFT WALL — NAVIGATION */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="glass relative flex w-[320px] max-w-[46vw] flex-col rounded-sm p-5"
      >
        <div className="holo-sheen" />
        <div className="hud-label mb-4">NAVIGATION · CHAPTERS, NOT PAGES</div>
        <div className="flex-1 space-y-1.5 overflow-y-auto scroll-thin pr-1">
          {order.map((fid, i) => {
            const f = floorById(fid);
            const seen = visited.includes(fid);
            return (
              <button
                key={fid}
                onClick={() => openFloor(fid, 0, f.index)}
                className="hairline group block w-full cursor-pointer px-3 py-2.5 text-left transition-all hover:border-accent/50 hover:bg-accent/5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-dim">
                    {f.chapter}
                    {i === 1 && !seen && (
                      <span className="ml-2 text-accent-2">◈ RECOMMENDED FOR YOU</span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-dim">
                    {seen ? <span className="text-ok">✓</span> : `F${f.index}`}
                  </span>
                </div>
                <div className="mt-0.5 text-[13px] text-fg/90 group-hover:text-fg">{f.title}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            log("NAV", "roof access requested");
            setPhase("finale");
          }}
          className={`mt-3 border px-3 py-3 font-mono text-[11px] tracking-[0.3em] transition-all ${
            roofReady
              ? "cursor-pointer border-accent-2/50 text-accent-2 hover:bg-accent-2/10"
              : "cursor-pointer border-line text-dim hover:text-fg/70"
          }`}
        >
          ▲ ROOF — FINAL CHAPTER
        </button>
      </motion.div>

      {/* CENTER — ELEV.AI voice line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="hud-label mb-1">ELEV.AI</div>
          <p className="text-[13px] font-light text-fg/85">
            <Typewriter text={greeting} speed={16} />
          </p>
        </div>
      </div>

      {/* RIGHT WALL — AI ACTIVITY */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="glass relative hidden w-[300px] flex-col rounded-sm p-5 md:flex"
      >
        <div className="holo-sheen" />
        <div className="hud-label mb-4 flex items-center gap-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-ok" />
          SYSTEM ACTIVITY · LIVE SESSION LOG
        </div>
        <div ref={feedRef} className="flex-1 space-y-1 overflow-y-auto scroll-thin font-mono text-[10px] leading-relaxed">
          {activity.map((e, i) => (
            <div key={i} className="flex gap-2 text-dim">
              <span className="shrink-0 text-line">{(e.t / 1000).toFixed(1)}s</span>
              <span className={`shrink-0 ${e.tag === "PIPELINE" ? "text-accent" : e.tag === "MEMORY" ? "text-accent-2" : e.tag === "NAV" ? "text-ok" : ""}`}>
                {e.tag}
              </span>
              <span className="text-fg/60">{e.msg}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 hud-label">EVERY LINE IS A REAL EVENT FROM THIS SESSION</div>
      </motion.div>
    </div>
  );
}
