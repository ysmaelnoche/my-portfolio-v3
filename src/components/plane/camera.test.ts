import { describe, expect, it } from 'vitest';
import {
  cameraForBounds,
  cameraForFrame,
  flightAt,
  screenToWorld,
  zoomAround,
  MAX_ZOOM,
  MIN_ZOOM,
  NARROW_MIN_FRAME_ZOOM,
} from './camera';

const vp = { W: 1440, H: 900 };

describe('camera', () => {
  it('keeps the point under the cursor fixed while zooming', () => {
    const cam = { x: 100, y: -50, z: 0.8 };
    const before = screenToWorld(cam, vp, 300, 200);
    const after = screenToWorld(zoomAround(cam, vp, 300, 200, 1.7), vp, 300, 200);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('clamps zoom', () => {
    expect(zoomAround({ x: 0, y: 0, z: 1 }, vp, 0, 0, 100).z).toBe(MAX_ZOOM);
    expect(zoomAround({ x: 0, y: 0, z: 1 }, vp, 0, 0, 0.001).z).toBe(MIN_ZOOM);
  });

  it('frames a frame at no more than 115%', () => {
    const c = cameraForFrame({ id: 'a', kind: 'intro', x: -300, y: -220, w: 600, h: 440, nh: 440, anchor: 'top' }, vp, false);
    expect(c.z).toBe(1.15);
    expect(c.x).toBe(0);
  });

  it('keeps wide frames readable on phones by aligning their top-left corner', () => {
    const phone = { W: 390, H: 844 };
    const stack = { id: 's', kind: 'stack' as const, x: -450, y: 440, w: 900, h: 700, nh: 400, anchor: 'top' as const };
    const c = cameraForFrame(stack, phone, true);
    expect(c.z).toBe(NARROW_MIN_FRAME_ZOOM);
    // the frame's top-left lands 12px from the left, 60px from the top
    expect(phone.W / 2 + (stack.x - c.x) * c.z).toBeCloseTo(12);
    expect(phone.H / 2 + (stack.y - c.y) * c.z).toBeCloseTo(60);
  });

  it('fits bounds inside the viewport', () => {
    const c = cameraForBounds({ x0: -1660, y0: -1180, x1: 1660, y1: 1560 }, vp);
    expect(3320 * c.z).toBeLessThanOrEqual(vp.W);
    expect(2740 * c.z).toBeLessThanOrEqual(vp.H - 120);
  });

  it('lands exactly on the target, dipping zoom mid-flight on long hops', () => {
    const f = { from: { x: 0, y: 0, z: 1 }, to: { x: 3000, y: 0, z: 1 }, t0: 0, dur: 1000 };
    expect(flightAt(f, 1000)).toEqual({ cam: { x: 3000, y: 0, z: 1 }, done: true });
    expect(flightAt(f, 500).cam.z).toBeLessThan(1);
    expect(flightAt({ ...f, dur: 0 }, 0).done).toBe(true);
  });
});
