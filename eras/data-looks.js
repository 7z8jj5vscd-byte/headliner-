/* The Eras Life: era looks for the 3D performers, and the real-success anchors that
   fans, singles and tours follow. Looks are stylised toon caricatures of each era's
   public image (hair, make-up, the colour and silhouette of the stage costumes). */
(function () {
const ER = window.ER, W = ER.ds;

// Taylor: bright blonde throughout, lightest in the Reputation years. The hair stays bright under coloured stage light.
const TS = { skin:'#f6d9c4', hair:'#f3db94', eyes:'#4a7aa8', brow:'#b8945a', hairGlow:1 };
const T = (o) => Object.assign({}, TS, o);
// Each era: base (hair and make-up), stage (performing that era), casual (writing, studio, press),
// and eras (that era's act on the 2023–2024 Eras Tour).
ER.LOOKS = ER.LOOKS || {};
ER.LOOKS.taylor = {
 // Childhood: blonde curls, jeans, boots.
 early:{ base:T({ style:'curly', hairLen:.5, lips:'#e39a9a' }),
   stage:{ top:'dress', outfit:'#9cc7e6', accent:'#ffffff', boots:'tall', bootColor:'#8a5a2b', guitar:1 },
   casual:{ top:'tee', outfit:'#f4c9d6', accent:'#ffffff', boots:'tall', bootColor:'#8a5a2b', pants:'#4a6fa5' } },
 // 2006–2007: long tight ringlets, sundresses and cowboy boots, natural make-up.
 ts1:{ base:T({ style:'curly', hairLen:.68, lips:'#e08c94' }),
   stage:{ top:'dress', outfit:'#3fb6b0', accent:'#d8fbf6', boots:'tall', bootColor:'#7a4a24', guitar:1, guitarColor:'#d9a35a', necklace:'#e6e6ee' },
   casual:{ top:'dress', outfit:'#f2e6c9', accent:'#3fb6b0', boots:'tall', bootColor:'#7a4a24', guitar:1, guitarColor:'#d9a35a' } },
 // 2008–2010: big curls, sparkly gold and silver fringe dresses, glitter guitar, marching-band jacket on tour.
 fearless:{ base:T({ style:'curly', hairLen:.72, lips:'#e07a8a', liner:1 }),
   stage:{ top:'sequin', outfit:'#e3be55', accent:'#fff4c4', fringe:'#f6dc84', boots:'tall', bootColor:'#e9c766', bootSparkle:1, guitar:1, guitarColor:'#f0d27a', guitarSparkle:1 },
   casual:{ top:'dress', outfit:'#f6e9bf', accent:'#d6a93a', boots:'tall', bootColor:'#7a4a24', guitar:1, guitarColor:'#c98a3a' },
   eras:{ top:'sequin', outfit:'#e3be55', accent:'#fff4c4', fringe:'#f6dc84', boots:'tall', bootColor:'#e9c766', bootSparkle:1, guitar:1, guitarColor:'#f0d27a', guitarSparkle:1 } },
 // 2010–2012: curls, sweeping ball gowns in purple, berry lips.
 speaknow:{ base:T({ style:'curly', hairLen:.72, lips:'#b9476e', liner:1 }),
   stage:{ top:'gown', outfit:'#7d3fb0', accent:'#ecd6ff', sparkle:1, necklace:'#e8e8f0', mic:1 },
   casual:{ top:'dress', outfit:'#c7a3e6', accent:'#ffffff', boots:'tall', bootColor:'#3a2414', guitar:1 },
   eras:{ top:'gown', outfit:'#c9a2e8', accent:'#ffffff', sparkle:1, mic:1 } },
 // 2012–2014: straight hair with full bangs, red lips, cat-eye; ringmaster on tour; stripes and a black hat off duty.
 red:{ base:T({ style:'straight', bangs:1, hairLen:.6, lips:'#c8102e', liner:1 }),
   stage:{ top:'jacket', outfit:'#c8102e', accent:'#111111', hat:'top', hatColor:'#111111', shorts:'#f4f1ea', boots:'tall', bootColor:'#111111', sleeves:1, mic:1 },
   casual:{ top:'tee', outfit:'#f6f3ec', accent:'#1a2b5a', stripes:'#1a2b5a', hat:'fedora', hatColor:'#111111', shorts:'#c8102e' },
   eras:{ top:'tee', outfit:'#111111', accent:'#f4f1ea', hat:'fedora', hatColor:'#111111', shorts:'#111111', boots:'tall', bootColor:'#111111', mic:1 } },
 // 2014–2016: the short bob, red lips, cat-eye; crop tops and skirts; sequinned two-pieces on tour.
 '1989':{ base:T({ style:'bob', lips:'#c8102e', liner:1 }),
   stage:{ top:'crop', outfit:'#3f9be0', accent:'#e8f6ff', sparkle:1, boots:'tall', bootColor:'#e8f6ff', bootSparkle:1, mic:1 },
   casual:{ top:'crop', outfit:'#f6f3ec', accent:'#6fa8d6', boots:'tall', bootColor:'#2a2a2a' },
   eras:{ top:'crop', outfit:'#f06fb4', accent:'#ffe1f2', sparkle:1, boots:'tall', bootColor:'#f06fb4', bootSparkle:1, mic:1 } },
 // 2017–2018: lighter, near-platinum straight hair, dark burgundy lips, smoky eyes; black sequins, snakes, thigh-high boots.
 rep:{ base:T({ style:'straight', hairLen:.44, lips:'#6d0f24', liner:1, hair:'#f6e7bd' }),
   stage:{ top:'bodysuit', outfit:'#18181b', accent:'#5ee08a', sparkle:1, snake:'#3fbf6a', boots:'tall', bootColor:'#111', bootSparkle:1, sleeves:1, mic:1 },
   casual:{ top:'jacket', outfit:'#1e1e21', accent:'#3a3a40', pants:'#111', boots:'tall', bootColor:'#111' },
   eras:{ top:'bodysuit', outfit:'#18181b', accent:'#e0283a', sparkle:1, snake:'#e0283a', boots:'tall', bootColor:'#111', bootSparkle:1, mic:1 } },
 // 2019–2020: bangs with pink and blue tips, a pink heart drawn around one eye, pastels and glitter.
 lover:{ base:T({ style:'waves', bangs:1, hairLen:.58, tips:'#f49ac8', lips:'#e0457e', heartEye:'#f06fb4', glitterEye:'#9fd8ff' }),
   stage:{ top:'bodysuit', outfit:'#f39ac4', accent:'#a8dcff', sparkle:1, boots:'tall', bootColor:'#f8c0dc', bootSparkle:1, mic:1 },
   casual:{ top:'jacket', outfit:'#bfe3ff', accent:'#f6a8c8', pants:'#f6a8c8' },
   eras:{ top:'bodysuit', outfit:'#a8c8f0', accent:'#f6b6d8', sparkle:1, boots:'tall', bootColor:'#a8c8f0', bootSparkle:1, mic:1 } },
 // 2020: braids and a low bun, bangs, natural make-up, oversized cardigans, a cream dress for the cabin.
 folklore:{ base:T({ style:'braid', bangs:1, lips:'#c98080' }),
   stage:{ top:'gown', outfit:'#efe9dc', accent:'#ffffff', guitar:1, guitarColor:'#d8c7a4' },
   casual:{ top:'cardigan', outfit:'#e7e2d6', accent:'#8f9093', pants:'#4a4a4c' },
   eras:{ top:'gown', outfit:'#e6f0d8', accent:'#ffffff', mic:1 } },
 // 2020–2021: braid with bangs, brown and black plaid coats, an ochre gown on stage.
 evermore:{ base:T({ style:'braid', bangs:1, lips:'#b05a4a' }),
   stage:{ top:'gown', outfit:'#c8862e', accent:'#f6e2b0', guitar:1, guitarColor:'#a87a4a' },
   casual:{ top:'coat', outfit:'#7a4a2a', plaid:'#1e140e', accent:'#e9d8bd', pants:'#3d2416' },
   eras:{ top:'gown', outfit:'#c8862e', accent:'#f6e2b0', fringe:'#e2a94a', guitar:1, guitarColor:'#a87a4a' } },
 // 2022–2023: wavy hair with bangs, deep red lips, glitter around the eyes; navy sequins and a purple faux-fur coat.
 midnights:{ base:T({ style:'waves', bangs:1, hairLen:.62, lips:'#a3123a', liner:1, glitterEye:'#c9b8ff' }),
   stage:{ top:'sequin', outfit:'#28337a', accent:'#c3cffe', overcoat:'#8a6bc4', sleeves:1, mic:1 },
   casual:{ top:'jacket', outfit:'#2c3e70', accent:'#b8c4ea', pants:'#0d132b' },
   eras:{ top:'sequin', outfit:'#28337a', accent:'#c3cffe', overcoat:'#8a6bc4', boots:'tall', bootColor:'#28337a', bootSparkle:1, mic:1 } },
 // 2024: waves with bangs, red lips; flowing white and cream, black and white for the poets.
 ttpd:{ base:T({ style:'waves', bangs:1, hairLen:.62, lips:'#b3102e', liner:1 }),
   stage:{ top:'gown', outfit:'#f6f3ec', accent:'#ffffff', sparkle:1, mic:1 },
   casual:{ top:'jacket', outfit:'#e9e3d6', accent:'#2a2622', pants:'#2a2622' },
   eras:{ top:'gown', outfit:'#f6f3ec', accent:'#ffffff', sparkle:1, mic:1 } },
 // 2025–2026: waves with bangs, red lips, showgirl orange and mint, sequins and feathers.
 showgirl:{ base:T({ style:'waves', bangs:1, hairLen:.64, lips:'#c8102e', liner:1, glitterEye:'#ffd08a' }),
   stage:{ top:'bodysuit', outfit:'#ec7a2c', accent:'#ffe6a8', sparkle:1, feathers:'#f6b16a', boots:'tall', bootColor:'#3fc2b2', bootSparkle:1, mic:1 },
   casual:{ top:'dress', outfit:'#3fc2b2', accent:'#ec7a2c' } }
};
// Re-records: the look she had when each Taylor's Version came out, in the original era's colours.
const L = ER.LOOKS.taylor, NOW21 = T({ style:'waves', bangs:1, hairLen:.6, lips:'#c8102e', liner:1 });
L.fearlesstv = { base:NOW21, stage:L.fearless.stage, casual:{ top:'cardigan', outfit:'#f1e2b6', accent:'#d6a93a', pants:'#4a4a4c' } };
L.redtv = { base:L.red.base, stage:L.red.stage, casual:L.red.casual };
L.speaknowtv = { base:L.midnights.base, stage:L.speaknow.stage, casual:L.speaknow.casual };
L['1989tv'] = { base:L.midnights.base, stage:L['1989'].stage, casual:L['1989'].casual };
L.encore = L.showgirl;

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
