// Music City: screens.
const TABS=[['home','Home','<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],['music','Music','<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'],['stage','Stage','<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v4"/>'],['people','People','<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><circle cx="17" cy="7" r="3"/><path d="M17 13c3 0 5 2 5 5"/>'],['media','Media','<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 21h10M8 9h8M8 13h5"/>'],['life','Life','<path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>']];
function meter(lab,v,cls,tip){return`<div class="meter ${cls||''}" title="${esc(tip||lab)}"><span>${lab}</span><i><b style="width:${clamp(v,0,100)}%"></b></i></div>`}
function render(){if(!S||S.over){if(S&&S.over)return showEnding();return titleScreen()}
 const f=fame();
 $('#app').innerHTML=`<header class="top"><div class="top-in"><button class="avatar" data-tab="life" aria-label="Your life">${pt('me')}</button><div class="top-name"><b>${esc(S.name)}</b><span>${fameTitle()} · ${dateStr(S.week)}</span></div><div class="top-stats"><div><b class="num">${money(S.money)}</b><span>bank</span></div><div><b class="num">${num(S.fans)}</b><span>fans</span></div></div></div>
 <div class="meters">${meter('Fame',f,'gold')}${meter('Health',S.health,S.health<35?'bad':'good')}${meter('Stress',S.stress,S.stress>70?'bad':'amber')}${meter('Image',S.rep,'blue')}${S.heat>5?meter('Scandal',S.heat,'bad'):''}${S.add.dep>5?meter('Craving',S.add.dep,'bad','Addiction'):''}</div></header>
 <main class="wrap" id="view">${VIEWS[UI.tab]()}</main>
 <nav class="tabs"><div class="tabs-in">${TABS.map(([k,n,ic])=>`<button class="tab ${UI.tab===k?'on':''}" data-tab="${k}"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ic}</svg>${n}</button>`).join('')}</div></nav>`;
}
function subtabs(tab,list){return`<div class="seg">${list.map(([k,n])=>`<button class="${UI.sub[tab]===k?'on':''}" data-sub="${tab}:${k}">${n}</button>`).join('')}</div>`}
function apDots(){let s='';for(let i=0;i<apMax();i++)s+=`<i class="${i<S.ap?'on':''}"></i>`;return`<span class="ap">${s}</span>`}
function milestones(){const m=[['Play the Bluebird',S.stats.bluebird>0],['Write 5 songs',S.stats.written>=5],['Sign a record deal',!!S.label||F('signedEver')],['Top 10 single',S.stats.top10>0||S.songs.some(s=>s.peak&&s.peak<=10)],['Play the Grand Ole Opry',S.stats.opry>0],['Play the Ryman',S.stats.ryman>0],['A #1 single',S.stats.ones>0],['A Gold album',S.albums.some(a=>a.cert)],['Win an award',S.awards.some(a=>a.won)],['Become an Opry member',!!F('opryMember')],['Entertainer of the Year',!!S.ach.eoty],['Hall of Fame',!!S.ach.hof]];
 if(S.char==='rayna')m.splice(1,0,['Start your own label',!!F('h65')]);if(S.char==='will')m.splice(1,0,['Live as yourself',!!F('out')]);if(S.char==='scarlett')m.splice(1,0,['Beat stage fright',!S.traits.includes('stagefright')]);if(S.char==='deacon')m.splice(1,0,['One year sober',!!S.ach.sober]);if(S.char==='juliette')m.splice(1,0,['Win over the critics (Cred 70)',S.cred>=70]);return m}
const VIEWS={
home(){const ch=charting().sort((a,b)=>(a.pos||99)-(b.pos||99));const ms=milestones();const nextI=ms.findIndex(x=>!x[1]);
 return`<section class="hero"><div class="hero-pt">${pt('me',S.stress>75?'sad':'happy')}</div><div class="hero-txt"><span class="eyebrow">${esc(S.genre)} · ${esc(label().n)}</span><h1>${esc(S.name)}</h1><p class="muted">${fameTitle()} · ${Math.floor(S.age)} years old${S.partner?` · ${R(S.partner).married?'Married to':'Dating'} ${esc(nm(S.partner))}`:''}</p>
 <div class="hero-ap">Actions ${apDots()} <span class="faint small">${S.ap} left</span></div></div></section>
 <button class="primary big wide" data-act="next">Next week ▸</button>
 ${S.tour?`<section class="card tourcard"><span class="eyebrow">On the road</span><h3>${esc(S.tour.n)}</h3><div class="prog"><b style="width:${(1-S.tour.left/S.tour.weeks)*100}%"></b></div><p class="small muted">${S.tour.left} weeks left · ${money(S.tour.net)} net so far · ${num(S.tour.fans)} new fans</p></section>`:''}
 <section class="card"><div class="between"><h3>Music Row Insider</h3><button class="linkbtn" data-goto="media:news">All news</button></div>${S.news.slice(0,3).map(n=>`<p class="headline ${n.kind}">${esc(n.t)}</p>`).join('')}</section>
 ${ch.length?`<section class="card"><h3>On the chart</h3>${ch.map(s=>`<div class="between line"><span>"${esc(s.title)}"${s.duet?` <small class="faint">with ${esc(nm(s.duet))}</small>`:''}</span><b class="num ${s.pos&&s.pos<=10?'spot':''}">${s.pos?'#'+s.pos:'—'}</b></div>`).join('')}</section>`:''}
 <section class="card"><h3>Quick actions</h3><div class="grid2"><button class="qa" data-goto="music:write">✍️ Write a song</button><button class="qa" data-goto="stage:venues">🎤 Play a show</button><button class="qa" data-goto="media:promo">📣 Promote</button><button class="qa" data-goto="people:">💬 See people</button></div></section>
 ${S.lastLog.length?`<section class="card"><h3>Last week</h3>${S.lastLog.slice(0,8).map(i=>`<p class="logline ${i.k}">${esc(i.t)}</p>`).join('')}</section>`:''}
 <section class="card"><h3>Career goals</h3><ol class="goals">${ms.map((x,i)=>`<li class="${x[1]?'done':i===nextI?'next':''}">${x[1]?'✓':'○'} ${esc(x[0])}</li>`).join('')}</ol></section>`},
music(){const sub=UI.sub.music;let h=subtabs('music',[['write','Write'],['studio','Studio'],['release','Release'],['catalog','Catalog']]);
 if(sub==='write'){const co=Object.keys(CHARS).filter(k=>has(k)&&(CHARS[k].writer||CHARS[k].singer)&&R(k).met);h+=`<section class="card"><h3>Write alone</h3><p class="muted small">Your songwriting: ${S.sk.writing}/100. Pain helps: high stress makes for better sad songs.</p><button class="primary" data-act="write">✍️ Start writing ⚡20</button></section>
  <section class="card"><h3>Co-write</h3><p class="muted small">Great co-writers make better songs and bring you closer.</p><div class="plist">${co.length?co.map(k=>`<button class="pcard sm" data-cowrite="${k}">${pt(k)}<b>${esc(nm(k))}</b><small>${CHARS[k].writer?'Writer':'Artist'} · ${R(k).a>=0?'+':''}${R(k).a}</small></button>`).join(''):'<p class="muted">Meet some songwriters first (People tab).</p>'}</div></section>`}
 if(sub==='studio'){const w=S.songs.filter(s=>s.st==='written');h+=`<section class="card"><h3>Unrecorded songs</h3>${w.length?w.map(s=>`<div class="songrow"><div><b>"${esc(s.title)}"</b><small>${THEMES[s.theme]?THEMES[s.theme].n:''}${s.co?' · with '+esc(nm(s.co)):''} · ${stars(s.q)}</small></div><button class="mini" data-record="${s.id}">Record</button></div>`).join(''):'<p class="muted">Nothing to record. Write something first.</p>'}</section>`}
 if(sub==='release'){const r=S.songs.filter(s=>s.st==='recorded');h+=`<section class="card"><h3>Ready to release</h3>${r.length?r.map(s=>`<div class="songrow"><div><b>"${esc(s.title)}"</b><small>${stars(fq(s))}${s.duet?' · duet with '+esc(nm(s.duet)):''}${s.album?' · on album':''}</small></div><button class="mini" data-release="${s.id}">Single</button></div>`).join(''):'<p class="muted">Record a song first.</p>'}</section>
  <section class="card"><h3>Albums</h3><p class="muted small">Bundle 4 to 12 recorded songs. Hit singles drive album sales.</p><button class="primary" data-act="album">💿 Make an album</button>${S.albums.slice().reverse().map(a=>`<div class="songrow"><div><b>${esc(a.title)}</b><small>Debuted #${a.pos} · ${num(a.units)} units${a.cert?' · '+a.cert:''} · review ${a.review}/100</small></div></div>`).join('')}</section>`}
 if(sub==='catalog'){h+=`<section class="card"><h3>Every song (${S.songs.length})</h3>${S.songs.slice().reverse().map(s=>`<div class="songrow"><div><b>"${esc(s.title)}"</b><small>${({written:'Demo',recorded:'Recorded',single:'Single'})[s.st]} · ${stars(fq(s))}${s.peak?' · peak #'+s.peak:''}${s.pos?' · now #'+s.pos:''}${s.income?' · earned '+money(s.income*(S.label?S.label.royalty:.8)):''}</small></div><button class="mini ghosty" data-play="${s.id}" aria-label="Play">▶</button></div>`).join('')||'<p class="muted">No songs yet.</p>'}</section>`}
 return h},
stage(){const sub=UI.sub.stage;let h=subtabs('stage',[['venues','Venues'],['tours','Tours']]);
 if(S.tour)h+=`<section class="card tourcard"><span class="eyebrow">On the road</span><h3>${esc(S.tour.n)}</h3><div class="prog"><b style="width:${(1-S.tour.left/S.tour.weeks)*100}%"></b></div><p class="small muted">${S.tour.left} weeks left. Shows play out automatically each week.</p></section>`;
 if(sub==='venues')h+=VENUES.map(v=>{const ok=venueOK(v);return`<section class="card venue ${ok?'':'locked'}"><div class="between"><div><h3>${esc(v.n)}</h3><p class="small muted">${esc(v.desc)}</p><p class="small faint">${v.cap?num(v.cap)+' capacity · ':''}${v.opry?(S.opryInvite?'Invitation waiting!':'Invitation only'):v.fame?'Needs '+v.fame+' fame':'Open to anyone'}</p></div><button class="mini" data-gig="${v.id}" ${ok&&!S.tour?'':'disabled'}>${ok?'Play':'🔒'}</button></div></section>`}).join('');
 if(sub==='tours')h+=TOURS.map(t=>{const ok=fame()>=t.fame;return`<section class="card venue ${ok?'':'locked'}"><div class="between"><div><h3>${esc(t.n)}</h3><p class="small muted">${esc(t.desc)}</p><p class="small faint">${t.weeks} weeks · ${num(t.cap)} a night · ${money(t.cost)}/week · needs ${t.fame} fame</p></div><button class="mini" data-tour="${t.id}" ${ok&&!S.tour?'':'disabled'}>${ok?'Book':'🔒'}</button></div></section>`}).join('')+`<p class="faint small">Opening slots on bigger artists' tours come from offers and from asking stars you're close to (People tab).</p>`;
 return h},
people(){const f=UI.pf||'all';const ids=Object.keys(CHARS).filter(has).filter(k=>{const r=R(k);return f==='all'||(f==='close'&&r.a>=40)||(f==='love'&&(r.r>=20||r.dating||r.married))||(f==='rivals'&&r.a<0)});
 return`<div class="seg">${[['all','Everyone'],['close','Close'],['love','Romance'],['rivals','Rivals']].map(([k,n])=>`<button class="${f===k?'on':''}" data-pf="${k}">${n}</button>`).join('')}</div>
 <div class="plist">${ids.map(k=>{const r=R(k);const tag=r.married?'Married':r.dating?'Dating':r.tag||(r.a<=-30?'Enemy':r.a<0?'Rival':r.a>=60?'Close friend':r.a>=25?'Friend':r.met?'Acquaintance':'Not met');return`<button class="pcard ${r.met?'':'unmet'}" data-person="${k}">${pt(k,r.a<-20?'angry':r.a>40?'happy':'neutral',r.dating||r.married?'#e2627d':null)}<b>${esc(CHARS[k].short)}</b><small>${esc(tag)}</small><i class="aff"><s style="width:${(r.a+100)/2}%" class="${r.a<0?'neg':''}"></s></i>${r.r>0?`<em>${'♥'.repeat(Math.ceil(r.r/25))}</em>`:''}</button>`}).join('')}</div>`},
media(){const sub=UI.sub.media;let h=subtabs('media',[['news','News'],['feed','Feed'],['charts','Charts'],['promo','Promo'],['awards','Awards']]);
 if(sub==='news')h+=`<section class="card paper"><div class="masthead">Music Row Insider</div>${S.news.map(n=>`<div class="story ${n.kind}"><span class="faint small">${dateStr(n.wk)}</span><p>${esc(n.t)}</p></div>`).join('')}</section>`;
 if(sub==='feed')h+=`<section class="card"><div class="between"><h3>Your feed</h3><span class="faint small">@${esc(S.handle)}</span></div>${S.feed.map(p=>`<div class="post">${p.who?`<span class="post-pt">${pt(p.who)}</span>`:'<span class="post-pt anon">♪</span>'}<div><b>${esc(p.h)}</b> <span class="faint small">· wk ${p.wk}</span><p>${esc(p.t)}</p><span class="faint small">♥ ${num(p.likes)}</span></div></div>`).join('')}</section>`;
 if(sub==='charts')h+=`<section class="card"><h3>Hot Country Songs</h3><p class="faint small">Week of ${dateStr(S.week)}</p><ol class="chart">${S.chart.slice(0,40).map((c,i)=>`<li class="${c.me?'me':''}"><span class="pos">${i+1}</span><span class="mv">${!c.last?'<em>NEW</em>':c.last>i+1?'<em class="up">▲</em>':c.last<i+1?'<em class="dn">▼</em>':'–'}</span><span class="ct"><b>${esc(c.t)}</b><small>${esc(c.a)}</small></span><span class="faint small">${c.w}w</span></li>`).join('')}</ol></section>`;
 if(sub==='promo')h+=`<section class="card"><h3>Promotion</h3><div class="stack tight">
  <button class="opt row-opt" data-promo="radio"><span><b>📻 Radio tour</b><small>Shake hands with program directors. Boosts singles on the chart.</small></span></button>
  <button class="opt row-opt" data-promo="tv" ${fame()<35?'disabled':''}><span><b>📺 Late-night TV spot</b><small>Needs Rising star. Big exposure, some risk.</small></span></button>
  <button class="opt row-opt" data-promo="mag" ${fame()<25?'disabled':''}><span><b>📸 Magazine cover</b><small>Image and fans.</small></span></button>
  <button class="opt row-opt" data-promo="fanfest"><span><b>✍️ Fan meet and greet</b><small>Tiring but fans adore you for it.</small></span></button>
  <button class="opt row-opt" data-promo="charity"><span><b>🎗 Benefit concert</b><small>$20K. Repairs your image and cools scandals.</small></span></button></div></section>
  <section class="card"><h3>Post on social media</h3><div class="grid2"><button class="qa" data-post="heart">💛 Heartfelt</button><button class="qa" data-post="funny">😂 Funny</button><button class="qa" data-post="promo">📣 Promo</button><button class="qa" data-post="bts">🎚 Behind the scenes</button><button class="qa danger" data-post="shade">🔥 Throw shade</button></div></section>`;
 if(sub==='awards')h+=`<section class="card"><h3>Awards</h3>${S.awards.length?S.awards.slice().reverse().map(a=>`<div class="songrow"><div><b>${a.won?'🏆 ':''}${esc(a.cat)}</b><small>${esc(a.show)} ${a.yr} · ${a.won?'Won':'Nominated'}</small></div></div>`).join(''):'<p class="muted">No nominations yet. The Country Music Awards are every November.</p>'}</section>`;
 return h},
life(){const sub=UI.sub.life;let h=subtabs('life',[['health','Health'],['team','Team'],['home','Home'],['business','Business'],['trophies','Trophies'],['settings','Settings']]);
 if(sub==='health'){const A=S.add;h+=`<section class="card"><h3>Wellbeing</h3>${meter('Health',S.health,'good')}${meter('Stress',S.stress,'amber')}${meter('Image',S.rep,'blue')}${meter('Credibility',S.cred,'gold')}${meter('Scandal',S.heat,'bad')}
  <div class="skills">${Object.entries(S.sk).map(([k,v])=>`<div><b class="num">${v}</b><span>${k}</span></div>`).join('')}</div>${S.traits.includes('stagefright')?'<p class="warn small">Stage fright: shows score lower. Good gigs and therapy will help.</p>':''}</section>
  ${A.dep>0||A.sub?`<section class="card addict"><h3>${A.sub==='pills'?'Pills':'Drinking'}</h3>${meter('Craving',A.dep,'bad')}<p class="small muted">${A.dep>=70?'You are in real trouble. Your body needs it to feel normal.':A.dep>=40?'You\'re dependent. Skipping it makes you sick and anxious.':A.dep>=15?'It\'s becoming a habit.':'Under control. For now.'} ${A.sober?`<b>${A.sober} weeks sober.</b>`:''}${S.flags.sponsor?` Sponsor: ${esc(nm(S.flags.sponsor))}.`:''}</p></section>`:''}
  <section class="card"><h3>Take care of yourself</h3><div class="grid2">
  <button class="qa" data-life="rest">😴 Rest</button><button class="qa" data-life="gym">🏃 Exercise</button><button class="qa" data-life="vcoach">🎙 Vocal lesson $800</button><button class="qa" data-life="guitar">🎸 Practice guitar</button><button class="qa" data-life="therapy">🛋 Therapy $300</button><button class="qa" data-life="vacation">🏖 Vacation week $12K</button>
  ${A.dep>0||A.sub?`<button class="qa" data-life="aa">🤝 AA meeting</button>`:''}<button class="qa warnq" data-life="party">🥃 Go out partying</button>${A.dep>10?`<button class="qa danger" data-life="drink">${A.sub==='pills'?'💊 Take something':'🍺 Have a drink'}</button>`:''}${A.dep>25?`<button class="qa" data-life="rehab">🏥 Check into rehab</button>`:''}</div></section>
  ${S.heat>15?`<section class="card"><h3>Damage control</h3><p class="small muted">Scandal heat ${Math.round(S.heat)}/100. Above 40 it eats your image every week.</p><div class="grid2"><button class="qa" data-pr="apologize">🙏 Public apology</button><button class="qa" data-pr="interview">🎙 Sit-down interview</button><button class="qa" data-pr="laylow">🕶 Lay low</button>${S.staff.publicist?'<button class="qa" data-pr="spin">🌀 Have your publicist spin it</button>':''}</div></section>`:''}`}
 if(sub==='team')h+=`<section class="card"><h3>Your team</h3>${STAFF.map(s=>`<div class="songrow"><div><b>${s.n}${s.id==='manager'&&S.manager?': '+esc(fullnm(S.manager)):''}</b><small>${s.d}${s.wk?' · '+money(s.wk)+'/week':''}</small></div><button class="mini ${S.staff[s.id]?'ghosty':''}" data-hire="${s.id}">${S.staff[s.id]?'Let go':'Hire'}</button></div>`).join('')}</section>`;
 if(sub==='home')h+=`<section class="card"><h3>Where you live</h3>${HOUSES.map(x=>`<div class="songrow ${S.house===x.id?'cur':''}"><div><b>${x.n}</b><small>${x.cost?'Buy '+money(x.cost)+' · upkeep '+money(x.upkeep)+'/wk':x.rent?'Rent '+money(x.rent)+'/wk':'Free'}</small></div>${S.house===x.id?'<span class="tag">Home</span>':`<button class="mini" data-house="${x.id}">Move</button>`}</div>`).join('')}</section>`;
 if(sub==='business'){const L=label();h+=`<section class="card"><h3>Record deal</h3><p><b>${esc(L.n)}</b></p><p class="small muted">${esc(L.desc)}</p>${S.label?`<p class="small">Royalty rate ${Math.round(S.label.royalty*100)}% · radio push ×${S.label.push.toFixed(2)}${S.label.recoup>0?` · <span class="neg">Unrecouped: ${money(S.label.recoup)}</span>`:''}${S.label.owed?` · ${S.label.owed} album(s) owed`:''}</p>`:''}
  <div class="stack tight" style="margin-top:10px">${S.label&&S.label.id!=='own'?'<button class="opt" data-biz="leave">Ask to be released from your contract</button>':''}${!F('ownlabel')&&!(S.label&&S.label.id==='own')?`<button class="opt" data-biz="found" ${S.money<750000||fame()<55?'disabled':''}>Start your own label ($750K, needs 55 fame)</button>`:''}</div></section>
  <section class="card"><h3>Money</h3><p class="small muted">Weekly costs: housing, staff wages and, once you're famous, the lifestyle (stylists, security, glam).</p><p class="small">Lifetime earnings ${money(S.stats.earned)}</p></section>`}
 if(sub==='trophies')h+=`<section class="card"><h3>Trophies (${Object.keys(S.ach).length}/${Object.keys(ACH).length})</h3><div class="trophies">${Object.entries(ACH).map(([k,[n,d]])=>`<div class="tro ${S.ach[k]?'got':''}"><b>${S.ach[k]?'🏆':'🔒'} ${esc(n)}</b><small>${esc(d)}</small></div>`).join('')}</div><p class="small muted">Legacy score: ${legacy()}</p></section>`;
 if(sub==='settings')h+=`<section class="card"><h3>Settings</h3><div class="stack tight"><button class="opt" data-set="sound">Sound: ${AUD.on?'On':'Off'}</button><button class="opt" data-set="retire">Retire and see your legacy</button><button class="opt danger" data-set="new">Start a new career (deletes this save)</button></div><p class="small faint" style="margin-top:12px">Nashville: Make It or Fake It is a just-for-fun fan game inspired by the TV drama Nashville. Songs, lyrics, events and statistics in the game are made up.</p></section>`;
 return h}
};
function openPerson(id){const c=CHARS[id],r=R(id);const acts=personActions(id);
 modal(`<div class="person"><div class="person-pt">${pt(id,r.a<-20?'angry':r.a>30?'happy':'neutral')}</div><div><span class="eyebrow">${esc(c.role)}</span><h2>${esc(c.n)}</h2><p class="muted small">${esc(c.bio)}</p></div></div>
 <div class="relbars">${meter('Friendship',(r.a+100)/2,r.a<0?'bad':'good')}${canRomance(id)?meter('Romance',r.r,'love'):''}</div><p class="small faint">${r.married?'Married':r.dating?'Dating':esc(r.tag||'')}${r.ex?' · Your ex':''}</p>
 <div class="grid2">${acts.map(([k,n])=>`<button class="qa" data-pa="${k}">${esc(n)}</button>`).join('')}</div><p class="faint small">Each costs energy. ⚡${S.ap} left this week.</p><div class="mfoot"><button class="ghost" data-x>Close</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]'))return closeModal();const b=e.target.closest('[data-pa]');if(b)personAct(id,b.dataset.pa)}})}
function doPR(k){if(!useAP(1))return;const o=snap();let t='';
 if(k==='apologize'){FX.heat(-20);FX.rep(3);FX.cred(-2);t='You posted a heartfelt apology video. Most people accepted it. Some called it fake.'}
 if(k==='interview'){if(perfScore(null)>55){FX.heat(-25);FX.rep(7);t='You sat down with a morning-show host and told the truth. America cried with you.'}else{FX.heat(6);FX.rep(-3);t='You got defensive on camera. The clip of you snapping at the host is everywhere.'}}
 if(k==='laylow'){FX.heat(-12);FX.st(-5);t='You stayed home, stayed off social media and let the news cycle move on.'}
 if(k==='spin'){FX.heat(-28);FX.m(-5000);t='Your publicist planted a story about your charity work and a photo of you at church. Problem solved, for $5K.'}
 if(o.heat>=60&&S.heat<25)ach('survivor');log(t);result('Damage control',t,o)}
function doBiz(k){if(k==='leave'){const L=S.label;const cost=Math.round((L.recoup||0)+(L.id==='edgehill'?250000:50000));confirmBox('Ask for your release?',`${label().n} will let you go if you pay ${money(cost)}${L.recoup?' (including your unrecouped advance)':''}. Your old songs stay with them.`,()=>{if(S.money<cost)return toast('You can\'t afford the buyout.');FX.m(-cost);const boss=LABELS[L.id].boss;if(boss)FX.a(boss,-20);S.label=null;log('You bought your way out of your record deal.','big');news(`${S.name} parts ways with ${LABELS[L.id].n}`,'big');save();render()})}
 if(k==='found'){confirmBox('Start your own label?','$750K to set up an office, staff and a radio team. You keep 62% royalties and own your masters.',()=>{if(S.money<750000)return;FX.m(-750000);S.label={id:'own',royalty:.62,push:1,recoup:0,owed:0,wk:0};FX.fl('ownlabel');if(S.char==='rayna')FX.fl('h65');FX.cred(6);ach('ownlabel');news(`${S.name} launches an independent record label`,'big');log('You started your own record label.','big');save();render()})}}

// ---------- title & creator ----------
function titleScreen(){const sv=load();
 $('#app').innerHTML=`<div class="title"><div class="title-bg"></div><div class="title-in"><div class="neon">Music City</div><p class="tag-line">Make it in Nashville. Survive the drama.</p>
 <div class="title-cast">${['rayna','juliette','deacon','scarlett','gunnar','avery','will'].map(k=>`<span>${pt(k,'happy')}</span>`).join('')}</div>
 <div class="stack tight title-btns">${sv&&!sv.over?`<button class="primary big" id="cont">Continue as ${esc(sv.name)} <small>Week ${sv.week}</small></button>`:''}<button class="${sv&&!sv.over?'opt':'primary'} big" id="newg">New career</button></div>
 <p class="faint small">An unofficial fan game inspired by the TV drama Nashville.</p></div></div>`;
 if($('#cont'))$('#cont').onclick=()=>{S=sv;migrate();UI.tab='home';render()};
 $('#newg').onclick=()=>chooseMode();}
function migrate(){const b=blankState();for(const k in b)if(S[k]===undefined)S[k]=b[k];for(const k in b.stats)if(S.stats[k]===undefined)S.stats[k]=0}
function chooseMode(){
 $('#app').innerHTML=`<div class="wrap notabs"><h1 class="screen-h">Who are you?</h1><button class="newcard" id="own"><span class="newcard-pt">${portrait({g:'f',skin:'#d9a27c',hair:'#2a1a12',style:'ponytail',outfit:'#8a3a3a',top:'flannel',hat:'#7a5a3a',bg:'#3a2a2a'},{mood:'happy'})}</span><span><span class="eyebrow">Your own story</span><b>A newcomer with a dream</b><small>Create your own artist and start from nothing: busking on Broadway, open mics at the Bluebird, and a town full of legends who don't know your name yet.</small></span></button>
 <h2 class="screen-h2">Or play a legend</h2><div class="legends">${Object.entries(LEGENDS).map(([k,L])=>`<button class="legend" data-leg="${k}"><span class="legend-pt">${pt(k,'happy')}</span><span class="legend-txt"><b>${esc(CHARS[k].n)}</b><small class="spot">${esc(CHARS[k].role)}</small><small>${esc(L.hook)}</small><small class="faint">${esc(L.diff)}</small></span></button>`).join('')}</div><button class="ghost" id="back">Back</button></div>`;
 $('#own').onclick=creator;$('#back').onclick=titleScreen;document.querySelectorAll('[data-leg]').forEach(b=>b.onclick=()=>newGame({legend:b.dataset.leg}));scrollTo(0,0)}
const SKINS=['#f8dcc8','#f0c8a6','#e2b08a','#c98e66','#a8724f','#7d5136','#5a3a26'];
const HAIRS=['#f1dc9c','#e9c66f','#c9873c','#7a3a1e','#5a3a22','#2a1a12','#151010','#9a9a9a','#c04a3a'];
const OUTFITS=['#1f2b47','#272727','#8a3a3a','#4a3a2e','#9bbbd9','#d8709a','#3b5a85','#6a4b38','#f2efe6','#2e5a3a'];
function creator(){const c={name:'',g:'f',genre:'Country',bg:'smalltown',age:22,look:{g:'f',skin:SKINS[1],hair:HAIRS[3],style:'longwave',eyes:'#5a4030',outfit:OUTFITS[2],top:'flannel',hat:null,beard:0,bg:'#3a2a40',earrings:1}};
 const styles={f:['longwave','longstraight','curly','bob','ponytail','messy','short'],m:['short','shaggy','messy','slick','buzz','curly','longstraight','bald']};
 const tops=['flannel','denim','leather','shirt','vneck','dress','tee','jacket','suit'];
 const sw=(arr,key,cur)=>arr.map(v=>`<button class="sw ${cur===v?'on':''}" style="background:${v}" data-k="${key}" data-v="${v}" aria-label="${key} ${v}"></button>`).join('');
 const draw=()=>{const L=c.look;$('#app').innerHTML=`<div class="wrap notabs creator"><h1 class="screen-h">Create your artist</h1><div class="cr-prev">${portrait(L,{mood:'happy'})}</div>
 <label class="field">Stage name<input id="cname" maxlength="24" placeholder="e.g. Ruby Hale" value="${esc(c.name)}"></label>
 <div class="field">Presentation<div class="seg">${[['f','Feminine'],['m','Masculine']].map(([k,n])=>`<button class="${c.g===k?'on':''}" data-g="${k}">${n}</button>`).join('')}</div></div>
 <div class="field">Skin<div class="sws">${sw(SKINS,'skin',L.skin)}</div></div>
 <div class="field">Hair colour<div class="sws">${sw(HAIRS,'hair',L.hair)}</div></div>
 <div class="field">Hair style<div class="chips-sel">${styles[c.g].map(s=>`<button class="${L.style===s?'on':''}" data-style="${s}">${s.replace('long','long ')}</button>`).join('')}</div></div>
 <div class="field">Outfit<div class="sws">${sw(OUTFITS,'outfit',L.outfit)}</div><div class="chips-sel">${tops.map(s=>`<button class="${L.top===s?'on':''}" data-top="${s}">${s}</button>`).join('')}</div></div>
 <div class="field">Extras<div class="chips-sel"><button class="${L.hat?'on':''}" data-x="hat">Cowboy hat</button><button class="${L.earrings?'on':''}" data-x="earrings">Earrings</button><button class="${L.freckles?'on':''}" data-x="freckles">Freckles</button><button class="${L.glasses?'on':''}" data-x="glasses">Glasses</button>${c.g==='m'?`<button class="${L.beard===1?'on':''}" data-x="stubble">Stubble</button><button class="${L.beard===2?'on':''}" data-x="beard">Beard</button>`:''}</div></div>
 <div class="field">Sound<div class="chips-sel">${GENRES.map(g=>`<button class="${c.genre===g?'on':''}" data-genre="${g}">${g}</button>`).join('')}</div></div>
 <div class="field">Backstory<div class="stack tight">${BACKGROUNDS.map(b=>`<button class="opt ${c.bg===b.id?'on':''}" data-bg="${b.id}"><b>${b.n}</b><small>${b.d}</small></button>`).join('')}</div></div>
 <div class="row"><button class="ghost" id="cback">Back</button><button class="primary big" id="cgo">Step off the bus ▸</button></div></div>`;
  $('#cname').oninput=e=>c.name=e.target.value;$('#cback').onclick=chooseMode;$('#cgo').onclick=()=>{if(!c.name.trim())c.name=pick(['Ruby Hale','Cassidy Rae','Jesse Cole','Lainey Brooks','Tucker James','Wren Callahan']);newGame({name:c.name.trim(),g:c.g,look:c.look,genre:c.genre,bg:c.bg})}}
 const root=document.getElementById('app');
 root.onclick=null;
 const handler=e=>{const t=e.target;if(!document.querySelector('.creator'))return root.removeEventListener('click',handler);const L=c.look;let ch=0;
  const s=t.closest('[data-k]');if(s){L[s.dataset.k]=s.dataset.v;ch=1}
  const g=t.closest('[data-g]');if(g){c.g=g.dataset.g;L.g=c.g;L.style=styles[c.g][0];L.beard=0;L.earrings=c.g==='f'?1:0;ch=1}
  const st=t.closest('[data-style]');if(st){L.style=st.dataset.style;ch=1}const tp=t.closest('[data-top]');if(tp){L.top=tp.dataset.top;ch=1}
  const x=t.closest('[data-x]');if(x){const k=x.dataset.x;if(k==='hat')L.hat=L.hat?null:'#7a5a3a';else if(k==='stubble')L.beard=L.beard===1?0:1;else if(k==='beard')L.beard=L.beard===2?0:2;else L[k]=L[k]?0:1;ch=1}
  const gn=t.closest('[data-genre]');if(gn){c.genre=gn.dataset.genre;ch=1}const b=t.closest('[data-bg]');if(b){c.bg=b.dataset.bg;ch=1}
  if(ch){const y=scrollY;draw();scrollTo(0,y)}};
 root.addEventListener('click',handler);draw();scrollTo(0,0)}

// ---------- global click routing ----------
document.addEventListener('click',e=>{const t=e.target;
 if(t.closest('#modal')){if(t.id==='modal'&&!$('#modal').dataset.lock)return closeModal();if(MCB)MCB(e);return}
 if(!S||S.over)return;
 const g=k=>t.closest('['+k+']');let el;
 if(el=g('data-tab')){UI.tab=el.dataset.tab;render();scrollTo(0,0);return}
 if(el=g('data-sub')){const[a,b]=el.dataset.sub.split(':');UI.sub[a]=b;render();return}
 if(el=g('data-goto')){const[a,b]=el.dataset.goto.split(':');UI.tab=a;if(b)UI.sub[a]=b;render();scrollTo(0,0);return}
 if(el=g('data-pf')){UI.pf=el.dataset.pf;render();return}
 if(el=g('data-act')){const k=el.dataset.act;if(k==='next')return nextWeek();if(k==='write')return startWrite(null);if(k==='album')return startAlbum()}
 if(el=g('data-cowrite'))return startWrite(el.dataset.cowrite);
 if(el=g('data-record'))return startRecord(+el.dataset.record);
 if(el=g('data-release'))return startRelease(+el.dataset.release);
 
 if(el=g('data-gig'))return startGig(el.dataset.gig);
 if(el=g('data-tour'))return startTour(el.dataset.tour);
 if(el=g('data-person'))return openPerson(el.dataset.person);
 if(el=g('data-promo'))return act(doPromo)(el.dataset.promo);
 if(el=g('data-post'))return act(doPost)(el.dataset.post);
 if(el=g('data-life'))return act(doLife)(el.dataset.life);
 if(el=g('data-pr'))return act(doPR)(el.dataset.pr);
 if(el=g('data-hire'))return hire(el.dataset.hire);
 if(el=g('data-house'))return moveHouse(el.dataset.house);
 if(el=g('data-biz'))return doBiz(el.dataset.biz);
 if(el=g('data-set')){const k=el.dataset.set;if(k==='sound'){AUD.on=!AUD.on;try{localStorage.setItem('mc_sound',AUD.on?1:0)}catch(_){}render()}if(k==='retire')retire();if(k==='new')confirmBox('Start over?','This deletes your current career.',()=>{try{localStorage.removeItem(SAVE_KEY)}catch(_){}S=null;chooseMode()});return}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#modal').classList.contains('open')&&!$('#modal').dataset.lock)closeModal()});
try{if(localStorage.getItem('mc_sound')==='0')AUD.on=false}catch(e){}
window.addEventListener('DOMContentLoaded',()=>render());
