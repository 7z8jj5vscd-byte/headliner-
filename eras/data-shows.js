/* The Eras Life: show nights, award nights, fan mail and era wrap-ups. All moments here are
   invented around the career; real results (awards, chart numbers) are never changed by them. */
(function () {
const ER = window.ER;

ER.CITIES = {
 'North America':['Nashville','New York','Los Angeles','Chicago','Houston','Toronto','Atlanta','Philadelphia','Seattle','Denver','Kansas City','Miami','Glendale','Minneapolis','Vancouver','Detroit'],
 'Europe':['London','Paris','Dublin','Madrid','Lisbon','Amsterdam','Stockholm','Milan','Zurich','Warsaw','Edinburgh','Liverpool','Lyon','Hamburg'],
 'Asia and Oceania':['Tokyo','Sydney','Melbourne','Singapore','Auckland','Manila','Seoul'],
 'Latin America':['Mexico City','São Paulo','Rio de Janeiro','Buenos Aires','Santiago','Bogotá']
};
ER.CITY_DETAILS = ['The crowd sings the first verse so loud you stop and just listen.','It is the hottest night of the summer. Everyone is fanning themselves with setlists.',
 'Thousands of people outside the stadium are singing along without tickets.','A storm passes just before showtime and leaves a rainbow over the stage.',
 'The local food your crew brings backstage is the best of the tour.','A fan in the front row has been to every show this week.',
 'The stadium shakes so much during the bridge that it registers on a seismograph.','A whole section holds up lights in the colour of the current era.'];

// A crowd moment during the show, with a choice.
ER.CROWD_MOMENTS = [
 { t:'A sign in the crowd', x:'A sign near the front reads "I drove 11 hours to be here."', ch:[{ l:'Read it out and wave', fx:{ fans:1, rep:1 }, r:'The fan holding it bursts into tears on the big screen.' }, { l:'Keep the show moving', fx:{}, r:'You smile at them in the next song.' }] },
 { t:'A proposal', x:'Someone in the pit is down on one knee.', ch:[{ l:'Stop the show to celebrate', fx:{ fans:1, heat:2 }, r:'She says yes. The stadium screams.' }, { l:'Dedicate the next song to them', fx:{ fans:1 }, r:'They slow-dance in the pit.' }] },
 { t:'A broken string', x:'A string snaps on your guitar halfway through the song.', ch:[{ l:'Finish the song a cappella', fx:{ rep:2, fans:1 }, r:'People say it was the best moment of the night.' }, { l:'Laugh and grab another guitar', fx:{ fans:1 }, r:'The crowd cheers the swap.' }] },
 { t:'Rain', x:'The sky opens during your opening act. The crowd is soaked and still screaming.', ch:[{ l:'Run out into the rain', fx:{ fans:2, energy:-3 }, r:'The photos from tonight are legendary.' }, { l:'Play the next song slower and longer', fx:{ rep:1 }, r:'It feels like a movie.' }] },
 { t:'A fan needs help', x:'You spot someone in the crowd who looks faint.', ch:[{ l:'Stop the show until they are safe', fx:{ rep:3 }, r:'Medics reach them. The crowd claps when you restart.' }, { l:'Signal security', fx:{ rep:2 }, r:'Handled quickly and quietly.' }] },
 { t:'A costume problem', x:'A zip gives way during a quick change.', ch:[{ l:'Come out in the next costume early', fx:{ fans:1 }, r:'Nobody notices a thing.' }, { l:'Make a joke about it', fx:{ fans:1, heat:2 }, r:'The clip is everywhere by morning.' }] },
 { t:'A child on a parent\'s shoulders', x:'A little kid in a sparkly outfit is singing every word.', ch:[{ l:'Give them your hat', fx:{ fans:2 }, r:'They will remember this forever.' }, { l:'Point and wave', fx:{ fans:1 }, r:'The kid loses it.' }] }
];
ER.OPENERS = [
 { id:'big', n:'Explode onto the stage', fx:{ fans:1, energy:-2 } },
 { id:'slow', n:'Start slow at the piano, then build', fx:{ rep:1 } },
 { id:'surprise', n:'Open with a fan favourite nobody expects', fx:{ fans:1, hype:1 } }
];
ER.REVIEW_LINES = { 5:'"A masterclass. One of the great shows of the year."', 4:'"Joyful, generous and huge."', 3:'"A solid night that sent everyone home happy."', 2:'"Fun, but it never quite caught fire."', 1:'"A tired show on an off night."' };

// Award nights: what to wear.
ER.CARPET = [
 { id:'gown', n:'A sweeping sequinned gown', look:{ top:'gown', sparkle:1 }, fx:{ fans:1, heat:2 }, r:'Best-dressed lists everywhere.' },
 { id:'suit', n:'A sharp tailored suit', look:{ top:'suit' }, fx:{ rep:1, heat:1 }, r:'Fashion critics call it a statement.' },
 { id:'era', n:'Something that matches the current era', look:{}, fx:{ hype:3 }, r:'Fans decode it as a clue.' },
 { id:'bold', n:'Something nobody has seen before', look:{ top:'bodysuit', sparkle:1, feathers:'#ffffff' }, fx:{ heat:4, fans:1 }, r:'The photos break the internet.' }
];

// Weekly fan mail from invented fans.
ER.FAN_MAIL = [
 { from:'Maddie, 14', x:'Your song got me through my parents\' divorce. I just wanted you to know.', ch:[{ l:'Write back by hand', fx:{ rep:1, fans:1 }, r:'She frames your letter.' }, { l:'Send signed merch', fx:{ fans:1 }, r:'She wears it to school every day.' }] },
 { from:'Jordan, 22', x:'I am a nurse and I listen to your albums on every night shift.', ch:[{ l:'Send flowers to the whole ward', fx:{ rep:2, money:-500 }, r:'The ward sends back a group photo.' }, { l:'Reply with a voice note', fx:{ fans:1 }, r:'Jordan plays it for everyone at work.' }] },
 { from:'Aunt Rosa, 71', x:'My granddaughter made me listen. Now I know all the words. Do not tell her.', ch:[{ l:'Reply with a joke', fx:{ fans:1 }, r:'Rosa\'s reply is even funnier.' }, { l:'Invite them both to a show', fx:{ fans:1, rep:1 }, r:'Rosa dances the whole night.' }] },
 { from:'Sam, 17', x:'I want to write songs too, but everyone says it is unrealistic.', ch:[{ l:'Encourage them to keep writing', fx:{ rep:1, write:1 }, r:'Years later Sam sends you their first record.' }, { l:'Share your first-song story', fx:{ fans:1 }, r:'Sam starts a notebook that night.' }] },
 { from:'Priya, 30', x:'We played your song at our wedding. Thank you for our first dance.', ch:[{ l:'Send a congratulations card', fx:{ fans:1 }, r:'It goes in their wedding album.' }, { l:'Ask to see the video', fx:{ fans:1, energy:1 }, r:'You watch it three times.' }] },
 { from:'Leo, 9', x:'I drew you. You have a dragon now.', ch:[{ l:'Hang the drawing in the studio', fx:{ energy:2 }, r:'The dragon watches over every session.' }, { l:'Draw one back', fx:{ fans:1 }, r:'Leo says yours is "pretty good."' }] },
 { from:'Ellie, 19', x:'I found a clue in your last video and nobody believes me.', ch:[{ l:'Send back a single winking emoji', fx:{ hype:3, heat:1 }, r:'Ellie becomes a legend in the fandom.' }, { l:'Say nothing', fx:{}, r:'The mystery continues.' }] }
];

// Song memories: an old song comes back years later. {song} is one of your released titles.
ER.MEMORIES = [
 { t:'"{song}" is trending again', x:'Years after it came out, "{song}" is suddenly everywhere online. A new generation has found it.',
   ch:[{ l:'Play it at your next show', fx:{ fans:2, hype:2 }, r:'The crowd sings louder than you do.' }, { l:'Post the old demo', fx:{ fans:1, heat:2 }, r:'Fans compare it line by line with the album version.' }] },
 { t:'A wedding song', x:'A fan writes that "{song}" was their first dance, ten years ago, and they still play it every anniversary.',
   ch:[{ l:'Send them an anniversary card', fx:{ rep:1, fans:1 }, r:'They frame it next to the wedding photo.' }, { l:'Dedicate it at a show', fx:{ fans:1 }, r:'They were in the crowd.' }] },
 { t:'Back to "{song}"', x:'Your band asks to rework "{song}" for the setlist. It has not been played live in years.',
   ch:[{ l:'Do a slowed-down version', fx:{ rep:1, write:1 }, r:'It feels brand new.' }, { l:'Play it exactly as it was', fx:{ fans:1 }, r:'Nostalgia hits everyone at once.' }] },
 { t:'The song that started it', x:'A young singer says "{song}" is the reason they started writing.',
   ch:[{ l:'Invite them to the studio for a day', fx:{ rep:2, energy:-2 }, r:'They take notes on everything.' }, { l:'Send a note of encouragement', fx:{ rep:1 }, r:'They post it, shaking.' }] }
];
// Invented rival stars send the occasional note. They are fictional, never real artists.
ER.RIVAL_NOTES = [
 { from:'Vesper Lane', x:'Saw the numbers. Annoyingly brilliant. Congratulations.' },
 { from:'Nova Kincaid', x:'Your bridge on the new record has been stuck in my head for a week. Rude.' },
 { from:'Juno Marlowe', x:'Let us do a duet one day. I mean it this time.' },
 { from:'Sasha Vale', x:'My little sister made me go to your show. I cried. Do not tell anyone.' }
];
// Daily challenges: a short era from the real story with one goal. Same for everyone on the same day.
ER.CHALLENGES = [
 { goal:'units', n:'Beat the real first week', d:'Release the album with a first week above the real one.' },
 { goal:'single', n:'Top five single', d:'Get a single from this era into the top five.' },
 { goal:'fans', n:'Grow the fan base', d:'Grow your fans by 15% before the weeks run out.' },
 { goal:'canon', n:'Live it like she did', d:'Make every real choice the way she did (Era Start has no event cards, so finish the era with no missed tasks).' }
];
// Invented award show after 2026.
ER.FREE_AWARDS = { n:'The Music Honours', cats:['Album of the Year','Song of the Year','Best Live Act','Artist of the Year'] };
})();
