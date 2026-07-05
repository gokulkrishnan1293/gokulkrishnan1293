/**
 * The retrieval corpus: curated knowledge about the architect, embedded at
 * module load (real vectors, computed in your browser right now).
 *
 * `links` form the knowledge-graph layer: retrieval hits are expanded along
 * these edges exactly the way Knowledge Buddy expands doc→owner→system links.
 */
import { embed } from "./embedding";
import { PROJECTS } from "../content/projects";
import { ERAS } from "../content/journey";
import { FAILURES } from "../content/failures";
import { FUTURE } from "../content/future";
import { profile } from "../content/profile";

export interface Doc {
  id: string;
  title: string;
  text: string;
  tags: string[];
  district: string;
  /** graph edges to other doc ids */
  links: string[];
  /** optional deep-link action the UI can offer */
  action?: { kind: "project" | "floor" | "district"; target: string; label: string };
}

const docs: Doc[] = [];

// ── Identity & philosophy ───────────────────────────────────────────────
docs.push(
  {
    id: "who",
    title: "Who is Gokul Krishnan",
    text: `${profile.name} is a full stack engineer with ten years of experience who evolved into an AI architect. He designs intelligent systems: retrieval augmented generation, multi-agent orchestration with LangGraph, LLM guardrails, and the cloud architecture underneath them. Stack: ${[...profile.stack.ai, ...profile.stack.backend].join(", ")}.`,
    tags: ["identity", "experience", "career", "background", "about"],
    district: "core",
    links: ["philosophy", "era-4", "contact"],
  },
  {
    id: "philosophy",
    title: "Architecture philosophy",
    text: "Architect the system so the model is allowed to be wrong. LLMs are probabilistic components inside deterministic obligations — so every design leads with validation gates, graceful degradation, bounded loops, checkpointed state, observability and honest failure modes. Complexity must be purchased with a problem. Transparency is the product.",
    tags: ["philosophy", "principles", "design", "approach", "reliability"],
    district: "core",
    links: ["who", "fail-swarm", "adr-arcos"],
  },
  {
    id: "contact",
    title: "Contact and collaboration",
    text: `To discuss roles, systems or ideas: email ${profile.email}, GitHub ${profile.github}, LinkedIn ${profile.linkedin}. The final floor of this experience — the roof — is the invitation: the next district of the city has not been built yet.`,
    tags: ["contact", "email", "hire", "reach", "collaborate", "linkedin", "github"],
    district: "core",
    links: ["who"],
    action: { kind: "floor", target: "future", label: "Visit the Future District" },
  },
);

// ── Projects (summary + decision docs) ─────────────────────────────────
for (const p of PROJECTS) {
  docs.push({
    id: p.id,
    title: p.name,
    text: `${p.name}: ${p.oneLiner} Impact: ${p.impact} Built with ${p.stack.join(", ")}.`,
    tags: [p.district, "project", p.status, ...p.stack.map((s) => s.toLowerCase())],
    district: p.district,
    links: [`${p.id}-adr`, "philosophy"],
    action: { kind: "project", target: p.id, label: `Open ${p.name} living architecture` },
  });
  docs.push({
    id: `${p.id}-adr`,
    title: `${p.name} — key decision`,
    text: `${p.adr.title}. Problem: ${p.adr.problem} Decision: ${p.adr.decision} Outcome: ${p.adr.outcome}`,
    tags: ["adr", "decision", "tradeoff", "architecture", p.id],
    district: "architecture",
    links: [p.id],
    action: { kind: "floor", target: "decisions", label: "Read the full ADR" },
  });
}

// RAG-specific doc so "show me your RAG projects" retrieves crisply
docs.push({
  id: "rag-overview",
  title: "RAG work overview",
  text: "Retrieval augmented generation systems: Knowledge Buddy is the flagship RAG product — layered retrieval with pgvector HNSW vector search, knowledge-graph expansion for freshness and supersession, cross-encoder reranking, grounded synthesis with enforced citations, and a full-text fallback when the vector store degrades. SQL Builder applies retrieval to database schemas. This portfolio itself runs a live retrieval pipeline in the browser.",
  tags: ["rag", "retrieval", "vector", "embeddings", "pgvector", "search", "semantic"],
  district: "ai",
  links: ["knowledge-buddy", "sql-builder", "adr-arcos"],
  action: { kind: "district", target: "ai", label: "Fly to the AI District" },
});

docs.push({
  id: "agents-overview",
  title: "Multi-agent systems work",
  text: "Multi-agent orchestration: Helix is a supervisor/specialist engine on LangGraph — explicit graphs, Postgres checkpointing, resumable runs, budget-bounded loops, and human approval gates as first-class nodes. Design position: multi-agent is a distributed-systems problem wearing an AI costume; free-form agent swarms were tried and rejected after real cost incidents.",
  tags: ["agents", "multi-agent", "langgraph", "orchestration", "supervisor", "autonomous"],
  district: "ai",
  links: ["helix", "fail-swarm"],
  action: { kind: "project", target: "helix", label: "Open Helix living architecture" },
});

// ── Experience eras ─────────────────────────────────────────────────────
ERAS.forEach((e, i) => {
  docs.push({
    id: `era-${i + 1}`,
    title: `${e.years}: ${e.role}`,
    text: `${e.years} as ${e.role}. Built: ${e.built} Owned: ${e.owned} Lesson carried forward: ${e.carried}`,
    tags: ["experience", "career", "history", "journey", ...e.stack.map((s) => s.toLowerCase())],
    district: "engineering",
    links: i > 0 ? [`era-${i}`] : ["who"],
    action: { kind: "floor", target: "engineering", label: "Visit the Engineering floor" },
  });
});

// ── Failures ────────────────────────────────────────────────────────────
const failIds = ["fail-swarm", "fail-stale", "fail-demo", "fail-micro"];
FAILURES.forEach((f, i) => {
  docs.push({
    id: failIds[i],
    title: `Failure: ${f.title}`,
    text: `${f.story} Root cause: ${f.rootCause} Permanent change: ${f.scar}`,
    tags: ["failure", "mistake", "lesson", "postmortem", "learned"],
    district: "architecture",
    links: ["philosophy"],
    action: { kind: "floor", target: "failures", label: "Open the demolition log" },
  });
});

// ── Future ──────────────────────────────────────────────────────────────
for (const u of FUTURE) {
  docs.push({
    id: u.id,
    title: `Future: ${u.name}`,
    text: `${u.name} (${u.stage}). ${u.premise} Why: ${u.why}`,
    tags: ["future", "roadmap", "vision", "idea", "startup", u.stage],
    district: "future",
    links: ["philosophy"],
    action: { kind: "floor", target: "future", label: "Visit the Future District" },
  });
}

// ── Portfolio meta ──────────────────────────────────────────────────────
docs.push({
  id: "adr-arcos",
  title: "How this portfolio works",
  text: "ARC//OS runs a genuine retrieval pipeline in the browser: 256-dimension feature-hash embeddings, cosine top-k vector search, knowledge-graph expansion, a scored intent planner, and template synthesis with citations. No servers, no API keys, no faked numbers — measured latencies are real, and the production swap (learned embeddings, LangGraph, an LLM) is documented in the ADR.",
  tags: ["portfolio", "arcos", "meta", "how", "website", "pipeline", "transparency"],
  district: "core",
  links: ["philosophy", "rag-overview"],
  action: { kind: "floor", target: "decisions", label: "Read the ARC//OS ADR" },
});

export interface EmbeddedDoc extends Doc {
  vec: Float32Array;
}

/** Embedded at module load — check the timing panel: this really runs. */
export const CORPUS: EmbeddedDoc[] = docs.map((d) => ({
  ...d,
  vec: embed(`${d.title}. ${d.text} ${d.tags.join(" ")}`),
}));

export const docById = (id: string) => CORPUS.find((d) => d.id === id);
