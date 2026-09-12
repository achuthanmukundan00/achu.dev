/** Centralized external links used across the site. */
export const links = {
  github: "https://github.com/achuthanmukundan00",
  linkedin: "https://www.linkedin.com/in/achu-m",
  email: "achuthanmukundan00@gmail.com",
  skaft: "https://skaft.org",
  watchyourtemper: "https://watchyourtemper.com",

  octet: "https://octet.skaft.org",
  octetDocs: "https://octet.skaft.org/octet/docs/",
  octetRepo: "https://github.com/skaft-software/octet",
  resampleLab: "https://rlab.watchyourtemper.com",
  resampleLabRepo: "https://github.com/achuthanmukundan00/Resample-Lab",
  temperPlayerRepo: "https://github.com/achuthanmukundan00/temper-player",
  leetcodeWizardRepo: "https://github.com/achuthanmukundan00/lc-prep-wizard",
  promptTemplatesRepo:
    "https://github.com/achuthanmukundan00/SWE-prompt-templates",
  watchyourtemperRepo: "https://github.com/achuthanmukundan00/wyt-SPA",
  packageNameGenRepo:
    "https://github.com/achuthanmukundan00/package-name-gen",
} as const;

export type LinkKey = keyof typeof links;
