# ARC//OS — Design Document

*The creative and engineering rationale behind this portfolio. Written as it was built,
in the spirit of the brief: capture the thought process, challenge weak ideas, reject
generic patterns.*

---

## 0. The one-sentence brief

> Most AI portfolios try to *look* intelligent. This one should *be* intelligent.

Every decision below was tested against the brief's eight questions — why does it
exist, what capability does it demonstrate, can a recruiter get it in 30 seconds,
can an engineer spend 20 minutes in it. Anything that only looked cool got cut.

---

## 1. The load-bearing creative decisions

### 1.1 The city is a mind, the elevator is the OS
The two GLB assets you supplied set the physical vocabulary: a city block and an
elevator cab. The narrative wraps them exactly as scripted — city fly-through →
tower threshold ("the doors are already open, no lobby") → the elevator as the
*only* navigation system. Floors are chapters, never pages. The final "Contact"
is a rooftop invitation: *"The next district hasn't been built yet."*

### 1.2 Don't fake intelligence — so the AI floor is real
This was the hardest architectural call, and it's documented **in the experience
itself** as an ADR (the meta-ADR on the Decisions floor):

- A hosted FastAPI/LangGraph/LLM backend would demo best for a week, then become
  a maintenance liability and a monthly bill. A portfolio must survive years of
  zero attention. A dead API demo is *worse* than no demo.
- A pre-recorded "pipeline animation" would violate the core philosophy outright.
- **Chosen:** a genuine retrieval pipeline in TypeScript, running entirely in the
  visitor's browser:
  - 256-dim **feature-hash embeddings** (FNV-1a over word/trigram/bigram features,
    signed buckets, L2-normalized) — the same family of trick as Vowpal Wabbit's
    hashing. Real vector math, zero network.
  - **Hybrid search**: `0.55·cosine + 0.45·lexical overlap` — which is honestly
    how production retrieval works too (dense + FTS fusion).
  - **Knowledge-graph expansion** along typed doc links with damped inherited
    scores — mirroring Knowledge Buddy's doc↔owner↔supersession expansion.
  - A **scored intent planner**, visible tool calls, and template synthesis that
    **cites or refuses** — it cannot hallucinate because it cannot generate.
  - Every latency measured with `performance.now()`. The UI explicitly separates
    *measured compute* from *playback pacing* (stages are slowed so humans can
    watch; the ms numbers are real).
- The transparency panel states all of this in the UI. **Transparency converts a
  smaller system into a stronger claim** — that's the thesis of the whole site.

The refusal path is a feature: ask it something off-corpus and it shows you the
sub-threshold score and declines. During verification, "Show me your RAG projects"
initially *refused* (pure-cosine scores were too weak on long docs) — the fix was
upgrading to hybrid scoring, which is exactly the fix production systems make.
The failure and its fix are the same story the Failures floor tells.

### 1.3 Persona adaptation must be provable, not cosmetic
The elevator asks "Who are you?" and then:
- **Floor order changes** (recruiters get Engineering→Living Systems first;
  architects get Decisions first; founders get Future first).
- Every major floor renders a **lens line** — one persona-specific sentence that
  reframes the same content ("Read this floor as a delivery record" vs. "Read
  'Alternatives considered' first").
- ELEV.AI's greeting **remembers**: chapters visited, pipeline runs. The activity
  wall logs real session events with timestamps — the elevator's "AI activity"
  display is the app's actual state store, not decoration.

### 1.4 Projects are ADRs, not cards
Four systems (Knowledge Buddy, Helix, SQL Builder, Duplicate Claim Analyzer) each
ship as:
- a **living architecture diagram** — data-driven SVG with animated request
  traces, per-hop latencies, and *failure traces* (vector store timeout → FTS
  fallback; worker OOM → checkpoint resume; failed SQL validation → bounded
  repair loop). The failure paths are the senior-engineering signal.
- a full **ADR**: problem, constraints, rejected alternatives with verdicts,
  decision, accepted trade-offs, outcome, lessons, and *what I'd change today*.

There is also a **Failures floor** (the demolition log) because scars are where
architecture instincts come from, and a **Future District** for what's under
construction.

### 1.5 Design language
Near-black blue (#05070d), hairline borders, glass panels, JetBrains Mono for
telemetry, Inter for narrative, two accent hues used semantically (cyan = system,
amber = judgment/warning). No particles for their own sake; the only ambient
motion is the city's data-traffic motes and holographic sheen — both slow.
Reduced-motion users get locked shots and crossfades (`prefers-reduced-motion`
is respected in the store).

---

## 2. Engineering decisions worth knowing about

### 2.1 Asset compression before anything else
The source GLBs were 59MB — a broken first impression at any bandwidth. They were
compressed with glTF-Transform (meshopt + 1024px WebP textures):
- city: **25.3MB → 3.7MB** · elevator: **33.9MB → 2.5MB**
- The boot screen's progress bar is driven by drei's `useProgress` — the real
  download, not a timer.

Originals remain at the repo root as source assets; the app loads
`public/models/*.glb`.

### 2.2 Self-calibrating 3D (the assets can't be trusted, so don't)
Sketchfab exports have arbitrary pivots, scales and axis bakes. Everything is
normalized at runtime (`useNormalizedModel`): centered, grounded at y=0, scaled
to a known radius. All camera choreography is authored in that normalized space.

More interestingly, **district anchors are computed, not hand-placed**: at load,
the scene finds the tallest well-separated towers in the model and binds the six
districts to their rooftops. Beacons, labels, the intro's destination tower and
the "fly to district" camera all derive from those anchors — so the annotation
layer survives an asset swap. (First implementation used hand-guessed coordinates;
the AI District beacon landed in a park. Computed anchors fixed it — the same
lesson as ADR-driven design: don't hardcode what you can derive.)

### 2.3 One canvas, two scenes, one phase machine
`boot → intro → threshold → persona → ride ⇄ floor ⇄ cityFly → finale`
(zustand store, `src/state/store.ts`). City and elevator scenes mount exclusively;
the swap hides behind the door-flood flash. The elevator's travel effect is HUD
motion (counter sweep + light streaks + camera tremor) rather than moving
geometry — which is how real elevators *feel*: you read the display, not the walls.

### 2.4 The elevator model's own animation
The GLB ships with a door animation; it plays once on arrival (slowed, clamped)
— the "doors are already open" beat uses the asset's real animation.

### 2.5 Verification was visual, not vibes
The whole journey was driven headlessly with Playwright (SwiftShader WebGL) and
screenshotted at every phase. Bugs found and fixed this way:
- retrieval refusing on-corpus queries (→ hybrid scoring),
- elevator camera starting inside a wall (→ camera scouting shots → fixed eye),
- finale camera top-down over unlit rooftops (→ wide oblique orbit),
- district approach from the key-light's shadow side (→ approach from lit quadrant),
- floor content unreadable over the cab (→ radial scrim),
- beacons anchored to grass (→ runtime anchor computation).

---

## 3. What was deliberately rejected

| Rejected | Why |
|---|---|
| About/Projects/Skills/Contact pages | The brief forbids them; navigation itself must tell the story. |
| Hosted LLM backend | Dies without maintenance; see the ARC//OS ADR. The pipeline architecture is designed so a WebGPU local model can later replace template synthesis. |
| Fake "AI typing" theatrics | Only the ELEV.AI voice types, as *narration*; pipeline numbers are measured, never animated fictions. |
| Gaming HUD aesthetics, particle storms | Premium OS, not cockpit. Motion only where it carries information. |
| A free-roam city camera | Spectacle without proof; scripted flights keep the narrative and the frame rate. |

---

## 4. Editing guide (for Gokul)

All content is data, separated from layout:

| File | What to edit |
|---|---|
| `src/content/profile.ts` | name, links, stack |
| `src/content/projects.ts` | systems, diagrams, traces, ADRs — metrics marked `~` are representative; replace with production numbers |
| `src/content/journey.ts` | the four eras — put real employers/dates if wanted |
| `src/content/failures.ts` | the demolition log — make these your true scars |
| `src/content/future.ts` | roadmap items |
| `src/content/personas.ts` | lens copy per visitor type |
| `src/engine/corpus.ts` | what the pipeline can answer (docs auto-embed at load) |

`npm i && npm run dev` to develop, `npm run build` to ship (static output in
`dist/` — deployable on Vercel/Netlify/GitHub Pages as-is).

Dev shortcuts: `?phase=ride|persona|finale` jumps phases;
`?elevcam=x,y,z&elevlook=x,y,z` scouts elevator camera angles.

---

## 5. The honest limits (also the roadmap)

- Synthesis is composed, not generated — answers read as assembled evidence.
  Planned upgrade (documented in the Future District): WebGPU on-device LLM for
  the synthesis stage only, same exposed pipeline.
- The corpus is small and curated; recall limits are admitted in-product.
- Mobile gets the full experience but the elevator's two HUD walls collapse to
  one column; a dedicated mobile pass would tighten the floor layouts.
- Narration is text-only by design (autoplay audio is hostile); the Web Speech
  API could be added behind an opt-in toggle.
