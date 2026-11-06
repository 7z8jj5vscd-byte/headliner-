/* The Eras Life: albums, touring and life (engine side).
   Albums: cut songs (guided or sandbox), deluxe tracks, any collaborator, song versions, side projects.
   Touring: a route built city by city, extra or cancelled legs, a setlist you can change mid-tour,
   and shows you book yourself (one-off nights, festivals, residencies).
   Life: free time that feeds your writing, your public image, invented brands, and buying back masters.
   All invented people, brands and places are labelled as invented. Real events are unchanged. */
(function () {
const ER = window.ER, G = window.G;
const S = () => G.S(), pick = G.pick, rnd = G.rnd, clamp = G.clamp;

/* ---------- Cutting songs ---------- */
G.canCut = p => G.frMode() !== 'canon' || S().mode === 'era' || p.custom;
G.cutSong = function (pid, t, on) { const p = G.proj(pid), pj = G.pj(pid);
  if (!G.canCut(p)) return { err:'Switch the story style to Guided or Sandbox to cut real songs.' };
  if (pj.released) return { err:'The album is already out.' };
  pj.cut = pj.cut || []; if (on) { if (G.liveTracks(p).length <= 5) return { err:'An album needs at least five songs.' }; if (!pj.cut.includes(t)) pj.cut.push(t); } else pj.cut = pj.cut.filter(x => x !== t);
  return { ok:true }; };
G.tracklistBase = pid => G.liveTracks(G.proj(pid));

/* ---------- Deluxe tracks ---------- */
G.setDeluxe = (t, on) => { const so = S().songs[t]; if (so && so.own) so.deluxe = !!on; };
G.hooks.week.push(() => { const s = S();
  Object.keys(s.pj).forEach(id => { const pj = s.pj[id]; if (!pj.released || pj.deluxeDone) return; pj.deluxeDone = true;
    const n = Object.keys(s.songs).filter(t => s.songs[t].own && s.songs[t].p === id && s.songs[t].deluxe).length;
    if (n) { G.applyFx({ fans:Math.min(3, n) * .4 }); G.inbox('label', 'The deluxe edition', `${n} extra song${n > 1 ? 's' : ''} on the deluxe edition gave fans a reason to buy it twice.`); } }); });

/* ---------- Any collaborator ---------- */
ER.INVENTED_WRITERS = ER.INVENTED_WRITERS || [
  { n:'Ivy Calloway (invented)', bonus:3, note:'A sharp lyric writer. Invented for this game.' },
  { n:'Marlon Reyes (invented)', bonus:2, note:'Great with hooks. Invented for this game.' },
  { n:'June Okafor (invented)', bonus:4, note:'A folk writer with a gift for detail. Invented for this game.' },
  { n:'Theo Lindqvist (invented)', bonus:3, note:'A pop craftsman. Invented for this game.' } ];
ER.INVENTED_PRODUCERS = ER.INVENTED_PRODUCERS || ['Sasha Bell (invented)', 'Remy Doucet (invented)', 'Kai Mercer (invented)'];
G.cowriterOptions = p => { const s = S(), set = new Set((p && p.cowriters) || ['Solo']); set.add('Solo');
  if (G.frMode() !== 'canon' || s.mode === 'era' || s.flags.free) { Object.values(s.songs).forEach(x => { if (x.co) set.add(x.co); }); ER.INVENTED_WRITERS.forEach(w => set.add(w.n)); }
  return [...set]; };
G.producerOptions = p => { const s = S(), set = new Set((p && p.producers) || ['Producer']);
  if (G.frMode() !== 'canon' || s.mode === 'era' || s.flags.free) { Object.values(s.songs).forEach(x => { if (x.prod) set.add(x.prod); }); ER.INVENTED_PRODUCERS.forEach(n => set.add(n)); }
  return [...set]; };
const ws0 = G.writeSong;
G.writeSong = function (t, co, insp, appr) { const r = ws0.apply(this, arguments); if (!r) return r;
  const iw = ER.INVENTED_WRITERS.find(w => w.n === co); if (iw) r.q = clamp(r.q + iw.bonus, 10, 100);
  if (insp && insp.startsWith('ft_')) { const s = S(), i = (s.inspo || []).indexOf(insp); if (i >= 0) { s.inspo.splice(i, 1); r.q = clamp(r.q + 3, 10, 100); r.note = (r.note ? r.note + ' ' : '') + 'Your time away shows in the song.'; } }
  return r; };

/* ---------- Song versions ---------- */
G.VERSIONS = [{ id:'acoustic', n:'Acoustic Version', fx:{ fans:.4, rep:1 } }, { id:'remix', n:'Remix', fx:{ fans:.6, heat:1 } }, { id:'live', n:'Live', fx:{ fans:.4 } }, { id:'extended', n:'Extended Version', fx:{ hype:2 } }, { id:'piano', n:'Piano Version', fx:{ rep:1 } }];
G.versionTitle = (t, k) => `${t} (${G.VERSIONS.find(v => v.id === k).n})`;
G.canVersion = (t, k) => { const s = S(), so = s.songs[t]; return so && so.st === 'released' && !so.version && !s.songs[G.versionTitle(t, k)]; };
G.makeVersion = function (t, k) { const s = S(), so = s.songs[t], v = G.VERSIONS.find(x => x.id === k);
  if (!v || !G.canVersion(t, k)) return { err:'That version already exists.' }; if (!G.canSpend(1)) return { err:'No Time Blocks left.' };
  const nt = G.versionTitle(t, k); s.songs[nt] = { p:so.p, st:'released', q:clamp(so.q + rnd(-4, 3), 10, 100), co:so.co, abs:s.abs, version:k, of:t };
  s.week.used++; G.applyFx(v.fx); G.journalAdd(`Released "${nt}"`, 'A new way to hear an old favourite.');
  return { ok:true, msg:`"${nt}" is out.` }; };

/* ---------- Side projects ---------- */
G.SIDE = [
  { id:'ep', n:'A surprise EP', songs:5, weeks:10, d:'Five new songs, made fast.' },
  { id:'holiday', n:'A holiday album', songs:6, weeks:12, d:'Out in time for the holidays.', season:true },
  { id:'soundtrack', n:'A soundtrack single', songs:2, weeks:8, d:'Two songs for an invented film.' },
  { id:'covers', n:'A covers EP', songs:4, weeks:8, d:'Songs you love, in your own style. Invented titles.' } ];
G.canSide = () => { const s = S(); return !s.flags.retired && !(s.custom || []).some(p => p.side && !(s.pj[p.id] && s.pj[p.id].released)); };
G.startSide = function (kind, title) {
  const s = S(), k = G.SIDE.find(x => x.id === kind); if (!k || !G.canSide()) return { err:'Finish your current side project first.' };
  const p = G.newEra(title || null, k.songs, 16, 0, kind === 'holiday' ? 'acoustic' : null);
  const a = s.abs, rel = a + k.weeks; Object.assign(p, { type:'edition', side:kind, ws:a, rs:a + Math.round(k.weeks * .4), fs:rel - 3, ps:rel - 2, rel, units:null, goals:[] });
  p.title = p.short = title || p.title; p.title = p.title + (kind === 'ep' ? ' (EP)' : kind === 'holiday' ? ' (Holiday)' : kind === 'covers' ? ' (Covers EP)' : ' (Soundtrack)');
  G.inbox('label', `Side project: ${p.title}`, `${k.d} Out ${G.fmtDate(rel)}. It runs alongside your main eras.`);
  return { ok:true, p }; };
// A side project never becomes the main era, so your look and colours stay with the main album.
const ce0 = G.currentEra;
G.currentEra = function () { const e = ce0.apply(this, arguments); return e && e.side ? null : e; };

/* ---------- Touring: route, legs, setlist ---------- */
G.REGION_OF = c => Object.keys(ER.CITIES).find(r => ER.CITIES[r].includes(c));
G.routeNights = route => (route || []).reduce((a, x) => a + x.n, 0);
G.setRoute = function (plan, route) { plan.route = route.filter(x => x.n > 0); plan.nights = Math.max(4, G.routeNights(plan.route));
  plan.regions = [...new Set(plan.route.map(x => G.REGION_OF(x.c)).filter(Boolean))]; if (!plan.regions.length) plan.regions = ['North America']; return plan; };
const ss0 = G.showSetup;
G.showSetup = function (p) { const sh = ss0.apply(this, arguments), tr = G.pj(p.id).tour;
  if (tr && tr.route && tr.route.length) { const seq = []; tr.route.forEach(x => { for (let i = 0; i < x.n; i++) seq.push(x.c); }); sh.city = seq[Math.min(seq.length - 1, tr.played ? tr.played - 1 : 0)] || sh.city; }
  return sh; };
const win0 = G.win;
G.win = function (p) { const w = win0(p), pj = S() && S().pj[p.id]; if (w.te != null && pj && pj.teExtra) w.te += pj.teExtra; return w; };
G.addLeg = function (pid, region, weeks) { const p = G.proj(pid), pj = G.pj(pid), tr = pj.tour; if (!tr || !tr.approved) return { err:'Plan the tour first.' };
  const w = G.win(p); if (S().abs > w.te) return { err:'The tour is over.' };
  const nights = Math.round(weeks * 2.5), cap = G.CAP[tr.tier] || 14000;
  pj.teExtra = (pj.teExtra || 0) + weeks; tr.nights += nights; tr.regions = [...new Set((tr.regions || []).concat(region))]; tr.presold = (tr.presold || 0) + Math.round(nights * cap * .7);
  if (tr.route) tr.route.push(...ER.CITIES[region].slice(0, 3).map((c, i) => ({ c, n:Math.max(1, Math.round(nights / 3) - (i === 2 ? 0 : 0)) })));
  G.applyFx({ energy:-4 }); G.inbox('promoter', `${p.tour.name}: a new leg`, `${weeks} more weeks in ${region}, about ${nights} nights. Tickets are on sale.`);
  return { ok:true, msg:`A ${region} leg is added: ${nights} nights over ${weeks} weeks.` }; };
G.cutLeg = function (pid, weeks) { const p = G.proj(pid), pj = G.pj(pid), tr = pj.tour; if (!tr || !tr.approved) return { err:'No tour to shorten.' };
  const w = G.win(p), left = w.te - Math.max(S().abs, w.ts); if (left <= weeks + 1) return { err:'Not enough of the tour is left to cut a leg.' };
  const nights = Math.min(Math.round(weeks * 2.5), tr.nights - tr.played - 2); pj.teExtra = (pj.teExtra || 0) - weeks; tr.nights -= nights; tr.presold = Math.max(0, (tr.presold || 0) - nights * (G.CAP[tr.tier] || 14000) * .7);
  G.applyFx({ rep:-2, energy:6, team:2 }); G.inbox('promoter', `${p.tour.name}: a leg cancelled`, `${nights} nights are cancelled and refunded. Fans are disappointed, but you get some rest.`);
  return { ok:true, msg:`${nights} nights cut. You get ${weeks} weeks back.` }; };
G.setSetlist = function (pid, t) { const tr = G.pj(pid).tour; if (!tr) return; tr.setlist = tr.setlist || []; const i = tr.setlist.indexOf(t); if (i >= 0) tr.setlist.splice(i, 1); else tr.setlist.push(t); tr.setChanged = S().abs; };

/* ---------- Shows you book yourself ---------- */
G.BOOK = [
  { id:'oneoff', n:'A one-off show', d:'One big night in a city you choose.', lead:4, nights:1, minFans:2e4 },
  { id:'festival', n:'Headline a festival', d:'An invented festival wants you to close the night.', lead:6, nights:1, minFans:2e5 },
  { id:'residency', n:'A residency', d:'Two nights a week for eight weeks in one city.', lead:6, nights:16, weeks:8, minFans:1e6 } ];
G.bookTier = () => { const f = S().stats.fans; return f > 1.5e7 ? 'stadium' : f > 1.2e6 ? 'arena' : 'theater'; };
G.canBook = k => { const s = S(); return !s.flags.retired && !G.world('lockdown') && s.stats.fans >= k.minFans && !(s.bookings || []).some(b => b.kind === k.id && b.until >= s.abs); };
G.book = function (kind, city) {
  const s = S(), k = G.BOOK.find(x => x.id === kind); if (!k || !G.canBook(k)) return { err:'You cannot book that right now.' };
  const at = s.abs + k.lead, until = at + (k.weeks || 1) - 1;
  if (G.active().some(x => x.st === 'tour' || (x.p.tour && G.win(x.p).ts != null && at <= G.win(x.p).te && until >= G.win(x.p).ts))) return { err:'That clashes with your tour.' };
  s.bookings = (s.bookings || []).concat({ id:G.uid(), kind, at, until, city:city || pick(ER.CITIES['North America']), tier:kind === 'residency' ? 'theater' : G.bookTier(), played:0 });
  G.inbox('promoter', `Booked: ${k.n}`, `${city || 'The city'} from ${G.fmtDate(at)}. Tickets are on sale.`);
  return { ok:true, msg:`${k.n} booked for ${G.fmtDate(at)}.` }; };
const tasks0 = G.tasks;
G.tasks = function () { const out = tasks0.apply(this, arguments), s = S();
  (s.bookings || []).forEach(b => { if (s.abs >= b.at && s.abs <= b.until) { const k = G.BOOK.find(x => x.id === b.kind);
    out.push({ id:'book:' + b.id, l:`${k.n} in ${b.city}`, cost:2, req:true, kind:'booking', bid:b.id, desc:'A show you booked yourself.' }); } });
  if (!s.flags.retired) G.FREETIME.forEach(f => { if (!f.minAge || G.age() >= f.minAge) out.push({ id:'ft:' + f.id, l:f.n, cost:f.cost, req:false, kind:'freetime', ft:f.id, desc:f.d }); });
  return out; };
const doTask0 = G.doTask;
G.doTask = function (id, arg) {
  const s = S();
  if (id.startsWith('book:')) { if (s.week.done[id]) return { err:'Already done.' }; if (!G.canSpend(2)) return { err:'No Time Blocks left.' };
    const b = (s.bookings || []).find(x => 'book:' + x.id === id); if (!b) return { err:'That booking is gone.' };
    const k = G.BOOK.find(x => x.id === b.kind), n = b.kind === 'residency' ? 2 : 1, cap = b.kind === 'festival' ? 50000 : G.CAP[b.tier];
    const sell = clamp(.55 + Math.log10(Math.max(10, s.stats.fans)) / 20 + rnd(-.05, .05), .4, 1), tix = Math.round(n * cap * sell);
    const gross = b.kind === 'festival' ? G.payScale() * 2 : tix * G.priceOf(2, s.abs); s.stats.money += gross * (b.kind === 'festival' ? 1 : .35);
    b.played += n; s.week.used += 2; s.week.done[id] = true; G.applyFx({ fans:b.kind === 'festival' ? 1.5 : .6, energy:-6, clout:.5 });
    G.journalAdd(`${k.n}: ${b.city}`, `${G.fmtN(tix)} people.`);
    return { ok:true, msg:`${b.city}: ${G.fmtN(tix)} people, ${G.fmtM(gross)}${b.kind === 'festival' ? ' fee' : ' gross'}.` }; }
  if (id.startsWith('ft:')) { if (s.week.done[id]) return { err:'Already done.' }; const f = G.FREETIME.find(x => 'ft:' + x.id === id); if (!f) return { err:'Not available.' };
    if (!G.canSpend(f.cost)) return { err:'No Time Blocks left.' }; if (f.money && s.stats.money < f.money * G.payScale() * .1) return { err:'You cannot afford it right now.' };
    s.week.used += f.cost; s.week.done[id] = true; G.applyFx(f.fx); if (f.money) s.stats.money -= Math.round(f.money * G.payScale() * .1);
    s.inspo = (s.inspo || []).filter(x => x !== 'ft_' + f.insp).concat('ft_' + f.insp).slice(-4);
    G.journalAdd(f.n, f.r); return { ok:true, msg:`${f.r} It gave you an idea for a song.` }; }
  return doTask0.apply(this, arguments);
};
G.hooks.week.push(a => { const s = S(); if (s.bookings) s.bookings = s.bookings.filter(b => b.until >= a - 1); });

/* ---------- Free time ---------- */
G.FREETIME = [
  { id:'coast', n:'A trip to the coast', d:'Sea air and long walks.', cost:2, fx:{ energy:18, team:2 }, money:1, insp:'coast', r:'You come back sunburnt and full of ideas.' },
  { id:'city', n:'A weekend in a new city', d:'Museums, cafés, nobody recognises you. Mostly.', cost:2, fx:{ energy:12 }, money:1.5, insp:'city', r:'A city that felt like a film set.', minAge:18 },
  { id:'cabin', n:'A cabin in the woods', d:'No phone signal.', cost:2, fx:{ energy:20, write:1 }, money:.5, insp:'cabin', r:'Quiet, rain on the roof, a notebook.' },
  { id:'bake', n:'Bake for your friends', d:'A kitchen full of people.', cost:1, fx:{ energy:6, team:3 }, insp:'friends', r:'Everyone leaves with a box of cookies.' },
  { id:'paint', n:'Paint or draw', d:'Something with your hands that is not a guitar.', cost:1, fx:{ energy:8 }, insp:'colour', r:'A messy canvas you secretly love.' },
  { id:'movie', n:'A film night', d:'Old favourites.', cost:1, fx:{ energy:7 }, insp:'film', r:'A line from a film sticks in your head.' },
  { id:'read', n:'Read a stack of books', d:'Poems, novels, old letters.', cost:1, fx:{ energy:5, write:1 }, insp:'books', r:'A phrase from an old novel gives you a title idea.' } ];
const FT_INSP = { coast:'The sea and summer', city:'A city at night', cabin:'Woods, rain and quiet', friends:'Friends around a kitchen table', colour:'Colours and paint', film:'An old film', books:'A line from an old book' };
G.extraInsp = () => (S().inspo || []).map(id => ({ id, n:`From your free time: ${FT_INSP[id.slice(3)] || 'something new'}` }));

/* ---------- Public image ---------- */
G.IMAGE = { press:[['open','Open'], ['balanced','Balanced'], ['private','Private']], social:[['daily','Every day'], ['weekly','Now and then'], ['quiet','Quiet']] };
G.image = () => { const s = S(); s.image = s.image || { press:'balanced', social:'weekly' }; return s.image; };
G.hooks.week.push(() => { const s = S(); if (!s.image || s.flags.retired || s.flags.hidden) return; const im = s.image;
  if (im.press === 'open') G.applyFx({ heat:1, fans:.15 }); if (im.press === 'private') G.applyFx({ heat:-1, rep:.1 });
  if (im.social === 'daily') G.applyFx({ fans:.2, heat:.5, energy:-1 }); if (im.social === 'quiet') G.applyFx({ heat:-.5, energy:1 }); });

/* ---------- Business ---------- */
G.BRANDS = [{ id:'fragrance', n:'A fragrance' }, { id:'clothing', n:'A clothing line' }, { id:'beauty', n:'A beauty line' }, { id:'cafe', n:'A café' }, { id:'books', n:'A book imprint' }];
G.launchBrand = function (kind, name) { const s = S(), k = G.BRANDS.find(x => x.id === kind); name = String(name || '').trim();
  if (!k || !name) return { err:'Give your brand a name.' }; if (name.length > 40) return { err:'Keep the name under 40 characters.' };
  s.brands = s.brands || []; if (s.brands.length >= 5) return { err:'Five brands is plenty.' }; if (G.age() < 18) return { err:'Wait until you are 18.' };
  const cost = Math.round(G.payScale() * 2); if (s.stats.money < cost) return { err:`Launching costs ${G.fmtM(cost)}.` };
  s.stats.money -= cost; s.brands.push({ kind, name, abs:s.abs, cost }); G.applyFx({ heat:3 });
  G.inbox('manager', `${name} launches`, `${k.n}, all yours. It is invented for this game. It should earn a little every week.`);
  return { ok:true, msg:`${name} launches.` }; };
G.hooks.week.push(() => { const s = S(); (s.brands || []).forEach(b => { const fade = Math.max(.25, 1 - (s.abs - b.abs) / 260); s.stats.money += Math.round(b.cost * .02 * (.6 + s.stats.rep / 100) * fade); }); });
G.canBuyMasters = () => { const s = S(); return (G.frMode() === 'sandbox' || s.flags.free || s.mode === 'era') && s.stats.own < 90 && s.released.length > 0; };
G.mastersPrice = () => Math.round(Math.max(5e5, S().released.reduce((a, r) => a + r.total * 4, 0)));
G.buyMasters = function () { const s = S(); if (!G.canBuyMasters()) return { err:G.frMode() === 'canon' && s.mode === 'story' ? 'In Canon and Guided, the real story plays out. Buying back masters needs Sandbox.' : 'Not possible right now.' };
  const price = G.mastersPrice(); if (s.stats.money < price) return { err:`The owners want ${G.fmtM(price)}.` };
  s.stats.money -= price; s.stats.own = clamp(s.stats.own + 40, 0, 100); G.journalAdd('You own your masters', 'Every song, back where it belongs.');
  return { ok:true, msg:`You bought back your masters for ${G.fmtM(price)}.` }; };

/* ---------- What next, between eras ---------- */
G.betweenEras = () => { const s = S(); return !s.flags.retired && !G.active().some(x => ['write','record','finish','pre','release','tourprep','tour'].includes(x.st)); };
G.startNextEarly = function () { const s = S(), next = G.art().projects.filter(p => p.type !== 'demos' && p.type !== 'edition' && p.rel != null && !(s.pj[p.id] && s.pj[p.id].released) && G.win(p).ws > s.abs).sort((a, b) => G.win(a).ws - G.win(b).ws)[0];
  if (!next) return { err:'No real era is waiting.' }; if (G.frMode() !== 'sandbox') return { err:'Starting an era early needs Sandbox.' };
  const d = G.win(next).ws - s.abs; return G.delayEra(next.id, -d); };
})();
