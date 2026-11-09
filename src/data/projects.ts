/** Project descriptions and implementation notes. Keep claims concrete and source-backed. */
import { links } from "./links";
import releases from "./releases.json";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Release {
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  status: string;
  releaseRepo?: string;
  stack: string[];
  description: string;
  summary: string;
  problem: string;
  solution: string;
  whatIBuilt: string;
  techFocus: string;
  links: ProjectLink[];
}

const releaseRepos = releases.repos as Record<string, Release | null>;

/** Latest release for a project, refreshed by `scripts/sync-releases.mjs`. */
export function latestRelease(repo?: string): Release | null {
  return repo ? (releaseRepos[repo] ?? null) : null;
}

/** Version tag when a repository cuts releases, otherwise the short status. */
export function projectStatus(project: Project): string {
  return latestRelease(project.releaseRepo)?.tag ?? project.status.split(" · ")[0];
}

export const projects: Project[] = [
  {
    slug: "ygg", // Keep the existing public project URL.
    title: "octet",
    tagline: "A Rust terminal coding agent, extensible in any language.",
    status: "open source",
    releaseRepo: "skaft-software/octet",
    stack: ["Rust", "TUI", "LLM protocols"],
    description:
      "octet is a free, open-source terminal coding agent written in Rust. It reads code, edits files, and runs tests with the model you choose, and extensions run beside it in any language.",
    summary:
      "octet is a terminal coding agent written in Rust. It reads code, edits files, and runs tests with the model you choose. Extensions run in separate processes, so tools can be written in any language.",
    problem:
      "I wanted a coding agent that could open my Ableton sessions, hear the audio, and use my computer in the same model context. The agents I liked either could not take audio input or would not let me choose the model.",
    solution:
      "octet keeps Pi's agent recipe and rebuilds the host in Rust: the model loop, tools, sessions, and terminal rendering run in one native process. Extensions run beside it over JSON-RPC 2.0, so they can be written in any language without rebuilding the agent.",
    whatIBuilt:
      "The Rust host owns model communication, the coding loop, sessions, and rendering. First-party extensions add computer use with Cua Driver, multi-model subagents, web search, MCP, and codemode; Pi compatibility ships separately as an experimental, per-extension package.",
    techFocus:
      "Extensions are separate processes speaking JSON-RPC 2.0, with SDKs for Python, TypeScript, Rust, and C++; the coding loop itself needs neither Node nor Python. Sessions are resumable and branchable, and the agent can be steered or given queued follow-ups while it works.",
    links: [
      { label: "Product page", url: links.octet },
      { label: "Source", url: links.octetRepo },
      { label: "Documentation", url: links.octetDocs },
    ],
  },
  {
    slug: "local",
    title: "Local",
    tagline: "A variable grotesk and mono type system for screens full of text.",
    status: "pre-alpha",
    releaseRepo: "skaft-software/local-typeface",
    stack: ["FontForge", "Python", "OpenType"],
    description:
      "Local is Skaft Software's open type system: Local Grotesk for interfaces and editorial text, and Local Mono for code and terminals, both variable from 400 to 700.",
    summary:
      "Local pairs a proportional sans, Local Grotesk, with a 616-unit monospaced face, Local Mono. It is built for interfaces, documentation, code, and terminals, and it is the type on this site.",
    problem:
      "More tools now answer in paragraphs, so more of the day is spent reading text on screens. I wanted a face that stays calm and legible for long sessions without looking anonymous.",
    solution:
      "Local starts from Swiss spacing discipline, then adds open counters, distinct look-alikes like I, l and 1, slightly lower visual weight, and curves whose widest point lands just off-center. It draws on legibility ideas valued by some dyslexic and low-vision readers as a design intention, not a clinical claim.",
    whatIBuilt:
      "Local Grotesk is a modified TeX Gyre Heros and Local Mono a modified IBM Plex Mono. The repository holds the editable FontForge masters, designspaces for the variable builds, and Python scripts that record each transformation from the upstream sources so a release can be rebuilt deterministically.",
    techFocus:
      "Releases ship static, variable, WOFF2, and Nerd Font builds. Each one passes fontlint, the OpenType Sanitizer, HarfBuzz shaping at 400, 550 and 700, exact 616-unit Mono width checks, and variable-axis outline checks on control glyphs.",
    links: [
      { label: "Specimen", url: "https://skaft.org/local/" },
      { label: "Source", url: "https://github.com/skaft-software/local-typeface" },
    ],
  },
  {
    slug: "resample-lab",
    title: "Resample Lab",
    tagline: "Turn one sound into a sample pack in the browser.",
    status: "live · active development",
    releaseRepo: "achuthanmukundan00/Resample-Lab",
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
  },
  {
    slug: "temper-player",
    title: "TemperPlayer",
    tagline: "A native macOS music player with Zig decoding and DSP.",
    status: "downloadable",
    releaseRepo: "achuthanmukundan00/temper-player",
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
    ],
  }
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
