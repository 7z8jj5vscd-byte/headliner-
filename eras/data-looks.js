/* The Eras Life: era looks for the 3D performers, and the real-success anchors that
   fans, singles and tours follow. Looks are stylised toon caricatures of each era's
   public image (hair, make-up, the colour and silhouette of the stage costumes). */
(function () {
const ER = window.ER, W = ER.ds;

const TS = { skin:'#f3d3bd', hair:'#e2bd73', eyes:'#3d6488', brow:'#a07a40' };
const T = (o) => Object.assign({}, TS, o);
// Each era: base (hair and face), stage (performing), casual (writing, studio, press).
ER.LOOKS = ER.LOOKS || {};
ER.LOOKS.taylor = {
 early:{ base:T({ style:'curly', hairLen:.5 }),
   stage:{ top:'dress', outfit:'#7fb3d5', accent:'#ffffff', boots:'tall', bootColor:'#7a4a24', guitar:1 },
   casual:{ top:'tee', outfit:'#9bc49a', accent:'#ffffff', boots:'tall', bootColor:'#7a4a24', pants:'#4a6fa5' } },
 ts1:{ base:T({ style:'curly', hairLen:.62 }),
   stage:{ top:'dress', outfit:'#2fa3a0', accent:'#bff3ec', boots:'tall', bootColor:'#6b3e1f', guitar:1, guitarColor:'#c98a3a', necklace:'#d8d8e0' },
   casual:{ top:'tee', outfit:'#e6f2ee', accent:'#2f8f7c', boots:'tall', bootColor:'#6b3e1f', pants:'#3c5a8a', guitar:1 } },
 fearless:{ base:T({ style:'curly', hairLen:.66, lips:'#d76a7a' }),
   stage:{ top:'sequin', outfit:'#e0b545', accent:'#fff1b8', fringe:'#f3d27a', boots:'tall', bootColor:'#e6c05a', bootSparkle:1, guitar:1, guitarColor:'#e6c05a', guitarSparkle:1 },
   casual:{ top:'dress', outfit:'#f1e2b6', accent:'#d6a93a', boots:'tall', bootColor:'#6b3e1f', guitar:1 } },
 speaknow:{ base:T({ style:'curly', hairLen:.66, lips:'#c95a7a' }),
   stage:{ top:'gown', outfit:'#7b3fa0', accent:'#e8d2ff', sparkle:1, necklace:'#e8e8f0', mic:1 },
   casual:{ top:'dress', outfit:'#b58ad6', accent:'#ffffff', boots:'tall', bootColor:'#3a2414', guitar:1 } },
 red:{ base:T({ style:'straight', bangs:1, hairLen:.58, lips:'#c3112b' }),
   stage:{ top:'suit', outfit:'#b3202b', accent:'#1a1a1a', hat:'fedora', hatColor:'#111111', pants:'#111111', boots:'tall', bootColor:'#111111', mic:1 },
   casual:{ top:'tee', outfit:'#f4f1ea', accent:'#1a2b5a', stripes:'#1a2b5a', hat:'fedora', hatColor:'#111111', pants:'#b3202b' } },
 '1989':{ base:T({ style:'bob', bangs:0, lips:'#c3112b' }),
   stage:{ top:'bodysuit', outfit:'#4fa3e3', accent:'#e8f6ff', sparkle:1, boots:'tall', bootColor:'#e8f6ff', bootSparkle:1, mic:1 },
   casual:{ top:'tee', outfit:'#ffffff', accent:'#6fa8d6', pants:'#2a3b63' } },
 rep:{ base:T({ style:'straight', hairLen:.42, lips:'#7a1022', liner:1, hair:'#e8cf98' }),
   stage:{ top:'bodysuit', outfit:'#1c1c20', accent:'#7cff9a', sparkle:1, boots:'tall', bootColor:'#111', bootSparkle:1, sleeves:1, mic:1 },
   casual:{ top:'jacket', outfit:'#1e1e21', accent:'#3a3a40', pants:'#111', boots:'tall', bootColor:'#111' } },
 lover:{ base:T({ style:'waves', bangs:1, hairLen:.56, tips:'#f2a3c7', lips:'#d94d78', liner:1 }),
   stage:{ top:'bodysuit', outfit:'#f28ab8', accent:'#9fd8ff', sparkle:1, boots:'tall', bootColor:'#f7b6d6', bootSparkle:1, mic:1 },
   casual:{ top:'jacket', outfit:'#bfe3ff', accent:'#f6a8c8', pants:'#f6a8c8' } },
 folklore:{ base:T({ style:'braid', bangs:1, lips:'#b86a6a' }),
   stage:{ top:'gown', outfit:'#ece8de', accent:'#ffffff', guitar:1, guitarColor:'#d8c7a4' },
   casual:{ top:'cardigan', outfit:'#8f9093', accent:'#efefec', pants:'#4a4a4c' } },
 evermore:{ base:T({ style:'braid', bangs:1, lips:'#a34b3b' }),
   stage:{ top:'gown', outfit:'#c9793a', accent:'#f1dfcf', sparkle:1, guitar:1 },
   casual:{ top:'coat', outfit:'#8a4a2a', plaid:'#2a1a12', accent:'#e9d8bd', pants:'#3d2416' } },
 midnights:{ base:T({ style:'waves', bangs:1, hairLen:.6, lips:'#a8143a', liner:1 }),
   stage:{ top:'sequin', outfit:'#2c3e8a', accent:'#bcd0ff', sleeves:1, mic:1 },
   casual:{ top:'jacket', outfit:'#2c3e70', accent:'#b8c4ea', pants:'#0d132b' } },
 ttpd:{ base:T({ style:'waves', bangs:1, hairLen:.6, lips:'#a8143a' }),
   stage:{ top:'gown', outfit:'#f4f1ea', accent:'#ffffff', sparkle:1, mic:1 },
   casual:{ top:'jacket', outfit:'#d9d2c5', accent:'#2a2622', pants:'#2a2622', glasses:'#2a2622' } },
 showgirl:{ base:T({ style:'waves', bangs:1, hairLen:.62, lips:'#c3112b', liner:1 }),
   stage:{ top:'bodysuit', outfit:'#e2762f', accent:'#ffe6a8', sparkle:1, feathers:'#f4a15a', boots:'tall', bootColor:'#2bb3a3', bootSparkle:1, mic:1 },
   casual:{ top:'dress', outfit:'#2bb3a3', accent:'#e2762f' } }
};
// Re-records and the Encore wear the current look with the original era's colours.
ER.LOOKS.taylor.fearlesstv = { base:T({ style:'waves', bangs:1, hairLen:.6, lips:'#c3112b' }), stage:ER.LOOKS.taylor.fearless.stage, casual:ER.LOOKS.taylor.fearless.casual };
ER.LOOKS.taylor.redtv = { base:ER.LOOKS.taylor.red.base, stage:ER.LOOKS.taylor.red.stage, casual:ER.LOOKS.taylor.red.casual };
ER.LOOKS.taylor.speaknowtv = { base:T({ style:'waves', bangs:1, hairLen:.6, lips:'#c3112b' }), stage:ER.LOOKS.taylor.speaknow.stage, casual:ER.LOOKS.taylor.speaknow.casual };
ER.LOOKS.taylor['1989tv'] = { base:T({ style:'waves', bangs:1, hairLen:.58, lips:'#c3112b' }), stage:ER.LOOKS.taylor['1989'].stage, casual:ER.LOOKS.taylor['1989'].casual };
ER.LOOKS.taylor.encore = ER.LOOKS.taylor.showgirl;
// The Eras Tour cycles through era costumes; this is the Lover-act opener.
ER.LOOKS.taylor.eras = ER.LOOKS.taylor.lover;

const BY = { skin:'#9a6644', hair:'#c9954f', eyes:'#3a2416', brow:'#3a2416' };
const B = o => Object.assign({}, BY, o);
ER.LOOKS.beyonce = [
 { from:1981, n:"Girl's Tyme", base:B({ style:'ponytail', hair:'#3a2416' }), stage:{ top:'tee', outfit:'#e05a8a', accent:'#ffffff', pants:'#2a3b63' } },
 { from:1997, n:"Destiny's Child", base:B({ style:'long', hair:'#a8743a' }), stage:{ top:'bodysuit', outfit:'#c9a24a', accent:'#fff3c4', sparkle:1, mic:1 } },
 { from:2003, n:'Dangerously in Love', base:B({ style:'waves', hairLen:.7, lips:'#b5564e' }), stage:{ top:'tee', outfit:'#f4f1ea', accent:'#e8b04b', pants:'#3c6eb4', boots:'tall', bootColor:'#e8b04b', mic:1 } },
 { from:2008, n:'I Am... Sasha Fierce', base:B({ style:'waves', hairLen:.6, lips:'#b5564e' }), stage:{ top:'bodysuit', outfit:'#141414', accent:'#c0c0c8', glove:'left', gloveColor:'#c0c0c8', boots:'tall', bootColor:'#141414', mic:1 } },
 { from:2011, n:'4 and self-titled', base:B({ style:'waves', hairLen:.6, lips:'#a34a4a' }), stage:{ top:'bodysuit', outfit:'#e8b04b', accent:'#fff3c4', sparkle:1, fringe:'#f3d27a', mic:1 } },
 { from:2016, n:'Lemonade', base:B({ style:'braid', hair:'#c9954f' }), stage:{ top:'gown', outfit:'#f2c230', accent:'#fff3c4', mic:1 } },
 { from:2018, n:'Homecoming', base:B({ style:'waves', hairLen:.6 }), stage:{ top:'jacket', outfit:'#f2c230', accent:'#b3202b', pants:'#f4f1ea', boots:'tall', bootColor:'#f2c230', mic:1 } },
 { from:2022, n:'Renaissance', base:B({ style:'waves', hairLen:.7, hair:'#e0c08a' }), stage:{ top:'bodysuit', outfit:'#c9ced6', accent:'#ffffff', sparkle:1, boots:'tall', bootColor:'#c9ced6', bootSparkle:1, mic:1 } },
 { from:2024, n:'Cowboy Carter', base:B({ style:'waves', hairLen:.7, hair:'#f0dfb8' }), stage:{ top:'bodysuit', outfit:'#f4f1ea', accent:'#b3202b', stripes:'#2a4a8a', hat:'cowboy', hatColor:'#f4f1ea', boots:'tall', bootColor:'#f4f1ea', mic:1 } }
];
const GY = { skin:'#f1d4c0', hair:'#f2ecd9', eyes:'#3a2a20', brow:'#7a6a50' };
const Gg = o => Object.assign({}, GY, o);
ER.LOOKS.gaga = [
 { from:1986, n:'Stefani in New York', base:Gg({ style:'long', hair:'#3a2417' }), stage:{ top:'jacket', outfit:'#1a1a1a', accent:'#e8e8e8', pants:'#1a1a1a' } },
 { from:2008, n:'The Fame', base:Gg({ style:'bob', bow:'#f2ecd9', lips:'#b3202b' }), stage:{ top:'bodysuit', outfit:'#9aa3b5', accent:'#ffffff', sparkle:1, glasses:'#111', boots:'tall', bootColor:'#111', mic:1 } },
 { from:2009, n:'The Fame Monster', base:Gg({ style:'bob', bangs:1, lips:'#b3202b' }), stage:{ top:'bodysuit', outfit:'#f4f1ea', accent:'#c0c0c8', sparkle:1, sleeves:1, boots:'tall', bootColor:'#f4f1ea', mic:1 } },
 { from:2011, n:'Born This Way', base:Gg({ style:'straight', hairLen:.7, lips:'#5a1030', liner:1 }), stage:{ top:'bodysuit', outfit:'#111111', accent:'#c0c0c8', sleeves:1, boots:'tall', bootColor:'#111', mic:1 } },
 { from:2013, n:'Artpop and Cheek to Cheek', base:Gg({ style:'waves', hairLen:.55, hair:'#9ad0e8', lips:'#b3202b' }), stage:{ top:'gown', outfit:'#1a1a1a', accent:'#e8e8e8', sparkle:1, mic:1 } },
 { from:2016, n:'Joanne and A Star Is Born', base:Gg({ style:'straight', hairLen:.6, lips:'#c46d6d' }), stage:{ top:'jacket', outfit:'#f2a3c7', accent:'#ffffff', hat:'wide', hatColor:'#f2a3c7', pants:'#3c5a8a', guitar:1 } },
 { from:2020, n:'Chromatica', base:Gg({ style:'ponytail', hair:'#f28ab8', lips:'#b3202b' }), stage:{ top:'bodysuit', outfit:'#1a1a1a', accent:'#f28ab8', sparkle:1, boots:'tall', bootColor:'#1a1a1a', mic:1 } },
 { from:2023, n:'Joker and Harlequin', base:Gg({ style:'straight', hairLen:.55, hair:'#3a2417', lips:'#b3202b' }), stage:{ top:'suit', outfit:'#b3202b', accent:'#1a1a1a', pants:'#b3202b', mic:1 } },
 { from:2025, n:'Mayhem', base:Gg({ style:'straight', hairLen:.75, hair:'#141414', lips:'#5a1030', liner:1 }), stage:{ top:'gown', outfit:'#1a1a1a', accent:'#b3202b', sparkle:1, mic:1 } }
];
ER.lookAtYear = (who, y) => { const L = ER.LOOKS[who]; let pick = L[0]; L.forEach(l => { if (l.from <= y) pick = l; }); return pick; };

/* ---------- Real-success anchors ---------- */
// An estimated fanbase curve for the game. These are rough game-scale estimates of reach,
// not official counts.
ER.FAN_CURVE = { taylor:[
 ['2001-01-01', 60], ['2003-01-01', 2500], ['2005-01-01', 9000], ['2006-06-01', 60000], ['2006-12-31', 450000],
 ['2007-12-31', 2.2e6], ['2008-12-31', 6e6], ['2009-12-31', 12e6], ['2010-12-31', 18e6], ['2011-12-31', 23e6],
 ['2012-12-31', 32e6], ['2013-12-31', 40e6], ['2014-12-31', 55e6], ['2015-12-31', 72e6], ['2016-12-31', 76e6],
 ['2017-12-31', 88e6], ['2018-12-31', 102e6], ['2019-12-31', 118e6], ['2020-12-31', 135e6], ['2021-12-31', 152e6],
 ['2022-12-31', 180e6], ['2023-12-31', 255e6], ['2024-12-31', 295e6], ['2025-12-31', 320e6], ['2026-12-31', 335e6]
].map(([d, v]) => [W(d), v]) };
// Real Hot 100 peaks for well-known singles.
ER.PEAKS = {
 'Tim McGraw':40, 'Teardrops on My Guitar':13, 'Our Song':16, 'Picture to Burn':28, "Should've Said No":33,
 'Love Story':4, 'White Horse':13, 'You Belong with Me':2, 'Fifteen':23, 'Fearless':9, 'Today Was a Fairytale':2,
 'Mine':3, 'Back to December':6, 'Mean':11, 'The Story of Us':41, 'Sparks Fly':17, 'Ours':13, 'Safe & Sound':30,
 'We Are Never Ever Getting Back Together':1, 'Begin Again':7, 'I Knew You Were Trouble':2, '22':20, 'Red':6, 'Everything Has Changed':32,
 'Shake It Off':1, 'Blank Space':1, 'Style':6, 'Bad Blood':1, 'Wildest Dreams':5, 'Out of the Woods':18, 'New Romantics':46,
 'Look What You Made Me Do':1, '...Ready for It?':4, 'Gorgeous':13, 'End Game':18, 'Delicate':12,
 'ME!':2, 'You Need to Calm Down':2, 'Lover':10, 'The Man':23, 'Cruel Summer':1,
 'cardigan':1, 'exile':6, 'the 1':4, 'willow':1, "Love Story (Taylor's Version)":11, "All Too Well (10 Minute Version) (Taylor's Version)":1,
 'Anti-Hero':1, 'Lavender Haze':2, 'Karma':2, "Is It Over Now? (Taylor's Version)":1, 'Fortnight':1, 'The Fate of Ophelia':1
};
// Real tour scale: approximate show counts, used for the manager's suggested plan.
ER.TOUR_SHOWS = { fearless:105, speaknow:111, red:86, '1989':85, rep:53, midnights:149 };
})();
