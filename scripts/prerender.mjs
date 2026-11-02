// Writes one static HTML file per page (plus 404.html) from the client build's index.html.
// Each page hydrates into the same React app, so navigation after the first load is client-side.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = 'dist';
const fonts = readdirSync(join(dist, 'assets')).filter((f) =>
  /^(atkinson-hyperlegible-latin-400-normal|bricolage-grotesque-latin-wght-normal)-.*\.woff2$/.test(f),
);
const preload = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ');
const template = readFileSync(join(dist, 'index.html'), 'utf8').replace('<!--head-->', `${preload}\n    <!--head-->`);
const { render, pages } = await import(pathToFileURL(join('dist-ssr', 'entry-server.js')).href);

function write(file, url, notFound = false) {
  const { html, head } = render(url, notFound);
  const out = template.replace('<!--head-->', head).replace('<!--app-->', html);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  console.log(`prerendered ${url} → ${file}`);
}

for (const page of pages) {
  write(page.path === '/' ? join(dist, 'index.html') : join(dist, page.path, 'index.html'), page.path);
}
write(join(dist, '404.html'), '/404', true);

// sitemap.xml only once the domain is known (absolute URLs are required).
const site = process.env.VITE_SITE_URL;
if (site) {
  const urls = pages.map((p) => `  <url><loc>${site}${p.path === '/' ? '/' : `${p.path}/`}</loc></url>`).join('\n');
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
}

rmSync('dist-ssr', { recursive: true, force: true });
