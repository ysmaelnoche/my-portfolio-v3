import { describe, expect, it } from 'vitest';
import { portfolio } from '@/content/portfolio';
import type { Project } from '@/content/types';
import { boundsOf, computeLayout, coordLabel, frameOfProject, overlaps, withHeights, workItems } from './layout';

const fakeProjects = (n: number, ids?: string[]): Project[] =>
  Array.from({ length: n }, (_, i) => ({
    id: ids?.[i] ?? `p${i}`,
    name: `P${i}`,
    status: 'Implemented',
    context: '',
    kind: '',
    summary: '',
    stack: [],
    facts: [],
    sections: [],
  }));

/** The six projects of the original Plane design. */
const original = { projects: fakeProjects(6, ['halcyon', 'parallax', 'ferrous', 'tidal', 'atlas', 'loom']) };

describe('computeLayout', () => {
  it('reproduces the original Plane positions and tour order for six projects', () => {
    const { frames } = computeLayout(original);
    expect(frames.map((f) => [f.id, f.x, f.y])).toEqual([
      ['intro', -300, -220],
      ['about', -280, -1120],
      ['halcyon', 560, -800],
      ['parallax', 1180, -200],
      ['ferrous', 560, 420],
      ['stack', -340, 440],
      ['contact', -300, 1080],
      ['loom', -980, 420],
      ['atlas', -1600, -200],
      ['tidal', -980, -800],
    ]);
  });

  it('keeps the original frame coordinate labels', () => {
    const byId = new Map(computeLayout(original).frames.map((f) => [f.id, f]));
    expect(coordLabel(byId.get('intro')!)).toBe('0, 0');
    expect(coordLabel(byId.get('about')!)).toBe('0, −840');
    expect(coordLabel(byId.get('stack')!)).toBe('0, 640');
    expect(coordLabel(byId.get('contact')!)).toBe('0, 1280');
  });

  it('puts frames in reading order: intro, about, work in data order, stack, contact', () => {
    const { reading } = computeLayout(portfolio);
    expect(reading.map((f) => f.id)).toEqual(['intro', 'about', ...workItems(portfolio).map((w) => w.id), 'stack', 'contact']);
  });

  it('lays out the real portfolio without overlaps, grouping the internship into one frame', () => {
    const { frames } = computeLayout(portfolio);
    expect(overlaps(frames)).toEqual([]);
    expect(frames.filter((f) => f.kind === 'group').map((f) => f.id)).toEqual(['comrise']);
    expect(frames.some((f) => f.id === 'resume-harvesting')).toBe(false);
    expect(frameOfProject(portfolio).get('resume-harvesting')).toBe('comrise');
    expect(frameOfProject(portfolio).get('orbit')).toBe('orbit');
  });

  it('widens the stack frame for more than four skill groups', () => {
    const narrow = computeLayout({ ...original, skills: [1, 2, 3, 4] }).frames.find((f) => f.id === 'stack')!;
    const wide = computeLayout({ ...original, skills: [1, 2, 3, 4, 5] }).frames.find((f) => f.id === 'stack')!;
    expect([narrow.x, narrow.w]).toEqual([-340, 680]);
    expect([wide.x, wide.w]).toEqual([-450, 900]);
  });

  it.each([0, 1, 2, 3, 5, 7, 9, 12, 15])('lays out %i projects without overlap', (n) => {
    const { frames } = computeLayout({ projects: fakeProjects(n) });
    expect(frames).toHaveLength(n + 4);
    expect(overlaps(frames)).toEqual([]);
    expect(new Set(frames.map((f) => f.id)).size).toBe(frames.length);
  });

  it('spans the original bounds', () => {
    expect(boundsOf(computeLayout(original).frames)).toEqual({ x0: -1660, y0: -1180, x1: 1660, y1: 1540 });
  });
});

describe('withHeights', () => {
  const get = (frames: ReturnType<typeof withHeights>, id: string) => frames.find((f) => f.id === id)!;

  it('grows top-anchored frames downward and bottom-anchored frames upward', () => {
    const { frames } = computeLayout(original);
    const next = withHeights(frames, { intro: 500, about: 700 });
    expect([get(next, 'intro').y, get(next, 'intro').h]).toEqual([-220, 500]);
    expect([get(next, 'about').y + get(next, 'about').h, get(next, 'about').h]).toEqual([-560, 700]);
  });

  it('keeps the original positions at nominal heights', () => {
    const next = withHeights(computeLayout(original).frames, {});
    expect(get(next, 'stack').y).toBe(440);
    expect(get(next, 'contact').y).toBe(1080);
  });

  it('pushes stack and contact down when the content above them grows', () => {
    const next = withHeights(computeLayout(original).frames, { intro: 480, stack: 700 });
    expect(get(next, 'stack').y).toBe(-220 + 480 + 220);
    expect(get(next, 'contact').y).toBe(get(next, 'stack').y + 700 + 240);
    expect(overlaps(next)).toEqual([]);
  });

  it('keeps the printed coordinates tied to the nominal size', () => {
    const next = withHeights(computeLayout(original).frames, { intro: 470, about: 640 });
    expect(coordLabel(get(next, 'intro'))).toBe('0, 0');
    expect(coordLabel(get(next, 'about'))).toBe('0, −840');
  });
});
