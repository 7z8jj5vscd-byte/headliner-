/* Dream Academy: Story Mode. Story events with 3D scenes: Academy, survival show episodes,
   the debut countdown, and payoffs that remember earlier choices.
   A scene is { set, cast:[keys], lines:[[who, text, move?]] }. who is a cast key, or 'N' for narration.
   Dialogue is invented and stays in the style of the show; it never invents scandals or crises. */
(function () {
const D = window.DA, G = window.G;
const { q, feed, log, grow, chance, rnd, pick, clamp, r1 } = G._;
const S = () => G.S();
const n = id => G.name(id);
const M = () => { const s = S(); s.mem = s.mem || { helped:{}, promised:{}, gifts:{}, moments:[], goal:null, danger:0, seen:{} }; return s.mem; };
const moment = t => { const m = M(); m.moments.push({ m:S().month, t }); if (m.moments.length > 40) m.moments.shift(); };
const fill = (t, x) => t.replace(/\{(\w+)\}/g, (_, k) => x[k] != null ? x[k] : '{' + k + '}');

/* ---------- People who are not members ---------- */
D.npcs = {
  J0:{ name:'Coach Rina', role:'Vocal coach' }, J1:{ name:'Coach Marco', role:'Dance coach' }, J2:{ name:'Director Hale', role:'Creative director' },
  HOST:{ name:'Show host', look:{ skin:'#c99a74', hair:'#111111', style:'bob' }, outfit:'#0f0f12' },
  MGR:{ name:'Manager Dana', look:{ skin:'#e4bf9c', hair:'#3a2618', style:'pony' }, outfit:'#2a3b5c' },
  EXEC:{ name:'Label executive', look:{ skin:'#d8ad88', hair:'#555555', style:'bob' }, outfit:'#1b1b1b' },
  PROD:{ name:'Producer Theo', look:{ skin:'#7c5238', hair:'#111111', style:'curly' }, outfit:'#3a2f2a' },
};
D.judges.forEach((j, i) => { Object.assign(D.npcs['J' + i], { look:j.look, outfit:j.outfit }); });
G.speaker = k => k === 'N' ? '' : D.npcs[k] ? D.npcs[k].name : G.CAST[k] ? G.name(k) : k;

/* ---------- Helpers ---------- */
const trainees = () => G.trainees();
const focusIn = () => { const s = S(); return G.inPlay(s.focus) && !G.p(s.focus).hiatus; };
const isTrainee = () => G.p(S().focus).status === 'trainee';
const isMember = () => G.p(S().focus).status === 'member';
const others = () => (G.debuted() ? G.activeMembers() : trainees()).filter(id => id !== S().focus);
const byBond = (ids, hi) => ids.slice().sort((a, b) => hi ? G.bond(S().focus, b) - G.bond(S().focus, a) : G.bond(S().focus, a) - G.bond(S().focus, b));
const topSkill = id => { const k = G.p(id).sk; return D.skills.slice().sort((a, b) => k[b.k] - k[a.k])[0]; };
const lowSkill = id => { const k = G.p(id).sk; return D.skills.slice().sort((a, b) => k[a.k] - k[b.k])[0]; };
const wb = (id, d) => { const p = G.p(id); p.wb = clamp(p.wb + d, 5, 100); };
const fan = (id, d) => { const p = G.p(id); p.fan = clamp(p.fan + d, 0, 100); };
const once = k => { const m = M(); if (m.seen[k]) return false; m.seen[k] = S().month; return true; };
function insertBefore(kind, ev) { const s = S(), i = s.queue.findIndex(e => e.kind === kind); if (i < 0) s.queue.push(ev); else s.queue.splice(i, 0, ev); }

/* ---------- Monthly scheduling ---------- */
G.storyMonth = m => {
  const s = S(), f = s.focus;
  M();
  if (m === 4 && isTrainee()) q({ kind:'orientation' });
  if ([6, 9, 12, 15].includes(m) && isTrainee()) q({ kind:'rankBoard' });
  if ((m === 8 || m === 16) && focusIn()) q({ kind:'oneOnOne' });
  if (m === 7 && focusIn()) q({ kind:'homesick' });
  if (m === 11 && isTrainee()) q({ kind:'midterm' });
  if (m === 14 && focusIn() && !G.debuted()) q({ kind:'holiday' });
  if (m === 18 && isTrainee()) q({ kind:'camerasArrive' });
  if (m >= 5 && m <= 18 && isTrainee() && G.p(f).warn && m - (M().dangerAt || 0) >= 3) { M().dangerAt = m; M().danger++; q({ kind:'danger' }); }
  if (m >= 5 && m <= 18 && M().danger && !G.p(f).warn && !M().recovered && m - (M().dangerAt || 0) >= 1 && m - (M().dangerAt || 0) <= 4) { M().recovered = true; q({ kind:'recovered' }); }
  if (m >= 5 && m <= 18 && isTrainee() && chance(.35)) { const w = trainees().filter(id => id !== f && G.p(id).warn && !M().helped[id]); if (w.length) q({ kind:'helpWarned', x:pick(w) }); }
  if (m >= 19 && m <= 21) survival(m);
  if (m === 22 && isMember()) q({ kind:'dormMove' });
  if (m === 26 && G.debuted()) q({ kind:'recording' });
  if (m === 27 && G.debuted()) q({ kind:'choreoCamp' });
  if (m === 28 && G.debuted()) q({ kind:'teaser' });
  if (m === 29 && G.debuted()) q({ kind:'jacket' });
  if (m === 30 && G.debuted()) q({ kind:'countdown' });
  if (m === 31 && G.debuted()) q({ kind:'dressRehearsal' });
  if (m === 32 && G.debuted()) { insertBefore('release', { kind:'midnight' }); const r = () => s.group.releases[0]; q({ kind:'firstShow' }); void r; }
  if (m === 33 && G.debuted() && s.group.releases.length) q({ kind:'debutRecap' });
  if (m === 34 && G.debuted() && s.group.doc) q({ kind:'docPremiere' });
  goalCheck();
  promiseCheck(m);
};
G.survivalMonth = m => survival(m);
G.preMission = (acc, i) => { const s = S(); if (s.ms && s.ms.killing && s.ms.n === s.month - 18) s.ms.part = acc == null || i !== 0 ? 1 : acc >= .7 ? 8 : -4; };
function survival(m) {
  const s = S(), n0 = m - 18;
  if (m === 20 && s.mode === 'real' && G.inPlay('lexie')) q({ kind:'withdraw' });
  if (isTrainee()) { q({ kind:'teamForm', n:n0 }); q({ kind:'songPick', n:n0 }); q({ kind:'parts', n:n0 }); q({ kind:'rehearsal', n:n0 }); }
  else s.ms = null;
  q({ kind:'mission', n:n0 });
  q({ kind:'ceremony', n:n0 });
  if (m === 21) { q({ kind:'finaleEve' }); q({ kind:'finale' }); q({ kind:'voteReveal' }); }
}

/* ---------- Mission bonuses ---------- */
G.msBonus = id => {
  const s = S(), ms = s.ms; if (!ms || ms.n !== s.month - 18) return 0;
  if (id === s.focus) return (ms.fit || 0) + (ms.part || 0) + (ms.reh || 0) + (s.month === 21 ? (M().finalePrep || 0) : 0);
  return ms.team && ms.team.includes(id) ? (ms.fit || 0) * .6 + (ms.teamReh || 0) : 0;
};
G.coachMult = (id, act) => { const c = M().coach; return c && id === S().focus && c.k === act && S().month <= c.until ? 1.15 : 1; };

/* ---------- Scenes and choices ---------- */
const MISSIONS = {
  1:{ t:'Position battle', d:'Trainees split by position. Each team performs one stage and everyone is ranked inside it.',
      songs:[['"Paper Hearts"', 'vo', 'A soaring vocal ballad'], ['"Static Bite"', 'da', 'A hard-hitting dance track'], ['"Loud Enough"', 'ra', 'A rap-led anthem']] },
  2:{ t:'Team battle: concept', d:'Two teams take on the same concept. The winning team gets bonus votes.',
      songs:[['"Sugar Rush Hour"', 'ch', 'Bright, cute, high-energy'], ['"Midnight Glass"', 'pe', 'Dark, sleek, cinematic'], ['"Wild Weather"', 'da', 'Chaotic, athletic, loud']] },
  3:{ t:'Original song mission', d:'New songs written for the show. The stages are filmed as music videos.',
      songs:[['"First Light"', 'vo', 'A hopeful debut-style pop song'], ['"Run It Back"', 'da', 'A dance-pop banger'], ['"Six Names"', 'so', 'A song about the finale itself']] },
};
const R = (who, t, mv) => [who, t, mv];

G.view3 = ev => {
  const s = S(), f = s.focus, F = n(f);
  switch (ev.kind) {
    /* ===== Academy ===== */
    case 'orientation': {
      const a = ev.a || (ev.a = byBond(trainees().filter(x => x !== f), true)[0]);
      return { eyebrow:'Academy · Day one', title:'Orientation', text:'What does ' + F + ' want most from the academy? The game will remember.',
        scene:{ set:'practice', cast:['J0','J1','J2', f, a], lines:[
          R('J2', 'Welcome to the academy. Out of more than a hundred and twenty thousand auditions, there are twenty of you.'),
          R('J0', 'Every month you stand in front of us, and every month you get a grade, from D to A plus.'),
          R('J1', 'The grade is not about talent. It is about growth. Show us that you are growing.'),
          R('J2', 'In about a year and a half the cameras arrive. After that, six of you will debut.'),
          R('N', F + ' looks down the line at nineteen strangers.'),
          R(a, 'Hi. I\'m ' + n(a) + '. Want to be practice partners?', 'wave'),
          R(f, 'Yes. Definitely yes.', 'clap'),
        ] },
        choices:[['Become the center', 'Payoff if she is ever named center'], ['Earn an A+', 'Payoff on her first A+'], ['Make real friends here', 'Payoff when she has three close bonds'], ['Just debut', 'Payoff if she debuts']] };
    }
    case 'rankBoard': {
      const b = s.lastBoard || [], top = b.slice(0, 3), me = b.findIndex(r => r.id === f), warn = b.filter(r => G.p(r.id).warn).map(r => r.id);
      const fw = G.p(f).warn;
      const cast = ['J2'].concat(top.map(r => r.id)).concat(top.some(r => r.id === f) ? [] : [f]).slice(0, 5);
      return { eyebrow:'Academy · Month ' + s.month, title:'The ranking board', text:fw ? F + ' is on warning. How does she take it?' : 'How does ' + F + ' react?',
        scene:{ set:'practice', cast, lines:[
          R('J2', 'The board is up. Some of you will like it. Some of you will not.'),
          top[0] ? R('J2', 'First place: ' + n(top[0].id) + '. Second: ' + (top[1] ? n(top[1].id) : '—') + '. Third: ' + (top[2] ? n(top[2].id) : '—') + '.') : R('J2', 'Rankings will come.'),
          top[0] ? R(top[0].id, 'I didn\'t expect that. Thank you.', 'cheer') : R('N', '...'),
          me >= 0 ? R('J2', F + ': rank ' + (me + 1) + ' of ' + b.length + '.') : R('N', ''),
          fw ? R(f, '(quietly) Bottom three. Okay. Okay.', 'cry') : me < 3 ? R(f, 'I\'m going to stay up there.', 'cheer') : R(f, 'I can climb from here.'),
          warn.length ? R('J2', 'On warning: ' + warn.map(n).join(', ') + '. Warnings are not cuts. Not yet.') : R('N', ''),
        ].filter(l => l[1]) },
        choices:fw ? [['Ask for extra night lessons', 'Training ×1.25 next month, Wellbeing −8'], ['Study the top trainees\' videos', 'Training ×1.1 next month'], ['Cry it out, then reset', 'Wellbeing +10']]
          : [['Study the top trainees\' videos', 'Training ×1.1 next month'], ['Help someone on warning', 'Bond with a struggling trainee'], ['Stay in her lane', 'Wellbeing +5']] };
    }
    case 'oneOnOne': {
      const hi = topSkill(f), lo = lowSkill(f), coach = lo.k === 'vo' ? 'J0' : lo.k === 'da' ? 'J1' : 'J2';
      ev.lo = lo.k; ev.hi = hi.k;
      return { eyebrow:'Coach one-on-one', title:D.npcs[coach].name, text:'What does ' + F + ' focus on for the next three months?',
        scene:{ set:'office', cast:[coach, f], lines:[
          R(coach, 'Sit down. This isn\'t a punishment. I do this with everyone.'),
          R(coach, 'Your ' + hi.l.toLowerCase() + ' is your strongest skill: ' + Math.round(G.p(f).sk[hi.k]) + '. People notice it.'),
          R(coach, 'Your ' + lo.l.toLowerCase() + ' is ' + Math.round(G.p(f).sk[lo.k]) + '. That is where the cameras will find a gap.'),
          R(f, 'I know. I can feel it in every eval.'),
          R(coach, 'So. What do you want to do about it?'),
        ] },
        choices:[['Fix the ' + lo.l.toLowerCase(), lo.l + ' trains 15% faster for 3 months'], ['Double down on ' + hi.l.toLowerCase(), hi.l + ' trains 15% faster for 3 months'], ['Ask how to handle the pressure', 'Wellbeing +12']] };
    }
    case 'homesick': {
      return { eyebrow:'Academy · Dorm', title:'Homesick', text:'It is 2 a.m. in the dorm, and ' + F + ' is far from ' + G.CAST[f].from + '.',
        scene:{ set:'dorm', cast:[f], lines:[
          R('N', 'Everyone else is asleep. ' + F + ' is sitting on the floor with her phone.'),
          R(f, 'It\'s the middle of the afternoon at home right now.', 'sit'),
          R(f, 'I keep thinking I should call. And then I think if I hear their voices, I\'ll want to go home.', 'cry'),
        ] },
        choices:[['Call home', 'Wellbeing +12'], ['Write a song about it', 'Songwriting +3; it may come back later'], ['Keep it to herself', 'Wellbeing −3, Stage +1']] };
    }
    case 'midterm': {
      return { eyebrow:'Academy · Month 11', title:'Mid-term showcase', text:'A closed showcase for the label. Five trainees per stage, and executives in the front row.',
        scene:{ set:'stage', cast:['EXEC', f].concat(byBond(trainees().filter(x => x !== f), true).slice(0, 3)), lines:[
          R('EXEC', 'We\'re not grading today. We\'re looking. There is a difference.'),
          R('N', 'Backstage, ' + F + '\'s hands are shaking.'),
          R(f, 'Okay. Same as practice. Same as practice.'),
        ] }, set:'stage', mgCast:'group',
        choices:[['Perform', 'Live stage'], ['Play it safe', 'Stats only']], games:['live', null] };
    }
    case 'holiday': {
      const pool = byBond(others(), false).slice(0, 4); ev.opts = pool;
      return { eyebrow:'Academy · Holidays', title:'Holiday party', text:'Secret gift exchange. Who does ' + F + ' draw?',
        scene:{ set:'dorm', cast:[f].concat(pool.slice(0, 3)), lines:[
          R('N', 'Somebody found fairy lights. Somebody else found a cake. Nobody knows where either came from.'),
          R(pool[0], 'Okay, okay, gifts! Everyone pick a name!', 'cheer'),
          R(f, 'No peeking. I mean it.', 'clap'),
        ] },
        choices:pool.map(id => [n(id), 'Bond +10']) };
    }
    case 'camerasArrive': {
      const a = byBond(trainees().filter(x => x !== f), true)[0];
      return { eyebrow:'Academy · Month 18', title:'The cameras arrive', text:'Next month the survival show starts. How does ' + F + ' feel?',
        scene:{ set:'practice', cast:['J2', f, a], lines:[
          R('J2', 'From tomorrow there will be cameras in this room. In the dorm. In the hallway.'),
          R('J2', 'Three missions. A live finale. Six names. You know how it ends; you don\'t know who.'),
          R(a, '(whispering) Promise we\'ll still be like this. With the cameras.', 'talk'),
          R(f, 'Promise.', 'hug'),
        ] },
        choices:[['Ready', 'Stage +2'], ['Terrified', 'Wellbeing −4, Fan Favor +3 (fans love honesty)']] };
    }
    case 'danger': {
      return { eyebrow:'Academy · Warning', title:'Bottom three, again', text:'What does ' + F + ' do about it?',
        scene:{ set:'office', cast:['J2', f], lines:[
          R('J2', 'You\'ve been in the bottom three. I want to understand why before the cameras do.'),
          R(f, 'I\'m working. I promise I\'m working.'),
          R('J2', 'I believe you. Working and improving aren\'t the same thing.'),
        ] },
        choices:[['Extra lessons every night', 'Training ×1.25 next month, Wellbeing −8'], ['Ask a top trainee for help', 'Bond +6, training ×1.1'], ['Rest and reset', 'Wellbeing +12']] };
    }
    case 'recovered': {
      return { eyebrow:'Academy · Payoff', title:'Off the warning list', text:F + ' climbed out of the bottom three.',
        scene:{ set:'practice', cast:['J2', f], lines:[
          R('J2', F + '. You\'re off the warning list.'),
          R(f, 'Really? I...', 'cry'),
          R('J2', 'Don\'t thank me. You did that.'),
        ] }, choices:[['Keep going', 'Fan Favor +4, Wellbeing +6']] };
    }
    case 'helpWarned': {
      const x = ev.x; if (!G.inPlay(x)) return null;
      return { eyebrow:'Academy · Practice room', title:n(x) + ' is still practicing', text:'It is past midnight. ' + n(x) + ' is on warning and alone in the practice room.',
        scene:{ set:'practice', cast:[x, f], lines:[
          R('N', 'The music stops and starts. Stops and starts.'),
          R(x, 'I keep missing the same count. Every single time.', 'cry'),
          R(f, '...Want me to count it for you?'),
        ] },
        choices:[['Stay and practice with her', 'She will remember this'], ['Tell a coach she needs help', 'Her Wellbeing +5'], ['Leave her be', '']] };
    }
    /* ===== Survival show ===== */
    case 'teamForm': {
      const mi = MISSIONS[ev.n], pool = byBond(trainees().filter(x => x !== f), true).slice(0, 4); ev.opts = pool;
      return { eyebrow:'Survival Show · Episode ' + (ev.n * 2 - 1), title:'Mission ' + ev.n + ': ' + mi.t, text:mi.d + ' Who does ' + F + ' want on her team?',
        scene:{ set:'stage', cast:['HOST', f].concat(pool.slice(0, 3)), lines:[
          R('HOST', 'Welcome back. ' + trainees().length + ' trainees are left.'),
          R('HOST', 'Mission ' + ev.n + ' is the ' + mi.t.toLowerCase() + '. ' + mi.d),
          R('HOST', 'You pick your own teams. Go.'),
          R('N', 'Everyone moves at once.'),
          R(pool[0], F + '! Over here!', 'wave'),
        ] },
        choices:pool.map(id => [n(id), 'Best skill: ' + topSkill(id).l + ' · bond ' + G.bond(f, id)]) };
    }
    case 'songPick': {
      const mi = MISSIONS[ev.n], t = (s.ms && s.ms.team) || [f];
      return { eyebrow:'Survival Show · Mission ' + ev.n, title:'Pick the song', text:'The team gets first pick. Songs that fit the team\'s strengths score better.',
        scene:{ set:'practice', cast:t, lines:[
          R(t[1] || f, 'We have to pick before the other teams. What are we doing?', 'talk'),
          R(f, 'Let\'s play to what we\'re good at.'),
        ] },
        choices:mi.songs.map(x => [x[0], x[2] + ' · team ' + D.skills.find(k => k.k === x[1]).l.toLowerCase() + ' ' + Math.round(avgSkill(t, x[1]))]) };
    }
    case 'parts': {
      const t = (s.ms && s.ms.team) || [f];
      return { eyebrow:'Survival Show · Mission ' + ev.n, title:'Who sings what', text:'There is one killing part: the line every fancam will be cut around.',
        scene:{ set:'practice', cast:t, lines:[
          R(t[2] || t[1] || f, 'Okay. Who takes the killing part?', 'talk'),
          R('N', 'Nobody says anything for a long second.'),
          R(f, '...'),
        ] },
        choices:[['Take the killing part', 'Big bonus if she nails the stage (70%+), a penalty if not'], ['Take a harmony part', 'Safe bonus, team bond +3'], ['Let the team vote', 'Team bond +5; the best fit gets it']] };
    }
    case 'rehearsal': {
      const t = ((s.ms && s.ms.team) || [f]).filter(x => x !== f), x = t.slice().sort((a, b) => G.avg(a) - G.avg(b))[0];
      if (!x) return null; ev.x = x;
      return { eyebrow:'Survival Show · Mission ' + ev.n, title:'Rehearsal', text:n(x) + ' keeps falling behind, and the stage is in three days.',
        scene:{ set:'practice', cast:['J1', f, x].concat(t.filter(y => y !== x)).slice(0, 5), lines:[
          R('J1', 'Again. From the bridge.'),
          R('N', 'Again, ' + n(x) + ' is half a count late.'),
          R('J1', n(x) + ', you\'re dragging the whole team.'),
          R(x, 'I know! I\'m sorry. I\'m trying.', 'cry'),
        ] },
        choices:[['Stay late and drill with her', 'Team bonus +3, she will remember'], ['Ask the coach to simplify her part', 'Small team bonus'], ['Focus on her own part', 'Personal bonus +2, bond −4']] };
    }
    case 'ceremony': {
      const L = s.lastMission; if (!L || L.n !== ev.n) return null;
      const rows = L.rows, out = L.out, me = rows.findIndex(r => r.id === f);
      const friend = byBond(out.filter(x => x !== f), true)[0];
      ev.friend = friend;
      const lines = [R('HOST', 'Mission ' + ev.n + ' rankings. Judges\' scores plus the online vote.')];
      rows.slice(0, 3).forEach((r, i) => { lines.push(R('HOST', 'Rank ' + (i + 1) + ': ' + n(r.id) + '.')); if (i === 0) lines.push(R(r.id, 'I... thank you. Thank you to everyone who voted.', 'cry')); });
      if (me >= 3) { lines.push(R('HOST', 'Rank ' + (me + 1) + ': ' + F + '.')); lines.push(out.includes(f) ? R(f, '...', 'cry') : R(f, 'I\'m still here.', 'cheer')); }
      lines.push(R('HOST', 'And the trainees leaving us tonight: ' + out.map(n).join(', ') + '.'));
      out.slice(0, 3).forEach(x => lines.push(R(x, pick(['I\'m not sad. Okay, I\'m a little sad. I loved every day here.', 'Please debut for me, okay? All of you.', 'Thank you for letting me stand on this stage.', 'I\'ll be watching. Every single stage.']), 'cry')));
      const cast = ['HOST'].concat(rows.slice(0, 3).map(r => r.id)).concat([f]).concat(out.slice(0, 3)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 8);
      return { eyebrow:'Survival Show · Episode ' + (ev.n * 2), title:'Ranking ceremony', text:friend && !out.includes(f) ? n(friend) + ' is leaving. What does ' + F + ' say to her?' : out.includes(f) ? F + '\'s name was called.' : 'Nobody close to ' + F + ' left tonight.',
        scene:{ set:'stage', cast, lines },
        choices:friend && !out.includes(f) ? [['Hug her and promise to meet on stage', 'This promise will come back'], ['Thank her for everything', 'Bond +6'], ['Stay composed for the cameras', 'Fan Favor +2']] : [['Continue']] };
    }
    case 'finaleEve': {
      const ten = trainees(); if (!ten.includes(f)) return null;
      const helped = ten.find(x => M().helped[x]);
      const prom = Object.keys(M().promised)[0];
      const lines = [R('N', 'The night before the finale. Ten trainees, one dorm, nobody sleeping.'),
        R(byBond(ten.filter(x => x !== f), true)[0], 'Whatever happens tomorrow, this was the best year of my life.', 'sit')];
      if (helped && helped !== f) lines.push(R(helped, F + '. If you hadn\'t stayed with me in the practice room that night, I wouldn\'t be here.', 'hug'));
      if (prom) lines.push(R('N', F + ' has a message from ' + n(prom) + ': "See you on stage. I mean it."'));
      if (M().gift && ten.includes(M().gift)) lines.push(R(M().gift, 'I still have the gift you gave me at the holiday party. It\'s in my bag for tomorrow.', 'talk'));
      lines.push(R(f, 'Let\'s just... remember this. Right now.'));
      return { eyebrow:'Survival Show · Finale eve', title:'The night before', text:'How does ' + F + ' spend the last night?',
        scene:{ set:'dorm', cast:[f].concat(ten.filter(x => x !== f && (x === helped || x === M().gift))).concat(byBond(ten.filter(x => x !== f), true).slice(0, 2)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 5), lines },
        choices:[['Write letters to each other', 'Bonds +3 with every finalist'], ['Sleep early', 'Wellbeing +10'], ['One last run-through', 'Finale stage +4, Wellbeing −5']] };
    }
    case 'voteReveal': {
      const L = s.lastFinale; if (!L) return null;
      const six = L.six, rows = L.rows;
      const real = s.mode === 'real';
      const lines = [R('HOST', 'The votes are in. Fan pre-vote, live vote, and the judges.'), R('HOST', 'I\'ll call six names, starting from sixth place.')];
      six.slice().reverse().forEach((id, i) => {
        const c = G.CAST[id], place = 6 - i, sc = real && c.score ? ' with ' + c.score.toFixed(2) + ' points' : '';
        lines.push(R('HOST', ['Sixth','Fifth','Fourth','Third','Second','And in first place'][i] + (i < 5 ? ' place: ' : ': ') + n(id) + sc + '.'));
        lines.push(R(id, place === 1 ? 'I don\'t... I can\'t... thank you.' : pick(['Mom, I did it!', 'I\'m shaking. I\'m actually shaking.', 'We did it. We actually did it.', 'Thank you. Thank you so much.']), place === 1 ? 'cry' : 'cheer'));
      });
      if (real) lines.push(R('HOST', 'Samara Siqueira finishes seventh, just 1.33 points behind.'));
      const lost = L.out.slice(0, 2);
      lost.forEach(x => lines.push(R(x, 'Go. Debut. Make it worth it.', 'hug')));
      if (!six.includes(f) && L.out.includes(f)) lines.push(R(f, 'I\'m proud of them. I am.', 'cry'));
      return { eyebrow:'Survival Show · Live finale', title:'Six names', text:six.includes(f) ? F + ' will debut.' : F + ' will not debut with the group.',
        scene:{ set:'stage', cast:['HOST'].concat(six).concat(lost).slice(0, 9), lines }, choices:[['Continue']] };
    }
    /* ===== Debut countdown ===== */
    case 'dormMove': {
      const pool = byBond(others(), true).slice(0, 4); ev.opts = pool;
      return { eyebrow:'Pre-Debut', title:'Moving in', text:'Six members, three rooms. Who does ' + F + ' room with?',
        scene:{ set:'dorm', cast:G.members(), lines:[
          R('MGR', 'This is it. The group dorm. Rooms are yours to sort out.'),
          R(pool[0] || f, 'I call the bottom bunk!', 'cheer'),
          R(f, 'You can\'t call bunks before we pick rooms.'),
          R('N', 'Somebody has already unpacked a lightstick prototype.'),
        ].concat([]) , extra:['MGR'] },
        choices:pool.map(id => [n(id), 'Roommate: bond +8 now, +1 every month together']) };
    }
    case 'recording': {
      return { eyebrow:'Debut countdown · Studio', title:'Recording the debut single', text:'How should ' + F + ' sing her part?',
        scene:{ set:'studio', cast:['PROD', f], lines:[
          R('PROD', 'Okay, that was technically perfect. Which is the problem.'),
          R('PROD', 'I want to hear a person, not a demo. Tell me how you want this line to feel.'),
          R(f, 'Can I try it three different ways?'),
        ] },
        choices:[['Powerful', 'Fits a strong vocalist'], ['Soft and breathy', 'Fits a gentle tone'], ['Playful', 'Fits charisma'], ['Nail one perfect take', 'Play Hold the Note']], games:[null, null, null, 'vocal'], mgCast:'focus' };
    }
    case 'choreoCamp': {
      return { eyebrow:'Debut countdown · Choreography camp', title:'Choreo camp', text:'Two weeks to learn the debut choreography. What style does the group lean into?',
        scene:{ set:'practice', cast:['J1'].concat(G.activeMembers()), lines:[
          R('J1', 'This choreography has one job: make people want to learn it.'),
          R('J1', 'If a stranger can\'t copy the hook move from a ten-second clip, we failed.'),
          R(f, 'So... simple but impossible to forget.'),
          R('J1', 'Exactly. Again, from the top.'),
        ] },
        choices:[['Sharp and powerful', 'Dance prep, a stronger stage'], ['Fluid and smooth', 'Better live vocals'], ['Easy to copy', 'More viral chance'], ['Run it with the members', 'Play Mirror the Choreo']], games:[null, null, null, 'dance'], mgCast:'focus' };
    }
    case 'teaser': {
      return { eyebrow:'Debut countdown · Teaser', title:'The first teaser', text:'Manager Dana has three cuts. Which one goes out?',
        scene:{ set:'office', cast:['MGR', f].concat(byBond(others(), true).slice(0, 2)), lines:[
          R('MGR', 'Midnight tonight, the first teaser goes live. I need a decision.'),
          R('MGR', 'Option one: dark, no faces, just the logo. Option two: all six, bright, smiling. Option three: one film per member.'),
          R(f, 'People will screenshot every frame of whatever we pick.'),
        ] },
        choices:[['Mysterious, no faces', 'Theories, buzz, momentum'], ['Bright, all six', 'Steady fan growth'], ['One film per member', 'Fan Favor up for everyone']] };
    }
    case 'jacket': {
      const pool = G.activeMembers(); ev.opts = pool;
      return { eyebrow:'Debut countdown · Concept photos', title:'Who opens the reveal?', text:'Concept photos drop one member a day. Who goes first?',
        scene:{ set:'mv', cast:pool, lines:[
          R('N', 'Flash. Flash. Flash. Six hours of the same pose from slightly different angles.'),
          R(pool[0], 'Is my face doing the thing? The serious thing?', 'fairy'),
          R(f, 'You look like you\'re about to sneeze.', 'clap'),
        ] },
        choices:pool.map(id => [n(id), 'Fan Favor +6' + (id === f ? '' : '; ' + n(f) + ' bond +3')]) };
    }
    case 'countdown': {
      return { eyebrow:'Debut countdown · Two months', title:'The date', text:'The label executive wants a promise. What does the group say?',
        scene:{ set:'office', cast:['EXEC', 'MGR', f], lines:[
          R('MGR', 'The date is set. Two months from today.'),
          R('EXEC', 'We spent a lot of money on a television show. I want to know what we\'re getting back.'),
          R('EXEC', 'Can you promise me a chart debut?'),
          R(f, '...'),
        ] },
        choices:[['Promise a top 50 debut', 'Label pressure −15 now; +25 if you miss'], ['Promise nothing', 'Label pressure +5'], ['Promise our best, not a number', 'Cohesion +2']] };
    }
    case 'dressRehearsal': {
      return { eyebrow:'Debut countdown · Dress rehearsal', title:'Dress rehearsal', text:'Full costumes, full lights, an empty hall. One run.',
        scene:{ set:'stage', cast:G.activeMembers(), lines:[
          R('N', 'The hall is empty except for the crew and the documentary camera.'),
          R('MGR', 'Full run. No stopping, whatever happens.'),
          R(f, 'Whatever happens. Okay.'),
        ], extra:['MGR'] }, set:'stage', mgCast:'group',
        choices:[['Run it', 'Live stage; a strong run boosts the showcase'], ['Mark it and save energy', 'Wellbeing +6 for everyone']], games:['live', null] };
    }
    case 'midnight': {
      const t = M().teaser;
      return { eyebrow:'Debut day', title:'Midnight', text:'The single goes live at midnight.',
        scene:{ set:'dorm', cast:G.activeMembers(), lines:[
          R('N', '11:59 p.m. Six members, one laptop, one refresh button.'),
          R(byBond(others(), true)[0] || f, 'Ten. Nine. Eight...', 'talk'),
          R('N', '12:00.'),
          R(f, 'It\'s out. It\'s actually out.', 'cry'),
          t === 0 ? R('N', 'The comments are already full of fan theories from the faceless teaser.') : t === 2 ? R('N', 'Fans are posting their favorite member films side by side.') : R('N', 'The first comment: "FINALLY."'),
          M().homeSong ? R(f, 'The song I wrote when I was homesick made the B-side. My family is listening right now.', 'cry') : R('N', 'Somebody\'s phone buzzes with a message from home.'),
        ] }, choices:[['Watch the numbers all night'], ['Sleep. Big day tomorrow.']] };
    }
    case 'firstShow': {
      const r = s.group.releases[0]; if (!r) return null;
      return { eyebrow:'Debut week', title:'The first music show', text:'Their first music show stage. Nominated or not, it is the first one.',
        scene:{ set:'stage', cast:['HOST'].concat(G.activeMembers()), lines:[
          R('HOST', 'Please welcome the newest group on our stage: ' + s.group.name + '!'),
          R(f, 'Hello! We\'re ' + s.group.name + '!', 'wave'),
        ] }, set:'stage', mgCast:'group',
        choices:[['Perform "' + r.title + '"', 'Live stage'], ['Pre-recorded stage', 'Stats only']], games:['live', null] };
    }
    case 'debutRecap': {
      const r = s.group.releases[0], prom = M().promise, fr = Object.keys(M().promised);
      const lines = [R('MGR', 'Debut week, by the numbers.'),
        R('MGR', '"' + r.title + '" ' + (r.peak > 100 ? 'didn\'t make the chart.' : 'peaked at No. ' + r.peak + '.') + ' Fans: ' + G.fmt(s.group.fans) + '.' + (r.mv ? ' The video scored ' + r.mv + '.' : ''))];
      if (prom === 'top50') lines.push(r.peak <= 50 ? R('EXEC', 'You promised a top 50. You delivered. I don\'t say this often: good.') : R('EXEC', 'You promised a top 50. I remember promises.'));
      lines.push(r.peak > 100 ? R('MGR', 'The real group\'s debut didn\'t chart either. Debuts are the start, not the verdict.') : R('MGR', 'That\'s better than a lot of debuts. Including some famous ones.'));
      fr.forEach(x => lines.push(R('N', 'Flowers arrive at the showcase from ' + n(x) + '. The card says: "Told you. See you on stage."')));
      return { eyebrow:'Debut week', title:'Debut recap', text:'What does the group take from debut week?',
        scene:{ set:'office', cast:['MGR'].concat(prom ? ['EXEC'] : []).concat([f]), lines },
        choices:[['Celebrate tonight', 'Wellbeing +8 for everyone'], ['Back to practice tomorrow', 'Skills +1 for everyone']] };
    }
    case 'docPremiere': {
      const mm = M().moments.slice(-4);
      return { eyebrow:'Docuseries premiere', title:'The documentary premieres', text:'The docuseries about the show and the debut comes out.',
        scene:{ set:'dorm', cast:G.activeMembers(), lines:[R('N', 'The group watches the first episode together on the dorm couch.')]
          .concat(mm.length ? mm.map(x => R('N', 'On screen: ' + x.t + '.')) : [R('N', 'On screen: a year of practice rooms, evals and late nights.')])
          .concat([R(f, 'Did they have to show THAT?', 'clap'), R(byBond(others(), true)[0] || f, 'That\'s the best part!', 'cheer')]) },
        choices:[['Watch the whole thing in one night', 'Cohesion +3']] };
    }
    case 'dream': {
      const g = M().goal, txt = { center:'named center', aplus:'earned an A+', friends:'found real friends', debut:'debuted' }[g];
      return { eyebrow:'Payoff · Day-one goal', title:'Dream come true', text:'On day one, ' + F + ' wanted this. She ' + txt + '.',
        scene:{ set:G.debuted() ? 'dorm' : 'practice', cast:[f].concat(byBond(others(), true).slice(0, 2)), lines:[
          R('N', 'Back on day one, ' + F + ' wrote down one goal.'),
          R(f, 'I can\'t believe it actually happened.', 'cry'),
          R(byBond(others(), true)[0] || f, 'I can. You earned it.', 'hug'),
        ] }, choices:[['Keep going', 'Fan Favor +5, Wellbeing +10']] };
    }
    case 'promiseCameo': {
      const x = ev.x;
      return { eyebrow:'Payoff · A promise kept', title:n(x) + ' is in the crowd', text:'At the ceremony, ' + F + ' promised ' + n(x) + ' they would meet on stage.',
        scene:{ set:'stage', cast:[f, x], lines:[
          R('N', 'Front row, a lightstick held a little higher than the others.'),
          R(x, 'Told you I\'d be watching. Every single stage.', 'cheer'),
          R(f, 'You came!', 'hug'),
        ] }, choices:[['Wave her up for the encore', 'Wellbeing +8, Fan Favor +4']] };
    }
  }
  return null;
};
function avgSkill(ids, k) { return ids.reduce((t, id) => t + G.p(id).sk[k], 0) / Math.max(1, ids.length); }

G.choose3 = (ev, i, acc) => {
  const s = S(), f = s.focus, F = n(f), m = M();
  switch (ev.kind) {
    case 'orientation': m.goal = ['center','aplus','friends','debut'][i]; if (ev.a) G.addBond(f, ev.a, 5); log(F + '\'s goal: ' + ['become the center','earn an A+','make real friends','debut'][i] + '.', 'story');
      moment('day one, when ' + F + ' and ' + n(ev.a) + ' agreed to be practice partners'); return 'Goal set. The academy begins.';
    case 'rankBoard': {
      if (G.p(f).warn) { if (i === 0) { s.session[f] = { mult:1.25, acc:.7, act:G.planOf(f) }; wb(f, -8); return 'Night lessons, starting tonight.'; }
        if (i === 1) { s.session[f] = { mult:1.1, acc:.6, act:G.planOf(f) }; return 'She watches the top three\'s eval tapes until 3 a.m.'; }
        wb(f, 10); return 'She cries in the shower, then she\'s fine. Mostly.'; }
      if (i === 0) { s.session[f] = { mult:1.1, acc:.6, act:G.planOf(f) }; return 'She studies the top three\'s tapes frame by frame.'; }
      if (i === 1) { const w = trainees().filter(x => x !== f && G.p(x).warn)[0]; if (w) { G.addBond(f, w, 8); m.helped[w] = s.month; moment('the night ' + F + ' stayed late to help ' + n(w)); return F + ' stays late with ' + n(w) + '. She won\'t forget it.'; } return 'Nobody on warning wants help tonight.'; }
      wb(f, 5); return 'Eyes on her own work.';
    }
    case 'oneOnOne': {
      if (i === 2) { wb(f, 12); return 'They talk for an hour about anything but dancing. It helps.'; }
      const k = i === 0 ? ev.lo : ev.hi; m.coach = { k, until:s.month + 3 }; return D.skills.find(x => x.k === k).l + ' trains 15% faster for three months.';
    }
    case 'homesick': if (i === 0) { wb(f, 12); return 'Her mom picks up on the first ring.'; }
      if (i === 1) { G.p(f).sk.so = r1(G.p(f).sk.so + 3); m.homeSong = true; moment(F + ' writing a song on the dorm floor at 2 a.m.'); return 'By 4 a.m. she has a verse and a chorus. She saves it as "home (demo)".'; }
      wb(f, -3); G.p(f).sk.pe = r1(G.p(f).sk.pe + 1); return 'She puts the phone away and goes to bed.';
    case 'midterm': { const sc = G.stageScore([f], acc); fan(f, (sc - 50) / 6); if (sc >= 70) moment(F + '\'s mid-term stage that made an executive put down his phone');
      return 'Score ' + Math.round(sc) + '. ' + (sc >= 70 ? 'The executive in the front row puts his phone down.' : sc >= 50 ? 'Solid. Nobody remembers it, nobody minds.' : 'She forgets a section. The executive writes something down.'); }
    case 'holiday': { const x = ev.opts && ev.opts[i]; if (!x) return ''; G.addBond(f, x, 10); m.gift = x; moment(F + ' giving ' + n(x) + ' a holiday gift'); return n(x) + ' opens the gift and hugs ' + F + ' for a full ten seconds.'; }
    case 'camerasArrive': if (i === 0) { G.p(f).sk.pe = r1(G.p(f).sk.pe + 2); return 'Ready.'; } wb(f, -4); fan(f, 3); return 'She admits it on camera. Fans love her for it.';
    case 'danger': if (i === 0) { s.session[f] = { mult:1.25, acc:.7, act:G.planOf(f) }; wb(f, -8); return 'Lessons every night.'; }
      if (i === 1) { const t = (s.lastBoard || []).find(r => r.id !== f); if (t) { G.addBond(f, t.id, 6); s.session[f] = { mult:1.1, acc:.6, act:G.planOf(f) }; return n(t.id) + ' says yes without hesitating.'; } return 'Nobody has time this week.'; }
      wb(f, 12); return 'A weekend off. She comes back lighter.';
    case 'recovered': fan(f, 4); wb(f, 6); return 'Off the list.';
    case 'helpWarned': { const x = ev.x; if (i === 0) { m.helped[x] = s.month; G.addBond(f, x, 10); wb(f, -3); G.p(x).sk.da = r1(G.p(x).sk.da + 2); moment('the night ' + F + ' stayed in the practice room with ' + n(x)); return 'They drill it until 3 a.m. ' + n(x) + ' finally hits the count.'; }
      if (i === 1) { wb(x, 5); return 'A coach gives ' + n(x) + ' an extra lesson.'; } return ''; }
    case 'teamForm': { const p = ev.opts[i]; if (!p) return ''; const rest = byBond(trainees().filter(x => x !== f && x !== p), true).slice(0, 2);
      s.ms = { n:ev.n, team:[f, p].concat(rest), fit:0, part:0, reh:0, teamReh:0 }; G.addBond(f, p, 4); return 'Team: ' + s.ms.team.map(n).join(', ') + '.'; }
    case 'songPick': { const sg = MISSIONS[ev.n].songs[i]; if (!s.ms) return ''; s.ms.song = sg[0]; s.ms.fit = (avgSkill(s.ms.team, sg[1]) - 45) / 6; return 'They take ' + sg[0] + '.'; }
    case 'parts': { if (!s.ms) return ''; if (i === 0) { s.ms.part = 0; s.ms.killing = true; return F + ' takes the killing part.'; }
      if (i === 1) { s.ms.part = 2; s.ms.team.forEach(x => G.addBond(f, x, 3)); return 'Harmonies. Safe, and the team loves her for it.'; }
      const best = s.ms.team.slice().sort((a, b) => G.avg(b) - G.avg(a))[0]; s.ms.team.forEach(x => G.addBond(f, x, 5));
      if (best === f) { s.ms.killing = true; return 'The team votes ' + F + ' for the killing part.'; } s.ms.part = 2; return 'The team votes ' + n(best) + '. ' + F + ' takes harmonies.'; }
    case 'rehearsal': { if (!s.ms) return ''; const x = ev.x;
      if (i === 0) { s.ms.teamReh = 3; s.ms.reh = 1; m.helped[x] = m.helped[x] || s.month; G.addBond(f, x, 8); wb(f, -5); moment(F + ' drilling the bridge with ' + n(x) + ' after the lights went off'); return 'They stay until the cleaners arrive. ' + n(x) + ' nails the bridge.'; }
      if (i === 1) { s.ms.teamReh = 1.5; return 'The coach cuts two counts from ' + n(x) + '\'s part.'; }
      s.ms.reh = 2; G.addBond(f, x, -4); return F + '\'s own part is flawless. ' + n(x) + ' notices she\'s on her own.'; }
    case 'ceremony': { const x = ev.friend; if (!x) return '';
      if (i === 0) { m.promised[x] = s.month; G.addBond(f, x, 10); moment(F + ' hugging ' + n(x) + ' at the ranking ceremony'); return '"See you on stage." "See you on stage."'; }
      if (i === 1) { G.addBond(f, x, 6); return 'They hold hands until ' + n(x) + ' walks off.'; } fan(f, 2); return F + ' keeps it together until the cameras turn off.'; }
    case 'finaleEve': if (i === 0) { trainees().forEach(x => G.addBond(f, x, 3)); moment('ten finalists writing letters to each other the night before the finale'); return 'Ten letters, sealed until after the finale.'; }
      if (i === 1) { wb(f, 10); return 'She sleeps nine hours. A miracle.'; } m.finalePrep = 4; wb(f, -5); return 'One more run in the empty practice room.';
    case 'dormMove': { const x = ev.opts[i]; if (!x) return ''; m.roommate = x; G.addBond(f, x, 8); return F + ' and ' + n(x) + ' take the room with the window.'; }
    case 'recording': { const c = ['vo','vo','ch'][i];
      if (i === 3) { const a = acc == null ? .5 : acc; s.group.prep = clamp(s.group.prep + a * 12, 0, 100); m.vox = Math.round(a * 100); return 'Take ' + Math.round(a * 100) + '%. ' + (a >= .8 ? 'The producer stops the session: "That\'s the one."' : 'Usable. They comp it with an earlier take.'); }
      const fit = G.p(f).sk[c] >= 55; s.group.prep = clamp(s.group.prep + (fit ? 10 : 4), 0, 100); return fit ? 'It fits her voice. The producer grins.' : 'It\'s not quite her, but they make it work.'; }
    case 'choreoCamp': {
      if (i === 3) { const a = acc == null ? .5 : acc; G.activeMembers().forEach(x => { G.p(x).sk.da = r1(G.p(x).sk.da + a * 2); }); return 'Choreo locked in. Dance +' + (a * 2).toFixed(1) + ' for everyone.'; }
      if (i === 0) { G.activeMembers().forEach(x => { G.p(x).sk.pe = r1(G.p(x).sk.pe + 1.5); }); return 'Sharp lines, big hits. Stage +1.5 for everyone.'; }
      if (i === 1) { G.activeMembers().forEach(x => { G.p(x).sk.vo = r1(G.p(x).sk.vo + 1.5); }); return 'Smooth enough to sing over. Vocal +1.5 for everyone.'; }
      s.flags.easyChoreo = 1; return 'The hook move takes four seconds to learn. Somebody\'s little sister learns it from the practice video.'; }
    case 'teaser': m.teaser = i;
      if (i === 0) { s.group.momentum = clamp(s.group.momentum + 12, 0, 100); feed('@notyourstan', 'Who IS this?? No faces?? I need to know.', 1); return 'Theories everywhere by morning.'; }
      if (i === 1) { grow(250000); feed('@lightstickhq', 'They look SO happy. Debut can\'t come fast enough.', 1); return 'Fans grow steadily.'; }
      G.activeMembers().forEach(x => fan(x, 4)); feed('@fancamarchive', 'Ranking the member films is impossible. They\'re all my bias.', 1); return 'Each member gets her own spotlight.';
    case 'jacket': { const x = ev.opts[i]; if (!x) return ''; fan(x, 6); if (x !== f) G.addBond(f, x, 3); return n(x) + '\'s photo trends within the hour.'; }
    case 'countdown': if (i === 0) { m.promise = 'top50'; s.label = clamp(s.label - 15, 0, 100); return 'The executive smiles. That is not a comforting smile.'; }
      if (i === 1) { s.label = clamp(s.label + 5, 0, 100); return 'The executive writes something down.'; }
      G.activeMembers().forEach(a => G.activeMembers().forEach(b => { if (a < b) G.addBond(a, b, 2); })); return 'The group walks out feeling like a group.';
    case 'dressRehearsal': if (i === 1) { G.activeMembers().forEach(x => wb(x, 6)); return 'They walk it at half speed and save their legs.'; }
      { const a = acc == null ? .5 : acc; s.group.momentum = clamp(s.group.momentum + (a - .5) * 14, 0, 100); return a >= .75 ? 'Clean run. The crew applauds.' : 'A shaky run. Better tonight than at the showcase.'; }
    case 'midnight': if (i === 1) { G.activeMembers().forEach(x => wb(x, 5)); return 'They try to sleep. Two of them are still refreshing under the covers.'; } return 'Nobody sleeps. Nobody minds.';
    case 'firstShow': { const sc = G.stageScore(G.activeMembers(), acc); s.group.momentum = clamp(s.group.momentum + (sc - 50) / 3, 0, 100); grow(s.group.fans * .03);
      moment('the first music show stage'); return 'Stage ' + Math.round(sc) + '. ' + (sc >= 70 ? 'The fancams start that night.' : 'Nervous, but it\'s done, and it\'s theirs.'); }
    case 'debutRecap': { const r = s.group.releases[0];
      if (m.promise === 'top50' && r && r.peak > 50) s.label = clamp(s.label + 25, 0, 100);
      Object.keys(m.promised).forEach(x => wb(f, 6));
      if (i === 0) G.activeMembers().forEach(x => wb(x, 8)); else G.activeMembers().forEach(x => D.skills.forEach(({ k }) => { G.p(x).sk[k] = r1(G.p(x).sk[k] + 1); }));
      return i === 0 ? 'Fried chicken on the dorm floor at 1 a.m.' : 'Practice room, 9 a.m. sharp.'; }
    case 'docPremiere': G.activeMembers().forEach(a => G.activeMembers().forEach(b => { if (a < b) G.addBond(a, b, 3); })); grow(s.group.fans * .05); return 'Fans binge it in a weekend.';
    case 'dream': fan(f, 5); wb(f, 10); m.dreamDone = true; return 'Goal reached.';
    case 'promiseCameo': wb(f, 8); fan(f, 4); m.cameoDone = (m.cameoDone || 0) + 1; return 'She sings the last chorus with ' + n(ev.x) + ' on stage.';
  }
  return '';
};

/* ---------- Payoffs ---------- */
function goalCheck() {
  const s = S(), m = M(), f = s.focus; if (!m.goal || m.dreamDone || s.queue.some(e => e.kind === 'dream')) return;
  const ok = m.goal === 'center' ? s.group.pos && s.group.pos.center === f
    : m.goal === 'aplus' ? G.p(f).grades.some(g => g.g === 'A+')
    : m.goal === 'friends' ? others().filter(x => G.bond(f, x) >= 30).length >= 3
    : G.p(f).status === 'member';
  if (ok) q({ kind:'dream' });
}
function promiseCheck(mo) {
  const s = S(), m = M();
  if (!G.debuted() || mo < 33 || (m.cameoDone || 0) >= 2) return;
  const x = Object.keys(m.promised).find(id => !m.seen['cameo:' + id]);
  if (x && chance(.25)) { m.seen['cameo:' + x] = mo; q({ kind:'promiseCameo', x }); }
}
// Roommates grow closer every month.
const _adv = G.advance;
G.advance = () => { const s = S(), m = s && M(); if (m && m.roommate && G.inPlay(m.roommate)) G.addBond(s.focus, m.roommate, 1); return _adv(); };
})();
