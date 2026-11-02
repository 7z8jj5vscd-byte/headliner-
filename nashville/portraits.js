// Illustrated character portraits, drawn as SVG from a small "look" description.
// look: {g:'f'|'m', skin, hair, style, eyes, lips, outfit, top, hat, beard(0-2), age(0-2), freckles, earrings, glasses, bg}
(function(){
function hx(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function shade(h,a){const c=hx(h).map(v=>Math.max(0,Math.min(255,Math.round(a<0?v*(1+a):v+(255-v)*a))));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')}
let uid=0;
const BACK={
  longwave:(c)=>`<path d="M58 92 C50 50 80 34 102 36 C128 36 154 54 146 96 C150 120 160 140 156 168 C150 186 132 180 128 170 C138 150 132 130 134 110 L66 110 C68 132 60 152 72 172 C66 184 46 186 42 166 C38 140 52 120 58 92Z" fill="${c}"/>`,
  longstraight:(c)=>`<path d="M60 90 C56 48 82 36 100 36 C120 36 146 48 140 90 L146 176 C130 182 118 176 132 160 L130 104 L70 104 L68 160 C82 176 70 182 54 176Z" fill="${c}"/>`,
  curly:(c)=>{let s='';const pts=[[62,70],[56,94],[58,120],[64,144],[76,162],[138,70],[144,94],[142,120],[136,144],[124,162],[72,52],[100,40],[128,52],[86,44],[114,44]];pts.forEach(([x,y],i)=>s+=`<circle cx="${x}" cy="${y}" r="${15+(i%3)*2}" fill="${c}"/>`);return s},
  bob:(c)=>`<path d="M60 92 C56 50 80 38 100 38 C122 38 146 50 140 92 L144 132 C136 140 124 138 126 126 L74 126 C76 138 64 140 56 132Z" fill="${c}"/>`,
  ponytail:(c)=>`<path d="M126 58 C150 60 158 90 150 130 C146 150 136 156 132 150 C142 120 138 90 124 72Z" fill="${c}"/>`,
  shaggy:(c)=>`<path d="M62 96 C56 54 80 40 102 40 C128 40 148 58 140 98 L140 126 C134 120 132 112 132 104 L68 104 C68 114 66 122 60 128Z" fill="${c}"/>`,
  messy:(c)=>`<path d="M58 96 C50 52 80 36 102 38 C130 38 152 56 144 100 C150 124 146 146 136 150 C134 130 132 118 132 108 L68 108 C68 120 66 134 62 150 C52 144 50 122 58 96Z" fill="${c}"/>`
};
const FRONT={
  longwave:(c,d)=>`<path d="M64 96 C60 58 84 44 104 46 C126 46 142 60 138 92 C130 70 112 60 96 62 C84 66 74 78 70 100Z" fill="${c}"/><path d="M96 50 C84 60 78 76 76 96" stroke="${d}" stroke-width="2" fill="none" opacity=".35"/><path d="M104 50 C124 56 136 70 138 90" stroke="${d}" stroke-width="2" fill="none" opacity=".3"/>`,
  longstraight:(c,d)=>`<path d="M64 98 C60 56 84 44 100 44 C118 44 140 56 136 98 C132 74 120 60 102 56 L100 52 L98 56 C80 60 68 74 64 98Z" fill="${c}"/><path d="M100 50 L100 62" stroke="${d}" stroke-width="1.5" opacity=".4"/>`,
  curly:(c,d)=>{let s='';[[74,64],[88,56],[102,54],[116,56],[128,64],[70,80],[132,80]].forEach(([x,y],i)=>s+=`<circle cx="${x}" cy="${y}" r="${10+(i%2)*2}" fill="${c}"/><path d="M${x-5} ${y} q5 -6 10 0" stroke="${d}" stroke-width="1.4" fill="none" opacity=".45"/>`);return s},
  bob:(c,d)=>`<path d="M64 100 C60 56 84 44 100 44 C120 44 142 56 136 100 C128 78 120 66 100 64 C84 66 72 78 64 100Z" fill="${c}"/><path d="M70 72 C86 64 112 62 132 70" stroke="${d}" stroke-width="2" fill="none" opacity=".3"/>`,
  ponytail:(c,d)=>`<path d="M66 92 C62 56 84 46 100 46 C118 46 140 56 134 92 C128 72 116 62 100 62 C84 62 72 72 66 92Z" fill="${c}"/><path d="M80 58 C92 54 110 54 122 60" stroke="${d}" stroke-width="2" fill="none" opacity=".35"/>`,
  short:(c,d)=>`<path d="M66 90 C60 56 84 44 104 46 C126 47 142 62 136 90 C132 76 126 68 112 66 C98 72 82 68 72 78Z" fill="${c}"/><path d="M78 60 C92 52 114 52 128 62" stroke="${d}" stroke-width="2" fill="none" opacity=".35"/>`,
  shaggy:(c,d)=>`<path d="M64 98 C58 58 84 44 104 46 C128 46 144 62 138 98 C134 82 128 72 118 70 C112 78 100 76 92 70 C84 76 74 80 70 96Z" fill="${c}"/><path d="M86 56 C94 62 104 66 118 66" stroke="${d}" stroke-width="2" fill="none" opacity=".35"/>`,
  messy:(c,d)=>`<path d="M62 100 C56 58 84 42 104 44 C130 46 146 62 138 100 C132 84 126 70 114 70 L108 62 L100 72 L92 64 L86 74 C78 78 70 86 66 100Z" fill="${c}"/>`,
  buzz:(c,d)=>`<path d="M68 82 C66 58 86 50 100 50 C116 50 136 58 132 82 C126 68 116 62 100 62 C84 62 74 68 68 82Z" fill="${c}" opacity=".9"/>`,
  slick:(c,d)=>`<path d="M66 86 C62 54 86 46 104 46 C126 46 140 58 136 86 C132 70 120 62 104 62 C90 62 76 68 70 86Z" fill="${c}"/><path d="M76 66 C92 56 116 54 132 66 M78 60 C94 52 116 50 130 58" stroke="${shade(c,.35)}" stroke-width="1.5" fill="none" opacity=".6"/>`,
  bald:(c,d)=>`<path d="M66 96 C64 84 66 80 70 78 L70 98Z M134 96 C136 84 134 80 130 78 L130 98Z" fill="${c}"/>`
};
function top(look,skin){
  const o=look.outfit||'#334',d=shade(o,-.3),l=shade(o,.18),t=look.top||'shirt';
  let s=`<path d="M24 200 C28 162 60 148 100 146 C140 148 172 162 176 200Z" fill="${o}"/>`;
  if(t==='vneck'||t==='blouse'||t==='dress')s+=`<path d="M82 146 L100 176 L118 146Z" fill="${skin}"/><path d="M80 146 L100 178 L120 146" stroke="${d}" stroke-width="2" fill="none"/>`;
  if(t==='dress')s+=`<path d="M70 150 C80 170 120 170 130 150" stroke="${l}" stroke-width="1.5" fill="none" opacity=".6"/>${Array.from({length:12},(_,i)=>`<circle cx="${40+i*11}" cy="${178+(i%3)*6}" r="1.3" fill="#fff" opacity=".55"/>`).join('')}`;
  if(t==='shirt')s+=`<path d="M86 146 L100 166 L114 146 L108 144 L100 156 L92 144Z" fill="${l}"/><path d="M100 166 L100 200" stroke="${d}" stroke-width="1.5"/><circle cx="100" cy="176" r="1.6" fill="${d}"/><circle cx="100" cy="190" r="1.6" fill="${d}"/>`;
  if(t==='flannel'){for(let i=0;i<7;i++)s+=`<path d="M${30+i*22} 160 L${26+i*22} 200" stroke="${d}" stroke-width="5" opacity=".45"/>`;s+=`<path d="M28 178 L172 178 M32 166 L168 166" stroke="${d}" stroke-width="4" opacity=".35"/><path d="M86 146 L100 166 L114 146 L108 144 L100 156 L92 144Z" fill="${l}"/>`}
  if(t==='tee'||t==='henley')s+=`<path d="M84 146 C88 156 112 156 116 146" stroke="${d}" stroke-width="3" fill="${skin}"/>${t==='henley'?`<path d="M100 154 L100 172" stroke="${d}" stroke-width="2"/><circle cx="100" cy="160" r="1.5" fill="${l}"/><circle cx="100" cy="167" r="1.5" fill="${l}"/>`:''}`;
  if(t==='jacket'||t==='leather'||t==='denim')s+=`<path d="M86 146 L100 182 L114 146Z" fill="${t==='denim'?'#e9e4d8':'#1a1a1a'}"/><path d="M84 146 L72 200 L90 200 L100 182Z M116 146 L128 200 L110 200 L100 182Z" fill="${d}"/><path d="M84 146 L94 170 L80 168Z M116 146 L106 170 L120 168Z" fill="${l}" opacity=".6"/>${t==='denim'?`<path d="M40 176 L70 176 M130 176 L160 176" stroke="#d9c38c" stroke-width="1.5" stroke-dasharray="3 3"/>`:''}`;
  if(t==='suit')s+=`<path d="M88 146 L100 186 L112 146Z" fill="#f2f2f2"/><path d="M97 152 L103 152 L105 184 L100 192 L95 184Z" fill="${look.tie||'#7a1f2b'}"/><path d="M86 146 L74 200 L92 200 L100 186Z M114 146 L126 200 L108 200 L100 186Z" fill="${d}"/>`;
  return s;
}
function hat(look){
  const c=look.hat,d=shade(c,-.3),l=shade(c,.2);
  return `<ellipse cx="100" cy="62" rx="70" ry="13" fill="${d}"/><path d="M30 60 C40 70 160 70 170 60 C168 54 150 52 140 56 L60 56 C50 52 32 54 30 60Z" fill="${c}"/><path d="M66 60 C64 34 76 22 88 24 C94 30 106 30 112 24 C124 22 136 34 134 60Z" fill="${c}"/><path d="M66 54 L134 54 L134 60 L66 60Z" fill="${look.band||d}"/><path d="M88 26 C94 34 106 34 112 26" stroke="${d}" stroke-width="2" fill="none"/><path d="M72 50 C76 36 84 30 90 30" stroke="${l}" stroke-width="2" fill="none" opacity=".5"/>`;
}
window.portrait=function(look,opt){
  opt=opt||{};const id='p'+(uid++);look=look||{};
  const skin=look.skin||'#f0c8a8',sd=shade(skin,-.14),sl=shade(skin,.12),hair=look.hair||'#5a3a22',hd=shade(hair,-.35),style=look.style||(look.g==='f'?'longwave':'short');
  const eyes=look.eyes||'#5a4030',f=look.g==='f',age=look.age||0,bg=look.bg||'#2a3350';
  const mood=opt.mood||'neutral';
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="pt" role="img" aria-label="${(opt.label||'portrait').replace(/"/g,'')}"><defs><radialGradient id="${id}b" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${shade(bg,.25)}"/><stop offset="1" stop-color="${shade(bg,-.45)}"/></radialGradient><radialGradient id="${id}f" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="${sl}"/><stop offset="1" stop-color="${skin}"/></radialGradient></defs>`;
  if(!opt.nobg)s+=`<rect width="200" height="200" fill="url(#${id}b)"/>`;
  if(BACK[style])s+=BACK[style](hd);
  s+=`<path d="M86 118 L86 150 C92 156 108 156 114 150 L114 118Z" fill="${sd}"/>`;
  s+=top(look,skin);
  if(look.necklace)s+=`<path d="M86 150 C92 166 108 166 114 150" stroke="#e8c66a" stroke-width="1.6" fill="none"/><circle cx="100" cy="164" r="2.6" fill="#e8c66a"/>`;
  // ears
  s+=`<ellipse cx="66" cy="100" rx="6" ry="10" fill="${sd}"/><ellipse cx="134" cy="100" rx="6" ry="10" fill="${sd}"/>`;
  if(look.earrings)s+=`<circle cx="66" cy="114" r="3" fill="#f3d27a"/><circle cx="134" cy="114" r="3" fill="#f3d27a"/>`;
  // head
  const jaw=f?'M66 92 C66 52 134 52 134 92 C134 120 120 138 100 140 C80 138 66 120 66 92Z':'M66 90 C66 52 134 52 134 90 C134 118 124 136 100 140 C76 136 66 118 66 90Z';
  s+=`<path d="${jaw}" fill="url(#${id}f)"/>`;
  s+=`<path d="M70 110 C76 130 90 138 100 139 C90 132 78 124 70 110Z" fill="${sd}" opacity=".35"/>`;
  if(look.beard)s+=`<path d="M68 98 C70 122 84 140 100 141 C116 140 130 122 132 98 C128 112 122 118 114 120 C108 116 92 116 86 120 C78 118 72 112 68 98Z" fill="${hair}" opacity="${look.beard===2?.88:.32}"/>`;
  if(look.beard===2)s+=`<path d="M88 122 C94 118 106 118 112 122 C106 124 94 124 88 122Z" fill="${hd}" opacity=".7"/>`;
  // blush
  s+=`<ellipse cx="80" cy="112" rx="8" ry="5" fill="#e06a6a" opacity="${f?.18:.08}"/><ellipse cx="120" cy="112" rx="8" ry="5" fill="#e06a6a" opacity="${f?.18:.08}"/>`;
  if(look.freckles)for(let i=0;i<9;i++)s+=`<circle cx="${80+(i%3)*5+(i>4?30:0)-(i>4?15:0)}" cy="${104+Math.floor(i/3)*3}" r=".9" fill="${shade(skin,-.35)}" opacity=".7"/>`;
  // eyes
  const ey=96, sq=mood==='happy'?.75:mood==='sad'?.9:1;
  [[84,-1],[116,1]].forEach(([x,side])=>{
    s+=`<ellipse cx="${x}" cy="${ey}" rx="8" ry="${5*sq}" fill="#fbf8f4"/><circle cx="${x}" cy="${ey+.5}" r="4.2" fill="${eyes}"/><circle cx="${x}" cy="${ey+.5}" r="2" fill="#141414"/><circle cx="${x+1.6}" cy="${ey-1.2}" r="1.2" fill="#fff"/>`;
    s+=`<path d="M${x-8.5} ${ey-.5} C${x-4} ${ey-6.5*sq} ${x+4} ${ey-6.5*sq} ${x+8.5} ${ey-.5}" stroke="#1d1410" stroke-width="${f?2.4:1.6}" fill="none" stroke-linecap="round"/>`;
    if(f)s+=`<path d="M${x+side*7} ${ey-2} l${side*3} -2" stroke="#1d1410" stroke-width="1.6" stroke-linecap="round"/>`;
    const by=mood==='angry'?ey-9:mood==='sad'?ey-12:ey-11;
    const tilt=mood==='angry'?side*-3:mood==='sad'?side*3:0;
    s+=`<path d="M${x-9} ${by+(side<0?-tilt:tilt)*.3+2} Q${x} ${by-3} ${x+9} ${by+(side<0?tilt:-tilt)*.3+2}" stroke="${look.brow||hd}" stroke-width="${f?2.4:3.2}" fill="none" stroke-linecap="round"/>`;
    if(age>=1)s+=`<path d="M${x+side*10} ${ey+2} l${side*3} 2 M${x+side*10} ${ey-1} l${side*3} -1" stroke="${sd}" stroke-width="1" opacity=".8"/>`;
  });
  if(look.glasses)s+=`<rect x="73" y="88" width="22" height="16" rx="5" fill="none" stroke="#222" stroke-width="2"/><rect x="105" y="88" width="22" height="16" rx="5" fill="none" stroke="#222" stroke-width="2"/><path d="M95 95 L105 95" stroke="#222" stroke-width="2"/>`;
  // nose
  s+=`<path d="M101 100 C103 108 104 112 100 115 C98 116 96 115 95 114" stroke="${sd}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if(age>=2)s+=`<path d="M86 114 C84 120 86 124 88 126 M114 114 C116 120 114 124 112 126" stroke="${sd}" stroke-width="1.2" fill="none"/>`;
  // mouth
  const lc=look.lips||(f?'#c25b62':shade(skin,-.28));
  if(mood==='happy')s+=`<path d="M88 124 C94 132 106 132 112 124 C106 127 94 127 88 124Z" fill="#fff" stroke="${lc}" stroke-width="2.4"/>`;
  else if(mood==='sad')s+=`<path d="M90 128 C96 124 104 124 110 128" stroke="${lc}" stroke-width="${f?3.4:2.4}" fill="none" stroke-linecap="round"/>`;
  else if(mood==='angry')s+=`<path d="M90 127 L110 126" stroke="${lc}" stroke-width="${f?3.4:2.4}" stroke-linecap="round"/>`;
  else s+=`<path d="M89 125 C95 129 105 129 111 125" stroke="${lc}" stroke-width="${f?3.6:2.4}" fill="none" stroke-linecap="round"/>${f?`<path d="M91 124 C96 122 104 122 109 124" stroke="${shade(lc,-.15)}" stroke-width="2" fill="none" stroke-linecap="round"/>`:''}`;
  // front hair
  if(FRONT[style])s+=FRONT[style](hair,hd);
  if(look.hat)s+=hat(look);
  if(opt.ring)s+=`<rect x="2" y="2" width="196" height="196" rx="14" fill="none" stroke="${opt.ring}" stroke-width="4"/>`;
  return s+'</svg>';
};
window.shadeColor=shade;
})();
