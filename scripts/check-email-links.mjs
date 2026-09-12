import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const pages = readdirSync(dist, { recursive: true }).filter((name) =>
  name.endsWith(".html"),
);
assert(pages.length > 0, "Build the static site before checking email links");

for (const page of pages) {
  const html = readFileSync(join(dist, page), "utf8");
  const start = html.indexOf("<!--email_off-->");
  const end = html.indexOf("<!--/email_off-->");
  assert(start >= 0 && end > start, `${page}: missing CDN email exclusion`);
  const links = [...html.matchAll(/\bhref="mailto:[^"]*"/g)];
  assert(links.length > 0, `${page}: missing ordinary email links`);
  for (const link of links) {
    assert(
      link.index > start && link.index < end,
      `${page}: email link outside the CDN exclusion`,
    );
  }
}

console.log(`Verified ordinary email links in ${pages.length} static HTML pages.`);
