/* The Eras Life: content for endless free play after 2026. Every invented era has a sound,
   a palette and its own 3D look, and titles never run out. */
(function () {
const ER = window.ER;

// The sound of an era: where it moves the genre meter, its colours and how she dresses for it.
ER.ERA_THEMES = [
 { id:'synth', n:'Synth-pop', genre:55, pals:[['#7a5cff','#ff6bd6','#140f3a'],['#00c2ff','#ff4fa3','#0c1030']], tops:['bodysuit','crop','sequin'], hats:[], vibe:'Neon, drum machines and late nights.' },
 { id:'country', n:'Back to country', genre:10, pals:[['#c98a3a','#f6e2b0','#3d2416'],['#3fb6b0','#f2e6c9','#1e3b38']], tops:['dress','sequin'], hats:['cowboy'], guitar:1, vibe:'Fiddles, boots and story songs.' },
 { id:'folk', n:'Indie folk', genre:85, pals:[['#8f9a7a','#efe9dc','#2f3528'],['#9a8f84','#f1ece4','#3a332c']], tops:['cardigan','gown','coat'], hats:['beret'], guitar:1, vibe:'Piano, quiet guitars and cabins.' },
 { id:'rock', n:'Arena rock', genre:65, pals:[['#d0263a','#1a1a1a','#f4f1ea'],['#e6c35a','#1a1a1a','#f4f1ea']], tops:['jacket','bodysuit'], hats:[], guitar:1, vibe:'Loud guitars and big choruses.' },
 { id:'dance', n:'Dance-floor pop', genre:50, pals:[['#ff3fa4','#ffe14f','#1a0f2e'],['#3fe0c0','#ff6b6b','#0e1a2a']], tops:['crop','bodysuit','sequin'], hats:[], vibe:'Four on the floor and glitter.' },
 { id:'jazz', n:'Jazz and standards', genre:75, pals:[['#1f2a44','#e6c35a','#0a0e1a'],['#5a1a2a','#f0d9a0','#1a0a10']], tops:['gown','suit'], hats:['fedora'], vibe:'Big band, smoky rooms and old Hollywood.' },
 { id:'orchestral', n:'Orchestral pop', genre:70, pals:[['#f4f1ea','#c9a24a','#2a2622'],['#9fc3e8','#ffffff','#1a2b44']], tops:['gown'], hats:[], vibe:'Strings, choirs and ballgowns.' },
 { id:'darkpop', n:'Dark pop', genre:60, pals:[['#18181b','#b3102e','#e8e8ec'],['#2a1a3a','#8a6bc4','#e8e8ec']], tops:['bodysuit','sequin','jacket'], hats:[], vibe:'Low synths and revenge.' },
 { id:'disco', n:'Disco revival', genre:52, pals:[['#e2a43a','#ff7a3a','#2a1a0e'],['#c0c0c8','#ff4fa3','#1a1a22']], tops:['sequin','bodysuit'], hats:['wide'], vibe:'Mirror balls and string sections.' },
 { id:'acoustic', n:'Stripped acoustic', genre:30, pals:[['#e8d8c0','#8a5a3a','#2a1e14'],['#d8e6e0','#4a7a6a','#1a2a24']], tops:['dress','cardigan'], hats:[], guitar:1, vibe:'One guitar, one voice.' }
];

// Many more title words so invented eras never run out of names.
ER.TITLE_WORDS = {
 a:['Golden','Silver','Paper','Velvet','Neon','Quiet','Wild','Holy','Electric','Faded','Crimson','Glass','Midnight','Summer','Winter','Lucky','Secret','Brave','Hollow','Painted',
    'Borrowed','Burning','Copper','Distant','Endless','Frozen','Gentle','Honest','Lonely','Marble','Northern','Open','Perfect','Restless','Sacred','Second','Silent','Starlit','Tender','Wicked'],
 b:['Hearts','Highway','Letters','Ghosts','Fireworks','Garden','Lanterns','Season','Promise','Satellite','Daydream','Chapel','Matches','Postcards','Rooftops','Static','Horizon','Echoes','Storm','Kingdom',
    'Avenue','Ballroom','Carousel','Diary','Embers','Harbor','Island','Jukebox','Keepsake','Lullaby','Mirror','Orchard','Parade','Riverbank','Sparks','Telegram','Undertow','Valentine','Waltz','Weather'],
 c:['Last Dance','Out of the Blue','Hold Your Breath','Long Way Home','Say It Again','Before the Rain','Front Row','Second Chance','All of It','Slow Burn','After Hours','Tell Me Now','Over and Over','Like I Do','Still Here',
    'Come Back Down','Every Little Thing','Leave the Light On','No One Else','One More Night','Run It Back','Stay a While','The Long Goodbye','Til Morning','Write It Down']
};
ER.ALBUM_A = ['Afterglow','Kingdom','Glass','Paper','Marigold','Northern','Static','Velvet','Wildflower','Golden','Midnight','Silver','Copper','Ivory','Scarlet','Hollow','Harbor','Echo','Lantern','Satellite'];
ER.ALBUM_B = ['Hotel','Kingdom','Houses','Crown','Lights','Stars','Summer','Chapter','Shift','Season','Garden','Hour','Theatre','Republic','Society','Diaries','Avenue','Parade','Letters','Coast'];

// A small seeded random generator, so an era's look is the same every time it is drawn.
ER.seeded = function (str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
};
// Her look for an invented era: always blonde, with the era's sound and palette.
ER.makeEraLook = function (theme, pal, seed) {
  const r = ER.seeded(seed), pk = a => a[Math.floor(r() * a.length)];
  const blondes = ['#f3db94','#f6e7bd','#efd08a','#f8ecc8','#e9cc86'];
  const base = { skin:'#f6d9c4', hair:pk(blondes), eyes:'#4a7aa8', brow:'#b8945a', hairGlow:1,
    style:pk(theme.id === 'folk' || theme.id === 'acoustic' ? ['braid','waves','bun'] : theme.id === 'jazz' ? ['waves','bob','bun'] : ['waves','straight','bob','curly','waves']),
    bangs:r() < .7 ? 1 : 0, hairLen:.45 + r() * .25, lips:pk(['#c8102e','#a3123a','#e0457e','#c46d6d','#6d0f24']), liner:r() < .7 ? 1 : 0 };
  if (r() < .15) base.tips = pal[1];
  if (r() < .2) base.glitterEye = pal[1];
  const top = pk(theme.tops), hat = theme.hats.length && r() < .5 ? pk(theme.hats) : 0;
  const stage = { top, outfit:pal[0], accent:pal[1], sparkle:top === 'gown' ? (r() < .6 ? 1 : 0) : 1, boots:'tall', bootColor:r() < .5 ? pal[0] : pal[2], bootSparkle:r() < .5 ? 1 : 0, mic:theme.guitar && r() < .5 ? 0 : 1, guitar:theme.guitar && r() < .5 ? 1 : 0 };
  if (hat) { stage.hat = hat; stage.hatColor = pal[2]; }
  if (r() < .2) stage.feathers = pal[1];
  if (r() < .2 && top !== 'gown') stage.fringe = pal[1];
  const casual = { top:pk(['jacket','cardigan','tee','dress','coat']), outfit:pal[1], accent:pal[0], pants:pal[2] };
  if (hat && r() < .5) { casual.hat = hat; casual.hatColor = pal[2]; }
  return { base, stage, casual };
};
})();
