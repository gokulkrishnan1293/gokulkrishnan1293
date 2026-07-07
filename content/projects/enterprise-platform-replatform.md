---
title: Enterprise Replatform
featured: true
order: 2
status: shipped
period: "2021–2024"
card:
  label: REPLATFORM
  color: "#4f7fb5"
  media: sd
summary: Led the multi-year re-architecture of a legacy enterprise monolith into a cloud-native platform — while it stayed in production.
stack: [AWS, Terraform, Node, React, event-driven services]
sketch:
  - "Strangler fig: new services wrap the monolith, traffic shifts gradually"
  - "Every team owns its service AND its pipeline"
  - "Platform layer: auth, logging, deploys — solved once"
retro:
  wentWell:
    - "Zero big-bang cutover — users never saw the migration happen"
    - "Platform layer meant team #5 onboarded in days, not months"
  couldImprove:
    - "Kept the old database as shared state too long — the hardest coupling to break"
    - "Should have invested in contract tests between services from day one"
---

## The problem

A business-critical monolith: slow releases, shared everything, every
change a risk. The mandate — modernize it without stopping the business.

## The build

A strangler-fig migration: new cloud-native services built around the
monolith's edges, traffic shifted route by route, until the monolith
was hollowed out. A shared platform layer (auth, observability,
CI/CD, infrastructure modules) so every product team didn't re-solve
the same problems.

## Architecture decisions

- **Strangler fig over rewrite** — the rewrite had been attempted twice
  before and failed. Incremental replacement is slower but survives contact
  with reality.
- **Team-owned pipelines** — architecture isn't real until teams can
  deploy it themselves.
- **Event-driven seams** — new services communicate through events,
  which made the eventual database split possible.

## Trade-offs

Living with the legacy database far longer than anyone liked was the
price of never going down. The coupling was paid off last, deliberately.
