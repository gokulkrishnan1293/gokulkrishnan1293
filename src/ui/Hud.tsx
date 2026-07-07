import { useEffect } from "react";
import { useWorkshop } from "@/state/store";
import { versionAt } from "@/experience/timeline";
import { copy } from "@/content";

/**
 * Always-on chrome: the version indicator (progress = iteration, not a bar),
 * the light switch (the escape hatch to Overview, visible from second zero),
 * the sound state, and — in overview — replay intro.
 */
export function Hud() {
  const progress = useWorkshop((s) => s.progress);
  const mode = useWorkshop((s) => s.mode);
  const audioOn = useWorkshop((s) => s.audioOn);
  const seated = useWorkshop((s) => s.seated);
  const setMode = useWorkshop((s) => s.setMode);
  const replayIntro = useWorkshop((s) => s.replayIntro);
  const sit = useWorkshop((s) => s.sit);
  const toggleAudio = useWorkshop((s) => s.toggleAudio);
  const viewLocked = useWorkshop((s) => s.viewLocked);
  const setViewLock = useWorkshop((s) => s.setViewLock);

  // L = lock, U = unlock, space = toggle — the free look freeze.
  // L/U stay live while a project is open so the view can be pinned mid-read.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useWorkshop.getState();
      if (s.mode !== "overview" || s.seated) return;
      if (e.code === "KeyL") s.setViewLock(true);
      else if (e.code === "KeyU") s.setViewLock(false);
      else if (e.code === "Space" && !s.overlay) {
        e.preventDefault();
        s.setViewLock(!s.viewLocked);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const overview = mode === "overview";
  const version = overview || progress > 0.985 ? copy.version.next : versionAt(progress);

  return (
    <>
      {/* version — bottom left */}
      <div className="fixed bottom-4 left-5 z-30 font-mono text-[12px] text-[#6c675e] select-none">
        {version}
      </div>

      {/* light switch — top right */}
      <button
        onClick={() => setMode(overview ? "tour" : "overview")}
        className="group fixed top-4 right-5 z-30 flex items-center gap-2 rounded border border-[#ffffff1a] bg-[#0a0a0cbb] px-3 py-2 font-mono text-[11.5px] text-[#9a958a] backdrop-blur transition-colors hover:border-[#ffb45455] hover:text-[#ffb454]"
        title={overview ? "back to the tour" : "skip the story — light everything"}
      >
        {/* a tiny switch glyph */}
        <span className="relative inline-block h-[14px] w-[9px] rounded-[2px] border border-current">
          <span
            className={`absolute left-[1.5px] h-[4px] w-[4px] rounded-[1px] bg-current transition-all ${
              overview ? "top-[1.5px]" : "bottom-[1.5px]"
            }`}
          />
        </span>
        {overview ? "resume the tour" : "turn on the lights"}
      </button>

      {/* audio + replay + view lock — bottom right */}
      <div className="fixed right-5 bottom-4 z-30 flex items-center gap-3 font-mono text-[11.5px]">
        {overview && !seated && (
          <button
            onClick={() => setViewLock(!viewLocked)}
            className={`transition-colors ${viewLocked ? "text-[#ffb454]" : "text-[#6c675e] hover:text-[#9a958a]"}`}
            title="L locks · U unlocks · space toggles"
          >
            {viewLocked ? "🔒 view locked · U unlocks" : "🔓 lock view · L"}
          </button>
        )}
        {overview && (
          <button onClick={replayIntro} className="text-[#6c675e] transition-colors hover:text-[#ffb454]">
            ↺ replay intro
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
