import type { ProjectVisual } from '@/content/types';
import s from './visuals.module.css';

const pad = (i: number) => String(i + 1).padStart(2, '0');

/**
 * A project's diagram, drawn from its data. `card` fits the 4:3 picture area
 * on the plane; `page` is the larger version at the top of a case study.
 */
export function Visual({ visual, size }: { visual: ProjectVisual; size: 'card' | 'page' }) {
  if (visual.type === 'quadrant') return <Quadrant x={visual.x} y={visual.y} size={size} />;
  return <Flow steps={visual.steps} planned={visual.planned} size={size} />;
}

export function Flow({ steps, planned = [], size }: { steps: string[]; planned?: string[]; size: 'card' | 'page' }) {
  const all = [...steps.map((label) => ({ label, planned: false })), ...planned.map((label) => ({ label, planned: true }))];
  return (
    <ol className={s.flow} data-size={size} data-count={all.length} aria-label="Flow">
      {all.map((st, i) => (
        <li
          key={`${i}-${st.label}`}
          className={s.step}
          data-planned={st.planned || undefined}
          data-last={(!st.planned && i === steps.length - 1) || undefined}
        >
          <span className={s.idx} aria-hidden="true">
            {st.planned ? '··' : pad(i)}
          </span>
          <span className={s.label}>{st.label}</span>
          {st.planned && <span className={s.tag}>planned</span>}
        </li>
      ))}
    </ol>
  );
}

/** Wrapping "a → b → c" flow used on case study pages. Planned steps are dashed. */
export function InlineFlow({ steps, planned = [] }: { steps: string[]; planned?: string[] }) {
  const all = [...steps.map((label) => ({ label, planned: false })), ...planned.map((label) => ({ label, planned: true }))];
  return (
    <ol className={s.inline} aria-label="Flow">
      {all.map((st, i) => (
        <li key={`${i}-${st.label}`}>
          <span className={s.inlineStep} data-planned={st.planned || undefined}>
            {st.label}
            {st.planned && <span className={s.tag}> planned</span>}
          </span>
          {i < all.length - 1 && (
            <span className={s.arrow} aria-hidden="true">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function Quadrant({ x, y, size }: { x: string; y: string; size: 'card' | 'page' }) {
  const lx = x.toLowerCase(),
    ly = y.toLowerCase();
  const cells = [
    `high ${ly} · low ${lx}`,
    `high ${ly} · high ${lx}`,
    `low ${ly} · low ${lx}`,
    `low ${ly} · high ${lx}`,
  ];
  return (
    <figure className={s.quadrant} data-size={size}>
      <span className={s.axisY} aria-hidden="true">
        {ly} ↑
      </span>
      <div className={s.cells}>
        {cells.map((c) => (
          <span key={c} className={s.cell}>
            {c}
          </span>
        ))}
      </div>
      <span className={s.axisX} aria-hidden="true">
        {lx} →
      </span>
      <figcaption className="sr-only">
        A two-by-two comparing {ly} against {lx}.
      </figcaption>
    </figure>
  );
}
