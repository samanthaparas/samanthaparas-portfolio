import { Link } from 'react-router';
import { maybe, t } from '../content';
import { StopTag } from '../components/StopTag';

const e = (key: string) => t('eggs', key);

/** Hints, not answers. Each hint appears only for an egg that exists. */
export default function EasterEggs() {
  const konami = maybe('eggs', 'eggs.hint.konami');
  return (
    <div className="container page eggs-page">
      <header className="page-head">
        <StopTag href="/easter-eggs" mode="stop" />
        <h1>{e('eggs.h1')}</h1>
        <p className="lede">{e('eggs.intro')}</p>
      </header>
      <ul className="eggs">
        <li className="only-desktop">{e('eggs.hint.console')}</li>
        <li>{e('eggs.hint.roll')}</li>
        <li>{e('eggs.hint.404')}</li>
        {konami && <li className="only-desktop">{konami}</li>}
      </ul>
      <Link to="/" className="btn btn-secondary">{e('eggs.back')}</Link>
    </div>
  );
}
