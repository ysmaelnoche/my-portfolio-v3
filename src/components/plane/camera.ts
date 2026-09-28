import type { Bounds, Frame } from './layout';

export type Camera = { x: number; y: number; z: number };
export type Viewport = { W: number; H: number };

export const MIN_ZOOM = 0.12;
export const MAX_ZOOM = 2.5;
const MAX_FRAME_ZOOM = 1.15;

export const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));

export const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/** World → screen translation for a camera centred on (x, y) at zoom z. */
export function worldTransform(cam: Camera, vp: Viewport) {
  return { tx: vp.W / 2 - cam.x * cam.z, ty: vp.H / 2 - cam.y * cam.z };
}

export function screenToWorld(cam: Camera, vp: Viewport, sx: number, sy: number) {
  return { x: cam.x + (sx - vp.W / 2) / cam.z, y: cam.y + (sy - vp.H / 2) / cam.z };
}

/**
 * Camera that frames one frame, leaving room for the side panels on wide
 * screens and the command bar below.
 */
export function cameraForFrame(f: Frame, vp: Viewport, narrow: boolean): Camera {
  const side = narrow ? 0 : 240;
  const bottom = narrow ? 150 : 180;
  const z = Math.min(MAX_FRAME_ZOOM, ((vp.W - side * 2) * 0.86) / f.w, ((vp.H - bottom) * 0.88) / f.h);
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 + 10 / z, z };
}

export function cameraForBounds(b: Bounds, vp: Viewport): Camera {
  const bw = b.x1 - b.x0,
    bh = b.y1 - b.y0;
  return { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, z: Math.min(vp.W / bw, (vp.H - 120) / bh) * 0.9 };
}

/** Zoom by factor f while keeping the world point under (sx, sy) fixed on screen. */
export function zoomAround(cam: Camera, vp: Viewport, sx: number, sy: number, f: number): Camera {
  const w = screenToWorld(cam, vp, sx, sy);
  const z = clampZoom(cam.z * f);
  return { x: w.x - (sx - vp.W / 2) / z, y: w.y - (sy - vp.H / 2) / z, z };
}

export type Flight = { from: Camera; to: Camera; t0: number; dur: number };

/**
 * Camera position at time `now` along a flight. Long flights pull the zoom out
 * mid-way (up to 45%) so you can see where you're going.
 */
export function flightAt(a: Flight, now: number): { cam: Camera; done: boolean } {
  const k = a.dur <= 0 ? 1 : Math.min(1, (now - a.t0) / a.dur);
  const e = easeInOutCubic(k);
  const dip = Math.min(0.45, Math.hypot(a.to.x - a.from.x, a.to.y - a.from.y) / 4200);
  return {
    cam: {
      x: a.from.x + (a.to.x - a.from.x) * e,
      y: a.from.y + (a.to.y - a.from.y) * e,
      z: (a.from.z + (a.to.z - a.from.z) * e) * (1 - dip * Math.sin(Math.PI * k)),
    },
    done: k >= 1,
  };
}
