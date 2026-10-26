import { t } from '../content';
import { useAudience, type RouteId } from '../lib/audience';

const options: RouteId[] = ['hire', 'build', 'snoop'];

/** "What brings you here?" Adds step badges and stop tags only; nothing is hidden or reordered. */
export function RoutePicker() {
  const { route, stops, pick, clear } = useAudience();
  return (
    <div className="router" role="group" aria-labelledby="route-q">
      <p id="route-q" className="router-q">
        {t('global', 'route.label')} <span className="label">({t('global', 'route.optional')})</span>
      </p>
      <div className="intents">
        {options.map((id) => (
          <button key={id} type="button" className="intent" aria-pressed={route === id} onClick={() => pick(id)}>
            {t('global', `route.option.${id}`)}
          </button>
        ))}
      </div>
      {route ? (
        <div className="route-line">
          {/* The approved line "Your route: A → B → C", drawn as a path (350ms + 60ms per stop). */}
          <p className="route-path-label">{t('global', 'route.line').split('{')[0].trim()}</p>
          <ol key={route} className="route-path">
            {stops.map((s, i) => (
              <li key={s.label} style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}>
                {i > 0 && <span aria-hidden="true">→ </span>}
                {s.label}
              </li>
            ))}
          </ol>
          <p className="label">{t('global', 'route.reassure')}</p>
          <button type="button" className="btn btn-text" onClick={clear}>
            {t('global', 'route.clear')}
          </button>
        </div>
      ) : (
        <p className="route-before">{t('global', 'route.before')}</p>
      )}
    </div>
  );
}
