/* The Eras Life: long-term goals (engine side).
   - A year-end recap every January.
   - A legacy score, an ending that depends on how your career went, and a Hall of Fame across saves.
   - Scenarios: challenges with their own goal and a best score.
   - Rivals with storylines: invented rival stars who compete with you, or become friends.
   - More achievements for the newer features.
   Rival stars are invented. Nothing here is said or done by a real person. */
(function () {
const ER = window.ER, G = window.G;
const S = () => G.S(), pick = G.pick, clamp = G.clamp;

/* ---------- Year in review ---------- */
G.yearRecap = function (y) {
  const s = S(), Y = (s.years || {})[y]; if (!Y) return null;
  const inYear = a => a != null && ER.yw(a).y === y;
  const songs = Object.keys(s.songs).filter(t => inYear(s.songs[t].relAbs || (s.songs[t].st === 'released' ? s.songs[t].rabs : null))).sort((a, b) => s.songs[b].q - s.songs[a].q).slice(0, 5);
  const loop = s.loop && s.loop.total ? Object.keys(s.loop.total).sort((a, b) => s.loop.total[b] - s.loop.total[a]).slice(0, 3) : [];
  const shows5 = Object.values(s.pj).reduce((n, pj) => n + (pj.diary || []).filter(d => inYear(d.abs) && d.stars === 5).length, 0);
  return { y, fans:s.stats.fans - (Y.fans0 || 0), money:s.stats.money - (Y.money0 || 0), units:Y.units || 0, gross:Y.gross || 0, shows:Y.shows || 0, shows5,
    awards:s.awards.filter(a => inYear(a.abs)).map(a => a.n), releases:s.released.filter(r => inYear(r.abs)).map(r => (G.proj(r.pid) || {}).title).filter(Boolean),
    songs:songs.length ? songs : loop, moments:(s.journal || []).filter(j => inYear(j.abs)).slice(-40).filter((j, i, a) => i % Math.max(1, Math.floor(a.length / 4)) === 0).slice(0, 4).map(j => j.t),
    no1:s.charts.singles.filter(c => inYear(c.abs) && c.peak === 1).map(c => c.t) };
};
G.hooks.week.push(a => { const s = S(), yw = ER.yw(a); if (yw.w === 1 && a > G.art().startAbs + 10) { s.recapYear = yw.y - 1; s.recapSeen = false; } });

/* ---------- Legacy score, endings and the Hall of Fame ---------- */
G.legacyScore = function () { const c = G.careerSummary();
  const sc = Math.log10(Math.max(10, c.fans)) * 60 + c.awards * 12 + c.aoty * 40 + c.no1 * 18 + c.albums * 15 + Math.log10(Math.max(1, c.gross)) * 25 + c.own * 1.5 + c.years * 4;
  return Math.round(sc); };
ER.ENDINGS = [
  { min:1400, n:'A once-in-a-generation career', x:'Decades from now, songwriters will still study what you made. Your songs became part of people\'s lives.' },
  { min:1000, n:'A legend', x:'Stadiums, awards and a catalog that keeps finding new listeners. You did it your way.' },
  { min:750, n:'A star who lasted', x:'Not every album was a smash, but the fans stayed for all of it.' },
  { min:500, n:'A cult favourite', x:'Not the biggest name in the world, but the most loved by the people who found you.' },
  { min:0, n:'The one who tried', x:'It never quite broke big. The songs are still yours, and someone out there knows every word.' } ];
G.ending = function () { const sc = G.legacyScore(), c = G.careerSummary(), e = ER.ENDINGS.find(x => sc >= x.min);
  const trait = c.aoty >= 3 ? 'The one critics always crowned.' : c.gross > 1e9 ? 'The greatest live act of your time.' : c.own >= 80 ? 'You owned everything you made.' : c.invented >= 10 ? 'You never stopped reinventing yourself.' : c.canon >= 95 && S().mode === 'story' ? 'You lived the story as it really happened.' : 'Entirely your own path.';
  return { score:sc, n:e.n, x:e.x, trait }; };
G.hof = () => { try { return JSON.parse(G.lsGet('eras-hof') || '[]'); } catch (e) { return []; } };
G.addToHof = function () { const s = S(), e = G.ending(), list = G.hof().filter(x => x.key !== s.created + ':' + s.slot);
  list.push({ key:s.created + ':' + s.slot, name:G.art().name, score:e.score, ending:e.n, trait:e.trait, year:ER.yw(s.abs).y, at:Date.now(), canon:G.canon(), own:!!G.art().invented });
  list.sort((a, b) => b.score - a.score); G.lsSet('eras-hof', JSON.stringify(list.slice(0, 20))); G.ach('hof'); return list; };
const retire0 = G.retire;
G.retire = function () { const r = retire0.apply(this, arguments); try { G.addToHof(); } catch (e) {} return r; };

/* ---------- Scenarios ---------- */
ER.SCENARIOS = [
  { id:'broke', n:'Start broke', d:'No money, a small team. Reach $10M as fast as you can.', setup:s => { s.stats.money = 0; s.stats.team = 40; }, done:s => s.stats.money >= 1e7, goal:'Reach $10M' },
  { id:'stadium', n:'Speedrun to a stadium', d:'Get a stadium tour approved as fast as you can.', setup:() => {}, done:s => Object.values(s.pj).some(p => p.tour && p.tour.approved && p.tour.tier === 'stadium'), goal:'Get a stadium tour approved' },
  { id:'number1', n:'One shot at No. 1', d:'Your first album has to debut at No. 1.', setup:() => {}, done:s => s.released.some(r => r.debutPos === 1), fail:s => s.released.length >= 1 && !s.released.some(r => r.debutPos === 1), goal:'A No. 1 album debut' },
  { id:'solo', n:'No team', d:'You cannot hand tasks to your team. Win ten awards.', setup:s => { s.flags.noTeam = true; }, done:s => s.awards.length >= 10, goal:'Win ten awards' },
  { id:'million', n:'A million fans', d:'Get to a million fans as fast as you can.', setup:() => {}, done:s => s.stats.fans >= 1e6, goal:'Reach a million fans' } ];
G.startScenario = function (id) { const s = S(), sc = ER.SCENARIOS.find(x => x.id === id); if (!sc) return; s.scen = { id, start:s.abs, done:false }; sc.setup(s); G.inbox('manager', `Scenario: ${sc.n}`, `${sc.d} The clock starts now.`); };
G.scenBest = () => { try { return JSON.parse(G.lsGet('eras-scen-best') || '{}'); } catch (e) { return {}; } };
G.hooks.week.push(a => { const s = S(), x = s.scen; if (!x || x.done || x.failed) return; const sc = ER.SCENARIOS.find(y => y.id === x.id); if (!sc) return;
  if (sc.done(s)) { x.done = true; x.weeks = a - x.start; const best = G.scenBest(), key = x.id + ':' + s.artist, prev = best[key];
    if (!prev || x.weeks < prev) { best[key] = x.weeks; G.lsSet('eras-scen-best', JSON.stringify(best)); }
    G.inbox('manager', `Scenario complete: ${sc.n}`, `Done in ${x.weeks} weeks${prev ? (x.weeks < prev ? `, a new best (was ${prev})` : ` (your best is ${prev})`) : ''}.`); G.ach('scenario'); G.journalAdd(`Scenario complete: ${sc.n}`, `${x.weeks} weeks.`); }
  else if (sc.fail && sc.fail(s)) { x.failed = true; G.inbox('manager', `Scenario over: ${sc.n}`, 'It did not happen this time. You can keep playing the career.'); } });
const canDel0 = G.canDelegate;
G.canDelegate = t => !(S() && S().flags.noTeam) && canDel0(t);

/* ---------- Rival storylines ---------- */
G.rivalry = () => { const s = S(); s.rivalry = s.rivalry || {}; ER.RIVAL_STARS.forEach(n => { if (s.rivalry[n] == null) s.rivalry[n] = 0; }); return s.rivalry; };
G.rivalWord = v => v >= 40 ? 'Close friends' : v >= 15 ? 'Friendly' : v > -15 ? 'Neutral' : v > -40 ? 'Rivals' : 'Bitter rivals';
const RV = [
  { k:'sameweek', t:'{r} moves an album to your release week', x:'{r} (an invented star in this game) just announced a release date the same week as yours.', when:['pre','finish'], ch:[
    { l:'Hold your date', cost:0, fx:{ hype:4, heat:3 }, rv:-12, r:'A chart battle is on.' }, { l:'Wish them luck publicly', cost:0, fx:{ rep:2 }, rv:10, r:'Fans love the sportsmanship.' }] },
  { k:'duet', t:'{r} wants to work with you', x:'{r} (invented) asks you to write a song together.', when:'any', minAge:17, ch:[
    { l:'Write it together', cost:2, fx:{ write:2, fans:1.2, clout:2 }, rv:18, song:1, r:'A song for both of you goes in your notebook.' }, { l:'Not now', cost:0, fx:{}, rv:-4, r:'They understand. Mostly.' }] },
  { k:'awards', t:'You and {r} are up for the same award', x:'You and {r} (invented) are in the same category this year.', when:'any', minAge:16, pub:1, ch:[
    { l:'Congratulate them first', cost:0, fx:{ rep:2 }, rv:10, r:'The clip of you two hugging goes everywhere.' }, { l:'Stay quiet and focused', cost:0, fx:{ heat:1 }, rv:-3, r:'The press reads into it anyway.' }] },
  { k:'interview', t:'{r} talks about you in an interview', x:'In an interview, {r} (invented) says your new music "just is not for them".', when:'any', minAge:16, pub:1, ch:[
    { l:'Answer with a song', cost:2, fx:{ heat:6, write:2, hype:3 }, rv:-15, song:1, r:'A pointed new song goes in your notebook. Fans decode it in minutes.' }, { l:'Take the high road', cost:0, fx:{ rep:3 }, rv:4, r:'You say you wish her well. Classy.' }] },
  { k:'tour', t:'{r} asks you to join their tour', x:'{r} (invented) invites you on stage for one night of their tour.', when:'any', minAge:16, live:1, ch:[
    { l:'Join them on stage', cost:1, fx:{ fans:1.5, energy:-5 }, rv:14, r:'The crowd cannot believe it.' }, { l:'Send flowers instead', cost:0, fx:{ rep:1 }, rv:3, r:'They post a photo of the flowers.' }] } ];
ER.RIVAL_STARS.forEach(n => RV.forEach(t => ER.OPPS.push({ id:`rv_${t.k}_${n.split(' ')[0].toLowerCase()}`, rival:n, t:t.t.replace('{r}', n), x:t.x.replace('{r}', n), when:t.when, minAge:t.minAge, pub:t.pub, live:t.live,
  ch:t.ch.map(c => Object.assign({}, c, { r:c.r })) })));
const take0 = G.takeOpp;
G.takeOpp = function (uid, ci) { const s = S(), x = (s.opps || []).find(y => y.uid === uid), o = x && ER.OPPS.find(y => y.id === x.id), c = o && o.ch[ci];
  const r = take0.apply(this, arguments); if (r && r.ok && o && o.rival && c && c.rv) { const R = G.rivalry(); R[o.rival] = clamp(R[o.rival] + c.rv, -100, 100); r.lines.push(`${o.rival}: ${G.rivalWord(R[o.rival])}.`); } return r; };

/* ---------- More achievements ---------- */
Object.assign(G.ACH, { ownsong:'A song of your own', side:'A side project', residency:'A residency', route10:'Ten cities on one route', merch10k:'Ten thousand shirts', trend:'Trending on Loop',
  perfect:'Nailed the big song', brand:'Your own brand', rivalfriend:'Made a friend of a rival', scenario:'Scenario complete', hof:'Hall of Fame', recap:'Looked back on a year' });
G.hooks.week.push(() => { const s = S();
  if (Object.values(s.songs).some(x => x.own)) G.ach('ownsong');
  if ((s.custom || []).some(p => p.side && s.pj[p.id] && s.pj[p.id].released)) G.ach('side');
  if ((s.bookings || []).some(b => b.kind === 'residency' && b.played >= 4)) G.ach('residency');
  if (Object.values(s.pj).some(p => p.tour && (p.tour.route || []).length >= 10)) G.ach('route10');
  if ((s.merch || []).reduce((n, m) => n + m.sold, 0) >= 10000) G.ach('merch10k');
  if (s.loop && s.loop.trend) G.ach('trend');
  if ((s.brands || []).length) G.ach('brand');
  if (s.rivalry && Object.values(s.rivalry).some(v => v >= 40)) G.ach('rivalfriend'); });
const sn0 = G.showNight;
G.showNight = function (sh) { const r = sn0.apply(this, arguments); if (sh && sh.rhythm >= .9) G.ach('perfect'); return r; };
})();
