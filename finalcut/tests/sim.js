// Headless simulation: an automatic player runs whole careers to catch crashes and check balance.
// Usage: node tests/sim.js [runs] [years]
require('../data.js'); require('../engine.js');
const FC = globalThis.FC, D = globalThis.FCD;
const runs = +process.argv[2] || 5, years = +process.argv[3] || 25;
const stories = D.STORIES.map(s => s.id);
const sum = [];
for (let r = 0; r < runs; r++) {
  const S = FC.newGame({ name: 'Sim ' + r, story: stories[r % stories.length], traits: ['charming', 'method'], goal: 'oscar', cat: r % 2 ? 's' : 'a' });
  const M = {};
  for (let w = 0; w < years * 52 && !S.ended; w++) {
    // agency upgrades
    for (const a of D.AGENCIES.slice().reverse()) if (a.tier > FC.tier(S) && FC.starPower(S) >= a.need) { FC.signAgency(S, a.id); break; }
    if (S.fame > 20 && !S.team.publicist && S.money > 1e5) FC.hire(S, 'publicist', 1);
    // audition for the biggest role we can
    const board = S.board.slice().sort((a, b) => (FC.SIZES[b.size].pay - FC.SIZES[a.size].pay));
    for (const p of board) {
      if (S.energy < 30) break;
      if (!FC.canSign(S, p).ok) break;
      const set = FC.auditionSetup(S, p.id);
      if (S.energy > 50) FC.prep(S, p.id);
      FC.audition(S, p.id, { setup: set, tones: set.beats.map(b => Math.random() < 0.7 ? b.ans : 'grounded'), chem: 'play', screen: 'presence' });
    }
    for (const o of (S.offers || []).slice()) {
      if (o.expires < S.week && !o.contracted) continue;
      const d = FC.dealFor(S, o); const ask = Object.assign({}, d.base, { salary: Math.round(d.base.salary * 1.15), points: Math.min(d.max.points, 2) });
      const res = FC.negotiate(S, o.id, ask);
      if (res.result === 'accept') FC.sign(S, o.id, res.terms); else if (res.result === 'counter') FC.sign(S, o.id, res.counter);
    }
    if (S.health < 55) FC.doActivity(S, 'rest');
    while (S.energy > 40 && S.weekActs < 3) { const a = ['class', 'gym', 'stunt', 'improv', 'network', 'accent'][Math.floor(Math.random() * 6)]; if (!FC.doActivity(S, a).ok) break; }
    for (const m of S.inbox.slice()) FC.answerInbox(S, m.id, 'yes');
    if (FC.campaignable(S).length && S.money > 2e6) FC.campaign(S, FC.campaignable(S)[0].id, 250000);
    if (!S.company && S.fame >= 40 && S.money > 5e6) FC.startCompany(S);
    if (S.company && S.scripts.length && S.money > 3e6 && Math.random() < 0.05) FC.develop(S, { script: S.scripts[0].id, budget: 'indie', star: true, direct: Math.random() < 0.5 });
    if (S.company && S.weekActs < 5 && S.energy > 30 && Math.random() < 0.2) FC.doActivity(S, 'write');
    FC.autoWork(S, 'all'); FC.endWeek(S); FC.autoResolve(S);
    const y = Math.round(S.week / 52 * 10) / 10; M.lead = M.lead || (S.credits.some(c => c.size === 'lead') && y); M.fr = M.fr || (S.myChars.length && y); M.f50 = M.f50 || (S.fame >= 50 && y); M.mil = M.mil || (S.money >= 1e6 && y); M.osc = M.osc || (S.awards.some(a => a.show === 'oscars') && y);
    if (!isFinite(S.money) || isNaN(S.fame)) { console.log(JSON.stringify({ money: S.money, fame: S.fame, followers: S.followers, log: S.log, studios: S.studios }).slice(0, 800)); throw new Error('NaN state at week ' + S.week); }
  }
  if (!S.ended) FC.retire(S);
  const wins = S.awards.filter(a => a.won && a.weight);
  sum.push({ story: S.me.story, yrs: Math.round(S.week / 52), credits: S.credits.length, leads: S.credits.filter(c => c.size === 'lead').length, fran: S.myChars.length, fame: Math.round(S.fame), sp: FC.starPower(S),
    money: FC.money(S.money), bo: FC.money(S.lifetimeBO), noms: S.awards.length, wins: wins.length, agency: S.agency, end: S.ended.t, ach: Object.keys(S.achievements).length, burn: S.burnouts, earnPeak: FC.money(Math.max(0, ...S.yearEarnHist.map(y => y.earn))), ...M });
}
console.table(sum);
