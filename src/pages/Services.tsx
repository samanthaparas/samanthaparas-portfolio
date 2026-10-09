import { Link } from 'react-router';
import { t } from '../content';
import { StopTag } from '../components/StopTag';

const s = (key: string) => t('services', key);

/** Problem rows → the service cards that usually fix them (services.md table). */
const problems: { key: string; id: string; links: string[] }[] = [
  { key: 'outdated', id: 'problem-outdated', links: ['svc-redesign'] },
  { key: 'phone', id: 'problem-phone', links: ['svc-cleanup', 'svc-redesign'] },
  { key: 'nextStep', id: 'problem-next-step', links: ['svc-redesign'] },
  { key: 'calls', id: 'problem-calls', links: ['svc-redesign', 'svc-site'] },
  { key: 'manual', id: 'problem-manual', links: ['svc-app'] },
  { key: 'frustrating', id: 'problem-frustrating', links: ['svc-cleanup'] },
  { key: 'noSite', id: 'problem-no-site', links: ['svc-site'] },
];

const services: { key: string; id: string }[] = [
  { key: 'site', id: 'svc-site' },
  { key: 'redesign', id: 'svc-redesign' },
  { key: 'app', id: 'svc-app' },
  { key: 'frontend', id: 'svc-frontend' },
  { key: 'api', id: 'svc-api' },
  { key: 'a11y', id: 'svc-a11y' },
  { key: 'seo', id: 'svc-seo' },
  { key: 'cleanup', id: 'svc-cleanup' },
];

function has(key: string) {
  try {
    t('services', key);
    return true;
  } catch {
    return false;
  }
}

export default function Services() {
  return (
    <div className="page">
      <section className="container page-head" aria-labelledby="services-h1">
        <p className="label">{s('hero.eyebrow')}</p>
        <h1 id="services-h1">{s('hero.h1')}</h1>
        <p className="lede">{s('hero.text.1')}</p>
        <p className="measure">{s('hero.text.2')}</p>
        <div className="btn-row">
          <Link to="/contact" state={{ reason: 'build' }} className="btn btn-primary">{s('hero.cta.contact')}</Link>
          <Link to="#proof" className="btn btn-secondary">{s('hero.cta.proof')}</Link>
        </div>
      </section>

      <section className="section container" id="common-problems" aria-labelledby="problems-h2">
        <StopTag href="/services#common-problems" mode="stop" />
        <h2 id="problems-h2">{s('problems.h2')}</h2>
        <p>{s('problems.intro')}</p>
        <ul className="problem-rows">
          {problems.map((p) => (
            <li key={p.key} id={p.id} className="problem-row">
              <p className="problem-quote">{s(`problem.${p.key}.quote`)}</p>
              <p>{s(`problem.${p.key}.answer`)}</p>
              <p className="problem-links">
                {p.links.map((target, i) => (
                  <span key={target}>
                    {i > 0 && <> {s(`problem.${p.key}.or`)} </>}
                    <Link to={`#${target}`}>{s(`problem.${p.key}.link.${i + 1}`)}</Link>
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section container" id="svc" aria-labelledby="svc-h2">
        <StopTag href="/services#svc" mode="stop" />
        <h2 id="svc-h2">{s('svc.h2')}</h2>
        <div className="svc-grid">
          {services.map((v) => (
            <article key={v.id} id={v.id} className="svc-card">
              <h3>{s(`svc.${v.key}.title`)}</h3>
              <p>{s(`svc.${v.key}.text`)}</p>
              {has(`svc.${v.key}.tech`) && <p className="tech">{s(`svc.${v.key}.tech`)}</p>}
              {has(`svc.${v.key}.tech.1`) && <p className="tech">{s(`svc.${v.key}.tech.1`)}</p>}
              {has(`svc.${v.key}.tech.2`) && <p className="tech">{s(`svc.${v.key}.tech.2`)}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="section container" id="proof" aria-labelledby="proof-h2">
        <h2 id="proof-h2">{s('proof.h2')}</h2>
        <p>{s('proof.intro')}</p>
        <ul className="proof-list">
          <li>
            <p>{s('proof.questkeeper')}</p>
            <Link to="/work/questkeeper" className="btn btn-text">{s('proof.questkeeper.link')}</Link>
          </li>
          <li>
            <p>{s('proof.nugget')}</p>
            <Link to="/work/nugget-hackathon" className="btn btn-text">{s('proof.nugget.link')}</Link>
          </li>
        </ul>
      </section>

      <section className="section container" id="process" aria-labelledby="process-h2">
        <h2 id="process-h2">{s('process.h2')}</h2>
        <ol className="process">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <li key={n}>
              <h3>{s(`process.step.${n}`)}</h3>
              <p>{s(`process.step.${n}.description`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section container cta-band" aria-labelledby="svc-cta-h2">
        <h2 id="svc-cta-h2">{s('cta.h2')}</h2>
        <p>{s('cta.text')}</p>
        <Link to="/contact" state={{ reason: 'build' }} className="btn btn-primary">{s('cta.button')}</Link>
      </section>
    </div>
  );
}
