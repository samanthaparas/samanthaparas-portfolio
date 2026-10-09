# samanthaparas-portfolio

The personal portfolio of Samantha Paras, software engineer: projects, case studies, small-business services and contact.

Built with React, TypeScript, Vite and React Router. Every page is prerendered to static HTML at build time and hydrates into the React app, so pages load fast, work without JavaScript for reading, and have real titles and descriptions for search and link previews.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Typecheck, build, then prerender every page to `dist/` |
| `npm run preview` | Serve `dist/` the way Netlify does (clean URLs, 404 page) at http://localhost:4173 |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run typecheck` | TypeScript only |

## How it's put together

- **Copy** lives in `src/content/copy/*.json`, imported from approved copy tables with `npm run import-copy -- <path>`. Components read strings through `t(page, key)`, which throws on a missing key, so a typo can't ship as blank text.
- **Launch conditions** are in `src/lib/site.ts`. Pages, nav items and route stops that don't exist yet (Lab, résumé, Easter eggs page) are left out entirely instead of shown as placeholders.
- **Audience routes** ("What brings you here?") are in `src/lib/audience.tsx`. Picking one adds step badges and stop tags; it never hides or reorders content. The choice lasts for the browser session.
- **Prerendering**: `src/entry-server.tsx` renders a page; `scripts/prerender.mjs` writes one `index.html` per page plus `404.html`.
- **Contact form** submits through Netlify Forms. The email address is always visible as a fallback.

## Deploy (Netlify)

`netlify.toml` sets the build command and publish folder. Set `VITE_SITE_URL` (for example `https://example.com`, no trailing slash) once the domain is decided; canonical links, `og:url` and `sitemap.xml` are only generated when it's set.
