// K-Pop Idol Agency: screens, modals, tutorial and update notice.
(function () {
const D = KD, $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'kpopagency_slot_', LAST = 'kpopagency_last';
const { ri, pick, clamp, avg } = KA.h;
let S = null;
const UI = { tab: 'hq', gsel: null, chart: 'chart', looks: [], frame: 0, q: false, draft: { agency: '', ceo: '', diff: 'normal' } };
window.IA = { UI, get S() { return S; } };

// ------------------------------------------------------------------ saves
const readSlot = n => { try { const r = localStorage.getItem(KEY + n); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
function save() { if (!S) return; try { localStorage.setItem(KEY + S.slot, JSON.stringify(S)); localStorage.setItem(LAST, String(S.slot)); } catch (e) { } }

// ------------------------------------------------------------------ small helpers
const POSES = ['idle', 'up1', 'out', 'up2', 'cheer', 'hip', 'heart', 'mic'];
function av(look, size = 64, dance = false, cls = '') {
  if (!dance) return SP.img(look, size, 'idle', 'bob ' + cls);
  const k = UI.looks.push(look) - 1;
  const w = Math.round(size * SP.W / SP.H);
  return `<img class="px ${cls}" data-dk="${k}" src="${SP.url(look, POSES[(UI.frame + k) % POSES.length])}" width="${w}" height="${size}" alt="">`;
}
setInterval(() => { UI.frame++; document.querySelectorAll('img[data-dk]').forEach(el => { const l = UI.looks[+el.dataset.dk]; if (l) el.src = SP.url(l, POSES[(UI.frame + +el.dataset.dk) % POSES.length]); }); }, 380);
const won = KA.won, num = KA.num;
const bar = (v, cls = '') => `<div class="bar ${cls}"><i style="width:${clamp(v, 0, 100)}%"></i></div>`;
const B = (label, a, v = '', cls = '', dis = false) => `<button class="btn ${cls}" data-a="${a}" data-v="${esc(v)}"${dis ? ' disabled' : ''}>${label}</button>`;
const stars = v => '★'.repeat(Math.round(clamp(v, 0, 100) / 20)) + '☆'.repeat(5 - Math.round(clamp(v, 0, 100) / 20));
const fameP = fans => { const t = KA.fameTier(fans); return `<span class="pill" style="background:${D.FAME[t].c};color:#fff">${D.FAME[t].n}</span>`; };
function toast(t) { [...document.querySelectorAll('.toast')].forEach(x => { if (x.textContent === t) x.remove(); }); const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; const b = $('#toasts'); b.appendChild(el); while (b.children.length > 3) b.firstChild.remove(); setTimeout(() => el.remove(), 3200); }
function snd(f) { if (S && S.sound) SP.blip(f); }

// ------------------------------------------------------------------ render
function render() {
  UI.looks = [];
  const app = $('#app');
  if (!S) { app.innerHTML = titleScreen(); return; }
  const tabs = [['hq', '🏢', 'Agency'], ['trainees', '🌱', 'Trainees'], ['groups', '🌟', 'Artists'], ['charts', '📈', 'Charts'], ['sns', '💬', 'Fans'], ['biz', '💼', 'Business'], ['more', '⚙️', 'Menu']];
  const dot = { sns: S.hate.length || S.reqs.length, trainees: !!S.show, biz: S.mail.length || S.quests.list.some(x => !x.done && x.prog >= x.goal) };
  const winBody = UI.tab === 'hq' ? '' : { trainees: trTab, groups: grTab, charts: chTab, sns: snsTab, biz: bizTab, more: moreTab }[UI.tab]();
  const T = tabs.find(t => t[0] === UI.tab);
  const fans = S.groups.reduce((a, g) => a + (g.status === 'active' ? g.fans : 0), 0);
  const rk = KA.rank(S), f = S.groups.reduce((a, g) => a + g.fans, 0) + S.rep * 1000;
  const nx = D.RANKS[rk + 1], prog = nx ? (f - D.RANKS[rk].need) / (nx.need - D.RANKS[rk].need) * 100 : 100;
  app.innerHTML = `<header id="topbar"><div class="in">
    <div class="hud"><div class="hp date"><i>📅</i><span>${KA.date(S).replace(' · ', ' ').replace(' wk ', ' W')}</span></div><div class="hp money"><i>💰</i><span>${won(S.money)}</span></div><div class="hp fans"><i>💗</i><span>${num(fans)}</span></div></div>
    <div class="lvl"><b>Lv.${rk + 1}</b><div class="xp"><i style="width:${clamp(prog, 2, 100)}%"></i><span>${esc(D.RANKS[rk].n)}${nx ? ' → ' + esc(nx.n) : ''}</span></div></div></div></header>
  <main class="wrap game">${hqTab()}</main>
  ${winBody ? `<div class="win" data-a="winBg"><div class="win-in"><div class="win-head"><span>${T[1]} ${T[2]}</span><button class="xbtn" data-a="tab" data-v="hq" aria-label="Close">✕</button></div><div class="win-body">${winBody}</div></div></div>` : ''}
  <button class="btn big" id="next" data-a="next">Next week ▶</button>
  <nav id="tabs"><div class="in">${tabs.map(t => `<button class="tab ${UI.tab === t[0] ? 'on' : ''}" data-tab="${t[0]}" data-a="tab" data-v="${t[0]}"><span>${t[1]}</span>${t[2]}${dot[t[0]] ? '<i class="dot"></i>' : ''}</button>`).join('')}</div></nav>`;
  if (!S.tut.done) setTimeout(showTut, 30);
}

// ------------------------------------------------------------------ title
function titleScreen() {
  const slots = [1, 2, 3].map(n => {
    const s = readSlot(n);
    if (!s) return `<div class="li"><span class="rk">${n}</span><div class="grow"><b>Empty slot</b><br><small class="dim">Open a new agency</small></div>${B('New', 'newIn', n, 'sm')}</div>`;
    const top = (s.groups || []).filter(g => g.status === 'active').sort((a, b) => b.fans - a.fans)[0];
    return `<div class="li"><span class="rk">${n}</span><div class="grow"><b>${esc(s.agency)} Ent.</b><br><small class="dim">${top ? esc(top.name) + ' · ' + num(top.fans) + ' fans' : 'No debuted group yet'} · Year ${Math.floor(s.week / 48) + 1}${s.over ? ' · bankrupt' : ''}</small></div><div class="row" style="flex-wrap:nowrap">${B('Play', 'load', n, 'sm')}${B('✕', 'delSlot', n, 'ghost sm')}</div></div>`;
  }).join('');
  const hero = [{ g: 'f', skin: 0, hair: 1, hairC: 6, top: 'y2k', topC: 0, botC: 1, acc: 5, eye: 0 }, { g: 'm', skin: 1, hair: 1, hairC: 0, top: 'leather', topC: 3, botC: 2, acc: 0, eye: 1 }, { g: 'f', skin: 2, hair: 0, hairC: 7, top: 'sparkle', topC: 3, botC: 3, acc: 6, eye: 2 }, { g: 'm', skin: 0, hair: 7, hairC: 4, top: 'street', topC: 4, botC: 2, acc: 7, eye: 0 }, { g: 'f', skin: 1, hair: 5, hairC: 9, top: 'school', topC: 4, botC: 4, acc: 0, eye: 0 }];
  const d = UI.draft;
  const newForm = UI.newSlot ? `<section class="panel violet stack"><h2>Open your agency</h2>
    <label class="f">Agency name<input type="text" id="f-agency" maxlength="22" value="${esc(d.agency)}" placeholder="e.g. Starlight" data-in="agency" autocomplete="off"></label>
    <label class="f">Your CEO name<input type="text" id="f-ceo" maxlength="18" value="${esc(d.ceo)}" placeholder="e.g. Jordan" data-in="ceo" autocomplete="off"></label>
    <div class="f"><b style="font-size:13px">Difficulty</b><div class="row">${[['easy', 'Easy · ₩800M'], ['normal', 'Normal · ₩500M'], ['hard', 'Hard · ₩250M']].map(x => `<button class="chip ${d.diff === x[0] ? 'on' : ''}" data-a="draftDiff" data-v="${x[0]}">${x[1]}</button>`).join('')}</div></div>
    <div class="row">${B('Open the agency ▶', 'start', UI.newSlot, 'grow')}${B('Cancel', 'cancelNew', '', 'ghost')}</div></section>` : '';
  return `<div class="title-bg"><main class="wrap stack" style="padding-top:calc(22px + env(safe-area-inset-top,0px));padding-bottom:40px">
    <div class="hero">${hero.map((l, i) => av(l, i === 2 ? 96 : 80, true)).join('')}</div>
    <h1 class="logo"><small>Run your own</small>K-Pop<br>Idol Agency</h1>
    <p class="subtitle">scout → train → debut → daesang</p>
    ${newForm}
    <section class="panel"><h2>Save slots</h2><div class="list">${slots}</div></section>
    <section class="panel pink stack"><h2>How to play</h2>${HOWTO}</section>
    <div class="center"><button class="version" data-a="whatsNew">Version ${window.IA_BUILD} · ${esc(D.CHANGELOG[0].date)} · What's new</button></div>
    <p class="center dim"><small>Real K-pop groups appear on the charts, music shows and award nominations only. Agencies, trainees, award shows and music shows are fictional. This is an unofficial fan game.</small></p>
  </main></div>`;
}
const HOWTO = `<p style="margin:0">You are the CEO of a tiny agency. Every turn is one week.</p>
<ul style="margin:0;padding-left:18px">
<li><b>Build</b> rooms in your HQ and hire coaches.</li>
<li><b>Scout</b> trainees and set their weekly training. Monthly evaluations grade them F to A.</li>
<li><b>Send</b> trainees to the survival show, or debut a group straight away.</li>
<li><b>Plan</b> albums: concept, producer, line distribution, and a music video you direct shot by shot.</li>
<li><b>Book</b> schedules, make your own content, style your idols and go on world tours.</li>
<li><b>Answer</b> fan requests, survive hate trains, and beat real groups on the charts, music shows and the four year-end award shows.</li></ul>`;

// ------------------------------------------------------------------ HQ tab
function hqTab() {
  const roomPpl = id => {
    const ppl = [];
    for (const i of Object.values(S.idols)) {
      if (i.status === 'trainee') { const P = D.PLANS.find(p => p.id === i.plan); if ((P.room || 'practice') === id || (!P.room && id === 'practice')) ppl.push(i); }
      else if (i.status === 'idol' && id === 'practice') { const g = KA.group(S, i.gid); if (g && !g.tour) ppl.push(i); }
    }
    return ppl.slice(0, 7);
  };
  // Flat office floor plan: two rows of rooms with a hallway between them. It scrolls sideways.
  const top = ['office', 'studio', 'vocal', 'mvset', 'content'], bottom = ['practice', 'stylist', 'gym', 'dorm', 'lobby'];
  const deco = { office: ['🗄️', '🖥️', '🪴'], mvset: ['🎥', '💡', '🎬'], content: ['📹', '🛋️', '🎙️'], studio: ['🎛️', '🎹', '🎧'], stylist: ['👗', '🪞', '👠'], vocal: ['🎤', '🎼', '🔊'], practice: ['🪞', '🔊', '💿'], gym: ['🏋️', '🚴', '🥤'], dorm: ['🛏️', '🍜', '🧸'] };
  const room = id => {
    if (id === 'lobby') return `<div class="rm lobby"><span class="lbl">🚪 Lobby</span><div class="furn"><span>🛎️</span><span>🪴</span><span>🖼️</span></div><div class="ppl">${av({ g: 'f', skin: 0, hair: 3, hairC: 1, top: 'suit', topC: 1, botC: 2, acc: 0, eye: 2 }, 46)}</div></div>`;
    const R = D.ROOMS.find(r => r.id === id), lv = S.rooms[id];
    if (!lv) return `<div class="rm locked" data-a="room" data-v="${id}"><span class="lbl">${R.e} ${R.n}</span><span class="lock">🔒<br>${won(R.cost[0])}</span></div>`;
    const ppl = roomPpl(id).slice(0, 4);
    const ceo = id === 'office' ? av({ g: 'm', skin: 1, hair: 0, hairC: 0, top: 'suit', topC: 2, botC: 2, acc: 3, eye: 0 }, 46) + av(D.MANAGER.look, 46) : '';
    return `<div class="rm" style="--wall:${R.col}" data-a="room" data-v="${id}"><span class="lbl">${R.e} ${R.n}</span><span class="lv">Lv ${lv}</span><div class="furn">${deco[id].map(d => `<span>${d}</span>`).join('')}</div><div class="ppl">${ceo}${ppl.map(i => av(i.look, 46, id === 'practice' || id === 'stylist' || id === 'vocal')).join('')}</div></div>`;
  };
  const walkers = Object.values(S.idols).filter(i => i.status === 'idol' && !(KA.group(S, i.gid) || {}).tour).slice(0, 8);
  const hall = walkers.map((i, k) => `<span class="walker" style="animation-duration:${9 + (k * 3) % 7}s;animation-delay:-${k * 2.3}s">${av(i.look, 46)}</span>`).join('');
  const floors = `<div class="map"><div class="sign"><span>${esc(S.agency)} Entertainment</span></div>${top.map(room).join('')}<div class="hall">${hall || '<small class="dim">Debuted idols hang out in the hallway</small>'}</div>${bottom.map(room).join('')}</div>`;
  const cost = KA.monthlyCost(S);
  return `<div class="stack">
    <section class="office" id="bldg">${floors}</section><p class="center dim small" style="margin:-4px 0 0">← swipe to see every room · tap a room to upgrade →</p>
    <div class="trend" data-a="tab" data-v="biz"><b>🔥 TREND</b><span><b>${esc(KA.trend(S).n)}</b> concepts are hot · changes in ${S.trend.left} wk</span></div>
    <section class="panel lemon"><div class="between"><h2>📜 Monthly quests</h2>${B('Open', 'tab', 'biz', 'sm ghost')}</div>${questList(true)}</section>
    <section class="panel"><div class="between"><h2>Agency</h2><span class="pill gold">${esc(D.RANKS[KA.rank(S)].n)}</span></div>
      <div class="kpis"><div class="kpi"><b>${KA.trainees(S).length}/${KA.maxTrainees(S)}</b><small>Trainees</small></div><div class="kpi"><b>${KA.active(S).length}/${KA.maxGroups(S)}</b><small>Groups</small></div><div class="kpi"><b>${won(cost)}</b><small>Monthly bills</small></div></div>
      ${KA.debt(S) > 0 ? `<p class="small">Loans left: <b>${won(KA.debt(S))}</b></p>` : ''}${S.red ? `<p class="small bad"><b>In the red: month ${S.red} of 4.</b> Fix it before you go bankrupt!</p>` : ''}
      <div class="row" style="margin-top:8px">${B('🤝 Hire staff', 'staffMenu', '', 'sm alt')}${B('💼 Business & bank', 'tab', 'biz', 'sm lemon')}${B('📆 Calendar', 'calendar', '', 'sm sky')}</div></section>
    <section class="panel"><h2>Agency log</h2><div class="list">${S.log.slice(0, 8).map(l => `<div class="li"><span>${l.ic}</span><div class="grow small">${esc(l.t)}</div></div>`).join('')}</div></section>
  </div>`;
}

// ------------------------------------------------------------------ Trainees tab
function trTab() {
  const tr = KA.trainees(S).sort((a, b) => KA.overall(b) - KA.overall(a));
  const showCard = S.show ? `<section class="panel lemon"><div class="between"><h2>📺 ${esc(D.SHOW_NAME)}</h2><span class="pill hot">${esc((D.SHOW_EPISODES[S.show.ep] || {}).n || '')}</span></div>
    <p class="small" style="margin:0 0 6px">${esc((D.SHOW_EPISODES[S.show.ep] || {}).d || '')} Pick a storyline for each trainee. The episode airs when you tap Next week.</p>
    <div class="list">${S.show.ids.map(id => { const i = S.idols[id], out = S.show.out.includes(id); return `<div class="li">${av(i.look, 44)}<div class="grow"><b>${esc(i.name)}</b> ${out ? '<span class="pill red">Eliminated</span>' : ''}<br>${out ? '' : `<div class="row" style="gap:4px;margin-top:4px">${D.SHOW_FOCUS.map(f => `<button class="chip ${S.show.focus[id] === f.id ? 'on' : ''}" data-a="focus" data-v="${id}:${f.id}" title="${esc(f.d)}">${esc(f.n)}</button>`).join('')}</div>`}</div></div>`; }).join('')}</div></section>` : '';
  return `<div class="stack">
    <section class="panel"><div class="between"><h2>Trainees</h2><span class="dim small">${tr.length}/${KA.maxTrainees(S)}</span></div>
      <div class="row">${B('🔍 Scout', 'scoutMenu', '', 'sm')}${B('📺 Survival show', 'showMenu', '', 'sm sky', !!S.show)}${B('🌟 Debut a group', 'debutMenu', '', 'sm alt')}</div>
    </section>
    ${showCard}
    <section class="panel tr-list">${tr.length ? `<div class="list">${tr.map(i => `<div class="li tap" data-a="idol" data-v="${i.id}">${av(i.look, 52)}<div class="grow"><div class="between"><b>${esc(i.name)} <small class="dim">${i.flag} ${i.age}</small></b><span class="pill ${i.grade === 'A' ? 'gold' : ''}">${i.grade}</span></div>
      <div class="row small" style="gap:4px 10px"><span>OVR <b>${KA.overall(i)}</b></span><span>${esc(D.PLANS.find(p => p.id === i.plan).n)}</span>${i.rest ? '<span class="bad">resting</span>' : ''}${S.show && S.show.ids.includes(i.id) ? '<span class="pill hot">On TV</span>' : ''}</div>
      <div class="row" style="gap:6px;flex-wrap:nowrap"><small style="width:30px">Cond</small><div class="grow">${bar(i.cond, 'c')}</div><small style="width:34px">Mood</small><div class="grow">${bar(i.mood, 'l')}</div></div></div></div>`).join('')}</div>` : `<p class="center dim">No trainees yet. Tap <b>Scout</b> to hold your first audition.</p>`}</section>
  </div>`;
}

// ------------------------------------------------------------------ Groups tab
function grTab() {
  const gs = KA.active(S);
  if (!gs.length) return `<section class="panel center stack"><h2>No groups yet</h2><p>Train your trainees, then form a group from the Trainees tab. A group debuts when its first album comes out.</p>${B('🌟 Form a group', 'debutMenu', '', 'alt')}</section>`;
  if (!gs.some(g => g.id === UI.gsel)) UI.gsel = gs[0].id;
  const g = KA.group(S, UI.gsel), ms = KA.members(S, g).filter(m => m.status === 'idol');
  const up = S.albums.find(a => a.gid === g.id && a.status === 'upcoming');
  const rel = S.albums.filter(a => a.gid === g.id && a.status === 'out').reverse();
  const status = g.status === 'predebut' ? (up ? `<span class="pill hot">Debut next week!</span>` : `<span class="pill vio">Pre-debut</span>`) :
    g.hiatus ? `<span class="pill">On a break (${g.hiatus} wk)</span>` : g.tour ? `<span class="pill gold">On tour · stop ${g.tour.at + 1}/${g.tour.stops.length}</span>` : g.promo ? `<span class="pill hot">Promoting "${esc(S.albums.find(a => a.id === g.promo.aid).title)}"</span>` : up ? `<span class="pill hot">Comeback next week</span>` : `<span class="pill">Free</span>`;
  const hate = S.hate.find(h => h.gid === g.id);
  const brand = KA.brand(S).findIndex(r => r.gid === g.id) + 1;
  return `<div class="stack">
    ${gs.length > 1 ? `<div class="row">${gs.map(x => `<button class="chip ${x.id === g.id ? 'on' : ''}" data-a="gsel" data-v="${x.id}">${esc(x.name)}</button>`).join('')}</div>` : ''}
    <section class="panel" style="border-color:var(--line);background:linear-gradient(180deg,#fff, ${g.color}22)">
      <div class="between"><div><h2 style="font-size:24px">${esc(g.name)}</h2><small class="dim">Fandom: <b style="color:${g.color}">${esc(g.fandom)}</b> · ${g.gender === 'f' ? 'Girl group' : g.gender === 'm' ? 'Boy group' : 'Co-ed group'}${g.debut != null ? ' · debuted Y' + (Math.floor(g.debut / 48) + 1) : ''}</small></div><div class="center">${fameP(g.fans)}<br><span class="swatch" style="background:${g.color};width:18px;height:18px;margin-top:4px" title="Lightstick color"></span></div></div>
      <div class="stage-row">${ms.map(m => av(m.look, ms.length > 7 ? 56 : 70, true)).join('')}</div>
      <div class="row" style="justify-content:center;margin:6px 0">${status}${hate ? '<span class="pill red">Hate train!</span>' : ''}</div>
      <div class="kpis"><div class="kpi"><b>${num(g.fans)}</b><small>Fans</small></div><div class="kpi"><b>${g.wins}</b><small>Music show wins</small></div><div class="kpi"><b>${brand ? '#' + brand : '-'}</b><small>Brand rank</small></div></div>
      <div class="row" style="gap:6px;margin-top:8px;flex-wrap:nowrap"><small style="width:70px">Fan trust</small><div class="grow">${bar(g.trust, 'v')}</div><small style="width:70px">Condition</small><div class="grow">${bar(KA.groupCond(S, g), 'c')}</div></div>
    </section>
    <section class="panel"><h2>This week</h2>
      ${g.status === 'predebut' ? `<p class="small">Plan the debut album. The group debuts the week it comes out.</p>${up ? '<p><b>Debut is set for next week!</b></p>' : B('💿 Plan debut album', 'albumNew', g.id, 'block')}` : `
      <div class="grid2">${B('📅 Schedules' + (g.sched.length ? ` (${g.sched.length})` : ''), 'schedMenu', g.id, 'sm')}${B('💿 New album', 'albumNew', g.id, 'sm alt', !!up)}${B('📹 Own content', 'contentMenu', g.id, 'sm sky')}${B('🌍 World tour', 'tourMenu', g.id, 'sm mint')}${B('👗 Stylist', 'styleGroup', g.id, 'sm lemon')}${B('🎤 Rehearse live', 'rehearse', g.id, 'sm ghost', !g.promo || g.flags.rehearsed === S.week)}${B('🎬 Solo jobs' + (ms.filter(m => m.solo).length ? ` (${ms.filter(m => m.solo).length})` : ''), 'soloMenu', g.id, 'sm alt')}${B('🍖 Team dinner', 'dinner', g.id, 'sm red', g.dinner === S.week)}${B('🏖️ Vacation', 'vacation', g.id, 'sm sky', !!(g.promo || g.tour || g.hiatus))}${B('🛍️ Merch & fan club', 'tab', 'biz', 'sm mint')}</div>
      ${g.deal ? `<p class="small" style="margin:8px 0 0">🤝 ${esc(g.deal.brand)} campaign · ${g.deal.left} week${g.deal.left > 1 ? 's' : ''} left</p>` : ''}
      ${g.sched.length ? `<p class="small" style="margin:8px 0 0">Booked: ${g.sched.map(id => { const s = D.SCHEDULES.find(x => x.id === id); return s.e + ' ' + esc(s.n); }).join(', ')}</p>` : ''}
      ${g.content ? `<p class="small" style="margin:6px 0 0">Filming: <b>${esc(D.CONTENT.find(c => c.id === g.content.id).n)}</b> · ${g.content.left} week${g.content.left > 1 ? 's' : ''} left</p>` : ''}
      ${g.tour ? `<p class="small" style="margin:6px 0 0">Next tour stop: <b>${esc(g.tour.stops[g.tour.at].city)}</b></p>` : ''}`}
    </section>
    <section class="panel"><h2>Members</h2><div class="list">${ms.map(m => `<div class="li tap" data-a="idol" data-v="${m.id}">${av(m.look, 46)}<div class="grow"><b>${esc(m.name)}</b> <small class="dim">${m.flag}</small>${m.solo ? ` <span class="pill vio">${D.SOLO.find(j => j.id === m.solo).e} solo</span>` : ''}<br><small class="dim">${esc(m.pos)}</small></div><div style="width:80px">${bar(m.cond, 'c')}<small class="dim">OVR ${KA.overall(m)}</small></div></div>`).join('')}</div></section>
    ${g.status === 'active' ? popPanel(g, ms) : ''}
    ${rel.length ? `<section class="panel"><h2>Discography</h2><div class="list">${rel.map(a => `<div class="li"><span style="font-size:24px">💿</span><div class="grow"><b>${esc(a.title)}</b> <small class="dim">${esc(D.ALBUM_TYPES.find(t => t.id === a.type).n)}</small><br><small class="dim">Peak #${a.peak < 99 ? a.peak : '-'} · ${num(a.sales)} sold · ${num(a.mv.views)} views · ${a.wins} wins</small></div>${B('▶ MV', 'replayMV', a.id, 'sm ghost')}</div>`).join('')}</div></section>` : ''}
    ${g.status === 'active' ? `<div class="row">${B('Disband group', 'disband', g.id, 'sm ghost')}</div>` : ''}
  </div>`;
}

// ------------------------------------------------------------------ Charts tab
function chTab() {
  const segs = [['chart', 'Weekly chart'], ['brand', 'Brand reputation'], ['awards', 'Awards'], ['ach', 'Trophies']];
  let body = '';
  if (UI.chart === 'chart') body = `<p class="small dim" style="margin:0 0 6px">Melody Wave Top 30 · week ${KA.woy(S)}</p><div class="list">${S.chart.map((r, k) => { const mv = r.last ? r.last - (k + 1) : null; return `<div class="li ${r.us ? 'me' : ''}"><span class="rk">${k + 1}</span><div class="grow"><b>${esc(r.s)}</b><br><small class="dim">${esc(r.n)}${r.rival ? ' · ' + esc((S.rivals.find(x => x.n === r.n) || {}).ag || '') : ''}</small></div><small class="${mv > 0 ? 'good' : mv < 0 ? 'bad' : 'dim'}">${r.last == null ? 'NEW' : mv > 0 ? '▲' + mv : mv < 0 ? '▼' + (-mv) : '–'}</small></div>`; }).join('')}</div>`;
  if (UI.chart === 'brand') body = `<p class="small dim" style="margin:0 0 6px">Idol group brand reputation ranking this month</p><div class="list">${KA.brand(S).slice(0, 25).map((r, k) => `<div class="li ${r.us ? 'me' : ''}"><span class="rk">${k + 1}</span><div class="grow"><b>${esc(r.n)}</b></div><small>${num(r.v)}</small></div>`).join('')}</div>`;
  if (UI.chart === 'awards') body = `${D.AWARDS.map(A => `<div class="li"><span style="font-size:22px">🏆</span><div class="grow"><b>${esc(A.n)}</b> <small class="dim">(${A.short}) · ${esc(A.where)} · Dec</small><br><small class="dim">${esc(A.d)}</small></div></div>`).join('')}<h3 style="margin-top:10px">Your trophies</h3>${S.awards.length ? `<div class="list">${S.awards.slice().reverse().map(a => `<div class="li"><span>🏆</span><div class="grow small"><b>${esc(a.cat)}</b> · ${esc(a.show)} Y${a.y}<br><span class="dim">${esc(a.g)}</span></div></div>`).join('')}</div>` : '<p class="dim small">No awards yet. Award season is every December.</p>'}`;
  if (UI.chart === 'ach') body = `<p class="small dim">${Object.keys(S.ach).length}/${D.ACH.length} unlocked</p><div class="list">${D.ACH.map(a => `<div class="li"><span style="font-size:20px;${S.ach[a.id] != null ? '' : 'filter:grayscale(1);opacity:.4'}">🏅</span><div class="grow"><b>${esc(a.n)}</b><br><small class="dim">${esc(a.d)}</small></div></div>`).join('')}</div>`;
  return `<div class="stack"><div class="row">${segs.map(s => `<button class="chip ${UI.chart === s[0] ? 'on' : ''}" data-a="chartSeg" data-v="${s[0]}">${s[1]}</button>`).join('')}</div><section class="panel">${body}</section></div>`;
}

// ------------------------------------------------------------------ SNS tab
function snsTab() {
  const hate = S.hate.map(h => { const g = KA.group(S, h.gid), H = D.HATE.find(x => x.id === h.type); return `<section class="panel" style="background:#fff0f0"><div class="between"><h2>⚠️ ${esc(H.n)}</h2><span class="pill red">Heat ${Math.round(h.heat)}</span></div>
    <p style="margin:0 0 6px">${esc(h.text)}</p>${bar(h.heat)}<p class="small dim" style="margin:6px 0">${esc(g.name)} · fan trust ${Math.round(g.trust)} · tried: ${h.tried.length ? h.tried.map(t => esc((D.HATE_RESP.find(r => r.id === t) || { n: t }).n)).join(', ') : 'nothing yet'}</p>
    <div class="stack" style="gap:6px">${KA.hateResponses(S, h).map(r => `<button class="btn sm ghost" style="justify-content:flex-start;text-align:left" data-a="hateResp" data-v="${h.id}:${r.id}"><span><b>${esc(r.n)}</b><br><small style="font-family:var(--body)">${esc(r.d)}</small></span></button>`).join('')}</div></section>`; }).join('');
  const reqs = S.reqs.map(r => { const g = KA.group(S, r.gid), T = D.REQUESTS.find(x => x.id === r.type); const c = T.cost; const cost = c.money ? won(c.money) : c.cond ? `-${c.cond} condition` : c.rest ? 'Clears this week\'s schedules' : 'Free'; return `<div class="li"><span style="font-size:22px">💌</span><div class="grow"><small class="dim">${esc(g.fandom)} → ${esc(g.name)} · ${r.exp - S.week} wk left</small><br><b>${esc(r.t)}</b><br><small class="dim">Cost: ${cost}</small></div><div class="stack" style="gap:4px">${B('Yes', 'req', r.id + ':1', 'sm mint')}${B('No', 'req', r.id + ':0', 'sm ghost')}</div></div>`; }).join('');
  return `<div class="stack">${hate}
    <section class="panel pink"><h2>💌 Fan requests</h2>${reqs ? `<div class="list">${reqs}</div>` : '<p class="dim small">No requests right now. Debuted groups get requests from fans.</p>'}</section>
    <section class="panel"><h2>Bubbler feed</h2><div class="feed">${S.feed.length ? S.feed.slice(0, 25).map(p => `<div class="post ${p.mood}"><div class="h">@${esc(p.h)} <small class="dim">· ${num(p.likes)} ♥</small></div><div class="t">${esc(p.t)}</div></div>`).join('') : '<p class="dim small">Quiet for now.</p>'}</div></section></div>`;
}

// ------------------------------------------------------------------ More tab
function questList(short) {
  const Q = S.quests; if (!Q) return '';
  return `<div class="list">${Q.list.map((x, k) => `<div class="li"><span style="font-size:20px">${x.done ? '✅' : '📜'}</span><div class="grow"><b class="small">${esc(x.t)}</b>${bar(x.prog / x.goal * 100, 'l')}<small class="dim">${x.prog}/${x.goal} · reward ${won(x.reward)}</small></div>${x.done ? '<span class="pill mint">Done</span>' : B('Claim', 'claim', k, 'sm mint', x.prog < x.goal)}</div>`).join('')}</div>${short ? '' : '<p class="small dim" style="margin:6px 0 0">New quests every month.</p>'}`;
}
function popPanel(g, ms) {
  const pop = ms.slice().sort((a, b) => b.fans - a.fans), top = Math.max(1, pop[0] ? pop[0].fans : 1);
  const pairs = []; for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) pairs.push([ms[i], ms[j], KA.bond(S, ms[i].id, ms[j].id)]);
  pairs.sort((a, b) => b[2] - a[2]);
  const pr = p => `<div class="li small"><b class="grow">${esc(p[0].name.split(' ').pop())} & ${esc(p[1].name.split(' ').pop())}</b><div style="width:90px">${bar(p[2], p[2] >= 50 ? 'c' : '')}</div><b style="width:28px;text-align:right">${Math.round(p[2])}</b></div>`;
  return `<section class="panel"><h2>🗳️ Member popularity poll</h2><div class="list">${pop.map((m, k) => `<div class="li"><span class="rk">${k + 1}</span>${av(m.look, 36)}<div class="grow"><b class="small">${esc(m.name)}</b>${bar(m.fans / top * 100, 'v')}</div><small>${num(m.fans)}</small></div>`).join('')}</div></section>
  <section class="panel"><div class="between"><h2>💞 Member bonds</h2><span class="pill ${KA.chem(S, g) >= 55 ? 'mint' : ''}">Chemistry ${Math.round(KA.chem(S, g))}</span></div><p class="small dim" style="margin:0 0 4px">Good chemistry raises live stage scores. Team dinners help.</p><div class="list">${pairs.slice(0, 3).map(pr).join('')}${pairs.length > 3 ? pr(pairs[pairs.length - 1]) : ''}</div></section>
  <section class="panel"><h2>🌍 Global fanbase</h2><div class="stack" style="gap:6px">${D.REGIONS.map(r => `<div class="row" style="flex-wrap:nowrap"><small style="width:110px">${esc(r.n)}</small><div class="grow">${bar(g.reg[r.id], 'c')}</div><b style="width:30px;text-align:right">${Math.round(g.reg[r.id])}</b></div>`).join('')}</div></section>`;
}
function bizTab() {
  const gs = KA.debuted(S);
  const mail = S.mail.map(m => `<div class="li"><span style="font-size:24px">${m.kind === 'gift' ? '🎁' : '💌'}</span><div class="grow"><small class="dim">${esc(m.from)}${m.exp ? ` · ${m.exp - S.week} wk left` : ''}</small><br><b>${esc(m.t)}</b><br><small>${esc(m.b)}</small></div><div class="stack" style="gap:4px">${m.kind === 'gift' ? B('Claim', 'mail', m.id + ':1', 'sm mint') : B('Accept', 'mail', m.id + ':1', 'sm mint') + B('No', 'mail', m.id + ':0', 'sm ghost')}</div></div>`).join('');
  const merch = gs.map(g => { g.merch = g.merch || {}; const t = KA.fameTier(g.fans); return `<h3 style="margin-top:8px">${esc(g.name)} <small class="dim">· ~${won(KA.merchWeekly(S, g))}/week</small></h3><div class="list">${D.MERCH.map(M => `<div class="li"><span style="font-size:22px">${M.e}</span><div class="grow"><b class="small">${esc(M.n)}</b><br><small class="dim">${g.merch[M.id] ? 'On sale' : M.fame > t ? '🔒 ' + D.FAME[M.fame].n + ' fame' : won(M.cost) + ' to launch'}</small></div>${g.merch[M.id] ? '<span class="pill mint">Selling</span>' : B('Launch', 'merch', g.id + ':' + M.id, 'sm', M.fame > t || S.money < M.cost)}</div>`).join('')}</div>`; }).join('');
  const clubs = gs.map(g => `<div class="li"><span style="font-size:22px">💳</span><div class="grow"><b>${esc(g.fandom)} fan club</b><br><small class="dim">${g.club ? `${num(g.club.members)} members · ${won(KA.clubMonthly(g))}/month` : 'Paid memberships every month, and fans trust you more. Needs Rookie fame.'}</small></div>${g.club ? '<span class="pill mint">Open</span>' : B('Launch ₩20M', 'club', g.id, 'sm', KA.fameTier(g.fans) < 1 || S.money < 2e7)}</div>`).join('');
  const biz = D.BIZ.map(Bz => { const lv = S.biz[Bz.id] || 0, c = KA.bizCost(S, Bz.id), lock = KA.rank(S) < Bz.rank; return `<div class="li"><span style="font-size:22px">${Bz.e}</span><div class="grow"><b class="small">${esc(Bz.n)}</b> ${lv ? `<span class="pill vio">Lv ${lv}</span>` : ''}<br><small class="dim">${lock ? '🔒 ' + esc(D.RANKS[Bz.rank].n) : `${lv ? won(Bz.income[lv - 1]) + '/month now' : 'Earns ' + won(Bz.income[0]) + '/month'}${Bz.fans ? ' · grows fans' : ''}`}</small></div>${c == null ? '<span class="pill gold">Max</span>' : B(`${lv ? 'Expand' : 'Open'} ${won(c)}`, 'bizBuy', Bz.id, 'sm alt', lock || S.money < c)}</div>`; }).join('');
  const bank = `${S.loans.length ? `<div class="list">${S.loans.map((l, k) => `<div class="li"><span>🏦</span><div class="grow"><b class="small">${esc(l.n)}</b><br><small class="dim">${won(l.left)} left · ${won(l.pay)}/month</small></div>${B('Pay off', 'repay', k, 'sm ghost', S.money < l.left)}</div>`).join('')}</div>` : '<p class="small dim">No loans.</p>'}
    <div class="list">${D.LOANS.map(L => `<div class="li"><div class="grow"><b class="small">${esc(L.n)}</b><br><small class="dim">${KA.rank(S) < L.rank ? '🔒 ' + esc(D.RANKS[L.rank].n) : `Get ${won(L.amt)} · repay ${won(L.amt * (1 + L.rate))} over ${L.months} months`}</small></div>${B('Borrow', 'loan', L.id, 'sm lemon', KA.rank(S) < L.rank || S.loans.some(l => l.id === L.id))}</div>`).join('')}</div>`;
  return `<div class="stack">
    <div class="kpis"><div class="kpi"><b>${won(KA.monthlyCost(S))}</b><small>Monthly bills</small></div><div class="kpi"><b>${won(KA.bizMonthly(S) + gs.reduce((a, g) => a + KA.clubMonthly(g) + KA.merchWeekly(S, g) * 4, 0))}</b><small>Monthly side income</small></div><div class="kpi"><b class="${S.red ? 'bad' : ''}">${S.red ? S.red + '/4' : 'OK'}</b><small>Red months</small></div></div>
    <section class="panel lemon"><h2>📜 Monthly quests</h2>${questList()}</section>
    <section class="panel pink"><h2>📬 Mailbox</h2>${mail ? `<div class="list">${mail}</div>` : '<p class="small dim">No mail. Brands send offers to debuted groups.</p>'}</section>
    <section class="panel"><h2>🛍️ Merch shop</h2>${merch || '<p class="small dim">Debut a group to sell merch.</p>'}</section>
    <section class="panel"><h2>💳 Fan clubs</h2>${clubs ? `<div class="list">${clubs}</div>` : '<p class="small dim">Debut a group first.</p>'}</section>
    <section class="panel"><h2>🏢 Side businesses</h2><p class="small dim" style="margin:0">They pay out at the start of every month.</p><div class="list">${biz}</div></section>
    <section class="panel mint"><h2>🏦 Bank</h2><p class="small dim" style="margin:0 0 4px">Four month-ends in a row in the red means bankruptcy. Loans keep you afloat.</p>${bank}</section>
  </div>`;
}
function soloMenu(gid) {
  const g = KA.group(S, gid), ms = KA.members(S, g).filter(m => m.status === 'idol');
  modal(`${head(g.name, 'Solo jobs this week')}<p class="small">Each member can take one solo job a week. Jobs unlock as their skills grow. They earn money and personal fans.</p>
    ${ms.map(m => `<div class="panel violet" style="margin-top:8px;padding:10px"><div class="row" style="flex-wrap:nowrap">${av(m.look, 44)}<div class="grow"><b>${esc(m.name)}</b><br><small class="dim">${num(m.fans)} personal fans · condition ${Math.round(m.cond)}</small></div></div>
      <div class="row" style="gap:4px;margin-top:6px">${D.SOLO.map(J => { const ok = KA.soloOK(S, m, J); return `<button class="chip ${m.solo === J.id ? 'on' : ''} ${ok ? '' : 'lock'}" data-a="solo" data-v="${m.id}:${J.id}" title="${esc(J.stat)} ${J.need}">${J.e} ${esc(J.n)}${ok ? '' : ' 🔒'}</button>`; }).join('')}</div></div>`).join('')}
    ${closeBtn('Done')}`);
}
function calendarModal() {
  const ev = KA.calendar(S);
  modal(`${head('Calendar', 'Coming up')}<div class="list">${ev.map(e => `<div class="li"><span style="font-size:22px">${e.e}</span><div class="grow"><b class="small">${esc(e.t)}</b><br><small class="dim">${e.at === S.week ? 'This week' : e.at - S.week === 1 ? 'Next week' : 'In ' + (e.at - S.week) + ' weeks'}</small></div></div>`).join('')}</div>${closeBtn()}`);
}
function moreTab() {
  return `<div class="stack"><section class="panel stack"><h2>Menu</h2>
    ${B('💾 Save & quit to title', 'quit', '', 'block')}
    ${B('🎓 Replay the tutorial', 'tutAgain', '', 'block alt')}
    ${B('✨ What\'s new', 'whatsNew', '', 'block sky')}
    ${B(S.sound ? '🔊 Sound on' : '🔇 Sound off', 'sound', '', 'block ghost')}
    <button class="version" data-a="whatsNew">Version ${window.IA_BUILD} · ${esc(D.CHANGELOG[0].date)}</button></section>
    <section class="panel"><h2>Stats</h2><div class="kpis"><div class="kpi"><b>${num(S.stats.sold)}</b><small>Albums sold</small></div><div class="kpi"><b>${S.stats.wins}</b><small>Wins</small></div><div class="kpi"><b>${S.awards.length}</b><small>Awards</small></div></div></section>
    <section class="panel pink stack"><h2>How to play</h2>${HOWTO}</section>
    <section class="panel"><h2>Full log</h2><div class="list">${S.log.slice(0, 60).map(l => `<div class="li"><span>${l.ic}</span><div class="grow small"><span class="dim">Y${Math.floor(l.w / 48) + 1} </span>${esc(l.t)}</div></div>`).join('')}</div></section></div>`;
}

// ------------------------------------------------------------------ modals
function modal(html) { $('#sheet').innerHTML = html; $('#modal').classList.add('on'); $('#sheet').scrollTop = 0; }
function closeModal() { $('#modal').classList.remove('on'); $('#sheet').innerHTML = ''; if (UI.stopAnim) { UI.stopAnim(); UI.stopAnim = null; } if (UI.stopSnd) { UI.stopSnd(); UI.stopSnd = null; } }
const head = (kick, title) => `<div class="kick">${esc(kick)}</div><h2>${title}</h2>`;
const closeBtn = (label = 'Close') => `<div class="btns">${B(label, 'close', '', 'block ghost')}</div>`;

function idolModal(id) {
  const i = S.idols[id]; if (!i) return;
  const T = D.TRAITS.find(t => t.id === i.trait), g = i.gid ? KA.group(S, i.gid) : null;
  const tr = i.status === 'trainee';
  modal(`${head(tr ? 'Trainee' : g ? g.name : 'Idol', esc(i.name))}
    <div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="center" style="background:#f4eeff;border:3px solid var(--line);padding:6px 10px">${av(i.look, 110, true)}</div>
    <div class="grow stack" style="gap:4px"><small>${i.flag} ${esc(i.nat)} · age ${i.age}${tr ? ` · ${Math.floor(i.weeks / 4)} months trained` : ' · ' + esc(i.pos)}</small>
      <small><b>Trait:</b> ${i.traitKnown ? `${esc(T.n)}<br><span class="dim">${esc(T.d)}</span>` : '??? <span class="dim">(revealed with training)</span>'}</small>
      ${tr ? `<small><b>Grades:</b> ${i.grades.length ? i.grades.slice(-8).join(' ') : 'no evaluation yet'}</small>` : `<small><b>Personal fans:</b> ${num(i.fans)}</small>`}
      <small><b>Potential:</b> ${stars(i.pot)}</small>
    </div></div>
    <div class="stack" style="gap:5px;margin-top:10px">${D.STATS.map(s => `<div class="row" style="flex-wrap:nowrap;gap:8px"><small style="width:76px">${s.e} ${s.n}</small><div class="grow">${bar(i.stats[s.id])}</div><b style="width:24px;text-align:right">${Math.round(i.stats[s.id])}</b></div>`).join('')}
    <div class="row" style="flex-wrap:nowrap;gap:8px"><small style="width:76px">❤️ Condition</small><div class="grow">${bar(i.cond, 'c')}</div><b style="width:24px;text-align:right">${Math.round(i.cond)}</b></div>
    <div class="row" style="flex-wrap:nowrap;gap:8px"><small style="width:76px">😊 Mood</small><div class="grow">${bar(i.mood, 'l')}</div><b style="width:24px;text-align:right">${Math.round(i.mood)}</b></div></div>
    ${tr ? `<h3 style="margin-top:12px">Weekly training</h3><div class="row" style="gap:6px;margin-top:6px">${D.PLANS.map(p => `<button class="chip ${i.plan === p.id ? 'on' : ''}" data-a="plan" data-v="${i.id}:${p.id}">${esc(p.n)}</button>`).join('')}</div>` : ''}
    <div class="btns">${B('🎵 Practice session (mini-game)', 'practice', i.id, 'block sky', i.pw === S.week)}${B('👗 Stylist', 'style', i.id, 'block lemon')}${tr ? B('Release from the agency', 'releaseIdol', i.id, 'block ghost') : ''}${B('Close', 'close', '', 'block ghost')}</div>`);
}

// ---------- scouting
function scoutMenu() {
  modal(`${head('Scouting', 'Hold an audition')}<p class="small">One audition per week. You pick who to sign afterwards.</p>
    <div class="row" style="margin-bottom:8px">${[['any', 'Anyone'], ['f', 'Girls'], ['m', 'Boys']].map(x => `<button class="chip ${UI.scoutG === x[0] ? 'on' : ''}" data-a="scoutG" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
    <div class="list">${KA.SCOUTS.map(s => { const lock = (s.rank || 0) > KA.rank(S); return `<div class="li"><div class="grow"><b>${esc(s.n)}</b> <small class="dim">${won(s.cost)}</small><br><small class="dim">${lock ? '🔒 Needs ' + esc(D.RANKS[s.rank].n) : esc(s.d)}</small></div>${B('Go', 'scout', s.id, 'sm', lock || S.money < s.cost || S.flags.scoutWeek === S.week)}</div>`; }).join('')}</div>${closeBtn()}`);
}
function scoutResults() {
  modal(`${head('Audition results', 'Who will you sign?')}<p class="small dim">Stats are what the judges saw. Hidden traits show up during training.</p>
    <div class="list">${S.scouted.map(i => `<div class="li">${av(i.look, 56)}<div class="grow"><b>${esc(i.name)}</b> <small class="dim">${i.flag} ${i.age}</small><br><small>${D.STATS.map(s => `${s.e}${Math.round(i.stats[s.id])}`).join(' ')}</small><br><small class="dim">Potential ${stars(i.pot)}</small></div>${B('Sign', 'sign', i.id, 'sm mint')}</div>`).join('') || '<p class="dim">Everyone has been signed or sent home.</p>'}</div>${closeBtn('Done')}`);
}

// ---------- staff and rooms
function roomModal(id) {
  const R = D.ROOMS.find(r => r.id === id), lv = S.rooms[id], c = KA.roomCost(S, id);
  modal(`${head('HQ', R.e + ' ' + esc(R.n))}<p>${esc(R.d)}</p><p><b>Level ${lv}</b> of 5</p>${bar(lv * 20, 'v')}
    <div class="btns">${c != null ? B(`${lv ? 'Upgrade' : 'Build'} for ${won(c)}`, 'upgrade', id, 'block', S.money < c) : '<p class="center"><b>Fully upgraded!</b></p>'}${lv && !(id === 'office' && lv <= 1) ? B(`Sell one level for ${won(Math.round(R.cost[lv - 1] * .5 || 5e6))}`, 'sellRoom', id, 'block ghost') : ''}${B('Close', 'close', '', 'block ghost')}</div>`);
}
function staffMenu() {
  modal(`${head('HQ', 'Hire staff')}<p class="small dim">One-time signing fee, then a monthly salary.</p><div class="list">${D.STAFF.map(s => { const lv = S.staff[s.id] || 0, c = KA.staffCost(S, s.id); return `<div class="li"><div class="grow"><b>${esc(s.n)}</b> ${lv ? `<span class="pill vio">${D.STAFF_LV[lv]}</span>` : ''}<br><small class="dim">${esc(s.d)} Salary ${won(s.pay * Math.max(1, lv))}/mo per level.</small></div>${c != null ? B(lv ? `Upgrade ${won(c)}` : `Hire ${won(c)}`, 'hire', s.id, 'sm', S.money < c) : '<span class="pill gold">Max</span>'}</div>`; }).join('')}</div>${closeBtn()}`);
}

// ---------- survival show
function showMenu() {
  UI.pick = UI.pick || [];
  const tr = KA.trainees(S).filter(i => i.weeks >= 4);
  modal(`${head('Survival show', esc(D.SHOW_NAME))}<p class="small">100 trainees from every agency. Seven weekly episodes, two eliminations and a live finale. The final 9 make the lineup, and your trainees who make it can debut with a huge head start. Entry fee: ₩10M per trainee. Up to 6, all girls or all boys.</p>
    ${tr.length ? `<div class="list">${tr.map(i => `<div class="li tap" data-a="pick" data-v="${i.id}">${av(i.look, 44)}<div class="grow"><b>${esc(i.name)}</b> <small class="dim">OVR ${KA.overall(i)} · ${i.g === 'f' ? 'girl' : 'boy'}</small></div><span class="pill ${UI.pick.includes(i.id) ? 'hot' : ''}">${UI.pick.includes(i.id) ? '✓ Entered' : 'Tap to enter'}</span></div>`).join('')}</div>` : '<p class="dim">You need trainees with at least a month of training.</p>'}
    <div class="btns">${B(`Enter ${UI.pick.length} trainee${UI.pick.length === 1 ? '' : 's'} · ${won(1e7 * UI.pick.length)}`, 'joinShow', '', 'block', !UI.pick.length)}${B('Close', 'close', '', 'block ghost')}</div>`);
}

// ---------- group formation
function debutMenu(pre) {
  if (KA.active(S).length >= KA.maxGroups(S)) { modal(`${head('Debut', 'No room for another group')}<p>Upgrade the CEO office to run more groups at once (level 2 = 2 groups, level 4 = 3 groups).</p>${closeBtn()}`); return; }
  UI.gf = UI.gf && !pre ? UI.gf : { members: pre || [], name: '', fandom: '', color: '#ff4f9a', concept: 'teen', project: !!pre };
  gfRender();
}
const LIGHT = ['#ff4f9a', '#8b5cf6', '#38b6ff', '#1fbf8f', '#ffc93c', '#ff6b6b', '#2a1d3a', '#ff9f43', '#c0c4d6', '#00c2c7'];
function gfRender() {
  const f = UI.gf, tr = KA.trainees(S).filter(i => !(S.show && S.show.ids.includes(i.id)));
  const ms = f.members.map(id => S.idols[id]).filter(Boolean);
  modal(`${head('Debut', 'Form a group')}
    <label class="f">Group name<input type="text" id="g-name" maxlength="18" data-in="gf.name" value="${esc(f.name)}" placeholder="e.g. LUMINA" autocomplete="off"></label>
    <label class="f" style="margin-top:8px">Fandom name<input type="text" id="g-fandom" maxlength="18" data-in="gf.fandom" value="${esc(f.fandom)}" placeholder="e.g. Lumis" autocomplete="off"></label>
    <div class="f" style="margin-top:8px"><b style="font-size:13px">Lightstick color</b><div class="row">${LIGHT.map(c => `<span class="swatch ${f.color === c ? 'on' : ''}" style="background:${c}" data-a="gfColor" data-v="${c}"></span>`).join('')}</div></div>
    <div class="f" style="margin-top:8px"><b style="font-size:13px">Starting concept</b><div class="row">${D.CONCEPTS.map(c => `<button class="chip ${f.concept === c.id ? 'on' : ''}" data-a="gfConcept" data-v="${c.id}">${esc(c.n)}</button>`).join('')}</div></div>
    <h3 style="margin-top:12px">Members (${ms.length})</h3>
    <div class="stage-row">${ms.map(m => av(m.look, 56, true)).join('') || '<small class="dim">Tap trainees below to add them</small>'}</div>
    ${ms.length >= 2 ? `<div class="list">${Object.entries(KA.autoPos(ms)).map(([id, p]) => `<div class="li small"><b>${esc(S.idols[id].name)}</b><span class="dim grow" style="text-align:right">${esc(p)}</span></div>`).join('')}</div>` : ''}
    <div class="list">${tr.map(i => `<div class="li tap" data-a="gfPick" data-v="${i.id}">${av(i.look, 40)}<div class="grow"><b>${esc(i.name)}</b> <small class="dim">OVR ${KA.overall(i)} · 🎤${Math.round(i.stats.vocal)} 💃${Math.round(i.stats.dance)} 🔥${Math.round(i.stats.rap)} ✨${Math.round(i.stats.visual)}</small></div><span class="pill ${f.members.includes(i.id) ? 'hot' : ''}">${f.members.includes(i.id) ? '✓' : '+'}</span></div>`).join('')}</div>
    <div class="btns">${B('Form the group ▶', 'gfMake', '', 'block', ms.length < 2)}${B('Close', 'close', '', 'block ghost')}</div>`);
}

// ---------- album wizard
function albumNew(gid) {
  const g = KA.group(S, gid);
  UI.al = { gid, step: 1, type: g.status === 'predebut' ? 'single' : 'mini', concept: g.concept, genre: 'dance', producer: S.staff.producer ? 'intern' : 'free', title: KA.titleIdea(), set: 'neon', story: 'none', shots: ['wide', 'close', 'wide', 'oneshot', 'cgi', 'fairy'], budget: 1, lines: null, challenge: true };
  UI.al.lines = KA.defaultLines(S, g, 'dance');
  alRender();
}
function alRender() {
  const a = UI.al, g = KA.group(S, a.gid), ms = KA.members(S, g).filter(m => m.status === 'idol');
  const cost = KA.albumCost(S, a);
  const steps = ['Album', 'Lines', 'Music video', 'Review'];
  const nav = `<div class="row" style="gap:4px;margin-bottom:8px">${steps.map((s, k) => `<span class="pill ${a.step === k + 1 ? 'hot' : ''}">${k + 1}. ${s}</span>`).join('')}</div>`;
  let body = '';
  if (a.step === 1) body = `
    <label class="f">Title track<div class="row" style="flex-wrap:nowrap"><input type="text" id="al-title" maxlength="28" data-in="al.title" value="${esc(a.title)}" autocomplete="off">${B('🎲', 'alRoll', '', 'sm ghost')}</div></label>
    <h3 style="margin-top:10px">Format</h3><div class="row">${D.ALBUM_TYPES.map(t => `<button class="chip ${a.type === t.id ? 'on' : ''}" data-a="alSet" data-v="type:${t.id}">${esc(t.n)} · ${won(t.cost)}</button>`).join('')}</div>
    <h3 style="margin-top:10px">Concept</h3><div class="row">${D.CONCEPTS.map(c => `<button class="chip ${a.concept === c.id ? 'on' : ''}" data-a="alSet" data-v="concept:${c.id}">${c.id === S.trend.c ? '🔥 ' : ''}${esc(c.n)}</button>`).join('')}</div>
    <p class="small" style="margin:4px 0 0">🔥 Trending now: <b>${esc(KA.trend(S).n)}</b>. Matching the trend boosts quality, hype and pre-orders.</p>
    <p class="small dim" style="margin:4px 0 0">Outfit fit for this concept: <b>${Math.round(KA.conceptFit(S, g, a.concept) * 100)}%</b> of members. Change outfits in the stylist room.</p>
    <h3 style="margin-top:10px">Genre</h3><div class="row">${D.GENRES.map(x => `<button class="chip ${a.genre === x.id ? 'on' : ''}" data-a="alSet" data-v="genre:${x.id}">${esc(x.n)}</button>`).join('')}</div>
    <p class="small dim" style="margin:4px 0 0">This genre leans on <b>${D.GENRES.find(x => x.id === a.genre).skill}</b>. Group average: ${Math.round(KA.groupStat(S, g, D.GENRES.find(x => x.id === a.genre).skill))}</p>
    <h3 style="margin-top:10px">Producer</h3><div class="list">${D.PRODUCERS.map(p => { const lock = p.self && !KA.selfProducer(S, g); return `<div class="li tap ${a.producer === p.id ? 'me' : ''}" data-a="alSet" data-v="producer:${p.id}"><div class="grow"><b>${esc(p.n)}</b><br><small class="dim">${p.self ? (lock ? '🔒 Needs a member with the producer or rapper trait and 50+ rap or vocal' : esc(KA.selfProducer(S, g).name) + ' writes it. Fans love self-produced idols.') : p.cost ? won(p.cost) : 'Free'}</small></div>${a.producer === p.id ? '✓' : ''}</div>`; }).join('')}</div>`;
  if (a.step === 2) {
    const L = KA.linesInfo(S, g, a.lines);
    body = `<p class="small">Who sings how much of the title track? Strong singers raise quality. Very unfair splits make fans angry.</p>
    ${ms.map(m => `<div class="row" style="flex-wrap:nowrap;margin:6px 0">${av(m.look, 40)}<div class="grow"><div class="between small"><b>${esc(m.name)}</b><span>🎤${Math.round(m.stats.vocal)} 🔥${Math.round(m.stats.rap)} · <b class="lnv">${a.lines[m.id] || 0}%</b></span></div><input type="range" min="0" max="60" step="1" value="${a.lines[m.id] || 0}" data-in="line:${m.id}" id="ln-${m.id}" aria-label="Lines for ${esc(m.name)}"></div></div>`).join('')}
    <div class="kpis" style="margin-top:8px"><div class="kpi"><b>${Object.values(a.lines).reduce((s, v) => s + v, 0)}%</b><small>Total</small></div><div class="kpi"><b>${Math.round(L.fair * 100)}</b><small>Fairness</small></div><div class="kpi"><b class="${L.unfair ? 'bad' : 'good'}">${L.unfair ? 'Risky' : 'OK'}</b><small>Fan reaction</small></div></div>
    <div class="row" style="margin-top:8px">${B('Auto (by skill)', 'alLines', 'auto', 'sm ghost')}${B('Equal split', 'alLines', 'equal', 'sm ghost')}</div>`;
  }
  if (a.step === 3) body = `
    <h3>Set</h3><div class="row">${D.MV_SETS.map(s => `<button class="chip ${a.set === s.id ? 'on' : ''}" data-a="alSet" data-v="set:${s.id}" style="border-left:10px solid ${s.col[1]}">${esc(s.n)}</button>`).join('')}</div>
    <p class="small dim" style="margin:4px 0 0">Fits: ${D.MV_SETS.find(s => s.id === a.set).tags.map(t => (D.CONCEPTS.find(c => c.id === t) || { n: t }).n).join(', ')}</p>
    <h3 style="margin-top:10px">Story</h3><div class="row">${D.MV_STORIES.map(s => `<button class="chip ${a.story === s.id ? 'on' : ''}" data-a="alSet" data-v="story:${s.id}">${esc(s.n)}</button>`).join('')}</div>
    <h3 style="margin-top:10px">Budget</h3><div class="row">${D.MV_BUDGET.map((b, k) => `<button class="chip ${a.budget === k ? 'on' : ''}" data-a="alSet" data-v="budget:${k}">${esc(b.n)} · ${won(b.cost)}</button>`).join('')}</div>
    <h3 style="margin-top:10px">Shot list</h3><p class="small dim" style="margin:0">Pick a shot for each part of the song. Mixing different shots keeps viewers hooked.</p>
    ${D.MV_SECTIONS.map((sec, k) => `<div class="row" style="margin:6px 0;flex-wrap:nowrap"><b class="small" style="width:84px">${sec}</b><select id="shot-${k}" data-in="shot:${k}">${D.MV_SHOTS.map(s => `<option value="${s.id}" ${a.shots[k] === s.id ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select></div>`).join('')}
    <label class="row small" style="margin-top:6px"><input type="checkbox" id="al-ch" data-in="al.challenge" ${a.challenge ? 'checked' : ''}> Launch a dance challenge with the release</label>`;
  if (a.step === 4) body = `<div class="kpis"><div class="kpi"><b>${won(cost.studio)}</b><small>Recording</small></div><div class="kpi"><b>${won(cost.prod)}</b><small>Producer</small></div><div class="kpi"><b>${won(cost.mv)}</b><small>MV</small></div></div>
    <div class="list" style="margin-top:8px">
      <div class="li small"><b class="grow">Title</b>"${esc(a.title)}"</div>
      <div class="li small"><b class="grow">Format</b>${esc(D.ALBUM_TYPES.find(t => t.id === a.type).n)}</div>
      <div class="li small"><b class="grow">Concept · Genre</b>${esc(D.CONCEPTS.find(c => c.id === a.concept).n)} · ${esc(D.GENRES.find(x => x.id === a.genre).n)}</div>
      <div class="li small"><b class="grow">Producer</b>${esc(D.PRODUCERS.find(p => p.id === a.producer).n)}</div>
      <div class="li small"><b class="grow">MV</b>${esc(D.MV_SETS.find(s => s.id === a.set).n)} · ${esc(D.MV_STORIES.find(s => s.id === a.story).n)}</div>
    </div><p><b>Total: ${won(cost.total)}</b> <span class="dim small">(you have ${won(S.money)})</span></p><p class="small dim">Teasers drop now. The album comes out next week.</p>`;
  modal(`${head(g.name + (g.status === 'predebut' ? ' · Debut' : ' · Comeback'), 'Plan the album')}${nav}${body}
    <div class="btns"><div class="row" style="flex-wrap:nowrap">${a.step > 1 ? B('◀ Back', 'alStep', -1, 'ghost') : ''}${a.step < 4 ? B('Next ▶', 'alStep', 1, 'grow') : B('Release it! 💿', 'alGo', '', 'grow', S.money < cost.total)}</div>${B('Cancel', 'close', '', 'block ghost')}</div>`);
}

// ---------- schedules, content, tours
function schedMenu(gid) {
  const g = KA.group(S, gid), t = KA.fameTier(g.fans);
  modal(`${head(g.name, 'Schedules this week')}<p class="small">Booked <b>${g.sched.length}/${KA.maxSched(S)}</b> · group condition ${Math.round(KA.groupCond(S, g))}. Each schedule costs condition for every member.</p>
    <div class="list">${D.SCHEDULES.map(s => { const on = g.sched.includes(s.id), lock = s.fame > t; return `<div class="li tap ${on ? 'me' : ''}" data-a="sched" data-v="${g.id}:${s.id}"><span style="font-size:22px;${lock ? 'filter:grayscale(1);opacity:.4' : ''}">${s.e}</span><div class="grow"><b>${esc(s.n)}</b><br><small class="dim">${lock ? '🔒 ' + D.FAME[s.fame].n + ' fame' : `~${won(s.money * (1 + t * .5))} · ~${num(s.fans * .5 * (1 + t * .4))} fans · -${s.cond} cond · ${s.stat}`}</small></div>${on ? '<span class="pill hot">Booked</span>' : ''}</div>`; }).join('')}</div>${closeBtn('Done')}`);
}
function contentMenu(gid) {
  const g = KA.group(S, gid);
  modal(`${head(g.name, 'Make your own content')}${g.content ? `<p>Filming <b>${esc(D.CONTENT.find(c => c.id === g.content.id).n)}</b>. ${g.content.left} weeks left.</p>` : ''}
    <div class="list">${D.CONTENT.map(c => { const lock = c.need > S.rooms.content; return `<div class="li"><div class="grow"><b>${esc(c.n)}</b> <small class="dim">${c.weeks} wk · ${won(c.cost)}</small><br><small class="dim">${lock ? `🔒 Content studio level ${c.need}` : `~${num(c.fans * .6 * (1 + KA.fameTier(g.fans) * .5))} fans${c.money ? ' · earns ~' + won(c.money) : ''}${c.viral ? ' · can go viral' : ''}`}</small></div>${B('Film', 'content', g.id + ':' + c.id, 'sm sky', lock || !!g.content || S.money < c.cost)}</div>`; }).join('')}</div>${closeBtn()}`);
}
function tourMenu(gid) {
  const g = KA.group(S, gid);
  if (g.tour) { modal(`${head(g.name, esc(g.tour.name))}<div class="list">${g.tour.stops.map((s, k) => `<div class="li"><span class="rk">${k + 1}</span><div class="grow"><b>${esc(s.city)}</b> <small class="dim">${esc(D.VENUES.find(v => v.id === s.venue).n)}</small></div><small>${s.done ? num(s.sold) + ' fans' : k === g.tour.at ? 'next' : ''}</small></div>`).join('')}</div>${closeBtn()}`); return; }
  UI.tp = UI.tp && UI.tp.gid === gid ? UI.tp : { gid, stops: [] };
  tpRender();
}
function tpRender() {
  const g = KA.group(S, UI.tp.gid), t = KA.fameTier(g.fans), tp = UI.tp;
  const best = D.VENUES.filter(v => v.fame <= t).slice(-1)[0];
  const cost = tp.stops.reduce((s, st) => s + D.VENUES.find(v => v.id === st.venue).cost * .25, 0);
  modal(`${head(g.name, 'Plan a world tour')}<p class="small">One city per week. Demand depends on your fans in each region. Up-front production cost is a quarter of the venue cost, the rest comes out of ticket sales.</p>
    ${t < 1 ? '<p class="bad">You need Rookie fame to tour.</p>' : ''}
    <div class="list">${tp.stops.map((s, k) => { const d = KA.tourDemand(g, s.city, s.venue), V = D.VENUES.find(v => v.id === s.venue); return `<div class="li"><span class="rk">${k + 1}</span><div class="grow"><b>${esc(s.city)}</b><br><select data-in="venue:${k}" id="v-${k}">${D.VENUES.map(v => `<option value="${v.id}" ${v.id === s.venue ? 'selected' : ''} ${v.fame > t ? 'disabled' : ''}>${esc(v.n)} (${num(v.cap)})</option>`).join('')}</select><small class="${d >= V.cap ? 'good' : 'bad'}">Demand ~${num(d)} / ${num(V.cap)} seats</small></div>${B('✕', 'tpDel', k, 'sm ghost')}</div>`; }).join('') || '<p class="dim small">Add cities below.</p>'}</div>
    <h3 style="margin-top:8px">Add a city</h3><div class="row">${D.CITIES.map(c => `<button class="chip" data-a="tpAdd" data-v="${esc(c.n)}">${esc(c.n)} <small class="dim">${g.reg[c.r]}%</small></button>`).join('')}</div>
    <p><b>Up front: ${won(cost)}</b></p>
    <div class="btns">${B('Announce the tour 🌍', 'tpGo', '', 'block mint', !tp.stops.length || t < 1 || !best)}${B('Close', 'close', '', 'block ghost')}</div>`);
}

// ---------- stylist
function styleModal(id, gid) {
  const i = S.idols[id];
  UI.sty = { id, gid, look: Object.assign({}, i.look) };
  styRender();
}
function styRender() {
  const st = UI.sty, i = S.idols[st.id], L = st.look;
  const hairs = L.g === 'm' ? D.HAIR_M : D.HAIR_F;
  const O = D.OUTFITS.find(o => o.id === L.top);
  const owned = S.owned.includes(L.top);
  const unlocked = o => o.cost === 0 || S.rooms.stylist > 0;
  const g = st.gid ? KA.group(S, st.gid) : null;
  const others = g ? KA.members(S, g).filter(m => m.status === 'idol') : [];
  modal(`${head('Stylist room', esc(i.name))}
    ${others.length > 1 ? `<div class="row" style="gap:4px">${others.map(m => `<button class="chip ${m.id === i.id ? 'on' : ''}" data-a="styOther" data-v="${m.id}">${esc(m.name.split(' ').pop())}</button>`).join('')}</div>` : ''}
    <div class="center" style="background:#f4eeff;border:3px solid var(--line);padding:8px;margin:8px 0">${SP.img(L, 140, 'idle')} ${SP.img(L, 140, 'cheer')}</div>
    <h3>Hair</h3><div class="row" style="gap:4px">${hairs.map((h, k) => `<button class="chip ${L.hair === k ? 'on' : ''}" data-a="sty" data-v="hair:${k}">${esc(h)}</button>`).join('')}</div>
    <div class="row" style="margin-top:6px">${D.HAIR_C.map((c, k) => `<span class="swatch ${L.hairC === k ? 'on' : ''}" style="background:${c}" data-a="sty" data-v="hairC:${k}"></span>`).join('')}</div>
    <h3 style="margin-top:10px">Outfit</h3><div class="row" style="gap:4px">${D.OUTFITS.map(o => `<button class="chip ${L.top === o.id ? 'on' : ''} ${unlocked(o) ? '' : 'lock'}" data-a="sty" data-v="top:${o.id}">${esc(o.n)}${S.owned.includes(o.id) ? '' : ' · ' + won(o.cost)}</button>`).join('')}</div>
    <p class="small dim" style="margin:4px 0">Fits: ${O.tags.join(', ')}${S.rooms.stylist ? '' : ' · Build the stylist room to unlock paid outfits.'}</p>
    <div class="row">${D.OUT_C.map((c, k) => `<span class="swatch ${L.topC === k ? 'on' : ''}" style="background:${c}" data-a="sty" data-v="topC:${k}"></span>`).join('')}</div>
    <h3 style="margin-top:10px">Bottoms</h3><div class="row">${D.OUT_C.map((c, k) => `<span class="swatch ${L.botC === k ? 'on' : ''}" style="background:${c}" data-a="sty" data-v="botC:${k}"></span>`).join('')}</div>
    <h3 style="margin-top:10px">Accessory</h3><div class="row" style="gap:4px">${D.ACCS.map((a, k) => `<button class="chip ${L.acc === k ? 'on' : ''}" data-a="sty" data-v="acc:${k}">${esc(a)}</button>`).join('')}</div>
    <h3 style="margin-top:10px">Skin and eyes</h3><div class="row">${D.SKIN.map((c, k) => `<span class="swatch ${L.skin === k ? 'on' : ''}" style="background:${c}" data-a="sty" data-v="skin:${k}"></span>`).join('')} ${['Round', 'Sharp', 'Smiling'].map((e, k) => `<button class="chip ${L.eye === k ? 'on' : ''}" data-a="sty" data-v="eye:${k}">${e}</button>`).join('')}</div>
    <div class="btns">${B(owned ? 'Save look' : `Buy outfit & save (${won(O.cost)})`, 'stySave', '', 'block', !unlocked(O) || (!owned && S.money < O.cost))}${g ? B('Give everyone this outfit style', 'styAll', '', 'block alt', !owned) : ''}${B('Cancel', 'close', '', 'block ghost')}</div>`);
}

// ---------- rhythm mini-game (practice sessions and live rehearsals)
function rhythm(title, cb) {
  const lanes = 4, dur = 14, notes = [];
  for (let t = 1.2; t < dur - 1; t += .42 + Math.random() * .38) notes.push({ t, l: ri(0, 3), hit: false, el: null });
  modal(`${head('Mini-game', esc(title))}<p class="small">Tap the pads (or press D F J K) when notes reach the yellow line.</p>
    <div class="rg" id="rg">${[0, 1, 2, 3].map(k => `<div class="lane" style="left:${k * 25}%;width:25%"></div>`).join('')}<div class="hit"></div><div class="msg" id="rgmsg">Ready…</div><div class="pads">${['D', 'F', 'J', 'K'].map((k, i) => `<button data-lane="${i}" aria-label="Lane ${i + 1}">${k}</button>`).join('')}</div></div>
    <div class="between" style="margin-top:8px"><b id="rgscore">0</b>${B('Skip', 'rgSkip', '', 'sm ghost')}</div>`);
  const box = $('#rg'), H = box.clientHeight, hitY = H - 46 - 3, speed = (H - 50) / 1.6;
  const cols = ['#ff4f9a', '#38b6ff', '#ffc93c', '#1fbf8f'];
  let t0 = performance.now() + 600, score = 0, hits = 0, raf, done = false, stopBeat = S.sound ? SP.beat('dance', dur + 1) : null;
  notes.forEach(n => { n.el = document.createElement('div'); n.el.className = 'note'; n.el.style.cssText = `left:${n.l * 25 + 3}%;width:19%;background:${cols[n.l]};top:-20px`; box.appendChild(n.el); });
  const msg = t => { const m = $('#rgmsg'); if (m) m.textContent = t; };
  function finish() {
    if (done) return; done = true; cancelAnimationFrame(raf); if (stopBeat) stopBeat(); document.removeEventListener('keydown', key);
    const pct = Math.round(clamp(hits / notes.length * 100, 0, 100)); UI.rgSkip = null; cb(pct);
  }
  UI.rgSkip = () => { hits = notes.length * .5; finish(); };
  function press(l) {
    const now = (performance.now() - t0) / 1000;
    const pad = box.querySelector(`[data-lane="${l}"]`); if (pad) { pad.classList.add('hitf'); setTimeout(() => pad.classList.remove('hitf'), 90); }
    let best = null, bd = 9;
    for (const n of notes) if (!n.hit && n.l === l) { const d = Math.abs(n.t - now); if (d < bd) { bd = d; best = n; } }
    if (best && bd < .2) { best.hit = true; best.el.remove(); const p = bd < .08; hits += p ? 1 : .6; score += p ? 100 : 60; msg(p ? 'PERFECT!' : 'GOOD'); snd(p ? 880 : 660); }
    else { msg('MISS'); }
    const sc = $('#rgscore'); if (sc) sc.textContent = score;
  }
  box.querySelectorAll('[data-lane]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); press(+b.dataset.lane); }));
  const key = e => { const l = ['d', 'f', 'j', 'k'].indexOf(e.key.toLowerCase()); if (l >= 0) press(l); };
  document.addEventListener('keydown', key);
  function loop(now) {
    if (!document.body.contains(box)) { done = true; if (stopBeat) stopBeat(); document.removeEventListener('keydown', key); return; }
    const t = (now - t0) / 1000;
    for (const n of notes) if (!n.hit) { const y = hitY - (n.t - t) * speed; n.el.style.top = y + 'px'; if (t - n.t > .25 && !n.missed) { n.missed = true; n.el.style.opacity = .25; } }
    if (t > dur) return finish();
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
}

// ---------- MV and stage players
function lyricLines(title) { const w = title.split(' '); return [`(${title})`, `${w[0]}, ${w[0]}, yeah`, `Can you feel the ${w[1] || 'beat'}?`, `${title}! ${title}!`, '♪ dance break ♪', `${w[1] || title} forever`]; }
function mvHTML(a, extra = '') { return `<div class="mvbox"><canvas class="scr" id="mvc" width="320" height="180"></canvas><button class="btn sm ghost skip" data-a="mvSkip">Skip ▶▶</button></div>${extra}`; }
function playMV(a) {
  const g = KA.group(S, a.gid), looks = KA.members(S, g).filter(m => m.status !== 'left').map(m => m.look);
  const c = $('#mvc'); if (!c) return;
  if (UI.stopAnim) UI.stopAnim();
  UI.stopAnim = SP.playMV(c, a.mv, looks, { title: `${g.name} "${a.title}" M/V`, lines: lyricLines(a.title), onEnd: () => { UI.stopAnim = null; } });
  if (S.sound) { if (UI.stopSnd) UI.stopSnd(); UI.stopSnd = SP.beat(a.genre, 16); }
}
function playStage(gid, opts) {
  const g = KA.group(S, gid), looks = KA.members(S, g).filter(m => m.status !== 'left').map(m => m.look);
  const c = $('#stc'); if (!c) return;
  if (UI.stopAnim) UI.stopAnim();
  UI.stopAnim = SP.playStage(c, looks, Object.assign({ color: g.color, dur: 30 }, opts));
  if (S.sound) { if (UI.stopSnd) UI.stopSnd(); UI.stopSnd = SP.beat('dance', 8); }
}

// ------------------------------------------------------------------ weekly report queue
function runQueue() {
  if (!S) return;
  while (S.q.length && (S.q[0].k === 'ach' || S.q[0].k === 'bills')) {
    const it = S.q.shift();
    if (it.k === 'ach') { const A = D.ACH.find(a => a.id === it.id); toast(`🏅 Trophy: ${A.n}`); snd(990); }
    if (it.k === 'bills') toast(`Monthly bills paid: ${won(it.cost)}`);
  }
  const it = S.q.shift();
  if (!it) { closeModal(); save(); render(); setTimeout(showTip, 50); return; }
  save();
  const next = B('Continue', 'qnext', '', 'block');
  if (it.k === 'report') {
    modal(`${head(KA.date(S), 'Week report')}${it.items.map(r => `<h3 style="margin-top:6px">${esc(r.g)}</h3><div class="list">${r.items.map(s => `<div class="li small"><span>${s.e}</span><b class="grow">${esc(s.n)}</b><span class="good">+${won(s.money)}</span><span>+${num(s.fans)} fans</span></div>`).join('')}</div>`).join('')}<div class="btns">${next}</div>`);
  } else if (it.k === 'msg') {
    modal(`<div class="trophy">${it.e}</div>${head('News', esc(it.t))}<p>${esc(it.b)}</p><div class="btns">${next}</div>`);
  } else if (it.k === 'eval') {
    modal(`${head('Monthly evaluation', 'Trainee grades')}<div class="list">${it.rows.map((r, k) => `<div class="li"><span class="rk">${k + 1}</span>${av(S.idols[r.id].look, 40)}<div class="grow"><b>${esc(r.n)}</b><br><small class="${r.gain > 0 ? 'good' : 'dim'}">${r.gain > 0 ? '+' + r.gain : r.gain} since last month</small></div><span class="pill ${r.grade === 'A' ? 'gold' : r.grade === 'F' ? 'red' : ''}" style="font-size:16px">${r.grade}</span></div>`).join('')}</div><div class="btns">${next}</div>`);
  } else if (it.k === 'show') {
    const winners = it.final && it.winners.length;
    modal(`${head(D.SHOW_NAME, esc(it.ep.n))}
      <div class="list">${it.res.map(r => `<div class="li">${av(S.idols[r.id].look, 40)}<div class="grow"><b>${esc(r.n)}</b><br><small class="dim">Stage ${r.perf} · screen time ${r.screen}${r.evil ? ' · <span class="bad">evil edit!</span>' : ''}</small></div><b>#${(it.mine.find(m => m.id === r.id) || {}).rank || '-'}</b></div>`).join('')}</div>
      ${it.cut ? `<p class="small"><b>${esc(it.cut)}</b>${it.out && it.out.length ? ' Eliminated: ' + it.out.map(esc).join(', ') : ''}</p>` : ''}
      <h3 style="margin-top:8px">${it.final ? 'Final debut lineup' : 'Current top 9'}</h3><div class="list">${it.top.map(t => `<div class="li small ${t.us ? 'me' : ''}"><span class="rk">${t.rank}</span><b class="grow">${esc(t.n)}</b>${t.us ? '<span class="pill hot">yours</span>' : ''}</div>`).join('')}</div>
      ${winners ? '<p><b>Your trainees made the lineup! You can debut them now as a project group with a big fanbase from the show.</b></p>' : it.final ? '<p>None of yours made it, but they gained fans and experience.</p>' : ''}
      <div class="btns">${winners ? B('🌟 Debut them now', 'showDebut', '', 'block alt') : ''}${next}</div>`);
  } else if (it.k === 'release') {
    const a = S.albums.find(x => x.id === it.aid), g = KA.group(S, a.gid), pos = S.chart.findIndex(r => r.aid === a.id) + 1;
    modal(`${head(it.first ? 'DEBUT!' : 'Comeback', `${esc(g.name)} · "${esc(a.title)}"`)}${mvHTML(a)}
      <div class="kpis" style="margin-top:8px"><div class="kpi"><b>${num(a.mv.day1)}</b><small>MV views (24h)</small></div><div class="kpi"><b>${num(a.sales)}</b><small>First-week sales</small></div><div class="kpi"><b>${pos ? '#' + pos : 'Out'}</b><small>Chart debut</small></div></div>
      <p class="small">Song quality ${stars(a.q)} · MV ${stars(a.mv.score)}${a.pre ? ` · Pre-orders ${num(a.pre)}` : ''}${a.trend ? ' · <b>🔥 On trend!</b>' : ''}</p>${it.first ? `<p>${esc(g.name)} take the stage for their debut showcase. ${esc(g.fandom)} is officially born!</p>` : ''}<div class="btns">${next}</div>`);
    setTimeout(() => playMV(a), 60);
  } else if (it.k === 'mshow') {
    const g = KA.group(S, it.mine.gid);
    modal(`${head(it.show, it.win ? (it.first ? 'FIRST WIN!! 🏆' : '1st place! 🏆') : 'No trophy this week')}<canvas class="scr" id="stc" width="320" height="180"></canvas>
      <div class="list" style="margin-top:8px">${it.top.map((r, k) => `<div class="li ${r.us ? 'me' : ''}"><span class="rk">${k + 1}</span><div class="grow"><b>${esc(r.s)}</b><br><small class="dim">${esc(r.n)}</small></div><b>${num(r.score)}</b></div>`).join('')}</div>
      <p class="small">Live stage: <b>${it.mine.live}/100</b>${it.triple ? ' · <b>TRIPLE CROWN!</b>' : ''}</p>${it.first ? '<p>The MC reads your name. The members collapse into a group hug and cry through the encore.</p>' : ''}<div class="btns">${next}</div>`);
    setTimeout(() => playStage(g.id, { title: it.win ? '🏆 ' + it.mine.s : it.mine.s, confetti: it.win, dur: 30 }), 60);
  } else if (it.k === 'concert') {
    const g = KA.group(S, it.gid);
    modal(`${head(g.tour ? g.tour.name : 'World tour', `${esc(it.city)} · ${esc(it.venue)}`)}<canvas class="scr" id="stc" width="320" height="180"></canvas>
      <p>${num(it.sold)} of ${num(it.cap)} seats${it.shows > 1 ? ` over ${it.shows} nights` : ''}. ${it.soldOut ? '<b>SOLD OUT!</b> A lightstick ocean.' : 'A few empty seats, but the fans who came were loud.'}</p><div class="btns">${next}</div>`);
    setTimeout(() => playStage(g.id, { title: it.city.toUpperCase(), confetti: it.soldOut }), 60);
  } else if (it.k === 'event') {
    UI.ev = it;
    modal(`${head('Something happened', 'Decision time')}<p>${esc(it.t)}</p><div class="btns">${D.EVENTS[it.ev].c.map((c, k) => B(esc(c[0]), 'evPick', k, 'block ' + (k ? 'ghost' : ''))).join('')}</div>`);
  } else if (it.k === 'hate') {
    const h = S.hate.find(x => x.id === it.hid);
    if (!h) return runQueue();
    const H = D.HATE.find(x => x.id === h.type);
    modal(`<div class="trophy">⚠️</div>${head('Hate train', esc(H.n))}<p>${esc(h.text)}</p><p class="small dim">The heat grows every week you leave it. You can answer it on the SNS tab.</p><div class="btns">${B('Deal with it now', 'hateNow', '', 'block red')}${next}</div>`);
  } else if (it.k === 'award') {
    UI.aw = { id: it.id };
    const A = D.AWARDS.find(a => a.id === it.id);
    modal(`<div class="trophy">🏆</div>${head(`${A.short} · ${A.where}`, esc(A.n))}<p>${esc(A.d)}</p><p class="small">Choose your stage for the night. A bigger stage brings more votes and fans.</p>
      <div class="btns">${B('Standard stage · free', 'awStage', 0, 'block ghost')}${B('Special collab stage · ₩30M', 'awStage', 1, 'block sky', S.money < 3e7)}${B('Grand production · ₩120M', 'awStage', 2, 'block', S.money < 1.2e8)}</div>`);
  } else if (it.k === 'renew') {
    const g = KA.group(S, it.gid);
    UI.rn = it.gid;
    modal(`${head('Contract', `${esc(g.name)}'s seven years are up`)}<p>The members' contracts are ending. Renewing costs money, and members with low mood may leave anyway.</p><div class="btns">${B('Offer renewal', 'renew', 1, 'block')}${B('Let the group disband', 'renew', 0, 'block ghost')}</div>`);
  } else if (it.k === 'fame') {
    const g = KA.group(S, it.gid);
    modal(`<div class="trophy">⭐</div>${head(g.name, `Now: ${D.FAME[it.t].n}!`)}<p>${esc(g.name)} reached <b>${D.FAME[it.t].n}</b> fame with ${num(g.fans)} fans. New schedules and venues unlocked.</p><div class="btns">${next}</div>`);
  } else if (it.k === 'rank') {
    modal(`<div class="trophy">🏢</div>${head('Agency rank up', esc(D.RANKS[it.r].n))}<p>${esc(S.agency)} Entertainment is now a <b>${esc(D.RANKS[it.r].n.toLowerCase())}</b>.</p><div class="btns">${next}</div>`);
  } else if (it.k === 'recap') {
    modal(`<div class="trophy">📊</div>${head('Year in review', 'Year ' + it.y + ' recap')}
      <div class="kpis"><div class="kpi"><b class="${it.money >= 0 ? '' : 'bad'}">${it.money >= 0 ? '+' : ''}${won(it.money)}</b><small>Money</small></div><div class="kpi"><b>+${num(Math.max(0, it.fans))}</b><small>New fans</small></div><div class="kpi"><b>${num(it.sold)}</b><small>Albums sold</small></div></div>
      <div class="kpis" style="margin-top:8px"><div class="kpi"><b>${it.wins}</b><small>Music show wins</small></div><div class="kpi"><b>${it.awards}</b><small>Awards</small></div><div class="kpi"><b>${S.qdone}</b><small>Quests done</small></div></div>
      ${it.best.length ? `<p>Song of the year at ${esc(S.agency)}: <b>${it.best.map(esc).join(', ')}</b></p>` : ''}<div class="btns">${next}</div>`);
  } else if (it.k === 'newyear') {
    modal(`<div class="trophy">🎆</div>${head('Happy new year', 'Year ' + it.y)}<p>A new year of comebacks begins. Award points reset, and a new batch of rookie groups is coming.</p><div class="btns">${next}</div>`);
  } else if (it.k === 'over') {
    modal(`<div class="trophy">💸</div>${head('Game over', 'The agency went bankrupt')}<p>The money ran out and the investors pulled the plug. Every idol's contract was sold to other agencies.</p><div class="btns">${B('Back to title', 'quit', '', 'block')}</div>`);
  } else runQueue();
}
function awardReveal() {
  const r = UI.aw.res, i = UI.aw.i, c = r.res[i];
  if (!c) { UI.aw = null; runQueue(); return; }
  const shown = UI.aw.open;
  modal(`${head(`${r.A.short} · ${i + 1}/${r.res.length}`, esc(c.cat))}
    ${c.multi > 1 ? `<p class="small dim">${c.multi} winners</p>` : ''}
    <div class="list">${c.noms.map(n => { const w = shown && c.winners.includes(n.n); return `<div class="li ${n.us ? 'me' : ''}"><span>${w ? '🏆' : '•'}</span><b class="grow">${esc(n.n)}</b>${w ? '<span class="pill gold">WINNER</span>' : ''}</div>`; }).join('')}</div>
    ${shown ? (c.won.length ? `<p class="trophy" style="font-size:40px">🏆</p><p class="center"><b>${c.won.map(esc).join(' & ')} won!</b></p>` : c.nom.length ? '<p class="center dim">Not this time.</p>' : '') : ''}
    <div class="btns">${shown ? B(i + 1 < r.res.length ? 'Next award ▶' : 'Finish', 'awNext', '', 'block') : B('✉️ Open the envelope', 'awOpen', '', 'block')}</div>`);
  if (shown && c.won.length) snd(1046);
}

// ------------------------------------------------------------------ tutorial and tips
function showTut() {
  if (!S || S.tut.done) { $('#tut').hidden = true; return; }
  const st = D.TUTORIAL[S.tut.step]; if (!st) { S.tut.done = true; save(); $('#tut').hidden = true; return; }
  bubble(st.t, st.sel, !st.go, true);
}
function bubble(text, sel, showNext, isTut) {
  const el = sel ? document.querySelector(sel) : null;
  const tut = $('#tut');
  if (isTut && $('#modal').classList.contains('on')) { tut.hidden = true; return; }
  tut.hidden = false;
  let spot = '<div class="spot none"></div>', top = true;
  if (el && !$('#modal').classList.contains('on')) {
    if (el.getBoundingClientRect().top > innerHeight - 160 || el.getBoundingClientRect().bottom < 60) { if (!el.closest('#tabs') && el.id !== 'next') el.scrollIntoView({ block: 'center' }); }
    const r = el.getBoundingClientRect();
    spot = `<div class="spot" style="left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px"></div>`;
    top = r.top > innerHeight / 2;
  }
  const pos = top ? 'top:calc(60px + env(safe-area-inset-top,0px))' : 'bottom:calc(130px + env(safe-area-inset-bottom,0px))';
  tut.innerHTML = `${spot}<div class="bub" style="${pos}">${SP.img(D.MANAGER.look, 84, 'heart')}<div class="say"><b>Manager Bora</b><br>${esc(text)}<div class="row">${isTut ? B('Skip tutorial', 'tutSkip', '', 'sm ghost') : ''}${showNext ? B(isTut ? 'Next ▶' : 'Got it!', isTut ? 'tutNext' : 'tipClose', '', 'sm') : ''}</div></div></div>`;
  // let taps through to the highlighted element only when the step waits for an action
  tut.style.pointerEvents = 'none';
}
function tutGo(ev) {
  if (!S || S.tut.done) return;
  const st = D.TUTORIAL[S.tut.step];
  if (st && st.go === ev) { S.tut.step++; save(); setTimeout(showTut, 60); }
}
function showTip() {
  if (!S || !S.tut.done || $('#modal').classList.contains('on')) return;
  const k = Object.keys(S.tips).find(x => S.tips[x] === 'pending');
  if (!k) return;
  S.tips[k] = 'done'; save();
  bubble(D.TIPS[k], null, true, false);
}

// ------------------------------------------------------------------ update notice (same approach as the other games)
function checkUpdate() {
  if (!window.fetch || location.protocol === 'file:') return;
  fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(v => {
    if (!v || !(v.build > (window.IA_BUILD || 0)) || document.getElementById('update')) return;
    const b = document.createElement('button'); b.id = 'update'; b.dataset.a = 'applyUpdate';
    b.innerHTML = '<span>A new update is live!<small>Tap to load it. Your saves are kept.</small></span><span>Update</span>';
    document.body.appendChild(b);
  }).catch(() => { });
}
function announceUpdate() {
  let seen = 0; try { seen = +localStorage.getItem('ia-build') || 0; localStorage.setItem('ia-build', window.IA_BUILD || 1); } catch (e) { return; }
  if (seen && seen < (window.IA_BUILD || 1)) whatsNew(seen);
}
function whatsNew(since = 0) {
  modal(`${head('Version ' + window.IA_BUILD, since ? 'Updated! ✨' : "What's new")}${D.CHANGELOG.filter(c => !since || c.build > since).map(c => `<h3 style="margin-top:8px">Version ${c.build} · ${esc(c.date)}</h3><ul class="small" style="padding-left:18px;margin:4px 0">${c.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>`).join('')}${closeBtn()}`);
}

// ------------------------------------------------------------------ actions
const A = {
  tab(v) { UI.tab = v; render(); if (UI.tab === 'hq') window.scrollTo(0, 0); tutGo('tab:' + v); },
  winBg(v, el) { },
  close() { closeModal(); render(); },
  qnext() { runQueue(); },
  whatsNew() { whatsNew(); },
  applyUpdate() { save(); location.reload(); },
  newIn(v) { UI.newSlot = +v; render(); setTimeout(() => { const f = $('#f-agency'); if (f) f.focus(); }, 50); },
  cancelNew() { UI.newSlot = null; render(); },
  draftDiff(v) { UI.draft.diff = v; render(); },
  start(v) {
    S = KA.newGame({ slot: +v, agency: UI.draft.agency, ceo: UI.draft.ceo, diff: UI.draft.diff });
    UI.newSlot = null; UI.tab = 'hq'; save(); render();
  },
  load(v) { const s = readSlot(+v); if (!s) return; S = KA.migrate(s); S.slot = +v; UI.tab = 'hq'; render(); if (S.q.length) runQueue(); },
  delSlot(v) { modal(`${head('Delete', 'Delete slot ' + v + '?')}<p>This agency will be gone for good.</p><div class="btns">${B('Delete it', 'delYes', v, 'block red')}${B('Keep it', 'close', '', 'block ghost')}</div>`); },
  delYes(v) { try { localStorage.removeItem(KEY + v); } catch (e) { } closeModal(); render(); },
  quit() { save(); closeModal(); S = null; $('#tut').hidden = true; render(); window.scrollTo(0, 0); },
  sound() { S.sound = !S.sound; save(); render(); },
  tutAgain() { S.tut = { step: 0, done: false }; UI.tab = 'hq'; save(); render(); },
  tutNext() { S.tut.step++; save(); if (S.tut.step >= D.TUTORIAL.length) { S.tut.done = true; $('#tut').hidden = true; } showTut(); },
  tutSkip() { S.tut.done = true; save(); $('#tut').hidden = true; },
  tipClose() { $('#tut').hidden = true; setTimeout(showTip, 100); },
  next() {
    if ($('#modal').classList.contains('on')) return;
    snd(520);
    const rep = KA.endWeek(S);
    if (rep.sched.length) S.q.unshift({ k: 'report', items: rep.sched });
    tutGo('next'); save(); render(); runQueue();
  },
  // HQ
  room(v) { roomModal(v); },
  upgrade(v) { const r = KA.upgradeRoom(S, v); if (!r.ok) return toast(r.msg); snd(880); toast('Upgraded!'); save(); render(); roomModal(v); },
  staffMenu() { staffMenu(); },
  hire(v) { const r = KA.hire(S, v); if (!r.ok) return toast(r.msg); snd(880); save(); render(); staffMenu(); },
  calendar() { calendarModal(); },
  sellRoom(v) { const r = KA.sellRoom(S, v); toast(r.msg); save(); render(); roomModal(v); },
  claim(v) { const r = KA.claimQuest(S, +v); if (r.ok) { snd(990); toast(r.msg); } save(); render(); },
  mail(v) { const [id, y] = v.split(':'); const r = KA.mailAct(S, +id, y === '1'); toast(r.msg || ''); snd(880); save(); render(); },
  loan(v) { const r = KA.takeLoan(S, v); toast(r.msg); save(); render(); },
  repay(v) { const r = KA.repayAll(S, +v); toast(r.msg); save(); render(); },
  merch(v) { const [g, id] = v.split(':'); const r = KA.launchMerch(S, +g, id); toast(r.ok ? 'On sale now!' : r.msg); save(); render(); },
  club(v) { const r = KA.launchClub(S, +v); toast(r.ok ? 'Fan club launched!' : r.msg); save(); render(); },
  bizBuy(v) { const r = KA.buyBiz(S, v); toast(r.ok ? 'Business opened!' : r.msg); save(); render(); },
  soloMenu(v) { soloMenu(+v); },
  solo(v) { const [m, j] = v.split(':'); const r = KA.setSolo(S, +m, j); if (!r.ok) toast(r.msg); save(); render(); soloMenu(S.idols[+m].gid); },
  dinner(v) { const r = KA.teamDinner(S, +v); toast(r.msg); save(); render(); },
  vacation(v) { const g = KA.group(S, +v); g.hiatus = 2; g.sched = []; KA.members(S, g).forEach(m => m.solo = null); toast(`${g.name} are off to Jeju for two weeks! 🏖️`); save(); render(); },
  // trainees
  scoutMenu() { UI.scoutG = UI.scoutG || 'any'; scoutMenu(); },
  scoutG(v) { UI.scoutG = v; scoutMenu(); },
  scout(v) { const r = KA.scout(S, v, UI.scoutG || 'any'); if (!r.ok) return toast(r.msg || 'Not possible'); save(); render(); scoutResults(); },
  sign(v) { const r = KA.sign(S, +v); if (!r.ok) return toast(r.msg); snd(990); toast(`${r.idol.name} signed!`); save(); render(); scoutResults(); tutGo('scouted'); },
  idol(v) { idolModal(+v); },
  plan(v) { const [id, p] = v.split(':'); KA.setPlan(S, +id, p); save(); render(); idolModal(+id); },
  releaseIdol(v) { modal(`${head('Release', 'Let ' + esc(S.idols[v].name) + ' go?')}<div class="btns">${B('Release', 'releaseYes', v, 'block red')}${B('Keep', 'close', '', 'block ghost')}</div>`); },
  releaseYes(v) { KA.release(S, +v); closeModal(); save(); render(); },
  practice(v) {
    const i = S.idols[+v];
    rhythm(`${i.name}'s practice session`, pct => {
      i.pw = S.week; KA.qProg(S, 'practice'); const k = pick(['vocal', 'dance', 'rap']); const gain = Math.round(pct / 25 * 10) / 10;
      i.stats.dance = clamp(i.stats.dance + gain, 0, 99); i.stats[k] = clamp(i.stats[k] + gain / 2, 0, 99); i.cond = clamp(i.cond - 4, 0, 100);
      save(); render();
      modal(`${head('Practice', pct >= 80 ? 'Amazing session! 🌟' : pct >= 50 ? 'Good work ✨' : 'Keep practicing 💦')}<p>Score: <b>${pct}%</b>. Dance +${gain}, ${k} +${gain / 2}.</p>${closeBtn()}`);
    });
  },
  rgSkip() { if (UI.rgSkip) UI.rgSkip(); },
  showMenu() { UI.pick = []; showMenu(); },
  pick(v) { v = +v; const i = S.idols[v]; if (UI.pick.includes(v)) UI.pick = UI.pick.filter(x => x !== v); else { if (UI.pick.length && S.idols[UI.pick[0]].g !== i.g) return toast('The show is all girls or all boys.'); if (UI.pick.length >= 6) return toast('Six at most.'); UI.pick.push(v); } showMenu(); },
  joinShow() { const r = KA.joinShow(S, UI.pick); if (!r.ok) return toast(r.msg); closeModal(); save(); render(); toast('Your trainees are on TV!'); },
  focus(v) { const [id, f] = v.split(':'); S.show.focus[id] = f; save(); render(); },
  showDebut() { const w = (S.showDone && S.showDone.winners || []).filter(id => S.idols[id] && S.idols[id].status === 'trainee'); debutMenu(w); },
  debutMenu() { debutMenu(); },
  gfPick(v) { v = +v; const f = UI.gf; f.members = f.members.includes(v) ? f.members.filter(x => x !== v) : f.members.concat(v); gfRender(); },
  gfColor(v) { UI.gf.color = v; gfRender(); },
  gfConcept(v) { UI.gf.concept = v; gfRender(); },
  gfMake() {
    const f = UI.gf; const r = KA.formGroup(S, f); if (!r.ok) return toast(r.msg);
    if (f.project) r.group.fans += 20000 * f.members.length;
    UI.gf = null; UI.gsel = r.group.id; UI.tab = 'groups'; snd(990); save(); render(); albumNew(r.group.id);
  },
  // groups
  gsel(v) { UI.gsel = +v; render(); },
  albumNew(v) { albumNew(+v); },
  alStep(v) { UI.al.step = clamp(UI.al.step + +v, 1, 4); alRender(); },
  alSet(v) { const [k, x] = v.split(':'); UI.al[k] = k === 'budget' ? +x : x; if (k === 'genre') UI.al.lines = KA.defaultLines(S, KA.group(S, UI.al.gid), x); alRender(); },
  alRoll() { UI.al.title = KA.titleIdea(); alRender(); },
  alLines(v) { const g = KA.group(S, UI.al.gid); if (v === 'auto') UI.al.lines = KA.defaultLines(S, g, UI.al.genre); else { const ms = KA.members(S, g).filter(m => m.status === 'idol'); const L = {}; ms.forEach(m => L[m.id] = Math.floor(100 / ms.length)); L[ms[0].id] += 100 - Object.values(L).reduce((s, x) => s + x, 0); UI.al.lines = L; } alRender(); },
  alGo() {
    const a = UI.al; const tot = Object.values(a.lines).reduce((s, x) => s + x, 0);
    if (tot <= 0) return toast('Give someone some lines!');
    const L = {}; for (const k in a.lines) L[k] = Math.round(a.lines[k] / tot * 100);
    const r = KA.planAlbum(S, a.gid, Object.assign({}, a, { lines: L })); if (!r.ok) return toast(r.msg);
    snd(990); closeModal(); save(); render(); toast(`Teasers for "${r.album.title}" are out!`);
  },
  replayMV(v) { const a = S.albums.find(x => x.id === +v); const g = KA.group(S, a.gid); modal(`${head(g.name, '"' + esc(a.title) + '" M/V')}${mvHTML(a)}<p class="small dim">${num(a.mv.views)} views · ${esc(D.MV_SETS.find(s => s.id === a.mv.set).n)} · ${esc(D.MV_STORIES.find(s => s.id === a.mv.story).n)}</p>${closeBtn()}`); setTimeout(() => playMV(a), 60); },
  mvSkip() { if (UI.stopAnim) { UI.stopAnim(); UI.stopAnim = null; } if (UI.stopSnd) { UI.stopSnd(); UI.stopSnd = null; } const c = $('#mvc'); if (c) { const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#fff'; x.font = '14px Jua, sans-serif'; x.textAlign = 'center'; x.fillText('Thanks for watching ♥', 160, 95); } },
  schedMenu(v) { schedMenu(+v); },
  sched(v) { const [g, s] = v.split(':'); const r = KA.toggleSched(S, +g, s); if (!r.ok) toast(r.msg); save(); schedMenu(+g); },
  contentMenu(v) { contentMenu(+v); },
  content(v) { const [g, c] = v.split(':'); const r = KA.startContent(S, +g, c); if (!r.ok) return toast(r.msg); toast('Filming started!'); save(); render(); contentMenu(+g); },
  tourMenu(v) { tourMenu(+v); },
  tpAdd(v) { const g = KA.group(S, UI.tp.gid), t = KA.fameTier(g.fans); if (UI.tp.stops.length >= 12) return toast('12 stops at most.'); const best = D.VENUES.filter(x => x.fame <= t).slice(-1)[0] || D.VENUES[0]; UI.tp.stops.push({ city: v, venue: best.id }); tpRender(); },
  tpDel(v) { UI.tp.stops.splice(+v, 1); tpRender(); },
  tpGo() { const r = KA.planTour(S, UI.tp.gid, UI.tp.stops); if (!r.ok) return toast(r.msg); UI.tp = null; snd(990); closeModal(); save(); render(); toast('Tour announced!'); },
  styleGroup(v) { const g = KA.group(S, +v); styleModal(g.members.find(id => S.idols[id].status === 'idol'), g.id); },
  style(v) { const i = S.idols[+v]; styleModal(+v, i.gid); },
  styOther(v) { styleModal(+v, UI.sty.gid); },
  sty(v) { const [k, x] = v.split(':'); UI.sty.look[k] = k === 'top' ? x : +x; styRender(); },
  stySave() {
    const L = UI.sty.look, O = D.OUTFITS.find(o => o.id === L.top);
    if (!S.owned.includes(O.id)) { if (S.money < O.cost) return toast('Not enough money.'); S.money -= O.cost; S.owned.push(O.id); }
    S.idols[UI.sty.id].look = Object.assign({}, L); KA.qProg(S, 'style'); snd(880); toast('Looking good!'); save(); render(); styRender();
  },
  styAll() { const L = UI.sty.look, g = KA.group(S, UI.sty.gid); KA.members(S, g).forEach(m => { m.look.top = L.top; m.look.topC = L.topC; m.look.botC = L.botC; }); toast('Everyone is matching!'); save(); render(); styRender(); },
  rehearse(v) {
    const g = KA.group(S, +v);
    rhythm(`${g.name} live rehearsal`, pct => {
      g.flags.rehearsed = S.week; const n = Math.round((pct - 50) / 5);
      KA.members(S, g).forEach(m => { m.stats.vocal = clamp(m.stats.vocal + Math.max(0, n) / 4, 0, 99); m.stats.dance = clamp(m.stats.dance + Math.max(0, n) / 3, 0, 99); m.cond = clamp(m.cond - 3, 0, 100); });
      save(); render(); modal(`${head('Rehearsal', pct >= 70 ? 'They nailed it! 🌟' : 'Some rough spots')}<p>Score ${pct}%. ${pct >= 50 ? 'Vocal and dance went up a little, which helps this week\'s live stage.' : 'Try again next week.'}</p>${closeBtn()}`);
    });
  },
  disband(v) { modal(`${head('Disband', 'Disband ' + esc(KA.group(S, +v).name) + '?')}<p>All members leave the agency. This can't be undone.</p><div class="btns">${B('Disband', 'disbandYes', v, 'block red')}${B('Keep the group', 'close', '', 'block ghost')}</div>`); },
  disbandYes(v) { KA.disband(S, +v); closeModal(); save(); render(); },
  // charts / sns
  chartSeg(v) { UI.chart = v; render(); },
  req(v) { const [id, y] = v.split(':'); const r = KA.answerReq(S, +id, y === '1'); toast(r.msg || ''); save(); render(); },
  hateResp(v) { const [id, r] = v.split(':'); const res = KA.respondHate(S, +id, r); if (res.msg) modal(`${head('Hate train', 'Result')}<p>${esc(res.msg)}</p>${closeBtn()}`); save(); render(); },
  hateNow() { closeModal(); S.q = S.q.filter(x => x.k !== 'hate'); UI.tab = 'sns'; save(); runQueue(); },
  evPick(v) { const msg = KA.resolveEvent(S, UI.ev, +v); if (msg && msg !== 'Done.') toast(msg); runQueue(); },
  awStage(v) { UI.aw.res = KA.runAward(S, UI.aw.id, +v); UI.aw.i = 0; UI.aw.open = false; save(); awardReveal(); },
  awOpen() { UI.aw.open = true; awardReveal(); },
  awNext() { UI.aw.i++; UI.aw.open = false; awardReveal(); },
  renew(v) { const r = KA.renew(S, UI.rn, v === '1'); if (r.fail) return toast(r.msg); modal(`${head('Contract', 'Decision')}<p>${esc(r.msg)}</p><div class="btns">${B('Continue', 'qnext', '', 'block')}</div>`); }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  if (el.dataset.a === 'winBg') { if (e.target === el) { UI.tab = 'hq'; render(); } return; }
  const fn = A[el.dataset.a]; if (fn) { e.preventDefault(); fn(el.dataset.v, el); }
});
document.addEventListener('input', e => {
  const k = e.target.dataset.in; if (!k) return;
  const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (k === 'agency' || k === 'ceo') UI.draft[k] = v;
  else if (k.startsWith('gf.')) UI.gf[k.slice(3)] = v;
  else if (k.startsWith('al.')) UI.al[k.slice(3)] = v;
  else if (k.startsWith('line:')) { UI.al.lines[+k.slice(5)] = +v; const b = e.target.parentElement.querySelector('.lnv'); if (b) b.textContent = v + '%'; }
  else if (k.startsWith('shot:')) UI.al.shots[+k.slice(5)] = v;
  else if (k.startsWith('venue:')) { UI.tp.stops[+k.slice(6)].venue = v; tpRender(); }
});
document.addEventListener('change', e => { const k = e.target.dataset.in; if (k && k.startsWith('shot:')) UI.al.shots[+k.slice(5)] = e.target.value; if (k && k.startsWith('line:')) alRender(); });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' && !S?.q.length && !UI.aw?.res && !document.querySelector('[data-a="qnext"],[data-a="evPick"],[data-a="awStage"],[data-a="awOpen"],[data-a="awNext"],[data-a="renew"]')) { closeModal(); render(); } });
window.addEventListener('resize', () => { if (S && !S.tut.done) showTut(); });

// boot
render();
announceUpdate(); checkUpdate();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });
setInterval(checkUpdate, 10 * 60 * 1000);
})();
