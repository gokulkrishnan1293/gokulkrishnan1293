import { create } from "zustand";

export type Phase = "loading" | "gate" | "entering" | "ready";
export type Mode = "tour" | "overview";

export interface Overlay {
  kind: "project" | "failure" | "philosophy";
  id: string;
}

interface WorkspaceState {
  phase: Phase;
  mode: Mode;
  /** 0..1 through the tour film. Driven by scroll. */
  progress: number;
  audioOn: boolean;
  /** card explicitly plugged in by click (free-choice path / overview) */
  activeProjectId: string | null;
  /** card under the pointer — label hint only, read imperatively */
  hoveredCardId: string | null;
  overlay: Overlay | null;
  seated: boolean;
  /** overview free-look frozen in place (view the whiteboard, read, …) */
  viewLocked: boolean;
  /** timestamp of the click that pushed the door open — drives the walk-in */
  enteredAt: number | null;

  setPhase: (p: Phase) => void;
  setMode: (m: Mode) => void;
  setProgress: (p: number) => void;
  toggleAudio: () => void;
  plugCard: (id: string | null) => void;
  hoverCard: (id: string | null) => void;
  openOverlay: (o: Overlay | null) => void;
  sit: (s: boolean) => void;
  setViewLock: (v: boolean) => void;
  begin: () => void;
  finishEnter: () => void;
  /** progress the stage rail asked to scroll to; App eases there and clears */
  scrollTarget: number | null;
  jumpTo: (p: number) => void;
  clearScrollTarget: () => void;
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  phase: "loading",
  mode: "tour",
  progress: 0,
  audioOn: false,
  activeProjectId: null,
  hoveredCardId: null,
  overlay: null,
  seated: false,
  viewLocked: false,
  enteredAt: null,

  setPhase: (phase) => set({ phase }),
  setMode: (mode) =>
    set({ mode, activeProjectId: null, overlay: null, seated: false, viewLocked: false }),
  setProgress: (progress) => set({ progress }),
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  plugCard: (activeProjectId) => set({ activeProjectId }),
  hoverCard: (hoveredCardId) => set({ hoveredCardId }),
  openOverlay: (overlay) => set({ overlay }),
  sit: (seated) => set({ seated, viewLocked: false }),
  setViewLock: (viewLocked) => set({ viewLocked }),
  begin: () => set({ phase: "entering", enteredAt: performance.now() }),
  finishEnter: () => set({ phase: "ready" }),
  scrollTarget: null,
  jumpTo: (scrollTarget) =>
    set({
      scrollTarget,
      mode: "tour",
      activeProjectId: null,
      overlay: null,
      seated: false,
      viewLocked: false,
    }),
  clearScrollTarget: () => set({ scrollTarget: null }),
}));
