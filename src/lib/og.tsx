import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };

const fontDir = join(process.cwd(), 'node_modules/geist/dist/fonts');

/** Share image in the Plane style: a frame on the dotted canvas with its path label. */
export async function renderOg({
  path,
  aside,
  meta,
  title,
  body,
}: {
  path: string;
  aside: string;
  meta: string;
  title: string[];
  body: string;
}) {
  const [sans, mono] = await Promise.all([
    readFile(join(fontDir, 'geist-sans/Geist-Medium.ttf')),
    readFile(join(fontDir, 'geist-mono/GeistMono-Regular.ttf')),
  ]);
  const long = title.join(' ').length > 22;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle, #2a2a2a 1.5px, transparent 1.6px)',
          backgroundSize: '32px 32px',
          padding: 64,
          fontFamily: 'Geist',
          color: '#ededed',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'Geist Mono',
              fontSize: 20,
              paddingBottom: 12,
            }}
          >
            <span>{path}</span>
            <span>{aside}</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              background: '#0f0f0f',
              border: '1px solid #ededed',
              padding: 56,
            }}
          >
            <div style={{ fontFamily: 'Geist Mono', fontSize: 22, color: '#808080' }}>{meta}</div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 28,
                fontSize: long ? 84 : 120,
                letterSpacing: '-0.05em',
                lineHeight: 0.92,
              }}
            >
              {title.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div style={{ marginTop: 'auto', fontSize: 28, lineHeight: 1.4, color: '#9a9a9a', maxWidth: 960 }}>{body}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Geist', data: sans, weight: 500, style: 'normal' },
        { name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}

/** Splits a title into two balanced lines for the share image. */
export function splitTitle(t: string): string[] {
  const words = t.split(/\s+/);
  if (words.length < 2) return [t];
  let best = 1,
    diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < diff) [best, diff] = [i, d];
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}
