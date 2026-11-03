import { t } from '../content';

export interface PageMeta {
  path: string;
  title: () => string;
  description: () => string;
}

const fromCopy = (path: string, page: Parameters<typeof t>[0]): PageMeta => ({
  path,
  title: () => t(page, 'page.title'),
  description: () => t(page, 'page.meta'),
});

/** Every prerendered page. The build writes one HTML file per entry, plus 404.html. */
export const pages: PageMeta[] = [
  fromCopy('/', 'home'),
  fromCopy('/work', 'work'),
  fromCopy('/work/questkeeper', 'questkeeper'),
  fromCopy('/work/can-you-spot-it', 'cysi'),
  fromCopy('/work/nugget-hackathon', 'nugget'),
  fromCopy('/work/reckoning-tattoo', 'reckoning'),
  fromCopy('/behind-the-build', 'btb'),
  fromCopy('/about', 'about'),
  fromCopy('/services', 'services'),
  { path: '/easter-eggs', title: () => t('eggs', 'eggs.page.title'), description: () => t('eggs', 'eggs.page.meta') },
  // Contact has no page.meta row: the title follows the approved "{Page} · Samantha Paras" pattern
  // (global microcopy §9) and the description reuses the approved lede.
  { path: '/contact', title: () => 'Contact · Samantha Paras', description: () => t('global', 'contact.lede') },
];

export function metaFor(path: string): { title: string; description: string } {
  // Netlify serves /about as /about/, so ignore a trailing slash when matching.
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path;
  const p = pages.find((x) => x.path === clean);
  if (!p) return { title: t('global', 'notFound.title'), description: t('global', 'notFound.p') };
  return { title: p.title(), description: p.description() };
}
