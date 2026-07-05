import { PipelinePanel } from "../PipelinePanel";

export function PipelineFloor() {
  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-[13px] font-light leading-relaxed text-fg/75">
        This floor is the centerpiece. Ask a question and watch the full retrieval
        pipeline execute — intent scoring, embedding, vector search, knowledge-graph
        expansion, planning, tool calls, synthesis. Nothing is prerecorded; if you're
        offline right now, it still works.
      </p>
      <PipelinePanel />
    </div>
  );
}
