/* Final Cut: 3D (three.js r128). Stylised but detailed actors, themed film sets, event scenes,
   red carpets, stages and trailers. Everything is built from primitives at runtime: no model files. */
(function () {
const L3 = window.L3 = { ok: null, active: null, portraitCache: {} };
const DD = () => window.FCD;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

L3.available = () => {
  if (L3.ok !== null) return L3.ok;
  try { if (!window.THREE) throw 0; const c = document.createElement('canvas'); L3.ok = !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
  catch (e) { L3.ok = false; }
  try { if (localStorage.getItem('fc-3d') === 'off') L3.ok = false; } catch (e) { }
  return L3.ok;
};

// ------------------------------------------------------------------ helpers
const matCache = {};
function mat(color, o = {}) {
  const key = color + JSON.stringify(o); if (matCache[key]) return matCache[key];
  let m;
  if (o.basic) m = new THREE.MeshBasicMaterial({ color, transparent: o.opacity != null, opacity: o.opacity != null ? o.opacity : 1, side: o.side || THREE.FrontSide, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !o.add });
  else m = new THREE.MeshStandardMaterial({ color, roughness: o.rough != null ? o.rough : 0.7, metalness: o.metal || 0, emissive: o.emissive || 0x000000, emissiveIntensity: o.ei || 1, side: o.side || THREE.FrontSide, transparent: o.opacity != null, opacity: o.opacity != null ? o.opacity : 1, flatShading: !!o.flat });
  matCache[key] = m; return m;
}
function shade(hex, p) {
  let c = String(hex).replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(Math.max(0, Math.min(255, p < 0 ? v * (1 + p) : v + (255 - v) * p)));
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}
function mix(a, b, t) { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, t).getHexString(); }
const G = {};
function geo(kind, ...a) { const k = kind + a.join(','); if (G[k]) return G[k]; G[k] = new THREE[kind](...a); return G[k]; }
function mesh(g, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; }
function put(p, m) { p.add(m); return m; }
function grp(x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); return g; }
// a limb segment hanging down from its joint: tapered cylinder plus a rounded end
function seg(len, r0, r1, m, endBall = true) {
  const g = new THREE.Group();
  g.add(mesh(geo('CylinderGeometry', r0, r1, len, 14), m, 0, -len / 2, 0));
  g.add(mesh(geo('SphereGeometry', r0, 14, 10), m));
  if (endBall) g.add(mesh(geo('SphereGeometry', r1, 14, 10), m, 0, -len, 0));
  return g;
}
const LATHE = {};
function lathe(key, pts, segs = 28) { if (LATHE[key]) return LATHE[key]; LATHE[key] = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), segs); return LATHE[key]; }
function tube(pts, r, m, segs = 24) { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2]))); return new THREE.Mesh(new THREE.TubeGeometry(c, segs, r, 6, false), m); }
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }

// ------------------------------------------------------------------ the figure
const HEAD_R = 0.118;
L3.figure = function (look, o = {}) {
  const D = DD();
  look = Object.assign({}, window.FC ? window.FC.defaultLook() : {}, look || {});
  if (look.top === 'hero') look = Object.assign({}, look, { bottom: 'hero', bottomColor: look.topColor, shoes: 'boots', shoesColor: shade(look.topColor, -0.4) });
  if (look.top === 'tux') look = Object.assign({}, look, { bottom: 'slacks', bottomColor: '#15151b', shoes: look.shoes === 'sneakers' ? 'loafers' : look.shoes, shoesColor: '#111114' });
  if (look.top === 'gown' && look.shoes === 'sneakers') look = Object.assign({}, look, { shoes: 'heels' });
  const w = (D.BODIES.find(b => b.id === look.body) || { w: 1 }).w;
  const hh = (D.HEIGHTS.find(x => x.id === look.height) || { h: 1 }).h;
  const skin = mat(look.skin, { rough: 0.62 }), skinD = mat(shade(look.skin, -0.14), { rough: 0.7 });
  const top = mat(look.topColor, look.top === 'sequin' ? { rough: 0.25, metal: 0.65, emissive: shade(look.topColor, -0.6) } : look.top === 'hero' ? { rough: 0.38, metal: 0.25 } : { rough: 0.8 });
  const topD = mat(shade(look.topColor, -0.3), { rough: 0.8 });
  const bot = mat(look.bottomColor, look.bottom === 'leather' ? { rough: 0.3, metal: 0.2 } : look.bottom === 'hero' ? { rough: 0.38, metal: 0.25 } : { rough: 0.85 });
  const shoe = mat(look.shoesColor, { rough: 0.45 }), white = mat('#f2f2f4', { rough: 0.6 }), dark = mat('#17171c', { rough: 0.5 });
  const gold = mat('#d8b04a', { rough: 0.3, metal: 0.8 });
  const hairM = mat(look.hairColor, { rough: 0.55, metal: 0.05 }), hairD = mat(shade(look.hairColor, -0.25), { rough: 0.6 });
  const root = new THREE.Group(); root.scale.set(1, hh, 1);
  const body = grp(); root.add(body);
  const gown = look.top === 'gown';

  // hips and legs
  const hips = grp(0, 0.89, 0); body.add(hips);
  put(hips, mesh(geo('SphereGeometry', 0.13, 18, 12), bot)).scale.set(1.05 * w, 0.62, 0.78);
  const legs = {};
  for (const sx of [-1, 1]) {
    const thigh = grp(sx * 0.082 * w, -0.03, 0); hips.add(thigh);
    const bt = look.bottom; const legM = bt === 'shorts' || bt === 'skirt' ? skin : bot;
    const th = seg(0.4, 0.076 * w, 0.056 * w, legM); thigh.add(th);
    if (bt === 'shorts') thigh.add(mesh(geo('CylinderGeometry', 0.08 * w, 0.074 * w, 0.2, 14), bot, 0, -0.1, 0));
    const knee = grp(0, -0.4, 0); thigh.add(knee);
    knee.add(seg(0.39, 0.054 * w, 0.04, bt === 'shorts' || bt === 'skirt' ? skin : legM));
    if (bt === 'jeans') knee.add(mesh(geo('CylinderGeometry', 0.045, 0.047, 0.03, 12), mat(shade(look.bottomColor, -0.25)), 0, -0.38, 0));
    const foot = grp(0, -0.4, 0); knee.add(foot);
    const st = look.shoes;
    if (st === 'heels') { put(foot, mesh(geo('BoxGeometry', 0.07, 0.035, 0.17), shoe, 0, -0.02, 0.045)).rotation.x = 0.28; foot.add(mesh(geo('CylinderGeometry', 0.008, 0.006, 0.07, 6), shoe, 0, -0.045, -0.03)); }
    else if (st === 'boots') { foot.add(mesh(geo('CylinderGeometry', 0.05, 0.046, 0.16, 12), shoe, 0, 0.04, 0)); foot.add(mesh(geo('BoxGeometry', 0.09, 0.06, 0.2), shoe, 0, -0.03, 0.04)); }
    else if (st === 'loafers') { foot.add(mesh(geo('BoxGeometry', 0.08, 0.05, 0.19), shoe, 0, -0.025, 0.04)); }
    else { foot.add(mesh(geo('BoxGeometry', 0.09, 0.06, 0.21), shoe, 0, -0.025, 0.045)); foot.add(mesh(geo('BoxGeometry', 0.095, 0.022, 0.22), white, 0, -0.058, 0.045)); }
    legs[sx] = { thigh, knee, foot };
  }
  if (look.bottom === 'skirt' && !gown) { const sk = mesh(lathe('skirt' + w, [[0.12 * w, 0.06], [0.15 * w, 0], [0.2 * w, -0.2], [0.21 * w, -0.24]]), mat(look.bottomColor, { rough: 0.85, side: THREE.DoubleSide }), 0, 0.02, 0); hips.add(sk); }
  if (gown) { const g = mesh(lathe('gown' + w, [[0.11 * w, 0.1], [0.13 * w, 0], [0.17 * w, -0.3], [0.26 * w, -0.7], [0.34 * w, -0.93], [0.34 * w, -0.95]]), top, 0, 0, 0); g.material.side = THREE.DoubleSide; hips.add(g); }

  // torso
  const spine = grp(0, 0.89, 0); body.add(spine);
  const tt = look.top; const bulk = tt === 'puffer' ? 1.18 : tt === 'hoodie' ? 1.06 : 1; const tw = w * bulk;
  const torsoPts = [[0.001, 0], [0.128 * tw, 0.0], [0.122 * tw, 0.12], [0.142 * tw, 0.26], [0.175 * tw, 0.38], [0.185 * tw, 0.46], [0.13 * tw, 0.52], [0.05, 0.545]];
  const crop = tt === 'crop';
  const torso = mesh(lathe('torso' + tw, torsoPts, 24), crop || tt === 'corset' ? skin : top); torso.scale.z = 0.66; spine.add(torso);
  if (crop) { const t2 = mesh(lathe('crop' + tw, torsoPts.slice(3), 24), top); t2.scale.set(1.04, 1, 0.7); spine.add(t2); }
  if (tt === 'corset') { const c = mesh(lathe('cors' + w, [[0.13 * w, 0.02], [0.124 * w, 0.14], [0.146 * w, 0.3], [0.18 * w, 0.42], [0.186 * w, 0.47], [0.15 * w, 0.5]], 24), top); c.scale.z = 0.7; spine.add(c); for (let i = 0; i < 5; i++) spine.add(mesh(geo('BoxGeometry', 0.06, 0.006, 0.006), gold, 0, 0.08 + i * 0.065, 0.085 * w)); }
  if (tt === 'tank') for (const sx of [-1, 1]) spine.add(mesh(geo('BoxGeometry', 0.025, 0.12, 0.02), top, sx * 0.09 * w, 0.48, 0.05));
  // necklines and jackets
  if (['tee', 'hoodie', 'puffer', 'sequin', 'hero'].includes(tt)) put(spine, mesh(geo('TorusGeometry', 0.05, 0.012, 8, 20), tt === 'hero' ? topD : top, 0, 0.53, 0.005)).rotation.x = Math.PI / 2;
  if (['jacket', 'suit', 'tux'].includes(tt)) {
    const inner = tt === 'jacket' ? mat(look.accColor && look.accColor !== look.topColor ? '#e9e6df' : '#e9e6df') : white;
    spine.add(mesh(geo('BoxGeometry', 0.1, 0.34, 0.02), inner, 0, 0.36, 0.105 * w));
    for (const sx of [-1, 1]) { const lap = mesh(geo('BoxGeometry', 0.055, 0.26, 0.015), tt === 'tux' ? mat('#0c0c10', { rough: 0.25 }) : topD, sx * 0.055, 0.38, 0.11 * w); lap.rotation.z = sx * 0.32; spine.add(lap); }
    if (tt === 'tux') { spine.add(mesh(geo('BoxGeometry', 0.07, 0.028, 0.02), dark, 0, 0.5, 0.115 * w)); spine.add(mesh(geo('SphereGeometry', 0.012, 8, 6), dark, 0, 0.5, 0.122 * w)); }
    if (tt === 'suit') { const tie = mesh(geo('BoxGeometry', 0.028, 0.2, 0.01), mat(look.accColor || '#8f1d2c'), 0, 0.38, 0.118 * w); spine.add(tie); }
  }
  if (tt === 'hoodie') { const hood = mesh(geo('SphereGeometry', 0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), top, 0, 0.5, -0.07); hood.rotation.x = -2.2; hood.scale.set(1, 0.7, 0.8); spine.add(hood); spine.add(mesh(geo('BoxGeometry', 0.16, 0.08, 0.02), topD, 0, 0.12, 0.11 * w)); for (const sx of [-1, 1]) spine.add(mesh(geo('CylinderGeometry', 0.004, 0.004, 0.1, 5), white, sx * 0.025, 0.45, 0.115 * w)); }
  if (tt === 'puffer') for (let i = 0; i < 4; i++) { const r = mesh(geo('TorusGeometry', 0.155 * tw * (0.85 + i * 0.05), 0.012, 6, 24), topD, 0, 0.1 + i * 0.11, 0); r.rotation.x = Math.PI / 2; r.scale.y = 0.68; spine.add(r); }
  if (tt === 'hero') {
    const em = mat(look.accColor || '#d8b04a', { rough: 0.3, metal: 0.6, emissive: shade(look.accColor || '#d8b04a', -0.5) });
    const emb = mesh(geo('CylinderGeometry', 0.055, 0.055, 0.012, 5), em, 0, 0.38, 0.112 * w); emb.rotation.x = Math.PI / 2; spine.add(emb);
    put(spine, mesh(geo('TorusGeometry', 0.125 * w, 0.014, 6, 26), em, 0, 0.03, 0)).rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) put(spine, mesh(geo('SphereGeometry', 0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), topD, sx * 0.17 * w, 0.45, 0)).scale.set(1, 0.6, 0.9);
    const cape = mesh(new THREE.PlaneGeometry(0.4 * w, 1.05, 4, 8), mat(shade(look.topColor, -0.5), { side: THREE.DoubleSide, rough: 0.7 }), 0, -0.02, -0.1); spine.add(cape); root.userData.cape = cape;
    const pos = cape.geometry.attributes.position; cape.userData.base = Float32Array.from(pos.array);
  }
  // chain / necklace
  if (look.acc === 'chain') put(spine, mesh(geo('TorusGeometry', 0.07, 0.006, 6, 24), gold, 0, 0.5, 0.05)).rotation.x = 1.2;

  // neck and head
  const neck = mesh(geo('CylinderGeometry', 0.045, 0.052, 0.09, 12), skin, 0, 0.58, 0); spine.add(neck);
  const head = grp(0, 0.72, 0.005); head.scale.setScalar(1.1); spine.add(head);
  buildHead(head, look, skin, skinD, hairM, hairD, dark, gold);

  // arms
  const arms = {};
  const longSleeve = ['hoodie', 'jacket', 'suit', 'tux', 'puffer', 'hero'].includes(tt); const noSleeve = ['tank', 'corset', 'gown', 'crop'].includes(tt);
  for (const sx of [-1, 1]) {
    const sh = grp(sx * 0.195 * w * (tt === 'puffer' ? 1.1 : 1), 0.47, 0); spine.add(sh);
    sh.add(seg(0.28, 0.048 * w * bulk, 0.04 * w * bulk, noSleeve ? skin : top));
    if (!noSleeve && !longSleeve) sh.add(mesh(geo('CylinderGeometry', 0.052 * w, 0.05 * w, 0.02, 12), topD, 0, -0.13, 0));
    const el = grp(0, -0.28, 0); sh.add(el);
    el.add(seg(0.25, 0.039 * w * (longSleeve ? bulk : 1), 0.032, longSleeve ? top : skin, false));
    if (longSleeve) el.add(mesh(geo('CylinderGeometry', 0.036, 0.036, 0.03, 10), tt === 'hero' ? mat(shade(look.topColor, -0.45)) : topD, 0, -0.235, 0));
    const hand = grp(0, -0.27, 0); el.add(hand);
    const hm = tt === 'hero' ? mat(shade(look.topColor, -0.45), { rough: 0.4 }) : skin;
    put(hand, mesh(geo('SphereGeometry', 0.036, 12, 10), hm)).scale.set(0.8, 1.15, 0.55);
    hand.add(mesh(geo('BoxGeometry', 0.05, 0.05, 0.022), hm, 0, -0.045, 0));
    const th = mesh(geo('CylinderGeometry', 0.01, 0.009, 0.04, 6), hm, -sx * 0.025, -0.02, 0.012); th.rotation.z = sx * 0.6; hand.add(th);
    sh.rotation.z = sx * 0.1;
    arms[sx] = { sh, el, hand };
  }
  // shadow blob for grounding
  if (!o.noShadow) { const sh = mesh(geo('CircleGeometry', 0.32, 24), mat('#000000', { basic: true, opacity: 0.25 }), 0, 0.004, 0); sh.rotation.x = -Math.PI / 2; root.add(sh); }
  root.userData = Object.assign(root.userData, { body, hips, spine, head, arms, legs, look, blink: rnd(0, 4) });
  return root;
};

function buildHead(head, look, skin, skinD, hairM, hairD, dark, gold) {
  const D = DD();
  const fs = D.FACES.find(f => f.id === look.face) || { sx: 1, sy: 1.06 };
  const skull = mesh(geo('SphereGeometry', HEAD_R, 28, 22), skin); skull.scale.set(fs.sx * 0.94, fs.sy * 1.04, 1); head.add(skull);
  const jaw = mesh(geo('SphereGeometry', 0.098, 24, 18), skin, 0, -0.045, 0.012); jaw.scale.set(fs.sx * (look.face === 'square' ? 0.98 : 0.86), 0.78 * fs.sy, 0.92); head.add(jaw);
  const face = grp(0, 0, 0); head.add(face); head.userData.face = face;
  // eyes
  const eyeW = mat('#f6f4f0', { rough: 0.3 }), iris = mat(look.eyes || '#3c2a1e', { rough: 0.25 }), pupil = mat('#0b0b0d', { rough: 0.2 }), glint = mat('#ffffff', { basic: true });
  const lids = [];
  for (const sx of [-1, 1]) {
    const e = grp(sx * 0.041, 0.012, 0.094); face.add(e);
    put(e, mesh(geo('SphereGeometry', 0.023, 16, 12), eyeW)).scale.set(1.15, 0.85, 0.55);
    const ir = mesh(geo('CircleGeometry', 0.0135, 18), iris, 0, -0.001, 0.0129); e.add(ir);
    e.add(mesh(geo('CircleGeometry', 0.0068, 14), pupil, 0, -0.001, 0.0132));
    e.add(mesh(geo('CircleGeometry', 0.0033, 8), glint, 0.004, 0.004, 0.0135));
    const lid = mesh(geo('SphereGeometry', 0.0255, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3), skin, 0, 0.004, 0.0); lid.scale.set(1.16, 0.6, 0.62); e.add(lid); lids.push(lid);
    e.add(tube([[-0.024, 0.008, 0.009], [0, 0.016, 0.013], [0.024, 0.008, 0.009]], 0.0016, dark, 8));
  }
  head.userData.lids = lids;
  // brows
  const browM = mat(shade(look.hairColor, -0.35), { rough: 0.8 }); const bs = look.brows || 'straight';
  for (const sx of [-1, 1]) {
    const arch = bs === 'arched' ? 0.012 : bs === 'soft' ? 0.004 : 0.002; const r = bs === 'thick' ? 0.0058 : bs === 'soft' ? 0.0034 : 0.0042;
    const inner = [sx * 0.018, 0.04, 0.112], mid = [sx * 0.042, 0.046 + arch, 0.112], outer = [sx * 0.064, 0.038 + (bs === 'arched' ? 0.002 : 0), 0.1];
    const b = tube([inner, mid, outer], r, browM, 10); face.add(b);
  }
  // nose
  const ns = (D.NOSES.find(n => n.id === look.nose) || { s: 1 }).s;
  const bridge = mesh(geo('CylinderGeometry', 0.008 * ns, 0.014 * ns, 0.05, 10), skin, 0, -0.008, 0.112); bridge.rotation.x = -0.35; face.add(bridge);
  face.add(mesh(geo('SphereGeometry', 0.014 * ns, 12, 10), skin, 0, -0.033, 0.118 + 0.004 * ns));
  for (const sx of [-1, 1]) face.add(mesh(geo('SphereGeometry', 0.009 * ns, 10, 8), skinD, sx * 0.012 * ns, -0.036, 0.113));
  // mouth
  const ls = (D.LIPS.find(n => n.id === look.lips) || { s: 1 }).s; const lipC = mat(mix(shade(look.skin, -0.25), '#b5485a', 0.35), { rough: 0.4 });
  const up = mesh(geo('SphereGeometry', 0.012, 12, 8), lipC, 0, -0.064, 0.106); up.scale.set(2.2, 0.55 * ls, 0.6); face.add(up);
  const lo = mesh(geo('SphereGeometry', 0.012, 12, 8), lipC, 0, -0.075, 0.104); lo.scale.set(1.9, 0.7 * ls, 0.6); face.add(lo);
  face.add(mesh(geo('BoxGeometry', 0.044, 0.002, 0.004), mat(shade(look.skin, -0.5)), 0, -0.069, 0.113));
  head.userData.mouth = lo;
  // ears
  for (const sx of [-1, 1]) { const ear = mesh(geo('SphereGeometry', 0.026, 12, 10), skin, sx * HEAD_R * 0.93 * fs.sx, -0.004, -0.005); ear.scale.set(0.42, 1, 0.75); head.add(ear); if (look.acc === 'earrings') head.add(mesh(geo('SphereGeometry', 0.009, 8, 6), gold, sx * HEAD_R * 0.95 * fs.sx, -0.03, 0.004)); }
  // facial hair
  const fh = look.facial;
  if (fh === 'stubble' || fh === 'beard') { const b = mesh(geo('SphereGeometry', fh === 'beard' ? 0.106 : 0.1, 22, 16, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.42), fh === 'beard' ? hairM : mat(look.hairColor, { opacity: 0.38, rough: 0.9 }), 0, -0.04, 0.014); b.scale.set(fs.sx * 0.9, 0.85, 0.96); head.add(b); }
  if (fh === 'mustache' || fh === 'goatee' || fh === 'beard') { const m = tube([[-0.03, -0.056, 0.108], [0, -0.051, 0.118], [0.03, -0.056, 0.108]], 0.0065, hairM, 10); head.add(m); }
  if (fh === 'goatee') put(head, mesh(geo('SphereGeometry', 0.02, 10, 8), hairM, 0, -0.1, 0.09)).scale.set(1, 1.3, 0.7);
  // glasses and hats
  const a = look.acc;
  if (a === 'shades' || a === 'glasses') { const fm = a === 'shades' ? mat('#0d0d10', { rough: 0.15, metal: 0.3 }) : dark;
    for (const sx of [-1, 1]) { const ring = mesh(geo('TorusGeometry', 0.024, 0.0035, 6, 18), fm, sx * 0.041, 0.012, 0.118); head.add(ring); if (a === 'shades') head.add(mesh(geo('CircleGeometry', 0.024, 16), mat('#111116', { rough: 0.1, metal: 0.5 }), sx * 0.041, 0.012, 0.118)); }
    head.add(mesh(geo('BoxGeometry', 0.018, 0.004, 0.004), fm, 0, 0.016, 0.12)); }
  buildHair(head, look.hair || 'short', hairM, hairD, fs);
  const am = mat(look.accColor || '#c9a227', { rough: 0.7 });
  if (a === 'cap') { const c = mesh(geo('SphereGeometry', HEAD_R * 1.07, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.1), am, 0, 0.018, -0.004); c.scale.set(fs.sx * 0.96, 0.9, 1.02); head.add(c); const bill = mesh(geo('CylinderGeometry', 0.09, 0.09, 0.008, 20, 1, false, -Math.PI / 2, Math.PI), am, 0, 0.035, 0.07); head.add(bill); }
  if (a === 'beanie') { const c = mesh(geo('SphereGeometry', HEAD_R * 1.09, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.9), am, 0, 0.02, -0.004); c.scale.set(fs.sx * 0.97, 1.05, 1.02); head.add(c); put(head, mesh(geo('TorusGeometry', HEAD_R * 1.02, 0.014, 6, 24), mat(shade(look.accColor || '#c9a227', -0.2)), 0, 0.02, 0)).rotation.x = Math.PI / 2; }
}

// hair: strands are tubes that start on the scalp and fall around the head
function scalp(theta, phi, r = HEAD_R * 1.04) { return [Math.sin(phi) * Math.sin(theta) * r * 0.95, Math.cos(phi) * r * 1.05 + 0.01, Math.sin(phi) * Math.cos(theta) * r]; }
function strand(theta, phi, len, m, o = {}) {
  const p0 = scalp(theta, phi); const out = [Math.sin(theta), 0, Math.cos(theta)];
  const pts = [p0]; const push = o.push != null ? o.push : 0.025; const n = 6;
  for (let i = 1; i <= n; i++) {
    const t = i / n; const y = p0[1] - len * t;
    const rad = Math.max(HEAD_R * 1.08 + push * t, Math.hypot(p0[0], p0[2]) + push * t * 0.6) * (y > -0.05 ? 1 : 1 + (o.flare || 0) * t);
    const wv = o.wave ? Math.sin(t * Math.PI * 3 + theta * 2) * o.wave : 0;
    pts.push([out[0] * rad + wv * out[2], y, out[2] * rad - wv * out[0]]);
  }
  return tube(pts, o.r || 0.022, m, 16);
}
function cap(head, m, fs, o = {}) {
  const c = mesh(geo('SphereGeometry', HEAD_R * (o.r || 1.06), 28, 18, 0, Math.PI * 2, 0, o.cut || Math.PI / 2.05), m, 0, o.y || 0.012, o.z || -0.01);
  c.scale.set(fs.sx * 0.96, fs.sy * (o.sy || 1.05), o.sz || 1.05); c.rotation.x = o.rx != null ? o.rx : -0.5; head.add(c);
  const nape = mesh(geo('SphereGeometry', HEAD_R * (o.r || 1.06) * 0.99, 24, 12, Math.PI * 1.08, Math.PI * 0.84, Math.PI * 0.3, Math.PI * 0.4), m, 0, o.y || 0.012, -0.01); nape.scale.set(fs.sx * 0.96, fs.sy * 1.05, 1.05); head.add(nape);
  // sideburns / temples so the hairline wraps the sides
  if (!o.noSides) for (const sx of [-1, 1]) { const sb = mesh(geo('SphereGeometry', 0.035, 10, 8), m, sx * HEAD_R * 0.9 * fs.sx, 0.02, 0.02); sb.scale.set(0.4, 1.3, 1.2); head.add(sb); }
  return c;
}
function curtain(head, m, len, o = {}) {
  // an open cylinder of hair behind and beside the face, flaring slightly toward the ends
  const r0 = HEAD_R * 1.06, r1 = HEAD_R * (1.12 + (o.flare || 0)); const open = o.open || 1.9;
  const g = new THREE.CylinderGeometry(r0, r1, len, 30, 6, true, open / 2, Math.PI * 2 - open);
  if (o.wave) { const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i); const a = Math.atan2(z, x); const k = 1 + Math.sin(a * 10 + y * 30) * o.wave; pos.setX(i, x * k); pos.setZ(i, z * k); } g.computeVertexNormals(); }
  const c = new THREE.Mesh(g, m.clone()); c.material.side = THREE.DoubleSide; c.position.set(0, 0.02 - len / 2, -0.012); head.add(c); return c;
}
function fringe(head, m, n, len, spread, o = {}) { for (let i = 0; i < n; i++) { const th = -spread / 2 + spread * (i / Math.max(1, n - 1)) + (o.side || 0); head.add(strand(th, 0.55 + (o.phi || 0), len, m, { r: o.r || 0.018, push: 0.012 })); } }
function buildHair(head, style, m, md, fs) {
  const H = head; const back = (n, from, to, len, o = {}) => { for (let i = 0; i < n; i++) { const th = from + (to - from) * (i / (n - 1)); H.add(strand(th, o.phi || 0.95, len * (o.vary ? 0.85 + Math.random() * 0.3 : 1), i % 3 === 0 ? md : m, o)); } };
  switch (style) {
    case 'buzz': cap(H, m, fs, { r: 1.015, cut: Math.PI / 1.75 }); break;
    case 'short': { cap(H, m, fs); for (let i = 0; i < 9; i++) { const th = -0.9 + i * 0.22; const p = scalp(th, 0.45); const b = mesh(geo('SphereGeometry', 0.034, 10, 8), i % 2 ? m : md, p[0], p[1] + 0.008, p[2]); b.scale.set(1.2, 0.6, 1); H.add(b); } break; }
    case 'quiff': { cap(H, m, fs); const q = mesh(geo('SphereGeometry', 0.07, 16, 12), m, 0, 0.115, 0.05); q.scale.set(1.25, 0.7, 1); q.rotation.x = -0.4; H.add(q); break; }
    case 'sidepart': { cap(H, m, fs); const q = mesh(geo('SphereGeometry', 0.075, 16, 12), m, -0.03, 0.105, 0.04); q.scale.set(1.5, 0.55, 1.05); q.rotation.z = 0.25; H.add(q); H.add(mesh(geo('BoxGeometry', 0.004, 0.003, 0.08), mat('#000000', { basic: true, opacity: 0.3 }), 0.045, 0.14, 0.02)); break; }
    case 'slick': { const c = cap(H, m, fs, { rx: -0.5 }); c.material = mat(new THREE.Color(m.color).getStyle(), { rough: 0.25, metal: 0.15 }); const v = mesh(geo('SphereGeometry', 0.09, 16, 12), c.material, 0, 0.07, -0.05); v.scale.set(1.15, 0.7, 1.2); H.add(v); break; }
    case 'spiky': { cap(H, m, fs); for (let i = 0; i < 14; i++) { const th = rnd(-Math.PI, Math.PI), ph = rnd(0.1, 0.9); const p = scalp(th, ph); const c = mesh(geo('ConeGeometry', 0.022, 0.07, 6), i % 2 ? m : md, p[0], p[1], p[2]); c.lookAt(p[0] * 3, p[1] * 3 + 0.2, p[2] * 3); c.rotateX(Math.PI / 2); H.add(c); } break; }
    case 'curly': { cap(H, md, fs, { r: 1.05 }); for (let i = 0; i < 46; i++) { const th = rnd(-Math.PI, Math.PI), ph = rnd(0.05, 1.45); if (ph > 1.1 && Math.abs(th) < 1.0) continue; const p = scalp(th, ph, HEAD_R * 1.12); H.add(mesh(geo('SphereGeometry', rnd(0.026, 0.036), 8, 6), i % 3 ? m : md, p[0], p[1], p[2])); } break; }
    case 'afro': { const r = 0.185; const top = mesh(geo('SphereGeometry', r, 24, 16, 0, Math.PI * 2, 0, 1.05), m, 0, 0.05, -0.045); top.scale.set(1.05 * fs.sx, 1, 1); H.add(top);
      const backp = mesh(geo('SphereGeometry', r, 24, 16, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, Math.PI * 0.72), m, 0, 0.05, -0.045); backp.scale.set(1.05 * fs.sx, 1, 1); backp.material = m.clone(); backp.material.side = THREE.DoubleSide; H.add(backp);
      for (let i = 0; i < 40; i++) { const th = rnd(-Math.PI, Math.PI), ph = rnd(0, 1.9); if (ph > 1.0 && Math.abs(th) < 1.05) continue; H.add(mesh(geo('SphereGeometry', 0.04, 8, 6), i % 2 ? m : md, Math.sin(ph) * Math.sin(th) * r * 1.07, 0.05 + Math.cos(ph) * r, -0.045 + Math.sin(ph) * Math.cos(th) * r)); }
      cap(H, md, fs, { r: 1.02 }); break; }
    case 'long': { cap(H, m, fs); curtain(H, m, 0.42, { flare: 0.12, open: 1.7 }); back(10, 1.0, Math.PI * 2 - 1.0, 0.44, { r: 0.022, push: 0.03, vary: true }); for (const sx of [-1, 1]) H.add(strand(sx * 0.55, 0.45, 0.2, m, { r: 0.02, push: 0.008 })); break; }
    case 'waves': { cap(H, m, fs); curtain(H, m, 0.46, { flare: 0.2, open: 1.7, wave: 0.06 }); back(10, 0.95, Math.PI * 2 - 0.95, 0.48, { r: 0.024, push: 0.04, wave: 0.02, flare: 0.3 }); break; }
    case 'curtain': { cap(H, m, fs); curtain(H, m, 0.3, { flare: 0.06, open: 1.75 }); for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) H.add(strand(sx * (0.22 + i * 0.2), 0.4, 0.13 + i * 0.05, m, { r: 0.019, push: 0.008 })); break; }
    case 'bob': { cap(H, m, fs); const c = curtain(H, m, 0.17, { flare: 0.1, open: 1.6 }); c.position.y = -0.02; fringe(H, m, 8, 0.065, 1.2, { r: 0.019 }); break; }
    case 'pixie': { cap(H, m, fs, { r: 1.04 }); for (let i = 0; i < 5; i++) H.add(strand(-0.6 + i * 0.25, 0.5, 0.075 + i * 0.01, i % 2 ? m : md, { r: 0.019, push: 0.006 })); break; }
    case 'bun': { cap(H, m, fs, { r: 1.03 }); const b = mesh(geo('SphereGeometry', 0.058, 16, 12), m, 0, 0.14, -0.07); H.add(b); put(H, mesh(geo('TorusGeometry', 0.042, 0.01, 6, 16), md, 0, 0.11, -0.055)).rotation.x = 1.0; break; }
    case 'manbun': { cap(H, m, fs, { r: 1.03, rx: -0.45 }); const b = mesh(geo('SphereGeometry', 0.045, 14, 10), m, 0, 0.1, -0.11); H.add(b); break; }
    case 'ponytail': { cap(H, m, fs, { r: 1.03 }); H.add(mesh(geo('TorusGeometry', 0.024, 0.008, 6, 14), md, 0, 0.07, -0.118)); const pt = tube([[0, 0.07, -0.12], [0, 0.04, -0.17], [0, -0.06, -0.19], [0, -0.2, -0.17], [0, -0.3, -0.14]], 0.03, m, 20); H.add(pt); H.userData.tail = pt; break; }
    case 'braids': { cap(H, m, fs, { r: 1.03 }); for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) H.add(mesh(geo('SphereGeometry', 0.026 - i * 0.0012, 10, 8), i % 2 ? m : md, sx * 0.095, -0.03 - i * 0.042, -0.035 + i * 0.006)); break; }
    case 'locs': { cap(H, m, fs); back(18, 0.95, Math.PI * 2 - 0.95, 0.38, { r: 0.017, push: 0.035, vary: true }); back(4, 0.6, 0.95, 0.3, { r: 0.016 }); back(4, -0.95, -0.6, 0.3, { r: 0.016 }); break; }
    case 'mullet': { cap(H, m, fs); for (let i = 0; i < 6; i++) { const p = scalp(-0.6 + i * 0.24, 0.45); H.add(mesh(geo('SphereGeometry', 0.03, 8, 6), m, p[0], p[1], p[2])); } back(9, 2.3, Math.PI * 2 - 2.3, 0.26, { r: 0.026, push: 0.025, phi: 1.1 }); break; }
    default: cap(H, m, fs);
  }
}

// ------------------------------------------------------------------ looks for other people
L3.lookFor = function (name, o = {}) {
  const D = DD(); const h = hash(name || 'x'); const r = i => (Math.floor(h / Math.pow(7, i)) % 1000) / 1000;
  const fem = o.fem != null ? o.fem : (h % 2 === 0);
  const hairsF = ['long', 'waves', 'bob', 'curtain', 'ponytail', 'bun', 'curly', 'braids', 'pixie', 'afro', 'locs'], hairsM = ['short', 'quiff', 'sidepart', 'buzz', 'slick', 'curly', 'manbun', 'locs', 'afro', 'spiky', 'mullet'];
  const hairs = fem ? hairsF : hairsM;
  return { skin: D.SKINS[Math.floor(r(1) * D.SKINS.length)], hair: hairs[Math.floor(r(2) * hairs.length)], hairColor: D.HAIR_COLORS[Math.floor(r(3) * 6)], eyes: D.EYE_COLORS[Math.floor(r(4) * D.EYE_COLORS.length)],
    face: ['oval', 'round', 'square', 'long'][Math.floor(r(5) * 4)], nose: 'med', lips: fem ? 'full' : 'med', brows: fem ? 'arched' : 'straight', facial: !fem && r(6) < 0.4 ? pick(['stubble', 'beard']) : 'none', body: pick(['slim', 'avg', 'broad']), height: 'm',
    top: o.top || pick(['jacket', 'tee', 'suit', 'hoodie']), topColor: D.CLOTH_COLORS[Math.floor(r(7) * D.CLOTH_COLORS.length)], bottom: fem && r(8) < 0.3 ? 'skirt' : 'jeans', bottomColor: pick(['#1f3a5f', '#1d1d24', '#5b4a3a', '#c0c4cc']), shoes: fem && r(9) < 0.4 ? 'boots' : 'sneakers', shoesColor: '#1d1d24', acc: 'none', accColor: '#c9a227' };
};

// ------------------------------------------------------------------ animation
function animate(fig, t, mode = 'idle', k = 1) {
  const u = fig.userData; if (!u.body) return;
  const A = u.arms, Lg = u.legs; const s = Math.sin, c = Math.cos;
  // reset
  for (const sx of [-1, 1]) { A[sx].sh.rotation.set(0, 0, sx * 0.1); A[sx].el.rotation.set(0, 0, 0); Lg[sx].thigh.rotation.set(0, 0, 0); Lg[sx].knee.rotation.set(0, 0, 0); Lg[sx].foot.rotation.set(0, 0, 0); }
  u.body.position.set(0, 0, 0); u.body.rotation.set(0, 0, 0); u.spine.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); u.hips.position.y = 0.89; u.spine.position.y = 0.89;
  const breathe = s(t * 2) * 0.006;
  if (mode === 'idle' || mode === 'talk') {
    u.spine.rotation.x = breathe; A[1].sh.rotation.z = 0.12 + s(t * 1.3) * 0.02; A[-1].sh.rotation.z = -0.12 - s(t * 1.3) * 0.02; A[1].el.rotation.x = -0.15; A[-1].el.rotation.x = -0.15;
    u.head.rotation.y = s(t * 0.6) * 0.18; u.head.rotation.x = s(t * 0.9) * 0.03;
    if (mode === 'talk') { A[1].sh.rotation.x = -0.5 + s(t * 3) * 0.25; A[1].el.rotation.x = -0.9 + s(t * 2.4) * 0.3; A[-1].sh.rotation.x = -0.3 + c(t * 2.7) * 0.2; A[-1].el.rotation.x = -0.6; u.head.rotation.x = s(t * 5) * 0.05; }
  } else if (mode === 'pose') {
    u.body.rotation.y = s(t * 0.4) * 0.2; A[-1].sh.rotation.z = -0.55; A[-1].el.rotation.x = -0.5; A[-1].el.rotation.z = 0.9; A[1].sh.rotation.z = 0.18;
    Lg[1].thigh.rotation.x = -0.08; Lg[1].knee.rotation.x = 0.16; Lg[-1].thigh.rotation.z = -0.06; u.head.rotation.y = s(t * 0.7) * 0.25; u.head.rotation.z = 0.06;
  } else if (mode === 'walk' || mode === 'run') {
    const sp = mode === 'run' ? 9 : 5.2, amp = mode === 'run' ? 0.9 : 0.45;
    for (const sx of [-1, 1]) { const ph = t * sp + (sx > 0 ? 0 : Math.PI); Lg[sx].thigh.rotation.x = s(ph) * amp; Lg[sx].knee.rotation.x = Math.max(0, -s(ph + 0.6)) * amp * 1.6; A[sx].sh.rotation.x = -s(ph) * amp * 0.9; A[sx].el.rotation.x = -0.3 - (mode === 'run' ? 0.9 : 0.2); }
    u.body.position.y = Math.abs(s(t * sp)) * (mode === 'run' ? 0.05 : 0.02); u.spine.rotation.x = mode === 'run' ? 0.25 : 0.04;
  } else if (mode === 'fight') {
    const p = (t * 1.6) % 2; const punch = p < 0.25 ? s(p / 0.25 * Math.PI) : 0; const p2 = ((t * 1.6) + 1) % 2; const punch2 = p2 < 0.25 ? s(p2 / 0.25 * Math.PI) : 0;
    u.body.rotation.y = 0.5 - punch * 0.5 + punch2 * 0.3; u.spine.rotation.x = 0.1;
    for (const sx of [-1, 1]) { Lg[sx].thigh.rotation.x = sx * 0.3; Lg[sx].knee.rotation.x = 0.35; Lg[sx].thigh.rotation.z = sx * 0.12; }
    u.hips.position.y = u.spine.position.y = 0.84;
    A[1].sh.rotation.x = -1.3 - punch * 0.3; A[1].el.rotation.x = -1.6 + punch * 1.5; A[-1].sh.rotation.x = -1.2 - punch2 * 0.3; A[-1].el.rotation.x = -1.7 + punch2 * 1.5;
  } else if (mode === 'cheer') {
    const b = Math.abs(s(t * 5)); u.body.position.y = b * 0.05; for (const sx of [-1, 1]) { A[sx].sh.rotation.z = sx * (2.6 + s(t * 5) * 0.2); A[sx].el.rotation.z = sx * 0.2; } u.head.rotation.x = -0.2;
  } else if (mode === 'wave') {
    A[1].sh.rotation.z = 2.3; A[1].el.rotation.z = 0.3 + s(t * 7) * 0.4; A[-1].sh.rotation.z = -0.12; u.head.rotation.y = 0.15;
  } else if (mode === 'sad') {
    u.spine.rotation.x = 0.28; u.head.rotation.x = 0.35; A[1].sh.rotation.z = 0.05; A[-1].sh.rotation.z = -0.05; A[1].sh.rotation.x = -0.2; A[-1].sh.rotation.x = -0.2;
  } else if (mode === 'point') {
    A[1].sh.rotation.x = -1.45; A[1].sh.rotation.z = 0.2; u.head.rotation.y = 0.1; A[-1].sh.rotation.z = -0.15; u.spine.rotation.x = 0.04 + breathe;
  } else if (mode === 'phone') {
    A[1].sh.rotation.x = -0.6; A[1].sh.rotation.z = 0.35; A[1].el.rotation.x = -1.9; u.head.rotation.x = 0.15; u.head.rotation.y = 0.2;
  } else if (mode === 'hold') {
    A[1].sh.rotation.x = -1.1 + s(t * 2) * 0.05; A[1].el.rotation.x = -0.9; A[-1].sh.rotation.z = -0.4; A[-1].el.rotation.z = 0.5; u.head.rotation.x = -0.1;
  } else if (mode === 'hero') {
    u.body.rotation.y = 0.15; A[1].sh.rotation.z = 0.35; A[1].el.rotation.z = -1.4; A[-1].sh.rotation.z = -0.35; A[-1].el.rotation.z = 1.4; Lg[1].thigh.rotation.z = 0.12; Lg[-1].thigh.rotation.z = -0.12; u.head.rotation.x = -0.12; u.head.rotation.y = s(t * 0.4) * 0.1;
  } else if (mode === 'dance') {
    const b = Math.abs(s(t * 4.2)) * 0.05 * k; u.body.position.y = b; u.body.rotation.y = s(t * 1.4) * 0.35; A[1].sh.rotation.z = 0.5 + Math.abs(s(t * 2.1)) * 1.6; A[-1].sh.rotation.z = -0.4 - Math.abs(s(t * 2.1 + 1)) * 1.4;
    for (const sx of [-1, 1]) Lg[sx].thigh.rotation.x = s(t * 4.2 + (sx > 0 ? 0 : Math.PI)) * 0.2;
  } else if (mode === 'fall') {
    const p = Math.min(1, (t % 3) / 0.8); u.body.rotation.x = -p * 1.35; u.body.position.y = -p * 0.25; A[1].sh.rotation.z = 1.4 * p; A[-1].sh.rotation.z = -1.4 * p;
  }
  // blink
  const bl = (t + u.blink) % 4.2; const close = bl < 0.12 ? 1 : 0; for (const l of (u.head.userData.lids || [])) { l.scale.y = close ? 1.6 : 0.6; l.position.y = close ? -0.004 : 0.004; }
  if (mode === 'talk' && u.head.userData.mouth) u.head.userData.mouth.scale.y = 0.7 + Math.abs(s(t * 11)) * 0.9;
  // cape and ponytail sway
  if (u.cape) { const pos = u.cape.geometry.attributes.position; const b = u.cape.userData.base; for (let i = 0; i < pos.count; i++) { const y = b[i * 3 + 1]; const d = (0.5 - y) ; pos.array[i * 3 + 2] = b[i * 3 + 2] - d * d * (0.08 + (mode === 'run' ? 0.25 : 0)) - s(t * 2.4 + y * 4) * 0.02 * d; } pos.needsUpdate = true; }
  if (u.head.userData.tail) u.head.userData.tail.rotation.z = s(t * 2) * 0.08;
}
L3.animate = animate;

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
  const loop = () => { if (!alive) return; if (!el.isConnected) { ctl.destroy(); return; } const dt = Math.min(0.05, clock.getDelta()); update(reduce ? dt * 0.4 : dt, clock.elapsedTime); r.render(scene, camera); raf = requestAnimationFrame(loop); };
  const ctl = { r, scene, camera, destroy() { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); try { r.dispose(); r.forceContextLoss && r.forceContextLoss(); } catch (e) { } if (r.domElement.parentNode) r.domElement.remove(); if (L3.active === ctl) L3.active = null; } };
  L3.active = ctl; loop(); return ctl;
}
L3.stop = () => { if (L3.active) L3.active.destroy(); };
function lights(scene, o = {}) {
  scene.add(new THREE.HemisphereLight(o.sky || 0xdfe6ff, o.ground || 0x3a3240, o.amb != null ? o.amb : 0.75));
  const key = new THREE.DirectionalLight(o.key || 0xfff1e0, o.ki != null ? o.ki : 0.95); key.position.set(1.5, 3.5, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(o.rim || 0x8fb4ff, o.ri != null ? o.ri : 0.55); rim.position.set(-2.5, 2.5, -2.5); scene.add(rim);
  return { key, rim };
}
function dragSpin(el, target) {
  let down = false, lx = 0, vel = 0;
  const start = e => { down = true; lx = (e.touches ? e.touches[0] : e).clientX; };
  const move = e => { if (!down) return; const x = (e.touches ? e.touches[0] : e).clientX; vel = (x - lx) * 0.012; target.rotation.y += vel; lx = x; };
  const end = () => { down = false; };
  el.addEventListener('pointerdown', start); window.addEventListener('pointermove', move); window.addEventListener('pointerup', end);
  return { tick: () => { if (!down) { target.rotation.y += vel; vel *= 0.94; } }, off: () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); } };
}

// ------------------------------------------------------------------ preview and portrait
L3.preview = function (el, look, opts = {}) {
  if (!L3.available()) return null;
  const scene = new THREE.Scene(); lights(scene);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); let close = !!opts.close;
  const setCam = () => { if (close) { cam.position.set(0, 1.62, 1.25); cam.lookAt(0, 1.6, 0); } else { cam.position.set(0, 1.1, 4.4); cam.lookAt(0, 0.95, 0); } }; setCam();
  const holder = new THREE.Group(); scene.add(holder); let fig = L3.figure(look); holder.add(fig);
  const spin = dragSpin(el, holder); holder.rotation.y = opts.rot || -0.3;
  const ctl = mount(el, scene, cam, (dt, t) => { spin.tick(); animate(fig, t, 'idle'); }, { alpha: true });
  const d0 = ctl.destroy; ctl.destroy = () => { spin.off(); d0(); };
  ctl.update = l => { holder.remove(fig); fig = L3.figure(l); holder.add(fig); };
  ctl.zoom = z => { close = z; setCam(); };
  return ctl;
};
let pr = null;
L3.portrait = function (look, size = 240, bg = '#1d2230') {
  if (!L3.available()) return null;
  const key = JSON.stringify(look) + size + bg; if (L3.portraitCache[key]) return L3.portraitCache[key];
  try {
    if (!pr) pr = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
    pr.setPixelRatio(1); pr.setSize(size, size);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(bg); lights(scene);
    const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50); cam.position.set(0.28, 1.72, 1.32); cam.lookAt(0, 1.62, 0);
    const fig = L3.figure(look, { noShadow: true }); fig.rotation.y = 0.18; animate(fig, 0.5, 'idle'); scene.add(fig);
    pr.render(scene, cam); const url = pr.domElement.toDataURL('image/png');
    L3.portraitCache[key] = url; return url;
  } catch (e) { return null; }
};

// ------------------------------------------------------------------ sets
// genre (and franchise) to a themed set
L3.setFor = job => window.FC && FC.setFor ? FC.setFor(job) : 'green';
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); return t; }
function skyline(color1, color2, text) {
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, color1); gr.addColorStop(1, color2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(255,255,255,' + Math.random() * 0.8 + ')'; g.fillRect(Math.random() * w, Math.random() * h * 0.4, 2, 2); }
    for (let i = 0; i < 60; i++) { const bw = 20 + Math.random() * 50, bh = 80 + Math.random() * 300, x = Math.random() * w; g.fillStyle = '#0a0d18'; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,214,140,.85)'; for (let k = 0; k < bh / 10; k++) if (Math.random() < 0.35) g.fillRect(x + 3 + Math.random() * (bw - 6), h - bh + Math.random() * bh, 3, 3); }
    if (text) { g.fillStyle = '#fff'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText(text, w / 2, 80); }
  });
}
function addFloor(scene, color, size = 60, o = {}) { const f = mesh(geo('PlaneGeometry', size, size), mat(color, o)); f.rotation.x = -Math.PI / 2; scene.add(f); return f; }
function addBackdrop(scene, tex, w = 22, h = 11, z = -6, y = 4) { const m = mesh(geo('PlaneGeometry', w, h), new THREE.MeshBasicMaterial({ map: tex }), 0, y, z); scene.add(m); return m; }
function buildSet(scene, id, things, o = {}) {
  const fog = c => { scene.fog = new THREE.Fog(c, 6, 26); scene.background = new THREE.Color(c); };
  switch (id) {
    case 'city': { fog('#0b1022'); addFloor(scene, '#2b2f3a', 60, { rough: 0.9 }); addBackdrop(scene, skyline('#0b1022', '#2a1e48'));
      scene.add(mesh(geo('BoxGeometry', 8, 0.3, 0.3), mat('#3a3f4c'), 0, 0.15, -2.2)); const tank = grp(-2.6, 0, -2.6); scene.add(tank); tank.add(mesh(geo('CylinderGeometry', 0.6, 0.6, 1.2, 16), mat('#6b4a32'), 0, 1.6, 0)); tank.add(mesh(geo('ConeGeometry', 0.68, 0.4, 16), mat('#4a3424'), 0, 2.4, 0)); for (const x of [-0.4, 0.4]) tank.add(mesh(geo('CylinderGeometry', 0.04, 0.04, 1, 6), mat('#333'), x, 0.5, 0));
      const neon = mesh(geo('BoxGeometry', 1.8, 0.35, 0.05), mat('#ff3f7f', { basic: true }), 2.4, 2.2, -2.5); scene.add(neon); things.push({ o: neon, kind: 'flicker' }); const pl = new THREE.PointLight(0xff3f7f, 0.8, 6); pl.position.set(2.4, 2, -2); scene.add(pl);
      break; }
    case 'space': { fog('#05060c'); addFloor(scene, '#2a2f3a', 60, { rough: 0.4, metal: 0.6 });
      for (let i = -3; i <= 3; i++) { const rib = mesh(geo('TorusGeometry', 3.2, 0.12, 6, 24, Math.PI), mat('#4a5468', { metal: 0.6, rough: 0.35 }), 0, 0, -i * 1.6); scene.add(rib); }
      const win = mesh(geo('PlaneGeometry', 4, 1.8), new THREE.MeshBasicMaterial({ map: canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#02030a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,' + Math.random() + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); } const gr = g.createRadialGradient(380, 160, 5, 380, 160, 90); gr.addColorStop(0, '#d98a4a'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }), 0, 2, -3.5); scene.add(win);
      for (let i = 0; i < 10; i++) { const l = mesh(geo('BoxGeometry', 0.25, 0.06, 0.02), mat(pick(['#5cc8b0', '#e3b54a', '#e25563']), { basic: true }), rnd(-2.6, 2.6), rnd(0.6, 1.4), -3.4); scene.add(l); things.push({ o: l, kind: 'blink', ph: Math.random() * 6 }); }
      const pl = new THREE.PointLight(0x7aa7ff, 0.8, 8); pl.position.set(0, 2.6, 0); scene.add(pl); break; }
    case 'period': { fog('#1a1208'); addFloor(scene, '#d9d2c3', 60, { rough: 0.35 });
      const tile = mat('#2a221a', { rough: 0.35 }); for (let x = -5; x <= 5; x++) for (let z = -6; z <= 3; z++) if ((x + z) % 2 === 0) { const t = mesh(geo('PlaneGeometry', 0.9, 0.9), tile, x * 0.9, 0.005, z * 0.9); t.rotation.x = -Math.PI / 2; scene.add(t); }
      for (const x of [-3, -1.2, 1.2, 3]) { scene.add(mesh(geo('CylinderGeometry', 0.22, 0.26, 4.2, 16), mat('#e9e0cc'), x, 2.1, -3)); scene.add(mesh(geo('BoxGeometry', 0.6, 0.2, 0.6), mat('#d8cdb4'), x, 4.25, -3)); }
      scene.add(mesh(geo('PlaneGeometry', 12, 6), mat('#5a1d24'), 0, 3, -3.6));
      const ch = grp(0, 3.4, -1); scene.add(ch); put(ch, mesh(geo('TorusGeometry', 0.6, 0.03, 6, 24), mat('#d8b04a', { metal: 0.8, rough: 0.3 }))).rotation.x = Math.PI / 2; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const f = mesh(geo('SphereGeometry', 0.05, 8, 6), mat('#fff1c0', { basic: true }), Math.cos(a) * 0.6, 0.06, Math.sin(a) * 0.6); ch.add(f); things.push({ o: f, kind: 'flicker' }); }
      const pl = new THREE.PointLight(0xffd59a, 1.1, 9); pl.position.set(0, 3, -1); scene.add(pl); break; }
    case 'castle': { fog('#141218'); addFloor(scene, '#4a4640', 60, { rough: 0.95, flat: true });
      for (let x = -6; x <= 6; x++) for (let y = 0; y < 6; y++) scene.add(mesh(geo('BoxGeometry', 0.98, 0.58, 0.5), mat(pick(['#5d5850', '#6a655c', '#545049']), { rough: 0.95 }), x + (y % 2) * 0.5, 0.3 + y * 0.6, -3.5));
      for (const x of [-2.4, 2.4]) { scene.add(mesh(geo('CylinderGeometry', 0.04, 0.05, 0.5, 6), mat('#3a2a1a'), x, 2, -3.1)); const fl = mesh(geo('ConeGeometry', 0.09, 0.25, 8), mat('#ffb347', { basic: true }), x, 2.35, -3.1); scene.add(fl); things.push({ o: fl, kind: 'flame' }); const pl = new THREE.PointLight(0xff9a40, 0.9, 6); pl.position.set(x, 2.4, -2.8); scene.add(pl); things.push({ o: pl, kind: 'torch' }); }
      for (const x of [-1.2, 1.2]) { const b = mesh(geo('PlaneGeometry', 0.8, 2), mat(o.color || '#740001', { side: THREE.DoubleSide }), x, 2.6, -3.2); scene.add(b); }
      break; }
    case 'desert': { fog('#e3b98a'); scene.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4c98a'); gr.addColorStop(1, '#f7e4c0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); scene.fog = new THREE.Fog('#e8c79c', 8, 32);
      addFloor(scene, '#d6a66b', 80, { rough: 1 });
      for (let i = 0; i < 9; i++) { const d = mesh(geo('SphereGeometry', rnd(2, 5), 16, 10), mat('#d39b5e', { rough: 1 }), rnd(-14, 14), -rnd(0.5, 1.5), -rnd(7, 18)); d.scale.y = 0.35; scene.add(d); }
      for (let i = 0; i < 5; i++) scene.add(mesh(geo('DodecahedronGeometry', rnd(0.3, 0.9), 0), mat('#8a5a3a', { flat: true }), rnd(-5, 5), 0.2, -rnd(2, 6)));
      const sun = mesh(geo('SphereGeometry', 1.4, 20, 14), mat('#fff3d0', { basic: true }), -6, 5, -24); scene.add(sun); break; }
    case 'forest': { fog('#16261c'); addFloor(scene, '#2e3f24', 60, { rough: 1 });
      for (let i = 0; i < 34; i++) { const x = rnd(-9, 9), z = -rnd(1.6, 12); if (Math.abs(x) < 1.6 && z > -3) continue; const t = grp(x, 0, z); scene.add(t); t.add(mesh(geo('CylinderGeometry', 0.1, 0.16, 1.6, 8), mat('#4a3020'), 0, 0.8, 0)); t.add(mesh(geo('ConeGeometry', 0.9, 2.2, 8), mat(pick(['#1f4a2c', '#24553a', '#1a3f26']), { flat: true }), 0, 2.4, 0)); t.add(mesh(geo('ConeGeometry', 0.7, 1.6, 8), mat('#2a6040', { flat: true }), 0, 3.3, 0)); }
      for (let i = 0; i < 40; i++) { const f = mesh(geo('SphereGeometry', 0.02, 6, 4), mat('#d8ff8a', { basic: true }), rnd(-5, 5), rnd(0.5, 2.5), -rnd(0, 6)); scene.add(f); things.push({ o: f, kind: 'firefly', y: f.position.y, ph: Math.random() * 6 }); }
      break; }
    case 'street': { fog('#0d0f18'); addFloor(scene, '#22252e', 60, { rough: 0.25, metal: 0.4 }); addBackdrop(scene, skyline('#090b16', '#2a1430'), 24, 12, -9, 5);
      for (const x of [-3.6, 3.6]) { for (let i = 0; i < 4; i++) { const b = mesh(geo('BoxGeometry', 2.6, rnd(4, 9), 2.6), mat('#1a1d28'), x * 1.4, 0, -3 - i * 3.2); b.position.y = b.geometry.parameters.height / 2; scene.add(b); } }
      for (const x of [-2, 2]) { scene.add(mesh(geo('CylinderGeometry', 0.04, 0.05, 3.2, 8), mat('#333'), x, 1.6, -1.5)); scene.add(mesh(geo('SphereGeometry', 0.12, 10, 8), mat('#fff1c0', { basic: true }), x, 3.2, -1.5)); const pl = new THREE.PointLight(0xffd59a, 0.7, 6); pl.position.set(x, 3, -1.5); scene.add(pl); }
      const car = grp(1.6, 0, -2.4); scene.add(car); car.add(mesh(geo('BoxGeometry', 1.9, 0.45, 0.9), mat('#8f1d2c', { rough: 0.25, metal: 0.6 }), 0, 0.42, 0)); car.add(mesh(geo('BoxGeometry', 1.1, 0.35, 0.8), mat('#111', { rough: 0.1, metal: 0.4 }), -0.1, 0.8, 0)); for (const [x, z] of [[-0.65, 0.45], [0.65, 0.45], [-0.65, -0.45], [0.65, -0.45]]) put(car, mesh(geo('CylinderGeometry', 0.18, 0.18, 0.12, 14), mat('#111'), x, 0.18, z)).rotation.x = Math.PI / 2;
      for (let i = 0; i < 3; i++) { const n = mesh(geo('BoxGeometry', 1.2, 0.3, 0.05), mat(pick(['#3fd0ff', '#ff3f7f', '#ffd23f']), { basic: true }), rnd(-4, 4), rnd(2, 3.5), -3.2 - i * 2); scene.add(n); things.push({ o: n, kind: 'flicker' }); }
      break; }
    case 'home': { fog('#2a2420'); addFloor(scene, '#6b4a32', 60, { rough: 0.6 });
      scene.add(mesh(geo('PlaneGeometry', 12, 6), mat('#c9bfae'), 0, 3, -3)); const win = mesh(geo('PlaneGeometry', 1.6, 1.4), mat('#8fb4d9', { basic: true }), -2, 2, -2.98); scene.add(win); scene.add(mesh(geo('BoxGeometry', 1.7, 0.06, 0.08), mat('#f2f2f4'), -2, 2, -2.95));
      const couch = grp(1.6, 0, -2.2); scene.add(couch); couch.add(mesh(geo('BoxGeometry', 2, 0.45, 0.8), mat('#3c4a6a'), 0, 0.3, 0)); couch.add(mesh(geo('BoxGeometry', 2, 0.6, 0.2), mat('#33405e'), 0, 0.7, -0.35));
      const lamp = grp(-0.6, 0, -2.5); scene.add(lamp); lamp.add(mesh(geo('CylinderGeometry', 0.02, 0.02, 1.5, 6), mat('#333'), 0, 0.75, 0)); lamp.add(mesh(geo('CylinderGeometry', 0.15, 0.25, 0.3, 14, 1, true), mat('#f2e3c4', { side: THREE.DoubleSide }), 0, 1.55, 0)); const pl = new THREE.PointLight(0xffd59a, 0.9, 6); pl.position.set(-0.6, 1.5, -2.3); scene.add(pl);
      const table = grp(-1.6, 0, -1.2); scene.add(table); table.add(mesh(geo('CylinderGeometry', 0.6, 0.6, 0.05, 20), mat('#8a6a4f'), 0, 0.75, 0)); table.add(mesh(geo('CylinderGeometry', 0.05, 0.08, 0.75, 8), mat('#5a4030'), 0, 0.37, 0));
      break; }
    case 'diner': { fog('#2a1a20'); addFloor(scene, '#e9e6df', 60, { rough: 0.4 }); for (let x = -6; x <= 6; x++) for (let z = -5; z <= 3; z++) if ((x + z) % 2 === 0) { const t = mesh(geo('PlaneGeometry', 0.6, 0.6), mat('#1d1d24'), x * 0.6, 0.005, z * 0.6); t.rotation.x = -Math.PI / 2; scene.add(t); }
      scene.add(mesh(geo('PlaneGeometry', 12, 6), mat('#5cc8b0'), 0, 3, -3)); scene.add(mesh(geo('BoxGeometry', 6, 1, 0.6), mat('#d6334f', { rough: 0.3 }), 0, 0.5, -2.4)); scene.add(mesh(geo('BoxGeometry', 6, 0.06, 0.8), mat('#c0c4cc', { metal: 0.7, rough: 0.2 }), 0, 1.03, -2.4));
      for (let i = 0; i < 5; i++) { const st = grp(-2 + i, 0, -1.7); scene.add(st); st.add(mesh(geo('CylinderGeometry', 0.18, 0.18, 0.08, 14), mat('#d6334f'), 0, 0.72, 0)); st.add(mesh(geo('CylinderGeometry', 0.03, 0.03, 0.7, 6), mat('#c0c4cc', { metal: 0.8 }), 0, 0.35, 0)); }
      const sign = mesh(geo('BoxGeometry', 2.2, 0.4, 0.05), mat('#ff3f7f', { basic: true }), 0, 2.6, -2.95); scene.add(sign); things.push({ o: sign, kind: 'flicker' }); break; }
    case 'horror': { fog('#07080a'); scene.fog = new THREE.Fog('#07080a', 3, 14); addFloor(scene, '#2a2420', 60, { rough: 0.9 });
      scene.add(mesh(geo('PlaneGeometry', 12, 6), mat('#3a3430'), 0, 3, -3)); const door = mesh(geo('BoxGeometry', 1, 2.1, 0.08), mat('#2a1a12'), 1.4, 1.05, -2.95); scene.add(door);
      const bulb = mesh(geo('SphereGeometry', 0.08, 8, 6), mat('#fff1c0', { basic: true }), 0, 2.8, -0.8); scene.add(bulb); scene.add(mesh(geo('CylinderGeometry', 0.005, 0.005, 1.2, 4), mat('#111'), 0, 3.4, -0.8)); const pl = new THREE.PointLight(0xffe0a0, 1.2, 6); pl.position.set(0, 2.7, -0.8); scene.add(pl); things.push({ o: pl, kind: 'horrorlight', b: bulb });
      break; }
    case 'office': { fog('#1a1e26'); addFloor(scene, '#3a3f4c', 60, { rough: 0.8 }); addBackdrop(scene, skyline('#3a5a8a', '#9ab0c8'), 14, 7, -3.2, 3);
      const desk = grp(0.9, 0, -1.8); scene.add(desk); desk.add(mesh(geo('BoxGeometry', 1.8, 0.06, 0.8), mat('#2a2018'), 0, 0.75, 0)); desk.add(mesh(geo('BoxGeometry', 1.7, 0.7, 0.05), mat('#1f1812'), 0, 0.4, -0.35)); desk.add(mesh(geo('BoxGeometry', 0.5, 0.32, 0.03), mat('#111'), 0.3, 0.98, -0.2)); desk.add(mesh(geo('PlaneGeometry', 0.46, 0.28), mat('#7aa7ff', { basic: true }), 0.3, 0.98, -0.18));
      break; }
    case 'booth': { fog('#16141c'); addFloor(scene, '#2a2630', 60); scene.add(mesh(geo('PlaneGeometry', 8, 5), mat('#3a3550', { rough: 1, flat: true }), 0, 2.5, -2.2));
      for (let x = -3; x <= 3; x++) for (let y = 0; y < 4; y++) { const p = mesh(geo('ConeGeometry', 0.18, 0.2, 4), mat('#2c2840', { flat: true }), x * 0.55, 0.6 + y * 0.6, -2.1); p.rotation.x = Math.PI / 2; scene.add(p); }
      const mic = grp(0.35, 0, 0.5); scene.add(mic); mic.add(mesh(geo('CylinderGeometry', 0.015, 0.015, 1.5, 6), mat('#333', { metal: 0.6 }), 0, 0.75, 0)); put(mic, mesh(geo('SphereGeometry', 0.05, 12, 8), mat('#888', { metal: 0.8, rough: 0.3 }), 0, 1.58, 0)).scale.y = 1.6; mic.add(mesh(geo('TorusGeometry', 0.09, 0.006, 6, 18), mat('#111'), 0, 1.58, 0.06));
      const screen = mesh(geo('PlaneGeometry', 2.6, 1.4), mat(o.color || '#e2231a', { basic: true }), 0, 2.4, -2.05); scene.add(screen); break; }
    case 'stage': { fog('#0a0607'); addFloor(scene, '#120a0a'); const stage = mesh(geo('BoxGeometry', 9, 0.6, 4.5), mat('#3a2616'), 0, -0.3, -0.6); scene.add(stage);
      for (const sx of [-1, 1]) { scene.add(mesh(geo('BoxGeometry', 1.8, 5, 0.15), mat('#7a1020', { rough: 0.9 }), sx * 3.5, 2.5, 1.3)); }
      scene.add(mesh(geo('BoxGeometry', 9, 0.9, 0.2), mat('#7a1020'), 0, 4.3, 1.35)); const sp = new THREE.SpotLight(0xfff1d6, 1.4, 20, 0.3, 0.5); sp.position.set(0, 8, 5); scene.add(sp); scene.add(sp.target); break; }
    case 'carpet': { scene.background = new THREE.Color('#0d0f14'); addFloor(scene, '#16141a');
      const carpet = mesh(geo('PlaneGeometry', 2.2, 30), mat('#8f1d2c', { rough: 0.95 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.01, -4); scene.add(carpet);
      const wall = canvasTex(1024, 384, (g, w, h) => { g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h); for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { g.fillStyle = (r + c) % 2 ? '#8f1d2c' : '#1d1d24'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.fillText((r + c) % 2 ? (o.title || 'PREMIERE').toUpperCase().slice(0, 18) : 'FINAL CUT', 100 + c * 205, 44 + r * 76); } });
      scene.add(mesh(geo('PlaneGeometry', 9.6, 3.6), new THREE.MeshBasicMaterial({ map: wall }), 0, 1.9, -2.2));
      for (const sx of [-1.4, 1.4]) for (let i = 0; i < 6; i++) scene.add(mesh(geo('CylinderGeometry', 0.04, 0.05, 0.9, 8), mat('#d8b04a', { metal: 0.8, rough: 0.3 }), sx, 0.45, -1 - i * 1.6));
      break; }
    case 'rehearsal': { fog('#22201f'); addFloor(scene, '#8a6a4f', 60, { rough: 0.5 });
      for (let i = 0; i < 6; i++) { const m = mesh(geo('PlaneGeometry', 1.4, 2.2), mat('#c9d6de', { rough: 0.15, metal: 0.25 }), -3.5 + i * 1.42, 1.3, -3); scene.add(m); }
      scene.add(mesh(geo('PlaneGeometry', 12, 6), mat('#e9e4d8'), 0, 3, -3.05)); put(scene, mesh(geo('CylinderGeometry', 0.025, 0.025, 8.5, 8), mat('#d8cdb4', { metal: 0.3 }), 0, 1.05, -2.85)).rotation.z = Math.PI / 2;
      const piano = grp(-2.6, 0, -1.6); scene.add(piano); piano.add(mesh(geo('BoxGeometry', 1.4, 1.1, 0.6), mat('#111114', { rough: 0.2 }), 0, 0.55, 0)); piano.add(mesh(geo('BoxGeometry', 1.3, 0.04, 0.2), mat('#f2f2f4'), 0, 0.78, 0.35));
      for (let i = 0; i < 8; i++) { const t = mesh(geo('PlaneGeometry', 0.5, 0.04), mat(pick(['#ffd23f', '#5cc8b0', '#ff4f79']), { basic: true }), rnd(-2, 2), 0.006, rnd(-1.5, 1.5)); t.rotation.x = -Math.PI / 2; t.rotation.z = rnd(0, 3); scene.add(t); }
      for (let i = 0; i < 4; i++) { const ch = grp(1.2 + i * 0.6, 0, -2); scene.add(ch); ch.add(mesh(geo('BoxGeometry', 0.42, 0.04, 0.42), mat('#2a2a30'), 0, 0.45, 0)); ch.add(mesh(geo('BoxGeometry', 0.42, 0.4, 0.04), mat('#2a2a30'), 0, 0.66, -0.2)); }
      break; }
    case 'backstage': { fog('#1a1214'); addFloor(scene, '#3a2c28', 60, { rough: 0.8 });
      scene.add(mesh(geo('PlaneGeometry', 12, 6), mat('#4a3438'), 0, 3, -2.6));
      const mir = grp(0, 0, -2.5); scene.add(mir); mir.add(mesh(geo('PlaneGeometry', 2.6, 1.3), mat('#b9c8d2', { rough: 0.15, metal: 0.25 }), 0, 1.75, 0.01));
      for (let i = 0; i < 7; i++) for (const y of [1.06, 2.44]) mir.add(mesh(geo('SphereGeometry', 0.05, 8, 6), mat('#fff1c0', { basic: true }), -1.35 + i * 0.45, y, 0.03));
      for (let i = 0; i < 3; i++) for (const x of [-1.38, 1.38]) mir.add(mesh(geo('SphereGeometry', 0.05, 8, 6), mat('#fff1c0', { basic: true }), x, 1.4 + i * 0.35, 0.03));
      mir.add(mesh(geo('BoxGeometry', 3, 0.06, 0.6), mat('#2a2018'), 0, 0.85, 0.3)); const pl = new THREE.PointLight(0xffe0a0, 1.1, 6); pl.position.set(0, 1.8, -1.6); scene.add(pl);
      const rack = grp(2.4, 0, -1.4); scene.add(rack); put(rack, mesh(geo('CylinderGeometry', 0.015, 0.015, 1.4, 6), mat('#999', { metal: 0.8 }), 0, 1.6, 0)).rotation.x = Math.PI / 2; for (let i = 0; i < 6; i++) put(rack, mesh(geo('BoxGeometry', 0.4, 0.8, 0.05), mat(pick(['#8f1d2c', '#c9a227', '#2e8bff', '#1d1d24', '#e9e4d8'])), 0, 1.15, -0.55 + i * 0.22)).rotation.y = Math.PI / 2;
      break; }
    case 'awards': { scene.background = new THREE.Color('#120d08'); addFloor(scene, '#1a120c');
      scene.add(mesh(geo('CylinderGeometry', 3, 3.2, 0.4, 40), mat('#2b1e12'), 0, 0.2, 0));
      const statue = grp(-2.2, 0.4, -1.4); scene.add(statue); statue.add(mesh(geo('CylinderGeometry', 0.35, 0.4, 0.4, 16), mat('#111'), 0, 0.2)); statue.add(mesh(geo('CylinderGeometry', 0.15, 0.2, 2.2, 12), mat('#c9a227', { metal: 0.85, rough: 0.25 }), 0, 1.5)); statue.add(mesh(geo('SphereGeometry', 0.17, 14, 10), mat('#c9a227', { metal: 0.85, rough: 0.25 }), 0, 2.75));
      for (let i = 0; i < 9; i++) scene.add(mesh(geo('TorusGeometry', 4 + i * 0.4, 0.03, 6, 40, Math.PI), mat('#c9a227', { basic: true, opacity: 0.5 - i * 0.04 }), 0, 0.3, -3 - i * 0.3));
      break; }
    case 'gym': { fog('#1c1f26'); addFloor(scene, '#2a2d34', 60, { rough: 0.9 }); scene.add(mesh(geo('PlaneGeometry', 12, 6), mat('#3a3f4c'), 0, 3, -3));
      for (let i = 0; i < 3; i++) { const r = grp(-2 + i * 2, 0, -2.4); scene.add(r); put(r, mesh(geo('CylinderGeometry', 0.02, 0.02, 1.6, 6), mat('#aaa', { metal: 0.8 }), 0, 1.0, 0)).rotation.z = Math.PI / 2; for (const x of [-0.7, 0.7]) put(r, mesh(geo('CylinderGeometry', 0.22, 0.22, 0.08, 16), mat('#111'), x, 1.0, 0)).rotation.z = Math.PI / 2; }
      break; }
    default: { // green screen
      scene.background = new THREE.Color('#1a1d24'); addFloor(scene, '#2fbf4a', 30, { rough: 0.9 }); const g = mesh(geo('CylinderGeometry', 6, 6, 6, 32, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#2fbf4a', { side: THREE.BackSide, rough: 0.9 }), 0, 3, 1.5); scene.add(g);
      for (let i = 0; i < 14; i++) scene.add(mesh(geo('BoxGeometry', 0.08, 0.08, 0.01), mat('#ffffff', { basic: true }), rnd(-4, 4), rnd(0.5, 5), rnd(-3.5, -2.5)));
    }
  }
}
// behind-the-scenes crew around a set
function addCrew(scene, things, o = {}) {
  const cam = grp(2.0, 0, 2.2); scene.add(cam); cam.rotation.y = 0.75;
  cam.add(mesh(geo('BoxGeometry', 0.6, 0.06, 1.0), mat('#222'), 0, 0.12, 0)); for (const [x, z] of [[-0.25, 0.4], [0.25, 0.4], [-0.25, -0.4], [0.25, -0.4]]) put(cam, mesh(geo('CylinderGeometry', 0.06, 0.06, 0.05, 10), mat('#111'), x, 0.05, z)).rotation.z = Math.PI / 2;
  cam.add(mesh(geo('CylinderGeometry', 0.04, 0.06, 1.1, 8), mat('#333', { metal: 0.6 }), 0, 0.7, 0)); cam.add(mesh(geo('BoxGeometry', 0.3, 0.28, 0.5), mat('#1d1d24', { metal: 0.3, rough: 0.4 }), 0, 1.4, 0)); put(cam, mesh(geo('CylinderGeometry', 0.1, 0.12, 0.25, 14), mat('#111'), 0, 1.4, -0.36)).rotation.x = Math.PI / 2;
  const tally = mesh(geo('SphereGeometry', 0.025, 8, 6), mat('#ff2a2a', { basic: true }), 0.12, 1.58, -0.2); cam.add(tally); things.push({ o: tally, kind: 'blink', ph: 0 });
  const boom = grp(-2.4, 0, 1.0); scene.add(boom); boom.add(mesh(geo('CylinderGeometry', 0.02, 0.02, 2.2, 6), mat('#444'), 0, 1.1, 0)); const pole = mesh(geo('CylinderGeometry', 0.012, 0.012, 2.2, 6), mat('#777', { metal: 0.6 }), 1.05, 2.45, -0.45); pole.rotation.z = -1.25; pole.rotation.y = 0.4; boom.add(pole); const micB = mesh(geo('CylinderGeometry', 0.045, 0.045, 0.32, 10), mat('#6a6a70', { rough: 0.9 }), 2.05, 2.75, -0.85); micB.rotation.z = Math.PI / 2; boom.add(micB);
  for (const [x, z] of [[-3, -0.5], [3, -0.6]]) { const st = grp(x, 0, z); scene.add(st); st.add(mesh(geo('CylinderGeometry', 0.02, 0.02, 2.4, 6), mat('#444'), 0, 1.2, 0)); const lp = mesh(geo('BoxGeometry', 0.5, 0.4, 0.15), mat('#f4f4f6', { emissive: '#fff6e0', ei: 0.9 }), 0, 2.4, 0); lp.lookAt(0, 1.2, 0); st.add(lp); }
  const chair = grp(-2.6, 0, 2.6); scene.add(chair); chair.rotation.y = -0.6; chair.add(mesh(geo('BoxGeometry', 0.5, 0.04, 0.4), mat('#222'), 0, 0.6, 0)); chair.add(mesh(geo('BoxGeometry', 0.5, 0.3, 0.03), mat('#c9a227'), 0, 0.85, -0.2));
  for (const [x, z] of [[-0.22, -0.18], [0.22, -0.18], [-0.22, 0.18], [0.22, 0.18]]) chair.add(mesh(geo('CylinderGeometry', 0.015, 0.015, 0.6, 5), mat('#5a4030'), x, 0.3, z));
  const dir = L3.figure(L3.lookFor(o.director || 'Director', { top: 'jacket' })); dir.position.set(-2.1, 0, 2.2); dir.rotation.y = -2.4; dir.scale.multiplyScalar(0.98); scene.add(dir); things.push({ o: dir, kind: 'fig', mode: 'point' });
}
function addCrowd(scene, n, z0, o = {}) {
  if (o.sides) { const base = []; const D = DD(); const cg = new THREE.CylinderGeometry(0.15, 0.17, 0.75, 7), hg = new THREE.SphereGeometry(0.12, 10, 8); const body = new THREE.InstancedMesh(cg, mat('#2b2a3a'), n), heads = new THREE.InstancedMesh(hg, mat('#ffffff'), n); const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const sx = i % 2 ? 1 : -1; const x = sx * (1.9 + (Math.floor(i / 2) % 2) * 0.45), z = 1.2 - Math.floor(i / 4) * 0.7; base.push([x, z, Math.random() * 6]); m4.setPosition(x, 0.37, z); body.setMatrixAt(i, m4); m4.setPosition(x, 0.86, z); heads.setMatrixAt(i, m4); if (heads.setColorAt) heads.setColorAt(i, new THREE.Color(D.SKINS[i % D.SKINS.length])); }
    scene.add(body); scene.add(heads); return { body, heads, base, n, m4 }; }
  const D = DD(); const cg = new THREE.CylinderGeometry(0.15, 0.17, 0.75, 7), hg = new THREE.SphereGeometry(0.12, 10, 8);
  const body = new THREE.InstancedMesh(cg, mat('#2b2a3a'), n), heads = new THREE.InstancedMesh(hg, mat('#ffffff'), n); const m4 = new THREE.Matrix4(); const base = [];
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 20); const x = (i % 20 - 9.5) * 0.45 + rnd(-0.1, 0.1); const z = z0 + row * 0.55; base.push([x, z, Math.random() * 6]); m4.setPosition(x, 0.37, z); body.setMatrixAt(i, m4); m4.setPosition(x, 0.86, z); heads.setMatrixAt(i, m4); if (heads.setColorAt) heads.setColorAt(i, new THREE.Color(D.SKINS[i % D.SKINS.length])); if (body.setColorAt) body.setColorAt(i, new THREE.Color(pick(['#2b2a3a', '#3a2b2b', '#1f3a5f', '#4a4a52']))); }
  scene.add(body); scene.add(heads); return { body, heads, base, n, m4 };
}

// ------------------------------------------------------------------ fx
function fx(scene, kind, things) {
  if (kind === 'rain') { const n = 500, pos = new Float32Array(n * 6); for (let i = 0; i < n; i++) { const x = rnd(-6, 6), y = rnd(0, 7), z = rnd(-4, 4); pos.set([x, y, z, x + 0.02, y - 0.25, z], i * 6); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x9fb6d9, transparent: true, opacity: 0.55 })); scene.add(l); things.push({ o: l, kind: 'rain' }); }
  if (kind === 'embers' || kind === 'snow' || kind === 'stars') { const n = 260, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) pos.set([rnd(-6, 6), rnd(0, 6), rnd(-4, 3)], i * 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ color: kind === 'embers' ? 0xffa040 : 0xffffff, size: kind === 'stars' ? 0.04 : 0.06, transparent: true, opacity: 0.85 })); scene.add(p); things.push({ o: p, kind }); }
  if (kind === 'boom') { const b = mesh(geo('SphereGeometry', 1, 20, 14), mat('#ffb347', { basic: true, opacity: 0.9, add: true }), rnd(-2.5, 2.5), 1.2, -2.5); b.scale.setScalar(0.01); scene.add(b); const pl = new THREE.PointLight(0xff8a30, 0, 14); pl.position.copy(b.position); scene.add(pl); things.push({ o: b, kind: 'boom', l: pl, t0: Math.random() * 2 }); }
  if (kind === 'flashes') { for (let i = 0; i < 16; i++) { const f = mesh(geo('SphereGeometry', 0.06, 8, 6), mat('#ffffff', { basic: true, opacity: 0, add: true }), (i % 2 ? 1 : -1) * rnd(1.8, 4), rnd(1.1, 2.2), rnd(-0.5, 4)); scene.add(f); things.push({ o: f, kind: 'flash', ph: Math.random() * 10 }); } }
}
function tickThings(things, t, dt) {
  for (const th of things) {
    if (th.kind === 'flicker') th.o.visible = Math.sin(t * 13 + (th.ph || 0)) > -0.92;
    else if (th.kind === 'blink') th.o.visible = Math.sin(t * 3 + th.ph) > 0;
    else if (th.kind === 'flame') { th.o.scale.y = 1 + Math.sin(t * 17) * 0.2; th.o.scale.x = 1 + Math.sin(t * 11) * 0.1; }
    else if (th.kind === 'torch') th.o.intensity = 0.8 + Math.sin(t * 13) * 0.15;
    else if (th.kind === 'firefly') { th.o.position.y = th.y + Math.sin(t + th.ph) * 0.2; th.o.visible = Math.sin(t * 2 + th.ph) > -0.3; }
    else if (th.kind === 'horrorlight') { const on = Math.sin(t * 9) + Math.sin(t * 23) > -0.6; th.o.intensity = on ? 1.2 : 0.05; th.b.visible = on; }
    else if (th.kind === 'rain') { th.o.position.y = -((t * 9) % 3.5); }
    else if (th.kind === 'embers') { th.o.position.y = (t * 0.4) % 2; th.o.rotation.y = t * 0.05; }
    else if (th.kind === 'snow') { th.o.position.y = -((t * 0.5) % 2); }
    else if (th.kind === 'stars') th.o.rotation.y = t * 0.02;
    else if (th.kind === 'boom') { const p = ((t + th.t0) % 2.6) / 0.9; if (p < 1) { th.o.scale.setScalar(0.2 + p * 1.6); th.o.material.opacity = 0.9 * (1 - p); th.l.intensity = 3 * (1 - p); } else { th.o.scale.setScalar(0.01); th.l.intensity = 0; } }
    else if (th.kind === 'flash') { const v = Math.sin(t * 3 + th.ph); th.o.material.opacity = v > 0.95 ? 1 : 0; th.o.scale.setScalar(v > 0.95 ? 3 : 1); }
    else if (th.kind === 'fig') animate(th.o, t + (th.off || 0), th.mode);
  }
}

// ------------------------------------------------------------------ scenes
// opts: mode (set|carpet|awards|theater|studio|event), set, anim, cast (looks), crew, fx [kinds], title, win, snl, color, shots
L3.scene = function (el, look, opts = {}) {
  if (!L3.available()) return null;
  const mode = opts.mode || 'set';
  const scene = new THREE.Scene(); const things = [];
  const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 90);
  const L = lights(scene, mode === 'awards' || mode === 'theater' ? { amb: 0.5, key: 0xffe0b0 } : mode === 'set' && opts.set === 'horror' ? { amb: 0.35, ki: 0.4 } : {});
  const me = L3.figure(look); scene.add(me);
  const cast = (opts.cast || []).slice(0, 3).map((lk, i) => { const f = L3.figure(lk); const side = i % 2 ? -1 : 1; f.position.set(side * (0.95 + Math.floor(i / 2) * 0.7), 0, -0.25 - Math.floor(i / 2) * 0.4); f.rotation.y = -side * 0.55; scene.add(f); things.push({ o: f, kind: 'fig', mode: opts.castAnim || 'talk', off: i * 1.3 }); return f; });
  let crowd = null;
  if (mode === 'set' || mode === 'event') { buildSet(scene, opts.set || 'green', things, opts); if (opts.crew) addCrew(scene, things, opts); }
  else if (mode === 'carpet') {
    buildSet(scene, 'carpet', things, opts);
    fx(scene, 'flashes', things); crowd = addCrowd(scene, 24, 0, { sides: true }); me.position.z = 0.3;
  } else if (mode === 'awards') {
    buildSet(scene, 'awards', things, opts); me.position.y = 0.4;
    scene.add(mesh(geo('BoxGeometry', 0.6, 1.1, 0.4), mat('#6b4f1d', { metal: 0.4, rough: 0.4 }), 1.1, 0.95, 0.4));
    if (opts.win) { const tr = grp(0, -0.06, 0.05); tr.add(mesh(geo('CylinderGeometry', 0.025, 0.035, 0.22, 10), mat('#d8b04a', { metal: 0.9, rough: 0.2 }), 0, 0.11)); tr.add(mesh(geo('SphereGeometry', 0.03, 10, 8), mat('#d8b04a', { metal: 0.9, rough: 0.2 }), 0, 0.25)); me.userData.arms[1].hand.add(tr); }
    const spot = new THREE.SpotLight(0xfff1d6, 1.5, 20, 0.35, 0.5); spot.position.set(0, 9, 4); spot.target = me; scene.add(spot);
    crowd = addCrowd(scene, 60, 4.2);
  } else if (mode === 'theater') {
    buildSet(scene, 'stage', things); me.position.y = 0; crowd = addCrowd(scene, 80, 4.4);
    for (let i = 0; i < 12; i++) scene.add(mesh(geo('SphereGeometry', 0.05, 8, 6), mat('#ffe8b0', { basic: true }), -4 + i * 0.73, 0.02, 1.55));
  } else if (mode === 'studio') {
    scene.background = new THREE.Color('#0b0d16'); addFloor(scene, '#14161f'); addBackdrop(scene, skyline(opts.snl ? '#1a0f2e' : '#0e1a3a', opts.snl ? '#3a1530' : '#2a3a6a', opts.snl ? 'LIVE FROM NEW YORK' : ''), 12, 6, -3, 3);
    if (opts.snl) { scene.add(mesh(geo('CylinderGeometry', 2.4, 2.6, 0.25, 32), mat('#6b5a8a'), 0, 0.12, 0)); me.position.y = 0.25; for (let i = 0; i < 18; i++) { const b = mesh(geo('SphereGeometry', 0.08, 8, 6), mat(i % 2 ? '#ffd23f' : '#ff4f79', { basic: true }), Math.cos(i / 18 * Math.PI) * 3.2, 0.3 + Math.sin(i / 18 * Math.PI) * 4, -2.9); scene.add(b); things.push({ o: b, kind: 'blink', ph: i }); } }
    else { const desk = mesh(geo('BoxGeometry', 1.6, 0.9, 0.8), mat('#5b3a22'), 1.7, 0.45, -0.4); scene.add(desk); const host = L3.figure(L3.lookFor(opts.host || 'Host', { top: 'suit', fem: false })); host.position.set(1.7, 0, -1.1); host.rotation.y = -0.5; scene.add(host); things.push({ o: host, kind: 'fig', mode: 'talk', off: 1 });
      const couch = grp(-0.7, 0, -0.6); scene.add(couch); couch.add(mesh(geo('BoxGeometry', 2, 0.45, 0.8), mat('#3c4a7a'), 0, 0.25, 0)); couch.add(mesh(geo('BoxGeometry', 2, 0.6, 0.2), mat('#33406b'), 0, 0.6, -0.35)); me.position.set(-0.3, 0, 0.2); me.rotation.y = 0.35; }
    crowd = addCrowd(scene, 40, 3.4);
  }
  (opts.fx || []).forEach(k => fx(scene, k, things));
  const anim = opts.anim || (mode === 'carpet' || mode === 'theater' ? 'pose' : opts.win ? 'hold' : 'idle');
  // camera shots
  const shots = opts.shots || ({ carpet: [[0, 1.5, 4.4, 0, 1.25, 0], [1.4, 1.65, 2.2, 0, 1.5, 0], [-2, 1, 3.2, 0, 1.2, 0]], awards: [[0, 1.7, 5.5, 0, 1.4, 0], [0.5, 1.95, 2.3, 0, 1.85, 0], [-3, 1.4, 5, 0, 1.3, 0]], theater: [[0, 2.9, 9.5, 0, 1.2, 0], [1, 1.6, 3.4, 0, 1.5, 0], [-3, 2.6, 6.5, 0, 1.3, 0]], studio: [[0, 1.6, 5, 0, 1.2, 0], [1.6, 1.55, 2.8, 0, 1.4, 0], [-1.6, 1.4, 3.2, 0, 1.3, 0]] }[mode]) || (opts.crew ? [[0.3, 1.55, 4.3, 0, 1.15, 0], [0.9, 1.62, 2.1, 0, 1.5, 0], [-3.2, 2.2, 5.2, -0.6, 1.0, 0], [0, 1.6, 1.7, 0, 1.58, 0]] : [[0, 1.45, 4, 0, 1.15, 0], [0.9, 1.62, 2.0, 0, 1.52, 0], [-1.8, 1.1, 3.4, 0, 1.3, 0], [0, 2.2, 5.4, 0, 1, 0]]);
  let cut = 0, cutT = 0; const setShot = i => { const s = shots[i % shots.length]; cam.position.set(s[0], s[1], s[2]); cam.lookAt(s[3], s[4], s[5]); cam.userData.base = s; }; setShot(0);
  let curAnim = anim;
  const ctl = mount(el, scene, cam, (dt, t) => {
    animate(me, t, curAnim);
    tickThings(things, t, dt);
    if (crowd) { for (let i = 0; i < crowd.n; i++) { const [x, z, p] = crowd.base[i]; const j = Math.max(0, Math.sin(t * 6 + p)) * (mode === 'awards' ? 0.03 : 0.1); crowd.m4.setPosition(x, 0.37 + j, z); crowd.body.setMatrixAt(i, crowd.m4); crowd.m4.setPosition(x, 0.86 + j, z); crowd.heads.setMatrixAt(i, crowd.m4); } crowd.body.instanceMatrix.needsUpdate = true; crowd.heads.instanceMatrix.needsUpdate = true; }
    cutT += dt; if (opts.cuts !== false && cutT > 3.4) { cutT = 0; cut++; setShot(cut); }
    const b = cam.userData.base; cam.position.x = b[0] + Math.sin(t * 0.35) * 0.08; cam.position.z = b[2] - cutT * 0.05;
  });
  ctl.setAnim = a => { curAnim = a; };
  ctl.react = good => { curAnim = good ? 'cheer' : 'sad'; for (const th of things) if (th.kind === 'fig') th.mode = good ? 'cheer' : 'idle'; };
  return ctl;
};

// ------------------------------------------------------------------ stills (photos for the phone)
// spec: { id, set, look, cast: [looks], anim, castAnim, cam: wide|close|selfie|group, title, t, fx }
L3.stillCache = {};
let sr = null;
L3.still = function (spec, size = 320) {
  if (!L3.available()) return null;
  const key = spec.id + ':' + size; if (L3.stillCache[key]) return L3.stillCache[key];
  try {
    if (!sr) sr = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    sr.setPixelRatio(1); sr.setSize(size, size);
    const scene = new THREE.Scene(); const things = []; lights(scene, spec.set === 'horror' ? { amb: 0.4 } : {});
    buildSet(scene, spec.set || 'home', things, { title: spec.title });
    (spec.fx || []).forEach(k => fx(scene, k, things));
    const me = L3.figure(spec.look); scene.add(me);
    const t = spec.t != null ? spec.t : (hash(spec.id) % 100) / 10;
    (spec.cast || []).slice(0, 2).forEach((lk, i) => { const f = L3.figure(lk); const side = i ? -1 : 1; f.position.set(side * (spec.cam === 'selfie' ? 0.42 : 0.75), 0, spec.cam === 'selfie' ? -0.15 : -0.1); f.rotation.y = -side * (spec.cam === 'selfie' ? 0.15 : 0.35); animate(f, t + i, spec.castAnim || 'pose'); scene.add(f); });
    let anim = spec.anim || 'pose';
    if (spec.cam === 'selfie') { anim = spec.anim && spec.anim !== 'pose' ? spec.anim : 'idle'; me.rotation.y = 0.12; }
    animate(me, t, anim);
    tickThings(things, t + 0.2, 0.016);
    const cam = new THREE.PerspectiveCamera(spec.cam === 'selfie' ? 46 : 34, 1, 0.1, 90);
    const off = (hash(spec.id) % 7 - 3) * 0.12;
    if (spec.cam === 'close') { cam.position.set(0.25 + off * 0.3, 1.68, 1.25); cam.lookAt(0, 1.6, 0); }
    else if (spec.cam === 'selfie') { cam.position.set(0.32, 1.9, 1.05); cam.lookAt(0, 1.55, 0); }
    else if (spec.cam === 'group') { cam.position.set(off, 1.45, 3.1); cam.lookAt(0, 1.2, 0); }
    else { cam.position.set(0.6 + off, 1.4, 3.6); cam.lookAt(0, 1.1, 0); }
    sr.render(scene, cam); const url = sr.domElement.toDataURL('image/jpeg', 0.85);
    L3.stillCache[key] = url; return url;
  } catch (e) { return null; }
};

// ------------------------------------------------------------------ trailers
// spec: { look, cast:[looks], set, genre, fid color, title, cards:[...], onCard(text, kind), onEnd }
L3.trailer = function (el, spec) {
  if (!L3.available()) return null;
  const scene = new THREE.Scene(); const things = []; lights(scene, { amb: 0.6 });
  buildSet(scene, spec.set || 'green', things, { color: spec.color });
  const me = L3.figure(spec.look); scene.add(me);
  const cast = (spec.cast || []).slice(0, 2).map((lk, i) => { const f = L3.figure(lk); f.position.set(i ? -1.2 : 1.3, 0, -0.6); f.rotation.y = i ? 0.6 : -0.6; scene.add(f); return f; });
  const g = spec.genre; const action = ['superhero', 'action', 'scifi', 'fantasy'].includes(g); const dark = ['horror', 'thriller'].includes(g);
  if (action) { fx(scene, 'boom', things); fx(scene, 'embers', things); } if (dark) fx(scene, 'rain', things); if (g === 'romance' || g === 'drama') fx(scene, 'snow', things); if (g === 'scifi') fx(scene, 'stars', things);
  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 90);
  // shots: [duration, from cam, to cam, target, my anim, cast anim, card text]
  const T = spec.cards || [];
  const shots = [
    { d: 2.6, a: [0, 2.6, 8], b: [0, 1.8, 5.5], t: [0, 1.1, 0], an: 'idle', card: T[0] },
    { d: 2.2, a: [0.9, 1.62, 1.9], b: [0.5, 1.6, 1.45], t: [0, 1.58, 0], an: 'idle' },
    { d: 2.2, a: [-2.2, 1.5, 3], b: [-1.6, 1.5, 2.4], t: [0.6, 1.3, -0.4], an: 'talk', can: 'talk', card: T[1] },
    { d: 2.6, a: [2.4, 0.5, 3.2], b: [1.4, 0.6, 2.4], t: [0, 1.2, 0], an: action ? 'run' : dark ? 'sad' : 'walk', card: T[2] },
    { d: 1.4, black: true, card: T[3] },
    { d: 1.1, a: [0, 1.4, 3.2], b: [0, 1.4, 2.6], t: [0, 1.3, 0], an: action ? 'fight' : 'talk' },
    { d: 1.1, a: [-1.4, 1.8, 2.2], b: [-1.1, 1.7, 1.9], t: [0, 1.5, 0], an: action ? 'fight' : 'point' },
    { d: 1.1, a: [1.8, 2.8, 3.2], b: [1.5, 2.4, 2.8], t: [0, 1.1, 0], an: action ? 'run' : 'idle' },
    { d: 3.0, a: [0, 0.35, 3.6], b: [0, 0.4, 2.7], t: [0, 1.4, 0], an: action ? 'hero' : 'pose', card: T[4] },
    { d: 3.4, black: true, card: T[5], kind: 'title' },
    { d: 1.8, black: true, card: T[6], kind: 'date' },
  ];
  let i = -1, st = 0; const total = shots.length; let done = false;
  const next = () => { i++; st = 0; if (i >= total) { done = true; spec.onEnd && spec.onEnd(); return; } const s = shots[i]; spec.onCard && spec.onCard(s.card || null, s.kind || (s.black ? 'black' : 'over'), s.black); if (!s.black) { cam.position.set(...s.a); cam.lookAt(...s.t); } };
  next();
  const ctl = mount(el, scene, cam, (dt, t) => {
    if (done) return; st += dt; const s = shots[i];
    if (!s.black) { const p = Math.min(1, st / s.d); const e = p * p * (3 - 2 * p); cam.position.set(s.a[0] + (s.b[0] - s.a[0]) * e, s.a[1] + (s.b[1] - s.a[1]) * e, s.a[2] + (s.b[2] - s.a[2]) * e); cam.lookAt(...s.t); animate(me, t, s.an); cast.forEach((f, k) => animate(f, t + k, s.can || 'idle')); }
    tickThings(things, t, dt);
    if (st >= s.d) next();
  });
  ctl.skip = () => { done = true; spec.onEnd && spec.onEnd(); };
  return ctl;
};
})();
