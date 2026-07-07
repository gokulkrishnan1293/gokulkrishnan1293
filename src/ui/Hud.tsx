import { useWorkspace } from "@/state/store";
import { versionAt } from "@/experience/timeline";
import { copy } from "@/content";

/**
 * Always-on chrome: the version indicator (progress = iteration, not a bar),
 * the sound state, and — in the lit workspace — the view lock. Navigation
 * lives in the stage rail; there are no modes to toggle.
 */
export function Hud() {
  const progress = useWorkspace((s) => s.progress);
  const mode = useWorkspace((s) => s.mode);
  const audioOn = useWorkspace((s) => s.audioOn);
  const seated = useWorkspace((s) => s.seated);
  const sit = useWorkspace((s) => s.sit);
  const toggleAudio = useWorkspace((s) => s.toggleAudio);
  const viewLocked = useWorkspace((s) => s.viewLocked);
  const setViewLock = useWorkspace((s) => s.setViewLock);

  const overview = mode === "overview";
  const version = overview || progress > 0.985 ? copy.version.next : versionAt(progress);

  return (
    <>
      {/* version — bottom left */}
      <div className="fixed bottom-4 left-5 z-30 font-mono text-[12px] text-[#6c675e] select-none">
        {version}
      </div>

      {/* audio + view lock — bottom right */}
      <div className="fixed right-5 bottom-4 z-30 flex items-center gap-3 font-mono text-[11.5px]">
        {overview && !seated && (
          <button
            onClick={() => setViewLock(!viewLocked)}
            className={`transition-colors ${viewLocked ? "text-[#ffb454]" : "text-[#6c675e] hover:text-[#9a958a]"}`}
            title="push the orb's knob to the top and hold — or click here"
          >
            {viewLocked ? "🔒 view locked" : "🔓 lock view"}
          </button>
        )}
        <button
          onClick={toggleAudio}
          className={`transition-colors ${audioOn ? "text-[#ffb454]" : "text-[#6c675e] hover:text-[#9a958a]"}`}
          title="click a speaker on the desk — or here"
        >
          {audioOn ? "◉ sound on" : "○ sound off"}
        </button>
      </div>

      {/* seated caption */}
      {seated && (
        <div
          className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-[560px] cursor-pointer px-6 text-center"
          onClick={() => sit(false)}
        >
          <p className="fade-up font-mono text-[14px] leading-relaxed text-[#e8e4da] [text-shadow:0_2px_12px_#000]">
            {copy.chair.line}
          </p>
          <p className="mt-2 font-mono text-[10.5px] text-[#6c675e]">click to stand up</p>
        </div>
      )}
    </>
  );
}
