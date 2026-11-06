/* The Eras Life: player control (interface). Story style, deadlines, handing tasks to the team,
   auto-play, a week off, the calendar, working ahead, singles any time, marketing, and moving eras. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, VIEWS, ACT, toast, sessionResult } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();

/* ---------- New game and settings: story style ---------- */
function styleCard(cur, act) {
  return `<div class="chips">${G.STYLES.map(st => `<button class="chip ${cur === st.id ? 'on' : ''}" data-act="${act}" data-v="${st.id}">${h(st.n)}</button>`).join('')}</div><p class="small muted" id="${act}-d">${h(G.STYLES.find(x => x.id === cur).d)}</p>`;
}
new MutationObserver(() => {
  const begin = $('[data-act=begin]');
  if (begin && UI.newg && !$('#fr-new')) { UI.newg.fr = UI.newg.fr || 'canon';
    begin.insertAdjacentHTML('beforebegin', `<section class="card" id="fr-new"><h2>Story style</h2>${styleCard(UI.newg.fr, 'nfr')}<p class="small faint">You can change this later in Settings.</p></section>`); }
  const set = $('.modal [data-act=pref][data-k=text]');
  if (set && G.S() && !$('#fr-set')) { const f = G.fr();
    set.closest('.sheet').querySelector('h2').insertAdjacentHTML('afterend', `<div id="fr-set"><h3>Story style</h3>${styleCard(f.mode, 'sfr')}
      <h3>Deadlines instead of required tasks</h3><p class="small muted">Work is due by a date, and you choose which weeks to do it.</p><div class="chips"><button class="chip ${f.deadlines ? 'on' : ''}" data-act="sfrk" data-k="deadlines" data-v="1">On</button><button class="chip ${!f.deadlines ? 'on' : ''}" data-act="sfrk" data-k="deadlines" data-v="0">Off</button></div>
      <h3>Opportunities</h3><div class="chips">${[[0, 'None'], [.2, 'Fewer'], [.35, 'Normal'], [.6, 'More']].map(([v, l]) => `<button class="chip ${f.opp === v ? 'on' : ''}" data-act="sfrk" data-k="opp" data-v="${v}">${l}</button>`).join('')}</div>
      <h3>What-if side stories</h3><div class="chips"><button class="chip ${f.whatif ? 'on' : ''}" data-act="sfrk" data-k="whatif" data-v="1">On</button><button class="chip ${!f.whatif ? 'on' : ''}" data-act="sfrk" data-k="whatif" data-v="0">Off</button></div>
      <h3>Invented drama in free play</h3><div class="chips">${[[0, 'None'], [.5, 'Less'], [1, 'Normal'], [2, 'More']].map(([v, l]) => `<button class="chip ${f.drama === v ? 'on' : ''}" data-act="sfrk" data-k="drama" data-v="${v}">${l}</button>`).join('')}</div></div>`); }
}).observe(document.body, { childList:true, subtree:true });
ACT.nfr = d => { UI.newg.fr = d.v; if (ACT.nmode) ACT.nmode({ v:UI.newg.mode }); };
ACT.sfr = d => { G.setStyle(d.v); G.save(); const box = $('#fr-set'); if (box) box.remove(); toast(`Story style: ${G.STYLES.find(x => x.id === d.v).n}.`); };
ACT.sfrk = d => { const v = d.k === 'deadlines' || d.k === 'whatif' ? d.v === '1' : +d.v; G.setFr(d.k, v); G.save(); const box = $('#fr-set'); if (box) box.remove(); };

/* ---------- This Week: plan, auto-play, a week off, the calendar ---------- */
function planCard() {
  const s = S(); if (s.flags.retired) return '';
  const cal = G.calendar(16).slice(0, 8);
  return card(`<div class="between"><h2>Plan</h2>${pill(G.STYLES.find(x => x.id === G.frMode()).n)}</div>
    <div class="row"><button class="btn sm" data-act="auto" data-n="1">Auto-play this week</button><button class="btn ghost sm" data-act="auto" data-n="4">Auto-play 4 weeks</button><button class="btn ghost sm" data-act="timeoff" ${s.week.done.timeoff ? 'disabled' : ''}>Take this week off</button></div>
    <p class="small faint">Auto-play does your required work, then your saved routine, and stops for every real event and decision. A week off restores Energy; your team covers what it can for a fee.</p>
    ${cal.length ? `<h3>Coming up</h3>${cal.map(c => `<div class="between small"><span>${h(c.l)}</span><span class="${c.abs === s.abs ? 'spot' : 'muted'}">${c.abs === s.abs ? 'This week' : h(G.fmtDate(c.abs))}</span></div>`).join('')}` : ''}`);
}
ACT.auto = d => { const r = G.autoplay(+d.n); render(); toast(r.played ? `Played ${r.played} week${r.played > 1 ? 's' : ''}.${r.why ? ' ' + r.why : ''}` : (r.why || 'This week needs you.')); };
ACT.timeoff = () => { const r = G.timeOff(); if (r.err) return toast(r.err); render(); toast(r.msg); };
ACT.delegate = d => { const r = G.delegate(d.id); if (r.err) return toast(r.err); render(); toast(r.msg); };
const week0 = VIEWS.week;
VIEWS.week = function () { const html = week0(), pc = planCard(); const i = html.indexOf('<div class="actions">'); return i < 0 ? html + pc : html.slice(0, i) + pc + html.slice(i); };

/* ---------- Songbook: work ahead ---------- */
function aheadCard() {
  const ps = G.aheadAlbums(); if (!ps.length) return '';
  return ps.map(p => { const left = p.tracks.filter(t => !S().songs[t]);
    return card(`<div class="between"><h2>Work ahead: ${h(p.short || p.title)}</h2>${pill(`Writing starts ${G.fmtDate(G.win(p).ws)}`)}</div><p class="small muted">Get a head start. Songs you write now count when the era begins.</p>
      <div class="songs">${p.tracks.map(t => { const so = S().songs[t]; return `<div class="song ${so ? 'has' : ''}"><b>${h(t)}</b>${so ? pill(`Written · ${so.q}`) : `<button class="btn sm" data-act="write" data-p="${p.id}" data-t="${h(t)}" ${G.canSpend(2) ? '' : 'disabled'}>Write · 2</button>`}</div>`; }).join('')}</div>${left.length ? '' : '<p class="small">Every song is written already.</p>'}`); }).join('');
}
const sb0 = VIEWS.songbook;
VIEWS.songbook = function () { return sb0() + aheadCard(); };

/* ---------- Rollout: singles any time, marketing ---------- */
function singlesCard(p) {
  const pj = G.pj(p.id), opts = G.singleOptions(p), ok = G.canSingleNow(p), sel = UI.sel['sn:' + p.id] && opts.includes(UI.sel['sn:' + p.id]) ? UI.sel['sn:' + p.id] : opts[0];
  return card(`<div class="between"><h2>Singles: ${h(p.short || p.title)}</h2>${pill(`${pj.singles.length} released`)}</div><p class="small muted">Release a single whenever you like, as long as three weeks have passed since the last one.</p>
    ${opts.length ? `<label class="field"><span>Song</span><select data-act="snsel" data-p="${p.id}">${opts.map(t => `<option ${t === sel ? 'selected' : ''}>${h(t)}</option>`).join('')}</select></label>
    ${sel && S().songs[sel] && S().songs[sel].radio != null ? `<p class="small">Radio appeal: <b>${G.radioWord(S().songs[sel].radio)}</b></p>` : ''}
    <button class="btn sm" data-act="snow" data-p="${p.id}" ${ok && G.canSpend(1) ? '' : 'disabled'}>Release it · 1 block</button>${!ok && pj.lastSingle ? `<p class="small faint">Next single possible ${G.fmtDate(pj.lastSingle + 3)}.</p>` : ''}` : '<p class="small faint">No recorded songs left to send to radio.</p>'}
    ${pj.singles.length ? `<p class="small">So far: ${pj.singles.map(h).join(', ')}</p>` : ''}`);
}
ACT.snsel = (d, el) => { UI.sel['sn:' + d.p] = el.value; render(); };
ACT.snow = d => { const r = G.singleNow(d.p, UI.sel['sn:' + d.p]); if (r && r.err) return toast(r.err); render(); if (r && r.msg) toast(r.msg); };
function marketCard(p) {
  const pj = G.pj(p.id), m = pj.mkt || {}, spent = Object.values(m).reduce((a, x) => a + x.spent, 0);
  return card(`<div class="between"><h2>Marketing: ${h(p.short || p.title)}</h2>${pill(`Hype ${Math.round(pj.hype)}`)}</div><p class="small muted">Spend your own money to build hype. Each channel can be used once a week, and repeats give a little less.${spent ? ` Spent so far: ${G.fmtM(spent)}.` : ''}</p>
    ${G.CHANNELS.map(c => `<div class="mkt"><div><b>${h(c.n)}</b><div class="small muted">${h(c.d)}</div></div><div class="row">${G.TIERS.map((t, i) => `<button class="btn ghost sm" data-act="mkt" data-p="${p.id}" data-c="${c.id}" data-t="${i}" ${(m[c.id] && m[c.id].wk === S().abs) || S().stats.money < G.marketCost(i) ? 'disabled' : ''}>${t.n} · ${G.fmtM(G.marketCost(i))}</button>`).join('')}</div></div>`).join('')}`);
}
ACT.mkt = d => { const r = G.market(d.p, d.c, +d.t); if (r.err) return toast(r.err); render(); toast(r.msg); };
const ro0 = VIEWS.rollout;
VIEWS.rollout = function () {
  const s = S(), ps = G.allProjects().filter(p => p.type !== 'demos');
  const sing = ps.filter(p => G.pj(p.id).released && ['promo','tourprep','tour','rest'].includes(G.stageOf(p, s.abs)));
  const mk = ps.filter(p => G.canMarket(p));
  let html = ro0();
  if (sing.length || mk.length) html = html.replace(/<section class="card"><h2>Rollout<\/h2><p class="muted">No release is being planned right now\.[^<]*<\/p><\/section>/, '');
  return html + sing.map(singlesCard).join('') + mk.map(marketCard).join('');
};

/* ---------- Studio: move, delay or skip eras ---------- */
function erasCard() {
  const s = S(), mode = G.frMode(); if (mode === 'canon' || s.mode !== 'story') return '';
  const ps = G.art().projects.filter(p => p.type !== 'demos' && p.type !== 'edition' && p.rel != null && !(s.pj[p.id] && s.pj[p.id].released)).filter(p => { const w = G.win(p); return w.rel > s.abs && w.rel - s.abs < 520; }).slice(0, 4);
  if (!ps.length) return '';
  return card(`<h2>Your eras</h2><p class="small muted">${mode === 'guided' ? 'Guided: move a real album up to 12 weeks from its real date, before finishing starts.' : 'Sandbox: move, delay or skip eras freely. Real event cards keep their real dates.'}</p>
    ${ps.map(p => { const w = G.win(p), pj = G.pj(p.id), st = G.stageOf(p, s.abs), sh = pj.shift || 0; return `<div class="eracontrol"><div class="between"><b>${h(p.title)}</b><span class="small muted">${pj.skipped ? 'Skipped' : `Out ${h(G.fmtDate(w.rel))}`}${sh ? ` · ${sh > 0 ? '+' : ''}${sh} weeks` : ''}</span></div>
      <div class="row">${s.abs < w.fs && !pj.skipped ? `<button class="btn ghost sm" data-act="move" data-p="${p.id}" data-d="-4">4 weeks earlier</button><button class="btn ghost sm" data-act="move" data-p="${p.id}" data-d="4">4 weeks later</button>` : ''}
      ${mode === 'sandbox' && st === 'none' && w.ws > s.abs && !pj.skipped ? `<button class="btn ghost sm" data-act="delay" data-p="${p.id}" data-d="26">Delay the whole era 6 months</button>` : ''}
      ${mode === 'sandbox' && (st === 'none' || pj.skipped) ? `<button class="btn ghost sm" data-act="skip" data-p="${p.id}" data-v="${pj.skipped ? 0 : 1}">${pj.skipped ? 'Bring it back' : 'Skip this era'}</button>` : ''}</div></div>`; }).join('')}`);
}
ACT.delay = d => { const r = G.delayEra(d.p, +d.d); if (r.err) return toast(r.err); render(); toast(r.msg); };
ACT.skip = d => { const r = G.skipEra(d.p, d.v === '1'); if (r.err) return toast(r.err); render(); toast(d.v === '1' ? 'Era skipped. Real events about it still happen on their dates.' : 'The era is back.'); };
const st0 = VIEWS.studio;
VIEWS.studio = function () { return erasCard() + st0(); };
})();
