import type { APIRoute } from "astro";
import { notes } from "@data/notes";
import { projects } from "@data/projects";
import { site } from "@data/site";

export const prerender = true;

const staticPaths = [
  "/",
  "/work/",
  "/notes/",
  "/resume/",
  "/contact/",
];

export const GET: APIRoute = () => {
  const paths = [
    ...staticPaths,
    ...projects.map((project) => `/work/${project.slug}/`),
    ...notes.map((note) => `${note.slug}/`),
  ];

  const urls = paths
    .map((path) => `  <url><loc>${new URL(path, site.url).toString()}</loc></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
};
