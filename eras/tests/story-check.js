// The Eras Life: a headless check of every story. Plays each artist from the start to 2027 the way
// they really did it, then checks the results still match the real career, then plays free-play years
// to make sure money and fans stay sensible. Run from the repo root:  node eras/tests/story-check.js
// It needs only Node.js (no browser). It exits with an error code if a check fails.
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = path.join(__dirname, '..') + path.sep;
const FILES = ['data-taylor.js','data-world.js','data-looks.js','data-events-world.js','data-forever.js','data-beyonce.js','data-gaga.js','data-olivia.js','data-scenes.js','data-shows.js','data-callbacks.js','data-goals.js','data-more.js','data-freedom.js','engine.js','extras.js','town.js','freedom.js','freedom2.js','freedom3.js','play.js','goals.js','citylife.js'];
let failed = 0; const fail = m => { failed++; console.log('  FAIL: ' + m); };

function play(artist, style) {
  const store = {}, ctx = { console, Math, Date, JSON, performance, ARTIST:artist, STYLE:style };
  ctx.window = ctx; ctx.localStorage = { getItem:k => store[k] ?? null, setItem:(k, v) => { store[k] = String(v); }, removeItem:k => { delete store[k]; } };
  vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(fs.readFileSync(D + f, 'utf8'), ctx, { filename:f });
  return vm.runInContext(`(function(){
    G.newGame({ artist:ARTIST, mode:'story', slot:1, look:{}, prologue:[0,0,0], fr:STYLE }); const errs = [];
    const week = () => { const S = G.S();
      while (S.week.pending.length) { const id = S.week.pending[0]; let ci = 0; if (!id.startsWith('drama:')) { const e = G.findEvent(id); if (!e) { errs.push('missing event ' + id); S.week.pending.shift(); continue; } const k = e.ch.findIndex(c => c.c); ci = k < 0 ? 0 : k; } G.answer(id, ci); }
      while (S.modal.length) S.modal.shift();
      for (let k = 0; k < 12; k++) { const t = G.requiredLeft().find(t => G.canSpend(t.cost)); if (!t) break; const r = G.doTask(t.id); if (r.err) { errs.push(r.err + ' ' + t.id); break; } }
      G.advance(true); };
    while (G.S().abs < ER.ds('2027-01-01')) week();
    const S = G.S(), at2027 = { canon:G.canon(), awards:S.awards.length, fans:S.stats.fans, money:S.stats.money,
      albums:S.released.map(r => ({ pid:r.pid, pct:r.real ? r.fw / r.real : null, no1w:r.no1w })),
      tours:Object.keys(S.pj).filter(k => S.pj[k].tour && S.pj[k].tour.played && G.proj(k).tour.target).map(k => ({ n:G.proj(k).tour.name, pct:S.pj[k].tour.gross / G.proj(k).tour.target })) };
    // Free play: a brand, then ten more years.
    if (!S.flags.free) G.enterFree(); S.stats.money += 5e7; G.launchBrand('fragrance', 'Test Brand'); const m0 = S.stats.money;
    while (G.S().abs < ER.ds('2037-01-01')) { if (!S.proposal && G.needsNextEra()) G.proposeEra(); if (S.proposal) { const P = S.proposal; G.newEra(P.titles[0], 12, 30, 40, P.themes[0]); } week(); }
    return { errs:errs.slice(0, 5), at2027, free:{ money:S.stats.money, m0, fans:S.stats.fans, eras:S.custom.length } };
  })()`, ctx);
}

for (const [artist, style] of [['taylor', 'canon'], ['beyonce', 'canon'], ['gaga', 'canon'], ['olivia', 'canon'], ['taylor', 'sandbox']]) {
  const r = play(artist, style), a = r.at2027;
  console.log(`${artist} (${style}): Canon ${a.canon} · ${a.awards} awards · ${Math.round(a.fans / 1e6)}M fans in 2027 · ${r.free.eras} invented eras by 2037, ${Math.round(r.free.fans / 1e6)}M fans, money ${Math.round(r.free.m0 / 1e6)}M → ${Math.round(r.free.money / 1e6)}M`);
  if (r.errs.length) fail('errors: ' + r.errs.join('; '));
  if (style === 'canon' && a.canon < 90) fail(`Canon Score ${a.canon} is below 90 when playing it the real way`);
  a.albums.filter(x => x.pct != null).forEach(x => { if (x.pct < .6 || x.pct > 1.5) fail(`${x.pid} first week is ${Math.round(x.pct * 100)}% of real`); });
  a.tours.forEach(t => { if (t.pct < .7 || t.pct > 1.4) fail(`${t.n} grossed ${Math.round(t.pct * 100)}% of real`); });
  if (artist === 'taylor' && style === 'canon') { const f = a.albums.find(x => x.pid === 'fearless'); if (!f || f.no1w < 6) fail('Fearless should spend many weeks at No. 1'); }
  if (!isFinite(r.free.money) || r.free.money > 5e10) fail(`Free-play money looks broken: ${r.free.money}`);
  if (!isFinite(r.free.fans) || r.free.fans <= 0) fail(`Free-play fans look broken: ${r.free.fans}`);
}
console.log(failed ? `${failed} check(s) failed.` : 'All checks passed.');
process.exit(failed ? 1 : 0);
