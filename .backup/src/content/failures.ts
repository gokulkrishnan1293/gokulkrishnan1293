/**
 * The demolition log. Real failure patterns, told plainly.
 * Edit to match your actual scars — these are the ones the systems above imply.
 */
export interface Failure {
  id: string;
  title: string;
  cost: string;
  story: string;
  rootCause: string;
  fix: string;
  scar: string; // the permanent design change it left
}

export const FAILURES: Failure[] = [
  {
    id: "f1",
    title: "The agent swarm that talked itself broke",
    cost: "A week of runs, one alarming API bill, zero shippable output.",
    story:
      "Helix v0 let agents message each other freely. Demos were mesmerizing. Then two agents entered a polite disagreement loop — each 'verifying' the other's output — for forty minutes at full token burn.",
    rootCause:
      "No ownership of termination. Every agent assumed some other agent was responsible for deciding 'done'.",
    fix: "Rebuilt as supervisor/specialist on an explicit graph. Termination, budgets and verification became the supervisor's job — see the Helix ADR.",
    scar: "Every loop in every graph now has an owner, a budget, and a max-iteration bound. No exceptions, including this website's pipeline.",
  },
  {
    id: "f2",
    title: "The RAG system that answered confidently from stale docs",
    cost: "An internal team followed a deprecated process for two weeks.",
    story:
      "Knowledge Buddy retrieved a beautifully-written, superseded policy doc. High similarity, high confidence, wrong year. Nobody had told the vector store that documents can die.",
    rootCause:
      "Retrieval treated the corpus as timeless. Freshness and supersession weren't features in ranking — they weren't in the schema at all.",
    fix: "Added the knowledge-graph layer: supersedes-edges, owner links, freshness decay in scoring, and a hard filter on retracted docs.",
    scar: "Metadata is retrieval infrastructure. Every corpus I design now has lifecycle fields before it has embeddings.",
  },
  {
    id: "f3",
    title: "The demo that was too good",
    cost: "Three months of stakeholder expectations set by a happy path.",
    story:
      "An early SQL Builder demo used ten hand-tested questions. Leadership extrapolated. The gap between demo accuracy and real-input accuracy became my problem at review time.",
    rootCause:
      "I demoed the model, not the system. There was no eval suite, so 'it works' had no denominator.",
    fix: "Built the eval harness before the next feature: stratified real queries, accuracy by category, and the validate-and-repair loop so errors became visible events.",
    scar: "No demo without an eval number attached. This portfolio's pipeline shows its own limits for the same reason.",
  },
  {
    id: "f4",
    title: "The microservice split that created nine problems from one",
    cost: "Two quarters of distributed-systems tax on a team of four.",
    story:
      "Pre-AI era: I championed splitting a working monolith into nine services because the architecture diagrams looked cleaner. The diagrams did look cleaner. The pager did not.",
    rootCause:
      "I optimized for architectural fashion over the team's operational capacity.",
    fix: "Merged back to three services along actual team boundaries. Wrote my first real ADR to document why.",
    scar: "Complexity must be purchased with a problem. It's why Helix is 'boring, legible, testable' and why this site has no backend.",
  },
];
