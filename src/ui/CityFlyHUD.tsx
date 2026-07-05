import { motion } from "framer-motion";
import { useArc } from "../state/store";
import { districtById } from "../content/districts";
import { PROJECTS } from "../content/projects";
import { floorById } from "../content/floors";

/**
 * Shown while the camera is out over the city, hovering a district.
 * Navigation itself tells the story: the answer flew you here.
 */
export function CityFlyHUD() {
  const flyTarget = useArc((s) => s.flyTarget);
  const endFly = useArc((s) => s.endFly);
  const openFloor = useArc((s) => s.openFloor);
  const setFocusProject = useArc((s) => s.setFocusProject);
  const d = flyTarget ? districtById(flyTarget) : null;
  if (!d) return null;

  const related = PROJECTS.filter((p) => p.district === d.id);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="glass pointer-events-auto w-[480px] max-w-[92vw] p-5"
      >
        <div className="hud-label mb-1" style={{ color: d.color }}>
          CITY TRANSIT · ARRIVED
        </div>
        <h2 className="text-lg font-light text-fg">{d.name}</h2>
        <p className="mb-3 font-mono text-[11px] text-dim">{d.contains.join(" · ")}</p>
        <div className="flex flex-wrap gap-2">
          {related.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setFocusProject(p.id);
                openFloor("living-systems", 0, floorById("living-systems").index);
              }}
              className="cursor-pointer border border-accent/40 px-3 py-1.5 font-mono text-[10px] text-accent transition-colors hover:bg-accent/10"
            >
              ⌂ ENTER {p.name.toUpperCase()}
            </button>
          ))}
          <button
            onClick={endFly}
            className="cursor-pointer border border-line px-3 py-1.5 font-mono text-[10px] text-dim transition-colors hover:text-fg"
          >
            ← RETURN TO ELEVATOR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
