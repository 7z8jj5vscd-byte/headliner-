/* The Eras Life: update checker. The page knows its own build. version.json on the site says what
   the newest build is. When they differ, a banner offers a one-tap update; after updating, the
   game shows what's new. Bump with: python3 eras/tools/bump_version.py "Title" "Note" ... */
(function () {
const BUILD = '2026.11.06-7';
const UPD = window.UPD = { build:BUILD, latest:null, notes:[], title:'', checked:0, state:'idle' };
// The status line on the title screen: which version this is and whether a newer one exists.
UPD.line = () => {
  const v = `Version ${esc(BUILD)}`, st = UPD.state;
  if (st === 'new') return `<span class="dot-new"></span><span><b>Update available</b> (${esc(UPD.latest)})${UPD.title ? ` · ${esc(UPD.title)}` : ''}</span><button class="btn sm" data-upd="go">Update now</button>`;
  if (st === 'checking') return `<span>${v} · Checking for updates…</span>`;
  if (st === 'ok') return `<span>${v} · <span class="ok">Up to date</span></span><button class="btn ghost sm" data-upd="check">Check again</button>`;
  if (st === 'offline') return `<span>${v} · Couldn't check (offline?)</span><button class="btn ghost sm" data-upd="check">Try again</button>`;
  if (st === 'local') return `<span>${v} · Opened from a file, so update checks are off</span>`;
  return `<span>${v}</span><button class="btn ghost sm" data-upd="check">Check for updates</button>`;
};
function paint() { const el = document.getElementById('ver-line'); if (el) el.innerHTML = UPD.line();
  const row = document.getElementById('upd-row'); if (row) row.outerHTML = settingsRow(); }
function settingsRow() { return `<div id="upd-row" class="between small" style="margin:4px 0 8px"><span class="muted">Version ${esc(BUILD)}${UPD.state === 'new' ? ` · <b>${esc(UPD.latest)} is available</b>` : UPD.state === 'ok' ? ' · Up to date' : ''}</span>${UPD.state === 'new' ? '<button class="btn sm" data-upd="go">Update now</button>' : '<button class="btn ghost sm" data-upd="check">Check for updates</button>'}</div>`; }
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

function banner() {
  if (document.getElementById('upd-banner') || !UPD.latest || UPD.latest === BUILD) return;
  const b = document.createElement('div'); b.id = 'upd-banner'; b.setAttribute('role', 'status');
  b.innerHTML = `<span><b>A new version is ready.</b> ${esc(UPD.title || '')}</span><button data-upd="go">Update now</button><button data-upd="later" aria-label="Later">Later</button>`;
  document.body.appendChild(b);
}
async function check(manual) {
  if (location.protocol === 'file:') { UPD.state = 'local'; paint(); if (manual) toast('Update checks work on the website, not from a local file.'); return; }
  if (manual) { UPD.state = 'checking'; paint(); }
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache:'no-store' }); if (!r.ok) throw 0;
    const v = await r.json(); UPD.latest = v.build; UPD.notes = v.notes || []; UPD.title = v.title || ''; UPD.checked = Date.now();
    if (v.build && v.build !== BUILD && newer(v.build, BUILD)) { UPD.state = 'new'; banner(); }
    else { UPD.state = 'ok'; if (manual) toast('You have the latest version.'); }
  } catch (e) { if (UPD.state !== 'new') UPD.state = 'offline'; if (manual) toast('Could not check for updates. Are you online?'); }
  paint();
}
// Builds are dates with a counter (2026.11.06-2), so they compare piece by piece.
function newer(a, b) { const p = x => String(x).split(/[.-]/).map(Number); const A = p(a), B = p(b);
  for (let i = 0; i < Math.max(A.length, B.length); i++) { const d = (A[i] || 0) - (B[i] || 0); if (d) return d > 0; } return false; }
UPD.check = check;
function toast(m) { if (window.UI && UI.toast) UI.toast(m); else alert(m); }
// Updating: save first, then reload past the browser's cache.
function update() {
  try { if (window.G && G.S()) G.save(); } catch (e) {}
  try { localStorage.setItem('eras-updating-to', UPD.latest || ''); } catch (e) {}
  location.replace(location.pathname + '?u=' + encodeURIComponent(UPD.latest || Date.now()));
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-upd]'); if (!a) return;
  if (a.dataset.upd === 'go') update();
  if (a.dataset.upd === 'later') { const b = document.getElementById('upd-banner'); if (b) b.remove(); }
  if (a.dataset.upd === 'check') check(true);
  if (a.dataset.upd === 'close') { const m = document.getElementById('upd-new'); if (m) m.remove(); }
});
// What's new, once, after an update lands.
function whatsNew() {
  if (location.protocol === 'file:') return;
  let last = null; try { last = localStorage.getItem('eras-last-build'); localStorage.setItem('eras-last-build', BUILD); } catch (e) {}
  if (!last || last === BUILD) return;
  fetch('version.json?t=' + Date.now(), { cache:'no-store' }).then(r => r.json()).then(v => {
    if (v.build !== BUILD || !(v.notes || []).length) return;
    const m = document.createElement('div'); m.id = 'upd-new'; m.className = 'modal';
    m.innerHTML = `<div class="sheet"><span class="eyebrow">Updated to ${esc(BUILD)}</span><h2>What's new${v.title ? `: ${esc(v.title)}` : ''}</h2><ul class="newlist">${v.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul><button class="btn big" data-upd="close">Let's play</button></div>`;
    setTimeout(() => document.body.appendChild(m), 700);
  }).catch(() => {});
}
// Settings: show the version and a manual check.
new MutationObserver(() => {
  const set = document.querySelector('.modal [data-act=pref][data-k=text]');
  if (set && !document.getElementById('upd-row')) set.closest('.sheet').querySelector('h2').insertAdjacentHTML('afterend', settingsRow());
}).observe(document.body, { childList:true, subtree:true });
// Check when the game opens, every five minutes, and whenever the player comes back to it.
window.addEventListener('load', () => { whatsNew(); UPD.state = location.protocol === 'file:' ? 'local' : 'checking'; paint(); setTimeout(check, 400); });
setInterval(() => { if (!document.hidden) check(); }, 5 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - UPD.checked > 60 * 1000) check(); });
})();
