/**
 * relay-animation.ts — Living Relay protocol-membrane card.
 *
 * Visual concept:
 *   Horizontal routing rails carry text packets from left (raw ingress)
 *   through a central membrane zone to right (clean egress).
 *   Characters start messy and normalize as they cross the membrane —
 *   mirroring how Relay translates between agent expectations and local
 *   model realities.
 *
 * Designed for the PretextCanvas wrapper. Registered via:
 *   __pretext.register("canvas-id", relayAnimation);
 */

interface PretextState {
  width: number;
  height: number;
  time: number;
  deltaTime: number;
  reducedMotion: boolean;
  visible: boolean;
  dpr: number;
}

// ---------------------------------------------------------------------------
// Packet types — raw vs normalized text pairs
// ---------------------------------------------------------------------------

interface PacketType {
  raw: string[];
  normalized: string[];
}

const packetTypes: PacketType[] = [
  {
    raw: ["POST /v1", "GET /mod", "PATCH /f"],
    normalized: ['{"object":"chat"}', '{"data":[{', '200 OK'],
  },
  {
    raw: ["###ERR22", "ping##", "\\x03\\x1b", "###"],
    normalized: ['{"role":"user"}', 'data: [DONE]', 'finish_reason'],
  },
  {
    raw: [":8080/l", "127.0.0", "llama.c"],
    normalized: ["stream=true", '{"tool_calls":', "stop_reason"],
  },
  {
    raw: ["req:###", "INVALD", "%%%"],
    normalized: ["chat/completions", "messages", "tool_use"],
  },
];

// ---------------------------------------------------------------------------
// Packet instance
// ---------------------------------------------------------------------------

interface Packet {
  x: number;
  y: number;
  speed: number;
  chars: PacketChar[];
  phase: "raw" | "membrane" | "normalized";
  opacity: number;
  rail: number;
}

interface PacketChar {
  char: string;
  targetChar: string;
  offsetY: number;
  wobble: number;
  transitionProgress: number;
}

// ---------------------------------------------------------------------------
// Character set for visual density
// ---------------------------------------------------------------------------

const PROTOCOL_CHARS = "{}[]:\",/0123456789abcdefABCDEF.=-><|_*#@!?&%$";
function randomProtocolChar(): string {
  return PROTOCOL_CHARS[Math.floor(Math.random() * PROTOCOL_CHARS.length)];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

const RAIL_COLOR = "rgba(255, 255, 255, 0.05)";
const GRID_DOT_COLOR = "rgba(255, 255, 255, 0.025)";
const MEMBRANE_BG = "rgba(59, 130, 246, 0.03)";

function lerpColor(t: number, opacity: number): string {
  // Amber → Blue → Green
  if (t < 0.5) {
    // amber to blue
    const s = t / 0.5;
    const r = Math.round(196 + (59 - 196) * s);
    const g = Math.round(155 + (130 - 155) * s);
    const b = Math.round(60 + (246 - 60) * s);
    return `rgba(${r},${g},${b},${opacity})`;
  } else {
    // blue to green
    const s = (t - 0.5) / 0.5;
    const r = Math.round(59 + (74 - 59) * s);
    const g = Math.round(130 + (222 - 130) * s);
    const b = Math.round(246 + (128 - 246) * s);
    return `rgba(${r},${g},${b},${opacity})`;
  }
}

// ---------------------------------------------------------------------------
// Animation state
// ---------------------------------------------------------------------------

interface AnimationGlobals {
  packets: Packet[];
  statusFlashes: StatusFlash[];
  gridDots: { x: number; y: number }[];
  rails: number[];
  membraneStart: number;
  membraneEnd: number;
  charSize: number;
  spawnTimer: number;
  spawnInterval: number;
  initialized: boolean;
}

interface StatusFlash {
  x: number;
  y: number;
  text: string;
  opacity: number;
  life: number;
}

function createGlobals(width: number, height: number): AnimationGlobals {
  const railCount = 5;
  const railSpacing = height / (railCount + 1);
  const rails = Array.from({ length: railCount }, (_, i) => railSpacing * (i + 1));

  // Grid dots — background topology
  const gridDots: { x: number; y: number }[] = [];
  const gridStep = 50;
  for (let x = gridStep; x < width; x += gridStep) {
    for (let y = gridStep; y < height; y += gridStep) {
      gridDots.push({ x, y });
    }
  }

  return {
    packets: [],
    statusFlashes: [],
    gridDots,
    rails,
    membraneStart: width * 0.32,
    membraneEnd: width * 0.68,
    charSize: 13,
    spawnTimer: 0,
    spawnInterval: 0.6,
    initialized: false,
  };
}

let g: AnimationGlobals | null = null;

// ---------------------------------------------------------------------------
// Packet creation
// ---------------------------------------------------------------------------

function spawnPacket(_width: number, rails: number[]): Packet {
  const type = pickRandom(packetTypes);
  const rawText = pickRandom(type.raw);
  const normText = pickRandom(type.normalized);

  // Make both strings roughly same length for visual consistency
  const maxLen = Math.max(rawText.length, normText.length);
  const rawPadded = rawText.padEnd(maxLen, " ");
  const normPadded = normText.padEnd(maxLen, " ");

  const chars: PacketChar[] = [];
  for (let i = 0; i < maxLen; i++) {
    chars.push({
      char: rawPadded[i] || randomProtocolChar(),
      targetChar: normPadded[i] || " ",
      offsetY: (Math.random() - 0.5) * 4, // initial jitter
      wobble: Math.random() * Math.PI * 2,
      transitionProgress: 0,
    });
  }

  const rail = rails[Math.floor(Math.random() * rails.length)];

  return {
    x: -20 - Math.random() * 100, // start offscreen left
    y: rail,
    speed: 40 + Math.random() * 80, // px/s
    chars,
    phase: "raw",
    opacity: 0.55 + Math.random() * 0.25,
    rail: rails.indexOf(rail),
  };
}

function spawnStatusFlash(x: number, y: number): StatusFlash {
  const texts = ["200", "stream", "tool_call", "done", "OK", "data:", "[DONE]"];
  return {
    x,
    y,
    text: pickRandom(texts),
    opacity: 0.7,
    life: 1.5 + Math.random(),
  };
}

// ---------------------------------------------------------------------------
// Main animation function — called each frame by PretextCanvas wrapper
// ---------------------------------------------------------------------------

export function relayAnimation(ctx: CanvasRenderingContext2D, state: PretextState) {
  const { width, height, deltaTime } = state;

  // Initialize globals on first frame or resize
  if (!g || g.rails.length === 0) {
    g = createGlobals(width, height);
  }

  // Update on resize
  if (g.gridDots.length === 0 || g.rails[0] === undefined) {
    g = createGlobals(width, height);
  }

  const dt = deltaTime;

  // -----------------------------------------------------------------------
  // 1. Background — dark surface with grid dots
  // -----------------------------------------------------------------------
  ctx.fillStyle = "#06060a";
  ctx.fillRect(0, 0, width, height);

  // Grid dots
  ctx.fillStyle = GRID_DOT_COLOR;
  for (const dot of g.gridDots) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // -----------------------------------------------------------------------
  // 2. Membrane zone — subtle highlight band
  // -----------------------------------------------------------------------
  ctx.fillStyle = MEMBRANE_BG;
  ctx.fillRect(g.membraneStart, 0, g.membraneEnd - g.membraneStart, height);

  // Membrane edge lines
  ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(g.membraneStart, 0);
  ctx.lineTo(g.membraneStart, height);
  ctx.moveTo(g.membraneEnd, 0);
  ctx.lineTo(g.membraneEnd, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Membrane label
  ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  const memCenter = (g.membraneStart + g.membraneEnd) / 2;
  ctx.fillText("COMPATIBILITY MEMBRANE", memCenter, height - 8);

  // -----------------------------------------------------------------------
  // 3. Routing rails
  // -----------------------------------------------------------------------
  ctx.strokeStyle = RAIL_COLOR;
  ctx.lineWidth = 0.5;
  for (const railY of g.rails) {
    ctx.beginPath();
    ctx.moveTo(0, railY);
    ctx.lineTo(width, railY);
    ctx.stroke();
  }

  // Rail labels on the left
  const railLabels = [
    "ingress:openai",
    "ingress:anthropic",
    "bridge:relay",
    "egress:llama",
    "egress:stream",
  ];
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.font = "8px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  for (let i = 0; i < g.rails.length; i++) {
    const label = railLabels[i] || `lane:${i}`;
    ctx.fillText(label, 8, g.rails[i] - 8);
  }

  // Zone labels at bottom
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.font = "9px 'JetBrains Mono', monospace";
  const zoneW = width / 3;
  ctx.fillText("INGRESS", zoneW / 2, 16);
  ctx.fillText("EGRESS", width - zoneW / 2, 16);

  // -----------------------------------------------------------------------
  // 4. Spawn packets
  // -----------------------------------------------------------------------
  g.spawnTimer += dt;
  if (g.spawnTimer >= g.spawnInterval && g.packets.length < 14) {
    g.spawnTimer = 0;
    g.spawnInterval = 0.4 + Math.random() * 1.0;
    g.packets.push(spawnPacket(width, g.rails));
  }

  // -----------------------------------------------------------------------
  // 5. Update and render packets
  // -----------------------------------------------------------------------
  ctx.font = `${g.charSize}px 'JetBrains Mono', monospace`;
  ctx.textBaseline = "middle";

  const alivePackets: Packet[] = [];

  for (const packet of g.packets) {
    // Move packet
    packet.x += packet.speed * dt;

    // Determine phase based on position
    const x = packet.x;
    const charSpan = packet.chars.length * (g.charSize * 0.7);
    const centerX = x + charSpan / 2;

    if (centerX < g.membraneStart) {
      packet.phase = "raw";
    } else if (centerX > g.membraneEnd) {
      packet.phase = "normalized";
    } else {
      packet.phase = "membrane";
    }

    // Transition progress per character (0 = raw, 1 = normalized)
    const globalT =
      packet.phase === "raw"
        ? 0
        : packet.phase === "normalized"
          ? 1
          : (centerX - g.membraneStart) / (g.membraneEnd - g.membraneStart);

    // Remove if offscreen right, spawn status flash
    if (packet.x > width + 60) {
      g.statusFlashes.push(spawnStatusFlash(width - 10, packet.y));
      continue; // don't keep this packet
    }

    alivePackets.push(packet);

    // Update each character
    for (let i = 0; i < packet.chars.length; i++) {
      const ch = packet.chars[i];
      ch.transitionProgress = globalT;

      // Wobble decreases as we normalize
      const wobbleAmount = (1 - globalT) * 3;
      ch.wobble += dt * (2 + Math.random());
      ch.offsetY = Math.sin(ch.wobble) * wobbleAmount;

      // Character transition: at high globalT, snap to target
      if (globalT > 0.5 && Math.random() < globalT * dt * 4) {
        ch.char = ch.targetChar;
      } else if (globalT < 0.3 && Math.random() < (0.3 - globalT) * dt * 3) {
        ch.char = randomProtocolChar();
      }
    }

    // Render characters
    const charWidth = g.charSize * 0.65;
    for (let i = 0; i < packet.chars.length; i++) {
      const ch = packet.chars[i];
      const cx = packet.x + i * charWidth;
      const cy = packet.y + ch.offsetY;

      // Color based on transition
      const alpha = packet.opacity * (0.6 + ch.transitionProgress * 0.4);
      ctx.fillStyle = lerpColor(ch.transitionProgress, alpha);

      // Slight rotation in raw phase
      ctx.save();
      ctx.translate(cx, cy);
      if (packet.phase === "raw") {
        ctx.rotate((Math.random() - 0.5) * 0.06);
      }
      ctx.fillText(ch.char, 0, 0);
      ctx.restore();
    }

    // Background highlight behind packet (subtle)
    if (packet.phase === "membrane") {
      const pw = packet.chars.length * charWidth + 8;
      ctx.fillStyle = "rgba(59, 130, 246, 0.04)";
      ctx.fillRect(packet.x - 4, packet.y - g.charSize, pw, g.charSize * 2);
    }
  }

  g.packets = alivePackets;

  // -----------------------------------------------------------------------
  // 6. Status flashes (right edge)
  // -----------------------------------------------------------------------
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  const aliveFlashes: StatusFlash[] = [];

  for (const flash of g.statusFlashes) {
    flash.life -= dt;
    flash.opacity -= dt * 0.3;
    if (flash.life <= 0 || flash.opacity <= 0) continue;
    aliveFlashes.push(flash);

    flash.x -= dt * 15; // drift left slightly

    ctx.fillStyle = `rgba(74, 222, 128, ${Math.max(0, flash.opacity)})`;
    ctx.fillText(flash.text, flash.x, flash.y);

    // Subtle glow
    ctx.fillStyle = `rgba(74, 222, 128, ${Math.max(0, flash.opacity * 0.15)})`;
    ctx.fillText(flash.text, flash.x - 1, flash.y);
    ctx.fillText(flash.text, flash.x + 1, flash.y);
  }

  g.statusFlashes = aliveFlashes;

  // -----------------------------------------------------------------------
  // 7. Card border — armored edge
  // -----------------------------------------------------------------------
  ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  // Top-left corner accent
  ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
  ctx.fillRect(0, 0, 3, 12);
  ctx.fillRect(0, 0, 12, 3);

  // Bottom-right corner accent
  ctx.fillStyle = "rgba(74, 222, 128, 0.3)";
  ctx.fillRect(width - 3, height - 12, 3, 12);
  ctx.fillRect(width - 12, height - 3, 12, 3);
}
