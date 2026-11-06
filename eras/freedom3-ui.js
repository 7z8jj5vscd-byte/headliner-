/* The Eras Life: albums, touring and life (interface). */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, VIEWS, ACT, toast } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();
const inp = (id, ph, v) => `<input id="${id}" value="${h(v || '')}" placeholder="${h(ph)}" maxlength="40" style="width:100%;background:var(--raised);border:1px solid var(--rule);border-radius:10px;padding:8px 10px">`;

/* ---------- Songbook: versions ---------- */
function versionsCard() {
  const s = S(), rel = Object.keys(s.songs).filter(t => s.songs[t].st === 'released' && !s.songs[t].version && !s.songs[t].tv).slice(-20).reverse(); if (!rel.length) return '';
  const t = UI.sel.vt && rel.includes(UI.sel.vt) ? UI.sel.vt : rel[0];
  return card(`<h2>New versions</h2><p class="small muted">Give a released song a second life: acoustic, remix, live and more.</p>
    <label class="field"><span>Song</span><select data-act="vtsel">${rel.map(x => `<option ${x === t ? 'selected' : ''}>${h(x)}</option>`).join('')}</select></label>
    <div class="chips">${G.VERSIONS.map(v => `<button class="chip" data-act="mkver" data-k="${v.id}" ${G.canVersion(t, v.id) && G.canSpend(1) ? '' : 'disabled'}>${h(v.n)} · 1</button>`).join('')}</div>`);
}
ACT.vtsel = (d, el) => { UI.sel.vt = el.value; render(); };
ACT.mkver = d => { const rel = Object.keys(S().songs).filter(t => S().songs[t].st === 'released' && !S().songs[t].version && !S().songs[t].tv).slice(-20).reverse(); const t = UI.sel.vt && rel.includes(UI.sel.vt) ? UI.sel.vt : rel[0];
  const r = G.makeVersion(t, d.k); if (r.err) return toast(r.err); render(); toast(r.msg); };
const sb0 = VIEWS.songbook;
VIEWS.songbook = function () { return sb0() + versionsCard(); };

/* ---------- Studio: side projects ---------- */
function sideCard() {
  const s = S(); if (s.flags.retired || G.age() < 14) return '';
  const cur = (s.custom || []).find(p => p.side && !(s.pj[p.id] && s.pj[p.id].released));
  return card(`<h2>Side projects</h2><p class="small muted">Make something on the side, alongside your main eras: an EP, a holiday album, a soundtrack or covers. All songs are invented.</p>
    ${cur ? `<p class="small">Now: <b>${h(cur.title)}</b>, out ${h(G.fmtDate(G.win(cur).rel))}.</p>` : `<label class="field"><span>Title (optional)</span>${inp('side-t', 'Leave empty for a suggestion')}</label>
    <div class="stack tight">${G.SIDE.map(k => `<button class="choice" data-act="side" data-k="${k.id}">${h(k.n)}<div class="small muted">${h(k.d)} ${k.songs} songs, about ${k.weeks} weeks.</div></button>`).join('')}</div>`}`);
}
ACT.side = d => { const r = G.startSide(d.k, ($('#side-t') || {}).value || ''); if (r.err) return toast(r.err); render(); toast(`${r.p.title} begins. Write it in the Songbook.`); };
const st0 = VIEWS.studio;
VIEWS.studio = function () { return st0() + sideCard(); };

/* ---------- Tour Desk: route, legs, setlist, bookings ---------- */
function routeCard(plan) {
  const reg = UI.sel.rreg || 'North America', route = plan.route || [];
  const n = c => (route.find(x => x.c === c) || { n:0 }).n;
  return card(`<div class="between"><h2>Route</h2>${pill(`${G.routeNights(route)} nights`)}</div><p class="small muted">Build the tour city by city. The plan below follows your route. Leave it empty to let the manager route it.</p>
    <div class="chips">${Object.keys(ER.CITIES).map(r => `<button class="chip ${r === reg ? 'on' : ''}" data-act="rreg" data-v="${h(r)}">${h(r)}</button>`).join('')}</div>
    <div class="cities">${ER.CITIES[reg].map(c => `<div class="city"><span>${h(c)}</span><span class="row"><button class="btn ghost sm" data-act="rt" data-c="${h(c)}" data-d="-1" ${n(c) ? '' : 'disabled'} aria-label="One night fewer in ${h(c)}">−</button><b>${n(c)}</b><button class="btn ghost sm" data-act="rt" data-c="${h(c)}" data-d="1" aria-label="One more night in ${h(c)}">+</button></span></div>`).join('')}</div>
    ${route.length ? `<p class="small">Order: ${route.map(x => `${h(x.c)} ×${x.n}`).join(' → ')}</p><button class="btn ghost sm" data-act="rtclear">Clear the route</button>` : ''}`);
}
ACT.rreg = d => { UI.sel.rreg = d.v; render(); };
ACT.rt = d => { const plan = UI.sel.plan; if (!plan) return; const route = (plan.route || []).map(x => Object.assign({}, x)); let x = route.find(r => r.c === d.c);
  if (!x) { x = { c:d.c, n:0 }; route.push(x); } x.n = Math.max(0, Math.min(20, x.n + +d.d)); G.setRoute(plan, route); render(); };
ACT.rtclear = () => { if (UI.sel.plan) { UI.sel.plan.route = []; } render(); };
function liveTourCard(p) {
  const pj = G.pj(p.id), tr = pj.tour, cat = G.catalog();
  return card(`<h2>${h(tr.name)}: on the road</h2><p class="small muted">Change the tour while it runs.</p>
    <h3>Add a leg</h3><div class="chips">${Object.keys(ER.CITIES).map(r => `<button class="chip" data-act="leg" data-p="${p.id}" data-r="${h(r)}">${h(r)} · 4 weeks</button>`).join('')}</div>
    <button class="btn ghost sm" data-act="cutleg" data-p="${p.id}">Cancel 4 weeks of shows</button>
    <h3>Setlist (${(tr.setlist || []).length})</h3><div class="chips setl">${cat.map(t => `<button class="chip ${(tr.setlist || []).includes(t) ? 'on' : ''}" data-act="live-set" data-p="${p.id}" data-v="${h(t)}">${h(t)}</button>`).join('')}</div>`);
}
ACT.leg = d => { const r = G.addLeg(d.p, d.r, 4); if (r.err) return toast(r.err); render(); toast(r.msg); };
ACT.cutleg = d => { const r = G.cutLeg(d.p, 4); if (r.err) return toast(r.err); render(); toast(r.msg); };
ACT['live-set'] = d => { G.setSetlist(d.p, d.v); render(); };
function bookCard() {
  const s = S(); if (s.flags.retired || G.age() < 14) return '';
  const city = UI.sel.bcity || ER.CITIES['North America'][1], all = [].concat(...Object.values(ER.CITIES));
  return card(`<h2>Book your own shows</h2><p class="small muted">Shows outside your tours. They need you on the night, so they become required tasks that week.</p>
    <label class="field"><span>City</span><select data-act="bcity">${all.map(c => `<option ${c === city ? 'selected' : ''}>${h(c)}</option>`).join('')}</select></label>
    <div class="stack tight">${G.BOOK.map(k => `<button class="choice" data-act="book" data-k="${k.id}" ${G.canBook(k) ? '' : 'disabled'}>${h(k.n)}<div class="small muted">${h(k.d)} In ${k.lead} weeks.${S().stats.fans < k.minFans ? ` Needs ${G.fmtN(k.minFans)} fans.` : ''}</div></button>`).join('')}</div>
    ${(s.bookings || []).length ? `<h3>Booked</h3>${s.bookings.map(b => `<div class="between small"><span>${h(G.BOOK.find(k => k.id === b.kind).n)}, ${h(b.city)}</span><span class="muted">${h(G.fmtDate(b.at))}</span></div>`).join('')}` : ''}`);
}
ACT.bcity = (d, el) => { UI.sel.bcity = el.value; };
ACT.book = d => { const r = G.book(d.k, UI.sel.bcity || ER.CITIES['North America'][1]); if (r.err) return toast(r.err); render(); toast(r.msg); };
const tour0 = VIEWS.tour;
VIEWS.tour = function () {
  const s = S(); let html = tour0(), pre = '';
  const plan = UI.sel.plan, pp = plan && G.proj(plan.pid);
  if (pp && !(G.pj(pp.id).tour && G.pj(pp.id).tour.approved) && ['finish','pre','release','promo','tourprep'].includes(G.stageOf(pp, s.abs)) && pp.tour.kind !== 'opening') pre += routeCard(plan);
  G.allProjects().filter(p => p.tour && G.pj(p.id).tour && G.pj(p.id).tour.approved && ['tourprep','tour'].includes(G.stageOf(p, s.abs))).forEach(p => { pre += liveTourCard(p); });
  return pre + html + (G.active().some(x => x.st === 'tour') ? '' : bookCard());
};

/* ---------- Life: free time, image, business ---------- */
function lifeCards() {
  const s = S(); if (s.flags.retired) return '';
  const im = G.image(), brands = s.brands || [];
  const ft = G.tasks().filter(t => t.kind === 'freetime');
  return card(`<h2>Free time</h2><p class="small muted">Time away gives you Energy and new things to write about. The idea shows up in your next writing session.</p>
    ${ft.map(t => `<div class="task"><div class="tl"><b>${h(t.l)}</b><div class="small muted">${h(t.desc)}</div></div>${G.taskDone(t.id) ? pill('Done', 'ok') : `<button class="btn sm" data-act="do" data-id="${h(t.id)}" ${G.canSpend(t.cost) ? '' : 'disabled'}>${t.cost} block${t.cost > 1 ? 's' : ''}</button>`}</div>`).join('')}
    ${(s.inspo || []).length ? `<p class="small">Ideas waiting: ${G.extraInsp().map(x => h(x.n.replace('From your free time: ', ''))).join(', ')}</p>` : ''}`)
  + card(`<h2>Public image</h2><p class="small muted">How much of yourself you share. It nudges your stats a little every week.</p>
    <h3>With the press</h3><div class="chips">${G.IMAGE.press.map(([k, l]) => `<button class="chip ${im.press === k ? 'on' : ''}" data-act="img" data-k="press" data-v="${k}">${l}</button>`).join('')}</div>
    <h3>On social media</h3><div class="chips">${G.IMAGE.social.map(([k, l]) => `<button class="chip ${im.social === k ? 'on' : ''}" data-act="img" data-k="social" data-v="${k}">${l}</button>`).join('')}</div>`)
  + card(`<h2>Business</h2><p class="small muted">Brands you start are invented and earn a little every week.</p>
    ${brands.map(b => `<div class="between small"><span><b>${h(b.name)}</b> · ${h(G.BRANDS.find(x => x.id === b.kind).n)}</span><span class="muted">Since ${ER.yw(b.abs).y}</span></div>`).join('')}
    ${G.age() >= 18 ? `<label class="field"><span>Brand name</span>${inp('br-n', 'Your own name for it')}</label><label class="field"><span>Kind</span><select id="br-k">${G.BRANDS.map(b => `<option value="${b.id}">${h(b.n)}</option>`).join('')}</select></label>
    <button class="btn sm" data-act="brand">Launch it · ${G.fmtM(Math.round(G.payScale() * 2))}</button>` : '<p class="small faint">Brands open at 18.</p>'}
    <h3>Your masters</h3><p class="small">You own <b>${Math.round(s.stats.own)}</b> of 100.</p>${G.canBuyMasters() ? `<button class="btn ghost sm" data-act="masters">Buy them back · ${G.fmtM(G.mastersPrice())}</button>` : `<p class="small faint">${s.mode === 'story' && G.frMode() !== 'sandbox' ? 'In Canon and Guided, the real story of the masters plays out. Sandbox lets you buy them.' : 'Release some music first.'}</p>`}`);
}
ACT.img = d => { G.image()[d.k] = d.v; render(); };
ACT.brand = () => { const r = G.launchBrand(($('#br-k') || {}).value, ($('#br-n') || {}).value); if (r.err) return toast(r.err); render(); toast(r.msg); };
ACT.masters = () => { const r = G.buyMasters(); if (r.err) return toast(r.err); render(); toast(r.msg); };
const life0 = VIEWS.life;
VIEWS.life = function () { const html = life0(), extra = lifeCards(), i = html.indexOf('<section class="card"', 10); return i < 0 ? html + extra : html.slice(0, i) + extra + html.slice(i); };

/* ---------- This Week: what next, between eras ---------- */
function nextCard() {
  if (!G.betweenEras() || S().mode !== 'story' && !S().flags.free) return '';
  return card(`<h2>What next?</h2><p class="small muted">Nothing is being made right now. Your move.</p><div class="stack tight">
    ${G.frMode() === 'sandbox' ? '<button class="choice" data-act="earlynext">Start the next real era now<div class="small muted">Sandbox: writing starts this week.</div></button>' : ''}
    <button class="choice" data-act="tab" data-v="studio">Make a side project<div class="small muted">An EP, a holiday album, a soundtrack or covers.</div></button>
    <button class="choice" data-act="tab" data-v="tour">Book some shows<div class="small muted">A one-off night, a festival or a residency.</div></button>
    <button class="choice" data-act="do" data-id="notebook">Write a song of your own<div class="small muted">For whatever comes next.</div></button>
    <button class="choice" data-act="tab" data-v="life">Have a life<div class="small muted">Free time, brands and your public image.</div></button></div>`);
}
ACT.earlynext = () => { const r = G.startNextEarly(); if (r.err) return toast(r.err); render(); toast(r.msg); };
const week0 = VIEWS.week;
VIEWS.week = function () { const html = week0(), nc = nextCard(); if (!nc) return html; const i = html.indexOf('<div class="actions">'); return i < 0 ? html + nc : html.slice(0, i) + nc + html.slice(i); };
})();
