# achumukundan.dev

Personal blog and portfolio for [Achu Mukundan](https://achumukundan.dev), a software engineer in Toronto building developer tools, AI systems, and audio software.

## What is here

- A single-column homepage: introduction, writing, and every project
- Three project pages with source links and concise implementation notes, including [octet](https://octet.skaft.org) ([latest release](https://github.com/skaft-software/octet/releases/latest), [documentation](https://octet.skaft.org/octet/docs/))
- Technical notes, including the Intel Arc Pro B70 inference write-up, plus an [RSS feed](/rss.xml)
- Canonical, Open Graph, Twitter Card, and structured metadata

The site is static and uses a small custom stylesheet. Project copy lives in `src/data/projects.ts`; shared links and metadata live in `src/data/`.

## Design

Ink-on-near-black, one column, hairline rules, and type doing the work. The visual
system is in `src/styles/global.css`.

The layout follows writing-first personal sites: a name and one paragraph, then the
writing list, then every project. Posts lead with their date, projects carry their
current release tag or status on the right, and the only rule on the page is the one
under the fixed header.

Type is the Skaft Local 0.53 system, installed in `public/fonts/local/`:

- Headings: the variable Local Grotesk cut (`LocalGrotesk.woff2`) as `"Local Grotesk Display"`
- Body text: the static Local Grotesk regular and bold cuts
- Labels, metadata, code, and terminal text: the static Local Mono regular and bold cuts

`font-synthesis` is disabled so the static cuts only render installed weights. Cut
usage and checksums are recorded in `public/fonts/local/FONTS.md`.

## Stack

- [Astro](https://astro.build/)
- TypeScript
- CSS
- Markdown
- Cloudflare Pages

## Local development

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:4321`.

## Checks and production build

```bash
npm run build
```

The build command runs `astro check`, generates the static site in `dist/`, then
checks that email links remain inside the shared layout's Cloudflare
`email_off` exclusion. Keep those HTML comments: they prevent CDN email
obfuscation from turning ordinary `mailto:` links into JavaScript-only links.
This does not change the immutable asset or no-store evidence cache policies.
After deployment, check actual email links as well as source/build output.

The build also checks the August 20 B70 article: reduced measurements, means and
sample deviations, deterministic charts, public data and update metadata. Regenerate
its SVGs with `node scripts/generate-b70-qwen38-figures.mjs` after changing the
Qwen3.8 evidence. Keep the older article data and image URLs intact; the new bundle
uses dated filenames. The article's `updated` date records the rewrite, separately
from its original publication date and the setup-as-of date in the prose.

## Releases

`src/data/releases.json` is a checked-in snapshot of each project's latest GitHub
release. `npm run build` refreshes it first by calling `scripts/sync-releases.mjs`;
if GitHub is unreachable or rate-limited, the build keeps the snapshot and carries
on. Run `npm run releases` to refresh it by hand. Project rows read their version
from this file, so a release never needs a copy edit.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Introduction, writing, and all projects |
| `/work` | Project index and implementation notes |
| `/notes` | Writing index |
| `/contact` | Email and professional links |
| `/rss.xml` | RSS feed of published notes |

The old `/lab` route redirects to `/notes`. The octet project keeps its existing
`/work/ygg` URL; the historical ygg links remain on its page as provenance.

## Content updates

- Add or revise projects in `src/data/projects.ts`.
- Keep external URLs centralized in `src/data/links.ts`.
- Add notes under `src/pages/notes/` and index them in `src/data/notes.ts`. A note
  with `draft: true` in its frontmatter renders with `noindex` and is left out of
  the index, the feed, and the sitemap.
- Refresh release tags with `npm run releases`, or let the build do it.
- Keep the canonical origin set to `https://achumukundan.dev` in both `astro.config.mjs` and `src/data/site.ts`.

## Deployment

Cloudflare Pages configuration:

- Build command: `npm run build`
- Output directory: `dist`
- Canonical domain: `achumukundan.dev`

## License

Content and design © Achu Mukundan. All rights reserved.
