import type { PersonaId } from "../state/store";

export interface Persona {
  id: PersonaId;
  label: string;
  sub: string;
  /** What ELEV.AI says after the choice — proof it adapted. */
  ack: string;
  /** The lens applied to every floor. */
  lens: string;
  /** Persona-specific emphasis lines used across floors. */
  emphasis: {
    engineering: string;
    pipeline: string;
    systems: string;
    decisions: string;
  };
}

export const PERSONAS: Persona[] = [
  {
    id: "recruiter",
    label: "Recruiter",
    sub: "I need signal in 5 minutes",
    ack: "Understood. I will prioritize impact and outcomes, keep floors short, and surface a summary you can forward.",
    lens: "IMPACT",
    emphasis: {
      engineering:
        "Read this floor as a delivery record: a decade of shipped systems in production, moving up the stack from UI to AI orchestration.",
      pipeline:
        "You don't need to trace the internals — the point is that this pipeline is real, running in your browser, built by the person you're evaluating.",
      systems:
        "Each diagram is a production system. Watch one request trace and you've seen the depth. The captions state business outcomes.",
      decisions:
        "ADRs are what senior engineers write. Skim one 'Outcome' section — that's the signal.",
    },
  },
  {
    id: "em",
    label: "Engineering Manager",
    sub: "I care how you work, not just what you built",
    ack: "Noted. I will surface decision quality, failure handling, and how work gets communicated — the things you actually hire for.",
    lens: "JUDGMENT",
    emphasis: {
      engineering:
        "Look for scope growth: individual contributor → owning systems → owning trade-offs. Each era lists what was owned, not just used.",
      pipeline:
        "Note what is honestly labelled: what runs locally, what is simulated, what production does differently. That honesty is the working style.",
      systems:
        "The failure paths are drawn in — retries, fallbacks, dead-letter queues. Systems are presented the way they behave, not the way slides behave.",
      decisions:
        "Every record ends with 'What I would change today.' Hindsight admitted in writing is the culture signal.",
    },
  },
  {
    id: "engineer",
    label: "AI Engineer",
    sub: "Show me the internals",
    ack: "Good. Gloves off — full traces, embeddings, scores, graph hops. Break things if you can.",
    lens: "IMPLEMENTATION",
    emphasis: {
      engineering:
        "The stack list is the boring part. The interesting part is which layers were built from scratch vs. glued — that's called out per era.",
      pipeline:
        "This is a real pipeline: 256-dim feature-hash embeddings, cosine top-k, a scored planner, graph expansion. Open the trace JSON. Try adversarial queries.",
      systems:
        "Every node in the diagrams is clickable — protocols, backpressure, and cache policies are in the hop notes.",
      decisions:
        "Read 'Alternatives considered' first. The rejected options tell you more than the chosen ones.",
    },
  },
  {
    id: "architect",
    label: "Architect",
    sub: "Trade-offs or it didn't happen",
    ack: "Then we speak the same language. I will lead with constraints, alternatives, and the costs of every decision.",
    lens: "TRADE-OFFS",
    emphasis: {
      engineering:
        "Ten years condensed to the constraint each era imposed — the point is how each layer's limits taught the next layer's design.",
      pipeline:
        "The interesting question here isn't the retrieval — it's why this pipeline is deterministic and client-side, and what that trade bought. The transparency panel argues it.",
      systems:
        "The diagrams encode topology decisions: where the queue sits, why the graph DB is beside — not behind — the vector store. Trace a request and disagree.",
      decisions:
        "This floor is the portfolio. Everything else is supporting evidence.",
    },
  },
  {
    id: "founder",
    label: "Founder",
    sub: "Can you build the thing?",
    ack: "Then let's skip credentials. I'll lead with products, speed of iteration, and the roadmap of what gets built next.",
    lens: "PRODUCT",
    emphasis: {
      engineering:
        "Ten years of shipping means the boring parts — auth, billing, deploys, on-call — are already muscle memory. That's velocity you don't pay tuition for.",
      pipeline:
        "This entire experience — 3D city, live pipeline, adaptive narrative — was architected and shipped by one person. That's the pitch.",
      systems:
        "Each system here started as a v1 that shipped in weeks, then earned its complexity. The ADRs show which complexity was refused.",
      decisions:
        "Read the 'Constraints' sections — they're all about doing it with less: less budget, less time, less headcount.",
    },
  },
];

export const personaById = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!;
