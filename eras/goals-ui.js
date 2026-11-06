/* The Eras Life: long-term goals (interface). Year recaps you can save as an image, the legacy
   score and Hall of Fame, scenarios, and rival storylines. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, VIEWS, ACT, toast, modal, closeModals } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();

/* ---------- Year in review ---------- */
function recapCard() { const s = S(); if (s.recapYear == null || s.recapSeen) return ''; const r = G.yearRecap(s.recapYear); if (!r) return '';
  return card(`<span class="eyebrow">Your ${r.y}</span><h2>A year in review</h2><p class="small muted">${r.releases.length ? `${r.releases.map(h).join(', ')} came out. ` : ''}${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)} fans and ${G.fmtM(r.money)} this year.</p>
    <div class="row"><button class="btn sm" data-act="yr">See your year</button><button class="btn ghost sm" data-act="yrhide">Hide</button></div>`, 'world'); }
function yearModal() { const s = S(), r = G.yearRecap(s.recapYear); if (!r) return; closeModals();
  const stat = (v, l) => `<div><b>${v}</b><div class="small muted">${l}</div></div>`;
  modal(`<span class="eyebrow">${h(G.art().name)}</span><h2>Your ${r.y}</h2>
    <div class="grid3">${stat(`${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)}`, 'Fans')}${stat(G.fmtM(r.money), 'Money')}${stat(G.fmtN(r.units), 'Units sold')}</div>
    <div class="grid3">${stat(r.shows, 'Shows')}${stat(r.shows5, 'Five-star nights')}${stat(r.awards.length, 'Awards')}</div>
    ${r.releases.length ? `<h3>Released</h3><p>${r.releases.map(h).join(' · ')}</p>` : ''}${r.songs.length ? `<h3>Top songs</h3><ol class="small">${r.songs.map(t => `<li>${h(t)}</li>`).join('')}</ol>` : ''}
    ${r.no1.length ? `<h3>No. 1 singles</h3><p class="small">${r.no1.map(h).join(', ')}</p>` : ''}${r.awards.length ? `<h3>Awards</h3><p class="small">${r.awards.map(h).join(' · ')}</p>` : ''}
    ${r.moments.length ? `<h3>Moments</h3>${r.moments.map(m => `<p class="small">✦ ${h(m)}</p>`).join('')}` : ''}
    <div class="row" style="margin-top:12px"><button class="btn" data-act="yrimg">Save as an image</button>${navigator.share ? '<button class="btn ghost" data-act="yrshare">Share</button>' : ''}<button class="btn ghost" data-act="yrdone">Done</button></div>`); G.ach('recap'); }
function recapImage(r) { const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d'), e = G.currentEra(), col = (e && e.color) || '#d6a93a';
  const g = x.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, col); g.addColorStop(.55, '#1a1424'); g.addColorStop(1, '#0c0910'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = '#ffffffcc'; x.font = '700 36px "Plus Jakarta Sans", sans-serif'; x.fillText(G.art().name.toUpperCase(), 80, 130);
  x.fillStyle = '#fff'; x.font = '800 150px Fraunces, Georgia, serif'; x.fillText(String(r.y), 80, 300); x.font = '700 54px "Plus Jakarta Sans", sans-serif'; x.fillText('My year in The Eras Life', 80, 380);
  const rows = [['Fans', `${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)}`], ['Units sold', G.fmtN(r.units)], ['Shows', String(r.shows)], ['Awards', String(r.awards.length)]];
  rows.forEach(([l, v], i) => { const X = 80 + (i % 2) * 470, Y = 500 + Math.floor(i / 2) * 190; x.fillStyle = '#ffffff14'; x.fillRect(X, Y, 440, 160); x.fillStyle = '#ffffffaa'; x.font = '600 32px "Plus Jakarta Sans", sans-serif'; x.fillText(l, X + 30, Y + 55); x.fillStyle = '#fff'; x.font = '800 64px "Plus Jakarta Sans", sans-serif'; x.fillText(v, X + 30, Y + 130); });
  x.fillStyle = '#ffffffaa'; x.font = '600 32px "Plus Jakarta Sans", sans-serif'; x.fillText(r.songs.length ? 'Top songs' : 'Released', 80, 950);
  x.fillStyle = '#fff'; x.font = '700 42px "Plus Jakarta Sans", sans-serif'; (r.songs.length ? r.songs : r.releases).slice(0, 5).forEach((t, i) => x.fillText(`${i + 1}. ${t}`.slice(0, 40), 80, 1010 + i * 58));
  x.fillStyle = '#ffffff88'; x.font = '500 26px "Plus Jakarta Sans", sans-serif'; x.fillText('An unofficial fan game. Titles only, no lyrics.', 80, 1300);
  return c; }
ACT.yr = () => yearModal();
ACT.yrhide = () => { S().recapSeen = true; render(); };
ACT.yrdone = () => { S().recapSeen = true; closeModals(); render(); };
ACT.yrimg = () => { const r = G.yearRecap(S().recapYear), c = recapImage(r), a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `eras-life-${r.y}.png`; document.body.appendChild(a); a.click(); a.remove(); toast('Image saved.'); };
ACT.yrshare = () => { const r = G.yearRecap(S().recapYear); recapImage(r).toBlob(b => { const f = new File([b], `eras-life-${r.y}.png`, { type:'image/png' }); const d = { title:`My ${r.y} in The Eras Life` }; if (navigator.canShare && navigator.canShare({ files:[f] })) d.files = [f]; navigator.share(d).catch(() => {}); }); };

/* ---------- Scenario progress ---------- */
function scenCard() { const s = S(), x = s.scen; if (!x) return ''; const sc = ER.SCENARIOS.find(y => y.id === x.id); if (!sc) return ''; const best = G.scenBest()[x.id + ':' + s.artist];
  return card(`<div class="between"><span class="eyebrow">Scenario: ${h(sc.n)}</span>${x.done ? pill('Done', 'ok') : x.failed ? pill('Over') : pill(`${s.abs - x.start} weeks`)}</div><p class="small">${h(sc.goal)}.${x.done ? ` Finished in ${x.weeks} weeks.` : ''}${best ? ` Your best: ${best} weeks.` : ''}</p>`, 'world'); }
const week0 = VIEWS.week;
VIEWS.week = function () { const html = week0(), add = recapCard() + scenCard(); if (!add) return html; const i = html.indexOf('<div class="stagewrap'); return i < 0 ? add + html : html.slice(0, i) + add + html.slice(i); };

/* ---------- Legacy: score, ending, Hall of Fame ---------- */
function hofRows(list) { return list.slice(0, 10).map((x, i) => `<div class="chart"><b>${i + 1}</b><div><b>${h(x.name)}</b><div class="small muted">${h(x.ending)} · ${x.year}${x.own ? ' · your own artist' : ''}</div></div><span class="small">${x.score}</span></div>`).join(''); }
function legacyCard() { const s = S(), e = G.ending(), list = G.hof();
  return card(`<div class="between"><h2>Your legacy</h2>${pill(`Score ${e.score}`)}</div><p><b>${h(e.n)}</b></p><p class="small">${h(e.x)}</p><p class="small muted">${h(e.trait)}</p>
    <p class="small faint">Your ending is written when you retire. Until then it can still change.</p><button class="btn ghost sm" data-act="hofadd">Add this career to the Hall of Fame</button>
    ${list.length ? `<h3>Hall of Fame</h3>${hofRows(list)}` : ''}`); }
ACT.hofadd = () => { G.addToHof(); toast('Added to the Hall of Fame.'); render(); };
const leg0 = VIEWS.legacy;
VIEWS.legacy = function () { return legacyCard() + leg0(); };
new MutationObserver(() => { const end = $('.modal #t3end'); if (end && G.S() && !$('#end-legacy')) { const e = G.ending();
  end.insertAdjacentHTML('afterend', `<div id="end-legacy" class="truth"><span class="eyebrow">Your ending · legacy score ${e.score}</span><p><b>${h(e.n)}</b></p><p class="small">${h(e.x)} ${h(e.trait)}</p></div>`); }
  const tg = $('.title .tgrid'); if (tg && !$('#hof-card')) { const list = G.hof(); if (list.length) tg.insertAdjacentHTML('beforeend', `<section class="card" id="hof-card"><h2>Hall of Fame</h2><p class="small muted">Your greatest careers, across every save.</p>${hofRows(list)}</section>`); } })
  .observe(document.body, { childList:true, subtree:true });

/* ---------- Rivals ---------- */
function rivalsCard() { const R = G.rivalry();
  return card(`<h2>Rivals</h2><p class="small muted">Invented stars in this game. How you treat them changes the story between you.</p>
    ${Object.keys(R).map(n => `<div class="rs"><span>${h(n)}</span><div class="bar rv"><i style="width:${(R[n] + 100) / 2}%"></i></div><b class="small">${h(G.rivalWord(R[n]))}</b></div>`).join('')}`); }
const press0 = VIEWS.press;
VIEWS.press = function () { return press0() + rivalsCard(); };

/* ---------- New game: scenarios ---------- */
new MutationObserver(() => { const begin = $('[data-act=begin]'); if (begin && UI.newg && !$('#scen-new')) { const n = UI.newg; n.scen = n.scen || '';
  begin.insertAdjacentHTML('beforebegin', `<section class="card" id="scen-new"><h2>Scenario (optional)</h2><p class="small muted">A challenge with its own goal and a best time.</p><div class="chips"><button class="chip ${!n.scen ? 'on' : ''}" data-act="nscen" data-v="">None</button>${ER.SCENARIOS.map(sc => `<button class="chip ${n.scen === sc.id ? 'on' : ''}" data-act="nscen" data-v="${sc.id}">${h(sc.n)}</button>`).join('')}</div>${n.scen ? `<p class="small">${h(ER.SCENARIOS.find(x => x.id === n.scen).d)}</p>` : ''}</section>`); } })
  .observe(document.body, { childList:true, subtree:true });
ACT.nscen = d => { UI.newg.scen = d.v; const c = $('#scen-new'); if (c) c.remove(); };
const ng0 = G.newGame;
G.newGame = function (o) { const r = ng0.apply(this, arguments); const sc = window.UI && UI.newg && UI.newg.scen; if (sc) G.startScenario(sc); return r; };
})();
