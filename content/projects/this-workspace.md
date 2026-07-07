---
title: The Workspace (this site)
featured: false
order: 4
status: building
period: "2026"
card:
  label: WORKSPACE
  color: "#b06fb0"
  media: sd
summary: This portfolio — a 3D workspace that sketches itself in as you scroll. Content lives in git; the room redraws from data.
stack: [React, React Three Fiber, TypeScript, Tailwind, Zustand]
sketch:
  - "Scroll is the film reel; clicks are optional depth"
  - "Sketch → real materialization as the signature effect"
  - "Every word on a surface comes from a YAML/Markdown file"
retro:
  wentWell:
    - "Content-as-data means updating the portfolio is a git commit, not a redesign"
  couldImprove:
    - "v-next: building... (it will never be finished — by design)"
---

## The idea

A portfolio that behaves like its owner: starts as a pencil sketch,
materializes through iteration, and is never quite finished. The room
is a digital twin of my real desk; the story is the real career.

## How it works

A Three.js stage set (10–15 low-poly props) with 2D illustrated content
surfaces mapped onto it. Scroll drives a camera timeline through seven
scenes; every narrative element — journey, skills, projects, even these
words — is loaded from typed content files in git.
