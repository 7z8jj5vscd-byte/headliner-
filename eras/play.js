/* The Eras Life: new things to play (engine side).
   - Concert mini-game: tap along on show night; good timing lifts the review.
   - Show builder: acts with their own effects and costume changes.
   - Merch designer: items you design sell at shows and online.
   - Loop: an invented short-video and streaming app with trends, playlists and a streaming chart.
   - Your own artist: a fully invented career from the first open mic.
   Everything here is invented and labelled. Real chart and tour anchors are unchanged. */
(function () {
const ER = window.ER, G = window.G;
const S = () => G.S(), pick = G.pick, rnd = G.rnd, clamp = G.clamp;

/* ---------- Show nights: the mini-game and the show's acts ---------- */
G.EFFECTS = [['pyro','Fireworks and flames'], ['rain','Rain on stage'], ['catwalk','A runway into the crowd'], ['piano','A piano that rises up'], ['fly','A flying platform'], ['confetti','Confetti'], ['lights','A sea of wristband lights'], ['acoustic','A stripped-back moment']];
G.actScore = function (acts) { if (!acts || !acts.length) return 0; const n = acts.length, fx = acts.map(a => a.fx).filter(Boolean);
  let b = 0; if (n >= 4 && n <= 10) b += .15; b += Math.min(.25, new Set(fx).size * .05);
  if (acts.every((a, i) => !i || a.fx !== acts[i - 1].fx)) b += .1; const ch = acts.filter(a => a.change).length; if (ch >= 2 && ch <= n - 1) b += .15; if (ch > n - 1) b -= .1;
  return clamp(b, 0, .65); };
const show0 = G.showNight;
G.showNight = function (sh, openerId, picks, mi) {
  const s = S(), tr = (s.pj[sh.pid] || {}).tour || {}, acts = tr.design && tr.design.actList;
  const bonus = (sh.rhythm != null ? (sh.rhythm - .5) * 1.6 : 0) + G.actScore(acts);
  const g0 = s.gearShow; s.gearShow = (g0 || 0) + bonus;
  try { const r = show0.apply(this, arguments); if (sh.rhythm != null) r.rhythm = sh.rhythm; return r; } finally { s.gearShow = g0; }
};

/* ---------- Merch ---------- */
G.MERCH = [{ id:'tee', n:'T-shirt', cost:.15 }, { id:'hoodie', n:'Hoodie', cost:.3 }, { id:'poster', n:'Poster', cost:.08 }, { id:'vinyl', n:'Coloured vinyl', cost:.4 }, { id:'tote', n:'Tote bag', cost:.1 }, { id:'bracelet', n:'Bracelet kit', cost:.06 }];
G.merchScore = function (d) { const e = G.currentEra(); let sc = 50;
  if (e && d.c1 && e.color && d.c1.toLowerCase() === String(e.color).toLowerCase()) sc += 12;
  if (d.c1 && d.c2 && d.c1 !== d.c2) sc += 8; if (d.text && d.text.length > 0 && d.text.length <= 18) sc += 8; if (d.sym && d.sym !== 'none') sc += 6;
  if (d.item === 'vinyl' || d.item === 'bracelet') sc += 6; return clamp(Math.round(sc + rnd(-6, 6)), 10, 99); };
G.addMerch = function (d) { const s = S(), it = G.MERCH.find(x => x.id === d.item); if (!it) return { err:'Pick an item.' };
  s.merch = s.merch || []; if (s.merch.length >= 8) return { err:'Your merch table is full. Retire an item first.' };
  const cost = Math.round(G.payScale() * it.cost); if (s.stats.money < cost) return { err:`Making the first run costs ${G.fmtM(cost)}.` };
  s.stats.money -= cost; const m = Object.assign({ id:G.uid(), abs:s.abs, score:G.merchScore(d), sold:0, made:cost }, d); s.merch.push(m);
  G.journalAdd(`New merch: ${it.n}`, d.text ? `"${d.text}"` : 'A new design for the table.'); return { ok:true, m }; };
G.retireMerch = id => { const s = S(); s.merch = (s.merch || []).filter(m => m.id !== id); };
G.hooks.week.push(() => { const s = S(); if (!s.merch || !s.merch.length || s.flags.retired) return; const touring = G.active().some(x => x.st === 'tour');
  let earn = 0; s.merch.forEach(m => { const it = G.MERCH.find(x => x.id === m.item) || { cost:.1 }, age = (s.abs - m.abs) / 52;
    const units = Math.round(Math.pow(Math.max(10, s.stats.fans), .62) * (m.score / 60) * (touring ? 3 : .5) * Math.max(.2, 1 - age / 4) * (s.merchName ? 1.1 : 1));
    m.sold += units; earn += units * (8 + it.cost * 60); });
  s.stats.money += Math.round(earn * .45); s.merchWeek = Math.round(earn * .45); });

/* ---------- Loop: an invented streaming and short-video app ---------- */
G.loopOn = () => { const s = S(); return !!s && (s.flags.free || ER.yw(s.abs).y >= 2012); };
G.hooks.week.push(a => { const s = S(); if (!G.loopOn() || s.flags.retired) return; const L = s.loop = s.loop || { total:{}, wk:{}, playlist:{}, trend:null, pitched:0 };
  const songs = Object.keys(s.songs).filter(t => s.songs[t].st === 'released'); if (!songs.length) return;
  const daily = s.image && s.image.social === 'daily';
  if ((!L.trend || L.trend.until < a) && Math.random() < (daily ? .045 : .03)) { const t = pick(songs); L.trend = { t, until:a + 3, abs:a }; G.applyFx({ fans:.8, heat:2 }); G.inbox('fans', `"${t}" is trending on Loop`, 'A sound from your song is everywhere on Loop, the invented short-video app in this game.'); }
  const wk = {}; let total = 0;
  songs.forEach(t => { const so = s.songs[t], age = Math.max(0, a - (so.relAbs || so.rabs || so.abs || a));
    let v = s.stats.fans * .0006 * Math.pow(so.q / 70, 2) * (Math.exp(-age / 70) + .08) * rnd(.85, 1.15);
    if (L.trend && L.trend.t === t && L.trend.until >= a) v *= 6; if (L.playlist[t] && L.playlist[t] >= a) v *= 2; if (so.version) v *= .4;
    v = Math.round(v); wk[t] = v; L.total[t] = (L.total[t] || 0) + v; total += v; });
  L.wk = wk; L.weekTotal = total; s.stats.money += Math.round(total * .003 * (s.stats.own >= 30 ? 1.4 : 1)); });
G.loopChart = function () { const s = S(), L = s.loop; if (!L || !L.wk) return [];
  const mine = Object.keys(L.wk).map(t => ({ t, by:G.art().name, v:L.wk[t], you:true, trend:L.trend && L.trend.t === t && L.trend.until >= s.abs }));
  const r = ER.seeded('loop' + s.abs), top = mine.reduce((m, x) => Math.max(m, x.v), 1);
  const rivals = ER.RIVAL_STARS.map((n, i) => ({ t:`${(ER.TITLE_WORDS.a || ['Golden'])[Math.floor(r() * (ER.TITLE_WORDS.a || ['x']).length)]} ${(ER.TITLE_WORDS.b || ['Hour'])[Math.floor(r() * (ER.TITLE_WORDS.b || ['x']).length)]}`, by:n, v:Math.round(top * (.35 + r() * .9)), rival:true }));
  return mine.concat(rivals).sort((x, y) => y.v - x.v).slice(0, 10); };
G.canPitch = () => { const s = S(); return G.loopOn() && (!s.loop || s.abs - (s.loop.pitched || 0) >= 4); };
G.pitch = function (t) { const s = S(); if (!G.canPitch()) return { err:'You pitched a song recently. Try again in a few weeks.' }; if (!G.canSpend(1)) return { err:'No Time Blocks left.' };
  const so = s.songs[t]; if (!so || so.st !== 'released') return { err:'Pick a released song.' };
  s.loop = s.loop || { total:{}, wk:{}, playlist:{}, trend:null, pitched:0 }; s.week.used++;
  const ok = Math.random() < clamp(.35 + so.q / 200 + s.stats.clout / 300, .2, .9); s.loop.pitched = s.abs;
  if (ok) { s.loop.playlist[t] = s.abs + 6; return { ok:true, msg:`"${t}" lands on a big Loop playlist for six weeks.` }; }
  return { ok:true, msg:'The playlist editors passed this time.' }; };

/* ---------- Your own artist ---------- */
G.GENRES = [['pop','Pop',45], ['country','Country',10], ['rock','Rock',70], ['rnb','R&B',40], ['indie','Indie',80], ['folk','Folk',20]];
G.createArtist = function (o) {
  const name = String(o.name || '').trim().slice(0, 40) || 'New Artist', id = 'own_' + G.uid(), g = G.GENRES.find(x => x[0] === o.genre) || G.GENRES[0];
  const start = G.FREE_START;
  const def = { id, name, fanName:String(o.fanName || '').trim().slice(0, 30) || 'Fans', born:start - (o.age || 18) * 52, startAbs:start, projects:[], events:[], people:[], home:String(o.home || '').slice(0, 40),
    cowriters:{ Solo:{ bonus:0, note:'Your own ideas.' } }, genreLabels:['Country','Pop','Alternative'], prologue:[], invented:true, own:true, color:o.color || '#e88fb4',
    tabUnlock:{ week:0, life:0, songbook:0, studio:0, rollout:0, cover:0, tour:0, inbox:0, eggs:0, fandom:0, press:0, charts:0, legacy:0, town:0 } };
  ER.artists[id] = def;
  if (o.hair || o.skin) { ER.FREE_LOOK = ER.FREE_LOOK || {}; ER.FREE_LOOK[id] = { skin:o.skin || '#f1c9a5', hairs:[o.hair || '#6b3e26'], eyes:'#3a2a20', brow:'#4a3020' }; def.freeLook = ER.FREE_LOOK[id]; }
  G.newGame({ artist:id, mode:'story', diff:o.diff || 'standard', slot:o.slot || 1, look:o.look, fr:'sandbox' });
  const s = S(); s.genArtist = def; s.flags.free = true; s.stats.genre = g[2]; s.stats.fans = 60; s.stats.money = 1500; s.stats.write = 18;
  G.inbox('family', `${name} begins`, `${def.home ? `From ${def.home}. ` : ''}A fully invented career, from the first open mic. Play gigs in Town, write in your notebook, and your label will pitch a first album when you are ready.`);
  s.breakUntil = s.abs + 12;
  return s; };
G.hooks.load.push(s => { if (s.genArtist && !ER.artists[s.artist]) { ER.artists[s.artist] = s.genArtist; if (s.genArtist.freeLook) { ER.FREE_LOOK = ER.FREE_LOOK || {}; ER.FREE_LOOK[s.artist] = s.genArtist.freeLook; } } });
})();
