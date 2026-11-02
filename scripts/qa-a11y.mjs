// Accessibility audit with axe-core: every page, light and dark, phone and desktop.
// Usage: npm run build && npm run preview (in another terminal), Chrome with --remote-debugging-port=9333, then:
//   node scripts/qa-a11y.mjs [http://localhost:4173]
import { readFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4173';
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const pages = ['/', '/work', '/work/questkeeper', '/work/can-you-spot-it', '/work/nugget-hackathon', '/behind-the-build', '/about', '/services', '/contact', '/easter-eggs', '/no-such-page'];
const views = [ { w: 1280, mobile: false }, { w: 390, mobile: true } ];
const tgt = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = {};
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => (await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: x })).result.result.value;
const found = new Map();
for (const scheme of ['light', 'dark']) for (const v of views) {
  await send('Emulation.setDeviceMetricsOverride', { width: v.w, height: 900, deviceScaleFactor: 1, mobile: v.mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
  for (const p of pages) {
    await send('Page.navigate', { url: base + p }); await new Promise((r) => setTimeout(r, 1300));
    await ev(axe + ';1');
    const res = await ev(`axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'] }).then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => n.target.join(' ')).slice(0, 4) })))`);
    for (const v of res) {
      const key = v.id;
      const entry = found.get(key) ?? { impact: v.impact, help: v.help, where: new Set(), nodes: new Set() };
      entry.where.add(`${p} (${scheme}, ${v.w ?? (v.mobile ? 390 : 1280)})`.replace('undefined', ''));
      entry.where.add(`${p} ${scheme} ${v.mobile ? 'phone' : 'desktop'}`);
      v.nodes.forEach((n) => entry.nodes.add(n));
      found.set(key, entry);
    }
  }
}
if (!found.size) console.log('No accessibility violations found.');
for (const [rule, e] of found) console.log(`\n[${e.impact}] ${rule}: ${e.help}\n  pages: ${[...e.where].filter((w) => !w.includes('(')).slice(0, 6).join('; ')}${e.where.size > 12 ? ' …' : ''}\n  e.g.: ${[...e.nodes].slice(0, 4).join(' | ')}`);
process.exit(0);
