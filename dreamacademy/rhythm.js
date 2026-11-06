/* Dream Academy: Story Mode. Tap-timing performance stage. Rhythm.play(opts) -> Promise<accuracy 0..1 | null if skipped>. */
(function () {
const R = window.Rhythm = {};
let ac = null;
function ctx() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } return ac; }
function tone(t, f, d, type, vol) {
  const a = ctx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (type === 'kick') { o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + .12); }
  g.gain.setValueAtTime(vol || .25, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
}
function hat(t) {
  const a = ctx(); if (!a) return;
  const b = a.createBuffer(1, a.sampleRate * .05, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = .12;
  s.buffer = b; s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
}
const SCALE = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];

R.play = (opts) => new Promise(resolve => {
  opts = opts || {};
  const bpm = opts.bpm || 112, beat = 60 / bpm, N = opts.notes || 14;
  // Note pattern in beats, after a 4-beat count-in.
  const times = []; let b = 4;
  for (let i = 0; i < N; i++) { times.push(b); b += [1, 1, .5, 1, 1.5, .5, 1][Math.floor(Math.random() * 7)]; }
  const endBeat = b + 2;
  const wrap = document.createElement('div');
  wrap.className = 'rhythm';
  wrap.innerHTML = '<div class="rh-top"><span class="rec">REC</span><b>' + (opts.title || 'Live stage') + '</b><button class="btn ghost sm rh-skip">Skip</button></div>' +
    '<div class="rh-sub">Tap anywhere (or press Space) as each note reaches the line.</div>' +
    '<canvas class="rh-c"></canvas><div class="rh-judge" aria-live="polite"></div><div class="rh-score"></div>';
  document.body.appendChild(wrap);
  const cv = wrap.querySelector('canvas'), c2 = cv.getContext('2d'), judge = wrap.querySelector('.rh-judge'), sc = wrap.querySelector('.rh-score');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function size() { const w = wrap.clientWidth, h = Math.min(260, wrap.clientHeight * .45); cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; }
  size(); window.addEventListener('resize', size);
  const a = ctx();
  const t0 = (a ? a.currentTime : performance.now() / 1000) + .25;
  const now = () => a ? a.currentTime : performance.now() / 1000;
  if (a) {
    for (let k = 0; k < endBeat; k++) { tone(t0 + k * beat, 0, .18, 'kick', k < 4 ? .2 : .35); hat(t0 + (k + .5) * beat); }
    for (let k = 0; k < 4; k++) tone(t0 + k * beat, 880, .08, 'square', .06);
  }
  const state = times.map(() => 0); // 0 pending, 1 perfect, 2 good, 3 miss
  let combo = 0, done = false, raf;
  function hit() {
    if (done) return;
    const t = (now() - t0) / beat;
    let bi = -1, bd = 9;
    times.forEach((x, i) => { if (!state[i]) { const d = Math.abs(t - x); if (d < bd) { bd = d; bi = i; } } });
    if (bi < 0) return;
    const ms = bd * beat * 1000;
    if (ms <= 70) { state[bi] = 1; combo++; show('Perfect'); tone(now(), SCALE[bi % 8] * 2, .15, 'triangle', .18); }
    else if (ms <= 150) { state[bi] = 2; combo++; show('Good'); tone(now(), SCALE[bi % 8] * 2, .12, 'triangle', .12); }
    else if (ms <= 260) { state[bi] = 3; combo = 0; show('Off beat'); }
  }
  function show(t) { judge.textContent = t + (combo > 2 ? ' · ' + combo : ''); judge.className = 'rh-judge on ' + t.toLowerCase().replace(' ', ''); }
  function key(e) { if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hit(); } }
  wrap.addEventListener('pointerdown', e => { if (e.target.closest('.rh-skip')) return; hit(); });
  document.addEventListener('keydown', key);
  wrap.querySelector('.rh-skip').addEventListener('click', () => finish(true));
  function draw() {
    const W = cv.width, H = cv.height, t = (now() - t0) / beat;
    c2.clearRect(0, 0, W, H);
    const lx = W * .18, y = H / 2, px = W * .2; // px per beat
    c2.strokeStyle = '#2c3038'; c2.lineWidth = 2 * dpr; c2.beginPath(); c2.moveTo(0, y); c2.lineTo(W, y); c2.stroke();
    c2.strokeStyle = '#ecebe6'; c2.lineWidth = 3 * dpr; c2.beginPath(); c2.moveTo(lx, y - 40 * dpr); c2.lineTo(lx, y + 40 * dpr); c2.stroke();
    if (t < 4) { c2.fillStyle = '#e5484d'; c2.font = 700 * 1 + ' ' + 42 * dpr + 'px "IBM Plex Mono", monospace'; c2.textAlign = 'center'; c2.fillText(String(Math.max(1, 4 - Math.floor(Math.max(0, t)))), W / 2, y - 60 * dpr); }
    times.forEach((x, i) => {
      if (!state[i] && (t - x) * beat * 1000 > 260) { state[i] = 3; combo = 0; show('Miss'); }
      const nx = lx + (x - t) * px;
      if (nx < -30 || nx > W + 30) return;
      const s = state[i];
      c2.fillStyle = s === 1 ? '#6fcf97' : s === 2 ? '#f0b44c' : s === 3 ? '#4a4e57' : '#ecebe6';
      c2.beginPath(); c2.arc(nx, y, (s ? 9 : 14) * dpr, 0, Math.PI * 2); c2.fill();
    });
    const hits = state.filter(x => x === 1 || x === 2).length;
    sc.textContent = hits + ' / ' + N;
    if (t > endBeat) finish(false); else raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  function finish(skipped) {
    if (done) return; done = true; cancelAnimationFrame(raf);
    document.removeEventListener('keydown', key); window.removeEventListener('resize', size);
    wrap.remove();
    if (skipped) return resolve(null);
    const acc = state.reduce((t, s) => t + (s === 1 ? 1 : s === 2 ? .6 : 0), 0) / N;
    resolve(acc);
  }
});
})();
