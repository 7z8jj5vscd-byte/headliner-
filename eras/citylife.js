/* The Eras Life: Music City systems, borrowed from Nashville and Headliner (engine side).
   - Energy: every card costs its own ⚡ from a weekly budget (about 100), and resting gives some back.
   - This week in town: five fresh activities every week, each with its own ⚡ cost.
   - Your phone: texts from your (invented) team and fans, with replies.
   - Record deals for invented artists: label interest, then negotiate the terms.
   - Make It or Fake It, for invented artists only: shortcuts that become secrets, and honest moves.
   - Setlist flow: a rating for the order of a tour's setlist.
   Real people never fake anything here: shortcuts and scandals exist only for artists you invent. */
(function () {
const ER = window.ER, G = window.G;
const S = () => G.S(), pick = G.pick, rnd = G.rnd, clamp = G.clamp;
const ownArtist = () => { const s = S(); return !!(s && G.art().invented); };

/* ---------- Energy ---------- */
const EC = { write:30, notebook:40, record:25, practice:15, secretsession:25, ghostwrite:25, duet:30, shows:35, recover:5, surprise:10, gig:20, booking:40,
  social:5, fanevent:20, livestream:10, readfans:5, egg:10, single:15, interview:10, network:10, campaign:15, charity:5, school:20, mentor:10,
  rest:0, private:10, timeoff:0, newera:0, farewellplan:0, retireask:0, unretire:0,
  'fin:sequence':10, 'fin:master':15, 'fin:cover':30, 'fin:edition':10, 'fin:deliver':5, 'pre:video':30, 'pre:press':15, 'pre:announce':10, 'pre:single':15,
  'rel:tv':20, 'rel:radio':15, 'rel:signing':20, 'rel:posts':5, 'tp:route':15, 'tp:setlist':10, 'tp:cast':15, 'tp:costume':15, 'tp:rehearse':35 };
G.ecost = t => { const k = t.item ? t.kind + ':' + t.item : t.kind; const v = EC[k] != null ? EC[k] : EC[t.kind];
  return v != null ? v : t.ecost != null ? t.ecost : Math.round((t.cost || 1) * (t.kind === 'freetime' ? 20 : 15)); };
G.energyMax = () => G.blocks() * 20;
G.energyLeft = () => Math.max(0, Math.round(G.energyMax() - S().week.used * 20));
const tasks0 = G.tasks;
G.tasks = function () { const out = tasks0.apply(this, arguments), s = S(); if (!s) return out;
  out.forEach(t => { if (t.kind === 'school') return; const e = G.ecost(t); t.ecost = e; t.cost = e / 20; });
  // This week in town.
  if (!s.flags.retired) (s.townWk === s.abs ? s.town || [] : rollTown()).forEach(x => { const o = TOWN.find(y => y.id === x.id); if (!o) return;
    const ok = !o.req || o.req(s); out.push({ id:'town:' + o.id, l:o.n, desc:ok ? o.d : `Needs ${o.need}.`, cost:o.e / 20, ecost:o.e, req:false, kind:'town', town:o.id, locked:!ok, icon:o.ic }); });
  // Invented artists: shortcuts and honest moves.
  if (ownArtist() && !s.flags.retired) { FAKES.forEach(f => out.push({ id:'fake:' + f.id, l:f.n, desc:f.d, cost:f.e / 20, ecost:f.e, req:false, kind:'fake', fake:f.id, icon:f.ic }));
    REALS.forEach(f => { if (!f.req || f.req(s)) out.push({ id:'real:' + f.id, l:f.n, desc:f.d, cost:f.e / 20, ecost:f.e, req:false, kind:'real', real:f.id, icon:f.ic }); }); }
  return out; };
// Resting gives energy back, once a week.
G.hooks.task.push(t => { const s = S(); if (t.kind === 'rest' && !s.week.restBack) { s.week.restBack = true; s.week.used = Math.max(0, s.week.used - 1); } });

/* ---------- This week in town ---------- */
const fans = () => S().stats.fans, pay = m => Math.round(m * Math.max(1, Math.pow(fans() / 1e4, .35)));
const TOWN = [
  { id:'radio', ic:'📻', n:'Drop in at a radio station', d:'Thank the DJs in person.', e:10, req:s => s.released.length > 0, need:'a release', go:() => { G.applyFx({ fans:.6, clout:1 }); return 'You brought cookies. They played your single twice in an hour.'; } },
  { id:'mall', ic:'🛍️', n:'Autograph signing at the mall', d:'All afternoon, every fan.', e:20, req:s => s.stats.fans > 5000, need:'5,000 fans', go:() => { G.applyFx({ fans:1, energy:-4 }); return 'The line wrapped past the food court. Your hand cramped. Worth it.'; } },
  { id:'podcast', ic:'🎙️', n:'Guest on a music podcast', d:'An hour of talking about yourself.', e:10, go:() => { G.applyFx({ fans:.5, heat:1 }); return 'You told the story of your first guitar. Clips went everywhere.'; } },
  { id:'wedding', ic:'💒', n:'Play a rich family\'s wedding', d:'Good money, long night.', e:25, req:s => G.age() >= 16, need:'age 16', go:() => { const p = pay(3000); S().stats.money += p; return `Three hours of first-dance songs. ${G.fmtM(p)}.`; } },
  { id:'session', ic:'🎧', n:'Sing backup on another record', d:'Session money and a contact. The artist is invented.', e:15, go:() => { const p = pay(1200); S().stats.money += p; G.applyFx({ clout:1 }); return `You sang the high harmony on ${pick(ER.RIVAL_STARS)}'s new single. ${G.fmtM(p)}.`; } },
  { id:'jingle', ic:'🚗', n:'Sing a car dealership jingle', d:'Easy money, a bit embarrassing.', e:10, req:s => s.stats.fans < 2e6, need:'fewer than 2 million fans', go:() => { const p = pay(2500); S().stats.money += p; G.applyFx({ rep:-1 }); return `It is already stuck in everyone's head. ${G.fmtM(p)}.`; } },
  { id:'masterclass', ic:'🎓', n:'Teach a songwriting masterclass', d:'Students with big ideas.', e:20, req:s => s.stats.write >= 40, need:'Songwriting 40', go:() => { G.applyFx({ rep:2, write:1 }); return 'Fifty students and one brilliant question you still cannot answer.'; } },
  { id:'shoot', ic:'📸', n:'Fashion photo shoot', d:'Wind machines and a lot of outfits.', e:15, go:() => { G.applyFx({ rep:2, heat:2 }); return 'The photographer kept saying "more". You gave them more.'; } },
  { id:'busk', ic:'🪙', n:'Busk for a food bank', d:'Every dollar goes to charity.', e:15, go:() => { G.applyFx({ rep:3 }); if (S().auth != null) S().auth = clamp(S().auth + 2, 0, 100); return 'You raised a few thousand dollars in one afternoon.'; } },
  { id:'hospital', ic:'🧸', n:'Visit a children\'s hospital', d:'Sing for the kids.', e:10, go:() => { G.applyFx({ rep:3, energy:2 }); return 'One boy played air guitar the whole time.'; } },
  { id:'bootcamp', ic:'🗣️', n:'Vocal bootcamp weekend', d:'A lot of scales.', e:30, go:() => { const c = pay(800); if (S().stats.money < c) return 'You could not afford it this time.'; S().stats.money -= c; G.applyFx({ write:1, rep:1 }); return 'Your range grew by a whole step.'; } },
  { id:'yoga', ic:'🧘', n:'A yoga class', d:'Stretch it out.', e:10, go:() => { G.applyFx({ energy:8 }); return 'You leave feeling taller.'; } },
  { id:'thrift', ic:'👢', n:'Vintage shopping', d:'Find a new stage outfit.', e:10, go:() => { S().stats.money -= 150; G.applyFx({ rep:1 }); return 'A sequinned jacket for $40. It might have belonged to somebody famous.'; } },
  { id:'museum', ic:'🏛️', n:'Visit a music museum', d:'Stand in front of the greats.', e:10, go:() => { G.applyFx({ write:1, energy:4 }); return 'You left with a notebook full of ideas.'; } },
  { id:'jam', ic:'🪕', n:'A porch jam with friends', d:'Guitars and fireflies.', e:10, go:() => { G.applyFx({ write:1, team:2, energy:4 }); return 'Someone taught you a chord you will use for the rest of your life.'; } },
  { id:'supper', ic:'🍗', n:'Cook Sunday supper for friends', d:'Food and gossip.', e:15, go:() => { G.applyFx({ team:3, energy:5 }); return 'Everybody brought a dish and nobody left before midnight.'; } },
  { id:'openmic', ic:'🎤', n:'Play an open mic', d:'Five minutes, one song.', e:15, req:s => s.stats.fans < 5e5, need:'fewer than 500,000 fans', go:() => { G.applyFx({ fans:1.5, write:1 }); return 'Thirty people heard a new song first.'; } },
  { id:'cohost', ic:'📡', n:'Co-host a radio hour', d:'Play your favourite records.', e:20, req:s => s.stats.fans > 2e4, need:'20,000 fans', go:() => { G.applyFx({ fans:.6, clout:1 }); return 'Listeners called in all hour.'; } },
  { id:'demos', ic:'💿', n:'Swap demos with a friend', d:'Honest notes, both ways.', e:10, go:() => { G.applyFx({ write:1.5 }); return 'They told you your bridge was lazy. They were right.'; } },
  { id:'karaoke', ic:'🎶', n:'Karaoke night', d:'Nobody expects you to show up.', e:10, req:s => G.age() >= 16, need:'age 16', go:() => { G.applyFx({ fans:.4, team:2 }); return 'You sang someone else\'s song terribly on purpose. Phones came out.'; } },
  { id:'gallery', ic:'🖼️', n:'An art gallery opening', d:'Meet people outside music.', e:10, req:s => G.age() >= 18, need:'age 18', go:() => { G.applyFx({ clout:1, write:.5 }); return 'A painter tells you about colour. It sounds like a song.'; } },
  { id:'fanmeet', ic:'💌', n:'Surprise a fan meet-up', d:'Turn up unannounced.', e:15, req:s => s.stats.fans > 1e4, need:'10,000 fans', go:() => { G.applyFx({ fans:.8, rep:1 }); return 'Screaming, crying, selfies. A perfect hour.'; } },
  { id:'producerday', ic:'🎛️', n:'Studio open house', d:'Meet the producers in town. They are invented.', e:10, go:() => { G.applyFx({ clout:1.5 }); return 'You talked tape machines with three producers. One wants to work with you.'; } },
  { id:'hike', ic:'🥾', n:'A long hike', d:'Out of the city, no signal.', e:10, go:() => { G.applyFx({ energy:10 }); return 'Hills, a creek and no phone signal. Bliss.'; } } ];
function rollTown() { const s = S(), pool = TOWN.slice().sort(() => Math.random() - .5); s.town = pool.slice(0, 5).map(o => ({ id:o.id })); s.townWk = s.abs; return s.town; }
G.TOWN = TOWN;

/* ---------- Make It or Fake It (invented artists only) ---------- */
const FAKES = [
  { id:'streams', ic:'🤖', n:'Buy streams', d:'Fast numbers. A secret.', e:5, fx:{ fans:2, hype:4 } },
  { id:'ghost', ic:'👻', n:'Use a ghostwriter', d:'A great song that is not yours. A secret.', e:5, fx:{ write:-1 }, song:1 },
  { id:'lipsync', ic:'🎭', n:'Lip-sync the next show', d:'Save your voice. A secret.', e:5, fx:{ energy:15 } },
  { id:'followers', ic:'📈', n:'Buy followers', d:'Look bigger than you are. A secret.', e:5, fx:{ fans:1.5, clout:1 } },
  { id:'romance', ic:'💘', n:'A fake romance for the cameras', d:'With another invented star. A secret.', e:10, fx:{ heat:10, fans:1.5 } },
  { id:'sob', ic:'😢', n:'Invent a sob story', d:'Interviewers love it. A secret.', e:5, fx:{ rep:3, fans:1 } },
  { id:'autotune', ic:'🎚️', n:'Heavy autotune on everything', d:'Perfect pitch, every time. A secret.', e:5, fx:{ quality:1 } } ];
const REALS = [
  { id:'unscripted', ic:'🗣️', n:'An unscripted interview', d:'Say what you really think.', e:10, fx:{ rep:2, heat:2 }, auth:5 },
  { id:'acoustic', ic:'🎸', n:'An acoustic livestream', d:'No tricks, just you.', e:10, fx:{ fans:.6 }, auth:5 },
  { id:'confess', ic:'🙏', n:'Own up to a secret', d:'It will hurt, then it will help.', e:10, fx:{ rep:-5 }, auth:12, req:s => (s.secrets || []).length > 0 } ];
G.FAKES = FAKES; G.REALS = REALS;
G.auth = () => { const s = S(); if (s.auth == null) s.auth = 60; return s.auth; };
G.hooks.week.push(a => { const s = S(); if (!ownArtist() || !(s.secrets || []).length || s.flags.retired) return;
  const risk = .02 * s.secrets.length + s.stats.heat / 2500; if (Math.random() > risk) return;
  const sec = s.secrets.splice(Math.floor(Math.random() * s.secrets.length), 1)[0], f = FAKES.find(x => x.id === sec.id);
  G.applyFx({ rep:-15, fans:-3, heat:15 }); s.auth = clamp(G.auth() - 15, 0, 100); s.exposed = (s.exposed || 0) + 1;
  G.inbox('publicist', 'You have been exposed', `The Velvet Rope, an invented gossip site, has the story: "${f ? f.n : 'a secret'}". It is everywhere.`);
  (s.texts = s.texts || []).unshift({ id:G.uid(), abs:a, from:'publicist', x:'Call me. Now. The Velvet Rope has the story.', opts:[{ l:'Tell the truth', fx:{ rep:4 }, auth:6, r:'Honesty helps, slowly.' }, { l:'Deny everything', fx:{ heat:6 }, auth:-6, secret:sec, r:'It works, for now.' }] }); });

/* ---------- The doTask side of town, fakes and honest moves ---------- */
const doTask0 = G.doTask;
G.doTask = function (id, arg) { const s = S();
  const pre = id.startsWith('town:') ? 'town' : id.startsWith('fake:') ? 'fake' : id.startsWith('real:') ? 'real' : null; if (!pre) return doTask0.apply(this, arguments);
  if (s.week.done[id]) return { err:'Already done.' }; const t = G.tasks().find(x => x.id === id); if (!t) return { err:'Not available.' };
  if (t.locked) return { err:t.desc }; if (!G.canSpend(t.cost)) return { err:'Not enough energy this week. Rest, or wrap the week.' };
  let msg = '';
  if (pre === 'town') msg = TOWN.find(o => o.id === t.town).go();
  if (pre === 'fake') { const f = FAKES.find(x => x.id === t.fake); G.applyFx(f.fx); s.secrets = (s.secrets || []).concat({ id:f.id, abs:s.abs }); s.auth = clamp(G.auth() - 10, 0, 100);
    if (f.song && G.writeOwn) { const r = G.writeOwn(G.freshOwnTitle(), null, null); if (r.ok) { r.so.q = clamp(r.so.q + 15, 10, 100); msg = `"${r.t}" goes in your notebook. Nobody needs to know.`; } }
    msg = msg || 'It works. For now.'; }
  if (pre === 'real') { const f = REALS.find(x => x.id === t.real); G.applyFx(f.fx); s.auth = clamp(G.auth() + f.auth, 0, 100); if (f.id === 'confess' && s.secrets && s.secrets.length) { const x = s.secrets.shift(); msg = `You tell the truth about "${(FAKES.find(y => y.id === x.id) || {}).n}". It hurts, then it helps.`; } else msg = 'People can tell it is really you.'; }
  s.week.used += t.cost; s.week.done[id] = true; G.hooks.task.forEach(f => { try { f(t, arg); } catch (x) {} });
  return { ok:true, msg }; };
// Authenticity matters: real artists get more from their fans; fakers get less.
G.hooks.week.push(() => { const s = S(); if (!ownArtist() || s.flags.retired) return; const a = G.auth(); if (a >= 75) G.applyFx({ fans:.15 }); if (a <= 30) G.applyFx({ fans:-.15, rep:-.2 }); });

/* ---------- Your phone ---------- */
const TEXTS = [
  { from:'manager', x:'Big offer on the table for a festival slot. Want me to push for a better spot?', opts:[{ l:'Push for a better spot', fx:{ clout:1 }, mood:2, r:'They moved you up the bill.' }, { l:'Take what they offered', fx:{ team:2 }, r:'Easy yes.' }] },
  { from:'publicist', x:'A magazine wants a profile. They want to talk about your love life.', opts:[{ l:'Music only', fx:{ rep:1 }, r:'They agree, grudgingly.' }, { l:'Just skip it', fx:{ heat:-2 }, r:'Another time.' }] },
  { from:'producer', x:'I made a beat at 3am. It sounds like you. Come by?', opts:[{ l:'On my way', fx:{ write:1, energy:-4 }, r:'It does sound like you.' }, { l:'Tomorrow', fx:{ energy:2 }, r:'They send a voice memo instead.' }] },
  { from:'stylist', x:'Two options for the next shoot: sparkle or all black?', opts:[{ l:'Sparkle', fx:{ heat:1 }, r:'You light up the set.' }, { l:'All black', fx:{ rep:1 }, r:'Very cool. Very you.' }] },
  { from:'tour', x:'The crew wants a pizza night after rehearsal. Your call.', opts:[{ l:'Pizza on me', fx:{ team:4 }, money:-500, r:'The crew talks about it for weeks.' }, { l:'Early night', fx:{ energy:4 }, r:'Sensible.' }] },
  { from:'fans', x:'A fan account tagged you: "you got me through my exams 🥹"', opts:[{ l:'Reply with a heart', fx:{ fans:.4 }, r:'They screenshot it forever.' }, { l:'Send a voice note', fx:{ fans:.8, energy:-2 }, r:'The voice note goes viral.' }] },
  { from:'manager', x:'Label wants a quick acoustic session for their channel. Thirty minutes.', opts:[{ l:'Sure', fx:{ fans:.5, energy:-3 }, r:'Thirty minutes became two hours.' }, { l:'Not this week', fx:{}, r:'They will ask again.' }] },
  { from:'friend', x:'Are you free this weekend? Feels like I haven\'t seen you in months.', opts:[{ l:'Make time', fx:{ energy:6, team:1 }, r:'Exactly what you needed.' }, { l:'Too busy', fx:{ energy:-2 }, r:'They say they understand.' }] } ];
G.hooks.week.push(a => { const s = S(); if (s.flags.retired || G.age() < 14 || Math.random() > .3) return; const t = pick(TEXTS);
  s.texts = (s.texts || []).filter(x => !x.replied || a - x.abs < 30); if (s.texts.filter(x => !x.replied).length >= 3) return;
  s.texts.unshift({ id:G.uid(), abs:a, from:t.from, x:t.x, opts:t.opts }); if (s.texts.length > 30) s.texts.length = 30; });
G.replyText = function (id, i) { const s = S(), t = (s.texts || []).find(x => x.id === id); if (!t || t.replied) return null; const o = t.opts[i]; if (!o) return null;
  t.replied = { l:o.l, r:o.r, abs:s.abs }; G.applyFx(o.fx || {}); if (o.money) s.stats.money += o.money; if (o.auth) s.auth = clamp(G.auth() + o.auth, 0, 100);
  if (o.secret) s.secrets = (s.secrets || []).concat(o.secret); if (G.crewMood && ['manager','publicist','producer','stylist','tour'].includes(t.from)) G.crewMood(t.from, o.mood || 1); return o; };

/* ---------- Record deals (invented artists) ---------- */
G.LABELS = [{ id:'lumen', n:'Lumen Records', big:1.2 }, { id:'north', n:'Northbound Music', big:1 }, { id:'velvet', n:'Velvet Static', big:.8 }, { id:'harbor', n:'Harbor & Pine', big:.6 }];
G.dealOn = () => ownArtist() && !S().flags.retired;
G.labelInterest = () => { const s = S(); s.labels = s.labels || {}; G.LABELS.forEach(l => { if (s.labels[l.id] == null) s.labels[l.id] = 10; }); return s.labels; };
G.pitchLabel = function (lid, how) { const s = S(), L = G.labelInterest(), c = { demo:[10, 6], showcase:[25, 14], lunch:[10, 8] }[how]; if (!c) return { err:'Pick an approach.' };
  if (!G.canSpend(c[0] / 20)) return { err:'Not enough energy this week.' }; s.week.used += c[0] / 20;
  const gain = Math.round(c[1] * (.6 + Math.log10(Math.max(10, s.stats.fans)) / 8) * rnd(.7, 1.3)); L[lid] = clamp(L[lid] + gain, 0, 100);
  return { ok:true, msg:`${G.LABELS.find(l => l.id === lid).n}: interest +${gain}.` }; };
G.dealAsk = (lid, t) => { const l = G.LABELS.find(x => x.id === lid), L = G.labelInterest(), f = Math.max(1, S().stats.fans);
  const budget = (L[lid] / 100) * l.big * Math.max(25000, f * 4);
  const want = t.advance + t.royalty * f * 6 + (t.control ? f * 2 : 0) - t.albums * f * 1.5 - (t.cut || 0) * f * 10;
  return { ok:want <= budget, budget, want }; };
G.signDeal = function (lid, t) { const s = S(), r = G.dealAsk(lid, t); if (!r.ok) { G.labelInterest()[lid] = Math.max(0, G.labelInterest()[lid] - 5); return { err:'They pass on those terms. Their interest drops a little. Ask for less, or raise their interest.' }; }
  s.deal = Object.assign({ lid, signed:s.abs, owedLeft:t.albums, releasedAt:s.released.length }, t); s.stats.money += t.advance;
  G.inbox('label', `Signed to ${G.LABELS.find(l => l.id === lid).n}`, `${G.fmtM(t.advance)} advance, ${Math.round(t.royalty * 100)}% royalty, ${t.albums} albums${t.control ? ', creative control' : ''}${t.cut ? `, a ${Math.round(t.cut * 100)}% cut of touring and merch` : ''}.`);
  return { ok:true, msg:'Deal signed.' }; };
// The deal at work: royalties on releases, the label's cut, and albums owed.
G.hooks.week.push(() => { const s = S(), d = s.deal; if (!d) return; const n = s.released.length - (d.paidTo != null ? d.paidTo : d.releasedAt);
  if (n > 0) { s.released.slice(-n).forEach(r => { s.stats.money += Math.round(r.fw * (d.royalty - .15) * 12); }); d.owedLeft = Math.max(0, d.owedLeft - n); d.paidTo = s.released.length;
    if (!d.owedLeft) { G.inbox('label', 'Your deal is done', 'You delivered every album you owed. You are a free agent. Sign again, or stay independent.'); s.deal = null; } }
  if (d && d.cut && s.merchWeek) s.stats.money -= Math.round(s.merchWeek * d.cut); });
// Creative control changes how albums land: with it, the album sounds like you; without it, the label smooths it over.
G.hooks.week.push(() => { const s = S(), d = s.deal; if (!d) return; G.active().forEach(({ p, st }) => { const pj = G.pj(p.id); if (st === 'finish' && !pj.dealQ) { pj.dealQ = true; pj.qmod = (pj.qmod || 0) + (d.control ? 2 : -2); } }); });

/* ---------- Setlist flow ---------- */
G.setlistFlow = function (list) { const s = S(), L = (list || []).filter(t => s.songs[t]); const notes = []; let b = 0; if (L.length < 6) return { b:0, notes:['Add more songs to judge the flow.'] };
  const q = t => s.songs[t].q, tempo = t => (s.songs[t].craft && s.songs[t].craft.tempo) || (q(t) % 3 === 0 ? 'ballad' : 'up'), hit = t => Object.values(s.pj).some(p => (p.singles || []).includes(t));
  const avg = L.reduce((a, t) => a + q(t), 0) / L.length;
  if (q(L[0]) >= avg && tempo(L[0]) !== 'ballad') { b += .12; notes.push(`"${L[0]}" is a strong, fast opener.`); } else notes.push('Open with something fast and strong.');
  const mid = L.slice(Math.floor(L.length * .35), Math.ceil(L.length * .7)); if (mid.some(t => tempo(t) === 'ballad')) { b += .1; notes.push('A ballad in the middle lets the crowd breathe.'); } else notes.push('Put a ballad in the middle.');
  const last = L[L.length - 1]; if (hit(last)) { b += .14; notes.push(`Closing with a hit, "${last}".`); } else notes.push('Close with one of your singles.');
  let swaps = 0; for (let i = 1; i < L.length; i++) if ((tempo(L[i]) === 'ballad') !== (tempo(L[i - 1]) === 'ballad')) swaps++; if (swaps >= L.length / 4) { b += .08; notes.push('Good flow between fast and slow songs.'); }
  if (L.length >= 16) { b += .06; notes.push('Long enough for an encore.'); }
  return { b:clamp(b, 0, .5), notes }; };
const show0 = G.showNight;
G.showNight = function (sh) { const s = S(), tr = (s.pj[sh.pid] || {}).tour || {}, f = G.setlistFlow(tr.setlist).b, g0 = s.gearShow; s.gearShow = (g0 || 0) + f;
  try { return show0.apply(this, arguments); } finally { s.gearShow = g0; } };
})();
