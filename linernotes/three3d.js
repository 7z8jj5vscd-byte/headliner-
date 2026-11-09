/* Liner Notes: 3D characters, stages and video sets (three.js r128). Only the player's artist is
   drawn in 3D. Figures are stylised toy-like characters built from simple shapes. */
(function () {
const L3 = window.L3 = { ok: null, active: null, portraitCache: {} };
const DD = () => window.LND;

L3.available = () => {
  if (L3.ok !== null) return L3.ok;
  try { if (!window.THREE) throw 0; const c = document.createElement('canvas'); L3.ok = !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
  catch (e) { L3.ok = false; }
  try { if (localStorage.getItem('ln-3d') === 'off') L3.ok = false; } catch (e) { }
  return L3.ok;
};

let grad = null;
function gradient() {
  if (grad) return grad;
  const data = new Uint8Array([90, 170, 255]);
  grad = new THREE.DataTexture(data, 3, 1, THREE.LuminanceFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true; return grad;
}
const matCache = {};
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts); if (matCache[key]) return matCache[key];
  const m = opts.basic ? new THREE.MeshBasicMaterial({ color, transparent: !!opts.opacity, opacity: opts.opacity || 1, side: opts.side || THREE.FrontSide, blending: opts.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !opts.add })
    : new THREE.MeshToonMaterial({ color, gradientMap: gradient(), emissive: opts.emissive || 0x000000 });
  matCache[key] = m; return m;
}
function shade(hex, p) {
  let c = String(hex).replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(Math.max(0, Math.min(255, p < 0 ? v * (1 + p) : v + (255 - v) * p)));
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}
const G = {};
function geo(kind, ...a) { const k = kind + a.join(','); if (G[k]) return G[k]; G[k] = new THREE[kind](...a); return G[k]; }
function mesh(g, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; }

// ------------------------------------------------------------------ figure
L3.figure = function (look) {
  const D = DD(); look = Object.assign({}, window.LN ? window.LN.defaultLook() : {}, look || {});
  const w = (D.BODIES.find(b => b.id === look.body) || { w: 1 }).w;
  const skin = mat(look.skin), top = mat(look.topColor, look.top === 'sequin' ? { emissive: new THREE.Color(look.topColor).multiplyScalar(0.35) } : {}),
    bottom = mat(look.bottomColor), shoe = mat(look.shoesColor), hairM = mat(look.hairColor), dark = mat('#1d1d24'), white = mat('#f4f4f6'), gold = mat('#f2c14e', { emissive: new THREE.Color('#5a4000') });
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const gown = look.top === 'gown';
  // legs
  const legs = new THREE.Group(); body.add(legs);
  for (const sx of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(sx * 0.1 * w, 0.82, 0); legs.add(leg);
    const bt = look.bottom;
    if (bt === 'shorts') { leg.add(mesh(geo('CylinderGeometry', 0.1 * w, 0.095 * w, 0.3, 10), bottom, 0, -0.15)); leg.add(mesh(geo('CylinderGeometry', 0.07, 0.06, 0.5, 8), skin, 0, -0.55)); }
    else if (bt === 'skirt') { leg.add(mesh(geo('CylinderGeometry', 0.065, 0.055, 0.78, 8), skin, 0, -0.39)); }
    else if (bt === 'flares') { leg.add(mesh(geo('CylinderGeometry', 0.085 * w, 0.13, 0.8, 10), bottom, 0, -0.4)); }
    else leg.add(mesh(geo('CylinderGeometry', 0.09 * w, 0.075 * w, 0.8, 10), bt === 'leather' ? mat(look.bottomColor, { emissive: new THREE.Color('#111') }) : bottom, 0, -0.4));
    // shoes
    const st = look.shoes; let sh;
    if (st === 'platforms') { sh = mesh(geo('BoxGeometry', 0.13, 0.12, 0.24), shoe, 0, -0.78, 0.04); }
    else if (st === 'cowboy' || st === 'boots') { sh = new THREE.Group(); sh.add(mesh(geo('CylinderGeometry', 0.08, 0.08, 0.2, 8), shoe, 0, -0.7)); sh.add(mesh(geo('BoxGeometry', 0.12, 0.08, 0.24), shoe, 0, -0.79, 0.04)); }
    else if (st === 'loafers') sh = mesh(geo('BoxGeometry', 0.11, 0.06, 0.22), shoe, 0, -0.8, 0.04);
    else sh = mesh(geo('BoxGeometry', 0.13, 0.09, 0.25), shoe, 0, -0.79, 0.04);
    leg.add(sh); if (st === 'sneakers') leg.add(mesh(geo('BoxGeometry', 0.135, 0.025, 0.255), white, 0, -0.83, 0.04));
    leg.userData.side = sx; legs.userData[sx] = leg;
  }
  if (look.bottom === 'skirt' && !gown) body.add(mesh(geo('CylinderGeometry', 0.2 * w, 0.3 * w, 0.32, 14), bottom, 0, 0.72));
  // torso
  const torso = new THREE.Group(); torso.position.y = 0.82; body.add(torso);
  const tt = look.top; const tw = (tt === 'puffer' ? 1.3 : tt === 'jersey' ? 1.15 : tt === 'corset' ? 0.92 : 1) * w;
  if (gown) torso.add(mesh(geo('CylinderGeometry', 0.17 * w, 0.42 * w, 1.42, 16), top, 0, -0.1));
  if (tt === 'crop') { torso.add(mesh(geo('CylinderGeometry', 0.19 * w, 0.18 * w, 0.22, 12), skin, 0, 0.12)); torso.add(mesh(geo('CylinderGeometry', 0.21 * w, 0.19 * w, 0.36, 12), top, 0, 0.42)); }
  else torso.add(mesh(geo('CylinderGeometry', 0.22 * tw, 0.19 * tw, 0.62, 14), top, 0, 0.31));
  if (tt === 'suit' || tt === 'jacket') { torso.add(mesh(geo('BoxGeometry', 0.12, 0.3, 0.05), tt === 'suit' ? white : mat(shade(look.topColor, 0.3)), 0, 0.42, 0.19 * tw)); }
  if (tt === 'hoodie') torso.add(mesh(geo('TorusGeometry', 0.13, 0.05, 8, 14), top, 0, 0.64, -0.06));
  if (tt === 'fringe') for (let i = -3; i <= 3; i++) torso.add(mesh(geo('BoxGeometry', 0.02, 0.14, 0.02), mat(shade(look.topColor, -0.25)), i * 0.05, 0.42, 0.2));
  if (tt === 'corset') for (let i = 0; i < 4; i++) torso.add(mesh(geo('BoxGeometry', 0.1, 0.012, 0.02), dark, 0, 0.12 + i * 0.12, 0.18));
  if (tt === 'jersey') torso.add(mesh(geo('BoxGeometry', 0.12, 0.16, 0.02), white, 0, 0.38, 0.22 * tw));
  if (tt === 'puffer') for (let i = 0; i < 3; i++) torso.add(mesh(geo('TorusGeometry', 0.24 * w, 0.025, 6, 16), mat(shade(look.topColor, -0.15)), 0, 0.12 + i * 0.18).rotateX(Math.PI / 2));
  // neck + head
  const head = new THREE.Group(); head.position.y = 1.62; body.add(head);
  body.add(mesh(geo('CylinderGeometry', 0.06, 0.07, 0.12, 8), skin, 0, 1.47));
  head.add(mesh(geo('SphereGeometry', 0.17, 20, 16), skin));
  for (const sx of [-1, 1]) { head.add(mesh(geo('SphereGeometry', 0.022, 8, 8), mat(look.eyes || '#1d1d24'), sx * 0.06, 0.02, 0.155)); head.add(mesh(geo('SphereGeometry', 0.028, 8, 8), skin, sx * 0.17, 0, 0)); }
  head.add(mesh(geo('BoxGeometry', 0.06, 0.012, 0.01), mat('#7a2b2b'), 0, -0.07, 0.162));
  head.add(mesh(geo('SphereGeometry', 0.018, 8, 8), mat(shade(look.skin, -0.12)), 0, -0.02, 0.17));
  hair(head, look.hair, hairM, w);
  // accessories
  const a = look.acc, am = mat(look.accColor || '#ffd23f');
  if (a === 'shades') { head.add(mesh(geo('BoxGeometry', 0.26, 0.055, 0.04), dark, 0, 0.025, 0.162)); }
  if (a === 'chain') body.add(mesh(geo('TorusGeometry', 0.1, 0.012, 6, 18), gold, 0, 1.38, 0.08).rotateX(Math.PI / 2.4));
  if (a === 'cap') { head.add(mesh(geo('SphereGeometry', 0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), am, 0, 0.04)); head.add(mesh(geo('BoxGeometry', 0.2, 0.015, 0.14), am, 0, 0.05, 0.17)); }
  if (a === 'beanie') head.add(mesh(geo('CylinderGeometry', 0.15, 0.18, 0.16, 14), am, 0, 0.12));
  if (a === 'stetson') { head.add(mesh(geo('CylinderGeometry', 0.32, 0.32, 0.015, 18), am, 0, 0.1)); head.add(mesh(geo('CylinderGeometry', 0.13, 0.16, 0.16, 14), am, 0, 0.18)); }
  if (a === 'headphones') { head.add(mesh(geo('TorusGeometry', 0.19, 0.018, 6, 18, Math.PI), am, 0, 0.02)); for (const sx of [-1, 1]) head.add(mesh(geo('CylinderGeometry', 0.05, 0.05, 0.04, 10), dark, sx * 0.18, 0, 0).rotateZ(Math.PI / 2)); }
  if (a === 'crown') { const c = new THREE.Group(); c.position.y = 0.17; c.add(mesh(geo('CylinderGeometry', 0.12, 0.12, 0.06, 12, 1, true), gold)); for (let i = 0; i < 6; i++) { const sp = mesh(geo('ConeGeometry', 0.025, 0.07, 4), gold, Math.cos(i) * 0.12, 0.06, Math.sin(i) * 0.12); c.add(sp); } head.add(c); }
  if (a === 'bandana') head.add(mesh(geo('TorusGeometry', 0.17, 0.03, 6, 18), am, 0, 0.07).rotateX(Math.PI / 2));
  // arms
  const arms = {};
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * (0.27 * tw), 1.34, 0); body.add(sh);
    const long = ['hoodie', 'jacket', 'suit', 'sequin', 'puffer', 'fringe'].includes(tt); const sleeveless = tt === 'tank' || tt === 'corset' || tt === 'gown' || tt === 'crop';
    sh.add(mesh(geo('CylinderGeometry', 0.065 * w, 0.06 * w, 0.32, 8), sleeveless ? skin : top, 0, -0.16));
    const el = new THREE.Group(); el.position.y = -0.32; sh.add(el);
    el.add(mesh(geo('CylinderGeometry', 0.055 * w, 0.05 * w, 0.3, 8), long ? top : skin, 0, -0.15));
    el.add(mesh(geo('SphereGeometry', 0.055, 10, 8), skin, 0, -0.32));
    sh.rotation.z = sx * 0.12; arms[sx] = { sh, el };
  }
  root.userData = { body, head, arms, legs, torso };
  return root;
};
function hair(head, style, m, w) {
  const cap = (r = 0.18, cut = Math.PI / 2) => { const c = mesh(geo('SphereGeometry', r, 18, 12, 0, Math.PI * 2, 0, cut), m, 0, 0.01); c.rotation.x = -0.45; return c; };
  if (style === 'buzz') { head.add(cap(0.172, Math.PI / 2.1)); return; }
  if (style === 'mohawk') { head.add(cap(0.171, Math.PI / 2.2)); for (let i = 0; i < 5; i++) head.add(mesh(geo('BoxGeometry', 0.04, 0.12, 0.05), m, 0, 0.18 - Math.abs(i - 2) * 0.01, -0.12 + i * 0.06)); return; }
  head.add(cap());
  if (style === 'long') head.add(mesh(geo('BoxGeometry', 0.34, 0.42, 0.12), m, 0, -0.16, -0.1));
  if (style === 'bob') head.add(mesh(geo('CylinderGeometry', 0.19, 0.2, 0.2, 16, 1, true, Math.PI * 0.75, Math.PI * 1.5), m, 0, -0.04));
  if (style === 'curly') for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; head.add(mesh(geo('SphereGeometry', 0.075, 10, 8), m, Math.cos(an) * 0.16, 0.08 + (i % 2) * 0.05, Math.sin(an) * 0.14 - 0.02)); }
  if (style === 'bun') head.add(mesh(geo('SphereGeometry', 0.08, 12, 10), m, 0, 0.22, -0.04));
  if (style === 'spiky') for (let i = 0; i < 9; i++) { const an = i / 9 * Math.PI * 2; const c = mesh(geo('ConeGeometry', 0.04, 0.12, 5), m, Math.cos(an) * 0.1, 0.17, Math.sin(an) * 0.1); c.rotation.set(Math.sin(an) * 0.5, 0, -Math.cos(an) * 0.5); head.add(c); }
  if (style === 'braids') for (const sx of [-1, 1]) head.add(mesh(geo('CylinderGeometry', 0.03, 0.025, 0.55, 6), m, sx * 0.12, -0.25, -0.06));
  if (style === 'ponytail') { const p = mesh(geo('CylinderGeometry', 0.05, 0.03, 0.4, 8), m, 0, 0.0, -0.22); p.rotation.x = 0.5; head.add(p); }
}

// ------------------------------------------------------------------ renderer management
function makeRenderer(el, opts = {}) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: !!opts.alpha, preserveDrawingBuffer: !!opts.keep });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const w = Math.max(10, el.clientWidth), h = Math.max(10, el.clientHeight); r.setSize(w, h);
  r.domElement.style.display = 'block'; r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; r.domElement.style.touchAction = 'pan-y';
  el.appendChild(r.domElement); return r;
}
function mount(el, scene, camera, update, opts = {}) {
  L3.stop();
  const r = makeRenderer(el, opts); const clock = new THREE.Clock(); let raf = 0; let alive = true;
  const fit = () => { const w = Math.max(10, el.clientWidth), h = Math.max(10, el.clientHeight); r.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  fit(); const ro = window.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) ro.observe(el);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loop = () => { if (!alive) return; if (!el.isConnected) { ctl.destroy(); return; } const dt = Math.min(0.05, clock.getDelta()); update(reduce ? dt * 0.3 : dt, clock.elapsedTime); r.render(scene, camera); raf = requestAnimationFrame(loop); };
  const ctl = { r, scene, camera, destroy() { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); try { r.dispose(); r.forceContextLoss && r.forceContextLoss(); } catch (e) { } if (r.domElement.parentNode) r.domElement.remove(); if (L3.active === ctl) L3.active = null; } };
  L3.active = ctl; loop(); return ctl;
}
L3.stop = () => { if (L3.active) L3.active.destroy(); };
function lights(scene, c = 0xffffff) { scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 0.75)); const d = new THREE.DirectionalLight(c, 0.8); d.position.set(2, 4, 3); scene.add(d); }

// drag to spin
function dragSpin(el, target) {
  let down = false, lx = 0, vel = 0;
  const start = e => { down = true; lx = (e.touches ? e.touches[0] : e).clientX; };
  const move = e => { if (!down) return; const x = (e.touches ? e.touches[0] : e).clientX; vel = (x - lx) * 0.012; target.rotation.y += vel; lx = x; };
  const end = () => { down = false; };
  el.addEventListener('pointerdown', start); window.addEventListener('pointermove', move); window.addEventListener('pointerup', end);
  return { tick: () => { if (!down) { target.rotation.y += vel; vel *= 0.94; } }, off: () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); } };
}
function animate(fig, t, k = 1, mode = 'idle') {
  const u = fig.userData; if (!u.body) return;
  if (mode === 'idle') { u.body.position.y = Math.sin(t * 2) * 0.01; u.arms[1].sh.rotation.z = 0.12 + Math.sin(t * 1.5) * 0.03; u.arms[-1].sh.rotation.z = -0.12 - Math.sin(t * 1.5) * 0.03; u.head.rotation.y = Math.sin(t * 0.7) * 0.15; return; }
  const b = Math.abs(Math.sin(t * 4.2)) * 0.05 * k; u.body.position.y = b; u.body.rotation.y = Math.sin(t * 1.4) * 0.35 * k;
  u.arms[1].sh.rotation.x = -1.2 - Math.sin(t * 2) * 0.2; u.arms[1].el.rotation.x = -0.9; // mic hand
  u.arms[-1].sh.rotation.z = -0.4 - Math.abs(Math.sin(t * 2.1)) * 1.4 * k; u.arms[-1].sh.rotation.x = Math.sin(t * 2.1) * 0.3;
  u.head.rotation.x = Math.sin(t * 4.2) * 0.08 * k;
  for (const sx of [-1, 1]) { const lg = u.legs.userData[sx]; if (lg) lg.rotation.x = Math.sin(t * 4.2 + (sx > 0 ? 0 : Math.PI)) * 0.15 * k; }
}

// ------------------------------------------------------------------ preview
L3.preview = function (el, look, opts = {}) {
  if (!L3.available()) return null;
  const scene = new THREE.Scene(); lights(scene);
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50); cam.position.set(0, 1.15, opts.close ? 2.6 : 4.6); cam.lookAt(0, opts.close ? 1.35 : 0.95, 0);
  const holder = new THREE.Group(); scene.add(holder); let fig = L3.figure(look); holder.add(fig);
  const floor = mesh(geo('CircleGeometry', 0.9, 32), mat(opts.floor || '#000000', { basic: true, opacity: 0.18 })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.005; scene.add(floor);
  const spin = dragSpin(el, holder); holder.rotation.y = opts.rot || -0.35;
  const ctl = mount(el, scene, cam, (dt, t) => { spin.tick(); animate(fig, t); }, { alpha: true });
  const d0 = ctl.destroy; ctl.destroy = () => { spin.off(); d0(); };
  ctl.update = l => { holder.remove(fig); fig = L3.figure(l); holder.add(fig); };
  return ctl;
};

// ------------------------------------------------------------------ portrait (separate small renderer)
let pr = null;
L3.portrait = function (look, size = 240, bg = '#2a2350') {
  if (!L3.available()) return null;
  const key = JSON.stringify(look) + size + bg; if (L3.portraitCache[key]) return L3.portraitCache[key];
  try {
    if (!pr) { pr = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false }); }
    pr.setPixelRatio(1); pr.setSize(size, size);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(bg); lights(scene);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0.5, 1.55, 2.75); cam.lookAt(0, 1.42, 0);
    const fig = L3.figure(look); fig.rotation.y = 0.25; animate(fig, 0.3); scene.add(fig);
    pr.render(scene, cam); const url = pr.domElement.toDataURL('image/png');
    L3.portraitCache[key] = url; return url;
  } catch (e) { return null; }
};

// ------------------------------------------------------------------ stage
function ledTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const t = new THREE.CanvasTexture(c); return { c, ctx: c.getContext('2d'), t };
}
L3.stage = function (el, look, opts = {}) {
  if (!L3.available()) return null;
  const D = DD(); const mode = opts.mode || 'show';
  const scene = new THREE.Scene(); const concept = D.CONCEPTS.find(c => c.id === opts.concept) || null;
  const bg = mode === 'video' && concept ? concept.bg : mode === 'awards' ? '#120c1c' : '#07060d';
  scene.background = new THREE.Color(bg); scene.fog = new THREE.Fog(bg, 10, 32);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222244, mode === 'video' ? 0.9 : 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.7); key.position.set(1, 5, 4); scene.add(key);
  const accent = new THREE.Color(opts.accent || (concept ? concept.accent : '#ff4f79'));
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
  const fig = L3.figure(look); scene.add(fig);
  const mic = mesh(geo('CylinderGeometry', 0.015, 0.012, 0.18, 6), mat('#222')); mic.position.set(0, -0.36, 0.05); fig.userData.arms[1].el.add(mic);
  const things = []; let crowd = null, heads = null, N = 0, crowdBase = [];
  let screen = null;
  if (mode !== 'video') {
    const stage = mesh(geo('BoxGeometry', 9, 0.5, 4.5), mat('#1b1b26'), 0, -0.25, 0); scene.add(stage);
    const edge = mesh(geo('BoxGeometry', 9, 0.04, 0.05), mat(accent.getStyle(), { basic: true }), 0, 0.01, 2.25); scene.add(edge);
    const floor = mesh(geo('PlaneGeometry', 60, 60), mat('#0c0b12')); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.5; scene.add(floor);
    screen = ledTexture(); const sm = new THREE.MeshBasicMaterial({ map: screen.t }); const scr = mesh(geo('PlaneGeometry', 8, 3.6), sm, 0, 2.3, -2.2); scene.add(scr);
    for (const sx of [-4.6, 4.6]) scene.add(mesh(geo('BoxGeometry', 0.15, 5, 0.15), mat('#333'), sx, 2, -1.5));
    scene.add(mesh(geo('BoxGeometry', 9.4, 0.15, 0.15), mat('#333'), 0, 4.5, -1.5));
    // spotlight cones
    for (let i = 0; i < 6; i++) {
      const cone = mesh(geo('ConeGeometry', 0.9, 4.4, 16, 1, true), mat(i % 2 ? accent.getStyle() : '#ffffff', { basic: true, opacity: 0.12, add: true, side: THREE.DoubleSide }));
      cone.position.set(-3.75 + i * 1.5, 2.3, -1.2); scene.add(cone); things.push({ o: cone, ph: i, kind: 'beam' });
    }
    const pl = new THREE.PointLight(accent, 1.4, 12); pl.position.set(0, 3, 2); scene.add(pl); things.push({ o: pl, kind: 'light' });
    // crowd
    const cap = opts.cap || 2000; const fill = Math.max(0.05, Math.min(1, opts.crowd != null ? opts.crowd : 0.7));
    N = Math.round(Math.min(420, 30 + Math.sqrt(cap) * 2.4) * (mode === 'awards' ? 0.6 : Math.max(0.25, fill)));
    if (mode === 'tv') N = Math.min(N, 80);
    const cg = new THREE.CylinderGeometry(0.14, 0.16, 0.7, 6), hg = new THREE.SphereGeometry(0.12, 8, 6);
    crowd = new THREE.InstancedMesh(cg, mat('#2b2a3a'), N); heads = new THREE.InstancedMesh(hg, mat('#7c6a5c'), N);
    const m4 = new THREE.Matrix4(); const cols = D.SKINS;
    for (let i = 0; i < N; i++) { const row = Math.floor(i / 28); const x = (i % 28 - 13.5) * 0.42 + (Math.random() - 0.5) * 0.25; const z = 3.2 + row * 0.6 + Math.random() * 0.2; crowdBase.push([x, z, Math.random() * 6]); m4.setPosition(x, -0.15, z); crowd.setMatrixAt(i, m4); m4.setPosition(x, 0.32, z); heads.setMatrixAt(i, m4);
      if (heads.setColorAt) heads.setColorAt(i, new THREE.Color(cols[i % cols.length])); }
    scene.add(crowd); scene.add(heads);
  } else {
    const floor = mesh(geo('PlaneGeometry', 60, 60), mat(concept ? concept.floor : '#333')); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    propsFor(scene, concept ? concept.id : 'studio', things);
  }
  const caption = opts.caption || '';
  let excite = opts.crowd != null ? opts.crowd : 0.7; let cut = 0, cutT = 0; let flash = 0;
  const shots = mode === 'video'
    ? [[0, 1.4, 4, 0, 1.2, 0], [1.6, 1.6, 2.2, 0, 1.4, 0], [-2.5, 0.6, 3, 0, 1.2, 0], [0, 3.5, 5, 0, 1, 0]]
    : [[0, 2.2, 9, 0, 1.2, 0], [0.4, 1.55, 2.4, 0, 1.45, 0], [4.5, 1.2, 4.5, 0, 1.2, 0], [-1.5, 1.0, 11, 0, 1.4, 0], [-3.8, 2.6, 3.2, 0, 1.2, 0]];
  const setShot = i => { const s = shots[i % shots.length]; cam.position.set(s[0], s[1], s[2]); cam.lookAt(s[3], s[4], s[5]); };
  setShot(0);
  const m4 = new THREE.Matrix4();
  const ctl = mount(el, scene, cam, (dt, t) => {
    animate(fig, t, mode === 'video' ? 0.8 : 0.6 + excite * 0.6, 'dance');
    cutT += dt; if (cutT > 3.2 && opts.cuts !== false) { cutT = 0; cut++; setShot(cut); }
    cam.position.x += Math.sin(t * 0.3) * 0.002;
    for (const th of things) {
      if (th.kind === 'beam') { th.o.rotation.z = Math.sin(t * 0.8 + th.ph) * 0.45; th.o.material.opacity = 0.08 + 0.08 * excite + flash * 0.2; }
      if (th.kind === 'light') th.o.intensity = 1 + Math.sin(t * 6) * 0.4 * excite + flash * 2;
      if (th.kind === 'spin') th.o.rotation.y += dt * 0.6;
      if (th.kind === 'float') th.o.position.y = th.y + Math.sin(t + th.ph) * 0.15;
      if (th.kind === 'twinkle') th.o.material.opacity = 0.5 + Math.sin(t * 3) * 0.3;
    }
    if (crowd) {
      for (let i = 0; i < N; i++) { const [x, z, p] = crowdBase[i]; const j = Math.max(0, Math.sin(t * 7 + p)) * 0.22 * excite * (mode === 'awards' ? 0.2 : 1); m4.setPosition(x, -0.15 + j, z); crowd.setMatrixAt(i, m4); m4.setPosition(x, 0.32 + j, z); heads.setMatrixAt(i, m4); }
      crowd.instanceMatrix.needsUpdate = true; heads.instanceMatrix.needsUpdate = true;
    }
    if (screen && Math.floor(t * 12) !== screen.f) {
      screen.f = Math.floor(t * 12); const g = screen.ctx; g.fillStyle = '#05040a'; g.fillRect(0, 0, 256, 128);
      for (let i = 0; i < 24; i++) { const hgt = (Math.sin(t * 3 + i * 0.7) * 0.5 + 0.5) * 100 * (0.4 + excite * 0.6); g.fillStyle = i % 3 ? accent.getStyle() : '#ffffff'; g.globalAlpha = 0.75; g.fillRect(6 + i * 10.3, 120 - hgt, 7, hgt); }
      g.globalAlpha = 1; if (caption) { g.fillStyle = '#fff'; g.font = 'bold 18px sans-serif'; g.textAlign = 'center'; g.fillText(caption.slice(0, 24), 128, 26); }
      screen.t.needsUpdate = true;
    }
    flash = Math.max(0, flash - dt * 1.5);
  });
  ctl.setCrowd = x => { excite = Math.max(0, Math.min(1, x)); };
  ctl.flash = () => { flash = 1; };
  ctl.cut = () => { cut++; cutT = 0; setShot(cut); };
  return ctl;
};
function propsFor(scene, id, things) {
  const R = (a, b) => a + Math.random() * (b - a);
  if (id === 'city') for (let i = 0; i < 24; i++) { const h = R(2, 7); const b = mesh(geo('BoxGeometry', 1.2, 1, 1.2), mat('#232a45'), (i % 12 - 6) * 1.6, 0, -6 - Math.floor(i / 12) * 2.5); b.scale.y = h; b.position.y = h / 2; scene.add(b);
    for (let k = 0; k < 4; k++) scene.add(mesh(geo('PlaneGeometry', 0.18, 0.25), mat('#ffd36b', { basic: true }), b.position.x + R(-0.4, 0.4), R(0.5, h - 0.3), b.position.z + 0.61)); }
  if (id === 'beach') { const sun = mesh(geo('SphereGeometry', 1.6, 24, 16), mat('#ffe08a', { basic: true }), 0, 2.2, -14); scene.add(sun); const sea = mesh(geo('PlaneGeometry', 60, 12), mat('#2ec4b6')); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.02, -9); scene.add(sea);
    for (const x of [-3, 3.4]) { scene.add(mesh(geo('CylinderGeometry', 0.08, 0.12, 2.6, 6), mat('#8a5a2b'), x, 1.3, -2)); scene.add(mesh(geo('ConeGeometry', 0.9, 0.5, 6), mat('#2f8f46'), x, 2.7, -2)); } }
  if (id === 'space') { const n = 300, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = R(-20, 20); pos[i * 3 + 1] = R(0, 15); pos[i * 3 + 2] = R(-20, -4); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true })); scene.add(pts); things.push({ o: pts, kind: 'twinkle' });
    const pl = mesh(geo('SphereGeometry', 1.4, 24, 16), mat('#a77bff'), 6, 5, -14); scene.add(pl); const ring = mesh(geo('TorusGeometry', 2.1, 0.08, 6, 40), mat('#ffd36b'), 6, 5, -14); ring.rotation.x = 1.9; scene.add(ring); things.push({ o: ring, kind: 'spin' }); }
  if (id === 'desert') for (let i = 0; i < 8; i++) { const x = R(-8, 8), z = R(-10, -3); scene.add(mesh(geo('CylinderGeometry', 0.15, 0.18, 1.6, 8), mat('#3e7d3a'), x, 0.8, z)); scene.add(mesh(geo('CylinderGeometry', 0.08, 0.08, 0.6, 6), mat('#3e7d3a'), x + 0.25, 1.0, z)); }
  if (id === 'forest') for (let i = 0; i < 26; i++) { const x = R(-10, 10), z = R(-12, -2.5); if (Math.abs(x) < 1.5 && z > -4) continue; scene.add(mesh(geo('ConeGeometry', 0.8, 2.6, 7), mat('#1f4a2c'), x, 1.6, z)); scene.add(mesh(geo('CylinderGeometry', 0.1, 0.12, 0.6, 6), mat('#4a3020'), x, 0.3, z)); }
  if (id === 'party') { const ball = mesh(geo('IcosahedronGeometry', 0.5, 1), mat('#e9e9ee', { emissive: new THREE.Color('#333') }), 0, 3.6, -1); scene.add(ball); things.push({ o: ball, kind: 'spin' });
    for (let i = 0; i < 10; i++) { const b = mesh(geo('SphereGeometry', 0.25, 10, 8), mat(['#ff3fa4', '#ffd23f', '#2e8bff'][i % 3]), R(-5, 5), R(1.5, 3.2), R(-6, -2)); scene.add(b); things.push({ o: b, kind: 'float', y: b.position.y, ph: i }); } }
  if (id === 'studio') { const cyc = mesh(geo('CylinderGeometry', 12, 12, 10, 32, 1, true, Math.PI * 0.5, Math.PI), mat('#f2f2f6', { basic: true, side: THREE.BackSide }), 0, 5, 0); scene.add(cyc); }
}
})();
