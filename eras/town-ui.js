/* The Eras Life: the Town tab. Gigs, busking, the weekly board, levels and perks, and shops. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, bar, modal, closeModals, mount3D, VIEWS, ACT, toast } = UI;
const S = () => G.S(), rerender = () => UI.render();
const SET = { openmic:'writers', bar:'writers', club:'theater', theater:'theater', arena:'arena', stadium:'stadium' };

VIEWS.town = function () {
  const s = S(), lock = G.world('lockdown'), board = G.board(), done = s.boardWeek.done;
  const lvl = G.lvl(), need = G.xpNeed(lvl);
  const head = card(`<h2>Town</h2><p class="small muted">Do what you like with your week. Gig anywhere you can fill, take side gigs, shop and level up. The real story still happens on its dates.</p>
    <div class="statrow"><span>Level ${lvl}</span>${bar(s.xp || 0, need)}<b class="small">${Math.round(s.xp || 0)}/${need}</b></div>
    ${s.perkPts ? `<p class="small spot"><b>${s.perkPts} perk point${s.perkPts > 1 ? 's' : ''} to spend.</b></p>` : ''}
    <p class="small muted">${s.week.used} of ${G.blocks()} Time Blocks used · Energy ${Math.round(s.stats.energy)} · ${G.fmtM(s.stats.money)}</p>`);
  const gigs = card(`<h3>Book a gig</h3>${lock ? '<p class="small muted">Live music is shut down by the pandemic.</p>' : ''}${ER.VENUES.map(v => { const ok = G.canGig(v); return `<div class="between small"><span><b>${h(v.n)}</b><br><span class="muted">${v.cap.toLocaleString()} capacity${v.min ? ` · needs ${G.fmtN(v.min)} fans` : ''} · ${v.cost} block${v.cost > 1 ? 's' : ''}</span></span><button class="btn sm" data-act="gig" data-id="${v.id}" ${ok && G.canSpend(v.cost) ? '' : 'disabled'}>Play</button></div>`; }).join('')}
    <div class="between small" style="margin-top:6px"><span><b>Busk on a street corner</b><br><span class="muted">${s.stats.fans > 1e6 ? 'A surprise busk would go viral' : 'Tips and a few new fans'} · 1 block</span></span><button class="btn ghost sm" data-act="busk" ${!lock && G.canSpend(1) ? '' : 'disabled'}>Busk</button></div>`);
  const wk = card(`<h3>This week in town</h3><p class="small muted">Five things on offer this week. A new list every week.</p>${board.map(b => `<div class="between small"><span><b>${h(b.n)}</b><br><span class="muted">${b.cost} block${b.cost > 1 ? 's' : ''} · ${h(G.fxText(Object.assign({ energy:b.energy }, b.fx)))}${b.pay > 0 ? ` · pays ${G.fmtM(b.pay)}` : b.pay < 0 ? ` · costs ${G.fmtM(-b.pay)}` : ''}</span></span>${done.includes(b.id) ? '<span class="pill ok">Done</span>' : `<button class="btn ghost sm" data-act="board" data-id="${b.id}" ${G.canSpend(b.cost) ? '' : 'disabled'}>Do it</button>`}</div>`).join('')}`);
  const perks = card(`<h3>Perks</h3>${ER.PERKS.map(p => `<div class="between small"><span><b>${h(p.n)}</b> <span class="muted">${h(p.d)}</span></span>${G.hasPerk(p.id) ? '<span class="pill ok">Yours</span>' : `<button class="btn ghost sm" data-act="perk" data-id="${p.id}" ${s.perkPts ? '' : 'disabled'}>Take</button>`}</div>`).join('')}`);
  const cur = ER.STUDIOS.findIndex(x => x.id === (s.studio || 'home'));
  const shop = card(`<h3>Studio</h3>${ER.STUDIOS.map((st, i) => `<div class="between small"><span>${h(st.n)}${st.bonus ? ` <span class="muted">(+${st.bonus} recording)</span>` : ''}</span>${i <= cur ? '<span class="pill ok">Have</span>' : `<button class="btn ghost sm" data-act="studiobuy" data-id="${st.id}" ${s.stats.money >= st.price ? '' : 'disabled'}>${G.fmtM(st.price)}</button>`}</div>`).join('')}
    <h3>Gear</h3>${ER.GEAR.map(g => `<div class="between small"><span>${h(g.n)}</span>${(s.gear || []).includes(g.id) ? '<span class="pill ok">Have</span>' : `<button class="btn ghost sm" data-act="gearbuy" data-id="${g.id}" ${s.stats.money >= g.price ? '' : 'disabled'}>${G.fmtM(g.price)}</button>`}</div>`).join('')}
    <h3>Specialists</h3>${ER.SPECIALISTS.map(x => `<div class="between small"><span>${h(x.n)} <span class="muted">${h(x.d)} ${G.fmtM(x.wage)} a week.</span></span><button class="btn ${(s.specialists || []).includes(x.id) ? '' : 'ghost'} sm" data-act="hire" data-id="${x.id}">${(s.specialists || []).includes(x.id) ? 'Let go' : 'Hire'}</button></div>`).join('')}
    <h3>Homes</h3>${ER.HOMES.map(x => `<div class="between small"><span>${h(x.n)} <span class="muted">+${x.energy} energy a week</span></span>${(s.homes || []).includes(x.id) ? '<span class="pill ok">Yours</span>' : `<button class="btn ghost sm" data-act="homebuy" data-id="${x.id}" ${s.stats.money >= x.price ? '' : 'disabled'}>${G.fmtM(x.price)}</button>`}</div>`).join('')}
    <p class="small faint">All venues, studios, brands and specialists here are invented.</p>`);
  return head + gigs + wk + perks + shop;
};
function gigResult(r) {
  closeModals(); const era = G.currentEra();
  modal(`<span class="eyebrow">${h(G.fmtDate(S().abs))}</span><h2>${h(r.v.n)}</h2><div class="stage3d short" id="t3gig"></div>
    <div class="review">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div><p class="small">${r.tix.toLocaleString()} people (${Math.round(r.fill * 100)}% full) · ${G.fmtM(r.pay)} for you.</p><button class="btn big" data-act="closem">Back to town</button>`);
  mount3D('#t3gig', { set:SET[r.v.id], color:(era || {}).color, figs:[{ look:UI.lookFor('tour', era), anim:r.stars >= 4 ? 'sing' : 'strum', mic:true }] }, 'gig');
  if (window.SND) SND.crowd(3, r.stars >= 4);
}
ACT.gig = d => { const r = G.playGig(d.id); if (r.err) return toast(r.err); rerender(); gigResult(r); };
ACT.busk = () => { const r = G.busk(); if (r.err) return toast(r.err); toast(`${r.msg} ${G.fmtM(r.tips)} in tips.`); rerender(); };
ACT.board = d => { const r = G.doBoard(d.id); if (r.err) return toast(r.err); toast(`${r.b.n}: done.`); rerender(); };
ACT.perk = d => { if (G.takePerk(d.id)) toast('Perk unlocked.'); rerender(); };
ACT.studiobuy = d => { toast(G.buyStudio(d.id) ? 'Your new studio is ready.' : 'Not enough money.'); rerender(); };
ACT.gearbuy = d => { toast(G.buyGear(d.id) ? 'Bought.' : 'Not enough money.'); rerender(); };
ACT.homebuy = d => { toast(G.buyHome(d.id) ? 'Welcome home.' : 'Not enough money.'); rerender(); };
ACT.hire = d => { const on = G.hire(d.id); toast(on ? 'Hired.' : 'Let go.'); rerender(); };
})();
