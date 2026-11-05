/* The Eras Life: real-world events. These fire in every save (Story Mode and Era Start, for any
   artist) on their real dates, and some put the world into a state that changes what you can do:
   the 2008 recession, tighter concert security after 2017, and the COVID-19 lockdown and its
   aftermath. Told briefly and factually. */
(function () {
const ER = window.ER, W = ER.ds;

ER.WORLD_STATE = {
  recession:[W('2008-09-15'), W('2010-06-28')],
  security:[W('2017-05-22'), W('2100-01-01')],
  lockdown:[W('2020-03-11'), W('2021-06-28')],
  limits:[W('2021-06-28'), W('2022-03-07')],
  inflation:[W('2022-01-03'), W('2024-01-01')]
};
ER.inWorld = (k, a) => { const r = ER.WORLD_STATE[k]; return !!r && a >= r[0] && a < r[1]; };
ER.WORLD_NOTES = {
  recession:'The economy is in recession: fans have less to spend on tickets, and sponsors pay less.',
  lockdown:'The COVID-19 pandemic has shut down live music. No concerts, fan events or in-person promotion. You can still write, record at home, and reach fans online.',
  limits:'Live music is coming back with limits: some shows have lower capacity and health rules.',
  inflation:'Prices are rising fast. Tickets cost more, and so does putting on a show.'
};

const E = [
 { d:'2001-09-11', id:'w911', s:1, t:'September 11', x:'Terrorist attacks in New York, Washington and Pennsylvania kill nearly 3,000 people. Concerts and events across the country are postponed.',
   ch:[{l:'Sing at a local memorial',fx:{energy:-6,rep:1}},{l:'Stay home with family',fx:{energy:-4}}],
   truth:'The attacks killed nearly 3,000 people. Many concerts and events were postponed in the weeks that followed.' },
 { d:'2003-04-28', id:'witunes', t:'The iTunes Store opens', x:'Apple starts selling single songs for 99 cents. Fans can now buy music one track at a time.',
   ch:[{l:'Study how fans buy music now',fx:{clout:2}},{l:'Stick to CDs',fx:{}}],
   truth:'The iTunes Store opened in April 2003 and soon became the biggest music seller in the US.' },
 { d:'2005-12-15', id:'wyoutube', t:'YouTube', x:'A new video site lets anyone upload and share videos for free.',
   ch:[{l:'Post videos of your songs',fx:{fans:4}},{l:'Wait and see',fx:{}}],
   truth:'YouTube launched publicly in December 2005 and became a key place to discover music.' },
 { d:'2006-09-26', id:'wsocial', t:'Social networks open up', x:'Facebook opens to everyone, and Twitter has just launched. MySpace is still where musicians live.',
   ch:[{l:'Join early',fx:{fans:3,energy:-3}},{l:'Stay on MySpace',fx:{}}],
   truth:'Facebook opened to the public in September 2006, months after Twitter launched.' },
 { d:'2007-06-29', id:'wiphone', t:'The iPhone', x:'Apple\'s iPhone puts music, the internet and a camera in one pocket.',
   ch:[{l:'Think about how fans will listen now',fx:{clout:1}},{l:'Carry on',fx:{}}],
   truth:'The first iPhone went on sale on June 29, 2007.' },
 { d:'2008-09-15', id:'wcrisis', t:'Financial crisis', x:'Lehman Brothers collapses and the economy falls into recession. Fans have less money for tickets and albums.',
   ch:[{l:'Keep ticket prices low',fx:{rep:4,money:-200000}},{l:'Hold your prices',fx:{}}],
   truth:'The collapse of Lehman Brothers on September 15, 2008, deepened the Great Recession.' },
 { d:'2009-06-29', id:'wmj', t:'Michael Jackson dies', x:'Michael Jackson dies at 50. His music dominates the charts and the airwaves for weeks.',
   ch:[{l:'Pay tribute at a show',fx:{rep:2}},{l:'Post a tribute',fx:{rep:1}}],
   truth:'Michael Jackson died on June 25, 2009. His albums filled the top of the charts that summer.' },
 { d:'2010-10-11', id:'winstagram', t:'Instagram', x:'A new photo app launches on the iPhone.',
   ch:[{l:'Start sharing behind-the-scenes photos',fx:{fans:2}},{l:'Not yet',fx:{}}],
   truth:'Instagram launched in October 2010.' },
 { d:'2011-07-18', id:'wspotify', t:'Spotify comes to the US', x:'The streaming service launches in America. Some artists worry it pays too little.',
   ch:[{l:'Put your music on it',fx:{fans:2}},{l:'Be cautious',fx:{own:1}}],
   truth:'Spotify launched in the US in July 2011.' },
 { d:'2014-12-01', id:'wstreams', t:'Streams count on the charts', x:'The Billboard 200 starts counting streams and track sales as album-equivalent units.',
   ch:[{l:'Plan rollouts around streaming',fx:{clout:2}},{l:'Keep focusing on sales',fx:{}}],
   truth:'From December 2014 the Billboard 200 counted streaming and track sales.' },
 { d:'2016-11-08', id:'welection16', t:'Election Day', x:'The US presidential election is today. Artists are being asked who they support.',
   ch:[{l:'Post that you voted, nothing more',fx:{heat:3}},{l:'Endorse a candidate',fx:{heat:12,rep:-2}},{l:'Say nothing',fx:{heat:2}}],
   truth:'Donald Trump won the 2016 US presidential election.' },
 { d:'2017-05-22', id:'wmanchester', s:1, t:'Manchester Arena', x:'A bombing after an Ariana Grande concert at Manchester Arena kills 22 people. Venues around the world tighten security.',
   ch:[{l:'Give to the victims\' fund',fx:{energy:-6,money:-100000}},{l:'Review security for your shows',fx:{energy:-6,money:-50000}}],
   truth:'The attack on May 22, 2017, killed 22 people. Concert security was tightened worldwide.' },
 { d:'2017-10-02', id:'wvegas', s:1, t:'Las Vegas', x:'A gunman opens fire on the Route 91 Harvest country music festival in Las Vegas, killing about 60 people.',
   ch:[{l:'Support the victims and the country music community',fx:{energy:-8}},{l:'Review security for your shows',fx:{energy:-6,money:-50000}}],
   truth:'The shooting on October 1, 2017, was the deadliest mass shooting in modern US history.' },
 { d:'2018-08-06', id:'wtiktok', t:'TikTok', x:'Musical.ly merges into TikTok. Short videos are starting to make songs into hits.',
   ch:[{l:'Watch what fans make with your songs',fx:{fans:2}},{l:'Ignore it',fx:{}}],
   truth:'Musical.ly was merged into TikTok in August 2018.' },
 { d:'2020-01-27', id:'wcovid1', t:'A new virus', x:'News is spreading about a new coronavirus. The first US case has been reported.',
   ch:[{l:'Keep your plans for now',fx:{}},{l:'Ask your team for a backup plan',fx:{team:2}}],
   truth:'The first US COVID-19 case was reported on January 21, 2020.' },
 { d:'2020-03-11', id:'wcovid2', t:'A pandemic', x:'The World Health Organization declares COVID-19 a pandemic. Within days, concerts, festivals and tours around the world are called off, and people are told to stay home.',
   ch:[{l:'Stay home and write',fx:{write:4,energy:6}},{l:'Livestream for fans',fx:{fans:3,energy:-4}},{l:'Donate to relief',fx:{rep:5,money:-500000}}],
   truth:'The WHO declared a pandemic on March 11, 2020. Live music stopped worldwide for more than a year.' },
 { d:'2020-06-02', id:'wblackout', t:'Blackout Tuesday', x:'After the murder of George Floyd, protests spread across the US, and the music industry pauses for a day.',
   ch:[{l:'Join the pause and hold releases',fx:{rep:2}},{l:'Donate and speak out',fx:{rep:3,heat:6,money:-100000}}],
   truth:'The music industry observed Blackout Tuesday on June 2, 2020.' },
 { d:'2020-12-14', id:'wvaccine', t:'Vaccines', x:'The first COVID-19 vaccines are given in the US. Live music might come back.',
   ch:[{l:'Start dreaming about tours',fx:{energy:4}},{l:'Keep making music at home',fx:{write:2}}],
   truth:'The first US COVID-19 vaccinations were given on December 14, 2020.' },
 { d:'2021-06-28', id:'wreturn', t:'Live music returns', x:'Venues across the US are reopening at full capacity, though some health rules remain.',
   ch:[{l:'Go to a show as a fan',fx:{energy:4}},{l:'Plan carefully',fx:{team:2}}],
   truth:'US live music largely returned in summer 2021, with health rules at many venues.' },
 { d:'2022-07-13', id:'winflation', t:'Inflation', x:'US inflation hits 9.1%, the highest in forty years. Touring costs are soaring, and so are ticket prices.',
   ch:[{l:'Keep some tickets affordable',fx:{rep:4,money:-300000}},{l:'Price for the market',fx:{money:300000,rep:-2}}],
   truth:'US inflation reached 9.1% in June 2022.' },
 { d:'2023-07-14', id:'wstrike', t:'Hollywood on strike', x:'Actors join writers on strike. Films and TV shows stop production.',
   ch:[{l:'Support the strikers',fx:{rep:2}},{l:'Stay out of it',fx:{}}],
   truth:'SAG-AFTRA joined the writers\' strike on July 14, 2023.' },
 { d:'2025-01-13', id:'wfires', s:1, t:'Los Angeles fires', x:'Wildfires destroy thousands of homes around Los Angeles. Musicians organise benefit concerts.',
   ch:[{l:'Donate to relief',fx:{energy:-6,money:-1000000}},{l:'Support a benefit concert',fx:{energy:-8}}],
   truth:'The January 2025 fires destroyed thousands of homes. The FireAid benefit concerts were held on January 30, 2025.' }
];
E.forEach(e => { e.abs = W(e.d); e.year = +e.d.slice(0, 4); e.world = 1; });
ER.WORLD = E;
})();
