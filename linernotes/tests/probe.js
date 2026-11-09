const path = require('path'); const vm = require('vm'); const fs = require('fs');
const ctx = { console, Math, Date, JSON }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['data.js', 'engine.js', 'systems.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
const LN = ctx.LN;
const src = {}; const orig = LN.addFans;
LN.addFans = function (S, n, r) { const b = LN.totalFans(S); orig(S, n, r); const line = (new Error().stack.split('\n')[2] || '').trim().replace(/\(.*?(\w+\.js):(\d+).*/, '$1:$2'); src[line] = (src[line] || 0) + LN.totalFans(S) - b; };
const origFan = LN.fanWeek; LN.fanWeek = function (S) { const b = LN.totalFans(S); const ch = S.fans; origFan(S); src['fanWeek(net)'] = (src['fanWeek(net)'] || 0) + LN.totalFans(S) - b; };
module.exports = { LN, src, ctx };
