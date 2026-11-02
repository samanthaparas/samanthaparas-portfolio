import { useState } from 'react';
import { fill, t } from '../content';
import { resolveAttack, rollD20, type AttackResult } from '../lib/attack';

const b = (key: string) => t('btb', key);

// The demo goblin's secret. It's in this file on purpose: the demo's own "Full disclosure" line
// invites visitors to find it, which is the point of the lesson.
const GOBLIN_AC = 15;
const BONUS = 5;

interface Roll {
  natural: number;
  total: number;
  result: AttackResult;
}

function resultLine(roll: Roll): string {
  if (roll.natural === 1) return b('demo.result.nat1');
  return b(`demo.result.${roll.result}`);
}

/** Roll to attack: shows what the browser sends and the one word that comes back. */
export function AttackDemo({ random = Math.random }: { random?: () => number }) {
  const [roll, setRoll] = useState<Roll | null>(null);
  const [rolling, setRolling] = useState(false);

  function attack() {
    const natural = rollD20(random);
    const next = { natural, total: natural + BONUS, result: resolveAttack(natural, BONUS, GOBLIN_AC) };
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setRoll(next);
      return;
    }
    setRolling(true);
    window.setTimeout(() => {
      setRoll(next);
      setRolling(false);
    }, 450);
  }

  return (
    <section className="section container" aria-labelledby="demo-h2">
      <p className="label">{b('demo.eyebrow')}</p>
      <h2 id="demo-h2">{b('demo.h2')}</h2>
      <p className="measure">{b('demo.intro')}</p>

      <div className="demo">
        <div className="demo-table">
          <p className="demo-target">{b('demo.target')}</p>
          <p className="label">{b('demo.bonus')}</p>
          {/* aria-disabled, not disabled: a disabled button would drop keyboard focus mid-roll. */}
          <button type="button" className="btn btn-primary demo-roll" onClick={() => !rolling && attack()} aria-disabled={rolling}>
            <span className={`demo-die${rolling ? ' is-rolling' : ''}`} aria-hidden="true">
              {roll && !rolling ? roll.natural : '20'}
            </span>
            {roll ? b('demo.again') : b('demo.roll')}
          </button>
          <div className="demo-result" aria-live="polite">
            {roll && !rolling && (
              <>
                <p>{fill(b('demo.rolled'), { natural: roll.natural, bonus: BONUS, total: roll.total })}</p>
                <p className={`demo-verdict is-${roll.result}`}>{resultLine(roll)}</p>
              </>
            )}
          </div>
        </div>

        {roll && !rolling && (
          <div className="demo-wire">
            <p className="label">{b('demo.sent')}</p>
            <pre className="mono">{`rpc("attack_roll", { p_natural: ${roll.natural}, p_bonus: ${BONUS}, … })`}</pre>
            <p className="label">{b('demo.got')}</p>
            <pre className="mono">{`"${roll.result}"`}</pre>
            <p>{b('demo.why')}</p>
            <p className="small muted">{b('demo.honest')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
