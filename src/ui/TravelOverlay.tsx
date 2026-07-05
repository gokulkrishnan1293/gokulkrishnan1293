import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useArc } from "../state/store";
import { floorById } from "../content/floors";

/**
 * Floor travel: counter sweep + light streaks. ~2.4s, then the chapter opens.
 * Reduced-motion sessions get a quick crossfade instead.
 */
export function TravelOverlay() {
  const { travelFrom, travelTo, floor, arriveFloor, reducedMotion } = useArc();
  const [n, setN] = useState(travelFrom);
  const meta = floor ? floorById(floor) : null;

  useEffect(() => {
    const dur = reducedMotion ? 400 : 2200;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const f = Math.min((performance.now() - start) / dur, 1);
      const eased = 1 - Math.pow(1 - f, 3);
      setN(Math.round(travelFrom + (travelTo - travelFrom) * eased));
      if (f < 1) raf = requestAnimationFrame(tick);
      else setTimeout(arriveFloor, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [travelFrom, travelTo, arriveFloor, reducedMotion]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-void/40">
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          {[12, 30, 55, 74, 90].map((x, i) => (
            <motion.div
              key={x}
              className="absolute w-px"
              style={{ left: `${x}%`, height: "36%", background: "linear-gradient(transparent, #6fd3ff, transparent)" }}
              initial={{ top: "110%" }}
              animate={{ top: "-40%" }}
              transition={{ duration: 0.7 + i * 0.12, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
      <div className="text-center">
        <div className="hud-label mb-3">{travelTo > travelFrom ? "ASCENDING" : "TRAVELLING"}</div>
        <div className="font-mono text-7xl font-light tabular-nums text-fg">{String(n).padStart(2, "0")}</div>
        {meta && <div className="mt-4 font-mono text-[11px] tracking-[0.3em] text-accent">{meta.chapter.toUpperCase()}</div>}
      </div>
    </div>
  );
}
