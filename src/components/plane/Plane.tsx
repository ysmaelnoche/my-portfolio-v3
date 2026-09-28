'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Portfolio } from '@/content/types';
import { site } from '@/content/site';
import { cameraForBounds, cameraForFrame } from './camera';
import { BootLog, CommandBar, HelpDialog, LayersPanel, Minimap, TopBar } from './Chrome';
import { commandHints, parseCommand, projectsUsing, resolveEnter, suggestions, type Action } from './commands';
import { AboutFrame, ContactFrame, GroupFrame, IntroFrame, ProjectFrame, StackFrame, type FrameState } from './Frames';
import { boundsOf, centerOf, computeLayout, frameOfProject, overlaps, withHeights, workItems, type Frame } from './layout';
import {
  isNarrow,
  isReadView,
  prefersReducedMotion,
  setReadView,
  setTheme,
  useModKey,
  useNarrow,
  useReadView,
  useReducedMotion,
  useTheme,
} from './stores';
import { useCamera } from './useCamera';
import s from './plane.module.css';

const BOOT_STEP_MS = 150;
const BOOT_SETTLE_MS = 250;
const FLY_MS = 1100;
const FIT_MS = 900;
const TOAST_MS = 2600;
/** Set once the boot sequence has played, so coming back from a case study doesn't replay it. */
const BOOTED_KEY = 'plane:booted';

type Live = {
  onKey: (e: KeyboardEvent) => void;
  onTap: (target: Element) => void;
  flyTo: (i: number, opts?: { instant?: boolean; updateHash?: boolean }) => void;
  fit: (instant?: boolean) => void;
};

export function Plane({ data }: { data: Portfolio }) {
  const layout = useMemo(() => computeLayout(data), [data]);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const frames = useMemo(() => withHeights(layout.frames, heights), [layout.frames, heights]);
  const bounds = useMemo(() => boundsOf(frames), [frames]);
  const ctx = useMemo(() => ({ ...data, frames }), [data, frames]);
  const hints = useMemo(() => commandHints(ctx), [ctx]);
  const n = frames.length;
  const router = useRouter();
  const byId = useMemo(() => new Map(frames.map((f) => [f.id, f])), [frames]);
  const projectFrame = useMemo(() => frameOfProject(data), [data]);
  const workNumber = useMemo(() => new Map(workItems(data).map((w, i) => [w.id, i + 1])), [data]);

  const theme = useTheme();
  const read = useReadView();
  const reduced = useReducedMotion();
  const modKey = useModKey();
  const narrow = useNarrow();

  const [active, setActive] = useState(0);
  const [boot, setBoot] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [sel, setSel] = useState(0);
  const [toast, setToast] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [copied, setCopied] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Window-level listeners and the camera read the latest closures through this ref.
  const live = useRef<Live>(null as unknown as Live);
  const onTapStable = useCallback((t: Element) => live.current.onTap(t), []);
  const { api: camera, refs: cameraRefs } = useCamera({ bounds, enabled: !read, onTap: onTapStable });
  const { viewport: viewportRef, world: worldRef, grid: gridRef, zoomLabel: zoomRef, coordLabel: coordRef, miniView: miniViewRef } =
    cameraRefs;

  const highlight = hover ?? pinned;
  /** Projects using the highlighted tool, and the frames that show them. */
  const litProjects = useMemo(
    () => new Set(highlight ? projectsUsing(data, highlight).map((p) => p.id) : []),
    [data, highlight],
  );
  const lit = useMemo(() => new Set([...litProjects].map((id) => projectFrame.get(id) ?? id)), [litProjects, projectFrame]);
  const booted = reduced || boot >= n;
  const shown = useMemo(() => new Set(frames.slice(0, booted ? n : boot).map((f) => f.id)), [frames, boot, booted, n]);

  // ---------------------------------------------------------------- actions
  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  };

  const flyTo = (i: number, opts: { instant?: boolean; updateHash?: boolean } = {}) => {
    const f = frames[i];
    if (!f) return;
    setActive(i);
    setAnnouncement(`${f.id} — frame ${i + 1} of ${n}`);
    if (opts.updateHash !== false) {
      const url = f.id === 'intro' ? location.pathname + location.search : `#${f.id}`;
      history.replaceState(null, '', url);
    }
    const instant = opts.instant || prefersReducedMotion();
    if (isReadView()) {
      document.getElementById(`frame-${f.id}`)?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const el = worldRef.current?.querySelector<HTMLElement>(`[data-frame="${f.id}"]`);
    const h = el?.offsetHeight || f.h;
    const target = { ...f, y: f.anchor === 'bottom' ? f.y + f.h - h : f.y, h };
    camera.current.flyTo(cameraForFrame(target, camera.current.viewport(), isNarrow()), instant ? 0 : FLY_MS);
  };

  const fit = (instant = false) => {
    if (isReadView()) {
      viewportRef.current?.scrollTo({ top: 0, behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    camera.current.flyTo(cameraForBounds(bounds, camera.current.viewport()), instant || prefersReducedMotion() ? 0 : FIT_MS);
  };

  const next = () => flyTo((active + 1) % n);
  const prev = () => flyTo((active - 1 + n) % n);

  const toggleTheme = (mode?: 'light' | 'dark') => setTheme(mode ?? (theme === 'dark' ? 'light' : 'dark'));

  const toggleRead = (on = !isReadView()) => {
    setReadView(on);
    // Land on the same frame in the other view.
    requestAnimationFrame(() => flyTo(active, { instant: true, updateHash: false }));
  };

  const copyEmail = async (): Promise<boolean> => {
    try {
      if (!data.email) return false;
      await navigator.clipboard.writeText(data.email);
      return true;
    } catch {
      const el = document.querySelector('[data-email]');
      const selection = window.getSelection();
      if (el && selection) {
        selection.selectAllChildren(el);
      }
      return false;
    }
  };

  const run = (a: Action) => {
    switch (a.type) {
      case 'fly':
        return flyTo(a.index);
      case 'next':
        return next();
      case 'prev':
        return prev();
      case 'fit':
        return fit();
      case 'grep':
        setPinned(a.tool);
        setHover(null);
        fit();
        return showToast(`${a.tool} — found in ${a.count} project${a.count === 1 ? '' : 's'}`);
      case 'clear':
        setPinned(null);
        setHover(null);
        return;
      case 'theme':
        return toggleTheme(a.mode);
      case 'read':
        return toggleRead(a.on);
      case 'copy-email':
        return void copyEmail().then((ok) =>
          showToast(ok ? `copied ${data.email}` : `selected ${data.email} — press ${modKey.replace('K', 'C')} to copy`),
        );
      case 'help':
        return setHelpOpen(true);
      case 'navigate':
        return router.push(a.href);
      case 'error':
        return showToast(a.message);
    }
  };

  const runCommand = (c: string) => {
    setQuery('');
    setSel(0);
    inputRef.current?.blur();
    run(parseCommand(c, ctx));
  };

  const list = suggestions(ctx, query, { active, highlight });
  const selected = Math.min(sel, Math.max(0, list.length - 1));

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((selected + 1) % Math.max(1, list.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((selected - 1 + list.length) % Math.max(1, list.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = resolveEnter(query, list, selected);
      if (c) runCommand(c);
    } else if (e.key === 'Escape') {
      setQuery('');
      e.currentTarget.blur();
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
      return;
    }
    const t = e.target as HTMLElement | null;
    const typing = !!t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable);
    if (typing || e.metaKey || e.ctrlKey || e.altKey || helpOpen) return;
    const k = e.key;
    if (k === '/') {
      e.preventDefault();
      inputRef.current?.focus();
    } else if (k === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (k === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (k === '0') fit();
    else if (k === 'Escape') {
      setPinned(null);
      setHover(null);
      fit();
    } else if ((k === '=' || k === '+') && !isReadView()) camera.current.zoomBy(1.3);
    else if ((k === '-' || k === '_') && !isReadView()) camera.current.zoomBy(1 / 1.3);
    else if (k === 'i') toggleTheme();
    else if (k === 'r') toggleRead();
    else if (k === '?') setHelpOpen(true);
    else if (/^[1-9]$/.test(k)) flyTo(+k - 1);
  };

  const onTap = (target: Element) => {
    const card = target.closest<HTMLElement>('[data-card]');
    const i = card ? frames.findIndex((f) => f.id === card.dataset.card) : -1;
    if (i >= 0) flyTo(i);
  };

  useLayoutEffect(() => {
    live.current = { onKey, onTap, flyTo, fit };
  });

  // Start zoomed out to the whole plane, before the first paint.
  useLayoutEffect(() => {
    live.current.fit(true);
  }, []);

  // ---------------------------------------------------------------- effects
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => live.current.onKey(e);
    const onHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const i = layout.frames.findIndex((f) => f.id === id);
      if (i >= 0) live.current.flyTo(i, { updateHash: false });
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', onHash);
    };
  }, [layout.frames]);

  // Boot: frames mount one by one, then the camera flies to the intro (or the frame in the URL hash).
  useEffect(() => {
    const target = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      return Math.max(0, layout.frames.findIndex((f) => f.id === id));
    };
    const land = (instant: boolean) => live.current.flyTo(target(), { instant, updateHash: false });
    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOTED_KEY) === '1';
    } catch {}
    if (prefersReducedMotion() || seen) {
      const r = requestAnimationFrame(() => {
        setBoot(layout.frames.length);
        land(true);
      });
      return () => cancelAnimationFrame(r);
    }
    let b = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const tick = setInterval(() => {
      b += 1;
      setBoot(b);
      if (b >= layout.frames.length) {
        clearInterval(tick);
        try {
          sessionStorage.setItem(BOOTED_KEY, '1');
        } catch {}
        settle = setTimeout(() => land(false), BOOT_SETTLE_MS);
      }
    }, BOOT_STEP_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(settle);
    };
  }, [layout.frames]);

  // Measure real frame heights so fit, the minimap and connector lines match the content.
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    const measure = () => {
      if (isReadView()) return;
      const next: Record<string, number> = {};
      world.querySelectorAll<HTMLElement>('[data-frame]').forEach((el) => {
        next[el.dataset.frame!] = el.offsetHeight;
      });
      setHeights((prev) => {
        const keys = Object.keys(next);
        return keys.length === Object.keys(prev).length && keys.every((k) => prev[k] === next[k]) ? prev : next;
      });
    };
    const ro = new ResizeObserver(measure);
    world.querySelectorAll('[data-frame]').forEach((el) => ro.observe(el));
    const r = requestAnimationFrame(measure);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(r);
      ro.disconnect();
    };
  }, [layout.frames, worldRef]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const o = overlaps(frames);
    if (o.length) console.warn('[plane] frames overlap — shorten content or adjust layout.ts:', o);
  }, [frames]);

  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      clearTimeout(copiedTimer.current);
    },
    [],
  );

  // ---------------------------------------------------------------- render
  const activeFrame = frames[active] ?? frames[0];
  const isWork = (f: Frame) => f.kind === 'project' || f.kind === 'group';
  const path = activeFrame.id === 'intro' ? '' : isWork(activeFrame) ? `work/${activeFrame.id}` : activeFrame.id;

  const stateOf = (f: Frame): FrameState => {
    const isLit = lit.has(f.id);
    return {
      shown: shown.has(f.id),
      active: f.id === activeFrame.id,
      lit: isLit,
      dim: !highlight ? null : isWork(f) ? (isLit ? null : 'strong') : f.kind === 'stack' ? null : 'soft',
    };
  };

  const introCenter = centerOf(frames[0]);
  const links = frames.slice(1).map((f) => {
    const c = centerOf(f);
    const dx = c.x - introCenter.x,
      dy = c.y - introCenter.y;
    return {
      id: f.id,
      len: Math.hypot(dx, dy),
      ang: Math.atan2(dy, dx),
      op: shown.has(f.id) ? (highlight && !lit.has(f.id) ? 0.3 : 1) : 0,
    };
  });

  const faded = new Set(frames.filter((f) => isWork(f) && highlight && !lit.has(f.id)).map((f) => f.id));

  const renderFrame = (f: Frame) => {
    const st = stateOf(f);
    switch (f.kind) {
      case 'intro':
        return <IntroFrame key={f.id} frame={f} state={st} data={data} modKey={modKey} hints={hints} />;
      case 'about':
        return <AboutFrame key={f.id} frame={f} state={st} data={data} />;
      case 'stack':
        return (
          <StackFrame
            key={f.id}
            frame={f}
            state={st}
            data={data}
            highlight={highlight}
            onHover={setHover}
            onGrep={(tool) => run({ type: 'grep', tool, count: projectsUsing(data, tool).length })}
          />
        );
      case 'contact':
        return (
          <ContactFrame
            key={f.id}
            frame={f}
            state={st}
            data={data}
            copied={copied}
            onCopy={() =>
              void copyEmail().then((ok) => {
                if (!ok) return showToast(`selected ${data.email} — press ${modKey.replace('K', 'C')} to copy`);
                setCopied(true);
                clearTimeout(copiedTimer.current);
                copiedTimer.current = setTimeout(() => setCopied(false), 1500);
              })
            }
          />
        );
      case 'project': {
        const project = data.projects.find((p) => p.id === f.id)!;
        return (
          <ProjectFrame
            key={f.id}
            frame={f}
            state={st}
            project={project}
            number={workNumber.get(f.id) ?? 0}
            highlight={highlight}
          />
        );
      }
      case 'group': {
        const group = data.groups!.find((g) => g.id === f.id)!;
        return (
          <GroupFrame
            key={f.id}
            frame={f}
            state={st}
            group={group}
            projects={data.projects.filter((p) => p.group === f.id)}
            number={workNumber.get(f.id) ?? 0}
            lit={litProjects}
          />
        );
      }
    }
  };

  return (
    <div className={s.root}>
      <a className={s.skip} href="#frame-intro" onClick={(e) => (e.preventDefault(), toggleRead(true))}>
        Switch to reading view
      </a>

      <div ref={viewportRef} className={s.viewport}>
        <div ref={gridRef} className={s.grid} aria-hidden="true" />
        <main
          ref={worldRef}
          className={s.world}
          onFocus={(e) => {
            // Keyboard focus moving into another frame flies the camera there.
            if (isReadView() || !(e.target as HTMLElement).matches(':focus-visible')) return;
            const el = (e.target as HTMLElement).closest<HTMLElement>('[data-frame]');
            const i = el ? frames.findIndex((f) => f.id === el.dataset.frame) : -1;
            if (i >= 0 && i !== active) flyTo(i);
          }}
        >
          <div className={s.links} aria-hidden="true">
            {links.map((l) => (
              <div
                key={l.id}
                className={s.link}
                style={{
                  left: introCenter.x,
                  top: introCenter.y,
                  width: l.len,
                  transform: `rotate(${l.ang}rad)`,
                  opacity: l.op,
                }}
              />
            ))}
          </div>
          {layout.reading.map((nominal) => renderFrame(byId.get(nominal.id) ?? nominal))}
        </main>
      </div>

      <TopBar
        monogram={site.monogram}
        version={site.version}
        handle={data.handle}
        path={path}
        read={read}
        theme={theme}
        coordRef={coordRef}
        zoomRef={zoomRef}
        onToggleRead={() => toggleRead()}
        onToggleTheme={() => toggleTheme()}
        onHelp={() => setHelpOpen(true)}
      />

      {!booted && (
        <BootLog
          lines={frames.slice(0, boot).map((f, i) => ({
            t: (i * 0.037).toFixed(3),
            path: f.id === 'intro' ? `~/${data.handle}` : `~/${f.id}`,
          }))}
        />
      )}

      <LayersPanel frames={frames} active={active} faded={faded} visible={booted} onGo={flyTo} />

      <Minimap
        frames={frames}
        bounds={bounds}
        active={active}
        lit={lit}
        visible={booted}
        viewRef={miniViewRef}
        onJump={(x, y, instant) => {
          const c = camera.current.get();
          camera.current.flyTo({ x, y, z: c.z }, instant || reduced ? 0 : 500);
        }}
      />

      <CommandBar
        inputRef={inputRef}
        query={query}
        list={list}
        sel={selected}
        focused={focused}
        toast={toast}
        placeholder={
          highlight
            ? narrow
              ? `clear to reset`
              : `grep ${highlight.toLowerCase()} — type clear to reset`
            : narrow
              ? `tour · open · grep`
              : `tour · fit · open ${hints.firstProject} · grep ${hints.grep}`
        }
        position={active + 1}
        total={n}
        onQuery={(q) => {
          setQuery(q);
          setSel(0);
        }}
        onSel={setSel}
        onRun={runCommand}
        onKeyDown={onInputKey}
        onFocusChange={setFocused}
        onPrev={prev}
        onNext={next}
      />

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div role="status" aria-live="polite" className="sr-only">
        {toast || announcement}
      </div>
    </div>
  );
}
