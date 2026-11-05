// Nashville: Make It or Fake It: less scrolling. The This Week screen is split into four sub-tabs (Today, To do,
// City board, News), the To do list shows one group at a time, and on every other screen the main card stays open
// while the extra cards fold into tap-to-open sections that remember whether you left them open.

UI.homePane=UI.homePane||'now';UI.doSec=UI.doSec||0;UI.acc=UI.acc||{};
const HOME_PANES=[['now','☀️ Today'],['do','✅ To do'],['board','🗓 City board'],['news','📰 News']];
function homePanes(v){const kids=[...v.children].filter(el=>!el.classList.contains('sechead'));const hub=v.querySelector(':scope > h2.hub-h');if(!hub)return;let state='now';const panes={now:[],do:[],board:[],news:[]};
 kids.forEach(el=>{if(el===hub){state='do';el.classList.add('hp-x');return}if(state==='now'){panes.now.push(el);return}if(el.classList.contains('wk-sec')){panes.do.push(el);return}if(el.classList.contains('opps')||el.classList.contains('chal')){panes.board.push(el);return}panes.news.push(el)});
 const cur=panes[UI.homePane]&&panes[UI.homePane].length?UI.homePane:'now';
 for(const k in panes)panes[k].forEach(el=>el.classList.toggle('hp-hidden',k!==cur));
 const counts={do:panes.do.length,board:panes.board.length,news:panes.news.length};
 v.insertAdjacentHTML('afterbegin',`<div class="seg hpanes">${HOME_PANES.filter(([k])=>k==='now'||counts[k]).map(([k,n])=>`<button class="${cur===k?'on':''}" data-hpane="${k}">${n}</button>`).join('')}</div>`);
 if(cur==='now'){const cs=panes.now.filter(el=>el.matches('section.card'));foldCards(cs,new Set(cs.slice(0,2)),'home:now')}
 if(cur==='do'&&panes.do.length>1){const i=Math.min(UI.doSec,panes.do.length-1);panes.do.forEach((el,j)=>el.classList.toggle('hp-hidden',j!==i));const chips=panes.do.map((el,j)=>{const h=el.querySelector('h3');return`<button class="${j===i?'on':''}" data-dosec="${j}">${esc(h?h.textContent:'More')}</button>`}).join('');panes.do[0].insertAdjacentHTML('beforebegin',`<div class="chips-sel dosecs">${chips}</div>`)}}
function accordion(v){const tab=UI.tab;if(tab==='home'||tab==='more')return;const cards=[...v.querySelectorAll(':scope > section.card, :scope > details.card')];if(cards.length<3)return;
 const seg=v.querySelector(':scope > .seg');const after=seg?cards.filter(c=>seg.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING):cards.filter(c=>!c.classList.contains('web'));const keepSet=new Set(after.slice(0,2));
 foldCards(cards,keepSet,tab+':'+(UI.sub&&UI.sub[tab]||''))}
function foldCards(cards,keepSet,pfx){cards.forEach(card=>{if(keepSet.has(card)||card.tagName==='DETAILS'||card.classList.contains('acc'))return;const kids=[...card.children];let hi=kids.findIndex(el=>/^H[23]$/.test(el.tagName)||(el.classList.contains('between')&&el.querySelector('h2,h3')));if(hi<0||hi>2)return;const head=document.createElement('div');head.className='acc-h';kids.slice(0,hi+1).forEach(el=>head.appendChild(el));card.insertBefore(head,card.firstChild);if(card.children.length<2)return;
  const title=(head.querySelector('h2,h3')||{}).textContent||'';const key=pfx+':'+title;card.classList.add('acc');card.dataset.acc=key;if(!UI.acc[key])card.classList.add('closed')})}
(function(){const _r=window.render;window.render=function(){_r();try{if(!S||S.over)return;const v=$('#view');if(!v)return;if(UI.tab==='home')homePanes(v);else accordion(v)}catch(e){console.error(e)}}})();
document.addEventListener('click',e=>{if(e.target.closest('#modal'))return;const p=e.target.closest('[data-hpane]');if(p){UI.homePane=p.dataset.hpane;render();scrollTo(0,0);return}const d=e.target.closest('[data-dosec]');if(d){UI.doSec=+d.dataset.dosec;render();return}
 const h=e.target.closest('.card.acc > .acc-h');if(h&&!e.target.closest('button,a,input,select,textarea')){const card=h.parentElement;const open=card.classList.toggle('closed')===false;UI.acc[card.dataset.acc]=open;if(open)setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'nearest'}),30)}});
(function(){const _d=window.doWeekAction;window.doWeekAction=function(k){if(k==='board'){UI.homePane='board';render();return scrollTo(0,0)}return _d(k)}})();
// going back to This Week from elsewhere lands on Today
document.addEventListener('click',e=>{const t=e.target.closest('.tabs [data-tab="home"]');if(t&&UI.tab==='home'){UI.homePane='now';}},true);
