import { Link } from 'react-router';
import { t } from '../content';
import { Labeled, MarginNote } from '../components/bits';

const c = (key: string) => t('cysi', key);

/** Permission-safe version: no teammate names, no screenshots, no links (repo private, playtest unlisted). */
export default function CanYouSpotIt() {
  return (
    <div className="container page note-page">
      <Link to="/work" className="back-link label">{c('header.back')}</Link>
      <header className="page-head">
        <p><span className="chip">{c('header.chip')}</span></p>
        <h1>{c('header.h1')}</h1>
        <p className="lede">{c('header.summary')}</p>
        <ul className="card-meta spec">
          <li><Labeled text={c('spec.role')} /></li>
          <li><Labeled text={c('spec.team')} /></li>
          <li><Labeled text={c('spec.stack')} /></li>
          <li><Labeled text={c('spec.status')} /></li>
        </ul>
        <p className="small muted">{c('links.none')}</p>
      </header>

      <section className="note-row" aria-labelledby="why-h">
        <h2 id="why-h">{c('why.h2')}</h2>
        <div><p>{c('why.p')}</p></div>
      </section>

      <section className="note-row" aria-labelledby="part-h">
        <h2 id="part-h">{c('part.h2')}</h2>
        <div>
          <p>{c('part.p')}</p>
          <ul className="bullets">{[1, 2, 3, 4, 5].map((n) => <li key={n}>{c(`part.bullet.${n}`)}</li>)}</ul>
        </div>
      </section>

      <section className="note-row" aria-labelledby="learned-h">
        <h2 id="learned-h">{c('learned.h2')}</h2>
        <div>
          <p>{c('learned.p1')}</p>
          <p>{c('learned.p2')}</p>
        </div>
      </section>

      <section className="note-row" aria-labelledby="hard-h">
        <h2 id="hard-h">{c('hard.h2')}</h2>
        <div>
          <p>{c('hard.p')}</p>
          <MarginNote kind="tradeoff" label={c('note.hard.type')}>{c('note.hard.text')}</MarginNote>
        </div>
      </section>

      <section className="note-row" aria-labelledby="team-h">
        <h2 id="team-h">{c('team.h2')}</h2>
        <div><p>{c('team.p')}</p></div>
      </section>

      <nav className="next-nav" aria-label="Projects">
        <Link to="/work/questkeeper">{c('footer.back')}</Link>
        <Link to="/work/nugget-hackathon" className="btn btn-secondary">{c('footer.next')}</Link>
      </nav>
    </div>
  );
}
