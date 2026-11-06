/* Dream Academy: Story Mode. Game data: cast, chapters, activities, concepts, drama, feed. */
(function () {
const D = window.DA = {};

/* Cast. Real names; looks are stylized approximations the player can edit.
   Skill leanings are game numbers, not claims about anyone. realOut = how she left the real show. */
D.cast = [
  { id:'sophia',   first:'Sophia',   last:'Laforteza', from:'Philippines',   real:true, place:1, score:88.33, pre:40, live:10, judges:38.33,
    lean:{ vo:8, pe:6, ch:6 }, look:{ skin:'#c99a74', hair:'#16110f', style:'long' } },
  { id:'lara',     first:'Lara',     last:'Raj',       from:'United States', real:true, place:2, score:82.67, pre:37, live:9, judges:36.67,
    lean:{ vo:6, ra:7, ch:6 }, look:{ skin:'#9a6a4c', hair:'#120d0b', style:'wavy' } },
  { id:'daniela',  first:'Daniela',  last:'Avanzini',  from:'United States', real:true, place:3, score:79.00, pre:32, live:7, judges:40.00,
    lean:{ da:9, pe:7 }, look:{ skin:'#d8ad88', hair:'#2a1a12', style:'wavy' } },
  { id:'yoonchae', first:'Yoonchae', last:'Jeung',     from:'South Korea',   real:true, place:4, score:78.00, pre:34, live:8, judges:36.00,
    lean:{ da:7, vo:5, pe:5 }, look:{ skin:'#efd2b8', hair:'#120f10', style:'long' }, minorUntil:50 },
  { id:'megan',    first:'Megan',    last:'Skiendiel', from:'United States', real:true, place:5, score:68.33, pre:24, live:3, judges:41.33,
    lean:{ vo:7, so:5, pe:5 }, look:{ skin:'#e4bf9c', hair:'#24160f', style:'long' } },
  { id:'manon',    first:'Manon',    last:'Bannerman', from:'Switzerland',   real:true, place:6, score:68.00, pre:30, live:5, judges:33.00,
    lean:{ ra:6, ch:8, pe:4 }, look:{ skin:'#a8785a', hair:'#1d130d', style:'curly' } },
  { id:'samara',   first:'Samara',   last:'Siqueira',  from:'Brazil',        place:7, score:66.67, realOut:'F',
    lean:{ vo:6, da:5 }, look:{ skin:'#c29470', hair:'#1e140e', style:'wavy' } },
  { id:'emily',    first:'Emily',    from:'United States', realOut:'F',  lean:{ vo:5, pe:5 }, look:{ skin:'#e2bc98', hair:'#3a2618', style:'long' } },
  { id:'ezrela',   first:'Ezrela',   from:'Australia',     realOut:'F',  lean:{ da:6, ch:4 }, look:{ skin:'#c8986f', hair:'#1a120d', style:'pony' } },
  { id:'marquise', first:'Marquise', from:'Thailand',      realOut:'F',  lean:{ ra:5, ch:5 }, look:{ skin:'#d6aa83', hair:'#16100d', style:'bob' } },
  { id:'celeste',  first:'Celeste',  from:'Argentina',     realOut:'M3', lean:{ vo:5, so:4 }, look:{ skin:'#dcb18e', hair:'#2b1b12', style:'wavy' } },
  { id:'nayoung',  first:'Nayoung',  from:'South Korea',   realOut:'M3', lean:{ da:6, pe:3 }, look:{ skin:'#efd3bb', hair:'#141011', style:'bob' } },
  { id:'ua',       first:'Ua',       from:'Japan',         realOut:'M3', lean:{ da:5, ch:4 }, look:{ skin:'#ecd0b6', hair:'#191311', style:'bun' } },
  { id:'brooklyn', first:'Brooklyn', from:'United States', realOut:'M2', lean:{ pe:5, ch:4 }, look:{ skin:'#e0b996', hair:'#4a3020', style:'long' } },
  { id:'iliya',    first:'Iliya',    from:'Belarus',       realOut:'M2', lean:{ vo:5, da:3 }, look:{ skin:'#ead0b8', hair:'#3b2a1d', style:'pony' } },
  { id:'karlee',   first:'Karlee',   from:'United States', realOut:'M2', lean:{ da:5, ra:3 }, look:{ skin:'#dfb894', hair:'#2e1d14', style:'wavy' } },
  { id:'mei',      first:'Mei',      from:'Japan',         realOut:'M2', lean:{ vo:4, so:4 }, look:{ skin:'#edd2b9', hair:'#16110f', style:'long' } },
  { id:'lexie',    first:'Lexie',    from:'Sweden',        realOut:'W',  lean:{ vo:5, pe:3 }, look:{ skin:'#efd6c0', hair:'#5a3d26', style:'long' } },
  { id:'adela',    first:'Adéla',    from:'Slovakia',      realOut:'M1', lean:{ pe:4, vo:3 }, look:{ skin:'#ecd2bc', hair:'#3d2a1c', style:'bun' } },
  { id:'hinari',   first:'Hinari',   from:'Japan',         realOut:'M1', lean:{ da:4, ch:3 }, look:{ skin:'#efd5bf', hair:'#171211', style:'bob' } },
];

D.skills = [
  { k:'vo', l:'Vocal' }, { k:'da', l:'Dance' }, { k:'ra', l:'Rap' },
  { k:'pe', l:'Performance' }, { k:'so', l:'Songwriting' }, { k:'ch', l:'Charisma' },
];

D.skinTones = ['#f3dcc8','#efd2b8','#e4bf9c','#d8ad88','#c99a74','#b0805e','#9a6a4c','#7c5238','#5e3b28'];
D.hairColors = ['#120d0b','#1d130d','#2a1a12','#3a2618','#5a3d26','#8a6038','#c89a5a','#e6c88a','#7a2230','#3d3a5c'];
D.hairStyles = [['long','Long'],['wavy','Wavy'],['curly','Curly'],['bob','Bob'],['pony','Ponytail'],['bun','Bun']];

/* Chapters: months are 1-based. */
D.chapters = [
  { n:1, name:'Open Call',        from:1,  to:3,   real:'Global auditions' },
  { n:2, name:'Academy',          from:4,  to:18,  real:'A year of training' },
  { n:3, name:'Survival Show',    from:19, to:21,  real:'The Debut: Dream Academy' },
  { n:4, name:'Pre-Debut',        from:22, to:30,  real:'Debut preparation' },
  { n:5, name:'Rookie Era',       from:31, to:36,  real:'The debut and the first EP' },
  { n:6, name:'Breakout',         from:37, to:48,  real:'The breakout EP' },
  { n:7, name:'Superstardom',     from:49, to:60,  real:'Awards, festivals and a No. 1' },
  { n:8, name:'Staying on Top',   from:61, to:144, real:'Invented future' },
];
D.END = 144;

/* Archive footage: the real timeline, shown as documentary cards when a chapter opens.
   Health hiatuses are deliberately left out. */
D.archive = {
  1: ['Nov 2021', 'Global auditions open. More than 120,000 people send in submissions.'],
  2: ['2022–23', 'The chosen trainees spend about a year in idol-system training in Los Angeles.'],
  3: ['Aug–Nov 2023', 'The Debut: Dream Academy. 20 contestants, three missions, a live finale, six chosen.'],
  4: ['Late 2023', 'The six finalists begin preparing their debut as a group.'],
  5: ['Jun–Sep 2024', 'The debut single gets a lukewarm response. The second single\'s dance goes viral on TikTok months later.'],
  6: ['Apr–Aug 2025', 'A divisive single brings a first Hot 100 entry, the next EP debuts at No. 4, and a denim campaign passes 400 million views.'],
  7: ['Nov 2025–Aug 2026', 'Two Grammy nominations, a live-band Grammys performance, a Coachella debut and a No. 1 EP.'],
  8: ['After 2026', 'From here the real story has not been written. Everything is invented.'],
};

/* Monthly activities for a person. g = skill gains, wb = wellbeing change, fan = fan favor. */
D.acts = {
  vo:      { l:'Vocal lessons',     g:{ vo:1 },          wb:-4 },
  da:      { l:'Dance practice',    g:{ da:1 },          wb:-5 },
  ra:      { l:'Rap and flow',      g:{ ra:1 },          wb:-4 },
  pe:      { l:'Stage rehearsal',   g:{ pe:1, ch:.25 },  wb:-5 },
  so:      { l:'Songwriting',       g:{ so:1 },          wb:-2 },
  ch:      { l:'Content and fans',  g:{ ch:.8 },         wb:-3, fan:3 },
  bond:    { l:'Time with a member',g:{ ch:.2 },         wb:4, bond:8 },
  rest:    { l:'Rest',              g:{},                wb:15 },
  solo:    { l:'Solo project',      g:{ so:.6, ch:.6 },  wb:-4, fan:4, groupOnly:true, from:61 },
};
D.actOrder = ['vo','da','ra','pe','so','ch','bond','rest','solo'];

D.styles = {
  balanced: { l:'Balanced',          d:'Works on her weakest skill, rests when Wellbeing drops below 45.' },
  grind:    { l:'Skill Grind',       d:'Trains every month and only rests below 25 Wellbeing.' },
  fans:     { l:'Fan Service',       d:'Mostly content and fan time; rests below 40.' },
  protect:  { l:'Protect Wellbeing', d:'Rests below 70, otherwise writes or spends time with members.' },
};

/* Group schedule, from Pre-Debut on. */
D.groupPlans = {
  train:   { l:'Group training',  d:'Everyone trains as planned. Small group-chemistry gain.', wb:0, label:2 },
  record:  { l:'Recording',       d:'Builds the next release. Prep +22.', wb:-3, label:-2, prep:22 },
  promo:   { l:'Promotion',       d:'Music shows, interviews and content. Fans and momentum up.', wb:-5, label:-5 },
  tour:    { l:'Touring',         d:'Needs a release. Big fan and performance gains; tiring.', wb:-8, label:-6, needsRelease:true },
  recover: { l:'Recovery month',  d:'Everyone rests. Wellbeing up; the label notices.', wb:10, label:8 },
};

/* Concepts. fit = which skills carry it; risk = chance it divides fans. */
D.concepts = [
  { id:'bright',  l:'Bright Pop',      fit:['vo','ch'], risk:.05 },
  { id:'dance',   l:'Dance Break',     fit:['da','pe'], risk:.1 },
  { id:'girl',    l:'Girl Crush',      fit:['ra','pe'], risk:.15 },
  { id:'ballad',  l:'Soft Ballad',     fit:['vo','so'], risk:.05 },
  { id:'weird',   l:'Experimental',    fit:['ra','ch'], risk:.6 },
  { id:'y2k',     l:'Y2K Revival',     fit:['ch','da'], risk:.15, late:true },
  { id:'dark',    l:'Dark Pop',        fit:['vo','pe'], risk:.25, late:true },
  { id:'band',    l:'Live Band',       fit:['vo','pe'], risk:.2,  late:true },
  { id:'latin',   l:'Latin Crossover', fit:['da','ch'], risk:.2,  late:true },
  { id:'unplug',  l:'Unplugged',       fit:['vo','so'], risk:.1,  late:true },
  { id:'disco',   l:'Disco Revival',   fit:['da','vo'], risk:.15, late:true },
  { id:'hyper',   l:'Hyperpop',        fit:['ra','so'], risk:.55, late:true },
];

/* Invented titles. */
D.titleA = ['Static','Velvet','Paper','Neon','Quiet','Wild','Glass','Honey','Signal','Silver','Midnight','Heavy','Sugar','Electric','Lucky','Low','Burning','Open','Blue','Second'];
D.titleB = ['Heart','Bite','Hours','Weather','Talk','Light','Motion','Fever','Season','Ghost','Habit','Mirror','Signal','Static','Gravity','Echo','Rumor','Body','Line','Run'];
D.eraA = ['SOFT','LOUD','BRIGHT','STRANGE','GOLDEN','RESTLESS','TENDER','FERAL','LUCID','ELECTRIC','HOLLOW','LOVELY'];
D.eraB = ['POWER','NOISE','HOURS','WEATHER','GROUND','FREQUENCY','MACHINE','CITY','SEASON','SIGNAL','WORLD','HEAT'];

/* Group-name ideas if the player wants a different name. */
D.groupNames = ['KATSEYE','NEXT SIX','SIXTH SENSE','LOOP','HALO','VIVID','ORBIT'];

/* Drama. light = competitive and mild, used for anyone who was a minor and for contestants who did not debut.
   Text uses {a} and {b}. No bullying, betrayal, crimes or scandals. */
D.drama = {
  team:     { light:true, title:'Team picks', from:1, to:21,
    open:'{a} picked her mission team and left {b} off it. {b} found out from the board, not from her.',
    conf:['"I just thought we\'d be on the same team."', '"It wasn\'t personal. I picked for the song."'] },
  center:   { light:true, title:'The center spot', from:1,
    open:'{a} and {b} both want the center for the next stage. The coaches want them to settle it.',
    conf:['"I\'ve worked for this one."', '"So have I. That\'s the problem."'] },
  practice: { light:true, title:'Practice clash', from:1,
    open:'{a} wants one more run-through every night. {b} says they are drilling the life out of it.',
    conf:['"Clean is clean. We\'re not there yet."', '"We\'re tired, not lazy."'] },
  rivalry:  { light:true, title:'Rivalry', from:1,
    open:'Every eval, {a} and {b} land a grade apart. It has stopped feeling friendly.',
    conf:['"I\'m happy for her. I just want to beat her."', '"We used to text after evals. Not anymore."'] },
  misread:  { light:true, title:'A misunderstanding', from:1,
    open:'A comment {a} made on camera was edited to sound like it was about {b}. {b} saw the clip first.',
    conf:['"That\'s not what I meant at all."', '"Then why does it sound like that?"'] },
  lines:    { title:'Line distribution', from:22,
    open:'The new track gives {a} most of the lines. {b} counted them, and so did the fans.',
    conf:['"I didn\'t write the split."', '"I know. I still want to sing on my own song."'] },
  concept:  { title:'Concept fight', from:22,
    open:'{a} loves the next concept. {b} thinks it isn\'t the group, and said so in the meeting.',
    conf:['"We have to take risks."', '"Not this one."'] },
  clique:   { title:'Two camps', from:22,
    open:'{a} and {b} have stopped riding in the same van. The others are picking seats around them.',
    conf:['"Nothing happened. We just stopped talking."', '"It\'s easier this way."'] },
  spotlight:{ title:'Spotlight', from:31,
    open:'Press keeps asking {a} to front interviews. {b} feels like a backup dancer in her own group.',
    conf:['"I don\'t ask for it."', '"You don\'t say no to it, either."'] },
  label:    { title:'Label favoritism', from:22,
    open:'The label gave {a} a solo promo slot without telling the group. {b} heard it from a stylist.',
    conf:['"I thought they told everyone."', '"They told you."'] },
  schedule: { title:'Push or rest', from:31,
    open:'{a} wants to say yes to every booking. {b} wants the group to protect its rest days.',
    conf:['"This window doesn\'t stay open."', '"Neither do we, if we keep going like this."'] },
  credit:   { title:'Writing credit', from:31,
    open:'{a} wrote the hook on the new single. The credits list {b} next to her for one line.',
    conf:['"It was one line."', '"It was the line everyone sings."'] },
};

/* Hate trains target the group, an era, a concept or the label. Never one member by name.
   fault = whether the group (or label) actually did something; silence works when it didn't. */
D.hate = [
  { id:'lipsync', t:'Lip-sync accusations after a TV stage', fault:false },
  { id:'notthem', t:'Fans say the new concept "isn\'t them"', fault:false, concept:true },
  { id:'tickets', t:'Tour ticket prices spark anger', fault:true },
  { id:'airport', t:'A cropped airport clip makes the group look rude', fault:false },
  { id:'apart',   t:'Fan theories say the group is falling apart', fault:false, drama:true },
  { id:'bots',    t:'A merch drop sells out in seconds and bots get the blame', fault:true },
  { id:'sellout', t:'A brand deal gets called a sellout move', fault:false },
  { id:'overwork',t:'The label is accused of over-scheduling the group', fault:true, labelOnly:true },
];
D.hateStages = ['Whispers','Trending','Pile-on','Headlines','Peak backlash'];

/* Mock feed handles. */
D.handles = ['@sixsignal','@trainee_diaries','@dancebreakdown','@chartwatcher','@stagebystage','@popcritic_m','@fancamarchive','@notyourstan','@vocalsonly','@groupchatleaks','@lightstickhq','@eval_tracker'];

/* Brands, shows and festivals: all invented. */
D.brand = 'Northline Denim';
D.awards = 'National Music Awards';
D.festival = 'Desert Bloom Festival';
D.guests = ['a surprise rock legend','a K-pop senior group','a viral film soundtrack star','a Latin pop superstar'];

D.endings = {
  legends:  { t:'Legends', d:'Number ones, trophies and a group that still likes each other. They will be talked about for decades.' },
  reunion:  { t:'Reunion Tour', d:'They went their own ways, kindly. Years later they all said yes to one more tour.' },
  solo:     { t:'Amicable Solo Careers', d:'The group ended with a hug, not a headline. Everyone kept making music.' },
  cult:     { t:'Cult Favorites', d:'Never the biggest act, but their fans would walk through fire for them.' },
  standing: { t:'Still Standing', d:'Twelve years in, still together, still working. Plenty of groups never got this far.' },
};
})();
