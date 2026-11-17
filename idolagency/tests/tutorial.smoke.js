// Walks through the guided tutorial the way a new player would. Usage: node tests/tutorial.smoke.js <screenshot dir>
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(500);
  await p.click('[data-a="newIn"]'); await p.click('[data-a="start"]'); await p.waitForTimeout(300);
  const step = () => p.evaluate(() => IA.S.tut.step);
  const seen = [];
  for (let k = 0; k < 30; k++) {
    if (await p.evaluate(() => IA.S.tut.done)) break;
    const s = await step(); seen.push(s);
    if (s === 3) { await p.click('[data-tab="trainees"]'); }
    else if (s === 4) { await p.click('[data-a="scoutMenu"]'); await p.click('[data-a="scout"][data-v="street"]'); await p.click('[data-a="sign"]'); await p.click('[data-a="close"]'); }
    else if (await p.evaluate(() => KD.TUTORIAL[IA.S.tut.step].go === 'next')) { await p.click('#next'); while (await p.$('[data-a="qnext"]')) await p.click('[data-a="qnext"]'); }
    else { if (s === 5) await p.screenshot({ path: out + '/tut5.png' }); await p.click('[data-a="tutNext"]'); }
    await p.waitForTimeout(150);
  }
  console.log('steps seen', [...new Set(seen)].join(','), 'done', await p.evaluate(() => IA.S.tut.done));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors');
  await b.close();
})();
