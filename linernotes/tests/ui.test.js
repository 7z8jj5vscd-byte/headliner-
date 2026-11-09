// Browser smoke test: plays through the real interface and fails on any script error.
// Usage: node tests/ui.test.js <port> <three.min.js path> <screenshot dir> [phone|desktop]
const { chromium } = require('playwright');
const [port, threePath, shots, mode = 'phone'] = process.argv.slice(2);
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext(mode === 'phone' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true } : { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000); const T0 = Date.now();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route(/three(\.min)?\.js/, r => r.fulfill({ body: fs.readFileSync(threePath), contentType: 'application/javascript' }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const shot = async n => page.screenshot({ path: `${shots}/${mode}-${n}.png` });
  const click = async (sel, opt) => { await page.locator(sel).first().click(opt); await page.waitForTimeout(120); };
  const step = async (name, fn) => { const before = errors.length; console.log('step', name, Math.round((Date.now() - T0) / 1000) + 's'); try { await fn(); } catch (e) { errors.push(`step ${name}: ${e.message.split('\n')[0]}`); } if (errors.length > before) console.log('ERR in', name, errors.slice(before)); };

  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForSelector('.title', { timeout: 15000 });
  await shot('01-title');
  await step('create', async () => {
    await click('[data-a="newGame"]');
    await page.fill('#cr-name', 'Juno Vale'); await page.selectOption('#cr-city', 'Toronto'); await page.selectOption('#cr-genre', 'synth-pop');
    await click('[data-a="crNext"]'); await click('[data-a="crStory"][data-id="busker"]'); await shot('02-story');
    await click('[data-a="crNext"]'); await page.waitForTimeout(600);
    await click('[data-a="crLook"][data-k="hair"][data-v="curly"]'); await click('[data-a="crLook"][data-k="topColor"][data-v="#7b4dff"]'); await page.waitForTimeout(400); await shot('03-look');
    await click('[data-a="crNext"]'); await click('[data-a="crNext"]'); await page.waitForSelector('.me', { timeout: 15000 });
  });
  const threeOk = await page.evaluate(() => window.L3 && L3.available());
  console.log('3D available:', threeOk);
  await page.waitForTimeout(300); await shot('04-home');
  await step('write', async () => { await click('[data-a="writeModal"]'); await shot('05-write'); await click('[data-a="doWrite"]'); });
  await step('record', async () => { await click('[data-a="go"][data-tab="studio"]'); await click('[data-a="recordModal"]'); await shot('06-record'); await click('[data-a="doRecord"]'); });
  await step('release', async () => { await click('[data-a="releaseModal"][data-song]'); await page.waitForTimeout(500); await shot('07-release'); await click('[data-a="doRelease"]'); });
  await step('post', async () => { await click('[data-a="go"][data-tab="social"]'); await click('[data-a="postModal"]'); await click('[data-a="doPost"][data-t="thanks"]'); });
  await step('endweek', async () => { await click('[data-a="go"][data-tab="home"]'); await click('[data-a="endWeek"]'); await page.waitForTimeout(200); for (let i = 0; i < 3; i++) { if (await page.locator('#modal').count()) await click('#modal [data-a="closeModal"]'); } await shot('08-after-week'); });
  await step('gig', async () => { await click('[data-a="gigModal"]'); await click('[data-a="doGig"][data-v="openmic"]'); await page.waitForTimeout(2800); await shot('09-show'); if (await page.locator('#sh-skip:not(.hide)').count()) await click('[data-a="showSkip"]'); await click('#sh-done'); });
  await step('charts', async () => { await click('[data-a="go"][data-tab="charts"]'); await shot('10-charts'); for (const s of ['a', 'st', 'ye', 'tr', 's']) await click(`[data-a="sub"][data-sub="${s}"]`); await click('[data-a="region"][data-r="AS"]'); });
  // boost the save so every system has content, then visit everything
  await page.evaluate(() => { const S = UI.S; S.money = 5e7; for (const r of ['NA', 'EU', 'LA', 'AS']) S.fans[r] = 3e6; S.skills.write = 80; S.skills.prod = 70; S.energy = 100; S.acting = 60; UI.render(); });
  await step('many-weeks', async () => {
    await page.evaluate(() => { const S = UI.S; for (let w = 0; w < 70; w++) { S.energy = 200; if (S.songs.filter(s => !s.rel).length < 8) for (let k = 0; k < 3; k++) LN.writeSong(S, { genre: 'synth-pop', mood: 'Euphoric', topic: 'Love', tempo: 'up' });
      S.songs.filter(s => !s.recorded).forEach(s => LN.recordSong(S, s.id, { studio: 'pro', producer: 'p5', feat: w % 9 === 0 ? S.npcs[3].id : null }));
      const ready = S.songs.filter(s => s.recorded && !s.rel); if (ready.length >= 8 && w % 20 === 5) LN.createRelease(S, { type: 'album', title: 'Album ' + w, songs: ready.slice(0, 8).map(s => s.id), eraLook: true }); else if (ready.length && w % 4 === 0) LN.createRelease(S, { type: 'single', title: ready[0].title, songs: [ready[0].id] });
      if (w === 30) LN.planTour(S, { name: 'Test Tour', venue: 'theater', price: 45, cities: ['Toronto', 'Chicago', 'New York', 'London', 'Paris', 'Seoul'], setlist: LN.defaultSetlist(S) });
      if (w === 12) LN.shootVideo(S, S.songs.find(s => s.rel).id, { director: 'd3', concept: 'space', budget: 50000 });
      if (w === 20) { LN.startLabel(S, 'Vale Records'); LN.signProspect(S, 0); LN.designMerch(S, { item: 'hoodie', color: '#7b4dff', print: 'Juno Vale', qty: 500, price: 60 }); LN.buyHome(S, 'h3'); LN.invest(S, 'index', 100000); }
      for (const it of S.inbox.slice()) { if (it.kind === 'event') LN.respond(S, it.id, 0); else if (['feature', 'brand', 'festival'].includes(it.kind)) LN.respond(S, it.id, 'accept'); }
      LN.endWeek(S); } UI.render(); });
  });
  await step('home-full', async () => { await click('[data-a="go"][data-tab="home"]'); await shot('11-home-later'); const n = await page.locator('[data-a="openInbox"]').count(); for (let i = 0; i < Math.min(n, 3); i++) { await click('[data-a="openInbox"]'); await page.waitForTimeout(150); await shot('12-inbox-' + i); await click('#modal .mclose'); } });
  await step('studio-tabs', async () => { await click('[data-a="go"][data-tab="studio"]'); for (const s of ['releases', 'disco', 'videos', 'vault']) { await click(`[data-a="sub"][data-sub="${s}"]`); if (s === 'releases') { await page.waitForTimeout(400); await shot('13-releases'); } }
    await click('[data-a="sub"][data-sub="releases"]'); await click('[data-a="relModal"]'); await shot('14-release-detail'); await click('#modal .mclose');
    await click('[data-a="moreStudio"]'); await click('[data-a="remixModal"]'); await click('#modal .mclose');
    await click('[data-a="sub"][data-sub="videos"]'); await click('[data-a="watchVideo"]'); await page.waitForTimeout(1500); await shot('15-video'); await click('#modal [data-a="closeModal"]'); });
  await step('release-album-modal', async () => { await click('[data-a="go"][data-tab="studio"]'); await click('[data-a="sub"][data-sub="vault"]'); await click('[data-a="writeModal"]'); await click('[data-a="doWrite"]'); await page.evaluate(() => { const S = UI.S; S.songs.filter(s => !s.recorded).forEach(s => LN.recordSong(S, s.id, { studio: 'pro', producer: 'self' })); UI.render(); }); await click('.btnrow [data-a="releaseModal"]'); await click('[data-a="relType"][data-t="ep"]'); await page.waitForTimeout(300); await shot('16-release-ep'); await click('#modal .mclose'); });
  await step('social-tabs', async () => { await click('[data-a="go"][data-tab="social"]'); for (const s of ['loopr', 'news', 'fans', 'artists', 'feed']) { await click(`[data-a="sub"][data-sub="${s}"]`); if (s === 'artists') { await page.fill('#aq', 'Tay'); await page.waitForTimeout(150); await click('[data-a="artistModal"]'); await shot('17-artist'); await click('#modal .mclose'); } } await shot('18-feed'); });
  await step('career-tabs', async () => { await click('[data-a="go"][data-tab="career"]');
    for (const s of ['live', 'industry', 'awards', 'life', 'movies', 'settings']) { await click(`[data-a="sub"][data-sub="${s}"]`); await page.waitForTimeout(200); await shot('19-career-' + s); }
    await click('[data-a="sub"][data-sub="live"]'); if (!(await page.evaluate(() => LN.isTouring(UI.S)))) { await click('[data-a="tourModal"]'); await shot('20-tour'); await click('#modal .mclose'); } await click('[data-a="merchModal"]'); await shot('21-merch'); await click('#modal .mclose');
    await click('[data-a="sub"][data-sub="life"]'); await click('[data-a="wardrobeModal"]'); await page.waitForTimeout(600); await click('[data-a="wardSlot"][data-s="acc"]'); await click('[data-a="wardBuy"][data-v="shades"]'); await page.waitForTimeout(400); await shot('22-wardrobe'); await click('[data-a="wardSave"]');
    await click('[data-a="sub"][data-sub="settings"]'); await click('[data-a="helpModal"]'); await click('#modal .mclose');
    await click('[data-a="sub"][data-sub="industry"]'); await click('[data-a="hire"][data-r="manager"][data-t="1"]'); });
  await step('negotiate', async () => { await page.evaluate(() => { LN.labelOffer(UI.S, LND.LABELS[3]); UI.go('home'); }); await click('.k-label'); await page.waitForTimeout(150); await shot('23-negotiate'); await page.evaluate(() => { const el = document.getElementById('n-adv'); el.value = String(Math.round(+el.value * 1.3)); el.dispatchEvent(new Event('input', { bubbles: true })); }); await click('[data-a="negoSend"]'); if (await page.locator('#modal').count()) await click('#modal .mclose'); });
  await step('interview', async () => { await page.evaluate(() => { LN.inbox(UI.S, 'talkshow', 'Test show', 'test', { show: 'Late Night with Marty Fogle' }, 2); UI.S.energy = 80; UI.render(); }); await click('.k-talkshow'); await click('[data-a="startInterview"]'); for (let i = 0; i < 3; i++) await click('[data-a="ivPick"]'); });
  await step('ceremony', async () => { const key = await page.evaluate(() => { const S = UI.S; const ks = Object.keys(S.shows_); return ks.find(k => S.shows_[k].held) || null; }); console.log('ceremony key', key); if (key) { await page.evaluate(k => UI.A.watchCeremony({ key: k }), key); await page.waitForTimeout(800); await click('[data-a="cerOpen"]'); await shot('24-ceremony'); await click('#modal [data-a="closeModal"]'); } });
  await step('save-reload', async () => { await page.evaluate(() => UI.save()); await page.reload(); await page.waitForSelector('.title'); await click('[data-a="loadSlot"]'); await page.waitForSelector('.me'); await click('[data-a="go"][data-tab="charts"]'); await shot('25-reloaded-charts'); });
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log('horizontal overflow px:', scrollW);
  console.log('ERRORS', errors.length); errors.slice(0, 30).forEach(e => console.log('  ', e));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
