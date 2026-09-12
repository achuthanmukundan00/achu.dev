# achumukundan.dev

Personal blog and portfolio for [Achu Mukundan](https://achumukundan.dev), a software engineer in Toronto building developer tools, AI systems, and audio software.

## What is here

- A writing-first homepage with three selected projects
- Five project pages with source links and concise implementation notes, including [octet](https://octet.skaft.org) ([v0.7.6 source](https://github.com/skaft-software/octet/releases/tag/v0.7.6), [documentation](https://octet.skaft.org/octet/docs/))
- An HTML resume
- Technical notes, including the Intel Arc Pro B70 inference write-up
- Canonical, Open Graph, Twitter Card, and structured metadata

The site is static and uses a small custom stylesheet. Project copy lives in `src/data/projects.ts`; shared links and metadata live in `src/data/`.

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

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Short introduction, writing list, selected projects, and contact links |
| `/work` | Project index and implementation notes |
| `/notes` | Published technical notes |
| `/resume` | Experience, education, and technical work |
| `/contact` | Email and professional links |

The old `/lab` route redirects to `/notes`. The octet project keeps its existing `/work/ygg` URL; version-pinned ygg links remain historical references.

## Content updates

- Add or revise projects in `src/data/projects.ts`.
- Keep external URLs centralized in `src/data/links.ts`.
- Add notes under `src/pages/notes/` and index them in `src/data/notes.ts`.
- Keep the canonical origin set to `https://achumukundan.dev` in both `astro.config.mjs` and `src/data/site.ts`.

## Deployment

Cloudflare Pages configuration:

- Build command: `npm run build`
- Output directory: `dist`
- Canonical domain: `achumukundan.dev`

## License

Content and design © Achu Mukundan. All rights reserved.
