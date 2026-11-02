import { fill, t } from '../content';

/**
 * A fair d20 roll from the browser's cryptographic random source. Rejection sampling removes the
 * modulo bias: values from the uneven tail of the 32-bit range are thrown away and redrawn.
 */
export function fairD20(getRandomValues: (a: Uint32Array<ArrayBuffer>) => unknown = (a) => crypto.getRandomValues(a)): number {
  const limit = Math.floor(0x1_0000_0000 / 20) * 20;
  const buf = new Uint32Array(1);
  for (;;) {
    getRandomValues(buf);
    if (buf[0] < limit) return (buf[0] % 20) + 1;
  }
}

/** The 404's heading and line for a roll. */
export function rollMessage(n: number): { heading: string; line: string; nat20: boolean } {
  if (n === 1) return { heading: t('global', 'notFound.h1'), line: t('global', 'notFound.p'), nat20: false };
  if (n === 20) return { heading: t('global', 'notFound.nat20.h1'), line: t('global', 'notFound.nat20.p'), nat20: true };
  const key = n === 7 || n === 13 || n === 17 ? String(n) : n <= 6 ? 'low' : n <= 12 ? 'mid' : 'high';
  return { heading: fill(t('global', 'notFound.roll.h1'), { n }), line: t('global', `notFound.roll.${key}`), nat20: false };
}
