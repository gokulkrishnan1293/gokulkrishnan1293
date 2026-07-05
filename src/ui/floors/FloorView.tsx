import { motion } from "framer-motion";
import { useArc } from "../../state/store";
import { floorById } from "../../content/floors";
import { personaById } from "../../content/personas";
import { TravelOverlay } from "../TravelOverlay";
import { ArrivalFloor } from "./ArrivalFloor";
import { EngineeringFloor } from "./EngineeringFloor";
import { PipelineFloor } from "./PipelineFloor";
import { SystemsFloor } from "./SystemsFloor";
import { DecisionsFloor } from "./DecisionsFloor";
import { FailuresFloor } from "./FailuresFloor";
import { FutureFloor } from "./FutureFloor";

const CONTENT: Record<string, React.ComponentType> = {
  arrival: ArrivalFloor,
  engineering: EngineeringFloor,
  "ai-architecture": PipelineFloor,
  "living-systems": SystemsFloor,
  decisions: DecisionsFloor,
  failures: FailuresFloor,
  future: FutureFloor,
};

export function FloorView() {
  const floor = useArc((s) => s.floor);
  const traveling = useArc((s) => s.traveling);
  const persona = useArc((s) => s.persona);
  const closeFloor = useArc((s) => s.closeFloor);
  if (!floor) return null;
  if (traveling) return <TravelOverlay />;

  const meta = floorById(floor);
  const p = persona ? personaById(persona) : null;
  const Body = CONTENT[floor];

  const emphasisKey =
    floor === "engineering" ? "engineering"
    : floor === "ai-architecture" ? "pipeline"
    : floor === "living-systems" ? "systems"
    : floor === "decisions" ? "decisions"
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-20 flex flex-col overflow-hidden pt-14"
    >
      {/* scrim: the cab stays visible at the edges, content sits on glass */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(5,7,13,0.90) 0%, rgba(5,7,13,0.84) 70%, rgba(5,7,13,0.68) 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pb-4 sm:px-8">
        {/* chapter header */}
        <div className="mb-4 flex items-end justify-between border-b border-line pb-3">
          <div>
            <div className="hud-label mb-1">{meta.chapter.toUpperCase()} · FLOOR {meta.index}</div>
            <h1 className="text-xl font-light tracking-wide text-fg sm:text-2xl">{meta.title}</h1>
          </div>
          <button
            onClick={closeFloor}
            className="cursor-pointer border border-line px-3 py-2 font-mono text-[10px] tracking-[0.25em] text-dim transition-colors hover:border-accent/40 hover:text-accent"
          >
            ← ELEVATOR
          </button>
        </div>

        {/* persona lens line — the adaptation made visible */}
        {p && emphasisKey && (
          <div className="mb-4 border-l-2 border-accent-2/60 pl-3 text-[12px] italic leading-relaxed text-fg/60">
            <span className="hud-label not-italic text-accent-2">{p.lens} LENS · </span>
            {p.emphasis[emphasisKey as keyof typeof p.emphasis]}
          </div>
        )}

        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pb-8 pr-1">
          <Body />
        </div>
      </div>
    </motion.div>
  );
}
