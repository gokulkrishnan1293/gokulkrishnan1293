import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, Trace, ArchNode } from "../content/projects";

const KIND_COLOR: Record<string, string> = {
  client: "#d7dfee",
  gateway: "#6fd3ff",
  service: "#6fd3ff",
  agent: "#ffb86f",
  llm: "#c79bff",
  store: "#67e8b0",
  vector: "#67e8b0",
  graph: "#ffd166",
  cache: "#67e8b0",
  queue: "#ff9ecb",
  external: "#5c6a85",
};

interface HopState {
  idx: number; // current hop being animated, -1 idle
  done: boolean;
}

/**
 * A living architecture diagram: data-driven SVG, nodes pulse when a trace
 * hop touches them, the moving packet carries the hop's latency label.
 * This is an observability view, not a poster.
 */
export function ArchDiagram({ project }: { project: Project }) {
  const [trace, setTrace] = useState<Trace | null>(null);
  const [hop, setHop] = useState<HopState>({ idx: -1, done: false });
  const [selected, setSelected] = useState<ArchNode | null>(null);
  const timeouts = useRef<number[]>([]);

  const nodeMap = useMemo(() => new Map(project.nodes.map((n) => [n.id, n])), [project]);

  const play = (t: Trace) => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setTrace(t);
    setHop({ idx: -1, done: false });
    let acc = 300;
    t.hops.forEach((h, i) => {
      timeouts.current.push(window.setTimeout(() => setHop({ idx: i, done: false }), acc));
      // playback duration ∝ log of real latency so 1500ms timeouts don't bore
      acc += Math.max(420, Math.min(1100, 300 + Math.log2(h.ms + 1) * 110));
    });
    timeouts.current.push(window.setTimeout(() => setHop({ idx: t.hops.length - 1, done: true }), acc));
  };

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);
  useEffect(() => {
    setTrace(null);
    setHop({ idx: -1, done: false });
    setSelected(null);
  }, [project.id]);

  const activeHop = trace && hop.idx >= 0 ? trace.hops[hop.idx] : null;
  const touched = new Set<string>();
  if (trace && hop.idx >= 0) {
    for (let i = 0; i <= hop.idx; i++) {
      touched.add(trace.hops[i].from);
      touched.add(trace.hops[i].to);
    }
  }

  return (
    <div className="space-y-3">
      {/* trace controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label mr-1">SEND A REQUEST:</span>
        {project.traces.map((t) => (
          <button
            key={t.id}
            onClick={() => play(t)}
            className={`cursor-pointer border px-3 py-1.5 font-mono text-[10px] tracking-wide transition-colors ${
              trace?.id === t.id
                ? "border-accent/60 text-accent"
                : t.kind === "failure"
                  ? "border-err/30 text-err/80 hover:border-err/60"
                  : "border-line text-dim hover:border-accent/40 hover:text-accent"
            }`}
          >
            {t.kind === "failure" ? "⚠ " : "▸ "}
            {t.name}
          </button>
        ))}
      </div>

      <div className="hairline relative mx-auto w-full max-w-3xl bg-void/60">
        <svg viewBox="0 0 100 60" className="block w-full" style={{ minHeight: 280 }}>
          {/* edges */}
          {project.edges.map((e, i) => {
            const a = nodeMap.get(e.from)!;
            const b = nodeMap.get(e.to)!;
            const isActive =
              activeHop &&
              ((activeHop.from === e.from && activeHop.to === e.to) ||
                (activeHop.from === e.to && activeHop.to === e.from));
            return (
              <g key={i}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={isActive ? (activeHop!.status === "err" ? "#ff7a7a" : activeHop!.status === "warn" ? "#ffd166" : "#6fd3ff") : "#1c2436"}
                  strokeWidth={isActive ? 0.5 : 0.25}
                  className={isActive ? "edge-flow" : ""}
                />
                {e.label && (
                  <text
                    x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 1}
                    fill="#5c6a85" fontSize="1.7" textAnchor="middle" fontFamily="JetBrains Mono, monospace"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* packet */}
          <AnimatePresence>
            {activeHop && (
              <motion.g key={`${trace!.id}-${hop.idx}`}>
                <motion.circle
                  r={0.9}
                  fill={activeHop.status === "err" ? "#ff7a7a" : activeHop.status === "warn" ? "#ffd166" : "#6fd3ff"}
                  initial={{ cx: nodeMap.get(activeHop.from)!.x, cy: nodeMap.get(activeHop.from)!.y, opacity: 0 }}
                  animate={{ cx: nodeMap.get(activeHop.to)!.x, cy: nodeMap.get(activeHop.to)!.y, opacity: [0, 1, 1] }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* nodes */}
          {project.nodes.map((n) => {
            const c = KIND_COLOR[n.kind];
            const on = touched.has(n.id);
            const isCurrent = activeHop && (activeHop.from === n.id || activeHop.to === n.id);
            return (
              <g
                key={n.id}
                onClick={() => setSelected(n)}
                className="cursor-pointer"
                opacity={trace && !on ? 0.35 : 1}
              >
                <rect
                  x={n.x - 8} y={n.y - 3.4} width={16} height={6.8} rx={0.6}
                  fill="#0a0e18"
                  stroke={c}
                  strokeWidth={isCurrent ? 0.45 : 0.2}
                  strokeOpacity={on || !trace ? 0.9 : 0.4}
                />
                {isCurrent && (
                  <rect x={n.x - 8} y={n.y - 3.4} width={16} height={6.8} rx={0.6} fill={c} opacity={0.12}>
                    <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1s" repeatCount="indefinite" />
                  </rect>
                )}
                <text x={n.x} y={n.y - 0.4} fill="#d7dfee" fontSize="2.1" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={500}>
                  {n.label}
                </text>
                {n.sub && (
                  <text x={n.x} y={n.y + 2.2} fill="#5c6a85" fontSize="1.6" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* node inspector */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass absolute right-2 top-2 w-56 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-fg">{selected.label}</span>
                <button onClick={() => setSelected(null)} className="cursor-pointer text-dim hover:text-fg">×</button>
              </div>
              <div className="mt-1 font-mono text-[10px] text-dim">
                kind: {selected.kind}
                {selected.sub && <div>{selected.sub}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* hop log */}
      <div className="hairline max-h-44 overflow-y-auto scroll-thin bg-panel/60 p-3 font-mono text-[10px] leading-relaxed">
        {!trace && <span className="text-dim">Pick a request above — the trace log renders here like a real APM tool.</span>}
        {trace &&
          trace.hops.slice(0, hop.idx + 1).map((h, i) => (
            <div key={i} className="flex gap-2">
              <span className={h.status === "err" ? "text-err" : h.status === "warn" ? "text-warn" : "text-ok"}>
                {h.status === "err" ? "✗" : h.status === "warn" ? "⚠" : "✓"}
              </span>
              <span className="w-36 shrink-0 text-dim">
                {nodeMap.get(h.from)?.label} → {nodeMap.get(h.to)?.label}
              </span>
              <span className="w-14 shrink-0 text-right tabular-nums text-accent">{h.ms}ms</span>
              <span className="text-fg/60">{h.note}</span>
            </div>
          ))}
        {trace && hop.done && (
          <div className="mt-2 border-t border-line pt-2 text-accent-2">◈ {trace.moral}</div>
        )}
      </div>
    </div>
  );
}
