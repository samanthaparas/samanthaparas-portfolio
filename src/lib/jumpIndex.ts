import { t } from '../content';
import { launch } from './site';

export interface JumpItem {
  group: 'projects' | 'sections' | 'pages';
  label: string;
  href: string;
}

/**
 * Jump to / Search entries. Built from the sections and pages that actually render
 * (IMPLEMENTATION-MAP "section navigation follows the sections that render").
 */
export function jumpItems(): JumpItem[] {
  const qk = t('home', 'card.questkeeper.name');
  const items: (JumpItem | false)[] = [
    { group: 'projects', label: qk, href: '/work/questkeeper' },
    { group: 'projects', label: t('home', 'card.cysi.name'), href: '/work/can-you-spot-it' },
    { group: 'projects', label: t('home', 'card.nugget.name'), href: '/work/nugget-hackathon' },
    { group: 'sections', label: `${qk} › ${t('questkeeper', 'wrong.h2')}`, href: '/work/questkeeper#wrong' },
    { group: 'sections', label: `${qk} › ${t('questkeeper', 'changed.h2')}`, href: '/work/questkeeper#changed' },
    { group: 'sections', label: `${t('global', 'nav.about')} › ${t('about', 'exp.h2')}`, href: '/about#experience' },
    { group: 'sections', label: `${t('global', 'nav.services')} › Common problems`, href: '/services#common-problems' },
    { group: 'pages', label: t('global', 'nav.work'), href: '/work' },
    launch.labHasEntries && { group: 'pages', label: t('global', 'nav.lab'), href: '/lab' },
    { group: 'pages', label: t('global', 'nav.about'), href: '/about' },
    { group: 'pages', label: t('global', 'nav.services'), href: '/services' },
    { group: 'pages', label: t('global', 'footer.btb'), href: '/behind-the-build' },
    { group: 'pages', label: t('global', 'nav.contact'), href: '/contact' },
  ];
  return items.filter((x): x is JumpItem => Boolean(x));
}

export function filterJump(items: JumpItem[], query: string): JumpItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((i) => i.label.toLowerCase().includes(q));
}

/** `roll d20` is a hidden command (global microcopy §3). */
export function isRollCommand(query: string): boolean {
  return /^\s*(\/)?roll d20\s*$/i.test(query);
}

export function d20Message(n: number): string {
  if (n === 20) return t('global', 'jump.d20.nat20');
  if (n === 1) return t('global', 'jump.d20.nat1');
  return t('global', 'jump.d20.result').replace('{n}', String(n));
}
