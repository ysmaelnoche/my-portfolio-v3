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
 */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.remove('no-js');var t=localStorage.getItem('plane:theme');if(t==='light'||t==='dark')d.dataset.theme=t;var v=localStorage.getItem('plane:view');if(v==='read')d.dataset.view='read';}catch(e){}})();`;

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
