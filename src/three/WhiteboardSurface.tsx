import { Html } from "@react-three/drei";
import { useWorkshop } from "@/state/store";
import { L } from "@/experience/timeline";
import { copy, projects } from "@/content";

/**
 * The whiteboard: philosophy home by default (sticky notes + quote),
 * flips to the active project's rough sketches + retro when a card is in.
 */

const PX = 0.04; // 1px ≙ 1mm (drei transform: 1px = 1/40 unit), same as the monitor
const SHARP = 2; // 2× DOM resolution, scaled down — keeps text crisp when large

export function WhiteboardSurface() {
  // content appears only once the visitor is inside the room
  const visible = useWorkshop(
    (s) => s.phase === "ready" && (s.mode === "overview" || s.progress > 0.08),
  );
  if (!visible) return null;
  return (
    <group position={[L.whiteboard.x, L.whiteboard.y, L.whiteboard.z + 0.075]}>
      <Html
        transform
        occlude
        position={[0, 0, 0.004]}
        scale={PX / SHARP}
        style={{ zoom: SHARP }}
        zIndexRange={[9, 0]}
      >
        <BoardUI />
      </Html>
    </group>
  );
}

function BoardUI() {
  const activeProjectId = useWorkshop((s) => s.activeProjectId);
  const project = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;

  return (
    <div
      className="overflow-hidden text-[#2c2a26]"
      style={{ width: 1440, height: 900, fontFamily: "var(--font-hand)", background: "transparent" }}
    >
      {project ? <ProjectBoard project={project} /> : <PhilosophyBoard />}
    </div>
  );
}

function Sticky({
  color,
  rotate,
  children,
}: {
  color: string;
  rotate: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="px-5 py-4 text-[21px] leading-snug shadow-[2px_3px_8px_#00000022]"
      style={{ background: color, transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  );
}

function PhilosophyBoard() {
  return (
    <div className="relative h-full w-full p-10">
      <div className="text-center text-[46px] tracking-wide text-[#1e3a5f]">
        {copy.desk.whiteboardQuote}
      </div>
      <svg className="mx-auto mt-1" width="520" height="14" viewBox="0 0 520 14">
        <path d="M4 9 C 120 2, 380 14, 516 6" stroke="#1e3a5f" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <div className="mt-10 grid grid-cols-3 gap-8 px-6">
        <Sticky color="#f7e08b" rotate={-2}>
          ship the ugly version first
        </Sticky>
        <Sticky color="#f2a6a6" rotate={1.5}>
          if it can't fail, it can't teach
        </Sticky>
        <Sticky color="#a8d8b9" rotate={-1}>
          climb down to climb higher
        </Sticky>
        <Sticky color="#a6c8f2" rotate={2}>
          boring tech, exciting problems
        </Sticky>
        <Sticky color="#f7e08b" rotate={-1.5}>
          the demo is not the product
        </Sticky>
        <Sticky color="#e0c3f0" rotate={1}>
          write it down or it didn't happen
        </Sticky>
      </div>

      {/* crossed-out branch doodle */}
      <svg className="absolute bottom-8 left-12" width="420" height="150" viewBox="0 0 420 150">
        <g stroke="#4a4640" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M10 75 H 120" />
          <path d="M120 75 C 160 75, 160 30, 205 30" />
          <path d="M120 75 C 160 75, 160 120, 205 120" />
          <rect x="205" y="12" width="130" height="36" rx="8" />
          <rect x="205" y="102" width="130" height="36" rx="8" />
          <path d="M200 8 L 345 52 M 345 8 L 200 52" stroke="#c0392b" />
        </g>
        <text x="222" y="36" fontSize="20" fill="#4a4640" style={{ fontFamily: "var(--font-hand)" }}>plan B ✗</text>
        <text x="222" y="126" fontSize="20" fill="#4a4640" style={{ fontFamily: "var(--font-hand)" }}>iterate ✓</text>
      </svg>

      <div className="absolute right-14 bottom-10 max-w-[340px] rotate-[1.5deg] text-[19px] text-[#6b6558]">
        “{copy.welcome.sketchLine}”
      </div>
    </div>
  );
}

function ProjectBoard({ project }: { project: NonNullable<ReturnType<typeof findProject>> }) {
  return (
    <div className="flex h-full w-full flex-col p-9">
      <div className="flex items-baseline gap-4">
        <span className="text-[34px] text-[#1e3a5f]">{project.title}</span>
        <span className="text-[19px] text-[#8a8478]">— ideation wall</span>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 gap-8">
        {/* rough sketches — the thinking */}
        <div className="flex-1">
          <div className="space-y-4">
            {project.sketch.map((line, i) => (
              <div key={line} className="flex items-start gap-3 text-[22px] leading-snug">
                <span className="text-[#c0392b]">{i === 0 ? "★" : "→"}</span>
                <span style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.4}deg)` }}>{line}</span>
              </div>
            ))}
          </div>
          <svg className="mt-6" width="360" height="110" viewBox="0 0 360 110">
            <g stroke="#4a4640" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <rect x="8" y="30" width="92" height="48" rx="9" />
              <path d="M100 54 H 150" markerEnd="none" />
              <path d="M143 47 L 152 54 L 143 61" />
              <rect x="152" y="30" width="92" height="48" rx="9" />
              <path d="M244 54 H 294" />
              <path d="M287 47 L 296 54 L 287 61" />
              <circle cx="322" cy="54" r="24" />
            </g>
          </svg>
        </div>

        {/* the retro — QA origins showing */}
        <div className="w-[460px] shrink-0 border-l-[3px] border-dashed border-[#b8b2a4] pl-7">
          <div className="text-[24px] text-[#1e3a5f]">retro</div>
          <div className="mt-3 text-[20px] text-[#3a7d54]">what went well</div>
          {project.retro.wentWell.map((l) => (
            <div key={l} className="mt-1.5 flex gap-2 text-[19px] leading-snug">
              <span className="text-[#3a7d54]">＋</span>
              {l}
            </div>
          ))}
          <div className="mt-5 text-[20px] text-[#b3552e]">could've been better</div>
          {project.retro.couldImprove.map((l) => (
            <div key={l} className="mt-1.5 flex gap-2 text-[19px] leading-snug">
              <span className="text-[#b3552e]">－</span>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function findProject(id: string) {
  return projects.find((p) => p.id === id);
}
