/**
 * Engineering floor: ten years told as eras, each with the constraint that
 * taught the next era's design instinct. Edit dates/details to match reality.
 */
export interface Era {
  years: string;
  role: string;
  built: string;
  owned: string;
  constraint: string; // the limit that era ran into
  carried: string; // the instinct carried forward into AI work
  stack: string[];
}

export const ERAS: Era[] = [
  {
    years: "Years 1–3",
    role: "Full Stack Engineer",
    built: "Line-of-business web apps end to end: UI, APIs, schema design, deploys.",
    owned: "Features, then whole modules — first on-call rotations.",
    constraint: "Every abstraction I didn't understand eventually paged me at 2am.",
    carried: "Read the layer below you. In AI systems: never treat the model as magic — trace the tokens.",
    stack: ["JavaScript", "SQL", "REST", "CI/CD"],
  },
  {
    years: "Years 3–6",
    role: "Senior Full Stack Engineer",
    built: "Service decomposition of a monolith; internal platforms other teams built on.",
    owned: "System boundaries, API contracts, database performance.",
    constraint: "Distributed systems fail in the seams, not the services.",
    carried: "Contracts and idempotency first. In AI systems: agent handoffs are the seams — checkpoint them.",
    stack: ["React", "TypeScript", "Node/Python services", "PostgreSQL", "Docker"],
  },
  {
    years: "Years 6–8",
    role: "Lead Engineer / Cloud",
    built: "AWS re-platforming: queues, autoscaling, observability as a discipline.",
    owned: "Architecture reviews, cost, reliability targets, mentoring.",
    constraint: "You can't fix what you can't see — dashboards became a design input, not an afterthought.",
    carried: "Observability-first. This entire portfolio renders its own telemetry because that's how I think.",
    stack: ["AWS", "Terraform", "Event-driven design", "Postgres at scale"],
  },
  {
    years: "Years 8–10",
    role: "AI Architect",
    built: "Knowledge Buddy, Helix, SQL Builder, Duplicate Claim Analyzer — retrieval systems, multi-agent orchestration, LLM guardrails.",
    owned: "AI architecture end to end: model choice, retrieval design, eval, cost, failure modes.",
    constraint: "LLMs are probabilistic components inside deterministic obligations.",
    carried: "Architect the system so the model is allowed to be wrong — validation gates, fallbacks, human loops.",
    stack: ["LangGraph", "RAG", "pgvector", "FastAPI", "Multi-agent systems", "Evals"],
  },
];
