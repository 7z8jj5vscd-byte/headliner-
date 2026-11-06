/* The Eras Life: data for the freedom systems. Song structure, ways to do rollout and tour tasks,
   and optional opportunities. Everything here is invented gameplay. It never uses lyrics, never
   puts words in a real person's mouth, and every named outlet, brand, film or artist is invented. */
(function () {
const ER = window.ER;

// Song sections you can arrange. Only the shape of a song, never its words.
ER.SECTIONS = [
  { id:'intro', n:'Intro' }, { id:'verse', n:'Verse' }, { id:'pre', n:'Pre-chorus' }, { id:'chorus', n:'Chorus' },
  { id:'post', n:'Post-chorus' }, { id:'bridge', n:'Bridge' }, { id:'break', n:'Breakdown' }, { id:'solo', n:'Instrumental' },
  { id:'key', n:'Key change' }, { id:'outro', n:'Outro' }
];
ER.SONG_PRESETS = [
  { id:'classic', n:'Classic pop', s:['intro','verse','pre','chorus','verse','pre','chorus','bridge','chorus','outro'] },
  { id:'story', n:'Story song', s:['verse','verse','chorus','verse','chorus','bridge','chorus'] },
  { id:'hook', n:'Hook first', s:['chorus','verse','chorus','verse','chorus','bridge','chorus','chorus'] },
  { id:'ballad', n:'Slow burn', s:['intro','verse','verse','chorus','verse','chorus','bridge','outro'] },
  { id:'anthem', n:'Stadium anthem', s:['intro','verse','pre','chorus','post','verse','pre','chorus','post','bridge','key','chorus'] }
];
ER.TEMPOS = [{ id:'ballad', n:'Ballad' }, { id:'mid', n:'Mid-tempo' }, { id:'up', n:'Up-tempo' }];
ER.MOODS = [{ id:'bright', n:'Bright' }, { id:'bitter', n:'Bittersweet' }, { id:'dark', n:'Dark' }];
ER.LEANS = [{ id:'acoustic', n:'Acoustic' }, { id:'band', n:'Full band' }, { id:'synth', n:'Synths' }, { id:'orch', n:'Strings' }];
// Which tempos, moods and sounds suit each era's mood.
ER.MOOD_FIT = {
  country:{ tempo:['mid','up'], mood:['bright','bitter'], lean:['acoustic','band'] },
  romantic:{ tempo:['mid','ballad'], mood:['bitter','bright'], lean:['band','orch'] },
  pop:{ tempo:['up','mid'], mood:['bright'], lean:['synth','band'] },
  dark:{ tempo:['mid','up'], mood:['dark'], lean:['synth'] },
  quiet:{ tempo:['ballad','mid'], mood:['bitter','dark'], lean:['acoustic','orch'] }
};

// Ways to do a rollout, release or tour task. Each one is optional flavour with its own trade-off.
ER.TASK_STYLES = {
  'pre:video':[
    { n:'A big cinematic video', d:'Expensive, and the internet decodes it for weeks.', fx:{ hype:6, money:-400000, energy:-4 }, r:'The video is the talk of the week.' },
    { n:'A simple performance video', d:'Cheap and quick.', fx:{ hype:3, energy:2 }, r:'Clean, quick, and it looks great.' },
    { n:'Direct it yourself', d:'More work, more personal.', fx:{ hype:5, energy:-7, write:1 }, r:'Your first time calling every shot. Fans can tell.' }],
  'pre:announce':[
    { n:'A midnight social post', d:'Fast, and fans wake up to it.', fx:{ hype:4, heat:2 }, r:'Fans wake up screaming.' },
    { n:'A puzzle of clues first', d:'Fans decode it for a week.', fx:{ hype:7, energy:-3 }, r:'Fans solve it in under a day.' },
    { n:'Announce it live on TV', d:'A big audience at once.', fx:{ hype:5, fans:1, energy:-4 }, r:'Millions see it at the same moment.' }],
  'pre:press':[
    { n:'A big magazine shoot', d:'Glossy and everywhere.', fx:{ hype:3, heat:3 }, r:'The photos run everywhere.' },
    { n:'Shot by a friend', d:'Relaxed and personal.', fx:{ hype:2, team:2 }, r:'The photos feel like you.' }],
  'rel:tv':[
    { n:'Perform the lead single', d:'The safe choice.', fx:{ fans:1 }, r:'A clean performance.' },
    { n:'Debut a deep cut', d:'A risk that fans love.', fx:{ hype:3, heat:2 }, r:'Fans who knew the album lose it.' }],
  'rel:signing':[
    { n:'A signing in a record store', d:'Long lines, real moments.', fx:{ fans:1.5, energy:-5 }, r:'Thousands wait in line.' },
    { n:'Surprise fans at home', d:'Small, and unforgettable for them.', fx:{ fans:1, rep:2, energy:-4 }, r:'A few families get the shock of their lives.' }],
  'rel:posts':[
    { n:'Track-by-track notes', d:'Tell the stories behind the songs.', fx:{ hype:3, energy:-2 }, r:'Fans read every word.' },
    { n:'Keep it mysterious', d:'Let the music talk.', fx:{ heat:2, hype:2 }, r:'The theories start.' }],
  'tp:costume':[
    { n:'A new costume for every act', d:'Stunning and very expensive.', fx:{ money:-1500000, hype:4 }, r:'The wardrobe truck needs its own truck.' },
    { n:'One signature look', d:'Iconic, simple, cheap.', fx:{ hype:2 }, r:'One look everyone will copy.' }],
  'tp:cast':[
    { n:'Hold open auditions', d:'Find new talent.', fx:{ team:3, energy:-4 }, r:'You find dancers nobody has heard of yet.' },
    { n:'Bring back your band', d:'People you trust.', fx:{ team:5 }, r:'Like a family reunion.' }],
  'tp:setlist':[
    { n:'Mostly the new album', d:'A bold statement.', fx:{ hype:3, fans:-.5 }, r:'The new songs get their moment.' },
    { n:'A career-spanning set', d:'Something for everyone.', fx:{ fans:1 }, r:'Every era gets a moment.' },
    { n:'Deep cuts for superfans', d:'Rewarding, but casual fans may drift.', fx:{ rep:1, hype:2, fans:-.3 }, r:'Superfans cannot believe the setlist.' }],
  'fin:master':[
    { n:'Loud, for radio', d:'Punchy on the radio.', fx:{ fans:.5 }, r:'It jumps out of every speaker.' },
    { n:'Warm and dynamic', d:'Critics notice.', fx:{ quality:1 }, r:'It breathes. Reviewers will notice.' }]
};

/* Optional opportunities. They appear on This Week, last a few weeks, and you can ignore them.
   when: 'any', or a list of stages. pub: needs a public life. live: needs in-person events.
   pay: a fee scaled to your career. cost: Time Blocks. */
ER.OPPS = [
  { id:'latenight', t:'A late-night show wants you', x:'The host of an invented late-night show offers a slot next week.', when:'any', pub:1, live:1, ch:[
    { l:'Perform a new song', cost:1, fx:{ fans:1.5, hype:4, energy:-6 }, r:'The clip trends for days.' },
    { l:'Just do the interview and the games', cost:1, fx:{ heat:3, rep:1 }, r:'You are funnier than anyone expected.' },
    { l:'Turn it down', cost:0, fx:{ energy:3 }, r:'Another time.' }] },
  { id:'soundtrack', t:'A song for a film', x:'An animated film (invented) wants an original song for its end credits.', when:'any', ch:[
    { l:'Write something new for it', cost:2, fx:{ write:2, clout:2 }, pay:3, song:1, r:'A new song goes in your notebook, and the studio loves it.' },
    { l:'Offer a song you already have', cost:1, fx:{ clout:1 }, pay:1.5, r:'They take it. Easy money.' },
    { l:'Pass', cost:0, fx:{}, r:'Not this time.' }] },
  { id:'benefit', t:'A benefit concert', x:'Organisers of a charity concert ask you to play.', when:'any', live:1, pub:1, ch:[
    { l:'Headline it', cost:2, fx:{ rep:4, fans:1, energy:-8 }, r:'The night raises a fortune for the cause.' },
    { l:'Donate and send a video', cost:0, fx:{ rep:2 }, pay:-1, r:'Your video message plays on the big screens.' },
    { l:'Decline', cost:0, fx:{}, r:'They understand.' }] },
  { id:'retreat', t:'A songwriting retreat', x:'A friend offers a quiet cabin (invented) for a few days of writing.', when:['none','write','record','promo','rest'], ch:[
    { l:'Go for the whole week', cost:2, fx:{ write:4, energy:8 }, focus:1, r:'You come back with pages of ideas. Your next song will be stronger.' },
    { l:'Just the weekend', cost:1, fx:{ write:2, energy:4 }, r:'Two quiet days and a full notebook.' },
    { l:'Not now', cost:0, fx:{}, r:'Maybe next time.' }] },
  { id:'youngwriter', t:'A young writer sends a demo', x:'A teenage songwriter (invented) sends you a demo and asks for advice.', when:'any', minAge:20, ch:[
    { l:'Write a song together', cost:2, fx:{ write:2, rep:2, clout:1 }, song:1, r:'The song you write together goes in your notebook.' },
    { l:'Send detailed notes', cost:1, fx:{ rep:1 }, r:'They write back to say it changed everything.' },
    { l:'No time', cost:0, fx:{}, r:'You file it away.' }] },
  { id:'cover', t:'A magazine cover', x:'An invented magazine, Northlight, offers a cover story.', when:'any', pub:1, ch:[
    { l:'A long, open interview', cost:1, fx:{ heat:6, fans:1, rep:1 }, r:'The profile is shared everywhere.' },
    { l:'Photos only, no interview', cost:1, fx:{ heat:2, hype:3 }, r:'The cover sells out.' },
    { l:'Decline', cost:0, fx:{ heat:-2 }, r:'A quieter month.' }] },
  { id:'brand', t:'A fashion collaboration', x:'An invented label, Aster & Vale, wants a capsule collection with your name on it.', when:'any', pub:1, minAge:18, ch:[
    { l:'Design it yourself', cost:2, fx:{ energy:-5, fans:.5 }, pay:4, r:'It sells out in an hour.' },
    { l:'License your name', cost:0, fx:{ rep:-1 }, pay:2, r:'The money is good. The clothes are fine.' },
    { l:'Say no', cost:0, fx:{ rep:1 }, r:'Not your style.' }] },
  { id:'viral', t:'A clip of you goes viral', x:'A few seconds of you laughing on stage are everywhere.', when:'any', pub:1, ch:[
    { l:'Lean in and post about it', cost:1, fx:{ fans:1.5, heat:4 }, r:'It becomes a meme you are in on.' },
    { l:'Laugh it off', cost:0, fx:{ rep:1 }, r:'It fades in a week.' }] },
  { id:'leak', t:'An old demo leaks', x:'A rough demo from years ago turns up online.', when:'any', minAge:16, ch:[
    { l:'Release it properly', cost:1, fx:{ fans:1, hype:3 }, song:1, r:'Fans get a finished version, and you get the song back.' },
    { l:'Ask for it to be taken down', cost:0, fx:{ heat:2 }, r:'It disappears, mostly.' },
    { l:'Say nothing', cost:0, fx:{ heat:1 }, r:'It becomes a fan legend.' }] },
  { id:'acoustic', t:'A surprise acoustic set', x:'A small coffee shop near your home has an open mic tonight.', when:'any', live:1, ch:[
    { l:'Walk in and play', cost:1, fx:{ fans:1, energy:-3, rep:1 }, r:'Thirty people will tell this story forever.' },
    { l:'Stay home', cost:0, fx:{ energy:2 }, r:'A quiet night.' }] },
  { id:'teach', t:'A songwriting class', x:'A music school asks you to teach a masterclass.', when:'any', minAge:21, ch:[
    { l:'Teach it in person', cost:1, fx:{ rep:3, write:1, energy:-4 }, r:'The students will remember every word.' },
    { l:'A short video lesson', cost:0, fx:{ rep:1 }, r:'It goes out to every student.' }] },
  { id:'feature', t:'A feature request', x:'A rising star wants you on their single. They are an invented artist in this game.', when:'any', minAge:17, ch:[
    { l:'Say yes', cost:2, fx:{ fans:2, clout:2, energy:-5 }, r:'The single charts, and both fan bases meet.' },
    { l:'Put them on your next album instead', cost:1, fx:{ hype:3, clout:1 }, r:'A duet idea goes on your list.' },
    { l:'Pass', cost:0, fx:{}, r:'Maybe later.' }] },
  { id:'docu', t:'A documentary crew', x:'An invented film company wants to follow you for a year.', when:'any', pub:1, minAge:18, ch:[
    { l:'Full access', cost:1, fx:{ fans:2, heat:5, team:-3 }, r:'Cameras everywhere. It will be a big film.' },
    { l:'Concerts and studio only', cost:1, fx:{ fans:1, heat:1 }, r:'A careful film, on your terms.' },
    { l:'No cameras', cost:0, fx:{ team:2 }, r:'Your team is relieved.' }] },
  { id:'fanproject', t:'Fans made something for you', x:'Fans in one city organised a mural and a singalong.', when:'any', pub:1, ch:[
    { l:'Thank them publicly', cost:0, fx:{ fans:1, rep:1 }, r:'They cry. A lot.' },
    { l:'Turn up in person', cost:1, fx:{ fans:2, energy:-4 }, live:1, r:'Nobody there will ever forget it.' },
    { l:'Send gifts to everyone', cost:0, fx:{ rep:2 }, pay:-.5, r:'Boxes arrive with handwritten notes.' }] },
  { id:'guitar', t:'A vintage guitar', x:'Your guitar tech finds a beautiful old instrument for sale.', when:'any', ch:[
    { l:'Buy it', cost:0, fx:{ write:2 }, pay:-.8, r:'New strings, new songs.' },
    { l:'Borrow it for a week', cost:1, fx:{ write:1 }, r:'You write two ideas on it.' }] },
  { id:'radiohour', t:'Host a radio hour', x:'A station asks you to play an hour of songs you love.', when:'any', minAge:16, ch:[
    { l:'Host it', cost:1, fx:{ clout:2, fans:.5 }, r:'Your picks trend.' },
    { l:'No thanks', cost:0, fx:{}, r:'Another time.' }] },
  { id:'present', t:'Present an award', x:'An invented awards show asks you to present the top prize.', when:'any', pub:1, live:1, ch:[
    { l:'Present it', cost:1, fx:{ heat:3, clout:2 }, r:'Your outfit is all anyone talks about.' },
    { l:'Decline', cost:0, fx:{}, r:'They ask someone else.' }] },
  { id:'podcast', t:'A songwriting podcast', x:'An invented podcast wants a full episode on your craft.', when:'any', minAge:18, ch:[
    { l:'A deep dive, song by song', cost:1, fx:{ rep:2, write:1 }, r:'Songwriters study it.' },
    { l:'A short chat', cost:0, fx:{ rep:1 }, r:'It is lovely.' }] },
  { id:'studioday', t:'A free studio day', x:'A producer (invented) has a cancellation and offers you the room.', when:['write','record','none'], ch:[
    { l:'Take the day', cost:1, fx:{ write:1 }, focus:1, r:'You find a sound. Your next song will be stronger.' },
    { l:'Pass', cost:0, fx:{}, r:'Someone else takes it.' }] },
  { id:'listening', t:'A secret listening party', x:'You could play the new album early for a small group.', when:['pre','finish'], live:1, ch:[
    { l:'Invite fans', cost:2, fx:{ hype:7, fans:1, energy:-5 }, r:'They keep the secret, mostly.' },
    { l:'Industry only', cost:1, fx:{ clout:2, hype:2 }, r:'The buzz goes round the industry.' },
    { l:'Keep it locked away', cost:0, fx:{}, r:'Nobody hears it until release day.' }] },
  { id:'remix', t:'A remix offer', x:'An invented DJ wants to remix a single.', when:['promo','tourprep','tour'], ch:[
    { l:'Yes', cost:0, fx:{ hype:3, fans:.5 }, r:'The remix takes over the clubs.' },
    { l:'No', cost:0, fx:{}, r:'The original stays the original.' }] },
  { id:'extend', t:'One more night', x:'A city on the tour sold out in minutes. The promoter asks for another night.', when:['tour'], live:1, ch:[
    { l:'Add the night', cost:1, fx:{ fans:1, energy:-6 }, pay:2, r:'Another sold-out night.' },
    { l:'Protect your voice', cost:0, fx:{ energy:3 }, r:'Your vocal coach is grateful.' }] },
  { id:'merch', t:'Tour merch', x:'The merch team has two directions for the tour.', when:['tourprep','tour'], ch:[
    { l:'Bold and limited', cost:0, fx:{ hype:2 }, pay:1, r:'Lines wrap round the stadium.' },
    { l:'Classic and cheaper', cost:0, fx:{ rep:1 }, pay:.6, r:'Every fan can afford a shirt.' }] },
  { id:'holiday', t:'A holiday special', x:'A network wants you on its holiday special.', when:'any', weeks:[46, 51], pub:1, live:1, ch:[
    { l:'Sing a holiday classic', cost:1, fx:{ fans:1 }, pay:1, r:'Families watch together.' },
    { l:'Pass', cost:0, fx:{}, r:'Holidays at home.' }] },
  { id:'gamecameo', t:'A video game cameo', x:'An invented game studio wants your song in a dance game.', when:'any', minAge:16, ch:[
    { l:'License a song', cost:0, fx:{ fans:.8 }, pay:1, r:'Kids learn the choreography.' },
    { l:'Pass', cost:0, fx:{}, r:'No thanks.' }] },
  { id:'wildcard', t:'A genre experiment', x:'A producer friend dares you to try a style you have never tried.', when:['write','record','none'], ch:[
    { l:'Try it', cost:1, fx:{ write:2, genre:4 }, song:1, r:'It is strange and wonderful. It goes in your notebook.' },
    { l:'Stick to what you know', cost:0, fx:{}, r:'Maybe one day.' }] }
];
})();
