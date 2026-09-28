import { portfolio } from '@/content/portfolio';
import { site } from '@/content/site';
import { ogSize, renderOg } from '@/lib/og';

export const alt = site.title;
export const size = ogSize;
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const [first, ...rest] = portfolio.name.split(/\s+/);
  return renderOg({
    path: `~/${portfolio.handle}`,
    aside: '0, 0',
    meta: [portfolio.role, portfolio.location].join(' · ').toLowerCase(),
    title: rest.length ? [first, rest.join(' ')] : [first],
    body: portfolio.intro,
  });
}
