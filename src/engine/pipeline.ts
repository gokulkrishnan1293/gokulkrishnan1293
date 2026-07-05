/**
 * The live pipeline. Every stage does real work and is timed with
 * performance.now(). Playback pacing (small awaits between stages so humans
 * can watch) is separate from — and labelled differently to — measured
 * compute time. Nothing here calls a network.
 */
import { embed, cosine, DIMS } from "./embedding";
import { CORPUS, docById, type EmbeddedDoc } from "./corpus";

export type StageId =
  | "parse"
  | "embed"
  | "search"
  | "graph"
  | "plan"
  | "tools"
  | "synthesize";

export interface StageEvent {
  stage: StageId;
  status: "start" | "done";
  /** real measured compute ms for this stage (on 'done') */
  measuredMs?: number;
  detail?: string;
  data?: unknown;
}

export interface Retrieved {
  doc: EmbeddedDoc;
  score: number;
  via: "vector" | "graph";
}

export interface IntentScore {
  intent: string;
  score: number;
}

export interface ToolCall {
  tool: string;
  args: string;
  result: string;
  ms: number;
}

export interface PipelineResult {
  query: string;
  intents: IntentScore[];
  topIntent: string;
  queryVecSample: number[];
  retrieved: Retrieved[];
  toolCalls: ToolCall[];
  answer: AnswerBlock[];
  confidence: number;
  refused: boolean;
  actions: { kind: string; target: string; label: string }[];
  totalMeasuredMs: number;
}

export interface AnswerBlock {
  text: string;
  cite?: number; // index into retrieved (1-based)
}

const INTENT_LEXICON: Record<string, string[]> = {
  projects: ["project", "built", "build", "portfolio", "work", "system", "systems", "show", "product"],
  rag: ["rag", "retrieval", "vector", "embedding", "embeddings", "search", "semantic", "pgvector", "knowledge", "documents"],
  agents: ["agent", "agents", "multi", "langgraph", "orchestration", "autonomous", "supervisor", "swarm"],
  experience: ["experience", "career", "years", "background", "history", "journey", "resume", "cv", "full", "stack"],
  decisions: ["decision", "adr", "tradeoff", "trade", "architecture", "why", "chose", "design", "alternative"],
  failures: ["failure", "failures", "mistake", "mistakes", "wrong", "failed", "lesson", "lessons", "regret", "broke"],
  future: ["future", "next", "vision", "roadmap", "idea", "ideas", "startup", "building", "plan"],
  contact: ["contact", "email", "hire", "hiring", "reach", "talk", "connect", "linkedin", "github", "available"],
  meta: ["this", "site", "website", "pipeline", "how", "works", "arcos", "browser", "real", "fake"],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function scoreIntents(query: string): IntentScore[] {
  const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const scores = Object.entries(INTENT_LEXICON).map(([intent, lex]) => {
    let s = 0;
    for (const w of words) if (lex.includes(w)) s += 1;
    return { intent, score: Math.round((s / Math.max(words.length, 1)) * 100) / 100 };
  });
  return scores.sort((a, b) => b.score - a.score);
}

const LEADS: Record<string, string> = {
  projects: "Here's what the city contains on that.",
  rag: "Retrieval systems are the AI District's foundation. From the corpus:",
  agents: "Multi-agent work, retrieved from the AI District:",
  experience: "The Engineering District holds the ten-year record:",
  decisions: "Pulling from the Architecture District's decision records:",
  failures: "The demolition log is public here. Retrieved:",
  future: "From the Future District — cranes still up:",
  contact: "Direct lines, retrieved from the core:",
  meta: "Happy to explain my own internals — transparency is the point:",
  generic: "Best matches in the corpus:",
};

export async function runPipeline(
  query: string,
  onEvent: (e: StageEvent) => void,
  opts: { pace?: number } = {},
): Promise<PipelineResult> {
  const pace = opts.pace ?? 260; // playback pacing between stages (labelled as such in UI)
  let totalMeasuredMs = 0;
  const timed = <T,>(fn: () => T): { out: T; ms: number } => {
    const t = performance.now();
    const out = fn();
    const ms = Math.max(0.01, Math.round((performance.now() - t) * 100) / 100);
    totalMeasuredMs += ms;
    return { out, ms };
  };

  // 1 · PARSE / INTENT --------------------------------------------------
  onEvent({ stage: "parse", status: "start" });
  const { out: intents, ms: parseMs } = timed(() => scoreIntents(query));
  const topIntent = intents[0].score > 0 ? intents[0].intent : "generic";
  onEvent({
    stage: "parse",
    status: "done",
    measuredMs: parseMs,
    detail: `intent → ${topIntent}`,
    data: intents.filter((i) => i.score > 0).slice(0, 4),
  });
  await sleep(pace);

  // 2 · EMBED -----------------------------------------------------------
  onEvent({ stage: "embed", status: "start" });
  const { out: qvec, ms: embedMs } = timed(() => embed(query));
  const sample = Array.from(qvec.slice(0, 8)).map((v) => Math.round(v * 1000) / 1000);
  onEvent({
    stage: "embed",
    status: "done",
    measuredMs: embedMs,
    detail: `${DIMS}-dim · feature-hash trigrams · L2-normalized`,
    data: sample,
  });
  await sleep(pace);

  // 3 · HYBRID SEARCH ---------------------------------------------------
  // Same recipe as production retrieval: dense similarity for meaning,
  // lexical overlap for precision, fused into one score.
  onEvent({ stage: "search", status: "start" });
  const STOP = new Set(["the", "a", "an", "is", "are", "was", "of", "to", "in", "on", "for", "and", "or", "me", "my", "your", "you", "do", "does", "what", "how", "show", "tell", "about", "with", "can", "i", "we"]);
  const qWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
  const { out: hits, ms: searchMs } = timed(() => {
    const scored = CORPUS.map((doc) => {
      const dense = cosine(qvec, doc.vec);
      const hay = `${doc.title} ${doc.tags.join(" ")} ${doc.text}`.toLowerCase();
      const hitCount = qWords.filter((w) => hay.includes(w)).length;
      const lexical = qWords.length ? hitCount / qWords.length : 0;
      const score = Math.round((0.55 * dense + 0.45 * lexical) * 1000) / 1000;
      return { doc, score, via: "vector" as const };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  });
  onEvent({
    stage: "search",
    status: "done",
    measuredMs: searchMs,
    detail: `hybrid (0.55·cosine + 0.45·lexical) over ${CORPUS.length} docs`,
    data: hits.map((h) => ({ id: h.doc.id, title: h.doc.title, score: h.score })),
  });
  await sleep(pace);

  const refused = hits[0].score < 0.12;

  // 4 · GRAPH EXPANSION ---------------------------------------------------
  onEvent({ stage: "graph", status: "start" });
  const { out: expanded, ms: graphMs } = timed(() => {
    if (refused) return hits.slice(0, 3);
    const seen = new Set(hits.map((h) => h.doc.id));
    const extra: Retrieved[] = [];
    for (const h of hits.slice(0, 3)) {
      for (const link of h.doc.links) {
        if (seen.has(link)) continue;
        const d = docById(link);
        if (!d) continue;
        seen.add(link);
        // graph hits inherit a damped score from their parent — same
        // freshness/authority idea as Knowledge Buddy's expansion
        extra.push({ doc: d, score: Math.round(h.score * 0.72 * 1000) / 1000, via: "graph" });
      }
    }
    return [...hits, ...extra.slice(0, 3)].sort((a, b) => b.score - a.score).slice(0, 6);
  });
  onEvent({
    stage: "graph",
    status: "done",
    measuredMs: graphMs,
    detail: refused
      ? "skipped — low retrieval confidence"
      : `+${expanded.filter((e) => e.via === "graph").length} docs via link expansion`,
    data: expanded.filter((e) => e.via === "graph").map((e) => e.doc.id),
  });
  await sleep(pace);

  // 5 · PLAN ---------------------------------------------------------------
  onEvent({ stage: "plan", status: "start" });
  const { out: plan, ms: planMs } = timed(() => {
    if (refused)
      return ["acknowledge_gap", "explain_corpus_bounds", "offer_navigation"];
    const steps = ["select_lead(" + topIntent + ")"];
    for (const r of expanded.slice(0, 3)) steps.push(`cite(${r.doc.id})`);
    if (expanded.some((r) => r.doc.action)) steps.push("attach_actions");
    steps.push("compose_answer");
    return steps;
  });
  onEvent({ stage: "plan", status: "done", measuredMs: planMs, detail: `${plan.length} steps`, data: plan });
  await sleep(pace);

  // 6 · TOOL CALLS ---------------------------------------------------------
  onEvent({ stage: "tools", status: "start" });
  const toolCalls: ToolCall[] = [];
  const { ms: toolsMs } = timed(() => {
    for (const r of expanded.slice(0, 3)) {
      const t = performance.now();
      const snippet = r.doc.text.slice(0, 180);
      toolCalls.push({
        tool: "fetch_doc",
        args: `{ id: "${r.doc.id}" }`,
        result: `${snippet.length} chars · ${r.doc.district} district`,
        ms: Math.round((performance.now() - t) * 100) / 100,
      });
    }
    const actions = expanded.map((r) => r.doc.action).filter(Boolean);
    if (actions.length) {
      toolCalls.push({
        tool: "resolve_actions",
        args: `{ count: ${actions.length} }`,
        result: actions.map((a) => a!.kind + ":" + a!.target).join(", "),
        ms: 0.02,
      });
    }
  });
  onEvent({ stage: "tools", status: "done", measuredMs: toolsMs, data: toolCalls });
  await sleep(pace);

  // 7 · SYNTHESIZE -----------------------------------------------------------
  onEvent({ stage: "synthesize", status: "start" });
  const { out: answer, ms: synthMs } = timed<AnswerBlock[]>(() => {
    if (refused) {
      return [
        { text: `Honest answer: that's outside my corpus. Top hybrid score was ${hits[0].score.toFixed(3)} — below my 0.12 threshold, so I won't improvise.` },
        { text: "I'm a deterministic retrieval pipeline over a curated corpus about one architect — by design, I refuse rather than hallucinate. The production systems this demonstrates (Knowledge Buddy) do the same with a bigger brain." },
        { text: "Try asking about: RAG projects, multi-agent systems, architecture decisions, failures, the ten-year journey, or how this pipeline works." },
      ];
    }
    const blocks: AnswerBlock[] = [{ text: LEADS[topIntent] ?? LEADS.generic }];
    expanded.slice(0, 3).forEach((r, i) => {
      const firstTwo = r.doc.text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
      blocks.push({ text: firstTwo, cite: i + 1 });
    });
    return blocks;
  });
  const confidence = Math.min(0.99, Math.max(0, Math.round(hits[0].score * 1600) / 1000));
  onEvent({
    stage: "synthesize",
    status: "done",
    measuredMs: synthMs,
    detail: refused ? "refusal composed" : `answer composed · confidence ${confidence.toFixed(2)}`,
  });

  const actions = refused
    ? []
    : (expanded
        .map((r) => r.doc.action)
        .filter(Boolean)
        .filter((a, i, arr) => arr.findIndex((b) => b!.target === a!.target) === i)
        .slice(0, 3) as { kind: string; target: string; label: string }[]);

  return {
    query,
    intents,
    topIntent,
    queryVecSample: sample,
    retrieved: expanded,
    toolCalls,
    answer,
    confidence,
    refused,
    actions,
    totalMeasuredMs: Math.round(totalMeasuredMs * 100) / 100,
  };
}
