import { Link } from 'react-router';
import { t } from '../content';
import { external, launch } from '../lib/site';
import { CopyEmail } from './CopyEmail';
import { ExtLink } from './ExtLink';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <p className="footer-line">{t('global', 'footer.line')}</p>
        <nav aria-label="Footer">
          <ul className="footer-links">
            <li><Link to="/work">{t('global', 'nav.work')}</Link></li>
            {launch.labHasEntries && <li><Link to="/lab">{t('global', 'nav.lab')}</Link></li>}
            <li><Link to="/about">{t('global', 'nav.about')}</Link></li>
            <li><Link to="/services">{t('global', 'nav.services')}</Link></li>
            <li><Link to="/contact">{t('global', 'nav.contact')}</Link></li>
            <li><Link to="/behind-the-build">{t('global', 'footer.btb')}</Link></li>
          </ul>
        </nav>
        <div className="footer-elsewhere">
          <ul className="footer-links">
            <li><ExtLink href={external.github}>{t('global', 'footer.github')}</ExtLink></li>
            <li><ExtLink href={external.linkedin}>{t('global', 'footer.linkedin')}</ExtLink></li>
          </ul>
          <p className="email-row">
            <a href={`mailto:${external.email}`}>{t('global', 'footer.email')}</a> <CopyEmail />
          </p>
        </div>
        <p className="label">{t('global', 'footer.location')}</p>
        <p className="label">{t('global', 'footer.copyright')}</p>
      </div>
    </footer>
  );
}
