import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "public/data/b70-workhorse");
const outputDir = path.join(root, "public/images/notes/b70-workhorse");

const measurements = JSON.parse(
  fs.readFileSync(path.join(dataDir, "measurements.json"), "utf8"),
);
const quality = JSON.parse(
  fs.readFileSync(path.join(dataDir, "quality-summary.json"), "utf8"),
);
const results = fs
  .readFileSync(path.join(dataDir, "selected-results.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));

fs.mkdirSync(outputDir, { recursive: true });

const colors = {
  background: "#111313",
  surface: "#181a1a",
  grid: "#343837",
  text: "#f1f2ef",
  muted: "#a4aaa6",
  primary: "#e5e7e4",
  secondary: "#858c88",
  tertiary: "#555a57",
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const text = (x, y, value, options = {}) => {
  const {
    anchor = "start",
    fill = colors.text,
    size = 24,
    weight = 400,
  } = options;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(value)}</text>`;
};

const line = (x1, y1, x2, y2, options = {}) => {
  const {
    stroke = colors.grid,
    width = 2,
    dash = "",
  } = options;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""} />`;
};

const rect = (x, y, width, height, fill = colors.primary) =>
  `<rect x="${x}" y="${y}" width="${Math.max(0, width)}" height="${height}" fill="${fill}" />`;

const circle = (cx, cy, radius, fill = colors.primary) =>
  `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" />`;

const polyline = (points, stroke = colors.primary) =>
  `<polyline points="${points.map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="${stroke}" stroke-width="5" />`;

const frame = (title, description, body, subtitle = "") => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="chart-title chart-description">
  <title id="chart-title">${escapeXml(title)}</title>
  <desc id="chart-description">${escapeXml(description)}</desc>
  <rect width="1200" height="720" fill="${colors.background}" />
  ${text(56, 62, title, { size: 36, weight: 650 })}
  ${subtitle ? text(56, 102, subtitle, { fill: colors.muted }) : ""}
  ${body}
</svg>
`;

const writeChart = (name, title, description, body, subtitle = "") => {
  fs.writeFileSync(
    path.join(outputDir, name),
    frame(title, description, body, subtitle),
  );
};

const result = (id) => {
  const match = results.find((entry) => entry.id === id);
  if (!match) throw new Error(`Missing result: ${id}`);
  return match;
};

const metric = (id, key) => result(id).measurement[key];

function longContextChart() {
  const rows = [
    ["Qwen 27B · AutoRound", "qwen27-autoround-115k-c1", colors.primary],
    ["Qwen 27B · Q4_K_S", "qwen27-q4ks-115k-c1", colors.tertiary],
    ["Qwen 35B-A3B · AutoRound", "qwen35a3b-autoround-115k-c1", colors.primary],
    ["Qwen 35B-A3B · Q4_K_S", "qwen35a3b-q4ks-115k-c1", colors.tertiary],
    ["Ornith 35B · AutoRound", "ornith35-autoround-115k-c1", colors.primary],
    ["Ornith 35B · Q4_K_S", "ornith35-q4ks-115k-c1", colors.tertiary],
  ];
  const yStart = 180;
  const rowGap = 74;
  const promptX = 405;
  const promptWidth = 330;
  const generationX = 850;
  const generationWidth = 260;
  const promptMax = 3500;
  const generationMax = 50;
  const body = [
    text(promptX, 142, "Prompt tok/s", { fill: colors.muted }),
    text(generationX, 142, "Generation tok/s", { fill: colors.muted }),
    line(promptX, 158, promptX + promptWidth, 158),
    line(generationX, 158, generationX + generationWidth, 158),
    ...rows.flatMap(([label, id, fill], index) => {
      const y = yStart + index * rowGap;
      const prompt = metric(id, "pp");
      const generation = metric(id, "tg");
      const promptBar = (prompt / promptMax) * promptWidth;
      const generationBar = (generation / generationMax) * generationWidth;
      const promptInside = promptBar > promptWidth - 80;
      const generationInside = generationBar > generationWidth - 80;
      return [
        text(56, y + 24, label),
        rect(promptX, y, promptBar, 32, fill),
        text(promptX + (promptInside ? promptBar - 10 : promptBar + 10), y + 25, prompt.toFixed(0), {
          anchor: promptInside ? "end" : "start",
          fill: promptInside && fill === colors.primary ? colors.background : colors.text,
        }),
        rect(generationX, y, generationBar, 32, fill),
        text(generationX + (generationInside ? generationBar - 10 : generationBar + 10), y + 25, generation.toFixed(2), {
          anchor: generationInside ? "end" : "start",
          fill: generationInside && fill === colors.primary ? colors.background : colors.text,
        }),
      ];
    }),
  ].join("\n");

  writeChart(
    "long-context-throughput.svg",
    "115K prior tokens, one request",
    "At 115,404 prior tokens, Qwen 35B-A3B AutoRound reached 3,377 prompt and 47.03 generation tokens per second. Its Q4_K_S GGUF row reached 528 prompt and 42.63 generation tokens per second. Ornith showed a similar result. Qwen 27B AutoRound reached 1,025 prompt and 21.73 generation tokens per second, while GGUF reached 130 and 10.69.",
    body,
    "PP2048 + TG512 · one measured run per cell",
  );
}

function memoryChart() {
  const max = 25;
  const barX = 450;
  const barWidth = 600;
  const yStart = 170;
  const rowGap = 98;
  const body = [
    rect(56, 126, 28, 20, colors.primary),
    text(96, 144, "Model load"),
    rect(265, 126, 28, 20, colors.secondary),
    text(305, 144, "Available KV"),
    ...measurements.startup_memory.flatMap((entry, index) => {
      const y = yStart + index * rowGap;
      const modelWidth = (entry.model_load_gib / max) * barWidth;
      const kvWidth = (entry.available_kv_gib / max) * barWidth;
      return [
        text(56, y + 26, entry.label),
        rect(barX, y, modelWidth, 30, colors.primary),
        text(barX + modelWidth + 10, y + 25, `${entry.model_load_gib.toFixed(2)} GiB`),
        rect(barX, y + 40, kvWidth, 30, colors.secondary),
        text(barX + kvWidth + 10, y + 65, `${entry.available_kv_gib.toFixed(2)} GiB`),
      ];
    }),
  ].join("\n");

  writeChart(
    "startup-memory.svg",
    "Memory reported by vLLM at startup",
    "vLLM reported model load and available KV memory for five tested configurations. Gemma 4 12B AutoRound loaded in 7.63 GiB with 19.13 GiB available for KV, while Gemma BF16 loaded in 22.73 GiB with 7.58 GiB available at a higher GPU memory utilization setting.",
    body,
    "Reported buckets are separate; runtime overhead is omitted",
  );
}

function gemmaFourKChart() {
  const rows = [
    ["BF16", "gemma12-bf16-4k-c1", colors.secondary],
    ["AutoRound INT4", "gemma12-autoround-4k-c1", colors.primary],
    ["QAT W4A16", "gemma12-w4a16-4k-c1", colors.tertiary],
  ];
  const yStart = 220;
  const rowGap = 130;
  const promptX = 315;
  const promptWidth = 390;
  const generationX = 820;
  const generationWidth = 290;
  const body = [
    text(promptX, 170, "Prompt tok/s", { fill: colors.muted }),
    text(generationX, 170, "Generation tok/s", { fill: colors.muted }),
    line(promptX, 188, promptX + promptWidth, 188),
    line(generationX, 188, generationX + generationWidth, 188),
    ...rows.flatMap(([label, id, fill], index) => {
      const y = yStart + index * rowGap;
      const prompt = metric(id, "pp");
      const generation = metric(id, "tg");
      const promptBar = (prompt / 4600) * promptWidth;
      const generationBar = (generation / 55) * generationWidth;
      const promptInside = promptBar > promptWidth - 70;
      const generationInside = generationBar > generationWidth - 80;
      return [
        text(56, y + 30, label),
        rect(promptX, y, promptBar, 40, fill),
        text(promptX + (promptInside ? promptBar - 12 : promptBar + 12), y + 31, prompt.toFixed(0), {
          anchor: promptInside ? "end" : "start",
          fill: promptInside && fill === colors.primary ? colors.background : colors.text,
        }),
        rect(generationX, y, generationBar, 40, fill),
        text(generationX + (generationInside ? generationBar - 12 : generationBar + 12), y + 31, generation.toFixed(2), {
          anchor: generationInside ? "end" : "start",
          fill: generationInside && fill === colors.primary ? colors.background : colors.text,
        }),
      ];
    }),
  ].join("\n");

  writeChart(
    "gemma-4k-throughput.svg",
    "Gemma 4 12B at 4K context",
    "In one measured run per cell, BF16 reached 4,420 prompt and 21.26 generation tokens per second. AutoRound reached 3,364 prompt and 51.86 generation. The QAT W4A16 checkpoint reached 628 prompt and 19.27 generation.",
    body,
    "Depth 1,126 · PP2048 + TG512 · concurrency 1",
  );
}

function depthChart() {
  const series = [
    {
      label: "AutoRound INT4",
      color: colors.primary,
      points: [
        [1126, metric("gemma12-autoround-4k-c1", "tg")],
        [4812, metric("gemma12-autoround-8k-b8192-c1", "tg")],
        [115404, metric("gemma12-autoround-115k-c1", "tg")],
      ],
    },
    {
      label: "BF16",
      color: colors.secondary,
      points: [
        [1126, metric("gemma12-bf16-4k-c1", "tg")],
        [4812, metric("gemma12-bf16-8k-c1", "tg")],
        [115404, metric("gemma12-bf16-115k-c1", "tg")],
      ],
    },
  ];
  const left = 160;
  const right = 1100;
  const top = 170;
  const bottom = 590;
  const minLog = Math.log10(1126);
  const maxLog = Math.log10(115404);
  const x = (value) => left + ((Math.log10(value) - minLog) / (maxLog - minLog)) * (right - left);
  const y = (value) => bottom - (value / 60) * (bottom - top);
  const body = [
    ...[0, 20, 40, 60].flatMap((tick) => [
      line(left, y(tick), right, y(tick)),
      text(left - 20, y(tick) + 8, tick, { anchor: "end", fill: colors.muted }),
    ]),
    ...[1126, 4812, 115404].flatMap((tick) => [
      line(x(tick), top, x(tick), bottom, { stroke: colors.grid, dash: "8 10" }),
      text(x(tick), bottom + 42, tick.toLocaleString("en-US"), { anchor: "middle", fill: colors.muted }),
    ]),
    text(left, 142, "Generation tok/s", { fill: colors.muted }),
    ...series.flatMap((entry) => {
      const points = entry.points.map(([depth, value]) => [x(depth), y(value)]);
      return [
        polyline(points, entry.color),
        ...points.flatMap(([pointX, pointY], index) => [
          circle(pointX, pointY, 8, entry.color),
          text(pointX, pointY - 18, entry.points[index][1].toFixed(2), {
            anchor: "middle",
          }),
        ]),
      ];
    }),
    line(710, 648, 750, 648, { stroke: colors.primary, width: 5 }),
    text(765, 657, "AutoRound INT4"),
    line(950, 648, 990, 648, { stroke: colors.secondary, width: 5 }),
    text(1005, 657, "BF16"),
  ].join("\n");

  writeChart(
    "gemma-depth.svg",
    "Gemma decode slows as the prefix grows",
    "Gemma AutoRound generated 51.86 tokens per second at 1,126 prior tokens, 45.43 at 4,812, and 16.75 at 115,404. BF16 generated 21.26, 20.08, and 11.38 at the same depths.",
    body,
    "PP2048 + TG512 · concurrency 1 · depth axis uses a log scale",
  );
}

function concurrencyChart() {
  const rows = [
    ["AutoRound · c1", "gemma12-autoround-8k-b8192-c1", colors.primary],
    ["AutoRound · c2", "gemma12-autoround-8k-b8192-c2", colors.primary],
    ["AutoRound · c4", "gemma12-autoround-8k-b8192-c4", colors.primary],
    ["BF16 · c1", "gemma12-bf16-8k-c1", colors.secondary],
    ["BF16 · c4", "gemma12-bf16-8k-c4", colors.secondary],
  ];
  const x = 350;
  const width = 720;
  const yStart = 170;
  const gap = 92;
  const body = [
    text(x, 138, "Aggregate generation tok/s", { fill: colors.muted }),
    line(x, 152, x + width, 152),
    ...rows.flatMap(([label, id, fill], index) => {
      const y = yStart + index * gap;
      const value = metric(id, "tg");
      const barWidth = (value / 115) * width;
      const inside = barWidth > width - 85;
      return [
        text(56, y + 31, label),
        rect(x, y, barWidth, 40, fill),
        text(x + (inside ? barWidth - 12 : barWidth + 12), y + 31, value.toFixed(2), {
          anchor: inside ? "end" : "start",
          fill: inside && fill === colors.primary ? colors.background : colors.text,
        }),
      ];
    }),
  ].join("\n");

  writeChart(
    "gemma-concurrency.svg",
    "Gemma 8K aggregate decode throughput",
    "At 4,812 prior tokens, Gemma AutoRound produced 45.43 aggregate generation tokens per second at concurrency one, 73.46 at concurrency two, and 109.56 at concurrency four. BF16 produced 20.08 at concurrency one and 64.85 at concurrency four.",
    body,
    "Depth 4,812 · PP2048 + TG512 per request",
  );
}

function qualityChart() {
  const ratios = [
    ["WikiText-2", quality.fixed_delta.wikitext2.quant_perplexity_ratio],
    ["HumanEval code", quality.fixed_delta.humaneval_code.quant_perplexity_ratio],
  ];
  const ratioLeft = 90;
  const ratioRight = 625;
  const ratioX = (value) => ratioLeft + ((value - 0.85) / 0.3) * (ratioRight - ratioLeft);
  const klEntries = [
    ["BF16 → INT4", quality.monte_carlo_kl.bf16_to_quant_forward],
    ["INT4 → BF16", quality.monte_carlo_kl.quant_to_bf16_reverse],
  ];
  const klLeft = 765;
  const klRight = 1110;
  const klX = (value) => klLeft + (value / 0.16) * (klRight - klLeft);
  const body = [
    text(56, 150, "Conditional perplexity ratio", { fill: colors.muted }),
    text(704, 150, "Monte Carlo KL · nats/token", { fill: colors.muted }),
    line(ratioX(1), 180, ratioX(1), 500, { stroke: colors.secondary, width: 3 }),
    text(ratioX(1), 540, "BF16 baseline", { anchor: "middle", fill: colors.muted }),
    ...ratios.flatMap(([label, value], index) => {
      const y = 250 + index * 170;
      return [
        text(56, y - 28, label),
        line(ratioX(1), y, ratioX(value), y, { stroke: colors.primary, width: 8 }),
        circle(ratioX(value), y, 12, colors.primary),
        text(ratioX(value), y + 50, `${value.toFixed(3)}×`, { anchor: "middle" }),
      ];
    }),
    ...klEntries.flatMap(([label, entry], index) => {
      const y = 250 + index * 170;
      const [low, high] = entry.ci95_nats_per_token;
      return [
        text(704, y - 28, label),
        rect(klLeft, y - 16, klX(entry.nats_per_token) - klLeft, 32, colors.secondary),
        line(klX(low), y, klX(high), y, { stroke: colors.text, width: 5 }),
        line(klX(low), y - 14, klX(low), y + 14, { stroke: colors.text, width: 4 }),
        line(klX(high), y - 14, klX(high), y + 14, { stroke: colors.text, width: 4 }),
        circle(klX(entry.nats_per_token), y, 9, colors.primary),
        text(klLeft, y + 50, `${entry.nats_per_token.toFixed(3)} · 95% CI ${low.toFixed(3)} to ${high.toFixed(3)}`),
      ];
    }),
    text(56, 632, "Ratio above 1 means higher AutoRound perplexity", { fill: colors.muted }),
    text(704, 632, "24 sequences · 4,608 tokens each direction", { fill: colors.muted }),
  ].join("\n");

  writeChart(
    "gemma-quality.svg",
    "Gemma BF16 and AutoRound quality checks",
    "AutoRound's conditional assistant-target perplexity ratio was 1.108 on WikiText-2 and 0.930 on HumanEval canonical code. Forward KL was 0.119 nats per token with a 95 percent interval from 0.100 to 0.140. Reverse KL was 0.119 with an interval from 0.090 to 0.149.",
    body,
    "Paired tokenizer, template, datasets, and runtime",
  );
}

function socialCard() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${colors.background}" />
  ${text(64, 80, "ACHU MUKUNDAN", { size: 32, weight: 650, fill: colors.muted })}
  ${text(64, 186, "Intel Arc Pro B70", { size: 64, weight: 700 })}
  ${text(64, 264, "inference, with the numbers", { size: 64, weight: 700 })}
  ${line(64, 324, 1136, 324, { stroke: colors.grid, width: 3 })}
  ${text(64, 392, "Qwen3.6 35B-A3B · AutoRound INT4", { size: 32, fill: colors.muted })}
  ${text(64, 474, "3,377 prompt tok/s", { size: 64, weight: 700 })}
  ${text(64, 548, "47.03 generation tok/s · 115,404 prior tokens", { size: 32, fill: colors.muted })}
</svg>
`;
  fs.writeFileSync(path.join(outputDir, "og.svg"), svg);
}

longContextChart();
memoryChart();
gemmaFourKChart();
depthChart();
concurrencyChart();
qualityChart();
socialCard();

console.log(`Wrote B70 figures to ${path.relative(root, outputDir)}`);
