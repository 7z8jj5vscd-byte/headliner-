/* Dream Academy: Story Mode. Batch 5: customization and presentation.
   Outfit, stage, choreography and logo designers, a custom trainee, music video and best-stage playback,
   documentary mode, an animated weekly chart, photo mode and local records. Loaded after ui.js. */
(function () {
const D = window.DA, G = window.G, UI = window.UI;
const S = () => G.S();
const esc = UI.esc, pad3 = n => String(n).padStart(3, '0');
const n = id => G.name(id);
const ST = () => { const s = S(); s.studio = s.studio || { outfit:null, accent:null, pants:'mix', tint:null, choreo:[], logo:{ font:'serif', color:'#ecebe6', sym:'' }, best:null }; return s.studio; };
const SW = ['#c2413b','#e5484d','#f0b44c','#d9a441','#6fcf97','#2e6b3a','#7fd3ff','#3b3f8f','#b89cff','#b84f9c','#ecebe6','#1b1b1b'];

/* ---------- Custom trainee ---------- */
G.addCustom = spec => {
  if (G.CAST.me) return;
  const c = { id:'me', first:spec.name || 'You', from:spec.from || 'Somewhere', custom:true, lean:{ vo:4, da:4, pe:4 }, look:spec.look || { skin:'#d8ad88', hair:'#2a1a12', style:'long' } };
  D.cast.push(c); G.CAST.me = c;
};
const _new = G.newGame;
G.newGame = opts => {
  if (opts.custom) G.addCustom(opts.custom);
  else if (G.CAST.me) { D.cast.splice(D.cast.findIndex(c => c.id === 'me'), 1); delete G.CAST.me; }
  const s = _new(opts);
  if (opts.custom) { s.custom = opts.custom; G.log(opts.custom.name + ' joins the twenty as the twenty-first trainee.', 'story'); }
  return s;
};
const _load = G.load;
G.load = () => { const ok = _load(); if (ok && S().custom) G.addCustom(S().custom); return ok; };
const _imp = G.importSave;
G.importSave = t => { const ok = _imp(t); if (ok && S().custom) G.addCustom(S().custom); return ok; };
// Real result: the custom trainee isn't part of the real elimination lists, so she leaves at the finale unless she is the focus in open mode.

/* ---------- Style overrides for 3D figures ---------- */
UI.figHook = (f, id) => { const s = S(); if (!s || !s.studio || !G.p(id) || G.p(id).status !== 'member') return f; const st = s.studio; if (st.outfit) f.outfit = st.outfit; if (st.accent) f.accent = st.accent; if (st.pants !== 'mix') f.pants = st.pants === 'all'; return f; };
UI.figFor = (id, i) => UI.fig3(id, i);
const castFor = ids => ids.map(UI.figFor);
G.stageTint = () => ST().tint || UI.outfitTint();

/* ---------- Generic 3D sheet ---------- */
function stageSheet(title, html, o, after) {
  const m = UI.sheet('<span class="eyebrow">' + esc(title) + '</span><div class="stage3d tall" id="st3d"></div>' + html);
  const el = m.querySelector('#st3d');
  const C = window.S3 ? S3.mount(el, Object.assign({ set:'stage', cast:castFor(G.activeMembers().length ? G.activeMembers() : G.cast().slice(0, 6)), light:S().group.light, tint:G.stageTint() }, o)) : null;
  if (C) C.dance(true, 112);
  const obs = new MutationObserver(() => { if (!document.body.contains(m)) { if (C) C.destroy(); obs.disconnect(); } });
  obs.observe(document.body, { childList:true });
  if (after) after(m, C);
  return { m, C };
}

/* ---------- Designers ---------- */
function outfitDesigner() {
  const st = ST();
  stageSheet('Outfit designer', '<h3>Main colour</h3><div class="sw">' + SW.map(c => '<button class="swatch ' + (st.outfit === c ? 'on' : '') + '" style="background:' + c + '" data-st="outfit:' + c + '"></button>').join('') + '<button class="chip" data-st="outfit:">Era default</button></div>' +
    '<h3>Accent</h3><div class="sw">' + SW.map(c => '<button class="swatch ' + (st.accent === c ? 'on' : '') + '" style="background:' + c + '" data-st="accent:' + c + '"></button>').join('') + '<button class="chip" data-st="accent:">Default</button></div>' +
    '<h3>Silhouette</h3><div class="chips">' + [['mix','Mixed'],['all','All pants'],['none','All skirts']].map(([k, l]) => '<button class="chip ' + (st.pants === k ? 'on' : '') + '" data-st="pants:' + k + '">' + l + '</button>').join('') + '</div>', {});
}
function stageDesigner() {
  const st = ST();
  stageSheet('Stage designer', '<h3>LED wall and lights</h3><div class="sw">' + SW.map(c => '<button class="swatch ' + (st.tint === c ? 'on' : '') + '" style="background:' + c + '" data-st="tint:' + c + '"></button>').join('') + '<button class="chip" data-st="tint:">Match the era</button></div>' +
    '<p class="small faint">The crowd\'s lightsticks use your fandom colour' + (S().group.light ? '' : ' once you pick one') + '.</p>', { cuts:true });
}
function choreoBuilder() {
  const st = ST(), names = { kfHook:'Hook', kfWave:'Wave combo', kfPower:'Power hit', kfCute:'Cute point', step:'Step touch', wave:'Arm wave', hips:'Hip sway', point:'Point up', body:'Body roll', clap:'Clap', jump:'Jump', spin:'Spin' };
  stageSheet('Choreography builder', '<p class="small muted">Chain up to eight moves. It becomes the group\'s signature routine on every stage, and a signature routine makes dance trends a little more likely.</p>' +
    '<div class="seqline">' + (st.choreo.length ? st.choreo.map((m, i) => '<button class="chip on" data-st="rm:' + i + '">' + (i + 1) + '. ' + names[m] + ' ×</button>').join('') : '<span class="small faint">No moves yet: the default routine plays.</span>') + '</div>' +
    '<h3>Add a move</h3><div class="chips">' + S3.DANCE.map(m => '<button class="chip" data-st="add:' + m + '" ' + (st.choreo.length >= 8 ? 'disabled' : '') + '>' + names[m] + '</button>').join('') + '</div>' +
    '<button class="btn ghost sm" data-st="clear:">Clear</button>', { routine:st.choreo });
}
function logoDesigner() {
  const st = ST(), L = st.logo, s = S();
  UI.sheet('<span class="eyebrow">Logo</span><h2>Group logo</h2><div class="logoprev">' + logoHtml() + '</div>' +
    '<h3>Type</h3><div class="chips">' + [['serif','Serif'],['mono','Mono'],['sans','Sans'],['wide','Wide']].map(([k, l]) => '<button class="chip ' + (L.font === k ? 'on' : '') + '" data-st="font:' + k + '">' + l + '</button>').join('') + '</div>' +
    '<h3>Colour</h3><div class="sw">' + SW.map(c => '<button class="swatch ' + (L.color === c ? 'on' : '') + '" style="background:' + c + '" data-st="color:' + c + '"></button>').join('') + '</div>' +
    '<h3>Symbol</h3><div class="chips">' + ['', '★', '✦', '◆', '●', '∞', '♡'].map(x => '<button class="chip ' + (L.sym === x ? 'on' : '') + '" data-st="sym:' + x + '">' + (x || 'None') + '</button>').join('') + '</div>' +
    '<p class="small faint">The logo appears in the header and on your share card. ' + (s.group.formed ? '' : 'It uses the group name once the group is named.') + '</p>');
}
function logoHtml() { const s = S(), L = ST().logo; return '<span class="logo3 lf-' + L.font + '" style="color:' + L.color + '">' + esc(L.sym ? L.sym + ' ' : '') + esc(s.group.formed ? s.group.name : 'DREAM ACADEMY') + esc(L.sym ? ' ' + L.sym : '') + '</span>'; }
UI.logoHtml = logoHtml;
G.choreoBonus = () => ST().choreo.length >= 4;

/* ---------- Playback: music videos and best stages ---------- */
function player(title, sub, o, secs) {
  const w = document.createElement('div'); w.className = 'scn mvp';
  w.innerHTML = '<div class="mg-top"><span class="rec">REC</span><b>' + esc(title) + '</b><button class="btn ghost sm" data-x>Close</button></div><div class="scn-3d"></div><div class="mv-cap"><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></div>';
  document.body.appendChild(w);
  const C = window.S3 ? S3.mount(w.querySelector('.scn-3d'), Object.assign({ set:'stage', cuts:true, noDrag:true, routine:ST().choreo }, o)) : null;
  if (C) C.dance(true, o.bpm || 112);
  const stop = window.MG ? MG.beatLoop(o.bpm || 112, secs || 20) : () => {};
  const end = () => { clearTimeout(tm); stop(); if (C) C.destroy(); w.remove(); };
  const tm = setTimeout(end, (secs || 20) * 1000 + 600);
  w.querySelector('[data-x]').addEventListener('click', end);
}
function playMV(rid) {
  const s = S(), r = s.group.releases.find(x => x.id === rid); if (!r) return;
  player('"' + r.title + '"', r.kind + ' · ' + r.concept + ' · ' + (r.peak > 100 ? 'off chart' : 'peak No. ' + r.peak) + (r.mv ? ' · MV ' + r.mv : ''),
    { set:'mv', cast:castFor(G.activeMembers()), tint:UI.ERA_COL[r.concept] || G.stageTint(), light:s.group.light, bpm:100 + (r.id * 7) % 30 }, 20);
}
function playBest() {
  const b = ST().best; if (!b) return;
  player('Best stage: ' + Math.round(b.acc * 100) + '%', 'Month ' + pad3(b.m) + ' · ' + b.title, { set:'stage', cast:castFor(b.ids.filter(G.inPlay).length ? b.ids.filter(G.inPlay) : G.activeMembers()), tint:G.stageTint(), light:S().group.light, bpm:118 }, 18);
}
UI.onGame = (kind, o, acc) => { if (acc != null && kind === 'live' && S()) { const st = ST(); if (!st.best || acc > st.best.acc) { st.best = { acc, m:S().month, title:o && o.title || 'Live stage', ids:(o && o.cast || []).map(x => x.id).filter(id => G.CAST[id]) }; G.save(); } } };

/* ---------- Documentary mode ---------- */
async function documentary() {
  const s = S(), chs = D.chapters.filter(c => c.from <= s.month), sets = ['practice','practice','stage','dorm','mv','stage','stage','street'];
  for (const c of chs) {
    const lg = s.log.filter(l => l.m >= c.from && l.m <= c.to && ['story','show','release','chapter','eval'].includes(l.kind)).reverse();
    const mm = (s.mem && s.mem.moments || []).filter(x => x.m >= c.from && x.m <= c.to);
    const picks = lg.filter((l, i) => i % Math.max(1, Math.floor(lg.length / 4)) === 0).slice(0, 4);
    const lines = [['N', 'Chapter ' + c.n + ': ' + c.name + '. Months ' + c.from + ' to ' + Math.min(c.to, s.month) + '.']]
      .concat(picks.map(l => ['N', 'Month ' + l.m + '. ' + l.t]))
      .concat(mm.slice(0, 2).map(x => ['N', 'On camera: ' + x.t + '.']));
    const cast = (c.n <= 3 ? [s.focus].concat(G.trainees ? s.order.slice(0, 4) : []) : G.activeMembers()).filter((x, i, a) => x && a.indexOf(x) === i && G.CAST[x]).slice(0, 6);
    const go = await new Promise(res => { UI.playScene({ set:sets[c.n - 1], cast, lines }, 'Documentary · Chapter ' + c.n).then(() => res(true)); });
    if (!go) break;
  }
  UI.toast('That\'s a wrap.');
}

/* ---------- Animated weekly chart ---------- */
const FILLER = ['Paper Planes','Night Bus','Gold Rush','Halo Effect','Cold Coffee','Runaway Train','Slow Burn','Lucky Number','Neon Rain','Second Wind','Static Love','Sun Dial'];
function weeklyChart() {
  const s = S(), rows = [];
  s.group.releases.filter(r => s.month - r.month <= 5 && r.chart.length).forEach(r => rows.push({ t:r.title, a:s.group.name, p:r.chart[r.chart.length - 1], you:true }));
  (G.rivals ? G.rivals() : []).forEach(r => r.songs.filter(x => s.month - x.m <= 4).forEach(x => rows.push({ t:x.t, a:r.name, p:Math.min(101, x.peak + (s.month - x.m) * 6) })));
  const taken = new Set(rows.map(r => r.p));
  let k = 0; for (let p = 1; p <= 20; p++) if (!taken.has(p)) rows.push({ t:FILLER[(p + s.month) % FILLER.length], a:['Rae Montoya','Twin Signal','June Ito','Paper Moons','K.Vale','DJ Halcyon'][(p * 7 + s.month) % 6], p, filler:true }), k++;
  const top = rows.filter(r => r.p <= 20).sort((a, b) => a.p - b.p).slice(0, 20);
  UI.sheet('<span class="eyebrow">Fictional chart · Month ' + pad3(s.month) + '</span><h2>This week\'s top 20</h2><div class="wchart">' +
    top.map((r, i) => '<div class="wrow ' + (r.you ? 'you' : '') + '" style="animation-delay:' + (i * 60) + 'ms"><b class="mono">' + r.p + '</b><div><span>' + esc(r.t) + '</span><em>' + esc(r.a) + '</em></div></div>').join('') + '</div>');
}

/* ---------- Photo mode ---------- */
const SETS = [['stage','Stage'],['practice','Practice room'],['dorm','Dorm'],['mv','MV set'],['studio','Studio'],['office','Office'],['makeup','Makeup room'],['airport','Airport'],['street','Street'],['backstage','Backstage'],['fansign','Fansign']];
let photo = { set:'stage', pose:'fairy' };
function photoMode() {
  const ids = G.debuted() ? G.activeMembers() : G.cast().slice(0, 6);
  stageSheet('Photo mode', '<h3>Location</h3><div class="chips">' + SETS.map(([k, l]) => '<button class="chip ' + (photo.set === k ? 'on' : '') + '" data-st="pset:' + k + '">' + l + '</button>').join('') + '</div>' +
    '<h3>Pose</h3><div class="chips">' + [['fairy','Ending fairy'],['cheer','Cheer'],['hug','Hug'],['clap','Clap'],['wave','Wave'],['point','Point'],['gasp','Surprised'],['kfCute','Cute'],['dance','Dancing']].map(([k, l]) => '<button class="chip ' + (photo.pose === k ? 'on' : '') + '" data-st="ppose:' + k + '">' + l + '</button>').join('') + '</div>' +
    '<p class="small faint">Drag the picture to turn the camera.</p><button class="btn big" data-st="snap:">Save photo</button>',
    { set:photo.set, cast:castFor(ids), photo:true, cuts:false, orbit:false },
    (m, C) => { if (!C) return; if (photo.pose === 'dance') C.dance(true, 112); else { C.dance(false); C.play(photo.pose); } photo.C = C; });
}

/* ---------- Records ---------- */
function records() {
  const pr = G.profile(), runs = pr.runs;
  const best = (f, l, fmt) => { const r = runs.slice().sort((a, b) => f(b) - f(a))[0]; return '<div class="logrow"><b>' + l + '</b><p class="small muted">' + (r && f(r) > 0 ? fmt(r) : 'No run yet.') + '</p></div>'; };
  UI.sheet('<span class="eyebrow">This device</span><h2>Personal records</h2>' +
    best(r => r.fans, 'Most fans', r => G.fmt(r.fans) + ' · ' + n(r.focus) + ' · ' + r.date) +
    best(r => r.no1, 'Most No. 1s', r => r.no1 + ' · ' + n(r.focus) + ' · ' + r.date) +
    best(r => r.firstNo1 ? 200 - r.firstNo1 : 0, 'Fastest No. 1', r => 'Month ' + r.firstNo1 + ' · ' + n(r.focus)) +
    best(r => r.wins, 'Most awards', r => r.wins + ' · ' + n(r.focus)) +
    best(r => r.trophies, 'Most trophies in one run', r => r.trophies + ' · ' + n(r.focus)) +
    best(r => r.best < 101 ? 101 - r.best : 0, 'Best chart peak', r => 'No. ' + r.best + ' · ' + n(r.focus)) +
    '<p class="small faint">Records stay on this device. There are no online leaderboards in this fan game.</p>');
}
// Track the month of the first No. 1 for the records.
const _adv = G.advance;
G.advance = () => { const r = _adv(); const s = S(); if (r && s && s.rec.no1 && !s.flags.firstNo1) s.flags.firstNo1 = s.month - 1;
  if (r && s && s.ended) { const pr = G.profile(); if (pr.runs[0] && pr.runs[0].firstNo1 == null) { pr.runs[0].firstNo1 = s.flags.firstNo1 || null; G.saveProfile(pr); } }
  if (s && G.choreoBonus() && r) s.flags.choreoBonus = 1; return r; };

/* ---------- Studio hub ---------- */
function hub() {
  const s = S();
  UI.sheet('<span class="eyebrow">Studio</span><h2>Make it yours</h2><div class="stack tight">' +
    (G.debuted() ? '<button class="choice" data-st="go:outfit"><b>Outfit designer</b><span>Colours and silhouettes for the group</span></button>' +
      '<button class="choice" data-st="go:stage"><b>Stage designer</b><span>LED wall and lighting colour</span></button>' +
      '<button class="choice" data-st="go:choreo"><b>Choreography builder</b><span>Your signature routine</span></button>' +
      '<button class="choice" data-st="go:logo"><b>Group logo</b><span>Type, colour and symbol</span></button>' : '<p class="small muted">Designers unlock when the group forms.</p>') +
    '<button class="choice" data-st="go:photo"><b>Photo mode</b><span>Pose the members anywhere and save a picture</span></button>' +
    (s.group.releases.length ? '<button class="choice" data-st="go:chart"><b>This week\'s chart</b><span>The fictional top 20</span></button>' : '') +
    (ST().best ? '<button class="choice" data-st="go:best"><b>Replay your best stage</b><span>' + Math.round(ST().best.acc * 100) + '% · month ' + ST().best.m + '</span></button>' : '') +
    '<button class="choice" data-st="go:doc"><b>Watch your documentary</b><span>Your run so far, chapter by chapter</span></button>' +
    '<button class="choice" data-st="go:records"><b>Personal records</b><span>Bests across every run on this device</span></button></div>');
}
UI.studio = { hub, playMV, records };

document.addEventListener('click', e => {
  const b = e.target.closest('[data-st]'); if (!b || !S()) { const mv = e.target.closest('[data-mv]'); if (mv && S()) playMV(+mv.dataset.mv); const sh = e.target.closest('[data-a=studio]'); if (sh && S()) hub(); return; }
  const [k, v] = b.dataset.st.split(/:(.*)/s), st = ST();
  if (k === 'go') { ({ outfit:outfitDesigner, stage:stageDesigner, choreo:choreoBuilder, logo:logoDesigner, photo:photoMode, chart:weeklyChart, best:playBest, doc:() => { UI.closeSheet(); documentary(); }, records })[v](); return; }
  if (k === 'outfit' || k === 'accent') { st[k] = v || null; G.save(); outfitDesigner(); UI.render(); return; }
  if (k === 'pants') { st.pants = v; G.save(); outfitDesigner(); UI.render(); return; }
  if (k === 'tint') { st.tint = v || null; G.save(); stageDesigner(); return; }
  if (k === 'add') { if (st.choreo.length < 8) st.choreo.push(v); S3.routine = st.choreo; G.save(); choreoBuilder(); return; }
  if (k === 'rm') { st.choreo.splice(+v, 1); S3.routine = st.choreo; G.save(); choreoBuilder(); return; }
  if (k === 'clear') { st.choreo = []; S3.routine = []; G.save(); choreoBuilder(); return; }
  if (k === 'font' || k === 'color' || k === 'sym') { st.logo[k] = v; G.save(); logoDesigner(); UI.render(); return; }
  if (k === 'pset') { photo.set = v; photoMode(); return; }
  if (k === 'ppose') { photo.pose = v; if (photo.C) { if (v === 'dance') photo.C.dance(true, 112); else { photo.C.dance(false); photo.C.play(v); } } document.querySelectorAll('[data-st^="ppose:"]').forEach(x => x.classList.toggle('on', x === b)); return; }
  if (k === 'snap') { const url = photo.C && photo.C.snapshot(); if (!url) { UI.toast('Photos need the 3D view.'); return; } const a = document.createElement('a'); a.href = url; a.download = 'dream-academy-photo.png'; document.body.appendChild(a); a.click(); a.remove(); UI.toast('Photo saved.'); return; }
});
// Keep the signature routine live on every 3D stage.
UI.afterRender = () => { if (S() && window.S3) S3.routine = ST().choreo; const hd = document.querySelector('.top .date'); if (hd && S() && S().group.formed && !document.querySelector('.top .glogo')) hd.parentNode.insertAdjacentHTML('beforeend', '<div class="glogo">' + logoHtml() + '</div>'); };
})();
