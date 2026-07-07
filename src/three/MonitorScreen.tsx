import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useWorkshop } from "@/state/store";
import { L, screenModeAt, type ScreenMode } from "@/experience/timeline";
import { copy, now, profile, projects, skills } from "@/content";

/**
 * The monitor is one coherent mini-OS: welcome → file explorer (skills) →
 * project loader (memory cards) → finale / overview hub. Rendered as a DOM
 * layer transformed onto the screen plane.
 */

// drei Html transform: 1px = 1/40 world unit at scale 1.
// We want 1px ≙ 0.001 m (screen is 580×320 px ≙ 0.58×0.32 m) → scale 0.04.
const PX = 0.04;

export function MonitorScreen() {
  const phase = useWorkshop((s) => s.phase);
  const on = phase === "ready";

  return (
    <group position={[L.screenCenter.x, L.screenCenter.y, L.screenCenter.z]}>
      {/* emissive glass — the light source look */}
      <mesh>
        <planeGeometry args={[L.screenSize.w, L.screenSize.h]} />
        <meshStandardMaterial
          color="#0c0d12"
          emissive={on ? "#fff3dd" : "#000000"}
          emissiveIntensity={on ? 0.32 : 0}
        />
      </mesh>
      {on && (
        <Html
          transform
          position={[0, 0, 0.004]}
          scale={PX}
          style={{ pointerEvents: "auto" }}
          zIndexRange={[10, 0]}
        >
          <ScreenUI />
        </Html>
      )}
    </group>
  );
}

function ScreenUI() {
  const progress = useWorkshop((s) => s.progress);
  const mode = useWorkshop((s) => s.mode);
  const activeProjectId = useWorkshop((s) => s.activeProjectId);
  const screen = screenModeAt(progress, mode, activeProjectId);

  return (
    <div
      className="overflow-hidden rounded-[6px] bg-[#0e0f14] text-[#d8d4c8]"
      style={{ width: 620, height: 345, fontFamily: "var(--font-mono)" }}
    >
      <ScreenBody screen={screen} />
    </div>
  );
}

function ScreenBody({ screen }: { screen: ScreenMode }) {
  switch (screen.kind) {
    case "welcome":
      return <WelcomeScreen />;
    case "dim":
      return <DimScreen />;
    case "skills":
      return <SkillsExplorer />;
    case "project":
      return <ProjectScreen id={screen.id} />;
    case "finale":
      return <FinaleScreen />;
    case "hub":
      return <HubScreen />;
  }
}

// ── Scene 1: welcome ─────────────────────────────────────────

function RoleFlipper() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= profile.roles.length - 1) return;
    const t = setTimeout(() => setI((n) => n + 1), 850);
    return () => clearTimeout(t);
  }, [i]);
  const last = i === profile.roles.length - 1;
  return (
    <span className={last ? "text-[#ffb454]" : "text-[#9a958a]"}>{profile.roles[i]}</span>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-6 bg-gradient-to-b from-[#141118] to-[#0e0f14] px-8">
      <div className="character pose-wave character-bob shrink-0" style={{ width: 130, height: 190 }} />
      <div className="min-w-0">
        <div className="fade-up text-[26px] leading-tight text-[#f0ead9]">{copy.welcome.greeting}</div>
        <div className="mt-2 text-[16px]">
          <RoleFlipper />
          <span className="cursor-blink text-[#ffb454]">▌</span>
        </div>
        <div className="mt-5 text-[12px] italic text-[#9a958a]">“{copy.welcome.sketchLine}”</div>
        <div className="mt-4 text-[11px] text-[#6c675e]">scroll to step into the workshop ↓</div>
      </div>
    </div>
  );
}

function DimScreen() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0b0c10]">
      <div className="text-[13px] text-[#3d3f48]">— away climbing —</div>
    </div>
  );
}

// ── Scene 4: skills as files ─────────────────────────────────

function SkillsExplorer() {
  const [open, setOpen] = useState(skills[0]?.folder ?? "ai");
  const group = skills.find((g) => g.folder === open) ?? skills[0];
  return (
    <div className="flex h-full flex-col">
      <TitleBar title="~/gokul/skills" />
      <div className="flex min-h-0 flex-1">
        <div className="w-[170px] shrink-0 border-r border-[#ffffff12] py-2">
          {skills.map((g) => (
            <button
              key={g.folder}
              onClick={() => setOpen(g.folder)}
              className={`block w-full px-4 py-1.5 text-left text-[13px] ${
                g.folder === open ? "bg-[#ffb45418] text-[#ffb454]" : "text-[#b8b3a6] hover:bg-[#ffffff08]"
              }`}
            >
              {g.folder === open ? "▾" : "▸"} {g.folder}/
            </button>
          ))}
        </div>
        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-x-4 gap-y-1.5 overflow-hidden p-4">
          {group.items.map((it) => (
            <div key={it.name} className="flex items-center gap-2 text-[12.5px] text-[#d8d4c8]">
              <span className="text-[#6f87a8]">▤</span>
              {it.name}
              <span className="text-[#5b564d]">.{it.ext}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[#ffffff12] px-4 py-1.5 text-[10.5px] text-[#5b564d]">
        {skills.reduce((n, g) => n + g.items.length, 0)} files · current stack · updated from git
      </div>
    </div>
  );
}

// ── Scene 5: project loaded from a memory card ───────────────

function ProjectScreen({ id }: { id: string }) {
  const project = projects.find((p) => p.id === id);
  const openOverlay = useWorkshop((s) => s.openOverlay);
  const plugCard = useWorkshop((s) => s.plugCard);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [id]);
  if (!project) return <DimScreen />;
  return (
    <div className="relative flex h-full flex-col">
      <TitleBar title={`card://${project.card.label.toLowerCase()}`} dotColor={project.card.color} />
      <button
        onClick={() => plugCard(null)}
        className="absolute top-1 right-2 rounded px-2 py-1 text-[11px] text-[#6c675e] hover:text-[#e8e4da]"
        title="back to the desk"
      >
        ⏏ eject
      </button>
      <div ref={ref} className="panel-scroll min-h-0 flex-1 overflow-y-auto p-5">
        <div className="text-[19px] leading-snug text-[#f0ead9]">{project.title}</div>
        <div className="mt-0.5 text-[11px] text-[#9a958a]">
          {project.period} · {project.status}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-[#c9c4b6]">{project.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span key={s} className="rounded border border-[#ffffff1c] px-1.5 py-0.5 text-[10px] text-[#b8b3a6]">
              {s}
            </span>
          ))}
        </div>
        <button
          onClick={() => openOverlay({ kind: "project", id })}
          className="mt-4 rounded border border-[#ffb45455] px-3 py-1.5 text-[11.5px] text-[#ffb454] hover:bg-[#ffb45415]"
        >
          open full case study →
        </button>
      </div>
    </div>
  );
}

// ── Scene 6: finale ──────────────────────────────────────────

function FinaleScreen() {
  return (
    <div className="flex h-full items-center gap-5 bg-gradient-to-b from-[#12101a] to-[#0e0f14] px-7">
      <div className="character pose-invite character-bob shrink-0" style={{ width: 120, height: 180 }} />
      <div className="min-w-0 flex-1">
        <div className="text-[17px] leading-snug text-[#f0ead9]">{copy.finale.question}</div>
        <div className="mt-3 font-mono text-[11.5px] text-[#9a958a]">
          <span className="text-[#5aa06f]">$</span> {copy.finale.building.toLowerCase()}
          {now.map((line) => (
            <div key={line} className="pl-3 text-[#c9c4b6]">
              · {line}
            </div>
          ))}
        </div>
        <ContactRow />
      </div>
    </div>
  );
}

export function ContactRow({ compact = false }: { compact?: boolean }) {
  const links = profile.links;
  const cls =
    "rounded border border-[#ffffff22] px-2.5 py-1 text-[11px] text-[#d8d4c8] hover:border-[#ffb45466] hover:text-[#ffb454]";
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-4"}`}>
      <a className={cls} href={`mailto:${links.email}`}>email</a>
      <a className={cls} href={links.github} target="_blank" rel="noreferrer">github</a>
      <a className={cls} href={links.linkedin} target="_blank" rel="noreferrer">linkedin</a>
      <a className={cls} href={links.resume} download>résumé ⬇</a>
    </div>
  );
}

// ── Overview: the hub ────────────────────────────────────────

function HubScreen() {
  return (
    <div className="flex h-full items-center gap-5 bg-gradient-to-b from-[#101216] to-[#0e0f14] px-7">
      <div className="character pose-point character-bob shrink-0" style={{ width: 110, height: 170 }} />
      <div className="min-w-0 flex-1">
        <div className="text-[16px] text-[#f0ead9]">{copy.overview.hubTitle}</div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#9a958a]">{copy.overview.hubIntro}</p>
        <ul className="mt-2 space-y-0.5 text-[11px] text-[#b8b3a6]">
          <li>▸ memory cards → projects</li>
          <li>▸ mountain frame → the journey</li>
          <li>▸ the chair → try it</li>
        </ul>
        <ContactRow compact />
      </div>
    </div>
  );
}

function TitleBar({ title, dotColor = "#5aa06f" }: { title: string; dotColor?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#ffffff12] px-4 py-2">
      <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
      <span className="text-[11px] text-[#9a958a]">{title}</span>
    </div>
  );
}
