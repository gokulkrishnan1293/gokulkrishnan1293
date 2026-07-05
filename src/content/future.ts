/**
 * Future District: what's under construction and what's still a blueprint.
 */
export interface FutureItem {
  id: string;
  name: string;
  stage: "construction" | "blueprint" | "research";
  premise: string;
  why: string;
}

export const FUTURE: FutureItem[] = [
  {
    id: "u1",
    name: "Agent Observability Standard",
    stage: "construction",
    premise:
      "OpenTelemetry-style tracing semantics for agent runs: spans for plans, tool calls, verifications and human gates — vendor-neutral, replayable.",
    why: "Every team I've watched adopt agents rebuilds the same tracing UI badly. The observability instinct from my cloud years says this becomes infrastructure.",
  },
  {
    id: "u2",
    name: "Eval-as-Contract CI",
    stage: "construction",
    premise:
      "Eval suites that gate deploys the way tests gate merges: a prompt or model change ships only if the eval delta is inside the contract.",
    why: "The 'demo that was too good' failure, industrialized into a fix. Accuracy needs a denominator in CI, not in a slide.",
  },
  {
    id: "u3",
    name: "Institutional Memory Graph",
    stage: "blueprint",
    premise:
      "Knowledge Buddy's endgame: an org's decisions, owners, and supersession chains as a first-class graph that agents query before they act — 'why is it like this?' answered with provenance.",
    why: "RAG over documents answers 'what'. Organizations bleed money on 'why'. The graph layer is where that lives.",
  },
  {
    id: "u4",
    name: "On-device pipeline synthesis",
    stage: "research",
    premise:
      "Swap this portfolio's template synthesis for a WebGPU local model — same exposed pipeline, generative prose, still zero servers.",
    why: "The ARC//OS ADR names it as the planned upgrade. The architecture was designed for the swap.",
  },
];
