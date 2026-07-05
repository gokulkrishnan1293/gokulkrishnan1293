import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CityScene } from "./CityScene";
import { ElevatorScene } from "./ElevatorScene";
import { useArc, type Phase } from "../state/store";

const CITY_PHASES: Phase[] = ["boot", "intro", "threshold", "cityFly", "finale"];

export function Experience() {
  const phase = useArc((s) => s.phase);
  const inCity = CITY_PHASES.includes(phase);

  return (
    <div className="fixed inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 55, near: 0.1, far: 900, position: [190, 95, 210] }}
      >
        <Suspense fallback={null}>{inCity ? <CityScene /> : <ElevatorScene />}</Suspense>
      </Canvas>
      {/* subtle vignette so 3D reads cinematic, UI reads OS */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(3,4,8,0.55) 100%)",
        }}
      />
    </div>
  );
}
