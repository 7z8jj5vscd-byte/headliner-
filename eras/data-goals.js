/* The Eras Life: career goals, run modifiers and season goals. They change how a run is scored
   and played, never what really happened. */
(function () {
const ER = window.ER;
// One personal goal for the whole run.
ER.CAREER_GOALS = [
 { id:'none', n:'No goal', d:'Just play.' },
 { id:'no1weeks', n:'Most weeks at No. 1', d:'Spend 50 weeks at No. 1 on the album chart across your career.', target:50 },
 { id:'masters', n:'Own it all early', d:'Reach 100% ownership of your masters before 2021.', target:100 },
 { id:'tour', n:'Biggest tour ever', d:'Gross over $2.5 billion on a single tour.', target:2.5e9 },
 { id:'canon', n:'Live it like she did', d:'Finish 2026 with a Canon Score of 100.', target:100 },
 { id:'fans', n:'Half a billion', d:'Reach 500 million fans.', target:5e8 },
 { id:'awards', n:'The trophy cabinet', d:'Win 30 awards.', target:30 }
];
// Optional twists. Any mix can be chosen.
ER.MODIFIERS = [
 { id:'solo', n:'No co-writers', d:'Every song is written alone. Co-writer bonuses are gone.' },
 { id:'fewblocks', n:'Short weeks', d:'Two fewer Time Blocks every week (never fewer than two).' },
 { id:'tabloids', n:'Tabloid storm', d:'Press Heat rises twice as fast.' },
 { id:'slowfans', n:'Hard crowd', d:'Fans grow more slowly than they really did.' },
 { id:'noff', n:'No fast-forward', d:'Every week is played by hand.' },
 { id:'rich', n:'Big budget', d:'Start with far more money, but the label expects more.' }
];
// Season goals: three are drawn each in-game year.
ER.SEASON_POOL = [
 { id:'shows', l:'Play {n} shows', n:[20, 40, 60], needs:'tour', reward:{ money:200000, fans:1 } },
 { id:'songs', l:'Write {n} songs', n:[3, 5, 8], needs:'write', reward:{ write:3 } },
 { id:'eggs', l:'Plant {n} Easter eggs', n:[2, 3, 5], needs:'eggs', reward:{ hype:6, fans:1 } },
 { id:'fanevents', l:'Hold {n} fan events or livestreams', n:[2, 3, 4], reward:{ fans:2, rep:2 } },
 { id:'top10', l:'Get a single into the top 10', n:[1], needs:'single', reward:{ clout:4 } },
 { id:'rep', l:'Finish the year with Reputation of {n} or more', n:[60, 70, 80], end:true, reward:{ fans:1, team:4 } },
 { id:'scenes', l:'Make {n} scene choices', n:[5, 8, 12], reward:{ team:4 } },
 { id:'rest', l:'Rest at least {n} times', n:[4, 6], reward:{ energy:15 } },
 { id:'interviews', l:'Do {n} interviews', n:[2, 4], needs:'press', reward:{ clout:2, rep:1 } },
 { id:'cards', l:'Answer {n} real event cards', n:[3, 5], needs:'story', reward:{ fans:1 } }
];
})();
