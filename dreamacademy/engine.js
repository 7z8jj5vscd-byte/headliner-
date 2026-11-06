/* Dream Academy: Story Mode. Engine: state, the monthly loop, events and saves. */
(function () {
const D = window.DA;
const G = window.G = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const r1 = v => Math.round(v * 10) / 10;
G.clamp = clamp; G.pick = pick;
let S = null;
G.S = () => S;
G.CAST = {}; D.cast.forEach(c => { G.CAST[c.id] = c; });

/* ---------- People ---------- */
G.name = id => G.CAST[id].first;
G.full = id => { const c = G.CAST[id]; return c.last ? c.first + ' ' + c.last : c.first; };
G.p = id => S.people[id];
G.avg = id => { const k = S.people[id].sk; return (k.vo + k.da + k.ra + k.pe + k.so + k.ch) / 6; };
G.inPlay = id => { const st = S.people[id].status; return st === 'trainee' || st === 'member' || st === 'solo'; };
G.members = () => S.order.filter(id => S.people[id].status === 'member');
G.activeMembers = () => G.members().filter(id => !S.people[id].hiatus);
G.trainees = () => S.order.filter(id => S.people[id].status === 'trainee');
G.cast = () => S.order.filter(G.inPlay);          // everyone the player can plan for
G.working = () => G.cast().filter(id => !S.people[id].hiatus);
G.ch = m => D.chapters.find(c => (m || S.month) >= c.from && (m || S.month) <= c.to) || D.chapters[7];
G.debuted = () => S.month >= 22 && !!S.group.formed;
G.isLight = id => { const c = G.CAST[id]; return !c.real || (c.minorUntil && S.month < c.minorUntil); };
G.year = m => Math.floor(((m || S.month) - 1) / 12) + 1;

/* ---------- Bonds ---------- */
const bk = (a, b) => a < b ? a + '|' + b : b + '|' + a;
G.bond = (a, b) => S.bonds[bk(a, b)] || 0;
G.addBond = (a, b, d) => { if (a === b) return; S.bonds[bk(a, b)] = clamp(G.bond(a, b) + d, -50, 50); };
G.cohesion = (ids) => {
  ids = ids || (G.debuted() ? G.members() : G.trainees());
  let t = 0, n = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { t += G.bond(ids[i], ids[j]); n++; }
  return n ? Math.round(t / n) : 0;
};
G.groupBond = id => { const o = G.members().filter(x => x !== id); return o.length ? o.reduce((t, x) => t + G.bond(id, x), 0) / o.length : 0; };

/* ---------- New game ---------- */
G.newGame = ({ mode, focus }) => {
  S = { v:1, month:1, mode, focus, order:D.cast.map(c => c.id), people:{}, bonds:{}, ctrl:{}, plan:{}, partner:{},
    tensions:[], tid:1, group:{ name:'KATSEYE', formed:false, fans:0, momentum:0, prep:0, plan:'train', releases:[], awards:[], tours:0, doc:null },
    label:25, hate:null, feed:[], log:[], queue:[], flags:{}, settings:{ askAll:true }, rec:{ best:101, no1:0, wins:0, noms:0, viral:0 },
    alumni:[], ended:null, report:null };
  D.cast.forEach(c => {
    const base = c.real ? 34 + (c.score - 60) * .45 : ({ F:31, M3:29, W:27, M2:27, M1:25 })[c.realOut] || 26;
    const sk = {};
    D.skills.forEach(({ k }) => { sk[k] = r1(clamp(base + (c.lean[k] || 0) * 1.6 - (c.lean[k] ? 0 : 3) + rnd(-4, 4), 12, 80)); });
    S.people[c.id] = { sk, wb:r1(rnd(70, 82)), fan:r1(c.real ? 14 + c.pre * .4 : rnd(8, 18)), status:'trainee', hiatus:0, grades:[], warn:false,
      look:Object.assign({}, c.look), out:null, last:{}, pushed:0, lowSeen:0 };
    S.ctrl[c.id] = c.id === focus ? 'manual' : 'balanced';
  });
  const ids = S.order;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) S.bonds[bk(ids[i], ids[j])] = Math.round(rnd(0, 16));
  S.plan[focus] = 'vo';
  log('The open call begins. ' + G.full(focus) + ' is one of more than 120,000 people who sent in an audition.', 'story');
  queueChapterStart(1);
  q({ kind:'audition' });
  feed(pick(D.handles), 'Global girl group auditions are open. 120K submissions already??', 1);
  return S;
};

/* ---------- Log, feed, queue ---------- */
function log(t, kind) { S.log.unshift({ m:S.month, t, kind:kind || 'info' }); if (S.log.length > 400) S.log.length = 400; }
function feed(h, t, mood) { S.feed.unshift({ m:S.month, h, t, mood:mood || 0 }); if (S.feed.length > 120) S.feed.length = 120; }
function q(ev) { S.queue.push(ev); }
G.log = log;
function queueChapterStart(n) { const a = D.archive[n]; if (a) q({ kind:'archive', ch:n }); }

/* ---------- Planning ---------- */
G.acts = id => {
  const p = S.people[id];
  return D.actOrder.filter(k => {
    const a = D.acts[k];
    if (a.groupOnly && p.status !== 'member') return false;
    if (a.from && S.month < a.from) return false;
    return true;
  });
};
G.partners = id => G.cast().filter(x => x !== id && !S.people[x].hiatus && (S.people[id].status === 'solo' ? true : S.people[x].status === S.people[id].status));
function weakest(id, keys) { const k = S.people[id].sk; return keys.slice().sort((a, b) => k[a] - k[b])[0]; }
function lowestBond(id) { const o = G.partners(id); if (!o.length) return null; return o.slice().sort((a, b) => G.bond(id, a) - G.bond(id, b))[0]; }
G.autoPlan = id => {
  const p = S.people[id], st = S.ctrl[id], all = ['vo','da','ra','pe','so','ch'];
  if (st === 'grind') return p.wb < 25 ? 'rest' : (chance(.3) ? pick(['ra','so']) : weakest(id, ['vo','da','pe']));
  if (st === 'fans') return p.wb < 40 ? 'rest' : (chance(.6) ? 'ch' : 'pe');
  if (st === 'protect') return p.wb < 70 ? 'rest' : (chance(.5) ? 'so' : 'bond');
  if (p.wb < 45) return 'rest';
  const lb = lowestBond(id);
  if (lb && G.bond(id, lb) < 0 && chance(.25)) return 'bond';
  return weakest(id, all);
};
G.planOf = id => {
  if (S.ctrl[id] === 'manual') { const a = S.plan[id]; return a && G.acts(id).includes(a) ? a : 'vo'; }
  return S.plan['auto:' + id] || (S.plan['auto:' + id] = G.autoPlan(id));
};
G.setPlan = (id, a) => { S.plan[id] = a; if (a === 'bond' && !S.partner[id]) S.partner[id] = lowestBond(id); };
G.setCtrl = (id, c) => { S.ctrl[id] = c; delete S.plan['auto:' + id]; if (c === 'manual' && !S.plan[id]) S.plan[id] = G.autoPlan(id); };
G.partnerOf = id => { const p = S.partner[id]; return p && G.partners(id).includes(p) ? p : lowestBond(id); };

/* ---------- Scores ---------- */
G.stageSkill = ids => {
  if (!ids.length) return 0;
  let t = 0;
  ids.forEach(id => { const k = S.people[id].sk; t += k.vo * .3 + k.da * .3 + k.pe * .25 + k.ch * .15; });
  let s = t / ids.length;
  const wb = ids.reduce((a, id) => a + S.people[id].wb, 0) / ids.length;
  if (wb < 40) s -= 5;
  S.tensions.forEach(x => { if (ids.includes(x.a) && ids.includes(x.b)) s -= x.heat; });
  return s;
};
G.stageScore = (ids, acc) => clamp(acc == null ? G.stageSkill(ids) * .65 + 21 + rnd(-4, 4) : G.stageSkill(ids) * .65 + acc * 35, 0, 100);
G.grade = v => v >= 80 ? 'A+' : v >= 70 ? 'A' : v >= 60 ? 'B' : v >= 48 ? 'C' : 'D';
G.fmt = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n));

/* ---------- Advance one month ---------- */
G.blocking = () => S.queue.length > 0;
G.advance = () => {
  if (S.ended || G.blocking()) return null;
  const m = S.month, R = { m, lines:[], gains:{}, grades:null, chart:[], fans0:S.group.fans };
  const debuted = G.debuted();

  // 1. Personal plans.
  G.cast().forEach(id => {
    const p = S.people[id];
    if (p.hiatus) {
      p.wb = clamp(p.wb + 12, 5, 100); p.fan = clamp(p.fan + 1, 0, 100);
      if (p.hiatus > 0) p.hiatus--;
      return;
    }
    const key = G.planOf(id), a = D.acts[key], before = Object.assign({}, p.sk);
    const mult = (p.wb < 25 ? .5 : p.wb < 45 ? .8 : 1) * (S.ctrl[id] === 'manual' ? 1.1 : 1);
    D.skills.forEach(({ k }) => {
      const g = (a.g[k] || 0) * mult * (2.4 + Math.random() * 1.6) * (1 - p.sk[k] / 112) + .12;
      p.sk[k] = r1(clamp(p.sk[k] + g, 0, 99));
    });
    p.wb = clamp(p.wb + a.wb, 5, 100);
    if (a.fan) p.fan = clamp(p.fan + a.fan * rnd(.6, 1.2), 0, 100);
    if (key === 'bond') { const o = G.partnerOf(id); if (o) { G.addBond(id, o, a.bond); S.people[o].wb = clamp(S.people[o].wb + 2, 5, 100); } }
    if (key === 'solo') { G.members().forEach(o => { if (o !== id) G.addBond(id, o, -1); }); }
    p.last = { act:key, gain:r1(D.skills.reduce((t, { k }) => t + p.sk[k] - before[k], 0)) };
    R.gains[id] = p.last.gain;
    if (S.month >= 31 && S.month % 3 === 0 && p.status === 'solo') { p.fan = clamp(p.fan + 3, 0, 100); }
  });

  // 2. Group schedule.
  if (debuted) {
    const gp = D.groupPlans[effectivePlan()];
    G.activeMembers().forEach(id => { const p = S.people[id]; p.wb = clamp(p.wb + gp.wb, 5, 100);
      if (S.group.plan === 'tour') p.sk.pe = r1(clamp(p.sk.pe + .8, 0, 99)); });
    S.label = clamp(S.label + 3 + gp.label + G.members().filter(id => S.people[id].hiatus).length * 4, 0, 100);
    if (gp.prep) S.group.prep = clamp(S.group.prep + gp.prep + G.stageSkill(G.activeMembers()) * .05, 0, 100);
    const F = S.group.fans;
    if (effectivePlan() === 'promo') { grow(F * .02 * (S.group.momentum / 50 + .3) + 40000); S.group.momentum += 6; }
    if (effectivePlan() === 'tour') { grow(F * .03 + 70000); S.group.momentum += 7; S.group.tourMonths = (S.group.tourMonths || 0) + 1;
      if (S.group.tourMonths === 1 && !S.flags.firstTour) { S.flags.firstTour = 1; log('First tour: the group plays its first run of dates abroad.', 'story'); } }
    if (effectivePlan() === 'train') G.activeMembers().forEach((a, i, arr) => arr.forEach(b => { if (a < b) G.addBond(a, b, 1); }));
    if (effectivePlan() !== 'tour') S.group.tourMonths = 0;
    if (S.group.plan === 'tour' && effectivePlan() !== 'tour') R.lines.push('There was no release to tour, so the group trained instead.');
  } else if (m >= 4) {
    const ids = G.trainees();
    ids.forEach(a => ids.forEach(b => { if (a < b && chance(.15)) G.addBond(a, b, 1); }));
  }

  // 3. Tensions heat up when nobody deals with them.
  S.tensions.forEach(t => {
    t.age++;
    if (!t.handled) { t.heat = Math.min(5, t.heat + 1); G.addBond(t.a, t.b, -3); [t.a, t.b].forEach(id => { S.people[id].wb = clamp(S.people[id].wb - 2, 5, 100); }); }
    t.handled = false;
  });

  // 4. Releases on the chart.
  if (debuted) chartTick(R);

  // 5. Momentum and fans.
  if (debuted) {
    S.group.momentum = clamp(S.group.momentum - 4, 0, 100);
    S.group.fans = Math.max(0, S.group.fans * 1.004);
    G.members().forEach(id => { S.people[id].fan = clamp(S.people[id].fan + (S.group.momentum - 40) / 60, 0, 100); });
  }

  // 6. Hate train.
  if (S.hate) hateTick(R);

  // 7. Evals.
  if (m >= 4 && m <= 30) R.grades = runEval(m);
  if (m > 30 && m % 3 === 0 && debuted) {
    const g = G.grade(35 + S.group.momentum * .4 + G.stageSkill(G.activeMembers()) * .35);
    log('Quarterly label review: ' + g + '.', 'eval'); R.lines.push('Quarterly label review: the group gets ' + g + '.');
  }

  // 8. Next month.
  S.month++;
  G.cast().forEach(id => { delete S.plan['auto:' + id]; });
  R.fans1 = S.group.fans;
  if (S.month > D.END) { endGame(); R.lines.push('Month 144. The documentary crew packs up.'); S.report = R; save(); return R; }
  const ch = G.ch(), prev = G.ch(m);
  if (ch.n !== prev.n) { queueChapterStart(ch.n); log('Chapter ' + ch.n + ': ' + ch.name + '.', 'chapter'); }
  scripted(S.month);
  randomEvents(R);
  S.report = R;
  save();
  return R;
};
function effectivePlan() {
  if (S.group.plan === 'tour' && !G.recentRelease(8)) return 'train';
  return S.group.plan;
}
G.effectivePlan = effectivePlan;
// Fan growth slows as the fandom gets huge.
function grow(n) { S.group.fans += n * Math.max(.05, 1 - S.group.fans / 9e7); }
function mult(x) { grow(S.group.fans * (x - 1)); }
G.recentRelease = n => S.group.releases.some(r => S.month - r.month <= n);

/* ---------- Evals ---------- */
function runEval(m) {
  const ids = (m <= 21 ? G.trainees() : G.members()).filter(id => !S.people[id].hiatus);
  const rows = ids.map(id => {
    const p = S.people[id], v = G.avg(id) * .95 + (p.last.gain || 0) * 3.2 + rnd(-2, 2);
    const g = G.grade(v); p.grades.push({ m, g }); if (p.grades.length > 40) p.grades.shift();
    return { id, g, v };
  }).sort((a, b) => b.v - a.v);
  ids.forEach(id => { S.people[id].warn = false; });
  if (m <= 18 && rows.length > 6) {
    rows.slice(-3).forEach(r => { const p = S.people[r.id]; p.warn = true; p.wb = clamp(p.wb - 4, 5, 100); });
  }
  const f = rows.find(r => r.id === S.focus);
  if (f) log('Monthly eval: ' + G.name(S.focus) + ' gets ' + f.g + '.', 'eval');
  return rows;
}

/* ---------- Scripted beats ---------- */
function scripted(m) {
  if (m === 3) q({ kind:'info', title:'Callbacks', eyebrow:'Open Call', text:'All twenty make it through to the academy. The real training begins next month, and so do the monthly evals.' });
  if (m === 12) q({ kind:'info', title:'Halfway', eyebrow:'Academy', text:'The coaches post a ranking board in the practice room. Nobody admits to looking at it. Everyone looks at it.' });
  if (m === 18) q({ kind:'info', title:'Cameras arrive', eyebrow:'Academy', text:'A production crew starts filming the trainees. Next month the survival show begins: three missions, a live finale, and only six will debut.' });
  if (m === 19) q({ kind:'mission', n:1 });
  if (m === 20) { if (S.mode === 'real' && G.inPlay('lexie')) q({ kind:'withdraw' }); q({ kind:'mission', n:2 }); }
  if (m === 21) { q({ kind:'mission', n:3 }); q({ kind:'finale' }); }
  if (m === 22) q({ kind:'nameGroup' });
  if (m === 24) q({ kind:'documentary' });
  if (m === 32) { if (!S.group.releases.length) { S.group.prep = Math.max(S.group.prep, 55); q({ kind:'release', debut:true }); } q({ kind:'stage', key:'showcase' }); }
  if (m === 46) q({ kind:'brand' });
  if (m === 52) q({ kind:'awards' });
  if (m === 54) q({ kind:'festival' });
  if (m === 59) q({ kind:'arena' });
  if (m > 60 && m % 12 === 4) q({ kind:'awards' });
  if (m > 60 && m % 12 === 6 && chance(.6)) q({ kind:'festival' });
  if (m === 84 || m === 120) q({ kind:'renewal' });
}

/* ---------- Random events ---------- */
function randomEvents(R) {
  const m = S.month;
  // Drama.
  const pool = G.working().filter(id => S.people[id].status !== 'solo');
  if (pool.length >= 2 && S.tensions.length < 3) {
    const p = .22 + (G.cohesion() < 5 ? .12 : 0) + (m >= 19 && m <= 21 ? .15 : 0) + (S.label > 70 ? .08 : 0);
    if (chance(p)) newTension(pool, R);
  }
  S.tensions.filter(t => t.heat >= 5 && !t.blow).forEach(t => { t.blow = true; q({ kind:'drama', tid:t.id, blowup:true }); });
  // A tension spills into the feed.
  if (m >= 22 && !S.hate && S.tensions.some(t => t.heat >= 3) && chance(.2)) startHate('apart');
  if (m >= 22 && !S.hate && chance(.03 + (S.label > 70 ? .04 : 0))) startHate();
  // Label pressure.
  if (G.debuted() && S.label >= 70 && m - (S.flags.labelAsk || 0) >= 3) { S.flags.labelAsk = m; q({ kind:'label' }); }
  // Wellbeing.
  G.working().forEach(id => {
    const p = S.people[id];
    if (p.wb < 25 && m - p.lowSeen >= 3) { p.lowSeen = m; q({ kind:'lowwb', id }); }
  });
  // Returns.
  G.cast().forEach(id => {
    const p = S.people[id];
    if (p.hiatus === 0 && p.onBreak) q({ kind:'return', id });
    else if (p.hiatus < 0 && p.wb >= 75 && !S.queue.some(e => e.kind === 'return' && e.id === id)) q({ kind:'return', id });
  });
  // Feed chatter.
  if (m >= 19 && chance(.7)) chatter();
}
function chatter() {
  const ids = G.debuted() ? G.members() : G.trainees();
  const a = pick(ids);
  const lines = G.debuted() ? [
    'The way ' + G.name(a) + ' ate that last stage. Fancam at 2M already.',
    S.group.name + ' practice video drop when??',
    'Unpopular opinion: ' + S.group.name + ' deserve a bigger budget.',
    'Their harmonies live are actually insane.',
    'Who else is seeing the tour this year?',
  ] : [
    'Eval week. The trainees look exhausted in the behind-the-scenes clips.',
    G.name(a) + ' is so underrated in this show. Vote for her!',
    'This mission song is stuck in my head.',
    'Rank predictions thread. Go.',
  ];
  feed(pick(D.handles), pick(lines), 1);
}

/* ---------- Drama ---------- */
function newTension(pool, R) {
  const pairs = [];
  for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
    const a = pool[i], b = pool[j];
    if (S.tensions.some(t => (t.a === a || t.b === a) && (t.a === b || t.b === b))) continue;
    const ka = S.people[a].sk, kb = S.people[b].sk, top = k => Object.keys(k).sort((x, y) => k[y] - k[x])[0];
    const w = 1 + Math.max(0, 15 - G.bond(a, b)) / 5 + (top(ka) === top(kb) ? 1.5 : 0) + (S.people[a].wb < 45 || S.people[b].wb < 45 ? 1 : 0)
      + (a === S.focus || b === S.focus ? 1.2 : 0);
    pairs.push({ a, b, w });
  }
  if (!pairs.length) return;
  let r = Math.random() * pairs.reduce((t, x) => t + x.w, 0), pr = pairs[0];
  for (const x of pairs) { r -= x.w; if (r <= 0) { pr = x; break; } }
  const light = G.isLight(pr.a) || G.isLight(pr.b);
  const types = Object.keys(D.drama).filter(k => { const d = D.drama[k]; return S.month >= d.from && (!d.to || S.month <= d.to) && (!light || d.light); });
  if (!types.length) return;
  const type = pick(types);
  const [a, b] = chance(.5) ? [pr.a, pr.b] : [pr.b, pr.a];
  const t = { id:S.tid++, type, a, b, heat:1, age:0, light, handled:true };
  S.tensions.push(t);
  log('Drama: ' + D.drama[type].title.toLowerCase() + ' between ' + G.name(a) + ' and ' + G.name(b) + '.', 'drama');
  if (R) R.lines.push('New tension: ' + D.drama[type].title + ' (' + G.name(a) + ' and ' + G.name(b) + ').');
  const involvesManual = S.ctrl[a] === 'manual' || S.ctrl[b] === 'manual';
  if (S.settings.askAll || involvesManual) q({ kind:'drama', tid:t.id });
  else resolveDrama(t, 0);
}
G.tension = id => S.tensions.find(t => t.id === id);
G.fill = (s, t) => s.replace(/\{a\}/g, G.name(t.a)).replace(/\{b\}/g, G.name(t.b));
const FIX = {
  team:     ['Put them on the same team next mission', t => { G.addBond(t.a, t.b, 6); return 'Same team, same song. They had to talk, and they did.'; }],
  center:   ['Let the next eval decide the center', t => { const w = S.people[t.a].sk.pe >= S.people[t.b].sk.pe ? t.a : t.b, l = w === t.a ? t.b : t.a;
              S.people[l].wb = clamp(S.people[l].wb - 4, 5, 100); return G.name(w) + ' takes the center. ' + G.name(l) + ' says it was fair, and means it, mostly.'; }],
  practice: ['Set a hard stop time for practice', t => { [t.a, t.b].forEach(id => { S.people[id].wb = clamp(S.people[id].wb + 4, 5, 100); }); return 'Lights off at ten. Both of them sleep better.'; }],
  rivalry:  ['Pair them for a duet stage', t => chance(.6) ? (G.addBond(t.a, t.b, 15), 'The duet works. The rivalry turns back into a friendship.') : (t.heat++, null)],
  misread:  ['Show ' + '{b}' + ' the full unedited clip', t => chance(.85) ? (G.addBond(t.a, t.b, 8), 'Forty seconds of context and it is over. They laugh about the edit.') : (t.heat++, null)],
  lines:    ['Rebalance the lines', t => { S.group.prep = clamp(S.group.prep - 10, 0, 100); S.people[t.b].fan = clamp(S.people[t.b].fan + 3, 0, 100);
              return 'The split is redone. It costs studio time, but ' + G.name(t.b) + ' gets her verse.'; }],
  concept:  ['Work {b}\'s notes into the concept', t => { G.addBond(t.a, t.b, 5); S.flags.softConcept = 1; return 'The concept bends a little. The next release will be a safer bet.'; }],
  clique:   ['Shuffle rooms and van seats', t => chance(.7) ? (G.members().forEach(x => { if (x !== t.a) G.addBond(t.a, x, 2); }), 'New seats, new room, and the camps dissolve.') : (t.heat++, null)],
  spotlight:['Rotate who fronts interviews', t => { S.people[t.a].fan = clamp(S.people[t.a].fan - 2, 0, 100); S.people[t.b].fan = clamp(S.people[t.b].fan + 3, 0, 100); return 'A rotation chart goes on the fridge. Everyone gets a turn.'; }],
  label:    ['Ask the label for a slot for {b} too', t => { S.label = clamp(S.label + 6, 0, 100); return 'The label agrees, a little annoyed. ' + G.name(t.b) + ' gets her own slot next month.'; }],
  schedule: ['Agree on one protected rest day a week', t => { S.label = clamp(S.label + 5, 0, 100); [t.a, t.b].forEach(id => { S.people[id].wb = clamp(S.people[id].wb + 5, 5, 100); }); return 'Sundays are off. The label grumbles.'; }],
  credit:   ['Fix the credits', t => { G.addBond(t.a, t.b, 6); return 'The credits are corrected before release.'; }],
};
function resolveDrama(t, i) {
  const n = G.name, A = t.a, B = t.b;
  let txt = null, done = false;
  if (i === 0) {
    const p = clamp(.5 + (G.bond(A, B) + 20) / 120 - t.heat * .05, .2, .92);
    if (chance(p)) { G.addBond(A, B, 12); [A, B].forEach(id => { S.people[id].wb = clamp(S.people[id].wb + 3, 5, 100); }); txt = 'They talk it through in an empty practice room. It takes an hour and some tears, but it ends with a hug.'; done = true; }
    else { t.heat = Math.min(5, t.heat + 1); G.addBond(A, B, -4); txt = 'It got louder before it got quieter. They are not there yet.'; }
  } else if (i === 1) {
    const r = FIX[t.type][1](t);
    if (r) { txt = r; done = true; } else txt = 'It did not take. The tension is still there.';
  } else if (i === 2) {
    if (chance(.3 + G.bond(A, B) / 100)) { txt = 'Left alone, they sort it out themselves.'; done = true; G.addBond(A, B, 3); }
    else txt = 'Nobody steps in, and it simmers.';
  } else if (i === 3) {
    G.addBond(A, B, -12); S.people[B].wb = clamp(S.people[B].wb - 6, 5, 100); S.people[A].wb = clamp(S.people[A].wb + 2, 5, 100);
    txt = 'You back ' + n(A) + '. It ends the argument, but ' + n(B) + ' goes quiet for a while.'; done = true;
  }
  t.handled = true;
  if (done) { S.tensions = S.tensions.filter(x => x !== t); log('Resolved: ' + D.drama[t.type].title.toLowerCase() + ' (' + n(A) + ' and ' + n(B) + ').', 'drama'); }
  return txt;
}
G.dramaChoices = t => {
  const c = [['Sit them down together', 'Best when their bond is decent.'], [G.fill(FIX[t.type][0], t), ''], ['Let them work it out', 'Free, but it may keep heating up.'], ['Back ' + G.name(t.a), 'Ends it now, at a cost to their bond.']];
  return c;
};
G.resolveDrama = (tid, i) => { const t = G.tension(tid); return t ? resolveDrama(t, i) : ''; };

/* ---------- Hate trains ---------- */
function startHate(id) {
  let opts = D.hate.filter(h => !h.drama || id === 'apart');
  if (id) opts = D.hate.filter(h => h.id === id);
  else opts = opts.filter(h => (!h.concept || S.flags.divisive) && (!h.labelOnly || S.label > 60) && h.id !== 'apart');
  if (!opts.length) return;
  const h = pick(opts);
  S.hate = { id:h.id, stage:0, responded:false, peaked:false, quiet:false, m:S.month };
  log('Hate train starts: ' + h.t.toLowerCase() + '.', 'hate');
  feed(pick(D.handles), hateLine(h, 0), -1);
  q({ kind:'hate' });
}
G.startHate = startHate;
G.hateTopic = () => S.hate && D.hate.find(h => h.id === S.hate.id);
function hateLine(h, st) {
  const g = S.group.name;
  const L = {
    lipsync:['Was that live? Asking for a friend.', 'Side-by-side audio comparison thread on ' + g + '.', '"' + g + ' can\'t sing live" is trending.', 'TV networks are being asked about the audio.', 'Everyone has an opinion on the ' + g + ' audio.'],
    notthem:['Not sure about this concept tbh.', '"This isn\'t ' + g + '" is trending.', 'Reaction videos pile up, most of them negative.', 'Music press runs think pieces on the concept.', 'The concept is the only thing anyone is talking about.'],
    tickets:['Tour prices are kind of wild?', 'Screenshots of $400 seats everywhere.', 'Fans organize a ticket price complaint thread.', 'Consumer news picks up the ticket prices.', 'The ticket prices have their own news cycle.'],
    airport:['Weird airport clip going around.', 'The cropped clip has 3M views.', 'People are calling ' + g + ' rude to fans.', 'Entertainment sites run the clip without context.', 'The airport clip is everywhere.'],
    apart:['Is it just me or is the energy off in the group?', 'Body-language analysis threads about ' + g + '.', '"' + g + ' disbandment" is trending.', 'Gossip sites claim the group is falling apart.', 'Every stage is being picked apart for "proof".'],
    bots:['Merch gone in 4 seconds??', 'Fans blame bots for the merch drop.', 'Resellers list the merch at 5x.', 'Tech press writes about the merch bots.', 'The merch drop is a full-blown scandal.'],
    sellout:['A brand deal already? Hm.', '"Sellout" is trending next to ' + g + '.', 'Ad parodies are everywhere.', 'Marketing press debates the campaign.', 'The ad is the most argued-about video of the month.'],
    overwork:['Have they had a day off this year?', 'Fans post the group\'s schedule as a timeline.', 'A hashtag asks the label to let ' + g + ' rest.', 'Industry press looks at the schedule.', 'The label\'s schedule is under a spotlight.'],
  };
  return (L[h.id] || L.apart)[clamp(st, 0, 4)];
}
function hateTick(R) {
  const H = S.hate, h = G.hateTopic();
  if (!H.responded) {
    if (!H.peaked) { H.stage++; if (H.stage >= 4) { H.stage = 4; H.peaked = true; } }
    else H.stage -= H.quiet ? 2 : 1;
  } else if (H.peaked || H.quiet) H.stage -= 1;
  H.responded = false;
  if (H.stage < 0) { S.hate = null; log('The hate train runs out of steam: ' + h.t.toLowerCase() + '.', 'hate'); R.lines.push('The backlash has died down.'); return; }
  const st = H.stage;
  S.group.momentum = clamp(S.group.momentum - st * 2, 0, 100);
  S.group.fans = Math.max(0, S.group.fans * (1 - .002 * st));
  G.working().forEach(id => { S.people[id].wb = clamp(S.people[id].wb - st, 5, 100); });
  feed(pick(D.handles), hateLine(h, st), -1);
  R.lines.push('Hate train (' + D.hateStages[st] + '): ' + h.t + '.');
  if ((st === 2 || st === 4) && !H.responded && !S.queue.some(e => e.kind === 'hate')) q({ kind:'hate' });
}
G.respondHate = i => {
  const H = S.hate, h = G.hateTopic(); if (!H) return '';
  let t;
  if (i === 0) { if (h.fault) { H.stage -= 2; t = 'The statement owns it plainly. It lands.'; } else if (chance(.3)) { H.stage++; t = 'The statement gives the story a second day.'; } else { H.stage--; t = 'A short, calm statement. It helps a little.'; } }
  else if (i === 1) { if (h.fault) { H.stage++; t = 'Silence reads as not caring. It gets worse.'; } else { H.stage--; H.quiet = true; t = 'You say nothing. With nothing to feed on, it starts to burn out.'; } }
  else if (i === 2) { if (G.cohesion() >= 20) { H.stage -= 2; G.members().forEach(a => G.members().forEach(b => { if (a < b) G.addBond(a, b, 3); })); t = 'The group shows up together, relaxed and laughing. Fans rally behind them.'; }
    else { H.stage++; t = 'It looks staged. The group isn\'t close enough right now to sell it.'; } }
  else { if (h.fault) { S.hate = null; log('A sincere apology ends the backlash.', 'hate'); return 'A sincere apology and a real fix. It is over.'; }
    H.stage++; S.group.momentum = clamp(S.group.momentum - 5, 0, 100); t = 'Apologizing for something that did not happen convinces people it did. A bad apology.'; }
  H.responded = true;
  if (H.stage < 0) { S.hate = null; log('The backlash ends.', 'hate'); }
  return t;
};

/* ---------- Releases and charts ---------- */
G.canRelease = () => G.debuted() && S.month >= 32 && S.group.prep >= 60 && !S.queue.some(e => e.kind === 'release');
G.queueRelease = () => { if (G.canRelease()) q({ kind:'release' }); };
G.conceptOptions = () => D.concepts.filter(c => S.month >= 61 ? true : !c.late);
function title() { return pick(D.titleA) + ' ' + pick(D.titleB); }
G.makeRelease = (cid, debut) => {
  const c = D.concepts.find(x => x.id === cid);
  const ids = G.activeMembers();
  const base = ids.reduce((t, id) => { const k = S.people[id].sk; return t + (k.vo + k.da + k.pe + k.so) / 4; }, 0) / Math.max(1, ids.length);
  const fit = ids.reduce((t, id) => t + c.fit.reduce((a, k) => a + S.people[id].sk[k], 0) / c.fit.length, 0) / Math.max(1, ids.length);
  let quality = base * .7 + fit * .3 + (S.group.prep - 60) * .12 + G.cohesion() * .08 - S.tensions.reduce((t, x) => t + x.heat, 0) * .8 + rnd(-4, 4);
  const kind = S.group.prep >= 85 ? 'EP' : 'Single';
  const risk = S.flags.softConcept ? c.risk / 2 : c.risk; S.flags.softConcept = 0;
  const divisive = chance(risk);
  const n = S.group.releases.length;
  const r = { id:n + 1, title:title(), era:pick(D.eraA) + ' ' + pick(D.eraB), concept:c.l, kind, month:S.month, quality:r1(quality), divisive, viral:false, chart:[], peak:101, album:null, debut:!!debut };
  const same = S.group.releases.slice(-3).filter(x => x.concept === c.l).length;
  r.power = quality * .55 + (Math.log10(Math.max(S.group.fans, 1e5)) - 6) * 22 + S.group.momentum * .3 + (divisive ? 6 : 0) + (n === 0 ? -24 : 0)
    - Math.max(0, n - 6) * 1.5 - same * 6 + rnd(-10, 8);
  S.group.releases.push(r);
  S.group.prep = 0;
  S.group.momentum = clamp(S.group.momentum + 15 + (divisive ? 10 : 0), 0, 100);
  if (divisive) { S.flags.divisive = 1; if (!S.hate) startHate('notthem'); }
  log('Release: "' + r.title + '" (' + kind + ', ' + c.l + ')' + (kind === 'EP' ? ', era ' + r.era : '') + '.', 'release');
  feed(pick(D.handles), divisive ? '"' + r.title + '" is... a choice. I can\'t stop replaying it though.' : '"' + r.title + '" is out and it\'s so good.', divisive ? 0 : 1);
  return r;
};
function chartTick(R) {
  S.group.releases.forEach(r => {
    const age = S.month - r.month;
    if (age < 0 || age > 5) return;
    // Slow-burn viral chance: higher for the second release in its 2nd-3rd month.
    const danceAvg = G.activeMembers().reduce((t, id) => t + S.people[id].sk.da, 0) / Math.max(1, G.activeMembers().length);
    let pv = .03 + (danceAvg - 50) / 500 + (effectivePlan() === 'promo' ? .03 : 0);
    if (r.id === 2 && age >= 2 && age <= 3) pv += .2;
    if (!r.viral && age >= 1 && chance(pv)) {
      r.viral = true; r.power += 22; S.group.momentum = clamp(S.group.momentum + 30, 0, 100); mult(1.35); S.rec.viral++;
      log('"' + r.title + '" goes viral: its dance takes over short-video apps.', 'release');
      feed('@dancebreakdown', 'Everyone is doing the "' + r.title + '" dance. EVERYONE.', 1);
      R.lines.push('"' + r.title + '" went viral.');
    }
    const pw = r.power + S.group.momentum * .15 - age * 7 + (r.viral ? 8 : 0) + rnd(-4, 4);
    const pos = clamp(Math.round(115 - pw), 1, 101);
    r.chart.push(pos);
    if (pos < r.peak) r.peak = pos;
    if (r.kind === 'EP' && age === 0) r.album = clamp(Math.round(125 - pw - 12), 1, 200);
    if (pos <= 100) {
      grow((101 - pos) * 9000);
      R.chart.push('"' + r.title + '" is at No. ' + pos + (age === 0 ? ' in its first month' : '') + '.');
    } else if (age === 0) R.chart.push('"' + r.title + '" missed the chart.');
    if (r.album && age === 0) R.chart.push('The ' + r.era + ' EP debuts at No. ' + r.album + ' on the album chart.');
    if (pos < S.rec.best) S.rec.best = pos;
    if (pos === 1 && !r.no1) { r.no1 = true; S.rec.no1++; log('"' + r.title + '" hits No. 1.', 'release'); }
    if (r.album === 1 && !r.albumNo1) { r.albumNo1 = true; S.rec.no1++; log('The ' + r.era + ' EP debuts at No. 1.', 'release'); }
    if (pos <= 10) S.label = clamp(S.label - 4, 0, 100);
  });
}
G.bestRecentPeak = n => S.group.releases.filter(r => S.month - r.month <= n).reduce((b, r) => Math.min(b, r.peak, r.album || 999), 101);

/* ---------- Hiatus ---------- */
G.startHiatus = (id, months) => {
  const p = S.people[id];
  p.hiatus = months; p.onBreak = true;
  if (S.ctrl[id] === 'manual' && id !== S.focus) S.ctrl[id] = 'protect';
  log(G.name(id) + ' starts a break' + (months > 0 ? ' of ' + months + ' month' + (months > 1 ? 's' : '') : ' with no fixed end') + '.', 'story');
  S.queue = S.queue.filter(e => !(e.kind === 'lowwb' && e.id === id));
};
G.endHiatus = id => { const p = S.people[id]; p.hiatus = 0; p.onBreak = false; log(G.name(id) + ' is back.', 'story'); feed(pick(D.handles), 'Welcome back, ' + G.name(id) + '!', 1); };

/* ---------- Event views and choices ----------
   view(ev) -> { eyebrow, title, text, conf?, choices:[[label, note]], perform? }
   choose(ev, i, acc) -> result text (or '' to close) */
G.view = ev => {
  const n = G.name, f = S.focus;
  switch (ev.kind) {
    case 'archive': { const a = D.archive[ev.ch], c = D.chapters[ev.ch - 1];
      return { eyebrow:'Chapter ' + c.n + ' · Archive footage', title:c.name, text:a[1], note:'Real timeline, ' + a[0] + '.', choices:[['Roll camera']] }; }
    case 'info': return { eyebrow:ev.eyebrow || 'Story', title:ev.title, text:ev.text, choices:[['Continue']] };
    case 'audition': return { eyebrow:'Open Call', title:'Audition tape', text:'What does ' + G.full(f) + ' send in for her audition?',
      choices:[['A vocal cover', 'Vocal +4'], ['A dance video', 'Dance +4'], ['A rap verse', 'Rap +4'], ['An original song', 'Songwriting +4']] };
    case 'withdraw': return { eyebrow:'Survival Show', title:'Lexie leaves the show', text:'Lexie withdraws from the competition before the second mission, as in the real show (announced October 21, 2023). The trainees say goodbye in the dorm.', choices:[['Continue']] };
    case 'mission': {
      const left = G.trainees().length;
      const cut = S.mode === 'real' ? realOut('M' + ev.n).length : ({ 1:2, 2:Math.max(0, left - 13), 3:3 })[ev.n];
      const focusIn = G.p(f).status === 'trainee';
      return { eyebrow:'Survival Show · Mission ' + ev.n, title:['', 'Mission 1: the first stage', 'Mission 2: team battle', 'Mission 3: the semifinal'][ev.n],
        text:left + ' trainees are left. ' + cut + ' will go home after this mission. ' + (focusIn ? 'Judges score the stage; fans vote online.' : 'Watch it from the audience.'),
        perform:focusIn, choices:focusIn ? [['Perform', 'Tap in time with the beat'], ['Skip', 'Resolve from her stats']] : [['Watch']] };
    }
    case 'finale': return { eyebrow:'Survival Show · Live finale', title:'The live finale', text:G.trainees().length + ' finalists. One stage, one live vote, and six names. Final score = fan pre-vote + live vote + judges.',
      perform:G.p(f).status === 'trainee', choices:G.p(f).status === 'trainee' ? [['Perform', 'Tap in time with the beat'], ['Skip', 'Resolve from her stats']] : [['Watch']] };
    case 'cutFocus': return { eyebrow:'Survival Show', title:n(f) + ' is eliminated', text:'Her name is not called. What now?',
      choices:[['Follow her solo story', 'She keeps training on her own; the others play on autoplay']].concat(focusPool().map(id => ['Switch focus to ' + n(id), ''])) };
    case 'nameGroup': return { eyebrow:'Pre-Debut', title:'Name the group', text:'The six finalists are a group now. The label asks for a name.', choices:D.groupNames.map(x => [x, x === 'KATSEYE' ? 'The real group\'s name' : '']) };
    case 'documentary': return { eyebrow:'Pre-Debut', title:'The documentary crew', text:'A streaming service wants an all-access documentary about the debut. How much do you let them see?',
      choices:[['Cameras everywhere', 'More fans; more stress and more drama on screen'], ['Keep some rooms private', 'Fewer fans; calmer members']] };
    case 'release': { const opts = G.conceptOptions();
      return { eyebrow:ev.debut ? 'Rookie Era · Debut' : 'New release', title:ev.debut ? 'The debut single' : 'Pick the concept',
        text:(ev.debut ? 'The debut date is set. ' : '') + 'Prep is at ' + Math.round(S.group.prep) + (S.group.prep >= 85 ? ', enough for an EP.' : '. Under 85 it goes out as a single.') + ' Which concept?',
        choices:opts.map(c => [c.l, 'Fits ' + c.fit.map(k => D.skills.find(s => s.k === k).l).join(' and ') + (c.risk >= .4 ? ' · divisive' : '')]) }; }
    case 'stage': return { eyebrow:'Rookie Era', title:'Debut showcase', text:'The first showcase as a group, filmed for the documentary.', perform:true, choices:[['Perform', 'Tap in time with the beat'], ['Skip', 'Resolve from stats']] };
    case 'brand': return { eyebrow:'Breakout', title:D.brand + ' campaign', text:D.brand + ' wants the group for a dance-led ad campaign. If the choreography catches on, it could go global.',
      perform:false, choices:[['Take the campaign', 'Shoot the ad (a performance)'], ['Turn it down', 'Keeps the focus on music']] };
    case 'brandShoot': return { eyebrow:'Breakout', title:'The ad shoot', text:'One take for the hero shot. The choreography has to be sharp.', perform:true, choices:[['Perform', 'Tap in time'], ['Skip', 'Resolve from stats']] };
    case 'awards': { const pk = G.bestRecentPeak(14), nom = pk <= 60 || (S.group.releases.length && S.month < 64);
      ev.nom = nom;
      return { eyebrow:D.awards, title:'Awards night', text:nom ? 'The group is nominated and asked to perform with a live band.' : 'No nominations this year, but the group is asked to present an award.',
        perform:nom, choices:nom ? [['Perform', 'A live-band stage'], ['Skip', 'Resolve from stats']] : [['Go anyway']] }; }
    case 'festival': return { eyebrow:'Festival', title:D.festival, text:'A main-stage slot at ' + D.festival + '. The organizers offer a surprise guest.',
      choices:D.guests.map(g => ['Bring out ' + g, '']).concat([['No guest', 'Just the six']]) };
    case 'festivalShow': return { eyebrow:'Festival', title:'Main stage', text:'Sunset slot, ninety thousand people.', perform:true, choices:[['Perform', 'Tap in time'], ['Skip', 'Resolve from stats']] };
    case 'arena': return { eyebrow:'Superstardom', title:'Hometown arena', text:'The arena tour needs one hometown show. Whose home city gets it?',
      choices:G.members().map(id => [n(id) + ' (' + G.CAST[id].from + ')', '']) };
    case 'arenaShow': return { eyebrow:'Superstardom', title:'Hometown night', text:'Her family is in the third row.', perform:true, choices:[['Perform', 'Tap in time'], ['Skip', 'Resolve from stats']] };
    case 'drama': { const t = G.tension(ev.tid); if (!t) return null; const d = D.drama[t.type];
      const ch = G.dramaChoices(t); if (ev.blowup) ch.splice(2, 1);
      return { eyebrow:(ev.blowup ? 'Blowup · ' : 'Drama · ') + 'Heat ' + t.heat + '/5', title:d.title, text:G.fill(d.open, t), drama:t,
        conf:[[t.a, d.conf[0]], [t.b, d.conf[1]]], choices:ch.concat(ev.blowup ? [] : [['Decide later', 'It stays in the Drama tab and keeps heating up']]) }; }
    case 'hate': { const h = G.hateTopic(); if (!h) return null;
      return { eyebrow:'Hate train · ' + D.hateStages[S.hate.stage], title:h.t, text:'It is aimed at the group. How do you respond?', hate:true,
        choices:[['Post a statement'], ['Stay silent'], ['Show the group standing together', 'Needs a close group'], ['Apologize'], ['Decide later', 'It keeps moving']] }; }
    case 'label': return { eyebrow:'Label pressure', title:'The label wants more', text:'Executives want an extra promotion push and a variety show run on top of the schedule.',
      choices:[['Agree', 'Momentum up, Wellbeing down'], ['Negotiate', 'Meet halfway'], ['Refuse', 'Protects the group; the label gets louder']] };
    case 'lowwb': return { eyebrow:'Wellbeing', title:n(ev.id) + ' is running on empty', text:'Her Wellbeing is ' + Math.round(G.p(ev.id).wb) + '. She is still showing up, but it shows.',
      choices:[['Suggest a break', 'Three months off; she can come back early'], ['Lighten her schedule', 'Rest next month'], ['Push through', 'Lower performance, and it gets harder']] };
    case 'return': return { eyebrow:'Hiatus', title:n(ev.id) + ' feels ready', text:n(ev.id) + ' says she feels ready to come back. Her Wellbeing is ' + Math.round(G.p(ev.id).wb) + '.',
      choices:[['Welcome her back'], ['Give her more time', 'Two more months']] };
    case 'renewal': return { eyebrow:'Contracts', title:'Contract renewal', text:renewalText(), choices:[['Offer a lighter schedule to everyone', 'More of them stay; the label pushes back'], ['Let each of them decide freely']] };
    case 'ending': { const e = D.endings[S.ended]; return { eyebrow:'The end', title:e.t, text:e.d, choices:[['See the final numbers']] }; }
  }
  return { title:'', text:'', choices:[['Continue']] };
};
function focusPool() { return G.members().length ? G.members() : G.trainees(); }
function realOut(code) { return D.cast.filter(c => c.realOut === code).map(c => c.id).filter(id => G.p(id).status === 'trainee'); }

G.choose = (ev, i, acc) => {
  const n = G.name, f = S.focus;
  const done = () => { S.queue = S.queue.filter(x => x !== ev); save(); };
  let out = '';
  switch (ev.kind) {
    case 'audition': { const k = ['vo','da','ra','so'][i]; G.p(f).sk[k] = r1(G.p(f).sk[k] + 4); G.p(f).fan += 3; out = 'The tape goes in. Now she waits.'; break; }
    case 'withdraw': cutPeople(['lexie'], 'W'); log('Lexie withdraws from the show.', 'show'); out = 'The dorm feels emptier.';
      if (f === 'lexie') q({ kind:'cutFocus' }); break;
    case 'mission': out = mission(ev.n, acc, i); break;
    case 'finale': out = finale(acc, i); break;
    case 'cutFocus': {
      if (i === 0) { G.p(f).status = 'solo'; S.ctrl[f] = 'manual'; log(n(f) + ' goes solo.', 'story'); out = 'She leaves the show with a following of her own. The group carries on without her.'; }
      else { const id = focusPool()[i - 1]; S.ctrl[f] = 'balanced'; S.focus = id; S.ctrl[id] = 'manual'; out = 'The cameras follow ' + n(id) + ' now.'; }
      break; }
    case 'nameGroup': S.group.name = D.groupNames[i]; log('The group is named ' + S.group.name + '.', 'story'); out = S.group.name + ' it is.'; break;
    case 'documentary':
      S.group.doc = i === 0 ? 'open' : 'private';
      if (i === 0) { mult(1.25); G.members().forEach(id => { S.people[id].wb = clamp(S.people[id].wb - 6, 5, 100); }); out = 'Nothing is off limits. The trailer is a hit.'; }
      else { mult(1.08); G.members().forEach(id => { S.people[id].wb = clamp(S.people[id].wb + 4, 5, 100); }); out = 'The dorm stays private. The members thank you.'; }
      break;
    case 'release': { const c = G.conceptOptions()[i]; const r = G.makeRelease(c.id, ev.debut); out = '"' + r.title + '" (' + r.kind + ', ' + c.l + ') is out.' + (r.divisive ? ' It is already dividing people.' : ''); break; }
    case 'stage': { const s = G.stageScore(G.activeMembers(), acc); S.group.momentum = clamp(S.group.momentum + (s - 50) / 2, 0, 100);
      out = 'Showcase score: ' + Math.round(s) + '. ' + (s >= 70 ? 'The room is on its feet.' : s >= 50 ? 'Solid, if a little nervous.' : 'Rough. The documentary keeps the stumble in.'); break; }
    case 'brand':
      if (i === 0) { q({ kind:'brandShoot' }); if (chance(.3) && !S.hate) S.flags.sellout = 1; out = 'Contracts signed. The shoot is next.'; }
      else out = 'You pass. The label is not thrilled.', S.label = clamp(S.label + 8, 0, 100);
      break;
    case 'brandShoot': { const s = G.stageScore(G.activeMembers(), acc);
      if (s >= 62 || chance(.25)) { mult(1.5); S.group.momentum = clamp(S.group.momentum + 25, 0, 100); S.rec.viral++; log('The ' + D.brand + ' ad becomes a global dance trend.', 'story'); out = 'Score ' + Math.round(s) + '. The ad becomes a global dance trend: hundreds of millions of views.'; }
      else { mult(1.1); out = 'Score ' + Math.round(s) + '. A good ad, and a decent bump.'; }
      if (S.flags.sellout) { S.flags.sellout = 0; startHate('sellout'); }
      break; }
    case 'awards': {
      if (!ev.nom) { out = 'They present the award and look great doing it.'; break; }
      const s = G.stageScore(G.activeMembers(), acc), pk = G.bestRecentPeak(14);
      S.rec.noms += 2;
      const win = chance(.15 + Math.max(0, 40 - pk) / 120 + (s >= 75 ? .1 : 0));
      if (s >= 75) { S.group.momentum = clamp(S.group.momentum + 15, 0, 100); mult(1.12); }
      if (win) { S.rec.wins++; S.group.awards.push({ m:S.month, t:pick(['Best Pop Group Performance','Best New Artist','Group of the Year','Best Choreography']) }); }
      log('Awards night: ' + (win ? 'a win.' : 'nominated, no win.') + ' Stage score ' + Math.round(s) + '.', 'story');
      out = 'Stage score ' + Math.round(s) + '. ' + (s >= 75 ? 'Standing ovation. ' : '') + (win ? 'And they win!' : 'No trophy this time.'); break; }
    case 'festival': ev.guest = i < D.guests.length ? D.guests[i] : null; q({ kind:'festivalShow', guest:ev.guest }); out = ev.guest ? 'The guest is locked in. Nobody can know.' : 'Just the six of them.'; break;
    case 'festivalShow': { const s = G.stageScore(G.activeMembers(), acc) + (ev.guest ? 6 : 0);
      S.group.momentum = clamp(S.group.momentum + s / 5, 0, 100); mult(1 + s / 600);
      log('Festival set at ' + D.festival + (ev.guest ? ' with ' + ev.guest : '') + '.', 'story');
      out = 'Score ' + Math.round(s) + '. ' + (ev.guest ? 'The guest reveal breaks the internet.' : 'A strong set.'); break; }
    case 'arena': { const id = G.members()[i]; q({ kind:'arenaShow', id }); out = 'The tour routes through ' + G.CAST[id].from + '.'; break; }
    case 'arenaShow': { const s = G.stageScore(G.activeMembers(), acc); const p = G.p(ev.id); if (p) { p.wb = clamp(p.wb + 10, 5, 100); p.fan = clamp(p.fan + 8, 0, 100); }
      mult(1.08); S.group.tours++; log('Hometown arena show for ' + n(ev.id) + '.', 'story');
      out = 'Score ' + Math.round(s) + '. ' + n(ev.id) + ' cries through the last song.'; break; }
    case 'drama': { const t = G.tension(ev.tid); if (!t) break; const c = G.dramaChoices(t); if (ev.blowup) c.splice(2, 1);
      if (i >= c.length) { done(); return ''; }
      const real = ev.blowup && i >= 2 ? i + 1 : i;
      out = G.resolveDrama(ev.tid, real); break; }
    case 'hate': if (i === 4) { done(); return ''; } out = G.respondHate(i); break;
    case 'label':
      if (i === 0) { G.activeMembers().forEach(id => { S.people[id].wb = clamp(S.people[id].wb - 8, 5, 100); }); S.group.momentum = clamp(S.group.momentum + 8, 0, 100); S.label -= 30; out = 'Two extra weeks of promotion. Everyone is tired.'; }
      else if (i === 1) { if (G.cohesion() >= 10 || chance(.5)) { S.label -= 15; G.activeMembers().forEach(id => { S.people[id].wb = clamp(S.people[id].wb - 2, 5, 100); }); out = 'You meet halfway: one variety show, no extra promo.'; } else { S.label += 5; out = 'The label will not budge. Nothing is settled.'; } }
      else { S.label = clamp(S.label + 10, 0, 100); G.members().forEach(a => G.members().forEach(b => { if (a < b) G.addBond(a, b, 2); })); out = 'You say no. The members notice who had their back.';
        if (!S.hate && chance(.25)) startHate('overwork'); }
      S.label = clamp(S.label, 0, 100); break;
    case 'lowwb':
      if (i === 0) { G.startHiatus(ev.id, 3); out = n(ev.id) + ' takes a break. The group will perform as a smaller lineup for now.'; }
      else if (i === 1) { S.ctrl[ev.id] === 'manual' ? (S.plan[ev.id] = 'rest') : (S.plan['auto:' + ev.id] = 'rest'); out = n(ev.id) + ' gets a lighter month.'; }
      else { G.p(ev.id).pushed++; out = 'She keeps going. It will cost her on stage.'; }
      break;
    case 'return': if (i === 0) { G.endHiatus(ev.id); out = n(ev.id) + ' is back with the group.'; } else { G.p(ev.id).hiatus = 2; out = 'Two more months. No rush.'; } break;
    case 'renewal': out = renewal(i === 0); break;
    case 'ending': break;
    default: break;
  }
  done();
  return out;
};

/* Survival show. */
function showScores(acc, focusPlayed) {
  return G.trainees().map(id => {
    const p = S.people[id];
    const judges = G.stageScore([id], id === S.focus && focusPlayed ? acc : null);
    const fans = p.fan + rnd(-4, 4);
    return { id, judges, fans, total:judges * .6 + fans * .4 + rnd(-3, 3) };
  }).sort((a, b) => b.total - a.total);
}
function cutPeople(ids, code) {
  ids.forEach(id => { const p = S.people[id]; p.status = 'cut'; p.out = code; });
  S.tensions = S.tensions.filter(t => !ids.includes(t.a) && !ids.includes(t.b));
  S.queue = S.queue.filter(e => !(e.kind === 'drama' && !G.tension(e.tid)));
}
function mission(n, acc, i) {
  const played = i === 0 && acc != null;
  const rows = showScores(acc, played);
  let out;
  if (S.mode === 'real') out = realOut(n === 2 ? 'M2' : 'M' + n);
  else { const k = ({ 1:2, 2:Math.max(0, rows.length - 13), 3:3 })[n]; out = rows.slice(-k).map(r => r.id); }
  rows.forEach((r, idx) => { S.people[r.id].fan = clamp(S.people[r.id].fan + (rows.length - idx) * .25, 0, 100); });
  const fr = rows.findIndex(r => r.id === S.focus);
  cutPeople(out, 'M' + n);
  log('Mission ' + n + ': ' + out.map(G.name).join(', ') + ' eliminated.', 'show');
  feed('@eval_tracker', 'Mission ' + n + ' results: ' + out.map(G.name).join(', ') + ' going home. I\'m not okay.', 0);
  let t = (fr >= 0 ? G.name(S.focus) + ' places ' + (fr + 1) + ' of ' + rows.length + ' this mission. ' : '') + 'Going home: ' + out.map(G.full).join(', ') + '.';
  if (out.includes(S.focus)) { q({ kind:'cutFocus' }); t += ' Including ' + G.name(S.focus) + '.'; }
  return t;
}
function finale(acc, i) {
  const played = i === 0 && acc != null;
  const rows = showScores(acc, played);
  let six;
  if (S.mode === 'real') six = D.cast.filter(c => c.real).map(c => c.id);
  else six = rows.slice(0, 6).map(r => r.id);
  const out = G.trainees().filter(id => !six.includes(id));
  six.forEach((id, k) => { const p = S.people[id]; p.status = 'member'; p.warn = false; });
  cutPeople(out, 'F');
  S.order = six.concat(S.order.filter(id => !six.includes(id)));
  S.group.formed = true;
  S.group.fans = 1500000 + six.reduce((t, id) => t + S.people[id].fan * 20000, 0);
  S.group.momentum = 35;
  log('Live finale: ' + six.map(G.name).join(', ') + ' will debut.', 'show');
  feed('@lightstickhq', 'THE SIX. ' + six.map(G.name).join(', ') + '. I\'m crying.', 1);
  let t;
  if (S.mode === 'real') {
    t = 'As in the real finale: ' + D.cast.filter(c => c.real).map(c => c.first + ' ' + c.score.toFixed(2)).join(', ') + '. Samara Siqueira finishes seventh with 66.67, 1.33 points short.';
  } else t = 'The six: ' + six.map(id => G.name(id) + ' (' + Math.round(rows.find(r => r.id === id).total) + ')').join(', ') + '.';
  if (!six.includes(S.focus) && G.p(S.focus).status !== 'solo') q({ kind:'cutFocus' });
  return t;
}

/* Contracts. */
function stay(id, lighter) { const p = S.people[id]; return p.wb * .4 + G.groupBond(id) * .8 + p.fan * .2 + (lighter ? 12 : 0) + rnd(0, 20); }
function renewalText() {
  const w = G.members().filter(id => stay(id, false) < 50);
  return 'Every contract is up. ' + (w.length ? 'The ones who seem unsure: ' + w.map(G.name).join(', ') + '.' : 'Nobody seems to be wavering.') + ' Wellbeing and how close each member feels to the group decide who signs.';
}
function renewal(lighter) {
  if (lighter) S.label = clamp(S.label + 15, 0, 100);
  const leave = G.members().filter(id => id !== S.focus && stay(id, lighter) < 40);
  leave.forEach(id => { S.people[id].status = 'solo'; S.alumni.push(id); S.ctrl[id] = 'balanced'; });
  S.tensions = S.tensions.filter(t => !leave.includes(t.a) && !leave.includes(t.b));
  log('Contract renewal: ' + (leave.length ? leave.map(G.name).join(', ') + ' leave to go solo, on good terms.' : 'everyone re-signs.'), 'story');
  if (G.members().length < 3) { endGame(); return 'Too few members are left to carry on as a group.'; }
  return leave.length ? leave.map(G.name).join(', ') + ' will not re-sign. They leave on good terms to go solo.' : 'Everyone signs again.';
}

/* Endings. */
function endGame() {
  if (S.ended) return;
  const fans = S.group.fans, coh = G.cohesion(G.members().concat(S.alumni));
  let e = 'standing';
  if (G.members().length < 3) e = coh >= 15 ? 'reunion' : 'solo';
  else if (fans >= 6e7 && S.rec.no1 >= 1 && S.rec.wins >= 2 && coh >= 10) e = 'legends';
  else if (S.alumni.length && coh >= 15) e = 'reunion';
  else if (fans < 8e6 && coh >= 20) e = 'cult';
  S.ended = e;
  S.month = Math.min(S.month, D.END);
  log('Ending: ' + D.endings[e].t + '.', 'chapter');
  S.queue = [{ kind:'ending' }];
}
G.endNow = () => { endGame(); save(); };

/* ---------- Saves ---------- */
const KEY = 'dreamacademy-save-v1';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function save() { if (S) lsSet(KEY, JSON.stringify(S)); }
G.save = save;
G.hasSave = () => !!lsGet(KEY);
G.load = () => { try { const s = JSON.parse(lsGet(KEY)); if (s && s.v === 1) { S = s; return true; } } catch (e) {} return false; };
G.wipe = () => { try { localStorage.removeItem(KEY); } catch (e) {} S = null; };
G.exportSave = () => btoa(unescape(encodeURIComponent(JSON.stringify(S))));
G.importSave = txt => { try { const s = JSON.parse(decodeURIComponent(escape(atob(txt.trim())))); if (s && s.v === 1 && s.people) { S = s; save(); return true; } } catch (e) {} return false; };
})();
