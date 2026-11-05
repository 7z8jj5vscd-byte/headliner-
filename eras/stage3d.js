/* The Eras Life: 3D toon figures and sets (three.js r128).
   Figures are stylised and built from the look the player picks. They are not likenesses
   of any real person (a rule from the design report). */
(function () {
const T3 = window.T3 = { ok:null, grad:null, slots:{}, raf:0 };
function ok() {
  if (T3.ok !== null) return T3.ok;
  try { if (!window.THREE) throw 0; const c = document.createElement('canvas'); T3.ok = !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
  catch (e) { T3.ok = false; }
  return T3.ok;
}
T3.available = ok;
function shade(hex, p) {
  let c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(Math.max(0, Math.min(255, p < 0 ? v * (1 + p) : v + (255 - v) * p)));
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}
T3.shade = shade;
function grad() {
  if (!T3.grad) { T3.grad = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.LuminanceFormat); T3.grad.minFilter = T3.grad.magFilter = THREE.NearestFilter; T3.grad.needsUpdate = true; }
  return T3.grad;
}
const mat = (c, o) => { o = Object.assign({}, o || {}); if (o.emissive) o.emissive = new THREE.Color(o.emissive).convertSRGBToLinear();
  return new THREE.MeshToonMaterial(Object.assign({ color:new THREE.Color(c).convertSRGBToLinear(), gradientMap:grad() }, o)); };
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }

/* ---------- Figure ---------- */
// look: { skin, hair, style: long|bob|curly|ponytail|short|bun, outfit, accent, top: dress|suit|jacket|tee|sequin, guitar, mic, boots }
function figure(look, opt) {
  look = look || {}; opt = opt || {};
  const skin = look.skin || '#e9c3a1', hair = look.hair || '#7a4a2a', out = look.outfit || '#3b5bdb', acc = look.accent || '#ffd166';
  const top = look.top || 'dress', style = look.style || 'long';
  const G = new THREE.Group(), P = {};
  const M = (geo, m, x, y, z, par) => { const me = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m); me.position.set(x || 0, y || 0, z || 0); (par || G).add(me); me.castShadow = true; return me; };
  const sparkle = top === 'sequin';
  const outM = sparkle ? mat(out, { emissive:shade(out, -.55) }) : mat(out);
  // legs
  const dressy = top === 'dress' || top === 'sequin';
  P.legs = [];
  [-1, 1].forEach(s => { const L = new THREE.Group(); L.position.set(s * .08, .8, 0); G.add(L);
    M(new THREE.CylinderGeometry(.066, .058, .62, 12), dressy ? skin : shade(out, -.3), 0, -.33, 0, L);
    M(new THREE.CylinderGeometry(.07, .075, .2, 12), look.boots || '#2b2b2b', 0, -.6, 0, L);
    M(new THREE.BoxGeometry(.11, .06, .19), look.boots || '#2b2b2b', 0, -.69, .04, L); P.legs.push(L); });
  // torso
  const T = new THREE.Group(); T.position.y = .8; G.add(T); P.torso = T;
  M(new THREE.CylinderGeometry(.15, .135, .5, 18), outM, 0, .27, 0, T);
  M(new THREE.SphereGeometry(.15, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), outM, 0, .5, 0, T).scale.set(1, .45, 1);
  if (dressy) {
    M(new THREE.CylinderGeometry(.14, .33, .5, 24, 1, true), mat(out, { side:THREE.DoubleSide, emissive:sparkle ? shade(out, -.5) : '#000000' }), 0, -.16, 0, T);
    if (sparkle) for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, yy = .5 - Math.random() * .9, r = yy > 0 ? .152 : .15 + (-yy) * .38;
      M(new THREE.SphereGeometry(.009, 6, 4), mat('#ffffff', { emissive:acc }), Math.sin(a) * r, yy, Math.cos(a) * r, T); }
  } else {
    M(new THREE.CylinderGeometry(.142, .145, .06, 18), shade(out, -.4), 0, .02, 0, T);
  }
  if (top === 'suit' || top === 'jacket') { M(new THREE.BoxGeometry(.09, .42, .02), top === 'suit' ? '#f4f4f4' : acc, 0, .28, .142, T);
    if (top === 'suit') M(new THREE.BoxGeometry(.03, .28, .01), acc, 0, .33, .154, T); }
  if (top === 'tee') M(new THREE.BoxGeometry(.12, .1, .01), acc, 0, .34, .148, T);
  M(new THREE.CylinderGeometry(.048, .052, .1, 10), skin, 0, .57, 0, T);
  // arms
  P.arms = [];
  [-1, 1].forEach(s => { const A = new THREE.Group(); A.position.set(s * .19, .47, 0); T.add(A);
    const shortS = dressy || top === 'tee';
    M(new THREE.CylinderGeometry(.05, .046, shortS ? .14 : .42, 10), outM, 0, shortS ? -.07 : -.21, 0, A);
    if (shortS) M(new THREE.CylinderGeometry(.042, .04, .29, 10), skin, 0, -.29, 0, A);
    M(new THREE.SphereGeometry(.048, 10, 8), skin, 0, -.46, 0, A); A.rotation.z = s * .12; P.arms.push(A); });
  // head
  const H = new THREE.Group(); H.position.y = .8; T.add(H); P.head = H;
  M(new THREE.SphereGeometry(.23, 26, 18), skin, 0, 0, 0, H).scale.set(.95, 1.04, .95);
  const eyeM = mat('#16110e'); P.eyes = [];
  [-1, 1].forEach(s => { const e = M(new THREE.SphereGeometry(.032, 12, 10), eyeM, s * .082, .02, .197, H); e.scale.set(1, 1.3, .6); P.eyes.push(e);
    M(new THREE.SphereGeometry(.01, 6, 4), new THREE.MeshBasicMaterial({ color:'#ffffff' }), s * .082 + .011, .04, .216, H);
    M(new THREE.BoxGeometry(.07, .013, .012), shade(hair, -.35), s * .082, .095, .208, H); });
  const lip = look.lips || '#b8505a';
  P.smile = M(new THREE.TorusGeometry(.045, .011, 6, 16, Math.PI), lip, 0, -.09, .225, H); P.smile.rotation.z = Math.PI;
  P.flat = M(new THREE.BoxGeometry(.06, .014, .012), lip, 0, -.105, .222, H);
  const blush = new THREE.MeshBasicMaterial({ color:'#ff7a8a', transparent:true, opacity:.3, depthWrite:false });
  [-1, 1].forEach(s => { const b = M(new THREE.CircleGeometry(.03, 14), blush, s * .125, -.045, .196, H); b.rotation.y = s * .55; });
  // hair
  const hm = mat(hair), dbl = mat(hair, { side:THREE.DoubleSide });
  const cap = M(new THREE.SphereGeometry(.25, 26, 14, 0, Math.PI * 2, 0, Math.PI * .55), hm, 0, .02, -.012, H); cap.rotation.x = -.28;
  if (style === 'long' || style === 'curly') {
    M(new THREE.CylinderGeometry(.26, .32, .6, 24, 1, true, Math.PI / 2, Math.PI), dbl, 0, -.24, -.01, H);
    [-1, 1].forEach(s => M(new THREE.BoxGeometry(.07, .46, .07), hm, s * .195, -.2, .07, H));
    if (style === 'curly') for (let i = 0; i < 18; i++) { const a = Math.PI * .6 + Math.random() * Math.PI * .8; M(new THREE.SphereGeometry(.06, 8, 6), hm, Math.sin(a) * .29, -.1 - Math.random() * .4, Math.cos(a) * .29, H); }
  }
  if (style === 'bob') { M(new THREE.CylinderGeometry(.26, .28, .28, 24, 1, true, Math.PI * .35, Math.PI * 1.3), dbl, 0, -.1, 0, H); }
  if (style === 'ponytail') { M(new THREE.SphereGeometry(.09, 12, 10), hm, 0, -.12, -.3, H).scale.set(.7, 1.7, .7); }
  if (style === 'bun') { M(new THREE.SphereGeometry(.1, 12, 10), hm, 0, .2, -.16, H); }
  if (style !== 'short') { const fr = M(new THREE.SphereGeometry(.13, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm, 0, .15, .14, H); fr.scale.set(1.55, .48, .6); fr.rotation.x = .5; }
  else { const fr = M(new THREE.SphereGeometry(.12, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm, .05, .15, .14, H); fr.scale.set(1.3, .55, .7); fr.rotation.set(.5, 0, -.25); }
  // props
  if (opt.mic || look.mic) { const g = new THREE.Group(); P.arms[1].add(g);
    M(new THREE.CylinderGeometry(.017, .013, .16, 8), '#222', 0, -.52, .02, g); M(new THREE.SphereGeometry(.034, 10, 8), mat('#9aa0a6', { emissive:'#222' }), 0, -.42, .02, g); }
  if (opt.guitar || look.guitar) { const gg = new THREE.Group(); gg.position.set(0, .18, .2); gg.rotation.z = .9; T.add(gg);
    const body = M(new THREE.SphereGeometry(.17, 16, 12), look.guitarColor || '#b5651d', 0, 0, 0, gg); body.scale.set(1, 1.2, .35);
    M(new THREE.BoxGeometry(.05, .5, .03), '#3a2414', 0, .38, 0, gg);
    M(new THREE.CircleGeometry(.05, 16), new THREE.MeshBasicMaterial({ color:'#1a0f08' }), 0, .04, .062, gg); }
  if (opt.pen) { M(new THREE.BoxGeometry(.22, .015, .3), '#f3ecd9', 0, .02, .28, T).rotation.x = -.5; }
  G.userData = { P, anim:opt.anim || 'idle', ph:Math.random() * 6, mood:opt.mood || 'happy' };
  setMood(G, opt.mood || 'happy');
  return G;
}
function setMood(G, m) { const P = G.userData.P; P.smile.visible = m !== 'sad' && m !== 'neutral'; P.flat.visible = !P.smile.visible; if (m === 'sad') P.flat.rotation.z = .2; }
function anim(G, t) {
  const u = G.userData, P = u.P, tt = t + u.ph, a = u.anim;
  P.torso.scale.y = 1 + Math.sin(tt * 2) * .008; P.head.rotation.set(0, Math.sin(tt * .7) * .12, 0);
  if (a === 'sing') { P.arms[1].rotation.x = -1.2 + Math.sin(tt * 3) * .1; P.arms[0].rotation.z = -.5 - Math.sin(tt * 2) * .3; P.torso.rotation.z = Math.sin(tt * 2.2) * .05; G.position.y = Math.abs(Math.sin(tt * 4)) * .02; }
  else if (a === 'wave') { P.arms[0].rotation.z = -2.4 + Math.sin(tt * 6) * .3; }
  else if (a === 'strum') { P.arms[1].rotation.x = -.7 + Math.sin(tt * 9) * .15; P.arms[0].rotation.x = -.9; P.head.rotation.x = Math.sin(tt * 2) * .05; }
  else if (a === 'write') { P.arms.forEach((A, i) => A.rotation.x = -.7 + (i ? Math.sin(tt * 5) * .06 : 0)); P.head.rotation.x = .25; }
  else if (a === 'talk') { P.arms[1].rotation.x = -.4 + Math.sin(tt * 2.5) * .25; P.head.rotation.y = Math.sin(tt * 1.3) * .25; }
  else if (a === 'dance') { P.torso.rotation.z = Math.sin(tt * 4) * .12; P.arms.forEach((A, i) => A.rotation.z = (i ? 1 : -1) * (1.6 + Math.sin(tt * 4 + i) * .5)); G.position.y = Math.abs(Math.sin(tt * 4)) * .05; P.legs.forEach((L, i) => L.rotation.x = Math.sin(tt * 4 + i * 3) * .25); }
  else if (a === 'bow') { P.torso.rotation.x = Math.max(0, Math.sin(tt * .9)) * .5; }
}

/* ---------- Sets ---------- */
const SETS = {
 farm:{ bg:['#9fd3f0','#e8f5d0'], floor:'#6f9b4a', draw:(g, w, h) => { g.fillStyle = '#2f6b3a'; for (let i = 0; i < 26; i++) { const x = i * 42 + (i % 2) * 12, y = h * .62; g.beginPath(); g.moveTo(x, y - 70 - (i % 3) * 12); g.lineTo(x - 22, y); g.lineTo(x + 22, y); g.fill(); } } },
 bedroom:{ bg:['#f6dcc6','#e9c8b0'], floor:'#b98a62', draw:(g, w, h) => { g.fillStyle = '#fff6e8'; g.fillRect(w * .62, h * .18, 170, 130); g.strokeStyle = '#a07050'; g.lineWidth = 8; g.strokeRect(w * .62, h * .18, 170, 130); g.fillStyle = '#c96f8a'; for (let i = 0; i < 9; i++) g.fillRect(70 + i * 22, h * .3, 12, 60 + (i % 3) * 10); } },
 writers:{ bg:['#3a2a20','#24180f'], floor:'#5a3b22', draw:(g, w, h) => { g.fillStyle = '#f5c46b'; for (let i = 0; i < 5; i++) { g.globalAlpha = .7; g.beginPath(); g.arc(120 + i * 190, 80, 16, 0, 7); g.fill(); } g.globalAlpha = 1; } },
 studio:{ bg:['#20232c','#11131a'], floor:'#2c2f3a', draw:(g, w, h) => { g.fillStyle = '#3a3f50'; g.fillRect(w * .1, h * .25, w * .8, h * .35); g.fillStyle = '#7fd1ff'; g.globalAlpha = .25; g.fillRect(w * .14, h * .29, w * .72, h * .27); g.globalAlpha = 1; g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(w * .85, h * .15, 12, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText('ON AIR', w * .87, h * .17); } },
 video:{ bg:['#ffe6f0','#ffd0a8'], floor:'#f5e6d8', draw:(g, w, h) => { g.strokeStyle = '#ffffff'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(w / 2, h * 1.1, 80 + i * 40, Math.PI, 0); g.stroke(); } } },
 tv:{ bg:['#1b2a4a','#0d1528'], floor:'#2a3b63', draw:(g, w, h) => { g.fillStyle = '#ffd166'; for (let i = 0; i < 30; i++) { g.globalAlpha = .5; g.fillRect(i * 36, 20, 6, 6); } g.globalAlpha = 1; g.fillStyle = '#3d5a99'; g.fillRect(w * .3, h * .2, w * .4, h * .3); } },
 press:{ bg:['#e9e9ee','#cfd0d8'], floor:'#3b2f4a', draw:(g, w, h) => { g.fillStyle = '#b9bbc8'; g.font = 'bold 34px sans-serif'; for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) g.fillText('★ ERAS ★', x * 190 - (y % 2) * 90, 60 + y * 80); } },
 awards:{ bg:['#2a1630','#0f0812'], floor:'#4a1d3a', draw:(g, w, h) => { g.fillStyle = '#e8c66a'; for (let i = 0; i < 9; i++) { g.globalAlpha = .55; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(i * 130, h); g.lineTo(i * 130 + 30, h); g.fill(); } g.globalAlpha = 1; } },
 rehearsal:{ bg:['#3c3c46','#24242c'], floor:'#5c5c66', draw:(g, w, h) => { g.strokeStyle = '#ffd166'; g.lineWidth = 6; g.setLineDash([24, 18]); g.strokeRect(80, h * .7, w - 160, h * .22); g.setLineDash([]); } },
 theater:{ bg:['#3a0f1a','#14060a'], floor:'#4a2a1a', draw:(g, w, h) => { g.fillStyle = '#8a1c2c'; g.fillRect(0, 0, 160, h); g.fillRect(w - 160, 0, 160, h); g.fillStyle = '#c9a24a'; g.fillRect(0, 0, w, 30); } },
 arena:{ bg:['#0c1230','#05070f'], floor:'#141a35', crowd:900, draw:(g, w, h) => { for (let r = 0; r < 6; r++) for (let i = 0; i < 70; i++) { g.fillStyle = ['#ff6b9d','#ffd166','#7fd1ff','#c3f584'][(i + r) % 4]; g.globalAlpha = .6; g.fillRect(i * 15 + (r % 2) * 7, h * .45 + r * 22, 3, 3); } g.globalAlpha = 1; } },
 stadium:{ bg:['#0a0f2a','#030409'], floor:'#101634', crowd:2400, draw:(g, w, h) => { for (let r = 0; r < 12; r++) for (let i = 0; i < 110; i++) { g.fillStyle = ['#ff6b9d','#ffd166','#7fd1ff','#c3f584','#ffffff'][(i * 7 + r) % 5]; g.globalAlpha = .65; g.fillRect(i * 9.4 + (r % 2) * 4, h * .3 + r * 18, 2.5, 2.5); } g.globalAlpha = 1; } },
 home:{ bg:['#f3e4cf','#dcc5a8'], floor:'#8c6a4a', draw:(g, w, h) => { g.fillStyle = '#6b8e5a'; g.fillRect(w * .1, h * .2, 220, 160); g.fillStyle = '#e9d8bd'; g.fillRect(w * .1 + 10, h * .2 + 10, 200, 140); g.fillStyle = '#c45b4a'; g.beginPath(); g.arc(w * .75, h * .35, 40, 0, 7); g.fill(); } },
 bus:{ bg:['#f0a868','#6a4a8a'], floor:'#3a3a3a', draw:(g, w, h) => { g.fillStyle = '#2a2a2a'; g.fillRect(0, h * .7, w, 60); g.fillStyle = '#ffd166'; for (let i = 0; i < 12; i++) g.fillRect(i * 90, h * .73, 40, 6); } }
};
T3.SETS = Object.keys(SETS);
function buildSet(scene, kind, color) {
  const s = SETS[kind] || SETS.studio;
  const tex = canvasTex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, s.bg[0]); gr.addColorStop(1, s.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h); s.draw(g, w, h); });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({ map:tex })); back.position.set(0, 1.9, -2.6); scene.add(back);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 40), mat(s.floor)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  if (['theater','arena','stadium','rehearsal','tv','awards'].includes(kind)) {
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2, .12, 40), mat(color ? shade(color, -.35) : '#333')); stage.position.y = -.06; stage.receiveShadow = true; scene.add(stage);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.95, .025, 6, 60), mat(color || '#ffd166', { emissive:color || '#ffd166' })); ring.rotation.x = Math.PI / 2; ring.position.y = .01; scene.add(ring);
  }
  if (kind === 'stadium' || kind === 'arena') {
    const n = kind === 'stadium' ? 14 : 8;
    for (let i = 0; i < n; i++) { const beam = new THREE.Mesh(new THREE.ConeGeometry(.35, 4, 16, 1, true), new THREE.MeshBasicMaterial({ color:i % 2 ? (color || '#ffd166') : '#ffffff', transparent:true, opacity:.08, depthWrite:false, side:THREE.DoubleSide }));
      beam.position.set(-3.2 + i * (6.4 / (n - 1)), 2.2, -1.8); beam.rotation.z = (i - n / 2) * .06; scene.add(beam); beam.userData.sweep = i; }
  }
  if (kind === 'studio') { const mic = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1.5, 8), mat('#444')); st.position.y = .75; mic.add(st);
    const hd = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .16, 12), mat('#bbb')); hd.position.y = 1.55; mic.add(hd); mic.position.set(.45, 0, .45); scene.add(mic); }
  if (kind === 'writers' || kind === 'bedroom') { const stool = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .05, 16), mat('#7a4a2a')); stool.position.set(0, .45, -.1); scene.add(stool); }
  if (kind === 'press' || kind === 'awards') { for (let i = 0; i < 6; i++) { const f = new THREE.PointLight('#ffffff', 0, 3); f.position.set(-2 + i * .8, 1.2, 1.6); f.userData.flash = i; scene.add(f); } }
}

/* ---------- Views ---------- */
// spec: { set, color, figs:[{look, x, z, anim, mood, ry}] }
T3.view = function (el, spec, slot) {
  if (!el || !ok()) return false;
  slot = slot || 'main';
  let s = T3.slots[slot];
  try {
    if (!s) {
      const r = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
      r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.outputEncoding = THREE.sRGBEncoding; r.shadowMap.enabled = true;
      s = T3.slots[slot] = { r, key:'', scene:null, cam:new THREE.PerspectiveCamera(32, 1, .1, 60), figs:[], rotY:0, drag:null };
      const c = r.domElement; c.style.touchAction = 'pan-y'; c.className = 't3';
      c.addEventListener('pointerdown', e => { s.drag = { x:e.clientX, r:s.rotY }; });
      window.addEventListener('pointerup', () => { s.drag = null; });
      c.addEventListener('pointermove', e => { if (s.drag) s.rotY = s.drag.r + (e.clientX - s.drag.x) * .01; });
    }
    if (s.r.domElement.parentNode !== el) el.appendChild(s.r.domElement);
    const key = JSON.stringify(spec);
    if (s.key !== key) {
      if (s.scene) dispose(s.scene);
      const sc = new THREE.Scene(); s.scene = sc; s.key = key; s.figs = [];
      sc.add(new THREE.HemisphereLight('#ffffff', '#444466', .75));
      const d = new THREE.DirectionalLight('#ffffff', .8); d.position.set(2, 4, 3); d.castShadow = true; d.shadow.mapSize.set(512, 512); sc.add(d);
      if (spec.color) { const p = new THREE.PointLight(spec.color, .9, 7); p.position.set(0, 2.4, 1.5); sc.add(p); }
      buildSet(sc, spec.set, spec.color);
      const root = new THREE.Group(); sc.add(root); s.root = root;
      (spec.figs || []).forEach(f => { const g = figure(f.look, f); g.position.set(f.x || 0, 0, f.z || 0); g.rotation.y = f.ry || 0; g.scale.setScalar(f.s || 1); root.add(g); s.figs.push(g); });
      s.cam.position.set(0, 1.25, 4.1); s.cam.lookAt(0, .95, 0);
    }
    const w = el.clientWidth || 320, h = el.clientHeight || 220;
    s.r.setSize(w, h, false); s.r.domElement.style.width = '100%'; s.r.domElement.style.height = '100%';
    s.cam.aspect = w / h; s.cam.updateProjectionMatrix();
    loop(); return true;
  } catch (e) { T3.ok = false; return false; }
};
function dispose(sc) { sc.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }); }
function loop() {
  if (T3.raf) return;
  const step = () => {
    T3.raf = requestAnimationFrame(step);
    const t = performance.now() / 1000; let any = false;
    for (const k in T3.slots) { const s = T3.slots[k]; const c = s.r.domElement;
      if (!c.isConnected || !s.scene) continue; any = true;
      if (!s.drag) s.rotY *= .98;
      s.root.rotation.y = s.rotY;
      s.figs.forEach(f => anim(f, t));
      s.scene.traverse(o => { if (o.userData.sweep !== undefined) o.rotation.z = Math.sin(t * .8 + o.userData.sweep) * .35;
        if (o.userData.flash !== undefined) o.intensity = Math.random() < .03 ? 2.5 : o.intensity * .8; });
      s.r.render(s.scene, s.cam); }
    if (!any) { cancelAnimationFrame(T3.raf); T3.raf = 0; }
  };
  T3.raf = requestAnimationFrame(step);
}
/* Generic team figures, labelled by role only. */
T3.TEAM = {
 manager:{ skin:'#d9a77f', hair:'#3a2a1e', style:'short', outfit:'#2d3142', accent:'#c0392b', top:'suit' },
 publicist:{ skin:'#f1c9a5', hair:'#1e1e1e', style:'bob', outfit:'#4a4e69', accent:'#f2e9e4', top:'jacket' },
 label:{ skin:'#8d5524', hair:'#121212', style:'short', outfit:'#1b263b', accent:'#e0e1dd', top:'suit' },
 family:{ skin:'#efc9a4', hair:'#b08d57', style:'ponytail', outfit:'#7a9e7e', accent:'#f6f1e7', top:'tee' },
 producer:{ skin:'#c68642', hair:'#2b1d14', style:'short', outfit:'#3d405b', accent:'#81b29a', top:'tee' },
 fan:{ skin:'#f5d0b0', hair:'#6b3e26', style:'ponytail', outfit:'#ff6b9d', accent:'#ffd166', top:'tee' }
};
})();
