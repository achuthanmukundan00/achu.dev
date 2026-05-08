import { useMemo, useState } from "react";
import AchuCore, { type CoreState } from "@components/three/AchuCore";

type HomeLinks = {
  github: string;
  linkedin: string;
  watchyourtemper: string;
};

type Module = {
  id: Exclude<CoreState, "default">;
  title: string;
  label: string;
  detail: string;
  href: string;
  layer: string;
  metric: string;
  nodeClass: string;
};

const modules: Module[] = [
  {
    id: "relay",
    title: "Relay",
    label: "MODEL GATEWAY",
    detail: "OpenAI/Anthropic-compatible shim for local llama.cpp runtimes.",
    href: "/work/relay",
    layer: "MODEL IO",
    metric: "protocol bridge",
    nodeClass: "node-relay",
  },
  {
    id: "synax",
    title: "Synax",
    label: "CODING AGENT",
    detail: "Terminal-native agent loop for quantized local and cloud models.",
    href: "/work/synax",
    layer: "AGENT TRACE",
    metric: "observable loop",
    nodeClass: "node-synax",
  },
  {
    id: "wytos",
    title: "wytOS",
    label: "MEMORY OS",
    detail: "Structured creative memory, retrieval, and workflow automation.",
    href: "/work/wytos",
    layer: "MEMORY GRAPH",
    metric: "retrieval layer",
    nodeClass: "node-wytos",
  },
  {
    id: "watchyourtemper",
    title: "watchyourtemper",
    label: "AUDIO WORLD",
    detail: "Electronic music, events, merch, and worldbuilding.",
    href: "https://watchyourtemper.com",
    layer: "WORLD IO",
    metric: "pressure system",
    nodeClass: "node-watchyourtemper",
  },
];

const statusByState: Record<CoreState, string[]> = {
  default: ["LOCAL RUNTIME", "MODEL IO", "CORE TEMP 37C"],
  relay: ["MODEL GATEWAY", "OPENAI/ANTHROPIC", "ROUTE STABLE"],
  synax: ["AGENT TRACE", "TERMINAL NATIVE", "LOOP VISIBLE"],
  wytos: ["MEMORY GRAPH", "CONTEXT WINDOW", "RETRIEVAL HOT"],
  watchyourtemper: ["AUDIO WORLD", "FEED THE MACHINE", "STREAMING EVERYWHERE"],
};

const phraseState: Array<{ state: CoreState; text: string }> = [
  { state: "relay", text: "local-first ai tools" },
  { state: "synax", text: "developer systems" },
  { state: "watchyourtemper", text: "inhabitable worlds" },
];

function isExternal(href: string) {
  return href.startsWith("http");
}

export default function HomeControlSurface({ links }: { links: HomeLinks }) {
  const [activeState, setActiveState] = useState<CoreState>("default");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const activeModule = useMemo(
    () => modules.find((module) => module.id === activeState) ?? selectedModule,
    [activeState, selectedModule],
  );

  function activate(module: Module) {
    setActiveState(module.id);
    setSelectedModule(module);
  }

  return (
    <section className="home-surface relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(71,216,255,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_34%),#020407]" />
      <div className="scanline-overlay" aria-hidden="true" />
      <div className="surface-grid" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:py-14">
        <div className="z-10 max-w-2xl">
          <h1 className="font-display text-[clamp(4.2rem,14vw,10rem)] font-semibold uppercase leading-[0.78] tracking-normal text-white">
            achu
          </h1>
          <p className="mt-7 max-w-xl text-2xl font-medium leading-tight text-white sm:text-3xl">
            i build{" "}
            {phraseState.map((phrase, index) => (
              <span key={phrase.text}>
                <button
                  className="hero-phrase"
                  type="button"
                  onMouseEnter={() => setActiveState(phrase.state)}
                  onFocus={() => setActiveState(phrase.state)}
                  onMouseLeave={() =>
                    setActiveState(selectedModule?.id ?? "default")
                  }
                  onBlur={() => setActiveState(selectedModule?.id ?? "default")}
                >
                  {phrase.text}
                </button>
                {index === 0 ? ", " : index === 1 ? ", and " : "."}
              </span>
            ))}
          </p>

          <nav
            className="mt-8 flex flex-wrap items-center gap-3"
            aria-label="Primary links"
          >
            <a
              className="interface-button interface-button-primary"
              href="/work"
            >
              Work
            </a>
            <a className="interface-button" href="/resume">
              Resume
            </a>
            <a
              className="interface-button"
              href={links.github}
              target="_blank"
              rel="noopener noreferrer me"
            >
              GitHub
            </a>
            <a
              className="interface-button"
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer me"
            >
              LinkedIn
            </a>
            <a
              className="interface-button interface-button-green"
              href={links.watchyourtemper}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setActiveState("watchyourtemper")}
              onFocus={() => setActiveState("watchyourtemper")}
              onMouseLeave={() =>
                setActiveState(selectedModule?.id ?? "default")
              }
              onBlur={() => setActiveState(selectedModule?.id ?? "default")}
            >
              watchyourtemper.com
            </a>
          </nav>

          <div className="mt-9 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {statusByState[activeState].map((line) => (
              <div className="glass-readout" key={line}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 min-h-[600px] lg:min-h-[720px]">
          <div className="core-stage">
            <AchuCore
              state={activeState}
              className="h-full min-h-[520px] lg:min-h-[680px]"
            />
            <div className="core-reticle" aria-hidden="true" />
            <div className="core-microtext core-microtext-top">
              LOCAL RUNTIME / INFERENCE CORE
            </div>
            <div className="core-microtext core-microtext-bottom">
              CONTEXT WINDOW / AGENT TRACE / MEMORY GRAPH
            </div>

            <div
              className="runtime-node-layer"
              aria-label="Interactive runtime modules"
            >
              {modules.map((module, index) => {
                const selected = selectedModule?.id === module.id;
                const active = activeState === module.id || selected;
                return (
                  <button
                    key={module.id}
                    className={`runtime-node ${module.nodeClass} ${active ? "is-active" : ""}`}
                    type="button"
                    aria-label={`${module.label}: ${module.detail}`}
                    aria-expanded={selected}
                    onClick={() => activate(module)}
                    onMouseEnter={() => setActiveState(module.id)}
                    onFocus={() => setActiveState(module.id)}
                    onMouseLeave={() =>
                      setActiveState(selectedModule?.id ?? "default")
                    }
                    onBlur={() =>
                      setActiveState(selectedModule?.id ?? "default")
                    }
                  >
                    <span className="runtime-node-index">0{index + 1}</span>
                    <span className="runtime-node-pip" />
                  </button>
                );
              })}
            </div>

            {selectedModule && (
              <div className={`runtime-panel panel-${selectedModule.id}`}>
                <div className="runtime-panel-header">
                  <span>{selectedModule.layer}</span>
                  <a
                    href={selectedModule.href}
                    target={
                      isExternal(selectedModule.href) ? "_blank" : undefined
                    }
                    rel={
                      isExternal(selectedModule.href)
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    open
                  </a>
                </div>
                <h2>{selectedModule.label}</h2>
                <p>{selectedModule.detail}</p>
                <div className="runtime-panel-footer">
                  <span>{selectedModule.title}</span>
                  <span>{selectedModule.metric}</span>
                </div>
              </div>
            )}

            <div className="core-label">
              <span>active layer</span>
              <strong>
                {activeModule ? activeModule.layer : "idle / composed"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
