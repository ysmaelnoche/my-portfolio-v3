import { describe, expect, it } from 'vitest';
import { portfolio } from '@/content/portfolio';
import { allTools, commandHints, fuzzy, parseCommand, resolveEnter, suggestions } from './commands';
import { computeLayout } from './layout';

const ctx = { ...portfolio, frames: computeLayout(portfolio).frames };
const indexOf = (id: string) => ctx.frames.findIndex((f) => f.id === id);

describe('fuzzy', () => {
  it('matches characters in order', () => {
    expect(fuzzy('open halcyon', 'ohal')).toBe(true);
    expect(fuzzy('open halcyon', 'zz')).toBe(false);
    expect(fuzzy('anything', '')).toBe(true);
  });
});

describe('parseCommand', () => {
  it('opens frames by id, with or without `open`', () => {
    expect(parseCommand('open atlas', ctx)).toEqual({ type: 'fly', index: indexOf('atlas') });
    expect(parseCommand('  Open   ATLAS ', ctx)).toEqual({ type: 'fly', index: indexOf('atlas') });
    expect(parseCommand('contact', ctx)).toEqual({ type: 'fly', index: indexOf('contact') });
    expect(parseCommand('cd ~/about', ctx)).toEqual({ type: 'fly', index: indexOf('about') });
  });

  it('reports unknown frames and commands', () => {
    expect(parseCommand('open nowhere', ctx)).toEqual({ type: 'error', message: 'no frame named nowhere' });
    expect(parseCommand('sudo rm', ctx).type).toBe('error');
  });

  it('greps tools exactly first, then by substring', () => {
    expect(parseCommand('grep rust', ctx)).toEqual({ type: 'grep', tool: 'Rust', count: 2 });
    expect(parseCommand('grep react', ctx)).toMatchObject({ tool: 'React' });
    expect(parseCommand('grep nati', ctx)).toMatchObject({ tool: 'React Native', count: 1 });
    expect(parseCommand('grep cobol', ctx)).toEqual({ type: 'error', message: 'grep: nothing matches "cobol"' });
  });

  it('maps the simple commands', () => {
    expect(parseCommand('tour', ctx)).toEqual({ type: 'next' });
    expect(parseCommand('prev', ctx)).toEqual({ type: 'prev' });
    expect(parseCommand('fit', ctx)).toEqual({ type: 'fit' });
    expect(parseCommand('invert', ctx)).toEqual({ type: 'theme' });
    expect(parseCommand('light', ctx)).toEqual({ type: 'theme', mode: 'light' });
    expect(parseCommand('read', ctx)).toEqual({ type: 'read' });
    expect(parseCommand('copy email', ctx)).toEqual({ type: 'copy-email' });
  });
});

describe('suggestions', () => {
  it('shows the base commands when empty, with clear only while highlighting', () => {
    const idle = suggestions(ctx, '', { active: 0, highlight: null }).map((x) => x.c);
    expect(idle.slice(0, 4)).toEqual(['tour', 'fit', 'open halcyon', 'grep rust']);
    expect(idle).not.toContain('clear');
    expect(suggestions(ctx, '', { active: 0, highlight: 'Rust' }).map((x) => x.c)).toContain('clear');
  });

  it('ranks exact and prefix matches above fuzzy ones', () => {
    const list = suggestions(ctx, 'rust', { active: 0, highlight: null }).map((x) => x.c);
    expect(list[0]).toBe('grep rust');
    expect(suggestions(ctx, 'open about', { active: 0, highlight: null })[0].c).toBe('open about');
  });

  it('includes tools that only appear in project stacks', () => {
    const data = {
      ...ctx,
      projects: [{ ...ctx.projects[0], stack: ['Elixir'] }],
    };
    expect(allTools(data)).toContain('Elixir');
    expect(parseCommand('grep elixir', data)).toEqual({ type: 'grep', tool: 'Elixir', count: 1 });
  });
});

describe('resolveEnter', () => {
  const list = [
    { c: 'open atlas', d: '' },
    { c: 'open about', d: '' },
  ];
  it('prefers an exact match, then the selection, then the raw text', () => {
    expect(resolveEnter('open about', list, 0)).toBe('open about');
    expect(resolveEnter('open a', list, 1)).toBe('open about');
    expect(resolveEnter('whatever', [], 0)).toBe('whatever');
    expect(resolveEnter('   ', [], 0)).toBeNull();
  });
});

describe('commandHints', () => {
  it('uses the hints from the data when they are valid', () => {
    expect(commandHints(ctx)).toEqual({ open: 'atlas', grep: 'rust', firstProject: 'halcyon' });
  });

  it('falls back to the data when hints are missing or stale', () => {
    const h = commandHints({ ...ctx, hints: { open: 'gone' } });
    expect(ctx.projects.map((p) => p.id)).toContain(h.open);
    expect(h.grep).toBe('typescript');
  });
});
