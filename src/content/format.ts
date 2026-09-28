import type { Project } from './types';

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/** "Implemented · continuing development" */
export function statusLabel(p: Pick<Project, 'status' | 'statusNote'>) {
  return p.statusNote ? `${p.status} · ${p.statusNote}` : p.status;
}

/** 'tel:' href from a display number: '+63 969 049 3331' → 'tel:+639690493331'. */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
