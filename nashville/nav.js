// Nashville: Make It or Fake It: simpler navigation. "This Week" hub with every weekly action in one place,
// five bottom tabs (This Week, Music, Shows, People, More), a More menu of labelled sections, back buttons,
// and energy plus Next week visible on every screen.

const NAV_TABS=[['home','This Week','<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],['music','Music','<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'],['stage','Shows','<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v4"/>'],['people','People','<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><circle cx="17" cy="7" r="3"/><path d="M17 13c3 0 5 2 5 5"/>'],['more','More','<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>']];
const MORE_SECTIONS=()=>[
 ['Your career',[['🎯','Goals and story','goals:'],['📝','Record labels','deals:'],['🧑‍💼','Manager and team','life:team'],['⭐','Level and perks','life:perks'],['🎭','Make It or Fake It','life:fake'],['🏆','Trophies','life:trophies'],['📸','Scrapbook','life:book']]],
 ['News and fans',[['📰','Music Row Insider','media:news'],['📱','Social feed','media:feed'],['📈','The charts','media:charts'],['👑','Power 20','media:power'],['📣','Promotion','media:promo'],['🏅','Awards','media:awards']]],
 ['Your life',[['❤️','Health and wellbeing','life:health'],['👗','Style and wardrobe','life:style'],['👥','Your team','life:team'],['🏠','Where you live','life:home'],['💼','Record deal and money','life:business']].concat(ownsLabel()?[['🏷',labName(),'label:']]:[])],
 ['Game',[['⚙️','Settings','life:settings']]]];
const SECTION_NAME={'media:news':'Music Row Insider','media:feed':'Social feed','media:charts':'The charts','media:power':'Power 20','media:promo':'Promotion','media:awards':'Awards','life:perks':'Level and perks','life:fake':'Make It or Fake It','life:trophies':'Trophies','life:book':'Scrapbook','life:health':'Health and wellbeing','life:style':'Style and wardrobe','life:team':'Manager and team','life:home':'Where you live','life:business':'Record deal and money','life:settings':'Settings'};

// ---------- This Week: every action in one place ----------
function weekActions(){const w=S.songs.filter(s=>s.st==='written').length,r=S.songs.filter(s=>s.st==='recorded').length,u=unreadCount(),own=ownsLabel();
 return[
  ['Make music',[['✍️','Write a song','write',energyCost('write')],['🎙',`Record a song${w?` (${w} ready)`:''}`,'record',w?energyCost('record'):null,!w&&'Write one first'],['📻',`Release a single${r?` (${r} ready)`:''}`,'release',r?energyCost('release'):null,!r&&'Record one first'],['💿','Make an album','album',energyCost('album')],['🪑','Bluebird writers\' round','round',energyCost('round')],['🎧','Listen to your songs','listen',0]]],
  ['Get out there',[['🎤','Play a show','gig',null],['🚌','Go on tour','tour',null,S.tour&&'On tour now'],['📣','Promotion and interviews','promo',null],['📸','Post on social media','post',energyCost('post')],['🔴','Go live','live',energyCost('live')],['🗓','This week\'s city board','board',null]]],
  ['People and love',[['💬','See friends and family','people',energyCost('person')],['📱',`Texts${unreadOrWaiting()?` (${unreadOrWaiting()} waiting)`:''}`,'phone',0],['👑','Your rival','rival',null]]],
  ['Business',[['📝',S.label&&S.label.id!=='indie'?'Your record deal':'Record labels','deals',null],['🧑‍💼',S.manager&&has(S.manager)?'Your manager and team':'Hire a manager','team',null]].concat(own?[['🏷','Run your label','label',null]]:[])],
  ['Take care of yourself',[['😴','Rest (+30 energy)','rest','+30'],['❤️','Health, therapy, AA','health',null],['👗','Style and wardrobe','style',null],['🎭','Make It or Fake It','fake',null]]]]}
function weekGrid(){return weekActions().map(([title,items])=>`<section class="card wk-sec"><h3>${title}</h3><div class="wk-grid">${items.map(([ic,n,k,cost,off])=>`<button class="wk-act" data-do="${k}" ${off?'disabled':''}><i>${ic}</i><b>${esc(n)}</b>${off?`<small>${esc(off)}</small>`:cost==null?'<small>Choose ›</small>':cost===0?'<small>Free</small>':`<em>${typeof cost==='string'?cost+'⚡':'⚡'+cost}</em>`}</button>`).join('')}</div></section>`).join('')}
function doWeekAction(k){const go=(t,s)=>{UI.tab=t;if(s)UI.sub[t]=s;render();scrollTo(0,0)};
 if(k==='write')return startWrite(null);if(k==='album')return startAlbum();if(k==='round')return startRound();if(k==='live')return goLive();if(k==='phone')return openPhone();if(k==='rest')return act(doLife)('rest');
 if(k==='record'){const s=S.songs.find(x=>x.st==='written');return s?startRecord(s.id):go('music','studio')}
 if(k==='release'){const n=S.songs.filter(x=>x.st==='recorded').length;if(n===1)return startRelease(S.songs.find(x=>x.st==='recorded').id);return go('music','release')}
 if(k==='listen')return go('music','catalog');if(k==='gig')return go('stage','venues');if(k==='tour')return go('stage','tours');if(k==='promo')return go('media','promo');if(k==='rival')return go('media','power');if(k==='label')return go('label');
 if(k==='people')return go('people');if(k==='deals')return go('deals');if(k==='team')return go('life','team');if(k==='health')return go('life','health');if(k==='style')return go('life','style');if(k==='fake')return go('life','fake');
 if(k==='board'){const el=$('.opps');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(k==='post')return composePost();if(k==='post_old'){modal(`<h2>Post on social media</h2><p class="muted small">⚡${energyCost('post')} · @${esc(S.handle)} · ${num(S.followers||0)} followers</p><div class="stack tight">${[['heart','💛 Heartfelt','Fans feel closer to you.'],['funny','😂 Funny','Goes viral more often.'],['promo','📣 Promote your single','Pushes your song up the chart.'],['bts','🎚 Behind the scenes','Fans and a little cred.'],['shade','🔥 Throw shade at a rival','Big attention, real risk.']].map(([t,n,d])=>`<button class="opt" data-pt="${t}">${n}<small>${d}</small></button>`).join('')}</div><div class="mfoot"><button class="ghost" data-x>Cancel</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]'))return closeModal();const b=e.target.closest('[data-pt]');if(b){closeModal();act(doPost)(b.dataset.pt)}}});return}}

VIEWS.home=function(){ensureWeek();const f=fame();
 const hero=`<section class="hero3 compact"><div class="scene hero-stage" id="heroStage"><div class="fallback">${pt('me',S.stress>75?'sad':'happy')}</div><button class="hero-style" data-goto="life:style">👗 Style</button></div>
 <div class="hero-info"><span class="eyebrow">${esc(S.genre)} · ${esc(label().n)}</span><h1>${esc(S.name)}</h1><p class="muted small">${fameTitle()}${S.partner&&has(S.partner)?` · ${R(S.partner).married?'Married to':'Dating'} ${esc(nm(S.partner))}`:''}</p>
 <div class="tiles"><div><i>⭐</i><b>${f}</b><span>fame</span></div><div><i>🤠</i><b>${num(S.fans)}</b><span>fans</span></div><div><i>💵</i><b>${money(S.money)}</b><span>bank</span></div><div><i>🎭</i><b>${Math.round(S.auth)}</b><span>real</span></div></div>
 <button class="lvlbar" data-goto="life:perks"><span>⭐ Level ${S.lvl}</span><i><b style="width:${S.xp/xpNeed(S.lvl)*100}%"></b></i>${S.perkPts?`<em>${S.perkPts} perk point${S.perkPts>1?'s':''}!</em>`:''}</button></div></section>`;
 const energy=`<section class="card energy-card"><div class="between"><div><span class="eyebrow">Energy this week</span><b class="ebig">⚡ ${S.ap} <small>/ ${apMax()}</small></b></div><button class="primary" data-act="next">Next week ▸</button></div>${apDots()}<p class="small faint">Every action costs energy. When you've done what you want, press Next week.</p><button class="mini" data-autoweek="1">⚡ Auto-play my week</button></section>`;
 const tips=coachTips();const coach=tips.length?`<section class="card coach"><span class="eyebrow">Suggested for you</span>${tips.map(([ic,txt,k])=>`<button class="tip" data-coach="${k}"><i>${ic}</i><span>${esc(txt)}</span><em>›</em></button>`).join('')}</section>`:'';
 const news=S.news.slice(0,3);const last=S.lastLog||[];
 return hero+energy+storyCard()+coach+`<h2 class="hub-h">This week</h2>`+weekGrid()+oppsCard()+challengesCard()+
  `<section class="card"><div class="between"><h3>Music Row Insider</h3><button class="linkbtn" data-goto="media:news">All news ›</button></div>${news.map(n=>`<p class="headline ${n.kind}">${esc(n.t)}</p>`).join('')}</section>`+
  (last.length?`<details class="card lastwk"><summary><h3>What happened last week</h3></summary>${last.map(i=>`<p class="logline ${i.k}">${esc(i.t)}</p>`).join('')}</details>`:'')};

// ---------- More menu and the goals page ----------
VIEWS.more=function(){return`<h1 class="screen-h">More</h1>${MORE_SECTIONS().map(([t,items])=>`<section class="more-sec"><h3>${t}</h3><div class="more-grid">${items.map(([ic,n,k])=>`<button class="more-tile" data-goto="${k}"><i>${ic}</i><span>${esc(n)}</span></button>`).join('')}</div></section>`).join('')}`};
VIEWS.goals=function(){const ms=milestones();const nextI=ms.findIndex(x=>!x[1]);return storyCard()+`<section class="card"><h3>Career goals</h3><ol class="goals">${ms.map((x,i)=>`<li class="${x[1]?'done':i===nextI?'next':''}">${x[1]?'✓':'○'} ${esc(x[0])}</li>`).join('')}</ol></section><section class="card mof mini-mof"><div class="between"><div><span class="eyebrow">Make It or Fake It</span><b>${authLabel()}</b></div><div class="real-dial sm" style="--v:${S.auth}"><b>${Math.round(S.auth)}</b></div></div><button class="mini" data-goto="life:fake">Open</button></section>`};

// ---------- shell: tabs, back buttons, energy and Next week everywhere ----------
(function(){const _r=window.render;window.render=function(){if(S&&!S.over&&UI.tab==='goals'){}_r();if(!S||S.over)return;
 const inMore=['media','life','label','goals','more','deals'].includes(UI.tab);
 const nav=$('.tabs-in');if(nav){nav.style.gridTemplateColumns='repeat(5,1fr)';nav.innerHTML=NAV_TABS.map(([k,n,ic])=>`<button class="tab ${UI.tab===k||(k==='more'&&inMore)?'on':''}" data-tab="${k}"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ic}</svg>${n}</button>`).join('')}
 const view=$('#view');if(!view)return;view.classList.toggle('in-more',inMore&&UI.tab!=='more');
 if(inMore&&UI.tab!=='more'){const key=UI.tab==='label'?'label:':UI.tab==='goals'?'goals:':UI.tab==='deals'?'deals:':UI.tab+':'+UI.sub[UI.tab];const title=UI.tab==='label'?labName():UI.tab==='goals'?'Goals and story':UI.tab==='deals'?'Record labels':SECTION_NAME[key]||'';view.insertAdjacentHTML('afterbegin',`<div class="sechead"><button class="back" data-tab="more">‹ More</button><b>${esc(title)}</b></div>`)}
 if(UI.tab==='music'||UI.tab==='stage'){const icons={write:'✍️ Write',studio:'🎙 Record',release:'📻 Release',catalog:'📚 My songs',venues:'🎤 Play a show',tours:'🚌 Tours'};view.querySelectorAll('.seg [data-sub]').forEach(b=>{const k=b.dataset.sub.split(':')[1];if(icons[k])b.textContent=icons[k]})}
 const top=$('.top-in');if(top&&!$('.epill'))top.querySelector('.top-name').insertAdjacentHTML('afterend',`<span class="epill ${S.ap<15?'low':''}">⚡${S.ap}</span>`);
 if(UI.tab!=='home'&&!$('.fab-next'))document.body.insertAdjacentHTML('beforeend',`<button class="fab-next" data-act="next">Next week ▸</button>`);if(UI.tab==='home'){const f=$('.fab-next');if(f)f.remove()}}})();
// leaving the game screen removes the floating button
(function(){const _t=window.titleScreen;window.titleScreen=function(){const f=$('.fab-next');if(f)f.remove();return _t()}})();
(function(){const _e=window.showEnding;window.showEnding=function(){const f=$('.fab-next');if(f)f.remove();return _e()}})();

document.addEventListener('click',e=>{if(!S||S.over||e.target.closest('#modal'))return;const el=e.target.closest('[data-do]');if(el&&!el.disabled)doWeekAction(el.dataset.do);
 const g=e.target.closest('[data-goto]');if(g&&/^(goals|label|deals):$/.test(g.dataset.goto)){UI.tab=g.dataset.goto.slice(0,-1);render();scrollTo(0,0)}},true);
