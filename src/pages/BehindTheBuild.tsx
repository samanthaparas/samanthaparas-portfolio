import { useState } from 'react';
import { Link } from 'react-router';
import { fill, t } from '../content';
import { external } from '../lib/site';
import { ExtLink } from '../components/ExtLink';
import { StopTag } from '../components/StopTag';

const b = (key: string) => t('btb', key);

type PathId = '1' | '2' | '3';
type Selection = PathId | 'all';

const nodes: Record<PathId, string[]> = {
  '1': ['n1', 'n2', 'n3', 'n4'],
  '2': ['n1', 'n2', 'n3', 'n4', 'n5'],
  '3': ['n1', 'n2', 'n3'],
};

/** "Title · detail" → two parts. */
function split(text: string): [string, string] {
  const i = text.indexOf(' · ');
  return i === -1 ? [text, ''] : [text.slice(0, i), text.slice(i + 3)];
}

function PathDiagram({ id, active }: { id: PathId; active: boolean }) {
  return (
    <div className={`diagram-path${active ? ' is-active' : ''}`}>
      <p className="label">{b(`diagram.p${id}.label`)}</p>
      <ol className="diagram-nodes">
        {nodes[id].map((n) => {
          const [title, detail] = split(b(`diagram.p${id}.${n}`));
          return (
            <li key={n} className="diagram-node">
              <strong>{title}</strong>
              {detail && <span>{detail}</span>}
            </li>
          );
        })}
      </ol>
      {id === '3' && (
        <div className="diagram-secret">
          <strong>{split(b('diagram.p3.table'))[0]}</strong>
          <span>{split(b('diagram.p3.table'))[1]}</span>
          <span className="label">{b('diagram.p3.tableNote')}</span>
        </div>
      )}
    </div>
  );
}

export default function BehindTheBuild() {
  const [sel, setSel] = useState<Selection>('1');
  const shown: PathId[] = sel === 'all' ? ['1', '2', '3'] : [sel];
  const selName = sel === 'all' ? b('paths.button.all') : b(`paths.button.${sel}`);

  return (
    <div className="page">
      <section className="container page-head workspace-head" aria-labelledby="btb-h1">
        <StopTag href="/behind-the-build" mode="stop" />
        <p className="label">{b('header.eyebrow')}</p>
        <h1 id="btb-h1">{b('header.h1')}</h1>
        <div className="short">
          <p className="label">{b('short.label')}</p>
          <p>{b('short.intro')}</p>
          <ol>
            <li>{b('short.1')}</li>
            <li>{b('short.2')}</li>
            <li>{b('short.3')}</li>
          </ol>
        </div>
      </section>

      <section className="section container" aria-label={b('panel.all.heading')}>
        <div className="seg" role="group" aria-label={b('panel.all.heading')}>
          {(['1', '2', '3'] as PathId[]).map((id) => (
            <button key={id} type="button" aria-pressed={sel === id} onClick={() => setSel(id)}>
              <span className="only-desktop-inline">{b(`paths.button.${id}`)}</span>
              <span className="only-phone-inline">{b(`paths.button.${id}.phone`)}</span>
            </button>
          ))}
          <button type="button" className="only-desktop-inline" aria-pressed={sel === 'all'} onClick={() => setSel('all')}>
            {b('paths.button.all')}
          </button>
        </div>

        <div className="btb-grid">
          {/* Desktop: the whole diagram, with the selected path highlighted. Arrows are decorative. */}
          <div className="diagram only-desktop" aria-hidden="true">
            {(['1', '2', '3'] as PathId[]).map((id) => (
              <PathDiagram key={id} id={id} active={sel === 'all' || sel === id} />
            ))}
          </div>

          <div className="panel" aria-live="polite">
            <p className="label">{fill(b('panel.showing'), { 'path name': selName })}</p>
            {sel === 'all' ? (
              <>
                <h2>{b('panel.all.heading')}</h2>
                <p>{b('panel.all.body')}</p>
              </>
            ) : (
              <>
                <h2>{b(`panel.${sel}.heading`)}</h2>
                {/* Phone: the selected path's steps, then its short note. */}
                <div className="only-phone">
                  {shown.map((id) => (
                    <PathDiagram key={id} id={id} active />
                  ))}
                  <p>{b(`panel.${sel}.phoneNote`)}</p>
                </div>
                <p className="only-desktop">{b(`panel.${sel}.body`)}</p>
                <p className="tech mono">{b(`panel.${sel}.tech`)}</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="why-h2">
        <h2 id="why-h2">{b('why.h2')}</h2>
        <p className="measure">{b('why.p')}</p>
      </section>

      <section className="section container" aria-labelledby="checked-h2">
        <h2 id="checked-h2">{b('checked.h2')}</h2>
        <p className="measure">{b('checked.p')}</p>
      </section>

      <section className="section container" aria-labelledby="players-h2">
        <h2 id="players-h2">{b('players.h2')}</h2>
        <p className="measure">{b('players.p')}</p>
        <figure className="shot">
          <img
            src="/images/questkeeper-dm-table.jpg"
            width={1600}
            height={1125}
            loading="lazy"
            decoding="async"
            alt={b('players.image.alt')}
          />
          <figcaption>{b('players.image.caption')}</figcaption>
        </figure>
      </section>

      <section className="section container btn-row">
        <Link to="/work/questkeeper" className="btn btn-primary">{b('links.caseStudy')}</Link>
        <ExtLink href={external.questkeeperRepo} className="btn btn-secondary">{b('links.source')}</ExtLink>
      </section>
    </div>
  );
}
