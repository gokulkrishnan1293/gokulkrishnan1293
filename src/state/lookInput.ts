/**
 * The look orb's live vector — written by the orb (DOM), read by the
 * camera every frame. A plain mutable module object, not store state:
 * this changes at pointer-move rate and must never trigger React renders.
 */
export const lookInput = {
  /** -1..1, right positive */
  x: 0,
  /** -1..1, up positive */
  y: 0,
  /** true while the orb is held */
  active: false,
};
