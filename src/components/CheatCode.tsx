import { useEffect, useState } from 'react';
import { maybe } from '../content';
import { cheatCodeTracker } from '../lib/eggs';

/** ↑↑↓↓←→←→BA anywhere on the site shows a short message. Ignored while typing in a form field. */
export function CheatCode() {
  const message = maybe('eggs', 'eggs.konami.toast');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!message) return;
    const track = cheatCodeTracker();
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (track(e.key)) setShown(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [message]);

  useEffect(() => {
    if (!shown) return;
    const id = window.setTimeout(() => setShown(false), 6000);
    return () => window.clearTimeout(id);
  }, [shown]);

  if (!message) return null;
  return (
    <div className="toast-region" aria-live="polite">
      {shown && <p className="toast">{message}</p>}
    </div>
  );
}
