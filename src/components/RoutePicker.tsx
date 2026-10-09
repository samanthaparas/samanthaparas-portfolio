import { t, fill } from '../content';
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
          <p>
            {fill(t('global', 'route.line'), { 'stops joined by " → "': stops.map((s) => s.label).join(' → ') })}
          </p>
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
