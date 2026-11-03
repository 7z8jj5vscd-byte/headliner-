// Nashville: Make It or Fake It: record labels that scout and court you, real deal negotiation, managers you
// interview and direct, and a fuller team (booking agent, entertainment lawyer, business manager).

// ---------- labels ----------
LABELS.mock={n:'Mockingbird Music',boss:'tammy',push:1.12,royalty:.22,desc:'A mid-size Nashville label with a sharp radio team and a soft spot for songwriters.'};
const LABEL_IDS=['edgehill','mock','highway65','bluegrass'];
function labelOpen(id){if(id==='edgehill')return!F('edgehillClosed');if(id==='highway65')return(F('h65npc')||F('h65'))&&!(S.char==='rayna'&&F('h65'))&&!F('sold')||(F('sold')&&S.char!=='rayna');return true}
function labelBoss(id){const b=LABELS[id].boss;if(id==='highway65')return has('rayna')?'rayna':has('deacon')?'deacon':null;return b&&has(b)?b:null}
const LABEL_STYLE={edgehill:'Major label. The biggest radio push in town, but they want control.',mock:'Mid-size. Good radio, fair-ish deals.',highway65:'Artist-first. Better royalties, smaller budget.',bluegrass:'Tiny indie. Cares about songs, not singles.'};
const LABEL_BAR={edgehill:30,mock:18,highway65:15,bluegrass:5};
const ADV_BASE=id=>Math.round(({edgehill:60000,mock:30000,highway65:25000,bluegrass:6000})[id]+fame()*({edgehill:5000,mock:2500,highway65:1800,bluegrass:600})[id]);
function ensureBiz(){S.labInt=S.labInt||{};LABEL_IDS.forEach(id=>{if(S.labInt[id]==null)S.labInt[id]=clamp(fame()*.5,0,60)});S.mgrFocus=S.mgrFocus||'book';S.offers=S.offers||[]}
function intLabel(v){return v>=70?'Ready to make an offer':v>=50?'Interested':v>=30?'Watching you':'Not interested yet'}
function bizTick(silent){ensureBiz();const hits=charting().reduce((a,s)=>a+s.pts,0);
 LABEL_IDS.forEach(id=>{if(!labelOpen(id)||(S.label&&S.label.id===id))return;const target=clamp(fame()*.75+hits/6+S.stats.top10*4+(S.cred-50)/5-(S.heat>50?15:0)-LABEL_BAR[id]+20,0,100);S.labInt[id]=clamp(S.labInt[id]+(target-S.labInt[id])*.12,0,100);
  if(!silent&&S.labInt[id]>=72&&(!S.label||S.label.id==='indie')&&!F('offerWk_'+id)&&chance(.35)){S.flags['offerWk_'+id]=S.week;queueDeal(id)}
  if(S.flags['offerWk_'+id]&&S.week-S.flags['offerWk_'+id]>20)S.flags['offerWk_'+id]=0});
 // manager focus
 if(S.manager&&has(S.manager)){const M=MANAGER_STATS[S.manager]||{book:3,deal:3,press:3,net:3};const f=S.mgrFocus;
  if(f==='book'){const p=Math.round((150+fame()*90)*M.book/3);FX.m(p);FX.f(10+fame()*2);log(`${nm(S.manager)} booked you paid appearances: ${money(p)}.`,'good')}
  if(f==='deals')LABEL_IDS.forEach(id=>S.labInt[id]=clamp(S.labInt[id]+M.net*.8,0,100));
  if(f==='press')FX.heat(-M.press*1.2);
  if(f==='social'){S.followers=Math.round((S.followers||0)*(1+.004*M.net)+50);if(S.soc)['chirp','snap','clip'].forEach(k=>S.soc[k]=Math.round(S.soc[k]*(1+.004*M.net)+15))}
  if(f==='rest')FX.st(-4)}
 // team
 if(S.staff.agent&&fame()>=8){const p=Math.round(120+fame()*70);FX.m(p);FX.f(8+fame());if(!silent&&chance(.2))log(`Your booking agent got you a county fair slot: ${money(p)}.`,'good')}
 if(S.staff.bizmgr){if(S.money>0)FX.m(Math.round(S.money*.0008));if(S.flags.broke)S.flags.broke=Math.max(0,S.flags.broke-1)}
 if(S.label&&S.label.d360&&S.flags.lastMoney!=null){}}
// ---------- the record labels screen ----------
VIEWS.deals=function(){ensureBiz();const L=S.label;const owned=ownsLabel();
 const contract=L&&L.id!=='indie'?`<section class="card contract"><span class="eyebrow">Your record deal</span><div class="between"><h2>${esc(label().n)}</h2>${labelBoss(L.id)?`<span class="mini-av">${pt(labelBoss(L.id))}</span>`:''}</div>
  <div class="terms"><div><b>${Math.round(L.royalty*100)}%</b><span>royalty</span></div><div><b>×${L.push.toFixed(2)}</b><span>radio push</span></div><div><b>${L.owed||0}</b><span>albums owed</span></div><div><b>${L.ctrl||'shared'}</b><span>creative control</span></div></div>
  ${L.recoup>0?`<p class="small neg">Unrecouped advance: ${money(L.recoup)}. Your royalties pay it back before you see a cent.</p>`:'<p class="small pos">Advance recouped. Royalties come to you.</p>'}${L.d360?'<p class="small warn">360 deal: the label takes 15% of your show income.</p>':''}
  ${!owned?meter('Label relationship',S.labelRel,S.labelRel<30?'bad':'blue'):''}
  ${!owned?`<div class="grid2" style="margin-top:10px"><button class="qa" data-lb="push">📻 Ask for a bigger radio push</button><button class="qa" data-lb="tour">🚌 Ask for tour support</button><button class="qa" data-lb="meet">🤝 Meeting with the label</button><button class="qa" data-biz="leave">🚪 Buy out your contract</button></div>`:'<button class="primary" data-tab="label">Run your label</button>'}</section>`:
  `<section class="card contract"><span class="eyebrow">Your record deal</span><h2>Unsigned</h2><p class="small muted">You're independent: you keep 80% of a much smaller pie and radio barely knows you exist. Raise interest below and a label will make an offer.</p></section>`;
 const labels=LABEL_IDS.filter(id=>!(L&&L.id===id)).map(id=>{const open=labelOpen(id),v=Math.round(S.labInt[id]||0),boss=labelBoss(id);
  return`<section class="card labcard ${open?'':'closed'}"><div class="labtop">${boss?`<span class="mini-av big">${pt(boss)}</span>`:'<span class="mini-av big lab-ic">🏷</span>'}<div><h3>${esc(LABELS[id].n)}</h3><p class="small muted">${esc(LABEL_STYLE[id])}${boss?` Run by ${esc(fullnm(boss))}.`:''}</p></div></div>
  ${open?`${meter('Interest',v,v>=70?'good':v>=40?'amber':'blue')}<p class="small ${v>=70?'pos':'faint'}">${intLabel(v)} · advances around ${money(ADV_BASE(id))}</p>
  <div class="grid2"><button class="qa" data-lw="demo:${id}">💿 Send a demo</button><button class="qa" data-lw="showcase:${id}">🎤 Play a showcase</button><button class="qa" data-lw="lunch:${id}">🍽 Lunch with the A&R</button><button class="qa" data-lw="offer:${id}" ${v>=60&&(!L||L.id==='indie')?'':'disabled'}>📝 Ask for an offer</button></div>`:`<p class="small faint">${id==='edgehill'?'Closed down.':id==='highway65'?'Not open for business yet.':'Not available.'}</p>`}</section>`}).join('');
 return contract+`<h2 class="hub-h">Labels in town</h2>`+labels+mgrCard()};
function labelWork(k,id){const o=snap();const boss=labelBoss(id);let t='';
 if(k==='offer'){if(S.labInt[id]<60)return toast('They aren\'t interested enough yet.');return negotiate(id)}
 UI.act=k==='showcase'?'gig':'lab';UI.oppCost=k==='demo'?10:k==='showcase'?25:10;if(!useAP(1))return;
 if(k==='demo'){const s=S.songs.filter(x=>x.st!=='sold').sort((a,b)=>fq(b)-fq(a))[0];if(!s){S.ap+=10;return toast('Write a song first.')}const g=Math.round(fq(s)/7+rnd(-3,5));S.labInt[id]=clamp(S.labInt[id]+g,0,100);t=`You sent "${s.title}". ${g>=10?'The A&R called back the same day: "Who produced this? We want more."':g>=5?'"Good song. Keep us posted."':'No reply. Silence is an answer too.'} Interest +${g}.`}
 if(k==='showcase'){const p=perfScore(null);const g=Math.round((p-50)/2.2+rnd(0,6));S.labInt[id]=clamp(S.labInt[id]+g,0,100);if(boss)FX.a(boss,p>65?6:-2);t=`You played a 20-minute showcase for ${esc(LABELS[id].n)} at a Music Row office. Show ${p}/100. ${p>=75?'The room was nodding along by the second song.':p>=55?'Polite applause and a few notes.':'Someone checked their phone during your best song.'} Interest ${g>=0?'+':''}${g}.`}
 if(k==='lunch'){S.labInt[id]=clamp(S.labInt[id]+4,0,100);if(boss)FX.a(boss,5);t=`Lunch at the Southern Steak & Oyster with ${esc(LABELS[id].n)}'s A&R team. They talked about radio formats for an hour. Interest +4.`}
 log(t);modal3D(`${sceneBox('wide','')}<span class="eyebrow">${esc(LABELS[id].n)}</span><h2>${k==='demo'?'Demo sent':k==='showcase'?'Label showcase':'Label lunch'}</h2><p>${t}</p><div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>OK</button></div>`,boss?duoSpec(boss,'neutral',k==='showcase'?'stage':'office','happy'):{set:k==='showcase'?'stage':'office',cam:'bust',chars:[{look:S.look,mood:'happy'}]},{onClick:e=>{if(e.target.closest('[data-x]')){closeModal();save();render();runQueue()}}});save();render()}
function labelRequest(k){const o=snap();let t='';const id=S.label.id;UI.act='lab';UI.oppCost=10;if(!useAP(1))return;
 if(k==='push'){if(S.labelRel>=55||chance(S.labelRel/120)){S.promo+=2;S.labelRel=clamp(S.labelRel-6,0,100);t='They agreed to put extra radio money behind your next single.'}else{S.labelRel=clamp(S.labelRel-10,0,100);t='"Deliver a hit first, then we\'ll talk." The door closed.'}}
 if(k==='tour'){if(S.labelRel>=60){const m=Math.round(20000+fame()*600);FX.m(m);S.label.recoup+=m;S.labelRel=clamp(S.labelRel-8,0,100);t=`Tour support approved: ${money(m)}, added to your unrecouped balance.`}else{S.labelRel=clamp(S.labelRel-5,0,100);t='"The budget for that is spoken for."'}}
 if(k==='meet'){S.labelRel=clamp(S.labelRel+8,0,100);const b=labelBoss(id);if(b)FX.a(b,4);t='You played them three new songs on an acoustic in the conference room. They leaned in.'}
 log(t);result(label().n,esc(t),o)}

// ---------- offers and negotiation ----------
window.queueDeal=function(id){if(UI.queue.find(q=>q.id==='deal_'+id))return;if(!labelOpen(id)&&id!=='highway65')return;ensureBiz();S.labInt[id]=Math.max(S.labInt[id]||0,65);const boss=labelBoss(id);
 UI.queue.push({id:'deal_'+id,ev:{sys:1,id:'deal_'+id,tag:'Record deal',who:boss,set:'office',mood:'happy',title:`${LABELS[id].n} wants to sign you`,text:`${esc(LABEL_STYLE[id])}<br><br>Their opening offer: about <b>${money(ADV_BASE(id))}</b> advance, <b>${Math.round(LABELS[id].royalty*100)}%</b> royalty, 2 albums.`,
  ch:[c('Negotiate the deal','Push for better terms',()=>{setTimeout(()=>negotiate(id),40);return''},{go:1,req:()=>!S.label||S.label.id==='indie'}),c('Sign their offer as it stands','Quick',()=>{signDeal(id,{adv:ADV_BASE(id),roy:LABELS[id].royalty,albums:2,ctrl:'shared',d360:id==='edgehill'});return `You signed with ${LABELS[id].n}.`},{req:()=>!S.label||S.label.id==='indie'}),c('Turn it down','Stay free',()=>{S.labInt[id]=clamp(S.labInt[id]-10,0,100);FX.cred(1);return 'You walked out onto 16th Avenue free and broke.'})]}})};
function signDeal(id,T){sign(id,T.adv,T.roy,LABELS[id].push*(T.ctrl==='label'?1.08:T.ctrl==='you'?.95:1)*(T.d360?1.05:1),T.albums);Object.assign(S.label,{ctrl:T.ctrl,d360:T.d360,owed:T.albums});S.labelRel=55;if(T.ctrl==='label')FX.cred(-3);if(T.ctrl==='you')FX.cred(2);addMemory&&addMemory(`Signed with ${LABELS[id].n}`,'office',labelBoss(id)?[labelBoss(id),'me']:['me'],'happy')}
function negotiate(id){closeModal();const base=ADV_BASE(id),r0=LABELS[id].royalty;const N={adv:1,roy:1,albums:2,ctrl:'shared',d360:id==='edgehill'?1:0,pat:3,msg:''};const ADV=[.7,1,1.4,1.8],ROY=[-.04,0,.04,.08];
 const greed=()=>(N.adv-1)*1.1+(N.roy-1)*1.2+(N.albums===1?.8:N.albums===3?-.6:0)+(N.ctrl==='you'?1.2:N.ctrl==='label'?-.8:0)+(N.d360?-.9:.5);
 const pAccept=()=>clamp(.9-greed()*.16+((S.labInt[id]||60)-70)/90+(S.staff.lawyer?.12:0)+((MANAGER_STATS[S.manager]||{deal:0}).deal*.03),.03,.97);
 const terms=()=>({adv:Math.round(base*ADV[N.adv]),roy:clamp(r0+ROY[N.roy],.08,.6),albums:N.albums,ctrl:N.ctrl,d360:!!N.d360});
 const opt=(k,vals,labels)=>`<div class="seg">${vals.map((v,i)=>`<button class="${N[k]===v?'on':''}" data-nk="${k}" data-nv="${v}">${labels[i]}</button>`).join('')}</div>`;
 const draw=()=>{const T=terms(),p=pAccept();$('#mbody').innerHTML=`<span class="eyebrow">Negotiating with ${esc(LABELS[id].n)}${S.staff.lawyer?' · your lawyer is in the room':''}</span><h2>The deal</h2>
  <div class="field">Advance: <b>${money(T.adv)}</b>${opt('adv',[0,1,2,3],['Low','Their offer','More','A lot more'])}</div>
  <div class="field">Royalty: <b>${Math.round(T.roy*100)}%</b>${opt('roy',[0,1,2,3],['Lower','Their offer','Higher','Much higher'])}</div>
  <div class="field">Albums owed${opt('albums',[1,2,3],['1 album','2 albums','3 albums'])}</div>
  <div class="field">Creative control${opt('ctrl',['label','shared','you'],['The label','Shared','You'])}</div>
  <div class="field">360 deal (label takes 15% of show income)${opt('d360',[1,0],['Accept 360','No 360'])}</div>
  <div class="dealmeter"><span>Chance they say yes</span><i><b style="width:${p*100}%" class="${p<.35?'low':''}"></b></i><em>${Math.round(p*100)}%</em></div><p class="small faint">Their patience: ${'●'.repeat(N.pat)}${'○'.repeat(3-N.pat)}${N.msg?` · <span class="warn">${esc(N.msg)}</span>`:''}</p>
  <div class="mfoot"><button class="ghost" data-nx>Walk away</button><button class="primary" data-np>Make your offer</button></div>`;
  modal3DRefresh()};
 const modal3DRefresh=()=>{};
 modal('',{lock:1,onClick:e=>{const b=e.target.closest('[data-nk]');if(b){const k=b.dataset.nk;N[k]=isNaN(+b.dataset.nv)?b.dataset.nv:+b.dataset.nv;return draw()}
  if(e.target.closest('[data-nx]')){S.labInt[id]=clamp(S.labInt[id]-8,0,100);closeModal();toast('You walked away. The offer may come back later.');save();render();return}
  if(e.target.closest('[data-np]')){const p=pAccept();if(chance(p)){const T=terms();signDeal(id,T);closeModal();sfx('big');result(LABELS[id].n,`They said yes. ${money(T.adv)} advance, ${Math.round(T.roy*100)}% royalty, ${T.albums} album${T.albums>1?'s':''}, ${T.ctrl==='you'?'you have creative control':T.ctrl==='label'?'the label has creative control':'shared creative control'}${T.d360?', 360 deal':''}. You signed in a glass office on Music Row with your hands shaking.`,snap());return}
   N.pat--;if(N.pat<=0){S.labInt[id]=clamp(S.labInt[id]-20,0,100);closeModal();result(LABELS[id].n,'"We\'re done here." They pulled the offer. Interest dropped sharply. Give it a few months.',snap());return}
   if(N.adv>1)N.adv--;else if(N.roy>1)N.roy--;else if(N.ctrl==='you')N.ctrl='shared';else if(!N.d360&&id==='edgehill')N.d360=1;N.msg=pick(['"We can\'t do that. Here\'s our counter."','"Our CFO would kill me. Meet us halfway."','"Interesting. No. Try again."']);sfx('tap');draw()}}});draw()}
// 360 deals take a cut of show income
['gigResult','tourWeek'].forEach(fn=>{const o=window[fn];window[fn]=function(...a){const m0=S.money;const r=o.apply(this,a);if(S.label&&S.label.d360&&S.money>m0){const cut=Math.round((S.money-m0)*.15);S.money-=cut;if(cut>500)log(`Your 360 deal sent ${money(cut)} of show money to ${label().n}.`)}return r}});

// ---------- managers ----------
CHARS.tammy={n:'Tammy Rae Holt',short:'Tammy',role:'Manager and Mockingbird Music co-founder',bio:'Sharp-tongued and ruthless at the negotiating table. She gets her clients the biggest deals in town, and her 20%.',look:{g:'f',skin:'#efc8a6',hair:'#c0502a',style:'bob',eyes:'#4a5a3a',lips:'#b2303e',outfit:'#1e1e2a',top:'jacket',earrings:1,necklace:1,age:1,bg:'#2a2030'},adult:1};
CHARS.dex={n:'Dexter Lane',short:'Dex',role:'Young manager',bio:'Twenty-six, two phones, a million ideas. He knows social media better than radio, and only takes 10%.',look:{g:'m',skin:'#7d5136',hair:'#151010',style:'short',eyes:'#2a1a10',outfit:'#3a5a85',top:'denim',beard:1,bg:'#22304a'},adult:1};
const MANAGER_STATS={glenn:{book:3,deal:3,press:5,net:3,cut:15,min:10,pitch:'Kind, patient and loyal. He has seen every kind of meltdown and stayed for all of them.'},bucky:{book:4,deal:3,press:3,net:4,cut:15,min:30,pitch:'Calm in a crisis and connected to everybody on Music Row.'},tammy:{book:3,deal:5,press:2,net:4,cut:20,min:35,pitch:'She will get you the best deal in town and remind you of it every day.'},dex:{book:4,deal:2,press:3,net:5,cut:10,min:0,pitch:'Hungry, online and cheap. He might be the future.'}};
const FOCUS=[['book','📅 Book gigs','Paid appearances every week.'],['deals','📝 Court labels','Label interest rises faster.'],['press','🗞 Handle the press','Scandals cool down faster.'],['social','📱 Grow your socials','Followers grow every week.'],['rest','🛌 Protect your time','Less stress for you.']];
function mgrCard(){const m=S.manager&&has(S.manager)?S.manager:null;if(!m)return`<section class="card"><span class="eyebrow">Management</span><h3>No manager</h3><p class="small muted">A manager books gigs, courts labels, handles the press or grows your socials, and takes a cut.</p><button class="primary" data-mgr="hire">Interview managers</button></section>`;
 const M=MANAGER_STATS[m]||{book:3,deal:3,press:3,net:3,cut:15};const st=(n,v)=>`<div><b>${'★'.repeat(v)}${'☆'.repeat(5-v)}</b><span>${n}</span></div>`;
 return`<section class="card mgr"><span class="eyebrow">Your manager</span><div class="labtop"><span class="mini-av big">${pt(m)}</span><div><h3>${esc(fullnm(m))}</h3><p class="small muted">${M.cut}% commission · ${R(m).a>=50?'loves working with you':R(m).a>=0?'on good terms':'frustrated with you'}</p></div></div>
 <div class="mstats">${st('Booking',M.book)}${st('Deals',M.deal)}${st('Press',M.press)}${st('Network',M.net)}</div><h3>This week, focus on…</h3><div class="stack tight">${FOCUS.map(([k,n,d])=>`<button class="opt ${S.mgrFocus===k?'on':''}" data-mfocus="${k}">${n}<small>${d}</small></button>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="mini ghosty" data-mgr="meet">🤝 Strategy meeting ⚡10</button><button class="mini ghosty" data-mgr="hire">🔁 Change manager</button><button class="mini ghosty" data-mgr="fire">Let go</button></div></section>`}
function mgrInterview(){const list=Object.keys(MANAGER_STATS).filter(k=>has(k)&&k!==S.manager&&!(S.char==='rayna'&&k==='glenn'&&false));
 modal(`<span class="eyebrow">Interviews</span><h2>Choose a manager</h2><div class="stack tight">${list.map(k=>{const M=MANAGER_STATS[k],ok=fame()>=M.min;return`<button class="opt row-opt" data-pickm="${k}" ${ok?'':'disabled'}><span class="mini-pt">${pt(k)}</span><span><b>${esc(fullnm(k))} · ${M.cut}%</b><small>${esc(M.pitch)}</small><small>Booking ${M.book} · Deals ${M.deal} · Press ${M.press} · Network ${M.net}${ok?'':` · Needs ${M.min} fame`}</small></span></button>`}).join('')}</div><div class="mfoot"><button class="ghost" data-x>Cancel</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]'))return closeModal();const b=e.target.closest('[data-pickm]');if(b&&!b.disabled){const k=b.dataset.pickm;if(S.manager&&S.manager!==k)FX.a(S.manager,-15);S.manager=k;S.staff.manager=1;R(k).tag='Manager';R(k).met=1;FX.a(k,10);log(`${fullnm(k)} is your new manager.`,'good');closeModal();save();render();modal3D(`${sceneBox('wide','')}<span class="eyebrow">Management</span><h2>You hired ${esc(fullnm(k))}</h2><p>${esc(MANAGER_STATS[k].pitch)} "Let's get to work."</p><div class="mfoot"><button class="primary" data-x>Shake on it</button></div>`,duoSpec(k,'happy','office','happy'),{onClick:x=>{if(x.target.closest('[data-x]'))closeModal()}})}}})}
window.hire=(function(_h){return function(id){if(id==='manager'&&!S.staff[id])return mgrInterview();return _h(id)}})(window.hire);
STAFF.push({id:'agent',n:'Booking agent',wk:1200,d:'Finds you paid fairs and club dates every week.'},{id:'lawyer',n:'Entertainment lawyer',wk:1000,d:'Better odds when you negotiate a record deal, cheaper buyouts.'},{id:'bizmgr',n:'Business manager',wk:900,d:'Earns a little interest on your savings and keeps you out of bankruptcy.'});

// ---------- hooks ----------
(function(){const _ew=window.endWeek;window.endWeek=function(silent){_ew(silent);bizTick(silent)}})();
(function(){const _m=window.migrate;window.migrate=function(){_m();ensureBiz()}})();
(function(){const _ng=window.newGame;window.newGame=function(cfg){_ng(cfg);ensureBiz();if(S.label&&S.label.id==='edgehill'){S.label.ctrl='label';S.label.d360=0}save();render()}})();
const _life6=VIEWS.life;VIEWS.life=function(){let h=_life6();if(UI.sub.life==='team'){const i=h.indexOf('<section class="card"><h3>Your team</h3>');if(i>=0)h=h.slice(0,i)+mgrCard()+h.slice(i).replace(/<div class="songrow"><div><b>Manager[\s\S]*?<\/button><\/div>/,'')}return h};
document.addEventListener('click',e=>{if(!S||S.over||e.target.closest('#modal'))return;let el;
 if(el=e.target.closest('[data-lw]')){const[k,id]=el.dataset.lw.split(':');return labelWork(k,id)}if(el=e.target.closest('[data-lb]'))return labelRequest(el.dataset.lb);
 if(el=e.target.closest('[data-mfocus]')){S.mgrFocus=el.dataset.mfocus;save();render();return toast('Focus set for this week.')}
 if(el=e.target.closest('[data-mgr]')){const k=el.dataset.mgr;if(k==='hire')return mgrInterview();if(k==='fire'){FX.a(S.manager,-20);log(`You let ${fullnm(S.manager)} go.`);S.manager=null;S.staff.manager=0;save();render();return}if(k==='meet'){UI.act='circ';return circleAct('mgr')}}});
