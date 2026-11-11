/* Final Cut: 3D actor, red carpet, film set and awards stage (three.js r128). Adapted from the
   Platinum Rush figure code. Figures are stylised toy-like characters built from simple shapes. */
(function () {
function rnd(a, b) { return a + Math.random() * (b - a); }
const L3 = window.L3 = { ok: null, active: null, portraitCache: {} };
const DD = () => window.FCD;

L3.available = () => {
  if (L3.ok !== null) return L3.ok;
  try { if (!window.THREE) throw 0; const c = document.createElement('canvas'); L3.ok = !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
  catch (e) { L3.ok = false; }
  try { if (localStorage.getItem('fc-3d') === 'off') L3.ok = false; } catch (e) { }
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
  const D = DD(); look = Object.assign({}, window.FC ? window.FC.defaultLook() : {}, look || {});
  if (look.top === 'hero') look = Object.assign({}, look, { bottom: 'hero', bottomColor: look.topColor, shoes: 'boots', shoesColor: shade(look.topColor, -0.35) });
  if (look.top === 'tux') look = Object.assign({}, look, { bottom: 'slacks', bottomColor: '#15151b' });
  const w = (D.BODIES.find(b => b.id === look.body) || { w: 1 }).w;
  const skin = mat(look.skin), top = mat(look.topColor, look.top === 'sequin' ? { emissive: new THREE.Color(look.topColor).multiplyScalar(0.35) } : {}),
    bottom = mat(look.bottomColor), shoe = mat(look.shoesColor), hairM = mat(look.hairColor), dark = mat('#1d1d24'), white = mat('#f4f4f6'), gold = mat('#f2c14e', { emissive: new THREE.Color('#5a4000') });
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const gown = look.top === 'gown'; const hero = look.top === 'hero';
  const hh = (D.HEIGHTS.find(x => x.id === look.height) || { h: 1 }).h; root.scale.set(1, hh, 1);
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
    else if (st === 'heels') { sh = new THREE.Group(); sh.add(mesh(geo('BoxGeometry', 0.1, 0.05, 0.2), shoe, 0, -0.77, 0.05)); sh.add(mesh(geo('CylinderGeometry', 0.012, 0.012, 0.09, 6), shoe, 0, -0.81, -0.05)); }
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
  if (tt === 'tux') { torso.add(mesh(geo('BoxGeometry', 0.12, 0.3, 0.05), white, 0, 0.42, 0.19 * tw)); torso.add(mesh(geo('BoxGeometry', 0.1, 0.035, 0.03), dark, 0, 0.58, 0.215 * tw)); }
  if (hero) { torso.add(mesh(geo('CylinderGeometry', 0.07, 0.07, 0.02, 5), mat(look.accColor || '#c9a227', { emissive: new THREE.Color(look.accColor || '#c9a227').multiplyScalar(0.3) }), 0, 0.42, 0.2 * tw).rotateX(Math.PI / 2));
    torso.add(mesh(geo('BoxGeometry', 0.4 * tw, 0.05, 0.4 * tw), mat(shade(look.topColor, -0.3)), 0, 0.04, 0));
    const cape = mesh(geo('PlaneGeometry', 0.5 * tw, 1.2), mat(shade(look.topColor, -0.45), { basic: false }), 0, 0.02, -0.21 * tw); cape.material.side = THREE.DoubleSide; cape.rotation.x = 0.12; torso.add(cape); root.userData.cape = cape; }
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
  const fs = D.FACES.find(f => f.id === look.face) || { sx: 1, sy: 1 }; head.children[0].scale.set(fs.sx, fs.sy, 1);
  const ns = (D.NOSES.find(n => n.id === look.nose) || { s: 1 }).s, ls = (D.LIPS.find(n => n.id === look.lips) || { s: 1 }).s;
  head.children.forEach(c => { if (c.position.y === -0.02 && c.position.z === 0.17) c.scale.setScalar(ns); if (c.position.y === -0.07) c.scale.set(1, ls, ls); });
  const browM = mat(shade(look.hairColor, -0.2)); const bw = look.brows === 'thick' ? 0.02 : 0.012;
  for (const sx of [-1, 1]) { const b = mesh(geo('BoxGeometry', 0.06, bw, 0.012), browM, sx * 0.06, 0.065, 0.158); if (look.brows === 'arched') b.rotation.z = -sx * 0.25; if (look.brows === 'soft') b.rotation.z = sx * 0.12; head.add(b); }
  const fh = look.facial;
  if (fh === 'stubble') head.add(mesh(geo('SphereGeometry', 0.168, 16, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.35), mat(shade(look.skin, -0.28)), 0, 0.005, 0.004));
  if (fh === 'beard') head.add(mesh(geo('SphereGeometry', 0.175, 16, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.4), hairM, 0, 0, 0.006));
  if (fh === 'mustache' || fh === 'goatee') head.add(mesh(geo('BoxGeometry', 0.08, 0.018, 0.02), hairM, 0, -0.05, 0.165));
  if (fh === 'goatee') head.add(mesh(geo('BoxGeometry', 0.045, 0.05, 0.03), hairM, 0, -0.12, 0.15));
  hair(head, look.hair, hairM, w);
  // accessories
  const a = look.acc, am = mat(look.accColor || '#ffd23f');
  if (a === 'glasses') for (const sx of [-1, 1]) head.add(mesh(geo('TorusGeometry', 0.035, 0.007, 6, 14), dark, sx * 0.06, 0.02, 0.165));
  if (a === 'earrings') for (const sx of [-1, 1]) head.add(mesh(geo('SphereGeometry', 0.014, 8, 6), gold, sx * 0.175, -0.05, 0.01));
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
  if (style === 'slick') head.add(mesh(geo('SphereGeometry', 0.18, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2.3), m, 0, 0.01, -0.01));
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
  if (mode === 'pose') { u.body.position.y = 0; u.body.rotation.y = Math.sin(t * 0.5) * 0.25; u.arms[1].sh.rotation.z = 0.12; u.arms[-1].sh.rotation.z = -0.5; u.arms[-1].el.rotation.x = -0.6; u.head.rotation.y = Math.sin(t * 0.7) * 0.2; return; }
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

// ------------------------------------------------------------------ scenes: carpet, set, awards
L3.scene = function (el, look, opts = {}) {
  if (!L3.available()) return null;
  const mode = opts.mode || 'carpet';
  const scene = new THREE.Scene(); const bg = mode === 'set' ? '#1a1d24' : mode === 'awards' ? '#120d08' : mode === 'theater' ? '#0a0607' : mode === 'studio' ? '#0b0d16' : '#0d0f14';
  scene.background = new THREE.Color(bg); scene.fog = new THREE.Fog(bg, 9, 30);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.65)); const key = new THREE.DirectionalLight(0xffffff, 0.75); key.position.set(2, 5, 4); scene.add(key);
  const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
  const fig = L3.figure(look); scene.add(fig);
  const things = [];
  if (mode === 'carpet') {
    const floor = mesh(geo('PlaneGeometry', 60, 60), mat('#16141a')); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const carpet = mesh(geo('PlaneGeometry', 2.2, 30), mat('#8f1d2c')); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.01, -4); scene.add(carpet);
    const wall = mesh(geo('PlaneGeometry', 14, 4.5), mat('#e9e4d8'), 0, 2.25, -2.2); scene.add(wall);
    const logoC = document.createElement('canvas'); logoC.width = 512; logoC.height = 192; const g = logoC.getContext('2d'); g.fillStyle = '#e9e4d8'; g.fillRect(0, 0, 512, 192);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.fillStyle = (r + c) % 2 ? '#8f1d2c' : '#1d1d24'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillText((r + c) % 2 ? (opts.title || 'PREMIERE').toUpperCase().slice(0, 16) : 'FINAL CUT', 64 + c * 128, 34 + r * 46); }
    const tex = new THREE.CanvasTexture(logoC); const wm = new THREE.MeshBasicMaterial({ map: tex }); const w2 = mesh(geo('PlaneGeometry', 9, 3.4), wm, 0, 2, -2.19); scene.add(w2);
    for (const sx of [-1.4, 1.4]) for (let i = 0; i < 6; i++) { const post = mesh(geo('CylinderGeometry', 0.04, 0.05, 0.9, 8), mat('#c9a227'), sx, 0.45, -1 - i * 1.6); scene.add(post); }
    // photographers' flashes
    for (let i = 0; i < 14; i++) { const f = mesh(geo('SphereGeometry', 0.06, 8, 6), mat('#ffffff', { basic: true, opacity: 0, add: true }), (i % 2 ? 1 : -1) * rnd(2.2, 4), rnd(1.2, 2.2), rnd(0.5, 4)); scene.add(f); things.push({ o: f, kind: 'flash', ph: Math.random() * 10 }); }
    fig.position.z = 0.3;
  } else if (mode === 'set') {
    const floor = mesh(geo('PlaneGeometry', 60, 60), mat('#2a2d36')); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const green = mesh(geo('CylinderGeometry', 6, 6, 6, 32, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#2fbf4a', { basic: true, side: THREE.BackSide }), 0, 3, 1.5); scene.add(green);
    const camBody = new THREE.Group(); camBody.position.set(1.8, 0, 3); scene.add(camBody);
    camBody.add(mesh(geo('CylinderGeometry', 0.03, 0.03, 1.4, 6), mat('#333'), 0, 0.7, 0)); camBody.add(mesh(geo('BoxGeometry', 0.35, 0.28, 0.5), mat('#1d1d24'), 0, 1.5, 0)); camBody.add(mesh(geo('CylinderGeometry', 0.1, 0.12, 0.25, 12), mat('#111'), 0, 1.5, -0.35).rotateX(Math.PI / 2));
    camBody.rotation.y = 0.5; things.push({ o: camBody, kind: 'pan' });
    for (const sx of [-2.4, 2.6]) { scene.add(mesh(geo('CylinderGeometry', 0.03, 0.03, 2.2, 6), mat('#444'), sx, 1.1, 1)); const l = mesh(geo('BoxGeometry', 0.5, 0.4, 0.2), mat('#f2f2f6', { basic: true }), sx, 2.3, 1); l.lookAt(0, 1, 0); scene.add(l); }
    const sl = new THREE.PointLight(0xfff1d6, 0.8, 10); sl.position.set(0, 3, 3); scene.add(sl);
    // tracking markers
    for (let i = 0; i < 12; i++) scene.add(mesh(geo('BoxGeometry', 0.08, 0.08, 0.01), mat('#ffffff', { basic: true }), rnd(-4, 4), rnd(0.5, 5), rnd(-3.5, -2.5)));
  } else if (mode === 'theater') {
    const floor = mesh(geo('PlaneGeometry', 60, 60), mat('#120a0a')); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const stage = mesh(geo('BoxGeometry', 9, 0.6, 4.5), mat('#3a2616'), 0, 0.3, -0.6); scene.add(stage); fig.position.y = 0.6;
    const gold = mat('#a07a2a'); const red = mat('#7a1020');
    scene.add(mesh(geo('BoxGeometry', 0.6, 5.5, 0.6), gold, -4.6, 3, 1.5)); scene.add(mesh(geo('BoxGeometry', 0.6, 5.5, 0.6), gold, 4.6, 3, 1.5)); scene.add(mesh(geo('BoxGeometry', 9.8, 0.7, 0.6), gold, 0, 5.6, 1.5));
    for (const sx of [-1, 1]) { const cur = mesh(geo('BoxGeometry', 1.8, 5, 0.15), red, sx * 3.5, 3.1, 1.3); scene.add(cur); for (let i = 0; i < 5; i++) scene.add(mesh(geo('CylinderGeometry', 0.09, 0.09, 5, 6), mat('#5e0c18'), sx * (2.75 + i * 0.36), 3.1, 1.38)); }
    scene.add(mesh(geo('BoxGeometry', 9, 0.9, 0.2), red, 0, 4.9, 1.35));
    const back = mesh(geo('PlaneGeometry', 9, 5), mat('#1c1418'), 0, 3, -2.8); scene.add(back);
    for (let i = 0; i < 12; i++) { const f = mesh(geo('SphereGeometry', 0.06, 8, 6), mat('#ffe8b0', { basic: true }), -4 + i * 0.73, 0.65, 1.55); scene.add(f); }
    const seat = mat('#5a0f1a'); for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { scene.add(mesh(geo('BoxGeometry', 0.45, 0.5, 0.45), seat, -4.2 + c * 0.65, 0.25 + r * 0.25, 3.2 + r * 0.8)); if ((r * 14 + c) % 3) scene.add(mesh(geo('SphereGeometry', 0.13, 8, 6), mat(DD().SKINS[(r + c) % DD().SKINS.length]), -4.2 + c * 0.65, 0.75 + r * 0.25, 3.3 + r * 0.8)); }
    const spot = new THREE.SpotLight(0xfff1d6, 1.6, 22, 0.28, 0.5); spot.position.set(0, 9, 6); spot.target = fig; scene.add(spot);
  } else if (mode === 'studio') {
    const floor = mesh(geo('PlaneGeometry', 60, 60), mat('#14161f')); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const sky = document.createElement('canvas'); sky.width = 512; sky.height = 256; const g2 = sky.getContext('2d');
    const grd = g2.createLinearGradient(0, 0, 0, 256); grd.addColorStop(0, opts.snl ? '#1a0f2e' : '#0e1a3a'); grd.addColorStop(1, opts.snl ? '#3a1530' : '#2a3a6a'); g2.fillStyle = grd; g2.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 40; i++) { const w = 8 + Math.random() * 20, h = 40 + Math.random() * 150, x = Math.random() * 512; g2.fillStyle = '#0b0f1c'; g2.fillRect(x, 256 - h, w, h); g2.fillStyle = '#ffd98a'; for (let k = 0; k < 6; k++) g2.fillRect(x + 2 + Math.random() * (w - 4), 256 - h + Math.random() * h, 2, 2); }
    if (opts.snl) { g2.fillStyle = '#ffffff'; g2.font = 'bold 28px sans-serif'; g2.textAlign = 'center'; g2.fillText('LIVE FROM NEW YORK', 256, 50); }
    scene.add(mesh(geo('PlaneGeometry', 12, 6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sky) }), 0, 3, -3));
    if (opts.snl) { const st = mesh(geo('CylinderGeometry', 2.4, 2.6, 0.25, 32), mat('#6b5a8a'), 0, 0.12, 0); scene.add(st); fig.position.y = 0.25;
      for (let i = 0; i < 16; i++) { const b = mesh(geo('SphereGeometry', 0.08, 8, 6), mat(i % 2 ? '#ffd23f' : '#ff4f79', { basic: true }), Math.cos(i / 16 * Math.PI) * 3.2, 0.3 + Math.sin(i / 16 * Math.PI) * 4, -2.9); scene.add(b); things.push({ o: b, kind: 'twinkle', ph: i }); } }
    else { const desk = mesh(geo('BoxGeometry', 1.6, 0.9, 0.8), mat('#5b3a22'), 1.6, 0.45, -0.4); scene.add(desk); const couch = mesh(geo('BoxGeometry', 2, 0.45, 0.8), mat('#3c4a7a'), -0.7, 0.25, -0.6); scene.add(couch); scene.add(mesh(geo('BoxGeometry', 2, 0.6, 0.2), mat('#33406b'), -0.7, 0.6, -0.95)); scene.add(mesh(geo('CylinderGeometry', 0.05, 0.05, 0.25, 8), mat('#eeeeee'), 1.3, 1.02, -0.4)); fig.position.set(-0.3, 0, 0.2); }
    const hl = new THREE.PointLight(0xffffff, 0.7, 12); hl.position.set(0, 4, 4); scene.add(hl);
  } else {
    const floor = mesh(geo('PlaneGeometry', 60, 60), mat('#1a120c')); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const stage = mesh(geo('CylinderGeometry', 3, 3.2, 0.4, 40), mat('#2b1e12'), 0, 0.2, 0); scene.add(stage); fig.position.y = 0.4;
    const pod = mesh(geo('BoxGeometry', 0.6, 1.1, 0.4), mat('#6b4f1d'), 1.1, 0.95, 0.4); scene.add(pod);
    const statue = new THREE.Group(); statue.position.set(-2.2, 0.4, -1.4); scene.add(statue);
    statue.add(mesh(geo('CylinderGeometry', 0.35, 0.4, 0.4, 16), mat('#111'), 0, 0.2)); statue.add(mesh(geo('CylinderGeometry', 0.15, 0.2, 2.2, 10), mat('#b8902a'), 0, 1.5)); statue.add(mesh(geo('SphereGeometry', 0.17, 12, 10), mat('#b8902a'), 0, 2.75));
    for (let i = 0; i < 9; i++) { const arch = mesh(geo('TorusGeometry', 4 + i * 0.4, 0.03, 6, 40, Math.PI), mat('#c9a227', { basic: true, opacity: 0.5 - i * 0.04 }), 0, 0.3, -3 - i * 0.3); scene.add(arch); }
    if (opts.win) { const t = new THREE.Group(); t.add(mesh(geo('CylinderGeometry', 0.03, 0.04, 0.24, 8), mat('#d4a92a', { emissive: new THREE.Color('#4a3400') }), 0, 0.12)); t.add(mesh(geo('SphereGeometry', 0.035, 8, 8), mat('#d4a92a'), 0, 0.27)); t.position.set(0, -0.35, 0.05); fig.userData.arms[1].el.add(t); }
    const spot = new THREE.SpotLight(0xfff1d6, 1.4, 20, 0.35, 0.5); spot.position.set(0, 9, 4); spot.target = fig; scene.add(spot);
  }
  const shots = mode === 'theater' ? [[0, 2.2, 9, 0, 1.8, 0], [1.2, 1.6, 4, 0, 1.6, 0], [-3, 3, 7, 0, 1.6, 0]] : mode === 'studio' ? [[0, 1.6, 5, 0, 1.2, 0], [2.2, 1.5, 3.4, 0, 1.3, 0], [-1.6, 1.4, 3.2, 0, 1.3, 0]] : mode === 'carpet' ? [[0, 1.5, 4.4, 0, 1.2, 0], [1.8, 1.4, 2.6, 0, 1.4, 0], [-2, 1, 3.2, 0, 1.2, 0]] : mode === 'set' ? [[0, 1.5, 4.2, 0, 1.1, 0], [1.6, 1.5, 2.8, 0, 1.4, 0], [-1.4, 2.4, 3.4, 0, 1.2, 0]] : [[0, 1.6, 5.5, 0, 1.4, 0], [0.6, 2, 2.6, 0, 1.8, 0], [-3, 1.4, 5, 0, 1.3, 0]];
  let cut = 0, cutT = 0; const setShot = i => { const s = shots[i % shots.length]; cam.position.set(s[0], s[1], s[2]); cam.lookAt(s[3], s[4], s[5]); }; setShot(0);
  const ctl = mount(el, scene, cam, (dt, t) => {
    animate(fig, t, 1, opts.win || mode === 'carpet' || mode === 'theater' ? 'pose' : 'idle');
    if (fig.userData.cape) fig.userData.cape.rotation.x = 0.12 + Math.sin(t * 2) * 0.05;
    cutT += dt; if (cutT > 3.6) { cutT = 0; cut++; setShot(cut); }
    for (const th of things) {
      if (th.kind === 'flash') { const v = Math.sin(t * 3 + th.ph); th.o.material.opacity = v > 0.96 ? 1 : 0; th.o.scale.setScalar(v > 0.96 ? 3 : 1); }
      if (th.kind === 'twinkle') th.o.visible = Math.sin(t * 4 + th.ph) > -0.3;
      if (th.kind === 'pan') th.o.rotation.y = 0.5 + Math.sin(t * 0.4) * 0.15;
    }
  });
  return ctl;
};
})();
