# achu.dev Portfolio Requirements Doc

## 1. Project Summary

Build a high-performance personal developer portfolio for **achu**.

The site is not a generic resume page. It is a product-quality personal hub that presents Achu as an AI/fullstack engineer who builds fast local-first AI tools, developer systems, and inhabitable worlds.

Primary hero copy:

```txt
achu
i build fast local-first ai tools, developer systems, and inhabitable worlds.
```

The portfolio should showcase three initial pillars:

1. **Relay** — protocol infrastructure for local AI models.
2. **Synax** — a transparent local-first coding agent.
3. **watchyourtemper** — an electronic music, event, merch, and visual world.

The site should feel like a polished product universe: minimal, fast, technical, visual, and editorial. It should demonstrate taste, engineering maturity, systems thinking, and product-shipping ability.

---

## 2. Primary Goals

### 2.1 Career / Resume Goal

Create a site that can be linked directly from resumes, job applications, GitHub, LinkedIn, and recruiter messages.

The site should make Achu look like a strong AI/fullstack candidate by emphasizing:

* Local-first AI developer tools.
* Model gateway / compatibility infrastructure.
* Coding agent design.
* Fullstack product development.
* Technical writing and documentation.
* Visual/product design taste.
* Shipping complete product ecosystems, not isolated demos.

### 2.2 Product Storytelling Goal

Each project should be presented as a case study, not a simple card.

Every major project should answer:

* What is it?
* Who is it for?
* What problem does it solve?
* What did Achu build?
* What were the hard engineering/product decisions?
* What technologies were used?
* What proof exists?
* What is next?

### 2.3 Technical Showcase Goal

The site itself should demonstrate modern web engineering:

* Astro static-first architecture.
* React islands for high-impact interactivity.
* TypeScript throughout.
* WebGL2 visual system with graceful fallback.
* Pretext-powered editorial text/layout experiments.
* MDX content for case studies and notes.
* Excellent performance.
* Accessibility and reduced-motion support.
* Clean deployment on Cloudflare Pages or Vercel.

---

## 3. Brand Direction

### 3.1 Brand Name

Use lowercase:

```txt
achu
```

Avoid names like:

* AchuDev
* Achu AI
* Achu Labs
* Achu Systems

The minimal personal brand is the point. The projects provide the intensity.

### 3.2 Core Line

```txt
i build fast local-first ai tools, developer systems, and inhabitable worlds.
```

### 3.3 Recruiter-Readable Supporting Line

Use a clearer subline near the hero:

```txt
AI/fullstack engineer building model gateways, coding agents, creative operating systems, and polished product experiences.
```

### 3.4 Tone

The site should feel:

* Minimal.
* Sharp.
* Technical.
* Slightly mysterious.
* Product-quality.
* Editorial.
* Fast.
* Not gimmicky.
* Not template-like.

Avoid:

* Generic SaaS landing page aesthetics.
* Overly playful startup mascot energy.
* Resume-template blandness.
* Heavy 3D that harms usability.
* Fake AI chatbot gimmicks.
* Excessive animations that distract from the work.

---

## 4. Recommended Tech Stack

### 4.1 Framework

Use:

```txt
Astro
React
TypeScript
MDX
Tailwind CSS v4
```

Astro should be the app shell because the site is mostly content, case studies, resume material, and selectively interactive visuals.

React should be used for islands only where interactivity is valuable.

### 4.2 Visual / Interaction Layer

Use:

```txt
Three.js
@react-three/fiber
@react-three/drei
Motion or Framer Motion
Pretext
```

WebGL2 should be the production baseline.

WebGPU may be explored later behind feature detection, but the MVP must not depend on WebGPU.

### 4.3 Content Layer

Use Astro Content Collections or equivalent typed content setup.

Initial content types:

```txt
projects
notes
resume
```

### 4.4 Deployment

Preferred:

```txt
Cloudflare Pages
```

Acceptable alternative:

```txt
Vercel
```

Do not require a custom backend for the initial portfolio.

### 4.5 Testing / Quality

Use:

```txt
Vitest
Playwright
Lighthouse CI or equivalent performance checks
Prettier
ESLint
TypeScript strict mode
```

---

## 5. Information Architecture

Initial routes:

```txt
/
/work
/work/relay
/work/synax
/work/watchyourtemper
/resume
/notes
/contact
```

Optional future routes:

```txt
/lab
/lab/webgpu
/lab/pretext
/uses
/now
```

---

## 6. Homepage Requirements

### 6.1 Hero Section

Must include:

```txt
achu

i build fast local-first ai tools, developer systems, and inhabitable worlds.

AI/fullstack engineer building model gateways, coding agents, creative operating systems, and polished product experiences.
```

Primary CTAs:

```txt
view work
resume
github
linkedin
```

Secondary CTA:

```txt
watchyourtemper.com ↗
```

The watchyourtemper link should exist, but watchyourtemper must also be represented as an internal portfolio case study.

### 6.2 Featured Work Section

Show three primary project cards:

```txt
relay
A lightweight compatibility gateway for running local models through OpenAI- and Anthropic-style APIs.

synax
A local-first coding agent built for quantized models, transparent execution, and developer observability.

watchyourtemper
An electronic music world spanning releases, events, merch, visual systems, and community experiments.
```

Each card should link to its internal case-study route.

### 6.3 System Map Section

Include a simple product family map showing how the projects relate.

Suggested conceptual layout:

```txt
              wytOS / creative OS
                    │
relay ─────── achu ─────── synax
                    │
        watchyourtemper / PRESSURE TEST
```

This can be rendered as HTML/SVG initially. WebGL is optional for this section in later phases.

### 6.4 Current Focus Section

A compact section that says what Achu is currently building.

Example:

```txt
Currently building local-first AI developer infrastructure: Relay, Synax, and wytOS-adjacent creative workflows.
```

---

## 7. Navigation Requirements

Desktop nav:

```txt
achu
work
resume
notes
contact
github ↗
linkedin ↗
```

Optional external link:

```txt
watchyourtemper ↗
```

Mobile nav should be simple, accessible, and not overdesigned.

Nav should remain legible over all backgrounds.

---

## 8. Project Case Study Requirements

All project pages should share a common case-study layout.

Required sections:

1. Hero.
2. Summary.
3. Problem.
4. Solution.
5. What I built.
6. Technical architecture.
7. Stack.
8. Proof / links.
9. What I learned.
10. Next steps.

### 8.1 Case Study Data Shape

Create a typed project content schema with fields like:

```ts
type Project = {
  slug: string;
  title: string;
  subtitle: string;
  role: string;
  status: 'active' | 'shipped' | 'in-progress' | 'archived';
  timeframe?: string;
  summary: string;
  problem: string;
  solution: string;
  highlights: string[];
  stack: string[];
  links: {
    label: string;
    href: string;
    kind: 'github' | 'docs' | 'live' | 'demo' | 'external';
  }[];
};
```

MDX body should handle richer narrative content.

---

## 9. Relay Case Study Requirements

Route:

```txt
/work/relay
```

Positioning:

```txt
Relay is protocol infrastructure for local AI models.
```

Short description:

```txt
A lightweight compatibility gateway for running local llama.cpp models through OpenAI- and Anthropic-style APIs.
```

Must communicate:

* Local models are powerful but agent compatibility is fragmented.
* Relay provides a compatibility layer between agents and local inference servers.
* Relay exposes OpenAI-style and Anthropic-style surfaces.
* Relay supports streaming/SSE concepts.
* Relay normalizes tool-calling and response shapes.
* Relay has docs, smoke tests, and deployment-oriented thinking.

Suggested sections:

```txt
Problem
Local models can run well, but most agents expect OpenAI/Anthropic-compatible APIs.

Solution
Relay provides a thin compatibility gateway over local llama.cpp-style inference endpoints.

Engineering Focus
- Streaming behavior
- Tool call normalization
- SDK compatibility
- Low overhead
- Deployment ergonomics
- Observability and error surfaces
```

Required links:

* GitHub repo.
* Docs site if available.
* Live page if available.

Visual ideas:

* Protocol bridge diagram.
* Request/response flow.
* OpenAI ⇄ Relay ⇄ llama.cpp.
* Anthropic ⇄ Relay ⇄ llama.cpp.

---

## 10. Synax Case Study Requirements

Route:

```txt
/work/synax
```

Positioning:

```txt
Synax is a transparent local-first coding agent.
```

Short description:

```txt
A local-first coding agent built for quantized models, transparent execution, provider flexibility, and developer observability.
```

Must communicate:

* Most coding agents assume expensive frontier cloud models.
* Local/quantized models need different UX and observability.
* Synax focuses on transparency, steering, TUI clarity, provider configuration, and model-aware workflows.
* The product is designed for people trying to get real work done with local models.

Suggested sections:

```txt
Problem
Coding agents hide too much state and are often optimized for frontier cloud models, not local quantized models.

Solution
Synax exposes the agent loop through a transparent TUI, provider system, model core visuals, and observable execution.

Engineering Focus
- Provider configuration
- TUI transcript design
- Tool execution display
- Local-first workflows
- Model observability
- Config onboarding
- Testable CLI behavior
```

Required links:

* GitHub repo if public.
* Docs if available.
* Demo video/screenshots when available.

Visual ideas:

* Terminal-inspired UI fragments.
* AI core states.
* Model/provider switching.
* Transcript hierarchy.
* Observability panel.

---

## 11. watchyourtemper Case Study Requirements

Route:

```txt
/work/watchyourtemper
```

Positioning:

```txt
watchyourtemper is an electronic music, event, merch, and visual world.
```

Short description:

```txt
An artist project spanning music releases, event production, merch, visual systems, content strategy, and web/commerce surfaces.
```

This should be treated as a serious portfolio case study, not a side hobby.

Must communicate:

* Achu can build worlds, not just code.
* watchyourtemper demonstrates creative direction, shipping discipline, web/product design, event strategy, content systems, and commerce experimentation.
* PRESSURE TEST should appear as a sub-system or related project inside this case study.

Suggested intro copy:

```txt
watchyourtemper is my proof that I can build more than software.

It is an artist project, event platform, release system, visual identity, merch surface, and creative world — built end-to-end across music production, web, commerce, content, and live events.
```

Required sections:

```txt
01. World
The sonic and visual identity behind watchyourtemper.

02. Releases
EPs, singles, artwork systems, rollout strategy, and release cadence.

03. PRESSURE TEST
A live experimental event series for unreleased electronic music and works-in-progress.

04. Commerce
Merch/store MVP, Stripe payment links, product pages, and fulfillment roadmap.

05. Content System
Short-form video, posters, reels, process clips, and social rollout.

06. Technical Surface
watchyourtemper.com, frontend design, store integration, analytics, and future automation.
```

Required links:

* watchyourtemper.com external link.
* Music links if available.
* Store/merch link if appropriate.
* Event/archive links if available.

Visual ideas:

* Dark editorial spread.
* Release grid.
* Poster wall.
* Event timeline.
* Merch/product cards.
* Audio/visual worldbuilding fragments.

---

## 12. Resume Page Requirements

Route:

```txt
/resume
```

Purpose:

* Recruiter-friendly.
* Readable.
* Printable.
* Downloadable as PDF.
* Clear AI/fullstack positioning.

Must include:

* Name: Achu Mukundan.
* Brand: achu.
* Title: AI / Fullstack Engineer.
* Short summary.
* Featured projects.
* Skills.
* Experience/projects.
* Education if desired.
* GitHub.
* LinkedIn.
* Email/contact.
* PDF download button.

Suggested headline:

```txt
AI / Fullstack Engineer — Local-first AI tools, developer infrastructure, and product systems.
```

Suggested bullets:

```txt
Built Relay, an OpenAI/Anthropic-compatible gateway for local llama.cpp models, with streaming, tool-call normalization, SDK smoke tests, and deployment docs.

Built Synax, a local-first coding agent focused on quantized model workflows, transparent TUI interaction, provider flexibility, and developer observability.

Designed and shipped full product surfaces across docs, landing pages, CLI/TUI UX, backend APIs, and frontend systems.
```

The resume page should be clean and less experimental than the homepage.

---

## 13. Notes Page Requirements

Route:

```txt
/notes
```

Purpose:

Show technical writing and build thinking.

Initial note ideas:

```txt
Why local-first AI agents need different UX
Building a compatibility gateway for local models
What quantized coding models need from agent loops
Designing observable TUIs for coding agents
Using Astro, Pretext, and WebGL without making a slow portfolio
```

Notes can be MDX.

Each note should have:

* Title.
* Date.
* Summary.
* Tags.
* Body.

---

## 14. Visual System Requirements

### 14.1 General Aesthetic

The site should be:

* Dark-first.
* Minimal.
* High contrast.
* Sharp typography.
* Editorial spacing.
* Subtle but memorable animation.
* Product-quality.

### 14.2 Suggested Palette

Use a restrained base palette:

```txt
background: near-black / charcoal
foreground: off-white
muted: gray / slate
accent: electric blue / toxic green / magenta variants per project
```

Project accent suggestions:

```txt
relay: blue / white / steel
synax: pink / blue / terminal green depending on model core state
watchyourtemper: toxic green / black / off-white
```

### 14.3 Typography

Use strong modern typography.

Possible direction:

* Sans-serif for UI.
* Monospace for technical/code fragments.
* Optional editorial serif for Pretext experiments only if it fits.

Do not overuse fonts.

### 14.4 Motion

Motion should feel intentional:

* Small transitions.
* Section reveals.
* Hover states.
* Core animation.
* Text layout experiments.

Must support:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced motion mode should disable or drastically simplify animations.

---

## 15. WebGL / 3D Requirements

### 15.1 Production Rule

The site may include WebGL2, but it must remain fast.

Do not build a heavy 3D world that delays content.

### 15.2 Initial WebGL Feature

Build one core visual island for the homepage.

Concept:

```txt
An abstract AI/product core that subtly shifts between Relay, Synax, and watchyourtemper states.
```

Each state can alter:

* Color.
* Shape language.
* Motion behavior.
* Surrounding labels.
* Background grid/lines.

### 15.3 Fallback

Must include static fallback:

* SVG fallback.
* CSS-only fallback.
* Or hidden visual with text-first layout.

If WebGL fails, the page must still look intentional.

### 15.4 Performance Constraints

* Only one persistent WebGL canvas on the homepage.
* No mandatory WebGL on case-study pages for MVP.
* Lazy-load heavy visual code.
* Pause animation when offscreen.
* Use demand rendering when possible.
* Avoid large textures.
* Respect reduced motion.

---

## 16. Pretext Requirements

Use Pretext as an enhancement, not a blocker.

Initial use cases:

1. Editorial project heading / text layout component.
2. Pull quote component.
3. Experimental case-study section.

Do not make all text dependent on Pretext initially.

Fallback must be ordinary HTML text.

Suggested components:

```txt
PretextHeadline
PretextPullQuote
PretextEditorialBlock
```

Pretext should help make the site feel custom and technically interesting.

---

## 17. Accessibility Requirements

Must include:

* Semantic HTML.
* Keyboard navigation.
* Visible focus states.
* Good contrast.
* Alt text for images.
* Accessible nav.
* No animation-only communication.
* Reduced motion support.
* Proper heading hierarchy.

Avoid canvas-only content. Important project information must exist in real HTML.

---

## 18. SEO / Social Requirements

Each page should include:

* Title.
* Description.
* Open Graph metadata.
* Twitter card metadata.
* Canonical URL.

Homepage title suggestion:

```txt
achu — local-first AI tools, developer systems, and inhabitable worlds
```

Homepage description suggestion:

```txt
Achu Mukundan is an AI/fullstack engineer building local-first AI tools, developer systems, model gateways, coding agents, and creative product worlds.
```

Each case study should have a strong OG title and image.

---

## 19. Performance Requirements

Set target budgets:

```txt
Lighthouse Performance: 95+
Lighthouse Accessibility: 95+
Lighthouse Best Practices: 95+
Lighthouse SEO: 95+
Initial JS excluding optional visual island: under 150 KB gzipped if practical
LCP: under 2.5s on mobile
CLS: near 0
```

Implementation requirements:

* Static-first rendering.
* Lazy-load visual islands.
* Optimize fonts.
* Optimize images.
* Use responsive images.
* Avoid large client-side dependencies unless justified.
* Avoid unnecessary global hydration.

---

## 20. Repository Setup Requirements

Create a clean repo with:

```txt
README.md
package.json
tsconfig.json
astro.config.mjs
eslint config
prettier config
src/
public/
tests/
```

Suggested scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Use strict TypeScript.

---

## 21. Suggested File Structure

```txt
achu-portfolio/
  public/
    images/
    resume/
    og/
  src/
    components/
      core/
      layout/
      project/
      pretext/
      resume/
      three/
      ui/
    content/
      projects/
        relay.mdx
        synax.mdx
        watchyourtemper.mdx
      notes/
    data/
      links.ts
      site.ts
    layouts/
      BaseLayout.astro
      CaseStudyLayout.astro
      ResumeLayout.astro
    pages/
      index.astro
      work.astro
      work/
        [slug].astro
      resume.astro
      notes.astro
      contact.astro
    styles/
      global.css
    lib/
      projects.ts
      seo.ts
      pretext.ts
  tests/
    e2e/
      smoke.spec.ts
```

---

## 22. Initial Content Requirements

Create placeholder but high-quality content for:

```txt
Relay
Synax
watchyourtemper
```

Do not use lorem ipsum.

Use real but editable copy.

### 22.1 Relay Placeholder Copy

```txt
Relay is a lightweight compatibility gateway for local AI models. It helps OpenAI- and Anthropic-style agents communicate with local llama.cpp-style inference servers while preserving streaming behavior, tool-call semantics, and predictable response shapes.
```

### 22.2 Synax Placeholder Copy

```txt
Synax is a local-first coding agent designed for quantized models, transparent execution, and developer observability. It focuses on making the agent loop visible and steerable instead of hiding reasoning, commands, provider state, and model behavior behind opaque abstractions.
```

### 22.3 watchyourtemper Placeholder Copy

```txt
watchyourtemper is an electronic music project, event platform, merch surface, and visual world. It connects releases, PRESSURE TEST events, content systems, visual identity, and commerce experiments into one creative ecosystem.
```

---

## 23. Links To Configure

Use placeholders initially if exact URLs are not known.

Required links:

```txt
GitHub profile
LinkedIn profile
Resume PDF
Relay GitHub repo
Relay docs/live page
Synax GitHub repo
Synax docs/live page
watchyourtemper.com
Email/contact
```

Do not hardcode fake social URLs. Centralize links in:

```txt
src/data/links.ts
```

---

## 24. Acceptance Criteria For Initial Agent Pass

The first implementation pass is successful when:

1. Astro project is created and builds successfully.
2. TypeScript strict mode is enabled.
3. Homepage exists with correct hero copy.
4. Work index exists.
5. Relay, Synax, and watchyourtemper case-study routes exist.
6. Resume page exists.
7. Notes page exists.
8. Contact page exists.
9. Shared layout/nav/footer exist.
10. Project content is data-driven or MDX-driven.
11. Site has clean dark visual styling.
12. No lorem ipsum appears.
13. External links are centralized.
14. Basic responsive layout works on mobile and desktop.
15. Build/check/lint scripts are available.
16. README explains how to run the project.
17. WebGL/Pretext are either scaffolded safely or deferred behind clear TODOs.
18. No heavy interactive feature blocks the MVP.

---

## 25. Non-Goals For First Pass

Do not implement in the first pass:

* Full WebGPU system.
* Complex 3D world.
* CMS.
* Blog authoring dashboard.
* AI chatbot.
* Backend database.
* Authentication.
* Complex analytics.
* Payment integration.
* Live GitHub API integration unless trivial and cached/static.
* Overcomplicated animation framework.

The first pass should create a strong, maintainable foundation.

---

## 26. Implementation Phases

### Phase 1: Static MVP

Build:

* Astro project.
* Base layout.
* Homepage.
* Work index.
* Three project pages.
* Resume page.
* Notes page.
* Contact page.
* Basic styling.
* Central links/data.
* README.

### Phase 2: Visual Identity

Add:

* Project accent system.
* Animated but lightweight hero.
* SVG/system map.
* Better project cards.
* More polished typography.

### Phase 3: Pretext Editorial Layer

Add:

* Pretext headline/pull quote experiments.
* Editorial case-study blocks.
* Graceful fallback.

### Phase 4: WebGL2 Core Visual

Add:

* Lazy-loaded R3F hero island.
* Project state transitions.
* Static fallback.
* Reduced motion support.
* Performance checks.

### Phase 5: Resume/SEO/Launch Polish

Add:

* PDF resume.
* OG images.
* Metadata.
* Lighthouse pass.
* Playwright smoke tests.
* Deployment config.

---

## 27. Instructions For Coding Agent

When implementing:

1. Start with a clean Astro + TypeScript project.
2. Do not overbuild.
3. Prioritize content architecture and visual clarity first.
4. Keep all links/data centralized.
5. Use semantic HTML.
6. Avoid global hydration.
7. Keep interactive components isolated.
8. Do not add a dependency unless it is used.
9. Do not create fake content beyond clearly editable placeholders.
10. Ensure `npm run build` passes before stopping.
11. Ensure formatting and type checks pass if configured.
12. Leave clear TODOs for Pretext/WebGL if not implemented immediately.

---

## 28. Suggested Initial Agent Prompt

```txt
You are setting up the initial repository for achu.dev, a high-performance personal portfolio for Achu Mukundan.

Read the requirements doc carefully and implement Phase 1 only.

Goal:
Create a clean Astro + TypeScript + Tailwind portfolio foundation with routes, data-driven project content, polished dark styling, and real placeholder copy for Relay, Synax, and watchyourtemper.

Hard requirements:
- Use Astro, TypeScript, Tailwind, and MDX/content collections if appropriate.
- Create routes: /, /work, /work/relay, /work/synax, /work/watchyourtemper, /resume, /notes, /contact.
- Homepage hero must use this exact primary copy:
  "achu"
  "i build fast local-first ai tools, developer systems, and inhabitable worlds."
- Include the recruiter-readable subline:
  "AI/fullstack engineer building model gateways, coding agents, creative operating systems, and polished product experiences."
- Include project cards for Relay, Synax, and watchyourtemper.
- Treat watchyourtemper as a first-class portfolio case study, not merely an external link.
- Centralize external links in a data file.
- Do not use lorem ipsum.
- Use semantic HTML and accessible nav.
- Keep styling minimal, sharp, dark-first, and product-quality.
- Do not implement a heavy WebGL scene in Phase 1. Add a safe placeholder/TODO for the future visual core if useful.
- Do not implement Pretext deeply yet. Add a safe placeholder/TODO or lightweight abstraction if useful.
- Ensure the project builds.
- Add a README with setup instructions and project intent.

After implementation, run the available checks/build and report:
- Files created/changed.
- Commands run.
- Any TODOs intentionally left for later phases.
```

