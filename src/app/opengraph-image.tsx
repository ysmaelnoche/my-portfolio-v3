import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { portfolio } from '@/content/portfolio';
import { site } from '@/content/site';

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const fontDir = join(process.cwd(), 'node_modules/geist/dist/fonts');

export default async function OpengraphImage() {
  const [sans, mono] = await Promise.all([
    readFile(join(fontDir, 'geist-sans/Geist-Medium.ttf')),
    readFile(join(fontDir, 'geist-mono/GeistMono-Regular.ttf')),
  ]);
  const [first, ...rest] = portfolio.name.split(/\s+/);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Geist Mono', fontSize: 20, color: '#ededed', paddingBottom: 12 }}>
            <span>~/{portfolio.handle}</span>
            <span>0, 0</span>
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
            <div style={{ fontFamily: 'Geist Mono', fontSize: 22, color: '#808080' }}>
              {[portfolio.role, portfolio.location].join(' · ').toLowerCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 28, fontSize: 120, letterSpacing: '-0.06em', lineHeight: 0.88 }}>
              <span>{first}</span>
              {rest.length > 0 && <span>{rest.join(' ')}</span>}
            </div>
            <div style={{ marginTop: 'auto', fontSize: 28, lineHeight: 1.4, color: '#9a9a9a', maxWidth: 900 }}>{portfolio.intro}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Geist', data: sans, weight: 500, style: 'normal' },
        { name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  );
}
