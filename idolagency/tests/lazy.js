// A careless CEO: signs trainees, never releases music, never books anything. Checks how long the agency survives.
require('../data.js'); require('../engine.js'); require('../more.js');
const KA = globalThis.KA;
for (const diff of ['easy', 'normal', 'hard']) {
  const S = KA.newGame({ diff });
  for (let w = 0; w < 48 * 6 && !S.over; w++) {
    if (KA.trainees(S).length < 7) { const r = KA.scout(S, 'open', 'any'); if (r.ok) r.list.forEach(i => KA.sign(S, i.id)); }
    for (const id of ['practice', 'vocal', 'studio', 'stylist']) { const c = KA.roomCost(S, id); if (c != null && S.money > c) KA.upgradeRoom(S, id); }
    KA.endWeek(S); S.q.length = 0;
  }
  console.log('careless', diff, S.over ? 'bankrupt in week ' + S.week + ' (Y' + KA.year(S) + ')' : 'survived 6 years', KA.won(S.money), 'rescue used:', S.flags.rescueAt != null);
}

// A normal beginner: signs five trainees once, upgrades only with spare cash, books nothing.
for (const diff of ['easy', 'normal', 'hard']) {
  const S = KA.newGame({ diff });
  for (let w = 0; w < 48 * 6 && !S.over; w++) {
    if (w === 0) for (let k = 0; k < 2; k++) { S.flags.scoutWeek = -1; const r = KA.scout(S, 'open', 'any'); if (r.ok) r.list.slice(0, 3).forEach(i => KA.sign(S, i.id)); }
    for (const id of ['practice', 'vocal']) { const c = KA.roomCost(S, id); if (c != null && S.money > c * 3) KA.upgradeRoom(S, id); }
    for (const m of S.mail.slice()) if (m.kind === 'gift') KA.mailAct(S, m.id, true);
    KA.endWeek(S); S.q.length = 0;
  }
  console.log('beginner', diff, S.over ? 'bankrupt in week ' + S.week : 'survived 6 years', KA.won(S.money));
}
