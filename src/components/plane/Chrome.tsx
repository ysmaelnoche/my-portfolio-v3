'use client';

import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import type { Suggestion } from './commands';
import type { Bounds, Frame } from './layout';
import { MINIMAP, minimapScale } from './useCamera';
import s from './plane.module.css';

/**
 * Mouse/touch clicks shouldn't leave a focus ring behind once the keyboard
 * shortcuts move the selection elsewhere; keyboard activation keeps focus.
 */
function blurAfter(fn: () => void) {
  return (e: ReactMouseEvent<HTMLButtonElement>) => {
    fn();
    if (e.detail > 0) e.currentTarget.blur();
  };
}

export function TopBar({
  monogram,
  version,
  handle,
  path,
  read,
  theme,
  coordRef,
  zoomRef,
  onToggleRead,
  onToggleTheme,
  onHelp,
}: {
  monogram: string;
  version: string;
  handle: string;
  path: string;
  read: boolean;
  theme: 'dark' | 'light';
  coordRef: RefObject<HTMLSpanElement | null>;
  zoomRef: RefObject<HTMLSpanElement | null>;
  onToggleRead: () => void;
  onToggleTheme: () => void;
  onHelp: () => void;
}) {
  return (
    <header className={s.topbar}>
      <div className={s.brand}>
        <span className={s.monogram}>{monogram}</span>
        <span className={s.version}>{version}</span>
      </div>
      <div className={s.topPath}>
        ~/{handle}/<span className={s.topPathActive}>{path}</span>
      </div>
      <div className={s.topRight}>
        {/* Filled in by the camera; empty until it knows where it is. */}
        <span ref={coordRef} className={s.coords} aria-hidden="true" />
        <span ref={zoomRef} className={s.zoom} aria-hidden="true" />
        <button type="button" className={s.topBtn} onClick={blurAfter(onToggleRead)} aria-pressed={read}>
          {read ? 'plane' : 'read'}
        </button>
        <button
          type="button"
          className={s.topBtn}
          onClick={blurAfter(onToggleTheme)}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className={s.themeIcon} data-light={theme === 'light' || undefined}>
            <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
          </svg>
        </button>
        <button type="button" className={s.topBtn} onClick={blurAfter(onHelp)} aria-label="Keyboard shortcuts" aria-haspopup="dialog">
          ?
        </button>
      </div>
    </header>
  );
}

export function BootLog({ lines }: { lines: { t: string; path: string }[] }) {
  return (
    <ol className={s.boot} aria-hidden="true">
      {lines.map((l) => (
        <li key={l.path}>
          <span className={s.bootTime}>[{l.t}]</span>
          <span>mount {l.path}</span>
          <span className={s.bootOk}>ok</span>
        </li>
      ))}
    </ol>
  );
}

export function LayersPanel({
  frames,
  active,
  faded,
  visible,
  onGo,
}: {
  frames: Frame[];
  active: number;
  faded: Set<string>;
  visible: boolean;
  onGo: (i: number) => void;
}) {
  return (
    <nav className={s.layers} data-visible={visible || undefined} aria-label="Frames">
      <ol>
        {frames.map((f, i) => (
          <li key={f.id}>
            <button
              type="button"
              className={s.layer}
              data-active={i === active || undefined}
              data-faded={faded.has(f.id) || undefined}
              aria-current={i === active ? 'true' : undefined}
              onClick={blurAfter(() => onGo(i))}
            >
              <span className={s.layerLabel}>{f.id}</span>
              <span className={s.layerKey} aria-hidden="true">
                {i < 9 ? i + 1 : ''}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Minimap({
  frames,
  bounds,
  active,
  lit,
  visible,
  viewRef,
  onJump,
}: {
  frames: Frame[];
  bounds: Bounds;
  active: number;
  lit: Set<string>;
  visible: boolean;
  viewRef: RefObject<HTMLDivElement | null>;
  onJump: (x: number, y: number, instant: boolean) => void;
}) {
  const ms = minimapScale(bounds);
  const dragging = useRef(false);
  const toWorld = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - r.left - MINIMAP.pad) / ms + bounds.x0, y: (e.clientY - r.top - MINIMAP.pad) / ms + bounds.y0 };
  };
  return (
    <div
      className={s.minimap}
      data-visible={visible || undefined}
      aria-hidden="true"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        const w = toWorld(e);
        onJump(w.x, w.y, false);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const w = toWorld(e);
        onJump(w.x, w.y, true);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className={s.minimapInner} style={{ width: MINIMAP.w, height: MINIMAP.h }}>
        {frames.map((f, i) => (
          <div
            key={f.id}
            className={s.miniFrame}
            data-active={i === active || undefined}
            data-lit={lit.has(f.id) || undefined}
            style={{ left: (f.x - bounds.x0) * ms, top: (f.y - bounds.y0) * ms, width: f.w * ms, height: f.h * ms }}
          />
        ))}
        <div ref={viewRef} className={s.miniView} />
      </div>
    </div>
  );
}

export function CommandBar({
  inputRef,
  query,
  list,
  sel,
  focused,
  toast,
  placeholder,
  position,
  total,
  onQuery,
  onSel,
  onRun,
  onKeyDown,
  onFocusChange,
  onPrev,
  onNext,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  list: Suggestion[];
  sel: number;
  focused: boolean;
  toast: string;
  placeholder: string;
  position: number;
  total: number;
  onQuery: (q: string) => void;
  onSel: (i: number) => void;
  onRun: (c: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocusChange: (f: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const noMatch = !!query.trim() && list.length === 0;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className={s.cmd}>
      {focused && (
        <ul id="cmd-list" role="listbox" aria-label="Commands" className={s.suggest}>
          {list.map((x, i) => (
            <li
              key={x.c}
              id={`cmd-opt-${i}`}
              role="option"
              aria-selected={i === sel}
              className={s.suggestItem}
              onMouseDown={(e) => {
                e.preventDefault();
                onRun(x.c);
              }}
              onMouseEnter={() => onSel(i)}
            >
              <span>{x.c}</span>
              <span className={s.suggestDesc}>{x.d}</span>
            </li>
          ))}
          {noMatch && (
            <li role="presentation" className={s.noMatch}>
              no match for “{query}” — press enter to run it anyway
            </li>
          )}
        </ul>
      )}
      {!!toast && !focused && (
        <div className={s.toast} aria-hidden="true">
          {toast}
        </div>
      )}
      <div className={s.bar} data-focused={focused || undefined}>
        <label className={s.barLabel} htmlFor="cmd-input">
          <span aria-hidden="true" className={s.prompt}>
            ›
          </span>
          <span className="sr-only">Command</span>
          <input
            id="cmd-input"
            ref={inputRef}
            className={s.input}
            value={query}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            enterKeyHint="go"
            role="combobox"
            aria-expanded={focused}
            aria-controls="cmd-list"
            aria-autocomplete="list"
            aria-activedescendant={focused && list[sel] ? `cmd-opt-${sel}` : undefined}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
          />
        </label>
        <button type="button" className={s.navBtn} onClick={blurAfter(onPrev)} aria-label="Previous frame">
          ←
        </button>
        <span className={s.counter} aria-hidden="true">
          {pad(position)}/{pad(total)}
        </span>
        <button type="button" className={`${s.navBtn} ${s.navBtnPrimary}`} onClick={blurAfter(onNext)} aria-label="Next frame">
          →
        </button>
      </div>
    </div>
  );
}

const SHORTCUTS: [string, string][] = [
  ['→ / ←', 'next / previous frame'],
  ['1 – 9', 'jump to a frame'],
  ['0', 'zoom to fit everything'],
  ['+ / −', 'zoom in / out'],
  ['drag · scroll', 'pan the plane'],
  ['⌘/Ctrl + scroll · pinch', 'zoom'],
  ['/ or ⌘K', 'open the command bar'],
  ['r', 'reading view'],
  ['i', 'light / dark'],
  ['esc', 'clear highlight and fit'],
];

const COMMANDS: [string, string][] = [
  ['tour', 'fly to the next frame'],
  ['open <frame>', 'fly to a frame, e.g. open about'],
  ['grep <tool>', 'highlight projects that use a tool'],
  ['clear', 'remove the highlight'],
  ['fit', 'zoom out to see everything'],
  ['read', 'toggle the reading view'],
  ['invert', 'toggle light / dark'],
  ['copy email', 'copy the email address'],
];

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={s.help}
      aria-labelledby="help-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={s.helpInner}>
        <div className={s.helpHead}>
          <h2 id="help-title">~/help</h2>
          <button type="button" className={s.topBtn} onClick={onClose} aria-label="Close">
            esc
          </button>
        </div>
        <h3>keys</h3>
        <dl className={s.helpList}>
          {SHORTCUTS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <h3>commands</h3>
        <dl className={s.helpList}>
          {COMMANDS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
}
