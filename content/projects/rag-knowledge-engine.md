---
title: RAG Knowledge Engine
featured: true
order: 3
status: shipped
period: "2024–2025"
card:
  label: RAG-ENGINE
  color: "#5aa06f"
  media: usb
summary: A retrieval-augmented answer engine over years of scattered enterprise documentation — with citations or it didn't happen.
stack: [Python, vector search, Claude API, AWS Lambda, React]
sketch:
  - "Chunking follows document structure, not token counts"
  - "Retrieval quality is THE product — the LLM is the easy part"
  - "Every answer carries its sources; no citation → no claim"
retro:
  wentWell:
    - "Citation-first design killed hallucination complaints almost entirely"
    - "Retrieval eval set (200 real questions) caught every regression"
  couldImprove:
    - "First chunking strategy was naive token-splitting — rebuilt it twice"
    - "Ingestion pipeline should have been idempotent from the start"
---

## The problem

Years of documentation across wikis, PDFs, and drives. Nobody could
find anything; everyone re-asked the same questions. Search returned
documents — people needed answers.

## The build

A RAG pipeline: structure-aware ingestion → embeddings + vector search →
answer synthesis with mandatory citations. If the engine can't cite it,
it says "I don't know" — that rule built more trust than any accuracy
number.

## Architecture decisions

- **Structure-aware chunking** — headings, tables, and sections survive
  as retrieval units; token-window splitting destroyed meaning.
- **Retrieval evals over model evals** — a fixed set of real employee
  questions, scored on retrieval hit-rate, run on every change.
- **Citations as a hard contract** — the UI renders nothing unsourced.

## Trade-offs

Refusing to answer without sources means the engine sometimes says
"I don't know" when a human could guess. That honesty is the feature.
