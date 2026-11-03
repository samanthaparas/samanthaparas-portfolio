import { Link } from 'react-router';
import { numbered, t } from '../content';
import { Shot } from '../components/Shot';
import { Labeled } from '../components/bits';

const r = (key: string) => t('reckoning', key);

const seoRows = ['home', 'about', 'artist', 'booking'];

/** Comparison boards are wide (1600×460); each opens full size so the small labels stay readable. */
function Board({ altKey, name }: { altKey: string; name: string }) {
  return <Shot altKey={altKey} base={`/images/reckoning/${name}`} widths={[800, 1600]} width={1600} height={460} sizes="(min-width: 860px) 700px, calc(100vw - 72px)" enlarge />;
}

/** Client project: an existing Wix site, so the page credits the studio's work and claims no metrics. */
export default function Reckoning() {
  return (
    <div className="container page note-page">
      <Link to="/work" className="back-link label">{r('header.back')}</Link>
      <header className="page-head">
        <p><span className="chip">{r('header.chip')}</span></p>
        <h1>{r('header.h1')}</h1>
        <p className="lede">{r('header.summary')}</p>
        <ul className="card-meta spec">
          <li><Labeled text={r('spec.when')} /></li>
          <li><Labeled text={r('spec.role')} /></li>
          <li><Labeled text={r('spec.tools')} /></li>
          <li><Labeled text={r('spec.status')} /></li>
        </ul>
        <p className="small muted">{r('header.credit')}</p>
      </header>

      <section className="note-row" aria-labelledby="brief-h">
        <h2 id="brief-h">{r('brief.h2')}</h2>
        <div><p>{r('brief.p')}</p></div>
      </section>

      <section className="note-row" aria-labelledby="audit-h">
        <h2 id="audit-h">{r('audit.h2')}</h2>
        <div><p>{r('audit.p')}</p></div>
      </section>

      <section className="note-row" aria-labelledby="seo-h">
        <h2 id="seo-h">{r('seo.h2')}</h2>
        <div>
          <p>{r('seo.p')}</p>
          <table className="experience seo-table">
            <caption>{r('seo.table.caption')}</caption>
            <thead>
              <tr>
                <th scope="col">{r('seo.table.page')}</th>
                <th scope="col">{r('seo.table.title')}</th>
              </tr>
            </thead>
            <tbody>
              {seoRows.map((row) => {
                // Each row is "Page | Title"; the title itself contains " | ".
                const [page, ...title] = r(`seo.row.${row}`).split(' | ');
                return (
                  <tr key={row}>
                    <th scope="row">{page}</th>
                    <td className="mono">{title.join(' | ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p>{r('seo.more')}</p>
          <p>{r('gbp.p')}</p>
        </div>
      </section>

      <section className="note-row" aria-labelledby="portfolio-h">
        <h2 id="portfolio-h">{r('portfolio.h2')}</h2>
        <div>
          <p>{r('portfolio.p1')}</p>
          <p>{r('portfolio.p2')}</p>
          <Board altKey="img.rtFeatured" name="featured" />
        </div>
      </section>

      <section className="note-row" aria-labelledby="booking-h">
        <h2 id="booking-h">{r('booking.h2')}</h2>
        <div>
          <p>{r('booking.p')}</p>
          <ul className="bullets">{numbered('reckoning', 'booking.bullet').map((item) => <li key={item}>{item}</li>)}</ul>
          <p>{r('booking.limit')}</p>
        </div>
      </section>

      <section className="note-row" aria-labelledby="iteration-h">
        <h2 id="iteration-h">{r('iteration.h2')}</h2>
        <div>
          <p>{r('iteration.p')}</p>
          <Board altKey="img.rtPoster" name="poster" />
          <Board altKey="img.rtEvents" name="events" />
          <Board altKey="img.rtSpacing" name="spacing" />
        </div>
      </section>

      <section className="note-row" aria-labelledby="verified-h">
        <h2 id="verified-h">{r('verified.h2')}</h2>
        <div><p>{r('verified.p')}</p></div>
      </section>

      <section className="note-row" aria-labelledby="next-h">
        <h2 id="next-h">{r('next.h2')}</h2>
        <div>
          <ul className="bullets">{numbered('reckoning', 'next.bullet').map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <nav className="next-nav" aria-label="Projects">
        <Link to="/work/nugget-hackathon">{r('footer.back')}</Link>
        <Link to="/work/questkeeper" className="btn btn-secondary">{r('footer.next')}</Link>
      </nav>
    </div>
  );
}
