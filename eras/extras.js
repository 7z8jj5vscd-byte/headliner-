/* The Eras Life: add-on systems (engine side). What-if branches, the team, the fan community,
   journalists, the fan map, the living music world after 2026, your own label, legacy projects,
   the next generation, creative tools, the wardrobe, card sets and more achievements.
   Everything here is invented and labelled; the real event track is never changed. */
(function () {
const ER = window.ER, G = window.G, W = ER.ds;
const S = () => G.S(), pick = G.pick, rnd = G.rnd, clamp = G.clamp;
const fx = (o, m) => G.applyFx(o, m);

/* ---------- What-if branches ---------- */
G.hooks.answer.push((e, c) => {
  const s = S(); if (s.fr && s.fr.whatif === false) return; if (s.mode !== 'story' || !ER.WHATIFS[e.id] || c.c || s.whatif) return;
  if (!e.ch.some(x => x.c)) return;
  const w = ER.WHATIFS[e.id]; s.whatif = { id:e.id, step:0, next:s.abs + 2 };
  G.inbox('family', w.t, 'You chose differently from what really happened, so a short invented side story begins. The real timeline picks up again when it ends.');
});
G.hooks.week.push(a => {
  const s = S(), wi = s.whatif; if (!wi || a < wi.next) return;
  const w = ER.WHATIFS[wi.id]; if (!w) { s.whatif = null; return; }
  if (wi.step >= w.steps.length) { fx(w.end || {}); G.inbox('family', 'Back to the real timeline', `${w.t} That side story is over, and its effects stay with you.`); G.journalAdd('What if', w.t); s.whatif = null; return; }
  s.modal.push({ k:'whatif', id:wi.id, step:wi.step }); wi.step++; wi.next = a + 3;
});

/* ---------- The team ---------- */
G.teamInit = function () {
  const s = S(); if (s.crew) return; const r = ER.seeded('crew' + s.artist + (s.created || 0));
  s.crew = ER.TEAM_ROLES.map(x => ({ id:x.id, role:x.role, name:x.names[Math.floor(r() * x.names.length)], mood:65, fig:x.fig, since:s.abs }));
};
G.crewMood = (id, d) => { const s = S(); G.teamInit(); const m = s.crew.find(x => x.id === id); if (m) m.mood = clamp(m.mood + d, 0, 100); };
G.hooks.task.push(t => {
  G.teamInit();
  if (t.kind === 'duty') G.crewMood(/label/i.test(t.l) ? 'manager' : /shoot|magazine/i.test(t.l) ? 'publicist' : 'manager', 3);
  if (t.kind === 'record' || t.kind === 'write') G.crewMood('producer', 1);
  if (t.kind === 'shows' || t.kind === 'tp') G.crewMood('tour', 1);
  if (t.kind === 'private' || t.kind === 'rest') S().crew.forEach(m => m.mood = clamp(m.mood + .5, 0, 100));
});
G.hooks.week.push(a => {
  const s = S(); if (!s.crew || s.flags.retired) return;
  // Overwork drains the team a little; quiet weeks help.
  const busy = s.week && s.week.used > G.blocks(); s.crew.forEach(m => m.mood = clamp(m.mood + (busy ? -1.2 : .3), 0, 100));
  const m = s.crew.find(x => (x.mood >= 88 && !x.highDone) || x.mood <= 22);
  if (m && Math.random() < .25) { s.modal.push({ k:'crew', id:m.id, arc:m.mood >= 88 ? 'high' : 'low' }); if (m.mood >= 88) m.highDone = a; }
});
G.crewResolve = function (id, arc, ci) {
  const s = S(), m = s.crew.find(x => x.id === id), A = ER.TEAM_ARCS[arc], c = A.ch[ci]; fx(c.fx);
  if (arc === 'low') { if (c.keep) m.mood = c.half ? 40 : 65; else { const R = ER.TEAM_ROLES.find(x => x.id === id); m.name = pick(R.names.filter(n => n !== m.name)); m.mood = 55; m.since = s.abs; } }
  G.journalAdd(A.t.replace('{name}', m.name), c.r); return c;
};

/* ---------- The fan community ---------- */
G.fansInit = function () {
  const s = S(); if (s.fanfolk) return; const r = ER.seeded('fans' + s.artist + (s.created || 0)), names = ER.FAN_NAMES.slice();
  s.fanfolk = Array.from({ length:5 }, () => ({ n:names.splice(Math.floor(r() * names.length), 1)[0], age:12 + Math.floor(r() * 10), city:ER.FAN_CITIES[Math.floor(r() * ER.FAN_CITIES.length)], since:s.abs, notes:[] }));
};
G.hooks.week.push(a => {
  const s = S(); if (!s.released.length) return; G.fansInit();
  if (ER.yw(a).w === 1) s.fanfolk.forEach(f => f.age++);
  if (Math.random() < .06) { const f = pick(s.fanfolk), u = pick(ER.FAN_UPDATES).replace('{n}', f.n); f.notes.unshift({ abs:a, x:u }); if (f.notes.length > 8) f.notes.length = 8; G.feed(u, f.n.toLowerCase() + '_' + f.city.toLowerCase().replace(/[^a-z]/g, '')); }
  // Fan theories you can steer.
  if (s.stats.heat > 15 && Math.random() < .05) { s.theories = s.theories || []; if (s.theories.filter(t => !t.done).length < 3) s.theories.unshift({ id:G.uid(), abs:a, x:pick(ER.THEORIES), done:false }); }
});
G.theory = function (id, how) {
  const s = S(), t = (s.theories || []).find(x => x.id === id); if (!t || t.done) return; t.done = how;
  fx({ confirm:{ hype:6, heat:4 }, tease:{ hype:4, fans:1 }, debunk:{ heat:-3, rep:1 } }[how] || {});
  G.journalAdd('A fan theory', `${t.x} You chose to ${how} it.`);
};

/* ---------- The fan map ---------- */
G.regionsInit = () => { const s = S(); if (!s.regions) s.regions = { 'North America':55, 'Europe':25, 'Asia and Oceania':12, 'Latin America':8 }; };
G.hooks.task.push(t => {
  if (t.kind !== 'shows') return; G.regionsInit(); const s = S(), tr = (s.pj[t.p] || {}).tour; if (!tr || !tr.regions) return;
  tr.regions.forEach(r => { if (s.regions[r] != null) s.regions[r] += .4; });
  const tot = Object.values(s.regions).reduce((a, b) => a + b, 0); Object.keys(s.regions).forEach(k => s.regions[k] = s.regions[k] / tot * 100);
});

/* ---------- Journalists ---------- */
G.pressInit = () => { const s = S(); if (!s.press) s.press = ER.JOURNALISTS.map(j => ({ n:j.n, outlet:j.outlet, warmth:50 })); };
G.pressTalk = function (n, how) {
  G.pressInit(); const j = S().press.find(x => x.n === n); if (!j) return null;
  const d = { open:8, guarded:-3, charm:4 }[how] || 0; j.warmth = clamp(j.warmth + d, 0, 100);
  fx({ open:{ rep:2, heat:3 }, guarded:{ heat:-2 }, charm:{ fans:1, heat:2 } }[how] || {});
  const tone = j.warmth > 70 ? 'glowing' : j.warmth < 30 ? 'cutting' : 'fair'; G.journalAdd(`An interview with ${j.n}`, `${j.n} writes a ${tone} piece in ${j.outlet}.`);
  return tone;
};

/* ---------- The living invented music world after 2026 ---------- */
G.hooks.week.push(a => {
  const s = S(); if (!s.flags.free || s.flags.retired) return;
  const yw = ER.yw(a);
  if (yw.w === 2 && s.trendYear !== yw.y) { s.trendYear = yw.y; s.trend = pick(ER.ERA_THEMES).id; const th = ER.ERA_THEMES.find(x => x.id === s.trend); G.inbox('label', `The sound of ${yw.y}`, `${th.n} is the trend this year. Eras in that sound sell more.`); }
  if (yw.w === 10 && s.rc && s.newArtistYear !== yw.y) { s.newArtistYear = yw.y; const nm = `${pick(ER.NEW_ARTIST_FIRST)} ${pick(ER.NEW_ARTIST_LAST)}`;
    if (!s.rc.some(r => r.n === nm)) { s.rc.push({ n:nm, sound:pick(ER.PROTEGE_SOUNDS), base:.25 + Math.random() * .3, next:a + 4, albums:[], fresh:true }); G.feed(`new artist alert: ${nm.toLowerCase()} is about to be huge`); } }
  if (s.rc && s.rc.length > 1 && Math.random() < .03) { const [x, y] = s.rc.slice().sort(() => Math.random() - .5); G.feed(pick([`${x.n} and ${y.n} are feuding online again`, `${x.n} and ${y.n} just announced a duet`, `${x.n} called ${y.n} a genius in an interview`])); }
});

/* ---------- Your own label and protégés ---------- */
G.startLabel = function (name) { const s = S(); if (s.labelCo || s.stats.money < 5e6) return null; s.stats.money -= 5e6; s.labelCo = { name:name || `${G.art().name.split(' ')[0]} Records`, artists:[], since:s.abs }; G.inbox('manager', `${s.labelCo.name} is open`, 'Sign young artists, write for them and produce their records.'); return s.labelCo; };
G.signProtege = function () {
  const s = S(); if (!s.labelCo || s.labelCo.artists.length >= 4) return null;
  const pr = { n:`${pick(ER.NEW_ARTIST_FIRST)} ${pick(ER.NEW_ARTIST_LAST)}`, sound:pick(ER.PROTEGE_SOUNDS), talent:40 + Math.floor(Math.random() * 40), fans:5000, albums:[], dev:0 };
  s.labelCo.artists.push(pr); s.stats.money -= 250000; G.inbox('label', `Signed: ${pr.n}`, `${pr.sound}. Talent ${pr.talent}. They are invented, like everyone on your label.`); return pr;
};
G.developProtege = function (i) { const pr = S().labelCo.artists[i]; if (!pr) return; pr.dev += 1; pr.talent = clamp(pr.talent + 2, 0, 100); };
G.releaseProtege = function (i) {
  const s = S(), pr = s.labelCo.artists[i]; if (!pr || pr.dev < 3) return null;
  const last = pr.albums[pr.albums.length - 1]; if (last && s.abs - last.abs < 40) return null;
  const fw = Math.round((5000 + pr.fans * .3 + s.stats.fans * .002) * (pr.talent / 60) * rnd(.6, 1.4));
  const t = G.freshTitle(new Set(pr.albums.map(x => x.t)), () => pick(ER.RIVAL_ALBUM_WORDS));
  pr.albums.push({ t, abs:s.abs, fw }); pr.fans += fw * 4; pr.dev = 0; s.stats.money += fw * 4;
  s.charts.albums.unshift({ t, by:pr.n, rival:true, invented:true, abs:s.abs, fw, wk:0 });
  G.journalAdd(`${pr.n} releases ${t}`, `A ${G.fmtN(fw)} first week for your label.`); return { t, fw };
};

/* ---------- Legacy projects ---------- */
G.canLegacy = () => { const s = S(); return G.age() >= 40 || s.flags.free; };
G.doLegacy = function (id) {
  const s = S(), p = ER.LEGACY_PROJECTS.find(x => x.id === id); s.legacy = s.legacy || {}; if (!p || s.legacy[id] || s.stats.money < p.cost) return null;
  s.stats.money -= p.cost; if (p.earn) s.stats.money += p.earn; fx(p.fx); s.legacy[id] = s.abs; G.journalAdd(p.n, p.d); return p;
};

/* ---------- The next generation ---------- */
// After retiring, carry on as an invented protégé starting their own career.
G.nextGeneration = function (name, slot) {
  const s = S(), first = name || `${pick(ER.NEW_ARTIST_FIRST)} ${pick(ER.NEW_ARTIST_LAST)}`, id = 'gen_' + G.uid();
  const def = { id, name:first, fanName:'Fans', born:s.abs - 18 * 52, startAbs:s.abs, projects:[], events:[], people:[{ n:G.art().name, g:'Mentors', from:ER.yw(s.abs).y, role:'Your mentor (retired)' }],
    cowriters:{ Solo:{ bonus:0, note:'Your own ideas.' } }, genreLabels:['Pop','Indie','Experimental'], prologue:[], invented:true, color:'#f6d38a',
    tabUnlock:{ week:0, life:0, songbook:0, studio:0, rollout:0, cover:0, tour:0, inbox:0, eggs:0, fandom:0, press:0, charts:0, legacy:0 } };
  ER.artists[id] = def;
  const mentor = G.art().name, look = s.look;
  G.newGame({ artist:id, mode:'story', diff:s.diff, slot:slot || s.slot, look });
  const n = S(); n.genArtist = def; n.flags.free = true; n.stats.fans = 20000; n.stats.money = 500000; n.stats.clout = 30; n.stats.write = 35;
  G.inbox('family', `${first} begins`, `${mentor} is your mentor now. This career is fully invented, from the first song.`); G.proposeEra(); return n;
};
G.hooks.load.push(s => { if (s.genArtist && !ER.artists[s.artist]) ER.artists[s.artist] = s.genArtist; });

/* ---------- Creative tools ---------- */
G.directVideo = function (pid, c) {
  const s = S(), pj = G.pj(pid), th = (G.proj(pid) || {}).theme;
  let score = 50 + rnd(-10, 15) + (c.moment && c.moment !== 'none' ? 8 : 0) + (c.concept === 'story' || c.concept === 'cinematic' ? 6 : 0);
  const views = Math.round(s.stats.fans * score / 100 * rnd(.3, .9));
  pj.videos = pj.videos || []; pj.videos.push(Object.assign({ abs:s.abs, score:Math.round(score), views }, c)); fx({ hype:Math.round(score / 12), fans:score > 65 ? 1 : 0 });
  G.journalAdd('A music video', `${views.toLocaleString()} views in the first week.`); return { score:Math.round(score), views };
};
G.packaging = function (pid, thanks, secret) { const pj = G.pj(pid); pj.packaging = { thanks, secret }; fx(secret ? { hype:4 } : thanks === 'fans' ? { fans:1 } : { team:2 }); if (secret) S().eggs.decoded += 0; };
// Stage design: a stage shape, a light colour and a number of acts. A good flow lifts every show a little.
G.hooks.task.push(t => {
  if (t.kind !== 'shows') return; const tr = (S().pj[t.p] || {}).tour; if (!tr || !tr.design) return;
  const d = tr.design, eras = new Set((tr.setlist || []).map(x => (S().songs[x] || {}).p)).size;
  const bonus = (d.acts >= 4 && d.acts <= 8 ? .3 : 0) + (eras >= 4 ? .3 : 0) + (d.stage === 'bstage' ? .1 : 0); if (bonus) fx({ fans:bonus, rep:bonus });
});

/* ---------- Wardrobe, card sets and more achievements ---------- */
G.cardSets = function () {
  const s = S(), A = G.art();
  const real = A.projects.filter(p => p.type === 'album' || p.type === 'rerecord');
  const five = new Set(); Object.values(s.pj).forEach(x => (x.diary || []).forEach(d => { if (d.stars === 5) five.add(d.city); }));
  return [
    { n:'Every real era', have:real.filter(p => s.released.some(r => r.pid === p.id)).length, of:real.length },
    { n:'Ten awards', have:Math.min(10, s.awards.length), of:10 },
    { n:'Five No. 1 singles', have:Math.min(5, s.charts.singles.filter(c => c.peak === 1).length + (s.no1count || 0) * 0), of:5 },
    { n:'Five-star cities', have:Math.min(10, five.size), of:10 },
    { n:'Scrapbook moments', have:Math.min(50, (s.journal || []).length), of:50 }
  ];
};
G.hooks.week.push(a => {
  const s = S(), yrs = (a - (s.startedAt || (s.startedAt = a))) / 52;
  if (yrs >= 10) G.ach('decade');
  if (s.week && s.week.used === G.blocks() && !G.requiredLeft().length && G.tasks().some(t => t.req)) G.ach('perfectweek');
  if (s.crew && s.crew.every(m => m.mood >= 80)) G.ach('dreamteam');
  if (s.labelCo && s.labelCo.artists.some(p => p.albums.length)) G.ach('labelboss');
  if (s.legacy && Object.keys(s.legacy).length >= 3) G.ach('legacy3');
});
Object.assign(G.ACH, { decade:'Ten years in one save', perfectweek:'A perfect week', dreamteam:'A dream team', labelboss:'Run your own label', legacy3:'Three legacy projects', whatif:'Lived a what-if' });
G.hooks.week.push(() => { const s = S(); if (s.whatif && s.whatif.step >= 1) G.ach('whatif'); });

/* ---------- Seeded runs ---------- */
// A seed makes the random parts of a run repeatable from the start of a session.
G.useSeed = function (seed) { if (!seed) return; const r = ER.seeded('run-' + seed); Math.random = r; };
G.hooks.load.push(s => { if (s.seed) G.useSeed(s.seed + ':' + s.abs); });

/* ---------- Custom eras: your own titles and colours ---------- */
const newEra0 = G.newEra;
G.newEra = function (title, n, weeks, tour, themeId, custom) {
  const p = newEra0(title, n, weeks, tour, themeId);
  if (custom) {
    if (custom.titles && custom.titles.length) { const s = S(), used = new Set(Object.keys(s.songs)); const own = custom.titles.map(t => String(t).trim().slice(0, 40)).filter(t => t && !used.has(t)).slice(0, p.tracks.length); p.tracks.splice(0, own.length, ...own); }
    if (custom.pal != null) { const th = ER.ERA_THEMES.find(t => t.id === p.theme); const pal = th.pals[custom.pal] || th.pals[0]; p.color = pal[0]; p.accent = pal[1]; p.look = ER.makeEraLook(th, pal, p.id + p.title, S().artist); }
  }
  if (S().trend && p.theme === S().trend) p.trend = true;
  return p;
};
})();
