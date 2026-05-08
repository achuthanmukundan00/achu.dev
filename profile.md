# Achu Mukundan Profile

## Identity

**Full name:** Achuthan Mukundan  
**Preferred name:** Achu Mukundan / Achu  
**Location:** Toronto, ON, Canada  
**Education:** BASc in Computer Engineering, University of Toronto, 2025  
**LinkedIn:** <https://www.linkedin.com/in/achu-m>  
**GitHub:** <https://github.com/achuthanmukundan00>

## Professional Summary

Achu Mukundan is a fullstack/backend engineer focused on local-first AI tooling, developer systems, high-performance web applications, scalable APIs, and production-grade infrastructure. He has professional experience shipping conversational AI systems in TypeScript/Node.js, building internal LLM interfaces, improving bot accuracy through LLM-backed data pipelines, and developing test suites for NLP/intent-recognition systems.

His recent work has concentrated on AI developer infrastructure: local model inference, OpenAI/Anthropic compatibility layers, CLI/TUI agent tools, edge-deployed fullstack systems, Cloudflare-backed private access patterns, and structured creative-memory systems.

## Core Positioning

Achu builds fast local-first AI tools, developer systems, and inhabitable worlds.

Good role fits include:

- Fullstack Engineer
- Backend Engineer
- AI Tools Engineer
- Developer Tools Engineer
- Infrastructure / Platform Engineer
- Local AI / LLM Systems Engineer
- Edge / Serverless Fullstack Engineer

## Professional Experience

### Replicant AI — Junior Developer

**May 2023 – May 2024**

Worked on production conversational AI systems, internal LLM tooling, and NLP testing infrastructure.

Key contributions:

- Built and shipped production conversational AI bots in TypeScript/Node.js serving 10K+ daily users.
- Implemented low-latency conversation-state handlers processing 500K+ bot events/day with approximately 150ms median latency.
- Led development of an internal LLM chat interface used by 200+ company employees.
- Migrated legacy “thinking-machines” workflows to LLM-based data collection, improving bot/data accuracy by approximately 30%.
- Designed timezone-aware scheduling/detection modules that reduced bot misfires by approximately 15% and improved CSAT.
- Built an automated NLP intent-recognition testing suite with Jest, reaching 90%+ test coverage and reducing regressions.
- Introduced structured logging and health endpoints, improving debugging under elevated load.

## Education

### University of Toronto — BASc, Computer Engineering

**Graduated:** 2025

Relevant coursework:

- Algorithms and Data Structures
- Machine Learning
- Software Engineering
- Databases
- Computer Networks
- Computer Security
- Operating Systems

## Major Projects

### Synax

A local-first coding-agent project aimed at making quantized/local models more usable for real developer workflows.

Focus areas:

- TypeScript CLI/TUI agent runtime
- Local-first coding-agent UX
- Agent-loop design
- Tool execution and transcript rendering
- Model thinking/notes visibility
- Interruptibility and steering
- Provider configuration and extension points
- OpenRouter/local-provider onboarding
- Documentation and first-run developer experience
- Compatibility with local OpenAI-compatible inference stacks

Relevant technologies:

- TypeScript
- Node.js
- Terminal UI rendering
- Agent loops
- Tool calling
- Streaming model responses
- OpenAI-compatible providers
- Local LLM workflows

### Relay

An OpenAI/Anthropic-compatible shim for llama.cpp and other local inference backends. Relay exists to make local models usable with agent tools that expect standard OpenAI or Anthropic-style APIs.

Focus areas:

- `/v1/chat/completions` OpenAI-compatible endpoint
- `/v1/messages` Anthropic-compatible endpoint
- Streaming/SSE compatibility
- Tool-call normalization
- Response-shape compatibility
- SDK smoke testing
- Observability and upstream status forwarding
- Lightweight deployment as a local service

Relevant technologies:

- TypeScript / Node.js
- OpenAI-compatible APIs
- Anthropic-compatible APIs
- llama.cpp / llama-server
- SSE streaming
- Tool calling
- SDK compatibility testing
- systemd deployment patterns
- Smoke-test scripts

### wytOS

A local-first creative operating system for structured memory, retrieval, and AI-assisted creative workflows.

Core concept:

- Turn notes, chats, files, brand documents, images, audio metadata, and project context into a canonical searchable memory layer with workflows and local-LLM assistance.

Implemented/planned capabilities:

- Local creative memory database
- Entry CRUD API
- SQLite FTS5 search and filtering
- Structured fields by content category
- Category-aware entry forms
- Local LLM summarization, tagging, and structuring
- RAG/workflow layer
- Future custom watchyourtemper Qwen LoRA/QLoRA for voice/style and creative workflow outputs

Relevant technologies:

- FastAPI
- SQLite / SQLite FTS5
- React
- TypeScript
- Vite
- Pydantic
- Local OpenAI-compatible inference APIs
- pytest
- Local-first architecture

### Temper Cloud

A self-hosted distributed storage and compute platform.

Key work:

- Architected Docker-based distributed storage with RAID-backed storage around 3.9TB.
- Designed isolated service boundaries for self-hosted infrastructure.
- Built a Zero Trust access layer using Cloudflare Tunnel and mTLS-style/private-access patterns.
- Used observability tooling including Netdata, Dozzle, cAdvisor, and FastAPI status services.
- Targeted 99%+ availability for home-lab/self-hosted services.
- Engineered a stateless API gateway using Caddy.
- Built concurrent metadata and embedding pipelines that processed 10K+ files in under 4 minutes.

Relevant technologies:

- Docker
- Linux
- Cloudflare Tunnel
- Cloudflare Access / Zero Trust
- Caddy
- FastAPI
- Netdata
- Dozzle
- cAdvisor
- Distributed systems
- Storage systems
- Observability

### watchyourtemper.com / wyt-SPA

An edge-deployed fullstack artist platform for the watchyourtemper project.

Key work:

- Built a Cloudflare Workers-based fullstack SPA.
- Implemented multiple client routes and API endpoints.
- Used Durable Objects/serverless primitives for edge-backed behavior.
- Optimized frontend bundle and critical payload size for fast load times.
- Used Vite for fast production builds.
- Load-tested API/homepage paths under concurrency.
- Implemented request observability and automated tests.
- Balanced media-heavy UX with low-latency edge delivery.

Relevant technologies:

- Cloudflare Workers
- Cloudflare Pages
- Durable Objects
- React / SPA architecture
- Vite
- TypeScript
- Edge APIs
- Serverless routing
- Observability
- Performance testing

### Secondhand Hub / Microservices Marketplace

A fullstack marketplace application built with a multi-language stack.

Key work:

- Built a marketplace using React, Flask, Docker, and PostgreSQL.
- Implemented JWT authentication.
- Designed optimized relational schemas and indexing strategies.
- Added CI/CD and automated tests.
- Maintained a TypeScript/Python/Dockerfile/CSS codebase.
- Iterated through 300+ commits on the project.

Relevant technologies:

- React
- Flask
- Python
- TypeScript
- Docker
- PostgreSQL
- SQL
- JWT auth
- CI/CD
- Automated testing

## Recent Technology Stack

### Languages

- TypeScript
- JavaScript
- Python
- Java
- C++
- SQL

### Frontend

- React
- Vite
- Next.js
- Vue
- Angular
- SPA architecture
- Terminal UI design
- Docs/landing-page design
- Three.js-oriented interactive web concepts

### Backend

- Node.js
- Express
- FastAPI
- Flask
- REST APIs
- Microservices
- API gateways
- Pydantic
- OpenAI-compatible APIs
- Anthropic-compatible APIs

### Databases and Storage

- SQLite
- SQLite FTS5
- PostgreSQL
- SQL schema design
- Indexing strategies
- RAID-backed storage
- Local filesystem metadata pipelines

### AI / LLM Systems

- Local LLM inference
- llama.cpp / llama-server
- GGUF quantized models
- Qwen-family coder models
- OpenAI-compatible inference servers
- Anthropic-compatible request/response shaping
- Tool calling
- XML-style tool-call parsing concepts
- Streaming/SSE responses
- Agent-loop design
- Context-window management
- RAG and structured memory systems
- LoRA/QLoRA planning for creative voice/style adaptation

### Infrastructure

- Docker
- Linux
- Cloudflare Workers
- Cloudflare Pages
- Cloudflare Tunnel
- Cloudflare Access / Zero Trust
- Caddy
- systemd
- CI/CD
- Observability stacks
- Health checks
- Smoke tests
- Load testing

### Testing and Quality

- Jest
- pytest
- TypeScript typechecking
- Integration tests
- SDK smoke tests
- Endpoint smoke scripts
- Regression testing
- Structured logging
- Health endpoints
- Coderabbit-style review passes

## Engineering Style

Achu tends to favor:

- Local-first systems where possible.
- Minimal, controlled diffs rather than sweeping rewrites.
- Fast feedback loops through smoke tests and focused verification commands.
- Explicit compatibility targets rather than vague “works with everything” claims.
- Strong observability and reproducible diagnostics.
- Practical developer experience, especially for installation, onboarding, and first-run flows.
- High-performance UI/UX that feels distinctive rather than generic.

## Creative / Product Context

Achu also works as an electronic musician and creative technologist under the watchyourtemper / wyt identity. This influences the product direction of his developer tools: interfaces should feel polished, atmospheric, fast, and memorable without sacrificing engineering rigor.

Relevant creative systems/projects:

- watchyourtemper artist platform
- PRESSURE TEST experimental event series
- wytOS creative memory/workflow system
- AI-assisted content/release planning
- Music production workflows connected to local-first AI tooling

## Resume Emphasis Variants

Depending on the opportunity, Achu can be positioned as:

### Backend / Infrastructure

Emphasize:

- Relay
- Temper Cloud
- Replicant AI event throughput and latency
- FastAPI/Node.js APIs
- Cloudflare Zero Trust
- Observability
- Distributed systems
- Local inference infrastructure

### Fullstack / Product Engineering

Emphasize:

- watchyourtemper.com / wyt-SPA
- Synax TUI/UX
- Replicant internal LLM chat interface
- Secondhand Hub
- React/Vite/TypeScript
- Edge-deployed web applications
- Performance and UX

### AI Tools / Developer Tools

Emphasize:

- Synax
- Relay
- wytOS
- llama.cpp / local model workflows
- Tool calling
- Agent-loop design
- OpenAI/Anthropic compatibility
- Local-first AI systems
- SDK and smoke-test compatibility

## One-Line Bio Options

- Achu Mukundan is a fullstack/backend engineer building local-first AI tools, developer systems, and high-performance web infrastructure.
- Achu builds fast local-first AI tools, developer systems, and inhabitable worlds.
- Achu Mukundan is a Computer Engineering graduate from the University of Toronto focused on AI developer tools, local LLM infrastructure, and edge-deployed fullstack systems.
