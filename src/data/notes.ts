export interface NoteEntry {
  title: string;
  date: string;
  slug: string;
  summary: string;
  topic: string;
}

export const notes: NoteEntry[] = [
  {
    title: "My Intel Arc Pro B70 inference setup, with the numbers",
    date: "2026-07-25",
    slug: "/notes/intel-arc-pro-b70-inference-stack",
    summary:
      "Patched vLLM, AutoRound INT4, 115K-token throughput, quality checks, and matched MTP tests.",
    topic: "Local inference",
  },
];
