import about from './copy/about.json';
import btb from './copy/behind-the-build.json';
import cysi from './copy/can-you-spot-it.json';
import eggs from './copy/easter-eggs-and-lab.json';
import global from './copy/global.json';
import home from './copy/home.json';
import nugget from './copy/nugget.json';
import questkeeper from './copy/questkeeper.json';
import services from './copy/services.json';
import work from './copy/work.json';

// Approved public copy, imported from the planning repo's content/phase-4/public tables
// (scripts/import-copy.mjs). Never edit these JSON files by hand; change the source table and re-import.
const copy = { about, btb, cysi, eggs, global, home, nugget, questkeeper, services, work };

export type Page = keyof typeof copy;

/** Returns one approved string. Throws on a missing key so a typo never ships as blank text. */
export function t(page: Page, key: string): string {
  const value = (copy[page] as Record<string, string>)[key];
  if (value === undefined) throw new Error(`Missing copy: ${page}.${key}`);
  return value;
}

/** Fills `{name}` placeholders in an approved template. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{([^}]+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Keys in a page's copy that start with a prefix, in source order (e.g. list items). */
export function keysWithPrefix(page: Page, prefix: string): string[] {
  return Object.keys(copy[page]).filter((k) => k.startsWith(prefix));
}
