import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { metaFor, pages } from './lib/pages';
import { SITE_URL } from './lib/site';

export { pages };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Renders one page to HTML plus its <head> tags. Used by scripts/prerender.mjs at build time. */
export function render(url: string, notFound = false) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const meta = metaFor(notFound ? '/404' : url);
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="theme-color" content="#F3EFE6" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#171C19" media="(prefers-color-scheme: dark)" />`,
  ];
  if (SITE_URL && !notFound) {
    tags.push(`<link rel="canonical" href="${SITE_URL}${url}" />`, `<meta property="og:url" content="${SITE_URL}${url}" />`);
  }
  if (notFound) tags.push('<meta name="robots" content="noindex" />');
  return { html, head: tags.join('\n    ') };
}
