/* The Eras Life: interface. */
(function () {
const ER = window.ER, G = window.G, T3 = window.T3;
const $ = s => document.querySelector(s);
const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const S = () => G.S();
const UI = window.UI = { tab:'week', sel:{}, toast:null, newg:null };
const TABS = [['week','This Week'],['life','Life'],['songbook','Songbook'],['studio','Studio'],['rollout','Rollout'],['cover','Cover Studio'],['tour','Tour Desk'],['inbox','Team Inbox'],['eggs','Easter Eggs'],['fandom','Fandom'],['press','Press and People'],['charts','Charts and Awards'],['legacy','Legacy']];
const STAT = [['fans','Fans'],['rep','Public Reputation'],['heat','Press Heat'],['write','Songwriting'],['clout','Industry Clout'],['own','Ownership'],['energy','Energy'],['team','Team mood']];
const LOOKS = {
  hair:[['Honey','#c8954f'],['Platinum','#efe0b9'],['Auburn','#8a3b1f'],['Dark brown','#3a2417'],['Black','#141414'],['Copper','#b5562b']],
  style:[['Long waves','long'],['Curls','curly'],['Bob','bob'],['Ponytail','ponytail'],['Bun','bun'],['Short','short']],
  skin:[['Fair','#f6d7bf'],['Light','#e9c3a1'],['Medium','#d3a07a'],['Tan','#b97f56'],['Brown','#8d5a3b'],['Deep','#5c3a26']]
};

/* ---------- Utilities ---------- */
function toast(m) { UI.toast = m; const t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(UI.tt); UI.tt = setTimeout(() => t.classList.remove('on'), 2600); }
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
function eraKey(era) {
  const L = ER.LOOKS.taylor; if (!era) return 'early';
  if (L[era.id]) return era.id;
  return era.custom ? 'showgirl' : 'early';
}
function lookFor(ctx, era, key) {
  const L = ER.LOOKS.taylor, s = S();
  let k = key || eraKey(era), erasAct = false;
  if (k && k.startsWith('eras:')) { k = k.slice(5); erasAct = true; }
  if (!key && s && G.age() < 15) k = 'early';
  // On the Eras Tour, each week's show is a different act.
  if (!key && ctx === 'tour' && s && era && era.id === 'midnights') { const tp = G.active().find(x => x.st === 'tour' && x.p.id === 'midnights'); if (tp) { k = ERAS_CYCLE[s.abs % ERAS_CYCLE.length]; erasAct = true; } }
  const e = (!key && era && era.custom && era.look) ? era.look : (L[k] || L.early), stage = ['tour','awards','release'].includes(ctx);
  const o = Object.assign({}, e.base, erasAct && e.eras ? e.eras : stage ? e.stage : e.casual);
  // By the Eras Tour her hair and make-up were the 2023 look in every act.
  if (erasAct) Object.assign(o, { style:'waves', bangs:1, hairLen:.62, tips:0, heartEye:0, hair:L.midnights.base.hair, lips:L.midnights.base.lips }, k === 'lover' ? { heartEye:'#f06fb4' } : {}, ['folklore','evermore'].includes(k) ? { style:'braid' } : {});
  if (era && era.custom && !era.look) { o.outfit = era.color; o.accent = T3.shade(era.color, .55); }
  if (ctx === 'awards' && !e.stage.top.match(/gown|sequin/)) { o.top = 'gown'; o.sparkle = 1; o.guitar = 0; o.hat = 0; }
  if (ctx === 'awards') o.guitar = 0;
  return o;
}
function ageScale() { const s = S(); if (!s) return 1; const a = G.age(); return a < 13 ? .74 : a < 15 ? .84 : a < 17 ? .93 : 1; }
function otherLook(who, y, stage) { const l = ER.lookAtYear(who, y); return Object.assign({}, l.base, l.stage); }
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
function mount3D(sel, spec, slot) { requestAnimationFrame(() => { const el = $(sel); if (!el) return; if (!T3.view(el, spec, slot)) el.classList.add('no3d'); }); }

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
function title() {
  const slots = [1, 2, 3].map(n => { const i = G.slotInfo(n); return `<div class="slot"><div><b>Slot ${n}</b><div class="small muted">${i ? `${h(ER.artists[i.artist].name)} · ${i.mode === 'story' ? 'Story' : 'Era Start'} · ${i.y}, week ${i.w}` : 'Empty'}</div></div><div class="row">${i ? `<button class="btn" data-act="load" data-n="${n}">Continue</button><button class="btn ghost sm" data-act="delslot" data-n="${n}" aria-label="Delete slot ${n}">Delete</button>` : `<button class="btn" data-act="newgame" data-n="${n}">New game</button>`}</div></div>`; }).join('');
  const artists = ['taylor','beyonce','gaga'].map(id => { const a = ER.artists[id]; return `<div class="artist ${a.comingNext ? 'soon' : ''}"><div class="sw" style="background:${a.color || '#d6a93a'}"></div><div><b>${h(a.name)}</b><div class="small muted">${a.comingNext ? 'Coming next. The story is mapped.' : 'Playable: 1989 to 2026, then free play'}</div></div>${a.comingNext ? `<button class="btn ghost sm" data-act="preview" data-id="${id}">Preview</button>` : ''}</div>`; }).join('');
  $('#app').innerHTML = `<div class="title">
    <div class="logo"><span class="eyebrow">A week-by-week career game</span><h1>The Eras Life</h1><p class="muted">Live through a documented career from the first demo to the last stadium night, then carry it on yourself.</p></div>
    <div class="stage3d tall" id="t3title"></div>
    ${card(`<h2>Saves</h2><div class="stack tight">${slots}</div><div class="row"><label class="btn ghost sm">Import a save<input type="file" accept=".json,application/json" data-act="import" hidden></label></div>`)}
    ${card(`<h2>Stories</h2><div class="stack tight">${artists}</div>`)}
    <p class="small faint">An unofficial fan project. No lyrics, audio, album art or photos of real people are used. Figures are stylised and are not likenesses. Event cards stick to the public record.</p></div>`;
  mount3D('#t3title', { set:'stadium', color:'#d6a93a', figs:[{ look:lookFor('tour', null, 'fearless'), anim:'strum' }] }, 'title');
}
function newGameFlow() {
  const n = UI.newg; const L = n.look;
  const opt = (k, arr) => `<div class="chips">${arr.map(([l, v]) => `<button class="chip ${L[k] === v ? 'on' : ''}" data-act="look" data-k="${k}" data-v="${v}">${k !== 'style' ? `<i class="dot" style="background:${v}"></i>` : ''}${h(l)}</button>`).join('')}</div>`;
  const eras = G.unlockedEras(); const P = ER.artists.taylor.projects.filter(p => p.type !== 'demos' && p.type !== 'edition');
  $('#app').innerHTML = `<div class="title">
    <div class="between"><h1>New game</h1><button class="btn ghost sm" data-act="title">Back</button></div>
    ${card(`<h2>Mode</h2><div class="chips">
      <button class="chip ${n.mode === 'story' ? 'on' : ''}" data-act="nmode" data-v="story">Story Mode</button>
      <button class="chip ${n.mode === 'era' ? 'on' : ''}" data-act="nmode" data-v="era">Era Start</button></div>
      <p class="small muted">${n.mode === 'story' ? 'Start at the beginning of her life. Weeks advance in order, and real events happen on their real dates.' : 'Start from any unlocked era, with the catalog and team of that moment. The event track is off and you control the calendar.'}</p>
      ${n.mode === 'era' ? `<div class="chips">${P.map(p => { const ok = eras.includes(p.id); return `<button class="chip ${n.era === p.id ? 'on' : ''}" ${ok ? '' : 'disabled'} data-act="nera" data-v="${p.id}"><i class="dot" style="background:${p.color}"></i>${h(p.short)}${ok ? '' : ' (locked)'}</button>`; }).join('')}</div><p class="small faint">Eras unlock when Story Mode reaches them.</p>` : ''}`)}
    ${card(`<h2>Difficulty</h2><div class="chips">${Object.keys(G.DIFF).map(k => `<button class="chip ${n.diff === k ? 'on' : ''}" data-act="ndiff" data-v="${k}">${G.DIFF[k].l} · ${G.DIFF[k].blocks} blocks</button>`).join('')}</div><p class="small muted">Difficulty changes Time Blocks, penalties and deadlines.</p>`)}
    ${card(`<h2>Era looks</h2><p class="small muted">The 3D performer changes with every era: hair, make-up and stage costumes. Tap an era to preview it.</p>
      <div class="stage3d" id="t3look"></div>
      <div class="chips">${['early','ts1','fearless','speaknow','red','1989','rep','lover','folklore','evermore','fearlesstv','redtv','midnights','speaknowtv','1989tv','ttpd','showgirl'].map(k => { const pr = ER.artists.taylor.projects.find(q => q.id === k); return `<button class="chip ${n.lookEra === k ? 'on' : ''}" data-act="lookera" data-v="${k}">${pr ? `<i class="dot" style="background:${pr.color}"></i>` + h(pr.short) : 'Childhood'}</button>`; }).join('')}</div>
      <h3>Eras Tour acts</h3><div class="chips">${ERAS_CYCLE.map(k => { const pr = ER.artists.taylor.projects.find(q => q.id === k); return `<button class="chip ${n.lookEra === 'eras:' + k ? 'on' : ''}" data-act="lookera" data-v="eras:${k}"><i class="dot" style="background:${pr.color}"></i>${h(pr.short)}</button>`; }).join('')}</div>`)}
    <button class="btn big" data-act="begin">${n.mode === 'story' ? 'Begin the prologue' : 'Start this era'}</button></div>`;
  { const k = n.lookEra || 'fearless', base = k.replace('eras:', ''), pr = ER.artists.taylor.projects.find(q => q.id === base), LK = ER.LOOKS.taylor[base];
    const figs = [{ look:lookFor('tour', null, k), anim:'sing', mic:!(k.startsWith('eras:') ? (LK.eras || LK.stage) : LK.stage).guitar, s:k === 'early' ? .78 : 1 }];
    if (!k.startsWith('eras:')) figs.push({ look:lookFor('', null, k), x:1.05, z:-.35, ry:-.5, anim:'idle', s:k === 'early' ? .72 : .92 });
    mount3D('#t3look', { set:k.startsWith('eras:') ? 'stadium' : 'theater', color:pr ? pr.color : '#7a9a4a', figs }, 'look'); }
}
function prologue() {
  const n = UI.newg, A = ER.artists.taylor, i = n.pro.length, pr = A.prologue[i];
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
  const nav = `<nav class="tabs" aria-label="Game tabs">${TABS.map(([k, l]) => { const ok = G.unlocked(k); const un = k === 'inbox' ? s.inbox.filter(m => !m.read).length : 0; return `<button class="tab ${UI.tab === k ? 'on' : ''}" ${ok ? '' : 'disabled'} data-act="tab" data-v="${k}">${h(l)}${un ? `<i class="badge">${un}</i>` : ''}${ok ? '' : ' 🔒'}</button>`; }).join('')}</nav>`;
  $('#app').innerHTML = top + nav + `<main id="main">${(VIEWS[UI.tab] || VIEWS.week)()}</main><div id="toast" class="toast"></div>`;
  if (UI.tab === 'week') mount3D('#t3stage', stageSpec(), 'main');
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
  return `${s.recovery ? card(`<b>Recovery goal:</b> raise your ${s.recovery.k === 'rep' ? 'Public Reputation' : 'team mood'} to 30. Weeks are harder until you do.`, 'warn') : ''}
  ${G.worldNotes().map(n => card(`<span class="eyebrow">The world right now</span><p class="small">${h(n)}</p>`, 'world')).join('')}
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
  ${r ? card(`<h3>Last week</h3><div class="grid3"><div><b class="${r.fans >= 0 ? 'pos' : 'neg'}">${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)}</b><span class="small muted"> fans</span></div><div><b class="${r.money >= 0 ? 'pos' : 'neg'}">${G.fmtM(r.money)}</b><span class="small muted"> money</span></div><div><b>${G.fmtN(r.units)}</b><span class="small muted"> units sold</span></div></div>
    ${r.lines.map(l => `<p class="small">${h(l)}</p>`).join('')}${r.team.map(l => `<p class="small muted">${h(l)}</p>`).join('')}`) : ''}`;
};
VIEWS.life = function () {
  const s = S(), A = G.art(), y = G.yw().y;
  const fam = A.people.filter(p => p.g === 'Family' && p.from <= y && (!p.to || p.to >= y));
  const school = s.abs < ER.ds('2007-06-04') ? (G.age() >= 11 ? 'In school (1 fixed block a week)' : 'Childhood') : 'Finished school through homeschooling';
  return `${card(`<h2>Life</h2><div class="grid3"><div><b>${G.age()}</b><div class="small muted">Age</div></div><div><b>${y}</b><div class="small muted">Year</div></div><div><b>${G.canon()}</b><div class="small muted">Canon Score</div></div></div>
   <h3>Stats</h3>${STAT.map(([k, l]) => `<div class="statrow"><span>${l}</span>${k === 'fans' ? `<b>${G.fmtN(s.stats.fans)}</b>` : bar(s.stats[k]) + `<b>${Math.round(s.stats[k])}</b>`}</div>`).join('')}
   <div class="statrow"><span>Genre</span><div class="genre"><i style="left:${s.stats.genre}%"></i></div><b class="small">${s.stats.genre < 33 ? 'Country' : s.stats.genre < 66 ? 'Pop' : 'Alternative'}</b></div>
   <p class="small muted">Moving the genre meter fast costs radio support and old fans in exchange for new ones.</p>`)}
  ${card(`<h3>Family</h3>${fam.map(p => `<div class="between small"><b>${h(p.n)}</b><span class="muted">${h(p.role)}</span></div>`).join('')}<h3>School</h3><p class="small">${h(school)}</p>`)}
  ${card(`<h2>Event cards</h2><p class="small muted">Your choices beside what really happened.</p>${s.log.slice().reverse().map(l => `<div class="logrow ${l.s ? 'sens' : ''}"><div class="between"><b>${h(l.t)}</b><span class="small muted">${h(G.fmtDate(l.abs))}</span></div>
     <div class="small">You: ${h(l.l)} ${l.world ? pill('World') : l.s || l.drama ? '' : l.canon ? pill('Canon', 'ok') : pill('What-if')}</div>${l.truth ? `<div class="small muted">What really happened: ${h(l.truth)}</div>` : ''}</div>`).join('') || '<p class="muted small">No cards yet.</p>'}`)}`;
};
VIEWS.songbook = function () {
  const s = S(), A = G.art(), groups = {};
  G.writable().forEach(w => { (groups[w.p.id] = groups[w.p.id] || []).push(w); });
  const act = G.active().filter(x => (x.st === 'write' || x.st === 'record') && x.p.type !== 'rerecord');
  if (!act.length) return card(`<h2>Songbook</h2><p class="muted">No era is in its writing stage right now. The Songbook only offers songs that belong to the current era.</p>`) + catalogCard();
  return act.map(({ p, st }) => {
    const all = p.tracks.map(t => [t, 'album']).concat((p.extras || []).map(t => [t, 'bonus'])).concat((p.vault || []).map(t => [t, 'vault']));
    const c = G.counts(p), co = UI.sel['co:' + p.id] || (p.cowriters || ['Solo'])[0];
    const tv = p.vaultFor && G.proj(p.vaultFor);
    return card(`<div class="between"><h2>${h(p.title)}</h2>${pill(stageName(st))}</div>${p.type !== 'demos' ? `<p class="small muted">${c.written} of ${c.target} album songs written.</p>${bar(c.written, c.target)}` : '<p class="small muted">Early songs and demos. Confidence labels show how well documented each title is.</p>'}
      <label class="field"><span>Co-writer</span><select data-act="selco" data-p="${p.id}">${(p.cowriters || ['Solo']).map(n => `<option ${n === co ? 'selected' : ''}>${h(n)}</option>`).join('')}</select></label>
      <p class="small faint">${h((A.cowriters[co] || {}).note || '')}</p>
      <div class="songs">${all.map(([t, k]) => { const so = s.songs[t]; return `<div class="song ${so ? 'has' : ''}"><div><b>${h(t)}</b><div class="small muted">${k === 'vault' ? `Vault: locked until ${h(tv ? tv.title : "Taylor's Version")}` : k === 'bonus' ? 'Bonus or other release' : 'Album track'}${p.confidence ? ' · ' + h(p.confidence[t] || 'reported') : ''}</div></div>
        ${so ? `<span class="pill">${so.st === 'written' ? 'Written' : so.st === 'recorded' ? 'Recorded' : so.st === 'vault' ? 'In the vault' : 'Released'} · ${so.q}</span>` : `<button class="btn sm" data-act="write" data-t="${h(t)}" data-p="${p.id}" ${G.canSpend(2) ? '' : 'disabled'}>Write · 2</button>`}</div>`; }).join('')}</div>`);
  }).join('') + catalogCard();
};
function catalogCard() {
  const s = S(), cat = Object.keys(s.songs);
  if (!cat.length) return '';
  return card(`<h3>Your catalog (${cat.length})</h3><div class="small muted">${cat.slice(-40).map(t => h(t)).join(' · ')}</div>`);
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
        ${p.tour.target ? `<p class="small">Real tour target: about ${G.fmtM(p.tour.target)}. Matching its scale gives a Canon bonus. Going far past it costs Energy.</p>${bar(tr.gross, p.tour.target)}` : ''}
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
    <h3>Messages</h3>${s.inbox.map(m => `<div class="msg ${m.read ? '' : 'unread'}" data-act="read" data-id="${m.id}"><div class="between"><b>${h(m.subj)}</b><span class="small muted">${h(F[m.from] || m.from)}</span></div><div class="small muted">${h(m.x)}</div><div class="small faint">${h(G.fmtDate(m.abs))}</div></div>`).join('') || '<p class="small muted">No messages.</p>'}`);
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
  return card(`<h2>${h(A.fanName)}</h2><div class="grid3"><div><b>${G.fmtN(s.stats.fans)}</b><div class="small muted">Fans</div></div><div><b>${G.fmtN(hard)}</b><div class="small muted">Hardcore</div></div><div><b>${s.eggs.decoded}</b><div class="small muted">Eggs decoded</div></div></div>
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
  const albums = s.released.filter(r => s.abs - r.abs < 40).map(r => ({ t:G.proj(r.pid).title, by:G.art().name, u:r.fw * Math.pow(.62, Math.max(0, r.wk)) + r.fw * .012, you:true }))
    .concat(s.charts.albums.filter(c => c.rival && s.abs - c.abs < 30).map(c => ({ t:c.t, by:c.by, u:c.fw * Math.pow(.6, c.wk) + c.fw * .01, rival:true })));
  const fill = ['Invented Band A','Various Artists','A Soundtrack','A Country Duo','A Boy Band','A Rapper','A Rock Band','An Indie Act'].map((n, i) => ({ t:n, by:'', u:90000 / (i + 1.2) }));
  const list = albums.concat(fill).sort((a, b) => b.u - a.u).slice(0, 10);
  const singles = s.charts.singles.filter(c => !c.out).slice(0, 10).sort((a, b) => a.pos - b.pos);
  return card(`<h2>Billboard 200 this week</h2><p class="small faint">Simulated chart. Rival albums appear on their real release dates.</p>${list.map((c, i) => `<div class="chart ${c.you ? 'you' : c.rival ? 'rival' : ''}"><b>${i + 1}</b><div><b>${h(c.t)}</b><div class="small muted">${h(c.by)}</div></div><span class="small">${G.fmtN(c.u)}</span></div>`).join('')}`)
  + card(`<h2>Hot 100: your singles</h2>${singles.map(c => `<div class="chart you"><b>${c.pos}</b><div><b>${h(c.t)}</b><div class="small muted">Peak ${c.peak}${c.real ? ` (real peak ${c.real})` : ''} · ${c.wk} weeks</div></div></div>`).join('') || '<p class="small muted">No singles on the chart.</p>'}`)
  + card(`<h2>Awards</h2>${s.awards.map(a => `<div class="between small"><span>🏆 ${h(a.n)}</span><span class="muted">${a.y}</span></div>`).join('') || '<p class="small muted">None yet.</p>'}`)
  + card(`<h2>First weeks</h2>${s.released.map(r => { const p = G.proj(r.pid); return `<div class="between small"><span>${h(p.title)}</span><span>${G.fmtN(r.fw)}${r.real ? ` <span class="muted">(real ${G.fmtN(r.real)})</span>` : ''}</span></div>`; }).join('') || '<p class="small muted">Nothing released yet.</p>'}`);
};
VIEWS.legacy = function () {
  const s = S(), hist = s.history.filter((_, i) => i % 4 === 0);
  const mx = Math.max(1, ...hist.map(x => x.fans));
  const spark = hist.length > 2 ? `<svg viewBox="0 0 300 70" class="spark" aria-label="Fans over time"><polyline fill="none" stroke="var(--era)" stroke-width="2" points="${hist.map((x, i) => `${(i / (hist.length - 1) * 300).toFixed(1)},${(68 - x.fans / mx * 64).toFixed(1)}`).join(' ')}"/></svg>` : '';
  const P = G.allProjects().filter(p => p.goals);
  return card(`<h2>Legacy</h2><div class="grid3"><div><b class="big">${G.canon()}</b><div class="small muted">Canon Score</div></div><div><b>${s.awards.length}</b><div class="small muted">Awards</div></div><div><b>${Math.round(s.stats.own)}%</b><div class="small muted">Ownership</div></div></div>
    <p class="small muted">The Canon Score measures how close your choices were to what she really did.</p>${spark}`)
  + card(`<h3>Era gallery</h3><div class="shelf">${s.released.map(r => { const p = G.proj(r.pid); return `<div class="sh">${coverSVG(G.pj(r.pid).cover, 84, r.pid)}<span class="small"><b>${h(p.short || p.title)}</b>${p.eraNo ? `<br><span class="faint">Era ${p.eraNo}</span>` : ''}<br>${G.fmtN(r.total)} sold</span></div>`; }).join('') || '<p class="small muted">Your albums appear here.</p>'}</div>`)
  + card(`<h3>Era goals</h3>${P.filter(p => s.goals[p.id] || G.stageOf(p, s.abs) !== 'none').map(p => `<div class="logrow"><b>${h(p.title)}</b>${p.goals.map((g, i) => `<div class="small">${s.goals[p.id] ? (s.goals[p.id][i] ? '✅' : '❌') : '⏳'} ${h(g.l)}</div>`).join('')}</div>`).join('') || '<p class="small muted">Goals appear as each era begins.</p>'}`)
  + card(`<h3>Achievements</h3><div class="chips">${Object.keys(G.ACH).map(k => `<span class="chip ${s.ach[k] ? 'on' : ''}">${s.ach[k] ? '★' : '☆'} ${h(G.ACH[k])}</span>`).join('')}</div>`)
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
  if (m.k === 'plan') {
    const pr = [['writing','Writing'],['fans','Fans'],['press','Press'],['rest','Rest'],['business','Business']];
    UI.sel.pri = UI.sel.pri || [];
    const el = modal(`<span class="eyebrow">Week 1</span><h2>Your plan for ${G.yw().y}</h2><p class="small muted">Pick two priorities. Tasks tied to them work 25% better all year.</p><div class="chips">${pr.map(([k, l]) => `<button class="chip ${UI.sel.pri.includes(k) ? 'on' : ''}" data-act="pri" data-k="${k}">${l}</button>`).join('')}</div><button class="btn big" data-act="planok">Set the plan</button>`);
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
      <div class="row" style="margin-top:8px">${next ? `<button class="btn ghost sm" data-act="nextreal" data-id="${next.id}">The next real era: ${h(next.title)}</button>` : ''}<button class="btn ghost sm" data-act="erabreak" data-w="26">Take six months off</button><button class="btn ghost sm" data-act="erabreak" data-w="52">Take a year off</button></div>`);
    const seedId = 'c' + P.eraNo + ne.title, pal = ER.seeded(seedId)() < .5 ? th.pals[0] : th.pals[1], lk = ER.makeEraLook(th, pal, seedId);
    mount3D('#t3era', { set:'stadium', color:pal[0], figs:[{ look:Object.assign({}, lk.base, lk.stage), anim:'sing', mic:!!lk.stage.mic, guitar:!!lk.stage.guitar }, { look:Object.assign({}, lk.base, lk.casual), x:1.05, z:-.35, ry:-.5, anim:'idle', s:.92 }] }, 'era');
    return;
  }
  if (m.k === 'free') {
    modal(`<span class="eyebrow">January 2027</span><h2>From here on, the story is yours</h2><p>The documented track ends. From now on, the songs, the calendar and the drama are an invented future, and nothing is labelled.</p><p class="small muted">Invented drama never gives real people invented misconduct or personal crises.</p><button class="btn big" data-act="freeok">Carry on</button>`);
  }
}
function eventModal(id) {
  const s = S(), drama = id.startsWith('drama:');
  const e = drama ? ER.DRAMA.find(x => x.id === id.slice(6)) : G.findEvent(id);
  const txt = drama ? G.dramaText(e) : e.x;
  modal(`<span class="eyebrow">${drama ? 'Drama' : e.s ? (e.world ? 'World event · Sensitive' : 'Sensitive') : e.world ? 'World event' : 'Real event'} · ${h(G.fmtDate(s.abs))}</span><h2>${h(e.t)}</h2>${e.s ? '' : '<div class="stage3d short" id="t3event"></div>'}
    <p>${h(txt)}</p>${e.s ? '<p class="small muted">This is told factually and briefly. You can respond only with support, safety or a public statement.</p>' : ''}
    <div class="stack tight" id="evch">${e.ch.map((c, i) => `<button class="choice" data-act="answer" data-id="${h(id)}" data-i="${i}">${h(c.l)}</button>`).join('')}</div>`, e.s ? 'sens' : '');
  if (!e.s) mount3D('#t3event', eventSpec(e), 'event');
}

/* ---------- Actions ---------- */
function after(r) { if (r && r.err) toast(r.err); else if (r && r.msg) toast(r.msg); render(); }
const ACT = {
  tab:d => { UI.tab = d.v; render(); window.scrollTo(0, 0); },
  do:d => after(G.doTask(d.id, d.arg || undefined)),
  write:d => { const t = G.tasks().find(x => x.kind === 'write' && x.p === d.p); if (!t) return toast('Nothing to write here.'); if (G.taskDone(t.id)) { if (!G.canSpend(2)) return toast('No blocks left.'); const r = G.writeSong(d.t, UI.sel['co:' + d.p] || G.proj(d.p).cowriters[0]); G.S().week.used += 2; toast(`Wrote "${d.t}". Quality ${r.q}.`); return render(); }
    after(G.doTask(t.id, { t:d.t, co:UI.sel['co:' + d.p] })); },
  record:d => { const t = G.tasks().find(x => x.kind === 'record' && x.p === d.p); const prod = UI.sel['pr:' + d.p];
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
  ff:() => { const n = G.fastForward(52); toast(n ? `Skipped ${n} quiet week${n > 1 ? 's' : ''}.` : 'This week needs you.'); render(); },
  saveroutine:() => { const n = G.saveRoutine(); toast(n ? `Routine saved: ${n} tasks.` : 'Do some optional tasks first, then save them as a routine.'); render(); },
  applyroutine:() => { const n = G.applyRoutine(); toast(`Applied ${n} routine task${n === 1 ? '' : 's'}.`); render(); },
  answer:d => { const r = G.answer(d.id, +d.i); const sh = document.querySelector('.modal .sheet'); const s = G.S(); const yr = ER.yw(s.abs).y;
    if (sh) { const box = sh.querySelector('#evch'); box.innerHTML = `${r.r ? `<p><b>${h(r.r)}</b></p>` : ''}${r.truth ? `<div class="truth"><span class="eyebrow">What really happened</span><p class="small">${h(r.truth)} (Public record, ${yr})</p></div>` : ''}<button class="btn big" data-act="evok">Continue</button>`; } },
  evok:() => { closeModals(); render(); },
  pri:d => { const a = UI.sel.pri; const i = a.indexOf(d.k); if (i >= 0) a.splice(i, 1); else { a.push(d.k); if (a.length > 2) a.shift(); } closeModals(); modals(); },
  planok:() => { G.S().priorities = (UI.sel.pri || []).slice(); UI.sel.pri = null; G.S().modal.shift(); closeModals(); render(); },
  modalok:() => { G.S().modal.shift(); closeModals(); render(); },
  pitch:() => { G.proposeEra(); render(); },
  ne:d => { UI.sel.ne[d.k] = d.v; const o = $('#ne-own'); if (o) o.value = ''; closeModals(); modals(); },
  nesel:(d, el) => { UI.sel.ne[d.k] = +el.value; },
  startera:() => { const ne = UI.sel.ne, own = (($('#ne-own') || {}).value || '').trim(); const p = G.newEra(own || ne.title, ne.n, ne.weeks, ne.tour, ne.theme);
    G.S().modal = G.S().modal.filter(m => m.k !== 'nextera'); UI.sel.ne = null; closeModals(); toast(`Era ${p.eraNo}: ${p.title} begins.`); UI.tab = 'week'; render(); },
  erabreak:d => { G.takeBreak(+d.w); G.S().modal = G.S().modal.filter(m => m.k !== 'nextera'); closeModals(); toast('Taking a break.'); render(); },
  freeok:() => { G.S().modal.shift(); G.enterFree(); closeModals(); render(); },
  newera:() => { const t = ($('#ne-title') || {}).value || '', n = +($('#ne-n') || {}).value || 13, w = +($('#ne-w') || {}).value || 32, tr = +($('#ne-t') || {}).value || 0; const p = G.newEra(t.trim(), n, w, tr); toast(`${p.title} is on the calendar.`); UI.tab = 'week'; render(); },
  nextreal:d => { G.startNextReal(d.id); G.S().proposal = null; G.S().modal = G.S().modal.filter(m => m.k !== 'nextera'); closeModals(); toast('The next era begins.'); UI.tab = 'week'; render(); },
  menu:() => { const s = G.S(); modal(`<h2>Menu</h2><p class="small muted">Slot ${s.slot} · ${s.mode === 'story' ? 'Story Mode' : 'Era Start'} · ${G.DIFF[s.diff].l}. The game autosaves every week.</p>
      <div class="stack tight"><button class="btn" data-act="savenow">Save now</button><button class="btn ghost" data-act="export">Export save file</button><label class="btn ghost">Import save file<input type="file" accept=".json,application/json" data-act="import" hidden></label><button class="btn ghost" data-act="totitle">Title screen</button><button class="btn ghost" data-act="closem">Close</button></div>`); },
  savenow:() => { G.save(); toast('Saved.'); closeModals(); },
  export:() => { const b = new Blob([G.exportSave()], { type:'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `eras-life-slot${G.S().slot}-${G.yw().y}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('Save file downloaded.'); },
  totitle:() => { G.save(); G.set(null); closeModals(); title(); },
  // Title flow
  title:() => { UI.newg = null; title(); },
  load:d => { if (G.load(+d.n)) { UI.tab = 'week'; render(); } else toast('That save could not be read.'); },
  delslot:d => { if (confirm(`Delete slot ${d.n}?`)) { G.del(+d.n); title(); } },
  newgame:d => { UI.newg = { slot:+d.n, mode:'story', diff:'standard', era:'ts1', look:{ hair:LOOKS.hair[3][1], style:'curly', skin:LOOKS.skin[2][1] }, pro:[], lookEra:'fearless' }; newGameFlow(); },
  nmode:d => { UI.newg.mode = d.v; newGameFlow(); }, nera:d => { UI.newg.era = d.v; newGameFlow(); }, ndiff:d => { UI.newg.diff = d.v; newGameFlow(); },
  look:d => { UI.newg.look[d.k] = d.v; newGameFlow(); },
  lookera:d => { UI.newg.lookEra = d.v; newGameFlow(); },
  pera:d => { UI.sel.pera = +d.i; const a = ER.artists[d.id]; const l = ER.LOOKS[d.id][+d.i]; document.querySelectorAll('.modal [data-act=pera]').forEach(b => b.classList.toggle('on', b.dataset.i === d.i));
    mount3D('#t3prev', { set:'stadium', color:a.color, figs:[{ look:Object.assign({}, l.base, l.stage), anim:'sing' }] }, 'prev'); },
  begin:() => { const n = UI.newg; if (n.mode === 'story') return prologue(); G.newGame({ artist:'taylor', mode:'era', era:n.era, diff:n.diff, slot:n.slot, look:n.look }); UI.tab = 'week'; render(); },
  pro:d => { const n = UI.newg; n.pro.push(+d.i); if (n.pro.length < ER.artists.taylor.prologue.length) return prologue();
    G.newGame({ artist:'taylor', mode:'story', diff:n.diff, slot:n.slot, look:n.look, prologue:n.pro }); UI.tab = 'week'; render(); },
  preview:d => { const a = ER.artists[d.id], LK = ER.LOOKS[d.id]; modal(`<span class="eyebrow">Coming next</span><h2>${h(a.name)}</h2>
      <div class="stage3d" id="t3prev"></div><div class="chips">${LK.map((l, i) => `<button class="chip ${i === LK.length - 1 ? 'on' : ''}" data-act="pera" data-id="${d.id}" data-i="${i}">${h(l.n)}</button>`).join('')}</div><p>${h(a.core)}</p><p class="small muted">${h(a.eggStyle)} ${h(a.songbook)}</p>
      <div class="ptable">${a.periods.map(r => `<div class="logrow"><div class="between"><b>${h(r[1])}</b><span class="small muted">${h(r[0])}</span></div><div class="small">${h(r[2])}</div><div class="small faint">System: ${h(r[3])}</div></div>`).join('')}</div>
      <h3>Catalog</h3><p class="small">${a.catalog.map(h).join(' · ')}</p><h3>People</h3><p class="small">${a.people.map(h).join(' · ')}</p>${a.note ? `<p class="small muted">${h(a.note)}</p>` : ''}
      <p class="small faint">Built after Taylor's story proves the systems. In Taylor's game, ${h(a.name)} already appears as a real chart rival and awards competitor.</p><button class="btn" data-act="closem">Close</button>`);
      const l = LK[LK.length - 1]; mount3D('#t3prev', { set:'stadium', color:a.color, figs:[{ look:Object.assign({}, l.base, l.stage), anim:'sing' }] }, 'prev'); }
};
document.addEventListener('click', e => {
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
UI.start = () => { title(); };
})();
