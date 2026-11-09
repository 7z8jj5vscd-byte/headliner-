/* Liner Notes: Social, Career, inbox, shows, creator, title screen. */
(function () {
const D = window.LND, LN = window.LN, UI = window.UI, A = UI.A;
const $ = UI.$, esc = UI.esc, fmt = LN.fmt, money = LN.money, card = UI.card, empty = UI.empty;

// ------------------------------------------------------------------ SOCIAL
UI.screens.social = function (S) {
  let h = UI.subtabs('social', [['feed', 'Buzzr'], ['loopr', 'Loopr'], ['news', 'News'], ['fans', 'Fans'], ['artists', 'Artists']]);
  const sub = UI.sub.social;
  if (sub === 'feed') {
    h += `<button class="btn big" data-a="postModal">New post ${UI.icon('bolt')}5</button>`;
    h += S.feed.slice(0, 40).map(p => { const me = p.who === 'P'; const n = !me && p.who !== 'Loopr' ? LN.npc(S, p.who) : null; const name = me ? S.artist.name : n ? n.name : p.who;
      return `<article class="post ${me ? 'mine' : ''}"><div class="ph">${me ? UI.portrait(S.look, 40) : `<span class="ini">${esc(name.slice(0, 1))}</span>`}<div><b>${esc(name)}</b><small>@${esc(name.replace(/[^A-Za-z0-9]/g, '').toLowerCase())} · ${LN.dateLabel(S, p.w)}</small></div></div>
      <p>${esc(p.text)}</p><small class="muted">${UI.icon('heart')} ${fmt(p.likes)}${p.viral ? ' · <b class="good">viral</b>' : ''}</small>${(p.replies || []).length ? `<div class="replies">${p.replies.map(r => `<p><b>${esc(r.who)}</b> ${esc(r.text)}</p>`).join('')}</div>` : ''}</article>`; }).join('');
  }
  if (sub === 'loopr') {
    const mine = S.songs.filter(s => s.viral && s.viral.until >= S.week);
    h += card('Trending sounds', `${mine.length ? mine.map(s => `<p class="good">"${esc(s.title)}" is trending right now.</p>`).join('') : '<p class="muted">None of your songs are trending this week.</p>'}
      <p>Songs with strong hooks and upbeat tempos are more likely to catch on. Old songs can trend too.</p><button class="btn" data-a="seedModal">Pay creators to use a song</button>`);
    const npcV = S.npcSongs.filter(s => s.viral && s.viral >= S.week).slice(0, 8);
    h += card('Also trending', npcV.length ? npcV.map(s => `<p>"${esc(s.title)}" <span class="muted">${esc(LN.artistName(S, s.npc))}</span></p>`).join('') : empty('Quiet week on Loopr.'));
  }
  if (sub === 'news') {
    const tag = UI.newsTag || 'all'; const tags = [['all', 'All'], ['you', 'You'], ['charts', 'Charts'], ['release', 'Releases'], ['beef', 'Beef'], ['trend', 'Trends'], ['awards', 'Awards'], ['industry', 'Industry']];
    h += `<div class="seg sm wrap">${tags.map(([t, n]) => `<button class="${tag === t ? 'on' : ''}" data-a="newsTag" data-t="${t}">${n}</button>`).join('')}</div>`;
    h += card('', S.news.filter(n => tag === 'all' || n.tag === tag).slice(0, 80).map(n => `<p class="news t-${n.tag}"><small>${LN.dateLabel(S, n.w)}</small>${esc(n.text)}</p>`).join('') || empty('Nothing here yet.'));
  }
  if (sub === 'fans') {
    const tot = LN.totalFans(S);
    h += card('Fans by region', D.REGIONS.map(r => `<div class="region"><div><b>${r.name}</b><small>${fmt(S.fans[r.id])} fans · mood ${Math.round(S.mood[r.id])}</small></div>${UI.bar(S.fans[r.id], Math.max(1, tot))}<div class="mood">${UI.bar(S.mood[r.id], 100, S.mood[r.id] < 35 ? 'bad' : S.mood[r.id] > 70 ? 'ok' : '')}</div></div>`).join('') + `<p class="muted">Fans stream your music and buy tickets. Mood drops when you go quiet, flop or cause a scandal.</p>`);
    h += card('Fandom', S.fandom ? `<p>Your fans are <b>${esc(S.fandom)}</b>. Fan club loyalty: ${Math.round(S.fanClub)}/100.</p>${UI.bar(S.fanClub)}<p class="muted">A loyal fan club means fewer fans drift away.</p><button class="btn ghost sm" data-a="fandomModal">Rename</button>` :
      `<p>${tot >= 5000 ? 'Your fans want a name.' : 'At 5,000 fans you can name your fandom.'}</p>${tot >= 5000 ? '<button class="btn" data-a="fandomModal">Name your fandom</button>' : ''}`);
    h += card('Public image', `<p>Right now you come across as <b>${LN.imageTop(S)}</b>.</p>${Object.entries(S.image).map(([k, v]) => `<div class="trend"><span>${k}</span>${UI.bar(v)}<b>${Math.round(v)}</b></div>`).join('')}`);
  }
  if (sub === 'artists') {
    const q = (UI.artistQ || '').toLowerCase();
    let list = S.npcs.filter(n => n.active);
    if (q) list = list.filter(n => n.name.toLowerCase().includes(q)); else list = list.sort((a, b) => (b.rival - a.rival) || Math.abs(b.rel) - Math.abs(a.rel) || b.fame - a.fame).slice(0, 60);
    h += `<label class="fld"><span class="sr">Search artists</span><input id="aq" placeholder="Search artists" value="${esc(UI.artistQ || '')}" data-input="artistSearch"></label>`;
    h += `<div id="artistList">${artistRows(S, list)}</div>`;
  }
  return h;
};
function artistRows(S, list) {
  return card('', list.map(n => `<button class="row" data-a="artistModal" data-id="${n.id}"><div><b>${esc(n.name)}</b>${n.real ? '' : ' <small class="muted">fictional</small>'}${n.own ? ' <small class="pill">your label</small>' : ''}${n.rival ? ' <small class="pill bad">rival</small>' : ''}<small>${esc(D.GENRE[n.genre].name)} · fame ${Math.round(n.fame)} · ${n.hiatus ? 'on a break' : 'active'}</small></div><span class="rel ${n.rel > 20 ? 'good' : n.rel < -20 ? 'bad' : ''}">${n.rel > 0 ? '+' : ''}${Math.round(n.rel)}</span></button>`).join('') || empty('No artists match.'));
}
A.artistSearch = () => { UI.artistQ = $('#aq').value; const S = UI.S; const q = UI.artistQ.toLowerCase(); const list = S.npcs.filter(n => n.active && (!q || n.name.toLowerCase().includes(q))).slice(0, 60); $('#artistList').innerHTML = artistRows(S, list); };
A.newsTag = d => { UI.newsTag = d.t; UI.render(); };
A.artistModal = d => {
  const S = UI.S; const n = LN.npc(S, d.id); if (!n) return;
  const songs = S.npcSongs.filter(s => s.npc === n.id || s.feat === n.id).slice(-5).reverse();
  UI.modal(`<h2>${esc(n.name)}</h2><p class="muted">${esc(D.GENRE[n.genre].name)} · ${D.REGIONS.find(r => r.id === n.region).name} · fame ${Math.round(n.fame)}${n.real ? ' · real artist (made-up storyline)' : ' · fictional artist'}</p>
  <p>Relationship with you: <b>${Math.round(n.rel)}</b>${n.rival ? ' · <b class="bad">rival</b>' : ''}</p>${UI.bar(n.rel + 100, 200, n.rel < -20 ? 'bad' : n.rel > 20 ? 'ok' : '')}
  <h3>Recent songs</h3>${songs.length ? songs.map(s => `<p>"${esc(s.title)}"${s.feat ? ` <small>${s.npc === n.id ? 'feat. ' + esc(LN.artistName(S, s.feat)) : 'with ' + esc(LN.artistName(S, s.npc))}</small>` : ''}</p>`).join('') : '<p class="muted">Nothing on the charts right now.</p>'}
  <p class="muted small">To get them on your song, pick them as the featured artist when you record. Chance they say yes: ${Math.round(LN.featureChance(S, n.id) * 100)}%.</p>
  <div class="btns">${n.rival || n.rel < -10 ? `<button class="btn" data-a="doPeace" data-id="${n.id}">Make peace ${UI.icon('bolt')}10</button><button class="btn ghost" data-a="dissTrack" data-id="${n.id}">Write a diss track</button>` : `<button class="btn ghost" data-a="dissPost" data-id="${n.id}">Call them out</button>`}</div>`);
};
A.doPeace = d => UI.result(LN.makePeace(UI.S, d.id));
A.dissTrack = d => { UI.closeModal(true); A.writeModal({ diss: d.id }); };
A.dissPost = d => UI.result(LN.post(UI.S, 'diss', { target: d.id }));
A.postModal = () => {
  const S = UI.S; const left = 3 - (S.week_.posts || 0);
  UI.modal(`<h2>Post on Buzzr</h2><p class="muted">${left} post${left === 1 ? '' : 's'} left this week.</p>
  <label class="fld">Write your own (optional) <textarea id="p-text" maxlength="200" rows="2" placeholder="Leave empty to use a suggested caption"></textarea></label>
  <div class="choices">${LN.POSTS.filter(p => p.id !== 'diss').map(p => `<button class="choice" data-a="doPost" data-t="${p.id}"><b>${p.name}</b><small>${{ update: 'Small hype boost.', photo: 'Show off your look. A stylist helps.', teaser: 'Builds buzz for an upcoming release.', thanks: 'Fan mood up.', hottake: 'Big reach. Might start an argument.', apology: 'Use it after a scandal.' }[p.id]}</small></button>`).join('')}</div>`);
};
A.doPost = d => UI.result(LN.post(UI.S, d.t, { text: $('#p-text').value }));
A.seedModal = () => {
  const S = UI.S; const list = S.songs.filter(s => s.rel).sort((a, b) => b.q - a.q);
  if (!list.length) return UI.toast('Release a song first.', 'bad');
  UI.modal(`<h2>Seed a Loopr trend</h2><label class="fld">Song <select id="sd-song">${list.map(s => `<option value="${s.id}">${esc(s.title)} (q${s.q})</option>`).join('')}</select></label>
  <label class="fld">Budget <select id="sd-bud">${[1000, 5000, 20000, 100000, 500000].map(b => `<option value="${b}">${money(b)}</option>`).join('')}</select></label><button class="btn" data-a="doSeed">Pay creators</button>`);
};
A.doSeed = () => UI.result(LN.seedLoopr(UI.S, $('#sd-song').value, +$('#sd-bud').value));
A.fandomModal = () => { UI.modal(`<h2>Name your fandom</h2><label class="fld">Name <input id="fd" maxlength="24" value="${esc(UI.S.fandom || '')}" placeholder="e.g. The Night Owls"></label><button class="btn" data-a="doFandom">Save</button>`); };
A.doFandom = () => UI.result(LN.nameFandom(UI.S, $('#fd').value));

// ------------------------------------------------------------------ CAREER
UI.screens.career = function (S) {
  let h = UI.subtabs('career', [['live', 'Live'], ['industry', 'Industry'], ['awards', 'Awards'], ['life', 'Life'], ['movies', 'Movies'], ['settings', 'Game']]);
  const sub = UI.sub.career;
  if (sub === 'live') h += liveTab(S);
  if (sub === 'industry') h += industryTab(S);
  if (sub === 'awards') h += awardsTab(S);
  if (sub === 'life') h += lifeTab(S);
  if (sub === 'movies') h += moviesTab(S);
  if (sub === 'settings') h += settingsTab(S);
  return h;
};
function liveTab(S) {
  let h = `<div class="btnrow"><button class="btn" data-a="gigModal">Play a gig</button><button class="btn" data-a="tourModal" ${LN.isTouring(S) ? 'disabled' : ''}>Plan a tour</button><button class="btn ghost" data-a="merchModal">Design merch</button></div>`;
  if (LN.isTouring(S)) { const T = S.tour; h += card(`On tour: ${esc(T.name)}`, `<p>${D.VENUES.find(v => v.id === T.venue).name}s · ${money(T.price)} tickets · ${LN.STAGES[T.stage].name}</p><ol class="dates">${T.shows.map(sh => `<li class="${sh.done ? 'done' : ''}"><b>${esc(sh.city)}</b>${sh.done ? (sh.cancelled ? ' <small class="bad">cancelled</small>' : ` <small>${fmt(sh.att)}/${fmt(sh.cap)} · rating ${sh.rating}</small>`) : ''}</li>`).join('')}</ol>`); }
  h += card('Upcoming festivals', S.bookings.length ? S.bookings.map(b => `<p><b>${esc(b.fest)}</b> · ${D.FEST_SLOTS.find(x => x.id === b.slot).name} · ${LN.dateLabel(S, b.week)} · ${money(b.fee)}</p>`).join('') : empty('Festival offers arrive about 8 weeks before each festival once you are famous enough (fame 15 for an opening slot).'));
  h += card('Recent shows', S.shows.length ? S.shows.slice(0, 12).map(s => `<p>${LN.dateLabel(S, s.w)} · <b>${esc(s.venue)}</b>, ${esc(s.city)} · ${fmt(s.att)}/${fmt(s.cap)} · rating ${s.rating}${s.tour ? ' <small class="muted">' + esc(s.tour) + '</small>' : ''}</p>`).join('') : empty('No shows yet.'));
  h += card('Past tours', S.tours.length ? S.tours.slice().reverse().map(t => `<p><b>${esc(t.name)}</b> · ${t.shows} ${t.venue.toLowerCase()} shows · ${fmt(t.att)} fans · earned ${money(t.gross)} (cost ${money(t.cost)}) · rating ${t.rating}</p>`).join('') : empty('No tours yet.'));
  h += card('Merch', S.merch.length ? S.merch.slice().reverse().map(m => `<div class="row"><div class="merchrow">${merchSVG(m.item, m.color, m.print, 44)}<div><b>${esc(m.name)}</b><small>${money(m.price)} · ${fmt(m.stock)} left · ${fmt(m.sold)} sold</small></div></div></div>`).join('') : empty('No merch yet. Design some to earn money online and at shows.'));
  return h;
}
function merchSVG(item, color, print, size = 120) {
  const p = esc(String(print || '').slice(0, 14)); const ink = ['#f4f4f6', '#ffd23f', '#c0c4cc'].includes(color) ? '#1d1d24' : '#ffffff';
  const shapes = {
    tee: `<path d="M30 20 L45 12 Q60 22 75 12 L90 20 L104 38 L90 46 L88 108 L32 108 L30 46 L16 38 Z" fill="${color}" stroke="#0004"/>`,
    hoodie: `<path d="M30 22 L46 12 Q60 30 74 12 L90 22 L106 70 L92 74 L88 108 L32 108 L28 74 L14 70 Z" fill="${color}" stroke="#0004"/><path d="M46 12 Q60 38 74 12" fill="none" stroke="#0005" stroke-width="3"/>`,
    cap: `<path d="M24 74 Q24 30 60 30 Q96 30 96 74 Z" fill="${color}" stroke="#0004"/><path d="M60 74 L112 80 L100 88 L60 82 Z" fill="${color}" stroke="#0004"/>`,
    poster: `<rect x="26" y="10" width="68" height="100" fill="${color}" stroke="#0004"/>`,
    vinyl: `<rect x="14" y="14" width="92" height="92" fill="${color}"/><circle cx="74" cy="60" r="40" fill="#111"/><circle cx="74" cy="60" r="11" fill="#ff7a45"/>`,
  };
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">${shapes[item] || shapes.tee}<text x="60" y="${item === 'cap' ? 60 : 66}" text-anchor="middle" font-size="${item === 'cap' ? 10 : 11}" font-weight="800" fill="${ink}" font-family="sans-serif">${p}</text></svg>`;
}
UI.merchSVG = merchSVG;
A.merchModal = () => {
  const m = UI.merchDraft = UI.merchDraft || { item: 'tee', color: '#1d1d24', print: 'Your name', qty: 200, price: 30 };
  const S = UI.S; const it = D.MERCH.find(x => x.id === m.item); const printText = m.print === 'Your name' ? S.artist.name : m.print === 'Fandom name' ? (S.fandom || S.artist.name) : m.print === 'Album cover' ? ((S.releases.filter(r => r.out && r.type !== 'single').pop() || {}).title || S.artist.name) : m.print === 'Tour dates' ? (S.tour ? S.tour.name : 'World Tour') : 'Your face';
  UI.modal(`<h2>Design merch</h2><div class="merchbox">${merchSVG(m.item, m.color, printText, 150)}<div>
  <div class="seg sm wrap">${D.MERCH.map(x => `<button class="${m.item === x.id ? 'on' : ''}" data-a="merchSet" data-k="item" data-v="${x.id}">${x.name}</button>`).join('')}</div>
  <span class="swatches">${D.CLOTH_COLORS.map(c => `<button class="sw ${c === m.color ? 'on' : ''}" style="background:${c}" data-a="merchSet" data-k="color" data-v="${c}" aria-label="color ${c}"></button>`).join('')}</span>
  <label class="fld">Print <select id="m-print" data-change="merchPrint">${D.MERCH_PRINTS.map(p => `<option ${p === m.print ? 'selected' : ''}>${p}</option>`).join('')}</select></label></div></div>
  <div class="two"><label class="fld">Price ($) <input id="m-price" type="number" min="5" max="500" value="${m.price}"></label><label class="fld">Quantity <input id="m-qty" type="number" min="25" max="200000" step="25" value="${m.qty}"></label></div>
  <p class="muted">Costs ${money(it.cost)} each to make. Suggested price ${money(it.price)}. Higher prices sell fewer.</p><button class="btn" data-a="doMerch">Print it</button>`);
};
A.merchSet = d => { UI.merchDraft[d.k] = d.v; if (d.k === 'item') UI.merchDraft.price = D.MERCH.find(x => x.id === d.v).price; A.merchModal(); };
A.merchPrint = () => { UI.merchDraft.print = $('#m-print').value; A.merchModal(); };
A.doMerch = () => { const m = UI.merchDraft; const S = UI.S; const pt = m.print === 'Your name' ? S.artist.name : m.print === 'Fandom name' ? (S.fandom || S.artist.name) : m.print; UI.result(LN.designMerch(S, { item: m.item, color: m.color, print: pt, price: +$('#m-price').value, qty: +$('#m-qty').value })); };

// gigs
A.gigModal = () => {
  const S = UI.S;
  UI.modal(`<h2>Play a gig</h2><label class="fld">City <select id="g-city" data-change="gigInfo">${D.CITIES.map(c => `<option ${c.name === S.artist.city ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
  <div class="choices" id="g-venues"></div><label class="chk"><input type="checkbox" id="g-benefit"> Benefit show (no pay, the money goes to charity)</label>`);
  A.gigInfo();
};
A.gigInfo = () => {
  const S = UI.S; const city = D.CITIES.find(c => c.name === $('#g-city').value);
  $('#g-venues').innerHTML = D.VENUES.filter(v => v.id !== 'arena' && v.id !== 'stadium').map(v => { const open = LN.venueOpen(S, v, city.region);
    return `<button class="choice" data-a="doGig" data-v="${v.id}" ${open ? '' : 'disabled'}><b>${v.name} · ${v.cap.toLocaleString()} capacity</b><small>${open ? `Tickets ${money(v.basePrice)} · ${UI.icon('bolt')}${v.energy}` : `Needs ${fmt(v.minFans * 0.8)} fans in ${D.REGIONS.find(r => r.id === city.region).name}`}${city.region !== S.artist.region ? ' · $800 travel' : ''}</small></button>`; }).join('') + '<p class="muted small">Arenas and stadiums are booked through tours.</p>';
};
A.doGig = d => {
  const S = UI.S; const r = LN.playGig(S, d.v, $('#g-city').value, { benefit: $('#g-benefit').checked });
  if (!r.ok) return UI.result(r, { keepModal: true });
  UI.result({ ok: true }); UI.showNight({ title: `${r.venue.name} · ${r.city}`, setlist: r.setlist, rating: r.rating, crowd: r.crowd, cap: r.cap, att: r.att, summary: r.msg });
};

// tours
A.tourModal = () => {
  const S = UI.S; const T = UI.tourDraft = UI.tourDraft || { name: (S.releases.filter(r => r.out && r.type !== 'single').pop() || { title: S.artist.name }).title + ' Tour', venue: 'club', price: 20, stage: 0, cities: [], opener: '', setlist: LN.defaultSetlist(S) };
  const released = S.songs.filter(s => s.rel && !s.isRemix && !s.live);
  const v = D.VENUES.find(x => x.id === T.venue);
  T.cities = T.cities.filter(c => LN.venueOpen(S, v, D.CITIES.find(x => x.name === c).region));
  const openers = S.npcs.filter(n => n.active && !n.hiatus && !n.rival && n.fame < LN.fame(S) + 5).sort((a, b) => b.rel - a.rel || b.fame - a.fame).slice(0, 40);
  UI.modal(`<h2>Plan a tour</h2><label class="fld">Tour name <input id="t-name" maxlength="40" value="${esc(T.name)}"></label>
  <h3>Venue size</h3><div class="seg sm wrap">${D.VENUES.filter(x => x.id !== 'openmic').map(x => `<button class="${T.venue === x.id ? 'on' : ''}" data-a="tourSet" data-k="venue" data-v="${x.id}">${x.name} (${fmt(x.cap)})</button>`).join('')}</div>
  <div class="two"><label class="fld">Ticket price ($) <input id="t-price" type="number" min="5" max="1000" value="${T.price}"></label>
  <label class="fld">Stage <select id="t-stage">${LN.STAGES.map((s, i) => `<option value="${i}" ${+T.stage === i ? 'selected' : ''}>${s.name} · ${money(s.cost)}</option>`).join('')}</select></label></div>
  <label class="fld">Opening act or co-headliner <select id="t-open"><option value="">None</option>${openers.map(n => `<option value="${n.id}" ${T.opener === n.id ? 'selected' : ''}>${esc(n.name)} · ${money(LN.featureFee(S, n.id) * 0.5)}</option>`).join('')}</select></label>
  <h3>Cities <small class="muted">${T.cities.length} picked, 2 shows a week</small></h3>
  ${D.REGIONS.map(r => `<div class="cityreg"><small>${r.name} · ${fmt(S.fans[r.id])} fans</small><div class="chips">${D.CITIES.filter(c => c.region === r.id).map(c => { const open = LN.venueOpen(S, v, r.id); const on = T.cities.includes(c.name); return `<button class="chip ${on ? 'on' : ''}" data-a="tourCity" data-c="${esc(c.name)}" ${open ? '' : 'disabled'}>${esc(c.name)}</button>`; }).join('')}</div></div>`).join('')}
  <h3>Setlist <small class="muted">${T.setlist.length} songs · quality ${Math.round(LN.setlistQuality(S, T.setlist))}/100</small></h3>
  <div class="chips">${released.map(s => `<button class="chip ${T.setlist.includes(s.id) ? 'on' : ''}" data-a="tourSong" data-id="${s.id}">${esc(s.title)}</button>`).join('') || '<p class="muted">Release songs first.</p>'}</div>
  <p class="muted small">Setlists of 8 to 18 songs with your hits and a mix of tempos score best.</p>
  <p class="info">Upfront cost: <b>${money(LN.tourCost(S, Object.assign({}, T, { stage: +T.stage })))}</b> · each tour week costs 40 energy.</p>
  <button class="btn" data-a="doTour">Book the tour</button>`, { noFocus: true });
};
function tourKeep() { const T = UI.tourDraft; const n = $('#t-name'); if (n) { T.name = n.value; T.price = +$('#t-price').value; T.stage = +$('#t-stage').value; T.opener = $('#t-open').value; } }
A.tourSet = d => { tourKeep(); UI.tourDraft[d.k] = d.v; if (d.k === 'venue') UI.tourDraft.price = D.VENUES.find(v => v.id === d.v).basePrice; A.tourModal(); };
A.tourCity = d => { tourKeep(); const T = UI.tourDraft; const i = T.cities.indexOf(d.c); if (i >= 0) T.cities.splice(i, 1); else T.cities.push(d.c); A.tourModal(); };
A.tourSong = d => { tourKeep(); const T = UI.tourDraft; const i = T.setlist.indexOf(d.id); if (i >= 0) T.setlist.splice(i, 1); else T.setlist.push(d.id); A.tourModal(); };
A.doTour = () => { tourKeep(); const T = UI.tourDraft; const r = LN.planTour(UI.S, Object.assign({}, T, { opener: T.opener || null })); if (r.ok) UI.tourDraft = null; UI.result(r, { keepModal: !r.ok }); };
A.watchTour = () => { const S = UI.S; const T = S.tour; if (!T) return; const last = T.shows.filter(s => s.done && !s.cancelled).pop(); if (!last) return; UI.showNight({ title: `${T.name} · ${last.city}`, setlist: T.setlist, rating: last.rating, crowd: last.crowd || 0.8, cap: last.cap, att: last.att, summary: `${fmt(last.att)} of ${fmt(last.cap)} came. Rating ${last.rating}/100.` }); };

// industry
function industryTab(S) {
  let h = '';
  if (S.label) { const L = S.label;
    h += card(`Your label: ${esc(L.name)}`, `<p>${L.tier} label · ${Math.round(L.royalty * 100)}% royalty · ${L.masters === 'label' ? 'they own your masters' : 'you own your masters'}</p>
    <p>Albums delivered: <b>${L.delivered} of ${L.albums}</b> · advance still to pay back: <b>${money(L.recoup)}</b></p><p>How happy they are: ${Math.round(L.sat)}/100</p>${UI.bar(L.sat, 100, L.sat < 30 ? 'bad' : 'ok')}
    <p class="muted">${S.week - L.lastAlbum > 70 ? 'They want a new album soon.' : 'Deliver albums and hits to keep them happy. Flops can get you dropped.'}</p><button class="btn ghost sm" data-a="leaveLabel">Buy out the contract · ${money(LN.leaveLabelCost(S))}</button>`); }
  else h += card('Record deal', `<p>You are independent. You keep about 85% of your streaming and sales money, but you get no label push.</p><p class="muted">Labels send offers to your inbox as your fame grows. Indie labels start looking at fame 8, majors at about 45. A manager brings more offers.</p>`);
  const offers = S.inbox.filter(i => i.kind === 'label');
  if (offers.length) h += card('Label offers', offers.map(o => `<button class="row" data-a="openInbox" data-id="${o.id}"><div><b>${esc(o.title)}</b><small>${esc(o.text)}</small></div></button>`).join(''));
  h += card('Team', Object.entries(D.TEAM).map(([role, T]) => { const t = S.team[role];
    return `<div class="row team"><div><b>${T.name}</b><small>${T.text}</small><small>${t ? `${T.tiers[t - 1].n} · ${money(T.tiers[t - 1].pay)}/week${T.tiers[t - 1].cut ? ' + ' + Math.round(T.tiers[t - 1].cut * 100) + '% cut' : ''}` : 'Not hired'}</small></div>
    <div class="btns col">${T.tiers.map((x, i) => i + 1 === t ? '' : `<button class="btn sm ${i + 1 > t ? '' : 'ghost'}" data-a="hire" data-r="${role}" data-t="${i + 1}">${x.n}</button>`).join('')}${t ? `<button class="btn sm ghost" data-a="fire" data-r="${role}">Let go</button>` : ''}</div></div>`; }).join(''));
  // own label
  if (S.ownLabel) { const O = S.ownLabel;
    h += card(`Your label: ${esc(O.name)}`, `<p>Earned ${money(O.earned)} so far · ${money(O.weekEarned)} last week. Your label takes 30% of its artists' streaming income.</p>
    <h3>Roster</h3>${O.roster.length ? O.roster.map(id => { const n = LN.npc(S, id); if (!n) return ''; return `<div class="row"><div><b>${esc(n.name)}</b><small>${D.GENRE[n.genre].name} · fame ${Math.round(n.fame)} · potential ${n.potential} · ${n.releases} release(s)</small></div><div class="btns col"><button class="btn sm" data-a="fundModal" data-id="${n.id}">Fund a release</button><button class="btn sm ghost" data-a="dropArtist" data-id="${n.id}">Release from contract</button></div></div>`; }).join('') : empty('No artists yet.')}
    <h3>Unsigned talent</h3>${O.prospects.map((p, i) => `<div class="row"><div><b>${esc(p.name)}</b><small>${D.GENRE[p.genre].name} · potential ${p.potential} · fame ${p.fame}</small></div><button class="btn sm" data-a="signProspect" data-i="${i}">Sign · ${money(p.ask)}</button></div>`).join('') || empty('New prospects show up every 8 weeks.')}
    <p class="muted small">Record with your artists by picking them as a feature when you record. They always say yes.</p>`); }
  else h += card('Start your own label', `<p>Sign new artists, fund their releases and take a share of what they earn. Needs fame 45 and ${money(LN.OWN_LABEL_COST)}.</p><button class="btn" data-a="labelStartModal" ${LN.fame(S) < 45 ? 'disabled' : ''}>Start a label</button>`);
  // money & masters
  const rels = S.releases.filter(r => r.out && r.type !== 'remix');
  h += card('Royalties and masters', rels.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Release</th><th>Masters</th><th>Your share</th><th>Earned</th></tr></thead><tbody>${rels.slice().reverse().map(r => `<tr data-a="relModal" data-id="${r.id}"><td>${esc(r.title)}</td><td>${!r.masters || r.masters === 'artist' ? 'You' : esc((D.LABELS.find(l => l.id === r.masters) || {}).name || '')}</td><td>${Math.round(LN.payShare(S, r) * 100)}%</td><td>${money((r.revenue || 0) + r.songs.reduce((a, id) => a + ((LN.song(S, id) || {}).revenue || 0), 0))}</td></tr>`).join('')}</tbody></table></div><p class="muted small">Tap a release to buy back its masters.</p>` : empty('Release music to start earning royalties.'));
  // brands
  h += card('Brand deals and products', `${S.deals.length ? S.deals.map(d => `<p><b>${esc(d.brand)}</b> · campaign until ${LN.dateLabel(S, d.until)}</p>`).join('') : '<p class="muted">Brands send offers once you reach fame 28. They pay more when they fit your image.</p>'}
    <h3>Your own products</h3>${D.PRODUCT_LINES.map(p => { const own = S.products.find(x => x.id === p.id); return `<div class="row"><div><b>${p.name}</b><small>${own ? `Launched · earned ${money(own.earned)}` : `Costs ${money(p.cost)} · needs fame ${p.minFame}`}</small></div>${own ? '' : `<button class="btn sm" data-a="launchProduct" data-id="${p.id}" ${LN.fame(S) < p.minFame ? 'disabled' : ''}>Launch</button>`}</div>`; }).join('')}`);
  return h;
}
A.hire = d => UI.result(LN.hire(UI.S, d.r, +d.t));
A.fire = d => UI.result(LN.fire(UI.S, d.r));
A.leaveLabel = () => UI.modal(`<h2>Buy out your contract?</h2><p>You pay ${money(LN.leaveLabelCost(UI.S))} and become independent. The label keeps the masters it owns.</p><div class="btns"><button class="btn" data-a="doLeaveLabel">Pay and leave</button><button class="btn ghost" data-a="closeModal">Stay</button></div>`);
A.doLeaveLabel = () => UI.result(LN.leaveLabel(UI.S));
A.labelStartModal = () => UI.modal(`<h2>Start a label</h2><label class="fld">Label name <input id="ol-name" maxlength="32" value="${esc(UI.S.artist.name)} Records"></label><p>Costs ${money(LN.OWN_LABEL_COST)}.</p><button class="btn" data-a="doStartLabel">Open the doors</button>`);
A.doStartLabel = () => UI.result(LN.startLabel(UI.S, $('#ol-name').value));
A.signProspect = d => UI.result(LN.signProspect(UI.S, +d.i));
A.dropArtist = d => UI.result(LN.dropArtist(UI.S, d.id));
A.fundModal = d => { const n = LN.npc(UI.S, d.id); UI.modal(`<h2>Fund a release for ${esc(n.name)}</h2><p>A bigger budget means a bigger push and faster growth.</p><div class="choices">${[10000, 50000, 200000, 1000000].map(b => `<button class="choice" data-a="doFund" data-id="${n.id}" data-b="${b}"><b>${money(b)}</b></button>`).join('')}</div>`); };
A.doFund = d => UI.result(LN.fundRelease(UI.S, d.id, +d.b));
A.launchProduct = d => UI.result(LN.launchProduct(UI.S, d.id));

// awards
function awardsTab(S) {
  let h = '';
  const shows = Object.values(S.shows_).sort((a, b) => b.week - a.week);
  const upcoming = Object.values(D.AWARD_SHOWS).map(A0 => { const wk = LN.wk(S); const n = (A0.week - wk + 52) % 52; return `<p><b>${A0.name}</b> · in ${n || 52} weeks (week ${A0.week}) · nominations in week ${A0.nomWeek}</p>`; }).join('');
  h += card('Award season', upcoming);
  h += card('Ceremonies', shows.length ? shows.map(sh => `<div class="row"><div><b>${esc(sh.name)} ${sh.year}</b><small>${sh.held ? 'Held' : 'Nominations out · ceremony ' + LN.dateLabel(S, sh.week)}${sh.cats.some(c => c.noms.some(n => n.P)) ? ' · you were nominated' : ''}</small></div><button class="btn sm ghost" data-a="${sh.held ? 'watchCeremony' : 'viewNoms'}" data-key="${sh.key}">${sh.held ? 'Watch' : 'Nominees'}</button></div>`).join('') : empty('The first nominations come out later this year.'));
  h += card('Your awards', S.awards.length ? S.awards.slice().reverse().map(a => `<p><b>${esc(a.show)} ${a.year}</b>: ${a.won.length ? `<span class="good">won ${esc(a.won.join(', '))}</span>` : ''}${a.won.length && a.nominated.length > a.won.length ? ' · ' : ''}${a.nominated.length > a.won.length ? `nominated for ${esc([...new Set(a.nominated.filter(x => !a.won.includes(x)))].join(', '))}` : ''}</p>`).join('') : empty('No nominations yet.'));
  const plaques = S.songs.filter(s => s.cert).map(s => ({ t: s.title, c: s.cert, k: 'Single' })).concat(S.releases.filter(r => r.cert).map(r => ({ t: r.title, c: r.cert, k: LN.relTypeName(r.type) }))).sort((a, b) => b.c - a.c);
  h += card('Plaque wall', plaques.length ? `<div class="plaques">${plaques.map(p => `<div class="plaque c${Math.min(6, p.c)}"><i></i><b>${esc(p.t)}</b><small>${LN.certName(p.c)} ${p.k.toLowerCase()}</small></div>`).join('')}</div>` : empty('Gold at 500,000 North American units, platinum at 1 million, diamond at 10 million.'));
  const got = Object.keys(S.achievements).length;
  h += card(`Achievements <span class="pill">${got}/${D.ACHIEVEMENTS.length}</span>`, `<div class="achs">${D.ACHIEVEMENTS.map(([id, n, t]) => `<div class="ach ${S.achievements[id] != null ? 'on' : ''}"><b>${esc(n)}</b><small>${esc(t)}</small></div>`).join('')}</div>`);
  h += card('Legacy', `<p>Legacy score <b>${Math.round(S.legacy)}</b>. ${S.hof ? '<span class="good">You are in the Hall of Fame.</span>' : `Hall of Fame needs ${LN.HOF_SCORE} and at least 10 years (you have ${LN.careerYears(S)}).`}</p>${UI.bar(Math.min(S.legacy, LN.HOF_SCORE), LN.HOF_SCORE)}`);
  h += card('Career timeline', `<ol class="timeline">${S.timeline.slice().reverse().slice(0, 80).map(t => `<li class="k-${t.kind}"><small>${LN.dateLabel(S, t.w)}</small>${esc(t.text)}</li>`).join('')}</ol>`);
  return h;
}
A.viewNoms = d => { const sh = UI.S.shows_[d.key]; if (!sh) return; UI.modal(`<h2>${esc(sh.name)} ${sh.year} nominees</h2>${sh.cats.map(c => `<h3>${esc(c.name)}</h3><ul class="noms">${c.noms.map(n => `<li class="${n.P ? 'mine' : ''}"><b>${esc(n.t)}</b> <small>${esc(n.ar)}</small></li>`).join('')}</ul>`).join('')}`); };

// life
function lifeTab(S) {
  let h = '';
  h += card('Wardrobe', `<div class="wardrobe"><div class="prev3d" id="wardPrev">${UI.svgAvatar(S.look, 160)}</div><div><p>Change your look, buy new pieces and save looks for each album era.</p><button class="btn" data-a="wardrobeModal">Open wardrobe</button></div></div>`);
  if (S.eras.length) h += card('Eras', `<div class="eras">${S.eras.slice().reverse().map(e => `<div class="era">${UI.portrait(e.look, 90)}<b>${esc(e.title)}</b><small>${LN.dateLabel(S, e.w)}</small><button class="btn sm ghost" data-a="wearEra" data-rel="${e.rel}">Wear again</button></div>`).join('')}</div>`);
  // money
  const L = {}; for (const w of S.ledgerHist.slice(0, 52)) for (const k in w) if (k !== 'w') L[k] = (L[k] || 0) + w[k];
  const rows = Object.entries(L).sort((a, b) => b[1] - a[1]);
  h += card('Money', `<p>Bank <b>${money(S.money)}</b> · net worth <b>${money(LN.netWorth(S))}</b> · career earnings ${money(S.stats.earned)}</p>
    <p class="muted">Taxable income so far this year: ${money(Math.max(0, S.taxable))}. Taxes (10% / 25% / 37% brackets) are paid in week 52.</p>
    <h3>Last 52 weeks</h3>${rows.length ? `<div class="ledger">${rows.map(([k, v]) => `<div><span>${esc(k)}</span><b class="${v < 0 ? 'bad' : 'good'}">${money(v)}</b></div>`).join('')}</div>` : empty('No money in or out yet.')}
    ${S.loan ? `<p class="warn">Student loan: ${money(S.loan.weekly)} a week for ${S.loan.weeks} more weeks.</p>` : ''}`);
  h += card('Homes', D.HOMES.map(x => { const own = S.homes.includes(x.id); const here = S.home === x.id;
    return `<div class="row"><div><b>${x.name}</b>${here ? ' <small class="pill">you live here</small>' : ''}<small>${x.rent ? 'Rent ' + money(x.upkeep) + '/week' : x.cost ? money(x.cost) + ' · upkeep ' + money(x.upkeep) + '/week' : 'Free'} · rest bonus +${x.rest}</small></div>
    <div class="btns col">${here ? '' : own ? `<button class="btn sm ghost" data-a="buyHome" data-id="${x.id}">Move in</button>` : `<button class="btn sm" data-a="buyHome" data-id="${x.id}">${x.rent ? 'Rent' : 'Buy'}</button>`}${own && x.id !== 'h0' && !here ? `<button class="btn sm ghost" data-a="sellHome" data-id="${x.id}">${x.rent ? 'Move out' : 'Sell'}</button>` : ''}</div></div>`; }).join(''));
  h += card('Cars', D.CARS.map(c => { const own = S.cars.includes(c.id); return `<div class="row"><div><b>${c.name}</b><small>${money(c.cost)} · upkeep ${money(c.upkeep)}/week</small></div>${own ? `<button class="btn sm ghost" data-a="sellCar" data-id="${c.id}">Sell</button>` : `<button class="btn sm" data-a="buyCar" data-id="${c.id}">Buy</button>`}</div>`; }).join(''));
  h += card('Investments', D.INVESTMENTS.map(i => `<div class="row"><div><b>${i.name}</b><small>${S.invest[i.id] ? 'Worth ' + money(S.invest[i.id]) : 'Nothing invested'} · ${i.vol === 0 ? 'safe' : i.vol < 0.3 ? 'some risk' : 'high risk'}</small></div><div class="btns col"><button class="btn sm" data-a="investModal" data-id="${i.id}">Invest</button>${S.invest[i.id] ? `<button class="btn sm ghost" data-a="withdraw" data-id="${i.id}">Cash out</button>` : ''}</div></div>`).join(''));
  h += card('Charity', `<p>You have given ${money(S.charity)} so far.</p><button class="btn" data-a="donateModal">Donate</button> <button class="btn ghost" data-a="gigModal">Play a benefit show</button>`);
  UI.after = () => { const el = $('#wardPrev'); if (el && window.L3 && L3.available()) { el.innerHTML = ''; L3.preview(el, S.look); } };
  return h;
}
A.buyHome = d => UI.result(LN.buyHome(UI.S, d.id));
A.sellHome = d => UI.result(LN.sellHome(UI.S, d.id));
A.buyCar = d => UI.result(LN.buyCar(UI.S, d.id));
A.sellCar = d => UI.result(LN.sellCar(UI.S, d.id));
A.withdraw = d => UI.result(LN.withdraw(UI.S, d.id));
A.investModal = d => { const i = D.INVESTMENTS.find(x => x.id === d.id); UI.modal(`<h2>Invest in ${esc(i.name.toLowerCase())}</h2><label class="fld">Amount ($) <input id="iv" type="number" min="100" step="100" value="${Math.max(100, Math.round(UI.S.money * 0.2 / 100) * 100)}"></label><button class="btn" data-a="doInvest" data-id="${i.id}">Invest</button>`); };
A.doInvest = d => UI.result(LN.invest(UI.S, d.id, +$('#iv').value));
A.donateModal = () => UI.modal(`<h2>Donate</h2><label class="fld">Cause <select id="dn-c">${D.CAUSES.map(c => `<option>${esc(c)}</option>`).join('')}</select></label><label class="fld">Amount ($) <input id="dn-a" type="number" min="100" step="100" value="1000"></label><button class="btn" data-a="doDonate">Give</button>`);
A.doDonate = () => UI.result(LN.donate(UI.S, $('#dn-c').value, +$('#dn-a').value));
A.wearEra = d => { const e = UI.S.eras.find(x => x.rel === d.rel); if (e) UI.result(LN.setLook(UI.S, e.look)); };

// wardrobe
A.wardrobeModal = () => {
  const S = UI.S; UI.ward = UI.ward || { slot: 'top', look: JSON.parse(JSON.stringify(S.look)) };
  const W = UI.ward; const slots = [['top', 'Tops'], ['bottom', 'Bottoms'], ['shoes', 'Shoes'], ['hair', 'Hair'], ['acc', 'Extras'], ['body', 'Body']];
  const colorKey = { top: 'topColor', bottom: 'bottomColor', shoes: 'shoesColor', hair: 'hairColor', acc: 'accColor' }[W.slot];
  let items = '';
  if (W.slot === 'body') items = `<h3>Skin tone</h3><span class="swatches">${D.SKINS.map(c => `<button class="sw ${W.look.skin === c ? 'on' : ''}" style="background:${c}" data-a="wardSet" data-k="skin" data-v="${c}" aria-label="skin tone"></button>`).join('')}</span><h3>Build</h3><div class="seg sm">${D.BODIES.map(b => `<button class="${W.look.body === b.id ? 'on' : ''}" data-a="wardSet" data-k="body" data-v="${b.id}">${b.name}</button>`).join('')}</div>`;
  else items = `<div class="items">${D.WARDROBE.filter(w => w.slot === W.slot).map(w => { const own = S.wardrobe.includes(w.id); const on = W.look[W.slot] === w.id;
    return `<button class="item ${on ? 'on' : ''} ${own ? '' : 'locked'}" data-a="${own ? 'wardSet' : 'wardBuy'}" data-k="${W.slot}" data-v="${w.id}"><b>${esc(w.name)}</b><small>${own ? (on ? 'Wearing' : 'Owned') : money(LN.itemPrice(S, w))}</small></button>`; }).join('')}</div>
    ${colorKey ? `<h3>Color</h3><span class="swatches">${(W.slot === 'hair' ? D.HAIR_COLORS : D.CLOTH_COLORS).map(c => `<button class="sw ${W.look[colorKey] === c ? 'on' : ''}" style="background:${c}" data-a="wardSet" data-k="${colorKey}" data-v="${c}" aria-label="color"></button>`).join('')}</span>` : ''}`;
  UI.modal(`<h2>Wardrobe</h2><div class="wardrobe big"><div class="prev3d" id="wardModalPrev">${UI.svgAvatar(W.look, 220)}</div><div class="wardctl"><div class="seg sm wrap">${slots.map(([id, n]) => `<button class="${W.slot === id ? 'on' : ''}" data-a="wardSlot" data-s="${id}">${n}</button>`).join('')}</div>${items}</div></div>
  <p class="muted small">Drag the figure to spin it.${LN.teamPower(S, 'stylist') ? ' Your stylist gets you a discount.' : ''}</p><div class="btns"><button class="btn" data-a="wardSave">Save look</button><button class="btn ghost" data-a="wardCancel">Cancel</button></div>`, { noFocus: true, onClose: () => { UI.ward = null; } });
  const el = $('#wardModalPrev'); if (el && window.L3 && L3.available()) { el.innerHTML = ''; UI.wardPrev = L3.preview(el, W.look); }
};
A.wardSlot = d => { UI.ward.slot = d.s; redrawWard(); };
A.wardSet = d => { UI.ward.look[d.k] = d.v; redrawWard(); };
A.wardBuy = d => { const r = LN.buyItem(UI.S, d.v); UI.toast(r.msg, r.ok ? '' : 'bad'); if (r.ok) { UI.ward.look[d.k] = d.v; UI.save(); } redrawWard(); };
function redrawWard() { const keepPrev = UI.wardPrev; UI.onClose = null; const W = UI.ward; A.wardrobeModal(); UI.ward = W; }
A.wardSave = () => { const W = UI.ward; UI.ward = null; UI.result(LN.setLook(UI.S, W.look)); };
A.wardCancel = () => { UI.ward = null; UI.closeModal(); };

// movies
function moviesTab(S) {
  let h = '';
  if (S.movie) { const M = S.movie; h += card(`"${esc(M.title)}"`, `<p>${D.ROLES.find(r => r.id === M.role).name} · ${esc(M.genre)}</p><p>${M.stage === 'shoot' ? `Shooting: ${M.left} week(s) left. Each week costs 35 energy.` : `Premieres ${LN.dateLabel(S, M.premiere)}.`}</p>
    <p>Soundtrack song: <b>${M.soundtrack ? esc((LN.song(S, M.soundtrack) || {}).title || '') : 'none yet'}</b></p><button class="btn ghost" data-a="soundtrackModal">Pick a soundtrack song</button>`); }
  h += card('Acting', `<p>Acting skill <b>${Math.floor(S.acting)}</b>${UI.bar(S.acting)}</p><p class="muted">Movie offers start around fame 30 (cameos). Supporting roles come at fame 42 or acting 30, leads at fame 58 or acting 50. A booking agent brings more offers. Take acting classes from Practice.</p>`);
  h += card('Filmography', S.films.length ? S.films.slice().reverse().map(f => `<p><b>${esc(f.title)}</b> (${LN.yearOf(f.w)}) · ${esc(f.role)} · ${esc(f.genre)} · ${money(f.box)} box office · critics ${f.crit}/10</p>`).join('') : empty('No movies yet.'));
  return h;
}
A.soundtrackModal = () => { const S = UI.S; const list = S.songs.filter(s => s.recorded); UI.modal(`<h2>Soundtrack</h2>${list.length ? `<div class="choices">${list.slice(-20).reverse().map(s => `<button class="choice" data-a="doSoundtrack" data-id="${s.id}"><b>${esc(s.title)}</b><small>q${s.q}${s.rel ? '' : ' · unreleased: it comes out as a single at the premiere'}</small></button>`).join('')}</div>` : empty('Record a song first.')}`); };
A.doSoundtrack = d => UI.result(LN.setSoundtrack(UI.S, d.id));

// settings
function settingsTab(S) {
  const q = (() => { try { return localStorage.getItem('ln-3d') === 'off' ? 'off' : 'on'; } catch (e) { return 'on'; } })();
  return card('Game', `<p>Save slot ${S.slot} · ${S.diff} difficulty · saves automatically every week.</p>
    <div class="btnrow"><button class="btn" data-a="helpModal">${UI.icon('help')} How to play</button><button class="btn ghost" data-a="slotsModal">Save slots</button></div>
    <label class="chk"><input type="checkbox" id="opt3d" ${q === 'on' ? 'checked' : ''} data-change="toggle3d"> 3D graphics (turn off on slow phones)</label>`) +
    card('Your stats', `<div class="ledger">${[['Songs written', S.stats.songsWritten], ['Releases', S.releases.filter(r => r.out).length], ['Shows played', S.stats.showsPlayed], ['Tickets sold', fmt(S.stats.attendance)], ['Weeks at #1', S.stats.no1Weeks], ['Best singles peak', S.stats.best.s ? '#' + S.stats.best.s : '-'], ['Best albums peak', S.stats.best.a ? '#' + S.stats.best.a : '-'], ['Career earnings', money(S.stats.earned)]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    <h3>Skills</h3>${D.SKILLS.map(k => `<div class="trend"><span>${k.name}</span>${UI.bar(S.skills[k.id])}<b>${Math.floor(S.skills[k.id])}</b></div>`).join('')}`) +
    card('Retire', `<p>End your career and see your final summary. Your save stays in its slot.</p><button class="btn danger" data-a="retireModal">Retire</button>`);
}
A.toggle3d = () => { try { localStorage.setItem('ln-3d', $('#opt3d').checked ? 'on' : 'off'); } catch (e) { } location.reload(); };
A.retireModal = () => UI.modal(`<h2>Retire from music?</h2><p>This ends your career. You can still look back at your stats, but you can't play on with this artist.</p><div class="btns"><button class="btn danger" data-a="doRetire">Retire</button><button class="btn ghost" data-a="closeModal">Keep going</button></div>`);
A.doRetire = () => { LN.retire(UI.S); UI.save(); UI.closeModal(true); UI.render(); };
A.helpModal = () => UI.modal(`<h2>How to play</h2><p>You are an unknown artist. Write songs, record them, release them, and grow from open mics to stadiums. Each turn is a week.</p>${D.HELP.map(([t, b]) => `<details><summary>${esc(t)}</summary><p>${esc(b)}</p></details>`).join('')}`);
UI.renderRetired = function () {
  const S = UI.S; $('#hud').innerHTML = `<span class="hud-name">${esc(S.artist.name)}</span><span class="hud-date">Retired</span>`; $('#nav').innerHTML = '';
  $('#main').innerHTML = card('Career summary', `<div class="me">${UI.portrait(S.look, 120)}<div><h1>${esc(S.artist.name)}</h1><p>${LN.careerYears(S)} years · retired at ${S.artist.age} · ${S.hof ? '<b class="good">Hall of Famer</b>' : 'not in the Hall of Fame'}</p></div></div>
  <div class="ledger">${[['Fans', fmt(LN.totalFans(S))], ['Net worth', money(LN.netWorth(S))], ['Legacy score', Math.round(S.legacy)], ['Releases', S.releases.filter(r => r.out).length], ['Weeks at #1', S.stats.no1Weeks], ['Awards won', S.awards.reduce((a, x) => a + x.won.length, 0)], ['Tickets sold', fmt(S.stats.attendance)], ['Achievements', Object.keys(S.achievements).length + '/' + D.ACHIEVEMENTS.length]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`) +
  card('Timeline', `<ol class="timeline">${S.timeline.slice().reverse().map(t => `<li class="k-${t.kind}"><small>${LN.dateLabel(S, t.w)}</small>${esc(t.text)}</li>`).join('')}</ol>`) + `<button class="btn big" data-a="title">Back to the title screen</button>`;
};

// ------------------------------------------------------------------ INBOX
A.openInbox = d => {
  const S = UI.S; const it = S.inbox.find(i => i.id === d.id); if (!it) return UI.render();
  const k = it.kind; const x = it.data;
  const dec = `<button class="btn ghost" data-a="inboxDo" data-id="${it.id}" data-c="decline">Decline</button>`;
  if (k === 'event') { const e = LN.EVENTS.find(v => v.id === x.ev); UI.modal(`<h2>${esc(it.title)}</h2><p>${esc(it.text)}</p><div class="choices">${(e ? e.ch : []).map((c, i) => `<button class="choice" data-a="inboxDo" data-id="${it.id}" data-c="${i}"><b>${esc(c[0])}</b></button>`).join('')}</div>`); return; }
  if (k === 'label') { UI.negotiate(it); return; }
  if (k === 'talkshow') { UI.modal(`<h2>${esc(it.title)}</h2><p>${esc(it.text)}</p><div class="btns"><button class="btn" data-a="startInterview" data-id="${it.id}">Go on the show ${UI.icon('bolt')}15</button>${dec}</div>`); return; }
  if (k === 'tv' || k === 'awardperf') { const songs = S.songs.filter(s => s.rel && !s.live).sort((a, b) => b.pts - a.pts);
    UI.modal(`<h2>${esc(it.title)}</h2><p>${esc(it.text)}</p>${songs.length ? `<label class="fld">Song <select id="tv-song">${songs.map(s => `<option value="${s.id}">${esc(s.title)}</option>`).join('')}</select></label>` : '<p class="muted">You need a released song.</p>'}<div class="btns">${songs.length ? `<button class="btn" data-a="doTv" data-id="${it.id}">Perform ${UI.icon('bolt')}20</button>` : ''}${dec}</div>`); return; }
  if (k === 'movie') { UI.modal(`<h2>${esc(it.title)}</h2><p>${esc(it.text)}</p><h3>How do you audition?</h3><div class="choices">${LN.AUDITION.map(a => `<button class="choice" data-a="doAudition" data-id="${it.id}" data-ap="${a.id}"><b>${a.name}</b><small>${a.text} Chance about ${Math.round(LN.auditionChance(S, a.id) * 100)}% · ${UI.icon('bolt')}10</small></button>`).join('')}</div>${dec}`); return; }
  if (k === 'beef') { UI.modal(`<h2>${esc(it.title)}</h2><p>${esc(it.text)}</p><div class="btns"><button class="btn" data-a="beefDiss" data-id="${it.id}" data-n="${x.npc}">Write a diss track</button><button class="btn ghost" data-a="inboxDo" data-id="${it.id}" data-c="peace">Make peace</button><button class="btn ghost" data-a="inboxDo" data-id="${it.id}" data-c="decline">Ignore</button></div>`); return; }
  UI.modal(`<h2>${esc(it.title)}</h2><p>${esc(it.text)}</p><div class="btns"><button class="btn" data-a="inboxDo" data-id="${it.id}" data-c="accept">Accept</button>${dec}</div>`);
};
A.inboxDo = d => { const c = /^\d+$/.test(d.c) ? +d.c : d.c; const r = LN.respond(UI.S, d.id, c); if (r.msg) UI.closeModal(true); UI.result(r); if (r.ok && r.msg && UI.S.inbox.find(i => i.id === d.id) == null && c !== 'decline') { } };
A.beefDiss = d => { LN.respond(UI.S, d.id, 'diss'); UI.closeModal(true); A.writeModal({ diss: d.n }); };
A.doTv = d => { const S = UI.S; const it = S.inbox.find(i => i.id === d.id); const r = LN.tvPerform(S, d.id, $('#tv-song').value); if (!r.ok) return UI.result(r, { keepModal: true }); UI.result({ ok: true });
  UI.showNight({ title: `${r.where}`, mode: it && it.kind === 'awardperf' ? 'awards' : 'tv', setlist: [r.song.id], rating: r.rating, crowd: Math.min(1, r.rating / 90), cap: 800, summary: r.msg }); };
A.doAudition = d => UI.result(LN.audition(UI.S, d.id, d.ap));
A.startInterview = d => {
  const S = UI.S; if (S.energy < LN.energyCost.interview) return UI.toast('You need 15 energy for a talk show.', 'bad');
  const it = S.inbox.find(i => i.id === d.id); UI.iv = { id: d.id, qs: LN.interviewQuestions(S), i: 0, picks: [], show: it ? it.data.show : 'the show' }; ivDraw();
};
function ivDraw() { const V = UI.iv; const q = V.qs[V.i]; UI.modal(`<h2>${esc(V.show)}</h2><p class="muted">Question ${V.i + 1} of ${V.qs.length}</p><p class="q-host">"${esc(q.q)}"</p><div class="choices">${q.a.map((a, j) => `<button class="choice" data-a="ivPick" data-j="${j}"><b>${esc(a[0])}</b></button>`).join('')}</div>`, { noClose: true }); }
A.ivPick = d => { const V = UI.iv; V.picks.push(V.qs[V.i].a[+d.j][1]); V.i++; if (V.i < V.qs.length) return ivDraw(); UI.closeModal(true); UI.result(LN.finishInterview(UI.S, V.id, V.picks)); UI.iv = null; };

UI.negotiate = function (it) {
  const S = UI.S; const o = it.data; const L = D.LABELS.find(l => l.id === o.label);
  UI.nego = UI.nego && UI.nego.id === it.id ? UI.nego : { id: it.id, advance: o.advance, royalty: o.royalty, albums: o.albums, masters: o.masters };
  const N = UI.nego; const p = LN.negotiateChance(S, it, N);
  UI.modal(`<h2>${esc(L.name)}</h2><p class="muted">${L.tier} label · reach about ${fmt(L.reach)} listeners a week for each new release · ${o.tries} tries left</p>
  <p>Their offer: ${money(o.advance)} advance, ${Math.round(o.royalty * 100)}% royalty, ${o.albums} albums, ${o.masters === 'label' ? 'label owns masters' : 'you keep masters'}.</p>
  <label class="fld">Advance: <b>${money(N.advance)}</b><input type="range" id="n-adv" min="${Math.round(o.advance * 0.5)}" max="${Math.round(o.advance * 2.5)}" step="1000" value="${N.advance}" data-input="negoUpd"></label>
  <label class="fld">Royalty: <b>${Math.round(N.royalty * 100)}%</b><input type="range" id="n-roy" min="${Math.max(0.05, o.royalty - 0.1)}" max="${Math.min(0.8, o.royalty + 0.25)}" step="0.01" value="${N.royalty}" data-input="negoUpd"></label>
  <label class="fld">Albums owed: <b>${N.albums}</b><input type="range" id="n-alb" min="1" max="5" step="1" value="${N.albums}" data-input="negoUpd"></label>
  <label class="chk"><input type="checkbox" id="n-mas" ${N.masters === 'artist' ? 'checked' : ''} data-change="negoUpd"> I keep my masters</label>
  <p class="info">Chance they accept these terms: <b id="n-p">${Math.round(p * 100)}%</b></p>
  <p class="muted small">The label keeps your royalties until the advance is paid back. Owning your masters means you keep earning from these songs after the deal ends.</p>
  <div class="btns"><button class="btn" data-a="negoSend" data-id="${it.id}">Propose these terms</button><button class="btn ghost" data-a="negoAccept" data-id="${it.id}">Accept their offer</button><button class="btn ghost" data-a="inboxDo" data-id="${it.id}" data-c="decline">Walk away</button></div>`, { noFocus: true });
};
A.negoUpd = () => { const N = UI.nego; N.advance = +$('#n-adv').value; N.royalty = +$('#n-roy').value; N.albums = +$('#n-alb').value; N.masters = $('#n-mas').checked ? 'artist' : 'label'; const it = UI.S.inbox.find(i => i.id === N.id); if (!it) return;
  const lbl = (id, t) => { const el = $('#' + id).closest('label').querySelector('b'); if (el) el.textContent = t; }; lbl('n-adv', money(N.advance)); lbl('n-roy', Math.round(N.royalty * 100) + '%'); lbl('n-alb', N.albums); $('#n-p').textContent = Math.round(LN.negotiateChance(UI.S, it, N) * 100) + '%'; };
A.negoSend = d => { const N = UI.nego; const r = LN.negotiate(UI.S, d.id, N); UI.toast(r.msg, r.ok ? 'gold' : r.counter ? '' : 'bad'); UI.save(); if (r.ok || r.gone) { UI.nego = null; UI.closeModal(true); UI.result({ ok: true }); } else { UI.nego = null; const it = UI.S.inbox.find(i => i.id === d.id); if (it) UI.negotiate(it); } };
A.negoAccept = d => { UI.nego = null; UI.result(LN.respond(UI.S, d.id, 'accept')); };

// ------------------------------------------------------------------ SHOW OVERLAYS
const CROWD = { hi: ['The crowd is screaming every word.', 'Phones up everywhere.', 'Someone in the front row is crying.', 'The whole room is jumping.', 'They chant your name between songs.'], mid: ['People are nodding along.', 'A solid reaction.', 'Some fans sing the chorus.', 'Polite applause.'], lo: ['The bar is louder than the band.', 'A few people check their phones.', 'Someone yells for a different song.', 'Half the room is at the bar.'] };
UI.showNight = function (o) {
  const S = UI.S; const songs = (o.setlist || []).map(id => LN.song(S, id)).filter(Boolean).slice(0, 12);
  const has3d = window.L3 && L3.available();
  UI.modal(`<div class="show"><div class="stage3d" id="stage3d">${has3d ? '' : `<div class="stage2d">${UI.svgAvatar(S.look, 140)}</div>`}</div>
    <div class="showinfo"><h2>${esc(o.title)}</h2><p class="muted" id="sh-now">Starting…</p><ol class="setlist" id="sh-list">${songs.map(s => `<li>${esc(s.title)}</li>`).join('')}</ol><p id="sh-sum" class="hide">${esc(o.summary || '')}</p>
    <div class="btns"><button class="btn ghost" data-a="showSkip" id="sh-skip">Skip to the end</button><button class="btn hide" id="sh-done" data-a="closeModal">Done</button></div></div></div>`, { full: true, noFocus: true, onClose: () => { clearInterval(UI._shT); L3 && L3.stop && L3.stop(); UI.nextEvent && UI.queue && UI.queue.length && UI.nextEvent(); } });
  let ctl = null; if (has3d) ctl = L3.stage($('#stage3d'), S.look, { mode: o.mode || 'show', crowd: o.crowd, cap: o.cap, caption: S.artist.name });
  let i = 0; const lines = o.rating >= 70 ? CROWD.hi : o.rating >= 45 ? CROWD.mid : CROWD.lo;
  const step = () => {
    const li = document.querySelectorAll('#sh-list li'); if (!li.length || i >= li.length) return finish();
    li.forEach((x, j) => x.classList.toggle('on', j === i)); if (i > 0) li[i - 1].classList.add('done');
    $('#sh-now').textContent = `Now playing "${songs[i].title}". ${LN.pick(lines)}`;
    if (ctl) { ctl.setCrowd(Math.min(1, (o.crowd || 0.6) * (0.7 + songs[i].q / 200))); if (songs[i].q > 70) ctl.flash(); }
    i++;
  };
  const finish = () => { clearInterval(UI._shT); const s = $('#sh-sum'); if (!s) return; document.querySelectorAll('#sh-list li').forEach(x => { x.classList.remove('on'); x.classList.add('done'); }); $('#sh-now').textContent = 'That\'s the show.'; s.classList.remove('hide'); $('#sh-skip').classList.add('hide'); $('#sh-done').classList.remove('hide'); if (ctl) ctl.setCrowd(Math.min(1, (o.crowd || 0.6) + 0.2)); };
  UI._showFinish = finish; step(); UI._shT = setInterval(step, 2600);
};
A.showSkip = () => { if (UI._showFinish) UI._showFinish(); };
UI.showVideo = function (v, msg) {
  const S = UI.S; const has3d = window.L3 && L3.available(); const c = D.CONCEPTS.find(x => x.id === v.concept) || D.CONCEPTS[0];
  UI.modal(`<div class="show"><div class="stage3d" id="stage3d" style="background:${c.bg}">${has3d ? '' : `<div class="stage2d">${UI.svgAvatar(S.look, 140)}</div>`}</div><div class="showinfo"><h2>"${esc(v.title)}"</h2><p class="muted">Directed by ${esc(v.director)} · ${esc(c.name)} · quality ${v.q}/100 · ${fmt(v.views)} views</p>${msg ? `<p>${esc(msg)}</p>` : ''}<button class="btn" data-a="closeModal">Done</button></div></div>`, { full: true, noFocus: true, onClose: () => L3 && L3.stop && L3.stop() });
  if (has3d) L3.stage($('#stage3d'), S.look, { mode: 'video', concept: c.id });
};
A.watchCeremony = d => {
  const S = UI.S; const sh = S.shows_[d.key]; if (!sh) return; UI.cer = { sh, i: 0, open: false }; const has3d = window.L3 && L3.available();
  UI.modal(`<div class="show"><div class="stage3d short" id="stage3d"></div><div class="showinfo" id="cer"></div></div>`, { full: true, noFocus: true, onClose: () => { L3 && L3.stop && L3.stop(); UI.nextEvent(); } });
  if (has3d) L3.stage($('#stage3d'), S.look, { mode: 'awards', crowd: 0.5, cap: 6000, caption: sh.name, accent: '#f2c14e' });
  cerDraw();
};
function cerDraw() {
  const C = UI.cer; const c = C.sh.cats[C.i]; const el = $('#cer'); if (!el) return;
  if (!c) { el.innerHTML = `<h2>${esc(C.sh.name)} ${C.sh.year}</h2><p>That's the show.</p><button class="btn" data-a="closeModal">Done</button>`; return; }
  el.innerHTML = `<p class="muted">${esc(C.sh.name)} ${C.sh.year} · category ${C.i + 1} of ${C.sh.cats.length}</p><h2>${esc(c.name)}</h2><ul class="noms">${c.noms.map((n, j) => `<li class="${n.P ? 'mine' : ''} ${C.open && j === c.win ? 'win' : ''} ${C.open && j !== c.win ? 'lose' : ''}"><b>${esc(n.t)}</b> <small>${esc(n.ar)}</small></li>`).join('')}</ul>
    ${C.open ? `<p class="${c.noms[c.win].P ? 'good big' : ''}">${c.noms[c.win].P ? 'You won!' : `The winner is ${esc(c.noms[c.win].t)}.`}</p><button class="btn" data-a="cerNext">${C.i + 1 < C.sh.cats.length ? 'Next category' : 'Finish'}</button>` : `<button class="btn" data-a="cerOpen">Open the envelope</button>`}`;
}
A.cerOpen = () => { UI.cer.open = true; if (UI.cer.sh.cats[UI.cer.i].noms[UI.cer.sh.cats[UI.cer.i].win].P && L3.active && L3.active.flash) L3.active.flash(); cerDraw(); };
A.cerNext = () => { UI.cer.i++; UI.cer.open = false; cerDraw(); };

// ------------------------------------------------------------------ TITLE & CREATOR
A.title = () => UI.titleScreen();
UI.titleScreen = function () {
  UI.S = null; window.L3 && L3.stop(); UI.closeModal(true);
  document.body.classList.add('titlemode');
  const slots = [1, 2, 3].map(n => [n, UI.slotInfo(n)]);
  let last = 0; try { last = +localStorage.getItem('ln-last') || 0; } catch (e) { }
  const cont = slots.find(([n, s]) => n === last && s && !s.broken && !s.retired);
  $('#hud').innerHTML = ''; $('#nav').innerHTML = '';
  $('#main').innerHTML = `<div class="title"><div class="logo"><span class="disc"></span><h1>Liner Notes</h1><p>A music career simulator. Write the songs, chase the charts, become a legend.</p></div>
    <div class="titlebtns">${cont ? `<button class="btn big" data-a="loadSlot" data-n="${cont[0]}">Continue: ${esc(cont[1].name)}</button>` : ''}<button class="btn big ${cont ? 'ghost' : ''}" data-a="newGame">New career</button></div>
    <section class="card"><h2>Save slots</h2>${slots.map(([n, s]) => `<div class="row"><div><b>Slot ${n}</b><small>${s ? (s.broken ? 'Unreadable save' : `${esc(s.name)} · ${s.retired ? 'retired' : 'week ' + ((s.week % 52) + 1) + ', ' + (2026 + Math.floor(s.week / 52))} · ${fmt(s.fans)} fans`) : 'Empty'}</small></div><div class="btns">${s && !s.broken ? `<button class="btn sm" data-a="loadSlot" data-n="${n}">Load</button>` : ''}${s ? `<button class="btn sm ghost" data-a="delSlot" data-n="${n}">Delete</button>` : ''}</div></div>`).join('')}</section>
    <p class="muted small center">Real artists appear in made-up storylines. Labels, apps, awards and festivals are fictional. Your saves stay on this device.</p>
    <button class="btn ghost" data-a="helpModal">${UI.icon('help')} How to play</button></div>`;
};
A.loadSlot = d => { const S = UI.loadSlot(+d.n); if (!S) return UI.toast('That save could not be loaded.', 'bad'); UI.start(S); };
A.delSlot = d => UI.modal(`<h2>Delete slot ${d.n}?</h2><p>This can't be undone.</p><div class="btns"><button class="btn danger" data-a="doDelSlot" data-n="${d.n}">Delete</button><button class="btn ghost" data-a="closeModal">Keep it</button></div>`);
A.doDelSlot = d => { UI.deleteSlot(+d.n); UI.closeModal(true); UI.titleScreen(); };
A.slotsModal = () => { UI.save(); UI.titleScreen(); };
UI.start = function (S) {
  UI.S = S; document.body.classList.remove('titlemode'); UI.tab = 'home'; UI.lastReport = null; UI.closeModal(true); UI.render();
};

UI.cr = null;
A.newGame = () => {
  UI.cr = { step: 0, name: '', city: 'Atlanta', genre: 'pop', story: 'bedroom', look: LN.defaultLook(), diff: 'normal', tut: true, slot: [1, 2, 3].find(n => !UI.slotInfo(n)) || 1 };
  UI.crDraw();
};
UI.crDraw = function () {
  const C = UI.cr; window.L3 && L3.stop();
  const steps = ['You', 'Story', 'Look', 'Start'];
  let body = '';
  if (C.step === 0) body = `<h2>Who are you?</h2><label class="fld">Stage name <input id="cr-name" maxlength="28" value="${esc(C.name)}" placeholder="Your stage name"></label>
    <label class="fld">Home city <select id="cr-city">${D.REGIONS.map(r => `<optgroup label="${r.name}">${D.CITIES.filter(c => c.region === r.id).map(c => `<option ${c.name === C.city ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>
    <label class="fld">Main genre <select id="cr-genre">${D.GENRES.map(g => `<option value="${g.id}" ${g.id === C.genre ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
    <p class="muted small">Your home city decides which region your first fans are in. Your genre can change song by song.</p>`;
  if (C.step === 1) body = `<h2>How did it start?</h2><div class="stories">${D.STORIES.map(s => `<button class="story ${C.story === s.id ? 'on' : ''}" data-a="crStory" data-id="${s.id}"><b>${esc(s.name)}</b><small>${esc(s.text)}</small><small class="muted">${money(s.money)} · ${fmt(s.fans)} fans · age ${s.age}</small></button>`).join('')}</div>`;
  if (C.step === 2) body = `<h2>Your look</h2><div class="wardrobe big"><div class="prev3d" id="crPrev">${UI.svgAvatar(C.look, 220)}</div><div class="wardctl">${crLook(C)}</div></div><p class="muted small">You can buy more clothes later. Drag to spin.</p>`;
  if (C.step === 3) body = `<h2>Ready?</h2><p><b>${esc(C.name || 'New Artist')}</b>, ${esc(D.STORIES.find(s => s.id === C.story).name.toLowerCase())} from ${esc(C.city)}.</p>
    <h3>Difficulty</h3><div class="seg">${[['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']].map(([id, n]) => `<button class="${C.diff === id ? 'on' : ''}" data-a="crSet" data-k="diff" data-v="${id}">${n}</button>`).join('')}</div>
    <p class="muted small">Easy pays more and is luckier. Hard means tougher competition and less money.</p>
    <h3>Save slot</h3><div class="seg">${[1, 2, 3].map(n => { const s = UI.slotInfo(n); return `<button class="${C.slot === n ? 'on' : ''}" data-a="crSet" data-k="slot" data-v="${n}">Slot ${n}${s ? ' (replace)' : ''}</button>`; }).join('')}</div>
    <label class="chk"><input type="checkbox" id="cr-tut" ${C.tut ? 'checked' : ''}> Show the tutorial</label>`;
  $('#hud').innerHTML = `<span class="hud-name">New career</span><span class="hud-date">Step ${C.step + 1} of 4</span>`; $('#nav').innerHTML = '';
  $('#main').innerHTML = `<div class="creator"><div class="steps">${steps.map((s, i) => `<span class="${i === C.step ? 'on' : i < C.step ? 'done' : ''}">${s}</span>`).join('')}</div>${card('', body)}
    <div class="btns spread"><button class="btn ghost" data-a="crBack">${C.step ? 'Back' : 'Cancel'}</button><button class="btn" data-a="crNext">${C.step === 3 ? 'Start my career' : 'Next'}</button></div></div>`;
  if (C.step === 2) { const el = $('#crPrev'); if (el && window.L3 && L3.available()) { el.innerHTML = ''; UI.crPrev = L3.preview(el, C.look); } }
};
function crLook(C) {
  const free = D.WARDROBE.filter(w => !w.price);
  const sw = (key, list) => `<span class="swatches">${list.map(c => `<button class="sw ${C.look[key] === c ? 'on' : ''}" style="background:${c}" data-a="crLook" data-k="${key}" data-v="${c}" aria-label="color"></button>`).join('')}</span>`;
  const seg = (slot) => `<div class="seg sm wrap">${free.filter(w => w.slot === slot).map(w => `<button class="${C.look[slot] === w.id ? 'on' : ''}" data-a="crLook" data-k="${slot}" data-v="${w.id}">${esc(w.name)}</button>`).join('')}</div>`;
  return `<small>Skin tone</small>${sw('skin', D.SKINS)}<small>Build</small><div class="seg sm">${D.BODIES.map(b => `<button class="${C.look.body === b.id ? 'on' : ''}" data-a="crLook" data-k="body" data-v="${b.id}">${b.name}</button>`).join('')}</div>
    <small>Hair</small>${seg('hair')}${sw('hairColor', D.HAIR_COLORS)}<small>Top</small>${seg('top')}${sw('topColor', D.CLOTH_COLORS)}<small>Bottom</small>${seg('bottom')}${sw('bottomColor', D.CLOTH_COLORS)}<small>Shoes</small>${sw('shoesColor', D.CLOTH_COLORS)}`;
}
function crKeep() { const C = UI.cr; const n = $('#cr-name'); if (n) { C.name = n.value.trim(); C.city = $('#cr-city').value; C.genre = $('#cr-genre').value; } const t = $('#cr-tut'); if (t) C.tut = t.checked; }
A.crStory = d => { UI.cr.story = d.id; const st = D.STORIES.find(s => s.id === d.id); if (st.genreHint && UI.cr.genre === 'pop') UI.cr.genre = st.genreHint; UI.crDraw(); };
A.crLook = d => { UI.cr.look[d.k] = d.v; if (UI.crPrev && UI.crPrev.update && $('#crPrev canvas')) { UI.crPrev.update(UI.cr.look); document.querySelectorAll(`[data-a="crLook"][data-k="${d.k}"]`).forEach(b => b.classList.toggle('on', b.dataset.v === d.v)); } else UI.crDraw(); };
A.crSet = d => { crKeep(); UI.cr[d.k] = d.k === 'slot' ? +d.v : d.v; UI.crDraw(); };
A.crBack = () => { crKeep(); if (!UI.cr.step) return UI.titleScreen(); UI.cr.step--; UI.crDraw(); };
A.crNext = () => {
  crKeep(); const C = UI.cr;
  if (C.step === 0 && !C.name) { UI.toast('Pick a stage name.', 'bad'); return; }
  if (C.step < 3) { C.step++; UI.crDraw(); window.scrollTo(0, 0); return; }
  $('#main').innerHTML = `<div class="loading"><span class="disc spin"></span><p>Pressing your first record…</p></div>`;
  setTimeout(() => { const S = LN.newGame({ name: C.name, city: C.city, genre: C.genre, story: C.story, look: C.look, diff: C.diff, slot: C.slot, tutorial: C.tut }); UI.S = S; UI.save(); UI.start(S); }, 30);
};

// ------------------------------------------------------------------ boot
UI.boot = function () {
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const m = $('#modal'); if (m && m.querySelector('.mclose')) UI.closeModal(); } });
  UI.titleScreen();
};
})();
