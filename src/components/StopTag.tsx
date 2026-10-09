import { Link } from 'react-router';
import { t, fill } from '../content';
import { stopIndex, useAudience } from '../lib/audience';

/**
 * Route stop tag. `stop` marks the destination itself ("Stop 1 of 3 · Next: Experience →");
 * `preview` marks a homepage section that summarizes a stop living elsewhere. Renders nothing
 * without a route, or when `href` isn't one of the route's stops. All text comes from route data.
 */
export function StopTag({ href, mode }: { href: string; mode: 'stop' | 'preview' }) {
  const { stops } = useAudience();
  const i = stopIndex(stops, href);
  if (i === -1) return null;
  const n = i + 1;
  const total = stops.length;

  if (mode === 'preview') {
    const text = fill(t('global', 'route.tag.preview'), { n, total, label: stops[i].label });
    return (
      <p className="stop-tag">
        <Link to={href}>{text}</Link>
      </p>
    );
  }

  const next = stops[i + 1];
  if (!next) {
    return <p className="stop-tag">{fill(t('global', 'route.tag.last'), { n, total })}</p>;
  }
  if (!next.href) {
    return <p className="stop-tag">{fill(t('global', 'route.tag.beforeFallback'), { n, total })}</p>;
  }
  return (
    <p className="stop-tag">
      <Link to={next.href}>{fill(t('global', 'route.tag.stop'), { n, total, 'next label': next.label })}</Link>
    </p>
  );
}
