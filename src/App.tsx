import { Experience } from "./three/Experience";
import { Chrome } from "./ui/Chrome";
import { BootScreen } from "./ui/BootScreen";
import { IntroCaptions } from "./ui/IntroCaptions";
import { FlashOverlay } from "./ui/FlashOverlay";
import { PersonaSelect } from "./ui/PersonaSelect";
import { ElevatorHUD } from "./ui/ElevatorHUD";
import { FloorView } from "./ui/floors/FloorView";
import { CityFlyHUD } from "./ui/CityFlyHUD";
import { FinaleOverlay } from "./ui/FinaleOverlay";
import { useArc } from "./state/store";

export default function App() {
  const phase = useArc((s) => s.phase);

  return (
    <>
      <Experience />
      <Chrome />
      {phase === "boot" && <BootScreen />}
      {phase === "intro" && <IntroCaptions />}
      {phase === "threshold" && <FlashOverlay />}
      {phase === "persona" && <PersonaSelect />}
      {phase === "ride" && <ElevatorHUD />}
      {phase === "floor" && <FloorView />}
      {phase === "cityFly" && <CityFlyHUD />}
      {phase === "finale" && <FinaleOverlay />}
    </>
  );
}
