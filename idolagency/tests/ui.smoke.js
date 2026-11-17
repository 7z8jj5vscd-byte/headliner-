// Browser smoke test: opens the game, plays through the main flows and saves screenshots.
// Usage: node tests/ui.smoke.js <screenshot dir>
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/version\.json|favicon|fonts/.test(m.text()) && errs.push(m.text()));
  const shot = n => p.screenshot({ path: `${out}/${n}.png` });
  const click = async sel => { await p.click(sel); await p.waitForTimeout(150); };
  await p.goto('file://' + require('path').resolve(__dirname, '../index.html')); await p.waitForTimeout(800);
  await shot('s1_title');
  await click('[data-a="newIn"]'); await p.fill('#f-agency', 'Moonlight'); await p.fill('#f-ceo', 'Ari'); await click('[data-a="start"]');
  await p.waitForTimeout(300); await shot('s2_tutorial');
  // run through tutorial by skipping
  await click('[data-a="tutSkip"]');
  await shot('s3_hq');
  // scout and sign
  await click('[data-tab="trainees"]'); await click('[data-a="scoutMenu"]'); await click('[data-a="scout"][data-v="open"]');
  await shot('s4_scout');
  for (let k = 0; k < 4; k++) { const s = await p.$('[data-a="sign"]'); if (s) await click('[data-a="sign"]'); }
  await click('[data-a="close"]');
  // give the game state a push so a group can debut quickly
  await p.evaluate(() => { const S = IA.S; Object.values(S.idols).forEach(i => { i.weeks = 30; Object.keys(i.stats).forEach(k => i.stats[k] += 25); }); });
  await click('[data-a="idol"]'); await shot('s5_idol'); await click('[data-a="style"]'); await shot('s6_stylist'); await click('[data-a="close"]');
  // form a group
  await click('[data-tab="trainees"]'); await click('[data-a="debutMenu"]');
  for (let k = 0; k < 4; k++) { await p.locator('[data-a="gfPick"]').nth(k).click(); await p.waitForTimeout(80); }
  await p.fill('#g-name', 'LUMINA'); await p.fill('#g-fandom', 'Lumis');
  await shot('s7_form'); await click('[data-a="gfMake"]');
  await shot('s8_album1');
  await click('[data-a="alStep"][data-v="1"]'); await shot('s9_lines');
  await click('[data-a="alStep"][data-v="1"]'); await shot('s10_mv');
  await click('[data-a="alStep"][data-v="1"]'); await click('[data-a="alGo"]');
  // next weeks until release modal appears
  for (let w = 0; w < 12; w++) {
    await click('#next');
    for (let k = 0; k < 15; k++) {
      const sheet = await p.$('#modal.on');
      if (!sheet) break;
      const html = await p.$eval('#sheet', e => e.innerText.slice(0, 40));
      if (/DEBUT|Comeback/.test(html) && !(await p.$('.done-shot'))) { await p.waitForTimeout(2600); await shot('s11_release'); await p.evaluate(() => document.body.classList.add('done-shot')); }
      if (await p.$('[data-a="awStage"]')) { await click('[data-a="awStage"]'); continue; }
      if (await p.$('[data-a="awOpen"]')) { await click('[data-a="awOpen"]'); continue; }
      if (await p.$('[data-a="awNext"]')) { await click('[data-a="awNext"]'); continue; }
      if (await p.$('[data-a="evPick"]')) { await click('[data-a="evPick"]'); continue; }
      if (await p.$('[data-a="qnext"]')) { await click('[data-a="qnext"]'); continue; }
      if (await p.$('[data-a="close"]')) { await click('[data-a="close"]'); continue; }
      break;
    }
    if (await p.$('#tut:not([hidden]) [data-a="tipClose"]')) await click('[data-a="tipClose"]');
  }
  await click('[data-tab="hq"]'); await p.waitForTimeout(300); await shot('s12a_hq_after_debut');
  await click('[data-tab="groups"]'); await p.waitForTimeout(300); await shot('s12_group');
  await click('[data-a="schedMenu"]'); await shot('s13_sched'); await click('[data-a="close"]');
  await click('[data-a="tourMenu"]'); await click('[data-a="tpAdd"]'); await shot('s14_tour'); await click('[data-a="close"]');
  await click('[data-tab="charts"]'); await shot('s15_chart');
  await click('[data-tab="sns"]'); await shot('s16_sns');
  await click('[data-tab="biz"]'); await shot('s16b_biz');
  await p.evaluate(() => { IA.S.money += 5e8; });
  await click('[data-tab="biz"]'); await click('[data-a="club"]'); await click('[data-a="merch"]'); await click('[data-a="bizBuy"]'); await click('[data-a="loan"]'); await shot('s16c_biz2');
  await click('[data-tab="groups"]'); await click('[data-a="soloMenu"]'); await click('[data-a="solo"]'); await shot('s16d_solo'); await click('[data-a="close"]');
  await click('[data-a="dinner"]'); await shot('s16e_group_more');
  await click('[data-tab="hq"]'); await click('[data-a="calendar"]'); await shot('s16f_cal'); await click('[data-a="close"]');
  // force a music show + award modal
  await p.evaluate(() => { const S = IA.S; const g = S.groups[0]; KA.startHate(S, g, 'lipsync'); S.q.push({ k: 'award', id: 'sama' }); });
  await click('[data-tab="sns"]'); await shot('s17_hate');
  await click('#next');
  for (let k = 0; k < 30; k++) {
    if (await p.$('[data-a="awStage"]')) { await click('[data-a="awStage"]'); await shot('s18_award'); continue; }
    if (await p.$('[data-a="awOpen"]')) { await click('[data-a="awOpen"]'); continue; }
    if (await p.$('[data-a="awNext"]')) { await click('[data-a="awNext"]'); continue; }
    if (await p.$('[data-a="evPick"]')) { await click('[data-a="evPick"]'); continue; }
    if (await p.$('[data-a="qnext"]')) { if (await p.$('#stc')) { await p.waitForTimeout(1200); await shot('s19_stage'); } await click('[data-a="qnext"]'); continue; }
    break;
  }
  // rhythm game
  await click('[data-tab="groups"]');
  await p.evaluate(() => { const g = IA.S.groups[0]; g.promo = g.promo || { aid: IA.S.albums[0].id, start: IA.S.week, len: 4 }; g.flags.rehearsed = -1; });
  await click('[data-tab="groups"]');
  await click('[data-a="rehearse"]'); await p.waitForTimeout(2500); await shot('s20_rhythm');
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors');
  await b.close();
})();
