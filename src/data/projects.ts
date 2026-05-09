/**
 * Project data for achu.dev.
 * Each project includes card copy AND full case-study content.
 */

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  accent: string; // Tailwind color class: "blue", "magenta", "green"
  description: string; // Card copy
  summary: string;
  problem: string;
  solution: string;
  whatIBuilt: string;
  techFocus: string;
  links: ProjectLink[];
  nextSteps: string;
  featured: boolean;
  // Extended case-study sections (watchyourtemper)
  extended?: Record<string, string>;
}

export const projects: Project[] = [
  {
    slug: "relay",
    title: "Relay",
    tagline: "Protocol infrastructure for local AI models",
    category: "Infrastructure",
    accent: "blue",
    description:
      "A lightweight compatibility gateway for running local models through OpenAI- and Anthropic-style APIs.",
    summary:
      "Relay is protocol infrastructure for local AI models. It helps OpenAI- and Anthropic-style agents communicate with local llama.cpp-style inference servers while preserving streaming behavior, tool-call semantics, and predictable response shapes.",
    problem:
      "Local AI inference servers expose APIs that differ from the OpenAI and Anthropic standards most agent frameworks expect. Developers who want to run agents against local models face broken streaming, missing tool calls, and unpredictable response formats — a compatibility fragmentation problem that makes local-first AI infrastructure harder to adopt.",
    solution:
      "Relay sits between agent frameworks and local inference servers as a protocol translation layer. It accepts standard OpenAI/Anthropic-shaped requests and translates them into the native formats expected by servers like llama.cpp, Ollama, and other local backends. Streaming SSE chunks, tool-call deltas, and structured output modes are mapped with high fidelity so the agent never knows it is talking to a local model.",
    whatIBuilt:
      "I designed Relay as a modular Node.js gateway with separate translation layers per backend. It supports SSE streaming passthrough, function-call serialization that matches both OpenAI tool_call and Anthropic tool_use conventions, and a unified request pipeline that normalises errors and timeouts across servers. The architecture prioritises low latency and minimal overhead so local inference speed is preserved. The gateway includes SDK smoke tests, deployment docs, and a clean configuration surface for developers who want to switch between local and cloud models without changing their agent code.",
    techFocus:
      "Protocol translation between OpenAI/Anthropic schemas and local inference backends. Streaming SSE relay with buffered tool-call accumulation. Modular backend adapters. Node.js, TypeScript, Express-style middleware pipeline. SDK smoke tests and deployment documentation.",
    links: [
      { label: "GitHub", url: "https://github.com/achuthanmukundan00/relay" },
      { label: "Docs (coming soon)", url: "#" },
    ],
    nextSteps:
      "Open-source release with initial Ollama and llama.cpp backend support. Plugin-style backend registration so the community can contribute adapters for new local servers. Lightweight dashboard for observability into translation latency and error rates. Multi-model routing with fallback chains.",
    featured: true,
  },
  {
    slug: "synax",
    title: "Synax",
    tagline: "A local-first coding agent for quantized and open models.",
    category: "AI / Developer Tools",
    accent: "magenta",
    description:
      "An experimental terminal coding agent built around local inference, OpenAI-compatible model gateways, and small/quantized model workflows. Currently in closed alpha.",
    summary:
      "Synax is an experimental terminal coding agent built around local inference, OpenAI-compatible model gateways, and small/quantized model workflows. It is currently in closed alpha while the agent loop, TUI, configuration system, and model compatibility layers stabilize.",
    problem:
      "Most coding agents are built and tested against large cloud models with generous latency budgets and near-perfect instruction following. When those same agent architectures are run against quantized local models, the assumptions break: smaller models need different prompting strategies, produce different failure modes, and don't benefit from the latency headroom that hides cloud-agent slowness. The tooling gap between cloud-first agents and local-first development remains wide.",
    solution:
      "Synax is an experiment in making local models useful in real development loops. Instead of treating local inference as a degraded version of cloud inference, it builds the agent architecture around local-model constraints from the start: constrained output grammars, explicit verification steps, patient retry strategies, and a TUI designed for transparency rather than magic. The goal is not to be another cloud-first coding assistant — it is to explore what agent architecture looks like when the model is local, quantized, and imperfect-but-fast.",
    whatIBuilt:
      "I built Synax as a TypeScript agent runtime with a first-class TUI. The interface shows the current reasoning step, active tool calls, model response streaming, and execution logs — all organised in collapsible panels. A control surface lets developers pause, step through, or redirect the agent mid-loop. The backend uses a provider abstraction that normalises local model APIs and handles the quirks of quantized inference. The system is actively dogfooded in my own development workflow but is not yet ready for general use.",
    techFocus:
      "Experimental agent loop architecture with structured logging at every step. Terminal UI (TUI) with real-time streaming panels. Provider abstraction for local model APIs. TypeScript, Node.js. Quantified output grammars for reliable structured generation from quantized models. Active research into local-first agent UX patterns.",
    links: [
      { label: "Closed alpha notes", url: "#" },
      { label: "Development ongoing", url: "#" },
    ],
    nextSteps:
      "Stabilize the agent loop and configuration system. Expand provider support for additional local model servers. Add agent checkpoints for rewind/replay. Continue dogfooding to identify failure modes and UX gaps before considering any broader release.",
    featured: true,
  },
  {
    slug: "watchyourtemper",
    title: "watchyourtemper",
    tagline: "Electronic music, events, merch, and visual world",
    category: "Creative",
    accent: "green",
    description:
      "An electronic music world spanning releases, events, merch, visual systems, and community experiments.",
    summary:
      "watchyourtemper is an electronic music, event, merch, and visual world. It connects releases, PRESSURE TEST events, content systems, visual identity, and commerce experiments into one creative ecosystem.",
    problem:
      "Independent electronic artists operate across fragmented platforms: music on streaming services, events on ticketing platforms, merch on separate storefronts, and visual identity scattered across social media. There is no unified surface that connects the music, the events, the commerce, and the world-building into a coherent creative ecosystem controlled by the artist.",
    solution:
      "watchyourtemper is a unified brand platform that brings releases, events, merch, content, and visual identity together under one domain. It treats the project as an inhabitable creative world rather than a collection of disjointed links — giving fans a cohesive experience and giving the artist full creative and commercial control.",
    whatIBuilt:
      "I built watchyourtemper.com as a Cloudflare Workers-based edge-deployed fullstack SPA. The site implements multiple client routes and API endpoints, uses Durable Objects for serverless-backed behaviour, and delivers a media-heavy UX with low-latency edge delivery. I optimized the frontend bundle and critical payload sizes for fast load times using Vite, load-tested API and homepage paths under concurrency, and implemented request observability with automated tests. Every page reflects the project's visual identity — dark, textural, high-contrast — and is built to feel alive.",
    techFocus:
      "Edge-deployed fullstack SPA on Cloudflare Workers and Pages. Durable Objects for serverless state. React + Vite + TypeScript frontend. Optimized bundle and critical payload sizes. Load testing under concurrency. Request observability and automated tests. Custom visual identity and dark editorial styling.",
    links: [
      { label: "watchyourtemper.com", url: "https://watchyourtemper.com" },
      {
        label: "GitHub",
        url: "https://github.com/achuthanmukundan00/watchyourtemper",
      },
    ],
    nextSteps:
      "Phase 2 visual core: integrate Pretext for long-form editorial pages and WebGL for an interactive hero scene. Expand merch surface with real inventory. Build content pipelines for release launches and event promotion.",
    featured: true,
    extended: {
      world:
        "watchyourtemper is an electronic music project, visual identity, merch surface, and creative world — built end-to-end across music production, web, commerce, content, and live events.",
      releases:
        "The release system connects music distribution across streaming platforms with a custom web surface that presents each release as a designed artifact — not just a link to Spotify. Cover art, visual direction, and release context are treated as first-class parts of the product.",
      pressureTest:
        "PRESSURE TEST is the event series at the center of watchyourtemper. Each event is produced end-to-end: booking, promotion, visual identity, ticketing, venue coordination, and live content capture. The events feed directly into the content system and merch cycles.",
      commerce:
        "The merch surface is designed as a product experience, not an afterthought. Limited drops, visual cohesion with releases and events, and a checkout flow that feels like part of the brand rather than a generic storefront.",
      contentSystem:
        "Content flows through the entire ecosystem: event footage becomes release teasers, release visuals become merch designs, and community moments feed the visual identity. The system is designed so every output can become an input for something else.",
      technicalSurface:
        "Built as an edge-deployed Cloudflare Workers SPA with React, Vite, and TypeScript. Custom dark editorial design system with distinctive typography. Performance-optimized with fast LCP and near-zero CLS. Designed to layer in Pretext editorial components and WebGL ambient visuals without compromising the baseline experience.",
    },
  },
  {
    slug: "wytos",
    title: "wytOS",
    tagline:
      "A local-first creative OS for structured memory and AI-assisted workflows",
    category: "AI / Developer Tools",
    accent: "magenta",
    description:
      "A local-first creative operating system with SQLite FTS5 search, local LLM summarization, and structured retrieval workflows.",
    summary:
      "wytOS is a local-first creative operating system for structured memory, retrieval, and AI-assisted creative workflows. It turns notes, chats, files, brand documents, images, audio metadata, and project context into a canonical searchable memory layer with local-LLM assistance.",
    problem:
      "Creative professionals and knowledge workers accumulate context across dozens of tools — notes apps, chat logs, file systems, brand documents, and media libraries. None of these tools talk to each other, and important creative context gets lost in the fragmentation. Retrieving the right piece of information at the right creative moment is unreliable and slow.",
    solution:
      "wytOS provides a structured creative memory database with SQLite FTS5 full-text search, category-aware entry forms, and local LLM-powered summarization, tagging, and structuring. Instead of scattering context across tools, wytOS keeps creative material available as a unified, searchable, AI-assisted memory layer that lives on your own machine.",
    whatIBuilt:
      "I designed wytOS as a local-first system with a FastAPI backend, SQLite FTS5 for efficient full-text search, and a React/Vite frontend for category-aware data entry. The system supports structured fields by content category, CRUD APIs for entries, and a local LLM integration layer for summarization, auto-tagging, and content structuring. The architecture is built for a future RAG/workflow layer and custom LoRA/QLoRA fine-tuning for voice/style adaptation.",
    techFocus:
      "Local-first creative memory architecture. FastAPI + Pydantic backend with SQLite FTS5. React + Vite + TypeScript frontend. Structured entry forms by content category. Local LLM summarization, tagging, and structuring pipelines. Future RAG/workflow layer and custom Qwen LoRA/QLoRA for creative voice/style.",
    links: [
      { label: "GitHub", url: "https://github.com/achuthanmukundan00/wytOS" },
    ],
    nextSteps:
      "Implement the RAG/workflow layer for context-aware retrieval. Train custom Qwen LoRA/QLoRA for watchyourtemper voice and style. Add audio metadata extraction and image content indexing. Build the creative workflow automation engine.",
    featured: true,
  },
  {
    slug: "temper-cloud",
    title: "Temper Cloud",
    tagline: "Self-hosted distributed storage and compute platform",
    category: "Infrastructure",
    accent: "blue",
    description:
      "Docker-based distributed storage with Cloudflare Zero Trust access, observability, and concurrent metadata pipelines.",
    summary:
      "Temper Cloud is a self-hosted distributed storage and compute platform. It combines Docker-based distributed RAID-backed storage, Cloudflare Zero Trust access patterns, multi-service observability, and high-throughput metadata pipelines into a home-lab infrastructure system targeting 99%+ availability.",
    problem:
      "Self-hosted infrastructure is often fragile: services are hard to expose securely, storage redundancy is an afterthought, observability is scattered, and pipelines that touch thousands of files become painfully slow. Most home-lab setups lack the Zero Trust security, monitoring depth, and throughput engineering that production environments demand.",
    solution:
      "Temper Cloud treats self-hosted infrastructure with production-grade rigour. RAID-backed distributed storage ensures data durability. Cloudflare Tunnel and mTLS-style private access eliminate exposed ports. A stateless API gateway (Caddy) routes traffic cleanly. Observability tooling (Netdata, Dozzle, cAdvisor, FastAPI status services) provides deep visibility. Metadata and embedding pipelines are engineered for concurrency, processing 10K+ files in under 4 minutes.",
    whatIBuilt:
      "I architected a Docker-based distributed storage system with RAID-backed volumes around 3.9TB. I designed isolated service boundaries for each self-hosted component and built a Zero Trust access layer using Cloudflare Tunnel and mTLS-style private access patterns. I deployed a full observability stack with Netdata, Dozzle, and cAdvisor, plus custom FastAPI health/status services. The Caddy API gateway provides clean routing across all internal services. I also built concurrent metadata and embedding pipelines that process 10K+ files in under 4 minutes.",
    techFocus:
      "Docker-based distributed storage with RAID (3.9TB usable). Cloudflare Tunnel, Access, and Zero Trust private networking. Caddy as stateless API gateway. Observability with Netdata, Dozzle, cAdvisor, and custom FastAPI status endpoints. Concurrent metadata and embedding pipelines. Linux systemd deployment patterns. 99%+ availability target.",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/achuthanmukundan00/temper-cloud",
      },
    ],
    nextSteps:
      "Expand storage capacity and redundancy. Add automated backup verification. Build a lightweight dashboard for service health and pipeline status. Document the Zero Trust access patterns as a reusable template for other self-hosted environments.",
    featured: true,
  },
  {
    slug: "secondhand-hub",
    title: "Secondhand Hub",
    tagline: "A fullstack microservices marketplace",
    category: "Fullstack",
    accent: "green",
    description:
      "A marketplace built with React, Flask, Docker, and PostgreSQL featuring JWT authentication and CI/CD.",
    summary:
      "Secondhand Hub is a fullstack marketplace application built with a multi-language stack: React frontend, Flask backend, Docker containerization, and PostgreSQL. It features JWT authentication, optimized relational schemas with indexing strategies, CI/CD pipelines, and automated tests — developed across 300+ commits.",
    problem:
      "Building a production-quality marketplace requires coordinating frontend UX, backend API design, database schema optimization, authentication flows, containerized deployment, and test coverage — all across multiple languages and frameworks. Most student or portfolio projects only tackle one or two of these layers.",
    solution:
      "Secondhand Hub demonstrates fullstack ownership: a React SPA frontend, a Flask REST API backend, PostgreSQL with optimized schemas and indexes, Docker for reproducible deployment, JWT for authentication, and CI/CD with automated tests. The project spans TypeScript, Python, Dockerfiles, and CSS across a disciplined commit history.",
    whatIBuilt:
      "I built the marketplace end-to-end: React frontend with SPA routing, Flask REST API with JWT authentication, PostgreSQL with optimized relational schemas and indexing strategies, Docker containerization for all services, and CI/CD pipelines with automated test suites. The codebase spanned TypeScript, Python, Dockerfile, and CSS, developed iteratively across 300+ commits.",
    techFocus:
      "React SPA frontend. Flask REST API backend. PostgreSQL with optimized schemas and indexing. Docker containerization. JWT authentication. CI/CD pipelines. Automated testing. Multi-language codebase (TypeScript, Python, CSS). 300+ commit iteration history.",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/achuthanmukundan00/Secondhand-Hub",
      },
    ],
    nextSteps:
      "This was an academic fullstack project that demonstrated end-to-end ownership. The architecture patterns and multi-service design inform later work on Temper Cloud and wytOS.",
    featured: false,
  },
];

/** Look up a project by slug */
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
