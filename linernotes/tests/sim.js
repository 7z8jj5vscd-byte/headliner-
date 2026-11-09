// Headless playthrough: an auto-player runs the engine for many years and checks for errors and broken numbers.
const path = require('path'); const vm = require('vm'); const fs = require('fs');
const P = process.env.PROBE ? require('./probe.js') : null; const ctx = P ? P.ctx : { console, Math, Date, JSON }; if (!P) { ctx.globalThis = ctx; vm.createContext(ctx); }
if (!P) for (const f of ['data.js', 'engine.js', 'systems.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
const LN = ctx.LN, D = ctx.LND;
const story = process.argv[2] || 'bedroom', years = +(process.argv[3] || 12), quiet = process.argv[4] === 'q';
const S = LN.newGame({ name: 'Test Artist', city: 'Atlanta', genre: 'pop', story, diff: 'normal', tutorial: false });
let errs = 0; const bad = [];
function checkNum(o, p, depth = 0) { if (depth > 3 || !o) return; for (const k in o) { const v = o[k]; if (typeof v === 'number' && !isFinite(v)) bad.push(p + '.' + k); else if (v && typeof v === 'object' && !Array.isArray(v)) checkNum(v, p + '.' + k, depth + 1); } }
const try_ = (n, f) => { try { const r = f(); return r; } catch (e) { errs++; console.log('ERR', n, e.stack.split('\n').slice(0, 3).join(' | ')); } };
for (let w = 0; w < years * 52; w++) {
  const f = LN.fame(S);
  // writing & recording
  try_('write', () => { if (S.songs.filter(s => !s.rel).length < 14) LN.writeSong(S, { title: LN.songTitle(), genre: 'pop', mood: LN.pick(D.MOODS), topic: LN.pick(D.TOPICS.slice(0, 14)), tempo: LN.pick(D.TEMPOS).id, cowriter: S.money > 50000 ? 'c3' : null }); });
  try_('record', () => { const s = S.songs.find(s => !s.recorded); if (s) { const studio = S.money > 200000 ? 'elite' : S.money > 30000 ? 'pro' : S.money > 3000 ? 'indie' : 'home'; const prod = S.money > 500000 ? 'p11' : S.money > 60000 ? 'p5' : 'self'; const feat = f > 30 && Math.random() < 0.3 ? LN.pick(S.npcs.filter(n => n.active)).id : null; LN.recordSong(S, s.id, { studio, producer: prod, feat: S.money > LN.recordCost(S, { studio, producer: prod, feat }) * 2 ? feat : null }); } });
  try_('release', () => { const ready = S.songs.filter(s => s.recorded && !s.rel); const pending = S.releases.some(r => !r.out); if (pending) return;
    const lastAlbum = Math.max(-99, ...S.releases.filter(r => r.type === 'album').map(r => r.week));
    if (ready.length >= 10 && S.week - lastAlbum > 50) { const r = LN.createRelease(S, { type: 'album', title: LN.albumTitle(), songs: ready.slice(0, 10).map(s => s.id), teasers: S.money > 50000, presave: S.money > 50000, delay: 2, eraLook: true }); if (!r.ok && !quiet) console.log('album fail', r.msg); }
    else if (ready.length >= 2 && (S.week % 6 === 0)) LN.createRelease(S, { type: 'single', title: ready[0].title, songs: [ready[0].id] }); });
  try_('post', () => { LN.post(S, LN.pick(['update', 'photo', 'thanks', 'teaser'])); });
  try_('gig', () => { const vs = D.VENUES.filter(v => LN.venueOpen(S, v, S.artist.region) && v.id !== 'arena' && v.id !== 'stadium'); const v = vs[vs.length - 1]; if (v && !LN.isTouring(S)) LN.playGig(S, v.id, S.artist.city); });
  try_('tour', () => { if (!LN.isTouring(S) && S.week % 40 === 20 && S.songs.filter(s => s.rel).length >= 5) { const vs = D.VENUES.filter(v => v.id !== 'openmic' && D.REGION_IDS.every(r => LN.venueOpen(S, v, r))); const v = vs[vs.length - 1] || D.VENUES[1]; const cities = D.CITIES.filter(c => LN.venueOpen(S, v, c.region)).slice(0, 10).map(c => c.name); const r = LN.planTour(S, { name: 'Tour ' + S.week, venue: v.id, price: v.basePrice, stage: S.money > 3e6 ? 2 : S.money > 100000 ? 1 : 0, cities, setlist: LN.defaultSetlist(S) }); } });
  try_('video', () => { const s = S.songs.find(s => s.rel && s.focus && !S.videos.some(v => v.song === s.id)); if (s && S.money > 50000) LN.shootVideo(S, s.id, { director: S.money > 1e6 ? 'd4' : 'd2', concept: 'city', budget: 20000 }); });
  try_('team', () => { if (S.money > 100000 && !S.team.manager) LN.hire(S, 'manager', 1); if (S.money > 500000 && !S.team.publicist) LN.hire(S, 'publicist', 2); if (f > 55 && S.money > 2e6) { LN.hire(S, 'agent', 3); LN.hire(S, 'manager', 3); } });
  try_('fandom', () => { if (!S.fandom && LN.totalFans(S) > 5000) LN.nameFandom(S, 'Testers'); });
  try_('life', () => { if (S.money > 5e6 && !S.homes.includes('h4')) LN.buyHome(S, 'h4'); if (S.money > 3e5 && !S.homes.includes('h2')) LN.buyHome(S, 'h2'); if (S.money > 2e6 && !S.ownLabel) LN.startLabel(S, 'Test Records'); if (S.ownLabel && S.ownLabel.roster.length < 2 && S.ownLabel.prospects.length) LN.signProspect(S, 0); if (S.ownLabel && S.ownLabel.roster.length && S.week % 10 === 0) LN.fundRelease(S, S.ownLabel.roster[0], 50000); if (S.money > 1e6 && !S.invest.index) LN.invest(S, 'index', 200000); if (S.money > 2e5 && !S.merch.some(m => m.stock > 0)) LN.designMerch(S, { item: 'tee', qty: 2000, price: 30 }); });
  try_('inbox', () => { for (const it of S.inbox.slice()) { if (it.kind === 'label') { if (Math.random() < 0.5) LN.negotiate(S, it.id, { advance: it.data.advance * 1.2, royalty: it.data.royalty, albums: it.data.albums, masters: it.data.masters }); }
    else if (it.kind === 'event') LN.respond(S, it.id, 0); else if (it.kind === 'feature' || it.kind === 'festival' || it.kind === 'brand') LN.respond(S, it.id, 'accept');
    else if (it.kind === 'talkshow') { const qs = LN.interviewQuestions(S); LN.finishInterview(S, it.id, qs.map(q => q.a[0][1])); }
    else if (it.kind === 'tv' || it.kind === 'awardperf') { const s = S.songs.find(s => s.rel); if (s) LN.tvPerform(S, it.id, s.id); }
    else if (it.kind === 'movie') LN.audition(S, it.id, 'prepared'); } });
  if (S.health < 40) try_('rest', () => LN.rest(S));
  const r = try_('endWeek', () => LN.endWeek(S));
  if (r && r.events) for (const e of r.events) if (!quiet && e.kind !== 'ceremony') console.log('  EVENT', LN.dateLabel(S), e.title, '-', e.text.slice(0, 110));
  if (w % 52 === 51) {
    checkNum(S, 'S');
    const best = S.stats.best; console.log(`Y${LN.year(S) - 1} fans ${LN.fmt(LN.totalFans(S))} fame ${LN.fame(S).toFixed(1)} money ${LN.money(S.money)} net ${LN.money(LN.netWorth(S))} songs ${S.songs.length} rels ${S.releases.length} best s#${best.s || '-'} a#${best.a || '-'} label ${S.label ? S.label.name : '-'} legacy ${S.legacy} ach ${Object.keys(S.achievements).length} health ${Math.round(S.health)} npcSongs ${S.npcSongs.length} npcs ${S.npcs.length}`);
    const na = S.charts.NA; console.log(`   NA singles #1 ${Math.round(na.s[0].v)} #100 ${na.s[99] ? Math.round(na.s[99].v) : 'n/a(' + na.s.length + ')'}  albums #1 ${Math.round(na.a[0].v)} #100 ${na.a[99] ? Math.round(na.a[99].v) : 'n/a(' + na.a.length + ')'} | AS singles ${S.charts.AS.s.length} LA ${S.charts.LA.s.length} LAalb ${S.charts.LA.a.length}`);
  }
}
console.log('errors', errs, 'badnums', bad.slice(0, 10));
console.log('awards', JSON.stringify(S.awards).slice(0, 400));
console.log('films', S.films.length, 'tours', S.tours.length, 'videos', S.videos.length, 'ach', Object.keys(S.achievements).join(','));
console.log('save size KB', Math.round(LN.serialize(S).length / 1024)); const R = LN.deserialize(LN.serialize(S)); LN.endWeek(R); console.log('reload+endWeek ok', R.week);
if (P) { console.log('FAN SOURCES', Object.entries(P.src).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + LN.fmt(v)).join(' | ')); }
const L = {}; for (const h of S.ledgerHist) for (const k in h) if (k !== 'w') L[k] = (L[k] || 0) + h[k]; console.log('LAST YEAR LEDGER', Object.entries(L).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + LN.money(v)).join(' | '));
const sizes = Object.entries(S).map(([k, v]) => [k, JSON.stringify(v).length]).sort((a, b) => b[1] - a[1]).slice(0, 10); console.log('SIZE', sizes.map(([k, v]) => k + ' ' + Math.round(v / 1024) + 'K').join(' | '));
{ const R = LN.deserialize(LN.serialize(S)); const a = S.charts.NA.s.slice(0, 3).map(e => e.pos + ' ' + e.t + ' / ' + e.ar + ' pk' + e.peak + ' w' + e.wks).join(' || '); const b = R.charts.NA.s.slice(0, 3).map(e => e.pos + ' ' + e.t + ' / ' + e.ar + ' pk' + e.peak + ' w' + e.wks).join(' || '); console.log('CHART ROUNDTRIP', a === b ? 'same' : 'DIFF\n ' + a + '\n ' + b, '| lens', R.charts.NA.s.length, R.charts.EU.a.length); const s0 = S.songs.find(s => s.rel); console.log('ch roundtrip', JSON.stringify(s0.ch) === JSON.stringify(LN.song(R, s0.id).ch)); }
