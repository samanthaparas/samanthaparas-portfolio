import { Link } from 'react-router';
import { t } from '../content';
import { external } from '../lib/site';
import { ExtLink } from './ExtLink';
import { Labeled, Origin, Status } from './bits';
import { Shot } from './Shot';

/**
 * The project spec sheets, shared by Home and Work. Work overrides a few strings
 * (dates on the type line, the fuller stack and summary); everything else is the Home copy.
 */
export function ProjectCards({ onWorkPage = false }: { onWorkPage?: boolean }) {
  const pick = (key: string) => {
    if (onWorkPage) {
      try {
        return t('work', key);
      } catch {
        /* no Work-specific string: fall back to Home */
      }
    }
    return t('home', key);
  };
  const H = onWorkPage ? 'h2' : 'h3';

  return (
    <div className="cards">
      <article className="card card-featured">
        <div className="card-media">
          <Shot altKey="img.home" base="/images/qk/home-tavern" widths={[640, 1280]} width={1280} height={900} sizes="(min-width: 860px) 480px, calc(100vw - 80px)" />
        </div>
        <div className="card-body">
          <p className="card-type label">
            {pick('card.questkeeper.type')} <Status text={t('home', 'card.questkeeper.status')} />
          </p>
          <H className="card-name">
            <Link to="/work/questkeeper">{t('home', 'card.questkeeper.name')}</Link>
          </H>
          <Origin text={t('home', 'card.questkeeper.origin')} />
          <ul className="card-meta">
            <li><Labeled text={t('home', 'card.questkeeper.role')} /></li>
            <li><Labeled text={pick('card.questkeeper.stack')} /></li>
            <li><Labeled text={t('home', 'card.questkeeper.evidence')} /></li>
          </ul>
          <p className="versions mono">{t('home', 'card.questkeeper.versions')}</p>
          <div className="btn-row">
            <Link to="/work/questkeeper" className="btn btn-primary">
              {t('home', 'card.questkeeper.caseStudy')}
            </Link>
            <ExtLink href={external.questkeeperLive} className="btn btn-secondary">
              {t('home', 'card.questkeeper.live')}
            </ExtLink>
            <ExtLink href={external.questkeeperRepo} className="btn btn-text">
              {t('home', 'card.questkeeper.source')}
            </ExtLink>
          </div>
        </div>
      </article>

      <article className="card">
        <Shot altKey="img.cysiTitle" base="/images/cysi/title" widths={[640, 1280]} width={1280} height={900} sizes="(min-width: 860px) 420px, calc(100vw - 80px)" />
        <p className="card-type label">
          {pick('card.cysi.type')} <Status text={t('home', 'card.cysi.status')} />
        </p>
        <H className="card-name">
          <Link to="/work/can-you-spot-it">{t('home', 'card.cysi.name')}</Link>
        </H>
        <Origin text={t('home', 'card.cysi.origin')} />
        <p>{t('home', 'card.cysi.summary')}</p>
        <ul className="card-meta">
          <li><Labeled text={t('home', 'card.cysi.role')} /></li>
          <li><Labeled text={t('home', 'card.cysi.stack')} /></li>
          <li><Labeled text={t('home', 'card.cysi.evidence')} /></li>
        </ul>
        <div className="btn-row">
          <ExtLink href={external.cysiLive} className="btn btn-secondary">
            {t('home', 'card.cysi.play')}
          </ExtLink>
          <Link to="/work/can-you-spot-it" className="btn btn-text">
            {t('home', 'card.cysi.note')}
          </Link>
        </div>
      </article>

      <article className="card">
        <p className="card-type label">
          {pick('card.nugget.type')} <Status text={t('home', 'card.nugget.status')} />
        </p>
        <H className="card-name">
          <Link to="/work/nugget-hackathon">{t('home', 'card.nugget.name')}</Link>
        </H>
        {onWorkPage ? (
          <p>{t('work', 'card.nugget.summary')}</p>
        ) : (
          <>
            <Origin text={t('home', 'card.nugget.origin')} />
            <p>{t('home', 'card.nugget.summary')}</p>
          </>
        )}
        <ul className="card-meta">
          <li><Labeled text={t('home', 'card.nugget.role')} /></li>
          <li><Labeled text={t('home', 'card.nugget.stack')} /></li>
          <li><Labeled text={t('home', 'card.nugget.evidence')} /></li>
        </ul>
        <Link to="/work/nugget-hackathon" className="btn btn-text">
          {t('home', 'card.nugget.note')}
        </Link>
      </article>

      {onWorkPage && (
        <>
          {/* Work page only: smaller projects without a case study yet. */}
          <article className="card">
            <p className="card-type label">
              {t('work', 'card.nearmora.type')} <Status text={t('work', 'card.nearmora.status')} />
            </p>
            <H className="card-name">{t('work', 'card.nearmora.name')}</H>
            <p>{t('work', 'card.nearmora.summary')}</p>
            <ul className="card-meta">
              <li><Labeled text={t('work', 'card.nearmora.role')} /></li>
              <li><Labeled text={t('work', 'card.nearmora.stack')} /></li>
              <li><Labeled text={t('work', 'card.nearmora.evidence')} /></li>
            </ul>
            <ExtLink href={external.nearmoraRepo} className="btn btn-text">
              {t('work', 'card.nearmora.source')}
            </ExtLink>
          </article>

          <article className="card">
            <p className="card-type label">
              {t('work', 'card.voxgig.type')} <Status text={t('work', 'card.voxgig.status')} />
            </p>
            <H className="card-name">{t('work', 'card.voxgig.name')}</H>
            <Origin text={t('work', 'card.voxgig.origin')} />
            <p>{t('work', 'card.voxgig.summary')}</p>
            <ul className="card-meta">
              <li><Labeled text={t('work', 'card.voxgig.role')} /></li>
              <li><Labeled text={t('work', 'card.voxgig.stack')} /></li>
              <li><Labeled text={t('work', 'card.voxgig.evidence')} /></li>
            </ul>
            <ExtLink href={external.jostracaReview} className="btn btn-text">
              {t('work', 'card.voxgig.review')}
            </ExtLink>
          </article>
        </>
      )}

      <article className="card card-wide">
        <p className="card-type label">
          {pick('card.reckoning.type')} <Status text={t('home', 'card.reckoning.status')} />
        </p>
        <H className="card-name">
          <Link to="/work/reckoning-tattoo">{t('home', 'card.reckoning.name')}</Link>
        </H>
        <Origin text={t('home', 'card.reckoning.origin')} />
        <p>{t('home', 'card.reckoning.summary')}</p>
        <ul className="card-meta">
          <li><Labeled text={t('home', 'card.reckoning.role')} /></li>
          <li><Labeled text={t('home', 'card.reckoning.stack')} /></li>
          <li><Labeled text={t('home', 'card.reckoning.evidence')} /></li>
        </ul>
        <Link to="/work/reckoning-tattoo" className="btn btn-text">
          {t('home', 'card.reckoning.note')}
        </Link>
      </article>
    </div>
  );
}
