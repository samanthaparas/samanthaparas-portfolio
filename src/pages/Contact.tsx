import { useLocation } from 'react-router';
import { t } from '../content';
import { external } from '../lib/site';
import { ContactForm } from '../components/ContactForm';
import { CopyEmail } from '../components/CopyEmail';
import { ExtLink } from '../components/ExtLink';
import { StopTag } from '../components/StopTag';

export default function Contact() {
  const state = useLocation().state as { reason?: 'build' } | null;
  return (
    <div className="container page contact-page">
      <div>
        <StopTag href="/contact" mode="stop" />
        <h1>{t('global', 'contact.h1')}</h1>
        <p className="lede">{t('global', 'contact.lede')}</p>
        <p className="email-row">
          <a href={`mailto:${external.email}`} className="mono">{external.email}</a>{' '}
          <CopyEmail labelKey="contact.copyEmail" />
        </p>
        <p className="inline-links">
          <ExtLink href={external.linkedin}>{t('global', 'footer.linkedin')}</ExtLink>
          {' · '}
          <ExtLink href={external.github}>{t('global', 'footer.github')}</ExtLink>
        </p>
        <p className="label">{t('global', 'contact.location')}</p>
      </div>
      <ContactForm key={state?.reason ?? 'none'} ctaReason={state?.reason} />
    </div>
  );
}
