# The Workshop — Storyboard

Portfolio concept: **The Workshop**. A dark creative studio that assembles itself
(pencil-sketch wireframe → real, lit 3D) as the visitor scrolls. Scroll is the film
reel; clicks are optional depth. The story of a builder who climbed every layer of
the stack and never stops iterating.

**Status legend:** ✅ decided · 🔶 leaning / needs confirmation · ⬜ open

---

## Global decisions

- ✅ Concept fusion: **Workshop** (the stage) + **Upgrade** (wireframe-to-real as the
  signature effect) + **Ascent** (the career climb, told as a drawing — not a 3D tower).
- ✅ **The set is a digital twin of Gokul's REAL desk** (reference photos in
  ~/Downloads, prompts in `PROMPTS.md`): white-bezel monitor, vertical RGB
  light-bar speakers (they really glow — Scene 1 is his desk at night), compact
  mechanical keyboard, world-map desk mat, slim game console standing vertically
  + two controllers (blue & black), couple figurine on blue base (personal
  discovery object), black carbon-texture desk. Authentic, not fictional.
- 🔶 Game console = future interactive prop (post-launch easter egg — e.g.
  "run a project pipeline" playful mode). Modeled as separate clickable
  object from day one so nothing blocks this later.
- ✅ Interaction rule: scroll always advances the film; clicking objects opens optional
  depth (case studies, postmortems). No one can get lost.
- ✅ Rendering: **hybrid — simple 3D stage set + 2D illustrated content surfaces.**
  - The world is a **stage set, not a full room**: desk, monitor, speakers, memory
    cards, chair, whiteboard (left wall), framed panorama (right wall), failure
    shelf on the same wall. No fourth wall/ceiling — darkness hides the rest.
    Explore mode = a **~180° arc** (look, lean, zoom, sit) — never turn around.
  - **3D** (Three.js / React Three Fiber): the set only — 10–15 low-poly objects
    (boxes + planes) with hand-drawn sketch-style textures. Needed for perspective
    camera moves, first-person Explore, and the chair-sit. The sketch aesthetic
    rejects realistic materials, so simple 3D is the art direction, not a shortcut.
  - **2D images/HTML**: every content surface — mountain panorama, whiteboard
    sketches/sticky notes, monitor screens (file explorer, projects), frame
    photos — mapped onto the 3D surfaces, all driven by git content files.
  - Flat-image-only (2.5D parallax) was considered and rejected: zooms/pans work,
    but perspective shifts collapse and Explore mode degenerates to hotspots.
    Pre-rendered video rejected earlier for the same reasons + fixed framing.
- ✅ **Two modes only** (first-person walking rejected — game machinery, no payoff):
  - **Tour** — the scroll-driven film.
  - **Overview** — the **light switch** (visible from second zero) flips everything
    on: full set lit + materialized, fixed wide camera with gentle parallax,
    everything clickable. The **monitor is the hub**: "what you can do here"
    directions + **résumé download**. Skips the story entirely — the 30-second
    recruiter path. A plain HTML one-pager survives only as SEO/accessibility
    fallback, not a visible third mode.
- ✅ Progress indicator = a **version number** (`v0.1 → v9.0`), not a progress bar.
  Ends at `v-next: building...`.
- ✅ Sound off by default; tiny toggle. Click-to-begin gate doubles as the browser
  audio-unlock gesture.
- ✅ Case studies / long text always open as clean **2D overlay panels** — never
  read long-form inside the 3D scene.
- ✅ Return visits (localStorage): open straight into **Overview** with a
  "replay intro" option. The cinematic plays once; the portfolio remains.
- ✅ Mobile: same story, same copy, simplified staging (lighter effects,
  portrait-framed camera). Not an afterthought.
- ✅ All narrative content lives in **typed content files in git** (YAML/JSON for
  structured lists, Markdown+frontmatter for long-form), schema-validated at build.
  Cinema (camera timings, light choreography) stays in code, not config.

### Scene arc (each scene answers one question — no overlap)

| # | Scene       | Question it answers            |
|---|-------------|--------------------------------|
| 0 | Ladder      | (loading)                      |
| 1 | Welcome     | who is this?                   |
| 2 | Zoom-out    | where am I? (room sketches in) |
| 3 | The Frame   | where has he been? (the range) |
| 4 | The Desk    | what can he do today?          |
| 5 | Memory cards| what has he built + what did he learn? |
| 6 | Full switch | what's next / contact          |

(Shelf of failures + philosophy whiteboard doodles = Explore-mode discoveries,
not tour stops. Tour stays tight; explorers get rewarded.)

---

## Scene 0 — The Ladder (loading) — ✅ refined

- ✅ Dark background, nothing else.
- ✅ Loading indicator = a **horizontal ladder**; rungs appear one by one as assets
  stream in. 7 rungs — each rung reveals one letter of **W E L C O M E**.
  (The ladder = the climb motif, present from the very first second.)
- ✅ When loaded: a subtle **click / tap hint** ("click to begin"). Nothing autoplays.

## Scene 1 — Welcome (the first light) — ✅ refined

- ✅ The visitor's click **wakes a monitor**; its screen-glow is the first light —
  a cone illuminating only the center of the screen (works portrait & landscape).
  (Chosen over desk lamp / light switch: switch is reserved for the escape hatch.)
- ✅ **Speakers light up at the monitor's sides** (small LED glow) — frames the desk
  as a real setup. Bonus: the speakers ARE the sound toggle — click a speaker to
  turn audio on/off (diegetic setting, no menu needed).
- ✅ A **small character of Gokul** appears in the glow — jumps/waves:
  "Hi, I'm Gokul Krishnan" + role text that **flips through roles in chronological
  order**: Quality Engineer → Frontend Developer → Backend Developer → Cloud →
  Technical Architect → Forward Deployed Engineer (exact list from content file).
  The flip is a 5-second teaser of the whole journey.
- ✅ Roles fully editable: `roles:` list in profile config.
- 🔶 Character style: **hand-sketched avatar** (pencil-line, matches the
  sketch-to-real language) recommended over **pixel art** (Gokul's original idea —
  charming but the only pixel element in a sketch-styled room). Asset is swappable;
  decide before asset production.
- ✅ This scene is the welcome note. Short — visitor has name, face, role arc in
  ~10 seconds, then scroll takes over.

## Scene 2 — The Zoom-out (room sketches itself + mode choice) — ✅ refined

- ✅ On first scroll, camera **pulls back from the monitor glow** and the **stage
  set draws itself as pencil wireframe** — monitor outline → desk → left wall
  (whiteboard) → right wall (framed panorama) → shelf → chair. Only what the
  first-person view can see; the rest stays dark.
- ✅ Key rule: at zoom-out the room is **sketched but dark**. Each section only gets
  its light + materializes (sketch → real) when the story visits it. The full-lit
  room is saved for Scene 7 ("full switch when they all come into one").
- ✅ After the zoom-out, a quiet **mode choice**: **"Take the tour"** (default,
  scroll-driven film) vs **"Turn on the lights"** (→ Overview). Overview also
  reachable anytime via the light switch; return visitors land there directly.
- ✅ The notebook is demoted to a set prop. Its line — *"Every impossible idea
  begins as an unfinished sketch"* — moves to Scene 1 (welcome).

## Scene 3 — The Frame (journey = the mountain range) — ✅ refined

- ✅ Journey lives **inside a framed panorama photo** on the wall: a **mountain
  range**, not a single mountain. The camera **zooms into the frame** (the photo
  fills the view — we dive through it), **travels the trail** as the user scrolls,
  then zooms back out into the room at the end.
- ✅ Why a range (Gokul's insight): *"Every time you go up, you need to come down
  and go up again to climb bigger mountains."* Career changes = descending into
  a valley (beginner again) to summit a higher peak. Up, down, up higher —
  the downs are where the character shows.
- ✅ **Summits** carry era tags: role + company + period + one-liner.
  **Valleys** carry the leaps: one short line each on what he gave up to start
  over (QA→FE, mastery→cloud, architect→AI student…).
- ✅ **Current peak = tallest, summit in clouds, NO flag planted.** The trail
  beyond the current position is **pencil-sketch only** — still climbing,
  next chapter not yet drawn.
- ✅ Scene opens with the "who I am" beat in Gokul's own words (copy file):
  *"To climb a bigger mountain, you first have to walk back down."*
- ✅ Fully configurable: `journey` entries (`role`, `company`, `period`, `line`,
  optional `valley` line, optional 2–3 skill tags) — the panorama is drawn live
  from data; a future chapter just extends the range.
- ✅ Mobile: same trail traverse, tighter framing on the current segment.
- ⬜ Summit + valley copy to write (real roles/companies/dates + lines).

## Scene 4 — The Desk (camera lands; skills by default) — ✅ refined

- ✅ Zooming out of the frame, the camera **settles at the desk** — the working
  position. Lights come up on: the desk + **monitor** (center) and the
  **whiteboard on the LEFT wall**.
- ✅ Whiteboard default state: **sticky notes + Gokul's quote** (the philosophy
  home: `Build → Learn → Improve → Repeat`, doodles, crossed-out branches).
- ✅ Monitor default state: **skills as FILES** — a file explorer with folders by
  area (`ai/`, `backend/`, `cloud/`, `frontend/` …), skill files inside. Diegetic
  (monitors show files, not cards) and consistent: memory cards later open their
  projects on the same screen, like inserting a real drive. The monitor = one
  coherent mini-OS.
- ✅ Mobile: monitor full-frame, file list is naturally vertical.
- ⬜ File-explorer visual design (desktop icons? tree? terminal `ls` accents?).

## Scene 5 — Memory Cards (projects + learnings) — ✅ refined

- ✅ Projects = **pendrives / memory cards scattered on the desk**. One card per
  project content file — **add a project in git → a new card appears on the desk**.
  The metaphor is literal: memory cards store work; the pile grows with the career.
- ✅ Activating a card (= plugging it in):
  - the **monitor loads that project** — the case study reads ON the monitor screen
    (problem / architecture / trade-offs; the monitor replaces the 2D overlay panel)
  - the **whiteboard switches context** to that project's rough sketches +
    sticky notes (the ideation behind the idea)
  - the whiteboard's side shows the project **retro**: *what went well /
    what could've been better* — sprint-retrospective format (a nod to the QA
    origin), quick-reference learnings per project.
- ✅ Tour mode (scroll must always advance): featured cards **auto-load one by one
  as the user scrolls** — card slides in → monitor loads → whiteboard flips.
  Clicking any scattered card is the free-choice path and the only way to open
  non-featured projects. Scroll = curated playlist; click = full library.
- ✅ Mobile: scattered cards are poor tap targets → portrait shows a **card
  row/carousel above the monitor**; tap → monitor full-frame → next beat,
  whiteboard full-frame (sketches + retro). Same content, sequenced.
- ✅ Card appearance configurable per project (label/color) via frontmatter.
- ✅ **Card assets: 3D, modeled once, instanced** — 2–3 low-poly base models
  (SD card, USB stick, +1 variant); each project file spawns an instance with a
  generated label texture (name + color). Pile scatter generated from the project
  list with a fixed seed — looks piled, identical every visit, grows per project.
  (Flat images rejected: cards sit on the closest, most-visited surface —
  billboards collapse under camera moves, can't pile or catch light.)
- 🔶 Optional garnish: media type matches project era (floppy → CD → USB → SD →
  NVMe) — the pile becomes an archaeology of the career.
- ⬜ Choose featured projects + write case studies, sketches, retros.

## Overview mode — definition

- ✅ Entered via light switch, the mode choice, or automatically on return visits.
  **Everything lit + materialized**, fixed wide camera, gentle mouse/tilt
  parallax. All objects clickable: cards, whiteboard, frame, shelf, chair.
  No movement controls of any kind (first-person walking + visitor avatar both
  rejected: game machinery, mobile pain, no informational payoff).
- ✅ **Monitor = the hub**: shows "what you can do here" directions, the sketch
  character as guide, and the **résumé download**.
- ✅ **The chair is clickable: click → camera preset settles into Gokul's seated
  working position** (desk + monitor + whiteboard in front of you) and the room
  delivers the invitation line: *"You're in the builder's seat. Maybe the next
  impossible thing gets built together."* The tour keeps the chair empty (ending
  symbol); only explorers earn the seat.

## Overview-mode discoveries (not tour stops)

- ✅ **The Shelf (failures):** dusty never-shipped prototypes with handwritten labels
  ("Didn't work." / "Wrong direction." / "Restarted → became …"). One line:
  *"These taught me the most."* Click → postmortem panels. Distinct from project
  retros: retros = lessons from shipped work; shelf = the honest graveyard.
- ✅ Whiteboard philosophy doodles in their default state (Scene 4) double as an
  Explore-mode reward for people who go looking.
- ⬜ Write 2–4 real postmortems for the shelf.

## Scene 6 — The Full Switch (now + contact) — ✅ concept locked

- ✅ **"Full switch when they all come into one":** every section's light converges —
  camera pulls back to the whole room, fully lit and fully materialized for the
  first time. This is the money shot the per-section lighting was saving up for.
- ✅ One monitor still reads **`Building...`** (driven by the "Now"
  content file). One blueprint still open. The **empty chair** faces the camera.
- ✅ **Character bookend:** the sketch character from Scene 1 reappears on the
  monitor — asks how the experience was and invites the visitor to connect.
  The site opens with "hi, I'm Gokul" and closes with
  "so — want to build something together?" Same face, both moments.
- ✅ Plain, unmissable: email · GitHub · LinkedIn · résumé (PDF).
- ✅ Version indicator reads `v-next: building...`. No "thanks for visiting."
- ✅ Afterward the room becomes the free **Explore mode** hub.

---

## Content model (git-edited, schema-validated)

| File | Drives |
|---|---|
| `profile` (yaml) | name, roles list (Scene 1 flipper), careerStart date (years computed, never stale), links, SEO |
| `journey` (yaml) | mountain-range entries: role, company, period, one-liner, valley line, 2–3 skill tags |
| `skills` (yaml) | grouped current stack (Scene 4) |
| `projects/*.md` | case studies; `featured`, `status`, card label/color, sketches, retro (went well / could improve) in frontmatter |
| `failures/*.md` | shelf postmortems (Explore mode) |
| `now` (yaml) | the `Building...` monitor list (edited most often — keep easiest) |
| `copy` (yaml) | every line the room "says" (taglines, captions, chair line) |
| `sections` (yaml) | enable/disable + order of scenes |
| résumé PDF | swappable file in `public/` |

## Asset inventory (to generate)

**3D set (low-poly, sketch-style textures — build once):**
desk · monitor · speakers ×2 · chair · whiteboard (plane) · framed panorama
(plane) · failure shelf + 3–4 dusty prototype props · memory-card base models
×2–3 (instanced per project) · small desk props (pen, notebook, blueprint tube)

**2D art (the content layer — mapped onto 3D surfaces):**
mountain-range panorama illustration (**7 peaks** — journey data received,
`content/journey.yaml`) · whiteboard default state (sticky notes, doodles,
quote) · per-project whiteboard sketch sets · monitor UI screens (file
explorer / project view / Overview hub / `Building...`) · character poses
(wave, jump, point, ask-to-connect — **blocked on sketch-vs-pixel decision**) ·
world-map desk mat texture · wall/darkness backdrop · sky + cloud layers

**Copy (git content files):**
✅ mountain summits + valleys — `content/journey.yaml` (companies optional,
fields empty for now) · roles list (Scene 1 flipper — derivable from journey) ·
scene lines (copy file) · skills tree · project case studies + retros · shelf
postmortems · "now" list

**Generation prompts for all of the above: `PROMPTS.md`** (per-object 3D
prompts + shared style block + 2D art prompts; image-to-3D from Gokul's own
photos preferred for owned objects).

## Open decisions

1. 🔶 Scene 1 character: sketched avatar (recommended) vs pixel art —
   **now blocking asset generation.**
2. 🔶 Confirm current title "Forward Deployed Engineer" for end of role flipper.
2b. 🔶 Era-matched storage media for project cards (floppy→NVMe) — yes/no.
3. ✅ Mountain summit + valley copy — `content/journey.yaml` (7 entries).
   Optional: fill in `company:` fields.
4. ⬜ Skills file-explorer visual design — Scene 4.
5. ⬜ Featured projects + case studies, whiteboard sketches, retros — Scene 5.
6. ⬜ Tech stack confirmation (React Three Fiber on existing Vite+TS) & what happens
   to the old ARC//OS experiment in `src/`.
