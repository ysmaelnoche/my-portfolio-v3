import type { Portfolio } from '@/content/types';
import type { Frame } from './layout';

export type Suggestion = { c: string; d: string };

export type Action =
  | { type: 'fly'; index: number }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'fit' }
  | { type: 'grep'; tool: string; count: number }
  | { type: 'clear' }
  | { type: 'theme'; mode?: 'light' | 'dark' }
  | { type: 'read'; on?: boolean }
  | { type: 'copy-email' }
  | { type: 'help' }
  | { type: 'navigate'; href: string }
  | { type: 'error'; message: string };

type Ctx = Pick<Portfolio, 'projects' | 'skills' | 'email' | 'hints'> & Partial<Pick<Portfolio, 'groups'>> & { frames: Frame[] };

/** True when every character of q appears in s, in order. */
export function fuzzy(s: string, q: string) {
  let i = 0;
  for (const ch of s) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  return !q.length;
}

function matchRank(s: string, q: string) {
  if (s === q) return 0;
  if (s.startsWith(q)) return 1;
  if (s.split(' ').some((w) => w.startsWith(q))) return 2;
  if (s.includes(q)) return 3;
  return fuzzy(s, q) ? 4 : -1;
}

/** Every tool that appears in the skills list or in any project's stack, skills first. */
export function allTools(ctx: Pick<Portfolio, 'projects' | 'skills'>) {
  const seen = new Map<string, string>();
  for (const t of [...ctx.skills.flatMap((g) => g.items), ...ctx.projects.flatMap((p) => p.stack)]) {
    const k = t.toLowerCase();
    if (!seen.has(k)) seen.set(k, t);
  }
  return [...seen.values()];
}

export function projectsUsing(ctx: Pick<Portfolio, 'projects'>, tool: string) {
  const t = tool.toLowerCase();
  return ctx.projects.filter((p) => p.stack.some((s) => s.toLowerCase() === t));
}

/** Example commands for the intro hint and placeholder, from `hints` or picked from the data. */
export function commandHints(ctx: Ctx) {
  const ids = ctx.projects.map((p) => p.id);
  const open = ctx.hints?.open && ids.includes(ctx.hints.open) ? ctx.hints.open : (ids[ids.length - 1] ?? 'about');
  const tools = allTools(ctx);
  const byUse = [...tools].sort((a, b) => projectsUsing(ctx, b).length - projectsUsing(ctx, a).length);
  const grep = (ctx.hints?.grep ?? byUse[0] ?? 'react').toLowerCase();
  return { open, grep, firstProject: ids[0] ?? open };
}

export function baseCommands(ctx: Ctx, opts: { highlight: string | null }): Suggestion[] {
  const h = commandHints(ctx);
  const list: Suggestion[] = [
    { c: 'tour', d: 'next frame  (→)' },
    { c: 'fit', d: 'zoom to everything  (0)' },
    { c: `open ${h.firstProject}`, d: 'fly to a frame' },
    { c: `grep ${h.grep}`, d: 'highlight projects using a tool' },
  ];
  if (opts.highlight) list.push({ c: 'clear', d: `reset ${opts.highlight} highlight` });
  list.push(
    { c: `cat ${h.firstProject}`, d: 'read a case study' },
    { c: 'read', d: 'toggle reading view  (r)' },
    { c: 'invert', d: 'toggle light / dark  (i)' },
  );
  if (ctx.email) list.push({ c: 'copy email', d: ctx.email });
  list.push({ c: 'help', d: 'keyboard shortcuts  (?)' });
  return list;
}

export function suggestions(ctx: Ctx, query: string, opts: { active: number; highlight: string | null; limit?: number }) {
  const limit = opts.limit ?? 9;
  const base = baseCommands(ctx, opts);
  const q = query.trim().toLowerCase();
  if (!q) return base.slice(0, limit);
  const inFrame = new Set(ctx.frames.map((f) => f.id));
  const all: Suggestion[] = [
    ...base.filter((x) => !/^(open|grep|cat) /.test(x.c)),
    { c: 'clear', d: 'reset highlight' },
    ...ctx.frames.map((f, i) => ({ c: `open ${f.id}`, d: i === opts.active ? 'current frame' : 'fly to frame' })),
    ...ctx.projects.filter((p) => !inFrame.has(p.id)).map((p) => ({ c: `open ${p.id}`, d: `fly to ${p.group ?? 'frame'}` })),
    ...ctx.projects.map((p) => ({ c: `cat ${p.id}`, d: `case study — ${p.name}` })),
    ...allTools(ctx).map((t) => {
      const n = projectsUsing(ctx, t).length;
      return { c: `grep ${t.toLowerCase()}`, d: `${n} project${n === 1 ? '' : 's'}` };
    }),
  ];
  const unique = all.filter((x, i) => all.findIndex((y) => y.c === x.c) === i);
  return unique
    .map((x, i) => ({ x, i, r: matchRank(x.c, q) }))
    .filter((m) => m.r >= 0)
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, limit)
    .map((m) => m.x);
}

/** Turns a command string into an action. Unknown input becomes an `error` with a hint. */
export function parseCommand(input: string, ctx: Ctx): Action {
  const c = input.trim().toLowerCase().replace(/\s+/g, ' ');
  const groups = new Set((ctx.groups ?? []).map((g) => g.id));
  const frameIndex = (id: string) => {
    const direct = ctx.frames.findIndex((f) => f.id === id);
    if (direct >= 0) return direct;
    // A project listed inside a group frame (e.g. an internship) flies to that frame.
    const p = ctx.projects.find((x) => x.id === id);
    return p?.group && groups.has(p.group) ? ctx.frames.findIndex((f) => f.id === p.group) : -1;
  };
  const cleanId = (s: string) => s.replace(/^~\/?|\/$/g, '').split('/').pop() ?? '';

  if (c.startsWith('open ') || c.startsWith('cd ')) {
    const id = cleanId(c.slice(c.indexOf(' ') + 1));
    const i = frameIndex(id);
    return i >= 0 ? { type: 'fly', index: i } : { type: 'error', message: `no frame named ${id}` };
  }
  if (c.startsWith('cat ') || c.startsWith('less ')) {
    const id = cleanId(c.slice(c.indexOf(' ') + 1));
    const p = ctx.projects.find((x) => x.id === id);
    return p ? { type: 'navigate', href: `/work/${p.id}` } : { type: 'error', message: `cat: ${id}: no such case study` };
  }
  if (c.startsWith('grep ')) {
    const term = c.slice(5).trim();
    const tools = allTools(ctx);
    const tool =
      tools.find((t) => t.toLowerCase() === term) ?? tools.find((t) => t.toLowerCase().includes(term));
    if (!tool) return { type: 'error', message: `grep: nothing matches "${term}"` };
    return { type: 'grep', tool, count: projectsUsing(ctx, tool).length };
  }
  switch (c) {
    case 'tour':
    case 'next':
      return { type: 'next' };
    case 'prev':
    case 'back':
      return { type: 'prev' };
    case 'fit':
    case 'ls':
      return { type: 'fit' };
    case 'clear':
      return { type: 'clear' };
    case 'invert':
    case 'theme':
      return { type: 'theme' };
    case 'light':
    case 'dark':
      return { type: 'theme', mode: c };
    case 'read':
    case 'list':
      return { type: 'read' };
    case 'canvas':
    case 'plane':
      return { type: 'read', on: false };
    case 'copy email':
    case 'email':
      return ctx.email ? { type: 'copy-email' } : { type: 'error', message: 'no public email yet — see contact' };
    case 'help':
    case '?':
      return { type: 'help' };
    case 'home':
    case 'cd':
    case '~':
      return { type: 'fly', index: 0 };
  }
  const i = frameIndex(c);
  if (i >= 0) return { type: 'fly', index: i };
  return { type: 'error', message: `command not found: ${c} — try tour, fit, open, grep` };
}

/**
 * What Enter runs: an exact match, else the highlighted suggestion, else the
 * typed text as-is (so unknown commands still get a helpful error).
 */
export function resolveEnter(query: string, list: Suggestion[], sel: number): string | null {
  const typed = query.trim().toLowerCase();
  const exact = list.find((x) => x.c === typed);
  if (exact) return exact.c;
  if (list[sel]) return list[sel].c;
  return typed || null;
}
