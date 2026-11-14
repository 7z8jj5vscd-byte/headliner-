// Guards against a three.js mistake that turns whole scenes sideways:
// parent.add(mesh).rotation = ... rotates the parent, because add() returns the parent.
const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'three3d.js'), 'utf8');
const bad = []; const re = /\.add\(/g; let m;
while ((m = re.exec(src))) { let d = 1, j = m.index + 5; while (d) { const c = src[j++]; if (c === '(') d++; else if (c === ')') d--; } if (/^\.(rotation|scale|position|rotate|lookAt)/.test(src.slice(j, j + 12))) bad.push(src.slice(Math.max(0, m.index - 40), j + 20).replace(/\s+/g, ' ')); }
if (bad.length) { console.log('FAIL: transform applied to the parent after add():\n' + bad.join('\n')); process.exit(1); }
console.log('PASS');
