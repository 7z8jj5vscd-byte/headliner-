/* The Eras Life: choices that come back later. After some scenes, a follow-up arrives weeks later
   in the Team Inbox. Good choices tend to pay off and risky ones can backfire. All invented,
   around the career; never claims about real people. */
(function () {
const ER = window.ER;
ER.CALLBACKS = {
 magazine:{ good:{ s:'The cover story is out', x:'The magazine runs your cover. Readers say it is the most like you they have seen.', fx:{ fans:1, rep:2 } },
            bad:{ s:'The cover story is out', x:'The profile calls you guarded. A few columnists pile on.', fx:{ heat:4, rep:-1 } } },
 budget:{ good:{ s:'The budget paid off', x:'The money you put in shows. Everyone at the label is talking about it.', fx:{ hype:4 } },
          bad:{ s:'The savings had a cost', x:'Your team felt the budget cuts. Morale dipped for a few weeks.', fx:{ team:-3 } } },
 label:{ good:{ s:'The label backs you', x:'The executive you won over is now pushing hard for your single at radio.', fx:{ clout:2, hype:3 } },
         bad:{ s:'The label is slow', x:'After the meeting, the label drags its feet on your next request.', fx:{ clout:-2 } } },
 sponsor:{ good:{ s:'The ad landed', x:'Your ad is everywhere, and people say it actually sounds like you.', fx:{ fans:1, money:20000 } },
           bad:{ s:'The ad got mocked', x:'The script you read as written is being mocked online.', fx:{ heat:3, rep:-1 } } },
 interview:{ good:{ s:'The interview went around', x:'Clips of your answer are still circulating. People found it honest.', fx:{ rep:2 } },
             bad:{ s:'The interview was misquoted', x:'One line from your interview is being quoted out of context.', fx:{ heat:5 } } },
 network:{ good:{ s:'A favour returned', x:'Someone you met at that party just recommended you for a big slot.', fx:{ clout:3 } },
           bad:{ s:'A missed connection', x:'You left early, and someone important noticed.', fx:{ clout:-1 } } },
 pre_video:{ good:{ s:'The video is a hit', x:'The shot you fought for is the one everyone screenshots.', fx:{ hype:3, fans:1 } },
             bad:{ s:'The video is fine', x:'The video is fine. Just fine.', fx:{ hype:-1 } } },
 fin_sequence:{ good:{ s:'The track order works', x:'Reviews praise how the album flows from start to finish.', fx:{ rep:2 } },
                bad:{ s:'The track order', x:'A few critics say the album loses momentum in the middle.', fx:{ rep:-1 } } },
 tp_rehearse:{ good:{ s:'Rehearsal paid off', x:'Your crew says opening night was the smoothest they have worked.', fx:{ team:3, rep:1 } },
               bad:{ s:'An under-rehearsed moment', x:'One transition still wobbles every night. Fans have noticed.', fx:{ rep:-1 } } },
 early_demo:{ good:{ s:'Someone heard your demo', x:'A local radio DJ played your demo. People called in asking who you are.', fx:{ fans:3, clout:2 } },
              bad:{ s:'Your demo', x:'Nobody has called back about the demo yet. Keep going.', fx:{} } },
 early_open:{ good:{ s:'Asked back', x:'The open mic host asked you to come back and play a full set.', fx:{ fans:2 } },
              bad:{ s:'A quiet room', x:'The room was half empty last time. It happens.', fx:{} } },
 fanevent:{ good:{ s:'A fan remembers', x:'The fan you met posted the story. It has been shared all over.', fx:{ fans:1, rep:1 } },
            bad:{ s:'A fan remembers', x:'A fan you met posted about the day. Short and sweet.', fx:{} } }
};
// Rival stars after 2026: invented artists with their own careers. Never real people.
ER.RIVAL_CAREERS = [
 { n:'Vesper Lane', sound:'Synth-pop', color:'#7a5cff', base:.7 },
 { n:'Nova Kincaid', sound:'Arena rock', color:'#d0263a', base:.55 },
 { n:'Juno Marlowe', sound:'Indie folk', color:'#8f9a7a', base:.45 },
 { n:'Sasha Vale', sound:'Dance-floor pop', color:'#ff3fa4', base:.6 }
];
ER.RIVAL_ALBUM_WORDS = ['Neon Psalms','Satellite Hearts','Paper Planes','Velvet Riot','Northbound','Glass Cathedral','Afterparty','Wild Lanterns','Salt and Sugar','Midnight Arcade','Copper Sky','The Long Night'];
// Collectible era cards.
ER.CARD_RARITY = [['legend', 'Legend', '#f6d38a'], ['rare', 'Rare', '#9fd8ff'], ['common', 'Common', '#c8c0d8']];
})();
