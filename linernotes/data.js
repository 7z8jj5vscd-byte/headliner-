/* Liner Notes: game data. Real artists appear by name only; every storyline, song title,
   chart run and award result involving them is made up by the game. Labels, apps, outlets,
   award shows, festivals, brands, producers and studios are fictional. */
(function (root) {
const D = {};

D.REGIONS = [
  { id: 'NA', name: 'North America', short: 'N. America', size: 1.0 },
  { id: 'EU', name: 'Europe & Africa', short: 'Eur/Africa', size: 0.85 },
  { id: 'LA', name: 'Latin America', short: 'Latin Am.', size: 0.55 },
  { id: 'AS', name: 'Asia-Pacific', short: 'Asia-Pac', size: 0.75 },
];
D.REGION_IDS = D.REGIONS.map(r => r.id);

D.CITIES = [
  ['Los Angeles','NA'],['New York','NA'],['Atlanta','NA'],['Nashville','NA'],['Toronto','NA'],['Chicago','NA'],['Houston','NA'],['Miami','NA'],
  ['London','EU'],['Paris','EU'],['Berlin','EU'],['Stockholm','EU'],['Madrid','EU'],['Amsterdam','EU'],['Manchester','EU'],['Lagos','EU'],['Johannesburg','EU'],
  ['Mexico City','LA'],['São Paulo','LA'],['Bogotá','LA'],['Buenos Aires','LA'],['San Juan','LA'],['Santiago','LA'],['Medellín','LA'],['Lima','LA'],
  ['Seoul','AS'],['Tokyo','AS'],['Manila','AS'],['Jakarta','AS'],['Mumbai','AS'],['Bangkok','AS'],['Sydney','AS'],['Singapore','AS'],
].map(([name, region]) => ({ name, region }));

// family groups genres so real artists, trends and producers can match
D.GENRES = [
  ['Pop','pop'],['Dance Pop','pop'],['Hyperpop','pop'],['Synth-pop','pop'],
  ['Hip-Hop','hiphop'],['Trap','hiphop'],['Drill','hiphop'],['Conscious Rap','hiphop'],
  ['R&B','rnb'],['Neo-Soul','rnb'],['Funk','rnb'],['Gospel','rnb'],
  ['Rock','rock'],['Alternative','rock'],['Punk','rock'],['Metal','rock'],
  ['Indie','indie'],['Bedroom Pop','indie'],['Lo-fi','indie'],
  ['Country','country'],['Americana','country'],['Folk','country'],['Singer-Songwriter','country'],
  ['EDM','electronic'],['House','electronic'],['Synthwave','electronic'],
  ['Reggaeton','latin'],['Latin Pop','latin'],['Regional Mexican','latin'],
  ['K-pop','kpop'],['J-pop','kpop'],
  ['Afrobeats','afro'],['Dancehall','afro'],
  ['Jazz','jazz'],['Blues','jazz'],
].map(([name, fam]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, fam }));
D.GENRE = Object.fromEntries(D.GENRES.map(g => [g.id, g]));
D.FAMILIES = ['pop','hiphop','rnb','rock','indie','country','electronic','latin','kpop','afro','jazz'];
D.FAMILY_NAME = { pop:'Pop', hiphop:'Hip-Hop', rnb:'R&B/Soul', rock:'Rock', indie:'Indie', country:'Country/Folk', electronic:'Electronic', latin:'Latin', kpop:'K-pop/J-pop', afro:'Afrobeats', jazz:'Jazz/Blues' };
// where each family is most popular
D.FAMILY_REGION = {
  pop:{NA:1,EU:1,LA:.7,AS:.8}, hiphop:{NA:1.2,EU:.8,LA:.5,AS:.4}, rnb:{NA:1.1,EU:.8,LA:.4,AS:.5},
  rock:{NA:.9,EU:1.1,LA:.6,AS:.6}, indie:{NA:.9,EU:1,LA:.4,AS:.5}, country:{NA:1.4,EU:.4,LA:.2,AS:.3},
  electronic:{NA:.8,EU:1.2,LA:.6,AS:.7}, latin:{NA:.7,EU:.6,LA:1.6,AS:.3}, kpop:{NA:.6,EU:.5,LA:.5,AS:1.6},
  afro:{NA:.6,EU:1.2,LA:.3,AS:.3}, jazz:{NA:.8,EU:.9,LA:.4,AS:.6},
};

D.MOODS = ['Euphoric','Heartbroken','Defiant','Romantic','Nostalgic','Dark','Carefree','Angry','Hopeful','Lonely'];
D.TOPICS = ['Love','Breakup','Partying','Money','Hometown','Fame','Friendship','Self-worth','Revenge','Late nights','Family','Summer','Freedom','Growing up','Diss track'];
D.TEMPOS = [{ id:'slow', name:'Slow', bpm:72 }, { id:'mid', name:'Mid-tempo', bpm:100 }, { id:'up', name:'Upbeat', bpm:122 }, { id:'fast', name:'Fast', bpm:142 }];

// Real artists: [name, genre id, home region, fame 0-100, group?]
D.REAL = [
  ['Taylor Swift','pop','NA',97],['Drake','hip-hop','NA',94],['Bad Bunny','reggaeton','LA',96],['The Weeknd','r-b','NA',91],
  ['Billie Eilish','pop','NA',90],['SZA','r-b','NA',89],['Kendrick Lamar','conscious-rap','NA',93],['Sabrina Carpenter','pop','NA',90],
  ['Olivia Rodrigo','pop','NA',88],['Ariana Grande','pop','NA',90],['Dua Lipa','dance-pop','EU',87],['Ed Sheeran','pop','EU',88],
  ['Harry Styles','pop','EU',86],['Post Malone','country','NA',85],['Morgan Wallen','country','NA',90],['Zach Bryan','americana','NA',84],
  ['Beyoncé','r-b','NA',92],['Travis Scott','trap','NA',85],['Doja Cat','pop','NA',81],['Chappell Roan','synth-pop','NA',85],
  ['Tyler, The Creator','hip-hop','NA',84],['Future','trap','NA',81],['Lady Gaga','dance-pop','NA',88],['Bruno Mars','funk','NA',89],
  ['Benson Boone','pop','NA',80],['Teddy Swims','r-b','NA',76],['Noah Kahan','folk','NA',78],['Gracie Abrams','singer-songwriter','NA',79],
  ['Tate McRae','dance-pop','NA',80],['Lana Del Rey','alternative','NA',80],['Megan Thee Stallion','hip-hop','NA',77],['GloRilla','hip-hop','NA',73],
  ['Shaboozey','country','NA',75],['Luke Combs','country','NA',85],['Chris Stapleton','country','NA',80],['Lainey Wilson','country','NA',76],
  ['Jelly Roll','country','NA',78],['Twenty One Pilots','alternative','NA',76],['Linkin Park','rock','NA',82],['Green Day','punk','NA',75],
  ['Foo Fighters','rock','NA',73],['Metallica','metal','NA',80],['Marshmello','edm','NA',74],['Laufey','jazz','EU',74],
  ['Mitski','indie','NA',74],['Clairo','bedroom-pop','NA',72],['Phoebe Bridgers','indie','NA',71],['Tame Impala','indie','AS',76],
  ['Coldplay','rock','EU',87],['Arctic Monkeys','alternative','EU',78],['Imagine Dragons','rock','NA',80],['Måneskin','rock','EU',72],
  ['Calvin Harris','house','EU',80],['David Guetta','edm','EU',78],['Fred again..','house','EU',74],['Raye','r-b','EU',74],
  ['Central Cee','drill','EU',78],['Aya Nakamura','pop','EU',72],['Stromae','pop','EU',70],['Hozier','folk','EU',80],
  ['The 1975','indie','EU',73],['Bring Me The Horizon','metal','EU',70],['Kygo','house','EU',73],['Skrillex','edm','NA',71],
  ['Burna Boy','afrobeats','EU',80],['Wizkid','afrobeats','EU',76],['Rema','afrobeats','EU',77],['Tems','afrobeats','EU',75],
  ['Tyla','afrobeats','EU',76],['Ayra Starr','afrobeats','EU',70],
  ['Karol G','reggaeton','LA',88],['Peso Pluma','regional-mexican','LA',82],['Feid','reggaeton','LA',80],['Rauw Alejandro','reggaeton','LA',78],
  ['Shakira','latin-pop','LA',85],['J Balvin','reggaeton','LA',76],['Anitta','latin-pop','LA',76],['Rosalía','latin-pop','EU',78],
  ['Fuerza Regida','regional-mexican','LA',74],['Myke Towers','reggaeton','LA',75],
  ['BTS','k-pop','AS',92],['BLACKPINK','k-pop','AS',90],['Stray Kids','k-pop','AS',84],['SEVENTEEN','k-pop','AS',82],
  ['TWICE','k-pop','AS',80],['ROSÉ','k-pop','AS',82],['LE SSERAFIM','k-pop','AS',76],['aespa','k-pop','AS',77],
  ['ATEEZ','k-pop','AS',75],['YOASOBI','j-pop','AS',78],['Kenshi Yonezu','j-pop','AS',76],['Ado','j-pop','AS',74],
];

// Fictional NPC names
D.NPC_FIRST = ['Nova','Jaylen','Mara','Kai','Delilah','Rico','Saint','Lux','Ivy','Remy','Zane','Coco','Theo','Juno','Ezra','Skye','Malik','Paloma','Dex','Aria','Bodhi','Cleo','Orion','Vale','Rhea','Tobias','Nyla','Cash','Wren','Indigo','Kenji','Ayo','Lola','Marlowe','Soren','Tali','Bishop','Esme','Rio','Hollis'];
D.NPC_LAST = ['Vance','Rivers','Monroe','Kade','Sterling','Blue','Hart','Reyes','Okafor','Lune','Grey','Park','Castillo','Frost','Wilder','Cruz','Moreau','Sato','Banks','Noble','Ashby','Vega','Steele','Quinn','Love','Diaz','Kim','Adeyemi','Fox','Lake'];
D.NPC_MONO = ['VANTA','Lil Tempo','DJ Orbit','Yung Halo','Saint Velvet','KAYO','Mirage','Big Ledger','Sunny Daze','Rook','Glasshouse','Lowkey Lou','NEON BLOSSOM','Moth','Static Kids','The Paper Tigers','Wild Honey','Northern Static','Velvet Riot','The Late Bloomers','Bad Habit Club','Cherry Arcade','Sad Satellite','Ghost Pilot','ZEN-Z','Hollow Coast','Kid Comet','Lady Lumen','Mama Juju','The Night Shift'];

// Song title generator
D.T_A = ['Neon','Midnight','Golden','Broken','Paper','Velvet','Electric','Lonely','Wild','Sweet','Cold','Silver','Burning','Silent','Crystal','Heavy','Lucky','Velour','Fading','Holy','Dirty','Endless','Glass','Cherry','Lost'];
D.T_B = ['Heart','Summer','City','Static','Highway','Ghost','Fever','Mirror','Tide','Sky','Fire','Love','Night','Angel','Signal','Cherry','Paradise','Echo','Thunder','Diamond','Satellite','Shadow','Lights','Waves','Season'];
D.T_SOLO = ['Overtime','Say Less','No Signal','Glowstick','Kerosene','Low Battery','Second Wind','Main Character','Run It Back','Gravity','Sugarcoat','Parachute','Bad Idea','Hold Me Down','Wasted Youth','Slow Burn','Rewind','Cliffhanger','Fool\'s Gold','Real Ones','Aftertaste','Butterflies','Bulletproof','Daydream','Wildfire','Hometown Hero','Ten Toes','Ride Or Die','Backseat','Ultraviolet','Cold Feet','Heatwave','Second Chance','Blindside','Moonwalk','Last Call','Static','Pressure','Velvet Rope','Cherry Soda'];
D.ALBUM_WORDS = ['Chapters','Liner Notes','The Long Way Home','Static & Silk','Midnight Diaries','Blue Hour','Paper Crowns','Growing Pains','Neon Gospel','Concrete Garden','Afterparty','Glass House','Late Bloomer','Heavy Is The Head','Signal Fire','Daydreamer','Rose Tinted','Low Light','Gold Rush','Echo Chamber','Summer Ruins','Wildflower','North Star','Bittersweet Symphony','The Comedown','Satellite Heart','Homecoming','Polaroids','Vertigo','Rebirth'];

D.STORIES = [
  { id:'bedroom', name:'Bedroom producer', text:'You learned everything from tutorials and a cracked laptop. Your beats are good. Your voice, less so.',
    skills:{ write:25, vocals:15, prod:38, perf:10, charisma:15 }, money:1500, fans:900, age:19, hype:5 },
  { id:'choir', name:'Church choir kid', text:'You have been singing since you could stand. Your voice carries a room, but you have never written a full song.',
    skills:{ write:15, vocals:42, prod:8, perf:28, charisma:18 }, money:800, fans:350, age:18, hype:5 },
  { id:'battle', name:'Battle rapper', text:'You made your name tearing people apart in parking lots. Fans love your bars, and you already have an enemy.',
    skills:{ write:36, vocals:18, prod:12, perf:28, charisma:32 }, money:600, fans:2500, age:20, hype:15, rival:true, genreHint:'hip-hop' },
  { id:'nepo', name:'Industry kid', text:'Your parent was famous. Doors open for you, but the press thinks you have not earned it.',
    skills:{ write:20, vocals:22, prod:15, perf:20, charisma:30 }, money:50000, fans:18000, age:21, hype:25, pressPenalty:6 },
  { id:'busker', name:'Street busker', text:'Subway platforms and street corners taught you how to win over strangers in thirty seconds.',
    skills:{ write:22, vocals:28, prod:5, perf:38, charisma:24 }, money:400, fans:1200, age:22, hype:5 },
  { id:'viral', name:'Viral nobody', text:'One clip of you singing in your car blew up. Now 40,000 people want to know what you do next.',
    skills:{ write:16, vocals:22, prod:10, perf:14, charisma:20 }, money:2000, fans:40000, age:19, hype:60, viralSong:true },
  { id:'school', name:'Music school grad', text:'Four years of theory, ear training and student loans. Your skills are balanced. Your bank account is not.',
    skills:{ write:30, vocals:30, prod:25, perf:20, charisma:15 }, money:3000, fans:300, age:23, hype:0, loan:{ weekly:150, weeks:200 } },
  { id:'session', name:'Session musician', text:'You have played on other people\'s records for years. Studios give you a discount and you know how a hit is built.',
    skills:{ write:25, vocals:20, prod:28, perf:30, charisma:14 }, money:6000, fans:200, age:26, hype:0, studioDiscount:0.3 },
  { id:'talent', name:'Talent show runner-up', text:'Millions watched you come second on TV. The audience remembers you for now, and a label is already calling.',
    skills:{ write:12, vocals:36, prod:6, perf:32, charisma:32 }, money:10000, fans:65000, age:20, hype:45, labelOffer:true },
  { id:'smalltown', name:'Small-town songwriter', text:'Notebooks full of songs about your hometown. Nobody has heard them yet.',
    skills:{ write:45, vocals:20, prod:8, perf:15, charisma:12 }, money:1000, fans:150, age:20, hype:0, genreHint:'country' },
];

D.SKILLS = [
  { id:'write', name:'Songwriting' }, { id:'vocals', name:'Vocals' }, { id:'prod', name:'Production' },
  { id:'perf', name:'Performance' }, { id:'charisma', name:'Charisma' },
];

D.STUDIOS = [
  { id:'home', name:'Home setup', cost:0, bonus:0, cap:62, text:'Free, but quality is capped.' },
  { id:'indie', name:'Indie studio', cost:600, bonus:6, cap:80, text:'A real room and a real engineer.' },
  { id:'pro', name:'Pro studio', cost:5000, bonus:12, cap:94, text:'Where most charting records are made.' },
  { id:'elite', name:'Legendary studio', cost:25000, bonus:18, cap:100, text:'The room where classics were cut.' },
];

D.PRODUCERS = [
  { id:'self', name:'Produce it yourself', fam:null, skill:0, fee:0, buzz:0 },
  { id:'p1', name:'Kid Kettle', fam:'hiphop', skill:58, fee:1500, buzz:2 },
  { id:'p2', name:'Marisol Ortega', fam:'latin', skill:62, fee:2500, buzz:3 },
  { id:'p3', name:'Two Left Hands', fam:'indie', skill:60, fee:2000, buzz:2 },
  { id:'p4', name:'June Halloway', fam:'country', skill:64, fee:3000, buzz:3 },
  { id:'p5', name:'Brightside', fam:'pop', skill:68, fee:6000, buzz:5 },
  { id:'p6', name:'Okoro Beats', fam:'afro', skill:70, fee:8000, buzz:6 },
  { id:'p7', name:'Lumen & Vos', fam:'electronic', skill:72, fee:10000, buzz:6 },
  { id:'p8', name:'Park Ji-ho', fam:'kpop', skill:76, fee:15000, buzz:8 },
  { id:'p9', name:'Dr. Velvet', fam:'rnb', skill:80, fee:25000, buzz:10 },
  { id:'p10', name:'Max Holloway', fam:'rock', skill:82, fee:30000, buzz:10 },
  { id:'p11', name:'The Architect', fam:'pop', skill:90, fee:80000, buzz:18 },
  { id:'p12', name:'Metro Saint', fam:'hiphop', skill:92, fee:100000, buzz:20 },
];

D.COWRITERS = [
  { id:'c1', name:'Benny Marsh', skill:50, fee:500, share:0.10 },
  { id:'c2', name:'Lila Fontaine', skill:58, fee:1500, share:0.12 },
  { id:'c3', name:'Oscar Nwosu', skill:64, fee:4000, share:0.15 },
  { id:'c4', name:'Hana Morita', skill:70, fee:9000, share:0.18 },
  { id:'c5', name:'Gus Delacroix', skill:78, fee:20000, share:0.20 },
  { id:'c6', name:'Ruby Achterberg', skill:86, fee:45000, share:0.25 },
];
D.CAMPS = [
  { id:'camp1', name:'Weekend writing camp', cost:3000, songs:2, bonus:6, energy:45 },
  { id:'camp2', name:'Writing retreat in the hills', cost:15000, songs:3, bonus:12, energy:60 },
];

D.LABELS = [
  { id:'basement', name:'Basement Tapes Records', tier:'Indie', reach:90000, adv:[3000,20000], roy:[0.40,0.55], masters:'artist', minFame:8, fam:null, playlist:0.05 },
  { id:'lighthouse', name:'Lighthouse Sound', tier:'Indie', reach:220000, adv:[15000,80000], roy:[0.30,0.42], masters:'either', minFame:20, fam:null, playlist:0.08 },
  { id:'velvet', name:'Velvet Static', tier:'Indie', reach:260000, adv:[20000,90000], roy:[0.30,0.40], masters:'either', minFame:22, fam:'indie', playlist:0.1 },
  { id:'northbound', name:'Northbound Music', tier:'Mid', reach:650000, adv:[80000,400000], roy:[0.20,0.28], masters:'either', minFame:35, fam:null, playlist:0.15 },
  { id:'crown', name:'Crown Avenue Records', tier:'Mid', reach:700000, adv:[100000,450000], roy:[0.20,0.27], masters:'label', minFame:35, fam:'hiphop', playlist:0.15 },
  { id:'solstice', name:'Solstice Latin', tier:'Mid', reach:650000, adv:[80000,380000], roy:[0.20,0.28], masters:'either', minFame:33, fam:'latin', playlist:0.15 },
  { id:'monolith', name:'Monolith Music Group', tier:'Major', reach:2000000, adv:[400000,3000000], roy:[0.15,0.22], masters:'label', minFame:48, fam:null, playlist:0.25 },
  { id:'paragon', name:'Paragon Records', tier:'Major', reach:1800000, adv:[350000,2500000], roy:[0.16,0.23], masters:'label', minFame:45, fam:null, playlist:0.24 },
  { id:'starfield', name:'Starfield Entertainment', tier:'Major', reach:1700000, adv:[300000,2000000], roy:[0.15,0.22], masters:'label', minFame:45, fam:'kpop', playlist:0.22 },
];

D.TEAM = {
  manager:   { name:'Manager', text:'Finds better offers and negotiates bigger deals.', tiers:[{ n:'Hungry rookie', pay:300, cut:0.10, power:1 }, { n:'Seasoned manager', pay:2500, cut:0.12, power:2 }, { n:'Superstar manager', pay:12000, cut:0.15, power:3 }] },
  publicist: { name:'Publicist', text:'Better press, better reviews, playlist pitches and damage control.', tiers:[{ n:'Freelance publicist', pay:400, power:1 }, { n:'PR firm', pay:3000, power:2 }, { n:'Crisis legend', pay:10000, power:3 }] },
  agent:     { name:'Booking agent', text:'Bigger gigs, festival slots, TV spots and movie roles.', tiers:[{ n:'Local booker', pay:250, cut:0.08, power:1 }, { n:'Touring agency', pay:2000, cut:0.10, power:2 }, { n:'Hollywood agency', pay:9000, cut:0.10, power:3 }] },
  stylist:   { name:'Stylist', text:'Sharper photos and videos, cheaper wardrobe, stronger image.', tiers:[{ n:'Friend with taste', pay:150, power:1 }, { n:'Fashion stylist', pay:1500, power:2 }, { n:'Red-carpet stylist', pay:6000, power:3 }] },
};

D.VENUES = [
  { id:'openmic', name:'Open mic night', cap:40, basePrice:0, minFans:0, energy:15, pay:0 },
  { id:'bar', name:'Neighborhood bar', cap:120, basePrice:10, minFans:500, energy:20 },
  { id:'club', name:'Club', cap:450, basePrice:20, minFans:4000, energy:25 },
  { id:'theater', name:'Theater', cap:2500, basePrice:45, minFans:40000, energy:30 },
  { id:'arena', name:'Arena', cap:16000, basePrice:85, minFans:600000, energy:35 },
  { id:'stadium', name:'Stadium', cap:55000, basePrice:120, minFans:4000000, energy:40 },
];

D.FESTIVALS = [
  { name:'Sunvale Weekend', region:'NA', week:16 }, { name:'Dustbowl Fest', region:'NA', week:22 },
  { name:'Coastline Sessions', region:'NA', week:31 }, { name:'Northern Lights Festival', region:'EU', week:25 },
  { name:'Riverside Calling', region:'EU', week:34 }, { name:'Savanna Sound', region:'EU', week:49 },
  { name:'Fiesta del Sol', region:'LA', week:12 }, { name:'Selva Fest', region:'LA', week:44 },
  { name:'Neon Harbor', region:'AS', week:29 }, { name:'Pacific Bloom', region:'AS', week:40 },
];
D.FEST_SLOTS = [
  { id:'opener', name:'Opener', minFame:15, fee:2000, fans:0.6 },
  { id:'mid', name:'Afternoon slot', minFame:30, fee:15000, fans:1 },
  { id:'sub', name:'Sub-headliner', minFame:50, fee:120000, fans:1.5 },
  { id:'head', name:'Headliner', minFame:68, fee:900000, fans:2.2 },
];

D.OUTLETS = ['The Needle','Sound Quarterly','Static Magazine','Beat Bulletin','Chord & Verse','Loud Paper'];
D.PLAYLISTS = [
  { name:'Fresh Finds Friday', tier:1, reach:120000 }, { name:'Bedroom Bangers', tier:1, reach:150000 },
  { name:'New Music Now', tier:2, reach:900000 }, { name:'Hot Rotation', tier:2, reach:1200000 },
  { name:'Today\'s Big Ones', tier:3, reach:4500000 }, { name:'Global Heat', tier:3, reach:5500000 },
];
D.DIRECTORS = [
  { id:'d0', name:'Your friend with a phone', skill:20, fee:0 },
  { id:'d1', name:'Sasha Kim', skill:45, fee:3000 },
  { id:'d2', name:'Diego Ferrer', skill:58, fee:12000 },
  { id:'d3', name:'Noor Haddad', skill:70, fee:40000 },
  { id:'d4', name:'Calloway Brothers', skill:82, fee:120000 },
  { id:'d5', name:'Ines Vautrin', skill:92, fee:350000 },
];
D.CONCEPTS = [
  { id:'city', name:'City at night', bg:'#1a2240', floor:'#2b2f3d', accent:'#ffcc33' },
  { id:'beach', name:'Golden-hour beach', bg:'#ff9a6b', floor:'#e8c58a', accent:'#2ec4b6' },
  { id:'space', name:'Outer space', bg:'#090a1f', floor:'#1d1a3a', accent:'#a77bff' },
  { id:'desert', name:'Desert road', bg:'#f2a65a', floor:'#c8743a', accent:'#5a2e0e' },
  { id:'forest', name:'Misty forest', bg:'#30473b', floor:'#22331f', accent:'#c9f2a0' },
  { id:'studio', name:'White studio', bg:'#e9e9ee', floor:'#d7d7de', accent:'#ff4f79' },
  { id:'party', name:'House party', bg:'#3a1046', floor:'#2a1530', accent:'#ff3fa4' },
];
D.TALKSHOWS = [
  { name:'Late Night with Marty Fogle', minFame:35 }, { name:'The Couch with Dani Reyes', minFame:25 },
  { name:'Morning Brew Live', minFame:20 }, { name:'Hot Seat Podcast', minFame:12 }, { name:'After Hours with Theo Lake', minFame:50 },
];
D.TV_PERF = ['Saturday Night Stage','The Late Show Stage','Morning Brew Live','New Year\'s Countdown Live'];

D.AWARD_SHOWS = {
  main: { id:'main', name:'Golden Record Awards', week:6, nomWeek:47, cats:['Record of the Year','Album of the Year','Song of the Year','Best New Artist','Best Genre Album'] },
  video: { id:'video', name:'Vision Music Video Awards', week:36, nomWeek:32, cats:['Video of the Year','Best Direction','Artist of the Year'] },
  fan: { id:'fan', name:'People\'s Pick Awards', week:46, nomWeek:42, cats:['Favorite Artist','Favorite Song','Favorite Fandom'] },
};

D.BRANDS = [
  { name:'Fizzwave Soda', fit:'wholesome', pay:[20000,400000] }, { name:'Stride Sneakers', fit:'edgy', pay:[30000,800000] },
  { name:'Lumen Phones', fit:'wholesome', pay:[60000,1500000] }, { name:'Nightjar Energy', fit:'edgy', pay:[20000,500000] },
  { name:'Maison Ombre', fit:'mysterious', pay:[80000,2000000] }, { name:'Cloud Nine Cosmetics', fit:'wholesome', pay:[40000,900000] },
  { name:'Riot Grrrl Apparel', fit:'messy', pay:[15000,300000] }, { name:'Blackstone Watches', fit:'mysterious', pay:[100000,2500000] },
  { name:'Crunch Time Chips', fit:'messy', pay:[10000,250000] }, { name:'Velour Fragrance', fit:'mysterious', pay:[50000,1200000] },
];
D.PRODUCT_LINES = [
  { id:'fragrance', name:'Signature fragrance', cost:150000, minFame:45 },
  { id:'sneakers', name:'Sneaker line', cost:300000, minFame:55 },
  { id:'beauty', name:'Beauty brand', cost:500000, minFame:60 },
  { id:'tequila', name:'Drinks brand', cost:800000, minFame:65 },
];

D.HOMES = [
  { id:'h0', name:'Parents\' basement', cost:0, upkeep:0, rest:0, image:-1 },
  { id:'h1', name:'Shared apartment', cost:0, upkeep:220, rest:4, image:0, rent:true },
  { id:'h2', name:'Studio loft', cost:180000, upkeep:400, rest:8, image:1 },
  { id:'h3', name:'Townhouse', cost:650000, upkeep:900, rest:12, image:2 },
  { id:'h4', name:'Hills villa', cost:2400000, upkeep:3000, rest:16, image:4 },
  { id:'h5', name:'Beachfront estate', cost:7500000, upkeep:8000, rest:20, image:6 },
  { id:'h6', name:'Castle in the countryside', cost:18000000, upkeep:15000, rest:24, image:8 },
];
D.CARS = [
  { id:'k1', name:'Used hatchback', cost:4000, upkeep:30, image:0 },
  { id:'k2', name:'Electric sedan', cost:45000, upkeep:80, image:1 },
  { id:'k3', name:'Vintage convertible', cost:120000, upkeep:200, image:2 },
  { id:'k4', name:'Luxury SUV', cost:180000, upkeep:250, image:2 },
  { id:'k5', name:'Italian supercar', cost:420000, upkeep:600, image:4 },
  { id:'k6', name:'Custom tour bus', cost:900000, upkeep:900, image:3, tour:true },
];
D.INVESTMENTS = [
  { id:'savings', name:'High-yield savings', yr:0.035, vol:0 },
  { id:'index', name:'Index fund', yr:0.07, vol:0.16 },
  { id:'crypto', name:'Crypto', yr:0.05, vol:0.7 },
  { id:'restaurant', name:'Restaurant with a friend', yr:0.04, vol:0.4 },
  { id:'startup', name:'Music-tech startup', yr:0.10, vol:0.9 },
];
D.CAUSES = ['Music education in schools','Mental health support','Disaster relief','Climate action','Your hometown food bank','Animal shelters'];

D.MOVIE_GENRES = ['Romantic comedy','Action thriller','Musical biopic','Horror','Indie drama','Animated family film','Sci-fi epic','Coming-of-age story'];
D.MOVIE_STUDIOS = ['Silverline Pictures','Hollow Oak Films','Meridian Studios','Bright Alley','Northlight Entertainment'];
D.MOVIE_WORDS = ['The Last','Midnight','Before the','Summer of','Heart of','City of','After the','Kings of','Girl from','The Long'];
D.MOVIE_WORDS2 = ['Encore','Storm','Harbor','Echoes','Glass','Wolves','Avenue','Silence','Horizon','Fire'];
D.ROLES = [{ id:'cameo', name:'Cameo', weeks:1, mult:0.3 }, { id:'support', name:'Supporting role', weeks:4, mult:0.7 }, { id:'lead', name:'Lead role', weeks:8, mult:1.3 }];

// Wardrobe. slot: top|bottom|shoes|hair|acc. price 0 = owned from the start
D.WARDROBE = [
  { id:'tee', slot:'top', name:'T-shirt', price:0 }, { id:'hoodie', slot:'top', name:'Hoodie', price:0 },
  { id:'tank', slot:'top', name:'Tank top', price:0 }, { id:'jacket', slot:'top', name:'Leather jacket', price:900 },
  { id:'jersey', slot:'top', name:'Oversized jersey', price:400 }, { id:'suit', slot:'top', name:'Tailored suit jacket', price:2500 },
  { id:'crop', slot:'top', name:'Crop top', price:300 }, { id:'gown', slot:'top', name:'Floor-length gown', price:6000 },
  { id:'sequin', slot:'top', name:'Sequin blazer', price:4000 }, { id:'puffer', slot:'top', name:'Puffer coat', price:1500 },
  { id:'fringe', slot:'top', name:'Fringe western shirt', price:1200 }, { id:'corset', slot:'top', name:'Corset top', price:1800 },
  { id:'jeans', slot:'bottom', name:'Jeans', price:0 }, { id:'shorts', slot:'bottom', name:'Shorts', price:0 },
  { id:'skirt', slot:'bottom', name:'Mini skirt', price:0 }, { id:'cargo', slot:'bottom', name:'Cargo pants', price:250 },
  { id:'flares', slot:'bottom', name:'Flared trousers', price:600 }, { id:'leather', slot:'bottom', name:'Leather pants', price:1400 },
  { id:'sneakers', slot:'shoes', name:'Sneakers', price:0 }, { id:'boots', slot:'shoes', name:'Combat boots', price:300 },
  { id:'platforms', slot:'shoes', name:'Platform heels', price:700 }, { id:'cowboy', slot:'shoes', name:'Cowboy boots', price:900 },
  { id:'loafers', slot:'shoes', name:'Loafers', price:500 },
  { id:'short', slot:'hair', name:'Short cut', price:0 }, { id:'buzz', slot:'hair', name:'Buzz cut', price:0 },
  { id:'long', slot:'hair', name:'Long hair', price:0 }, { id:'bob', slot:'hair', name:'Bob', price:0 },
  { id:'curly', slot:'hair', name:'Big curls', price:0 }, { id:'bun', slot:'hair', name:'Top bun', price:0 },
  { id:'spiky', slot:'hair', name:'Spiky', price:150 }, { id:'braids', slot:'hair', name:'Braids', price:250 },
  { id:'ponytail', slot:'hair', name:'High ponytail', price:100 }, { id:'mohawk', slot:'hair', name:'Mohawk', price:300 },
  { id:'none', slot:'acc', name:'Nothing', price:0 }, { id:'shades', slot:'acc', name:'Sunglasses', price:120 },
  { id:'chain', slot:'acc', name:'Gold chain', price:2000 }, { id:'cap', slot:'acc', name:'Baseball cap', price:60 },
  { id:'beanie', slot:'acc', name:'Beanie', price:40 }, { id:'stetson', slot:'acc', name:'Cowboy hat', price:350 },
  { id:'headphones', slot:'acc', name:'Headphones', price:300 }, { id:'crown', slot:'acc', name:'Stage crown', price:8000 },
  { id:'bandana', slot:'acc', name:'Bandana', price:30 },
];
D.SKINS = ['#ffe0c7','#f6c7a1','#e0a979','#c68655','#a0643a','#7a4a2a','#55331d'];
D.HAIR_COLORS = ['#1b1b1f','#4a2f1d','#8a5a2b','#d9b26b','#f2e6c2','#b8352f','#ff7ab8','#5d7bff','#36c28a','#e9e9ee'];
D.CLOTH_COLORS = ['#f4f4f6','#1d1d24','#d6334f','#ff8a3d','#ffd23f','#3ec28f','#2e8bff','#7b4dff','#ff6fb5','#8a6a4f','#c0c4cc','#0f5f5f'];
D.BODIES = [{ id:'slim', name:'Slim', w:0.9 }, { id:'avg', name:'Average', w:1 }, { id:'broad', name:'Broad', w:1.15 }];

D.MERCH = [
  { id:'tee', name:'T-shirt', cost:7, price:30 }, { id:'hoodie', name:'Hoodie', cost:18, price:65 },
  { id:'cap', name:'Cap', cost:6, price:28 }, { id:'poster', name:'Tour poster', cost:2, price:20 },
  { id:'vinyl', name:'Vinyl record', cost:9, price:35 },
];
D.MERCH_PRINTS = ['Your name','Album cover','Your face','Fandom name','Tour dates'];

D.ACHIEVEMENTS = [
  ['first_song','First draft','Write your first song.'], ['first_record','Tape rolling','Record a song.'],
  ['first_release','Out in the world','Release your first single.'], ['first_gig','Stage fright','Play your first gig.'],
  ['fans_1k','A thousand believers','Reach 1,000 fans.'], ['fans_100k','Six figures of fans','Reach 100,000 fans.'],
  ['fans_1m','One in a million','Reach 1,000,000 fans.'], ['fans_10m','Household name','Reach 10,000,000 fans.'],
  ['fans_100m','Global icon','Reach 100,000,000 fans.'], ['chart_any','Charted','Enter any chart.'],
  ['top40','Top 40','Reach the top 40 of any singles chart.'], ['top10','Top 10','Reach the top 10 of any singles chart.'],
  ['no1','Number one','Hit number one on any chart.'], ['no1_all','Clean sweep','Hit number one on the singles chart in all 4 regions.'],
  ['album_no1','Album of the moment','Debut an album at number one.'], ['gold','Going gold','Earn a gold certification.'],
  ['platinum','Platinum','Earn a platinum certification.'], ['diamond','Diamond','Earn a diamond certification.'],
  ['first_ep','Extended play','Release an EP.'], ['first_album','Full length','Release an album.'],
  ['five_albums','Discography','Release five albums.'], ['review_9','Critical darling','Get a review score of 9.0 or higher.'],
  ['signed','Signed','Sign a record deal.'], ['own_label','Boss moves','Start your own record label.'],
  ['masters','Own your work','Own the masters to all your releases.'], ['viral','Gone viral','Have a song trend on Loopr.'],
  ['playlist','Playlisted','Get a song on an editorial playlist.'], ['video','Director\'s cut','Shoot a music video.'],
  ['video_100m','Hundred million views','Get a music video to 100 million views.'], ['tour','On the road','Finish a tour.'],
  ['arena','Arena ready','Sell out an arena show.'], ['stadium','Stadium status','Sell out a stadium show.'],
  ['festival_head','Top of the poster','Headline a festival.'], ['talkshow','Couch time','Appear on a talk show.'],
  ['award_nom','Nominated','Get nominated for an award.'], ['award_win','Winner','Win an award.'],
  ['award_aoty','Album of the Year','Win Album of the Year at the Golden Record Awards.'], ['movie','Silver screen','Act in a movie.'],
  ['movie_hit','Box office hit','Star in a movie that earns over $300 million.'], ['millionaire','Millionaire','Have $1,000,000 in the bank.'],
  ['billionaire','Ten-figure artist','Reach a net worth of $1 billion.'], ['mansion','Dream home','Buy a home worth $2 million or more.'],
  ['brand','Brand ambassador','Sign a brand deal.'], ['feature','Featured','Appear as a featured artist on someone\'s song.'],
  ['collab_real','Big collab','Release a song with a real superstar.'], ['beef_win','Beef season','Win a beef with a rival.'],
  ['charity','Giving back','Donate $100,000 or more to charity.'], ['decade','Ten-year career','Stay active for 10 years.'],
  ['hof','Hall of Famer','Get inducted into the Hall of Fame.'],
];

D.HELP = [
  ['Weeks and energy', 'Each turn is one week. Actions such as writing, recording, gigs and posting cost energy. Press End week when you are done. Ending weeks with almost no energy left hurts your health, and low health leads to burnout and cancelled plans. Rest and a better home help you recover.'],
  ['Skills', 'Songwriting, vocals, production, performance and charisma all go up with practice, classes and doing the work. Songwriting and production matter most for song quality, performance for shows, charisma for interviews, social posts, deals and acting.'],
  ['Writing and recording', 'Write a song by picking a genre, mood, topic and tempo. Its quality comes from your songwriting skill, a co-writer if you hire one, and some luck. Then record it: the studio, the producer and any featured artist decide how good the final recording is. Producers who specialize in the song\'s genre do better. Unreleased songs wait in the vault, where they can leak if they sit too long.'],
  ['Releases', 'Put recorded songs out as a single, EP (3 to 6 songs), album (7 or more), deluxe edition, live album or joint album with another artist. Make a cover, pick a release week, and pay for teasers and pre-saves to build hype. Before release you see a first-week projection. Releasing the same week as a rival splits attention.'],
  ['Charts', 'There are three charts in each of the four regions: Singles, Albums and Streaming. Singles mixes streams and sales, Albums counts album units, Streaming counts streams only. Charts update when you end the week. At the end of each year you also get year-end charts.'],
  ['Fans and hype', 'Fans live in four regions and drive your streams and ticket sales. Hype is how much buzz you have right now; it boosts everything and fades over time. Each region also has a fan mood. Ignoring fans, scandals and flops lower it. Name your fandom to build a fan club that stays loyal.'],
  ['Reviews and news', 'Critics from six outlets review every EP and album, and big singles too. Scores depend on song quality, how well the songs fit together, and your reputation. The news feed reports on you, your rivals and the industry.'],
  ['Social media and Loopr', 'Post on Buzzr to keep fans engaged and build hype. Posts can go viral. Songs, even old ones, can trend on the short-video app Loopr, which sends them back up the charts. You can pay creators to seed a trend.'],
  ['Rivals and collabs', 'Artists remember how you treat them. Ask them to feature on your songs, accept their feature requests, or start joint projects. Some become rivals. You can answer with a diss track, or make peace. A diss track that charts higher than the rival\'s reply wins the beef.'],
  ['Music videos and movies', 'Shoot a video for a released song by choosing a director, concept and budget. Videos earn views, fans and nominations at the Vision Music Video Awards. Once you are famous enough, film studios offer cameos, supporting roles and leads. Shooting takes weeks. Box office results add fans, and you can put a song on the soundtrack.'],
  ['Labels and contracts', 'You start independent and keep most of your money, but labels can push your music much further. When a label makes an offer, you can negotiate the advance, royalty rate, number of albums owed and who owns the masters. The label keeps your royalties until the advance is paid back. Labels can drop you after flops. When a contract ends you can re-record albums whose masters the label owns, or buy the masters back.'],
  ['Your own label', 'Once you are famous and have money, you can start your own label, sign new artists, pay for their releases and record with them. Your label earns a share of their income.'],
  ['Team', 'Hire a manager, publicist, booking agent and stylist. Each has three levels. Better team members cost more each week, and the manager and agent also take a share of what they help you earn.'],
  ['Gigs, tours and festivals', 'Start with open mics and bars. Bigger venues unlock as your fans grow in that region. Plan tours city by city with a venue size, ticket price, opening act and stage budget, and build a setlist. Each show night plays out on the 3D stage. Festivals book you into slots from opener up to headliner, depending on your fame.'],
  ['Merch', 'Design shirts, hoodies, caps, posters and vinyl. Merch sells online every week and sells more at shows.'],
  ['Awards', 'There are three award shows a year: the Golden Record Awards (week 6, for the year before), the Vision Music Video Awards (week 36) and the fan-voted People\'s Pick Awards (week 46). Nominations come out a few weeks earlier. Watch the ceremony category by category, and perform there when you are invited.'],
  ['Money, homes and life', 'Money comes from streams, sales, shows, merch, deals and movies. Weekly costs include rent or upkeep, cars, your team and loan payments. Taxes are due at the end of each year. Buy homes and cars, invest, and give to charity.'],
  ['Image', 'Your choices push your public image toward wholesome, edgy, mysterious or messy. Brands pay more when they fit your image, and the press reacts to it.'],
  ['3D look and eras', 'Your artist is a 3D character. Buy clothes in the wardrobe and save a different look for each album era. That look appears on stage, in videos, on covers and in photos.'],
  ['Legacy', 'Your legacy score grows with hits, awards, plaques and long-term success. After at least 10 years with a high enough score, you are inducted into the Hall of Fame. You can retire at any time to see your final career summary.'],
  ['Real artists', 'Real-world artists appear on charts, as rivals, collaborators and award nominees. Their song titles, chart runs, feuds and storylines in this game are invented and do not reflect real events.'],
];

root.LND = D;
})(typeof window !== 'undefined' ? window : globalThis);
