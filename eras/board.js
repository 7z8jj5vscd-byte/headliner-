/* The Eras Life: the Week Board. Your week is a hand of cards. Play them into your week's slots,
   chain combos for bonuses, and wrap the week to see what happened. Every action pops with
   feedback: floating stat changes, a card that flies into its slot, and confetti for big moments.
   Underneath, every card is the same task as before, so the story and its numbers are unchanged. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, bar, VIEWS, ACT, toast, stageName } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();
const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Card looks ---------- */
const CAT = {
  music:{ n:'Music', icon:'🎵', kinds:['write','record','notebook','practice','secretsession','ghostwrite','early','fin','duet'] },
  stage:{ n:'Stage', icon:'🎤', kinds:['shows','tp','surprise','recover','gig','booking'] },
  fans:{ n:'Fans', icon:'💖', kinds:['social','fanevent','livestream','readfans','egg','single','pre','rel'] },
  biz:{ n:'Business', icon:'💼', kinds:['interview','network','duty','campaign','charity','school','mentor'] },
  you:{ n:'You', icon:'🌙', kinds:['rest','private','freetime','timeoff'] },
  big:{ n:'Career', icon:'🌟', kinds:['farewellplan','retireask','newera','unretire'] },
  town:{ n:'Town', icon:'🏙️', kinds:['town'] }, fake:{ n:'Make it or fake it', icon:'🎭', kinds:['fake','real'] } };
const catOf = t => Object.keys(CAT).find(k => CAT[k].kinds.includes(t.kind)) || 'biz';
const ICON = { write:'✍️', notebook:'📓', record:'🎙️', practice:'🎼', secretsession:'🤫', ghostwrite:'👻', early:'🌱', duet:'🎶', shows:'🎤', recover:'🛌', surprise:'✨', gig:'🎸', booking:'🏟️',
  social:'📱', fanevent:'💌', livestream:'📡', readfans:'👀', egg:'🥚', single:'📻', interview:'📰', network:'🤝', duty:'📋', campaign:'🏆', charity:'💝', school:'🏫', mentor:'🧑‍🏫',
  rest:'💤', private:'🫶', freetime:'🌊', newera:'🌟', farewellplan:'👋', retireask:'🌅', unretire:'🔥' };
const ITEM = { video:'🎬', press:'📸', announce:'📣', single:'📻', tv:'📺', radio:'📻', signing:'✒️', posts:'💬', route:'🗺️', setlist:'📝', cast:'💃', costume:'👗', rehearse:'🥁',
  sequence:'🔢', master:'🎚️', cover:'🎨', edition:'💿', deliver:'📦' };
const iconOf = t => t.icon || (t.item && ITEM[t.item]) || ICON[t.kind] || '⭐';
UI.cardIcon = iconOf; UI.cardCat = catOf;

/* ---------- Combos ---------- */
const COMBOS = [
  { id:'studio', n:'Studio flow', need:['write|notebook', 'record'], fx:{ write:1, energy:4 }, d:'Write and record in the same week.' },
  { id:'frenzy', n:'Fan frenzy', need:['social', 'fanevent|livestream|readfans'], fx:{ fans:1 }, d:'Post, then meet fans.' },
  { id:'media', n:'Media day', need:['interview', 'network|duty'], fx:{ clout:2, heat:1 }, d:'An interview plus industry work.' },
  { id:'recharge', n:'Recharged', need:['rest', 'private|freetime'], fx:{ energy:10, team:2 }, d:'Rest, then time for yourself.' },
  { id:'rollout', n:'Rollout machine', need:['pre|rel|single', 'pre|rel|single'], fx:{ hype:4 }, d:'Two rollout cards in a week.' },
  { id:'road', n:'Road warrior', need:['shows|booking|gig', 'surprise|recover|social'], fx:{ fans:.8, team:1 }, d:'A show, plus a little extra on the road.' },
  { id:'balanced', n:'Balanced week', cats:3, fx:{ team:3, energy:3 }, d:'Play cards from three different suits.' } ];
const kindsPlayed = () => ((S().week || {}).log || []).map(x => x.kind);
function comboState(c) { const ks = kindsPlayed().slice(), s = S();
  if ((s.week.combos || []).includes(c.id)) return 'done';
  if (c.cats) { const n = new Set((s.week.log || []).map(x => x.cat)).size; return n >= c.cats ? 'ready' : n === c.cats - 1 ? 'near' : 'off'; }
  let got = 0; c.need.forEach(alt => { const opts = alt.split('|'), i = ks.findIndex(k => opts.includes(k)); if (i >= 0) { got++; ks.splice(i, 1); } });
  return got === c.need.length ? 'ready' : got === c.need.length - 1 && got > 0 ? 'near' : 'off'; }
G.hooks.week.push(() => { UI.flashQ = []; });
G.hooks.task.push(t => { const s = S(); if (!s || !s.week || t.kind === 'school') return;
  s.week.log = s.week.log || []; s.week.log.push({ id:t.id, kind:t.kind, item:t.item || '', cost:t.cost, cat:catOf(t), team:s.week.used < 0, icon:t.icon || '' });
  s.week.combos = s.week.combos || [];
  COMBOS.forEach(c => { if (comboState(c) === 'ready') { s.week.combos.push(c.id); G.applyFx(c.fx); (UI.flashQ = UI.flashQ || []).push(c); G.guideTick('combo'); } }); });

/* ---------- Little bits of feedback ---------- */
function confetti(n, x, y) { if (reduce()) return; const cv = document.createElement('canvas'); cv.className = 'confetti'; cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
  const c = cv.getContext('2d'), cols = ['#f6d38a','#e88fb4','#8fb8e8','#9fe2bf','#ffffff', getComputedStyle(document.documentElement).getPropertyValue('--era').trim() || '#d6a93a'];
  const P = Array.from({ length:n || 90 }, () => ({ x:x != null ? x : innerWidth / 2, y:y != null ? y : innerHeight / 3, vx:(Math.random() - .5) * 12, vy:Math.random() * -11 - 3, r:Math.random() * 6.28, s:4 + Math.random() * 6, c:cols[Math.floor(Math.random() * cols.length)] }));
  const t0 = performance.now(); const step = now => { const dt = now - t0; c.clearRect(0, 0, cv.width, cv.height);
    P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35; p.vx *= .99; p.r += .2; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.globalAlpha = Math.max(0, 1 - dt / 1600); c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); });
    if (dt < 1600) requestAnimationFrame(step); else cv.remove(); }; requestAnimationFrame(step); }
UI.confetti = confetti;
function banner(title, sub) { const b = document.createElement('div'); b.className = 'combo-pop'; b.innerHTML = `<span>${h(title)}</span><small>${h(sub || '')}</small>`; document.body.appendChild(b); setTimeout(() => b.remove(), 2200); }
UI.banner = banner;
const STATN = { fans:'Fans', money:'Money', rep:'Rep', heat:'Heat', energy:'Energy', write:'Songwriting', clout:'Clout', team:'Team' };
function floaters(before, x, y) { const s = S(); if (!s || !before) return; const out = [];
  Object.keys(STATN).forEach(k => { const d = s.stats[k] - before[k]; if (!d) return;
    if (k === 'fans') { if (Math.abs(d) >= 1) out.push([`${d > 0 ? '+' : '−'}${G.fmtN(Math.abs(d))} fans`, d > 0]); }
    else if (k === 'money') { if (Math.abs(d) >= 1) out.push([`${d > 0 ? '+' : '−'}${G.fmtM(Math.abs(d)).replace('−', '')}`, d > 0]); }
    else if (Math.abs(d) >= .5) out.push([`${d > 0 ? '+' : '−'}${Math.abs(Math.round(d * 10) / 10)} ${STATN[k]}`, k === 'heat' ? d < 0 : d > 0]); });
  out.slice(0, 4).forEach(([txt, good], i) => { const f = document.createElement('div'); f.className = 'floater ' + (good ? 'good' : 'bad'); f.textContent = txt;
    f.style.left = Math.max(12, Math.min(innerWidth - 140, x - 50)) + 'px'; f.style.top = (y - 20 - i * 30) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1500); }); }
let snap = null;
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el || !S()) { snap = null; return; }
  snap = { st:Object.assign({}, S().stats), x:e.clientX || innerWidth / 2, y:e.clientY || innerHeight / 2, abs:S().abs, card:el.closest('.pcard') ? el.closest('.pcard').getBoundingClientRect() : null, icon:el.closest('.pcard') ? el.closest('.pcard').dataset.icon : '' }; }, true);
document.addEventListener('click', () => { const sn = snap; snap = null; if (!sn) return; setTimeout(() => {
  if (!S()) return; floaters(sn.st, sn.x, sn.y);
  if (sn.card && !reduce()) { const slots = document.querySelectorAll('.wslot.filled'), tgt = slots[slots.length - 1]; if (tgt) flyTo(sn.card, tgt.getBoundingClientRect(), sn.icon); }
  if (UI.flashQ && UI.flashQ.length) { const cs = UI.flashQ.splice(0); banner(`Combo! ${cs.map(c => c.n).join(' + ')}`, cs.map(c => G.fxText(c.fx)).join(', ')); confetti(70); if (window.SND) SND.fanfare(); }
  if (sn.abs !== S().abs) weekReel(sn); }, 40); });
function flyTo(from, to, icon) { const g = document.createElement('div'); g.className = 'ghostcard'; g.textContent = icon || '⭐';
  Object.assign(g.style, { left:from.left + 'px', top:from.top + 'px', width:from.width + 'px', height:from.height + 'px' }); document.body.appendChild(g);
  g.animate([{ transform:'translate(0,0) scale(1)', opacity:1 }, { transform:`translate(${to.left - from.left + (to.width - from.width) / 2}px,${to.top - from.top + (to.height - from.height) / 2}px) scale(${Math.max(.2, to.width / from.width)})`, opacity:.2 }], { duration:450, easing:'cubic-bezier(.3,.7,.3,1)' }).onfinish = () => g.remove(); }
function weekReel(sn) { if ($('.modal') || reduce()) return; const s = S(), d = s.stats.fans - sn.st.fans, m = s.stats.money - sn.st.money;
  const r = document.createElement('div'); r.className = 'reel'; r.innerHTML = `<div><small>${h(G.fmtDate(s.abs))}</small><b>Week ${G.yw().w}</b><span class="${d >= 0 ? 'pos' : 'neg'}">${d >= 0 ? '+' : '−'}${G.fmtN(Math.abs(d))} fans</span><span class="${m >= 0 ? 'pos' : 'neg'}">${m >= 0 ? '+' : '−'}${G.fmtM(Math.abs(m)).replace('−', '')}</span></div>`;
  document.body.appendChild(r); setTimeout(() => r.remove(), 1700); }
// Five-star nights and No. 1 debuts get confetti.
const sn0 = G.showNight; G.showNight = function () { const r = sn0.apply(this, arguments); if (r && r.stars === 5) setTimeout(() => { confetti(120); banner('Five stars!', 'A night nobody will forget.'); }, 300); return r; };
G.hooks.week.push(() => { const s = S(), last = s.released[s.released.length - 1]; if (last && last.abs === s.abs - 1 && last.debutPos === 1 && !last.cheered) { last.cheered = true; setTimeout(() => { confetti(140); banner('No. 1 debut!', (G.proj(last.pid) || {}).title || ''); }, 600); } });

/* ---------- The board ---------- */
function ring(v, max, label, col) { const p = Math.max(0, Math.min(1, v / (max || 100))), C = 2 * Math.PI * 16;
  return `<div class="ring" title="${h(label)}"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" class="rt"/><circle cx="20" cy="20" r="16" class="rv" style="stroke:${col};stroke-dasharray:${C};stroke-dashoffset:${C * (1 - p)}"/></svg><b>${Math.round(v)}</b><span>${h(label)}</span></div>`; }
function cardHTML(t) { const done = G.taskDone(t.id), cat = catOf(t), can = G.canSpend(t.cost), icon = iconOf(t); if (t.locked) t.l = t.l;
  const team = !done && !t.fixed && G.canDelegate && G.canDelegate(t);
  return `<div class="pcard task cat-${cat} ${t.req ? 'req' : ''} ${done ? 'done' : ''}" data-icon="${h(icon)}">
    <button class="pplay" data-act="do" data-id="${h(t.id)}" ${done || t.fixed || !can || t.locked ? 'disabled' : ''} aria-label="${h(t.l)}${t.req ? ', due now' : ''}${done ? ', played' : ''}${t.locked ? ', locked' : ''}">
      <span class="ptop"><span class="pcost">${t.ecost != null ? (t.ecost ? `⚡${t.ecost}` : '<i>free</i>') : t.cost ? '●'.repeat(Math.ceil(t.cost)) : '<i>free</i>'}</span><span class="pcat">${h(CAT[cat].n)}</span></span>
      <span class="picon">${icon}</span><b class="ptitle">${h(t.l)}</b>${t.desc ? `<span class="pdesc">${h(t.desc)}</span>` : ''}
      ${t.req && !done ? '<span class="pdue">Due</span>' : ''}${done ? '<span class="pdone">Played</span>' : ''}${t.locked ? '<span class="plock">🔒</span>' : ''}</button>
    ${team ? `<button class="pteam" data-act="delegate" data-id="${h(t.id)}" title="Your team plays it for ${h(G.fmtM(G.delegateCost(t)))}">Team · ${h(G.fmtM(G.delegateCost(t)))}</button>` : ''}
    ${t.tab && t.tab !== 'week' && !done ? `<button class="popen" data-act="tab" data-v="${t.tab}" aria-label="Open ${h(t.tab)}">↗</button>` : ''}</div>`; }
function slotsHTML() { const s = S(), max = G.energyMax ? G.energyMax() : G.blocks() * 20, left = G.energyLeft ? G.energyLeft() : (G.blocks() - s.week.used) * 20, pct = Math.max(0, Math.min(100, left / max * 100));
  const log = (s.week.log || []).filter(x => x.kind !== 'school'), chips = [];
  if ((s.week.done || {}).school) chips.push('<div class="wslot filled cat-biz" title="School">🏫</div>');
  log.forEach(x => { const ic = x.icon || (x.item && ITEM[x.item]) || ICON[x.kind] || '⭐'; chips.push(`<div class="wslot filled cat-${x.cat} ${x.team ? 'team' : ''}" title="${h(x.kind)}">${ic}</div>`); });
  return `<div class="ebar ${pct < 25 ? 'low' : ''}" role="meter" aria-label="Energy this week" aria-valuenow="${left}" aria-valuemax="${max}"><i style="width:${pct}%"></i><span>⚡ ${left} of ${max} energy left</span></div><div class="played">${chips.join('') || '<span class="small faint">Cards you play this week land here.</span>'}</div>`; }
function combosHTML() { return COMBOS.map(c => { const st = comboState(c); return `<span class="cmb ${st}" title="${h(c.d)} ${h(G.fxText(c.fx))}">${st === 'done' ? '✦ ' : ''}${h(c.n)}</span>`; }).join(''); }
VIEWS.week = function () {
  const s = S(), x = UI.primary(), tasks = G.tasks(), req = tasks.filter(t => t.req), opt = tasks.filter(t => !t.req && t.kind !== 'freetime');
  const cat = UI.sel.handCat || 'all', inCat = t => cat === 'all' || catOf(t) === cat;
  const order = t => (G.taskDone(t.id) ? 1 : 0) * 10 + (G.canSpend(t.cost) ? 0 : 1);
  const hand = opt.filter(inCat).sort((a, b) => order(a) - order(b));
  const counts = {}; opt.forEach(t => { if (!G.taskDone(t.id)) counts[catOf(t)] = (counts[catOf(t)] || 0) + 1; });
  const e = G.currentEra(), hype = e ? G.pj(e.id).hype : 0, left = Math.max(0, G.blocks() - s.week.used), reqLeft = req.filter(t => !G.taskDone(t.id)).length;
  const dl = []; G.allProjects().forEach(p => { const w = G.win(p); [[w.rel, `${p.short || p.title} out`], [w.ts, `${p.tour && p.tour.name} starts`], [w.te, `${p.tour && p.tour.name} ends`], [w.ps, `${p.short || p.title} pre-release`]].forEach(([a, l]) => { if (a != null && a >= s.abs && a < s.abs + 10) dl.push([a, l]); }); });
  s.duties.forEach(d => { if (d.due < s.abs + 6) dl.push([d.due, d.l]); }); dl.sort((a, b) => a[0] - b[0]);
  const notes = [];
  if (s.challenge && !s.challenge.done) notes.push(['🎯', `<b>${h(s.challenge.n)}</b>: ${h(s.challenge.d)}`]);
  if (s.recovery) notes.push(['⚠️', `Recovery: raise your ${s.recovery.k === 'rep' ? 'Public Reputation' : 'team mood'} to 30.`]);
  G.worldNotes().forEach(n => notes.push(['🌍', h(n)]));
  if (s.flags.retired) notes.push(['🌅', `Retired in ${ER.yw(s.flags.retired).y}. Come back whenever you like.`]);
  if (s.flags.farewell) notes.push(['👋', 'The Farewell Tour: one last run, then you decide.']);
  if (s.flags.hidden) notes.push(['🕶️', 'Out of public view. You can still write, record and plan.']);
  if (s.week.forcedRest) notes.push(['😮‍💨', 'Forced rest: Energy hit zero, so you have 1 block this week.']);
  const guide = s.guide && !s.guide.done && !s.challenge ? `<div class="guide">${ER.GUIDE.map(g => `<span class="gstep ${s.guide[g.id] ? 'ok' : ''}" title="${h(g.hint)}">${s.guide[g.id] ? '✓' : '○'} ${h(g.l)}</span>`).join('')}</div>` : '';
  const r = s.recap;
  return `${notes.length ? `<div class="notes">${notes.map(([i, t]) => `<div class="note"><span>${i}</span><div class="small">${t}</div></div>`).join('')}</div>` : ''}
  <div class="stagewrap hero"><div class="stage3d" id="t3stage"></div>
    <div class="rings">${ring(s.stats.energy, 100, 'Stamina', '#5fd39a')}${e ? ring(hype, 100, 'Hype', '#e88fb4') : ''}${ring(G.energyLeft ? G.energyLeft() : left * 20, G.energyMax ? G.energyMax() : G.blocks() * 20, '⚡ Left', 'var(--era)')}</div>
    <div class="caption">${x ? `<span class="eyebrow">${h(stageName(x.st))}</span><b>${h(x.p.title)}</b><div class="small">${h(ER.STAGES[x.st].need)}</div>` : '<b>Between eras</b><div class="small">Your move.</div>'}</div></div>
  ${guide}
  <section class="board" aria-label="This week">
    <div class="between"><div><span class="eyebrow">Week ${G.yw().w} · ${h(G.fmtDate(s.abs))}</span><h2>Your week</h2></div><span class="small muted">⚡ ${Math.round(s.week.used * 20)} used</span></div>
    ${slotsHTML()}
    <div class="cmbs" aria-label="Combos">${combosHTML()}</div>
    ${req.length ? `<h3>${reqLeft ? `Due this week · ${reqLeft}` : 'Due this week · all played ✓'}</h3><div class="hand must">${req.map(cardHTML).join('')}</div>` : '<p class="small muted free-week">Nothing is due. Play whatever you like.</p>'}
    <div class="between hand-head"><h3>Your hand</h3><div class="chips sm">${['all'].concat(Object.keys(CAT).filter(k => counts[k])).map(k => `<button class="chip sm ${cat === k ? 'on' : ''}" data-act="handcat" data-v="${k}">${k === 'all' ? 'All' : CAT[k].icon + ' ' + CAT[k].n}${k !== 'all' ? ` <i>${counts[k]}</i>` : ''}</button>`).join('')}</div></div>
    <div class="hand">${hand.map(cardHTML).join('') || '<p class="small muted">No cards in this suit.</p>'}</div>
  </section>
  ${dl.length ? `<div class="dlstrip">${dl.slice(0, 6).map(([a, l]) => `<span class="dl ${a === s.abs ? 'now' : ''}"><b>${a === s.abs ? 'Now' : h(G.fmtDate(a).replace(/, \d{4}$/, ''))}</b>${h(l)}</span>`).join('')}</div>` : ''}
  <div class="actions"><button class="btn big" data-act="advance">${reqLeft ? `Wrap the week · ${reqLeft} due` : 'Wrap the week ➜'}</button>
    <button class="btn ghost" data-act="ff" ${G.quietWeek() ? '' : 'disabled'} title="Skips quiet weeks only. Stops at every real event and deadline.">Skip ahead</button></div>
  <div class="row small routine"><button class="btn ghost sm" data-act="saveroutine">Save this week as a routine</button><button class="btn ghost sm" data-act="applyroutine" ${s.routine.length ? '' : 'disabled'}>Play my routine (${s.routine.length})</button></div>
  ${UI.seasonCard()}${UI.chartShow()}
  ${r ? card(`<h3>Last week</h3><div class="grid3"><div><b class="${r.fans >= 0 ? 'pos' : 'neg'}">${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)}</b><div class="small muted">fans</div></div><div><b class="${r.money >= 0 ? 'pos' : 'neg'}">${G.fmtM(r.money)}</b><div class="small muted">money</div></div><div><b>${G.fmtN(r.units)}</b><div class="small muted">units</div></div></div>${r.lines.map(l => `<p class="small">${h(l)}</p>`).join('')}`) : ''}`;
};
ACT.handcat = d => { UI.sel.handCat = d.v; render(); };
// Cards are buttons, so Enter and Space already play them. Keep focus on the hand after a re-render.
})();
