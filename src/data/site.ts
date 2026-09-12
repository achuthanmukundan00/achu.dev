/** Site-wide metadata for achumukundan.dev. */
export const site = {
  name: "Achu Mukundan | Software Engineer",
  fullName: "Achu Mukundan",
  supportingLine:
    "Software engineer in Toronto building developer tools, local AI software, and audio tools.",
  location: "Toronto, Canada",
  url: "https://achumukundan.dev",
  locale: "en_CA",
  ogImage: "/og.png",
} as const;

export const seo = {
  home: {
    description:
      "Achu Mukundan is a software engineer in Toronto building developer tools, local AI software, and audio tools.",
  },
  work: {
    description:
      "Projects by Achu Mukundan, including a Rust coding agent, browser audio tools, and web applications.",
  },
  notes: {
    description:
      "Notes by Achu Mukundan on local inference, developer tools, coding agents, and audio software.",
  },
  resume: {
    description:
      "Resume for Achu Mukundan, a Toronto software engineer with experience in conversational AI and developer tools.",
  },
  contact: {
    description:
      "Contact Achu Mukundan about software engineering roles, developer tools, AI, and audio software.",
  },
} as const;
