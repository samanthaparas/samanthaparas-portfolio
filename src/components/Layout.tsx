import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { t } from '../content';
import { AudienceProvider, useAudience } from '../lib/audience';
import { metaFor } from '../lib/pages';
import { Footer } from './Footer';
import { Header } from './Header';
import { JumpProvider } from './JumpTo';

export function Layout() {
  return (
    <AudienceProvider>
      <JumpProvider>
        <a className="skip-link" href="#main">
          {t('global', 'a11y.skip')}
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
        <RouteAnnouncer />
        <NavigationEffects />
      </JumpProvider>
    </AudienceProvider>
  );
}

/** Speaks route picks and clears from any page (aria-live, polite). */
function RouteAnnouncer() {
  const { announcement } = useAudience();
  return (
    <div className="visually-hidden" aria-live="polite">
      {announcement}
    </div>
  );
}

/**
 * After each navigation: update the title and description, then land on the #section if there is
 * one (deferred build check #1; the header offset comes from scroll-margin-top in CSS) and mark it
 * so the Services card can show its highlight ring (check #4). Without a hash, start at the top
 * and move focus to the page heading so screen readers hear the new page.
 */
function NavigationEffects() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    const meta = metaFor(pathname);
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);

    document.querySelectorAll('[data-landed]').forEach((el) => el.removeAttribute('data-landed'));

    const isFirst = first.current;
    first.current = false;

    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.setAttribute('data-landed', '');
        // Instant, not smooth: a smooth scroll can be cancelled by the re-render that closes a menu.
        el.scrollIntoView({ block: 'start', behavior: 'instant' });
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
      return;
    }
    if (isFirst) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const h1 = document.querySelector<HTMLElement>('main h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  return null;
}
