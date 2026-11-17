// K-Pop Idol Agency: game rules. No DOM here, so tests/sim.js can run it in Node.
(function (root) {
const D = root.KD;
const KA = root.KA = { VERSION: 1, WPY: 48 };

// ------------------------------------------------------------------ helpers
const R = Math.random;
const ri = (a, b) => Math.floor(a + R() * (b - a + 1));
const rf = (a, b) => a + R() * (b - a);
const pick = a => a[Math.floor(R() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const uid = S => (S.nid = (S.nid || 0) + 1);
KA.h = { ri, rf, pick, clamp, avg };

KA.year = S => Math.floor(S.week / KA.WPY) + 1;
KA.month = S => Math.floor((S.week % KA.WPY) / 4) + 1;
KA.wk = S => S.week % 4 + 1;
KA.woy = S => S.week % KA.WPY + 1; // week of year, 1..48
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
KA.date = S => `Y${KA.year(S)} · ${MON[KA.month(S) - 1]} wk ${KA.wk(S)}`;
KA.won = v => { const s = v < 0 ? '-' : ''; v = Math.abs(v); return s + '₩' + (v >= 1e12 ? (v / 1e12).toFixed(2) + 'T' : v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'K' : Math.round(v)); };
KA.num = v => v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : String(Math.round(v));

function log(S, t, ic = '•') { S.log.unshift({ w: S.week, t, ic }); S.log.length = Math.min(S.log.length, 150); }
KA.log = log;
function q(S, item) { S.q.push(item); }
KA.idol = (S, id) => S.idols[id];
KA.group = (S, id) => S.groups.find(g => g.id === id);
KA.members = (S, g) => g.members.map(id => S.idols[id]).filter(Boolean);
KA.trainees = S => Object.values(S.idols).filter(i => i.status === 'trainee');
KA.active = S => S.groups.filter(g => g.status !== 'disbanded');
KA.debuted = S => S.groups.filter(g => g.status === 'active');
KA.fameTier = fans => { let t = 0; D.FAME.forEach((f, i) => { if (fans >= f.need) t = i; }); return t; };
KA.rank = S => { const f = S.groups.reduce((s, g) => s + g.fans, 0) + S.rep * 1000; let t = 0; D.RANKS.forEach((r, i) => { if (f >= r.need) t = i; }); return t; };
KA.maxGroups = S => 1 + Math.floor(S.rooms.office / 2);
KA.maxTrainees = S => 4 + S.rooms.office * 3;
// New fans get harder to win as a group gets huge.
KA.damp = (g, x) => Math.round(x * 3e6 / (3e6 + g.fans));
KA.overall = i => Math.round((i.stats.vocal + i.stats.dance + i.stats.rap * .6 + i.stats.visual + i.stats.variety * .7 + i.stats.stamina * .5) / 4.8);

// ------------------------------------------------------------------ people
KA.randomLook = function (g) {
  return { g, skin: ri(0, 3), hair: ri(0, 7), hairC: R() < .6 ? ri(0, 3) : ri(0, D.HAIR_C.length - 1), top: pick(['tee', 'hoodie', 'tee', 'street']), topC: ri(0, D.OUT_C.length - 1), botC: pick([2, 1, 8, 9]), acc: R() < .3 ? ri(1, 7) : 0, eye: ri(0, 2) };
};
KA.makeIdol = function (S, o = {}) {
  const g = o.g || (R() < .5 ? 'f' : 'm');
  let nat = 'Korea', flag = 'KR', name;
  if (o.foreign || (o.foreign !== false && R() < (o.foreignP ?? .2))) {
    const F = pick(D.FOREIGN); nat = F.nat; flag = F.flag; name = pick(g === 'f' ? F.f : F.m);
  } else name = pick(D.SURN) + ' ' + pick(g === 'f' ? D.GIVEN_F : D.GIVEN_M);
  const base = o.base ?? ri(8, 26), spread = o.spread ?? 16;
  const stats = {}; D.STATS.forEach(s => stats[s.id] = clamp(Math.round(base + rf(-spread / 2, spread)), 3, 90));
  if (o.strong) stats[o.strong] = clamp(stats[o.strong] + ri(12, 24), 0, 95);
  const trait = o.trait || pick(D.TRAITS).id;
  if (trait === 'visual') stats.visual = clamp(stats.visual + 15, 0, 95);
  if (trait === 'polyglot' && flag === 'KR' && R() < .5) { /* Korean polyglot, fine */ }
  const id = uid(S);
  const i = {
    id, name: o.name || name, g, age: o.age || ri(13, 20), nat, flag, look: o.look || KA.randomLook(g), stats, pot: o.pot || ri(62, 98),
    trait, traitKnown: !!o.traitKnown, status: 'trainee', weeks: 0, grade: '-', grades: [], cond: 90, mood: 75, fans: 0, gid: null, pos: '',
    plan: 'balanced', joined: S.week, rest: 0, prev: KA.overall({ stats })
  };
  return i;
};

// ------------------------------------------------------------------ new game
KA.newGame = function (o = {}) {
  const diff = o.diff || 'normal';
  const S = {
    v: KA.VERSION, slot: o.slot || 1, diff, created: Date.now(), week: 0, nid: 0,
    agency: (o.agency || 'Starlight').trim() || 'Starlight', ceo: (o.ceo || 'CEO').trim() || 'CEO',
    money: { easy: 8e8, normal: 5e8, hard: 2.5e8 }[diff] || 5e8, debt: 0, rep: 0,
    rooms: { office: 1, practice: 1, vocal: 1, dorm: 1, studio: 0, stylist: 0, gym: 0, mvset: 0, content: 0 },
    staff: {}, idols: {}, groups: [], albums: [], owned: ['tee', 'hoodie'],
    chart: [], realHeat: {}, mshow: null, show: null, hate: [], reqs: [], feed: [], q: [], log: [], ach: {},
    stats: { content: 0, scouts: 0, sold: 0, wins: 0, tours: 0 }, year: {}, awards: [], tut: { step: 0, done: false }, tips: {}, sound: true,
    flags: {}, scouted: [], streak: { id: null, n: 0 }, crown: { aid: null, n: 0 }
  };
  D.REAL.forEach(r => S.realHeat[r.n] = { heat: R() < .5 ? r.pop * rf(.5, 1.05) : r.pop * rf(.1, .4), song: ri(0, r.songs.length - 1), wk: ri(0, 8) });
  S.rivals = D.RIVAL_AGENCIES.flatMap(a => a.groups.map(g => ({ n: g.n, g: g.g, ag: a.n, pop: ri(35, 62), heat: ri(10, 40), song: pick(D.TITLE_A) + ' ' + pick(D.TITLE_B) })));
  S.rookies = D.FICTIONAL_ROOKIES.map(r => ({ n: r.n, g: r.g, pop: ri(20, 55) }));
  KA.updateChart(S);
  log(S, `${S.agency} Entertainment opens in a rented basement. CEO ${S.ceo} has one dream: build the biggest agency in K-pop.`, '🏢');
  return S;
};
KA.migrate = function (S) {
  S.q ??= []; S.tips ??= {}; S.tut ??= { step: 0, done: true }; S.flags ??= {}; S.awards ??= []; S.year ??= {}; S.streak ??= { id: null, n: 0 }; S.crown ??= { aid: null, n: 0 };
  return S;
};

// ------------------------------------------------------------------ building and staff
KA.roomCost = (S, id) => { const r = D.ROOMS.find(x => x.id === id); return r.cost[S.rooms[id]] ?? null; };
KA.upgradeRoom = function (S, id) {
  const c = KA.roomCost(S, id); if (c == null) return { ok: false, msg: 'This room is fully upgraded.' };
  if (S.money < c) return { ok: false, msg: 'Not enough money.' };
  S.money -= c; S.rooms[id]++; const r = D.ROOMS.find(x => x.id === id);
  log(S, `${r.n} ${S.rooms[id] === 1 ? 'built' : 'upgraded to level ' + S.rooms[id]}.`, r.e);
  return { ok: true };
};
KA.staffCost = (S, id) => { const s = D.STAFF.find(x => x.id === id); const lv = S.staff[id] || 0; return lv >= 3 ? null : s.pay * 4 * (lv + 1); };
KA.hire = function (S, id) {
  const c = KA.staffCost(S, id); if (c == null) return { ok: false, msg: 'Already the best there is.' };
  if (S.money < c) return { ok: false, msg: 'Not enough money for the signing fee.' };
  S.money -= c; S.staff[id] = (S.staff[id] || 0) + 1; const s = D.STAFF.find(x => x.id === id);
  log(S, `Hired a ${D.STAFF_LV[S.staff[id]].toLowerCase()} ${s.n.toLowerCase()}.`, '🤝'); return { ok: true };
};
KA.monthlyCost = function (S) {
  let c = 0;
  for (const i of Object.values(S.idols)) if (i.status === 'trainee') c += 8e5; else if (i.status === 'idol') c += 2e6;
  for (const s of D.STAFF) c += (S.staff[s.id] || 0) * s.pay;
  c += Object.values(S.rooms).reduce((a, v) => a + v, 0) * 5e5 + 2e6;
  c += KA.loanPay ? KA.loanPay(S) : 0;
  return c;
};

// ------------------------------------------------------------------ scouting
KA.SCOUTS = [
  { id: 'street', n: 'Street casting', d: 'Cheap. Random trainees, sometimes a hidden gem.', cost: 2e6, count: 3, base: [6, 22] },
  { id: 'open', n: 'Open audition', d: 'Lots of hopefuls. Pick from five.', cost: 8e6, count: 5, base: [10, 28], fame: 0 },
  { id: 'online', n: 'Online global audition', d: 'Trainees from all over the world.', cost: 1.2e7, count: 4, base: [12, 30], foreign: .7 },
  { id: 'academy', n: 'Performing arts school', d: 'Already trained. Higher stats, higher potential.', cost: 3e7, count: 4, base: [22, 38], pot: [75, 98], rank: 1 },
  { id: 'transfer', n: 'Trainee transfer', d: 'Experienced trainees from other agencies.', cost: 8e7, count: 3, base: [34, 50], pot: [70, 92], rank: 2 }
];
KA.scout = function (S, type, gender) {
  const t = KA.SCOUTS.find(s => s.id === type);
  if (!t) return { ok: false };
  if ((t.rank || 0) > KA.rank(S)) return { ok: false, msg: `Needs a ${D.RANKS[t.rank].n.toLowerCase()} rank.` };
  if (S.money < t.cost) return { ok: false, msg: 'Not enough money.' };
  if (S.flags.scoutWeek === S.week) return { ok: false, msg: 'You already held an audition this week.' };
  S.money -= t.cost; S.flags.scoutWeek = S.week; S.stats.scouts++;
  const list = [];
  for (let k = 0; k < t.count; k++) {
    const i = KA.makeIdol(S, { g: gender === 'any' ? undefined : gender, base: ri(t.base[0], t.base[1]), pot: t.pot ? ri(t.pot[0], t.pot[1]) : undefined, foreignP: t.foreign ?? .15, strong: pick(['vocal', 'dance', 'rap', 'visual', 'variety']) });
    if (type === 'street' && R() < .2) { i.pot = ri(90, 99); i.stats.visual = clamp(i.stats.visual + 20, 0, 90); }
    list.push(i);
  }
  S.scouted = list;
  return { ok: true, list };
};
KA.sign = function (S, id) {
  const i = S.scouted.find(x => x.id === id); if (!i) return { ok: false };
  if (KA.trainees(S).length >= KA.maxTrainees(S)) return { ok: false, msg: 'The dorm is full. Upgrade the CEO office to sign more trainees.' };
  i.joined = S.week; S.idols[i.id] = i; S.scouted = S.scouted.filter(x => x.id !== id);
  log(S, `Signed ${i.name} (${i.age}, ${i.nat}) as a trainee.`, '✍️'); KA.ach(S, 'scout');
  return { ok: true, idol: i };
};
KA.release = function (S, id) {
  const i = S.idols[id]; if (!i || i.status !== 'trainee') return;
  i.status = 'left'; log(S, `${i.name} left the agency.`, '👋');
};
KA.setPlan = (S, id, plan) => { const i = S.idols[id]; if (i) i.plan = plan; };

// ------------------------------------------------------------------ training
function growth(S, i, stat, amt, plan) {
  const t = i.trait; let m = 1;
  if (t === 'ace') m *= 1.15;
  if (t === 'genius' && stat === 'dance') m *= 1.8;
  if (t === 'voice' && stat === 'vocal') m *= 1.8;
  if (t === 'rapper' && stat === 'rap') m *= 1.8;
  if (t === 'funny' && stat === 'variety') m *= 1.6;
  if (t === 'bloomer') m *= i.weeks > 48 ? 1.9 : .7;
  if (plan) {
    const P = D.PLANS.find(p => p.id === plan);
    if (P.room) m *= 1 + (S.rooms[P.room] || 0) * .15;
    if (P.coach) m *= 1 + (S.staff[P.coach] || 0) * .4;
  }
  const cap = i.pot + (t === 'bloomer' ? 4 : 0);
  const room = Math.max(0, cap - i.stats[stat]) / cap;
  const cf = .35 + .65 * (i.cond / 100);
  i.stats[stat] = clamp(i.stats[stat] + amt * m * room * cf * rf(.7, 1.3), 0, 99);
}
function trainWeek(S, i) {
  if (i.rest > 0) { i.rest--; i.cond = clamp(i.cond + 15, 0, 100); return; }
  const P = D.PLANS.find(p => p.id === i.plan) || D.PLANS[6];
  for (const k in P.g) growth(S, i, k, P.g[k], P.id);
  if (i.trait === 'ace') D.STATS.forEach(s => growth(S, i, s.id, .25));
  let dc = P.cond;
  if (dc < 0) { dc *= i.trait === 'fragile' ? 1.4 : i.trait === 'iron' ? .65 : 1; dc *= 1 - S.rooms.gym * .06; dc += i.stats.stamina / 25; }
  else dc += S.rooms.dorm * 4 + (i.trait === 'iron' ? 6 : 0);
  i.cond = clamp(i.cond + dc, 0, 100);
  i.mood = clamp(i.mood + (P.id === 'rest' ? 6 : -1) + (S.rooms.dorm - 1), 0, 100);
  if (i.cond < 18 && R() < .35) { i.rest = 2; q(S, { k: 'msg', e: '🤒', t: `${i.name} got sick`, b: `${i.name} pushed too hard and has to rest for two weeks.` }); }
  i.weeks++;
  if (!i.traitKnown && i.weeks >= 8 && R() < .12) { i.traitKnown = true; q(S, { k: 'msg', e: '🔍', t: 'Hidden trait found!', b: `${i.name}: ${D.TRAITS.find(t => t.id === i.trait).n}. ${D.TRAITS.find(t => t.id === i.trait).d}` }); }
}
KA.grade = s => s >= 68 ? 'A' : s >= 54 ? 'B' : s >= 40 ? 'C' : s >= 28 ? 'D' : 'F';
function monthlyEval(S) {
  const tr = KA.trainees(S).filter(i => i.weeks >= 3 && !(S.show && S.show.ids.includes(i.id)));
  if (!tr.length) return;
  const rows = tr.map(i => {
    const ov = KA.overall(i), gain = ov - (i.prev || ov);
    const score = Math.round(ov + gain * 3 + rf(-4, 4) + (i.cond - 60) / 10);
    const grade = KA.grade(score); i.grade = grade; i.grades.push(grade); i.prev = ov;
    if (grade === 'A') { i.mood = clamp(i.mood + 10, 0, 100); KA.ach(S, 'aplus'); }
    if (grade === 'F' || grade === 'D') i.mood = clamp(i.mood - 10, 0, 100);
    return { id: i.id, n: i.name, score, grade, gain };
  }).sort((a, b) => b.score - a.score);
  q(S, { k: 'eval', rows });
  // trainees who keep failing and are unhappy can quit
  for (const i of tr) {
    const last = i.grades.slice(-3);
    if (last.length === 3 && last.every(g => g === 'F' || g === 'D') && i.mood < 35 && R() < .5) {
      i.status = 'left'; q(S, { k: 'msg', e: '💔', t: `${i.name} quit`, b: `After three bad evaluations, ${i.name} packed up and went home. Keep an eye on mood and grades.` });
      log(S, `${i.name} quit after three bad evaluations.`, '💔');
    }
  }
  if (!S.tips.eval) S.tips.eval = 'pending';
}

// ------------------------------------------------------------------ survival show
KA.canShow = S => !S.show && KA.trainees(S).filter(i => i.weeks >= 4).length >= 1 && KA.year(S) >= 1;
KA.joinShow = function (S, ids) {
  if (S.show) return { ok: false, msg: 'The show is already running.' };
  ids = ids.filter(id => S.idols[id] && S.idols[id].status === 'trainee');
  if (!ids.length) return { ok: false, msg: 'Pick at least one trainee.' };
  if (ids.length > 6) return { ok: false, msg: 'At most six trainees per agency.' };
  const fee = 1e7 * ids.length; if (S.money < fee) return { ok: false, msg: 'Not enough money for the entry fee.' };
  S.money -= fee;
  const g = S.idols[ids[0]].g;
  const others = [];
  for (let k = 0; k < 100 - ids.length; k++) others.push({ id: 'x' + k, n: pick(D.SURN) + ' ' + pick(g === 'f' ? D.GIVEN_F : D.GIVEN_M), skill: ri(22, 72), pop: rf(0, 25), out: false });
  S.show = { ep: 0, ids, g, others, pop: Object.fromEntries(ids.map(id => [id, rf(5, 20)])), focus: Object.fromEntries(ids.map(id => [id, 'skill'])), out: [], last: null };
  log(S, `${ids.length} trainee${ids.length > 1 ? 's' : ''} joined ${D.SHOW_NAME}.`, '📺');
  if (!S.tips.show) S.tips.show = 'pending';
  return { ok: true };
};
function showEpisode(S) {
  const sh = S.show, E = D.SHOW_EPISODES[sh.ep]; if (!E) return;
  const statOf = i => E.stat === 'mix' ? KA.overall(i) : E.stat === 'best' ? Math.max(i.stats.vocal, i.stats.dance, i.stats.rap) : i.stats[E.stat];
  const res = [];
  for (const id of sh.ids) {
    if (sh.out.includes(id)) continue;
    const i = S.idols[id], f = sh.focus[id];
    let perf = statOf(i) + rf(-8, 10) + (i.trait === 'center' ? 5 : 0) + (f === 'skill' ? 6 : 0);
    let screen = f === 'story' ? 14 : f === 'rival' ? 18 : f === 'friend' ? 8 : 4;
    let evil = f === 'rival' && R() < .3;
    const gain = perf * .45 + screen * (evil ? -0.6 : 1) + (i.stats.visual - 40) / 6 + rf(-3, 5);
    sh.pop[id] = Math.max(0, sh.pop[id] + gain);
    { const k = pick(['vocal', 'dance', 'rap']); i.stats[k] = clamp(i.stats[k] + 1.2, 0, 99); }
    i.fans += Math.round(Math.max(0, gain) * 250);
    i.cond = clamp(i.cond - 6, 0, 100);
    res.push({ id, n: i.name, perf: Math.round(perf), screen, evil });
  }
  for (const o of sh.others) if (!o.out) o.pop += o.skill * .45 + rf(0, 14);
  const all = [...sh.ids.filter(id => !sh.out.includes(id)).map(id => ({ id, n: S.idols[id].name, p: sh.pop[id], us: true })), ...sh.others.filter(o => !o.out).map(o => ({ id: o.id, n: o.n, p: o.pop }))].sort((a, b) => b.p - a.p);
  all.forEach((r, k) => r.rank = k + 1);
  let cutMsg = '';
  if (E.cut) {
    const keep = Math.round(E.cut === .5 ? 50 : 20);
    all.slice(keep).forEach(r => { if (r.us) { sh.out.push(r.id); } else { const o = sh.others.find(x => x.id === r.id); o.out = true; } });
    cutMsg = `Only ${keep} trainees remain.`;
  }
  const mine = all.filter(r => r.us);
  sh.ep++;
  if (E.final) {
    const top = all.slice(0, 9); const winners = top.filter(r => r.us).map(r => r.id);
    sh.done = true; sh.winners = winners;
    winners.forEach(id => { S.idols[id].fans += 30000; KA.ach(S, 'show'); });
    q(S, { k: 'show', ep: E, res, mine, top: top.map(r => ({ n: r.n, us: r.us, rank: r.rank })), final: true, winners });
    log(S, winners.length ? `${winners.map(id => S.idols[id].name).join(', ')} made the final lineup of ${D.SHOW_NAME}!` : `None of your trainees made the final lineup of ${D.SHOW_NAME}.`, '🏆');
    S.showDone = { winners, g: sh.g, week: S.week };
    S.show = null;
  } else q(S, { k: 'show', ep: E, res, mine, top: all.slice(0, 9).map(r => ({ n: r.n, us: r.us, rank: r.rank })), cut: cutMsg, out: res.filter(r => sh.out.includes(r.id)).map(r => r.n) });
}

// ------------------------------------------------------------------ groups
KA.formGroup = function (S, o) {
  if (KA.active(S).length >= KA.maxGroups(S)) return { ok: false, msg: 'Upgrade the CEO office to run another group.' };
  const ids = (o.members || []).filter(id => S.idols[id] && S.idols[id].status === 'trainee');
  if (ids.length < 2 || ids.length > 12) return { ok: false, msg: 'A group needs 2 to 12 members.' };
  const name = (o.name || '').trim(); if (!name) return { ok: false, msg: 'Give the group a name.' };
  if (S.groups.some(g => g.name.toLowerCase() === name.toLowerCase())) return { ok: false, msg: 'You already have a group with that name.' };
  const ms = ids.map(id => S.idols[id]);
  const g = {
    id: uid(S), name, fandom: (o.fandom || '').trim() || name + 'ies', color: o.color || '#ff4fa3', members: ids, status: 'predebut',
    gender: ms.every(m => m.g === 'f') ? 'f' : ms.every(m => m.g === 'm') ? 'm' : 'x', concept: o.concept || 'teen', formed: S.week, debut: null,
    fans: Math.round(ms.reduce((s, m) => s + m.fans, 0) * .8 + 2000), trust: 60, buzz: 0, wins: 0, sched: [], content: null, tour: null, hiatus: 0,
    reg: { kr: 60, jp: 8, sea: 10, na: 4, latam: 3, eu: 3, oc: 2 }, year: {}, promo: null, lowCond: 0, lightstick: false, flags: {}, contract: null, project: !!o.project
  };
  ms.forEach((m, k) => { m.status = 'idol'; m.gid = g.id; m.pos = (o.positions && o.positions[m.id]) || KA.autoPos(ms)[m.id]; m.plan = 'balanced'; });
  S.groups.push(g);
  log(S, `${name} is formed: ${ms.map(m => m.name).join(', ')}. The fandom will be called ${g.fandom}.`, '🌟');
  if (!S.tips.debut) S.tips.debut = 'pending';
  return { ok: true, group: g };
};
KA.autoPos = function (ms) {
  const P = {}; const by = k => ms.slice().sort((a, b) => b.stats[k] - a.stats[k]);
  ms.forEach(m => P[m.id] = []);
  P[by('vocal')[0].id].push('Main vocal');
  P[by('dance')[0].id].push('Main dancer');
  if (ms.length > 2) P[by('rap')[0].id].push('Main rapper');
  P[by('visual')[0].id].push('Visual');
  P[ms.slice().sort((a, b) => (b.trait === 'leader') - (a.trait === 'leader') || b.age - a.age)[0].id].unshift('Leader');
  P[ms.slice().sort((a, b) => a.age - b.age)[0].id].push('Maknae');
  const c = ms.slice().sort((a, b) => (b.trait === 'center') - (a.trait === 'center') || (b.stats.visual + b.stats.dance) - (a.stats.visual + a.stats.dance))[0]; P[c.id].push('Center');
  ms.forEach(m => { if (!P[m.id].length) P[m.id].push(m.stats.vocal >= m.stats.dance ? 'Sub vocal' : 'Lead dancer'); });
  const out = {}; for (const k in P) out[k] = P[k].slice(0, 2).join(' · '); return out;
};
KA.disband = function (S, gid) {
  const g = KA.group(S, gid); if (!g) return;
  g.status = 'disbanded'; KA.members(S, g).forEach(m => { m.status = 'left'; });
  log(S, `${g.name} disbanded. Thank you for everything, ${g.fandom}.`, '🕊️');
};
KA.groupStat = (S, g, k) => avg(KA.members(S, g).filter(m => m.status === 'idol').map(m => m.stats[k]));
KA.groupCond = (S, g) => avg(KA.members(S, g).filter(m => m.status === 'idol').map(m => m.cond));

// ------------------------------------------------------------------ schedules
KA.maxSched = S => 2 + (S.staff.manager ? 1 : 0) + (S.staff.manager >= 3 ? 1 : 0);
KA.toggleSched = function (S, gid, id) {
  const g = KA.group(S, gid); if (!g) return { ok: false };
  const s = D.SCHEDULES.find(x => x.id === id);
  if (g.sched.includes(id)) { g.sched = g.sched.filter(x => x !== id); return { ok: true }; }
  if (g.status !== 'active') return { ok: false, msg: 'Debut first!' };
  if (KA.fameTier(g.fans) < s.fame) return { ok: false, msg: `Needs ${D.FAME[s.fame].n} fame.` };
  if (g.sched.length >= KA.maxSched(S)) return { ok: false, msg: `Only ${KA.maxSched(S)} schedules a week. Hire a road manager for more.` };
  if (g.tour) return { ok: false, msg: 'The group is on tour this week.' };
  g.sched.push(id); return { ok: true };
};
function runSchedules(S, g) {
  const out = [];
  if (!g.sched.length) return out;
  const tier = KA.fameTier(g.fans), ms = KA.members(S, g).filter(m => m.status === 'idol');
  for (const id of g.sched) {
    const s = D.SCHEDULES.find(x => x.id === id); if (!s) continue;
    const sk = avg(ms.map(m => m.stats[s.stat])) / 50;
    const funny = s.stat === 'variety' && ms.some(m => m.trait === 'funny') ? 1.5 : 1;
    const vis = s.stat === 'visual' && ms.some(m => m.trait === 'visual') ? 1.4 : 1;
    const poly = s.global && ms.some(m => m.trait === 'polyglot') ? 1.3 : 1;
    const money = Math.round(s.money * (1 + tier * .5) * (.6 + sk * .5) * vis * rf(.85, 1.15));
    const fans = Math.round(s.fans * .5 * (1 + tier * .4) * (.5 + sk * .6) * funny * poly * rf(.8, 1.2));
    S.money += money; g.fans += KA.damp(g, fans); if (s.trust) g.trust = clamp(g.trust + s.trust, 0, 100);
    if (s.global) { const r = s.region || pick(['jp', 'sea', 'na', 'eu', 'latam', 'oc']); g.reg[r] = clamp(g.reg[r] + 3, 0, 100); }
    const cc = s.cond * (1 - (S.staff.manager || 0) * .12);
    ms.forEach(m => { m.cond = clamp(m.cond - cc * (m.trait === 'fragile' ? 1.3 : m.trait === 'iron' ? .7 : 1), 0, 100); m.stats[s.stat] = clamp(m.stats[s.stat] + .3, 0, 99); });
    out.push({ n: s.n, e: s.e, money, fans });
  }
  g.sched = [];
  return out;
}

// ------------------------------------------------------------------ albums
KA.titleIdea = () => pick(D.TITLE_A) + ' ' + pick(D.TITLE_B);
KA.defaultLines = function (S, g, genre) {
  const ms = KA.members(S, g).filter(m => m.status === 'idol');
  const sk = (D.GENRES.find(x => x.id === genre) || {}).skill || 'vocal';
  const w = ms.map(m => 10 + m.stats.vocal * .6 + m.stats.rap * .25 + (sk === 'dance' ? m.stats.dance * .2 : 0));
  const sum = w.reduce((a, b) => a + b, 0);
  const L = {}; let tot = 0; ms.forEach((m, k) => { L[m.id] = Math.round(w[k] / sum * 100); tot += L[m.id]; });
  L[ms[0].id] += 100 - tot; return L;
};
KA.linesInfo = function (S, g, lines) {
  const ms = KA.members(S, g).filter(m => m.status === 'idol'); const n = ms.length;
  const vals = ms.map(m => lines[m.id] || 0); const mn = Math.min(...vals), mx = Math.max(...vals);
  const fair = n > 1 ? clamp(1 - (mx - mn) / (100 - 100 / n), 0, 1) : 1;
  const skill = ms.reduce((s, m) => s + (lines[m.id] || 0) * Math.max(m.stats.vocal, m.stats.rap * .9), 0) / 100;
  const unfair = n > 2 && mn < (100 / n) * .35;
  return { fair, skill, unfair, mn, mx };
};
KA.conceptFit = function (S, g, concept) {
  const C = D.CONCEPTS.find(c => c.id === concept); const ms = KA.members(S, g).filter(m => m.status === 'idol');
  const hit = ms.filter(m => (D.OUTFITS.find(o => o.id === m.look.top) || { tags: [] }).tags.some(t => C.tags.includes(t))).length;
  return ms.length ? hit / ms.length : 0;
};
KA.albumCost = function (S, o) {
  const T = D.ALBUM_TYPES.find(t => t.id === o.type), P = D.PRODUCERS.find(p => p.id === o.producer), B = D.MV_BUDGET[o.budget | 0];
  const set = D.MV_SETS.find(s => s.id === o.set) || D.MV_SETS[0];
  const cgi = (o.shots || []).filter(x => x === 'cgi').length * .3;
  const mv = Math.round(B.cost * (set.cost + cgi) * (1 - S.rooms.mvset * .1));
  const prod = Math.round(P.cost * (S.staff.producer ? 1 - S.staff.producer * .15 : 1));
  const studio = Math.round(T.cost * (S.rooms.studio ? 1 - S.rooms.studio * .06 : 1.15));
  return { total: studio + prod + mv, studio, prod, mv };
};
KA.selfProducer = (S, g) => KA.members(S, g).filter(m => m.status === 'idol').find(m => (m.trait === 'producer' || m.trait === 'rapper' || m.flags?.writer) && Math.max(m.stats.rap, m.stats.vocal) >= 50);
KA.planAlbum = function (S, gid, o) {
  const g = KA.group(S, gid); if (!g) return { ok: false };
  if (g.status === 'disbanded') return { ok: false };
  if (S.albums.some(a => a.gid === gid && a.status === 'upcoming')) return { ok: false, msg: 'A release is already scheduled.' };
  if (g.promo && S.week - g.promo.start < 3) return { ok: false, msg: 'Still promoting the last song. Wait a few weeks.' };
  if (g.tour) return { ok: false, msg: 'Finish the tour first.' };
  const P = D.PRODUCERS.find(p => p.id === o.producer); if (!P) return { ok: false };
  if (P.self && !KA.selfProducer(S, g)) return { ok: false, msg: 'No member can produce yet. A member needs the Born producer or Underground rapper trait and 50+ in rap or vocal.' };
  const cost = KA.albumCost(S, o);
  if (S.money < cost.total) return { ok: false, msg: `This plan costs ${KA.won(cost.total)}. Not enough money.` };
  const title = (o.title || '').trim() || KA.titleIdea();
  const T = D.ALBUM_TYPES.find(t => t.id === o.type), G = D.GENRES.find(x => x.id === o.genre) || D.GENRES[0];
  const ms = KA.members(S, g).filter(m => m.status === 'idol');
  const lines = o.lines || KA.defaultLines(S, g, G.id); const L = KA.linesInfo(S, g, lines);
  const fit = KA.conceptFit(S, g, o.concept);
  const sk = avg(ms.map(m => m.stats[G.skill]));
  let qv = 26 + P.q + T.q + sk * .38 + fit * 8 + (S.staff.stylist || 0) * 1.5 + S.rooms.studio * 2 + (S.staff.producer || 0) * 3 + L.skill * .08 + L.fair * 4 + rf(-6, 6);
  const selfM = P.self ? KA.selfProducer(S, g) : null;
  if (selfM) qv += 6 + (Math.max(selfM.stats.rap, selfM.stats.vocal) - 50) * .3;
  if (g.flags.reqLinesFor && lines[g.flags.reqLinesFor] >= 100 / ms.length) { g.trust = clamp(g.trust + 6, 0, 100); g.flags.reqLinesFor = null; }
  // MV
  const set = D.MV_SETS.find(s => s.id === o.set) || D.MV_SETS[0], story = D.MV_STORIES.find(s => s.id === o.story) || D.MV_STORIES[0], B = D.MV_BUDGET[o.budget | 0];
  const shots = (o.shots || []).slice(0, 6); while (shots.length < 6) shots.push('wide');
  const C = D.CONCEPTS.find(c => c.id === o.concept) || D.CONCEPTS[0];
  const variety = new Set(shots).size;
  let hype = story.hype + shots.reduce((s, id) => s + (D.MV_SHOTS.find(x => x.id === id) || { hype: 1 }).hype, 0) + variety * 1.2;
  let lore = story.lore + shots.reduce((s, id) => s + (D.MV_SHOTS.find(x => x.id === id) || { lore: 0 }).lore, 0);
  if (shots.includes('oneshot')) hype += KA.groupStat(S, g, 'dance') / 20;
  if (shots.includes('close') || shots.includes('fairy')) hype += KA.groupStat(S, g, 'visual') / 20;
  let mvq = 30 + B.q * 1.4 + (set.tags.some(t => C.tags.includes(t)) ? 9 : 0) + S.rooms.mvset * 3 + KA.groupStat(S, g, 'visual') * .18 + hype * .55 + lore * .35 + fit * 6 + rf(-6, 6);
  S.money -= cost.total;
  const a = {
    id: uid(S), gid, title, type: T.id, concept: C.id, genre: G.id, producer: P.id, self: selfM ? selfM.id : null, q: Math.round(clamp(qv, 8, 100)),
    mv: { set: set.id, story: story.id, shots, budget: o.budget | 0, score: Math.round(clamp(mvq, 5, 100)), hype: Math.round(hype), lore, views: 0, day1: 0 },
    lines, linesFair: L.fair, unfair: L.unfair, status: 'upcoming', planned: S.week, release: S.week + 1, sales: 0, wsales: 0, pts: 0, ptsTotal: 0, peak: 99, weeks: 0, wins: 0, cost: cost.total, year: KA.year(S) + (KA.woy(S) === KA.WPY ? 1 : 0)
  };
  S.albums.push(a); g.concept = C.id;
  if (o.challenge) a.challenge = true;
  log(S, `${g.name} will release "${title}" (${T.n}) next week. Teasers are out!`, '💿');
  g.buzz += 10 + hype;
  return { ok: true, album: a };
};
function releaseAlbum(S, a) {
  const g = KA.group(S, a.gid); if (!g || g.status === 'disbanded') { a.status = 'cancelled'; return; }
  const T = D.ALBUM_TYPES.find(t => t.id === a.type);
  a.status = 'out'; a.released = S.week;
  const first = g.status === 'predebut';
  if (first) { g.status = 'active'; g.debut = S.week; g.debutYear = KA.year(S); g.contract = S.week + 7 * KA.WPY; KA.ach(S, 'debut'); if (KA.debuted(S).length >= 2) KA.ach(S, 'twogroups'); }
  const trustF = .6 + g.trust / 125;
  a.sales = Math.round((g.fans * rf(.05, .1) * trustF + g.buzz * 400) * T.sales * (a.q / 65) + (first ? 3000 : 0));
  if (T.region) g.reg[T.region] = clamp(g.reg[T.region] + 10, 0, 100);
  a.wsales = a.sales;
  S.money += a.sales * 4000; S.stats.sold += a.sales;
  a.mv.day1 = Math.round((g.fans * .9 + g.buzz * 2500 + a.mv.hype * 6000) * (a.mv.score / 55) * rf(.85, 1.2));
  a.mv.views = a.mv.day1;
  g.promo = { aid: a.id, start: S.week, len: 4 }; g.buzz = 0;
  g.fans += KA.damp(g, Math.round(a.mv.day1 * .03 + a.sales * .2));
  KA.ach(S, a.mv.views >= 1e6 ? 'mv1m' : null);
  q(S, { k: 'release', aid: a.id, first });
  log(S, `${g.name} ${first ? 'DEBUTED' : 'came back'} with "${a.title}". First-week sales: ${KA.num(a.sales)}. MV: ${KA.num(a.mv.day1)} views in 24 hours.`, first ? '🎉' : '💿');
  if (a.unfair && R() < .55) startHate(S, g, 'lines', a);
  if (!S.tips.release) S.tips.release = 'pending';
  if (a.challenge && R() < .25 + KA.groupStat(S, g, 'dance') / 200) { g.fans += KA.damp(g, Math.round(2e4 + g.fans * .04)); a.mv.views += a.mv.day1; KA.ach(S, 'viral'); q(S, { k: 'msg', e: '🔥', t: 'Dance challenge went viral!', b: `Everyone is doing the "${a.title}" challenge. Fans are pouring in.` }); }
}
function albumWeek(S, a) {
  const g = KA.group(S, a.gid); if (!g) return;
  a.weeks++;
  const age = S.week - a.released;
  const decay = Math.pow(.8 + a.q / 900, age);
  const promo = g.promo && g.promo.aid === a.id ? 1.15 : 1;
  const hate = S.hate.some(h => h.gid === g.id) ? .8 : 1;
  a.pts = Math.round((a.q / 100) * (Math.sqrt(g.fans) * 120 + a.mv.hype * 600 + 4000) * decay * promo * hate * rf(.9, 1.1));
  a.ptsTotal += a.pts;
  if (age > 0) { a.wsales = Math.round(a.wsales * .3); a.sales += a.wsales; S.money += a.wsales * 4000; S.stats.sold += a.wsales; }
  S.money += a.pts * 90;
  const vw = Math.round(a.mv.day1 * 2.4 * Math.pow(.72, age) + a.mv.views * .01);
  a.mv.views += vw;
  if (a.mv.views >= 1e6) KA.ach(S, 'mv1m'); if (a.mv.views >= 1e8) KA.ach(S, 'mv100m');
  g.fans += KA.damp(g, Math.round(a.pts * .07 + vw * .004));
  const y = KA.year(S); g.year[y] = g.year[y] || { sales: 0, pts: 0, wins: 0, best: 0, bestT: '' };
  const Y = g.year[y]; Y.pts += a.pts; if (age === 0) Y.sales += a.sales; else Y.sales += a.wsales;
  if (a.ptsTotal > Y.best) { Y.best = a.ptsTotal; Y.bestT = a.title; }
}

// ------------------------------------------------------------------ charts and music shows
KA.updateChart = function (S) {
  const rows = [];
  for (const r of D.REAL) {
    const h = S.realHeat[r.n]; if (h.heat < 12) continue;
    rows.push({ key: 'r:' + r.n + h.song, n: r.n, s: r.songs[h.song], pts: Math.round(h.heat * h.heat * 11 * rf(.92, 1.08)), real: true, pop: r.pop });
  }
  for (const r of S.rivals) if (r.heat > 15) rows.push({ key: 'v:' + r.n + r.song, n: r.n, s: r.song, pts: Math.round(r.heat * r.heat * 9 * rf(.9, 1.1)), rival: true, pop: r.pop });
  for (const a of S.albums) if (a.status === 'out' && a.pts > 300) { const g = KA.group(S, a.gid); rows.push({ key: 'a:' + a.id, n: g.name, s: a.title, pts: a.pts, us: true, aid: a.id, gid: g.id }); }
  rows.sort((a, b) => b.pts - a.pts);
  const prev = Object.fromEntries((S.chart || []).map((r, k) => [r.key, k + 1]));
  S.chart = rows.slice(0, 30).map((r, k) => Object.assign(r, { last: prev[r.key] || null }));
  for (const r of S.chart) if (r.us) { const a = S.albums.find(x => x.id === r.aid); const pos = S.chart.indexOf(r) + 1; a.peak = Math.min(a.peak, pos); }
};
function realWeek(S) {
  for (const r of D.REAL) {
    const h = S.realHeat[r.n]; h.wk++;
    if (h.heat < 25 && R() < .035 + (r.pop > 85 ? .01 : 0)) { h.heat = r.pop * rf(.85, 1.08); h.song = (h.song + 1) % r.songs.length; h.wk = 0; }
    else h.heat *= rf(.9, .97);
  }
  for (const r of S.rivals) {
    if (r.heat < 18 && R() < .05) { r.heat = r.pop * rf(.8, 1.1); r.song = pick(D.TITLE_A) + ' ' + pick(D.TITLE_B); r.pop = clamp(r.pop + ri(-2, 4), 20, 90); }
    else r.heat *= rf(.88, .96);
  }
}
function musicShow(S) {
  const show = D.MUSIC_SHOWS[S.week % D.MUSIC_SHOWS.length];
  const cand = [];
  for (const r of S.chart.slice(0, 12)) {
    if (r.us) {
      const a = S.albums.find(x => x.id === r.aid), g = KA.group(S, a.gid);
      if (!g.promo || g.promo.aid !== a.id) continue;
      const live = KA.liveScore(S, g);
      cand.push({ n: g.name, s: a.title, us: true, aid: a.id, gid: g.id, live, score: Math.round(r.pts * .6 + Math.sqrt(g.fans) * 60 * (.5 + g.trust / 100) + live * 250) });
    } else cand.push({ n: r.n, s: r.s, score: Math.round(r.pts * .6 + r.pop * r.pop * 9 * rf(.8, 1.2)) });
  }
  if (!cand.some(c => c.us)) return null;
  cand.sort((a, b) => b.score - a.score);
  const top = cand.slice(0, 3); const mine = cand.find(c => c.us);
  if (!top.includes(mine)) top[2] = mine;
  const win = top[0].us ? top[0] : null;
  const res = { show, top, win: !!win, mine };
  const a = S.albums.find(x => x.id === mine.aid), g = KA.group(S, mine.gid);
  if (win) {
    a.wins++; g.wins++; S.stats.wins++; const y = KA.year(S); g.year[y] = g.year[y] || { sales: 0, pts: 0, wins: 0, best: 0, bestT: '' }; g.year[y].wins++;
    g.fans += KA.damp(g, Math.round(4000 * (1 + KA.fameTier(g.fans)))); KA.ach(S, 'win1');
    res.first = g.wins === 1;
    if (S.crown.aid === a.id) S.crown.n++; else S.crown = { aid: a.id, n: 1 };
    if (S.crown.n >= 3) { KA.ach(S, 'triple'); res.triple = S.crown.n === 3; }
    log(S, `${g.name} won ${show} with "${a.title}"!${res.first ? ' Their FIRST WIN!' : ''}`, '🏆');
  } else if (S.crown.aid === a.id) S.crown.n = 0;
  if (mine.live < 35 && R() < .3) startHate(S, g, 'live');
  return res;
}
KA.liveScore = (S, g) => Math.round(clamp(KA.groupStat(S, g, 'vocal') * .5 + KA.groupStat(S, g, 'dance') * .4 + KA.groupCond(S, g) * .2 + (S.staff.dance || 0) * 3 + rf(-10, 10) + (KA.members(S, g).some(m => m.trait === 'voice') ? 6 : 0), 0, 100));
KA.brand = function (S) {
  const rows = D.REAL.map(r => ({ n: r.n, v: Math.round(r.pop * r.pop * 22 + S.realHeat[r.n].heat * 600) }));
  for (const g of KA.debuted(S)) { const cur = S.albums.filter(a => a.gid === g.id && a.status === 'out').reduce((m, a) => Math.max(m, a.pts), 0); rows.push({ n: g.name, v: Math.round(Math.sqrt(g.fans) * 35 * (.6 + g.trust / 160) + cur * .8), us: true, gid: g.id }); }
  return rows.sort((a, b) => b.v - a.v);
};

// ------------------------------------------------------------------ own content
KA.startContent = function (S, gid, id) {
  const g = KA.group(S, gid), c = D.CONTENT.find(x => x.id === id);
  if (!g || g.status !== 'active') return { ok: false, msg: 'Debut first!' };
  if (g.content) return { ok: false, msg: 'Already filming something.' };
  if (c.need > S.rooms.content) return { ok: false, msg: `Needs a level ${c.need} content studio.` };
  if (S.money < c.cost) return { ok: false, msg: 'Not enough money.' };
  S.money -= c.cost; g.content = { id, left: c.weeks };
  log(S, `${g.name} started filming: ${c.n}.`, '📹'); return { ok: true };
};
function contentWeek(S, g) {
  if (!g.content) return;
  g.content.left--;
  KA.members(S, g).forEach(m => m.cond = clamp(m.cond - 2, 0, 100));
  if (g.content.left > 0) return;
  const c = D.CONTENT.find(x => x.id === g.content.id); g.content = null;
  const vf = KA.groupStat(S, g, c.stat || 'variety') / 50, funny = KA.members(S, g).some(m => m.trait === 'funny') ? 1.5 : 1;
  const tier = KA.fameTier(g.fans);
  const fans = Math.round(c.fans * .6 * (1 + tier * .5) * (.5 + vf * .6) * funny * rf(.8, 1.3)), money = Math.round(c.money * (1 + tier * .4) * rf(.8, 1.2));
  g.fans += KA.damp(g, fans); S.money += money; g.trust = clamp(g.trust + 3, 0, 100);
  if (c.global) for (const r of ['jp', 'sea', 'na', 'eu']) g.reg[r] = clamp(g.reg[r] + 2, 0, 100);
  S.stats.content++; if (S.stats.content >= 5) KA.ach(S, 'content');
  let viral = false;
  if (c.viral && R() < .2 + KA.groupStat(S, g, 'dance') / 250) { viral = true; g.fans += KA.damp(g, Math.round(3e4 + g.fans * .03)); KA.ach(S, 'viral'); }
  q(S, { k: 'msg', e: '📹', t: `${c.n} is out!`, b: `${g.name}'s ${c.n.toLowerCase()} brought ${KA.num(fans)} new fans${money ? ' and ' + KA.won(money) : ''}.${viral ? ' The challenge went VIRAL!' : ''}` });
}

// ------------------------------------------------------------------ tours
KA.planTour = function (S, gid, stops) {
  const g = KA.group(S, gid); if (!g || g.status !== 'active') return { ok: false, msg: 'Debut first!' };
  if (g.tour) return { ok: false, msg: 'Already on tour.' };
  if (KA.fameTier(g.fans) < 1) return { ok: false, msg: 'Needs Rookie fame.' };
  if (!stops.length) return { ok: false, msg: 'Add at least one city.' };
  const cost = stops.reduce((s, st) => s + D.VENUES.find(v => v.id === st.venue).cost * .25, 0);
  if (S.money < cost) return { ok: false, msg: `Production costs ${KA.won(cost)} up front.` };
  for (const st of stops) { const V = D.VENUES.find(v => v.id === st.venue); if (V.fame > KA.fameTier(g.fans)) return { ok: false, msg: `${V.n}s need ${D.FAME[V.fame].n} fame.` }; }
  S.money -= cost;
  g.tour = { name: `${g.name} World Tour "${KA.titleIdea()}"`, stops: stops.map(s => Object.assign({ sold: 0, done: false }, s)), at: 0, gross: 0, attend: 0 };
  g.sched = [];
  log(S, `${g.name} announced ${g.tour.name} with ${stops.length} stops.`, '🌍');
  if (!S.tips.tour) S.tips.tour = 'pending';
  return { ok: true };
};
KA.tourDemand = (g, city, venue) => { const C = D.CITIES.find(c => c.n === city), V = D.VENUES.find(v => v.id === venue); const reg = g.reg[C.r] / 100; return Math.round(g.fans * reg * .045 * (.6 + g.trust / 100)); };
function tourWeek(S, g) {
  const t = g.tour; if (!t) return;
  const st = t.stops[t.at]; if (!st) return;
  const V = D.VENUES.find(v => v.id === st.venue), C = D.CITIES.find(c => c.n === st.city);
  const demand = KA.tourDemand(g, st.city, st.venue) * rf(.85, 1.2);
  const shows = demand > V.cap * 1.8 ? 2 : 1;
  st.sold = Math.round(Math.min(V.cap * shows, demand)); st.shows = shows; st.done = true;
  const gross = st.sold * 85000 * (1 + (C.r !== 'kr') * .2);
  S.money += gross * .42 - V.cost * .75; t.gross += gross; t.attend += st.sold;
  g.fans += KA.damp(g, Math.round(st.sold * .6)); g.reg[C.r] = clamp(g.reg[C.r] + 4 + (KA.members(S, g).some(m => m.trait === 'polyglot') ? 3 : 0), 0, 100);
  KA.members(S, g).forEach(m => m.cond = clamp(m.cond - 13 * (1 - (S.staff.manager || 0) * .1), 0, 100));
  const soldOut = st.sold >= V.cap * shows * .99;
  if (soldOut && V.id === 'stadium') KA.ach(S, 'stadium');
  q(S, { k: 'concert', gid: g.id, city: st.city, venue: V.n, sold: st.sold, cap: V.cap * shows, shows, soldOut });
  t.at++;
  if (t.at >= t.stops.length) {
    log(S, `${t.name} wrapped: ${KA.num(t.attend)} fans, ${KA.won(t.gross)} gross.`, '🎤'); KA.ach(S, 'tour'); S.stats.tours++;
    g.tour = null;
  }
}

// ------------------------------------------------------------------ fans: SNS, requests, hate trains
function fill(S, t, g) {
  const ms = g ? KA.members(S, g) : []; const a = g ? S.albums.filter(x => x.gid === g.id && x.status === 'out').slice(-1)[0] : null;
  const real = pick(D.REAL).n, rv = pick(S.rivals);
  return t.replace(/\{g\}/g, g ? g.name : 'them').replace(/\{m\}/g, ms.length ? pick(ms).name.split(' ').pop() : 'the maknae').replace(/\{s\}/g, a ? a.title : 'the debut song')
    .replace(/\{f\}/g, g ? g.fandom : 'fans').replace(/\{r\}/g, real).replace(/\{c\}/g, g ? (D.CONCEPTS.find(c => c.id === g.concept) || {}).n || 'new' : 'new').replace(/\{city\}/g, pick(D.CITIES).n);
}
function snsWeek(S) {
  const gs = KA.debuted(S);
  const n = ri(2, 4);
  for (let k = 0; k < n; k++) {
    const g = gs.length ? pick(gs) : null;
    let mood = 'neu', t;
    if (g) { const neg = S.hate.some(h => h.gid === g.id) ? .5 : (100 - g.trust) / 300; const r = R(); mood = r < neg ? 'neg' : r < neg + .6 ? 'pos' : 'neu'; }
    t = fill(S, pick(mood === 'pos' ? D.SNS_POS : mood === 'neg' ? D.SNS_NEG : D.SNS_NEU), g);
    S.feed.unshift({ h: pick(D.HANDLES) + ri(1, 99), t, mood, likes: Math.round((g ? Math.sqrt(g.fans) * rf(1, 30) : rf(50, 3000))), w: S.week, gid: g ? g.id : null });
  }
  S.feed.length = Math.min(S.feed.length, 40);
}
function requestsWeek(S) {
  S.reqs = S.reqs.filter(r => { if (r.exp <= S.week) { const g = KA.group(S, r.gid); if (g) g.trust = clamp(g.trust - 2, 0, 100); return false; } return true; });
  for (const g of KA.debuted(S)) {
    if (S.reqs.filter(r => r.gid === g.id).length >= 2 || R() > .3) continue;
    const T = pick(D.REQUESTS); const ms = KA.members(S, g).filter(m => m.status === 'idol');
    const m = ms.slice().sort((a, b) => a.fans - b.fans)[0] || ms[0];
    const city = pick(D.CITIES.filter(c => c.r !== 'kr')).n;
    S.reqs.push({ id: uid(S), gid: g.id, type: T.id, t: T.t.replace('{m}', m.name.split(' ').pop()).replace('{city}', city), mid: m.id, city, exp: S.week + 4 });
    if (!S.tips.request) S.tips.request = 'pending';
  }
}
KA.answerReq = function (S, rid, yes) {
  const r = S.reqs.find(x => x.id === rid); if (!r) return { ok: false };
  const g = KA.group(S, r.gid), T = D.REQUESTS.find(x => x.id === r.type);
  if (!yes) { g.trust = clamp(g.trust - 2, 0, 100); S.reqs = S.reqs.filter(x => x !== r); return { ok: true, msg: 'Fans are a little disappointed.' }; }
  const c = T.cost;
  if (c.money && S.money < c.money) return { ok: false, msg: 'Not enough money.' };
  if (c.money) S.money -= c.money;
  if (c.cond) KA.members(S, g).forEach(m => m.cond = clamp(m.cond - c.cond, 0, 100));
  if (c.rest) { g.sched = []; KA.members(S, g).forEach(m => { m.cond = clamp(m.cond + 20, 0, 100); m.mood = clamp(m.mood + 8, 0, 100); }); }
  const shy = KA.members(S, g).some(m => m.trait === 'shy') ? 1.3 : 1;
  g.trust = clamp(g.trust + T.trust * shy, 0, 100); g.fans += KA.damp(g, Math.round(T.fans * (1 + KA.fameTier(g.fans) * .6)));
  if (T.money) S.money += Math.round(T.money * (1 + KA.fameTier(g.fans) * .5));
  if (T.id === 'lightstick') g.lightstick = true;
  if (T.flag === 'lines') g.flags.reqLinesFor = r.mid;
  if (T.flag === 'city') { const C = D.CITIES.find(c => c.n === r.city); g.reg[C.r] = clamp(g.reg[C.r] + 3, 0, 100); g.flags.reqCity = r.city; }
  if (T.flag === 'jp') g.reg.jp = clamp(g.reg.jp + 3, 0, 100);
  S.reqs = S.reqs.filter(x => x !== r);
  return { ok: true, msg: `${g.fandom} are thrilled! Fan trust went up.` };
};
function startHate(S, g, type, a) {
  if (S.hate.some(h => h.gid === g.id)) return;
  const H = D.HATE.find(h => h.id === type) || pick(D.HATE);
  const truth = H.id === 'lines' || H.id === 'overwork' ? true : H.id === 'live' ? true : R() < .3;
  const rv = pick(S.rivals.filter(r => r.g === g.gender) .concat(S.rivals)).n;
  const text = fill(S, H.t, g).replace('{r}', rv);
  const h = { id: uid(S), gid: g.id, type: H.id, heat: ri(35, 55), truth, start: S.week, text, legal: 0, tried: [] };
  if (H.id === 'fanwar') h.text = H.t.replace('{r}', rv).replace('{f}', g.fandom);
  S.hate.push(h);
  q(S, { k: 'hate', hid: h.id });
  log(S, `Hate train: ${H.n} around ${g.name}.`, '⚠️');
  if (!S.tips.hate) S.tips.hate = 'pending';
}
KA.startHate = startHate;
KA.hateResponses = function (S, h) {
  const H = D.HATE.find(x => x.id === h.type);
  const list = D.HATE_RESP.filter(r => r.id !== 'proof' || H.proofOk);
  if (H.fix === 'rest') list.unshift({ id: 'rest', n: 'Give them two weeks off', d: 'Clears the schedule. Fans want to see them rested.' });
  if (H.fix === 'lines') list.unshift({ id: 'fixlines', n: 'Promise fair lines', d: 'Publicly commit to fairer lines next time. Works if you keep it.' });
  return list.filter(r => !h.tried.includes(r.id));
};
KA.respondHate = function (S, hid, rid) {
  const h = S.hate.find(x => x.id === hid); if (!h) return { ok: false };
  const g = KA.group(S, h.gid), pr = S.staff.pr || 0;
  h.tried.push(rid);
  let msg = '';
  if (rid === 'silent') { h.heat -= 6 + pr * 3; g.trust -= 3; msg = 'You stay quiet. The noise keeps going, but slower.'; }
  if (rid === 'statement') { h.heat -= 18 + pr * 5; g.trust += h.truth ? -2 : 2; msg = 'The statement calms some people down.'; }
  if (rid === 'proof') { if (!h.truth) { h.heat = 0; g.trust += 8; g.fans += KA.damp(g, 5000); msg = 'The full footage proves the claim was false. Fans flood the tags with support!'; } else { h.heat += 15; g.trust -= 5; msg = 'The "proof" didn\'t help. People found more clips.'; } }
  if (rid === 'legal') { if (S.money < 2e7) { h.tried.pop(); return { ok: false, msg: 'Legal action costs ₩20M.' }; } S.money -= 2e7; h.legal = 3; g.trust += 5; h.heat -= 8; msg = 'Your lawyers send notices to the worst accounts. Fans feel protected.'; }
  if (rid === 'apology') { h.heat = 0; g.fans = Math.round(g.fans * .95); g.trust += h.truth ? 3 : -4; msg = h.truth ? 'The apology lands well. Fans are ready to move on.' : 'You apologized for something that wasn\'t true. Some fans feel let down.'; }
  if (rid === 'live') { if (R() < .45 + (KA.groupStat(S, g, 'variety') / 200) + (KA.members(S, g).some(m => m.trait === 'leader') ? .1 : 0)) { h.heat = 0; g.trust += 10; msg = 'The members spoke from the heart. The tag flips to support overnight.'; } else { h.heat += 20; g.trust -= 4; msg = 'One sentence got clipped out of context. It got worse.'; } }
  if (rid === 'rest') { g.hiatus = 2; g.sched = []; h.heat -= 40; g.trust += 6; msg = `${g.name} take two weeks off. Fans are relieved.`; }
  if (rid === 'fixlines') { h.heat -= 30; g.flags.fairPromise = true; g.trust += 3; msg = 'Fans will be watching the next line distribution.'; }
  g.trust = clamp(g.trust, 0, 100); h.heat = clamp(h.heat, 0, 100);
  if (h.heat <= 0) endHate(S, h);
  return { ok: true, msg };
};
function endHate(S, h) {
  S.hate = S.hate.filter(x => x !== h); KA.ach(S, 'survive');
  const g = KA.group(S, h.gid); if (g) log(S, `The hate train around ${g.name} is over.`, '🌈');
}
function hateWeek(S) {
  for (const h of S.hate.slice()) {
    const g = KA.group(S, h.gid); if (!g || g.status !== 'active') { S.hate = S.hate.filter(x => x !== h); continue; }
    const pr = S.staff.pr || 0;
    h.heat += (h.tried.length ? 2 : 7) - pr * 2.5 - (h.legal > 0 ? 14 : 0) - (S.week - h.start > 6 ? 6 : 0);
    if (h.legal > 0) h.legal--;
    h.heat = clamp(h.heat, 0, 100);
    g.trust = clamp(g.trust - h.heat / 40, 0, 100);
    g.fans = Math.max(0, Math.round(g.fans - g.fans * h.heat / 4000));
    const lead = KA.members(S, g).some(m => m.trait === 'leader') ? .6 : 1;
    KA.members(S, g).forEach(m => m.mood = clamp(m.mood - h.heat / 25 * lead, 0, 100));
    if (h.heat <= 0) endHate(S, h);
  }
  for (const g of KA.debuted(S)) {
    if (S.hate.some(h => h.gid === g.id)) continue;
    let p = .012 + (100 - g.trust) / 4000 + (KA.fameTier(g.fans) >= 3 ? .01 : 0);
    if (g.lowCond >= 2) { startHate(S, g, 'overwork'); continue; }
    if (R() < p) startHate(S, g, pick(['dating', 'attitude', 'plagiarism', 'concept', 'fanwar', 'lipsync']));
  }
}

// ------------------------------------------------------------------ random events
KA.EV = D.EVENTS;
function randomEvent(S) {
  const gs = KA.debuted(S); if (!gs.length || R() > .14) return;
  const g = pick(gs), ms = KA.members(S, g).filter(m => m.status === 'idol'); if (!ms.length) return;
  const m = pick(ms), i = ri(0, D.EVENTS.length - 1);
  const a = S.albums.filter(x => x.gid === g.id && x.status === 'out').slice(-1)[0];
  q(S, { k: 'event', ev: i, gid: g.id, mid: m.id, t: D.EVENTS[i].t.replace('{g}', g.name).replace('{m}', m.name).replace('{s}', a ? a.title : 'their debut song') });
}
KA.resolveEvent = function (S, item, ci) {
  const E = D.EVENTS[item.ev], g = KA.group(S, item.gid), m = S.idols[item.mid]; if (!E || !g) return '';
  const fx = E.c[ci][1];
  if (fx.mood) KA.members(S, g).forEach(x => x.mood = clamp(x.mood + fx.mood, 0, 100));
  if (fx.cond) (fx.mood != null || fx.money ? KA.members(S, g) : [m]).forEach(x => x.cond = clamp(x.cond + fx.cond, 0, 100));
  if (fx.fans) g.fans += KA.damp(g, Math.round(fx.fans * (1 + KA.fameTier(g.fans) * .5)));
  if (fx.money) S.money += fx.money * (fx.money > 0 ? 1 + KA.fameTier(g.fans) * .3 : 1);
  if (fx.trust) g.trust = clamp(g.trust + fx.trust, 0, 100);
  if (fx.rest && m) { m.rest = fx.rest; }
  if (fx.flag === 'writer' && m) { m.flags = m.flags || {}; m.flags.writer = true; m.stats.rap = clamp(m.stats.rap + 4, 0, 99); }
  if (fx.risk === 'injury' && m && R() < .35) { m.rest = 4; return `${m.name}'s injury got worse. Four weeks of rest.`; }
  return 'Done.';
};

// ------------------------------------------------------------------ awards
function realYear(r, cat) {
  const p = r.pop * rf(.85, 1.12);
  return { sales: p * p * p * 1.6, pts: p * p * 340, fans: p * p * p * 25, wins: Math.round(p / 12), song: p * p * 80 };
}
KA.runAward = function (S, awid, stage) {
  const A = D.AWARDS.find(a => a.id === awid), y = KA.year(S);
  const stageCost = [0, 3e7, 1.2e8][stage | 0] || 0;
  const mine = KA.debuted(S).concat(S.groups.filter(g => g.status === 'predebut' && false));
  if (S.money >= stageCost) S.money -= stageCost;
  const stageB = [1, 1.08, 1.18][stage | 0] || 1;
  const pool = D.REAL.map(r => Object.assign({ n: r.n, real: true }, realYear(r)));
  S.rivals.forEach(r => pool.push(Object.assign({ n: r.n }, { sales: r.pop * r.pop * r.pop * 1.2, pts: r.pop * r.pop * 260, fans: r.pop * r.pop * r.pop * 15, wins: Math.round(r.pop / 15), song: r.pop * r.pop * 60 })));
  mine.forEach(g => { const Y = g.year[y] || { sales: 0, pts: 0, wins: 0, best: 0 }; pool.push({ n: g.name, us: true, gid: g.id, sales: Y.sales * stageB, pts: Y.pts * stageB, fans: g.fans * (.5 + g.trust / 100) * stageB, wins: Y.wins, song: Y.best * stageB, rookie: g.debutYear === y, dance: KA.groupStat(S, g, 'dance'), vocal: KA.groupStat(S, g, 'vocal') }); });
  const rookies = S.rookies.map(r => ({ n: r.n, sales: r.pop * r.pop * 30 * rf(.7, 1.3), pts: r.pop * r.pop * 120 * rf(.7, 1.3), fans: r.pop * r.pop * 400, rookie: true })).concat(pool.filter(p => p.rookie));
  const total = p => p.sales * 1.2 + p.pts * 1 + p.fans * .03 + p.wins * 40000;
  const res = [];
  for (const cat of A.cats) {
    let list, key, multi = 1;
    if (/New|Rookie/.test(cat)) { list = rookies; key = p => p.sales + p.pts * 1.5 + p.fans * .05; }
    else if (/Dance/.test(cat)) key = p => (p.pts + p.sales) * (p.dance ? p.dance / 55 : rf(.8, 1.2));
    else if (/Vocal/.test(cat)) key = p => (p.pts + p.sales) * (p.vocal ? p.vocal / 55 : rf(.8, 1.2));
    else if (/Fans|Popularity/.test(cat)) key = p => p.fans * rf(.85, 1.15);
    else if (/Song|Record|Digital/.test(cat)) key = p => p.song * 5 + p.pts;
    else if (/Album/.test(cat)) key = p => p.sales;
    else if (/Bonsang|Top 10|Main Prize/.test(cat)) { key = total; multi = 10; }
    else key = total;
    list = (list || pool).slice().map(p => ({ p, v: key(p) * rf(.94, 1.06) })).sort((a, b) => b.v - a.v);
    const noms = list.slice(0, multi > 1 ? 12 : 5);
    const winners = list.slice(0, multi).map(x => x.p.n);
    const usWon = list.slice(0, multi).filter(x => x.p.us);
    const usNom = noms.filter(x => x.p.us);
    res.push({ cat, noms: noms.slice(0, multi > 1 ? 12 : 5).map(x => ({ n: x.p.n, us: !!x.p.us })), winners, multi, won: usWon.map(x => x.p.n), nom: usNom.map(x => x.p.n) });
    for (const x of usWon) {
      const g = KA.group(S, x.p.gid); g.fans += KA.damp(g, Math.round(15000 * (1 + KA.fameTier(g.fans)))); S.rep += 50;
      S.awards.push({ y, show: A.short, cat, g: g.name });
      KA.ach(S, 'bonsang'); if (/Daesang|of the Year/.test(cat) && !/New|Rookie/.test(cat)) KA.ach(S, 'daesang'); if (/New|Rookie/.test(cat)) KA.ach(S, 'rookie');
    }
  }
  mine.forEach(g => { g.fans += KA.damp(g, 3000 * stageB * (1 + KA.fameTier(g.fans))); });
  log(S, `${A.n} ${y}: ${res.filter(r => r.won.length).length ? res.filter(r => r.won.length).map(r => r.cat).join(', ') : 'no wins this time'}.`, '🏆');
  return { A, res };
};

// ------------------------------------------------------------------ contracts
KA.renew = function (S, gid, yes) {
  const g = KA.group(S, gid); if (!g) return;
  if (!yes) { KA.disband(S, gid); return { msg: `${g.name} disbanded after seven years.` }; }
  const ms = KA.members(S, g).filter(m => m.status === 'idol');
  const cost = Math.round(5e7 * ms.length * (1 + KA.fameTier(g.fans)));
  if (S.money < cost) return { msg: `Renewal costs ${KA.won(cost)}. Not enough money.`, fail: true };
  S.money -= cost; const left = [];
  ms.forEach(m => { if (m.mood < 40 && R() < .6) { m.status = 'left'; left.push(m.name); } });
  g.members = g.members.filter(id => S.idols[id].status === 'idol');
  if (!g.members.length) { KA.disband(S, gid); return { msg: 'Nobody renewed. The group disbanded.' }; }
  g.contract = S.week + 5 * KA.WPY; g.trust = clamp(g.trust + 10, 0, 100); KA.ach(S, 'renew');
  log(S, `${g.name} renewed their contracts${left.length ? ` (${left.join(', ')} left)` : ' with every member'}.`, '📝');
  return { msg: left.length ? `${left.join(', ')} chose not to renew. The rest signed for five more years.` : 'Everyone renewed! Fans are crying happy tears.' };
};

// ------------------------------------------------------------------ achievements
KA.ach = function (S, id) {
  if (!id || S.ach[id] != null) return; S.ach[id] = S.week; const A = D.ACH.find(a => a.id === id); if (A) q(S, { k: 'ach', id });
};

// ------------------------------------------------------------------ the weekly turn
KA.endWeek = function (S) {
  if (S.over) return;
  const reports = { sched: [] };
  // trainees train
  for (const i of KA.trainees(S)) { if (S.show && S.show.ids.includes(i.id)) { i.weeks++; continue; } trainWeek(S, i); }
  // groups
  for (const g of KA.active(S)) {
    const ms = KA.members(S, g);
    if (g.status === 'predebut') { ms.forEach(m => { growth(S, m, pick(['vocal', 'dance', 'rap', 'visual']), 1.5); m.cond = clamp(m.cond + 4, 0, 100); }); continue; }
    if (g.hiatus > 0) { g.hiatus--; g.sched = []; ms.forEach(m => { m.cond = clamp(m.cond + 20, 0, 100); m.mood = clamp(m.mood + 6, 0, 100); }); continue; }
    const s = runSchedules(S, g); if (s.length) reports.sched.push({ g: g.name, items: s });
    contentWeek(S, g); tourWeek(S, g);
    const busy = s.length || g.tour || g.content;
    ms.forEach(m => {
      if (m.rest > 0) { m.rest--; m.cond = clamp(m.cond + 15, 0, 100); }
      m.cond = clamp(m.cond + (busy ? 4 : 12) + S.rooms.dorm * 2 + S.rooms.gym, 0, 100);
      m.mood = clamp(m.mood + (m.cond < 30 ? -3 : 1), 0, 100);
      growth(S, m, pick(['vocal', 'dance', 'rap', 'visual', 'variety', 'stamina']), busy ? .5 : 1.2);
    });
    g.lowCond = KA.groupCond(S, g) < 28 ? g.lowCond + 1 : 0;
    if (g.promo && S.week - g.promo.start >= g.promo.len) g.promo = null;
    // contract
    if (g.contract && S.week >= g.contract && !g.flags.renewAsked) { g.flags.renewAsked = true; q(S, { k: 'renew', gid: g.id }); }
    g.fans = Math.round(g.fans * (1 + (g.trust - 50) / 60000));
  }
  // advance time
  S.week++;
  // releases
  for (const a of S.albums) if (a.status === 'upcoming' && a.release <= S.week) releaseAlbum(S, a);
  for (const a of S.albums) if (a.status === 'out' && S.week - a.released < 30) albumWeek(S, a);
  realWeek(S); KA.updateChart(S);
  const top = S.chart[0];
  if (top && top.us) { KA.ach(S, 'chart1'); if (S.streak.id === top.key) S.streak.n++; else S.streak = { id: top.key, n: 1 }; if (S.streak.n >= 4) KA.ach(S, 'allkill'); } else S.streak = { id: null, n: 0 };
  const ms = musicShow(S); if (ms) q(S, Object.assign({ k: 'mshow' }, ms));
  // survival show
  if (S.show) showEpisode(S);
  // fans
  snsWeek(S); requestsWeek(S); hateWeek(S); randomEvent(S);
  // month start: bills and evaluations
  if (S.week % 4 === 0) {
    const c = KA.monthlyCost(S); S.money -= c; if (KA.payLoans) KA.payLoans(S);
    q(S, { k: 'bills', cost: c });
    monthlyEval(S);
    for (const i of Object.values(S.idols)) if (i.status !== 'left' && S.week % KA.WPY === 0) i.age++;
  }
  // awards in December
  const wy = KA.woy(S);
  for (const A of D.AWARDS) if (wy === A.week && KA.debuted(S).length) { q(S, { k: 'award', id: A.id }); if (!S.tips.awards) S.tips.awards = 'pending'; }
  if (wy === 1 && S.week > 0) { S.rookies = D.FICTIONAL_ROOKIES.map(r => ({ n: r.n, g: r.g, pop: ri(20, 60) })); q(S, { k: 'newyear', y: KA.year(S) }); }
  // fame achievements and rank
  for (const g of KA.debuted(S)) { const t = KA.fameTier(g.fans); if (t >= 4) KA.ach(S, 'fame4'); if (t >= 6) KA.ach(S, 'fame6'); if (t > (g.maxTier || 0)) { g.maxTier = t; if (t > 0) q(S, { k: 'fame', gid: g.id, t }); } }
  const br = KA.brand(S); if (br[0] && br[0].us) KA.ach(S, 'brand1');
  const rk = KA.rank(S); if (rk >= 4) KA.ach(S, 'big4'); if (rk > (S.maxRank || 0)) { S.maxRank = rk; q(S, { k: 'rank', r: rk }); }
  if (S.money >= 1e10) KA.ach(S, 'billion');
  // money trouble is handled in more.js (grace months, bank loans and a one-time rescue)
  return reports;
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
