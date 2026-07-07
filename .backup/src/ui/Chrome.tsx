import { useArc } from "../state/store";
import { personaById } from "../content/personas";
import { profile } from "../content/profile";

const PHASE_LABEL: Record<string, string> = {
  boot: "BOOT",
  intro: "CITY FLYOVER",
  threshold: "TOWER THRESHOLD",
  persona: "IDENT",
  ride: "ELEVATOR",
  floor: "CHAPTER OPEN",
  cityFly: "CITY TRANSIT",
  finale: "ROOF",
};

/** Persistent OS chrome: wordmark, phase, visitor lens. Never louder than the scene. */
export function Chrome() {
  const phase = useArc((s) => s.phase);
  const persona = useArc((s) => s.persona);
  if (phase === "boot") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[13px] tracking-[0.3em] text-fg">
          ARC<span className="text-accent">//</span>OS
        </div>
        <div className="hud-label mt-px hidden sm:block">{profile.name} · {profile.title}</div>
      </div>
      <div className="flex items-center gap-4">
        {persona && (
          <div className="hud-label">
            LENS <span className="text-accent-2">{personaById(persona).lens}</span>
          </div>
        )}
        <div className="hud-label flex items-center gap-2">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-ok" />
          {PHASE_LABEL[phase]}
        </div>
      </div>
    </div>
  );
}
