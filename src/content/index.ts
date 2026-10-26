// Approved public copy, imported from the planning repo's content/phase-4/public tables
// (scripts/import-copy.mjs). Never edit these JSON files by hand; change the source table and re-import.
// A file that hasn't been imported yet (e.g. images.json before its alt text is approved) is just empty.
const files = import.meta.glob<Record<string, string>>('./copy/*.json', { eager: true, import: 'default' });
const byName = (name: string) => files[`./copy/${name}.json`] ?? {};

const copy = {
  about: byName('about'),
  btb: byName('behind-the-build'),
  cysi: byName('can-you-spot-it'),
  eggs: byName('easter-eggs-and-lab'),
  global: byName('global'),
  home: byName('home'),
  images: byName('images'),
  nugget: byName('nugget'),
  questkeeper: byName('questkeeper'),
  services: byName('services'),
  work: byName('work'),
};

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

/** Returns a string only if it exists; for elements that render only once their copy is approved. */
export function maybe(page: Page, key: string): string | undefined {
  return (copy[page] as Record<string, string>)[key];
}

/** Keys in a page's copy that start with a prefix, in source order (e.g. list items). */
export function keysWithPrefix(page: Page, prefix: string): string[] {
  return Object.keys(copy[page]).filter((k) => k.startsWith(prefix));
}
