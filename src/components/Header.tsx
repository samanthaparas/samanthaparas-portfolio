import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { fill, t } from '../content';
import { useAudience } from '../lib/audience';
import { launch } from '../lib/site';
import { useJump } from './JumpTo';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  to: string;
  key: string;
}

const navItems: NavItem[] = [
  { to: '/work', key: 'nav.work' },
  ...(launch.labHasEntries ? [{ to: '/lab', key: 'nav.lab' }] : []),
  { to: '/about', key: 'nav.about' },
  { to: '/services', key: 'nav.services' },
  { to: '/contact', key: 'nav.contact' },
];

/** First route stop that lives on this nav item's page (e.g. /about#experience counts for About). */
function useStepFor(to: string): number | null {
  const { stops } = useAudience();
  const i = stops.findIndex((s) => s.href?.split('#')[0] === to);
  return i === -1 ? null : i + 1;
}

function NavLinkWithStep({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const step = useStepFor(item.to);
  return (
    <NavLink to={item.to} onClick={onNavigate}>
      {t('global', item.key)}
      {step !== null && (
        <span className="step" role="img" aria-label={fill(t('global', 'route.badge.accessible'), { n: step })}>
          {step}
        </span>
      )}
    </NavLink>
  );
}

function useIsMac(): boolean {
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  return mac;
}

export function Header() {
  const jump = useJump();
  const isMac = useIsMac();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Close the phone menu whenever the page changes.
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  return (
    <header className="site-header">
      <div className="container header-in">
        <Link to="/" className="wordmark">
          {t('global', 'header.wordmark')}
        </Link>

        <nav aria-label="Main" className="only-desktop">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLinkWithStep item={item} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-tools only-desktop">
          <button
            type="button"
            className="search-btn"
            aria-label={t('global', 'jump.button.accessibleName')}
            onClick={(e) => jump.open('desktop', e.currentTarget)}
          >
            {t('global', isMac ? 'jump.button.mac' : 'jump.button.other')}
          </button>
          <ThemeToggle />
        </div>

        <div className="header-tools only-phone">
          <Link to="/contact" className="btn btn-secondary btn-sm">
            {t('global', 'phone.contact')}
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="btn btn-secondary btn-sm"
            aria-expanded={menuOpen}
            aria-controls="phone-menu"
            onClick={() => setMenuOpen(true)}
          >
            {t('global', 'phone.menu')}
          </button>
        </div>
      </div>

      {menuOpen && (
        <PhoneMenu
          onClose={() => {
            setMenuOpen(false);
            requestAnimationFrame(() => menuButton.current?.focus());
          }}
          onSearch={() => {
            setMenuOpen(false);
            jump.open('phone', menuButton.current);
          }}
        />
      )}
    </header>
  );
}

function PhoneMenu({ onClose, onSearch }: { onClose: () => void; onSearch: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      id="phone-menu"
      className="phone-menu"
      aria-label={t('global', 'phone.menu')}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="phone-menu-head">
        <span className="wordmark">{t('global', 'header.wordmark')}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
          {t('global', 'phone.menu.close')}
        </button>
      </div>
      <nav aria-label="Main">
        <ul className="phone-menu-links">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLinkWithStep item={item} onNavigate={onClose} />
            </li>
          ))}
          <li>
            <NavLink to="/behind-the-build" onClick={onClose}>
              {t('global', 'footer.btb')}
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="phone-menu-tools">
        <button type="button" className="btn btn-secondary" onClick={onSearch}>
          {t('global', 'jump.dialog.phone')}
        </button>
        <ThemeToggle />
      </div>
    </dialog>
  );
}
