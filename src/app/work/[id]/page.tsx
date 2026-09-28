import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ThemeToggle } from '@/components/case/ThemeToggle';
import { InlineFlow, Visual } from '@/components/visuals/Visual';
import { isExternal, statusLabel } from '@/content/format';
import { portfolio } from '@/content/portfolio';
import { site } from '@/content/site';
import s from '@/components/case/case.module.css';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return portfolio.projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = portfolio.projects.find((x) => x.id === id);
  if (!p) return {};
  const title = `${p.name} — ${portfolio.name}`;
  return {
    title,
    description: p.summary,
    alternates: { canonical: `/work/${p.id}` },
    openGraph: { type: 'article', url: `/work/${p.id}`, title, description: p.summary, siteName: portfolio.name },
    twitter: { card: 'summary_large_image', title, description: p.summary, images: [`/work/${p.id}/opengraph-image`] },
  };
}

export default async function CaseStudy({ params }: Props) {
  const { id } = await params;
  const index = portfolio.projects.findIndex((x) => x.id === id);
  if (index < 0) notFound();
  const p = portfolio.projects[index];
  const group = p.group ? portfolio.groups?.find((g) => g.id === p.group) : undefined;
  const prev = portfolio.projects[index - 1];
  const next = portfolio.projects[index + 1];
  const back = `/#${group?.id ?? p.id}`;

  return (
    <div className={s.page}>
      <header className={s.topbar}>
        <Link href="/" className={s.brand}>
          <span className={s.monogram}>{site.monogram}</span>
          <span className={s.version}>{site.version}</span>
        </Link>
        <div className={s.path}>
          ~/{portfolio.handle}/work/<span className={s.pathActive}>{p.id}</span>
        </div>
        <div className={s.actions}>
          <Link href={back} className={s.btn}>
            ← plane
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className={s.main}>
        <div className={s.label} aria-hidden="true">
          <span>~/work/{p.id}</span>
          <span>{statusLabel(p).toLowerCase()}</span>
        </div>
        <article className={s.card} aria-labelledby="case-title">
          <p className={s.meta}>{[p.role, p.context, p.year].filter(Boolean).join(' · ').toLowerCase()}</p>
          <h1 id="case-title" className={s.title}>
            {p.name}
          </h1>
          <p className={s.kind}>{p.kind}</p>
          <p className={s.status}>
            <span className={s.statusDot} data-status={p.status} aria-hidden="true" />
            {statusLabel(p)}
          </p>
          <p className={s.summary}>{p.summary}</p>

          {group && (
            <p className={s.groupNote}>
              Part of the <Link href={`/#${group.id}`}>{group.title.toLowerCase()}</Link> — {group.role}, {group.org},{' '}
              {group.period}.
            </p>
          )}

          {p.visual?.type === 'quadrant' && (
            <div className={s.visual}>
              <Visual visual={p.visual} size="page" />
            </div>
          )}
          {p.visual?.type === 'flow' && !p.sections.some((sec) => sec.flow) && (
            <div className={s.visual}>
              <InlineFlow steps={p.visual.steps} planned={p.visual.planned} />
            </div>
          )}

          {p.facts.length > 0 && (
            <dl className={s.facts}>
              {p.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {p.sections.map((sec) => (
            <section key={sec.title} className={s.section}>
              <h2>{sec.title}</h2>
              {sec.body?.map((b, i) => (
                <p key={i}>{b}</p>
              ))}
              {sec.flow && <InlineFlow steps={sec.flow} />}
              {sec.items && (
                <ul>
                  {sec.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {p.stack.length > 0 && (
            <section className={s.section}>
              <h2>Stack</h2>
              <ul className={s.chips}>
                {p.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          {p.links && p.links.length > 0 && (
            <div className={s.links}>
              {p.links.map((l) => (
                <a key={l.href} href={l.href} {...(isExternal(l.href) ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </article>

        <nav className={s.pager} aria-label="More case studies">
          {prev ? (
            <Link href={`/work/${prev.id}`} className={s.pagerLink}>
              <span className={s.pagerDir}>← previous</span>
              <span>{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/work/${next.id}`} className={`${s.pagerLink} ${s.pagerNext}`}>
              <span className={s.pagerDir}>next →</span>
              <span>{next.name}</span>
            </Link>
          ) : (
            <Link href={back} className={`${s.pagerLink} ${s.pagerNext}`}>
              <span className={s.pagerDir}>back →</span>
              <span>the plane</span>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
