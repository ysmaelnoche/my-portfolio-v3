'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'plane:theme';
const VIEW_KEY = 'plane:view';

/**
 * Theme and view live as attributes on <html> (set before paint by the inline
 * script in layout.tsx), so these hooks just watch the attribute.
 */
function subscribeHtmlAttr(attr: string) {
  return (cb: () => void) => {
    const mo = new MutationObserver(cb);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: [attr] });
    return () => mo.disconnect();
  };
}

const subscribeTheme = subscribeHtmlAttr('data-theme');
const subscribeView = subscribeHtmlAttr('data-view');

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'),
    () => 'dark',
  );
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#f5f5f5' : '#0a0a0a');
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
}

export function useReadView(): boolean {
  return useSyncExternalStore(
    subscribeView,
    () => document.documentElement.dataset.view === 'read',
    () => false,
  );
}

export function isReadView() {
  return document.documentElement.dataset.view === 'read';
}

export function setReadView(on: boolean) {
  if (on) document.documentElement.dataset.view = 'read';
  else delete document.documentElement.dataset.view;
  try {
    localStorage.setItem(VIEW_KEY, on ? 'read' : 'plane');
  } catch {}
}

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const reduced = mediaStore('(prefers-reduced-motion: reduce)');
const narrow = mediaStore('(max-width: 819px)');

export const prefersReducedMotion = reduced.get;
export const isNarrow = narrow.get;

export function useNarrow() {
  return useSyncExternalStore(narrow.subscribe, narrow.get, () => false);
}

export function useReducedMotion() {
  return useSyncExternalStore(reduced.subscribe, reduced.get, () => false);
}

const noop = () => () => {};

/** "⌘K" on Apple platforms, "Ctrl K" elsewhere. */
export function useModKey() {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K'),
    () => '⌘K',
  );
}
