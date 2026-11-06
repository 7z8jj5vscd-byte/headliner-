/* Dream Academy: Story Mode. Batch 3: life after debut.
   Comeback planning, rival groups, the music show race, variety shows, units and solos, collabs,
   world tours, merch, endorsements, award campaigns and money. All artists, brands and shows are invented. */
(function () {
const D = window.DA, G = window.G;
const { q, log, feed, grow, chance, pick, clamp, r1, rnd } = G._;
const S = () => G.S();
const n = id => G.name(id);
const R = (who, t, mv) => [who, t, mv];
const C = () => { const s = S(); s.car = s.car || { money:0, rivals:null, tour:null, merch:[], units:[], solo:null, collabs:[], ledger:[] }; return s.car; };
const earn = (amt, why) => { const c = C(); c.money = Math.round(c.money + amt); c.ledger.unshift({ m:S().month, amt:Math.round(amt), why }); if (c.ledger.length > 40) c.ledger.length = 40; };
G.money = () => C().money;
G.fmtMoney = v => (v < 0 ? '−' : '') + '$' + G.fmt(Math.abs(v));
const fan = (id, d) => { const p = G.p(id); p.fan = clamp(p.fan + d, 0, 100); };
const wb = (id, d) => { const p = G.p(id); p.wb = clamp(p.wb + d, 5, 100); };
const bondAll = d => G.activeMembers().forEach(a => G.activeMembers().forEach(b => { if (a < b) G.addBond(a, b, d); }));
D.npcs.RIVAL = { name:'NOVA9 leader', role:'Rival group', look:{ skin:'#efd2b8', hair:'#e6c88a', style:'pony' }, outfit:'#1f3b6b' };
D.npcs.VAR = { name:'Variety host', role:'TV host', look:{ skin:'#b0805e', hair:'#111111', style:'bob' }, outfit:'#c2413b' };

/* ---------- Rival groups ---------- */
const RIVALS = [
  { id:'nova9', name:'NOVA9', base:62, debut:33, color:'#1f3b6b' },
  { id:'lumen', name:'LUMEN', base:58, debut:40, color:'#b39237' },
  { id:'hexa',  name:'HEXA',  base:66, debut:52, color:'#5d8a3a' },
];
function rivals() { const c = C(); if (!c.rivals) c.rivals = RIVALS.map(r => ({ id:r.id, power:r.base, out:false, songs:[], next:r.debut })); return c.rivals; }
G.rivals = () => rivals().map(r => Object.assign({}, RIVALS.find(x => x.id === r.id), r));
function rivalTick() {
  const s = S(), m = s.month;
  rivals().forEach(r => {
    const def = RIVALS.find(x => x.id === r.id);
    if (m >= r.next) {
      r.power = clamp(r.power + rnd(-2, 4) + (m > 60 ? .5 : 0), 40, 98);
      const t = pick(D.titleA) + ' ' + pick(D.titleB);
      const peak = clamp(Math.round(110 - r.power - rnd(-8, 8)), 1, 101);
      r.songs.unshift({ t, m, peak }); if (r.songs.length > 8) r.songs.length = 8;
      r.next = m + 5 + Math.floor(Math.random() * 4);
      if (!r.out) { r.out = true; if (r.id === 'nova9') q({ kind:'rivalDebut' }); log(def.name + ' debut with "' + t + '".', 'release'); }
      else log(def.name + ' come back with "' + t + '" (No. ' + (peak > 100 ? '—' : peak) + ').', 'release');
      feed('@chartwatcher', def.name + ' "' + t + '" is out. Comeback war is ON.', 0);
    }
  });
}
G.currentRival = () => { const m = S().month; return G.rivals().filter(r => r.songs[0] && m - r.songs[0].m <= 2).sort((a, b) => b.power - a.power)[0] || null; };
G.rivalPressure = () => { const r = G.currentRival(); return r ? Math.max(0, (r.power - 55) / 2) : 0; };

/* ---------- Tours ---------- */
const REGIONS = [['asia','Asia',6], ['na','North America',7], ['eu','Europe',6], ['latam','Latin America',5], ['oce','Oceania',3]];
const SIZES = { club:{ l:'Clubs', cap:1500, cost:.2 }, hall:{ l:'Halls', cap:5000, cost:.6 }, arena:{ l:'Arenas', cap:15000, cost:1.8 }, stadium:{ l:'Stadiums', cap:50000, cost:5 } };
const PRICE = { low:{ l:'Low', p:55, demand:1.2 }, mid:{ l:'Mid', p:95, demand:1 }, high:{ l:'High', p:180, demand:.7 } };
G.TOUR = { REGIONS, SIZES, PRICE };
const HOME = { 'Philippines':'asia', 'South Korea':'asia', 'Japan':'asia', 'Thailand':'asia', 'United States':'na', 'Switzerland':'eu', 'Sweden':'eu', 'Slovakia':'eu', 'Belarus':'eu', 'Brazil':'latam', 'Argentina':'latam', 'Australia':'oce' };
G.planTour = (size, regions, price) => {
  const s = S(), c = C();
  const cities = []; regions.forEach(rg => { const r = REGIONS.find(x => x[0] === rg); for (let i = 0; i < r[2]; i++) cities.push(rg); });
  const months = Math.max(1, Math.ceil(cities.length / 6));
  const setup = SIZES[size].cost * 1e6;
  c.tour = { size, regions, price, cities, done:0, months, gross:0, sold:0, cap:0, start:s.month, name:(s.group.releases.length ? s.group.releases[s.group.releases.length - 1].era : 'FIRST') + ' TOUR' };
  earn(-setup, 'Tour production');
  s.group.plan = 'tour';
  log('Tour announced: ' + cities.length + ' ' + SIZES[size].l.toLowerCase() + ' across ' + regions.map(r => REGIONS.find(x => x[0] === r)[1]).join(', ') + '.', 'story');
  if (price === 'high' && !s.hate && chance(.45)) G._.startHate('tickets');
  return c.tour;
};
G.tourMonth = Rr => {
  const s = S(), c = C(), t = c.tour; if (!t || t.done >= t.cities.length) return;
  const batch = t.cities.slice(t.done, t.done + 6); t.done += batch.length;
  const homeBonus = rg => G.activeMembers().some(id => HOME[G.CAST[id].from] === rg) ? 1.3 : 1;
  let gross = 0, sold = 0, cap = 0;
  batch.forEach(rg => { const z = SIZES[t.size], pr = PRICE[t.price];
    const demand = s.group.fans * .0016 * pr.demand * homeBonus(rg) * (.7 + s.group.momentum / 150) * rnd(.85, 1.15);
    const tix = Math.round(Math.min(z.cap, demand)); sold += tix; cap += z.cap; gross += tix * pr.p; });
  t.gross += gross; t.sold += sold; t.cap += cap;
  earn(gross * .35, t.name + ' ticket share');
  const fill = sold / cap;
  if (Rr) Rr.lines.push(t.name + ': ' + batch.length + ' shows, ' + Math.round(fill * 100) + '% sold, ' + G.fmtMoney(gross) + ' gross.');
  if (fill < .55) G.activeMembers().forEach(id => wb(id, -3));
  if (t.done >= t.cities.length) { log(t.name + ' wraps: ' + t.cities.length + ' shows, ' + G.fmtMoney(t.gross) + ' gross, ' + Math.round(t.sold / t.cap * 100) + '% sold.', 'story'); S().group.tours++; if (t.size === 'arena' || t.size === 'stadium') S().flags.arena = 1; c.lastTour = t; c.tour = null; S().group.plan = 'recover'; }
};
G.tour = () => C().tour;

/* ---------- Monthly scheduling ---------- */
const _sm = G.storyMonth;
G.storyMonth = m => {
  _sm(m);
  const s = S(); if (!G.debuted()) return;
  rivalTick();
  const promo = G.effectivePlan() === 'promo', c = C();
  if (m >= 34 && promo && chance(.25)) q({ kind:'variety' });
  if (m >= 40 && m % 12 === 7) q({ kind:'collab' });
  if (m >= 38 && chance(.12)) q({ kind:'endorse', b:Math.floor(Math.random() * BRANDS.length) });
  if (m >= 36 && m % 9 === 0) q({ kind:'merch' });
  if ((m + 1) % 12 === 4 && m >= 50) q({ kind:'campaign' });
  if (m === 66) q({ kind:'unit' });
  if (m === 78) q({ kind:'solo' });
  if (m === 72) q({ kind:'rivalRespect' });
  if (m === 88 || m === 112) q({ kind:'jointStage' });
  if (c.units.length && m % 10 === 0) unitRelease();
  // Income that keeps the lights on.
  earn(s.group.fans * .02, 'Streaming and sales');
};
function unitRelease() {
  const c = C(), u = c.units[c.units.length - 1]; if (!u || !u.ids.every(G.inPlay)) return;
  const pw = u.ids.reduce((t, id) => t + G.avg(id), 0) / u.ids.length * .6 + (Math.log10(Math.max(S().group.fans, 1e5)) - 6) * 18 + rnd(-8, 8) + G.dif().chart;
  const pk = clamp(Math.round(110 - pw), 1, 101); u.songs.push({ t:pick(D.titleA) + ' ' + pick(D.titleB), m:S().month, peak:pk });
  u.ids.forEach(id => fan(id, 3)); log('Unit ' + u.name + ' releases a single (No. ' + (pk > 100 ? '—' : pk) + ').', 'release');
}

/* ---------- Comeback planning (wraps the release event) ---------- */
const PRODUCERS = ['Producer Theo', 'Mara Quill', 'the label\'s hit team', 'a Swedish writing camp', 'an indie duo'];
function demos(ev) {
  if (ev.demos) return ev.demos;
  const opts = G.conceptOptions().slice().sort(() => Math.random() - .5).slice(0, 3);
  ev.demos = opts.map(c => ({ cid:c.id, cl:c.l, t:S().flags.hook && Math.random() < .5 ? S().flags.hook : pick(D.titleA) + ' ' + pick(D.titleB), prod:pick(PRODUCERS), bonus:Math.round(rnd(-4, 8)), risk:c.risk }));
  return ev.demos;
}
const BSIDES = () => ['a midtempo R&B track', 'an acoustic ballad', 'a rap-heavy fan song', 'an English-language pop cut', 'a member-written track'];
const _view = G.view;
G.view = ev => {
  if (ev.kind === 'release' && !ev.ready) {
    const s = S(), st = ev.step || 0, d = demos(ev);
    if (st === 0) return { eyebrow:(ev.debut ? 'Debut' : 'Comeback') + ' planning · 1 of 3', title:'Pick the title track', text:'Three demos made the final round. Prep is at ' + Math.round(s.group.prep) + (s.group.prep >= 85 ? ', enough for an EP.' : '.'),
      scene:ev.debut ? null : { set:'studio', cast:['PROD'].concat(G.activeMembers().slice(0, 3)), lines:[R('PROD', 'Three songs. Each one is a different group. Pick the one you want to be for the next six months.'), R(G.activeMembers()[0], 'Play the second one again?', 'talk')] },
      choices:d.map(x => ['"' + x.t + '"', x.cl + ' · by ' + x.prod + (x.risk >= .4 ? ' · divisive' : '')]) };
    if (st === 1) { const b = ev.bs || (ev.bs = BSIDES().sort(() => Math.random() - .5).slice(0, 3));
      return { eyebrow:'Comeback planning · 2 of 3', title:'Pick the B-side', text:'Fans will vote on their favorite B-side after release. Which one makes the cut?', choices:b.map(x => [x.charAt(0).toUpperCase() + x.slice(1)]) }; }
    return { eyebrow:'Comeback planning · 3 of 3', title:'Teaser rollout', text:'How long is the rollout before release day?',
      choices:[['Short: one week', 'No extra cost'], ['Standard: two weeks', 'Momentum +5'], ['Long: a month of teasers', 'Momentum +10, label pressure +5, costs ' + G.fmtMoney(200000)]] };
  }
  return _view(ev);
};
const _choose = G.choose;
G.choose = (ev, i, acc) => {
  if (ev.kind === 'release' && !ev.ready) {
    const s = S(), st = ev.step || 0;
    if (st === 0) { ev.pick = demos(ev)[i]; ev.step = 1; if (s.group.prep < 85) ev.step = 2; G.save(); return '"' + ev.pick.t + '" it is.'; }
    if (st === 1) { ev.bside = ev.bs[i]; ev.step = 2; G.save(); return 'The B-side is ' + ev.bside + '.'; }
    const roll = i; ev.ready = true;
    const d = ev.pick, idx = G.conceptOptions().findIndex(c => c.id === d.cid);
    s.flags.hook = d.t;
    const out = _choose(ev, Math.max(0, idx), acc);
    const r = s.group.releases[s.group.releases.length - 1];
    if (r) { r.power += d.bonus; r.prod = d.prod; r.bside = ev.bside || null; r.rollout = ['short','standard','long'][roll];
      if (roll === 1) s.group.momentum = clamp(s.group.momentum + 5, 0, 100);
      if (roll === 2) { s.group.momentum = clamp(s.group.momentum + 10, 0, 100); s.label = clamp(s.label + 5, 0, 100); earn(-200000, 'Teaser campaign'); }
      if (r.bside) q({ kind:'bsideVote', rid:r.id }); }
    return out;
  }
  return _choose(ev, i, acc);
};

/* ---------- Events ---------- */
const BRANDS = [
  { n:'Volt Energy', fit:['dance','girl','hyper'], d:'an energy drink' }, { n:'Maison Aube', fit:['dark','ballad','unplug'], d:'a luxury fashion house' },
  { n:'Crunchy Stars', fit:['bright','y2k'], d:'a snack brand' }, { n:'Pixel Phone', fit:['weird','hyper','y2k'], d:'a phone maker' }, { n:'Coastline Sport', fit:['dance','latin','disco'], d:'a sportswear label' },
];
const ARTISTS = ['DJ Halcyon', 'Rae Montoya', 'the band Paper Moons', 'rapper K.Vale', 'singer-songwriter June Ito', 'producer duo Twin Signal'];
const _v3 = G.view3;
G.view3 = ev => {
  const s = S(), f = s.focus, F = n(f), c = C();
  switch (ev.kind) {
    case 'rivalDebut': return { eyebrow:'Rival group', title:'NOVA9 debuts', text:'A new girl group from a rival label debuts the same season. Fans have already started comparing.',
      scene:{ set:'stage', cast:['RIVAL', f].concat(G.activeMembers().filter(x => x !== f).slice(0, 2)), lines:[R('N', 'Backstage at a music show. Two groups, one hallway.'), R('RIVAL', 'You\'re ' + s.group.name + ', right? We watched your show. All of it.', 'wave'), R(f, 'Congratulations on your debut.', 'talk'), R('RIVAL', 'See you on the charts.', 'cheer')] },
      choices:[['Wish them luck, genuinely', 'Cohesion +2, fewer fan wars'], ['Treat them as the enemy', 'Momentum +6, more fan wars']] };
    case 'rivalRespect': return { eyebrow:'Rival group', title:'The hallway, years later', text:'NOVA9 and ' + s.group.name + ' have traded first places for years.',
      scene:{ set:'stage', cast:['RIVAL', f], lines:[R('RIVAL', 'Can I tell you something? Every time you came back, we practiced harder.', 'talk'), R(f, 'We used to watch your stages on the van ride home.', 'talk'), R('RIVAL', 'Rivals?', 'clap'), R(f, 'Rivals. The good kind.', 'hug')] },
      choices:[['Exchange numbers', 'Unlocks a joint stage later']] };
    case 'jointStage': return { eyebrow:'Awards night', title:'A joint stage with NOVA9', text:'The awards show pairs the two rival groups for one special stage.', set:'stage', mgCast:'group',
      choices:[['Perform together', 'Live stage'], ['Decline politely', '']], games:['live', null] };
    case 'variety': { const shows = [['A game show', 'ch'], ['A cooking show', 'so'], ['A reality camp', 'pe']]; ev.shows = shows;
      return { eyebrow:'Variety', title:'Variety show booking', text:'Three variety shows want the group. Which one?', mgCast:'focus',
        scene:{ set:'office', cast:['VAR', f].concat(G.activeMembers().filter(x => x !== f).slice(0, 2)), lines:[R('VAR', 'Our viewers love groups who don\'t take themselves too seriously.'), R(f, 'We are extremely unserious. Professionally.', 'clap')] },
        choices:shows.map(x => [x[0], 'Fan Q&A for ' + F]), games:['fans', 'fans', 'fans'] }; }
    case 'collab': { const a = ev.a || (ev.a = pick(ARTISTS));
      return { eyebrow:'Collaboration', title:a + ' wants a feature', text:a + ' asks ' + s.group.name + ' to feature on a single.', choices:[['Do the feature', 'Fans +, a separate chart entry'], ['Not now', '']] }; }
    case 'endorse': { const b = BRANDS[ev.b], cur = s.group.releases[s.group.releases.length - 1], cid = cur ? (D.concepts.find(x => x.l === cur.concept) || {}).id : null, fit = b.fit.includes(cid);
      ev.fit = fit;
      return { eyebrow:'Endorsement', title:b.n + ' offer', text:b.n + ', ' + b.d + ', offers a year-long deal. ' + (fit ? 'It fits the current concept.' : 'It clashes with the current concept.'),
        choices:[['Sign it', fit ? 'Good money, fans like it' : 'Good money, risk of "sellout" backlash'], ['Turn it down', '']] }; }
    case 'merch': return { eyebrow:'Merch', title:'Merch drop', text:'Pick this season\'s drop. The money funds tours and award campaigns.',
      choices:[['Lightstick version 2', 'Big seller'], ['A photobook', 'Fan Favor up for everyone'], ['Hoodies', 'Steady'], ['Plushies of the members', 'Viral chance']] };
    case 'campaign': return { eyebrow:'Award season', title:'An awards campaign', text:'Awards voting opens next month. Campaign for it?',
      choices:[['Run a campaign', 'Costs ' + G.fmtMoney(500000) + '; +15% win chance'], ['Let the music speak', '']] };
    case 'unit': { const ids = G.activeMembers(); const pairs = []; for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]]);
      ev.pairs = pairs.sort((a, b) => G.bond(b[0], b[1]) - G.bond(a[0], a[1])).slice(0, 4);
      return { eyebrow:'Sub-unit', title:'A sub-unit', text:'The label wants a two-member unit for a side project. Who?',
        choices:ev.pairs.map(p => [n(p[0]) + ' and ' + n(p[1]), 'Bond ' + G.bond(p[0], p[1])]).concat([['No unit', '']]) }; }
    case 'solo': { const top = G.activeMembers().slice().sort((a, b) => G.p(b).fan - G.p(a).fan)[0]; ev.x = top; if (!top) return null;
      return { eyebrow:'Solo debut', title:n(top) + '\'s solo debut', text:n(top) + ' has the biggest personal fandom. The label proposes a solo single.',
        scene:{ set:'office', cast:['EXEC', top, f], lines:[R('EXEC', 'One single. Three months. Then back to the group.'), R(top, 'Only if the group is okay with it.', 'talk')] },
        choices:[['Approve it', 'Her fans and skills grow; spotlight drama risk'], ['Not yet', 'Bond with the group +3']] }; }
    case 'bsideVote': { const r = s.group.releases.find(x => x.id === ev.rid); if (!r) return null;
      return { eyebrow:'Fan vote', title:'B-side of the year', text:'Fans voted ' + r.bside + ' from "' + r.title + '" their favorite B-side. Perform it?', mgCast:'group', set:'stage', choices:[['A special B-side stage', 'Live stage'], ['Just say thanks', '']], games:['live', null] }; }
  }
  return _v3 ? _v3(ev) : null;
};
const _c3 = G.choose3;
G.choose3 = (ev, i, acc) => {
  const s = S(), f = s.focus, c = C();
  switch (ev.kind) {
    case 'rivalDebut': if (i === 0) { bondAll(2); s.flags.rivalWar = 0; return 'The two groups follow each other online that night.'; } s.group.momentum = clamp(s.group.momentum + 6, 0, 100); s.flags.rivalWar = 1; return 'Fans take the hint. The comparison threads begin.';
    case 'rivalRespect': s.flags.rivalFriends = 1; return 'Numbers exchanged.';
    case 'jointStage': if (i === 1) return 'Maybe next year.'; { const sc = G.stageScore(G.activeMembers(), acc); s.group.momentum = clamp(s.group.momentum + sc / 6, 0, 100); grow(s.group.fans * .04); log('Joint awards stage with NOVA9.', 'story'); return 'Score ' + Math.round(sc) + '. Both fandoms trend the same hashtag.'; }
    case 'variety': { const a = acc == null ? .5 : acc, k = ev.shows[i][1]; fan(f, a * 6); G.p(f).sk[k] = r1(G.p(f).sk[k] + a * 1.5); bondAll(1); grow(s.group.fans * .01 * a); return a >= .7 ? 'The clip goes around for weeks.' : 'A fun episode.'; }
    case 'collab': if (i === 1) return ''; { const pw = (Math.log10(Math.max(s.group.fans, 1e5)) - 6) * 20 + 40 + rnd(-10, 10) + G.dif().chart, pk = clamp(Math.round(110 - pw), 1, 101);
      c.collabs.push({ a:ev.a, m:s.month, peak:pk }); grow(s.group.fans * .03); earn(150000, 'Feature fee'); log('Feature with ' + ev.a + ' (No. ' + (pk > 100 ? '—' : pk) + ').', 'release'); return 'The feature peaks at No. ' + (pk > 100 ? '— (off chart)' : pk) + '.'; }
    case 'endorse': if (i === 1) return 'You pass.'; { const b = BRANDS[ev.b]; earn(ev.fit ? 1.2e6 : 1.6e6, b.n + ' deal'); if (ev.fit) { grow(s.group.fans * .02); return 'The ads feel natural. Fans buy the merch.'; } if (!s.hate && chance(.4)) G._.startHate('sellout'); return 'The money is good. The fit is not.'; }
    case 'merch': { const v = [[.12, 0], [.06, 0], [.08, 0], [.07, 1]][i]; const amt = s.group.fans * v[0] * rnd(.7, 1.2); earn(amt, 'Merch drop'); if (i === 1) G.activeMembers().forEach(id => fan(id, 2));
      if (v[1] && chance(.35)) { grow(s.group.fans * .03); feed('@lightstickhq', 'The plushies are SOLD OUT and I have one. Life is complete.', 1); }
      if (!s.hate && chance(.12)) G._.startHate('bots'); return 'The drop makes ' + G.fmtMoney(amt) + '.'; }
    case 'campaign': if (i === 1) return 'No campaign.'; earn(-500000, 'Awards campaign'); s.flags.campaign = 1; return 'Billboards go up near the voters\' offices.';
    case 'unit': { const p = ev.pairs[i]; if (!p) return 'No unit for now.'; c.units.push({ ids:p, name:G.name(p[0]).slice(0, 2).toUpperCase() + G.name(p[1]).slice(0, 2).toUpperCase(), songs:[] }); G.addBond(p[0], p[1], 6); unitRelease(); return 'Unit ' + c.units[c.units.length - 1].name + ' debuts.'; }
    case 'solo': { const x = ev.x; if (i === 1) { bondAll(3); return 'Not yet. The group stays the group.'; }
      c.solo = { id:x, m:s.month }; fan(x, 10); D.skills.forEach(({ k }) => { G.p(x).sk[k] = r1(G.p(x).sk[k] + 1); }); grow(s.group.fans * .03); earn(400000, n(x) + ' solo');
      const o = G.activeMembers().filter(y => y !== x).sort((a, b) => G.bond(x, a) - G.bond(x, b))[0];
      if (o && chance(.5) && S().tensions.length < 3) { const t = { id:s.tid++, type:'spotlight', a:x, b:o, heat:1, age:0, handled:true }; s.tensions.push(t); q({ kind:'drama', tid:t.id }); }
      log(n(x) + ' releases a solo single.', 'release'); return n(x) + '\'s solo single is out.'; }
    case 'bsideVote': if (i === 1) return 'Thank-you posts from all six.'; { const sc = G.stageScore(G.activeMembers(), acc); G.activeMembers().forEach(id => fan(id, 2)); return 'Score ' + Math.round(sc) + '. Fans film every second.'; }
  }
  return _c3 ? _c3(ev, i, acc) : '';
};

/* Brand campaigns and award wins pay too. */
const _adv = G.advance;
G.advance = () => { const s = S(); const w0 = s ? s.rec.wins : 0; const r = _adv(); if (r && s && s.rec.wins > w0) earn(300000, 'Award bonus'); return r; };
})();
