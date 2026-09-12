import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/data/b70-workhorse/qwen38-20260820-results.json"), "utf8"));
const output = path.join(root, "public/images/notes/b70-workhorse");
const contexts = [16384, 32768, 65536, 130560];
const colors = { bg: "#111313", text: "#f1f2ef", muted: "#a4aaa6", grid: "#343837", off: "#858c88", mtp: "#e5e7e4", prefill: "#555a57" };
const escape = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const text = (x, y, value, size = 24, fill = colors.text, anchor = "start") => `<text x="${x}" y="${y}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${escape(value)}</text>`;
const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" />`;
const line = (x1, y1, x2, y2, fill = colors.grid, width = 2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${fill}" stroke-width="${width}" />`;
const frame = (title, desc, subtitle, body, height = 720) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="chart-title chart-description">
<title id="chart-title">${escape(title)}</title><desc id="chart-description">${escape(desc)}</desc>
${rect(0, 0, 1200, height, colors.bg)}
${text(56, 60, title, 36)}
${text(56, 101, subtitle, 22, colors.muted)}
${body.join("\n")}
</svg>\n`;

export function generateCharts() {
  const charts = new Map();
  const left = 360;
  const width = 570;
  const body = [text(56, 148, "Prompt tokens", 21, colors.muted), text(left, 148, "Decode tok/s", 21, colors.muted), text(1144, 148, "Mean ± sample SD", 21, colors.muted, "end")];
  for (const tick of [0, 20, 40, 60]) {
    const x = left + width * tick / 60;
    body.push(line(x, 168, x, 575), text(x, 611, tick, 22, colors.muted, "middle"));
  }
  contexts.forEach((context, i) => {
    const top = 185 + i * 103;
    body.push(text(56, top + 39, context.toLocaleString("en-US"), 25));
    for (const [j, mode] of ["no-spec", "mtp4"].entries()) {
      const row = data.rows[`${mode}/${context}`];
      const { mean, stdev } = row.decode_tok_s;
      const y = top + j * 37;
      const low = left + width * (mean - stdev) / 60;
      const high = left + width * (mean + stdev) / 60;
      body.push(text(190, y + 22, j ? "MTP4" : "No spec", 21, colors.muted));
      body.push(rect(left, y, width * mean / 60, 27, j ? colors.mtp : colors.off));
      body.push(line(low, y + 13, high, y + 13, colors.bg, 6), line(low, y + 13, high, y + 13, colors.text, 2));
      for (const x of [low, high]) body.push(line(x, y + 3, x, y + 24, colors.bg, 6), line(x, y + 3, x, y + 24, colors.text, 2));
      body.push(text(1144, y + 23, `${mean.toFixed(2)} ± ${stdev.toFixed(2)}`, 24, colors.text, "end"));
    }
  });
  body.push(text(56, 663, "3 runs/cell · 512 output tokens · C1 · no prefix-cache hits", 23, colors.muted));
  charts.set("qwen38-decode-20260820.svg", frame("Qwen3.8-27B: MTP4 earns its place", "Mean decode rates with sample standard deviations on one B70. MTP4 versus no speculation: 51.02 versus 31.09 tok/s at 16,384 prompt tokens; 47.91 versus 29.76 at 32,768; 40.72 versus 27.50 at 65,536; 36.48 versus 24.05 at 130,560.", "Intel Arc Pro B70 · patched vLLM XPU · August 20, 2026", body));

  const latency = [text(56, 147, "Prompt tokens", 21, colors.muted)];
  latency.push(rect(360, 127, 24, 20, colors.prefill), text(396, 145, "Time to first token", 21, colors.muted));
  latency.push(rect(635, 127, 24, 20, colors.mtp), text(671, 145, "Remaining generation", 21, colors.muted));
  for (const tick of [0, 50, 100, 150, 200]) {
    const x = left + 680 * tick / 200;
    latency.push(line(x, 168, x, 575), text(x, 611, tick, 22, colors.muted, "middle"));
  }
  contexts.forEach((context, i) => {
    const top = 185 + i * 103;
    latency.push(text(56, top + 39, context.toLocaleString("en-US"), 25));
    for (const [j, mode] of ["no-spec", "mtp4"].entries()) {
      const row = data.rows[`${mode}/${context}`];
      const ttft = row.ttft_s.mean;
      const total = row.wall_s.mean;
      const y = top + j * 37;
      const prefillWidth = 680 * ttft / 200;
      latency.push(text(190, y + 22, j ? "MTP4" : "No spec", 21, colors.muted));
      latency.push(rect(left, y, prefillWidth, 27, colors.prefill), rect(left + prefillWidth, y, 680 * (total - ttft) / 200, 27, colors.mtp));
      latency.push(text(1144, y + 23, `${total.toFixed(2)} s`, 24, colors.text, "end"));
    }
  });
  latency.push(text(56, 655, "Mean request time in seconds · 512 output tokens · same uncached matrix", 22, colors.muted));
  latency.push(text(56, 689, "Full context: decode is faster, but the whole request is effectively tied.", 22, colors.muted));
  charts.set("qwen38-latency-20260820.svg", frame("The whole request still has to ingest the prompt", "Mean request latency split into time to first token and the remaining generation interval. No speculation versus MTP4: 26.42 versus 20.36 seconds at 16,384 prompt tokens; 40.22 versus 34.55 at 32,768; 76.76 versus 73.02 at 65,536; 185.38 versus 185.71 at 130,560.", "Intel Arc Pro B70 · Qwen3.8-27B · 3 measured runs per cell", latency));

  const social = [
    text(64, 78, "ACHU MUKUNDAN · AUGUST 20 SETUP", 28, colors.muted),
    text(64, 183, "Qwen3.8-27B + MTP4", 64),
    text(64, 269, "The B70 setup I love", 64),
    line(64, 322, 1136, 322),
    text(64, 385, "Ditching llm-scaler. Patching vLLM.", 36, colors.muted),
    text(64, 471, `${data.rows['mtp4/16384'].decode_tok_s.mean.toFixed(2)} generation tok/s`, 58),
    text(64, 535, "16,384 prompt + 512 output tokens · mean of 3 runs", 28, colors.muted),
    text(64, 585, "Working through the stack with GPT-5.6 Sol", 28, colors.muted),
  ];
  charts.set("qwen38-og-20260820.svg", `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${rect(0, 0, 1200, 630, colors.bg)}${social.join("\n")}</svg>\n`);
  return charts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(output, { recursive: true });
  for (const [name, svg] of generateCharts()) fs.writeFileSync(path.join(output, name), svg);
  console.log("Wrote three August 20 Qwen3.8 SVGs from the public result summary.");
}
