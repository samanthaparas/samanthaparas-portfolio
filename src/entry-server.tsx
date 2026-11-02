import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { metaFor, pages } from './lib/pages';
import { external, SITE_URL } from './lib/site';

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
    `<meta name="twitter:card" content="${SITE_URL ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="theme-color" content="#F3EFE6" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#171C19" media="(prefers-color-scheme: dark)" />`,
  ];
  if (SITE_URL) {
    // Link previews (Slack, LinkedIn, iMessage) need an absolute image address.
    tags.push(
      `<meta property="og:image" content="${SITE_URL}/og-image.jpg" />`,
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      '<meta property="og:image:alt" content="Samantha Paras · Software Engineer. I build useful software for real people." />',
    );
  }
  if (SITE_URL && !notFound) {
    // Netlify serves /work as /work/, so canonical addresses end in a slash (no redirect hop).
    const address = `${SITE_URL}${url === '/' ? '/' : `${url}/`}`;
    tags.push(`<link rel="canonical" href="${address}" />`, `<meta property="og:url" content="${address}" />`);
  }
  if (notFound) tags.push('<meta name="robots" content="noindex" />');
  // Structured data on the homepage: who this site is about, and where else to find her.
  if (url === '/' && !notFound) {
    const person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Samantha Paras',
      jobTitle: 'Software Engineer',
      ...(SITE_URL ? { url: SITE_URL } : {}),
      sameAs: [external.github, external.linkedin],
      knowsAbout: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Supabase', 'PostgreSQL'],
    };
    tags.push(`<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`);
  }
  return { html, head: tags.join('\n    ') };
}
