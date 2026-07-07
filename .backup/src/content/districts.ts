/**
 * Districts: named regions of the city model. Positions are in the city
 * scene's normalized space (city is centered at origin, ~radius 100).
 * They are annotation anchors — beacons + labels — not geometry edits.
 */
export interface District {
  id: string;
  name: string;
  blurb: string;
  color: string;
  /** anchor in city-local coords [x, y(height), z] */
  pos: [number, number, number];
  contains: string[];
}

export const DISTRICTS: District[] = [
  {
    id: "ai",
    name: "AI District",
    blurb: "Knowledge Buddy · Helix · RAG · multi-agent systems",
    color: "#6fd3ff",
    pos: [-42, 30, -30],
    contains: ["Knowledge Buddy", "Helix", "Multi-Agent Systems", "RAG", "AI Experiments"],
  },
  {
    id: "engineering",
    name: "Engineering District",
    blurb: "Full stack · backend · cloud · DevOps",
    color: "#67e8b0",
    pos: [46, 26, -22],
    contains: ["Full Stack", "Backend", "Frontend", "Cloud", "DevOps"],
  },
  {
    id: "architecture",
    name: "Architecture District",
    blurb: "System design · ADRs · distributed systems",
    color: "#ffb86f",
    pos: [38, 24, 38],
    contains: ["System Design", "ADRs", "Scalability", "Distributed Systems"],
  },
  {
    id: "research",
    name: "Research District",
    blurb: "Experiments · notes · learning in public",
    color: "#c79bff",
    pos: [-40, 22, 36],
    contains: ["Experiments", "Whitepapers", "Technical Notes"],
  },
  {
    id: "future",
    name: "Future District",
    blurb: "Under construction — cranes visible",
    color: "#ffd166",
    pos: [0, 34, -52],
    contains: ["Startup Ideas", "AI Vision", "Research Roadmap"],
  },
  {
    id: "core",
    name: "The Tower",
    blurb: "You are here. ARC//OS core.",
    color: "#d7dfee",
    pos: [0, 44, 0],
    contains: ["ARC//OS"],
  },
];

export const districtById = (id: string) => DISTRICTS.find((d) => d.id === id);
