import { create } from "zustand";

/**
 * ARC//OS phase machine.
 *
 * boot      → assets loading, OS boot readout
 * intro     → cinematic city fly-through with narration
 * threshold → camera pushes into the tower, light flood
 * persona   → inside elevator, ELEV.AI asks "Who are you?"
 * ride      → elevator hub: navigation wall + activity wall
 * floor     → a chapter is open (content takes over)
 * cityFly   → camera leaves the elevator to fly to a district
 * finale    → roof opens, city overview, invitation
 */
export type Phase =
  | "boot"
  | "intro"
  | "threshold"
  | "persona"
  | "ride"
  | "floor"
  | "cityFly"
  | "finale";

export type PersonaId = "recruiter" | "em" | "engineer" | "architect" | "founder";

export type FloorId =
  | "arrival"
  | "engineering"
  | "ai-architecture"
  | "living-systems"
  | "decisions"
  | "failures"
  | "future";

export interface ActivityEvent {
  t: number; // ms since session start
  tag: string; // e.g. "NAV", "PIPELINE", "MEMORY"
  msg: string;
}

interface ArcState {
  phase: Phase;
  persona: PersonaId | null;
  floor: FloorId | null;
  /** floor index used for the elevator counter animation */
  travelFrom: number;
  travelTo: number;
  traveling: boolean;
  visited: FloorId[];
  activity: ActivityEvent[];
  pipelineRuns: number;
  /** district id the camera is flying to during cityFly */
  flyTarget: string | null;
  /** project to auto-open on the Living Systems floor (deep link from pipeline answers) */
  focusProject: string | null;
  reducedMotion: boolean;
  bootProgress: number;

  setPhase: (p: Phase) => void;
  setPersona: (p: PersonaId) => void;
  openFloor: (f: FloorId, fromIdx: number, toIdx: number) => void;
  arriveFloor: () => void;
  closeFloor: () => void;
  log: (tag: string, msg: string) => void;
  markPipelineRun: () => void;
  flyTo: (district: string) => void;
  endFly: () => void;
  setFocusProject: (id: string | null) => void;
  setBootProgress: (n: number) => void;
}

const t0 = performance.now();

// dev shortcut: ?phase=ride|persona|finale… jumps straight in (with a default persona)
const paramPhase = (() => {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search).get("phase");
  const valid: Phase[] = ["intro", "persona", "ride", "finale"];
  return p && (valid as string[]).includes(p) ? (p as Phase) : null;
})();

export const useArc = create<ArcState>((set, get) => ({
  phase: paramPhase ?? "boot",
  persona: paramPhase && paramPhase !== "intro" && paramPhase !== "persona" ? "engineer" : null,
  floor: null,
  travelFrom: 0,
  travelTo: 0,
  traveling: false,
  visited: [],
  activity: [],
  pipelineRuns: 0,
  flyTarget: null,
  focusProject: null,
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  bootProgress: 0,

  setPhase: (phase) => set({ phase }),

  setPersona: (persona) => {
    get().log("MEMORY", `visitor profile set → ${persona}`);
    set({ persona, phase: "ride" });
  },

  openFloor: (floor, fromIdx, toIdx) => {
    const { visited } = get();
    get().log("NAV", `request floor ${toIdx} · ${floor}`);
    set({
      floor,
      travelFrom: fromIdx,
      travelTo: toIdx,
      traveling: true,
      phase: "floor",
      visited: visited.includes(floor) ? visited : [...visited, floor],
    });
  },

  arriveFloor: () => set({ traveling: false }),

  closeFloor: () => set({ phase: "ride", floor: null, traveling: false }),

  log: (tag, msg) =>
    set((s) => ({
      activity: [...s.activity.slice(-60), { t: performance.now() - t0, tag, msg }],
    })),

  markPipelineRun: () => set((s) => ({ pipelineRuns: s.pipelineRuns + 1 })),

  flyTo: (district) => {
    get().log("NAV", `camera dispatched → ${district} district`);
    set({ phase: "cityFly", flyTarget: district });
  },

  endFly: () => set({ phase: "ride", flyTarget: null }),

  setFocusProject: (focusProject) => set({ focusProject }),

  setBootProgress: (bootProgress) => set({ bootProgress }),
}));
