import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { t } from '../content';
import { useJump } from '../components/JumpTo';
import { fairD20, rollMessage } from '../lib/d20';

// three.js and the physics engine load only here, and only when the 3D die can actually run.
const Dice3D = lazy(() => import('../components/Dice3D'));

type Mode = 'flat' | '3d';

function canRun3D(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function NotFound() {
  const jump = useJump();
  const [work, contact, jumpLabel] = t('global', 'notFound.links').split(' · ');
  // Every visit opens on a natural 1. Rerolls are fair (crypto, no modulo bias).
  const [value, setValue] = useState(1);
  const [shown, setShown] = useState(1); // the number the text describes; updates when the die settles
  const [rollKey, setRollKey] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [mode, setMode] = useState<Mode>('flat');
  // Until this visit decides between 3D and flat, the flat die stays hidden (when JavaScript runs).
  const [decided, setDecided] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    setDecided(true);
    if (!canRun3D()) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    setLowPower((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4);
    setMode('3d');
    setRolling(true); // the opening roll lands on 1
  }, []);

  const reroll = useCallback(() => {
    if (rolling) return;
    const next = fairD20();
    setValue(next);
    if (mode === '3d') {
      setRolling(true);
      setRollKey((k) => k + 1);
    } else {
      setShown(next);
    }
  }, [rolling, mode]);

  const settled = useCallback(() => {
    setRolling(false);
    setShown(value);
  }, [value]);

  const message = rollMessage(shown);

  return (
    <div className="container page not-found">
      <div className={`nf-stage${mode === '3d' ? ' is-3d' : ''}`} aria-hidden="true">
        {mode === '3d' ? (
          // While the 3D code downloads, the plum stage stays empty: no flat die flashing in between.
          <Suspense fallback={null}>
            <Dice3D
              value={value}
              rollKey={rollKey}
              celebrate={!rolling && shown === 20}
              lowPower={lowPower}
              onSettled={settled}
              onDieClick={reroll}
            />
          </Suspense>
        ) : (
          <FlatDie n={shown} pending={!decided} />
        )}
      </div>

      <div className="nf-text" aria-live="polite" aria-atomic="true">
        {/* Always present so the heading never jumps when a roll starts. */}
        <p className="label nf-status">{rolling && shown !== value ? t('global', 'notFound.rolling') : ''}</p>
        <h1 className={rolling && shown !== value ? 'is-stale' : undefined}>{message.heading}</h1>
        <p className="lede">{message.line}</p>
        {message.nat20 && !rolling && (
          <Link to="/work" className="btn btn-text nf-projects">{t('global', 'notFound.nat20.link')}</Link>
        )}
      </div>

      <div className="btn-row">
        <Link to="/" className="btn btn-primary">{t('global', 'notFound.cta')}</Link>
        <button type="button" className="btn btn-secondary" onClick={reroll} aria-disabled={rolling}>
          {t('global', 'notFound.reroll')}
        </button>
      </div>
      <p>
        {t('global', 'notFound.or')} <Link to="/work">{work}</Link> · <Link to="/contact">{contact}</Link> ·{' '}
        <button type="button" className="link-btn" onClick={(e) => jump.open('desktop', e.currentTarget)}>
          {jumpLabel}
        </button>
      </p>
    </div>
  );
}

/** The non-3D die: reduced motion, no WebGL, and the moment before the 3D loads. */
function FlatDie({ n, pending }: { n: number; pending: boolean }) {
  return (
    <div className={`nf-flat${pending ? ' is-pending' : ''}`}>
      <span className={`nat1${n === 20 ? ' is-20' : ''}`} key={n}>{n}</span>
    </div>
  );
}
