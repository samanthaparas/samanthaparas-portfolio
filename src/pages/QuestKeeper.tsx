import { useState } from 'react';
import { Link } from 'react-router';
import { t } from '../content';
import { external } from '../lib/site';
import { ExtLink } from '../components/ExtLink';
import { Labeled, MarginNote } from '../components/bits';

const q = (key: string) => t('questkeeper', key);

/**
 * Sections that render, in order. "What I learned" and "What I'd do differently" are omitted until
 * Samantha writes them, so they're absent here and from both section lists (IMPLEMENTATION-MAP).
 * Labels follow the map's Sections list.
 */
export const questkeeperSections = [
  { id: 'bothered', label: () => q('bothered.h2') },
  { id: 'who', label: () => q('who.h2') },
  { id: 'first', label: () => 'What I first thought' },
  { id: 'built', label: () => q('built.h2') },
  { id: 'wrong', label: () => q('wrong.h2') },
  { id: 'changed', label: () => q('changed.h2') },
  { id: 'next', label: () => q('next.h2') },
  { id: 'arch', label: () => q('arch.title') },
  { id: 'receipts', label: () => 'Stack, tests, accessibility, links' },
];

const versions = ['v01', 'v02', 'v05', 'v10'] as const;
const decisions = ['paths', 'tabs', 'homebrew'] as const;

function SectionList({ onPick }: { onPick?: () => void }) {
  return (
    <ul className="section-list">
      {questkeeperSections.map((s) => (
        <li key={s.id}>
          <Link to={`#${s.id}`} onClick={onPick}>
            {s.label()}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Phone: a Sections button that floats over the page and closes after a pick. */
function PhoneSections() {
  const [open, setOpen] = useState(false);
  return (
    <div className="phone-sections only-phone">
      <button type="button" className="btn btn-secondary btn-sm" aria-expanded={open} aria-controls="qk-sections" onClick={() => setOpen((o) => !o)}>
        {q('nav.sections')} <span aria-hidden="true">{t('global', open ? 'sections.close' : 'sections.open')}</span>
      </button>
      <nav id="qk-sections" aria-label={q('nav.sections')} hidden={!open} className="phone-sections-panel">
        <SectionList onPick={() => setOpen(false)} />
      </nav>
    </div>
  );
}

export default function QuestKeeper() {
  return (
    <div className="container page case-study">
      <Link to="/work" className="back-link label">{q('header.back')}</Link>
      <header className="page-head case-head">
        <h1>{q('header.h1')}</h1>
        <p className="lede">{q('header.summary')}</p>
        <ul className="card-meta">
          <li><Labeled text={q('header.role')} /></li>
          <li><Labeled text={q('header.stack')} /></li>
          <li><Labeled text={q('header.status')} /></li>
        </ul>
        <div className="btn-row">
          <ExtLink href={external.questkeeperLive} className="btn btn-primary">{q('header.live')}</ExtLink>
          <ExtLink href={external.questkeeperRepo} className="btn btn-secondary">{q('header.source')}</ExtLink>
        </div>
        <p className="small muted">{q('header.loadNote')}</p>
      </header>

      <PhoneSections />

      <div className="case-layout">
        <nav className="side-sections only-desktop" aria-label={q('nav.sections')}>
          <p className="label">{q('nav.sections')}</p>
          <SectionList />
        </nav>

        <div className="case-body">
          <p className="part-label label">{q('part1.label')}</p>

          <section id="bothered" className="case-section friction-start" aria-labelledby="bothered-h">
            <h2 id="bothered-h">{q('bothered.h2')}</h2>
            <p>{q('bothered.p1')}</p>
            <p>{q('bothered.p2')}</p>
            <p>{q('bothered.p3')}</p>
          </section>

          <section id="who" className="case-section" aria-labelledby="who-h">
            <h2 id="who-h">{q('who.h2')}</h2>
            <p>{q('who.p')}</p>
          </section>

          <section id="first" className="case-section" aria-labelledby="first-h">
            <h2 id="first-h">{q('first.h2')}</h2>
            <p>{q('first.p1')}</p>
            <p>{q('first.p2')}</p>
          </section>

          <section id="built" className="case-section" aria-labelledby="built-h">
            <h2 id="built-h">{q('built.h2')}</h2>
            <ol className="timeline">
              {versions.map((v) => (
                <li key={v}>
                  <h3 className="version-label mono">{q(`built.${v}.label`)}</h3>
                  <p>{q(`built.${v}.text`)}</p>
                  {v === 'v02' && <MarginNote kind="decision" label={q('note.v02.type')}>{q('note.v02.text')}</MarginNote>}
                  {v === 'v10' && <MarginNote kind="changed" label={q('note.v10.type')}>{q('note.v10.text')}</MarginNote>}
                </li>
              ))}
            </ol>
          </section>

          <section id="wrong" className="case-section" aria-labelledby="wrong-h">
            <h2 id="wrong-h">{q('wrong.h2')}</h2>
            {(['search', 'acolyte', 'sheet'] as const).map((k) => (
              <article key={k} className="wrong-item">
                <h3>{q(`wrong.${k}.title`)}</h3>
                <p>{q(`wrong.${k}.text`)}</p>
                {k === 'acolyte' && <MarginNote kind="mistake" label={q('note.acolyte.type')}>{q('note.acolyte.text')}</MarginNote>}
              </article>
            ))}
          </section>

          <section id="changed" className="case-section" aria-labelledby="changed-h">
            <h2 id="changed-h">{q('changed.h2')}</h2>
            {decisions.map((k) => (
              <article key={k} className="decision-row">
                <h3>{q(`changed.${k}.title`)}</h3>
                <p><Labeled text={q(`changed.${k}.problem`)} /></p>
                <p><Labeled text={q(`changed.${k}.decision`)} /></p>
                <p><Labeled text={q(`changed.${k}.why`)} /></p>
                {k === 'paths' && <Link to="/behind-the-build" className="btn btn-text">{q('changed.paths.link')}</Link>}
              </article>
            ))}
          </section>

          <section id="next" className="case-section" aria-labelledby="next-h">
            <h2 id="next-h">{q('next.h2')}</h2>
            <ul className="bullets">
              {[1, 2, 3, 4, 5].map((n) => <li key={n}>{q(`next.${n}`)}</li>)}
            </ul>
            <p>{q('next.after')}</p>
          </section>

          <p className="part-label label">{q('part2.label')}</p>

          <section id="arch" className="case-section" aria-labelledby="arch-h">
            <h2 id="arch-h">{q('arch.title')}</h2>
            <ul className="mono-list">
              <li>{q('arch.1')}</li>
              <li>{q('arch.2')}</li>
            </ul>
            <Link to="/behind-the-build" className="btn btn-text">{q('arch.link')}</Link>
          </section>

          <section id="receipts" className="case-section receipts" aria-label="Stack, tests, accessibility, links">
            <div>
              <h2>{q('stack.title')}</h2>
              <ul className="bullets">{[1, 2, 3, 4].map((n) => <li key={n}>{q(`stack.${n}`)}</li>)}</ul>
            </div>
            <div>
              <h2>{q('tests.title')}</h2>
              <ul className="bullets">{[1, 2, 3].map((n) => <li key={n}>{q(`tests.${n}`)}</li>)}</ul>
            </div>
            <div>
              <h2>{q('secrets.title')}</h2>
              <ul className="bullets">{[1, 2, 3].map((n) => <li key={n}>{q(`secrets.${n}`)}</li>)}</ul>
              <Link to="/behind-the-build" className="btn btn-text">{q('secrets.link')}</Link>
            </div>
            <div>
              <h2>{q('a11y.title')}</h2>
              <ul className="bullets">{[1, 2, 3, 4].map((n) => <li key={n}>{q(`a11y.${n}`)}</li>)}</ul>
            </div>
            <div>
              <h2>{q('licensing.title')}</h2>
              <p>{q('licensing.text')}</p>
            </div>
            <div>
              <h2>{q('links.title')}</h2>
              <ul className="inline-list">
                <li><ExtLink href={external.questkeeperLive}>{q('links.live')}</ExtLink></li>
                <li><ExtLink href={external.questkeeperRepo}>{q('links.repo')}</ExtLink></li>
                <li><ExtLink href={external.questkeeperReadme}>{q('links.readme')}</ExtLink></li>
              </ul>
            </div>
          </section>

          <nav className="next-nav" aria-label="Projects">
            <Link to="/work">{q('footer.back')}</Link>
            <Link to="/work/can-you-spot-it" className="btn btn-secondary">{q('footer.next')}</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
