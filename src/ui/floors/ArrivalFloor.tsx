import { profile } from "../../content/profile";
import { DISTRICTS } from "../../content/districts";
import { CORPUS } from "../../engine/corpus";

export function ArrivalFloor() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 text-[14px] font-light leading-relaxed text-fg/90">
        <p>
          This is not a portfolio website. It's a working model of how I think:
          a city of systems, navigated by an elevator that adapts to who you are.
        </p>
        <p>
          I'm {profile.name} — {profile.arc}. I design intelligent systems:
          retrieval pipelines, multi-agent orchestration, and the unglamorous
          guardrails that let LLMs be wrong safely.
        </p>
        <p className="text-fg/70">
          Three rules govern everything here:
        </p>
        <ul className="space-y-2 text-[13px] text-fg/80">
          <li className="border-l-2 border-accent/60 pl-3">
            <span className="text-accent">Nothing is faked.</span> The AI floor runs a real pipeline in your
            browser. Latencies are measured. When something is simulated, a label says so.
          </li>
          <li className="border-l-2 border-accent-2/60 pl-3">
            <span className="text-accent-2">Decisions over demos.</span> Every system ships with its ADR —
            constraints, rejected alternatives, and what I'd change today.
          </li>
          <li className="border-l-2 border-ok/60 pl-3">
            <span className="text-ok">Failures are load-bearing.</span> There's a whole floor of them.
          </li>
        </ul>
        <p className="pt-2 font-mono text-[11px] text-dim">
          runtime status: {CORPUS.length} corpus docs embedded locally · 6 districts · 0 network calls during AI runs
        </p>
      </div>

      <div className="space-y-2">
        <div className="hud-label mb-3">CITY MAP · DISTRICTS</div>
        {DISTRICTS.filter((d) => d.id !== "core").map((d) => (
          <div key={d.id} className="hairline flex items-center gap-3 px-4 py-3">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
            <div className="min-w-0">
              <div className="text-[13px] text-fg">{d.name}</div>
              <div className="truncate font-mono text-[10px] text-dim">{d.blurb}</div>
            </div>
          </div>
        ))}
        <p className="pt-2 text-[11px] italic text-dim">
          The elevator's navigation wall orders chapters for your lens — but every floor is open.
        </p>
      </div>
    </div>
  );
}
