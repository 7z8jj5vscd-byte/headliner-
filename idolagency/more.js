// K-Pop Idol Agency: extra systems. Loaded after engine.js. Works in the browser and in Node tests.
// Trends, monthly quests, mailbox with brand offers, merch, fan clubs, side businesses, solo jobs,
// member bonds, pre-orders, back-catalog royalties, the bank, money trouble rules and a year-end recap.
(function (root) {
const D = root.KD, KA = root.KA;
const { ri, rf, pick, clamp, avg } = KA.h;
const q = (S, it) => S.q.push(it);
const log = KA.log;

// ------------------------------------------------------------------ data
D.MERCH = [
  { id: 'pc', n: 'Photocard sets', e: '🃏', cost: 5e6, rate: 4, fame: 0 },
  { id: 'ls', n: 'Official lightstick', e: '🔦', cost: 2.5e7, rate: 9, fame: 1 },
  { id: 'sg', n: "Season's greetings", e: '📅', cost: 1.2e7, rate: 5, fame: 1 },
  { id: 'plush', n: 'Character plushies', e: '🧸', cost: 2e7, rate: 7, fame: 2 },
  { id: 'apparel', n: 'Tour apparel', e: '👕', cost: 3e7, rate: 8, fame: 2 },
  { id: 'popup', n: 'Pop-up store', e: '🏪', cost: 8e7, rate: 16, fame: 3 },
  { id: 'collab', n: 'Brand collab line', e: '✨', cost: 2e8, rate: 30, fame: 4 }
];
D.BIZ = [
  { id: 'cafe', n: 'Idol theme café', e: '☕', cost: [3e7, 6e7, 1.2e8], income: [4e6, 9e6, 1.8e7], rank: 0 },
  { id: 'channel', n: 'Agency video channel', e: '📺', cost: [2e7, 5e7, 1e8], income: [2e6, 6e6, 1.4e7], rank: 0, fans: true },
  { id: 'academy', n: 'Dance academy', e: '🩰', cost: [6e7, 1.2e8, 2.5e8], income: [8e6, 1.8e7, 3.5e7], rank: 1, scout: true },
  { id: 'rental', n: 'Studio rental', e: '🎚️', cost: [5e7, 1e8, 2e8], income: [7e6, 1.5e7, 3e7], rank: 1, need: 'studio' },
  { id: 'cosmetics', n: 'Cosmetics brand', e: '💄', cost: [2e8, 4e8, 8e8], income: [2.5e7, 5.5e7, 1.1e8], rank: 2 },
  { id: 'hall', n: 'Concert hall', e: '🏟️', cost: [6e8, 1.2e9, 2.5e9], income: [7e7, 1.5e8, 3e8], rank: 3 }
];
D.SOLO = [
  { id: 'dj', n: 'Radio DJ', e: '📻', stat: 'variety', need: 25, cond: 4, money: 1.5e6, fans: 1200 },
  { id: 'mc', n: 'Music show MC', e: '🎙️', stat: 'variety', need: 35, cond: 5, money: 3e6, fans: 3000 },
  { id: 'model', n: 'Magazine model', e: '📸', stat: 'visual', need: 40, cond: 4, money: 4e6, fans: 2500 },
  { id: 'cover', n: 'Solo cover video', e: '🎧', stat: 'vocal', need: 35, cond: 3, money: 5e5, fans: 2200 },
  { id: 'ost', n: 'Solo drama OST', e: '🎼', stat: 'vocal', need: 50, cond: 4, money: 8e6, fans: 5000 },
  { id: 'dance', n: 'Solo dance film', e: '💃', stat: 'dance', need: 50, cond: 6, money: 2e6, fans: 4500 },
  { id: 'drama', n: 'Web drama role', e: '🎬', stat: 'variety', need: 45, cond: 8, money: 1.2e7, fans: 8000 },
  { id: 'feature', n: 'Featuring on a rap track', e: '🔥', stat: 'rap', need: 45, cond: 3, money: 5e6, fans: 3500 },
  { id: 'musical', n: 'Musical lead', e: '🎭', stat: 'vocal', need: 60, cond: 9, money: 2e7, fans: 7000 },
  { id: 'ambassador', n: 'Solo brand ambassador', e: '👜', stat: 'visual', need: 60, cond: 3, money: 4e7, fans: 9000, pfans: 50000 }
];
D.QUESTS = [
  { id: 'sched', n: 'Book {n} schedules', n2: [3, 6], reward: 1.5e7 },
  { id: 'sign', n: 'Sign {n} trainee', n2: [1, 2], reward: 8e6 },
  { id: 'practice', n: 'Play {n} practice sessions', n2: [2, 4], reward: 6e6 },
  { id: 'req', n: 'Answer {n} fan requests', n2: [2, 3], reward: 1e7 },
  { id: 'content', n: 'Start {n} own content', n2: [1, 2], reward: 1.2e7 },
  { id: 'upgrade', n: 'Build or upgrade {n} room', n2: [1, 2], reward: 1.5e7 },
  { id: 'release', n: 'Plan {n} album', n2: [1, 1], reward: 3e7 },
  { id: 'win', n: 'Win {n} music show', n2: [1, 1], reward: 4e7 },
  { id: 'style', n: 'Restyle {n} idols', n2: [2, 4], reward: 5e6 },
  { id: 'solo', n: 'Do {n} solo jobs', n2: [2, 4], reward: 1.2e7 },
  { id: 'merch', n: 'Launch {n} merch line', n2: [1, 1], reward: 1e7 },
  { id: 'dinner', n: 'Hold {n} team dinner', n2: [1, 1], reward: 6e6 }
];
D.LOANS = [
  { id: 'small', n: 'Small business loan', amt: 1.5e8, months: 18, rate: .12, rank: 0 },
  { id: 'mid', n: 'Bank loan', amt: 4e8, months: 24, rate: .18, rank: 1 },
  { id: 'big', n: 'Investor fund', amt: 1.2e9, months: 30, rate: .25, rank: 2 },
  { id: 'mega', n: 'Venture capital', amt: 4e9, months: 36, rate: .3, rank: 3 }
];
D.BRANDS = ['Lumi Cosmetics', 'Aqua Soda', 'Nova Phones', 'Petal Skincare', 'Rush Sneakers', 'Glow Fried Chicken', 'Starfruit Tea', 'Pixel Games', 'Velvet Perfume', 'Cloud Bank', 'Moon Ramen', 'Prism Eyewear'];
D.ACH.push(
  { id: 'quest', n: 'Busy month', d: 'Finish all three monthly quests.' },
  { id: 'merch', n: 'Merch empire', d: 'Have five merch lines on sale.' },
  { id: 'club', n: 'Members only', d: 'Launch an official fan club.' },
  { id: 'biz', n: 'Side hustle', d: 'Open a side business.' },
  { id: 'solo', n: 'Solo star', d: 'Do 20 solo jobs.' },
  { id: 'debtfree', n: 'Debt free', d: 'Pay off a loan.' },
  { id: 'trend', n: 'Trendsetter', d: 'Release an album that matches the trend.' },
  { id: 'bff', n: 'Best friends', d: 'Two members reach a bond of 90.' }
);
D.TIPS.money = 'We are in the red! Bills still get paid, but if we stay in the red for four months in a row we go bankrupt. Open the Business window for bank loans, merch, a fan club and side businesses that make money every month.';
D.TIPS.quest = 'New monthly quests are up in the Business window. Finish them for cash rewards!';

// ------------------------------------------------------------------ setup / migrate
const _new = KA.newGame;
KA.newGame = function (o) { const S = _new(o); KA.migrateMore(S); S.mail.push({ id: ++S.nid, from: 'Agency association', t: 'Welcome gift', b: 'Congratulations on opening your agency! Here is a small start-up grant.', kind: 'gift', money: 5e7 }); return S; };
const _mig = KA.migrate;
KA.migrate = function (S) { _mig(S); KA.migrateMore(S); return S; };
KA.migrateMore = function (S) {
  S.mail ??= []; S.loans ??= []; S.biz ??= {}; S.quests ??= null; S.qdone ??= 0; S.trend ??= { c: pick(D.CONCEPTS).id, left: ri(6, 10) }; S.red ??= 0; S.rel ??= {}; S.yr ??= { money: S.money, fans: 0, wins: 0, awards: 0, sold: 0 }; S.soloCount ??= 0;
  if (S.debt > 0) { S.loans.push({ id: 'old', n: 'Investor loan', left: S.debt, pay: 1.2e7 }); S.debt = 0; }
  for (const g of S.groups) { g.merch ??= {}; g.club ??= null; }
  for (const i of Object.values(S.idols)) i.solo ??= null;
  if (!S.quests) newQuests(S);
};

// ------------------------------------------------------------------ trends
KA.trend = S => D.CONCEPTS.find(c => c.id === S.trend.c);
function trendWeek(S) {
  S.trend.left--;
  if (S.trend.left <= 0) {
    const old = S.trend.c; let c; do c = pick(D.CONCEPTS).id; while (c === old);
    S.trend = { c, left: ri(6, 10) };
    S.feed.unshift({ h: 'trend_report', t: `New trend alert: ${KA.trend(S).n} concepts are taking over!`, mood: 'neu', likes: ri(2000, 40000), w: S.week });
    log(S, `The trend changed to ${KA.trend(S).n}.`, '🔥');
  }
}
const _plan = KA.planAlbum;
KA.planAlbum = function (S, gid, o) {
  const r = _plan(S, gid, o); if (!r.ok) return r;
  const a = r.album, g = KA.group(S, gid);
  if (a.concept === S.trend.c) { a.q = Math.min(100, a.q + 7); a.mv.hype += 6; a.trend = true; g.buzz += 15; KA.ach(S, 'trend'); }
  a.pre = Math.round((g.fans * rf(.03, .06) + g.buzz * 150) * (D.ALBUM_TYPES.find(t => t.id === a.type).sales) * (a.trend ? 1.3 : 1));
  KA.qProg(S, 'release');
  return r;
};

// ------------------------------------------------------------------ quests
function newQuests(S) {
  const pool = D.QUESTS.filter(x => KA.debuted(S).length || !['win', 'release', 'solo', 'merch', 'sched', 'content', 'req'].includes(x.id));
  const list = []; const used = new Set();
  while (list.length < 3 && used.size < pool.length) { const Q = pick(pool); if (used.has(Q.id)) continue; used.add(Q.id); const n = ri(Q.n2[0], Q.n2[1]); list.push({ id: Q.id, t: Q.n.replace('{n}', n) + (n > 1 && /trainee|room|album|show|line|dinner/.test(Q.n) ? 's' : ''), goal: n, prog: 0, reward: Math.round(Q.reward * (1 + KA.rank(S) * .6) * (n > 1 ? .8 + n * .25 : 1)), done: false }); }
  S.quests = { month: Math.floor(S.week / 4), list };
}
KA.qProg = function (S, id, n = 1) { if (!S.quests) return; for (const x of S.quests.list) if (x.id === id && !x.done) x.prog = Math.min(x.goal, x.prog + n); };
KA.claimQuest = function (S, k) {
  const x = S.quests.list[k]; if (!x || x.done || x.prog < x.goal) return { ok: false };
  x.done = true; S.money += x.reward; S.rep += 5; S.qdone++;
  if (S.quests.list.every(y => y.done)) KA.ach(S, 'quest');
  return { ok: true, msg: `Quest done! +${KA.won(x.reward)}` };
};
const wrapCount = (name, qid, cond = r => r && r.ok) => { const f = KA[name]; KA[name] = function (...a) { const r = f.apply(this, a); if (cond(r, a)) KA.qProg(a[0], qid); return r; }; };
wrapCount('sign', 'sign'); wrapCount('startContent', 'content'); wrapCount('upgradeRoom', 'upgrade'); wrapCount('answerReq', 'req', (r, a) => r && r.ok && a[2]);
const _ts = KA.toggleSched;
KA.toggleSched = function (S, gid, id) { const g = KA.group(S, gid); const had = g && g.sched.includes(id); const r = _ts(S, gid, id); if (r.ok) KA.qProg(S, 'sched', had ? -1 : 1); return r; };

// ------------------------------------------------------------------ mail and brand offers
KA.mailAct = function (S, id, yes) {
  const m = S.mail.find(x => x.id === id); if (!m) return { ok: false };
  S.mail = S.mail.filter(x => x !== m);
  if (m.kind === 'gift') { S.money += m.money || 0; return { ok: true, msg: `Received ${KA.won(m.money || 0)}!` }; }
  if (!yes) return { ok: true, msg: 'Offer declined.' };
  const g = KA.group(S, m.gid); if (!g) return { ok: false, msg: 'That group is gone.' };
  S.money += m.money; g.fans += KA.damp(g, m.fans || 0);
  if (m.weeks) { g.deal = { brand: m.brand, left: m.weeks, cond: m.cond }; }
  log(S, `${g.name} signed with ${m.brand} for ${KA.won(m.money)}.`, '🤝');
  return { ok: true, msg: `Deal signed! +${KA.won(m.money)}` };
};
function mailWeek(S) {
  S.mail = S.mail.filter(m => !m.exp || m.exp > S.week);
  for (const g of KA.debuted(S)) {
    if (g.deal) { g.deal.left--; KA.members(S, g).forEach(m => m.cond = clamp(m.cond - g.deal.cond, 0, 100)); if (g.deal.left <= 0) { log(S, `${g.name}'s ${g.deal.brand} campaign wrapped.`, '📦'); g.deal = null; } }
    if (g.deal || S.mail.filter(m => m.kind === 'offer').length >= 3 || Math.random() > .12 + KA.fameTier(g.fans) * .03) continue;
    const t = KA.fameTier(g.fans), brand = pick(D.BRANDS), weeks = ri(2, 6);
    const money = Math.round(rf(6e6, 1.6e7) * (1 + t * 1.6) * weeks * (KA.members(S, g).some(m => m.trait === 'visual') ? 1.3 : 1));
    S.mail.unshift({ id: ++S.nid, from: brand, kind: 'offer', brand, gid: g.id, weeks, cond: ri(2, 5), money, fans: Math.round(3000 * (1 + t) * weeks), exp: S.week + 3,
      t: `${brand} wants ${g.name}`, b: `A ${weeks}-week campaign. Pay: ${KA.won(money)} up front. Members lose about ${ri(2, 5)} condition each week while it runs.` });
  }
  if (S.week % 16 === 8) S.mail.unshift({ id: ++S.nid, from: 'Fan union', t: 'Fan donation', b: 'Fans pooled money to support the agency\'s next project!', kind: 'gift', money: Math.round(5e6 + S.groups.reduce((a, g) => a + g.fans, 0) * 4) });
}

// ------------------------------------------------------------------ merch and fan clubs
KA.launchMerch = function (S, gid, id) {
  const g = KA.group(S, gid), M = D.MERCH.find(x => x.id === id);
  if (!g || g.status !== 'active') return { ok: false, msg: 'Debut first!' };
  g.merch ??= {};
  if (g.merch[id]) return { ok: false, msg: 'Already on sale.' };
  if (KA.fameTier(g.fans) < M.fame) return { ok: false, msg: `Needs ${D.FAME[M.fame].n} fame.` };
  if (S.money < M.cost) return { ok: false, msg: 'Not enough money.' };
  S.money -= M.cost; g.merch[id] = S.week; if (id === 'ls') g.lightstick = true;
  KA.qProg(S, 'merch'); if (Object.keys(g.merch).length >= 5) KA.ach(S, 'merch');
  log(S, `${g.name} ${M.n.toLowerCase()} went on sale.`, M.e); return { ok: true };
};
KA.merchWeekly = (S, g) => Math.round(Object.keys(g.merch || {}).reduce((a, id) => a + D.MERCH.find(x => x.id === id).rate, 0) * Math.pow(g.fans, .82) * 2.2 * (.5 + g.trust / 100));
KA.launchClub = function (S, gid) {
  const g = KA.group(S, gid); if (!g || g.status !== 'active') return { ok: false, msg: 'Debut first!' };
  if (g.club) return { ok: false, msg: 'Already launched.' };
  if (KA.fameTier(g.fans) < 1) return { ok: false, msg: 'Needs Rookie fame.' };
  if (S.money < 2e7) return { ok: false, msg: 'Launching costs ₩20M.' };
  S.money -= 2e7; g.club = { gen: 1, members: Math.round(g.fans * .02) }; g.trust = clamp(g.trust + 5, 0, 100); KA.ach(S, 'club');
  log(S, `${g.fandom} official fan club, generation 1, is open!`, '💳'); return { ok: true };
};
KA.clubMonthly = g => g.club ? Math.round(g.club.members * 3500) : 0;

// ------------------------------------------------------------------ side businesses
KA.bizCost = (S, id) => { const B = D.BIZ.find(b => b.id === id), lv = S.biz[id] || 0; return lv >= 3 ? null : B.cost[lv]; };
KA.buyBiz = function (S, id) {
  const B = D.BIZ.find(b => b.id === id), c = KA.bizCost(S, id);
  if (c == null) return { ok: false, msg: 'Fully upgraded.' };
  if (KA.rank(S) < B.rank) return { ok: false, msg: `Needs ${D.RANKS[B.rank].n} rank.` };
  if (B.need && !S.rooms[B.need]) return { ok: false, msg: 'Build the recording studio first.' };
  if (S.money < c) return { ok: false, msg: 'Not enough money.' };
  S.money -= c; S.biz[id] = (S.biz[id] || 0) + 1; KA.ach(S, 'biz');
  log(S, `${B.n} ${S.biz[id] === 1 ? 'opened' : 'expanded to level ' + S.biz[id]}.`, B.e); return { ok: true };
};
KA.bizMonthly = S => D.BIZ.reduce((a, B) => a + (S.biz[B.id] ? B.income[S.biz[B.id] - 1] : 0), 0);

// ------------------------------------------------------------------ bank
KA.loanPay = S => (S.loans || []).reduce((a, l) => a + Math.min(l.left, l.pay), 0);
KA.payLoans = function (S) {
  for (const l of S.loans) l.left -= Math.min(l.left, l.pay);
  const done = S.loans.filter(l => l.left <= 0);
  if (done.length) { done.forEach(l => log(S, `Paid off the ${l.n.toLowerCase()}!`, '🏦')); KA.ach(S, 'debtfree'); }
  S.loans = S.loans.filter(l => l.left > 0);
};
KA.debt = S => (S.loans || []).reduce((a, l) => a + l.left, 0);
KA.loanLimit = S => 3e8 * Math.pow(2.6, KA.rank(S));
KA.takeLoan = function (S, id) {
  const L = D.LOANS.find(x => x.id === id);
  if (KA.rank(S) < L.rank) return { ok: false, msg: `Needs ${D.RANKS[L.rank].n} rank.` };
  if (S.loans.some(l => l.id === id)) return { ok: false, msg: 'You already have this loan.' };
  if (KA.debt(S) + L.amt * (1 + L.rate) > KA.loanLimit(S) + L.amt * (1 + L.rate) * .01 && S.loans.length) return { ok: false, msg: 'The bank won\'t lend more until you pay some back.' };
  const total = Math.round(L.amt * (1 + L.rate));
  S.money += L.amt; S.loans.push({ id, n: L.n, left: total, pay: Math.round(total / L.months) });
  log(S, `Took a ${L.n.toLowerCase()}: ${KA.won(L.amt)}. Repay ${KA.won(Math.round(total / L.months))} a month.`, '🏦');
  return { ok: true, msg: `+${KA.won(L.amt)}` };
};
KA.repayAll = function (S, idx) {
  const l = S.loans[idx]; if (!l) return { ok: false };
  if (S.money < l.left) return { ok: false, msg: `You need ${KA.won(l.left)}.` };
  S.money -= l.left; S.loans.splice(idx, 1); KA.ach(S, 'debtfree'); return { ok: true, msg: 'Loan paid off!' };
};

// sell a room level back for half its price when money is tight
KA.sellRoom = function (S, id) {
  const R = D.ROOMS.find(r => r.id === id), lv = S.rooms[id];
  if (!lv || (id === 'office' && lv <= 1)) return { ok: false, msg: 'Nothing to sell here.' };
  const back = Math.round(R.cost[lv - 1] * .5 || 5e6);
  S.rooms[id]--; S.money += back; log(S, `Sold part of the ${R.n.toLowerCase()} for ${KA.won(back)}.`, '🏷️');
  return { ok: true, msg: `+${KA.won(back)}` };
};

// ------------------------------------------------------------------ solo jobs
KA.soloOK = (S, m, J) => m.status === 'idol' && m.stats[J.stat] >= J.need && (!J.pfans || m.fans >= J.pfans);
KA.setSolo = function (S, mid, jid) {
  const m = S.idols[mid]; if (!m) return { ok: false };
  if (!jid || m.solo === jid) { m.solo = null; return { ok: true }; }
  const J = D.SOLO.find(x => x.id === jid);
  if (!KA.soloOK(S, m, J)) return { ok: false, msg: `Needs ${J.stat} ${J.need}${J.pfans ? ' and ' + KA.num(J.pfans) + ' personal fans' : ''}.` };
  const g = KA.group(S, m.gid); if (g && (g.tour || g.hiatus)) return { ok: false, msg: 'The group is busy.' };
  m.solo = jid; return { ok: true };
};
function soloWeek(S, out) {
  for (const m of Object.values(S.idols)) {
    if (!m.solo || m.status !== 'idol') { if (m.solo) m.solo = null; continue; }
    const J = D.SOLO.find(x => x.id === m.solo), g = KA.group(S, m.gid);
    const sk = m.stats[J.stat] / 50, tier = g ? KA.fameTier(g.fans) : 0;
    const money = Math.round(J.money * (1 + tier * .5) * (.6 + sk * .5) * rf(.85, 1.15)), pf = Math.round(J.fans * (1 + tier * .4) * (.6 + sk * .5));
    S.money += money; m.fans += pf; if (g) g.fans += KA.damp(g, pf * .5);
    m.cond = clamp(m.cond - J.cond, 0, 100); m.stats[J.stat] = clamp(m.stats[J.stat] + .6, 0, 99);
    S.soloCount++; KA.qProg(S, 'solo'); if (S.soloCount >= 20) KA.ach(S, 'solo');
    out.push({ n: `${m.name}: ${J.n}`, e: J.e, money, fans: pf });
    m.solo = null;
  }
}

// ------------------------------------------------------------------ bonds between members
const rk = (a, b) => a < b ? a + '-' + b : b + '-' + a;
KA.bond = (S, a, b) => S.rel[rk(a, b)] ?? 50;
KA.addBond = (S, a, b, v) => { const k = rk(a, b); S.rel[k] = clamp((S.rel[k] ?? 50) + v, 0, 100); if (S.rel[k] >= 90) KA.ach(S, 'bff'); return S.rel[k]; };
KA.chem = (S, g) => { const ms = KA.members(S, g).filter(m => m.status === 'idol'); const v = []; for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) v.push(KA.bond(S, ms[i].id, ms[j].id)); return v.length ? avg(v) : 50; };
KA.teamDinner = function (S, gid) {
  const g = KA.group(S, gid); if (!g) return { ok: false };
  if (g.dinner === S.week) return { ok: false, msg: 'Already had dinner this week.' };
  const cost = 2e6 * g.members.length; if (S.money < cost) return { ok: false, msg: 'Not enough money.' };
  S.money -= cost; g.dinner = S.week;
  const ms = KA.members(S, g).filter(m => m.status === 'idol');
  for (let i = 0; i < ms.length; i++) { ms[i].mood = clamp(ms[i].mood + 6, 0, 100); for (let j = i + 1; j < ms.length; j++) KA.addBond(S, ms[i].id, ms[j].id, ri(2, 5)); }
  KA.qProg(S, 'dinner');
  return { ok: true, msg: `Korean BBQ for everyone (${KA.won(cost)}). Bonds and mood went up!` };
};
const LINES_GOOD = ['They stayed up talking all night.', 'They made a dance cover together.', 'They cooked dinner for the dorm.', 'They laughed through a whole live.'];
const LINES_BAD = ['It\'s awkward.', 'They argued over the choreography.', 'They aren\'t talking today.', 'Someone ate the other\'s snacks.'];
function bondWeek(S) {
  const pools = KA.active(S).map(g => KA.members(S, g).filter(m => m.status === 'idol')).concat([KA.trainees(S)]);
  for (const ms of pools) {
    if (ms.length < 2 || Math.random() > .5) continue;
    const a = pick(ms); let b = pick(ms); if (a === b) b = ms.find(x => x !== a);
    const v = Math.random() < .68 ? ri(2, 6) : -ri(2, 6);
    KA.addBond(S, a.id, b.id, v);
    S.feed.unshift({ h: 'dorm_diary', t: `${a.name.split(' ').pop()} & ${b.name.split(' ').pop()} relationship ${v > 0 ? '+' : ''}${v}. ${pick(v > 0 ? LINES_GOOD : LINES_BAD)}`, mood: v > 0 ? 'pos' : 'neg', likes: ri(100, 4000), w: S.week, bond: true });
  }
}
const _live = KA.liveScore;
KA.liveScore = (S, g) => clamp(Math.round(_live(S, g) + (KA.chem(S, g) - 50) / 5), 0, 100);
// personal popularity: members gain fans by lines and visuals while promoting
function popWeek(S) {
  for (const g of KA.debuted(S)) {
    const ms = KA.members(S, g).filter(m => m.status === 'idol'); if (!ms.length) continue;
    const a = g.promo && S.albums.find(x => x.id === g.promo.aid);
    for (const m of ms) {
      const share = a && a.lines[m.id] != null ? a.lines[m.id] / 100 : 1 / ms.length;
      m.fans += Math.round(g.fans * .004 * (share * ms.length * .5 + .5) * (.6 + m.stats.visual / 100 + m.stats.variety / 200) * (g.promo ? 1.5 : 1));
    }
  }
}

// ------------------------------------------------------------------ achievements pay out
const _ach = KA.ach;
KA.achReward = id => { const i = D.ACH.findIndex(a => a.id === id); return Math.round((1e7 + i * 4e6) / 1e6) * 1e6; };
KA.ach = function (S, id) { if (!id || (S.ach && S.ach[id] != null)) return; _ach(S, id); S.money += KA.achReward(id); };

// ------------------------------------------------------------------ calendar
KA.calendar = function (S) {
  const ev = [], w = S.week, woy = KA.woy(S);
  const add = (at, e, t) => { if (at >= w) ev.push({ at, e, t }); };
  add(Math.ceil((w + 1) / 4) * 4, '💸', 'Monthly bills and trainee evaluation');
  for (const A of D.AWARDS) { let at = w - woy + A.week; if (at < w) at += KA.WPY; add(at, '🏆', A.n); }
  for (const a of S.albums) if (a.status === 'upcoming') add(a.release, '💿', `"${a.title}" comes out`);
  for (const g of KA.active(S)) {
    if (g.tour) g.tour.stops.forEach((s, k) => { if (!s.done) add(w + 1 + k - g.tour.at, '🎤', `${g.name} in ${s.city}`); });
    if (g.promo) add(g.promo.start + g.promo.len, '📺', `${g.name} promotions end`);
    if (g.content) add(w + g.content.left, '📹', `${g.name} content comes out`);
    if (g.contract) add(g.contract, '📝', `${g.name} contract renewal`);
    if (g.deal) add(w + g.deal.left, '🤝', `${g.name} x ${g.deal.brand} campaign ends`);
  }
  if (S.show) add(w + 1, '📺', `${D.SHOW_NAME}: ${(D.SHOW_EPISODES[S.show.ep] || {}).n || ''}`);
  add(w + S.trend.left, '🔥', 'The trend changes');
  add(Math.ceil((w + 1) / 4) * 4, '📜', 'New monthly quests');
  return ev.sort((a, b) => a.at - b.at).slice(0, 14);
};

// ------------------------------------------------------------------ the weekly turn, extended
const _end = KA.endWeek;
KA.endWeek = function (S) {
  KA.migrateMore(S);
  const solo = []; soloWeek(S, solo);
  const wasMonth = (S.week + 1) % 4 === 0;
  const wins0 = S.stats.wins;
  const rep = _end(S);
  if (solo.length) rep.sched.push({ g: 'Solo jobs', items: solo });
  // weekly income: merch and back catalog
  const inc = [];
  for (const g of KA.debuted(S)) { const m = KA.merchWeekly(S, g); if (m > 0) { S.money += m; inc.push({ n: `${g.name} merch sales`, e: '🛍️', money: m, fans: 0 }); } }
  const cat = S.albums.filter(a => a.status === 'out' && S.week - a.released >= 30).reduce((t, a) => t + Math.round(a.ptsTotal * .0025 + a.sales * 8), 0);
  if (cat > 0) { S.money += cat; inc.push({ n: 'Back-catalog royalties', e: '💿', money: cat, fans: 0 }); }
  if (inc.length) rep.sched.push({ g: 'Income', items: inc });
  if (S.stats.wins > wins0) KA.qProg(S, 'win', S.stats.wins - wins0);
  // pre-orders count toward first-week sales
  for (const a of S.albums) if (a.status === 'out' && a.released === S.week && a.pre && !a.preIn) { a.preIn = true; a.sales += a.pre; S.money += a.pre * 4000; S.stats.sold += a.pre; }
  trendWeek(S); bondWeek(S); popWeek(S); mailWeek(S);
  // monthly: fan clubs, businesses, quests
  if (S.week % 4 === 0) {
    let m = KA.bizMonthly(S); const lines = [];
    if (m) lines.push({ n: 'Side businesses', e: '🏢', money: m, fans: 0 });
    for (const g of KA.debuted(S)) if (g.club) { g.club.members = Math.round(g.club.members * .9 + g.fans * .025 * (g.trust / 70)); const c = KA.clubMonthly(g); m += c; lines.push({ n: `${g.fandom} fan club (${KA.num(g.club.members)} members)`, e: '💳', money: c, fans: 0 }); }
    if (S.biz.channel) for (const g of KA.debuted(S)) g.fans += KA.damp(g, 2000 * S.biz.channel);
    S.money += m; if (lines.length) rep.sched.push({ g: 'Monthly income', items: lines });
    newQuests(S); if (!S.tips.quest) S.tips.quest = 'pending';
  }
  // year-end recap
  if (KA.woy(S) === 1 && S.week > 0) {
    const y = KA.year(S) - 1, fans = S.groups.reduce((a, g) => a + g.fans, 0);
    q(S, { k: 'recap', y, money: S.money - S.yr.money, fans: fans - S.yr.fans, wins: S.stats.wins - S.yr.wins, awards: S.awards.filter(a => a.y === y).length, sold: S.stats.sold - S.yr.sold, best: S.groups.map(g => g.year[y] && g.year[y].bestT ? `"${g.year[y].bestT}" by ${g.name}` : null).filter(Boolean) });
    S.yr = { money: S.money, fans, wins: S.stats.wins, awards: S.awards.length, sold: S.stats.sold };
  }
  // money trouble: four months in the red in a row ends the game, with a one-time rescue first
  if (S.week % 4 === 0) {
    if (S.money < 0) {
      S.red++;
      if (S.red >= 3 && !(S.flags.rescueAt != null && S.week - S.flags.rescueAt < 2 * KA.WPY)) {
        S.flags.rescueAt = S.week; const need = -S.money + 1.5e8; S.money += need;
        S.loans.push({ id: 'rescue', n: 'Emergency rescue', left: Math.round(need * 1.1), pay: Math.round(need * 1.1 / 36) });
        S.red = 0;
        q(S, { k: 'msg', e: '🦸', t: 'An investor rescued the agency', b: `A big investor covered your debt and added ${KA.won(1.5e8)} to work with. You repay it slowly over three years. An investor will only do this once every two years, so be careful!` });
      } else if (S.red >= 4 && S.money < -1e8) { S.over = 'bankrupt'; q(S, { k: 'over' }); }
      else { q(S, { k: 'msg', e: '💸', t: `In the red: month ${S.red} of 4`, b: `The agency has ${KA.won(S.money)}. If it is still in the red after four month-ends in a row, the agency goes bankrupt. Take a loan in the Business window, book schedules, sell merch or release music.` }); if (!S.tips.money) S.tips.money = 'pending'; }
    } else S.red = 0;
  }
  return rep;
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
