// Nashville: Make It or Fake It: inspired by the show, not a TV show. Every feature and every big moment stays, but
// the game no longer talks like television: chapters and weeks instead of seasons and episodes, highlights instead
// of "Previously on", inner thoughts instead of talking to camera, and no ratings, network, trailers or writers' room.

// ---------- words: TV language becomes real-life language everywhere it appears ----------
const REFRAME=[
 [/Season (\d+), Episode (\d+)/g,'Chapter $1, week $2'],[/Season (\d+) · Episode (\d+) of (\d+)/g,'Chapter $1 · Week $2 of $3'],[/\bS(\d)-E(\d+)\b/g,'Ch.$1 · Wk $2'],
 [/Previously on Nashville…?/g,'Highlights'],[/Next time on Nashville…?/g,'Coming up…'],[/\bNext time…/g,'Coming up…'],[/"Previously on Nashville" each week/g,'Weekly highlights'],
 [/End of Season (\d+)/g,'End of Chapter $1'],[/Season (\d+) finale/gi,'The end of chapter $1'],[/\bseason finale\b/gi,'end of the chapter'],[/Song of the season/g,'Song of the year'],
 [/\bSeason (\d+)\b/g,'Chapter $1'],[/\bseason (\d+)\b/g,'chapter $1'],[/Season goals/g,'Chapter goals'],[/\bTonight's episode\b/g,'This week'],
 [/To camera/g,'💭 Thinking to yourself'],[/The final episode/g,'The last chapter'],[/Director's cut/g,'Relive it'],[/\(playing themselves\)/g,''],[/No seasons or goals/g,'No chapters or goals'],[/Closing montage/g,'Soundtrack of the week']];
const reframeText=t=>{let s=t;for(const[a,b]of REFRAME)s=s.replace(a,b);return s};
function reframeNode(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);let n;while(n=w.nextNode()){const v=n.nodeValue;if(v&&/[Ss]eason \d|Episode|S\d-E\d|Previously on|Next time|To camera|final episode|Director's cut|Tonight's episode|playing themselves|No seasons|Closing montage|Song of the season|season finale/.test(v)){const r=reframeText(v);if(r!==v)n.nodeValue=r}}}
const RF_MO=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')reframeNode(m.target.parentNode);else m.addedNodes.forEach(x=>x.nodeType===3?reframeNode(x.parentNode):x.nodeType===1&&reframeNode(x))}});
window.addEventListener('load',()=>{RF_MO.observe(document.body,{childList:true,subtree:true,characterData:true});reframeNode(document.body)});
(function(){const _t=window.toast;if(_t)window.toast=function(m,...a){return _t(typeof m==='string'?reframeText(m):m,...a)}})();
(function(){const _n=window.news;if(_n)window.news=function(t,k){return _n(typeof t==='string'?reframeText(t):t,k)}})();
(function(){const _l=window.log;if(_l)window.log=function(t,k){return _l(typeof t==='string'?reframeText(t):t,k)}})();

// ---------- the story card: a chapter of your life, not an episode ----------
(function(){const _sc=window.storyCard;if(_sc)window.storyCard=function(){let h=_sc();return h.replace(/<h3>"[^"]*"<\/h3><p class="small muted">([^<]*)<\/p>/,'<h3>$1</h3>')}})();
// how to play: the mode-select description
(function(){const _cm=window.chooseMode;window.chooseMode=function(){_cm();const b=$('[data-mode="story"] small');if(b)b.textContent='Inspired by Nashville. The big moments from the show happen in your world, at the right time: Marshall Evans and Edgehill, the crash, Highway 65, Peggy, the Exes, the plane, Rayna\'s goodbye. Six chapters of your life from October 2012 to 2018, each with goals and highlights, with summer breaks you can skip. Your choices change who lives where, who loves whom and who signs with whom.'}})();

// ---------- TV-only features: removed or turned into real life ----------
// ratings box and the network cancellation
const RF_CSS=document.createElement('style');RF_CSS.textContent='.ratings,.ep-title,.coldopen{display:none!important}';document.head.appendChild(RF_CSS);
['w_abc'].forEach(id=>{const w=WORLD.find(x=>x.id===id);if(w)w.when=()=>false});
if(typeof renewalTick==='function')window.renewalTick=function(){};
// season trailers, opening titles and cold opens are gone
const RF_BLOCK=/^(titles|savecamp|netmove|cliff)/;
// the writers' room becomes your own priorities for the year; special episodes become special weeks
(function(){const fix=e=>{if(!e||!e.ev)return e;const ev=e.ev,id=String(e.id);if(/^wr\d/.test(id)){ev.tag='A new chapter';ev.title='What do you want this year to be about?';ev.text='A new year in Nashville. Where is your heart going to be?'}if(/^sp\d/.test(id)){const t=ev.title;ev.tag='A week like no other';if(/musical/i.test(t)){ev.title='The night everybody sang';ev.text='A party at a friend\'s house turns into a sing-along that lasts until sunrise. Everybody sings their feelings, even the ones who shouldn\'t.'}else if(/flashback/i.test(t)){ev.title='A box of old photos';ev.text='You find a shoebox of photos from five years ago: you, younger and broke and fearless.'}else{ev.title='A documentary crew for a week';ev.text='A documentary crew follows you everywhere this week: phone videos, backstage, the kitchen at 3 a.m.'}}if(/^sixmonths/.test(id))ev.tag='A new chapter';if(/^trailer/.test(id)){ev.tag='Coming this season';ev.title='What this season holds';ev.text='You can feel it. Big things are coming this season, and some of them are up to you.';if(ev.ch&&ev.ch[0])ev.ch[0].t='See what\'s coming';if(ev.ch&&ev.ch[1])ev.ch[1].t='Let it surprise you'}return e};const _ew=window.endWeek;window.endWeek=function(sl){_ew(sl);UI.queue=UI.queue.filter(q=>!RF_BLOCK.test(String(q.id))).map(fix)}})();
// confessionals become inner thoughts (the label is reworded above); achievements tied to TV meta are retired
delete ACH.titles;delete ACH.special;
// soundtrack albums become a yearly compilation
(function(){const _n=window.news;window.news=function(t,k){if(typeof t==='string')t=t.replace(/"The Music of Nashville: Season (\d+)"/,'"Music City Hits, Vol. $1"');return _n(t,k)}})();
// wiki line about story mode
(function(){const _wv=window.wikiView;if(_wv)window.wikiView=function(){return _wv().replace('The show\'s events happen when they happened on TV.','The big moments from the show happen in your world at the right time.')}})();
