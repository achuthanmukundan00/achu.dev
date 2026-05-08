import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

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
      noExternal: ["@react-three/fiber", "@react-three/drei", "three"],
    },
  },
});
