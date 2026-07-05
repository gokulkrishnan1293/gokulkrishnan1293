import { motion } from "framer-motion";
import { FUTURE } from "../../content/future";
import { useArc } from "../../state/store";

const STAGE_STYLE: Record<string, { label: string; cls: string }> = {
  construction: { label: "UNDER CONSTRUCTION", cls: "text-warn border-warn/40" },
  blueprint: { label: "BLUEPRINT", cls: "text-accent border-accent/40" },
  research: { label: "RESEARCH", cls: "text-dim border-line" },
};

export function FutureFloor() {
  const setPhase = useArc((s) => s.setPhase);
  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-[13px] font-light leading-relaxed text-fg/75">
        The Future District still has cranes on the skyline. These are the systems
        being built or argued into existence — the roadmap, not the résumé.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {FUTURE.map((u, i) => {
          const st = STAGE_STYLE[u.stage];
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="hairline flex flex-col bg-panel/50 p-5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[15px] text-fg">{u.name}</h3>
                <span className={`border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] ${st.cls}`}>{st.label}</span>
              </div>
              <p className="mb-3 flex-1 text-[13px] font-light leading-relaxed text-fg/85">{u.premise}</p>
              <p className="border-t border-line pt-2 text-[12px] italic leading-relaxed text-fg/55">why: {u.why}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="pt-4 text-center">
        <button
          onClick={() => setPhase("finale")}
          className="cursor-pointer border border-accent-2/50 px-6 py-3 font-mono text-[11px] tracking-[0.3em] text-accent-2 transition-colors hover:bg-accent-2/10"
        >
          ▲ TAKE THE ELEVATOR TO THE ROOF
        </button>
      </div>
    </div>
  );
}
