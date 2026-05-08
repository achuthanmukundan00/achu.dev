/**
 * Centralized links — single source of truth for all external URLs.
 * Import this file wherever links are rendered.
 */

export const links = {
  github: "https://github.com/achuthanmukundan00",
  linkedin: "https://www.linkedin.com/in/achu-m",
  email: "achuthanmukundan00@gmail.com",
  watchyourtemper: "https://watchyourtemper.com",
  resumePdf: "#", // TODO Phase 2: real PDF download

  // Project-specific links
  relayRepo: "https://achuthanmukundan00.github.io/relay",
  relayDocs: "#",
  relayLive: "#",
  synaxRepo: "https://synax.pages.dev",
  synaxDocs: "#",
  synaxLive: "#",
  wytosRepo: "https://github.com/achuthanmukundan00/wytOS",
  temperCloudRepo: "https://github.com/achuthanmukundan00/temper-cloud",
  watchyourtemperRepo: "https://github.com/achuthanmukundan00/watchyourtemper",
  packageNameGenRepo: "https://github.com/achuthanmukundan00/package-name-gen",
  autoCareerRepo: "https://github.com/achuthanmukundan00/AutoCareer",
  resampleLabRepo: "https://github.com/achuthanmukundan00/Resample-Lab",
} as const;

export type LinkKey = keyof typeof links;
