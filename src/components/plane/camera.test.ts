import { describe, expect, it } from 'vitest';
import { cameraForBounds, cameraForFrame, flightAt, screenToWorld, zoomAround, MAX_ZOOM, MIN_ZOOM } from './camera';

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
    const c = cameraForFrame({ id: 'a', kind: 'intro', x: -300, y: -220, w: 600, h: 440, anchor: 'top' }, vp, false);
    expect(c.z).toBe(1.15);
    expect(c.x).toBe(0);
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
