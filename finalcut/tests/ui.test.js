// Browser smoke test: plays through the real interface and fails on any script error.
// Usage: node tests/ui.test.js <port> <three.min.js path> <screenshot dir> [phone|desktop]
const { chromium } = require('playwright');
const fs = require('fs');
const [port, threePath, shots, mode = 'phone'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext(mode === 'phone' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true } : { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|net::|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route(/three(\.min)?\.js/, r => r.fulfill({ body: fs.readFileSync(threePath), contentType: 'application/javascript' }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const shot = n => page.screenshot({ path: `${shots}/${mode}-${n}.png` });
  const click = async sel => { await page.locator(sel).first().click(); await page.waitForTimeout(120); };
  const step = async (name, fn) => { const b = errors.length; console.log('step', name); try { await fn(); } catch (e) { errors.push(`step ${name}: ${e.message.split('\n')[0]}`); } if (errors.length > b) console.log('ERR', errors.slice(b)); };
  const drain = async (n = 12) => { for (let i = 0; i < n; i++) { const m = page.locator('#modal'); if (!(await m.count())) return; const btn = m.locator('[data-a="endWeekForce"], [data-a="evPick"], [data-a="trSkip"], [data-a="resolve"], [data-a="tvMoment"], [data-a="tvFinale"], [data-a="liveNext"], [data-a="liveChoose"], [data-a="liveAfter"], [data-a="liveFinish"], [data-a="cerOpen"], [data-a="speech"], [data-a="cerNext"], [data-a="loveYes"], [data-a="closeModal"]').first(); if (await btn.count()) await btn.click(); else break; await page.waitForTimeout(120); } };

  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForSelector('.title', { timeout: 15000 }); await shot('01-title');
  await step('create', async () => {
    await click('[data-a="newGame"]');
    await page.fill('#cr-name', 'Juno Vale'); await page.selectOption('#cr-city', 'Toronto');
    await click('[data-a="crNext"]'); await click('[data-a="crStory"][data-id="theater"]'); await shot('02-story');
    await click('[data-a="crNext"]'); await page.waitForTimeout(500);
    await click('[data-a="crLookTab"][data-t="hair"]'); await click('[data-a="crLook"][data-k="hair"][data-v="curly"]'); await click('[data-a="crLookTab"][data-t="face"]'); await click('[data-a="crLook"][data-k="facial"][data-v="stubble"]');
    await click('[data-a="crLookTab"][data-t="outfit"]'); await click('[data-a="crLook"][data-k="top"][data-v="hero"]'); await page.waitForTimeout(400); await shot('03-look');
    await click('[data-a="crLook"][data-k="top"][data-v="suit"]');
    await click('[data-a="crNext"]');
    for (let i = 0; i < 6; i++) await click('[data-a="crSkill"][data-k="drama"][data-v="1"]');
    await click('[data-a="crTrait"][data-id="charming"]'); await click('[data-a="crTrait"][data-id="method"]'); await shot('04-skills');
    await click('[data-a="crNext"]'); await page.waitForSelector('.me');
  });
  console.log('3D available:', await page.evaluate(() => window.L3 && L3.available()));
  await shot('05-home');
  await step('activity', async () => { await click('[data-a="tut"]'); await click('[data-a="act"][data-id="class"]'); });
  await step('audition', async () => {
    await click('[data-a="go"][data-tab="cast"]'); await shot('06-casting');
    await click('[data-a="audition"]'); await shot('07-aud-intro'); await click('[data-a="audNext"]');
    for (let i = 0; i < 3; i++) { await click('[data-a="audTone"]'); }
    for (let i = 0; i < 2; i++) { if (await page.locator('[data-a="audChem"]').count()) await click('[data-a="audChem"]'); if (await page.locator('[data-a="audScreen"]').count()) await click('[data-a="audScreen"]'); }
    await shot('08-aud-result'); await click('#modal [data-a="closeModal"]');
  });
  // force a booking so the negotiation and production screens get exercised
  await step('negotiate', async () => {
    await page.evaluate(() => { const s = UI.S; const p = FC.genProject(s, 'indie'); p.won = true; p.perf0 = 60; s.offers.push(p); UI.render(); });
    await click('[data-a="negotiate"]'); await page.evaluate(() => { const r = document.querySelector('#ng-sal'); r.value = r.max; r.dispatchEvent(new Event('input', { bubbles: true })); }); await shot('09-negotiate');
    await click('[data-a="negSend"]'); if (await page.locator('[data-a="negAcceptCounter"]').count()) await click('[data-a="negAcceptCounter"]'); else if (await page.locator('[data-a="negTake"]').count()) await click('[data-a="negTake"]');
  });
  await step('weeks', async () => { await click('[data-a="go"][data-tab="home"]'); for (let i = 0; i < 30; i++) { await click('[data-a="endWeek"]'); await page.waitForTimeout(80); await drain(); } await shot('10-after-weeks'); });
  await step('franchise', async () => {
    await page.evaluate(() => { const s = UI.S; s.fame = 45; s.skills.action = 60; s.skills.fitness = 60; s.agency = 'wme'; const p = FC.genFranchiseProject(s, 'mcu', { kind: 'original', size: 'lead' }); s.board.unshift(p); UI.tab = 'cast'; UI.render(); });
    await shot('11-franchise-role');
    await page.evaluate(() => { const s = UI.S; const p = s.board[0]; s.board.shift(); p.won = true; p.perf0 = 75; s.offers.push(p); UI.render(); });
    await click('[data-a="negotiate"]'); await click('[data-a="negTake"]');
  });
  await step('work', async () => {
    await page.evaluate(() => { UI.S.energy = 100; UI.tab = 'work'; UI.render(); }); await shot('25-work-prep');
    for (let i = 0; i < 3; i++) { const b = page.locator('[data-a="doPrep"]:not([disabled])').first(); if (await b.count()) await b.click(); await page.waitForTimeout(80); }
    for (let w = 0; w < 30; w++) {
      await page.evaluate(() => { UI.S.energy = 100; UI.S.health = 95; UI.tab = 'work'; UI.render(); });
      const eff = page.locator('[data-a="effort"][data-v="all"]').first(); if (await eff.count()) { await eff.click(); const x = page.locator('[data-a="extra"]:not([disabled])').first(); if (await x.count()) await x.click(); if (w === 8) await shot('26-work-shoot'); }
      const pr = page.locator('[data-a="pressDo"]:not([disabled])').first(); if (await pr.count()) { await pr.click(); await page.waitForTimeout(150); if (await page.locator('#modal [data-a^="live"]').count()) { await shot('27-press-live'); await drain(16); } else await shot('27-press'); }
      await click('[data-a="endWeek"]'); await drain();
    }
    await click('[data-a="go"][data-tab="world"]'); await click('[data-a="sub"][data-s="marquee"]'); await shot('28-marquee-list');
    const rv = page.locator('[data-a="review"]').first(); if (await rv.count()) { await rv.click(); await page.waitForTimeout(200); await shot('29-review'); await click('#modal [data-a="closeModal"]'); }
  });
  await step('production', async () => { for (let i = 0; i < 70; i++) { await page.evaluate(() => { UI.S.energy = 90; UI.S.health = 90; }); await click('[data-a="endWeek"]'); await drain(); if (i === 12) await shot('12-production'); } await shot('13-later'); });
  await step('tabs', async () => {
    for (const [g, subs] of [['career', ['projects', 'films', 'chars', 'awards', 'company', 'skills', 'ach', 'time']], ['world', ['box', 'fr', 'news', 'feed']], ['life', ['money', 'team', 'homes', 'love', 'look', 'settings']]]) {
      await click(`[data-a="go"][data-tab="${g}"]`);
      for (const s of subs) { await click(`[data-a="sub"][data-g="${g}"][data-s="${s}"]`); await shot(`14-${g}-${s}`); }
    }
    await click('[data-a="go"][data-tab="world"]'); await click('[data-a="sub"][data-s="fr"]'); await click('[data-a="frSel"][data-id="dcu"]'); await shot('15-dcu');
  });
  const playLive = async (tag) => { for (let i = 0; i < 14; i++) { const b = page.locator('#modal [data-a="liveNext"], #modal [data-a="liveChoose"], #modal [data-a="liveAfter"], #modal [data-a="liveFinish"]').first(); if (!(await b.count())) break; if (i === 3) await shot(tag); await b.click(); await page.waitForTimeout(100); } };
  await step('snl', async () => {
    await page.evaluate(() => { const s = UI.S; s.energy = 100; s.inbox.unshift({ id: 'snl1', kind: 'talk', show: 'snl', from: 'Saturday Night Live', t: 'Host SNL', d: 'Live from New York.' }); UI.tab = 'home'; UI.render(); });
    await click('[data-a="live"][data-id="snl1"]'); await page.waitForTimeout(500); await shot('18-snl'); await playLive('19-snl-sketch'); await shot('20-snl-done'); await click('#modal [data-a="closeModal"]');
  });
  await step('talk', async () => {
    await page.evaluate(() => { const s = UI.S; s.energy = 100; s.inbox.unshift({ id: 'tk1', kind: 'talk', show: 'hotones', from: 'Hot Ones', t: 'Book on Hot Ones', d: 'Promote.' }); UI.render(); });
    await click('[data-a="live"][data-id="tk1"]'); await page.waitForTimeout(400); await playLive('21-talk'); await click('#modal [data-a="closeModal"]');
  });
  await step('stage+tv', async () => {
    await page.evaluate(() => { const s = UI.S; s.jobs = []; const t = FC.genProject(s, 'theater'); t.won = true; s.offers.push(t); FC.sign(s, t.id); const v = FC.genProject(s, 'tv'); v.won = true; s.offers.push(v); const r = FC.sign(s, v.id); UI.render(); });
    let shotStage = false, shotTv = false;
    for (let i = 0; i < 60; i++) {
      await page.evaluate(() => { UI.S.energy = 90; UI.S.health = 90; }); await click('[data-a="endWeek"]');
      for (let k = 0; k < 8; k++) { const m = page.locator('#modal'); if (!(await m.count())) break;
        if (!shotStage && await page.locator('#modal .tc-big', { hasText: /Opening night|Tonight/i }).count()) { await page.waitForTimeout(500); await shot('22-stage'); shotStage = true; }
        if (!shotTv && await page.locator('#modal .tc-big', { hasText: /finale/i }).count()) { await shot('23-tv-finale'); shotTv = true; }
        const b = m.locator('[data-a="endWeekForce"], [data-a="evPick"], [data-a="trSkip"], [data-a="resolve"], [data-a="tvMoment"], [data-a="tvFinale"], [data-a="cerOpen"], [data-a="speech"], [data-a="cerNext"], [data-a="loveYes"], [data-a="liveNext"], [data-a="liveChoose"], [data-a="liveAfter"], [data-a="liveFinish"], [data-a="closeModal"]').first(); if (!(await b.count())) break; await b.click(); await page.waitForTimeout(80); }
    }
    console.log('stage shot', shotStage, 'tv finale shot', shotTv);
    await click('[data-a="go"][data-tab="career"]'); await click('[data-a="sub"][data-s="films"]'); await shot('24-films');
  });
  await step('theatre', async () => {
    await page.evaluate(() => { UI.S.energy = 100; UI.S.jobs = []; UI.tab = 'stage'; UI.render(); document.getElementById('toasts').innerHTML = ''; }); await shot('30-theatre');
    await click('[data-a="stageReg"][data-v="westend"]'); await click('[data-a="stageReg"][data-v="all"]'); await click('[data-a="stageType"][data-v="musical"]'); await click('[data-a="stageType"][data-v="all"]');
    await click('[data-a="stageAud"]'); await page.waitForTimeout(400); await shot('31-stage-aud'); await click('[data-a="saudNext"]'); await click('[data-a="saudPiece"]');
    for (let i = 0; i < 2; i++) await click('[data-a="saudTone"]'); await click('[data-a="saudThird"]'); await shot('32-stage-result'); await click('#modal [data-a="closeModal"]');
    await page.evaluate(() => { const s = UI.S; const p = s.stageBoard[0]; s.stageBoard.shift(); p.won = true; p.perf0 = 70; s.offers.push(p); UI.render(); });
    await click('[data-a="negotiate"]'); await click('[data-a="negTake"]'); await shot('33-theatre-now');
  });
  await step('ceremony', async () => {
    await page.evaluate(() => { const s = UI.S; const c = s.credits.find(x => x.critics != null) || { title: 'Test', id: 'x' }; s.pending.push({ type: 'ceremony', show: 'oscars', res: [{ cat: 'Best Actress', film: c.title, won: true, winner: s.me.name, others: ['Zendaya (A)', 'Emma Stone (B)', 'Florence Pugh (C)', 'Viola Davis (D)'] }] }); UI.nextPending(); });
    await click('[data-a="cerOpen"]'); await page.waitForTimeout(600); await shot('16-oscar'); await click('[data-a="speech"]');
  });
  await step('retire', async () => { await click('[data-a="go"][data-tab="life"]'); await click('[data-a="sub"][data-s="settings"]'); await click('[data-a="retireAsk"]'); await click('[data-a="retire"]'); await shot('17-ending'); await click('[data-a="toTitle"]'); await click('[data-a="continue"]'); });
  // horizontal overflow check
  const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (over) errors.push('page scrolls horizontally');
  await browser.close();
  console.log(errors.length ? 'FAIL\n' + errors.join('\n') : 'PASS');
  process.exit(errors.length ? 1 : 0);
})();
