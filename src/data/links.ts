/** Centralized external links used across the site. */
export const links = {
  github: "https://github.com/achuthanmukundan00",
  linkedin: "https://www.linkedin.com/in/achu-m",
  email: "achuthanmukundan00@gmail.com",
  skaft: "https://skaft.org",
  octet: "https://octet.skaft.org",
  octetDocs: "https://octet.skaft.org/octet/docs/",
  octetRepo: "https://github.com/skaft-software/octet",
} as const;

export type LinkKey = keyof typeof links;
