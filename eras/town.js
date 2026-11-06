/* The Eras Life: Town, the free-roam side of the game (in the spirit of Headliner and Nashville).
   Gig at any venue you can fill, busk, take side gigs from a weekly board, upgrade your studio and
   gear, hire specialists, buy a home, and level up with perks. Everything is optional, costs Time
   Blocks, Energy and money, and never changes the real event track. All places, brands and people
   here are invented. */
(function () {
const ER = window.ER, G = window.G;
const S = () => G.S(), clamp = G.clamp, rnd = G.rnd, pick = G.pick;

ER.VENUES = [
 { id:'openmic', n:'Open mic night', cap:60, min:0, price:0, energy:6, cost:1, xp:10 },
 { id:'bar', n:'The Corner Bar', cap:150, min:300, price:12, energy:8, cost:1, xp:15 },
 { id:'club', n:'The Velvet Room (club)', cap:900, min:15000, price:28, energy:12, cost:2, xp:30 },
 { id:'theater', n:'The Grand Theatre', cap:2600, min:250000, price:55, energy:15, cost:2, xp:50 },
 { id:'arena', n:'City Arena (one night)', cap:16000, min:2000000, price:95, energy:20, cost:2, xp:90 },
 { id:'stadium', n:'Stadium special (one night)', cap:60000, min:20000000, price:140, energy:28, cost:3, xp:150 }
];
ER.STUDIOS = [
 { id:'home', n:'Home setup', price:0, bonus:0 }, { id:'local', n:'Local studio', price:20000, bonus:2 },
 { id:'pro', n:'Pro studio', price:400000, bonus:4 }, { id:'legend', n:'Legendary studio', price:5000000, bonus:7 }
];
ER.GEAR = [
 { id:'guitar', n:'A vintage acoustic guitar', price:8000, write:2 }, { id:'piano', n:'A grand piano', price:90000, write:3 },
 { id:'mic', n:'A studio vocal mic', price:12000, rec:2 }, { id:'inears', n:'Custom in-ear monitors', price:6000, show:.3 },
 { id:'pedals', n:'A pedalboard', price:3000, write:1 }, { id:'rig', n:'A touring sound rig', price:750000, show:.5 }
];
ER.SPECIALISTS = [
 { id:'vocal', n:'Vocal coach', wage:3000, d:'Better recording takes.' }, { id:'choreo', n:'Choreographer', wage:4000, d:'Better shows.' },
 { id:'stylist', n:'Stylist', wage:3500, d:'Better covers and red carpets.' }, { id:'trainer', n:'Personal trainer', wage:2500, d:'More energy every week.' }
];
ER.HOMES = [
 { id:'apartment', n:'A small apartment', price:60000, energy:2 }, { id:'house', n:'A house with a garden', price:1200000, energy:4 },
 { id:'cabin', n:'A writing cabin in the woods', price:2500000, energy:3, write:2 }, { id:'mansion', n:'A mansion', price:12000000, energy:6, team:1 },
 { id:'beach', n:'A beach house', price:25000000, energy:7, write:1 }
];
ER.PERKS = [
 { id:'workhorse', n:'Workhorse', d:'One extra Time Block every week.' }, { id:'hitmaker', n:'Hitmaker', d:'Songs you write are a little better.' },
 { id:'showstopper', n:'Showstopper', d:'Every show night scores higher.' }, { id:'media', n:'Media darling', d:'Interviews and posts help your reputation more.' },
 { id:'dealmaker', n:'Dealmaker', d:'Gigs and side gigs pay 25% more.' }, { id:'roaddog', n:'Road dog', d:'Touring tires you less.' },
 { id:'wordsmith', n:'Wordsmith', d:'Practising songwriting teaches you more.' }, { id:'charmer', n:'Charmer', d:'Your team and journalists warm to you faster.' },
 { id:'ironwill', n:'Iron will', d:'You recover more energy every week.' }, { id:'fanfave', n:'Fan favourite', d:'Fan events and busking reach more people.' }
];
// The weekly board: five side gigs and activities, different every week.
ER.BOARD = [
 { id:'judge', n:'Guest-judge a TV talent show', cost:1, energy:-6, fx:{ fans:1.2, heat:3 }, pay:20000, minFans:500000 },
 { id:'gala', n:'Sing at a charity gala', cost:1, energy:-5, fx:{ rep:3 }, pay:0 },
 { id:'commercial', n:'Shoot a commercial for an invented brand', cost:2, energy:-8, fx:{ heat:2 }, pay:60000, minFans:100000 },
 { id:'radio', n:'Play a late-night radio session', cost:1, energy:-4, fx:{ fans:.6 }, pay:500 },
 { id:'camp', n:'Join a songwriting camp', cost:2, energy:-6, fx:{ write:3 }, pay:0 },
 { id:'feature', n:'Sing a feature for an invented artist', cost:1, energy:-4, fx:{ fans:.8, clout:1 }, pay:15000, minFans:50000 },
 { id:'cameo', n:'Film a cameo in an invented movie', cost:2, energy:-8, fx:{ fans:1, heat:4 }, pay:80000, minFans:1000000 },
 { id:'listening', n:'Host a listening party', cost:1, energy:-4, fx:{ fans:.8, hype:4 }, pay:0 },
 { id:'podcast', n:'Go on an invented podcast', cost:1, energy:-3, fx:{ heat:3, rep:1 }, pay:2000, minFans:20000 },
 { id:'fashion', n:'Sit front row at fashion week', cost:1, energy:-4, fx:{ heat:4, fans:.4 }, pay:0, minFans:300000 },
 { id:'masterclass', n:'Teach a songwriting masterclass', cost:1, energy:-3, fx:{ rep:2, write:1 }, pay:5000, minFans:100000 },
 { id:'benefit', n:'Play a hometown benefit show', cost:2, energy:-7, fx:{ rep:4, fans:.6 }, pay:0 },
 { id:'party', n:'Throw a party for your crew', cost:1, energy:-3, fx:{ team:5 }, pay:-5000 },
 { id:'museum', n:'Visit a music museum for inspiration', cost:1, energy:2, fx:{ write:1 }, pay:-50 },
 { id:'karaoke', n:'Crash a karaoke night', cost:1, energy:-2, fx:{ fans:.5, heat:1 }, pay:0 },
 { id:'roadtrip', n:'Take a road trip to clear your head', cost:2, energy:12, fx:{ write:1 }, pay:-800 }
];

/* ---------- Levels and perks ---------- */
G.lvl = () => S().level || 1;
G.xpNeed = l => Math.round(100 * Math.pow(l, 1.5));
G.addXp = function (n) {
  const s = S(); s.xp = (s.xp || 0) + n; s.level = s.level || 1;
  while (s.xp >= G.xpNeed(s.level)) { s.xp -= G.xpNeed(s.level); s.level++; s.perkPts = (s.perkPts || 0) + 1; G.inbox('manager', `Level ${s.level}`, 'You have a perk point to spend in Town.'); }
};
G.hasPerk = id => !!(S() && (S().perks || []).includes(id));
G.takePerk = function (id) { const s = S(); if (!s.perkPts || G.hasPerk(id)) return false; s.perks = (s.perks || []).concat([id]); s.perkPts--; return true; };
G.hooks.task.push(t => { G.addXp(Math.max(5, (t.cost || 1) * 8)); });
G.hooks.answer.push(() => G.addXp(6));

/* ---------- Gigs and busking ---------- */
G.canGig = v => { const s = S(); return s.stats.fans >= v.min && !G.world('lockdown') && !s.flags.retired && !(s.flags.hidden && v.min > 300); };
G.playGig = function (id) {
  const s = S(), v = ER.VENUES.find(x => x.id === id); if (!v || !G.canGig(v)) return { err:'You cannot book that venue right now.' };
  if (!G.canSpend(v.cost)) return { err:'No Time Blocks left this week.' };
  s.week.used += v.cost;
  const demand = Math.max(10, Math.pow(s.stats.fans, .8) * .9 * (G.momentum ? G.momentum() : 1));
  const tix = Math.round(Math.min(v.cap, demand * rnd(.6, 1.1))), fill = tix / v.cap;
  const pay = Math.round(tix * v.price * .55 * (G.hasPerk('dealmaker') ? 1.25 : 1));
  s.stats.money += pay; G.applyFx({ energy:-v.energy * (G.hasPerk('roaddog') ? .7 : 1), fans:.3 + fill * (v.cap > 10000 ? 1.2 : .6), clout:v.cap > 2000 ? 1 : 0 });
  const stars = clamp(Math.round(2 + fill * 2.2 + (G.hasPerk('showstopper') ? .6 : 0) + (s.gearShow || 0) + rnd(-.5, .6)), 1, 5);
  G.addXp(v.xp); s.gigs = (s.gigs || 0) + 1;
  G.journalAdd(`${v.n}: ${stars} stars`, `${tix.toLocaleString()} people, ${G.fmtM(pay)}.`);
  return { ok:true, v, tix, fill, pay, stars };
};
G.busk = function () {
  const s = S(); if (!G.canSpend(1)) return { err:'No Time Blocks left this week.' }; if (G.world('lockdown')) return { err:'Nobody is out on the streets right now.' };
  s.week.used += 1; const famous = s.stats.fans > 1e6;
  const tips = Math.round(rnd(15, 80) * (famous ? 30 : 1)); s.stats.money += tips; G.applyFx({ energy:-4, fans:famous ? 1.5 : .8 * (G.hasPerk('fanfave') ? 1.5 : 1), heat:famous ? 6 : 0 }); G.addXp(10);
  const msg = famous ? 'Word gets out that you are busking. A crowd forms, and the clips go everywhere.' : pick(['A few people stop and listen.', 'A kid dances the whole time.', 'Someone asks if you have a demo.']);
  G.journalAdd('Busking', msg); return { ok:true, tips, msg };
};

/* ---------- The weekly board ---------- */
G.board = function () {
  const s = S(), yw = ER.yw(s.abs), key = `${yw.y}-${yw.w}`;
  if (!s.boardWeek || s.boardWeek.key !== key) {
    const r = ER.seeded('board' + key + s.artist + (s.created || 0)), pool = ER.BOARD.filter(b => !b.minFans || s.stats.fans >= b.minFans), out = [];
    while (out.length < 5 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0].id);
    s.boardWeek = { key, ids:out, done:[] };
  }
  return s.boardWeek.ids.map(id => ER.BOARD.find(b => b.id === id));
};
G.doBoard = function (id) {
  const s = S(), b = ER.BOARD.find(x => x.id === id); G.board(); if (!b || s.boardWeek.done.includes(id)) return { err:'Already done this week.' };
  if (G.world('lockdown') && ['gala','benefit','fashion','karaoke','judge','cameo','commercial'].includes(id)) return { err:'That is not happening during the lockdown.' };
  if (!G.canSpend(b.cost)) return { err:'No Time Blocks left this week.' };
  s.week.used += b.cost; s.boardWeek.done.push(id);
  G.applyFx(Object.assign({ energy:b.energy }, b.fx)); s.stats.money += Math.round(b.pay * (b.pay > 0 && G.hasPerk('dealmaker') ? 1.25 : 1)); G.addXp(20 * b.cost);
  G.journalAdd(b.n, b.pay > 0 ? `It paid ${G.fmtM(b.pay)}.` : 'A good use of the week.'); return { ok:true, b };
};

/* ---------- Studio, gear, specialists, homes ---------- */
const buy = price => { const s = S(); if (s.stats.money < price) return false; s.stats.money -= price; return true; };
G.buyStudio = id => { const s = S(), st = ER.STUDIOS.find(x => x.id === id); if (!st || (s.studio && ER.STUDIOS.findIndex(x => x.id === s.studio) >= ER.STUDIOS.indexOf(st))) return false; if (!buy(st.price)) return false; s.studio = id; return true; };
G.buyGear = id => { const s = S(), g = ER.GEAR.find(x => x.id === id); s.gear = s.gear || []; if (!g || s.gear.includes(id) || !buy(g.price)) return false; s.gear.push(id); s.gearShow = (s.gearShow || 0) + (g.show || 0); return true; };
G.buyHome = id => { const s = S(), h = ER.HOMES.find(x => x.id === id); s.homes = s.homes || []; if (!h || s.homes.includes(id) || !buy(h.price)) return false; s.homes.push(id); return true; };
G.hire = id => { const s = S(); s.specialists = s.specialists || []; if (s.specialists.includes(id)) s.specialists = s.specialists.filter(x => x !== id); else s.specialists.push(id); return s.specialists.includes(id); };
G.writeBonus = () => { const s = S(); return (s.gear || []).reduce((a, id) => a + ((ER.GEAR.find(g => g.id === id) || {}).write || 0), 0) + (s.homes || []).reduce((a, id) => a + ((ER.HOMES.find(h => h.id === id) || {}).write || 0), 0) + (G.hasPerk('hitmaker') ? 3 : 0); };
G.recBonus = () => { const s = S(); return ((ER.STUDIOS.find(x => x.id === s.studio) || {}).bonus || 0) + (s.gear || []).reduce((a, id) => a + ((ER.GEAR.find(g => g.id === id) || {}).rec || 0), 0) + ((s.specialists || []).includes('vocal') ? 2 : 0); };
// Weekly upkeep and benefits.
G.hooks.week.push(() => {
  const s = S(); if (s.flags.retired && !(s.homes || []).length) return;
  const wages = (s.specialists || []).reduce((a, id) => a + ((ER.SPECIALISTS.find(x => x.id === id) || {}).wage || 0), 0); s.stats.money -= wages;
  const homeE = (s.homes || []).reduce((a, id) => Math.max(a, (ER.HOMES.find(h => h.id === id) || {}).energy || 0), 0);
  G.applyFx({ energy:homeE + ((s.specialists || []).includes('trainer') ? 2 : 0) + (G.hasPerk('ironwill') ? 3 : 0) });
  if ((s.specialists || []).includes('choreo')) s.gearShowChoreo = 1;
});
})();
