// Nashville: Make It or Fake It: the 3D world. Walk Lower Broadway at night (neon, honky-tonks, the Ryman at the end
// of the street, people you know on the sidewalk), and livelier characters everywhere: they blink, their mouths
// move when they talk, they shift their weight and turn to face each other in scenes.

// ======================= 7: LIVELIER CHARACTERS =======================
(function(){const _cm=window.charModel;window.charModel=function(look,opt){const G=_cm(look,opt);try{G.userData.talk=opt&&opt.talk;G.userData.blinkT=2+Math.random()*3;G.userData.eyeY=null}catch(_){}return G}})();
(function(){const _ac=window.animChar;window.animChar=function(G,t){_ac(G,t);const u=G.userData,P=u.P;if(!P)return;
 // blink
 if(P.eyes&&P.eyes.length){if(u.eyeY==null)u.eyeY=P.eyes[0].scale.y;const ph=(t+u.ph*3)%u.blinkT;const shut=ph<.12;P.eyes.forEach(e=>{e.scale.y=shut?.12:(u.mood==='happy'?.9:1.3)})}
 // talking mouth
 if(u.talk&&P.mouths){const v=.55+Math.abs(Math.sin(t*11+u.ph))*.9;for(const k in P.mouths){const m=P.mouths[k];if(m.visible)m.scale.y=v}}
 // weight shifts and facing whoever is next to you
 if(!u.anim&&!u.walk&&!u.noTurn){G.rotation.z=Math.sin(t*.6+u.ph)*.015;if(G.position.x){const face=G.position.x<0?.35:-.35;G.rotation.y+=(face-G.rotation.y)*.02}}
 if(u.walk){const s=Math.sin(t*9);if(P.legs)P.legs.forEach((l,i)=>l.rotation.x=(i?-s:s)*.55);if(P.arms){P.arms[0].rotation.x=-s*.45;P.arms[1].rotation.x=s*.45}G.position.y=Math.abs(s)*.03}}})();

// ======================= 5: WALK LOWER BROADWAY =======================
const STREET=[['Tootsie\'s Orchid Lounge',-1,-8,'#b05ad8',()=>visitPlace('broadway')],['Robert\'s Western World',1,-14,'#ffb03a',()=>startGig('honky')],['Busk on the corner',-1,-20,'#9ad0a8',()=>startGig('busk')],['Hot chicken',1,-26,'#ff5a3a',()=>visitPlace('hattie')],['The Stage',-1,-32,'#5ab0ff',()=>visitPlace('broadway')],['The Ryman',0,-44,'#ffe3a0',()=>visitPlace('ryman')]];
function walkTown(){if(!t3ok||!t3ok())return toast('3D isn\'t available on this device.');if($('.town'))return;closeModal&&closeModal();
 const root=document.createElement('div');root.className='town';root.innerHTML=`<div class="town-hud"><b>Lower Broadway · Friday night</b><button class="mini" data-townx>Leave ✕</button></div><div class="town-pad"><button data-tm="f">▲</button><div><button data-tm="l">◀</button><button data-tm="b">▼</button><button data-tm="r">▶</button></div></div><div class="town-act"></div><p class="town-tip">Use the arrows, WASD, or tap the street to walk. Walk up to a door or a person.</p>`;document.body.appendChild(root);
 const R0=new THREE.WebGLRenderer({antialias:true});R0.setPixelRatio(Math.min(2,devicePixelRatio||1));R0.outputEncoding=THREE.sRGBEncoding;root.prepend(R0.domElement);const sc=new THREE.Scene();sc.background=new THREE.Color('#0a0814');sc.fog=new THREE.Fog('#0a0814',12,46);const cam=new THREE.PerspectiveCamera(55,1,.1,80);
 const size=()=>{const w=root.clientWidth,h=root.clientHeight;R0.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()};size();addEventListener('resize',size);
 sc.add(new THREE.HemisphereLight('#6a6aa8','#140a10',.55));const moon=new THREE.DirectionalLight('#a8b8ff',.35);moon.position.set(-4,10,4);sc.add(moon);
 const mats=[];const M=(g,c,o)=>{const m=new THREE.Mesh(g,o?new THREE.MeshBasicMaterial(Object.assign({color:c},o)):tmat(c));mats.push(m);sc.add(m);return m};
 const road=M(new THREE.PlaneGeometry(6,70),'#1a1a22');road.rotation.x=-Math.PI/2;road.position.z=-25;[-4,4].forEach(x=>{const sw=M(new THREE.PlaneGeometry(2,70),'#3a3640');sw.rotation.x=-Math.PI/2;sw.position.set(x,.01,-25)});
 for(let z=2;z>-56;z-=4){const st=M(new THREE.PlaneGeometry(.15,1.4),'#e8c24a',{});st.rotation.x=-Math.PI/2;st.position.set(0,.02,z)}
 const signTex=(t,col)=>canvasTex(512,128,(g,w,h)=>{g.fillStyle='#120a18';g.fillRect(0,0,w,h);g.font='bold 54px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor=col;g.shadowBlur=24;g.fillStyle=col;g.fillText(t,w/2,h/2)});
 const doors=[];
 for(let z=0;z>-50;z-=6)[-1,1].forEach(side=>{const h=4+((z*7+side*13)%5+5)%5*1.1;const b=M(new THREE.BoxGeometry(3,h,5.6),['#3a2418','#2a2a3a','#4a2a2a','#2a3a2a','#3a3a4a'][Math.abs((z/6+side)|0)%5]);b.position.set(side*6.5,h/2,z-3);for(let wy=1.6;wy<h-.5;wy+=1.3)for(const wz of[-1.6,0,1.6]){const w=M(new THREE.PlaneGeometry(.7,.8),Math.random()<.6?'#ffd88a':'#2a2a3a',{});w.position.set(side*(6.5-1.51),wy,z-3+wz);w.rotation.y=side>0?-Math.PI/2:Math.PI/2}});
 STREET.forEach(([n,side,z,col,fn])=>{if(side===0){const ry=M(new THREE.BoxGeometry(10,7,4),'#6a3a22');ry.position.set(0,3.5,z-2);const arch=M(new THREE.PlaneGeometry(2,3),'#ffd88a',{});arch.position.set(0,1.5,z-.01);const sg=M(new THREE.PlaneGeometry(5,1.25),'#fff',{map:signTex(n,col)});sg.position.set(0,5.6,z-.02);doors.push({n,x:0,z:z+.8,fn,col});const pl=new THREE.PointLight(col,1.2,10);pl.position.set(0,4,z+2);sc.add(pl);return}
  const x=side*4.9;const sg=M(new THREE.PlaneGeometry(3.4,.85),'#fff',{map:signTex(n,col),side:THREE.DoubleSide});sg.position.set(x,3.1,z);sg.rotation.y=side>0?-Math.PI/2:Math.PI/2;const dr=M(new THREE.PlaneGeometry(1.2,2.1),col,{transparent:true,opacity:.75});dr.position.set(side*4.99,1.05,z);dr.rotation.y=side>0?-Math.PI/2:Math.PI/2;const pl=new THREE.PointLight(col,1.1,7);pl.position.set(side*4,2.6,z);sc.add(pl);doors.push({n,x:side*4,z,fn,col})});
 if(S.bar){const z=-38;const sg=M(new THREE.PlaneGeometry(3.4,.85),'#fff',{map:signTex(S.bar.n,'#ff70b0'),side:THREE.DoubleSide});sg.position.set(4.9,3.1,z);sg.rotation.y=-Math.PI/2;doors.push({n:S.bar.n+' (yours)',x:4,z,fn:()=>doBar('play'),col:'#ff70b0'})}
 // you, and people you know on the sidewalk
 const me=charModel(S.look,{mood:'happy'});me.userData.noTurn=1;me.position.set(0,0,3);sc.add(me);
 const ppl=Object.keys(S.rel).filter(k=>has(k)&&R(k).met&&CHARS[k].look).sort(()=>Math.random()-.5).slice(0,4).map((k,i)=>{const g=charModel(lookFor(k),{mood:R(k).a<0?'angry':'happy'});const side=i%2?1:-1;g.position.set(side*3.6,0,-6-i*9);g.rotation.y=side>0?-Math.PI/2.3:Math.PI/2.3;g.userData.noTurn=1;sc.add(g);return{k,g}});
 const crowd=[];for(let i=0;i<10;i++){const g=charModel({g:pick(['m','f']),skin:pick(['#f0c8a8','#c98a6a','#8a5a3a','#e8b890']),hair:pick(['#2a1a10','#6a4a2a','#d8b060','#1a1a1a']),style:pick(['short','ponytail','longwave','bob','buzz']),outfit:pick(['#3b5a85','#8a3a3a','#272727','#efe9dc','#5a3420']),top:pick(['tee','flannel','dress','denim'])},{mood:'happy'});g.position.set(rnd(-3.6,3.6),0,rnd(-48,0));g.userData.walk=1;g.userData.dir=chance(.5)?1:-1;g.userData.sp=rnd(.6,1.2);sc.add(g);crowd.push(g)}
 cam.position.set(0,3.2,9.5);cam.lookAt(0,1.3,1);const key={};let target=null,dead=false,raf=0,last=performance.now(),near=null;const kd=e=>{key[e.key.toLowerCase()]=1},ku=e=>{key[e.key.toLowerCase()]=0};addEventListener('keydown',kd);addEventListener('keyup',ku);
 root.querySelectorAll('[data-tm]').forEach(b=>{const k={f:'w',b:'s',l:'a',r:'d'}[b.dataset.tm];b.onpointerdown=e=>{e.preventDefault();key[k]=1;target=null};b.onpointerup=b.onpointerleave=()=>key[k]=0});
 const ray=new THREE.Raycaster();R0.domElement.addEventListener('pointerdown',e=>{const r=R0.domElement.getBoundingClientRect();ray.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-(e.clientY-r.top)/r.height*2+1},cam);const hit=ray.intersectObject(road)[0];if(hit)target=hit.point.clone()});
 const act=root.querySelector('.town-act');
 const end=()=>{if(dead)return;dead=true;cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('resize',size);sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});R0.dispose();R0.forceContextLoss&&R0.forceContextLoss();root.remove();try{render()}catch(_){}};
 root.querySelector('[data-townx]').onclick=end;
 const loop=t=>{if(dead)return;const dt=Math.min(.05,(t-last)/1000);last=t;const tt=t/1000;let vx=0,vz=0;if(key.w||key.arrowup)vz=-1;if(key.s||key.arrowdown)vz=1;if(key.a||key.arrowleft)vx=-1;if(key.d||key.arrowright)vx=1;
  if(!vx&&!vz&&target){const dx=target.x-me.position.x,dz=target.z-me.position.z,d=Math.hypot(dx,dz);if(d>.2){vx=dx/d;vz=dz/d}else target=null}
  const mv=Math.hypot(vx,vz);if(mv){vx/=mv;vz/=mv;me.position.x=clamp(me.position.x+vx*dt*3.4,-4.4,4.4);me.position.z=clamp(me.position.z+vz*dt*3.4,-44,4);me.rotation.y=Math.atan2(vx,vz);me.userData.walk=1}else me.userData.walk=0;
  animChar(me,tt);ppl.forEach(p=>animChar(p.g,tt));crowd.forEach(g=>{g.position.z+=g.userData.dir*g.userData.sp*dt;if(g.position.z>3||g.position.z<-48)g.userData.dir*=-1;g.rotation.y=g.userData.dir>0?0:Math.PI;animChar(g,tt)});
  cam.position.lerp(new THREE.Vector3(me.position.x*.6,3.2,me.position.z+6.5),.08);cam.lookAt(me.position.x,1.3,me.position.z-2);
  let nb=null,bd=1.8;doors.forEach(d=>{const dd=Math.hypot(d.x-me.position.x,d.z-me.position.z);if(dd<bd){bd=dd;nb={type:'door',d}}});ppl.forEach(p=>{const dd=p.g.position.distanceTo(me.position);if(dd<bd){bd=dd;nb={type:'p',p}}});
  const id=nb?(nb.type==='door'?'d:'+nb.d.n:'p:'+nb.p.k):null;if(id!==near){near=id;act.innerHTML=nb?(nb.type==='door'?`<button class="primary" data-tgo>🚪 Go into ${esc(nb.d.n)}</button>`:`<button class="primary" data-tgo>💬 Talk to ${esc(fullnm(nb.p.k))}</button><button class="ghost" data-tsee>👤 Profile</button>`):'';act.querySelectorAll('button').forEach(b=>b.onclick=()=>{end();if(nb.type==='door')nb.d.fn();else if(b.dataset.tsee!==undefined)openPerson(nb.p.k);else realTalk(nb.p.k)})}
  R0.render(sc,cam);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}

// ======================= HOOKS =======================
VIEWS.more=(function(){const _mo=VIEWS.more;return function(){return _mo().replace('<button class="more-tile" data-goto="life:map">','<button class="more-tile" data-walk3d="1"><i>🚶</i><span>Walk Lower Broadway</span></button><button class="more-tile" data-goto="life:map">')}})();
const _lifeW3=VIEWS.life;VIEWS.life=function(){let h=_lifeW3();if(UI.sub.life==='map')h=h.replace('<section class="card citymap">','<section class="card"><div class="between"><div><span class="eyebrow">In 3D</span><h3>🚶 Walk Lower Broadway</h3><p class="small muted">Neon, honky-tonks, the Ryman and people you know.</p></div><button class="primary" data-walk3d="1">Walk</button></div></section><section class="card citymap">');return h};
document.addEventListener('click',e=>{if(e.target.closest('[data-walk3d]')&&!e.target.closest('#modal'))walkTown()});
(function(){const _wa=window.weekActions;window.weekActions=function(){const a=_wa();const tk=a.find(x=>x[0]==='Take care of yourself');if(tk)tk[1].unshift(['🚶','Walk Lower Broadway (3D)','walk3d',0]);return a}})();
(function(){const _d=window.doWeekAction;window.doWeekAction=function(k){if(k==='walk3d')return walkTown();return _d(k)}})();
