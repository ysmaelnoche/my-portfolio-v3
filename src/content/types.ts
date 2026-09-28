/** Use exactly these so status reads the same everywhere. */
export type ProjectStatus = 'Implemented' | 'Ongoing' | 'In development' | 'Planned' | 'Conceptual';

export type ProjectFact = {
  label: string;
  /** Keep short (it's shown large). Only confirmed facts — no invented numbers. */
  value: string;
};

export type ProjectLink = {
  label: string;
  href: string;
};

/** Drawn in the card's picture area and at the top of the case study. */
export type ProjectVisual =
  | {
      type: 'flow';
      steps: string[];
      /** Steps that don't exist yet; drawn dashed and marked "planned". */
      planned?: string[];
    }
  | {
      type: 'quadrant';
      /** Axis names, e.g. x: 'Cost', y: 'Productivity'. */
      x: string;
      y: string;
    };

export type CaseSection = {
  title: string;
  body?: string[];
  items?: string[];
  /** Rendered as a step-by-step flow, e.g. Lead received → Assigned → … */
  flow?: string[];
};

export type Project = {
  /** URL-safe slug: /work/<id>, /#<id>, `open <id>`. */
  id: string;
  name: string;
  status: ProjectStatus;
  /** Optional qualifier shown after the status, e.g. "continuing development". */
  statusNote?: string;
  year?: string;
  /** Where it was built, e.g. "Data & AI · TVS Philippines" or "Personal project". */
  context: string;
  /** Area, e.g. "Data Engineering / Business Intelligence". */
  kind: string;
  role?: string;
  /** One or two sentences for the card. */
  summary: string;
  /** Tools used. Names should match entries in `skills` so `grep` can find them. */
  stack: string[];
  facts: ProjectFact[];
  visual?: ProjectVisual;
  /** Case study body: Problem, Solution, Outcome, Future direction… */
  sections: CaseSection[];
  /** When set, the project is listed inside that group's frame instead of getting its own. */
  group?: string;
  /** Optional screenshot in /public, e.g. { src: '/work/orbit.png', alt: '…' }. 4:3 works best. */
  image?: { src: string; alt: string };
  links?: ProjectLink[];
};

/** A frame that lists several smaller projects, e.g. an internship. */
export type ProjectGroup = {
  id: string;
  title: string;
  role: string;
  org: string;
  period: string;
  summary: string;
  facts: ProjectFact[];
  stack: string[];
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export type TimelineEntry = {
  years: string;
  role: string;
  org: string;
  note?: string;
};

export type ProfileLink = {
  label: string;
  handle: string;
  href: string;
};

export type Portfolio = {
  /** Display name. */
  name: string;
  /** Legal/full name, used in structured data for search engines. */
  fullName?: string;
  /** Short handle used in the terminal-style paths, e.g. "ysmael" → ~/ysmael. */
  handle: string;
  role: string;
  /** Alma mater, used in structured data for search engines. */
  school?: string;
  location: string;
  /** Leave empty to hide the email row until you're ready to publish one. */
  email?: string;
  /** Optional phone in international format, e.g. '+63 969 049 3331'. Shown as a tap-to-call link. */
  phone?: string;
  /**
   * Optional portrait on the about frame: a 1-bit dither (light dots on transparent, square;
   * `ink` is the same dither as dark dots for the light theme)
   * that scans in, and a grayscale photo revealed by a lens on hover or touch.
   */
  portrait?: { dither: string; ink: string; photo: string; alt: string };
  /** Hero sentence on the intro frame; also the default SEO description. */
  intro: string;
  bio: string[];
  /** How you work, drawn as a flow on the about frame. */
  approach?: string[];
  /** Small line above "Say hello." on the contact frame. */
  availability: string;
  projects: Project[];
  groups?: ProjectGroup[];
  skills: SkillGroup[];
  timeline: TimelineEntry[];
  links: ProfileLink[];
  /** Optional: which examples the intro and command bar suggest. Defaults are picked from the data. */
  hints?: { open?: string; grep?: string };
};
