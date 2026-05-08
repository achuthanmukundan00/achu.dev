/**
 * Site-wide metadata — single source of truth for achu.dev.
 */
export const site = {
  name: "achu mukundan",
  fullName: "Achu Mukundan",
  title: "Fullstack / Backend Engineer",
  tagline:
    "building local-first ai tools, developer systems, and creative worlds.",
  supportingLine:
    "Fullstack/backend engineer building model gateways, coding agents, creative operating systems, edge-deployed applications, and self-hosted infrastructure.",
  url: "https://achu.dev",
  locale: "en_US",
  ogImage: "/og-default.png", // TODO Phase 3: auto-generate OG images
} as const;

export const seo = {
  home: {
    title: `${site.name} — projects, writing, and experiments`,
    description: `${site.fullName} — building local-first AI tools, developer systems, and creative worlds.`,
  },
} as const;
