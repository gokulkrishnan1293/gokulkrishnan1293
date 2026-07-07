import { useEffect, useState } from "react";
import { PROJECTS } from "../../content/projects";
import { ArchDiagram } from "../ArchDiagram";
import { useArc } from "../../state/store";

export function SystemsFloor() {
  const focusProject = useArc((s) => s.focusProject);
  const setFocusProject = useArc((s) => s.setFocusProject);
  const [activeId, setActiveId] = useState(focusProject ?? PROJECTS[0].id);

  useEffect(() => {
    if (focusProject) {
      setActiveId(focusProject);
      setFocusProject(null);
    }
  }, [focusProject, setFocusProject]);

  const project = PROJECTS.find((p) => p.id === activeId) ?? PROJECTS[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PROJECTS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`cursor-pointer border px-4 py-2 text-left transition-colors ${
              p.id === activeId ? "border-accent/60 bg-accent/5" : "border-line hover:border-accent/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${p.status === "production" ? "bg-ok" : "bg-warn"}`} />
              <span className="text-[13px] text-fg">{p.name}</span>
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-dim">{p.status}</div>
          </button>
        ))}
      </div>

      <div className="hairline bg-panel/40 p-4">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[16px] text-fg">{project.name}</h2>
          <div className="flex flex-wrap gap-1">
            {project.stack.map((s) => (
              <span key={s} className="border border-line px-1.5 py-0.5 font-mono text-[9px] text-dim">{s}</span>
            ))}
          </div>
        </div>
        <p className="mb-1 max-w-3xl text-[13px] font-light leading-relaxed text-fg/85">{project.oneLiner}</p>
        <p className="mb-4 max-w-3xl font-mono text-[11px] text-ok/90">IMPACT · {project.impact}</p>
        <ArchDiagram project={project} />
      </div>
    </div>
  );
}
