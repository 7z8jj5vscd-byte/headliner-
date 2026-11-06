/* The Eras Life: original generated sound. A soft chord loop that follows the era's mood, crowd
   noise for show nights, and small interface sounds. No recorded or real songs are used. */
(function () {
const SND = window.SND = { ctx:null, on:true, music:null, crowd:null, mood:'', vol:.5, musicOn:true, musicVol:.12 };
try { const v = localStorage.getItem('eras-sound'); if (v != null) SND.on = v === '1'; const m = localStorage.getItem('eras-music'); if (m != null) SND.musicOn = m === '1'; const mv = localStorage.getItem('eras-music-vol'); if (mv != null) SND.musicVol = +mv; } catch (e) {}

function ctx() {
  if (!SND.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; SND.ctx = new C(); SND.master = SND.ctx.createGain(); SND.master.gain.value = SND.vol; SND.master.connect(SND.ctx.destination); }
  if (SND.ctx.state === 'suspended') SND.ctx.resume();
  return SND.ctx;
}
const N = n => 440 * Math.pow(2, (n - 69) / 12);
// Original progressions for each mood (MIDI notes of chord roots and shapes).
const MOODS = {
  country:{ chords:[[60,64,67],[65,69,72],[67,71,74],[60,64,67]], bpm:84, wave:'triangle' },
  romantic:{ chords:[[57,60,64],[53,57,60],[60,64,67],[55,59,62]], bpm:72, wave:'sine' },
  pop:{ chords:[[60,64,67],[67,71,74],[57,60,64],[65,69,72]], bpm:104, wave:'triangle' },
  dark:{ chords:[[57,60,64],[53,57,60],[52,55,59],[57,60,64]], bpm:90, wave:'sawtooth' },
  quiet:{ chords:[[62,65,69],[58,62,65],[60,64,67],[57,60,64]], bpm:66, wave:'sine' }
};
function note(c, f, t, d, g, wave) {
  const o = c.createOscillator(), a = c.createGain(), lp = c.createBiquadFilter();
  o.type = wave || 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 1800;
  a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g, t + .03); a.gain.exponentialRampToValueAtTime(.0005, t + d);
  o.connect(lp); lp.connect(a); a.connect(SND.musicBus); o.start(t); o.stop(t + d + .05);
}
SND.setMood = function (mood) {
  if (!SND.on || SND.musicOn === false) return; const c = ctx(); if (!c) return;
  if (SND.mood === mood && SND.music) return; SND.mood = mood; SND.stopMusic();
  const m = MOODS[mood] || MOODS.pop; SND.musicBus = c.createGain(); SND.musicBus.gain.value = SND.musicVol; SND.musicBus.connect(SND.master);
  const beat = 60 / m.bpm; let step = 0, next = c.currentTime + .1;
  // A gentle arpeggio over the chords, scheduled a little ahead.
  SND.music = setInterval(() => { while (next < c.currentTime + .4) { const ch = m.chords[Math.floor(step / 8) % m.chords.length], i = step % 8;
      const n = ch[[0, 1, 2, 1, 0, 2, 1, 2][i]] + (i >= 4 ? 12 : 0); note(c, N(n), next, beat * 1.6, .25, m.wave);
      if (i === 0) note(c, N(ch[0] - 12), next, beat * 7, .22, 'sine');
      // A soft, wandering melody on top: original notes from the chord, now and then.
      if ((i === 2 || i === 6) && Math.random() < .55) note(c, N(ch[Math.floor(Math.random() * 3)] + 24 + (Math.random() < .3 ? 2 : 0)), next, beat * 2.2, .1, 'sine');
      next += beat / 2; step++; } }, 120);
};
SND.stopMusic = function () { if (SND.music) clearInterval(SND.music); SND.music = null; if (SND.musicBus) { try { SND.musicBus.disconnect(); } catch (e) {} } SND.musicBus = null; };
// Crowd noise: filtered noise that swells, for shows.
SND.crowd = function (seconds, big) {
  if (!SND.on) return; const c = ctx(); if (!c) return;
  const len = c.sampleRate * (seconds || 3), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (.6 + .4 * Math.sin(i / c.sampleRate * 3));
  const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
  src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = .6;
  const t = c.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(big ? .5 : .3, t + .6); g.gain.linearRampToValueAtTime(0, t + (seconds || 3));
  src.connect(bp); bp.connect(g); g.connect(SND.master); src.start(); src.stop(t + (seconds || 3));
};
SND.blip = function (up) {
  if (!SND.on) return; const c = ctx(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
  o.type = 'sine'; o.frequency.setValueAtTime(up ? 660 : 520, t); o.frequency.exponentialRampToValueAtTime(up ? 990 : 390, t + .08);
  g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g); g.connect(SND.master); o.start(t); o.stop(t + .15);
};
SND.fanfare = function () {
  if (!SND.on) return; const c = ctx(); if (!c) return; const t = c.currentTime;
  if (!SND.musicBus) { SND.musicBus = c.createGain(); SND.musicBus.gain.value = .12; SND.musicBus.connect(SND.master); }
  [[72, 0], [76, .12], [79, .24], [84, .38]].forEach(([n, d]) => note(c, N(n), t + d, .6, .5, 'triangle'));
};
SND.setMusic = function (on) { SND.musicOn = on; try { localStorage.setItem('eras-music', on ? '1' : '0'); } catch (e) {} if (!on) SND.stopMusic(); else SND.mood = ''; };
SND.setMusicVol = function (v) { SND.musicVol = v; try { localStorage.setItem('eras-music-vol', String(v)); } catch (e) {} if (SND.musicBus) SND.musicBus.gain.value = v; };
SND.toggle = function () { SND.on = !SND.on; try { localStorage.setItem('eras-sound', SND.on ? '1' : '0'); } catch (e) {} if (!SND.on) SND.stopMusic(); else { SND.mood = ''; } return SND.on; };
})();
