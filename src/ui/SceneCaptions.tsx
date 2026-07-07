import { useWorkshop } from "@/state/store";
import { SCENES, range } from "@/experience/timeline";
import { copy } from "@/content";

/**
 * Small diegetic captions that fade in/out at scene boundaries during
 * the tour — quiet stage directions, never long-form.
 */
function Caption({ from, to, children, bottom = "9vh" }: { from: number; to: number; children: React.ReactNode; bottom?: string }) {
  const progress = useWorkshop((s) => s.progress);
  if (progress < from || progress > to) return null;
  const opacity = Math.min(range(progress, from, from + 0.015), 1 - range(progress, to - 0.015, to));
  return (
    <div className="fixed inset-x-0 z-20 flex justify-center px-6 text-center" style={{ bottom, opacity }}>
      <p className="max-w-[560px] font-mono text-[12.5px] leading-relaxed text-[#9a958a] [text-shadow:0_2px_8px_#000]">
        {children}
      </p>
    </div>
  );
}

export function SceneCaptions() {
  const mode = useWorkshop((s) => s.mode);
  const activeProjectId = useWorkshop((s) => s.activeProjectId);
  if (mode !== "tour") return null;
  return (
    <>
      <Caption from={SCENES.desk.start + 0.01} to={SCENES.desk.end - 0.01}>
        {copy.desk.caption}
      </Caption>
      {!activeProjectId && (
        <Caption from={0.64} to={SCENES.cards.end - 0.01}>
          {copy.projects.caption} <span className="text-[#6c675e]">· {copy.projects.hint}</span>
        </Caption>
      )}
      <Caption from={SCENES.finale.start + 0.04} to={1}>
        <span className="text-[#e8e4da]">{copy.finale.question}</span>
      </Caption>
    </>
  );
}
