import { useEffect } from "react";
import { useWorkspace } from "@/state/store";
import { failures, projects } from "@/content";
import { copy } from "@/content";

/**
 * Long-form always reads as a clean 2D overlay — never inside the 3D scene.
 * Handles project case studies and shelf postmortems.
 */
export function ReadingPanel() {
  const overlay = useWorkspace((s) => s.overlay);
  const openOverlay = useWorkspace((s) => s.openOverlay);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openOverlay(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay, openOverlay]);

  if (!overlay || overlay.kind === "philosophy") return null;

  const close = () => openOverlay(null);

  if (overlay.kind === "project") {
    const p = projects.find((x) => x.id === overlay.id);
    if (!p) return null;
    return (
      <Shell onClose={close} accent={p.card.color}>
        <div className="font-mono text-[11px] tracking-widest" style={{ color: p.card.color }}>
          {p.card.label} · {p.period} · {p.status}
        </div>
        <h2 className="mt-1 text-[26px] leading-tight text-[#f0ead9]">{p.title}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#b8b3a6]">{p.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span key={s} className="rounded border border-[#ffffff1c] px-2 py-0.5 font-mono text-[11px] text-[#9a958a]">
              {s}
            </span>
          ))}
        </div>
        <Markdown body={p.body} />
        <div className="mt-8 grid gap-4 border-t border-[#ffffff14] pt-6 sm:grid-cols-2">
          <div>
            <div className="font-mono text-[12px] text-[#5aa06f]">＋ what went well</div>
            <ul className="mt-2 space-y-1.5">
              {p.retro.wentWell.map((l) => (
                <li key={l} className="text-[13px] leading-snug text-[#b8b3a6]">{l}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-mono text-[12px] text-[#c47a4a]">－ could've been better</div>
            <ul className="mt-2 space-y-1.5">
              {p.retro.couldImprove.map((l) => (
                <li key={l} className="text-[13px] leading-snug text-[#b8b3a6]">{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </Shell>
    );
  }

  const f = failures.find((x) => x.id === overlay.id);
  if (!f) return null;
  return (
    <Shell onClose={close} accent="#8a8478">
      <div className="font-mono text-[11px] tracking-widest text-[#8a8478]">
        FROM THE SHELF · {f.year} · “{f.label}”
      </div>
      <h2 className="mt-1 text-[26px] leading-tight text-[#f0ead9]">{f.title}</h2>
      <p className="mt-2 font-mono text-[12px] text-[#6c675e] italic">{copy.shelf.line}</p>
      <Markdown body={f.body} />
    </Shell>
  );
}

function Shell({
  children,
  onClose,
  accent,
}: {
  children: React.ReactNode;
  onClose: () => void;
  accent: string;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#050506cc] p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="panel-scroll relative max-h-[86vh] w-full max-w-[680px] overflow-y-auto rounded-lg border bg-[#101116] p-7 shadow-2xl sm:p-9"
        style={{ borderColor: `${accent}44` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded px-2 py-1 font-mono text-[13px] text-[#6c675e] hover:text-[#e8e4da]"
        >
          esc ✕
        </button>
        {children}
      </div>
    </div>
  );
}

/** Tiny markdown renderer — headings, paragraphs, lists, bold. Content is ours. */
function Markdown({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/);
  return (
    <div className="mt-2">
      {blocks.map((block, i) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith("## "))
          return (
            <h3 key={i} className="mt-6 font-mono text-[13px] tracking-wide text-[#ffb454]">
              {b.slice(3)}
            </h3>
          );
        if (/^[-*] /m.test(b)) {
          // fold hard-wrapped continuation lines into their bullet
          const items = b.split("\n").reduce<string[]>((acc, line) => {
            if (/^[-*] /.test(line)) acc.push(line.replace(/^[-*] /, ""));
            else if (acc.length) acc[acc.length - 1] += ` ${line.trim()}`;
            else acc.push(line.trim());
            return acc;
          }, []);
          return (
            <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5">
              {items.map((item, j) => (
                <li key={j} className="text-[13.5px] leading-relaxed text-[#b8b3a6]">
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mt-3 text-[13.5px] leading-relaxed text-[#b8b3a6]">
            <Inline text={b.replace(/\n/g, " ")} />
          </p>
        );
      })}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="text-[#e8e4da]">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
