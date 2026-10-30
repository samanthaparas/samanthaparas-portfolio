import { Link } from 'react-router';
import { numbered, t } from '../content';
import { external } from '../lib/site';
import { ContactForm } from '../components/ContactForm';
import { CopyEmail } from '../components/CopyEmail';
import { ExtLink } from '../components/ExtLink';
import { ProjectCards } from '../components/ProjectCards';
import { RoutePicker } from '../components/RoutePicker';
import { StopTag } from '../components/StopTag';
import { Shot } from '../components/Shot';

const h = (key: string) => t('home', key);

const problems = [
  { key: 'outdated', href: '/services#svc-redesign' },
  { key: 'phone', href: '/services#problem-phone' },
  { key: 'nextStep', href: '/services#svc-redesign' },
  { key: 'calls', href: '/services#problem-calls' },
];

const steps = [
  { n: '01', href: '/work/questkeeper#bothered' },
  { n: '02', href: '/work/questkeeper#wrong' },
  { n: '03', href: '/work/can-you-spot-it' },
  { n: '04', href: '/work/nugget-hackathon' },
  { n: '05', href: '/behind-the-build' },
];

/** Marks "useful" with the gold underline that draws once on load (design system: hero underline, 500ms). */
function HeroHeading({ text }: { text: string }) {
  const word = 'useful';
  const i = text.indexOf(word);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="mark">{word}</span>
      {text.slice(i + word.length)}
    </>
  );
}

/** "Text" → Destination: the arrow and label after it become the visible link cue. */
function ProblemItem({ text, href }: { text: string; href: string }) {
  const [quote, answer] = text.split(' → ');
  return (
    <li>
      <Link to={href} className="problem-link">
        <span className="problem-quote">{quote}</span>
        {answer && <span className="problem-answer"> → {answer}</span>}
      </Link>
    </li>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero workspace" aria-labelledby="hero-h1">
        <div className="container hero-in">
          <p className="label">{h('hero.eyebrow')}</p>
          <h1 id="hero-h1">
            <HeroHeading text={h('hero.h1')} />
          </h1>
          <p className="lede">{h('hero.subline')}</p>
          <div className="btn-row">
            <Link to="/work" className="btn btn-primary">{h('hero.cta.work')}</Link>
            <Link to="/services" className="btn btn-secondary">{h('hero.cta.services')}</Link>
          </div>
          <div className="currently">
            <p className="label">{h('currently.label')}</p>
            <ul>
              <li>{h('currently.1')}</li>
              <li>{h('currently.2')}</li>
              <li>
                <span className="only-desktop-inline">{h('currently.3.desktop')}</span>
                <span className="only-phone-inline">{h('currently.3.phone')}</span>
              </li>
              <li>
                <span className="only-desktop-inline">{h('currently.4.desktop')}</span>
                <span className="only-phone-inline">{h('currently.4.phone')}</span>
              </li>
              <li>{h('currently.5')}</li>
            </ul>
          </div>
          <RoutePicker />
        </div>
      </section>

      <section className="section container now" aria-labelledby="now-h2">
        <p className="label">{h('now.eyebrow')}</p>
        <h2 id="now-h2">{h('now.h2')}</h2>
        <p className="measure">{h('now.intro')}</p>
        <div className="now-grid">
          <div className="now-col">
            <h3>{h('now.shipped.h3')}</h3>
            <ul className="now-list">
              {numbered('home', 'now.shipped').map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="now-col now-next">
            <h3>{h('now.next.h3')}</h3>
            <ul className="now-list">
              {numbered('home', 'now.next').map((item) => <li key={item}>{item}</li>)}
            </ul>
            <Link to="#contact" className="btn btn-text">{h('now.link')}</Link>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="work-h2">
        <StopTag href="/work" mode="preview" />
        <div className="section-head">
          <h2 id="work-h2">{h('work.h2')}</h2>
          <Link to="/work" className="btn btn-text">{h('work.seeAll')}</Link>
        </div>
        <ProjectCards />
      </section>

      <section className="section container" aria-labelledby="problems-h2">
        <StopTag href="/services#common-problems" mode="preview" />
        <h2 id="problems-h2">{h('problems.h2')}</h2>
        <p>{h('problems.intro')}</p>
        <ul className="problem-list">
          {problems.map((p) => (
            <ProblemItem key={p.key} text={h(`problems.item.${p.key}`)} href={p.href} />
          ))}
        </ul>
        <Link to="/services#common-problems" className="btn btn-text">{h('problems.all')}</Link>
      </section>

      <section className="section container" aria-labelledby="how-h2">
        <h2 id="how-h2">{h('howIWork.h2')}</h2>
        <p>{h('howIWork.intro')}</p>
        <ol className="how-list">
          {steps.map((s) => (
            <li key={s.n}>
              <h3>{h(`howIWork.${s.n}.title`)}</h3>
              <p>{h(`howIWork.${s.n}.text`)}</p>
              <Link to={s.href} className="btn btn-text">{h(`howIWork.${s.n}.link`)}</Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="section container teaser-pair">
        <section className="teaser" aria-labelledby="btb-h2">
          <StopTag href="/behind-the-build" mode="preview" />
          <p className="label">{h('btb.eyebrow')}</p>
          <h2 id="btb-h2">{h('btb.h2')}</h2>
          <p className="measure">{h('btb.text')}</p>
          <Link to="/behind-the-build" className="btn btn-text">{h('btb.link')}</Link>
        </section>

        <section className="teaser with-photo" aria-labelledby="about-h2">
          <div className="with-photo-text">
            <StopTag href="/about" mode="preview" />
            <StopTag href="/about#experience" mode="preview" />
            <p className="label">{h('about.eyebrow')}</p>
            <h2 id="about-h2">{h('about.h2')}</h2>
            <p className="measure">{h('about.text.1')}</p>
            <p className="measure">{h('about.text.2')}</p>
            <Link to="/about" className="btn btn-text">{h('about.link')}</Link>
          </div>
          <Shot altKey="photo.home" base="/images/me/home" widths={[208, 416]} width={416} height={518} sizes="180px" className="portrait portrait-sm" />
        </section>
      </div>

      <section className="section container cta-band" aria-labelledby="cta-h2">
        <h2 id="cta-h2">{h('cta.h2')}</h2>
        <p>{h('cta.text')}</p>
        <div className="btn-row">
          <Link to="/services" className="btn btn-secondary">{h('cta.services')}</Link>
          <Link to="/contact" state={{ reason: 'build' }} className="btn btn-primary">{h('cta.contact')}</Link>
        </div>
      </section>

      <section className="section container contact-section" aria-labelledby="contact-h2" id="contact">
        <div>
          <StopTag href="/contact" mode="preview" />
          <h2 id="contact-h2">{h('contact.h2')}</h2>
          <p>{h('contact.text')}</p>
          <p className="email-row">
            <a href={`mailto:${external.email}`} className="mono">{h('contact.email')}</a>{' '}
            <CopyEmail />
          </p>
          <p className="inline-links">
            <ExtLink href={external.linkedin}>{h('contact.linkedin')}</ExtLink>
            {' · '}
            <ExtLink href={external.github}>{h('contact.github')}</ExtLink>
          </p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
