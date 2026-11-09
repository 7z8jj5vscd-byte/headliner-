const path = require('path'); const vm = require('vm'); const fs = require('fs');
const ctx = { console, Math, Date, JSON }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['data.js', 'engine.js', 'systems.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
const LN = ctx.LN;
const S = LN.newGame({ name: 'T', city: 'Atlanta', genre: 'pop', story: 'talent', tutorial: false });
for (let w = 0; w < 300; w++) { if (S.songs.filter(s => !s.rel).length < 6) LN.writeSong(S, { genre: 'pop', mood: 'Euphoric', topic: 'Love', tempo: 'up' }); const s = S.songs.find(s => !s.recorded); if (s) LN.recordSong(S, s.id, { studio: 'pro', producer: 'self' }); const ready = S.songs.filter(s => s.recorded && !s.rel); if (ready.length && w % 4 === 0) LN.createRelease(S, { type: 'single', title: 'x', songs: [ready[0].id] }); LN.endWeek(S); }
const full = JSON.parse(LN.serialize(S));
console.log('total', Math.round(LN.serialize(S).length / 1024) + 'K', Object.entries(full).map(([k, v]) => [k, JSON.stringify(v).length]).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + Math.round(v / 1024) + 'K').join(' | '));
console.log('one npc song:', JSON.stringify(full.npcSongs[5]));
console.log('one song:', JSON.stringify(full.songs[5]));
