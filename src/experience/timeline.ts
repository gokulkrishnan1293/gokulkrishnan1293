/**
 * The film reel. Scroll progress (0..1) drives everything:
 * camera pose, per-section materialization (sketch → real), light
 * intensities, and which UI beats are on screen.
 *
 * Cinema stays in code (per storyboard) — content stays in /content.
 */
import * as THREE from "three";
import { featuredProjects } from "@/content";

// ── scene ranges ─────────────────────────────────────────────

export const SCENES = {
  welcome: { start: 0.0, end: 0.06 },
  zoomout: { start: 0.06, end: 0.18 },
  modeChoice: { start: 0.14, end: 0.21 },
  frameIn: { start: 0.2, end: 0.26 },
  journey: { start: 0.26, end: 0.44 },
  frameOut: { start: 0.44, end: 0.48 },
  desk: { start: 0.48, end: 0.6 },
  cards: { start: 0.6, end: 0.87 },
  finale: { start: 0.87, end: 1.0 },
} as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);

/** progress where the walk through the door ends — the tour resumes here,
 *  and scrolling back below it walks you back out */
export const ENTRY_P = 0.055;

// ── set layout (world units ~ meters; camera faces -z) ───────

export const L = {
  deskTop: 0.78,
  monitor: new THREE.Vector3(0, 0.78, -0.28),
  // measured off the model: head front is flat at z ≈ -0.200, x ±0.33, y 0.86..1.31
  // the monitor model is iMac-like: big chin below the glass → screen sits high
  screenCenter: new THREE.Vector3(0, 1.107, -0.196),
  screenSize: { w: 0.62, h: 0.345 },
  speakerL: new THREE.Vector3(-0.48, 0.78, -0.26),
  speakerR: new THREE.Vector3(0.48, 0.78, -0.26),
  keyboard: new THREE.Vector3(-0.02, 0.78, 0.09),
  mouse: new THREE.Vector3(0.3, 0.78, 0.11),
  couple: new THREE.Vector3(-0.62, 0.78, -0.16),
  deskMat: new THREE.Vector3(0.05, 0.786, 0.06),
  leftWallX: -2.0,
  rightWallX: 1.8,
  backWallZ: -1.05,
  // both boards live on the back wall now: big whiteboard left, small frame right
  whiteboard: new THREE.Vector3(-1.15, 1.85, -1.02),
  whiteboardSize: { w: 1.6, h: 1.05 },
  frame: new THREE.Vector3(1.1, 1.62, -1.02),
  frameSize: { w: 0.95, h: 0.35 },
  chair: new THREE.Vector3(0.05, 0, 0.95),
  // memory cards flank the desk mat: left of the keyboard, right of the mouse
  cardsL: new THREE.Vector3(-0.58, 0.78, 0.0),
  cardsR: new THREE.Vector3(0.6, 0.78, -0.04),
} as const;

// ── camera keyframes (tour) ──────────────────────────────────

interface CamKey {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov?: number;
}

const CAM: CamKey[] = [
  // Scene 0 — outside the half-open door, the screen glowing through the gap
  { t: 0.0, pos: [0.42, 1.22, 4.55], look: [0, 1.05, 1.0], fov: 46 },
  // …through the threshold…
  { t: 0.03, pos: [0.1, 1.17, 2.9], look: [0, 1.06, 0.4], fov: 45 },
  // Scene 1 — up to the glowing monitor, desk and wall still in frame
  { t: ENTRY_P, pos: [0, 1.15, 0.95], look: [0, 1.04, -0.22], fov: 44 },
  { t: 0.1, pos: [0, 1.15, 0.95], look: [0, 1.04, -0.22], fov: 44 },
  // Scene 2 — pull back, the room fades in
  { t: 0.15, pos: [0.1, 1.5, 2.7], look: [0, 0.95, -0.25], fov: 50 },
  { t: 0.2, pos: [0.45, 1.5, 2.1], look: [1.1, 1.6, -1.0], fov: 48 },
  // Scene 3 — zoom straight into the small frame on the back wall
  { t: 0.24, pos: [1.05, 1.6, 0.4], look: [1.1, 1.62, -1.02], fov: 44 },
  { t: 0.26, pos: [1.08, 1.62, -0.3], look: [1.1, 1.62, -1.02], fov: 40 },
  { t: 0.44, pos: [1.08, 1.62, -0.3], look: [1.1, 1.62, -1.02], fov: 40 },
  // …and back out of the frame, swinging over to the monitor
  { t: 0.48, pos: [0.55, 1.3, 1.35], look: [0, 1.1, -0.2], fov: 46 },
  // Scene 4 — nose to the screen: browse the skills
  { t: 0.53, pos: [0, 1.13, 0.72], look: [0, 1.1, -0.2], fov: 42 },
  { t: 0.6, pos: [0, 1.13, 0.72], look: [0, 1.1, -0.2], fov: 42 },
  // Scene 5 — down to the desk and HOLD: the visitor picks a pendrive;
  // clicking one takes the camera to the monitor (see CameraRig)
  { t: 0.66, pos: [0, 1.45, 0.9], look: [0, 0.78, 0.02], fov: 50 },
  { t: 0.88, pos: [0, 1.45, 0.9], look: [0, 0.78, 0.02], fov: 50 },
  // Scene 6 — the full switch: whole room, empty chair
  { t: 0.95, pos: [0, 1.62, 3.1], look: [0, 1.05, -0.2], fov: 52 },
  { t: 1.0, pos: [0, 1.58, 2.95], look: [0, 1.02, -0.2], fov: 52 },
];

export const OVERVIEW_CAM = {
  pos: new THREE.Vector3(0.1, 1.55, 2.9),
  look: new THREE.Vector3(0, 1.02, -0.2),
  fov: 52,
};

export const SEATED_CAM = {
  pos: new THREE.Vector3(0.02, 1.14, 0.78),
  look: new THREE.Vector3(0, 1.04, -0.26),
  fov: 50,
};

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export function sampleCamera(p: number): { pos: THREE.Vector3; look: THREE.Vector3; fov: number } {
  let i = 0;
  while (i < CAM.length - 2 && CAM[i + 1].t <= p) i++;
  const a = CAM[i];
  const b = CAM[i + 1];
  const t = smooth(range(p, a.t, b.t));
  _pos.fromArray(a.pos).lerp(_look.fromArray(b.pos), t);
  const pos = _pos.clone();
  _look.fromArray(a.look);
  const look = _look.clone().lerp(new THREE.Vector3().fromArray(b.look), t);
  const fov = (a.fov ?? 48) + ((b.fov ?? 48) - (a.fov ?? 48)) * t;
  return { pos, look, fov };
}

// ── per-section reveal (fade-in as the tour pulls back) ──────
// reveal 0 → invisible · 1 → fully there

export type Section =
  | "desk"
  | "monitor"
  | "speakers"
  | "peripherals"
  | "whiteboard"
  | "frame"
  | "chair"
  | "cards";

/** piecewise-linear keyframes per section: [progress, reveal] */
const REVEAL: Record<Section, [number, number][]> = {
  monitor: [[0, 1]],
  speakers: [[0, 1]],
  // the desk is there from the first glance through the door —
  // the monitor needs something to rest on
  desk: [[0, 1]],
  peripherals: [
    [0.08, 0],
    [0.13, 1],
  ],
  whiteboard: [
    [0.09, 0],
    [0.14, 1],
  ],
  frame: [
    [0.1, 0],
    [0.15, 1],
  ],
  chair: [
    [0.11, 0],
    [0.16, 1],
  ],
  cards: [
    [0.12, 0],
    [0.17, 1],
  ],
};

function interpKeys(keys: [number, number][], p: number): number {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (p <= t1) return v0 + (v1 - v0) * range(p, t0, t1);
  }
  return keys[keys.length - 1][1];
}

/** The full switch: everything converges to 1 at the finale. */
export function reveal(section: Section, p: number, overview: boolean): number {
  if (overview) return 1;
  const base = interpKeys(REVEAL[section], p);
  const finale = smooth(range(p, SCENES.finale.start, 0.94));
  return Math.max(base, finale);
}

// ── monitor screen mode ──────────────────────────────────────

export type ScreenMode =
  | { kind: "welcome" }
  | { kind: "dim" }
  | { kind: "skills" }
  | { kind: "project"; id: string }
  | { kind: "finale" }
  | { kind: "hub" };

export function screenModeAt(
  p: number,
  mode: "tour" | "overview",
  activeProjectId: string | null,
): ScreenMode {
  if (activeProjectId) return { kind: "project", id: activeProjectId };
  if (mode === "overview") return { kind: "hub" };
  if (p < SCENES.frameIn.start) return { kind: "welcome" };
  if (p < SCENES.desk.start - 0.02) return { kind: "dim" };
  if (p < SCENES.cards.end - 0.005) return { kind: "skills" };
  return { kind: "finale" };
}

// ── journey panorama peaks (fractions of image width/height) ─
// Measured against public/img/mountain-range.png (7 peaks, L→R).

export const PEAK_X = [0.09, 0.2, 0.31, 0.42, 0.54, 0.65, 0.83];
/** summit heights as fraction from the top of the image */
export const PEAK_Y = [0.62, 0.55, 0.5, 0.45, 0.4, 0.34, 0.24];

// ── version badge ────────────────────────────────────────────

export function versionAt(p: number): string {
  return `v${(0.1 + p * 8.9).toFixed(1)}`;
}
