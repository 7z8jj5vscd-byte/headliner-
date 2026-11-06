/* Dream Academy: Story Mode. 3D toon figures and sets (three.js r128).
   Figures are stylized from each member's editable look: skin, hair colour and hair style. */
(function () {
const S3 = window.S3 = { ok:null, cur:null };
S3.available = () => {
  if (S3.ok !== null) return S3.ok;
  try { if (!window.THREE) throw 0; const c = document.createElement('canvas'); S3.ok = !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
  catch (e) { S3.ok = false; }
  return S3.ok;
};
let GRAD = null;
function grad() {
  if (!GRAD) { GRAD = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.LuminanceFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true; }
  return GRAD;
}
const col = c => new THREE.Color(c).convertSRGBToLinear();
const mat = (c, o) => { o = Object.assign({}, o || {}); if (o.emissive) o.emissive = col(o.emissive); return new THREE.MeshToonMaterial(Object.assign({ color:col(c), gradientMap:grad() }, o)); };
const basic = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color:col(c) }, o || {}));
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = v => Math.round(Math.max(0, Math.min(255, f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1); }
S3.shade = shade;

/* ---------- Figure ---------- */
// p: { look:{ skin, hair, style }, outfit, accent, pants:bool, seated:bool }
function figure(p) {
  const L = p.look || {}, skin = L.skin || '#d8ad88', hair = L.hair || '#1d130d', st = L.style || 'long';
  const out = p.outfit || '#3a3f4a', acc = p.accent || shade(out, .35);
  const G = new THREE.Group(), R = { root:G };
  const M = (geo, m, x, y, z, par) => { const me = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m); me.position.set(x || 0, y || 0, z || 0); (par || G).add(me); return me; };
  // hips pivot
  const H = new THREE.Group(); H.position.y = .86; G.add(H); R.hips = H;
  R.legs = [-1, 1].map(s => {
    const leg = new THREE.Group(); leg.position.set(s * .085, 0, 0); H.add(leg);
    M(new THREE.CylinderGeometry(.068, .056, .46, 10), p.pants ? shade(out, -.35) : skin, 0, -.23, 0, leg);
    const knee = new THREE.Group(); knee.position.y = -.46; leg.add(knee);
    M(new THREE.CylinderGeometry(.056, .048, .4, 10), p.pants ? shade(out, -.35) : skin, 0, -.2, 0, knee);
    M(new THREE.BoxGeometry(.1, .07, .2), p.shoes || '#ecebe6', 0, -.41, .04, knee);
    leg.userData.knee = knee; return leg;
  });
  // torso
  const T = new THREE.Group(); H.add(T); R.torso = T;
  M(new THREE.CylinderGeometry(.15, .13, .5, 14), out, 0, .27, 0, T);
  M(new THREE.SphereGeometry(.15, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), out, 0, .51, 0, T).scale.set(1, .4, .9);
  if (!p.pants) M(new THREE.CylinderGeometry(.14, .21, .2, 16, 1, true), mat(shade(out, -.2), { side:THREE.DoubleSide }), 0, -.04, 0, T);
  else M(new THREE.CylinderGeometry(.14, .145, .1, 14), shade(out, -.35), 0, .0, 0, T);
  M(new THREE.BoxGeometry(.16, .03, .01), acc, 0, .4, .14, T);
  // arms
  R.arms = [-1, 1].map(s => {
    const sh = new THREE.Group(); sh.position.set(s * .19, .47, 0); T.add(sh);
    M(new THREE.SphereGeometry(.055, 10, 8), out, 0, 0, 0, sh);
    M(new THREE.CylinderGeometry(.045, .04, .28, 10), skin, 0, -.15, 0, sh);
    const el = new THREE.Group(); el.position.y = -.29; sh.add(el);
    M(new THREE.CylinderGeometry(.04, .034, .26, 10), skin, 0, -.13, 0, el);
    M(new THREE.SphereGeometry(.042, 10, 8), skin, 0, -.28, 0, el);
    sh.userData.el = el; sh.userData.s = s; return sh;
  });
  // head
  const N = new THREE.Group(); N.position.y = .56; T.add(N); R.head = N;
  M(new THREE.CylinderGeometry(.045, .05, .09, 10), skin, 0, .03, 0, N);
  const hd = new THREE.Group(); hd.position.y = .19; N.add(hd); R.hd = hd;
  M(new THREE.SphereGeometry(.13, 18, 14), skin, 0, 0, 0, hd).scale.set(.95, 1.08, 1);
  [-1, 1].forEach(s => { M(new THREE.SphereGeometry(.017, 8, 6), '#1a1414', s * .045, .0, .118, hd); M(new THREE.BoxGeometry(.04, .008, .01), shade(hair, .15), s * .047, .045, .118, hd); });
  M(new THREE.BoxGeometry(.04, .009, .01), '#9c4a4a', 0, -.058, .12, hd);
  const hm = mat(hair);
  // Hair shell: full top, sides and back down past the ears, with only the face left open, plus bangs.
  const hs = mat(hair, { side:THREE.DoubleSide }), H2 = Math.PI / 2;
  M(new THREE.SphereGeometry(.152, 22, 12, 0, Math.PI * 2, 0, Math.PI * .36), hs, 0, .014, -.004, hd).scale.set(1.02, 1.1, 1.04);
  M(new THREE.SphereGeometry(.153, 22, 14, H2 + .78, Math.PI * 2 - 1.56, 0, Math.PI * .7), hs, 0, .014, -.008, hd).scale.set(1.03, 1.1, 1.04);
  M(new THREE.SphereGeometry(.151, 18, 6, H2 - .8, 1.6, Math.PI * .3, Math.PI * .12), hs, 0, .014, 0, hd).scale.set(1.02, 1.1, 1.06);
  [-1, 1].forEach(sd => { const lk = M(new THREE.BoxGeometry(.035, st === 'bob' ? .17 : st === 'curly' ? .1 : .2, .06), hm, sd * .122, -.04, .055, hd); lk.rotation.z = sd * .06; });
  if (st === 'long' || st === 'wavy') {
    const b = M(new THREE.CylinderGeometry(.14, st === 'wavy' ? .19 : .16, .42, 16, 1, true, Math.PI * .55, Math.PI * .9), mat(hair, { side:THREE.DoubleSide }), 0, -.16, -.01, hd);
    if (st === 'wavy') for (let i = 0; i < 8; i++) { const a = Math.PI * (.65 + i * .1); M(new THREE.SphereGeometry(.045, 8, 6), hm, Math.sin(a) * .17, -.33 + (i % 2) * .04, Math.cos(a) * .17, hd); }
    [-1, 1].forEach(s => M(new THREE.BoxGeometry(.04, .32, .08), hm, s * .13, -.14, .02, hd));
  }
  if (st === 'curly') { for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, y = -.12 + (i % 3) * .1; if (Math.cos(a) > .55 && y < .05) continue;
    M(new THREE.SphereGeometry(.06, 8, 6), hm, Math.sin(a) * .16, y + .06, Math.cos(a) * .15 - .02, hd); } }
  if (st === 'bob') { const b = M(new THREE.CylinderGeometry(.15, .165, .2, 16, 1, true, Math.PI * .6, Math.PI * .8), mat(hair, { side:THREE.DoubleSide }), 0, -.06, 0, hd); }
  if (st === 'pony') { const t = M(new THREE.ConeGeometry(.06, .34, 10), hm, 0, -.08, -.17, hd); t.rotation.x = -.35; t.rotation.z = Math.PI; }
  if (st === 'bun') M(new THREE.SphereGeometry(.07, 10, 8), hm, 0, .12, -.1, hd);
  // fringe
  if (p.seated) { R.legs.forEach(l => { l.rotation.x = -1.5; l.userData.knee.rotation.x = 1.5; }); G.position.y = -.38; }
  R.base = { y:G.position.y };
  return R;
}
S3.figure = figure;

/* ---------- Moves ----------
   Each move sets limb rotations from phase p (0..1 over one beat-pair). */
const MOVES = {
  idle:(R, p, t) => { R.hips.rotation.z = Math.sin(t * 1.3) * .03; arms(R, .12, .12, .2, .2); R.hd.rotation.y = Math.sin(t * .7) * .15; },
  wave:(R, p) => { const a = Math.sin(p * Math.PI * 2); arms(R, 2.6 + a * .3, 2.6 - a * .3, .3, .3, a * .4, -a * .4); R.hips.rotation.z = a * .08; },
  hips:(R, p) => { const a = Math.sin(p * Math.PI * 2); R.hips.rotation.z = a * .18; R.hips.position.x = a * .06; arms(R, .4, .4, 1.6, 1.6, .9, -.9); R.hd.rotation.z = -a * .1; },
  step:(R, p) => { const a = Math.sin(p * Math.PI * 2); R.root.position.x += a * .004; R.legs[0].rotation.z = Math.max(0, a) * .35; R.legs[1].rotation.z = Math.min(0, a) * .35;
    arms(R, 1 + a * .6, 1 - a * .6, 1.2, 1.2); },
  point:(R, p) => { const a = p < .5 ? 1 : 0; arms(R, a ? 2.9 : .3, a ? .3 : 2.9, .1, .1, a ? .2 : 0, a ? 0 : -.2); R.torso.rotation.y = a ? -.25 : .25; },
  jump:(R, p) => { const j = Math.max(0, Math.sin(p * Math.PI * 2)); R.root.position.y = R.base.y + j * .18; arms(R, 2.4 * j + .3, 2.4 * j + .3, .2, .2, .5, -.5);
    R.legs.forEach(l => { l.rotation.x = -j * .4; l.userData.knee.rotation.x = j * .8; }); },
  spin:(R, p) => { R.root.rotation.y = R.root.userData.face + p * Math.PI * 2; arms(R, 1.4, 1.4, .2, .2, 1.2, -1.2); },
  clap:(R, p) => { const a = Math.abs(Math.sin(p * Math.PI * 2)); arms(R, 1.3, 1.3, .9, .9, -.2 - a * .6, .2 + a * .6); },
  body:(R, p) => { const a = Math.sin(p * Math.PI * 2); R.torso.rotation.x = a * .18; R.hips.position.z = -a * .04; arms(R, .7, .7, 1.9, 1.9, .5, -.5); R.legs.forEach(l => { l.userData.knee.rotation.x = (1 + a) * .2; }); },
  fairy:(R) => { arms(R, 2.3, 2.3, 2.5, 2.5, -.4, .4); R.hd.rotation.z = .22; R.torso.rotation.y = .1; },
  bow:(R, p) => { R.torso.rotation.x = .7; arms(R, .1, .1, .1, .1); },
  talk:(R, p, t) => { const a = Math.sin(t * 5.2), b = Math.sin(t * 3.1 + 1); arms(R, .35 + Math.max(0, a) * .5, .2 + Math.max(0, b) * .35, .9 + a * .3, .4, -.1, .1); R.hd.rotation.x = Math.sin(t * 6) * .05; R.hd.rotation.y = Math.sin(t * 1.4) * .12; },
  cry:(R, p, t) => { arms(R, 2.2, 2.2, 2.6, 2.6, -.5, .5); R.hd.rotation.x = .35; R.torso.rotation.x = .15 + Math.sin(t * 7) * .02; },
  cheer:(R, p) => { const j = Math.abs(Math.sin(p * Math.PI * 2)); R.root.position.y = R.base.y + j * .12; arms(R, 2.9, 2.9, .2, .2, .4, -.4); },
  hug:(R) => { arms(R, 1.5, 1.5, 1.2, 1.2, -.6, .6); R.torso.rotation.x = .1; },
  sit:(R, p, t) => { arms(R, .9, .9, 1.4, 1.4); R.hd.rotation.y = Math.sin(t * .6) * .2; },
  // Mirror game directions
  L:(R) => { arms(R, .4, 1.6, .2, .2, 0, -1.2); R.hips.position.x = -.08; R.torso.rotation.z = .12; R.legs[1].rotation.z = .3; },
  R:(R) => { arms(R, 1.6, .4, .2, .2, 1.2, 0); R.hips.position.x = .08; R.torso.rotation.z = -.12; R.legs[0].rotation.z = -.3; },
  U:(R) => { arms(R, 3, 3, 0, 0, .25, -.25); R.root.position.y = R.base.y + .06; },
  D:(R) => { arms(R, .5, .5, 1.6, 1.6, .6, -.6); R.legs.forEach(l => { l.rotation.x = -.6; l.userData.knee.rotation.x = 1.1; }); R.root.position.y = R.base.y - .14; R.torso.rotation.x = .3; },
};
S3.MOVES = Object.keys(MOVES);
function arms(R, l, r, le, re, lz, rz) {
  const [A, B] = R.arms;
  A.rotation.x = -l; B.rotation.x = -r; A.rotation.z = lz || -.08; B.rotation.z = rz || .08;
  A.userData.el.rotation.x = -(le || 0); B.userData.el.rotation.x = -(re || 0);
}
function resetPose(R) {
  R.hips.rotation.set(0, 0, 0); R.hips.position.set(0, .86, 0); R.torso.rotation.set(0, 0, 0); R.hd.rotation.set(0, 0, 0);
  R.root.position.y = R.base.y; R.root.rotation.y = R.root.userData.face || 0;
  if (!R.seated) R.legs.forEach(l => { l.rotation.set(0, 0, 0); l.userData.knee.rotation.set(0, 0, 0); });
  arms(R, .1, .1, .1, .1);
}

/* ---------- Sets ---------- */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function buildSet(scene, kind, o) {
  const add = (geo, m, x, y, z) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); scene.add(me); return me; };
  const anim = [];
  scene.add(new THREE.HemisphereLight(0xffffff, 0x303040, .75));
  const key = new THREE.DirectionalLight(0xffffff, .8); key.position.set(2, 5, 4); scene.add(key);
  if (kind === 'practice' || kind === 'eval') {
    const floor = add(new THREE.PlaneGeometry(14, 10), mat('#7a5a3c'), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
    const ft = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7a5a3c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5e432c'; g.lineWidth = 3; for (let i = 0; i < w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); } });
    ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(4, 3); floor.material = mat('#ffffff', { map:ft });
    const wall = add(new THREE.PlaneGeometry(14, 5), mat('#3a3d44'), 0, 2.5, -3); wall;
    const mirror = add(new THREE.PlaneGeometry(9, 2.6), new THREE.MeshPhongMaterial({ color:col('#a9b6c4'), shininess:120, specular:col('#ffffff') }), 0, 1.5, -2.98);
    add(new THREE.CylinderGeometry(.025, .025, 9, 8), mat('#c8c8c8'), 0, 1.05, -2.85).rotation.z = Math.PI / 2;
    for (let i = -1; i <= 1; i++) add(new THREE.BoxGeometry(2.2, .05, .5), basic('#fff8e6'), i * 3, 4.4, -1);
    if (kind === 'eval') {
      // Judges' table in the foreground, judges seen from behind.
      add(new THREE.BoxGeometry(3.4, .75, .7), mat('#1f2228'), 0, .375, 2.6);
      add(new THREE.BoxGeometry(3.6, .05, .8), mat('#ecebe6'), 0, .76, 2.6);
      (o.judges || []).forEach((j, i) => { const f = figure(Object.assign({ seated:true, pants:true }, j)); f.seated = true; f.root.position.set(-1.5 + i * 1.5, 0, 3.15); f.root.rotation.y = Math.PI; f.root.userData.face = Math.PI; scene.add(f.root); anim.push({ fig:f, move:'sit' }); });
      add(new THREE.RingGeometry(.25, .32, 4), basic('#f0b44c', { side:THREE.DoubleSide }), 0, .01, .4).rotation.x = -Math.PI / 2;
    }
  }
  if (kind === 'dorm') {
    const floor = add(new THREE.PlaneGeometry(12, 10), mat('#5a4636'), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
    add(new THREE.PlaneGeometry(12, 5), mat('#3d3a4a'), 0, 2.5, -3);
    add(new THREE.CircleGeometry(1.8, 32), mat('#7a3b4a'), 0, .01, .3).rotation.x = -Math.PI / 2;
    // bunk bed
    [[-3.1, -2.2]].forEach(([x, z]) => { const wood = mat('#8a6a4a'); [0, 1].forEach(l => { add(new THREE.BoxGeometry(2, .12, .95), wood, x, .45 + l * 1.2, z); add(new THREE.BoxGeometry(1.9, .12, .85), mat(l ? '#c7cbe0' : '#e0c7cf'), x, .56 + l * 1.2, z); });
      [-1, 1].forEach(sx => [-1, 1].forEach(sz => add(new THREE.BoxGeometry(.08, 2.2, .08), wood, x + sx * .95, 1.1, z + sz * .44))); });
    // couch
    add(new THREE.BoxGeometry(2.4, .45, .8), mat('#4b5b78'), 2.6, .3, -2.1); add(new THREE.BoxGeometry(2.4, .7, .2), mat('#4b5b78'), 2.6, .7, -2.5);
    // lamp + window glow
    add(new THREE.CylinderGeometry(.03, .03, 1.5, 6), mat('#222'), 4, .75, -2.4); add(new THREE.ConeGeometry(.25, .3, 16, 1, true), mat('#ffe2a8', { emissive:'#a8792a', side:THREE.DoubleSide }), 4, 1.55, -2.4);
    add(new THREE.PlaneGeometry(1.8, 1.2), basic('#1b2a4a'), 0, 2.3, -2.98);
    for (let i = 0; i < 14; i++) add(new THREE.SphereGeometry(.015, 4, 4), basic('#fff6d0'), -.8 + Math.random() * 1.6, 1.8 + Math.random() * 1, -2.97);
    const lampL = new THREE.PointLight(0xffc98a, .9, 9); lampL.position.set(3.6, 1.8, -1.6); scene.add(lampL);
  }
  if (kind === 'office' || kind === 'studio') {
    const floor = add(new THREE.PlaneGeometry(12, 10), mat(kind === 'office' ? '#3a3d44' : '#2b2622'), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
    add(new THREE.PlaneGeometry(12, 5), mat(kind === 'office' ? '#d8d6cf' : '#3a2f2a'), 0, 2.5, -3);
    if (kind === 'office') {
      add(new THREE.PlaneGeometry(3.6, 1.8), basic('#9fc3e6'), -2.6, 2.1, -2.97);
      for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(.35, .5 + Math.random() * 1.2, .05), basic('#6f8fb0'), -4 + i * .55, 1.45 + Math.random() * .2, -2.95);
      add(new THREE.BoxGeometry(2.4, .08, 1), mat('#1f2228'), 1.4, .78, -1.6); add(new THREE.BoxGeometry(2.2, .74, .9), mat('#2a2d36'), 1.4, .37, -1.6);
      add(new THREE.BoxGeometry(1.6, .9, .05), basic('#0a0a0c'), 2.6, 2.2, -2.95);
      const scr = add(new THREE.PlaneGeometry(1.5, .8), basic('#e5484d'), 2.6, 2.2, -2.92); anim.push({ tick:t => { scr.material.color = col(['#e5484d','#f0b44c','#9ec5ff','#b89cff'][Math.floor(t / 2) % 4]); } });
      add(new THREE.CylinderGeometry(.18, .22, .5, 12), mat('#2e6b3a'), -4.2, .25, -2.4); add(new THREE.SphereGeometry(.45, 10, 8), mat('#3f8a4a'), -4.2, .85, -2.4);
    } else {
      add(new THREE.PlaneGeometry(4, 1.6), basic('#10161c'), -1.5, 2.1, -2.97);
      add(new THREE.BoxGeometry(3.6, .4, 1), mat('#1f1b18'), -1.5, .9, -2.4);
      for (let i = 0; i < 16; i++) add(new THREE.BoxGeometry(.06, .12, .06), basic(i % 3 ? '#6fcf97' : '#f0b44c'), -3 + i * .2, 1.12, -2.1);
      for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(.6, .6, .12), mat('#4a3a30'), 3.6, .5 + i * .62, -2.9);
      add(new THREE.CylinderGeometry(.015, .015, 1.4, 6), mat('#999'), .9, .7, .6); add(new THREE.CylinderGeometry(.05, .04, .16, 10), mat('#333'), .9, 1.45, .62);
      const wl = new THREE.PointLight(0xffb070, .7, 8); wl.position.set(-1, 2.5, 0); scene.add(wl);
    }
  }
  if (kind === 'stage' || kind === 'mv') {
    const floor = add(new THREE.CircleGeometry(7, 48), new THREE.MeshPhongMaterial({ color:col('#0c0c10'), shininess:80, specular:col('#333') }), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
    const tint = o.tint || '#e5484d';
    if (kind === 'stage') {
      let off = 0;
      const tex = canvasTex(256, 128, () => {}); const cv = tex.image, g = cv.getContext('2d');
      const draw = t => { g.fillStyle = '#050507'; g.fillRect(0, 0, 256, 128); for (let i = 0; i < 16; i++) { const h = 30 + 90 * Math.abs(Math.sin(t * 2 + i * .7)); g.fillStyle = i % 2 ? tint : shade(tint, .4); g.globalAlpha = .85; g.fillRect(i * 16 + 2, 128 - h, 12, h); } g.globalAlpha = 1; tex.needsUpdate = true; };
      draw(0);
      add(new THREE.PlaneGeometry(10, 4.4), new THREE.MeshBasicMaterial({ map:tex }), 0, 2.4, -3.2);
      anim.push({ tick:t => { if (Math.floor(t * 12) !== off) { off = Math.floor(t * 12); draw(t); } } });
      // Light cones.
      [-2.5, 0, 2.5].forEach((x, i) => { const c = add(new THREE.ConeGeometry(1.1, 5, 24, 1, true), new THREE.MeshBasicMaterial({ color:col(i === 1 ? '#ffffff' : tint), transparent:true, opacity:.08, side:THREE.DoubleSide, depthWrite:false, blending:THREE.AdditiveBlending }), x, 2.5, -.6);
        anim.push({ tick:t => { c.rotation.z = Math.sin(t * .8 + i) * .25; c.material.opacity = .06 + .05 * (Math.sin(t * 3 + i * 2) + 1) / 2; } }); });
      // Crowd lightsticks.
      const n = 260, geo = new THREE.SphereGeometry(.035, 6, 4), ls = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color:col(o.light || '#f0b44c') }), n);
      const dm = new THREE.Object3D(), base = [];
      for (let i = 0; i < n; i++) { const x = (Math.random() - .5) * 12, z = 3.2 + Math.random() * 4, y = .2 + (z - 3.2) * .25 + Math.random() * .2; base.push([x, y, z, Math.random() * 6]); }
      scene.add(ls);
      anim.push({ tick:(t, beat) => { for (let i = 0; i < n; i++) { const b = base[i]; dm.position.set(b[0] + Math.sin(t * 2.2 + b[3]) * .08, b[1] + Math.abs(Math.sin(beat * Math.PI + b[3] * .2)) * .1, b[2]); dm.updateMatrix(); ls.setMatrixAt(i, dm.matrix); } ls.instanceMatrix.needsUpdate = true; } });
    } else {
      const cyc = add(new THREE.CylinderGeometry(6, 6, 6, 40, 1, true, Math.PI * .7, Math.PI * .6), new THREE.MeshBasicMaterial({ color:col(tint), side:THREE.BackSide }), 0, 3, 2);
      cyc.rotation.y = Math.PI;
      const rig = new THREE.Group(); rig.position.set(2.2, 0, 1.6); scene.add(rig);
      const m2 = mat('#222'); const leg = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.3, 6), m2); leg.position.y = .65; rig.add(leg);
      const cam = new THREE.Mesh(new THREE.BoxGeometry(.35, .25, .45), m2); cam.position.y = 1.4; rig.add(cam);
      const tally = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), basic('#e5484d')); tally.position.set(0, 1.56, .15); rig.add(tally);
      anim.push({ tick:t => { tally.visible = Math.sin(t * 6) > 0; } });
    }
    const spot = new THREE.SpotLight(0xffffff, 1.1, 20, .5, .6); spot.position.set(0, 7, 4); spot.target.position.set(0, 0, 0); scene.add(spot); scene.add(spot.target);
  }
  return anim;
}

/* ---------- Scene controller ---------- */
const CAMS = {
  practice:{ pos:[0, 1.6, 5.4], look:[0, 1.05, 0] },
  eval:{ pos:[0, 3.8, 6.6], look:[0, .8, 0] },
  stage:{ pos:[0, 1.7, 7.2], look:[0, 1.2, 0] },
  mv:{ pos:[0, 1.5, 5.2], look:[0, 1.1, 0] },
  dorm:{ pos:[0, 1.6, 5.2], look:[0, 1.0, 0] },
  office:{ pos:[0, 1.6, 5.2], look:[0, 1.05, 0] },
  studio:{ pos:[0, 1.6, 5.2], look:[0, 1.05, 0] },
};
function mount(el, o) {
  o = o || {};
  if (!S3.available()) { el.classList.add('no3d'); return null; }
  const kind = o.set || 'practice';
  let host = el; const W = () => Math.max(50, host.clientWidth), Hh = () => Math.max(50, host.clientHeight || o.height || 220);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'low-power' }); }
  catch (e) { el.classList.add('no3d'); return null; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W(), Hh());
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(col(kind === 'stage' ? '#050507' : kind === 'mv' ? '#101014' : kind === 'dorm' ? '#1c1b24' : '#25282e'));
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  if (kind === 'stage') scene.fog = new THREE.Fog(col('#050507'), 8, 18);
  const cam = new THREE.PerspectiveCamera(34, W() / Hh(), .1, 60);
  const C = { el, renderer, scene, cam, figs:[], key:o.key, kind, beat:0, bpm:o.bpm || 110, dancing:false, move:'idle', seq:null, yaw:0, cutAt:0, shot:'wide', focusIdx:0, flash:0, dead:false };
  C.anim = buildSet(scene, kind, o);
  const flashLight = new THREE.PointLight(0xffffff, 0, 10); flashLight.position.set(0, 3, 3); scene.add(flashLight);
  C.setCast = list => {
    C.figs.forEach(f => scene.remove(f.root)); C.figs = [];
    const n = list.length, spread = Math.min(1.05, 5.6 / Math.max(1, n));
    list.forEach((p, i) => {
      const f = figure(p); scene.add(f.root);
      const x = (i - (n - 1) / 2) * spread, z = (kind === 'practice' ? -.2 : 0) - Math.abs(i - (n - 1) / 2) * .22;
      f.root.position.set(x, 0, z); f.root.userData.face = -x * .06; f.root.rotation.y = f.root.userData.face;
      f.home = [x, z]; f.id = p.id; C.figs.push(f);
    });
    C.sig = list.map(p => p.id + p.look.skin + p.look.hair + p.look.style + p.outfit).join();
  };
  C.setCast(o.cast || []);
  C.dance = (on, bpm) => { C.dancing = on; if (bpm) C.bpm = bpm; if (!on) C.figs.forEach(resetPose); };
  C.play = (move, who) => { C.seq = null; C.figs.forEach((f, i) => { if (who == null || who === i) f.move = move; }); };
  C.demo = (moves, beatSec) => new Promise(res => { C.seq = { moves, t0:clock(), dur:beatSec || .7, res }; });
  C.talk = (i, move) => { C.seq = null; C.figs.forEach((f, k) => { f.move = k === i ? (move || 'talk') : (f.keep || null); }); if (i >= 0) { C.focusIdx = i; C.shot = 'close'; } else C.shot = 'wide'; };
  C.pose = (i, move) => { if (C.figs[i]) { C.figs[i].keep = move; C.figs[i].move = move; } };
  C.flashHit = c => { C.flash = 1; flashLight.color = col(c || '#ffffff'); };
  C.focus = i => { C.focusIdx = i; C.shot = 'close'; C.cutAt = clock() + 2.5; };
  C.setShot = s => { C.shot = s; C.cutAt = clock() + 3; };
  // Drag to orbit.
  let drag = null;
  const pd = e => { if (o.noDrag) return; drag = { x:e.clientX, yaw:C.yaw }; };
  const pm = e => { if (drag) { C.yaw = drag.yaw + (e.clientX - drag.x) / 160; } };
  const pu = () => { drag = null; };
  renderer.domElement.addEventListener('pointerdown', pd); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu);
  const t0 = performance.now(); function clock() { return (performance.now() - t0) / 1000; }
  C.clock = clock;
  function placeCam(t) {
    const base = CAMS[kind];
    let pos = base.pos.slice(), look = base.look.slice();
    if (kind === 'stage' && o.cuts) {
      if (t > C.cutAt) { C.cutAt = t + 2 + Math.random() * 2.2; C.shot = ['wide','mid','close','low','side'][Math.floor(Math.random() * 5)]; C.focusIdx = Math.floor(Math.random() * Math.max(1, C.figs.length)); }
      const f = C.figs[C.focusIdx];
      const fx = f ? f.root.position.x : 0;
      if (C.shot === 'mid') { pos = [fx * .5, 1.5, 4.4]; look = [fx * .5, 1.15, 0]; }
      if (C.shot === 'close' && f) { pos = [fx, 1.62, 1.9]; look = [fx, 1.45, 0]; }
      if (C.shot === 'low') { pos = [0, .5, 5]; look = [0, 1.5, 0]; }
      if (C.shot === 'side') { pos = [4.5, 1.8, 4.2]; look = [0, 1.1, 0]; }
    }
    if (o.scene && C.shot === 'close' && C.figs[C.focusIdx]) { const f = C.figs[C.focusIdx], fx = f.root.position.x, fz = f.root.position.z, hy = f.seated ? 1.0 : 1.32, d = 2.3 + Math.max(0, 1 - cam.aspect) * 3.2; pos = [fx * .9, hy + .12, fz + d]; look = [fx, hy, fz]; }
    if (o.scene && C.shot === 'two' && C.figs.length > 1) { pos = [0, 1.5, 3.6]; look = [0, 1.2, 0]; }
    if (o.close && C.figs[0]) { const fx = C.figs[0].root.position.x; pos = [fx, 1.3, 3.7]; look = [fx, 1.0, 0]; }
    const yaw = C.yaw + (o.orbit ? Math.sin(t * .15) * .25 : 0);
    const dx = pos[0] - look[0], dz = pos[2] - look[2];
    cam.position.set(look[0] + dx * Math.cos(yaw) + dz * Math.sin(yaw), pos[1], look[2] - dx * Math.sin(yaw) + dz * Math.cos(yaw));
    cam.lookAt(look[0], look[1], look[2]);
  }
  const ROUT = ['step','wave','hips','point','body','clap','jump','spin'];
  function loop() {
    if (C.dead) return;
    C.raf = requestAnimationFrame(loop);
    if (!document.body.contains(renderer.domElement)) return; // parked: skip drawing
    const t = clock(), bt = t * C.bpm / 60;
    C.beat = bt;
    C.figs.forEach((f, i) => {
      resetPose(f);
      f.root.position.x = f.home[0]; f.root.position.z = f.home[1];
      let mv = f.move || (C.dancing ? ROUT[Math.floor(bt / 4) % ROUT.length] : (f.seated ? 'sit' : 'idle'));
      let ph = (bt / 2) % 1;
      if (C.seq && i === 0) {
        const k = Math.floor((t - C.seq.t0) / C.seq.dur);
        if (k >= C.seq.moves.length) { const r = C.seq.res; C.seq = null; r && r(); mv = 'idle'; }
        else mv = (t - C.seq.t0) / C.seq.dur - k < .8 ? C.seq.moves[k] : 'idle';
      }
      (MOVES[mv] || MOVES.idle)(f, mv === 'spin' ? (bt / 4) % 1 : ph, t + i);
    });
    C.anim.forEach(a => { if (a.tick) a.tick(t, bt); if (a.fig) MOVES[a.move](a.fig, 0, t); });
    if (C.flash > 0) { flashLight.intensity = C.flash * 3; C.flash = Math.max(0, C.flash - .06); } else flashLight.intensity = 0;
    placeCam(t);
    renderer.render(scene, cam);
  }
  loop();
  const ro = window.ResizeObserver ? new ResizeObserver(() => { renderer.setSize(W(), Hh()); cam.aspect = W() / Hh(); cam.updateProjectionMatrix(); }) : null;
  if (ro) ro.observe(el);
  C.attachTo = el2 => { C.el = el2; host = el2; el2.appendChild(renderer.domElement); if (ro) { ro.disconnect(); ro.observe(el2); } renderer.setSize(Math.max(50, el2.clientWidth), Math.max(50, el2.clientHeight)); cam.aspect = el2.clientWidth / Math.max(1, el2.clientHeight); cam.updateProjectionMatrix(); };
  C.destroy = () => {
    C.dead = true; cancelAnimationFrame(C.raf); if (ro) ro.disconnect();
    renderer.domElement.removeEventListener('pointerdown', pd); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu);
    scene.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) { (Array.isArray(x.material) ? x.material : [x.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); } });
    renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {}
    renderer.domElement.remove();
  };
  return C;
}
S3.mount = mount;
/* A persistent scene for the main screen: reattached on re-render instead of rebuilt. */
S3.attach = (el, key, o) => {
  if (!el) return null;
  const c = S3.cur;
  if (c && !c.dead && c.key === key) {
    c.attachTo(el);
    const sig = (o.cast || []).map(p => p.id + p.look.skin + p.look.hair + p.look.style + p.outfit).join();
    if (sig !== c.sig) c.setCast(o.cast || []);
    return c;
  }
  if (c) c.destroy();
  S3.cur = mount(el, Object.assign({ key }, o));
  return S3.cur;
};
S3.release = () => { if (S3.cur) { S3.cur.destroy(); S3.cur = null; } };
})();
