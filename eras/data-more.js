/* The Eras Life: content for what-if branches, the team, the fan community, the press, creative
   tools, the living music world, legacy projects and the next generation. Everything here is
   invented and clearly labelled; none of it changes the real event track. */
(function () {
const ER = window.ER;

/* What-if branches: choosing against history on these cards opens a short invented side story. */
ER.WHATIFS = {
 leaverca:{ t:'What if she stayed at RCA?', steps:[
   { t:'Waiting', x:'RCA says the album will come "when the timing is right." Months pass.', ch:[{ l:'Keep writing and wait', fx:{ write:3, energy:-4 }, r:'The notebook fills up.' }, { l:'Push for a single', fx:{ clout:2, team:-3 }, r:'The label promises "soon."' }] },
   { t:'A meeting upstairs', x:'An executive suggests a more conventional pop sound.', ch:[{ l:'Hold your ground', fx:{ rep:2, clout:-2 }, r:'The room goes cold.' }, { l:'Try it their way', fx:{ fans:1, write:-1 }, r:'The demos sound like someone else.' }] },
   { t:'The door opens again', x:'Scott Borchetta is still interested.', ch:[{ l:'Walk away now', fx:{ clout:3 }, r:'The real timeline picks up from here.' }] } ], end:{ write:2 } },
 bigmachine:{ t:'What if she held out for her masters?', steps:[
   { t:'The negotiation drags', x:'The label refuses to give an unknown teenager her masters. Talks stall.', ch:[{ l:'Keep pushing', fx:{ own:3, clout:-3 }, r:'Weeks go by.' }, { l:'Accept a compromise', fx:{ own:1 }, r:'A small clause in your favour.' }] },
   { t:'A smaller label calls', x:'An indie label offers ownership but almost no radio reach.', ch:[{ l:'Stay with Big Machine', fx:{ clout:2 }, r:'The real deal goes ahead.' }] } ], end:{ own:2 } },
 republic:{ t:'What if she went fully independent in 2018?', steps:[
   { t:'Doing it yourself', x:'No label means hiring your own radio team, distributors and marketers.', ch:[{ l:'Build a big team', fx:{ money:-3000000, clout:3 }, r:'Expensive, but it is all yours.' }, { l:'Keep it lean', fx:{ own:3, clout:-2 }, r:'Lean and nimble.' }] },
   { t:'The first independent single', x:'Radio programmers are not sure what to do with an indie release this big.', ch:[{ l:'Go straight to fans online', fx:{ fans:2, hype:4 }, r:'Streaming carries it.' }, { l:'Partner with a distributor', fx:{ money:-500000, clout:2 }, r:'Radio comes around.' }] },
   { t:'Back on course', x:'The real story continues, with everything you learned.', ch:[{ l:'Continue', fx:{}, r:'Back to the real timeline.' }] } ], end:{ own:4 } },
 retreat:{ t:'What if she never disappeared?', steps:[
   { t:'Every interview, the same question', x:'Every sit-down turns into a conversation about the feud.', ch:[{ l:'Answer it once, fully', fx:{ heat:8, rep:2 }, r:'It does not end the questions.' }, { l:'Refuse to discuss it', fx:{ heat:4, rep:-2 }, r:'"Evasive," they write.' }] },
   { t:'Burnout', x:'You have not stopped working in two years.', ch:[{ l:'Take a month off anyway', fx:{ energy:20 }, r:'It helps.' }, { l:'Push through', fx:{ energy:-15, write:-2 }, r:'The songs feel tired.' }] } ], end:{ heat:-5 } },
 mastersbuy:{ t:'What if she never bought back the masters?', steps:[
   { t:'Re-recording the rest', x:'Reputation and the debut still need Taylor\'s Versions.', ch:[{ l:'Book studio time', fx:{ energy:-8, own:2 }, r:'The vocal booth is home again.' }, { l:'Pause re-recording', fx:{ energy:6 }, r:'The fans wait.' }] },
   { t:'An offer', x:'The owners call again with a new price.', ch:[{ l:'Listen', fx:{}, r:'The real timeline catches up.' }] } ], end:{ own:-5 } },
 b_father:{ t:'What if she kept her father as manager?', steps:[
   { t:'Family business', x:'Every career decision now comes home to the dinner table.', ch:[{ l:'Set clear boundaries', fx:{ team:3 }, r:'It works, for a while.' }, { l:'Let it blur', fx:{ team:-4 }, r:'Holidays get tense.' }] },
   { t:'A crossroads', x:'Your own company could still be built.', ch:[{ l:'Start it anyway', fx:{ own:4 }, r:'Back to the real timeline.' }] } ], end:{ own:2 } },
 g_dropped:{ t:'What if she gave up after Def Jam?', steps:[
   { t:'A day job', x:'You wait tables and play piano at a hotel bar three nights a week.', ch:[{ l:'Keep writing at night', fx:{ write:4 }, r:'The songs get darker and better.' }, { l:'Stop for a while', fx:{ energy:10, fans:-2 }, r:'The quiet is strange.' }] },
   { t:'A call from an old friend', x:'Someone at Interscope heard your old demo.', ch:[{ l:'Take the meeting', fx:{ clout:3 }, r:'Back to the real timeline.' }] } ], end:{ write:2 } }
};

/* The team: invented people, never real staff. Each has a mood and a short arc. */
ER.TEAM_ROLES = [
 { id:'manager', role:'Manager', names:['Dana Reyes','Morgan Hale','Chris Avery'], fig:'manager' },
 { id:'publicist', role:'Publicist', names:['Jules Navarro','Sam Okafor','Robin Ellis'], fig:'publicist' },
 { id:'producer', role:'Producer', names:['Theo Grant','Ari Lindqvist','Kai Moreno'], fig:'producer' },
 { id:'tour', role:'Tour manager', names:['Pat Delaney','Lou Castillo','Jordan Wells'], fig:'manager' }
];
ER.TEAM_ARCS = {
 high:{ t:'{name} has an idea', x:'{name}, your {role}, has been thinking about your next move and has a bold idea.', ch:[{ l:'Hear it out and run with it', fx:{ clout:3, hype:4 }, r:'It works beautifully.' }, { l:'Thank them, but not now', fx:{ team:1 }, r:'They appreciate being heard.' }] },
 low:{ t:'{name} is unhappy', x:'{name}, your {role}, feels overworked and unappreciated. They are thinking about leaving.', ch:[{ l:'Give them a raise and a break', fx:{ money:-150000, team:3 }, r:'They stay, and they remember it.', keep:true }, { l:'Have an honest talk', fx:{ team:1 }, r:'It helps a little.', keep:true, half:true }, { l:'Let them go', fx:{ team:-6 }, r:'They leave. Someone new starts next week.' }] }
};

/* The fan community: invented fans you follow across the years. */
ER.FAN_NAMES = ['Maya','Eli','Priya','Jonah','Sofia','Marcus','Hana','Lucas','Grace','Diego','Nora','Theo','Amara','Finn','Zoe','Kenji'];
ER.FAN_CITIES = ['Ohio','Manchester','Sydney','Toronto','Manila','Mexico City','Dublin','Texas','São Paulo','Seoul','Glasgow','Atlanta'];
ER.FAN_UPDATES = ['{n} just went to their first show, and cried through the whole opener.','{n} graduated today, and their cap was decorated with your album art colours.',
 '{n} started a fan account that now has thousands of followers.','{n} wrote a school essay about your songwriting and got top marks.','{n} met their best friend in the queue for your show.',
 '{n} learned guitar from your songs.','{n} got married, and your song was their first dance.','{n} moved to a new city and found friends at a listening party.',
 '{n} made a bracelet with your newest album title and gave it to a stranger.','{n} is still here, years later, and says the songs grew up with them.'];
ER.THEORIES = ['The next album title is hidden in the colours of the last video.','A vault song is coming, because of a number in the latest caption.',
 'The tour has a secret extra act.','A duet is coming, because of a guitar in the background of a photo.','There is a hidden track on the album.','The next era is going to be darker.'];

/* Invented journalists who remember how you treat them. */
ER.JOURNALISTS = [ { n:'Avery Cole', outlet:'a music monthly' }, { n:'Rina Patel', outlet:'a national newspaper' }, { n:'Marcus Bell', outlet:'a pop culture podcast' } ];

/* Creative tools. */
ER.VIDEO = {
 concept:[['story','A short-film story'],['performance','A pure performance'],['dance','A big dance number'],['cinematic','A cinematic epic']],
 location:[['rooftop','A city rooftop'],['forest','A misty forest'],['mansion','An old mansion'],['studio','A white studio'],['desert','A desert road'],['stage','An empty theatre']],
 moment:[['rain','Rain machines'],['fireworks','Fireworks'],['crowd','A crowd of fans'],['oneshot','One continuous take'],['cameo','A surprise cameo'],['none','Keep it simple']]
};
ER.STAGES3D = [['round','A round stage'],['catwalk','A long catwalk'],['bstage','A main stage and a B-stage']];
ER.LIGHTS = ['#ffd166','#ff6b9d','#7fd1ff','#c3f584','#b58aff','#ffffff'];
ER.THANKS = [['family','Thank your family first'],['fans','Thank the fans first'],['team','Thank the team and band'],['secret','Hide a coded message in the thank-yous']];

/* Legacy projects for later in a career. */
ER.LEGACY_PROJECTS = [
 { id:'museum', n:'A museum exhibition', d:'Costumes, notebooks and guitars from every era.', cost:2000000, fx:{ rep:6, fans:2 } },
 { id:'doc', n:'A career documentary', d:'A film about your whole story.', cost:3000000, fx:{ fans:4, rep:4 } },
 { id:'box', n:'A career box set', d:'Every album, with rarities and demos.', cost:1000000, fx:{ fans:2, own:2 }, earn:8000000 },
 { id:'biopic', n:'A biopic', d:'An actor plays you. You choose how involved to be.', cost:0, fx:{ fans:5, heat:10 }, earn:15000000 },
 { id:'scholarship', n:'A songwriting scholarship', d:'Funds young writers every year.', cost:5000000, fx:{ rep:8 } }
];

/* The living invented music world after 2026. */
ER.NEW_ARTIST_FIRST = ['Ivy','Rhys','Luna','Cass','Milo','Wren','Jade','Nico','Sage','Remy','Skye','Ezra'];
ER.NEW_ARTIST_LAST = ['Monroe','Vance','Hollis','Sterling','Quinn','Rivers','Blake','Darrow','Ashby','Fontaine'];
ER.PROTEGE_SOUNDS = ['Synth-pop','Indie folk','Country-pop','Dark pop','Bedroom pop','Arena rock','R&B'];
})();
