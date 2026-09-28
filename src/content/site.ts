import { portfolio } from './portfolio';

/**
 * Canonical site URL, used for metadata, the sitemap and share images.
 * Set NEXT_PUBLIC_SITE_URL once you have a custom domain; on Vercel it
 * otherwise falls back to the project's production URL.
 */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export const site = {
  title: `${portfolio.name} — ${portfolio.role}`,
  description: portfolio.intro,
  /** Small label next to the monogram in the top bar. */
  version: 'plane 1.0',
  monogram: portfolio.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
};
