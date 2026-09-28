'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { clampZoom, flightAt, worldTransform, zoomAround, type Camera, type Flight, type Viewport } from './camera';
import type { Bounds } from './layout';

export const MINIMAP = { w: 180, h: 160, pad: 8 };

export function minimapScale(b: Bounds) {
  return Math.min(MINIMAP.w / (b.x1 - b.x0), MINIMAP.h / (b.y1 - b.y0));
}

export type CameraRefs = {
  viewport: RefObject<HTMLDivElement | null>;
  world: RefObject<HTMLElement | null>;
  grid: RefObject<HTMLDivElement | null>;
  zoomLabel: RefObject<HTMLSpanElement | null>;
  coordLabel: RefObject<HTMLSpanElement | null>;
  miniView: RefObject<HTMLDivElement | null>;
};

type Options = {
  bounds: Bounds;
  /** When false (reading view) the camera stops handling input and the page scrolls natively. */
  enabled: boolean;
  /** Called for a tap/click that wasn't a drag, with the element that was pressed. */
  onTap: (target: Element) => void;
};

type GestureEvent = UIEvent & { scale: number; clientX: number; clientY: number };

const INTERACTIVE = 'a, button, input, textarea, select, summary, label, [contenteditable], [data-ui]';

export type CameraApi = {
  get: () => Camera;
  viewport: () => Viewport;
  /** Animate to a camera. `dur` 0 jumps. */
  flyTo: (to: Camera, dur: number) => void;
  zoomBy: (f: number, dur?: number) => void;
  /** Redraw without changing the camera (e.g. after the minimap's bounds change). */
  redraw: () => void;
};

/**
 * Pan/zoom camera for the plane. Writes transforms straight to the DOM (no
 * React renders while moving) and only schedules animation frames while
 * something is actually changing.
 */
export function useCamera(opts: Options): { api: RefObject<CameraApi>; refs: CameraRefs } {
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const zoomLabel = useRef<HTMLSpanElement>(null);
  const coordLabel = useRef<HTMLSpanElement>(null);
  const miniView = useRef<HTMLDivElement>(null);
  const refs: CameraRefs = { viewport, world, grid, zoomLabel, coordLabel, miniView };

  const live = useRef(opts);
  useEffect(() => {
    live.current = opts;
  });

  const state = useRef({
    cam: { x: 0, y: 150, z: 0.3 } as Camera,
    flight: null as Flight | null,
    raf: 0,
    vp: { W: 0, H: 0 } as Viewport,
    mouse: { x: 0, y: 0 },
  });

  const api = useRef<CameraApi>(null as unknown as CameraApi);

  // Layout effect so the first camera position is applied before the first paint.
  useLayoutEffect(() => {
    const s = state.current;
    const vpEl = viewport.current;
    if (!vpEl) return;

    const apply = () => {
      const { cam, vp } = s;
      const { tx, ty } = worldTransform(cam, vp);
      const worldEl = world.current;
      if (worldEl) worldEl.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${cam.z})`;
      const gridEl = grid.current;
      if (gridEl) {
        const g = 24 * cam.z;
        gridEl.style.backgroundSize = `${g}px ${g}px`;
        gridEl.style.backgroundPosition = `${tx}px ${ty}px`;
        gridEl.style.opacity = String(Math.min(1, cam.z * 1.6));
      }
      if (zoomLabel.current) zoomLabel.current.textContent = `${Math.round(cam.z * 100)}%`;
      if (coordLabel.current) {
        const wx = Math.round(cam.x + (s.mouse.x - vp.W / 2) / cam.z);
        const wy = Math.round(cam.y + (s.mouse.y - vp.H / 2) / cam.z);
        coordLabel.current.textContent = `x ${wx} · y ${wy}`;
      }
      const mv = miniView.current;
      if (mv) {
        const b = live.current.bounds;
        const ms = minimapScale(b);
        const w = vp.W / cam.z,
          h = vp.H / cam.z;
        mv.style.transform = `translate(${(cam.x - w / 2 - b.x0) * ms}px,${(cam.y - h / 2 - b.y0) * ms}px)`;
        mv.style.width = `${w * ms}px`;
        mv.style.height = `${h * ms}px`;
      }
    };

    const frame = (now: number) => {
      s.raf = 0;
      if (s.flight) {
        const r = flightAt(s.flight, now);
        s.cam = r.cam;
        if (r.done) s.flight = null;
      }
      apply();
      if (s.flight) schedule();
    };
    const schedule = () => {
      if (!s.raf) s.raf = requestAnimationFrame(frame);
    };

    api.current = {
      get: () => ({ ...s.cam }),
      viewport: () => ({ ...s.vp }),
      flyTo: (to, dur) => {
        if (dur <= 0) {
          s.flight = null;
          s.cam = { ...to };
          apply();
        } else {
          s.flight = { from: { ...s.cam }, to, t0: performance.now(), dur };
          schedule();
        }
      },
      zoomBy: (f, dur = 250) => {
        const to = { ...s.cam, z: clampZoom(s.cam.z * f) };
        api.current.flyTo(to, dur);
      },
      redraw: schedule,
    };

    const measure = () => {
      s.vp = { W: vpEl.clientWidth, H: vpEl.clientHeight };
      schedule();
    };
    s.vp = { W: vpEl.clientWidth, H: vpEl.clientHeight };
    apply();
    // The app is alive: cancel the no-JS fallback (see the boot script in layout.tsx).
    document.documentElement.setAttribute('data-plane-ready', '');
    document.documentElement.classList.remove('no-js');
    const ro = new ResizeObserver(measure);
    ro.observe(vpEl);

    // Focus moving into an off-screen frame makes the browser scroll this
    // overflow:hidden box, which would desync the camera. Undo it.
    const onScroll = () => {
      if (!live.current.enabled) return;
      if (vpEl.scrollTop || vpEl.scrollLeft) {
        vpEl.scrollTop = 0;
        vpEl.scrollLeft = 0;
      }
    };
    vpEl.addEventListener('scroll', onScroll);

    // ---- pointer: drag to pan, two fingers to pinch, tap to select ----
    const pointers = new Map<number, { x: number; y: number }>();
    type Drag = { x: number; y: number; cx: number; cy: number; moved: boolean; target: Element; interactive: boolean };
    let drag: Drag | null = null;
    let pinch: { d: number; mx: number; my: number } | null = null;
    // A touch drag that started on a link/button pans instead; the click it would fire is swallowed.
    let suppressClick = false;
    let suppressTimer: ReturnType<typeof setTimeout> | undefined;
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    const onDown = (e: PointerEvent) => {
      if (!live.current.enabled) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = e.target as Element;
      const interactive = !!target.closest(INTERACTIVE);
      // Mouse on a control: leave it to the browser (text selection, clicks).
      if (interactive && e.pointerType === 'mouse') return;
      const ae = document.activeElement;
      if (ae instanceof HTMLInputElement) ae.blur();
      s.flight = null;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        drag = { x: e.clientX, y: e.clientY, cx: s.cam.x, cy: s.cam.y, moved: false, target, interactive };
      } else if (drag) {
        drag.moved = true;
        pinch = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      s.mouse = { x: e.clientX, y: e.clientY };
      if (!pointers.has(e.pointerId)) {
        if (live.current.enabled && coordLabel.current) schedule();
        return;
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mx = (a.x + b.x) / 2,
          my = (a.y + b.y) / 2;
        if (pinch) {
          const c = zoomAround(s.cam, s.vp, mx, my, d / pinch.d);
          s.cam = { x: c.x - (mx - pinch.mx) / c.z, y: c.y - (my - pinch.my) / c.z, z: c.z };
        }
        pinch = { d, mx, my };
      } else if (drag) {
        const dx = e.clientX - drag.x,
          dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 4) {
          drag.moved = true;
          vpEl.dataset.dragging = '';
        }
        if (drag.moved) s.cam = { ...s.cam, x: drag.cx - dx / s.cam.z, y: drag.cy - dy / s.cam.z };
      }
      schedule();
    };

    const onUp = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      pinch = null;
      if (pointers.size === 0) {
        if (drag && !drag.moved && !drag.interactive && e.type === 'pointerup') live.current.onTap(drag.target);
        if (drag?.moved && drag.interactive) {
          suppressClick = true;
          clearTimeout(suppressTimer);
          suppressTimer = setTimeout(() => (suppressClick = false), 400);
        }
        drag = null;
        delete vpEl.dataset.dragging;
      } else if (pointers.size === 1) {
        // One finger lifted mid-pinch: keep panning with the other.
        const [p] = [...pointers.values()];
        drag = { x: p.x, y: p.y, cx: s.cam.x, cy: s.cam.y, moved: true, target: vpEl, interactive: false };
      }
    };

    // ---- wheel: scroll to pan, ctrl/⌘ + wheel (and trackpad pinch) to zoom ----
    const onWheel = (e: WheelEvent) => {
      if (!live.current.enabled) return;
      e.preventDefault();
      s.flight = null;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? s.vp.H : 1;
      const dx = e.deltaX * unit,
        dy = e.deltaY * unit;
      if (e.ctrlKey || e.metaKey) s.cam = zoomAround(s.cam, s.vp, e.clientX, e.clientY, Math.exp(-dy * 0.01));
      else if (e.shiftKey && !dx) s.cam = { ...s.cam, x: s.cam.x + dy / s.cam.z };
      else s.cam = { ...s.cam, x: s.cam.x + dx / s.cam.z, y: s.cam.y + dy / s.cam.z };
      schedule();
    };

    // ---- Safari trackpad pinch ----
    let gestureZ = 1;
    const onGestureStart = (e: Event) => {
      if (!live.current.enabled) return;
      e.preventDefault();
      s.flight = null;
      gestureZ = s.cam.z;
    };
    const onGestureChange = (e: Event) => {
      if (!live.current.enabled) return;
      e.preventDefault();
      const g = e as GestureEvent;
      s.cam = zoomAround(s.cam, s.vp, g.clientX, g.clientY, (gestureZ * g.scale) / s.cam.z);
      schedule();
    };

    vpEl.addEventListener('pointerdown', onDown);
    vpEl.addEventListener('click', onClickCapture, true);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    vpEl.addEventListener('wheel', onWheel, { passive: false });
    vpEl.addEventListener('gesturestart', onGestureStart);
    vpEl.addEventListener('gesturechange', onGestureChange);

    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      ro.disconnect();
      vpEl.removeEventListener('scroll', onScroll);
      vpEl.removeEventListener('pointerdown', onDown);
      vpEl.removeEventListener('click', onClickCapture, true);
      clearTimeout(suppressTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      vpEl.removeEventListener('wheel', onWheel);
      vpEl.removeEventListener('gesturestart', onGestureStart);
      vpEl.removeEventListener('gesturechange', onGestureChange);
    };
  }, []);

  // Bounds changed (frames measured) → the minimap rectangle needs redrawing.
  useEffect(() => {
    api.current?.redraw();
  }, [opts.bounds]);

  // Back from the reading view: the viewport may still be scrolled.
  useEffect(() => {
    const vpEl = viewport.current;
    if (opts.enabled && vpEl) {
      vpEl.scrollTop = 0;
      vpEl.scrollLeft = 0;
      api.current?.redraw();
    }
  }, [opts.enabled]);

  return { api, refs };
}
