---
title: Agentic Claims Copilot
featured: true
order: 1
status: shipped
period: "2025"
card:
  label: CLAIMS-AI
  color: "#e07a3f"
  media: usb
summary: An agentic AI copilot that reads, reasons over, and drafts responses for insurance claims — with humans approving every step.
stack: [Claude API, Python, LangGraph-style orchestration, AWS, Postgres]
sketch:
  - "One agent per claim stage, not one giant agent"
  - "Tool calls → typed, audited, replayable"
  - "Human approval gate before anything leaves the system"
retro:
  wentWell:
    - "Typed tool contracts made agent failures debuggable instead of mystical"
    - "Shipping a narrow stage-1 agent first earned trust for the rest"
  couldImprove:
    - "Underestimated eval effort — should have built the harness before the agent"
    - "Too much prompt logic lived in code at first; moved it to versioned config late"
---

## The problem

Claims processors spent hours per case reading unstructured documents,
cross-referencing policy rules, and drafting responses. The volume was
growing; the team wasn't.

## The build

An agentic pipeline where each claim stage (intake → coverage check →
assessment → draft response) is a separate agent with typed tools and
a strict audit trail. Every outbound action requires human approval —
the copilot drafts, the human decides.

## Architecture decisions

- **One agent per stage** instead of one monolithic agent: smaller prompts,
  testable in isolation, failures stay contained.
- **Typed tool contracts** — every tool call is schema-validated and logged,
  so a bad run can be replayed step by step.
- **Eval harness as CI** — golden claims run on every prompt change.

## Trade-offs

Latency was sacrificed for auditability: every step persists before the
next begins. For claims, correctness beats speed — a wrong payout costs
more than a slow one.
