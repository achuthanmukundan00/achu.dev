import type { APIRoute } from "astro";
import { notes } from "@data/notes";
import { site } from "@data/site";

export const prerender = true;

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const GET: APIRoute = () => {
  const items = notes
    .map((note) => {
      const url = new URL(note.slug, site.url).toString();
      const date = new Date(note.updated ?? note.date).toUTCString();
      return [
        "    <item>",
        `      <title>${escape(note.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${date}</pubDate>`,
        `      <category>${escape(note.topic)}</category>`,
        `      <description>${escape(note.summary)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const newest = notes[0] ? new Date(notes[0].updated ?? notes[0].date).toUTCString() : new Date(0).toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.fullName)}</title>
    <link>${site.url}</link>
    <description>${escape(site.supportingLine)}</description>
    <language>en-ca</language>
    <lastBuildDate>${newest}</lastBuildDate>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
