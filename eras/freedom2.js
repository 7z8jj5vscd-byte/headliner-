/* The Eras Life: player control (engine side).
   - Story style for each save: Canon (the real calendar, as before), Guided (real events, but you
     can move album dates) or Sandbox (real dates are suggestions; delay or skip an era).
   - Deadlines instead of required tasks: work is due by a date, and you choose the weeks.
   - Hand a task to your team: it costs money and comes out a little weaker, but saves the week.
   - Work ahead on the next album, take a week off, auto-play weeks, release singles any time,
     and spend a marketing budget.
   The real event track keeps its real dates in every style; the Canon Score tracks how close you stay. */
(function () {
const ER = window.ER, G = window.G;
const S = () => G.S(), clamp = G.clamp;

/* ---------- Story style ---------- */
const DEF = { mode:'canon', deadlines:false, opp:.35, whatif:true, drama:1 };
G.STYLES = [
  { id:'canon', n:'Canon', d:'The real calendar. Required tasks every week, and albums come out on their real dates.' },
  { id:'guided', n:'Guided', d:'Real events still happen, but you choose your weeks: work is due by deadlines, and you can move album dates.' },
  { id:'sandbox', n:'Sandbox', d:'Real dates are suggestions. Move, delay or skip eras, and start from any era. Canon Score shows how close you stay.' }
];
G.fr = () => { const s = S(); if (!s) return DEF; if (!s.fr) s.fr = Object.assign({}, DEF); return s.fr; };
G.frMode = () => G.fr().mode;
G.setStyle = function (mode) { const f = G.fr(); f.mode = mode; f.deadlines = mode !== 'canon'; };
G.setFr = (k, v) => { G.fr()[k] = v; };
const newGame0 = G.newGame;
G.newGame = function (o) { const r = newGame0.apply(this, arguments); const want = o.fr || (window.UI && UI.newg && UI.newg.fr) || 'canon';
  r.fr = Object.assign({}, DEF); G.setStyle(want); return r; };
G.hooks.load.push(s => { if (!s.fr) s.fr = Object.assign({}, DEF); });

/* ---------- Deadlines instead of required tasks ---------- */
const tasks0 = G.tasks;
G.tasks = function () {
  const out = tasks0.apply(this, arguments), s = S(); if (!s || !G.fr().deadlines) return out;
  const a = s.abs;
  out.forEach(t => {
    if (!t.p || !['write','record','fin','pre','tp','single'].includes(t.kind)) return;
    const p = G.proj(t.p); if (!p) return; const w = G.win(p), pj = G.pj(p.id); let due = null, req = t.req;
    if (t.kind === 'write') { due = w.fs - 1; req = t.req && a >= w.fs - 3; }
    else if (t.kind === 'record') { due = w.ps - 1; req = t.req && a >= w.fs; }
    else if (t.kind === 'fin') { due = w.ps - 1; const left = ER.FINISH.filter(f => !pj.fin[f[0]]).length; req = left >= w.ps - a; }
    else if (t.kind === 'pre') { due = w.rel - 1; const list = p.type === 'rerecord' ? ER.PRE_TV : p.surprise ? ER.PRE_SURPRISE : ER.PRE; const left = list.filter(f => !pj.pre[f[0]]).length; req = left >= w.rel - a; }
    else if (t.kind === 'tp') { due = w.ts - 1; const left = ER.TOURPREP.filter(f => !pj.tp[f[0]]).length; req = left >= w.ts - a || (t.item === 'rehearse' && w.ts - a <= 1); }
    else if (t.kind === 'single') { req = false; }
    t.req = !!req; if (due != null) t.due = due;
    if (due != null) t.desc = (t.desc ? t.desc + ' ' : '') + (req ? 'Due now.' : `Due by ${G.fmtDate(due)}.`);
  });
  return out;
};

/* ---------- Hand a task to your team ---------- */
const DELEGABLE = ['write','record','fin','pre','rel','tp','duty','single','campaign','interview','social','network'];
G.delegateCost = t => Math.round(Math.max(500, G.payScale() * .25 * Math.max(1, t.cost)));
G.canDelegate = t => !!t && DELEGABLE.includes(t.kind) && !S().week.done[t.id] && !S().flags.retired && S().stats.money >= G.delegateCost(t);
G.delegate = function (id) {
  const s = S(), t = G.tasks().find(x => x.id === id); if (!G.canDelegate(t)) return { err:'Your team cannot take that one, or you cannot afford it.' };
  const cost = G.delegateCost(t), before = {}; Object.keys(s.songs).forEach(k => before[k] = s.songs[k].st);
  const used = s.week.used; s.week.used = -999;
  let r; try { r = G.doTask(id); } finally { s.week.used = used; }
  if (!r || r.err) return r || { err:'It did not work.' };
  s.stats.money -= cost;
  Object.keys(s.songs).forEach(k => { if (before[k] !== s.songs[k].st) s.songs[k].q = clamp(s.songs[k].q - 6, 10, 100); });
  if (t.p) { const pj = G.pj(t.p); pj.hype = clamp(pj.hype - 1.5, 0, 100); pj.delegated = (pj.delegated || 0) + 1; }
  G.applyFx({ team:-.5 });
  return { ok:true, msg:`Your team handled it for ${G.fmtM(cost)}. It is a little less you than usual.` };
};

/* ---------- Work ahead on the next album ---------- */
G.aheadAlbums = () => { if (G.frMode() === 'canon') return []; const s = S();
  return G.allProjects().filter(p => p.type !== 'rerecord' && p.type !== 'demos' && p.type !== 'farewell' && p.tracks && p.tracks.length && G.stageOf(p, s.abs) === 'none' && G.win(p).ws != null && G.win(p).ws > s.abs && G.win(p).ws - s.abs <= 40); };
const writable0 = G.writable;
G.writable = function () { const out = writable0.apply(this, arguments);
  G.aheadAlbums().forEach(p => p.tracks.forEach(t => { if (!S().songs[t] && !out.some(o => o.t === t)) out.push({ t, p, kind:'album', ahead:true }); }));
  return out; };

/* ---------- A week off ---------- */
G.timeOff = function () {
  const s = S(); if (s.week.done.timeoff) return { err:'You are already off this week.' };
  const left = G.requiredLeft().filter(t => t.kind !== 'school'); let paid = 0, skipped = 0;
  left.forEach(t => { if (G.canDelegate(t)) { const c = G.delegateCost(t); const r = G.delegate(t.id); if (r.ok) paid += c; else skipped++; } else skipped++; });
  s.week.used = Math.max(s.week.used, G.blocks()); s.week.done.timeoff = true;
  G.applyFx({ energy:35, team:3 }); G.journalAdd('A week off', 'No studio, no press. Just rest.');
  return { ok:true, msg:`A week off. +35 Energy.${paid ? ` Your team covered the work for ${G.fmtM(paid)}.` : ''}${skipped ? ` ${skipped} task${skipped > 1 ? 's still need' : ' still needs'} you.` : ''}` };
};

/* ---------- Auto-play ---------- */
// Plays the week the way you set it up: required work first, then your saved routine, then rest.
G.autoWeek = function () {
  const s = S(); let n = 0;
  for (let k = 0; k < 12; k++) { const t = G.requiredLeft().find(x => G.canSpend(x.cost)); if (!t) break; const r = G.doTask(t.id); if (!r || r.err) break; n++; }
  if (s.routine && s.routine.length) n += G.applyRoutine();
  while (s.week.used < G.blocks() && s.stats.energy < 60) { const r = G.doTask('rest'); if (!r || r.err) break; }
  return n;
};
G.autoplay = function (weeks) {
  const s = S(), start = s.abs; let played = 0, why = '';
  for (let i = 0; i < weeks; i++) {
    if (s.week.pending.length || s.modal.length) { why = 'Something needs you.'; break; }
    G.autoWeek();
    if (G.requiredLeft().length) { why = 'A required task needs you.'; break; }
    const r = G.advance(false); if (!r || !r.ok) { why = 'Something needs you.'; break; }
    played++;
    if (s.week.pending.length || s.modal.length) { why = 'A real event or a decision is waiting.'; break; }
  }
  return { played, why, from:start };
};

/* ---------- Singles any time ---------- */
G.singleOptions = function (p) {
  const s = S(), pj = G.pj(p.id);
  const pool = (p.type === 'rerecord' ? p.tracks.concat(p.vaultSongs || []).map(t => t + " (Taylor's Version)") : p.tracks.concat(p.extras || [], G.origOn ? G.origOn(p.id) : []));
  return pool.filter(t => s.songs[t] && s.songs[t].st !== 'written' && !pj.singles.includes(t));
};
G.canSingleNow = p => { const s = S(), pj = G.pj(p.id), st = G.stageOf(p, s.abs);
  return pj.released && ['promo','tourprep','tour','rest'].includes(st) && pj.singles.length < 10 && s.abs - (pj.lastSingle || 0) >= 3 && G.singleOptions(p).length > 0; };
G.singleNow = function (pid, t) {
  const s = S(), p = G.proj(pid); if (!G.canSingleNow(p)) return { err:'Not ready for another single yet. Leave three weeks between singles.' };
  if (!G.canSpend(1)) return { err:'No Time Blocks left.' };
  const opt = G.singleOptions(p); t = opt.includes(t) ? t : opt[0];
  const task = G.tasks().find(x => x.kind === 'single' && x.p === pid && !G.taskDone(x.id));
  if (task) { const r = G.doTask(task.id, t); G.pj(pid).lastSingle = s.abs; return r; }
  G.releaseSingle(p, t); s.week.used++; G.pj(pid).lastSingle = s.abs;
  return { ok:true, msg:`"${t}" goes to radio.` };
};

/* ---------- Marketing budget ---------- */
G.CHANNELS = [
  { id:'radio', n:'Radio', d:'Helps singles climb.' }, { id:'video', n:'Video ads', d:'Big reach, big cost.' },
  { id:'social', n:'Social', d:'Cheap, and fans share it.' }, { id:'billboard', n:'Billboards', d:'Huge in the cities you pick.' },
  { id:'press', n:'Press', d:'Profiles and reviews. Raises Press Heat.' } ];
G.TIERS = [{ n:'Small', m:.5, hype:3 }, { n:'Medium', m:1.5, hype:6 }, { n:'Big', m:4, hype:10 }];
G.marketCost = (tier) => Math.round(G.payScale() * G.TIERS[tier].m);
G.canMarket = p => ['finish','pre','release','promo','tourprep','tour'].includes(G.stageOf(p, S().abs));
G.market = function (pid, ch, tier) {
  const s = S(), p = G.proj(pid), pj = G.pj(pid), T = G.TIERS[tier]; if (!p || !T || !G.canMarket(p)) return { err:'Marketing opens when an album is being finished.' };
  pj.mkt = pj.mkt || {}; const m = pj.mkt[ch] = pj.mkt[ch] || { spent:0, wk:-1, n:0 };
  if (m.wk === s.abs) return { err:'You already spent on that channel this week.' };
  const cost = G.marketCost(tier); if (s.stats.money < cost) return { err:'Not enough money.' };
  s.stats.money -= cost; m.spent += cost; m.wk = s.abs; m.n++;
  const fall = 1 / (1 + m.n * .25), gain = T.hype * fall;
  pj.hype = clamp(pj.hype + gain, 0, 100);
  if (ch === 'radio') pj.radioPush = (pj.radioPush || 0) + tier + 1;
  if (ch === 'social') G.applyFx({ fans:.4 * (tier + 1) });
  if (ch === 'press') G.applyFx({ heat:2 * (tier + 1) });
  if (ch === 'billboard') G.applyFx({ fans:.3 * (tier + 1) });
  if (ch === 'video') G.applyFx({ fans:.6 * (tier + 1) });
  return { ok:true, msg:`${G.TIERS[tier].n} ${G.CHANNELS.find(c => c.id === ch).n.toLowerCase()} push: +${gain.toFixed(1)} hype for ${G.fmtM(cost)}.` };
};
// Radio pushes help invented singles; real singles keep their real chart anchors.
const rs0 = G.releaseSingle;
G.releaseSingle = function (p, t) { const pj = G.pj(p.id), so = S().songs[t], push = pj.radioPush || 0, real = G.peaks()[t] || G.debuts()[t];
  const bump = so && push && !real ? Math.min(8, push) : 0; if (bump) so.q += bump;
  try { return rs0.apply(this, arguments); } finally { if (bump) so.q -= bump; pj.radioPush = Math.max(0, push - 2); } };

/* ---------- Move, delay or skip an era ---------- */
G.canMove = p => G.frMode() !== 'canon' || S().mode === 'era' || p.custom;
const move0 = G.moveRelease;
G.moveRelease = function (id, delta) { const p = G.proj(id); if (!G.canMove(p)) return { err:'Switch the story style to Guided or Sandbox to move real release dates.' };
  if (G.frMode() === 'guided' && !p.custom && Math.abs((G.pj(id).shift || 0) + delta) > 12) return { err:'Guided keeps real albums within 12 weeks of their real date. Sandbox has no limit.' };
  return move0.apply(this, arguments); };
// Delaying before writing starts moves the whole era, writing included.
G.delayEra = function (id, weeks) { const p = G.proj(id), pj = G.pj(id); if (G.frMode() !== 'sandbox') return { err:'Delaying a whole era needs Sandbox.' };
  if (G.stageOf(p, S().abs) !== 'none' || G.win(p).ws == null || G.win(p).ws <= S().abs) return { err:'Only an era that has not started yet can be delayed.' };
  if (p.custom) { ['ws','rs','fs','ps','rel'].forEach(k => p[k] += weeks); if (p.tour) { p.tour.ts += weeks; p.tour.te += weeks; } } else pj.shift = (pj.shift || 0) + weeks;
  return { ok:true, msg:`${p.title} moves ${weeks > 0 ? 'later' : 'earlier'} by ${Math.abs(weeks)} weeks.` }; };
G.skipEra = function (id, on) { if (G.frMode() !== 'sandbox') return { err:'Skipping an era needs Sandbox.' }; const pj = G.pj(id); pj.skipped = on !== false; return { ok:true }; };
const allP0 = G.allProjects;
G.allProjects = function () { const s = S(); return allP0.apply(this, arguments).filter(p => !(s.pj[p.id] && s.pj[p.id].skipped && !s.pj[p.id].released)); };
G.upcoming = function () { const s = S(); return G.art().projects.concat(s.custom || []).filter(p => p.type !== 'demos' && (s.mode === 'story' || s.started.includes(p.id) || p.custom)).filter(p => { const w = win1(p); return w.rel != null && w.rel > s.abs && w.rel - s.abs < 300; }); };
const win1 = p => G.win(p);

/* ---------- Start anywhere ---------- */
const ue0 = G.unlockedEras;
G.unlockedEras = function (a) { if (window.UI && UI.newg && UI.newg.fr === 'sandbox') return ER.artists[a].projects.filter(p => p.type !== 'demos' && p.type !== 'edition').map(p => p.id); return ue0.apply(this, arguments); };

/* ---------- What is coming up ---------- */
G.calendar = function (weeks) {
  const s = S(), out = [], end = s.abs + (weeks || 26);
  G.allProjects().forEach(p => { if (p.type === 'demos') return; const w = G.win(p), nm = p.short || p.title;
    [[w.ws, `${nm}: writing starts`], [w.rs, `${nm}: recording starts`], [w.fs, `${nm}: finishing starts`], [w.ps, `${nm}: pre-release starts`], [w.rel, `${nm} comes out`], [w.tps, p.tour ? `${p.tour.name}: prep starts` : null], [w.ts, p.tour ? `${p.tour.name}: first show` : null], [w.te, p.tour ? `${p.tour.name}: last show` : null]]
      .forEach(([a, l]) => { if (l && a != null && a >= s.abs && a <= end) out.push({ abs:a, l, pid:p.id }); }); });
  (s.duties || []).forEach(d => { if (d.due >= s.abs && d.due <= end) out.push({ abs:d.due, l:d.l }); });
  return out.sort((x, y) => x.abs - y.abs);
};
})();
