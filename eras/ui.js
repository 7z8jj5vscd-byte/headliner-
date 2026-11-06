/* The Eras Life: interface. */
(function () {
const ER = window.ER, G = window.G, T3 = window.T3;
const $ = s => document.querySelector(s);
const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const S = () => G.S();
const UI = window.UI = { tab:'week', sel:{}, toast:null, newg:null };
const TABS = [['week','This Week'],['town','Town'],['life','Life'],['songbook','Songbook'],['studio','Studio'],['rollout','Rollout'],['cover','Cover Studio'],['tour','Tour Desk'],['inbox','Team Inbox'],['eggs','Easter Eggs'],['fandom','Fandom'],['press','Press and People'],['charts','Charts and Awards'],['legacy','Legacy']];
const STAT = [['fans','Fans'],['rep','Public Reputation'],['heat','Press Heat'],['write','Songwriting'],['clout','Industry Clout'],['own','Ownership'],['energy','Energy'],['team','Team mood']];
const LOOKS = {
  hair:[['Honey','#c8954f'],['Platinum','#efe0b9'],['Auburn','#8a3b1f'],['Dark brown','#3a2417'],['Black','#141414'],['Copper','#b5562b']],
  style:[['Long waves','long'],['Curls','curly'],['Bob','bob'],['Ponytail','ponytail'],['Bun','bun'],['Short','short']],
  skin:[['Fair','#f6d7bf'],['Light','#e9c3a1'],['Medium','#d3a07a'],['Tan','#b97f56'],['Brown','#8d5a3b'],['Deep','#5c3a26']]
};

/* ---------- Utilities ---------- */
function toast(m) { UI.toast = m; let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = m; t.classList.add('on'); clearTimeout(UI.tt); UI.tt = setTimeout(() => t.classList.remove('on'), 2600); }
UI.toastMsg = toast;
function eraTheme() {
  const s = S(); const e = s && G.currentEra(); const root = document.documentElement;
  const c = e ? e.color : '#7a9a4a', ink = e ? e.ink : '#f3f7ea';
  root.style.setProperty('--era', c); root.style.setProperty('--era-ink', ink); root.style.setProperty('--era-2', e && e.accent || T3.shade(c, .35));
}
function bar(v, max, cls) { return `<div class="bar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, v / (max || 100) * 100))}%"></i></div>`; }
function pill(t, cls) { return `<span class="pill ${cls || ''}">${h(t)}</span>`; }
function card(inner, cls) { return `<section class="card ${cls || ''}">${inner}</section>`; }
function stageName(st) { return ER.STAGES[st] ? ER.STAGES[st].n : st; }
const PRI = ['tour','release','tourprep','pre','finish','record','write','promo','rest'];
function primary() { const a = G.active(); a.sort((x, y) => PRI.indexOf(x.st) - PRI.indexOf(y.st)); return a.find(x => x.p.type !== 'demos') || a[0] || null; }

/* ---------- 3D helpers ---------- */
// The performer's look follows the eras: each era's hair, make-up and costumes.
const ERAS_CYCLE = ['lover','fearless','evermore','rep','speaknow','red','folklore','1989','ttpd','midnights'];
function curArtist() { const s = S(); return s ? s.artist : (UI.newg && UI.newg.artist) || 'taylor'; }
function looksOf(a) { return a === 'taylor' ? ER.LOOKS.taylor : (ER.LOOKS[a + '_eras'] || ER.LOOKS.generic_eras); }
function eraKey(era) {
  const L = looksOf(curArtist()); if (!era) return 'early';
  if (L[era.id]) return era.id;
  if (era.custom) return curArtist() === 'taylor' ? 'showgirl' : Object.keys(L).pop();
  // Earlier albums without a look of their own wear the nearest earlier one.
  const ps = ER.artists[curArtist()].projects, i = ps.findIndex(p => p.id === era.id);
  for (let j = i; j >= 0; j--) if (L[ps[j].id]) return ps[j].id;
  return 'early';
}
function lookFor(ctx, era, key) {
  const L = looksOf(curArtist()), s = S();
  if (s && s.wardrobe && ctx === 'tour' && !key && G.proj(s.wardrobe)) era = G.proj(s.wardrobe);
  let k = key || eraKey(era), erasAct = false;
  if (k && k.startsWith('eras:')) { k = k.slice(5); erasAct = true; }
  if (!key && s && G.age() < 15) k = 'early';
  // On the Eras Tour, each week's show is a different act.
  if (!key && ctx === 'tour' && s && s.artist === 'taylor' && era && era.id === 'midnights') { const tp = G.active().find(x => x.st === 'tour' && x.p.id === 'midnights'); if (tp) { k = ERAS_CYCLE[s.abs % ERAS_CYCLE.length]; erasAct = true; } }
  const e = (!key && era && era.custom && era.look) ? era.look : (L[k] || L.early), stage = ['tour','awards','release'].includes(ctx);
  const o = Object.assign({}, e.base, erasAct && e.eras ? e.eras : stage ? e.stage : e.casual);
  // By the Eras Tour her hair and make-up were the 2023 look in every act.
  if (erasAct && L.midnights) Object.assign(o, { style:'waves', bangs:1, hairLen:.62, tips:0, heartEye:0, hair:L.midnights.base.hair, lips:L.midnights.base.lips }, k === 'lover' ? { heartEye:'#f06fb4' } : {}, ['folklore','evermore'].includes(k) ? { style:'braid' } : {});
  if (era && era.custom && !era.look) { o.outfit = era.color; o.accent = T3.shade(era.color, .55); }
  // Later in a tour the stage look changes: a second costume for the second half.
  if (!key && !erasAct && ctx === 'tour' && s && era) { const tr = (s.pj[era.id] || {}).tour; if (tr && tr.played > (tr.nights || 0) / 2 && o.outfit && o.accent) {
    const a = o.accent; o.accent = o.outfit; o.outfit = a; o.sparkle = 1; if (o.top === 'dress') o.top = 'sequin'; } }
  if (ctx === 'awards' && !e.stage.top.match(/gown|sequin/)) { o.top = 'gown'; o.sparkle = 1; o.guitar = 0; o.hat = 0; }
  if (ctx === 'awards') o.guitar = 0;
  return o;
}
function ageScale() { const s = S(); if (!s) return 1; const a = G.age(); return a < 13 ? .74 : a < 15 ? .84 : a < 17 ? .93 : 1; }
function otherLook(who, y) {
  // Another artist's look in a given year, for shared event cards.
  const A = ER.artists[who], L = looksOf(who); let key = 'early';
  A.projects.forEach(p => { if (p.rel != null && ER.yw(p.rel).y <= y && L[p.id]) key = p.id; });
  const e = L[key] || L.early; return Object.assign({}, e.base, e.stage);
}
function sceneFor(x) {
  const s = S(); if (!x) return G.age() < 13 ? 'farm' : 'home';
  const st = x.st, age = G.age();
  if (st === 'write') return age < 15 ? 'bedroom' : 'writers';
  if (st === 'record' || st === 'finish') return 'studio';
  if (st === 'pre') return 'video'; if (st === 'release') return 'tv'; if (st === 'promo') return 'press';
  if (st === 'tourprep') return 'rehearsal'; if (st === 'rest') return 'home';
  if (st === 'tour') { const tr = G.pj(x.p.id).tour; return x.p.tour.kind === 'opening' ? 'arena' : tr ? tr.tier : 'arena'; }
  return 'home';
}
const ANIM = { write:'write', bedroom:'strum', writers:'strum', studio:'sing', video:'dance', tv:'talk', press:'talk', rehearsal:'dance', theater:'sing', arena:'sing', stadium:'sing', home:'idle', farm:'wave', awards:'bow', bus:'idle' };
function stageSpec() {
  const x = primary(), set = sceneFor(x), era = x ? x.p : G.currentEra();
  const ctx = x && x.st === 'tour' ? 'tour' : set === 'studio' ? 'studio' : set === 'press' ? 'press' : set === 'tv' ? 'release' : '';
  const figs = [{ look:lookFor(ctx, era), x:0, z:0, anim:ANIM[set] || 'idle', mic:['arena','stadium','theater','studio','tv'].includes(set), s:ageScale() }];
  if (set === 'studio') figs.push({ look:T3.TEAM.producer, x:-1.2, z:-.4, ry:.5, anim:'talk', s:.92 });
  if (set === 'tv') figs.push({ look:T3.TEAM.publicist, x:1.15, z:-.2, ry:-.6, anim:'talk', s:.95 });
  if (set === 'rehearsal') figs.push({ look:T3.TEAM.manager, x:-1.3, z:-.3, ry:.5, anim:'idle', s:.95 });
  if (set === 'home' || set === 'farm') figs.push({ look:T3.TEAM.family, x:1.1, z:-.3, ry:-.5, anim:'idle', s:.95 });
  return { set, color:era ? era.color : '#7a9a4a', figs };
}
function eventSpec(e) {
  const t = (e.t + ' ' + e.x).toLowerCase();
  let set = 'press';
  if (/grammy|award|cma|acm|vma|horizon|person of the year|hall of fame|iheart/.test(t)) set = 'awards';
  else if (/snl|ellen|talk show|tv|podcast|new heights|livestream/.test(t)) set = 'tv';
  else if (/tour|stadium|arena|show|opener|opening|surprise song|final/.test(t)) set = 'stadium';
  else if (/studio|producer|record/.test(t)) set = 'studio';
  else if (/song|writ|guitar|chord|bluebird|liz rose/.test(t)) set = 'writers';
  else if (/move|school|family|farm|friend|summer|nashville|tennessee/.test(t)) set = 'home';
  const era = G.currentEra();
  const figs = [{ look:lookFor(set === 'awards' ? 'awards' : set === 'stadium' ? 'tour' : '', era), x:-.35, anim:set === 'awards' ? 'bow' : set === 'stadium' ? 'sing' : 'talk', mic:set === 'stadium' }];
  figs[0].s = ageScale();
  if (e.with && e.with.length) { const y = G.yw().y; e.with.forEach((w, i) => figs.push({ look:otherLook(w, y), x:.75 + i * .75, z:-.25 - i * .2, ry:-.45, anim:set === 'awards' ? 'wave' : 'talk', s:.98 })); }
  else figs.push({ look:set === 'home' ? T3.TEAM.family : set === 'tv' ? T3.TEAM.publicist : T3.TEAM.manager, x:.9, z:-.3, ry:-.5, anim:'talk', s:.94 });
  return { set, color:era ? era.color : '#7a9a4a', figs };
}
function mount3D(sel, spec, slot) { requestAnimationFrame(() => { const el = $(sel); if (!el) return; if (!T3.view(el, spec, slot)) el.classList.add(T3.quality === 'off' ? 'off3d' : 'no3d'); }); }

/* ---------- Covers ---------- */
function coverSVG(c, size, pid) {
  size = size || 160; c = c || {}; const up = pid && uploads()[pid];
  if (c.upload && up) return `<img class="cv" src="${up}" width="${size}" height="${size}" alt="">`;
  const pal = (ER.PALETTES.find(x => x.id === c.pal) || ER.PALETTES[0]).c, [A, B, C] = pal, id = 'g' + Math.random().toString(36).slice(2, 7);
  const sym = c.sym || 'circle', lay = c.lay || 'centered', fin = c.fin || 'matte';
  const cx = lay === 'offset' ? 64 : lay === 'split' ? 70 : 50, cy = lay === 'offset' ? 62 : 50, r = lay === 'full-bleed' ? 38 : 22;
  const shapes = {
    circle:`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${B}"/>`,
    sun:`<circle cx="${cx}" cy="${cy}" r="${r * .7}" fill="${B}"/>` + Array.from({ length:12 }, (_, i) => { const a = i / 12 * 6.283; return `<line x1="${cx + Math.cos(a) * r * .85}" y1="${cy + Math.sin(a) * r * .85}" x2="${cx + Math.cos(a) * r * 1.25}" y2="${cy + Math.sin(a) * r * 1.25}" stroke="${B}" stroke-width="2.4" stroke-linecap="round"/>`; }).join(''),
    moon:`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${B}"/><circle cx="${cx + r * .45}" cy="${cy - r * .2}" r="${r * .85}" fill="${A}"/>`,
    wave:[0, 1, 2, 3].map(i => `<path d="M0 ${cy - 12 + i * 9} Q25 ${cy - 22 + i * 9} 50 ${cy - 12 + i * 9} T100 ${cy - 12 + i * 9}" stroke="${B}" stroke-width="3" fill="none" opacity="${1 - i * .2}"/>`).join(''),
    stripes:Array.from({ length:7 }, (_, i) => `<rect x="${i * 15}" y="0" width="7" height="100" fill="${B}" opacity=".55"/>`).join(''),
    grid:Array.from({ length:5 }, (_, i) => `<line x1="${20 + i * 15}" y1="20" x2="${20 + i * 15}" y2="80" stroke="${B}" stroke-width="1.5"/><line x1="20" y1="${20 + i * 15}" x2="80" y2="${20 + i * 15}" stroke="${B}" stroke-width="1.5"/>`).join(''),
    star:`<polygon points="${Array.from({ length:10 }, (_, i) => { const a = i / 10 * 6.283 - 1.571, rr = i % 2 ? r * .45 : r; return (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1); }).join(' ')}" fill="${B}"/>`,
    diamond:`<polygon points="${cx},${cy - r} ${cx + r * .7},${cy} ${cx},${cy + r} ${cx - r * .7},${cy}" fill="${B}"/>`,
    arch:`<path d="M${cx - r} ${cy + r} V${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} V${cy + r} Z" fill="${B}"/>`,
    horizon:`<rect x="0" y="${cy + 6}" width="100" height="${100 - cy}" fill="${C}"/><circle cx="${cx}" cy="${cy + 6}" r="${r * .8}" fill="${B}"/>`,
    bloom:Array.from({ length:6 }, (_, i) => { const a = i / 6 * 6.283; return `<ellipse cx="${cx + Math.cos(a) * r * .5}" cy="${cy + Math.sin(a) * r * .5}" rx="${r * .45}" ry="${r * .25}" fill="${B}" opacity=".85" transform="rotate(${i * 60} ${cx + Math.cos(a) * r * .5} ${cy + Math.sin(a) * r * .5})"/>`; }).join('') + `<circle cx="${cx}" cy="${cy}" r="${r * .18}" fill="${C}"/>`,
    spiral:`<path d="${Array.from({ length:60 }, (_, i) => { const a = i * .35, rr = i * r / 60; return (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); }).join(' ')}" stroke="${B}" stroke-width="2.4" fill="none"/>`
  };
  const bg = lay === 'split' ? `<rect width="100" height="100" fill="${A}"/><rect width="38" height="100" fill="${C}"/>` : `<rect width="100" height="100" fill="${A}"/>`;
  const frame = lay === 'framed' ? `<rect x="7" y="7" width="86" height="86" fill="none" stroke="${B}" stroke-width="1.6"/>` : '';
  const finish = fin === 'grain' ? `<filter id="${id}f"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .28 0"/></filter><rect width="100" height="100" filter="url(#${id}f)"/>`
    : fin === 'foil' ? `<linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><rect width="100" height="100" fill="url(#${id}l)"/>`
    : fin === 'gloss' ? `<ellipse cx="30" cy="12" rx="60" ry="22" fill="#fff" opacity=".16"/>` : '';
  return `<svg class="cv" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Album cover design">${bg}${shapes[sym] || ''}${frame}${finish}</svg>`;
}
UI.coverSVG = coverSVG;
function uploads() { try { return JSON.parse(G.lsGet('eras-uploads') || '{}'); } catch (e) { return {}; } }

/* ---------- Title ---------- */
// The last two weeks of daily challenges, drawn with the title so nothing jumps in after it.
function dailyHist() { let best = {}; try { best = JSON.parse(localStorage.getItem('eras-daily-best') || '{}'); } catch (e) {}
  const days = Array.from({ length:14 }, (_, i) => { const x = new Date(Date.now() - (13 - i) * 864e5); return best[`${x.getUTCFullYear()}-${x.getUTCMonth() + 1}-${x.getUTCDate()}`]; });
  return `<div id="daily-hist" class="dhist" aria-label="Daily challenges won in the last 14 days: ${days.filter(Boolean).length}">${days.map(w => `<i class="${w ? 'won' : ''}" title="${w ? 'Won' : 'Not won'}"></i>`).join('')}</div>`; }
function title() {
  const slots = [1, 2, 3].map(n => { const i = G.slotInfo(n); return `<div class="slot"><div><b>Slot ${n}</b><div class="small muted">${i ? `${h(ER.artists[i.artist].name)} · ${i.mode === 'story' ? 'Story' : 'Era Start'} · ${i.y}, week ${i.w}${i.retired ? ' · Retired' : ''}` : 'Empty'}</div></div><div class="row">${i ? `<button class="btn" data-act="load" data-n="${n}">Continue</button><button class="btn ghost sm" data-act="delslot" data-n="${n}" aria-label="Delete slot ${n}">Delete</button>` : `<button class="btn" data-act="newgame" data-n="${n}">New game</button>`}</div></div>`; }).join('');
  const span = { taylor:'From 2001 (age 11)', beyonce:'From 1990 (age 8)', gaga:'From 2000 (age 13)' };
  const artists = ['taylor','beyonce','gaga'].map(id => { const a = ER.artists[id]; return `<div class="artist"><div class="sw" style="background:${a.color || '#d6a93a'}"></div><div><b>${h(a.name)}</b><div class="small muted">Playable · ${span[id]} to 2026, then free play</div></div><button class="btn ghost sm" data-act="preview" data-id="${id}">Story</button></div>`; }).join('');
  $('#app').innerHTML = `<div class="title">
    <div class="logo"><span class="eyebrow">A week-by-week career game</span><h1>The Eras Life</h1><p class="muted">Live through a documented career from the first demo to the last stadium night, then carry it on yourself.</p></div>
    <div id="ver-line" class="ver-line" role="status">${window.UPD ? UPD.line() : ''}</div>
    <div class="stage3d tall" id="t3title"></div>
    ${card(`<h2>Daily challenge</h2>${(() => { const c = G.challengeToday(), A = ER.artists[c.artist]; return `<p><b>${h(c.n)}</b> as ${h(A.name)}, ${h(c.title)} era.</p><p class="small muted">${h(c.d)} Everyone gets the same challenge today. Streak: ${G.challengeStreak()} day${G.challengeStreak() === 1 ? '' : 's'}.</p>`; })()}
      <div class="row"><button class="btn" data-act="daily">Play today's challenge</button>${G.slotInfo('daily') ? '<button class="btn ghost sm" data-act="dailyload">Continue it</button>' : ''}</div>${dailyHist()}<p class="small faint">It has its own save, so your slots are never touched.</p>`)}
    ${card(`<h2>Saves</h2><div class="stack tight">${slots}</div><div class="row"><label class="btn ghost sm">Import a save<input type="file" accept=".json,application/json" data-act="import" hidden></label></div>`)}
    ${card(`<h2>Stories</h2><p class="small muted">Pick who to play when you start a new game. Each one appears in the others' games as a real chart rival.</p><div class="stack tight">${artists}</div>`)}
    <p class="small faint">An unofficial fan project. No lyrics, audio, album art or photos of real people are used. Figures are stylised and are not likenesses. Event cards stick to the public record.</p></div>`;
  mount3D('#t3title', { set:'stadium', color:'#d6a93a', figs:[{ look:lookFor('tour', null, 'fearless'), anim:'strum' }] }, 'title');
}
function newGameFlow() {
  const n = UI.newg; const L = n.look;
  const opt = (k, arr) => `<div class="chips">${arr.map(([l, v]) => `<button class="chip ${L[k] === v ? 'on' : ''}" data-act="look" data-k="${k}" data-v="${v}">${k !== 'style' ? `<i class="dot" style="background:${v}"></i>` : ''}${h(l)}</button>`).join('')}</div>`;
  const AR = ER.artists[n.artist], eras = G.unlockedEras(n.artist); const P = AR.projects.filter(p => p.type !== 'demos' && p.type !== 'edition');
  $('#app').innerHTML = `<div class="title">
    <div class="between"><h1>New game</h1><button class="btn ghost sm" data-act="title">Back</button></div>
    ${card(`<h2>Artist</h2><div class="chips">${['taylor','beyonce','gaga'].map(id => `<button class="chip ${n.artist === id ? 'on' : ''}" data-act="nartist" data-v="${id}"><i class="dot" style="background:${ER.artists[id].color}"></i>${h(ER.artists[id].name)}</button>`).join('')}</div>`)}
    ${card(`<h2>Mode</h2><div class="chips">
      <button class="chip ${n.mode === 'story' ? 'on' : ''}" data-act="nmode" data-v="story">Story Mode</button>
      <button class="chip ${n.mode === 'era' ? 'on' : ''}" data-act="nmode" data-v="era">Era Start</button></div>
      <p class="small muted">${n.mode === 'story' ? 'Start at the beginning of her life. Weeks advance in order, and real events happen on their real dates.' : 'Start from any unlocked era, with the catalog and team of that moment. The event track is off and you control the calendar.'}</p>
      ${n.mode === 'era' ? `<div class="chips">${P.map(p => { const ok = eras.includes(p.id); return `<button class="chip ${n.era === p.id ? 'on' : ''}" ${ok ? '' : 'disabled'} data-act="nera" data-v="${p.id}"><i class="dot" style="background:${p.color}"></i>${h(p.short)}${ok ? '' : ' (locked)'}</button>`; }).join('')}</div><p class="small faint">Eras unlock when Story Mode reaches them.</p>` : ''}`)}
    ${card(`<h2>Your goal</h2><p class="small muted">A personal goal for this run. It changes nothing in the story, only what you are chasing.</p>
      <div class="chips">${ER.CAREER_GOALS.map(g => `<button class="chip ${(n.goal || 'none') === g.id ? 'on' : ''}" data-act="ngoal" data-v="${g.id}">${h(g.n)}</button>`).join('')}</div>
      <p class="small">${h((ER.CAREER_GOALS.find(g => g.id === (n.goal || 'none')) || {}).d || '')}</p>`)}
    ${card(`<h2>Twists</h2><p class="small muted">Optional modifiers. Pick any, or none.</p>
      ${ER.MODIFIERS.map(m => `<button class="choice ${(n.mods || []).includes(m.id) ? 'on' : ''}" data-act="nmod" data-v="${m.id}">${h(m.n)}<div class="small muted">${h(m.d)}</div></button>`).join('')}`)}
    ${card(`<h2>Difficulty</h2><div class="chips">${Object.keys(G.DIFF).map(k => `<button class="chip ${n.diff === k ? 'on' : ''}" data-act="ndiff" data-v="${k}">${G.DIFF[k].l} · ${G.DIFF[k].blocks} blocks</button>`).join('')}</div><p class="small muted">Difficulty changes Time Blocks, penalties and deadlines.</p>`)}
    ${card(`<h2>Era looks</h2><p class="small muted">The 3D performer changes with every era: hair, make-up and stage costumes. Tap an era to preview it.</p>
      <div class="stage3d" id="t3look"></div>
      <div class="chips">${(n.artist === 'taylor' ? ['early','ts1','fearless','speaknow','red','1989','rep','lover','folklore','evermore','fearlesstv','redtv','midnights','speaknowtv','1989tv','ttpd','showgirl'] : Object.keys(looksOf(n.artist))).map(k => { const pr = AR.projects.find(q => q.id === k); return `<button class="chip ${n.lookEra === k ? 'on' : ''}" data-act="lookera" data-v="${k}">${pr ? `<i class="dot" style="background:${pr.color}"></i>` + h(pr.short) : 'Childhood'}</button>`; }).join('')}</div>
      ${n.artist === 'taylor' ? `<h3>Eras Tour acts</h3><div class="chips">${ERAS_CYCLE.map(k => { const pr = AR.projects.find(q => q.id === k); return `<button class="chip ${n.lookEra === 'eras:' + k ? 'on' : ''}" data-act="lookera" data-v="eras:${k}"><i class="dot" style="background:${pr.color}"></i>${h(pr.short)}</button>`; }).join('')}</div>` : ''}`)}
    <button class="btn big" data-act="begin">${n.mode === 'story' ? 'Begin the prologue' : 'Start this era'}</button></div>`;
  { const LS = looksOf(n.artist), k = n.lookEra && LS[n.lookEra.replace('eras:', '')] ? n.lookEra : Object.keys(LS)[2] || 'early', base = k.replace('eras:', ''), pr = AR.projects.find(q => q.id === base), LK = LS[base];
    const figs = [{ look:lookFor('tour', null, k), anim:'sing', mic:!(k.startsWith('eras:') ? (LK.eras || LK.stage) : LK.stage).guitar, s:k === 'early' ? .78 : 1 }];
    if (!k.startsWith('eras:')) figs.push({ look:lookFor('', null, k), x:1.05, z:-.35, ry:-.5, anim:'idle', s:k === 'early' ? .72 : .92 });
    mount3D('#t3look', { set:k.startsWith('eras:') ? 'stadium' : 'theater', color:pr ? pr.color : '#7a9a4a', figs }, 'look'); }
}
function prologue() {
  const n = UI.newg, A = ER.artists[n.artist], i = n.pro.length, pr = A.prologue[i];
  $('#app').innerHTML = `<div class="title"><span class="eyebrow">Prologue · ${i + 1} of ${A.prologue.length}</span><h1>${h(pr.t)}</h1>
    <div class="stage3d" id="t3pro"></div>
    ${card(`<p>${h(pr.x)}</p><div class="stack tight">${pr.ch.map((c, k) => `<button class="choice" data-act="pro" data-i="${k}">${h(c.l)}</button>`).join('')}</div>`)}</div>`;
  mount3D('#t3pro', { set:i === 0 ? 'farm' : i === 1 ? 'bedroom' : 'home', color:'#7a9a4a', figs:[{ look:lookFor('', null, 'early'), anim:i === 1 ? 'strum' : 'wave', guitar:i > 0, s:.62 + i * .06 }, { look:T3.TEAM.family, x:1, z:-.3, ry:-.5, s:.98 }] }, 'pro');
}

/* ---------- Shell ---------- */
function render() {
  const s = S(); if (!s) return title();
  eraTheme();
  if (!G.unlocked(UI.tab)) UI.tab = 'week';
  const yw = G.yw(), x = primary(), e = G.currentEra();
  const blocks = G.blocks(), used = s.week.used;
  const top = `<header class="top"><div class="between"><div><div class="date">${h(G.fmtDate(s.abs))}</div><div class="small muted">Week ${yw.w} of 52 · Age ${G.age()}${e ? ' · ' + h(e.short || e.title) + ' era' : ''}</div></div>
    <div class="row"><div class="blocks" title="Time Blocks">${Array.from({ length:blocks }, (_, i) => `<i class="${i < used ? 'used' : ''}"></i>`).join('')}${used > blocks ? `<b class="over">+${used - blocks}</b>` : ''}</div><button class="icon" data-act="menu" aria-label="Menu">☰</button></div></div>
    <div class="statline">${[['fans', G.fmtN(s.stats.fans), G.art().fanName], ['rep', Math.round(s.stats.rep), 'Rep'], ['heat', Math.round(s.stats.heat), 'Heat'], ['energy', Math.round(s.stats.energy), 'Energy'], ['money', G.fmtM(s.stats.money), 'Money'], ['canon', G.canon(), 'Canon']].map(([k, v, l]) => `<div class="st"><b>${v}</b><span>${l}</span></div>`).join('')}</div></header>`;
  const GROUPS = [['Now', ['week','town','inbox','life']], ['Music', ['songbook','studio','rollout','cover']], ['Stage', ['tour','fandom','eggs']], ['Career', ['press','charts','legacy']]];
  const grp = GROUPS.find(g => g[1].includes(UI.tab)) || GROUPS[0];
  const groupNav = `<nav class="groups" aria-label="Sections">${GROUPS.map(g => { const un = g[1].includes('inbox') ? s.inbox.filter(m => !m.read).length : 0; return `<button class="grp ${g === grp ? 'on' : ''}" data-act="tab" data-v="${g[1].find(k => G.unlocked(k)) || 'week'}">${h(g[0])}${un ? `<i class="badge">${un}</i>` : ''}</button>`; }).join('')}</nav>`;
  const nav = groupNav + `<nav class="tabs" aria-label="Game tabs">${TABS.filter(([k]) => !UI.narrow || grp[1].includes(k)).map(([k, l]) => { const ok = G.unlocked(k); const un = k === 'inbox' ? s.inbox.filter(m => !m.read).length : 0; return `<button class="tab ${UI.tab === k ? 'on' : ''}" ${ok ? '' : 'disabled'} data-act="tab" data-v="${k}">${h(l)}${un ? `<i class="badge">${un}</i>` : ''}${ok ? '' : ' 🔒'}</button>`; }).join('')}</nav>`;
  $('#app').innerHTML = top + nav + `<main id="main">${(VIEWS[UI.tab] || VIEWS.week)()}</main><div id="toast" class="toast"></div>`;
  if (UI.tab === 'week') mount3D('#t3stage', stageSpec(), 'main');
  if (!document.querySelector('.modal') && s.abs - (s.lastBackup != null ? s.lastBackup : (s.lastBackup = s.abs)) > 104 && (!UI.backupSnooze || s.abs - UI.backupSnooze > 52) && s.slot !== 'daily') {
    UI.backupSnooze = s.abs;
    modal(`<h2>Back up your save?</h2><p class="small">This save lives only in this browser. Clearing your browser data or switching devices would lose it. Export a backup file now and then to keep it safe.</p>
      <div class="stack tight"><button class="btn" data-act="export">Export a backup</button><button class="btn ghost" data-act="backuplater">Remind me later</button></div>`); }
  if (UI.tab === 'legacy' && UI.sel.booth) boothDraw();
  if (window.SND && SND.on && UI.heard) SND.setMood(moodOf(e));
  if (UI.tab === 'tour') { const v = $('#t3venue'); if (v) mount3D('#t3venue', { set:UI.sel.tier || 'arena', color:(e || {}).color, figs:[{ look:lookFor('tour', e), anim:'sing', mic:true }] }, 'venue'); }
  if (UI.tab === 'charts' || UI.tab === 'legacy') {}
  const nb = document.querySelector('.tab.on'); if (nb) nb.scrollIntoView({ block:'nearest', inline:'center' });
  modals();
}
UI.render = render;

/* ---------- Views ---------- */
const VIEWS = {};
VIEWS.week = function () {
  const s = S(), x = primary(), tasks = G.tasks(), req = tasks.filter(t => t.req), opt = tasks.filter(t => !t.req);
  const act = G.active().filter(y => y.p.type !== 'demos');
  const dl = [];
  G.allProjects().forEach(p => { const w = G.win(p); [[w.rel, `${p.title} release`], [w.ts, `${p.tour && p.tour.name} begins`], [w.te, `${p.tour && p.tour.name} ends`], [w.ps, `${p.title} pre-release starts`]].forEach(([a, l]) => { if (a != null && a >= s.abs && a < s.abs + 10) dl.push([a, l]); }); });
  s.duties.forEach(d => { if (d.due < s.abs + 6) dl.push([d.due, d.l]); });
  dl.sort((a, b) => a[0] - b[0]);
  const taskRow = t => { const done = G.taskDone(t.id); return `<div class="task ${done ? 'done' : ''} ${t.req ? 'req' : ''}"><div class="cost">${'●'.repeat(Math.max(1, t.cost))}</div><div class="tl"><b>${h(t.l)}</b>${t.desc ? `<div class="small muted">${h(t.desc)}</div>` : ''}</div>
    ${done ? '<span class="pill ok">Done</span>' : t.fixed ? '' : `<div class="row">${t.tab && t.tab !== 'week' ? `<button class="btn ghost sm" data-act="tab" data-v="${t.tab}">Open</button>` : ''}<button class="btn sm" data-act="do" data-id="${h(t.id)}" ${G.canSpend(t.cost) ? '' : 'disabled'}>Do</button></div>`}</div>`; };
  const r = s.recap;
  return `  ${s.challenge && !s.challenge.done ? card(`<span class="eyebrow">Daily challenge</span><p class="small"><b>${h(s.challenge.n)}</b>: ${h(s.challenge.d)} Until ${h(G.fmtDate(s.challenge.until))}.</p>`, 'world') : ''}
  ${s.guide && !s.guide.done && s.week && !s.challenge ? card(`<span class="eyebrow">Getting started</span>${ER.GUIDE.map(g => `<div class="small"><b>${s.guide[g.id] ? '✅' : '⬜'} ${h(g.l)}</b> <span class="muted">${h(g.hint)}</span></div>`).join('')}`, 'world') : ''}
  ${s.recovery ? card(`<b>Recovery goal:</b> raise your ${s.recovery.k === 'rep' ? 'Public Reputation' : 'team mood'} to 30. Weeks are harder until you do.`, 'warn') : ''}
  ${G.worldNotes().map(n => card(`<span class="eyebrow">The world right now</span><p class="small">${h(n)}</p>`, 'world')).join('')}
  ${s.flags.retired ? card(`<span class="eyebrow">Retired</span><p class="small">You retired in ${ER.yw(s.flags.retired).y}. Weeks are quiet now. Come out of retirement from the tasks below whenever you like.</p>`, 'world') : ''}
  ${s.flags.farewell ? card('<span class="eyebrow">The Farewell Tour</span><p class="small">No new eras. One last tour, then you decide whether to retire.</p>', 'world') : ''}
  ${s.flags.hidden ? card('<span class="eyebrow">Out of public view</span><p class="small">No interviews, posts or appearances. You can still write, record, plan your comeback and work with your team in private.</p>', 'world') : ''}
  ${s.week.forcedRest ? card('<b>Forced rest.</b> Energy hit zero, so you only have 1 Time Block this week.', 'warn') : ''}
  <div class="stagewrap"><div class="stage3d" id="t3stage"></div><div class="caption">${x ? `<b>${h(x.p.title)}</b> · ${h(stageName(x.st))}<div class="small">Done when: ${h(ER.STAGES[x.st].need)}</div>` : '<b>Between eras</b>'}</div></div>
  ${act.length > 1 ? card(`<h3>Your stages</h3><div class="chips">${act.map(y => pill(`${y.p.short || y.p.title}: ${stageName(y.st)}`)).join('')}</div><p class="small muted">Stages overlap, and your Time Blocks have to cover all of them.</p>`) : ''}
  ${dl.length ? card(`<h3>Deadlines</h3>${dl.slice(0, 6).map(([a, l]) => `<div class="between small"><span>${h(l)}</span><span class="${a === s.abs ? 'spot' : 'muted'}">${a === s.abs ? 'This week' : h(G.fmtDate(a))}</span></div>`).join('')}`) : ''}
  ${card(`<div class="between"><h2>Required</h2><span class="small muted">${s.week.used} of ${G.blocks()} blocks used</span></div>${req.length ? req.map(taskRow).join('') : '<p class="muted small">No required tasks this week.</p>'}`)}
  ${card(`<h2>Optional</h2>${opt.map(taskRow).join('')}`)}
  <div class="actions"><button class="btn big" data-act="advance">Advance Week</button>
    <button class="btn ghost" data-act="ff" ${G.quietWeek() ? '' : 'disabled'} title="Skips quiet weeks only. Stops at every real event and deadline.">Fast-forward</button></div>
  <div class="row small"><button class="btn ghost sm" data-act="saveroutine">Save routine</button><button class="btn ghost sm" data-act="applyroutine" ${s.routine.length ? '' : 'disabled'}>Apply routine (${s.routine.length})</button></div>
  ${seasonCard()}
  ${chartShow()}
  ${r ? card(`<h3>Last week</h3><div class="grid3"><div><b class="${r.fans >= 0 ? 'pos' : 'neg'}">${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)}</b><span class="small muted"> fans</span></div><div><b class="${r.money >= 0 ? 'pos' : 'neg'}">${G.fmtM(r.money)}</b><span class="small muted"> money</span></div><div><b>${G.fmtN(r.units)}</b><span class="small muted"> units sold</span></div></div>
    ${r.lines.map(l => `<p class="small">${h(l)}</p>`).join('')}${r.team.map(l => `<p class="small muted">${h(l)}</p>`).join('')}`) : ''}`;
};
function seasonCard() {
  const s = S(); const ss = s.season; const gp = G.goalProgress(); let out = '';
  if (ss && ss.goals.length) out += card(`<h3>Season goals for ${ss.y}</h3>${ss.goals.map(g => `<div class="statrow"><span>${g.done ? '✅' : '⬜'} ${h(g.l)}</span>${g.end ? '' : bar(g.prog, g.n)}<b class="small">${g.end ? (g.done ? 'Done' : 'Year end') : `${Math.min(g.prog, g.n)}/${g.n}`}</b></div>`).join('')}<p class="small faint">Rewards arrive as soon as a goal is done. All three in a year earns a bonus.</p>`);
  if (gp) out += card(`<h3>Your goal: ${h(gp.g.n)}</h3><p class="small muted">${h(gp.g.d)}</p><div class="statrow"><span>Progress</span>${bar(gp.v, gp.g.target)}<b class="small">${gp.g.id === 'tour' || gp.g.id === 'fans' ? (gp.g.id === 'tour' ? G.fmtM(gp.v) : G.fmtN(gp.v)) : Math.round(gp.v)}</b></div>${s.goalDone ? '<p class="small pos">Reached!</p>' : ''}`);
  if (s.mods && s.mods.length) out += `<p class="small faint" style="margin:0 16px">Twists: ${s.mods.map(id => h((ER.MODIFIERS.find(m => m.id === id) || {}).n)).join(', ')}</p>`;
  return out;
}
function chartShow() {
  const s = S(), prev = s.chartPrev || { singles:{}, albums:{} };
  const sg = s.charts.singles.filter(c => !c.out && c.abs < s.abs).sort((a, b) => a.pos - b.pos).slice(0, 4);
  const al = s.released.filter(r => r.pos != null && r.pos <= 200 && r.abs < s.abs).sort((a, b) => a.pos - b.pos).slice(0, 3);
  if (!sg.length && !al.length) return '';
  const mv = (now, was) => was == null ? '<span class="pill">New</span>' : now < was ? `<span class="pos">▲ ${was - now}</span>` : now > was ? `<span class="neg">▼ ${now - was}</span>` : '<span class="muted">=</span>';
  return card(`<h3>On the charts this week</h3>
    ${al.map(r => `<div class="between small"><span><b>No. ${r.pos}</b> ${h(G.proj(r.pid).title)} <span class="faint">album</span></span>${mv(r.pos, prev.albums[r.pid])}</div>`).join('')}
    ${sg.map(c => `<div class="between small"><span><b>No. ${c.pos}</b> ${h(c.t)}${c.real ? ` <span class="faint">(real peak ${c.real})</span>` : ''}</span>${mv(c.pos, prev.singles[c.t])}</div>`).join('')}`);
}
VIEWS.life = function () {
  const s = S(), A = G.art(), y = G.yw().y;
  const fam = A.people.filter(p => p.g === 'Family' && p.from <= y && (!p.to || p.to >= y));
  const school = s.abs < ER.ds('2007-06-04') ? (G.age() >= 11 ? 'In school (1 fixed block a week)' : 'Childhood') : 'Finished school through homeschooling';
  return `${card(`<h2>Life</h2><div class="grid3"><div><b>${G.age()}</b><div class="small muted">Age</div></div><div><b>${y}</b><div class="small muted">Year</div></div><div><b>${G.canon()}</b><div class="small muted">Canon Score</div></div></div>
   <h3>Stats</h3>${STAT.map(([k, l]) => `<div class="statrow"><span>${l}</span>${k === 'fans' ? `<b>${G.fmtN(s.stats.fans)}</b>` : bar(s.stats[k]) + `<b>${Math.round(s.stats[k])}</b>`}</div>`).join('')}
   <div class="statrow"><span>Genre</span><div class="genre"><i style="left:${s.stats.genre}%"></i></div><b class="small">${h((G.art().genreLabels || ['Country','Pop','Alternative'])[s.stats.genre < 33 ? 0 : s.stats.genre < 66 ? 1 : 2])}</b></div>
   <p class="small muted">Moving the genre meter fast costs radio support and old fans in exchange for new ones.</p>`)}
  ${(s.journal || []).length ? card(`<h2>Scrapbook</h2><p class="small muted">Little moments from your weeks.</p>${s.journal.slice(0, 30).map(j => `<div class="logrow"><div class="between"><b>${h(j.t)}</b><span class="small muted">${h(G.fmtDate(j.abs))}</span></div>${j.l ? `<div class="small">You: ${h(j.l)}</div>` : ''}<div class="small muted">${h(j.r)}</div></div>`).join('')}`) : ''}
  ${card(`<h3>Family</h3>${fam.map(p => `<div class="between small"><b>${h(p.n)}</b><span class="muted">${h(p.role)}</span></div>`).join('')}<h3>School</h3><p class="small">${h(school)}</p>`)}
  ${card(`<h2>Event cards</h2><p class="small muted">Your choices beside what really happened.</p>${s.log.slice().reverse().map(l => `<div class="logrow ${l.s ? 'sens' : ''}"><div class="between"><b>${h(l.t)}</b><span class="small muted">${h(G.fmtDate(l.abs))}</span></div>
     <div class="small">You: ${h(l.l)} ${l.world ? pill('World') : l.s || l.drama ? '' : l.canon ? pill('Canon', 'ok') : pill('What-if')}</div>${l.truth ? `<div class="small muted">What really happened: ${h(l.truth)}</div>` : ''}</div>`).join('') || '<p class="muted small">No cards yet.</p>'}`)}`;
};
VIEWS.songbook = function () {
  const s = S(), A = G.art(), groups = {};
  G.writable().forEach(w => { (groups[w.p.id] = groups[w.p.id] || []).push(w); });
  const act = G.active().filter(x => (x.st === 'write' || x.st === 'record') && x.p.type !== 'rerecord');
  if (!act.length) return vaultCard() + card(`<h2>Songbook</h2><p class="muted">No era is in its writing stage right now. The Songbook only offers songs that belong to the current era.</p>`) + catalogCard();
  return vaultCard() + act.map(({ p, st }) => {
    const all = p.tracks.map(t => [t, 'album']).concat((p.extras || []).map(t => [t, 'bonus'])).concat((p.vault || []).map(t => [t, 'vault']));
    const c = G.counts(p), co = UI.sel['co:' + p.id] || (p.cowriters || ['Solo'])[0];
    const tv = p.vaultFor && G.proj(p.vaultFor);
    return card(`<div class="between"><h2>${h(p.title)}</h2>${pill(stageName(st))}</div>${p.type !== 'demos' ? `<p class="small muted">${c.written} of ${c.target} album songs written.</p>${bar(c.written, c.target)}` : '<p class="small muted">Early songs and demos. Confidence labels show how well documented each title is.</p>'}
      <label class="field"><span>Co-writer</span><select data-act="selco" data-p="${p.id}">${(p.cowriters || ['Solo']).map(n => `<option ${n === co ? 'selected' : ''}>${h(n)}</option>`).join('')}</select></label>
      <p class="small faint">${h((A.cowriters[co] || {}).note || '')}</p>
      <div class="songs">${all.map(([t, k]) => { const so = s.songs[t]; return `<div class="song ${so ? 'has' : ''}"><div><b>${h(t)}</b><div class="small muted">${k === 'vault' ? `Vault: locked until ${h(tv ? tv.title : "Taylor's Version")}` : k === 'bonus' ? 'Bonus or other release' : 'Album track'}${p.confidence ? ' · ' + h(p.confidence[t] || 'reported') : ''}</div></div>
        ${so && so.insp ? `<span class="small faint">About: ${h(so.insp)}</span>` : ''}${so ? `<span class="pill">${so.st === 'written' ? 'Written' : so.st === 'recorded' ? 'Recorded' : so.st === 'vault' ? 'In the vault' : 'Released'} · ${so.q}</span>` : `<button class="btn sm" data-act="write" data-t="${h(t)}" data-p="${p.id}" ${G.canSpend(2) ? '' : 'disabled'}>Write · 2</button>`}</div>`; }).join('')}</div>`);
  }).join('') + catalogCard();
};
function catalogCard() {
  const s = S(), cat = Object.keys(s.songs);
  if (!cat.length) return '';
  return card(`<h3>Your catalog (${cat.length})</h3><div class="small muted">${cat.slice(-40).map(t => h(t)).join(' · ')}</div>`);
}
function vaultCard() {
  const s = S(), can = G.vaultable(), saved = G.vaultSongs(); if (!can.length && !saved.length) return '';
  UI.sel.vpick = UI.sel.vpick || [];
  return card(`<h2>The vault</h2><p class="small muted">Songs you wrote that did not make the album. Save the ones you love, then release them later.</p>
    ${can.map(t => `<div class="between small"><span>${h(t)}</span><button class="btn ghost sm" data-act="vsave" data-t="${h(t)}">Save to the vault</button></div>`).join('')}
    ${saved.length ? `<h3>In the vault</h3><div class="chips">${saved.map(t => `<button class="chip ${UI.sel.vpick.includes(t) ? 'on' : ''}" data-act="vpick" data-t="${h(t)}">${h(t)} · ${s.songs[t].q}</button>`).join('')}</div>
      <button class="btn sm" data-act="vrelease" ${UI.sel.vpick.length ? '' : 'disabled'}>Release "From the Vault" (${UI.sel.vpick.length}) · 1 block</button>` : ''}`);
}
VIEWS.studio = function () {
  const s = S(), out = [];
  G.active().filter(x => ['record','finish'].includes(x.st) || (x.st === 'write' && x.p.type !== 'demos')).forEach(({ p, st }) => {
    const c = G.counts(p), pj = G.pj(p.id), prod = UI.sel['pr:' + p.id] || (p.producers || ['Producer'])[0];
    const rec = G.recordable().filter(r => r.p.id === p.id);
    out.push(card(`<div class="between"><h2>${h(p.title)}</h2>${pill(stageName(st))}</div><p class="small muted">${c.recorded} of ${c.target} tracks recorded.</p>${bar(c.recorded, c.target)}
      ${st === 'write' ? '<p class="small muted">Recording opens when the stage moves on.</p>' : `<label class="field"><span>Producer</span><select data-act="selpr" data-p="${p.id}">${(p.producers || ['Producer']).map(n => `<option ${n === prod ? 'selected' : ''}>${h(n)}</option>`).join('')}</select></label>
      <div class="songs">${rec.map(r => `<div class="song"><div><b>${h(r.tv || r.t)}</b>${r.vault ? '<div class="small muted">From the vault</div>' : ''}</div><button class="btn sm" data-act="record" data-t="${h(r.t)}" data-p="${p.id}" ${G.canSpend(1) ? '' : 'disabled'}>Record · 1</button></div>`).join('') || '<p class="small muted">Nothing written is waiting to be recorded.</p>'}</div>`}
      ${st === 'finish' ? `<h3>Finishing</h3>${ER.FINISH.map(f => `<div class="between small"><span>${h(f[1])}</span>${pj.fin[f[0]] ? pill('Done', 'ok') : f[0] === 'cover' ? `<button class="btn ghost sm" data-act="tab" data-v="cover">Cover Studio</button>` : `<button class="btn sm" data-act="do" data-id="fin:${p.id}:${f[0]}" data-arg="${f[0] === 'edition' ? h(UI.sel['ed:' + p.id] || 'deluxe') : ''}">Do · ${f[2]}</button>`}</div>`).join('')}
        <label class="field"><span>Editions</span><select data-act="seled" data-p="${p.id}">${['standard','deluxe'].concat(p.type === 'rerecord' ? ['vault'] : []).map(e => `<option ${(UI.sel['ed:' + p.id] || 'deluxe') === e ? 'selected' : ''}>${e}</option>`).join('')}</select></label>` : ''}`));
  });
  if (s.flags.free || s.mode === 'era') {
    const busy = G.active().some(x => ['write','record','finish','pre'].includes(x.st));
    const next = s.mode === 'era' ? G.art().projects.filter(p => p.type !== 'demos' && !s.started.includes(p.id) && p.rel > Math.max(...s.started.map(id => G.art().projects.find(q => q.id === id).rel))) : [];
    out.push(card(`<h2>Start a new era</h2>${busy ? '<p class="small muted">Finish the current album first.</p>' : `
      ${next.length ? `<h3>The next real era</h3><div class="chips">${next.slice(0, 3).map(p => `<button class="chip" data-act="nextreal" data-id="${p.id}"><i class="dot" style="background:${p.color}"></i>${h(p.title)}</button>`).join('')}</div><p class="small faint">Starts its writing stage this week, with its real songs.</p>` : ''}
      <h3>A new era of your own</h3><p class="small muted">Your label pitches titles and sounds, and every era gets its own look.</p>
      <button class="btn" data-act="pitch">Plan your next era</button>`}`));
  }
  if (!out.length) out.push(card(`<h2>Studio</h2><p class="muted">No album is being recorded right now.</p>`));
  return out.join('') + catalogCard();
};
VIEWS.rollout = function () {
  const s = S(), out = [];
  G.active().filter(x => ['finish','pre','release','promo'].includes(x.st) && x.p.type !== 'demos').forEach(({ p, st }) => {
    const pj = G.pj(p.id), list = p.type === 'rerecord' ? ER.PRE_TV : p.surprise ? ER.PRE_SURPRISE : ER.PRE, w = G.win(p);
    const recd = (p.type === 'rerecord' ? p.tracks.concat(p.vaultSongs || []).map(t => t + " (Taylor's Version)") : p.tracks.concat(p.extras || [])).filter(t => s.songs[t] && s.songs[t].st !== 'written' && !pj.singles.includes(t));
    const sg = UI.sel['sg:' + p.id] || recd[0];
    out.push(card(`<div class="between"><h2>${h(p.title)}</h2>${pill(stageName(st))}</div><p class="small muted">Release: ${h(G.fmtDate(w.rel))}${p.surprise ? ' · Surprise drop' : ''}</p>
      <div class="statrow"><span>Hype</span>${bar(pj.hype)}<b>${Math.round(pj.hype)}</b></div>
      ${st === 'pre' || st === 'finish' ? `<h3>Pre-release</h3>${list.map(f => `<div class="between small"><span>${h(f[1])}</span>${pj.pre[f[0]] ? pill('Done', 'ok') : st === 'pre' ? `<button class="btn sm" data-act="do" data-id="pre:${p.id}:${f[0]}" ${f[0] === 'single' ? `data-arg="${h(sg || '')}"` : ''}>Do · ${f[2]}</button>` : '<span class="muted">Opens in pre-release</span>'}</div>`).join('')}` : ''}
      ${recd.length ? `<label class="field"><span>${pj.singles.length ? 'Next single' : 'Lead single'}</span><select data-act="selsg" data-p="${p.id}">${recd.map(t => `<option ${t === sg ? 'selected' : ''}>${h(t)}</option>`).join('')}</select></label>` : ''}
      ${st === 'promo' ? `<div class="row"><button class="btn sm" data-act="single" data-p="${p.id}" ${recd.length ? '' : 'disabled'}>Release this single · 1</button></div>` : ''}
      ${pj.singles.length ? `<p class="small">Singles: ${pj.singles.map(h).join(', ')}</p>` : ''}
      <div class="row"><button class="btn ghost sm" data-act="approve" data-p="${p.id}" ${pj.approval ? 'disabled' : ''}>${pj.approval ? 'Plan approved' : 'Send plan for approval · 1'}</button>
      ${(s.mode === 'era' || p.custom) && st !== 'release' && s.abs < w.fs ? `<button class="btn ghost sm" data-act="move" data-p="${p.id}" data-d="-2">Release 2 weeks earlier</button><button class="btn ghost sm" data-act="move" data-p="${p.id}" data-d="2">2 weeks later</button>` : ''}</div>`));
    if (st === 'pre' || st === 'promo') out.push(card(`<h3>Sponsors</h3><p class="small muted">A sponsor pays up front, then needs a shoot and an appearance. Missing either loses the deal.</p>${ER.SPONSORS.map(sp => { const has = s.sponsors.find(x => x.id === sp.id && !x.lost && s.abs - x.abs < 30); return `<div class="between small"><span>${h(sp.n)}</span>${has ? pill('Signed') : `<button class="btn ghost sm" data-act="sponsor" data-id="${sp.id}">Sign</button>`}</div>`; }).join('')}`));
  });
  if (!out.length) out.push(card(`<h2>Rollout</h2><p class="muted">No release is being planned right now. Rollout opens when an album reaches its finishing stage.</p>`));
  return out.join('');
};
VIEWS.cover = function () {
  const s = S(), ps = G.allProjects().filter(p => p.type !== 'demos' && (['finish','pre','release','promo','tourprep','tour','rest'].includes(G.stageOf(p, s.abs)) || G.pj(p.id).released));
  if (!ps.length) return card(`<h2>Cover Studio</h2><p class="muted">Covers are designed in an album's finishing stage. Every cover is original, not a copy of a real one.</p>`);
  const pid = UI.sel.cover && ps.find(p => p.id === UI.sel.cover) ? UI.sel.cover : ps[ps.length - 1].id, p = G.proj(pid), pj = G.pj(pid);
  const d = UI.sel.design && UI.sel.design.pid === pid ? UI.sel.design : (UI.sel.design = Object.assign({ pid }, pj.cover || G.autoCover(p), { auto:false }));
  const sel = (k, arr, lab) => `<label class="field"><span>${lab}</span><select data-act="cv" data-k="${k}">${arr.map(v => `<option value="${v.id || v}" ${d[k] === (v.id || v) ? 'selected' : ''}>${h(v.n || v)}</option>`).join('')}</select></label>`;
  const inFinish = G.stageOf(p, s.abs) === 'finish' && !pj.fin.cover;
  return card(`<h2>Cover Studio</h2><div class="chips">${ps.map(q => `<button class="chip ${q.id === pid ? 'on' : ''}" data-act="cvp" data-id="${q.id}">${h(q.short || q.title)}</button>`).join('')}</div>
    <div class="coverwrap">${coverSVG(d, 200, d.upload ? pid : null)}<div><b>${h(p.title)}</b><p class="small muted">Album titles sit beside the art, not on it.</p><p class="small">Fan and critic reaction: <b>${G.coverScore(p, d)}</b></p></div></div>
    ${sel('pal', ER.PALETTES, 'Palette')}${sel('sym', ER.SYMBOLS, 'Image')}${sel('lay', ER.LAYOUTS, 'Layout')}${sel('fin', ER.FINISHES, 'Finish')}
    <div class="row"><button class="btn" data-act="savecover">${inFinish ? 'Save cover · 2 blocks' : 'Save cover'}</button><button class="btn ghost sm" data-act="variant">Add a variant cover (${pj.cover && pj.cover.variants || 0})</button>
    <label class="btn ghost sm">Use your own image<input type="file" accept="image/*" data-act="upload" hidden></label>${uploads()[pid] ? `<button class="btn ghost sm" data-act="unupload">Remove image</button>` : ''}</div>
    <p class="small faint">Your own images stay in this browser on this device. They are not built into the game or shared with its link. Variant covers sell extra copies, but more than three risks fan backlash.</p>`)
  + card(`<h3>Your shelf</h3><div class="shelf">${s.released.map(r => { const q = G.proj(r.pid); return q ? `<div class="sh">${coverSVG(G.pj(r.pid).cover, 84, r.pid)}<span class="small">${h(q.short || q.title)}</span></div>` : ''; }).join('') || '<p class="small muted">Released albums appear here.</p>'}</div>`);
};
VIEWS.tour = function () {
  const s = S(), out = [];
  const tps = G.allProjects().filter(p => p.tour && ['promo','tourprep','tour','release'].includes(G.stageOf(p, s.abs)));
  const freeNoTour = s.flags.free || s.mode === 'era' ? G.allProjects().filter(p => p.custom && !p.tour && G.pj(p.id).released) : [];
  tps.forEach(p => {
    const pj = G.pj(p.id), st = G.stageOf(p, s.abs), w = G.win(p);
    if (p.tour.kind === 'opening') { out.push(card(`<h2>${h(p.tour.name)}</h2><p class="small muted">${h(G.fmtDate(w.ts))} to ${h(G.fmtDate(w.te))}. You open for bigger acts. Each week of shows brings new fans.</p>`)); return; }
    if (p.tour.kind === 'cancelled') { out.push(card(`<h2>${h(p.tour.name)}</h2><p class="muted">Cancelled.</p>`)); return; }
    const tr = pj.tour;
    if (tr && tr.approved && s.abs < w.ts) {
      out.push(card(`<div class="between"><h2>${h(tr.name)}</h2>${pill('On sale')}</div>${p.tour.note ? `<p class="small muted">${h(p.tour.note)}</p>` : ''}
        <p class="small">${tr.nights} ${tr.tier} dates from ${h(G.fmtDate(w.ts))}. <b>${G.fmtN(tr.presold || 0)}</b> tickets sold so far.</p>
        <p class="small">Openers: ${h((tr.openers || []).join(', ') || 'To be announced')}</p><p class="small muted">Setlist: ${h((tr.setlist || []).join(' · '))}</p>`));
      return;
    }
    if (tr && tr.approved) {
      out.push(card(`<div class="between"><h2>${h(tr.name)}</h2>${pill(stageName(st))}</div><p class="small muted">${h(G.fmtDate(w.ts))} to ${h(G.fmtDate(w.te))} · ${tr.nights} ${tr.tier} nights · ${h(tr.regions.join(', '))}</p>
        <div class="grid3"><div><b>${tr.played}</b><div class="small muted">Shows</div></div><div><b>${G.fmtN(tr.tickets)}</b><div class="small muted">Tickets</div></div><div><b>${G.fmtM(tr.gross)}</b><div class="small muted">Gross</div></div></div>
        ${ER.TOUR_SHOWS[p.id] ? `<p class="small muted">The real tour played about ${ER.TOUR_SHOWS[p.id]} shows.</p>` : ''}
        ${!p.tour.target && p.tour.est ? `<p class="small muted">Its real gross is not confirmed. The game sizes it from a rough estimate of about ${G.fmtM(p.tour.est)}.</p>` : ''}
        ${p.tour.target ? `<p class="small">Real tour target: about ${G.fmtM(p.tour.target)}. Matching its scale gives a Canon bonus. Going far past it costs Energy.</p>${bar(tr.gross, p.tour.target)}` : ''}
        ${(pj.diary || []).length ? `<h3>Tour diary</h3>${pj.diary.slice(0, 6).map(d => `<div class="between small"><span>${h(d.city)}: ${'★'.repeat(d.stars)}</span><span class="muted">${h(d.moment)}</span></div>`).join('')}` : ''}
        <p class="small">Openers: ${h((tr.openers || []).join(', ') || 'None')}</p><p class="small muted">Setlist: ${h((tr.setlist || []).join(' · '))}</p>${p.tour.surprise ? '<p class="small">Surprise-song slots: two acoustic songs a night, changing every show.</p>' : ''}`));
      return;
    }
    const plan = UI.sel.plan && UI.sel.plan.pid === p.id ? UI.sel.plan : (UI.sel.plan = Object.assign({ pid:p.id }, G.suggestTour(p)));
    UI.sel.tier = plan.tier;
    const rv = G.reviewTour(p, plan), cat = G.catalog();
    out.push(card(`<div class="between"><h2>${h(p.tour.name)}</h2>${pill(stageName(st))}</div>${p.tour.note ? `<p class="small muted">${h(p.tour.note)}</p>` : ''}<p class="small muted">Starts ${h(G.fmtDate(w.ts))}. Plan it, then send it to your manager and publicist.</p>
      <div class="stage3d short" id="t3venue"></div>
      <label class="field"><span>Show concept</span><select data-act="tp" data-k="concept">${['Told in acts, one per era','A single story, start to finish','Greatest hits, fast and loud'].map(c => `<option ${plan.concept === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <label class="field"><span>Venues</span><select data-act="tp" data-k="tier">${['theater','arena','stadium'].map(t => `<option ${plan.tier === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Nights: ${plan.nights}</span><input type="range" min="4" max="160" value="${plan.nights}" data-act="tp" data-k="nights"></label>
      <label class="field"><span>Ticket prices</span><select data-act="tp" data-k="price">${[1, 2, 3].map(v => `<option value="${v}" ${plan.price === v ? 'selected' : ''}>${['', 'Low', 'Standard', 'Top tier'][v]} (~$${G.priceOf(v, s.abs)})</option>`).join('')}</select></label>
      <label class="field"><span>Staging and costumes</span><select data-act="tp" data-k="prod">${[1, 2, 3].map(v => `<option value="${v}" ${plan.prod === v ? 'selected' : ''}>${['', 'Simple', 'Big', 'Maximum'][v]}</option>`).join('')}</select></label>
      <h3>Regions</h3><div class="chips">${['North America','Europe','Asia and Oceania','Latin America'].map(r => `<button class="chip ${plan.regions.includes(r) ? 'on' : ''}" data-act="tpr" data-v="${r}">${r}</button>`).join('')}</div>
      <h3>Openers</h3><div class="chips">${(p.tour.openers || []).map(o => `<button class="chip ${plan.openers.includes(o) ? 'on' : ''}" data-act="tpo" data-v="${h(o)}">${h(o)}</button>`).join('') || '<span class="small muted">Invented acts are available in free play.</span>'}</div>
      <h3>Setlist (${plan.setlist.length})</h3><div class="chips setl">${cat.map(t => `<button class="chip ${plan.setlist.includes(t) ? 'on' : ''}" data-act="tps" data-v="${h(t)}">${h(t)}</button>`).join('')}</div>
      <p class="small">Expected sell-through: <b>${Math.round(rv.sell * 100)}%</b>. Production cost: ${G.fmtM(rv.cost)}.</p>
      ${pj.tour && pj.tour.objections && pj.tour.objections.length ? `<div class="obj">${pj.tour.objections.map(o => `<p class="small"><b>${o.from === 'manager' ? 'Manager' : 'Publicist'}:</b> ${h(o.x)}</p>`).join('')}</div>` : ''}
      <div class="row"><button class="btn" data-act="submittour" data-p="${p.id}">Send for approval</button><button class="btn ghost sm" data-act="suggest" data-p="${p.id}">Use the manager's suggestion</button></div>`));
  });
  freeNoTour.forEach(p => out.push(card(`<h2>Tour ${h(p.title)}</h2><label class="field"><span>Length</span><select id="ct-w"><option value="20">20 weeks</option><option value="40" selected>40 weeks</option><option value="70">70 weeks</option></select></label><button class="btn" data-act="customtour" data-p="${p.id}">Put a tour on the calendar</button>`)));
  const canc = Object.keys(s.pj).filter(id => s.pj[id].cancelled);
  if (canc.length) out.push(card(`<h3>Cancelled tours</h3>${canc.map(id => { const c = s.pj[id].cancelled; return `<div class="logrow"><div class="between"><b>${h(c.name)}</b><span class="small muted">${h(G.fmtDate(c.abs))}</span></div><div class="small">${c.why === 'pandemic' ? 'Cancelled by the COVID-19 pandemic.' : 'Cancelled.'}${c.planned ? ` ${G.fmtN(c.sold)} tickets refunded.` : ' It was never planned.'}</div></div>`; }).join('')}`));
  if (G.world('lockdown')) out.unshift(card(`<span class="eyebrow">Live music is shut down</span><p class="small">Because of the COVID-19 pandemic, venues are closed. No tours can go on sale until live music returns.</p>`, 'world'));
  const past = Object.keys(s.pj).filter(id => s.pj[id].tour && s.pj[id].tourDone);
  if (past.length) out.push(card(`<h3>Past tours</h3>${past.map(id => { const t = s.pj[id].tour; return `<div class="between small"><span>${h(t.name)}</span><span class="muted">${t.played} shows · ${G.fmtM(t.gross)}</span></div>`; }).join('')}`));
  if (!tps.length && !freeNoTour.length) out.unshift(card(`<h2>Tour Desk</h2><p class="muted">No tour is being planned. Tours open here in an era's promotion stage.</p>`));
  return out.join('');
};
VIEWS.inbox = function () {
  const s = S(); const F = { manager:'Manager', publicist:'Publicist', label:'Label', family:'Mom', collab:'Collaborator', promoter:'Promoter', fans:'Fan club' };
  return card(`<div class="between"><h2>Team Inbox</h2><button class="btn ghost sm" data-act="readall">Mark all read</button></div>
    ${s.duties.length ? `<h3>Assignments</h3>${s.duties.map(d => `<div class="between small"><span>${h(d.l)}</span><span class="muted">Due ${h(G.fmtDate(d.due))}</span></div>`).join('')}` : ''}
    <h3>Messages</h3>${s.inbox.map(m => `<div class="msg ${m.read ? '' : 'unread'}" data-act="read" data-id="${m.id}">${m.memory != null && !m.replied ? `<button class="btn sm" style="float:right" data-act="memory" data-id="${m.id}">Respond</button>` : ''}${m.mail != null && !m.replied ? `<button class="btn sm" style="float:right" data-act="reply" data-id="${m.id}">Reply</button>` : ''}<div class="between"><b>${h(m.subj)}</b><span class="small muted">${h(F[m.from] || m.from)}</span></div><div class="small muted">${h(m.x)}</div><div class="small faint">${h(G.fmtDate(m.abs))}</div></div>`).join('') || '<p class="small muted">No messages.</p>'}`);
};
VIEWS.eggs = function () {
  const s = S(), E = s.eggs, tg = G.eggTargets();
  const ty = UI.sel.eggType || 'caps', tgt = UI.sel.eggTarget || (tg[0] && tg[0].id);
  return card(`<h2>Easter Eggs</h2><p class="small muted">Drop a clue. It pays off only if fans decode it and it points to something true. Harder clues take longer but grow the hardcore fans more.</p>
    <label class="field"><span>Clue</span><select data-act="eggt">${ER.EGG_TYPES.map(t => `<option value="${t.id}" ${t.id === ty ? 'selected' : ''}>${h(t.n)} (difficulty ${t.diff})</option>`).join('')}</select></label>
    <label class="field"><span>Points to</span><select data-act="eggg">${tg.map(t => `<option value="${t.id}" ${t.id === tgt ? 'selected' : ''}>${h(t.l)}</option>`).join('')}</select></label>
    <button class="btn" data-act="plant" ${G.canSpend(1) ? '' : 'disabled'}>Plant it · 1 block</button>
    <div class="statrow"><span>Fan fatigue</span>${bar(E.fatigue, 60, 'warn')}<b>${Math.round(E.fatigue)}</b></div><p class="small faint">Too many false leads tire fans out.</p>`)
  + card(`<h3>Clues in play</h3>${E.planted.slice().reverse().slice(0, 12).map(e => `<div class="logrow"><div class="between"><b>${h(e.n)}</b><span class="small muted">${h(G.fmtDate(e.abs))}</span></div>${e.done ? `<div class="small">${h(e.res)}</div>` : `<div class="small muted">Fans are decoding…</div>${bar(e.prog, e.need)}`}</div>`).join('') || '<p class="small muted">None yet.</p>'}`)
  + card(`<h3>Egg Log</h3><p class="small muted">Real eggs from her history, collected as you reach them.</p>${E.log.map(l => `<div class="between small"><span>🥚 ${h(l.n)}</span><span class="muted">${h(G.fmtDate(l.abs))}</span></div>`).join('') || '<p class="small muted">None collected yet.</p>'}`);
};
VIEWS.fandom = function () {
  const s = S(), A = G.art(), y = G.yw().y, hard = Math.round(s.stats.fans * (0.05 + s.eggs.decoded * .002));
  const ev = [];
  if (y < 2010 && y >= 2005) ev.push(['myspace', 'Reply to fans on MySpace', 1]);
  if (s.flags.secretsessions) ev.push(['secret', 'Host a Secret Session', 2]);
  if (s.flags.bracelets) ev.push(['bracelets', 'Trade friendship bracelets at a show', 1]);
  if (G.world('lockdown')) { ev.length = 0; ev.push(['livestream', 'Livestream for fans from home', 1]); if (s.flags.secretsessions) ev.push(['zoom', 'Surprise fans on a video call', 1]); }
  else if (!s.flags.hidden) ev.push(['meet', 'Surprise fans at a meet-up', 2]);
  if (s.flags.hidden) { ev.length = 0; ev.push(['readfans', 'Quietly read the fan theories', 1]); }
  const braceletCard = card(`<h3>Friendship bracelets</h3><p class="small muted">Make a bracelet. You trade them at shows, and each one helps a show night a little.</p>
    <div class="row"><input id="br-word" maxlength="12" placeholder="Up to 12 letters" style="flex:1;background:var(--raised);border:1px solid var(--rule);border-radius:10px;padding:8px 10px">
    <button class="btn sm" data-act="bracelet">Make it</button></div>
    <p class="small faint">Ideas: ${G.allProjects().filter(p => p.type === 'album').slice(-4).map(p => h(String(p.short || p.title).toUpperCase().slice(0, 12))).join(' · ')}</p>
    <div class="bracelets">${(s.bracelets || []).slice(0, 8).map(b => `<div class="bracelet">${b.word.split('').map((ch, i) => `<i style="background:${b.colors[i % b.colors.length] || '#f6d38a'}">${h(ch)}</i>`).join('')}</div>`).join('')}</div>`);
  return braceletCard + card(`<h2>${h(A.fanName)}</h2><div class="grid3"><div><b>${G.fmtN(s.stats.fans)}</b><div class="small muted">Fans</div></div><div><b>${G.fmtN(hard)}</b><div class="small muted">Hardcore</div></div><div><b>${s.eggs.decoded}</b><div class="small muted">Eggs decoded</div></div></div>
    ${G.curveMode() ? `<div class="statrow"><span>Momentum vs reality</span>${bar(G.momentum() * 50, 80)}<b>${Math.round(G.momentum() * 100)}%</b></div><p class="small faint">Your fan base follows her real growth in each era. Above 100% you are doing better than she did, and below it worse.</p>` : ''}
    <h3>Fan events</h3>${ev.map(([k, l, c]) => `<div class="between small"><span>${h(l)}</span><button class="btn sm" data-act="fan" data-k="${k}" data-c="${c}" ${G.canSpend(c) ? '' : 'disabled'}>Do · ${c}</button></div>`).join('')}`)
  + card(`<h3>Fan theories</h3><p class="small faint">Simulated posts from invented usernames only, never real accounts.</p>${s.feed.slice(0, 20).map(f => `<div class="post"><b>@${h(f.h)}</b> <span class="small">${h(f.x)}</span><div class="small faint">${h(G.fmtDate(f.abs))}</div></div>`).join('') || '<p class="small muted">Quiet so far.</p>'}`);
};
VIEWS.press = function () {
  const s = S(), A = G.art(), y = G.yw().y;
  const outs = ER.OUTLETS.filter(o => y >= o.from);
  const groups = {}; A.people.forEach(p => { if (p.from <= y) (groups[p.g] = groups[p.g] || []).push(p); });
  if (s.flags.hidden) return card(`<h2>Press</h2><p class="small">You are out of public view. No interviews, statements or posts until you come back. Press Heat is cooling fast.</p>
    <div class="statrow"><span>Press Heat</span>${bar(s.stats.heat)}<b>${Math.round(s.stats.heat)}</b></div>
    <button class="btn ghost sm" data-act="unhide">Return to public view early</button>`) + VIEWS.people();
  return card(`<h2>Press</h2><div class="statrow"><span>Press Heat</span>${bar(s.stats.heat)}<b>${Math.round(s.stats.heat)}</b></div>
    <label class="field"><span>Interview</span><select data-act="selout">${outs.map(o => `<option value="${o.id}" ${UI.sel.out === o.id ? 'selected' : ''}>${h(o.n)}</option>`).join('')}</select></label>
    <div class="row"><button class="btn sm" data-act="press" data-k="interview" ${G.canSpend(1) ? '' : 'disabled'}>Do the interview · 1</button><button class="btn sm" data-act="press" data-k="statement" ${G.canSpend(1) ? '' : 'disabled'}>Issue a statement · 1</button>
    <button class="btn sm" data-act="press" data-k="social" ${G.canSpend(1) ? '' : 'disabled'}>Post · 1</button><button class="btn ghost sm" data-act="press" data-k="silence">${s.flags.silence ? 'End the silence' : 'Go silent'}</button></div>
    <p class="small faint">Silence cools Press Heat faster but slows fan growth.</p>`)
  + VIEWS.people();
};
VIEWS.people = function () {
  const s = S(), A = G.art(), y = G.yw().y; const groups = {}; A.people.forEach(p => { if (p.from <= y) (groups[p.g] = groups[p.g] || []).push(p); });
  return card(`<h2>People</h2><p class="small muted">People arrive in the year they enter her public story. Relationship cards use only what was publicly reported.</p>${Object.keys(groups).map(g => `<h3>${h(g)}</h3>${groups[g].map(p => `<div class="between small ${p.to && p.to < y ? 'past' : ''}"><b>${h(p.n)}</b><span class="muted">${h(p.role)}</span></div>`).join('')}`).join('')}`);
};
VIEWS.charts = function () {
  const s = S();
  // Your albums sit at their own chart positions; rivals and other albums fill the rest by sales.
  const mine = s.released.filter(r => r.pos != null && r.pos <= 200 && s.abs - r.abs < 400).map(r => ({ t:G.proj(r.pid).title, by:G.art().name, pos:r.pos, you:true, r }));
  const others = s.charts.albums.filter(c => c.rival && s.abs - c.abs < 30).map(c => ({ t:c.t, by:c.by, u:c.fw * Math.pow(.6, c.wk) + c.fw * .01, rival:true }))
    .concat(['Invented Band A','Various Artists','A Soundtrack','A Country Duo','A Boy Band','A Rapper','A Rock Band','An Indie Act','A Pop Duo','A Singer-Songwriter'].map((n, i) => ({ t:n, by:'', u:90000 / (i + 1.2) })))
    .sort((a, b) => b.u - a.u);
  const list = []; let oi = 0;
  for (let pos = 1; pos <= 10; pos++) { const m = mine.find(x => x.pos === pos && !list.includes(x)); if (m) list.push(m); else if (others[oi]) list.push(Object.assign({ pos }, others[oi++])); }
  const singles = s.charts.singles.filter(c => !c.out).slice(0, 10).sort((a, b) => a.pos - b.pos);
  const runs = s.released.filter(r => G.proj(r.pid) && G.proj(r.pid).type !== 'edition').slice().reverse();
  return card(`<h2>Billboard 200 this week</h2><p class="small faint">Simulated chart, updated every week. Rival albums appear on their real release dates.</p>${list.map(c => `<div class="chart ${c.you ? 'you' : c.rival ? 'rival' : ''}"><b>${c.pos}</b><div><b>${h(c.t)}</b><div class="small muted">${h(c.by)}${c.you ? ` · ${c.r.wk} weeks on the chart` : ''}</div></div><span class="small">${c.you ? '' : G.fmtN(c.u)}</span></div>`).join('')}
    ${mine.filter(m => m.pos > 10).map(m => `<p class="small muted">${h(m.t)} is at No. ${m.pos}.</p>`).join('')}`)
  + card(`<h2>Your album runs</h2><p class="small faint">Real runs are approximate.</p>${runs.map(r => { const p = G.proj(r.pid), run = r.run; return `<div class="between small"><span>${h(p.title)}</span><span>Debut No. ${r.debutPos || r.peak} · Peak ${r.peak}${r.no1w ? ` · ${r.no1w} wk at No. 1` : ''}${run ? ` <span class="muted">(real: ${run.no1 ? run.no1 + ' wk at No. 1' : 'peak ' + run.peak})</span>` : ''}</span></div>`; }).join('') || '<p class="small muted">Nothing released yet.</p>'}`)
  + card(`<h2>Hot 100: your singles</h2>${singles.map(c => `<div class="chart you"><b>${c.pos}</b><div><b>${h(c.t)}</b><div class="small muted">Debuted at No. ${c.debut}${c.realDebut ? ` (real No. ${c.realDebut})` : ''} · Peak ${c.peak}${c.real ? ` (real peak ${c.real})` : ''} · ${c.wk} weeks</div></div></div>`).join('') || '<p class="small muted">No singles on the chart.</p>'}`)
  + card(`<h2>Awards</h2>${s.awards.map(a => `<div class="between small"><span>🏆 ${h(a.n)}</span><span class="muted">${a.y}</span></div>`).join('') || '<p class="small muted">None yet.</p>'}`)
  + card(`<h2>First weeks</h2>${s.released.map(r => { const p = G.proj(r.pid); return `<div class="between small"><span>${h(p.title)}</span><span>${G.fmtN(r.fw)}${r.real ? ` <span class="muted">(real ${G.fmtN(r.real)})</span>` : ''}</span></div>`; }).join('') || '<p class="small muted">Nothing released yet.</p>'}`);
};
VIEWS.legacy = function () {
  const s = S(), hist = s.history.filter((_, i) => i % 4 === 0);
  const mx = Math.max(1, ...hist.map(x => x.fans));
  const spark = hist.length > 2 ? `<svg viewBox="0 0 300 70" class="spark" aria-label="Fans over time"><polyline fill="none" stroke="var(--era)" stroke-width="2" points="${hist.map((x, i) => `${(i / (hist.length - 1) * 300).toFixed(1)},${(68 - x.fans / mx * 64).toFixed(1)}`).join(' ')}"/></svg>` : '';
  const P = G.allProjects().filter(p => p.goals);
  const gp = G.goalProgress();
  return (gp ? card(`<h3>Career goal: ${h(gp.g.n)}</h3><p class="small">${s.goalDone ? `Reached on ${h(G.fmtDate(s.goalDone))}.` : 'Not reached yet.'}</p>${s.mods && s.mods.length ? `<p class="small muted">Played with: ${s.mods.map(id => h((ER.MODIFIERS.find(m => m.id === id) || {}).n)).join(', ')}</p>` : ''}<p class="small muted">Season goals completed: ${s.seasonsDone || 0}</p>`) : '') + card(`<h2>Legacy</h2><div class="grid3"><div><b class="big">${G.canon()}</b><div class="small muted">Canon Score</div></div><div><b>${s.awards.length}</b><div class="small muted">Awards</div></div><div><b>${Math.round(s.stats.own)}%</b><div class="small muted">Ownership</div></div></div>
    <p class="small muted">The Canon Score measures how close your choices were to what she really did.</p>${spark}`)
  + card(`<h3>Era gallery</h3><div class="shelf">${s.released.map(r => { const p = G.proj(r.pid); return `<div class="sh">${coverSVG(G.pj(r.pid).cover, 84, r.pid)}<span class="small"><b>${h(p.short || p.title)}</b>${p.eraNo ? `<br><span class="faint">Era ${p.eraNo}</span>` : ''}<br>${G.fmtN(r.total)} sold</span></div>`; }).join('') || '<p class="small muted">Your albums appear here.</p>'}</div>`)
  + card(`<h3>Era goals</h3>${P.filter(p => s.goals[p.id] || G.stageOf(p, s.abs) !== 'none').map(p => `<div class="logrow"><b>${h(p.title)}</b>${p.goals.map((g, i) => `<div class="small">${s.goals[p.id] ? (s.goals[p.id][i] ? '✅' : '❌') : '⏳'} ${h(g.l)}</div>`).join('')}</div>`).join('') || '<p class="small muted">Goals appear as each era begins.</p>'}`)
  + tradingCards()
  + card(`<h3>Photo booth</h3><p class="small muted">Pose your performer in any era look you have reached, then save the picture.</p>
      <div class="chips">${G.allProjects().filter(p => p.type !== 'demos' && G.pj(p.id).released).map(p => `<button class="chip ${UI.sel.booth === p.id ? 'on' : ''}" data-act="booth" data-v="${p.id}">${h(p.short || p.title)}</button>`).join('') || '<span class="small muted">Release an album first.</span>'}</div>
      ${UI.sel.booth ? `<div class="chips">${[['stadium','Stadium'],['awards','Awards'],['press','Red carpet'],['studio','Studio'],['home','Home']].map(([k, l]) => `<button class="chip ${UI.sel.boothSet === k ? 'on' : ''}" data-act="boothset" data-v="${k}">${l}</button>`).join('')}</div>
        <div class="chips">${[['sing','Singing'],['wave','Waving'],['bow','Bowing'],['dance','Dancing']].map(([k, l]) => `<button class="chip ${UI.sel.boothPose === k ? 'on' : ''}" data-act="boothpose" data-v="${k}">${l}</button>`).join('')}</div>
        <div class="stage3d" id="t3booth"></div><button class="btn sm" data-act="snap">Save photo</button>` : ''}`)
  + card(`<h3>Achievements</h3><div class="chips">${Object.keys(G.ACH).map(k => `<span class="chip ${s.ach[k] ? 'on' : ''}">${s.ach[k] ? '★' : '☆'} ${h(G.ACH[k])}</span>`).join('')}</div>`)
  + (G.canRetire() || s.flags.retired ? card(`<h3>Retirement</h3>${s.flags.retired ? `<p class="small">Retired in ${ER.yw(s.flags.retired).y}.</p><div class="row"><button class="btn ghost sm" data-act="showend">See your career</button><button class="btn ghost sm" data-act="unretire">Come out of retirement</button></div>`
      : `<p class="small muted">End your career with a farewell tour, or retire straight away. You can always come back.</p><div class="row"><button class="btn ghost sm" data-act="tofarewell" ${s.flags.farewell ? 'disabled' : ''}>${s.flags.farewell ? 'Farewell tour planned' : 'Plan a farewell tour'}</button><button class="btn ghost sm" data-act="retireask">Retire</button></div>`}`) : '')
  + card(`<h3>Business holdings</h3><p class="small">Masters ownership: ${Math.round(s.stats.own)}%. Money: ${G.fmtM(s.stats.money)}. Industry Clout: ${Math.round(s.stats.clout)}.</p>`)
  + card(`<h3>Your timeline beside hers</h3>${s.log.filter(l => !l.s && !l.drama && l.real).slice(-30).reverse().map(l => `<div class="logrow"><div class="between"><b>${h(l.t)}</b><span class="small muted">${ER.yw(l.abs).y}</span></div><div class="small">You: ${h(l.l)}</div><div class="small muted">She: ${h(l.real)}</div></div>`).join('') || '<p class="small muted">Your choices will be listed here.</p>'}`);
};

/* ---------- Modals ---------- */
function modal(html, cls) { const m = document.createElement('div'); m.className = 'modal ' + (cls || ''); m.innerHTML = `<div class="sheet">${html}</div>`; document.body.appendChild(m); return m; }
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.remove()); }
UI.closeModals = closeModals;
function modals() {
  const s = S(); if (!s || document.querySelector('.modal')) return;
  if (s.week.pending.length) return eventModal(s.week.pending[0]);
  const m = s.modal[0]; if (!m) return;
  if (UI.modalKinds[m.k]) return UI.modalKinds[m.k](m, s);
  if (m.k === 'goaldone') { const gp = G.goalProgress();
    modal(`<span class="eyebrow">Career goal</span><h2>You did it</h2><p>${h(gp ? gp.g.d : '')}</p><p class="small muted">Reached on ${h(G.fmtDate(s.abs))}. Keep playing as long as you like.</p><button class="btn big" data-act="modalok">Keep going</button>`);
    if (window.SND) SND.fanfare(); return; }
  if (m.k === 'plan') {
    const pr = [['writing','Writing'],['fans','Fans'],['press','Press'],['rest','Rest'],['business','Business']];
    UI.sel.pri = UI.sel.pri || [];
    const el = modal(`<span class="eyebrow">Week 1</span>${m.seasonDone != null ? `<p class="small">Last season: <b>${m.seasonDone} of 3</b> goals done.${m.seasonDone === 3 ? ' A perfect season.' : ''}</p>` : ''}<h2>Your plan for ${G.yw().y}</h2><p class="small muted">Pick two priorities. Tasks tied to them work 25% better all year.</p><div class="chips">${pr.map(([k, l]) => `<button class="chip ${UI.sel.pri.includes(k) ? 'on' : ''}" data-act="pri" data-k="${k}">${l}</button>`).join('')}</div><button class="btn big" data-act="planok">Set the plan</button>`);
    return;
  }
  if (m.k === 'year') {
    const Y = s.years[m.y] || {};
    modal(`<span class="eyebrow">Year in Review</span><h2>${m.y}</h2><div class="grid3"><div><b>${G.fmtN((Y.fans1 || s.stats.fans) - (Y.fans0 || 0))}</b><div class="small muted">New fans</div></div><div><b>${G.fmtN(Y.units || 0)}</b><div class="small muted">Units sold</div></div><div><b>${G.fmtM((Y.money1 || 0) - (Y.money0 || 0))}</b><div class="small muted">Money</div></div></div>
      <div class="grid3"><div><b>${Y.shows || 0}</b><div class="small muted">Shows</div></div><div><b>${G.fmtM(Y.gross || 0)}</b><div class="small muted">Tour gross</div></div><div><b>${Y.awards || 0}</b><div class="small muted">Awards</div></div></div>
      ${Y.releases && Y.releases.length ? `<p class="small">Released: ${Y.releases.map(h).join(', ')}</p>` : ''}<p>Canon Score: <b>${Y.canon || G.canon()}</b></p><button class="btn big" data-act="modalok">On to ${m.y + 1}</button>`);
    return;
  }
  if (m.k === 'release') {
    const p = G.proj(m.pid), r = s.released.find(x => x.pid === m.pid);
    modal(`<span class="eyebrow">Release week</span><h2>${h(p.title)}</h2><div class="coverwrap">${coverSVG(G.pj(p.id).cover, 140, p.id)}<div><p><b>${G.fmtN(r.fw)}</b> first week</p>${r.real ? `<p class="small muted">Real: ${G.fmtN(r.real)}</p>` : ''}<p class="small">Quality ${r.q} · Debut No. ${r.peak}</p></div></div><button class="btn big" data-act="modalok">Continue</button>`);
    return;
  }
  if (m.k === 'challenge') { const c = s.challenge;
    modal(`<span class="eyebrow">Daily challenge</span><h2>${c.won ? 'Challenge complete' : 'Not this time'}</h2><p>${h(c.n)}: ${h(c.d)}</p><p class="small muted">Streak: ${G.challengeStreak()} day${G.challengeStreak() === 1 ? '' : 's'}. Come back tomorrow for a new one.</p>
      <div class="stack tight"><button class="btn big" data-act="modalok">Keep playing this save</button><button class="btn ghost" data-act="totitle">Back to the title screen</button></div>`);
    if (c.won && window.SND) SND.fanfare(); return; }
  if (m.k === 'wrap') {
    const w = G.eraWrap(m.pid); if (!w) { s.modal.shift(); return modals(); }
    modal(`<span class="eyebrow">Era wrap-up</span><h2>${h(w.p.title)}</h2><div class="coverwrap">${coverSVG(G.pj(w.p.id).cover, 110, w.p.id)}<div>
      <p class="small">First week: <b>${G.fmtN(w.fw)}</b>${w.real ? ` <span class="muted">(real ${G.fmtN(w.real)})</span>` : ''}</p><p class="small">Peak No. ${w.peak}${w.no1w ? `, ${w.no1w} weeks at No. 1` : ''}</p></div></div>
      ${w.best ? `<p class="small">Your best song: <b>${h(w.best)}</b> (quality ${w.bestQ})</p>` : ''}${w.single ? `<p class="small">Biggest single: <b>${h(w.single.t)}</b>, peak No. ${w.single.peak}</p>` : ''}
      ${w.tour ? `<p class="small">${h(w.tour.name)}: ${w.tour.shows} shows, ${G.fmtM(w.tour.gross)}${w.tour.target ? ` <span class="muted">(real ${G.fmtM(w.tour.target)})</span>` : ''}</p>` : ''}
      ${w.moment ? `<div class="truth"><span class="eyebrow">A moment to remember</span><p class="small"><b>${h(w.moment.t)}</b> ${h(w.moment.r)}</p></div>` : ''}
      ${w.goals ? `<p class="small">Era goals: ${w.goals.filter(Boolean).length} of ${w.goals.length}</p>` : ''}<button class="btn big" data-act="modalok">On to the next era</button>`);
    return;
  }
  if (m.k === 'honours') {
    modal(`<span class="eyebrow">${m.y}</span><h2>${h(ER.FREE_AWARDS.n)}</h2><p class="small muted">An invented award show for the years after the real story.</p><div class="stage3d short" id="t3hon"></div>
      ${m.noms.map(n => `<div class="between small"><span><b>${h(n.cat)}</b>: ${h(n.what)}</span><span>${n.won ? '🏆 Won' : 'Nominated'}</span></div>`).join('')}<button class="btn big" data-act="modalok" style="margin-top:10px">Continue</button>`);
    mount3D('#t3hon', { set:'awards', color:'#e8c66a', figs:[{ look:lookFor('awards', G.currentEra()), anim:m.noms.some(n => n.won) ? 'bow' : 'wave' }] }, 'hon');
    if (m.noms.some(n => n.won) && window.SND) SND.fanfare();
    return;
  }
  if (m.k === 'nextera') {
    const P = s.proposal || G.proposeEra(); UI.sel.ne = UI.sel.ne && UI.sel.ne.abs === P.abs ? UI.sel.ne : { abs:P.abs, title:P.titles[0], theme:P.themes[0], weeks:32, n:13, tour:40 };
    const ne = UI.sel.ne, th = ER.ERA_THEMES.find(t => t.id === ne.theme);
    const next = s.mode === 'era' ? G.art().projects.filter(p => p.type !== 'demos' && p.type !== 'edition' && !s.started.includes(p.id) && p.rel > Math.max(...s.started.map(id => G.art().projects.find(q => q.id === id).rel)))[0] : null;
    modal(`<span class="eyebrow">Era ${P.eraNo} · ${h(G.fmtDate(s.abs))}</span><h2>Your next era</h2><p class="small muted">The last era is winding down. Your label has ideas.</p>
      <div class="stage3d" id="t3era"></div>
      <h3>Title</h3><div class="chips">${P.titles.map(t => `<button class="chip ${ne.title === t ? 'on' : ''}" data-act="ne" data-k="title" data-v="${h(t)}">${h(t)}</button>`).join('')}</div>
      <label class="field"><span>Or your own title</span><input id="ne-own" maxlength="40" placeholder="Type a title" value="${P.titles.includes(ne.title) ? '' : h(ne.title)}"></label>
      <h3>Sound</h3><div class="chips">${P.themes.map(id => { const t = ER.ERA_THEMES.find(x => x.id === id); return `<button class="chip ${ne.theme === id ? 'on' : ''}" data-act="ne" data-k="theme" data-v="${id}"><i class="dot" style="background:${t.pals[0][0]}"></i>${h(t.n)}</button>`; }).join('')}</div>
      <p class="small muted">${h(th.vibe)}</p>
      <div class="grid3"><label class="field"><span>Tracks</span><select data-act="nesel" data-k="n">${[10, 12, 13, 14, 16].map(v => `<option ${ne.n === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label class="field"><span>Release in</span><select data-act="nesel" data-k="weeks">${[20, 26, 32, 44, 60].map(v => `<option value="${v}" ${ne.weeks === v ? 'selected' : ''}>${v} weeks</option>`).join('')}</select></label>
      <label class="field"><span>Tour</span><select data-act="nesel" data-k="tour">${[[0, 'None'], [20, '20 weeks'], [40, '40 weeks'], [70, '70 weeks']].map(([v, l]) => `<option value="${v}" ${ne.tour === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <button class="btn big" data-act="startera">Start ${h(ne.title)}</button>
      <div class="row" style="margin-top:8px">${next ? `<button class="btn ghost sm" data-act="nextreal" data-id="${next.id}">The next real era: ${h(next.title)}</button>` : ''}<button class="btn ghost sm" data-act="erabreak" data-w="26">Take six months off</button><button class="btn ghost sm" data-act="erabreak" data-w="52">Take a year off</button>${G.canRetire() ? '<button class="btn ghost sm" data-act="tofarewell">Plan a farewell tour</button><button class="btn ghost sm" data-act="retireask">Retire</button>' : ''}</div>`);
    const seedId = 'c' + P.eraNo + ne.title, pal = ER.seeded(seedId)() < .5 ? th.pals[0] : th.pals[1], lk = ER.makeEraLook(th, pal, seedId);
    mount3D('#t3era', { set:'stadium', color:pal[0], figs:[{ look:Object.assign({}, lk.base, lk.stage), anim:'sing', mic:!!lk.stage.mic, guitar:!!lk.stage.guitar }, { look:Object.assign({}, lk.base, lk.casual), x:1.05, z:-.35, ry:-.5, anim:'idle', s:.92 }] }, 'era');
    return;
  }
  if (m.k === 'farewell') {
    const fw = UI.sel.fw || (UI.sel.fw = { weeks:40, name:'The Farewell Tour' });
    modal(`<span class="eyebrow">One last time</span><h2>Plan a farewell tour</h2><p class="small muted">A greatest-hits stadium tour through every era. Demand for a farewell is huge. When the last show is played, you can retire.</p>
      <div class="stage3d" id="t3fw"></div>
      <label class="field"><span>Name</span><input id="fw-name" maxlength="40" value="${h(fw.name)}"></label>
      <label class="field"><span>Length</span><select data-act="fwsel">${[[20, '20 weeks'], [40, '40 weeks'], [60, '60 weeks'], [80, '80 weeks']].map(([v, l]) => `<option value="${v}" ${fw.weeks === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <button class="btn big" data-act="fwgo">Announce the farewell tour</button><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="modalok">Not yet</button></div>`);
    const lk = ER.makeEraLook(Object.assign({}, ER.ERA_THEMES.find(t => t.id === 'orchestral'), { tops:['sequin','gown','bodysuit'] }), ['#e6c35a', '#fff4c4', '#1a1408'], 'f' + (s.custom.filter(p => p.type === 'farewell').length + 1) + 'farewell');
    mount3D('#t3fw', { set:'stadium', color:'#e6c35a', figs:[{ look:Object.assign({}, lk.base, lk.stage), anim:'wave', mic:true }] }, 'fw');
    return;
  }
  if (m.k === 'retire') {
    const after = m.after === 'farewell';
    modal(`<span class="eyebrow">${after ? 'The last show' : 'A big decision'}</span><h2>${after ? 'The farewell tour is over' : 'Retire?'}</h2>
      <p class="small">${after ? 'The lights go down on the last night. Is this the end?' : 'You can end your career here, with or without a farewell tour first.'}</p>
      <p class="small muted">Retiring shows your whole career. You can still come out of retirement later.</p>
      <div class="stack tight"><button class="btn big" data-act="retirego">Retire</button>${after ? '' : '<button class="btn ghost" data-act="tofarewell">Do a farewell tour first</button>'}<button class="btn ghost" data-act="${after ? 'keepgoing' : 'modalok'}">${after ? 'Keep going after all' : 'Not yet'}</button></div>`);
    return;
  }
  if (m.k === 'ending') {
    const c = G.careerSummary(), A = G.art();
    modal(`<span class="eyebrow">${h(G.fmtDate(s.abs))} · Age ${c.age}</span><h2>${h(A.name)}: a career</h2><div class="stage3d" id="t3end"></div>
      <div class="grid3"><div><b>${c.years}</b><div class="small muted">Years</div></div><div><b>${c.eras}</b><div class="small muted">Albums</div></div><div><b>${G.fmtN(c.units)}</b><div class="small muted">Units</div></div></div>
      <div class="grid3"><div><b>${c.no1}</b><div class="small muted">No. 1 singles</div></div><div><b>${c.awards}</b><div class="small muted">Awards</div></div><div><b>${c.aoty}</b><div class="small muted">Album of the Year</div></div></div>
      <div class="grid3"><div><b>${G.fmtN(c.shows)}</b><div class="small muted">Shows</div></div><div><b>${G.fmtN(c.tickets)}</b><div class="small muted">Tickets</div></div><div><b>${G.fmtM(c.gross)}</b><div class="small muted">Tour gross</div></div></div>
      ${c.best ? `<p class="small">Biggest first week: <b>${h(c.best.t)}</b>, ${G.fmtN(c.best.fw)}.</p>` : ''}
      <p class="small">${c.invented ? `${c.invented} eras of your own after the real story. ` : ''}${G.fmtN(c.fans)} ${h(A.fanName)} · ${Math.round(c.own)}% of the masters · Canon Score ${c.canon}</p>
      <div class="shelf">${s.released.slice(-12).map(r => { const p = G.proj(r.pid); return p ? `<div class="sh">${coverSVG(G.pj(r.pid).cover, 64, r.pid)}<span class="small">${h(p.short || p.title)}</span></div>` : ''; }).join('')}</div>
      <div class="stack tight" style="margin-top:12px"><button class="btn big" data-act="modalok">Enjoy retirement</button><button class="btn ghost" data-act="totitle">Back to the title screen</button></div>
      <p class="small faint">Retired saves keep going quietly. You can come out of retirement from This Week whenever you like.</p>`);
    const e = G.allProjects().filter(p => G.pj(p.id).released).pop();
    mount3D('#t3end', { set:'stadium', color:'#e6c35a', figs:[{ look:lookFor('tour', e), anim:'bow' }] }, 'end');
    return;
  }
  if (m.k === 'free') {
    modal(`<span class="eyebrow">January 2027</span><h2>From here on, the story is yours</h2><p>The documented track ends. From now on, the songs, the calendar and the drama are an invented future, and nothing is labelled.</p><p class="small muted">Invented drama never gives real people invented misconduct or personal crises.</p><button class="btn big" data-act="freeok">Carry on</button>`);
  }
}
function eventModal(id) {
  const ev = G.findEvent(id);
  UI.awardSeen = UI.awardSeen || {};
  if (ev && ev.award && !UI.awardSeen[id]) { if (!UI.award || UI.award.id !== id) UI.award = { id, step:'carpet' }; return awardNight(id); }
  const s = S(), drama = id.startsWith('drama:');
  const e = drama ? ER.DRAMA.find(x => x.id === id.slice(6)) : G.findEvent(id);
  const txt = drama ? G.dramaText(e) : e.x;
  modal(`<span class="eyebrow">${drama ? 'Drama' : e.s ? (e.world ? 'World event · Sensitive' : 'Sensitive') : e.world ? 'World event' : 'Real event'} · ${h(G.fmtDate(s.abs))}</span><h2>${h(e.t)}</h2>${e.s ? '' : '<div class="stage3d short" id="t3event"></div>'}
    <p>${h(txt)}</p>${e.s ? '<p class="small muted">This is told factually and briefly. You can respond only with support, safety or a public statement.</p>' : ''}
    <div class="stack tight" id="evch">${e.ch.map((c, i) => `<button class="choice" data-act="answer" data-id="${h(id)}" data-i="${i}">${h(c.l)}</button>`).join('')}</div>`, e.s ? 'sens' : '');
  if (!e.s) mount3D('#t3event', eventSpec(e), 'event');
}

/* ---------- Actions ---------- */
/* ---------- Settings ---------- */
UI.prefs = (() => { try { return Object.assign({ text:'normal', quick:false }, JSON.parse(localStorage.getItem('eras-settings') || '{}')); } catch (e) { return { text:'normal', quick:false }; } })();
function savePrefs() { try { localStorage.setItem('eras-settings', JSON.stringify(UI.prefs)); } catch (e) {} applyPrefs(); }
function applyPrefs() { document.documentElement.classList.toggle('big-text', UI.prefs.text === 'large'); document.documentElement.classList.toggle('huge-text', UI.prefs.text === 'larger'); }
applyPrefs();
function settingsModal() {
  closeModals(); const P = UI.prefs;
  modal(`<h2>Settings</h2>
    <h3>Text size</h3><div class="chips">${[['normal','Normal'],['large','Large'],['larger','Larger']].map(([k, l]) => `<button class="chip ${P.text === k ? 'on' : ''}" data-act="pref" data-k="text" data-v="${k}">${l}</button>`).join('')}</div>
    <h3>Quick mode</h3><p class="small muted">Skips scenes, writing and studio sessions, and show nights, for faster play. Real event cards still appear.</p>
    <div class="chips"><button class="chip ${!P.quick ? 'on' : ''}" data-act="pref" data-k="quick" data-v="0">Off</button><button class="chip ${P.quick ? 'on' : ''}" data-act="pref" data-k="quick" data-v="1">On</button></div>
    <h3>3D</h3><div class="chips">${[['high','High'],['low','Low (faster)'],['off','Off']].map(([k, l]) => `<button class="chip ${T3.quality === k ? 'on' : ''}" data-act="pref3d" data-v="${k}">${l}</button>`).join('')}</div>
    <h3>Sound</h3><div class="chips"><button class="chip ${window.SND && SND.on ? 'on' : ''}" data-act="prefsound" data-v="1">On</button><button class="chip ${window.SND && !SND.on ? 'on' : ''}" data-act="prefsound" data-v="0">Off</button></div>
    <button class="btn big" data-act="closem" style="margin-top:12px">Done</button>`);
}
/* ---------- Previously on ---------- */
function previouslyModal() {
  const s = S(), A = G.art(), e = G.currentEra(), act = G.active().filter(x => x.p.type !== 'demos');
  const dl = []; G.allProjects().forEach(p => { const w = G.win(p); [[w.rel, `${p.title} release`], [w.ts, `${p.tour && p.tour.name} begins`]].forEach(([a, l]) => { if (a != null && a >= s.abs && a < s.abs + 26) dl.push([a, l]); }); });
  dl.sort((a, b) => a[0] - b[0]);
  const last = s.log.filter(l => !l.world).slice(-3).reverse();
  modal(`<span class="eyebrow">Previously on The Eras Life</span><h2>${h(A.name)}, ${h(G.fmtDate(s.abs))}</h2><div class="stage3d short" id="t3prevon"></div>
    <p class="small">Age ${G.age()}${e ? ` · the ${h(e.short || e.title)} era` : ''}${act.length ? ` · ${act.map(x => `${h(x.p.short || x.p.title)}: ${h(stageName(x.st))}`).join(', ')}` : ''}</p>
    ${dl.length ? `<h3>Coming up</h3>${dl.slice(0, 3).map(([a, l]) => `<div class="between small"><span>${h(l)}</span><span class="muted">${h(G.fmtDate(a))}</span></div>`).join('')}` : ''}
    ${last.length ? `<h3>Your last choices</h3>${last.map(l => `<p class="small"><b>${h(l.t)}:</b> ${h(l.l)}</p>`).join('')}` : ''}
    <button class="btn big" data-act="closem">Pick up where you left off</button>`);
  mount3D('#t3prevon', stageSpec(), 'prevon');
}
/* ---------- Scenes and sessions ---------- */
const TEAMFIG = { publicist:'publicist', manager:'manager', label:'label', family:'family', producer:'producer', fan:'fan' };
function sceneFigs(sc) {
  const era = G.currentEra(), figs = [{ look:lookFor(sc.set === 'theater' || sc.set === 'tv' ? 'release' : '', era), x:-.35, anim:sc.set === 'writers' || sc.set === 'farm' ? 'strum' : 'talk', s:ageScale() }];
  if (sc.with && T3.TEAM[TEAMFIG[sc.with]]) figs.push({ look:T3.TEAM[TEAMFIG[sc.with]], x:.9, z:-.3, ry:-.5, anim:'talk', s:.94 });
  return figs;
}
function showScene(sc) {
  if (!sc) return render();
  UI.scene = sc; closeModals();
  modal(`<span class="eyebrow">A moment · ${h(G.fmtDate(G.S().abs))}</span><h2>${h(sc.t)}</h2><div class="stage3d short" id="t3scene"></div><p>${h(sc.x)}</p>
    <div class="stack tight" id="scch">${sc.ch.map((c, i) => `<button class="choice" data-act="scene" data-i="${i}">${h(c.l)}<div class="small muted">${h(G.fxText(c.fx))}</div></button>`).join('')}</div>`);
  mount3D('#t3scene', { set:sc.set || 'home', color:(G.currentEra() || {}).color, figs:sceneFigs(sc) }, 'scene');
}
function writeSession(pid, title) {
  const s = G.S(), p = G.proj(pid), opts = G.writable().filter(x => x.p.id === pid);
  if (!opts.length) return toast('Nothing left to write for this era.');
  const w = UI.ws && UI.ws.pid === pid ? UI.ws : (UI.ws = { pid, t:title || (opts.find(x => x.kind === 'album') || opts[0]).t, co:UI.sel['co:' + pid] || (p.cowriters || ['Solo'])[0], insp:'', appr:'story' });
  if (title) w.t = title;
  // Recent real cards are offered as inspiration: write what you know.
  const recent = s.log.filter(l => !l.s && !l.world && !l.drama && s.abs - l.abs < 40 && l.id && !l.id.startsWith('pro')).slice(-3).reverse();
  const insps = recent.map(l => ({ id:'card:' + l.id, n:`What just happened: ${l.t}` })).concat(ER.INSPIRATIONS);
  if (!w.insp) w.insp = insps[0].id;
  closeModals();
  modal(`<span class="eyebrow">Writing session · ${h(p.short || p.title)}</span><h2>Write a song</h2><div class="stage3d short" id="t3write"></div>
    <label class="field"><span>Song</span><select data-act="wsel" data-k="t">${opts.map(o => `<option ${o.t === w.t ? 'selected' : ''}>${h(o.t)}</option>`).join('')}</select></label>
    <label class="field"><span>Co-writer</span><select data-act="wsel" data-k="co">${(p.cowriters || ['Solo']).map(n => `<option ${n === w.co ? 'selected' : ''}>${h(n)}</option>`).join('')}</select></label>
    <h3>What is it about?</h3><div class="chips">${insps.map(i => `<button class="chip ${w.insp === i.id ? 'on' : ''}" data-act="wpick" data-k="insp" data-v="${h(i.id)}">${h(i.n)}</button>`).join('')}</div>
    <h3>How do you write it?</h3><div class="chips">${ER.APPROACHES.map(a => `<button class="chip ${w.appr === a.id ? 'on' : ''}" data-act="wpick" data-k="appr" data-v="${a.id}">${h(a.n)}</button>`).join('')}</div>
    <p class="small faint">Writing about something that really just happened helps, and so does an approach that suits the subject. Only the title is real; the game never uses lyrics.</p>
    <button class="btn big" data-act="wgo">Write it · 2 blocks</button><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="closem">Not now</button></div>`);
  mount3D('#t3write', { set:G.age() < 15 ? 'bedroom' : 'writers', color:p.color, figs:[{ look:lookFor('', p), anim:'strum', guitar:true, s:ageScale() }] }, 'write');
}
function studioSession(pid, title) {
  const p = G.proj(pid), opts = G.recordable().filter(x => x.p.id === pid);
  if (!opts.length) return toast('Nothing is ready to record.');
  const r = UI.rs && UI.rs.pid === pid ? UI.rs : (UI.rs = { pid, t:title || (opts.find(x => !x.vault) || opts[0]).t, prod:UI.sel['pr:' + pid] || (p.producers || ['Producer'])[0], take:'polish' });
  if (title) r.t = title;
  closeModals();
  modal(`<span class="eyebrow">Studio session · ${h(p.short || p.title)}</span><h2>Record a track</h2><div class="stage3d short" id="t3rec"></div>
    <label class="field"><span>Song</span><select data-act="rsel" data-k="t">${opts.map(o => `<option value="${h(o.t)}" ${o.t === r.t ? 'selected' : ''}>${h(o.tv || o.t)}</option>`).join('')}</select></label>
    <label class="field"><span>Producer</span><select data-act="rsel" data-k="prod">${(p.producers || ['Producer']).map(n => `<option ${n === r.prod ? 'selected' : ''}>${h(n)}</option>`).join('')}</select></label>
    <h3>The take</h3>${ER.TAKES.map(tk => `<button class="choice ${r.take === tk.id ? 'on' : ''}" data-act="rpick" data-v="${tk.id}">${h(tk.n)}<div class="small muted">${h(tk.d)}</div></button>`).join('')}
    <button class="btn big" data-act="rgo" style="margin-top:10px">Record it · 1 block</button><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="closem">Not now</button></div>`);
  mount3D('#t3rec', { set:'studio', color:p.color, figs:[{ look:lookFor('studio', p), anim:'sing', mic:true }, { look:T3.TEAM.producer, x:-1.2, z:-.4, ry:.5, anim:'talk', s:.92 }] }, 'rec');
}
function sessionResult(title, lines, after) {
  closeModals();
  modal(`<span class="eyebrow">${h(G.fmtDate(G.S().abs))}</span><h2>${h(title)}</h2>${lines.map(l => `<p class="${l.c || ''}">${h(l.x)}</p>`).join('')}<button class="btn big" data-act="closem">Continue</button>`);
}
/* ---------- Show nights ---------- */
function showNight() {
  const st = UI.show; if (!st) return; const sh = st.sh, p = G.proj(sh.pid), era = G.currentEra();
  closeModals(); let body = '';
  if (st.step === 'opener') body = `<p>${h(sh.detail)}</p><h3>How do you open?</h3>${ER.OPENERS.map(o => `<button class="choice" data-act="shop" data-v="${o.id}">${h(o.n)}</button>`).join('')}`;
  else if (st.step === 'surprise') body = `<h3>Surprise songs</h3><p class="small muted">Pick two acoustic songs. Ones you have never played as a surprise get the biggest reaction.</p>
    <div class="chips">${sh.offer.map(t => `<button class="chip ${st.picks.includes(t) ? 'on' : ''}" data-act="shsong" data-v="${h(t)}">${h(t)}${(G.S().surprisePlayed || {})[t] ? '' : ' ✨'}</button>`).join('')}</div>
    <button class="btn big" data-act="shnext" ${st.picks.length ? '' : 'disabled'}>Play them</button>`;
  else if (st.step === 'moment') body = `<h3>${h(sh.moment.t)}</h3><p>${h(sh.moment.x)}</p>${sh.moment.ch.map((c, i) => `<button class="choice" data-act="shmoment" data-i="${i}">${h(c.l)}</button>`).join('')}`;
  else if (st.step === 'result') body = `<p><b>${h(st.res.mc.r)}</b></p><div class="review">${'★'.repeat(st.res.stars)}${'☆'.repeat(5 - st.res.stars)}</div><p class="small muted">The review: ${h(st.res.line)}</p>
    ${st.picks.length ? `<p class="small">Surprise songs: ${st.picks.map(h).join(' and ')}</p>` : ''}<button class="btn big" data-act="shdone">Back to the tour</button>`;
  modal(`<span class="eyebrow">${h(p.tour.name)} · ${h(G.fmtDate(G.S().abs))}</span><h2>Tonight in ${h(sh.city)}</h2><div class="stage3d short" id="t3show"></div>${body}`);
  const tier = (G.pj(p.id).tour || {}).tier || 'stadium';
  mount3D('#t3show', { set:tier, color:(era || p).color, figs:[{ look:lookFor('tour', era || p), anim:st.step === 'result' ? 'bow' : st.step === 'surprise' ? 'strum' : 'sing', mic:st.step !== 'surprise', guitar:st.step === 'surprise' }] }, 'show');
}
/* ---------- Award nights ---------- */
function awardNight(id) {
  const e = G.findEvent(id), st = UI.award; closeModals();
  const era = G.currentEra(), y = G.yw().y;
  let body = '', look = lookFor('awards', era), anim = 'wave';
  if (st.step === 'carpet') body = `<p>${h(e.x)}</p><h3>The red carpet: what do you wear?</h3>${ER.CARPET.map(c => `<button class="choice" data-act="awcarpet" data-v="${c.id}">${h(c.n)}</button>`).join('')}`;
  else if (st.step === 'perform') { const cs = ER.CARPET.find(c => c.id === st.carpet); Object.assign(look, cs.look); body = `<p><b>${h(cs.r)}</b></p><h3>Do you perform tonight?</h3>
    ${G.catalog().slice(-6).reverse().map(t => `<button class="choice" data-act="awperf" data-v="${h(t)}">Perform "${h(t)}"</button>`).join('')}<button class="choice" data-act="awperf" data-v="">Just watch tonight</button>`; anim = 'sing'; }
  else if (st.step === 'reveal') { const cs = ER.CARPET.find(c => c.id === st.carpet); Object.assign(look, cs.look); anim = 'idle';
    body = `<p class="small muted">${st.perf ? `You performed "${h(st.perf)}". ` : ''}The presenter opens the envelope.</p><h3>And the award goes to…</h3><button class="btn big" data-act="awreveal">Open the envelope</button>`; }
  modal(`<span class="eyebrow">Award night · ${h(G.fmtDate(G.S().abs))}</span><h2>${h(e.t)}</h2><div class="stage3d short" id="t3award"></div>${body}`);
  mount3D('#t3award', { set:st.step === 'carpet' ? 'press' : 'awards', color:(era || {}).color || '#e8c66a', figs:[{ look, anim, mic:st.step === 'perform', s:ageScale() }] }, 'award');
}
function moodOf(e) { if (!e) return 'country'; const th = e.theme; return ER.ERA_MOOD[e.id] || (th ? ({ country:'country', folk:'quiet', acoustic:'quiet', darkpop:'dark', jazz:'romantic', orchestral:'romantic' })[th] || 'pop' : 'pop'); }
function tradingCards() {
  const s = S(), cards = [];
  s.awards.forEach(a => cards.push({ r:/Album of the Year|Hall of Fame|Oscar|Academy/.test(a.n) ? 'legend' : 'rare', t:a.n, sub:String(a.y), icon:'🏆' }));
  s.charts.singles.filter(c => c.peak === 1).forEach(c => cards.push({ r:c.debut === 1 ? 'legend' : 'rare', t:c.t, sub:c.debut === 1 ? 'Debuted at No. 1' : 'Reached No. 1', icon:'🎵' }));
  s.released.forEach(r => { const p = G.proj(r.pid); if (p && r.fw >= 1e6) cards.push({ r:'legend', t:p.title, sub:`${G.fmtN(r.fw)} first week`, icon:'💿' }); });
  Object.keys(s.pj).forEach(id => (s.pj[id].diary || []).filter(d => d.stars === 5).slice(0, 3).forEach(d => cards.push({ r:'rare', t:`${d.city}, five stars`, sub:d.moment, icon:'⭐' })));
  (s.journal || []).slice(0, 4).forEach(j => cards.push({ r:'common', t:j.t, sub:G.fmtDate(j.abs), icon:'📸' }));
  if (!cards.length) return '';
  const col = Object.fromEntries(ER.CARD_RARITY.map(x => [x[0], x]));
  return card(`<h3>Era cards (${cards.length})</h3><p class="small muted">Collected from your awards, No. 1s, million-selling weeks, five-star shows and moments.</p>
    <div class="tcards">${cards.slice(0, 30).map(c => `<div class="tcard" style="border-color:${col[c.r][2]}"><span class="ti">${c.icon}</span><b>${h(c.t)}</b><span class="small muted">${h(c.sub || '')}</span><span class="tr" style="color:${col[c.r][2]}">${col[c.r][1]}</span></div>`).join('')}</div>`);
}
function boothDraw() {
  const p = G.proj(UI.sel.booth); if (!p) return; const pose = UI.sel.boothPose || 'sing', set = UI.sel.boothSet || 'stadium';
  mount3D('#t3booth', { set, color:p.color, figs:[{ look:lookFor(set === 'studio' ? 'studio' : set === 'home' ? '' : 'tour', p), anim:pose, mic:pose === 'sing' }] }, 'booth');
}
function after(r) { if (r && r.err) toast(r.err); else if (r && r.msg) toast(r.msg); render(); }
const ACT = {
  tab:d => { UI.tab = d.v; if (d.v !== 'week') G.guideTick('tab'); render(); window.scrollTo(0, 0); },
  do:d => { const t = G.tasks().find(x => x.id === d.id);
    if (UI.prefs.quick) { const r = G.doTask(d.id, d.arg || undefined); return after(r); }
    if (t && t.kind === 'write' && !d.arg) return writeSession(t.p);
    if (t && t.kind === 'record' && !d.arg) return studioSession(t.p);
    const r = G.doTask(d.id, d.arg || undefined); if (r && r.err) return after(r);
    if (r && r.msg) toast(r.msg);
    if (t && t.kind === 'duet') { const opts = (G.S().rc || []).map(x => x.n);
      return showScene({ k:'duet', t:'A duet', x:'Your label suggests a one-off collaboration with another star. All of them are invented rivals.', set:'studio', with:'producer',
        ch:opts.map(n => ({ l:`Record with ${n}`, fx:{}, r:'', who:n })) }); }
    if (t && t.kind === 'shows' && r && r.ok) { const p = G.proj(t.p); if (p.tour.kind !== 'opening' && !/travel week/.test(r.msg || '')) { render(); UI.show = { sh:G.showSetup(p), step:'opener', picks:[] }; return showNight(); } }
    const sc = t && r && r.ok ? G.pickScene(t) : null; if (sc) { render(); return showScene(sc); } render(); },
  booth:d => { UI.sel.booth = d.v; UI.sel.boothSet = UI.sel.boothSet || 'stadium'; UI.sel.boothPose = UI.sel.boothPose || 'sing'; render(); boothDraw(); },
  boothset:d => { UI.sel.boothSet = d.v; render(); boothDraw(); }, boothpose:d => { UI.sel.boothPose = d.v; render(); boothDraw(); },
  snap:() => { const url = T3.snapshot('booth'); if (!url) return toast('The photo could not be saved on this device.'); const a = document.createElement('a'); a.href = url; a.download = `eras-life-${UI.sel.booth}.png`; document.body.appendChild(a); a.click(); a.remove(); toast('Photo saved.'); },
  bracelet:() => { const w = ($('#br-word') || {}).value || ''; const e = G.currentEra() || {}; const b = G.makeBracelet(w, [e.color || '#f6d38a', e.accent || '#ffffff', '#e88fb4', '#6fa8d6']); if (!b) return toast('Type a word first.'); toast(`Made a bracelet: ${b.word}`); render(); },
  shop:d => { UI.show.opener = d.v; UI.show.step = UI.show.sh.surprise ? 'surprise' : 'moment'; if (window.SND) SND.crowd(2.5); showNight(); },
  shsong:d => { const a = UI.show.picks, i = a.indexOf(d.v); if (i >= 0) a.splice(i, 1); else { a.push(d.v); if (a.length > 2) a.shift(); } showNight(); },
  shnext:() => { UI.show.step = 'moment'; if (window.SND) SND.crowd(2); showNight(); },
  shmoment:d => { const st = UI.show; st.res = G.showNight(st.sh, st.opener, st.picks, +d.i); st.step = 'result'; if (window.SND) { SND.crowd(4, st.res.stars >= 4); } showNight(); },
  shdone:() => { UI.show = null; closeModals(); render(); },
  awcarpet:d => { UI.award.carpet = d.v; UI.award.step = 'perform'; awardNight(UI.award.id); },
  awperf:d => { UI.award.perf = d.v; UI.award.step = 'reveal'; if (d.v && window.SND) SND.crowd(3); awardNight(UI.award.id); },
  awreveal:() => { const a = UI.award; G.awardNight(G.findEvent(a.id), a.carpet, a.perf); UI.awardSeen[a.id] = 1; UI.award = null; if (window.SND) SND.fanfare(); closeModals(); eventModal(a.id); },
  vsave:d => { G.saveToVault(d.t); toast(`"${d.t}" is in the vault.`); render(); },
  vpick:d => { const a = UI.sel.vpick, i = a.indexOf(d.t); if (i >= 0) a.splice(i, 1); else if (a.length < 6) a.push(d.t); render(); },
  vrelease:() => { if (!G.canSpend(1)) return toast('No blocks left.'); const best = G.releaseVault(UI.sel.vpick); if (!best) return; G.S().week.used++; UI.sel.vpick = []; if (window.SND) SND.fanfare(); toast(`From the Vault is out. "${best}" leads.`); render(); },
  memory:d => { const s = G.S(), m = s.inbox.find(x => x.id === d.id); if (!m) return; const f = ER.MEMORIES[m.memory]; m.read = true; m.replied = true;
    showScene({ t:f.t.replace('{song}', m.song), x:f.x.replace(/\{song\}/g, m.song), set:'stadium', with:'fan', ch:f.ch }); },
  daily:() => { if (G.slotInfo('daily') && !confirm('Start today\'s challenge again? Your current challenge save will be replaced.')) return; G.startChallenge(); UI.tab = 'week'; render(); },
  dailyload:() => { if (G.load('daily')) { UI.tab = 'week'; render(); } },
  reply:d => { const s = G.S(), m = s.inbox.find(x => x.id === d.id); if (!m) return; const f = ER.FAN_MAIL[m.mail]; m.read = true; m.replied = true;
    showScene({ t:`A letter from ${f.from}`, x:f.x, set:'home', with:'fan', ch:f.ch }); },
  q3d:() => { const next = { high:'low', low:'off', off:'high' }[T3.quality] || 'high'; T3.setQuality(next); toast(`3D: ${next === 'high' ? 'High' : next === 'low' ? 'Low (faster on older phones)' : 'Off'}`); closeModals(); render(); },
  sound:() => { const on = SND.toggle(); UI.heard = true; if (on) SND.setMood(moodOf(G.currentEra())); toast(on ? 'Sound on.' : 'Sound off.'); closeModals(); },
  scene:d => { const sc = UI.scene; if (!sc) return closeModals();
    if (sc.k === 'duet') { const who = sc.ch[+d.i].who, t = G.tasks().find(x => x.kind === 'duet'); if (t && G.canSpend(t.cost)) { G.S().week.used += t.cost; G.S().week.done[t.id] = true; }
      const title = G.recordDuet(who); UI.scene = null; closeModals(); render(); return sessionResult('A duet', [{ x:`You and ${who} record "${title}".` }, { x:`${who} is an invented rival. The song goes on the next album as a bonus track.`, c:'small muted' }]); } const c = G.resolveScene(sc, +d.i); UI.scene = null;
    const box = document.querySelector('#scch'); if (box) box.innerHTML = `<p><b>${h(c.r)}</b></p><p class="small muted">${h(G.fxText(c.fx))}</p><button class="btn big" data-act="scenedone">Continue</button>`; },
  scenedone:() => { closeModals(); render(); },
  wsel:(d, el) => { UI.ws[d.k] = el.value; }, wpick:d => { UI.ws[d.k] = d.v; writeSession(UI.ws.pid); },
  wgo:() => { const w = UI.ws; const t = G.tasks().find(x => x.kind === 'write' && x.p === w.pid);
    let res; if (t && !G.taskDone(t.id)) res = G.doTask(t.id, { t:w.t, co:w.co, insp:w.insp, appr:w.appr });
    else { if (!G.canSpend(2)) return toast('No blocks left.'); G.writeSong(w.t, w.co, w.insp, w.appr); G.S().week.used += 2; res = { ok:true }; }
    if (res && res.err) return toast(res.err);
    const so = G.S().songs[w.t]; const moment = G.pick(ER.WRITE_MOMENTS); G.journalAdd(`Wrote "${w.t}"`, moment);
    UI.ws = null; render();
    sessionResult(`"${w.t}"`, [{ x:moment }, { x:`Quality ${so ? so.q : '?'}${so && so.insp ? ` · About: ${so.insp}` : ''}` }, ...(so && so.note ? [{ x:so.note, c:'small muted' }] : [])]); },
  rsel:(d, el) => { UI.rs[d.k] = el.value; }, rpick:d => { UI.rs.take = d.v; studioSession(UI.rs.pid); },
  rgo:() => { const r = UI.rs; const t = G.tasks().find(x => x.kind === 'record' && x.p === r.pid);
    let res; if (t && !G.taskDone(t.id)) res = G.doTask(t.id, { t:r.t, prod:r.prod, take:r.take });
    else { if (!G.canSpend(1)) return toast('No blocks left.'); G.recordSong(r.t, r.prod, r.pid, r.take); G.S().week.used += 1; res = { ok:true }; }
    if (res && res.err) return toast(res.err);
    const s = G.S(); const so = s.songs[r.t + " (Taylor's Version)"] || s.songs[r.t]; const moment = G.pick(ER.STUDIO_MOMENTS); G.journalAdd(`Recorded "${r.t}"`, moment);
    UI.rs = null; render(); sessionResult(`Recorded "${r.t}"`, [{ x:moment }, { x:`Quality now ${so ? so.q : '?'}, produced by ${r.prod}.` }]); },
  write:d => { return writeSession(d.p, d.t); const t = G.tasks().find(x => x.kind === 'write' && x.p === d.p); if (!t) return toast('Nothing to write here.'); if (G.taskDone(t.id)) { if (!G.canSpend(2)) return toast('No blocks left.'); const r = G.writeSong(d.t, UI.sel['co:' + d.p] || G.proj(d.p).cowriters[0]); G.S().week.used += 2; toast(`Wrote "${d.t}". Quality ${r.q}.`); return render(); }
    after(G.doTask(t.id, { t:d.t, co:UI.sel['co:' + d.p] })); },
  record:d => { return studioSession(d.p, d.t); const t = G.tasks().find(x => x.kind === 'record' && x.p === d.p); const prod = UI.sel['pr:' + d.p];
    if (!t || G.taskDone(t.id)) { if (!G.canSpend(1)) return toast('No blocks left.'); G.recordSong(d.t, prod || G.proj(d.p).producers[0], d.p); G.S().week.used += 1; toast(`Recorded "${d.t}".`); return render(); }
    after(G.doTask(t.id, { t:d.t, prod })); },
  selco:(d, el) => { UI.sel['co:' + d.p] = el.value; render(); }, selpr:(d, el) => { UI.sel['pr:' + d.p] = el.value; }, seled:(d, el) => { UI.sel['ed:' + d.p] = el.value; }, selsg:(d, el) => { UI.sel['sg:' + d.p] = el.value; render(); },
  single:d => { const p = G.proj(d.p), sg = UI.sel['sg:' + d.p] || G.defaultSingle(p); const t = G.tasks().find(x => x.kind === 'single' && x.p === d.p && !G.taskDone(x.id));
    if (t) return after(G.doTask(t.id, sg)); if (!G.canSpend(1)) return toast('No blocks left.'); G.releaseSingle(p, sg); G.S().week.used++; toast(`"${sg}" goes to radio.`); render(); },
  approve:d => { if (!G.canSpend(1)) return toast('No blocks left.'); const pj = G.pj(d.p); pj.approval = true; G.S().week.used++; G.applyFx({ team:3, hype:3 }); G.inbox('manager', `${G.proj(d.p).title} plan: approved`, 'The rollout plan works for money and logistics.'); G.inbox('publicist', `${G.proj(d.p).title} plan: press check`, G.S().stats.heat > 70 ? 'Approved, but the press is hot right now. Keep the posts careful.' : 'No press risks I can see.'); render(); },
  move:d => after(G.moveRelease(d.p, +d.d)),
  sponsor:d => { const f = G.signSponsor(d.id); if (f) toast(`Signed for ${G.fmtM(f)}.`); render(); },
  cvp:d => { UI.sel.cover = d.id; UI.sel.design = null; render(); },
  cv:(d, el) => { UI.sel.design[d.k] = el.value; UI.sel.design.upload = false; render(); },
  savecover:() => { const d = UI.sel.design, p = G.proj(d.pid), pj = G.pj(d.pid); const t = G.tasks().find(x => x.id === 'fin:' + d.pid + ':cover');
    pj.cover = Object.assign({}, d, { variants:pj.cover && pj.cover.variants || 0, auto:false }); delete pj.cover.pid;
    if (t && !G.taskDone(t.id)) { const r = G.doTask(t.id); if (r.err) return toast(r.err); } toast('Cover saved.'); render(); },
  variant:() => { const pj = G.pj(UI.sel.design.pid); if (!pj.cover) pj.cover = G.autoCover(G.proj(UI.sel.design.pid)); pj.cover.variants = (pj.cover.variants || 0) + 1; G.S().stats.money += 20000 + G.S().stats.fans * .01; if (pj.cover.variants > 3) G.applyFx({ rep:-2 }); toast(pj.cover.variants > 3 ? 'Another variant. Some fans are annoyed.' : 'A variant cover sells extra copies.'); render(); },
  unupload:() => { const u = uploads(); delete u[UI.sel.design.pid]; G.lsSet('eras-uploads', JSON.stringify(u)); const pj = G.pj(UI.sel.design.pid); if (pj.cover) pj.cover.upload = false; UI.sel.design.upload = false; render(); },
  tp:(d, el) => { const pl = UI.sel.plan; pl[d.k] = ['nights','price','prod'].includes(d.k) ? +el.value : el.value; render(); },
  tpr:d => { const a = UI.sel.plan.regions; const i = a.indexOf(d.v); i < 0 ? a.push(d.v) : a.splice(i, 1); render(); },
  tpo:d => { const a = UI.sel.plan.openers; const i = a.indexOf(d.v); i < 0 ? a.push(d.v) : a.splice(i, 1); render(); },
  tps:d => { const a = UI.sel.plan.setlist; const i = a.indexOf(d.v); i < 0 ? a.push(d.v) : a.splice(i, 1); render(); },
  suggest:d => { UI.sel.plan = Object.assign({ pid:d.p }, G.suggestTour(G.proj(d.p))); render(); },
  submittour:d => { const p = G.proj(d.p), r = G.submitTour(p, UI.sel.plan); toast(r.ok ? 'Approved by your manager and publicist.' : 'Sent back with objections. Check the notes.'); if (r.ok) { const t = G.tasks().find(x => x.id === 'tp:' + p.id + ':route'); if (t && !G.taskDone(t.id)) G.doTask(t.id); } render(); },
  customtour:d => { G.planCustomTour(G.proj(d.p), +($('#ct-w') || {}).value || 40); toast('Tour on the calendar.'); render(); },
  readall:() => { G.S().inbox.forEach(m => m.read = true); render(); },
  read:d => { const m = G.S().inbox.find(x => x.id === d.id); if (m) m.read = true; render(); },
  eggt:(d, el) => { UI.sel.eggType = el.value; }, eggg:(d, el) => { UI.sel.eggTarget = el.value; },
  plant:() => { if (!G.canSpend(1)) return toast('No blocks left.'); const tg = G.eggTargets(), t = tg.find(x => x.id === (UI.sel.eggTarget || tg[0].id)) || tg[0];
    const pre = G.tasks().find(x => x.kind === 'egg' && !G.taskDone(x.id)); G.plantEgg(UI.sel.eggType || 'caps', t, pre && pre.p); if (pre) G.S().week.done[pre.id] = true; G.S().week.used++; toast('Clue planted. Fans are on it.'); render(); },
  fan:d => { if (!G.canSpend(+d.c)) return toast('No blocks left.'); G.S().week.used += +d.c; const fx = { myspace:{ fans:2 }, secret:{ fans:3, hype:8, energy:-6 }, bracelets:{ fans:2, rep:1 }, meet:{ fans:2.5, energy:-6, rep:1 }, livestream:{ fans:1.6, energy:-3 }, zoom:{ fans:1, rep:2 }, readfans:{ hype:3 } }[d.k]; G.applyFx(fx); G.feed(d.k === 'secret' ? 'i went to a secret session and cannot say anything except: crying' : 'she showed up!!! i cannot believe it'); toast('Fans will remember that.'); render(); },
  unhide:() => { G.returnToPublic(); toast('You are back in public view.'); render(); },
  selout:(d, el) => { UI.sel.out = el.value; },
  press:d => { const s = G.S();
    if (d.k === 'silence') { s.flags.silence = !s.flags.silence; toast(s.flags.silence ? 'You go quiet.' : 'You are back.'); return render(); }
    const t = G.tasks().find(x => x.kind === (d.k === 'social' ? 'social' : 'interview') && !G.taskDone(x.id));
    if (d.k === 'statement') { if (!G.canSpend(1)) return toast('No blocks left.'); s.week.used++; G.applyFx(s.stats.heat > 30 ? { heat:-6, rep:2 } : { heat:3 }); toast('Statement out.'); return render(); }
    if (t) return after(G.doTask(t.id, d.k === 'interview' ? (UI.sel.out || undefined) : undefined));
    if (!G.canSpend(1)) return toast('No blocks left.'); s.week.used++; G.applyFx(d.k === 'social' ? { fans:1, heat:2 } : { heat:5, rep:1, fans:1 }); toast('Done.'); render(); },
  advance:() => { const r = G.advance(false);
    if (r.blocked) return render();
    if (r.confirm) { modal(`<h2>Required tasks are not done</h2><p class="small muted">Real dates never move. If you advance, these are missed:</p>${r.confirm.map(t => `<p class="small">• ${h(t.l)}</p>`).join('')}<p class="small muted">Missing tasks lowers quality, weakens first-week numbers and upsets your team. Missed sponsor duties can lose the deal. Missed rehearsal risks a bad show.</p><div class="row"><button class="btn" data-act="closem">Go back</button><button class="btn ghost" data-act="force">Advance anyway</button></div>`); return; }
    window.scrollTo(0, 0); render(); },
  force:() => { closeModals(); G.advance(true); window.scrollTo(0, 0); render(); },
  closem:() => { closeModals(); },
  ff:() => { const r = G.fastForwardSummary(52); if (!r.n) { toast('This week needs you.'); return render(); } render();
    if (r.n < 3) return toast(`Skipped ${r.n} quiet week${r.n > 1 ? 's' : ''}.`);
    modal(`<span class="eyebrow">While you were away</span><h2>${r.n} quiet weeks</h2><p class="small muted">${h(G.fmtDate(r.from))} to ${h(G.fmtDate(G.S().abs))}</p>
      <div class="grid3"><div><b class="${r.fans >= 0 ? 'pos' : 'neg'}">${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)}</b><div class="small muted">Fans</div></div><div><b class="${r.money >= 0 ? 'pos' : 'neg'}">${G.fmtM(r.money)}</b><div class="small muted">Money</div></div><div><b>${r.awards}</b><div class="small muted">Awards</div></div></div>
      ${r.singles.length ? `<p class="small">New singles: ${r.singles.map(h).join(', ')}</p>` : ''}<p class="small muted">Fast-forward stopped because something needs you this week.</p><button class="btn big" data-act="closem">Continue</button>`); },
  saveroutine:() => { const n = G.saveRoutine(); toast(n ? `Routine saved: ${n} tasks.` : 'Do some optional tasks first, then save them as a routine.'); render(); },
  applyroutine:() => { const n = G.applyRoutine(); toast(`Applied ${n} routine task${n === 1 ? '' : 's'}.`); render(); },
  answer:d => { const r = G.answer(d.id, +d.i); const sh = document.querySelector('.modal .sheet'); const s = G.S(); const yr = ER.yw(s.abs).y;
    if (sh) { const box = sh.querySelector('#evch'); box.innerHTML = `${r.r ? `<p><b>${h(r.r)}</b></p>` : ''}${r.truth ? `<div class="truth"><span class="eyebrow">What really happened</span><p class="small">${h(r.truth)} (Public record, ${yr})</p></div>` : ''}<button class="btn big" data-act="evok">Continue</button>`; } },
  evok:() => { closeModals(); render(); },
  pri:d => { const a = UI.sel.pri; const i = a.indexOf(d.k); if (i >= 0) a.splice(i, 1); else { a.push(d.k); if (a.length > 2) a.shift(); } closeModals(); modals(); },
  planok:() => { G.S().priorities = (UI.sel.pri || []).slice(); UI.sel.pri = null; G.S().modal.shift(); closeModals(); render(); },
  modalok:() => { G.S().modal.shift(); closeModals(); render(); },
  tofarewell:() => { const s = G.S(); s.modal = s.modal.filter(m => !['nextera','retire','farewell'].includes(m.k)); s.modal.unshift({ k:'farewell' }); closeModals(); modals(); },
  fwsel:(d, el) => { UI.sel.fw.weeks = +el.value; },
  fwgo:() => { const fw = UI.sel.fw, name = (($('#fw-name') || {}).value || '').trim() || 'The Farewell Tour'; G.planFarewell(fw.weeks, name); UI.sel.fw = null; G.S().modal = G.S().modal.filter(m => m.k !== 'farewell'); closeModals(); toast(`${name} is announced.`); UI.tab = 'tour'; render(); },
  retireask:() => { const s = G.S(); s.modal = s.modal.filter(m => !['nextera','retire'].includes(m.k)); s.modal.unshift({ k:'retire', after:'ask' }); closeModals(); modals(); },
  keepgoing:() => { G.S().modal.shift(); G.keepGoing(); closeModals(); render(); },
  retirego:() => { G.retire(); closeModals(); render(); },
  unretire:() => { G.unretire(); closeModals(); UI.tab = 'week'; render(); },
  showend:() => { G.S().modal.unshift({ k:'ending' }); closeModals(); modals(); },
  pitch:() => { G.proposeEra(); render(); },
  ne:d => { UI.sel.ne[d.k] = d.v; const o = $('#ne-own'); if (o) o.value = ''; closeModals(); modals(); },
  nesel:(d, el) => { UI.sel.ne[d.k] = +el.value; },
  startera:() => { const ne = UI.sel.ne, own = (($('#ne-own') || {}).value || '').trim(); const p = G.newEra(own || ne.title, ne.n, ne.weeks, ne.tour, ne.theme);
    G.S().modal = G.S().modal.filter(m => m.k !== 'nextera'); UI.sel.ne = null; closeModals(); toast(`Era ${p.eraNo}: ${p.title} begins.`); UI.tab = 'week'; render(); },
  erabreak:d => { G.takeBreak(+d.w); G.S().modal = G.S().modal.filter(m => m.k !== 'nextera'); closeModals(); toast('Taking a break.'); render(); },
  freeok:() => { G.S().modal.shift(); G.enterFree(); closeModals(); render(); },
  newera:() => { const t = ($('#ne-title') || {}).value || '', n = +($('#ne-n') || {}).value || 13, w = +($('#ne-w') || {}).value || 32, tr = +($('#ne-t') || {}).value || 0; const p = G.newEra(t.trim(), n, w, tr); toast(`${p.title} is on the calendar.`); UI.tab = 'week'; render(); },
  nextreal:d => { G.startNextReal(d.id); G.S().proposal = null; G.S().modal = G.S().modal.filter(m => m.k !== 'nextera'); closeModals(); toast('The next era begins.'); UI.tab = 'week'; render(); },
  settings:() => settingsModal(),
  pref:d => { UI.prefs[d.k] = d.k === 'quick' ? d.v === '1' : d.v; savePrefs(); settingsModal(); },
  pref3d:d => { T3.setQuality(d.v); settingsModal(); },
  prefsound:d => { if (window.SND && SND.on !== (d.v === '1')) SND.toggle(); UI.heard = true; settingsModal(); },
  backuplater:() => { UI.backupSnooze = G.S().abs; closeModals(); },
  menu:() => { const s = G.S(); modal(`<h2>Menu</h2><p class="small muted">Slot ${s.slot} · ${s.mode === 'story' ? 'Story Mode' : 'Era Start'} · ${G.DIFF[s.diff].l}. The game autosaves every week.</p>
      <div class="stack tight"><button class="btn" data-act="savenow">Save now</button><button class="btn ghost" data-act="settings">Settings</button><button class="btn ghost" data-act="q3d">3D: ${T3.quality === 'high' ? 'High' : T3.quality === 'low' ? 'Low (faster)' : 'Off'}</button><button class="btn ghost" data-act="sound">Sound: ${window.SND && SND.on ? 'on' : 'off'}</button><button class="btn ghost" data-act="export">Export save file</button><label class="btn ghost">Import save file<input type="file" accept=".json,application/json" data-act="import" hidden></label><button class="btn ghost" data-act="totitle">Title screen</button><button class="btn ghost" data-act="closem">Close</button></div>`); },
  savenow:() => { G.save(); toast('Saved.'); closeModals(); },
  export:() => { G.S().lastBackup = G.S().abs;  const b = new Blob([G.exportSave()], { type:'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `eras-life-slot${G.S().slot}-${G.yw().y}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('Save file downloaded.'); },
  totitle:() => { G.save(); G.set(null); closeModals(); title(); },
  // Title flow
  title:() => { UI.newg = null; title(); },
  load:d => { if (G.load(+d.n)) { UI.tab = 'week'; render(); previouslyModal(); } else toast('That save could not be read.'); },
  delslot:d => { if (confirm(`Delete slot ${d.n}?`)) { G.del(+d.n); title(); } },
  newgame:d => { UI.newg = { slot:+d.n, mode:'story', diff:'standard', era:'ts1', look:{ hair:LOOKS.hair[3][1], style:'curly', skin:LOOKS.skin[2][1] }, pro:[], lookEra:'fearless', artist:'taylor', goal:'none', mods:[] }; newGameFlow(); },
  ngoal:d => { UI.newg.goal = d.v; newGameFlow(); },
  nmod:d => { const a = UI.newg.mods, i = a.indexOf(d.v); if (i >= 0) a.splice(i, 1); else a.push(d.v); newGameFlow(); },
  nmode:d => { UI.newg.mode = d.v; newGameFlow(); }, nera:d => { UI.newg.era = d.v; newGameFlow(); }, ndiff:d => { UI.newg.diff = d.v; newGameFlow(); },
  look:d => { UI.newg.look[d.k] = d.v; newGameFlow(); },
  lookera:d => { UI.newg.lookEra = d.v; newGameFlow(); },
  nartist:d => { const n = UI.newg; n.artist = d.v; n.era = G.firstEra(d.v); n.lookEra = null; newGameFlow(); },
  pera:d => { if (UI.showPrev) UI.showPrev(+d.i); },
  begin:() => { const n = UI.newg; if (n.mode === 'story') return prologue(); G.newGame({ artist:n.artist, mode:'era', era:n.era, diff:n.diff, slot:n.slot, look:n.look, goal:n.goal, mods:n.mods }); UI.tab = 'week'; render(); },
  pro:d => { const n = UI.newg; n.pro.push(+d.i); if (n.pro.length < ER.artists[n.artist].prologue.length) return prologue();
    G.newGame({ artist:n.artist, mode:'story', diff:n.diff, slot:n.slot, look:n.look, prologue:n.pro, goal:n.goal, mods:n.mods }); UI.tab = 'week'; render(); },
  preview:d => { const a = ER.artists[d.id], P = a.projects.filter(p => p.type !== 'demos' && p.type !== 'edition');
    modal(`<span class="eyebrow">Playable</span><h2>${h(a.name)}</h2><div class="stage3d" id="t3prev"></div>
      <div class="chips">${P.map((p, i) => `<button class="chip" data-act="pera" data-id="${d.id}" data-i="${i}"><i class="dot" style="background:${p.color}"></i>${h(p.short)}</button>`).join('')}</div>
      ${a.core ? `<p>${h(a.core)}</p>` : ''}<h3>Eras</h3>${P.map(p => `<div class="between small"><span>${h(p.title)}</span><span class="muted">${ER.yw(p.rel).y}</span></div>`).join('')}
      <h3>People</h3><p class="small">${a.people.map(x => h(x.n || x)).join(' · ')}</p>${a.note ? `<p class="small muted">${h(a.note)}</p>` : ''}
      <button class="btn" data-act="closem">Close</button>`);
    const show = i => { const p = P[i]; const L = looksOf(d.id); let k = 'early'; a.projects.forEach(q => { if (q.rel <= p.rel && L[q.id]) k = q.id; }); const e = L[k];
      document.querySelectorAll('.modal [data-act=pera]').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      mount3D('#t3prev', { set:'stadium', color:p.color, figs:[{ look:Object.assign({}, e.base, e.stage), anim:'sing', mic:!e.stage.guitar }] }, 'prev'); };
    UI.showPrev = show; show(P.length - 1); },
};
document.addEventListener('click', e => {
  if (window.SND && !UI.heard) { UI.heard = true; if (SND.on && G.S()) SND.setMood(moodOf(G.currentEra())); }
  if (window.SND && e.target.closest('.choice, .chip')) SND.blip(true);
  const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
  const f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el.dataset, el); }
});
document.addEventListener('change', e => {
  const el = e.target; if (!el.dataset || !el.dataset.act) return;
  if (el.dataset.act === 'import') { const f = el.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const slot = G.S() ? G.S().slot : 1; G.importSave(rd.result, slot); closeModals(); UI.tab = 'week'; render(); toast('Save imported.'); } catch (x) { toast('That file is not an Eras Life save.'); } }; rd.readAsText(f); return; }
  if (el.dataset.act === 'upload') { const f = el.files[0]; if (!f) return; const img = new Image(); const rd = new FileReader();
    rd.onload = () => { img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 320; const g = c.getContext('2d'); const m = Math.min(img.width, img.height); g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, 320, 320);
      const u = uploads(); u[UI.sel.design.pid] = c.toDataURL('image/jpeg', .82); if (!G.lsSet('eras-uploads', JSON.stringify(u))) return toast('Not enough browser storage for that image.');
      UI.sel.design.upload = true; const pj = G.pj(UI.sel.design.pid); pj.cover = Object.assign(pj.cover || G.autoCover(G.proj(UI.sel.design.pid)), { upload:true }); toast('Your image is the cover now.'); render(); }; img.src = rd.result; }; rd.readAsDataURL(f); return; }
  const f = ACT[el.dataset.act]; if (f) f(el.dataset, el);
});
window.addEventListener('resize', () => { if (G.S() && UI.tab === 'week') mount3D('#t3stage', stageSpec(), 'main'); });
// Helpers for add-on modules.
Object.assign(UI, { h, card, bar, pill, modal, closeModals, mount3D, lookFor, showScene, sessionResult, VIEWS, ACT, stageName, coverSVG:UI.coverSVG, toast });
UI.modalKinds = UI.modalKinds || {};
UI.start = () => { title(); };
})();
