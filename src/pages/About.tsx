import { Link } from 'react-router';
import { t } from '../content';
import { external } from '../lib/site';
import { ExtLink } from '../components/ExtLink';
import { StopTag } from '../components/StopTag';
import { Shot } from '../components/Shot';

const a = (key: string) => t('about', key);

const habits = ['notice', 'ask', 'figure', 'build', 'explain'];
const roles = ['nugget', 'tripleten', 'karbach', 'pf', 'usmc'];

function has(key: string) {
  try {
    t('about', key);
    return true;
  } catch {
    return false;
  }
}

/** "Notice: I notice…" → bold label, then the sentence. */
function Habit({ text }: { text: string }) {
  const i = text.indexOf(': ');
  return (
    <li>
      <strong>{text.slice(0, i)}</strong>
      <span>{text.slice(i + 2)}</span>
    </li>
  );
}

export default function About() {
  return (
    <div className="page">
      <section className="container page-head with-photo photo-left" aria-labelledby="about-h1">
        <Shot altKey="photo.about" base="/images/me/about" widths={[320, 640]} width={640} height={1017} sizes="240px" className="portrait portrait-lg" eager />
        <div className="with-photo-text">
          <StopTag href="/about" mode="stop" />
          <p className="label">{a('intro.eyebrow')}</p>
          <h1 id="about-h1">{a('intro.h1')}</h1>
          <div className="prose">
            <p>{a('intro.p1')}</p>
            <p>{a('intro.p2')}</p>
            <p>{a('intro.p3')}</p>
          </div>
          <Link to="#experience" className="btn btn-secondary">{a('intro.jump')}</Link>
        </div>
      </section>

      <section className="section container three-up" aria-label={`${a('enjoy.h3')}, ${a('devrel.h3')}, ${a('smallbiz.h3')}`}>
        <div>
          <h2 className="h3">{a('enjoy.h3')}</h2>
          <p>{a('enjoy.p')}</p>
        </div>
        <div>
          <h2 className="h3">{a('devrel.h3')}</h2>
          <p>{a('devrel.p')}</p>
          <Link to="/behind-the-build" className="btn btn-text">{a('devrel.link')}</Link>
        </div>
        <div>
          <h2 className="h3">{a('smallbiz.h3')}</h2>
          <p>{a('smallbiz.p')}</p>
          <Link to="/services" className="btn btn-text">{a('smallbiz.link')}</Link>
        </div>
      </section>

      <section className="section container" aria-labelledby="work-h2">
        <h2 id="work-h2">{a('work.h2')}</h2>
        <ul className="habits">{habits.map((h) => <Habit key={h} text={a(`work.${h}`)} />)}</ul>
      </section>

      <section className="section container" id="experience" aria-labelledby="exp-h2">
        <StopTag href="/about#experience" mode="stop" />
        <h2 id="exp-h2">{a('exp.h2')}</h2>
        <table className="experience">
          <thead>
            <tr>
              <th scope="col">{a('exp.col.when')}</th>
              <th scope="col">{a('exp.col.role')}</th>
              <th scope="col">{a('exp.col.carried')}</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r}>
                <td className="mono when">{a(`exp.${r}.when`)}</td>
                <th scope="row" className="role">
                  <span className="role-title">{a(`exp.${r}.role`)}</span>
                  <span className="role-detail">{a(`exp.${r}.detail`)}</span>
                  {r === 'tripleten' && (
                    <ExtLink href={external.tripletenCertificate} className="role-link">{a('exp.tripleten.certificate')}</ExtLink>
                  )}
                </th>
                <td className="carried">{has(`exp.${r}.carried`) ? a(`exp.${r}.carried`) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section container" aria-labelledby="outside-h2">
        <h2 id="outside-h2">{a('outside.h2')}</h2>
        <div className="prose">
          <p>{a('outside.p1')}</p>
          <p>{a('outside.p2')}</p>
        </div>
      </section>

      <section className="section container cta-band" aria-label={a('cta.text')}>
        <p className="cta-q">{a('cta.text')}</p>
        <div className="btn-row">
          <Link to="/work" className="btn btn-secondary">{a('cta.work')}</Link>
          <Link to="/contact" className="btn btn-primary">{a('cta.contact')}</Link>
        </div>
      </section>
    </div>
  );
}
