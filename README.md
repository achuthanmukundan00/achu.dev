# achu.dev

Personal portfolio for **Achu Mukundan** — AI/fullstack engineer building model gateways, coding agents, creative operating systems, and polished product experiences.

> *A living systems core that reconfigures into the tools, agents, and worlds achu builds.*

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # type-check + production build
npm run preview    # preview production build
```

---

## Deploy: Cloudflare Pages

### Prerequisites
- GitHub repo with this code pushed to `main`
- `achu.dev` domain (purchased)
- Cloudflare account with access to manage DNS for `achu.dev`

### Setup (Dashboard — preferred)

1. **Cloudflare Pages dashboard** → Create a project → Connect to Git
2. Select the GitHub repo (`achu-portfolio`)
3. Configure build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 20 (or latest LTS)
4. Deploy — the first build will ship to `*.pages.dev`

### Custom Domain

1. In the Pages project → **Custom domains** → Add `achu.dev`
2. If DNS is managed by Cloudflare: auto-configures DNS records
3. If DNS is managed elsewhere: Cloudflare will show the required CNAME/A record to add at your registrar
4. Add `www.achu.dev` as an additional custom domain — Cloudflare Pages redirects www → apex automatically once both are configured

### Alternative: Wrangler CLI deploy

```bash
npx wrangler pages deploy dist --project-name achu-portfolio
```

(Requires `wrangler` installed and authenticated. Dashboard/GitHub flow is preferred for CI/CD.)

---

## DNS / Subdomain Plan

| Domain | Purpose | Status |
|--------|---------|--------|
| `achu.dev` | Main portfolio (this project) | Active |
| `www.achu.dev` | Redirect → `achu.dev` | Active (via Cloudflare Pages) |
| `synax.achu.dev` | Synax landing/docs | Future |
| `relay.achu.dev` | Relay landing/docs | Future |
| `lab.achu.dev` | Experiments playground | Future |
| `api.achu.dev` | Backend/API surface | Future (do not expose yet) |

### If DNS is not yet managed by Cloudflare

Change nameservers at your domain registrar to Cloudflare's nameservers:
1. Add `achu.dev` to Cloudflare (Websites → Add a site)
2. Cloudflare will scan existing DNS records and provide new nameservers
3. Update nameservers at your registrar (Namecheap, Porkbun, etc.)
4. Wait for propagation (typically <1 hour, can take up to 48)

---

## Routes

| Route | Page |
|-------|------|
| `/` | Home — Three.js Achu Core hero + product system map + featured work |
| `/work` | Work index — all project cards |
| `/work/relay` | Relay case study |
| `/work/synax` | Synax case study |
| `/work/watchyourtemper` | watchyourtemper case study (extended: World, Releases, PRESSURE TEST, Commerce, Content System, Technical Surface) |
| `/resume` | Recruiter-readable resume with experience, projects, skills |
| `/notes` | Notes index (placeholder entries, MDX planned) |
| `/contact` | Centralized links — GitHub, LinkedIn, Email, watchyourtemper |
| `/lab` | Experiments index |
| `/experiments/relay-pretext` | Living Relay protocol-membrane card (Pretext canvas spike) |
| `/404` | Custom 404 |

---

## Project Structure

```
src/
  components/
    experiments/
      PretextCanvas.astro     # Reusable canvas wrapper (DPR, resize, motion pref, visibility)
      relay-animation.ts      # Relay living-card animation
    pretext/
      PretextHeadline.astro   # Editorial headline with decorative structure
      PretextPullQuote.astro  # Pull quote with accent border
      PretextEditorialBlock.astro  # Dark editorial container
    project/
      ProjectCard.astro       # Product-module card with accent colors + tech chips
    three/
      AchuCore.tsx            # R3F central core (4 states, auto-cycle, error boundary)
    ui/
      Nav.astro               # Sticky nav with active-state detection
      Footer.astro            # Minimal footer with key links
  data/
    site.ts                   # Site metadata (name, tagline, SEO)
    links.ts                  # Centralized external links
    projects.ts               # All project content (cards + full case studies)
    notes.ts                  # Notes placeholder entries
  layouts/
    BaseLayout.astro          # Shared shell (nav, footer, SEO, fonts)
    CaseStudyLayout.astro     # Case-study page with Pretext editorial components
  pages/
    index.astro               # Homepage with R3F hero island
    work.astro                # Work index
    work/[slug].astro         # Dynamic case-study route
    resume.astro              # Resume
    notes.astro               # Notes index
    contact.astro             # Contact links
    lab.astro                 # Experiments index
    experiments/
      relay-pretext.astro     # Relay Pretext living card
    404.astro                 # Not found
  styles/
    global.css                # Tailwind base + custom prose + section labels
```

---

## Visual Architecture

### The Achu Core (Three.js)

A React Three Fiber component that renders:
- Central octahedron nucleus with emissive glow
- Icosahedron wireframe containment shell
- Torus structural ring
- Orbiting particles (count varies per state)
- State-specific geometry accents (Relay routing nodes, Synax inner ring)

**States:** `default` → `relay` → `synax` → `watchyourtemper` (auto-cycles every 8s)

**Fallback:** SVG core mark if WebGL fails or `prefers-reduced-motion` is active.

**Accessibility:** All text content lives in semantic HTML outside the canvas. The core is decorative/progressive enhancement.

### Pretext Editorial Layer

CSS-based editorial typography inspired by Cheng Lou's [Pretext](https://chenglou.me/pretext/variable-typographic-ascii/) concept of text as programmable, measured material:

- `PretextHeadline` — Editorial headlines with left accent bar + large background glyph
- `PretextPullQuote` — Pull quotes with accent borders and decorative marks
- `PretextEditorialBlock` — Dark structured containers for case-study intros

**Accessibility:** All text renders in standard HTML. No critical content lives in canvas.

### Living Relay Card (`/experiments/relay-pretext`)

A Pretext-inspired canvas animation demonstrating the protocol-membrane concept:
- Routing rails with labeled ingress/egress lanes
- Text packets that enter raw (amber, noisy) and exit normalized (green, clean)
- Central compatibility membrane zone with transition visualization
- Status flashes at egress edge
- Subtle grid-dot background topology
- Corner accent marks

Respects `prefers-reduced-motion` and pauses offscreen.

---

## Data Architecture

All content is centralized in `src/data/`:

- **`site.ts`** — Name, tagline, supporting line, SEO defaults
- **`links.ts`** — All external URLs (GitHub, LinkedIn, email, watchyourtemper, project repos/docs)
- **`projects.ts`** — Project type definitions, card copy, full case-study content, extended sections
- **`notes.ts`** — Placeholder note entries (to be replaced with MDX collection)

No hardcoded links or text in components. Import from data files.

---

## Accessibility

- Semantic HTML with proper heading hierarchy
- Visible focus states on all interactive elements
- `prefers-reduced-motion` respected in Three.js core and Pretext canvas
- All critical content in HTML — canvas/WebGL layers are decorative
- Screen-reader text for canvas surfaces
- Keyboard-navigable navigation

---

## Performance

- Static-first Astro builds — HTML rendered at build time
- Three.js core is a lazy-loaded React island (`client:load`)
- Single persistent canvas on homepage — no multiple WebGL contexts
- Canvas pauses when offscreen (IntersectionObserver)
- No heavy assets, no external 3D models
- DPR-aware canvas sizing

---

## TODOs / Future Phases

### Phase 3+ (next)
- [ ] MDX content collection for notes with RSS feed
- [ ] Real PDF resume download
- [ ] Mobile nav hamburger + slide-out menu
- [ ] OG image auto-generation
- [ ] Pretext library integration for measured character widths
- [ ] Synax core morphology viewer in `/lab`
- [ ] Project category filtering on `/work`

### Phase 4+ (later)
- [ ] Dark/light mode toggle
- [ ] watchyourtemper expanded visual world (WebGL terrain/scene)
- [ ] Interactive product system map
- [ ] Blog / long-form essays
- [ ] Analytics (privacy-respecting)

---

## License

© Achu Mukundan. All rights reserved.
