/* Final Cut: game engine. Pure state logic, no DOM, so it also runs in node for the simulation tests. */
(function (root) {
const D = root.FCD;
const FC = root.FC = { VERSION: 1, START_YEAR: 2027 };

// ------------------------------------------------------------------ helpers
const R = () => Math.random();
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 9);
FC.h = { R, rnd, irnd, pick, clamp, uid };

FC.money = n => {
  const s = n < 0 ? '-' : ''; n = Math.abs(n);
  if (n >= 1e9) return s + '$' + (n / 1e9).toFixed(n >= 1e10 ? 1 : 2) + 'B';
  if (n >= 1e6) return s + '$' + (n / 1e6).toFixed(n >= 1e8 ? 0 : 1) + 'M';
  if (n >= 1e3) return s + '$' + Math.round(n / 1e3) + 'K';
  return s + '$' + Math.round(n);
};
FC.num = n => n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n));
FC.year = (S, w = S.week) => FC.START_YEAR + Math.floor(w / 52);
FC.woy = (S, w = S.week) => (w % 52) + 1;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
FC.dateLabel = (S, w = S.week) => { const wy = w % 52; return MONTHS[Math.min(11, Math.floor(wy / 4.34))] + ' ' + FC.year(S, w) + ' · wk ' + (wy + 1); };
FC.monthYear = (S, w) => { const wy = w % 52; return MONTHS[Math.min(11, Math.floor(wy / 4.34))] + ' ' + FC.year(S, w); };
FC.age = S => S.me.age + Math.floor(S.week / 52);
const diffMul = S => S.diff === 'easy' ? 1.25 : S.diff === 'hard' ? 0.8 : 1;

FC.defaultLook = () => ({ skin: D.SKINS[2], hair: 'short', hairColor: D.HAIR_COLORS[1], eyes: D.EYE_COLORS[0], face: 'oval', nose: 'med', lips: 'med', brows: 'straight', facial: 'none', body: 'avg', height: 'm',
  top: 'tee', topColor: D.CLOTH_COLORS[0], bottom: 'jeans', bottomColor: D.CLOTH_COLORS[4], shoes: 'sneakers', shoesColor: D.CLOTH_COLORS[1], acc: 'none', accColor: D.CLOTH_COLORS[3] });

// ------------------------------------------------------------------ new game
FC.newGame = function (o) {
  const st = D.STORIES.find(x => x.id === o.story) || D.STORIES[0];
  const S = {
    v: FC.VERSION, slot: o.slot || 1, diff: o.diff || 'normal', week: 0, created: Date.now(),
    me: { name: (o.name || 'New Actor').slice(0, 30), pronoun: o.pronoun || 'they', cat: o.cat || 'a', city: o.city || 'Los Angeles', story: st.id, age: o.age || st.age || 22, traits: (o.traits || []).slice(0, 2), goal: o.goal || 'oscar' },
    look: Object.assign(FC.defaultLook(), o.look || {}), skills: Object.assign({}, st.skills),
    energy: 100, health: 100, happy: 70, money: st.money, fame: st.fame, rep: st.rep, followers: st.followers || Math.round(300 + st.fame * 4000), contacts: st.contacts, buzz: st.critics || 0,
    agency: st.id === 'nepo' ? 'gersh' : st.id === 'disney' ? 'boutique' : 'none', team: { manager: 0, publicist: 0, stylist: 0, trainer: 0, lawyer: 0 }, teamNames: {},
    board: [], offers: [], jobs: [], credits: [], studios: {}, roll: [], lens: [], theaters: [], myChars: [], fr: {}, heroFatigue: 0.15,
    news: [], feed: [], inbox: [], pending: [], log: [], awards: [], awardNoms: {}, fyc: {}, festivalsDone: {},
    home: st.money > 200000 ? 'h1' : 'h0', homes: [], cars: [], invest: {}, charity: 0, brands: [], love: null, company: null, scripts: [],
    yearEarn: 0, yearEarnHist: [], taxable: 0, lifetimeEarn: 0, lifetimeBO: 0, achievements: {}, timeline: [], lowPoint: false, burnouts: 0, hiatus: 0,
    prepped: {}, typecast: {}, lastWork: 0, star: false, ended: null, tut: 0, weekActs: 0, stats: { auditions: 0, booked: 0, films: 0 },
  };
  if (st.typecast) S.typecast[st.typecast] = 3;
  initFranchises(S);
  seedTheaters(S);
  for (let i = 0; i < 6; i++) S.board.push(genProject(S));
  S.stageBoard = []; refreshStage(S);
  addNews(S, `${S.me.name} arrives in Los Angeles hoping for a break.`, 'you');
  timeline(S, `Moved to Los Angeles as a ${st.name.toLowerCase()}.`);
  S.inbox.push({ id: uid(), kind: 'note', from: 'Final Cut', t: 'Welcome to Hollywood', d: 'The Casting board lists roles you can audition for. Spend your week on classes and auditions, then press End week. Land small parts, build your name, and work your way up to franchise leads.' });
  return S;
};
function initFranchises(S) {
  for (const f of D.FRANCHISES) {
    S.fr[f.id] = {
      fatigue: 0, mood: 60, films: 0,
      chars: f.chars.map(c => ({ name: c[0], actor: c[1], ends: FC.START_YEAR + c[2], risk: c[3], status: 'active' }))
        .concat(f.open.map(n => ({ name: n, actor: null, ends: 0, risk: 0, status: 'open' }))),
      used: [],
    };
  }
}

// ------------------------------------------------------------------ derived stats
FC.starPower = S => {
  const recent = S.credits.filter(c => c.ww && S.week - c.released < 156).slice(-4);
  const bo = recent.length ? recent.reduce((a, c) => a + Math.log10(Math.max(1e6, c.ww)) - 6, 0) / recent.length : 0; // 0..3.3
  const wins = S.awards.filter(a => a.won && a.weight > 0).reduce((a, x) => a + x.weight, 0);
  return Math.round(clamp(S.fame * 0.55 + bo * 9 + Math.min(15, wins * 4) + (S.rep - 50) * 0.15 + S.myChars.filter(c => c.status === 'active').length * 3, 0, 100));
};
FC.netWorth = S => S.money + S.homes.reduce((a, h) => a + (D.HOMES.find(x => x.id === h) || {}).price * 0.9, 0) + S.cars.reduce((a, c) => a + (D.CARS.find(x => x.id === c) || {}).price * 0.5, 0) + Object.values(S.invest).reduce((a, v) => a + v, 0);
FC.agency = S => D.AGENCIES.find(a => a.id === S.agency) || D.AGENCIES[0];
FC.tier = S => FC.agency(S).tier;
FC.skillAvg = S => Object.values(S.skills).reduce((a, v) => a + v, 0) / D.SKILLS.length;
const has = (S, t) => S.me.traits.includes(t);
FC.has = has;

// ------------------------------------------------------------------ news / feed / timeline
function addNews(S, t, tag = 'industry') { S.news.unshift({ w: S.week, t, tag }); if (S.news.length > 120) S.news.length = 120; }
function addFeed(S, who, t, likes) { S.feed.unshift({ w: S.week, who, t, likes: likes || Math.round(rnd(50, 5000) * (1 + S.fame)) }); if (S.feed.length > 80) S.feed.length = 80; }
function timeline(S, t) { S.timeline.push({ w: S.week, t }); }
FC.addNews = addNews; FC.addFeed = addFeed;
function earn(S, amt, why, opts = {}) {
  if (amt <= 0) return 0;
  const ag = opts.noAgent ? 0 : FC.agency(S).cut, mg = opts.noAgent ? 0 : (S.team.manager ? 0.05 : 0);
  const net = Math.round(amt * (1 - ag - mg) * (opts.noMul ? 1 : 1));
  S.money += net; S.yearEarn += amt; S.taxable += net; S.lifetimeEarn += amt;
  S.log.push(`+${FC.money(net)} ${why}${ag + mg > 0 ? ' (after commission)' : ''}`);
  return net;
}
FC.earn = earn;
function gainFame(S, v) { S.fame = clamp(S.fame + (v > 0 ? v * Math.pow(1 - S.fame / 105, 1.4) : v), 0, 100); }
FC.gainFame = gainFame;
// what a role pays: mostly star power, then budget
function payFor(S, size, budget, kind) {
  const sp = FC.starPower(S); const sf = 1 + Math.pow(sp / 100, 2.5) * 19;
  const base = { extra: 1500, small: 18000, cameo: 120000, voice: 200000, supporting: 140000, ensemble: 350000, lead: 500000 }[size] || 50000;
  const bf = budget ? clamp(0.4 + budget / 140e6, 0.3, 2.4) : 1;
  let pay = base * bf * sf * rnd(0.8, 1.25);
  if (kind === 'tv') pay = ({ small: 40000, supporting: 300000, ensemble: 500000, lead: 800000 }[size] || 200000) * sf * rnd(0.8, 1.2);
  if (kind === 'guest') pay = rnd(12000, 40000) * (1 + sf / 6);
  if (kind === 'theater') pay = rnd(5000, 14000) * (1 + sf / 3);
  if (kind === 'commercial') pay = rnd(4000, 18000) * (1 + sf / 2);
  if (size === 'extra') pay = rnd(800, 2000);
  return Math.round(pay * diffMul(S) / 100) * 100;
}
FC.payFor = payFor;

// ------------------------------------------------------------------ which 3D set a project shoots on
FC.setFor = function (job) {
  if (!job) return 'green';
  const fr = { starwars: 'desert', dune: 'desert', hp: 'castle', jurassic: 'forest', wick: 'street', fast: 'street', bond: 'period', hunger: 'forest', spiderverse: 'booth', elseworlds: 'city' }[job.fid];
  if (fr) return fr; if (job.theater) return 'stage';
  const h = [...String(job.id || job.title)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const two = (a, b) => h % 2 ? a : b;
  return { superhero: two('city', 'green'), scifi: 'space', period: 'period', biopic: 'period', fantasy: 'castle', action: two('street', 'desert'), horror: 'horror', drama: 'home', comedy: two('diner', 'home'), romance: two('street', 'home'), thriller: two('office', 'street'), musical: 'stage', animation: 'booth' }[job.genre] || 'home';
};

// ------------------------------------------------------------------ costume fittings
FC.costumeOptions = function (S, j) {
  if (j.costumeOpts) return j.costumeOpts;
  const g = j.theater && j.stageType === 'musical' ? 'musical' : (D.COSTUME_GENRE[j.genre] || 'default');
  const fem = S.me.cat === 's'; const pickG = v => typeof v === 'string' && v.includes('|') ? v.split('|')[fem ? 0 : 1] : v;
  j.costumeOpts = D.COSTUMES[g].map(c => ({ name: c.name, d: c.d, colors: c.colors, fx: c.fx, look: Object.fromEntries(Object.entries(c.look).map(([k, v]) => [k, pickG(v)])) }));
  return j.costumeOpts;
};
FC.chooseCostume = function (S, jid, i, color) {
  const j = S.jobs.find(x => x.id === jid); if (!j) return { ok: false };
  const o = FC.costumeOptions(S, j)[i]; if (!o) return { ok: false };
  if (j.costume) { const f = j.costume.fx || {}; j.perfAdj = (j.perfAdj || 0) - (f.perf || 0); }
  const look = Object.assign({}, o.look, { topColor: color || o.colors[0] }); if (look.top === 'hero') look.accColor = '#d8b04a';
  if (look.bottom && !o.look.bottomColor) look.bottomColor = look.top === 'hero' ? look.topColor : shadeHex(color || o.colors[0]);
  j.costume = { name: o.name, look, fx: o.fx, i, color };
  j.perfAdj = (j.perfAdj || 0) + (o.fx.perf || 0); j.costumeBuzz = o.fx.buzz || 0; j.comfort = o.fx.comfort || 0;
  return { ok: true, t: `${o.name}: locked in.` };
};
function shadeHex(h) { return ['#1d1d24', '#1f3a5f', '#3a3f4c', '#5b4a3a'][[...h].reduce((a, c) => a + c.charCodeAt(0), 0) % 4]; }

// ------------------------------------------------------------------ studios (brands)
FC.studioOf = name => D.STUDIOS.find(st => st.name === name || (name || '').startsWith(st.name)) || null;
FC.brand = name => { const st = FC.studioOf(name); return st && st.brand != null ? st.brand : 0.25; };
FC.studioRel = (S, name) => (S.studios || {})[name] || 0;
function studioShift(S, name, v, why) { if (!name || !FC.studioOf(name)) return; S.studios = S.studios || {}; S.studios[name] = clamp((S.studios[name] || 0) + v, -50, 50); if (why && Math.abs(v) >= 5) S.log.push(`${name} ${v > 0 ? 'loves' : 'is unhappy with'} ${why}.`); }
FC.studioShift = studioShift;
FC.buzz = (S, j) => { const tot = (j.press || []).length, done = (j.press || []).filter(p => p.done).length; const t = j.trailer ? Math.min(25, Math.log10(1 + j.trailer.views) * 3.2) : 0;
  return Math.round(clamp((j.costumeBuzz || 0) + FC.brand(j.studio) * 38 + S.fame * 0.28 + (tot ? done / tot : 0.3) * 18 + t + (j.teamup ? 8 : 0) + (j.costars || []).reduce((a, n) => a + ((D.ACTORS.find(x => x[0] === n) || [0, 0, 2])[2] - 2), 0) * 2, 0, 100)); };

// ------------------------------------------------------------------ project generation
const SIZES = { extra: { n: 'Background', need: 0, pay: 1, f: 0.2 }, cameo: { n: 'Cameo', need: 30, pay: 4, f: 1 }, small: { n: 'Small part', need: 18, pay: 3, f: 0.6 },
  supporting: { n: 'Supporting', need: 36, pay: 8, f: 1.4 }, lead: { n: 'Lead', need: 52, pay: 20, f: 3 }, ensemble: { n: 'Ensemble lead', need: 44, pay: 12, f: 2 }, voice: { n: 'Voice role', need: 30, pay: 6, f: 1 } };
FC.SIZES = SIZES;
function filmTitle() { return R() < 0.45 ? pick(D.TITLE_ONE) : pick(D.TITLE_A) + ' ' + pick(D.TITLE_B); }
function director(genre, minP = 1, maxP = 5) {
  const pool = D.DIRECTORS.filter(d => d[1] >= minP && d[1] <= maxP && (d[2].includes(genre) || R() < 0.15));
  const d = pick(pool.length ? pool : D.DIRECTORS); return { name: d[0], p: d[1] };
}
function actorFor(cat, minStar = 1) { const pool = D.ACTORS.filter(a => (!cat || a[1] === cat) && a[2] >= minStar); return pick(pool.length ? pool : D.ACTORS); }
function costars(n, avoid = []) { const out = []; let g = 0; while (out.length < n && g++ < 40) { const a = pick(D.ACTORS)[0]; if (!out.includes(a) && !avoid.includes(a)) out.push(a); } return out; }
FC.costars = costars;

function genProject(S, force) {
  const tier = FC.tier(S), fame = S.fame, sp = FC.starPower(S);
  // what kinds can this actor be seen for
  const w = [];
  w.push(['commercial', fame < 30 ? 3 : 1]); if (fame < 15) w.push(['extra', 3]);
  w.push(['guest', fame < 40 ? 3 : 1]); w.push(['indie', 3]);
  if (tier >= 1 || fame >= 8) { w.push(['film', 3]); w.push(['tv', 2]); }
  if (tier >= 2 || fame >= 15) { w.push(['franchise', 2 + tier * 0.6]); w.push(['voice', 1]); }
  if (fame >= 35) w.push(['franchise', 3]);
  let kind = force; if (!kind) { const tot = w.reduce((a, x) => a + x[1], 0); let r = R() * tot; for (const [k, v] of w) { r -= v; if (r <= 0) { kind = k; break; } } kind = kind || 'indie'; }
  const p = { id: uid(), kind, expires: S.week + irnd(3, 6), posted: S.week, script: irnd(35, 92) };
  const big = sp + tier * 6; // how big a role the town will see you for
  const sizeFor = () => { const opts = ['small']; if (big > 12) opts.push('supporting'); if (big > 28) opts.push('supporting', 'lead'); if (big > 45) opts.push('lead', 'lead'); return pick(opts); };
  if (kind === 'commercial') { Object.assign(p, { title: 'Commercial for ' + pick(D.COMMERCIALS), genre: 'comedy', studio: 'Ad agency', size: 'small', pay: payFor(S, 'small', 0, 'commercial'), weeks: { prep: 0, shoot: 1, post: 0 }, director: { name: 'a commercial director', p: 1 } }); }
  else if (kind === 'extra') { const g = pick(D.GENRES).id; Object.assign(p, { title: filmTitle(), genre: g, studio: pick(D.STUDIOS).name, size: 'extra', pay: payFor(S, 'extra'), weeks: { prep: 0, shoot: 1, post: 12 }, budget: irnd(20, 120) * 1e6, director: director(g), credit: 'Background' }); }
  else if (kind === 'guest') { const t = pick(D.TV_TITLES); Object.assign(p, { title: t, genre: pick(['drama', 'comedy', 'thriller']), studio: pick(['HBO', 'Netflix', 'Apple', 'FX', 'NBC', 'ABC', 'Hulu']), size: 'small', tv: true, guest: true, pay: payFor(S, 'small', 0, 'guest'), weeks: { prep: 0, shoot: 2, post: 6 }, director: director('drama', 1, 3) }); }
  else if (kind === 'tv') { const t = pick(D.TV_TITLES); const g = pick(['drama', 'comedy', 'thriller', 'horror', 'period']); const sz = sizeFor() === 'lead' ? 'lead' : pick(['supporting', 'ensemble']);
    Object.assign(p, { title: t, genre: g, studio: pick(['HBO', 'Netflix', 'Apple TV', 'FX', 'Prime Video', 'Hulu', 'Max', 'Peacock']), size: sz, tv: true, season: 1, pay: payFor(S, sz, 0, 'tv'), weeks: { prep: 2, shoot: 10, post: 8 }, director: director(g, 2, 5) }); }
  else if (kind === 'theater') return genStageProject(S);
  else if (kind === 'theater_old') { const t = pick(D.THEATER); Object.assign(p, { title: t, genre: /Todd|Cabaret|Sunset/.test(t) ? 'musical' : 'drama', studio: pick(['Broadway', 'the West End']), size: big > 30 ? 'lead' : 'supporting', theater: true, pay: payFor(S, 'lead', 0, 'theater'), weeks: { prep: 3, shoot: 14, post: 0 }, director: director('drama', 3, 5), weekly: true }); }
  else if (kind === 'voice') { const g = 'animation'; Object.assign(p, { title: filmTitle(), genre: g, studio: pick(['Pixar', 'Disney Animation', 'DreamWorks', 'Illumination', 'Sony Pictures Animation']), size: 'voice', pay: payFor(S, 'voice', 120e6), weeks: { prep: 0, shoot: 3, post: 30 }, budget: irnd(80, 200) * 1e6, director: director('comedy', 1, 4), wide: true }); }
  else if (kind === 'indie') { const g = pick(['drama', 'drama', 'thriller', 'horror', 'romance', 'comedy', 'period', 'biopic']); const st = pick(D.STUDIOS.filter(s => s.prestige)); const sz = big > 20 ? pick(['supporting', 'lead', 'lead']) : pick(['small', 'supporting', 'lead']);
    Object.assign(p, { title: filmTitle(), genre: g, studio: st.name, size: sz, prestige: true, pay: Math.round(payFor(S, sz, 8e6) * 0.6), weeks: { prep: 2, shoot: 5, post: 14 }, budget: irnd(2, 18) * 1e6, director: director(g, 2, 5), script: irnd(50, 96) }); }
  else if (kind === 'film') { const g = pick(['drama', 'comedy', 'action', 'thriller', 'horror', 'romance', 'scifi', 'musical', 'period', 'biopic', 'fantasy']); const st = pick(D.STUDIOS.filter(s => !s.prestige && s.tier >= 3 && !['marvel', 'dc', 'lucas', 'eon'].includes(s.id))); const sz = sizeFor();
    const budget = irnd(20, st.tier >= 4 ? 180 : 70) * 1e6;
    Object.assign(p, { title: filmTitle(), genre: g, studio: st.name, size: sz, prestige: ['drama', 'period', 'biopic'].includes(g) && R() < 0.5, pay: payFor(S, sz, budget), weeks: { prep: 3, shoot: budget > 80e6 ? 14 : 10, post: 18 }, budget, director: director(g, 2, 5), wide: true }); }
  else if (kind === 'franchise') return genFranchiseProject(S, null, null) || genProject(S, 'film');
  p.costars = p.kind === 'commercial' ? [] : costars(p.size === 'lead' ? 2 : 1);
  p.rival = actorFor(S.me.cat, p.size === 'lead' ? 3 : 1)[0];
  p.need = needFor(S, p);
  return p;
}
FC.genProject = genProject;
function needFor(S, p) {
  let n = { extra: 8, small: 24, supporting: 38, voice: 36, ensemble: 44, cameo: 34, lead: 52 }[p.size] || 34;
  n -= FC.studioRel(S, p.studio) / 6;
  if (p.director) n += (p.director.p - 2) * 3;
  if (p.fid) n += 8; if (p.char && p.char.kind === 'recast') n += 6; if (p.size === 'lead' && p.fid) n += 6;
  if (p.kind === 'commercial') n = 12;
  if (S.diff === 'easy') n -= 6; if (S.diff === 'hard') n += 6;
  return n;
}

// ------------------------------------------------------------------ live theatre
const STAGE_DIRS = [['Rachel Chavkin', 4], ['Jamie Lloyd', 4], ['Marianne Elliott', 5], ['Thomas Kail', 4], ['Michael Arden', 4], ['Sam Gold', 4], ['Ivo van Hove', 5], ['Rebecca Frecknall', 4], ['Stephen Daldry', 5], ['Diane Paulus', 4], ['Bartlett Sher', 4], ['Lyndsey Turner', 4], ['Dominic Cooke', 4], ['Danny Sapani', 3]];
function genStageProject(S, region) {
  region = region || (R() < 0.55 ? 'broadway' : 'westend');
  const big = FC.starPower(S) + FC.tier(S) * 4 + (S.skills.voice + S.skills.drama) / 8;
  let title, type, prod, roles;
  if (R() < 0.18) { type = R() < 0.65 ? 'musical' : 'play'; title = pick(type === 'musical' ? D.NEW_MUSICALS : D.NEW_PLAYS); prod = 'new'; roles = [['the lead', 'lead'], ['the lead\'s best friend', 'supporting'], ['the villain', 'supporting']]; }
  else { const sh = pick(D.STAGE_SHOWS); title = sh[0]; type = sh[1]; prod = sh[2]; roles = sh[3]; }
  if (S.me.pronoun !== 'they') { const fem = S.me.cat === 's'; const ok = roles.filter(r => D.STAGE_ANY.includes(r[0]) || D.STAGE_FEMALE.includes(r[0]) === fem); if (ok.length) roles = ok; }
  let size = big > 45 ? pick(['lead', 'lead', 'supporting']) : big > 25 ? pick(['supporting', 'supporting', 'lead', 'small']) : pick(['small', 'small', 'supporting']);
  let role;
  if (size === 'small') role = pick(D.STAGE_SMALL) + (R() < 0.5 ? '' : ` (covers ${pick(roles)[0]})`);
  else { const opts = roles.filter(r => r[1] === size); const r = pick(opts.length ? opts : roles); role = r[0]; size = r[1]; }
  if (role.startsWith('Understudy') && !role.includes('covers')) { const ld = roles.filter(r => r[1] === 'lead'); role += ` (covers ${pick(ld.length ? ld : roles)[0]})`; }
  const venue = pick(D.VENUES[region]); const d = pick(STAGE_DIRS);
  const base = payFor(S, 'lead', 0, 'theater') * (region === 'westend' ? 0.8 : 1);
  const p = { id: uid(), kind: 'theater', theater: true, weekly: true, stageType: type, prod, region, title, stageRole: role, size,
    genre: type === 'musical' ? 'musical' : 'drama', studio: `${venue}, ${region === 'broadway' ? 'Broadway' : 'West End'}`, director: { name: d[0], p: d[1] },
    pay: Math.round(base * (size === 'small' ? 0.32 : size === 'supporting' ? 0.6 : 1) / 100) * 100,
    weeks: { prep: prod === 'new' ? 5 : 3, shoot: prod === 'long' ? 26 : prod === 'new' ? 20 : prod === 'revival' ? 16 : 14, post: 0 },
    script: prod === 'long' ? irnd(70, 95) : prod === 'new' ? irnd(35, 92) : irnd(65, 95), expires: S.week + irnd(4, 6), posted: S.week, costars: costars(size === 'lead' ? 2 : 1) };
  p.rival = actorFor(S.me.cat, size === 'lead' ? 3 : 1)[0];
  p.need = { small: 26, supporting: 44, lead: 60 }[size] + (prod === 'revival' && size === 'lead' && S.fame < 45 ? 8 : 0) + (prod === 'new' ? -3 : 0) + (S.diff === 'easy' ? -6 : S.diff === 'hard' ? 6 : 0);
  return p;
}
FC.genStageProject = genStageProject;
FC.stageFit = (S, p) => p.stageType === 'musical' ? S.skills.voice * 0.5 + S.skills.fitness * 0.15 + S.skills.charisma * 0.2 + S.skills.drama * 0.15 : S.skills.drama * 0.55 + S.skills.voice * 0.2 + S.skills.accents * 0.15 + S.skills.charisma * 0.1;
FC.stageSetup = function (S, pid) {
  const p = S.stageBoard.find(x => x.id === pid); if (!p) return null; const mus = p.stageType === 'musical';
  const want = mus ? pick(D.SONG_TYPES)[0] : (/Hamlet|Macbeth|Romeo|Earnest/.test(p.title) ? 'classical' : pick(D.MONO_TYPES)[0]);
  const wantName = (mus ? D.SONG_TYPES : D.MONO_TYPES).find(x => x[0] === want)[1].toLowerCase();
  const hints = D.BEAT_HINTS[mus ? 'musical' : 'drama']; const beats = hints.slice(0, 2).map(h => ({ text: h[1], ans: h[0] }));
  return { mus, want, note: `Casting note: "${mus ? 'Bring 16 bars' : 'Prepare two minutes'}. We'd love to hear ${wantName}."`, beats, third: mus ? 'dance' : 'callback' };
};
FC.stageAudition = function (S, pid, o) {
  const p = S.stageBoard.find(x => x.id === pid); if (!p) return { ok: false, t: 'That listing is gone.' };
  if (S.energy < 20) return { ok: false, t: 'Not enough energy for this audition.' };
  S.energy -= 20; S.stats.auditions++;
  const st = o.setup; const fit = FC.stageFit(S, p);
  let pts = o.piece === st.want ? 6 : 1; const pieceSk = st.mus ? (o.piece === 'character' ? 'comedy' : 'voice') : (o.piece === 'comic' ? 'comedy' : 'drama'); pts += (S.skills[pieceSk] - 35) / 10;
  (o.tones || []).forEach((t, i) => { if (st.beats[i] && t === st.beats[i].ans) pts += 3; else pts -= 1; });
  const list = st.mus ? D.DANCE_CALL : D.PLAY_CALLBACK; const c = list.find(x => x[0] === o.third) || list[list.length - 1];
  pts += c[2] ? (S.skills[c[2]] - 35) / 6 + rnd(-3, 3) : 1;
  const prep = (S.prepped[pid] || 0) * 3; const name = Math.min(10, FC.starPower(S) * 0.15);
  const score = fit * 0.72 + pts + prep + name + (has(S, 'charming') ? 2 : 0) + rnd(-6, 6) + (S.diff === 'easy' ? 4 : 0);
  const need = p.need + ((D.ACTORS.find(a => a[0] === p.rival) || [0, 0, 2])[2] - 2) * 2;
  const cast = score >= need; S.stageBoard = S.stageBoard.filter(x => x.id !== pid); delete S.prepped[pid];
  const perf = clamp(Math.round(fit * 0.9 + pts + prep + rnd(-5, 8)), 5, 99);
  if (cast) { S.stats.booked++; p.won = true; p.perf0 = perf; S.offers.push(p); }
  return { ok: true, cast, score: Math.round(score), need: Math.round(need), rival: p.rival, p, verdict: cast ? 'cast' : score >= need - 5 ? 'shortlist' : 'lost' };
};
FC.stagePrep = function (S, pid) { const p = S.stageBoard.find(x => x.id === pid); if (!p) return { ok: false, t: 'That listing is gone.' }; if (S.energy < 20) return { ok: false, t: 'Not enough energy.' }; if ((S.prepped[pid] || 0) >= 2) return { ok: false, t: 'You are ready.' }; S.energy -= 20; S.prepped[pid] = (S.prepped[pid] || 0) + 1; return { ok: true, t: 'You worked on your song and sides with a coach.' }; };
function refreshStage(S) {
  S.stageBoard = (S.stageBoard || []).filter(p => p.expires > S.week);
  let g = 0; while (S.stageBoard.length < 5 && g++ < 10) S.stageBoard.push(genStageProject(S, S.stageBoard.filter(p => p.region === 'broadway').length < 3 ? 'broadway' : 'westend'));
}
FC.refreshStage = refreshStage;

// franchise role generator. kind: original | deep | recast | variant | young | legacy | contracted
function genFranchiseProject(S, fid, opts = {}) {
  opts = opts || {};
  const sp = FC.starPower(S) + FC.tier(S) * 6;
  const fs = D.FRANCHISES.filter(f => !fid || f.id === fid);
  const F = fid ? fs[0] : pick(fs.filter(f => sp >= 25 || ['mcu', 'dcu', 'starwars', 'hp', 'spiderverse', 'hunger', 'fast', 'jurassic', 'wick'].includes(f.id)));
  if (!F) return null; const st = S.fr[F.id];
  const kinds = [['original', 4]];
  if (F.deep.length) kinds.push(['deep', sp > 30 ? 2 : 0.6]);
  const open = st.chars.filter(c => c.status === 'open'); if (open.length) kinds.push(['recast', open.length > 2 ? 3 : 1.5]);
  const active = st.chars.filter(c => c.status === 'active');
  if (active.length && !F.tvOnly) { kinds.push(['variant', 1]); kinds.push(['young', 1]); }
  if (F.legacy.length && sp > 35) kinds.push(['legacy', 1]);
  let kind = opts.kind; if (!kind) { const tot = kinds.reduce((a, k) => a + k[1], 0); let r = R() * tot; for (const [k, v] of kinds) { r -= v; if (r <= 0) { kind = k; break; } } }
  let ch = { kind };
  if (kind === 'original') { const caped = F.kind === 'superhero' || F.kind === 'animation';
    if (caped) { const code = pick(D.CODENAMES.filter(c => !S.myChars.some(m => m.code === c))); ch.code = code; ch.name = code; ch.power = pick(D.POWERS); }
    else { ch.name = pick(D.HUMAN_NAMES.filter(n => !S.myChars.some(m => m.name === n))); ch.skill = pick(D.ABILITIES[F.kind] || D.ABILITIES.action); }
    ch.type = pick(D.ROLE_TYPES); ch.origin = F.origins.length ? pick(F.origins) : 'a newcomer to the story'; }
  else if (kind === 'deep') { const n = pick(F.deep.filter(x => !st.used.includes(x))) || pick(F.deep); ch.name = n; ch.type = 'hero'; ch.origin = 'from the comics, never adapted before'; }
  else if (kind === 'recast') { const c = opts.char ? st.chars.find(x => x.name === opts.char) : pick(open); if (!c) return null; ch.name = c.name; ch.prev = c.prevActor || null; ch.type = 'hero'; ch.origin = c.prevActor ? `taking over from ${c.prevActor}` : 'first time on screen'; }
  else if (kind === 'variant') { const c = pick(active); ch.name = c.name + ' (variant)'; ch.base = c.name; ch.owner = c.actor; ch.type = pick(['hero', 'villain']); ch.origin = `a ${pick(['darker', 'older', 'twisted', 'heroic', 'grieving'])} version from another universe. ${c.actor} remains the main one.`; }
  else if (kind === 'young') { const c = pick(active); ch.name = 'Young ' + c.name.split(' / ')[0]; ch.base = c.name; ch.owner = c.actor; ch.type = 'hero'; ch.origin = `flashback scenes. ${c.actor} plays the adult version.`; }
  else if (kind === 'legacy') { const lg = pick(F.legacy); const code = F.kind === 'superhero' ? pick(D.CODENAMES) : pick(D.HUMAN_NAMES); ch.name = F.kind === 'superhero' ? `${code}, the new ${lg[0]}` : `${code}, heir to ${lg[0]}`; ch.code = F.kind === 'superhero' ? code : null; ch.mantle = lg[0]; ch.type = 'hero'; ch.origin = `a successor to ${lg[1]}, who may appear as a mentor.`; }
  // size
  let size = opts.size || (sp > 50 ? pick(['lead', 'supporting', 'lead']) : sp > 30 ? pick(['supporting', 'supporting', 'lead']) : pick(['small', 'supporting', 'cameo']));
  if (kind === 'young' || kind === 'variant') size = opts.size || pick(['small', 'supporting']);
  if (F.voice) size = 'voice';
  const tv = F.tvOnly || (F.tv.length && R() < 0.3 && !opts.film);
  let title;
  if (opts.title) title = opts.title;
  else if (tv) title = pick(F.tv.filter(t => !st.used.includes(t)).concat(F.tv)) || F.name;
  else { const avail = F.titles.filter(t => !st.used.includes(t)); title = avail.length ? avail[0] : `${F.short}: ${pick(D.TITLE_A)} ${pick(D.TITLE_B)}`; }
  if (kind === 'original' && !opts.title && !tv && R() < 0.3 && size === 'lead') title = `${ch.code}`;
  const budget = tv ? 0 : (F.kind === 'superhero' || F.kind === 'scifi' ? irnd(180, 300) : irnd(120, 250)) * 1e6;
  const g = F.kind === 'action' ? 'action' : F.kind;
  const pics = F.tvOnly ? 1 : size === 'lead' ? irnd(3, 6) : size === 'supporting' ? irnd(2, 5) : 1;
  const p = { id: uid(), kind: 'franchise', fid: F.id, char: ch, title, genre: g === 'fantasy' && tv ? 'fantasy' : g, studio: D.STUDIOS.find(s => s.id === F.studio).name, size, tv, wide: !tv,
    pay: tv ? payFor(S, size === 'voice' ? 'supporting' : size, 0, 'tv') : payFor(S, size, budget),
    pictures: pics, weeks: tv ? { prep: 3, shoot: 14, post: 10 } : { prep: 6, shoot: 18, post: 26 }, budget, director: director(F.kind === 'animation' ? 'superhero' : F.kind, 2, 5),
    expires: S.week + irnd(4, 7), posted: S.week, script: irnd(45, 88), costars: [], rival: actorFor(S.me.cat, 2)[0], teamup: /Avengers|Justice League|Secret Wars|Assemble|X-Force|Champions|Thunderbolts|Young Avengers/.test(title) };
  // co-stars come from the franchise's own cast
  const castPool = active.filter(c => c.actor && c.name !== ch.base).map(c => c.actor); p.costars = []; for (let i = 0; i < 2 && castPool.length; i++) { const a = pick(castPool); if (!p.costars.includes(a)) p.costars.push(a); }
  if (!p.costars.length) p.costars = costars(1);
  p.need = needFor(S, p);
  if (opts.contracted) { p.contracted = opts.contracted; p.need = 0; }
  return p;
}
FC.genFranchiseProject = genFranchiseProject;

// ------------------------------------------------------------------ weekly activities
FC.ACT_LIMIT = 6;
FC.activities = S => {
  const out = D.ACTIVITIES.slice();
  if (S.company || S.skills.drama >= 30) out.push({ id: 'write', name: 'Write a script', cost: 25, price: 0, d: 'Develop a screenplay for your production company.' });
  if (S.fame >= 20) out.push({ id: 'premiere', name: 'Attend a premiere', cost: 15, price: 0, d: 'Be seen. Build contacts and fame.' });
  if (!S.love && S.fame >= 3) out.push({ id: 'date', name: 'Go on a date', cost: 15, price: 150, d: 'Life outside work.' });
  return out;
};
FC.doActivity = function (S, id) {
  const a = FC.activities(S).find(x => x.id === id); if (!a) return { ok: false, t: 'Unknown activity.' };
  if (S.hiatus > 0 && a.cost > 0) return { ok: false, t: 'You are taking time off to recover. Rest this week.' };
  if (a.cost > 0 && S.energy < a.cost) return { ok: false, t: 'Not enough energy this week.' };
  if (S.money < a.price) return { ok: false, t: `You need ${FC.money(a.price)}.` };
  if (a.cost > 0 && S.weekActs >= FC.ACT_LIMIT) return { ok: false, t: 'Your week is full. End the week to continue.' };
  S.energy = clamp(S.energy - a.cost, 0, 100); S.money -= a.price; if (a.cost > 0) S.weekActs++;
  const out = [];
  const mult = (has(S, 'perfectionist') ? 1.25 : 1) * (1 - Math.max(0, FC.age(S) - 50) * 0.01);
  if (a.gives) for (const [k, v] of Object.entries(a.gives)) {
    let g = v * mult * (1.2 - S.skills[k] / 120); if ((k === 'fitness' || k === 'action') && S.team.trainer) g *= 1 + S.team.trainer * 0.2;
    S.skills[k] = clamp(S.skills[k] + g, 0, 100); out.push(`${D.SKILLS.find(s => s[0] === k)[1]} +${g.toFixed(1)}`);
  }
  if (has(S, 'perfectionist') && a.cost > 0) S.energy = Math.max(0, S.energy - 3);
  if (a.contacts && R() < a.contacts + S.skills.charisma / 300) { S.contacts++; out.push('You made a useful contact'); if (R() < 0.35) S.board.push(genProject(S)); }
  if (id === 'rest') { S.health = clamp(S.health + 6, 0, 100); S.happy = clamp(S.happy + 3, 0, 100); out.push('Energy +30, health +6'); }
  if (id === 'post') return Object.assign({ ok: true }, FC.post(S));
  if (id === 'write') { const q = Math.round(clamp(S.skills.drama * 0.6 + S.skills.comedy * 0.2 + rnd(0, 30), 10, 99)); const g = pick(['drama', 'thriller', 'comedy', 'horror', 'romance', 'scifi', 'biopic', 'period']);
    S.scripts.push({ id: uid(), title: filmTitle(), genre: g, q }); out.push(`You finished a ${D.GENRES.find(x => x.id === g).name.toLowerCase()} script (quality ${q})`); }
  if (id === 'premiere') { gainFame(S, 0.6); if (R() < 0.5) { S.contacts++; out.push('You met someone useful'); } addFeed(S, S.me.name, `Proud of my friends tonight. Go see it! 🎬`); out.push('Fame +0.6'); }
  if (id === 'date') { if (R() < 0.45 + S.skills.charisma / 250) { const n = pick(D.LOVE); S.love = { name: n, job: pick(D.LOVE_JOBS), stage: 'dating', since: S.week, bond: 40 }; out.push(`It clicked. You're seeing ${n}, ${S.love.job}.`); timeline(S, `Started dating ${n}.`); } else out.push('Nice dinner. No spark.'); S.happy = clamp(S.happy + 2, 0, 100); }
  return { ok: true, t: `${a.name}: ${out.join(', ') || 'done'}` };
};
FC.post = S => {
  const reach = S.followers * rnd(0.02, 0.08) * (0.5 + S.skills.charisma / 100);
  const viral = R() < 0.04 + S.skills.comedy / 1500;
  const gain = Math.round((reach * 0.04 + 20 + S.fame * 40) * (viral ? 12 : 1));
  S.followers += gain; gainFame(S, (viral ? 1.5 : 0.15)); S.energy = Math.max(0, S.energy);
  const t = pick(['Table read day.', 'Back in class. Always learning.', 'Gym, coffee, lines.', 'Grateful for this crew.', 'Something big is coming...', 'Reading the most incredible script right now.', 'New headshots!', 'Sunday reset.']);
  addFeed(S, S.me.name, t, Math.round(reach * (viral ? 10 : 1)));
  return { t: viral ? `Your post went viral. +${FC.num(gain)} followers.` : `+${FC.num(gain)} followers.`, viral };
};

// ------------------------------------------------------------------ auditions
FC.prep = function (S, pid) {
  const p = S.board.find(x => x.id === pid); if (!p) return { ok: false, t: 'That role is gone.' };
  if (S.energy < 20) return { ok: false, t: 'Not enough energy to prepare.' };
  if ((S.prepped[pid] || 0) >= 2) return { ok: false, t: 'You know this material cold.' };
  S.energy -= 20; S.prepped[pid] = (S.prepped[pid] || 0) + 1; return { ok: true, t: 'You worked the scenes with a coach. Your audition will be stronger.' };
};
FC.skillFit = (S, p) => { const g = D.GENRES.find(x => x.id === p.genre) || D.GENRES[0]; let s = 0; for (const [k, w] of Object.entries(g.skills)) s += S.skills[k] * w; return s; };
FC.auditionSetup = function (S, pid) {
  const p = S.board.find(x => x.id === pid); const hints = D.BEAT_HINTS[p.genre] || D.BEAT_HINTS.drama;
  const beats = hints.map(h => ({ text: h[1], ans: h[0] }));
  const note = beats[irnd(0, 2)];
  const callback = ['supporting', 'lead', 'ensemble'].includes(p.size) && p.kind !== 'commercial';
  return { beats, note: `Director's note: "In ${note.text}, I want it ${note.ans}."`, chem: callback && p.costars.length ? p.costars[0] : null, screen: p.kind === 'franchise' && p.size !== 'cameo' };
};
FC.CHEM = [['play', 'Play off them'], ['lead', 'Take the lead'], ['light', 'Keep it light']];
FC.SCREEN = [['physical', 'Show the physicality'], ['presence', 'Own the frame'], ['heart', 'Find the heart']];
FC.audition = function (S, pid, o) {
  const p = S.board.find(x => x.id === pid); if (!p) return { ok: false, t: 'That role is gone.' };
  const cost = p.kind === 'commercial' || p.size === 'extra' ? 10 : 20;
  if (!o.free && S.energy < cost) return { ok: false, t: 'Not enough energy for this audition.' };
  if (!o.free) S.energy -= cost;
  S.stats.auditions++;
  const setup = o.setup || FC.auditionSetup(S, pid);
  const fit = FC.skillFit(S, p);
  let beatPts = 0; (o.tones || []).forEach((t, i) => { if (setup.beats[i] && t === setup.beats[i].ans) beatPts += 3; else if (t === 'grounded') beatPts += 1; else beatPts -= 1; });
  let chem = 0; if (setup.chem) { const want = pick(['play', 'play', 'lead', 'light']); chem = o.chem === want ? 5 : o.chem === 'play' ? 2 : -2; if (has(S, 'charming')) chem += 3; chem += (S.skills.charisma - 30) / 12; }
  let screen = 0; if (setup.screen) { const ch = p.char || {}; const want = ch.type === 'villain' ? 'presence' : ch.power === 'no powers, just training' || p.genre === 'action' ? 'physical' : pick(['physical', 'presence', 'heart']);
    screen = (o.screen === want ? 5 : 1) + (S.skills.fitness - 35) / 10 + (S.skills.looks - 35) / 14; }
  const typecast = (S.typecast[p.genre] || 0) > 3 && p.genre !== 'comedy' ? -3 : 0;
  const prep = (S.prepped[pid] || 0) * 3;
  const name = Math.min(14, FC.starPower(S) * 0.2);
  const fancast = p.char && S.fancast && S.fancast === p.char.name ? 6 : 0;
  const score = fit * 0.72 + beatPts + chem + screen + prep + name + typecast + fancast + (has(S, 'charming') ? 2 : 0) + rnd(-7, 7) + (S.diff === 'easy' ? 4 : 0);
  const rivalStr = (D.ACTORS.find(a => a[0] === p.rival) || [0, 0, 2])[2];
  const need = p.need + (rivalStr - 2) * 2;
  const cast = score >= need;
  const perf = clamp(Math.round(fit * 0.9 + beatPts + prep + rnd(-5, 8)), 5, 99);
  const res = { ok: true, cast, score: Math.round(score), need: Math.round(need), rival: p.rival, perf, p, verdict: cast ? 'cast' : score >= need - 5 ? 'shortlist' : 'lost' };
  if (cast) { S.stats.booked++; p.won = true; p.perf0 = perf; S.board = S.board.filter(x => x.id !== pid); S.offers = S.offers || []; S.offers.push(p); }
  else { S.board = S.board.filter(x => x.id !== pid); if (p.char && p.char.kind === 'recast' && R() < 0.5) recastWith(S, p.fid, p.char.name, p.rival); if (p.size !== 'extra' && p.size !== 'small' && R() < 0.4) addNews(S, `${p.rival} lands ${p.char ? p.char.name : 'the ' + SIZES[p.size].n.toLowerCase() + ' role'} in ${p.title}.`, 'casting'); }
  delete S.prepped[pid];
  return res;
};
function recastWith(S, fid, name, actor) { const c = S.fr[fid].chars.find(x => x.name === name); if (c && c.status === 'open') { c.status = 'active'; c.actor = actor; c.ends = FC.year(S) + irnd(3, 6); c.risk = 0.15; } }

// ------------------------------------------------------------------ contracts
FC.dealFor = function (S, p) {
  const sp = FC.starPower(S); const tier = FC.tier(S);
  const base = Math.round(p.pay * (1 + FC.studioRel(S, p.studio) / 250));
  const maxSalary = Math.round(base * (1.15 + sp / 140 + tier * 0.06 + (S.team.lawyer || 0) * 0.03));
  const wide = p.wide && p.size !== 'extra' && p.size !== 'small' && !p.tv;
  const maxPoints = wide ? Math.round(clamp((sp - 30) / 8 + (p.size === 'lead' ? 2 : 0), 0, 12)) : 0;
  const pics = p.pictures || 1;
  return { pid: p.id, base: { salary: base, points: 0, pictures: pics, billing: p.size === 'lead' ? 'top' : p.size === 'supporting' || p.size === 'ensemble' ? 'and' : 'ensemble', perks: [] },
    max: { salary: maxSalary, points: maxPoints, minPics: Math.max(1, pics - 2), maxPics: Math.min(9, pics + 3) }, round: 0, patience: 1 + tier * 0.15 + sp / 200, studioPics: pics };
};
FC.PERKS = [['trailer', 'Star trailer', 1], ['approval', 'Script approval', 3], ['double', 'Stunt double on call', 1], ['director', 'Director approval', 4], ['merch', 'Merch and likeness share', 2]];
FC.BILLING = [['ensemble', 'Ensemble'], ['and', '"And" credit'], ['top', 'Top billing'], ['above', 'Name above the title']];
FC.dealPressure = function (S, d, ask) {
  const sal = Math.max(0, (ask.salary - d.base.salary) / Math.max(1, d.max.salary - d.base.salary));
  const pts = d.max.points ? ask.points / d.max.points : ask.points > 0 ? 3 : 0;
  const picDiff = Math.abs(ask.pictures - d.studioPics) / 3 * (ask.pictures < d.studioPics ? 0.9 : 0.2);
  const bi = FC.BILLING.findIndex(b => b[0] === ask.billing) - FC.BILLING.findIndex(b => b[0] === d.base.billing); const sp = FC.starPower(S);
  const bill = bi > 0 ? bi * (sp > 60 ? 0.2 : 0.5) : 0;
  const perks = ask.perks.reduce((a, k) => a + (FC.PERKS.find(x => x[0] === k) || [0, 0, 1])[2], 0) * (0.18 - Math.min(0.12, sp / 600));
  return sal * 0.55 + pts * 0.5 + picDiff + bill + perks; // ~1 = at the limit
};
FC.agentRead = (S, d, ask) => { const p = FC.dealPressure(S, d, ask) / d.patience; return p < 0.55 ? 'They will say yes.' : p < 0.9 ? 'Probably a yes. Maybe a small counter.' : p < 1.25 ? 'Risky. Expect a counteroffer.' : 'Too far. They may walk away.'; };
FC.negotiate = function (S, pid, ask) {
  const p = (S.offers || []).find(x => x.id === pid); if (!p) return { result: 'gone' };
  const d = p.deal || (p.deal = FC.dealFor(S, p)); d.round++;
  const pr = FC.dealPressure(S, d, ask) / d.patience + d.round * 0.06;
  if (pr < 0.7 || (pr < 1 && R() < 0.65)) return { result: 'accept', terms: ask };
  if (pr > 1.4 && R() < 0.4 + (d.round - 1) * 0.25 || d.round >= 4) { if (!p.contracted) S.offers = S.offers.filter(x => x.id !== pid); if (p.contracted) return { result: 'counter', counter: Object.assign({}, d.base) }; addNews(S, `${p.studio} moves on from talks with ${S.me.name} for ${p.title}.`, 'you'); return { result: 'walk' }; }
  const counter = { salary: Math.round((ask.salary + Math.min(ask.salary, d.max.salary * 0.92)) / 2 / 1000) * 1000, points: Math.min(ask.points, Math.max(0, d.max.points - 1)), pictures: Math.round((ask.pictures + d.studioPics) / 2), billing: FC.BILLING.findIndex(b => b[0] === ask.billing) > FC.BILLING.findIndex(b => b[0] === d.base.billing) + 1 ? FC.BILLING[FC.BILLING.findIndex(b => b[0] === d.base.billing) + 1][0] : ask.billing, perks: ask.perks.slice(0, Math.max(0, ask.perks.length - 1)) };
  counter.salary = Math.max(d.base.salary, Math.min(counter.salary, d.max.salary));
  return { result: 'counter', counter };
};
// You can only shoot one thing at a time. New projects queue behind the ones you're committed to.
FC.busyUntil = S => S.jobs.filter(j => j.stage === 'prep' || j.stage === 'shoot').reduce((a, j) => Math.max(a, S.week + (j.stage === 'prep' ? j.left + j.weeks.shoot : j.left)), S.week);
FC.commitLimit = S => 2 + (S.team.manager ? 1 : 0);
FC.canSign = (S, p) => {
  const open = S.jobs.filter(j => j.stage === 'prep' || j.stage === 'shoot');
  const start = Math.max(S.week + (p.weeks.prep || 0), FC.busyUntil(S));
  if (!p.contracted && open.length >= FC.commitLimit(S)) return { ok: false, t: `Your schedule is full until ${FC.monthYear(S, FC.busyUntil(S))}. Finish a project first${S.team.manager ? '' : ', or hire a manager to juggle more'}.`, start };
  const wait = start - S.week - (p.weeks.prep || 0);
  return { ok: true, start, wait, t: wait > 0 ? `Shooting would start ${FC.monthYear(S, start)}, after your current commitments.` : '' };
};
FC.conflict = (S, p) => { const c = FC.canSign(S, p); return c.ok ? null : c; };
FC.sign = function (S, pid, terms) {
  const p = (S.offers || []).find(x => x.id === pid); if (!p) return { ok: false, t: 'That offer is gone.' };
  const can = FC.canSign(S, p); if (!can.ok) return { ok: false, t: can.t };
  p.delay = can.wait;
  S.offers = S.offers.filter(x => x.id !== pid);
  terms = terms || (p.deal ? p.deal.base : FC.dealFor(S, p).base);
  const job = Object.assign({}, p, { terms, stage: 'prep', left: (p.delay || 0) + (p.weeks.prep || 0), perf: p.perf0 || 50, director_rel: 50, costarRel: 50, signed: S.week, events: 0 });
  if (job.left <= 0) { job.stage = 'shoot'; job.left = p.weeks.shoot; startShoot(S, job); }
  S.jobs.push(job);
  if (p.theater) makePress(S, job, S.week + job.left + 1);
  if (busyRole(job) && p.size !== 'voice') S.pending.unshift({ type: 'fitting', jobId: job.id });
  // franchise contracts
  if (p.fid) {
    const F = D.FRANCHISES.find(f => f.id === p.fid);
    if (p.contracted) { const mc = S.myChars.find(m => m.id === p.contracted); if (mc) job.charId = mc.id; }
    else {
      const mc = { id: uid(), fid: p.fid, name: p.char.name, code: p.char.code, kind: p.char.kind, power: p.char.power, skill: p.char.skill, type: p.char.type, origin: p.char.origin, pop: 40, owed: Math.max(0, terms.pictures - 1), done: 0, status: 'active', since: S.week, salary: terms.salary, points: terms.points, size: p.size };
      S.myChars.push(mc); job.charId = mc.id;
      const fc = S.fr[p.fid].chars.find(x => x.name === p.char.name); if (fc) { fc.status = 'player'; fc.actor = S.me.name; } else if (p.char.kind === 'original' || p.char.kind === 'deep' || p.char.kind === 'legacy') S.fr[p.fid].chars.push({ name: p.char.name, actor: S.me.name, ends: FC.year(S) + terms.pictures * 2, risk: 0, status: 'player' });
      if (p.char.kind === 'deep') S.fr[p.fid].used.push(p.char.name);
      if (FC.brand(p.studio) >= 0.55 && p.size !== 'small' && p.size !== 'cameo') S.pending.push({ type: 'announce', jobId: job.id });
      addNews(S, `Exclusive: ${S.me.name} cast as ${p.char.name} in ${F.short === 'Bond' ? 'the next Bond film' : 'the ' + F.short}. ${terms.pictures > 1 ? terms.pictures + '-picture deal.' : ''}`, 'you');
      timeline(S, `Cast as ${p.char.name} in the ${F.name}.`);
      ach(S, 'hero'); if (p.char.kind === 'original') ach(S, 'original'); if (p.char.kind === 'recast') ach(S, 'recast'); if (p.char.kind === 'legacy') ach(S, 'legacy'); if (p.char.kind === 'variant') ach(S, 'variant'); if (terms.pictures >= 6) ach(S, 'ninepic');
    }
    if (!p.tv && D.FRANCHISES.find(f => f.id === p.fid).titles.includes(p.title)) S.fr[p.fid].used.push(p.title);
    if (p.teamup) ach(S, 'crossover');
  } else if (p.size === 'lead' && FC.brand(p.studio) >= 0.5 && !p.theater) { S.pending.push({ type: 'announce', jobId: job.id }); addNews(S, `${S.me.name} will lead ${p.studio}'s ${p.title}.`, 'you'); }
  else if (p.size !== 'extra' && p.kind !== 'commercial') addNews(S, `${S.me.name} joins ${p.costars[0] ? p.costars[0] + ' in ' : ''}${p.studio}'s ${p.title}.`, 'you');
  if (terms.salary >= 1e7) ach(S, 'tenmil'); if (terms.points >= 5) ach(S, 'points');
  ach(S, 'first_role'); if (p.size !== 'extra' && p.kind !== 'commercial') ach(S, 'first_line'); if (p.size === 'lead') ach(S, 'first_lead');
  if (p.theater && p.size === 'lead') ach(S, 'broadway_lead'); if (p.region === 'westend') ach(S, 'westend');
  if (p.kind === 'commercial') ach(S, 'commercial'); if (p.size === 'voice') ach(S, 'voice'); if (p.theater) ach(S, 'stage'); if (p.tv && !p.guest) ach(S, 'tv');
  S.typecast[p.genre] = (S.typecast[p.genre] || 0) + 1; for (const g of Object.keys(S.typecast)) if (g !== p.genre) S.typecast[g] = Math.max(0, S.typecast[g] - 0.5);
  return { ok: true, t: `Signed for ${p.title}.`, job };
};
FC.declineOffer = function (S, pid) {
  const p = (S.offers || []).find(x => x.id === pid); if (!p) return;
  S.offers = S.offers.filter(x => x.id !== pid);
  if (p.contracted) studioShift(S, p.studio, -12);
  if (p.contracted) { const mc = S.myChars.find(m => m.id === p.contracted); if (mc && mc.owed > 0) { const fine = Math.round(mc.salary * 0.5); S.money -= fine; S.rep = clamp(S.rep - 6, 0, 100); mc.status = 'recast'; addNews(S, `${S.me.name} exits the ${D.FRANCHISES.find(f => f.id === mc.fid).short} in a contract dispute. ${mc.name} will be recast.`, 'you'); timeline(S, `Walked away from ${mc.name}. Paid ${FC.money(fine)} in penalties.`);
    const c = S.fr[mc.fid].chars.find(x => x.name === mc.name); if (c) { c.status = 'open'; c.prevActor = S.me.name; c.actor = null; } return `You broke your contract. ${FC.money(fine)} penalty, and the studio will recast ${mc.name}.`; } }
  return 'Offer declined.';
};
function startShoot(S, j) { if (j.terms.salary && !j.paid1) { j.paid1 = true; earn(S, j.weekly ? 0 : j.terms.salary * (j.weeks.shoot > 1 ? 0.5 : 1), `upfront for ${j.title}`); } }

FC.announceReaction = (S, j) => {
  if (j.fanReact != null) return j.fanReact;
  let r = 52 + S.fame * 0.3 + (FC.skillFit(S, j) - 40) * 0.4 + FC.studioRel(S, j.studio) * 0.2 + rnd(-14, 14);
  if (j.char && S.fancast === j.char.name) r += 18; if (j.char && j.char.kind === 'recast') r -= 10; if (j.char && j.char.kind === 'original') r += 4;
  j.fanReact = Math.round(clamp(r, 8, 98)); return j.fanReact;
};
FC.announceRespond = function (S, jid, i) {
  const j = S.jobs.find(x => x.id === jid); if (!j) return '';
  const react = FC.announceReaction(S, j); const b = FC.brand(j.studio);
  const reach = Math.round((40000 + S.fame * 15000) * (0.5 + b * 2.5) * (react / 60));
  S.followers += reach; gainFame(S, b * 4 * (react / 70));
  const out = [`Followers +${FC.num(reach)}`];
  if (i === 0) { j.promo = (j.promo || 0) + 0.04; if (R() < 0.15) { studioShift(S, j.studio, -6); out.push('Studio thinks you said too much: -6'); } else out.push('Fans are decoding your post'); }
  if (i === 1) { S.rep = clamp(S.rep + 2, 0, 100); studioShift(S, j.studio, 3); out.push('Reputation +2', `${j.studio} +3`); }
  if (i === 2) { gainFame(S, 0.5); out.push('Mystique +1'); }
  if (react < 40 && i === 1) out.push('The backlash softens');
  timeline(S, `Announced as ${j.char ? j.char.name : 'the lead'} in ${j.title} (${react}% positive reaction).`);
  return out.join(', ');
};

// ------------------------------------------------------------------ trailers
function trailerViews(S, j) { const b = FC.brand(j.studio); return Math.round((2e6 + Math.pow(S.fame, 2) * 4000 + b * b * 9e7 * (j.teamup ? 1.6 : 1)) * rnd(0.7, 1.4) * (j.tv ? 0.5 : 1)); }
FC.dropTrailer = function (S, j) {
  if (j.trailer) return;
  for (const cam of ['close', 'wide']) FC.addPhoto(S, { kind: 'promo', jobId: j.id, set: FC.setFor(j), look: Object.assign({}, S.look, (j.costume || {}).look || {}), cast: cam === 'wide' ? (j.costars || []).slice(0, 2) : [], anim: cam === 'close' ? 'pose' : 'hero', cam }); const views = trailerViews(S, j); const react = clamp(Math.round(45 + (j.perf - 50) * 0.5 + j.script * 0.2 + rnd(-12, 12) + (j.fanReact ? (j.fanReact - 50) * 0.3 : 0)), 10, 98);
  j.trailer = { views, react, week: S.week }; j.promo = (j.promo || 0) + Math.min(0.12, Math.log10(views) / 80) * (react / 70);
  S.followers += Math.round(views * 0.002); gainFame(S, Math.log10(views) / 8);
  addNews(S, `The ${j.title} trailer hits ${FC.num(views)} views in 24 hours.`, 'you');
  S.pending.push({ type: 'trailer', id: j.id });
};

// ------------------------------------------------------------------ release & box office
function quality(S, j) {
  const dir = j.director ? j.director.p * 14 : 40;
  const eff = j.effort && j.effort.length ? j.effort.reduce((a, b) => a + b, 0) / j.effort.length : 50;
  return clamp(j.script * 0.33 + dir * 0.27 + j.perf * 0.4 + rnd(-8, 8) + (j.director_rel - 50) * 0.06 + (eff - 50) * 0.04, 5, 99);
}
function reviews(S, j) {
  const q = quality(S, j); const g = D.GENRES.find(x => x.id === j.genre) || D.GENRES[0];
  let critics = clamp(Math.round(q * 1.15 - 12 + (g.prestige - 1) * 8 + rnd(-10, 10) - (has(S, 'crowd') ? 5 : 0)), 2, 100);
  let aud = clamp(Math.round(q * 0.7 + 28 + (g.audience - 1) * 10 + rnd(-8, 8) + (has(S, 'crowd') ? 6 : 0)), 10, 99);
  if (j.fid) aud = clamp(aud + 5 - S.heroFatigue * 10, 10, 99);
  const grade = aud >= 90 ? 'A+' : aud >= 85 ? 'A' : aud >= 80 ? 'A-' : aud >= 74 ? 'B+' : aud >= 68 ? 'B' : aud >= 60 ? 'B-' : aud >= 52 ? 'C+' : aud >= 44 ? 'C' : 'D';
  const quotes = [];
  for (let i = 0; i < 3; i++) { const good = critics + rnd(-20, 20) > 55; quotes.push({ o: pick(D.OUTLETS), t: good ? pick([`${S.me.name} is a revelation.`, 'The best film of its kind in years.', `A career-best turn from ${S.me.name}.`, 'Gorgeous, gripping, and surprisingly moving.', 'Pure movie magic.', 'It earns every minute.']) : pick(['A mess, however expensive.', `${S.me.name} does what they can with thin material.`, 'Forgettable in every way.', 'Two hours that feel like four.', 'Noisy, empty, and endless.', 'Strong cast, weak script.']), good }); }
  return { q, critics, aud, grade, quotes };
}
FC.release = function (S, j) {
  const r = reviews(S, j); Object.assign(j, r, { released: S.week, stage: 'out' });
  const sp = FC.starPower(S); const F = j.fid ? D.FRANCHISES.find(f => f.id === j.fid) : null; const st = j.fid ? S.fr[j.fid] : null;
  const g = D.GENRES.find(x => x.id === j.genre) || D.GENRES[0];
  if (j.tv) return releaseTV(S, j);
  let base = j.budget ? j.budget / 1e6 : 10; // $M
  let open = base * 0.27 * g.audience * (0.6 + r.critics / 220 + r.aud / 260) * rnd(0.75, 1.3);
  if (j.size === 'lead') open *= 0.85 + sp / 150;
  open *= FC.promoMul(S, j);
  if (F) { open *= F.pull * 0.8 * (1 - st.fatigue * 0.35) * (1 - S.heroFatigue * 0.3) * (0.7 + st.mood / 200); if (j.teamup) open *= 1.6; const mc = S.myChars.find(m => m.id === j.charId); if (mc && j.size === 'lead') open *= 0.8 + mc.pop / 160; }
  if (j.prestige && !j.wide) open = base * rnd(0.05, 0.35) * (r.critics / 60);
  if (j.kind === 'extra') open = base * rnd(0.2, 0.6);
  const legs = clamp(0.38 + r.aud / 300 + (r.critics - 50) / 600 + (j.prestige ? 0.12 : 0), 0.3, 0.82);
  const intl = F ? rnd(1.5, 2.1) : j.genre === 'comedy' ? rnd(0.6, 1) : rnd(0.9, 1.5);
  j.review = marquee(S, j);
  FC.addPhoto(S, { kind: 'carpet', jobId: j.id, set: 'carpet', title: j.title, look: Object.assign({}, S.look), cast: (j.costars || []).slice(0, 1), anim: 'pose', cam: pick(['wide', 'close']) });
  const film = { id: j.id, title: j.title, studio: j.studio, mine: true, open: open * 1e6, last: open * 1e6, dom: 0, intl, legs, weeks: 0, fid: j.fid };
  S.theaters.push(film); j.boxId = film.id; j.dom = 0; j.ww = 0;
  if (F) { st.films++; st.fatigue = clamp(st.fatigue + 0.12, 0, 1); if (F.kind === 'superhero') S.heroFatigue = clamp(S.heroFatigue + 0.04, 0, 1); }
  gainFame(S, SIZES[j.size].f * (open > 100 ? 1.6 : open > 40 ? 1.1 : open > 10 ? 0.7 : 0.35) * (j.fid ? 1.3 : 1));
  S.followers += Math.round(open * 1e6 * 0.002 * SIZES[j.size].f);
  if (j.size !== 'extra') S.buzz = clamp((S.buzz || 0) + (r.critics - 50) / 4, -20, 60);
  addNews(S, `${j.title} opens to ${FC.money(open * 1e6)}. Critics ${r.critics}%, audiences ${r.aud}%, CinemaScore ${r.grade}.`, 'you');
  if (open >= 100) ach(S, 'bo100'); if (r.critics >= 95) ach(S, 'fresh95'); if (r.critics < 20) ach(S, 'rotten'); ach(S, 'first_film');
  S.credits.push(j); S.jobs = S.jobs.filter(x => x !== j);
  S.pending.push({ type: 'release', id: j.id });
  return j;
};
function releaseTV(S, j) {
  const rating = clamp(Math.round((j.q || 50) * 0.8 + rnd(-10, 15) + FC.starPower(S) * 0.1), 5, 99); j.rating = rating; j.viewers = Math.round(rating * rating * rnd(800, 2500) * (j.fid ? 3 : 1) * FC.promoMul(S, j));
  j.review = marquee(S, j);
  gainFame(S, (j.guest ? 0.15 : SIZES[j.size].f) * (rating > 70 ? 1.6 : 0.8)); S.followers += Math.round(j.viewers * 0.01);
  addNews(S, `${j.title}${j.season > 1 ? ' season ' + j.season : ''} premieres. ${FC.num(j.viewers)} viewers, critics ${j.critics}%.`, 'you');
  j.dom = 0; j.ww = 0; S.credits.push(j); S.jobs = S.jobs.filter(x => x !== j);
  if (!j.guest) { j.airing = { ep: 0, total: clamp(Math.round(j.weeks.shoot * 0.7), 6, 10), base: j.viewers, eps: [] }; }
  if (!j.weekly && j.terms.salary && !j.paid2 && j.weeks.shoot > 1) { j.paid2 = true; earn(S, j.terms.salary * 0.5, `for ${j.title}`); }
  S.pending.push({ type: 'release', id: j.id });
  if (j.fid && j.charId) { const mc = S.myChars.find(m => m.id === j.charId); if (mc) { mc.pop = clamp(mc.pop + (rating - 55) / 3, 0, 100); mc.done++; mc.owed = Math.max(0, mc.owed - 1); } }
  return j;
}

// NPC releases for the chart
function npcFilm(S, opts = {}) {
  const F = opts.fid ? D.FRANCHISES.find(f => f.id === opts.fid) : null;
  const g = F ? (F.kind === 'animation' ? 'animation' : F.kind === 'superhero' ? 'superhero' : F.kind === 'scifi' ? 'scifi' : 'action') : pick(D.GENRES).id;
  const budget = F ? irnd(150, 280) : irnd(5, 160);
  let open = budget * rnd(0.1, 0.5) * (F ? F.pull * 1.3 * (1 - S.heroFatigue * 0.3) : 1);
  const studio = F ? D.STUDIOS.find(s => s.id === F.studio).name : pick(D.STUDIOS).name;
  const star = pick(D.ACTORS)[0];
  const title = opts.title || filmTitle();
  return { id: uid(), title, studio, star, mine: false, open: open * 1e6, last: open * 1e6, dom: 0, intl: F ? rnd(1.4, 2) : rnd(0.7, 1.4), legs: rnd(0.38, 0.72), weeks: 0, fid: opts.fid || null };
}
function seedTheaters(S) { for (let i = 0; i < 9; i++) { const f = npcFilm(S); f.weeks = irnd(1, 6); f.last = f.open * Math.pow(f.legs, f.weeks); f.dom = f.open * (1 - Math.pow(f.legs, f.weeks)) / (1 - f.legs); S.theaters.push(f); } }
function tickBoxOffice(S) {
  // new NPC releases
  const n = irnd(1, 3);
  for (let i = 0; i < n; i++) {
    let f;
    if (R() < 0.18) { const F = pick(D.FRANCHISES.filter(x => !x.tvOnly)); const st = S.fr[F.id]; const avail = F.titles.filter(t => !st.used.includes(t)); if (avail.length && R() < 0.5) { const t = avail[avail.length - 1]; st.used.push(t); f = npcFilm(S, { fid: F.id, title: t }); st.films++; st.fatigue = clamp(st.fatigue + 0.08, 0, 1); if (F.kind === 'superhero') S.heroFatigue = clamp(S.heroFatigue + 0.03, 0, 1); } }
    if (!f) f = npcFilm(S);
    S.theaters.push(f);
  }
  for (const f of S.theaters) {
    const wk = f.weeks === 0 ? f.open : f.last * f.legs * rnd(0.93, 1.07);
    f.last = wk; f.dom += wk; f.weeks++;
    if (f.mine) { const j = S.credits.find(c => c.id === f.id); if (j) { j.dom = f.dom; j.ww = f.dom * (1 + f.intl); } }
  }
  const leaving = S.theaters.filter(f => f.weeks > 16 || (f.weeks > 2 && f.last < 1.2e6));
  for (const f of leaving) if (f.mine) closeRun(S, f);
  S.theaters = S.theaters.filter(f => !leaving.includes(f));
  S.chart = S.theaters.slice().sort((a, b) => b.last - a.last).slice(0, 10).map((f, i) => ({ rank: i + 1, title: f.title, studio: f.studio, mine: f.mine, wk: f.last, total: f.dom, weeks: f.weeks, star: f.star }));
  S.heroFatigue = clamp(S.heroFatigue - 0.004, 0.05, 1);
  for (const id of Object.keys(S.fr)) S.fr[id].fatigue = Math.max(0, S.fr[id].fatigue - 0.003);
}
function closeRun(S, f) {
  const j = S.credits.find(c => c.id === f.id); if (!j) return;
  j.ww = f.dom * (1 + f.intl); j.dom = f.dom; j.closed = S.week; S.lifetimeBO += j.ww;
  const budget = j.budget || 10e6; const ratio = j.ww / budget;
  j.verdict = ratio >= 3 ? 'Blockbuster' : ratio >= 2.2 ? 'Hit' : ratio >= 1.5 ? 'Broke even' : (j.critics >= 78 || R() < 0.12) && ratio < 1.5 ? 'Cult classic' : 'Flop';
  if (j.prestige && !j.wide) j.verdict = j.critics >= 80 ? 'Critical darling' : ratio > 2 ? 'Indie hit' : 'Small release';
  if (j.terms && j.terms.points) earn(S, j.ww * 0.5 * j.terms.points / 100, `backend points on ${j.title}`);
  if (j.producer) { const prof = Math.max(0, j.ww * 0.5 - budget) * 0.35; if (prof > 0) earn(S, prof, `producer profits on ${j.title}`, { noAgent: true }); if (j.ww >= 2e8) ach(S, 'produce_hit'); }
  if (j.verdict === 'Flop') { ach(S, 'flop'); S.fame = clamp(S.fame - (j.size === 'lead' ? 3 : 1), 0, 100); if (j.size === 'lead') { S.lowPoint = true; addNews(S, `${j.title} bombs with ${FC.money(j.ww)} worldwide. Is ${S.me.name}'s star fading?`, 'you'); } }
  if (j.verdict === 'Blockbuster') { gainFame(S, (j.size === 'lead' ? 4 : 2)); }
  studioShift(S, j.studio, { Blockbuster: 8, Hit: 5, 'Broke even': 1, 'Cult classic': 1, Flop: -6, 'Critical darling': 4, 'Indie hit': 3 }[j.verdict] || 0, j.verdict === 'Flop' ? 'the flop' : `the ${(j.verdict || '').toLowerCase()}`);
  if (j.verdict === 'Cult classic') ach(S, 'cult');
  if (j.ww >= 1e9) { ach(S, 'bo1b'); timeline(S, `${j.title} crossed $1 billion worldwide.`); }
  if (S.lifetimeBO >= 5e9) ach(S, 'lifetime5b');
  if (j.charId) { const mc = S.myChars.find(m => m.id === j.charId); if (mc) { mc.pop = clamp(mc.pop + (j.aud - 60) / 2.5 + (j.perf - 50) / 8 + (j.verdict === 'Flop' ? -10 : j.verdict === 'Blockbuster' ? 8 : 0), 0, 100); mc.done++; mc.owed = Math.max(0, mc.owed - 1); mc.films = (mc.films || []).concat(j.title);
    if (j.size === 'lead' && !j.teamup) ach(S, 'solo');
    if (mc.pop < 20 && R() < 0.5) { mc.status = 'dead'; addNews(S, `Reports: ${mc.name} will be killed off after the disappointing ${j.title}.`, 'you'); timeline(S, `${mc.name} was written out of the ${D.FRANCHISES.find(x => x.id === mc.fid).short}.`); } } }
  S.pending.push({ type: 'closed', id: j.id });
}

// ------------------------------------------------------------------ the week
FC.endWeek = function (S) {
  if (S.ended) return { lines: [] };
  S.log = [];
  const wasShooting = S.jobs.some(j => j.stage === 'shoot');
  // progress jobs
  for (const j of S.jobs.slice()) {
    if (j.stage === 'prep' && j.theater && j.left > 0 && R() < 0.6) S.pending.push({ type: 'rehearsal', jobId: j.id, ev: irnd(0, D.REHEARSAL_EVENTS.length - 1), wk: (j.weeks.prep || 0) - j.left + 1 });
    if (j.stage === 'prep') { j.left--; if (j.prepTrain !== false && (j.genre === 'superhero' || j.genre === 'action')) { S.skills.fitness = clamp(S.skills.fitness + 0.6 * (1 + (S.team.trainer || 0) * 0.2), 0, 100); S.skills.action = clamp(S.skills.action + 0.4, 0, 100); } if (j.left <= 0) { j.stage = 'shoot'; j.left = j.weeks.shoot; startShoot(S, j); } continue; }
    if (j.stage === 'shoot') {
      j.left--; logEffort(S, j);
      const gk = Object.keys((D.GENRES.find(x => x.id === j.genre) || D.GENRES[0]).skills)[0]; S.skills[gk] = clamp(S.skills[gk] + 0.35, 0, 100);
      if (j.weekly && j.terms.salary) earn(S, j.terms.salary, `week of ${j.title}`);
      if (j.theater) { stageNight(S, j); if (R() < 0.35) FC.addPhoto(S, { kind: 'stage', jobId: j.id, set: R() < 0.5 ? 'stage' : 'backstage', costume: true, look: Object.assign({}, S.look, (j.costume || {}).look || {}), cast: (j.costars || []).slice(0, 1), anim: pick(['pose', 'cheer', 'talk']), cam: pick(['wide', 'close', 'group']) }); if (j.left <= 0) wrap(S, j); continue; }
      if (busyRole(j) && R() < 0.45) FC.addPhoto(S, { kind: 'bts', jobId: j.id, day: (j.weeks.shoot - j.left) * 5, set: FC.setFor(j), look: Object.assign({}, S.look, (j.costume || {}).look || {}), cast: (j.costars || []).slice(0, pick([0, 1, 2])), anim: pick(['pose', 'talk', 'hero', 'wave']), cam: pick(['wide', 'close', 'selfie', 'group']) });
      if (j.weeks.shoot > 1 && R() < 0.45 && j.events < 3 && j.kind !== 'commercial') { j.events++; S.pending.push({ type: 'set', jobId: j.id, ev: D.SET_EVENTS.indexOf(pick(D.SET_EVENTS.filter(e => !e.c.every(c => c[1].req && !reqOk(S, c[1].req))))) }); }
      if (j.left <= 0) wrap(S, j);
      continue;
    }
    if (j.stage === 'post') { j.left--; if (!j.trailer && !j.guest && j.size !== 'extra' && (j.wide || j.tv || j.fid) && j.left <= (j.fid ? 8 : 5) && j.left > 0) FC.dropTrailer(S, j); if (j.left <= 0) { if (j.stage === 'post') FC.release(S, j); } }
  }
  // energy and health
  const busy = S.jobs.some(j => j.stage === 'shoot');
  if (S.energy < 10) { S.health = clamp(S.health - 8, 0, 100); S.happy = clamp(S.happy - 3, 0, 100); }
  const home = D.HOMES.find(h => h.id === S.home) || D.HOMES[0];
  S.energy = clamp(S.energy + 55 + home.rest + (S.team.manager ? 5 : 0) - (busy ? 10 : 0), 0, 100);
  if (S.energy >= 40) S.health = clamp(S.health + (busy ? 2 : 5), 0, 100);
  S.weekActs = 0;
  if (S.hiatus > 0) S.hiatus--;
  if (S.health <= 0) burnout(S);
  // money
  weeklyCosts(S);
  // world
  tickBoxOffice(S);
  refreshBoard(S); refreshStage(S);
  inboxTick(S);
  loveTick(S);
  airTV(S);
  // TV renewals
  for (const c of S.credits) if (c.renewWeek === S.week) renewal(S, c);
  S.week++;
  const woy = FC.woy(S);
  if (woy === 1) newYear(S);
  awardsTick(S, woy);
  festivalTick(S, woy);
  calendarTick(S, woy);
  if (R() < 0.18) randomEvent(S);
  if (S.week - S.lastWork > 52 && !S.jobs.length) { S.fame = clamp(S.fame - 0.15, 0, 100); }
  if (S.jobs.length || wasShooting) S.lastWork = S.week;
  S.fame = clamp(S.fame - (S.fame > 60 ? 0.05 : 0.02), 0, 100);
  S.followers = Math.max(S.followers, Math.round(S.fame * S.fame * 2500));
  if (S.money >= 1e6) ach(S, 'million'); if (S.followers >= 1e8) ach(S, 'followers');
  if (FC.age(S) >= 80 && !S.ended) FC.retire(S, 'age');
  return { lines: S.log.slice() };
};
function stageNight(S, j) {
  j.nights = (j.nights || 0) + 8; j.perf = FC.calcPerf(j);
  const draw = clamp(45 + S.fame * 0.5 + (j.perf - 50) * 0.4 + (j.buzz || 0) + rnd(-8, 8), 25, 102); j.house = Math.round(draw); j.houses = (j.houses || []).concat(j.house);
  S.skills.drama = clamp(S.skills.drama + 0.5, 0, 100); if (j.genre === 'musical') S.skills.voice = clamp(S.skills.voice + 0.5, 0, 100);
  if (j.prod === 'long') { j.house = Math.min(102, j.house + 15); j.houses[j.houses.length - 1] = j.house; }
  if (j.nights === 8) S.pending.push({ type: 'opening', jobId: j.id });
  else if (j.left > 0 && R() < 0.5) { const us = (j.stageRole || '').includes('covers'); const pool = D.STAGE_EVENTS.map((e, i) => i).filter(i => !!D.STAGE_EVENTS[i].understudy === (us && R() < 0.5)); if (pool.length) S.pending.push({ type: 'stage', jobId: j.id, ev: pick(pool) }); }
  const avgH = j.houses.reduce((a, b) => a + b, 0) / j.houses.length;
  if (j.prod !== 'long' && j.nights >= 32 && avgH < 55 && !j.closingNotice && j.left > 2) { j.closingNotice = true; j.left = 2; S.pending.push({ type: 'note', title: `Closing notice: ${j.title}`, text: `Ticket sales have not picked up, so the producers are closing ${j.title} early. Two more weeks of performances.` }); addNews(S, `${j.title} posts its closing notice.`, 'you'); }
  S.log.push(`${j.title}: ${Math.min(100, j.house)}% houses this week.`);
}
function reqOk(S, req) { if (req === 'method') return has(S, 'method'); return (S.skills[req] || 0) >= 35; }
function wrap(S, j) {
  j.perf = FC.calcPerf(j);
  if (busyRole(j)) studioShift(S, j.studio, (j.director_rel - 50) / 10);
  if (j.kind === 'commercial') { if (!j.paid1) earn(S, j.terms.salary, `for the ${j.title.toLowerCase()}`); j.stage = 'done'; j.released = S.week; j.verdict = 'Aired'; S.credits.push(j); S.jobs = S.jobs.filter(x => x !== j); gainFame(S, 0.08); return; }
  if (j.terms.salary && !j.paid2 && !j.weekly && j.weeks.shoot > 1) { j.paid2 = true; if (!j.tv) earn(S, j.terms.salary * 0.5, `on wrap for ${j.title}`); }
  if (j.weekly) { if (j.theater) S.pending.push({ type: 'closing', id: j.id }); j.stage = 'done'; j.released = S.week - j.weeks.shoot; ach(S, 'stage'); Object.assign(j, reviews(S, j)); j.verdict = j.critics >= 75 ? 'Rave reviews' : j.critics >= 50 ? 'Solid run' : 'Mixed reviews'; S.credits.push(j); S.jobs = S.jobs.filter(x => x !== j); gainFame(S, 1.5); S.skills.drama = clamp(S.skills.drama + 2, 0, 100); addNews(S, `${S.me.name}'s run in ${j.title} closes. ${j.verdict}.`, 'you'); return; }
  j.stage = 'post'; j.left = j.weeks.post + (j.wide ? irnd(0, 8) : 0);
  if (!j.guest && j.size !== 'extra') makePress(S, j, S.week + j.left);
  if (j.left <= 0) FC.release(S, j);
  S.log.push(`That's a wrap on ${j.title}.`);
}
function weeklyCosts(S) {
  const home = D.HOMES.find(h => h.id === S.home) || D.HOMES[0];
  let cost = (home.rent || 0) + S.homes.reduce((a, h) => a + (D.HOMES.find(x => x.id === h).upkeep || 0), 0);
  for (const t of D.TEAM) if (S.team[t.id]) cost += t.fee[S.team[t.id]] || 0;
  cost += S.cars.length * 150;
  if (S.diff === 'hard') cost *= 1.25;
  S.money -= Math.round(cost);
  for (const k of Object.keys(S.invest)) { const iv = D.INVEST.find(x => x.id === k); S.invest[k] = Math.max(0, S.invest[k] * (1 + (iv.ret + rnd(-iv.risk, iv.risk)) / 52)); }
  // residuals and brands
  let resid = 0; for (const c of S.credits) if (c.ww && S.week - c.released < 260) resid += c.ww * 0.000004 * SIZES[c.size].f;
  if (resid > 50) { S.money += Math.round(resid); S.yearEarn += resid; S.taxable += resid; }
  for (const b of S.brands) if (b.until > S.week) { const pay = b.pay / 52; S.money += pay; S.yearEarn += pay; S.taxable += pay; }
  if (S.money < -50000 && !S.debtWarn) { S.debtWarn = true; S.inbox.push({ id: uid(), kind: 'note', from: 'Your accountant', t: 'You are in debt', d: 'Your account is overdrawn. Take paying work, sell property or cut your team before it gets worse.' }); }
  if (S.money >= 0) S.debtWarn = false;
}
function burnout(S) {
  S.burnouts++; S.health = 40; S.energy = 20; S.happy = clamp(S.happy - 15, 0, 100); S.hiatus = 4;
  for (const j of S.jobs.filter(x => x.stage === 'shoot')) { j.left += 3; j.director_rel -= 10; }
  timeline(S, 'Burned out and took time off to recover.'); addNews(S, `${S.me.name} is taking a break from work for health reasons.`, 'you');
  S.pending.push({ type: 'note', title: 'Burnout', text: 'You pushed too hard and your body gave out. Productions paused while you recovered. Rest more, and keep an eye on your energy.' });
  if (S.burnouts >= 4) FC.retire(S, 'burnout');
}
function refreshBoard(S) {
  S.board = S.board.filter(p => p.expires > S.week);
  S.offers = (S.offers || []).filter(p => p.contracted || p.expires + 3 > S.week);
  const want = 4 + FC.tier(S) + Math.min(3, Math.floor(S.contacts / 3));
  let g = 0; while (S.board.length < want && g++ < 10) { if (R() < 0.6 || S.board.length < 3) S.board.push(genProject(S)); else break; }
  // direct offers for established stars
  const fan = Object.entries(S.studios || {}).filter(([n, v]) => v >= 15);
  if (fan.length && R() < 0.06) { const [nm] = pick(fan); const st = FC.studioOf(nm); const fr = D.FRANCHISES.find(f => f.studio === st.id); const p = fr ? genFranchiseProject(S, fr.id, { film: true }) : genProject(S, 'film'); if (p) { p.studio = nm; p.direct = true; p.won = true; p.perf0 = clamp(Math.round(FC.skillFit(S, p) + rnd(-5, 10)), 10, 99); S.offers.push(p); S.inbox.push({ id: uid(), kind: 'note', from: nm, t: 'They want to work with you again', d: `${nm} offers you ${p.title} directly. No audition. Check Casting.` }); } }
  if (FC.starPower(S) > 55 && R() < 0.12) { const p = R() < 0.5 ? genFranchiseProject(S, null, { size: 'lead' }) : genProject(S, 'film'); if (p) { p.direct = true; p.won = true; p.perf0 = clamp(Math.round(FC.skillFit(S, p) + rnd(-5, 10)), 10, 99); S.offers.push(p); S.inbox.push({ id: uid(), kind: 'note', from: FC.agency(S).name, t: 'A direct offer', d: `${p.director.name} wants you for ${p.title}. No audition. Check your offers.` }); } }
}
function airTV(S) {
  for (const c of S.credits) {
    const a = c.airing; if (!a || a.ep >= a.total || c.released === S.week) continue;
    a.ep++;
    const trend = a.eps.length ? a.eps[a.eps.length - 1] : a.base;
    let v = trend * rnd(0.86, 1.08) * (1 + ((c.rating || 50) - 60) / 400) * (a.boost || 1); a.boost = 1;
    if (a.ep === a.total) v *= c.finale === 'cliff' ? 1.35 : c.finale === 'close' ? 1.25 : 1.15;
    a.eps.push(Math.round(v));
    S.log.push(`${c.title} episode ${a.ep}: ${FC.num(v)} viewers.`);
    if (a.ep === Math.ceil(a.total / 2)) S.pending.push({ type: 'midseason', id: c.id, ep: a.ep, ev: irnd(0, D.TV_MIDSEASON.length - 1) });
    if (a.ep === a.total - 1) S.pending.push({ type: 'finale', id: c.id });
    if (a.ep === a.total) {
      c.viewers = Math.round(a.eps.reduce((x, y) => x + y, 0) / a.eps.length);
      const growth = a.eps[a.eps.length - 1] / a.eps[0]; c.rating = clamp(Math.round(c.rating + (growth - 1) * 20 + (c.finale === 'close' ? 3 : 0)), 5, 99);
      gainFame(S, SIZES[c.size].f * (growth > 1 ? 0.8 : 0.3)); c.renewWeek = S.week + 2;
      S.pending.push({ type: 'seasonEnd', id: c.id });
    }
  }
}
FC.tvFinale = function (S, cid, choice) { const c = S.credits.find(x => x.id === cid); if (!c) return ''; c.finale = choice;
  if (choice === 'cliff') return 'The writers leave everyone hanging. Great for buzz, risky if you get cancelled.';
  if (choice === 'close') { c.critics = Math.min(100, (c.critics || 50) + 3); return 'An ending that pays off the whole season. Critics will like it.'; }
  return 'You trust the showrunner. They seem relieved.'; };
FC.tvMoment = function (S, cid, ev, i) { const c = S.credits.find(x => x.id === cid); const e = D.TV_MIDSEASON[ev]; const ch = e.c[i] || e.c[0]; if (c && c.airing && (ch[1].fame || 0) >= 1) c.airing.boost = 1.08; return FC.applyEffects(S, ch[1]); };
function renewal(S, c) {
  if (c.guest || !c.tv) return;
  const ok = (c.rating || 50) > 55 && R() < 0.5 + (c.rating - 55) / 60 + (c.finale === 'cliff' ? 0.1 : 0);
  if (ok) { ach(S, 'renewed'); addNews(S, `${c.title} renewed for season ${(c.season || 1) + 1}.`, 'you');
    const p = Object.assign({}, c, { id: uid(), season: (c.season || 1) + 1, stage: null, airing: null, finale: null, prepScore: 0, prepLog: {}, effort: [], wk: null, press: null, pressSettled: false, promo: 0, perfAdj: 0, review: null, won: true, contracted: c.charId || 'tv', expires: S.week + 8, posted: S.week, pay: Math.round(c.terms.salary * 1.2), perf0: c.perf, script: clamp(c.script + rnd(-10, 8), 20, 99), released: null, renewWeek: null, paid1: false, paid2: false, deal: null, events: 0, dom: 0, ww: 0 });
    delete p.boxId; S.offers = S.offers || []; S.offers.push(p);
    S.inbox.push({ id: uid(), kind: 'note', from: c.studio, t: `${c.title} is renewed`, d: `Season ${p.season} is go. Your offer is waiting.` });
    if (c.season === 1 && c.fid) ach(S, 'spinoff');
  } else addNews(S, `${c.title} has been cancelled after ${c.season || 1} season${(c.season || 1) > 1 ? 's' : ''}.`, 'tv');
}

// ------------------------------------------------------------------ yearly
function newYear(S) {
  const y = FC.year(S);
  // taxes
  const tax = Math.round(Math.max(0, S.taxable) * 0.33); if (tax > 0) { S.money -= tax; S.pending.push({ type: 'note', title: `Taxes for ${y - 1}`, text: `You paid ${FC.money(tax)} in taxes on ${FC.money(S.taxable)} of income.` }); }
  S.yearEarnHist.push({ y: y - 1, earn: Math.round(S.yearEarn) }); S.yearEarn = 0; S.taxable = 0;
  // franchise contracts
  for (const F of D.FRANCHISES) {
    const st = S.fr[F.id];
    for (const c of st.chars) {
      if (c.status !== 'active') continue;
      if (y >= c.ends) {
        if (R() < 0.45 + (1 - c.risk) * 0.3) { c.ends = y + irnd(2, 4); if (R() < 0.3) addNews(S, `${c.actor} signs on for more ${F.short} films as ${c.name.split(' / ').pop()}.`, 'casting'); }
        else { c.prevActor = c.actor; c.actor = null; c.status = 'open'; addNews(S, `${c.prevActor} will not return as ${c.name}. ${F.short} is looking to recast.`, 'casting'); }
      } else if (R() < c.risk * 0.08) { c.prevActor = c.actor; c.actor = null; c.status = 'open'; addNews(S, `Shake-up: ${F.short} is recasting ${c.name}.`, 'casting'); }
    }
    st.mood = clamp(st.mood + rnd(-8, 8) - st.fatigue * 6, 20, 95);
    if (F.titles.filter(t => !st.used.includes(t)).length < 2) F.titles.push(`${F.short}: ${pick(D.TITLE_A)} ${pick(D.TITLE_B)}`);
  }
  // my characters: next appearances
  for (const mc of S.myChars.filter(m => m.status === 'active')) {
    const F = D.FRANCHISES.find(f => f.id === mc.fid);
    if (mc.owed > 0 || mc.pop > 45) {
      const teamup = R() < 0.35 && F.kind === 'superhero';
      const solo = mc.pop >= 60 && !teamup;
      const p = genFranchiseProject(S, mc.fid, { kind: 'original', film: true, size: solo ? 'lead' : mc.size, contracted: mc.id });
      if (!p) continue;
      p.char = { kind: mc.kind, name: mc.name, code: mc.code, power: mc.power, skill: mc.skill, type: mc.type, origin: mc.origin };
      if (teamup) { const t = F.id === 'mcu' ? pick(['Avengers: ' + pick(D.TITLE_B), 'Avengers: Legacy', 'Young Avengers', 'Champions']) : F.id === 'dcu' ? 'Justice League' : null; if (t) { p.title = t; p.teamup = true; p.size = 'ensemble'; } }
      if (solo && mc.code && R() < 0.6) p.title = mc.code + (mc.films && mc.films.includes(mc.code) ? ' 2' : '');
      p.won = true; p.perf0 = clamp(Math.round(FC.skillFit(S, p) + rnd(-4, 8)), 10, 99);
      p.pay = mc.owed > 0 ? Math.round(mc.salary * (1 + 0.25 * mc.done)) : Math.round(p.pay * (1 + mc.pop / 100));
      p.pictures = mc.owed > 0 ? mc.owed : irnd(2, 3); p.expires = S.week + 12;
      S.offers = S.offers || []; S.offers.push(p);
      S.inbox.push({ id: uid(), kind: 'note', from: p.studio, t: `${mc.name} returns`, d: `${p.studio} wants you back as ${mc.name} in ${p.title}.${mc.owed > 0 ? ` You owe them ${mc.owed} more film${mc.owed > 1 ? 's' : ''}; walking away costs money and the role.` : ''}` });
      if (mc.pop >= 72 && R() < 0.4 && F.tv.length) { const sp = genFranchiseProject(S, mc.fid, { kind: 'original', size: 'lead', contracted: mc.id, title: `${mc.code || mc.name.split(' / ').pop()}` }); if (sp) { sp.tv = true; sp.wide = false; sp.weeks = { prep: 3, shoot: 12, post: 10 }; sp.char = p.char; sp.won = true; sp.perf0 = p.perf0; sp.pay = Math.round(p.pay * 0.8); sp.spinoff = true; sp.expires = S.week + 12; S.offers.push(sp); S.inbox.push({ id: uid(), kind: 'note', from: 'Disney+', t: 'Your own series', d: `${mc.name} is getting a spin-off series. The offer is waiting.` }); } }
    } else if (mc.owed <= 0 && R() < 0.3) { mc.status = 'retired'; timeline(S, `Your run as ${mc.name} came to an end.`); }
  }
  // aging and decade
  if (S.week >= 520) ach(S, 'decade');
  if (FC.age(S) > 45) { S.skills.fitness = clamp(S.skills.fitness - 1, 0, 100); S.skills.looks = clamp(S.skills.looks - 0.6, 0, 100); }
  // walk of fame
  if (!S.star && S.fame >= 60 && S.credits.length >= 10 && S.week >= 260) { S.star = true; ach(S, 'star'); timeline(S, 'Received a star on the Hollywood Walk of Fame.'); S.pending.push({ type: 'note', title: 'A star on the Walk of Fame', text: `The Hollywood Chamber of Commerce honors ${S.me.name} with the ${'2' + (800 + Math.floor(S.week / 13))}th star on the Hollywood Walk of Fame.` }); }
  S.happy = clamp(S.happy + (S.love ? 3 : -2), 0, 100);
  addNews(S, `Happy ${y}. Industry analysts expect ${S.heroFatigue > 0.5 ? 'superhero fatigue to keep biting' : 'a big year for franchise films'}.`, 'industry');
}

// ------------------------------------------------------------------ awards
FC.awardCats = (S, w) => {
  const lead = ['lead', 'ensemble'].includes(w.size);
  const word = S.me.cat === 's' ? 'Actress' : 'Actor';
  return lead ? `Best ${word}` : `Best Supporting ${word}`;
};
function eligible(S, show, y) {
  if (show.kind === 'film') return S.credits.filter(c => !c.tv && !c.weekly && c.kind !== 'commercial' && c.size !== 'extra' && c.size !== 'voice' && c.released != null && FC.year(S, c.released) === y && c.critics != null);
  if (show.kind === 'tv') return S.credits.filter(c => c.tv && !c.guest && c.released != null && S.week - c.released < 52 && S.week - c.released > 4);
  if (show.kind === 'theater') return S.credits.filter(c => c.weekly && c.released != null && S.week - c.released < 52 && (c.region || 'broadway') === show.region && c.size !== 'small');
  if (show.kind === 'razzie') return S.credits.filter(c => !c.tv && c.released != null && FC.year(S, c.released) === y && c.critics != null && c.critics < 25);
  return [];
}
function awardScore(S, show, c, cy) {
  const g = D.GENRES.find(x => x.id === c.genre) || D.GENRES[0];
  const fyc = (S.fyc[c.id] || 0); const camp = Math.min(12, Math.log10(1 + fyc / 1e4) * 5);
  const wins = S.awards.filter(a => a.y === cy && a.won && a.weight).length;
  let s = c.perf * 0.45 + (c.critics || c.rating || 50) * 0.35 + (g.prestige - 1) * 14 + camp + (S.rep - 50) * 0.08 + (c.director ? c.director.p * 2 : 0) + wins * 3 + rnd(-6, 6);
  if (c.fid) s -= 10; if (has(S, 'crowd')) s -= 3; if (show.id === 'globes' && ['comedy', 'musical'].includes(c.genre)) s += 8;
  return s;
}
function awardsTick(S, woy) {
  const y = FC.year(S);
  for (const show of D.AWARDS) {
    const cy = show.noms > show.week ? y + 1 : y; // ceremony year
    const eligYear = cy - 1;
    if (woy === show.noms) {
      const works = eligible(S, show, eligYear); const noms = [];
      const thr = { oscars: 83, bafta: 80, sag: 78, critics: 76, globes: 73, emmys: 72, tonys: 68, olivier: 66, razzies: 0 }[show.id];
      for (const c of works) {
        const sc = show.id === 'razzies' ? 100 - c.critics - c.perf / 2 + rnd(-10, 10) : awardScore(S, show, c, cy);
        if (show.id === 'razzies' ? sc > 60 : sc >= thr) noms.push({ cat: show.id === 'razzies' ? (S.me.cat === 's' ? 'Worst Actress' : 'Worst Actor') : show.kind === 'tv' ? (S.me.cat === 's' ? 'Outstanding Lead Actress' : 'Outstanding Lead Actor') : show.kind === 'theater' ? `Best ${c.size === 'lead' ? 'Leading' : 'Featured'} ${S.me.cat === 's' ? 'Actress' : 'Actor'} in a ${c.stageType === 'musical' ? 'Musical' : 'Play'}` : FC.awardCats(S, c), film: c.title, id: c.id, score: sc, thr, others: D.ACTORS.filter(a => a[1] === S.me.cat).sort(() => R() - 0.5).slice(0, 4).map(a => a[0] + ' (' + filmTitle() + ')') });
        if (c.directedByMe && show.kind === 'film' && sc + 4 >= thr) noms.push({ cat: 'Best Director', film: c.title, id: c.id, score: sc - 4, thr, others: D.DIRECTORS.slice().sort(() => R() - 0.5).slice(0, 4).map(d => d[0]) });
      }
      const best = {}; for (const n of noms) if (!best[n.cat] || best[n.cat].score < n.score) best[n.cat] = n; noms.length = 0; noms.push(...Object.values(best));
      if (noms.length) {
        S.awardNoms[show.id] = { y: cy, noms };
        if (show.id !== 'razzies') { ach(S, 'nom'); if (show.id === 'oscars') { ach(S, 'oscar_nom'); timeline(S, `Nominated for the Academy Award for ${noms[0].cat}, ${noms[0].film}.`); } }
        S.pending.push({ type: 'noms', show: show.id });
        addNews(S, `${show.name} nominations: ${S.me.name} is nominated for ${noms.map(n => n.cat + ' (' + n.film + ')').join(' and ')}.`, 'awards');
      }
    }
    if (woy === show.week && S.awardNoms[show.id] && S.awardNoms[show.id].y === y) {
      const res = S.awardNoms[show.id].noms.map(n => { const p = show.id === 'razzies' ? 0.4 : clamp(0.16 + (n.score - n.thr) / 28 + S.awards.filter(a => a.y === y && a.won && a.cat === n.cat).length * 0.15, 0.06, 0.8); const won = R() < p; const winner = won ? S.me.name : n.others[0].split(' (')[0]; return Object.assign({}, n, { won, winner }); });
      for (const r of res) { S.awards.push({ show: show.id, name: show.name, short: show.short, y, cat: r.cat, film: r.film, won: r.won, weight: show.weight }); if (r.won) awardWon(S, show, r); }
      S.pending.push({ type: 'ceremony', show: show.id, res });
      delete S.awardNoms[show.id];
    }
  }
}
function awardWon(S, show, r) {
  if (show.id !== 'razzies') FC.addPhoto(S, { kind: 'awards', set: 'awards', look: Object.assign({}, S.look), anim: 'cheer', cam: 'close', title: show.short });
  if (show.id === 'razzies') { ach(S, 'razzie'); S.rep = clamp(S.rep - 2, 0, 100); addNews(S, `${S.me.name} "wins" the Razzie for ${r.cat}.`, 'awards'); return; }
  gainFame(S, show.weight * 5); S.rep = clamp(S.rep + show.weight * 6, 0, 100);
  const map = { globes: 'globe', bafta: 'bafta', sag: 'sag', oscars: 'oscar', emmys: 'emmy', tonys: 'tony', olivier: 'olivier' }; if (map[show.id]) ach(S, map[show.id]);
  if (['oscar', 'emmy', 'tony'].every(k => S.achievements[k])) ach(S, 'egot');
  timeline(S, `Won the ${show.name.replace(/s$/, '')} ${show.id === 'oscars' ? 'Academy Award' : ''} for ${r.cat}, ${r.film}.`.replace('Academy Award Academy Award', 'Academy Award'));
  addNews(S, `${S.me.name} wins ${r.cat} at the ${show.name} for ${r.film}.`, 'awards');
  if (S.lowPoint && show.weight >= 0.85) S.comeback = true;
}
FC.campaign = function (S, cid, amt) {
  if (S.money < amt) return { ok: false, t: 'Not enough money.' };
  S.money -= amt; S.fyc[cid] = (S.fyc[cid] || 0) + amt; S.energy = Math.max(0, S.energy - 10);
  return { ok: true, t: `${FC.money(amt)} on For Your Consideration screenings, ads and Q&As.` };
};
FC.campaignable = S => { const w = FC.woy(S), y = FC.year(S); return S.credits.filter(c => c.released != null && !c.tv && !c.weekly && c.kind !== 'commercial' && c.size !== 'extra' && c.size !== 'voice' && c.critics >= 55 && ((w >= 26 && FC.year(S, c.released) === y) || (w <= 3 && FC.year(S, c.released) === y - 1))); };

// ------------------------------------------------------------------ festivals & calendar
function festivalTick(S, woy) {
  for (const f of D.FESTIVALS) {
    if (woy !== f.week) continue;
    const film = S.jobs.find(j => j.stage === 'post' && !j.festival && (j.prestige || ['drama', 'period', 'biopic', 'thriller'].includes(j.genre)) && !j.tv && j.left > 0 && j.left < 22);
    if (!film) continue;
    film.festival = f.name; const q = quality(S, film); film.script = clamp(film.script + 2, 0, 99);
    const ovation = Math.max(0, Math.round((q - 55) / 3 + rnd(-2, 3)));
    S.buzz = clamp((S.buzz || 0) + q / 8, -20, 60); gainFame(S, f.prestige * 0.6);
    ach(S, 'festival'); if (ovation >= 10 && (f.id === 'cannes' || f.id === 'venice')) ach(S, 'ovation');
    addNews(S, `${film.title} premieres at ${f.name}${ovation >= 3 ? ` to a ${ovation}-minute standing ovation` : ''}. Early buzz on ${S.me.name}: ${q > 70 ? 'awards contender' : q > 50 ? 'promising' : 'muted'}.`, 'you');
    S.pending.push({ type: 'festival', fest: f.name, film: film.title, ovation, q: Math.round(q) });
    if (!film.wide && R() < 0.5 + q / 200) { film.wide = q > 75 && R() < 0.4; addNews(S, `${pick(['Neon', 'A24', 'Netflix', 'Searchlight', 'Apple'])} buys ${film.title} out of ${f.name}.`, 'industry'); }
  }
}
function calendarTick(S, woy) {
  for (const e of D.EVENTS_CAL) if (woy === e.week) {
    if (e.id === 'comiccon' && S.jobs.some(j => j.fid) ) S.inbox.push({ id: uid(), kind: 'event', ev: 'comiccon', from: 'San Diego Comic-Con', t: 'Hall H panel', d: `Your studio wants you on stage in Hall H to tease ${S.jobs.find(j => j.fid).title}.` });
    if (e.id === 'metgala' && S.fame >= 40) S.inbox.push({ id: uid(), kind: 'event', ev: 'metgala', from: 'Vogue', t: 'Met Gala invitation', d: 'The first Monday in May. Pick a look and climb the steps.' });
    if (e.id === 'fashion' && S.fame >= 35) S.inbox.push({ id: uid(), kind: 'event', ev: 'fashion', from: pick(D.BRANDS).names[0], t: 'Front row at Paris Fashion Week', d: 'Sit front row, be photographed, maybe meet a brand.' });
  }
}
function inboxTick(S) {
  S.inbox = S.inbox.filter(m => !m.expires || m.expires > S.week);
  const promo = S.jobs.find(j => j.stage === 'post' && j.left <= 4 && j.left > 0 && !j.promoDone && !j.tv && j.wide);
  if (false && promo && S.fame >= 12) { promo.promoDone = true; const shows = D.TALK.filter(t => S.fame >= t.fame); const t = pick(shows.length ? shows : D.TALK.slice(1, 3)); S.inbox.push({ id: uid(), kind: 'talk', show: t.id, from: t.name, t: `Book on ${t.name}`, d: `Promote ${promo.title} before it opens.`, film: promo.id, expires: S.week + 4 });
    if (S.fame >= 25) S.inbox.push({ id: uid(), kind: 'cover', mag: pick(D.MAGS), from: 'Press', t: 'Magazine cover', d: `A cover story timed to ${promo.title}.`, film: promo.id, expires: S.week + 4 }); }
  if (S.fame >= 22 && R() < 0.05 + S.fame / 900 && S.brands.filter(b => b.until > S.week).length < 3) {
    const b = pick(D.BRANDS); const nm = pick(b.names); if (!S.brands.some(x => x.name === nm && x.until > S.week)) S.inbox.push({ id: uid(), kind: 'brand', from: nm, cat: b.cat, name: nm, pay: Math.round(b.base * (S.fame / 40) * (1 + (S.team.manager ? 0.15 : 0)) * rnd(0.8, 1.3) / 1000) * 1000, years: irnd(1, 3), t: `${b.cat} ambassador`, d: `${nm} wants you as the face of its next campaign.`, expires: S.week + 6 });
  }
  if (S.fame >= 55 && R() < 0.02) S.inbox.push({ id: uid(), kind: 'talk', show: 'snl', from: 'Saturday Night Live', t: 'Host SNL', d: 'Live from New York. It is a week of your life and a career moment.', expires: S.week + 6 });
}
function loveTick(S) {
  if (!S.love) return; const L = S.love;
  const busy = S.jobs.some(j => j.stage === 'shoot'); L.bond = clamp(L.bond + (busy ? -1.2 : 0.8) + (S.happy - 50) / 100, 0, 100);
  if (L.bond <= 5) { addNews(S, `${S.me.name} and ${L.name} have split, sources say.`, 'you'); timeline(S, `Broke up with ${L.name}.`); S.happy = clamp(S.happy - 15, 0, 100); S.love = null; return; }
  if (L.stage === 'dating' && L.bond > 80 && S.week - L.since > 52 && R() < 0.04) S.pending.push({ type: 'love', step: 'propose' });
  if (L.stage === 'engaged' && S.week - L.since2 > 30 && R() < 0.1) { L.stage = 'married'; ach(S, 'married'); timeline(S, `Married ${L.name}.`); addNews(S, `${S.me.name} and ${L.name} marry in a private ceremony.`, 'you'); S.happy = clamp(S.happy + 15, 0, 100); }
}
FC.loveAnswer = function (S, yes) { if (!S.love) return; if (yes) { S.love.stage = 'engaged'; S.love.since2 = S.week; S.happy = clamp(S.happy + 10, 0, 100); timeline(S, `Engaged to ${S.love.name}.`); addNews(S, `${S.me.name} is engaged to ${S.love.name}.`, 'you'); } else { S.love.bond -= 30; } };
FC.loveDate = function (S) { if (!S.love) return; if (S.energy < 10) return 'Not enough energy.'; S.energy -= 10; S.money -= 300; S.love.bond = clamp(S.love.bond + 8, 0, 100); S.happy = clamp(S.happy + 3, 0, 100); return `A good night with ${S.love.name}.`; };
FC.breakUp = function (S) { if (!S.love) return; timeline(S, `Broke up with ${S.love.name}.`); S.happy -= 8; S.love = null; };

// ------------------------------------------------------------------ prep, effort on set, press
const busyRole = j => j.kind !== 'commercial' && j.size !== 'extra';
FC.busyRole = busyRole;
FC.calcPerf = j => {
  const prep = j.prepScore || 0; const eff = j.effort && j.effort.length ? j.effort.reduce((a, b) => a + b, 0) / j.effort.length : 45;
  const base = j.perf0 != null ? j.perf0 : 50; const ev = (j.perfAdj || 0);
  if (!busyRole(j)) return clamp(Math.round(base + ev), 5, 99);
  return clamp(Math.round(base * 0.45 + prep * 0.22 + eff * 0.33 + ev), 5, 99);
};
FC.prepActs = (S, j) => D.PREP_ACTS.filter(a => a.for === 'all' || a.for.split(' ').includes(j.genre) || (a.id === 'vocal' && j.theater)).filter(a => !a.costar || (j.costars && j.costars.length));
FC.doPrep = function (S, jid, aid) {
  const j = S.jobs.find(x => x.id === jid); const a = D.PREP_ACTS.find(x => x.id === aid);
  if (!j || !a || j.stage !== 'prep') return { ok: false, t: 'You can only prep before shooting starts.' };
  if ((j.prepScore || 0) >= 100) return { ok: false, t: 'You are fully prepared for this role.' };
  if (S.energy < a.cost) return { ok: false, t: `You need ${a.cost} energy.` };
  if (a.price && S.money < a.price) return { ok: false, t: `You need ${FC.money(a.price)}.` };
  j.prepLog = j.prepLog || {}; const reps = j.prepLog[aid] || 0;
  S.energy -= a.cost; if (a.price) S.money -= a.price;
  const g = Math.round(a.gain * (0.6 + S.skills[a.skill] / 100) * Math.pow(0.8, reps) * (has(S, 'perfectionist') ? 1.15 : 1) * (has(S, 'method') && aid === 'research' ? 1.3 : 1));
  j.prepScore = clamp((j.prepScore || 0) + g, 0, 100); j.prepLog[aid] = reps + 1;
  S.skills[a.skill] = clamp(S.skills[a.skill] + 0.6, 0, 100); if (aid === 'body') S.skills.fitness = clamp(S.skills.fitness + 0.8, 0, 100);
  if (aid === 'chem') j.costarRel = clamp((j.costarRel || 50) + 6, 0, 100);
  return { ok: true, t: `${a.name}: prep +${g} (now ${j.prepScore}/100).` };
};
FC.effortCost = (j, l) => Math.max(2, D.EFFORT.find(x => x[0] === l)[2] - Math.round((j.comfort || 0) / 2));
FC.setEffort = function (S, jid, level) {
  const j = S.jobs.find(x => x.id === jid); const e = D.EFFORT.find(x => x[0] === level); if (!j || !e || j.stage !== 'shoot') return { ok: false, t: 'Not shooting.' };
    const cost = l => Math.max(2, D.EFFORT.find(x => x[0] === l)[2] - Math.round((j.comfort || 0) / 2)); const pc = j.wk ? cost(j.wk.level) : 0;
  if (S.energy + pc < cost(level)) return { ok: false, t: `You need ${cost(level)} energy for that.` };
  S.energy += pc - cost(level); j.wk = Object.assign(j.wk || { extras: [] }, { level });
  return { ok: true, t: `This week on ${j.title}: ${e[1].toLowerCase()}.` };
};
FC.shootExtra = function (S, jid, xid) {
  const j = S.jobs.find(x => x.id === jid); const x = D.SHOOT_EXTRAS.find(z => z.id === xid); if (!j || !x || j.stage !== 'shoot') return { ok: false, t: 'Not shooting.' };
  if (!j.wk) return { ok: false, t: 'Pick your effort for the week first.' };
  if (j.wk.extras.includes(xid)) return { ok: false, t: 'Already done this week.' };
  if (S.energy < x.cost) return { ok: false, t: `You need ${x.cost} energy.` };
  S.energy -= x.cost; j.wk.extras.push(xid); if (x.costar) j.costarRel = clamp((j.costarRel || 50) + x.costar, 0, 100);
  return { ok: true, t: `${x.name}. Effort +${x.effort} this week.` };
};
FC.needsEffort = S => S.jobs.filter(j => j.stage === 'shoot' && busyRole(j) && !j.wk);
function logEffort(S, j) {
  if (!busyRole(j)) return;
  let w = j.wk; if (!w) { w = { level: 'coast', extras: [], auto: true }; S.energy = Math.max(0, S.energy - 5); S.log.push(`You coasted on ${j.title} this week.`); }
  const e = D.EFFORT.find(x => x[0] === w.level);
  let v = e[3] + w.extras.reduce((a, id) => a + D.SHOOT_EXTRAS.find(x => x.id === id).effort, 0) + rnd(-5, 5);
  if (w.level === 'all' && S.energy < 10) { S.health = clamp(S.health - 6, 0, 100); v -= 8; S.log.push('You are running on fumes.'); }
  j.effort = (j.effort || []).concat(Math.round(clamp(v, 0, 100))); j.wk = null;
  if (w.level === 'all') j.director_rel = clamp(j.director_rel + 1.5, 0, 100); if (w.level === 'coast') j.director_rel = clamp(j.director_rel - 2, 0, 100);
}
function pressTier(j) { if (j.theater) return 'stage'; if (j.tv) return 'tv'; if (j.fid) return 'fr'; if (j.prestige && !j.wide) return 'indie'; if (j.size === 'voice') return 'big'; return j.budget && j.budget >= 60e6 ? 'big' : 'indie'; }
function makePress(S, j, due) {
  const tier = pressTier(j);
  let items = D.PRESS.filter(p => p.tiers.split(' ').includes(tier));
  const n = { fr: j.size === 'lead' || j.teamup ? 7 : 5, big: j.size === 'lead' ? 5 : 3, indie: 2, tv: 3, stage: 2 }[tier] || 2;
  if (j.size === 'cameo' || j.size === 'small') items = items.filter(p => p.cost <= 15);
  items = items.sort((a, b) => b.promo - a.promo).slice(0, Math.min(n + 1, items.length)).sort(() => R() - 0.5).slice(0, n);
  const lead = tier === 'fr' ? 8 : 5;
  j.press = items.map((p, i) => ({ id: uid(), type: p.id, done: false, from: Math.max(S.week, due - lead + Math.floor(i * lead / items.length)), due }));
  j.pressTier = tier;
  const dir = j.director ? j.director.name : j.studio;
  S.inbox.push({ id: uid(), kind: 'note', from: dir, t: `Press schedule for ${j.title}`, d: `${items.length} press commitment${items.length > 1 ? 's' : ''}${tier === 'fr' ? ', and the studio expects all of them' : ''}. They start ${due - lead <= S.week ? 'now' : 'a few weeks before release'}. Open the Work tab to do them.` });
}
FC.pressOpen = S => { const out = []; for (const j of S.jobs) for (const p of (j.press || [])) if (!p.done && p.from <= S.week && S.week < p.due) out.push({ j, p }); return out; };
FC.doPress = function (S, jid, pid, style) {
  const j = S.jobs.find(x => x.id === jid); if (!j) return { ok: false, t: 'That project has already come out.' };
  const it = (j.press || []).find(x => x.id === pid); if (!it || it.done) return { ok: false, t: 'Already done.' };
  const P = D.PRESS.find(x => x.id === it.type);
  if (S.week < it.from) return { ok: false, t: 'Not yet. The studio will call you.' };
  if (S.energy < P.cost) return { ok: false, t: `You need ${P.cost} energy.` };
  if (P.live) return { ok: true, live: true };
  S.energy -= P.cost; it.done = true;
  const sk = style === 'serious' ? (S.skills.drama + S.skills.charisma) / 2 : style === 'tease' ? S.skills.charisma : S.skills.charisma + (has(S, 'charming') ? 8 : 0);
  const roll = sk + rnd(-20, 20);
  const mult = roll > 45 ? 1.4 : roll > 25 ? 1 : 0.5; j.promo = (j.promo || 0) + P.promo * mult * (style === 'tease' && j.fid ? 1.25 : 1);
  if (style === 'tease' && j.fid && R() < 0.12) { S.rep = clamp(S.rep - 3, 0, 100); addNews(S, `${S.me.name} accidentally spoils a plot point on the ${j.title} press tour. The studio is not happy.`, 'scandal'); return { ok: true, t: 'You said too much. The clip of you spoiling the movie is everywhere.' }; }
  gainFame(S, P.cost / 40); S.followers += Math.round(P.cost * 900 * (1 + S.fame / 20));
  if (roll < 15 && R() < 0.4) { S.rep = clamp(S.rep - 1, 0, 100); return { ok: true, t: `${P.name}: an awkward moment went viral for the wrong reasons.` }; }
  return { ok: true, t: `${P.name}: ${roll > 45 ? pick(['you were great. The clips are everywhere.', 'the best interview of the tour.', 'everyone left a fan.']) : roll > 25 ? pick(['solid work.', 'it went fine.', 'you hit every talking point.']) : pick(['a bit flat.', 'you looked tired.', 'not your best day.'])}` };
};
FC.promoMul = (S, j) => {
  const tot = (j.press || []).length; const done = (j.press || []).filter(p => p.done).length;
  const ratio = tot ? done / tot : 0.6;
  if (tot && !j.pressSettled) { j.pressSettled = true; const miss = tot - done;
    if (miss > 0) { S.rep = clamp(S.rep - miss * (j.pressTier === 'fr' ? 1.5 : 0.8), 0, 100); j.director_rel = clamp(j.director_rel - miss * 4, 0, 100); studioShift(S, j.studio, -miss * 2); } else studioShift(S, j.studio, 3);
    if (ratio < 0.5) addNews(S, `${S.me.name} skipped most of the press for ${j.title}. ${j.pressTier === 'fr' ? 'Studio insiders are fuming.' : 'The director noticed.'}`, 'you'); }
  return clamp(0.72 + ratio * 0.4 + (j.promo || 0) + (FC.buzz(S, j) - 40) / 400, 0.6, 1.8);
};

// ------------------------------------------------------------------ Marquee (critics app)
const NOTE = { hi: ['gives a career-best performance', 'is mesmerizing in every scene', 'is the reason to see this', 'does astonishing, precise work', 'commands the screen'], mid: ['is solid and committed', 'does good work with what the script gives', 'is as reliable as ever', 'is quietly effective', 'has a few great moments'], lo: ['feels miscast', 'never finds the character', 'seems to be in a different movie', 'is stiff and unconvincing', 'looks exhausted'] };
const band = v => v >= 7.6 ? 'hi' : v >= 5.6 ? 'mid' : 'lo';
function marquee(S, j) {
  const q = j.q || quality(S, j); const score = Math.round(clamp(q / 10 + rnd(-0.6, 0.6), 1, 10) * 10) / 10;
  const mine = Math.round(clamp(j.perf / 10 + rnd(-0.4, 0.4), 1, 10) * 10) / 10;
  const role = j.char ? j.char.name : FC.SIZES[j.size] ? (j.size === 'lead' ? 'Lead' : FC.SIZES[j.size].n) : 'Cast';
  const cast = [{ name: S.me.name, role, score: mine, note: pick(NOTE[band(mine)]), me: true }];
  const others = (j.costars || []).concat(costars(2, j.costars || []).filter(a => a !== S.me.name)).slice(0, 4);
  others.forEach((a, i) => { const st = (D.ACTORS.find(x => x[0] === a) || [0, 0, 3])[2]; const v = Math.round(clamp(q / 10 + rnd(-1.4, 1.1) + (st - 3) * 0.2 + ((j.costarRel || 50) - 50) / 80, 2, 10) * 10) / 10; cast.push({ name: a, role: i === 0 ? 'Co-lead' : 'Supporting', score: v, note: pick(NOTE[band(v)]) }); });
  cast.sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0) || b.score - a.score);
  const prep = j.prepScore || 0; const eff = j.effort && j.effort.length ? j.effort.reduce((a, b) => a + b, 0) / j.effort.length : 50;
  const G = (D.GENRES.find(g => g.id === j.genre) || { name: 'film' }).name.toLowerCase();
  const kind = j.theater ? 'production' : j.tv ? 'series' : 'film';
  const p1 = score >= 8 ? `${j.title} is the kind of ${G} ${kind} that reminds you why you love this stuff. ${j.director ? j.director.name : 'The director'} builds it patiently, and nearly every choice lands.` : score >= 6 ? `${j.title} is a well-made ${G} ${kind} that works more often than it doesn't. ${j.director ? j.director.name : 'The director'} keeps it moving, even when the script wanders.` : `${j.title} is a ${G} ${kind} at war with itself. ${j.director ? j.director.name : 'The director'} never settles on a tone, and the seams show.`;
  const p2 = `${S.me.name} ${pick(NOTE[band(mine)])}. ` + (prep >= 70 ? pick(['You can see the preparation in every gesture.', 'Clearly someone did the homework: the accent, the posture, the history are all there.', 'The months of prep pay off.']) : prep >= 35 ? 'The groundwork is there, if not every detail.' : pick(['It feels like they showed up and winged it.', 'There is little sign of real preparation.', 'The character never feels lived in.'])) + ' ' + (eff >= 75 ? pick(['There is an electric, all-in energy on screen.', 'Every scene feels fought for.']) : eff >= 50 ? 'The work is consistent and professional.' : pick(['In too many scenes they look like they are counting the days to wrap.', 'The energy dips badly in the middle stretch.']));
  const top = cast.filter(c => !c.me).sort((a, b) => b.score - a.score)[0];
  const p3 = top ? `${top.name} ${top.note}${top.score > mine ? ', and at times walks away with the whole thing' : ''}. ${score >= 7 ? 'Recommended.' : score >= 5 ? 'Worth a look for fans.' : 'Skip it.'}` : '';
  return { score, mine, bnm: score >= 8.5, bp: mine >= 9, by: pick(D.REVIEWERS), cast, text: [p1, p2, p3].filter(Boolean), prep: Math.round(prep), effort: Math.round(eff) };
}
FC.marquee = marquee;

FC.closingChoice = function (S, cid, i) {
  const j = S.credits.find(c => c.id === cid); const k = (D.CLOSING[i] || D.CLOSING[0])[0];
  if (k === 'speech') { S.rep = clamp(S.rep + 2, 0, 100); gainFame(S, 0.8); return 'The house rises. Reputation +2, Fame +0.8'; }
  if (k === 'crew') { S.rep = clamp(S.rep + 3, 0, 100); S.happy = clamp(S.happy + 3, 0, 100); return 'The crew gets the loudest cheer of the night. Reputation +3'; }
  S.happy = clamp(S.happy + 6, 0, 100); return 'You will remember this forever. Happiness +6';
};

// ------------------------------------------------------------------ social media: camera roll, Lens, Clapper
FC.ROLL_MAX = 24;
FC.addPhoto = function (S, p) {
  S.roll = S.roll || []; p.id = p.id || uid(); p.w = S.week; S.roll.unshift(p); S.rollNew = (S.rollNew || 0) + 1;
  if (S.roll.length > FC.ROLL_MAX) S.roll.length = FC.ROLL_MAX; return p;
};
FC.photoLook = (S, p) => p.look || S.look;
FC.SELFIE_SPOTS = [['home', 'At home'], ['street', 'Night out'], ['gym', 'At the gym'], ['diner', 'Diner'], ['forest', 'Hiking'], ['city', 'Rooftop'], ['desert', 'Desert trip'], ['carpet', 'Event']];
FC.SELFIE_POSES = [['selfie', 'Selfie'], ['pose', 'Strike a pose'], ['wave', 'Wave'], ['cheer', 'Celebrate'], ['hero', 'Power pose']];
FC.takeSelfie = function (S, spot, pose) {
  if (S.energy < 3) return { ok: false, t: 'Too tired.' };
  S.energy -= 3; const p = FC.addPhoto(S, { kind: 'selfie', set: spot || 'home', look: Object.assign({}, S.look), anim: pose === 'selfie' ? null : pose, cam: pose === 'selfie' ? 'selfie' : 'close' });
  return { ok: true, t: 'Saved to your camera roll.', photo: p };
};
FC.captions = (S, p) => { const j = p.jobId ? (S.jobs.find(x => x.id === p.jobId) || S.credits.find(x => x.id === p.jobId)) : null;
  return (D.CAPTIONS[p.kind] || D.CAPTIONS.selfie).map(t => FC.fill(t, { day: p.day || 12, title: j ? j.title : 'the movie', role: j && j.char ? j.char.name : 'my character' })); };
FC.postLens = function (S, pid, caption) {
  const p = (S.roll || []).find(x => x.id === pid); if (!p) return { ok: false, t: 'Photo not found.' };
  if (S.energy < 8) return { ok: false, t: 'You need 8 energy to post.' };
  S.energy -= 8;
  const j = p.jobId ? (S.jobs.find(x => x.id === p.jobId) || S.credits.find(x => x.id === p.jobId)) : null; const unreleased = j && S.jobs.includes(j);
  const mult = { bts: 1.5, promo: 1.25, carpet: 1.4, stage: 1.1, awards: 1.9, selfie: 0.85, tv: 1 }[p.kind] || 1;
  const recent = (S.lens || []).filter(x => S.week - x.w < 2).length;
  const likes = Math.round(S.followers * rnd(0.03, 0.09) * mult * (1 + S.skills.looks / 200) * Math.pow(0.7, recent) + rnd(20, 200));
  const gain = Math.round(likes * rnd(0.05, 0.12)); S.followers += gain; gainFame(S, Math.min(1.5, Math.log10(1 + likes) / 8) * (recent ? 0.5 : 1));
  const post = { id: uid(), photo: p, caption: (caption || '').slice(0, 140), likes, w: S.week, comments: [] };
  let t = `Posted. ${FC.num(likes)} likes, +${FC.num(gain)} followers.`;
  if (p.kind === 'bts' && unreleased && FC.brand(j.studio) >= 0.5 && R() < 0.35) { studioShift(S, j.studio, -8); S.rep = clamp(S.rep - 2, 0, 100); post.leak = true; addNews(S, `${S.me.name}'s set photo from ${j.title} leaks plot details. ${j.studio} is reportedly furious.`, 'scandal'); t += ` But ${j.studio} says you leaked the costume. Studio -8.`; post.comments.push(['studio_insider', 'Someone is getting a call from legal.']); }
  else if (unreleased && (p.kind === 'promo' || p.kind === 'bts')) { j.promo = (j.promo || 0) + (p.kind === 'promo' ? 0.025 : 0.015); t += ' Buzz for ' + j.title + ' went up.'; }
  const tone = likes > S.followers * 0.06 ? 'good' : 'mixed';
  for (let i = 0; i < 3; i++) post.comments.push([pick(D.INFLUENCERS), pick(D.FAN_POSTS[tone])]);
  if (R() < 0.3) post.comments.push([pick(D.ACTORS)[0].replace(/\s+/g, '').toLowerCase(), pick(['😍', '🔥🔥', 'Iconic.', 'Miss you!', 'Proud of you.'])]);
  S.lens = S.lens || []; S.lens.unshift(post); if (S.lens.length > 30) S.lens.length = 30;
  S.roll = S.roll.filter(x => x.id !== pid);
  return { ok: true, t, post };
};
FC.postClapper = function (S, kind, text) {
  const k = D.CLAPPER_KINDS.find(x => x.id === kind) || D.CLAPPER_KINDS[0];
  if (S.energy < 5) return { ok: false, t: 'You need 5 energy to post.' };
  S.energy -= 5;
  const friend = pick(D.ACTORS)[0]; const body = (text && text.trim()) ? text.trim().slice(0, 200) : FC.fill(pick(k.t), { friend });
  let likes = Math.round(S.followers * rnd(0.01, 0.05) * (1 + S.skills.charisma / 150) + rnd(5, 80)); let t = '';
  if (kind === 'take') { if (R() < 0.3) { S.rep = clamp(S.rep - 2, 0, 100); likes *= 3; t = 'You got ratioed. Reputation -2, but everyone is talking.'; gainFame(S, 0.8); } else { gainFame(S, 0.5); t = 'Your take is trending.'; } }
  if (kind === 'joke') { if (S.skills.comedy + rnd(-20, 20) > 45) { likes *= 4; gainFame(S, 0.8); t = 'It went viral.'; } else t = 'A few chuckles.'; }
  if (kind === 'thanks') { S.rep = clamp(S.rep + 1, 0, 100); t = 'Fans loved it.'; }
  if (kind === 'hype') { const j = S.jobs.find(x => x.stage !== 'prep') || S.jobs[0]; if (j) { j.promo = (j.promo || 0) + 0.01; t = `Fans are guessing what ${j.title} is.`; } else t = 'Fans are guessing.'; }
  if (kind === 'support') { if (R() < 0.4) { S.contacts++; t = `${friend} reposted it. New contact.`; } else t = `${friend} liked it.`; }
  S.followers += Math.round(likes * 0.06);
  addFeed(S, S.me.name, body, likes); S.feed[0].mine = true; S.feed[0].replies = [0, 1].map(() => [pick(D.INFLUENCERS), pick(D.FAN_POSTS[likes > S.followers * 0.03 ? 'good' : 'mixed'])]);
  return { ok: true, t: `Posted. ${FC.num(likes)} likes. ${t}` };
};

// ------------------------------------------------------------------ live TV: talk shows and SNL
FC.livePress = function (S, jid, pid) {
  const j = S.jobs.find(x => x.id === jid); const it = j && (j.press || []).find(x => x.id === pid); if (!it || it.done) return { ok: false, t: 'Already done.' };
  const shows = D.TALK.filter(t => t.id !== 'snl' && S.fame >= t.fame - 10); const t = pick(shows.length ? shows : D.TALK.slice(0, 3));
  const m = { id: uid(), kind: 'talk', show: t.id, film: j.id, press: { jid, pid } }; S.inbox.push(m); const r = FC.liveStart(S, m.id); if (!r.ok) S.inbox = S.inbox.filter(x => x !== m); return r;
};
FC.liveStart = function (S, mid) {
  const m = S.inbox.find(x => x.id === mid); if (!m) return { ok: false, t: 'That invite is gone.' };
  const snl = m.show === 'snl'; const cost = snl ? 35 : 15;
  if (S.energy < cost) return { ok: false, t: `You need ${cost} energy for this.` };
  S.inbox = S.inbox.filter(x => x !== m); S.energy -= cost;
  const t = D.TALK.find(x => x.id === m.show) || D.TALK[0];
  const L = { kind: snl ? 'snl' : 'talk', show: t.id, name: t.name, film: m.film || null, press: m.press || null, meter: 50, step: 0, log: [], viral: false };
  if (snl) { L.guest = pick(D.MUSIC_GUESTS); L.cast = D.SNL_CAST.slice().sort(() => R() - 0.5).slice(0, 3); L.sketches = D.SNL_SKETCHES.slice().sort(() => R() - 0.5).slice(0, 3); L.steps = ['cold', 'mono', 'sk', 'sk', 'sk', 'night']; }
  else { L.qs = D.TALK_Q.slice().sort(() => R() - 0.5).slice(0, 2); L.game = pick(D.TALK_GAMES[t.id] || D.TALK_GAMES.fallon); L.steps = ['intro', 'q', 'q', 'game', 'night']; }
  S.live = L; return { ok: true, live: L };
};
function liveRoll(S, skill, diff) { return S.skills[skill] + (has(S, 'charming') ? 5 : 0) + rnd(-18, 18) - diff; }
FC.liveChoose = function (S, i) {
  const L = S.live; if (!L) return null; const kind = L.steps[L.step]; let d = 0, text = '';
  if (kind === 'mono') { const m = D.SNL_MONO[i] || D.SNL_MONO[0]; const r = liveRoll(S, m.skill, 40);
    d = r > 10 ? 16 : r > 0 ? 8 : -10; text = r > 10 ? pick(['The monologue kills. The band can barely play the outro for laughing.', 'You own the room from the first line.']) : r > 0 ? 'A solid monologue. A few big laughs.' : pick(['Some jokes land in silence. You push through.', 'The cue cards and you are not on speaking terms.']); }
  else if (kind === 'sk') { const n = L.log.filter(x => x.kind === 'sk').length; const sk = L.sketches[n]; const c = (D.SNL_COMMIT[i] || D.SNL_COMMIT[0])[0]; const r = liveRoll(S, sk.skill, 42);
    if (c === 'commit') { d = r > 0 ? 14 : -8; text = r > 0 ? 'You go all the way, and the audience goes with you.' : 'You commit hard to a bit that is not working. Long silence.'; }
    if (c === 'straight') { const r2 = liveRoll(S, 'drama', 35); d = r2 > 0 ? 9 : 2; text = r2 > 0 ? 'Playing it dead serious makes it funnier. Nice.' : 'Safe. Fine. Forgettable.'; }
    if (c === 'break') { if (R() < 0.4 + S.skills.charisma / 300) { d = 12; L.viral = true; text = `You break. ${pick(L.cast)} breaks. The whole cast loses it. This clip is going to be everywhere.`; } else { d = -10; text = 'You crack up, but the audience does not. It looks unprofessional.'; } }
    L.log.push({ kind: 'sk', t: sk.t, d }); }
  else if (kind === 'q') { const n = L.log.filter(x => x.kind === 'q').length; const q = L.qs[n]; const o = q.opts[i] || q.opts[0]; const r = liveRoll(S, o[1], 35);
    d = o[2] === 'promo' ? (r > 0 ? 6 : 0) : r > 0 ? 13 : -7; if (o[2] === 'promo' && L.film) L.promo = (L.promo || 0) + 0.04;
    text = o[2] === 'funny' ? (r > 0 ? 'The host doubles over. The audience is howling.' : 'The joke does not land. The host rescues you.') : o[2] === 'humble' ? (r > 0 ? 'Warm, genuine, and very likeable.' : 'A bit flat. Nice, but flat.') : (r > 0 ? 'A smooth plug. The studio is happy.' : 'That plug was a bit obvious.');
    if (o[2] === 'funny' && r > 18 && R() < 0.4) L.viral = true; L.log.push({ kind: 'q', d }); }
  else if (kind === 'game') { const r = liveRoll(S, i === 0 ? 'comedy' : 'charisma', i === 0 ? 40 : 25); d = i === 0 ? (r > 0 ? 16 : -6) : (r > 0 ? 7 : 1);
    if (i === 0 && r > 12 && R() < 0.5) L.viral = true; text = i === 0 ? (r > 0 ? `You go all in on ${L.game}. It is the best segment the show has had in weeks.` : `${L.game[0].toUpperCase() + L.game.slice(1)} gets the better of you. Still, good sport.`) : 'You play it safe. Polite applause.'; }
  L.meter = clamp(L.meter + d, 0, 100); L.step++;
  return { text, d, meter: L.meter, viral: L.viral };
};
FC.liveNext = S => { if (S.live) S.live.step++; };
FC.liveFinish = function (S) {
  const L = S.live; if (!L) return null; S.live = null; const snl = L.kind === 'snl';
  const g = L.meter >= 80 ? 'A' : L.meter >= 65 ? 'B' : L.meter >= 45 ? 'C' : 'D';
  gainFame(S, (L.meter / 50) * (snl ? 2.4 : 1) + (L.viral ? 1.5 : 0)); S.followers += Math.round((L.meter * 1500 + (L.viral ? 400000 : 0)) * (snl ? 3 : 1) * (1 + S.fame / 25));
  S.rep = clamp(S.rep + (L.meter - 50) / 20, 0, 100);
  if (L.film) { const j = S.jobs.find(x => x.id === L.film); if (j) { j.promo = (j.promo || 0) + 0.03 + (L.promo || 0) + (L.viral ? 0.05 : 0) + (L.meter - 50) / 1000; if (L.press) { const it = (j.press || []).find(x => x.id === L.press.pid); if (it) it.done = true; } } }
  ach(S, 'talk'); if (snl) { ach(S, 'snl'); S.skills.comedy = clamp(S.skills.comedy + (L.meter > 60 ? 3 : 1.5), 0, 100); timeline(S, `Hosted Saturday Night Live${g === 'A' ? ' to rave reviews' : ''}.`); }
  const good = L.meter >= 60;
  const quotes = [0, 1].map(() => ({ o: pick(D.OUTLETS), good, t: snl ? (good ? pick([`${S.me.name} is a natural. Invite them back.`, 'One of the best hosts of the season.', 'The sketches lived and died on their commitment, and they committed.']) : pick(['A host who seemed to be counting the minutes.', 'Forgettable, with one good sketch.', 'The cast carried this one.'])) : (good ? pick(['A great guest.', 'The interview of the week.']) : pick(['Pleasant, but nothing to remember.', 'A little stiff on the couch.'])) }));
  if (L.viral) addNews(S, `${S.me.name}'s ${snl ? 'SNL sketch' : 'appearance on ' + L.name} is going viral.`, 'you');
  else if (snl) addNews(S, `${S.me.name} hosts Saturday Night Live with musical guest ${L.guest}.`, 'you');
  addFeed(S, snl ? 'nbcsnl' : L.name, `${S.me.name} tonight! ${L.viral ? '🔥🔥🔥' : good ? '🔥' : ''}`);
  return { grade: g, meter: L.meter, viral: L.viral, quotes, snl, name: L.name };
};

// ------------------------------------------------------------------ inbox actions
FC.answerInbox = function (S, mid, choice) {
  const m = S.inbox.find(x => x.id === mid); if (!m) return 'That message is gone.';
  S.inbox = S.inbox.filter(x => x !== m);
  if (m.kind === 'note') return '';
  if (choice === 'no') { if (m.kind === 'brand') return 'You passed on the deal.'; return 'You declined.'; }
  if (S.energy < 15 && m.kind !== 'brand') { S.inbox.push(m); return 'Not enough energy this week.'; }
  if (m.kind === 'talk') {
    S.energy -= 15; const t = D.TALK.find(x => x.id === m.show) || D.TALK[0];
    const sk = choice === 'story' ? S.skills.charisma : choice === 'game' ? S.skills.comedy : (S.skills.charisma + S.skills.drama) / 2;
    const good = sk + rnd(-15, 15) > 35; gainFame(S, (good ? 2 : 0.6) * (m.show === 'snl' ? 2.5 : 1)); S.followers += Math.round((good ? 60000 : 15000) * (1 + S.fame / 20));
    if (m.film) { const j = S.jobs.find(x => x.id === m.film); if (j) j.promo = (j.promo || 0) + (choice === 'promo' ? 0.08 : 0.04); }
    ach(S, 'talk'); if (m.show === 'snl') { ach(S, 'snl'); S.skills.comedy = clamp(S.skills.comedy + 3, 0, 100); timeline(S, 'Hosted Saturday Night Live.'); }
    const clip = good ? pick(['The clip has millions of views.', 'The host could not stop laughing.', 'Your story is everywhere online.']) : pick(['A little stiff, but fine.', 'It was over in a blink.']);
    addFeed(S, t.name, `${S.me.name} tonight! ${good ? '🔥' : ''}`);
    return `You did ${t.name}. ${clip}`;
  }
  if (m.kind === 'cover') { S.energy -= 10; gainFame(S, 1.5); ach(S, 'cover'); S.rep = clamp(S.rep + (S.team.stylist ? 2 : 1), 0, 100); timeline(S, `Covered ${m.mag}.`); return `You're on the cover of ${m.mag}.`; }
  if (m.kind === 'brand') { S.brands.push({ name: m.name, cat: m.cat, pay: m.pay, until: S.week + m.years * 52 }); ach(S, 'brand'); addNews(S, `${S.me.name} is the new face of ${m.name}.`, 'you'); return `You signed with ${m.name} for ${FC.money(m.pay)} a year.`; }
  if (m.kind === 'event') {
    S.energy -= 15;
    if (m.ev === 'comiccon') { gainFame(S, 2); ach(S, 'comiccon'); const j = S.jobs.find(x => x.fid); if (j) j.promo = (j.promo || 0) + 0.1; S.followers += 200000; return 'Hall H screamed. The footage leaked within minutes, and everyone is talking.'; }
    if (m.ev === 'metgala') { const best = S.team.stylist * 15 + S.skills.looks / 2 + rnd(0, 40); gainFame(S, 2); ach(S, 'metgala'); S.money -= 20000; return best > 55 ? 'You made every best-dressed list.' : 'Fine, but nobody will remember it.'; }
    if (m.ev === 'fashion') { gainFame(S, 1); if (R() < 0.4) inboxBrand(S); return 'Front row, flashbulbs, and a handshake with a creative director.'; }
  }
  return 'Done.';
};
function inboxBrand(S) { const b = pick(D.BRANDS); const nm = pick(b.names); S.inbox.push({ id: uid(), kind: 'brand', from: nm, cat: b.cat, name: nm, pay: Math.round(b.base * (S.fame / 40) / 1000) * 1000, years: 2, t: `${b.cat} ambassador`, d: `${nm} wants you as the face of its next campaign.`, expires: S.week + 6 }); }

// ------------------------------------------------------------------ random events
function randomEvent(S) {
  const pool = D.RANDOM_EVENTS.filter(e => S.fame >= e.min && (!e.burn || S.energy < 30 || S.health < 50) && (!e.scandal || !has(S, 'private') || R() < 0.3));
  if (!pool.length) return; const e = pick(pool);
  if (e.scandal && !has(S, 'scandal') && R() < 0.5) return;
  const ctx = { costar: pick(D.ACTORS)[0], actor: pick(D.ACTORS)[0] };
  if (e.id === 'fancast') { const F = pick(D.FRANCHISES.filter(f => S.fr[f.id].chars.some(c => c.status === 'open'))); if (!F) return; ctx.fr = F.short; ctx.char = pick(S.fr[F.id].chars.filter(c => c.status === 'open')).name; ctx.fid = F.id; }
  S.pending.push({ type: 'event', id: e.id, ctx });
}
FC.fill = (t, ctx = {}) => t.replace(/\{(\w+)\}/g, (_, k) => ctx[k] || '');
FC.applyEffects = function (S, fx, ctx = {}, job) {
  const out = [];
  for (const [k, v] of Object.entries(fx)) {
    if (k === 'req') continue;
    if (k === 'perf' && job) { const dv = v + (has(S, 'method') && v > 0 ? 1 : 0); job.perfAdj = (job.perfAdj || 0) + dv; job.perf = clamp(job.perf + dv, 0, 100); out.push(`Performance ${v > 0 ? '+' : ''}${v}`); }
    else if (k === 'rel' && job) { job.director_rel = clamp(job.director_rel + v, 0, 100); out.push(`Director ${v > 0 ? 'likes this' : 'is annoyed'}`); }
    else if (k === 'costar' && job) { job.costarRel = clamp(job.costarRel + v, 0, 100); out.push(`Co-star ${v > 0 ? 'warms up' : 'cools off'}`); }
    else if (k === 'money') { S.money += v; out.push(FC.money(v)); }
    else if (k === 'fame') { gainFame(S, v * (has(S, 'scandal') ? 1.3 : 1) * (has(S, 'private') ? 0.7 : 1)); out.push(`Fame ${v > 0 ? '+' : ''}${v}`); }
    else if (k === 'rep') { const pv = v < 0 ? v * (1 - (S.team.publicist || 0) * 0.2) : v; S.rep = clamp(S.rep + pv, 0, 100); out.push(`Reputation ${pv > 0 ? '+' : ''}${Math.round(pv)}`); }
    else if (k === 'energy') { S.energy = clamp(S.energy + v, 0, 100); out.push(`Energy ${v > 0 ? '+' : ''}${v}`); }
    else if (k === 'health') { S.health = clamp(S.health + v, 0, 100); out.push(`Health ${v > 0 ? '+' : ''}${v}`); }
    else if (k === 'happy') { S.happy = clamp(S.happy + v, 0, 100); }
    else if (k === 'contacts') { S.contacts += v; out.push('New contact'); }
    else if (k === 'followers') { S.followers += Math.round(S.followers * 0.1 + 50000); out.push('Followers up'); }
    else if (k === 'fancast') { S.fancast = ctx.char; out.push(`You'll have an edge if ${ctx.char} comes up`); if (R() < 0.5) { const p = genFranchiseProject(S, ctx.fid, { kind: 'recast', char: ctx.char }); if (p) { S.board.push(p); out.push('A casting call just opened'); } } }
    else if (k === 'skip') { S.hiatus = 1; }
    else if (k === 'lawsuit') { const win = R() < 0.4 + (S.team.lawyer || 0) * 0.15; if (win) { S.rep += 3; out.push('You won in court'); } else { S.money -= 400000; S.rep -= 6; out.push('You lost in court: $400K'); } }
    else if (k === 'risk') { if (R() < 0.18) { S.health = clamp(S.health - 25, 0, 100); if (job) job.left += 2; out.push('You got hurt. Shooting delayed two weeks'); addNews(S, `${S.me.name} injured doing own stunts on ${job ? job.title : 'set'}.`, 'you'); } }
    else if (S.skills[k] != null) { S.skills[k] = clamp(S.skills[k] + v, 0, 100); out.push(`${k} +${v}`); }
  }
  return out.join(', ');
};
FC.resolve = function (S, pend, i) {
  if (pend.type === 'set') { const ev = D.SET_EVENTS[pend.ev]; const job = S.jobs.find(j => j.id === pend.jobId); const c = ev.c[i] || ev.c[0]; if (c[1].req && !reqOk(S, c[1].req)) return 'You tried, but it did not land.'; return FC.applyEffects(S, c[1], {}, job); }
  if (pend.type === 'rehearsal') { const ev = D.REHEARSAL_EVENTS[pend.ev]; const job = S.jobs.find(j => j.id === pend.jobId); const c = ev.c[i] || ev.c[0]; if (c[1].req && !reqOk(S, c[1].req)) return 'You tried. It did not quite land.'; return FC.applyEffects(S, c[1], {}, job) || 'Noted.'; }
  if (pend.type === 'stage') { const ev = D.STAGE_EVENTS[pend.ev]; const job = S.jobs.find(j => j.id === pend.jobId); const c = ev.c[i] || ev.c[0]; if (c[1].req && !reqOk(S, c[1].req)) { if (job) job.perf = clamp(job.perf - 1, 0, 100); return 'You tried. It did not quite land.'; } return FC.applyEffects(S, c[1], {}, job) || 'The show goes on.'; }
  if (pend.type === 'opening') { const job = S.jobs.find(j => j.id === pend.jobId); if (!job) return '';
    const pick_ = D.STAGE_OPENING[i] || D.STAGE_OPENING[0]; if (pick_[0] === 'ritual') job.perfAdj = (job.perfAdj || 0) + 2; if (pick_[0] === 'cast') { job.costarRel = clamp(job.costarRel + 10, 0, 100); job.perfAdj = (job.perfAdj || 0) + 1; } if (pick_[0] === 'alone') job.perfAdj = (job.perfAdj || 0) + (has(S, 'method') ? 4 : 1); job.perf = FC.calcPerf(job);
    const r = reviews(S, job); job.openingCritics = r.critics; job.critics = r.critics; job.q = r.q; job.buzz = (r.critics - 60) / 4 + (FC.promoMul(S, job) - 1) * 20; gainFame(S, 1); job.review = marquee(S, job);
    addNews(S, `${S.me.name} opens in ${job.title} on ${job.studio}. ${r.critics >= 75 ? 'Raves.' : r.critics >= 50 ? 'Respectful reviews.' : 'The critics are not kind.'}`, 'you');
    return { text: r.critics >= 75 ? 'Curtain call. The reviews come in overnight, and they are raves.' : r.critics >= 50 ? 'A solid opening. The reviews are respectful.' : 'A rough night. The first reviews are not kind.', quotes: r.quotes, critics: r.critics }; }
  if (pend.type === 'event') { const ev = D.RANDOM_EVENTS.find(e => e.id === pend.id); const c = ev.c[i] || ev.c[0]; if (c[1].req && !reqOk(S, c[1].req)) { S.rep -= 1; return 'It came out wrong.'; } if (ev.scandal) addNews(S, FC.fill(ev.t, pend.ctx).replace(/^You|your/g, m => m === 'You' ? S.me.name : 'their'), 'scandal'); return FC.applyEffects(S, c[1], pend.ctx); }
  return '';
};

// ------------------------------------------------------------------ team, agency, money
FC.signAgency = function (S, id) {
  const a = D.AGENCIES.find(x => x.id === id); if (!a) return { ok: false };
  if (FC.starPower(S) < a.need) return { ok: false, t: `${a.name} isn't interested yet. They want Star Power ${a.need}.` };
  S.agency = id; if (id === 'caa') ach(S, 'agent_caa'); timeline(S, `Signed with ${a.name}.`); return { ok: true, t: `You're now repped by ${a.name}.` };
};
FC.hire = function (S, role, lvl) {
  const t = D.TEAM.find(x => x.id === role); if (!t) return { ok: false };
  if (lvl > 0 && S.fame < (t.need[lvl] || 0)) return { ok: false, t: `Top ${t.name.toLowerCase()}s want clients with fame ${t.need[lvl]}+.` };
  S.team[role] = lvl; if (lvl) S.teamNames[role] = S.teamNames[role] || pick(D.TEAM_NAMES); else delete S.teamNames[role];
  return { ok: true, t: lvl ? `${S.teamNames[role]} is your new ${t.name.toLowerCase()}.` : `You let your ${t.name.toLowerCase()} go.` };
};
FC.buyHome = function (S, id) { const h = D.HOMES.find(x => x.id === id); if (!h) return { ok: false };
  if (!h.price) { S.home = id; return { ok: true, t: `You moved to the ${h.name.toLowerCase()}.` }; }
  if (S.homes.includes(id)) { S.home = id; return { ok: true, t: `You moved into your ${h.name.toLowerCase()}.` }; }
  if (S.money < h.price) return { ok: false, t: 'Not enough money.' }; S.money -= h.price; S.homes.push(id); S.home = id; if (h.price >= 1e7) ach(S, 'mansion'); timeline(S, `Bought a ${h.name.toLowerCase()}.`); return { ok: true, t: `You bought the ${h.name.toLowerCase()}.` }; };
FC.sellHome = function (S, id) { const h = D.HOMES.find(x => x.id === id); if (!S.homes.includes(id)) return; S.homes = S.homes.filter(x => x !== id); S.money += Math.round(h.price * rnd(0.85, 1.15)); if (S.home === id) S.home = 'h1'; };
FC.buyCar = function (S, id) { const c = D.CARS.find(x => x.id === id); if (S.money < c.price) return { ok: false, t: 'Not enough money.' }; S.money -= c.price; S.cars.push(id); return { ok: true, t: `You bought a ${c.name.toLowerCase()}.` }; };
FC.investIn = function (S, id, amt) { if (S.money < amt) return { ok: false, t: 'Not enough money.' }; S.money -= amt; S.invest[id] = (S.invest[id] || 0) + amt; return { ok: true, t: `Invested ${FC.money(amt)}.` }; };
FC.withdraw = function (S, id) { const v = S.invest[id] || 0; S.money += Math.round(v); delete S.invest[id]; return { ok: true, t: `Cashed out ${FC.money(v)}.` }; };
FC.donate = function (S, amt) { if (S.money < amt) return { ok: false, t: 'Not enough money.' }; S.money -= amt; S.charity += amt; S.rep = clamp(S.rep + Math.log10(amt) - 3, 0, 100); if (S.charity >= 1e6) ach(S, 'charity'); return { ok: true, t: `You donated ${FC.money(amt)}.` }; };

// ------------------------------------------------------------------ production company
FC.startCompany = function (S, name) {
  if (S.company) return { ok: false }; if (S.fame < 35) return { ok: false, t: 'You need fame 35 to raise money for a company.' }; if (S.money < 2e6) return { ok: false, t: 'You need $2M to start a production company.' };
  S.money -= 2e6; S.company = { name: (name || S.me.name.split(' ').pop() + ' Pictures').slice(0, 40), films: 0, since: S.week }; ach(S, 'company'); timeline(S, `Founded ${S.company.name}.`);
  addNews(S, `${S.me.name} launches production banner ${S.company.name}.`, 'you'); return { ok: true, t: `${S.company.name} is open for business.` };
};
FC.BUDGETS = [['micro', 'Micro-budget', 3e6], ['indie', 'Indie', 12e6], ['mid', 'Mid-budget', 45e6], ['studio', 'Studio tentpole', 140e6]];
FC.develop = function (S, o) {
  const sc = S.scripts.find(x => x.id === o.script); if (!sc || !S.company) return { ok: false, t: 'Pick a script.' };
  const b = FC.BUDGETS.find(x => x[0] === o.budget) || FC.BUDGETS[1];
  const studioShare = b[2] >= 45e6 ? 0.85 : 0.6; const cost = Math.round(b[2] * (1 - studioShare));
  if (S.money < cost) return { ok: false, t: `Your company needs ${FC.money(cost)} for its share of the budget.` };
  const pitch = sc.q * 0.5 + FC.starPower(S) * 0.5 + rnd(-15, 15) - (b[2] >= 140e6 ? 25 : b[2] >= 45e6 ? 10 : 0);
  if (pitch < 30) return { ok: false, t: 'No studio bit. Try a smaller budget or a better script.', burn: true };
  S.money -= cost; S.scripts = S.scripts.filter(x => x !== sc);
  const dirSelf = o.direct; const dir = dirSelf ? { name: S.me.name, p: clamp(Math.round((S.skills.drama + S.skills.charisma) / 40 + (S.company.films || 0) * 0.3), 1, 5) } : director(sc.genre, 3, 5);
  const p = { id: uid(), kind: 'own', title: sc.title, genre: sc.genre, studio: b[2] >= 45e6 ? pick(['Warner Bros.', 'Universal', 'Paramount', 'Sony Pictures', 'Netflix', 'Apple']) : pick(['A24', 'Neon', 'Searchlight', 'Focus Features']), size: o.star ? 'lead' : 'cameo', pay: o.star ? Math.round(b[2] * 0.05) : 0, weeks: { prep: 4, shoot: b[2] >= 45e6 ? 10 : 6, post: 20 },
    budget: b[2], director: dir, script: sc.q, prestige: b[2] < 45e6, wide: b[2] >= 45e6 || R() < 0.3, producer: true, directedByMe: dirSelf, costars: costars(2), won: true, perf0: clamp(Math.round(FC.skillFit(S, { genre: sc.genre }) + rnd(-4, 8)), 10, 99), need: 0, expires: S.week + 20, posted: S.week };
  if (!o.star) p.perf0 = 50;
  S.offers = S.offers || []; S.offers.push(p); const r = FC.sign(S, p.id, { salary: p.pay, points: 0, pictures: 1, billing: o.star ? 'above' : 'ensemble', perks: ['approval'] });
  S.company.films++; if (dirSelf) ach(S, 'direct');
  addNews(S, `${S.company.name} sets up ${sc.title} at ${p.studio}${dirSelf ? `, with ${S.me.name} directing` : ''}.`, 'you');
  return { ok: true, t: `${sc.title} is greenlit at ${p.studio}.`, job: r.job };
};

// ------------------------------------------------------------------ achievements and endings
function ach(S, id) { if (S.achievements[id]) return; S.achievements[id] = S.week; const a = D.ACHIEVEMENTS.find(x => x[0] === id); if (a) { S.log.push(`🏆 ${a[1]}`); S.newAch = (S.newAch || []).concat(a[1]); } }
FC.ach = ach;
FC.goalDone = S => ({ oscar: () => S.awards.some(a => a.show === 'oscars' && a.won), franchise: () => S.myChars.some(m => (m.films || []).length >= 3 && m.size === 'lead'), director: () => S.credits.some(c => c.directedByMe && c.critics >= 90), money: () => S.yearEarnHist.some(y => y.earn >= 5e7) })[S.me.goal]();
FC.retire = function (S, why = 'choice') {
  if (S.ended) return S.ended;
  const oscars = S.awards.filter(a => a.show === 'oscars' && a.won).length; const wins = S.awards.filter(a => a.won && a.weight).length;
  const icon = S.myChars.some(m => (m.films || []).length >= 4);
  let end;
  if (why === 'burnout') end = { id: 'burnout', t: 'Burned out', d: 'The work took everything. You walked away to save yourself, and the industry moved on faster than you expected.' };
  else if ((oscars && S.lifetimeBO >= 2e9) || (S.star && wins >= 5)) end = { id: 'legend', t: 'Hollywood legend', d: 'Retrospectives, lifetime achievement awards, and a filmography people will be studying for decades.' };
  else if (S.company && S.company.films >= 3) end = { id: 'mogul', t: 'Mogul', d: `${S.company.name} became a force. You shaped what other people got to make.` };
  else if (S.comeback) end = { id: 'comeback', t: 'The comeback', d: 'Written off after the flops, you came back with the work of your life. Everyone loves a second act.' };
  else if (icon) end = { id: 'icon', t: 'Franchise icon', d: 'Kids dress up as your character every Halloween. That is immortality of a kind.' };
  else if (S.credits.length >= 8) end = { id: 'working', t: 'Working actor', d: 'A long career, steady work, and the respect of everyone who has been on set with you.' };
  else end = { id: 'cult', t: 'Cult favorite', d: 'Not a household name, but the people who know your work really know it.' };
  end.goal = FC.goalDone(S); end.why = why; end.week = S.week;
  S.ended = end; timeline(S, `Retired. ${end.t}.`);
  try { if (root.localStorage) { const hof = JSON.parse(localStorage.getItem('fc-hof') || '[]'); hof.unshift({ name: S.me.name, end: end.t, years: Math.round(S.week / 52), bo: S.lifetimeBO, wins, oscars, credits: S.credits.length, look: S.look, d: Date.now() }); localStorage.setItem('fc-hof', JSON.stringify(hof.slice(0, 30))); } } catch (e) { }
  return end;
};

// ------------------------------------------------------------------ save / load
const KEY = s => 'fc-slot-' + s;
FC.save = S => { try { localStorage.setItem(KEY(S.slot), JSON.stringify(S)); return true; } catch (e) { return false; } };
FC.load = slot => { try { const s = localStorage.getItem(KEY(slot)); if (!s) return null; const S = JSON.parse(s); S.offers = S.offers || []; if (!S.stageBoard) { S.stageBoard = []; refreshStage(S); } S.roll = S.roll || []; S.lens = S.lens || []; return S; } catch (e) { return null; } };
FC.slots = () => [1, 2, 3].map(i => { const S = FC.load(i); return S ? { slot: i, name: S.me.name, date: FC.dateLabel(S), fame: Math.round(S.fame), look: S.look, ended: !!S.ended } : { slot: i, empty: true }; });
FC.del = slot => { try { localStorage.removeItem(KEY(slot)); } catch (e) { } };
FC.hof = () => { try { return JSON.parse(localStorage.getItem('fc-hof') || '[]'); } catch (e) { return []; } };

// auto-play helper used by tests: resolve everything with the first choice
FC.autoWork = (S, level = 'steady') => {
  for (const j of S.jobs) { if (j.stage === 'prep') { for (const a of FC.prepActs(S, j)) { if (S.energy < 45 || (j.prepScore || 0) >= 80) break; FC.doPrep(S, j.id, a.id); } } }
  for (const j of FC.needsEffort(S)) FC.setEffort(S, j.id, S.energy >= 40 ? level : 'coast');
  for (const { j, p } of FC.pressOpen(S)) { if (S.energy < 35) break; const r = FC.doPress(S, j.id, p.id, 'charm'); if (r.live) { if (FC.livePress(S, j.id, p.id).ok) { while (S.live && S.live.step < S.live.steps.length - 1) { const k = S.live.steps[S.live.step]; if (['cold', 'intro'].includes(k)) FC.liveNext(S); else FC.liveChoose(S, 0); } FC.liveFinish(S); } } }
};
FC.autoResolve = S => { while (S.pending.length) { const p = S.pending.shift(); if (p.type === 'set' || p.type === 'event') FC.resolve(S, p, Math.floor(Math.random() * 2)); if (p.type === 'love') FC.loveAnswer(S, true); if (p.type === 'stage' || p.type === 'opening') FC.resolve(S, p, 0); if (p.type === 'finale') FC.tvFinale(S, p.id, 'trust'); if (p.type === 'announce') FC.announceRespond(S, p.jobId, 1); if (p.type === 'rehearsal') FC.resolve(S, p, 0); if (p.type === 'fitting') { const j = S.jobs.find(x => x.id === p.jobId); if (j) FC.chooseCostume(S, j.id, 0); } if (p.type === 'midseason') FC.tvMoment(S, p.id, p.ev, 0); }
  for (const m of S.inbox.slice()) if (m.kind === 'talk' && FC.liveStart(S, m.id).ok) { while (S.live && S.live.step < S.live.steps.length - 1) { const k = S.live.steps[S.live.step]; if (['cold', 'intro'].includes(k)) FC.liveNext(S); else FC.liveChoose(S, 0); } FC.liveFinish(S); } };
})(typeof window !== 'undefined' ? window : globalThis);
