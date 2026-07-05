import type { FloorId, PersonaId } from "../state/store";

export interface FloorMeta {
  id: FloorId;
  index: number; // physical floor number shown on the counter
  chapter: string; // chapter name, never "page"
  title: string;
  tagline: string;
  district: string; // which city district this chapter maps to
}

export const FLOORS: FloorMeta[] = [
  {
    id: "arrival",
    index: 1,
    chapter: "01 · Arrival",
    title: "You are inside the architect's mind",
    tagline: "How this city works, and why it exists.",
    district: "core",
  },
  {
    id: "engineering",
    index: 12,
    chapter: "02 · Engineering",
    title: "Ten years of load-bearing walls",
    tagline: "The full-stack decade that AI work stands on.",
    district: "engineering",
  },
  {
    id: "ai-architecture",
    index: 24,
    chapter: "03 · AI Architecture",
    title: "Ask the city",
    tagline: "A live retrieval pipeline. Every stage exposed.",
    district: "ai",
  },
  {
    id: "living-systems",
    index: 31,
    chapter: "04 · Living Systems",
    title: "Architecture that breathes",
    tagline: "Watch real requests move through real systems.",
    district: "ai",
  },
  {
    id: "decisions",
    index: 40,
    chapter: "05 · Decisions",
    title: "Architecture Decision Records",
    tagline: "Trade-offs, not trophies.",
    district: "architecture",
  },
  {
    id: "failures",
    index: 44,
    chapter: "06 · Failures",
    title: "The demolition log",
    tagline: "What broke, what it cost, what it taught.",
    district: "architecture",
  },
  {
    id: "future",
    index: 52,
    chapter: "07 · Future District",
    title: "Cranes on the skyline",
    tagline: "What is being built next.",
    district: "future",
  },
];

/** Persona-adaptive floor ordering: what the elevator recommends first. */
export const FLOOR_ORDER: Record<PersonaId, FloorId[]> = {
  recruiter: ["arrival", "engineering", "living-systems", "ai-architecture", "decisions", "failures", "future"],
  em: ["arrival", "decisions", "failures", "engineering", "living-systems", "ai-architecture", "future"],
  engineer: ["arrival", "ai-architecture", "living-systems", "engineering", "decisions", "failures", "future"],
  architect: ["arrival", "decisions", "living-systems", "ai-architecture", "failures", "engineering", "future"],
  founder: ["arrival", "future", "living-systems", "ai-architecture", "engineering", "decisions", "failures"],
};

export const floorById = (id: FloorId) => FLOORS.find((f) => f.id === id)!;
