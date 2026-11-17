// Headless simulation: an automatic CEO plays whole careers to catch crashes and check balance.
// Usage: node tests/sim.js [runs] [years]
require('../data.js'); require('../engine.js'); require('../more.js');
const KA = globalThis.KA, D = globalThis.KD;
const runs = +process.argv[2] || 4, years = +process.argv[3] || 8;
for (let r = 0; r < runs; r++) {
  const S = KA.newGame({ agency: 'Sim' + r, diff: ['easy', 'normal', 'hard'][r % 3] });
  const M = {};
  for (let w = 0; w < years * 48 && !S.over; w++) {
    // scout and sign
    if (KA.trainees(S).length < 5 && S.money > 1e8) { const res = KA.scout(S, S.money > 6e8 && KA.rank(S) >= 1 ? 'academy' : 'open', r % 2 ? 'f' : 'm'); if (res.ok) res.list.sort((a, b) => KA.overall(b) - KA.overall(a)).slice(0, 2).forEach(i => KA.sign(S, i.id)); }
    for (const i of KA.trainees(S)) KA.setPlan(S, i.id, i.cond < 35 ? 'rest' : ['vocal', 'dance', 'balanced', 'visual'][i.id % 4]);
    // upgrades
    for (const id of ['office', 'practice', 'vocal', 'studio', 'stylist', 'mvset', 'dorm', 'gym', 'content']) { const c = KA.roomCost(S, id); if (c != null && S.money > c * 4 + 2e8) KA.upgradeRoom(S, id); }
    for (const id of ['manager', 'producer', 'pr', 'dance', 'vocal']) { const c = KA.staffCost(S, id); if (c != null && S.money > c * 6 + 3e8) KA.hire(S, id); }
    // survival show once
    if (!S.flags.simShow && KA.year(S) === 1 && w === 16) { const ids = KA.trainees(S).filter(i => i.g === (r % 2 ? 'f' : 'm')).slice(0, 3).map(i => i.id); if (ids.length) { const x = KA.joinShow(S, ids); S.flags.simShow = x.ok; } }
    // form a group
    const ready = KA.trainees(S).filter(i => i.weeks >= 20 && !(S.show && S.show.ids.includes(i.id)));
    if (ready.length >= 4 && KA.active(S).length < KA.maxGroups(S)) { const g = KA.formGroup(S, { name: 'G' + r + '-' + S.groups.length, members: ready.slice(0, 5).map(i => i.id), concept: 'crush' }); if (!g.ok) console.log(g.msg); }
    for (const g of KA.active(S)) {
      if (!S.albums.some(a => a.gid === g.id && a.status === 'upcoming') && (!g.promo) && !g.tour && (g.status === 'predebut' || S.week - (g.lastAlb || 0) > 14)) {
        const res = KA.planAlbum(S, g.id, { type: g.status === 'predebut' ? 'single' : 'mini', concept: 'crush', genre: 'dance', producer: S.money > 5e8 ? 'team' : 'free', set: 'neon', story: 'heist', shots: ['wide', 'close', 'oneshot', 'drone', 'cgi', 'fairy'], budget: S.money > 6e8 ? 2 : 1, title: KA.titleIdea() });
        if (res.ok) g.lastAlb = S.week;
      }
      if (g.status === 'active') {
        if (KA.groupCond(S, g) > 55) for (const s of D.SCHEDULES.slice().reverse()) KA.toggleSched(S, g.id, s.id);
        if (!g.content && S.money > 1e8) KA.startContent(S, g.id, KA.fameTier(g.fans) >= 1 ? 'reality' : 'vlog');
        if (!g.tour && KA.fameTier(g.fans) >= 2 && S.money > 5e8 && !g.promo && R() < .1) KA.planTour(S, g.id, ['Seoul', 'Tokyo', 'Bangkok', 'Los Angeles'].map(c => ({ city: c, venue: KA.fameTier(g.fans) >= 4 ? 'dome' : 'arena' })));
      }
    }
    for (const rq of S.reqs.slice()) KA.answerReq(S, rq.id, Math.random() < .7);
    for (const h of S.hate.slice()) { const rs = KA.hateResponses(S, h); if (rs.length) KA.respondHate(S, h.id, rs[0].id); }
    if (S.money < 5e7) KA.takeLoan(S, 'small');
    for (let k = 0; k < 3; k++) KA.claimQuest(S, k); for (const m of S.mail.slice()) KA.mailAct(S, m.id, true);
    for (const g of KA.debuted(S)) { for (const M of D.MERCH) if (S.money > M.cost * 5) KA.launchMerch(S, g.id, M.id); if (S.money > 1e8) KA.launchClub(S, g.id); for (const m of KA.members(S, g)) { const J = D.SOLO.filter(j => KA.soloOK(S, m, j)).pop(); if (J && m.cond > 60) KA.setSolo(S, m.id, J.id); } }
    for (const B of D.BIZ) if (S.money > (KA.bizCost(S, B.id) || 1e99) * 4) KA.buyBiz(S, B.id);
    KA.endWeek(S);
    while (S.q.length) { const it = S.q.shift(); if (it.k === 'event') KA.resolveEvent(S, it, 0); if (it.k === 'award') { const x = KA.runAward(S, it.id, 1); x.res.forEach(c => c.won.length && (M.award = M.award || KA.year(S))); } if (it.k === 'renew') KA.renew(S, it.gid, true); }
    const g0 = S.groups[0]; if (g0 && S.week % 48 === 0) (M.traj = M.traj || []).push(KA.num(g0.fans) + "/" + KA.won(S.money));
    if (g0 && g0.status === 'active') { M.debut = M.debut || KA.date(S); M.dfans = M.dfans || KA.num(g0.fans); if (g0.wins) M.win = M.win || KA.date(S); const t = KA.fameTier(g0.fans); M.tier = Math.max(M.tier || 0, t); }
    if (S.chart[0] && S.chart[0].us) M.no1 = M.no1 || KA.date(S);
    if (!isFinite(S.money) || Object.values(S.idols).some(i => Object.values(i.stats).some(v => !isFinite(v))) || S.groups.some(g => !isFinite(g.fans))) throw new Error('NaN at week ' + S.week);
  }
  console.log(JSON.stringify({ traj: M.traj, run: r, diff: S.diff, over: S.over || null, money: KA.won(S.money), rank: D.RANKS[KA.rank(S)].n, groups: S.groups.map(g => `${g.name}:${KA.num(g.fans)}:${g.wins}w`), awards: S.awards.length, ach: Object.keys(S.ach).length, M }));
}
function R() { return Math.random(); }
