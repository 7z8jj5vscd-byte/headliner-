/* Final Cut: static game data. Real franchises, characters, actors, directors, studios, agencies and
   award shows appear by name; every storyline, casting result and box office number is invented. */
(function (root) {
const D = {};

// ------------------------------------------------------------------ look
D.SKINS = ['#ffe0c7', '#f6c7a1', '#e0a979', '#c68655', '#a0643a', '#7a4a2a', '#55331d'];
D.HAIR_COLORS = ['#1b1b1f', '#4a2f1d', '#8a5a2b', '#d9b26b', '#f2e6c2', '#b8352f', '#9aa0a8', '#e9e9ee', '#5d7bff', '#ff7ab8'];
D.EYE_COLORS = ['#1d1d24', '#4a2f1d', '#3c6e9e', '#3e7d4a', '#7a6a3a', '#6b6f78'];
D.CLOTH_COLORS = ['#f4f4f6', '#1d1d24', '#8f1d2c', '#c9a227', '#1f3a5f', '#2f5d50', '#5b3a6b', '#8a6a4f', '#c0c4cc', '#d6334f', '#2e8bff', '#e8d9b8'];
D.BODIES = [{ id: 'slim', name: 'Slim', w: 0.9 }, { id: 'avg', name: 'Average', w: 1 }, { id: 'broad', name: 'Athletic', w: 1.12 }, { id: 'hero', name: 'Superhero', w: 1.24 }];
D.HEIGHTS = [{ id: 's', name: 'Short', h: 0.94 }, { id: 'm', name: 'Average', h: 1 }, { id: 't', name: 'Tall', h: 1.06 }];
D.FACES = [{ id: 'oval', name: 'Oval', sx: 1, sy: 1.06 }, { id: 'round', name: 'Round', sx: 1.06, sy: 1 }, { id: 'square', name: 'Square', sx: 1.08, sy: 1.02 }, { id: 'long', name: 'Long', sx: 0.95, sy: 1.12 }];
D.NOSES = [{ id: 'small', name: 'Small', s: 0.8 }, { id: 'med', name: 'Medium', s: 1 }, { id: 'big', name: 'Strong', s: 1.3 }];
D.LIPS = [{ id: 'thin', name: 'Thin', s: 0.8 }, { id: 'med', name: 'Medium', s: 1 }, { id: 'full', name: 'Full', s: 1.3 }];
D.BROWS = [{ id: 'soft', name: 'Soft' }, { id: 'straight', name: 'Straight' }, { id: 'arched', name: 'Arched' }, { id: 'thick', name: 'Thick' }];
D.FACIAL = [{ id: 'none', name: 'None' }, { id: 'stubble', name: 'Stubble' }, { id: 'beard', name: 'Beard' }, { id: 'mustache', name: 'Mustache' }, { id: 'goatee', name: 'Goatee' }];
D.HAIRS = [['short', 'Short'], ['buzz', 'Buzz cut'], ['long', 'Long'], ['bob', 'Bob'], ['curly', 'Curly'], ['bun', 'Bun'], ['ponytail', 'Ponytail'], ['braids', 'Braids'], ['spiky', 'Textured'], ['slick', 'Slicked back']];
D.TOPS = [['tee', 'T-shirt'], ['hoodie', 'Hoodie'], ['jacket', 'Jacket'], ['suit', 'Suit'], ['tux', 'Tuxedo'], ['gown', 'Gown'], ['tank', 'Tank top'], ['corset', 'Corset top'], ['sequin', 'Sequin top'], ['puffer', 'Puffer'], ['hero', 'Hero suit']];
D.BOTTOMS = [['jeans', 'Jeans'], ['slacks', 'Slacks'], ['shorts', 'Shorts'], ['skirt', 'Skirt'], ['leather', 'Leather pants']];
D.SHOES = [['sneakers', 'Sneakers'], ['boots', 'Boots'], ['loafers', 'Loafers'], ['heels', 'Heels']];
D.ACCS = [['none', 'Nothing'], ['shades', 'Sunglasses'], ['cap', 'Cap'], ['beanie', 'Beanie'], ['chain', 'Chain'], ['glasses', 'Glasses'], ['earrings', 'Earrings']];

// ------------------------------------------------------------------ actor
D.SKILLS = [
  ['drama', 'Drama', 'Range and emotional depth. Key for awards.'],
  ['comedy', 'Comedy', 'Timing and wit.'],
  ['action', 'Action', 'Fight choreography and stunts.'],
  ['charisma', 'Charisma', 'Screen presence, interviews and chemistry.'],
  ['looks', 'Looks', 'Camera appeal. Helps with leads and brands.'],
  ['fitness', 'Fitness', 'Strength and stamina. Needed for hero roles.'],
  ['voice', 'Voice', 'Vocal work: animation, theater, narration.'],
  ['accents', 'Accents', 'Dialects. Opens international and period roles.'],
];
D.STORIES = [
  // down-to-earth starts
  { id: 'hopeful', grounded: true, name: 'Aspiring actor', d: 'You moved to Los Angeles with two suitcases, a serving job lined up and a stack of headshots. No connections yet.', skills: { drama: 20, comedy: 18, action: 12, charisma: 20, looks: 20, fitness: 18, voice: 14, accents: 12 }, money: 3000, fame: 0, rep: 52, contacts: 0 },
  { id: 'college', grounded: true, name: 'College theater major', d: 'A theater degree from a state school and a lot of Shakespeare. Your professors think you have something.', skills: { drama: 28, comedy: 16, action: 8, charisma: 18, looks: 16, fitness: 14, voice: 22, accents: 20 }, money: 2500, fame: 0, rep: 55, contacts: 1 },
  { id: 'community', grounded: true, name: 'Community theater regular', d: 'Years of weekend productions in your hometown while working a regular job. Now you want to try it for real.', skills: { drama: 24, comedy: 20, action: 8, charisma: 20, looks: 16, fitness: 14, voice: 22, accents: 12 }, money: 6000, fame: 0, rep: 55, contacts: 0 },
  { id: 'background', grounded: true, name: 'Background actor', d: 'You have been an extra in dozens of shows. You know how a set works, and the assistant directors know your name.', skills: { drama: 16, comedy: 16, action: 12, charisma: 18, looks: 20, fitness: 18, voice: 10, accents: 10 }, money: 4000, fame: 0, rep: 58, contacts: 2 },
  { id: 'improv', grounded: true, name: 'Improv performer', d: 'You do sketch shows in a 40-seat theater and teach classes to pay the rent.', skills: { drama: 14, comedy: 30, action: 8, charisma: 24, looks: 16, fitness: 12, voice: 16, accents: 14 }, money: 3500, fame: 0, rep: 54, contacts: 1 },
  { id: 'shorts', grounded: true, name: 'Student film regular', d: 'Your friends are film students, and you have starred in a dozen short films almost nobody has seen.', skills: { drama: 24, comedy: 18, action: 10, charisma: 18, looks: 18, fitness: 14, voice: 12, accents: 14 }, money: 2000, fame: 0, rep: 54, contacts: 2 },
  { id: 'commercial', grounded: true, name: 'Local commercial actor', d: 'You are the face of a regional furniture store. It pays the bills, and people at the grocery store sort of recognize you.', skills: { drama: 14, comedy: 20, action: 10, charisma: 24, looks: 24, fitness: 16, voice: 14, accents: 10 }, money: 12000, fame: 1, rep: 52, contacts: 1 },
  { id: 'changer', grounded: true, name: 'Career changer', d: 'You were a teacher until you finally decided to take the leap. You have some savings and a lot of nerve.', skills: { drama: 18, comedy: 18, action: 10, charisma: 22, looks: 16, fitness: 16, voice: 16, accents: 12 }, money: 25000, fame: 0, rep: 56, contacts: 0 },
  // bigger starts
  { id: 'drama', grounded: true, name: 'Drama school grad', d: 'Three years of Chekhov and student debt. You can act. Nobody knows your name.', skills: { drama: 34, comedy: 18, action: 8, charisma: 18, looks: 20, fitness: 16, voice: 24, accents: 24 }, money: 4000, fame: 1, rep: 55, contacts: 1 },
  { id: 'theater', grounded: true, name: 'Theater kid', d: 'Every school musical, every summer stock. You can belt and you can cry on cue.', skills: { drama: 26, comedy: 22, action: 6, charisma: 22, looks: 18, fitness: 14, voice: 34, accents: 14 }, money: 2500, fame: 1, rep: 55, contacts: 1 },
  { id: 'disney', name: 'Disney Channel alum', d: 'You starred in a teen sitcom. Kids love you. Casting directors smirk.', skills: { drama: 14, comedy: 30, action: 10, charisma: 28, looks: 28, fitness: 18, voice: 22, accents: 6 }, money: 60000, fame: 12, rep: 50, contacts: 2, typecast: 'comedy' },
  { id: 'nepo', name: 'Nepo baby', d: 'Your parent is a two-time Oscar nominee. Doors open. The internet notices.', skills: { drama: 18, comedy: 14, action: 8, charisma: 24, looks: 26, fitness: 16, voice: 14, accents: 16 }, money: 250000, fame: 6, rep: 40, contacts: 4 },
  { id: 'stunt', name: 'Stunt double', d: 'You have fallen down more stairs than anyone in Burbank. Time to show your face.', skills: { drama: 10, comedy: 10, action: 38, charisma: 14, looks: 18, fitness: 38, voice: 8, accents: 8 }, money: 18000, fame: 1, rep: 60, contacts: 2 },
  { id: 'model', name: 'Model turned actor', d: 'Milan, Paris, a fragrance campaign. Now you want lines.', skills: { drama: 10, comedy: 10, action: 10, charisma: 22, looks: 44, fitness: 24, voice: 8, accents: 14 }, money: 45000, fame: 6, rep: 48, contacts: 2 },
  { id: 'creator', name: 'YouTuber', d: 'Two million subscribers for sketch comedy. Hollywood is curious and slightly afraid.', skills: { drama: 8, comedy: 32, action: 8, charisma: 30, looks: 20, fitness: 12, voice: 18, accents: 12 }, money: 30000, fame: 10, rep: 45, contacts: 1, followers: 2e6 },
  { id: 'child', name: 'Former child star', d: 'One iconic role at age nine, then a decade of nothing. People still quote you.', skills: { drama: 22, comedy: 20, action: 10, charisma: 20, looks: 18, fitness: 14, voice: 14, accents: 10 }, money: 15000, fame: 8, rep: 42, contacts: 3, age: 24 },
  { id: 'foreign', name: 'International star', d: 'Huge back home, unknown in Los Angeles. The accent is an asset.', skills: { drama: 28, comedy: 14, action: 18, charisma: 22, looks: 24, fitness: 18, voice: 14, accents: 30 }, money: 80000, fame: 5, rep: 58, contacts: 2 },
  { id: 'indie', name: 'Indie darling', d: 'Your micro-budget film played Sundance. Critics loved it. It made $40,000.', skills: { drama: 32, comedy: 16, action: 6, charisma: 16, looks: 18, fitness: 12, voice: 16, accents: 20 }, money: 9000, fame: 3, rep: 65, contacts: 2, critics: 10 },
];
D.TRAITS = [
  { id: 'method', name: 'Method actor', d: 'Better performances, more clashes on set.' },
  { id: 'charming', name: 'Charming', d: 'Better auditions, interviews and chemistry reads.' },
  { id: 'private', name: 'Private', d: 'Fewer scandals, slower fame.' },
  { id: 'scandal', name: 'Scandal magnet', d: 'Fame grows fast. So do the headlines.' },
  { id: 'perfectionist', name: 'Perfectionist', d: 'Skills grow faster, energy drains faster.' },
  { id: 'crowd', name: 'Crowd-pleaser', d: 'Audiences love you. Critics are harder to win.' },
];
D.GOALS = [
  { id: 'oscar', name: 'Win an Oscar', d: 'Take home an Academy Award for acting.' },
  { id: 'franchise', name: 'Lead a franchise', d: 'Headline three films in one franchise.' },
  { id: 'director', name: 'Become a director', d: 'Direct a film that earns a 90%+ critics score.' },
  { id: 'money', name: 'Highest-paid actor', d: 'Earn $50 million or more in one year.' },
];
D.CITIES = ['Los Angeles', 'New York', 'Atlanta', 'Chicago', 'London', 'Dublin', 'Toronto', 'Sydney', 'Lagos', 'Mumbai', 'Seoul', 'Mexico City', 'São Paulo', 'Madrid', 'Paris', 'Glasgow'];

// ------------------------------------------------------------------ weekly activities
D.ACTIVITIES = [
  { id: 'class', name: 'Acting class', cost: 20, price: 300, gives: { drama: 2.2, comedy: 0.6 }, d: 'Scene study with a working coach.' },
  { id: 'improv', name: 'Improv workshop', cost: 18, price: 150, gives: { comedy: 2.4, charisma: 0.8 }, d: 'Yes, and.' },
  { id: 'gym', name: 'Gym session', cost: 18, price: 80, gives: { fitness: 2.2, looks: 0.5 }, d: 'Build the body roles need.' },
  { id: 'stunt', name: 'Stunt training', cost: 24, price: 400, gives: { action: 2.6, fitness: 0.8 }, d: 'Wire work, falls and fight choreography.' },
  { id: 'accent', name: 'Dialect coach', cost: 14, price: 350, gives: { accents: 2.6 }, d: 'From Glasgow to Georgia.' },
  { id: 'voice', name: 'Voice lessons', cost: 14, price: 250, gives: { voice: 2.4, drama: 0.4 }, d: 'Breath, range, singing.' },
  { id: 'network', name: 'Industry party', cost: 22, price: 200, gives: { charisma: 1 }, contacts: 0.35, d: 'Meet casting directors and producers.' },
  { id: 'post', name: 'Post on Clapper', cost: 8, price: 0, social: true, d: 'Keep your followers engaged.' },
  { id: 'rest', name: 'Rest day', cost: -30, price: 0, d: 'Recover energy and health.' },
];

// ------------------------------------------------------------------ industry
D.STUDIOS = [
  { id: 'marvel', name: 'Marvel Studios', tier: 5 }, { id: 'dc', name: 'DC Studios', tier: 5 }, { id: 'lucas', name: 'Lucasfilm', tier: 5 },
  { id: 'wb', name: 'Warner Bros.', tier: 5 }, { id: 'uni', name: 'Universal', tier: 5 }, { id: 'para', name: 'Paramount', tier: 4 },
  { id: 'sony', name: 'Sony Pictures', tier: 4 }, { id: 'disney', name: 'Disney', tier: 5 }, { id: 'lion', name: 'Lionsgate', tier: 3 },
  { id: 'a24', name: 'A24', tier: 3, prestige: true }, { id: 'neon', name: 'Neon', tier: 2, prestige: true }, { id: 'search', name: 'Searchlight', tier: 3, prestige: true },
  { id: 'focus', name: 'Focus Features', tier: 3, prestige: true }, { id: 'netflix', name: 'Netflix', tier: 4, stream: true }, { id: 'apple', name: 'Apple', tier: 4, stream: true },
  { id: 'amazon', name: 'Amazon MGM', tier: 4 }, { id: 'hbo', name: 'HBO', tier: 4, tv: true }, { id: 'blum', name: 'Blumhouse', tier: 2 }, { id: 'legend', name: 'Legendary', tier: 4 },
  { id: 'eon', name: 'Amazon MGM / Eon', tier: 5 },
];
// [name, prestige 1-5, genres, tag]
D.DIRECTORS = [
  ['Christopher Nolan', 5, 'drama thriller scifi'], ['Greta Gerwig', 5, 'drama comedy'], ['Denis Villeneuve', 5, 'scifi drama'],
  ['Ryan Coogler', 5, 'drama action superhero'], ['Jordan Peele', 4, 'horror thriller'], ['Sean Baker', 4, 'drama comedy'],
  ['Chloé Zhao', 4, 'drama'], ['James Gunn', 4, 'superhero comedy'], ['Matt Reeves', 4, 'superhero thriller'],
  ['the Russo brothers', 3, 'superhero action'], ['Jon Watts', 3, 'superhero comedy'], ['Taika Waititi', 3, 'comedy superhero'],
  ['Sam Raimi', 3, 'horror superhero'], ['Barry Jenkins', 5, 'drama'], ['Celine Song', 4, 'drama romance'],
  ['Yorgos Lanthimos', 5, 'drama comedy'], ['Paul Thomas Anderson', 5, 'drama'], ['Martin Scorsese', 5, 'drama thriller'],
  ['Kathryn Bigelow', 5, 'thriller action'], ['Coralie Fargeat', 4, 'horror'], ['Brady Corbet', 4, 'drama'], ['Edward Berger', 4, 'drama thriller'],
  ['Jon M. Chu', 3, 'musical comedy'], ['Destin Daniel Cretton', 3, 'superhero drama'], ['Shawn Levy', 3, 'comedy superhero'],
  ['Chad Stahelski', 3, 'action'], ['David Leitch', 3, 'action comedy'], ['Rian Johnson', 4, 'thriller scifi comedy'],
  ['Emerald Fennell', 4, 'thriller drama'], ['Ari Aster', 4, 'horror'], ['Robert Eggers', 4, 'horror drama'], ['Bong Joon Ho', 5, 'thriller scifi drama'],
  ['Damien Chazelle', 5, 'musical drama'], ['Guillermo del Toro', 5, 'fantasy horror drama'], ['Gareth Edwards', 3, 'scifi action'],
  ['Christopher McQuarrie', 3, 'action thriller'], ['Andy Muschietti', 3, 'horror superhero'], ['Craig Gillespie', 3, 'drama comedy superhero'],
  ['Halina Reijn', 4, 'thriller drama'], ['RaMell Ross', 4, 'drama'], ['Justin Kuritzky', 2, 'comedy'], ['Mati Diop', 4, 'drama'],
];
// [name, award category 'a' actor / 's' actress, star level 1-5]
D.ACTORS = [
  ['Zendaya', 's', 5], ['Timothée Chalamet', 'a', 5], ['Florence Pugh', 's', 5], ['Austin Butler', 'a', 4], ['Margot Robbie', 's', 5],
  ['Ryan Gosling', 'a', 5], ['Anya Taylor-Joy', 's', 4], ['Jacob Elordi', 'a', 4], ['Sydney Sweeney', 's', 4], ['Glen Powell', 'a', 4],
  ['Paul Mescal', 'a', 4], ['Saoirse Ronan', 's', 4], ['Pedro Pascal', 'a', 5], ['Jenna Ortega', 's', 4], ['Barry Keoghan', 'a', 4],
  ['Emma Stone', 's', 5], ['Jeremy Allen White', 'a', 4], ['Ayo Edebiri', 's', 4], ['Daniel Kaluuya', 'a', 4], ['Lupita Nyong\'o', 's', 4],
  ['Dev Patel', 'a', 4], ['Mikey Madison', 's', 4], ['Cynthia Erivo', 's', 4], ['Josh O\'Connor', 'a', 4], ['Jonathan Bailey', 'a', 4],
  ['Mia Goth', 's', 3], ['Rachel Zegler', 's', 3], ['Tom Holland', 'a', 5], ['Hailee Steinfeld', 's', 4], ['Jack Quaid', 'a', 3],
  ['Riz Ahmed', 'a', 4], ['Sebastian Stan', 'a', 4], ['Colman Domingo', 'a', 4], ['Viola Davis', 's', 5], ['Cillian Murphy', 'a', 5],
  ['Emily Blunt', 's', 5], ['Brendan Fraser', 'a', 4], ['Michelle Yeoh', 's', 5], ['Ke Huy Quan', 'a', 3], ['Demi Moore', 's', 4],
  ['Nicole Kidman', 's', 5], ['Denzel Washington', 'a', 5], ['Keanu Reeves', 'a', 5], ['Scarlett Johansson', 's', 5], ['Chris Evans', 'a', 5],
  ['Ana de Armas', 's', 4], ['Rebecca Ferguson', 's', 4], ['Javier Bardem', 'a', 4], ['Oscar Isaac', 'a', 4], ['Adam Driver', 'a', 4],
  ['Jessie Buckley', 's', 4], ['Lily Gladstone', 's', 3], ['Aaron Pierre', 'a', 3], ['Kingsley Ben-Adir', 'a', 3], ['Mia Threapleton', 's', 3],
  ['Jodie Comer', 's', 4], ['Daisy Edgar-Jones', 's', 3], ['Ncuti Gatwa', 'a', 3], ['Mike Faist', 'a', 3], ['Rose Byrne', 's', 4],
  ['Renate Reinsve', 's', 3], ['Stellan Skarsgård', 'a', 4], ['Fernanda Torres', 's', 3], ['Wagner Moura', 'a', 4], ['Benicio del Toro', 'a', 4],
  ['Amanda Seyfried', 's', 4], ['Kate Hudson', 's', 3], ['Ethan Hawke', 'a', 4], ['Leonardo DiCaprio', 'a', 5], ['Teyana Taylor', 's', 3],
  ['Elle Fanning', 's', 4], ['Joel Edgerton', 'a', 3], ['Ariana Grande', 's', 4], ['Jeremy Strong', 'a', 4], ['Sophie Thatcher', 's', 3],
];

// ------------------------------------------------------------------ franchises
// Established characters: [name, actor, years left on contract from 2027, recast risk 0-1]
// open: characters with no actor right now (can be cast). deep: comic characters not yet adapted.
D.FRANCHISES = [
  { id: 'mcu', name: 'Marvel Cinematic Universe', short: 'MCU', studio: 'marvel', kind: 'superhero', pull: 1.0, freq: 3, color: '#c8102e',
    chars: [
      ['Wanda Maximoff / Scarlet Witch', 'Elizabeth Olsen', 2, .25], ['Peter Parker / Spider-Man', 'Tom Holland', 3, .1], ['Stephen Strange / Doctor Strange', 'Benedict Cumberbatch', 2, .2],
      ['Sam Wilson / Captain America', 'Anthony Mackie', 3, .1], ['Thor', 'Chris Hemsworth', 1, .4], ['Yelena Belova', 'Florence Pugh', 3, .1],
      ['Kate Bishop / Hawkeye', 'Hailee Steinfeld', 3, .15], ['Shang-Chi', 'Simu Liu', 3, .1], ['Carol Danvers / Captain Marvel', 'Brie Larson', 1, .35],
      ['Bucky Barnes', 'Sebastian Stan', 2, .2], ['Wade Wilson / Deadpool', 'Ryan Reynolds', 2, .1], ['Logan / Wolverine', 'Hugh Jackman', 1, .6],
      ['Victor von Doom / Doctor Doom', 'Robert Downey Jr.', 2, .3], ['Reed Richards / Mister Fantastic', 'Pedro Pascal', 3, .1], ['Sue Storm / Invisible Woman', 'Vanessa Kirby', 3, .1],
      ['Johnny Storm / Human Torch', 'Joseph Quinn', 3, .1], ['Ben Grimm / The Thing', 'Ebon Moss-Bachrach', 3, .1], ['Loki', 'Tom Hiddleston', 2, .2],
      ['Kamala Khan / Ms. Marvel', 'Iman Vellani', 3, .1], ['Shuri / Black Panther', 'Letitia Wright', 2, .2], ['Scott Lang / Ant-Man', 'Paul Rudd', 1, .4],
      ['Matt Murdock / Daredevil', 'Charlie Cox', 3, .1], ['Frank Castle / Punisher', 'Jon Bernthal', 2, .2], ['Bruce Banner / Hulk', 'Mark Ruffalo', 1, .4],
      ['Agatha Harkness', 'Kathryn Hahn', 2, .2], ['Riri Williams / Ironheart', 'Dominique Thorne', 2, .2], ['Namor', 'Tenoch Huerta', 2, .2],
    ],
    open: ['Blade', 'Scott Summers / Cyclops', 'Jean Grey', 'Ororo Munroe / Storm', 'Rogue', 'Kurt Wagner / Nightcrawler', 'Hank McCoy / Beast', 'Kitty Pryde', 'Charles Xavier', 'Erik Lehnsherr / Magneto'],
    deep: ['Richard Rider / Nova', 'Adam Brashear / Blue Marvel', 'Johnny Blaze / Ghost Rider', 'Jessica Drew / Spider-Woman', 'Elsa Bloodstone', 'Monica Chang', 'Nico Minoru', 'Amadeus Cho', 'Silver Sable', 'Moon Girl', 'Jubilee', 'Emma Frost', 'Gambit', 'Psylocke', 'Bishop', 'Sentry'],
    legacy: [['Iron Man', 'Tony Stark (Robert Downey Jr.)'], ['Black Widow', 'Natasha Romanoff (Scarlett Johansson)'], ['Captain America', 'Steve Rogers (Chris Evans)'], ['Vision', 'Vision (Paul Bettany)']],
    titles: ['Avengers: Secret Wars', 'X-Men', 'Shang-Chi and the Wreckage', 'Black Panther III', 'Spider-Man: Beyond', 'Doctor Strange: Into the Dark Dimension', 'Young Avengers', 'Armor Wars', 'Blade', 'Fantastic Four: Foundation', 'Thunderbolts: Dark Reign', 'Nova', 'Midnight Sons', 'Captain America: Patriot', 'Avengers: Legacy', 'Deadpool & the X-Force', 'Strange Academy', 'Champions', 'Uncanny X-Men', 'Ghost Rider', 'Scarlet Witch', 'Secret Invasion: Endgame', 'Warlock', 'Annihilation'],
    tv: ['Daredevil: Born Again', 'Wonder Man', 'VisionQuest', 'Moon Knight', 'Ironheart', 'Agents of A.R.M.O.R.', 'Marvel Zombies'],
    origins: ['a Sokovian experiment survivor', 'a Stark Industries test pilot', 'a Kree defector', 'a mutant hiding in Madripoor', 'a Wakandan scientist', 'a former Hydra sleeper agent', 'a sorcerer trained at Kamar-Taj', 'a variant from a collapsed timeline', 'a Damage Control investigator', 'a teenager bitten by something worse than a spider'] },
  { id: 'dcu', name: 'DC Universe', short: 'DCU', studio: 'dc', kind: 'superhero', pull: 0.85, freq: 2, color: '#0476f2',
    chars: [
      ['Clark Kent / Superman', 'David Corenswet', 4, .05], ['Lois Lane', 'Rachel Brosnahan', 4, .05], ['Lex Luthor', 'Nicholas Hoult', 3, .1],
      ['Kara Zor-El / Supergirl', 'Milly Alcock', 4, .05], ['Guy Gardner / Green Lantern', 'Nathan Fillion', 2, .2], ['Kendra Saunders / Hawkgirl', 'Isabela Merced', 3, .1],
      ['Michael Holt / Mister Terrific', 'Edi Gathegi', 3, .1], ['Peacemaker', 'John Cena', 2, .2], ['Lobo', 'Jason Momoa', 2, .2],
      ['John Stewart / Green Lantern', 'Aaron Pierre', 4, .05], ['Hal Jordan / Green Lantern', 'Kyle Chandler', 3, .1], ['Amanda Waller', 'Viola Davis', 2, .2],
      ['Clayface', 'Tom Rhys Harries', 2, .2], ['Brainiac', 'Lars Eidinger', 2, .2],
    ],
    open: ['Bruce Wayne / Batman', 'Diana / Wonder Woman', 'Damian Wayne / Robin', 'Arthur Curry / Aquaman', 'Barry Allen / The Flash', 'J\'onn J\'onzz / Martian Manhunter', 'Selina Kyle / Catwoman', 'Zatanna', 'Dick Grayson / Nightwing', 'Victor Stone / Cyborg'],
    deep: ['Booster Gold', 'Blue Beetle', 'Swamp Thing', 'Raven', 'Starfire', 'Black Canary', 'Constantine', 'Big Barda', 'Mister Miracle', 'Plastic Man', 'Jessica Cruz', 'The Question', 'Doctor Fate', 'Vixen'],
    legacy: [['Batman', 'Bruce Wayne'], ['Superman', 'Kal-El'], ['Green Lantern', 'the Corps']],
    titles: ['Man of Tomorrow', 'The Brave and the Bold', 'Wonder Woman', 'Swamp Thing', 'Justice League', 'Booster Gold', 'Lanterns: Sector 2814', 'Teen Titans', 'Aquaman', 'Batman: The Court of Owls', 'Supergirl II', 'The Authority', 'Flashpoint', 'Constantine', 'Superman: Kingdom'],
    tv: ['Lanterns', 'Peacemaker', 'Paradise Lost', 'Booster Gold', 'Waller'],
    origins: ['a Kryptonian survivor', 'a Gotham detective', 'an Amazon exile', 'a Green Lantern recruit', 'a meta-human from Bialya', 'a Checkmate agent', 'a Thanagarian soldier', 'a LexCorp scientist with a secret', 'a Daily Planet reporter'] },
  { id: 'elseworlds', name: 'DC Elseworlds', short: 'Elseworlds', studio: 'wb', kind: 'superhero', pull: 0.7, freq: 1, color: '#2d2d2d',
    chars: [['Bruce Wayne / The Batman', 'Robert Pattinson', 3, .1], ['Oz Cobb / The Penguin', 'Colin Farrell', 2, .2], ['James Gordon', 'Jeffrey Wright', 2, .2]],
    open: ['Harvey Dent', 'Selina Kyle', 'Alfred Pennyworth', 'Mister Freeze', 'Poison Ivy'], deep: ['Hush', 'Talia al Ghul', 'Scarecrow'], legacy: [['The Joker', 'Joaquin Phoenix']],
    titles: ['The Batman Part II', 'The Batman Part III', 'Joker: Origins', 'Gotham Nights'], tv: ['The Penguin', 'Arkham'], origins: ['a Gotham city councilor', 'an Arkham doctor', 'a GCPD rookie'] },
  { id: 'spiderverse', name: 'Spider-Verse', short: 'Spider-Verse', studio: 'sony', kind: 'animation', pull: 0.75, freq: 1, color: '#e2231a',
    chars: [['Miles Morales / Spider-Man', 'Shameik Moore', 3, .05], ['Gwen Stacy / Spider-Woman', 'Hailee Steinfeld', 3, .05], ['Miguel O\'Hara / Spider-Man 2099', 'Oscar Isaac', 2, .1]],
    open: ['Spider-Punk\'s rival', 'Spider-Man of Earth-42'], deep: ['Spider-Byte', 'Silk', 'Scarlet Spider'], legacy: [],
    titles: ['Spider-Man: Beyond the Spider-Verse', 'Spider-Gwen', 'Spider-Verse: Spider-Society'], tv: ['Spider-Society'], origins: ['a spider from a dying dimension', 'a Spot variant'], voice: true },
  { id: 'starwars', name: 'Star Wars', short: 'Star Wars', studio: 'lucas', kind: 'scifi', pull: 0.85, freq: 1, color: '#ffe81f',
    chars: [['Rey', 'Daisy Ridley', 2, .15], ['Din Djarin / The Mandalorian', 'Pedro Pascal', 2, .2], ['Ahsoka Tano', 'Rosario Dawson', 2, .2], ['Cassian Andor', 'Diego Luna', 1, .5]],
    open: ['a young Obi-Wan Kenobi', 'Ezra Bridger', 'a Jedi of the Old Republic'], deep: ['Darth Revan', 'Mara Jade', 'Kyle Katarn', 'Starkiller', 'Doctor Aphra', 'Cal Kestis'],
    legacy: [['Jedi Order', 'Luke Skywalker (Mark Hamill)'], ['Leia', 'Leia Organa (Carrie Fisher)']],
    titles: ['Star Wars: Starfighter', 'Star Wars: New Jedi Order', 'Star Wars: Dawn of the Jedi', 'Star Wars: Rogue Squadron', 'Star Wars: The Old Republic', 'Star Wars: Heir to the Empire'], tv: ['Ahsoka', 'Star Wars: Rangers'],
    origins: ['a Jedi survivor', 'an Imperial defector', 'a Mandalorian foundling', 'a smuggler from the Outer Rim', 'a Sith acolyte'] },
  { id: 'bond', name: 'James Bond', short: 'Bond', studio: 'eon', kind: 'action', pull: 0.8, freq: 0.5, color: '#b8a36b',
    chars: [], open: ['James Bond / 007', 'M', 'Q', 'Eve Moneypenny', 'Felix Leiter', 'the Bond villain'], deep: ['Ernst Stavro Blofeld', 'Vesper Lynd\'s sister', 'Rosa Klebb'],
    legacy: [['007', 'Daniel Craig']], titles: ['Bond 26', 'Bond 27', 'Bond 28'], tv: [], origins: ['a MI6 field agent', 'a SPECTRE operative', 'a CIA liaison'] },
  { id: 'hp', name: 'Harry Potter (HBO series)', short: 'Harry Potter', studio: 'hbo', kind: 'fantasy', pull: 0.8, freq: 1, color: '#740001', tvOnly: true,
    chars: [['Harry Potter', 'Dominic McLaughlin', 6, .02], ['Hermione Granger', 'Arabella Stanton', 6, .02], ['Ron Weasley', 'Alastair Stout', 6, .02], ['Severus Snape', 'Paapa Essiedu', 6, .05], ['Albus Dumbledore', 'John Lithgow', 4, .1], ['Minerva McGonagall', 'Janet McTeer', 5, .05], ['Rubeus Hagrid', 'Nick Frost', 5, .05]],
    open: ['Sirius Black', 'Remus Lupin', 'Bellatrix Lestrange', 'Gilderoy Lockhart', 'Cedric Diggory', 'Nymphadora Tonks', 'Lord Voldemort', 'Mad-Eye Moody', 'Dolores Umbridge'], deep: [], legacy: [],
    titles: [], tv: ['Harry Potter: Season 2', 'Harry Potter: Season 3', 'Harry Potter: Season 4', 'Harry Potter: Season 5'], origins: [] },
  { id: 'dune', name: 'Dune', short: 'Dune', studio: 'legend', kind: 'scifi', pull: 0.75, freq: 0.5, color: '#c9862b',
    chars: [['Paul Atreides', 'Timothée Chalamet', 1, .3], ['Chani', 'Zendaya', 1, .3], ['Lady Jessica', 'Rebecca Ferguson', 1, .3]],
    open: ['Leto II', 'Ghanima', 'Duncan Idaho ghola'], deep: ['Farad\'n', 'the Preacher'], legacy: [], titles: ['Dune: Part Three', 'Dune: Children of Dune'], tv: ['Dune: Prophecy'], origins: ['a Fremen fedaykin', 'a Bene Gesserit acolyte'] },
  { id: 'hunger', name: 'The Hunger Games', short: 'Hunger Games', studio: 'lion', kind: 'action', pull: 0.6, freq: 0.5, color: '#d4a017',
    chars: [['Haymitch Abernathy', 'Joseph Zada', 1, .4]], open: ['a District 1 Career tribute', 'a new Head Gamemaker', 'President Snow (young)'], deep: [], legacy: [['the Mockingjay', 'Katniss Everdeen (Jennifer Lawrence)']],
    titles: ['The Hunger Games: The 25th Quell', 'The Hunger Games: Capitol'], tv: [], origins: ['a tribute from District 4', 'a Capitol stylist'] },
  { id: 'fast', name: 'Fast & Furious', short: 'Fast', studio: 'uni', kind: 'action', pull: 0.6, freq: 0.5, color: '#ff6a00',
    chars: [['Dominic Toretto', 'Vin Diesel', 1, .3]], open: ['the new crew driver', 'the villain\'s enforcer'], deep: [], legacy: [['the family', 'Brian O\'Conner (Paul Walker)']],
    titles: ['Fast X: Part 2', 'Fast Forever'], tv: [], origins: ['a street racer from Tokyo', 'an ex-Agency driver'] },
  { id: 'wick', name: 'John Wick', short: 'John Wick', studio: 'lion', kind: 'action', pull: 0.6, freq: 0.5, color: '#4b0f0f',
    chars: [['John Wick', 'Keanu Reeves', 1, .4]], open: ['a High Table adjudicator', 'a Continental manager'], deep: [], legacy: [['Baba Yaga', 'John Wick (Keanu Reeves)']],
    titles: ['John Wick: Chapter 5', 'Ballerina 2', 'The Continental: Tokyo'], tv: ['The Continental'], origins: ['an assassin from the Ruska Roma', 'a disgraced Continental concierge'] },
  { id: 'jurassic', name: 'Jurassic World', short: 'Jurassic', studio: 'uni', kind: 'action', pull: 0.65, freq: 0.5, color: '#3c6e3c',
    chars: [['Zora Bennett', 'Scarlett Johansson', 1, .3]], open: ['a paleogeneticist', 'an InGen mercenary'], deep: [], legacy: [], titles: ['Jurassic World: Extinction', 'Jurassic World: Isla Sorna'], tv: [], origins: ['a dinosaur wrangler', 'a corporate fixer'] },
];

// original hero generator parts
D.CODENAMES = ['Vesper', 'Ironclad', 'Nightjar', 'Halcyon', 'Riptide', 'Kestrel', 'Quasar', 'Banshee', 'Obsidian', 'Wraithe', 'Solstice', 'Tempest', 'Lodestar', 'Cinder', 'Vantage', 'Eclipse', 'Nomad', 'Sable', 'Paragon', 'Rook', 'Hexen', 'Arclight', 'Monsoon', 'Grimoire', 'Static', 'Talon', 'Aurora', 'Mirage', 'Bastion', 'Vex'];
D.POWERS = ['telekinesis', 'controls light', 'phases through matter', 'super strength', 'reads minds', 'bends time a few seconds', 'controls weather', 'cosmic energy blasts', 'a nanotech suit', 'shapeshifting', 'mystic arts', 'sonic screams', 'gravity control', 'super speed', 'no powers, just training'];
D.ROLE_TYPES = ['hero', 'villain', 'anti-hero', 'mentor', 'sidekick'];
D.HUMAN_NAMES = ['Mara Voss', 'Elias Crane', 'Nadia Petrov', 'Cole Mercer', 'Iris Calder', 'Dante Rourke', 'Sana Okoye', 'Felix Varga', 'Tamsin Hale', 'Jonah Strand', 'Lena Morrow', 'Rafe Castellan', 'Zara Quill', 'Owen Thorne', 'Mira Solano', 'Kit Marlowe'];
D.ABILITIES = {
  scifi: ['strong in the Force', 'an ace starfighter pilot', 'a bounty hunter', 'a brilliant engineer', 'a spice smuggler', 'a trained Sith assassin'],
  action: ['ex-special forces', 'a getaway driver', 'an expert marksman', 'a hacker', 'a con artist', 'a hand-to-hand specialist'],
  fantasy: ['a gifted young witch', 'a dark wizard', 'a Ministry Auror', 'a Hogwarts professor', 'a metamorphmagus'],
};

// ------------------------------------------------------------------ non-franchise film titles
D.GENRES = [
  { id: 'drama', name: 'Drama', skills: { drama: 0.6, charisma: 0.2, accents: 0.2 }, prestige: 1.2, audience: 0.6 },
  { id: 'comedy', name: 'Comedy', skills: { comedy: 0.6, charisma: 0.3, looks: 0.1 }, prestige: 0.6, audience: 0.9 },
  { id: 'action', name: 'Action', skills: { action: 0.5, fitness: 0.3, charisma: 0.2 }, prestige: 0.4, audience: 1.1 },
  { id: 'thriller', name: 'Thriller', skills: { drama: 0.5, charisma: 0.3, action: 0.2 }, prestige: 0.8, audience: 0.9 },
  { id: 'horror', name: 'Horror', skills: { drama: 0.5, voice: 0.2, fitness: 0.3 }, prestige: 0.5, audience: 0.9 },
  { id: 'romance', name: 'Romance', skills: { charisma: 0.4, looks: 0.3, drama: 0.3 }, prestige: 0.6, audience: 0.8 },
  { id: 'scifi', name: 'Sci-fi', skills: { drama: 0.3, action: 0.3, fitness: 0.2, charisma: 0.2 }, prestige: 0.7, audience: 1.0 },
  { id: 'musical', name: 'Musical', skills: { voice: 0.6, charisma: 0.2, drama: 0.2 }, prestige: 0.9, audience: 0.8 },
  { id: 'period', name: 'Period drama', skills: { drama: 0.5, accents: 0.4, looks: 0.1 }, prestige: 1.3, audience: 0.5 },
  { id: 'biopic', name: 'Biopic', skills: { drama: 0.5, accents: 0.3, voice: 0.2 }, prestige: 1.4, audience: 0.7 },
  { id: 'superhero', name: 'Superhero', skills: { action: 0.35, fitness: 0.3, charisma: 0.2, comedy: 0.15 }, prestige: 0.3, audience: 1.4 },
  { id: 'animation', name: 'Animation', skills: { voice: 0.7, comedy: 0.2, charisma: 0.1 }, prestige: 0.5, audience: 1.1 },
  { id: 'fantasy', name: 'Fantasy', skills: { drama: 0.3, accents: 0.3, action: 0.2, looks: 0.2 }, prestige: 0.6, audience: 1.0 },
];
D.TITLE_A = ['The', 'Last', 'Silent', 'Golden', 'Broken', 'Beautiful', 'Midnight', 'Northern', 'Burning', 'Little', 'Paper', 'Velvet', 'Second', 'Wild', 'Distant', 'Glass', 'Hollow', 'Electric', 'Quiet'];
D.TITLE_B = ['Harbor', 'Summer', 'Kingdom', 'Witness', 'Orchard', 'Signal', 'Frontier', 'Inheritance', 'Weekend', 'Highway', 'Confession', 'Tide', 'Season', 'Empire', 'Lighthouse', 'Daughters', 'Sons', 'Heist', 'Arrival', 'Testament', 'Ballad', 'Republic', 'Garden', 'Machine', 'Proposal', 'Reunion'];
D.TITLE_ONE = ['Saltburn Road', 'Paper Moons', 'Undertow', 'Night Shift', 'Bloodline', 'The Understudy', 'Kingmaker', 'Hollowpoint', 'Low Tide', 'The Gilded Hour', 'Wildfire Season', 'Exit Strategy', 'The Last Good Year', 'Stray Dogs', 'Overtime', 'Sister Moon', 'The Fixer', 'Afterglow', 'Mercy Street', 'Deadweight', 'The Long Con', 'Glasshouse', 'Run Silent', 'Rich Kids', 'Old Money', 'A Kind of Heaven', 'Ricochet', 'The Pretender', 'Northbound', 'Ghost Light'];
D.TV_TITLES = ['The Firm', 'Bad Blood', 'Saint Agnes', 'Big Little Town', 'Succession of Kings', 'The Night Desk', 'Ward 9', 'Pilot Season', 'Lakeside', 'Silicon Hills', 'The Bureau', 'Second Chances', 'Prestige', 'Kitchen Confidential', 'The Residents', 'Gold Coast', 'Haunting of Ashgrove'];
D.THEATER = ['Hamlet', 'A Streetcar Named Desire', 'Death of a Salesman', 'Cabaret', 'Who\'s Afraid of Virginia Woolf?', 'Sunset Boulevard', 'Macbeth', 'Angels in America', 'Hedda Gabler', 'Sweeney Todd', 'Romeo and Juliet', 'Our Town'];
D.COMMERCIALS = ['a fast food chain', 'a car insurance company', 'a phone carrier', 'a sports drink', 'a cereal brand', 'a cruise line', 'a mattress company', 'a streaming app'];

// ------------------------------------------------------------------ people
D.AGENCIES = [
  { id: 'none', name: 'No agent', tier: 0, cut: 0, need: 0, d: 'You find your own auditions.' },
  { id: 'boutique', name: 'Boutique agency', tier: 1, cut: 0.1, need: 0, d: 'Small roster, scrappy. Gets you in rooms.' },
  { id: 'gersh', name: 'Gersh', tier: 2, cut: 0.1, need: 12, d: 'Respected mid-size agency.' },
  { id: 'uta', name: 'UTA', tier: 3, cut: 0.1, need: 30, d: 'Big agency, big packages.' },
  { id: 'wme', name: 'WME', tier: 4, cut: 0.1, need: 50, d: 'Franchise and brand power.' },
  { id: 'caa', name: 'CAA', tier: 5, cut: 0.1, need: 65, d: 'The top of the mountain.' },
];
D.TEAM = [
  { id: 'manager', name: 'Manager', d: 'Plans your career. Takes 5%. Better brand deals and less burnout.', levels: [0, 0.05, 0.05, 0.05], fee: [0, 0, 0, 0], need: [0, 0, 15, 40] },
  { id: 'publicist', name: 'Publicist', d: 'Shapes headlines. Softens scandals.', fee: [0, 600, 2500, 9000], need: [0, 3, 20, 45] },
  { id: 'stylist', name: 'Stylist', d: 'Red carpets, covers and best-dressed lists.', fee: [0, 400, 2000, 7000], need: [0, 5, 25, 50] },
  { id: 'trainer', name: 'Trainer', d: 'Faster fitness and action gains, body transformations.', fee: [0, 300, 1500, 5000], need: [0, 0, 15, 35] },
  { id: 'lawyer', name: 'Entertainment lawyer', d: 'Better clauses, wins disputes.', fee: [0, 500, 2500, 8000], need: [0, 0, 20, 40] },
];
D.TEAM_NAMES = ['Dana Whitlock', 'Marcus Reyes', 'Priya Shah', 'Leo Brennan', 'Ines Navarro', 'Theo Park', 'Ruth Abernathy', 'Kofi Mensah', 'Sasha Klein', 'Jules Moreau', 'Ari Feldman', 'Nadia Okafor'];
D.LOVE = ['Rowan Hale', 'Elio Marchetti', 'Simone Archer', 'Jasper Quinn', 'Noor Haddad', 'Cass Delgado', 'Ivy Laurent', 'Miles Ashby', 'Tessa Vaughn', 'Rafael Ortiz', 'June Calloway', 'Kai Morrow'];
D.LOVE_JOBS = ['a musician', 'a chef', 'a novelist', 'a fellow actor', 'an athlete', 'a fashion designer', 'a surgeon', 'a photographer', 'a screenwriter', 'a DJ'];

// ------------------------------------------------------------------ media and awards
D.TALK = [
  { id: 'fallon', name: 'The Tonight Show Starring Jimmy Fallon', fame: 25 }, { id: 'kimmel', name: 'Jimmy Kimmel Live!', fame: 20 },
  { id: 'meyers', name: 'Late Night with Seth Meyers', fame: 15 }, { id: 'norton', name: 'The Graham Norton Show', fame: 30 },
  { id: 'hotones', name: 'Hot Ones', fame: 35 }, { id: 'snl', name: 'Saturday Night Live (host)', fame: 55 },
];
D.MAGS = ['Vanity Fair', 'GQ', 'Vogue', 'Variety', 'The Hollywood Reporter', 'Esquire', 'Rolling Stone', 'W Magazine', 'Time 100'];
D.BRANDS = [
  { cat: 'Fragrance', names: ['Maison Orrel', 'Vantier Parfums', 'Lys Noir'], base: 400000 },
  { cat: 'Watches', names: ['Haldane Genève', 'Corvin', 'Altimer'], base: 600000 },
  { cat: 'Fashion house', names: ['Castellane', 'Boréal', 'Varenna'], base: 900000 },
  { cat: 'Sportswear', names: ['Stride', 'Apex Athletic', 'Northrun'], base: 500000 },
  { cat: 'Beauty', names: ['Glowform', 'Halcyon Skin', 'Muse Beauty'], base: 350000 },
  { cat: 'Cars', names: ['Ardent Motors', 'Velaro', 'Kestrel EV'], base: 1200000 },
];
D.OUTLETS = ['Deadline', 'Variety', 'The Hollywood Reporter', 'IndieWire', 'Vulture', 'Empire', 'The Guardian', 'The New Yorker', 'RogerEbert.com', 'Collider'];
D.SOCIAL = 'Clapper';
// week of the year each show happens; noms a few weeks earlier
D.AWARDS = [
  { id: 'globes', name: 'Golden Globes', week: 2, noms: 50, kind: 'film', short: 'Globe', weight: 0.8 },
  { id: 'critics', name: 'Critics Choice Awards', week: 3, noms: 51, kind: 'film', short: 'Critics Choice', weight: 0.7 },
  { id: 'sag', name: 'Actor Awards (SAG)', week: 8, noms: 2, kind: 'film', short: 'SAG', weight: 0.9 },
  { id: 'bafta', name: 'BAFTA Film Awards', week: 7, noms: 3, kind: 'film', short: 'BAFTA', weight: 0.85 },
  { id: 'oscars', name: 'Academy Awards', week: 10, noms: 4, kind: 'film', short: 'Oscar', weight: 1 },
  { id: 'tonys', name: 'Tony Awards', week: 23, noms: 18, kind: 'theater', short: 'Tony', weight: 0.8 },
  { id: 'emmys', name: 'Primetime Emmys', week: 37, noms: 29, kind: 'tv', short: 'Emmy', weight: 0.9 },
  { id: 'razzies', name: 'Golden Raspberry Awards', week: 9, noms: 4, kind: 'razzie', short: 'Razzie', weight: 0 },
];
D.FESTIVALS = [
  { id: 'sundance', name: 'Sundance', week: 4, prestige: 3 }, { id: 'cannes', name: 'Cannes', week: 20, prestige: 5 },
  { id: 'venice', name: 'Venice', week: 35, prestige: 5 }, { id: 'tiff', name: 'TIFF', week: 37, prestige: 4 },
];
D.EVENTS_CAL = [
  { id: 'comiccon', name: 'San Diego Comic-Con', week: 30 }, { id: 'metgala', name: 'Met Gala', week: 18 },
  { id: 'fashion', name: 'Paris Fashion Week', week: 39 }, { id: 'cinemacon', name: 'CinemaCon', week: 14 },
];

// ------------------------------------------------------------------ lifestyle
D.HOMES = [
  { id: 'h0', name: 'Shared apartment in North Hollywood', price: 0, rent: 280, rest: 0 },
  { id: 'h1', name: 'Studio in Silver Lake', price: 0, rent: 650, rest: 4, need: 0 },
  { id: 'h2', name: 'Bungalow in Los Feliz', price: 1800000, upkeep: 1500, rest: 8 },
  { id: 'h3', name: 'Hollywood Hills house', price: 6500000, upkeep: 5000, rest: 12 },
  { id: 'h4', name: 'Manhattan penthouse', price: 14000000, upkeep: 9000, rest: 12 },
  { id: 'h5', name: 'Malibu beach estate', price: 32000000, upkeep: 18000, rest: 16 },
  { id: 'h6', name: 'Lake Como villa', price: 48000000, upkeep: 22000, rest: 18 },
];
D.CARS = [
  { id: 'c1', name: 'Used hatchback', price: 9000 }, { id: 'c2', name: 'Electric sedan', price: 52000 },
  { id: 'c3', name: 'Vintage convertible', price: 140000 }, { id: 'c4', name: 'Italian supercar', price: 380000 }, { id: 'c5', name: 'Armored SUV with driver', price: 600000 },
];
D.INVEST = [
  { id: 'index', name: 'Index fund', risk: 0.12, ret: 0.07 }, { id: 'realestate', name: 'Real estate', risk: 0.08, ret: 0.05 },
  { id: 'startup', name: 'Tech startups', risk: 0.6, ret: 0.15 }, { id: 'tequila', name: 'Your own tequila brand', risk: 0.4, ret: 0.18, need: 40 },
];

// ------------------------------------------------------------------ audition beats
D.TONES = [['grounded', 'Grounded'], ['intense', 'Intense'], ['vulnerable', 'Vulnerable'], ['wry', 'Wry'], ['big', 'Big'], ['cold', 'Cold']];
D.BEAT_HINTS = {
  drama: [['vulnerable', 'the moment the truth comes out'], ['grounded', 'a quiet confrontation at the kitchen table'], ['intense', 'the final breakdown']],
  comedy: [['wry', 'a deadpan reaction to chaos'], ['big', 'the physical bit'], ['grounded', 'playing the absurd straight']],
  action: [['cold', 'the standoff'], ['intense', 'the fight beat'], ['wry', 'the one-liner after the explosion']],
  thriller: [['cold', 'the interrogation'], ['grounded', 'lying convincingly'], ['intense', 'the reveal']],
  horror: [['vulnerable', 'hearing something in the dark'], ['intense', 'the scream'], ['grounded', 'convincing others it is real']],
  romance: [['vulnerable', 'the confession'], ['wry', 'the meet-cute banter'], ['grounded', 'the goodbye at the airport']],
  scifi: [['grounded', 'selling the impossible'], ['intense', 'the countdown'], ['vulnerable', 'the message home']],
  musical: [['big', 'the showstopper'], ['vulnerable', 'the ballad'], ['wry', 'the patter song']],
  period: [['cold', 'the ballroom insult'], ['vulnerable', 'the letter scene'], ['grounded', 'the inheritance dispute']],
  biopic: [['grounded', 'the interview recreation'], ['intense', 'the famous speech'], ['vulnerable', 'the private low point']],
  superhero: [['wry', 'the banter before battle'], ['intense', 'the sacrifice'], ['grounded', 'the secret identity reveal']],
  animation: [['big', 'the comic sidekick moment'], ['vulnerable', 'the heart-to-heart'], ['wry', 'the running gag']],
  fantasy: [['intense', 'the oath'], ['cold', 'the betrayal'], ['vulnerable', 'the farewell']],
};

// ------------------------------------------------------------------ on-set events (set during shoots)
// each: text, choices [label, effects]; effects keys: perf, rep, energy, happy, health, rel (director), costar, money, fame
D.SET_EVENTS = [
  { t: 'The director wants a 40th take of the same line.', c: [['Give it everything again', { perf: 3, energy: -8 }], ['Ask what they are looking for', { perf: 2, rel: 2 }], ['Refuse, take 39 was fine', { perf: -1, rel: -6, rep: -2 }]] },
  { t: 'Your co-star {costar} keeps improvising and stepping on your lines.', c: [['Improvise right back', { perf: 2, costar: 3, req: 'comedy' }], ['Talk to them privately', { costar: 4, rep: 1 }], ['Complain to the director', { costar: -8, rel: 1 }]] },
  { t: 'The stunt coordinator offers to let you do the big fall yourself.', c: [['Do it yourself', { perf: 4, fame: 1, risk: 'injury', req: 'action' }], ['Let the double do it', {}], ['Do half, double finishes', { perf: 2 }]] },
  { t: 'A crew member leaks a photo of you in costume.', c: [['Post your own reveal first', { fame: 2, rel: -3 }], ['Stay silent', {}], ['Joke about it on Clapper', { fame: 1, rep: 1 }]] },
  { t: 'You found something real in the scene and the script supervisor says it is off-book.', c: [['Fight to keep it', { perf: 3, rel: -2 }], ['Do both versions', { perf: 2, energy: -6 }], ['Drop it', { perf: -1 }]] },
  { t: 'Night shoot in the rain. Everyone is miserable.', c: [['Buy the crew coffee and tacos', { money: -2500, rep: 3, happy: 2 }], ['Stay in your trailer between takes', { energy: 6, rep: -1 }], ['Lead a crew sing-along', { rep: 2, energy: -4, req: 'voice' }]] },
  { t: 'The studio sends rewrites that cut your best scene.', c: [['Push back through your agent', { perf: 2, rel: -3, rep: -1 }], ['Accept and make the new scene work', { perf: 1, rel: 3 }], ['Ask the director to fight for it', { rel: 1, perf: 1 }]] },
  { t: 'You and {costar} have real chemistry. The tabloids are already guessing.', c: [['Lean into it for promo', { fame: 3, costar: 2 }], ['Shut the rumors down', { rep: 2 }], ['Say nothing', { fame: 1 }]] },
  { t: 'Your trainer says you can drop the last 2% body fat for the shirtless scene.', c: [['Go extreme', { perf: 2, health: -10, fame: 2 }], ['Stay healthy', { health: 2 }]] },
  { t: 'Production is behind schedule. The director asks if you can work Saturday.', c: [['Yes', { rel: 4, energy: -12 }], ['Only for half a day', { rel: 1, energy: -5 }], ['No, your contract says six days', { rel: -4 }]] },
  { t: 'A method moment: staying in character between takes is unnerving the cast.', c: [['Stay in character', { perf: 4, costar: -5, rep: -1, req: 'method' }], ['Break between takes', { costar: 2 }]] },
  { t: 'The VFX supervisor needs you to react to a tennis ball for three hours.', c: [['Commit like it is Shakespeare', { perf: 3, energy: -6 }], ['Phone it in', { perf: -2 }], ['Ask for concept art to look at', { perf: 2 }]] },
  { t: 'A set visit from studio executives. They want a word.', c: [['Charm them', { rep: 2, energy: -4, req: 'charisma' }], ['Keep it brief', {}], ['Pitch them your passion project', { rep: 1, contacts: 1 }]] },
];
D.RANDOM_EVENTS = [
  { id: 'paps', t: 'Paparazzi caught you leaving a restaurant at 2 a.m.', min: 25, c: [['Wave and smile', { fame: 1 }], ['Hide your face', { rep: 1 }], ['Confront them', { fame: 3, rep: -4 }]] },
  { id: 'oldpost', t: 'Someone dug up an old post of yours. It has not aged well.', min: 20, scandal: true, c: [['Apologize sincerely', { rep: -2 }], ['Delete and ignore', { rep: -5 }], ['Double down', { rep: -10, fame: 3 }]] },
  { id: 'fancast', t: 'Fans keep fan-casting you as {char} in the {fr}.', min: 15, c: [['Hint you are interested', { fame: 2, fancast: 1 }], ['Say you are focused on other work', { rep: 1 }]] },
  { id: 'charity', t: 'A children\'s hospital asks you to visit.', min: 10, c: [['Visit, quietly', { rep: 4, happy: 4, energy: -10 }], ['Visit with cameras', { rep: 2, fame: 2, energy: -10 }], ['Send a signed photo', { rep: 1 }]] },
  { id: 'feud', t: '{actor} said in an interview that franchise actors "are not really acting".', min: 30, c: [['Fire back on Clapper', { fame: 3, rep: -3 }], ['Laugh it off on a talk show', { rep: 3, req: 'comedy' }], ['Ignore it', {}]] },
  { id: 'meme', t: 'A clip of you from an old audition is going viral.', min: 1, c: [['Recreate it', { fame: 3, followers: 1 }], ['Ignore it', { fame: 1 }]] },
  { id: 'lawsuit', t: 'A former assistant is threatening to sue.', min: 35, scandal: true, c: [['Settle quietly', { money: -150000, rep: -1 }], ['Fight it in court', { lawsuit: 1 }]] },
  { id: 'burn', t: 'You have not had a day off in months. Your body is telling you.', min: 0, burn: true, c: [['Take a week off', { energy: 30, health: 10, skip: 1 }], ['Push through', { health: -10 }]] },
  { id: 'friend', t: '{actor} invites you to their birthday party.', min: 20, c: [['Go', { contacts: 1, energy: -8, happy: 3 }], ['Send a gift', { rep: 1, money: -500 }]] },
  { id: 'heckle', t: 'A critic called your last performance "wooden".', min: 10, c: [['Take more classes', { drama: 2, money: -500 }], ['Post a sarcastic reply', { rep: -2, fame: 1 }], ['Let it go', {}]] },
];

D.ACHIEVEMENTS = [
  ['first_role', 'Booked it', 'Land your first role.'], ['first_line', 'Speaking part', 'Land a speaking role in a film or series.'],
  ['first_lead', 'Leading role', 'Land a lead role.'], ['first_film', 'In theaters', 'Have a film released.'],
  ['hero', 'Suit up', 'Get cast in a franchise role.'], ['original', 'Created a legend', 'Play an original franchise character.'],
  ['recast', 'Big shoes', 'Take over a recast role.'], ['legacy', 'Passing the torch', 'Inherit a legacy mantle.'],
  ['variant', 'Multiverse', 'Play a multiverse variant.'], ['ninepic', 'Nine-picture deal', 'Sign a franchise contract for 6 or more films.'],
  ['crossover', 'Assemble', 'Appear in a team-up film.'], ['solo', 'Your own movie', 'Headline a solo film as your franchise character.'],
  ['spinoff', 'Spin-off', 'Your character gets their own series.'], ['bo100', 'Hundred-million opener', 'Star in a film that opens to $100M+ domestic.'],
  ['bo1b', 'Billion-dollar movie', 'Star in a film that earns $1B worldwide.'], ['lifetime5b', 'Box office titan', 'Reach $5B lifetime worldwide box office.'],
  ['flop', 'Box office bomb', 'Survive a flop.'], ['cult', 'Cult classic', 'Have a film become a cult classic.'], ['fresh95', 'Certified fresh', 'Get a 95%+ critics score.'],
  ['rotten', 'Rotten', 'Get a critics score under 20%.'], ['tv', 'Small screen', 'Star in a TV series.'], ['renewed', 'Renewed', 'Get a series renewed.'],
  ['voice', 'Voice actor', 'Voice an animated character.'], ['stage', 'Broadway baby', 'Star in a stage production.'], ['commercial', 'Paid is paid', 'Shoot a commercial.'],
  ['festival', 'Festival circuit', 'Premiere a film at a festival.'], ['ovation', 'Standing ovation', 'Get a 10-minute standing ovation at Cannes or Venice.'],
  ['nom', 'Nominated', 'Get nominated for a major award.'], ['globe', 'Golden Globe winner', 'Win a Golden Globe.'], ['bafta', 'BAFTA winner', 'Win a BAFTA.'],
  ['sag', 'Actor Award winner', 'Win a SAG Actor Award.'], ['oscar_nom', 'Oscar nominee', 'Get an Oscar nomination.'], ['oscar', 'Academy Award winner', 'Win an Oscar.'],
  ['emmy', 'Emmy winner', 'Win an Emmy.'], ['tony', 'Tony winner', 'Win a Tony.'], ['egot', 'EGOT watch', 'Win an Emmy, a Tony and an Oscar.'], ['razzie', 'Razzie', 'Win a Golden Raspberry.'],
  ['talk', 'Couch time', 'Appear on a talk show.'], ['snl', 'Live from New York', 'Host Saturday Night Live.'], ['cover', 'Cover star', 'Land a magazine cover.'],
  ['metgala', 'The first Monday in May', 'Attend the Met Gala.'], ['comiccon', 'Hall H', 'Appear on a Comic-Con panel.'], ['brand', 'Ambassador', 'Sign a brand deal.'],
  ['agent_caa', 'Top agency', 'Sign with CAA.'], ['million', 'Millionaire', 'Have $1M in the bank.'], ['tenmil', 'Eight figures', 'Get paid $10M+ upfront for one film.'],
  ['points', 'Backend', 'Get 5+ backend points in a deal.'], ['company', 'Production company', 'Start your own production company.'], ['direct', 'Director', 'Direct a film.'],
  ['produce_hit', 'Producer', 'Produce a film that earns $200M+.'], ['mansion', 'Dream home', 'Buy a home worth $10M+.'], ['star', 'Walk of Fame', 'Get a star on the Hollywood Walk of Fame.'],
  ['decade', 'Ten-year career', 'Work for 10 years.'], ['married', 'Married', 'Get married.'], ['charity', 'Philanthropist', 'Give $1M to charity.'], ['followers', '100 million followers', 'Reach 100M followers.'],
];


// ------------------------------------------------------------------ live TV: SNL and talk shows
D.SNL_MONO = [
  { id: 'song', name: 'Musical monologue', skill: 'voice', d: 'Sing your way through it with the house band.' },
  { id: 'standup', name: 'Stand-up', skill: 'comedy', d: 'Jokes about your career, your family and the movie.' },
  { id: 'story', name: 'Heartfelt story', skill: 'charisma', d: 'Something true and a little embarrassing.' },
  { id: 'qa', name: 'Audience Q&A', skill: 'charisma', d: 'Cast members planted in the crowd ask questions.' },
];
D.SNL_SKETCHES = [
  { t: 'A game show where every contestant is a disgraced magician', skill: 'comedy' }, { t: 'A soap opera parody where everyone is your evil twin', skill: 'drama' },
  { t: 'A pre-taped music video about loving brunch too much', skill: 'voice' }, { t: 'A family dinner where you play a very intense dad', skill: 'comedy' },
  { t: 'A fake trailer for a superhero movie about a sandwich', skill: 'action' }, { t: 'A cooking show where the host is clearly a vampire', skill: 'comedy' },
  { t: 'A courtroom sketch where you defend a goose', skill: 'charisma' }, { t: 'A tense airport security check with a celebrity cameo', skill: 'drama' },
  { t: 'A nature documentary narrated by an unhinged British man', skill: 'accents' }, { t: 'A recurring character: the office party DJ who will not stop', skill: 'comedy' },
  { t: 'A boy band reunion that goes terribly wrong', skill: 'voice' }, { t: 'A stunt-heavy action parody in a grocery store', skill: 'action' },
];
D.SNL_COMMIT = [['commit', 'Commit fully'], ['straight', 'Play it straight'], ['break', 'Let yourself break']];
D.MUSIC_GUESTS = ['Sabrina Carpenter', 'Chappell Roan', 'Olivia Rodrigo', 'Bad Bunny', 'Kendrick Lamar', 'Billie Eilish', 'Doechii', 'Charli XCX', 'Tyler, the Creator', 'Benson Boone', 'Gracie Abrams', 'Lady Gaga'];
D.SNL_CAST = ['Bowen Yang', 'Ego Nwodim', 'Sarah Sherman', 'Mikey Day', 'Heidi Gardner', 'James Austin Johnson', 'Marcello Hernández', 'Chloe Fineman', 'Kenan Thompson'];
D.TALK_Q = [
  { q: 'So what was it like on set? I heard it got wild.', opts: [['A story about a prank war with the crew', 'comedy', 'funny'], ['Praise the crew and the director', 'charisma', 'humble'], ['Tease a secret from the film', 'charisma', 'promo']] },
  { q: 'Your fans are obsessed with you. Do you read the comments?', opts: [['Read a mean comment out loud', 'comedy', 'funny'], ['Say you protect your peace', 'charisma', 'humble'], ['Thank them, then plug the movie', 'charisma', 'promo']] },
  { q: 'Tell us about your childhood. Were you always a performer?', opts: [['The time you got cut from the school play', 'comedy', 'funny'], ['A sincere story about your parents', 'drama', 'humble'], ['Do an impression of your first teacher', 'accents', 'funny']] },
  { q: 'Is it true you did your own stunts?', opts: [['Demonstrate a fall on the couch', 'action', 'funny'], ['Credit your stunt double', 'charisma', 'humble'], ['Describe the biggest stunt in the film', 'action', 'promo']] },
  { q: 'People say you two have amazing chemistry. Anything going on?', opts: [['Make a joke and change the subject', 'comedy', 'funny'], ['Say you are good friends', 'charisma', 'humble'], ['Wink at the camera', 'charisma', 'promo']] },
  { q: 'What is next for you after this?', opts: [['Pitch a ridiculous fake movie', 'comedy', 'funny'], ['Talk about a passion project', 'drama', 'humble'], ['Hint at a franchise return', 'charisma', 'promo']] },
];
D.TALK_GAMES = {
  fallon: ['a lip-sync battle', 'the box of mystery objects', 'charades against the host'], kimmel: ['reading mean tweets', 'a hidden-camera prank', 'a fake movie trailer'],
  meyers: ['a desk interview with no games, just jokes', 'a day-drinking segment', 'a game of who said it'], norton: ['the red chair stories', 'a couch full of other stars', 'a dance-off'],
  hotones: ['ten wings, each hotter than the last', 'the last dab', 'a question about your weirdest fan encounter'],
};

// ------------------------------------------------------------------ stage nights
D.STAGE_OPENING = [['ritual', 'Do your pre-show ritual'], ['cast', 'Give the cast a speech'], ['alone', 'Sit alone in the dark']];
D.STAGE_EVENTS = [
  { t: 'Your scene partner drops a line in the middle of the second act.', c: [['Improvise in character', { perf: 3, req: 'comedy' }], ['Feed them the line', { perf: 1 }], ['Freeze and wait', { perf: -3 }]] },
  { t: 'A phone rings in the front row during your big monologue.', c: [['Stop and stare until it stops', { fame: 2, rep: -1 }], ['Work it into the scene', { perf: 2, fame: 1 }], ['Push through', {}]] },
  { t: 'You have a cold and your voice is going.', c: [['Perform anyway', { perf: -2, health: -6, rep: 2 }], ['Let the understudy go on', { energy: 20, happy: -2 }], ['Steam, tea and a lower key', { perf: 1, req: 'voice' }]] },
  { t: 'A prop gun fails to fire during the climax.', c: [['Shout "bang"', { perf: -2, fame: 2 }], ['Change the kill to a strangling', { perf: 2, req: 'action' }], ['Walk off and come back', { perf: -1 }]] },
  { t: 'A famous director is in the audience tonight.', c: [['Play it exactly the same', { perf: 1 }], ['Go bigger', { perf: 2, contacts: 1 }], ['Meet them at the stage door', { contacts: 1, energy: -6 }]] },
  { t: 'The stage door crowd is three blocks long.', c: [['Sign everything', { fame: 2, energy: -8, rep: 2 }], ['Sign for twenty minutes', { fame: 1 }], ['Slip out the back', { rep: -1 }]] },
  { t: 'The set piece jams and the curtain stays half up.', c: [['Talk to the audience until it is fixed', { fame: 2, req: 'charisma' }], ['Stay in character', { perf: 1 }]] },
  { t: 'Tonight the whole house rose to its feet at curtain call.', c: [['Take an extra bow', { fame: 1, happy: 3 }], ['Bring the crew out on stage', { rep: 3 }]] },
];

// ------------------------------------------------------------------ TV seasons
D.TV_MIDSEASON = [
  { t: 'Episode {ep} ends on a twist nobody saw coming. Fans are losing it.', c: [['Live-post reactions with the fans', { fame: 1, followers: 1 }], ['Do a fan Q&A', { rep: 2, energy: -6 }], ['Stay mysterious', { fame: 0.5 }]] },
  { t: 'A scene from episode {ep} is the most-clipped moment on Clapper this week.', c: [['Recreate it on Clapper', { fame: 2, followers: 1 }], ['Thank the writers publicly', { rep: 2 }], ['Ignore it', {}]] },
  { t: 'Critics say episode {ep} is the best hour of TV this year.', c: [['Do a press round', { fame: 1.5, energy: -8 }], ['Let it speak for itself', { rep: 1 }]] },
];
D.TV_FINALE = [['cliff', 'Push for a cliffhanger ending'], ['close', 'Push for a satisfying ending'], ['trust', 'Trust the showrunner']];

// newest first. Bump FC_BUILD in index.html and version.json together with a new entry here.
D.CHANGELOG = [
  { build: 6, date: 'Nov 13, 2026', notes: ['New Work tab: prep for each role, choose your effort every shooting week, and do your press.', 'Your acting score now comes from your audition, your prep and your effort on set.', 'Every film, series and stage show has a press schedule from the director. Franchise press tours are big, indie press is light.', 'Marquee, the critics app: a score out of 10 for every project and every cast member, plus a full review.'] },
  { build: 5, date: 'Nov 13, 2026', notes: ['The game now tells you when an update is live, with a button to load it.', 'Version number and this list of changes on the title screen.'] },
  { build: 4, date: 'Nov 13, 2026', notes: ['Eight new down-to-earth starting stories, like Aspiring actor, College theater major and Career changer.', 'The story picker is split into Down to earth and A head start.'] },
  { build: 3, date: 'Nov 11, 2026', notes: ['Host Saturday Night Live: monologue, three sketches and reviews.', 'Talk show interviews with questions and a game segment.', 'Broadway opening nights, stage events and closing nights.', 'TV seasons air episode by episode, with a say in the finale.'] },
  { build: 2, date: 'Nov 11, 2026', notes: ['Pinch and double-tap zoom are turned off.'] },
  { build: 1, date: 'Nov 11, 2026', notes: ['Final Cut launches.'] },
];

// ------------------------------------------------------------------ prep, shooting effort and press
// prep sessions: skill that makes them count, energy cost, base gain, which genres they suit ('all' = any)
D.PREP_ACTS = [
  { id: 'read', name: 'Script breakdown', skill: 'drama', cost: 12, gain: 10, for: 'all', d: 'Go through every scene and every beat.' },
  { id: 'research', name: 'Character research', skill: 'drama', cost: 16, gain: 13, for: 'all', d: 'Interviews, books, a backstory journal.' },
  { id: 'coach', name: 'Private acting coach', skill: 'drama', cost: 18, gain: 15, price: 1500, for: 'all', d: 'Work the hardest scenes one on one.' },
  { id: 'chem', name: 'Rehearse with your co-star', skill: 'charisma', cost: 15, gain: 12, for: 'all', costar: true, d: 'Build the relationship before cameras roll.' },
  { id: 'dialect', name: 'Dialect work', skill: 'accents', cost: 14, gain: 12, for: 'period biopic fantasy scifi drama thriller', d: 'Get the accent right.' },
  { id: 'stunts', name: 'Fight rehearsal', skill: 'action', cost: 22, gain: 14, for: 'action superhero scifi fantasy thriller', d: 'Learn the choreography until it is muscle memory.' },
  { id: 'body', name: 'Body transformation', skill: 'fitness', cost: 25, gain: 14, for: 'superhero action', d: 'Trainer, diet, two sessions a day.' },
  { id: 'vocal', name: 'Vocal rehearsal', skill: 'voice', cost: 15, gain: 13, for: 'musical animation', d: 'Songs and voice work.' },
  { id: 'jokes', name: 'Comedy table work', skill: 'comedy', cost: 14, gain: 13, for: 'comedy animation romance', d: 'Find the timing on every joke.' },
];
// effort on set each shooting week: [id, label, energy, effort value]
D.EFFORT = [['coast', 'Coast', 5, 25, 'Hit your marks and go home.'], ['steady', 'Steady', 18, 60, 'Professional and prepared.'], ['all', 'Give everything', 32, 90, 'Every take like it is the last one.']];
D.SHOOT_EXTRAS = [
  { id: 'takes', name: 'Ask for extra takes', cost: 10, effort: 8, d: 'One more. One more.' },
  { id: 'lines', name: 'Run lines at night', cost: 8, effort: 6, d: 'Know tomorrow cold.' },
  { id: 'help', name: 'Help a co-star with a scene', cost: 8, effort: 3, costar: 8, d: 'Good scenes take two people.' },
];
// press: size tiers that get it ('fr' franchise, 'big' studio wide release, 'indie', 'tv', 'stage'), energy cost, promo value
D.PRESS = [
  { id: 'tour', name: 'Global press tour', d: 'London, Seoul, Mexico City and Sydney in nine days.', cost: 40, promo: 0.12, tiers: 'fr' },
  { id: 'panel', name: 'Comic-Con fan panel', d: 'Hall H, exclusive footage and 6,500 screaming fans.', cost: 22, promo: 0.09, tiers: 'fr' },
  { id: 'fanevent', name: 'Fan event and screening', d: 'Sign autographs for three hours.', cost: 20, promo: 0.06, tiers: 'fr' },
  { id: 'junket', name: 'Press junket', d: 'Two days of four-minute interviews in a hotel suite.', cost: 25, promo: 0.07, tiers: 'fr big' },
  { id: 'premiere', name: 'Red-carpet premiere', d: 'Photos, interviews on the carpet, the after-party.', cost: 15, promo: 0.06, tiers: 'fr big indie' },
  { id: 'talk', name: 'Late-night talk show', d: 'Sit on the couch and sell it.', cost: 15, promo: 0.06, tiers: 'fr big tv', live: true },
  { id: 'mag', name: 'Magazine cover story', d: 'A photo shoot and a long profile.', cost: 12, promo: 0.05, tiers: 'fr big tv' },
  { id: 'social', name: 'Social media takeover', d: 'Post behind-the-scenes clips all day.', cost: 8, promo: 0.04, tiers: 'fr big indie tv stage' },
  { id: 'podcast', name: 'Podcast interview', d: 'An hour on a popular film podcast.', cost: 10, promo: 0.04, tiers: 'indie tv stage' },
  { id: 'qa', name: 'Screening Q&A', d: 'Answer questions after a screening.', cost: 12, promo: 0.05, tiers: 'indie' },
  { id: 'tvpanel', name: 'TV critics panel', d: 'Present the show to the critics who will review it.', cost: 12, promo: 0.05, tiers: 'tv' },
  { id: 'gma', name: 'Morning show performance', d: 'Perform a number live on morning TV.', cost: 14, promo: 0.06, tiers: 'stage' },
];
D.PRESS_STYLE = [['charm', 'Be charming'], ['serious', 'Talk about the craft'], ['tease', 'Tease secrets']];
D.CRITIC_APP = 'Marquee';
D.REVIEWERS = ['Dana Okafor', 'Felix Haverford', 'Maya Lindqvist', 'Theo Castellanos', 'Priya Raman', 'Jonah Whitfield', 'Sade Adeyemi', 'Lucas Brandt'];

D.HELP = [
  ['Weeks and energy', 'Each turn is one week. Classes, auditions, parties and posts cost energy. Shooting a project uses most of your week. Ending weeks with no energy hurts your health, and if health hits zero you burn out.'],
  ['Auditions', 'Roles appear on the Casting board. Each one lists what the director wants. Your skills decide most of the score, and you choose how to play each beat of the scene. Bigger roles add a chemistry read and a screen test. You compete with real actors for the part.'],
  ['Franchises', 'Each franchise has a slate of films, a cast and a fan mood. Established characters belong to their actors until they leave, get recast, or the story needs a variant, a younger version or a successor. Original characters the game creates are yours alone.'],
  ['Contracts', 'When you are offered a part, negotiate upfront pay, backend points, number of films, billing and perks. Your Star Power and your agent decide how far you can push. Push too far and the studio walks.'],
  ['Making movies', 'Projects go through prep, shooting and post-production. Use the Work tab: during prep, spend energy on prep sessions. Each shooting week, choose how hard to work on set. Your acting score comes from your audition, your prep and your effort while shooting, and it shapes the reviews.'],
  ['Press', 'Every film, series and stage show has a press schedule from the director. It opens a few weeks before release. Franchise films need a lot of press, indies need a little. Press raises the opening. Skipping it hurts your reputation.'],
  ['Marquee', 'Marquee is the critics app. Each project gets a score out of 10, a written review and a score for every cast member, including you.'],
  ['Box office and reviews', 'Films open on a release week and earn money every weekend. Critics and audiences score them. Hits raise your fee and Star Power. Flops lower them.'],
  ['Awards', 'The Golden Globes, Critics Choice, BAFTA, SAG, Oscars, Emmys and Tonys all happen on the calendar. Prestige roles and strong performances get nominated. Spend on a For Your Consideration campaign to improve your chances.'],
  ['Star Power', 'Your leverage. It comes from fame, recent box office and awards. It decides your pay and how hard you can negotiate.'],
  ['Real people', 'Real actors, directors and franchises appear by name. Every casting decision, feud, box office number and storyline in this game is made up.'],
];

root.FCD = D;
})(typeof window !== 'undefined' ? window : globalThis);
