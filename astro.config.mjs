import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://achu.dev",
  integrations: [
    tailwind(),
    react(),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
  vite: {
    ssr: {
      noExternal: ["@react-three/fiber", "@react-three/drei", "three", "detect-gpu", "suspend-react"],
    },
    resolve: {
      alias: {
        // Force ESM builds for CJS packages that don't expose named exports properly
        "detect-gpu": path.resolve(__dirname, "node_modules/detect-gpu/dist/detect-gpu.esm.js"),
        "suspend-react": path.resolve(__dirname, "node_modules/suspend-react/index.js"),
      },
    },
  },
});
