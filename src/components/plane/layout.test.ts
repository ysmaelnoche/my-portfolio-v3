import { describe, expect, it } from 'vitest';
import { portfolio } from '@/content/portfolio';
import type { Project } from '@/content/types';
import { boundsOf, computeLayout, coordLabel, overlaps, withHeights } from './layout';

const fakeProjects = (n: number): Project[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    name: `P${i}`,
    year: '2026',
    kind: '',
    role: '',
    status: '',
    stack: [],
    description: '',
    facts: [],
  }));

describe('computeLayout', () => {
  it('reproduces the original Plane positions and tour order for six projects', () => {
    const { frames } = computeLayout(portfolio);
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
    const byId = new Map(computeLayout(portfolio).frames.map((f) => [f.id, f]));
    expect(coordLabel(byId.get('intro')!)).toBe('0, 0');
    expect(coordLabel(byId.get('about')!)).toBe('0, −840');
    expect(coordLabel(byId.get('stack')!)).toBe('0, 640');
    expect(coordLabel(byId.get('contact')!)).toBe('0, 1280');
  });

  it('puts frames in reading order: intro, about, projects in data order, stack, contact', () => {
    const { reading } = computeLayout(portfolio);
    expect(reading.map((f) => f.id)).toEqual([
      'intro',
      'about',
      ...portfolio.projects.map((p) => p.id),
      'stack',
      'contact',
    ]);
  });

  it.each([0, 1, 2, 3, 5, 7, 9, 12, 15])('lays out %i projects without overlap', (n) => {
    const { frames } = computeLayout({ projects: fakeProjects(n) });
    expect(frames).toHaveLength(n + 4);
    expect(overlaps(frames)).toEqual([]);
    expect(new Set(frames.map((f) => f.id)).size).toBe(frames.length);
  });

  it('spans the original bounds', () => {
    expect(boundsOf(computeLayout(portfolio).frames)).toEqual({ x0: -1660, y0: -1180, x1: 1660, y1: 1540 });
  });
});

describe('withHeights', () => {
  it('grows top-anchored frames downward and bottom-anchored frames upward', () => {
    const { frames } = computeLayout(portfolio);
    const next = withHeights(frames, { intro: 500, about: 700 });
    const intro = next.find((f) => f.id === 'intro')!;
    const about = next.find((f) => f.id === 'about')!;
    expect([intro.y, intro.h]).toEqual([-220, 500]);
    expect([about.y + about.h, about.h]).toEqual([-560, 700]);
  });
});
