import { motion } from "framer-motion";
import { ERAS } from "../../content/journey";

export function EngineeringFloor() {
  return (
    <div className="space-y-4">
      {ERAS.map((e, i) => (
        <motion.div
          key={e.years}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.5 }}
          className="hairline relative bg-panel/50 p-5"
        >
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] tracking-[0.2em] text-accent">{e.years}</span>
              <span className="text-[15px] text-fg">{e.role}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {e.stack.map((s) => (
                <span key={s} className="border border-line px-1.5 py-0.5 font-mono text-[9px] text-dim">{s}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 text-[13px] font-light leading-relaxed md:grid-cols-2">
            <div>
              <div className="hud-label mb-1">BUILT / OWNED</div>
              <p className="text-fg/85">{e.built}</p>
              <p className="mt-1 text-fg/60">{e.owned}</p>
            </div>
            <div>
              <div className="hud-label mb-1">THE CONSTRAINT THAT TAUGHT ME</div>
              <p className="italic text-fg/85">“{e.constraint}”</p>
              <p className="mt-1 text-accent/90">↳ {e.carried}</p>
            </div>
          </div>
          {i < ERAS.length - 1 && (
            <div className="absolute -bottom-4 left-8 h-4 w-px bg-gradient-to-b from-line to-transparent" />
          )}
        </motion.div>
      ))}
      <p className="pt-2 text-center font-mono text-[11px] text-dim">
        The pattern: every layer's failure became the next layer's instinct. That's the whole résumé.
      </p>
    </div>
  );
}
