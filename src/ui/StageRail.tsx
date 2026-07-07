import { useWorkspace } from "@/state/store";
import { ENTRY_P } from "@/experience/timeline";

/**
 * The stage rail — the film's chapters as a quiet dot rail. Click to
 * jump anywhere on the timeline, forward or back; the last stage is the
 * fully lit workspace. This replaces mode toggles: there is only one
 * timeline, and these are shortcuts along it.
 */
const STAGES: { label: string; p: number }[] = [
  { label: "enter", p: 0 },
  { label: "hello", p: ENTRY_P + 0.015 },
  { label: "journey", p: 0.3 },
  { label: "skills", p: 0.55 },
  { label: "projects", p: 0.7 },
  { label: "contact me", p: 0.898 },
];

export function StageRail() {
  const seated = useWorkspace((s) => s.seated);
  const overlay = useWorkspace((s) => s.overlay);
  const jumpTo = useWorkspace((s) => s.jumpTo);
  // derived index, not raw progress — re-renders only when the active dot moves
  const active = useWorkspace((s) =>
    s.mode === "overview"
      ? STAGES.length - 1
      : STAGES.reduce((acc, st, i) => (s.progress >= st.p - 0.012 ? i : acc), 0),
  );

  if (seated || overlay) return null;

  return (
    <nav className="fixed top-1/2 right-4 z-30 flex -translate-y-1/2 flex-col items-end gap-3.5">
      {STAGES.map((stage, i) => (
        <button
          key={stage.label}
          onClick={() => jumpTo(stage.p)}
          className="group flex items-center gap-2 py-0.5"
          title={stage.label}
        >
          <span
            className={`font-mono text-[10px] transition-opacity ${
              i === active
                ? "text-[#ffb454] opacity-100"
                : "text-[#9a958a] opacity-0 group-hover:opacity-100"
            }`}
          >
            {stage.label}
          </span>
          <span
            className={`h-[7px] w-[7px] rounded-full border transition-colors ${
              i === active
                ? "border-[#ffb454] bg-[#ffb454]"
                : i < active
                  ? "border-[#9a958a] bg-[#9a958a55]"
                  : "border-[#6c675e] group-hover:border-[#9a958a]"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
