// Keyboard and touch audit: tabs through every page, checking each stop shows a visible focus
// indicator, and measures tap targets on a phone-sized view (44px minimum, per the design system).
// Usage: npm run preview, Chrome with --remote-debugging-port=9333, then node scripts/qa-keyboard.mjs
const base = process.argv[2] ?? 'http://localhost:4173';
const pages = ['/', '/work', '/work/questkeeper', '/work/can-you-spot-it', '/work/nugget-hackathon', '/work/reckoning-tattoo', '/behind-the-build', '/about', '/services', '/contact', '/easter-eggs', '/no-such-page'];
const tgt = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = {};
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => (await send('Runtime.evaluate', { returnByValue: true, expression: x })).result.result.value;
const tab = async () => { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); };
const problems = [];
for (const [w, mobile] of [[1280, false], [390, true]]) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile });
  for (const p of pages) {
    await send('Page.navigate', { url: base + p }); await new Promise((r) => setTimeout(r, 1200));
    // Tab through: every stop must show an outline or a box-shadow ring.
    const seen = new Set();
    for (let i = 0; i < 80; i++) {
      await tab();
      const info = await ev(`(() => { const el = document.activeElement; if (!el || el === document.body) return null;
        const cs = getComputedStyle(el); const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none';
        const r = el.getBoundingClientRect(); const visible = r.width > 0 && r.height > 0;
        return { key: el.tagName + '|' + (el.getAttribute('href') || '') + '|' + (el.innerText || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 30), ring, visible }; })()`);
      if (!info) break;
      if (seen.has(info.key)) break;
      seen.add(info.key);
      if (info.visible && !info.ring) problems.push(`no focus ring  ${p} ${w}px  ${info.key}`);
    }
    if (mobile) {
      const small = await ev(`[...document.querySelectorAll('a, button, input, select, textarea, summary')].filter(el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (!r.width || cs.visibility === 'hidden' || el.closest('[aria-hidden="true"]') || el.classList.contains('skip-link')) return false;
        const inline = cs.display === 'inline' && el.closest('p, li') && !el.closest('nav'); // links inside sentences are exempt (WCAG 2.5.8)
        return !inline && (r.height < 44 || r.width < 24); }).map(el => el.tagName + ' "' + (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30) + '" ' + Math.round(el.getBoundingClientRect().height) + 'px')`);
      small.forEach((s) => problems.push(`small target  ${p}  ${s}`));
    }
  }
}
console.log(problems.length ? [...new Set(problems)].join('\n') : 'Every focus stop shows a ring, and every tap target is at least 44px.');
process.exit(0);
