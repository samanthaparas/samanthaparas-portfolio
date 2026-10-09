// Imports the approved public copy into src/content/copy/*.json.
// Usage: npm run import-copy -- <path to the planning repo's content/phase-4/public>
// Only rows between the PUBLIC COPY markers are read. Each row is `| element | visible text |`.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Pass the path to content/phase-4/public');
  process.exit(1);
}

for (const file of readdirSync(src).filter((f) => f.endsWith('.md'))) {
  const text = readFileSync(join(src, file), 'utf8');
  const start = text.indexOf('<!-- PUBLIC COPY START -->');
  const end = text.indexOf('<!-- PUBLIC COPY END -->');
  if (start === -1 || end === -1) continue;
  const rows = text
    .slice(start, end)
    .split('\n')
    .filter((line) => line.startsWith('| ') && !line.startsWith('| Element') && !line.startsWith('|---'));
  const copy = {};
  for (const row of rows) {
    const inner = row.slice(2, row.lastIndexOf(' |'));
    const sep = inner.indexOf(' | ');
    const key = inner.slice(0, sep).trim();
    const value = inner.slice(sep + 3).trim();
    if (key in copy) throw new Error(`${file}: duplicate key ${key}`);
    copy[key] = value;
  }
  if (rows.length === 0) continue;
  const out = join('src/content/copy', basename(file, '.md') + '.json');
  writeFileSync(out, JSON.stringify(copy, null, 2) + '\n');
  console.log(`${out}: ${Object.keys(copy).length} strings`);
}
