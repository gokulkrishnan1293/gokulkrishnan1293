import { useWorkshop } from "@/state/store";
import { SCENES, range } from "@/experience/timeline";
import { copy } from "@/content";

/**
 * Scene 2's quiet fork: keep scrolling (the tour) or flip everything on.
 * It never blocks — scrolling straight past it simply continues the film.
 */
export function ModeChoice() {
  const progress = useWorkshop((s) => s.progress);
  const mode = useWorkshop((s) => s.mode);
  const setMode = useWorkshop((s) => s.setMode);

  if (mode !== "tour") return null;
  const { start, end } = SCENES.modeChoice;
  const inWindow = progress > start && progress < end;
  if (!inWindow) return null;

  const opacity = Math.min(range(progress, start, start + 0.02), 1 - range(progress, end - 0.02, end));

  return (
    <div
      className="fixed inset-x-0 bottom-[12vh] z-20 flex flex-col items-center gap-3 px-6"
      style={{ opacity }}
    >
      <div className="font-mono text-[12.5px] text-[#9a958a] [text-shadow:0_2px_8px_#000]">
        {copy.modeChoice.prompt}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <div className="rounded border border-[#ffffff22] bg-[#0a0a0cd0] px-4 py-2.5 text-center font-mono backdrop-blur">
          <div className="text-[13px] text-[#e8e4da]">↓ {copy.modeChoice.tour}</div>
          <div className="mt-0.5 text-[10px] text-[#6c675e]">{copy.modeChoice.tourSub}</div>
        </div>
        <button
          onClick={() => setMode("overview")}
          className="rounded border border-[#ffb45440] bg-[#0a0a0cd0] px-4 py-2.5 text-center font-mono backdrop-blur transition-colors hover:border-[#ffb454] hover:bg-[#ffb45410]"
        >
          <div className="text-[13px] text-[#ffb454]">⚡ {copy.modeChoice.overview}</div>
          <div className="mt-0.5 text-[10px] text-[#6c675e]">{copy.modeChoice.overviewSub}</div>
        </button>
      </div>
    </div>
  );
}
