/* Dream Academy: Story Mode. Batch 2: training and survival show depth.
   Skill tiers, coach favor and private lessons, injuries, a nemesis arc, eval variety,
   the vote meter and your edit, interviews, fan campaigns, benefit votes, rank history. */
(function () {
const D = window.DA, G = window.G;
const { q, log, feed, chance, pick, clamp, r1 } = G._;
const S = () => G.S();
const n = id => G.name(id);
const M = () => { const s = S(); s.mem = s.mem || {}; const m = s.mem; m.helped = m.helped || {}; m.promised = m.promised || {}; m.moments = m.moments || []; m.seen = m.seen || {}; return m; };
const X = () => { const m = M(); m.x = m.x || { favor:{ J0:0, J1:0, J2:0 }, priv:{}, edit:0, evalPicks:[], rankHist:[], nemesis:null, nemesisDone:false }; return m.x; };
const R = (who, t, mv) => [who, t, mv];
const wb = (id, d) => { const p = G.p(id); p.wb = clamp(p.wb + d, 5, 100); };
const fan = (id, d) => { const p = G.p(id); p.fan = clamp(p.fan + d, 0, 100); };
const isTrainee = () => G.p(S().focus).status === 'trainee';
const COACH_OF = { vo:'J0', da:'J1', ra:'J2', pe:'J2', so:'J2', ch:'J2' };
D.npcs.PHYS = { name:'Physio Ana', role:'Physical therapist', look:{ skin:'#c99a74', hair:'#2a1a12', style:'bun' }, outfit:'#e8e8e8' };
D.npcs.PD = { name:'Show producer', role:'Interviewer', look:{ skin:'#efd2b8', hair:'#1d130d', style:'pony' }, outfit:'#30343c' };

/* ---------- Skill tiers ---------- */
G.tier = (id, k) => { const v = G.p(id).sk[k]; return v >= 80 ? 3 : v >= 60 ? 2 : v >= 40 ? 1 : 0; };
G.TIER = ['Basics', 'Tier I', 'Tier II', 'Tier III'];
const _tr = G.trainResult;
G.trainResult = (id, acc) => {
  const r = _tr(id, acc); if (r == null) return r;
  const k = G.planOf(id), t = G.tier(id, k), s = S();
  s.session[id].mult = r1((.8 + acc * (.9 + t * .1)) * 100) / 100;
  return s.session[id].mult;
};

/* ---------- Coach favor, private lessons, eval variety ---------- */
const _c2 = G.choose2;
G.choose2 = (ev, i, acc) => {
  if (ev.kind === 'evalDay' && i < D.skills.length && acc != null) {
    const x = X(), k = D.skills[i].k, last = x.evalPicks.slice(-2);
    let note = '';
    if (last.length === 2 && last.every(p => p === k)) { acc = acc * .9; note = '\nDirector Hale: "' + D.skills[i].l + ' again? Show us something else next month."'; }
    else if (x.evalPicks.length >= 3 && new Set(x.evalPicks.slice(-3).concat([k])).size === 4) { acc = Math.min(1, acc * 1.04); note = '\nDirector Hale: "I like that you keep surprising us."'; }
    x.evalPicks.push(k); if (x.evalPicks.length > 8) x.evalPicks.shift();
    const c = COACH_OF[k]; x.favor[c] = clamp(x.favor[c] + acc * 12, 0, 100);
    if (x.favor[c] >= 30 && !x.priv[c] && !S().queue.some(e => e.kind === 'privateLesson')) q({ kind:'privateLesson', c, k });
    return _c2(ev, i, acc) + note;
  }
  return _c2(ev, i, acc);
};
const _cm = G.coachMult;
G.coachMult = (id, act) => {
  let m = _cm ? _cm(id, act) : 1;
  const x = X(); if (id === S().focus && x.priv[COACH_OF[act]] && (COACH_OF[act] !== 'J2' || x.priv.J2 === act)) m *= 1.1;
  return m;
};

/* ---------- Injuries ---------- */
const _plan = G.planOf;
G.planOf = id => { const p = G.p(id), a = _plan(id); return p.injury > 0 && (a === 'da' || a === 'pe') ? 'rest' : a; };

/* ---------- Monthly wrapper: injuries, tier unlocks, rank history ---------- */
const _adv = G.advance;
G.advance = () => {
  const s = S(); if (!s || s.ended || G.blocking()) return _adv();
  const f = s.focus, before = {}; D.skills.forEach(({ k }) => { before[k] = G.inPlay(f) ? G.tier(f, k) : 0; });
  const risky = G.working().filter(id => { const p = G.p(id), a = G.planOf(id); return !p.injury && (a === 'da' || a === 'pe') && p.wb < 42 && chance(.06 * (s.diff === 'hard' ? 1.4 : s.diff === 'easy' ? .6 : 1)); });
  const Rr = _adv(); if (!Rr) return Rr;
  G.cast().forEach(id => { const p = G.p(id); if (p.injury > 0) { p.injury--; if (!p.injury) { log(n(id) + ' is cleared to dance again.', 'story'); Rr.lines.push(n(id) + ' is cleared to dance again.'); } } });
  risky.forEach(id => { const p = G.p(id); if (G.inPlay(id) && !p.injury) { p.injury = 2; log(n(id) + ' hurts her ankle in practice.', 'story'); Rr.lines.push(n(id) + ' is injured: no dance or stage work for two months.'); if (id === f || s.ctrl[id] === 'manual' || s.settings.askAll) q({ kind:'injury', id }); } });
  if (G.inPlay(f)) D.skills.forEach(({ k, l }) => { const t = G.tier(f, k); if (t > before[k]) { Rr.lines.push(l + ' ' + G.TIER[t] + ' unlocked: harder lessons, bigger gains (up to ×' + (1.7 + t * .1).toFixed(1) + ').'); log(n(f) + ' unlocks ' + l + ' ' + G.TIER[t] + '.', 'eval'); } });
  if (Rr.grades && Rr.grades.length) { const r = Rr.grades.findIndex(g => g.id === f); if (r >= 0) X().rankHist.push({ m:Rr.m, r:r + 1, of:Rr.grades.length }); }
  return Rr;
};

/* ---------- New events ---------- */
const _sm = G.storyMonth;
G.storyMonth = mo => {
  _sm(mo);
  const s = S(), f = s.focus, x = X();
  if (mo === 6 && isTrainee() && !x.nemesis) {
    const pool = G.trainees().filter(id => id !== f).sort((a, b) => Math.abs(G.avg(a) - G.avg(f)) - Math.abs(G.avg(b) - G.avg(f)));
    if (pool[0]) { x.nemesis = pool[0]; q({ kind:'nemesisMeet' }); }
  }
  if (x.nemesis && !x.nemesisDone && isTrainee() && G.inPlay(x.nemesis) && [10, 14].includes(mo)) q({ kind:'nemesisClash' });
  if (x.nemesis && !x.nemesisDone && G.inPlay(x.nemesis) && G.inPlay(f) && (mo === 17 || (mo > 10 && G.bond(f, x.nemesis) >= 18))) { x.nemesisDone = true; q({ kind:'nemesisTurn' }); }
  if ((mo === 19 || mo === 20) && isTrainee()) q({ kind:'interview', n:mo - 18 });
  if (mo === 20 && isTrainee()) q({ kind:'pickMe' });
  if (mo === 20 && isTrainee()) { const i = s.queue.findIndex(e => e.kind === 'ceremony'); if (i >= 0) s.queue.splice(i, 0, { kind:'benefit' }); }
};

const _v3 = G.view3;
G.view3 = ev => {
  const s = S(), f = s.focus, F = n(f), x = X();
  switch (ev.kind) {
    case 'privateLesson': { const c = ev.c, k = ev.k, L = D.skills.find(z => z.k === k).l;
      return { eyebrow:'Coach favor', title:D.npcs[c].name + ' has an offer', text:'Private lessons, once a week, for as long as ' + F + ' keeps showing up.',
        scene:{ set:'practice', cast:[c, f], lines:[R(c, 'I\'ve been watching your ' + L.toLowerCase() + ' evals. You\'re one of the few who actually listens.'),
          R(c, 'I don\'t do this often. Private lessons, Sunday mornings. If you want them.'), R(f, 'Sunday... mornings.', 'talk'), R(c, 'Before the others wake up. That\'s the point.')] },
        choices:[['Accept', L + ' trains 10% faster for the rest of the run'], ['Politely decline', 'Wellbeing +6: she keeps her Sundays']] }; }
    case 'injury': { const id = ev.id; if (!G.inPlay(id)) return null;
      return { eyebrow:'Injury', title:n(id) + ' is hurt', text:'An ankle sprain from overtraining. How does she recover?',
        scene:{ set:'office', cast:['PHYS', id], lines:[R('PHYS', 'It\'s a sprain. Not serious, if you let it be not serious.'), R(id, 'The eval is in two weeks.', 'cry'), R('PHYS', 'Then you have a choice to make, and I\'d like you to make the boring one.')] },
        choices:[['Rest completely', 'Heals in one month; Wellbeing +10'], ['Light training only', 'Two months; vocal and writing still allowed'], ['Push through', 'Back now, but a 40% chance it gets worse']] }; }
    case 'nemesisMeet': { const e = x.nemesis;
      return { eyebrow:'Academy · A rival', title:'Meet ' + n(e), text:n(e) + ' has landed within a point of ' + F + ' in every eval so far. Somebody noticed.',
        scene:{ set:'practice', cast:[f, e], lines:[R('N', 'The eval sheets go up. ' + F + ' and ' + n(e) + ' are next to each other again.'), R(e, 'Again? We have to stop doing this.', 'talk'), R(f, 'You could just score lower.'), R(e, 'You first.', 'clap')] },
        choices:[['Take it as a challenge', 'When she outranks ' + F + ', training ×1.08 the next month'], ['Ask to train together', 'Bond +8; the rivalry may turn into a friendship sooner']] }; }
    case 'nemesisClash': { const e = x.nemesis, b = s.lastBoard || [], re = b.findIndex(r => r.id === e), rf = b.findIndex(r => r.id === f);
      const ahead = re >= 0 && rf >= 0 && re < rf;
      return { eyebrow:'Academy · Rivalry', title:ahead ? n(e) + ' pulls ahead' : F + ' pulls ahead', text:ahead ? n(e) + ' ranked above ' + F + ' this month.' : F + ' ranked above ' + n(e) + ' this month.',
        scene:{ set:'practice', cast:[ahead ? e : f, ahead ? f : e], lines:[R(ahead ? e : f, 'Rank ' + ((ahead ? re : rf) + 1) + '. Not that I\'m counting.', 'cheer'), R(ahead ? f : e, 'You\'re counting.'), R(ahead ? e : f, 'I\'m absolutely counting.', 'clap')] },
        choices:[['Trash talk (friendly)', 'Bond +3, Stage +1'], ['Ask what she did differently', 'Training ×1.08 next month'], ['Ignore it', 'Wellbeing +3']] }; }
    case 'nemesisTurn': { const e = x.nemesis;
      return { eyebrow:'Payoff · A rival', title:'Rivals, then friends', text:'The rivalry between ' + F + ' and ' + n(e) + ' has turned into something else.',
        scene:{ set:'dorm', cast:[f, e], lines:[R('N', 'Late. Everyone else asleep. ' + n(e) + ' knocks on the door frame.'), R(e, 'Can I say something weird? You\'re the reason I got better.', 'sit'), R(f, 'That\'s not weird. Same.', 'talk'), R(e, 'So we\'re friends now. Officially.', 'hug')] },
        choices:[['Officially', 'Bond +15 with ' + n(e)]] }; }
    case 'interview': {
      const riv = x.nemesis && G.inPlay(x.nemesis) ? x.nemesis : (G.trainees().filter(id => id !== f)[0]);
      ev.riv = riv;
      return { eyebrow:'Survival Show · Interview', title:'The interview room', text:'One camera, one producer, one question about ' + n(riv) + '.',
        scene:{ set:'office', cast:['PD', f], lines:[R('PD', 'Just talk naturally. Forget the camera is there.'), R('N', 'Nobody has ever forgotten the camera is there.'), R('PD', 'So. ' + n(riv) + '. Do you think she deserves her rank?')] },
        choices:[['Be completely honest', 'Fans love candor, but it might be clipped out of context'], ['Be diplomatic', 'Safe'], ['Make a joke', 'Fan Favor up if it lands']] }; }
    case 'pickMe': return { eyebrow:'Survival Show · Fan campaign', title:'Campaign for votes', text:'Every trainee gets one fan campaign before the vote. What does ' + F + ' make?', mgCast:'focus',
      scene:{ set:'practice', cast:[f], lines:[R('N', 'One phone, one tripod, one chance to ask strangers on the internet to care.'), R(f, 'Hi! It\'s ' + F + '. Okay, I\'m going to start over.', 'wave')] },
      choices:[['A dance challenge', 'Play Mirror the Choreo'], ['A heartfelt letter video', 'Fan Favor +5, a better edit'], ['A fancam compilation', 'Based on her Performance']], games:['dance', null, null] };
    case 'benefit': { const pool = G.trainees().filter(id => id !== f).sort((a, b) => G.bond(f, b) - G.bond(f, a)).slice(0, 4); ev.opts = pool;
      return { eyebrow:'Survival Show · Benefit votes', title:'Benefit votes', text:'The team battle winners hand out 1,000 benefit votes each. ' + F + ' has hers. Who gets them?',
        choices:pool.map(id => [n(id), 'Her Fan Favor +4, bond +6']) }; }
  }
  return _v3 ? _v3(ev) : null;
};
/* Edit: how the show portrays her. Choices move it between villain (−) and hero (+). */
const EDIT = { rehearsal:[2, 0, -2], ceremony:[1, 1, 0], parts:[-1, 1, 1], helpWarned:[2, 0, -1], rankBoard:[0, 1, 0], interview:[0, 1, 0], pickMe:[0, 1, 0], benefit:[1, 1, 1, 1] };
const _c3 = G.choose3;
G.choose3 = (ev, i, acc) => {
  const s = S(), f = s.focus, F = n(f), x = X();
  if (EDIT[ev.kind] && s.month >= 18 && s.month <= 21) x.edit = clamp(x.edit + (EDIT[ev.kind][i] || 0), -6, 6);
  switch (ev.kind) {
    case 'privateLesson': if (i === 0) { x.priv[ev.c] = ev.c === 'J2' ? ev.k : true; log(F + ' starts private lessons with ' + D.npcs[ev.c].name + '.', 'story'); return 'Sunday, 7 a.m. She is there at 6:50.'; }
      x.priv[ev.c] = 'declined'; wb(f, 6); return 'The coach nods. "The offer stands."';
    case 'injury': { const p = G.p(ev.id); if (i === 0) { p.injury = 1; wb(ev.id, 10); return 'Ice, rest and a lot of television.'; }
      if (i === 1) return 'Vocal and writing only for two months.'; if (chance(.4)) { p.injury = 3; wb(ev.id, -8); return 'It gets worse. Three months out now.'; } p.injury = 0; return 'She pushes through. It holds, this time.'; }
    case 'nemesisMeet': if (i === 1) { G.addBond(f, x.nemesis, 8); return 'Practice partners, reluctantly.'; } x.challenge = true; return 'Game on.';
    case 'nemesisClash': if (i === 0) { G.addBond(f, x.nemesis, 3); G.p(f).sk.pe = r1(G.p(f).sk.pe + 1); return 'They bicker all the way to dinner.'; }
      if (i === 1) { s.session[f] = { mult:1.08, acc:.6, act:G.planOf(f) }; return 'She takes notes. Annoyingly good notes.'; } wb(f, 3); return 'She lets it go.';
    case 'nemesisTurn': G.addBond(f, x.nemesis, 15); M().moments.push({ m:s.month, t:F + ' and ' + n(x.nemesis) + ' going from rivals to friends' }); return 'Rivals, then friends.';
    case 'interview': if (i === 0) { if (chance(.4)) { fan(f, -4); x.edit = clamp(x.edit - 2, -6, 6); feed('@groupchatleaks', 'Did you see what ' + F + ' said about ' + n(ev.riv) + '?? (the full clip is way nicer btw)', -1); return 'The episode cuts it down to five seconds. It sounds a lot meaner than it was.'; } fan(f, 5); return 'The honest answer airs in full. Fans love her for it.'; }
      if (i === 1) return 'A perfect, forgettable answer.';
      if (chance(.6)) { fan(f, 4); return 'The joke lands. It becomes the episode\'s meme.'; } return 'Silence. The producer moves on.';
    case 'pickMe': { if (i === 0) { const a = acc == null ? .5 : acc; fan(f, a * 10); return 'The challenge gets ' + Math.round(a * 900) + 'K views.'; }
      if (i === 1) { fan(f, 5); return 'Fans cry in the comments. In a good way.'; } fan(f, G.p(f).sk.pe / 15); return 'The fancam compilation does numbers.'; }
    case 'benefit': { const id = ev.opts && ev.opts[i]; if (!id) return ''; fan(id, 4); G.addBond(f, id, 6); return n(id) + ' finds out on camera and covers her face.'; }
  }
  const out = _c3 ? _c3(ev, i, acc) : '';
  // Rival motivation after evals is applied at the start of the next month.
  return out;
};
/* While the show airs, her edit moves her votes. */
const _adv2 = G.advance;
G.advance = () => { const s = S(); const r = _adv2(); if (r && s && s.month >= 19 && s.month <= 22 && G.p(s.focus).status === 'trainee') { const e = X().edit; fan(s.focus, e * .5); }
  if (r && s && X().challenge && X().nemesis && s.lastBoard) { const b = s.lastBoard, re = b.findIndex(z => z.id === X().nemesis), rf = b.findIndex(z => z.id === s.focus); if (re >= 0 && rf >= 0 && re < rf && !s.session[s.focus]) s.session[s.focus] = { mult:1.08, acc:.6, act:G.planOf(s.focus) }; }
  return r; };

/* ---------- Data for the UI ---------- */
G.voteMeter = () => G.trainees().map(id => ({ id, v:G.p(id).fan })).sort((a, b) => b.v - a.v);
G.editLabel = () => { const e = X().edit; return e >= 3 ? 'Hero edit' : e <= -3 ? 'Villain edit' : e >= 1 ? 'Good edit' : e <= -1 ? 'Rough edit' : 'Neutral edit'; };
G.rankHist = () => X().rankHist;
G.coachFavor = () => X().favor;
})();
