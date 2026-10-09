import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { t, fill } from '../content';
import { launch } from './site';

export type RouteId = 'hire' | 'build' | 'snoop';

export interface Stop {
  label: string;
  /** Destination path, with an optional #section. Absent for a fallback stop (plain text, no link). */
  href?: string;
}

const routeNames: Record<RouteId, string> = { hire: 'Hiring', build: 'Business', snoop: 'Snooping' };

/** Route data. Stops whose page doesn't exist drop out; numbers and announcements recompute. */
export function stopsFor(route: RouteId): Stop[] {
  const stops: (Stop | false)[] =
    route === 'hire'
      ? [
          { label: 'Work', href: '/work' },
          { label: 'Experience', href: '/about#experience' },
          launch.resumePdf && { label: 'Résumé', href: '/resume.pdf' },
          { label: 'Contact', href: '/contact' },
        ]
      : route === 'build'
        ? [
            { label: 'Common problems', href: '/services#common-problems' },
            { label: 'Services', href: '/services#svc' },
            { label: 'Work', href: '/work' },
            { label: 'Contact', href: '/contact' },
          ]
        : [
            launch.labHasEntries && { label: 'Lab', href: '/lab' },
            { label: 'Behind the Build', href: '/behind-the-build' },
            { label: 'About', href: '/about' },
            launch.easterEggsPage
              ? { label: 'Easter eggs', href: '/easter-eggs' }
              : { label: t('global', 'route.fallback.eggs') },
          ];
  return stops.filter((s): s is Stop => Boolean(s));
}

export function announcementFor(route: RouteId): string {
  return fill(t('global', 'route.announce'), {
    'Route name': routeNames[route],
    // The fallback label ends with its own period; don't double it.
    'stops joined by ", "': stopsFor(route)
      .map((s) => s.label)
      .join(', ')
      .replace(/\.$/, ''),
  });
}

/** The Contact reason a route preselects (IMPLEMENTATION-MAP "Contact reason preselection"). */
export function reasonForRoute(route: RouteId | null): 'hire' | 'build' | '' {
  if (route === 'hire') return 'hire';
  if (route === 'build') return 'build';
  return '';
}

interface AudienceState {
  route: RouteId | null;
  stops: Stop[];
  announcement: string;
  pick: (route: RouteId) => void;
  clear: () => void;
}

const AudienceContext = createContext<AudienceState | null>(null);
const KEY = 'audience-route';

function readStored(): RouteId | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v === 'hire' || v === 'build' || v === 'snoop' ? v : null;
  } catch {
    return null;
  }
}

export function AudienceProvider({ children }: { children: ReactNode }) {
  // Starts empty so the prerendered HTML and the first client render match; the stored route
  // (kept for the session, across pages) is applied right after hydration.
  const [route, setRoute] = useState<RouteId | null>(null);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    setRoute(readStored());
  }, []);

  const pick = useCallback((next: RouteId) => {
    setRoute(next);
    setAnnouncement(announcementFor(next));
    try {
      sessionStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: the route still works for this page */
    }
  }, []);

  const clear = useCallback(() => {
    setRoute(null);
    setAnnouncement(t('global', 'route.announce.cleared'));
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AudienceState>(
    () => ({ route, stops: route ? stopsFor(route) : [], announcement, pick, clear }),
    [route, announcement, pick, clear],
  );
  return <AudienceContext.Provider value={value}>{children}</AudienceContext.Provider>;
}

export function useAudience(): AudienceState {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error('useAudience outside AudienceProvider');
  return ctx;
}

/** Index of the stop whose href matches exactly, or -1. */
export function stopIndex(stops: Stop[], href: string): number {
  return stops.findIndex((s) => s.href === href);
}
