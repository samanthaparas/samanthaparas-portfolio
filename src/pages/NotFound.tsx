import { Link, useNavigate } from 'react-router';
import { t } from '../content';
import { useJump } from '../components/JumpTo';
import { pages } from '../lib/pages';

export default function NotFound() {
  const jump = useJump();
  const navigate = useNavigate();
  const [work, contact, jumpLabel] = t('global', 'notFound.links').split(' · ');

  // Reroll: off to a random real page (never the 404 itself).
  const reroll = () => {
    const pick = pages[Math.floor(Math.random() * pages.length)];
    navigate(pick.path);
  };

  return (
    <div className="container page not-found">
      <span className="nat1" aria-hidden="true">1</span>
      <h1>{t('global', 'notFound.h1')}</h1>
      <p className="lede">{t('global', 'notFound.p')}</p>
      <div className="btn-row">
        <Link to="/" className="btn btn-primary">{t('global', 'notFound.cta')}</Link>
        <button type="button" className="btn btn-text" onClick={reroll}>
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
