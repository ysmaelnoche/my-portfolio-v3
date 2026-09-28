import type { Portfolio } from '@/content/types';

export type FrameKind = 'intro' | 'about' | 'project' | 'stack' | 'contact';

export type Frame = {
  id: string;
  kind: FrameKind;
  x: number;
  /** Top edge. For bottom-anchored frames this is derived from `bottom - h`. */
  y: number;
  w: number;
  /** Nominal height, replaced by the measured height once the page is on screen. */
  h: number;
  /** Bottom-anchored frames grow upward, so longer content never runs into the frame below. */
  anchor: 'top' | 'bottom';
};

export type Bounds = { x0: number; y0: number; x1: number; y1: number };

export const PROJECT_W = 420;
export const PROJECT_H = 600;

const INTRO: Frame = { id: 'intro', kind: 'intro', x: -300, y: -220, w: 600, h: 440, anchor: 'top' };
const ABOUT: Frame = { id: 'about', kind: 'about', x: -280, y: -1120, w: 560, h: 560, anchor: 'bottom' };
const STACK: Frame = { id: 'stack', kind: 'stack', x: -340, y: 440, w: 680, h: 400, anchor: 'top' };
const CONTACT: Frame = { id: 'contact', kind: 'contact', x: -300, y: 1080, w: 600, h: 400, anchor: 'top' };

export const RESERVED_IDS = new Set([INTRO.id, ABOUT.id, STACK.id, CONTACT.id]);

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

export type PlaneLayout = {
  /** Frames in tour order: intro, about, right-side projects, stack, contact, left-side projects. */
  frames: Frame[];
  /** Frames in reading order (DOM order): intro, about, projects in data order, stack, contact. */
  reading: Frame[];
};

/**
 * Lays out the plane for any number of projects. The first half of the
 * projects go clockwise down the right side, the rest continue up the left,
 * so the → key tours the whole ring.
 */
export function computeLayout(data: Pick<Portfolio, 'projects'>): PlaneLayout {
  const n = data.projects.length;
  const rightCount = Math.ceil(n / 2);
  const right = sideSlots(rightCount);
  const left = sideSlots(n - rightCount).map((s) => ({ x: -s.x - PROJECT_W, y: s.y }));

  const project = (i: number, slot: { x: number; y: number }): Frame => ({
    id: data.projects[i].id,
    kind: 'project',
    x: slot.x,
    y: slot.y,
    w: PROJECT_W,
    h: PROJECT_H,
    anchor: 'top',
  });

  const rightFrames = right.map((slot, i) => project(i, slot));
  const leftFrames = left.map((slot, i) => project(rightCount + i, slot));

  const frames = [INTRO, ABOUT, ...rightFrames, STACK, CONTACT, ...[...leftFrames].reverse()];
  const reading = [INTRO, ABOUT, ...rightFrames, ...leftFrames, STACK, CONTACT];
  return { frames: frames.map((f) => ({ ...f })), reading: reading.map((f) => ({ ...f })) };
}

/** Where the frame's bottom edge sits for bottom-anchored frames (fixed, independent of content). */
export function anchorBottom(f: Frame) {
  return f.y + f.h;
}

/** Applies measured heights, keeping bottom-anchored frames pinned at their bottom edge. */
export function withHeights(frames: Frame[], heights: Record<string, number>): Frame[] {
  return frames.map((f) => {
    const h = heights[f.id];
    if (!h || h === f.h) return f;
    return f.anchor === 'bottom' ? { ...f, y: anchorBottom(f) - h, h } : { ...f, h };
  });
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

/** "0, −840": the frame's nominal centre, printed above it like a canvas coordinate. */
export function coordLabel(f: Frame) {
  const c = centerOf(f);
  const fmt = (v: number) => {
    const r = Math.round(v);
    return r < 0 ? `−${-r}` : String(r);
  };
  return `${fmt(c.x)}, ${fmt(c.y)}`;
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
