/**
 * Content layer — everything the room "says" comes from typed files in /content.
 * YAML via `yaml`, Markdown via a tiny frontmatter splitter (no Buffer deps).
 */
import { parse } from "yaml";

import profileRaw from "@content/profile.yaml?raw";
import journeyRaw from "@content/journey.yaml?raw";
import skillsRaw from "@content/skills.yaml?raw";
import nowRaw from "@content/now.yaml?raw";
import copyRaw from "@content/copy.yaml?raw";

// ── types ────────────────────────────────────────────────────

export interface Profile {
  name: string;
  tagline: string;
  careerStart: number;
  roles: string[];
  links: { email: string; github: string; linkedin: string; resume: string };
  seo: { title: string; description: string };
}

export interface JourneyEntry {
  role: string;
  company?: string;
  period: string;
  summit: string;
  valley: string;
  skills?: string[];
}

export interface SkillGroup {
  folder: string;
  items: { name: string; ext: string }[];
}

export interface Project {
  id: string;
  title: string;
  featured: boolean;
  order: number;
  status: string;
  period: string;
  card: { label: string; color: string; media: "usb" | "sd" };
  summary: string;
  stack: string[];
  sketch: string[];
  retro: { wentWell: string[]; couldImprove: string[] };
  body: string;
}

export interface Failure {
  id: string;
  title: string;
  label: string;
  year: string;
  body: string;
}

export interface Copy {
  loading: { hint: string };
  welcome: { greeting: string; sketchLine: string };
  modeChoice: { prompt: string; tour: string; tourSub: string; overview: string; overviewSub: string };
  journey: { intro: string; outro: string };
  desk: { caption: string; whiteboardQuote: string };
  projects: { caption: string; hint: string };
  shelf: { line: string };
  chair: { line: string };
  finale: { question: string; building: string };
  overview: { hubTitle: string; hubIntro: string };
  version: { next: string };
}

// ── frontmatter markdown ─────────────────────────────────────

function parseMd<T>(raw: string): T & { body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { body: raw } as T & { body: string };
  return { ...(parse(m[1]) as T), body: m[2].trim() };
}

function idFromPath(path: string) {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

// ── loaders ──────────────────────────────────────────────────

export const profile = parse(profileRaw) as Profile;
export const journey = (parse(journeyRaw) as { journey: JourneyEntry[] }).journey;
export const skills = (parse(skillsRaw) as { groups: SkillGroup[] }).groups;
export const now = (parse(nowRaw) as { building: string[] }).building;
export const copy = parse(copyRaw) as Copy;

const projectFiles = import.meta.glob("@content/projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const projects: Project[] = Object.entries(projectFiles)
  .map(([path, raw]) => ({ id: idFromPath(path), ...parseMd<Omit<Project, "id" | "body">>(raw) }))
  .sort((a, b) => a.order - b.order);

export const featuredProjects = projects.filter((p) => p.featured);

const failureFiles = import.meta.glob("@content/failures/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const failures: Failure[] = Object.entries(failureFiles).map(([path, raw]) => ({
  id: idFromPath(path),
  ...parseMd<Omit<Failure, "id" | "body">>(raw),
}));

export const yearsOfExperience = new Date().getFullYear() - profile.careerStart;
