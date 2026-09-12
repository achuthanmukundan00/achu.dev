/** Project descriptions and implementation notes. Keep claims concrete and source-backed. */
import { links } from "./links";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  status: string;
  year: string;
  stack: string[];
  description: string;
  summary: string;
  problem: string;
  solution: string;
  whatIBuilt: string;
  techFocus: string;
  links: ProjectLink[];
  nextSteps: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "ygg", // Keep the existing public project URL.
    title: "octet",
    tagline: "A Rust terminal coding agent for cloud and local models.",
    category: "Developer tools",
    status: "v0.7.6 · open source",
    year: "2026",
    stack: ["Rust", "TUI", "LLM protocols"],
    description:
      "A Rust terminal coding agent for cloud and local models, with disk-backed sessions and subprocess extensions.",
    summary:
      "octet is the terminal coding agent I'm building at Skaft. It connects to cloud and local models and saves resumable sessions on disk.",
    problem:
      "I started the project because I wanted to use local models on real repositories. The agents I tried often sent large hidden prompts, assumed reliable cloud-grade tool calls, and made it difficult to see the model's context and permissions.",
    solution:
      "octet uses a small, explicit agent loop. Model traffic goes directly to the selected endpoint, and users choose which tools are available. Project instructions load only from trusted workspaces. Conversations are stored as append-only, branchable JSONL on disk.",
    whatIBuilt:
      "The Rust workspace separates model clients, the agent runtime, coding tools, and terminal rendering. Extensions run as subprocesses.",
    techFocus:
      "The implementation work covers provider request types, tool approvals, crash-safe disk sessions, and terminal rendering. The linked ygg v0.3.0-alpha release and prompt-budget test are historical references, not current feature or prompt-size claims.",
    links: [
      { label: "Product page", url: links.octet },
      { label: "Source", url: links.octetRepo },
      { label: "Documentation", url: links.octetDocs },
      {
        label: "v0.7.6 release",
        url: `${links.octetRepo}/releases/tag/v0.7.6`,
      },
      {
        label: "Historical ygg v0.3.0-alpha release",
        url: "https://github.com/skaft-software/ygg/releases/tag/v0.3.0-alpha",
      },
      {
        label: "Historical ygg prompt-budget test",
        url: "https://github.com/skaft-software/ygg/blob/v0.3.0-alpha/crates/ygg-coding-agent/src/resources.rs#L1115-L1133",
      },
    ],
    nextSteps:
      "I'll keep using the pre-1.0 release on repository work, improve local-model support, publish reproducible measurements, and fix rough edges before stabilizing the interfaces.",
    featured: true,
  },
  {
    slug: "resample-lab",
    title: "Resample Lab",
    tagline: "Turn one sound into a sample pack in the browser.",
    category: "Audio software",
    status: "live · active development",
    year: "2026",
    stack: ["TypeScript", "Web Audio", "Web Workers"],
    description:
      "A deterministic DSP tool that stretches, granulates, degrades, loops, and exports audio in the browser.",
    summary:
      "Resample Lab takes an audio file and renders eight related sounds across ambiences, one-shots, loops, oddities, and granular textures. Processing stays inside a Web Worker, and the result downloads as a ZIP of WAV files.",
    problem:
      "Moving files between plugins and export dialogs slowed down the part of resampling I enjoyed. I wanted one quick place to push a source sound into new material, reproduce the result, and keep the audio on my machine.",
    solution:
      "The app provides a small set of presets, a chaos control, and output-length modes. Every render is deterministic, so the same source and settings follow the same DSP path.",
    whatIBuilt:
      "I wrote the TypeScript signal-processing pipeline around Float32Array buffers and moved the expensive work into a browser worker. It includes WSOLA stretching, granular synthesis, filters, tape profiles, delays, reverbs, bit reduction, loop detection, a finishing rack, WAV encoding, and ZIP assembly. I also built a render-audit workflow and browser tests for the full upload and download path.",
    techFocus:
      "The implementation handles long-running DSP away from the UI thread, deterministic parameter mapping, deadline and NaN guards, stereo and mono input, static Next.js export, file decoding, and in-browser packaging.",
    links: [
      { label: "Try it", url: "https://rlab.watchyourtemper.com" },
      {
        label: "Source",
        url: "https://github.com/achuthanmukundan00/Resample-Lab",
      },
    ],
    nextSteps:
      "I'll profile the slowest presets on larger inputs, expand the listening-test set, and improve the transforms based on what I use in music sessions.",
    featured: true,
  },
  {
    slug: "temper-player",
    title: "TemperPlayer",
    tagline: "A native macOS music player with Zig decoding and DSP.",
    category: "Systems · Audio",
    status: "v0.1 · downloadable",
    year: "2026",
    stack: ["SwiftUI", "Zig", "AVFoundation"],
    description:
      "A native macOS player with real-time spectrograms, multiband analysis, and a phase-vocoder pitch engine.",
    summary:
      "TemperPlayer is a macOS player I built for listening to and inspecting a local music library. SwiftUI owns the application and workspace. Zig handles FLAC and WAV decoding, mastering analysis, and pitch processing behind a C ABI.",
    problem:
      "I wanted signal analysis to be part of listening. That meant useful meters, a compact menu-bar player, and pitch control that preserved transients and stereo placement.",
    solution:
      "SwiftUI handles the application and AVFoundation handles playback. A small C ABI connects the app to Zig code for the decoding, analysis, and pitch-processing work where I wanted direct control.",
    whatIBuilt:
      "I built the SwiftUI application, SQLite-backed library, queue and playlist flows, menu-bar player, waveform, spectrogram, and multiband goniometer. In Zig, I implemented FLAC and WAV decoding, mastering measurements, and an identity-phase-locked phase vocoder with transient resets and Kaiser-windowed sinc resampling.",
    techFocus:
      "The engineering work includes the Swift and Zig C ABI, real-time analysis, bounded visual queues, sample-rate handling, track-switch lifecycle, stereo phase correlation, and native macOS packaging.",
    links: [
      {
        label: "Source and download",
        url: "https://github.com/achuthanmukundan00/temper-player",
      },
      {
        label: "v0.1 release",
        url: "https://github.com/achuthanmukundan00/temper-player/releases/tag/v0.1.0",
      },
    ],
    nextSteps:
      "I'll finish hardening the current library and playback changes, test on more Macs and audio devices, and add formats after their playback paths are measured and reliable.",
    featured: true,
  },
  {
    slug: "lc-prep-wizard",
    title: "LeetCode Prep Wizard",
    tagline: "A local practice queue built around spaced repetition.",
    category: "Learning tool",
    status: "in progress",
    year: "2026",
    stack: ["Next.js", "SQLite", "Monaco"],
    description:
      "A local dashboard for scheduling review, tracking pattern mastery, and running Python solutions against local tests.",
    summary:
      "I built this to turn my solved-problem history into a review schedule. The app imports the NeetCode 150, schedules problems by performance, groups progress by pattern, and keeps practice data in a local SQLite database.",
    problem:
      "I was inconsistent about returning to old problems after enough time had passed to test my recall. Streak and completion counters did not tell me which problem I should review next.",
    solution:
      "The dashboard separates due reviews from new work and updates each problem's interval and mastery after a session. The practice page keeps the prompt, editor, tests, notes, and result together.",
    whatIBuilt:
      "I built the Next.js interface, SQLite schema and routes, review scheduler, XP and pattern summaries, NeetCode importer, Monaco editor, and a Python judge with public and hidden local cases. I still use and change the current branch as a local app.",
    techFocus:
      "The work covers local persistence, spaced-repetition scheduling, problem metadata normalization, code-execution boundaries, attempt tracking, and a focused practice interface.",
    links: [
      {
        label: "Source",
        url: "https://github.com/achuthanmukundan00/lc-prep-wizard",
      },
    ],
    nextSteps:
      "I'll use it through a full interview-prep cycle, tune the scheduler with my recall data, and document the runner and backup model before treating it as finished.",
    featured: false,
  },
  {
    slug: "watchyourtemper",
    title: "watchyourtemper.com",
    tagline: "An artist site and merch store running on Cloudflare.",
    category: "Web · Music",
    status: "live",
    year: "2025 to 2026",
    stack: ["React", "Cloudflare Workers", "Stripe"],
    description:
      "The web home for my music project, with a custom visual system and a Worker-backed store.",
    summary:
      "I built watchyourtemper.com for my music project. It publishes releases and visual work, and the same repository includes the merch catalog, checkout, fulfillment, and order-state backend.",
    problem:
      "I wanted more control than a link page or stock storefront gave me. The site needed to carry the visual direction of the music, load quickly, and validate commerce data on the server.",
    solution:
      "A React SPA handles the media-heavy interface. A Cloudflare Worker serves the app and API from one deployment, validates products and prices before checkout, and stores order and webhook state in Durable Objects.",
    whatIBuilt:
      "I designed and implemented the frontend, responsive visual system, Worker routes, Printful catalog integration, Stripe checkout lifecycle, webhook handling, order confirmation flow, request logging, and deployment configuration.",
    techFocus:
      "The stack uses React and Vite, Cloudflare Workers and Durable Objects, server-owned pricing, Stripe and Printful webhooks, and media performance work for the visual design.",
    links: [
      { label: "Visit site", url: "https://watchyourtemper.com" },
      {
        label: "Source",
        url: "https://github.com/achuthanmukundan00/wyt-SPA",
      },
    ],
    nextSteps:
      "I'll keep the site stable while adding pages for releases, events, and occasional merch drops.",
    featured: false,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
