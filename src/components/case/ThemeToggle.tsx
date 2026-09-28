'use client';

import { setTheme, useTheme } from '@/components/plane/stores';
import s from './case.module.css';

export function ThemeToggle() {
  const theme = useTheme();
  return (
    <button
      type="button"
      className={s.btn}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style={theme === 'light' ? { transform: 'scaleX(-1)' } : undefined}>
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
      </svg>
    </button>
  );
}
