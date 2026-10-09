import { Link } from 'react-router';
import { t } from '../content';
import { useJump } from '../components/JumpTo';

export default function NotFound() {
  const jump = useJump();
  const [work, contact, jumpLabel] = t('global', 'notFound.links').split(' · ');
  return (
    <div className="container page not-found">
      <h1>{t('global', 'notFound.h1')}</h1>
      <p className="lede">{t('global', 'notFound.p')}</p>
      <Link to="/" className="btn btn-primary">{t('global', 'notFound.cta')}</Link>
      <p>
        {t('global', 'notFound.or')} <Link to="/work">{work}</Link> · <Link to="/contact">{contact}</Link> ·{' '}
        <button type="button" className="link-btn" onClick={(e) => jump.open('desktop', e.currentTarget)}>
          {jumpLabel}
        </button>
      </p>
    </div>
  );
}
