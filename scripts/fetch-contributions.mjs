// Fetches the last year of GitHub contributions and writes a small JSON file for the About page.
// Runs daily in .github/workflows/contributions.yml. GH_TOKEN is a fine-grained token with no
// repository access; it only reads the public contribution calendar (counts per day, no repo names).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const out = process.argv[2] ?? 'contributions.json';
const login = process.env.GH_LOGIN ?? 'samanthaparas';
const token = process.env.GH_TOKEN;
if (!token) throw new Error('GH_TOKEN is missing');

const query = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'samanthaparas-portfolio' },
  body: JSON.stringify({ query, variables: { login } }),
});
if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
const { data, errors } = await res.json();
if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '));

const calendar = data.user.contributionsCollection.contributionCalendar;
const levels = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
// Each day is [date, count, level 0–4], grouped in weeks that start on Sunday.
const result = {
  updated: new Date().toISOString(),
  total: calendar.totalContributions,
  weeks: calendar.weeks.map((w) => w.contributionDays.map((d) => [d.date, d.contributionCount, levels[d.contributionLevel] ?? 0])),
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result));
console.log(`${result.total} contributions over ${result.weeks.length} weeks → ${out}`);
