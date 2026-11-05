/* The Eras Life: the other two stories, crossover rivals, and the systems' shared content. */
(function () {
const ER = window.ER;
const W = ER.ds;

/* Beyoncé and Lady Gaga run on the same systems. Their stories are mapped here from the report
   and become playable once Taylor's story is finished (the report's build order). */
ER.artists.beyonce = {
 id:'beyonce', name:'Beyoncé', fanName:'Beyhive', comingNext:true,
 core:'Control: leaving group and family management, then releasing work on her own terms.',
 eggStyle:'Surprise drops and visual clues rather than puzzles.',
 songbook:'She co-writes many songs with large teams, so her Songbook rewards choosing collaborators and producers.',
 periods:[
  ['1981–1996','Houston, Girl\'s Tyme','Born September 4, 1981. Talent shows, a Star Search loss in 1993, and her father Mathew Knowles quits his job to manage the group.','Group rehearsal, family management'],
  ['1997–2002','Destiny\'s Child','Columbia deal, The Writing\'s on the Wall, the 2000 lineup changes and lawsuits, Survivor. Austin Powers in Goldmember.','Group politics, lineup crisis'],
  ['2003–2007','Dangerously in Love, B\'Day','Solo debut and five Grammys. Destiny Fulfilled and the final group tour. Dreamgirls.','Going solo, film roles'],
  ['2008–2010','I Am... Sasha Fierce','Marries Jay-Z. Cadillac Records. The VMAs moment with Taylor. Six Grammys in 2010.','Alter ego, crossover'],
  ['2011–2013','4, self-titled','Splits from her father as manager. Blue Ivy. Super Bowl halftime. Parkwood. A surprise self-titled album in December 2013.','Own company, surprise drop'],
  ['2014–2016','Lemonade','The elevator video. On the Run. "Formation" and the Super Bowl 50 reaction. Lemonade, and the 2016 CMA backlash.','Press silence, visual album'],
  ['2017–2021','Family and Homecoming','Twins Rumi and Sir. Coachella and Homecoming. Everything Is Love with Jay-Z. The Lion King. Black Is King.','Stadium show-building'],
  ['2022–2023','Renaissance','Act I. Most-awarded artist in Grammy history. Another Album of the Year loss. The Renaissance tour and film.','Trilogy planning'],
  ['2024–2025','Cowboy Carter','Act II and a Super Bowl ad reveal. The country-radio debate. First Album of the Year win. The Cowboy Carter Tour.','Genre fight, tour'],
  ['2026','Act III wait','Met Gala co-chair. Fan theories about Act III, which her publicist publicly denied around the Met Gala. No confirmed album as of the report.','Fan-theory management']
 ],
 catalog:['Girl\'s Tyme and early demos','Destiny\'s Child albums','Dangerously in Love','B\'Day','I Am... Sasha Fierce','4','Beyoncé','Lemonade','Everything Is Love','The Lion King: The Gift','Renaissance','Cowboy Carter'],
 people:['Tina Knowles','Mathew Knowles','Solange','Kelly Rowland','Michelle Williams','LaTavia Roberson','LeToya Luckett','Jay-Z','Blue Ivy','Yvette Noel-Schure (publicist)'],
 color:'#c99a2e'
};
ER.artists.gaga = {
 id:'gaga', name:'Lady Gaga', fanName:'Little Monsters', comingNext:true,
 core:'Reinvention: dropped, then explodes, nearly burns out, and comes back through jazz, film and pop.',
 eggStyle:'Spectacle and outfits work the way Easter eggs do for Taylor, through a Fashion Shock meter.',
 songbook:'Writing for others and building a persona are part of the craft.',
 periods:[
  ['1986–2006','Stefani in New York','Born March 28, 1986. Convent of the Sacred Heart. NYU Tisch, then drops out. Lower East Side clubs.','Club gigs, persona building'],
  ['2006–2008','Getting signed','Dropped by Def Jam. Songwriting at Interscope. Founds the Haus of Gaga. The Fame in 2008.','Songwriting for others, persona'],
  ['2009–2010','The Fame Monster','"Bad Romance." The meat dress at the VMAs. "Telephone" with Beyoncé. The Monster Ball.','Fashion Shock meter'],
  ['2011–2012','Born This Way','The album and the Born This Way Foundation. The Madonna comparison dispute. A hip injury cancels the tour.','Advocacy, injury risk'],
  ['2013–2015','Artpop, Cheek to Cheek','Artpop backlash. Split from manager Troy Carter. Jazz album and tour with Tony Bennett. The Oscars Sound of Music tribute.','Recovery through credibility'],
  ['2016–2018','Joanne, A Star Is Born','American Horror Story and a Golden Globe. Joanne. Super Bowl LI. Fibromyalgia and Gaga: Five Foot Two. Rock in Rio cancelled. The film, and an Oscar for "Shallow."','Acting track, health'],
  ['2019–2022','Chromatica, Gucci','Enigma in Las Vegas. The Oscars "Shallow" performance. Chromatica. Love for Sale. House of Gucci. The dog-walker shooting (Sensitive).','Residency, film awards'],
  ['2023–2024','Joker','Joker: Folie à Deux and its poor reception. Harlequin. Engagement to Michael Polansky confirmed. "Die with a Smile."','Handling a flop'],
  ['2025–2026','Mayhem','Mayhem debuts at No. 1. Coachella. The Rio show draws over 2 million. The Mayhem Ball runs through April 2026. A Super Bowl LX cameo. Devil Wears Prada 2 songs.','Tour, cameo moments']
 ],
 catalog:['Early Stefani demos','The Fame','The Fame Monster','Born This Way','Artpop','Cheek to Cheek','Joanne','A Star Is Born','Chromatica','Love for Sale','Harlequin','Mayhem','2025–2026 singles'],
 people:['Joe Germanotta','Cynthia Germanotta','Natali Germanotta','her late aunt Joanne','Tony Bennett','Bradley Cooper','Troy Carter','Taylor Kinney','Christian Carino','Michael Polansky','Bruno Mars'],
 note:'She has publicly discussed a past assault and her mental health. These appear only as her own public advocacy, with no scene or decision around the assault itself.',
 color:'#c23b7a'
};

/* Crossover: the other two appear as real chart rivals on their real release dates. */
ER.rivals = [
 ['beyonce','Dangerously in Love','2003-06-24',317000],['beyonce',"B'Day",'2006-09-04',541000],
 ['beyonce','I Am... Sasha Fierce','2008-11-18',482000],['beyonce','4','2011-06-28',310000],
 ['beyonce','Beyoncé','2013-12-13',617000],['beyonce','Lemonade','2016-04-23',653000],
 ['beyonce','Everything Is Love','2018-06-16',123000],['beyonce','The Lion King: The Gift','2019-07-19',54000],
 ['beyonce','Renaissance','2022-07-29',332000],['beyonce','Cowboy Carter','2024-03-29',407000],
 ['gaga','The Fame','2008-08-19',24000],['gaga','The Fame Monster','2009-11-18',174000],
 ['gaga','Born This Way','2011-05-23',1108000],['gaga','Artpop','2013-11-11',258000],
 ['gaga','Cheek to Cheek','2014-09-23',131000],['gaga','Joanne','2016-10-21',201000],
 ['gaga','A Star Is Born','2018-10-05',231000],['gaga','Chromatica','2020-05-29',274000],
 ['gaga','Love for Sale','2021-09-30',34000],['gaga','Harlequin','2024-09-27',30000],
 ['gaga','Mayhem','2025-03-07',219000]
].map(r => ({ who:r[0], title:r[1], abs:W(r[2]), units:r[3] }));

/* ---------- Stage definitions ---------- */
ER.STAGES = {
 none:{ n:'Between eras', need:'' },
 write:{ n:'Writing', need:'Enough of the era\'s songs are written' },
 record:{ n:'Recording', need:'Every chosen track is recorded' },
 finish:{ n:'Finishing', need:'The album is delivered' },
 pre:{ n:'Pre-release', need:'The announcement and first single are out' },
 release:{ n:'Release', need:'First-week numbers are in' },
 promo:{ n:'Promotion', need:'The tour starts or the campaign ends' },
 tourprep:{ n:'Tour prep', need:'Final rehearsal passes' },
 tour:{ n:'On tour', need:'Last show is played' },
 rest:{ n:'Rest', need:'The next era\'s writing begins' }
};
ER.FINISH = [['sequence','Set the track order',1],['master','Approve the masters',1],['cover','Make the cover in Cover Studio',2],['edition','Choose the editions',1],['deliver','Deliver to the label',1]];
ER.PRE = [['single','Pick and release the first single',1],['video','Film the music video',2],['press','Shoot the press photos',1],['announce','Set and make the announcement',1]];
ER.PRE_SURPRISE = [['announce','Announce it the day before',1]];
ER.PRE_TV = [['announce','Announce the re-record',1],['single','Release a Taylor\'s Version single',1]];
ER.RELEASE = [['tv','Release-week TV',1],['radio','Radio and streaming push',1],['signing','Signings and fan event',1],['posts','Release-night posts',1]];
ER.TOURPREP = [['route','Route the tour in Tour Desk',1],['setlist','Build the setlist',1],['cast','Cast dancers and band',1],['costume','Approve costumes and stage',1],['rehearse','Full rehearsal',2]];

/* ---------- Sponsors (generic, no real brands) ---------- */
ER.SPONSORS = [
 { id:'soda', n:'A soda brand', pay:0.6, duties:['Commercial shoot','Launch appearance'] },
 { id:'store', n:'A department store', pay:0.5, duties:['Catalogue shoot','In-store appearance'] },
 { id:'camera', n:'A camera company', pay:0.4, duties:['Ad shoot','Product launch'] },
 { id:'beauty', n:'A cosmetics line', pay:0.7, duties:['Campaign shoot','Launch party'] },
 { id:'airline', n:'An airline', pay:0.5, duties:['Ad shoot','Route launch'] },
 { id:'card', n:'A credit card company', pay:0.8, duties:['Commercial shoot','Presale event'] }
];

/* ---------- Easter eggs ---------- */
ER.EGG_TYPES = [
 { id:'caps', n:'Capitalised letters in the lyric booklet', diff:2 },
 { id:'numbers', n:'A string of numbers', diff:2 },
 { id:'colors', n:'A colour palette', diff:1 },
 { id:'outfit', n:'An outfit detail', diff:1 },
 { id:'prop', n:'A video prop', diff:2 },
 { id:'countdown', n:'A countdown', diff:1 },
 { id:'puzzle', n:'A social-media puzzle', diff:3 },
 { id:'thirteen', n:'A date tied to the number 13', diff:3 }
];
ER.FAN_HANDLES = ['cardiganweather','bejeweledbee','folkloreflower','redscarfrunner','starlightnotes','paperringsss','eras_in_order','vaultvibes','midnightrainz','longlivekid','glitterbluesky','thirteenfan','mastermindmap','snakeandbutterfly','speaknowsparks','fearlessgold','champagnetheory','loverhousepink','tortureddrafts','showgirlsequin'];

/* ---------- Cover Studio ---------- */
ER.PALETTES = [
 { id:'meadow', n:'Meadow', c:['#2f8f7c','#cfe8dc','#123b33'], mood:'country' },
 { id:'gold', n:'Gold leaf', c:['#d6a93a','#f6e7b8','#5a3f0c'], mood:'country' },
 { id:'violet', n:'Violet ballroom', c:['#7b3fa0','#e6d4f2','#2e0f40'], mood:'romantic' },
 { id:'scarlet', n:'Scarlet', c:['#b3202b','#f3d2c7','#3b0a0e'], mood:'romantic' },
 { id:'polaroid', n:'Polaroid sky', c:['#6fa8d6','#f2efe6','#1d3c57'], mood:'pop' },
 { id:'newsprint', n:'Newsprint', c:['#1e1e21','#d9d9dc','#7c7c84'], mood:'dark' },
 { id:'bubblegum', n:'Bubblegum', c:['#e88fb4','#fbe3ec','#6a2bd1'], mood:'pop' },
 { id:'fog', n:'Fog', c:['#8f9093','#efefec','#2f3031'], mood:'quiet' },
 { id:'rust', n:'Rust and plaid', c:['#b4643a','#f1dfcf','#3d2416'], mood:'quiet' },
 { id:'midnight', n:'Midnight', c:['#2c3e70','#b8c4ea','#0d132b'], mood:'dark' },
 { id:'parchment', n:'Parchment', c:['#d9d2c5','#2a2622','#8b8073'], mood:'quiet' },
 { id:'stage', n:'Stage lights', c:['#e2762f','#2bb3a3','#13312e'], mood:'pop' }
];
ER.SYMBOLS = ['circle','sun','moon','wave','stripes','grid','star','diamond','arch','horizon','bloom','spiral'];
ER.LAYOUTS = ['centered','offset','framed','split','full-bleed'];
ER.FINISHES = ['matte','gloss','grain','foil'];
ER.ERA_MOOD = { ts1:'country', fearless:'country', speaknow:'romantic', red:'romantic', '1989':'pop', rep:'dark', lover:'pop', folklore:'quiet', evermore:'quiet', midnights:'dark', ttpd:'quiet', showgirl:'pop', encore:'pop' };

/* ---------- Drama Engine (after 2026) ---------- */
// Invented drama around the career and invented characters only. No invented misconduct,
// affairs, crimes, illnesses or political positions for real people.
ER.RIVAL_STARS = ['Vesper Lane','Nova Kincaid','Juno Marlowe','Sasha Vale'];
ER.EXECS = ['Dale Pryor of Northlight Media','Marcy Quill of Halcyon Live'];
ER.TABLOIDS = ['The Daily Glint','Starwatch Weekly'];
ER.DRAMA = [
 { id:'leak', t:'Album leak', x:'Demos from the next album have been hacked and posted online.',
   ch:[{l:'Release the album early',fx:{hype:8,quality:-6}},{l:'Scrap the leaked songs and write new ones',fx:{energy:-15,write:3}},{l:'Ignore it',fx:{hype:-6,fans:-2}}] },
 { id:'ticketbacklash', t:'Ticket-price backlash', x:'Dynamic pricing has pushed some tickets past $1,000, and fans are angry.',
   ch:[{l:'Cap prices and refund the difference',fx:{money:-3000000,rep:8,fans:3}},{l:'Defend the pricing',fx:{rep:-10,money:2000000}},{l:'Blame the ticketing company',fx:{rep:2,heat:8}}] },
 { id:'cancelbacklash', t:'Tour-cancellation backlash', x:'Weather forced a stadium show to cancel at the last minute.',
   ch:[{l:'Add a make-up date',fx:{energy:-10,rep:6}},{l:'Refund and move on',fx:{rep:-4,money:-1000000}}] },
 { id:'sponsorwalk', t:'Sponsor walkout', x:'A brand partner pulls out after a viral controversy around its own ads.',
   ch:[{l:'Cut ties publicly',fx:{money:-500000,rep:4}},{l:'Quietly let the deal lapse',fx:{money:-800000}}] },
 { id:'badbrand', t:'A bad brand deal', x:'A sponsored post for an invented energy-drink brand gets mocked.',
   ch:[{l:'Laugh at yourself',fx:{rep:3,heat:6}},{l:'Delete the post',fx:{rep:-2,heat:4}}] },
 { id:'rivalfeud', t:'Rival pop star', x:'{rival} takes a swipe at you in an interview.',
   ch:[{l:'Answer it in a song',fx:{write:3,heat:12,hype:6}},{l:'Rise above it',fx:{rep:5}},{l:'Fire back online',fx:{heat:18,rep:-4,fans:2}}] },
 { id:'execfeud', t:'An executive', x:'{exec} wants your next tour on his terms.',
   ch:[{l:'Walk away from the deal',fx:{clout:4,money:-2000000}},{l:'Sign with conditions',fx:{money:3000000,team:-4}}] },
 { id:'tabloid', t:'A false rumour', x:'{tabloid} runs a made-up story about you, and it is spreading.',
   ch:[{l:'Deny it firmly',fx:{heat:8,rep:3}},{l:'Joke about it on stage',fx:{fans:3,heat:4}},{l:'Sue the tabloid',fx:{money:-500000,rep:5,heat:12}}] },
 { id:'plagiarism', t:'Plagiarism claim', x:'An invented songwriter, Reed Callahan, claims your new single copies his song.',
   ch:[{l:'Fight it in court',fx:{money:-1500000,rep:4}},{l:'Settle quietly',fx:{money:-800000,rep:-3}},{l:'Add him as a co-writer',fx:{own:-2,rep:1}}] },
 { id:'flopsingle', t:'A flop single', x:'The new single stalls outside the top 40.',
   ch:[{l:'Rush out the next single',fx:{hype:6,energy:-8}},{l:'Remix it with a feature',fx:{fans:3,money:-200000}},{l:'Let it go',fx:{hype:-6}}] },
 { id:'flopfilm', t:'A flop film', x:'Your invented film project, Silver Coast, opens to bad reviews.',
   ch:[{l:'Own it publicly',fx:{rep:4}},{l:'Blame the edit',fx:{rep:-4,heat:8}}] },
 { id:'fanwar', t:'Fan war', x:'Your fans and {rival}\'s fans are at war online.',
   ch:[{l:'Ask fans to be kind',fx:{rep:6,fans:-1}},{l:'Say nothing',fx:{heat:8}}] },
 { id:'snub', t:'Award snub', x:'Your album misses the Album of the Year shortlist.',
   ch:[{l:'Congratulate the nominees',fx:{rep:6}},{l:'Skip the show',fx:{heat:6,rep:-2}}] },
 { id:'badinterview', t:'A bad interview', x:'A tired answer in an interview gets clipped out of context.',
   ch:[{l:'Clarify calmly',fx:{rep:2,heat:4}},{l:'Go quiet for a month',fx:{heat:-6,fans:-1}}] },
 { id:'onstage', t:'Viral onstage mistake', x:'You fall through a stage trapdoor mid-song. You are fine, and the clip is everywhere.',
   ch:[{l:'Play it for laughs next night',fx:{fans:4,rep:3}},{l:'Cut the moment from the show',fx:{energy:3}}] }
];
ER.TITLE_WORDS = {
 a:['Golden','Silver','Paper','Velvet','Neon','Quiet','Wild','Holy','Electric','Faded','Crimson','Glass','Midnight','Summer','Winter','Lucky','Secret','Brave','Hollow','Painted'],
 b:['Hearts','Highway','Letters','Ghosts','Fireworks','Garden','Lanterns','Season','Promise','Satellite','Daydream','Chapel','Matches','Postcards','Rooftops','Static','Horizon','Echoes','Storm','Kingdom'],
 c:['Last Dance','Out of the Blue','Hold Your Breath','Long Way Home','Say It Again','Before the Rain','Front Row','Second Chance','All of It','Slow Burn','After Hours','Tell Me Now','Over and Over','Like I Do','Still Here']
};
ER.ALBUM_WORDS = ['Afterglow Hotel','Kingdom Come','Glass Houses','The Long Summer','Night Shift','Wildflower','Undertow','The Last Chapter','Marigold','Northern Lights','Paper Crown','Static and Stars'];

/* Interviews and press outlets (generic). */
ER.OUTLETS = [
 { id:'local', n:'Local TV and radio', heat:2, rep:1, fans:1, from:1989 },
 { id:'magazine', n:'A music magazine cover story', heat:6, rep:3, fans:2, from:2006 },
 { id:'latenight', n:'A late-night talk show', heat:5, rep:2, fans:3, from:2007 },
 { id:'primetime', n:'A prime-time sit-down interview', heat:10, rep:4, fans:3, from:2010 },
 { id:'podcast', n:'A long-form podcast', heat:6, rep:4, fans:3, from:2016 }
];
})();
