import Link from 'next/link';
import { portfolio } from '@/content/portfolio';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        backgroundImage: 'radial-gradient(circle, var(--dot) 1px, transparent 1.3px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div style={{ width: 'min(480px, 100%)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 2px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-dim)',
          }}
        >
          <span>~/{portfolio.handle}/404</span>
          <span>?, ?</span>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line-frame)', padding: 36 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
            cd: no such frame
          </p>
          <h1 style={{ margin: '14px 0 24px', fontSize: 48, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>
            Off the plane.
          </h1>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: 4,
              background: 'var(--fg)',
              color: 'var(--bg)',
              font: '500 12px var(--font-mono)',
            }}
          >
            ← back to ~/{portfolio.handle}
          </Link>
        </div>
      </div>
    </main>
  );
}
