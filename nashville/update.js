// Nashville: Make It or Fake It: update checker. The page knows its own build; version.json on the site says what
// the latest build is. When they differ, a banner offers a one-tap update, and after updating you see what's new.
const BUILD='2026.11.04-4';
const UPD={latest:null,notes:[],checked:0};
async function checkUpdate(manual){try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const v=await r.json();UPD.latest=v.build;UPD.notes=v.notes||[];UPD.checked=Date.now();
  if(v.build&&v.build!==BUILD)showUpdateBanner(v);else if(manual)toast('You\'re on the latest version ('+BUILD+').')}catch(e){if(manual)toast('Couldn\'t check for updates. Are you online?')}}
function showUpdateBanner(v){if($('#updbar'))return;document.body.insertAdjacentHTML('beforeend',`<div id="updbar" role="status"><span>✨ <b>A new update is ready</b>${v.title?' · '+esc(v.title):''}</span><button id="updgo">Update now</button><button id="updlater" aria-label="Later">✕</button></div>`);
 $('#updgo').onclick=()=>{try{if(S)save()}catch(e){}location.replace(location.pathname+'?v='+encodeURIComponent(v.build))};$('#updlater').onclick=()=>$('#updbar').remove()}
function whatsNew(){let seen='';try{seen=localStorage.getItem('nmof_build')||''}catch(e){}if(seen===BUILD)return;try{localStorage.setItem('nmof_build',BUILD)}catch(e){}if(!seen)return;
 fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(v=>{if(v.build!==BUILD||!(v.notes||[]).length)return;setTimeout(()=>{if($('#modal').classList.contains('open'))return;modal(`<span class="eyebrow">Updated to ${esc(BUILD)}</span><h2>What's new</h2><ul class="newlist">${v.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul><div class="mfoot"><button class="primary" data-x>Let's play</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]'))closeModal()}})},900)}).catch(()=>{})}
window.addEventListener('load',()=>{checkUpdate();whatsNew();setInterval(checkUpdate,5*60*1000)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-UPD.checked>60000)checkUpdate()});
// version line + manual check in Settings, and on the title screen
const _life8=VIEWS.life;VIEWS.life=function(){let h=_life8();if(UI.sub.life==='settings')h+=`<section class="card"><h3>Updates</h3><p class="small muted">You're playing version <b>${esc(BUILD)}</b>${UPD.latest&&UPD.latest!==BUILD?` · <span class="spot">version ${esc(UPD.latest)} is available</span>`:UPD.latest?' · up to date':''}.</p><button class="opt" data-chkupd="1">🔄 Check for updates</button></section>`;return h};
(function(){const _t=window.titleScreen;window.titleScreen=function(){_t();const f=$('.title-in .faint.small');if(f)f.insertAdjacentHTML('afterend',`<p class="faint small ver-line">Version ${esc(BUILD)} · <button class="linkbtn" data-chkupd="1">check for updates</button></p>`)}})();
document.addEventListener('click',e=>{if(e.target.closest('[data-chkupd]'))checkUpdate(true)});
