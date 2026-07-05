import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, PORTFOLIO_ADR, type Adr } from "../../content/projects";

const ALL_ADRS: { adr: Adr; source: string }[] = [
  ...PROJECTS.map((p) => ({ adr: p.adr, source: p.name })),
  { adr: PORTFOLIO_ADR, source: "ARC//OS (this experience)" },
];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="hud-label mb-1.5">{label}</div>
      {children}
    </div>
  );
}

export function DecisionsFloor() {
  const [openId, setOpenId] = useState<string>(ALL_ADRS[0].adr.id);

  return (
    <div className="space-y-3">
      <p className="max-w-3xl text-[13px] font-light leading-relaxed text-fg/75">
        No project cards. These are Architecture Decision Records — the format senior
        engineers actually use. The last one is about this website itself.
      </p>
      {ALL_ADRS.map(({ adr, source }) => {
        const open = openId === adr.id;
        return (
          <div key={adr.id} className={`hairline transition-colors ${open ? "border-accent/30" : ""}`}>
            <button
              onClick={() => setOpenId(open ? "" : adr.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div className="min-w-0">
                <div className="hud-label mb-0.5">{source} · {adr.status.toUpperCase()}</div>
                <div className="text-[14px] text-fg">{adr.title}</div>
              </div>
              <span className="font-mono text-dim">{open ? "−" : "+"}</span>
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-5 border-t border-line px-5 py-5 text-[13px] font-light leading-relaxed md:grid-cols-2">
                    <div className="space-y-4">
                      <Section label="PROBLEM">
                        <p className="text-fg/85">{adr.problem}</p>
                      </Section>
                      <Section label="CONSTRAINTS">
                        <ul className="space-y-1 text-fg/75">
                          {adr.constraints.map((c) => <li key={c}>▸ {c}</li>)}
                        </ul>
                      </Section>
                      <Section label="ALTERNATIVES CONSIDERED">
                        <div className="space-y-2">
                          {adr.alternatives.map((a) => (
                            <div key={a.option} className={`border-l-2 pl-3 ${a.verdict.includes("Chosen") ? "border-ok/70" : "border-err/40"}`}>
                              <div className="text-fg/90">{a.option}</div>
                              <div className="text-[12px] text-fg/55">{a.verdict}</div>
                            </div>
                          ))}
                        </div>
                      </Section>
                    </div>
                    <div className="space-y-4">
                      <Section label="DECISION">
                        <p className="border-l-2 border-accent/60 pl-3 text-fg/90">{adr.decision}</p>
                      </Section>
                      <Section label="TRADE-OFFS ACCEPTED">
                        <ul className="space-y-1 text-fg/75">
                          {adr.tradeoffs.map((t) => <li key={t}>▸ {t}</li>)}
                        </ul>
                      </Section>
                      <Section label="OUTCOME">
                        <p className="text-ok/90">{adr.outcome}</p>
                      </Section>
                      <Section label="LESSONS">
                        <ul className="space-y-1 italic text-fg/70">
                          {adr.lessons.map((l) => <li key={l}>“{l}”</li>)}
                        </ul>
                      </Section>
                      <Section label="WHAT I WOULD CHANGE TODAY">
                        <p className="text-accent-2/90">{adr.changeToday}</p>
                      </Section>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
