/* The Eras Life: fixes and quality of life.
   - Real event cards about an album move with it when you move it (Guided or Sandbox), and skip with it.
   - Move a save to another device with a code. A recap strip after each week.
   - Phone polish: a little vibration on taps, swiping between tabs, and 3D that rests when off screen.
   - Separate music and sound settings, with a melody layer over the mood music.
   - Offline play through a service worker. An updated getting-started guide. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI, T3 = window.T3;
const { h, card, VIEWS, ACT, toast, modal, closeModals } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();

/* ---------- Event cards move with their album ---------- */
const LINK = {};
function linkFor(e) {
  const a = S().artist, L = LINK[a] = LINK[a] || {}; if (e.id in L) return L[e.id];
  // Award shows, chart milestones and world events keep their own dates.
  if (/grammy|award|cma|acm|vma|\bamas?\b|brit|hall of fame|person of the year|record|billboard/i.test(e.t)) return (L[e.id] = null);
  let best = null, bd = 1e9;
  ER.artists[a].projects.forEach(p => { if (!p.title || p.title.length < 4 || p.type === 'demos' || p.rel == null) return;
    const re = new RegExp('\\b' + p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'); if (!re.test(e.t + ' ' + (e.x || ''))) return;
    const lo = (p.ws != null ? p.ws : p.rel) - 4, hi = (p.tour && p.tour.te != null ? p.tour.te : p.rel + 30) + 4;
    if (e.abs < lo || e.abs > hi) return; const d = Math.abs(e.abs - p.rel); if (d < bd) { bd = d; best = p.id; } });
  return (L[e.id] = best);
}
G.eventAbs = function (e) { const s = S(); if (!s || !s.fr || s.fr.mode === 'canon') return e.abs;
  const pid = linkFor(e); if (!pid) return e.abs; const pj = s.pj[pid]; if (!pj) return e.abs;
  if (pj.skipped && !pj.released) return -1; return e.abs + (pj.shift || 0); };

/* ---------- Move a save to another device ---------- */
async function pack(txt) { if (window.CompressionStream) { const cs = new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip')); const buf = new Uint8Array(await new Response(cs).arrayBuffer());
  let bin = ''; for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 8192)); return 'EL1:' + btoa(bin); } return 'EL0:' + btoa(unescape(encodeURIComponent(txt))); }
async function unpack(code) { code = code.trim(); if (code.startsWith('EL0:')) return decodeURIComponent(escape(atob(code.slice(4))));
  if (!code.startsWith('EL1:')) throw new Error('Not a save code'); const bin = atob(code.slice(4)), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip')); return await new Response(ds).text(); }
UI.packSave = pack; UI.unpackSave = unpack;
new MutationObserver(() => { const m = $('.modal [data-act=savenow]'); if (m && !$('#xfer-btns')) m.closest('.stack').insertAdjacentHTML('beforeend',
  '<div id="xfer-btns" class="stack tight"><button class="btn ghost" data-act="xferout">Move this save to another device</button><button class="btn ghost" data-act="xferin">Load a save from a code</button></div>'); })
  .observe(document.body, { childList:true, subtree:true });
ACT.xferout = async () => { G.save(); const code = await pack(G.exportSave()); closeModals();
  modal(`<h2>Move this save</h2><p class="small muted">Copy this code, then on the other device open the game, choose Menu → Load a save from a code, and paste it. The code holds your whole save, so keep it private.</p>
    <textarea id="xfer-code" readonly style="width:100%;height:140px;background:var(--raised);border:1px solid var(--rule);border-radius:12px;padding:10px;font-size:11px">${h(code)}</textarea>
    <div class="row"><button class="btn" data-act="xfercopy">Copy the code</button>${navigator.share ? '<button class="btn ghost" data-act="xfershare">Share</button>' : ''}<button class="btn ghost" data-act="closem">Done</button></div><p class="small faint">${code.length.toLocaleString()} characters.</p>`); };
ACT.xfercopy = async () => { const t = $('#xfer-code'); try { await navigator.clipboard.writeText(t.value); toast('Code copied.'); } catch (e) { t.select(); document.execCommand && document.execCommand('copy'); toast('Code selected. Copy it.'); } };
ACT.xfershare = () => { const t = $('#xfer-code'); navigator.share({ title:'The Eras Life save', text:t.value }).catch(() => {}); };
ACT.xferin = () => { closeModals(); const slot = S() ? S().slot : 1;
  modal(`<h2>Load a save from a code</h2><p class="small muted">Paste the code from your other device. It replaces slot ${slot}.</p><textarea id="xfer-in" style="width:100%;height:140px;background:var(--raised);border:1px solid var(--rule);border-radius:12px;padding:10px;font-size:11px" placeholder="EL1:..."></textarea>
    <div class="row"><button class="btn" data-act="xferload" data-n="${slot}">Load it</button><button class="btn ghost" data-act="closem">Cancel</button></div>`); };
ACT.xferload = async d => { try { const txt = await unpack(($('#xfer-in') || {}).value || ''); G.importSave(txt, +d.n || 1); closeModals(); UI.tab = 'week'; render(); toast('Save loaded.'); } catch (e) { toast('That code did not work. Check you copied all of it.'); } };

/* ---------- A recap strip after each week ---------- */
function recapStrip() { const s = S(), r = s.recap; if (!r || s.abs !== r.abs + 1 || UI.sel.recapHide === s.abs) return '';
  const bits = [`<b class="${r.fans >= 0 ? 'pos' : 'neg'}">${r.fans >= 0 ? '+' : ''}${G.fmtN(r.fans)}</b> fans`, `<b class="${r.money >= 0 ? 'pos' : 'neg'}">${r.money >= 0 ? '+' : ''}${G.fmtM(r.money)}</b>`];
  if (r.units) bits.push(`<b>${G.fmtN(r.units)}</b> units`);
  return `<div class="recap" role="status"><div><span class="eyebrow">Last week</span><div class="small">${bits.join(' · ')}</div>${(r.lines || []).slice(0, 2).map(l => `<div class="small muted">${h(l)}</div>`).join('')}</div><button class="icon" data-act="recaphide" aria-label="Hide the recap">✕</button></div>`; }
ACT.recaphide = () => { UI.sel.recapHide = S().abs; render(); };
const week0 = VIEWS.week;
VIEWS.week = function () { return recapStrip() + week0(); };

/* ---------- Getting started ---------- */
ER.GUIDE.splice(0, ER.GUIDE.length,
  { id:'block', l:'Play a card', hint:'Tap a card in your hand to play it into your week. Cards marked Due must be played this week.' },
  { id:'combo', l:'Trigger a combo', hint:'Some cards work together. Play a pair in the same week for a bonus. The combo chips show how close you are.' },
  { id:'scene', l:'Make a choice in a scene', hint:'Many tasks open a little scene with a choice.' },
  { id:'tab', l:'Visit another section', hint:'Use the bar at the bottom (or the sidebar on a computer). Sections unlock as the career grows.' },
  { id:'advance', l:'Press Advance Week', hint:'Wrap the week when you are done. Real events interrupt with a decision, and each one ends with what really happened.' });
const opt0 = ACT.optopen; ACT.optopen = (d, el) => { opt0(d, el); if (S()) G.guideTick('opt'); };

/* ---------- Phone polish ---------- */
UI.prefs = UI.prefs || {}; if (UI.prefs.haptic == null) UI.prefs.haptic = true;
document.addEventListener('click', e => { if (!UI.prefs.haptic || !navigator.vibrate) return; if (e.target.closest('.btn,.choice,.bn,.chip,.tab')) { try { navigator.vibrate(8); } catch (x) {} } }, true);
let tx = null;
document.addEventListener('touchstart', e => { const t = e.touches[0]; if (!S() || $('.modal') || e.target.closest('.stage3d,input,textarea,select,.cities,.tabs,.statline,.secline,.setl')) { tx = null; return; } tx = { x:t.clientX, y:t.clientY, t:Date.now() }; }, { passive:true });
document.addEventListener('touchend', e => { if (!tx) return; const t = e.changedTouches[0], dx = t.clientX - tx.x, dy = t.clientY - tx.y, dt = Date.now() - tx.t; tx = null;
  if (Math.abs(dx) < 80 || Math.abs(dy) > 45 || dt > 600) return;
  const tabs = [...document.querySelectorAll('.tabs .tab:not([disabled])')].map(b => b.dataset.v), i = tabs.indexOf(UI.tab); if (i < 0) return;
  const j = i + (dx < 0 ? 1 : -1); if (j < 0 || j >= tabs.length) return; ACT.tab({ v:tabs[j] }); }, { passive:true });
new MutationObserver(() => { const set = $('.modal [data-act=pref][data-k=text]'); if (set && !$('#qol-set')) set.closest('.sheet').querySelector('h2').insertAdjacentHTML('afterend',
  `<div id="qol-set"><h3>Vibration on taps</h3><div class="chips"><button class="chip ${UI.prefs.haptic ? 'on' : ''}" data-act="haptic" data-v="1">On</button><button class="chip ${!UI.prefs.haptic ? 'on' : ''}" data-act="haptic" data-v="0">Off</button></div>
   <h3>Music</h3><div class="chips"><button class="chip ${window.SND && SND.musicOn !== false ? 'on' : ''}" data-act="musicon" data-v="1">On</button><button class="chip ${window.SND && SND.musicOn === false ? 'on' : ''}" data-act="musicon" data-v="0">Off</button></div>
   <h3>Music volume</h3><input type="range" min="0" max="100" value="${Math.round(((window.SND && SND.musicVol) || .12) / .24 * 100)}" data-act="musicvol" style="width:100%;accent-color:var(--era)"></div>`); })
  .observe(document.body, { childList:true, subtree:true });
ACT.haptic = d => { UI.prefs.haptic = d.v === '1'; try { localStorage.setItem('eras-settings', JSON.stringify(UI.prefs)); } catch (e) {} const b = $('#qol-set'); if (b) b.remove(); };
ACT.musicon = d => { if (window.SND) SND.setMusic(d.v === '1'); const b = $('#qol-set'); if (b) b.remove(); };
ACT.musicvol = (d, el) => { if (window.SND) SND.setMusicVol(+el.value / 100 * .24); };

/* ---------- Offline play ---------- */
if ('serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
})();
