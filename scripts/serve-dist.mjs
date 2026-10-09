// Serves dist/ the way Netlify does: /path → /path/index.html, unknown paths → 404.html with a 404.
// Usage: npm run preview  (after npm run build)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = 'dist';
const port = Number(process.env.PORT ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.txt': 'text/plain', '.xml': 'application/xml', '.ico': 'image/x-icon',
};

async function file(path) {
  try {
    const s = await stat(path);
    return s.isDirectory() ? file(join(path, 'index.html')) : path;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, '');
  const found = (await file(join(root, safe))) ?? (await file(join(root, safe + '.html')));
  if (req.method === 'POST') {
    // Netlify Forms isn't available locally; answer like a failed send so the error state can be seen.
    res.writeHead(404).end();
    return;
  }
  const path = found ?? join(root, '404.html');
  res.writeHead(found ? 200 : 404, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
  res.end(await readFile(path));
}).listen(port, () => console.log(`Serving ${root}/ at http://localhost:${port}`));
