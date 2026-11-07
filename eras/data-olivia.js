/* The Eras Life: Olivia Rodrigo's story. Public record only, song titles only. No private life is
   invented, and nobody is given words they did not say. Some dates and figures are approximate;
   FACTCHECK.md lists the ones that still need a source. */
(function () {
const ER = window.ER, W = ER.ds;

const P = [
 { id:'o_sour', title:'SOUR', short:'SOUR', type:'album', color:'#7d4cc2', ink:'#ffffff', accent:'#f2a3c7', genre:55,
   ws:'2020-01-06', rs:'2020-06-01', fs:'2020-11-02', ps:'2021-01-04', rel:'2021-05-21',
   tracks:['brutal','traitor','drivers license','1 step forward, 3 steps back','deja vu','good 4 u','enough for you','happier','jealousy, jealousy','favorite crime','hope ur ok'],
   extras:[], tour:{ name:'SOUR Tour', kind:'headline', est:25e6, ts:'2022-04-05', te:'2022-07-12', openers:['Gracie Abrams','Holly Humberstone'], target:null, tier:'theater',
     note:'She chose theatres and smaller venues for her first headline tour.' },
   units:295000, cowriters:['Dan Nigro','Solo'], producers:['Dan Nigro'],
   goals:[{k:'no1',v:1,l:'Score a Hot 100 No. 1'}] },
 { id:'o_guts', title:'GUTS', short:'GUTS', type:'album', color:'#5a1f8a', ink:'#ffffff', accent:'#e8182e', genre:62,
   ws:'2022-08-01', rs:'2022-11-07', fs:'2023-05-01', ps:'2023-06-26', rel:'2023-09-08',
   tracks:['all-american bitch','bad idea right?','vampire','lacy','ballad of a homeschooled girl','making the bed','logical','get him back!','love is embarrassing','the grudge','pretty isn\'t pretty','teenage dream'],
   extras:['obsessed','girl i\'ve always been','scared of my guitar','stranger','so american'],
   tour:{ name:'GUTS World Tour', kind:'headline', est:200e6, ts:'2024-02-23', te:'2025-07-12', openers:['Chappell Roan','The Breeders','PinkPantheress'], target:null, tier:'arena' },
   units:302000, cowriters:['Dan Nigro','Solo'], producers:['Dan Nigro'],
   goals:[{k:'units',v:250000,l:'Debut at No. 1 again'}] }
];
P.forEach(p => { ['ws','rs','fs','ps','rel'].forEach(k => { if (p[k]) p[k] = W(p[k]); }); if (p.tour) { p.tour.ts = W(p.tour.ts); p.tour.te = W(p.tour.te); } });

const E = [
 { d:'2015-08-11', id:'o_americangirl', t:'A first lead role', x:'At 12 she lands the lead in an American Girl film, Grace Stirs Up Success.',
   ch:[{l:'Take the role',fx:{fans:30,clout:2,energy:-6},c:1,r:'You learn how a film set works.'},{l:'Stay focused on singing lessons',fx:{write:3},r:'More time for music.'}],
   truth:'She starred in Grace Stirs Up Success, released in 2015.' },
 { d:'2016-06-24', id:'o_bizaardvark', t:'Bizaardvark', x:'She is cast as Paige, a songwriter and guitarist, on a new Disney Channel series.',
   ch:[{l:'Say yes',fx:{fans:60,clout:5,energy:-10},c:1,r:'You play guitar and sing on TV every week.'},{l:'Keep auditioning for other things',fx:{clout:1},r:'You wait for something else.'}],
   truth:'Bizaardvark premiered on Disney Channel in June 2016, with her as Paige Olvera.' },
 { d:'2019-02-11', id:'o_hsmcast', t:'Nini', x:'She is cast as Nini in High School Musical: The Musical: The Series for Disney+.',
   ch:[{l:'Take the role',fx:{fans:40,clout:6},c:1,r:'A lead role, and songs to sing.'},{l:'Pass',fx:{},r:'You keep looking.'}],
   truth:'She was cast as Nini Salazar-Roberts in 2019.' },
 { d:'2019-11-22', id:'o_allIwant', t:'"All I Want"', x:'The show needs a song for Nini. She has written one herself.',
   ch:[{l:'Pitch your own song',fx:{fans:50,write:6,clout:4},c:1,r:'Your song goes in the show, and people go looking for it.'},{l:'Sing what the writers give you',fx:{fans:10},r:'A good scene.'}],
   truth:'She wrote "All I Want" for the series. It became a viral hit and reached the Hot 100.' },
 { d:'2020-06-01', id:'o_geffen', t:'A record deal', x:'Record labels are interested in her songwriting.',
   ch:[{l:'Sign with Geffen Records',fx:{clout:8,money:50000},c:1,r:'You have a label behind your songs.'},{l:'Stay independent for now',fx:{own:5},r:'You keep writing alone.'}],
   truth:'She signed with Geffen Records in 2020.' },
 { d:'2020-07-06', id:'o_nigro', t:'Writing with Dan Nigro', x:'She starts working with producer and songwriter Dan Nigro.',
   ch:[{l:'Build the album with him',fx:{write:6},c:1,r:'You find a sound that fits your songs.'},{l:'Try lots of producers',fx:{clout:3},r:'You meet everyone.'}],
   truth:'Dan Nigro co-wrote and produced SOUR and GUTS.' },
 { d:'2021-01-08', id:'o_dl', t:'"drivers license"', x:'Her debut single is ready.',
   ch:[{l:'Release it now',fx:{fans:30,hype:20},c:1,r:'It is everywhere within days.'},{l:'Wait for a bigger launch',fx:{hype:5},r:'You hold it back.'}],
   truth:'"drivers license" came out on January 8, 2021, debuted at No. 1 on the Hot 100 and stayed there for eight weeks.' },
 { d:'2021-04-01', id:'o_dejavu', t:'"deja vu"', x:'A second single, before the album is announced.',
   ch:[{l:'Release it',fx:{fans:8,hype:8},c:1,r:'Fans start piecing the album together.'},{l:'Go straight to the album',fx:{hype:3},r:'One single only.'}],
   truth:'"deja vu" came out on April 1, 2021, debuted at No. 8 and later peaked at No. 3.' },
 { d:'2021-04-13', id:'o_sourann', t:'Announcing SOUR', x:'The album has a name and a date: May 21.',
   ch:[{l:'Announce it with a cover full of stickers',fx:{hype:12},c:1,r:'Fans decode every sticker.'},{l:'Keep it simple',fx:{hype:6},r:'A clean announcement.'}],
   truth:'SOUR was announced in April 2021.' },
 { d:'2021-05-14', id:'o_good4u', t:'"good 4 u"', x:'One more single, a week before the album.',
   ch:[{l:'Release a pop-punk single',fx:{fans:12,hype:10},c:1,r:'A completely different sound, and it lands.'},{l:'Release another ballad',fx:{fans:4},r:'Fans expected that.'}],
   truth:'"good 4 u" debuted at No. 1 on the Hot 100 in May 2021.' },
 { d:'2021-05-21', id:'o_sourout', t:'SOUR is out', x:'Release day.',
   ch:[{l:'Celebrate with fans online',fx:{fans:10,heat:4},c:1,r:'The album breaks streaming records.'},{l:'Stay offline',fx:{energy:10},r:'You let the music speak.'}],
   truth:'SOUR debuted at No. 1 on the Billboard 200 with about 295,000 units.' },
 { d:'2021-07-14', id:'o_whitehouse', t:'The White House', x:'She is invited to the White House to encourage young people to get vaccinated against COVID-19.',
   ch:[{l:'Go',fx:{rep:6,heat:6},c:1,r:'Your visit is all over the news.'},{l:'Post a video message instead',fx:{rep:3},r:'A smaller moment.'}],
   truth:'She visited the White House in July 2021 to encourage young people to get vaccinated.' },
 { d:'2021-08-23', id:'o_credits', t:'Songwriting credits', x:'Two songs echo songs she loves. Other writers are being added to the credits.',
   ch:[{l:'Credit them, and say how much those songs mean to you',fx:{rep:4},c:1,r:'Credit where it is due.'},{l:'Credit them quietly',fx:{rep:1},r:'The credits update.'}],
   truth:'In 2021, writers of songs that inspired "good 4 u" and "deja vu" were added to those songs\' credits.' },
 { d:'2021-09-12', id:'o_vmas', t:'The 2021 VMAs', x:'She performs "good 4 u" and is up for several awards.',
   ch:[{l:'Perform it like a punk show',fx:{fans:10,heat:6},c:1,r:'Three awards.'},{l:'Keep it simple',fx:{fans:4},r:'Three awards.'}],
   truth:'She won Song of the Year, Best New Artist and Push Performance of the Year at the 2021 VMAs.', award:'VMA Song of the Year' },
 { d:'2022-03-25', id:'o_drivinghome', t:'driving home 2 u', x:'A film about making SOUR, recorded on a road trip, comes to Disney+.',
   ch:[{l:'Share the stories behind the songs',fx:{fans:8,rep:3},c:1,r:'Fans see where the songs came from.'},{l:'Keep it to performances',fx:{fans:4},r:'A concert film.'}],
   truth:'driving home 2 u (a SOUR film) premiered on Disney+ in March 2022.' },
 { d:'2022-04-03', id:'o_grammys22', t:'The 2022 Grammys', x:'She is up for seven Grammys, including Best New Artist.',
   ch:[{l:'Perform "drivers license"',fx:{fans:8,clout:8},c:1,r:'Three Grammys.'},{l:'Just attend',fx:{clout:5},r:'Three Grammys.'}],
   truth:'She won three Grammys in 2022: Best New Artist, Best Pop Vocal Album and Best Pop Solo Performance.', award:'Grammy: Best New Artist' },
 { d:'2022-04-04', id:'o_sourtour', t:'The SOUR Tour', x:'Her first headline tour. How big should the rooms be?',
   ch:[{l:'Theatres, close to the crowd',fx:{fans:6,rep:4},c:1,r:'Every seat is close.'},{l:'Arenas straight away',fx:{fans:10,energy:-10},r:'Big rooms, fast.'}],
   truth:'The SOUR Tour in 2022 played theatres and smaller venues in North America and Europe.' },
 { d:'2023-06-30', id:'o_vampire', t:'"vampire"', x:'The first song from her second album.',
   ch:[{l:'Release it',fx:{fans:12,hype:15},c:1,r:'Straight to No. 1.'},{l:'Lead with something upbeat',fx:{hype:6},r:'A different first impression.'}],
   truth:'"vampire" debuted at No. 1 on the Hot 100 in July 2023.' },
 { d:'2023-09-08', id:'o_gutsout', t:'GUTS is out', x:'The second album.',
   ch:[{l:'Lean into the rock songs',fx:{fans:10,genre:4},c:1,r:'Critics love the energy.'},{l:'Promote the ballads',fx:{fans:6},r:'A softer story.'}],
   truth:'GUTS debuted at No. 1 on the Billboard 200 with about 302,000 units.' },
 { d:'2023-11-03', id:'o_cantcatch', t:'A film song', x:'A song for a big film franchise.',
   ch:[{l:'Write it',fx:{fans:5,write:3,clout:4},c:1,r:'Your song plays over the credits.'},{l:'Pass',fx:{},r:'Someone else writes it.'}],
   truth:'She wrote "Can\'t Catch Me Now" for The Hunger Games: The Ballad of Songbirds & Snakes (2023).' },
 { d:'2024-02-04', id:'o_grammys24', t:'The 2024 Grammys', x:'Six nominations. She performs "vampire".',
   ch:[{l:'Perform it, whatever happens',fx:{fans:6,rep:3},c:1,r:'A great performance. No wins this year.'},{l:'Skip performing',fx:{energy:5},r:'A quiet night.'}],
   truth:'She was nominated for six Grammys in 2024 and performed "vampire". She did not win that year.' },
 { d:'2024-02-23', id:'o_gutstour', t:'The GUTS World Tour', x:'Her first arena tour begins.',
   ch:[{l:'Bring rising artists as openers',fx:{rep:4,fans:6},c:1,r:'Your openers break out too.'},{l:'Keep the show short and simple',fx:{energy:6},r:'Easier nights.'}],
   truth:'The GUTS World Tour began in February 2024, with openers including Chappell Roan, The Breeders and PinkPantheress.' },
 { d:'2024-03-11', id:'o_fund4good', t:'Fund 4 Good', x:'Part of the tour\'s proceeds could support causes she cares about.',
   ch:[{l:'Start a fund for women\'s and girls\' rights',fx:{rep:8},c:1,r:'Every show raises money for local groups.'},{l:'Donate privately',fx:{rep:3},r:'A quieter gift.'}],
   truth:'She launched Fund 4 Good in 2024 to support organisations working for women\'s and girls\' rights.' },
 { d:'2024-10-29', id:'o_gutsfilm', t:'A tour film', x:'A concert film of the GUTS World Tour is coming to Netflix.',
   ch:[{l:'Film a full show',fx:{fans:8},c:1,r:'Millions watch it.'},{l:'Keep the tour off camera',fx:{energy:4},r:'Only the people there saw it.'}],
   truth:'Olivia Rodrigo: GUTS World Tour premiered on Netflix in October 2024.' },
 { d:'2025-06-28', id:'o_glasto', t:'Glastonbury', x:'She is asked to headline the Pyramid Stage.',
   ch:[{l:'Headline it',fx:{fans:12,clout:10,energy:-10},c:1,r:'A field full of people singing every word.'},{l:'Play a smaller stage',fx:{fans:4},r:'An intimate set.'}],
   truth:'She headlined the Pyramid Stage at Glastonbury in June 2025.' }
];
E.forEach(e => { e.abs = W(e.d); e.year = +e.d.slice(0, 4); });
E.sort((a, b) => a.abs - b.abs);

const PEOPLE = [
 { n:'Dan Nigro', g:'Collaborators', from:2020, role:'Co-writer and producer of SOUR and GUTS' },
 { n:'Disney Channel', g:'Industry', from:2016, to:2019, role:'Bizaardvark' }, { n:'Disney+', g:'Industry', from:2019, to:2022, role:'High School Musical: The Musical: The Series' },
 { n:'Geffen Records', g:'Industry', from:2020, role:'Her label' }
];
const COWRITERS = { 'Solo':{ bonus:0, note:'Just you, a piano and a notebook.' }, 'Dan Nigro':{ bonus:9, note:'Big hooks, honest ballads and pop-punk.' } };

ER.artists.olivia = {
 id:'olivia', name:'Olivia Rodrigo', fanName:'Livies', born:W('2003-02-20'),
 startAbs:W('2014-01-06'), projects:P, events:E, people:PEOPLE, cowriters:COWRITERS,
 genreLabels:['Ballads','Pop','Pop-punk'], school:{ age:10, until:'2016-06-01' }, color:'#7d4cc2',
 prologue:[
  { t:'Born February 20, 2003', x:'She grows up in Murrieta, California. What does she love first?',
    ch:[{l:'Singing and acting lessons',fx:{fans:6,write:2},c:1},{l:'Writing in a diary',fx:{write:5}},{l:'Performing at school',fx:{fans:8}}],
    truth:'She took singing and acting lessons as a child and performed in school productions.' },
  { t:'Learning instruments', x:'Which instrument does she pick up?',
    ch:[{l:'Piano and guitar',fx:{write:6},c:1},{l:'Just her voice',fx:{fans:4}}],
    truth:'She plays piano and guitar.' },
  { t:'Her heroes', x:'Whose songwriting shapes hers?',
    ch:[{l:'Taylor Swift and Lorde',fx:{write:5},c:1},{l:'Rock bands from her parents\' records',fx:{genre:6}},{l:'Musical theatre',fx:{fans:4}}],
    truth:'She has named Taylor Swift and Lorde among her biggest songwriting influences.' }
 ],
 tabUnlock:{ week:0, life:0, town:0, songbook:W('2014-01-01'), studio:W('2019-11-01'), rollout:W('2020-11-01'), cover:W('2020-11-01'),
   tour:W('2021-06-01'), inbox:W('2016-06-01'), eggs:W('2021-01-01'), fandom:W('2021-01-01'), press:W('2016-06-01'), charts:W('2019-11-01'), legacy:W('2021-06-01') }
};
ER.FAN_CURVE.olivia = [['2014-01-06', 40], ['2015-08-01', 3000], ['2016-12-31', 300000], ['2018-12-31', 1.5e6], ['2019-12-31', 4e6], ['2020-12-31', 8e6],
 ['2021-06-30', 60e6], ['2021-12-31', 75e6], ['2022-12-31', 80e6], ['2023-12-31', 100e6], ['2024-12-31', 120e6], ['2025-12-31', 125e6], ['2026-12-31', 130e6]].map(([d, v]) => [W(d), v]);
ER.PEAKS_BY.olivia = { 'drivers license':1, 'deja vu':3, 'good 4 u':1, 'traitor':9, 'vampire':1, 'bad idea right?':7 };
ER.SINGLE_DEBUT_BY.olivia = { 'drivers license':1, 'good 4 u':1, 'vampire':1 };
Object.assign(ER.REAL_SINGLES, { o_sour:['drivers license','deja vu','good 4 u','traitor'], o_guts:['vampire','bad idea right?','get him back!'] });
ER.ALBUM_RUNS = ER.ALBUM_RUNS || {}; Object.assign(ER.ALBUM_RUNS, { o_sour:{ no1:5 }, o_guts:{ no1:1 } });

// Looks: long dark hair; purples, plaid skirts and stickers for SOUR; deeper purple and red lips for GUTS.
const OL = { skin:'#e8c0a0', hair:'#241712', eyes:'#3a2416', brow:'#241712', hairGlow:0 };
const O2 = o => Object.assign({}, OL, o);
ER.LOOKS.olivia_eras = {
 early:{ base:O2({ style:'straight', hairLen:.6 }), stage:{ top:'tee', outfit:'#7d4cc2', accent:'#ffffff', pants:'#3c5a8a', mic:1 }, casual:{ top:'tee', outfit:'#f2a3c7', accent:'#ffffff', pants:'#3c5a8a' } },
 o_sour:{ base:O2({ style:'straight', hairLen:.8, lips:'#b84a6a' }), stage:{ top:'crop', outfit:'#7d4cc2', accent:'#111111', pants:'#5a2a7a', boots:'tall', bootColor:'#111', mic:1 }, casual:{ top:'cardigan', outfit:'#b9a3e0', accent:'#ffffff', pants:'#2a2a2a' } },
 o_guts:{ base:O2({ style:'waves', hairLen:.85, lips:'#b3123a', liner:1 }), stage:{ top:'crop', outfit:'#5a1f8a', accent:'#e8182e', sparkle:1, pants:'#111', boots:'tall', bootColor:'#111', mic:1, guitar:0 }, casual:{ top:'jacket', outfit:'#111111', accent:'#5a1f8a', pants:'#2a2a2a' } }
};
ER.FREE_LOOK = ER.FREE_LOOK || {}; ER.FREE_LOOK.olivia = { skin:'#e8c0a0', hairs:['#241712','#3a2417','#1a1210'], eyes:'#3a2416', brow:'#241712' };
ER.ERA_MOOD = ER.ERA_MOOD || {}; Object.assign(ER.ERA_MOOD, { o_sour:'quiet', o_guts:'dark' });
// Crossover: her albums chart against the others on their real dates, and theirs against hers.
ER.rivals.push({ who:'olivia', title:'SOUR', abs:W('2021-05-21'), units:295000 }, { who:'olivia', title:'GUTS', abs:W('2023-09-08'), units:302000 });
ER.PLAYABLE = ['taylor','beyonce','gaga','olivia'];
})();
