/* The Eras Life: interface for the freedom systems (song structure, your own songs, tracklists,
   tour prep timing, ways to do tasks and opportunities). Uses the helpers exposed on UI. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, modal, closeModals, VIEWS, ACT, toast, sessionResult } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();
const SEC = id => (ER.SECTIONS.find(x => x.id === id) || { n:id }).n;

/* ---------- Song structure panel ---------- */
function craft(pid) { if (!UI.craft || UI.craft.pid !== pid) UI.craft = { pid, sec:[], tempo:'mid', mood:'bright', lean:'band', own:'' }; return UI.craft; }
function craftHTML(c, opts) {
  const r = G.craftScore(c, c.pid), chips = (k, arr) => `<div class="chips">${arr.map(x => `<button class="chip ${c[k] === x.id ? 'on' : ''}" data-act="crset" data-k="${k}" data-v="${x.id}">${h(x.n)}</button>`).join('')}</div>`;
  return `<h3>Song structure <span class="faint" style="text-transform:none;letter-spacing:0">(optional)</span></h3>
    <p class="small muted">Build the shape of the song, section by section. Leave it empty to just write.</p>
    <div class="chips">${ER.SONG_PRESETS.map(p => `<button class="chip" data-act="crpre" data-v="${p.id}">${h(p.n)}</button>`).join('')}</div>
    <div class="secline" aria-label="Song sections in order">${c.sec.length ? c.sec.map((x, i) => `<button class="sec s-${x}" data-act="crdel" data-i="${i}" aria-label="Remove ${h(SEC(x))}">${h(SEC(x))} ×</button>`).join('') : '<span class="small faint">No sections yet. Pick a preset or add sections below.</span>'}</div>
    <div class="chips">${ER.SECTIONS.map(x => `<button class="chip sm" data-act="cradd" data-v="${x.id}">+ ${h(x.n)}</button>`).join('')}${c.sec.length ? '<button class="chip sm" data-act="crclear">Clear</button>' : ''}</div>
    <h3>Tempo</h3>${chips('tempo', ER.TEMPOS)}<h3>Mood</h3>${chips('mood', ER.MOODS)}<h3>Sound</h3>${chips('lean', ER.LEANS)}
    ${c.sec.length ? `<div class="crscore"><span>Quality <b>${r.dq >= 0 ? '+' : ''}${r.dq}</b></span><span>Radio appeal <b>${G.radioWord(r.radio)}</b></span><span>Fan favourite <b>${G.radioWord(r.fav)}</b></span></div>${r.notes.map(n => `<p class="small muted">${h(n)}</p>`).join('')}` : ''}
    ${opts && opts.own ? `<h3>Or a song of your own</h3><input id="cr-own" value="${h(c.own || '')}" placeholder="Type your own title (titles only)" maxlength="60" style="width:100%;background:var(--raised);border:1px solid var(--rule);border-radius:10px;padding:8px 10px"><p class="small faint">Fill this in to write your own song for this album instead. It goes on as an extra track; the real tracklist stays as it was.</p>` : ''}`;
}
function paintCraft() { const box = $('#craft'); if (!box || !UI.craft) return; const own = box.dataset.own === '1'; box.innerHTML = craftHTML(UI.craft, { own }); }
// Put the panel into the writing session whenever it opens.
new MutationObserver(() => {
  const go = $('.modal [data-act=wgo]');
  if (go && UI.ws && !$('#craft')) { craft(UI.ws.pid); go.insertAdjacentHTML('beforebegin', `<div id="craft" data-own="1"></div>`); paintCraft(); }
}).observe(document.body, { childList:true, subtree:true });
document.addEventListener('input', e => { if (e.target.id === 'cr-own' && UI.craft) UI.craft.own = e.target.value; if (e.target.id === 'nb-title' && UI.craft) UI.craft.title = e.target.value; });
ACT.crpre = d => { const c = UI.craft; if (!c) return; c.sec = ER.SONG_PRESETS.find(p => p.id === d.v).s.slice(); paintCraft(); };
ACT.cradd = d => { const c = UI.craft; if (!c || c.sec.length >= 14) return; c.sec.push(d.v); paintCraft(); };
ACT.crdel = d => { const c = UI.craft; if (!c) return; c.sec.splice(+d.i, 1); paintCraft(); };
ACT.crclear = () => { if (UI.craft) { UI.craft.sec = []; paintCraft(); } };
ACT.crset = d => { if (UI.craft) { UI.craft[d.k] = d.v; paintCraft(); } };

// Writing: carry the structure into the song, or write a song of your own for this album.
const wgo0 = ACT.wgo;
ACT.wgo = d => {
  const c = UI.craft, w = UI.ws, own = c && (c.own || '').trim();
  if (own && w) {
    const err = G.titleOk(own); if (err) return toast(err);
    const r = writeOwn(own, c, w.pid); if (r.err) return toast(r.err);
    UI.ws = null; UI.craft = null; render();
    return sessionResult(`"${r.t}"`, [{ x:`A song of your own for ${G.proj(w.pid).title}.` }, { x:`Quality ${r.so.q}${r.so.radio != null ? ` · Radio appeal ${G.radioWord(r.so.radio)}` : ''}` }, ...(r.so.note ? [{ x:r.so.note, c:'small muted' }] : []), { x:'Record it in the Studio, then place it in the tracklist.', c:'small faint' }]);
  }
  G._craft = c && c.sec.length ? { sec:c.sec.slice(), tempo:c.tempo, mood:c.mood, lean:c.lean } : null;
  wgo0(d); G._craft = null; UI.craft = null;
};
function writeOwn(title, c, pid) {
  const cr = c && c.sec.length ? { sec:c.sec.slice(), tempo:c.tempo, mood:c.mood, lean:c.lean } : null;
  if (!G.taskDone('notebook')) return G.doTask('notebook', { t:title, craft:cr, pid });
  if (!G.canSpend(2)) return { err:'No Time Blocks left this week.' };
  const r = G.writeOwn(title, cr, pid); if (r.ok) S().week.used += 2; return r;
}

/* ---------- The notebook ---------- */
function notebookModal() {
  const albums = G.openAlbums(), c = craft(UI.craft && UI.craft.nb ? UI.craft.pid : (albums[0] ? albums[0].id : null));
  c.nb = true; if (c.title == null) c.title = G.freshOwnTitle();
  closeModals();
  modal(`<span class="eyebrow">Your notebook</span><h2>Write a song of your own</h2>
    <label class="field"><span>Title</span><input id="nb-title" value="${h(c.title)}" maxlength="60"></label><div class="row"><button class="btn ghost sm" data-act="nbname">Suggest another title</button></div>
    <label class="field"><span>Where does it go?</span><select data-act="nbwhere"><option value="">Keep it in the notebook for now</option>${albums.map(p => `<option value="${p.id}" ${c.pid === p.id ? 'selected' : ''}>On ${h(p.title)} (extra track)</option>`).join('')}</select></label>
    <div id="craft" data-own="0"></div>
    <p class="small faint">Your own songs are invented and never replace a real song. Titles only, never lyrics.</p>
    <button class="btn big" data-act="nbgo">Write it · 2 blocks</button><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="closem">Not now</button></div>`);
  paintCraft();
}
UI.notebookModal = notebookModal;
ACT.nbname = () => { if (!UI.craft) return; UI.craft.title = G.freshOwnTitle(); const i = $('#nb-title'); if (i) i.value = UI.craft.title; };
ACT.nbwhere = (d, el) => { if (!UI.craft) return; UI.craft.pid = el.value || null; paintCraft(); };
ACT.nbgo = () => { const c = UI.craft; if (!c) return; const t = (c.title || '').trim(); const err = G.titleOk(t); if (err) return toast(err);
  const r = writeOwn(t, c, c.pid || null); if (r.err) return toast(r.err);
  const so = S().songs[r.t || t]; UI.craft = null; render();
  sessionResult(`"${r.t || t}"`, [{ x:c.pid ? `It goes on ${G.proj(c.pid).title} as an extra track.` : 'It is in your notebook. Put it on an album whenever one is being made.' }, { x:`Quality ${so.q}${so.radio != null ? ` · Radio appeal ${G.radioWord(so.radio)}` : ''}` }, ...(so.note ? [{ x:so.note, c:'small muted' }] : [])]); };
ACT.nbattach = (d, el) => { const pid = el && el.tagName === 'SELECT' ? el.value : d.p; if (!pid) return; G.attachSong(d.t, pid); toast(`"${d.t}" is now on ${G.proj(pid).title}.`); render(); };
ACT.nbdetach = d => { G.detachSong(d.t); toast(`"${d.t}" is back in your notebook.`); render(); };

function craftLine(so) { if (!so || !so.craft) return ''; return `${so.craft.sec.map(SEC).join(' · ')}`; }
function notebookCard() {
  const s = S(); if (!s || s.flags.retired || G.age() < 10) return '';
  const nb = G.notebook(), albums = G.openAlbums(), own = Object.keys(s.songs).filter(t => s.songs[t].own && s.songs[t].p != null);
  return card(`<div class="between"><h2>Your notebook</h2><button class="btn sm" data-act="do" data-id="notebook" ${G.taskDone('notebook') || !G.canSpend(2) ? 'disabled' : ''}>Write a song · 2</button></div>
    <p class="small muted">Write songs of your own at any time, then put them on any album while it is being made. They sit beside the real tracklist and never replace it.</p>
    ${nb.length ? nb.map(t => { const so = s.songs[t]; return `<div class="song"><div><b>${h(t)}</b><div class="small muted">Quality ${so.q}${so.radio != null ? ` · Radio ${G.radioWord(so.radio)}` : ''}${so.craft ? ' · ' + h(craftLine(so)) : ''}</div></div>
      ${albums.length ? `<select data-act="nbattach" data-t="${h(t)}" aria-label="Put on an album"><option value="">Put on an album…</option>${albums.map(p => `<option value="${p.id}">${h(p.short || p.title)}</option>`).join('')}</select>` : '<span class="small faint">No album is being made</span>'}</div>`; }).join('') : '<p class="small faint">The notebook is empty.</p>'}
    ${own.length ? `<h3>Your songs on albums</h3>${own.slice(-12).map(t => { const so = s.songs[t], p = G.proj(so.p); return `<div class="between small"><span>${h(t)} <span class="muted">· ${h(p ? p.short || p.title : '')} · ${so.st === 'written' ? 'Written' : so.st === 'recorded' ? 'Recorded' : 'Released'}</span></span>${so.st !== 'released' ? `<button class="btn ghost sm" data-act="nbdetach" data-t="${h(t)}">Back to notebook</button>` : ''}</div>`; }).join('')}` : ''}`);
}
const songbook0 = VIEWS.songbook;
VIEWS.songbook = function () { return notebookCard() + songbook0(); };

/* ---------- Tracklist ---------- */
function tracklistCard(p) {
  const s = S(), pj = G.pj(p.id), L = G.tracklist(p.id), r = G.seqScore(p.id), st = G.stageOf(p, s.abs);
  const finTask = st === 'finish' && !pj.fin.sequence;
  return card(`<div class="between"><h2>Tracklist: ${h(p.short || p.title)}</h2>${pj.seqLocked ? pill('Order set', 'ok') : pill('Draft')}</div>
    <p class="small muted">Put the songs in your own order. A strong opener, your best song early, a real closer and a heartfelt track 5 help the reviews.${p.custom ? '' : ' It starts in the real order.'}</p>
    <ol class="tlist">${L.map((t, i) => { const so = s.songs[t]; return `<li><span class="tn">${i + 1}</span><span class="tt"><b>${h(t)}</b><span class="small muted">${so ? `${so.st === 'written' ? 'Written' : so.st === 'recorded' ? 'Recorded' : 'Released'} · ${so.q}${so.own ? ' · Yours' : ''}` : 'Not written yet'}</span></span>
      <button class="btn ghost sm" data-act="trmv" data-p="${p.id}" data-t="${h(t)}" data-d="-1" ${i ? '' : 'disabled'} aria-label="Move up">↑</button><button class="btn ghost sm" data-act="trmv" data-p="${p.id}" data-t="${h(t)}" data-d="1" ${i < L.length - 1 ? '' : 'disabled'} aria-label="Move down">↓</button>${so && so.own ? `<button class="btn ghost sm ${so.deluxe ? 'on' : ''}" data-act="trdlx" data-t="${h(t)}" title="Deluxe edition only">${so.deluxe ? 'Deluxe' : 'Standard'}</button><button class="btn ghost sm" data-act="nbdetach" data-t="${h(t)}" aria-label="Take off the album">✕</button>` : G.canCut && G.canCut(p) && !pj.released ? `<button class="btn ghost sm" data-act="trcut" data-p="${p.id}" data-t="${h(t)}" data-v="1" aria-label="Cut from the album">Cut</button>` : ''}</li>`; }).join('')}</ol>
    ${(pj.cut || []).length ? `<h3>Cut songs</h3>${pj.cut.map(t => `<div class="between small"><span>${h(t)}</span><button class="btn ghost sm" data-act="trcut" data-p="${p.id}" data-t="${h(t)}" data-v="0">Put it back</button></div>`).join('')}<p class="small faint">Cut songs you wrote can go in the vault after release.${p.custom ? '' : ' The real album had them, so the Canon Score notes it.'}</p>` : ''}
    ${r.notes.map(n => `<p class="small">${h(n)}</p>`).join('')}<p class="small">Sequencing: <b>${r.b > 0 ? '+' : ''}${r.b}</b> to the album's quality.</p>
    <div class="row"><button class="btn sm" data-act="trlock" data-p="${p.id}">${finTask ? 'Lock this order · 1 block' : 'Lock this order'}</button><button class="btn ghost sm" data-act="trreset" data-p="${p.id}">Reset order</button></div>`);
}
ACT.trcut = d => { const r = G.cutSong(d.p, d.t, d.v === '1'); if (r.err) return toast(r.err); G.pj(d.p).seqLocked = null; render(); };
ACT.trdlx = d => { const so = S().songs[d.t]; G.setDeluxe(d.t, !(so && so.deluxe)); render(); };
ACT.trmv = d => { G.moveTrack(d.p, d.t, +d.d); G.pj(d.p).seqLocked = null; render(); };
ACT.trreset = d => { G.resetTracklist(d.p); G.pj(d.p).seqLocked = null; render(); };
ACT.trlock = d => { const p = G.proj(d.p), pj = G.pj(d.p), id = `fin:${d.p}:sequence`;
  if (G.stageOf(p, S().abs) === 'finish' && !pj.fin.sequence) { const r = G.doTask(id); if (r && r.err) return toast(r.err); }
  const r = G.lockTracklist(d.p); toast(`Track order set. ${r.b > 0 ? '+' : ''}${r.b} to the album's quality.`); render(); };
const studio0 = VIEWS.studio;
VIEWS.studio = function () {
  const s = S(), ps = G.allProjects().filter(p => p.type !== 'demos' && p.type !== 'rerecord' && p.type !== 'farewell' && p.tracks && ['write','record','finish','pre'].includes(G.stageOf(p, s.abs)));
  return studio0() + ps.map(tracklistCard).join('');
};

/* ---------- Rollout and tour task styles ---------- */
function styleFx(fx) { const o = Object.assign({}, fx); delete o.money; const t = G.fxText(o).replace(/quality/i, 'Album quality'); return t + (fx.money < 0 ? (t ? ', ' : '') + 'costs money' : ''); }
const do0 = ACT.do;
ACT.do = (d, el) => {
  const t = G.tasks().find(x => x.id === d.id);
  if (t && t.kind === 'notebook' && !d.arg && !UI.prefs.quick) return notebookModal();
  const sty = t && !d.arg && !UI.prefs.quick && !G.taskDone(t.id) && G.stylesFor(t);
  if (sty) {
    closeModals();
    return modal(`<span class="eyebrow">${h(G.proj(t.p) ? G.proj(t.p).title : '')}</span><h2>${h(t.l)}</h2><p class="small muted">How do you want to do it?</p>
      <div class="stack tight">${sty.map((x, i) => `<button class="choice" data-act="tstyle" data-id="${h(t.id)}" data-i="${i}">${h(x.n)}<div class="small muted">${h(x.d)} ${h(styleFx(x.fx))}</div></button>`).join('')}</div>
      <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="closem">Not now</button></div>`);
  }
  const was = t && G.taskDone(t.id);
  do0(d, el);
  if (t && t.kind === 'fin' && t.item === 'sequence' && !was && G.taskDone(t.id)) { const r = G.lockTracklist(t.p); toast(`Track order set. ${r.b > 0 ? '+' : ''}${r.b} to the album's quality.`); }
};
ACT.tstyle = d => { const t = G.tasks().find(x => x.id === d.id); closeModals(); if (!t) return render();
  const was = G.taskDone(t.id); do0({ id:d.id }); if (!was && G.taskDone(t.id)) { const r = G.applyStyle(t, +d.i); if (r) toast(r.r); render(); } };

/* ---------- Tour prep timing ---------- */
function prepCard(p) {
  const s = S(), r = G.prepRange(p); if (!r) return '';
  const cur = G.prepStart(p), len = r.ts - cur, opts = [];
  const add = (abs, l) => { abs = Math.max(r.lo, Math.min(r.hi, abs)); if (!opts.some(o => o[0] === abs)) opts.push([abs, l]); };
  add(r.lo, r.lo <= s.abs + 1 ? 'Start next week' : 'As early as possible'); add(r.ts - 16, '16 weeks before'); add(r.ts - 12, '12 weeks before'); add(r.ts - 8, '8 weeks before (standard)'); add(r.ts - 4, '4 weeks before (crunch)');
  opts.sort((a, b) => a[0] - b[0]);
  return card(`<div class="between"><h2>${h(p.tour.name)}: prep</h2>${pill(`${len} weeks of prep`)}</div>
    <p class="small muted">The first show is ${h(G.fmtDate(r.ts))}. Choose when tour preparation starts. A long prep spreads the work out and keeps the team calm. A short one piles it up and wears everyone down.</p>
    <p class="small">Prep starts <b>${h(G.fmtDate(cur))}</b>.</p>
    <div class="chips">${opts.map(([a, l]) => `<button class="chip ${a === cur ? 'on' : ''}" data-act="tpat" data-p="${p.id}" data-v="${a}">${h(l)} · ${h(G.fmtDate(a))}</button>`).join('')}</div>
    <p class="small faint">The show dates themselves stay where they really were.</p>`);
}
ACT.tpat = d => { if (G.setPrepStart(d.p, +d.v)) toast(`Tour prep starts ${G.fmtDate(G.prepStart(G.proj(d.p)))}.`); render(); };
const tour0 = VIEWS.tour;
VIEWS.tour = function () {
  const s = S(), ps = G.allProjects().filter(p => p.tour && p.tour.kind !== 'cancelled' && p.tour.kind !== 'opening' && !(s.pj[p.id] && s.pj[p.id].tourCancelled) && ['finish','pre','release','promo'].includes(G.stageOf(p, s.abs)));
  return ps.map(prepCard).join('') + tour0();
};

/* ---------- Opportunities on This Week ---------- */
function oppsCard() {
  const list = G.opps(); if (!list.length) return '';
  return card(`<h2>Opportunities</h2><p class="small muted">Optional offers. Take one, or let it pass. They are invented, not part of the real story.</p>
    ${list.map(x => `<div class="opp"><div class="between"><b>${h(x.o.t)}</b><span class="small faint">Until ${h(G.fmtDate(x.until))}</span></div><p class="small">${h(x.o.x)}</p>
      <div class="stack tight">${x.o.ch.map((c, i) => `<button class="choice" data-act="opp" data-u="${x.uid}" data-i="${i}" ${c.cost && !G.canSpend(c.cost) ? 'disabled' : ''}>${h(c.l)}<div class="small muted">${c.cost ? `${c.cost} block${c.cost > 1 ? 's' : ''}` : 'Free'}${Object.keys(c.fx || {}).length ? ' · ' + h(G.fxText(c.fx)) : ''}${c.pay > 0 ? ' · Paid' : c.pay < 0 ? ' · Costs money' : ''}${c.song ? ' · A new song' : ''}</div></button>`).join('')}</div></div>`).join('')}`);
}
ACT.opp = d => { const x = G.opps().find(y => y.uid === d.u), r = G.takeOpp(d.u, +d.i); if (r.err) return toast(r.err);
  render(); sessionResult(x ? x.o.t : 'Opportunity', r.lines.map(l => ({ x:l }))); };
const week0 = VIEWS.week;
VIEWS.week = function () { const html = week0(), oc = oppsCard(); if (!oc) return html; const i = html.indexOf('<div class="actions">'); return i < 0 ? html + oc : html.slice(0, i) + oc + html.slice(i); };
})();
