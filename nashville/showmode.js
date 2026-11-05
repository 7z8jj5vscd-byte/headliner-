// Nashville: Make It or Fake It: Show mode. Play the show itself, episode by episode: every episode opens with its
// title and what happens in it, gives you a main challenge and side challenges that mirror the episode (your own
// version for whoever you play, pulling in the show's characters when the timeline has them around), and ends with
// credits, 1-3 stars and a "Next time on Nashville". Missed challenges have soft, story-fitting consequences.

// ======================= THE EPISODES =======================
// "title|what happens|tags|cast"  (tags drive the challenges; cast are pulled in when they're in the story)
const EPISODES=[[
'The Queen and the Princess|Edgehill wants Rayna Jaymes to open for Juliette Barnes. Rayna would rather die. Meanwhile, a duet at the Bluebird stops the room.|rival,bluebird,label|rayna,juliette,scarlett,gunnar',
'The Song Everybody Wants|Scarlett and Gunnar\'s Bluebird song is being passed around town, and Juliette has her eyes on Deacon.|bluebird,write,romance|scarlett,gunnar,deacon,juliette',
'Campaign Season|Teddy Conrad runs for mayor, and the family is suddenly on display.|family,press|teddy,rayna,maddie',
'A Woman From the Past|A woman named Peggy turns up in Teddy\'s life, and Juliette fights her label over her sound.|studio,scandal|teddy,peggy,juliette',
'Demo Day|Scarlett gets dragged into a studio for the first time, and Gunnar takes a writing job he hates.|studio,write|scarlett,gunnar,avery',
'The Fundraiser|A charity show puts rivals on the same stage for a good cause.|charity,duet|rayna,deacon,juliette',
'Songs for Sale|Pluggers and publishers circle. Everybody wants a cut of a hit.|write,money|gunnar,scarlett,deacon',
'The Mother Church|Rayna and Juliette have to share the Ryman stage, smiling for the cameras.|opry,rival,duet|rayna,juliette',
'Brothers|Gunnar loses his brother Jason, and his friends don\'t know what to say.|grief,friend|gunnar,scarlett',
'Down to the Wire|Election week. The mayor\'s race gets ugly and everyone is on edge.|family,press|teddy,rayna',
'Victory Lap|Teddy wins. Rayna\'s record sales keep slipping, and Edgehill is losing patience.|chart,fame|teddy,rayna',
'Fine Print|Avery signs a deal that might cost him his soul, and Scarlett isn\'t sure she knows him anymore.|label,money|avery,scarlett',
'Two Stars, One Bus|The arena tour rolls on and the green room is a war zone.|tour,rival|rayna,juliette',
'Unplugged|Deacon plays a stripped-down set and the whole town remembers how good he is.|bluebird,write|deacon,scarlett',
'The Leak|A secret gets out, and the tabloids have a field day.|scandal,press|juliette,rayna',
'Tangled|Love triangles everywhere. Nobody is with who they want to be with.|romance,friend|scarlett,gunnar,avery',
'Mama|Jolene Barnes is back in Juliette\'s life, and that\'s never good news.|family,sober|juliette',
'Finding a Voice|Scarlett finds her sound in the studio, with Deacon\'s help.|studio,write|scarlett,deacon',
'Jolene|Tragedy for Juliette.|grief,family|juliette',
'Off the Wagon|Deacon has a drink. Then another.|sober,crisis|deacon,rayna',
'Headlights in the Rain|The season ends on a rainy road, with headlights and a crash.|crisis,family|rayna,deacon'],
['Waking Up|Rayna wakes up in a hospital. Edgehill has a new boss, and he\'s nobody\'s friend.|crisis,label|rayna,jeff,deacon',
'New Girl in Town|Scarlett\'s childhood friend Zoey moves to Nashville and catches Gunnar\'s eye.|friend,romance|scarlett,gunnar,zoey',
'The Reality Star|Reality-show runner-up Layla Grant signs to Edgehill and gunning for Juliette.|rival,social|layla,juliette',
'One Day at a Time|Deacon is sober again and writing like his life depends on it.|sober,write|deacon',
'Mrs. Mayor|Teddy marries Peggy, and the girls have to smile in every photo.|family,press|teddy,peggy,maddie',
'Writer for Hire|Gunnar and Scarlett write songs for other people\'s records, and it stings.|write,money|gunnar,scarlett',
'The Contract|Rayna and Edgehill fight over every clause.|label,money|rayna,jeff',
'Highway 65|Rayna buys her way out of Edgehill and starts her own label.|label,fame|rayna,scarlett',
'First Signing|Highway 65 needs artists, and Rayna needs a hit.|label,studio|rayna,scarlett,will',
'Shots Fired|A gunman at a mayoral event hits Peggy. The city is shaken.|crisis,press|teddy,peggy',
'On the Road with Luke|Rayna joins Luke Wheeler\'s tour. Sparks fly.|tour,romance|rayna,luke',
'Duet|Rayna and Luke\'s duet heats up radio and the rumour mill.|duet,chart|rayna,luke',
'Rivals|Layla and Juliette go to war on social media.|rival,social|layla,juliette',
'Will\'s Secret|Will Lexington is hiding something, and it\'s eating him alive.|friend,scandal|will,gunnar',
'Studio Wars|Every record in town is fighting over the same producers.|studio,write|avery,scarlett',
'The Comment|Juliette says the wrong thing about Jesus, and Christian radio pulls her records.|scandal,press,social|juliette',
'Fallout|Sales crash. Sponsors leave. Who stays?|chart,friend|juliette,avery',
'Home for the Holidays|Christmas in Nashville: family, music and too much eggnog.|family,charity|rayna,deacon,maddie,daphne',
'The Comeback|Everybody in this town needs a hit, now.|release,chart|juliette,rayna',
'Showcase|A label showcase at the Bluebird could change everything.|bluebird,label|scarlett,gunnar,will',
'Awards Night|The CMAs, the red carpet and a lot of nerves.|award,fame|rayna,juliette,luke',
'The Proposal|Luke gets down on one knee at the Ryman.|romance,opry|rayna,luke,deacon'],
['The Answer|Everybody wants to know what Rayna said to Luke.|romance,press|rayna,luke,deacon',
'Sadie Stone|Country star Sadie Stone is in town and needs a new label.|label,friend|sadie,rayna',
'Back to Work|A new season of records and tours begins.|studio,tour|rayna,juliette',
'Mentors|Everyone needs somebody to show them the ropes.|friend,write|deacon,scarlett',
'A Wedding on Camera|Will and Layla get married on a reality show.|wedding,social|will,layla',
'Writers\' Night|A writers\' night at the Bluebird turns into a battle.|bluebird,write|gunnar,avery,scarlett',
'Pressure|The labels want hits, and they want them yesterday.|chart,label|juliette,rayna',
'A Baby on the Way|Juliette is pregnant, and the rumours start immediately.|family,scandal|juliette,avery',
'Family Matters|Maddie and Daphne want more of their parents\' time.|family|maddie,daphne,rayna,deacon',
'The Exes|Gunnar, Avery and Scarlett form a band, and name it after their love lives.|duet,bluebird|gunnar,avery,scarlett',
'Van Life|The Exes hit the road in a van with no air conditioning.|tour,friend|gunnar,avery,scarlett',
'On One Knee|Avery asks a pregnant Juliette to marry him.|romance,family|avery,juliette',
'Bridges|Old friends patch things up. Or don\'t.|friend|scarlett,gunnar',
'Radio Wars|A single climbs, and everyone wants to take credit.|chart,release|rayna,juliette',
'The Diagnosis|Deacon has liver cancer and needs a transplant.|crisis,family|deacon,rayna,maddie',
'Waiting|Hospital corridors and a lot of praying.|crisis,friend|deacon,scarlett',
'Second Chances|Some people get one more shot.|sober,write|deacon',
'The Closing|Edgehill is falling apart.|label,money|jeff,juliette',
'Doors Close|Edgehill Records goes out of business.|label|juliette,layla',
'Back Together|Rayna and Deacon find their way back to each other.|romance,family|rayna,deacon',
'Coming Out|Will Lexington tells the world the truth.|scandal,friend|will',
'Cadence|Juliette and Avery welcome a daughter.|family|juliette,avery'],
['The Opry Turns 90|The Grand Ole Opry celebrates its 90th birthday, and everyone wants to be on that stage.|opry,fame|rayna,deacon,juliette',
'Postpartum|Juliette is struggling, and throwing herself into work to hide it.|family,crisis|juliette,avery',
'New Sounds|The Exes and everyone else are making new records.|studio,write|gunnar,scarlett,avery',
'Tour Season|Buses, venues and bad hotel coffee.|tour|rayna,will',
'Cash Gray|Country singer Cash Gray takes a fragile Juliette under her wing.|friend,sober|cash,juliette',
'A Song for Everyone|A benefit concert brings the whole town out.|charity,duet|rayna,deacon',
'The Wedding Plans|Rayna and Deacon start planning a wedding.|wedding,family|rayna,deacon',
'Cold Feet|Last-minute doubts and a lot of opinions.|romance,family|rayna,deacon,maddie',
'I Do|Rayna and Deacon get married.|wedding,opry|rayna,deacon,maddie,daphne',
'A Fall|Jeff Fordham dies after a fall, and Juliette was there.|grief,scandal|juliette',
'The Fallout|Nobody knows the full story, and everybody has a theory.|press,scandal|juliette',
'Daphne\'s Big Shot|Daphne wants to sing on TV.|family,fame|daphne,maddie',
'Studio Time|Records are getting made all over town.|studio,write|scarlett,gunnar',
'Emancipation|Maddie files for emancipation so she can sign her own deal.|family,label|maddie,rayna',
'Sides|The family takes sides.|family,friend|maddie,deacon,rayna',
'Hitmakers|Everybody is chasing the same #1.|chart,release|juliette,rayna',
'Holding Pattern|A week of waiting for news that might change everything.|crisis|juliette,avery',
'Brave|Rayna speaks up about a predatory producer.|press,social|rayna',
'The Letter|Rayna\'s open letter is everywhere.|press,friend|rayna,maddie',
'Before Takeoff|Juliette gets on a plane.|tour,family|juliette,avery',
'Mayday|The season ends with Juliette\'s plane missing. #FindJuliette|crisis,social|juliette,avery'],
['Survivor|Juliette survived the crash, badly hurt.|crisis,friend|juliette,avery',
'The Billionaire|Tech billionaire Zach Welles arrives with his eye on Highway 65.|label,money|zach,rayna',
'A New Investor|Zach has big ideas and bigger money.|label,fame|zach,rayna',
'Healing|A long road back for Juliette.|crisis,family|juliette,avery',
'Talent Show|A TV talent show is looking for the next big thing.|fame,social|daphne,maddie',
'Songs for Healing|Everybody is writing about what they\'ve been through.|write,grief|scarlett,gunnar',
'The Stalker|Someone is obsessed with Rayna, and they\'re getting closer.|crisis,press|rayna,deacon',
'The Accident|A car crash on a rainy road.|crisis,family|rayna,deacon,maddie',
'Goodbye, Queen|Rayna Jaymes dies. Nashville mourns.|grief,family|deacon,maddie,daphne',
'The Funeral|The whole town comes to say goodbye.|grief,opry|deacon,maddie,daphne,juliette',
'Faith|Juliette, still recovering, turns to faith.|friend,sober|juliette',
'Picking Up the Pieces|Life after loss.|grief,family|deacon,maddie',
'Back on Stage|The first show after everything.|tour,fame|deacon,scarlett',
'A New Voice|Somebody new catches Deacon\'s ear.|write,friend|deacon,jessie',
'Jessie|Deacon is spotted with songwriter Jessie Caine.|romance|deacon,jessie',
'Label Life|Highway 65 without Rayna.|label|deacon,maddie',
'Sisters|Maddie and Daphne lean on each other.|family|maddie,daphne',
'The Bluebird Again|Back to where it all started.|bluebird,write|scarlett,gunnar',
'Charts and Hearts|Singles, breakups and a big week on the radio.|chart,romance|juliette,will',
'The Showcase|A showcase that could change somebody\'s life.|bluebird,label|maddie,daphne',
'Awards Again|Another red carpet.|award|juliette,will',
'Holding On|The season ends with everybody holding on.|friend,family|deacon,juliette'],
['Fresh Start|A new year, and new beginnings.|write,friend|deacon,juliette',
'Old Wounds|Old hurts come back up.|family,friend|maddie,deacon',
'Custody|Jessie Caine is in a nasty custody battle with her ex.|family,crisis|jessie,brad',
'The Movement|Juliette joins a spiritual group called the Movement.|friend,scandal|juliette',
'Doubts|Something about the Movement feels wrong.|friend,crisis|juliette,avery',
'Breaking Free|Juliette walks away.|friend,press|juliette',
'The Fight|Deacon gets into a fight with Jessie\'s ex, Brad.|rival,crisis|deacon,brad',
'Fallout|Headlines, lawyers and regret.|press,scandal|deacon',
'New Music|Everyone is making the best music of their lives.|studio,write|scarlett,gunnar,juliette',
'Maddie\'s Trouble|Maddie is drinking and fighting with Deacon.|family,sober|maddie,deacon',
'Making Up|Families fight. Families make up.|family,friend|maddie,deacon,daphne',
'Final Tour|One more run on the road.|tour,fame|juliette,will',
'Daphne\'s Song|Daphne finds her own voice.|family,write|daphne',
'The Big Night|Everybody\'s big night, all at once.|award,fame|juliette,scarlett',
'Almost Home|The story is almost over.|family,opry|deacon,maddie',
'Sing It Home|The series finale: Daphne signs, Maddie moves out, and the family plays the Opry.|opry,family,duet|deacon,maddie,daphne,juliette']];
const epData=(s,e)=>{const r=(EPISODES[s-1]||[])[e-1];if(!r)return null;const[t,x,tags,cast]=r.split('|');return{s,e,t,x,tags:tags.split(','),cast:cast.split(',')}};

// ======================= THE CHALLENGE LIBRARY =======================
// [roles ('*' for everyone, or character ids; 'me' is a newcomer), text, type, params]   {A} and {B} are cast members
const CHL={
 bluebird:[['*','Play the Bluebird and score 70+','gig',{venue:'bluebird',score:70}],['scarlett','Get through a Bluebird set without freezing (60+)','gig',{venue:'bluebird',score:60}],['deacon','Play a stripped-down Bluebird set (75+)','gig',{venue:'bluebird',score:75}],['*','Write a song with {A} for the round','cowrite',{}],['*','Write a heartbreak song worth playing in the round','write',{theme:'heartbreak'}],['me','Get noticed: play two shows this episode','gigs',{n:2}],['juliette','Prove you can play a listening room: Bluebird 70+','gig',{venue:'bluebird',score:70}]],
 duet:[['*','Sing a live duet with {A}','duet',{}],['*','Write a song with {A}','cowrite',{}],['*','Grow closer to {A} (+8)','rel',{n:8}],['rayna','Find the harmony with {A}: a live duet','duet',{}],['scarlett','Sing with {A} and let the room feel it','duet',{}]],
 rival:[['*','Outplay {A}: score 75+ at a show','gig',{minCap:300,score:75}],['*','Keep your cool around {A}: end the week under 50 stress','calm',{n:50}],['*','Win {A} over (+6)','rel',{n:6}],['juliette','Steal the spotlight: make headlines twice','news',{n:2}],['rayna','Show them who the queen is: play to 2,000+ people','gig',{minCap:2000,score:65}],['me','Get people talking: post twice and play a show','post',{n:2}]],
 label:[['me','Get a label to notice: play a 400+ room','gig',{minCap:400,score:60}],['*','Earn $15K this episode','earn',{n:15000}],['rayna','Make a power move: sign a deal, an artist or a publisher','deal',{}],['*','Take a meeting on Music Row (visit Music Row)','visit',{place:'musicrow'}],['*','Record a song your label can sell','record',{n:1}],['juliette','Remind the label who pays the bills: chart a single in the Top 20','chart',{pos:20}]],
 tour:[['*','Play a show for 400+ people','gig',{minCap:400,score:60}],['*','Rehearse before the road','reh',{}],['*','Keep your voice above 50','voice',{n:50}],['*','Sell some merch: earn $8K','earn',{n:8000}],['gunnar','Survive the van: play two shows','gigs',{n:2}]],
 scandal:[['*','Keep the heat under 45','lowheat',{n:45}],['*','Tell your side: do an interview or promotion','promo',{n:1}],['*','Post something honest','post',{n:1}],['juliette','Ride out the storm: don\'t let your fans drop (win fans)','fans',{p:.01}],['will','Protect the people you love: +6 with {A}','rel',{n:6}]],
 press:[['*','Make the news (twice)','news',{n:2}],['*','Do an interview or a radio tour','promo',{n:1}],['*','Keep the heat under 50','lowheat',{n:50}],['*','Post twice','post',{n:2}]],
 romance:[['*','Spend real time with {A} (+6 romance)','rom',{n:6}],['*','Have a real conversation with {A}','talk',{}],['*','Write a love song','write',{theme:'love'}],['deacon','Tell {A} the truth: have a real conversation','talk',{}],['scarlett','Write a song about how you feel','write',{theme:'love'}]],
 family:[['*','Have a family dinner or a porch night','dinner',{}],['*','Have a real talk with {A}','talk',{}],['*','End the week under 45 stress','calm',{n:45}],['*','Write a song about family','write',{theme:'family'}],['rayna','Be there for your girls: +6 with {A}','rel',{n:6}],['deacon','Show up for {A} (+6)','rel',{n:6}]],
 studio:[['*','Record a song','record',{n:1}],['*','Record a song with 70+ production','recq',{prod:70}],['*','Rehearse or practice your instrument','practice',{}],['avery','Produce something great: record with 75+ production','recq',{prod:75}],['juliette','Fight for your sound: record a song','record',{n:1}]],
 write:[['*','Write a new song','writen',{n:1}],['*','Write a song with {A}','cowrite',{}],['*','Write two songs this episode','writen',{n:2}],['gunnar','Write the truest song you\'ve got (heartbreak or redemption)','write',{theme:'redemption'}],['deacon','Write a song that hurts (heartbreak)','write',{theme:'heartbreak'}],['scarlett','Turn a poem into a song (write one)','writen',{n:1}]],
 chart:[['*','Get a single into the Top 20','chart',{pos:20}],['*','Release a single','release',{}],['*','Work radio: do a radio tour','promo',{n:1,k:'radio'}],['*','Pitch to playlists and land one','playlist',{}],['rayna','Prove you\'ve still got it: Top 10 single','chart',{pos:10}]],
 release:[['*','Release a single','release',{}],['*','Get a single into the Top 30','chart',{pos:30}],['*','Pitch a song to playlists and land one','playlist',{}]],
 opry:[['*','Play the Opry or the Ryman (70+)','gig',{venue:['opry','ryman'],score:70}],['*','Play your biggest room yet (70+)','gig',{minCap:900,score:70}],['*','Rehearse before the big night','reh',{}],['deacon','Stand in the circle with {A}: a live duet','duet',{}]],
 award:[['*','Look the part: debut a new look','look',{}],['*','Make the news twice','news',{n:2}],['*','Win new fans','fans',{p:.02}],['juliette','Own the red carpet: make headlines twice','news',{n:2}]],
 grief:[['*','Write a song for someone you lost','write',{theme:'family'}],['*','Be there for {A} (+8)','rel',{n:8}],['*','Take care of yourself: end the week under 55 stress','calm',{n:55}],['deacon','Hold your girls together: +8 with {A}','rel',{n:8}],['*','Sit with {A}: a real conversation','talk',{}]],
 sober:[['*','Stay sober all episode','sober',{}],['*','Go to a meeting or therapy','care',{}],['*','End the week under 50 stress','calm',{n:50}],['deacon','One day at a time: stay sober and go to a meeting','sober',{}],['juliette','Don\'t become your mother: stay sober','sober',{}]],
 crisis:[['*','Be there for {A} (+10)','rel',{n:10}],['*','Keep it together: end the week under 60 stress','calm',{n:60}],['*','The show goes on: play a show anyway','gigs',{n:1}],['*','Have a real conversation with {A}','talk',{}]],
 money:[['*','Earn $20K this episode','earn',{n:20000}],['*','Sell a song to a star (get a cut)','cut',{}],['*','Write a song you could sell','writen',{n:1}]],
 friend:[['*','Help {A}: have a real conversation','talk',{}],['*','Grow closer to {A} (+8)','rel',{n:8}],['*','Write a song with {A}','cowrite',{}],['will','Lean on {A} (+6)','rel',{n:6}]],
 charity:[['*','Give back: a benefit show or a donation','charity',{}],['*','Play a show for a good cause','gigs',{n:1}],['*','Sing with {A} for the cause','duet',{}]],
 social:[['*','Post three times','post',{n:3}],['*','Go live for your fans','live',{}],['*','Win new followers: post and play a show','post',{n:2}],['layla','Out-post your rival: post three times','post',{n:3}]],
 fame:[['*','Win new fans','fans',{p:.025}],['*','Get on a playlist','playlist',{}],['*','Make the news','news',{n:1}],['*','Play to 900+ people','gig',{minCap:900,score:60}]],
 wedding:[['*','Be there for {A} (+6)','rel',{n:6}],['*','Write a love song for the occasion','write',{theme:'love'}],['*','Sing at the reception: play a show','gigs',{n:1}]]};

// ======================= PICKING CHALLENGES =======================
const CH_CAT={write:'pen',writen:'pen',cowrite:'pen',gig:'stage',gigs:'stage',rel:'people',talk:'people',rom:'people',duet:'people',news:'press',promo:'press',post:'press',lowheat:'press',live:'press',record:'studio',recq:'studio',release:'radio',chart:'radio',playlist:'radio',calm:'self',sober:'self',care:'self',voice:'self',earn:'money',cut:'money',reh:'craft',practice:'craft',dinner:'home',fans:'buzz',look:'buzz'};
function chFeasible(ty,p,A){if(['duet','cowrite','rel','rom','talk'].includes(ty)&&!A)return false;if(ty==='duet'&&!(CHARS[A]&&CHARS[A].singer))return false;if(ty==='gig'){if(p.venue){const vs=[].concat(p.venue).map(id=>VENUES.find(v=>v.id===id)).filter(Boolean);return vs.some(v=>venueOK(v)&&!locked(gigReq(v)))}if(p.minCap)return VENUES.some(v=>v.cap>=p.minCap&&venueOK(v)&&!locked(gigReq(v)))}if(ty==='cowrite'&&locked(REQ.cowrite()))return false;if(ty==='sober'&&!(S.add&&S.add.sub)&&!S.add.used)return chance(.5);if(ty==='record'||ty==='recq')return S.songs.some(s=>s.st==='written')||true;if(ty==='release')return S.songs.some(s=>['recorded','written'].includes(s.st));if(ty==='chart')return charting().length>0||S.songs.some(s=>s.st==='recorded');if(ty==='playlist')return released().length>0;if(ty==='cut')return S.songs.some(s=>s.st==='written'&&fq(s)>=55);if(ty==='promo'&&p.k==='radio')return!locked(REQ.radio());if(ty==='live')return!locked(REQ.live());return true}
function buildEp(s,e){const d=epData(s,e);if(!d)return null;const r=seedRand(`ep${s}.${e}.${S.char}.${S.name}`);const avail=d.cast.filter(k=>has(k)&&k!==S.char&&CHARS[k]);const recent=(S.showLog||[]).slice(-3).flatMap(x=>x.kinds||[]);const lastMainCat=CH_CAT[((S.showLog||[]).slice(-1)[0]||{}).mainTy]||null;const used=new Set();const out=[];
 const pickFrom=(tag)=>{const L=(CHL[tag]||[]).filter(v=>v[0]==='*'||v[0].split(',').includes(S.char));const mine=L.filter(v=>v[0]!=='*');const ordered=(mine.length&&r()<.7?mine:[]).concat(L.slice().sort(()=>r()-.5));for(const[,text,ty,p]of ordered){let A=avail[Math.floor(r()*avail.length)]||null;if(ty==='rom'){A=avail.filter(k=>canRomance(k)).sort((a,b)=>R(b).r-R(a).r)[0]||null}else if(tag==='rival'){A=avail.slice().sort((a,b)=>R(a).a-R(b).a)[0]||A}const B=avail.find(k=>k!==A)||null;const key=ty+(p.venue||p.theme||'');const cat=CH_CAT[ty]||ty;if(used.has(cat)||recent.includes(key)&&r()<.75||(lastMainCat===cat&&!out.length&&r()<.8))continue;if(!chFeasible(ty,p,A))continue;used.add(cat);return{text:text.replace('{A}',A?fullnm(A):'').replace('{B}',B?fullnm(B):''),ty,p:Object.assign({},p,{k:p.k||A}),kind:key,tag}}return null};
 for(const t of d.tags){const c0=pickFrom(t);if(c0)out.push(c0);if(out.length>=3)break}
 const extra=shuffle(Object.keys(CHL));while(out.length<3&&extra.length){const c0=pickFrom(extra.pop());if(c0)out.push(c0)}
 if(out[0])out[0].main=1;return{s,e,t:d.t,x:d.x,cast:avail,ch:out,start:epSnap(),log:{gigs:[],talks:[],posts:0,promo:0,visits:[],duets:[],dinners:0,care:0,practice:0,live:0,news:0,looks:0}}}
function epSnap(){const rel={},rom={};for(const k in S.rel){rel[k]=S.rel[k].a;rom[k]=S.rel[k].r}return{wk:S.week,fans:S.fans,money:S.money,rel,rom,written:S.stats.written,rec:S.songs.filter(s=>['recorded','single'].includes(s.st)).length,recIds:S.songs.filter(s=>['recorded','single'].includes(s.st)).map(s=>s.id),singles:S.songs.filter(s=>s.st==='single').length,label:S.label&&S.label.id,roster:S.lab?S.lab.roster.length:0,pdeal:!!(S.pdeal),cuts:(S.cuts||[]).length,pl:S.songs.reduce((a,s)=>a+(s.pl||[]).length,0),charity:S.charity||0,dep:S.add?S.add.dep:0,used:0}}

// ======================= CHECKING PROGRESS =======================
function chProg(c0){const E=S.ep,L=E.log,st=E.start,p=c0.p;const songsNew=S.songs.filter(s=>(s.wk||0)>=st.wk);switch(c0.ty){
 case'gig':{const ok=L.gigs.filter(g=>(!p.venue||[].concat(p.venue).includes(g.vid))&&(!p.minCap||g.cap>=p.minCap));const best=Math.max(0,...ok.map(g=>g.sc));return clamp(best/(p.score||1),0,1)}
 case'gigs':return clamp(L.gigs.length/(p.n||1),0,1);
 case'write':return songsNew.some(s=>s.theme===p.theme||(p.theme==='family'&&['family','faith'].includes(s.theme))||(p.theme==='redemption'&&['redemption','heartbreak'].includes(s.theme)))?1:0;
 case'writen':return clamp((S.stats.written-st.written)/(p.n||1),0,1);
 case'cowrite':return songsNew.some(s=>s.co===p.k)?1:0;
 case'record':return clamp((S.songs.filter(s=>['recorded','single'].includes(s.st)).length-st.rec)/(p.n||1),0,1);
 case'recq':return S.songs.some(s=>['recorded','single'].includes(s.st)&&(s.prod||0)>=p.prod&&!(st.recIds||[]).includes(s.id))?1:0;
 case'release':return S.songs.filter(s=>s.st==='single').length>st.singles?1:0;
 case'chart':{const b=Math.min(99,...charting().map(s=>s.pos||99));return b<=p.pos?1:clamp((41-b)/(41-p.pos),0,.95)}
 case'rel':return clamp(((S.rel[p.k]?S.rel[p.k].a:0)-(st.rel[p.k]||0))/p.n,0,1);
 case'rom':return clamp(((S.rel[p.k]?S.rel[p.k].r:0)-(st.rom[p.k]||0))/p.n,0,1);
 case'talk':return L.talks.includes(p.k)?1:0;
 case'duet':return L.duets.includes(p.k)||S.songs.some(s=>s.duet===p.k&&s.st==='single'&&(s.rel||0)>=st.wk)?1:0;
 case'calm':return S.stress<=p.n?1:clamp(1-(S.stress-p.n)/40,0,.9);
 case'lowheat':return S.heat<=p.n?1:clamp(1-(S.heat-p.n)/40,0,.9);
 case'voice':return(S.voice??80)>=p.n?1:clamp((S.voice??80)/p.n,0,.9);
 case'fans':{const need=Math.max(300,Math.round(st.fans*p.p));return clamp((S.fans-st.fans)/need,0,1)}
 case'earn':return clamp((S.money-st.money)/p.n,0,1);
 case'post':return clamp(L.posts/(p.n||1),0,1);
 case'promo':return clamp(L.promo/(p.n||1),0,1);
 case'news':return clamp(L.news/(p.n||1),0,1);
 case'reh':return(S.lastReh??-99)>=st.wk?1:0;
 case'practice':return L.practice>0||(S.lastReh??-99)>=st.wk?1:0;
 case'visit':return L.visits.includes(p.place)?1:0;
 case'deal':return(S.label&&S.label.id)!==st.label||(S.lab&&S.lab.roster.length>st.roster)||(!!S.pdeal&&!st.pdeal)?1:0;
 case'dinner':return L.dinners>0?1:0;
 case'care':return L.care>0?1:0;
 case'sober':return(S.add?S.add.dep:0)<=st.dep+1&&!L.drank?1:0;
 case'cut':return(S.cuts||[]).length>st.cuts?1:0;
 case'playlist':return S.songs.reduce((a,s)=>a+(s.pl||[]).length,0)>st.pl?1:0;
 case'charity':return(S.charity||0)>st.charity?1:0;
 case'live':return L.live>0?1:0;
 case'look':return L.looks>0?1:0}return 0}
// logging what you do
(function(){const _p=window.perfScore;window.perfScore=function(m){const v=_p(m);UI.lastPerfV=v;return v}})();
(function(){const _gr=window.gigResult;window.gigResult=function(v,mini,song,opt){const r=_gr(v,mini,song,opt);if(S.ep&&v)S.ep.log.gigs.push({vid:v.id,cap:v.cap||0,sc:UI.lastPerfV||0});return r}})();
const epLog=(k,v)=>{if(!S||!S.ep)return;const L=S.ep.log;if(Array.isArray(L[k]))L[k].push(v);else L[k]=(L[k]||0)+1};
[['realTalk','talks',a=>a[0]],['familyDinner','dinners'],['porchNight','dinners'],['practice','practice'],['goLive','live'],['interview','promo'],['lateNight','promo'],['callIn','promo'],['visitPlace','visits',a=>a[0]]].forEach(([fn,k,arg])=>{const o=window[fn];if(!o)return;window[fn]=function(...a){const r=o.apply(this,a);epLog(k,arg?arg(a):1);return r}});
(function(){const o=window.doPromo;window.doPromo=function(k){const r=o(k);epLog('promo');return r}})();
(function(){const o=window.doLife;window.doLife=function(k){const r=o(k);if(['aa','therapy'].includes(k))epLog('care');if(k==='drink'||k==='party')S.ep&&(S.ep.log.drank=1);return r}})();
(function(){const o=window.post;window.post=function(who,...a){const r=o(who,...a);if(who==='me')epLog('posts');return r}})();
(function(){const o=window.news;window.news=function(t,k){const r=o(t,k);if(typeof t==='string'&&S&&S.name&&t.includes(S.name))epLog('news');return r}})();
(function(){const o=window.styleClick;if(o)window.styleClick=function(k,v){const r=o(k,v);if(k==='debut')epLog('looks');return r}})();
(function(){const o=window.liveShow;if(o)window.liveShow=function(opts){if(UI.duetWith)epLog('duets',UI.duetWith);return o(opts)}})();

// ======================= EPISODES: OPENING, CREDITS, CONSEQUENCES =======================
const SOFT={gig:'The industry people in the room left early.',calm:'You snapped at everyone this week. People noticed.',rel:'They felt like you weren\'t there for them.',rom:'The spark cooled a little.',talk:'Some things went unsaid.',duet:'The moment passed. Somebody else sang that harmony.',write:'The song didn\'t come.',writen:'Your notebook stayed empty.',cowrite:'The co-write fell through.',record:'The studio sat empty.',recq:'The record didn\'t sound like you wanted.',release:'Radio moved on without you.',chart:'Your single stalled.',lowheat:'The tabloids smelled blood.',news:'Nobody was talking about you.',promo:'Your side of the story never got told.',post:'Your fans wondered where you went.',fans:'The buzz faded.',earn:'Money got tight.',sober:'The bottle won this round.',care:'You skipped the meeting.',dinner:'An empty chair at the table.'};
function softHit(c0){const k=c0.p.k;switch(c0.ty){case'rel':case'talk':case'rom':case'duet':case'cowrite':if(k&&has(k))FX.a(k,-3);break;case'calm':FX.st(4);break;case'lowheat':case'news':case'promo':FX.heat(2);break;case'chart':case'release':case'fans':case'post':FX.f(-S.fans*.005);break;case'sober':FX.dep(2);break;default:FX.rep(-1)}}
function startEpisode(silent){if(!S.showMode||!S.story||!S.story.on)return;const s=seasonOf(S.week);if(s>6||inSummer(S.week)){S.ep=null;return}const e=epOf(S.week);if(S.ep&&S.ep.s===s&&S.ep.e===e)return;S.ep=buildEp(s,e);if(!S.ep)return;
 const ci=UI.queue.findIndex(q=>/^ep_cred/.test(q.id));UI.queue.splice(ci+1,0,{id:'ep_open'+s+'_'+e,ev:{sys:1,story:1,id:'ep_open'+s+'_'+e,tag:`Season ${s} · Episode ${e}`,set:'stage',mood:'happy',cast:S.ep.cast.slice(0,3),title:S.ep.t,text:`${esc(S.ep.x)}<div class="ep-chs">${S.ep.ch.map(c0=>`<p>${c0.main?'⭐ <b>Main:</b> ':'☆ '}${esc(c0.text)}</p>`).join('')}</div>`,ch:[c('Roll the episode','',()=>'')]}})}
function endEpisode(){const E=S.ep;if(!E)return;const res=E.ch.map(c0=>({t:c0.text,ok:chProg(c0)>=1,main:c0.main,c0}));const stars=res.filter(r=>r.ok).length;
 res.forEach(r=>{if(!r.ok)softHit(r.c0)});FX.f(stars*(200+S.fans*.004));FX.m(stars*(800+fame()*60));if(stars===3){S.perkPts=(S.perkPts||0)+1;S.xp=(S.xp||0)+60}
 S.showLog=S.showLog||[];S.showLog.push({s:E.s,e:E.e,t:E.t,stars,kinds:E.ch.map(c0=>c0.kind),mainTy:E.ch[0]&&E.ch[0].ty,wk:S.week});
 const nxS=seasonOf(S.week),nxE=epOf(S.week);const next=inSummer(S.week)?epData(E.s+1,1):epData(nxS,nxE);const finale=E.e===EPS[E.s-1];let season='';
 if(finale){const L=S.showLog.filter(x=>x.s===E.s);const tot=L.reduce((a,x)=>a+x.stars,0),max=L.length*3;const pct=max?tot/max:0;S.showSeasons=S.showSeasons||{};S.showSeasons[E.s]={tot,max,grade:pct>=.9?'A+':pct>=.8?'A':pct>=.65?'B':pct>=.5?'C':'D'};if(pct>=.8){ach('showS'+E.s);S.flags['showS'+E.s]=1}const best=L.slice().sort((a,b)=>b.stars-a.stars)[0];season=`<div class="seasonrep"><span class="eyebrow">Season ${E.s} report card</span><b class="grade">${S.showSeasons[E.s].grade}</b><p>${tot} of ${max} stars${best?` · best episode: "${esc(best.t)}"`:''}${pct>=.8?' · 🏆 a new outfit unlocked in Style':''}</p></div>`}
 UI.queue.unshift({id:'ep_cred'+E.s+'_'+E.e,ev:{sys:1,story:1,id:'ep_cred'+E.s+'_'+E.e,tag:`Season ${E.s} · Episode ${E.e} · Credits`,set:'stage',mood:stars>=2?'happy':'sad',title:`"${E.t}" ${'★'.repeat(stars)}${'☆'.repeat(3-stars)}`,text:`<div class="ep-res">${res.map(r=>`<p class="${r.ok?'pos':'neg'}">${r.ok?'✓':'✗'} ${r.main?'<b>Main:</b> ':''}${esc(r.t)}${r.ok?'':` <small>${esc(SOFT[r.c0.ty]||'It didn\'t happen this time.')}</small>`}</p>`).join('')}</div>${season}${next?`<div class="nexton"><b>Next time on Nashville…</b><span>${esc(next.x)}</span></div>`:''}`,ch:[c(stars===3?'A perfect episode':'Next episode','',()=>'')]}});S.ep=null}
(function(){const _ew=window.endWeek;window.endWeek=function(silent){if(!S.showMode)return _ew(silent);const before=S.ep;_ew(silent);if(before&&(inSummer(S.week)||seasonOf(S.week)!==before.s||epOf(S.week)!==before.e))endEpisode();startEpisode(silent)}})();

// ======================= THE EPISODE CARD, STATS, MODE SELECT =======================
function epCard(){if(!S.showMode)return'';const E=S.ep;if(!E)return`<section class="card epcard nofold"><span class="eyebrow">📺 Show mode</span><h3>Summer hiatus</h3><p class="small muted">The show is off the air until the next season. Skip ahead when you're ready.</p></section>`;
 return`<section class="card epcard nofold"><span class="eyebrow">📺 Season ${E.s} · Episode ${E.e}</span><h3>"${esc(E.t)}"</h3><p class="small muted">${esc(E.x)}</p>${E.ch.map(c0=>{const p=chProg(c0);return`<div class="epch ${p>=1?'done':''}"><span>${p>=1?'✓':c0.main?'⭐':'☆'}</span><div><b>${c0.main?'Main: ':''}${esc(c0.text)}</b><i class="pbar"><b style="width:${Math.round(p*100)}%"></b></i></div></div>`}).join('')}<p class="small faint">Finish them before the episode ends. Each one is a star.</p></section>`}
function showStats(){const L=S.showLog||[];const tot=L.reduce((a,x)=>a+x.stars,0);return`<section class="card"><span class="eyebrow">Show mode</span><h2>📺 Your run</h2><div class="mus-stats"><div><b>${L.length}</b><span>episodes</span></div><div><b>${tot}</b><span>stars</span></div><div><b>${L.length?Math.round(tot/(L.length*3)*100):0}%</b><span>completion</span></div><div><b>${L.filter(x=>x.stars===3).length}</b><span>perfect episodes</span></div><div><b>${Object.keys(S.showSeasons||{}).length}</b><span>seasons done</span></div></div>${Object.entries(S.showSeasons||{}).map(([s,v])=>`<div class="songrow"><div><b>Season ${s}: ${v.grade}</b><small>${v.tot}/${v.max} stars</small></div></div>`).join('')}<h4>Episode by episode</h4>${L.slice().reverse().map(x=>`<div class="songrow"><div><b>S${x.s} E${x.e} · "${esc(x.t)}"</b></div><span class="spot">${'★'.repeat(x.stars)}${'☆'.repeat(3-x.stars)}</span></div>`).join('')||'<p class="small faint">Your first episode is under way.</p>'}</section>`}
for(let s=1;s<=6;s++)ACH['showS'+s]=[`Season ${s}, nailed`,`Get 80% of the stars in season ${s} of Show mode.`];
if(typeof UNLOCKS!=='undefined')UNLOCKS.push(['showfit','📺 The season finale look','Ace a season of Show mode',()=>[1,2,3,4,5,6].some(s=>S.flags['showS'+s]),{outfit:'#c9a227',top:'jacket',hat:'#1d1d1d'}]);
(function(){const _cm=window.chooseMode;window.chooseMode=function(){_cm();const fp=$('[data-mode="free"]');if(fp&&!$('[data-showmode]'))fp.insertAdjacentHTML('afterend',`<button class="newcard modepick alt showpick" data-showmode="1"><span class="newcard-pt">${pt('deacon','happy')}</span><span><span class="eyebrow">New</span><b>Show mode</b><small>Play the show itself, episode by episode. Every episode has a main challenge and side challenges that mirror what happens in it, with your own version for whoever you play. Earn up to three stars an episode and a report card every season.</small></span></button>`);const b=$('[data-showmode]');if(b)b.onclick=()=>{UI.showMode=1;const s=$('[data-mode="story"]');if(s)s.click()};const bk=$('#mback');if(bk){const o=bk.onclick;bk.onclick=()=>{UI.showMode=0;o&&o()}}}})();
(function(){const _ng=window.newGame;window.newGame=function(cfg){_ng(cfg);if(UI.showMode){S.showMode=1;UI.showMode=0;S.flags.noRecap=0;S.ep=null;startEpisode();save();render();setTimeout(()=>runQueue(),600)}}})();
(function(){const _h=window.homePanes;if(_h)window.homePanes=function(v){if(S.showMode&&!v.querySelector('.epcard')){const en=v.querySelector(':scope > .energy-card')||v.querySelector(':scope > .hero3');en&&en.insertAdjacentHTML('beforebegin',epCard())}return _h(v)}})();
(function(){const _r=window.render;window.render=function(){_r();document.body.classList.toggle('showmode',!!(S&&S.showMode))}})();
SECTION_NAME['life:show']='Show mode';
VIEWS.more=(function(){const _mo=VIEWS.more;return function(){let h=_mo();if(S&&S.showMode)h=h.replace('<section class="more-sec">','<section class="more-sec"><h3>Show mode</h3><div class="more-grid"><button class="more-tile" data-goto="life:show"><i>📺</i><span>Your episodes and stars</span></button></div></section><section class="more-sec">');return h}})();
const _lifeSM=VIEWS.life;VIEWS.life=function(){let h=_lifeSM();if(UI.sub.life==='show')h+=showStats();return h};
