/* Platinum Rush: core simulation. Pure game logic with no DOM, so it can run in Node tests. */
(function (root) {
const D = root.LND;
const LN = root.LN = root.LN || {};
LN.VERSION = 1;
const START_YEAR = 2026;

// ---------- helpers ----------
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const chance = p => Math.random() < p;
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
let _uid = 0;
const uid = p => (p || 'x') + Date.now().toString(36).slice(-4) + (++_uid).toString(36) + ri(0, 999);
const sum = a => a.reduce((x, y) => x + y, 0);
const wpick = (items, wf) => { const ws = items.map(wf); const t = sum(ws); if (t <= 0) return null; let r = Math.random() * t; for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };
Object.assign(LN, { rnd, ri, pick, clamp, chance, uid, sum, wpick, gauss });

LN.fmt = n => { n = Math.round(n || 0); const a = Math.abs(n); const s = n < 0 ? '-' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B'; if (a >= 1e6) return s + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
  if (a >= 1e4) return s + Math.round(a / 1e3) + 'K'; if (a >= 1e3) return s + (a / 1e3).toFixed(1) + 'K'; return s + a; };
LN.money = n => (n < 0 ? '-$' : '$') + LN.fmt(Math.abs(n));
LN.year = S => START_YEAR + Math.floor(S.week / 52);
LN.wk = S => (S.week % 52) + 1;
LN.dateLabel = (S, w = S.week) => 'Week ' + ((w % 52) + 1) + ', ' + (START_YEAR + Math.floor(w / 52));
LN.yearOf = w => START_YEAR + Math.floor(w / 52);

LN.DIFF = { easy: { inc: 1.3, str: 1.2, npc: 0.9, luck: 1.25 }, normal: { inc: 1, str: 1, npc: 1, luck: 1 }, hard: { inc: 0.8, str: 0.85, npc: 1.15, luck: 0.8 } };
const dif = S => LN.DIFF[S.diff] || LN.DIFF.normal;

// ---------- derived stats ----------
LN.totalFans = S => sum(D.REGION_IDS.map(r => S.fans[r]));
LN.fame = S => clamp((Math.log10(LN.totalFans(S) + 1) - 2.4) * 18 + S.hype * 0.04, 0, 100);
LN.maxEnergy = S => S.sick > 0 ? 30 : Math.round(60 + S.health * 0.4);
LN.imageTop = S => { const e = Object.entries(S.image).sort((a, b) => b[1] - a[1]); return e[0][1] < 8 ? 'unknown' : e[0][0]; };
LN.netWorth = S => {
  let w = S.money - S.debt;
  for (const h of S.homes) w += (D.HOMES.find(x => x.id === h) || {}).cost * 0.85 || 0;
  for (const c of S.cars) w += (D.CARS.find(x => x.id === c) || {}).cost * 0.6 || 0;
  for (const k in S.invest) w += S.invest[k];
  return w;
};
LN.teamPower = (S, role) => S.team[role] ? D.TEAM[role].tiers[S.team[role] - 1].power : 0;
LN.npcFans = fame => Math.pow(10, fame / 18 + 2.4);
LN.npcPower = fame => LN.npcFans(fame) * 1.2 + 120000;
LN.appeal = q => clamp(Math.pow(q / 65, 2.2), 0.04, 2.9);
LN.song = (S, id) => S.songs.find(s => s.id === id);
LN.rel = (S, id) => S.releases.find(r => r.id === id);
LN.npc = (S, id) => S.npcs.find(n => n.id === id);
LN.artistName = (S, id) => id === 'P' ? S.artist.name : (LN.npc(S, id) || { name: 'Unknown' }).name;
LN.isTouring = S => !!(S.tour && S.tour.idx < S.tour.shows.length);
LN.careerYears = S => Math.floor(S.week / 52);

// ---------- log helpers ----------
LN.news = (S, text, tag = 'industry') => { S.news.unshift({ w: S.week, text, tag }); if (S.news.length > 120) S.news.length = 120; };
LN.timeline = (S, text, kind = 'career') => { S.timeline.push({ w: S.week, text, kind }); };
LN.feedPost = (S, who, text, likes = 0, extra = {}) => { S.feed.unshift(Object.assign({ id: uid('f'), w: S.week, who, text, likes, replies: [] }, extra)); if (S.feed.length > 80) S.feed.length = 80; };
LN.inbox = (S, kind, title, text, data = {}, ttl = 3) => { const it = { id: uid('i'), kind, title, text, data, w: S.week, exp: S.week + ttl }; S.inbox.unshift(it); return it; };
LN.earn = (S, cat, amt) => { amt = Math.round(amt); if (!amt) return; S.money += amt; S.ledger[cat] = (S.ledger[cat] || 0) + amt; if (amt > 0) { S.taxable += amt; S.stats.earned += amt; } else S.taxable += amt * 0.6; };
LN.spend = (S, cat, amt) => LN.earn(S, cat, -Math.abs(amt));
LN.legacy = (S, n) => { S.legacy += n; };
LN.imageShift = (S, k, n) => { if (!S.image[k] && S.image[k] !== 0) return; S.image[k] = clamp(S.image[k] + n, 0, 100); for (const o in S.image) if (o !== k) S.image[o] = clamp(S.image[o] - n * 0.25, 0, 100); };
LN.moodAll = (S, n) => { for (const r of D.REGION_IDS) S.mood[r] = clamp(S.mood[r] + n, 0, 100); };
LN.addFans = (S, n, region) => {
  const add = (r, x) => { if (x > 0) x *= LN.sat(S, r); S.fans[r] = Math.max(0, S.fans[r] + x); };
  if (region) { add(region, n); return; }
  const dist = LN.fanDist(S); for (const r of D.REGION_IDS) add(r, n * dist[r]);
};
LN.fanDist = S => { const t = LN.totalFans(S) || 1; const o = {}; for (const r of D.REGION_IDS) o[r] = S.fans[r] / t; return o; };

// ---------- names ----------
LN.songTitle = () => { const r = Math.random(); if (r < 0.45) return pick(D.T_SOLO); if (r < 0.8) return pick(D.T_A) + ' ' + pick(D.T_B); const w = pick(D.T_B); return /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : /s$/.test(w) ? w : /(sh|ch|x|o)$/.test(w) ? w + 'es' : w + 's'; };
LN.albumTitle = () => chance(0.6) ? pick(D.ALBUM_WORDS) : pick(D.T_A) + ' ' + pick(D.T_B);
LN.fakeName = (used) => { for (let i = 0; i < 50; i++) { const n = chance(0.35) ? pick(D.NPC_MONO) : pick(D.NPC_FIRST) + ' ' + pick(D.NPC_LAST); if (!used.has(n)) { used.add(n); return n; } } return 'Artist ' + ri(100, 999); };

// ---------- NPC world ----------
function regW(fam, home) { const o = {}; for (const r of D.REGIONS) o[r.id] = (D.FAMILY_REGION[fam] || D.FAMILY_REGION.pop)[r.id] * r.size * (r.id === home ? 1.4 : 0.75); return o; }
LN.regW = regW;
function makeNpc(S, o) {
  const g = D.GENRE[o.genre] || D.GENRE.pop;
  return Object.assign({ id: uid('n'), name: o.name, real: !!o.real, genre: g.id, fam: g.fam, region: o.region, fame: o.fame, active: true,
    hiatus: 0, rel: 0, rival: false, cadence: ri(7, 16), next: ri(0, 12), albumNext: ri(10, 90), label: null, debut: S.week, own: false, potential: 0 }, o.extra || {});
}
function initWorld(S) {
  const used = new Set(D.REAL.map(r => r[0]));
  S.npcs = D.REAL.map(([name, genre, region, fame]) => makeNpc(S, { name, genre, region, fame, real: true }));
  for (let i = 0; i < 70; i++) {
    const g = pick(D.GENRES); const fam = g.fam;
    const region = fam === 'latin' ? 'LA' : fam === 'kpop' ? 'AS' : fam === 'afro' ? 'EU' : fam === 'country' ? 'NA' : pick(D.REGION_IDS);
    S.npcs.push(makeNpc(S, { name: LN.fakeName(used), genre: g.id, region, fame: Math.round(clamp(25 + Math.abs(gauss()) * 18 + rnd(-5, 10), 10, 82)) }));
  }
  S.usedNames = [...used];
  for (const f of D.FAMILIES) S.trends[f] = clamp(1 + gauss() * 0.12, 0.75, 1.3);
  // warm up the charts so the world already has history
  for (let i = 0; i < 30; i++) { npcWeek(S, true); computeCharts(S, true); S.week++; }
  S.week = 0; for (const s of S.npcSongs) s.week -= 30; for (const a of S.npcAlbums) a.week -= 30;
  for (const n of S.npcs) { n.next = ri(0, n.cadence); }
  S.yearTally = { s: {}, a: {} };
}

function npcRelease(S, n, albumTrack, album) {
  const qn = clamp(Math.exp(gauss() * 0.33), 0.45, 1.6) * (albumTrack ? rnd(0.25, 0.55) : 1);
  const song = { id: uid('s'), title: LN.songTitle(), npc: n.id, feat: null, week: S.week, power: LN.npcPower(n.fame) * qn * dif(S).npc,
    q: clamp(55 + gauss() * 12 + (n.fame - 50) * 0.2, 20, 98), fam: n.fam, rw: regW(n.fam, n.region), decay: clamp(0.83 + (qn - 0.5) * 0.07 + rnd(-0.02, 0.03), 0.8, 0.95), ch: {}, pts: 0, album: album || null };
  if (!albumTrack && chance(0.18)) { // NPC collab between NPCs
    const p = pick(S.npcs.filter(x => x.active && x.id !== n.id && Math.abs(x.fame - n.fame) < 20)); if (p) { song.feat = p.id; song.power *= 1.25; }
  }
  S.npcSongs.push(song); return song;
}
function npcAlbum(S, n) {
  const qn = clamp(Math.exp(gauss() * 0.3), 0.5, 1.7);
  const al = { id: uid('a'), title: LN.albumTitle(), npc: n.id, week: S.week, power: (LN.npcFans(n.fame) * 0.011 + 2500) * qn * dif(S).npc, rw: regW(n.fam, n.region),
    q: clamp(58 + gauss() * 11 + (n.fame - 50) * 0.15, 25, 98), fam: n.fam, ch: {}, pts: 0 };
  S.npcAlbums.push(al);
  const tracks = n.fame > 70 ? ri(2, 5) : ri(0, 2);
  for (let i = 0; i < tracks; i++) npcRelease(S, n, true, al.id);
  return al;
}
function npcWeek(S, quiet) {
  for (const n of S.npcs) {
    if (!n.active) continue;
    if (n.hiatus > 0) { n.hiatus--; if (!n.hiatus && !quiet) LN.news(S, `${n.name} is back from their break.`); continue; }
    n.next--; n.albumNext--;
    if (n.own) continue; // your label's artists release when you fund them
    if (n.albumNext <= 0) { const al = npcAlbum(S, n); n.albumNext = ri(55, 120); n.next = ri(5, 10); if (!quiet && n.fame > 55) LN.news(S, `${n.name} released a new album, "${al.title}".`, 'release'); }
    else if (n.next <= 0) { const s = npcRelease(S, n); n.next = n.cadence + ri(-2, 4); if (!quiet && n.fame > 72 && chance(0.5)) LN.news(S, `${n.name} dropped a new single, "${s.title}"${s.feat ? ' with ' + LN.artistName(S, s.feat) : ''}.`, 'release'); }
    // fame drift
    n.fame = clamp(n.fame + gauss() * 0.25 + (n.real ? (n.fame < 70 ? 0.01 : -0.004) : -0.01), 5, 99);
  }
  if (quiet) return;
  // fictional artists come and go; real artists only take breaks
  if (chance(0.25)) {
    const used = new Set(S.usedNames); const g = pick(D.GENRES);
    const n = makeNpc(S, { name: LN.fakeName(used), genre: g.id, region: pick(D.REGION_IDS), fame: ri(12, 45) }); S.usedNames = [...used];
    S.npcs.push(n); if (chance(0.4)) LN.news(S, `New artist ${n.name} (${g.name}) signed their first deal.`);
  }
  if (chance(0.02)) {
    const c = pick(S.npcs.filter(n => n.active && !n.real && !n.own && n.fame < 40)); if (c) { c.active = false; LN.news(S, chance(0.5) ? `${c.name} announced they are retiring from music.` : `${c.name} broke up after a public falling-out.`); }
  }
  if (chance(0.015)) { const c = pick(S.npcs.filter(n => n.active && n.real && !n.hiatus)); if (c) { c.hiatus = ri(10, 40); LN.news(S, `${c.name} announced a break from music. (In-game storyline.)`); } }
  const before = S.npcs.length; S.npcs = S.npcs.filter(n => n.active || n.rel !== 0 || n.own || S.week - n.debut < 520); if (S.npcs.length < before) {}
}
LN.npcWeek = npcWeek;

// ---------- player streams ----------
function labelReach(S) { if (!S.label) return 0; const l = D.LABELS.find(x => x.id === S.label.id); return l ? l.reach : 0; }
function songParts(S, s, region, deterministic) {
  const rel = LN.rel(S, s.rel); if (!rel || rel.week > S.week) return [0, 0];
  let a = S.week - s.relWeek; if (a < 0) return [0, 0];
  const q = s.q; const L = 0.8 + 0.14 * q / 100; const ap = LN.appeal(q);
  const focus = s.focus ? 1 : 0.32;
  const mood = 0.6 + S.mood[region] / 125;
  let fanPart = S.fans[region] * 1.2 * Math.pow(L, a) * ap * focus * mood * (a === 0 ? (rel.presave ? 1.2 : 1) * (rel.clash ? 0.85 : 1) : 1);
  if (s.reRecord) fanPart *= 1.4;
  const share = 0.5 * (S.fans[region] / (LN.totalFans(S) || 1)) + 0.5 * regW(s.fam, S.artist.region)[region] / 3;
  let reach = 0;
  if (rel.label) reach += (D.LABELS.find(x => x.id === rel.label) || { reach: 0 }).reach * Math.pow(0.82, a) * focus;
  if (s.playlist && s.playlist.until >= S.week) reach += s.playlist.reach;
  if (s.viral && s.viral.until >= S.week) reach += s.viral.reach;
  if (s.feat) { const n = LN.npc(S, s.feat); if (n) reach += LN.npcPower(n.fame) * 0.18 * Math.pow(0.86, a) * focus; }
  if (s.boost && s.boost.until >= S.week) reach += s.boost.reach;
  reach += 400 * Math.sqrt(LN.totalFans(S)) * Math.pow(L, a) * focus;
  reach *= share * ap;
  let k = (S.trends[s.fam] || 1) * (1 + S.hype / 160) * dif(S).str;
  if (s.remixBoost && s.remixBoost >= S.week) k *= 1.35;
  if (s.halved) k *= 0.5;
  if (!deterministic) k *= rnd(0.9, 1.1);
  return [Math.max(0, fanPart * k), Math.max(0, reach * k)];
}
function songStreams(S, s, region, deterministic) { const p = songParts(S, s, region, deterministic); return p[0] + p[1]; }
LN.songStreams = songStreams;
function albumUnits(S, rel, region, trackStreams, deterministic) {
  let a = S.week - rel.week; if (a < 0) return 0;
  const qs = rel.songs.map(id => (LN.song(S, id) || { q: 40 }).q); const ap = LN.appeal(sum(qs) / qs.length);
  const curve = a === 0 ? 1 : 0.45 * Math.pow(0.86, a - 1);
  let sales = S.fans[region] * 0.011 * ap * curve * (1 + S.hype / 120) * (rel.presave && a === 0 ? 1.25 : 1) * (0.6 + S.mood[region] / 125);
  if (rel.deluxeBoost && rel.deluxeBoost >= S.week) sales *= 1.6;
  if (rel.label) sales += (D.LABELS.find(x => x.id === rel.label) || { reach: 0 }).reach * 0.004 * curve * ap;
  if (rel.halved) sales *= 0.5;
  if (!deterministic) sales *= rnd(0.9, 1.1);
  return sales + trackStreams / 1250;
}

// ---------- charts ----------
const CHART_TYPES = [{ id: 's', name: 'Singles' }, { id: 'a', name: 'Albums' }, { id: 'st', name: 'Streaming' }];
LN.CHART_TYPES = CHART_TYPES;
function albumCurve(al, a) { return a === 0 ? 1 : Math.max(0.5 * Math.pow(0.88, a - 1), al.q > 72 ? 0.035 : al.q > 62 ? 0.015 : 0); }
function curveNpc(s, a) { return a < 0 ? 0 : Math.pow(s.decay, a) * (a <= 2 && s.decay > 0.9 ? 0.85 + a * 0.08 : 1); }
function computeCharts(S, quiet) {
  const out = {}; const playerSongWeek = {};
  for (const r of D.REGION_IDS) out[r] = { s: [], a: [], st: [] };
  // NPC songs
  const tr = S.trends;
  for (const s of S.npcSongs) {
    const a = S.week - s.week; let base = s.power * curveNpc(s, a) * (tr[s.fam] || 1);
    if (s.viral && s.viral >= S.week) base *= 2.5;
    s.cur = {};
    for (const r of D.REGION_IDS) {
      const st = base * s.rw[r] * rnd(0.92, 1.08); s.cur[r] = st;
      if (st < 4e5) continue;
      const art = LN.artistName(S, s.npc) + (s.feat ? ' feat. ' + LN.artistName(S, s.feat) : '');
      out[r].st.push({ k: s.id, t: s.title, ar: art, v: st, npc: s.npc, feat: s.feat });
      out[r].s.push({ k: s.id, t: s.title, ar: art, v: st / 150 + st / 420, npc: s.npc, feat: s.feat });
    }
  }
  for (const al of S.npcAlbums) {
    const a = S.week - al.week; const base = al.power * albumCurve(al, a) * (tr[al.fam] || 1);
    for (const r of D.REGION_IDS) { const u = base * al.rw[r] * rnd(0.9, 1.1); if (u < 900) continue; out[r].a.push({ k: al.id, t: al.title, ar: LN.artistName(S, al.npc), v: u, npc: al.npc }); }
  }
  // player
  if (!quiet && S.songs) {
    for (const s of S.songs) {
      if (!s.rel) continue; const rel = LN.rel(S, s.rel); if (!rel || rel.week > S.week) continue;
      s.cur = {}; let tot = 0;
      for (const r of D.REGION_IDS) {
        const pr = songParts(S, s, r); const st = pr[0] + pr[1]; s.cur[r] = st; s.reach = s.reach || {}; s.reach[r] = pr[1]; tot += st;
        const art = S.artist.name + (s.feat ? ' feat. ' + LN.artistName(S, s.feat) : '') + (rel.partner ? ' & ' + LN.artistName(S, rel.partner) : '');
        if (st > 2e5) { out[r].st.push({ k: s.id, t: s.title, ar: art, v: st, P: true }); out[r].s.push({ k: s.id, t: s.title, ar: art, v: st / 150 + st / 450, P: true }); }
      }
      s.streams += tot; s.weekStreams = tot; s.weekStreamsLast = tot; s.sales += tot / 450;
      playerSongWeek[s.id] = tot;
    }
    for (const rel of S.releases) {
      if (rel.type === 'single' || rel.type === 'remix' || rel.type === 'deluxe' || !rel.out || rel.week > S.week) continue;
      rel.cur = {}; let tot = 0;
      for (const r of D.REGION_IDS) {
        const ts = sum(rel.songs.map(id => { const s = LN.song(S, id); return s && s.cur ? s.cur[r] || 0 : 0; }));
        const u = albumUnits(S, rel, r, ts); rel.cur[r] = u; tot += u;
        if (u > 900) out[r].a.push({ k: rel.id, t: rel.title, ar: S.artist.name + (rel.partner ? ' & ' + LN.artistName(S, rel.partner) : ''), v: u, P: true });
      }
      rel.units += tot; rel.weekUnits = tot; rel.sales += tot * 0.55;
    }
    // NPC songs featuring the player add to your fans
    for (const s of S.npcSongs) if (s.feat === 'P' && s.cur) { const t = sum(Object.values(s.cur)); LN.addFans(S, t * 0.0005); LN.earn(S, 'features', t * 0.0035 * 0.12 * dif(S).inc); }
  }
  // rank
  const prev = S.charts || {};
  for (const r of D.REGION_IDS) for (const t of ['s', 'a', 'st']) {
    const list = out[r][t].sort((x, y) => y.v - x.v).slice(0, 100);
    const pmap = {}; ((prev[r] || {})[t] || []).forEach((e, i) => pmap[e.k] = i + 1);
    list.forEach((e, i) => { e.pos = i + 1; e.last = pmap[e.k] || 0; });
    out[r][t] = list;
  }
  S.charts = out;
  if (!quiet) chartBookkeeping(S);
}
LN.computeCharts = computeCharts;

function chartBookkeeping(S) {
  const yr = S.yearTally || (S.yearTally = { s: {}, a: {} });
  const objFor = (e, t) => e.P ? (t === 'a' ? LN.rel(S, e.k) : LN.song(S, e.k)) : (t === 'a' ? S.npcAlbums.find(x => x.id === e.k) : S.npcSongs.find(x => x.id === e.k));
  const playerTop = { s: 999, a: 999, st: 999 };
  const no1 = [];
  for (const r of D.REGION_IDS) for (const t of ['s', 'a', 'st']) {
    for (const e of S.charts[r][t]) {
      const o = objFor(e, t); if (!o) continue;
      o.ch = o.ch || {}; const key = r + t; const m = o.ch[key] || (o.ch[key] = { peak: 999, wks: 0, debut: e.pos });
      e.isNew = m.wks === 0; m.wks++; if (e.pos < m.peak) { e.newPeak = m.wks > 1; m.peak = e.pos; } e.peak = m.peak; e.wks = m.wks;
      if (t !== 'st') { const tk = t === 'a' ? 'a' : 's'; const y = yr[tk][e.k] || (yr[tk][e.k] = { t: e.t, ar: e.ar, P: !!e.P, v: 0 }); y.v += e.v; }
      o.pts = (o.pts || 0) + (101 - e.pos);
      if (e.P) {
        playerTop[t] = Math.min(playerTop[t], e.pos);
        if (e.pos === 1) no1.push({ r, t, e });
        if (e.isNew && t !== 'st') S.weekReport.push(`"${e.t}" debuted at #${e.pos} on the ${D.REGIONS.find(x => x.id === r).short} ${t === 'a' ? 'Albums' : 'Singles'} chart.`);
        else if (e.newPeak && t !== 'st' && e.pos <= 40) S.weekReport.push(`"${e.t}" climbed to a new peak of #${e.pos} (${D.REGIONS.find(x => x.id === r).short} ${t === 'a' ? 'Albums' : 'Singles'}).`);
      } else if (e.pos === 1 && e.isNew && t === 's' && r === 'NA') LN.news(S, `${e.ar} debuted at #1 in North America with "${e.t}".`, 'charts');
    }
  }
  for (const t of ['s', 'a', 'st']) if (playerTop[t] < 999) S.stats.best[t] = Math.min(S.stats.best[t] || 999, playerTop[t]);
  if (playerTop.s === 1) { LN.legacy(S, 2); S.stats.no1Weeks++; } else if (playerTop.s <= 10) LN.legacy(S, 1);
  if (playerTop.a === 1) LN.legacy(S, 1);
  if (no1.length) {
    const s1 = no1.filter(x => x.t === 's'); const regs = new Set(s1.map(x => x.r));
    for (const x of no1) if (x.e.isNew || x.e.last !== 1) { LN.news(S, `${S.artist.name} is #1 in ${D.REGIONS.find(r => r.id === x.r).name} with "${x.e.t}".`, 'you'); if (x.r === 'NA' || no1.length < 3) LN.timeline(S, `"${x.e.t}" hit #1 (${D.REGIONS.find(r => r.id === x.r).short} ${x.t === 'a' ? 'Albums' : x.t === 's' ? 'Singles' : 'Streaming'})`, 'chart'); }
    for (const r of regs) S.flags['no1_' + r] = 1;
  }
  // retire old NPC entries
  S.npcSongs = S.npcSongs.filter(s => (s.feat === 'P' && S.week - s.week < 30) || S.week - s.week < 8 || s.power * curveNpc(s, S.week - s.week) > 1.6e5);
  S.npcAlbums = S.npcAlbums.filter(a => S.week - a.week < 3 || (S.week - a.week < 260 && a.power * albumCurve(a, S.week - a.week) > 700));
}

// ---------- new game ----------
LN.defaultLook = () => ({ skin: D.SKINS[2], hair: 'short', hairColor: D.HAIR_COLORS[0], body: 'avg', top: 'tee', topColor: D.CLOTH_COLORS[2], bottom: 'jeans', bottomColor: D.CLOTH_COLORS[6], shoes: 'sneakers', shoesColor: D.CLOTH_COLORS[0], acc: 'none', accColor: D.CLOTH_COLORS[4], eyes: '#1d1d24' });
LN.newGame = function (o) {
  const st = D.STORIES.find(x => x.id === o.story) || D.STORIES[0];
  const city = D.CITIES.find(c => c.name === o.city) || D.CITIES[0];
  const S = {
    v: LN.VERSION, slot: o.slot || 1, diff: o.diff || 'normal', week: 0, created: Date.now(),
    artist: { name: (o.name || 'New Artist').slice(0, 28), city: city.name, region: city.region, genre: o.genre || 'pop', story: st.id, age: st.age, pronoun: o.pronoun || 'they' },
    look: Object.assign(LN.defaultLook(), o.look || {}), skills: Object.assign({}, st.skills), acting: 5,
    energy: 100, health: 100, stress: 10, sick: 0, rested: false, money: st.money, debt: 0, loan: st.loan ? Object.assign({}, st.loan) : null,
    hype: st.hype, image: { wholesome: 5, edgy: 5, mysterious: 5, messy: 5 }, fans: {}, mood: {}, fandom: null, fanClub: 0,
    songs: [], releases: [], npcs: [], npcSongs: [], npcAlbums: [], charts: null, trends: {}, genreXP: {},
    label: null, labelHistory: [], ownLabel: null, team: { manager: 0, publicist: 0, agent: 0, stylist: 0 },
    tour: null, tours: [], gigs: 0, shows: [], merch: [], videos: [], movie: null, films: [], deals: [], products: [], invest: {},
    home: st.id === 'nepo' ? 'h1' : 'h0', homes: ['h0'], cars: [], wardrobe: D.WARDROBE.filter(w => !w.price).map(w => w.id), eras: [],
    achievements: {}, awards: [], shows_: {}, timeline: [], legacy: 0, hof: false, retired: false,
    feed: [], news: [], inbox: [], bookings: [], ledger: {}, ledgerHist: [], taxable: 0, yearEnd: [], beef: null, charity: 0,
    stats: { earned: 0, no1Weeks: 0, best: {}, songsWritten: 0, showsPlayed: 0, attendance: 0, posts: 0, maxViews: 0 },
    flags: { tut: o.tutorial === false ? 99 : 0 }, week_: {}, weekReport: [], studioDiscount: st.studioDiscount || 0, pressPenalty: st.pressPenalty || 0,
  };
  if (st.id === 'nepo') S.homes.push('h1');
  const total = st.fans; for (const r of D.REGIONS) { S.fans[r.id] = r.id === city.region ? total * 0.72 : total * 0.28 * r.size / (sum(D.REGIONS.filter(x => x.id !== city.region).map(x => x.size))); S.mood[r.id] = 60; }
  initWorld(S);
  computeCharts(S, true);
  if (st.rival) { const r = pick(S.npcs.filter(n => !n.real && n.fam === 'hiphop')) || pick(S.npcs.filter(n => !n.real)); r.rel = -45; r.rival = true; r.fame = Math.min(r.fame, 35); LN.news(S, `Battle rapper ${r.name} says ${S.artist.name} "will never make it out of the parking lot."`, 'you'); }
  if (st.viralSong) {
    const s = LN.makeSong(S, { title: LN.songTitle(), genre: S.artist.genre, mood: pick(D.MOODS), topic: pick(D.TOPICS), tempo: 'up' }, 62); s.buzz = true; s.recorded = true; s.q = 64;
  }
  if (st.labelOffer) LN.labelOffer(S, D.LABELS.find(l => l.id === 'northbound'), true);
  LN.timeline(S, `${S.artist.name} started a music career in ${city.name}.`, 'start');
  LN.news(S, 'Welcome to Platinum Rush. Real artists appear in made-up storylines.', 'game');
  S.energy = LN.maxEnergy(S);
  LN.feedPost(S, 'P', `Day one. Let's make some music. 🎶`, ri(3, 30));
  return S;
};

// ---------- songwriting & recording ----------
LN.makeSong = function (S, o, q) {
  const g = D.GENRE[o.genre] || D.GENRE.pop;
  const s = { id: uid('s'), title: (o.title || LN.songTitle()).slice(0, 40), genre: g.id, fam: g.fam, mood: o.mood, topic: o.topic, tempo: o.tempo || 'mid', wq: Math.round(q), q: Math.round(q),
    written: S.week, recorded: false, rel: null, relWeek: null, focus: false, streams: 0, sales: 0, ch: {}, pts: 0, cowriter: o.cowriter || null, share: 0,
    feat: null, producer: null, studio: null, diss: o.diss || null, leaked: false, cert: 0 };
  S.songs.push(s); S.stats.songsWritten++; return s;
};
LN.energyCost = { write: 20, record: 25, practice: 15, post: 5, pitch: 5, video: 30, interview: 15, camp: 45 };
LN.useEnergy = (S, n) => { if (S.energy < n) return false; S.energy -= n; return true; };
function gainSkill(S, k, n) { S.skills[k] = clamp(S.skills[k] + n * (1 - S.skills[k] / 115), 0, 100); }
LN.gainSkill = gainSkill;

LN.writeSong = function (S, o) {
  const cw = o.cowriter ? D.COWRITERS.find(c => c.id === o.cowriter) : null;
  if (cw && S.money < cw.fee) return { ok: false, msg: `You need ${LN.money(cw.fee)} to hire ${cw.name}.` };
  if (!LN.useEnergy(S, LN.energyCost.write)) return { ok: false, msg: 'Not enough energy. Rest or end the week.' };
  if (cw) LN.spend(S, 'songwriting', cw.fee);
  const g = D.GENRE[o.genre] || D.GENRE.pop; const xp = S.genreXP[g.id] || 0;
  let q = S.skills.write * 0.68 + 12 + rnd(0, 22) + Math.min(6, xp * 0.6) + (o.bonus || 0);
  if (cw) q += Math.max(4, (cw.skill - S.skills.write) * 0.45);
  if (o.topic === 'Diss track' && (o.mood === 'Angry' || o.mood === 'Defiant')) q += 3;
  if (S.stress > 70) q -= 6;
  q = clamp(q, 5, 99);
  const s = LN.makeSong(S, o, q); s.cowriter = cw ? cw.id : null; s.share = cw ? cw.share : 0;
  S.genreXP[g.id] = xp + 1; gainSkill(S, 'write', 0.9);
  return { ok: true, song: s, msg: `You wrote "${s.title}". It feels like a ${LN.qWord(q)} song.` };
};
LN.qWord = q => q >= 90 ? 'career-defining' : q >= 80 ? 'great' : q >= 68 ? 'strong' : q >= 55 ? 'decent' : q >= 40 ? 'rough' : 'weak';
LN.writingCamp = function (S, campId, o) {
  const c = D.CAMPS.find(x => x.id === campId); if (!c) return { ok: false, msg: 'Unknown camp.' };
  if (S.money < c.cost) return { ok: false, msg: `A ${c.name.toLowerCase()} costs ${LN.money(c.cost)}.` };
  if (S.energy < c.energy) return { ok: false, msg: `You need ${c.energy} energy for this.` };
  S.energy -= c.energy - LN.energyCost.write * c.songs; LN.spend(S, 'songwriting', c.cost);
  const songs = [];
  for (let i = 0; i < c.songs; i++) { const r = LN.writeSong(S, Object.assign({}, o, { title: LN.songTitle(), mood: pick(D.MOODS), topic: pick(D.TOPICS.slice(0, 14)), tempo: pick(D.TEMPOS).id, bonus: c.bonus, cowriter: null })); if (r.ok) songs.push(r.song); }
  return { ok: true, songs, msg: `The camp produced ${songs.length} songs: ${songs.map(s => '"' + s.title + '"').join(', ')}.` };
};

LN.featureChance = (S, npcId) => { const n = LN.npc(S, npcId); if (!n) return 0; if (n.own) return 1; const f = LN.fame(S); return clamp(1 / (1 + Math.exp(-((f - n.fame + 12 + n.rel / 3 + LN.teamPower(S, 'manager') * 3) / 7))), 0.02, 0.97) * (n.rival ? 0.1 : 1) * (n.hiatus ? 0.2 : 1); };
LN.featureFee = (S, npcId) => { const n = LN.npc(S, npcId); if (!n || n.own) return 0; return Math.round(1500 * Math.pow(1.065, n.fame) / 100) * 100; };
LN.recordCost = (S, o) => {
  const st = D.STUDIOS.find(x => x.id === o.studio) || D.STUDIOS[0]; const pr = D.PRODUCERS.find(x => x.id === o.producer) || D.PRODUCERS[0];
  return Math.round(st.cost * (1 - S.studioDiscount) + pr.fee + (o.feat ? LN.featureFee(S, o.feat) : 0));
};
LN.recordSong = function (S, songId, o) {
  const s = LN.song(S, songId); if (!s || s.recorded) return { ok: false, msg: 'That song is not waiting to be recorded.' };
  const st = D.STUDIOS.find(x => x.id === o.studio) || D.STUDIOS[0]; const pr = D.PRODUCERS.find(x => x.id === o.producer) || D.PRODUCERS[0];
  const cost = LN.recordCost(S, o);
  if (S.money < cost) return { ok: false, msg: `This session costs ${LN.money(cost)}. You have ${LN.money(S.money)}.` };
  if (!LN.useEnergy(S, LN.energyCost.record)) return { ok: false, msg: 'Not enough energy to record. Rest or end the week.' };
  let featMsg = '';
  if (o.feat) {
    const n = LN.npc(S, o.feat); const p = LN.featureChance(S, o.feat);
    if (n && chance(p)) { s.feat = n.id; n.rel = clamp(n.rel + 6, -100, 100); featMsg = ` ${n.name} said yes and recorded a verse.`; }
    else { featMsg = n ? ` ${n.name} passed on the feature, so you kept their fee.` : ''; }
  }
  const realCost = s.feat ? cost : cost - (o.feat ? LN.featureFee(S, o.feat) : 0);
  LN.spend(S, 'recording', realCost);
  const prodSkill = pr.id === 'self' ? S.skills.prod : pr.skill + (pr.fam === s.fam ? 8 : -4);
  let q = s.wq * 0.55 + S.skills.vocals * 0.18 + prodSkill * 0.22 + st.bonus + rnd(-4, 6) + (s.buzz ? 4 : 0);
  if (s.feat) q += 3;
  q = Math.round(clamp(q, 5, st.cap));
  Object.assign(s, { recorded: true, q, studio: st.id, producer: pr.id, recWeek: S.week });
  if (pr.id !== 'self') S.hype = clamp(S.hype + pr.buzz * 0.3, 0, 100);
  gainSkill(S, 'vocals', 0.6); if (pr.id === 'self') gainSkill(S, 'prod', 0.9); else gainSkill(S, 'prod', 0.3);
  return { ok: true, song: s, msg: `You recorded "${s.title}" at the ${st.name.toLowerCase()}. Final quality: ${q}/100 (${LN.qWord(q)}).${featMsg}` };
};

// ---------- practice / rest ----------
LN.practice = function (S, skill, mode) {
  if (!S.skills.hasOwnProperty(skill) && skill !== 'acting') return { ok: false, msg: 'Unknown skill.' };
  const cur = skill === 'acting' ? S.acting : S.skills[skill];
  const cost = mode === 'class' ? Math.round(250 * (1 + cur / 18) / 50) * 50 : 0;
  if (S.money < cost) return { ok: false, msg: `A class costs ${LN.money(cost)}.` };
  if (!LN.useEnergy(S, LN.energyCost.practice)) return { ok: false, msg: 'Not enough energy to practice.' };
  if (cost) LN.spend(S, 'lessons', cost);
  const g = (mode === 'class' ? 5 : 2.6) * rnd(0.8, 1.2);
  if (skill === 'acting') S.acting = clamp(S.acting + g * (1 - S.acting / 115), 0, 100); else gainSkill(S, skill, g);
  const nv = skill === 'acting' ? S.acting : S.skills[skill];
  return { ok: true, msg: `${mode === 'class' ? 'Class' : 'Practice'} done. ${skill === 'acting' ? 'Acting' : D.SKILLS.find(x => x.id === skill).name} is now ${Math.floor(nv)}.` };
};
LN.rest = function (S) {
  const h = D.HOMES.find(x => x.id === S.home) || D.HOMES[0];
  S.health = clamp(S.health + 8 + h.rest * 0.3, 0, 100); S.stress = clamp(S.stress - 15 - h.rest * 0.4, 0, 100); S.energy = 0; S.rested = true;
  return { ok: true, msg: 'You took the rest of the week off. Health is up and stress is down.' };
};
LN.vacation = function (S) {
  const cost = Math.round(Math.max(1500, LN.netWorth(S) * 0.01) / 100) * 100;
  if (S.money < cost) return { ok: false, msg: `A vacation costs ${LN.money(cost)}.` };
  if (LN.isTouring(S) || S.movie && S.movie.stage === 'shoot') return { ok: false, msg: 'You can\'t leave while you are on tour or shooting a movie.' };
  LN.spend(S, 'lifestyle', cost); S.health = clamp(S.health + 30, 0, 100); S.stress = clamp(S.stress - 40, 0, 100); S.energy = 0; S.rested = true; S.hype = Math.max(0, S.hype - 3);
  LN.feedPost(S, 'P', pick(['Offline for a bit. Back soon. 🌴', 'Recharging. Thank you for the patience. ☀️', 'Phone off. Ocean on.']), Math.round(LN.totalFans(S) * 0.02));
  return { ok: true, msg: `You spent ${LN.money(cost)} on a vacation. Health +30, stress -40.` };
};

// ---------- end of week ----------
LN.endWeek = function (S) {
  if (S.retired) return { lines: [] };
  S.weekReport = [];
  const events = [];
  // overwork
  if (!S.rested && S.energy < 10) { S.health = clamp(S.health - 6, 0, 100); S.stress = clamp(S.stress + 8, 0, 100); S.weekReport.push('You ended the week exhausted. Health dropped.'); }
  else if (S.energy > 30 || S.rested) S.health = clamp(S.health + 3 + ((D.HOMES.find(x => x.id === S.home) || {}).rest || 0) / 4, 0, 100);
  S.stress = clamp(S.stress - 3, 0, 100);
  if (S.cityFatigue) for (const c in S.cityFatigue) { S.cityFatigue[c] *= 0.8; if (S.cityFatigue[c] < 0.02) delete S.cityFatigue[c]; }
  // scheduled releases that come out this week
  for (const rel of S.releases) if (rel.week === S.week && !rel.out) LN.releaseGoesOut(S, rel);
  // world
  npcWeek(S);
  LN.trendWeek(S);
  LN.systemsWeekPre && LN.systemsWeekPre(S, events);
  computeCharts(S);
  LN.economyWeek(S);
  LN.fanWeek(S);
  LN.systemsWeekPost && LN.systemsWeekPost(S, events);
  LN.checkCerts(S);
  // advance time
  S.ledgerHist.unshift(Object.assign({ w: S.week }, S.ledger)); if (S.ledgerHist.length > 52) S.ledgerHist.length = 52; S.ledger = {};
  S.week++;
  if (S.week % 52 === 0) LN.newYear(S, events);
  if (S.sick > 0) S.sick--;
  S.rested = false; S.week_ = {};
  S.hype = Math.max(0, S.hype * 0.93 - 0.3);
  if (S.health < 22 && !S.sick) { S.sick = 2; events.push({ kind: 'note', title: 'Burnout', text: 'Your body gave out. Doctors ordered you to slow down for two weeks. Your energy is capped at 30 and tour dates this week are cancelled.' }); LN.timeline(S, 'Burned out and had to take time off.', 'life'); if (LN.isTouring(S)) S.tour.cancelNext = 2; }
  let e = LN.maxEnergy(S);
  if (LN.isTouring(S)) e -= 40; if (S.movie && S.movie.stage === 'shoot') e -= 35;
  S.energy = Math.max(10, e);
  LN.expireInbox(S);
  const ach = LN.checkAchievements(S);
  return { lines: S.weekReport.slice(), events, ach };
};

LN.releaseGoesOut = function (S, rel) {
  rel.out = true; rel.week = S.week;
  rel.songs.forEach((id, i) => { const s = LN.song(S, id); if (!s) return; if (!s.rel || rel.type !== 'deluxe' && rel.type !== 'live') { if (!s.rel) { s.rel = rel.id; s.relWeek = S.week; } } if (rel.type === 'single' || rel.type === 'remix' || id === rel.lead) s.focus = true; });
  if (rel.type === 'deluxe') { const base = LN.rel(S, rel.base); if (base) { base.deluxeBoost = S.week + 3; for (const id of rel.songs) { const s = LN.song(S, id); if (s && !base.songs.includes(id)) base.songs.push(id); } } }
  if (rel.type === 'remix') { const o = LN.song(S, rel.orig); if (o) o.remixBoost = S.week + 6; }
  if (rel.reRecord) { const base = LN.rel(S, rel.base); if (base) { base.halved = true; base.songs.forEach(id => { const s = LN.song(S, id); if (s) s.halved = true; }); } }
  S.hype = clamp(S.hype + (rel.type === 'album' ? 18 : rel.type === 'ep' ? 10 : 6) + (rel.teasers ? 8 : 0) + (rel.prehype || 0), 0, 100);
  if (S.label) rel.label = S.label.id; rel.masters = S.label && S.label.masters === 'label' ? S.label.id : 'artist';
  if (S.label && (rel.type === 'album' || rel.type === 'joint')) { S.label.delivered++; S.label.lastAlbum = S.week; }
  // rival clash
  const rivals = S.npcs.filter(n => n.rival && n.active); if (rivals.length && chance(0.3)) { const r = pick(rivals); npcRelease(S, r); rel.clash = r.id; S.weekReport.push(`${r.name} released a song the same week as you to steal your thunder.`); }
  LN.reviewRelease(S, rel);
  LN.timeline(S, `Released the ${LN.relTypeName(rel.type).toLowerCase()} "${rel.title}"`, 'release');
  if (rel.type === 'album' || rel.type === 'joint') LN.legacy(S, 10);
  LN.news(S, `${S.artist.name} released ${LN.relTypeName(rel.type) === 'Album' ? 'the album' : 'the ' + LN.relTypeName(rel.type).toLowerCase()} "${rel.title}".`, 'you');
  // fans react on social
  const fans = LN.totalFans(S); LN.feedPost(S, 'P', `"${rel.title}" is out now. 💿`, Math.round(fans * rnd(0.02, 0.06)), { rel: rel.id });
  if (rel.partner) { const n = LN.npc(S, rel.partner); if (n) n.rel = clamp(n.rel + 10, -100, 100); }
};
LN.relTypeName = t => ({ single: 'Single', ep: 'EP', album: 'Album', deluxe: 'Deluxe edition', live: 'Live album', joint: 'Joint album', remix: 'Remix' }[t] || t);

LN.reviewRelease = function (S, rel) {
  const qs = rel.songs.map(id => (LN.song(S, id) || { q: 40 }).q); const avg = sum(qs) / qs.length;
  const fams = new Set(rel.songs.map(id => (LN.song(S, id) || {}).fam)); const cohesion = fams.size <= 1 ? 3 : fams.size === 2 ? 1 : -2 * (fams.size - 2);
  if (rel.type === 'single' && avg < 60 && LN.fame(S) < 40) { rel.reviews = []; rel.score = null; return; }
  const pub = LN.teamPower(S, 'publicist');
  const base = avg / 10 + cohesion * 0.15 + pub * 0.12 - S.pressPenalty * 0.05 + (rel.type === 'live' ? -0.3 : 0) + (S.image.messy > 40 ? -0.3 : 0);
  rel.reviews = D.OUTLETS.slice().sort(() => Math.random() - 0.5).slice(0, rel.type === 'single' ? 3 : 5).map(o => {
    const sc = clamp(base + gauss() * 0.7, 1, 10); return { outlet: o, score: Math.round(sc * 10) / 10, quote: LN.reviewQuote(sc, rel) };
  });
  rel.score = Math.round(sum(rel.reviews.map(r => r.score)) / rel.reviews.length * 10) / 10;
  if (rel.score >= 8) LN.legacy(S, 6);
  if (rel.score >= 8.5) LN.news(S, `Critics are calling "${rel.title}" one of the best releases of the year.`, 'you');
  else if (rel.score < 4.5) LN.news(S, `Critics were not kind to "${rel.title}".`, 'you');
};
LN.reviewQuote = (sc, rel) => {
  const hi = ['A confident, career-best statement.', 'Every song earns its place.', 'Sounds like the future of the genre.', 'Immaculate from front to back.', 'Hooks for days, and real heart underneath.'];
  const mid = ['Solid, if a little safe.', 'A few great moments in a crowded tracklist.', 'Shows promise but plays it close.', 'Enjoyable, with some filler.', 'The singles shine; the rest blurs.'];
  const lo = ['Sounds like it was made in a hurry.', 'Forgettable at best.', 'A misfire from an artist who can do better.', 'Lots of noise, very little to say.', 'Hard to recommend.'];
  return pick(sc >= 7.5 ? hi : sc >= 5 ? mid : lo);
};

// release creation
LN.validateRelease = function (S, o) {
  const songs = (o.songs || []).map(id => LN.song(S, id)).filter(Boolean);
  const t = o.type;
  if (!o.title || !o.title.trim()) return 'Give the release a title.';
  if (t === 'remix' || t === 'live') return null;
  if (songs.some(s => !s.recorded)) return 'Every song has to be recorded first.';
  if (t !== 'deluxe' && songs.some(s => s.rel)) return 'Some of those songs are already out.';
  if (t === 'single' && (songs.length < 1 || songs.length > 3)) return 'A single has 1 to 3 songs (the A-side plus B-sides).';
  if (t === 'ep' && (songs.length < 3 || songs.length > 6)) return 'An EP has 3 to 6 songs.';
  if (t === 'album' && (songs.length < 7 || songs.length > 20)) return 'An album has 7 to 20 songs.';
  if (t === 'joint' && (songs.length < 5 || !o.partner)) return 'A joint album needs a partner artist and at least 5 songs.';
  if (t === 'deluxe') { const b = LN.rel(S, o.base); if (!b || b.type !== 'album') return 'Pick one of your albums for the deluxe edition.'; if (b.deluxe) return 'That album already has a deluxe edition.'; if (songs.length < 2 || songs.length > 8) return 'A deluxe edition adds 2 to 8 new songs.'; if (songs.some(s => s.rel)) return 'Deluxe songs must be new.'; }
  return null;
};
LN.rolloutCost = (S, o) => (o.teasers ? Math.round(1500 + LN.totalFans(S) * 0.004) : 0) + (o.presave ? Math.round(1000 + LN.totalFans(S) * 0.003) : 0);
LN.createRelease = function (S, o) {
  const err = LN.validateRelease(S, o); if (err) return { ok: false, msg: err };
  if (o.type === 'joint') { const n = LN.npc(S, o.partner); const p = LN.featureChance(S, o.partner) * (n && n.rel >= 15 ? 1.2 : 0.6); if (!n || !chance(clamp(p, 0, 0.98))) return { ok: false, msg: `${n ? n.name : 'They'} turned down the joint album. Build a better relationship first (feature on each other's songs).`, declined: true }; }
  const cost = LN.rolloutCost(S, o); if (S.money < cost) return { ok: false, msg: `The rollout costs ${LN.money(cost)}.` };
  LN.spend(S, 'promotion', cost);
  const rel = { id: uid('r'), type: o.type, title: o.title.trim().slice(0, 48), songs: o.songs.slice(), lead: o.lead || o.songs[0], week: S.week + (o.delay || 0), out: false,
    cover: o.cover || null, teasers: !!o.teasers, presave: !!o.presave, prehype: 0, partner: o.partner || null, base: o.base || null, units: 0, sales: 0, ch: {}, pts: 0, reviews: [], score: null, eraLook: o.eraLook ? JSON.parse(JSON.stringify(S.look)) : null };
  if (o.type === 'joint') rel.songs.forEach(id => { const s = LN.song(S, id); if (s && !s.feat) s.feat = o.partner; });
  if (o.type === 'deluxe') { const b = LN.rel(S, o.base); b.deluxe = rel.id; }
  if (rel.eraLook) S.eras.push({ rel: rel.id, title: rel.title, look: rel.eraLook, w: rel.week });
  S.releases.push(rel);
  if (rel.week === S.week) LN.releaseGoesOut(S, rel);
  return { ok: true, rel, msg: rel.week === S.week ? `"${rel.title}" is out now. Charts update when you end the week.` : `"${rel.title}" comes out in ${o.delay} week${o.delay > 1 ? 's' : ''} (${LN.dateLabel(S, rel.week)}).` };
};
LN.createRemix = function (S, songId, producerId) {
  const o = LN.song(S, songId); if (!o || !o.rel) return { ok: false, msg: 'Only released songs can be remixed.' };
  if (o.remixed) return { ok: false, msg: 'That song already has a remix.' };
  const pr = D.PRODUCERS.find(x => x.id === producerId) || D.PRODUCERS[0]; const cost = pr.fee + 500;
  if (S.money < cost) return { ok: false, msg: `The remix costs ${LN.money(cost)}.` };
  if (!LN.useEnergy(S, 15)) return { ok: false, msg: 'Not enough energy.' };
  LN.spend(S, 'recording', cost); o.remixed = true;
  const s = LN.makeSong(S, { title: o.title + ' (Remix)', genre: o.genre, mood: o.mood, topic: o.topic, tempo: 'fast' }, o.wq);
  s.recorded = true; s.q = Math.round(clamp(o.q * 0.85 + (pr.id === 'self' ? S.skills.prod : pr.skill) * 0.2 + rnd(-3, 4), 5, 99)); s.isRemix = o.id; S.stats.songsWritten--;
  const rel = { id: uid('r'), type: 'remix', title: s.title, songs: [s.id], lead: s.id, orig: o.id, week: S.week, out: false, units: 0, sales: 0, ch: {}, pts: 0, reviews: [], score: null };
  S.releases.push(rel); LN.releaseGoesOut(S, rel);
  return { ok: true, msg: `"${s.title}" is out, and it is giving the original a boost.` };
};
LN.canReRecord = (S, rel) => rel && rel.masters && rel.masters !== 'artist' && (!S.label || S.label.id !== rel.masters) && rel.type !== 'single' && !rel.reRecorded && !rel.reRecord;
LN.reRecord = function (S, relId) {
  const b = LN.rel(S, relId); if (!LN.canReRecord(S, b)) return { ok: false, msg: 'You can only re-record releases whose masters a label owns, after that contract ends.' };
  const cost = 20000 + b.songs.length * 4000; if (S.money < cost) return { ok: false, msg: `Re-recording costs ${LN.money(cost)}.` };
  if (!LN.useEnergy(S, 40)) return { ok: false, msg: 'You need 40 energy to re-record an album.' };
  LN.spend(S, 'recording', cost); b.reRecorded = true;
  const ids = b.songs.map(id => { const o = LN.song(S, id); const s = LN.makeSong(S, { title: o.title + ` (${S.artist.name}'s Version)`, genre: o.genre, mood: o.mood, topic: o.topic, tempo: o.tempo }, o.wq + 2);
    s.recorded = true; s.q = clamp(o.q + ri(1, 5), 5, 100); s.reRecord = true; S.stats.songsWritten--; return s.id; });
  const rel = { id: uid('r'), type: b.type === 'ep' ? 'ep' : 'album', title: b.title + ` (${S.artist.name}'s Version)`, songs: ids, lead: ids[0], base: b.id, reRecord: true, week: S.week, out: false, units: 0, sales: 0, ch: {}, pts: 0, reviews: [], score: null, cover: b.cover };
  S.releases.push(rel); LN.releaseGoesOut(S, rel); rel.masters = 'artist'; LN.moodAll(S, 10); S.hype = clamp(S.hype + 15, 0, 100);
  return { ok: true, msg: `"${rel.title}" is out. Fans are switching to the version you own.` };
};
LN.project = function (S, o) {
  // first-week projection with no randomness
  const songs = o.songs.map(id => LN.song(S, id)).filter(Boolean);
  const fake = { id: '__proj', type: o.type, songs: songs.map(s => s.id), week: S.week, out: true, presave: o.presave, label: S.label ? S.label.id : null };
  S.releases.push(fake); const saved = songs.map(s => [s, s.rel, s.relWeek, s.focus]);
  songs.forEach((s, i) => { s.rel = '__proj'; s.relWeek = S.week; s.focus = o.type === 'single' ? i === 0 : s.id === (o.lead || songs[0].id); });
  const hype0 = S.hype; S.hype = clamp(S.hype + (o.type === 'album' ? 18 : o.type === 'ep' ? 10 : 6) + (o.teasers ? 8 : 0), 0, 100);
  const res = { streams: 0, regions: {}, units: 0 };
  try {
    for (const r of D.REGION_IDS) {
      let st = 0; const lead = songs.find(s => s.focus) || songs[0];
      for (const s of songs) st += songStreams(S, s, r, true);
      const leadSt = songStreams(S, lead, r, true);
      const singles = (S.charts && S.charts[r] && S.charts[r].s) || [];
      const pts = leadSt / 150 + leadSt / 450; let pos = singles.findIndex(e => e.v < pts) + 1; if (!pos) pos = singles.length < 100 ? singles.length + 1 : 0;
      const reg = { streams: st, pos };
      if (o.type !== 'single') { const u = albumUnits(S, fake, r, st, true); const al = (S.charts && S.charts[r] && S.charts[r].a) || []; let ap = al.findIndex(e => e.v < u) + 1; if (!ap) ap = al.length < 100 ? al.length + 1 : 0; reg.units = u; reg.apos = ap; res.units += u; }
      res.regions[r] = reg; res.streams += st;
    }
  } finally {
    S.hype = hype0; S.releases.pop(); saved.forEach(([s, r, w, f]) => { s.rel = r; s.relWeek = w; s.focus = f; });
  }
  return res;
};

// ---------- economy ----------
LN.payShare = (S, rel) => { if (!rel || !rel.label) return 0.85; if (rel.masters === 'artist') return 0.6; return S.label && S.label.id === rel.label ? S.label.royalty : 0.18; };
LN.economyWeek = function (S) {
  const k = dif(S).inc; let streamInc = 0, salesInc = 0, recoup = 0;
  for (const s of S.songs) {
    if (!s.weekStreams) continue; const rel = LN.rel(S, s.rel); const share = LN.payShare(S, rel) * (1 - s.share * 0.5);
    const gross = s.weekStreams * 0.003 + (rel && rel.type === 'single' ? s.weekStreams / 450 * 0.69 : 0);
    let net = gross * share * k;
    if (rel && rel.label && S.label && S.label.id === rel.label && rel.masters !== 'artist' && S.label.recoup > 0) { const r = Math.min(S.label.recoup, net); S.label.recoup -= r; net -= r; recoup += r; }
    streamInc += net; s.revenue = (s.revenue || 0) + net; s.weekStreams = 0;
  }
  for (const rel of S.releases) {
    if (!rel.weekUnits) continue; const share = LN.payShare(S, rel); let net = rel.weekUnits * 0.55 * 8 * share * k;
    if (rel.label && S.label && S.label.id === rel.label && rel.masters !== 'artist' && S.label.recoup > 0) { const r = Math.min(S.label.recoup, net); S.label.recoup -= r; net -= r; recoup += r; }
    salesInc += net; rel.revenue = (rel.revenue || 0) + net; rel.weekUnits = 0;
  }
  const mgr = S.team.manager ? D.TEAM.manager.tiers[S.team.manager - 1].cut : 0;
  LN.earn(S, 'streaming', streamInc * (1 - mgr)); LN.earn(S, 'sales', salesInc * (1 - mgr));
  if (recoup) S.weekReport.push(`${LN.money(recoup)} of your royalties went to paying back your label advance.`);
  // merch online sales
  for (const m of S.merch) {
    if (m.stock <= 0) continue; const it = D.MERCH.find(x => x.id === m.item); const pf = clamp(it.price / m.price, 0.3, 1.8);
    const sold = Math.min(m.stock, Math.round(LN.totalFans(S) * 0.00035 * pf * (1 + S.hype / 100) * rnd(0.7, 1.3) * (LN.teamPower(S, 'stylist') * 0.1 + 1)));
    m.stock -= sold; m.sold += sold; LN.earn(S, 'merch', sold * m.price * k);
  }
  // costs
  const home = D.HOMES.find(h => h.id === S.home) || D.HOMES[0]; LN.spend(S, 'living', 120 + home.upkeep);
  for (const c of S.cars) LN.spend(S, 'living', (D.CARS.find(x => x.id === c) || { upkeep: 0 }).upkeep);
  for (const r in S.team) if (S.team[r]) LN.spend(S, 'team', D.TEAM[r].tiers[S.team[r] - 1].pay);
  if (S.loan && S.loan.weeks > 0) { LN.spend(S, 'loan', S.loan.weekly); S.loan.weeks--; if (!S.loan.weeks) { S.weekReport.push('You paid off your student loan.'); S.loan = null; } }
  if (S.money < 0) { const i = Math.round(-S.money * 0.01); LN.spend(S, 'interest', i); if (S.week % 4 === 0) S.weekReport.push(`You are ${LN.money(-S.money)} in debt and paying interest. Play gigs or sell something.`); }
  // investments
  for (const id in S.invest) { const inv = D.INVESTMENTS.find(x => x.id === id); if (!inv) continue; S.invest[id] = Math.max(0, S.invest[id] * (1 + inv.yr / 52 + gauss() * inv.vol / Math.sqrt(52))); }
  // product lines
  for (const p of S.products) { const inc = Math.max(0, (LN.fame(S) - 30) * p.scale * rnd(0.6, 1.4) * 900); p.earned += inc; LN.earn(S, 'brands', inc * k); }
  for (const d of S.deals) if (d.until >= S.week && d.weekly) LN.earn(S, 'brands', d.weekly * k);
  S.deals = S.deals.filter(d => d.until >= S.week);
  if (S.ownLabel) LN.ownLabelWeek(S);
};

// ---------- fans ----------
LN.FAN_CAP = { NA: 110e6, EU: 140e6, LA: 80e6, AS: 170e6 };
LN.sat = (S, r) => Math.pow(Math.max(0, 1 - S.fans[r] / LN.FAN_CAP[r]), 2);
LN.fanWeek = function (S) {
  let gained = 0; const conv = 0.003 / (1 + LN.totalFans(S) / 2e7);
  for (const s of S.songs) {
    if (!s.cur) continue;
    for (const r of D.REGION_IDS) { const st = (s.reach || {})[r] || 0; const g = st * conv * clamp(LN.appeal(s.q), 0.15, 1.4) * LN.sat(S, r); S.fans[r] += g; gained += g; }
    s.cur = null; s.reach = null;
  }
  const lastRel = Math.max(-99, ...S.releases.filter(r => r.out).map(r => r.week));
  const quiet = S.week - lastRel;
  for (const r of D.REGION_IDS) {
    let churn = 0.0025 + (quiet > 40 ? 0.003 : 0) + (S.mood[r] < 35 ? 0.003 : 0);
    if (S.fanClub) churn *= 1 - Math.min(0.5, S.fanClub / 200);
    const lost = S.fans[r] * churn; S.fans[r] -= lost; gained -= lost;
    S.mood[r] = clamp(S.mood[r] + (55 - S.mood[r]) * 0.05 - (quiet > 30 ? 0.6 : 0) - ((S.week - (S.lastPost || 0)) > 6 ? 0.4 : 0), 0, 100);
  }
  if (S.fandom) S.fanClub = clamp(S.fanClub + (S.mood.NA + S.mood.EU) / 200 - 0.3, 0, 100);
  S.stats.fanDelta = gained;
};

// ---------- trends ----------
LN.trendWeek = function (S) {
  for (const f of D.FAMILIES) S.trends[f] = clamp(S.trends[f] + (1 - S.trends[f]) * 0.03 + gauss() * 0.025, 0.6, 1.5);
  if (chance(0.03)) { const f = pick(D.FAMILIES); S.trends[f] = clamp(S.trends[f] + 0.28, 0.6, 1.5); LN.news(S, `${D.FAMILY_NAME[f]} is having a moment. Listeners are flocking to the genre.`, 'trend'); }
  if (chance(0.02)) { const f = pick(D.FAMILIES); S.trends[f] = clamp(S.trends[f] - 0.22, 0.6, 1.5); LN.news(S, `Analysts say ${D.FAMILY_NAME[f]} is cooling off on streaming.`, 'trend'); }
};

// ---------- certifications ----------
LN.CERTS = [[500000, 'Gold'], [1000000, 'Platinum'], [2000000, '2× Platinum'], [3000000, '3× Platinum'], [5000000, '5× Platinum'], [10000000, 'Diamond']];
LN.certName = lvl => lvl ? LN.CERTS[lvl - 1][1] : '';
LN.songUnits = s => (s.streams / 150 + s.sales) * 0.32;
LN.checkCerts = function (S) {
  const check = (o, units, label) => {
    let lvl = 0; for (let i = 0; i < LN.CERTS.length; i++) if (units >= LN.CERTS[i][0]) lvl = i + 1;
    if (lvl > (o.cert || 0)) { o.cert = lvl; const nm = LN.CERTS[lvl - 1][1]; S.weekReport.push(`${label} "${o.title}" went ${nm}!`); LN.timeline(S, `"${o.title}" was certified ${nm}`, 'cert');
      LN.legacy(S, nm === 'Diamond' ? 25 : nm === 'Gold' ? 2 : 4); S.flags.cert = Math.max(S.flags.cert || 0, lvl); }
  };
  for (const s of S.songs) if (s.rel) check(s, LN.songUnits(s), 'Your song');
  for (const r of S.releases) if (r.out && r.type !== 'single' && r.type !== 'remix' && r.type !== 'deluxe') check(r, r.units * 0.32, 'Your ' + LN.relTypeName(r.type).toLowerCase());
};

// ---------- inbox ----------
LN.expireInbox = S => { const gone = S.inbox.filter(i => i.exp < S.week && !i.sticky); S.inbox = S.inbox.filter(i => i.exp >= S.week || i.sticky); return gone; };

// ---------- saving ----------
LN.prune = S => {
  if (S.timeline.length > 300) S.timeline.splice(1, S.timeline.length - 300);
  const keys = Object.keys(S.shows_).sort((a, b) => S.shows_[a].week - S.shows_[b].week); while (keys.length > 9) delete S.shows_[keys.shift()];
  const sold = S.merch.filter(m => m.stock <= 0); if (sold.length > 10) { const drop = new Set(sold.slice(0, sold.length - 10).map(m => m.id)); S.merch = S.merch.filter(m => !drop.has(m.id)); }
  if (S.shows.length > 30) S.shows.length = 30;
  for (const t of ['s', 'a']) { const T = (S.yearTally || {})[t]; if (!T) continue; const ks = Object.keys(T); if (ks.length > 250) { ks.sort((a, b) => T[b].v - T[a].v); for (const k of ks.slice(250)) delete T[k]; } }
};
const SKIP = { cur: 1, reach: 1, _ev: 1, rw: 1 };
const packCh = ch => { const o = {}; for (const k in ch) { const m = ch[k]; o[k] = [m.peak, m.wks, m.debut]; } return o; };
const unpackCh = ch => { const o = {}; for (const k in ch) { const m = ch[k]; o[k] = Array.isArray(m) ? { peak: m[0], wks: m[1], debut: m[2] } : m; } return o; };
const packCharts = C => { if (!C) return C; const o = {}; for (const r in C) { o[r] = {}; for (const t in C[r]) o[r][t] = C[r][t].map(e => [e.k, e.P ? 1 : 0, Math.round(e.v), e.last, e.peak || 0, e.wks || 0, e.isNew ? 1 : 0, e.newPeak ? 1 : 0]); } return o; };
function unpackCharts(S) {
  const C = S.charts; if (!C || !C.NA || !Array.isArray((C.NA.s || [])[0] || [])) return;
  const songs = new Map(); for (const s of S.npcSongs) songs.set(s.id, s); const albums = new Map(); for (const a of S.npcAlbums) albums.set(a.id, a);
  for (const r in C) for (const t in C[r]) C[r][t] = C[r][t].map((x, i) => {
    const [k, P, v, last, peak, wks, isNew, newPeak] = x; const e = { k, v, pos: i + 1, last, peak, wks, isNew: !!isNew, newPeak: !!newPeak };
    if (P) { e.P = true; const o = t === 'a' ? LN.rel(S, k) : LN.song(S, k); if (!o) return null; e.t = o.title;
      e.ar = S.artist.name + (o.feat ? ' feat. ' + LN.artistName(S, o.feat) : '') + (o.partner ? ' & ' + LN.artistName(S, o.partner) : ''); if (t !== 'a') { const rel = LN.rel(S, o.rel); if (rel && rel.partner) e.ar += ' & ' + LN.artistName(S, rel.partner); } }
    else { const o = t === 'a' ? albums.get(k) : songs.get(k); if (!o) return null; e.t = o.title; e.npc = o.npc; e.feat = o.feat; e.ar = LN.artistName(S, o.npc) + (o.feat ? ' feat. ' + LN.artistName(S, o.feat) : ''); }
    return e; }).filter(Boolean);
}
LN.serialize = S => { LN.prune(S); return JSON.stringify(S, (k, v) => SKIP[k] || v === null || v === false ? undefined : k === 'ch' && v && typeof v === 'object' ? packCh(v) : k === 'charts' ? packCharts(v) : typeof v === 'number' ? (Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 1000) / 1000) : v); };
LN.deserialize = txt => {
  const S = JSON.parse(txt); if (!S || !S.v) return null;
  for (const arr of [S.songs, S.releases, S.npcSongs, S.npcAlbums]) for (const o of arr || []) if (o.ch) o.ch = unpackCh(o.ch);
  const reg = {}; for (const n of S.npcs) reg[n.id] = n.region;
  for (const o of S.npcSongs.concat(S.npcAlbums)) o.rw = regW(o.fam, reg[o.npc] || 'NA');
  for (const k of ['label', 'ownLabel', 'tour', 'movie', 'beef', 'fandom', 'loan', 'charts']) if (S[k] === undefined) S[k] = null;
  unpackCharts(S); return S;
};
})(typeof window !== 'undefined' ? window : globalThis);
