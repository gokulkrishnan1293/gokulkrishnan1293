import { useEffect, useMemo } from "react";
import { useWorkspace } from "@/state/store";
import { SCENES, PEAK_X, PEAK_Y, range, smooth, clamp01 } from "@/experience/timeline";
import { copy, journey } from "@/content";

/**
 * Scene 3 — we dive through the framed photo and land on the drawing
 * itself: a climb graph on graph paper. Peaks rise left to right, one per
 * era; a marker line is drawn peak to peak as the visitor scrolls. The
 * tallest summit hides in clouds — no flag planted.
 *
 * Everything is generated (SVG + CSS grid) — no image seams, crisp at any
 * zoom, and content comes straight from journey.yaml.
 *
 * Also serves as a browsable overlay in Overview (click the frame).
 */
export function JourneyOverlay() {
  const progress = useWorkspace((s) => s.progress);
  const mode = useWorkspace((s) => s.mode);
  const overlay = useWorkspace((s) => s.overlay);
  const openOverlay = useWorkspace((s) => s.openOverlay);

  const browsing = mode === "overview" && overlay?.kind === "philosophy";

  useEffect(() => {
    if (!browsing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openOverlay(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [browsing, openOverlay]);

  // tour: fade in as the camera reaches the glass, out on the way back
  const IN0 = SCENES.frameIn.end - 0.025;
  const t0 = SCENES.journey.start;
  const t1 = SCENES.journey.end;
  const tourOpacity =
    Math.min(range(progress, IN0, SCENES.journey.start), 1 - range(progress, t1, SCENES.frameOut.end - 0.01));

  const visible = browsing || (mode === "tour" && tourOpacity > 0.01);
  // journey position 0..1 across the range
  const jp = browsing ? -1 : clamp01(range(progress, t0, t1));

  if (!visible) return null;
  return (
    <ClimbScene
      opacity={browsing ? 1 : tourOpacity}
      jp={jp}
      browsing={browsing}
      onClose={browsing ? () => openOverlay(null) : undefined}
    />
  );
}

/** graph-paper backdrop — repeats forever, so the pan never hits an edge */
const PAPER: React.CSSProperties = {
  backgroundColor: "#f2ecdc",
  backgroundImage:
    "repeating-linear-gradient(0deg, #ddd5bd 0px, #ddd5bd 1px, transparent 1px, transparent 46px)," +
    "repeating-linear-gradient(90deg, #ddd5bd 0px, #ddd5bd 1px, transparent 1px, transparent 46px)",
};

function ClimbScene({
  opacity,
  jp,
  browsing,
  onClose,
}: {
  opacity: number;
  jp: number;
  browsing: boolean;
  onClose?: () => void;
}) {
  // the graph strip is 3:1 → at height 100vh its width is 300vh
  const STRIP_W = "300vh";

  // continuous pan: interpolate across peak positions
  // (slightly ahead of scroll so the last summit gets a held beat)
  const seg = 1 / (PEAK_X.length - 1);
  const fi = browsing ? PEAK_X.length - 1 : Math.min(1, jp * 1.06) / seg;
  const i = Math.min(PEAK_X.length - 2, Math.floor(fi));
  const frac = smooth(clamp01(fi - i));
  const peakFrac = PEAK_X[i] + (PEAK_X[i + 1] - PEAK_X[i]) * frac;

  // which entry is "active" (nearest peak) and how close we are to it
  const nearest = Math.round(fi);
  const dist = Math.abs(fi - nearest); // 0 at summit, 0.5 in valley
  const summitOpacity = clamp01(1 - dist * 3.2);
  const valleyOpacity = clamp01((dist - 0.2) * 3.2);
  const entry = journey[Math.min(nearest, journey.length - 1)];
  const valleyEntry = journey[Math.min(i, journey.length - 1)];
  const isLast = nearest === journey.length - 1;

  const introOpacity = browsing ? 0 : clamp01(1 - jp * 12);

  return (
    <div className="fixed inset-0 z-20" style={{ opacity }}>
      {/* the drawing */}
      <div className="absolute inset-0 overflow-hidden" style={PAPER}>
        {browsing ? (
          <div className="flex h-full items-start justify-center pt-[7vh]">
            <ClimbGraph fi={PEAK_X.length - 1} className="w-[96vw] max-w-[1400px]" />
          </div>
        ) : (
          <div
            className="absolute top-0 h-full"
            style={{
              width: STRIP_W,
              transform: `translateX(calc(50vw - ${peakFrac} * ${STRIP_W}))`,
              transition: "none",
            }}
          >
            <ClimbGraph fi={fi} className="h-full w-full" />
          </div>
        )}

        {/* vignette so the paper meets the dark room */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_18vh_#0a0a0c99]" />
      </div>

      {browsing ? (
        <BrowseTags onClose={onClose} />
      ) : (
        <>
          {/* opening beat */}
          <div
            className="absolute inset-x-0 top-[14vh] px-8 text-center"
            style={{ opacity: introOpacity }}
          >
            <p className="mx-auto max-w-[620px] text-[clamp(18px,2.6vw,26px)] leading-snug text-[#41392c]" style={{ fontFamily: "var(--font-hand)" }}>
              “{copy.journey.intro}”
            </p>
          </div>

          {/* summit tag */}
          <div
            className="absolute inset-x-0 bottom-[14vh] flex justify-center px-6"
            style={{ opacity: summitOpacity }}
          >
            <div className="max-w-[520px] rounded-sm border-2 border-[#41392c] bg-[#f7f2e3] px-6 py-4 text-[#2c2a26] shadow-[4px_5px_0_#41392c33]" style={{ fontFamily: "var(--font-hand)" }}>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-[clamp(17px,2.2vw,22px)] font-bold">{entry.role}</span>
                <span className="text-[13px] text-[#8a8478]">
                  {entry.company ? `${entry.company} · ` : ""}
                  {entry.period}
                </span>
              </div>
              <div className="mt-1.5 text-[clamp(13px,1.7vw,16px)] leading-snug">{entry.summit}</div>
              {isLast && (
                <div className="mt-2 text-[12.5px] text-[#8a6a3a]">▲ current climb — still on the way up, no flag yet</div>
              )}
            </div>
          </div>

          {/* valley leap */}
          <div
            className="absolute inset-x-0 bottom-[16vh] flex justify-center px-6"
            style={{ opacity: valleyOpacity }}
          >
            <p className="max-w-[480px] text-center text-[clamp(14px,1.9vw,18px)] leading-snug text-[#5b5142] italic" style={{ fontFamily: "var(--font-hand)" }}>
              ↓ {valleyEntry.valley}
            </p>
          </div>

          {/* progress dots — one per peak */}
          <div className="absolute inset-x-0 bottom-[7vh] flex justify-center gap-2.5">
            {journey.map((_, k) => (
              <span
                key={k}
                className="h-[7px] w-[7px] rounded-full border border-[#41392c]"
                style={{ background: k <= nearest ? "#41392c" : "transparent", opacity: 0.7 }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── the graph itself ─────────────────────────────────────────
// viewBox 300×100 over a 300vh×100vh strip → 1 unit ≙ 1vh, no distortion.

const W = 300;
const H = 100;
const BASE_Y = 92;

/** full route: approach + peaks with valley dips between them */
function buildRoute(): [number, number][] {
  const pts: [number, number][] = [[PEAK_X[0] * W - 16, PEAK_Y[0] * H + 20]];
  for (let k = 0; k < PEAK_X.length; k++) {
    pts.push([PEAK_X[k] * W, PEAK_Y[k] * H]);
    if (k < PEAK_X.length - 1) {
      pts.push([
        ((PEAK_X[k] + PEAK_X[k + 1]) / 2) * W,
        Math.max(PEAK_Y[k], PEAK_Y[k + 1]) * H + 13,
      ]);
    }
  }
  return pts;
}

const ROUTE = buildRoute();
// the current climb never summits on screen: the dot stops halfway up the
// last slope, and the ridge keeps rising into the clouds past the edge
const LAST_VALLEY = ROUTE[ROUTE.length - 2];
const LAST_PEAK = ROUTE[ROUTE.length - 1];
const MAX_TIP_X = (LAST_VALLEY[0] + LAST_PEAK[0]) / 2;
const toPath = (pts: [number, number][]) =>
  pts.map(([x, y], k) => `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

function ClimbGraph({ fi, className }: { fi: number; className?: string }) {
  // silhouette: rises out of the baseline and keeps climbing off-canvas
  const silhouette = useMemo(() => {
    return `M0 ${BASE_Y} L${ROUTE[0][0] - 20} ${BASE_Y} ${toPath(ROUTE).replace(/^M/, "L")} L${W} 0 L${W} ${H} L0 ${H} Z`;
  }, []);

  // the drawn part of the climb, clipped at the camera's current x —
  // and never past the middle of the final ascent (still climbing)
  const seg = Math.min(Math.floor(fi), PEAK_X.length - 2);
  const segFrac = smooth(clamp01(fi - seg));
  const tipX = Math.min(MAX_TIP_X, (PEAK_X[seg] + (PEAK_X[seg + 1] - PEAK_X[seg]) * segFrac) * W);
  const drawn: [number, number][] = [];
  let tip: [number, number] | null = null;
  for (let k = 0; k < ROUTE.length; k++) {
    const [x, y] = ROUTE[k];
    if (x <= tipX) {
      drawn.push([x, y]);
      continue;
    }
    if (k > 0) {
      const [px, py] = ROUTE[k - 1];
      const f = clamp01((tipX - px) / (x - px));
      tip = [px + (x - px) * f, py + (y - py) * f];
    }
    break;
  }
  if (tip) drawn.push(tip);
  const head = drawn[drawn.length - 1];
  const lastIdx = PEAK_X.length - 1;

  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* the mountain profile */}
      <path d={silhouette} fill="#e4dcc4" stroke="none" opacity={0.9} />
      <path d={toPath(ROUTE)} fill="none" stroke="#8a8064" strokeWidth={0.4} strokeLinejoin="round" strokeLinecap="round" />
      {/* the ridge ahead — unwritten, fading into the clouds */}
      <path
        d={`M${LAST_PEAK[0]} ${LAST_PEAK[1]} L${W} 0`}
        fill="none"
        stroke="#8a8064"
        strokeWidth={0.35}
        strokeDasharray="1.6 1.8"
        opacity={0.55}
      />
      {/* baseline */}
      <line x1={0} y1={BASE_Y} x2={W} y2={BASE_Y} stroke="#8a8064" strokeWidth={0.35} opacity={0.7} />

      {/* flags + era labels on every conquered peak */}
      {PEAK_X.map((px, k) => {
        const x = px * W;
        const y = PEAK_Y[k] * H;
        if (k === lastIdx) return null;
        return (
          <g key={k}>
            <line x1={x} y1={y} x2={x} y2={y - 6.5} stroke="#55503f" strokeWidth={0.4} />
            <path d={`M${x} ${y - 6.5} L${x + 4} ${y - 5.4} L${x} ${y - 4.3} Z`} fill="#b3552e" />
            <text x={x} y={y - 8.4} textAnchor="middle" fontSize={2.6} fill="#6b6252" fontFamily="var(--font-mono)">
              {journey[k]?.period}
            </text>
          </g>
        );
      })}

      {/* the current climb — label rides beside the climber's stop point */}
      <text
        x={MAX_TIP_X - 3}
        y={(LAST_VALLEY[1] + LAST_PEAK[1]) / 2 - 4}
        textAnchor="end"
        fontSize={2.6}
        fill="#8a6a3a"
        fontFamily="var(--font-mono)"
      >
        {journey[lastIdx]?.period}
      </text>

      {/* the whole route, faintly planned in pencil */}
      <path d={toPath(ROUTE)} fill="none" stroke="#9a917c" strokeWidth={0.28} strokeDasharray="0.7 1.6" opacity={0.6} />

      {/* the climb so far — marker line + climber */}
      {drawn.length >= 2 && (
        <path
          d={toPath(drawn)}
          fill="none"
          stroke="#c0392b"
          strokeWidth={0.55}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
          strokeDasharray="2.2 1.4"
        />
      )}
      {head && fi > 0.01 && (
        <>
          <circle cx={head[0]} cy={head[1]} r={1.1} fill="#c0392b" />
          <circle cx={head[0]} cy={head[1]} r={2.1} fill="none" stroke="#c0392b" strokeWidth={0.3} opacity={0.5} />
        </>
      )}
    </svg>
  );
}

/** Overview-mode browse: whole climb visible, entries listed below. */
function BrowseTags({ onClose }: { onClose?: () => void }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 bottom-0 max-h-[46vh] overflow-y-auto bg-gradient-to-t from-[#0a0a0cf0] via-[#0a0a0cd8] to-transparent px-6 pt-16 pb-8 panel-scroll">
        <div className="mx-auto grid max-w-[980px] gap-2.5 sm:grid-cols-2">
          {journey.map((entry, k) => (
            <div key={k} className="rounded border border-[#ffffff1e] bg-[#141417cc] px-4 py-2.5 font-mono">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] text-[#e8e4da]">{entry.role}</span>
                <span className="text-[10.5px] text-[#6c675e]">{entry.period}</span>
              </div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-[#9a958a]">{entry.summit}</div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-[980px] text-center font-mono text-[11px] text-[#6c675e]">
          {copy.journey.outro}
        </p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-16 right-6 rounded border border-[#00000030] bg-[#f4eedfcc] px-3 py-1.5 font-mono text-[12px] text-[#2c2a26] hover:bg-[#f4eedf]"
      >
        ✕ back to the room
      </button>
    </div>
  );
}
