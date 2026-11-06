/* The Eras Life: freedom systems (engine side).
   - Song craft: arrange a song's sections, tempo, mood and sound. It changes quality and radio appeal.
   - Songs of your own: write invented songs any time in a notebook, then put them on any album
     as extra tracks. The real tracklists are never changed; your songs sit beside them.
   - Tracklist: put an album's songs in your own order. A good sequence helps reviews a little.
   - Tour prep: choose when preparation for a tour starts.
   - Ways to do tasks: pick how a rollout, release or tour task is done.
   - Opportunities: optional offers that turn up during the week, each with its own choices.
   Nothing here changes the real event track. Everything named here is invented. */
(function () {
const ER = window.ER, G = window.G;
const S = () => G.S(), pick = G.pick, rnd = G.rnd, clamp = G.clamp;

/* ---------- Song craft ---------- */
G.craftScore = function (c, pid) {
  const notes = []; let dq = 0, radio = 45, fav = 45;
  const sec = (c && c.sec) || [], n = sec.length, cnt = id => sec.filter(x => x === id).length;
  if (!n) return { dq:0, radio:50, fav:50, notes:[] };
  if (!cnt('verse') || !cnt('chorus')) { dq -= 6; radio -= 15; notes.push('Without a verse and a chorus it never quite lands.'); }
  const ch = cnt('chorus');
  if (ch >= 2 && ch <= 4) { dq += 2; radio += 10; } else if (ch > 4) { dq -= 2; radio += 4; notes.push('The chorus repeats a lot. Catchy, but critics notice.'); }
  const br = cnt('bridge');
  if (br === 1) { dq += 3; fav += 15; const second = sec.indexOf('chorus', sec.indexOf('chorus') + 1);
    if (second >= 0 && sec.indexOf('bridge') > second) { dq += 1; fav += 8; notes.push('The bridge lands after the second chorus. Fans will scream it.'); } else notes.push('A bridge gives it a lift.'); }
  else if (br > 1) { dq -= 1; notes.push('Two bridges make it wander.'); }
  if (sec.some((x, i) => x === 'pre' && sec[i + 1] === 'chorus')) { radio += 6; dq += 1; }
  if (sec[0] === 'chorus') { radio += 8; notes.push('Starting on the hook is great for radio.'); }
  if (cnt('key')) { if (sec.lastIndexOf('key') >= n - 3) { radio += 5; fav += 5; } else { dq -= 1; notes.push('The key change comes too early.'); } }
  if (cnt('post')) radio += 4;
  if (cnt('intro') > 1 || cnt('outro') > 1) dq -= 1;
  if (n < 5) { dq -= 3; notes.push('It feels short.'); } else if (n > 12) { dq -= 2; radio -= 6; notes.push('It runs long.'); }
  // Fit with the era's sound.
  const p = pid && G.proj(pid), mood = p ? (ER.ERA_MOOD[p.id] || (p.theme ? ({ country:'country', folk:'quiet', acoustic:'quiet', darkpop:'dark', jazz:'romantic', orchestral:'romantic' })[p.theme] || 'pop' : 'pop')) : null;
  const fit = mood && ER.MOOD_FIT[mood];
  if (fit) { let f = 0; if (fit.tempo.includes(c.tempo)) f++; if (fit.mood.includes(c.mood)) f++; if (fit.lean.includes(c.lean)) f++;
    if (f === 3) { dq += 3; notes.push('It sounds exactly like this era.'); } else if (f === 2) dq += 1; else if (f === 0) { dq -= 2; notes.push('It does not sound like the rest of this era. Some fans love that; most are confused.'); } }
  if (c.tempo === 'up') radio += 8; if (c.tempo === 'ballad') { radio -= 6; fav += 8; }
  if (c.mood === 'bitter' || c.mood === 'dark') fav += 4;
  return { dq:clamp(dq, -8, 8), radio:clamp(Math.round(radio), 5, 99), fav:clamp(Math.round(fav), 5, 99), notes };
};
G.radioWord = r => r >= 75 ? 'High' : r >= 50 ? 'Medium' : 'Low';
// Applies the craft chosen in the writing session to the song that was just written.
function applyCraft(t, craft, pid) {
  const so = S().songs[t]; if (!so || !craft || !craft.sec || !craft.sec.length) return so;
  const r = G.craftScore(craft, pid);
  so.q = clamp(so.q + r.dq, 10, 100); so.radio = r.radio; so.fav = r.fav;
  so.craft = { sec:craft.sec.slice(0, 14), tempo:craft.tempo, mood:craft.mood, lean:craft.lean };
  if (r.notes.length) so.note = (so.note ? so.note + ' ' : '') + r.notes.slice(0, 2).join(' ');
  return so;
}
G.applyCraft = applyCraft;
const writeSong0 = G.writeSong;
G.writeSong = function (t, co, insp, appr) {
  const r = writeSong0.apply(this, arguments);
  if (r && G._craft) { applyCraft(t, G._craft, r.p); }
  G._craft = null;
  return r;
};

/* ---------- Songs of your own ---------- */
const allReal = () => { const set = new Set(); Object.values(ER.artists).forEach(a => (a.projects || []).forEach(p => (p.tracks || []).concat(p.extras || [], p.vault || []).forEach(t => set.add(t.toLowerCase())))); return set; };
let REAL = null;
G.titleOk = t => { t = String(t || '').trim(); if (!t || t.length > 60) return 'Give it a title (up to 60 characters).';
  REAL = REAL || allReal(); if (REAL.has(t.toLowerCase())) return 'That is a real song title. Pick a title of your own.';
  if (S().songs[t]) return 'You already have a song with that title.'; return ''; };
G.freshOwnTitle = () => { REAL = REAL || allReal(); const used = new Set(Object.keys(S().songs).concat([...REAL])); return G.freshTitle(used, G.songTitle); };
G.notebook = () => Object.keys(S().songs).filter(t => { const so = S().songs[t]; return so.p == null && so.own && so.st === 'written'; });
G.writeOwn = function (title, craft, pid) {
  const s = S(); title = String(title || '').trim() || G.freshOwnTitle();
  const err = G.titleOk(title); if (err) return { err };
  let q = rnd(30, 50) + s.stats.write * .42 + (s.flags.focus ? 3 : 0) + (G.writeBonus ? G.writeBonus() : 0); s.flags.focus = false;
  s.songs[title] = { p:pid || null, st:'written', q:clamp(Math.round(q), 10, 100), co:'Solo', abs:s.abs, kind:pid ? 'original' : 'notebook', own:true, note:'' };
  applyCraft(title, craft, pid);
  s.stats.write = clamp(s.stats.write + .5, 0, 100);
  G.journalAdd(`Wrote "${title}"`, pid ? `A song of your own for ${G.proj(pid).title}.` : 'In the notebook, for whenever it fits.');
  return { ok:true, t:title, so:s.songs[title] };
};
// Albums that can take a song right now: anything still being written, recorded or finished.
G.openAlbums = () => G.active().filter(x => ['write','record','finish'].includes(x.st) && x.p.type !== 'rerecord' && x.p.type !== 'demos' && x.p.type !== 'farewell').map(x => x.p);
G.attachSong = function (t, pid) { const so = S().songs[t]; if (!so || !so.own) return false; so.p = pid; so.kind = 'original'; so.off = false; return true; };
G.detachSong = function (t) { const so = S().songs[t]; if (!so || !so.own || so.st === 'released') return false; so.p = null; so.kind = 'notebook'; return true; };
G.ownFor = pid => Object.keys(S().songs).filter(t => { const so = S().songs[t]; return so.own && so.p === pid; });
G.origOn = pid => G.ownFor(pid).filter(t => !S().songs[t].off && S().songs[t].st !== 'written');
const recordable0 = G.recordable;
G.recordable = function () {
  const out = recordable0();
  G.active().forEach(({ p, st }) => { if (st !== 'record' && st !== 'finish') return;
    G.ownFor(p.id).forEach(t => { const so = S().songs[t]; if (so.st === 'written' && !out.some(o => o.t === t)) out.push({ t, p, vault:false, own:true }); }); });
  return out;
};
// When an album comes out, your recorded songs on it come out too.
G.hooks.week.push(() => { const s = S();
  Object.keys(s.songs).forEach(t => { const so = s.songs[t]; if (!so.own || so.p == null || so.st !== 'recorded' || so.off) return;
    const pj = s.pj[so.p]; if (pj && pj.released) { so.st = 'released'; so.relAbs = s.abs; } }); });
// Better radio appeal helps an invented single a little. Real singles keep their real chart anchors.
const releaseSingle0 = G.releaseSingle;
G.releaseSingle = function (p, t) { const so = S().songs[t]; const bump = so && so.radio != null && !(G.peaks()[t] || G.debuts()[t]) ? Math.round((so.radio - 50) / 8) : 0;
  if (bump) so.q += bump; try { return releaseSingle0.apply(this, arguments); } finally { if (bump) so.q -= bump; } };

/* ---------- Tracklist ---------- */
G.tracklist = function (pid) {
  const p = G.proj(pid), pj = G.pj(pid), base = G.liveTracks(p).concat(G.ownFor(pid).filter(t => !S().songs[t].off));
  const order = (pj.order || []).filter(t => base.includes(t));
  base.forEach(t => { if (!order.includes(t)) order.push(t); });
  return order;
};
G.moveTrack = function (pid, t, d) { const L = G.tracklist(pid), i = L.indexOf(t), j = i + d; if (i < 0 || j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; G.pj(pid).order = L; };
G.resetTracklist = pid => { G.pj(pid).order = null; };
G.seqScore = function (pid) {
  const L = G.tracklist(pid), so = t => S().songs[t] || null, q = t => so(t) ? so(t).q : null, known = L.filter(t => q(t) != null);
  const notes = []; let b = 0;
  if (known.length < 3) return { b:0, notes:['Write and record more songs to judge the order.'] };
  const avg = known.reduce((a, t) => a + q(t), 0) / known.length, best = known.reduce((m, t) => q(t) > q(m) ? t : m, known[0]);
  if (q(L[0]) != null && q(L[0]) >= avg + 3) { b++; notes.push(`"${L[0]}" is a strong opener.`); } else if (q(L[0]) != null && q(L[0]) < avg - 6) { b--; notes.push('The opener is one of the weaker songs.'); }
  if (L.slice(0, 5).includes(best)) { b++; notes.push(`Your best song, "${best}", is in the first five.`); }
  const last = L[L.length - 1], ls = so(last);
  if (ls && (ls.craft && ls.craft.tempo === 'ballad' || ls.q >= avg + 2)) { b++; notes.push(`"${last}" closes it beautifully.`); }
  const t5 = L[4]; if (so(t5) && so(t5).fav >= 70) { b++; notes.push(`Track 5, "${t5}", is the emotional heart. Fans notice that.`); }
  for (let i = 0; i < L.length - 2; i++) { const a = q(L[i]), c = q(L[i + 1]), d = q(L[i + 2]); if (a != null && c != null && d != null && a < avg - 5 && c < avg - 5 && d < avg - 5) { b--; notes.push('Three weaker songs in a row sag in the middle.'); break; } }
  return { b:clamp(b, -2, 3), notes };
};
G.lockTracklist = function (pid) {
  const pj = G.pj(pid), r = G.seqScore(pid);
  pj.qmod = (pj.qmod || 0) - (pj.seqApplied || 0) + r.b; pj.seqApplied = r.b; pj.order = G.tracklist(pid); pj.seqLocked = S().abs;
  return r;
};

/* ---------- Tour prep timing ---------- */
const win0 = G.win;
G.win = function (p) {
  const w = win0(p), pj = S().pj[p.id];
  if (w.ts != null && pj && pj.tpAt != null) { const lo = p.type === 'farewell' ? w.ts - 30 : w.rel + 1; w.tps = clamp(pj.tpAt + (pj.shift || 0), lo, w.ts - 2); }
  return w;
};
G.prepRange = function (p) { const s = S(), w = win0(p); if (w.ts == null) return null;
  const lo = Math.max(s.abs + 1, p.type === 'farewell' ? w.ts - 30 : w.rel + 1), hi = w.ts - 2; return lo <= hi ? { lo, hi, def:w.tps, ts:w.ts } : null; };
G.setPrepStart = function (pid, abs) { const p = G.proj(pid), r = G.prepRange(p); if (!r) return false;
  const pj = G.pj(pid); pj.tpAt = clamp(abs, r.lo, r.hi) - (pj.shift || 0); return true; };
G.prepStart = p => G.win(p).tps;
// Crunch: a very short prep wears everyone down. A long one keeps the team calm.
G.hooks.week.push(a => { const s = S(); if (s.flags.retired) return;
  G.active().forEach(({ p, st }) => { if (st !== 'tourprep') return; const w = G.win(p), len = w.ts - w.tps;
    if (len <= 4) G.applyFx({ energy:-3, team:-1 }); else if (len >= 12) G.applyFx({ team:.5 }); }); });

/* ---------- Ways to do tasks ---------- */
G.payScale = () => clamp(S().stats.fans * .2, 2000, 3e6);
G.stylesFor = t => { if (!t || !t.item || !['pre','rel','tp','fin'].includes(t.kind)) return null; if (t.kind === 'rel' && G.world('lockdown')) return null; return ER.TASK_STYLES[t.kind + ':' + t.item] || null; };
G.applyStyle = function (t, i) { const st = (G.stylesFor(t) || [])[i]; if (!st) return null;
  const fx = Object.assign({}, st.fx); if (fx.money) fx.money = Math.round(fx.money * clamp(G.payScale() / 1e6, .01, 1.5));
  G.applyFx(fx); const pj = t.p ? G.pj(t.p) : null; if (pj) { pj.styles = pj.styles || {}; pj.styles[t.item] = i; }
  return { r:st.r, fx }; };

/* ---------- Opportunities ---------- */
G.oppOk = function (o) { const s = S(), age = G.age(), sts = G.active().map(x => x.st);
  if (s.flags.retired || age < (o.minAge || 12)) return false;
  if (o.pub && s.flags.hidden) return false;
  if (o.live && G.world('lockdown')) return false;
  if (o.weeks && !(G.yw().w >= o.weeks[0] && G.yw().w <= o.weeks[1])) return false;
  if (o.when === 'any') return true;
  return o.when.some(w => w === 'none' ? !sts.filter(x => x !== 'rest' && x !== 'promo').length : sts.includes(w)); };
G.hooks.week.push(a => { const s = S(); s.opps = (s.opps || []).filter(o => o.until >= a && G.oppOk(ER.OPPS.find(x => x.id === o.id) || { when:'any' }));
  if (s.flags.retired || s.opps.length >= 3 || Math.random() > (G.fr ? G.fr().opp : .35)) return;
  const recent = new Set((s.oppSeen || []).slice(-10)), rivalRoll = Math.random() < .3, pool = ER.OPPS.filter(o => !recent.has(o.id) && !s.opps.some(x => x.id === o.id) && (!o.rival || rivalRoll) && (o.rival ? true : !rivalRoll || Math.random() < .5) && G.oppOk(o));
  if (!pool.length) return; const o = pick(pool);
  s.opps.push({ id:o.id, uid:G.uid(), until:a + 3 }); s.oppSeen = (s.oppSeen || []).concat(o.id).slice(-12); });
G.opps = () => (S().opps || []).map(x => Object.assign({ o:ER.OPPS.find(y => y.id === x.id) }, x)).filter(x => x.o);
G.takeOpp = function (uid, ci) {
  const s = S(), x = (s.opps || []).find(y => y.uid === uid); if (!x) return { err:'That offer has gone.' };
  const o = ER.OPPS.find(y => y.id === x.id), c = o && o.ch[ci]; if (!c) return { err:'Pick an option.' };
  if (c.cost && !G.canSpend(c.cost)) return { err:'Not enough Time Blocks this week.' };
  if (c.live && G.world('lockdown')) return { err:'Not possible during lockdown.' };
  s.week.used += c.cost || 0; G.applyFx(c.fx || {});
  const lines = [c.r];
  if (c.pay) { const m = Math.round(c.pay * G.payScale()); s.stats.money += m; lines.push(`${m >= 0 ? '+' : '−'}${G.fmtM(Math.abs(m)).replace('−', '')}`); }
  if (c.focus) s.flags.focus = true;
  if (c.song) { const r = G.writeOwn(G.freshOwnTitle(), null, null); if (r.ok) lines.push(`"${r.t}" is in your notebook (quality ${r.so.q}).`); }
  s.opps = s.opps.filter(y => y !== x);
  G.journalAdd(o.t, c.r);
  return { ok:true, lines, fx:c.fx };
};

/* ---------- The notebook task and task styles hook into the task list ---------- */
const tasks0 = G.tasks;
G.tasks = function () {
  const out = tasks0.apply(this, arguments), s = S();
  if (!s.flags.retired && G.age() >= 10 && !out.some(t => t.id === 'notebook'))
    out.push({ id:'notebook', l:'Write a song of your own', cost:2, req:false, kind:'notebook', tab:'songbook', desc:'Any time. Put it on an album later, or keep it.' });
  return out;
};
const doTask0 = G.doTask;
G.doTask = function (id, arg) {
  if (id !== 'notebook') return doTask0.apply(this, arguments);
  const s = S(); if (s.week.done.notebook) return { err:'Already done.' };
  if (!G.canSpend(2)) return { err:'No Time Blocks left this week, even with overtime.' };
  const over = Math.max(0, s.week.used + 2 - G.blocks()) - Math.max(0, s.week.used - G.blocks());
  const r = G.writeOwn(arg && arg.t, arg && arg.craft, arg && arg.pid); if (r.err) return r;
  s.week.used += 2; s.week.done.notebook = true;
  G.hooks.task.forEach(f => { try { f({ id:'notebook', kind:'write' }, arg); } catch (x) {} });
  let msg = `You wrote "${r.t}". Quality ${r.so.q}.`;
  if (over > 0) { G.applyFx({ energy:-8 * over }); msg += ` Overtime cost ${8 * over} Energy.`; }
  return { ok:true, msg, t:r.t };
};
})();
