/**
 * Notes data — placeholder entries for /notes.
 * TODO Phase 3: Replace with MDX content collection.
 */

export interface NoteEntry {
  title: string;
  date: string;
  slug: string;
  summary: string;
  published: boolean;
}

export const notes: NoteEntry[] = [
  {
    title: "Why local-first AI agents need different UX",
    date: "Q3 2026",
    slug: "#",
    summary:
      "When agents run locally against quantized models, the assumptions behind chat-based interfaces break down. This note explores what kind of UX actually works when latency is low, models are smaller, and the developer needs full observability into the agent loop.",
    published: false,
  },
  {
    title: "Building a compatibility gateway for local models",
    date: "2025 Q1",
    slug: "#",
    summary:
      "Lessons from designing Relay: how protocol translation between OpenAI/Anthropic schemas and local inference servers reveals the subtle differences that break agent behaviour — from streaming semantics to tool-call accumulation strategies.",
    published: false,
  },
  {
    title: "Designing observable TUIs for coding agents",
    date: "2025 Q1",
    slug: "#",
    summary:
      "The terminal is an underrated medium for AI interfaces. This note covers the design decisions behind Synax's TUI — how to render real-time agent state without overwhelming the developer and why transparency beats magic.",
    published: false,
  },
  {
    title: "Using Astro, Pretext, and WebGL without making a slow portfolio",
    date: "2025 Q1",
    slug: "#",
    summary:
      "How to layer a static Astro site with Pretext editorial typography and WebGL2 ambient visuals without bloating the bundle or compromising accessibility. Notes on the architecture behind achu.dev itself.",
    published: false,
  },
];
