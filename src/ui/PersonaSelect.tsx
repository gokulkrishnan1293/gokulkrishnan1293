import { useState } from "react";
import { motion } from "framer-motion";
import { PERSONAS } from "../content/personas";
import { useArc } from "../state/store";
import { Typewriter } from "./Typewriter";

export function PersonaSelect() {
  const setPersona = useArc((s) => s.setPersona);
  const [asked, setAsked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4">
      {/* fade from the door-flood into the cab */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[#d6e9ff]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="glass relative w-[520px] max-w-full rounded-sm p-7"
      >
        <div className="holo-sheen" />
        <div className="mb-1 flex items-center gap-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="hud-label">ELEV.AI · CAB OPERATING SYSTEM</span>
        </div>

        <div className="min-h-[64px] py-3 text-[15px] font-light leading-relaxed text-fg">
          <Typewriter
            text="Good — you walked straight in. No lobby here; the elevator is the interface. One question before we move: who are you?"
            speed={18}
            onDone={() => setAsked(true)}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: asked ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-2"
        >
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              disabled={!asked || !!picked}
              onClick={() => {
                setPicked(p.id);
                setTimeout(() => setPersona(p.id), 900);
              }}
              className={`hairline group flex cursor-pointer items-baseline justify-between px-4 py-3 text-left transition-all duration-300 hover:border-accent/50 hover:bg-accent/5 ${
                picked === p.id ? "border-accent/70 bg-accent/10" : picked ? "opacity-30" : ""
              }`}
            >
              <span className="text-[14px] text-fg">{p.label}</span>
              <span className="font-mono text-[10px] tracking-wider text-dim group-hover:text-accent">
                {p.sub}
              </span>
            </button>
          ))}
        </motion.div>

        <div className="mt-4 hud-label">
          THE ENTIRE EXPERIENCE RE-PRIORITIZES AROUND YOUR ANSWER
        </div>
      </motion.div>
    </div>
  );
}
