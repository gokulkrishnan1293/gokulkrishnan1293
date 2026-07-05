/**
 * Living-architecture data for real systems.
 *
 * NOTE TO FUTURE EDITOR (probably you, Gokul):
 * Numbers marked with "~" are representative figures for the experience —
 * replace them with your real production metrics where you can. The
 * topology, trade-offs and failure paths are the load-bearing content.
 */

export type NodeKind =
  | "client"
  | "gateway"
  | "service"
  | "agent"
  | "llm"
  | "store"
  | "vector"
  | "graph"
  | "cache"
  | "queue"
  | "external";

export interface ArchNode {
  id: string;
  label: string;
  sub?: string;
  kind: NodeKind;
  x: number; // 0..100 viewBox coords
  y: number; // 0..60
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
}

export interface TraceHop {
  from: string;
  to: string;
  ms: number; // representative latency for the animation
  note: string;
  status?: "ok" | "warn" | "err";
}

export interface Trace {
  id: string;
  name: string;
  kind: "happy" | "failure";
  hops: TraceHop[];
  moral: string; // what this trace proves
}

export interface Adr {
  id: string;
  title: string;
  status: "Accepted" | "Superseded" | "Proposed";
  problem: string;
  constraints: string[];
  alternatives: { option: string; verdict: string }[];
  decision: string;
  tradeoffs: string[];
  outcome: string;
  lessons: string[];
  changeToday: string;
}

export interface Project {
  id: string;
  name: string;
  district: "ai" | "engineering" | "architecture" | "future";
  status: "production" | "construction" | "concept";
  oneLiner: string;
  impact: string;
  stack: string[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  traces: Trace[];
  adr: Adr;
}

export const PROJECTS: Project[] = [
  // ── KNOWLEDGE BUDDY ────────────────────────────────────────────────────
  {
    id: "knowledge-buddy",
    name: "Knowledge Buddy",
    district: "ai",
    status: "production",
    oneLiner: "Enterprise RAG assistant that answers from institutional knowledge — with citations, or it refuses.",
    impact: "Cut internal policy/process lookups from minutes of searching to a cited answer in seconds (~70% deflection of repeat questions).",
    stack: ["LangGraph", "FastAPI", "pgvector", "PostgreSQL", "Redis", "AWS", "React"],
    nodes: [
      { id: "client", label: "Client", sub: "React", kind: "client", x: 6, y: 30 },
      { id: "gw", label: "API Gateway", sub: "FastAPI · SSE", kind: "gateway", x: 21, y: 30 },
      { id: "cache", label: "Semantic Cache", sub: "Redis", kind: "cache", x: 21, y: 10 },
      { id: "orch", label: "Orchestrator", sub: "LangGraph", kind: "agent", x: 38, y: 30 },
      { id: "emb", label: "Embedder", sub: "batch + cache", kind: "service", x: 54, y: 12 },
      { id: "vec", label: "Vector Store", sub: "pgvector · HNSW", kind: "vector", x: 71, y: 12 },
      { id: "kg", label: "Knowledge Graph", sub: "doc ↔ owner ↔ system", kind: "graph", x: 71, y: 30 },
      { id: "rerank", label: "Reranker", sub: "cross-encoder", kind: "service", x: 71, y: 48 },
      { id: "llm", label: "LLM", sub: "grounded synthesis", kind: "llm", x: 54, y: 48 },
      { id: "ing", label: "Ingestion Workers", sub: "chunk · enrich", kind: "queue", x: 88, y: 12 },
      { id: "docs", label: "Doc Sources", sub: "wiki · S3 · tickets", kind: "external", x: 88, y: 30 },
      { id: "pg", label: "PostgreSQL", sub: "audit + feedback", kind: "store", x: 38, y: 50 },
    ],
    edges: [
      { from: "client", to: "gw" },
      { from: "gw", to: "cache", label: "similarity ≥ .97" },
      { from: "gw", to: "orch" },
      { from: "orch", to: "emb" },
      { from: "emb", to: "vec", label: "top-24" },
      { from: "vec", to: "kg", label: "expand" },
      { from: "kg", to: "rerank" },
      { from: "rerank", to: "llm", label: "top-6" },
      { from: "llm", to: "gw", label: "stream" },
      { from: "docs", to: "ing" },
      { from: "ing", to: "vec" },
      { from: "orch", to: "pg", label: "audit" },
    ],
    traces: [
      {
        id: "kb-happy",
        name: "Policy question → cited answer",
        kind: "happy",
        moral: "Retrieval is layered: vector recall is cheap and wide, graph expansion adds authority context, the reranker earns its latency by cutting the LLM's context in half.",
        hops: [
          { from: "client", to: "gw", ms: 12, note: "POST /ask · auth via JWT" },
          { from: "gw", to: "cache", ms: 4, note: "semantic cache probe — miss (sim 0.81 < 0.97)" },
          { from: "gw", to: "orch", ms: 3, note: "LangGraph run created, state persisted" },
          { from: "orch", to: "emb", ms: 38, note: "query embedded · 1×1536-dim" },
          { from: "emb", to: "vec", ms: 21, note: "HNSW top-24 · recall-tuned ef_search=96" },
          { from: "vec", to: "kg", ms: 14, note: "expand: owning team, doc freshness, superseded-by links" },
          { from: "kg", to: "rerank", ms: 55, note: "cross-encoder 24 → 6 · confidence 0.92/0.88/0.79…" },
          { from: "rerank", to: "llm", ms: 640, note: "grounded synthesis · citations enforced by schema" },
          { from: "llm", to: "gw", ms: 9, note: "SSE stream to client · first token at ~810ms" },
        ],
      },
      {
        id: "kb-degraded",
        name: "Vector store degraded → graceful degradation",
        kind: "failure",
        moral: "The system's real design shows in its failure path: answer quality degrades one notch, availability doesn't.",
        hops: [
          { from: "client", to: "gw", ms: 12, note: "POST /ask" },
          { from: "gw", to: "orch", ms: 3, note: "run created" },
          { from: "orch", to: "emb", ms: 36, note: "query embedded" },
          { from: "emb", to: "vec", ms: 1500, note: "timeout @1.5s — circuit opens", status: "err" },
          { from: "orch", to: "pg", ms: 42, note: "fallback: Postgres full-text search (tsvector)", status: "warn" },
          { from: "pg", to: "llm", ms: 700, note: "synthesis with 'reduced confidence' banner", status: "warn" },
          { from: "llm", to: "gw", ms: 9, note: "answer delivered, flagged degraded · incident logged" },
        ],
      },
    ],
    adr: {
      id: "adr-kb",
      title: "pgvector inside PostgreSQL instead of a dedicated vector database",
      status: "Accepted",
      problem:
        "Knowledge Buddy needed semantic retrieval over ~2M chunks with strict row-level access control, and the answer audit trail had to be transactionally tied to retrieval results.",
      constraints: [
        "Enterprise environment: every new datastore is a security review + an on-call burden.",
        "Access control lives in Postgres row policies — duplicating it in a second store is a correctness risk.",
        "Corpus is millions, not billions, of vectors.",
        "Team of 3; ops budget effectively zero.",
      ],
      alternatives: [
        { option: "Pinecone / managed vector DB", verdict: "Best raw ANN performance, but ACLs must be mirrored and audit joins become network calls. Rejected: correctness > milliseconds at this scale." },
        { option: "OpenSearch k-NN", verdict: "Already approved internally, but hybrid scoring tuning was a project in itself. Kept as fallback path." },
        { option: "pgvector in the existing Postgres", verdict: "One store, one ACL model, retrieval + audit in one transaction. Chosen." },
      ],
      decision:
        "Store embeddings in pgvector (HNSW) beside the relational data. Same row-level security governs chunks and their vectors. Full-text tsvector kept as the degradation path.",
      tradeoffs: [
        "ANN latency ~2–3× a dedicated store at p99 — acceptable under 100ms budget.",
        "Index rebuilds compete with OLTP load — mitigated with a replica for ingestion.",
        "Scaling ceiling ~10M vectors before sharding pain; documented as a revisit trigger.",
      ],
      outcome:
        "Zero security exceptions, one datastore on-call instead of two, and the fallback path has absorbed two real incidents without a user-facing outage.",
      lessons: [
        "The best vector database is often the database you already run.",
        "Design the degraded mode first; it is the honest SLA.",
      ],
      changeToday:
        "I'd evaluate Postgres 17's improved HNSW build parallelism and consider partitioned indexes per tenant from day one.",
    },
  },

  // ── HELIX ─────────────────────────────────────────────────────────────
  {
    id: "helix",
    name: "Helix",
    district: "ai",
    status: "production",
    oneLiner: "Multi-agent orchestration engine: a supervisor decomposes work, specialist agents execute, every step is checkpointed and resumable.",
    impact: "Turned week-long analyst workflows into supervised agent runs completing in hours, with human approval gates where it matters.",
    stack: ["LangGraph", "FastAPI", "PostgreSQL", "Redis Streams", "Docker", "AWS"],
    nodes: [
      { id: "client", label: "Operator UI", sub: "React", kind: "client", x: 6, y: 30 },
      { id: "gw", label: "Control API", sub: "FastAPI", kind: "gateway", x: 20, y: 30 },
      { id: "sup", label: "Supervisor", sub: "plan · route · verify", kind: "agent", x: 37, y: 30 },
      { id: "ck", label: "Checkpointer", sub: "Postgres · resumable", kind: "store", x: 37, y: 52 },
      { id: "bus", label: "Event Bus", sub: "Redis Streams", kind: "queue", x: 54, y: 30 },
      { id: "a1", label: "Research Agent", sub: "search + RAG tools", kind: "agent", x: 71, y: 10 },
      { id: "a2", label: "Analysis Agent", sub: "code interpreter", kind: "agent", x: 71, y: 30 },
      { id: "a3", label: "Writer Agent", sub: "templated output", kind: "agent", x: 71, y: 50 },
      { id: "tools", label: "Tool Layer", sub: "typed · rate-limited", kind: "service", x: 88, y: 20 },
      { id: "llm", label: "LLM Pool", sub: "per-agent model choice", kind: "llm", x: 88, y: 42 },
      { id: "human", label: "Approval Gate", sub: "human-in-the-loop", kind: "external", x: 20, y: 10 },
    ],
    edges: [
      { from: "client", to: "gw" },
      { from: "gw", to: "sup" },
      { from: "sup", to: "ck", label: "every step" },
      { from: "sup", to: "bus" },
      { from: "bus", to: "a1" },
      { from: "bus", to: "a2" },
      { from: "bus", to: "a3" },
      { from: "a1", to: "tools" },
      { from: "a2", to: "tools" },
      { from: "a1", to: "llm" },
      { from: "a2", to: "llm" },
      { from: "a3", to: "llm" },
      { from: "sup", to: "human", label: "risk gate" },
    ],
    traces: [
      {
        id: "hx-happy",
        name: "Brief → decomposed → parallel agents → verified report",
        kind: "happy",
        moral: "The supervisor never does the work — it plans, routes, and verifies. Specialists stay small and testable.",
        hops: [
          { from: "client", to: "gw", ms: 10, note: "submit brief · run_id issued" },
          { from: "gw", to: "sup", ms: 5, note: "supervisor loads playbook" },
          { from: "sup", to: "ck", ms: 8, note: "plan checkpointed: 3 tasks, DAG edges" },
          { from: "sup", to: "bus", ms: 4, note: "fan-out: research ∥ analysis" },
          { from: "bus", to: "a1", ms: 3, note: "research agent claims task" },
          { from: "a1", to: "tools", ms: 420, note: "6 tool calls · retrieval + web" },
          { from: "bus", to: "a2", ms: 3, note: "analysis agent claims task" },
          { from: "a2", to: "llm", ms: 900, note: "code-interpreter loop · 2 iterations" },
          { from: "sup", to: "bus", ms: 4, note: "join: outputs verified against plan schema" },
          { from: "bus", to: "a3", ms: 3, note: "writer agent composes report" },
          { from: "a3", to: "llm", ms: 780, note: "draft + citation check" },
          { from: "sup", to: "human", ms: 15, note: "approval gate: confidence 0.84 < 0.9 → human review" },
        ],
      },
      {
        id: "hx-crash",
        name: "Worker dies mid-run → resume from checkpoint",
        kind: "failure",
        moral: "Multi-agent systems are distributed systems. Helix treats agent state like database state: durable, versioned, resumable.",
        hops: [
          { from: "bus", to: "a2", ms: 3, note: "analysis agent processing step 4/7" },
          { from: "a2", to: "llm", ms: 300, note: "container OOM-killed mid-call", status: "err" },
          { from: "bus", to: "sup", ms: 5, note: "heartbeat missed ×3 → task marked orphaned", status: "warn" },
          { from: "sup", to: "ck", ms: 12, note: "load last checkpoint (step 3 complete)" },
          { from: "sup", to: "bus", ms: 4, note: "task re-queued with idempotency key" },
          { from: "bus", to: "a2", ms: 3, note: "fresh worker resumes at step 4 — no duplicate side effects" },
        ],
      },
    ],
    adr: {
      id: "adr-hx",
      title: "Supervisor/specialist topology over a free-form agent swarm",
      status: "Accepted",
      problem:
        "Automating analyst workflows needed multiple cooperating agents, but early free-form agent-to-agent chat produced unpredictable costs, loops, and unauditable decisions.",
      constraints: [
        "Every run must be explainable to a compliance reviewer after the fact.",
        "Token budget per run is capped; runaway loops are a financial bug.",
        "Humans must be able to approve or veto at defined risk points.",
      ],
      alternatives: [
        { option: "Free-form multi-agent conversation (agents talk to agents)", verdict: "Emergent, occasionally brilliant, unauditable and unbounded. Rejected after cost spikes in week two." },
        { option: "Single mega-agent with many tools", verdict: "Simple, but context window becomes the god object and one bad tool call poisons the whole run. Rejected." },
        { option: "Supervisor + typed specialists on an explicit graph", verdict: "Boring, legible, testable. Chosen." },
      ],
      decision:
        "LangGraph with a supervisor node owning plan/route/verify, specialists as pure task executors, Postgres checkpointing every transition, and approval gates as first-class graph nodes.",
      tradeoffs: [
        "Less 'emergent' capability — the graph can only do what the playbook allows.",
        "Supervisor prompt is a single point of quality; it gets the strongest model and the most eval attention.",
        "Checkpointing every step costs ~8ms/transition — bought back many times over in resumability.",
      ],
      outcome:
        "Predictable cost per run (±15%), zero unexplainable outputs in review, and crash recovery that has never lost a run.",
      lessons: [
        "Multi-agent is a distributed-systems problem wearing an AI costume.",
        "Auditability is a feature you architect in, not a log you grep later.",
      ],
      changeToday:
        "Push more verification onto small cheap models running in parallel with execution, instead of a single verify step at join time.",
    },
  },

  // ── SQL BUILDER ───────────────────────────────────────────────────────
  {
    id: "sql-builder",
    name: "SQL Builder",
    district: "engineering",
    status: "production",
    oneLiner: "Natural language → validated SQL: schema-aware retrieval, sandboxed execution, and a self-correction loop that repairs its own mistakes.",
    impact: "Non-SQL users self-serve ~80% of ad-hoc reporting questions; every generated query is validated before it touches real data.",
    stack: ["FastAPI", "LangGraph", "PostgreSQL", "pgvector", "Docker"],
    nodes: [
      { id: "client", label: "Analyst UI", kind: "client", x: 6, y: 30 },
      { id: "gw", label: "API", sub: "FastAPI", kind: "gateway", x: 20, y: 30 },
      { id: "schema", label: "Schema Index", sub: "tables · joins · synonyms", kind: "vector", x: 37, y: 12 },
      { id: "gen", label: "SQL Generator", sub: "few-shot + constraints", kind: "llm", x: 37, y: 30 },
      { id: "val", label: "Validator", sub: "EXPLAIN · linter · ACL", kind: "service", x: 54, y: 30 },
      { id: "sand", label: "Sandbox", sub: "read-only replica · LIMIT", kind: "store", x: 71, y: 30 },
      { id: "repair", label: "Repair Loop", sub: "error → revised SQL", kind: "agent", x: 54, y: 10 },
      { id: "res", label: "Result Shaper", sub: "chart hints · summary", kind: "service", x: 71, y: 50 },
      { id: "audit", label: "Query Audit", sub: "Postgres", kind: "store", x: 37, y: 50 },
    ],
    edges: [
      { from: "client", to: "gw" },
      { from: "gw", to: "schema", label: "top-k tables" },
      { from: "schema", to: "gen" },
      { from: "gen", to: "val" },
      { from: "val", to: "sand", label: "pass" },
      { from: "val", to: "repair", label: "fail" },
      { from: "repair", to: "gen", label: "≤3 attempts" },
      { from: "sand", to: "res" },
      { from: "res", to: "gw" },
      { from: "gw", to: "audit" },
    ],
    traces: [
      {
        id: "sql-repair",
        name: "Ambiguous question → failed validation → self-repair → result",
        kind: "failure",
        moral: "The generator is allowed to be wrong; the system is not. Validation + bounded repair beats trying to make one prompt perfect.",
        hops: [
          { from: "client", to: "gw", ms: 9, note: '"revenue by region last quarter" — fiscal or calendar?' },
          { from: "gw", to: "schema", ms: 28, note: "schema retrieval: 4 candidate tables, join graph attached" },
          { from: "schema", to: "gen", ms: 610, note: "SQL drafted using fiscal_quarter (per column docs)" },
          { from: "gen", to: "val", ms: 35, note: "EXPLAIN fails: ambiguous column 'region'", status: "err" },
          { from: "val", to: "repair", ms: 6, note: "error + AST context packaged for repair" },
          { from: "repair", to: "gen", ms: 540, note: "attempt 2: table alias added, join corrected", status: "warn" },
          { from: "gen", to: "val", ms: 31, note: "EXPLAIN passes · cost under budget · ACL check ok" },
          { from: "val", to: "sand", ms: 88, note: "executed on read replica, LIMIT 1000 enforced" },
          { from: "sand", to: "res", ms: 22, note: "results shaped, assumption surfaced: 'used fiscal quarters'" },
        ],
      },
    ],
    adr: {
      id: "adr-sql",
      title: "Validate-and-repair loop instead of trusting single-shot generation",
      status: "Accepted",
      problem:
        "LLM-generated SQL was right ~85% of the time — which means catastrophically wrong 15% of the time, silently, against production-shaped data.",
      constraints: [
        "Generated SQL must never mutate data or scan unbounded tables.",
        "Users are non-technical; a wrong-but-plausible table of numbers is worse than an error.",
        "Latency budget: interactive (<5s p90).",
      ],
      alternatives: [
        { option: "Better prompting / more few-shot examples", verdict: "Improved accuracy asymptotically; never removed the silent-wrong tail. Rejected as the safety story." },
        { option: "Human review of every query", verdict: "Kills the self-serve value proposition. Rejected." },
        { option: "Deterministic validation gate + bounded LLM repair loop", verdict: "Turns model errors into visible, recoverable events. Chosen." },
      ],
      decision:
        "Every candidate query passes EXPLAIN, a cost ceiling, an AST linter (no writes, no cross-schema joins), and row-ACL checks before touching a read-only replica. Failures loop back with structured error context, max 3 attempts, then honest surrender.",
      tradeoffs: [
        "Repair loop adds 0.5–1.5s on ~20% of queries.",
        "AST linter maintenance is real work as the schema evolves.",
        "Honest surrender (attempt limit) means some questions end in 'I can't do this safely' — by design.",
      ],
      outcome:
        "Zero data incidents since launch; user trust measurably higher because assumptions are surfaced with every answer.",
      lessons: [
        "Ship the guardrail, not the accuracy claim.",
        "Structured error context makes LLM self-repair dramatically more effective than raw retries.",
      ],
      changeToday:
        "Add semantic diffing between attempts so the repair loop can detect it's oscillating instead of converging.",
    },
  },

  // ── DUPLICATE CLAIM ANALYZER ──────────────────────────────────────────
  {
    id: "claim-analyzer",
    name: "Duplicate Claim Analyzer",
    district: "engineering",
    status: "production",
    oneLiner: "Hybrid ML + rules engine that catches duplicate insurance claims humans and exact-match systems both miss.",
    impact: "Flags near-duplicate claims (resubmissions, unbundled procedures, cross-provider repeats) with a review queue — precision tuned so reviewers trust the queue.",
    stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "AWS", "Airflow"],
    nodes: [
      { id: "intake", label: "Claim Intake", sub: "batch + streaming", kind: "external", x: 6, y: 30 },
      { id: "norm", label: "Normalizer", sub: "codes · providers · dates", kind: "service", x: 21, y: 30 },
      { id: "block", label: "Blocking Stage", sub: "candidate pairs only", kind: "service", x: 38, y: 30 },
      { id: "emb", label: "Claim Embedder", sub: "structured → vector", kind: "vector", x: 55, y: 12 },
      { id: "rules", label: "Rules Engine", sub: "domain heuristics", kind: "service", x: 55, y: 48 },
      { id: "score", label: "Pair Scorer", sub: "ensemble · calibrated", kind: "agent", x: 72, y: 30 },
      { id: "queue", label: "Review Queue", sub: "ranked · explained", kind: "queue", x: 88, y: 30 },
      { id: "fb", label: "Feedback Store", sub: "reviewer verdicts", kind: "store", x: 72, y: 52 },
    ],
    edges: [
      { from: "intake", to: "norm" },
      { from: "norm", to: "block", label: "10⁹ → 10⁴ pairs" },
      { from: "block", to: "emb" },
      { from: "block", to: "rules" },
      { from: "emb", to: "score" },
      { from: "rules", to: "score" },
      { from: "score", to: "queue", label: "score > τ" },
      { from: "queue", to: "fb", label: "verdicts" },
      { from: "fb", to: "score", label: "recalibrate" },
    ],
    traces: [
      {
        id: "dc-happy",
        name: "Nightly batch → 3 candidate duplicates surfaced",
        kind: "happy",
        moral: "The interesting engineering is the blocking stage: comparing everything to everything is O(n²) — the pipeline only pays for pairs that could plausibly match.",
        hops: [
          { from: "intake", to: "norm", ms: 45, note: "84k claims · codes normalized, providers entity-resolved" },
          { from: "norm", to: "block", ms: 120, note: "blocking keys: member+window, provider+procedure family" },
          { from: "block", to: "emb", ms: 210, note: "14k candidate pairs embedded (not 3.5B)" },
          { from: "block", to: "rules", ms: 60, note: "rules pass: modifiers, resubmission codes, COB flags" },
          { from: "emb", to: "score", ms: 90, note: "ensemble: cosine + rules + history · calibrated" },
          { from: "score", to: "queue", ms: 12, note: "37 pairs above threshold · each with a why-explanation" },
          { from: "queue", to: "fb", ms: 5, note: "reviewer verdicts feed tomorrow's calibration" },
        ],
      },
    ],
    adr: {
      id: "adr-dc",
      title: "Hybrid rules + embeddings ensemble instead of a pure ML classifier",
      status: "Accepted",
      problem:
        "Exact-match dedup missed reworded, unbundled and cross-provider duplicates; a pure ML model was unexplainable to auditors and drifted with claim-mix changes.",
      constraints: [
        "Every flag must carry a human-readable explanation (regulatory).",
        "False positives burn reviewer trust fast — precision beats recall here.",
        "Claim volume makes pairwise comparison infeasible without candidate blocking.",
      ],
      alternatives: [
        { option: "Pure gradient-boosted classifier", verdict: "Best offline AUC, but 'the model said so' fails audit. Rejected as sole scorer." },
        { option: "Pure rules engine", verdict: "Explainable but brittle; every new duplicate pattern is a code change. Rejected as sole scorer." },
        { option: "Rules + embedding similarity ensemble with calibrated fusion", verdict: "Rules provide the explanation skeleton, embeddings catch the paraphrase-shaped fraud. Chosen." },
      ],
      decision:
        "Blocking stage cuts the pair space by ~10⁵×, then an ensemble scores each pair: deterministic rules (explainable) + embedding similarity (recall) + member history, fused with isotonic calibration and a reviewer-tuned threshold.",
      tradeoffs: [
        "Two scoring subsystems to maintain instead of one.",
        "Calibration needs a steady diet of reviewer verdicts — the feedback loop is an operational commitment.",
        "Blocking keys encode assumptions; a duplicate that crosses all blocks is invisible by construction (documented, monitored).",
      ],
      outcome:
        "Reviewer queue acceptance rate high enough that the queue is worked daily (the real success metric for any human-in-the-loop system).",
      lessons: [
        "In regulated domains, explainability is an architectural requirement, not a nice-to-have.",
        "The cheapest ML win is usually upstream: normalization and blocking did more than model choice.",
      ],
      changeToday:
        "Replace hand-built blocking keys with learned blocking (trained on reviewer verdicts) while keeping the rules explanation layer.",
    },
  },
];

/** The portfolio's own ADR — shown on the Decisions floor. Meta, deliberately. */
export const PORTFOLIO_ADR: Adr = {
  id: "adr-arcos",
  title: "ARC//OS itself: a real client-side pipeline instead of a hosted LLM demo",
  status: "Accepted",
  problem:
    "This portfolio promises 'don't fake intelligence — expose the internals.' A hosted LLM backend would be the obvious way to demo RAG, but a portfolio must survive years of zero maintenance, zero API budget, and traffic spikes from a single tweet.",
  constraints: [
    "Static hosting only — no server, no keys, no cost per visitor.",
    "Must never silently rot: a dead API demo is worse than no demo.",
    "Every number shown (latency, similarity) must be real, or labelled.",
  ],
  alternatives: [
    { option: "FastAPI + LangGraph backend with a real LLM", verdict: "Most impressive for a week — then a maintenance liability and a monthly bill forever. Rejected for this venue; it's what the production systems it describes are for." },
    { option: "Pre-recorded 'demo' of a pipeline (a video pretending to be live)", verdict: "Fakes intelligence. Violates the core philosophy. Rejected." },
    { option: "A genuine deterministic pipeline running in the browser", verdict: "Smaller model, honest label, runs forever, and the visitor can read every line of it in the repo. Chosen." },
  ],
  decision:
    "Ship a real retrieval pipeline in TypeScript: feature-hash embeddings (256-d), cosine top-k over a curated corpus, knowledge-graph expansion, a scored intent planner, and template synthesis with citations — every stage timed with performance.now() and labelled with exactly what production swaps in (learned embeddings, LangGraph, an actual LLM).",
  tradeoffs: [
    "No generative fluency — answers are composed, not written. The transparency panel says so in bold.",
    "Corpus is small and curated; recall limits are visible and admitted.",
    "The demo undersells LLM skills but oversells nothing — the right failure mode for credibility.",
  ],
  outcome: "You're looking at it. Open DevTools — there are no network calls during a pipeline run.",
  lessons: [
    "An architect's job is matching the system to the venue: static site → static intelligence, honestly labelled.",
    "Transparency converts a smaller system into a stronger claim.",
  ],
  changeToday:
    "When WebGPU-backed local models are ubiquitous, swap the synthesis stage for an on-device LLM — same pipeline, same transparency, better prose.",
};

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);
