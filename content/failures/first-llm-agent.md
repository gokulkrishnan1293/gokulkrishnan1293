---
title: The Autonomous Agent That Wasn't
label: "Restarted → became the copilot."
year: "2024"
---

## What it was

My first agent build: fully autonomous, no human in the loop, meant to
process work end-to-end. It worked in the demo. It could not be trusted
in production — and trust, it turns out, was the whole product.

## Why it died

Full autonomy meant every rare failure was a production incident.
Stakeholders didn't need the agent to be perfect; they needed to see
what it was about to do. I had built for autonomy when the requirement
was legibility.

## What it taught me

It restarted as a human-approval copilot — the same engine, gated —
and that version shipped. The lesson rewired how I build with AI:
autonomy is earned in production, granted step by step, never assumed.
