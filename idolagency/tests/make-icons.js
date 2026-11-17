// Draws the app icons (icon.png 512px, apple-touch-icon.png 180px) from the game's own pixel sprites.
// Usage: node tests/make-icons.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const dir = path.resolve(__dirname, '..');
  await p.setContent('<canvas id="c"></canvas>');
  await p.addScriptTag({ path: path.join(dir, 'data.js') }); await p.addScriptTag({ path: path.join(dir, 'sprite.js') });
  for (const [name, size] of [['icon.png', 512], ['apple-touch-icon.png', 180]]) {
    const url = await p.evaluate(size => {
      const c = document.getElementById('c'); c.width = c.height = size; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      const g = x.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#ffd1ea'); g.addColorStop(1, '#c9b2ff'); x.fillStyle = g; x.fillRect(0, 0, size, size);
      const u = size / 32; x.fillStyle = 'rgba(255,255,255,.55)';
      for (let i = 0; i < 9; i++) x.fillRect(((i * 7) % 30) * u, ((i * 11) % 14) * u, u, u);
      const looks = [{ g: 'f', skin: 0, hair: 1, hairC: 6, top: 'y2k', topC: 0, botC: 1, acc: 5, eye: 0 }, { g: 'm', skin: 1, hair: 1, hairC: 0, top: 'leather', topC: 3, botC: 2, acc: 0, eye: 1 }, { g: 'f', skin: 2, hair: 0, hairC: 7, top: 'sparkle', topC: 3, botC: 3, acc: 6, eye: 2 }];
      const sc = size * .5 / SP.H;
      SP.drawIdol(x, looks[0], size * .22, size * .95, sc * .9, 'heart');
      SP.drawIdol(x, looks[1], size * .78, size * .95, sc * .9, 'up1', true);
      SP.drawIdol(x, looks[2], size * .5, size * .99, sc * 1.15, 'cheer');
      return c.toDataURL('image/png');
    }, size);
    require('fs').writeFileSync(path.join(dir, name), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close(); console.log('icons written');
})();
