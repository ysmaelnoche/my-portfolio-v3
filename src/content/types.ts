export type ProjectFact = {
  label: string;
  value: string;
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  /** URL-safe slug. Used for deep links (/#halcyon) and commands (`open halcyon`). */
  id: string;
  name: string;
  year: string;
  /** One-line description of what it is, e.g. "GPU charting library". */
  kind: string;
  role: string;
  status: string;
  /** Tools used. Names should match entries in `skills` so `grep` can find them. */
  stack: string[];
  description: string;
  facts: ProjectFact[];
  /** Optional screenshot in /public, e.g. { src: '/work/halcyon.png', alt: '…' }. 4:3 works best. */
  image?: { src: string; alt: string };
  /** Optional outbound links shown on the card, e.g. live site and source. */
  links?: ProjectLink[];
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export type TimelineEntry = {
  years: string;
  role: string;
  org: string;
};

export type ProfileLink = {
  label: string;
  handle: string;
  href: string;
};

export type Portfolio = {
  name: string;
  /** Short handle used in the terminal-style paths, e.g. "ysmael" → ~/ysmael. */
  handle: string;
  role: string;
  location: string;
  email: string;
  /** Hero sentence on the intro frame; also the default SEO description. */
  intro: string;
  bio: string[];
  /** Small line above "Say hello." on the contact frame. */
  availability: string;
  projects: Project[];
  skills: SkillGroup[];
  timeline: TimelineEntry[];
  links: ProfileLink[];
  /** Optional: which examples the intro and command bar suggest. Defaults are picked from the data. */
  hints?: { open?: string; grep?: string };
};
