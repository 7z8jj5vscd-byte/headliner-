// K-Pop Idol Agency: pixel chibi idols and pixel scenes (MV playback, concerts, award stage).
// Everything is drawn in code on a small grid, then scaled up with crisp pixels.
(function (root) {
const D = root.KD;
const SP = root.SP = {};
const W = 24, H = 32, OX = 1, OY = 1; // drawing grid, plus 1px outline margin
const OUT = '#2a1d3a';

function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
function shade(c, f) { const [r, g, b] = hex(c); const t = v => Math.max(0, Math.min(255, Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1)))); return '#' + [t(r), t(g), t(b)].map(v => v.toString(16).padStart(2, '0')).join(''); }
SP.shade = shade;

// Build a colour grid for one idol pose. look: {g, skin, hair, hairC, top, topC, botC, acc, eye}
function grid(look, pose) {
  const g = new Array((W + 2) * (H + 2)).fill(null);
  const set = (x, y, c) => { x += OX; y += OY; if (x < 0 || y < 0 || x >= W + 2 || y >= H + 2) return; g[y * (W + 2) + x] = c; };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c); };
  const skin = D.SKIN[look.skin | 0] || D.SKIN[0], skinD = shade(skin, .86);
  const hc = D.HAIR_C[look.hairC | 0] || D.HAIR_C[0], hcD = shade(hc, .72), hcL = shade(hc, 1.35);
  const tc = D.OUT_C[look.topC | 0] || D.OUT_C[0], tcD = shade(tc, .78), tcL = shade(tc, 1.3);
  const bc = D.OUT_C[look.botC | 0] || D.OUT_C[2], bcD = shade(bc, .78);
  const fem = look.g !== 'm', hs = look.hair | 0, top = look.top || 'tee';
  const shoe = '#3a2c4a';

  // ---- behind the body: long hair, capes, tails
  if (fem) {
    if (hs === 0 || hs === 6) rect(4, 7, 16, 17, hcD);
    if (hs === 4) { rect(4, 7, 16, 16, hcD); for (let y = 8; y < 24; y += 2) { set(3, y, hcD); set(20, y + 1, hcD); } rect(5, 23, 14, 1, hcD); }
    if (hs === 2) rect(4, 7, 16, 8, hcD);
    if (hs === 1) { rect(1, 7, 3, 12, hc); rect(20, 7, 3, 12, hc); rect(2, 19, 2, 2, hcD); rect(20, 19, 2, 2, hcD); }
    if (hs === 3) { rect(19, 3, 2, 14, hc); rect(20, 14, 2, 4, hcD); }
  } else {
    if (hs === 2) rect(6, 8, 12, 10, hcD);
    if (hs === 5) { rect(9, 14, 6, 2, hcD); rect(10, 16, 4, 6, hcD); }
  }
  if (top === 'fantasy') { rect(4, 16, 16, 12, shade(tc, .55)); rect(4, 27, 16, 1, '#e3b45c'); }

  // ---- legs and bottoms
  const legY = 25;
  if (fem && top !== 'hanbok') {
    rect(9, legY + 1, 2, 4, skin); rect(13, legY + 1, 2, 4, skin);
    rect(8, legY + 5, 3, 1, shoe); rect(13, legY + 5, 3, 1, shoe);
    // skirt
    rect(7, 23, 10, 2, bc); rect(6, 25, 12, 1, bc); rect(6, 25, 12, 1, bcD);
  } else if (fem && top === 'hanbok') {
    rect(6, 23, 12, 7, bc); rect(5, 28, 14, 2, bcD); rect(8, 30, 3, 1, shoe); rect(13, 30, 3, 1, shoe);
  } else {
    rect(8, 23, 8, 7, bc); rect(11, 26, 2, 4, null); rect(15, 23, 1, 7, bcD);
    set(11, 26, null); rect(8, 30, 3, 1, shoe); rect(13, 30, 3, 1, shoe);
    for (let y = 26; y < 30; y++) { set(11, y, null); set(12, y, null); }
  }

  // ---- torso
  const tY = 16;
  const sleeve = top === 'summer' ? skin : tc;
  rect(7, tY, 10, 7, tc); rect(16, tY, 1, 7, tcD);
  if (top === 'hoodie') { rect(6, tY, 12, 8, tc); rect(17, tY, 1, 8, tcD); rect(9, tY + 4, 6, 2, tcD); set(10, tY, tcL); set(13, tY, tcL); }
  if (top === 'school') { rect(10, tY, 4, 7, '#ffffff'); rect(11, tY + 1, 2, 4, '#e04848'); }
  if (top === 'suit') { rect(10, tY, 4, 3, '#ffffff'); set(11, tY + 3, '#ffffff'); set(12, tY + 3, '#ffffff'); set(9, tY + 1, tcL); set(14, tY + 1, tcL); set(12, tY + 5, '#e3b45c'); }
  if (top === 'leather') { rect(7, tY, 10, 7, '#2b2b3a'); rect(11, tY, 2, 7, tc); for (let x = 8; x < 16; x += 2) set(x, tY + 5, '#c0c4d6'); }
  if (top === 'y2k') { if (fem) { rect(7, tY + 4, 10, 3, skin); set(11, tY + 5, skinD); } else { rect(10, tY, 4, 7, '#ffffff'); } set(9, tY + 1, tcL); }
  if (top === 'summer') { rect(8, tY, 8, 2, tcL); for (let x = 7; x < 17; x += 2) set(x, tY + 4, tcL); }
  if (top === 'street') { rect(7, tY, 10, 7, tc); rect(11, tY, 2, 7, '#ffffff'); set(9, tY + 3, '#ffd166'); }
  if (top === 'hanbok') { rect(7, tY, 10, 5, tc); rect(10, tY + 2, 1, 4, '#e04848'); set(11, tY + 3, '#e04848'); set(12, tY, '#ffffff'); set(11, tY, '#ffffff'); }
  if (top === 'sparkle') { for (let i = 0; i < 9; i++) set(7 + (i * 3) % 10, tY + (i * 5) % 7, tcL); }
  if (top === 'military') { set(9, tY + 2, '#e3b45c'); set(9, tY + 4, '#e3b45c'); set(14, tY + 2, '#e3b45c'); set(14, tY + 4, '#e3b45c'); rect(6, tY, 2, 1, '#e3b45c'); rect(16, tY, 2, 1, '#e3b45c'); }
  if (top === 'fantasy') { rect(11, tY, 2, 7, '#e3b45c'); }
  if (top === 'tee') { set(11, tY + 2, tcL); set(12, tY + 2, tcL); }
  // neck
  rect(10, 15, 4, 1, skinD);

  // ---- arms (pose)
  const arm = (side, mode) => {
    const x = side < 0 ? 5 : 17;
    if (mode === 'down') { rect(x, tY, 2, 6, sleeve); rect(x, tY + 6, 2, 1, skin); if (sleeve !== skin) set(side < 0 ? x : x + 1, tY + 5, side < 0 ? tcL : tcD); }
    else if (mode === 'up') { const xa = side < 0 ? 2 : 20; rect(side < 0 ? 4 : 18, tY, 2, 2, sleeve); rect(xa, tY - 7, 2, 9, sleeve); rect(xa, tY - 8, 2, 1, skin); }
    else if (mode === 'out') { const x0 = side < 0 ? 1 : 17; rect(x0, tY, 6, 2, sleeve); rect(side < 0 ? 0 : 23, tY, 1, 2, skin); }
    else if (mode === 'hip') { rect(x, tY, 2, 3, sleeve); rect(side < 0 ? x + 1 : x - 0, tY + 3, 2, 1, skin); }
    else if (mode === 'mic') { rect(x, tY, 2, 3, sleeve); rect(side < 0 ? x + 2 : x - 2, tY - 1, 2, 2, skin); rect(side < 0 ? x + 3 : x - 3, tY - 3, 1, 3, '#555'); }
    else if (mode === 'heart') { const xa = side < 0 ? 2 : 20; rect(side < 0 ? 4 : 18, tY, 2, 2, sleeve); rect(xa, 2, 2, tY - 1, sleeve); rect(side < 0 ? 3 : 16, 0, 5, 2, skin); }
  };
  const P = { idle: ['down', 'down'], up1: ['up', 'down'], up2: ['down', 'up'], out: ['out', 'out'], cheer: ['up', 'up'], hip: ['hip', 'down'], mic: ['down', 'mic'], heart: ['heart', 'heart'] }[pose] || ['down', 'down'];
  const late = m => m === 'up' || m === 'heart';
  if (!late(P[0])) arm(-1, P[0]); if (!late(P[1])) arm(1, P[1]);

  // ---- head
  rect(6, 3, 12, 13, skin); rect(5, 5, 14, 9, skin); rect(7, 15, 10, 1, skin);
  rect(17, 6, 1, 8, skinD);
  // ears
  set(4, 9, skin); set(19, 9, skin);
  // face
  const eyeC = '#2b1c3f';
  const ey = 9;
  const eyeStyle = look.eye | 0;
  if (eyeStyle === 2) { // smiling eyes
    set(7, ey + 1, eyeC); set(8, ey, eyeC); set(9, ey + 1, eyeC); set(14, ey + 1, eyeC); set(15, ey, eyeC); set(16, ey + 1, eyeC);
  } else {
    rect(7, ey, 3, 3, eyeC); rect(14, ey, 3, 3, eyeC);
    set(7, ey, '#ffffff'); set(14, ey, '#ffffff');
    const iris = ['#6b4bd8', '#3b6fd6', '#8a4b2a', '#2e8a6a'][(look.skin + look.hairC) % 4];
    set(8, ey + 2, iris); set(15, ey + 2, iris); set(9, ey + 2, iris); set(16, ey + 2, iris);
    if (eyeStyle === 1) { set(6, ey, eyeC); set(17, ey, eyeC); }
  }
  set(6, ey + 3, '#ff9fb8'); set(7, ey + 3, '#ffb7c8'); set(16, ey + 3, '#ffb7c8'); set(17, ey + 3, '#ff9fb8');
  if (pose === 'cheer' || pose === 'heart') { rect(11, 13, 2, 1, '#b23a5c'); set(11, 14, '#ff8fa8'); }
  else { set(11, 13, '#b23a5c'); set(12, 13, '#b23a5c'); }

  // ---- hair front
  const cap = (y0, y1) => { rect(6, y0, 12, y1 - y0, hc); rect(5, y0 + 1, 14, y1 - y0, hc); rect(7, y0 - 1, 10, 1, hc); };
  const hl = () => { set(8, 3, hcL); set(9, 3, hcL); set(10, 2, hcL); };
  if (fem) {
    cap(2, 6);
    if (hs === 7) { rect(5, 6, 3, 3, hc); rect(16, 6, 3, 2, hc); rect(8, 6, 6, 1, hc); set(8, 7, hc); }
    else if (hs === 3) { rect(5, 6, 2, 6, hc); rect(17, 6, 2, 4, hc); rect(7, 6, 5, 2, hc); set(7, 8, hc); rect(15, 0, 4, 3, hc); }
    else if (hs === 6) { rect(5, 6, 14, 2, hc); rect(4, 6, 3, 8, hc); rect(17, 6, 3, 8, hc); }
    else {
      rect(5, 6, 14, 2, hc); set(8, 8, hc); set(12, 8, hc); set(15, 8, hc);
      rect(4, 6, 2, hs === 2 ? 9 : 10, hc); rect(18, 6, 2, hs === 2 ? 9 : 10, hc);
    }
    if (hs === 5) { rect(3, 0, 5, 4, hc); rect(16, 0, 5, 4, hc); set(4, 0, hcL); set(17, 0, hcL); }
    if (hs === 1) { set(4, 6, '#ff6b9a'); set(19, 6, '#ff6b9a'); }
  } else {
    if (hs === 6) { rect(6, 3, 12, 3, hc); rect(5, 4, 14, 2, hc); }
    else {
      cap(2, 6);
      if (hs === 0) { rect(6, 6, 12, 1, hc); rect(7, 7, 4, 1, hc); rect(5, 6, 1, 2, hcD); rect(18, 6, 1, 2, hcD); }
      if (hs === 1) { rect(5, 6, 6, 2, hc); rect(13, 6, 6, 2, hc); set(5, 8, hc); set(18, 8, hc); set(6, 8, hc); set(17, 8, hc); }
      if (hs === 2) { rect(5, 6, 14, 2, hc); rect(4, 6, 2, 6, hc); rect(18, 6, 2, 6, hc); }
      if (hs === 3) { for (let x = 5; x < 19; x += 3) { set(x, 0, hc); set(x + 1, 1, hc); } rect(5, 6, 14, 1, hc); set(7, 7, hc); set(12, 7, hc); set(16, 7, hc); }
      if (hs === 4) { rect(5, 6, 14, 2, hc); rect(8, 8, 3, 1, hc); set(10, 9, hc); }
      if (hs === 5) { rect(5, 6, 14, 2, hc); rect(4, 6, 2, 7, hc); rect(18, 6, 2, 7, hc); }
      if (hs === 7) { for (let x = 4; x < 20; x += 2) set(x, 3 + (x % 4 ? 0 : 1), hc); rect(5, 6, 14, 2, hc); for (let x = 5; x < 19; x += 2) set(x, 8, hc); rect(4, 5, 2, 5, hc); rect(18, 5, 2, 5, hc); }
    }
  }
  hl();
  if (late(P[0])) arm(-1, P[0]); if (late(P[1])) arm(1, P[1]);

  // ---- accessories
  const acc = look.acc | 0;
  if (acc === 1) { rect(16, 5, 2, 1, '#ffd166'); set(17, 4, '#ffd166'); }
  if (acc === 2) { rect(5, 0, 14, 4, tc); rect(4, 3, 16, 1, tcD); set(11, 0, tcL); }
  if (acc === 3) { const f = '#3a2c4a'; rect(6, ey - 1, 5, 1, f); rect(13, ey - 1, 5, 1, f); set(6, ey, f); set(10, ey, f); set(13, ey, f); set(17, ey, f); rect(11, ey, 2, 1, f); rect(6, ey + 3, 5, 1, f); rect(13, ey + 3, 5, 1, f); }
  if (acc === 4) rect(5, 3, 14, 1, tc);
  if (acc === 5) { rect(14, 0, 2, 2, '#ff4f8f'); rect(17, 0, 2, 2, '#ff4f8f'); rect(16, 1, 1, 1, '#c41a5f'); }
  if (acc === 6) { set(4, 11, '#ffd166'); set(19, 11, '#ffd166'); }
  if (acc === 7) { rect(5, 1, 14, 4, tc); rect(3, 4, 9, 1, tcD); set(13, 2, '#ffffff'); }
  return g;
}

function outline(g) {
  const w = W + 2, h = H + 2, o = g.slice();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y * w + x]) continue;
    if ((x > 0 && g[y * w + x - 1]) || (x < w - 1 && g[y * w + x + 1]) || (y > 0 && g[(y - 1) * w + x]) || (y < h - 1 && g[(y + 1) * w + x])) o[y * w + x] = OUT;
  }
  return o;
}

const cache = new Map();
// Returns a canvas (W+2 x H+2) for this look and pose.
SP.canvas = function (look, pose = 'idle') {
  const key = JSON.stringify(look) + pose;
  if (cache.has(key)) return cache.get(key);
  const g = outline(grid(look, pose));
  const c = document.createElement('canvas'); c.width = W + 2; c.height = H + 2;
  const x = c.getContext('2d'); const id = x.createImageData(W + 2, H + 2);
  g.forEach((col, i) => { if (!col) return; const [r, gg, b] = hex(col); id.data[i * 4] = r; id.data[i * 4 + 1] = gg; id.data[i * 4 + 2] = b; id.data[i * 4 + 3] = 255; });
  x.putImageData(id, 0, 0);
  if (cache.size > 600) cache.clear();
  cache.set(key, c);
  return c;
};
const urls = new Map();
SP.url = function (look, pose = 'idle') {
  const key = JSON.stringify(look) + pose;
  if (urls.has(key)) return urls.get(key);
  const u = SP.canvas(look, pose).toDataURL();
  if (urls.size > 600) urls.clear();
  urls.set(key, u); return u;
};
// An <img> tag of the idol. size = display height in px.
SP.img = function (look, size = 68, pose = 'idle', cls = '') {
  const w = Math.round(size * (W + 2) / (H + 2));
  return `<img class="px ${cls}" src="${SP.url(look, pose)}" width="${w}" height="${size}" alt="">`;
};
SP.W = W + 2; SP.H = H + 2;

// ------------------------------------------------------------------ scenes
function bg(x, w, h, set, t) {
  const [a, b] = set.col;
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b);
  x.fillStyle = gr; x.fillRect(0, 0, w, h);
  const px = (X, Y, ww, hh, c) => { x.fillStyle = c; x.fillRect(Math.round(X), Math.round(Y), ww, hh); };
  const id = set.id;
  if (id === 'neon') { for (let i = 0; i < 12; i++) { const bw = 14 + (i * 7) % 12, bh = 40 + (i * 37) % 70; px(i * 28, h * .62 - bh, bw, bh, '#2a1458'); for (let k = 0; k < 6; k++) if ((i + k + Math.floor(t * 2)) % 3) px(i * 28 + 3 + (k % 2) * 6, h * .62 - bh + 6 + k * 8, 3, 3, k % 2 ? '#ff3d9a' : '#3fe0ff'); } }
  if (id === 'space' || id === 'neon' || id === 'arcade') for (let i = 0; i < 40; i++) px((i * 53) % w, (i * 29) % (h * .55), 1, 1, (i + Math.floor(t * 4)) % 5 ? '#ffffff' : '#ffcf3f');
  if (id === 'space') { x.fillStyle = '#ffcf3f'; x.beginPath(); x.arc(w * .8, h * .22, 18, 0, 7); x.fill(); px(w * .8 - 26, h * .22, 52, 2, '#ff8fc8'); }
  if (id === 'school') { for (let i = 0; i < 6; i++) { px(i * 56 + 6, 20, 40, 50, '#bfe6ff'); px(i * 56 + 25, 20, 2, 50, '#fff'); } px(0, h * .62, w, 3, '#d49a6a'); }
  if (id === 'desert') { x.fillStyle = '#fff1b0'; x.beginPath(); x.arc(w * .5, h * .5, 26, 0, 7); x.fill(); for (let i = 0; i < 5; i++) px(i * 70 + 20, h * .45, 6, 30, '#3f7a3a'); }
  if (id === 'forest') for (let i = 0; i < 10; i++) { px(i * 34, h * .3, 8, h * .4, '#0d2a1f'); x.fillStyle = '#1e6b4a'; x.beginPath(); x.arc(i * 34 + 4, h * .3, 18, 0, 7); x.fill(); px((i * 47 + t * 20) % w, (i * 31) % (h * .6), 2, 2, '#c8ffb0'); }
  if (id === 'beach') { x.fillStyle = '#ffe08a'; x.beginPath(); x.arc(w * .5, h * .45, 22, 0, 7); x.fill(); px(0, h * .5, w, h * .12, '#3fb6e0'); for (let i = 0; i < 8; i++) px((i * 40 + t * 15) % w, h * .52 + (i % 3) * 6, 10, 1, '#ffffff'); }
  if (id === 'palace') { for (let i = 0; i < 7; i++) { px(i * 50 + 10, 10, 10, h * .55, '#7a5323'); px(i * 50 + 8, 10, 14, 4, '#e3b45c'); } px(w * .5 - 30, 4, 60, 10, '#e3b45c'); }
  if (id === 'arcade') for (let i = 0; i < 6; i++) { px(i * 56 + 8, h * .2, 30, 70, '#3d2a8a'); px(i * 56 + 12, h * .2 + 6, 22, 16, (i + Math.floor(t * 3)) % 2 ? '#3fe0ff' : '#ff3d9a'); }
  if (id === 'warehouse') { for (let i = 0; i < 9; i++) px(i * 38, h * .15 + (i % 3) * 10, 30, 20, ['#9be15d', '#ff6b6b', '#ffcf3f', '#46b4ff'][i % 4]); }
  if (id === 'white') { px(0, h * .62, w, 1, '#c8c2e8'); }
  // floor
  px(0, h * .62, w, h * .38, 'rgba(0,0,0,.18)');
}

const POSES = ['idle', 'up1', 'out', 'up2', 'cheer', 'hip', 'out', 'heart'];
function drawIdol(x, look, cx, by, scale, pose, flip) {
  const c = SP.canvas(look, pose);
  const w = c.width * scale, h = c.height * scale;
  x.save(); x.imageSmoothingEnabled = false;
  if (flip) { x.translate(Math.round(cx + w / 2), 0); x.scale(-1, 1); x.drawImage(c, 0, Math.round(by - h), w, h); }
  else x.drawImage(c, Math.round(cx - w / 2), Math.round(by - h), w, h);
  x.restore();
}
SP.drawIdol = drawIdol;

// Music video playback. mv: {set, shots:[...6], story}, looks: member looks, onEnd callback.
SP.playMV = function (canvas, mv, looks, opts = {}) {
  const x = canvas.getContext('2d'); x.imageSmoothingEnabled = false;
  const w = canvas.width, h = canvas.height;
  const set = D.MV_SETS.find(s => s.id === mv.set) || D.MV_SETS[0];
  const secLen = opts.secLen || 2.6, total = secLen * D.MV_SECTIONS.length;
  const t0 = performance.now(); let raf = 0, stopped = false;
  const lines = opts.lines || [];
  function frame(now) {
    if (stopped) return;
    const t = (now - t0) / 1000;
    const si = Math.min(D.MV_SECTIONS.length - 1, Math.floor(t / secLen));
    const st = (t - si * secLen) / secLen;
    const shot = mv.shots[si] || 'wide';
    const beat = Math.floor(t * (shot === 'slowmo' ? 2 : 4));
    bg(x, w, h, set, t);
    const n = looks.length, floor = h * .9;
    if (shot === 'close' || shot === 'fairy') {
      const k = looks[si % n]; const sc = (h * 1.25) / SP.H;
      drawIdol(x, k, w / 2 + Math.sin(t) * 6, h * 1.18, sc, shot === 'fairy' ? 'heart' : POSES[beat % 2 ? 0 : 5]);
      if (shot === 'fairy') for (let i = 0; i < 8; i++) { x.fillStyle = '#ff6fae'; const hx = (w * .15 + i * 37 + t * 30) % w, hy = h * .2 + Math.sin(t * 3 + i) * 20; x.fillRect(hx, hy, 6, 5); x.fillRect(hx + 1, hy + 5, 4, 2); }
    } else if (shot === 'story') {
      const a = looks[si % n], b = looks[(si + 1) % n]; const sc = (h * .7) / SP.H;
      drawIdol(x, a, w * .32, floor, sc, 'idle'); drawIdol(x, b, w * .68, floor, sc, beat % 4 === 0 ? 'hip' : 'idle', true);
      x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, w, h * .1); x.fillRect(0, h * .9, w, h * .1);
    } else {
      const zoom = shot === 'drone' ? 1.25 - st * .5 : shot === 'oneshot' ? 1 : 1;
      const sc = Math.max(1, (h * .42 * zoom) / SP.H);
      const pan = shot === 'drone' ? (st - .5) * w * .3 : 0;
      looks.forEach((k, i) => {
        const row = n > 5 && i % 2 ? 1 : 0;
        const cx = w / 2 + pan + (i - (n - 1) / 2) * Math.min(w * .9 / n, sc * SP.W * .95);
        const p = shot === 'oneshot' ? POSES[(beat + i) % POSES.length] : POSES[(beat + (row ? 2 : 0)) % POSES.length];
        drawIdol(x, k, cx, floor - row * h * .08 - (beat % 2 && p !== 'idle' ? 2 : 0), sc * (row ? .9 : 1), p, i % 2 === 1);
      });
    }
    if (shot === 'cgi' || si === 4) for (let i = 0; i < 24; i++) { x.fillStyle = ['#fff', '#ffcf3f', '#ff8fc8', '#7fd4ff'][i % 4]; x.fillRect((i * 41 + t * 60 * (i % 3 + 1)) % w, (i * 23 + t * 40) % h, 2, 2); }
    if (shot === 'slowmo') { x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(0, 0, w, h); }
    // letterbox and captions
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, h - 22, w, 22);
    x.fillStyle = '#fff'; x.font = 'bold 11px "DotGothic16", monospace'; x.textAlign = 'left';
    x.fillText(D.MV_SECTIONS[si].toUpperCase() + ' · ' + ((D.MV_SHOTS.find(s => s.id === shot) || {}).n || ''), 8, h - 8);
    if (lines[si]) { x.textAlign = 'center'; x.font = '12px "DotGothic16", monospace'; x.fillStyle = '#fff'; x.fillText(lines[si], w / 2, 20); }
    if (si === 0 && st < .5 && opts.title) { x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, h / 2 - 22, w, 44); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 18px "DotGothic16", monospace'; x.fillText(opts.title, w / 2, h / 2 + 6); }
    if (opts.onProgress) opts.onProgress(Math.min(1, t / total));
    if (t >= total) { stopped = true; if (opts.onEnd) opts.onEnd(); return; }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => { stopped = true; cancelAnimationFrame(raf); };
};

// Concert / music show stage with a lightstick ocean.
SP.playStage = function (canvas, looks, opts = {}) {
  const x = canvas.getContext('2d'); x.imageSmoothingEnabled = false;
  const w = canvas.width, h = canvas.height, color = opts.color || '#ff4fa3';
  const t0 = performance.now(); let stopped = false, raf = 0; const dur = opts.dur || 7;
  function frame(now) {
    if (stopped) return;
    const t = (now - t0) / 1000, beat = Math.floor(t * 4);
    x.fillStyle = '#0c0820'; x.fillRect(0, 0, w, h);
    // beams
    for (let i = 0; i < 5; i++) { x.fillStyle = `rgba(255,255,255,${.05 + .04 * ((beat + i) % 2)})`; x.beginPath(); const sx = w * (i + .5) / 5; x.moveTo(sx - 4, 0); x.lineTo(sx + 4, 0); x.lineTo(sx + 40 * Math.sin(t + i), h * .62); x.lineTo(sx - 40 + 40 * Math.sin(t + i), h * .62); x.fill(); }
    // stage + screen
    x.fillStyle = '#251a4a'; x.fillRect(w * .1, h * .08, w * .8, h * .26);
    x.fillStyle = color; x.globalAlpha = .35 + .2 * (beat % 2); x.fillRect(w * .12, h * .1, w * .76, h * .22); x.globalAlpha = 1;
    if (opts.title) { x.fillStyle = '#fff'; x.font = 'bold 14px "DotGothic16", monospace'; x.textAlign = 'center'; x.fillText(opts.title, w / 2, h * .23); }
    x.fillStyle = '#3a2c6a'; x.fillRect(0, h * .6, w, 6);
    const n = looks.length, sc = Math.max(1, (h * .3) / SP.H);
    looks.forEach((k, i) => drawIdol(x, k, w / 2 + (i - (n - 1) / 2) * Math.min(w * .85 / n, sc * SP.W), h * .6, sc, POSES[(beat + i) % POSES.length], i % 2 === 1));
    // crowd lightsticks
    for (let r = 0; r < 4; r++) for (let i = 0; i < 36; i++) {
      const cx = (i + (r % 2) * .5) * w / 36, cy = h * .7 + r * h * .075, sway = Math.sin(t * 4 + i * .4 + r) * 3;
      x.fillStyle = '#1a1235'; x.fillRect(cx - 3, cy, 7, 12);
      x.fillStyle = (i + r + beat) % 9 === 0 ? '#ffffff' : color; x.fillRect(cx + sway, cy - 6, 3, 5);
    }
    if (opts.confetti) for (let i = 0; i < 40; i++) { x.fillStyle = ['#ffcf3f', '#ff8fc8', '#7fd4ff', '#fff'][i % 4]; x.fillRect((i * 37 + t * 20) % w, (i * 19 + t * 70) % (h * .7), 3, 2); }
    if (t >= dur) { stopped = true; opts.onEnd && opts.onEnd(); return; }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => { stopped = true; cancelAnimationFrame(raf); };
};

// ------------------------------------------------------------------ tiny synth for MVs and stages
let AC = null;
SP.beat = function (genre = 'dance', seconds = 15) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { return () => { }; }
  const bpm = { ballad: 76, rnb: 92, hiphop: 92, rock: 128, house: 124, edm: 128, jersey: 140 }[genre] || 118;
  const spb = 60 / bpm / 2, start = AC.currentTime + .05, steps = Math.floor(seconds / spb);
  const out = AC.createGain(); out.gain.value = .22; out.connect(AC.destination);
  const keys = [0, 3, 7, 10, 5, 8, 12, 7], root = 110 * Math.pow(2, (genre.length % 5) / 12);
  for (let i = 0; i < steps; i++) {
    const tt = start + i * spb;
    if (i % 4 === 0 || (genre === 'jersey' && i % 8 === 6)) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, tt); o.frequency.exponentialRampToValueAtTime(40, tt + .12); g.gain.setValueAtTime(.9, tt); g.gain.exponentialRampToValueAtTime(.001, tt + .2); o.connect(g); g.connect(out); o.start(tt); o.stop(tt + .22); }
    if (i % 8 === 4) { const b = AC.createBufferSource(), buf = AC.createBuffer(1, AC.sampleRate * .15, AC.sampleRate), d = buf.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length); b.buffer = buf; const g = AC.createGain(); g.gain.value = .35; b.connect(g); g.connect(out); b.start(tt); }
    if (i % 2 === 1 && genre !== 'ballad') { const b = AC.createBufferSource(), buf = AC.createBuffer(1, AC.sampleRate * .03, AC.sampleRate), d = buf.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length); b.buffer = buf; const g = AC.createGain(); g.gain.value = .12; b.connect(g); g.connect(out); b.start(tt); }
    if (i % 2 === 0) { const o = AC.createOscillator(), g = AC.createGain(); o.type = genre === 'ballad' ? 'triangle' : 'square'; o.frequency.value = root * Math.pow(2, keys[(i / 2 | 0) % 8] / 12) * (genre === 'ballad' ? 2 : 1); g.gain.setValueAtTime(.08, tt); g.gain.exponentialRampToValueAtTime(.001, tt + spb * 1.8); o.connect(g); g.connect(out); o.start(tt); o.stop(tt + spb * 2); }
  }
  return () => { try { out.gain.setValueAtTime(0, AC.currentTime); out.disconnect(); } catch (e) { } };
};
SP.blip = function (f = 660) {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(.06, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .09); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + .1); } catch (e) { }
};
})(typeof globalThis !== 'undefined' ? globalThis : this);
