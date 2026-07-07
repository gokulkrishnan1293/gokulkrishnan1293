/** touch-first device (phone/tablet) — used to tone the experience down:
 *  lower canvas resolution, no idle camera motion, seated finale */
export const COARSE_POINTER =
  typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
