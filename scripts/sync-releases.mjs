// Refresh the checked-in release snapshot from GitHub.
// Failures keep the existing snapshot so a build never depends on the network.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(new URL("../src/data/releases.json", import.meta.url));
const snapshot = JSON.parse(await readFile(file, "utf8"));
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "achumukundan.dev-release-sync",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const normalize = (release) =>
  release
    ? {
        tag: release.tag_name,
        name: release.name,
        url: release.html_url,
        publishedAt: release.published_at,
        prerelease: release.prerelease,
      }
    : null;

let changed = false;

for (const repo of Object.keys(snapshot.repos)) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=10`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const releases = await response.json();
    const latest = normalize(releases.find((release) => !release.draft) ?? null);
    const current = snapshot.repos[repo];

    if (JSON.stringify(latest) !== JSON.stringify(current)) {
      snapshot.repos[repo] = latest;
      changed = true;
      console.log(`releases: ${repo} → ${latest?.tag ?? "no releases"}`);
    }
  } catch (error) {
    console.warn(`releases: keeping checked-in ${repo} (${error.message})`);
  }
}

if (changed) {
  snapshot.updatedAt = new Date().toISOString().slice(0, 10);
  await writeFile(file, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`releases: snapshot updated ${snapshot.updatedAt}`);
} else {
  console.log("releases: snapshot current");
}
