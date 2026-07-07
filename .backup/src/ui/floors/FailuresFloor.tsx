import { motion } from "framer-motion";
import { FAILURES } from "../../content/failures";

export function FailuresFloor() {
  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-[13px] font-light leading-relaxed text-fg/75">
        Every city has demolished buildings. Most portfolios bulldoze the rubble and
        landscape over it. This floor keeps the wreckage lit, because the scars are
        where the architecture instincts actually come from.
      </p>
      {FAILURES.map((f, i) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="hairline border-err/20 bg-panel/50 p-5"
        >
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[15px] text-fg">{f.title}</h3>
            <span className="font-mono text-[10px] text-err/80">COST · {f.cost}</span>
          </div>
          <p className="mb-3 max-w-3xl text-[13px] font-light leading-relaxed text-fg/85">{f.story}</p>
          <div className="grid gap-3 text-[12px] leading-relaxed md:grid-cols-3">
            <div>
              <div className="hud-label mb-1">ROOT CAUSE</div>
              <p className="text-fg/70">{f.rootCause}</p>
            </div>
            <div>
              <div className="hud-label mb-1">THE FIX</div>
              <p className="text-fg/70">{f.fix}</p>
            </div>
            <div>
              <div className="hud-label mb-1 text-accent-2">PERMANENT SCAR</div>
              <p className="text-accent-2/80">{f.scar}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
