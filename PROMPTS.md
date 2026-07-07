# Asset Generation Prompts — The Workshop

Prompts for generating the 3D props and 2D art. Written for text-to-3D tools
(Meshy, Tripo, Rodin, Luma Genie) and image generators (for the 2D art layer).

## How to use — read first

1. **One object per generation. Never generate the whole scene as one model.**
   Each prop must be its own GLB so it can be positioned, lit, and made
   clickable/interactive independently (memory cards, PlayStation, figurine —
   all future interaction hooks). The scene is assembled in code.
2. **Prefer image-to-3D for objects you own.** Your real photos (monitor,
   RGB speaker bars, controllers, figurine) will beat any text prompt — crop
   the object from your photo, feed it to the tool's image-to-3D mode, and use
   the text prompt as the negative-space/style guide.
3. **Append the STYLE BLOCK below to every 3D prompt** (or paste it into the
   tool's style field) so all props look like one set.
4. After generation, per asset: check scale against the desk, set origin to
   base, decimate to low-poly if the tool over-tessellated, name the node
   (e.g. `prop-monitor`), export GLB.
5. Screens, whiteboard surface, frame photo = **flat planes textured in code**.
   Generate the *hardware* (bezels, frames, boards), never the on-screen content.

## STYLE BLOCK (append to every 3D prompt)

> low-poly stylized 3D asset, clean simple geometry, softly rounded edges,
> flat matte colors, muted palette, no text, no logos, no baked lighting or
> shadows, neutral albedo, game-ready, single isolated object, centered on
> empty background, suitable for toon shader with pencil-sketch outline

---

## 3D props — the desk set (digital twin of the real workspace)

**Desk** *(based on the real black L-desk; we build the straight section)*
> modern gaming desk, straight rectangular tabletop, black with subtle
> carbon-fiber weave texture, slightly curved front edge, sturdy black metal
> legs + [STYLE]

**Monitor** *(the white BenQ is the set's signature piece)*
> 27 inch desktop monitor, slim white bezel, white rear casing, flat
> rectangular white stand base with slim neck, blank dark screen + [STYLE]

**RGB light-bar speaker** *(one model, mirrored in code for the pair)*
> small vertical desktop speaker light bar, slim rectangular tower, matte
> black body, large frosted translucent front panel that can glow, standing
> upright + [STYLE]

**Mechanical keyboard**
> compact tenkeyless mechanical keyboard, black case, two-tone keycaps in
> white and black, slight ergonomic tilt + [STYLE]

**Mouse**
> wireless gaming mouse, matte black, low-profile ergonomic shape + [STYLE]

**Game console** *(generic — no branding)*
> slim modern game console standing vertically on a small stand, matte black,
> minimalist flat design, subtle horizontal groove line + [STYLE]

**Game controller** *(generate once; recolor blue + black instances in code)*
> wireless game controller with two analog sticks, rounded grips, d-pad and
> four face buttons, matte finish + [STYLE]

**Office chair** *(the empty chair — ending symbol)*
> ergonomic office chair, black mesh backrest, fabric seat, five-star base
> with casters, armrests, facing forward + [STYLE]

**Whiteboard** *(hardware only; content is a live texture)*
> wall-mounted whiteboard, thin silver aluminum frame, small marker tray at
> the bottom edge, blank white surface + [STYLE]

**Photo frame** *(hardware only; panorama is a texture)*
> wide panoramic picture frame, thin dark wood border, blank canvas inside,
> landscape orientation 3:1 + [STYLE]

**Wall shelf + failure props** *(shelf, then 2–3 junk prototypes)*
> small wall-mounted wooden shelf, single plank, two simple metal brackets + [STYLE]
> electronics prototype breadboard with a few jumper wires, hobbyist project,
> slightly messy + [STYLE]
> small broken robot toy prototype, one arm detached lying beside it + [STYLE]
> tangled ball of cables and wires, abandoned electronics project + [STYLE]

**Couple figurine** *(use image-to-3D with IMG_3375.JPG — personal item)*
> cute ceramic couple figurines sitting side by side on a transparent blue
> rectangular base, boy in striped shirt holding red flowers, girl in pink
> polka-dot dress with red hair bow, dangling rope legs with little brown
> shoes, kissing + [STYLE]

## 3D props — memory cards / pendrives (instanced per project)

Generate each ONCE; every project spawns an instance with a generated label
texture (name + color from frontmatter). Era-matched media (optional garnish —
pending yes/no): oldest → newest.

> 3.5 inch floppy disk, flat square, dark shell, metal shutter, blank white
> label sticker + [STYLE]

> compact disc in a slim transparent jewel case, blank paper insert + [STYLE]

> USB flash drive, rounded rectangular body, removable cap, small loop hole,
> blank label area + [STYLE]

> SD memory card, classic angled-corner shape, blank label sticker + [STYLE]

> retro game console memory card, small grey rectangular cartridge with grip
> ridges and a blank label slot + [STYLE]
> *(nod to the PlayStation on the desk)*

## 2D art — textures & illustrations (image generation)

**Mountain-range panorama** *(Scene 3 — exactly 7 peaks = 7 journey entries)*
> hand-drawn pencil and ink panorama of a mountain range with exactly seven
> peaks rising progressively taller from left to right, a winding hiking trail
> connecting every summit through the valleys between them, small flags planted
> on the first six summits, the seventh and tallest peak's summit hidden in
> clouds with NO flag, the trail beyond the last visible camp fading into faint
> unfinished pencil lines, warm off-white paper texture, fine linework with a
> subtle watercolor wash, wide panoramic 3:1 aspect ratio, no text

**World-map desk mat** *(flat texture for the desk mat plane)*
> flat top-down texture of a dark navy fabric desk mat printed with faint
> white line-art world map, thin stitched border, matte surface, wide 3:1,
> no text labels

**Wall / darkness backdrop**
> hand-drawn dark charcoal gradient backdrop, subtle paper grain, vignette
> fading to black at the edges, no objects, no text

**Sketch character — Gokul** *(BLOCKED: sketch vs pixel decision)*
Option A — sketch (recommended):
> hand-drawn pencil sketch character of a friendly male engineer, simple loose
> linework, minimal shading, waving pose / jumping pose / pointing pose /
> arms-open inviting pose, transparent background, consistent character across
> poses, warm approachable expression, no text
Option B — pixel:
> 32x48 pixel art sprite of a friendly male engineer character, waving /
> jumping / pointing / inviting poses, limited warm palette, transparent
> background, consistent across poses

**Concept image** *(optional — art direction reference only, NOT for 3D)*
> dark cozy workspace at night seen from a seated first-person view: a white
> monitor glowing as the only light source, vertical RGB light-bar speakers
> at its sides, compact mechanical keyboard and mouse on a dark navy world-map
> desk mat, a slim game console standing vertically to the left, a couple
> figurine beside it, a whiteboard covered in sticky notes on the left wall,
> a wide framed mountain panorama on the right wall, a small shelf of dusty
> electronics prototypes, scattered memory cards and usb drives on the desk,
> everything drawn in a hand-sketched pencil style partially materializing
> into real rendered objects, cinematic, warm screen glow against darkness
