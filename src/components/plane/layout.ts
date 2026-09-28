import type { Portfolio } from '@/content/types';

export type FrameKind = 'intro' | 'about' | 'project' | 'group' | 'stack' | 'contact';

export type Frame = {
  id: string;
  kind: FrameKind;
  x: number;
  /** Top edge. For bottom-anchored frames this is derived from `bottom - h`. */
  y: number;
  w: number;
  /** Current height: nominal until the page measures the real one. */
  h: number;
  /** Nominal height from the design; used for the printed coordinate label. */
  nh: number;
  /** Bottom-anchored frames grow upward, so longer content never runs into the frame below. */
  anchor: 'top' | 'bottom';
};

export type Bounds = { x0: number; y0: number; x1: number; y1: number };

/** A frame on the plane for work: one project, or a group of projects (e.g. an internship). */
export type WorkItem = { id: string; kind: 'project' | 'group' };

export const PROJECT_W = 420;
export const PROJECT_H = 600;

const frame = (f: Omit<Frame, 'nh'>): Frame => ({ ...f, nh: f.h });

const INTRO = frame({ id: 'intro', kind: 'intro', x: -300, y: -220, w: 600, h: 440, anchor: 'top' });
const ABOUT = frame({ id: 'about', kind: 'about', x: -280, y: -1120, w: 560, h: 560, anchor: 'bottom' });
const STACK = frame({ id: 'stack', kind: 'stack', x: -340, y: 440, w: 680, h: 400, anchor: 'top' });
/** Used when there are more than four skill groups: five columns, still clear of the project columns. */
const STACK_WIDE = frame({ id: 'stack', kind: 'stack', x: -450, y: 440, w: 900, h: 400, anchor: 'top' });
const CONTACT = frame({ id: 'contact', kind: 'contact', x: -300, y: 1080, w: 600, h: 400, anchor: 'top' });

/** Vertical gaps that chain intro → stack → contact (the design's own spacing). */
const GAP_INTRO_STACK = STACK.y - (INTRO.y + INTRO.h); // 220
const GAP_STACK_CONTACT = CONTACT.y - (STACK.y + STACK.h); // 240

export const RESERVED_IDS = new Set([INTRO.id, ABOUT.id, STACK.id, CONTACT.id]);

export const stackColumns = (groups: number) => (groups > 4 ? 5 : 4);

const COLUMN_GAP = 620; // horizontal pitch between project columns
const INNER_X = 560; // left edge of the first project column on the right side

/**
 * Project slots on one (right) side of the plane, in fill order. Even columns
 * hold two frames (top and bottom), odd columns one (middle), so the frames
 * form a staggered ring around the intro. The first three reproduce the
 * original Plane layout exactly; further slots extend outward for longer lists.
 */
function sideSlot(i: number): { x: number; y: number } {
  if (i === 0) return { x: INNER_X, y: -800 };
  if (i === 1) return { x: INNER_X, y: 420 };
  if (i === 2) return { x: INNER_X + COLUMN_GAP, y: -200 };
  const rest = i - 3;
  const block = Math.floor(rest / 3);
  const col = 2 + block * 2;
  const k = rest % 3;
  if (k === 2) return { x: INNER_X + (col + 1) * COLUMN_GAP, y: -200 };
  return { x: INNER_X + col * COLUMN_GAP, y: k === 0 ? -800 : 420 };
}

function sideSlots(count: number) {
  return Array.from({ length: count }, (_, i) => sideSlot(i)).sort((a, b) => a.y - b.y || a.x - b.x);
}

/**
 * The work frames, in data order: each project gets its own frame unless it
 * belongs to a group, in which case the group's frame appears where its
 * first project would have been.
 */
export function workItems(data: Pick<Portfolio, 'projects' | 'groups'>): WorkItem[] {
  const groups = new Set((data.groups ?? []).map((g) => g.id));
  const out: WorkItem[] = [];
  const seen = new Set<string>();
  for (const p of data.projects) {
    if (p.group && groups.has(p.group)) {
      if (!seen.has(p.group)) {
        seen.add(p.group);
        out.push({ id: p.group, kind: 'group' });
      }
    } else {
      out.push({ id: p.id, kind: 'project' });
    }
  }
  return out;
}

/** Maps every project id to the id of the frame that shows it. */
export function frameOfProject(data: Pick<Portfolio, 'projects' | 'groups'>) {
  const groups = new Set((data.groups ?? []).map((g) => g.id));
  return new Map(data.projects.map((p) => [p.id, p.group && groups.has(p.group) ? p.group : p.id]));
}

export type PlaneLayout = {
  /** Frames in tour order: intro, about, right-side work, stack, contact, left-side work. */
  frames: Frame[];
  /** Frames in reading order (DOM order): intro, about, work in data order, stack, contact. */
  reading: Frame[];
};

/**
 * Lays out the plane for any amount of work. The first half of the work
 * frames go clockwise down the right side, the rest continue up the left,
 * so the → key tours the whole ring.
 */
export function computeLayout(data: Pick<Portfolio, 'projects' | 'groups'> & { skills?: unknown[] }): PlaneLayout {
  const work = workItems(data);
  const n = work.length;
  const rightCount = Math.ceil(n / 2);
  const right = sideSlots(rightCount);
  const left = sideSlots(n - rightCount).map((s) => ({ x: -s.x - PROJECT_W, y: s.y }));

  const place = (i: number, slot: { x: number; y: number }): Frame =>
    frame({ id: work[i].id, kind: work[i].kind, x: slot.x, y: slot.y, w: PROJECT_W, h: PROJECT_H, anchor: 'top' });

  const rightFrames = right.map((slot, i) => place(i, slot));
  const leftFrames = left.map((slot, i) => place(rightCount + i, slot));
  const stack = (data.skills?.length ?? 0) > 4 ? STACK_WIDE : STACK;

  const frames = [INTRO, ABOUT, ...rightFrames, stack, CONTACT, ...[...leftFrames].reverse()];
  const reading = [INTRO, ABOUT, ...rightFrames, ...leftFrames, stack, CONTACT];
  return { frames: frames.map((f) => ({ ...f })), reading: reading.map((f) => ({ ...f })) };
}

/**
 * Applies measured heights. Bottom-anchored frames stay pinned at their
 * bottom edge; stack and contact re-chain below the intro so longer content
 * pushes them down instead of overlapping.
 */
export function withHeights(frames: Frame[], heights: Record<string, number>): Frame[] {
  const out = frames.map((f) => {
    const h = heights[f.id];
    if (!h || h === f.h) return { ...f };
    return f.anchor === 'bottom' ? { ...f, y: f.y + f.h - h, h } : { ...f, h };
  });
  const intro = out.find((f) => f.kind === 'intro');
  const stack = out.find((f) => f.kind === 'stack');
  const contact = out.find((f) => f.kind === 'contact');
  if (intro && stack) stack.y = intro.y + intro.h + GAP_INTRO_STACK;
  if (stack && contact) contact.y = stack.y + stack.h + GAP_STACK_CONTACT;
  return out;
}

export function boundsOf(frames: Frame[], pad = 60): Bounds {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const f of frames) {
    x0 = Math.min(x0, f.x);
    y0 = Math.min(y0, f.y);
    x1 = Math.max(x1, f.x + f.w);
    y1 = Math.max(y1, f.y + f.h);
  }
  return { x0: x0 - pad, y0: y0 - pad, x1: x1 + pad, y1: y1 + pad };
}

export function centerOf(f: Frame) {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

/** "0, −840": the frame's centre at its nominal size, printed above it like a canvas coordinate. */
export function coordLabel(f: Frame) {
  const top = f.anchor === 'bottom' ? f.y + f.h - f.nh : f.y;
  const fmt = (v: number) => {
    const r = Math.round(v);
    return r < 0 ? `−${-r}` : String(r);
  };
  return `${fmt(f.x + f.w / 2)}, ${fmt(top + f.nh / 2)}`;
}

/** Returns pairs of frame ids whose rectangles overlap — used to warn in development. */
export function overlaps(frames: Frame[]): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 0; i < frames.length; i++)
    for (let j = i + 1; j < frames.length; j++) {
      const a = frames[i],
        b = frames[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) out.push([a.id, b.id]);
    }
  return out;
}
