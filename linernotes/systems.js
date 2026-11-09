/* Liner Notes: careers, offers, events, live shows, media, industry, life and awards. */
(function (root) {
const D = root.LND, LN = root.LN;
const { rnd, ri, pick, clamp, chance, uid, sum, gauss } = LN;
const fame = S => LN.fame(S);
const reg = id => D.REGIONS.find(r => r.id === id);
const cityOf = n => D.CITIES.find(c => c.name === n);

// =====================================================================
// LABELS
// =====================================================================
LN.labelOffer = function (S, L, sticky) {
  const f = fame(S); const lev = clamp((f - L.minFame + 10) / 40, 0, 1);
  const adv = Math.round((L.adv[0] + (L.adv[1] - L.adv[0]) * lev * rnd(0.6, 1)) / 1000) * 1000;
  const roy = Math.round((L.roy[0] + (L.roy[1] - L.roy[0]) * rnd(0.1, 0.6)) * 100) / 100;
  const masters = L.masters === 'artist' ? 'artist' : L.masters === 'label' ? 'label' : (chance(0.6) ? 'label' : 'artist');
  const it = LN.inbox(S, 'label', `${L.name} wants to sign you`, `${L.tier} label. Offer: ${LN.money(adv)} advance, ${Math.round(roy * 100)}% royalty, ${L.tier === 'Major' ? 3 : 2} albums, ${masters === 'label' ? 'label owns the masters' : 'you keep your masters'}.`,
    { label: L.id, advance: adv, royalty: roy, albums: L.tier === 'Major' ? 3 : 2, masters, tries: 3 }, 4);
  if (sticky) it.exp = S.week + 8;
  return it;
};
LN.negotiateChance = function (S, item, t) {
  const o = item.data; const L = D.LABELS.find(l => l.id === o.label);
  let ask = (t.advance / Math.max(1, o.advance) - 1) * 1.1 + (t.royalty - o.royalty) * 11 + (o.albums - t.albums) * 0.35;
  if (t.masters === 'artist' && o.masters === 'label') ask += L.masters === 'label' ? 1.4 : 0.6;
  const lev = (fame(S) - L.minFame) / 25 + LN.teamPower(S, 'manager') * 0.15 + S.hype / 200;
  return clamp(0.92 - Math.max(0, ask) * 0.6 + lev * 0.25, 0.02, 0.97);
};
LN.negotiate = function (S, itemId, t) {
  const item = S.inbox.find(i => i.id === itemId); if (!item) return { ok: false, msg: 'That offer has expired.' };
  const p = LN.negotiateChance(S, item, t);
  if (chance(p)) { S.inbox = S.inbox.filter(i => i.id !== itemId); return LN.signLabel(S, item.data.label, t); }
  item.data.tries--; const L = D.LABELS.find(l => l.id === item.data.label);
  if (item.data.tries <= 0 || chance(0.25)) { S.inbox = S.inbox.filter(i => i.id !== itemId); return { ok: false, gone: true, msg: `${L.name} walked away from the table.` }; }
  // counter offer: move halfway toward the ask
  const o = item.data; o.advance = Math.round((o.advance + (t.advance - o.advance) * 0.4) / 1000) * 1000; o.royalty = Math.round((o.royalty + (t.royalty - o.royalty) * 0.4) * 100) / 100;
  if (t.albums < o.albums && chance(0.4)) o.albums = t.albums; if (t.masters === 'artist' && L.masters !== 'label' && chance(0.4)) o.masters = 'artist';
  return { ok: false, counter: true, msg: `${L.name} said no but came back with a counter-offer: ${LN.money(o.advance)}, ${Math.round(o.royalty * 100)}% royalty, ${o.albums} albums, ${o.masters === 'label' ? 'label owns masters' : 'you keep masters'}. ${o.tries} tries left.` };
};
LN.signLabel = function (S, labelId, t) {
  const L = D.LABELS.find(l => l.id === labelId);
  S.label = { id: L.id, name: L.name, tier: L.tier, advance: t.advance, royalty: t.royalty, albums: t.albums, delivered: 0, masters: t.masters, recoup: t.advance, sat: 60, start: S.week, lastAlbum: S.week };
  const mgr = S.team.manager ? D.TEAM.manager.tiers[S.team.manager - 1].cut : 0;
  LN.earn(S, 'advance', t.advance * (1 - mgr)); S.hype = clamp(S.hype + 10, 0, 100);
  LN.timeline(S, `Signed to ${L.name}`, 'label'); LN.news(S, `${S.artist.name} signed with ${L.name}.`, 'you');
  S.flags.signed = 1;
  return { ok: true, signed: true, msg: `You signed with ${L.name}. ${LN.money(t.advance * (1 - mgr))} lands in your account. They keep your royalties until the advance is paid back.` };
};
LN.leaveLabelCost = S => S.label ? Math.round(S.label.recoup + S.label.advance * 0.5) : 0;
LN.leaveLabel = function (S) {
  if (!S.label) return { ok: false, msg: 'You are not signed.' };
  const c = LN.leaveLabelCost(S); if (S.money < c) return { ok: false, msg: `Buying out your contract costs ${LN.money(c)}.` };
  LN.spend(S, 'label', c); LN.endContract(S, 'bought out');
  return { ok: true, msg: `You paid ${LN.money(c)} and are free from your contract.` };
};
LN.endContract = function (S, why) {
  const L = S.label; if (!L) return; S.labelHistory.push(Object.assign({}, L, { end: S.week, why })); S.label = null;
  LN.timeline(S, `Left ${L.name} (${why})`, 'label'); LN.news(S, why === 'dropped' ? `${L.name} dropped ${S.artist.name}.` : `${S.artist.name} is now an independent artist.`, 'you');
};
function labelWeek(S, events) {
  const L = S.label; if (!L) return;
  for (const rel of S.releases) if (rel.label === L.id && rel.out && S.week - rel.week === 3 && !rel.judged) {
    rel.judged = true; const peak = Math.min(...D.REGION_IDS.map(r => ((rel.ch || {})[r + (rel.type === 'single' ? 's' : 'a')] || {}).peak || 999).concat(rel.songs.map(id => Math.min(...D.REGION_IDS.map(r => (((LN.song(S, id) || {}).ch || {})[r + 's'] || {}).peak || 999)))));
    const d = peak <= 5 ? 18 : peak <= 20 ? 10 : peak <= 60 ? 3 : peak <= 100 ? -4 : -12; L.sat = clamp(L.sat + d, 0, 100);
    S.weekReport.push(d > 0 ? `${L.name} is happy with how "${rel.title}" is doing.` : `${L.name} is disappointed with "${rel.title}".`);
  }
  if (S.week - L.lastAlbum > 90) { L.sat -= 0.6; if ((S.week - L.lastAlbum) % 13 === 0) S.weekReport.push(`${L.name} is asking when your next album is coming.`); }
  if (L.sat < 12) { LN.endContract(S, 'dropped'); events.push({ kind: 'note', title: 'Dropped', text: `${L.name} dropped you. You are independent again. Any masters they own stay with them, but you can re-record those albums or buy them back.` }); return; }
  if (L.delivered >= L.albums) { LN.endContract(S, 'contract complete'); events.push({ kind: 'note', title: 'Contract complete', text: `You delivered every album you owed ${L.name}. You are a free agent, and labels will start calling again.` }); }
}
LN.buybackPrice = (S, rel) => Math.round((50000 + (rel.revenue || 0) * 1.5 + sum(rel.songs.map(id => (LN.song(S, id) || {}).revenue || 0)) * 1.2) * (S.label && S.label.id === rel.masters ? 1.5 : 1) / 1000) * 1000;
LN.buyMasters = function (S, relId) {
  const rel = LN.rel(S, relId); if (!rel || rel.masters === 'artist' || !rel.masters) return { ok: false, msg: 'You already own those masters.' };
  const p = LN.buybackPrice(S, rel); if (S.money < p) return { ok: false, msg: `The label wants ${LN.money(p)} for these masters.` };
  LN.spend(S, 'masters', p); rel.masters = 'artist'; LN.timeline(S, `Bought back the masters to "${rel.title}"`, 'label');
  return { ok: true, msg: `You now own the masters to "${rel.title}".` };
};

// =====================================================================
// OWN LABEL
// =====================================================================
LN.OWN_LABEL_COST = 250000;
LN.startLabel = function (S, name) {
  if (S.ownLabel) return { ok: false, msg: 'You already run a label.' };
  if (fame(S) < 45) return { ok: false, msg: 'You need to be more famous before investors take your label seriously (fame 45).' };
  if (S.money < LN.OWN_LABEL_COST) return { ok: false, msg: `Starting a label costs ${LN.money(LN.OWN_LABEL_COST)}.` };
  LN.spend(S, 'own label', LN.OWN_LABEL_COST);
  S.ownLabel = { name: (name || S.artist.name + ' Records').slice(0, 32), founded: S.week, roster: [], prospects: [], earned: 0, weekEarned: 0 };
  refreshProspects(S); LN.timeline(S, `Founded ${S.ownLabel.name}`, 'label'); LN.news(S, `${S.artist.name} launched a record label, ${S.ownLabel.name}.`, 'you');
  return { ok: true, msg: `${S.ownLabel.name} is open for business. Sign your first artist.` };
};
function refreshProspects(S) {
  const used = new Set(S.usedNames);
  S.ownLabel.prospects = Array.from({ length: 3 }, () => { const g = pick(D.GENRES); const pot = ri(40, 95); return { name: LN.fakeName(used), genre: g.id, potential: pot, fame: ri(5, 22), ask: Math.round((5000 + pot * pot * 8) / 1000) * 1000 }; });
  S.usedNames = [...used];
}
LN.refreshProspects = refreshProspects;
LN.signProspect = function (S, i) {
  const O = S.ownLabel; const p = O && O.prospects[i]; if (!p) return { ok: false, msg: 'That artist is no longer available.' };
  if (O.roster.length >= 6) return { ok: false, msg: 'Your roster is full (6 artists).' };
  if (S.money < p.ask) return { ok: false, msg: `Signing ${p.name} costs ${LN.money(p.ask)}.` };
  LN.spend(S, 'own label', p.ask);
  const g = D.GENRE[p.genre]; const n = { id: uid('n'), name: p.name, real: false, genre: p.genre, fam: g.fam, region: S.artist.region, fame: p.fame, active: true, hiatus: 0, rel: 40, rival: false, cadence: 10, next: 99, albumNext: 999, label: 'own', debut: S.week, own: true, potential: p.potential, releases: 0 };
  S.npcs.push(n); O.roster.push(n.id); O.prospects.splice(i, 1);
  return { ok: true, msg: `${p.name} signed to ${O.name}.` };
};
LN.fundRelease = function (S, npcId, budget) {
  const n = LN.npc(S, npcId); if (!n || !n.own) return { ok: false, msg: 'That artist is not on your label.' };
  if (S.money < budget) return { ok: false, msg: `You need ${LN.money(budget)}.` };
  if (S.week - (n.lastFunded || -99) < 4) return { ok: false, msg: `${n.name} just put something out. Wait a few weeks.` };
  LN.spend(S, 'own label', budget); n.lastFunded = S.week; n.releases++;
  const push = clamp(Math.log10(budget / 5000 + 1) * 0.8 + n.potential / 120, 0.4, 2.2);
  const s = { id: uid('s'), title: LN.songTitle(), npc: n.id, feat: null, week: S.week, power: LN.npcPower(n.fame) * push * rnd(0.6, 1.4) + budget * 25, q: clamp(n.potential * 0.8 + rnd(-10, 15), 20, 98), fam: n.fam, rw: LN.regW(n.fam, n.region), decay: 0.86 + n.potential / 1500, ch: {}, pts: 0, own: true };
  S.npcSongs.push(s);
  n.fame = clamp(n.fame + push * rnd(2, 6) * (n.potential / 70), 0, 95);
  return { ok: true, msg: `${n.name} released "${s.title}" with a ${LN.money(budget)} push.` };
};
LN.dropArtist = function (S, npcId) { const O = S.ownLabel; if (!O) return { ok: false }; O.roster = O.roster.filter(x => x !== npcId); const n = LN.npc(S, npcId); if (n) { n.own = false; n.label = null; n.next = 8; } return { ok: true, msg: `${n ? n.name : 'The artist'} left your label.` }; };
LN.ownLabelWeek = function (S) {
  const O = S.ownLabel; let inc = 0;
  for (const s of S.npcSongs) { if (!s.own || !s.cur) continue; inc += sum(Object.values(s.cur)) * 0.003 * 0.3; }
  O.weekEarned = inc; O.earned += inc; LN.earn(S, 'own label', inc);
  if (S.week % 8 === 0) refreshProspects(S);
};

// =====================================================================
// TEAM
// =====================================================================
LN.hire = function (S, role, tier) {
  const T = D.TEAM[role]; if (!T || tier < 1 || tier > 3) return { ok: false, msg: 'Unknown role.' };
  const need = [0, 0, 30, 55][tier]; if (fame(S) < need) return { ok: false, msg: `A ${T.tiers[tier - 1].n.toLowerCase()} only works with artists at fame ${need} or higher.` };
  S.team[role] = tier; return { ok: true, msg: `You hired a ${T.tiers[tier - 1].n.toLowerCase()} as your ${T.name.toLowerCase()} (${LN.money(T.tiers[tier - 1].pay)} a week).` };
};
LN.fire = (S, role) => { S.team[role] = 0; return { ok: true, msg: `You let your ${D.TEAM[role].name.toLowerCase()} go.` }; };

// =====================================================================
// GIGS & TOURS
// =====================================================================
LN.venueOpen = (S, v, region) => S.fans[region] >= v.minFans * 0.8 || v.id === 'openmic';
LN.setlistQuality = function (S, ids) {
  const songs = ids.map(id => LN.song(S, id)).filter(Boolean); if (!songs.length) return 30;
  const avg = sum(songs.map(s => s.q)) / songs.length; const hits = songs.filter(s => Object.values(s.ch || {}).some(m => m.peak <= 40)).length;
  const tempos = new Set(songs.map(s => s.tempo)).size; const len = songs.length;
  return clamp(avg * 0.7 + hits * 4 + tempos * 2 + (len >= 8 && len <= 18 ? 6 : len < 5 ? -8 : 0), 0, 100);
};
function showResult(S, v, region, price, o) {
  const homeCity = o.city === S.artist.city ? 1.6 : 1; const pf = v.basePrice ? clamp(Math.pow(v.basePrice / Math.max(1, price), 1.3), 0.15, 2.2) : 1.5;
  const mood = 0.6 + S.mood[region] / 125; const hype = 1 + S.hype / 120;
  S.cityFatigue = S.cityFatigue || {}; const fat = S.cityFatigue[o.city] || 0;
  let demand = (S.fans[region] * 0.03 * homeCity * pf * mood * hype + (o.extraDraw || 0) + ri(5, 25)) / (1 + fat);
  if (v.id === 'openmic') demand = ri(15, 40);
  const att = Math.round(Math.min(v.cap, demand)); const sold = att / v.cap;
  if (!o.preview) S.cityFatigue[o.city] = fat + att / Math.max(200, S.fans[region] * 0.03 * homeCity);
  const setQ = LN.setlistQuality(S, o.setlist || []);
  const rating = clamp(S.skills.perf * 0.45 + setQ * 0.3 + (o.stage || 0) * 6 + S.health * 0.1 + rnd(-8, 8) + sold * 8, 5, 100);
  return { att, cap: v.cap, sold, rating, setQ, gross: att * price, crowd: clamp(rating / 100 * 0.6 + sold * 0.4, 0.1, 1) };
}
LN.playGig = function (S, venueId, cityName, o = {}) {
  const v = D.VENUES.find(x => x.id === venueId); const city = cityOf(cityName) || cityOf(S.artist.city);
  if (!v) return { ok: false, msg: 'Unknown venue.' };
  if (!LN.venueOpen(S, v, city.region)) return { ok: false, msg: `You need more fans in ${reg(city.region).name} to book a ${v.name.toLowerCase()}.` };
  if (v.id === 'arena' || v.id === 'stadium') return { ok: false, msg: 'Arenas and stadiums are only booked as part of a tour.' };
  if ((S.week_.gigs || 0) >= 2) return { ok: false, msg: 'You can play at most 2 gigs a week.' };
  if (LN.isTouring(S)) return { ok: false, msg: 'You are on tour right now.' };
  if (city.region !== S.artist.region && S.money < 800) return { ok: false, msg: 'Travel for an away gig costs $800.' };
  if (!LN.useEnergy(S, v.energy)) return { ok: false, msg: 'Not enough energy for a show.' };
  if (city.region !== S.artist.region) LN.spend(S, 'travel', 800);
  S.week_.gigs = (S.week_.gigs || 0) + 1;
  const price = o.price != null ? o.price : v.basePrice;
  const r = showResult(S, v, city.region, price, { city: city.name, setlist: o.setlist || defaultSetlist(S) });
  const agent = S.team.agent ? D.TEAM.agent.tiers[S.team.agent - 1].cut : 0;
  let pay = o.benefit ? 0 : r.gross * 0.4 * (1 - agent) * LN.DIFF[S.diff].inc;
  if (v.id === 'openmic') pay = ri(0, 40);
  LN.earn(S, 'shows', pay);
  const merch = merchAtShow(S, r.att);
  const fansG = r.att * (0.25 + r.rating / 200) + (v.id === 'openmic' ? ri(5, 30) : 0); LN.addFans(S, fansG, city.region);
  S.mood[city.region] = clamp(S.mood[city.region] + r.rating / 40 + (o.benefit ? 6 : 0), 0, 100);
  LN.gainSkill(S, 'perf', 1.1); LN.gainSkill(S, 'charisma', 0.3);
  S.gigs++; S.stats.showsPlayed++; S.stats.attendance += r.att;
  if (o.benefit) { LN.imageShift(S, 'wholesome', 6); S.charity += r.gross * 0.7; LN.news(S, `${S.artist.name} played a benefit show in ${city.name}.`, 'you'); }
  const res = Object.assign(r, { ok: true, venue: v, city: city.name, pay, merch, fans: Math.round(fansG), setlist: o.setlist || defaultSetlist(S) });
  res.msg = `${v.name} in ${city.name}: ${r.att.toLocaleString()} of ${v.cap.toLocaleString()} came. You earned ${LN.money(pay + merch)} and gained ${LN.fmt(fansG)} fans. Show rating ${Math.round(r.rating)}/100.`;
  S.shows.unshift({ w: S.week, venue: v.name, city: city.name, att: r.att, cap: v.cap, rating: Math.round(r.rating) }); if (S.shows.length > 40) S.shows.length = 40;
  return res;
};
function defaultSetlist(S) { let l = S.songs.filter(s => s.rel && !s.isRemix && !s.live); if (l.length < 4) l = l.concat(S.songs.filter(s => !s.rel && !s.leaked)); return l.sort((a, b) => b.q - a.q).slice(0, 10).map(s => s.id); }
LN.defaultSetlist = defaultSetlist;
function merchAtShow(S, att) {
  let inc = 0; for (const m of S.merch) { if (m.stock <= 0) continue; const sold = Math.min(m.stock, Math.round(att * 0.05 * rnd(0.6, 1.4))); m.stock -= sold; m.sold += sold; inc += sold * m.price; }
  if (inc) LN.earn(S, 'merch', inc); return inc;
}
LN.STAGES = [{ name: 'Bare stage', cost: 0 }, { name: 'Lights and screens', cost: 25000 }, { name: 'Big production', cost: 250000 }, { name: 'Spectacle', cost: 2000000 }];
LN.tourCost = (S, o) => { const v = D.VENUES.find(x => x.id === o.venue) || D.VENUES[1]; const crew = { openmic: 0, bar: 150, club: 600, theater: 4000, arena: 25000, stadium: 80000 }[v.id] || 0; return LN.STAGES[o.stage || 0].cost + crew * (o.cities || []).length + (o.opener ? LN.featureFee(S, o.opener) * 0.5 : 0); };
LN.planTour = function (S, o) {
  if (LN.isTouring(S)) return { ok: false, msg: 'You are already on tour.' };
  const v = D.VENUES.find(x => x.id === o.venue); if (!v || v.id === 'openmic') return { ok: false, msg: 'Pick a venue size.' };
  const cities = (o.cities || []).map(cityOf).filter(Boolean);
  if (cities.length < 4) return { ok: false, msg: 'A tour needs at least 4 cities.' };
  if (cities.length > 40) return { ok: false, msg: 'Keep it to 40 shows or fewer.' };
  const sl = (o.setlist || []).filter(id => { const s = LN.song(S, id); return s && s.rel; });
  if (sl.length < 5) return { ok: false, msg: 'Your setlist needs at least 5 released songs.' };
  const closed = cities.filter(c => !LN.venueOpen(S, v, c.region)); if (closed.length) return { ok: false, msg: `You don't have enough fans in ${reg(closed[0].region).name} for ${v.name.toLowerCase()}s yet.` };
  if (o.opener) { const n = LN.npc(S, o.opener); if (!n) return { ok: false, msg: 'Unknown opening act.' }; }
  const cost = LN.tourCost(S, o); if (S.money < cost) return { ok: false, msg: `This tour costs ${LN.money(cost)} up front for production and crew.` };
  LN.spend(S, 'touring', cost);
  const opener = o.opener ? LN.npc(S, o.opener) : null;
  S.tour = { name: (o.name || 'World Tour').slice(0, 40), venue: v.id, price: o.price || v.basePrice, stage: o.stage || 0, opener: opener ? opener.id : null, setlist: sl, start: S.week,
    shows: cities.map(c => ({ city: c.name, region: c.region, done: false })), idx: 0, gross: 0, att: 0, ratings: [], cancelNext: 0, cost };
  LN.news(S, `${S.artist.name} announced "${S.tour.name}", a ${cities.length}-date ${v.name.toLowerCase()} tour.`, 'you');
  S.hype = clamp(S.hype + 6, 0, 100);
  return { ok: true, msg: `"${S.tour.name}" is booked: ${cities.length} shows, 2 a week. Each week on tour costs 40 energy.` };
};
function tourWeek(S, events) {
  const T = S.tour; if (!T || T.idx >= T.shows.length) return;
  const v = D.VENUES.find(x => x.id === T.venue); const agent = S.team.agent ? D.TEAM.agent.tiers[S.team.agent - 1].cut : 0;
  const opener = T.opener ? LN.npc(S, T.opener) : null;
  for (let k = 0; k < 2 && T.idx < T.shows.length; k++) {
    const sh = T.shows[T.idx++];
    if (T.cancelNext > 0) { T.cancelNext--; sh.done = true; sh.cancelled = true; S.mood[sh.region] = clamp(S.mood[sh.region] - 5, 0, 100); S.weekReport.push(`Your ${sh.city} show was cancelled.`); continue; }
    const r = showResult(S, v, sh.region, T.price, { city: sh.city, setlist: T.setlist, stage: T.stage, extraDraw: opener ? Math.min(v.cap * 0.25, LN.npcPower(opener.fame) / 400) : 0 });
    const pay = r.gross * 0.5 * (1 - agent) * LN.DIFF[S.diff].inc; LN.earn(S, 'touring', pay); const merch = merchAtShow(S, r.att);
    LN.addFans(S, r.att * (0.2 + r.rating / 250), sh.region); S.mood[sh.region] = clamp(S.mood[sh.region] + r.rating / 50, 0, 100);
    Object.assign(sh, { done: true, att: r.att, cap: r.cap, rating: Math.round(r.rating), gross: pay + merch, crowd: r.crowd, sold: r.sold });
    T.gross += pay + merch; T.att += r.att; T.ratings.push(r.rating); S.stats.showsPlayed++; S.stats.attendance += r.att;
    if (r.sold >= 0.999 && v.id === 'arena') S.flags.arena = 1; if (r.sold >= 0.999 && v.id === 'stadium') S.flags.stadium = 1;
    S.shows.unshift({ w: S.week, venue: v.name, city: sh.city, att: r.att, cap: v.cap, rating: Math.round(r.rating), tour: T.name }); if (S.shows.length > 40) S.shows.length = 40;
  }
  if (opener) opener.rel = clamp(opener.rel + 1, -100, 100);
  S.stress = clamp(S.stress + 3, 0, 100); LN.gainSkill(S, 'perf', 0.8);
  const done = T.shows.filter(s => s.done && !s.cancelled); const last = done[done.length - 1];
  if (last) S.weekReport.push(`On tour: played ${T.shows.filter(s => s.done).length} of ${T.shows.length} shows. Last night in ${last.city}: ${last.att.toLocaleString()} fans, rating ${last.rating}.`);
  if (T.idx >= T.shows.length) {
    const avg = T.ratings.length ? sum(T.ratings) / T.ratings.length : 0;
    const summary = { name: T.name, venue: v.name, shows: done.length, att: T.att, gross: T.gross, cost: T.cost, rating: Math.round(avg), setlist: T.setlist.slice(), end: S.week, start: T.start, live: false };
    S.tours.push(summary); S.tour = null; S.flags.tourDone = 1;
    LN.legacy(S, 10 + Math.round(T.att / 100000)); LN.timeline(S, `Finished "${summary.name}": ${summary.shows} shows, ${LN.fmt(summary.att)} fans`, 'tour');
    LN.news(S, `"${summary.name}" wrapped with ${LN.fmt(summary.att)} tickets sold and ${LN.money(summary.gross)} earned.`, 'you');
    events.push({ kind: 'note', title: 'Tour complete', text: `"${summary.name}" is over. ${summary.shows} shows, ${summary.att.toLocaleString()} fans, ${LN.money(summary.gross)} earned against ${LN.money(summary.cost)} in costs. Average show rating ${summary.rating}/100. You can now release a live album from this tour in the Studio.` });
  }
}
LN.createLiveAlbum = function (S, tourIdx, title) {
  const T = S.tours[tourIdx]; if (!T || T.live) return { ok: false, msg: 'Pick a finished tour that has no live album yet.' };
  if (!LN.useEnergy(S, 15)) return { ok: false, msg: 'Not enough energy (15).' };
  const ids = T.setlist.map(id => { const o = LN.song(S, id); if (!o) return null; const s = LN.makeSong(S, { title: o.title + ' (Live)', genre: o.genre, mood: o.mood, topic: o.topic, tempo: o.tempo }, o.wq);
    s.recorded = true; s.q = Math.round(clamp(o.q * 0.85 + T.rating * 0.12, 5, 99)); s.live = true; S.stats.songsWritten--; return s.id; }).filter(Boolean);
  T.live = true;
  const rel = { id: uid('r'), type: 'live', title: (title || T.name + ' (Live)').slice(0, 48), songs: ids, lead: ids[0], week: S.week, out: false, units: 0, sales: 0, ch: {}, pts: 0, reviews: [], score: null };
  S.releases.push(rel); LN.releaseGoesOut(S, rel);
  return { ok: true, msg: `"${rel.title}" is out.` };
};

// festivals
function festivalOffers(S) {
  const f = fame(S); const ap = LN.teamPower(S, 'agent');
  for (const fe of D.FESTIVALS) {
    const wk = LN.wk(S); const diff = (fe.week - wk + 52) % 52;
    if (diff !== 8) continue; if (S.inbox.some(i => i.kind === 'festival' && i.data.fest === fe.name)) continue;
    const slots = D.FEST_SLOTS.filter(s => f + ap * 4 >= s.minFame); if (!slots.length) continue;
    const slot = slots[slots.length - 1]; if (!chance(0.55 + ap * 0.1)) continue;
    const fee = Math.round(slot.fee * (1 + ap * 0.15) / 500) * 500;
    LN.inbox(S, 'festival', `${fe.name} wants you`, `${slot.name} at ${fe.name} (${reg(fe.region).name}) in 8 weeks. Fee ${LN.money(fee)}.`, { fest: fe.name, region: fe.region, slot: slot.id, fee, week: S.week + 8 }, 3);
  }
}
function bookingsWeek(S, events) {
  for (const b of S.bookings.filter(b => b.week === S.week)) {
    if (b.kind === 'festival') {
      const slot = D.FEST_SLOTS.find(s => s.id === b.slot); if (S.sick) { S.weekReport.push(`You were too sick to play ${b.fest}.`); S.mood[b.region] -= 6; continue; }
      const crowd = { opener: 8000, mid: 25000, sub: 60000, head: 90000 }[slot.id];
      const rating = clamp(S.skills.perf * 0.55 + LN.setlistQuality(S, defaultSetlist(S)) * 0.3 + rnd(-8, 12), 5, 100);
      LN.earn(S, 'shows', b.fee * (1 - (S.team.agent ? D.TEAM.agent.tiers[S.team.agent - 1].cut : 0)));
      LN.addFans(S, crowd * slot.fans * (0.08 + rating / 600), b.region); LN.addFans(S, crowd * slot.fans * 0.05);
      S.hype = clamp(S.hype + slot.fans * 6, 0, 100); S.mood[b.region] = clamp(S.mood[b.region] + 5, 0, 100);
      if (slot.id === 'head') { S.flags.festHead = 1; LN.legacy(S, 10); LN.timeline(S, `Headlined ${b.fest}`, 'live'); }
      S.weekReport.push(`You played the ${slot.name.toLowerCase()} slot at ${b.fest} in front of ${LN.fmt(crowd)} people. Rating ${Math.round(rating)}/100.`);
      LN.news(S, rating > 75 ? `${S.artist.name}'s set at ${b.fest} was the talk of the weekend.` : `${S.artist.name} played ${b.fest}.`, 'you');
      S.lastShow = { kind: 'festival', name: b.fest, crowd, rating, slot: slot.name };
    }
  }
  S.bookings = S.bookings.filter(b => b.week > S.week);
}

// =====================================================================
// SOCIAL
// =====================================================================
const FAN_REPLIES = {
  good: ['THIS IS EVERYTHING', 'on repeat all week', 'you never miss', 'crying in the club rn', 'the vocals???', 'mother is mothering', 'tour when', 'this is the one', 'best artist of our generation', 'need this on vinyl'],
  meh: ['ok but when is the album', 'it\'s giving... fine', 'not my favorite but i support', 'the old stuff was better tbh', 'who asked lol', 'mid but i\'ll stream'],
  bad: ['this ain\'t it', 'unfollowing', 'what happened to you', 'pr team working overtime', 'ratio', 'remember when you were good'],
};
LN.fanReplies = (S, tone, n = 3) => { const used = new Set(); const out = []; for (let i = 0; i < n; i++) { const t = pick(FAN_REPLIES[tone]); if (used.has(t)) continue; used.add(t); out.push({ who: '@' + pick(['stan', 'its', 'not', 'the', 'xo', 'real']) + pick(['_', '.', '']) + pick(['moon', 'angel', 'vibes', 'luvr', 'babe', 'ghost', 'chaos', 'daisy']) + ri(1, 999), text: t }); } return out; };
LN.POSTS = [
  { id: 'update', name: 'Studio update', text: S => pick(['Back in the studio. Something special is coming.', 'Wrote three songs today. One of them is the one.', 'Late night session. Can\'t stop.']) },
  { id: 'photo', name: 'Outfit photo', text: S => pick(['Fit check. 📸', 'New era, new look.', 'Dressed for the occasion.']) },
  { id: 'teaser', name: 'Release teaser', text: S => { const r = S.releases.find(r => !r.out); return r ? `"${r.title}" ${LN.dateLabel(S, r.week)}. Are you ready? 👀` : 'Something is coming... 👀'; } },
  { id: 'thanks', name: 'Thank the fans', text: S => S.fandom ? `I love you, ${S.fandom}. None of this happens without you. ❤️` : 'I love you all. None of this happens without you. ❤️' },
  { id: 'hottake', name: 'Hot take', text: S => pick(['Unpopular opinion: most of the charts right now are boring.', 'Award shows are rigged and everybody knows it.', 'Streaming pays artists nothing. Buy the vinyl.']) },
  { id: 'diss', name: 'Call someone out', text: (S, n) => `${n ? '@' + n.name.replace(/\s+/g, '') : 'Some people'} should stop pretending they write their own songs.` },
  { id: 'apology', name: 'Public apology', text: S => 'I messed up and I\'m sorry. I\'m going to do better.' },
];
LN.post = function (S, type, o = {}) {
  const P = LN.POSTS.find(p => p.id === type); if (!P) return { ok: false, msg: 'Unknown post type.' };
  if ((S.week_.posts || 0) >= 3) return { ok: false, msg: 'You have posted 3 times this week. Any more and fans will mute you.' };
  if (type === 'diss' && !o.target) return { ok: false, msg: 'Choose who to call out.' };
  if (!LN.useEnergy(S, LN.energyCost.post)) return { ok: false, msg: 'Not enough energy.' };
  S.week_.posts = (S.week_.posts || 0) + 1; S.lastPost = S.week; S.stats.posts++;
  const n = o.target ? LN.npc(S, o.target) : null;
  const text = (o.text && o.text.trim()) ? o.text.trim().slice(0, 200) : P.text(S, n);
  const ch = S.skills.charisma; const fans = LN.totalFans(S);
  let rate = 0.03 * (0.5 + ch / 100) * (0.7 + Math.random() * 0.6); let tone = 'good'; let msg = '';
  if (type === 'photo') rate *= 1 + LN.teamPower(S, 'stylist') * 0.25;
  if (type === 'teaser') { const r = S.releases.find(r => !r.out); if (r) { r.prehype = Math.min(15, (r.prehype || 0) + 4); msg = ' Pre-release buzz is building.'; } }
  if (type === 'thanks') { LN.moodAll(S, 3); LN.imageShift(S, 'wholesome', 2); }
  if (type === 'hottake') { rate *= 1.6; LN.imageShift(S, 'edgy', 4); if (chance(0.35)) { tone = 'bad'; LN.moodAll(S, -3); msg = ' It started an argument.'; } else S.hype = clamp(S.hype + 4, 0, 100); }
  if (type === 'diss') { rate *= 2; n.rel = clamp(n.rel - 30, -100, 100); if (n.rel <= -30) n.rival = true; LN.imageShift(S, 'edgy', 5); S.hype = clamp(S.hype + 6, 0, 100); tone = chance(0.6) ? 'good' : 'meh'; msg = ` ${n.name}'s fans are furious.`;
    if (chance(0.5)) LN.feedPost(S, n.id, pick(['Imagine needing my name to trend.', 'Who?', 'Keep my name out your mouth.', 'Studio time is cheaper than therapy, babe.']), Math.round(LN.npcPower(n.fame) / 200)); }
  if (type === 'apology') { if (S.scandal) { const fix = 0.5 + LN.teamPower(S, 'publicist') * 0.12; LN.moodAll(S, 8 * fix); S.scandal = null; msg = ' Most fans accepted it.'; } else { tone = 'meh'; msg = ' Fans are confused about what you are apologizing for.'; } }
  if (type === 'update') S.hype = clamp(S.hype + 2, 0, 100);
  let likes = Math.round(fans * rate + ri(1, 20));
  const viral = chance(0.02 + ch / 1500 + (type === 'hottake' ? 0.03 : 0));
  if (viral) { likes *= ri(8, 25); S.hype = clamp(S.hype + 15, 0, 100); LN.addFans(S, 500 + Math.sqrt(fans) * 35); msg += ' The post went viral!'; }
  LN.feedPost(S, 'P', text, likes, { kind: type, viral });
  S.feed[0].replies = LN.fanReplies(S, tone, 3);
  LN.addFans(S, likes * 0.01); LN.gainSkill(S, 'charisma', 0.2);
  return { ok: true, msg: `Posted. ${LN.fmt(likes)} likes.${msg}`, viral };
};
LN.nameFandom = function (S, name) {
  if (LN.totalFans(S) < 5000) return { ok: false, msg: 'You need at least 5,000 fans to name your fandom.' };
  name = (name || '').trim().slice(0, 24); if (!name) return { ok: false, msg: 'Type a name.' };
  const first = !S.fandom; S.fandom = name; if (first) { S.fanClub = 20; LN.moodAll(S, 6); LN.timeline(S, `Named the fandom: ${name}`, 'fans'); }
  return { ok: true, msg: `Your fans are now ${name}.` };
};
// Loopr
LN.seedLoopr = function (S, songId, budget) {
  const s = LN.song(S, songId); if (!s || !s.rel) return { ok: false, msg: 'Pick a released song.' };
  if (S.money < budget) return { ok: false, msg: `You need ${LN.money(budget)}.` };
  LN.spend(S, 'promotion', budget); s.seed = { p: clamp(Math.log10(budget / 500 + 1) * 0.12, 0.02, 0.45), until: S.week + 3 };
  return { ok: true, msg: `You paid creators ${LN.money(budget)} to use "${s.title}" on Loopr. It might catch on in the next few weeks.` };
};
function looprWeek(S) {
  for (const s of S.songs) {
    if (!s.rel || (s.viral && s.viral.until >= S.week)) continue;
    const tempo = s.tempo === 'up' || s.tempo === 'fast' ? 1.5 : 1;
    let p = 0.0035 * LN.appeal(s.q) * tempo * (1 + S.hype / 100) * LN.DIFF[S.diff].luck * (s.viralCount ? 0.4 : 1);
    if (s.seed && s.seed.until >= S.week) p += s.seed.p / 3;
    if (chance(p)) {
      const reach = rnd(2e6, 1.4e7) * clamp(LN.appeal(s.q), 0.4, 1.6); s.viral = { reach, until: S.week + ri(2, 5) }; s.viralCount = (s.viralCount || 0) + 1;
      S.hype = clamp(S.hype + 12, 0, 100); S.flags.viral = 1;
      const old = S.week - s.relWeek > 26;
      S.weekReport.push(`"${s.title}" is trending on Loopr${old ? ' years after it came out' : ''}! Millions of clips use it.`);
      LN.news(S, `"${s.title}" by ${S.artist.name} is the sound of the week on Loopr.`, 'you');
      LN.feedPost(S, 'Loopr', `Trending sound: "${s.title}" by ${S.artist.name} 🔥`, Math.round(reach / 20));
    }
  }
  if (chance(0.3)) { const s = pick(S.npcSongs.filter(x => S.week - x.week < 20)); if (s) { s.viral = S.week + ri(1, 3); } }
}
// playlists
LN.playlistChance = (S, s, pitch) => { const L = S.label ? D.LABELS.find(l => l.id === S.label.id) : null; return clamp(0.05 + (s.q - 50) / 250 + (L ? L.playlist : 0) + LN.teamPower(S, 'publicist') * 0.04 + (pitch ? 0.08 : 0) + fame(S) / 500, 0.01, 0.85); };
function playlistAdd(S, s) {
  const tier = s.q >= 82 && fame(S) > 40 ? 3 : s.q >= 68 && fame(S) > 20 ? 2 : 1;
  const pl = pick(D.PLAYLISTS.filter(p => p.tier === tier)); s.playlist = { name: pl.name, reach: pl.reach, until: S.week + ri(4, 8) }; S.flags.playlist = 1;
  S.weekReport.push(`"${s.title}" was added to the "${pl.name}" playlist.`);
}
LN.pitchPlaylist = function (S, songId) {
  const s = LN.song(S, songId); if (!s || !s.rel) return { ok: false, msg: 'Pick a released song.' };
  if (s.pitched) return { ok: false, msg: 'You already pitched this song.' };
  if (!LN.useEnergy(S, LN.energyCost.pitch)) return { ok: false, msg: 'Not enough energy.' };
  s.pitched = true; if (chance(LN.playlistChance(S, s, true))) { playlistAdd(S, s); return { ok: true, msg: `The pitch worked. "${s.title}" is on "${s.playlist.name}".` }; }
  return { ok: true, msg: 'The playlist editors passed this time.' };
};
function playlistWeek(S) {
  for (const s of S.songs) if (s.rel && s.focus && S.week - s.relWeek === 1 && !s.playlist && chance(LN.playlistChance(S, s))) playlistAdd(S, s);
}

// =====================================================================
// MUSIC VIDEOS, TALK SHOWS, TV
// =====================================================================
LN.videoCost = o => { const d = D.DIRECTORS.find(x => x.id === o.director) || D.DIRECTORS[0]; return d.fee + (o.budget || 0); };
LN.shootVideo = function (S, songId, o) {
  const s = LN.song(S, songId); if (!s || !s.rel) return { ok: false, msg: 'Pick a released song.' };
  if (S.videos.some(v => v.song === songId)) return { ok: false, msg: 'That song already has a video.' };
  const d = D.DIRECTORS.find(x => x.id === o.director) || D.DIRECTORS[0]; const c = D.CONCEPTS.find(x => x.id === o.concept) || D.CONCEPTS[0];
  const cost = LN.videoCost(o); if (S.money < cost) return { ok: false, msg: `This shoot costs ${LN.money(cost)}.` };
  if (!LN.useEnergy(S, LN.energyCost.video)) return { ok: false, msg: 'A video shoot needs 30 energy.' };
  LN.spend(S, 'videos', cost);
  const q = Math.round(clamp(d.skill * 0.5 + Math.log10((o.budget || 0) + 1000) * 6 - 18 + LN.teamPower(S, 'stylist') * 4 + s.q * 0.15 + S.skills.charisma * 0.1 + rnd(-8, 8), 5, 100));
  const v = { id: uid('v'), song: s.id, title: s.title, director: d.name, concept: c.id, budget: o.budget || 0, q, views: 0, week: S.week };
  S.videos.push(v); s.boost = { reach: q * q * 60, until: S.week + 6 }; S.hype = clamp(S.hype + q / 12, 0, 100);
  LN.gainSkill(S, 'charisma', 0.6); S.acting = clamp(S.acting + 0.5, 0, 100);
  return { ok: true, video: v, msg: `You shot the video for "${s.title}" with ${d.name}. It came out ${q >= 80 ? 'stunning' : q >= 60 ? 'strong' : q >= 40 ? 'fine' : 'cheap-looking'} (${q}/100).` };
};
function videoWeek(S) {
  for (const v of S.videos) {
    const a = S.week - v.week; const s = LN.song(S, v.song);
    const w = (LN.totalFans(S) * 0.2 + (s && s.viral && s.viral.until >= S.week ? s.viral.reach * 0.3 : 0) + (s ? (s.weekStreamsLast || 0) * 0.12 : 0)) * (v.q / 60) * Math.pow(0.9, a) * rnd(0.85, 1.15);
    v.views += w; S.stats.maxViews = Math.max(S.stats.maxViews, v.views);
  }
}
const QUESTIONS = [
  { q: 'Is the rumor true that you are feuding with another artist?', a: [['Laugh it off and change the subject', { mysterious: 3 }], ['"I have love for everyone."', { wholesome: 3, mood: 2 }], ['"If the shoe fits..."', { edgy: 5, hype: 6 }]] },
  { q: 'What is your new music about?', a: [['Open up about a painful year', { wholesome: 2, mood: 4 }], ['"You will have to listen and find out."', { mysterious: 5, hype: 3 }], ['Brag about how it will top the charts', { edgy: 3, hype: 5, mood: -2 }]] },
  { q: 'Who is your biggest influence?', a: [['Name a legend from decades ago', { mysterious: 2 }], ['Shout out your fans', { wholesome: 3, mood: 4 }], ['"Honestly? Me."', { edgy: 4, messy: 2, hype: 4 }]] },
  { q: 'Can you play us something right now?', a: [['Sing a stripped-down version of your single', { perf: true, hype: 5 }], ['Politely decline', { mysterious: 2 }], ['Make the host sing with you', { wholesome: 3, hype: 3, messy: 1 }]] },
  { q: 'People say fame changed you. Has it?', a: [['"I\'m still the same kid from ' + '%city%' + '."', { wholesome: 4, mood: 3 }], ['"Of course it did. Look at my life."', { edgy: 3, messy: 3 }], ['Stare at the host in silence', { mysterious: 6, hype: 4, mood: -1 }]] },
  { q: 'Are you dating anyone?', a: [['"My music is my partner."', { wholesome: 2 }], ['Wink and say nothing', { mysterious: 5, hype: 4 }], ['Spill way too much', { messy: 6, hype: 8, mood: -2 }]] },
  { q: 'What do you think of the state of the music industry?', a: [['Call out streaming pay', { edgy: 4, mood: 3 }], ['"It has never been a better time to be an artist."', { wholesome: 3 }], ['Name and shame a label', { edgy: 6, messy: 3, hype: 7 }]] },
];
LN.interviewQuestions = (S) => QUESTIONS.slice().sort(() => Math.random() - 0.5).slice(0, 3).map(x => ({ q: x.q, a: x.a.map(([t, fx]) => [t.replace('%city%', S.artist.city), fx]) }));
LN.finishInterview = function (S, itemId, effects) {
  const item = S.inbox.find(i => i.id === itemId); if (item) S.inbox = S.inbox.filter(i => i.id !== itemId);
  if (!LN.useEnergy(S, LN.energyCost.interview)) S.energy = 0;
  let hype = 4, mood = 0; const ch = S.skills.charisma;
  for (const fx of effects) { for (const k of ['wholesome', 'edgy', 'mysterious', 'messy']) if (fx[k]) LN.imageShift(S, k, fx[k]); hype += fx.hype || 0; mood += fx.mood || 0; if (fx.perf) hype += S.skills.vocals / 20; }
  hype *= 0.6 + ch / 100; S.hype = clamp(S.hype + hype, 0, 100); LN.moodAll(S, mood); LN.addFans(S, 500 + Math.sqrt(LN.totalFans(S)) * 12);
  LN.gainSkill(S, 'charisma', 1.2); S.flags.talkshow = 1;
  const show = item ? item.data.show : 'the show';
  LN.news(S, `${S.artist.name} stopped by ${show}.`, 'you');
  return { ok: true, msg: `Your appearance on ${show} aired. Hype +${Math.round(hype)}. Your image is now ${LN.imageTop(S)}.` };
};
LN.tvPerform = function (S, itemId, songId) {
  const item = S.inbox.find(i => i.id === itemId); const s = LN.song(S, songId); if (!s || !s.rel) return { ok: false, msg: 'Pick a released song to perform.' };
  if (!LN.useEnergy(S, 20)) return { ok: false, msg: 'A TV performance needs 20 energy.' };
  if (item) S.inbox = S.inbox.filter(i => i.id !== itemId);
  const rating = clamp(S.skills.perf * 0.5 + S.skills.vocals * 0.3 + s.q * 0.2 + rnd(-10, 10), 5, 100);
  const big = item && item.kind === 'awardperf' ? 2.2 : 1;
  s.boost = { reach: (Math.sqrt(LN.totalFans(S)) * 500 + 3e5) * rating / 60 * big, until: S.week + 3 }; S.hype = clamp(S.hype + rating / 8 * big, 0, 100);
  LN.addFans(S, (2000 + Math.sqrt(LN.totalFans(S)) * 25) * big * rating / 60); LN.gainSkill(S, 'perf', 0.8);
  const where = item ? item.data.show : 'TV';
  LN.news(S, rating > 70 ? `${S.artist.name}'s performance of "${s.title}" on ${where} has everyone talking.` : `${S.artist.name} performed "${s.title}" on ${where}.`, 'you');
  return { ok: true, rating, song: s, where, msg: `You performed "${s.title}" on ${where}. Rating ${Math.round(rating)}/100. Expect a streaming bump.` };
};

// =====================================================================
// MOVIES
// =====================================================================
function movieOffer(S) {
  const f = fame(S); const ap = LN.teamPower(S, 'agent');
  const roles = D.ROLES.filter(r => r.id === 'cameo' ? f >= 30 : r.id === 'support' ? f >= 42 || S.acting > 30 : f >= 58 || S.acting > 50);
  if (!roles.length) return; const role = roles[roles.length - 1 - (chance(0.5) ? 0 : Math.min(roles.length - 1, 1))];
  const budget = Math.round(rnd(5, 120) * (role.id === 'lead' ? 2 : 1)) * 1e6;
  const fee = Math.round(budget * (role.id === 'lead' ? 0.05 : role.id === 'support' ? 0.015 : 0.003) * (1 + ap * 0.2) / 1000) * 1000;
  const title = pick(D.MOVIE_WORDS) + ' ' + pick(D.MOVIE_WORDS2);
  LN.inbox(S, 'movie', `Movie offer: ${title}`, `${role.name} in a ${pick(D.MOVIE_GENRES).toLowerCase()} from ${pick(D.MOVIE_STUDIOS)}. ${LN.money(fee)}, about ${role.weeks} week${role.weeks > 1 ? 's' : ''} of shooting. You'll need to audition.`,
    { title, role: role.id, fee, budget, weeks: role.weeks, genre: pick(D.MOVIE_GENRES) }, 4);
}
LN.AUDITION = [{ id: 'prepared', name: 'Over-prepare the scene', text: 'Safe. Good if you are new to acting.' }, { id: 'improv', name: 'Improvise and charm the room', text: 'Leans on charisma.' }, { id: 'method', name: 'Go full method', text: 'Risky, but directors love it when it works.' }];
LN.auditionChance = (S, approach) => clamp(0.3 + S.acting / 140 + (approach === 'prepared' ? 0.12 : approach === 'improv' ? S.skills.charisma / 220 : (S.acting > 40 ? 0.2 : -0.1)) + LN.teamPower(S, 'agent') * 0.04, 0.05, 0.95);
LN.audition = function (S, itemId, approach) {
  const item = S.inbox.find(i => i.id === itemId); if (!item) return { ok: false, msg: 'That offer expired.' };
  if (S.movie) return { ok: false, msg: 'You are already working on a movie.' };
  if (!LN.useEnergy(S, 10)) return { ok: false, msg: 'An audition needs 10 energy.' };
  S.inbox = S.inbox.filter(i => i.id !== itemId);
  if (!chance(LN.auditionChance(S, approach))) { S.acting = clamp(S.acting + 1, 0, 100); return { ok: false, msg: `The casting director thanked you for your time. You didn't get the part in "${item.data.title}".` }; }
  const d = item.data; S.movie = Object.assign({}, d, { stage: 'shoot', left: d.weeks, perf: 0, approach, soundtrack: null });
  LN.earn(S, 'movies', d.fee); LN.timeline(S, `Cast in "${d.title}"`, 'movie'); LN.news(S, `${S.artist.name} has been cast in "${d.title}".`, 'you');
  return { ok: true, msg: `You got the part! Shooting "${d.title}" starts now and takes ${d.weeks} week${d.weeks > 1 ? 's' : ''}. Each shooting week costs 35 energy.` };
};
LN.setSoundtrack = function (S, songId) { if (!S.movie) return { ok: false, msg: 'No movie in progress.' }; const s = LN.song(S, songId); if (!s || !s.recorded) return { ok: false, msg: 'Pick a recorded song.' }; S.movie.soundtrack = songId; return { ok: true, msg: `"${s.title}" will be on the soundtrack.` }; };
function movieWeek(S, events) {
  const M = S.movie; if (!M) return;
  if (M.stage === 'shoot') {
    M.left--; M.perf += S.acting * 0.6 + S.skills.charisma * 0.2 + rnd(-10, 15) + (M.approach === 'method' ? 6 : 0); S.acting = clamp(S.acting + 2.2 * (1 - S.acting / 115), 0, 100);
    if (M.left <= 0) { M.stage = 'post'; M.premiere = S.week + 6; S.weekReport.push(`Filming on "${M.title}" wrapped. It premieres in 6 weeks.`); }
  } else if (M.stage === 'post' && S.week >= M.premiere) {
    const role = D.ROLES.find(r => r.id === M.role); const perf = clamp(M.perf / Math.max(1, M.weeks), 5, 100);
    const crit = clamp(perf * 0.06 + rnd(1, 5), 1, 10);
    const box = Math.round(M.budget * (0.4 + crit / 5 + fame(S) / 80 * role.mult) * rnd(0.6, 1.6) / 1e5) * 1e5;
    const film = { title: M.title, role: role.name, genre: M.genre, box, crit: Math.round(crit * 10) / 10, w: S.week };
    S.films.push(film); S.movie = null; S.flags.movie = 1; if (box >= 3e8) S.flags.movieHit = 1;
    LN.addFans(S, Math.sqrt(box) * 15 * role.mult); S.hype = clamp(S.hype + 10 * role.mult, 0, 100); if (box > 2e8) LN.legacy(S, 15);
    if (M.soundtrack) { const s = LN.song(S, M.soundtrack); if (s) { if (!s.rel) { const r = LN.createRelease(S, { type: 'single', title: s.title, songs: [s.id] }); } s.boost = { reach: Math.min(4e6, box / 80), until: S.week + 6 }; } }
    LN.timeline(S, `"${film.title}" premiered: ${LN.money(box)} at the box office`, 'movie');
    LN.news(S, `"${film.title}", starring ${S.artist.name}, opened to ${crit >= 7 ? 'great' : crit >= 5 ? 'mixed' : 'rough'} reviews and earned ${LN.money(box)}.`, 'you');
    events.push({ kind: 'note', title: 'Premiere night', text: `"${film.title}" is out. Critics gave your performance ${film.crit}/10, and it made ${LN.money(box)} worldwide.` });
  }
}

// =====================================================================
// BRANDS, PRODUCTS, LIFE
// =====================================================================
function brandOffer(S) {
  const b = pick(D.BRANDS); const img = LN.imageTop(S); const fit = img === b.fit ? 1.4 : 0.8;
  const f = fame(S); const pay = Math.round((b.pay[0] * 0.1 + b.pay[1] * Math.pow(f / 100, 4)) * fit * (1 + LN.teamPower(S, 'manager') * 0.15) / 1000) * 1000;
  LN.inbox(S, 'brand', `${b.name} wants a deal`, `${LN.money(pay)} for a 6-month campaign. ${img === b.fit ? 'It fits your image perfectly.' : `Their brand is ${b.fit}, which may clash with your image.`}`, { brand: b.name, fit: b.fit, pay }, 3);
}
LN.launchProduct = function (S, id) {
  const p = D.PRODUCT_LINES.find(x => x.id === id); if (!p) return { ok: false, msg: 'Unknown product.' };
  if (S.products.some(x => x.id === id)) return { ok: false, msg: 'You already have one.' };
  if (fame(S) < p.minFame) return { ok: false, msg: `You need fame ${p.minFame} to launch a ${p.name.toLowerCase()}.` };
  if (S.money < p.cost) return { ok: false, msg: `Launching costs ${LN.money(p.cost)}.` };
  LN.spend(S, 'brands', p.cost); const scale = clamp(rnd(0.3, 1.6) * (1 + (S.image.mysterious + S.image.wholesome) / 200), 0.2, 2.4);
  S.products.push({ id, name: p.name, scale, earned: 0, w: S.week }); LN.news(S, `${S.artist.name} launched a ${p.name.toLowerCase()}.`, 'you');
  return { ok: true, msg: `Your ${p.name.toLowerCase()} is on shelves. ${scale > 1.2 ? 'Early sales look huge.' : scale > 0.7 ? 'Early sales look decent.' : 'Early sales are slow.'}` };
};
LN.buyHome = function (S, id) {
  const h = D.HOMES.find(x => x.id === id); if (!h) return { ok: false };
  if (S.homes.includes(id)) { S.home = id; return { ok: true, msg: `You moved into your ${h.name.toLowerCase()}.` }; }
  if (h.rent) { S.homes.push(id); S.home = id; return { ok: true, msg: `You moved into a ${h.name.toLowerCase()} (${LN.money(h.upkeep)} a week).` }; }
  if (S.money < h.cost) return { ok: false, msg: `The ${h.name.toLowerCase()} costs ${LN.money(h.cost)}.` };
  LN.spend(S, 'property', h.cost); S.taxable += h.cost * 0.6; S.homes.push(id); S.home = id; LN.imageShift(S, 'mysterious', h.image * 0.3);
  if (h.cost >= 2e6) S.flags.mansion = 1; LN.timeline(S, `Bought a ${h.name.toLowerCase()}`, 'life');
  return { ok: true, msg: `You bought a ${h.name.toLowerCase()} and moved in.` };
};
LN.sellHome = function (S, id) {
  const h = D.HOMES.find(x => x.id === id); if (!h || !S.homes.includes(id) || id === 'h0') return { ok: false, msg: 'You can\'t sell that.' };
  S.homes = S.homes.filter(x => x !== id); if (!h.rent) { LN.earn(S, 'property', h.cost * 0.85); S.taxable -= h.cost * 0.85 * 0.6; } if (S.home === id) S.home = S.homes[S.homes.length - 1];
  return { ok: true, msg: h.rent ? `You moved out of the ${h.name.toLowerCase()}.` : `You sold the ${h.name.toLowerCase()} for ${LN.money(h.cost * 0.85)}.` };
};
LN.buyCar = function (S, id) { const c = D.CARS.find(x => x.id === id); if (!c || S.cars.includes(id)) return { ok: false, msg: 'You already own it.' }; if (S.money < c.cost) return { ok: false, msg: `It costs ${LN.money(c.cost)}.` }; LN.spend(S, 'property', c.cost); S.taxable += c.cost * 0.6; S.cars.push(id); LN.imageShift(S, 'edgy', c.image * 0.4); return { ok: true, msg: `You bought a ${c.name.toLowerCase()}.` }; };
LN.sellCar = function (S, id) { const c = D.CARS.find(x => x.id === id); if (!c || !S.cars.includes(id)) return { ok: false }; S.cars = S.cars.filter(x => x !== id); LN.earn(S, 'property', c.cost * 0.6); S.taxable -= c.cost * 0.6 * 0.6; return { ok: true, msg: `You sold the ${c.name.toLowerCase()} for ${LN.money(c.cost * 0.6)}.` }; };
LN.invest = function (S, id, amt) { amt = Math.round(amt); if (amt <= 0 || S.money < amt) return { ok: false, msg: 'Not enough money.' }; S.money -= amt; S.invest[id] = (S.invest[id] || 0) + amt; return { ok: true, msg: `Invested ${LN.money(amt)}.` }; };
LN.withdraw = function (S, id) { const v = S.invest[id] || 0; if (!v) return { ok: false, msg: 'Nothing invested there.' }; S.money += v; delete S.invest[id]; return { ok: true, msg: `Withdrew ${LN.money(v)}.` }; };
LN.donate = function (S, cause, amt) {
  amt = Math.round(amt); if (amt <= 0 || S.money < amt) return { ok: false, msg: 'Not enough money.' };
  LN.spend(S, 'charity', amt); S.taxable -= amt * 0.4; S.charity += amt; const k = clamp(Math.log10(amt / 500 + 1), 0.2, 4); LN.imageShift(S, 'wholesome', k * 3); LN.moodAll(S, k * 1.5);
  if (amt >= 100000) LN.news(S, `${S.artist.name} donated ${LN.money(amt)} to ${cause.toLowerCase()}.`, 'you');
  return { ok: true, msg: `You gave ${LN.money(amt)} to ${cause.toLowerCase()}. Fans noticed.` };
};
LN.designMerch = function (S, o) {
  const it = D.MERCH.find(x => x.id === o.item); if (!it) return { ok: false, msg: 'Pick an item.' };
  const qty = clamp(Math.round(o.qty || 100), 25, 200000); const cost = qty * it.cost;
  if (S.money < cost) return { ok: false, msg: `Producing ${qty} costs ${LN.money(cost)}.` };
  LN.spend(S, 'merch', cost);
  S.merch.push({ id: uid('m'), item: it.id, name: `${o.print || 'Logo'} ${it.name.toLowerCase()}`, color: o.color || '#1d1d24', print: o.print || 'Your name', price: clamp(Math.round(o.price || it.price), 5, 500), stock: qty, sold: 0, w: S.week });
  return { ok: true, msg: `${qty} ${it.name.toLowerCase()}s are printed and on sale.` };
};
LN.itemPrice = (S, it) => Math.round(it.price * (1 - LN.teamPower(S, 'stylist') * 0.1));
LN.buyItem = function (S, id) { const it = D.WARDROBE.find(x => x.id === id); if (!it || S.wardrobe.includes(id)) return { ok: false, msg: 'Already in your wardrobe.' }; const p = LN.itemPrice(S, it); if (S.money < p) return { ok: false, msg: `It costs ${LN.money(p)}.` }; LN.spend(S, 'wardrobe', p); S.wardrobe.push(id); return { ok: true, msg: `${it.name} added to your wardrobe.` }; };
LN.setLook = function (S, look) { for (const slot of ['top', 'bottom', 'shoes', 'hair', 'acc']) if (look[slot] && !S.wardrobe.includes(look[slot])) return { ok: false, msg: 'You don\'t own that item yet.' }; S.look = Object.assign({}, S.look, look); return { ok: true, msg: 'Look saved.' }; };

// =====================================================================
// RIVALS, FEATURES, BEEFS
// =====================================================================
LN.makePeace = function (S, npcId) {
  const n = LN.npc(S, npcId); if (!n) return { ok: false };
  if (!LN.useEnergy(S, 10)) return { ok: false, msg: 'Not enough energy.' };
  if (chance(0.35 + S.skills.charisma / 200)) { n.rel = clamp(n.rel + 40, -100, 100); if (n.rel > -30) n.rival = false; if (S.beef && S.beef.npc === n.id) S.beef = null; LN.imageShift(S, 'wholesome', 3); LN.news(S, `${S.artist.name} and ${n.name} squashed their beef.`, 'you'); return { ok: true, msg: `You and ${n.name} talked it out. The beef is over.` }; }
  n.rel = clamp(n.rel - 5, -100, 100); return { ok: true, msg: `${n.name} left you on read.` };
};
function beefWeek(S) {
  // your released diss tracks
  for (const s of S.songs) if (s.diss && s.rel && S.week - s.relWeek === 0 && !s.dissHandled) {
    s.dissHandled = true; const n = LN.npc(S, s.diss); if (!n) continue; n.rel = clamp(n.rel - 35, -100, 100); n.rival = true;
    S.beef = { npc: n.id, start: S.week, mine: s.id, theirs: null, end: S.week + 6 }; S.hype = clamp(S.hype + 10, 0, 100); LN.imageShift(S, 'edgy', 6);
    LN.news(S, `${S.artist.name} released a diss track aimed at ${n.name}.`, 'you');
  }
  const B = S.beef; if (!B) return;
  if (!B.theirs && S.week - B.start >= 1 && chance(0.55)) { const n = LN.npc(S, B.npc); if (n) { const r = npcSongDiss(S, n); B.theirs = r.id; LN.news(S, `${n.name} fired back at ${S.artist.name} with "${r.title}".`, 'beef'); S.weekReport.push(`${n.name} answered your diss with "${r.title}". The beef is on.`); } }
  if (S.week >= B.end) {
    const n = LN.npc(S, B.npc); const mine = B.mine ? (LN.song(S, B.mine) || { pts: 0 }).pts : 0; const theirs = B.theirs ? (S.npcSongs.find(x => x.id === B.theirs) || { pts: 0 }).pts : 0;
    S.beef = null; if (!n) return;
    if (mine > theirs) { S.flags.beefWin = 1; S.hype = clamp(S.hype + 12, 0, 100); n.fame = clamp(n.fame - 2, 5, 99); S.weekReport.push(`You won the beef with ${n.name}. The internet has spoken.`); LN.news(S, `The verdict is in: ${S.artist.name} won the beef with ${n.name}.`, 'beef'); LN.timeline(S, `Won a beef with ${n.name}`, 'beef'); }
    else { LN.moodAll(S, -3); S.weekReport.push(`${n.name} came out on top in your beef. Fans think you took the L.`); LN.news(S, `Fans say ${n.name} won the beef with ${S.artist.name}.`, 'beef'); }
  }
}
function npcSongDiss(S, n) { const s = { id: uid('s'), title: pick(['Clout Chaser', 'Who?', 'Ghostwriter', 'Receipts', 'Wrong One', 'Smoke', 'No Love Lost']), npc: n.id, feat: null, week: S.week, power: LN.npcPower(n.fame) * rnd(0.5, 1.3), q: clamp(55 + gauss() * 12, 20, 95), fam: n.fam, rw: LN.regW(n.fam, n.region), decay: 0.84, ch: {}, pts: 0 }; S.npcSongs.push(s); return s; }
function featureRequest(S) {
  const f = fame(S); const pool = S.npcs.filter(n => n.active && !n.hiatus && !n.rival && Math.abs(n.fame - f) < 18 && !n.own); if (!pool.length) return;
  const n = pick(pool); const fee = Math.round(1500 * Math.pow(1.065, f) / 100 * (n.fame > f ? 0.5 : 1)) * 100;
  LN.inbox(S, 'feature', `${n.name} wants you on a song`, `${n.name} (${D.GENRE[n.genre].name}) asked you to feature on their next single. They'll pay ${LN.money(fee)}. Costs 15 energy.`, { npc: n.id, fee }, 2);
}
function rivalDiss(S) { const r = S.npcs.filter(n => n.rival && n.active && !n.hiatus); if (!r.length || S.beef) return; const n = pick(r); const s = npcSongDiss(S, n); S.beef = { npc: n.id, start: S.week, mine: null, theirs: s.id, end: S.week + 6 };
  LN.inbox(S, 'beef', `${n.name} dissed you`, `${n.name} released "${s.title}", and everyone knows it's about you. You have 6 weeks to answer with a diss track that charts higher, or make peace.`, { npc: n.id }, 4); LN.news(S, `${n.name}'s new song "${s.title}" takes shots at ${S.artist.name}.`, 'beef'); }

// =====================================================================
// RANDOM EVENTS
// =====================================================================
LN.EVENTS = [
  { id: 'leak', cond: S => S.songs.filter(s => s.recorded && !s.rel).length >= 2, title: 'Your song leaked', text: S => { const s = pick(S.songs.filter(x => x.recorded && !x.rel)); S._ev = s.id; return `"${s.title}" leaked online. Fans love it, but now it's out without you.`; },
    ch: [['Rush-release it as a single', S => { const s = LN.song(S, S._ev); if (!s) return 'The leak fizzled out.'; const r = LN.createRelease(S, { type: 'single', title: s.title, songs: [s.id] }); return r.ok ? 'You turned the leak into a surprise release.' : r.msg; }],
      ['Scrap the song', S => { const s = LN.song(S, S._ev); if (s) s.leaked = true, s.q = Math.round(s.q * 0.7); LN.moodAll(S, -2); return 'You shelved it. Fans are disappointed.'; }]] },
  { id: 'wardrobe', cond: S => S.gigs > 3, title: 'Wardrobe malfunction', text: S => 'Your outfit ripped in the middle of a show and the clip is everywhere.',
    ch: [['Laugh about it online', S => { S.hype = clamp(S.hype + 8, 0, 100); LN.imageShift(S, 'messy', 3); return 'People love that you can laugh at yourself. Hype +8.'; }], ['Say nothing', S => { LN.imageShift(S, 'mysterious', 2); return 'It blew over in a few days.'; }]] },
  { id: 'sample', cond: S => S.songs.some(s => s.rel && s.revenue > 20000), title: 'Sample lawsuit', text: S => { const s = pick(S.songs.filter(x => x.rel && x.revenue > 20000)); S._ev = s.id; return `A songwriter claims "${s.title}" copies their melody and is suing for ${LN.money(Math.round(s.revenue * 0.3))}.`; },
    ch: [['Settle out of court', S => { const s = LN.song(S, S._ev); const c = Math.round((s ? s.revenue : 10000) * 0.3); LN.spend(S, 'legal', c); return `You paid ${LN.money(c)} and it went away.`; }],
      ['Fight it', S => { const s = LN.song(S, S._ev); const c = Math.round((s ? s.revenue : 10000) * 0.6); if (chance(0.5)) { LN.spend(S, 'legal', 15000); return 'You won in court. Legal fees: $15K.'; } LN.spend(S, 'legal', c); return `You lost and paid ${LN.money(c)}.`; }]] },
  { id: 'scandal', cond: S => LN.fame(S) > 25, title: 'Old posts resurfaced', text: S => 'Someone dug up embarrassing posts you made years ago. They are trending.',
    ch: [['Apologize right away', S => { const k = 0.5 + LN.teamPower(S, 'publicist') * 0.15; LN.moodAll(S, -4 * (1 - k)); return 'Most fans accepted the apology.'; }],
      ['Stay silent', S => { S.scandal = { w: S.week }; LN.moodAll(S, -6); LN.imageShift(S, 'mysterious', 3); return 'The silence made it worse. Consider a public apology post.'; }],
      ['Double down', S => { LN.moodAll(S, -10); LN.imageShift(S, 'edgy', 8); LN.imageShift(S, 'messy', 6); S.hype = clamp(S.hype + 15, 0, 100); return 'Everyone is talking about you, and not in a good way. Hype +15, fan mood -10.'; }]] },
  { id: 'paparazzi', cond: S => LN.fame(S) > 40, title: 'Paparazzi photos', text: S => 'Photographers caught you leaving a party at 4 a.m. looking rough.',
    ch: [['Own it', S => { LN.imageShift(S, 'messy', 6); S.hype = clamp(S.hype + 6, 0, 100); return 'Messy is a brand too.'; }], ['Hire better security ($20K)', S => { LN.spend(S, 'security', 20000); return 'It won\'t happen again.'; }]] },
  { id: 'charity_ask', cond: S => LN.fame(S) > 20, title: 'A fan asks for help', text: S => 'A fan\'s school music program is about to shut down. They tagged you asking for help. It would cost $25K.',
    ch: [['Pay for it', S => { if (S.money < 25000) return 'You couldn\'t afford it right now.'; LN.donate(S, 'Music education in schools', 25000); return 'You saved the program. Fans are emotional.'; }], ['Share the post', S => { LN.moodAll(S, 1); return 'Your fans raised some of the money.'; }]] },
  { id: 'ghost', cond: S => S.skills.write < 50 && LN.fame(S) > 30, title: 'Ghostwriter offer', text: S => 'A hitmaker offers to secretly write your next single for $30K. Nobody would know. Probably.',
    ch: [['Take the deal', S => { if (S.money < 30000) return 'You couldn\'t afford it.'; LN.spend(S, 'songwriting', 30000); const s = LN.makeSong(S, { title: LN.songTitle(), genre: S.artist.genre, mood: pick(D.MOODS), topic: pick(D.TOPICS.slice(0, 14)), tempo: 'up' }, 82); S.stats.songsWritten--; if (chance(0.25)) { S.scandal = { w: S.week }; LN.moodAll(S, -8); return `"${s.title}" is in your vault, but the story leaked. Fans feel lied to.`; } return `"${s.title}" is in your vault. It's great.`; }], ['Write your own', S => { LN.gainSkill(S, 'write', 2); return 'You decided to do the work. Songwriting +2.'; }]] },
  { id: 'injury', cond: S => S.stats.showsPlayed > 10, title: 'Vocal strain', text: S => 'Your voice is giving out. A doctor recommends two weeks of rest.',
    ch: [['Rest', S => { S.sick = 2; if (LN.isTouring(S)) S.tour.cancelNext = 2; return 'You rested. Your voice will thank you.'; }], ['Push through', S => { S.health = clamp(S.health - 15, 0, 100); if (chance(0.3)) { S.skills.vocals = clamp(S.skills.vocals - 4, 0, 100); return 'You pushed too hard and damaged your voice. Vocals -4.'; } return 'You got through it, barely.'; }]] },
  { id: 'remixreq', cond: S => S.songs.some(s => s.rel), title: 'Superstar remix request', text: S => { const n = pick(S.npcs.filter(n => n.active && n.fame > LN.fame(S))); S._ev = n ? n.id : null; return n ? `${n.name} heard your music and wants to jump on a remix.` : 'A big artist wants to remix your song.'; },
    ch: [['Do it', S => { const n = LN.npc(S, S._ev); const s = S.songs.filter(x => x.rel).sort((a, b) => b.pts - a.pts)[0]; if (!n || !s) return 'It fell through.'; s.boost = { reach: LN.npcPower(n.fame) * 0.3, until: S.week + 4 }; n.rel = clamp(n.rel + 15, -100, 100); return `${n.name} jumped on "${s.title}". It is getting a big push.`; }], ['Pass', S => 'You kept the song as it is.']] },
  { id: 'radio', cond: S => S.songs.some(s => s.rel && S.week - s.relWeek < 10), title: 'Radio payola', text: S => 'A shady promoter offers to get your song on the radio for $15K cash.',
    ch: [['Pay', S => { if (S.money < 15000) return 'You couldn\'t afford it.'; LN.spend(S, 'promotion', 15000); const s = S.songs.filter(x => x.rel).sort((a, b) => b.relWeek - a.relWeek)[0]; s.boost = { reach: 1.5e6, until: S.week + 4 }; if (chance(0.2)) { S.scandal = { w: S.week }; LN.moodAll(S, -6); return 'The song got spins, but a reporter found out.'; } return 'Your song is suddenly on every station.'; }], ['Refuse', S => { LN.imageShift(S, 'wholesome', 2); return 'You walked away.'; }]] },
  { id: 'fanart', cond: S => LN.totalFans(S) > 3000, title: 'Fan art goes viral', text: S => 'A fan drew you as a superhero and it went viral.',
    ch: [['Repost it with love', S => { LN.moodAll(S, 4); S.hype = clamp(S.hype + 4, 0, 100); return 'The fan is crying. So are you.'; }], ['Turn it into merch (pay the artist)', S => { LN.spend(S, 'merch', 2000); S.merch.push({ id: uid('m'), item: 'tee', name: 'Fan art t-shirt', color: '#2e8bff', print: 'Fan art', price: 32, stock: 800, sold: 0, w: S.week }); LN.moodAll(S, 3); return '800 fan-art shirts are on sale.'; }]] },
  { id: 'cheapgig', cond: S => LN.fame(S) < 30, title: 'Wedding gig', text: S => 'A stranger offers you $1,500 to sing at their wedding this weekend.',
    ch: [['Take it', S => { if (S.energy < 15) return 'You were too tired to go.'; S.energy -= 15; LN.earn(S, 'shows', 1500); LN.gainSkill(S, 'perf', 1); return 'You made $1.5K and a couple very happy.'; }], ['Decline', S => 'You kept the weekend free.']] },
  { id: 'labelpoach', cond: S => !!S.label && LN.fame(S) > 40, title: 'Another label is calling', text: S => 'A rival label says they would pay your buyout if you jump ship, but your current label would be furious.',
    ch: [['Stay loyal', S => { S.label.sat = clamp(S.label.sat + 10, 0, 100); return 'Your label appreciated the loyalty.'; }], ['Hear them out', S => { const L = pick(D.LABELS.filter(l => l.id !== S.label.id && l.minFame <= LN.fame(S))); if (!L) return 'They went quiet.'; S.label.sat -= 15; LN.labelOffer(S, L); return `${L.name} sent an offer to your inbox. Your current label is not happy.`; }]] },
  { id: 'reunion', cond: S => S.week > 104, title: 'Old friends', text: S => 'Your high school friends want you to play a hometown show for free.',
    ch: [['Do it', S => { if (S.energy < 20) return 'You were too tired, and they understood.'; S.energy -= 20; LN.addFans(S, 2000 + LN.totalFans(S) * 0.01, S.artist.region); LN.moodAll(S, 3); return 'It was the best night of the year.'; }], ['Not this time', S => 'Maybe next year.']] },
  { id: 'stalker', cond: S => LN.fame(S) > 55, title: 'Overzealous fan', text: S => 'A fan showed up at your house. You are shaken.',
    ch: [['Hire security ($50K)', S => { LN.spend(S, 'security', 50000); S.stress = clamp(S.stress - 10, 0, 100); return 'You feel safer.'; }], ['Move on', S => { S.stress = clamp(S.stress + 15, 0, 100); return 'You tried to forget about it. Stress +15.'; }]] },
  { id: 'ai', cond: S => LN.fame(S) > 35, title: 'AI clone', text: S => 'Someone made an AI song using your voice and it is climbing the charts.',
    ch: [['Send lawyers ($10K)', S => { LN.spend(S, 'legal', 10000); return 'It was taken down.'; }], ['Ignore it', S => { LN.moodAll(S, -2); return 'Fans are confused about which songs are really you.'; }], ['Embrace it as a remix', S => { S.hype = clamp(S.hype + 8, 0, 100); LN.imageShift(S, 'edgy', 3); return 'You leaned in. People are fascinated.'; }]] },
  { id: 'gift', cond: S => LN.fame(S) > 15, title: 'Gear endorsement', text: S => 'A gear company sent you free equipment for your home studio.',
    ch: [['Thank them publicly', S => { LN.gainSkill(S, 'prod', 2); LN.earn(S, 'brands', 2000); return 'Production +2 and $2K for the shout-out.'; }]] },
  { id: 'tax', cond: S => S.stats.earned > 200000, title: 'Audit', text: S => 'The tax office is auditing you.',
    ch: [['Hire an accountant ($8K)', S => { LN.spend(S, 'legal', 8000); return 'Everything checked out.'; }], ['Handle it yourself', S => { if (chance(0.4)) { const c = Math.round(S.stats.earned * 0.02); LN.spend(S, 'taxes', c); return `You missed something and owe ${LN.money(c)}.`; } return 'You somehow got through it.'; }]] },
];
function randomEvent(S) {
  const pool = LN.EVENTS.filter(e => { try { return e.cond(S) && !(S.flags.ev && S.flags.ev[e.id] > S.week - 30); } catch (x) { return false; } }); if (!pool.length) return;
  const e = pick(pool); S.flags.ev = S.flags.ev || {}; S.flags.ev[e.id] = S.week; S._ev = null;
  const text = e.text(S); LN.inbox(S, 'event', e.title, text, { ev: e.id, ref: S._ev }, 2);
}

// =====================================================================
// INBOX RESPONSES
// =====================================================================
LN.respond = function (S, itemId, choice) {
  const it = S.inbox.find(i => i.id === itemId); if (!it) return { ok: false, msg: 'That has expired.' };
  const drop = () => { S.inbox = S.inbox.filter(i => i.id !== itemId); };
  const d = it.data;
  if (choice === 'decline') { drop(); if (it.kind === 'feature') { const n = LN.npc(S, d.npc); if (n) n.rel -= 3; } return { ok: true, msg: 'Declined.' }; }
  switch (it.kind) {
    case 'event': { const e = LN.EVENTS.find(x => x.id === d.ev); drop(); if (!e) return { ok: true, msg: '' }; S._ev = d.ref; const c = e.ch[choice] || e.ch[0]; const msg = c[1](S); return { ok: true, msg }; }
    case 'feature': {
      if (!LN.useEnergy(S, 15)) return { ok: false, msg: 'You need 15 energy to record a feature.' };
      drop(); const n = LN.npc(S, d.npc); if (!n) return { ok: false, msg: 'They went quiet.' };
      const s = { id: uid('s'), title: LN.songTitle(), npc: n.id, feat: 'P', week: S.week, power: LN.npcPower(n.fame) * rnd(0.7, 1.4) * 1.2 + Math.sqrt(LN.totalFans(S)) * 800, q: clamp(55 + S.skills.vocals * 0.3 + gauss() * 8, 20, 98), fam: n.fam, rw: LN.regW(n.fam, n.region), decay: 0.87, ch: {}, pts: 0 };
      S.npcSongs.push(s); n.rel = clamp(n.rel + 15, -100, 100); LN.earn(S, 'features', d.fee); S.flags.feature = 1; if (n.real && n.fame >= 80) S.flags.collabReal = 1;
      LN.news(S, `${n.name} released "${s.title}" featuring ${S.artist.name}.`, 'you');
      return { ok: true, msg: `You recorded a verse for ${n.name}'s "${s.title}". It is out this week. +${LN.money(d.fee)}.` };
    }
    case 'festival': drop(); S.bookings.push({ kind: 'festival', week: d.week, fest: d.fest, region: d.region, slot: d.slot, fee: d.fee }); return { ok: true, msg: `Booked for ${d.fest} on ${LN.dateLabel(S, d.week)}.` };
    case 'brand': { drop(); const mgr = S.team.manager ? D.TEAM.manager.tiers[S.team.manager - 1].cut : 0; LN.earn(S, 'brands', d.pay * (1 - mgr)); S.deals.push({ brand: d.brand, until: S.week + 26 }); LN.imageShift(S, d.fit, 6);
      if (LN.imageTop(S) !== d.fit) LN.moodAll(S, -3); S.flags.brand = 1; LN.timeline(S, `Signed a deal with ${d.brand}`, 'deal'); return { ok: true, msg: `You signed with ${d.brand} for ${LN.money(d.pay * (1 - mgr))}.` }; }
    case 'beef': { if (choice === 'peace') { drop(); return LN.makePeace(S, d.npc); } drop(); return { ok: true, msg: 'Write a song with the topic "Diss track" aimed at them in the Studio and release it within 6 weeks.' }; }
    case 'label': if (choice === 'accept') { drop(); return LN.signLabel(S, d.label, d); } return { ok: true, ui: 'negotiate' };
    default: return { ok: true, ui: it.kind };
  }
};

// =====================================================================
// AWARDS
// =====================================================================
const npcFans = f => LN.npcFans(f);
function nominate(S, show) {
  const A = D.AWARD_SHOWS[show]; const win = S.week - 52; const key = show + LN.year(S);
  const songs = [], albums = [], videos = [], artists = [];
  for (const s of S.songs) if (s.rel && s.relWeek > win && !s.isRemix && !s.live) songs.push({ t: s.title, ar: S.artist.name, P: true, sc: (s.pts || 0) * Math.pow(s.q / 70, 2), q: s.q, ref: s.id });
  for (const s of S.npcSongs) if (s.week > win && s.npc) songs.push({ t: s.title, ar: LN.artistName(S, s.npc), P: false, sc: (s.pts || 0) * Math.pow(s.q / 70, 2), q: s.q, npc: s.npc });
  for (const r of S.releases) if (r.out && r.week > win && ['album', 'ep', 'joint', 'live'].includes(r.type) && !r.reRecord) albums.push({ t: r.title, ar: S.artist.name, P: true, sc: ((r.pts || 0) + sum(r.songs.map(id => (LN.song(S, id) || {}).pts || 0)) * 0.2) * Math.pow((r.score || 5) / 7, 2.5), fam: (LN.song(S, r.songs[0]) || {}).fam, ref: r.id });
  for (const a of S.npcAlbums) if (a.week > win) albums.push({ t: a.title, ar: LN.artistName(S, a.npc), P: false, sc: (a.pts || 0) * Math.pow(a.q / 70, 2.5), fam: a.fam, npc: a.npc });
  const fam = D.GENRE[S.artist.genre].fam;
  const top = (arr, n = 5) => { const seen = new Set(); return arr.map(x => Object.assign({}, x, { r: x.sc * rnd(0.7, 1.3) })).sort((a, b) => b.r - a.r).filter(x => { const k = x.t + x.ar; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, n); };
  const cats = [];
  if (show === 'main') {
    cats.push({ name: 'Record of the Year', noms: top(songs) }, { name: 'Album of the Year', noms: top(albums) }, { name: 'Song of the Year', noms: top(songs.map(x => Object.assign({}, x, { sc: x.sc * Math.pow(x.q / 70, 2) }))) });
    const newArts = S.npcs.filter(n => n.active && !n.real && S.week - n.debut < 80 && n.debut > 0).map(n => ({ t: n.name, ar: D.GENRE[n.genre].name, P: false, sc: npcFans(n.fame) / 1000, npc: n.id }));
    const firstRel = Math.min(...S.releases.filter(r => r.out).map(r => r.week));
    if (isFinite(firstRel) && firstRel > win - 26 && !S.flags.bnaDone) newArts.push({ t: S.artist.name, ar: D.GENRE[S.artist.genre].name, P: true, sc: LN.totalFans(S) / 1000 * 1.2 });
    while (newArts.length < 5) { const n = pick(S.npcs.filter(x => !x.real && x.active)); newArts.push({ t: n.name, ar: D.GENRE[n.genre].name, P: false, sc: npcFans(n.fame) / 2000, npc: n.id }); }
    cats.push({ name: 'Best New Artist', noms: top(newArts) });
    cats.push({ name: `Best ${D.FAMILY_NAME[fam]} Album`, noms: top(albums.filter(a => a.fam === fam)) });
  } else if (show === 'video') {
    for (const v of S.videos) if (v.week > win) videos.push({ t: v.title, ar: S.artist.name, P: true, sc: v.views / 1e5 * Math.pow(v.q / 60, 2), q: v.q, dir: v.director, ref: v.id });
    for (const s of S.npcSongs) if (s.week > win && s.pts > 300) videos.push({ t: s.title, ar: LN.artistName(S, s.npc), P: false, sc: s.pts * rnd(0.3, 1.2) * 0.4, q: s.q });
    cats.push({ name: 'Video of the Year', noms: top(videos) }, { name: 'Best Direction', noms: top(videos.map(x => Object.assign({}, x, { sc: x.sc * Math.pow((x.q || 60) / 60, 3) }))) });
    const arts = S.npcs.filter(n => n.active && !n.hiatus).map(n => ({ t: n.name, ar: D.GENRE[n.genre].name, P: false, sc: npcFans(n.fame) / 1000 }));
    arts.push({ t: S.artist.name, ar: D.GENRE[S.artist.genre].name, P: true, sc: LN.totalFans(S) / 1000 * (1 + S.hype / 100) });
    cats.push({ name: 'Artist of the Year', noms: top(arts) });
  } else {
    const arts = S.npcs.filter(n => n.active && !n.hiatus).map(n => ({ t: n.name, ar: D.GENRE[n.genre].name, P: false, sc: npcFans(n.fame) / 1000 }));
    arts.push({ t: S.artist.name, ar: D.GENRE[S.artist.genre].name, P: true, sc: LN.totalFans(S) / 1000 * (1 + S.fanClub / 100) });
    cats.push({ name: 'Favorite Artist', noms: top(arts) }, { name: 'Favorite Song', noms: top(songs) });
    const fd = S.npcs.filter(n => n.active && n.fame > 60).map(n => ({ t: `${n.name} fans`, ar: n.name, P: false, sc: npcFans(n.fame) / 1000 }));
    if (S.fandom) fd.push({ t: S.fandom, ar: S.artist.name, P: true, sc: LN.totalFans(S) / 1000 * (1 + S.fanClub / 60) });
    cats.push({ name: 'Favorite Fandom', noms: top(fd) });
  }
  const valid = cats.filter(c => c.noms.length >= 2);
  const sh = { key, show, name: A.name, year: LN.year(S), week: S.week + ((A.week - LN.wk(S) + 52) % 52), cats: valid, held: false, watched: false };
  S.shows_[key] = sh;
  const mine = []; valid.forEach(c => c.noms.forEach(n => { if (n.P) mine.push(c.name); }));
  if (mine.length) { S.flags.nom = 1; LN.legacy(S, mine.length * 8); S.weekReport.push(`${A.name} nominations are out: you're nominated for ${mine.join(', ')}!`); LN.news(S, `${S.artist.name} earned ${mine.length} nomination${mine.length > 1 ? 's' : ''} at the ${A.name}.`, 'you');
    S.awards.push({ show: A.name, year: sh.year, nominated: mine, won: [] });
    if (fame(S) > 35) LN.inbox(S, 'awardperf', `Perform at the ${A.name}?`, `The producers want you to perform at the ceremony. It's a huge audience.`, { show: A.name }, (sh.week - S.week) - 1);
  } else LN.news(S, `${A.name} nominations announced.`, 'awards');
}
function ceremony(S, show, events) {
  const A = D.AWARD_SHOWS[show]; const sh = Object.values(S.shows_).find(x => x.show === show && !x.held && x.week <= S.week); if (!sh) return;
  sh.held = true; const won = [];
  for (const c of sh.cats) {
    const crit = show === 'main' ? 1.6 : 1.2; const w = c.noms.map(n => Math.pow(Math.max(0.01, n.sc), crit) * rnd(0.6, 1.4) * (n.P ? LN.DIFF[S.diff].luck : 1));
    let b = 0; w.forEach((x, i) => { if (x > w[b]) b = i; }); c.win = b; if (c.noms[b].P) won.push(c.name);
    if (c.name === 'Best New Artist' && c.noms.some(n => n.P)) S.flags.bnaDone = 1;
  }
  const entry = S.awards.find(a => a.show === A.name && a.year === sh.year);
  if (won.length) { if (entry) entry.won = won; S.flags.awardWin = 1; if (won.includes('Album of the Year')) S.flags.aoty = 1; LN.legacy(S, won.length * 40); S.hype = clamp(S.hype + 10 * won.length, 0, 100); LN.addFans(S, (15000 + Math.sqrt(LN.totalFans(S)) * 40) * won.length);
    LN.timeline(S, `Won ${won.join(', ')} at the ${A.name}`, 'award'); LN.news(S, `${S.artist.name} won ${won.length > 1 ? won.length + ' awards' : won[0]} at the ${A.name}.`, 'you'); }
  const top = sh.cats[0]; if (top) LN.news(S, `${top.noms[top.win].ar} took ${top.name} at the ${A.name}.`, 'awards');
  events.push({ kind: 'ceremony', key: sh.key, title: A.name, text: won.length ? `You won ${won.join(', ')}!` : (entry ? 'You were nominated but went home empty-handed this time.' : 'The ceremony happened tonight.') });
}
function awardsWeek(S, events) {
  const wk = LN.wk(S);
  for (const k in D.AWARD_SHOWS) { const A = D.AWARD_SHOWS[k]; if (wk === A.nomWeek && S.week > 20) nominate(S, k); if (wk === A.week) ceremony(S, k, events); }
}

// =====================================================================
// WEEKLY HOOKS
// =====================================================================
LN.systemsWeekPre = function (S, events) {
  tourWeek(S, events); bookingsWeek(S, events); movieWeek(S, events);
};
LN.systemsWeekPost = function (S, events) {
  labelWeek(S, events); looprWeek(S); playlistWeek(S); videoWeek(S); beefWeek(S); awardsWeek(S, events); festivalOffers(S);
  const f = fame(S); const L = LN.DIFF[S.diff].luck; const mp = LN.teamPower(S, 'manager'), ap = LN.teamPower(S, 'agent'), pp = LN.teamPower(S, 'publicist');
  const has = k => S.inbox.some(i => i.kind === k);
  if (!S.label && !has('label') && chance(0.04 + mp * 0.02) ) { const ok = D.LABELS.filter(l => f >= l.minFame - 4 && (!l.fam || l.fam === D.GENRE[S.artist.genre].fam || chance(0.3))); if (ok.length) LN.labelOffer(S, pick(ok)); }
  if (f > 8 && !has('feature') && chance(0.05 + f / 700)) featureRequest(S);
  if (!has('talkshow') && chance((0.03 + pp * 0.02) * L)) { const sh = D.TALKSHOWS.filter(t => f >= t.minFame); if (sh.length) { const t = pick(sh); LN.inbox(S, 'talkshow', `${t.name} invited you`, 'They want you on the show this week. Costs 15 energy. Your answers shape your image.', { show: t.name }, 1); } }
  const charting = S.songs.filter(s => s.rel && Object.values(s.ch || {}).some(m => m.peak <= 40) && S.week - s.relWeek < 20);
  if (charting.length && !has('tv') && chance(0.07 + ap * 0.02)) LN.inbox(S, 'tv', `${pick(D.TV_PERF)} wants a performance`, 'Perform one of your songs live on TV for a streaming bump. Costs 20 energy.', { show: pick(D.TV_PERF) }, 2);
  if (f >= 30 && !S.movie && !has('movie') && chance(0.02 + ap * 0.015)) movieOffer(S);
  if (f >= 28 && !has('brand') && chance(0.035 + mp * 0.01)) brandOffer(S);
  if (S.week > 2 && chance(0.16)) randomEvent(S);
  if (S.week > 10 && chance(0.02)) rivalDiss(S);
  // NPC chatter on the feed
  for (let i = 0; i < 2; i++) { const s = pick(S.npcSongs.filter(x => S.week - x.week < 2)); if (s && chance(0.6)) { const n = LN.npc(S, s.npc); if (n) LN.feedPost(S, n.id, pick([`"${s.title}" out now.`, `New one. "${s.title}". Turn it up.`, `"${s.title}" is yours now. 🖤`, `Made this one for the late nights. "${s.title}"`]), Math.round(s.power / 300)); } }
  // vault songs rot and can leak
  // fan club milestone
  if (!S.fandom && LN.totalFans(S) >= 5000 && !S.flags.fandomAsk) { S.flags.fandomAsk = 1; S.weekReport.push('Your fans want a name. Name your fandom on the Social tab.'); }
  // own label prospects
};

// =====================================================================
// YEAR END
// =====================================================================
LN.newYear = function (S, events) {
  S.artist.age++;
  const y = LN.year(S) - 1; const T = S.yearTally || { s: {}, a: {} };
  const ys = Object.values(T.s).sort((a, b) => b.v - a.v).slice(0, 25); const ya = Object.values(T.a).sort((a, b) => b.v - a.v).slice(0, 25);
  S.yearEnd.unshift({ year: y, s: ys.map(x => ({ t: x.t, ar: x.ar, P: x.P })), a: ya.map(x => ({ t: x.t, ar: x.ar, P: x.P })) }); if (S.yearEnd.length > 30) S.yearEnd.length = 30;
  S.yearTally = { s: {}, a: {} };
  const mineS = ys.findIndex(x => x.P), mineA = ya.findIndex(x => x.P);
  // taxes
  const t = Math.max(0, S.taxable); const tax = Math.round(Math.min(t, 50000) * 0.1 + Math.max(0, Math.min(t, 500000) - 50000) * 0.25 + Math.max(0, t - 500000) * 0.37);
  S.taxable = 0; if (tax > 0) { S.money -= tax; S.ledger.taxes = (S.ledger.taxes || 0) - tax; }
  if (S.artist.age > 60) S.health = clamp(S.health - 3, 0, 100);
  if (S.week >= 520) S.flags.decade = 1;
  LN.legacy(S, 2);
  // Hall of Fame
  if (!S.hof && LN.careerYears(S) >= 10 && S.legacy >= LN.HOF_SCORE) { S.hof = true; LN.timeline(S, 'Inducted into the Hall of Fame', 'award'); LN.news(S, `${S.artist.name} will be inducted into the Hall of Fame.`, 'you'); events.push({ kind: 'note', title: 'Hall of Fame', text: `After ${LN.careerYears(S)} years, ${S.artist.name} is going into the Hall of Fame.` }); }
  events.push({ kind: 'year', title: `${y} in review`, year: y, tax, text: `${mineS >= 0 ? `Your best song finished #${mineS + 1} on the year-end chart. ` : ''}${mineA >= 0 ? `Your best album finished #${mineA + 1}. ` : ''}You paid ${LN.money(tax)} in taxes.` });
};
LN.HOF_SCORE = 1500;
LN.retire = function (S) {
  S.retired = true; S.retiredWeek = S.week;
  if (!S.hof && LN.careerYears(S) >= 10 && S.legacy >= LN.HOF_SCORE) S.hof = true;
  LN.timeline(S, `${S.artist.name} retired from music`, 'end'); LN.news(S, `${S.artist.name} announced their retirement.`, 'you');
  return { ok: true };
};

// =====================================================================
// ACHIEVEMENTS
// =====================================================================
const anyPeak = (S, test, types = ['s']) => S.songs.concat(S.releases).some(o => Object.entries(o.ch || {}).some(([k, m]) => types.some(t => k.endsWith(t) && !(t === 's' && k.endsWith('st'))) && test(m.peak)));
LN.ACH_TEST = {
  first_song: S => S.stats.songsWritten > 0, first_record: S => S.songs.some(s => s.recorded && !s.buzz) || S.songs.filter(s => s.recorded).length > 1,
  first_release: S => S.releases.some(r => r.out), first_gig: S => S.gigs > 0,
  fans_1k: S => LN.totalFans(S) >= 1e3, fans_100k: S => LN.totalFans(S) >= 1e5, fans_1m: S => LN.totalFans(S) >= 1e6, fans_10m: S => LN.totalFans(S) >= 1e7, fans_100m: S => LN.totalFans(S) >= 1e8,
  chart_any: S => anyPeak(S, p => p <= 100, ['s', 'a', 'st']), top40: S => anyPeak(S, p => p <= 40), top10: S => anyPeak(S, p => p <= 10), no1: S => anyPeak(S, p => p === 1, ['s', 'a', 'st']),
  no1_all: S => D.REGION_IDS.every(r => S.flags['no1_' + r]), album_no1: S => S.releases.some(r => Object.entries(r.ch || {}).some(([k, m]) => k.endsWith('a') && m.debut === 1)),
  gold: S => (S.flags.cert || 0) >= 1, platinum: S => (S.flags.cert || 0) >= 2, diamond: S => (S.flags.cert || 0) >= 6,
  first_ep: S => S.releases.some(r => r.out && r.type === 'ep'), first_album: S => S.releases.some(r => r.out && (r.type === 'album' || r.type === 'joint')),
  five_albums: S => S.releases.filter(r => r.out && (r.type === 'album' || r.type === 'joint') && !r.reRecord).length >= 5, review_9: S => S.releases.some(r => r.score >= 9),
  signed: S => !!S.flags.signed, own_label: S => !!S.ownLabel, masters: S => S.releases.filter(r => r.out).length >= 3 && S.releases.filter(r => r.out).every(r => !r.masters || r.masters === 'artist'),
  viral: S => !!S.flags.viral, playlist: S => !!S.flags.playlist, video: S => S.videos.length > 0, video_100m: S => S.stats.maxViews >= 1e8,
  tour: S => !!S.flags.tourDone, arena: S => !!S.flags.arena, stadium: S => !!S.flags.stadium, festival_head: S => !!S.flags.festHead, talkshow: S => !!S.flags.talkshow,
  award_nom: S => !!S.flags.nom, award_win: S => !!S.flags.awardWin, award_aoty: S => !!S.flags.aoty, movie: S => !!S.flags.movie, movie_hit: S => !!S.flags.movieHit,
  millionaire: S => S.money >= 1e6, billionaire: S => LN.netWorth(S) >= 1e9, mansion: S => !!S.flags.mansion, brand: S => !!S.flags.brand, feature: S => !!S.flags.feature,
  collab_real: S => !!S.flags.collabReal || S.songs.some(s => s.rel && s.feat && (LN.npc(S, s.feat) || {}).real && (LN.npc(S, s.feat) || {}).fame >= 80), beef_win: S => !!S.flags.beefWin,
  charity: S => S.charity >= 100000, decade: S => !!S.flags.decade, hof: S => !!S.hof,
};
LN.checkAchievements = function (S) {
  const got = [];
  for (const [id, name] of D.ACHIEVEMENTS) { if (S.achievements[id] != null) continue; const t = LN.ACH_TEST[id]; try { if (t && t(S)) { S.achievements[id] = S.week; got.push(name); LN.legacy(S, 1); } } catch (e) { } }
  return got;
};

// tutorial
LN.TUT = [
  { step: 0, text: 'Write your first song. Open the Studio tab and tap Write a song.', done: S => S.stats.songsWritten > 0 && S.songs.some(s => !s.buzz) },
  { step: 1, text: 'Record it. In the Studio, find the song in your vault and tap Record.', done: S => S.songs.some(s => s.recorded && !s.buzz) },
  { step: 2, text: 'Release it as a single. In the Studio, tap New release.', done: S => S.releases.length > 0 },
  { step: 3, text: 'Tell your fans. On the Social tab, make a post.', done: S => S.stats.posts > 0 },
  { step: 4, text: 'Press End week on the Home tab to see your first chart results.', done: S => S.week > 0 },
];
LN.tutorial = S => { while (S.flags.tut < LN.TUT.length && LN.TUT[S.flags.tut].done(S)) S.flags.tut++; return S.flags.tut < LN.TUT.length ? LN.TUT[S.flags.tut] : null; };
})(typeof window !== 'undefined' ? window : globalThis);
