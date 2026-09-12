import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCharts } from "./generate-b70-qwen38-figures.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const prefix = "public/data/b70-workhorse/qwen38-20260820-";
const summary = JSON.parse(read(`${prefix}results.json`));
const method = JSON.parse(read(`${prefix}methodology.json`));
const runs = read(`${prefix}runs.jsonl`).trim().split("\n").map((line) => JSON.parse(line));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
assert.equal(runs.length, 24);
assert.equal(summary.setup_as_of, "2026-08-20");
assert.equal(method.production.max_num_seqs, 1);
assert.equal(method.production.prefix_caching, true);
assert.equal(method.benchmark_serving.max_num_seqs, 64);
assert.equal(method.benchmark_serving.prefix_caching, false);
assert.deepEqual(method.benchmark_serving.gpu_memory_utilization, { "no-spec": 0.9, mtp4: 0.88 });
assert.equal(method.production.max_model_len, 130560 + 512);
assert.equal(Object.keys(summary.rows).length, 8);
for (const context of [16384, 32768, 65536, 130560]) {
  for (const mode of ["no-spec", "mtp4"]) {
    const cell = summary.rows[`${mode}/${context}`];
    const records = runs.filter((r) => r.mode === mode && r.prompt_tokens === context);
    assert.equal(records.length, 3);
    assert.equal(new Set(records.map((r) => r.rep)).size, 3);
    for (const [i, record] of records.entries()) {
      assert.equal(record.completion_tokens, 512);
      assert.equal(record.prefix_cache_hits, 0);
      assert.equal(record.recorded_mechanical_check, true);
      near(record.decode_tok_s, 511 / record.post_first_generation_s);
      near(record.wall_s, record.ttft_s + record.post_first_generation_s);
      assert.equal(record.output_sha256, cell.output_sha256[i]);
    }
    for (const metric of ["decode_tok_s", "ttft_s", "wall_s"]) {
      const values = records.map((r) => r[metric]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1));
      near(cell[metric].mean, mean);
      near(cell[metric].stdev, sd);
    }
  }
  const off = summary.rows[`no-spec/${context}`];
  const mtp = summary.rows[`mtp4/${context}`];
  near(mtp.decode_speedup_vs_no_spec, mtp.decode_tok_s.mean / off.decode_tok_s.mean);
}
for (const [name, svg] of generateCharts()) {
  assert.equal(read(`public/images/notes/b70-workhorse/${name}`), svg, `Regenerate ${name} after changing data`);
}
for (const name of ["results.json", "runs.jsonl", "methodology.json", "README.md"]) {
  const source = read(`${prefix}${name}`);
  assert.doesNotMatch(source, /\/home\/|\/Users\/|temper-inference|127\.0\.0\.1|BEGIN .*PRIVATE KEY|Bearer [A-Za-z0-9]/);
  assert.equal(read(`dist/data/b70-workhorse/qwen38-20260820-${name}`), source);
}
const generator = "generate-b70-qwen38-figures.mjs";
assert.equal(read(`dist/data/b70-workhorse/${generator}`), read(`scripts/${generator}`));
const html = read("dist/notes/intel-arc-pro-b70-inference-stack/index.html");
for (const cell of Object.values(summary.rows)) {
  assert.ok(html.includes(`${cell.decode_tok_s.mean.toFixed(2)} ± ${cell.decode_tok_s.stdev.toFixed(2)}`), "Article table differs from evidence");
}
for (const expected of ["Ditching llm-scaler", "GPT-5.6 Sol", "Qwen3.8-27B", "August 20, 2026", "qwen38-decode-20260820.svg", "qwen38-latency-20260820.svg", "171.59", "185.71"]) assert.ok(html.includes(expected), expected);
assert.ok(html.includes('property="article:published_time" content="2026-07-25"'));
assert.ok(html.includes('property="article:modified_time" content="2026-09-12"'));
assert.ok(html.includes('"dateModified":"2026-09-12"'));
assert.ok(html.includes('property="og:image" content="https://achumukundan.dev/images/notes/b70-workhorse/qwen38-og-20260820.png"'));
assert.ok(read("dist/sitemap.xml").includes("<lastmod>2026-09-12</lastmod>"));
for (const name of ["dist/index.html", "dist/notes/index.html"]) {
  assert.ok(read(name).includes("Ditching llm-scaler"));
  assert.ok(read(name).includes("Updated 2026-09-12"));
}
console.log("B70 article: 24 measured records, 8 means/sample SDs, deterministic SVGs, public data, source endpoint and update metadata verified.");
