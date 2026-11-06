/* Dream Academy: Story Mode. Interface. */
(function () {
const D = window.DA, G = window.G;
const UI = window.UI = {};
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const app = () => $('#app');
let tab = 'plan', setup = { mode:'real', focus:'sophia' };
try { tab = localStorage.getItem('da-tab') || 'plan'; } catch (e) {}
const S = () => G.S();
/* Device settings (not part of a save). */
const SET = Object.assign({ gfx:'high', vol:.8, music:true, text:'m', calm:false, statsOnly:false, tips:true }, (() => { try { return JSON.parse(localStorage.getItem('da-settings')) || {}; } catch (e) { return {}; } })());
try { if (matchMedia('(prefers-reduced-motion: reduce)').matches && localStorage.getItem('da-settings') == null) SET.calm = true; } catch (e) {}
function applySet() {
  try { localStorage.setItem('da-settings', JSON.stringify(SET)); } catch (e) {}
  if (window.S3) { S3.gfx = SET.gfx; S3.calm = SET.calm; }
  if (window.MG) { MG.setVol(SET.vol); MG.statsOnly = SET.statsOnly; }
  document.body.classList.toggle('t-s', SET.text === 's'); document.body.classList.toggle('t-l', SET.text === 'l'); document.body.classList.toggle('calm', SET.calm);
}
applySet();
let musicOn = false;
document.addEventListener('pointerdown', () => { if (!musicOn && SET.music && window.MG) { musicOn = true; MG.music(true); } }, { once:false });
let logKind = 'all', logWho = 'all', undoSnap = null;

/* ---------- Avatars: stylized busts drawn from each person's look ---------- */
const ERA_COL = { 'Bright Pop':'#d9a441', 'Dance Break':'#c2413b', 'Girl Crush':'#3b3f8f', 'Soft Ballad':'#8a9bb0', 'Experimental':'#5d8a3a', 'Y2K Revival':'#b84f9c',
  'Dark Pop':'#2a2a33', 'Live Band':'#8a4b2a', 'Latin Crossover':'#c8572e', 'Unplugged':'#a28766', 'Disco Revival':'#b39237', 'Hyperpop':'#5bb3c4' };
function outfit(id) {
  const s = S(), p = s && s.people[id];
  if (!p || p.status === 'trainee' || p.status === 'cut') return '#3a3f4a';
  const r = s.group.releases[s.group.releases.length - 1];
  return r ? (ERA_COL[r.concept] || '#4b4f5a') : '#4b4f5a';
}
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(Math.min(255, r * f)); g = Math.round(Math.min(255, g * f)); b = Math.round(Math.min(255, b * f)); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
function av(id, size, cls) {
  const s = S(), L = (s && s.people[id] ? s.people[id].look : G.CAST[id].look), sk = L.skin, h = L.hair, st = L.style, o = outfit(id);
  let back = '', front = '';
  if (st === 'long') { back = '<path d="M28 40 Q28 18 50 17 Q72 18 72 40 L75 92 L25 92 Z" fill="' + h + '"/>'; }
  if (st === 'wavy') { back = '<path d="M27 40 Q27 17 50 16 Q73 17 73 40 Q78 52 72 62 Q79 72 73 82 Q77 88 74 92 L26 92 Q23 88 27 82 Q21 72 28 62 Q22 52 27 40 Z" fill="' + h + '"/>'; }
  if (st === 'curly') { back = [[30,30,11],[42,21,11],[58,21,11],[70,30,11],[25,46,11],[75,46,11],[27,62,11],[73,62,11],[31,76,10],[69,76,10]].map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + h + '"/>').join(''); }
  if (st === 'bob') { back = '<path d="M28 42 Q28 18 50 17 Q72 18 72 42 L73 64 Q62 68 50 66 Q38 68 27 64 Z" fill="' + h + '"/>'; }
  if (st === 'pony') { back = '<path d="M30 40 Q30 19 50 18 Q70 19 70 40 L68 50 L32 50 Z" fill="' + h + '"/><path d="M66 24 Q86 30 80 62 Q76 76 70 80 Q74 60 68 40 Z" fill="' + h + '"/>'; }
  if (st === 'bun') { back = '<circle cx="50" cy="13" r="10" fill="' + h + '"/><path d="M30 40 Q30 19 50 18 Q70 19 70 40 L68 48 L32 48 Z" fill="' + h + '"/>'; }
  front = st === 'curly' ? '<path d="M33 34 Q40 22 50 24 Q60 22 67 34 Q60 28 50 30 Q40 28 33 34 Z" fill="' + h + '"/>'
    : st === 'bob' ? '<path d="M32 38 Q34 22 50 22 Q66 22 68 38 Q58 30 50 31 Q42 30 32 38 Z" fill="' + h + '"/>'
    : '<path d="M32 40 Q33 21 50 21 Q67 21 68 40 Q63 30 52 28 Q44 33 32 40 Z" fill="' + h + '"/>';
  const svg = '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' +
    '<rect width="100" height="100" fill="#1b1e23"/>' + back +
    '<path d="M14 100 Q16 78 36 74 L64 74 Q84 78 86 100 Z" fill="' + o + '"/><path d="M42 64 L58 64 L58 76 Q50 80 42 76 Z" fill="' + shade(sk, .9) + '"/>' +
    '<ellipse cx="50" cy="45" rx="17" ry="21" fill="' + sk + '"/>' + front +
    '<ellipse cx="43" cy="47" rx="2" ry="2.4" fill="#1a1414"/><ellipse cx="57" cy="47" rx="2" ry="2.4" fill="#1a1414"/>' +
    '<path d="M39 41 Q43 39 46 41" stroke="' + shade(h, 1.2) + '" stroke-width="1.4" fill="none"/><path d="M54 41 Q57 39 61 41" stroke="' + shade(h, 1.2) + '" stroke-width="1.4" fill="none"/>' +
    '<path d="M46 57 Q50 59.5 54 57" stroke="#7a3b3b" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
  return '<span class="av ' + (cls || '') + '" style="width:' + size + 'px;height:' + size + 'px">' + svg + '</span>';
}
UI.av = av;
function fig3(id, i) { const L = G.p(id).look, o = outfit(id); return { id, look:L, outfit:o, pants:i % 2 === 0, accent:o === '#3a3f4a' ? '#e5484d' : null }; }
function cast3(ids) { return ids.map(fig3); }
function stageCast() { const s = S(); return G.debuted() ? G.activeMembers() : [s.focus].concat(G.trainees().filter(x => x !== s.focus).slice(0, 4)).filter(G.inPlay); }
function mgOpts(v, kind) {
  const s = S();
  let ids = v.cast || (v.mgCast === 'focus' ? [s.focus] : stageCast());
  if (!G.inPlay(s.focus) && v.mgCast === 'focus') ids = [G.cast()[0]];
  const o = { cast:cast3(ids), set:v.set, light:s.group.light || '#f0b44c', tint:outfitTint(), skill:G.inPlay(s.focus) ? G.avg(s.focus) : 50,
    title:v.title, chants:D.chants.map(c => c.replace(/\{g\}/g, s.group.formed ? s.group.name : 'DREAM ACADEMY').replace(/\{n\}/g, G.name(pickOf(ids)))), focusIdx:Math.max(0, ids.indexOf(s.focus)) };
  if (v.set === 'eval') o.judges = D.judges.map(j => ({ look:j.look, outfit:j.outfit, pants:true }));
  return o;
}
function pickOf(a) { return a[Math.floor(Math.random() * a.length)]; }
function outfitTint() { const s = S(), r = s.group.releases[s.group.releases.length - 1]; return r ? (ERA_COL[r.concept] || '#e5484d') : '#e5484d'; }
async function runGame(kind, o) {
  if (!window.MG) return null;
  const acc = await MG.run(kind, o);
  G.noteGame(kind, acc);
  if (kind === 'write' && acc != null && MG.last.hook) G.setHook(MG.last.hook);
  G.save();
  return acc;
}
UI.runGame = runGame;

/* ---------- Helpers ---------- */
function bar(v, cls) { return '<span class="bar ' + (cls || '') + '"><i style="width:' + Math.max(0, Math.min(100, v)) + '%"></i></span>'; }
function pad3(n) { return String(n).padStart(3, '0'); }
function tag(t, cls) { return '<span class="tag ' + (cls || '') + '">' + esc(t) + '</span>'; }
function statusTags(id) {
  const p = G.p(id), out = [];
  if (id === S().focus) out.push(tag('Focus', 'focus'));
  if (p.hiatus) out.push(tag('On a break', 'calm'));
  if (p.warn) out.push(tag('Eval warning', 'warn'));
  if (p.status === 'solo') out.push(tag('Solo', 'calm'));
  if (p.status === 'cut') out.push(tag(({ M1:'Out at Mission 1', M2:'Out at Mission 2', M3:'Out at Mission 3', W:'Withdrew', F:'Out at the finale' })[p.out] || 'Left the show'));
  if (p.wb < 30 && !p.hiatus && G.inPlay(id)) out.push(tag('Low Wellbeing', 'bad'));
  return out.join('');
}
function toast(t) { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2400); }

/* ---------- Title and setup ---------- */
UI.start = () => { if (G.load()) title(true); else title(false); };
function slotsHtml() {
  return '<div class="slots">' + G.slots().map(x => '<div class="slot' + (x.n === G.slot() ? ' cur' : '') + '"><div><b>Slot ' + x.n + '</b><span class="small faint">' +
    (x.month ? 'Month ' + pad3(x.month) + ' · ' + esc(G.name(x.focus)) + (x.group ? ' · ' + esc(x.group) : '') + ' · ' + esc(G.DIFF[x.diff].l) + (x.ended ? ' · ended' : '') : 'Empty') + '</span></div>' +
    (x.month ? '<button class="btn sm" data-slot="' + x.n + '">Play</button>' : '<button class="btn sm ghost" data-newslot="' + x.n + '">New</button>') + '</div>').join('') + '</div>';
}
function title(hasSave) {
  app().innerHTML = '<section class="title">' +
    '<div class="slate"><span class="rec">REC</span><span class="mono">TAPE 01 · FAN-MADE</span></div>' +
    '<h1>Dream Academy<br><span>Story Mode</span></h1>' +
    '<p class="lead">120,000 auditions. Twenty trainees. Three missions, one live finale, six names. Then the hard part: twelve years of being a group.</p>' +
    '<div class="stage3d title3d" id="t3d"></div>' +
    '<div class="cast-strip">' + D.cast.map(c => av(c.id, 44)).join('') + '</div>' +
    (hasSave ? '<button class="btn big" data-a="continue">Continue · Slot ' + G.slot() + ' · Month ' + S().month + '</button>' : '') +
    '<button class="btn big ' + (hasSave ? 'ghost' : '') + '" data-a="new">New run in slot ' + G.slot() + '</button>' +
    '<h3>Save slots</h3>' + slotsHtml() +
    '<button class="btn ghost sm" data-a="settings">Settings</button>' +
    '<p class="notice">Unofficial fan game. Not affiliated with HYBE, Geffen, Netflix or any of the people in it. It uses real names and stylized looks; songs, eras, scores and drama are invented, and it never invents bullying, scandals or health crises for anyone.</p>' +
    '</section>';
  if (window.S3) { const c = S3.attach($('#t3d'), 'title', { set:'stage', orbit:true, light:'#f0b44c', tint:'#e5484d',
      cast:D.cast.filter(c => c.real).map((c, i) => ({ id:c.id, look:c.look, outfit:'#c2413b', pants:i % 2 === 0 })) }); if (c) c.dance(true, 112); }
  app().onclick = e => {
    const sl = e.target.closest('[data-slot]'), ns = e.target.closest('[data-newslot]');
    if (sl) { G.setSlot(+sl.dataset.slot); if (G.load()) game(); return; }
    if (ns) { G.setSlot(+ns.dataset.newslot); setupScreen(); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'continue') game();
    if (a.dataset.a === 'new') { if (hasSave && !confirm('Start a new run in slot ' + G.slot() + '? The current run there will be replaced.')) return; setupScreen(); }
    if (a.dataset.a === 'settings') settingsSheet(); };
}
function setupScreen() {
  const c = D.cast;
  app().innerHTML = '<section class="title setup">' +
    '<button class="btn ghost sm" data-a="back">Back</button>' +
    '<h2>How should the show end?</h2>' +
    '<div class="seg">' +
      '<button class="choice ' + (setup.mode === 'real' ? 'on' : '') + '" data-mode="real"><b>Real result</b><span>Eliminations and the final six follow the real show. You shape everything else.</span></button>' +
      '<button class="choice ' + (setup.mode === 'open' ? 'on' : '') + '" data-mode="open"><b>Open result</b><span>Scores and votes decide who goes home and who debuts.</span></button>' +
    '</div>' +
    '<h2>Difficulty</h2><div class="seg three">' + Object.keys(G.DIFF).map(k => '<button class="choice ' + ((setup.diff || 'normal') === k ? 'on' : '') + '" data-diff="' + k + '"><b>' + G.DIFF[k].l + '</b><span>' + esc(G.DIFF[k].d) + '</span></button>').join('') + '</div>' +
    '<h2>Who do the cameras follow?</h2><p class="muted small">Your focus member. You can switch to any trainee and plan her month at any time.</p>' +
    '<div class="pickgrid">' + c.map(x => '<button class="pick ' + (setup.focus === x.id ? 'on' : '') + '" data-f="' + x.id + '">' + av(x.id, 56) + '<b>' + esc(x.first) + '</b><span>' + esc(x.from) + '</span></button>').join('') + '</div>' +
    '<button class="btn big" data-a="go">Start: Month 001</button>' +
    '</section>';
  app().onclick = e => {
    const m = e.target.closest('[data-mode]'), f = e.target.closest('[data-f]'), a = e.target.closest('[data-a]'), dd = e.target.closest('[data-diff]');
    if (dd) { setup.diff = dd.dataset.diff; setupScreen(); return; }
    if (m) { setup.mode = m.dataset.mode; setupScreen(); }
    else if (f) { setup.focus = f.dataset.f; setupScreen(); }
    else if (a && a.dataset.a === 'back') title(G.hasSave() && G.load());
    else if (a && a.dataset.a === 'go') { G.newGame(setup); try { localStorage.removeItem('dreamacademy-save-v1' + (G.slot() === 1 ? '' : '-s' + G.slot()) + '-prev'); } catch (x) {} G.save(); tab = 'plan'; game(); }
  };
}

/* ---------- Main game screen ---------- */
function game() {
  if (window.S3 && S3.cur && S3.cur.key === 'title') S3.release();
  render();
  nextEvent();
}
function stats() {
  const s = S(), deb = G.debuted();
  const cells = deb ? [['Fans', G.fmt(s.group.fans)], ['Momentum', Math.round(s.group.momentum)], ['Label', Math.round(s.label)], ['Cohesion', G.cohesion()]]
    : [['Trainees', G.trainees().length], ['Cohesion', G.cohesion()], ['Focus WB', Math.round(G.p(s.focus).wb)], ['Year', G.year()]];
  return '<div class="statline">' + cells.map(c => '<div class="st"><b>' + c[1] + '</b><span>' + c[0] + '</span></div>').join('') + '</div>';
}
function tabs() {
  const s = S(), deb = G.debuted();
  const T = [['plan','Plan'],['cast','Cast'],['drama','Drama', s.tensions.length],['feed','Feed', s.hate ? '!' : 0]].concat(deb ? [['charts','Charts']] : []).concat([['story','Real story'],['log','Log']]);
  if (!T.some(t => t[0] === tab)) tab = 'plan';
  return '<nav class="tabs" role="tablist">' + T.map(t => '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="tab ' + (tab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '">' + t[1] + (t[2] ? '<i class="badge">' + t[2] + '</i>' : '') + '</button>').join('') + '</nav>';
}
function render() {
  const s = S(); if (!s) return title(false);
  const ch = G.ch();
  const tipHtml = tipFor();
  const body0 = ({ plan:planTab, cast:castTab, drama:dramaTab, feed:feedTab, charts:chartsTab, story:storyTab, log:logTab })[tab] || planTab;
  const waiting = s.queue.length;
  const body = () => tipHtml + body0();
  app().innerHTML =
    '<header class="top"><div class="between"><div><span class="rec">REC</span> <span class="mono date">MONTH ' + pad3(s.month) + '<span class="faint">/144</span></span></div>' +
    '<div class="row"><div class="chap mono">CH ' + ch.n + '<br>' + esc(ch.name.toUpperCase()) + '</div><button class="btn ghost sm" data-a="menu">Menu</button></div></div>' + stats() + '</header>' + tabs() +
    '<main>' + body() + '</main>' +
    '<footer class="foot">' + (s.ended ? '<button class="btn big" data-a="final">The final numbers</button>'
      : waiting ? '<button class="btn big warnbtn" data-a="next">' + waiting + ' decision' + (waiting > 1 ? 's' : '') + ' waiting</button>'
      : '<div class="footrow"><button class="btn big" data-a="advance">Advance to month ' + pad3(s.month + 1) + '</button><button class="btn big ghost skipbtn" data-a="skip" title="Advance until something happens (up to 6 months)" aria-label="Skip quiet months">⏩</button></div>') + '</footer>';
  app().onclick = onClick;
  app().onchange = onChange;
  const el = $('#p3d');
  if (el && window.S3) { const ids = G.working().slice(0, 7); const sc = S3.attach(el, 'room', { set:'practice', cast:cast3(ids) }); if (sc) sc.dance(false); }
  G.takeTrophies().forEach((id, k) => { const t = D.trophies.find(x => x[0] === id); if (t) setTimeout(() => toast('Trophy: ' + t[1]), 400 + k * 2600); });
}
UI.render = render;

/* Tutorial tips: shown once each, at the top of the tab they explain. */
const TIPS = [
  ['plan', 'plan', () => true, 'Each month, pick what every trainee works on. Your focus member is planned by hand; others run on autoplay styles you can change. Then press Advance.'],
  ['train', 'plan', () => G.cast().some(G.canTrain), '"Train now" plays this month\'s lesson as a mini-game. A good score multiplies her gains for the month, up to ×1.7.'],
  ['eval', 'plan', () => S().month >= 4 && S().month <= 30, 'From month 4, every month ends with an eval. On eval day you choose a skill to show the coaches. The bottom three get a warning.'],
  ['practice', 'plan', () => S().month >= 5, 'The Practice room gives two free extra sessions a month. Use them on the skills that hold someone back.'],
  ['drama', 'drama', () => S().tensions.length > 0, 'Tensions heat up every month nobody deals with them. Sitting them down works best when their bond is decent.'],
  ['feed', 'feed', () => !!S().hate, 'A hate train costs momentum, fans and Wellbeing. If the group did nothing wrong, silence often works. A bad apology makes it worse.'],
  ['group', 'plan', () => G.debuted(), 'Now there is a group schedule. Record to build prep, release at 60 (single) or 85 (EP), promote and tour while the song is fresh, and rest before people break.'],
  ['story', 'story', () => true, 'This tab compares your run with the real group\'s first years. Match or beat 8 beats for a trophy.'],
  ['skip', 'plan', () => S().month >= 6, 'The ⏩ button skips quiet months and stops as soon as something needs you.'],
];
function tipFor() {
  const s = S(); if (!SET.tips) return '';
  const t = TIPS.find(x => x[1] === tab && !s.tips[x[0]] && x[2]());
  return t ? '<section class="card tip"><div class="between"><span class="eyebrow">Tip</span><button class="btn ghost sm" data-tip="' + t[0] + '">Got it</button></div><p class="small">' + esc(t[3]) + '</p></section>' : '';
}

/* Plan */
const ACT_SHORT = { vo:'Vocal', da:'Dance', ra:'Rap', pe:'Stage', so:'Write', ch:'Fans', bond:'Bond', rest:'Rest', solo:'Solo' };
function planTab() {
  const s = S(), deb = G.debuted();
  let h = '';
  if (deb) {
    const ep = G.effectivePlan();
    h += '<section class="card"><div class="between"><h3>Group schedule</h3><span class="mono small">PREP ' + Math.round(s.group.prep) + '</span></div>' +
      '<div class="chips">' + Object.keys(D.groupPlans).map(k => '<button class="chip ' + (s.group.plan === k ? 'on' : '') + '" data-gp="' + k + '">' + D.groupPlans[k].l + '</button>').join('') + '</div>' +
      '<p class="small muted">' + esc(D.groupPlans[s.group.plan].d) + (s.group.plan === 'tour' && ep !== 'tour' ? ' <span class="neg">No release in the last 8 months, so this will be a training month.</span>' : '') + '</p>' +
      '<div class="row">' + bar(s.group.prep, s.group.prep >= 85 ? 'ok' : '') + '<span class="small faint">60 single · 85 EP</span></div>' +
      (s.month >= 32 ? '<button class="btn ' + (G.canRelease() ? '' : 'sm ghost') + '" data-a="release" ' + (G.canRelease() ? '' : 'disabled') + '>' + (G.canRelease() ? 'Release next song' : 'Release at prep 60') + '</button>' : '<p class="small faint">The debut single is set for month 032.</p>') +
      '</section>';
  } else if (s.month < 19) {
    h += '<section class="card note"><p class="small">Training years. Each month you plan lessons, then the coaches grade everyone from D to A+. The bottom three get a warning. The survival show starts in month 019.</p></section>';
  }
  h = '<section class="card room"><div class="stage3d" id="p3d"></div><div class="between roomrow"><div><b>Practice room</b><div class="small muted">Free sessions this month: ' + s.practice + ' of 2. Drag to look around.</div></div>' +
    '<button class="btn sm" data-a="practice" ' + (s.practice > 0 && G.working().length ? '' : 'disabled') + '>Practice</button></div></section>' + h;
  const ids = G.cast().slice().sort((a, b) => (b === s.focus) - (a === s.focus) || (s.ctrl[b] === 'manual') - (s.ctrl[a] === 'manual'));
  h += '<section class="card"><div class="between"><h3>This month</h3><select class="ctrl" data-bulk aria-label="Set every autoplayed member"><option value="">Set all autoplay…</option>' + Object.keys(D.styles).map(k => '<option value="' + k + '">' + D.styles[k].l + '</option>').join('') + '</select></div>' + ids.map(id => planRow(id)).join('') + '</section>';
  return h;
}
function planRow(id) {
  const s = S(), p = G.p(id), ctrl = s.ctrl[id], manual = ctrl === 'manual';
  const cur = G.planOf(id);
  let ctl;
  if (p.hiatus) ctl = '<p class="small muted">On a break' + (p.hiatus > 0 ? ': ' + p.hiatus + ' month' + (p.hiatus > 1 ? 's' : '') + ' left' : '') + '. Wellbeing recovers 12 a month.</p>';
  else if (manual) {
    ctl = '<div class="chips acts">' + G.acts(id).map(k => '<button class="chip ' + (cur === k ? 'on' : '') + '" data-act="' + k + '" data-id="' + id + '" title="' + esc(D.acts[k].l) + '">' + ACT_SHORT[k] + '</button>').join('') + '</div>';
    const ses = s.session[id];
    if (ses) ctl += '<p class="small sess">Lesson done: ' + Math.round(ses.acc * 100) + '% · gains ×' + ses.mult.toFixed(2) + ' this month</p>';
    else if (G.canTrain(id)) ctl += '<button class="btn sm trainbtn" data-train="' + id + '">Train now: ' + esc(MG.INFO[G.MG_KIND[cur]].title.split(': ')[1]) + '</button><span class="small faint"> boosts this month\'s gains up to ×1.7</span>';
    if (cur === 'bond') { const pt = G.partnerOf(id);
      ctl += '<label class="field inline"><span>With</span><select data-partner="' + id + '">' + G.partners(id).map(o => '<option value="' + o + '"' + (o === pt ? ' selected' : '') + '>' + esc(G.name(o)) + ' (bond ' + G.bond(id, o) + ')</option>').join('') + '</select></label>'; }
  } else ctl = '<p class="small muted">Autoplay: ' + esc(D.acts[cur].l) + (cur === 'bond' ? ' with ' + esc(G.name(G.partnerOf(id) || id)) : '') + '</p>';
  return '<div class="prow">' + '<button class="pav" data-prof="' + id + '">' + av(id, 46) + '</button>' +
    '<div class="pmain"><div class="between"><div><b>' + esc(G.name(id)) + '</b> ' + statusTags(id) + G.rolesOf(id).map(r => tag(r, 'calm')).join('') + '</div>' +
    '<select class="ctrl" data-ctrl="' + id + '" aria-label="Control for ' + esc(G.name(id)) + '"><option value="manual"' + (manual ? ' selected' : '') + '>Manual</option>' +
    Object.keys(D.styles).map(k => '<option value="' + k + '"' + (ctrl === k ? ' selected' : '') + '>Auto: ' + D.styles[k].l + '</option>').join('') + '</select></div>' +
    '<div class="mini"><span>WB</span>' + bar(p.wb, p.wb < 30 ? 'bad' : p.wb < 50 ? 'warn' : '') + '<span class="mono">' + Math.round(p.wb) + '</span><span>AVG</span><span class="mono">' + Math.round(G.avg(id)) + '</span>' +
    (p.grades.length ? '<span>EVAL</span><span class="mono grade g' + p.grades[p.grades.length - 1].g.replace('+', 'p') + '">' + p.grades[p.grades.length - 1].g + '</span>' : '') + '</div>' + ctl + '</div></div>';
}

/* Cast */
function castTab() {
  const s = S();
  const inPlay = s.order.filter(G.inPlay), out = s.order.filter(id => !G.inPlay(id));
  const card = id => '<button class="ccard" data-prof="' + id + '">' + av(id, 64) + '<b>' + esc(G.name(id)) + '</b><span class="small faint">' + esc(G.CAST[id].from) + '</span><span class="tags">' + statusTags(id) + '</span></button>';
  const P = s.group.pos;
  const pos = P && G.debuted() ? '<section class="card"><h3>Positions</h3>' + D.positions.map(([k, l, sk]) => '<label class="field inline posrow"><span>' + l + '</span><select data-pos="' + k + '">' +
      G.members().map(id => '<option value="' + id + '"' + (P[k] === id ? ' selected' : '') + '>' + esc(G.name(id)) + ' (' + Math.round(G.p(id).sk[sk]) + ')</option>').join('') + '</select></label>').join('') +
    '<p class="small faint">Numbers show the skill each position needs. A position\'s skill trains 15% faster.</p>' +
    (s.group.fandom ? '<p class="small">Fandom: <b>' + esc(s.group.fandom) + '</b>' + (s.group.light ? ' · lightstick <span class="dot" style="background:' + s.group.light + '"></span>' : '') + '</p>' : '') + '</section>' : '';
  return '<section class="card"><h3>' + (G.debuted() ? esc(s.group.name) : 'Trainees') + '</h3><div class="cgrid">' + inPlay.map(card).join('') + '</div></section>' + pos +
    (out.length ? '<section class="card"><h3>' + (s.alumni.length ? 'Left the show or the group' : 'Left the show') + '</h3><div class="cgrid">' + out.map(card).join('') + '</div></section>' : '') +
    '<p class="small faint pad">Looks are stylized approximations. Tap a member, then Edit look to adjust them.</p>';
}
function profile(id) {
  const s = S(), p = G.p(id), c = G.CAST[id];
  const others = (G.debuted() ? G.members() : G.trainees()).filter(x => x !== id);
  const bonds = others.map(o => [o, G.bond(id, o)]).sort((a, b) => b[1] - a[1]);
  const canBreak = (p.status === 'member' || p.status === 'solo') && !p.hiatus;
  sheet('<div class="prof">' + av(id, 96) + '<div><span class="eyebrow">' + esc(c.from) + (c.real ? ' · debuted in the real group' : '') + '</span><h2>' + esc(G.full(id)) + '</h2><div>' + statusTags(id) + '</div></div></div>' +
    (c.real && c.score ? '<p class="small muted">Real finale: ' + c.score.toFixed(2) + ' (fan pre-vote ' + c.pre + ', live vote ' + c.live + ', judges ' + c.judges.toFixed(2) + '), ' + ordinal(c.place) + ' place.</p>' : '') +
    (c.id === 'samara' ? '<p class="small muted">Real finale: 66.67, seventh place, 1.33 points behind sixth.</p>' : '') +
    '<h3>Skills</h3>' + D.skills.map(({ k, l }) => '<div class="statrow"><span>' + l + '</span>' + bar(p.sk[k]) + '<b>' + Math.round(p.sk[k]) + '</b></div>').join('') +
    '<div class="statrow"><span>Wellbeing</span>' + bar(p.wb, p.wb < 30 ? 'bad' : p.wb < 50 ? 'warn' : 'ok') + '<b>' + Math.round(p.wb) + '</b></div>' +
    '<div class="statrow"><span>Fan Favor</span>' + bar(p.fan) + '<b>' + Math.round(p.fan) + '</b></div>' +
    (p.grades.length ? '<h3>Evals</h3><div class="grades">' + p.grades.slice(-14).map(g => '<span class="grade g' + g.g.replace('+', 'p') + '" title="Month ' + g.m + '">' + g.g + '</span>').join('') + '</div>' : '') +
    (bonds.length ? '<h3>Bonds</h3><div class="bonds">' + bonds.map(([o, v]) => '<div class="bondrow">' + av(o, 26) + '<span>' + esc(G.name(o)) + '</span>' + bondBar(v) + '<b class="mono">' + (v > 0 ? '+' : '') + v + '</b></div>').join('') + '</div>' : '') +
    '<p class="small faint">Skill numbers are game numbers, not claims about anyone.</p>' +
    '<div class="row wrap">' +
    (G.inPlay(id) && id !== s.focus ? '<button class="btn sm" data-a="focus" data-id="' + id + '">Make her the focus</button>' : '') +
    (canBreak ? '<button class="btn ghost sm" data-a="break" data-id="' + id + '">Take a break</button>' : '') +
    (p.hiatus ? '<button class="btn ghost sm" data-a="unbreak" data-id="' + id + '">End her break</button>' : '') +
    '<button class="btn ghost sm" data-a="look" data-id="' + id + '">Edit look</button></div>');
}
function ordinal(n) { return n + (['th','st','nd','rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'); }
function bondBar(v) { const w = Math.abs(v); return '<span class="bbar"><i class="' + (v < 0 ? 'neg' : 'pos') + '" style="width:' + w + '%;' + (v < 0 ? 'right:50%' : 'left:50%') + '"></i></span>'; }
function lookEditor(id) {
  const L = G.p(id).look;
  sheet('<span class="eyebrow">Edit look</span><h2>' + esc(G.name(id)) + '</h2><div class="lookprev">' + av(id, 120) + '</div>' +
    '<h3>Skin</h3><div class="sw">' + D.skinTones.map(c => '<button class="swatch ' + (L.skin === c ? 'on' : '') + '" style="background:' + c + '" data-look="skin" data-v="' + c + '" data-id="' + id + '" aria-label="Skin tone"></button>').join('') + '</div>' +
    '<h3>Hair colour</h3><div class="sw">' + D.hairColors.map(c => '<button class="swatch ' + (L.hair === c ? 'on' : '') + '" style="background:' + c + '" data-look="hair" data-v="' + c + '" data-id="' + id + '" aria-label="Hair colour"></button>').join('') + '</div>' +
    '<h3>Hair style</h3><div class="chips">' + D.hairStyles.map(([k, l]) => '<button class="chip ' + (L.style === k ? 'on' : '') + '" data-look="style" data-v="' + k + '" data-id="' + id + '">' + l + '</button>').join('') + '</div>' +
    '<div class="row"><button class="btn ghost sm" data-a="lookreset" data-id="' + id + '">Reset</button><button class="btn sm" data-a="close">Done</button></div>');
}

/* Drama */
function dramaTab() {
  const s = S();
  const ids = G.debuted() ? G.members() : G.trainees();
  let h = '<section class="card"><div class="between"><h3>Bond web</h3><span class="mono small">COHESION ' + G.cohesion() + '</span></div>' + web(ids) +
    '<p class="small faint">Lines show how two people get on: red is strained, white is close. Tap a face for her bonds.</p></section>';
  h += '<section class="card"><h3>Open tensions</h3>' + (s.tensions.length ? s.tensions.map(t => {
    const d = D.drama[t.type];
    return '<div class="tension"><div class="pair">' + av(t.a, 36) + av(t.b, 36) + '</div><div class="tl"><b>' + esc(d.title) + '</b><div class="small muted">' + esc(G.name(t.a)) + ' and ' + esc(G.name(t.b)) + ' · ' + t.age + ' month' + (t.age === 1 ? '' : 's') + '</div>' +
      '<div class="heat">' + [1,2,3,4,5].map(k => '<i class="' + (k <= t.heat ? 'on' : '') + '"></i>').join('') + '</div></div><button class="btn sm" data-tid="' + t.id + '">Deal with it</button></div>';
  }).join('') : '<p class="small muted">No open tensions. Enjoy it.</p>') + '</section>';
  h += '<p class="small faint pad">Unresolved tension heats up every month, wears down Wellbeing and bonds, and costs points on shared stages. Above heat 3 fans start to notice.</p>';
  return h;
}
function web(ids) {
  const n = ids.length, R = n > 8 ? 120 : 95, cx = 160, cy = 140, pts = {};
  ids.forEach((id, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; pts[id] = [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  let lines = '';
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = ids[i], b = ids[j], v = G.bond(a, b), t = S().tensions.find(x => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (Math.abs(v) < 6 && !t && n > 8) continue;
    const col = t ? '#e5484d' : v < 0 ? '#b0503f' : v < 15 ? '#5a5f69' : v < 30 ? '#a9adb5' : '#f2f1ec';
    lines += '<line x1="' + pts[a][0] + '" y1="' + pts[a][1] + '" x2="' + pts[b][0] + '" y2="' + pts[b][1] + '" stroke="' + col + '" stroke-width="' + (t ? 3 : 1 + Math.abs(v) / 18) + '"' + (t ? ' stroke-dasharray="5 4"' : '') + ' opacity="' + (t ? 1 : .8) + '"/>';
  }
  const sz = n > 8 ? 30 : 38;
  const nodes = ids.map(id => '<foreignObject x="' + (pts[id][0] - sz / 2) + '" y="' + (pts[id][1] - sz / 2) + '" width="' + sz + '" height="' + sz + '"><button xmlns="http://www.w3.org/1999/xhtml" class="wnode" data-prof="' + id + '" aria-label="' + esc(G.name(id)) + '">' + av(id, sz) + '</button></foreignObject>' +
    '<text x="' + pts[id][0] + '" y="' + (pts[id][1] + sz / 2 + 11) + '" text-anchor="middle" class="wlabel">' + esc(G.name(id)) + '</text>').join('');
  return '<svg class="web" viewBox="0 0 320 290" role="img" aria-label="Bonds between members">' + lines + nodes + '</svg>';
}

/* Feed */
function feedTab() {
  const s = S();
  let h = '';
  if (s.hate) {
    const t = G.hateTopic();
    h += '<section class="card hate"><span class="eyebrow">Hate train · ' + D.hateStages[s.hate.stage] + '</span><h2>' + esc(t.t) + '</h2>' +
      '<div class="stages">' + D.hateStages.map((x, i) => '<span class="' + (i <= s.hate.stage ? 'on' : '') + '">' + x + '</span>').join('') + '</div>' +
      '<p class="small muted">It costs momentum, fans and everyone\'s Wellbeing each month. Respond once a month. Silence works when the group did nothing wrong; a bad apology makes it worse.</p>' +
      (s.hate.responded ? '<p class="small">You have responded this month.</p>' : '<button class="btn sm" data-a="hate">Respond</button>') + '</section>';
  }
  h += '<section class="card"><h3>Feed</h3>' + (s.feed.length ? s.feed.slice(0, 40).map(p => '<div class="post ' + (p.mood < 0 ? 'neg' : '') + '"><div class="between"><b>' + esc(p.h) + '</b><span class="mono faint small">M' + pad3(p.m) + '</span></div><p>' + esc(p.t) + '</p></div>').join('') : '<p class="muted small">Quiet for now.</p>') + '</section>';
  return h;
}

/* Charts */
function spark(ch) {
  if (!ch.length) return '';
  const w = 120, hgt = 34, step = ch.length > 1 ? w / (ch.length - 1) : 0, y = v => 2 + (Math.min(v, 101) - 1) / 100 * (hgt - 4);
  const d = ch.map((v, i) => (i ? 'L' : 'M') + (i * step).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + hgt + '" width="' + w + '" height="' + hgt + '" aria-hidden="true"><line x1="0" x2="' + w + '" y1="' + y(10) + '" y2="' + y(10) + '" class="ref"/><path d="' + d + '"/></svg>';
}
function chartsTab() {
  const s = S(), r = s.group.releases.slice().reverse();
  return '<section class="card"><div class="between"><h3>Releases</h3><span class="mono small">BEST No. ' + (s.rec.best > 100 ? '—' : s.rec.best) + '</span></div>' +
    (r.length ? r.map(x => '<div class="rel"><div class="tl"><b>"' + esc(x.title) + '"</b><div class="small muted">' + x.kind + ' · ' + esc(x.concept) + (x.kind === 'EP' ? ' · ' + esc(x.era) : '') + ' · M' + pad3(x.month) + (x.viral ? ' · <span class="spot">viral</span>' : '') + (x.divisive ? ' · divisive' : '') + (x.mv ? ' · MV ' + x.mv : '') + '</div>' + (x.lines ? linesBar(x.lines) : '') + '</div>' +
      spark(x.chart) + '<div class="peak"><b class="mono">' + (x.peak > 100 ? '—' : '#' + x.peak) + '</b><span class="small faint">' + (x.album ? 'EP #' + x.album : 'peak') + '</span></div></div>').join('') : '<p class="small muted">Nothing out yet.</p>') +
    '<p class="small faint">Chart lines run month by month; the dotted line is the top 10. The charts are fictional.</p></section>' +
    '<section class="card"><h3>Awards</h3><p class="small">' + s.rec.wins + ' win' + (s.rec.wins === 1 ? '' : 's') + ' from ' + s.rec.noms + ' nominations · ' + s.rec.no1 + ' No. 1' + (s.rec.no1 === 1 ? '' : 's') + ' · ' + s.rec.viral + ' viral moment' + (s.rec.viral === 1 ? '' : 's') + '</p>' +
    s.group.awards.map(a => '<div class="logrow"><span class="mono faint small">M' + pad3(a.m) + '</span> ' + esc(a.t) + ', ' + esc(D.awards) + '</div>').join('') + '</section>';
}

function linesBar(L) {
  const ids = Object.keys(L).sort((a, b) => L[b] - L[a]);
  return '<div class="lines" title="Line distribution">' + ids.map((id, i) => '<i style="width:' + L[id] + '%;background:' + ['#ecebe6','#c9c8c3','#a5a7ad','#86898f','#696c72','#55585e'][i % 6] + '"><span>' + esc(G.name(id)) + ' ' + L[id] + '%</span></i>').join('') + '</div>';
}

/* Real story + trophies */
function storyTab() {
  const s = S(), B = G.realBeats(), got = B.filter(b => b.ok).length;
  return '<section class="card"><div class="between"><h3>The real story vs yours</h3><span class="mono small">' + got + ' / ' + B.length + ' MATCHED</span></div>' +
    '<p class="small muted">Each beat from the real group\'s first years, and how your run compares. Match or beat 8 for a trophy.</p>' +
    B.map(b => '<div class="beat ' + (b.ok === true ? 'ok' : b.ok === false ? 'no' : '') + '"><span class="mono small faint">' + esc(b.date) + '</span><p><b>Real:</b> ' + esc(b.real) + '</p><p><b>Yours:</b> ' + esc(b.yours) + '</p><i>' + (b.ok === true ? '✓' : b.ok === false ? '✗' : '…') + '</i></div>').join('') + '</section>' +
    '<section class="card"><div class="between"><h3>Trophies</h3><span class="mono small">' + Object.keys(s.trophies).length + ' / ' + D.trophies.length + '</span></div><div class="troph">' +
    D.trophies.map(([id, t, d]) => '<div class="tr ' + (s.trophies[id] ? 'on' : '') + '"><b>' + esc(t) + '</b><span>' + esc(d) + '</span>' + (s.trophies[id] ? '<em class="mono">M' + pad3(s.trophies[id]) + '</em>' : '') + '</div>').join('') + '</div></section>';
}

/* Practice room */
function practiceSheet(sel) {
  const s = S(), ids = G.working();
  sel = sel && ids.includes(sel) ? sel : (ids.includes(s.focus) ? s.focus : ids[0]);
  sheet('<span class="eyebrow">Practice room · ' + s.practice + ' of 2 left</span><h2>Extra practice</h2><p class="small muted">A free session on top of the month\'s plan. It raises the skill directly and costs a little Wellbeing.</p>' +
    '<div class="chips">' + ids.map(id => '<button class="chip ' + (id === sel ? 'on' : '') + '" data-psel="' + id + '">' + esc(G.name(id)) + '</button>').join('') + '</div>' +
    '<div class="stack tight">' + D.skills.map(({ k, l }) => '<button class="choice" data-pk="' + k + '" data-id="' + sel + '"><b>' + esc(MG.INFO[G.MG_KIND[k]].title) + '</b><span>' + l + ' ' + Math.round(G.p(sel).sk[k]) + '</span></button>').join('') + '</div>');
}

/* Log */
function logTab() {
  const s = S(), kinds = [['all','All'],['story','Story'],['show','Show'],['eval','Evals'],['drama','Drama'],['release','Releases'],['hate','Backlash']];
  const rows = s.log.filter(l => (logKind === 'all' || l.kind === logKind || (logKind === 'story' && l.kind === 'chapter')) && (logWho === 'all' || l.t.indexOf(G.name(logWho)) >= 0));
  return '<section class="card"><h3>Production log</h3><div class="chips">' + kinds.map(([k, l]) => '<button class="chip ' + (logKind === k ? 'on' : '') + '" data-logk="' + k + '">' + l + '</button>').join('') + '</div>' +
    '<label class="field inline"><span>Member</span><select data-logwho><option value="all">Everyone</option>' + s.order.map(id => '<option value="' + id + '"' + (logWho === id ? ' selected' : '') + '>' + esc(G.name(id)) + '</option>').join('') + '</select></label>' +
    (rows.length ? '' : '<p class="small muted">Nothing here yet.</p>') + rows.slice(0, 200).map(l => '<div class="logrow k-' + l.kind + '"><span class="mono faint small">M' + pad3(l.m) + '</span> ' + esc(l.t) + '</div>').join('') + '</section>';
}

/* ---------- Sheets ---------- */
function sheet(html, opts) {
  closeSheet();
  const m = document.createElement('div');
  m.className = 'modal' + (opts && opts.cls ? ' ' + opts.cls : '');
  m.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + (opts && opts.lock ? '' : '<button class="x" data-a="close" aria-label="Close">×</button>') + html + '</div>';
  document.body.appendChild(m);
  m.onclick = e => {
    if (e.target === m && !(opts && opts.lock)) return closeSheet();
    onClick(e);
  };
  return m;
}
function closeSheet() { document.querySelectorAll('.modal').forEach(x => x.remove()); }

/* ---------- Scene player: 3D cutscene with dialogue ---------- */
function npcSpec(k) { const x = D.npcs[k]; return { id:k, look:x.look, outfit:x.outfit, pants:true }; }
function speakerAv(k, size) {
  if (G.CAST[k]) return av(k, size);
  const x = D.npcs[k]; if (!x) return '';
  return '<span class="av npc" style="width:' + size + 'px;height:' + size + 'px;background:' + (x.outfit || '#333') + '">' + esc(x.name.split(' ').map(w => w[0]).join('').slice(0, 2)) + '</span>';
}
function playScene(sc, head) {
  return new Promise(res => {
    const keys = sc.cast.slice();
    sc.lines.forEach(l => { if (l[0] !== 'N' && !keys.includes(l[0]) && (G.CAST[l[0]] || D.npcs[l[0]])) keys.push(l[0]); });
    const specs = keys.slice(0, 9).map((k, i) => G.CAST[k] ? fig3(k, i) : npcSpec(k));
    const w = document.createElement('div'); w.className = 'scn';
    w.innerHTML = '<div class="mg-top"><span class="rec">REC</span><b>' + esc(head || '') + '</b><button class="btn ghost sm" data-skip>Skip scene</button></div>' +
      '<div class="scn-3d"></div><div class="scn-box" role="button" tabindex="0" aria-label="Next line"><div class="scn-who"></div><p class="scn-t"></p><span class="scn-next mono">TAP ▸</span></div>';
    document.body.appendChild(w);
    const view = w.querySelector('.scn-3d');
    const C = window.S3 ? S3.mount(view, { set:sc.set || 'practice', cast:specs, scene:true, light:S().group.light, tint:outfitTint() }) : null;
    if (!C) view.classList.add('flat');
    let k = -1, typing = null;
    const who = w.querySelector('.scn-who'), tx = w.querySelector('.scn-t');
    function show() {
      k++;
      if (k >= sc.lines.length) return end();
      const [sp, text, mv] = sc.lines[k], idx = keys.indexOf(sp);
      if (C) C.talk(sp === 'N' ? -1 : Math.min(idx, 8), mv);
      who.innerHTML = sp === 'N' ? '<span class="narr mono">NARRATION</span>' : speakerAv(sp, 30) + '<b>' + esc(G.speaker(sp)) + '</b>' + (D.npcs[sp] && D.npcs[sp].role ? '<span class="small faint">' + esc(D.npcs[sp].role) + '</span>' : '');
      tx.className = 'scn-t' + (sp === 'N' ? ' narr' : '');
      clearInterval(typing); let c = 0; tx.textContent = '';
      if (SET.calm) { tx.textContent = text; tx.dataset.full = text; return; }
      typing = setInterval(() => { c += 2; tx.textContent = text.slice(0, c); if (c >= text.length) { clearInterval(typing); typing = null; } }, 16);
      tx.dataset.full = text;
    }
    function next() { if (typing) { clearInterval(typing); typing = null; tx.textContent = tx.dataset.full; return; } show(); }
    function end() { clearInterval(typing); document.removeEventListener('keydown', key); if (C) C.destroy(); w.remove(); res(); }
    const key = e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(); } if (e.key === 'Escape') end(); };
    document.addEventListener('keydown', key);
    w.addEventListener('click', e => { if (e.target.closest('[data-skip]')) return end(); if (e.target.closest('.scn-box') || e.target.closest('.scn-3d')) next(); });
    show();
  });
}
UI.playScene = playScene;

/* Event sheet. temp = not in the queue (opened from a tab). */
function openEvent(ev, temp) {
  const v = G.view(ev);
  if (v && v.scene && !ev.sceneSeen) { closeSheet(); return playScene(v.scene, v.eyebrow).then(() => { ev.sceneSeen = true; G.save(); openEvent(ev, temp); }); }
  if (v && ev.kind === 'mission' && S().ms && S().ms.n === ev.n && S().ms.team) v.cast = S().ms.team.filter(G.inPlay);
  if (!v) { const s = S(); s.queue = s.queue.filter(x => x !== ev); G.save(); render(); return nextEvent(); }
  const conf = v.conf ? '<div class="confs">' + v.conf.map(([id, t]) => '<div class="conf">' + av(id, 40) + '<div><span class="mono small faint">CONFESSIONAL · ' + esc(G.name(id).toUpperCase()) + '</span><p>' + esc(t) + '</p></div></div>').join('') + '</div>' : '';
  const pair = v.drama ? '<div class="pair big">' + av(v.drama.a, 56) + av(v.drama.b, 56) + '</div>' : '';
  const m = sheet('<span class="eyebrow">' + esc(v.eyebrow || '') + '</span><h2>' + esc(v.title) + '</h2>' + pair + '<p>' + esc(v.text) + '</p>' + conf +
    (v.note ? '<p class="small faint">' + esc(v.note) + '</p>' : '') +
    '<div class="stack tight">' + v.choices.map((c, i) => '<button class="choice" data-ch="' + i + '"><b>' + esc(c[0]) + '</b>' + (c[1] ? '<span>' + esc(c[1]) + '</span>' : '') + '</button>').join('') + '</div>',
    { lock:!temp, cls:ev.kind === 'archive' ? 'archive' : ev.kind === 'hate' ? 'hatem' : '' });
  const snapBefore = G.snap();
  m.onclick = async e => {
    const b = e.target.closest('[data-ch]');
    if (!b) { if (temp && (e.target === m || e.target.closest('[data-a="close"]'))) closeSheet(); return; }
    const i = +b.dataset.ch;
    let acc = null;
    const games = v.games || (v.perform ? ['live', null] : null), kind = games && games[i];
    if (kind) { m.style.display = 'none'; acc = await runGame(kind, mgOpts(v, kind)); m.style.display = ''; if (acc == null && v.perform) acc = null; }
    undoSnap = !temp && S().diff !== 'hard' && !['archive','info','ending'].includes(ev.kind) ? snapBefore : null;
    const out = G.choose(ev, i, acc);
    if (temp) { const s = S(); s.queue = s.queue.filter(x => !(x.kind === ev.kind && (ev.tid ? x.tid === ev.tid : true))); G.save(); }
    if (out) result(out, acc, () => { closeSheet(); render(); if (!temp) nextEvent(); });
    else { undoSnap = null; closeSheet(); render(); if (!temp) nextEvent(); }
  };
}
function result(text, acc, cb) {
  const parts = String(text).split('\n');
  const m = sheet((acc != null ? '<span class="eyebrow">Score ' + Math.round(acc * 100) + '%</span>' : '') + '<p class="big">' + esc(parts[0]) + '</p>' + parts.slice(1).map(x => '<p class="judge">' + esc(x) + '</p>').join('') + '<button class="btn big" data-a="ok">Continue</button>' + (undoSnap ? '<button class="btn ghost sm undo" data-a="undo">Undo this choice</button>' : ''), { lock:true });
  m.onclick = e => { if (e.target.closest('[data-a="ok"]')) { undoSnap = null; cb(); } if (e.target.closest('[data-a="undo"]')) { G.restore(undoSnap); undoSnap = null; closeSheet(); render(); nextEvent(); toast('Choice undone.'); } };
}
function nextEvent() {
  const s = S(); if (!s) return;
  if (s.queue.length) openEvent(s.queue[0], false);
  else if (s.ended) finalScreen();
}
UI.nextEvent = nextEvent;

/* Month report. */
function report(R) {
  const s = S();
  let h = '<span class="eyebrow">Month ' + pad3(R.m) + ' wrap</span><h2>' + (s.ended ? 'The last month' : 'What happened') + '</h2>';
  const fg = G.p(s.focus);
  if (R.gains[s.focus] != null) h += '<p>' + esc(G.name(s.focus)) + ': ' + esc(D.acts[fg.last.act].l.toLowerCase()) + ', skills +' + R.gains[s.focus] + ', Wellbeing ' + Math.round(fg.wb) + '.</p>';
  if (G.debuted() && R.fans1 != null) { const d = R.fans1 - R.fans0; h += '<p>Fans ' + G.fmt(R.fans1) + ' (' + (d >= 0 ? '+' : '−') + G.fmt(Math.abs(d)) + ').</p>'; }
  R.chart.concat(R.lines).forEach(l => { h += '<p class="small">' + esc(l) + '</p>'; });
  if (G.canRelease()) h += '<p class="small spot">Prep is at ' + Math.round(s.group.prep) + '. You can release the next song from the Plan tab' + (s.group.prep < 85 ? ' now, or keep recording to 85 for an EP.' : '.') + '</p>';
  if (R.grades && R.grades.length) {
    h += '<h3>Eval board</h3><div class="evalboard">' + R.grades.map((r, i) => '<div class="ev ' + (r.id === s.focus ? 'me' : '') + (G.p(r.id).warn ? ' warn' : '') + '"><span class="mono faint">' + (i + 1) + '</span>' + av(r.id, 26) + '<span>' + esc(G.name(r.id)) + '</span><b class="grade g' + r.g.replace('+', 'p') + '">' + r.g + '</b></div>').join('') + '</div>' +
      (R.grades.some(r => G.p(r.id).warn) ? '<p class="small faint">Highlighted: the bottom three, on warning.</p>' : '');
  }
  h += '<button class="btn big" data-a="ok">' + (s.queue.length ? 'Next: ' + s.queue.length + ' decision' + (s.queue.length > 1 ? 's' : '') : 'Plan month ' + pad3(s.month)) + '</button>';
  const m = sheet(h, { lock:true });
  m.onclick = e => { if (e.target.closest('[data-a="ok"]')) { closeSheet(); render(); nextEvent(); } };
}

/* Final screen. */
function finalScreen() {
  const s = S(), e = D.endings[s.ended];
  sheet('<span class="eyebrow">Ending</span><h2>' + esc(e.t) + '</h2><p>' + esc(e.d) + '</p>' +
    '<div class="grid2"><div><b>' + G.fmt(s.group.fans) + '</b><span>fans</span></div><div><b>' + s.group.releases.length + '</b><span>releases</span></div><div><b>' + (s.rec.best > 100 ? '—' : '#' + s.rec.best) + '</b><span>best chart peak</span></div><div><b>' + s.rec.wins + '</b><span>awards won</span></div>' +
    '<div><b>' + s.rec.no1 + '</b><span>No. 1s</span></div><div><b>' + G.cohesion(G.members().concat(s.alumni)) + '</b><span>cohesion</span></div></div>' +
    '<div class="cast-strip">' + G.members().concat(s.alumni).map(id => av(id, 48)).join('') + '</div>' +
    '<button class="btn big" data-a="share">Save a share card</button><button class="btn big ghost" data-a="newrun">New run</button><button class="btn big ghost" data-a="close">Look around</button>');
}

/* Menu. */
function menu() {
  const s = S();
  sheet('<span class="eyebrow">Menu</span><h2>' + esc(s.group.formed ? s.group.name : 'Dream Academy') + '</h2>' +
    '<label class="toggle"><input type="checkbox" data-set="askAll"' + (s.settings.askAll ? ' checked' : '') + '><span>Ask me about every tension, even between autoplayed members</span></label>' +
    '<div class="stack tight">' +
    '<button class="choice" data-a="settings"><b>Settings</b><span>Graphics, sound, text size, motion, mini-games, tips</span></button>' +
    (G.canRewind() ? '<button class="choice" data-a="rewind"><b>Rewind one month</b><span>Go back to the start of last month</span></button>' : '') +
    '<button class="choice" data-a="glossary"><b>Glossary</b><span>What every stat and system means</span></button>' +
    '<button class="choice" data-a="share"><b>Share card</b><span>Save an image of this run</span></button>' +
    '<button class="choice" data-a="export"><b>Export save</b><span>Copy a save code to keep or move to another device</span></button>' +
    '<button class="choice" data-a="import"><b>Import save</b><span>Paste a save code</span></button>' +
    (s.month >= 100 && !s.ended ? '<button class="choice" data-a="endnow"><b>Write the final chapter</b><span>End the story now and see the ending</span></button>' : '') +
    '<button class="choice" data-a="title"><b>Title screen</b><span>Your run is saved automatically on this device</span></button>' +
    '<button class="choice" data-a="about"><b>About this game</b></button></div>');
}
function about() {
  sheet('<span class="eyebrow">About</span><h2>Dream Academy: Story Mode</h2>' +
    '<p>An unofficial fan game, not affiliated with HYBE, Geffen, Netflix or any of the people in it. It follows the shape of the real story, from the 2021 open call through The Debut: Dream Academy (2023) and the group\'s first years, then invents the future.</p>' +
    '<p class="small">Real: names, where each contestant is from, how they left the show, the real finale scores, and the dated archive cards. Invented: every song, era, chart, eval, skill number, quote and drama. Drama stays in the style of a survival show: rivalries, line distribution, cliques, misunderstandings. The game never invents bullying, betrayal, crimes, scandals or health crises, hate trains never target one member by name, and anyone who was a minor on the show only gets light, competitive drama.</p>' +
    '<p class="small faint">Sources for the real timeline: Wikipedia (Dream Academy), Wikiwand (Katseye), generasia, TheWrap and news reports, as collected in the design report.</p>');
}

function settingsSheet() {
  const seg = (key, opts) => '<div class="chips">' + opts.map(([v, l]) => '<button class="chip ' + (SET[key] === v ? 'on' : '') + '" data-setk="' + key + '" data-setv="' + v + '">' + l + '</button>').join('') + '</div>';
  const tg = (key, l) => '<label class="toggle"><input type="checkbox" data-sett="' + key + '"' + (SET[key] ? ' checked' : '') + '><span>' + l + '</span></label>';
  sheet('<span class="eyebrow">Settings</span><h2>Settings</h2><p class="small faint">Saved on this device for every slot.</p>' +
    '<h3>Graphics</h3>' + seg('gfx', [['high','High'],['low','Low (faster)'],['off','No 3D']]) +
    '<h3>Sound</h3><label class="field"><span>Volume ' + Math.round(SET.vol * 100) + '%</span><input type="range" min="0" max="1" step=".05" value="' + SET.vol + '" data-vol></label>' + tg('music', 'Background music') +
    '<h3>Text size</h3>' + seg('text', [['s','Small'],['m','Medium'],['l','Large']]) +
    '<h3>Comfort</h3>' + tg('calm', 'Reduce motion (no camera cuts or orbiting, instant dialogue)') + tg('statsOnly', 'Skip every mini-game and resolve it from stats') + tg('tips', 'Show tutorial tips') +
    (S() ? '<button class="btn ghost sm" data-a="resettips">Show all tips again</button>' : ''));
}
function glossary() {
  const rows = [['Skills', 'Vocal, Dance, Rap, Performance, Songwriting and Charisma, 0 to 99. Lessons and practice raise them; they drive every stage score.'],
    ['Wellbeing (WB)', 'Below 45 training slows, below 25 she struggles on stage and a break is suggested. Rest, breaks and good bonds restore it.'],
    ['Fan Favor', 'How much fans love her personally. It decides survival show votes and grows with content, fansigns and great stages.'],
    ['Bond and cohesion', 'Bond is how two people get on (−50 to 50). Cohesion is the average bond in the group. Close groups survive drama and backlash.'],
    ['Evals', 'Monthly grades from D to A+ during training and pre-debut, based on skill level, growth and your eval-day stage.'],
    ['Tensions and heat', 'Drama between two people. Heat rises every month nobody deals with it, up to a blowup at 5.'],
    ['Momentum', 'How hot the group is right now. Releases, promotion, tours and viral moments raise it; it fades every month.'],
    ['Label pressure', 'How much the label wants. High pressure brings demands and more backlash risk.'],
    ['Prep', 'How ready the next release is. 60 for a single, 85 for an EP.'],
    ['Hate train', 'Backlash aimed at the group, in five stages from Whispers to Peak backlash.'],
    ['Positions', 'Leader, main vocal, main dancer, main rapper and center. Each trains its skill 15% faster.'],
    ['Difficulty', 'Easy trains faster with kinder charts; Hard trains slower, charts are tougher, and rewind and undo are off.']];
  sheet('<span class="eyebrow">Glossary</span><h2>How it all works</h2>' + rows.map(([t, d]) => '<div class="logrow"><b>' + esc(t) + '</b><p class="small muted">' + esc(d) + '</p></div>').join(''));
}
function shareCard() {
  const s = S(), c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
  const g = c.getContext('2d');
  g.fillStyle = '#0d0e10'; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = '#e5484d'; g.beginPath(); g.arc(96, 110, 16, 0, 7); g.fill();
  g.font = '700 30px monospace'; g.fillText('REC · DREAM ACADEMY: STORY MODE', 128, 121);
  g.fillStyle = '#ecebe6'; g.font = '700 92px Georgia, serif'; g.fillText(s.group.formed ? s.group.name : 'Trainee year', 80, 290);
  g.font = '500 40px Georgia, serif'; g.fillStyle = '#a5a7ad'; g.fillText('Month ' + s.month + ' of 144 · ' + G.DIFF[s.diff || 'normal'].l + (s.ended ? ' · ' + D.endings[s.ended].t : ''), 80, 360);
  const stat = [['Fans', G.fmt(s.group.fans)], ['Best chart peak', s.rec.best > 100 ? '—' : '#' + s.rec.best], ['No. 1s', s.rec.no1], ['Awards', s.rec.wins], ['Music show wins', s.rec.showWins || 0], ['Trophies', Object.keys(s.trophies).length + ' / ' + D.trophies.length]];
  stat.forEach(([l, v], i) => { const x = 80 + (i % 2) * 480, y = 470 + Math.floor(i / 2) * 190; g.fillStyle = '#16181c'; g.fillRect(x, y, 440, 160); g.fillStyle = '#ecebe6'; g.font = '700 64px monospace'; g.fillText(String(v), x + 30, y + 90); g.fillStyle = '#73777f'; g.font = '500 28px sans-serif'; g.fillText(l, x + 30, y + 135); });
  g.fillStyle = '#ecebe6'; g.font = '600 34px Georgia, serif';
  const who = (G.members().length ? G.members() : G.cast()).map(G.name).join(' · ');
  g.fillText(who.length > 52 ? who.slice(0, 50) + '…' : who, 80, 1080);
  g.fillStyle = '#73777f'; g.font = '500 24px sans-serif'; g.fillText('Unofficial fan game. Songs, charts and drama are invented.', 80, 1250);
  c.toBlob(b => {
    const file = new File([b], 'dream-academy-run.png', { type:'image/png' });
    if (navigator.canShare && navigator.canShare({ files:[file] })) { navigator.share({ files:[file], title:'My Dream Academy run' }).catch(() => {}); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'dream-academy-run.png'; document.body.appendChild(a); a.click(); a.remove();
    toast('Share card saved.');
  });
}
function skipMonths() {
  const s = S(); let last = null; const lines = [], chart = []; let n = 0;
  for (let i = 0; i < 6; i++) { const R = G.advance(); if (!R) break; n++; last = R; lines.push(...R.lines.map(l => 'M' + pad3(R.m) + ': ' + l)); chart.push(...R.chart); if (S().queue.length || S().ended) break; }
  if (!last) return;
  render();
  if (n > 1) { last.lines = ['Skipped ' + n + ' months.'].concat(lines); last.chart = chart.slice(-4); last.fans0 = last.fans0; }
  report(last);
  void s;
}

/* ---------- Input ---------- */
function onClick(e) {
  const s = S();
  const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; try { localStorage.setItem('da-tab', tab); } catch (x) {} render(); window.scrollTo(0, 0); return; }
  const gp = e.target.closest('[data-gp]'); if (gp) { s.group.plan = gp.dataset.gp; G.save(); render(); return; }
  const ac = e.target.closest('[data-act]'); if (ac) { G.setPlan(ac.dataset.id, ac.dataset.act); G.save(); render(); return; }
  const pr = e.target.closest('[data-prof]'); if (pr) { profile(pr.dataset.prof); return; }
  const td = e.target.closest('[data-tid]'); if (td) { openEvent({ kind:'drama', tid:+td.dataset.tid }, true); return; }
  const lk = e.target.closest('[data-look]'); if (lk) { G.p(lk.dataset.id).look[lk.dataset.look] = lk.dataset.v; G.save(); lookEditor(lk.dataset.id); render(); return; }
  const br = e.target.closest('[data-brk]'); if (br) { G.startHiatus(br.dataset.id, +br.dataset.brk); G.save(); closeSheet(); render(); toast(G.name(br.dataset.id) + ' is on a break.'); return; }
  const tr = e.target.closest('[data-train]'); if (tr) { const id = tr.dataset.train, kind = G.MG_KIND[G.planOf(id)];
    runGame(kind, { cast:cast3([id]), skill:G.avg(id) }).then(acc => { const mlt = G.trainResult(id, acc); G.save(); render(); if (mlt) toast(G.name(id) + ': ' + Math.round(acc * 100) + '% · gains ×' + mlt.toFixed(2)); }); return; }
  const ps = e.target.closest('[data-psel]'); if (ps) { practiceSheet(ps.dataset.psel); return; }
  const pk = e.target.closest('[data-pk]'); if (pk) { const id = pk.dataset.id, k = pk.dataset.pk; closeSheet();
    runGame(G.MG_KIND[k], { cast:cast3([id]), skill:G.avg(id) }).then(acc => { const g = G.practice(id, k, acc); G.save(); render(); if (g) toast(G.name(id) + ': ' + D.skills.find(x => x.k === k).l + ' +' + g); }); return; }
  const tp = e.target.closest('[data-tip]'); if (tp) { s.tips[tp.dataset.tip] = 1; G.save(); render(); return; }
  const lk2 = e.target.closest('[data-logk]'); if (lk2) { logKind = lk2.dataset.logk; render(); return; }
  const sk = e.target.closest('[data-setk]'); if (sk) { SET[sk.dataset.setk] = sk.dataset.setv; applySet(); if (sk.dataset.setk === 'gfx' && window.S3) S3.release(); settingsSheet(); if (document.querySelector('#app .top')) render(); return; }
  const a = e.target.closest('[data-a]'); if (!a) return;
  const id = a.dataset.id;
  switch (a.dataset.a) {
    case 'advance': { const R = G.advance(); if (R) { render(); report(R); } break; }
    case 'skip': skipMonths(); break;
    case 'settings': settingsSheet(); break;
    case 'glossary': glossary(); break;
    case 'share': shareCard(); break;
    case 'rewind': if (G.rewind()) { closeSheet(); render(); nextEvent(); toast('Back to month ' + S().month + '.'); } break;
    case 'resettips': S().tips = {}; G.save(); closeSheet(); render(); toast('Tips will show again.'); break;
    case 'next': nextEvent(); break;
    case 'final': finalScreen(); break;
    case 'menu': menu(); break;
    case 'practice': practiceSheet(); break;
    case 'close': closeSheet(); break;
    case 'release': G.queueRelease(); G.save(); render(); nextEvent(); break;
    case 'hate': openEvent({ kind:'hate' }, true); break;
    case 'focus': { const old = s.focus; s.focus = id; G.setCtrl(id, 'manual'); if (old !== id && G.inPlay(old)) G.setCtrl(old, 'balanced'); G.save(); closeSheet(); render(); toast('The cameras follow ' + G.name(id) + ' now.'); break; }
    case 'break': sheet('<span class="eyebrow">Hiatus</span><h2>A break for ' + esc(G.name(id)) + '</h2><p class="small">Her Wellbeing recovers 12 a month and the group performs as a smaller lineup. A break costs momentum for a while but never ends the run.</p><div class="stack tight">' +
      [[1,'One month'],[3,'Three months'],[6,'Six months'],[-1,'Until she feels ready']].map(([k, l]) => '<button class="choice" data-brk="' + k + '" data-id="' + id + '"><b>' + l + '</b></button>').join('') + '</div>'); break;
    case 'unbreak': G.endHiatus(id); G.save(); closeSheet(); render(); break;
    case 'look': lookEditor(id); break;
    case 'lookreset': G.p(id).look = Object.assign({}, G.CAST[id].look); G.save(); lookEditor(id); render(); break;
    case 'export': { const code = G.exportSave(); sheet('<span class="eyebrow">Export</span><h2>Save code</h2><textarea class="code" readonly>' + esc(code) + '</textarea><button class="btn sm" data-a="copy">Copy</button>');
      break; }
    case 'copy': { const ta = $('.modal textarea'); if (ta) { ta.select(); try { navigator.clipboard.writeText(ta.value).then(() => toast('Copied.'), () => toast('Select the text and copy it.')); } catch (x) { toast('Select the text and copy it.'); } } break; }
    case 'import': sheet('<span class="eyebrow">Import</span><h2>Paste a save code</h2><textarea class="code" placeholder="Save code"></textarea><button class="btn sm" data-a="doimport">Load it</button>'); break;
    case 'doimport': { const ta = $('.modal textarea'); if (ta && G.importSave(ta.value)) { closeSheet(); tab = 'plan'; game(); toast('Save loaded.'); } else toast('That code did not work.'); break; }
    case 'endnow': G.endNow(); closeSheet(); render(); nextEvent(); break;
    case 'title': closeSheet(); title(true); break;
    case 'about': about(); break;
    case 'newrun': closeSheet(); G.wipe(); setupScreen(); break;
  }
}
function onChange(e) {
  const s = S();
  const ps = e.target.closest('[data-pos]'); if (ps) { G.setPosition(ps.dataset.pos, ps.value); G.save(); render(); return; }
  const c = e.target.closest('[data-ctrl]'); if (c) { G.setCtrl(c.dataset.ctrl, c.value); G.save(); render(); return; }
  const p = e.target.closest('[data-partner]'); if (p) { s.partner[p.dataset.partner] = p.value; G.save(); return; }
  const st = e.target.closest('[data-set]'); if (st) { s.settings[st.dataset.set] = st.checked; G.save(); }
  const bk = e.target.closest('[data-bulk]'); if (bk && bk.value) { G.cast().forEach(id => { if (s.ctrl[id] !== 'manual') G.setCtrl(id, bk.value); }); G.save(); render(); toast('Every autoplayed member is now ' + D.styles[bk.value].l + '.'); return; }
  const lw = e.target.closest('[data-logwho]'); if (lw) { logWho = lw.value; render(); return; }
}
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches && t.matches('[data-sett]')) { SET[t.dataset.sett] = t.checked; applySet(); if (t.dataset.sett === 'music' && window.MG) { MG.music(SET.music); musicOn = SET.music; } if (document.querySelector('#app .top')) render(); return; }
  if (t.matches && t.matches('[data-vol]')) { SET.vol = +t.value; applySet(); return; }
  if (t.closest('.modal')) onChange(e);
});

})();
