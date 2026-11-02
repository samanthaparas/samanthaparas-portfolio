import { fill, t } from '../content';

/**
 * The console note (global microcopy §6): logged once per page load, for whoever opens dev tools.
 * Called from main.tsx only, so it never runs during tests or prerendering.
 */
export function logConsoleNote(isMac: boolean) {
  const style = 'font: 600 13px/1.6 system-ui, sans-serif; color: #7c5e17;';
  console.log(`%c${t('global', 'console.1')}`, `${style} font-size: 15px;`);
  console.log(`%c${t('global', 'console.2')}`, style);
  console.log(
    `%c${fill(t('global', 'console.3'), { '⌘K or Ctrl+K': isMac ? '⌘K' : 'Ctrl+K' })}`,
    style,
  );
}

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/** Feeds keys in one at a time; returns true when the last ten keys spell the cheat code. */
export function cheatCodeTracker() {
  let recent: string[] = [];
  return (key: string): boolean => {
    recent = [...recent, key.length === 1 ? key.toLowerCase() : key].slice(-CODE.length);
    if (recent.length === CODE.length && recent.every((k, i) => k === CODE[i])) {
      recent = [];
      return true;
    }
    return false;
  };
}
