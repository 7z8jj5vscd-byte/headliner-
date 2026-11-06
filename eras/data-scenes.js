/* The Eras Life: little scenes that give everyday actions an outcome. They are invented moments
   around the career (never claims about real people), add small effects, and are kept in the
   Scrapbook. They never change the real event track. {nm} is the era, {song} a song title. */
(function () {
const ER = window.ER;

// Each scene: t (title), x (what happens), set (3D set), with (team figure), ch (choices with fx and result).
ER.SCENES = {
 magazine:[
  { t:'Cover shoot', x:'The photographer wants a concept for the {nm} cover story. The editor is watching.', set:'press', with:'publicist',
    ch:[{ l:'Playful: laugh between shots', fx:{ fans:1, rep:1 }, r:'They run the outtake where you are mid-laugh.' },
        { l:'Elegant: one perfect, still pose', fx:{ rep:2 }, r:'The cover is striking. People frame it.' },
        { l:'Hide an Easter egg in the shoot', fx:{ hype:4, heat:2 }, r:'Fans zoom in on the background for days.' }] },
  { t:'The interview over lunch', x:'The writer keeps steering the conversation toward your love life.', set:'press', with:'publicist',
    ch:[{ l:'Steer back to the music', fx:{ rep:2, heat:-2 }, r:'The piece is about the songs. Rare.' },
        { l:'Make a joke of it', fx:{ fans:1, heat:2 }, r:'Your joke becomes the headline.' },
        { l:'End the interview early', fx:{ heat:5, rep:-1 }, r:'"Guarded," says the profile.' }] }
 ],
 budget:[
  { t:'The budget meeting', x:'Your manager slides the {nm} budget across the table. Something has to give.', set:'studio', with:'manager',
    ch:[{ l:'Spend on the music videos', fx:{ hype:4, money:-50000 }, r:'The videos will look expensive. They are.' },
        { l:'Spend on the live show', fx:{ fans:1, money:-50000 }, r:'The tour will thank you.' },
        { l:'Save it', fx:{ money:30000, team:-1 }, r:'Your accountant smiles. Your team does not.' }] }
 ],
 label:[
  { t:'At the label', x:'Executives want to talk about {nm}. One of them has opinions about the single.', set:'tv', with:'label',
    ch:[{ l:'Play them your pick and stand firm', fx:{ clout:2, team:-1 }, r:'They come around. Mostly.' },
        { l:'Hear them out', fx:{ team:2 }, r:'You find a middle ground.' },
        { l:'Let your manager fight it', fx:{ energy:3, clout:-1 }, r:'You stay out of the room.' }] },
  { t:'The debut meeting', x:'A conference room, a speakerphone and a whiteboard that says "DEBUT." They want to know who you are.', set:'tv', with:'label', early:true,
    ch:[{ l:'Talk about the songs you wrote', fx:{ write:1, clout:2 }, r:'Someone writes "songwriter" on the whiteboard and underlines it.' },
        { l:'Talk about the fans you already have', fx:{ fans:2, clout:1 }, r:'Someone asks for your message-board numbers.' },
        { l:'Play one song, right there', fx:{ clout:3, energy:-2 }, r:'The room goes quiet. Good quiet.' }] }
 ],
 sponsor:[
  { t:'On set for a sponsor', x:'The ad\'s director has a script that does not sound like you.', set:'video', with:'publicist',
    ch:[{ l:'Rewrite your lines', fx:{ rep:2, team:-1 }, r:'The ad sounds like you. The brand is thrilled.' },
        { l:'Say it as written', fx:{ money:20000 }, r:'Professional. Forgettable.' }] }
 ],
 interview:[
  { t:'On air', x:'The host asks the question everyone is wondering about.', set:'tv', with:'publicist',
    ch:[{ l:'Answer honestly', fx:{ rep:2, heat:2 }, r:'Clips of your answer go around.' },
        { l:'Deflect with a smile', fx:{ heat:-1 }, r:'Smooth.' },
        { l:'Tease something new', fx:{ hype:4, heat:3 }, r:'Fans clip the tease and slow it down.' }] }
 ],
 social:[
  { t:'Posting', x:'Your thumb hovers over the post button.', set:'home', with:'family',
    ch:[{ l:'A candid photo from your day', fx:{ fans:1 }, r:'Fans love the messy background.' },
        { l:'A cryptic caption', fx:{ hype:3, heat:2 }, r:'Theories by morning.' },
        { l:'Reply to a fan', fx:{ fans:1, rep:1 }, r:'That fan will tell this story forever.' }] }
 ],
 fanevent:[
  { t:'Meeting fans', x:'A fan is shaking so hard she can barely hold her phone.', set:'press', with:'fan',
    ch:[{ l:'Hug her and take the photo yourself', fx:{ fans:1, rep:1 }, r:'She posts it with fourteen exclamation marks.' },
        { l:'Ask about her favourite song', fx:{ fans:1, write:1 }, r:'She tells you why it got her through a hard year.' }] }
 ],
 network:[
  { t:'A party you did not want to go to', x:'Industry people, small talk, and one legend by the snacks.', set:'awards', with:'manager',
    ch:[{ l:'Talk to the legend', fx:{ clout:2, write:1 }, r:'They give you advice you will quote for years.' },
        { l:'Work the room', fx:{ clout:3, energy:-3 }, r:'Twelve business cards and a headache.' },
        { l:'Leave early and write', fx:{ write:2 }, r:'You finish a verse in the car.' }] }
 ],
 charity:[
  { t:'A visit', x:'You visit a children\'s hospital. A kid asks you to sing her favourite.', set:'home', with:'fan',
    ch:[{ l:'Sing it right there', fx:{ rep:2 }, r:'The nurses film it. You ask them not to post it. They do not.' },
        { l:'Stay and talk all afternoon', fx:{ rep:1, energy:-3 }, r:'You lose track of time.' }] }
 ],
 gig:[
  { t:'The fair', x:'Twenty people, a hay bale stage and a sound system from another decade.', set:'farm', with:'family', early:true,
    ch:[{ l:'Play like it is a stadium', fx:{ fans:2 }, r:'Three people ask your name.' },
        { l:'Try a brand-new song', fx:{ write:1 }, r:'Nobody knows it, and they clap anyway.' }] }
 ],
 rest:[
  { t:'A day off', x:'No alarms. Nothing scheduled.', set:'home', with:'family',
    ch:[{ l:'Bake something', fx:{ energy:2 }, r:'You eat half of it before it cools.' },
        { l:'Rewatch a comfort show', fx:{ energy:2 }, r:'You quote every line.' },
        { l:'Call an old friend', fx:{ team:2 }, r:'Two hours flies by.' }] }
 ],
 // Release week, pre-release, finishing and tour prep items.
 rel_tv:[{ t:'Release-week TV', x:'Live television in ten minutes. The floor manager counts you down.', set:'tv', with:'publicist',
    ch:[{ l:'Perform the single', fx:{ hype:3 }, r:'Clean, confident, done.' }, { l:'Debut a deep cut', fx:{ fans:1, hype:2 }, r:'Fans lose it that you chose that one.' }] }],
 rel_signing:[{ t:'The signing', x:'The line wraps around the block. Your hand already hurts.', set:'press', with:'fan',
    ch:[{ l:'Stay until every last fan is signed', fx:{ fans:2, energy:-4 }, r:'It is past midnight. Worth it.' }, { l:'Keep the line moving', fx:{ fans:1 }, r:'Efficient and warm.' }] }],
 pre_video:[{ t:'Video shoot', x:'Day two. The director wants one more take in the rain machine.', set:'video', with:'manager',
    ch:[{ l:'One more take', fx:{ hype:3, energy:-3 }, r:'That take is the one in the final cut.' }, { l:'You have got it already', fx:{ energy:2 }, r:'The director sighs, then agrees.' }, { l:'Add your own idea', fx:{ hype:4, money:-30000 }, r:'Your idea becomes the shot everyone screenshots.' }] }],
 pre_announce:[{ t:'The announcement', x:'Everything is ready. How do you tell the world about {nm}?', set:'home', with:'publicist',
    ch:[{ l:'A livestream', fx:{ hype:4, fans:1 }, r:'Millions watch you say the title.' }, { l:'A puzzle for fans to solve', fx:{ hype:5, heat:2 }, r:'They crack it in an hour.' }, { l:'A simple post', fx:{ hype:3 }, r:'Simple works.' }] }],
 fin_sequence:[{ t:'The track order', x:'Sticky notes on a wall, one for each song. Which song closes {nm}?', set:'studio', with:'producer',
    ch:[{ l:'The quietest song', fx:{ rep:1 }, r:'The album ends on a whisper.' }, { l:'The biggest song', fx:{ hype:2 }, r:'It ends with a bang.' }, { l:'The most personal one', fx:{ write:1, fans:1 }, r:'Fans will cry at track last.' }] }],
 fin_master:[{ t:'Mastering', x:'The engineer plays {nm} back on tiny speakers, then on huge ones.', set:'studio', with:'producer',
    ch:[{ l:'Louder', fx:{ hype:1 }, r:'It punches on the radio.' }, { l:'Warmer', fx:{ rep:1 }, r:'It sounds like a record you will keep.' }] }],
 tp_costume:[{ t:'Costume fitting', x:'Seven costumes, eleven quick changes, and one zip that keeps sticking.', set:'rehearsal', with:'manager',
    ch:[{ l:'More sparkle', fx:{ hype:2, money:-40000 }, r:'Fans will spot it from the back row.' }, { l:'Make it easier to dance in', fx:{ energy:2 }, r:'You can actually breathe.' }] }],
 tp_rehearse:[{ t:'Full run-through', x:'Three hours, every song, every change. Your dancers are watching you.', set:'rehearsal', with:'manager',
    ch:[{ l:'Run it again', fx:{ energy:-4, rep:1 }, r:'The second run is flawless.' }, { l:'Fix the one tricky transition', fx:{ energy:-2 }, r:'Solved.' }, { l:'Send everyone home early', fx:{ team:3 }, r:'Your crew loves you for it.' }] }],
 // Early years: before the first record deal.
 early_choir:[{ t:'Choir practice', x:'The director gives you the solo.', set:'home', with:'family', early:true,
    ch:[{ l:'Sing it straight', fx:{ fans:1, rep:1 }, r:'Someone\'s grandma cries.' }, { l:'Add a run', fx:{ fans:2 }, r:'A little showy. It works.' }] }],
 early_open:[{ t:'Open mic', x:'You are fourth on the list. The guy before you plays for nineteen minutes.', set:'writers', with:'family', early:true,
    ch:[{ l:'Play your own song', fx:{ write:1, fans:1 }, r:'The room actually listens.' }, { l:'Play a cover everyone knows', fx:{ fans:2 }, r:'They sing along.' }] }],
 early_demo:[{ t:'Your first demo', x:'A small local studio, two hours booked, and a nervous engineer.', set:'studio', with:'producer', early:true,
    ch:[{ l:'Record three songs fast', fx:{ clout:2 }, r:'Rough, but you have a tape to hand out.' }, { l:'Get one song perfect', fx:{ clout:1, write:1 }, r:'One song you are proud of.' }] }],
 early_talent:[{ t:'The talent show', x:'The school gym. Folding chairs. Your whole family in the front row.', set:'theater', with:'family', early:true,
    ch:[{ l:'Go big', fx:{ fans:2, energy:-2 }, r:'You win. Of course you win.' }, { l:'Keep it simple', fx:{ fans:1, rep:1 }, r:'Second place, and a standing ovation.' }] }],
 early_busk:[{ t:'Busking', x:'A street corner, an open case, and a man who stops and listens to three songs.', set:'home', with:'fan', early:true,
    ch:[{ l:'Play your saddest song', fx:{ fans:1, write:1 }, r:'He leaves a twenty and says nothing.' }, { l:'Play to the crowd', fx:{ fans:2, money:40 }, r:'Your case fills up with coins.' }] }]
};

// What a song can be about. Recent real cards are offered too ("write what you know").
ER.INSPIRATIONS = [
 { id:'heartbreak', n:'Heartbreak' }, { id:'love', n:'Falling in love' }, { id:'home', n:'Home and growing up' }, { id:'friendship', n:'Friendship' },
 { id:'fame', n:'Fame and the press' }, { id:'revenge', n:'Getting even' }, { id:'night', n:'A night out' }, { id:'self', n:'Who you are becoming' }
];
ER.APPROACHES = [
 { id:'story', n:'Tell it as a story, verse by verse', fit:['heartbreak','home','friendship','self'] },
 { id:'hook', n:'Find the hook first', fit:['love','night','revenge','fame'] },
 { id:'bridge', n:'Build it around a huge bridge', fit:['heartbreak','revenge','self'] },
 { id:'stream', n:'Write fast, fix nothing', fit:['night','love','fame'] }
];
ER.WRITE_MOMENTS = ['You write the first line on the back of a receipt.','The chorus arrives in the shower. You run for your phone.','You finish it at 2 a.m., and the bridge comes last.',
 'You hum the melody into a voice memo between meetings.','You cross out everything except one line, and build the song from that.','It comes all at once, in about twenty minutes.',
 'You write it on the floor of your kitchen.','Your co-writer says one word, and the whole song opens up.'];
ER.TAKES = [
 { id:'raw', n:'Keep the first take, raw', d:'It might be magic or it might be rough.', q:[-6, 10], energy:-2 },
 { id:'polish', n:'Polish every line', d:'Steady and reliable, but it costs energy.', q:[1, 5], energy:-6 },
 { id:'experiment', n:'Try the producer\'s wild idea', d:'High risk, high reward.', q:[-10, 14], energy:-3 }
];
ER.STUDIO_MOMENTS = ['The producer plays it back and nobody says anything for a while. Good sign.','Your voice cracks on the high note, and you keep that take anyway.',
 'Someone accidentally hits a button and the mistake becomes the intro.','You record the harmonies at 3 a.m. in your socks.','The engineer whispers "that\'s the one."',
 'You add one word in the last chorus and it changes everything.'];

// Things to do in the early years, before the first record deal. Available to any artist.
ER.EARLY_ACTS = [
 { id:'choir', l:'Sing in choir or at church', cost:1, fx:{ fans:1, write:1 }, scene:'early_choir' },
 { id:'openmic', l:'Play an open mic night', cost:1, fx:{ fans:2, write:1, energy:-3 }, scene:'early_open', minAge:12 },
 { id:'talent', l:'Enter a talent show or contest', cost:2, fx:{ fans:3, clout:1, energy:-4 }, scene:'early_talent' },
 { id:'notebook', l:'Fill a notebook with song ideas', cost:1, fx:{ write:2 } },
 { id:'lessons', l:'Take voice or instrument lessons', cost:1, fx:{ write:1, clout:1, money:-60 } },
 { id:'demo', l:'Record a demo at a local studio', cost:2, fx:{ clout:3, money:-300 }, scene:'early_demo', minAge:12 },
 { id:'busk', l:'Busk downtown', cost:1, fx:{ fans:1, money:30 }, scene:'early_busk', minAge:13 },
 { id:'listen', l:'Study your heroes\' albums', cost:1, fx:{ write:1, energy:2 } }
];

// The first-week guide.
ER.GUIDE = [
 { id:'block', l:'Spend a Time Block on a task', hint:'Tap "Do" on any task. You get a few blocks every week.' },
 { id:'scene', l:'Make a choice in a scene', hint:'Many tasks open a little scene with a choice.' },
 { id:'tab', l:'Open another tab', hint:'The tabs along the top unlock as her real career would.' },
 { id:'advance', l:'Press Advance Week', hint:'Real events interrupt with a decision. Each card ends with what really happened.' }
];
})();
