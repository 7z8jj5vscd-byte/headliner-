/* The Eras Life: Music City systems (interface). Your phone, the social post composer,
   record deals, the authenticity meter and setlist flow. */
(function () {
const ER = window.ER, G = window.G, UI = window.UI;
const { h, card, pill, bar, VIEWS, ACT, toast, modal, closeModals } = UI;
const S = () => G.S(), $ = q => document.querySelector(q);
const render = () => UI.render();
const WHO = { manager:'Manager', publicist:'Publicist', label:'Label', family:'Family', collab:'Collaborator', promoter:'Promoter', fans:'Fan club', producer:'Producer', stylist:'Stylist', tour:'Tour manager', friend:'A friend' };
const AV = { manager:'💼', publicist:'📣', label:'🏷️', family:'🏡', collab:'🎶', promoter:'🎟️', fans:'💖', producer:'🎛️', stylist:'👗', tour:'🚌', friend:'🫶' };
const nameOf = from => { const s = S(), c = (s.crew || []).find(x => x.id === from); return c ? `${c.name} (${WHO[from] || from})` : (WHO[from] || from); };

/* ---------- Your phone ---------- */
VIEWS.inbox = function () {
  const s = S(), texts = (s.texts || []), open = UI.sel.thread || null;
  const threads = {}; s.inbox.forEach(m => { (threads[m.from] = threads[m.from] || []).push(m); }); texts.forEach(t => { (threads[t.from] = threads[t.from] || []); });
  const unreadOf = k => (threads[k] || []).filter(m => !m.read).length + texts.filter(t => t.from === k && !t.replied).length;
  const keys = Object.keys(threads).sort((a, b) => unreadOf(b) - unreadOf(a));
  if (open && threads[open]) {
    const msgs = threads[open].slice(0, 30).reverse(), tx = texts.filter(t => t.from === open).slice().reverse();
    msgs.forEach(m => { m.read = true; });
    const all = msgs.map(m => ({ abs:m.abs, html:`<div class="bub in"><b>${h(m.subj)}</b><div>${h(m.x)}</div>${m.memory != null && !m.replied ? `<button class="btn sm" data-act="memory" data-id="${m.id}">Respond</button>` : ''}${m.mail != null && !m.replied ? `<button class="btn sm" data-act="reply" data-id="${m.id}">Reply</button>` : ''}<small>${h(G.fmtDate(m.abs))}</small></div>` }))
      .concat(tx.map(t => ({ abs:t.abs, html:`<div class="bub in"><div>${h(t.x)}</div><small>${h(G.fmtDate(t.abs))}</small></div>${t.replied ? `<div class="bub out"><div>${h(t.replied.l)}</div></div><div class="bub sys">${h(t.replied.r)}</div>` : `<div class="qr">${t.opts.map((o, i) => `<button class="chip" data-act="txt" data-id="${t.id}" data-i="${i}">${h(o.l)}</button>`).join('')}</div>`}` }))).sort((a, b) => a.abs - b.abs);
    return `<section class="phone"><div class="phead"><button class="icon" data-act="thread" data-v="" aria-label="Back to all threads">‹</button><span class="pav">${AV[open] || '💬'}</span><b>${h(nameOf(open))}</b></div><div class="pthread">${all.map(x => x.html).join('') || '<p class="small muted">No messages yet.</p>'}</div></section>`;
  }
  return `<section class="phone"><div class="phead"><b>Messages</b><button class="btn ghost sm" data-act="readall">Mark all read</button></div>
    ${s.duties.length ? `<div class="pduty"><span class="eyebrow">Assignments</span>${s.duties.map(d => `<div class="between small"><span>${h(d.l)}</span><span class="muted">Due ${h(G.fmtDate(d.due))}</span></div>`).join('')}</div>` : ''}
    <div class="plist">${keys.map(k => { const last = (threads[k] || [])[0], lt = texts.find(t => t.from === k), u = unreadOf(k); const preview = lt && (!last || lt.abs >= last.abs) ? lt.x : last ? last.subj : '';
      return `<button class="prow" data-act="thread" data-v="${h(k)}"><span class="pav">${AV[k] || '💬'}</span><span class="pmid"><b>${h(nameOf(k))}</b><span>${h(preview)}</span></span>${u ? `<i class="badge pb">${u}</i>` : ''}</button>`; }).join('') || '<p class="small muted">No messages.</p>'}</div></section>`;
};
ACT.thread = d => { UI.sel.thread = d.v || null; render(); window.scrollTo(0, 0); };
ACT.txt = d => { const o = G.replyText(d.id, +d.i); if (o) toast(o.r); render(); };

/* ---------- Social post composer (from Headliner) ---------- */
const POSTS = [{ id:'selfie', n:'A selfie', ic:'🤳', fx:{ fans:.6 } }, { id:'bts', n:'Behind the scenes', ic:'🎬', fx:{ fans:.5, rep:1 } }, { id:'teaser', n:'A song teaser', ic:'🎵', fx:{ hype:4 } },
  { id:'reply', n:'Reply to fans', ic:'💬', fx:{ fans:.4, team:1 } }, { id:'throwback', n:'A throwback photo', ic:'📼', fx:{ fans:.4, rep:1 } }, { id:'outfit', n:'Today\'s outfit', ic:'👗', fx:{ heat:2, fans:.3 } }];
const TONES = [{ id:'funny', n:'Funny', fx:{ fans:.3 } }, { id:'heart', n:'Heartfelt', fx:{ rep:1 } }, { id:'cryptic', n:'Cryptic', fx:{ heat:2, hype:2 } }];
const post0 = ACT.do;
ACT.do = (d, el) => { const t = G.tasks().find(x => x.id === d.id);
  if (t && t.kind === 'social' && !d.arg && !UI.prefs.quick && !G.taskDone(t.id)) { UI.post = UI.post || { type:'selfie', tone:'funny' }; return postModal(); }
  return post0(d, el); };
function postModal() { const p = UI.post; closeModals();
  modal(`<span class="eyebrow">New post</span><h2>What are you posting?</h2>
    <div class="postgrid">${POSTS.map(x => `<button class="choice ${p.type === x.id ? 'on' : ''}" data-act="ptype" data-v="${x.id}"><span style="font-size:24px">${x.ic}</span> ${h(x.n)}</button>`).join('')}</div>
    <h3>Caption tone</h3><div class="chips">${TONES.map(x => `<button class="chip ${p.tone === x.id ? 'on' : ''}" data-act="ptone" data-v="${x.id}">${h(x.n)}</button>`).join('')}</div>
    <div class="postprev"><span class="pav">${(POSTS.find(x => x.id === p.type) || {}).ic}</span><div><b>@${h(G.art().name.toLowerCase().replace(/[^a-z0-9]/g, ''))}</b><div class="small muted">${h({ funny:'okay but why is this me 😂', heart:'thank you for everything. truly.', cryptic:'🕰️ . . .' }[p.tone])}</div></div></div>
    <button class="btn big" data-act="pgo">Post it · ⚡5</button><div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="closem">Not now</button></div>`); }
ACT.ptype = d => { UI.post.type = d.v; postModal(); };
ACT.ptone = d => { UI.post.tone = d.v; postModal(); };
ACT.pgo = () => { const p = UI.post, r = G.doTask('social'); if (r && r.err) return toast(r.err);
  const ty = POSTS.find(x => x.id === p.type), to = TONES.find(x => x.id === p.tone); G.applyFx(ty.fx); G.applyFx(to.fx);
  const likes = Math.round(Math.max(20, S().stats.fans * (.02 + Math.random() * .06)) * (p.type === S().lastPost ? .6 : 1)); S().lastPost = p.type;
  closeModals(); render(); UI.sessionResult('Posted', [{ x:`${likes.toLocaleString()} likes in the first hour.` }, { x:p.type === S().lastPostWas ? 'Fans have seen this kind of post a lot lately.' : 'Fans love it.', c:'small muted' }]); S().lastPostWas = p.type; };

/* ---------- Record deals (invented artists) ---------- */
function dealCard() { const s = S(); if (!G.dealOn()) return ''; const L = G.labelInterest(), d = s.deal;
  if (d) { const l = G.LABELS.find(x => x.id === d.lid); return card(`<div class="between"><h2>Your record deal</h2>${pill(l.n)}</div><p class="small">${G.fmtM(d.advance)} advance · ${Math.round(d.royalty * 100)}% royalty · ${d.owedLeft} album${d.owedLeft === 1 ? '' : 's'} still owed${d.control ? ' · creative control' : ''}${d.cut ? ` · ${Math.round(d.cut * 100)}% of merch to the label` : ''}</p>`); }
  const t = UI.deal = UI.deal || { lid:G.LABELS[0].id, advance:5000, royalty:.15, albums:3, control:false, cut:.1 }, ask = G.dealAsk(t.lid, t);
  return card(`<h2>Record labels</h2><p class="small muted">Invented labels. Raise their interest, then negotiate a deal term by term.</p>
    ${G.LABELS.map(l => `<div class="lab"><div class="between"><b>${h(l.n)}</b><span class="small muted">Interest ${Math.round(L[l.id])}</span></div>${bar(L[l.id])}<div class="row"><button class="btn ghost sm" data-act="lpitch" data-l="${l.id}" data-h="demo">Send a demo · ⚡10</button><button class="btn ghost sm" data-act="lpitch" data-l="${l.id}" data-h="lunch">A&R lunch · ⚡10</button><button class="btn ghost sm" data-act="lpitch" data-l="${l.id}" data-h="showcase">Showcase · ⚡25</button></div></div>`).join('')}
    <h3>Negotiate</h3><label class="field"><span>Label</span><select data-act="dl" data-k="lid">${G.LABELS.map(l => `<option value="${l.id}" ${t.lid === l.id ? 'selected' : ''}>${h(l.n)}</option>`).join('')}</select></label>
    <label class="field"><span>Advance: ${G.fmtM(t.advance)}</span><input type="range" min="0" max="${Math.max(50000, Math.round(s.stats.fans * 6))}" step="1000" value="${t.advance}" data-act="dl" data-k="advance"></label>
    <label class="field"><span>Royalty: ${Math.round(t.royalty * 100)}%</span><input type="range" min="10" max="30" value="${Math.round(t.royalty * 100)}" data-act="dl" data-k="royalty"></label>
    <label class="field"><span>Albums owed: ${t.albums}</span><input type="range" min="1" max="6" value="${t.albums}" data-act="dl" data-k="albums"></label>
    <label class="field"><span>The label's cut of merch: ${Math.round(t.cut * 100)}%</span><input type="range" min="0" max="30" value="${Math.round(t.cut * 100)}" data-act="dl" data-k="cut"></label>
    <div class="chips"><button class="chip ${t.control ? 'on' : ''}" data-act="dl" data-k="control" data-v="${t.control ? 0 : 1}">${t.control ? '✓ ' : ''}Creative control</button></div>
    <div class="deal-meter"><div class="bar ${ask.ok ? '' : 'warn'}"><i style="width:${Math.min(100, ask.budget / Math.max(1, ask.want) * 100)}%"></i></div><span class="small">${ask.ok ? 'They would probably say yes.' : 'They would probably say no. Ask for less, or raise their interest first.'}</span></div>
    <button class="btn" data-act="dsign">Make the offer</button>`); }
ACT.lpitch = d => { const r = G.pitchLabel(d.l, d.h); if (r.err) return toast(r.err); render(); toast(r.msg); };
ACT.dl = (d, el) => { const t = UI.deal; if (d.k === 'lid') t.lid = el.value; else if (d.k === 'control') t.control = d.v === '1'; else if (d.k === 'royalty' || d.k === 'cut') t[d.k] = +el.value / 100; else t[d.k] = +el.value; render(); };
ACT.dsign = () => { const r = G.signDeal(UI.deal.lid, UI.deal); if (r.err) return toast(r.err); UI.deal = null; render(); toast(r.msg); if (UI.confetti) UI.confetti(90); };
const life0 = VIEWS.life;
VIEWS.life = function () { const html = life0(), dc = dealCard(); if (!dc) return html; const i = html.indexOf('<section class="card"', 10); return i < 0 ? html + dc : html.slice(0, i) + dc + html.slice(i); };

/* ---------- Authenticity meter (invented artists) ---------- */
function authCard() { const s = S(); if (!G.art().invented || s.flags.retired) return ''; const a = G.auth(), n = (s.secrets || []).length;
  return `<div class="authbar"><div class="between"><span class="eyebrow">Make it or fake it</span><span class="small">${n ? `🤫 ${n} secret${n > 1 ? 's' : ''}` : 'No secrets'}</span></div>
    <div class="amtr"><i style="left:${a}%"></i></div><div class="between small muted"><span>Fake</span><b>Authenticity ${Math.round(a)}</b><span>Real</span></div>
    <p class="small faint">Shortcuts work fast but become secrets. The Velvet Rope, an invented gossip site, digs for them.</p></div>`; }
const week0 = VIEWS.week;
VIEWS.week = function () { const html = week0(), ac = authCard(); if (!ac) return html; const i = html.indexOf('<section class="board"'); return i < 0 ? html + ac : html.slice(0, i) + ac + html.slice(i); };

/* ---------- Setlist flow in the tour plan ---------- */
new MutationObserver(() => { const sl = $('#main .setl'); const plan = UI.sel.plan; if (sl && plan && !$('#flow-box')) { const f = G.setlistFlow(plan.setlist);
  sl.insertAdjacentHTML('afterend', `<div id="flow-box" class="flowbox"><div class="between"><b>Setlist flow</b><span class="pill">+${f.b.toFixed(2)} stars a night</span></div>${f.notes.map(n => `<p class="small">${/^(Open|Put|Close|Add)/.test(n) ? '○' : '✓'} ${h(n)}</p>`).join('')}<p class="small faint">The order you tap songs is the order you play them.</p></div>`); } })
  .observe(document.body, { childList:true, subtree:true });
})();
