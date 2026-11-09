// Week-by-week trace of an early career, used to tune balance.
const path = require('path'); const vm = require('vm'); const fs = require('fs');
const ctx = { console, Math, Date, JSON }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['data.js', 'engine.js', 'systems.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
const LN = ctx.LN, D = ctx.LND;
const S = LN.newGame({ name: 'T', city: 'Atlanta', genre: 'pop', story: process.argv[2] || 'bedroom', tutorial: false });
const weeks = +(process.argv[3] || 60), every = +(process.argv[4] || 3);
for (let w = 0; w < weeks; w++) {
  if (S.songs.filter(s => !s.rel).length < 6) LN.writeSong(S, { genre: 'pop', mood: 'Euphoric', topic: 'Love', tempo: 'up' });
  const s = S.songs.find(s => !s.recorded); if (s) LN.recordSong(S, s.id, { studio: S.money > 3000 ? 'indie' : 'home', producer: 'self' });
  const ready = S.songs.filter(s => s.recorded && !s.rel); if (ready.length && w % 5 === 0) LN.createRelease(S, { type: 'single', title: ready[0].title, songs: [ready[0].id] });
  LN.post(S, 'update'); const vs = D.VENUES.filter(v => LN.venueOpen(S, v, S.artist.region)); LN.playGig(S, vs[vs.length - 1].id, S.artist.city);
  for (const it of S.inbox.slice()) { if (['feature', 'festival', 'brand'].includes(it.kind)) LN.respond(S, it.id, 'accept'); else if (it.kind === 'label') LN.respond(S, it.id, 'accept'); else if (it.kind === 'event') LN.respond(S, it.id, 0); }
  const before = LN.totalFans(S); LN.endWeek(S);
  if (w % every) continue;
  const top = S.songs.filter(s => s.rel).slice(-3).map(s => s.title.slice(0, 10) + ' q' + s.q + ' ' + LN.fmt(s.weekStreamsLast) + (s.playlist && s.playlist.until >= S.week ? ' PL' : '') + (s.viral && s.viral.until >= S.week ? ' VIRAL' : '') + (s.feat ? ' FT' : '')).join('; ');
  console.log('w' + w + ' fans ' + LN.fmt(LN.totalFans(S)) + ' (+' + LN.fmt(LN.totalFans(S) - before) + ') fame ' + LN.fame(S).toFixed(0) + ' money ' + LN.money(S.money) + ' hype ' + S.hype.toFixed(0) + ' label ' + (S.label ? S.label.id : '-') + ' | ' + top);
  const h = S.ledgerHist[0]; console.log('     $ ' + Object.keys(h).filter(k => k !== 'w').map(k => k + ' ' + LN.money(h[k])).join(', ') + ' | fanDelta ' + LN.fmt(S.stats.fanDelta) + ' inbox ' + S.inbox.map(i => i.kind).join(','));
}
