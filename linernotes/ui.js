/* Liner Notes: interface core, Home, Studio and Charts. */
(function () {
const D = window.LND, LN = window.LN;
const UI = window.UI = { tab: 'home', sub: { studio: 'vault', charts: 's', social: 'feed', career: 'live' }, region: null, S: null, lastReport: null, A: {} };
const A = UI.A;
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
UI.esc = esc; UI.$ = $;
const fmt = LN.fmt, money = LN.money;

// ------------------------------------------------------------------ icons
const ICON = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  studio: '<path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
  charts: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  social: '<path d="M4 5h16v11H8l-4 4z"/>',
  career: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  up: '<path d="M12 5l7 8H5z"/>', down: '<path d="M12 19l-7-8h14z"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', heart: '<path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
};
UI.icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;

// ------------------------------------------------------------------ avatar
UI.svgAvatar = function (look, size = 80) {
  look = Object.assign(LN.defaultLook(), look || {});
  const hairs = { long: '<rect x="25" y="22" width="30" height="34" rx="10" fill="H"/>', bob: '<rect x="24" y="20" width="32" height="24" rx="12" fill="H"/>', curly: '<circle cx="40" cy="24" r="17" fill="H"/>', braids: '<rect x="26" y="30" width="5" height="26" fill="H"/><rect x="49" y="30" width="5" height="26" fill="H"/>', ponytail: '<rect x="50" y="22" width="8" height="22" rx="4" fill="H"/>', bun: '<circle cx="40" cy="12" r="6" fill="H"/>' };
  const hb = (hairs[look.hair] || '').replace(/H/g, look.hairColor);
  const top = look.top === 'gown' ? `<path d="M28 46 L52 46 L60 80 L20 80 Z" fill="${look.topColor}"/>` : `<rect x="25" y="46" width="30" height="${look.top === 'crop' ? 14 : 22}" rx="7" fill="${look.topColor}"/>`;
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" class="svgav" aria-hidden="true"><rect width="80" height="80" rx="14" fill="#2a2350"/>${hb}
  <rect x="${look.bottom === 'shorts' ? 29 : 29}" y="64" width="9" height="16" fill="${look.bottom === 'skirt' ? look.skin : look.bottomColor}"/><rect x="42" y="64" width="9" height="16" fill="${look.bottom === 'skirt' ? look.skin : look.bottomColor}"/>
  ${top}<rect x="36" y="40" width="8" height="8" fill="${look.skin}"/><circle cx="40" cy="30" r="12" fill="${look.skin}"/>
  ${['buzz', 'mohawk'].includes(look.hair) ? '' : `<path d="M28 28 a12 12 0 0 1 24 0 z" fill="${look.hairColor}"/>`}${look.hair === 'mohawk' ? `<rect x="37" y="14" width="6" height="10" fill="${look.hairColor}"/>` : ''}
  <circle cx="36" cy="31" r="1.6" fill="#1d1d24"/><circle cx="44" cy="31" r="1.6" fill="#1d1d24"/>${look.acc === 'shades' ? '<rect x="32" y="28.5" width="16" height="4" rx="2" fill="#111"/>' : ''}
  ${look.acc === 'crown' ? '<path d="M31 18 l3 -6 l3 4 l3 -6 l3 6 l3 -4 l3 6 z" fill="#f2c14e"/>' : ''}${look.acc === 'cap' ? `<path d="M28 24 a12 10 0 0 1 24 0 h6 v2 h-30z" fill="${look.accColor}"/>` : ''}</svg>`;
};
UI.portrait = function (look, size = 160) {
  const url = window.L3 && L3.available() ? L3.portrait(look, size) : null;
  return url ? `<img class="portrait" src="${url}" width="${size}" height="${size}" alt="">` : UI.svgAvatar(look, size);
};

// ------------------------------------------------------------------ cover art
UI.coverCache = {};
UI.coverURL = function (spec, title, artist, look, size = 300) {
  spec = spec || { bg: '#2a2350', bg2: '#ff7a45', pattern: 'burst', ink: '#ffffff', font: 'display', photo: true, layout: 'bottom' };
  const key = JSON.stringify([spec, title, artist, spec.photo ? look : 0, size]); if (UI.coverCache[key]) return UI.coverCache[key];
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); const s = size / 300;
  const grd = g.createLinearGradient(0, 0, size, size); grd.addColorStop(0, spec.bg); grd.addColorStop(1, spec.bg2 || spec.bg); g.fillStyle = grd; g.fillRect(0, 0, size, size);
  g.save(); g.globalAlpha = 0.28; g.fillStyle = spec.ink; g.strokeStyle = spec.ink; g.lineWidth = 3 * s;
  const P = spec.pattern;
  if (P === 'burst') { g.translate(size / 2, size / 2); for (let i = 0; i < 24; i++) { g.rotate(Math.PI / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(size, 18 * s); g.lineTo(size, -18 * s); g.fill(); } }
  if (P === 'stripes') for (let i = -size; i < size * 2; i += 26 * s) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + size, size); g.lineWidth = 10 * s; g.stroke(); }
  if (P === 'circles') for (let r = 20 * s; r < size; r += 24 * s) { g.beginPath(); g.arc(size / 2, size / 2, r, 0, Math.PI * 2); g.stroke(); }
  if (P === 'grid') for (let i = 0; i < size; i += 30 * s) { g.fillRect(i, 0, 1.5 * s, size); g.fillRect(0, i, size, 1.5 * s); }
  if (P === 'dots') for (let x = 10 * s; x < size; x += 22 * s) for (let y = 10 * s; y < size; y += 22 * s) { g.beginPath(); g.arc(x, y, 4 * s, 0, Math.PI * 2); g.fill(); }
  if (P === 'vinyl') { g.globalAlpha = 0.55; g.fillStyle = '#111'; g.beginPath(); g.arc(size * 0.62, size * 0.45, size * 0.36, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.9; g.fillStyle = spec.bg2 || '#ff7a45'; g.beginPath(); g.arc(size * 0.62, size * 0.45, size * 0.1, 0, Math.PI * 2); g.fill(); }
  g.restore();
  const finish = () => {
    const font = spec.font === 'serif' ? 'Georgia, serif' : spec.font === 'mono' ? '"DM Mono", monospace' : spec.font === 'script' ? '"Brush Script MT", cursive' : '"Bricolage Grotesque", "Arial Black", sans-serif';
    g.fillStyle = spec.ink; g.textAlign = spec.layout === 'center' ? 'center' : 'left';
    const x = spec.layout === 'center' ? size / 2 : 18 * s; let y = spec.layout === 'top' ? 46 * s : spec.layout === 'center' ? size / 2 : size - 52 * s;
    let fs = 34 * s; g.font = `800 ${fs}px ${font}`; while (g.measureText(title).width > size - 36 * s && fs > 12) { fs -= 2; g.font = `800 ${fs}px ${font}`; }
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 6 * s; g.fillText(title, x, y); g.font = `600 ${15 * s}px ${font}`; g.fillText(artist.toUpperCase(), x, y + 24 * s);
  };
  let pending = false;
  if (spec.photo && window.L3 && L3.available()) {
    const url = L3.portrait(look || {}, 220, spec.bg);
    if (url) { const im = UI.img(url); if (im) { g.save(); g.globalAlpha = 0.95; g.beginPath(); g.arc(size / 2, size * 0.42, size * 0.27, 0, Math.PI * 2); g.clip(); g.drawImage(im, size * 0.23, size * 0.15, size * 0.54, size * 0.54); g.restore(); } else pending = true; }
  }
  finish();
  const out = c.toDataURL('image/jpeg', 0.85); if (!pending) UI.coverCache[key] = out; return out;
};
// decoded images for drawing portraits onto covers; when one finishes loading, covers are redrawn
UI.imgs = {};
UI.img = function (url) {
  const have = UI.imgs[url]; if (have) return have.ok ? have.im : null;
  const im = new Image(); const rec = UI.imgs[url] = { im, ok: false };
  im.onload = () => { rec.ok = true; clearTimeout(UI._imgT); UI._imgT = setTimeout(() => {
    document.querySelectorAll('img.cover[data-rel]').forEach(el => { const r = LN.rel(UI.S, el.dataset.rel); if (r) el.src = UI.coverURL(r.cover, r.title, UI.S.artist.name, r.eraLook || UI.S.look, 300); });
    const rc = document.getElementById('rel-cover'); if (rc && UI.rel) rc.src = UI.coverURL(UI.rel.cover, UI.rel.title, UI.S.artist.name, UI.S.look, 300); }, 30); };
  im.src = url; return null;
};
UI.cover = (rel, size = 120) => { const S = UI.S; const look = (rel && rel.eraLook) || S.look; return `<img class="cover" ${rel ? `data-rel="${rel.id}"` : ''} src="${UI.coverURL(rel && rel.cover, rel ? rel.title : '', S.artist.name, look, 300)}" width="${size}" height="${size}" alt="Cover of ${esc(rel ? rel.title : '')}">`; };

// ------------------------------------------------------------------ toast & modal
UI.toast = function (msg, kind = '') {
  if (!msg) return; const t = document.createElement('div'); t.className = 'toast ' + kind; t.setAttribute('role', 'status'); t.textContent = msg;
  const box = $('#toasts'); while (box.children.length >= 3) box.firstChild.remove(); box.appendChild(t); setTimeout(() => t.classList.add('out'), 3800); setTimeout(() => t.remove(), 4300);
};
UI.achToast = list => { if (!list.length) return; UI.toast(list.length === 1 ? 'Achievement: ' + list[0] : `${list.length} achievements: ${list.join(', ')}`, 'gold'); };
UI.modal = function (html, opts = {}) {
  UI.closeModal(true);
  const m = document.createElement('div'); m.className = 'modal-wrap' + (opts.full ? ' full' : ''); m.id = 'modal';
  m.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${opts.noClose ? '' : `<button class="mclose" data-a="closeModal" aria-label="Close">${UI.icon('close')}</button>`}${html}</div>`;
  document.body.appendChild(m); UI.onClose = opts.onClose || null;
  m.addEventListener('click', e => { if (e.target === m && !opts.noClose) UI.closeModal(); });
  const f = m.querySelector('input,select,button:not(.mclose)'); if (f && !opts.noFocus) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) { } }, 30);
  return m;
};
UI.closeModal = function (silent) { const m = $('#modal'); if (!m) return; let had3d = false; if (window.L3) { const st = m.querySelector('.stage3d, .prev3d'); if (st) { L3.stop(); had3d = true; } } m.remove(); const cb = UI.onClose; UI.onClose = null; if (cb && !silent) cb(); if (had3d && !silent && UI.S && !$('#modal') && document.querySelector('#main .prev3d')) UI.render(); };
A.closeModal = () => UI.closeModal();

// ------------------------------------------------------------------ saving
const SLOT = n => 'ln-slot-' + n;
UI.save = function () {
  const S = UI.S; if (!S) return;
  try { localStorage.setItem(SLOT(S.slot), LN.serialize(S)); localStorage.setItem('ln-last', String(S.slot)); }
  catch (e) { UI.toast('Could not save on this device. Free up storage or delete another save slot.', 'bad'); }
};
UI.loadSlot = n => { try { const t = localStorage.getItem(SLOT(n)); return t ? LN.deserialize(t) : null; } catch (e) { return null; } };
UI.slotInfo = n => { try { const t = localStorage.getItem(SLOT(n)); if (!t) return null; const S = JSON.parse(t); return { name: S.artist.name, week: S.week, fans: S.fans ? Object.values(S.fans).reduce((a, b) => a + b, 0) : 0, retired: S.retired }; } catch (e) { return { broken: true }; } };
UI.deleteSlot = n => { try { localStorage.removeItem(SLOT(n)); } catch (e) { } };

// ------------------------------------------------------------------ results
UI.result = function (r, opts = {}) {
  if (!r) return r; if (r.msg) UI.toast(r.msg, r.ok === false ? 'bad' : '');
  const S = UI.S; UI.achToast(LN.checkAchievements(S));
  LN.tutorial(S); UI.save(); if (!opts.keepModal && r.ok !== false) UI.closeModal(true); UI.render(); return r;
};

// ------------------------------------------------------------------ shell
UI.go = function (tab, sub) { UI.tab = tab; if (sub) UI.sub[tab] = sub; UI.render(); const mn = $('#main'); if (mn) mn.scrollTop = 0; window.scrollTo(0, 0); };
A.go = d => UI.go(d.tab, d.sub);
A.sub = d => { UI.sub[UI.tab] = d.sub; UI.render(); };
UI.bar = (v, max = 100, cls = '') => `<span class="bar ${cls}"><span style="width:${Math.max(0, Math.min(100, v / max * 100))}%"></span></span>`;
UI.render = function () {
  const S = UI.S; if (!S) return;
  if (S.retired) { UI.renderRetired(); return; }
  const f = LN.fame(S);
  $('#hud').innerHTML = `<button class="hud-who" data-a="go" data-tab="home"><span class="hud-name">${esc(S.artist.name)}</span><span class="hud-date">${LN.dateLabel(S)} · age ${S.artist.age}</span></button>
    <div class="hud-stats"><span title="Money"><b>${money(S.money)}</b></span><span title="Fans"><b>${fmt(LN.totalFans(S))}</b> fans</span>
    <span class="hud-en" title="Energy">${UI.icon('bolt')}<b>${Math.round(S.energy)}</b>/${LN.maxEnergy(S)}</span></div>`;
  $('#nav').innerHTML = [['home', 'Home'], ['studio', 'Studio'], ['charts', 'Charts'], ['social', 'Social'], ['career', 'Career']].map(([t, n]) => {
    const badge = t === 'home' && S.inbox.length ? `<i class="badge">${S.inbox.length}</i>` : '';
    return `<button class="${UI.tab === t ? 'on' : ''}" data-a="go" data-tab="${t}" aria-current="${UI.tab === t ? 'page' : 'false'}">${UI.icon(t)}<span>${n}</span>${badge}</button>`; }).join('');
  const fn = UI.screens[UI.tab] || UI.screens.home; $('#main').innerHTML = fn(S);
  if (UI.after) { const a = UI.after; UI.after = null; a(); }
};
UI.screens = {};
const subtabs = (tab, list) => `<div class="subtabs" role="tablist">${list.map(([id, n]) => `<button role="tab" class="${UI.sub[tab] === id ? 'on' : ''}" data-a="sub" data-sub="${id}">${n}</button>`).join('')}</div>`;
UI.subtabs = subtabs;
const card = (title, body, extra = '') => `<section class="card ${extra}">${title ? `<h2>${title}</h2>` : ''}${body}</section>`;
UI.card = card;
const empty = t => `<p class="empty">${t}</p>`; UI.empty = empty;

// ------------------------------------------------------------------ HOME
UI.screens.home = function (S) {
  const tut = LN.tutorial(S); const f = LN.fame(S);
  const img = LN.imageTop(S);
  let h = '';
  if (tut) h += `<div class="tut" role="note"><b>Tutorial</b> ${esc(tut.text)} <button class="link" data-a="skipTut">Skip tutorial</button></div>`;
  h += `<section class="card me"><div class="me-av" data-a="go" data-tab="career" data-sub="life">${UI.portrait(S.look, 96)}</div><div class="me-txt">
    <h1>${esc(S.artist.name)}</h1><p class="muted">${esc(D.GENRE[S.artist.genre].name)} · ${esc(S.artist.city)} · ${S.label ? esc(S.label.name) : 'Independent'}</p>
    <div class="stats4"><span><small>Fame</small><b>${Math.round(f)}</b></span><span><small>Hype</small><b>${Math.round(S.hype)}</b></span><span><small>Image</small><b>${img}</b></span><span><small>Net worth</small><b>${money(LN.netWorth(S))}</b></span></div></div>
    <div class="meters"><label>Energy <b>${Math.round(S.energy)}/${LN.maxEnergy(S)}</b>${UI.bar(S.energy, LN.maxEnergy(S), 'en')}</label><label>Health <b>${Math.round(S.health)}</b>${UI.bar(S.health, 100, S.health < 35 ? 'bad' : 'ok')}</label><label>Stress <b>${Math.round(S.stress)}</b>${UI.bar(S.stress, 100, 'st')}</label></div>
    ${S.sick ? `<p class="warn">You are burned out for ${S.sick} more week${S.sick > 1 ? 's' : ''}. Energy is capped at 30.</p>` : ''}</section>`;
  // things in progress
  const now = [];
  if (LN.isTouring(S)) { const T = S.tour; const done = T.shows.filter(x => x.done).length; now.push(`<div class="row"><div><b>On tour: ${esc(T.name)}</b><small>${done} of ${T.shows.length} shows · next: ${esc((T.shows[T.idx] || {}).city || '')}</small>${UI.bar(done, T.shows.length)}</div>${done ? `<button class="btn sm" data-a="watchTour">Watch last show</button>` : ''}</div>`); }
  if (S.movie) now.push(`<div class="row"><div><b>${S.movie.stage === 'shoot' ? 'Filming' : 'In post-production'}: "${esc(S.movie.title)}"</b><small>${S.movie.stage === 'shoot' ? S.movie.left + ' shooting week(s) left' : 'Premieres ' + LN.dateLabel(S, S.movie.premiere)}</small></div><button class="btn sm ghost" data-a="go" data-tab="career" data-sub="movies">Details</button></div>`);
  for (const r of S.releases.filter(r => !r.out)) now.push(`<div class="row"><div><b>Coming ${LN.dateLabel(S, r.week)}: "${esc(r.title)}"</b><small>${LN.relTypeName(r.type)}. Post teasers to build buzz.</small></div></div>`);
  for (const b of S.bookings) now.push(`<div class="row"><div><b>${esc(b.fest)}</b><small>${LN.dateLabel(S, b.week)} · ${D.FEST_SLOTS.find(x => x.id === b.slot).name}</small></div></div>`);
  if (S.beef) { const n = LN.npc(S, S.beef.npc); if (n) now.push(`<div class="row"><div><b>Beef with ${esc(n.name)}</b><small>Ends ${LN.dateLabel(S, S.beef.end)}. Release a diss track that charts higher than theirs.</small></div></div>`); }
  if (now.length) h += card('Right now', now.join(''));
  // actions
  h += card('This week', `<div class="actions">
    ${actBtn('writeModal', 'Write a song', LN.energyCost.write)}${actBtn('go', 'Record & release', null, 'data-tab="studio" data-sub="vault"')}
    ${actBtn('practiceModal', 'Practice', LN.energyCost.practice)}${actBtn('gigModal', 'Play a gig', 15)}
    ${actBtn('postModal', 'Post on Buzzr', LN.energyCost.post)}${actBtn('restModal', 'Rest', null)}</div>
    <button class="btn big end" data-a="endWeek">End week ${UI.icon('down', 'rot')}</button>`);
  // inbox
  h += card(`Inbox ${S.inbox.length ? `<span class="pill">${S.inbox.length}</span>` : ''}`, S.inbox.length ? S.inbox.map(it => `<button class="row inbox-row k-${it.kind}" data-a="openInbox" data-id="${it.id}"><div><b>${esc(it.title)}</b><small>${esc(it.text)}</small></div><span class="exp">${it.exp - S.week <= 0 ? 'Last week' : (it.exp - S.week + 1) + ' wks'}</span></button>`).join('') : empty('No offers right now. Offers arrive as your fame grows.'));
  // report
  if (UI.lastReport && UI.lastReport.length) h += card('Last week', `<ul class="report">${UI.lastReport.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`);
  h += card('Headlines', S.news.slice(0, 5).map(n => `<p class="news t-${n.tag}"><small>${LN.dateLabel(S, n.w)}</small>${esc(n.text)}</p>`).join('') + `<button class="btn ghost sm" data-a="go" data-tab="social" data-sub="news">All news</button>`);
  return h;
};
function actBtn(a, label, cost, extra = '') { return `<button class="act" data-a="${a}" ${extra}><b>${label}</b>${cost != null ? `<small>${UI.icon('bolt')}${cost}</small>` : ''}</button>`; }
A.skipTut = () => { UI.S.flags.tut = 99; UI.save(); UI.render(); };

A.restModal = () => {
  const S = UI.S; const cost = Math.round(Math.max(1500, LN.netWorth(S) * 0.01) / 100) * 100;
  UI.modal(`<h2>Rest and recover</h2><p>Health ${Math.round(S.health)}/100 · Stress ${Math.round(S.stress)}/100</p>
  <div class="choices"><button class="choice" data-a="doRest"><b>Take the rest of the week off</b><small>Uses your remaining energy. Health up, stress down, and no exhaustion penalty.</small></button>
  <button class="choice" data-a="doVacation"><b>Go on vacation · ${money(cost)}</b><small>Health +30, stress -40. A little hype fades.</small></button></div>`);
};
A.doRest = () => UI.result(LN.rest(UI.S));
A.doVacation = () => UI.result(LN.vacation(UI.S));

A.endWeek = () => {
  const S = UI.S; if (S.energy > 25 && !UI.confirmedEnd && S.week < 3) { UI.confirmedEnd = true; UI.toast(`You still have ${Math.round(S.energy)} energy. Tap End week again to continue.`); return; }
  UI.confirmedEnd = false;
  const r = LN.endWeek(S); UI.lastReport = r.lines; UI.save();
  UI.achToast(r.ach || []);
  UI.render(); window.scrollTo(0, 0); const mn = $('#main'); if (mn) mn.scrollTop = 0;
  UI.queue = (r.events || []).slice(); UI.nextEvent();
};
UI.nextEvent = function () {
  const e = (UI.queue || []).shift(); if (!e) return;
  if (e.kind === 'ceremony') { UI.modal(`<h2>${esc(e.title)}</h2><p>${esc(e.text)}</p><div class="btns"><button class="btn" data-a="watchCeremony" data-key="${e.key}">Watch the ceremony</button><button class="btn ghost" data-a="closeModal">Skip</button></div>`, { onClose: UI.nextEvent }); return; }
  if (e.kind === 'year') { UI.yearModal(e); return; }
  UI.modal(`<h2>${esc(e.title)}</h2><p>${esc(e.text)}</p><button class="btn" data-a="closeModal">OK</button>`, { onClose: UI.nextEvent });
};
UI.yearModal = function (e) {
  const S = UI.S; const Y = S.yearEnd.find(y => y.year === e.year);
  const list = (arr) => arr.slice(0, 10).map((x, i) => `<li class="${x.P ? 'mine' : ''}"><span>${i + 1}</span><b>${esc(x.t)}</b><small>${esc(x.ar)}</small></li>`).join('');
  UI.modal(`<h2>${e.year} in review</h2><p>${esc(e.text)}</p>${Y ? `<div class="two"><div><h3>Top songs</h3><ol class="mini">${list(Y.s)}</ol></div><div><h3>Top albums</h3><ol class="mini">${list(Y.a)}</ol></div></div>` : ''}<button class="btn" data-a="closeModal">On to ${e.year + 1}</button>`, { onClose: UI.nextEvent });
};

// write
A.writeModal = (d = {}) => {
  const S = UI.S; const g = S.artist.genre;
  const opts = (arr, sel) => arr.map(x => `<option ${x === sel ? 'selected' : ''}>${esc(x)}</option>`).join('');
  const rivals = S.npcs.filter(n => n.active && (n.rival || n.rel < -10));
  UI.modal(`<h2>Write a song</h2>
  <label class="fld">Title <input id="w-title" maxlength="40" value="${esc(LN.songTitle())}"> <button class="btn sm ghost" data-a="rerollTitle" type="button">New idea</button></label>
  <label class="fld">Genre <select id="w-genre">${D.GENRES.map(x => `<option value="${x.id}" ${x.id === g ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
  <div class="two"><label class="fld">Mood <select id="w-mood">${opts(D.MOODS, LN.pick(D.MOODS))}</select></label><label class="fld">Topic <select id="w-topic" data-change="topicChange">${opts(D.TOPICS, d.diss ? 'Diss track' : LN.pick(D.TOPICS.slice(0, 14)))}</select></label></div>
  <label class="fld">Tempo <select id="w-tempo">${D.TEMPOS.map(t => `<option value="${t.id}">${t.name} (~${t.bpm} BPM)</option>`).join('')}</select></label>
  <label class="fld ${d.diss ? '' : 'hide'}" id="w-dissrow">Aimed at <select id="w-diss">${rivals.concat(S.npcs.filter(n => n.active && !rivals.includes(n)).slice(0, 40)).map(n => `<option value="${n.id}" ${n.id === d.diss ? 'selected' : ''}>${esc(n.name)}${n.rival ? ' (rival)' : ''}</option>`).join('')}</select></label>
  <label class="fld">Co-writer <select id="w-cow"><option value="">Write alone</option>${D.COWRITERS.map(c => `<option value="${c.id}">${esc(c.name)} · skill ${c.skill} · ${money(c.fee)} + ${Math.round(c.share * 100)}% of the song</option>`).join('')}</select></label>
  <p class="muted">Your songwriting skill is ${Math.floor(S.skills.write)}. ${D.FAMILY_NAME[D.GENRE[g].fam]} is trending at ${Math.round((S.trends[D.GENRE[g].fam] || 1) * 100)}%.</p>
  <div class="btns"><button class="btn" data-a="doWrite">Write it ${UI.icon('bolt')}${LN.energyCost.write}</button><button class="btn ghost" data-a="campModal">Writing camp</button></div>`);
};
A.rerollTitle = () => { $('#w-title').value = LN.songTitle(); };
A.topicChange = () => { $('#w-dissrow').classList.toggle('hide', $('#w-topic').value !== 'Diss track'); };
A.doWrite = () => {
  const topic = $('#w-topic').value;
  UI.result(LN.writeSong(UI.S, { title: $('#w-title').value, genre: $('#w-genre').value, mood: $('#w-mood').value, topic, tempo: $('#w-tempo').value, cowriter: $('#w-cow').value || null, diss: topic === 'Diss track' ? $('#w-diss').value : null }));
};
A.campModal = () => {
  const S = UI.S;
  UI.modal(`<h2>Writing camp</h2><p>Spend a week writing with other songwriters. You come back with several songs that are better than usual.</p>
  <label class="fld">Genre <select id="c-genre">${D.GENRES.map(x => `<option value="${x.id}" ${x.id === S.artist.genre ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
  <div class="choices">${D.CAMPS.map(c => `<button class="choice" data-a="doCamp" data-id="${c.id}"><b>${esc(c.name)} · ${money(c.cost)}</b><small>${c.songs} songs, +${c.bonus} quality, ${c.energy} energy</small></button>`).join('')}</div>`);
};
A.doCamp = d => UI.result(LN.writingCamp(UI.S, d.id, { genre: $('#c-genre').value }));

// practice
A.practiceModal = () => {
  const S = UI.S;
  UI.modal(`<h2>Practice</h2><p>Practice alone for free or pay for a class that teaches twice as much.</p>
  <div class="skills">${D.SKILLS.map(k => skillRow(k.id, k.name, S.skills[k.id])).join('')}${skillRow('acting', 'Acting', S.acting)}</div>`);
  function skillRow(id, name, v) { const cost = Math.round(250 * (1 + v / 18) / 50) * 50; return `<div class="skill"><div><b>${name}</b> <span class="muted">${Math.floor(v)}</span>${UI.bar(v)}</div><div class="btns"><button class="btn sm ghost" data-a="doPractice" data-k="${id}" data-m="self">Practice</button><button class="btn sm" data-a="doPractice" data-k="${id}" data-m="class">Class ${money(cost)}</button></div></div>`; }
};
A.doPractice = d => { const r = LN.practice(UI.S, d.k, d.m); UI.result(r, { keepModal: true }); if (r.ok) A.practiceModal(); };

// ------------------------------------------------------------------ STUDIO
UI.screens.studio = function (S) {
  let h = `<div class="btnrow"><button class="btn" data-a="writeModal">Write a song</button><button class="btn" data-a="releaseModal">New release</button><button class="btn ghost" data-a="moreStudio">More</button></div>`;
  h += subtabs('studio', [['vault', 'Vault'], ['releases', 'Releases'], ['disco', 'Discography'], ['videos', 'Videos']]);
  const sub = UI.sub.studio;
  if (sub === 'vault') {
    const songs = S.songs.filter(s => !s.rel && !s.leaked);
    h += card(`Song vault <span class="pill">${songs.length}</span>`, songs.length ? songs.sort((a, b) => b.written - a.written).map(s => `<div class="row song"><div><b>${esc(s.title)}</b><small>${esc(D.GENRE[s.genre].name)} · ${esc(s.mood)} · ${esc(s.topic)}${s.diss ? ' (at ' + esc(LN.artistName(S, s.diss)) + ')' : ''} · written ${LN.dateLabel(S, s.written)}</small>
      <small>${s.recorded ? `Recorded · quality <b class="q">${s.q}</b> ${LN.qWord(s.q)}${s.feat ? ' · feat. ' + esc(LN.artistName(S, s.feat)) : ''}` : `Demo · writing quality <b class="q">${s.wq}</b>`}</small></div>
      ${s.recorded ? `<button class="btn sm ghost" data-a="releaseModal" data-song="${s.id}">Release</button>` : `<button class="btn sm" data-a="recordModal" data-id="${s.id}">Record</button>`}</div>`).join('') : empty('Your vault is empty. Write a song to get started.'));
    const leaked = S.songs.filter(s => s.leaked); if (leaked.length) h += card('Scrapped', leaked.map(s => `<p class="muted">${esc(s.title)}</p>`).join(''));
  }
  if (sub === 'releases') {
    const rels = S.releases.slice().reverse();
    h += rels.length ? `<div class="grid-rel">${rels.map(r => `<button class="relcard" data-a="relModal" data-id="${r.id}">${UI.cover(r, 140)}<b>${esc(r.title)}</b><small>${LN.relTypeName(r.type)} · ${r.out ? LN.dateLabel(S, r.week) : 'coming ' + LN.dateLabel(S, r.week)}</small>${r.cert ? `<small class="cert">${LN.certName(r.cert)}</small>` : ''}</button>`).join('')}</div>` : card('', empty('Nothing released yet. Record a song, then tap New release.'));
  }
  if (sub === 'disco') h += UI.discography(S);
  if (sub === 'videos') {
    h += card('Music videos', S.videos.length ? S.videos.slice().reverse().map(v => `<div class="row"><div><b>${esc(v.title)}</b><small>Directed by ${esc(v.director)} · ${esc((D.CONCEPTS.find(c => c.id === v.concept) || {}).name || '')} · quality ${v.q}</small><small><b>${fmt(v.views)}</b> views</small></div><button class="btn sm ghost" data-a="watchVideo" data-id="${v.id}">Watch</button></div>`).join('') : empty('No videos yet. Shoot one for a released song.')) + `<button class="btn" data-a="videoModal">Shoot a music video</button>`;
  }
  return h;
};
A.moreStudio = () => {
  UI.modal(`<h2>More studio options</h2><div class="choices">
  <button class="choice" data-a="campModal"><b>Writing camp</b><small>Write several better songs in one go.</small></button>
  <button class="choice" data-a="remixModal"><b>Remix a song</b><small>A remix gives a released song a new push.</small></button>
  <button class="choice" data-a="rerecordModal"><b>Re-record an album</b><small>Make your own version of an album a label owns.</small></button>
  <button class="choice" data-a="liveModal"><b>Live album</b><small>Release recordings from a finished tour.</small></button>
  <button class="choice" data-a="videoModal"><b>Shoot a music video</b><small>Pick a director, concept and budget.</small></button>
  <button class="choice" data-a="pitchModal"><b>Pitch to playlists</b><small>Ask editors to add a released song to a playlist.</small></button></div>`);
};
UI.discography = function (S) {
  const rels = S.releases.filter(r => r.out && r.type !== 'remix');
  if (!rels.length) return card('Discography', empty('Your releases will be listed here with their chart peaks, sales and reviews.'));
  const peak = (o, t) => { const p = Math.min(...D.REGION_IDS.map(r => ((o.ch || {})[r + t] || {}).peak || 999)); return p < 999 ? '#' + p : '-'; };
  return card('Discography', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Release</th><th>Type</th><th>Peak</th><th>Units</th><th>Score</th><th>Plaque</th><th>Masters</th></tr></thead><tbody>
  ${rels.slice().reverse().map(r => { const single = r.type === 'single'; const s = single ? LN.song(S, r.songs[0]) : null;
    return `<tr data-a="relModal" data-id="${r.id}"><td><b>${esc(r.title)}</b><small>${LN.dateLabel(S, r.week)}</small></td><td>${LN.relTypeName(r.type)}</td><td>${single ? peak(s, 's') : peak(r, 'a')}</td><td>${fmt(single ? LN.songUnits(s || { streams: 0, sales: 0 }) : r.units * 0.32)}</td><td>${r.score != null ? r.score.toFixed(1) : '-'}</td><td>${LN.certName(single ? (s || {}).cert : r.cert) || '-'}</td><td>${r.masters === 'artist' || !r.masters ? 'You' : esc((D.LABELS.find(l => l.id === r.masters) || {}).name || 'Label')}</td></tr>`; }).join('')}</tbody></table></div>
  <p class="muted">Units are North American album and single units, which decide plaques. Tap a row for details.</p>`);
};

// record
A.recordModal = d => {
  const S = UI.S; const s = LN.song(S, d.id); if (!s) return;
  const pool = S.npcs.filter(n => n.active && !n.hiatus).sort((a, b) => b.fame - a.fame);
  UI.modal(`<h2>Record "${esc(s.title)}"</h2><p class="muted">${esc(D.GENRE[s.genre].name)} · writing quality ${s.wq}</p>
  <label class="fld">Studio <select id="r-studio" data-change="recCost">${D.STUDIOS.map(st => `<option value="${st.id}">${st.name} · ${money(st.cost * (1 - S.studioDiscount))} · max quality ${st.cap}</option>`).join('')}</select></label>
  <label class="fld">Producer <select id="r-prod" data-change="recCost">${D.PRODUCERS.map(p => `<option value="${p.id}">${p.id === 'self' ? `Produce it yourself (skill ${Math.floor(S.skills.prod)})` : `${esc(p.name)} · ${D.FAMILY_NAME[p.fam]} · skill ${p.skill} · ${money(p.fee)}`}</option>`).join('')}</select></label>
  <label class="fld">Featured artist <select id="r-feat" data-change="recCost"><option value="">No feature</option>${pool.map(n => `<option value="${n.id}">${esc(n.name)}${n.real ? '' : ' *'} · ${D.GENRE[n.genre].name} · ${n.own ? 'your label' : money(LN.featureFee(S, n.id))}</option>`).join('')}</select></label>
  <p class="muted small">* made-up artist. Real artists appear in made-up storylines.</p>
  <div id="r-info" class="info"></div>
  <button class="btn" data-a="doRecord" data-id="${s.id}">Record ${UI.icon('bolt')}${LN.energyCost.record}</button>`);
  A.recCost();
};
A.recCost = () => {
  const S = UI.S; const o = { studio: $('#r-studio').value, producer: $('#r-prod').value, feat: $('#r-feat').value || null };
  const pr = D.PRODUCERS.find(p => p.id === o.producer); const sid = document.querySelector('[data-a="doRecord"]').dataset.id; const s = LN.song(S, sid);
  const match = pr.fam && pr.fam === s.fam ? `<span class="good">${esc(pr.name)} specializes in this genre.</span>` : pr.fam ? `<span class="muted">${esc(pr.name)} usually works in ${D.FAMILY_NAME[pr.fam]}.</span>` : '';
  const ch = o.feat ? `Chance they say yes: <b>${Math.round(LN.featureChance(S, o.feat) * 100)}%</b> (you only pay if they do).` : '';
  $('#r-info').innerHTML = `<p>Total cost: <b>${money(LN.recordCost(S, o))}</b> · you have ${money(S.money)}</p><p>${match}</p><p>${ch}</p>`;
};
A.doRecord = d => UI.result(LN.recordSong(UI.S, d.id, { studio: $('#r-studio').value, producer: $('#r-prod').value, feat: $('#r-feat').value || null }));

// release builder
UI.rel = null;
A.releaseModal = d => {
  const S = UI.S; const ready = S.songs.filter(s => s.recorded && !s.rel && !s.leaked);
  const albums = S.releases.filter(r => r.out && r.type === 'album' && !r.deluxe);
  if (!ready.length) { UI.toast('Record a song first. Release-ready songs come from the vault.', 'bad'); return; }
  UI.rel = UI.rel && UI.rel.keep ? UI.rel : { type: 'single', songs: d && d.song ? [d.song] : [ready[0].id], title: '', delay: 0, teasers: false, presave: false, eraLook: false, partner: '', base: albums[0] ? albums[0].id : '', cover: { bg: LN.pick(['#2a2350', '#0f5f5f', '#d6334f', '#1d1d24', '#ff8a3d', '#7b4dff']), bg2: LN.pick(['#ff7a45', '#ffd23f', '#2e8bff', '#ff6fb5', '#3ec28f']), pattern: LN.pick(['burst', 'stripes', 'circles', 'grid', 'dots', 'vinyl', 'none']), ink: '#ffffff', font: 'display', photo: true, layout: 'bottom' } };
  UI.rel.keep = false; UI.relDraw();
};
UI.relDraw = function () {
  const S = UI.S, R = UI.rel; const ready = S.songs.filter(s => s.recorded && !s.rel && !s.leaked);
  if (!R.title) { const first = LN.song(S, R.songs[0]); R.title = R.type === 'single' && first ? first.title : LN.albumTitle(); }
  const albums = S.releases.filter(r => r.out && r.type === 'album' && !r.deluxe);
  const partners = S.npcs.filter(n => n.active && !n.hiatus && !n.rival).sort((a, b) => b.rel - a.rel || b.fame - a.fame).slice(0, 60);
  const types = [['single', 'Single', '1-3 songs'], ['ep', 'EP', '3-6 songs'], ['album', 'Album', '7-20 songs'], ['deluxe', 'Deluxe', 'adds 2-8 songs to an album'], ['joint', 'Joint album', 'with another artist']];
  const cost = LN.rolloutCost(S, R);
  const cv = R.cover;
  const colorOpts = (id, val) => `<span class="swatches">${D.CLOTH_COLORS.concat(['#2a2350', '#ff7a45']).map(c => `<button type="button" class="sw ${c === val ? 'on' : ''}" style="background:${c}" data-a="relSet" data-k="${id}" data-v="${c}" aria-label="color ${c}"></button>`).join('')}</span>`;
  const proj = LN.validateRelease(S, Object.assign({}, R, { title: R.title || 'x' })) ? null : LN.project(S, R);
  UI.modal(`<h2>New release</h2>
  <div class="seg">${types.map(([id, n, t]) => `<button class="${R.type === id ? 'on' : ''}" data-a="relType" data-t="${id}" title="${t}">${n}</button>`).join('')}</div>
  <label class="fld">Title <input id="rel-title" maxlength="48" value="${esc(R.title)}" data-input="relTitle"></label>
  ${R.type === 'deluxe' ? `<label class="fld">Album <select id="rel-base" data-change="relBase">${albums.map(a => `<option value="${a.id}" ${a.id === R.base ? 'selected' : ''}>${esc(a.title)}</option>`).join('') || '<option value="">You have no album yet</option>'}</select></label>` : ''}
  ${R.type === 'joint' ? `<label class="fld">Partner <select id="rel-partner" data-change="relPartner"><option value="">Choose an artist</option>${partners.map(n => `<option value="${n.id}" ${n.id === R.partner ? 'selected' : ''}>${esc(n.name)} · relationship ${Math.round(n.rel)}</option>`).join('')}</select></label>` : ''}
  <h3>Songs <small class="muted">${R.songs.length} picked · tap to add or remove${R.type !== 'single' ? ', star the lead single' : ''}</small></h3>
  <div class="picklist">${ready.map(s => { const i = R.songs.indexOf(s.id); return `<div class="pick ${i >= 0 ? 'on' : ''}"><button class="pk" data-a="relSong" data-id="${s.id}">${i >= 0 ? `<i>${i + 1}</i>` : '<i>+</i>'}<b>${esc(s.title)}</b><small>q${s.q} · ${esc(D.GENRE[s.genre].name)}</small></button>${R.type !== 'single' && i >= 0 ? `<button class="star ${R.lead === s.id || (!R.lead && i === 0) ? 'on' : ''}" data-a="relLead" data-id="${s.id}" aria-label="Lead single">★</button>` : ''}</div>`; }).join('')}</div>
  <h3>Cover art</h3>
  <div class="coverbox"><img id="rel-cover" class="cover" src="${UI.coverURL(cv, R.title, S.artist.name, S.look, 300)}" width="150" height="150" alt="Cover preview">
  <div class="covctl"><div><small>Background</small>${colorOpts('bg', cv.bg)}</div><div><small>Second color</small>${colorOpts('bg2', cv.bg2)}</div>
  <div class="seg sm">${['burst', 'stripes', 'circles', 'grid', 'dots', 'vinyl', 'none'].map(p => `<button class="${cv.pattern === p ? 'on' : ''}" data-a="relSet" data-k="pattern" data-v="${p}">${p}</button>`).join('')}</div>
  <div class="seg sm">${['display', 'serif', 'mono', 'script'].map(p => `<button class="${cv.font === p ? 'on' : ''}" data-a="relSet" data-k="font" data-v="${p}">${p}</button>`).join('')}</div>
  <div class="seg sm">${['top', 'center', 'bottom'].map(p => `<button class="${cv.layout === p ? 'on' : ''}" data-a="relSet" data-k="layout" data-v="${p}">text ${p}</button>`).join('')}<button class="${cv.ink === '#ffffff' ? 'on' : ''}" data-a="relSet" data-k="ink" data-v="${cv.ink === '#ffffff' ? '#1d1d24' : '#ffffff'}">${cv.ink === '#ffffff' ? 'white text' : 'dark text'}</button></div>
  <label class="chk"><input type="checkbox" id="rel-photo" ${cv.photo ? 'checked' : ''} data-change="relPhoto"> Put your photo on it</label></div></div>
  <h3>Rollout</h3>
  <label class="fld">Release <select id="rel-delay" data-change="relDelay">${[0, 1, 2, 3, 4, 6, 8].map(n => `<option value="${n}" ${R.delay === n ? 'selected' : ''}>${n ? `in ${n} week${n > 1 ? 's' : ''} (${LN.dateLabel(S, S.week + n)})` : 'this week'}</option>`).join('')}</select></label>
  <label class="chk"><input type="checkbox" id="rel-teasers" ${R.teasers ? 'checked' : ''} data-change="relChk"> Paid teaser campaign (${money(1500 + LN.totalFans(S) * 0.004)})</label>
  <label class="chk"><input type="checkbox" id="rel-presave" ${R.presave ? 'checked' : ''} data-change="relChk"> Pre-save campaign (${money(1000 + LN.totalFans(S) * 0.003)})</label>
  ${R.type !== 'single' ? `<label class="chk"><input type="checkbox" id="rel-era" ${R.eraLook ? 'checked' : ''} data-change="relChk"> Save your current look as this era's look</label>` : ''}
  ${proj ? `<div class="proj"><h3>First-week projection</h3><div class="projgrid">${D.REGIONS.map(r => { const p = proj.regions[r.id]; return `<div><small>${r.short}</small><b>${fmt(p.streams)}</b><small>streams</small><small>${p.pos ? 'Singles ~#' + p.pos : 'Below the singles chart'}</small>${p.units != null ? `<small>${p.apos ? 'Albums ~#' + p.apos : 'Below the albums chart'}</small>` : ''}</div>`; }).join('')}</div><p class="muted small">Estimates before luck, playlists and Loopr trends.</p></div>` : ''}
  <div class="btns"><button class="btn" data-a="doRelease">Release${cost ? ' · ' + money(cost) : ''}</button></div>`, { noFocus: true });
};
A.relType = d => { const R = UI.rel; R.type = d.t; if (d.t === 'single') R.songs = R.songs.slice(0, 1); R.title = ''; UI.relDraw(); };
A.relTitle = () => { UI.rel.title = $('#rel-title').value; clearTimeout(UI._ct); UI._ct = setTimeout(() => { const im = $('#rel-cover'); if (im) im.src = UI.coverURL(UI.rel.cover, UI.rel.title, UI.S.artist.name, UI.S.look, 300); }, 250); };
A.relSong = d => { const R = UI.rel; const i = R.songs.indexOf(d.id); if (i >= 0) R.songs.splice(i, 1); else { if (R.type === 'single' && R.songs.length >= 3) return UI.toast('A single has at most 3 songs.'); R.songs.push(d.id); } if (R.type === 'single') R.title = ''; R.title = R.title || ''; keepTitle(); UI.relDraw(); };
function keepTitle() { const t = $('#rel-title'); if (t && t.value && UI.rel.type !== 'single') UI.rel.title = t.value; }
A.relLead = d => { UI.rel.lead = d.id; keepTitle(); UI.relDraw(); };
A.relSet = d => { UI.rel.cover[d.k] = d.v; keepTitle(); UI.relDraw(); };
A.relPhoto = () => { UI.rel.cover.photo = $('#rel-photo').checked; keepTitle(); UI.relDraw(); };
A.relDelay = () => { UI.rel.delay = +$('#rel-delay').value; keepTitle(); UI.relDraw(); };
A.relChk = () => { const R = UI.rel; R.teasers = $('#rel-teasers').checked; R.presave = $('#rel-presave').checked; const e = $('#rel-era'); if (e) R.eraLook = e.checked; keepTitle(); UI.relDraw(); };
A.relBase = () => { UI.rel.base = $('#rel-base').value; keepTitle(); };
A.relPartner = () => { UI.rel.partner = $('#rel-partner').value; keepTitle(); UI.relDraw(); };
A.doRelease = () => {
  const R = UI.rel; R.title = $('#rel-title').value;
  const r = LN.createRelease(UI.S, { type: R.type, title: R.title, songs: R.songs, lead: R.lead && R.songs.includes(R.lead) ? R.lead : R.songs[0], delay: R.delay, teasers: R.teasers, presave: R.presave, eraLook: R.eraLook, partner: R.partner || null, base: R.base, cover: Object.assign({}, R.cover) });
  if (r.ok) UI.rel = null; UI.result(r, { keepModal: !r.ok });
};

// release detail
A.relModal = d => {
  const S = UI.S; const r = LN.rel(S, d.id); if (!r) return;
  const songs = r.songs.map(id => LN.song(S, id)).filter(Boolean);
  const pk = (o, t) => { const p = Math.min(...D.REGION_IDS.map(x => ((o.ch || {})[x + t] || {}).peak || 999)); return p < 999 ? '#' + p : '-'; };
  const ownL = !r.masters || r.masters === 'artist';
  UI.modal(`<div class="relhead">${UI.cover(r, 150)}<div><h2>${esc(r.title)}</h2><p class="muted">${LN.relTypeName(r.type)} · ${r.out ? 'released ' + LN.dateLabel(S, r.week) : 'out ' + LN.dateLabel(S, r.week)}${r.partner ? ' · with ' + esc(LN.artistName(S, r.partner)) : ''}</p>
    ${r.type !== 'single' && r.type !== 'remix' ? `<p>Album chart peak <b>${pk(r, 'a')}</b> · ${fmt(r.units)} units worldwide${r.cert ? ` · <span class="cert">${LN.certName(r.cert)}</span>` : ''}</p>` : ''}
    <p>Masters: <b>${ownL ? 'you own them' : esc((D.LABELS.find(l => l.id === r.masters) || {}).name || 'label')}</b> · you have earned ${money((r.revenue || 0) + songs.reduce((a, s) => a + (s.revenue || 0), 0))}</p></div></div>
  ${r.score != null ? `<h3>Reviews · average ${r.score.toFixed(1)}</h3>${r.reviews.map(v => `<p class="review"><b>${v.score.toFixed(1)}</b> <span>${esc(v.outlet)}</span> "${esc(v.quote)}"</p>`).join('')}` : r.out ? '<p class="muted">Critics did not review this one.</p>' : ''}
  <h3>Tracklist</h3><ol class="tracks">${songs.map(s => `<li><div><b>${esc(s.title)}</b>${s.feat ? ` <small>feat. ${esc(LN.artistName(S, s.feat))}</small>` : ''}<small>q${s.q} · peak ${pk(s, 's')} · ${fmt(s.streams)} streams${s.cert ? ' · ' + LN.certName(s.cert) : ''}${s.playlist ? ' · on "' + esc(s.playlist.name) + '"' : ''}</small></div></li>`).join('')}</ol>
  <div class="btns">${!ownL && r.out ? `<button class="btn ghost" data-a="buyMasters" data-id="${r.id}">Buy back masters · ${money(LN.buybackPrice(S, r))}</button>` : ''}${LN.canReRecord(S, r) ? `<button class="btn ghost" data-a="doReRecord" data-id="${r.id}">Re-record it</button>` : ''}</div>`);
};
A.buyMasters = d => UI.result(LN.buyMasters(UI.S, d.id));
A.doReRecord = d => UI.result(LN.reRecord(UI.S, d.id));
A.rerecordModal = () => {
  const S = UI.S; const list = S.releases.filter(r => LN.canReRecord(S, r));
  UI.modal(`<h2>Re-record an album</h2><p>When a label owns your masters and your contract has ended, you can record new versions that you own. Fans tend to switch to the new versions.</p>
  ${list.length ? `<div class="choices">${list.map(r => `<button class="choice" data-a="doReRecord" data-id="${r.id}"><b>${esc(r.title)}</b><small>${r.songs.length} songs · costs ${money(20000 + r.songs.length * 4000)} and 40 energy</small></button>`).join('')}</div>` : empty('Nothing to re-record. This unlocks after a label contract ends for releases they own.')}`);
};
A.remixModal = () => {
  const S = UI.S; const list = S.songs.filter(s => s.rel && !s.remixed && !s.isRemix && !s.live);
  UI.modal(`<h2>Remix a song</h2>${list.length ? `<label class="fld">Song <select id="mx-song">${list.map(s => `<option value="${s.id}">${esc(s.title)}</option>`).join('')}</select></label>
  <label class="fld">Remixer <select id="mx-prod">${D.PRODUCERS.map(p => `<option value="${p.id}">${p.id === 'self' ? 'Do it yourself' : esc(p.name) + ' · ' + money(p.fee)}</option>`).join('')}</select></label><button class="btn" data-a="doRemix">Release remix ${UI.icon('bolt')}15</button>` : empty('Release a song first.')}`);
};
A.doRemix = () => UI.result(LN.createRemix(UI.S, $('#mx-song').value, $('#mx-prod').value));
A.liveModal = () => {
  const S = UI.S; const list = S.tours.map((t, i) => [t, i]).filter(([t]) => !t.live);
  UI.modal(`<h2>Live album</h2>${list.length ? `<div class="choices">${list.map(([t, i]) => `<button class="choice" data-a="doLive" data-i="${i}"><b>${esc(t.name)} (Live)</b><small>${t.setlist.length} songs · show rating ${t.rating}</small></button>`).join('')}</div>` : empty('Finish a tour to release a live album from it.')}`);
};
A.doLive = d => UI.result(LN.createLiveAlbum(UI.S, +d.i));
A.pitchModal = () => {
  const S = UI.S; const list = S.songs.filter(s => s.rel && !s.pitched).sort((a, b) => b.relWeek - a.relWeek);
  UI.modal(`<h2>Pitch to playlists</h2><p>Each song can be pitched once.</p>${list.length ? `<div class="choices">${list.slice(0, 15).map(s => `<button class="choice" data-a="doPitch" data-id="${s.id}"><b>${esc(s.title)}</b><small>Chance about ${Math.round(LN.playlistChance(S, s, true) * 100)}% · ${UI.icon('bolt')}5</small></button>`).join('')}</div>` : empty('No released songs left to pitch.')}`);
};
A.doPitch = d => UI.result(LN.pitchPlaylist(UI.S, d.id));

// videos
A.videoModal = () => {
  const S = UI.S; const list = S.songs.filter(s => s.rel && !S.videos.some(v => v.song === s.id)).sort((a, b) => b.relWeek - a.relWeek);
  if (!list.length) { UI.toast('Release a song first. Each song can have one video.', 'bad'); return; }
  UI.modal(`<h2>Shoot a music video</h2><label class="fld">Song <select id="v-song">${list.map(s => `<option value="${s.id}">${esc(s.title)}</option>`).join('')}</select></label>
  <label class="fld">Director <select id="v-dir" data-change="vidCost">${D.DIRECTORS.map(x => `<option value="${x.id}">${esc(x.name)} · skill ${x.skill} · ${money(x.fee)}</option>`).join('')}</select></label>
  <label class="fld">Concept <select id="v-con">${D.CONCEPTS.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
  <label class="fld">Production budget <select id="v-bud" data-change="vidCost">${[0, 2000, 10000, 50000, 200000, 1000000].map(b => `<option value="${b}">${money(b)}</option>`).join('')}</select></label>
  <p id="v-cost" class="info"></p><p class="muted small">Your current outfit is what you wear in the video. Change it in Career → Life → Wardrobe.</p>
  <button class="btn" data-a="doVideo">Shoot it ${UI.icon('bolt')}30</button>`);
  A.vidCost();
};
A.vidCost = () => { $('#v-cost').innerHTML = `Total: <b>${money(LN.videoCost({ director: $('#v-dir').value, budget: +$('#v-bud').value }))}</b> · you have ${money(UI.S.money)}`; };
A.doVideo = () => { const con = $('#v-con').value; const r = LN.shootVideo(UI.S, $('#v-song').value, { director: $('#v-dir').value, concept: con, budget: +$('#v-bud').value }); UI.result(r, { keepModal: !r.ok }); if (r.ok) UI.showVideo(r.video, r.msg); };
A.watchVideo = d => { const v = UI.S.videos.find(x => x.id === d.id); if (v) UI.showVideo(v); };

// ------------------------------------------------------------------ CHARTS
UI.screens.charts = function (S) {
  const reg = UI.region || S.artist.region; const t = UI.sub.charts;
  let h = `<div class="seg regions">${D.REGIONS.map(r => `<button class="${reg === r.id ? 'on' : ''}" data-a="region" data-r="${r.id}">${r.short}</button>`).join('')}</div>`;
  h += subtabs('charts', [['s', 'Singles'], ['a', 'Albums'], ['st', 'Streaming'], ['ye', 'Year-end'], ['tr', 'Trends']]);
  if (t === 'ye') {
    if (!S.yearEnd.length) return h + card('Year-end charts', empty('The first year-end charts come out at the end of ' + LN.year(S) + '.'));
    return h + S.yearEnd.slice(0, 6).map(Y => card(`${Y.year} year-end`, `<div class="two"><div><h3>Songs</h3><ol class="mini">${Y.s.slice(0, 25).map((x, i) => `<li class="${x.P ? 'mine' : ''}"><span>${i + 1}</span><b>${esc(x.t)}</b><small>${esc(x.ar)}</small></li>`).join('')}</ol></div><div><h3>Albums</h3><ol class="mini">${Y.a.slice(0, 25).map((x, i) => `<li class="${x.P ? 'mine' : ''}"><span>${i + 1}</span><b>${esc(x.t)}</b><small>${esc(x.ar)}</small></li>`).join('')}</ol></div></div>`)).join('');
  }
  if (t === 'tr') {
    const fams = D.FAMILIES.slice().sort((a, b) => S.trends[b] - S.trends[a]);
    return h + card('Genre trends', `<p class="muted">How popular each style is right now compared with normal (100%). Songs in hot genres stream more.</p>${fams.map(f => `<div class="trend"><span>${D.FAMILY_NAME[f]}</span>${UI.bar(S.trends[f], 1.5, S.trends[f] > 1.1 ? 'ok' : S.trends[f] < 0.9 ? 'bad' : '')}<b>${Math.round(S.trends[f] * 100)}%</b></div>`).join('')}`);
  }
  const list = (S.charts && S.charts[reg] && S.charts[reg][t]) || [];
  const name = D.REGIONS.find(r => r.id === reg).name + ' ' + { s: 'Singles', a: 'Albums', st: 'Streaming' }[t];
  const unit = t === 'a' ? 'units' : t === 'st' ? 'streams' : 'points';
  const mine = list.filter(e => e.P);
  h += `<section class="card chart"><h2>${name} <small class="muted">${LN.dateLabel(S, Math.max(0, S.week - 1))}</small></h2>${mine.length ? `<p class="good">You have ${mine.length} entr${mine.length > 1 ? 'ies' : 'y'} this week. Best: #${mine[0].pos}.</p>` : ''}
  <ol class="chartlist">${list.map(e => { const mv = e.isNew ? '<em class="new">NEW</em>' : e.last === 0 ? '<em class="re">RE</em>' : e.last > e.pos ? `<em class="upm">${UI.icon('up')}${e.last - e.pos}</em>` : e.last < e.pos ? `<em class="dn">${UI.icon('down')}${e.pos - e.last}</em>` : '<em class="eq">=</em>';
    return `<li class="${e.P ? 'mine' : ''}"><span class="pos">${e.pos}</span>${mv}<div class="ct"><b>${esc(e.t)}</b><small>${esc(e.ar)}</small></div><div class="cs"><small>pk ${e.peak || e.pos}</small><small>${e.wks || 1} wk</small></div></li>`; }).join('') || '<li>' + empty('No chart yet. End a week to see the first chart.') + '</li>'}</ol>
  <p class="muted small">Ranked by ${unit}. Real artists' songs and chart runs here are made up by the game.</p></section>`;
  return h;
};
A.region = d => { UI.region = d.r; UI.render(); };

// ------------------------------------------------------------------ events
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return;
  const fn = A[t.dataset.a]; if (!fn) return;
  if (t.tagName === 'A') e.preventDefault();
  try { fn(Object.assign({}, t.dataset), t, e); } catch (err) { console.error(err); UI.toast('Something went wrong: ' + err.message, 'bad'); }
});
document.addEventListener('change', e => { const t = e.target.closest('[data-change]'); if (t && A[t.dataset.change]) A[t.dataset.change](Object.assign({}, t.dataset), t); });
document.addEventListener('input', e => { const t = e.target.closest('[data-input]'); if (t && A[t.dataset.input]) A[t.dataset.input](Object.assign({}, t.dataset), t); });
})();
