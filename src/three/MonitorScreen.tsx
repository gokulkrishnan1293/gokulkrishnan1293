import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useWorkspace } from "@/state/store";
import { L, screenModeAt, type ScreenMode } from "@/experience/timeline";
import { copy, now, profile, projects, skills, type ProjectDiagram, type ProjectVideo } from "@/content";

/**
 * The monitor is one coherent mini-OS: welcome → file explorer (skills) →
 * project loader (memory cards) → finale / overview hub. Rendered as a DOM
 * layer transformed onto the screen plane.
 */

// drei Html transform: 1px = 1/40 world unit at scale 1.
// We want 1px ≙ 0.001 m (screen is 580×320 px ≙ 0.58×0.32 m) → scale 0.04.
const PX = 0.04;
// render the DOM at 2× and scale down — Html transform rasterizes at layout
// size, so without this the screen goes soft on large/hidpi viewports
const SHARP = 2;

/**
 * 2× rasterization inside a fixed-size box: `zoom` doubles the layout
 * (crisp raster), the counter-scale shrinks it back visually. The outer
 * box keeps its original size so drei's transform anchor stays glued to
 * the 3D object instead of drifting as the camera moves.
 */
export function SharpHtml({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        overflow: "visible",
        // own compositor layer: the camera nudges the CSS matrix every
        // frame, and without this the text re-rasterizes at subpixel
        // offsets — the "dancing letters"
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          zoom: SHARP,
          transform: `scale(${1 / SHARP})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function MonitorScreen() {
  const phase = useWorkspace((s) => s.phase);
  // lit from the moment the door hangs ajar — the glow that pulls you in
  const on = phase !== "loading";
  // occlusion raycasts the whole scene every frame — only worth paying for
  // while the door can actually stand between the camera and the screen
  const nearDoor = useWorkspace((s) => s.mode === "tour" && s.progress < 0.08);

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
          occlude={nearDoor}
          position={[0, 0, 0.004]}
          scale={PX}
          style={{ pointerEvents: "auto" }}
          zIndexRange={[10, 0]}
        >
          <SharpHtml w={620} h={345}>
            <ScreenUI />
          </SharpHtml>
        </Html>
      )}
    </group>
  );
}

function ScreenUI() {
  // subscribe to the derived screen key, not raw progress — the monitor DOM
  // re-renders only when the screen actually changes, not on every scroll tick
  const kind = useWorkspace((s) => screenModeAt(s.progress, s.mode, s.activeProjectId).kind);
  const activeProjectId = useWorkspace((s) => s.activeProjectId);
  const screen: ScreenMode =
    kind === "project" ? { kind: "project", id: activeProjectId ?? "" } : { kind };

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
    case "drives":
      return <DrivesScreen />;
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
        <div className="mt-4 text-[11px] text-[#6c675e]">scroll to step into the workspace ↓</div>
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

// ── Scene 5a: desk beat, nothing plugged in ──────────────────

function DrivesScreen() {
  return (
    <div className="flex h-full flex-col">
      <TitleBar title="~/gokul/projects" dotColor="#ffb454" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="text-[15px] text-[#f0ead9]">
          <span className="cursor-blink text-[#ffb454]">▌</span> no drive detected
        </div>
        <p className="text-[12px] leading-relaxed text-[#9a958a]">{copy.projects.caption}</p>
        <p className="text-[11px] text-[#6c675e]">{copy.projects.hint}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => useWorkspace.getState().plugCard(p.id)}
              className="rounded border border-[#ffffff1c] px-2 py-1 text-[10.5px] text-[#b8b3a6] hover:border-[#ffb45466] hover:text-[#ffb454]"
              style={{ borderLeftColor: p.card.color, borderLeftWidth: 2 }}
            >
              ▸ {p.card.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-[#ffffff12] px-4 py-1.5 text-[10.5px] text-[#5b564d]">
        {projects.length} drives on the desk · plug one in to load it
      </div>
    </div>
  );
}

// ── Scene 5: project loaded from a memory card ───────────────

function ProjectScreen({ id }: { id: string }) {
  const project = projects.find((p) => p.id === id);
  const openOverlay = useWorkspace((s) => s.openOverlay);
  const plugCard = useWorkspace((s) => s.plugCard);
  const [folder, setFolder] = useState<"architecture" | "demo" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setFolder(null);
    ref.current?.scrollTo({ top: 0 });
  }, [id]);
  if (!project) return <DimScreen />;
  const diagrams = project.media?.architecture ?? [];
  const videos = project.media?.videos ?? [];
  return (
    <div className="relative flex h-full flex-col">
      <TitleBar
        title={`card://${project.card.label.toLowerCase()}${folder ? `/${folder}` : ""}`}
        dotColor={project.card.color}
      />
      <button
        onClick={() => plugCard(null)}
        className="absolute top-1 right-2 rounded px-2 py-1 text-[11px] text-[#6c675e] hover:text-[#e8e4da]"
        title="back to the desk"
      >
        ⏏ eject
      </button>
      {folder !== null && (
        <button
          onClick={() => setFolder(null)}
          className="absolute top-1 right-16 rounded px-2 py-1 text-[11px] text-[#6c675e] hover:text-[#e8e4da]"
        >
          ◂ back
        </button>
      )}
      <div ref={ref} className="panel-scroll min-h-0 flex-1 overflow-y-auto p-5">
        {folder === "architecture" ? (
          <ArchitectureFolder diagrams={diagrams} />
        ) : folder === "demo" ? (
          <DemoFolder videos={videos} />
        ) : (
          <>
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
            {(diagrams.length > 0 || videos.length > 0) && (
              <div className="mt-4 flex gap-2">
                {diagrams.length > 0 && (
                  <button
                    onClick={() => setFolder("architecture")}
                    className="rounded border border-[#ffffff1c] px-2.5 py-1.5 text-[11.5px] text-[#b8b3a6] hover:border-[#6f87a866] hover:text-[#d8d4c8]"
                  >
                    🗀 architecture/ <span className="text-[#5b564d]">{diagrams.length}</span>
                  </button>
                )}
                {videos.length > 0 && (
                  <button
                    onClick={() => setFolder("demo")}
                    className="rounded border border-[#ffffff1c] px-2.5 py-1.5 text-[11.5px] text-[#b8b3a6] hover:border-[#6f87a866] hover:text-[#d8d4c8]"
                  >
                    🗀 demo/ <span className="text-[#5b564d]">{videos.length}</span>
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => openOverlay({ kind: "project", id })}
              className="mt-4 rounded border border-[#ffb45455] px-3 py-1.5 text-[11.5px] text-[#ffb454] hover:bg-[#ffb45415]"
            >
              open full case study →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ArchitectureFolder({ diagrams }: { diagrams: ProjectDiagram[] }) {
  return (
    <div className="space-y-4">
      {diagrams.map((d) => (
        <figure key={d.img}>
          <img src={d.img} alt={d.caption ?? "architecture diagram"} className="w-full rounded border border-[#ffffff12] bg-[#0b0c10]" />
          {d.caption && <figcaption className="mt-1 text-[10.5px] text-[#9a958a]">{d.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function DemoFolder({ videos }: { videos: ProjectVideo[] }) {
  const [active, setActive] = useState(0);
  const video = videos[Math.min(active, videos.length - 1)];
  return (
    <div className="flex h-full flex-col">
      {/* preload=none: nothing streams until the visitor presses play */}
      <video
        key={video.src}
        controls
        playsInline
        preload="none"
        poster={video.poster}
        src={video.src}
        className="max-h-[205px] w-full rounded bg-black"
      />
      <div className="mt-1.5 text-[11px] text-[#9a958a]">{video.title}</div>
      {videos.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {videos.map((v, i) => (
            <button
              key={v.src}
              onClick={() => setActive(i)}
              className={`rounded border px-2 py-1 text-[10.5px] ${
                i === active
                  ? "border-[#ffb45455] text-[#ffb454]"
                  : "border-[#ffffff1c] text-[#b8b3a6] hover:text-[#d8d4c8]"
              }`}
            >
              ▶ {v.title}
            </button>
          ))}
        </div>
      )}
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
