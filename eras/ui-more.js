/* The Eras Life: interface for the add-on systems. Uses the helpers exposed on UI. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI, T3 = window.T3;
const { h, card, bar, modal, closeModals, mount3D, VIEWS, ACT, toast } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const rerender = () => UI.render();

// A plain look for invented artists who have no era looks of their own.
ER.LOOKS.generic_eras = { early:{ base:{ skin:'#e9c3a1', hair:'#6b3e26', eyes:'#3a2a20', style:'waves', hairLen:.55, hairGlow:1 }, stage:{ top:'sequin', outfit:'#b58aff', accent:'#ffd166', mic:1 }, casual:{ top:'jacket', outfit:'#3c5a8a', accent:'#ffffff', pants:'#1a1a1a' } } };

/* ---------- Pop-ups: what-if steps and the team ---------- */
UI.modalKinds.whatif = (m, s) => {
  const w = ER.WHATIFS[m.id], st = w.steps[m.step];
  modal(`<span class="eyebrow">What if · invented</span><h2>${h(st.t)}</h2><p class="small muted">${h(w.t)}</p><div class="stage3d short" id="t3wi"></div><p>${h(st.x)}</p>
    <div class="stack tight" id="wich">${st.ch.map((c, i) => `<button class="choice" data-act="wichoose" data-i="${i}">${h(c.l)}<div class="small muted">${h(G.fxText(c.fx))}</div></button>`).join('')}</div>`, 'sens');
  mount3D('#t3wi', { set:'home', color:'#8a6bc4', figs:[{ look:UI.lookFor('', G.currentEra()), anim:'talk' }] }, 'wi');
};
ACT.wichoose = d => { const s = S(), m = s.modal[0], st = ER.WHATIFS[m.id].steps[m.step], c = st.ch[+d.i]; G.applyFx(c.fx); G.journalAdd(st.t, c.r);
  const box = $('#wich'); if (box) box.innerHTML = `<p><b>${h(c.r)}</b></p><button class="btn big" data-act="modalok">Continue</button>`; };
UI.modalKinds.crew = (m, s) => {
  G.teamInit(); const p = s.crew.find(x => x.id === m.id), A = ER.TEAM_ARCS[m.arc], f = x => x.replace(/\{name\}/g, p.name).replace(/\{role\}/g, p.role.toLowerCase());
  modal(`<span class="eyebrow">Your team · invented</span><h2>${h(f(A.t))}</h2><div class="stage3d short" id="t3crew"></div><p>${h(f(A.x))}</p>
    <div class="stack tight" id="crewch">${A.ch.map((c, i) => `<button class="choice" data-act="crewchoose" data-i="${i}">${h(c.l)}</button>`).join('')}</div>`);
  mount3D('#t3crew', { set:'studio', color:(G.currentEra() || {}).color, figs:[{ look:UI.lookFor('', G.currentEra()), x:-.4, anim:'talk' }, { look:T3.TEAM[p.fig], x:.8, z:-.3, ry:-.5, anim:'talk' }] }, 'crew');
};
ACT.crewchoose = d => { const m = S().modal[0], c = G.crewResolve(m.id, m.arc, +d.i); const box = $('#crewch'); if (box) box.innerHTML = `<p><b>${h(c.r)}</b></p><button class="btn big" data-act="modalok">Continue</button>`; };

/* ---------- Press and People: team and journalists ---------- */
const press0 = VIEWS.press;
VIEWS.press = function () {
  G.teamInit(); G.pressInit(); const s = S();
  const team = card(`<h2>Your team</h2><p class="small muted">Invented people around the real career. Keep them happy and they bring ideas; overwork them and they may leave.</p>
    ${s.crew.map(m => `<div class="statrow"><span><b>${h(m.name)}</b><br><span class="faint">${h(m.role)}</span></span>${bar(m.mood)}<b>${Math.round(m.mood)}</b></div>`).join('')}
    <div class="row"><button class="btn ghost sm" data-act="teamdinner" ${G.canSpend(1) ? '' : 'disabled'}>Take the team to dinner · 1</button></div>`);
  const journos = s.flags.hidden ? '' : card(`<h3>Journalists</h3><p class="small muted">Invented writers who remember how you treat them.</p>
    ${s.press.map(j => `<div class="logrow"><div class="between"><b>${h(j.n)}</b><span class="small muted">${h(j.outlet)}</span></div><div class="statrow"><span>Warmth</span>${bar(j.warmth)}<b>${Math.round(j.warmth)}</b></div>
      <div class="row"><button class="btn ghost sm" data-act="journo" data-n="${h(j.n)}" data-v="open">Open up · 1</button><button class="btn ghost sm" data-act="journo" data-n="${h(j.n)}" data-v="charm">Charm · 1</button><button class="btn ghost sm" data-act="journo" data-n="${h(j.n)}" data-v="guarded">Stay guarded · 1</button></div></div>`).join('')}`);
  return team + journos + press0();
};
ACT.teamdinner = () => { if (!G.canSpend(1)) return toast('No blocks left.'); S().week.used++; S().crew.forEach(m => m.mood = Math.min(100, m.mood + 6)); G.applyFx({ team:3, money:-5000 }); toast('A long dinner. Everyone feels seen.'); rerender(); };
ACT.journo = d => { if (!G.canSpend(1)) return toast('No blocks left.'); S().week.used++; const tone = G.pressTalk(d.n, d.v); toast(`${d.n} writes a ${tone} piece.`); rerender(); };

/* ---------- Fandom: fans you know, theories, the fan map ---------- */
const fandom0 = VIEWS.fandom;
VIEWS.fandom = function () {
  const s = S(); if (s.released.length) G.fansInit(); G.regionsInit();
  const folk = s.fanfolk ? card(`<h2>Fans you know</h2><p class="small muted">Five invented fans you follow across the years.</p>
    ${s.fanfolk.map(f => `<div class="logrow"><div class="between"><b>${h(f.n)}, ${f.age}</b><span class="small muted">${h(f.city)}</span></div><div class="small muted">${h((f.notes[0] || {}).x || 'Listening every day.')}</div></div>`).join('')}`) : '';
  const th = (s.theories || []).filter(t => !t.done);
  const theories = card(`<h3>Fan theories</h3>${th.length ? th.map(t => `<div class="logrow"><div class="small">${h(t.x)}</div><div class="row"><button class="btn ghost sm" data-act="theory" data-id="${t.id}" data-v="confirm">Confirm</button><button class="btn ghost sm" data-act="theory" data-id="${t.id}" data-v="tease">Tease</button><button class="btn ghost sm" data-act="theory" data-id="${t.id}" data-v="debunk">Debunk</button></div></div>`).join('') : '<p class="small muted">No theories right now. They appear when the press is paying attention.</p>'}`);
  const map = card(`<h3>Fan map</h3><p class="small muted">Where your fans are. Touring a region grows it.</p>${Object.keys(s.regions).map(r => `<div class="statrow"><span>${h(r)}</span>${bar(s.regions[r])}<b>${Math.round(s.regions[r])}%</b></div>`).join('')}`);
  return folk + theories + map + fandom0();
};
ACT.theory = d => { G.theory(d.id, d.v); toast({ confirm:'Fans scream.', tease:'Fans spiral, happily.', debunk:'Fans move on to the next theory.' }[d.v]); rerender(); };

/* ---------- Rollout and Studio: video director and packaging ---------- */
const rollout0 = VIEWS.rollout;
VIEWS.rollout = function () {
  const s = S(), ps = G.active().filter(x => ['pre','release','promo'].includes(x.st) && x.p.type !== 'demos');
  const vids = ps.length ? card(`<h3>Music video director</h3><p class="small muted">Design a video for ${h(ps[0].p.short || ps[0].p.title)}.</p><button class="btn sm" data-act="vdir" data-p="${ps[0].p.id}" ${G.canSpend(2) ? '' : 'disabled'}>Direct a video · 2</button>
    ${(G.pj(ps[0].p.id).videos || []).map(v => `<p class="small">${h(v.concept)} in ${h(v.location)}: ${v.views.toLocaleString()} views</p>`).join('')}`) : '';
  return vids + rollout0();
};
ACT.vdir = d => { UI.vd = { pid:d.p, concept:'story', location:'rooftop', moment:'rain' }; vdirModal(); };
function vdirModal() {
  const v = UI.vd, p = G.proj(v.pid); closeModals();
  const row = (k, arr) => `<h3>${{ concept:'Concept', location:'Location', moment:'The big moment' }[k]}</h3><div class="chips">${arr.map(([id, l]) => `<button class="chip ${v[k] === id ? 'on' : ''}" data-act="vdpick" data-k="${k}" data-v="${id}">${h(l)}</button>`).join('')}</div>`;
  modal(`<span class="eyebrow">Music video · ${h(p.short || p.title)}</span><h2>Direct the video</h2><div class="stage3d short" id="t3vid"></div>${row('concept', ER.VIDEO.concept)}${row('location', ER.VIDEO.location)}${row('moment', ER.VIDEO.moment)}
    <button class="btn big" data-act="vdgo">Shoot it · 2 blocks</button><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="closem">Not now</button></div>`);
  mount3D('#t3vid', { set:'video', color:p.color, figs:[{ look:UI.lookFor('release', p), anim:v.concept === 'dance' ? 'dance' : 'sing' }] }, 'vid');
}
ACT.vdpick = d => { UI.vd[d.k] = d.v; vdirModal(); };
ACT.vdgo = () => { if (!G.canSpend(2)) return toast('No blocks left.'); const v = UI.vd; S().week.used += 2; const r = G.directVideo(v.pid, v);
  const t = G.tasks().find(x => x.id === `pre:${v.pid}:video`); if (t && !G.taskDone(t.id)) { G.pj(v.pid).pre.video = true; S().week.done[t.id] = true; }
  closeModals(); rerender(); UI.sessionResult('The video is out', [{ x:`${r.views.toLocaleString()} views in the first week.` }, { x:`Fans and critics give it ${r.score} out of 100.` }]); };
const studio0 = VIEWS.studio;
VIEWS.studio = function () {
  const x = G.active().find(y => y.st === 'finish' && y.p.type !== 'demos');
  const pk = x ? card(`<h3>Album packaging</h3><p class="small muted">The liner notes for ${h(x.p.short || x.p.title)}.</p>${G.pj(x.p.id).packaging ? '<p class="small pos">Packaging done.</p>' : `<div class="chips">${ER.THANKS.map(([id, l]) => `<button class="chip" data-act="pack" data-p="${x.p.id}" data-v="${id}">${h(l)}</button>`).join('')}</div>`}`) : '';
  return pk + studio0();
};
ACT.pack = d => { G.packaging(d.p, d.v, d.v === 'secret'); toast(d.v === 'secret' ? 'Fans will be decoding the thank-yous for weeks.' : 'The liner notes are done.'); rerender(); };

/* ---------- Tour Desk: stage designer ---------- */
const tour0 = VIEWS.tour;
VIEWS.tour = function () {
  const s = S(), plan = UI.sel.plan; let des = '';
  if (plan && plan.pid && !(G.pj(plan.pid).tour && G.pj(plan.pid).tour.approved)) {
    plan.design = plan.design || { stage:'round', light:ER.LIGHTS[0], acts:5 };
    des = card(`<h3>Stage designer</h3><p class="small muted">A good flow (four to eight acts, songs from many eras) lifts every show.</p>
      <div class="chips">${ER.STAGES3D.map(([id, l]) => `<button class="chip ${plan.design.stage === id ? 'on' : ''}" data-act="sdes" data-k="stage" data-v="${id}">${h(l)}</button>`).join('')}</div>
      <div class="chips">${ER.LIGHTS.map(c => `<button class="chip ${plan.design.light === c ? 'on' : ''}" data-act="sdes" data-k="light" data-v="${c}"><i class="dot" style="background:${c}"></i></button>`).join('')}</div>
      <label class="field"><span>Acts: ${plan.design.acts}</span><input type="range" min="1" max="10" value="${plan.design.acts}" data-act="sacts"></label>`);
  }
  return des + tour0();
};
ACT.sdes = d => { UI.sel.plan.design[d.k] = d.v; rerender(); };
ACT.sacts = (d, el) => { UI.sel.plan.design.acts = +el.value; rerender(); };
const submit0 = ACT.submittour;
ACT.submittour = d => { const des = UI.sel.plan && UI.sel.plan.design; submit0(d); const tr = G.pj(d.p).tour; if (tr && des) tr.design = des; };

/* ---------- Legacy: label, projects, wardrobe, card sets, career card ---------- */
const legacy0 = VIEWS.legacy;
VIEWS.legacy = function () {
  const s = S(); let out = '';
  out += card(`<h3>Card sets</h3>${G.cardSets().map(x => `<div class="statrow"><span>${h(x.n)}</span>${bar(x.have, x.of)}<b class="small">${x.have}/${x.of}</b></div>`).join('')}
    <button class="btn ghost sm" data-act="careercard">Save a career card image</button>`);
  const eras = G.allProjects().filter(p => p.type !== 'demos' && G.pj(p.id).released);
  if (eras.length > 1) out += card(`<h3>Wardrobe</h3><p class="small muted">Wear any era's stage look on tour.</p><div class="chips"><button class="chip ${!s.wardrobe ? 'on' : ''}" data-act="wear" data-v="">Current era</button>${eras.map(p => `<button class="chip ${s.wardrobe === p.id ? 'on' : ''}" data-act="wear" data-v="${p.id}">${h(p.short || p.title)}</button>`).join('')}</div>`);
  if (s.flags.free || G.age() >= 30) out += card(`<h3>Your label</h3>${s.labelCo ? `<p class="small"><b>${h(s.labelCo.name)}</b></p>${s.labelCo.artists.map((p, i) => `<div class="logrow"><div class="between"><b>${h(p.n)}</b><span class="small muted">${h(p.sound)} · talent ${p.talent}</span></div><div class="small muted">${p.albums.length} album${p.albums.length === 1 ? '' : 's'} · ${G.fmtN(p.fans)} fans</div>
      <div class="row"><button class="btn ghost sm" data-act="pdev" data-i="${i}" ${G.canSpend(1) ? '' : 'disabled'}>Work with them · 1 (${p.dev}/3)</button><button class="btn sm" data-act="prel" data-i="${i}" ${p.dev >= 3 && (!p.albums.length || s.abs - p.albums[p.albums.length - 1].abs >= 40) ? '' : 'disabled'}>Release their album</button></div></div>`).join('')}
      ${s.labelCo.artists.length < 4 ? `<button class="btn ghost sm" data-act="psign">Sign a new artist ($250K)</button>` : ''}<p class="small faint">Everyone on your label is invented.</p>`
      : `<p class="small muted">Start your own label for $5 million, sign invented young artists and make their records.</p><button class="btn sm" data-act="label" ${s.stats.money >= 5e6 ? '' : 'disabled'}>Start a label</button>`}`);
  if (G.canLegacy()) out += card(`<h3>Legacy projects</h3>${ER.LEGACY_PROJECTS.map(p => `<div class="between small"><span><b>${h(p.n)}</b><br><span class="muted">${h(p.d)}</span></span>${(s.legacy || {})[p.id] ? '<span class="pill ok">Done</span>' : `<button class="btn ghost sm" data-act="legacyp" data-id="${p.id}" ${s.stats.money >= p.cost ? '' : 'disabled'}>${p.cost ? G.fmtM(p.cost) : 'Free'}</button>`}</div>`).join('')}`);
  if (s.flags.retired) out += card(`<h3>The next generation</h3><p class="small muted">Pass the torch: start a new, fully invented career as your protégé, in this save slot.</p><button class="btn sm" data-act="nextgen">Pass the torch</button>`);
  return out + legacy0();
};
ACT.wear = d => { S().wardrobe = d.v || null; toast(d.v ? 'Wardrobe set for tour.' : 'Back to the current era.'); rerender(); };
ACT.label = () => { const l = G.startLabel(); toast(l ? `${l.name} is open.` : 'You need $5 million.'); rerender(); };
ACT.psign = () => { const p = G.signProtege(); toast(p ? `Signed ${p.n}.` : 'Your roster is full.'); rerender(); };
ACT.pdev = d => { if (!G.canSpend(1)) return toast('No blocks left.'); S().week.used++; G.developProtege(+d.i); rerender(); };
ACT.prel = d => { const r = G.releaseProtege(+d.i); if (r) toast(`${r.t}: ${G.fmtN(r.fw)} first week.`); rerender(); };
ACT.legacyp = d => { const p = G.doLegacy(d.id); if (p) toast(`${p.n}: done.`); rerender(); };
ACT.nextgen = () => { if (!confirm('Start a new invented career in this slot? This save will be replaced. Export a backup first if you want to keep it.')) return; G.nextGeneration(); UI.tab = 'week'; rerender(); };
ACT.careercard = () => {
  const s = S(), A = G.art(), c = G.careerSummary(), e = G.currentEra() || {}, cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 1350); gr.addColorStop(0, e.color || '#2f8f7c'); gr.addColorStop(1, '#14111c'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = '#ffffff'; g.font = '700 84px Georgia, serif'; g.fillText(A.name, 80, 200); g.font = '36px sans-serif'; g.fillText(`The Eras Life · ${ER.yw(s.abs).y}`, 80, 260);
  const rows = [['Albums', c.eras], ['Units', G.fmtN(c.units)], ['No. 1 singles', c.no1], ['Awards', c.awards], ['Shows', G.fmtN(c.shows)], ['Tour gross', G.fmtM(c.gross)], ['Fans', G.fmtN(c.fans)], ['Canon Score', c.canon]];
  rows.forEach(([k, v], i) => { const x = 80 + (i % 2) * 480, y = 420 + Math.floor(i / 2) * 200; g.font = '700 72px sans-serif'; g.fillText(String(v), x, y); g.font = '32px sans-serif'; g.fillStyle = '#e8e0f0'; g.fillText(k, x, y + 50); g.fillStyle = '#ffffff'; });
  g.font = '28px sans-serif'; g.fillStyle = '#d8d0e8'; g.fillText('An unofficial fan game. Figures are in-game.', 80, 1270);
  const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = `eras-life-career-${A.id}.png`; document.body.appendChild(a); a.click(); a.remove(); toast('Career card saved.');
};

/* ---------- Undo the last task ---------- */
const do0 = ACT.do;
ACT.do = (d, el) => { UI.undoSnap = { json:JSON.stringify(S()), abs:S().abs }; return do0(d, el); };
ACT.undo = () => { const u = UI.undoSnap; if (!u || u.abs !== S().abs) return; const s = JSON.parse(u.json); G.set(s); UI.undoSnap = null; closeModals(); toast('Undone.'); rerender(); };
const adv0 = ACT.advance; ACT.advance = () => { UI.undoSnap = null; return adv0(); };

/* ---------- New game: a seed for repeatable runs ---------- */
const begin0 = ACT.begin, pro0 = ACT.pro;
function seedAfter() { const seed = (UI.newg && UI.newg.seed || '').trim(); if (seed && S()) { S().seed = seed; G.useSeed(seed); } }
ACT.begin = d => { const r = begin0(d); seedAfter(); return r; };
ACT.pro = d => { const r = pro0(d); if (S() && UI.newg && UI.newg.pro.length >= G.art().prologue.length) seedAfter(); return r; };
ACT.seedset = (d, el) => { UI.newg.seed = el.value; };

/* ---------- Accessibility and settings ---------- */
UI.prefs.contrast = UI.prefs.contrast || false; UI.prefs.motion = UI.prefs.motion != null ? UI.prefs.motion : !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function applyA11y() { document.documentElement.classList.toggle('hi-contrast', !!UI.prefs.contrast); T3.reduced = !UI.prefs.motion; }
applyA11y();
ACT.a11y = d => { UI.prefs[d.k] = d.v === '1'; try { localStorage.setItem('eras-settings', JSON.stringify(UI.prefs)); } catch (e) {} applyA11y(); ACT.settings(); };

/* ---------- Search ---------- */
document.addEventListener('input', e => { if (e.target.id !== 'q-search') return; UI.q = e.target.value.toLowerCase(); filterNow(); });
function filterNow() { const q = (UI.q || '').trim(); document.querySelectorAll('#main .logrow, #main .song').forEach(el => { el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }

/* ---------- Decorating the page after each render ---------- */
const TIPS = { songbook:'Write the songs of the current era here.', studio:'Record tracks and finish albums.', rollout:'Plan singles, videos and sponsors.', cover:'Design an original cover for every album.',
  tour:'Plan tours and see every night.', inbox:'Messages and assignments from your team.', eggs:'Hide clues for fans to decode.', fandom:'Your fans, their theories and the fan map.', press:'Interviews, your team and the people in your story.', charts:'The weekly charts and your awards.', legacy:'Your career, cards, wardrobe and more.' };
let pending = false;
function decorate() {
  pending = false; const s = S();
  // Search boxes on the Life and Songbook tabs.
  if (s && (UI.tab === 'life' || UI.tab === 'songbook') && !$('#q-search') && $('#main')) { const box = document.createElement('div'); box.className = 'card'; box.innerHTML = `<input id="q-search" placeholder="Search" value="${h(UI.q || '')}" aria-label="Search this tab" style="width:100%;background:var(--raised);border:1px solid var(--rule);border-radius:10px;padding:8px 10px">`; $('#main').prepend(box); filterNow(); }
  // Badges: required tasks left this week.
  if (s && $('.tab[data-v="week"]') && !$('.tab[data-v="week"] .badge')) { const n = G.requiredLeft().length; if (n) $('.tab[data-v="week"]').insertAdjacentHTML('beforeend', `<i class="badge">${n}</i>`); }
  // Undo button for the last task this week.
  if (s && UI.tab === 'week' && UI.undoSnap && UI.undoSnap.abs === s.abs && !$('#undo-btn') && !$('.modal')) { const a = $('.actions'); if (a) a.insertAdjacentHTML('afterend', '<div class="row" style="margin:0 16px"><button id="undo-btn" class="btn ghost sm" data-act="undo">Undo the last task</button></div>'); }
  // Tips the first time each tab unlocks.
  if (s && !$('.modal')) { s.seenTabs = s.seenTabs || {}; Object.keys(TIPS).forEach(k => { if (G.unlocked(k) && !s.seenTabs[k]) { s.seenTabs[k] = 1; if (s.abs > G.art().startAbs + 1) toast(`New tab: ${k === 'cover' ? 'Cover Studio' : k[0].toUpperCase() + k.slice(1)}. ${TIPS[k]}`); } }); }
  // Settings: accessibility options.
  const set = $('.modal [data-act=pref][data-k=text]'); if (set && !$('#a11y-opts')) set.closest('.chips').insertAdjacentHTML('afterend', `<div id="a11y-opts"><h3>High contrast</h3><div class="chips"><button class="chip ${!UI.prefs.contrast ? 'on' : ''}" data-act="a11y" data-k="contrast" data-v="0">Off</button><button class="chip ${UI.prefs.contrast ? 'on' : ''}" data-act="a11y" data-k="contrast" data-v="1">On</button></div>
    <h3>Motion</h3><div class="chips"><button class="chip ${UI.prefs.motion ? 'on' : ''}" data-act="a11y" data-k="motion" data-v="1">Animated</button><button class="chip ${!UI.prefs.motion ? 'on' : ''}" data-act="a11y" data-k="motion" data-v="0">Reduced</button></div></div>`);
  // New game: a seed.
  const begin = document.querySelector('[data-act=begin]'); if (begin && UI.newg && !$('#seed-in')) begin.insertAdjacentHTML('beforebegin', `<section class="card"><h2>Seed (optional)</h2><p class="small muted">Type any word. The same seed gives the same random events from the start of a session, so friends can play the same run.</p><input id="seed-in" data-act="seedset" value="${h(UI.newg.seed || '')}" placeholder="For example: midnights" style="width:100%;background:var(--raised);border:1px solid var(--rule);border-radius:10px;padding:8px 10px"></section>`);
  // Next-era pitch: your own colours and song titles.
  const sb = $('.modal [data-act=startera]'); if (sb && !$('#ne-custom') && UI.sel.ne) { const th = ER.ERA_THEMES.find(t => t.id === UI.sel.ne.theme);
    sb.insertAdjacentHTML('beforebegin', `<div id="ne-custom"><h3>Era colours</h3><div class="chips">${th.pals.map((p, i) => `<button class="chip ${(UI.sel.ne.pal || 0) === i ? 'on' : ''}" data-act="nepal" data-i="${i}"><i class="dot" style="background:${p[0]}"></i><i class="dot" style="background:${p[1]}"></i></button>`).join('')}</div>
      <label class="field"><span>Your own song titles (optional, separated by commas)</span><input id="ne-titles" value="${h(UI.sel.ne.titles || '')}" placeholder="Titles only"></label></div>`); }
  // Retirement screen: pass the torch.
  const tt = $('.modal [data-act=totitle]'); if (tt && s && s.flags.retired && !$('#torch-btn')) tt.insertAdjacentHTML('beforebegin', '<button id="torch-btn" class="btn ghost" data-act="nextgen">Pass the torch to a protégé</button>');
  // Title screen: the last two weeks of daily challenges.
  const dc = document.querySelector('[data-act=daily]'); if (dc && !$('#daily-hist')) { let best = {}; try { best = JSON.parse(localStorage.getItem('eras-daily-best') || '{}'); } catch (e) {}
    const days = Array.from({ length:14 }, (_, i) => { const x = new Date(Date.now() - (13 - i) * 864e5); return best[`${x.getUTCFullYear()}-${x.getUTCMonth() + 1}-${x.getUTCDate()}`]; });
    dc.closest('.row').insertAdjacentHTML('afterend', `<div id="daily-hist" class="row small" aria-label="Last 14 days">${days.map(w => `<span title="${w ? 'Won' : 'Not won'}">${w ? '🟩' : '⬜'}</span>`).join('')}</div>`); }
}
ACT.nepal = d => { UI.sel.ne.pal = +d.i; document.querySelectorAll('.modal [data-act=nepal]').forEach(b => b.classList.toggle('on', b.dataset.i === d.i)); };
document.addEventListener('input', e => { if (e.target.id === 'ne-titles' && UI.sel.ne) UI.sel.ne.titles = e.target.value; });
const startera0 = ACT.startera;
ACT.startera = d => { const ne = UI.sel.ne; if (!ne) return startera0(d); const own = ((document.querySelector('#ne-own') || {}).value || '').trim();
  const titles = (ne.titles || '').split(',').map(x => x.trim()).filter(Boolean);
  const p = G.newEra(own || ne.title, ne.n, ne.weeks, ne.tour, ne.theme, { pal:ne.pal || 0, titles });
  S().modal = S().modal.filter(m => m.k !== 'nextera'); UI.sel.ne = null; closeModals(); toast(`Era ${p.eraNo}: ${p.title} begins.`); UI.tab = 'week'; rerender(); };
new MutationObserver(() => { if (!pending) { pending = true; requestAnimationFrame(decorate); } }).observe(document.body, { childList:true, subtree:true });
})();
