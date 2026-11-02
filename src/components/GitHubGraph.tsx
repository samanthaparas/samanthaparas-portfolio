import { useEffect, useState } from 'react';
import { fill, maybe } from '../content';
import { external } from '../lib/site';
import { ExtLink } from './ExtLink';

type Day = [date: string, count: number, level: number];
interface Contributions {
  updated: string;
  total: number;
  weeks: Day[][];
}

const CELL = 11;
const STEP = 14;
const TOP = 18;
const WEEKS = 53;
const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

/** Month labels above the first week of each month, skipping any that would crowd a neighbor or the edge. */
function monthLabels(weeks: Day[][], width: number) {
  const labels: { x: number; text: string }[] = [];
  let last = '';
  weeks.forEach((w, i) => {
    const m = w[0][0].slice(0, 7);
    if (m === last) return;
    last = m;
    const x = i * STEP;
    if (labels.length && x - labels[labels.length - 1].x < STEP * 3) return;
    if (x + STEP * 2 > width) return;
    labels.push({ x, text: month.format(new Date(`${w[0][0]}T00:00:00Z`)) });
  });
  return labels;
}

/**
 * The last year of GitHub contributions, drawn in the site palette. The data comes from a file a
 * daily GitHub Action writes (see .github/workflows/contributions.yml), so it costs no Netlify builds.
 * Renders only once its copy is approved, and disappears if the file can't load.
 */
export function GitHubGraph() {
  const heading = maybe('about', 'github.h2');
  const [data, setData] = useState<Contributions | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(external.contributionsData)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Contributions>;
      })
      .then((d) => live && setData(d))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  if (!heading || failed) return null;

  const weeks = data?.weeks ?? [];
  const width = Math.max(weeks.length, WEEKS) * STEP - (STEP - CELL);
  const height = TOP + 7 * STEP - (STEP - CELL);
  const summary = maybe('about', 'github.summary');
  const dayTitle = maybe('about', 'github.day');
  const link = maybe('about', 'github.link');

  return (
    <section className="section container" aria-labelledby="github-h2">
      <h2 id="github-h2">{heading}</h2>
      {/* The grid is a picture of the summary line below, so screen readers get the sentence instead. */}
      <svg className="gh-graph" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {monthLabels(weeks, width).map((l) => (
          <text key={l.x} x={l.x} y={10} className="gh-month">{l.text}</text>
        ))}
        {weeks.map((w, i) =>
          w.map(([date, count, level]) => (
            <rect key={date} x={i * STEP} y={TOP + weekday(date) * STEP} width={CELL} height={CELL} rx={2} className={`gh-l${level}`}>
              {dayTitle && <title>{fill(dayTitle, { date, count })}</title>}
            </rect>
          )),
        )}
      </svg>
      <div className="gh-meta">
        <p>{data && summary ? fill(summary, { count: data.total.toLocaleString('en-US') }) : ' '}</p>
        {link && <ExtLink href={external.github}>{link}</ExtLink>}
      </div>
    </section>
  );
}
