/* The Eras Life: game engine. Week-by-week loop, stages, requirements, stats, saves. */
(function () {
const ER = window.ER;
const G = window.G = {};
const W = ER.ds;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
G.clamp = clamp; G.rnd = rnd; G.pick = pick;
let S = null;
G.S = () => S;
G.set = s => { S = s; };
const DIFF = { easy:{ blocks:6, pen:.5, l:'Easy' }, standard:{ blocks:5, pen:1, l:'Standard' }, hard:{ blocks:4, pen:1.5, l:'Hard' } };
G.DIFF = DIFF;
const FREE_START = W('2027-01-01');
G.FREE_START = FREE_START;

/* ---------- Helpers ---------- */
G.art = () => ER.artists[S.artist];
G.allProjects = () => {
  const A = G.art();
  const real = S.mode === 'story' ? A.projects : A.projects.filter(p => S.started.includes(p.id));
  return real.concat(S.custom || []);
};
G.proj = id => G.art().projects.find(p => p.id === id) || (S.custom || []).find(p => p.id === id);
G.pj = id => (S.pj[id] = S.pj[id] || { fin:{}, pre:{}, rel:{}, tp:{}, missed:0, hype:0, singles:[], edition:'standard', shift:0 });
G.win = p => {
  const sh = (S.pj[p.id] && S.pj[p.id].shift) || 0, f = v => v == null ? null : v + sh;
  const w = { ws:f(p.ws), rs:f(p.rs), fs:f(p.fs), ps:f(p.ps), rel:f(p.rel) };
  if (p.type === 'demos') { w.we = W('2006-10-01'); return w; }
  const t = p.tour;
  if (t && t.kind !== 'cancelled' && !(S.pj[p.id] && S.pj[p.id].tourCancelled)) { w.ts = f(t.ts); w.te = f(t.te); w.tps = p.type === 'farewell' ? w.ts - 8 : Math.max(w.rel + 1, w.ts - 8); }
  return w;
};
G.stageOf = (p, a) => {
  const w = G.win(p);
  if (p.type === 'demos') return a >= w.ws && a < w.we ? 'write' : 'none';
  if (p.type === 'farewell') { if (w.ts == null) return 'none'; if (a >= w.tps && a < w.ts) return 'tourprep'; if (a >= w.ts && a <= w.te) return 'tour'; return 'none'; }
  if (w.ws != null && a >= w.ws && a < w.rs) return 'write';
  if (a >= w.rs && a < w.fs) return 'record';
  if (a >= w.fs && a < w.ps) return 'finish';
  if (a >= w.ps && a < w.rel) return 'pre';
  if (a === w.rel) return 'release';
  if (w.ts != null) {
    if (a > w.rel && a < w.tps) return 'promo';
    if (a >= w.tps && a < w.ts) return 'tourprep';
    if (a >= w.ts && a <= w.te) return 'tour';
    if (a > w.te && a <= w.te + 10) return 'rest';
  } else {
    if (a > w.rel && a <= w.rel + 20) return 'promo';
    if (a > w.rel + 20 && a <= w.rel + 30) return 'rest';
  }
  return 'none';
};
G.active = (a) => {
  a = a == null ? S.abs : a;
  return G.allProjects().map(p => ({ p, st:G.stageOf(p, a) })).filter(x => x.st !== 'none');
};
// The current era: the latest project whose announcement (or release) has come.
G.currentEra = () => {
  let best = null;
  G.allProjects().forEach(p => { if (p.type === 'demos' || p.type === 'edition') return; const w = G.win(p); if (S.abs >= (w.ps != null ? w.ps : w.rel) && (!best || G.win(best).rel <= w.rel)) best = p; });
  return best;
};
// Real-world conditions on today's date (never in free play, which is after 2026).
G.world = k => !S.flags.free && !!ER.inWorld && ER.inWorld(k, S.abs);
G.worldNotes = () => Object.keys(ER.WORLD_NOTES || {}).filter(k => G.world(k)).map(k => ER.WORLD_NOTES[k]);
G.findEvent = id => G.art().events.find(x => x.id === id) || (ER.WORLD || []).find(x => x.id === id);
G.age = () => { const born = G.art().born; return Math.floor((S.abs - born) / 52); };
G.yw = () => ER.yw(S.abs);
G.fmtDate = abs => { const d = ER.dateOf(abs); return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', timeZone:'UTC' }); };
G.fmtN = n => { n = Math.round(n); const a = Math.abs(n); if (a >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B'; if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; if (a >= 1e4) return Math.round(n / 1e3) + 'K'; if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; return String(n); };
G.fmtM = n => (n < 0 ? '−$' : '$') + G.fmtN(Math.abs(n));
G.blocks = () => { if (S.week.forcedRest) return 1; return DIFF[S.diff].blocks + (S.flags.easyBlocks || 0); };
G.canon = () => S.canon.total ? Math.round(S.canon.hit / S.canon.total * 100) : 100;
G.unlocked = tab => {
  if (S.mode !== 'story') return true;
  if (tab === 'eggs' && S.flags.eggs) return true;
  const u = G.art().tabUnlock[tab]; return u == null || S.abs >= u;
};
G.uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- New game ---------- */
G.newGame = function (o) {
  const A = ER.artists[o.artist || 'taylor'];
  S = {
    capCache:20000, mom:1, v:1, artist:A.id, mode:o.mode || 'story', diff:o.diff || 'standard', slot:o.slot || 1, look:o.look,
    abs:A.startAbs, created:Date.now(),
    stats:{ fans:60, rep:50, heat:0, write:12, clout:0, own:0, energy:100, money:2000, team:60, genre:5 },
    canon:{ hit:0, total:0 }, songs:{}, pj:{}, custom:[], started:[], released:[],
    week:{ used:0, done:{}, pending:[], forcedRest:false }, seen:{}, log:[], inbox:[], duties:[], sponsors:[],
    eggs:{ planted:[], log:[], fatigue:0, decoded:0 }, feed:[], awards:[], charts:{ albums:[], singles:[] },
    recap:null, years:{}, routine:[], ach:{}, goals:{}, flags:{}, priorities:[], recovery:null, history:[],
    rivalsSeen:{}, modal:[], ffStop:'', journal:[], guide:{} };
  if (o.prologue) o.prologue.forEach((ci, i) => { const c = A.prologue[i].ch[ci]; applyFx(c.fx); scoreCanon(!!c.c); S.log.push({ abs:A.born + i * 200, id:'pro' + i, t:A.prologue[i].t, l:c.l, canon:!!c.c, truth:A.prologue[i].truth }); });
  if (S.mode === 'era') setupEra(o.era);
  inbox('family', 'A new start', S.mode === 'story' ? 'Every week you get Time Blocks to spend. Required tasks come first. Real events interrupt with a decision. Press Advance Week when you are done.' : 'Era Start: the event track is off, and you control the calendar for this era.');
  startWeek();
  return S;
};
// Era Start: begin at a chosen era with that moment's catalog and team.
const ERA_PRESET = { ts1:[2e3,45,8,25,6,0,4e4,5], fearless:[9e5,62,30,45,30,0,2e6,15], speaknow:[8e6,72,45,55,55,0,1.5e7,22], red:[1.4e7,74,50,60,65,0,4e7,25],
  '1989':[2e7,70,60,65,72,0,8e7,40], rep:[3e7,40,75,72,80,0,1.6e8,55], lover:[4e7,60,55,74,82,40,2.5e8,60], folklore:[4.5e7,68,50,75,84,40,3e8,55],
  evermore:[5e7,74,45,78,86,40,3.2e8,85], midnights:[6e7,76,50,80,90,45,4e8,85], ttpd:[9e7,80,70,82,95,60,8e8,58], showgirl:[1e8,82,70,84,97,70,1.2e9,70] };
function setupEra(id) {
  const A = G.art(); const p = A.projects.find(x => x.id === id) || A.projects[1];
  // Stats come from the latest album with a preset that starts on or before this one.
  const first = p.ws != null ? p.ws : p.rs;
  const prior = A.projects.filter(q => ERA_PRESET[q.id] && (q.ws != null ? q.ws : q.rs) <= first).pop();
  if (A.id === 'taylor') {
    const ps = ERA_PRESET[prior ? prior.id : 'ts1'];
    Object.assign(S.stats, { fans:ps[0], rep:ps[1], heat:ps[2], write:ps[3], clout:ps[4], own:ps[5], money:ps[6], genre:ps[7] });
  } else {
    const yrs = Math.max(0, (first - A.startAbs) / 52), done = A.projects.filter(q => q.rel != null && q.rel < first).length;
    Object.assign(S.stats, { rep:68, heat:35, write:clamp(25 + done * 5, 20, 85), clout:clamp(10 + done * 8, 5, 95),
      own:A.id === 'beyonce' && first >= W('2011-03-28') ? 60 : clamp(done * 3, 0, 40), money:Math.round(2e5 + done * done * 4e6 + yrs * 1e5), genre:p.genre || 30 });
  }
  S.started = [p.id]; S.mom = 1;
  S.abs = p.ws != null ? p.ws : p.rs;
  // Earlier albums' songs are already out.
  A.projects.filter(q => q.rel != null && q.rel < S.abs && q.type !== 'rerecord').forEach(q => {
    q.tracks.forEach(t => S.songs[t] = { p:q.id, st:'released', q:70, co:'', abs:q.rel });
    (q.vault || []).forEach(t => S.songs[t] = { p:q.id, st:'vault', q:68, co:'', vault:true, abs:q.rel });
    S.released.push({ pid:q.id, abs:q.rel, fw:q.units || 0, total:(q.units || 0) * 4, q:70, peak:1, wk:0, real:q.units });
  });
  if (S.abs >= W('2019-08-19')) S.flags.rerecords = true;
  if (S.artist === 'taylor' && S.abs >= W('2016-09-12') && S.abs < W('2017-08-18')) S.flags.hidden = true;
  if (S.abs >= W('2017-08-18')) S.flags.hiddenDone = true;
  if (S.abs >= W('2014-09-22')) S.flags.secretsessions = true;
  if (S.abs >= W('2023-07-10')) S.flags.bracelets = true;
  const rr = A.projects.find(q => q.type === 'rerecord' && q.of && S.abs >= q.rel);
  A.projects.filter(q => q.type === 'rerecord' && q.rel < S.abs).forEach(q => { S.stats.own = Math.max(S.stats.own, 70); q.tracks.concat(q.vaultSongs || []).forEach(t => S.songs[t + " (Taylor's Version)"] = { p:q.id, st:'released', q:72, tv:true, of:t, abs:q.rel }); });
  S.flags.eggs = true;
  S.stats.fans = G.fanTarget(S.abs);
}

/* ---------- Effects ---------- */
function applyFx(fx, mult) {
  if (!fx) return;
  mult = mult || 1; const s = S.stats;
  for (const k in fx) {
    const v = fx[k] * (k === 'money' ? 1 : mult);
    if (k === 'fans') {
      if (G.curveMode()) { S.mom = clamp((S.mom || 1) + v / 100 * .1, .45, 1.6); s.fans = Math.max(10, s.fans * (1 + v / 400)); }
      else { const g = v > 0 ? s.fans * v / 100 * clamp(1 - s.fans / G.fanCap(), .01, 1) : s.fans * v / 100; s.fans = Math.max(10, s.fans + g); } }
    else if (k === 'money') s.money += v;
    else if (k === 'hype') { const e = G.currentEra() || G.active()[0] && G.active()[0].p; if (e) G.pj(e.id).hype = clamp(G.pj(e.id).hype + v, 0, 100); }
    else if (k === 'quality') { G.active().forEach(x => { G.pj(x.p.id).qmod = (G.pj(x.p.id).qmod || 0) + v; }); }
    else if (k === 'genre') s.genre = clamp(s.genre + v, 0, 100);
    else if (s[k] != null) s[k] = clamp(s[k] + v, 0, 100);
  }
}
G.applyFx = applyFx;
/* Fans follow the artist's real trajectory for each era, scaled by momentum: how well
   your choices, releases and rollouts are going compared with what really happened. */
G.curveMode = () => !!(ER.FAN_CURVE && ER.FAN_CURVE[S.artist]);
G.fanTarget = a => {
  const c = ER.FAN_CURVE[S.artist]; if (a <= c[0][0]) return c[0][1];
  for (let i = 1; i < c.length; i++) if (a <= c[i][0]) { const [a0, v0] = c[i - 1], [a1, v1] = c[i]; const t = (a - a0) / (a1 - a0); return Math.exp(Math.log(v0) + (Math.log(v1) - Math.log(v0)) * t); }
  // After the real track: slow growth that levels off, so the fan base never passes about 1.7x its 2026 size.
  const l = c[c.length - 1]; return l[1] * (1 + .7 * (1 - Math.exp(-(a - l[0]) / 700)));
};
G.momentum = () => S.mom || 1;
// Fan boosts saturate: how many fans you can reach depends on what you have released and played.
G.fanCap = () => S.capCache || 20000;
function updateCap() {
  const units = S.released.reduce((a, r) => a + r.total, 0);
  const tix = Object.values(S.pj).reduce((a, x) => a + (x.tour ? x.tour.tickets : 0), 0) + (S.openFans || 0);
  S.capCache = 20000 + S.stats.clout * 1000 + units * 2.2 + tix * 1.2;
}
function scoreCanon(hit) { S.canon.total++; if (hit) S.canon.hit++; }

/* ---------- Inbox and duties ---------- */
const FROM = { manager:'Your manager', publicist:'Your publicist', label:'The label', family:'Mom', collab:'A collaborator', promoter:'The promoter', fans:'Fan club' };
function inbox(from, subj, x, extra) { S.inbox.unshift(Object.assign({ id:G.uid(), abs:S.abs, from, subj, x, read:false }, extra || {})); if (S.inbox.length > 80) S.inbox.length = 80; }
G.inbox = inbox;
function duty(from, l, cost, due, pen, src) { S.duties.push({ id:'d' + G.uid(), from, l, cost, due, pen:pen || { team:-4, clout:-2 }, src:src || '' }); }
G.duty = duty;
function feed(x, h) { S.feed.unshift({ abs:S.abs, h:h || pick(ER.FAN_HANDLES), x }); if (S.feed.length > 60) S.feed.length = 60; }
G.feed = feed;

/* ---------- Songs ---------- */
G.writable = () => {
  const out = [];
  G.active().forEach(({ p, st }) => {
    if (!(st === 'write' || st === 'record' || (p.type === 'demos' && st === 'write'))) return;
    if (p.type === 'rerecord') return;
    const list = p.tracks.map(t => [t, 'album']).concat((p.extras || []).map(t => [t, 'bonus'])).concat((p.vault || []).map(t => [t, 'vault']));
    list.forEach(([t, kind]) => { if (!S.songs[t]) out.push({ t, p, kind }); });
  });
  return out;
};
G.writeSong = function (t, co, insp, appr) {
  const item = G.writable().find(x => x.t === t); if (!item) return null;
  const cw = G.art().cowriters[co] || { bonus:0 };
  let q = rnd(32, 52) + S.stats.write * .42 + cw.bonus + (item.p.solo && co === 'Solo' ? 5 : 0) + (S.flags.hidden ? 4 : 0) + (G.world('lockdown') ? 3 : 0) + (S.flags.focus ? 3 : 0);
  S.flags.focus = false;
  q = clamp(Math.round(q), 10, 100);
  // Writing what you know helps; a good fit between the subject and the approach helps more.
  let note = '';
  if (insp) { const ap = ER.APPROACHES.find(x => x.id === appr), real = insp.startsWith('card:');
    if (real) { q += 4; note = 'Write what you know.'; }
    if (ap && ap.fit.includes(real ? 'heartbreak' : insp)) { q += 3; note = (note ? note + ' ' : '') + 'The approach suits the subject.'; }
    else if (ap) q -= 1;
    q = clamp(Math.round(q), 10, 100); }
  const inspName = insp ? (insp.startsWith('card:') ? (S.log.find(l => l.id === insp.slice(5)) || {}).t : (ER.INSPIRATIONS.find(x => x.id === insp) || {}).n) : null;
  S.songs[t] = { p:item.p.id, st:'written', q, co, abs:S.abs, vault:item.kind === 'vault', kind:item.kind, insp:inspName || null, appr:appr || null, note };
  if (item.p.solo && co !== 'Solo') G.pj(item.p.id).notSolo = true;
  S.stats.write = clamp(S.stats.write + .6, 0, 100);
  if (!S.ach.firstsong) ach('firstsong');
  return S.songs[t];
};
G.recordable = () => {
  const out = [];
  G.active().forEach(({ p, st }) => {
    if (st !== 'record' && st !== 'finish') return;
    if (p.type === 'rerecord') {
      p.tracks.concat(p.vaultSongs || []).forEach(t => { const tv = t + " (Taylor's Version)"; if (!S.songs[tv]) out.push({ t, tv, p, vault:(p.vaultSongs || []).includes(t) }); });
    } else {
      p.tracks.concat(p.extras || []).concat(p.vault || []).forEach(t => { const s = S.songs[t]; if (s && s.st === 'written' && s.p === p.id) out.push({ t, p, vault:s.vault }); });
    }
  });
  return out;
};
G.recordSong = function (t, prod, pid, take) {
  const item = G.recordable().find(x => x.t === t && (!pid || x.p.id === pid)); if (!item) return null;
  const tk = take && ER.TAKES.find(x => x.id === take);
  const pb = rnd(0, 6) + (item.p.producers && item.p.producers[0] === prod ? 2 : 0) + (tk ? rnd(tk.q[0], tk.q[1]) : 0);
  if (tk) applyFx({ energy:tk.energy });
  if (item.p.type === 'rerecord') {
    const orig = S.songs[t]; const base = orig ? orig.q : 62;
    S.songs[item.tv] = { p:item.p.id, st:'recorded', q:clamp(Math.round(base + pb + 4), 10, 100), co:orig ? orig.co : '', prod, abs:S.abs, vault:item.vault, tv:true, of:t };
  } else {
    const s = S.songs[t]; s.st = 'recorded'; s.prod = prod; s.q = clamp(Math.round(s.q + pb), 10, 100); s.rabs = S.abs;
  }
  return true;
};
function counts(p) {
  if (p.type === 'rerecord') {
    const all = p.tracks.concat(p.vaultSongs || []);
    const rec = all.filter(t => S.songs[t + " (Taylor's Version)"]).length;
    return { target:all.length, written:all.length, recorded:rec };
  }
  const written = p.tracks.filter(t => S.songs[t]).length;
  const recorded = p.tracks.filter(t => S.songs[t] && S.songs[t].st !== 'written').length;
  return { target:p.tracks.length, written, recorded };
}
G.counts = counts;

/* ---------- Tasks ---------- */
const T = (id, l, cost, o) => Object.assign({ id, l, cost, req:false, kind:'opt' }, o || {});
G.tasks = function () {
  const a = S.abs, out = [], yw = ER.yw(a), age = G.age();
  // School: a fixed block during school weeks, until she finishes through homeschooling.
  const sch = G.art().school;
  if (S.mode === 'story' && sch && age >= sch.age && a < W(sch.until) && !(yw.w >= 23 && yw.w <= 34))
    out.push(T('school', 'School', 1, { kind:'school', fixed:true, desc:'Keep up with school. This block is fixed.' }));
  G.active().forEach(({ p, st }) => {
    const w = G.win(p), c = counts(p), pid = p.id, pj = G.pj(pid), nm = p.short || p.title;
    if (p.type === 'demos') { if (G.writable().some(x => x.p.id === pid)) out.push(T('write:' + pid, 'Write an early song', 2, { kind:'write', p:pid, tab:'songbook' })); return; }
    if ((st === 'write' || st === 'record') && p.type !== 'rerecord') {
      const span = Math.max(1, (w.fs - 2) - (w.ws != null ? w.ws : w.rs)), el = a - (w.ws != null ? w.ws : w.rs);
      const need = Math.min(c.target, Math.floor(c.target * clamp(el / span, 0, 1)) + (a >= w.fs - 3 ? c.target : 0));
      const behind = c.written < Math.min(c.target, need);
      if (G.writable().some(x => x.p.id === pid)) out.push(T('write:' + pid, `Write a song for ${nm}`, 2, { req:behind && c.written < c.target, kind:'write', p:pid, tab:'songbook', desc:`${c.written} of ${c.target} album songs written.` }));
    }
    if (st === 'record' || (st === 'finish' && c.recorded < c.target)) {
      const span = Math.max(1, w.fs - w.rs), el = a - w.rs;
      const need = Math.floor(c.target * clamp(el / span, 0, 1));
      const avail = G.recordable().some(x => x.p.id === pid);
      if (avail) out.push(T('record:' + pid, p.type === 'rerecord' ? `Record a Taylor's Version track` : `Record a track for ${nm}`, 1, { req:c.recorded < Math.min(c.target, need) || st === 'finish', kind:'record', p:pid, tab:'studio', desc:`${c.recorded} of ${c.target} tracks recorded.` }));
    }
    if (st === 'finish') { const nx = ER.FINISH.find(f => !pj.fin[f[0]]); if (nx) out.push(T('fin:' + pid + ':' + nx[0], `${nx[1]} (${nm})`, nx[2], { req:true, kind:'fin', p:pid, item:nx[0], tab:nx[0] === 'cover' ? 'cover' : 'studio' }));
      ER.FINISH.filter(f => !pj.fin[f[0]] && f !== nx).slice(0, 2).forEach(f => out.push(T('fin:' + pid + ':' + f[0], `${f[1]} (${nm})`, f[2], { kind:'fin', p:pid, item:f[0], tab:f[0] === 'cover' ? 'cover' : 'studio' }))); }
    if (st === 'pre') {
      const list = p.type === 'rerecord' ? ER.PRE_TV : p.surprise ? ER.PRE_SURPRISE : ER.PRE;
      const left = list.filter(f => !pj.pre[f[0]]), weeks = w.rel - a;
      left.forEach((f, i) => out.push(T('pre:' + pid + ':' + f[0], `${f[1]} (${nm})`, f[2], { req:i === 0 || left.length >= weeks, kind:'pre', p:pid, item:f[0], tab:'rollout' })));
      if (!pj.egg && G.unlocked('eggs')) out.push(T('egg:' + pid, `Plant an Easter egg for ${nm}`, 1, { kind:'egg', p:pid, tab:'eggs' }));
    }
    if (st === 'release') ER.RELEASE.forEach(f => { const lbl = G.world('lockdown') ? ({ tv:'Remote TV performance', radio:'Radio and streaming push from home', signing:'Virtual fan event', posts:'Release-night posts' })[f[0]] : f[1];
      if (!pj.rel[f[0]]) out.push(T('rel:' + pid + ':' + f[0], `${lbl} (${nm})`, f[2], { req:true, kind:'rel', p:pid, item:f[0] })); });
    if (st === 'promo') {
      const since = a - w.rel, recd = p.tracks.filter(t => S.songs[t] && (S.songs[t].st === 'released' || S.songs[t].tv)).length;
      if ([6, 14, 22, 30].includes(since) && pj.singles.length < 5 && p.type !== 'edition') out.push(T('single:' + pid + ':' + since, `Release the next single from ${nm}`, 1, { req:true, kind:'single', p:pid, tab:'rollout' }));
      out.push(T('awards:' + pid, `Run an awards campaign for ${nm}`, 1, { kind:'campaign', p:pid }));
    }
    if (st === 'tourprep') {
      const tp = pj.tp, left = ER.TOURPREP.filter(f => !tp[f[0]]), weeks = w.ts - a;
      left.forEach((f, i) => out.push(T('tp:' + pid + ':' + f[0], `${f[1]} (${p.tour.name})`, f[2], { req:i === 0 || left.length >= weeks || f[0] === 'rehearse' && weeks <= 1, kind:'tp', p:pid, item:f[0], tab:'tour' })));
    }
    if (st === 'tour') {
      out.push(T('shows:' + pid, `Play this week's ${p.tour.name} shows`, 2, { req:true, kind:'shows', p:pid }));
      out.push(T('recover:' + pid, 'Recovery day on the road', 1, { kind:'recover' }));
      if (p.tour.surprise || S.flags.surpriseGuests) out.push(T('surprise:' + pid, 'Plan a surprise moment', 1, { kind:'surprise', p:pid }));
    }
  });
  // Duties from the team and sponsors.
  S.duties.forEach(d => { if (d.due >= a) out.push(T('duty:' + d.id, d.l, d.cost, { req:d.due === a, kind:'duty', duty:d.id, desc:`From ${FROM[d.from] || d.from}. Due ${G.fmtDate(d.due)}.` })); });
  // Optional, always available.
  const e = G.unlocked('songbook') && G.writable().length;
  out.push(T('rest', 'Rest', 1, { kind:'rest', desc:'+15 Energy' }));
  out.push(T('practice', 'Practise songwriting', 1, { kind:'practice', desc:'+2 Songwriting' }));
  const lock = G.world('lockdown'), hid = S.flags.hidden;
  if (hid) {
    out.push(T('secretsession', 'Secret writing session with a collaborator', 2, { kind:'secretsession', desc:'Nobody knows you are working. +Songwriting, and your next song is better.' }));
    out.push(T('ghostwrite', 'Write a song for another artist, under another name', 2, { kind:'ghostwrite', desc:'Money and Industry Clout, with no press' }));
    out.push(T('readfans', 'Quietly read what fans are saying', 1, { kind:'readfans', desc:'Ideas for the comeback. +Hype' }));
  }
  if (a >= W('2005-11-01') && !hid) out.push(T('social', lock ? 'Post for fans from home' : 'Post for fans', 1, { kind:'social', desc:'Fans up, Press Heat up' }));
  if (a >= W('2006-06-01') && !hid) out.push(lock ? T('livestream', 'Livestream for fans', 1, { kind:'livestream', desc:'Fans up, from home' }) : T('fanevent', 'Hold a fan event', 2, { kind:'fanevent', desc:'Fans up, Energy down' }));
  if (a >= W('2006-06-01') && !hid) out.push(T('interview', lock ? 'Do a video interview' : 'Do an interview', 1, { kind:'interview', tab:'press' }));
  out.push(T('network', lock ? 'Video calls with the industry' : hid ? 'Private meetings with your team' : 'Network in the industry', 1, { kind:'network', desc:'+Industry Clout' }));
  if (S.stats.money > 5000) out.push(T('charity', 'Support a cause', 1, { kind:'charity', desc:'+Reputation, costs money' }));
  out.push(T('private', 'Private time with friends and family', 1, { kind:'private', desc:'+Energy, +Team mood' }));
  if (G.earlyYears()) ER.EARLY_ACTS.forEach(e => { if (!e.minAge || age >= e.minAge) out.push(T('early:' + e.id, e.l, e.cost, { kind:'early', early:e.id, desc:G.fxText(e.fx) })); });
  if (a < W('2006-01-01') && !lock) out.push(T('gig', 'Play a local gig', 1, { kind:'gig', desc:'Fans up, a little money' }));
  if (S.flags.retired) {
    out.length = 0;
    out.push(T('rest', 'A slow week at home', 1, { kind:'rest', desc:'+15 Energy' }));
    out.push(T('private', 'Time with family and friends', 1, { kind:'private', desc:'+Energy, +Team mood' }));
    out.push(T('practice', 'Write just for yourself', 1, { kind:'practice', desc:'+2 Songwriting' }));
    if (S.stats.money > 5000) out.push(T('charity', 'Support a cause', 1, { kind:'charity', desc:'+Reputation' }));
    out.push(T('mentor', 'Mentor a young songwriter', 1, { kind:'mentor', desc:'+Reputation, +Industry Clout' }));
    out.push(T('unretire', 'Come out of retirement', 0, { kind:'unretire', desc:'A comeback era' }));
    return out;
  }
  if (G.canRetire() && !S.flags.farewell && !G.active().some(x => ['write','record','finish','pre','release','tourprep','tour'].includes(x.st))) {
    out.push(T('farewell', 'Plan a farewell tour', 0, { kind:'farewellplan', desc:'One last greatest-hits tour, then retirement' }));
    out.push(T('retire', 'Retire', 0, { kind:'retireask', desc:'End your career here' }));
  }
  if (S.flags.free && !G.active().some(x => ['write','record','finish','pre'].includes(x.st))) out.push(T('newera', 'Plan your next era', 0, { kind:'newera', tab:'studio' }));
  return out;
};
// Before her first record deal: no release yet, and not in lockdown.
G.earlyYears = () => !S.released.length && !G.world('lockdown') && G.age() >= 8 && !G.allProjects().some(p => p.type !== 'demos' && G.stageOf(p, S.abs) === 'pre');
G.fxText = fx => Object.keys(fx).map(k => { const v = fx[k], n = { fans:'Fans', rep:'Reputation', heat:'Press Heat', write:'Songwriting', clout:'Clout', energy:'Energy', money:'Money', team:'Team', hype:'Hype', own:'Ownership' }[k] || k;
  return k === 'money' ? `${v < 0 ? '−' : '+'}$${Math.abs(v)}` : `${v > 0 ? '+' : ''}${v} ${n}`; }).join(', ');
G.taskDone = id => !!S.week.done[id];
G.requiredLeft = () => G.tasks().filter(t => t.req && !S.week.done[t.id]);
G.canSpend = cost => S.week.used + cost <= G.blocks() + 3;

G.doTask = function (id, arg) {
  const t = G.tasks().find(x => x.id === id); if (!t || S.week.done[id]) return { err:'Already done.' };
  if (!G.canSpend(t.cost)) return { err:'No Time Blocks left this week, even with overtime.' };
  const over = Math.max(0, S.week.used + t.cost - G.blocks()) - Math.max(0, S.week.used - G.blocks());
  let msg = '';
  const pri = k => S.priorities.includes(k) ? 1.25 : 1;
  const p = t.p ? G.proj(t.p) : null, pj = p ? G.pj(p.id) : null;
  switch (t.kind) {
    case 'school': msg = 'Homework done.'; break;
    case 'write': { const opts = G.writable().filter(x => x.p.id === t.p); const s = arg && opts.find(x => x.t === arg.t) || opts.find(x => x.kind === 'album') || opts[0];
      if (!s) return { err:'No songs left to write here.' }; const co = arg && arg.co || (p.cowriters || ['Solo'])[0]; const r = G.writeSong(s.t, co, arg && arg.insp, arg && arg.appr); msg = `You wrote "${s.t}" (${co === 'Solo' ? 'alone' : 'with ' + co}). Quality ${r.q}.`; break; }
    case 'record': { const opts = G.recordable().filter(x => x.p.id === t.p); const s = arg && opts.find(x => x.t === arg.t) || opts.find(x => !x.vault) || opts[0];
      if (!s) return { err:'Nothing ready to record.' }; G.recordSong(s.t, arg && arg.prod || (p.producers || ['Producer'])[0], t.p, arg && arg.take); msg = `Recorded "${s.tv || s.t}".`; break; }
    case 'fin': pj.fin[t.item] = true; if (t.item === 'cover' && !pj.cover) pj.cover = G.autoCover(p); if (t.item === 'edition' && arg) pj.edition = arg; msg = 'Done.'; break;
    case 'pre': pj.pre[t.item] = true; if (t.item === 'single' && !pj.singles.length) { const s = arg || G.defaultSingle(p); if (s) G.releaseSingle(p, s); } if (t.item === 'announce') { pj.hype = clamp(pj.hype + 12, 0, 100); feed(`${p.title} is coming. I'm not okay.`); } pj.hype = clamp(pj.hype + 5, 0, 100); msg = 'Done.'; break;
    case 'rel': pj.rel[t.item] = true; pj.hype = clamp(pj.hype + 4, 0, 100); applyFx({ energy:-4 }); msg = 'Done.'; break;
    case 'single': { const s = arg || G.defaultSingle(p); if (s) { G.releaseSingle(p, s); msg = `"${s}" goes to radio.`; } break; }
    case 'campaign': applyFx({ clout:2, energy:-3 }); pj.campaign = (pj.campaign || 0) + 1; msg = 'Your team pitches the album to voters.'; break;
    case 'tp': if (t.item === 'route' && !(pj.tour && pj.tour.approved)) { G.autoTour(p); } pj.tp[t.item] = true; applyFx({ energy:-3 }); msg = t.item === 'rehearse' ? 'Final rehearsal passes.' : 'Done.'; break;
    case 'shows': msg = G.playShows(p); break;
    case 'recover': applyFx({ energy:12 }); msg = 'You sleep on the bus all day.'; break;
    case 'surprise': applyFx({ fans:1.5 * pri('fans'), heat:3 }); feed('the surprise tonight!!! I am on the floor'); msg = 'The crowd loses it.'; break;
    case 'duty': { const d = S.duties.find(x => x.id === t.duty); if (d) { S.duties = S.duties.filter(x => x !== d); applyFx({ team:2, clout:1 }); msg = `${d.l}: done.`; } break; }
    case 'early': { const e = ER.EARLY_ACTS.find(x => x.id === t.early); applyFx(e.fx); msg = 'Done.'; break; }
    case 'rest': applyFx({ energy:15 * pri('rest') }); msg = 'You rest.'; break;
    case 'practice': applyFx({ write:2 * pri('writing') }); msg = 'Your craft improves.'; break;
    case 'social': if (S.flags.wiped && S.abs < (S.flags.wiped + 1)) { msg = 'Your accounts are wiped.'; break; } applyFx({ fans:1.2 * pri('fans'), heat:2 }); feed(pick(['she posted!!','new post, decoding now','the caption... it means something','okay but the outfit']), null); msg = 'Fans react.'; break;
    case 'fanevent': applyFx({ fans:2.5 * pri('fans'), energy:-8, rep:1 }); msg = S.flags.secretsessions ? 'A Secret Session. Nobody leaks a note.' : 'A meet-up with fans.'; break;
    case 'interview': { const o = arg ? ER.OUTLETS.find(x => x.id === arg) : ER.OUTLETS.filter(x => ER.ds(x.from + '-01-01') <= S.abs).pop(); applyFx({ heat:o.heat, rep:(S.stats.heat > 70 ? -2 : o.rep) * pri('press'), fans:o.fans }); msg = `${o.n}: done.`; break; }
    case 'network': applyFx({ clout:2 * pri('business') }); msg = 'Useful conversations.'; break;
    case 'charity': { const g = Math.max(1000, Math.round(S.stats.money * .01)); S.stats.money -= g; applyFx({ rep:3 }); msg = `You gave ${G.fmtM(g)}.`; break; }
    case 'private': applyFx({ energy:8, team:3 }); msg = 'A quiet day.'; break;
    case 'livestream': applyFx({ fans:1.6 * pri('fans'), energy:-3 }); feed('she went live from her kitchen and i am not okay'); msg = 'Fans tune in from their homes.'; break;
    case 'secretsession': applyFx({ write:3, energy:-4 }); S.flags.focus = true; msg = 'A secret session. Your next song will be stronger.'; break;
    case 'ghostwrite': applyFx({ clout:3, write:1 }); S.stats.money += 50000 + S.stats.clout * 4000; msg = 'You write a song for someone else. Your name stays off the press release.'; break;
    case 'readfans': { const e = G.currentEra(); applyFx({ hype:3 }); msg = 'Fans have not gone anywhere.'; break; }
    case 'gig': applyFx({ fans:6, energy:-5 }); S.stats.money += 150; msg = 'You play a local fair.'; break;
    case 'mentor': applyFx({ rep:2, clout:1 }); msg = 'You spend the afternoon on a young writer\'s bridge.'; break;
    case 'unretire': G.unretire(); return { ok:true, msg:'You are back. The label has ideas.' };
    case 'farewellplan': S.modal.push({ k:'farewell' }); return { ok:true, msg:'' };
    case 'retireask': S.modal.push({ k:'retire', after:'ask' }); return { ok:true, msg:'' };
    case 'newera': G.proposeEra(); return { ok:true, msg:'Your label has ideas for the next era.' };
  }
  S.week.used += t.cost; S.week.done[id] = true; G.guideTick('block');
  if (over > 0) { applyFx({ energy:-8 * over }); msg += ` Overtime cost ${8 * over} Energy.`; }
  return { ok:true, msg };
};

/* ---------- Show nights ---------- */
// The night itself, after the week's shows are played: city, opener, surprise songs and a crowd moment.
G.showSetup = function (p) {
  const pj = G.pj(p.id), tr = pj.tour || {}, regions = (tr.regions && tr.regions.length ? tr.regions : ['North America']);
  const city = pick(ER.CITIES[pick(regions)] || ER.CITIES['North America']);
  const played = S.surprisePlayed = S.surprisePlayed || {};
  const cat = G.catalog(); const fresh = cat.filter(t => !played[t]);
  const offer = (fresh.length >= 6 ? fresh : cat).slice().sort(() => Math.random() - .5).slice(0, 6);
  return { pid:p.id, city, detail:pick(ER.CITY_DETAILS), offer, moment:pick(ER.CROWD_MOMENTS), surprise:!!(p.tour.surprise || S.flags.surpriseGuests || G.yw().y >= 2023) };
};
G.showNight = function (sh, openerId, picks, mi) {
  const op = ER.OPENERS.find(o => o.id === openerId) || ER.OPENERS[0], mc = sh.moment.ch[mi] || sh.moment.ch[0];
  applyFx(op.fx); applyFx(mc.fx);
  let score = 2.6 + (S.stats.energy > 50 ? .5 : -.3) + (S.stats.team > 60 ? .3 : 0) + rnd(-.4, .6);
  const pj = G.pj(sh.pid); if (pj.underRehearsed) score -= .7; if (pj.tp && pj.tp.rehearse) score += .3;
  (picks || []).forEach(t => { const first = !S.surprisePlayed[t]; S.surprisePlayed[t] = (S.surprisePlayed[t] || 0) + 1; if (first) { score += .35; applyFx({ fans:.4 }); } });
  const stars = clamp(Math.round(score), 1, 5);
  applyFx({ rep:(stars - 3) * .8, fans:(stars - 3) * .4 });
  const line = ER.REVIEW_LINES[stars];
  pj.diary = pj.diary || []; pj.diary.unshift({ abs:S.abs, city:sh.city, stars, picks:picks || [], moment:sh.moment.t }); if (pj.diary.length > 120) pj.diary.length = 120;
  G.journalAdd(`${sh.city}: ${stars} stars`, `${sh.moment.t}. ${mc.r}`);
  return { stars, line, mc };
};
/* ---------- Award nights ---------- */
G.awardNight = function (e, carpetId, perf) {
  const c = ER.CARPET.find(x => x.id === carpetId) || ER.CARPET[0]; applyFx(c.fx);
  if (perf) applyFx({ fans:1, hype:2 });
  G.journalAdd(`${e.t}: the red carpet`, `${c.n}. ${c.r}`);
  return c;
};
/* ---------- Era wrap-ups ---------- */
G.eraWrap = function (pid) {
  const p = G.proj(pid), r = S.released.find(x => x.pid === pid); if (!p || !r) return null;
  const songs = Object.keys(S.songs).filter(t => S.songs[t].p === pid && S.songs[t].st === 'released').sort((a, b) => S.songs[b].q - S.songs[a].q);
  const singles = S.charts.singles.filter(c => c.pid === pid).sort((a, b) => a.peak - b.peak);
  const w = G.win(p), mom = (S.journal || []).filter(j => j.abs >= (w.ws != null ? w.ws : w.rs) && j.abs <= S.abs);
  const tr = G.pj(pid).tour;
  return { p, best:songs[0], bestQ:songs[0] ? S.songs[songs[0]].q : 0, single:singles[0], fw:r.fw, real:r.real, peak:r.peak, no1w:r.no1w, moment:mom.length ? pick(mom) : null,
    tour:tr && tr.played ? { name:tr.name, shows:tr.played, gross:tr.gross, target:p.tour && p.tour.target } : null, goals:S.goals[pid] };
};
/* ---------- Scenes ---------- */
// Which scene fits a task. Some tasks always get one; everyday ones only sometimes.
G.sceneKey = t => {
  if (!t) return null;
  if (t.kind === 'duty') { const d = (t.l || '').toLowerCase(); return /shoot|magazine/.test(d) ? 'magazine' : /budget/.test(d) ? 'budget' : /label/.test(d) ? 'label' : 'sponsor'; }
  if (t.kind === 'rel') return { tv:'rel_tv', signing:'rel_signing' }[t.item] || null;
  if (t.kind === 'pre') return { video:'pre_video', announce:'pre_announce' }[t.item] || null;
  if (t.kind === 'fin') return { sequence:'fin_sequence', master:'fin_master' }[t.item] || null;
  if (t.kind === 'tp') return { costume:'tp_costume', rehearse:'tp_rehearse' }[t.item] || null;
  if (t.kind === 'early') { const e = ER.EARLY_ACTS.find(x => x.id === t.early); return e && e.scene || null; }
  return { interview:'interview', social:'social', fanevent:'fanevent', network:'network', charity:'charity', gig:'gig', rest:'rest' }[t.kind] || null;
};
G.pickScene = function (t) {
  const k = G.sceneKey(t); if (!k || !ER.SCENES[k]) return null;
  const always = ['magazine','budget','label','sponsor'].includes(k) || /^(rel_|pre_|fin_|tp_|early_)/.test(k);
  if (!always && Math.random() > .45) return null;
  const early = G.earlyYears();
  const pool = ER.SCENES[k].filter(x => !x.early || early || k === 'label');
  const pref = pool.filter(x => !!x.early === early);
  const sc = pick(pref.length ? pref : pool); if (!sc) return null;
  const p = t.p ? G.proj(t.p) : G.currentEra();
  const fill = str => str.replace(/\{nm\}/g, p ? (p.short || p.title) : 'your next record');
  return { k, t:fill(sc.t), x:fill(sc.x), set:sc.set, with:sc.with, ch:sc.ch.map(c => ({ l:fill(c.l), fx:c.fx, r:fill(c.r) })) };
};
G.resolveScene = function (sc, ci) {
  const c = sc.ch[ci]; if (!c) return null; applyFx(c.fx);
  S.journal = S.journal || []; S.journal.unshift({ abs:S.abs, t:sc.t, l:c.l, r:c.r }); if (S.journal.length > 200) S.journal.length = 200;
  G.guideTick('scene'); return c;
};
G.journalAdd = (t, r) => { S.journal = S.journal || []; S.journal.unshift({ abs:S.abs, t, r }); if (S.journal.length > 200) S.journal.length = 200; };
// The first-week guide: a short checklist in a new game.
G.guideTick = id => { if (!S || !S.guide || S.guide.done) return; S.guide[id] = true; if (ER.GUIDE.every(g => S.guide[g.id])) { S.guide.done = true; inbox('family', 'You have got the hang of it', 'The guide is complete. The rest is up to you.'); } };
/* ---------- Singles ---------- */
G.peaks = () => S.artist === 'taylor' ? (ER.PEAKS || {}) : ((ER.PEAKS_BY || {})[S.artist] || {});
G.debuts = () => S.artist === 'taylor' ? (ER.SINGLE_DEBUT || {}) : ((ER.SINGLE_DEBUT_BY || {})[S.artist] || {});
G.defaultSingle = p => { const pj = G.pj(p.id);
  const realNext = ((ER.REAL_SINGLES || {})[p.id] || []).find(t => S.songs[t] && S.songs[t].st !== 'written' && !pj.singles.includes(t));
  if (realNext) return realNext; const pool = (p.type === 'rerecord' ? p.tracks.concat(p.vaultSongs || []).map(t => t + " (Taylor's Version)") : p.tracks.concat(p.extras || [])).filter(t => S.songs[t] && S.songs[t].st !== 'written' && !pj.singles.includes(t));
  pool.sort((a, b) => S.songs[b].q - S.songs[a].q); return pool[0]; };
G.releaseSingle = function (p, t) {
  const pj = G.pj(p.id); if (pj.singles.includes(t)) return;
  pj.singles.push(t);
  const s = S.songs[t]; const perf = (s.q / 100) * .5 + (S.stats.fans > 1e6 ? .2 : .05) + S.stats.clout / 400 + pj.hype / 500;
  const real = G.peaks()[t];
  let target = real && G.curveMode() ? clamp(Math.round(real * Math.pow(2 - G.momentum(), 1.6) * (1.12 - s.q / 600) + rnd(-1, 1)), 1, 100) : clamp(Math.round(100 - perf * 88 + rnd(-12, 12)), 1, 100);
  if (real === 1 && G.momentum() >= .95 && s.q >= 70) target = 1;
  const rd = G.debuts()[t], streaming = ER.yw(S.abs).y >= 2014;
  let pos, jump = false;
  if (rd && G.curveMode() && S.abs < G.FREE_START) {
    if (rd === 1) pos = G.momentum() >= .9 && s.q >= 60 ? 1 : clamp(Math.round(2 + (1 - G.momentum()) * 12 + rnd(0, 2)), 2, 15);
    else if (rd > target * 4) { pos = clamp(Math.round(rd * (2 - G.momentum()) + rnd(-5, 5)), target + 1, 100); jump = true; }
    else pos = clamp(Math.round(rd * Math.pow(2 - G.momentum(), 1.4)), 1, 100);
    target = Math.min(target, pos);
  } else pos = clamp(target + Math.round(streaming ? rnd(0, 2) : rnd(0, 6)), 1, 100);
  S.charts.singles.unshift({ t, pid:p.id, abs:S.abs, debut:pos, peak:pos, pos, target, real, realDebut:rd || null, jump, wk:0 });
  if (pos === 1) { G.pj(p.id).no1 = true; if (!S.ach.no1) ach('no1'); S.no1count = (S.no1count || 0) + 1; }
  s.single = true; if (s.st === 'recorded' && S.abs >= G.win(p).rel) s.st = 'released';

  feed(`"${t}" is out and I have listened 40 times`);
};

/* ---------- Tours ---------- */
const CAP = { theater:2500, arena:14000, stadium:60000 };
// Average real ticket prices over time (approximate), for the Standard price level.
const PRICE = [[2006, 45], [2009, 55], [2011, 75], [2013, 88], [2015, 110], [2018, 120], [2023, 205], [2027, 225]];
G.CAP = CAP;
G.priceOf = (lvl, abs) => { const y = ER.yw(abs).y + (ER.yw(abs).w - 1) / 52; let v = PRICE[PRICE.length - 1][1] * Math.pow(1.03, Math.max(0, y - 2027));
  for (let i = 1; i < PRICE.length; i++) if (y <= PRICE[i][0]) { const [y0, p0] = PRICE[i - 1], [y1, p1] = PRICE[i]; v = p0 + (p1 - p0) * clamp((y - y0) / (y1 - y0), 0, 1); break; }
  return Math.round(v * [0, .7, 1, 1.55][lvl]); };
G.tourDemand = (plan, p) => {
  const pf = [0, 1.15, 1, .78][plan.price], prod = (1 + plan.prod * .05) / 1.1;
  // Real tours: the real ticket count, scaled by momentum. Invented tours: from fan size and reputation.
  // Real tours are sized from their real gross (or a rough estimate where none is confirmed) during the real story.
  const ref = p && p.tour && (p.tour.target || p.tour.est);
  if (ref && G.curveMode() && (!p.custom || p.type === 'farewell' ? !p.custom : false)) return ref / G.priceOf(2, G.win(p).ts) * G.momentum() * pf * prod;
  const wf = (G.world('recession') ? .9 : 1) * (G.world('limits') ? .8 : 1) * (p && p.type === 'farewell' ? 1.6 : 1);
  return wf * 230 * Math.pow(Math.max(1, S.stats.fans), .55) * pf * (.65 + S.stats.rep / 140) * prod;
};
// A tour can fit about three shows a week.
G.maxNights = p => { const w = G.win(p); const wk = w.ts != null ? w.te - w.ts + 1 : 40; return Math.min(p.tour.maxNights || 200, Math.max(6, Math.round(wk * 3))); };
G.suggestTour = function (p) {
  let tier = S.stats.fans > 1.5e7 ? 'stadium' : S.stats.fans > 1.2e6 ? 'arena' : 'theater';
  if (p.tour.target && G.curveMode() && p.tour.tier) tier = p.tour.tier;
  const plan = { tier, price:2, prod:2, regions:['North America'], openers:(p.tour.openers || []).slice(0, 2), setlist:[], nights:0, name:p.tour.name };
  plan.nights = clamp(Math.round(G.tourDemand(plan, p) * .92 / CAP[tier]), 6, G.maxNights(p));
  if (S.stats.fans > 5e6) plan.regions.push('Europe'); if (S.stats.fans > 2e7) plan.regions.push('Asia and Oceania'); if (S.stats.fans > 5e7) plan.regions.push('Latin America');
  // Two or three of the best songs from each album, with more from the newest era.
  const by = {}; G.catalog().forEach(t => { const k = S.songs[t].p; (by[k] = by[k] || []).push(t); });
  const keys = Object.keys(by); plan.setlist = [];
  keys.forEach((k, i) => { by[k].sort((a, b) => S.songs[b].q - S.songs[a].q); plan.setlist.push(...by[k].slice(0, i === keys.length - 1 ? 5 : keys.length > 8 ? 2 : 3)); });
  plan.setlist = plan.setlist.slice(-24);
  return plan;
};
G.catalog = () => Object.keys(S.songs).filter(t => S.songs[t].st === 'released' || (S.songs[t].tv && S.songs[t].st === 'released'));
G.reviewTour = function (p, plan) {
  const obj = [], dem = G.tourDemand(plan, p), sell = dem / (plan.nights * CAP[plan.tier]);
  if (sell < .75) obj.push({ from:'manager', x:`Too many ${plan.tier} nights for your current numbers. About ${Math.max(4, Math.floor(dem * .85 / CAP[plan.tier]))} nights would sell.` });
  const cost = plan.nights * CAP[plan.tier] * plan.prod * 3 * Math.pow(1.03, ER.yw(S.abs).y - 2006) * (G.world('security') ? 1.08 : 1) * (G.world('inflation') ? 1.15 : 1);
  if (G.world('lockdown')) obj.push({ from:'manager', x:'Venues are closed because of the pandemic. Nothing can go on sale until live music returns.' });
  if (!p.tour.maxNights && plan.nights > G.maxNights(p) + 4) obj.push({ from:'manager', x:`${plan.nights} nights will not fit in the tour dates. About ${G.maxNights(p)} is the most that fits.` });
  if (p.tour.maxNights && plan.nights > p.tour.maxNights + 6) obj.push({ from:'manager', x:`${p.tour.name} is meant to be a short run. Keep it to about ${p.tour.maxNights} dates.` });
  if (S.stats.money < cost * .02) obj.push({ from:'manager', x:`The production deposit is ${G.fmtM(cost * .02)}, and you cannot cover it yet. Lower the production level or the number of nights.` });
  if (plan.price === 3 && S.stats.rep < 55) obj.push({ from:'publicist', x:'Top-tier prices with your reputation where it is would be a press risk. Bring prices down.' });
  if (S.stats.heat > 85 && plan.prod === 3) obj.push({ from:'publicist', x:'The press will call a maximum-production show excessive right now.' });
  if (!plan.setlist || plan.setlist.length < 10) obj.push({ from:'manager', x:'The setlist needs at least 10 songs.' });
  return { ok:!obj.length, obj, sell:Math.min(1, sell), cost };
};
G.submitTour = function (p, plan) {
  const pj = G.pj(p.id), r = G.reviewTour(p, plan);
  pj.tour = Object.assign({}, plan, { submitted:S.abs, approved:r.ok, objections:r.obj, played:0, gross:0, tickets:0, acc:0, cost:r.cost });
  // Tickets go on sale as soon as the plan is approved.
  if (r.ok) pj.tour.presold = Math.round(Math.min(G.tourDemand(plan, p), plan.nights * CAP[plan.tier]) * .85);
  if (r.ok) { inbox('manager', `${plan.name}: approved`, `The plan works: ${plan.nights} ${plan.tier} nights. Expected sell-through ${Math.round(r.sell * 100)}%.`); inbox('publicist', `${plan.name}: no press concerns`, 'I can work with this.'); pj.tp.route = true; }
  else r.obj.forEach(o => inbox(o.from, `${plan.name}: sent back`, o.x));
  return r;
};
G.autoTour = function (p) {
  const plan = G.suggestTour(p); let r = G.submitTour(p, plan), n = 0;
  while (!r.ok && n++ < 6) { plan.nights = Math.max(4, Math.floor(plan.nights * .8)); if (plan.price === 3) plan.price = 2; if (plan.prod > 1) plan.prod--; r = G.submitTour(p, plan); }
  if (!r.ok) { plan.prod = 1; plan.price = 2; plan.nights = clamp(Math.round(G.tourDemand(plan, p) * .85 / CAP[plan.tier]), 6, 200); G.submitTour(p, plan); G.pj(p.id).tour.approved = true; G.pj(p.id).tour.objections = []; }
};
G.cancelTour = function (p, why) {
  if (!p || !p.tour) return; const pj = G.pj(p.id); if (pj.tourCancelled || pj.tourDone) return;
  const tr = pj.tour, sold = tr ? (tr.presold || 0) : 0, lost = tr && tr.approved ? Math.round((tr.cost || 0) * .02) : 0;
  pj.tourCancelled = true; pj.cancelled = { name:p.tour.name, why, abs:S.abs, sold, lost, planned:!!(tr && tr.approved) };
  S.stats.money -= lost; applyFx({ team:-3 });
  inbox('promoter', `${p.tour.name} is cancelled`, why === 'pandemic' ? `Live music has been shut down by the COVID-19 pandemic.${sold ? ` All ${G.fmtN(sold)} tickets sold so far are being refunded.` : ''}${lost ? ` The ${G.fmtM(lost)} production deposit is lost.` : ''}` : 'The tour cannot go ahead.');
  feed(`${p.tour.name} is cancelled. I had my outfit planned for months.`);
};
G.playShows = function (p) {
  const pj = G.pj(p.id), w = G.win(p);
  if (p.tour.kind === 'opening') { const fans = S.stats.fans * .004 + 8000; if (!G.curveMode()) S.stats.fans += fans; else S.mom = clamp((S.mom || 1) + .004, .45, 1.6); S.openFans = (S.openFans || 0) + fans; S.stats.money += 6000; applyFx({ energy:-8, clout:1 }); return `You open for a headliner. About ${G.fmtN(fans)} new fans.`; }
  if (!pj.tour || !pj.tour.approved) G.autoTour(p);
  const tr = pj.tour, weeks = Math.max(1, w.te - w.ts + 1);
  tr.acc += tr.nights / weeks; const n = Math.floor(tr.acc); tr.acc -= n;
  if (!n) return 'A travel week between shows.';
  const dem = G.tourDemand(tr, p), sell = clamp(dem / (tr.nights * CAP[tr.tier]) * rnd(.95, 1.04), .3, 1);
  const price = G.priceOf(tr.price, S.abs), tix = Math.round(n * CAP[tr.tier] * sell), gross = tix * price;
  tr.played += n; tr.tickets += tix; tr.gross += gross;
  const net = gross * (.36 - tr.prod * .04) * (S.stats.own > 30 ? 1.05 : 1);
  S.stats.money += net; if (!G.curveMode()) S.stats.fans += tix * .12 * (S.flags.bracelets ? 1.2 : 1);
  applyFx({ energy:-(5 + n * 1.6), clout:.4 });
  let x = `${n} show${n > 1 ? 's' : ''}, ${G.fmtN(tix)} tickets, ${G.fmtM(gross)} gross.`;
  const r = Math.random();
  if (r < .08) { applyFx({ fans:1.5, heat:4 }); x += ' A moment from one show goes viral.'; feed('the clip from last night has 20 million views'); }
  else if (r < .12) { tr.gross -= gross / n; S.stats.money -= net / n; x += ' Weather cancels one night.'; }
  else if (r < .15 && dem > tr.nights * CAP[tr.tier] * 1.15) { tr.nights += 3; x += ' Demand is so high the promoter adds three nights.'; inbox('promoter', 'Added nights', 'Every show sold out, so we added three more.'); }
  return x;
};

/* ---------- Covers ---------- */
G.autoCover = p => { const mood = ER.ERA_MOOD[p.id] || 'pop'; const pals = ER.PALETTES.filter(x => x.mood === mood); return { pal:(pick(pals.length ? pals : ER.PALETTES)).id, sym:pick(ER.SYMBOLS), lay:pick(ER.LAYOUTS), fin:pick(ER.FINISHES), variants:0, auto:true }; };
G.coverScore = (p, c) => { if (!c) return 0; const pal = ER.PALETTES.find(x => x.id === c.pal) || ER.PALETTES[0]; let sc = 55;
  if (pal.mood === (ER.ERA_MOOD[p.id] || 'pop')) sc += 18; if (c.fin === 'foil' || c.fin === 'grain') sc += 4; if (c.lay === 'full-bleed' || c.lay === 'framed') sc += 3; if (c.auto) sc -= 8; if (c.upload) sc = 72;
  sc -= Math.max(0, (c.variants || 0) - 3) * 6; return clamp(sc, 20, 98); };

/* ---------- Easter eggs ---------- */
G.eggTargets = () => {
  const out = []; G.allProjects().forEach(p => { const w = G.win(p); if (p.type === 'demos') return; if (w.rel > S.abs) out.push({ id:'album:' + p.id, l:`The title of ${p.title}`, at:w.ps || w.rel });
    (p.vault || []).forEach(v => { const tv = G.allProjects().find(q => q.id === p.vaultFor); if (tv && G.win(tv).rel > S.abs) out.push({ id:'vault:' + v, l:`Vault track "${v}"`, at:G.win(tv).rel }); }); });
  if (S.flags.rerecords) G.allProjects().filter(p => p.type === 'rerecord' && G.win(p).rel > S.abs).forEach(p => out.push({ id:'tv:' + p.id, l:`The next re-record: ${p.title}`, at:G.win(p).ps }));
  out.push({ id:'false', l:'Nothing (a false lead)', at:0 });
  return out.slice(0, 14);
};
G.plantEgg = function (type, target, pid) {
  const et = ER.EGG_TYPES.find(x => x.id === type) || ER.EGG_TYPES[0];
  S.eggs.planted.push({ id:G.uid(), type:et.id, n:et.n, target:target.id, tl:target.l, diff:et.diff, abs:S.abs, prog:0, need:et.diff * 2 + 1, done:false, pid });
  if (pid) G.pj(pid).egg = true;
  feed(`wait. ${et.n.toLowerCase()}... this has to mean something`);
};
function eggsWeek() {
  const E = S.eggs; E.fatigue = Math.max(0, E.fatigue - 1);
  E.planted.filter(e => !e.done).forEach(e => {
    e.prog += 1 + Math.log10(Math.max(10, S.stats.fans)) / 6;
    if (e.prog >= e.need) { e.done = true; E.decoded++;
      if (e.target === 'false') { E.fatigue += 12; feed('this was a false lead and i am exhausted'); e.res = 'Decoded, but it led nowhere. Fan fatigue rose.'; applyFx({ fans:-.5 }); }
      else { const f = E.fatigue > 40 ? .4 : 1; applyFx({ fans:e.diff * 1.2 * f, hype:e.diff * 3 * f }); feed(`WE CRACKED IT. ${e.tl}.`); e.res = `Fans decoded it: ${e.tl}.`; } } });
  if (S.stats.heat > 60 && Math.random() < .08) feed(pick(['she wore green on a tuesday, album 13 confirmed','the clock in that photo says 1:13. it is happening','counting the stairs in the video. there are 13.']), null);
}

/* ---------- Week cycle ---------- */
function startWeek() {
  S.week = { used:0, done:{}, pending:[], forcedRest:S.flags.exhausted || false };
  S.flags.exhausted = false;
  const a = S.abs, A = G.art();
  if (G.tasks().some(t => t.kind === 'school')) { S.week.used = 1; S.week.done.school = true; }
  if (S.mode === 'story' && !S.flags.free) A.events.forEach(e => { if (e.abs === a && S.seen[e.id] == null) S.week.pending.push(e.id); });
  // Real-world events happen in every save, whichever artist or mode.
  if (!S.flags.free) (ER.WORLD || []).forEach(e => { if (e.abs === a && S.seen[e.id] == null) S.week.pending.push(e.id); });
  // The pandemic cancels any tour that would run during the lockdown.
  if (ER.WORLD_STATE && !S.flags.free) { const [l0, l1] = ER.WORLD_STATE.lockdown;
    G.allProjects().forEach(p => { if (!p.tour || p.tour.kind !== 'headline') return; const w = G.win(p); if (w.ts == null) return;
      if (a >= l0 && w.ts < l1 && w.te >= l0 && (w.ts - a <= 8)) G.cancelTour(p, 'pandemic'); }); }
  if (S.mode === 'era' && S.artist === 'taylor' && !S.flags.hidden && !S.flags.hiddenDone && a >= W('2016-09-12') && a < W('2017-08-18')) { S.flags.hidden = true; S.duties = S.duties.filter(d => d.from !== 'publicist'); inbox('publicist', 'Out of public view', 'After the summer of 2016 you step out of sight. You can still write, record and plan in private.'); }
  if (S.flags.hidden && (S.abs >= W('2017-09-04') || (S.mode === 'era' && S.abs >= W('2017-08-18')))) { S.flags.hidden = false; S.flags.hiddenDone = true; inbox('publicist', 'Back in public view', 'Your time out of sight is over.'); }
  // Missed events after a load or an Era Start skip are not replayed.
  if (S.flags.free && !S.flags.retired && Math.random() < .07) { const d = pick(ER.DRAMA); S.week.pending.push('drama:' + d.id); }
  const yw = ER.yw(a);
  if (yw.w === 1 && S.abs > A.startAbs) S.modal.push({ k:'plan' });
  if (S.mode === 'story' && a === FREE_START && !S.flags.free) S.modal.push({ k:'free' });
  // Team assignments.
  const act = G.active().filter(x => !['none','rest'].includes(x.st));
  if (act.length && Math.random() < .22 && a >= W('2005-07-01')) {
    const x = pick(act), nm = x.p.short || x.p.title, r = Math.random();
    if (r < .35 || S.flags.hidden || G.world('lockdown')) duty('manager', `Approve the ${nm} budget`, 1, a + 2);
    else if (r < .7) duty('publicist', `Magazine shoot for ${nm}`, 1, a + 3, { rep:-2, team:-3 });
    else duty('label', `Label meeting about ${nm}`, 1, a + 2, { clout:-3, team:-2 });
    const d = S.duties[S.duties.length - 1]; inbox(d.from, d.l, `Please get this done by the week of ${G.fmtDate(d.due)}.`);
  }
  // Crossover rivals.
  ER.rivals.forEach(r => { if (r.abs === a && r.who !== S.artist && !S.rivalsSeen[r.title]) { S.rivalsSeen[r.title] = 1;
    S.charts.albums.unshift({ t:r.title, by:ER.artists[r.who].name, rival:true, abs:a, fw:r.units, wk:0 });
    inbox('label', `${ER.artists[r.who].name} releases ${r.title}`, `Expect ${G.fmtN(r.units)} in its first week. Plan around it.`); } });
  if (G.canRetire() && !S.flags.farewell && G.age() >= 65 && ER.yw(a).w === 26 && !S.flags.retireNudged) { S.flags.retireNudged = a; inbox('family', 'Have you thought about stopping?', 'You have nothing left to prove. A farewell tour, then time for yourself? It is your call. You can plan a farewell tour or retire from This Week.'); }
  if (S.flags.retired && ER.yw(a).w === 1 && Math.random() < .25) feed(pick(['it has been years and i still check for a comeback every morning','imagine one more era. just one.','the farewell tour was the best night of my life']));
  if (a >= W('2006-06-01') && !S.flags.retired && S.released.length && Math.random() < .14) {
    const m = pick(ER.FAN_MAIL); inbox('fans', `A letter from ${m.from}`, m.x, { mail:ER.FAN_MAIL.indexOf(m) }); }
  if (S.flags.free && !S.flags.retired && ER.yw(a).w === 6 && S.awardsYear !== ER.yw(a).y) { S.awardsYear = ER.yw(a).y; const n = G.freeNominations(); if (n.length) S.modal.push({ k:'honours', y:ER.yw(a).y, noms:n }); }
  if (G.needsNextEra()) G.proposeEra();
  G.save(true);
}
G.startWeek = startWeek;

G.answer = function (id, ci) {
  if (id.startsWith('drama:')) {
    const d = ER.DRAMA.find(x => x.id === id.slice(6)); const c = d.ch[ci]; applyFx(c.fx, DIFF[S.diff].pen > 1 ? 1.2 : 1);
    S.log.push({ abs:S.abs, id, t:d.t, l:c.l, drama:true }); S.week.pending = S.week.pending.filter(x => x !== id); return { r:'The story moves on.' };
  }
  const e = G.findEvent(id); const c = e.ch[ci];
  if (c.single) { const sp = G.proj(c.single[0]); if (sp && S.songs[c.single[1]] && S.songs[c.single[1]].st !== 'written') G.releaseSingle(sp, c.single[1]); }
  if (e.cancelTour) G.cancelTour(G.proj(e.cancelTour), 'pandemic');
  if (c.hide) { S.flags.hidden = true; S.duties = S.duties.filter(d => d.from !== 'publicist'); inbox('publicist', 'Out of public view', 'No interviews, posts or appearances. You can still write, record and plan in private.'); }
  applyFx(c.fx); S.seen[id] = ci;
  if (!e.s && e.ch.some(x => x.c)) scoreCanon(!!c.c);
  if (e.award) { S.awards.push({ n:e.award, abs:S.abs, y:e.year }); if (e.award === 'Album of the Year' && !S.ach.aoty) ach('aoty'); }
  if (e.egg) S.eggs.log.push({ n:e.egg, abs:S.abs });
  if (e.unlock) S.flags[e.unlock] = true;
  if (e.id === 'wipe') { S.flags.wiped = S.abs; S.flags.hidden = false; S.flags.hiddenDone = true; }
  if (e.id === 'surpriseguests') S.flags.surpriseGuests = true;
  S.log.push({ abs:S.abs, id, t:e.t, l:c.l, canon:!!c.c, s:!!e.s, world:!!e.world, truth:e.truth, real:(e.ch.find(x => x.c) || {}).l });
  S.week.pending = S.week.pending.filter(x => x !== id);
  return { r:c.r, truth:e.truth };
};
G.dramaText = d => d.x.replace('{rival}', S.flags.rival || (S.flags.rival = pick(ER.RIVAL_STARS))).replace('{exec}', pick(ER.EXECS)).replace('{tabloid}', pick(ER.TABLOIDS));

G.advance = function (force) {
  if (S.guide && !S.week.pending.length) G.guideTick('advance');
  if (S.week.pending.length) return { blocked:'event' };
  const left = G.requiredLeft();
  if (left.length && !force) return { confirm:left };
  const pen = DIFF[S.diff].pen * (S.recovery ? 1.3 : 1);
  left.forEach(t => {
    if (t.kind === 'school') applyFx({ team:-3 }, pen);
    else if (t.kind === 'duty') { const d = S.duties.find(x => x.id === t.duty); if (d) { applyFx(d.pen, pen); S.duties = S.duties.filter(x => x !== d); if (d.src) loseSponsor(d.src); } }
    else if (t.kind === 'shows') { applyFx({ rep:-8, fans:-3, money:-200000 * pen }, pen); inbox('promoter', 'Cancelled shows', 'Shows were cancelled at short notice. Refunds are going out.'); }
    else if (t.kind === 'tp' && t.item === 'rehearse') { G.pj(t.p).underRehearsed = true; }
    else if (t.p) { G.pj(t.p).missed++; applyFx({ team:-2, energy:-2 }, pen); }
  });
  endWeek();
  return { ok:true, missed:left.length };
};
function loseSponsor(id) { const s = S.sponsors.find(x => x.id === id && !x.lost); if (s) { s.lost = true; applyFx({ rep:-3, money:-s.paid * .5 }); inbox('manager', `${s.n} pulled out`, 'You missed a sponsor duty, so the deal is gone and part of the fee has to be paid back.'); } }

function endWeek() {
  const a = S.abs, s = S.stats, R = { abs:a, lines:[], fans0:s.fans, money0:s.money };
  const yr = ER.yw(a).y, Y = S.years[yr] = S.years[yr] || { units:0, money0:s.money, fans0:s.fans, gross:0, shows:0, awards:0, releases:[] };
  // Releases.
  G.allProjects().forEach(p => { if (G.stageOf(p, a) === 'release') { const r = doRelease(p); R.lines.push(r); Y.releases.push(p.title); } });
  // Weekly album sales.
  let units = 0;
  // Album chart positions move every week.
  const rivalTop = S.charts.albums.filter(c => c.rival && c.abs === a).reduce((m, c) => Math.max(m, c.fw), 0);
  S.released.forEach(r => { if (r.abs >= a || r.wk > 400) return; G.chartWeek(r, rivalTop); });
  S.released.forEach(r => { if (r.abs >= a) return; r.wk++; const w = r.fw * Math.pow(.62, r.wk) + r.fw * .012 + (r.fw * .002 * Math.max(0, 1 - r.wk / 300)); units += w; r.total += w; });
  const per = s.own >= 30 ? 5 : 1.6, inc = units * per;
  s.money += inc; if (!G.curveMode()) s.fans += units * .55; Y.units += units;
  // Singles chart movement.
  S.charts.singles.forEach(c => { if (c.abs >= a || c.out) return; c.wk++;
    const t = c.target || c.peak; if (c.jump && c.wk === 1) { c.pos = t; c.jump = false; } else c.pos = c.wk <= 4 ? clamp(Math.round(c.pos - (c.pos - t) * .6), 1, 100) : clamp(Math.round(c.pos + rnd(-3, 8) + c.wk * .4), 1, 101);
    if (c.pos < c.peak) c.peak = c.pos; if (c.peak === 1) { G.pj(c.pid).no1 = true; if (!S.ach.no1) ach('no1'); if (!c.counted && c.debut !== 1) { c.counted = 1; S.no1count = (S.no1count || 0) + 1; } } if (c.pos > 100) c.out = true; });
  S.charts.albums.forEach(c => { c.wk++; });
  if (S.charts.singles.length > 80) S.charts.singles = S.charts.singles.filter((c, i) => i < 40 || !c.out).slice(0, 80);
  if (S.charts.albums.length > 60) S.charts.albums.length = 60;
  if (S.log.length > 600) S.log = S.log.slice(-600);
  S.eggs.planted = S.eggs.planted.filter((e, i, arr) => !e.done || i >= arr.length - 40);
  if (S.sponsors.length > 30) S.sponsors = S.sponsors.slice(-30);
  // Natural drift.
  s.heat = Math.max(0, s.heat - 2.5 - (S.flags.hidden ? 3 : 0));
  updateCap();
  if (G.curveMode()) {
    const base = clamp(1 + (s.rep - 65) / 400 + (s.team - 60) / 800 + (S.recovery ? -.12 : 0), .65, 1.12);
    S.mom = clamp((S.mom || 1) + (base - (S.mom || 1)) * .07, .45, 1.6);
    if (S.abs < G.FREE_START) S.mom = clamp(S.mom, .7, 1.3);
    const tgt = G.fanTarget(a + 1) * S.mom; s.fans = Math.max(10, s.fans + (tgt - s.fans) * .3);
    if (S.flags.silence) s.heat = Math.max(0, s.heat - 2);
  } else { const gr = .0015 * ((s.rep - 50) / 50) + s.heat * .00004 - (S.flags.silence ? .001 : 0); s.fans *= 1 + (gr > 0 ? gr * clamp(1 - s.fans / G.fanCap(), 0, 1) : gr); }
  if (S.flags.silence) s.heat = Math.max(0, s.heat - 2);
  const ageSlow = Math.max(0, Math.floor((G.age() - 55) / 8));
  s.energy = clamp(s.energy + Math.max(0, G.blocks() - S.week.used) * 4 + Math.max(2, 6 - ageSlow), 0, 100);
  if (G.active(a).some(x => x.st === 'tour')) s.energy = clamp(s.energy - 4, 0, 100);
  s.team = clamp(s.team + (s.team < 60 ? .6 : -.2), 0, 100);
  const costs = yr < 2006 ? 25 : (300 + s.clout * 45) * Math.pow(1.03, yr - 2005) * (s.fans > 1e7 ? 5 : s.fans > 1e6 ? 2.5 : 1);
  s.money -= costs;
  G.allProjects().forEach(p => { const pj = S.pj[p.id]; if (pj && pj.hype > 0 && G.stageOf(p, a) !== 'pre') pj.hype = Math.max(0, pj.hype - 1.5); });
  eggsWeek();
  // Exhaustion and collapse.
  if (s.energy <= 0) { S.flags.exhausted = true; inbox('family', 'You need to stop', 'You have nothing left. Next week is a forced rest week.'); }
  if (!S.recovery && (s.rep < 15 || s.team < 15)) { const k = s.rep < 15 ? 'rep' : 'team'; S.recovery = { k, until:a + 12 }; inbox('manager', 'Recovery plan', `Your ${k === 'rep' ? 'Public Reputation' : 'team mood'} has collapsed. Get it back above 30 within 12 weeks. Weeks are harder until then.`); }
  if (S.recovery) { if (s[S.recovery.k] >= 30) { inbox('manager', 'You recovered', 'The comeback is real.'); applyFx({ fans:3 }); S.recovery = null; ach('comeback'); } else if (a >= S.recovery.until) { S.recovery.until = a + 12; } }
  // Duties expire.
  S.duties = S.duties.filter(d => d.due > a);
  // Tour wrap-ups and era goals.
  G.allProjects().forEach(p => { const w = G.win(p); if (w.te === a) wrapTour(p); if ((w.te != null ? w.te + 1 : w.rel + 21) === a + 1) checkGoals(p); });
  // Track.
  R.fans = s.fans - R.fans0; R.money = s.money - R.money0; R.units = units;
  R.team = S.inbox.filter(m => m.abs === a).slice(0, 3).map(m => `${FROM[m.from] || m.from}: ${m.subj}`);
  S.recap = R;
  S.history.push({ abs:a, fans:Math.round(s.fans), money:Math.round(s.money), rep:Math.round(s.rep), canon:G.canon() }); if (S.history.length > 1500) S.history.shift();
  if (ER.yw(a).w === 52) { Y.fans1 = s.fans; Y.money1 = s.money; Y.canon = G.canon(); Y.awards = S.awards.filter(x => x.y === yr).length; S.modal.push({ k:'year', y:yr }); }
  achievements();
  S.abs++;
  if (S.mode === 'story') { const key = G.unlockKey(S.artist), u = JSON.parse(lsGet(key) || JSON.stringify([G.firstEra(S.artist)])); G.allProjects().forEach(p => { const w = G.win(p), st = w.ws != null ? w.ws : w.rs; if (p.type !== 'demos' && p.type !== 'edition' && st != null && S.abs >= st && !u.includes(p.id) && G.art().projects.includes(p)) u.push(p.id); }); lsSet(key, JSON.stringify(u)); }
  startWeek();
}
G.chartWeek = function (r, rivalTop) {
  if (r.pos == null) r.pos = r.peak || 50; if (r.no1w == null) r.no1w = r.peak === 1 ? 1 : 0;
  const wk = r.wk + 1, weekly = r.fw * Math.pow(.62, wk) + r.fw * .012;
  let pos;
  if (r.no1Target && r.no1w < r.no1Target && r.pos <= 3) {
    // A big week for a rival can knock you off the top for a week.
    pos = rivalTop > weekly * 1.1 ? 2 : 1;
  } else if (r.run && r.run.peak && wk <= r.run.peakWeek) {
    // A slow climb to the real peak.
    // Climb from the debut position to the real peak, a little better or worse depending on how the era went.
    const start = r.debutPos || r.pos, goal = clamp(Math.round(r.run.peak * clamp(2 - (r.real ? r.fw / r.real : 1), .6, 1.6)), 2, 40);
    const t = wk / r.run.peakWeek; pos = Math.max(goal, Math.round(start + (goal - start) * t + rnd(-1, 1)));
  } else {
    pos = Math.round(r.pos + (r.pos < 10 ? rnd(1, 3) : r.pos < 50 ? rnd(1, 5) : rnd(2, 9)) - (r.wk < 2 ? 1 : 0));
  }
  r.pos = clamp(pos, 1, 201); if (r.pos === 1) r.no1w++; if (r.pos < r.peak) r.peak = r.pos;
};
function doRelease(p) {
  const pj = G.pj(p.id), c = counts(p);
  const songs = p.type === 'rerecord' ? p.tracks.concat(p.vaultSongs || []).map(t => S.songs[t + " (Taylor's Version)"]).filter(Boolean) : p.tracks.map(t => S.songs[t]).filter(x => x && x.st !== 'written');
  let q = songs.length ? songs.reduce((a, x) => a + x.q, 0) / songs.length : 30;
  q *= .6 + .4 * (c.recorded / Math.max(1, c.target));
  q -= pj.missed * 3; q += (pj.qmod || 0);
  if (p.solo && !pj.notSolo) q += 3;
  q = clamp(q, 5, 100);
  const cover = G.coverScore(p, pj.cover || (pj.cover = G.autoCover(p)));
  const genreGap = Math.abs(S.stats.genre - (p.genre || S.stats.genre));
  const perf = .36 * q / 100 + .22 * clamp(pj.hype + cover / 5, 0, 100) / 100 + .2 * S.stats.rep / 100 + .1 * S.stats.team / 100 + .12 * (1 - genreGap / 100);
  const f = p.units ? clamp(.4 + .9 * (perf - .15), .65, 1.3) : clamp(.4 + .9 * (perf - .15), .4, 1.4);
  const fw = Math.round(p.units ? p.units * f : p.type === 'edition' ? S.stats.fans * .002 * f : Math.max(5000, S.stats.fans * .025 * f));
  const pos = fw > 150000 ? 1 : fw > 60000 ? clamp(Math.round(8 - fw / 20000), 1, 8) : clamp(Math.round(40 - fw / 2000), 2, 40);
  // Songs come out.
  songs.forEach(x => { x.st = 'released'; });
  (p.extras || []).forEach(t => { const x = S.songs[t]; if (x && x.st === 'recorded') x.st = 'released'; });
  if (p.type === 'rerecord') { S.stats.own = clamp(S.stats.own + 6, 0, 100); }
  const run = (ER.ALBUM_RUNS || {})[p.id] || null;
  // Weeks at No. 1: the real run scaled by how this era went; invented eras earn theirs from sales.
  const no1Target = run ? (run.no1 ? Math.max(1, Math.round(run.no1 * clamp(fw / p.units, .5, 1.5) * clamp(G.momentum(), .7, 1.3))) : 0)
    : p.units ? (pos === 1 ? (fw > p.units * 1.1 ? 2 : 1) : 0)
    : (pos === 1 ? clamp(Math.round(1 + (fw / Math.max(1, S.stats.fans * .025) - .8) * 6 + rnd(-1, 1)), 1, 10) : 0);
  const rec = { pid:p.id, abs:S.abs, fw, total:fw, q:Math.round(q), peak:pos, pos, debutPos:pos, wk:0, real:p.units, cover, no1w:pos === 1 ? 1 : 0, no1Target, run:run ? Object.assign({}, run) : null };
  S.released.push(rec);
  S.charts.albums.unshift({ t:p.title, by:G.art().name, abs:S.abs, fw, pos, wk:0 });
  if (G.curveMode()) { const exp = p.units || (p.type === 'edition' ? S.stats.fans * .002 : S.stats.fans * .025); S.mom = clamp((S.mom || 1) * clamp(.85 + .15 * fw / Math.max(1, exp), .85, 1.08), .45, 1.6); } else S.stats.fans += fw * 1.2;
  S.stats.money += fw * (S.stats.own >= 30 ? 5 : 1.6);
  if (S.mode === 'story' && p.units) { const close = Math.abs(fw / p.units - 1) < .2; scoreCanon(close); }
  pj.released = true; pj.fw = fw;
  if (fw >= 1e6 && !S.ach.million) ach('million');
  if (!pj.singles.length) { const sg = G.defaultSingle(p); if (sg) G.releaseSingle(p, sg); }
  S.modal.push({ k:'release', pid:p.id });
  inbox('label', `${p.title}: first week`, `${G.fmtN(fw)} units${p.units ? ` (the real figure was ${G.fmtN(p.units)})` : ''}. Debut at No. ${pos}.`);
  return `${p.title} is out: ${G.fmtN(fw)} first week.`;
}
function wrapTour(p) {
  const pj = G.pj(p.id), tr = pj.tour; if (!tr || pj.tourDone) return; pj.tourDone = true;
  const t = p.tour.target; let note = '';
  if (t && S.mode === 'story') { const close = Math.abs(tr.gross / t - 1) < .25; scoreCanon(close); note = ` The real tour grossed about ${G.fmtM(t)}.${close ? ' Canon bonus: you matched its scale.' : ''}`;
    if (tr.gross > t * 1.25) applyFx({ energy:-20, team:-5 }); }
  if (tr.tier === 'stadium') ach('stadium');
  const yr = ER.yw(S.abs).y; S.years[yr] && (S.years[yr].gross += tr.gross, S.years[yr].shows += tr.played);
  if (p.type === 'farewell') { S.flags.farewellDone = S.abs; S.modal.push({ k:'retire', after:'farewell' }); ach('farewell'); }
  inbox('manager', `${p.tour.name} is over`, `${tr.played} shows, ${G.fmtN(tr.tickets)} tickets, ${G.fmtM(tr.gross)} gross.${note}`);
}
function checkGoals(p) {
  if (!p.goals || S.goals[p.id]) return; const pj = G.pj(p.id);
  S.goals[p.id] = p.goals.map(g => {
    if (g.k === 'units') return (pj.fw || 0) >= g.v;
    if (g.k === 'award') return S.awards.some(a => a.n === g.v && a.abs >= (G.win(p).rel || 0));
    if (g.k === 'no1') return !!pj.no1;
    if (g.k === 'solo') return !pj.notSolo;
    if (g.k === 'own') return S.stats.own >= g.v;
    if (g.k === 'tourgross') return pj.tour && pj.tour.gross >= g.v;
    if (g.k === 'film') return S.seen.atwfilm === 0;
    if (g.k === 'written') return p.tracks.every(t => S.songs[t]);
    return false; });
  if (G.pj(p.id).released && p.type !== 'edition') S.modal.push({ k:'wrap', pid:p.id });
  const n = S.goals[p.id].filter(Boolean).length; if (n) { applyFx({ clout:n * 2, fans:n }); S.stats.money += n * 50000; }
}
  const ACH_FAREWELL = { farewell:'The Farewell Tour', retired:'Retired', unretired:'The comeback after retirement' };
const ACH_MORE = { eras10:'Ten new eras', eras25:'Twenty-five new eras', eras50:'Fifty new eras' };
const ACH = { firstsong:'First song', no1:'Hot 100 No. 1', million:'A million in a week', aoty:'Album of the Year', stadium:'Stadium tour', masters:'Own your masters', canon90:'Canon Score 90+', eggs10:'Ten eggs decoded', comeback:'The comeback', billion:'Billion-dollar tour', free:'The story is yours' };
Object.assign(ACH, ACH_MORE, ACH_FAREWELL);
G.ACH = ACH;
function ach(k) { if (S.ach[k]) return; S.ach[k] = S.abs; inbox('fans', `Achievement: ${ACH[k]}`, 'Added to your Legacy.'); }
function achievements() {
  if (S.stats.own >= 95) ach('masters'); if (S.canon.total >= 20 && G.canon() >= 90) ach('canon90'); if (S.eggs.decoded >= 10) ach('eggs10');
  if (Object.values(S.pj).some(x => x.tour && x.tour.gross >= 1e9)) ach('billion'); if (S.flags.free) ach('free');
}

G.returnToPublic = function () { if (!S.flags.hidden) return; S.flags.hidden = false; S.flags.hiddenDone = true; applyFx({ heat:15, hype:10 }); inbox('publicist', 'You are back', 'You stepped back into public view early. The press noticed.'); };
/* ---------- Fast-forward ---------- */
G.quietWeek = () => !S.week.pending.length && !G.requiredLeft().length && !S.modal.length;
G.fastForward = function (max) {
  let n = 0; const st0 = JSON.stringify(G.active().map(x => x.p.id + x.st));
  while (n < (max || 52) && G.quietWeek()) { endWeek(); n++; if (JSON.stringify(G.active().map(x => x.p.id + x.st)) !== st0) break; }
  return n;
};
/* Routines: save the optional tasks you did, apply them in one tap. */
G.saveRoutine = () => { S.routine = G.tasks().filter(t => !t.req && S.week.done[t.id]).map(t => t.kind); return S.routine.length; };
G.applyRoutine = () => { let n = 0; S.routine.forEach(k => { const t = G.tasks().find(x => x.kind === k && !x.req && !S.week.done[x.id]); if (t && S.week.used + t.cost <= G.blocks()) { G.doTask(t.id); n++; } }); return n; };

/* ---------- Free play ---------- */
G.songTitle = () => { const w = ER.TITLE_WORDS; const r = Math.random(); return r < .55 ? `${pick(w.a)} ${pick(w.b)}` : r < .8 ? pick(w.c) : `The ${pick(w.b)}`; };
// A title nobody has used yet. After enough tries it adds a number, so it can never run out.
G.freshTitle = (used, gen) => { for (let i = 0; i < 60; i++) { const t = gen(); if (!used.has(t)) return t; } let n = 2, t0 = gen(); while (used.has(`${t0} ${n}`)) n++; return `${t0} ${n}`; };
G.albumTitle = () => { const used = new Set(S.custom.map(c => c.title).concat(G.art().projects.map(p => p.title)));
  return G.freshTitle(used, () => Math.random() < .5 ? `${pick(ER.ALBUM_A)} ${pick(ER.ALBUM_B)}` : Math.random() < .5 ? pick(ER.ALBUM_A) : `The ${pick(ER.ALBUM_A)} ${pick(ER.ALBUM_B)}`); };
G.newEra = function (title, n, weeks, tour, themeId) {
  const a = S.abs, rel = a + clamp(weeks, 16, 80), id = 'c' + (S.custom.length + 1);
  const used = new Set(Object.keys(S.songs)), tracks = [];
  while (tracks.length < n) { const t = G.freshTitle(new Set([...used, ...tracks]), G.songTitle); tracks.push(t); }
  const theme = ER.ERA_THEMES.find(t => t.id === themeId) || pick(ER.ERA_THEMES);
  const t0 = title || G.albumTitle(), pal = ER.seeded(id + t0)() < .5 ? theme.pals[0] : theme.pals[1];
  const p = { id, title:t0, short:t0, type:'album', custom:true, theme:theme.id, eraNo:S.custom.length + 1, color:pal[0], ink:'#ffffff', accent:pal[1], genre:theme.genre,
    look:ER.makeEraLook(theme, pal, id + t0, S.artist),
    ws:a, rs:a + Math.round((rel - a) * .35), fs:rel - 8, ps:rel - 4, rel, tracks, extras:[], units:null,
    cowriters:['Solo','Jack Antonoff','Aaron Dessner','Max Martin','Shellback'], producers:['Jack Antonoff','Aaron Dessner','Max Martin'],
    goals:[{ k:'units', v:Math.round(S.stats.fans * .025), l:`First week above ${G.fmtN(S.stats.fans * .025)}` }] };
  if (tour) p.tour = { name:G.tourName(p), kind:'headline', ts:rel + 14, te:rel + 14 + tour, openers:ER.RIVAL_STARS.slice(0, 2), target:null, tier:'stadium' };
  S.custom.push(p); S.proposal = null; S.breakUntil = 0;
  inbox('label', `Era ${p.eraNo}: ${p.title}`, `${theme.n}. Release set for the week of ${G.fmtDate(rel)}.`);
  const k = S.custom.length; if (k >= 10) ach('eras10'); if (k >= 25) ach('eras25'); if (k >= 50) ach('eras50');
  return p;
};
/* Endless free play: when an era winds down, the label pitches the next one. */
G.needsNextEra = () => {
  if (S.flags.retired || S.flags.farewell) return false;
  if (!(S.flags.free || (S.mode === 'era' && S.custom.length + S.started.length > 0)) || S.proposal || (S.breakUntil && S.abs < S.breakUntil)) return false;
  if (S.mode === 'era' && !S.flags.free && S.abs < G.FREE_START && !S.flags.pitchOk) { const last = G.allProjects().filter(p => p.type !== 'demos').pop(); if (last && !G.pj(last.id).released) return false; }
  if (G.active().some(x => ['write','record','finish','pre','release','tourprep','tour'].includes(x.st))) return false;
  const last = S.custom[S.custom.length - 1]; if (!last) return true;
  const st = G.stageOf(last, S.abs), w = G.win(last);
  return st === 'rest' || st === 'none' || (st === 'promo' && S.abs - w.rel >= 16);
};
G.proposeEra = function () {
  const ths = ER.ERA_THEMES.slice().sort(() => Math.random() - .5).slice(0, 3);
  S.proposal = { abs:S.abs, eraNo:S.custom.length + 1, titles:[G.albumTitle(), G.albumTitle(), G.albumTitle()], themes:ths.map(t => t.id) };
  S.modal = S.modal.filter(m => m.k !== 'nextera'); S.modal.push({ k:'nextera' });
  return S.proposal;
};
/* Retirement and the farewell tour. Available in free play (after 2026), or in Era Start once its era is out. */
G.canRetire = () => !S.flags.retired && (S.flags.free || (S.mode === 'era' && S.released.some(r => S.started.includes(r.pid) || r.pid.startsWith('c'))));
G.planFarewell = function (weeks, name) {
  const n = (S.custom.filter(p => p.type === 'farewell').length) + 1, a = S.abs, id = 'f' + n;
  const th = ER.ERA_THEMES.find(t => t.id === 'orchestral'), pal = ['#e6c35a', '#fff4c4', '#1a1408'];
  const p = { id, title:name || (n > 1 ? `The Farewell Tour ${n}` : 'The Farewell Tour'), short:'Farewell', type:'farewell', custom:true, color:pal[0], ink:'#1a1408', accent:pal[1], genre:S.stats.genre,
    look:ER.makeEraLook(Object.assign({}, th, { tops:['sequin','gown','bodysuit'] }), pal, id + 'farewell'), ws:null, rs:null, fs:null, ps:null, rel:a, tracks:[], extras:[], units:null,
    tour:{ name:name || 'The Farewell Tour', kind:'headline', ts:a + 10, te:a + 10 + clamp(weeks, 12, 80), openers:ER.RIVAL_STARS.slice(1, 3), target:null, tier:'stadium', farewell:true,
      note:'One last time: every era, every hit. Fans want to be there for the last show.' } };
  S.custom.push(p); S.flags.farewell = true; S.proposal = null; S.modal = S.modal.filter(m => m.k !== 'nextera');
  applyFx({ fans:3, heat:15 }); inbox('manager', 'The Farewell Tour', `It starts the week of ${G.fmtDate(p.tour.ts)}. Plan it in the Tour Desk.`);
  feed('she announced a FAREWELL TOUR. i need to sit down.'); return p;
};
G.keepGoing = function () { S.flags.farewell = false; inbox('manager', 'Not done yet', 'After the farewell tour, you are not ready to stop. The label is listening.'); };
G.retire = function () {
  if (S.flags.retired) return; S.flags.retired = S.abs; S.flags.farewell = false; S.proposal = null; S.breakUntil = 0;
  S.modal = S.modal.filter(m => m.k !== 'nextera' && m.k !== 'retire'); S.modal.push({ k:'ending' });
  S.duties = []; ach('retired'); inbox('family', 'Retired', 'You did it. Whatever you do next, you do it for yourself.');
};
G.unretire = function () {
  if (!S.flags.retired) return; const yrs = Math.round((S.abs - S.flags.retired) / 52);
  S.flags.retired = false; S.flags.comebacks = (S.flags.comebacks || 0) + 1; S.flags.free = S.flags.free || S.mode !== 'era';
  applyFx({ heat:25, fans:4 }); S.mom = clamp((S.mom || 1) + .08, .45, 1.6);
  inbox('label', 'The comeback', yrs ? `After ${yrs} year${yrs === 1 ? '' : 's'} away, everyone wants to know what you will do next.` : 'That was a short retirement.');
  feed('SHE IS BACK. i knew it.'); ach('unretired'); G.proposeEra();
};
// Career totals for the ending screen.
G.careerSummary = function () {
  const rel = S.released, best = rel.slice().sort((a, b) => b.fw - a.fw)[0];
  const tours = Object.keys(S.pj).map(k => S.pj[k]).filter(x => x.tour && (x.tour.played || 0) > 0);
  const firstRel = rel.length ? Math.min(...rel.map(r => r.abs)) : S.abs;
  return { albums:rel.length, units:rel.reduce((a, r) => a + r.total, 0), best:best ? { t:G.proj(best.pid).title, fw:best.fw } : null,
    no1:S.no1count != null ? S.no1count : S.charts.singles.filter(c => c.peak === 1).length, awards:S.awards.length, aoty:S.awards.filter(a => a.n === 'Album of the Year').length,
    shows:tours.reduce((a, x) => a + x.tour.played, 0), gross:tours.reduce((a, x) => a + x.tour.gross, 0), tickets:tours.reduce((a, x) => a + x.tour.tickets, 0),
    years:Math.max(0, Math.round((S.abs - firstRel) / 52)), eras:rel.filter(r => { const p = G.proj(r.pid); return p && p.type !== 'edition'; }).length,
    invented:S.custom.filter(p => p.type !== 'farewell').length, fans:S.stats.fans, money:S.stats.money, canon:G.canon(), own:S.stats.own, age:G.age() };
};
// The invented award show in free play: nominations from last year's work, results from how it did.
G.freeNominations = function () {
  const y = ER.yw(S.abs).y - 1, rel = S.released.filter(r => ER.yw(r.abs).y === y), cats = ER.FREE_AWARDS.cats, out = [];
  rel.forEach(r => { const p = G.proj(r.pid); if (!p) return; const sc = r.q / 100 * .5 + Math.min(1, r.fw / Math.max(1, S.stats.fans * .03)) * .5;
    out.push({ cat:cats[0], what:p.title, chance:clamp(sc - .1, .1, .85) }); });
  const best = S.charts.singles.filter(c => ER.yw(c.abs).y === y).sort((a, b) => a.peak - b.peak)[0];
  if (best) out.push({ cat:cats[1], what:best.t, chance:clamp(1 - best.peak / 25, .1, .8) });
  const toured = Object.keys(S.pj).some(k => S.pj[k].diary && S.pj[k].diary.some(d => ER.yw(d.abs).y === y));
  if (toured) out.push({ cat:cats[2], what:'your tour', chance:.5 });
  if (out.length) out.push({ cat:cats[3], what:G.art().name, chance:clamp(S.stats.rep / 140, .1, .7) });
  out.forEach(n => { n.won = Math.random() < n.chance; if (n.won) S.awards.push({ n:`${ER.FREE_AWARDS.n}: ${n.cat}`, abs:S.abs, y:y + 1 }); });
  return out;
};
G.takeBreak = function (weeks) { S.proposal = null; S.breakUntil = S.abs + weeks; applyFx({ energy:30, team:5 }); inbox('family', 'A break', `No new music for ${weeks} weeks. Rest up.`); };
G.startNextReal = function (id) {
  S.proposal = null; S.modal = S.modal.filter(m => m.k !== 'nextera');
  const p = G.art().projects.find(x => x.id === id); if (!p || S.started.includes(id)) return;
  const first = p.ws != null ? p.ws : p.rs; G.pj(id).shift = S.abs - first; S.started.push(id);
};
G.moveRelease = function (id, delta) {
  const p = G.proj(id), pj = G.pj(id), w = G.win(p);
  if (S.abs >= w.fs) return { err:'Too late to move: finishing has started.' };
  if (w.rel + delta < S.abs + 6) return { err:'The release needs at least six weeks of runway.' };
  // Moving keeps writing where it is and stretches the later stages.
  if (p.custom) { p.rel += delta; p.ps += delta; p.fs += delta; if (p.tour) { p.tour.ts += delta; p.tour.te += delta; } }
  else pj.shift += delta;
  return { ok:true };
};
G.tourName = p => /^the /i.test(p.title) ? `${p.title} Tour` : `The ${p.title} Tour`;
G.planCustomTour = function (p, weeks) { p.tour = { name:G.tourName(p), kind:'headline', ts:S.abs + 8, te:S.abs + 8 + weeks, openers:['Vesper Lane','Nova Kincaid'], target:null, tier:'stadium' }; };
G.enterFree = function () { S.flags.free = true; ach('free'); inbox('manager', 'The story is yours', 'From here on, the calendar, the songs and the drama are invented. Start a new era from the Studio.'); };

/* ---------- Sponsors ---------- */
G.signSponsor = function (id) {
  const sp = ER.SPONSORS.find(x => x.id === id); if (!sp || S.sponsors.some(x => x.id === id && !x.lost && !x.done)) return;
  const fee = Math.round(sp.pay * (20000 + S.stats.fans * .35) * (1 + S.stats.clout / 100) * (G.world('recession') ? .8 : 1));
  S.stats.money += fee;
  S.sponsors.push({ id, n:sp.n, paid:fee, abs:S.abs });
  duty('manager', `${sp.n}: ${sp.duties[0]}`, 1, S.abs + 3, { rep:-3, team:-3 }, id);
  duty('manager', `${sp.n}: ${sp.duties[1]}`, 1, S.abs + 6, { rep:-3, team:-3 }, id);
  inbox('manager', `Signed: ${sp.n}`, `${G.fmtM(fee)} up front. Two duties are on your calendar.`);
  return fee;
};

/* ---------- Saves ---------- */
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
G.lsGet = lsGet; G.lsSet = lsSet;
G.save = function (auto) { if (!S) return; S.saved = Date.now(); lsSet('eras-slot-' + S.slot, JSON.stringify(S)); };
G.load = function (slot) { const v = lsGet('eras-slot-' + slot); if (!v) return null; try { S = JSON.parse(v); S.slot = slot; return S; } catch (e) { return null; } };
G.slotInfo = slot => { const v = lsGet('eras-slot-' + slot); if (!v) return null; try { const s = JSON.parse(v); return { retired:!!(s.flags && s.flags.retired), y:ER.yw(s.abs).y, w:ER.yw(s.abs).w, mode:s.mode, artist:s.artist, saved:s.saved, canon:s.canon }; } catch (e) { return null; } };
G.del = slot => { try { localStorage.removeItem('eras-slot-' + slot); } catch (e) {} };
G.exportSave = () => JSON.stringify(S);
G.importSave = (txt, slot) => { const s = JSON.parse(txt); if (!s || !s.stats || s.abs == null) throw new Error('Not an Eras Life save'); s.slot = slot; S = s; G.save(); return S; };
G.unlockKey = a => a === 'taylor' || !a ? 'eras-unlocked' : 'eras-unlocked-' + a;
G.firstEra = a => { const A = ER.artists[a || 'taylor']; const p = A.projects.find(q => q.type !== 'demos' && q.type !== 'edition'); return p ? p.id : ''; };
G.unlockedEras = a => { const f = G.firstEra(a); try { const u = JSON.parse(lsGet(G.unlockKey(a)) || '[]'); return u.includes(f) ? u : [f].concat(u); } catch (e) { return [f]; } };
})();
