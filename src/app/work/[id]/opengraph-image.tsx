import { statusLabel } from '@/content/format';
import { portfolio } from '@/content/portfolio';
import { ogSize, renderOg, splitTitle } from '@/lib/og';

export const alt = 'Case study';
export const size = ogSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return portfolio.projects.map((p) => ({ id: p.id }));
}

export default async function CaseStudyImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = portfolio.projects.find((x) => x.id === id) ?? portfolio.projects[0];
  return renderOg({
    path: `~/work/${p.id}`,
    aside: statusLabel(p).toLowerCase(),
    meta: `${portfolio.name} · ${p.kind}`.toLowerCase(),
    title: splitTitle(p.name),
    body: p.summary,
  });
}
