import type { Project } from './types';

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/** "Implemented · continuing development" */
export function statusLabel(p: Pick<Project, 'status' | 'statusNote'>) {
  return p.statusNote ? `${p.status} · ${p.statusNote}` : p.status;
}
