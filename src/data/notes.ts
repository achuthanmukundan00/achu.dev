export interface NoteEntry {
  title: string;
  date: string;
  updated?: string;
  slug: string;
  summary: string;
  topic: string;
}

export const notes: NoteEntry[] = [
  {
    title: "Ditching llm-scaler: Qwen3.8-27B on my B70",
    date: "2026-07-25",
    updated: "2026-09-12",
    slug: "/notes/intel-arc-pro-b70-inference-stack",
    summary:
      "Leaving llm-scaler behind, patching vLLM with GPT-5.6 Sol, and getting MTP4 working. My setup as of August 20.",
    topic: "Local inference",
  },
];
