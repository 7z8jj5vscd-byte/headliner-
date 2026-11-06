/* The Eras Life: creative tools. A look designer for each era (hair, make-up, outfits), stage
   lighting colours, and names you choose for your fans, your merch line and your tours.
   Your changes are yours; the era's documented look stays as the default and one tap restores it. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, VIEWS, ACT, toast, mount3D, lookFor } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();

/* ---------- Engine helpers ---------- */
G.stageColor = era => { const s = S(); return (s && era && s.stageColor && s.stageColor[era.id]) || (era ? era.color : '#7a9a4a'); };
G.fanName = () => { const s = S(); return (s && s.fanName) || G.art().fanName; };
G.setLook = function (eraId, part, k, v) { const s = S(); s.lookMods = s.lookMods || {}; const m = s.lookMods[eraId] = s.lookMods[eraId] || {}; m[part] = m[part] || {}; if (v == null) delete m[part][k]; else m[part][k] = v; };
G.resetLook = eraId => { const s = S(); if (s.lookMods) delete s.lookMods[eraId]; };

/* ---------- The look designer ---------- */
const HAIR = ['#f3db94','#e8c27a','#c99a5b','#8a5a34','#4a3020','#1d1612','#b5462f','#e7a1b8','#9fb7e8','#e8e3da'];
const CLOTH = ['#ffffff','#111111','#c1272d','#e88fb4','#f2c94c','#3f8f5a','#2f6fd6','#7d4cc2','#d6a93a','#9aa3ad','#0f6b6b','#f6d6c8'];
const LIPS = ['#c1272d','#a8323e','#e07a8a','#c78f7d','#6b1f2a'];
const STYLES = [['waves','Waves'],['straight','Straight'],['curly','Curly'],['braid','Braid'],['ponytail','Ponytail'],['bun','Bun'],['bob','Bob']];
const TOPS = [['sequin','Sequins'],['bodysuit','Bodysuit'],['gown','Gown'],['crop','Crop top'],['jacket','Jacket'],['suit','Suit'],['coat','Coat'],['cardigan','Cardigan'],['tee','T-shirt']];
function designEra() { const s = S(), ids = designable(); const id = UI.sel.dEra && ids.some(x => x.id === UI.sel.dEra) ? UI.sel.dEra : ((G.currentEra() || {}).id || (ids[0] || {}).id || 'early'); return id; }
function designable() { const s = S(); return G.allProjects().filter(p => p.type !== 'demos' && p.type !== 'edition' && (G.pj(p.id).released || G.stageOf(p, s.abs) !== 'none' || G.currentEra() === p)); }
function swatches(part, k, list, cur) { return `<div class="sw-row">${list.map(c => `<button class="swb ${cur === c ? 'on' : ''}" style="background:${c}" data-act="lk" data-part="${part}" data-k="${k}" data-v="${c}" aria-label="${k} ${c}"></button>`).join('')}</div>`; }
function designCard() {
  const s = S(); if (s.flags.retired && !s.lookMods) return '';
  const id = designEra(), era = G.proj(id), part = UI.sel.dPart || 'stage', md = (s.lookMods || {})[id] || {};
  const base = lookFor(part === 'stage' ? 'tour' : '', era), opts = designable();
  return card(`<div class="between"><h2>Your look</h2>${Object.keys(md).length ? pill('Customised') : pill('As documented')}</div>
    <p class="small muted">Change the hair, make-up and outfits for any era you have reached. The documented look is the default.</p>
    <div class="chips">${opts.slice(-10).map(p => `<button class="chip ${p.id === id ? 'on' : ''}" data-act="dera" data-v="${p.id}"><i class="dot" style="background:${p.color}"></i>${h(p.short || p.title)}</button>`).join('')}</div>
    <div class="stage3d short" id="t3design"></div>
    <div class="chips"><button class="chip ${part === 'stage' ? 'on' : ''}" data-act="dpart" data-v="stage">On stage</button><button class="chip ${part === 'casual' ? 'on' : ''}" data-act="dpart" data-v="casual">Off stage</button></div>
    <h3>Hair colour</h3>${swatches('all', 'hair', HAIR, base.hair)}
    <h3>Hair style</h3><div class="chips">${STYLES.map(([k, l]) => `<button class="chip ${base.style === k ? 'on' : ''}" data-act="lk" data-part="all" data-k="style" data-v="${k}">${l}</button>`).join('')}</div>
    <h3>Lips</h3>${swatches('all', 'lips', LIPS, base.lips)}
    <h3>Outfit</h3><div class="chips">${TOPS.map(([k, l]) => `<button class="chip ${base.top === k ? 'on' : ''}" data-act="lk" data-part="${part}" data-k="top" data-v="${k}">${l}</button>`).join('')}</div>
    <h3>Main colour</h3>${swatches(part, 'outfit', CLOTH, base.outfit)}<h3>Accent colour</h3>${swatches(part, 'accent', CLOTH, base.accent)}
    <h3>Sparkle</h3><div class="chips"><button class="chip ${base.sparkle ? 'on' : ''}" data-act="lk" data-part="${part}" data-k="sparkle" data-v="1">On</button><button class="chip ${!base.sparkle ? 'on' : ''}" data-act="lk" data-part="${part}" data-k="sparkle" data-v="0">Off</button></div>
    <h3>Stage lights</h3>${swatches('lights', 'c', ['#d6a93a','#e88fb4','#8fb8e8','#c1272d','#7d4cc2','#3f8f5a','#ffffff','#f2c94c'], G.stageColor(era))}
    <div class="row"><button class="btn ghost sm" data-act="lkreset">Back to the documented look</button></div>`);
}
ACT.dera = d => { UI.sel.dEra = d.v; render(); };
ACT.dpart = d => { UI.sel.dPart = d.v; render(); };
ACT.lk = d => { const id = designEra(); if (d.part === 'lights') { const s = S(); s.stageColor = s.stageColor || {}; s.stageColor[id] = d.v; return render(); }
  G.setLook(id, d.part, d.k, d.k === 'sparkle' ? +d.v : d.v); render(); };
ACT.lkreset = () => { const id = designEra(), s = S(); G.resetLook(id); if (s.stageColor) delete s.stageColor[id]; render(); toast('Back to the documented look.'); };
function mountDesign() { const el = $('#t3design'); if (!el) return; const id = designEra(), era = G.proj(id), part = UI.sel.dPart || 'stage';
  mount3D('#t3design', { set:part === 'stage' ? 'stadium' : 'home', color:G.stageColor(era), figs:[{ look:lookFor(part === 'stage' ? 'tour' : '', era), anim:part === 'stage' ? 'sing' : 'idle', mic:part === 'stage' }] }, 'design'); }
const life0 = VIEWS.life;
VIEWS.life = function () { const html = life0(), i = html.indexOf('<section class="card"', 10), d = designCard(); setTimeout(mountDesign, 0); return i < 0 ? html + d : html.slice(0, i) + d + html.slice(i); };

/* ---------- Names: fans and merch ---------- */
const box = (id, v, ph) => `<input id="${id}" value="${h(v || '')}" placeholder="${h(ph)}" maxlength="30" style="flex:1;min-width:0;background:var(--raised);border:1px solid var(--rule);border-radius:10px;padding:8px 10px">`;
function namesCard() {
  const s = S();
  return card(`<h2>Names</h2><p class="small muted">Name things your way.</p>
    <label class="field"><span>Your fans are called</span><div class="row">${box('nm-fans', s.fanName || '', G.art().fanName)}<button class="btn sm" data-act="nmfans">Save</button></div></label>
    <label class="field"><span>Your merch line</span><div class="row">${box('nm-merch', s.merchName || '', 'For example: Midnight Mail')}<button class="btn sm" data-act="nmmerch">Save</button></div></label>`);
}
ACT.nmfans = () => { const v = (($('#nm-fans') || {}).value || '').trim().slice(0, 30); S().fanName = v || null; render(); toast(v ? `Your fans are ${v}.` : 'Back to the real fan name.'); };
ACT.nmmerch = () => { const v = (($('#nm-merch') || {}).value || '').trim().slice(0, 30); S().merchName = v || null; render(); toast(v ? `Merch line: ${v}.` : 'Merch name cleared.'); };
const fan0 = VIEWS.fandom;
VIEWS.fandom = function () { return fan0() + namesCard(); };
// The tour name lives on the plan, so you can name a tour before it goes on sale.
new MutationObserver(() => { const rc = document.querySelector('#main [data-act=rreg]'); if (rc && UI.sel.plan && !$('#tour-name')) {
  rc.closest('.card').querySelector('p').insertAdjacentHTML('afterend', `<label class="field"><span>Tour name</span><div class="row">${box('tour-name', UI.sel.plan.name, 'Tour name')}<button class="btn sm" data-act="tname">Save</button></div></label>`); } })
  .observe(document.body, { childList:true, subtree:true });
ACT.tname = () => { const v = (($('#tour-name') || {}).value || '').trim().slice(0, 40); if (!v || !UI.sel.plan) return; UI.sel.plan.name = v; render(); toast(`The tour is called ${v}.`); };
})();
