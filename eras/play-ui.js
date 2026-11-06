/* The Eras Life: new things to play (interface). The concert mini-game, video shots, show acts,
   merch designer, Loop (an invented streaming app) and creating your own artist. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, VIEWS, ACT, toast, mount3D, lookFor } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();

/* ---------- Saves of invented artists show on the title screen ---------- */
const si0 = G.slotInfo;
G.slotInfo = function (slot) { try { const v = G.lsGet('eras-slot-' + slot); if (v) { const s = JSON.parse(v); if (s.genArtist && !ER.artists[s.artist]) ER.artists[s.artist] = s.genArtist; } } catch (e) {} return si0.apply(this, arguments); };

/* ---------- The concert mini-game ---------- */
const BPM = { country:92, romantic:84, pop:112, dark:100, quiet:76 };
new MutationObserver(() => { const m = $('.modal [data-act=shmoment]'); if (m && UI.show && UI.show.sh && !$('#rh-box')) {
  const r = UI.show.sh.rhythm; m.insertAdjacentHTML('beforebegin', `<div id="rh-box" class="rhbox">${r == null ? '<button class="btn" data-act="rhythm">Play the big song: tap along</button><p class="small faint">Optional. Good timing lifts tonight\'s review.</p>' : `<p class="small">You hit <b>${Math.round(r * 100)}%</b> of the big song. ${r >= .8 ? 'The crowd is screaming.' : r >= .5 ? 'A solid performance.' : 'A few missed cues.'}</p>`}</div>`); } })
  .observe(document.body, { childList:true, subtree:true });
ACT.rhythm = () => { const e = G.currentEra(), mood = (e && ER.ERA_MOOD[e.id]) || 'pop'; startRhythm(BPM[mood] || 100, score => { if (UI.show && UI.show.sh) UI.show.sh.rhythm = score; const b = $('#rh-box'); if (b) b.remove(); }); };
function startRhythm(bpm, done) {
  const beat = 60 / bpm, LEN = 14, travel = 1.5, notes = [], lanes = 3, r = Math.random;
  for (let t = 1.2; t < LEN; t += beat) { if (r() < .82) notes.push({ t, lane:Math.floor(r() * lanes), hit:0 }); if (r() < .18) notes.push({ t:t + beat / 2, lane:Math.floor(r() * lanes), hit:0 }); }
  const ov = document.createElement('div'); ov.id = 'rhythm'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Tap along to the beat');
  ov.innerHTML = `<div class="rh-top"><b>Tap the notes as they reach the line</b><span id="rh-sc">0%</span></div><canvas id="rh-c"></canvas><div class="rh-lanes">${[0, 1, 2].map(i => `<button class="rh-l" data-lane="${i}" aria-label="Lane ${i + 1}">${['◀', '●', '▶'][i]}</button>`).join('')}</div><button class="btn ghost sm rh-skip" id="rh-skip">Skip</button>`;
  document.body.appendChild(ov);
  const cv = ov.querySelector('#rh-c'), cx = cv.getContext('2d'), col = getComputedStyle(document.documentElement).getPropertyValue('--era').trim() || '#d6a93a';
  const fit = () => { cv.width = cv.clientWidth * (devicePixelRatio || 1); cv.height = cv.clientHeight * (devicePixelRatio || 1); }; fit();
  const t0 = performance.now() / 1000 + .3; let raf = 0, perfect = 0, good = 0, over = false, flash = [0, 0, 0];
  const now = () => performance.now() / 1000 - t0;
  const tap = lane => { const t = now(); let best = null, bd = 1;
    notes.forEach(n => { if (n.lane === lane && !n.hit) { const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } } });
    if (best && bd < .16) { best.hit = bd < .07 ? 2 : 1; if (best.hit === 2) perfect++; else good++; flash[lane] = 1; if (window.SND) SND.blip(best.hit === 2); } };
  const score = () => notes.length ? (perfect + good * .6) / notes.length : 0;
  const end = () => { if (over) return; over = true; cancelAnimationFrame(raf); window.removeEventListener('keydown', key); ov.remove(); done(Math.max(0, Math.min(1, score()))); };
  const key = e => { const m = { ArrowLeft:0, ArrowDown:1, ArrowRight:2, a:0, s:1, d:2, j:0, k:1, l:2, '1':0, '2':1, '3':2 }[e.key]; if (m != null) { e.preventDefault(); tap(m); } if (e.key === 'Escape') end(); };
  window.addEventListener('keydown', key);
  ov.querySelectorAll('.rh-l').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); tap(+b.dataset.lane); }));
  ov.querySelector('#rh-skip').addEventListener('click', () => { notes.length = 0; perfect = good = 0; over = true; cancelAnimationFrame(raf); window.removeEventListener('keydown', key); ov.remove(); done(.5); });
  const draw = () => { const t = now(), W = cv.width, H = cv.height, lw = W / lanes, line = H * .86;
    cx.clearRect(0, 0, W, H);
    for (let i = 0; i < lanes; i++) { cx.fillStyle = flash[i] > 0 ? `rgba(255,255,255,${.12 * flash[i]})` : (i % 2 ? '#ffffff06' : '#ffffff0c'); cx.fillRect(i * lw, 0, lw, H); flash[i] = Math.max(0, flash[i] - .08); }
    cx.fillStyle = col; cx.fillRect(0, line - 2, W, 4);
    notes.forEach(n => { if (n.hit) return; const y = line - (n.t - t) / travel * line; if (y < -20 || y > H + 20) return; if (t - n.t > .2) { n.hit = -1; return; }
      cx.beginPath(); cx.arc(n.lane * lw + lw / 2, y, Math.min(lw, H) * .09, 0, 6.283); cx.fillStyle = col; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = '#fff8'; cx.stroke(); });
    const sc = ov.querySelector('#rh-sc'); if (sc) sc.textContent = Math.round(score() * 100) + '%';
    if (t > LEN + .6) return end(); raf = requestAnimationFrame(draw); };
  raf = requestAnimationFrame(draw);
}
UI.startRhythm = startRhythm;

/* ---------- Music videos: pick three shots and watch the cut ---------- */
const SHOTS = [['stadium','A stadium'], ['theater','A theatre'], ['studio','The studio'], ['home','At home'], ['farm','A farm'], ['bedroom','A bedroom'], ['press','A city street'], ['awards','A red carpet'], ['rehearsal','A dance hall'], ['bus','A tour bus']];
new MutationObserver(() => { const go = $('.modal [data-act=vdgo]'); if (go && UI.vd && !$('#vd-shots')) { UI.vd.shots = UI.vd.shots || ['studio', 'press', 'stadium'];
  go.insertAdjacentHTML('beforebegin', `<div id="vd-shots"><h3>Your three shots</h3>${[0, 1, 2].map(i => `<label class="field"><span>Shot ${i + 1}</span><select data-act="vdshot" data-i="${i}">${SHOTS.map(([id, l]) => `<option value="${id}" ${UI.vd.shots[i] === id ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`).join('')}
    <button class="btn ghost sm" data-act="vdcut">Watch the cut</button><p class="small faint">Three different locations make a more exciting video.</p></div>`); } })
  .observe(document.body, { childList:true, subtree:true });
ACT.vdshot = (d, el) => { UI.vd.shots[+d.i] = el.value; };
ACT.vdcut = () => { const v = UI.vd, p = G.proj(v.pid); let i = 0; clearInterval(UI.vdTimer);
  const show = () => { if (!$('#t3vid')) return clearInterval(UI.vdTimer); mount3D('#t3vid', { set:v.shots[i % 3], color:p.color, figs:[{ look:lookFor(['stadium','theater','awards'].includes(v.shots[i % 3]) ? 'tour' : '', p), anim:['sing','dance','idle'][i % 3], mic:['stadium','theater'].includes(v.shots[i % 3]) }] }, 'vid'); i++; if (i >= 6) clearInterval(UI.vdTimer); };
  show(); UI.vdTimer = setInterval(show, 1600); };
const vdgo0 = ACT.vdgo;
ACT.vdgo = d => { const v = UI.vd, uniq = new Set(v && v.shots || []).size; clearInterval(UI.vdTimer); vdgo0(d); if (uniq >= 3) { G.applyFx({ hype:2, fans:.3 }); toast('Three locations: the video feels like a film.'); } };

/* ---------- The show's acts ---------- */
new MutationObserver(() => { const sl = $('#main [data-act=sacts]'); const plan = UI.sel.plan; if (sl && plan && plan.design && !$('#acts-ed')) {
  const n = plan.design.acts || 5, L = plan.design.actList = (plan.design.actList || []).slice(0, n); while (L.length < n) L.push({ fx:G.EFFECTS[L.length % G.EFFECTS.length][0], change:L.length > 0 });
  const eras = [...new Set((plan.setlist || []).map(t => (S().songs[t] || {}).p).filter(Boolean))].map(id => G.proj(id)).filter(Boolean);
  sl.closest('.card').insertAdjacentHTML('beforeend', `<div id="acts-ed"><h3>The acts</h3>${L.map((a, i) => `<div class="actrow"><b>Act ${i + 1}${eras[i] ? `: ${h(eras[i].short || eras[i].title)}` : ''}</b><select data-act="actfx" data-i="${i}" aria-label="Effect for act ${i + 1}">${G.EFFECTS.map(([id, l]) => `<option value="${id}" ${a.fx === id ? 'selected' : ''}>${l}</option>`).join('')}</select><button class="chip sm ${a.change ? 'on' : ''}" data-act="actch" data-i="${i}">${a.change ? 'Costume change' : 'Same costume'}</button></div>`).join('')}
    <p class="small">Show flow bonus: <b>+${G.actScore(L).toFixed(2)}</b> stars a night. Vary the effects and change costumes between most acts.</p></div>`); } })
  .observe(document.body, { childList:true, subtree:true });
ACT.actfx = (d, el) => { UI.sel.plan.design.actList[+d.i].fx = el.value; render(); };
ACT.actch = d => { const a = UI.sel.plan.design.actList[+d.i]; a.change = !a.change; render(); };

/* ---------- Merch designer ---------- */
const MCOL = ['#ffffff','#111111','#c1272d','#e88fb4','#f2c94c','#3f8f5a','#2f6fd6','#7d4cc2','#d6a93a','#9aa3ad'];
function merchSVG(d, size) {
  const shape = { tee:'M30 18 L42 12 Q50 18 58 12 L70 18 L82 32 L72 40 L68 34 L68 88 L32 88 L32 34 L28 40 L18 32 Z', hoodie:'M28 22 L42 12 Q50 24 58 12 L72 22 L84 40 L74 46 L70 38 L70 90 L30 90 L30 38 L26 46 L16 40 Z', poster:'M22 10 H78 V90 H22 Z', vinyl:'', tote:'M24 30 H76 L72 90 H28 Z M38 30 Q38 12 50 12 Q62 12 62 30', bracelet:'' }[d.item] || 'M22 10 H78 V90 H22 Z';
  const body = d.item === 'vinyl' ? `<circle cx="50" cy="50" r="40" fill="${d.c1}"/><circle cx="50" cy="50" r="30" fill="none" stroke="#0003"/><circle cx="50" cy="50" r="12" fill="${d.c2}"/><circle cx="50" cy="50" r="2" fill="#000"/>`
    : d.item === 'bracelet' ? Array.from({ length:9 }, (_, i) => `<circle cx="${50 + Math.cos(i / 9 * 6.283) * 30}" cy="${50 + Math.sin(i / 9 * 6.283) * 30}" r="7" fill="${i % 2 ? d.c1 : d.c2}"/>`).join('') : `<path d="${shape}" fill="${d.c1}" stroke="#0004"/>`;
  const txt = d.text ? `<text x="50" y="${d.item === 'poster' ? 80 : d.item === 'vinyl' ? 92 : 70}" text-anchor="middle" font-size="7" font-weight="800" font-family="Plus Jakarta Sans, sans-serif" fill="${d.item === 'vinyl' || d.item === 'bracelet' ? '#fff' : d.c2}">${h(d.text.slice(0, 18))}</text>` : '';
  const art = d.sym && d.sym !== 'none' && d.item !== 'vinyl' && d.item !== 'bracelet' ? `<g transform="translate(35 ${d.item === 'poster' ? 25 : 34}) scale(.3)" fill="${d.c2}" stroke="${d.c2}">${UI.coverSVG({ pal:'x', sym:d.sym, lay:'centered', fin:'matte' }, 100).replace(/^.*?<rect[^>]*\/>/, '').replace(/<\/svg>$/, '').replace(/fill="[^"]*"/g, '').replace(/stroke="[^"]*"/g, '')}</g>` : '';
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Merch design">${body}${art}${txt}</svg>`; }
function merchCard() { const s = S(); if (s.flags.retired) return '';
  const d = UI.sel.md = UI.sel.md || { item:'tee', c1:'#111111', c2:'#f2c94c', sym:'star', text:s.merchName || (G.currentEra() || {}).short || '' };
  return card(`<div class="between"><h2>Merch designer</h2>${s.merchWeek ? pill(`${G.fmtM(s.merchWeek)} last week`) : ''}</div><p class="small muted">Design merch for your table. It sells all the time, and three times as much on tour.</p>
    <div class="merchwrap">${merchSVG(d, 150)}<div><p class="small">Fans will rate it about <b>${G.merchScore(Object.assign({}, d))}</b>.</p></div></div>
    <div class="chips">${G.MERCH.map(m => `<button class="chip ${d.item === m.id ? 'on' : ''}" data-act="md" data-k="item" data-v="${m.id}">${h(m.n)}</button>`).join('')}</div>
    <h3>Main colour</h3><div class="sw-row">${MCOL.map(c => `<button class="swb ${d.c1 === c ? 'on' : ''}" style="background:${c}" data-act="md" data-k="c1" data-v="${c}" aria-label="Main colour ${c}"></button>`).join('')}</div>
    <h3>Print colour</h3><div class="sw-row">${MCOL.map(c => `<button class="swb ${d.c2 === c ? 'on' : ''}" style="background:${c}" data-act="md" data-k="c2" data-v="${c}" aria-label="Print colour ${c}"></button>`).join('')}</div>
    <h3>Image</h3><div class="chips">${['none'].concat(ER.SYMBOLS).map(sy => `<button class="chip sm ${d.sym === sy ? 'on' : ''}" data-act="md" data-k="sym" data-v="${sy}">${sy === 'none' ? 'None' : h(sy)}</button>`).join('')}</div>
    <label class="field"><span>Text (titles and words of your own only)</span><input id="md-text" value="${h(d.text || '')}" maxlength="18"></label>
    <button class="btn sm" data-act="mdadd">Make it · ${G.fmtM(Math.round(G.payScale() * G.MERCH.find(m => m.id === d.item).cost))}</button>
    ${(s.merch || []).length ? `<h3>On your table</h3><div class="shelf">${s.merch.map(m => `<div class="sh">${merchSVG(m, 80)}<span class="small">${h(G.MERCH.find(x => x.id === m.item).n)} · ${m.score}</span><span class="small muted">${G.fmtN(m.sold)} sold</span><button class="btn ghost sm" data-act="mdret" data-id="${m.id}">Retire</button></div>`).join('')}</div>` : ''}`); }
ACT.md = d => { const t = $('#md-text'); if (t) UI.sel.md.text = t.value; UI.sel.md[d.k] = d.v; render(); };
ACT.mdadd = () => { const t = $('#md-text'); if (t) UI.sel.md.text = t.value; const r = G.addMerch(Object.assign({}, UI.sel.md)); if (r.err) return toast(r.err); render(); toast(`On the table. Fans rate it ${r.m.score}.`); };
ACT.mdret = d => { G.retireMerch(d.id); render(); };
const fan0 = VIEWS.fandom;
VIEWS.fandom = function () { return fan0() + merchCard(); };

/* ---------- Loop: streaming chart and playlist pitches ---------- */
function loopCard() { const s = S(); if (!G.loopOn()) return card(`<h2>Loop</h2><p class="small muted">Streaming and short videos arrive in 2012. Loop is an invented app in this game.</p>`);
  const ch = G.loopChart(), L = s.loop || {}, rel = Object.keys(s.songs).filter(t => s.songs[t].st === 'released').slice(-30).reverse(), sel = UI.sel.pitch && rel.includes(UI.sel.pitch) ? UI.sel.pitch : rel[0];
  return card(`<div class="between"><h2>Loop chart</h2>${L.weekTotal ? pill(`${G.fmtN(L.weekTotal)} streams last week`) : ''}</div><p class="small muted">Loop is an invented streaming and short-video app. Its chart is separate from the real charts.</p>
    ${L.trend && L.trend.until >= s.abs ? `<p class="small">🔥 <b>"${h(L.trend.t)}"</b> is trending.</p>` : ''}
    ${ch.length ? ch.map((c, i) => `<div class="chart ${c.you ? 'you' : 'rival'}"><b>${i + 1}</b><div><b>${h(c.t)}</b><div class="small muted">${h(c.by)}${c.rival ? ' (invented)' : ''}${c.trend ? ' · trending' : ''}</div></div><span class="small">${G.fmtN(c.v)}</span></div>`).join('') : '<p class="small faint">Release a song to see it here.</p>'}
    ${rel.length ? `<h3>Pitch a song to a playlist</h3><label class="field"><span>Song</span><select data-act="pitchsel">${rel.map(t => `<option ${t === sel ? 'selected' : ''}>${h(t)}</option>`).join('')}</select></label><button class="btn sm" data-act="pitch" ${G.canPitch() && G.canSpend(1) ? '' : 'disabled'}>Pitch it · 1 block</button>` : ''}`); }
ACT.pitchsel = (d, el) => { UI.sel.pitch = el.value; };
ACT.pitch = () => { const rel = Object.keys(S().songs).filter(t => S().songs[t].st === 'released').slice(-30).reverse(); const r = G.pitch(UI.sel.pitch && rel.includes(UI.sel.pitch) ? UI.sel.pitch : rel[0]); if (r.err) return toast(r.err); render(); toast(r.msg); };
const charts0 = VIEWS.charts;
VIEWS.charts = function () { return charts0() + loopCard(); };

/* ---------- Your own artist ---------- */
const HAIRS = ['#f3db94','#c99a5b','#6b3e26','#1d1612','#b5462f','#e7a1b8','#9fb7e8'], SKINS = ['#f6d9c4','#efc9a4','#d9a77f','#b07a52','#8d5524','#5c3a21'];
new MutationObserver(() => { const n = UI.newg; if (!n) return; const chips = document.querySelector('[data-act=nartist]'); if (chips && !$('#own-chip')) chips.parentNode.insertAdjacentHTML('beforeend', `<button id="own-chip" class="chip ${n.own ? 'on' : ''}" data-act="nown"><i class="dot" style="background:conic-gradient(#f6d38a,#e88fb4,#8fb8e8,#f6d38a)"></i>Your own artist</button>`);
  if (n.own) { document.querySelectorAll('[data-act=nartist]').forEach(b => b.classList.remove('on'));
    const card0 = chips && chips.closest('.card'); if (card0 && !$('#own-form')) { const o = n.ownArtist = n.ownArtist || { name:'', fanName:'', home:'', genre:'pop', hair:HAIRS[2], skin:SKINS[1] };
      card0.insertAdjacentHTML('afterend', `<section class="card" id="own-form"><h2>Your own artist</h2><p class="small muted">A fully invented career that starts in 2027, from the first open mic. Every song, era and rival is yours.</p>
        <label class="field"><span>Name</span><input id="own-name" value="${h(o.name)}" maxlength="40" placeholder="Your artist's name"></label>
        <label class="field"><span>What fans are called</span><input id="own-fans" value="${h(o.fanName)}" maxlength="30" placeholder="For example: Night Owls"></label>
        <label class="field"><span>Hometown</span><input id="own-home" value="${h(o.home)}" maxlength="40" placeholder="Anywhere"></label>
        <h3>Sound</h3><div class="chips">${G.GENRES.map(([id, l]) => `<button class="chip ${o.genre === id ? 'on' : ''}" data-act="ownset" data-k="genre" data-v="${id}">${l}</button>`).join('')}</div>
        <h3>Hair</h3><div class="sw-row">${HAIRS.map(c => `<button class="swb ${o.hair === c ? 'on' : ''}" style="background:${c}" data-act="ownset" data-k="hair" data-v="${c}" aria-label="Hair ${c}"></button>`).join('')}</div>
        <h3>Skin</h3><div class="sw-row">${SKINS.map(c => `<button class="swb ${o.skin === c ? 'on' : ''}" style="background:${c}" data-act="ownset" data-k="skin" data-v="${c}" aria-label="Skin ${c}"></button>`).join('')}</div></section>`); }
    document.querySelectorAll('#main ~ *, .title .card').forEach(c => { const t = c.querySelector('h2'); if (t && /^(Mode|Era looks|Story style)$/.test(t.textContent.trim())) c.style.display = 'none'; }); } })
  .observe(document.body, { childList:true, subtree:true });
const keep = () => { const o = UI.newg && UI.newg.ownArtist; if (!o) return; [['name', 'own-name'], ['fanName', 'own-fans'], ['home', 'own-home']].forEach(([k, id]) => { const el = $('#' + id); if (el) o[k] = el.value; }); };
ACT.nown = () => { const n = UI.newg; n.own = !n.own; if (ACT.nmode) ACT.nmode({ v:n.mode || 'story' }); };
const nartist0 = ACT.nartist; ACT.nartist = d => { if (UI.newg) UI.newg.own = false; nartist0(d); };
ACT.ownset = d => { keep(); UI.newg.ownArtist[d.k] = d.v; if (ACT.nmode) ACT.nmode({ v:UI.newg.mode || 'story' }); };
const begin0 = ACT.begin;
ACT.begin = d => { const n = UI.newg; if (!n || !n.own) return begin0(d); keep(); const o = n.ownArtist;
  if (!o.name.trim()) return toast('Give your artist a name.');
  G.createArtist({ name:o.name, fanName:o.fanName, home:o.home, genre:o.genre, hair:o.hair, skin:o.skin, slot:n.slot, diff:n.diff, look:n.look });
  UI.newg = null; UI.tab = 'week'; render(); };
})();
