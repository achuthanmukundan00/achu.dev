import source from "../../../../scripts/generate-b70-qwen38-figures.mjs?raw";

export function GET() {
  return new Response(source, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
