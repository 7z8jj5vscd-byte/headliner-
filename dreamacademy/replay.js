/* Dream Academy: Story Mode. Batch 4: story and replay value.
   Member arcs, anniversaries, epilogues, more endings, New Game+, challenge runs, what-if starts,
   a bigger random event pool, daily challenges, photocards, run history and seasonal events.
   Arcs and epilogues are invented, career-focused and kind; they never invent crises. */
(function () {
const D = window.DA, G = window.G;
const { q, log, feed, grow, chance, pick, clamp, r1 } = G._;
const S = () => G.S();
const n = id => G.name(id);
const R = (who, t, mv) => [who, t, mv];
const fan = (id, d) => { const p = G.p(id); p.fan = clamp(p.fan + d, 0, 100); };
const wb = (id, d) => { const p = G.p(id); p.wb = clamp(p.wb + d, 5, 100); };
const skill = (id, k, d) => { const p = G.p(id); p.sk[k] = r1(clamp(p.sk[k] + d, 0, 99)); };
const P = () => { const s = S(); s.rp = s.rp || { arcs:{}, cards:[], season:{}, anniv:{}, endDone:false }; return s.rp; };

/* ---------- Profile across runs (this device) ---------- */
G.profile = () => { try { return Object.assign({ runs:[], trophies:{}, cards:{}, daily:{}, challenges:{}, ngp:false }, JSON.parse(localStorage.getItem('da-profile')) || {}); } catch (e) { return { runs:[], trophies:{}, cards:{}, daily:{}, challenges:{}, ngp:false }; } };
G.saveProfile = p => { try { localStorage.setItem('da-profile', JSON.stringify(p)); } catch (e) {} };

/* ---------- Endings ---------- */
Object.assign(D.endings, {
  icons:    { t:'Global Icons', d:'Stadiums on four continents, trophies on every shelf. The group became shorthand for a whole era of pop.' },
  producer: { t:'Producer Era', d:'The focus of the cameras became the one writing the songs. The next generation of groups sings her music.' },
  disbanded:{ t:'Disbanded but Legendary', d:'They went their separate ways at the top. The number ones still play everywhere.' },
});
function upgradeEnding() {
  const s = S(), rp = P(); if (!s.ended || rp.endDone) return; rp.endDone = true;
  const f = s.focus, cap = G.dif().cap || 5.5e7;
  if (G.members().length < 3 && s.rec.no1 >= 1) s.ended = 'disbanded';
  else if (s.group.fans >= cap * .95 && s.rec.wins >= 4 && s.group.tours >= 3) s.ended = 'icons';
  else if (G.p(f).sk.so >= 85 && (G.p(f).status === 'member' || G.p(f).status === 'solo') && s.ended !== 'legends') s.ended = 'producer';
  const pr = G.profile();
  pr.runs.unshift({ date:new Date().toISOString().slice(0, 10), focus:f, mode:s.mode, diff:s.diff || 'normal', ending:s.ended, fans:s.group.fans, best:s.rec.best, no1:s.rec.no1, wins:s.rec.wins, trophies:Object.keys(s.trophies).length, group:s.group.name, challenge:s.challenge || null });
  pr.runs = pr.runs.slice(0, 30);
  Object.keys(s.trophies).forEach(k => { pr.trophies[k] = pr.trophies[k] || s.trophies[k]; });
  rp.cards.forEach(c => { pr.cards[c.key] = c; });
  if (s.challenge) pr.challenges[s.challenge] = true;
  pr.ngp = true;
  G.saveProfile(pr);
}
const EPI = {
  vo:'{n} kept singing everywhere: soundtracks, duets, a live album recorded in one take.',
  da:'{n} choreographed for younger groups; her moves showed up in a hundred dance challenges.',
  ra:'{n} kept writing verses; other artists started asking for "a ' + '{n}' + ' verse" by name.',
  pe:'{n} became the stage everyone studied: tour directors still send new idols her fancams.',
  so:'{n} wrote songs for the group and beyond, and kept a notebook of every lyric she ever cut.',
  ch:'{n} hosted her own show and made every guest feel like the most interesting person in the room.',
};
const _view = G.view;
G.view = ev => {
  if (ev.kind === 'ending' && !ev.epi) {
    upgradeEnding();
    const s = S(), e = D.endings[s.ended], ids = G.members().concat(s.alumni).filter((x, i, a) => a.indexOf(x) === i).slice(0, 6);
    const lines = [R('N', 'Years from now. In this story, this is how it went.')];
    ids.forEach(id => { const k = D.skills.slice().sort((a, b) => G.p(id).sk[b.k] - G.p(id).sk[a.k])[0].k; lines.push(R(id, EPI[k].replace(/\{n\}/g, n(id)), 'cheer')); });
    lines.push(R('N', e.t + '.'));
    return { eyebrow:'The end', title:e.t, text:e.d, scene:{ set:s.ended === 'disbanded' || s.ended === 'solo' ? 'street' : 'stage', cast:ids, lines }, choices:[['See the final numbers']] };
  }
  return _view(ev);
};
const _choose = G.choose;
G.choose = (ev, i, acc) => { if (ev.kind === 'ending') { ev.epi = true; upgradeEnding(); } return _choose(ev, i, acc); };

/* ---------- Challenges, New Game+, what-if starts ---------- */
G.CHALLENGES = {
  none:    { l:'No challenge', d:'' },
  noBreaks:{ l:'No Breaks', d:'Breaks are disabled. Keep everyone healthy the hard way.' },
  bottom:  { l:'Bottom Three Start', d:'Your focus member starts 10 points lower in every skill.' },
  underdog:{ l:'Underdog', d:'Open result only, and your focus member starts with almost no fans.' },
  solo:    { l:'One-Member Focus', d:'Only your focus member can be planned by hand.' },
};
G.STARTS = [[1, 'Month 1: the open call'], [19, 'The survival show'], [22, 'Pre-debut'], [37, 'Breakout'], [49, 'Superstardom'], [61, 'Staying on Top']];
const _new = G.newGame;
G.newGame = opts => {
  const s = _new(opts);
  s.challenge = opts.challenge && opts.challenge !== 'none' ? opts.challenge : null;
  const f = s.focus, p = s.people[f];
  if (s.challenge === 'bottom') D.skills.forEach(({ k }) => { p.sk[k] = r1(Math.max(5, p.sk[k] - 10)); });
  if (s.challenge === 'underdog') { s.mode = 'open'; p.fan = 2; }
  if (opts.ngp) { s.ngp = true; D.skills.forEach(({ k }) => { p.sk[k] = r1(p.sk[k] + 5); }); const pr = G.profile(); Object.keys(pr.trophies).forEach(k => { s.trophies[k] = pr.trophies[k]; }); log('New Game+: ' + n(f) + ' starts stronger, and your trophies carry over.', 'story'); }
  return s;
};
const _hiatus = G.startHiatus;
G.startHiatus = (id, mo) => { if (S().challenge === 'noBreaks') { log('No Breaks challenge: ' + n(id) + ' keeps going.', 'story'); return; } return _hiatus(id, mo); };
const _ctrl = G.setCtrl;
G.setCtrl = (id, c) => { if (S().challenge === 'solo' && id !== S().focus && c === 'manual') return; return _ctrl(id, c); };
const _reset = G.monthReset;
G.monthReset = () => { _reset(); if (S().ngp) S().practice = 3; };
/* Fast-forward for what-if starts: every event resolves with its first choice and stats only. */
G.fastForward = to => {
  let guard = 0;
  while (S().month < to && !S().ended && guard++ < 4000) {
    while (S().queue.length && guard++ < 4000) { const ev = S().queue[0], v = G.view(ev); if (!v) { S().queue.shift(); continue; } ev.sceneSeen = true; G.choose(ev, 0, null); }
    if (S().month >= to) break;
    G.advance();
  }
  S().queue = S().queue.filter(e => e.kind !== 'archive');
  G.save();
};

/* ---------- Member arcs ---------- */
const ARCS = {
  sophia:{ t:'The leader\'s notebook', k:'ch', ch:[
    { set:'dorm', lines:id => [R(id, 'I keep a notebook. Every member\'s goals, written down the day we moved in.', 'sit'), R(id, 'When someone\'s having a bad week, I read hers back to her.', 'talk')], q:'Ask to see the notebook?', c:[['Ask', 'Bond +6'], ['Let her keep it private', 'Wellbeing +5']] },
    { set:'office', lines:id => [R(id, 'Can I not be the one who talks first at every interview? Just for a week.', 'talk'), R('MGR', 'Of course. Who wants to go first?')], q:'Who fronts the interviews this week?', c:[['Rotate through everyone', 'Cohesion +2'], ['The focus member takes it', 'Fan Favor +4 for the focus']] },
    { set:'dorm', lines:id => [R('N', 'The members leave a notebook on her pillow. Five pages, five handwriting styles.'), R(id, '...You wrote one for me.', 'cry')], q:'Her arc is complete.', c:[['Keep going', 'She trains 8% faster from now on']] } ] },
  lara:{ t:'Her own sound', k:'so', ch:[
    { set:'studio', lines:id => [R(id, 'I wrote something at 4 a.m. It\'s probably bad.', 'talk'), R('PROD', 'Play it.')], q:'How does the producer react?', c:[['Encourage her', 'Songwriting +3'], ['Give honest notes', 'Songwriting +4, Wellbeing −3']] },
    { set:'office', lines:id => [R(id, 'I want to pitch it for the album. Properly.', 'talk'), R('EXEC', 'Then pitch it.')], q:'Back her pitch?', c:[['Back it fully', 'Next release prep +10'], ['Suggest a co-writer', 'Bond +4']] },
    { set:'stage', lines:id => [R('N', 'Her song closes the encore. The crowd sings the bridge back to her.'), R(id, 'They know the words. They know MY words.', 'cry')], q:'Her arc is complete.', c:[['Keep going', 'She trains 8% faster from now on']] } ] },
  daniela:{ t:'Joy over perfect', k:'da', ch:[
    { set:'practice', lines:id => [R(id, 'Again. The left hand is a frame late.', 'talk'), R('J1', 'Nobody can see that.'), R(id, 'I can see it.')], q:'What do you tell her?', c:[['Perfect is the job', 'Dance +3'], ['It\'s okay to enjoy it', 'Wellbeing +8']] },
    { set:'practice', lines:id => [R('N', 'Midnight. The members drag her into a freestyle circle.'), R(id, 'I don\'t freestyle. I... okay, one round.', 'hips')], q:'Join the circle?', c:[['Everyone joins', 'Cohesion +3'], ['Film it for fans', 'Fans +2%']] },
    { set:'stage', lines:id => [R('N', 'The new break was choreographed by her. On stage, she\'s laughing through it.'), R(id, 'I forgot to count. I just danced.', 'cheer')], q:'Her arc is complete.', c:[['Keep going', 'She trains 8% faster from now on']] } ] },
  yoonchae:{ t:'Growing up on camera', k:'pe', ch:[
    { set:'dorm', lines:id => [R(id, 'Everyone still treats me like the baby.', 'talk'), R(id, 'I\'m going to cook dinner. For everyone. Tonight.', 'cheer')], q:'Dinner?', c:[['Everyone eats it, whatever it is', 'Bond +6'], ['Offer to help', 'Cohesion +2']] },
    { set:'van', lines:id => [R('N', 'Late drive back from a show. Someone asks her for advice, not the other way around.'), R(id, 'Me? You\'re asking me?', 'gasp')], q:'What happens?', c:[['She gives great advice', 'Charisma +3'], ['They laugh about it together', 'Wellbeing +6']] },
    { set:'stage', lines:id => [R('N', 'The maknae leads the fan chant on her own. Nobody had to ask.'), R(id, 'One, two, three!', 'cheer')], q:'Her arc is complete.', c:[['Keep going', 'She trains 8% faster from now on']] } ] },
  megan:{ t:'Trusting the crowd', k:'vo', ch:[
    { set:'backstage', lines:id => [R(id, 'The judges liked me. The crowd... I never know with the crowd.', 'talk')], q:'What do you say?', c:[['Look at the fan chants', 'Fan Favor +5'], ['Focus on the craft', 'Vocal +3']] },
    { set:'fansign', lines:id => [R('N', 'A fan has a sign: "YOU are why I started singing."'), R(id, 'Oh. Oh, no, I\'m going to cry.', 'cry')], q:'How does she respond?', c:[['Sing a line for her', 'Fans +2%'], ['A long hug', 'Wellbeing +8']] },
    { set:'stage', lines:id => [R('N', 'Fans voted on who sings the last line. They picked her, by a mile.'), R(id, 'I trust you now. Okay? I trust you.', 'cheer')], q:'Her arc is complete.', c:[['Keep going', 'She trains 8% faster from now on']] } ] },
  manon:{ t:'Style as language', k:'ch', ch:[
    { set:'makeup', lines:id => [R(id, 'Can I change the jacket? It says the wrong thing.', 'talk'), R('N', 'The stylist hands her the rack.')], q:'Let her restyle it?', c:[['Yes', 'Charisma +3'], ['Stick to the plan', 'Label pressure −5']] },
    { set:'mv', lines:id => [R(id, 'Every member gets one color. It tells you who they are before they sing.', 'talk')], q:'Use her styling for the shoot?', c:[['Use it', 'Next MV score +10'], ['Blend it with the label\'s', 'Bond +4']] },
    { set:'stage', lines:id => [R('N', 'Her concept board becomes the next era. Fans call it the best look yet.'), R(id, 'They get it. They get the language.', 'fairy')], q:'Her arc is complete.', c:[['Keep going', 'She trains 8% faster from now on']] } ] },
};
const GENERIC = { t:'A new chapter', k:'pe', ch:[
  { set:'dorm', lines:id => [R(id, 'Can we talk about what I want to do next? Not the group. Me.', 'sit')], q:'Listen?', c:[['Listen properly', 'Bond +6'], ['Promise to talk later', '']] },
  { set:'studio', lines:id => [R(id, 'I want to try something I\'m bad at.', 'talk')], q:'Support it?', c:[['Yes', 'Her weakest skill +4'], ['Stick to strengths', 'Her best skill +2']] },
  { set:'stage', lines:id => [R('N', 'Something she was bad at a year ago is now her favorite part of the show.'), R(id, 'Look at that.', 'cheer')], q:'Her arc is complete.', c:[['Keep going', 'She trains 8% faster from now on']] } ] };
function arcOf(id) { return ARCS[id] || GENERIC; }
function arcCheck(m) {
  const s = S(), rp = P(), f = s.focus; if (!G.debuted()) return;
  G.activeMembers().forEach(id => {
    const st = rp.arcs[id] || 0; if (st >= 3 || s.queue.some(e => e.kind === 'arc')) return;
    const ready = id === f ? m >= [40, 70, 100][st] : G.bond(f, id) >= [12, 22, 32][st] && m >= 36 + st * 8;
    if (ready && chance(.5)) q({ kind:'arc', id, st });
  });
}
const _cm = G.coachMult;
G.coachMult = (id, act) => (_cm ? _cm(id, act) : 1) * (S().rp && S().rp.arcs[id] >= 3 ? 1.08 : 1);

/* ---------- Bigger event pool ---------- */
const MINOR = [
  { t:'A fan letter', pre:true, x:'A handwritten letter for {x} from a fan who says her stages got them through a hard year.', c:[['She writes back', 'Fan Favor +4', s => fan(s.x, 4)], ['She keeps it in her bag', 'Wellbeing +6', s => wb(s.x, 6)]] },
  { t:'Airport fashion', x:'Photographers are waiting at the airport. {x} has thirty seconds to look like she slept.', c:[['Go full outfit', 'Fan Favor +3', s => fan(s.x, 3)], ['Comfy and honest', 'Wellbeing +4', s => wb(s.x, 4)]] },
  { t:'Rain stage', x:'An outdoor festival set in a downpour. The crew asks if the group wants to cancel.', c:[['Perform in the rain', 'Momentum +8, Wellbeing −4', s => { S().group.momentum = clamp(S().group.momentum + 8, 0, 100); G.activeMembers().forEach(i => wb(i, -4)); }], ['Cancel safely', 'Label pressure +4', s => { S().label = clamp(S().label + 4, 0, 100); }]] },
  { t:'A meme', x:'A five-second clip of {x} reacting to a dropped mic becomes the internet\'s favorite reaction image.', c:[['Lean into it', 'Fans +2%', s => grow(S().group.fans * .02)], ['Ignore it', '', s => {}]] },
  { t:'Birthday trend', x:'{x}\'s birthday trends worldwide. Fans buy a billboard.', c:[['Visit the billboard', 'Fan Favor +5', s => fan(s.x, 5)], ['A surprise livestream', 'Fans +1%', s => grow(S().group.fans * .01)]] },
  { t:'Studio mishap', pre:true, x:'Someone deletes a day of recordings. Nobody admits it was them.', c:[['Re-record tonight', 'Prep or skills up, Wellbeing −5', s => { S().group.prep = clamp(S().group.prep + 5, 0, 100); G.working().forEach(i => wb(i, -5)); }], ['Laugh it off', 'Cohesion +1', s => G.working().forEach(a => G.working().forEach(b => { if (a < b) G.addBond(a, b, 1); }))]] },
  { t:'Lost luggage', x:'The stage outfits went to the wrong city.', c:[['Perform in practice clothes', 'Momentum +4: fans love it', s => { S().group.momentum = clamp(S().group.momentum + 4, 0, 100); }], ['Buy new outfits', 'Costs $50K', s => { if (S().car) S().car.money -= 50000; }]] },
  { t:'Senior advice', pre:true, x:'A senior artist visits the practice room and offers {x} one piece of advice.', c:[['Ask about stage nerves', 'Performance +2', s => skill(s.x, 'pe', 2)], ['Ask about staying kind', 'Wellbeing +6', s => wb(s.x, 6)]] },
  { t:'Language lesson', pre:true, x:'{x} starts teaching the others a few words from home.', c:[['Everyone learns', 'Cohesion +2', s => G.working().forEach(a => G.working().forEach(b => { if (a < b) G.addBond(a, b, 1); }))], ['Film it for fans', 'Fan Favor +3', s => fan(s.x, 3)]] },
  { t:'Charity concert', x:'An invitation to a charity concert. No pay, a lot of goodwill.', c:[['Say yes', 'Fans +2%, Wellbeing −2', s => { grow(S().group.fans * .02); G.activeMembers().forEach(i => wb(i, -2)); }], ['Donate instead', 'Costs $100K', s => { if (S().car) S().car.money -= 100000; }]] },
  { t:'Practice video', x:'A practice video drops. {x} is perfectly in sync with the mirror.', c:[['Post the full version', 'Momentum +5', s => { S().group.momentum = clamp(S().group.momentum + 5, 0, 100); }], ['Post a funny outtake', 'Fan Favor +3', s => fan(s.x, 3)]] },
  { t:'Fan cafe milestone', x:'The fan cafe passes a huge membership milestone.', c:[['Handwritten thank-you posts', 'Fan Favor +2 for everyone', s => G.activeMembers().forEach(i => fan(i, 2))], ['A surprise mini-concert stream', 'Fans +1%', s => grow(S().group.fans * .01)]] },
  { t:'Encore challenge', x:'Fans start an "encore challenge": sing the encore without backing track.', c:[['Do it live', 'Vocal +2 for everyone', s => G.activeMembers().forEach(i => skill(i, 'vo', 2))], ['Do it as a comedy bit', 'Cohesion +1', s => G.activeMembers().forEach(a => G.activeMembers().forEach(b => { if (a < b) G.addBond(a, b, 1); }))]] },
  { t:'Weather delay', pre:true, x:'A storm cancels practice. The dorm is suddenly very quiet.', c:[['Board games', 'Cohesion +1', s => G.working().forEach(a => G.working().forEach(b => { if (a < b) G.addBond(a, b, 1); }))], ['Sleep', 'Wellbeing +4 for everyone', s => G.working().forEach(i => wb(i, 4))]] },
];

/* ---------- Seasonal events (real calendar) ---------- */
const SEASONS = { 12:['Holiday special', 'A holiday music special. Everyone in matching sweaters.'], 10:['Halloween stage', 'A costume stage for Halloween. The fans vote on the best costume.'],
  2:['Valentine\'s fan event', 'A Valentine\'s Day fan event with handwritten cards.'], 1:['New Year countdown', 'A New Year\'s Eve countdown show.'] };

/* ---------- Monthly scheduling ---------- */
const _sm = G.storyMonth;
G.storyMonth = m => {
  _sm(m);
  const s = S(), rp = P();
  arcCheck(m);
  // Anniversaries.
  const d0 = s.group.releases[0] ? s.group.releases[0].month : null;
  if (d0 && m > d0 && (m - d0) % 12 === 0 && !rp.anniv[m]) { rp.anniv[m] = 1; q({ kind:'anniv', y:(m - d0) / 12 }); }
  if (m === 140 && G.debuted()) q({ kind:'finalConcert' });
  // Minor events.
  if (m >= 4 && chance(.18)) { const pre = !G.debuted(), pool = MINOR.map((e, i) => i).filter(i => pre ? MINOR[i].pre : true); const pool2 = G.working(); if (pool.length && pool2.length) q({ kind:'minor', i:pick(pool), x:pick(pool2) }); }
  // Seasonal.
  const now = new Date(), key = now.getFullYear() + '-' + (now.getMonth() + 1);
  if (SEASONS[now.getMonth() + 1] && !rp.season[key] && m >= 4) { rp.season[key] = 1; q({ kind:'season', mo:now.getMonth() + 1 }); }
};

/* ---------- Photocards ---------- */
function card(id, label, rare) {
  const s = S(), rp = P(), r = s.group.releases[s.group.releases.length - 1];
  const era = r ? r.era : s.group.formed ? 'PRE-DEBUT' : 'TRAINEE';
  const key = id + ':' + era + ':' + label;
  if (rp.cards.some(c => c.key === key)) return null;
  const c = { key, id, era, label, m:s.month, rare:!!rare, concept:r ? r.concept : null };
  rp.cards.push(c); return c;
}
G.cards = () => P().cards;
const _adv = G.advance;
G.advance = () => {
  const s = S(); const rel0 = s ? s.group.releases.length : 0, wins0 = s ? (s.rec.showWins || 0) : 0;
  const Rr = _adv(); if (!Rr) return Rr;
  if (Rr.grades) Rr.grades.forEach(g => { if (g.g === 'A+' && g.id === s.focus) { const c = card(g.id, 'Eval A+', true); if (c) Rr.lines.push('New photocard: ' + n(g.id) + ', Eval A+ (rare).'); } });
  if ((s.rec.showWins || 0) > wins0) G.activeMembers().forEach(id => card(id, 'First place'));
  if (s.ended) upgradeEnding();
  return Rr;
};
const _mk = G.makeRelease;
G.makeRelease = (cid, debut) => { const r = _mk(cid, debut); G.activeMembers().forEach(id => card(id, debut ? 'Debut' : r.kind === 'EP' ? 'Concept photo' : 'Single cover')); return r; };

/* ---------- Event views and choices ---------- */
const _v3 = G.view3;
G.view3 = ev => {
  const s = S(), f = s.focus;
  switch (ev.kind) {
    case 'arc': { const id = ev.id; if (!G.inPlay(id)) return null; const A = arcOf(id), c = A.ch[ev.st];
      return { eyebrow:n(id) + ' · ' + A.t + ' · ' + (ev.st + 1) + ' of 3', title:A.t, text:c.q, scene:{ set:c.set, cast:[id].concat(c.set === 'office' ? ['MGR'] : []), lines:c.lines(id) }, choices:c.c }; }
    case 'anniv': return { eyebrow:'Anniversary', title:ev.y === 5 ? 'Five years' : 'Debut anniversary · year ' + ev.y, text:ev.y === 5 ? 'Five years since the debut. A special concert is planned.' : 'Another year since debut day. Fans flood the timeline.', set:'stage', mgCast:'group',
      scene:{ set:ev.y === 5 ? 'stage' : 'fansign', cast:G.activeMembers(), lines:[R('N', ev.y === 5 ? 'Five years. The first fans are in the front row, holding the original lightstick.' : 'Anniversary livestream. The chat moves too fast to read.'), R(f, ev.y === 5 ? 'We said we\'d still be here. We\'re still here.' : 'Thank you for another year. Seriously.', 'cry')] },
      choices:ev.y === 5 ? [['Play the anniversary concert', 'Live stage'], ['A quiet fan letter instead', 'Cohesion +3']] : [['Re-perform the debut song', 'Live stage'], ['A Q&A with fans', 'Fan Favor +3 for everyone']], games:['live', null] };
    case 'finalConcert': return { eyebrow:'The last tour', title:'The final concert of this story', text:'Month 140. One more concert before the cameras stop.', set:'stage', mgCast:'group',
      scene:{ set:'stage', cast:G.activeMembers(), lines:[R('N', 'Everyone who was ever part of this story is in the building.'), R(f, 'Twelve years ago, I sent in an audition tape.', 'talk'), R(f, 'Thank you for watching all of it.', 'cry')] },
      choices:[['Play it', 'Live stage'], ['Let the fans sing it', 'Cohesion +5']], games:['live', null] };
    case 'minor': { const e = MINOR[ev.i]; if (!G.inPlay(ev.x)) return null; return { eyebrow:'Moment', title:e.t, text:e.x.replace('{x}', n(ev.x)), choices:e.c.map(c => [c[0], c[1]]) }; }
    case 'season': { const z = SEASONS[ev.mo]; return { eyebrow:'Seasonal', title:z[0], text:z[1], set:'stage', mgCast:'group', choices:[['Perform', 'Live stage'], ['Just enjoy it', 'Wellbeing +5 for everyone']], games:['live', null] }; }
  }
  return _v3 ? _v3(ev) : null;
};
const _c3 = G.choose3;
G.choose3 = (ev, i, acc) => {
  const s = S(), f = s.focus, rp = P();
  switch (ev.kind) {
    case 'arc': { const id = ev.id, A = arcOf(id), k = A.k; rp.arcs[id] = ev.st + 1;
      if (ev.st === 2) { card(id, A.t, true); log(n(id) + '\'s arc "' + A.t + '" is complete.', 'story'); return n(id) + ' trains 8% faster from now on. A rare photocard joins the binder.'; }
      const fx = [[() => G.addBond(f, id, 6), () => wb(id, 5)], [() => G.activeMembers().forEach(a => G.activeMembers().forEach(b => { if (a < b) G.addBond(a, b, 1); })), () => fan(f, 4)]];
      if (ARCS[id]) { if (i === 0) skill(id, k, 3); else wb(id, 5); G.addBond(f, id, 3); } else (fx[ev.st] || fx[0])[i] && (fx[ev.st] || fx[0])[i]();
      return 'Chapter ' + (ev.st + 1) + ' of ' + n(id) + '\'s story.'; }
    case 'anniv': if (i === 1) { if (ev.y === 5) G.activeMembers().forEach(a => G.activeMembers().forEach(b => { if (a < b) G.addBond(a, b, 3); })); else G.activeMembers().forEach(id => fan(id, 3)); return 'A quiet, happy night.'; }
      { const sc = G.stageScore(G.activeMembers(), acc); grow(s.group.fans * (ev.y === 5 ? .05 : .02)); G.activeMembers().forEach(id => card(id, ev.y === 5 ? 'Five years' : 'Anniversary', ev.y === 5)); return 'Score ' + Math.round(sc) + '. ' + (ev.y === 5 ? 'Fans call it the best concert they\'ve played.' : 'The debut song, five members of the crowd crying.'); }
    case 'finalConcert': G.activeMembers().forEach(id => card(id, 'Final concert', true)); if (i === 1) { G.activeMembers().forEach(a => G.activeMembers().forEach(b => { if (a < b) G.addBond(a, b, 5); })); return 'Thirty thousand people sing every word.'; }
      { const sc = G.stageScore(G.activeMembers(), acc); return 'Score ' + Math.round(sc) + '. The lights come up. Nobody leaves.'; }
    case 'minor': { const e = MINOR[ev.i], c = e.c[i]; if (c) c[2](ev); return c && c[1] ? 'Done.' : ''; }
    case 'season': if (i === 1) { G.working().forEach(id => wb(id, 5)); return 'A night off, together.'; } { const sc = G.stageScore(G.debuted() ? G.activeMembers() : [f], acc); grow((s.group.fans || 0) * .01); G.working().forEach(id => card(id, SEASONS[ev.mo][0])); return 'Score ' + Math.round(sc) + '. Fans clip every second.'; }
  }
  return _c3 ? _c3(ev, i, acc) : '';
};

/* ---------- Daily challenge ---------- */
G.daily = () => {
  const d = new Date().toISOString().slice(0, 10), seed = d.split('-').reduce((a, b) => a * 31 + +b, 7);
  const kinds = ['vocal', 'dance', 'rap', 'stage', 'write', 'fans', 'live'], kind = kinds[seed % kinds.length], target = [.75, .8, .85][seed % 3];
  const pr = G.profile(); let streak = 0; for (let i = 0; i < 60; i++) { const dd = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); if (pr.daily[dd] && pr.daily[dd].done) streak++; else if (i) break; }
  return { date:d, kind, target, best:pr.daily[d] ? pr.daily[d].best : null, done:!!(pr.daily[d] && pr.daily[d].done), streak };
};
G.dailyResult = acc => { const d = G.daily(), pr = G.profile(); const cur = pr.daily[d.date] || { best:0, done:false }; if (acc != null) { cur.best = Math.max(cur.best, acc); if (acc >= d.target) cur.done = true; } pr.daily[d.date] = cur; G.saveProfile(pr); return cur; };
})();
