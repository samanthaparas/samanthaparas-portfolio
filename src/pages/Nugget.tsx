import { Link } from 'react-router';
import { t } from '../content';
import { Labeled } from '../components/bits';

const n = (key: string) => t('nugget', key);

export default function Nugget() {
  return (
    <div className="container page note-page">
      <Link to="/work" className="back-link label">{n('header.back')}</Link>
      <header className="page-head">
        <p><span className="chip">{n('header.chip')}</span></p>
        <h1>{n('header.h1')}</h1>
        <p className="lede">{n('header.summary')}</p>
        <p>{n('header.host')}</p>
        <ul className="card-meta spec">
          <li><Labeled text={n('spec.when')} /></li>
          <li><Labeled text={n('spec.role')} /></li>
          <li><Labeled text={n('spec.stack')} /></li>
          <li><Labeled text={n('spec.team')} /></li>
          <li><Labeled text={n('spec.status')} /></li>
        </ul>
      </header>

      <section className="note-row" aria-labelledby="challenge-h">
        <h2 id="challenge-h">{n('challenge.h2')}</h2>
        <div><p>{n('challenge.p')}</p></div>
      </section>

      <section className="note-row" aria-labelledby="built-h">
        <h2 id="built-h">{n('built.h2')}</h2>
        <div>
          <ul className="bullets">
            <li>{n('built.review')}</li>
            <li>{n('built.groups')}</li>
          </ul>
          <p>{n('built.scope')}</p>
        </div>
      </section>

      <section className="note-row" aria-labelledby="qa-h">
        <h2 id="qa-h">{n('qa.h2')}</h2>
        <div><p>{n('qa.p')}</p></div>
      </section>

      <nav className="next-nav" aria-label="Projects">
        <Link to="/work/can-you-spot-it">{n('footer.back')}</Link>
        <Link to="/work/questkeeper" className="btn btn-secondary">{n('footer.next')}</Link>
      </nav>
    </div>
  );
}
