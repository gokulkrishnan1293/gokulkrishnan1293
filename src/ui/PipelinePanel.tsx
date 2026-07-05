import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  runPipeline,
  type PipelineResult,
  type StageEvent,
  type StageId,
} from "../engine/pipeline";
import { CORPUS } from "../engine/corpus";
import { DIMS } from "../engine/embedding";
import { useArc, type FloorId } from "../state/store";
import { floorById } from "../content/floors";

const STAGES: { id: StageId; label: string; prod: string }[] = [
  { id: "parse", label: "Intent", prod: "prod: LLM router" },
  { id: "embed", label: "Embedding", prod: "prod: 1536-d learned" },
  { id: "search", label: "Hybrid Search", prod: "prod: pgvector HNSW + FTS" },
  { id: "graph", label: "Knowledge Graph", prod: "prod: doc↔owner↔system" },
  { id: "plan", label: "Planner", prod: "prod: LangGraph node" },
  { id: "tools", label: "Tool Calls", prod: "prod: typed tool layer" },
  { id: "synthesize", label: "Response", prod: "prod: grounded LLM" },
];

const SUGGESTIONS = [
  "Show me your RAG projects",
  "How do you design multi-agent systems?",
  "What's your biggest failure?",
  "Why should a founder hire you?",
  "How does this pipeline work?",
];

type StageState = Record<string, { status: "idle" | "running" | "done"; ms?: number; detail?: string }>;

export function PipelinePanel() {
  const [query, setQuery] = useState("");
  const [stages, setStages] = useState<StageState>({});
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [running, setRunning] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const { log, markPipelineRun, flyTo, openFloor, setFocusProject } = useArc();
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (q: string) => {
    if (!q.trim() || running) return;
    setRunning(true);
    setResult(null);
    setStages({});
    log("PIPELINE", `query: "${q.slice(0, 48)}"`);
    const onEvent = (e: StageEvent) => {
      setStages((s) => ({
        ...s,
        [e.stage]: {
          status: e.status === "start" ? "running" : "done",
          ms: e.measuredMs,
          detail: e.detail,
        },
      }));
    };
    const res = await runPipeline(q, onEvent);
    setResult(res);
    setRunning(false);
    markPipelineRun();
    log("PIPELINE", res.refused ? `refused · sim ${res.retrieved[0]?.score.toFixed(2)}` : `answered · conf ${res.confidence.toFixed(2)} · ${res.totalMeasuredMs}ms compute`);
  };

  const act = (a: { kind: string; target: string; label: string }) => {
    if (a.kind === "district") flyTo(a.target);
    else if (a.kind === "project") {
      setFocusProject(a.target);
      openFloor("living-systems", floorById("ai-architecture").index, floorById("living-systems").index);
    } else if (a.kind === "floor") {
      openFloor(a.target as FloorId, floorById("ai-architecture").index, floorById(a.target as FloorId).index);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      {/* LEFT: query + stage rail + answer */}
      <div className="min-w-0 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(query);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the city anything about this architect…"
            className="hairline w-full bg-panel px-4 py-3 font-mono text-[13px] text-fg placeholder:text-dim focus:border-accent/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={running}
            className="hairline cursor-pointer px-5 font-mono text-[11px] tracking-[0.2em] text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
          >
            {running ? "RUNNING" : "RUN ▸"}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                run(s);
              }}
              disabled={running}
              className="cursor-pointer border border-line px-2.5 py-1 font-mono text-[10px] text-dim transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stage rail */}
        <div className="hairline bg-panel/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="hud-label">PIPELINE · EVERY STAGE REAL, EVERY LATENCY MEASURED</span>
            {result && (
              <span className="font-mono text-[10px] text-ok">
                Σ compute {result.totalMeasuredMs}ms
              </span>
            )}
          </div>
          <div className="space-y-px">
            {STAGES.map((st, i) => {
              const s = stages[st.id];
              return (
                <div key={st.id} className="flex items-center gap-3 py-1.5">
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                      !s ? "bg-line" : s.status === "running" ? "pulse-dot bg-accent" : "bg-ok"
                    }`}
                  />
                  <div className="w-32 shrink-0 font-mono text-[11px] text-fg/90">{st.label}</div>
                  <div className="hidden w-40 shrink-0 font-mono text-[9px] text-dim/70 sm:block">{st.prod}</div>
                  <div className="min-w-0 flex-1 truncate font-mono text-[10px] text-dim">
                    {s?.detail ?? (s?.status === "running" ? "…" : "")}
                  </div>
                  <div className="w-16 shrink-0 text-right font-mono text-[10px] tabular-nums text-accent">
                    {s?.ms !== undefined ? `${s.ms}ms` : ""}
                  </div>
                  {i < STAGES.length - 1 && <div className="hidden" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Answer */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`hairline p-5 ${result.refused ? "border-warn/40 bg-warn/[0.03]" : "bg-panel/60"}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="hud-label">{result.refused ? "HONEST REFUSAL" : "GROUNDED RESPONSE"}</span>
                <span className="font-mono text-[10px] text-dim">
                  confidence{" "}
                  <span className={result.confidence > 0.4 ? "text-ok" : "text-warn"}>
                    {result.refused ? "—" : result.confidence.toFixed(2)}
                  </span>
                </span>
              </div>
              <div className="space-y-2.5 text-[14px] font-light leading-relaxed text-fg/95">
                {result.answer.map((b, i) => (
                  <p key={i}>
                    {b.text}
                    {b.cite && <sup className="ml-1 font-mono text-[10px] text-accent">[{b.cite}]</sup>}
                  </p>
                ))}
              </div>
              {result.actions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.actions.map((a) => (
                    <button
                      key={a.target + a.kind}
                      onClick={() => act(a)}
                      className="cursor-pointer border border-accent/40 px-3 py-1.5 font-mono text-[10px] tracking-wider text-accent transition-colors hover:bg-accent/10"
                    >
                      {a.kind === "district" ? "◈ " : "→ "}
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowJson(!showJson)}
                className="mt-4 cursor-pointer font-mono text-[10px] text-dim underline-offset-4 hover:text-accent hover:underline"
              >
                {showJson ? "hide" : "open"} raw trace JSON
              </button>
              {showJson && (
                <pre className="scroll-thin mt-2 max-h-64 overflow-auto border border-line bg-void p-3 font-mono text-[10px] leading-relaxed text-fg/70">
                  {JSON.stringify(
                    {
                      intents: result.intents.filter((i) => i.score > 0),
                      queryVecFirst8: result.queryVecSample,
                      retrieved: result.retrieved.map((r) => ({ id: r.doc.id, score: r.score, via: r.via })),
                      toolCalls: result.toolCalls,
                      totalMeasuredMs: result.totalMeasuredMs,
                    },
                    null,
                    2,
                  )}
                </pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT: evidence + honesty */}
      <div className="space-y-4">
        <div className="hairline bg-panel/60 p-4">
          <div className="hud-label mb-3">RETRIEVED EVIDENCE · HYBRID SCORES</div>
          {!result && (
            <p className="font-mono text-[11px] leading-relaxed text-dim">
              {CORPUS.length} documents embedded at {DIMS} dimensions when this page loaded.
              Run a query to see retrieval scored live.
            </p>
          )}
          <div className="space-y-2">
            {result?.retrieved.map((r, i) => (
              <div key={r.doc.id} className="border-l-2 py-1 pl-3" style={{ borderColor: r.via === "graph" ? "#ffb86f" : "#6fd3ff" }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] text-accent">[{i + 1}]</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-fg/90">{r.doc.title}</span>
                  <span className="font-mono text-[10px] tabular-nums text-dim">{r.score.toFixed(3)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="h-0.5 flex-1 bg-line">
                    <div
                      className="h-full"
                      style={{ width: `${Math.min(r.score * 130, 100)}%`, background: r.via === "graph" ? "#ffb86f" : "#6fd3ff" }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-dim">{r.via === "graph" ? "graph hop" : "vector"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline border-accent-2/20 bg-panel/60 p-4">
          <div className="hud-label mb-2 text-accent-2">TRANSPARENCY — WHAT THIS ACTUALLY IS</div>
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-fg/70">
            <li>▸ Real pipeline, zero network calls: feature-hash embeddings, hybrid dense+lexical scoring, graph expansion, scored planner — all in your browser. Check DevTools.</li>
            <li>▸ Latencies are measured with performance.now(); the stage-by-stage playback is paced for legibility, the ms numbers are the real compute.</li>
            <li>▸ Synthesis is template composition, not an LLM — so it cites or refuses, never hallucinates.</li>
            <li>▸ Production versions (Knowledge Buddy, Helix) swap in learned embeddings, pgvector, LangGraph and a real LLM. Same architecture, bigger brain.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
