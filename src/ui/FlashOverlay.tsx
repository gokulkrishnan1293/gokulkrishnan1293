import { useEffect } from "react";
import { motion } from "framer-motion";
import { useArc } from "../state/store";

/**
 * The threshold: glass doors flood the frame with light; behind the flood we
 * swap city → elevator. One cut, no lobby — as scripted.
 */
export function FlashOverlay() {
  const setPhase = useArc((s) => s.setPhase);
  const log = useArc((s) => s.log);

  useEffect(() => {
    const t = setTimeout(() => {
      log("SYS", "tower doors open · no lobby · elevator direct");
      setPhase("persona");
    }, 2100);
    return () => clearTimeout(t);
  }, [setPhase, log]);

  return (
    <motion.div
      className="fixed inset-0 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.25, 1] }}
      transition={{ duration: 2.0, times: [0, 0.55, 1], ease: "easeIn" }}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(214,233,255,0.98) 0%, rgba(111,211,255,0.9) 45%, rgba(5,7,13,0.95) 100%)",
      }}
    >
      <div className="flex h-full items-end justify-center pb-24">
        <p className="font-mono text-[11px] tracking-[0.35em] text-void/70">
          THE DOORS ARE ALREADY OPEN
        </p>
      </div>
    </motion.div>
  );
}
