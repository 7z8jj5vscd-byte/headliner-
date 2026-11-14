/* Final Cut: interface. Renders every screen from the game state and routes taps through data-a actions. */
(function () {
const D = window.FCD, FC = window.FC;
const UI = window.UI = { S: null, tab: 'home', sub: { career: 'projects', world: 'box', life: 'money' }, cr: null, aud: null, neg: null, queue: [], busy: false };
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const M = n => FC.money(n);
const cap = t => t ? t[0].toUpperCase() + t.slice(1) : '';
const S = () => UI.S;

// ------------------------------------------------------------------ icons and logo
const ICONS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  stage: '<path d="M3 4h18"/><path d="M5 4c0 6 1 11 3 16M19 4c0 6-1 11-3 16"/><path d="M9 4c0 3 1.5 5 3 5s3-2 3-5"/>',
  work: '<path d="M4 9h16v11H4z"/><path d="M4 9l2-5 4 1-2 4M10 5l4 1-2 3M14 6l4 1-1 2"/>',
  cast: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M7 6l2-3M13 6l2-3"/>',
  career: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  world: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  life: '<path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"/>',
  next: '<path d="M5 12h14M13 6l6 6-6 6"/>', star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.3 6L12 16.8 6.6 19.4l1.3-6L3.4 9.3l6-.7z"/>',
};
const ic = k => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
UI.LOGO = `<svg class="logo" viewBox="0 0 520 220" role="img" aria-label="Final Cut">
  <defs><clipPath id="lgT"><polygon points="0,0 520,0 520,78 0,134"/></clipPath><clipPath id="lgB"><polygon points="0,134 520,78 520,220 0,220"/></clipPath></defs>
  <g clip-path="url(#lgB)"><text x="260" y="148" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="120" textLength="452" lengthAdjust="spacingAndGlyphs" fill="#ece7dc">FINAL CUT</text></g>
  <g clip-path="url(#lgT)" transform="translate(-7,-6)"><text x="260" y="148" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="120" textLength="452" lengthAdjust="spacingAndGlyphs" fill="#e3b54a">FINAL CUT</text></g>
  <line x1="8" y1="135" x2="512" y2="79" stroke="#ece7dc" stroke-width="2"/>
  <rect x="40" y="176" width="440" height="22" rx="3" fill="#262b38"/>
  <g fill="#0d0f14"><rect x="50" y="182" width="12" height="10" rx="2"/><rect x="76" y="182" width="12" height="10" rx="2"/><rect x="102" y="182" width="12" height="10" rx="2"/><rect x="406" y="182" width="12" height="10" rx="2"/><rect x="432" y="182" width="12" height="10" rx="2"/><rect x="458" y="182" width="12" height="10" rx="2"/></g>
  <text x="260" y="192" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="3" fill="#c9d1e0">A HOLLYWOOD CAREER SIM</text></svg>`;

// ------------------------------------------------------------------ toasts, modal, save
UI.toast = (t, cls = '') => { if (!t) return; const box = $('#toasts'); while (box.children.length >= 3) box.firstChild.remove(); const el = document.createElement('div'); el.className = 'toast ' + cls; el.textContent = t; $('#toasts').appendChild(el); setTimeout(() => el.remove(), cls === 'ach' ? 4200 : 3000); };
UI.modal = (html, opts = {}) => {
  UI.closeModal(true);
  const w = document.createElement('div'); w.className = 'modal-wrap'; w.id = 'modal';
  w.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${opts.noClose ? '' : '<button class="close" data-a="closeModal" aria-label="Close">×</button>'}${html}</div>`;
  document.body.appendChild(w);
  if (!opts.noClose) w.addEventListener('click', e => { if (e.target === w) UI.closeModal(); });
  return w.querySelector('.modal');
};
UI.closeModal = (silent) => { if (window.L3 && L3.active && document.querySelector('#modal .scene3d, #modal .prev3d')) L3.stop(); const m = $('#modal'); if (m) m.remove(); if (!silent && UI.afterModal) { const f = UI.afterModal; UI.afterModal = null; f(); } };
const save = () => { if (S()) FC.save(S()); };
const flushAch = () => { const s = S(); if (s && s.newAch && s.newAch.length) { s.newAch.forEach(a => UI.toast('🏆 ' + a, 'ach')); s.newAch = []; } };
const after = (r) => { if (r && r.t) UI.toast(r.t); flushAch(); save(); UI.render(); };

// ------------------------------------------------------------------ portraits
UI.portrait = (look, size = 224) => {
  const url = window.L3 && L3.available() ? L3.portrait(look, size, '#1d2230') : null;
  if (url) return `<img class="portrait" src="${url}" alt="">`;
  return `<div class="portrait fallback">${esc((S() ? S().me.name : 'A')[0] || 'A')}</div>`;
};

// ------------------------------------------------------------------ boot and title
UI.boot = function () {
  // no zooming: block pinch gestures and double-tap zoom (iOS ignores user-scalable=no)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  let lastTouch = 0; document.addEventListener('touchend', e => { const now = Date.now(); if (now - lastTouch < 300 && !e.target.closest('input, select, textarea')) { e.preventDefault(); if (e.target.closest('[data-a]')) e.target.closest('[data-a]').click(); } lastTouch = now; }, { passive: false });
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);
  UI.title();
  UI.announceUpdate(); UI.checkUpdate();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') UI.checkUpdate(); });
  setInterval(UI.checkUpdate, 10 * 60 * 1000);
};
// ------------------------------------------------------------------ update check
// The page asks for version.json without the cache. If the live build is newer than this copy, show a banner.
UI.checkUpdate = function () {
  if (!window.fetch || location.protocol === 'file:') return;
  fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(v => {
    if (!v || !(v.build > (window.FC_BUILD || 0)) || document.getElementById('update')) return;
    const b = document.createElement('button'); b.id = 'update'; b.dataset.a = 'applyUpdate'; b.dataset.v = v.build;
    b.innerHTML = '<span>A new update is live<small>Tap to load it. Your saves are kept.</small></span><span>Update</span>';
    document.body.appendChild(b);
  }).catch(() => { });
};
UI.announceUpdate = function () {
  let seen = 0; try { seen = +localStorage.getItem('fc-build') || 0; localStorage.setItem('fc-build', window.FC_BUILD || 1); } catch (e) { return; }
  if (seen && seen < (window.FC_BUILD || 1)) UI.whatsNew(seen);
};
UI.whatsNew = (since = 0) => UI.modal(`<div class="eyebrow">Version ${window.FC_BUILD || 1}</div><h2>${since ? 'Updated!' : "What's new"}</h2>${D.CHANGELOG.filter(c => !since || c.build > since).map(c => `<h3>Version ${c.build} · ${esc(c.date)}</h3><ul class="small">${c.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>`).join('')}<button class="btn" data-a="closeModal">Close</button>`);

UI.title = function () {
  UI.S = null; document.body.classList.add('titlemode'); if (window.L3) L3.stop();
  const slots = FC.slots();
  $('#main').innerHTML = `<div class="title">
    ${UI.LOGO}
    <p class="muted">Start as an unknown. Audition, sign franchise deals, make movies, win the Oscar.</p>
    <div class="card">${slots.map(s => s.empty ? `<div class="row slot"><div class="ph"></div><div class="grow"><b>Empty slot ${s.slot}</b><small>Start a new career</small></div><button class="btn sm" data-a="newGame" data-slot="${s.slot}">New career</button></div>`
      : `<div class="row slot">${slotImg(s.look)}<div class="grow"><b>${esc(s.name)}</b><small>${esc(s.date)} · Fame ${s.fame}${s.ended ? ' · Retired' : ''}</small></div><div class="btns"><button class="btn sm" data-a="continue" data-slot="${s.slot}">${s.ended ? 'View' : 'Continue'}</button><button class="btn sm ghost" data-a="delSlot" data-slot="${s.slot}" aria-label="Delete">✕</button></div></div>`).join('')}</div>
    <div class="btns" style="justify-content:center"><button class="btn dark" data-a="hof">Hall of Fame</button><button class="btn dark" data-a="help">How to play</button></div>
    <button class="version" data-a="whatsNew">Version ${window.FC_BUILD || 1} · ${esc((D.CHANGELOG[0] || {}).date || '')} · What's new</button>
    <p class="tiny muted">Real actors, directors and franchises appear by name. Every casting decision, feud, box office number and storyline in the game is made up.</p>
  </div>`;
};
function slotImg(look) { const u = window.L3 && L3.available() ? L3.portrait(look, 104, '#1d2230') : null; return u ? `<img src="${u}" alt="">` : '<div class="ph"></div>'; }

// ------------------------------------------------------------------ character creator
const POINTS = 16;
UI.newGame = function (slot) {
  UI.cr = { step: 0, slot, name: '', pronoun: 'she', cat: 's', age: 22, city: 'Los Angeles', diff: 'normal', story: 'hopeful', look: FC.defaultLook(), alloc: {}, traits: [], goal: 'oscar', ltab: 'face' };
  UI.cr.look.hair = 'long'; UI.cr.look.top = 'jacket'; UI.cr.look.topColor = D.CLOTH_COLORS[1];
  UI.renderCreator();
};
UI.renderCreator = function () {
  const c = UI.cr; const steps = ['You', 'Your story', 'Your look', 'Skills and goals'];
  let body = '';
  if (c.step === 0) body = `
    <div class="field"><label for="cr-name">Name</label><input id="cr-name" maxlength="30" value="${esc(c.name)}" placeholder="Your name" autocomplete="off"></div>
    <div class="grid2"><div class="field"><label for="cr-pro">Pronouns</label><select id="cr-pro">${[['she', 'she/her'], ['he', 'he/him'], ['they', 'they/them']].map(p => `<option value="${p[0]}" ${c.pronoun === p[0] ? 'selected' : ''}>${p[1]}</option>`).join('')}</select></div>
    <div class="field"><label for="cr-cat">Award categories</label><select id="cr-cat"><option value="s" ${c.cat === 's' ? 'selected' : ''}>Actress</option><option value="a" ${c.cat === 'a' ? 'selected' : ''}>Actor</option></select></div></div>
    <div class="grid2"><div class="field"><label for="cr-age">Age <b>${c.age}</b></label><input id="cr-age" type="range" min="18" max="35" value="${c.age}"></div>
    <div class="field"><label for="cr-city">Hometown</label><select id="cr-city">${D.CITIES.map(x => `<option ${c.city === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div></div>
    <div class="field"><label for="cr-diff">Difficulty</label><select id="cr-diff"><option value="easy" ${c.diff === 'easy' ? 'selected' : ''}>Easy: more money, easier auditions</option><option value="normal" ${c.diff === 'normal' ? 'selected' : ''}>Normal</option><option value="hard" ${c.diff === 'hard' ? 'selected' : ''}>Hard: tougher rooms, higher costs</option></select></div>`;
  if (c.step === 1) { const card = s => `<button class="choice ${c.story === s.id ? 'on' : ''}" data-a="crStory" data-id="${s.id}"><b>${s.name}</b><small>${s.d}</small><br><small class="mono">${M(s.money)} · ${Object.entries(s.skills).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => D.SKILLS.find(x => x[0] === k)[1] + ' ' + v).join(' · ')}</small></button>`;
    body = `<div class="lbl">Down to earth</div><p class="small muted" style="margin-top:2px">Ordinary beginnings. Start from scratch.</p><div class="choices">${D.STORIES.filter(s => s.grounded).map(card).join('')}</div>
      <div class="lbl" style="margin-top:16px">A head start</div><p class="small muted" style="margin-top:2px">Unusual backstories with more money, fame or baggage.</p><div class="choices">${D.STORIES.filter(s => !s.grounded).map(card).join('')}</div>`; }
  if (c.step === 2) body = UI.lookEditor(c.look, c.ltab, 'cr');
  if (c.step === 3) {
    const st = D.STORIES.find(x => x.id === c.story); const used = Object.values(c.alloc).reduce((a, v) => a + v, 0);
    body = `<p class="small muted">Spend ${POINTS} points. <b class="gold">${POINTS - used} left</b>.</p>
      ${D.SKILLS.map(([k, n]) => `<div class="skill"><span>${n}</span><div class="bar"><i><span style="width:${st.skills[k] + (c.alloc[k] || 0)}%"></span></i></div><b class="mono">${st.skills[k] + (c.alloc[k] || 0)}</b><div class="btns"><button class="btn dark" data-a="crSkill" data-k="${k}" data-v="-1" ${!c.alloc[k] ? 'disabled' : ''} aria-label="Less ${n}">−</button><button class="btn dark" data-a="crSkill" data-k="${k}" data-v="1" ${used >= POINTS ? 'disabled' : ''} aria-label="More ${n}">+</button></div></div>`).join('')}
      <h3>Personality (pick 2)</h3><div class="opts">${D.TRAITS.map(t => `<button class="${c.traits.includes(t.id) ? 'on' : ''}" data-a="crTrait" data-id="${t.id}" title="${esc(t.d)}">${t.name}</button>`).join('')}</div>
      <p class="small muted">${c.traits.map(id => D.TRAITS.find(t => t.id === id)).map(t => `<b>${t.name}:</b> ${t.d}`).join('<br>') || 'Traits change how events play out.'}</p>
      <h3>Dream goal</h3><div class="choices">${D.GOALS.map(g => `<button class="choice ${c.goal === g.id ? 'on' : ''}" data-a="crGoal" data-id="${g.id}"><b>${g.name}</b><small>${g.d}</small></button>`).join('')}</div>`;
  }
  $('#main').innerHTML = `<div class="card"><div class="eyebrow">Step ${c.step + 1} of 4</div><h1>${steps[c.step]}</h1>${body}
    <div class="btns" style="margin-top:14px;justify-content:space-between"><button class="btn ghost" data-a="crBack">${c.step ? 'Back' : 'Cancel'}</button><button class="btn" data-a="crNext">${c.step === 3 ? 'Start my career' : 'Next'} ${ic('next')}</button></div></div>`;
  if (c.step === 2) UI.mountPreview(c.look);
};
UI.lookEditor = function (look, tab, ns) {
  const sw = (k, arr) => `<div class="opts">${arr.map(col => `<button class="sw ${look[k] === col ? 'on' : ''}" style="background:${col}" data-a="${ns}Look" data-k="${k}" data-v="${col}" aria-label="${k} ${col}"></button>`).join('')}</div>`;
  const ch = (k, arr) => `<div class="opts">${arr.map(o => { const id = Array.isArray(o) ? o[0] : o.id, n = Array.isArray(o) ? o[1] : o.name; return `<button class="${look[k] === id ? 'on' : ''}" data-a="${ns}Look" data-k="${k}" data-v="${id}">${n}</button>`; }).join('')}</div>`;
  const tabs = [['face', 'Face'], ['hair', 'Hair'], ['body', 'Body'], ['outfit', 'Outfit']];
  let g = '';
  if (tab === 'face') g = `<div class="lbl">Skin</div>${sw('skin', D.SKINS)}<div class="lbl">Face shape</div>${ch('face', D.FACES)}<div class="lbl">Eyes</div>${sw('eyes', D.EYE_COLORS)}<div class="lbl">Brows</div>${ch('brows', D.BROWS)}<div class="lbl">Nose</div>${ch('nose', D.NOSES)}<div class="lbl">Lips</div>${ch('lips', D.LIPS)}<div class="lbl">Facial hair</div>${ch('facial', D.FACIAL)}`;
  if (tab === 'hair') g = `<div class="lbl">Style</div>${ch('hair', D.HAIRS)}<div class="lbl">Color</div>${sw('hairColor', D.HAIR_COLORS)}`;
  if (tab === 'body') g = `<div class="lbl">Build</div>${ch('body', D.BODIES)}<div class="lbl">Height</div>${ch('height', D.HEIGHTS)}`;
  if (tab === 'outfit') g = `<div class="lbl">Top</div>${ch('top', D.TOPS)}${sw('topColor', D.CLOTH_COLORS)}<div class="lbl">Bottom</div>${ch('bottom', D.BOTTOMS)}${sw('bottomColor', D.CLOTH_COLORS)}<div class="lbl">Shoes</div>${ch('shoes', D.SHOES)}${sw('shoesColor', D.CLOTH_COLORS)}<div class="lbl">Accessory</div>${ch('acc', D.ACCS)}${sw('accColor', D.CLOTH_COLORS)}`;
  return `<div class="look-wrap"><div class="prev3d" id="prev3d"><div class="hint">${window.L3 && L3.available() ? 'Drag to spin' : '3D preview unavailable'}</div></div><div>
    <div class="tabs">${tabs.map(t => `<button class="${tab === t[0] ? 'on' : ''}" data-a="${ns}LookTab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div style="margin-top:10px">${g}</div></div></div>`;
};
UI.mountPreview = function (look) {
  const el = $('#prev3d'); if (!el || !window.L3 || !L3.available()) return;
  if (UI.prevCtl && UI.prevCtl.r && el.contains(UI.prevCtl.r.domElement)) { UI.prevCtl.update(look); return; }
  UI.prevCtl = L3.preview(el, look, { close: ['face', 'hair'].includes(UI.cr ? UI.cr.ltab : UI.ltab) });
};
function updateLookUI(look, ns) {
  // re-render only the option panel so the 3D preview keeps spinning
  const panel = document.querySelector('.look-wrap > div:last-child'); const tab = ns === 'cr' ? UI.cr.ltab : UI.ltab;
  const tmp = document.createElement('div'); tmp.innerHTML = UI.lookEditor(look, tab, ns);
  if (panel) panel.replaceWith(tmp.querySelector('.look-wrap > div:last-child'));
  if (UI.prevCtl) { UI.prevCtl.update(look); if (UI.prevCtl.zoom) UI.prevCtl.zoom(['face', 'hair'].includes(tab)); }
}

// ------------------------------------------------------------------ main render
UI.render = function () {
  const s = S(); if (!s) return;
  document.body.classList.remove('titlemode');
  if (s.ended) return UI.renderEnding();
  hud(); nav();
  const tab = UI.tab;
  const main = $('#main');
  if (window.L3) L3.stop(); UI.prevCtl = null;
  main.innerHTML = tab === 'home' ? homeView() : tab === 'cast' ? castView() : tab === 'stage' ? stageView() : tab === 'work' ? workView() : tab === 'career' ? careerView() : tab === 'world' ? worldView() : lifeView();
  $('#endbar').innerHTML = `<button class="btn" data-a="endWeek">End week ${ic('next')}</button>`;
  if (tab === 'life' && UI.sub.life === 'look') UI.mountPreview(s.look);
  flushAch();
};
function hud() {
  const s = S();
  $('#hud').innerHTML = `<button class="hud-who" data-a="go" data-tab="home"><span class="hud-name">${esc(s.me.name)}</span><span class="hud-date">${FC.dateLabel(s)}</span></button>
    <div class="hud-stats"><span class="en">⚡<b>${Math.round(s.energy)}</b></span><span>💵<b class="${s.money < 0 ? 'bad' : ''}">${M(s.money)}</b></span><span>★<b>${Math.round(s.fame)}</b></span><span title="Star Power">SP<b>${FC.starPower(s)}</b></span></div>`;
}
function nav() {
  const s = S(); const offers = (s.offers || []).filter(o => !o.theater).length; const stageOffers = (s.offers || []).filter(o => o.theater).length; const inbox = s.inbox.filter(m => m.kind !== 'note' || !m.read).length;
  const work = FC.needsEffort(s).length + FC.pressOpen(s).length + s.jobs.filter(j => j.stage === 'prep' && FC.busyRole(j) && (j.prepScore || 0) < 30).length;
  const tabs = [['home', 'Home', 'home', inbox], ['cast', 'Casting', 'cast', offers], ['stage', 'Theatre', 'stage', stageOffers], ['work', 'Work', 'work', work], ['career', 'Career', 'career', 0], ['world', 'Hollywood', 'world', 0], ['life', 'Life', 'life', 0]];
  $('#nav').innerHTML = tabs.map(t => `<button class="${UI.tab === t[0] ? 'on' : ''}" data-a="go" data-tab="${t[0]}"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[t[2]]}</svg>${t[1]}${t[3] ? `<em class="badge">${t[3]}</em>` : ''}</button>`).join('');
}
const bar = (label, v, cls = '') => `<div class="bar ${cls} ${v < 25 ? 'low' : ''}"><span>${label}</span><i><span style="width:${Math.max(0, Math.min(100, v))}%"></span></i><em>${Math.round(v)}</em></div>`;
const stageName = j => j.stage === 'prep' ? 'Prep' : j.stage === 'shoot' ? (j.theater ? 'On stage' : 'Shooting') : j.stage === 'post' ? (j.tv ? 'Editing' : 'Post-production') : j.stage;
const roleLabel = p => p.stageRole ? p.stageRole : p.char ? p.char.name : p.kind === 'commercial' ? 'Commercial' : FC.SIZES[p.size].n;

// ------------------------------------------------------------------ home
function homeView() {
  const s = S(); const st = D.STORIES.find(x => x.id === s.me.story); const ag = FC.agency(s);
  const acts = FC.activities(s);
  const offers = (s.offers || []).length;
  let tut = '';
  if (s.tut < 3) { const T = [
    ['Welcome to Hollywood', 'Each turn is one week. Spend energy on classes and auditions, then press End week. Start with small parts, commercials and guest spots to build your name.'],
    ['Auditions', 'Open the Casting tab. Each role says what the director wants. Your skills decide most of the score, but how you play each beat matters too. Prepare first if you have energy to spare.'],
    ['Climbing the ladder', 'Fame and box office raise your Star Power, which decides your pay, the roles you get seen for, and which agencies will sign you. Franchise roles open up as you grow.']][s.tut];
    tut = `<div class="card hl"><div class="eyebrow">Tip ${s.tut + 1} of 3</div><h3 style="margin-top:2px">${T[0]}</h3><p class="small">${T[1]}</p><button class="btn sm" data-a="tut">Got it</button></div>`; }
  return `${tut}
  <div class="card"><div class="me">${UI.portrait(s.look)}<div style="min-width:0"><h2 style="margin:0">${esc(s.me.name)}</h2><div class="small muted">Age ${FC.age(s)} · ${st.name} · ${ag.name}</div>
    ${s.myChars.filter(m => m.status === 'active').length ? `<div class="small gold">${s.myChars.filter(m => m.status === 'active').map(m => esc(m.name)).join(', ')}</div>` : ''}
    ${s.hiatus > 0 ? '<div class="small bad">Recovering from burnout. Rest this week.</div>' : ''}</div></div>
    <div class="stats4"><div class="stat"><b>${Math.round(s.fame)}</b><span>Fame</span></div><div class="stat"><b>${FC.starPower(s)}</b><span>Star Power</span></div><div class="stat"><b>${Math.round(s.rep)}</b><span>Reputation</span></div><div class="stat"><b>${FC.num(s.followers)}</b><span>Followers</span></div></div>
    <div class="bars">${bar('Energy', s.energy)}${bar('Health', s.health, 'hp')}${bar('Happiness', s.happy, 'hap')}</div></div>
  ${offers ? `<button class="card hl" data-a="go" data-tab="cast" style="text-align:left;width:100%"><b>You have ${offers} offer${offers > 1 ? 's' : ''} waiting.</b><div class="small muted">Negotiate your deal in Casting.</div></button>` : ''}
  <div class="card"><h2>This week</h2><p class="small muted">${s.weekActs}/${FC.ACT_LIMIT} activities used. Auditions are in the Casting tab.</p>
    <div class="acts">${acts.map(a => `<button class="act" data-a="act" data-id="${a.id}" ${(a.cost > 0 && (s.energy < a.cost || s.weekActs >= FC.ACT_LIMIT)) || s.money < a.price ? 'disabled' : ''} title="${esc(a.d)}"><b>${a.name}</b><small>${a.cost > 0 ? '−' + a.cost + '⚡' : '+' + -a.cost + '⚡'}${a.price ? ' · ' + M(a.price) : ''}</small></button>`).join('')}</div></div>
  ${jobsCard()}
  ${inboxCard()}`;
}
function jobsCard() {
  const s = S(); if (!s.jobs.length) return `<div class="card"><h2>Projects</h2><p class="empty">Nothing in production. Book something in Casting.</p></div>`;
  return `<div class="card"><h2>Projects</h2>${s.jobs.map(j => {
    const idx = ['prep', 'shoot', 'post'].indexOf(j.stage);
    return `<div class="row"><div class="grow"><b>${esc(j.title)}</b><small>${esc(roleLabel(j))} · ${esc(j.studio)}${j.directedByMe ? ' · You direct' : ''}</small>
      <div class="stage-steps">${['Prep', 'Shoot', 'Post'].map((n, i) => `<span class="${i < idx ? 'done' : i === idx ? 'on' : ''}" title="${n}"></span>`).join('')}</div></div>
      <span class="pill ${j.stage === 'shoot' ? 'gold' : ''}">${stageName(j)} · ${j.left} wk</span></div>`; }).join('')}<button class="btn sm" data-a="go" data-tab="work" style="margin-top:6px">Open the Work tab</button></div>`;
}
function inboxCard() {
  const s = S(); if (!s.inbox.length) return '';
  return `<div class="card"><h2>Inbox</h2>${s.inbox.map(m => {
    let act = '';
    if (m.kind === 'note') act = `<button class="btn sm dark" data-a="inbox" data-id="${m.id}" data-c="ok">Dismiss</button>`;
    else if (m.kind === 'talk') act = `<div class="btns" style="margin-top:6px"><button class="btn sm" data-a="live" data-id="${m.id}" ${s.energy < (m.show === 'snl' ? 35 : 15) ? 'disabled' : ''}>${m.show === 'snl' ? 'Host the show · 35⚡' : 'Go on the show · 15⚡'}</button><button class="btn sm ghost" data-a="inbox" data-id="${m.id}" data-c="no">Pass</button></div>`;
    else if (m.kind === 'brand') act = `<div class="btns" style="margin-top:6px"><button class="btn sm" data-a="inbox" data-id="${m.id}" data-c="yes">Sign · ${M(m.pay)}/yr × ${m.years}</button><button class="btn sm ghost" data-a="inbox" data-id="${m.id}" data-c="no">Pass</button></div>`;
    else act = `<div class="btns" style="margin-top:6px"><button class="btn sm" data-a="inbox" data-id="${m.id}" data-c="yes">${m.kind === 'cover' ? 'Do the shoot' : 'Go'}</button><button class="btn sm ghost" data-a="inbox" data-id="${m.id}" data-c="no">Skip</button></div>`;
    return `<div class="row" style="display:block"><div class="eyebrow">${esc(m.from)}</div><b>${esc(m.t)}</b><small class="muted">${esc(m.d)}</small>${m.kind === 'note' ? `<div style="margin-top:6px">${act}</div>` : act}</div>`; }).join('')}</div>`;
}

// ------------------------------------------------------------------ casting
const oddsOf = (s, p) => { const est = FC.skillFit(s, p) * 0.72 + 9 + Math.min(14, FC.starPower(s) * 0.2) + (s.prepped[p.id] || 0) * 3 - p.need; return est > 10 ? ['Strong', 'good'] : est > 2 ? ['Good chance', 'good'] : est > -6 ? ['Even odds', 'gold'] : ['Long shot', 'bad']; };
const kindBadge = { original: ['New character', 'gold'], deep: ['From the comics', 'blue'], recast: ['Recast', 'bad'], variant: ['Variant', 'blue'], young: ['Younger version', 'blue'], legacy: ['Legacy mantle', 'gold'] };
function charBlock(p) {
  if (!p.char) return '';
  const c = p.char; const F = D.FRANCHISES.find(f => f.id === p.fid); const b = kindBadge[c.kind] || ['Character', ''];
  return `<div class="char"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(c.name)}</b><span class="pill ${b[1]}">${b[0]}</span></div>
    <div class="small muted">${c.type ? esc(c.type[0].toUpperCase() + c.type.slice(1)) + '. ' : ''}${c.power ? 'Power: ' + esc(c.power) + '. ' : ''}${c.skill ? esc(cap(c.skill)) + '. ' : ''}${esc(cap(c.origin || ''))}${c.prev ? ` Previously played by ${esc(c.prev)}.` : ''}</div>
    <div class="tiny muted" style="margin-top:3px">${esc(F.name)}${p.pictures > 1 ? ` · ${p.pictures}-picture deal` : ''}</div></div>`;
}
function roleCard(p, offer) {
  const s = S(); const F = p.fid ? D.FRANCHISES.find(f => f.id === p.fid) : null; const o = oddsOf(s, p); const g = D.GENRES.find(x => x.id === p.genre);
  const can = FC.canSign(s, p);
  const kindName = { commercial: 'Commercial', extra: 'Background', guest: 'TV guest spot', tv: 'TV series', theater: 'Stage', voice: 'Animation', indie: 'Indie film', film: 'Studio film', franchise: F ? F.short : 'Franchise', own: 'Your production' }[p.kind] || 'Film';
  return `<div class="card role">${F ? `<span class="stripe" style="background:${F.color}"></span>` : ''}
    <div class="role-head"><div style="min-width:0"><div class="eyebrow">${kindName} · ${esc(p.studio)}</div><div class="role-title">${esc(p.title)}</div></div>
      ${offer ? `<span class="pill gold">${p.contracted ? 'Contracted' : p.direct ? 'Direct offer' : 'Offer'}</span>` : `<span class="pill ${o[1]} odds">${o[0]}</span>`}</div>
    <div class="role-meta"><span class="pill">${FC.SIZES[p.size] ? FC.SIZES[p.size].n : p.size}</span><span class="pill">${g ? g.name : p.genre}</span>${p.tv ? `<span class="pill blue">${p.season > 1 ? 'Season ' + p.season : 'Series'}</span>` : ''}${p.prestige ? '<span class="pill gold">Prestige</span>' : ''}${p.teamup ? '<span class="pill gold">Team-up</span>' : ''}<span class="pill">${M(p.pay)}${p.weekly ? '/wk' : ''}</span></div>
    ${charBlock(p)}
    <div class="small muted">${p.director ? 'Dir. ' + esc(p.director.name) + ' · ' : ''}${p.costars && p.costars.length ? 'With ' + esc(p.costars.join(', ')) + ' · ' : ''}${p.weeks.shoot} wk shoot${p.budget ? ' · ' + M(p.budget) + ' budget' : ''}</div>
    ${offer ? '' : `<div class="tiny muted" style="margin-top:3px">Also up for it: ${esc(p.rival)} · Closes ${FC.dateLabel(s, p.expires).split(' · ')[0]}</div>`}
    ${!can.ok ? `<p class="small bad">${esc(can.t)}</p>` : can.t ? `<p class="small muted">${esc(can.t)}</p>` : ''}
    <div class="btns" style="margin-top:10px">${offer ? `<button class="btn" data-a="negotiate" data-id="${p.id}" ${!can.ok ? 'disabled' : ''}>Negotiate deal</button><button class="btn ghost" data-a="decline" data-id="${p.id}">Decline</button>`
      : `<button class="btn" data-a="audition" data-id="${p.id}" ${s.energy < 10 || !can.ok ? 'disabled' : ''}>Audition</button><button class="btn dark" data-a="prep" data-id="${p.id}" ${s.energy < 20 || (s.prepped[p.id] || 0) >= 2 ? 'disabled' : ''}>Prepare${s.prepped[p.id] ? ' (' + s.prepped[p.id] + '/2)' : ''} · 20⚡</button>`}</div></div>`;
}
function castView() {
  const s = S(); const offers = (s.offers || []).filter(o => !o.theater);
  const filt = UI.castFilter || 'all';
  const board = s.board.filter(p => filt === 'all' || (filt === 'film' && ['film', 'indie', 'extra', 'voice'].includes(p.kind)) || (filt === 'tv' && p.tv) || (filt === 'fr' && p.fid) || (filt === 'small' && ['commercial', 'guest', 'extra'].includes(p.kind)));
  return `${offers.length ? `<h2>Offers</h2>${offers.map(p => roleCard(p, true)).join('')}` : ''}
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><h2 style="margin:0">Casting board</h2><span class="small muted">${FC.agency(s).name}</span></div>
    <div class="tabs">${[['all', 'All'], ['fr', 'Franchises'], ['film', 'Film'], ['tv', 'TV'], ['small', 'Day jobs']].map(t => `<button class="${filt === t[0] ? 'on' : ''}" data-a="castFilter" data-f="${t[0]}">${t[1]}</button>`).join('')}</div>
    ${board.length ? board.map(p => roleCard(p, false)).join('') : '<p class="empty">No roles here this week. Network, sign with a bigger agency, or check back next week.</p>'}`;
}

// audition flow
UI.startAudition = function (pid) {
  const s = S(); const p = s.board.find(x => x.id === pid); if (!p) return;
  UI.aud = { pid, setup: FC.auditionSetup(s, pid), step: 0, tones: [], chem: null, screen: null };
  UI.renderAudition();
};
UI.renderAudition = function () {
  const s = S(), a = UI.aud, p = s.board.find(x => x.id === a.pid); if (!p) return UI.closeModal();
  const beats = a.setup.beats; let html = '';
  if (a.step === 0) html = `<div class="eyebrow">Audition</div><h2>${esc(p.title)}</h2>${charBlock(p)}<p class="small">${esc(roleLabel(p))} in a ${(D.GENRES.find(g => g.id === p.genre) || {}).name || p.genre} ${p.tv ? 'series' : 'project'} for ${esc(p.director ? p.director.name : p.studio)}.</p>
    <div class="scene-card">${esc(a.setup.note)}</div><p class="small muted">Three beats. Pick how to play each one.${a.setup.chem ? ' Then a chemistry read with ' + esc(a.setup.chem) + '.' : ''}${a.setup.screen ? ' Then a screen test in costume.' : ''}</p>
    <button class="btn" data-a="audNext">Walk into the room ${ic('next')}</button>`;
  else if (a.step <= beats.length) { const b = beats[a.step - 1]; html = `<div class="eyebrow">Beat ${a.step} of ${beats.length}</div><h2>${esc(b.text[0].toUpperCase() + b.text.slice(1))}</h2>
    <div class="scene-card">INT. ${esc(p.title.toUpperCase())} – ${pick(['NIGHT', 'DAY', 'CONTINUOUS'])}<br>${esc(sceneLine(p, a.step))}</div>
    <div class="tone">${D.TONES.map(t => `<button data-a="audTone" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`; }
  else if (a.setup.chem && a.chem == null) html = `<div class="eyebrow">Callback</div><h2>Chemistry read with ${esc(a.setup.chem)}</h2><p class="small muted">The director wants to see you two together.</p>
    <div class="choices">${FC.CHEM.map(c => `<button class="choice" data-a="audChem" data-c="${c[0]}"><b>${c[1]}</b></button>`).join('')}</div>`;
  else if (a.setup.screen && a.screen == null) html = `<div class="eyebrow">Screen test</div><h2>In costume, on camera</h2><div class="scene3d" id="aud3d"></div><p class="small muted">The suit fits. Now sell it.</p>
    <div class="choices">${FC.SCREEN.map(c => `<button class="choice" data-a="audScreen" data-c="${c[0]}"><b>${c[1]}</b></button>`).join('')}</div>`;
  else { const r = FC.audition(s, a.pid, { setup: a.setup, tones: a.tones, chem: a.chem, screen: a.screen }); UI.aud = null;
    if (!r.ok) { UI.closeModal(); return UI.toast(r.t); }
    const w = Math.min(100, r.score / Math.max(r.need, 1) * 70);
    html = `<div class="eyebrow">Casting decision</div><h2 class="${r.cast ? 'gold' : ''}">${r.cast ? 'You got the part!' : r.verdict === 'shortlist' ? 'So close.' : 'Not this time.'}</h2>
      <div class="meter"><span style="width:${w}%"></span><i style="left:70%"></i></div><p class="tiny muted mono">Your audition ${r.score} · What they needed ${r.need}</p>
      <p>${r.cast ? `${esc(p.director ? p.director.name : p.studio)} wants you. Head to Casting to negotiate your deal.` : r.verdict === 'shortlist' ? `You made the shortlist, but the part went to ${esc(r.rival)}.` : `The part went to ${esc(r.rival)}. ${tipFor(s, p)}`}</p>
      <div class="btns">${r.cast ? `<button class="btn" data-a="negotiate" data-id="${p.id}">Negotiate now</button>` : ''}<button class="btn ${r.cast ? 'ghost' : ''}" data-a="closeModal">Close</button></div>`;
    if (r.cast) UI.toast('Booked: ' + p.title); save(); UI.render(); }
  UI.modal(html);
  if (a.setup && a.setup.screen && a.screen == null && a.step > beats.length && (!a.setup.chem || a.chem != null)) { const el = $('#aud3d'); if (el && window.L3) L3.scene(el, Object.assign({}, s.look, { top: 'hero', topColor: (D.FRANCHISES.find(f => f.id === p.fid) || {}).color || '#8f1d2c' }), { mode: 'set' }); }
};
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function sceneLine(p, i) {
  const n = p.char ? (p.char.code || p.char.name.split(' / ').pop()).toUpperCase() : 'YOU';
  return `${n}: ${pick(['I never wanted any of this.', 'You knew. You knew the whole time.', 'Stay behind me.', 'If we do this, there is no going back.', 'Tell me I am wrong.', 'Everyone leaves. Not you. Not today.', 'Is that the best you have got?', 'I am not who you think I am.'])}`;
}
function tipFor(s, p) { const g = D.GENRES.find(x => x.id === p.genre); const top = Object.entries(g.skills).sort((a, b) => b[1] - a[1])[0][0]; return `Tip: this kind of role leans on ${D.SKILLS.find(x => x[0] === top)[1].toLowerCase()}.`; }

// negotiation
UI.startNegotiation = function (pid) {
  const s = S(); const p = (s.offers || []).find(x => x.id === pid); if (!p) return UI.closeModal();
  if (!p.deal) p.deal = FC.dealFor(s, p);
  UI.neg = { pid, ask: JSON.parse(JSON.stringify(p.deal.base)), msg: '', counter: null };
  UI.renderNegotiation();
};
UI.renderNegotiation = function () {
  const s = S(), n = UI.neg, p = (s.offers || []).find(x => x.id === n.pid); if (!p) return UI.closeModal();
  const d = p.deal, a = n.ask; const smax = Math.round(d.max.salary * 1.4);
  const fr = p.fid && !p.tv;
  const html = `<div class="eyebrow">Negotiation · Round ${d.round + 1}</div><h2>${esc(p.title)}</h2>
    <p class="small muted">${esc(roleLabel(p))}. ${esc(p.studio)} opened at ${M(d.base.salary)}${p.weekly ? ' a week' : ''}${fr ? ` for ${d.studioPics} film${d.studioPics > 1 ? 's' : ''}` : ''}.${p.contracted ? ' You are under contract for this one, so walking away has a cost.' : ''}</p>
    ${n.counter ? `<div class="info"><b>Counteroffer:</b> ${M(n.counter.salary)}${n.counter.points ? ', ' + n.counter.points + ' points' : ''}${fr ? ', ' + n.counter.pictures + ' films' : ''}, ${FC.BILLING.find(b => b[0] === n.counter.billing)[1]}${n.counter.perks.length ? ', ' + n.counter.perks.map(k => FC.PERKS.find(x => x[0] === k)[1]).join(', ') : ''}.<div class="btns" style="margin-top:8px"><button class="btn sm" data-a="negAcceptCounter">Accept counter</button></div></div>` : ''}
    <div class="field"><label for="ng-sal">Upfront pay <b>${M(a.salary)}${p.weekly ? '/wk' : ''}</b></label><input id="ng-sal" type="range" min="${d.base.salary}" max="${smax}" step="${Math.max(100, Math.round(d.base.salary / 50 / 100) * 100)}" value="${a.salary}"></div>
    ${d.max.points || a.points ? `<div class="field"><label for="ng-pts">Backend points (share of gross) <b>${a.points}</b></label><input id="ng-pts" type="range" min="0" max="12" value="${a.points}"></div>` : '<p class="tiny muted">No backend on this project.</p>'}
    ${fr ? `<div class="field"><label for="ng-pics">Films in the contract <b>${a.pictures}</b></label><input id="ng-pics" type="range" min="${d.max.minPics}" max="${d.max.maxPics}" value="${a.pictures}"><span class="tiny muted">Fewer films = more freedom. More films = guaranteed work and sequel raises.</span></div>` : ''}
    <div class="field"><label for="ng-bill">Billing</label><select id="ng-bill">${FC.BILLING.map(b => `<option value="${b[0]}" ${a.billing === b[0] ? 'selected' : ''}>${b[1]}</option>`).join('')}</select></div>
    <div class="lbl" style="margin-top:6px">Perks and clauses</div>${FC.PERKS.map(k => `<label class="check"><input type="checkbox" data-perk="${k[0]}" ${a.perks.includes(k[0]) ? 'checked' : ''}> ${k[1]}</label>`).join('')}
    <div class="info" style="margin-top:10px"><span class="eyebrow">${esc(s.agency === 'none' ? 'Your gut' : FC.agency(s).name + ' says')}</span><div id="ng-read">${esc(FC.agentRead(s, d, a))}</div></div>
    ${n.msg ? `<p class="small ${n.msgCls || ''}">${esc(n.msg)}</p>` : ''}
    <div class="btns" style="margin-top:12px"><button class="btn" data-a="negSend">Send to ${esc(p.studio)}</button><button class="btn dark" data-a="negTake">Take their offer</button><button class="btn ghost" data-a="decline" data-id="${p.id}">Walk away</button></div>`;
  UI.modal(html);
};
function negRead() { const s = S(), n = UI.neg; const p = (s.offers || []).find(x => x.id === n.pid); const el = $('#ng-read'); if (el && p) el.textContent = FC.agentRead(s, p.deal, n.ask); }

// ------------------------------------------------------------------ live theatre
const PROD = { long: 'Long-running hit', revival: 'Star revival', classic: 'Limited run', new: 'New production' };
const stageOdds = (s, p) => { const est = FC.stageFit(s, p) * 0.72 + 12 + Math.min(10, FC.starPower(s) * 0.15) + (s.prepped[p.id] || 0) * 3 - p.need; return est > 10 ? ['Strong', 'good'] : est > 2 ? ['Good chance', 'good'] : est > -6 ? ['Even odds', 'gold'] : ['Long shot', 'bad']; };
function stageCard(p, offer) {
  const s = S(); const o = stageOdds(s, p); const can = FC.canSign(s, p);
  return `<div class="card role"><span class="stripe" style="background:${p.region === 'broadway' ? '#e3b54a' : '#7a1020'}"></span>
    <div class="role-head"><div style="min-width:0"><div class="eyebrow">${p.region === 'broadway' ? 'Broadway' : 'West End'} · ${esc(p.studio.split(',')[0])}</div><div class="role-title">${esc(p.title)}</div><div class="small">as <b>${esc(p.stageRole)}</b></div></div>
      ${offer ? '<span class="pill gold">Offer</span>' : `<span class="pill ${o[1]} odds">${o[0]}</span>`}</div>
    <div class="role-meta"><span class="pill">${p.stageType === 'musical' ? 'Musical' : 'Play'}</span><span class="pill ${p.prod === 'new' ? 'blue' : p.prod === 'revival' ? 'gold' : ''}">${PROD[p.prod]}</span><span class="pill">${p.size === 'small' ? 'Ensemble' : p.size === 'supporting' ? 'Featured' : 'Lead'}</span><span class="pill">${M(p.pay)}/wk</span><span class="pill">${p.weeks.shoot} wk run</span></div>
    <div class="small muted">Dir. ${esc(p.director.name)}${p.costars.length ? ' · With ' + esc(p.costars.join(', ')) : ''} · ${p.weeks.prep} wk rehearsal</div>
    ${offer ? '' : `<div class="tiny muted" style="margin-top:3px">Also auditioning: ${esc(p.rival)} · Closes ${FC.dateLabel(s, p.expires).split(' · ')[0]}</div>`}
    ${!can.ok ? `<p class="small bad">${esc(can.t)}</p>` : can.t ? `<p class="small muted">${esc(can.t)}</p>` : ''}
    <div class="btns" style="margin-top:10px">${offer ? `<button class="btn" data-a="negotiate" data-id="${p.id}" ${!can.ok ? 'disabled' : ''}>Negotiate contract</button><button class="btn ghost" data-a="decline" data-id="${p.id}">Decline</button>`
      : `<button class="btn" data-a="stageAud" data-id="${p.id}" ${s.energy < 20 || !can.ok ? 'disabled' : ''}>Audition · 20⚡</button><button class="btn dark" data-a="stagePrep" data-id="${p.id}" ${s.energy < 20 || (s.prepped[p.id] || 0) >= 2 ? 'disabled' : ''}>Coach${s.prepped[p.id] ? ' (' + s.prepped[p.id] + '/2)' : ''} · 20⚡</button>`}</div></div>`;
}
function stageView() {
  const s = S(); if (!s.stageBoard) { s.stageBoard = []; FC.refreshStage(s); }
  const reg = UI.stageReg || 'all', typ = UI.stageType || 'all';
  const offers = (s.offers || []).filter(o => o.theater);
  const now = s.jobs.filter(j => j.theater);
  const creds = s.credits.filter(c => c.theater || c.weekly);
  const wins = s.awards.filter(a => (a.show === 'tonys' || a.show === 'olivier') && a.won).length, noms = s.awards.filter(a => a.show === 'tonys' || a.show === 'olivier').length;
  const list = s.stageBoard.filter(p => (reg === 'all' || p.region === reg) && (typ === 'all' || p.stageType === typ));
  return `<div class="card"><div class="eyebrow">Live theatre</div><h2 style="margin-bottom:2px">Broadway and the West End</h2><p class="small muted">Musicals lean on voice, dance (fitness) and charisma. Plays lean on drama, vocal projection and accents. Runs pay weekly and count toward the Tonys (Broadway) and the Oliviers (West End).</p>
    <div class="stats3"><div class="stat"><b>${creds.length}</b><span>Stage credits</span></div><div class="stat"><b>${noms}</b><span>Tony/Olivier noms</span></div><div class="stat"><b>${wins}</b><span>Wins</span></div></div></div>
    ${now.length ? `<div class="card hl"><h3 style="margin-top:0">Now playing</h3>${now.map(j => `<div class="row"><div class="grow"><b>${esc(j.title)}</b><small>${esc(j.stageRole || roleLabel(j))} · ${esc(j.studio)}</small></div><span class="pill ${j.stage === 'shoot' ? 'gold' : ''}">${j.stage === 'prep' ? 'Rehearsals' : 'On stage'} · ${j.left} wk</span></div>`).join('')}<button class="btn sm" data-a="go" data-tab="work" style="margin-top:6px">Open the Work tab</button></div>` : ''}
    ${offers.length ? `<h2>Offers</h2>${offers.map(p => stageCard(p, true)).join('')}` : ''}
    <h2 style="margin:4px 0 0">Casting calls</h2>
    <div class="tabs">${[['all', 'Everywhere'], ['broadway', 'Broadway'], ['westend', 'West End']].map(t => `<button class="${reg === t[0] ? 'on' : ''}" data-a="stageReg" data-v="${t[0]}">${t[1]}</button>`).join('')}${[['all', 'All shows'], ['musical', 'Musicals'], ['play', 'Plays']].map(t => `<button class="${typ === t[0] ? 'on' : ''}" data-a="stageType" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
    ${list.length ? list.map(p => stageCard(p, false)).join('') : '<p class="empty">No calls here this week. New listings post every week.</p>'}`;
}
UI.startStageAud = function (pid) { const s = S(); const st = FC.stageSetup(s, pid); if (!st) return; UI.saud = { pid, setup: st, step: 0, tones: [], piece: null, third: null }; UI.renderStageAud(); };
UI.renderStageAud = function () {
  const s = S(), a = UI.saud, p = s.stageBoard.find(x => x.id === a.pid); if (!p) return UI.closeModal();
  const st = a.setup; let html = '';
  if (a.step === 0) html = `<div class="eyebrow">${p.region === 'broadway' ? 'Broadway' : 'West End'} audition · ${esc(p.studio.split(',')[0])}</div><h2>${esc(p.title)}</h2><p class="small">You're in for <b>${esc(p.stageRole)}</b>. ${st.mus ? 'A musical' : 'A play'}, directed by ${esc(p.director.name)}.</p><div class="scene3d" id="saud3d"></div>
    <div class="scene-card">${esc(st.note)}</div><p class="small muted">${st.mus ? 'Your song, two scenes, then the dance call.' : 'Your monologue, two scenes, then a callback with the director.'}</p><button class="btn" data-a="saudNext">Walk on stage ${ic('next')}</button>`;
  else if (a.step === 1) html = `<div class="eyebrow">${st.mus ? 'Your song' : 'Your monologue'}</div><h2>What did you bring?</h2><div class="choices">${(st.mus ? D.SONG_TYPES : D.MONO_TYPES).map(x => `<button class="choice" data-a="saudPiece" data-v="${x[0]}"><b>${x[1]}</b></button>`).join('')}</div>`;
  else if (a.step <= 1 + st.beats.length) { const b = st.beats[a.step - 2]; html = `<div class="eyebrow">Scene ${a.step - 1} of ${st.beats.length}</div><h2>${esc(b.text[0].toUpperCase() + b.text.slice(1))}</h2><div class="scene-card">${esc(p.stageRole.split(' (')[0].toUpperCase())}: ${esc(pick(['I won\'t be the one who leaves this time.', 'Look at me. Really look at me.', 'There is nothing left to be afraid of.', 'Tomorrow, then. Always tomorrow.']))}</div><div class="tone">${D.TONES.map(t => `<button data-a="saudTone" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`; }
  else if (!a.third) html = st.mus ? `<div class="eyebrow">Dance call</div><h2>The choreographer teaches a 32-count combination once.</h2><div class="choices">${D.DANCE_CALL.map(x => `<button class="choice" data-a="saudThird" data-v="${x[0]}"><b>${x[1]}</b></button>`).join('')}</div>`
    : `<div class="eyebrow">Callback</div><h2>${esc(p.director.name)} gives you a note and asks you to go again.</h2><div class="choices">${D.PLAY_CALLBACK.map(x => `<button class="choice" data-a="saudThird" data-v="${x[0]}"><b>${x[1]}</b></button>`).join('')}</div>`;
  else { const r = FC.stageAudition(s, a.pid, { setup: st, piece: a.piece, tones: a.tones, third: a.third }); UI.saud = null;
    if (!r.ok) { UI.closeModal(); return UI.toast(r.t); }
    const w = Math.min(100, r.score / Math.max(r.need, 1) * 70);
    html = `<div class="eyebrow">The casting call</div><h2 class="${r.cast ? 'gold' : ''}">${r.cast ? `You got ${esc(p.stageRole.split(' (')[0])}!` : r.verdict === 'shortlist' ? 'Down to the final two.' : 'Thank you, next.'}</h2>
      <div class="meter"><span style="width:${w}%"></span><i style="left:70%"></i></div><p class="tiny muted mono">Your audition ${r.score} · What they needed ${r.need}</p>
      <p>${r.cast ? 'Your agent is negotiating the contract. Find it under Offers in the Theatre tab.' : `The part went to ${esc(r.rival)}. ${st.mus ? 'Voice lessons and gym sessions help with musicals.' : 'Acting classes and a dialect coach help with plays.'}`}</p>
      <div class="btns">${r.cast ? `<button class="btn" data-a="negotiate" data-id="${p.id}">Negotiate now</button>` : ''}<button class="btn ${r.cast ? 'ghost' : ''}" data-a="closeModal">Close</button></div>`;
    if (r.cast) UI.toast('Cast: ' + p.title); save(); UI.render(); }
  UI.modal(html);
  if (a && a.step === 0) { const el = $('#saud3d'); if (el && window.L3 && L3.available()) L3.scene(el, s.look, { mode: 'theater' }); else if (el) el.remove(); }
};

// ------------------------------------------------------------------ work: prep, shooting, press
const avg = a => a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
function workView() {
  const s = S(); const jobs = s.jobs;
  if (!jobs.length) return `<h2>Work</h2><div class="card"><p class="empty">No projects right now. Book a part in Casting, then prep, shoot and promote it here.</p></div>`;
  const need = FC.needsEffort(s);
  return `<h2>Work</h2>${need.length ? `<div class="card alert"><b>Choose your effort on set this week</b><div class="small muted">${need.map(j => esc(j.title)).join(', ')}</div></div>` : ''}
    ${jobs.map(workCard).join('')}`;
}
function workCard(j) {
  const s = S(); const F = j.fid ? D.FRANCHISES.find(f => f.id === j.fid) : null; const real = FC.busyRole(j);
  let body = '';
  if (j.stage === 'prep') {
    const acts = FC.prepActs(s, j); const prep = j.prepScore || 0;
    body = `<p class="small muted">${j.left > (j.weeks.prep || 0) ? `Queued behind your other work. ` : ''}Shooting starts in ${j.left} week${j.left === 1 ? '' : 's'}. Prep now: it counts for about a fifth of your acting score.</p>
      ${bar('Prep', prep)}
      ${real ? `<div class="acts" style="margin-top:10px">${acts.map(a => { const reps = (j.prepLog || {})[a.id] || 0; return `<button class="act" data-a="doPrep" data-j="${j.id}" data-id="${a.id}" ${s.energy < a.cost || prep >= 100 || (a.price && s.money < a.price) ? 'disabled' : ''} title="${esc(a.d)}"><b>${a.id === 'chem' ? 'Rehearse with ' + esc((j.costars[0] || '').split(' ')[0]) : a.name}</b><small>−${a.cost}⚡${a.price ? ' · ' + M(a.price) : ''}${reps ? ' · done ' + reps + '×' : ''}</small></button>`; }).join('')}</div>` : '<p class="small muted">No prep needed for this one.</p>'}`;
  } else if (j.stage === 'shoot') {
    const wk = j.wk; const eff = j.effort || [];
    body = real ? `<p class="small muted">${j.theater ? 'Performing' : 'Shooting'}: ${j.left} week${j.left === 1 ? '' : 's'} left. Your effort on set counts for about a third of your acting score.</p>
      <div class="lbl">${j.theater ? 'Energy on stage this week' : 'Effort on set this week'}</div>
      <div class="tone" style="margin-top:6px">${D.EFFORT.map(e => `<button class="${wk && wk.level === e[0] ? 'on' : ''}" data-a="effort" data-j="${j.id}" data-v="${e[0]}" ${(!wk || wk.level !== e[0]) && s.energy + (wk ? D.EFFORT.find(x => x[0] === wk.level)[2] : 0) < e[2] ? 'disabled' : ''}>${e[1]}<br><small class="mono">−${e[2]}⚡</small></button>`).join('')}</div>
      <div class="opts" style="margin-top:10px">${D.SHOOT_EXTRAS.map(x => `<button class="${wk && wk.extras.includes(x.id) ? 'on' : ''}" data-a="extra" data-j="${j.id}" data-id="${x.id}" ${!wk || wk.extras.includes(x.id) || s.energy < x.cost ? 'disabled' : ''} title="${esc(x.d)}">${x.name} · −${x.cost}⚡</button>`).join('')}</div>
      ${eff.length ? `<div class="lbl" style="margin-top:8px">Effort so far</div><div class="effbars">${eff.map(v => `<span style="height:${Math.max(8, v)}%" title="${v}"></span>`).join('')}</div>` : ''}
      <p class="small" style="margin-top:8px">Your acting so far: <b class="gold mono">${(FC.calcPerf(j) / 10).toFixed(1)}</b><span class="muted"> / 10 · prep ${j.prepScore || 0} · effort ${Math.round(avg(eff)) || '–'}</span></p>`
      : `<p class="small muted">One quick day of work.</p>`;
  } else if (j.stage === 'post') body = `<p class="small muted">${j.tv ? 'Editing. Premieres' : 'In post-production. Releases'} in ${j.left} week${j.left === 1 ? '' : 's'}. Your acting score: <b class="gold mono">${(j.perf / 10).toFixed(1)}</b>.</p>${bar('Buzz', FC.buzz(s, j))}${j.trailer ? `<p class="small">Trailer: <b>${FC.num(j.trailer.views)}</b> views · ${j.trailer.react}% liked it <button class="btn sm dark" data-a="watchTrailer" data-id="${j.id}">Watch</button></p>` : `<p class="tiny muted">The trailer drops a few weeks before release.</p>`}`;
  const press = j.press && j.press.length ? `<div class="lbl" style="margin-top:12px">Press · ${j.press.filter(p => p.done).length} of ${j.press.length} done · ${{ fr: 'franchise tour', big: 'studio push', indie: 'light indie press', tv: 'series launch', stage: 'opening press' }[j.pressTier] || ''}</div>
    ${j.press.map(p => { const P = D.PRESS.find(x => x.id === p.type); const open = p.from <= s.week && s.week < p.due; return `<div class="row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px"><b>${P.name}</b>${p.done ? '<span class="pill good">Done</span>' : open ? `<span class="pill gold">Due in ${p.due - s.week} wk</span>` : `<span class="pill">Opens in ${p.from - s.week} wk</span>`}</div><small class="muted">${P.d} −${P.cost}⚡</small>
      ${!p.done && open ? `<div class="btns" style="margin-top:6px">${P.live ? `<button class="btn sm" data-a="pressDo" data-j="${j.id}" data-id="${p.id}" ${s.energy < P.cost ? 'disabled' : ''}>Go on the show</button>` : D.PRESS_STYLE.map(st => `<button class="btn sm ${st[0] === 'charm' ? '' : 'dark'}" data-a="pressDo" data-j="${j.id}" data-id="${p.id}" data-v="${st[0]}" ${s.energy < P.cost ? 'disabled' : ''}>${st[1]}</button>`).join('')}</div>` : ''}</div>`; }).join('')}` : '';
  return `<div class="card role">${F ? `<span class="stripe" style="background:${F.color}"></span>` : ''}<div class="eyebrow">${esc(j.studio)}${j.director ? ' · Dir. ' + esc(j.director.name) : ''}</div><div class="role-title">${esc(j.title)}</div>
    <div class="role-meta"><span class="pill">${esc(roleLabel(j))}</span><span class="pill ${j.stage === 'shoot' ? 'gold' : ''}">${stageName(j)}</span></div>${body}${press}</div>`;
}
UI.review = function (id) {
  const s = S(); const c = s.credits.find(x => x.id === id) || s.jobs.find(x => x.id === id); if (!c || !c.review) return; const r = c.review;
  UI.modal(`<div class="marquee-brand">MARQUEE</div><div class="mq-head"><span class="mq-score big ${r.score >= 8 ? 'hi' : r.score >= 5.5 ? '' : 'lo'}">${r.score.toFixed(1)}</span><div style="min-width:0"><h2 style="margin:0">${esc(c.title)}</h2><div class="small muted">${esc(c.studio)}${c.director ? ' · Dir. ' + esc(c.director.name) : ''} · ${FC.year(s, c.released != null ? c.released : s.week)}</div>${r.bnm ? '<span class="pill gold">Best New Movie</span>' : ''}</div></div>
    <p class="tiny muted">By ${esc(r.by)}</p>${r.text.map(t => `<p>${esc(t)}</p>`).join('')}
    <h3>Cast</h3>${r.cast.map(m => `<div class="cast-row ${m.me ? 'me' : ''}"><div class="grow"><b>${esc(m.name)}</b><small>${esc(m.role)} · ${esc(m.note)}</small></div><span class="mq-score ${m.score >= 8 ? 'hi' : m.score >= 5.5 ? '' : 'lo'}">${m.score.toFixed(1)}</span></div>`).join('')}
    ${r.bp ? '<p class="gold small">Best Performance pick</p>' : ''}<p class="tiny muted">Your prep ${r.prep}/100 · Effort on set ${r.effort}/100</p><button class="btn" data-a="closeModal">Close</button>`);
};

// ------------------------------------------------------------------ career
function careerView() {
  const s = S(); const sub = UI.sub.career;
  const tabs = [['projects', 'Now'], ['films', 'Filmography'], ['chars', 'Characters'], ['awards', 'Awards'], ['company', 'Company'], ['skills', 'Skills'], ['ach', 'Achievements'], ['time', 'Timeline']];
  let body = '';
  if (sub === 'projects') {
    const camp = FC.campaignable(s);
    body = jobsCard() + (camp.length ? `<div class="card hl"><h2>Awards campaign</h2><p class="small muted">Spend on For Your Consideration ads, screenings and Q&As to improve your nomination chances this season.</p>${camp.map(c => `<div class="row"><div class="grow"><b>${esc(c.title)}</b><small>Critics ${c.critics}% · Spent ${M(s.fyc[c.id] || 0)}</small></div><div class="btns"><button class="btn sm" data-a="fyc" data-id="${c.id}" data-v="100000">$100K</button><button class="btn sm" data-a="fyc" data-id="${c.id}" data-v="1000000">$1M</button></div></div>`).join('')}</div>` : '')
      + airingCard()
      + `<div class="card"><h2>Box office now</h2>${s.theaters.filter(f => f.mine).length ? s.theaters.filter(f => f.mine).map(f => `<div class="row"><div class="grow"><b>${esc(f.title)}</b><small>Week ${f.weeks} · ${M(f.last)} this weekend</small></div><span class="mono">${M(f.dom * (1 + f.intl))}</span></div>`).join('') : '<p class="empty">None of your films are in theaters.</p>'}</div>`;
  }
  if (sub === 'films') {
    const cr = s.credits.slice().reverse();
    body = `<div class="card"><h2>Filmography</h2><p class="small muted">${s.credits.length} credits · ${M(s.lifetimeBO)} lifetime box office · ${M(s.lifetimeEarn)} career earnings</p>
      <div class="scroll-x"><table class="tbl"><thead><tr><th>Year</th><th>Title</th><th>Role</th><th class="n">Critics</th><th class="n">Gross</th></tr></thead><tbody>
      ${cr.map(c => `<tr><td class="mono">${FC.year(s, c.released || c.signed)}</td><td>${c.review ? `<button class="linkish" data-a="review" data-id="${c.id}">${esc(c.title)}</button>` : `<b>${esc(c.title)}</b>`}${c.season > 1 ? ' S' + c.season : ''}${c.review ? ` <span class="pill">You ${c.review.mine.toFixed(1)}</span>` : ''}${c.trailer ? ` <button class="linkish tiny" data-a="watchTrailer" data-id="${c.id}">▶ trailer</button>` : ''}<br><span class="tiny muted">${esc(c.studio)}${c.verdict ? ' · ' + esc(c.verdict) : ''}${c.directedByMe ? ' · Directed' : ''}</span></td><td class="small">${esc(roleLabel(c))}</td><td class="n">${c.critics != null ? c.critics + '%' : '–'}</td><td class="n">${c.ww ? M(c.ww) : c.viewers ? FC.num(c.viewers) + ' views' : '–'}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">No credits yet.</td></tr>'}
      </tbody></table></div></div>`;
  }
  if (sub === 'chars') body = s.myChars.length ? s.myChars.map(m => { const F = D.FRANCHISES.find(f => f.id === m.fid); return `<div class="card role"><span class="stripe" style="background:${F.color}"></span><div class="eyebrow">${esc(F.name)}</div><div class="role-title">${esc(m.name)}</div>
      <div class="role-meta"><span class="pill ${(kindBadge[m.kind] || [0, ''])[1]}">${(kindBadge[m.kind] || ['Character'])[0]}</span><span class="pill ${m.status === 'active' ? 'good' : 'bad'}">${{ active: 'Active', dead: 'Killed off', recast: 'Recast', retired: 'Retired' }[m.status]}</span><span class="pill">${m.done} appearance${m.done === 1 ? '' : 's'}</span>${m.owed ? `<span class="pill gold">${m.owed} film${m.owed > 1 ? 's' : ''} owed</span>` : ''}</div>
      ${m.power || m.skill ? `<p class="small muted">${m.power ? 'Power: ' + esc(m.power) : esc(cap(m.skill))}. ${esc(cap(m.origin || ''))}</p>` : ''}${bar('Popularity', m.pop)}${(m.films || []).length ? `<p class="tiny muted">${m.films.map(esc).join(' · ')}</p>` : ''}</div>`; }).join('') : `<div class="card"><p class="empty">No franchise characters yet. Watch the Casting board for roles marked Franchises.</p></div>`;
  if (sub === 'awards') {
    const won = s.awards.filter(a => a.won), noms = s.awards.filter(a => !a.won);
    const emoji = { oscars: '🏆', globes: '🌐', bafta: '🎭', sag: '🗿', critics: '🎬', emmys: '📺', tonys: '🎟️', razzies: '🍓' };
    body = `<div class="card"><h2>Trophy shelf</h2>${won.length ? `<div class="trophies">${won.map(a => `<div class="trophy"><div class="t">${emoji[a.show] || '🏆'}</div><b>${esc(a.short)}</b><br>${esc(a.cat)}<br><span class="muted">${esc(a.film)} · ${a.y}</span></div>`).join('')}</div>` : '<p class="empty">No wins yet.</p>'}</div>
      <div class="card"><h2>Nominations</h2>${noms.length ? `<div class="trophies">${noms.map(a => `<div class="trophy lost"><div class="t">${emoji[a.show] || '🏆'}</div><b>${esc(a.short)}</b><br>${esc(a.cat)}<br><span class="muted">${esc(a.film)} · ${a.y}</span></div>`).join('')}</div>` : '<p class="empty">No nominations yet.</p>'}</div>
      <div class="card"><h2>Award season</h2><table class="tbl"><tbody>${D.AWARDS.map(a => `<tr><td>${a.name}</td><td class="n">Week ${a.week}</td></tr>`).join('')}</tbody></table><p class="tiny muted">Festivals: ${D.FESTIVALS.map(f => f.name + ' (wk ' + f.week + ')').join(', ')}</p></div>`;
  }
  if (sub === 'company') {
    if (!s.company) body = `<div class="card"><h2>Production company</h2><p class="small">Develop your own scripts, direct, produce and keep a share of the profits. Needs fame 35 and $2M.</p><div class="field"><label for="co-name">Company name</label><input id="co-name" maxlength="40" placeholder="${esc(s.me.name.split(' ').pop())} Pictures"></div><button class="btn" data-a="startCo" ${s.fame < 35 || s.money < 2e6 ? 'disabled' : ''}>Start company · $2M</button>
      <h3>Scripts</h3>${s.scripts.length ? s.scripts.map(x => `<div class="row"><div class="grow"><b>${esc(x.title)}</b><small>${D.GENRES.find(g => g.id === x.genre).name} · quality ${x.q}</small></div></div>`).join('') : '<p class="empty">Write scripts from the Home tab (needs Drama 30).</p>'}</div>`;
    else body = `<div class="card"><h2>${esc(s.company.name)}</h2><p class="small muted">${s.company.films} film${s.company.films === 1 ? '' : 's'} produced. Write scripts from the Home tab, then develop them here.</p>
      ${s.scripts.length ? `<div class="field"><label for="dv-script">Script</label><select id="dv-script">${s.scripts.map(x => `<option value="${x.id}">${esc(x.title)} (${D.GENRES.find(g => g.id === x.genre).name}, quality ${x.q})</option>`).join('')}</select></div>
      <div class="field"><label for="dv-budget">Budget</label><select id="dv-budget">${FC.BUDGETS.map(b => `<option value="${b[0]}">${b[1]} · ${M(b[2])} (you put in ${M(b[2] * (b[2] >= 45e6 ? 0.15 : 0.4))})</option>`).join('')}</select></div>
      <label class="check"><input type="checkbox" id="dv-star" checked> Star in it yourself</label><label class="check"><input type="checkbox" id="dv-direct"> Direct it yourself</label>
      <button class="btn" data-a="develop">Pitch to studios</button>` : '<p class="empty">No scripts yet. Choose Write a script on the Home tab.</p>'}</div>`;
  }
  if (sub === 'skills') body = `<div class="card"><h2>Skills</h2>${D.SKILLS.map(([k, n, d]) => `<div style="margin:6px 0">${bar(n, s.skills[k])}<div class="tiny muted" style="margin-left:82px">${d}</div></div>`).join('')}
    <h3>Traits</h3><p class="small">${s.me.traits.map(id => { const t = D.TRAITS.find(x => x.id === id); return `<b>${t.name}:</b> ${t.d}`; }).join('<br>') || 'None'}</p>
    <h3>Dream goal</h3><p class="small">${D.GOALS.find(g => g.id === s.me.goal).name} ${FC.goalDone(s) ? '<span class="pill good">Done</span>' : '<span class="pill">In progress</span>'}</p></div>`;
  if (sub === 'ach') body = `<div class="card"><h2>Achievements</h2><p class="small muted">${Object.keys(s.achievements).length} of ${D.ACHIEVEMENTS.length}</p><div class="ach">${D.ACHIEVEMENTS.map(a => `<div class="${s.achievements[a[0]] != null ? '' : 'off'}"><b>${a[1]}</b>${a[2]}</div>`).join('')}</div></div>`;
  if (sub === 'time') body = `<div class="card"><h2>Career timeline</h2><div class="news">${s.timeline.slice().reverse().map(t => `<div><small>${FC.dateLabel(s, t.w)}</small>${esc(t.t)}</div>`).join('')}</div></div>`;
  return `<div class="tabs">${tabs.map(t => `<button class="${sub === t[0] ? 'on' : ''}" data-a="sub" data-g="career" data-s="${t[0]}">${t[1]}</button>`).join('')}</div>${body}`;
}

function airingCard() {
  const s = S(); const on = s.credits.filter(c => c.airing && c.airing.ep < c.airing.total);
  if (!on.length) return '';
  return `<div class="card"><h2>On the air</h2>${on.map(c => `<div class="row"><div class="grow"><b>${esc(c.title)}${c.season > 1 ? ' · S' + c.season : ''}</b><small>Episode ${c.airing.ep} of ${c.airing.total}${c.airing.eps.length ? ' · last ' + FC.num(c.airing.eps[c.airing.eps.length - 1]) + ' viewers' : ''}</small>${epBars(c)}</div></div>`).join('')}</div>`;
}
function epBars(c) { const a = c.airing; if (!a || !a.eps.length) return ''; const mx = Math.max(...a.eps);
  return `<div style="display:flex;gap:3px;align-items:flex-end;height:40px;margin-top:6px">${Array.from({ length: a.total }, (_, i) => a.eps[i] != null ? `<span title="Ep ${i + 1}: ${FC.num(a.eps[i])}" style="flex:1;background:var(--gold);border-radius:3px 3px 0 0;height:${Math.max(8, a.eps[i] / mx * 100)}%"></span>` : `<span style="flex:1;background:var(--card2);border-radius:3px 3px 0 0;height:8%"></span>`).join('')}</div>`; }

// ------------------------------------------------------------------ live TV: talk shows and SNL
UI.renderLive = function (res) {
  const s = S(), L = s.live; if (!L) return;
  const kind = L.steps[L.step]; const snl = L.kind === 'snl';
  let body = '';
  if (res) body = `<p>${esc(res.text)}</p>${res.viral ? '<p class="gold small">🔥 This is going viral.</p>' : ''}<button class="btn" data-a="liveAfter">Next ${ic('next')}</button>`;
  else if (kind === 'cold') body = `<div class="eyebrow">Cold open</div><p>${esc(L.cast[0])} and ${esc(L.cast[1])} open with a political sketch. Then the line: <b>"Live from New York, it's Saturday Night!"</b></p><p class="small muted">Musical guest: ${esc(L.guest)}.</p><button class="btn" data-a="liveNext">Walk out for your monologue ${ic('next')}</button>`;
  else if (kind === 'intro') body = `<div class="eyebrow">${esc(L.name)}</div><p>The band plays you on. The host stands to shake your hand, and the audience is on its feet.${L.film ? ' There is a clip from your movie ready to roll.' : ''}</p><button class="btn" data-a="liveNext">Sit down ${ic('next')}</button>`;
  else if (kind === 'mono') body = `<div class="eyebrow">Monologue</div><h3 style="margin-top:0">How do you open the show?</h3><div class="choices">${D.SNL_MONO.map((m, i) => `<button class="choice" data-a="liveChoose" data-i="${i}"><b>${m.name}</b><small>${m.d}</small></button>`).join('')}</div>`;
  else if (kind === 'sk') { const n = L.step - 2; const sk = L.sketches[n]; body = `<div class="eyebrow">Sketch ${n + 1} of 3 · with ${esc(L.cast[n % L.cast.length])}</div><h3 style="margin-top:0">${esc(sk.t)}</h3><p class="small muted">Leans on ${D.SKILLS.find(x => x[0] === sk.skill)[1].toLowerCase()}.</p><div class="choices">${D.SNL_COMMIT.map((c, i) => `<button class="choice" data-a="liveChoose" data-i="${i}"><b>${c[1]}</b></button>`).join('')}</div>`; }
  else if (kind === 'q') { const n = L.step - 1; const q = L.qs[n]; body = `<div class="eyebrow">Question ${n + 1}</div><h3 style="margin-top:0">"${esc(q.q)}"</h3><div class="choices">${q.opts.map((o, i) => `<button class="choice" data-a="liveChoose" data-i="${i}"><b>${esc(o[0])}</b></button>`).join('')}</div>`; }
  else if (kind === 'game') body = `<div class="eyebrow">Game segment</div><h3 style="margin-top:0">Time for ${esc(L.game)}.</h3><div class="choices"><button class="choice" data-a="liveChoose" data-i="0"><b>Go all in</b><small>Big laughs or big embarrassment.</small></button><button class="choice" data-a="liveChoose" data-i="1"><b>Play it safe</b><small>Hard to mess up.</small></button></div>`;
  else if (kind === 'night') body = snl ? `<div class="eyebrow">Home base</div><p>You introduce ${esc(L.guest)}, who brings the house down. Then the whole cast gathers on stage, waving, while the credits roll.</p><button class="btn" data-a="liveFinish">Say goodnight</button>` : `<p>The host thanks you and holds up a poster for your next project. Applause, music, cut to commercial.</p><button class="btn" data-a="liveFinish">Wave goodbye</button>`;
  const html = `<div id="live-body"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="eyebrow">${snl ? 'Saturday Night Live' : esc(L.name)}</span><span class="pill gold">Crowd ${Math.round(L.meter)}</span></div>
    <div class="meter"><span style="width:${L.meter}%"></span></div>${body}</div>`;
  const wrap = document.querySelector('#modal #live-body');
  if (wrap) { wrap.outerHTML = html; return; }
  UI.modal(`<div class="scene3d" id="live3d"></div>${html}`, { noClose: true });
  const el = $('#live3d'); if (el && window.L3 && L3.available()) L3.scene(el, s.look, { mode: 'studio', snl }); else if (el) el.remove();
};
UI.liveDone = function (r) {
  UI.modal(`<div class="eyebrow">${r.snl ? 'The reviews are in' : esc(r.name)}</div><h2>${r.snl ? 'You hosted SNL' : 'That is a wrap'}</h2>
    <div class="bigstat"><div><b>${r.grade}</b><span>Grade</span></div><div><b>${Math.round(r.meter)}</b><span>Crowd</span></div><div><b>${r.viral ? 'Yes' : 'No'}</b><span>Viral clip</span></div></div>
    ${r.quotes.map(q => `<div class="quote ${q.good ? 'good' : 'bad'}">"${esc(q.t)}"<small>${esc(q.o)}</small></div>`).join('')}<button class="btn" data-a="closeModal">Continue</button>`);
};

// ------------------------------------------------------------------ hollywood (world)
function worldView() {
  const s = S(); const sub = UI.sub.world;
  const tabs = [['box', 'Box office'], ['marquee', 'Marquee'], ['studios', 'Studios'], ['fr', 'Franchises'], ['news', 'News'], ['feed', 'Clapper']];
  let body = '';
  if (sub === 'box') body = `<div class="card"><h2>Weekend box office</h2><p class="small muted">Domestic, ${FC.dateLabel(s)}</p><div class="scroll-x"><table class="tbl"><thead><tr><th>#</th><th>Film</th><th class="n">Weekend</th><th class="n">Total</th><th class="n">Wks</th></tr></thead><tbody>
    ${(s.chart || []).map(r => `<tr class="${r.mine ? 'mine' : ''}"><td class="mono">${r.rank}</td><td><b>${esc(r.title)}</b><br><span class="tiny muted">${esc(r.studio)}${r.mine ? ' · You' : r.star ? ' · ' + esc(r.star) : ''}</span></td><td class="n">${M(r.wk)}</td><td class="n">${M(r.total)}</td><td class="n">${r.weeks}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">The chart updates when you end the week.</td></tr>'}</tbody></table></div>
    <p class="tiny muted">Superhero fatigue: ${s.heroFatigue > 0.5 ? 'high' : s.heroFatigue > 0.3 ? 'moderate' : 'low'}</p></div>`;
  if (sub === 'fr') {
    const fid = UI.frSel || 'mcu'; const F = D.FRANCHISES.find(f => f.id === fid); const st = s.fr[fid];
    body = `<div class="tabs">${D.FRANCHISES.map(f => `<button class="${fid === f.id ? 'on' : ''}" data-a="frSel" data-id="${f.id}">${f.short}</button>`).join('')}</div>
      <div class="card role"><span class="stripe" style="background:${F.color}"></span><div class="eyebrow">${esc(D.STUDIOS.find(x => x.id === F.studio).name)}</div><h2>${esc(F.name)}</h2>
      <div class="stats3"><div class="stat"><b>${Math.round(st.mood)}</b><span>Fan mood</span></div><div class="stat"><b>${Math.round(st.fatigue * 100)}%</b><span>Fatigue</span></div><div class="stat"><b>${st.films}</b><span>Films</span></div></div>
      <h3>Cast</h3><table class="tbl"><tbody>${st.chars.map(c => `<tr class="${c.status === 'player' ? 'mine' : ''}"><td>${esc(c.name)}</td><td class="small">${c.status === 'open' ? `<span class="pill bad">Open${c.prevActor ? ' · was ' + esc(c.prevActor) : ''}</span>` : esc(c.actor || '')}</td><td class="n tiny">${c.status === 'active' ? 'thru ' + c.ends : c.status === 'player' ? 'You' : ''}</td></tr>`).join('')}</tbody></table>
      ${F.legacy.length ? `<h3>Legacy mantles</h3><p class="small muted">${F.legacy.map(l => `${esc(l[0])} (${esc(l[1])})`).join(' · ')}</p>` : ''}
      <h3>Coming up</h3><p class="small muted">${F.titles.filter(t => !st.used.includes(t)).slice(0, 5).map(esc).join(' · ') || 'Nothing announced.'}</p></div>`;
  }
  if (sub === 'studios') { const rows = D.STUDIOS.filter(st => st.brand >= 0.35).sort((a, b) => b.brand - a.brand);
    body = `<div class="card"><h2>Studios</h2><p class="small muted">How each studio feels about you. Hits, good press and hard work on set raise it. Flops, skipped press and broken contracts lower it. Studios that like you cast you more easily, pay more and call you with direct offers.</p>
      ${rows.map(st => { const v = FC.studioRel(s, st.name); const lbl = v >= 25 ? 'They love you' : v >= 10 ? 'Warm' : v > -10 ? 'Neutral' : v > -25 ? 'Cool' : 'Burned bridge'; return `<div class="row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(st.name)}</b><span class="pill ${v >= 10 ? 'good' : v <= -10 ? 'bad' : ''}">${lbl}</span></div><small class="muted">${esc(D.STUDIO_BLURB[st.id] || '')} Brand power ${Math.round(st.brand * 100)}.</small><div class="meter" style="height:8px"><span style="left:50%;width:0"></span><span style="${v >= 0 ? `left:50%;width:${v}%` : `left:${50 + v}%;width:${-v}%`};background:${v >= 0 ? 'var(--teal)' : 'var(--red)'}"></span><i style="left:50%"></i></div></div>`; }).join('')}</div>`; }
  if (sub === 'marquee') { const revs = s.credits.filter(c => c.review).slice().reverse();
    body = `<div class="card"><div class="marquee-brand">MARQUEE</div><p class="small muted">Reviews of everything you've been in, with a score for every cast member.</p>
      ${revs.length ? revs.map(c => `<button class="row rev-row" data-a="review" data-id="${c.id}"><span class="mq-score ${c.review.score >= 8 ? 'hi' : c.review.score >= 5.5 ? '' : 'lo'}">${c.review.score.toFixed(1)}</span><div class="grow"><b>${esc(c.title)}</b><small>${esc(c.studio)} · ${FC.year(s, c.released)}${c.review.bnm ? ' · <span class="gold">Best New Movie</span>' : ''}</small><small>You: ${c.review.mine.toFixed(1)}${c.review.bp ? ' · <span class="gold">Best Performance</span>' : ''}</small></div><span class="muted">›</span></button>`).join('') : '<p class="empty">Reviews show up here when your projects come out.</p>'}</div>`; }
  if (sub === 'news') body = `<div class="card"><h2>Trades</h2><div class="news">${s.news.slice(0, 60).map(n => `<div class="${n.tag === 'you' ? 'you' : ''}"><small>${FC.dateLabel(s, n.w)} · ${esc(pickOutlet(n))}</small>${esc(n.t)}</div>`).join('')}</div></div>`;
  if (sub === 'feed') body = `<div class="card"><h2>Clapper</h2><button class="btn sm" data-a="act" data-id="post" ${s.energy < 8 ? 'disabled' : ''}>Post (−8⚡)</button><div style="margin-top:8px">${s.feed.length ? s.feed.slice(0, 40).map(f => `<div class="post"><b>@${esc(f.who.replace(/\s+/g, '').toLowerCase())}</b> <small>${FC.dateLabel(s, f.w).split(' · ')[0]}</small><div>${esc(f.t)}</div><small>♥ ${FC.num(f.likes)}</small></div>`).join('') : '<p class="empty">Nothing yet. Post something.</p>'}</div></div>`;
  return `<div class="tabs">${tabs.map(t => `<button class="${sub === t[0] ? 'on' : ''}" data-a="sub" data-g="world" data-s="${t[0]}">${t[1]}</button>`).join('')}</div>${body}`;
}
function pickOutlet(n) { return D.OUTLETS[(n.t.length + n.w) % D.OUTLETS.length]; }

// ------------------------------------------------------------------ life
function lifeView() {
  const s = S(); const sub = UI.sub.life;
  const tabs = [['money', 'Money'], ['team', 'Team'], ['homes', 'Homes'], ['love', 'Love'], ['look', 'Look'], ['settings', 'Settings']];
  let body = '';
  if (sub === 'money') {
    const home = D.HOMES.find(h => h.id === s.home);
    body = `<div class="card"><h2>Money</h2><div class="stats3"><div class="stat"><b>${M(s.money)}</b><span>Cash</span></div><div class="stat"><b>${M(FC.netWorth(s))}</b><span>Net worth</span></div><div class="stat"><b>${M(s.yearEarn)}</b><span>Earned this year</span></div></div>
      <p class="small muted">Agent ${Math.round(FC.agency(s).cut * 100)}%${s.team.manager ? ', manager 5%' : ''} of earnings. Taxes (33%) are due each January. Living: ${home.name}.</p>
      ${s.brands.filter(b => b.until > s.week).length ? `<h3>Brand deals</h3>${s.brands.filter(b => b.until > s.week).map(b => `<div class="row"><div class="grow"><b>${esc(b.name)}</b><small>${esc(b.cat)} · until ${FC.year(s, b.until)}</small></div><span class="mono">${M(b.pay)}/yr</span></div>`).join('')}` : ''}
      ${s.yearEarnHist.length ? `<h3>By year</h3><table class="tbl"><tbody>${s.yearEarnHist.slice(-8).reverse().map(y => `<tr><td>${y.y}</td><td class="n">${M(y.earn)}</td></tr>`).join('')}</tbody></table>` : ''}</div>
      <div class="card"><h2>Investments</h2>${D.INVEST.map(i => `<div class="row"><div class="grow"><b>${i.name}</b><small>${i.risk > 0.3 ? 'High risk' : i.risk > 0.1 ? 'Medium risk' : 'Low risk'}${s.invest[i.id] ? ' · worth ' + M(s.invest[i.id]) : ''}</small></div><div class="btns"><button class="btn sm dark" data-a="invest" data-id="${i.id}" data-v="50000" ${s.money < 5e4 || (i.need && s.fame < i.need) ? 'disabled' : ''}>+$50K</button><button class="btn sm dark" data-a="invest" data-id="${i.id}" data-v="1000000" ${s.money < 1e6 || (i.need && s.fame < i.need) ? 'disabled' : ''}>+$1M</button>${s.invest[i.id] ? `<button class="btn sm ghost" data-a="withdraw" data-id="${i.id}">Sell</button>` : ''}</div></div>`).join('')}</div>
      <div class="card"><h2>Charity</h2><p class="small muted">Given so far: ${M(s.charity)}</p><div class="btns">${[10000, 100000, 1000000].map(v => `<button class="btn sm dark" data-a="donate" data-v="${v}" ${s.money < v ? 'disabled' : ''}>Give ${M(v)}</button>`).join('')}</div></div>
      <div class="card"><h2>Cars</h2>${D.CARS.map(c => `<div class="row"><div class="grow"><b>${c.name}</b><small>${M(c.price)}${s.cars.includes(c.id) ? ' · Owned' : ''}</small></div><button class="btn sm dark" data-a="buyCar" data-id="${c.id}" ${s.money < c.price ? 'disabled' : ''}>Buy</button></div>`).join('')}</div>`;
  }
  if (sub === 'team') {
    const sp = FC.starPower(s);
    body = `<div class="card"><h2>Agency</h2><p class="small muted">A bigger agency puts you up for bigger roles and pushes harder in negotiations. Your Star Power: ${sp}.</p>${D.AGENCIES.map(a => `<div class="row"><div class="grow"><b>${a.name}</b><small>${a.d}${a.need ? ' · wants Star Power ' + a.need : ''}${a.cut ? ' · 10% commission' : ''}</small></div>${s.agency === a.id ? '<span class="pill good">Your agency</span>' : `<button class="btn sm ${sp >= a.need ? '' : 'dark'}" data-a="agency" data-id="${a.id}">${sp >= a.need ? 'Sign' : 'Pitch'}</button>`}</div>`).join('')}</div>
      <div class="card"><h2>Team</h2>${D.TEAM.map(t => `<div class="row" style="display:block"><b>${t.name}${s.team[t.id] ? ' · ' + esc(s.teamNames[t.id] || '') : ''}</b><small class="muted">${t.d}</small>
        <div class="opts">${[0, 1, 2, 3].map(l => `<button class="${(s.team[t.id] || 0) === l ? 'on' : ''}" data-a="hire" data-id="${t.id}" data-l="${l}">${l === 0 ? 'None' : ['', 'Junior', 'Seasoned', 'Elite'][l]}${l && t.fee[l] ? ' · ' + M(t.fee[l]) + '/wk' : l && t.id === 'manager' ? ' · 5%' : ''}</button>`).join('')}</div></div>`).join('')}</div>`;
  }
  if (sub === 'homes') body = `<div class="card"><h2>Homes</h2><p class="small muted">Nicer homes help you recover energy each week.</p>${D.HOMES.map(h => { const own = s.homes.includes(h.id); const here = s.home === h.id; return `<div class="row"><div class="grow"><b>${h.name}</b><small>${h.price ? M(h.price) + ' · ' + M(h.upkeep) + '/wk upkeep' : M(h.rent) + '/wk rent'} · +${h.rest} energy</small></div>${here ? '<span class="pill good">Home</span>' : `<div class="btns"><button class="btn sm ${own || !h.price ? 'dark' : ''}" data-a="home" data-id="${h.id}" ${!own && h.price && s.money < h.price ? 'disabled' : ''}>${own || !h.price ? 'Move in' : 'Buy'}</button>${own ? `<button class="btn sm ghost" data-a="sellHome" data-id="${h.id}">Sell</button>` : ''}</div>`}</div>`; }).join('')}</div>`;
  if (sub === 'love') body = s.love ? `<div class="card"><h2>${esc(s.love.name)}</h2><p class="small muted">${esc(s.love.job[0].toUpperCase() + s.love.job.slice(1))} · ${s.love.stage === 'dating' ? 'Dating' : s.love.stage === 'engaged' ? 'Engaged' : 'Married'} since ${FC.year(s, s.love.since)}</p>${bar('Bond', s.love.bond, 'hap')}<p class="small muted">Long shoots strain the relationship. Make time.</p><div class="btns"><button class="btn sm" data-a="loveDate" ${s.energy < 10 ? 'disabled' : ''}>Date night (−10⚡)</button><button class="btn sm ghost" data-a="breakUp">Break up</button></div></div>`
    : `<div class="card"><h2>Love life</h2><p class="small muted">Single. Choose Go on a date on the Home tab to meet someone.</p></div>`;
  if (sub === 'look') body = `<div class="card"><h2>Wardrobe</h2><p class="small muted">Your look appears in your portrait, on red carpets and at award shows.</p>${UI.lookEditor(s.look, UI.ltab || 'outfit', 'me')}</div>`;
  if (sub === 'settings') body = `<div class="card"><h2>Settings</h2><div class="btns"><button class="btn dark" data-a="help">How to play</button><button class="btn dark" data-a="toggle3d">3D: ${window.L3 && L3.available() ? 'On' : 'Off'}</button><button class="btn dark" data-a="saveQuit">Save and quit</button></div><p style="margin-top:10px"><button class="version" data-a="whatsNew">Version ${window.FC_BUILD || 1} · What's new</button> <button class="version" data-a="checkNow">Check for updates</button></p>
    <h3>Retire</h3><p class="small muted">End your career and see how you'll be remembered.</p><button class="btn red" data-a="retireAsk">Retire</button></div>`;
  return `<div class="tabs">${tabs.map(t => `<button class="${sub === t[0] ? 'on' : ''}" data-a="sub" data-g="life" data-s="${t[0]}">${t[1]}</button>`).join('')}</div>${body}`;
}

// ------------------------------------------------------------------ end of week & pending events
UI.endWeek = function (force) {
  const s = S(); if (UI.busy) return;
  const need = FC.needsEffort(s);
  if (need.length && !force) { UI.modal(`<div class="eyebrow">Before you end the week</div><h2>How hard are you working on set?</h2>${need.map(j => `<div class="row" style="display:block"><b>${esc(j.title)}</b><div class="tone" style="margin-top:6px">${D.EFFORT.map(e => `<button data-a="effortEnd" data-j="${j.id}" data-v="${e[0]}" ${s.energy < e[2] ? 'disabled' : ''}>${e[1]}<br><small class="mono">−${e[2]}⚡</small></button>`).join('')}</div></div>`).join('')}<p class="small muted">If you don't choose, you coast.</p><div class="btns"><button class="btn ghost" data-a="endWeekForce">Just end the week</button><button class="btn dark" data-a="goWork">Go to the Work tab</button></div>`, { noClose: true }); return; }
  UI.busy = true;
  const r = FC.endWeek(s); save();
  UI.render(); UI.busy = false;
  const lines = r.lines.filter(l => !l.startsWith('🏆'));
  if (lines.length) UI.toast(lines.slice(0, 3).join(' · '));
  flushAch();
  UI.nextPending();
};
UI.nextPending = function () {
  const s = S(); if (!s || !s.pending.length) { save(); UI.render(); if (s && s.ended) UI.renderEnding(); return; }
  const p = s.pending.shift(); save();
  UI.afterModal = () => UI.nextPending();
  const job = id => s.credits.find(c => c.id === id) || s.jobs.find(c => c.id === id);
  if (p.type === 'set') { const ev = D.SET_EVENTS[p.ev]; const j = s.jobs.find(x => x.id === p.jobId); if (!j) return UI.nextPending(); const ctx = { costar: j.costars[0] || 'your co-star' };
    const sc = ev.sc || {}; const set = sc.set || L3set(j); const day = Math.max(1, (j.weeks.shoot - j.left) * 5 + 1);
    UI.cur = p;
    UI.eventCard({ big: j.title, small: `Day ${day} of ${j.weeks.shoot * 5} · On set`, kicker: `${j.studio}${j.director ? ' · Dir. ' + j.director.name : ''}`, title: FC.fill(ev.t, ctx),
      look: UI.costume(j, set), scene: { set, crew: sc.crew !== false, cast: UI.castLooks(j.costars, sc.castSuits), anim: sc.anim, castAnim: sc.castAnim, fx: sc.fx, director: j.director && j.director.name },
      choices: ev.c.map(c => c[0]), pick: i => ({ text: FC.resolve(s, p, i) }) }); return; }
  if (p.type === 'announce') { const j = s.jobs.find(x => x.id === p.jobId); if (!j) return UI.nextPending();
    const react = FC.announceReaction(s, j); const tone = react >= 65 ? 'good' : react >= 42 ? 'mixed' : 'bad';
    const posts = D.FAN_POSTS[tone].slice().sort(() => Math.random() - 0.5).slice(0, 3);
    const handles = ['@reelqueen', '@cinephile_dan', '@fanboy4life', '@popcornpapi', '@thefilmfeed', '@castingwatch'];
    UI.eventCard({ big: 'Breaking', small: j.studio, kicker: `Casting announcement · ${j.studio}`, title: `${j.studio} announces ${s.me.name} as ${j.char ? j.char.name : 'the lead'} in ${j.title}.`,
      sub: `<div class="lbl" style="margin-top:8px">Fan reaction</div><div class="meter"><span style="width:${react}%;background:${tone === 'good' ? 'var(--teal)' : tone === 'bad' ? 'var(--red)' : 'var(--gold)'}"></span></div><p class="small"><b>${react}% positive.</b> ${tone === 'good' ? 'The internet is thrilled.' : tone === 'mixed' ? 'The internet is split.' : 'The internet is not happy.'}</p>${posts.map((t, i) => `<div class="post"><b>${handles[(i + react) % handles.length]}</b><div>${esc(t)}</div></div>`).join('')}`,
      look: UI.costume(j, 'hallh'), scene: { mode: 'awards', anim: 'wave' },
      choices: ['Post a cryptic teaser', 'Thank the fans', 'Say nothing, let the mystery build'], pick: i => ({ text: FC.announceRespond(s, j.id, i), good: react >= 42 || i === 1 }) }); return; }
  if (p.type === 'trailer') { const j = s.jobs.find(x => x.id === p.id) || job(p.id); if (!j || !j.trailer) return UI.nextPending(); UI.playTrailer(j, true); return; }
  if (p.type === 'event') { const ev = D.RANDOM_EVENTS.find(e => e.id === p.id); const sc = ev.sc || {};
    UI.cur = p;
    UI.eventCard({ big: 'This week', small: FC.dateLabel(s), kicker: 'Your life', title: FC.fill(ev.t, p.ctx), look: s.look,
      scene: { set: sc.set || 'home', cast: sc.castAnim || sc.castSuits ? UI.castLooks([p.ctx.actor || p.ctx.costar], sc.castSuits) : [], anim: sc.anim, castAnim: sc.castAnim, fx: sc.fx },
      choices: ev.c.map(c => c[0]), pick: i => ({ text: FC.resolve(s, p, i) }) }); return; }
  if (p.type === 'release') { const j = job(p.id); if (!j) return UI.nextPending();
    if (j.tv) { UI.modal(`<div class="eyebrow">Premiere</div><h2>${esc(j.title)}${j.season > 1 ? ' · Season ' + j.season : ''}</h2><div class="bigstat"><div><b>${j.critics}%</b><span>Critics</span></div><div><b>${FC.num(j.viewers)}</b><span>Viewers</span></div><div><b>${j.rating}</b><span>Rating</span></div></div>${j.quotes.map(q => `<div class="quote ${q.good ? 'good' : 'bad'}">"${esc(q.t)}"<small>${esc(q.o)}</small></div>`).join('')}${j.review ? `<button class="btn dark" data-a="review" data-id="${j.id}">Read the Marquee review · ${j.review.score.toFixed(1)}</button> ` : ''}<button class="btn" data-a="closeModal">Continue</button>`); return; }
    UI.modal(`<div class="eyebrow">Opening weekend</div><h2>${esc(j.title)}</h2><div class="scene3d" id="rel3d"></div>
      <div class="bigstat"><div><b>${M(s.theaters.find(f => f.id === j.id) ? s.theaters.find(f => f.id === j.id).open : j.dom)}</b><span>Opening</span></div><div><b>${j.critics}%</b><span>Critics</span></div><div><b>${j.grade}</b><span>CinemaScore</span></div></div>
      <p class="small muted">Audience score ${j.aud}%. ${j.festival ? 'Premiered at ' + esc(j.festival) + '.' : ''}</p>${j.quotes.map(q => `<div class="quote ${q.good ? 'good' : 'bad'}">"${esc(q.t)}"<small>${esc(q.o)}</small></div>`).join('')}<div class="btns">${j.review ? `<button class="btn dark" data-a="review" data-id="${j.id}">Read the Marquee review · ${j.review.score.toFixed(1)}</button>` : ''}<button class="btn" data-a="closeModal">Continue</button></div>`);
    const el = $('#rel3d'); if (el && window.L3 && L3.available()) L3.scene(el, Object.assign({}, s.look, ['tee', 'hoodie', 'tank', 'puffer'].includes(s.look.top) ? { top: S().me.cat === 's' ? 'gown' : 'tux', topColor: '#15151b' } : {}), { mode: 'carpet', title: j.title, cast: UI.castLooks(j.costars), castAnim: 'pose' }); else if (el) el.remove(); return; }
  if (p.type === 'closed') { const j = job(p.id); if (!j) return UI.nextPending(); UI.modal(`<div class="eyebrow">Final box office</div><h2>${esc(j.title)}</h2><div class="bigstat"><div><b>${M(j.dom)}</b><span>Domestic</span></div><div><b>${M(j.ww)}</b><span>Worldwide</span></div><div><b class="${/Flop/.test(j.verdict) ? 'bad' : 'gold'}" style="font-size:1.05rem">${esc(j.verdict)}</b><span>Verdict</span></div></div><p class="small muted">Budget ${M(j.budget || 0)}.${j.terms && j.terms.points ? ` Your ${j.terms.points} backend points paid out.` : ''}</p><button class="btn" data-a="closeModal">Continue</button>`); return; }
  if (p.type === 'noms') { const show = D.AWARDS.find(a => a.id === p.show); const n = s.awardNoms[p.show]; if (!n) return UI.nextPending();
    UI.modal(`<div class="eyebrow">Nominations</div><h2>${show.id === 'razzies' ? 'Uh oh.' : "You're nominated!"}</h2><p>${esc(show.name)}</p>${n.noms.map(x => `<div class="row"><div class="grow"><b>${esc(x.cat)}</b><small>${esc(x.film)}</small></div></div>`).join('')}<p class="small muted">The ceremony is in week ${show.week}.${show.id !== 'razzies' ? ' Campaign spending on the Career tab can help.' : ''}</p><button class="btn" data-a="closeModal">Continue</button>`); return; }
  if (p.type === 'ceremony') { UI.cer = { p, i: 0, open: false }; return UI.renderCeremony(); }
  if (p.type === 'festival') { UI.modal(`<div class="eyebrow">${esc(p.fest)}</div><h2>${esc(p.film)} premieres</h2><p>${p.ovation >= 3 ? `A ${p.ovation}-minute standing ovation. The trades are calling it ${p.q > 75 ? 'an awards frontrunner' : 'a strong contender'}.` : 'Polite applause. The reviews will tell.'}</p><button class="btn" data-a="closeModal">Continue</button>`); return; }
  if (p.type === 'opening' || p.type === 'stage') { const j = s.jobs.find(x => x.id === p.jobId); if (!j) return UI.nextPending();
    const ev = p.type === 'stage' ? D.STAGE_EVENTS[p.ev] : null; UI.cur = p;
    UI.eventCard({ big: p.type === 'opening' ? 'Opening night' : 'Tonight', small: `${j.title} · ${j.studio.split(',')[0]}`, kicker: `${j.stageRole || roleLabel(j)} · ${Math.min(100, j.house || 0)}% sold · ${j.nights || 0} shows`,
      title: p.type === 'opening' ? 'Places in five minutes. The critics are in the house.' : ev.t, look: Object.assign({}, s.look, j.genre === 'musical' ? { top: 'sequin' } : {}),
      scene: { mode: 'theater', cast: UI.castLooks(j.costars), anim: 'pose' },
      choices: (p.type === 'opening' ? D.STAGE_OPENING.map(c => c[1]) : ev.c.map(c => c[0])),
      pick: i => { const out = FC.resolve(s, p, i); if (out && typeof out === 'object') return { good: out.critics >= 55, headline: out.text, html: `<div class="bigstat"><div><b>${out.critics}%</b><span>Critics</span></div></div>${out.quotes.map(q => `<div class="quote ${q.good ? 'good' : 'bad'}">"${esc(q.t)}"<small>${esc(q.o)}</small></div>`).join('')}` }; return { text: out }; } }); return; }
  if (p.type === 'closing') { const j = job(p.id); if (!j) return UI.nextPending(); const avg = j.houses && j.houses.length ? Math.round(j.houses.reduce((a, b) => a + b, 0) / j.houses.length) : 0;
    UI.modal(`<div class="eyebrow">Closing night</div><h2>${esc(j.title)}</h2><div class="bigstat"><div><b>${j.nights || 0}</b><span>Performances</span></div><div><b>${Math.min(100, avg)}%</b><span>Avg houses</span></div><div><b>${j.openingCritics != null ? j.openingCritics : j.critics}%</b><span>Critics</span></div></div><p>The cast takes one last bow. ${avg > 90 ? 'The run sold out almost every night.' : avg > 70 ? 'A healthy run.' : 'Some empty seats by the end, but you grew as an actor.'} Tony nominations are announced in the spring.</p><button class="btn" data-a="closeModal">Continue</button>`); return; }
  if (p.type === 'midseason') { const c = job(p.id); if (!c) return UI.nextPending(); const ev = D.TV_MIDSEASON[p.ev];
    UI.eventCard({ big: `Episode ${p.ep}`, small: c.title, kicker: 'Airing now', title: FC.fill(ev.t, { ep: p.ep }), sub: epBars(c), look: s.look, scene: { set: 'home', anim: 'phone' },
      choices: ev.c.map(x => x[0]), pick: i => ({ text: FC.tvMoment(s, p.id, p.ev, i) }) }); return; }
  if (p.type === 'finale') { const c = job(p.id); if (!c) return UI.nextPending();
    UI.eventCard({ big: 'The finale', small: c.title, kicker: 'Writers room', title: 'The writers want your input on the finale.', sub: epBars(c), look: s.look, scene: { set: 'office', anim: 'talk', cast: UI.castLooks(c.costars), castAnim: 'talk' },
      choices: D.TV_FINALE.map(x => x[1]), pick: i => ({ good: true, headline: FC.tvFinale(s, p.id, D.TV_FINALE[i][0]) }) }); return; }
  if (p.type === 'seasonEnd') { const c = job(p.id); if (!c) return UI.nextPending(); const a = c.airing;
    UI.modal(`<div class="eyebrow">Season ${c.season || 1} finale</div><h2>${esc(c.title)}</h2>${epBars(c)}<div class="bigstat"><div><b>${FC.num(c.viewers)}</b><span>Avg viewers</span></div><div><b>${FC.num(a.eps[a.eps.length - 1])}</b><span>Finale</span></div><div><b>${c.rating}</b><span>Rating</span></div></div><p class="small muted">${a.eps[a.eps.length - 1] > a.eps[0] ? 'The audience grew all season.' : 'Viewers drifted off as the season went on.'} The network decides on renewal in two weeks.</p><button class="btn" data-a="closeModal">Continue</button>`); return; }
  if (p.type === 'note') { UI.modal(`<h2>${esc(p.title)}</h2><p>${esc(p.text)}</p><button class="btn" data-a="closeModal">Continue</button>`); return; }
  if (p.type === 'love') { UI.modal(`<div class="eyebrow">${esc(s.love.name)}</div><h2>Will you marry me?</h2><div class="btns"><button class="btn" data-a="loveYes">Yes</button><button class="btn ghost" data-a="loveNo">Not yet</button></div>`, { noClose: true }); return; }
  UI.nextPending();
};
UI.renderCeremony = function () {
  const s = S(), c = UI.cer, show = D.AWARDS.find(a => a.id === c.p.show), r = c.p.res[c.i];
  if (!r) { UI.cer = null; UI.closeModal(); return; }
  const noms = [s.me.name + ' (' + r.film + ')'].concat(r.others.slice(0, 4)).sort();
  UI.afterModal = null;
  UI.modal(`<div class="eyebrow">${esc(show.name)} · ${c.p.res.length > 1 ? (c.i + 1) + ' of ' + c.p.res.length : 'Live'}</div><h2>${esc(r.cat)}</h2>
    ${c.open ? (r.won ? `<div class="scene3d" id="aw3d"></div>` : '') : ''}
    <div class="news">${noms.map(n => `<div class="${n.startsWith(s.me.name + ' (') ? 'you' : ''}">${esc(n)}</div>`).join('')}</div>
    ${c.open ? `<div class="envelope"><div class="eyebrow">And the ${show.id === 'razzies' ? 'Razzie' : 'award'} goes to</div><div class="winner">${esc(r.winner)}</div>${r.won && show.id !== 'razzies' ? `<p class="small muted">Your speech:</p><div class="btns" style="justify-content:center"><button class="btn sm" data-a="speech" data-v="thanks">Thank everyone</button><button class="btn sm dark" data-a="speech" data-v="moment">Speak about something bigger</button><button class="btn sm dark" data-a="speech" data-v="funny">Make them laugh</button></div>` : `<button class="btn" data-a="cerNext">${c.i + 1 < c.p.res.length ? 'Next category' : 'Continue'}</button>`}</div>`
      : `<div class="envelope"><button class="btn" data-a="cerOpen">Open the envelope</button></div>`}`, { noClose: true });
  if (c.open && r.won) { const el = $('#aw3d'); if (el && window.L3 && L3.available()) L3.scene(el, Object.assign({}, s.look, { top: s.me.cat === 's' ? 'gown' : 'tux', topColor: s.me.cat === 's' ? '#8f1d2c' : '#15151b' }), { mode: 'awards', win: true }); else if (el) el.remove(); }
};

// ------------------------------------------------------------------ cinematic event cards
const L3set = j => window.L3 && L3.setFor ? L3.setFor(j) : 'home';
UI.castLooks = (names, suits) => (names || []).filter(Boolean).slice(0, 2).map(n => { const a = D.ACTORS.find(x => x[0] === n); if (!window.L3 || !L3.lookFor) return null; return L3.lookFor(n, Object.assign({ fem: a ? a[1] === 's' : undefined }, suits ? { top: 'suit' } : {})); }).filter(Boolean);
UI.costume = (j, set) => {
  const s = S(); const lk = Object.assign({}, s.look); if (!j) return lk; const fem = s.me.cat === 's';
  const F = j.fid ? D.FRANCHISES.find(f => f.id === j.fid) : null;
  if (F && (F.kind === 'superhero' || F.kind === 'animation')) return Object.assign(lk, { top: 'hero', topColor: F.color, accColor: '#d8b04a' });
  if (set === 'period' || set === 'castle') return Object.assign(lk, fem ? { top: 'gown', topColor: set === 'castle' ? '#2f5d50' : '#5a1d24' } : { top: 'suit', topColor: '#2a221a', accColor: '#8f1d2c' });
  if (set === 'space') return Object.assign(lk, { top: 'jacket', topColor: '#c0c4cc', bottom: 'slacks', bottomColor: '#c0c4cc', shoes: 'boots', shoesColor: '#3a3f4c' });
  if (set === 'desert') return Object.assign(lk, { top: 'jacket', topColor: '#8a6a4f', bottom: 'slacks', bottomColor: '#5b4a3a', shoes: 'boots', shoesColor: '#3a2a1a' });
  if (set === 'street' && ['action', 'thriller'].includes(j.genre)) return Object.assign(lk, { top: 'jacket', topColor: '#1d1d24', bottom: 'leather', bottomColor: '#111', shoes: 'boots', shoesColor: '#111' });
  return lk;
};
UI.eventCard = function (o) {
  UI.ev = o; UI.evCtl = null;
  UI.modal(`<div class="scene3d tall" id="ev3d"><div class="titlecard"><div class="tc-small">${esc(o.small || '')}</div><div class="tc-big">${esc(o.big || '')}</div></div></div>
    <div class="eyebrow">${esc(o.kicker || '')}</div><h2>${esc(o.title)}</h2>${o.sub ? `<div class="small muted">${o.sub}</div>` : ''}
    <div id="ev-body"><div class="choices" style="margin-top:10px">${o.choices.map((c, i) => `<button class="choice" data-a="evPick" data-i="${i}">${esc(c)}</button>`).join('')}</div></div>`, { noClose: true });
  const el = $('#ev3d'); if (el && window.L3 && L3.available()) UI.evCtl = L3.scene(el, o.look || S().look, Object.assign({ mode: 'set' }, o.scene || {})); else if (el) el.classList.add('noscene');
};
UI.evPick = function (i) {
  const o = UI.ev; if (!o || o.done) return; o.done = true; UI.cur = null;
  const r = o.pick(i) || {}; save();
  const txt = r.text || ''; const good = r.good != null ? r.good : !/-\d|annoyed|cools|hurt|lost|wrong|did not|not quite|backfire|\$-/i.test(txt);
  if (UI.evCtl && UI.evCtl.react) UI.evCtl.react(good);
  const parts = txt ? (/[+-]\d|likes|annoyed|warms|cools|Followers/.test(txt) ? txt.split(', ') : [txt.replace(/\.$/, '')]) : [];
  const isFx = x => /[+-]\d|likes|annoyed|warms|cools|contact|Followers|\$|edge|casting call/i.test(x);
  const chips = parts.filter(isFx), prose = parts.filter(x => !isFx(x));
  $('#ev-body').innerHTML = `<div class="ev-result ${good ? 'good' : 'bad'}"><b>${esc(r.headline || o.choices[i])}</b>${prose.length ? `<p class="small">${esc(prose.join('. '))}.</p>` : ''}${chips.length ? `<div class="btns" style="margin-top:6px">${chips.map(c => `<span class="pill ${/-\d|annoyed|cools/.test(c) ? 'bad' : 'good'}">${esc(c)}</span>`).join('')}</div>` : ''}${r.html || ''}</div><button class="btn" data-a="closeModal" style="margin-top:12px">Continue</button>`;
  UI.afterModal = () => UI.nextPending(); flushAch();
};

// ------------------------------------------------------------------ trailers
UI.trailerCards = j => {
  const s = S(); const lines = D.TRAILER_LINES[j.genre] || D.TRAILER_LINES.drama; const rel = j.released != null ? j.released : s.week + (j.left || 0);
  const when = j.tv ? `Streaming ${FC.monthYear(s, rel)}` : j.theater ? 'Now playing' : `Only in theaters ${FC.monthYear(s, rel)}`;
  return [`${j.studio.split(',')[0]} presents`, j.director ? `From director ${j.director.name}` : lines[1 % lines.length], lines[0], lines[2 % lines.length] || lines[0], [s.me.name].concat((j.costars || []).slice(0, 2)).join('   ·   '), j.title, when];
};
UI.playTrailer = function (j, fresh) {
  const s = S(); const set = L3set(j);
  UI.modal(`<div class="eyebrow">${fresh ? 'Trailer drop' : 'Watch the trailer'}</div><h2>${esc(j.title)}</h2>
    <div class="trailer" id="tr"><div class="tr-view" id="trv"></div><div class="tr-card" id="tr-card"></div><button class="btn sm dark tr-skip" data-a="trSkip">Skip</button></div><div id="tr-after"></div>`, { noClose: true });
  const card = $('#tr-card');
  const end = () => { const t = j.trailer; const after = $('#tr-after'); if (!after) return; card.className = 'tr-card show title'; card.textContent = j.title;
    after.innerHTML = `<div class="bigstat"><div><b>${FC.num(t.views)}</b><span>Views in 24h</span></div><div><b>${t.react}%</b><span>Liked it</span></div><div><b>${FC.buzz(s, j)}</b><span>Buzz</span></div></div>
      ${(t.react >= 60 ? D.FAN_POSTS.good : t.react >= 40 ? D.FAN_POSTS.mixed : D.FAN_POSTS.bad).slice(0, 2).map(x => `<div class="post"><b>@${['trailerwatch', 'filmtok', 'boxofficebuzz'][Math.floor(Math.random() * 3)]}</b><div>${esc(x)}</div></div>`).join('')}
      <div class="btns" style="margin-top:10px"><button class="btn dark" data-a="trAgain" data-id="${j.id}">Watch again</button><button class="btn" data-a="closeModal">${fresh ? 'Continue' : 'Close'}</button></div>`;
    if (fresh) UI.afterModal = () => UI.nextPending(); };
  if (!window.L3 || !L3.available()) { const cards = UI.trailerCards(j); let k = 0; const step = () => { if (!$('#tr-card')) return; if (k >= cards.length) return end(); card.className = 'tr-card show' + (k === cards.length - 2 ? ' title' : ''); card.textContent = cards[k++]; setTimeout(step, 1300); }; step(); return; }
  const F = j.fid ? D.FRANCHISES.find(f => f.id === j.fid) : null;
  UI.trCtl = L3.trailer($('#trv'), { look: UI.costume(j, set), cast: UI.castLooks(j.costars), set, genre: j.genre, color: F ? F.color : null, cards: UI.trailerCards(j),
    onCard: (txt, kind, black) => { if (!$('#tr-card')) return; card.className = 'tr-card' + (txt ? ' show' : '') + (kind === 'title' ? ' title' : '') + (black ? ' black' : ''); card.textContent = txt || ''; },
    onEnd: () => { const sk = document.querySelector('.tr-skip'); if (sk) sk.remove(); end(); } });
};

// ------------------------------------------------------------------ ending and extras
UI.renderEnding = function () {
  const s = S(); const e = s.ended; document.body.classList.add('titlemode'); if (window.L3) L3.stop();
  const wins = s.awards.filter(a => a.won && a.weight);
  $('#main').innerHTML = `<div class="card hl center"><div class="eyebrow">Career over · ${Math.round(s.week / 52)} years</div>${UI.portrait(s.look)}<h1 style="margin-top:10px">${esc(s.me.name)}</h1><h2 class="gold">${esc(e.t)}</h2><p>${esc(e.d)}</p>
    <p class="small">${D.GOALS.find(g => g.id === s.me.goal).name}: ${e.goal ? '<span class="good">achieved</span>' : '<span class="muted">not achieved</span>'}</p>
    <div class="bigstat"><div><b>${s.credits.length}</b><span>Credits</span></div><div><b>${M(s.lifetimeBO)}</b><span>Box office</span></div><div><b>${wins.length}</b><span>Major awards</span></div></div>
    <p class="small muted">${wins.map(a => esc(a.short + ' · ' + a.cat + ' (' + a.film + ')')).join('<br>')}</p>
    <div class="btns" style="justify-content:center"><button class="btn" data-a="toTitle">Back to title</button><button class="btn dark" data-a="endTimeline">Read timeline</button></div></div>`;
};
UI.help = () => UI.modal(`<h2>How to play</h2>${D.HELP.map(h => `<h3>${h[0]}</h3><p class="small">${h[1]}</p>`).join('')}<button class="btn" data-a="closeModal">Close</button>`);
UI.hof = () => { const h = FC.hof(); UI.modal(`<h2>Hall of Fame</h2>${h.length ? h.map(x => `<div class="row"><div class="grow"><b>${esc(x.name)}</b><small>${esc(x.end)} · ${x.years} years · ${x.credits} credits · ${M(x.bo)} box office${x.oscars ? ' · ' + x.oscars + ' Oscar' + (x.oscars > 1 ? 's' : '') : ''}</small></div></div>`).join('') : '<p class="empty">Retire a career to see it here.</p>'}<button class="btn" data-a="closeModal">Close</button>`); };

// ------------------------------------------------------------------ actions
const A = {
  newGame: d => UI.newGame(+d.slot),
  continue: d => { const s = FC.load(+d.slot); if (!s) return; UI.S = s; UI.tab = 'home'; s.ended ? UI.renderEnding() : (UI.render(), s.live ? UI.renderLive() : UI.nextPending()); },
  delSlot: d => { if (UI.delArm === d.slot) { FC.del(+d.slot); UI.delArm = null; UI.title(); } else { UI.delArm = d.slot; UI.toast('Tap ✕ again to delete this save.'); } },
  whatsNew: () => UI.whatsNew(),
  checkNow: () => { UI.checkUpdate(); setTimeout(() => { if (!document.getElementById('update')) UI.toast(`You're on the latest version (${window.FC_BUILD || 1}).`); }, 1500); },
  applyUpdate: d => { try { if (UI.S) FC.save(UI.S); } catch (e) { } location.replace(location.pathname + '?v=' + d.v + '&t=' + Date.now()); },
  hof: () => UI.hof(), help: () => UI.help(), closeModal: () => UI.closeModal(), toTitle: () => UI.title(),
  crBack: () => { if (UI.cr.step === 0) return UI.title(); UI.cr.step--; UI.renderCreator(); },
  crNext: () => { const c = UI.cr; if (c.step === 0 && !c.name.trim()) { UI.toast('Enter a name.'); return; }
    if (c.step === 3) { if (c.traits.length < 2) return UI.toast('Pick two personality traits.');
      const st = D.STORIES.find(x => x.id === c.story);
      const S0 = FC.newGame({ slot: c.slot, name: c.name.trim(), pronoun: c.pronoun, cat: c.cat, age: c.age, city: c.city, diff: c.diff, story: c.story, look: c.look, traits: c.traits, goal: c.goal });
      for (const [k, v] of Object.entries(c.alloc)) S0.skills[k] = st.skills[k] + v; if (c.diff === 'easy') S0.money = Math.round(S0.money * 1.5);
      UI.S = S0; UI.cr = null; UI.tab = 'home'; save(); if (window.L3) L3.stop(); UI.prevCtl = null; UI.render(); return; }
    c.step++; if (window.L3) L3.stop(); UI.prevCtl = null; UI.renderCreator(); },
  crStory: d => { UI.cr.story = d.id; UI.renderCreator(); },
  crTrait: d => { const t = UI.cr.traits; if (t.includes(d.id)) t.splice(t.indexOf(d.id), 1); else { if (t.length >= 2) t.shift(); t.push(d.id); } UI.renderCreator(); },
  crGoal: d => { UI.cr.goal = d.id; UI.renderCreator(); },
  crSkill: d => { const c = UI.cr; const used = Object.values(c.alloc).reduce((a, v) => a + v, 0); const v = +d.v; if (v > 0 && used >= POINTS) return; c.alloc[d.k] = Math.max(0, (c.alloc[d.k] || 0) + v); UI.renderCreator(); },
  crLook: d => { UI.cr.look[d.k] = d.v; updateLookUI(UI.cr.look, 'cr'); },
  crLookTab: d => { UI.cr.ltab = d.t; updateLookUI(UI.cr.look, 'cr'); },
  meLook: d => { S().look[d.k] = d.v; if (window.L3) L3.portraitCache = {}; save(); updateLookUI(S().look, 'me'); },
  meLookTab: d => { UI.ltab = d.t; updateLookUI(S().look, 'me'); },
  go: d => { UI.tab = d.tab; UI.render(); window.scrollTo(0, 0); },
  sub: d => { UI.sub[d.g] = d.s; UI.tab = d.g; UI.render(); },
  tut: () => { S().tut++; save(); UI.render(); },
  act: d => after(FC.doActivity(S(), d.id)),
  castFilter: d => { UI.castFilter = d.f; UI.render(); },
  prep: d => after(FC.prep(S(), d.id)),
  audition: d => UI.startAudition(d.id),
  audNext: () => { UI.aud.step++; UI.renderAudition(); },
  audTone: d => { UI.aud.tones.push(d.t); UI.aud.step++; UI.renderAudition(); },
  audChem: d => { UI.aud.chem = d.c; UI.renderAudition(); },
  audScreen: d => { UI.aud.screen = d.c; if (window.L3) L3.stop(); UI.renderAudition(); },
  negotiate: d => UI.startNegotiation(d.id),
  negSend: () => { const s = S(), n = UI.neg; const r = FC.negotiate(s, n.pid, n.ask);
    if (r.result === 'accept') { const res = FC.sign(s, n.pid, r.terms); UI.closeModal(true); UI.neg = null; UI.toast(res.ok ? `Deal! ${res.t}` : res.t); flushAch(); save(); UI.render(); return; }
    if (r.result === 'walk') { UI.closeModal(true); UI.neg = null; UI.toast('They walked away from the table.'); save(); UI.render(); return; }
    n.counter = r.counter; n.msg = 'They came back with a counteroffer.'; n.msgCls = 'gold'; UI.renderNegotiation(); },
  negAcceptCounter: () => { const s = S(), n = UI.neg; const res = FC.sign(s, n.pid, n.counter); UI.closeModal(true); UI.neg = null; UI.toast(res.ok ? `Deal! ${res.t}` : res.t); flushAch(); save(); UI.render(); },
  negTake: () => { const s = S(), n = UI.neg; const p = (s.offers || []).find(x => x.id === n.pid); const res = FC.sign(s, n.pid, p.deal.base); UI.closeModal(true); UI.neg = null; UI.toast(res.ok ? `Signed. ${res.t}` : res.t); flushAch(); save(); UI.render(); },
  decline: d => { const t = FC.declineOffer(S(), d.id); UI.closeModal(true); UI.neg = null; UI.toast(t); save(); UI.render(); },
  endWeek: () => UI.endWeek(),
  stageAud: d => UI.startStageAud(d.id),
  stagePrep: d => after(FC.stagePrep(S(), d.id)),
  stageReg: d => { UI.stageReg = d.v; UI.render(); }, stageType: d => { UI.stageType = d.v; UI.render(); },
  saudNext: () => { if (window.L3) L3.stop(); UI.saud.step++; UI.renderStageAud(); },
  saudPiece: d => { UI.saud.piece = d.v; UI.saud.step++; UI.renderStageAud(); },
  saudTone: d => { UI.saud.tones.push(d.v || d.t); UI.saud.step++; UI.renderStageAud(); },
  saudThird: d => { UI.saud.third = d.v; UI.renderStageAud(); },
  goWork: () => { UI.closeModal(true); UI.tab = 'work'; UI.render(); },
  endWeekForce: () => { UI.closeModal(true); UI.endWeek(true); },
  effortEnd: d => { const r = FC.setEffort(S(), d.j, d.v); if (!r.ok) return UI.toast(r.t); save(); if (FC.needsEffort(S()).length) { UI.endWeek(); } else { UI.closeModal(true); UI.endWeek(true); } },
  doPrep: d => after(FC.doPrep(S(), d.j, d.id)),
  effort: d => after(FC.setEffort(S(), d.j, d.v)),
  extra: d => after(FC.shootExtra(S(), d.j, d.id)),
  pressDo: d => { const r = FC.doPress(S(), d.j, d.id, d.v); if (r.live) { const l = FC.livePress(S(), d.j, d.id); if (!l.ok) return UI.toast(l.t); save(); UI.render(); UI.renderLive(); return; } after(r); },
  review: d => UI.review(d.id),
  resolve: d => { const s = S(); const out = FC.resolve(s, UI.cur, +d.i); UI.cur = null; save();
    if (out && typeof out === 'object') UI.modal(`<div class="eyebrow">Opening night reviews</div><h2>${esc(out.text)}</h2><div class="bigstat"><div><b>${out.critics}%</b><span>Critics</span></div></div>${out.quotes.map(q => `<div class="quote ${q.good ? 'good' : 'bad'}">"${esc(q.t)}"<small>${esc(q.o)}</small></div>`).join('')}<button class="btn" data-a="closeModal">Continue</button>`);
    else UI.modal(`<p>${esc(out || 'Noted.')}</p><button class="btn" data-a="closeModal">Continue</button>`);
    UI.afterModal = () => UI.nextPending(); },
  evPick: d => UI.evPick(+d.i),
  trSkip: () => { if (UI.trCtl && UI.trCtl.skip) UI.trCtl.skip(); },
  trAgain: d => { const s = S(); const j = s.jobs.find(x => x.id === d.id) || s.credits.find(x => x.id === d.id); if (j) { const f = UI.afterModal; UI.afterModal = null; UI.playTrailer(j, false); UI.afterModal = f; } },
  watchTrailer: d => { const s = S(); const j = s.jobs.find(x => x.id === d.id) || s.credits.find(x => x.id === d.id); if (j) UI.playTrailer(j, false); },
  tvMoment: d => { const p = UI.cur; UI.cur = null; const out = FC.tvMoment(S(), p.id, p.ev, +d.i); save(); UI.modal(`<p>${esc(out || 'Noted.')}</p><button class="btn" data-a="closeModal">Continue</button>`); UI.afterModal = () => UI.nextPending(); },
  tvFinale: d => { const p = UI.cur; UI.cur = null; const out = FC.tvFinale(S(), p.id, d.v); save(); UI.modal(`<p>${esc(out)}</p><button class="btn" data-a="closeModal">Continue</button>`); UI.afterModal = () => UI.nextPending(); },
  live: d => { const r = FC.liveStart(S(), d.id); if (!r.ok) return UI.toast(r.t); save(); UI.render(); UI.renderLive(); },
  liveNext: () => { FC.liveNext(S()); save(); UI.renderLive(); },
  liveChoose: d => { const r = FC.liveChoose(S(), +d.i); save(); UI.renderLive(r); },
  liveAfter: () => UI.renderLive(),
  liveFinish: () => { const r = FC.liveFinish(S()); save(); UI.render(); flushAch(); UI.liveDone(r); },
  cerOpen: () => { UI.cer.open = true; UI.renderCeremony(); },
  cerNext: () => { if (window.L3) L3.stop(); UI.cer.i++; UI.cer.open = false; if (!UI.cer.p.res[UI.cer.i]) { UI.cer = null; UI.closeModal(true); UI.nextPending(); return; } UI.renderCeremony(); },
  speech: d => { const s = S(); if (d.v === 'moment') { s.rep = Math.min(100, s.rep + 2); FC.addNews(s, `${s.me.name}'s acceptance speech is the talk of the night.`, 'you'); } if (d.v === 'funny') { FC.gainFame(s, 1); s.followers += 100000; } if (d.v === 'thanks') s.happy = Math.min(100, s.happy + 3);
    UI.toast(d.v === 'funny' ? 'The room roared.' : d.v === 'moment' ? 'A standing ovation.' : 'You thanked your team, your family, and your first acting teacher.'); A.cerNext(); },
  inbox: d => { const t = FC.answerInbox(S(), d.id, d.c); if (t) UI.toast(t); flushAch(); save(); UI.render(); },
  fyc: d => after(FC.campaign(S(), d.id, +d.v)),
  startCo: () => { const v = ($('#co-name') || {}).value; after(FC.startCompany(S(), v)); },
  develop: () => { const r = FC.develop(S(), { script: $('#dv-script').value, budget: $('#dv-budget').value, star: $('#dv-star').checked, direct: $('#dv-direct').checked }); after(r); },
  frSel: d => { UI.frSel = d.id; UI.render(); },
  invest: d => after(FC.investIn(S(), d.id, +d.v)), withdraw: d => after(FC.withdraw(S(), d.id)), donate: d => after(FC.donate(S(), +d.v)),
  buyCar: d => after(FC.buyCar(S(), d.id)), home: d => after(FC.buyHome(S(), d.id)), sellHome: d => { FC.sellHome(S(), d.id); after({ t: 'Sold.' }); },
  agency: d => after(FC.signAgency(S(), d.id)), hire: d => after(FC.hire(S(), d.id, +d.l)),
  loveDate: () => after({ t: FC.loveDate(S()) }), breakUp: () => { FC.breakUp(S()); after({ t: 'It is over.' }); },
  loveYes: () => { FC.loveAnswer(S(), true); UI.closeModal(); after({ t: 'Engaged!' }); }, loveNo: () => { FC.loveAnswer(S(), false); UI.closeModal(); },
  toggle3d: () => { try { const off = localStorage.getItem('fc-3d') === 'off'; localStorage.setItem('fc-3d', off ? 'on' : 'off'); } catch (e) { } if (window.L3) { L3.ok = null; L3.stop(); } UI.render(); },
  saveQuit: () => { save(); UI.title(); },
  retireAsk: () => UI.modal(`<h2>Retire?</h2><p>This ends your career for good.</p><div class="btns"><button class="btn red" data-a="retire">Retire</button><button class="btn ghost" data-a="closeModal">Keep going</button></div>`),
  endTimeline: () => UI.modal(`<h2>Career timeline</h2><div class="news">${S().timeline.slice().reverse().map(t => `<div><small>${FC.dateLabel(S(), t.w)}</small>${esc(t.t)}</div>`).join('')}</div><button class="btn" data-a="closeModal">Close</button>`),
  retire: () => { UI.closeModal(true); FC.retire(S()); save(); UI.renderEnding(); },
};
function onClick(e) {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const f = A[el.dataset.a]; if (!f) return; e.preventDefault(); f(el.dataset, el);
}
function onInput(e) {
  const t = e.target; const c = UI.cr;
  if (c && t.id === 'cr-name') c.name = t.value;
  if (c && t.id === 'cr-pro') { c.pronoun = t.value; if (t.value === 'he') c.cat = 'a'; if (t.value === 'she') c.cat = 's'; if (e.type === 'change') UI.renderCreator(); }
  if (c && t.id === 'cr-cat') c.cat = t.value;
  if (c && t.id === 'cr-age') { c.age = +t.value; const l = t.previousElementSibling; if (l) l.innerHTML = `Age <b>${c.age}</b>`; }
  if (c && t.id === 'cr-city') c.city = t.value;
  if (c && t.id === 'cr-diff') c.diff = t.value;
  const n = UI.neg; if (n) {
    if (t.id === 'ng-sal') { n.ask.salary = +t.value; t.previousElementSibling.querySelector('b').textContent = M(n.ask.salary); }
    if (t.id === 'ng-pts') { n.ask.points = +t.value; t.previousElementSibling.querySelector('b').textContent = n.ask.points; }
    if (t.id === 'ng-pics') { n.ask.pictures = +t.value; t.previousElementSibling.querySelector('b').textContent = n.ask.pictures; }
    if (t.id === 'ng-bill') n.ask.billing = t.value;
    if (t.dataset.perk && e.type === 'change') { const k = t.dataset.perk; n.ask.perks = n.ask.perks.filter(x => x !== k); if (t.checked) n.ask.perks.push(k); }
    negRead();
  }
}
})();
