import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import type { Portfolio, Project } from '@/content/types';
import { coordLabel, type Frame } from './layout';
import s from './plane.module.css';

export type FrameState = {
  shown: boolean;
  active: boolean;
  /** Matches the current grep highlight. */
  lit: boolean;
  /** Dimmed because a highlight is active and this frame isn't part of it. */
  dim: 'soft' | 'strong' | null;
};

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

function Shell({
  frame,
  path,
  aside,
  state,
  labelledBy,
  as: Tag = 'section',
  className,
  children,
}: {
  frame: Frame;
  path: string;
  /** Right-hand side of the label row; defaults to the frame's coordinates. */
  aside?: string;
  state: FrameState;
  labelledBy: string;
  as?: 'section' | 'article';
  className?: string;
  children: ReactNode;
}) {
  const style: CSSProperties =
    frame.anchor === 'bottom'
      ? { left: frame.x, bottom: -(frame.y + frame.h), width: frame.w }
      : { left: frame.x, top: frame.y, width: frame.w };
  return (
    <Tag
      id={`frame-${frame.id}`}
      data-frame={frame.id}
      data-kind={frame.kind}
      data-shown={state.shown || undefined}
      data-active={state.active || undefined}
      data-lit={state.lit || undefined}
      data-dim={state.dim ?? undefined}
      aria-labelledby={labelledBy}
      className={`${s.frame} ${className ?? ''}`}
      style={style}
    >
      <div className={s.frameLabel} aria-hidden="true">
        <span>{path}</span>
        <span>{aside ?? coordLabel(frame)}</span>
      </div>
      {children}
    </Tag>
  );
}

export function IntroFrame({
  frame,
  state,
  data,
  modKey,
  hints,
}: {
  frame: Frame;
  state: FrameState;
  data: Portfolio;
  modKey: string;
  hints: { open: string; grep: string };
}) {
  const [first, ...rest] = data.name.split(/\s+/);
  return (
    <Shell frame={frame} path={`~/${data.handle}`} state={state} labelledBy="intro-title">
      <div className={`${s.card} ${s.introCard}`} data-card="intro">
        <p className={s.meta}>
          {[data.role, data.location].join(' · ').toLowerCase()}
        </p>
        <h1 id="intro-title" className={s.name}>
          {first}
          {rest.length > 0 && (
            <>
              <br />
              {rest.join(' ')}
            </>
          )}
        </h1>
        <p className={s.lede}>{data.intro}</p>
        <div className={s.hint}>
          <kbd className={s.kbd}>{modKey}</kbd>
          <span>
            type <b>tour</b>, <b>open {hints.open}</b> or <b>grep {hints.grep}</b>
          </span>
        </div>
      </div>
    </Shell>
  );
}

export function AboutFrame({ frame, state, data }: { frame: Frame; state: FrameState; data: Portfolio }) {
  return (
    <Shell frame={frame} path={`~/${data.handle}/about`} state={state} labelledBy="about-title">
      <div className={`${s.card} ${s.aboutCard}`} data-card="about">
        <h2 id="about-title" className="sr-only">
          About
        </h2>
        {data.bio.map((b, i) => (
          <p key={i} className={s.bio}>
            {b}
          </p>
        ))}
        <h3 className="sr-only">Experience</h3>
        <ol className={s.timeline}>
          {data.timeline.map((t) => (
            <li key={`${t.years}-${t.role}`} className={s.timelineRow}>
              <span className={s.timelineYears}>{t.years}</span>
              <span>
                <span className={s.timelineRole}>{t.role}</span> <span className={s.timelineOrg}>— {t.org}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}

export function ProjectFrame({
  frame,
  state,
  project,
  index,
  highlight,
}: {
  frame: Frame;
  state: FrameState;
  project: Project;
  index: number;
  highlight: string | null;
}) {
  const titleId = `project-${project.id}-title`;
  const hl = highlight?.toLowerCase();
  return (
    <Shell
      frame={frame}
      path={`~/work/${project.id}`}
      aside={project.year}
      state={state}
      labelledBy={titleId}
      as="article"
      className={s.projectFrame}
    >
      <div className={`${s.card} ${s.projectCard}`} data-card={project.id}>
        <div className={s.capture}>
          {project.image ? (
            <Image
              src={project.image.src}
              alt={project.image.alt}
              fill
              sizes="(max-width: 820px) 100vw, 420px"
              className={s.captureImg}
            />
          ) : (
            <span aria-hidden="true">[ {project.name} — capture ]</span>
          )}
        </div>
        <div className={s.projectBody}>
          <div className={s.projectHead}>
            <h3 id={titleId} className={s.projectName}>
              {project.name}
            </h3>
            <span className={s.projectNum} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <p className={s.projectKind}>{project.kind}</p>
          <p className={s.projectRole}>
            {project.role} · {project.status}
            <span className="sr-only"> · {project.year}</span>
          </p>
          <p className={s.projectDesc}>{project.description}</p>
          {project.facts.length > 0 && (
            <dl className={s.facts}>
              {project.facts.map((f) => (
                <div key={f.label} className={s.fact}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <ul className={s.chips} aria-label="Stack">
            {project.stack.map((t) => (
              <li key={t} className={s.chip} data-on={hl === t.toLowerCase() || undefined}>
                {t}
              </li>
            ))}
          </ul>
          {project.links && project.links.length > 0 && (
            <div className={s.projectLinks}>
              {project.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  {...(isExternal(l.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

export function StackFrame({
  frame,
  state,
  data,
  highlight,
  onHover,
  onGrep,
}: {
  frame: Frame;
  state: FrameState;
  data: Portfolio;
  highlight: string | null;
  onHover: (tool: string | null) => void;
  onGrep: (tool: string) => void;
}) {
  const hl = highlight?.toLowerCase();
  return (
    <Shell
      frame={frame}
      path={`~/${data.handle}/stack — hover to grep`}
      state={state}
      labelledBy="stack-title"
    >
      <div className={`${s.card} ${s.stackCard}`} data-card="stack">
        <h2 id="stack-title" className="sr-only">
          Stack
        </h2>
        {data.skills.map((g) => (
          <div key={g.group}>
            <h3 className={s.stackGroup}>{g.group.toLowerCase()}/</h3>
            <ul className={s.stackList}>
              {g.items.map((it) => (
                <li key={it}>
                  <button
                    type="button"
                    className={s.stackItem}
                    data-dim={(hl && hl !== it.toLowerCase()) || undefined}
                    aria-label={`${it} — highlight projects using it`}
                    onMouseEnter={() => onHover(it)}
                    onMouseLeave={() => onHover(null)}
                    onFocus={(e) => e.currentTarget.matches(':focus-visible') && onHover(it)}
                    onBlur={() => onHover(null)}
                    onClick={() => onGrep(it)}
                  >
                    {it}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function ContactFrame({
  frame,
  state,
  data,
  copied,
  onCopy,
}: {
  frame: Frame;
  state: FrameState;
  data: Portfolio;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Shell frame={frame} path={`~/${data.handle}/contact`} state={state} labelledBy="contact-title">
      <div className={`${s.card} ${s.contactCard}`} data-card="contact">
        <p className={s.contactMeta}>{data.availability.toLowerCase()}</p>
        <h2 id="contact-title" className={s.contactTitle}>
          Say hello.
        </h2>
        <div className={s.emailRow}>
          <a className={s.email} href={`mailto:${data.email}`} data-email>
            {data.email}
          </a>
          <button type="button" className={s.copyBtn} onClick={onCopy} aria-live="polite">
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <ul className={s.contactLinks}>
          {data.links.map((k) => (
            <li key={k.label}>
              <a href={k.href} {...(isExternal(k.href) ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <span className={s.contactLinkLabel}>{k.label} ↗</span>
                <span className={s.contactLinkHandle}>{k.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
