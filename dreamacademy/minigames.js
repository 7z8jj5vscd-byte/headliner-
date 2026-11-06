/* Dream Academy: Story Mode. Interactive training, eval and stage mini-games.
   MG.run(kind, opts) -> Promise<number 0..1 | null when skipped>.
   kinds: vocal, dance, rap, stage, write, fans, live, mv */
(function () {
const MG = window.MG = { last:{} };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);

/* ---------- Audio ---------- */
let AC = null, MASTER = null;
MG.vol = 1;
function ac() { try { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); MASTER.gain.value = MG.vol; } catch (e) { AC = null; } return AC; }
const OUT = () => MASTER;
MG.setVol = v => { MG.vol = v; if (MASTER) MASTER.gain.value = v; };
function blip(f, d, type, vol, at) { const a = ac(); if (!a) return; const t = at || a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.type = type || 'triangle'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol || .15, t); g.gain.exponentialRampToValueAtTime(.001, t + (d || .15));
  o.connect(g); g.connect(OUT()); o.start(t); o.stop(t + (d || .15) + .03); }
function kick(at, vol) { const a = ac(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(140, at); o.frequency.exponentialRampToValueAtTime(42, at + .12);
  g.gain.setValueAtTime(vol || .32, at); g.gain.exponentialRampToValueAtTime(.001, at + .2); o.connect(g); g.connect(OUT()); o.start(at); o.stop(at + .22); }
function hat(at) { const a = ac(); if (!a) return; const b = a.createBuffer(1, a.sampleRate * .04, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = .1; s.buffer = b; s.connect(f); f.connect(g); g.connect(OUT()); s.start(at); }
function bass(at, f) { blip(f, .3, 'sawtooth', .05, at); }
const now = () => AC ? AC.currentTime : performance.now() / 1000;
MG.unlock = ac;

/* ---------- Overlay ---------- */
function overlay(o) {
  const w = document.createElement('div');
  w.className = 'mg';
  w.innerHTML = '<div class="mg-top"><span class="rec">REC</span><b>' + esc(o.title || 'Training') + '</b><button class="btn ghost sm mg-skip">Skip</button></div>' +
    '<div class="mg-3d"></div><div class="mg-sub">' + esc(o.help || '') + '</div><div class="mg-play"></div>';
  document.body.appendChild(w);
  const view = w.querySelector('.mg-3d'), play = w.querySelector('.mg-play');
  let scene = null;
  if (window.S3 && o.set !== 'none') scene = S3.mount(view, Object.assign({ set:o.set || 'practice', height:view.clientHeight }, o.scene || {}));
  if (!scene) view.classList.add('flat');
  return { w, view, play, scene, sub:w.querySelector('.mg-sub'),
    close() { if (scene) scene.destroy(); w.remove(); },
    onSkip(fn) { w.querySelector('.mg-skip').addEventListener('click', fn); } };
}
function finish(O, acc, label, extra) {
  return new Promise(res => {
    const pct = Math.round(acc * 100), g = acc >= .9 ? 'A+' : acc >= .78 ? 'A' : acc >= .62 ? 'B' : acc >= .45 ? 'C' : 'D';
    if (O.scene) { O.scene.play(acc >= .62 ? 'jump' : 'bow'); }
    const d = document.createElement('div'); d.className = 'mg-res';
    d.innerHTML = '<span class="eyebrow">' + esc(label || 'Result') + '</span><div class="mg-grade g' + g.replace('+', 'p') + '">' + g + '</div><p class="mono">' + pct + '%</p>' + (extra || '') + '<button class="btn big">Continue</button>';
    O.play.innerHTML = ''; O.play.appendChild(d); O.sub.textContent = '';
    d.querySelector('button').addEventListener('click', () => { O.close(); res(acc); });
  });
}
function keyOnce(handler) { const f = e => handler(e); document.addEventListener('keydown', f); return () => document.removeEventListener('keydown', f); }

/* ---------- Lane rhythm engine (used by rap, live) ---------- */
function laneGame(O, cfg) {
  return new Promise(res => {
    const lanes = cfg.lanes || 1, bpm = cfg.bpm || 110, beat = 60 / bpm, N = cfg.notes || 16;
    const notes = []; let b = 4;
    for (let i = 0; i < N; i++) { notes.push({ t:b, l:lanes > 1 ? Math.floor(Math.random() * lanes) : 0, s:0 }); b += pick(cfg.gaps || [1, 1, .5, 1, 1.5]); }
    const endB = b + 2;
    O.play.innerHTML = '<canvas class="mg-c"></canvas><div class="mg-judge"></div><div class="mg-score mono"></div>' + (lanes > 1 ? '<div class="mg-lanes"><button data-l="0">◀ Left (F)</button><button data-l="1">Right (J) ▶</button></div>' : '<button class="mg-tap">Tap (Space)</button>');
    const cv = O.play.querySelector('canvas'), cx = cv.getContext('2d'), J = O.play.querySelector('.mg-judge'), SC = O.play.querySelector('.mg-score');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => { cv.width = O.play.clientWidth * dpr; cv.height = 150 * dpr; cv.style.height = '150px'; };
    size();
    const a = ac(), t0 = now() + .3;
    if (a) for (let k = 0; k < endB; k++) { kick(t0 + k * beat, k < 4 ? .18 : .3); hat(t0 + (k + .5) * beat); if (k % 2 === 0 && k >= 4) bass(t0 + k * beat, [55, 65.4, 73.4, 49][Math.floor(k / 4) % 4]); }
    if (a) for (let k = 0; k < 4; k++) blip(880, .06, 'square', .05, t0 + k * beat);
    let combo = 0, done = false, raf, chantAt = 0; const offs = [];
    const judge = (txt, cls) => { J.textContent = txt + (combo > 2 ? ' ×' + combo : ''); J.className = 'mg-judge on ' + cls; };
    function hit(lane) {
      if (done) return;
      const t = (now() - t0) / beat;
      let bi = -1, bd = 9;
      notes.forEach((n, i) => { if (!n.s && (lanes === 1 || n.l === lane)) { const d = Math.abs(t - n.t); if (d < bd) { bd = d; bi = i; } } });
      if (bi < 0) return;
      const ms = bd * beat * 1000; offs.push((t - notes[bi].t) * beat * 1000);
      if (ms <= 75) { notes[bi].s = 1; combo++; judge('Perfect', 'perfect'); blip(523 * Math.pow(2, (bi % 8) / 12), .15, 'triangle', .14); if (O.scene) O.scene.flashHit(cfg.light); }
      else if (ms <= 155) { notes[bi].s = 2; combo++; judge('Good', 'good'); blip(392, .1, 'triangle', .1); }
      else if (ms <= 260) { notes[bi].s = 3; combo = 0; judge('Off beat', 'miss'); }
      if (cfg.onCombo && combo && combo % 6 === 0) cfg.onCombo(combo);
    }
    const unkey = keyOnce(e => { if (e.repeat) return; if (lanes > 1 && (e.key === 'f' || e.key === 'F' || e.key === 'ArrowLeft')) { e.preventDefault(); hit(0); }
      else if (lanes > 1 && (e.key === 'j' || e.key === 'J' || e.key === 'ArrowRight')) { e.preventDefault(); hit(1); }
      else if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); hit(0); } });
    O.play.addEventListener('pointerdown', e => { const l = e.target.closest('[data-l]'); if (l) { hit(+l.dataset.l); return; } if (lanes === 1) hit(0); });
    function draw() {
      const W = cv.width, H = cv.height, t = (now() - t0) / beat, lx = W * .16, px = W * .18;
      cx.clearRect(0, 0, W, H);
      for (let l = 0; l < lanes; l++) { const y = H * (lanes > 1 ? (l ? .7 : .3) : .5); cx.strokeStyle = '#2c3038'; cx.lineWidth = 2 * dpr; cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
      cx.strokeStyle = '#ecebe6'; cx.lineWidth = 3 * dpr; cx.beginPath(); cx.moveTo(lx, 8 * dpr); cx.lineTo(lx, H - 8 * dpr); cx.stroke();
      if (t < 4) { cx.fillStyle = '#e5484d'; cx.font = '700 ' + 36 * dpr + 'px "IBM Plex Mono",monospace'; cx.textAlign = 'center'; cx.fillText(String(4 - Math.floor(Math.max(0, t))), W / 2, H / 2 + 12 * dpr); }
      notes.forEach(n => {
        if (!n.s && (t - n.t) * beat * 1000 > 260) { n.s = 3; combo = 0; judge('Miss', 'miss'); }
        const x = lx + (n.t - t) * px; if (x < -20 || x > W + 20) return;
        const y = H * (lanes > 1 ? (n.l ? .7 : .3) : .5);
        cx.fillStyle = n.s === 1 ? '#6fcf97' : n.s === 2 ? '#f0b44c' : n.s === 3 ? '#4a4e57' : (n.l ? '#9ec5ff' : '#ecebe6');
        cx.beginPath(); cx.arc(x, y, (n.s ? 8 : 13) * dpr, 0, Math.PI * 2); cx.fill();
      });
      SC.textContent = notes.filter(n => n.s === 1 || n.s === 2).length + ' / ' + N;
      if (cfg.chant && t > 4 && t - chantAt > 6) { chantAt = t; cfg.chant(); }
      if (t > endB) end(); else raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    function end() { if (done) return; done = true; cancelAnimationFrame(raf); unkey();
      const avg = offs.length ? offs.reduce((a, b) => a + b, 0) / offs.length : 0;
      MG.last.timing = { perfect:notes.filter(n => n.s === 1).length, good:notes.filter(n => n.s === 2).length, miss:notes.filter(n => n.s !== 1 && n.s !== 2).length, avg:Math.round(avg) };
      res(notes.reduce((s, n) => s + (n.s === 1 ? 1 : n.s === 2 ? .6 : 0), 0) / N); }
    O.stop = () => { done = true; cancelAnimationFrame(raf); unkey(); };
  });
}

/* ---------- Vocal: Hold the Note ---------- */
function vocal(O, o) {
  return new Promise(res => {
    const dur = 14, tol = .07 + (o.skill || 50) / 1500;
    O.play.innerHTML = '<canvas class="mg-c tall"></canvas><div class="mg-score mono"></div><button class="mg-tap">Hold to sing higher</button>';
    const cv = O.play.querySelector('canvas'), cx = cv.getContext('2d'), SC = O.play.querySelector('.mg-score');
    const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = O.play.clientWidth * dpr; cv.height = 190 * dpr; cv.style.height = '190px';
    const ph = [rand(0, 6), rand(0, 6), rand(0, 6)];
    const target = t => .5 + .22 * Math.sin(t * .55 + ph[0]) + .12 * Math.sin(t * 1.3 + ph[1]) + .06 * Math.sin(t * 2.7 + ph[2]);
    let y = .5, v = 0, hold = false, inside = 0, total = 0, last = performance.now(), start = last, done = false, raf;
    const a = ac(); let osc = null, gain = null;
    if (a) { osc = a.createOscillator(); gain = a.createGain(); osc.type = 'triangle'; gain.gain.value = 0; const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 4; lfo.connect(lg); lg.connect(osc.frequency); lfo.start();
      osc.connect(gain); gain.connect(OUT()); osc.start(); O._stopAudio = () => { try { osc.stop(); lfo.stop(); } catch (e) {} }; }
    const down = e => { if (e && e.target && e.target.closest('.mg-skip')) return; hold = true; }, up = () => { hold = false; };
    O.play.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
    const unkey = keyOnce(e => { if (e.code === 'Space') { e.preventDefault(); hold = e.type === 'keydown'; } });
    const ku = e => { if (e.code === 'Space') hold = false; }; document.addEventListener('keyup', ku);
    function draw() {
      const tnow = performance.now(), dt = Math.min(.05, (tnow - last) / 1000), t = (tnow - start) / 1000; last = tnow;
      v += (hold ? 1.5 : -1.3) * dt; v *= .92; y = Math.max(0, Math.min(1, y + v * dt * 3));
      const W = cv.width, H = cv.height;
      cx.clearRect(0, 0, W, H);
      // target band
      cx.fillStyle = 'rgba(240,180,76,.18)'; cx.beginPath();
      for (let x = 0; x <= W; x += 6) { const tt = t + (x / W - .25) * 3; cx.lineTo(x, H * (1 - target(tt) - tol)); }
      for (let x = W; x >= 0; x -= 6) { const tt = t + (x / W - .25) * 3; cx.lineTo(x, H * (1 - target(tt) + tol)); }
      cx.fill();
      const tg = target(t), ok = Math.abs(y - tg) <= tol;
      if (t > 1) { total++; if (ok) inside++; }
      cx.fillStyle = ok ? '#6fcf97' : '#ff6b6b'; cx.beginPath(); cx.arc(W * .25, H * (1 - y), 10 * dpr, 0, Math.PI * 2); cx.fill();
      if (gain) { gain.gain.setTargetAtTime(t > 1 ? .07 : 0, now(), .05); osc.frequency.setTargetAtTime(220 + y * 440, now(), .03); }
      if (O.scene && Math.floor(t * 2) % 2 === 0) O.scene.play(ok ? 'wave' : 'idle', 0);
      SC.textContent = 'On pitch ' + (total ? Math.round(inside / total * 100) : 0) + '% · ' + Math.max(0, Math.ceil(dur - t)) + 's';
      if (t > dur) end(); else raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    function end() { if (done) return; done = true; cancelAnimationFrame(raf); unkey(); document.removeEventListener('keyup', ku); window.removeEventListener('pointerup', up); if (O._stopAudio) O._stopAudio();
      res(total ? Math.min(1, inside / total * 1.08) : 0); }
    O.stop = () => { done = true; cancelAnimationFrame(raf); unkey(); document.removeEventListener('keyup', ku); window.removeEventListener('pointerup', up); if (O._stopAudio) O._stopAudio(); };
  });
}

/* ---------- Dance: Mirror the Choreo ---------- */
const ARW = { L:'←', R:'→', U:'↑', D:'↓' };
function dance(O, o) {
  return new Promise(async res => {
    const rounds = [3, 4, 5, 6], speed = .75 - Math.min(.2, (o.skill || 50) / 500);
    let right = 0, total = 0, done = false;
    O.stop = () => { done = true; };
    O.play.innerHTML = '<div class="mg-seq"></div><div class="mg-score mono"></div><div class="mg-pad"><button data-d="U">↑</button><button data-d="L">←</button><button data-d="D">↓</button><button data-d="R">→</button></div>';
    const seqEl = O.play.querySelector('.mg-seq'), SC = O.play.querySelector('.mg-score'), pad = O.play.querySelector('.mg-pad');
    pad.classList.add('off');
    for (let r = 0; r < rounds.length && !done; r++) {
      const seq = Array.from({ length:rounds[r] }, () => pick(['L','R','U','D']));
      seqEl.innerHTML = seq.map(() => '<i>·</i>').join('');
      SC.textContent = 'Round ' + (r + 1) + ' of ' + rounds.length + ': watch the coach';
      // Demo.
      for (let k = 0; k < seq.length && !done; k++) {
        seqEl.children[k].textContent = ARW[seq[k]]; seqEl.children[k].className = 'on';
        if (O.scene) O.scene.play(seq[k], 0);
        blip([392, 440, 494, 523][k % 4], .12, 'triangle', .1);
        await wait(speed * 1000);
        seqEl.children[k].className = ''; if (O.scene) O.scene.play('idle', 0);
        await wait(140);
      }
      if (done) break;
      seqEl.innerHTML = seq.map(() => '<i>?</i>').join('');
      SC.textContent = 'Your turn: repeat it';
      pad.classList.remove('off');
      const got = await new Promise(r2 => {
        let k = 0, ok = 0;
        const step = d => {
          if (O.scene) O.scene.play(d, 0);
          const good = d === seq[k];
          seqEl.children[k].textContent = ARW[d]; seqEl.children[k].className = good ? 'good' : 'bad';
          blip(good ? 660 : 180, .1, good ? 'triangle' : 'square', .1);
          if (good) ok++; k++;
          if (k >= seq.length) { cleanup(); setTimeout(() => r2(ok), 450); }
        };
        const click = e => { const b = e.target.closest('[data-d]'); if (b) step(b.dataset.d); };
        const unk = keyOnce(e => { const m = { ArrowLeft:'L', ArrowRight:'R', ArrowUp:'U', ArrowDown:'D' }[e.key]; if (m) { e.preventDefault(); step(m); } });
        pad.addEventListener('click', click);
        function cleanup() { pad.removeEventListener('click', click); unk(); }
        O.stop = () => { done = true; cleanup(); r2(ok); };
      });
      pad.classList.add('off'); if (O.scene) O.scene.play('idle', 0);
      right += got; total += seq.length;
      await wait(250);
    }
    res(total ? right / total : 0);
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Stage presence: Find the Camera, then the ending fairy ---------- */
function stage(O, o) {
  return new Promise(async res => {
    const cues = 9, win = 1100 - Math.min(300, (o.skill || 50) * 3);
    let score = 0, done = false;
    O.stop = () => { done = true; };
    O.play.innerHTML = '<div class="mg-cams"><button data-c="0">CAM 1</button><button data-c="1">CAM 2</button><button data-c="2">CAM 3</button></div><div class="mg-score mono"></div>';
    const cams = [...O.play.querySelectorAll('[data-c]')], SC = O.play.querySelector('.mg-score');
    if (O.scene) O.scene.dance(true, 116);
    for (let i = 0; i < cues && !done; i++) {
      await wait(rand(500, 1200));
      const c = Math.floor(Math.random() * 3);
      cams[c].classList.add('live'); const t0 = performance.now();
      if (O.scene) O.scene.setShot(['side','mid','close'][c]);
      const r = await new Promise(r2 => {
        const tm = setTimeout(() => { off(); r2(0); }, win);
        const click = e => { const b = e.target.closest('[data-c]'); if (!b) return; off(); clearTimeout(tm);
          r2(+b.dataset.c === c ? Math.max(.4, 1 - (performance.now() - t0) / win * .6) : 0); };
        const unk = keyOnce(e => { const k = { '1':0, '2':1, '3':2 }[e.key]; if (k != null) click({ target:cams[k] }); });
        O.play.addEventListener('pointerdown', click);
        function off() { O.play.removeEventListener('pointerdown', click); unk(); cams[c].classList.remove('live'); }
        O.stop = () => { done = true; off(); clearTimeout(tm); r2(0); };
      });
      score += r; blip(r ? 700 : 160, .1, r ? 'triangle' : 'square', .1);
      SC.textContent = 'Camera ' + (i + 1) + ' of ' + cues + (r ? ' · caught it' : ' · missed');
    }
    if (done) return res(score / cues);
    // Ending fairy: tap when the ring closes.
    if (O.scene) { O.scene.dance(false); O.scene.play('fairy'); O.scene.focus(0); }
    O.play.innerHTML = '<div class="mg-fairy"><div class="ring"></div><p>Ending fairy: tap when the ring closes</p></div><button class="mg-tap">Pose!</button>';
    const ring = O.play.querySelector('.ring'); const t0 = performance.now(), D = 1800;
    const fairy = await new Promise(r2 => {
      let raf; const tick = () => { const p = Math.min(1.25, (performance.now() - t0) / D); ring.style.transform = 'scale(' + Math.max(.15, 1.6 - p * 1.45) + ')'; if (p >= 1.25) { stop(); r2(0); } else raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      const tap = () => { stop(); const p = (performance.now() - t0) / D; r2(Math.max(0, 1 - Math.abs(1 - p) * 4)); };
      const unk = keyOnce(e => { if (e.code === 'Space') { e.preventDefault(); tap(); } });
      O.play.addEventListener('pointerdown', tap);
      function stop() { cancelAnimationFrame(raf); unk(); O.play.removeEventListener('pointerdown', tap); }
      O.stop = () => { stop(); r2(0); };
    });
    blip(fairy > .6 ? 880 : 300, .3, 'sine', .12);
    res(Math.min(1, score / cues * .8 + fairy * .2));
  });
}

/* ---------- Songwriting: Hook Builder ---------- */
const LINES = [
  ['We light the city up tonight', 'night'], ['Hold me closer, hold me tight', 'night'], ['Every signal says you\'re right', 'night'], ['Burning brighter than the light', 'night'],
  ['Turn it louder, take it higher', 'fire'], ['Running on a live wire', 'fire'], ['Dancing straight into the fire', 'fire'], ['Nothing\'s louder than desire', 'fire'],
  ['Watch the whole world start to glow', 'go'], ['Never gonna take it slow', 'go'], ['Front row seats to our own show', 'go'], ['Say the word and we will go', 'go'],
  ['You can feel it in your heart', 'heart'], ['This is only the start', 'heart'], ['Even when we\'re worlds apart', 'heart'], ['Paint it loud like modern art', 'heart'],
  ['Nobody gets to tell me who to be', 'me'], ['Open up the door and set it free', 'me'], ['All the cameras turning just to see', 'me'], ['Six of us and all of it is me', 'me'],
];
function syl(s) { return (s.toLowerCase().replace(/[^a-z ]/g, '').match(/[aeiouy]+/g) || []).length; }
function write(O, o) {
  return new Promise(res => {
    const target = 8; let lines = [], step = 0, done = false;
    O.stop = () => { done = true; res(0); };
    if (O.scene) O.scene.play('sit', 0);
    function render() {
      const opts = shuffle(LINES.filter(l => !lines.includes(l))).slice(0, 3);
      // Guarantee one rhyme option for lines 2 and 4.
      if (step % 2 === 1) { const want = lines[step - 1][1]; if (!opts.some(l => l[1] === want)) { const r = LINES.find(l => l[1] === want && !lines.includes(l)); if (r) opts[2] = r; } }
      O.play.innerHTML = '<div class="mg-sheet">' + lines.map((l, i) => '<p><span class="mono faint">' + (i + 1) + '</span> ' + esc(l[0]) + '</p>').join('') + '<p class="faint"><span class="mono">' + (step + 1) + '</span> …</p></div>' +
        '<div class="mg-opts">' + opts.map((l, i) => '<button data-o="' + i + '"><b>' + esc(l[0]) + '</b><span class="mono">' + syl(l[0]) + ' syllables</span></button>').join('') + '</div>' +
        '<p class="small faint">Lines 1–2 and 3–4 should rhyme. Aim for about ' + target + ' syllables a line.</p>';
      O.play.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { if (done) return; lines.push(opts[+b.dataset.o]); step++; blip(500 + step * 80, .12, 'triangle', .1);
        if (step >= 4) score(); else render(); }));
    }
    function score() {
      done = true;
      let s = 0;
      if (lines[0][1] === lines[1][1]) s += .3; if (lines[2][1] === lines[3][1]) s += .3;
      lines.forEach(l => { s += Math.max(0, .1 - Math.abs(syl(l[0]) - target) * .03); });
      const hook = lines[0][0].split(' ').slice(-2).join(' ').replace(/[^A-Za-z' ]/g, '');
      MG.last.hook = hook.replace(/\b\w/g, c => c.toUpperCase());
      MG.last.lyric = lines.map(l => l[0]);
      res(Math.min(1, s));
    }
    render();
  });
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- Charisma: Fan Q&A ---------- */
const QA = [
  ['A fan says she learned English watching your vlogs. What do you say?', ['That means so much. Which vlog was your favorite?', 'Ha, cool.', 'You should watch the new one!']],
  ['"What do you do on a day off?"', ['Sleep until noon, then karaoke with the members.', 'We don\'t really get days off.', 'Nothing interesting.']],
  ['A fan is too nervous to speak.', ['Take your time. I\'m nervous too, honestly.', 'Next!', 'Smile and wait in silence.']],
  ['"Who is the funniest member?"', ['All of them, in completely different ways.', 'Definitely not me.', 'I can\'t say, they\'d kill me.']],
  ['"Can you do aegyo?"', ['One try, and you can\'t laugh!', 'No.', 'I don\'t know what that is.']],
  ['A fan brings a handmade drawing of you.', ['This is beautiful. Can I keep it in the practice room?', 'Thanks, nice.', 'My nose isn\'t that big!']],
  ['"What song are you proudest of?"', ['The next one. We worked so hard on it.', 'Whatever charted best.', 'Hmm, hard to say.']],
  ['"Do you get homesick?"', ['Sometimes. Video calls with my family help a lot.', 'Never.', 'Let\'s not talk about that.']],
  ['A fan asks for a tip to get through exams.', ['Rest is part of studying. You\'ve got this!', 'Just study more.', 'I hated school.']],
  ['"What was the hardest part of the show?"', ['Saying goodbye to the trainees who left.', 'The cameras.', 'Everything, honestly.']],
];
function fans(O, o) {
  return new Promise(async res => {
    const qs = shuffle(QA).slice(0, 5), T = 6500 + (o.skill || 50) * 20;
    let s = 0, done = false; O.stop = () => { done = true; };
    if (O.scene) O.scene.play('idle');
    for (let i = 0; i < qs.length && !done; i++) {
      const [q, ans] = qs[i], order = shuffle([0, 1, 2]);
      O.play.innerHTML = '<div class="mg-q"><span class="mono faint small">FAN ' + (i + 1) + ' OF 5</span><p>' + esc(q) + '</p><div class="mg-timer"><i></i></div></div><div class="mg-opts">' +
        order.map(k => '<button data-a="' + k + '"><b>' + esc(ans[k]) + '</b></button>').join('') + '</div>';
      const bar = O.play.querySelector('.mg-timer i'); bar.style.transition = 'width ' + T + 'ms linear'; requestAnimationFrame(() => { bar.style.width = '0%'; });
      const r = await new Promise(r2 => {
        const tm = setTimeout(() => r2(-1), T);
        O.play.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { clearTimeout(tm); r2(+b.dataset.a); }));
        O.stop = () => { done = true; clearTimeout(tm); r2(-1); };
      });
      const v = r === 0 ? 1 : r === 2 ? .35 : 0; s += v;
      if (O.scene) O.scene.play(v === 1 ? 'clap' : 'idle');
      blip(v === 1 ? 784 : v ? 440 : 180, .12, 'triangle', .1);
      await wait(380);
    }
    res(s / qs.length);
  });
}

/* ---------- Public ---------- */
const INFO = {
  vocal:{ title:'Vocal lesson: Hold the Note', help:'Hold the button (or Space) to sing higher, let go to drop. Stay inside the gold band.' },
  dance:{ title:'Dance practice: Mirror the Choreo', help:'Watch the coach, then repeat the moves with the arrows.' },
  rap:{ title:'Rap and flow: Two-Lane Flow', help:'Tap left and right (F and J) as the notes cross the line.' },
  stage:{ title:'Stage rehearsal: Find the Camera', help:'Tap the camera with the red light before it cuts away. Finish with an ending fairy.' },
  write:{ title:'Songwriting: Hook Builder', help:'Build a four-line hook. Rhymes and a steady length score best.' },
  fans:{ title:'Fan time: Q&A', help:'Answer each fan before the timer runs out.' },
  live:{ title:'Live stage', help:'Tap on the beat. The crowd chants on long combos.' },
  mv:{ title:'Music video shoot', help:'Hit the camera with the red light. One take each.' },
};
MG.INFO = INFO;
/* A beat loop for music video and stage playback. Returns a stop function. */
MG.beatLoop = (bpm, secs) => {
  const a = ac(); if (!a) return () => {};
  const beat = 60 / bpm, t0 = a.currentTime + .1, n = Math.floor(secs / beat), roots = [55, 65.4, 73.4, 49];
  for (let k = 0; k < n; k++) { kick(t0 + k * beat, .26); hat(t0 + (k + .5) * beat); if (k % 2 === 0) bass(t0 + k * beat, roots[Math.floor(k / 4) % 4]);
    if (k % 4 === 2) blip(roots[Math.floor(k / 4) % 4] * 8, .25, 'triangle', .05, t0 + k * beat); }
  return () => { try { MASTER.gain.setValueAtTime(0, a.currentTime); setTimeout(() => { MASTER.gain.value = MG.vol; }, 300); } catch (e) {} };
};
/* Background music: a soft four-chord pad loop. */
let MUS = null;
MG.music = on => {
  const a = ac(); if (!a) return;
  if (!on) { if (MUS) { MUS.stop(); MUS = null; } return; }
  if (MUS) return;
  const g = a.createGain(); g.gain.value = .035; g.connect(OUT());
  const chords = [[220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]];
  let k = 0, stopped = false, oscs = [];
  const play = () => { if (stopped) return; const t = a.currentTime; oscs.forEach(o => { try { o.stop(t + .9); } catch (e) {} }); oscs = [];
    chords[k % 4].forEach(f => { const o = a.createOscillator(), og = a.createGain(); o.type = 'sine'; o.frequency.value = f; og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(1, t + .8); og.gain.linearRampToValueAtTime(.6, t + 3.5);
      o.connect(og); og.connect(g); o.start(t); oscs.push(o); }); k++; MUS.tm = setTimeout(play, 4000); };
  MUS = { stop() { stopped = true; clearTimeout(MUS && MUS.tm); oscs.forEach(o => { try { o.stop(); } catch (e) {} }); g.disconnect(); } };
  play();
};
MG.forSkill = k => ({ vo:'vocal', da:'dance', ra:'rap', pe:'stage', so:'write', ch:'fans' })[k];
MG.statsOnly = false;
MG.run = (kind, o) => new Promise(async res => {
  o = o || {};
  if (MG.statsOnly) return res(null);
  MG.last.timing = null;
  ac();
  const info = INFO[kind] || INFO.live;
  const set = o.set || (kind === 'live' ? 'stage' : kind === 'mv' ? 'mv' : 'practice');
  const scene = { cast:o.cast || [], light:o.light, tint:o.tint, judges:o.judges, cuts:kind === 'live', close:set === 'practice' && (o.cast || []).length === 1, noDrag:true };
  const O = overlay({ title:o.title || info.title, help:info.help, set, scene });
  if (O.scene && kind === 'live') O.scene.dance(true, o.bpm || 118);
  let skipped = false;
  O.onSkip(() => { skipped = true; if (O.stop) O.stop(); O.close(); res(null); });
  let acc;
  if (kind === 'vocal') acc = await vocal(O, o);
  else if (kind === 'dance') acc = await dance(O, o);
  else if (kind === 'rap') { const sk = o.skill || 50, bpm = Math.round(88 + sk * .25); if (O.scene) O.scene.dance(true, bpm); acc = await laneGame(O, { lanes:2, bpm, notes:16 + Math.round(sk / 10), gaps:sk > 65 ? [.5, .5, .75, .5, 1, .25] : [.5, 1, .5, .75, 1] }); }
  else if (kind === 'stage' || kind === 'mv') acc = await stage(O, o);
  else if (kind === 'write') acc = await write(O, o);
  else if (kind === 'fans') acc = await fans(O, o);
  else acc = await laneGame(O, { lanes:1, bpm:o.bpm || Math.round(104 + (o.skill || 50) * .25), notes:o.notes || 14 + Math.round((o.skill || 50) / 8), gaps:(o.skill || 50) > 65 ? [1, .5, .5, 1, .75, .5] : undefined, light:o.light,
      chant:() => { const c = document.createElement('div'); c.className = 'mg-chant'; c.textContent = pick(o.chants || ['Go!']); O.view.appendChild(c); setTimeout(() => c.remove(), 1600); },
      onCombo:() => { if (O.scene) O.scene.setShot('close'); } });
  if (skipped) return;
  if (kind === 'live' && O.scene) { O.scene.dance(false); O.scene.play('fairy'); O.scene.focus(Math.max(0, o.focusIdx || 0)); }
  MG.last.timing = MG.last.timing || null;
  const tm = (kind === 'live' || kind === 'rap') && MG.last.timing ? '<p class="small mono">Perfect ' + MG.last.timing.perfect + ' · Good ' + MG.last.timing.good + ' · Miss ' + MG.last.timing.miss + '<br>' + (Math.abs(MG.last.timing.avg) < 25 ? 'Your timing is centered.' : MG.last.timing.avg > 0 ? 'You tap ' + MG.last.timing.avg + ' ms late on average.' : 'You tap ' + (-MG.last.timing.avg) + ' ms early on average.') + '</p>' : '';
  const extra = tm + (kind === 'write' && MG.last.lyric ? '<div class="mg-sheet small">' + MG.last.lyric.map(l => '<p>' + esc(l) + '</p>').join('') + '</div>' : '');
  res(await finish(O, acc, o.resultLabel || info.title, extra));
});
})();
