// Music City: core engine, weekly simulation and UI.
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function money(v){const s=v<0?'-':'';v=Math.abs(v);return s+'$'+(v>=1e6?(v/1e6).toFixed(v>=1e7?1:2)+'M':v>=1e4?Math.round(v/1e3)+'K':Math.round(v).toLocaleString())}
function num(v){return v>=1e6?(v/1e6).toFixed(v>=1e7?1:2)+'M':v>=1e4?Math.round(v/1e3)+'K':Math.round(v).toLocaleString()}
const SAVE_KEY='musiccity_save_v1';
let S=null;const UI={tab:'home',sub:{music:'write',media:'news',life:'health',stage:'venues'},queue:[],busy:false};

// ---------- derived ----------
const fame=()=>clamp(Math.round((Math.log10(S.fans+1)-2)/5*100),0,100);
const fameTitle=()=>{const f=fame();return f>=95?'Legend':f>=85?'Superstar':f>=72?'Star':f>=58?'Headliner':f>=42?'Rising star':f>=25?'Local name':f>=10?'Unknown':'Nobody'};
const isMe=id=>S.char===id;
const has=id=>!!CHARS[id]&&S.char!==id&&!(S.gone&&S.gone[id])&&(!CHARS[id].teen||['rayna','deacon'].includes(S.char))&&(!CHARS[id].fam||CHARS[id].fam.includes(S.char))&&(!CHARS[id].from||S.week>=CHARS[id].from)&&(!CHARS[id].until||S.week<CHARS[id].until);
const R=id=>S.rel[id]||(S.rel[id]={a:0,r:0,tag:'',met:0});
const nm=id=>id==='me'?S.name:(CHARS[id]?CHARS[id].short:id);
const fullnm=id=>CHARS[id]?CHARS[id].n:id;
const myLook=()=>S.look;
const lookOf=id=>id==='me'?S.look:CHARS[id]?CHARS[id].look:{};
const pt=(id,mood,ring)=>portrait(lookOf(id),{mood,ring,label:id==='me'?S.name:fullnm(id)});
const apMax=()=>Math.max(30,Math.round((S.tour?65:100)+(S.diff==='easy'?25:S.diff==='hard'?-10:0)+(S.staff.assistant?15:0)+(S.perks&&S.perks.workhorse?15:0)+((S.lvl||1)-1)*2-(S.health<50?(50-S.health)/2:0)-(S.stress>70?(S.stress-70)/2:0)-(S.flags&&S.flags.hangover?15:0)));
const skillAvg=()=>(S.sk.vocals+S.sk.stage+S.sk.guitar*.5+S.sk.writing*.3)/2.8;
const label=()=>S.label?LABELS[S.label.id]:LABELS.indie;
const family=id=>(FAMILY[S.char]||[]).includes(id)||!!(CHARS[id]&&CHARS[id].fam)||(R(id).tag||'').match(/Daughter|Father|Mother|Uncle|Niece|Sister|Son/);
const canRomance=id=>CHARS[id]&&CHARS[id].adult&&!CHARS[id].teen&&!family(id)&&id!=='marcus';
const dateOf=w=>{const d=new Date(2012,9,8);d.setDate(d.getDate()+w*7);return d};
const dateStr=w=>dateOf(w).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const monthOf=w=>dateOf(w).getMonth();
const yearOf=w=>dateOf(w).getFullYear();
const latestSong=()=>S.songs.filter(s=>s.st!=='written').slice(-1)[0]||S.songs.slice(-1)[0];
const charting=()=>S.songs.filter(s=>s.pts>0);
const npcFame=id=>clamp(((S&&S.npcF&&S.npcF[id])||0)+({rayna:82,juliette:92,luke:96,layla:58,will:55,sadie:72,deacon:45,scarlett:22,gunnar:22,avery:26,zoey:15}[id]||10),1,100);

// ---------- effects ----------
const FX={
 m:v=>{S.money+=v;if(v>0)S.stats.earned+=v},
 f:v=>{if(v>0)v/=1+S.fans/3e6;S.fans=Math.max(0,Math.round(S.fans+v))},
 fp:p=>{if(p>0)p/=1+S.fans/3e6;S.fans=Math.max(0,Math.round(S.fans*(1+p/100)))},
 rep:v=>S.rep=clamp(S.rep+v,0,100),
 cred:v=>S.cred=clamp(S.cred+v,0,100),
 heat:v=>S.heat=clamp(S.heat+v,0,100),
 hp:v=>S.health=clamp(S.health+v,0,100),
 st:v=>S.stress=clamp(S.stress+v,0,100),
 dep:(v,sub)=>{if(v>0){if(!S.add.sub)S.add.sub=sub||'alcohol';S.add.used=1;S.add.sober=0}S.add.dep=clamp(S.add.dep+v,0,100)},
 a:(id,v)=>{if(!has(id))return;const r=R(id);r.a=clamp(r.a+v,-100,100);r.met=1},
 ro:(id,v)=>{if(!has(id))return;const r=R(id);r.r=clamp(r.r+v,0,100);r.met=1},
 sk:(k,v)=>S.sk[k]=clamp(S.sk[k]+v,0,100),
 fl:(k,v=1)=>S.flags[k]=v,
};
const F=k=>S.flags[k];
function news(t,kind){S.news.unshift({t,wk:S.week,kind:kind||''});S.news.length=Math.min(S.news.length,80)}
function post(who,t,likes){const h=CHARS[who]?'@'+CHARS[who].n.replace(/[^A-Za-z]/g,''):who==='me'?'@'+S.handle:who;S.feed.unshift({who:CHARS[who]||who==='me'?who:null,h,t,likes:likes??Math.round((S.fans*.004+rnd(5,60))*rnd(.5,1.6)),wk:S.week});S.feed.length=Math.min(S.feed.length,80)}
function fanPost(t){post(pick(FAN_HANDLES),t,ri(2,400))}
function log(t,k){S.wlog.push({t,k:k||''})}
function snap(){const o={money:S.money,fans:S.fans,rep:S.rep,cred:S.cred,heat:S.heat,health:S.health,stress:S.stress,dep:S.add.dep,rel:{}};for(const k in S.rel)o.rel[k]=[S.rel[k].a,S.rel[k].r];return o}
function diffChips(o){const c=[];const add=(lab,d,good,fmt)=>{if(Math.round(d)===0)return;c.push(`<span class="chip ${good?(d>0?'pos':'neg'):(d>0?'neg':'pos')}">${lab} ${d>0?'+':''}${fmt?fmt(d):Math.round(d)}</span>`)};
 add('Money',S.money-o.money,1,money);add('Fans',S.fans-o.fans,1,num);add('Image',S.rep-o.rep,1);add('Cred',S.cred-o.cred,1);add('Scandal',S.heat-o.heat,0);add('Health',S.health-o.health,1);add('Stress',S.stress-o.stress,0);add('Craving',S.add.dep-o.dep,0);
 for(const k in S.rel){const p=o.rel[k]||[0,0];const da=S.rel[k].a-p[0],dr=S.rel[k].r-p[1];if(Math.round(da))c.push(`<span class="chip ${da>0?'pos':'neg'}">${esc(nm(k))} ${da>0?'+':''}${Math.round(da)}</span>`);if(Math.round(dr))c.push(`<span class="chip ${dr>0?'love':'neg'}">♥ ${esc(nm(k))} ${dr>0?'+':''}${Math.round(dr)}</span>`)}
 return c.join('')}

// ---------- new game ----------
function blankState(){return{v:1,week:0,char:null,name:'',handle:'',g:'f',look:{},genre:'Country',age:24,money:0,fans:0,rep:55,cred:40,heat:0,health:90,stress:20,sk:{vocals:50,writing:50,guitar:40,stage:40},
 add:{sub:null,dep:0,sober:0,used:0,rehabs:0,aa:0,od:0},traits:[],ap:4,label:null,staff:{},manager:null,house:'apt',rel:{},partner:null,married:0,
 songs:[],albums:[],nextId:1,chart:[],npcSongs:[],news:[],feed:[],wlog:[],lastLog:[],flags:{},seen:{},ach:{},awards:[],noms:[],tour:null,offers:[],
 stats:{gigs:0,ones:0,top10:0,earned:0,written:0,opry:0,bluebird:0,ryman:0,goodGigs:0,therapy:0,tours:0,peakFans:0},opryInvite:0,promo:0,weekYear:0,over:null,auth:70,secrets:[]}}
function newGame(cfg){
 S=blankState();
 if(cfg.legend){const L=LEGENDS[cfg.legend],st=L.start,C=CHARS[cfg.legend];S.char=cfg.legend;S.name=C.n;S.g=C.look.g;S.look=Object.assign({},C.look);S.genre=st.genre;S.age=st.age;S.fans=st.fans;S.money=st.money;S.rep=st.rep;S.cred=st.cred;
  S.sk={vocals:st.vocals,writing:st.writing,guitar:st.guitar,stage:st.stage};S.traits=(st.traits||[]).slice();if(st.addict)Object.assign(S.add,st.addict);
  if(st.label)S.label={id:st.label,royalty:LABELS[st.label].royalty,push:LABELS[st.label].push,recoup:0,owed:1,wk:0};if(st.manager){S.manager=st.manager;S.staff.manager=1}if(st.house)S.house=st.house;
  for(const k in L.rel){const[a,r,tag]=L.rel[k];S.rel[k]={a,r,tag,met:1}}if(L.partner){S.partner=L.partner;S.married=L.married||0;S.rel[L.partner].dating=1;if(L.married)S.rel[L.partner].married=1}
  if(st.fans>500000){S.staff.publicist=1;S.staff.band=1;S.staff.assistant=1}
  if(cfg.legend==='rayna'){S.songs.push(mkSong({title:'Buried Under',q:88,prod:88,st:'single',rel:-40,peak:1}),mkSong({title:'Wrong Song',q:84,prod:84,st:'single',rel:-120,peak:3}))}
  if(cfg.legend==='juliette'){S.songs.push(mkSong({title:'Boys and Buses',q:70,prod:92,st:'single',rel:-10,peak:2}),mkSong({title:'Undermine',q:78,prod:80,st:'written'}))}
  if(cfg.legend==='deacon')S.songs.push(mkSong({title:'Back Before the Fire',q:80,st:'written'}));
  if(cfg.legend==='scarlett')S.songs.push(mkSong({title:'If I Didn\'t Know Better',q:78,st:'written',co:'gunnar'}));
  if(cfg.legend==='gunnar')S.songs.push(mkSong({title:'Long Way from Tulsa',q:68,st:'written'}));
  // active single on chart for stars
  S.songs.forEach(s=>{if(s.st==='single'&&s.rel>-20){s.base=95;s.w=9;s.pts=95*Math.pow(.86,3);s.peak=s.peak||2}});
 }else{S.char='me';S.name=cfg.name||'Ruby Hale';S.g=cfg.g;S.look=cfg.look;S.genre=cfg.genre;S.age=cfg.age||22;const B=BACKGROUNDS.find(b=>b.id===cfg.bg)||BACKGROUNDS[0];
  S.money=B.fx.money||500;S.fans=B.fx.fans||20;S.sk={vocals:55+(B.fx.vocals||0),writing:52+(B.fx.writing||0),guitar:45+(B.fx.guitar||0),stage:40+(B.fx.stage||0)};S.cred=40+(B.fx.cred||0);S.rep=55+(B.fx.rep||0);S.house=S.money>10000?'apt':'couch';S.bg=B.id;
  if(B.rel)for(const k in B.rel){const[a,r,tag]=B.rel[k];S.rel[k]={a,r,tag,met:1}}}
 S.handle=S.name.replace(/[^A-Za-z]/g,'');
 for(const k in CHARS)if(has(k))R(k);
 S.npcSongs=[];for(let i=0;i<26;i++)npcRelease(true);
 S.ap=apMax();S.stats.peakFans=S.fans;
 news(cfg.legend?LEGENDS[cfg.legend].hook:`A new face in Music City: ${S.name} just arrived with a guitar and a dream.`,'big');
 post('me',cfg.legend?'Big week ahead. Thank you for sticking with me, y\'all.':'Just got to Nashville. Wish me luck.');
 seedFeed();
 UI.tab='home';save();render();
 setTimeout(()=>{storyCheck(true);runQueue()},300);
}
function seedFeed(){const n=['juliette','luke','rayna','layla'].filter(has);n.forEach(id=>post(id,pick(['Tour rehearsals all week. Nashville, you ready?','New music coming. That\'s all I can say.','Grateful for every single one of you.','Sunset on the bus. Never gets old.'])))}
function mkSong(o){return Object.assign({id:S.nextId++,title:genTitle(),theme:'love',q:50,prod:0,co:null,st:'written',rel:null,w:0,base:0,pts:0,peak:0,income:0,wk:S.week,duet:null,mv:0},o)}
function genTitle(){const r=Math.random();if(r<.4)return pick(T_A)+' '+pick(T_N);if(r<.75)return pick(T_P).replace('{X}',pick(T_X));return pick(T_N)+(Math.random()<.5?' in the '+pick(T_N):' and '+pick(T_N))}
const fq=s=>s.prod?Math.round(s.q*.62+s.prod*.38):s.q;
const stars=q=>{const n=clamp(Math.round(q/20),1,5);return '★'.repeat(n)+'☆'.repeat(5-n)};

// ---------- charts ----------
function npcRelease(init){const[artist,id,pop]=pick(NPC_ART.filter(a=>!a[1]||has(a[1])));const base=pop*rnd(.55,1.25);const w=init?ri(1,16):1;S.npcSongs.push({artist,id,title:genTitle(),base,w,pts:curve(base,w)})}
function curve(b,w){return w<=6?b*(.25+.125*w):b*Math.pow(.86,w-6)}
function updateChart(){
 S.npcSongs.forEach(s=>{s.w++;s.pts=curve(s.base,s.w)});S.npcSongs=S.npcSongs.filter(s=>s.pts>5&&s.w<32);
 const n=ri(1,3);for(let i=0;i<n;i++)npcRelease();while(S.npcSongs.length<26)npcRelease();
 const all=S.npcSongs.map(s=>({t:s.title,a:s.artist,id:s.id,pts:s.pts,me:0,w:s.w}));
 charting().forEach(s=>all.push({t:s.title,a:S.name+(s.duet?' & '+nm(s.duet):''),id:'me',pts:s.pts,me:1,w:s.w,sid:s.id}));
 all.sort((a,b)=>b.pts-a.pts);
 const prev={};(S.chart||[]).forEach((c,i)=>prev[c.t]=i+1);
 S.chart=all.slice(0,40).map((c,i)=>Object.assign(c,{last:prev[c.t]||0}));
 S.chart.forEach((c,i)=>{if(!c.me)return;const s=S.songs.find(x=>x.id===c.sid);if(!s)return;const pos=i+1;const old=s.peak||99;if(!s.peak||pos<s.peak)s.peak=pos;s.pos=pos;
  if(pos===1&&old!==1){S.stats.ones++;log(`"${s.title}" is the #1 song in country music!`,'big');news(`${S.name} hits #1 with "${s.title}"`,'big');sfx('big');ach('first1');if(S.stats.ones>=5)ach('five1');post('me','NUMBER ONE. I can\'t stop crying. Thank you!!');fanPost(`"${s.title}" at #1 is the best thing to happen this year`)}
  else if(pos<=10&&old>10){S.stats.top10++;log(`"${s.title}" cracked the Top 10 at #${pos}.`,'good');ach('top10')}});
 S.songs.forEach(s=>{if(s.pts>0&&!S.chart.find(c=>c.sid===s.id))s.pos=0});
}

// ---------- AP & actions ----------
function useAP(n=1){if(S.over)return false;if(S.ap<n){toast('No actions left this week. Press Next week.');return false}S.ap-=n;return true}
function act(fn){return(...a)=>{if(UI.busy)return;fn(...a);save();render();runQueue()}}

// write a song (mini-game)
function startWrite(co){if(S.ap<1)return toast('No actions left this week.');
 const st={co,theme:null,title:null,lines:[],score:0,round:0};
 const hint=S.sk.writing>=65||(co&&(CHARS[co].writer));
 function step(){
  if(!st.theme){modal(`<div class="mh">${co?`<div class="mpt">${pt(co,'happy')}</div>`:''}<div><h2>${co?'Writing with '+esc(fullnm(co)):'Songwriting session'}</h2><p class="muted">What's this one about?</p></div></div>
   <div class="grid3">${Object.entries(THEMES).map(([k,t])=>`<button class="opt" data-t="${k}">${t.n}</button>`).join('')}</div>
   <div class="mfoot"><button class="ghost" data-x>Cancel</button><button class="ghost" data-quick>Quick write (skip mini-game)</button></div>`,{onClick:(e)=>{const b=e.target.closest('[data-t]');if(b){st.theme=b.dataset.t;step()}if(e.target.closest('[data-x]'))closeModal();if(e.target.closest('[data-quick]')){st.theme=pick(Object.keys(THEMES));st.title=genTitle();st.score=ri(10,26);finish()}}});return}
  if(!st.title){const opts=[genTitle(),genTitle(),genTitle()];modal(`<h2>Pick a title</h2><p class="muted">${THEMES[st.theme].n}. Which title grabs you?</p><div class="stack tight">${opts.map(o=>`<button class="opt big" data-o="${esc(o)}">"${esc(o)}"</button>`).join('')}</div><div class="mfoot"><button class="ghost" data-re>Something else</button></div>`,{onClick:e=>{const b=e.target.closest('[data-o]');if(b){st.title=b.dataset.o;step()}if(e.target.closest('[data-re]'))step()}});return}
  if(st.round<3){const pool=shuffle(THEMES[st.theme].lines.filter(l=>!st.lines.includes(l))).slice(0,3);const vals=shuffle([12,6,2]);const best=vals.indexOf(12);
   modal(`<h2>"${esc(st.title)}"</h2><p class="muted">${['Find the opening line','Build the verse','Land the hook'][st.round]}${hint?' <span class="spot">✦ marks your gut feeling</span>':''}</p>
   <div class="lyr">${st.lines.map(l=>`<p>${esc(l)}</p>`).join('')}</div>
   <div class="stack tight">${pool.map((l,i)=>`<button class="opt lyric" data-i="${i}">${hint&&i===best&&chance(.85)?'✦ ':''}${esc(l)}</button>`).join('')}</div>`,{onClick:e=>{const b=e.target.closest('[data-i]');if(!b)return;const i=+b.dataset.i;st.lines.push(pool[i]);st.score+=vals[i];st.round++;sfx('tap');step()}});return}
  finish()}
 function finish(){if(!useAP(1)){closeModal();return}
  const o=snap();let q=S.sk.writing*.55+rnd(0,22)+st.score*.55;if(co){const c=CHARS[co];q+=(c.writer?9:4)+R(co).a/20;FX.a(co,ri(4,8))}
  if(S.stress>65&&['heartbreak','whiskey','redemption'].includes(st.theme))q+=6;if(S.add.dep>50)q-=5;
  q=Math.round(clamp(q,8,99));const s=mkSong({title:st.title,theme:st.theme,q,co,lines:st.lines});S.songs.push(s);S.stats.written++;
  if(chance(.35))FX.sk('writing',1);FX.st(-3);ach('writer');if(S.stats.written>=25)ach('prolific');
  log(`Wrote "${s.title}"${co?' with '+nm(co):''}. ${stars(q)}`,'good');playTune(s.title,2);
  modal(`<h2>"${esc(s.title)}"</h2><p class="stars">${stars(q)}</p><div class="lyr">${(st.lines.length?st.lines:['(written fast, rough around the edges)']).map(l=>`<p>${esc(l)}</p>`).join('')}</div><p class="muted">${q>=85?'This could be a career song.':q>=70?'A strong song. Radio might bite.':q>=50?'Decent. It needs a great production.':'Not your best. Some songs are just practice.'}</p><div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>Nice</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]')){closeModal();save();render();runQueue()}}})}
 step()}

const PRODUCERS=[
 {id:'self',n:'Produce it yourself',cost:0,p:[25,55],d:'Free. Rough but honest.'},
 {id:'session',n:'Session players at a Music Row studio',cost:3000,p:[50,72],d:'The A-team pickers. Solid and radio-ready.'},
 {id:'label',n:'Label house producer',cost:0,p:[62,80],d:'Polished for radio. Critics shrug.',req:()=>S.label&&S.label.id!=='own'&&S.label.id!=='indie',cred:-2},
 {id:'liam',n:'Liam McGuinnis',cost:15000,p:[66,90],d:'Raw, moody and brilliant. Critics love it.',who:'liam',cred:3},
 {id:'watty',n:'Watty White',cost:35000,p:[78,96],d:'A legend\'s touch. Only takes artists he believes in.',who:'watty',req:()=>R('watty').a>=20||fame()>=50,cred:2}
];
function startRecord(sid){const s=S.songs.find(x=>x.id===sid);if(!s)return;
 modal(`<h2>Record "${esc(s.title)}"</h2><p class="muted">Song quality ${stars(s.q)}. Who produces it?</p><div class="stack tight">${PRODUCERS.map(p=>{const ok=(!p.req||p.req())&&S.money>=p.cost&&(!p.who||has(p.who));return`<button class="opt row-opt" data-p="${p.id}" ${ok?'':'disabled'}>${p.who?`<span class="mini-pt">${pt(p.who)}</span>`:''}<span><b>${p.n}</b><small>${p.d}${p.cost?' · '+money(p.cost):''}${!ok&&p.req&&!p.req()?' · Not available':''}</small></span></button>`}).join('')}</div><div class="mfoot"><button class="ghost" data-x>Cancel</button></div>`,
 {onClick:e=>{if(e.target.closest('[data-x]'))return closeModal();const b=e.target.closest('[data-p]');if(!b||b.disabled)return;const p=PRODUCERS.find(x=>x.id===b.dataset.p);if(!useAP(1))return closeModal();const o=snap();FX.m(-p.cost);s.prod=Math.round(rnd(p.p[0],p.p[1])+(S.sk.vocals-60)/6);s.prod=clamp(s.prod,10,99);s.producer=p.id;s.st='recorded';if(p.cred)FX.cred(p.cred);if(p.who)FX.a(p.who,4);if(S.add.dep>60&&chance(.3)){s.prod-=12;log('You showed up to the session wrecked. The takes were sloppy.','bad');FX.heat(4)}
  log(`Recorded "${s.title}" with ${p.n.replace('Produce it yourself','yourself producing')}. Final ${stars(fq(s))}`,'good');playTune(s.title,3);
  modal(`<h2>"${esc(s.title)}" is in the can</h2><p class="stars">${stars(fq(s))}</p><p class="muted">Production ${s.prod}/100. ${fq(s)>=80?'The room went quiet on the playback. Everybody knew.':fq(s)>=60?'It sounds like a record. A real one.':'It\'s… fine. Maybe it\'s an album cut.'}</p><div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>Back to the studio</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]')){closeModal();save();render();runQueue()}}})}})}

function startRelease(sid){const s=S.songs.find(x=>x.id===sid);if(!s)return;const L=label();const paid=S.label&&!['own','indie'].includes(S.label.id);
 const promos=[[0,'No radio promotion',1],[5000,'Indie radio plugger',1.2],[25000,'Regional radio tour',1.38],[100000,'National radio campaign',1.6]];
 const mvs=[[0,'No video',0],[8000,'Lyric video',1],[40000,'Proper music video',2],[180000,'Big-budget cinematic video',3]];
 let pr=paid?1:0,mv=paid?2:0;
 const body=()=>`<h2>Release "${esc(s.title)}" as a single</h2><p class="muted">${esc(L.n)} · ${stars(fq(s))}${s.duet?' · Duet with '+esc(nm(s.duet)):''}</p>
 <h3>Radio push ${paid?'<span class="tag">Label pays</span>':''}</h3><div class="stack tight">${promos.map((p,i)=>`<button class="opt ${pr===i?'on':''}" data-pr="${i}" ${!paid&&S.money<p[0]?'disabled':''}>${p[1]} <small>${paid?'':money(p[0])}</small></button>`).join('')}</div>
 <h3>Music video ${paid?'<span class="tag">Label pays up to $40K</span>':''}</h3><div class="stack tight">${mvs.map((p,i)=>`<button class="opt ${mv===i?'on':''}" data-mv="${i}">${p[1]} <small>${money(paid?Math.max(0,p[0]-40000):p[0])}</small></button>`).join('')}</div>
 <div class="mfoot"><button class="ghost" data-x>Cancel</button><button class="primary" data-go>Send it to radio</button></div>`;
 modal(body(),{onClick:e=>{const t=e.target;if(t.closest('[data-x]'))return closeModal();const a=t.closest('[data-pr]');if(a&&!a.disabled){pr=+a.dataset.pr;$('#mbody').innerHTML=body()}const b=t.closest('[data-mv]');if(b){mv=+b.dataset.mv;$('#mbody').innerHTML=body()}
  if(t.closest('[data-go]')){const cost=(paid?0:promos[pr][0])+(paid?Math.max(0,mvs[mv][0]-40000):mvs[mv][0]);if(S.money<cost)return toast('Not enough money.');if(!useAP(1))return closeModal();const o=snap();FX.m(-cost);
   let push=(S.label?S.label.push:L.push)*promos[pr][1]*(1+S.promo*.06)*(typeof labelMult==='function'?labelMult():1);if(s.duet)push*=1+npcFame(s.duet)/140;if(S.heat>60)push*=.85;if(S.char==='rayna'&&!F('h65')&&S.label&&S.label.id==='edgehill'&&F('jeffcold'))push*=.8;
   const q=fq(s);s.base=Math.pow(q/100,2)*125*(.33+.67*fame()/100)*push*(.8+S.rep/250)*rnd(.85,1.15);s.w=0;s.pts=0.1;s.st='single';s.rel=S.week;s.mv=mvs[mv][2];
   if(s.mv){s.mvViews=Math.round((S.fans*.4+5000)*s.mv*rnd(.5,1.5)*(q/70));FX.f(s.mvViews*.004)}
   ach('release');news(`${S.name} releases new single "${s.title}"`);post('me',`"${s.title}" is out now. Request it at your local station!`);fanPost(q>=75?`"${s.title}" by ${S.name} is on repeat. Chills.`:`New ${S.name} single is… okay I guess`);
   log(`Released "${s.title}" to country radio.`,'good');playTune(s.title,2);closeModal();save();render();runQueue();toast(`"${s.title}" is going to radio.`)}}})}

function startAlbum(){const pool=S.songs.filter(s=>['recorded','single'].includes(s.st)&&!s.album);if(pool.length<4)return toast('You need at least 4 recorded songs not already on an album.');
 const sel=new Set(pool.slice(0,12).map(s=>s.id));let title=pick(['','The ','']) +pick(T_A)+' '+pick(T_N);
 const body=()=>`<h2>Make an album</h2><p class="muted">Pick 4 to 12 songs. Singles already out help sales.</p><label class="field">Title<input id="altitle" value="" placeholder="Type your own title, e.g. ${esc(title)}" maxlength="40"></label><div class="stack tight">${pool.map(s=>`<button class="opt ${sel.has(s.id)?'on':''}" data-s="${s.id}">${sel.has(s.id)?'✓ ':''}${esc(s.title)} <small>${stars(fq(s))}${s.st==='single'?' · single':''}</small></button>`).join('')}</div><div class="mfoot"><button class="ghost" data-x>Cancel</button><button class="primary" data-go>Release album (${sel.size} songs)</button></div>`;
 modal(body(),{onClick:e=>{const t=e.target;if(t.closest('[data-x]'))return closeModal();const ti=$('#altitle');if(ti)title=ti.value.trim()||title;const b=t.closest('[data-s]');if(b){const id=+b.dataset.s;sel.has(id)?sel.delete(id):sel.size<12&&sel.add(id);$('#mbody').innerHTML=body()}
  if(t.closest('[data-go]')){if(sel.size<4)return toast('Pick at least 4 songs.');if(!useAP(1))return closeModal();const songs=pool.filter(s=>sel.has(s.id));const q=songs.reduce((a,s)=>a+fq(s),0)/songs.length;const singles=songs.filter(s=>s.st==='single').reduce((a,s)=>a+(s.base||0),0);
   const push=S.label?S.label.push:.55;let units=(S.fans*.05+singles*700)*Math.pow(q/72,2)*push*(.8+S.cred/250)*rnd(.8,1.2)*(S.heat>50?1.1:1)*(S.flags.comeback?1.3:1);S.flags.comeback=0;
   const al={id:S.nextId++,title,songs:songs.map(s=>s.id),q:Math.round(q),wk1:Math.round(units),units:0,cur:Math.round(units),rel:S.week,cert:'',review:clamp(Math.round(q*.6+S.cred*.4+rnd(-8,8)),10,100)};al.pos=Math.max(1,Math.round(200*Math.pow(Math.max(1,units)/1000,-.7)));
   songs.forEach(s=>s.album=al.id);S.albums.push(al);if(S.label)S.label.owed=Math.max(0,(S.label.owed||0)-1);
   const rv=al.review>=85?'a rave five-star review':al.review>=70?'a glowing four-star review':al.review>=55?'a mixed review':'a brutal review';
   news(`${S.name}'s album "${title}" debuts at #${al.pos} on the Top Country Albums chart`,'big');news(`Twang Monthly gives "${title}" ${rv}`);log(`Released the album "${title}". It debuted at #${al.pos} with ${num(units)} units.`,'big');ach('album');if(al.pos===1)ach('album1');
   FX.cred(Math.round((al.review-60)/8));FX.f(units*.4);post('me',`"${title}" is OUT. Every word is true.`);playTune(title,4);closeModal();save();render();runQueue()}}})}

// ---------- performing ----------
function venueOK(v){if(v.opry)return S.opryInvite>0;return fame()>=v.fame}
function startGig(vid,opt){const v=VENUES.find(x=>x.id===vid);if(!v)return;if(S.tour)return toast('You\'re on tour.');
 if(!venueOK(v))return toast(v.opry?'The Opry is by invitation only.':'You aren\'t big enough to fill this room yet.');
 const fresh=S.ap>=1;if(!fresh)return toast('No actions left this week.');
 const song=S.songs.filter(s=>s.st!=='written').sort((a,b)=>fq(b)-fq(a))[0]||S.songs.sort((a,b)=>b.q-a.q)[0];
 const drunk=S.add.dep>55||(S.flags.drunkTonight);
 modal(`<div class="mh"><div class="mpt">${pt('me','happy')}</div><div><h2>${esc(v.n)}</h2><p class="muted">${esc(v.desc)}</p></div></div>
 ${drunk?'<p class="warn">You\'re not exactly sober. The notes will swim.</p>':''}${S.traits.includes('stagefright')?'<p class="warn">Your hands are shaking. Stage fright will rattle the first few seconds.</p>':''}
 <div class="stack tight"><button class="primary big" data-live>🎤 Play it live (rhythm game)</button><button class="opt" data-auto>Quick set (simulate it)</button></div><div class="mfoot"><button class="ghost" data-x>Cancel</button></div>`,
 {onClick:e=>{if(e.target.closest('[data-x]'))return closeModal();if(e.target.closest('[data-live]')){if(!useAP(1))return;closeModal();UI.busy=true;rhythmGame({title:song?song.title:'Cover set',venue:v.n,diff:clamp(.25+fame()/150+(v.cap>5000?.15:0),.2,.9),look:S.look,drunk,fright:S.traits.includes('stagefright'),onDone:(sc)=>{UI.busy=false;gigResult(v,sc<0?null:sc,song,opt)}})}
  if(e.target.closest('[data-auto]')){if(!useAP(1))return;closeModal();gigResult(v,null,song,opt)}}})}
function perfScore(mini){let base=skillAvg()*.75+rnd(-12,14)+(S.staff.band?7:0)-(S.health<40?10:0)-(S.stress>80?6:0);if(S.traits.includes('stagefright'))base-=14;if(S.add.dep>55)base-=10;
 return Math.round(clamp(mini==null?base:mini*.6+base*.4+4,0,100))}
function gigResult(v,mini,song,opt){const o=snap();const P=perfScore(mini);S.stats.gigs++;ach('firstgig');let txt='';const mgr=S.staff.manager?1.12:1;
 if(v.id==='busk'){const tips=Math.round((8+P*.6)*(1+fame()/40)*rnd(.6,1.4));FX.m(tips);FX.f(2+P/8+fame()/3);txt=`You played for the tourists on Lower Broadway. ${tips>60?'A bachelorette party showered you with bills.':'A few dollars and a lot of walking past.'} Tips: ${money(tips)}.`}
 else if(v.id==='honky'){const tips=Math.round(v.flat+P*1.6*rnd(.7,1.4));FX.m(tips);FX.f(5+P/4);FX.sk('stage',chance(.5)?1:0);FX.hp(-1);txt=`Four hours of covers and a couple of originals. ${P>70?'You had the whole bar singing.':'Your fingers ache.'} You made ${money(tips)}.`}
 else if(v.bluebird){S.stats.bluebird++;FX.m(v.flat);FX.f(4+P/5);if(P>=70)FX.cred(2);txt=P>=75?'The Bluebird went silent. Then the room stood up. A few people at the back were scribbling notes.':P>=55?'A warm round. A songwriter you admire nodded at you.':'You rushed the bridge. The room was polite.';if(P>=62&&chance(.38))queueBluebird();ach('bluebird')}
 else if(v.opry){S.stats.opry++;S.opryInvite=Math.max(0,S.opryInvite-1);FX.m(v.flat);FX.f(1500*(P/80)+S.fans*.004);FX.cred(4);FX.rep(3);txt=P>=70?'You stood in the circle of wood from the old Ryman stage and sang. The applause rolled on and on.':'Your voice cracked on the second song, but the Opry crowd loves a story.';news(`${S.name} makes ${S.stats.opry===1?'an Opry debut':'another Opry appearance'}`);ach('opry');if(S.stats.opry>=3&&fame()>=60&&S.cred>=60&&!F('opryMember'))queueEvent('opry_member')}
 else{const fill=clamp((S.fans*.015*mgr)/v.cap,.04,1);const sold=Math.round(v.cap*fill);const gross=sold*v.price;let net=Math.round(gross*.6-v.cap*1.2-(S.staff.band?1500:300));if(S.staff.manager)net=Math.round(net*.85);FX.m(net);FX.f(sold*.12*(P/70));FX.rep((P-60)/8);if(v.prestige){FX.cred(2);S.stats.ryman++;ach('ryman')}if(v.id==='arena')ach('arena');if(v.id==='stadium')ach('stadium');
  txt=`${num(sold)} tickets sold (${Math.round(fill*100)}% full). ${P>=80?'A triumphant show. Reviewers called it the gig of the year.':P>=60?'A good, solid night.':'It never quite caught fire.'} You took home ${money(net)} after costs${S.staff.manager?' and your manager\'s 15%':''}.`;if(fill<.35){FX.rep(-3);txt+=' The empty seats were in every photo.'}}
 if(P>=65)S.stats.goodGigs++;FX.st(v.cap>2000?4:1);
 if(S.traits.includes('stagefright')&&S.stats.goodGigs>=8){S.traits=S.traits.filter(t=>t!=='stagefright');queueEvent('fright_gone')}
 if(S.flags.drunkTonight||S.add.dep>55){if(chance(.3)){FX.heat(14);FX.rep(-5);news(`${S.name} appears drunk on stage, slurs lyrics`,'bad');txt+=' Someone filmed you slurring the second verse. It\'s already online.'}}
 S.flags.drunkTonight=0;
 const rev=P>=85?'"A star is born." – Music Row Insider':P>=70?'"Warm, confident and real."':P>=50?'"Promising, if uneven."':'"Not ready for this stage."';
 log(`Played ${v.n}. Performance ${P}/100.`,P>=65?'good':P<45?'bad':'');crowd(2,.12);if(P>=70)sfx('good');
 modal(`<div class="mh"><div class="mpt">${pt('me',P>=60?'happy':'sad')}</div><div><h2>${esc(v.n)}</h2><p class="stars">${mini!=null?'Your playing '+mini+'/100 · ':''}Show ${P}/100</p></div></div><p>${txt}</p><p class="quote">${rev}</p><div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>Back to the bus</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]')){closeModal();save();render();runQueue()}}});
 save();render()}
function startTour(tid,custom){const t=custom||TOURS.find(x=>x.id===tid);if(S.tour)return;if(!custom&&fame()<t.fame)return toast('Not famous enough for this tour yet.');if(!custom&&S.money<t.cost)return toast('You need '+money(t.cost)+' up front for the crew and deposits.');
 confirmBox(`Start the ${t.n}?`,`${t.weeks} weeks on the road. ${custom?custom.desc:`Costs ${money(t.cost)} up front and ${money(t.cost)} a week.`} You get 2 actions a week while touring, and the road wears you down.`,()=>{if(!custom)FX.m(-t.cost);S.tour={n:t.n,id:t.id,left:t.weeks,weeks:t.weeks,cap:t.cap||0,price:t.price||0,cost:custom?0:t.cost,flat:t.flat||0,head:t.head||null,gross:0,net:0,fans:0};S.ap=Math.min(S.ap,apMax());S.stats.tours++;ach('tour');news(`${S.name} announces the ${t.n}`);post('me',`Tour dates are UP. See y'all out there.`);log(`Started the ${t.n}.`,'big');save();render()})}
function tourWeek(){const T=S.tour;if(!T)return;let net,fansG,P=perfScore(null);
 if(T.flat){net=T.flat;fansG=T.fansPer*(P/70)}else{const fill=clamp(S.fans*.015*(S.staff.manager?1.12:1)/T.cap,.08,1),shows=3;const gross=T.cap*fill*T.price*shows;net=Math.round(gross*.4-T.cost);if(S.staff.manager)net=Math.round(net*.85);T.gross+=gross;fansG=T.cap*fill*shows*.09*(P/70);T.fill=fill}
 FX.m(net);FX.f(fansG);T.net+=net;T.fans+=fansG;FX.st(5);FX.hp(-3);FX.rep((P-62)/12);T.left--;
 log(`${T.n}: week ${T.weeks-T.left} of ${T.weeks}. ${net>=0?'Made':'Lost'} ${money(Math.abs(net))}, +${num(fansG)} fans.`,net>=0?'good':'bad');
 if(T.left<=0){news(`${S.name} wraps the ${T.n}${T.gross?', grossing '+money(T.gross):''}`,'big');log(`Tour over! ${money(T.net)} net, ${num(T.fans)} new fans.`,'big');if(T.head)FX.a(T.head,8);S.tour=null;FX.st(-10)}}

// ---------- promo / social ----------
function doPromo(kind){if(!useAP(1))return;const o=snap();let t='';const f=fame();
 if(kind==='radio'){S.promo++;FX.f(80+S.fans*.004);FX.st(4);t='Six cities, twelve stations, a thousand handshakes with program directors. Your next single gets a radio boost.';charting().forEach(s=>s.base*=1.05)}
 if(kind==='tv'){if(f<35)return toast('Talk shows aren\'t calling yet. Get to Rising star first.');const g=perfScore(null);FX.f(S.fans*.02+2000);FX.rep(g>60?4:-2);t=g>60?'You charmed the host and played your single live. The clip is everywhere.':'You blanked on a question about your love life. Awkward.'}
 if(kind==='mag'){if(f<25)return toast('No magazine wants you on the cover yet.');FX.f(S.fans*.012+800);FX.rep(3);FX.m(f>60?5000:0);t='A glossy cover shoot. The photographer kept saying "give me heartbreak."'}
 if(kind==='fanfest'){FX.f(500+S.fans*.01);FX.st(6);FX.rep(4);FX.hp(-2);t='You signed autographs for six hours in the heat. A girl cried telling you your song got her through chemo.'}
 if(kind==='charity'){if(S.money<20000)return toast('A benefit costs about $20K to put on.');FX.m(-20000);FX.rep(8);FX.heat(-12);FX.cred(2);t='You headlined a benefit for flood relief. The Mayor shook your hand.'}
 log(t);result('Promo',t,o)}
function doPost(tone){if(!useAP(1))return;const o=snap();let t='',likes;
 const lines={heart:['Some songs heal you while you write them. This next one did.','Thank you for every message. I read them all, even at 3am.'],funny:['Me: I\'ll go to bed early. Also me at 2am: writing a song about a goat.','Tour bus wifi has the emotional stability of a country ballad.'],promo:[`Go stream "${(latestSong()||{title:'my new song'}).title}". Do it for me. Do it for America.`,'Tickets on sale Friday. Don\'t make me sing to an empty room.'],bts:['Studio snack table is 90% beef jerky. Making magic anyway.','Wrote three songs today and deleted two. That\'s the job.'],shade:RIVAL_LINES};
 const msg=pick(lines[tone]);post('me',msg);
 if(tone==='heart'){FX.f(60+S.fans*.004);FX.rep(2);t='The post got thousands of heartfelt replies.'}
 if(tone==='funny'){FX.f(90+S.fans*.007*rnd(.5,2));t='People thought it was hilarious. A late-night host retweeted it.'}
 if(tone==='promo'){charting().forEach(s=>s.base*=1.03);FX.f(40+S.fans*.002);t='Your fans pushed the single. Streams jumped.'}
 if(tone==='bts'){FX.f(70+S.fans*.004);FX.cred(1);t='Fans loved the peek behind the curtain.'}
 if(tone==='shade'){const rv=pick(['juliette','layla','rayna','sadie','luke'].filter(has));FX.f(200+S.fans*.012);FX.heat(10);FX.a(rv,-12);FX.rep(-2);t=`Everyone knew it was about ${nm(rv)}. The internet loved the drama. ${nm(rv)} did not.`;setTimeout(()=>post(rv,pick(['Bless your heart.','Some people need attention more than they need talent.','I\'m too busy selling out arenas to read this.'])),0);news(`Is ${S.name} throwing shade at ${fullnm(rv)}?`,'bad')}
 log('Posted on social media.');result('Social media',`<p class="post-preview"><b>@${esc(S.handle)}</b> ${esc(msg)}</p>${t}`,o)}

// ---------- life ----------
function doLife(kind){const o=snap();let t='';
 const costs={vacation:12000,therapy:300,vcoach:800,gym:0,rest:0,aa:0,party:150,drink:40,rehab:30000};
 if(kind==='rehab'){return confirmBox('Check into rehab?','Four weeks at a treatment center outside town. Costs $30K (your label covers it if you have one). The press will find out. But you\'ll come out with a real shot at staying clean.',()=>{const paid=S.label&&S.label.id!=='indie';if(!paid&&S.money<30000)return toast('You can\'t afford it. Try AA meetings.');if(!paid)FX.m(-30000);S.add.rehabs++;for(let i=0;i<4;i++){S.add.used=0;endWeek(true)}S.add.dep=Math.max(8,Math.round(S.add.dep*.25));S.add.sober=4;FX.st(-40);FX.hp(30);FX.heat(-15);FX.rep(4);S.flags.comeback=1;news(`${S.name} completes rehab: "I'm ready to tell the truth"`,'big');ach('rehab');log('Finished four weeks of rehab. Clear-eyed and terrified.','big');save();render();result('Rehab','You came out with a sobriety chip, a therapist\'s number and a notebook full of the most honest songs you\'ve ever written. Your next album gets a comeback boost.',o)})}
 if(kind==='vacation'){if(S.money<costs.vacation)return toast('A trip costs $12K.');if(S.ap<apMax())return toast('A vacation takes a whole week: use it at the start of a week.');S.ap=0;FX.m(-costs.vacation);FX.st(-45);FX.hp(15);if(S.partner)FX.ro(S.partner,10);t=`A week on a beach in Mexico${S.partner?' with '+nm(S.partner):''}. Your phone stayed off. Mostly.`;log(t,'good');return result('Vacation',t,o)}
 if(!useAP(1))return;
 if(kind==='rest'){FX.st(-18);FX.hp(8);t='You slept twelve hours and watched old Opry videos in your pajamas.'}
 if(kind==='gym'){FX.hp(6);FX.st(-8);FX.sk('stage',chance(.4)?1:0);t='A long run along the Cumberland. Your lungs thank you on stage.'}
 if(kind==='therapy'){if(S.money<costs.therapy)return toast('Not enough money.');FX.m(-costs.therapy);FX.st(-20);S.stats.therapy++;FX.dep(-3);t='You talked about your father for fifty minutes and cried in the car after. Good crying.';if(S.traits.includes('stagefright')&&S.stats.therapy>=4){S.traits=S.traits.filter(x=>x!=='stagefright');queueEvent('fright_gone')}}
 if(kind==='vcoach'){if(S.money<costs.vcoach)return toast('Not enough money.');FX.m(-costs.vcoach);FX.sk('vocals',ri(1,3));t='Scales, breathing and a coach who says "again" a lot.'}
 if(kind==='guitar'){FX.sk('guitar',ri(1,2));FX.st(-4);t='Hours of fingerpicking on the back porch.'}
 if(kind==='aa'){S.add.aa++;FX.dep(-6);FX.st(-10);S.add.used=0;t=pick(['A church basement, bad coffee and the bravest people you know.','You said your name out loud and the room said it back.','A trucker named Earl shared about his daughter. You couldn\'t stop shaking.']);if(has('deacon')&&!S.flags.sponsor&&S.add.aa>=2&&R('deacon').a>=10){S.flags.sponsor='deacon';t+=' Afterwards Deacon Claybourne found you in the parking lot and offered to be your sponsor.';FX.a('deacon',10)}ach('aa')}
 if(kind==='party'){if(S.money<costs.party)return toast('Not enough money.');FX.m(-costs.party);FX.st(-16);FX.dep(S.add.sub==='pills'?3:7,S.add.sub||'alcohol');const who=pick(Object.keys(CHARS).filter(k=>has(k)&&CHARS[k].adult));FX.a(who,5);R(who).met=1;
  t=`A party at a songwriter\'s house in Berry Hill. You ended up talking to ${fullnm(who)} until 3am.`;if(chance(.18+S.add.dep/250)){FX.heat(12);FX.rep(-4);t+=' Someone posted a video of you dancing on a table.';news(`${S.name} parties hard on Lower Broadway`,'bad')}if(chance(.15))queueEvent('party_hookup')}
 if(kind==='drink'){FX.st(-22);FX.dep(S.add.sub==='pills'?8:7,S.add.sub||'alcohol');FX.hp(-3);S.flags.drunkTonight=1;t=S.add.sub==='pills'?'The pills smooth everything over. For a while.':'One drink. Then the bottle. The edges go soft.';if(S.add.sober>20)t+=` You threw away ${S.add.sober} weeks of sobriety.`;if(S.flags.sponsor)FX.a(S.flags.sponsor,-5)}
 log(t);result(kind==='aa'?'AA meeting':'Life',t,o)}

function hire(id){const st=STAFF.find(s=>s.id===id);if(S.staff[id]){S.staff[id]=0;if(id==='manager')S.manager=null;log(`You let your ${st.n.toLowerCase()} go.`);save();render();return}
 if(id==='manager'){const opts=['glenn','bucky'].filter(has);if(fame()<15)return toast('No real manager will take you on yet. Get to 3K fans.');modal(`<h2>Hire a manager</h2><div class="stack tight">${opts.map(m=>`<button class="opt row-opt" data-m="${m}"><span class="mini-pt">${pt(m)}</span><span><b>${fullnm(m)}</b><small>${esc(CHARS[m].bio)}</small></span></button>`).join('')}</div><div class="mfoot"><button class="ghost" data-x>Cancel</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]'))return closeModal();const b=e.target.closest('[data-m]');if(b){S.staff.manager=1;S.manager=b.dataset.m;FX.a(b.dataset.m,10);R(b.dataset.m).tag='Manager';log(`${fullnm(b.dataset.m)} is your new manager.`,'good');closeModal();save();render()}}});return}
 if(S.money<st.wk*4)return toast('You need at least 4 weeks of wages in the bank.');S.staff[id]=1;log(`Hired a ${st.n.toLowerCase()}.`,'good');save();render()}
function moveHouse(id){const h=HOUSES.find(x=>x.id===id);if(h.cost&&S.money<h.cost)return toast('You can\'t afford it.');confirmBox(`Move to ${h.n}?`,h.cost?`Buy it for ${money(h.cost)}. Upkeep ${money(h.upkeep)} a week.`:`Rent ${money(h.rent)} a week.`,()=>{FX.m(-h.cost);S.house=id;log(`Moved into ${h.n}.`,'good');if(id==='mansion')ach('mansion');save();render()})}

// ---------- people ----------
function personActions(id){const r=R(id),c=CHARS[id],acts=[];const met=r.met;
 if(!met){acts.push(['intro','Introduce yourself']);return acts}
 acts.push(['hang','Hang out']);
 if(c.writer||c.singer)acts.push(['write','Write a song together']);
 if(c.singer&&r.a>=25&&npcFame(id)>0)acts.push(['duet','Record a duet']);
 acts.push(['advice','Ask for advice']);
 if(canRomance(id)&&!r.dating&&!r.married)acts.push(['flirt','Flirt']);
 if(canRomance(id)&&!r.dating&&!r.married&&r.r>=30&&S.partner!==id)acts.push(['askout','Ask them out']);
 if(r.dating||r.married)acts.push(['date','Date night ($300)']);
 if(r.dating&&!r.married&&r.r>=75&&(S.week-(r.since||0))>=10)acts.push(['propose','Propose 💍']);
 if(r.dating||r.married)acts.push(['breakup',r.married?'Ask for a divorce':'Break up']);
 if(r.a<0)acts.push(['peace','Try to make peace']);
 acts.push(['confront','Confront them']);
 if(c.singer&&npcFame(id)>fame()+8&&r.a>=30&&!S.tour)acts.push(['open','Ask to open on their tour']);
 return acts}
function personAct(id,k){const r=R(id),c=CHARS[id];if(k==='write'){closeModal();return startWrite(id)}if(!useAP(1))return;const o=snap();let t='',mood='neutral';
 const star=npcFame(id)>fame()+30;
 if(k==='intro'){if(star&&chance(.6)){t=`${c.short} gave you a polite smile and a "good luck, sugar" and was swept away by an assistant.`;FX.a(id,2)}else{t=`You introduced yourself to ${c.n}. ${pick(['They were warmer than you expected.','You talked about old records for an hour.','They remembered your name.'])}`;FX.a(id,8);mood='happy'}r.met=1}
 if(k==='hang'){const g=ri(4,10)+(r.a>40?2:0);FX.a(id,g);FX.st(-6);t=pick([`Coffee with ${c.short} at a diner on 8th Avenue.`,`A long drive out past Leiper's Fork with ${c.short}.`,`Beers on ${c.short}'s porch, watching the fireflies.`,`${c.short} took you to their favourite hole-in-the-wall barbecue joint.`]);mood='happy';if(S.add.dep>40&&chance(.3)){t+=` ${c.short} noticed your hands shaking. "You okay?"`;}}
 if(k==='advice'){const tips=['"Write what scares you. Everything else is just rhyming."','"Never sign anything the same day they hand it to you."','"Radio loves you until it doesn\'t. Make records you can live with."','"The Opry isn\'t a stage. It\'s a family. Act like it."','"Get a lawyer before you get a Cadillac."','"Sing to one person in the back row. Not the whole room."'];t=`${c.short}: ${pick(tips)}`;FX.a(id,3);FX.sk(pick(['writing','stage','vocals']),1)}
 if(k==='flirt'){if(r.a<5&&chance(.6)){FX.a(id,-4);t=`${c.short} laughed awkwardly and changed the subject.`;mood='sad'}else{FX.ro(id,ri(5,12));FX.a(id,2);t=`A lingering look across the bar. ${c.short} didn't look away.`;mood='happy'}cheatCheck(id)}
 if(k==='askout'){if(r.r>=30&&r.a>=15){r.dating=1;r.since=S.week;if(S.partner&&S.partner!==id){cheatCheck(id,true)}else S.partner=id;t=`${c.short} said yes. Your first date was at a little Italian place in Germantown.`;news(`${S.name} spotted on a date with ${c.n}`);mood='happy';ach('love')}else{FX.a(id,-5);t=`${c.short} let you down gently.`;mood='sad'}}
 if(k==='date'){if(S.money<300)return toast('Not enough money.');FX.m(-300);FX.ro(id,ri(5,10));FX.a(id,4);FX.st(-12);t=pick(['Dinner, then dancing at a honky-tonk until closing.','A picnic at Radnor Lake.','Slow-dancing in the kitchen to an old record.']);mood='happy'}
 if(k==='propose'){if(chance(.8+r.r/500)){r.married=1;S.partner=id;S.married=1;t=`You got down on one knee at the Bluebird. ${c.short} said yes before you finished the question.`;news(`${S.name} and ${c.n} are engaged!`,'big');FX.f(S.fans*.03);FX.rep(5);mood='happy';ach('married');queueEvent('wedding')}else{FX.ro(id,-15);t=`${c.short} said they weren't ready. The ring went back in your pocket.`;mood='sad'}}
 if(k==='breakup'){const wasM=r.married;r.dating=0;r.married=0;r.ex=1;if(S.partner===id){S.partner=null;S.married=0}FX.a(id,-30);FX.ro(id,-40);FX.st(12);t=wasM?`The divorce papers were signed in a lawyer's office in Green Hills. ${c.short} wouldn't look at you.`:`You ended it with ${c.short}. It hurt more than you expected.`;news(`${S.name} and ${c.n} ${wasM?'divorcing':'split'}`,'bad');mood='sad';if(wasM)FX.m(-Math.max(0,S.money*.3))}
 if(k==='peace'){if(chance(.5+(r.a+50)/200)){FX.a(id,ri(10,20));t=`You and ${c.short} buried the hatchet over whiskey${S.add.dep>0?' (you had a soda)':''}.`;mood='happy'}else{FX.a(id,-3);t=`${c.short} wasn't ready to hear it.`;mood='angry'}}
 if(k==='confront'){FX.a(id,-ri(8,16));FX.st(-4);FX.heat(c.singer&&npcFame(id)>40?8:2);t=`You told ${c.short} exactly what you thought of them. It felt good for about ten minutes.`;mood='angry';if(c.singer&&npcFame(id)>40){news(`Feud alert: ${S.name} and ${c.n} in shouting match`,'bad');FX.f(S.fans*.01)}}
 if(k==='duet'){const pool=S.songs.filter(s=>s.st==='written'||s.st==='recorded');if(!pool.length){S.ap+=(UI.lastCost||1);return toast('Write a song first, then ask.')}const s=pool.sort((a,b)=>b.q-a.q)[0];if(chance(.55+r.a/200)){s.duet=id;s.prod=Math.max(s.prod||0,ri(65,88));s.st='recorded';FX.a(id,6);t=`${c.short} loved "${s.title}". You cut it as a duet in one magical take. Release it as a single and their fans will come with it.`;mood='happy';news(`${S.name} and ${c.n} record a duet`)}else{t=`${c.short}: "It's not the right song for me, darlin'." Ouch.`;FX.a(id,-2);mood='sad'}}
 if(k==='open'){if(chance(.4+r.a/150)){S.ap=0;FX.a(id,5);t=`${c.short} said yes! You'll open on their arena tour starting now.`;mood='happy';const ft=npcFame(id);startOpener(id,ft)}else{t=`${c.short}'s people said the slot was already filled.`;mood='sad'}}
 log(t);modal(`<div class="mh"><div class="mpt">${pt(id,mood)}</div><div><h2>${esc(c.n)}</h2><p class="muted">${esc(c.role)}</p></div></div><p>${esc(t)}</p><div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>OK</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]')){closeModal();save();render();runQueue()}}});save();render()}
function startOpener(id,ft){S.tour={n:`Opening for ${fullnm(id)}`,id:'opener',left:8,weeks:8,flat:Math.round(2000+ft*250),fansPer:Math.round(Math.pow(10,ft/25)*.6+4000),head:id,gross:0,net:0,fans:0};S.ap=Math.min(S.ap,apMax());ach('tour');news(`${S.name} will open for ${fullnm(id)} on tour`,'big')}
function cheatCheck(id,serious){const p=S.partner;if(!p||p===id)return;const pr=R(p);if(chance(serious?.7:.25)){FX.a(p,serious?-35:-12);FX.ro(p,serious?-35:-10);FX.heat(serious?18:6);news(serious?`Cheating scandal! ${S.name} caught with ${fullnm(id)}`:`${S.name} seen getting cosy with ${fullnm(id)}`,'bad');log(`${nm(p)} found out about you and ${nm(id)}.`,'bad');if(serious)queueEvent('caught_cheating')}}

// ---------- weekly ----------
function nextWeek(){if(UI.busy||S.over)return;if(UI.queue.length)return runQueue();const before=snap();endWeek(false);S.lastLog=S.wlog;S.wlog=[];
 UI.tab='home';save();render();showWeekSummary(before);}
function endWeek(silent){
 S.week++;const L=label();S.add.usedThis=S.add.used;
 // costs
 const h=HOUSES.find(x=>x.id===S.house)||HOUSES[1];let cost=h.rent+(h.upkeep||0);STAFF.forEach(st=>{if(S.staff[st.id])cost+=st.wk});
 const lifestyle=fame()>88?15000:fame()>70?4000:fame()>50?800:0;if(S.fans>1e6)S.fans=Math.round(S.fans*.997);cost+=lifestyle;FX.m(-cost);
 // chart + royalties
 S.songs.forEach(s=>{if(s.st==='single'&&s.base>0&&s.pts>0||s.st==='single'&&s.w===0&&s.base>0){s.w++;s.pts=curve(s.base,s.w);if(s.pts<1||s.w>32){s.pts=0}}});
 updateChart();
 let roy=0;charting().forEach(s=>{const inc=s.pts*320;roy+=inc;s.income+=inc});
 const catalog=S.songs.filter(s=>s.st!=='written'&&s.rel!==null).length;roy+=catalog*S.fans*.0009;
 S.albums.forEach(a=>{if(a.cur>150){const u=a.cur;a.units+=u;roy+=u*9;a.cur=Math.round(a.cur*(a.units===u?.55:.78));const c=a.units>=2e6?'Multi-Platinum':a.units>=1e6?'Platinum':a.units>=5e5?'Gold':'';if(c&&c!==a.cert){a.cert=c;log(`"${a.title}" is certified ${c}!`,'big');news(`${S.name}'s "${a.title}" goes ${c}`,'big');ach(c==='Gold'?'gold':'plat')}}});
 let pay=roy*(S.label?S.label.royalty:LABELS.indie.royalty);
 if(S.label&&S.label.recoup>0){const r=Math.min(pay,S.label.recoup);S.label.recoup-=r;pay-=r;if(S.label.recoup<=0)log('You recouped your advance. Royalties now come to you.','good')}
 FX.m(Math.round(pay));
 // fans
 const sp=charting().reduce((a,s)=>a+s.pts,0);const repM=.6+S.rep/125;FX.f(sp*70*repM);
 const decay=S.char==='rayna'&&!F('h65')&&yearOf(S.week)<2014?.006:.0025;if(!sp&&!S.tour)FX.f(-S.fans*decay);
 if(S.flags.out)FX.f(S.fans*.002);
 // tour
 if(S.tour)tourWeek();
 // reputation & scandal
 if(S.heat>40)FX.rep(-(S.heat-40)/12);S.rep+= (55-S.rep)*.01;FX.heat(-(S.staff.publicist?7:3.5));
 if(S.heat>70)FX.f(-S.fans*.004);
 // wellbeing
 if(S.stress>75)FX.hp(-2);if(S.stress<40)FX.hp(1);if(S.health<30)FX.st(3);
 FX.st(S.tour?2:-3);if(S.traits.includes('secret')&&!S.flags.out)FX.st(2);
 const hh=HOUSES.find(x=>x.id===S.house);if(hh)FX.st(-hh.mood/2);
 if(S.staff.coach)FX.sk('vocals',chance(.5)?1:0);
 // addiction
 const A=S.add;if(A.dep>0){if(!A.used){A.sober++;FX.dep(-(A.dep>50?.6:1.4));if(A.dep>30){FX.st(A.dep/12);FX.hp(-A.dep/40)}
   if(A.dep>=35&&!silent&&chance(A.dep/170+S.stress/400-(S.flags.sponsor?.08:0)))queueEvent('craving');
   [[4,'thirty','30 days sober'],[13,'ninety','90 days sober'],[52,'year','One year sober']].forEach(([w,k,n])=>{if(A.sober===w&&A.dep<60){log(`${n}. You got a chip.`,'good');if(k==='year')ach('sober')}})}
  else{FX.hp(-A.dep/18);if(A.dep>70&&chance(.12))queueEvent('rockbottom')}}
 A.used=0;
 // relationships drift
 for(const k in S.rel){const r=S.rel[k];if((r.dating||r.married)&&chance(.5))r.r=clamp(r.r-1,0,100);if(r.dating&&r.r<15&&!silent){queueEvent('partner_leaves',{who:k})}}
 // label
 if(S.label){S.label.wk=(S.label.wk||0)+1;if(S.label.owed>0&&S.label.wk>60&&S.label.id==='edgehill'&&!F('dropWarn')){FX.fl('dropWarn');queueEvent('label_deadline')}}
 // money trouble
 if(S.money<0){S.flags.broke=(S.flags.broke||0)+1;if(S.flags.broke>=5&&!silent)queueEvent('bankrupt')}else S.flags.broke=0;
 if(S.health<=0&&!silent){queueEvent('collapse')}
 // calendar
 const m=monthOf(S.week),d=dateOf(S.week).getDate();
 if(m===10&&d<=7&&!silent)queueEvent('awards');
 if(m===1&&d>=8&&d<=14&&!silent)queueEvent('grammys');
 if(m===5&&d<=7&&!silent)queueEvent('fanfest');
 if(m===11&&d>=14&&d<=20&&!silent)queueEvent('christmas');
 if(m===0&&d<=7&&!silent)queueEvent('newyear');
 // opry invite
 if(!silent&&fame()>=45&&S.cred>=48&&!S.opryInvite&&chance(.06))queueEvent('opry_invite');
 S.stats.peakFans=Math.max(S.stats.peakFans,S.fans);
 if(S.fans>=1e6)ach('million');if(S.money>=1e6)ach('millionaire');if(fame()>=95)ach('legend');
 S.promo=Math.max(0,S.promo-.5);S.ap=apMax();S.age=S.age+(1/52);
 if(!silent){worldTick();storyCheck();randomEvents()}
 if(S.wlog.length===0)log('A quiet week.');
}
function showWeekSummary(o){const ch=S.chart.findIndex(c=>c.me);const items=S.lastLog;
 modal(`<div class="wk-head"><span class="eyebrow">${dateStr(S.week)}</span><h2>Week ${S.week}</h2></div><div class="wklog">${items.map(i=>`<p class="${i.k}">${esc(i.t)}</p>`).join('')}</div>${ch>=0?`<p class="muted small">Your best chart position this week: #${ch+1}</p>`:''}<div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>${UI.queue.length?'What happened next…':'Continue'}</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]')){closeModal();runQueue()}}})}

// ---------- event engine ----------
function queueEvent(id,ctx){if(UI.queue.find(q=>q.id===id))return;UI.queue.push({id,ctx:ctx||{}})}
function queueBluebird(){queueEvent(pick(['bb_watty','bb_label','bb_cowrite','bb_rayna']))}
function evList(){return EVENTS}
function storyCheck(){for(const e of EVENTS){if(!e.story||S.seen[e.id]!=null)continue;try{if(e.when(S)){queueEvent(e.id);S.seen[e.id]=S.week;break}}catch(err){}}}
function randomEvents(){const canon=S.story&&S.story.on;const n=S.tour?(chance(canon?.4:.7)?1:0):(chance(canon?.38:.62)?1:0)+(chance(canon?.05:.15)?1:0);for(let i=0;i<n;i++){const pool=EVENTS.filter(e=>!e.story&&!e.sys&&(!e.once||S.seen[e.id]==null)&&(S.seen[e.id]==null||S.week-S.seen[e.id]>(e.cool||(canon?30:20)))&&safeWhen(e)&&!UI.queue.find(q=>q.id===e.id));if(!pool.length)return;let tot=pool.reduce((a,e)=>a+(e.w||1),0),r=Math.random()*tot;for(const e of pool){r-=(e.w||1);if(r<=0){queueEvent(e.id);S.seen[e.id]=S.week;break}}}}
function safeWhen(e){try{return !e.when||e.when(S)}catch(err){return false}}
function runQueue(){if(UI.busy||$('#modal').classList.contains('open'))return;const q=UI.queue.shift();if(!q)return;const e=q.ev||EVENTS.find(x=>x.id===q.id);if(!e)return runQueue();if(e.when&&e.sys&&!safeWhen(e))return runQueue();S.seen[e.id]=S.week;showEvent(e,q.ctx)}
function fill(t,ctx){const s=latestSong();const who=ctx&&ctx.who?ctx.who:(S.flags.dw||S.flags.ow||'');return String(t).replace(/\{name\}/g,esc(S.name)).replace(/\{song\}/g,esc(s?s.title:'your new song')).replace(/\{partner\}/g,esc(S.partner?nm(S.partner):'your partner')).replace(/\{label\}/g,label().n).replace(/\{who\}/g,who?esc(nm(who)):'').replace(/\{rival\}/g,nm(rivalId()))}
function rivalId(){return['juliette','rayna','layla','sadie'].filter(has).sort((a,b)=>R(a).a-R(b).a)[0]||'layla'}
function showEvent(e,ctx){if(typeof e.title==='function')e=Object.assign({},e,{title:e.title(S,ctx)});const who=typeof e.who==='function'?e.who(S,ctx):e.who;const text=typeof e.text==='function'?e.text(S,ctx):e.text;const choices=(typeof e.ch==='function'?e.ch(S,ctx):e.ch).filter(c=>!c.req||c.req(S,ctx));
 const mood=e.mood||'neutral';
 modal(`<div class="ev ${e.kind||''}"><div class="ev-top">${who?`<div class="ev-pt">${pt(who,mood)}<span>${esc(who==='me'?S.name:fullnm(who))}</span></div>`:''}<div class="ev-txt"><span class="eyebrow">${esc(e.tag||(e.story?'Story':'This week'))}</span><h2>${esc(fill(e.title,ctx))}</h2><p>${fill(text,ctx)}</p></div></div>
 <div class="stack tight ev-ch">${choices.map((c,i)=>`<button class="opt choice" data-c="${i}"><span>${esc(fill(c.t,ctx))}</span>${c.h?`<small>${esc(c.h)}</small>`:''}</button>`).join('')}</div></div>`,{lock:1,onClick:ev=>{const b=ev.target.closest('[data-c]');if(!b)return;const c=choices[+b.dataset.c];const o=snap();let res='';try{res=c.f(S,ctx)||''}catch(err){console.error(err)}
  if(c.go)return;// choice opened its own UI
  sfx(S.money>=o.money&&S.rep>=o.rep?'good':'tap');
  modal(`<div class="ev"><div class="ev-top">${who?`<div class="ev-pt">${pt(who,c.mood||mood)}</div>`:''}<div class="ev-txt"><h2>${esc(fill(e.title,ctx))}</h2><p>${fill(res||'So be it.',ctx)}</p></div></div><div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>Continue</button></div></div>`,{lock:1,onClick:x=>{if(x.target.closest('[data-x]')){closeModal();save();render();if(S.over)return showEnding();runQueue()}}});save();render()}})}
function result(title,html,o){modal(`<h2>${esc(title)}</h2><p>${html}</p><div class="chips">${diffChips(o)}</div><div class="mfoot"><button class="primary" data-x>OK</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]')){closeModal();save();render();runQueue()}}});save();render()}

// ---------- achievements ----------
const ACH={firstgig:['First gig','Played your first show.'],writer:['Songwriter','Wrote your first song.'],prolific:['Prolific','Wrote 25 songs.'],release:['On the radio','Released a single.'],top10:['Top 10','Had a Top 10 single.'],first1:['Number one','Topped the country chart.'],five1:['Hitmaker','Five #1 singles.'],album:['Long player','Released an album.'],album1:['Album of the week','A #1 album.'],gold:['Gold','A Gold album.'],plat:['Platinum','A Platinum album.'],bluebird:['Listening room','Played the Bluebird.'],opry:['Opry debut','Played the Grand Ole Opry.'],member:['Opry member','Invited to join the Opry.'],ryman:['Mother Church','Played the Ryman.'],arena:['Arena','Played Bridgestone Arena.'],stadium:['Stadium','Played a stadium show.'],tour:['On the road','Went on tour.'],million:['A million fans','Reached 1M fans.'],millionaire:['Millionaire','Had $1M in the bank.'],mansion:['Belle Meade','Bought a mansion.'],love:['Falling','Started dating someone.'],married:['Hitched','Got engaged.'],award:['Award winner','Won an award.'],eoty:['Entertainer of the Year','The top prize.'],sober:['One year','A year sober.'],aa:['One day at a time','Went to an AA meeting.'],rehab:['Second chance','Finished rehab.'],survivor:['Scandal survivor','Lived through a major scandal.'],label:['Signed','Signed a record deal.'],ownlabel:['Mogul','Started your own label.'],out:['Living out loud','Told the world who you are.'],legend:['Legend','Reached 95 fame.'],hof:['Hall of Fame','Inducted into the Country Music Hall of Fame.']};
function ach(k){if(S.ach[k]||!ACH[k])return;S.ach[k]=S.week;toast('🏆 '+ACH[k][0]+': '+ACH[k][1]);sfx('big')}

// ---------- endings ----------
function legacy(){return Math.round(S.stats.ones*40+S.stats.top10*10+S.awards.filter(a=>a.won).length*35+fame()*3+S.albums.filter(a=>a.cert).length*20+(F('opryMember')?80:0)+Object.keys(S.ach).length*5+S.cred)}
function retire(){confirmBox('Hang up your hat?','Your career ends here and you\'ll see how history remembers you.',()=>{S.over='retire';save();showEnding()})}
function showEnding(){const L=legacy();const tier=L>=900?['Country Music Hall of Fame','They put your plaque in the rotunda next to the greats. Your songs are standards now, sung at weddings and funerals and Friday nights in every honky-tonk on Broadway.']:L>=500?['Country royalty','You had a career most people only dream of. The Opry still calls you on your birthday.']:L>=250?['A real career','You made records you were proud of and a living doing what you love. In this town, that\'s a miracle.']:L>=100?['Songwriter\'s songwriter','The fans may not remember your name, but the people in the room at the Bluebird do.']:['Back where you started','Nashville chews up a thousand dreamers a year. You gave it your best shot.'];
 const why={retire:'You chose to step away.',addiction:'Addiction ended your career before you could end it on your own terms.',broke:'The money ran out, and so did the town\'s patience.'}[S.over]||'';
 $('#app').innerHTML=`<div class="ending"><div class="end-pt">${pt('me',S.over==='retire'?'happy':'sad')}</div><span class="eyebrow">${esc(why)}</span><h1>${esc(tier[0])}</h1><p>${esc(tier[1])}</p>
 <div class="end-grid"><div><b>${num(S.stats.peakFans)}</b><span>peak fans</span></div><div><b>${S.stats.ones}</b><span>#1 singles</span></div><div><b>${S.awards.filter(a=>a.won).length}</b><span>awards</span></div><div><b>${S.albums.length}</b><span>albums</span></div><div><b>${money(S.stats.earned)}</b><span>earned</span></div><div><b>${L}</b><span>legacy</span></div></div>
 <div class="row center"><button class="primary" id="endnew">New career</button>${S.over!=='retire'?'':''}</div></div>`;
 $('#endnew').onclick=()=>{try{localStorage.removeItem(SAVE_KEY)}catch(e){}titleScreen()};}

// ---------- save ----------
function save(){if(!S)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const d=localStorage.getItem(SAVE_KEY);return d?JSON.parse(d):null}catch(e){return null}}

// ---------- modal / toast ----------
let MCB=null;
function modal(html,o){o=o||{};const m=$('#modal');$('#mbody').innerHTML=html;m.classList.add('open');m.dataset.lock=o.lock?1:'';MCB=o.onClick||null;$('#mbody').scrollTop=0}
function closeModal(){$('#modal').classList.remove('open');MCB=null}
function confirmBox(title,text,yes){modal(`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="mfoot"><button class="ghost" data-x>Cancel</button><button class="primary" data-y>Do it</button></div>`,{onClick:e=>{if(e.target.closest('[data-x]'))closeModal();if(e.target.closest('[data-y]')){closeModal();yes();runQueue()}}})}
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;$('#toasts').appendChild(d);setTimeout(()=>d.classList.add('out'),2600);setTimeout(()=>d.remove(),3100)}
