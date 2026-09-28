import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { portfolio } from '@/content/portfolio';
import { site, siteUrl } from '@/content/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: site.title,
  description: site.description,
  applicationName: portfolio.name,
  authors: [{ name: portfolio.name }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    url: '/',
    title: site.title,
    description: site.description,
    siteName: portfolio.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Runs before first paint: applies the saved theme and view so there's no
 * flash, and removes `no-js` (which otherwise shows the reading layout).
 * If the app still hasn't started after a while (a script failed to load),
 * it falls back to the reading layout instead of leaving a blank canvas.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.remove('no-js');try{var t=localStorage.getItem('plane:theme');if(t==='light'||t==='dark'){d.dataset.theme=t;var c=t==='light'?'#f5f5f5':'#0a0a0a',f=function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',c);};f();document.addEventListener('DOMContentLoaded',f);}if(localStorage.getItem('plane:view')==='read')d.dataset.view='read';}catch(e){}setTimeout(function(){if(document.querySelector('[data-plane]')&&!d.hasAttribute('data-plane-ready'))d.classList.add('no-js');},8000);})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`no-js ${GeistSans.variable} ${GeistMono.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
