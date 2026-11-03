// World data: characters, venues, labels, word banks.
const CHARS={
 rayna:{n:'Rayna Jaymes',short:'Rayna',role:'The Queen of Country',bio:'Twenty years of hits, two daughters, one complicated past. The industry thinks her best days are behind her.',look:{g:'f',skin:'#f1c9a9',hair:'#7a3a1e',style:'longwave',eyes:'#6a4426',lips:'#b2404c',outfit:'#1f2b47',top:'jacket',earrings:1,necklace:1,bg:'#5a2a3a'},singer:1,adult:1},
 juliette:{n:'Juliette Barnes',short:'Juliette',role:'Pop-country superstar',bio:'Young, fearless and selling out arenas. The headlines follow her everywhere, and so does her mother.',look:{g:'f',skin:'#f6d6bc',hair:'#f0dc9c',style:'longstraight',eyes:'#4a7fae',lips:'#d65b6a',outfit:'#272727',top:'leather',earrings:1,bg:'#3a2850'},singer:1,adult:1},
 deacon:{n:'Deacon Claybourne',short:'Deacon',role:'Legendary guitarist',bio:'The best guitar player in town and the man who wrote half of Rayna\'s early hits. Sober a long time. Most days.',look:{g:'m',skin:'#e0b18c',hair:'#6b4a2b',style:'shaggy',eyes:'#5b7080',outfit:'#4a3a2e',top:'flannel',beard:2,age:1,bg:'#3a3020'},singer:1,adult:1,writer:1},
 scarlett:{n:'Scarlett O\'Connor',short:'Scarlett',role:'Poet and waitress at the Bluebird',bio:'Came to town for a boy and writes poems in a notebook she never shows anyone. Her uncle is Deacon.',look:{g:'f',skin:'#f8dccb',hair:'#e9c66f',style:'curly',eyes:'#4f86a8',lips:'#d77a7a',outfit:'#9bbbd9',top:'dress',freckles:1,bg:'#2c4058'},singer:1,adult:1,writer:1},
 gunnar:{n:'Gunnar Scott',short:'Gunnar',role:'Songwriter',bio:'Works construction by day and writes heartbreak by night. Has a notebook full of songs and a brother full of trouble.',look:{g:'m',skin:'#e9bf9c',hair:'#33251a',style:'short',eyes:'#4a3626',outfit:'#59606b',top:'henley',beard:1,bg:'#28384a'},singer:1,adult:1,writer:1},
 avery:{n:'Avery Barkley',short:'Avery',role:'Rocker turned country',bio:'Talented, hungry and sure he is about to be famous. He might be right, if his ego doesn\'t get there first.',look:{g:'m',skin:'#e6bb96',hair:'#2a1d15',style:'messy',eyes:'#3e2c20',outfit:'#222',top:'leather',beard:1,bg:'#302830'},singer:1,adult:1,writer:1},
 will:{n:'Will Lexington',short:'Will',role:'Rising cowboy crooner',bio:'A voice like warm whiskey and the face of a country poster boy. He is carrying a secret the industry is not ready for.',look:{g:'m',skin:'#e2b088',hair:'#4a3220',style:'short',eyes:'#4a6a8a',outfit:'#6a4b38',top:'shirt',hat:'#d1b789',band:'#5a3a24',beard:1,bg:'#40301e'},singer:1,adult:1},
 teddy:{n:'Teddy Conrad',short:'Teddy',role:'Rayna\'s husband, politician',bio:'A businessman with big ambitions and bigger debts. Lamar wants him in the mayor\'s office.',look:{g:'m',skin:'#ebc4a2',hair:'#6b6156',style:'slick',eyes:'#4a5a6a',outfit:'#2a3040',top:'suit',tie:'#20406a',age:1,bg:'#2a3040'},adult:1},
 lamar:{n:'Lamar Wyatt',short:'Lamar',role:'Rayna\'s father, power broker',bio:'The most powerful man in Nashville, and he never approved of his daughter\'s singing.',look:{g:'m',skin:'#ecd0b8',hair:'#e8e8e8',style:'slick',eyes:'#5a6a7a',outfit:'#1e2230',top:'suit',tie:'#6a1a1a',age:2,bg:'#30302a'},adult:1},
 maddie:{n:'Maddie Conrad',short:'Maddie',role:'Rayna\'s elder daughter',bio:'Sings like her mother, plays like her father, and is starting to wonder which father that is.',look:{g:'f',skin:'#f1c9a9',hair:'#4a2a1a',style:'longstraight',eyes:'#6a4426',outfit:'#6a4a7a',top:'tee',bg:'#3a3058'},teen:1},
 daphne:{n:'Daphne Conrad',short:'Daphne',role:'Rayna\'s younger daughter',bio:'The baby of the family, a little firecracker with a big voice of her own.',look:{g:'f',skin:'#f3cdb0',hair:'#b9783c',style:'ponytail',eyes:'#5a7040',outfit:'#d0708a',top:'tee',freckles:1,bg:'#4a3048'},teen:1},
 jeff:{n:'Jeff Fordham',short:'Jeff',role:'Label boss at Edgehill',bio:'All business, all the time. He signs stars, drops legends and doesn\'t lose sleep over either.',look:{g:'m',skin:'#e8c09e',hair:'#2b2b2b',style:'slick',eyes:'#3a3a3a',outfit:'#151515',top:'suit',tie:'#151515',bg:'#1e2228'},adult:1},
 glenn:{n:'Glenn Goodman',short:'Glenn',role:'Veteran manager',bio:'Kind, patient and loyal to a fault. He has seen every kind of meltdown and stayed for all of them.',look:{g:'m',skin:'#ebc8aa',hair:'#d6d6d6',style:'bald',eyes:'#5a4a3a',outfit:'#3a3a48',top:'suit',tie:'#7a5a2a',glasses:1,age:2,bg:'#2a2e3a'},adult:1},
 bucky:{n:'Bucky Dawes',short:'Bucky',role:'Manager',bio:'Rayna\'s manager for years. Calm in a crisis, a phone permanently glued to his ear.',look:{g:'m',skin:'#e3b38b',hair:'#7a6a5a',style:'buzz',eyes:'#4a3a2a',outfit:'#4a5262',top:'shirt',beard:1,glasses:1,age:1,bg:'#2e3440'},adult:1},
 luke:{n:'Luke Wheeler',short:'Luke',role:'Country\'s biggest male star',bio:'Trucks, tailgates and a stadium-sized grin. He sells more tickets than anybody, and knows it.',look:{g:'m',skin:'#e6b48c',hair:'#7a5638',style:'short',eyes:'#4a6a8a',outfit:'#3b5a85',top:'denim',hat:'#1d1d1d',band:'#8a6a3a',beard:1,bg:'#2a3a4a'},singer:1,adult:1},
 layla:{n:'Layla Grant',short:'Layla',role:'Reality-show runner-up',bio:'She came second on a TV talent show and has been trying to come first ever since.',look:{g:'f',skin:'#f4d0b4',hair:'#ead08a',style:'longwave',eyes:'#5a8a6a',lips:'#e07090',outfit:'#d8709a',top:'dress',earrings:1,bg:'#4a2840'},singer:1,adult:1},
 zoey:{n:'Zoey Dalton',short:'Zoey',role:'Singer, Scarlett\'s best friend',bio:'Moved to town to be a backup singer and wants to be more. Fiercely loyal until she isn\'t.',look:{g:'f',skin:'#a8724f',hair:'#1e1410',style:'curly',eyes:'#2a1a10',lips:'#9a4a4a',outfit:'#c25b3f',top:'blouse',earrings:1,bg:'#40281e'},singer:1,adult:1},
 jolene:{n:'Jolene Barnes',short:'Jolene',role:'Juliette\'s mother',bio:'Charming when she is sober and devastating when she isn\'t. She always seems to turn up at the worst time.',look:{g:'f',skin:'#efcdb2',hair:'#d8bc7c',style:'messy',eyes:'#4a7fae',lips:'#a8606a',outfit:'#6a5a6a',top:'vneck',age:2,bg:'#3a3038'},adult:1},
 emily:{n:'Emily',short:'Emily',role:'Personal assistant',bio:'Organised, discreet and the only reason some stars make it to the stage on time.',look:{g:'f',skin:'#f0caa8',hair:'#2a1a12',style:'bob',eyes:'#3a2a1a',outfit:'#3a3a56',top:'blouse',bg:'#2a2a40'},adult:1},
 liam:{n:'Liam McGuinnis',short:'Liam',role:'Indie producer',bio:'Moody, brilliant and allergic to radio formulas. He will make you a great record if you let him.',look:{g:'m',skin:'#e8c4a6',hair:'#3b2a20',style:'messy',eyes:'#4a6a5a',outfit:'#1c1c1c',top:'tee',beard:2,bg:'#202a24'},adult:1},
 tandy:{n:'Tandy Wyatt',short:'Tandy',role:'Rayna\'s sister',bio:'Runs her father\'s business affairs and keeps everybody\'s secrets. Some of them.',look:{g:'f',skin:'#f0c8a6',hair:'#5a2e18',style:'bob',eyes:'#5a3a24',lips:'#a8404c',outfit:'#5a2a3a',top:'jacket',earrings:1,bg:'#3a2a30'},adult:1},
 watty:{n:'Watty White',short:'Watty',role:'Legendary producer',bio:'He produced records you grew up on. These days he only works with people he believes in.',look:{g:'m',skin:'#ecc8a8',hair:'#e0e0e0',style:'short',eyes:'#4a5a6a',outfit:'#6a5a46',top:'shirt',hat:'#4a3a2a',beard:2,age:2,bg:'#3a3426'},adult:1},
 kevin:{n:'Kevin Bicks',short:'Kevin',role:'Songwriter',bio:'A sharp, warm songwriter who doesn\'t play the industry\'s games.',look:{g:'m',skin:'#efcfb4',hair:'#a37a4a',style:'short',eyes:'#4a6a8a',outfit:'#7a8a6a',top:'henley',bg:'#2e3a2e'},adult:1,writer:1},
 sadie:{n:'Sadie Stone',short:'Sadie',role:'Country star with a past',bio:'Big hits, a big heart and an ex-husband she can\'t seem to escape.',look:{g:'f',skin:'#ecc4a2',hair:'#2a1a10',style:'longwave',eyes:'#4a3020',lips:'#b04a52',outfit:'#7a2a2a',top:'vneck',earrings:1,bg:'#3a2020'},singer:1,adult:1},
 peggy:{n:'Peggy Kenter',short:'Peggy',role:'Teddy\'s second wife',bio:'Sweet-voiced, sharp-eyed and devoted to Teddy, whatever it costs her.',look:{g:'f',skin:'#f0caa8',hair:'#c99a5a',style:'bob',eyes:'#5a6a4a',lips:'#c06a70',outfit:'#8a5a7a',top:'blouse',necklace:1,bg:'#3a2a38'},adult:1},
 jessie:{n:'Jessie Caine',short:'Jessie',role:'Songwriter and single mom',bio:'Talented, guarded and fighting her ex for custody of her son. Deacon can\'t stop looking at her.',look:{g:'f',skin:'#ecc4a2',hair:'#3a2216',style:'longstraight',eyes:'#4a3a2a',lips:'#b05a5a',outfit:'#4a5a3a',top:'flannel',bg:'#2e3426'},adult:1,singer:1,writer:1},
 cash:{n:'Cash Gray',short:'Cash',role:'Country star with an agenda',bio:'Charming in public, controlling in private. She collects broken people.',look:{g:'f',skin:'#f2cdb0',hair:'#a8582a',style:'longwave',eyes:'#4a6a5a',lips:'#b2303e',outfit:'#1a1a1a',top:'leather',earrings:1,bg:'#3a1a1e'},adult:1,singer:1},
 brent:{n:'Brent McKinney',short:'Brent',role:'Music Row regular',bio:'A familiar face around Music Row in the early days.',look:{g:'m',skin:'#d9a37c',hair:'#6a4a2a',style:'messy',eyes:'#4a5a3a',outfit:'#3a5a6a',top:'shirt',beard:1,bg:'#28343a'},adult:1,singer:1},
 beverly:{n:'Beverly O\'Connor',short:'Beverly',role:'Deacon\'s sister, Scarlett\'s mother',bio:'A singer who never got her shot. Proud, prickly and jealous of the people she loves.',look:{g:'f',skin:'#efcdb2',hair:'#c8a060',style:'bob',eyes:'#4f86a8',lips:'#b06070',outfit:'#5a6a8a',top:'vneck',age:1,bg:'#2c3a4a'},adult:1,singer:1,fam:['deacon','scarlett']},
 mama:{n:'Mama',short:'Mama',role:'Your mother, back home',bio:'Calls every Sunday after church. Keeps every newspaper clipping in a shoebox. Worries.',look:{g:'f',skin:'#efc9a8',hair:'#8a6a4a',style:'bob',eyes:'#5a4030',outfit:'#7a8ab0',top:'blouse',age:2,glasses:1,bg:'#3a3a48'},adult:1,fam:['me','gunnar','avery','will']},
 daddy:{n:'Daddy',short:'Daddy',role:'Your father, back home',bio:'A man of few words who taught you your first three chords on a porch.',look:{g:'m',skin:'#dcaa84',hair:'#9a9a9a',style:'short',eyes:'#4a4a3a',outfit:'#5a4a3a',top:'flannel',hat:'#6a5a3a',beard:1,age:2,bg:'#3a3426'},adult:1,fam:['me','avery','will']},
 zach:{n:'Zach Welles',short:'Zach',role:'Tech billionaire and investor',bio:'Made a fortune in software and wants to buy a piece of Music Row. Says he loves country music. Owns one vinyl record.',look:{g:'m',skin:'#ecc6a4',hair:'#4a3020',style:'short',eyes:'#4a6a8a',outfit:'#2a2a2a',top:'tee',bg:'#22303a'},adult:1},
 marcus:{n:'Ronnie Pike',short:'Ronnie',role:'Tabloid reporter',bio:'Writes for Music Row Insider. Friendly smile, notebook always open.',look:{g:'m',skin:'#8a5a3c',hair:'#151010',style:'buzz',eyes:'#2a1a10',outfit:'#4a4a4a',top:'jacket',glasses:1,bg:'#2a2a2a'},adult:1}
};
// Family/no-romance pairs from each legend's point of view
const FAMILY={rayna:['maddie','daphne','lamar','tandy'],juliette:['jolene'],deacon:['scarlett','maddie'],scarlett:['deacon']};

const LEGENDS={
 rayna:{start:{fans:2400000,money:1800000,vocals:88,writing:74,guitar:55,stage:90,rep:72,cred:80,age:40,label:'edgehill',manager:'bucky',house:'mansion',genre:'Classic country'},
  hook:'The Queen of Country is losing her crown. Sales are down, Edgehill wants her to open for a 22-year-old, and the men in her life all want something.',
  rel:{deacon:[55,60,'Old flame'],teddy:[35,40,'Husband'],maddie:[80,0,'Daughter'],daphne:[85,0,'Daughter'],lamar:[-15,0,'Father'],tandy:[70,0,'Sister'],juliette:[-35,0,'Rival'],bucky:[80,0,'Manager'],jeff:[-20,0,''],luke:[10,0,''],glenn:[30,0,''],scarlett:[20,0,''],liam:[10,0,'']},
  partner:'teddy',married:1,diff:'Hard: relevance fades every week.'},
 juliette:{start:{fans:3200000,money:2500000,vocals:76,writing:58,guitar:40,stage:86,rep:55,cred:42,age:22,label:'edgehill',manager:'glenn',house:'mansion',genre:'Pop country'},
  hook:'Arenas, magazine covers and a mother who keeps showing up high. Everyone wants a piece of Juliette Barnes, and the critics want her gone.',
  rel:{glenn:[75,0,'Manager'],jolene:[5,0,'Mother'],rayna:[-30,0,'Rival'],deacon:[20,0,''],jeff:[10,0,'Label boss'],avery:[0,0,''],emily:[60,0,'Assistant'],luke:[10,0,''],layla:[-20,0,'Rival']},
  diff:'Medium: big money, big scandals.'},
 deacon:{start:{fans:40000,money:60000,vocals:72,writing:84,guitar:96,stage:70,rep:62,cred:88,age:44,addict:{sub:'alcohol',dep:22,sober:600},genre:'Americana'},
  hook:'The greatest guitar player in Nashville has spent his life in other people\'s spotlights. Twelve years sober. The bottle is never far away.',
  rel:{rayna:[55,60,'Old flame'],scarlett:[85,0,'Niece'],gunnar:[35,0,''],juliette:[15,0,''],teddy:[-35,0,'Rival'],maddie:[30,0,''],luke:[0,0,''],bucky:[30,0,'']},
  diff:'Medium: addiction is always one bad week away.'},
 scarlett:{start:{fans:0,money:1200,vocals:66,writing:72,guitar:40,stage:30,rep:60,cred:50,age:23,traits:['stagefright'],genre:'Folk country'},
  hook:'You wait tables at the Bluebird Cafe and write poems you never show anyone. Tonight a boy named Gunnar wants to sing one of them.',
  rel:{deacon:[85,0,'Uncle'],avery:[45,60,'Boyfriend'],gunnar:[30,20,''],rayna:[5,0,''],juliette:[0,0,''],watty:[0,0,''],zoey:[60,0,'Best friend']},
  partner:'avery',diff:'Medium: crippling stage fright.'},
 gunnar:{start:{fans:0,money:900,vocals:68,writing:76,guitar:62,stage:44,rep:60,cred:50,age:27,genre:'Country'},
  hook:'Construction by day, songs by night. Your brother just got out of prison and your notebook is full of songs nobody has heard.',
  rel:{scarlett:[35,25,''],will:[40,0,'Roommate'],avery:[-10,0,''],deacon:[35,0,''],zoey:[25,15,''],kevin:[30,0,'']},
  diff:'Medium: start from nothing.'},
 avery:{start:{fans:800,money:400,vocals:70,writing:66,guitar:80,stage:58,rep:52,cred:46,age:26,genre:'Country rock'},
  hook:'You fronted a rock band, played the Bluebird and dated the sweetest girl in Nashville. Now a label man says you can be a star, if you leave her behind.',
  rel:{scarlett:[45,55,'Girlfriend'],juliette:[0,0,''],gunnar:[-10,0,''],jeff:[5,0,''],liam:[10,0,'']},
  partner:'scarlett',diff:'Hard: ego and ambition.'},
 will:{start:{fans:3000,money:1500,vocals:84,writing:50,guitar:55,stage:66,rep:64,cred:44,age:25,traits:['secret'],genre:'Country'},
  hook:'You have the voice and the look of a country star. You also have a secret, and the industry is not kind to men like you.',
  rel:{gunnar:[40,0,'Roommate'],layla:[25,0,''],kevin:[10,0,''],jeff:[0,0,''],luke:[5,0,'']},
  diff:'Hard: living a double life.'}
};

const BACKGROUNDS=[
 {id:'smalltown',n:'Small-town dreamer',d:'You stepped off a Greyhound with a guitar and $600. Songwriting +6, Money $600.',fx:{money:600,writing:6}},
 {id:'waitress',n:'Bluebird server',d:'You work shifts at the Bluebird and know every songwriter in town. Starts with Scarlett as a friend.',fx:{money:900,cred:6},rel:{scarlett:[35,0,'Coworker'],gunnar:[15,0,'']}},
 {id:'church',n:'Church choir kid',d:'You grew up singing gospel in a small Baptist church. Vocals +10.',fx:{money:500,vocals:10,rep:6}},
 {id:'rich',n:'Trust-fund kid',d:'Daddy\'s money got you here. Money $25,000, but people doubt you. Credibility -10.',fx:{money:25000,cred:-10}},
 {id:'honkytonk',n:'Honky-tonk lifer',d:'Four sets a night on Lower Broadway for years. Stage +10, Guitar +6.',fx:{money:700,stage:10,guitar:6}},
 {id:'reality',n:'Talent-show runner-up',d:'You came third on a TV talent show. 25,000 fans, but critics sneer.',fx:{money:3000,fans:25000,cred:-15,stage:6}}
];
const GENRES=['Country','Pop country','Country rock','Americana','Folk country','Bluegrass','Outlaw country'];

const VENUES=[
 {id:'busk',n:'Busk on Lower Broadway',cap:0,fame:0,price:0,energy:1,desc:'Tips in your open guitar case.'},
 {id:'honky',n:'Four-hour set at a Broadway honky-tonk',cap:150,fame:0,price:0,energy:1,flat:160,desc:'Tourists, bachelorette parties and a tip jar.'},
 {id:'bluebird',n:'The Bluebird Cafe',cap:90,fame:0,price:0,energy:1,flat:40,desc:'The listening room. Shut up and listen. Industry people drop in.',bluebird:1},
 {id:'spur',n:'The Rusty Spur',cap:400,fame:22,price:18,energy:1,desc:'A sticky-floored club where careers begin.'},
 {id:'exit',n:'The Basement East',cap:900,fame:36,price:25,energy:1,desc:'The cool room. Critics and tastemakers.'},
 {id:'ryman',n:'Ryman Auditorium',cap:2362,fame:55,price:58,energy:1,desc:'The Mother Church of Country Music.',prestige:1},
 {id:'opry',n:'Grand Ole Opry',cap:4400,fame:0,price:0,energy:1,flat:600,desc:'Two songs on the most famous stage in country. By invitation only.',opry:1},
 {id:'arena',n:'Bridgestone Arena',cap:19000,fame:76,price:89,energy:1,desc:'Downtown Nashville, nineteen thousand seats.'},
 {id:'stadium',n:'LP Field stadium show',cap:62000,fame:90,price:112,energy:1,desc:'A hometown stadium. Only the biggest stars.'}
];
const TOURS=[
 {id:'club',n:'Southern club run',fame:20,weeks:4,cap:400,price:20,cost:2500,desc:'Vans, motels and 400-capacity rooms.'},
 {id:'theater',n:'Theater tour',fame:45,weeks:6,cap:2500,price:48,cost:40000,desc:'Proper venues, a bus and a crew.'},
 {id:'amph',n:'Summer amphitheater tour',fame:62,weeks:8,cap:12000,price:62,cost:250000,desc:'Sheds and lawns under the stars.'},
 {id:'arena',n:'Headlining arena tour',fame:76,weeks:10,cap:16000,price:85,cost:600000,desc:'Pyro, a catwalk and five trucks.'},
 {id:'stadium',n:'Stadium tour',fame:90,weeks:12,cap:50000,price:105,cost:2400000,desc:'The biggest show in country music.'}
];
const LABELS={
 edgehill:{n:'Edgehill Republic',boss:'jeff',push:1.3,royalty:.16,desc:'A major. Huge radio push, but they own your masters and your image.'},
 highway65:{n:'Highway 65',boss:'rayna',push:1.08,royalty:.42,desc:'Rayna Jaymes\' artist-first label. Fair deals, smaller budget.'},
 bluegrass:{n:'Dirt Road Records',boss:'watty',push:.9,royalty:.3,desc:'A tiny indie that cares about songs over singles.'},
 own:{n:'Your own label',boss:null,push:1.0,royalty:.62,desc:'You own everything. You also pay for everything.'},
 indie:{n:'Independent',boss:null,push:.55,royalty:.8,desc:'No label. No push. No one to answer to.'}
};
const HOUSES=[
 {id:'couch',n:'A friend\'s couch',rent:0,mood:-4,cost:0},
 {id:'apt',n:'East Nashville apartment',rent:260,mood:0,cost:0},
 {id:'house',n:'Bungalow in 12 South',rent:900,mood:3,cost:0},
 {id:'farm',n:'Farmhouse in Franklin',rent:0,mood:5,cost:850000,upkeep:1200},
 {id:'mansion',n:'Belle Meade mansion',rent:0,mood:6,cost:4200000,upkeep:6000}
];
const STAFF=[
 {id:'manager',n:'Manager',wk:0,d:'Takes 15% of gig and deal money. Better gig pay, more offers.'},
 {id:'publicist',n:'Publicist',wk:1500,d:'Scandals cool down twice as fast.'},
 {id:'band',n:'Touring band',wk:2200,d:'Live shows score higher.'},
 {id:'assistant',n:'Assistant',wk:700,d:'+15 energy every week.'},
 {id:'coach',n:'Vocal coach',wk:500,d:'Vocals improve a little every week.'}
];
const NPC_ART=[
 ['Rayna Jaymes','rayna',82],['Juliette Barnes','juliette',92],['Luke Wheeler','luke',96],['Layla Grant','layla',60],['Will Lexington','will',58],['Sadie Stone','sadie',72],
 ['Cody Lane',null,70],['The Harlan Brothers',null,74],['Marissa Gale',null,66],['Tucker Boone',null,80],['Kenna Rae',null,64],['Hollis Creek',null,62],['Jolie Mae',null,58],['Boone County Line',null,76],['Trace Holloway',null,84],['Sierra Vance',null,68],['Wes Calloway',null,72],['The Tin Roof Girls',null,60]
];
const T_A=['Midnight','Gravel','Whiskey','Paper','Neon','Broken','Silver','Backroad','Honey','Ghost','Wildfire','Tennessee','Porchlight','Rusty','Sunday','Highway','Cotton','Little','Lonesome','Golden','Cheap','Borrowed','Last','Barefoot','Stained-Glass','Muddy','Faded'];
const T_N=['Heart','Hallelujah','Kisses','Rain','Promises','Wings','Bible','Tailgate','Radio','Jukebox','Moon','Rodeo','Lullaby','Wedding Ring','Prayers','Pickup','Diner','Gospel','Daydream','River','Roses','Town','Goodbye','Saints','Mistakes','Bonfire'];
const T_P=['If I Didn\'t Know {X}','Nobody Calls It {X}','{X} on a Saturday','Somewhere Past {X}','You Left {X} Running','Ain\'t No {X} Like Home','Back Before the {X}','Dancing in the {X}','Burn the {X} Down','Every {X} I Owe You','Long Way from {X}','Hold On to {X}'];
const T_X=['Better','Tulsa','the Truth','Dawn','Memphis','the Fire','Midnight','Forever','Sunday','the Light','Tomorrow','Lubbock','Heaven'];
const THEMES={
 heartbreak:{n:'Heartbreak',lines:['I kept your coffee cup, I can\'t wash it clean','The porch light\'s still on for a car that won\'t come','You took the dog, the truck and every song I knew','Funny how a house gets bigger when it\'s just one','I hear your name in every jukebox in this town','My heart\'s a motel room you only rented for the night']},
 love:{n:'Love',lines:['You\'re the slow song at the end of a long night','I\'d trade every star for the freckles on your face','We were two kids on a tailgate, counting forever','Hold me like the summer holds the heat','Your hand fits mine like a key in a lock','Even the radio sounds better with you']},
 whiskey:{n:'Whiskey and regret',lines:['The bottle never asks me where I\'ve been','Last call came and I was still the first to stay','I drowned my sorrows but they learned to swim','Amber in a glass, the colour of your eyes','Every bar stool knows my name but you','I made peace with the devil one shot at a time']},
 hometown:{n:'Hometown',lines:['One stoplight and a water tower with our names','Mama\'s kitchen smells like Sunday every day','The Friday lights still burn behind the high school','Dirt roads know the way when I forget','Small town, big sky, nobody ever leaves','I left for the city but the creek never left me']},
 faith:{n:'Faith',lines:['Lord, I\'ve been running but you\'ve been running faster','Stained glass light on a sinner like me','Grace came walking up my gravel drive','I found my prayers at the bottom of a hymnal','Even the river bends toward the sea','Hallelujah from a broken-down choir']},
 road:{n:'Freedom and the road',lines:['Eighteen wheels and a heart that won\'t sit still','The highway hums a song only I can hear','Gas station roses and a map we never fold','Chasing that sunset clear to California','Windows down, the whole world in the rear-view','Born to run but I keep coming home']},
 revenge:{n:'Revenge',lines:['I keyed your name into the hood of your pride','Hope she likes the leftovers of a liar','I burned your letters and roasted marshmallows','You\'ll hear my voice on every station you change','Karma\'s got your number and she\'s calling tonight','I\'m the best thing you\'ll ever regret']},
 family:{n:'Family',lines:['Daddy\'s old guitar still knows his songs','My little girl sings louder than the radio','We don\'t talk much but we always say grace','Mama never said it but I know she\'s proud','Two kids, one mortgage and a love that held','Blood runs thicker than the Cumberland']},
 redemption:{n:'Redemption',lines:['I\'m not who I was, but I\'m not done yet','Picked myself up off a barroom floor','Every scar is a story that I lived to tell','There\'s a light on the other side of the bottle','I came back from the ashes with a song','Sorry\'s just a word until you live it']}
};
const RIVAL_LINES=['Some people need autotune to find the right key.','Real country doesn\'t come from a reality show.','Cute song. Shame about the lyrics.','I don\'t do feuds. I do sold-out shows.'];
const FAN_HANDLES=['@honkytonkhannah','@boots_and_biscuits','@cmtgirl92','@nashvillenights','@ryman_regular','@twangfan','@whiskeyriver_kate','@dirtroaddan','@bluebirdbelle','@musicrowmolly','@TNtrucker','@backroadbaby','@countrycrush','@banjo_brad'];
