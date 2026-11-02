// Synthesized country band + the live performance rhythm game.
const AUD={ctx:null,master:null,on:true};
function actx(){if(!AUD.on)return null;try{if(!AUD.ctx){AUD.ctx=new (window.AudioContext||window.webkitAudioContext)();AUD.master=AUD.ctx.createGain();AUD.master.gain.value=.55;AUD.master.connect(AUD.ctx.destination)}if(AUD.ctx.state==='suspended')AUD.ctx.resume();return AUD.ctx}catch(e){return null}}
const NOTE=n=>440*Math.pow(2,(n-69)/12);
function pluck(t,midi,dur,vol,type){const c=actx();if(!c)return;const o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=type||'sawtooth';o2.type='triangle';o.frequency.value=NOTE(midi);o2.frequency.value=NOTE(midi)*1.003;f.type='lowpass';f.frequency.setValueAtTime(3200,t);f.frequency.exponentialRampToValueAtTime(500,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(f);o2.connect(f);f.connect(g);g.connect(AUD.master);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05)}
function drum(t,kind,vol){const c=actx();if(!c)return;if(kind==='kick'){const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(AUD.master);o.start(t);o.stop(t+.22);return}
 const len=kind==='snare'?.18:.05,b=c.createBuffer(1,c.sampleRate*len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=b;f.type=kind==='snare'?'bandpass':'highpass';f.frequency.value=kind==='snare'?1800:7000;g.gain.value=vol;s.connect(f);f.connect(g);g.connect(AUD.master);s.start(t)}
function crowd(dur,vol){const c=actx();if(!c)return;const t=c.currentTime,b=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=b;f.type='bandpass';f.frequency.value=1100;f.Q.value=.6;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.4);g.gain.linearRampToValueAtTime(0,t+dur);s.connect(f);f.connect(g);g.connect(AUD.master);s.start(t)}
// chord progressions in G: I V vi IV etc.
const PROGS=[[[55,59,62],[50,54,57],[52,55,59],[48,52,55]],[[55,59,62],[48,52,55],[50,54,57],[55,59,62]],[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],[[52,55,59],[48,52,55],[55,59,62],[50,54,57]]];
const PENTA=[67,69,71,74,76,79,81];
// short jingle for a song title (seeded so each song has its own tune)
function seedRand(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function playTune(seed,bars){const c=actx();if(!c)return;const r=seedRand(seed),pr=PROGS[Math.floor(r()*PROGS.length)],bpm=96+Math.floor(r()*40),b=60/bpm,t0=c.currentTime+.05;bars=bars||4;
 for(let i=0;i<bars;i++){const ch=pr[i%4],t=t0+i*4*b;ch.forEach((n,k)=>pluck(t+k*.03,n,b*1.8,.07));ch.forEach((n,k)=>pluck(t+2*b+k*.03,n,b*1.6,.05));pluck(t,ch[0]-12,b*.9,.12,'triangle');pluck(t+2*b,ch[0]-5,b*.9,.1,'triangle');drum(t,'kick',.5);drum(t+b,'snare',.18);drum(t+2*b,'kick',.4);drum(t+3*b,'snare',.18);
  for(let k=0;k<4;k++){if(r()<.7)pluck(t+k*b+(r()<.3?b/2:0),PENTA[Math.floor(r()*PENTA.length)],b*.9,.06,'square')}}}
function sfx(kind){const c=actx();if(!c)return;const t=c.currentTime;if(kind==='good'){pluck(t,72,.25,.08,'triangle');pluck(t+.08,79,.35,.08,'triangle')}else if(kind==='bad'){pluck(t,50,.4,.08,'sawtooth');pluck(t+.12,47,.5,.08,'sawtooth')}else if(kind==='tap')pluck(t,84,.08,.04,'triangle');else if(kind==='big'){[67,71,74,79].forEach((n,i)=>pluck(t+i*.09,n,.6,.08,'triangle'))}else if(kind==='cash'){pluck(t,88,.1,.05,'square');pluck(t+.07,93,.2,.05,'square')}}

// ---------------- RHYTHM GAME ----------------
// opts: {title, venue, bpm, diff(0-1), look, cap, drunk, fright, onDone(score0to100, stats)}
function rhythmGame(opts){
 const root=document.createElement('div');root.className='rg';
 root.innerHTML=`<canvas></canvas><div class="rg-hud"><div><b>${esc(opts.title)}</b><span>${esc(opts.venue)}</span></div><div class="rg-score">0</div></div><div class="rg-tip">Tap the lanes, or press <kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd>, when the notes hit the line</div><button class="rg-skip">Skip</button>`;
 document.body.appendChild(root);
 const cv=root.querySelector('canvas'),g=cv.getContext('2d'),scoreEl=root.querySelector('.rg-score');
 let W,H,dpr=Math.min(2,window.devicePixelRatio||1);
 function size(){W=root.clientWidth;H=root.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(dpr,0,0,dpr,0,0)}
 size();window.addEventListener('resize',size);
 const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(portrait(opts.look,{mood:'happy',nobg:1}));
 const r=seedRand(opts.title+opts.venue),bpm=opts.bpm||(100+Math.floor(r()*30)),beat=60/bpm,bars=10,pr=PROGS[Math.floor(r()*PROGS.length)];
 const lead=2.2; // seconds of travel
 const notes=[];const density=.35+opts.diff*.5;
 for(let i=4;i<bars*4;i++){if(r()<density+(i%4===0?.3:0)){notes.push({t:i*beat,l:Math.floor(r()*4),hit:0});if(opts.diff>.55&&r()<.25)notes.push({t:i*beat+beat/2,l:Math.floor(r()*4),hit:0})}}
 const total=notes.length;let combo=0,maxc=0,perf=0,good=0,miss=0,pts=0,fb=[],done=false;
 const c=actx();const t0=(c?c.currentTime:performance.now()/1000)+lead+.4;const now=()=>(c?c.currentTime:performance.now()/1000)-t0;
 if(c){for(let i=0;i<bars;i++){const ch=pr[i%4],t=t0+i*4*beat;for(let k=0;k<4;k++){drum(t+k*beat,k%2?'snare':'kick',k%2?.16:.45);drum(t+k*beat+beat/2,'hat',.05);pluck(t+k*beat,(k%2?ch[0]-5:ch[0])-12,beat*.9,.11,'triangle')}ch.forEach((n,k)=>{pluck(t+k*.025,n,beat*1.9,.05);pluck(t+2*beat+k*.025,n,beat*1.7,.04)})}crowd(1.5,.08)}
 const endT=bars*4*beat+.6;
 const laneX=l=>W*(.2+l*.2);const hitY=()=>H*.82;
 const colors=['#e8b04b','#e46a6a','#6ab0e4','#7ad48a'];
 function judge(l){const t=now();let best=null,bd=1;for(const n of notes){if(n.hit||n.l!==l)continue;const d=Math.abs(n.t-t);if(d<bd){bd=d;best=n}}
  if(best&&bd<.17){best.hit=1;let w=opts.drunk?.06:0;if(bd<.07-w){perf++;pts+=100+combo*4;fb.push({l,txt:'PERFECT',t:performance.now(),c:'#ffe28a'})}else{good++;pts+=60+combo*2;fb.push({l,txt:'GOOD',t:performance.now(),c:'#bfe7ff'})}combo++;maxc=Math.max(maxc,combo);pluck(c?c.currentTime:0,PENTA[(l*2+combo)%PENTA.length],.35,.07,'square')}
  else{combo=0;fb.push({l,txt:'',t:performance.now(),c:'#f66'})}
  press[l]=performance.now()}
 const press=[0,0,0,0];
 const keys={KeyD:0,KeyF:1,KeyJ:2,KeyK:3,ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3};
 function kd(e){if(e.code in keys){e.preventDefault();judge(keys[e.code])}}
 window.addEventListener('keydown',kd);
 cv.addEventListener('pointerdown',e=>{const rc=cv.getBoundingClientRect(),x=e.clientX-rc.left;const l=Math.max(0,Math.min(3,Math.floor((x/W-.1)/.2)));judge(l)});
 root.querySelector('.rg-skip').onclick=()=>finish(true);
 const crowdPts=Array.from({length:60},(_,i)=>({x:Math.random(),s:.6+Math.random()*.6,p:Math.random()*6}));
 function draw(){if(done)return;const t=now(),pn=performance.now();
  const shake=opts.fright&&t<6?(6-t)*1.6:0;g.save();g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0b0d1a');bg.addColorStop(1,'#1d1226');g.fillStyle=bg;g.fillRect(-10,-10,W+20,H+20);
  // light beams
  for(let i=0;i<5;i++){const a=Math.sin(pn/900+i)*.35;g.save();g.translate(W*(.1+i*.2),0);g.rotate(a);const lg=g.createLinearGradient(0,0,0,H*.9);lg.addColorStop(0,`hsla(${30+i*50},90%,70%,.32)`);lg.addColorStop(1,'hsla(0,0%,100%,0)');g.fillStyle=lg;g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.lineTo(70,H*.9);g.lineTo(-70,H*.9);g.fill();g.restore()}
  // performer
  if(img.complete){const s=Math.min(W*.42,H*.36),bob=Math.sin(t*Math.PI*2/beat/2)*3;g.globalAlpha=.9;g.drawImage(img,W/2-s/2,H*.06+bob,s,s);g.globalAlpha=1}
  // lanes
  for(let l=0;l<4;l++){const x=laneX(l);g.fillStyle=pn-press[l]<120?'rgba(255,255,255,.13)':'rgba(255,255,255,.04)';g.fillRect(x-W*.09,H*.42,W*.18,H*.5);}
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.beginPath();g.moveTo(W*.1,hitY());g.lineTo(W*.9,hitY());g.stroke();
  for(let l=0;l<4;l++){g.beginPath();g.arc(laneX(l),hitY(),Math.min(24,W*.05),0,7);g.strokeStyle=colors[l];g.lineWidth=pn-press[l]<120?5:2.5;g.stroke()}
  // notes
  for(const n of notes){if(n.hit)continue;const dt=n.t-t;if(dt<-.2){n.hit=-1;miss++;combo=0;continue}if(dt>lead)continue;let y=hitY()-dt/lead*(hitY()-H*.42);let x=laneX(n.l);if(opts.drunk)x+=Math.sin(t*3+n.t)*W*.03;const rr=Math.min(20,W*.042);g.beginPath();g.arc(x,y,rr,0,7);g.fillStyle=colors[n.l];g.shadowColor=colors[n.l];g.shadowBlur=14;g.fill();g.shadowBlur=0;g.beginPath();g.arc(x-rr*.3,y-rr*.3,rr*.3,0,7);g.fillStyle='rgba(255,255,255,.5)';g.fill()}
  // crowd
  g.fillStyle='#07070c';for(const p of crowdPts){const x=p.x*W,y=H-8-Math.abs(Math.sin(t*4+p.p))*6*(combo>8?1.6:1);g.beginPath();g.arc(x,y-26*p.s,10*p.s,0,7);g.fill();g.fillRect(x-12*p.s,y-18*p.s,24*p.s,30*p.s);if(combo>12&&p.p>4){g.fillRect(x+8*p.s,y-48*p.s,4,22*p.s)}}
  // feedback
  fb=fb.filter(f=>pn-f.t<500);for(const f of fb){if(!f.txt)continue;g.globalAlpha=1-(pn-f.t)/500;g.fillStyle=f.c;g.font='600 14px Inter,sans-serif';g.textAlign='center';g.fillText(f.txt,laneX(f.l),hitY()-34-(pn-f.t)/20);g.globalAlpha=1}
  if(combo>=5){g.fillStyle='#fff';g.font='600 16px Inter,sans-serif';g.textAlign='center';g.fillText(combo+' combo',W/2,H*.4)}
  if(t<0){g.fillStyle='#fff';g.font='600 40px "Playfair Display",serif';g.textAlign='center';g.fillText(Math.ceil(-t),W/2,H*.62)}
  g.restore();
  scoreEl.textContent=pts.toLocaleString();
  if(t>endT)return finish(false);
  requestAnimationFrame(draw)}
 requestAnimationFrame(draw);
 function finish(skipped){if(done)return;done=true;window.removeEventListener('keydown',kd);window.removeEventListener('resize',size);root.remove();
  const acc=total?(perf+good*.6)/total:0;let sc=Math.round(Math.min(100,acc*100+maxc/total*8));if(skipped)sc=-1;
  opts.onDone(sc,{perf,good,miss:total-perf-good,maxc,total})}
}
