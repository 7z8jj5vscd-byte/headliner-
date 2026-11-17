// K-Pop Idol Agency: game data. Loaded before engine.js, works in the browser and in Node tests.
(function (root) {
const D = root.KD = {};

// ------------------------------------------------------------------ changelog
// Newest first. Bump IA_BUILD in index.html and version.json together with a new entry here.
D.CHANGELOG = [
  { build: 1, date: 'Nov 17, 2026', notes: [
    'K-Pop Idol Agency launches as the first Debut Dream expansion.',
    'Run your own agency: build floors, hire coaches, scout trainees and debut groups.',
    'Survival show, albums with line distribution, a music video director and pixel MV playback.',
    'Schedules, own content, a stylist room, world tours, fan requests, an SNS feed and hate trains.',
    'Weekly charts and music shows against real K-pop groups, and four year-end award shows.',
    'Sign your Debut Dream idol as a trainee, plus a guided tutorial and an update notice.'
  ] }
];

// ------------------------------------------------------------------ names
D.SURN = ['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han','Oh','Seo','Shin','Kwon','Hwang','Ahn','Song','Yoo','Hong','Jeon','Moon','Bae','Baek','Nam','Ryu','Go','Min','Yang','Son'];
D.GIVEN_F = ['Yuna','Haeun','Seoyeon','Jiwoo','Minji','Chaeyoung','Dahyun','Sua','Yerin','Nari','Soyeon','Hayoung','Eunbi','Gaeul','Rina','Yeji','Somin','Jia','Sihyun','Arin','Hana','Bora','Dain','Eunji','Seola','Yujin','Wonhee','Iseo','Nayun','Hyein'];
D.GIVEN_M = ['Minho','Jaehyun','Sunwoo','Taeyang','Hyunwoo','Jisung','Doyoon','Seojun','Yeonjun','Haneul','Jiho','Woojin','Chanwoo','Eunho','Siwoo','Taemin','Junseo','Dohyun','Minseok','Hyuk','Kyungmin','Seungmin','Jaemin','Wonbin','Riku','Sion','Yuto','Kai','Leo','Ryan'];
D.FOREIGN = [
  { nat: 'Japan', flag: 'JP', f: ['Yui','Hina','Mio','Sakura','Rei','Nanami'], m: ['Haruto','Yuma','Sota','Ren','Kaito','Riku'] },
  { nat: 'Thailand', flag: 'TH', f: ['Ploy','Mint','Nene','Fah'], m: ['Bam','Ten','Win','Nont'] },
  { nat: 'China', flag: 'CN', f: ['Xin','Yuqi','Mei','Lan'], m: ['Hao','Yixuan','Chen','Wei'] },
  { nat: 'USA', flag: 'US', f: ['Sophie','Lara','Megan','Ava'], m: ['Ethan','Jake','Mark','Nick'] },
  { nat: 'Australia', flag: 'AU', f: ['Chloe','Ruby'], m: ['Felix','Liam'] },
  { nat: 'Philippines', flag: 'PH', f: ['Bea','Sofia'], m: ['Josh','Paolo'] },
  { nat: 'Indonesia', flag: 'ID', f: ['Putri','Ayu'], m: ['Dimas','Rizky'] },
  { nat: 'Vietnam', flag: 'VN', f: ['Linh','Mai'], m: ['Minh','Duc'] }
];

// ------------------------------------------------------------------ stats and traits
D.STATS = [
  { id: 'vocal', n: 'Vocal', e: '🎤' }, { id: 'dance', n: 'Dance', e: '💃' }, { id: 'rap', n: 'Rap', e: '🔥' },
  { id: 'visual', n: 'Visual', e: '✨' }, { id: 'variety', n: 'Variety', e: '😂' }, { id: 'stamina', n: 'Stamina', e: '💪' }
];
D.TRAITS = [
  { id: 'center', n: 'Natural center', d: 'Shines in the middle of the formation. Stages score higher when they are the center.' },
  { id: 'ace', n: 'All-rounder ace', d: 'Grows a little in every skill, every week.' },
  { id: 'bloomer', n: 'Late bloomer', d: 'Slow start. After a year of training, growth doubles.' },
  { id: 'genius', n: 'Dance genius', d: 'Dance grows much faster than anything else.' },
  { id: 'voice', n: 'Golden voice', d: 'Vocal grows much faster and live stages rarely go wrong.' },
  { id: 'rapper', n: 'Underground rapper', d: 'Rap grows fast and they can write lyrics for albums.' },
  { id: 'visual', n: 'Face of the group', d: 'Every photo goes viral. Brand deals pay more.' },
  { id: 'funny', n: 'Variety genius', d: 'Variety shows and content bring double fans.' },
  { id: 'fragile', n: 'Fragile health', d: 'Loses condition faster. Push them carefully.' },
  { id: 'iron', n: 'Iron stamina', d: 'Loses condition slower and recovers faster.' },
  { id: 'producer', n: 'Born producer', d: 'Can write and produce the group\'s songs once skilled enough.' },
  { id: 'polyglot', n: 'Polyglot', d: 'Overseas schedules and tours bring more fans.' },
  { id: 'shy', n: 'Shy', d: 'Struggles on variety but fans find them endearing. Fan requests give more trust.' },
  { id: 'leader', n: 'Born leader', d: 'Keeps the group calm. Member clashes and hate train stress hurt less.' }
];
D.POSITIONS = ['Leader','Main vocal','Lead vocal','Sub vocal','Main dancer','Lead dancer','Main rapper','Lead rapper','Visual','Center','Maknae'];

// ------------------------------------------------------------------ training plans
D.PLANS = [
  { id: 'vocal', n: 'Vocal lessons', g: { vocal: 3 }, cond: -8, room: 'vocal', coach: 'vocal' },
  { id: 'dance', n: 'Dance practice', g: { dance: 3 }, cond: -10, room: 'practice', coach: 'dance' },
  { id: 'rap', n: 'Rap & writing', g: { rap: 3 }, cond: -6, room: 'studio', coach: 'rap' },
  { id: 'visual', n: 'Styling & camera', g: { visual: 2.5 }, cond: -5, room: 'stylist', coach: 'stylist' },
  { id: 'variety', n: 'Variety & acting', g: { variety: 3 }, cond: -6, room: 'content', coach: 'variety' },
  { id: 'gym', n: 'Gym & diet', g: { stamina: 3 }, cond: -9, room: 'gym', coach: null },
  { id: 'balanced', n: 'Balanced', g: { vocal: 1, dance: 1, rap: .6, visual: .6, variety: .6, stamina: .6 }, cond: -7, room: null, coach: null },
  { id: 'rest', n: 'Rest', g: {}, cond: 22, room: 'dorm', coach: null }
];

// ------------------------------------------------------------------ building
D.ROOMS = [
  { id: 'office', n: 'CEO office', e: '🏢', d: 'Raises how many trainees and groups you can run.', cost: [0, 3e7, 9e7, 2.5e8, 6e8], col: '#f4d2ff' },
  { id: 'practice', n: 'Practice room', e: '🪞', d: 'Dance training grows faster.', cost: [0, 1.5e7, 5e7, 1.5e8, 4e8], col: '#ffd6e8' },
  { id: 'vocal', n: 'Vocal booth', e: '🎙️', d: 'Vocal training grows faster.', cost: [0, 1.5e7, 5e7, 1.5e8, 4e8], col: '#d6ecff' },
  { id: 'dorm', n: 'Dorm', e: '🛏️', d: 'Rest recovers more condition and mood.', cost: [0, 1e7, 4e7, 1.2e8, 3e8], col: '#fff1c9' },
  { id: 'studio', n: 'Recording studio', e: '🎚️', d: 'Better albums and rap training.', cost: [2e7, 6e7, 1.8e8, 4.5e8, 9e8], col: '#d9f7e8' },
  { id: 'stylist', n: 'Stylist room', e: '👗', d: 'Unlocks outfits, raises visual training and concept fit.', cost: [1.5e7, 4e7, 1.2e8, 3e8, 7e8], col: '#ffe0d1' },
  { id: 'gym', n: 'Gym', e: '🏋️', d: 'Stamina training, and members lose less condition.', cost: [1e7, 3e7, 9e7, 2.5e8, 5e8], col: '#e5e1ff' },
  { id: 'mvset', n: 'MV set', e: '🎬', d: 'Better and cheaper music videos.', cost: [3e7, 8e7, 2e8, 5e8, 1e9], col: '#ffdcef' },
  { id: 'content', n: 'Content studio', e: '📹', d: 'Make your own shows. Variety training grows faster.', cost: [2e7, 5e7, 1.5e8, 3.5e8, 8e8], col: '#dff4ff' }
];
D.RANKS = [
  { n: 'Basement startup', need: 0 }, { n: 'Small agency', need: 50000 }, { n: 'Mid-size agency', need: 400000 },
  { n: 'Major agency', need: 2.5e6 }, { n: 'Big 4 agency', need: 1e7 }, { n: 'Entertainment empire', need: 4e7 }
];

// ------------------------------------------------------------------ staff
D.STAFF = [
  { id: 'vocal', n: 'Vocal coach', d: 'Vocal training +40% per level.', pay: 1.2e6 },
  { id: 'dance', n: 'Choreographer', d: 'Dance training +40% per level. Better stages.', pay: 1.4e6 },
  { id: 'rap', n: 'Rap coach', d: 'Rap training +40% per level.', pay: 1e6 },
  { id: 'variety', n: 'Acting & variety coach', d: 'Variety training +40% per level.', pay: 1e6 },
  { id: 'stylist', n: 'Head stylist', d: 'Visual training and concept fit.', pay: 1.2e6 },
  { id: 'producer', n: 'In-house producer', d: 'Album quality up. Cheaper than freelancers.', pay: 2.5e6 },
  { id: 'pr', n: 'PR team', d: 'Hate trains cool down faster and hit less hard.', pay: 2e6 },
  { id: 'manager', n: 'Road manager', d: 'Members lose less condition on schedules.', pay: 1.5e6 }
];
D.STAFF_LV = ['', 'Junior', 'Senior', 'Star'];

// ------------------------------------------------------------------ looks
D.SKIN = ['#ffe4d1', '#fcd6bd', '#f1c4a3', '#e2ad86', '#c98d65', '#9c6747'];
D.HAIR_C = ['#2b2230', '#4a3324', '#7a4a2c', '#c58b52', '#f2d27a', '#f5ecd6', '#e86aa0', '#9b6be0', '#4b8fe0', '#38b5a3', '#e04848', '#b9bcc9'];
D.HAIR_F = ['Long straight', 'Twin tails', 'Bob', 'High ponytail', 'Wavy long', 'Space buns', 'Hime cut', 'Short pixie'];
D.HAIR_M = ['Two-block', 'Curtain bangs', 'Mullet', 'Spiky', 'Comma hair', 'Long tied', 'Buzz', 'Messy perm'];
D.OUTFITS = [
  { id: 'tee', n: 'Practice tee', tags: ['casual'], cost: 0 },
  { id: 'hoodie', n: 'Oversized hoodie', tags: ['casual', 'teen'], cost: 0 },
  { id: 'school', n: 'School uniform', tags: ['teen', 'cute'], cost: 2e6 },
  { id: 'suit', n: 'Tailored suit', tags: ['elegant', 'dark'], cost: 4e6 },
  { id: 'leather', n: 'Leather & chains', tags: ['crush', 'dark', 'hiphop'], cost: 4e6 },
  { id: 'y2k', n: 'Y2K crop set', tags: ['y2k', 'retro', 'teen'], cost: 3e6 },
  { id: 'fantasy', n: 'Fantasy cape', tags: ['fantasy', 'dark'], cost: 6e6 },
  { id: 'summer', n: 'Summer beachwear', tags: ['summer', 'cute'], cost: 2.5e6 },
  { id: 'street', n: 'Streetwear', tags: ['hiphop', 'crush', 'casual'], cost: 3e6 },
  { id: 'hanbok', n: 'Modern hanbok', tags: ['elegant', 'fantasy'], cost: 8e6 },
  { id: 'sparkle', n: 'Sequin stage set', tags: ['retro', 'elegant', 'cute'], cost: 7e6 },
  { id: 'military', n: 'Military jacket', tags: ['crush', 'dark'], cost: 5e6 }
];
D.OUT_C = ['#ff7eb6', '#ffffff', '#2b2b3a', '#7c5cff', '#46b4ff', '#3ccf9e', '#ffd166', '#ff6b6b', '#c0c4d6', '#a0522d', '#ff9f43', '#e7c6ff'];
D.ACCS = ['None', 'Hair clip', 'Beanie', 'Glasses', 'Headband', 'Ribbon', 'Earrings', 'Cap'];

// ------------------------------------------------------------------ concepts, genres, producers
D.CONCEPTS = [
  { id: 'crush', n: 'Girl crush / Bad boy', tags: ['crush'], col: '#ff3d7f' },
  { id: 'teen', n: 'Teen fresh', tags: ['teen'], col: '#7ad3ff' },
  { id: 'dark', n: 'Dark', tags: ['dark'], col: '#5b3fa8' },
  { id: 'retro', n: 'Retro', tags: ['retro'], col: '#ff9f43' },
  { id: 'y2k', n: 'Y2K', tags: ['y2k'], col: '#c86bff' },
  { id: 'fantasy', n: 'Fantasy', tags: ['fantasy'], col: '#4e8cff' },
  { id: 'summer', n: 'Summer', tags: ['summer'], col: '#22c9a6' },
  { id: 'hiphop', n: 'Hip hop', tags: ['hiphop'], col: '#ffb800' },
  { id: 'elegant', n: 'Elegant', tags: ['elegant'], col: '#c9a26b' },
  { id: 'cute', n: 'Cute', tags: ['cute'], col: '#ff8fc8' }
];
D.GENRES = [
  { id: 'dance', n: 'Dance pop', skill: 'dance' }, { id: 'edm', n: 'EDM drop', skill: 'dance' },
  { id: 'ballad', n: 'Ballad', skill: 'vocal' }, { id: 'rnb', n: 'R&B', skill: 'vocal' },
  { id: 'hiphop', n: 'Hip hop', skill: 'rap' }, { id: 'jersey', n: 'Jersey club', skill: 'dance' },
  { id: 'rock', n: 'Pop rock', skill: 'vocal' }, { id: 'house', n: 'House', skill: 'dance' }
];
D.ALBUM_TYPES = [
  { id: 'single', n: 'Digital single', tracks: 1, cost: 1.5e7, q: 0, sales: .35 },
  { id: 'mini', n: 'Mini album', tracks: 5, cost: 4e7, q: 4, sales: 1 },
  { id: 'full', n: 'Full album', tracks: 11, cost: 9e7, q: 8, sales: 1.6 },
  { id: 'jp', n: 'Japanese single', tracks: 3, cost: 3e7, q: 2, sales: .8, region: 'jp' },
  { id: 'en', n: 'English single', tracks: 1, cost: 3e7, q: 2, sales: .5, region: 'na' }
];
D.PRODUCERS = [
  { id: 'intern', n: 'In-house intern', q: 0, cost: 0 },
  { id: 'free', n: 'Freelance producer', q: 8, cost: 1.5e7 },
  { id: 'team', n: 'Hit-making team', q: 16, cost: 5e7 },
  { id: 'legend', n: 'Legendary producer', q: 24, cost: 1.5e8, fame: 4 },
  { id: 'self', n: 'Self-produced by a member', q: 0, cost: 0, self: true }
];
D.TITLE_A = ['Midnight','Neon','Sugar','Thunder','Velvet','Crystal','Fever','Lucky','Electric','Moonlight','Cherry','Wild','Paper','Golden','Bubble','Dynamite','Silver','Firework','Ocean','Gravity','Polaroid','Candy','Supersonic','Sunset'];
D.TITLE_B = ['Rush','Heart','Signal','Dream','Kiss','Runaway','Diary','Riddle','Pulse','Tango','Garden','Bloom','Rocket','Chase','Mirage','Rhythm','Promise','Crush','Siren','Club','Jungle','Wave','Code','Remix'];

// ------------------------------------------------------------------ music videos
D.MV_SETS = [
  { id: 'neon', n: 'Neon city', col: ['#170b35', '#ff3d9a'], tags: ['crush', 'y2k', 'hiphop'], cost: 1 },
  { id: 'school', n: 'School hallway', col: ['#ffe9b0', '#ffb0c8'], tags: ['teen', 'cute'], cost: .6 },
  { id: 'desert', n: 'Desert road', col: ['#ffb36b', '#c85b2f'], tags: ['crush', 'retro', 'dark'], cost: 1.2 },
  { id: 'forest', n: 'Enchanted forest', col: ['#123b2c', '#6be0a2'], tags: ['fantasy', 'elegant'], cost: 1.3 },
  { id: 'space', n: 'Outer space', col: ['#05031a', '#6b5cff'], tags: ['fantasy', 'dark', 'y2k'], cost: 1.6 },
  { id: 'beach', n: 'Beach at sunset', col: ['#ffb6a3', '#4fc9e8'], tags: ['summer', 'cute', 'teen'], cost: .9 },
  { id: 'palace', n: 'Palace hall', col: ['#2a1a0c', '#e3b45c'], tags: ['elegant', 'dark', 'fantasy'], cost: 1.5 },
  { id: 'arcade', n: 'Retro arcade', col: ['#1a0f3d', '#ffcf3f'], tags: ['retro', 'y2k', 'cute'], cost: .8 },
  { id: 'warehouse', n: 'Graffiti warehouse', col: ['#2b2b33', '#9be15d'], tags: ['hiphop', 'crush'], cost: .7 },
  { id: 'white', n: 'All-white studio', col: ['#f6f4ff', '#d7d2ef'], tags: ['elegant', 'teen'], cost: .5 }
];
D.MV_STORIES = [
  { id: 'none', n: 'Performance only', lore: 0, hype: 4 },
  { id: 'love', n: 'First love', lore: 3, hype: 2 },
  { id: 'heist', n: 'Heist with a twist ending', lore: 6, hype: 5 },
  { id: 'universe', n: 'Group universe lore', lore: 9, hype: 3 },
  { id: 'rebel', n: 'Rebellion and escape', lore: 5, hype: 5 },
  { id: 'time', n: 'Time loop', lore: 8, hype: 4 },
  { id: 'villain', n: 'Members turn villain', lore: 7, hype: 6 }
];
D.MV_SECTIONS = ['Intro', 'Verse', 'Pre-chorus', 'Chorus', 'Dance break', 'Outro'];
D.MV_SHOTS = [
  { id: 'wide', n: 'Wide group shot', hype: 2, lore: 0 },
  { id: 'close', n: 'Close-up', hype: 3, lore: 1, visual: true },
  { id: 'oneshot', n: 'One-take dance', hype: 4, lore: 0, dance: true },
  { id: 'drone', n: 'Drone sweep', hype: 3, lore: 1 },
  { id: 'slowmo', n: 'Slow motion', hype: 2, lore: 2 },
  { id: 'story', n: 'Acting scene', hype: 1, lore: 4 },
  { id: 'cgi', n: 'CGI effects', hype: 4, lore: 2, cost: .3 },
  { id: 'fairy', n: 'Ending fairy', hype: 3, lore: 0, visual: true }
];
D.MV_BUDGET = [
  { n: 'Phone camera', cost: 3e6, q: -6 }, { n: 'Indie crew', cost: 1.5e7, q: 0 },
  { n: 'Studio production', cost: 5e7, q: 6 }, { n: 'Blockbuster', cost: 1.5e8, q: 12 }
];

// ------------------------------------------------------------------ schedules
// fame: minimum group fame tier, cost: condition per member, money/fans are base values scaled by fame
D.SCHEDULES = [
  { id: 'busk', n: 'Street busking', e: '🎸', fame: 0, cond: 8, money: 2e5, fans: 900, stat: 'vocal' },
  { id: 'fansign', n: 'Fansign event', e: '✍️', fame: 0, cond: 6, money: 1.5e6, fans: 700, trust: 3, stat: 'variety' },
  { id: 'radio', n: 'Radio guest spot', e: '📻', fame: 0, cond: 4, money: 6e5, fans: 1200, stat: 'variety' },
  { id: 'youtube', n: 'Web variety show', e: '▶️', fame: 0, cond: 5, money: 8e5, fans: 2000, stat: 'variety' },
  { id: 'univ', n: 'University festival', e: '🎓', fame: 1, cond: 10, money: 6e6, fans: 3500, stat: 'dance' },
  { id: 'mag', n: 'Magazine photoshoot', e: '📸', fame: 1, cond: 5, money: 4e6, fans: 2500, stat: 'visual' },
  { id: 'variety', n: 'TV variety show', e: '📺', fame: 1, cond: 7, money: 5e6, fans: 6000, stat: 'variety' },
  { id: 'ost', n: 'Drama OST', e: '🎬', fame: 2, cond: 5, money: 1.2e7, fans: 7000, stat: 'vocal' },
  { id: 'cf', n: 'Brand commercial (CF)', e: '💄', fame: 2, cond: 6, money: 3e7, fans: 5000, stat: 'visual' },
  { id: 'fanmeet', n: 'Overseas fan meeting', e: '✈️', fame: 2, cond: 12, money: 2.5e7, fans: 15000, stat: 'variety', global: true },
  { id: 'festival', n: 'Music festival slot', e: '🎪', fame: 3, cond: 12, money: 4e7, fans: 30000, stat: 'dance', global: true },
  { id: 'ambassador', n: 'Luxury brand ambassador', e: '👜', fame: 4, cond: 5, money: 1.2e8, fans: 40000, stat: 'visual', global: true },
  { id: 'usshow', n: 'US late-night show', e: '🇺🇸', fame: 4, cond: 10, money: 3e7, fans: 120000, stat: 'vocal', global: true, region: 'na' },
  { id: 'stadiumcf', n: 'Global campaign', e: '🌏', fame: 5, cond: 8, money: 4e8, fans: 200000, stat: 'visual', global: true }
];
D.FAME = [
  { n: 'Nugu', need: 0, c: '#9aa0b4' }, { n: 'Rookie', need: 20000, c: '#7ad3ff' }, { n: 'Rising star', need: 150000, c: '#3ccf9e' },
  { n: 'Popular', need: 800000, c: '#ffb800' }, { n: 'Top tier', need: 4e6, c: '#ff7a59' }, { n: 'Nation\'s group', need: 1.5e7, c: '#ff3d9a' },
  { n: 'Global icon', need: 4e7, c: '#9b5cff' }
];

// ------------------------------------------------------------------ own content (Monthly Entertainment style "produce contents")
D.CONTENT = [
  { id: 'vlog', n: 'Member vlogs', weeks: 2, cost: 2e6, fans: 6000, money: 1e6, need: 0 },
  { id: 'practice', n: 'Dance practice video', weeks: 1, cost: 1e6, fans: 5000, money: 5e5, need: 0, stat: 'dance' },
  { id: 'cook', n: 'Dorm cooking show', weeks: 3, cost: 6e6, fans: 15000, money: 4e6, need: 1, stat: 'variety' },
  { id: 'reality', n: 'Reality series', weeks: 4, cost: 2e7, fans: 45000, money: 1.5e7, need: 1, stat: 'variety' },
  { id: 'travel', n: 'Travel reality abroad', weeks: 4, cost: 4e7, fans: 90000, money: 3e7, need: 2, stat: 'variety', global: true },
  { id: 'docu', n: 'Documentary film', weeks: 6, cost: 1e8, fans: 250000, money: 1.2e8, need: 3 },
  { id: 'challenge', n: 'Dance challenge', weeks: 1, cost: 1e6, fans: 3000, money: 0, need: 0, viral: true }
];

// ------------------------------------------------------------------ world tour
D.REGIONS = [
  { id: 'kr', n: 'Korea' }, { id: 'jp', n: 'Japan' }, { id: 'sea', n: 'Southeast Asia' },
  { id: 'na', n: 'North America' }, { id: 'latam', n: 'Latin America' }, { id: 'eu', n: 'Europe' }, { id: 'oc', n: 'Oceania' }
];
D.CITIES = [
  { n: 'Seoul', r: 'kr' }, { n: 'Busan', r: 'kr' }, { n: 'Tokyo', r: 'jp' }, { n: 'Osaka', r: 'jp' },
  { n: 'Bangkok', r: 'sea' }, { n: 'Manila', r: 'sea' }, { n: 'Jakarta', r: 'sea' }, { n: 'Singapore', r: 'sea' },
  { n: 'Los Angeles', r: 'na' }, { n: 'New York', r: 'na' }, { n: 'Chicago', r: 'na' }, { n: 'Toronto', r: 'na' },
  { n: 'Mexico City', r: 'latam' }, { n: 'São Paulo', r: 'latam' }, { n: 'Santiago', r: 'latam' },
  { n: 'London', r: 'eu' }, { n: 'Paris', r: 'eu' }, { n: 'Berlin', r: 'eu' }, { n: 'Sydney', r: 'oc' }, { n: 'Melbourne', r: 'oc' }
];
D.VENUES = [
  { id: 'hall', n: 'Concert hall', cap: 3000, cost: 8e7, fame: 1 },
  { id: 'arena', n: 'Arena', cap: 15000, cost: 3e8, fame: 2 },
  { id: 'dome', n: 'Dome', cap: 45000, cost: 9e8, fame: 4 },
  { id: 'stadium', n: 'Stadium', cap: 70000, cost: 1.6e9, fame: 5 }
];

// ------------------------------------------------------------------ real groups (charts, music shows, nominations, rivals)
// Real groups appear only as chart entries, music show competition and award nominees. No invented drama about them.
D.REAL = [
  { n: 'BTS', g: 'm', pop: 98, songs: ['Dynamite', 'Butter', 'Permission to Dance'] },
  { n: 'BLACKPINK', g: 'f', pop: 96, songs: ['Pink Venom', 'How You Like That', 'Shut Down'] },
  { n: 'SEVENTEEN', g: 'm', pop: 90, songs: ['Super', 'God of Music', 'MAESTRO'] },
  { n: 'Stray Kids', g: 'm', pop: 90, songs: ['S-Class', 'LALALALA', 'Chk Chk Boom'] },
  { n: 'TWICE', g: 'f', pop: 86, songs: ['Fancy', 'Talk that Talk', 'What is Love?'] },
  { n: 'NewJeans', g: 'f', pop: 88, songs: ['Hype Boy', 'Ditto', 'Super Shy'] },
  { n: 'aespa', g: 'f', pop: 89, songs: ['Supernova', 'Whiplash', 'Next Level'] },
  { n: 'IVE', g: 'f', pop: 86, songs: ['LOVE DIVE', 'I AM', 'After LIKE'] },
  { n: 'LE SSERAFIM', g: 'f', pop: 83, songs: ['ANTIFRAGILE', 'EASY', 'CRAZY'] },
  { n: '(G)I-DLE', g: 'f', pop: 82, songs: ['Queencard', 'TOMBOY', 'Super Lady'] },
  { n: 'ATEEZ', g: 'm', pop: 82, songs: ['Bouncy', 'WORK', 'Guerrilla'] },
  { n: 'ENHYPEN', g: 'm', pop: 80, songs: ['Bite Me', 'XO (Only If You Say Yes)', 'Drunk-Dazed'] },
  { n: 'TXT', g: 'm', pop: 79, songs: ['Sugar Rush Ride', 'Deja Vu', 'Chasing That Feeling'] },
  { n: 'NCT 127', g: 'm', pop: 76, songs: ['Kick It', 'Sticker', '2 Baddies'] },
  { n: 'ITZY', g: 'f', pop: 74, songs: ['WANNABE', 'DALLA DALLA', 'SNEAKERS'] },
  { n: 'Red Velvet', g: 'f', pop: 74, songs: ['Psycho', 'Feel My Rhythm', 'Red Flavor'] },
  { n: 'ZEROBASEONE', g: 'm', pop: 76, songs: ['In Bloom', 'Feel the POP', 'GOOD SO BAD'] },
  { n: 'BABYMONSTER', g: 'f', pop: 78, songs: ['SHEESH', 'DRIP', 'FOREVER'] },
  { n: 'RIIZE', g: 'm', pop: 75, songs: ['Get A Guitar', 'Boom Boom Bass', 'Love 119'] },
  { n: 'ILLIT', g: 'f', pop: 74, songs: ['Magnetic', 'Cherish (My Love)', 'Lucky Girl Syndrome'] },
  { n: 'BOYNEXTDOOR', g: 'm', pop: 72, songs: ['Earth, Wind & Fire', 'Nice Guy', 'IF I SAY, I LOVE YOU'] },
  { n: 'TWS', g: 'm', pop: 70, songs: ['plot twist', 'If I\'m S, Can You Be My N?', 'Last Festival'] },
  { n: 'KISS OF LIFE', g: 'f', pop: 69, songs: ['Midas Touch', 'Sticky', 'Igloo'] },
  { n: 'NMIXX', g: 'f', pop: 70, songs: ['DASH', 'Love Me Like This', 'O.O'] },
  { n: 'KATSEYE', g: 'f', pop: 77, songs: ['Gnarly', 'Gabriela', 'Touch'] },
  { n: 'EXO', g: 'm', pop: 75, songs: ['Love Shot', 'Growl', 'Monster'] },
  { n: 'MAMAMOO', g: 'f', pop: 70, songs: ['HIP', 'Starry Night', 'Egotistic'] },
  { n: 'Treasure', g: 'm', pop: 70, songs: ['JIKJIN', 'Hello', 'BONA BONA'] },
  { n: 'Kep1er', g: 'f', pop: 64, songs: ['WA DA DA', 'Up!', 'Shooting Star'] },
  { n: 'P1Harmony', g: 'm', pop: 66, songs: ['JUMP', 'Killin\' It', 'SAD SONG'] }
];
// Fictional rival agencies with their own groups (these can get into fan wars with yours)
D.RIVAL_AGENCIES = [
  { n: 'Prism Star Ent.', groups: [{ n: 'VYRA', g: 'f' }, { n: 'NOVA9', g: 'm' }] },
  { n: 'Bluehour Music', groups: [{ n: 'Lumière', g: 'f' }, { n: 'OCTANE', g: 'm' }] },
  { n: 'Moonrise Label', groups: [{ n: 'cherrybomb', g: 'f' }, { n: 'XEN', g: 'm' }] }
];

// ------------------------------------------------------------------ music shows and award shows (fictional names, real format)
D.MUSIC_SHOWS = ['Music Wave', 'Stage Pop!', 'Show Champ Live', 'K-Chart Countdown', 'Idol Spotlight', 'Sunday Stage'];
D.AWARDS = [
  { id: 'sama', n: 'Star Asia Music Awards', short: 'SAMA', week: 45, where: 'Osaka', d: 'The big overseas year-end show with fan voting and huge collab stages.', cats: ['Best New Artist', 'Best Dance Performance', 'Best Vocal Performance', 'Worldwide Fans\' Choice', 'Song of the Year', 'Album of the Year', 'Artist of the Year'] },
  { id: 'gra', n: 'Golden Record Awards', short: 'GRA', week: 46, where: 'Seoul', d: 'Based on album sales. Bonsangs for the top ten, then the album and digital daesangs.', cats: ['Rookie of the Year', 'Bonsang', 'Digital Daesang', 'Album Daesang'] },
  { id: 'sma', n: 'Stream Music Awards', short: 'SMA', week: 47, where: 'Seoul', d: 'Based on streaming. Top 10 artists, then Record, Song and Artist of the Year.', cats: ['New Artist of the Year', 'Top 10 Artist', 'Song of the Year', 'Record of the Year', 'Artist of the Year'] },
  { id: 'ssa', n: 'Seoul Star Awards', short: 'SSA', week: 48, where: 'Seoul', d: 'The last show of the year. Popularity votes plus a jury.', cats: ['Rookie Award', 'Main Prize', 'Popularity Award', 'Grand Prize (Daesang)'] }
];
D.FICTIONAL_ROOKIES = [{ n: 'AURORA7', g: 'f' }, { n: 'Daybreak', g: 'm' }, { n: 'SOLARE', g: 'f' }, { n: 'HYPERLINK', g: 'm' }, { n: 'pastel.', g: 'f' }, { n: 'KNIGHTS', g: 'm' }];

// ------------------------------------------------------------------ survival show
D.SHOW_NAME = 'Starlight Survival: Global';
D.SHOW_EPISODES = [
  { n: 'Ep 1 · Level test', d: 'Trainees perform alone and get A to F ranks.', stat: 'mix' },
  { n: 'Ep 2 · Group battle', d: 'Teams face off on the same song.', stat: 'dance' },
  { n: 'Ep 3 · Position evaluation', d: 'Vocal, dance or rap. Pick your best.', stat: 'best' },
  { n: 'Ep 4 · First elimination', d: 'Only the top half survive.', stat: 'mix', cut: .5 },
  { n: 'Ep 5 · Concept evaluation', d: 'New songs, new concepts. Visual and stage presence count.', stat: 'visual' },
  { n: 'Ep 6 · Second elimination', d: 'Only 20 remain.', stat: 'mix', cut: .4 },
  { n: 'Ep 7 · Debut evaluation (live finale)', d: 'Live votes decide the final lineup.', stat: 'mix', final: true }
];
D.SHOW_FOCUS = [
  { id: 'skill', n: 'Show their skills', d: 'Better scores, less screen time.' },
  { id: 'story', n: 'Tell their story', d: 'Big screen time and fan votes, smaller scores.' },
  { id: 'friend', n: 'Friendship moments', d: 'Safe fan votes. No evil edit risk.' },
  { id: 'rival', n: 'Rivalry storyline', d: 'Huge buzz. Risk of an evil edit.' }
];

// ------------------------------------------------------------------ hate trains (aimed at the player's groups only)
D.HATE = [
  { id: 'lipsync', n: 'Lip sync accusations', t: 'A clip claims {g} lip-synced their whole stage.', proofOk: true },
  { id: 'plagiarism', n: 'Plagiarism claims', t: 'Netizens say "{s}" copies an old song.', proofOk: true },
  { id: 'attitude', n: 'Attitude controversy', t: 'A cut-off clip makes {m} look rude to staff.', proofOk: true },
  { id: 'lines', n: 'Line distribution war', t: 'Fans are furious about who got the fewest lines in "{s}".', fix: 'lines' },
  { id: 'dating', n: 'Dating rumor', t: 'Blurry photos claim {m} is dating someone.', proofOk: false },
  { id: 'concept', n: 'Concept backlash', t: 'Critics call the "{c}" concept for {g} tone-deaf.', proofOk: false },
  { id: 'fanwar', n: 'Fan war', t: 'Fans of {r} and {f} are fighting over chart results.', proofOk: false },
  { id: 'overwork', n: 'Overwork outrage', t: 'Fans start #ProtectGroup trends, saying the agency overworks {g}.', fix: 'rest' },
  { id: 'live', n: 'Shaky live vocals', t: 'A fancam of a bad live stage by {g} goes viral for the wrong reasons.', proofOk: false }
];
D.HATE_RESP = [
  { id: 'silent', n: 'Stay silent', d: 'Wait it out. Heat fades slowly, fan trust slips.' },
  { id: 'statement', n: 'Official statement', d: 'Cools things down. Fans want more than words.' },
  { id: 'proof', n: 'Post proof', d: 'Release the full clip or files. Ends it if the claim is false.' },
  { id: 'legal', n: 'Legal action', d: 'Costs money. Heat drops over the next weeks and fans feel protected.' },
  { id: 'apology', n: 'Apologize', d: 'Ends it fast but some fans leave.' },
  { id: 'live', n: 'Members talk on a live', d: 'Big swing. It can end everything, or make it worse.' }
];

// ------------------------------------------------------------------ fan requests (Monthly Entertainment style "listen to their requests")
D.REQUESTS = [
  { id: 'selca', t: 'Can {m} post a selca? We miss them 🥺', cost: { cond: 2 }, trust: 4, fans: 1500 },
  { id: 'live', t: 'Please do a live broadcast tonight!', cost: { cond: 6 }, trust: 6, fans: 3000 },
  { id: 'lines', t: 'Give {m} more lines next comeback!!', cost: {}, trust: 5, fans: 1000, flag: 'lines' },
  { id: 'concert', t: 'Come to {city}! We\'ll fill any venue 🌍', cost: {}, trust: 6, fans: 2000, flag: 'city' },
  { id: 'fansong', t: 'We want a fan song just for us 💌', cost: { money: 8e6 }, trust: 10, fans: 4000 },
  { id: 'rest', t: 'Let them rest please, they look so tired 😢', cost: { rest: true }, trust: 8, fans: 500 },
  { id: 'content', t: 'More variety content please! A reality show!!', cost: { money: 4e6 }, trust: 5, fans: 5000 },
  { id: 'lightstick', t: 'When is the official lightstick coming out?', cost: { money: 1.5e7 }, trust: 7, fans: 2500, money: 4e7 },
  { id: 'jp', t: 'Japanese fans are waiting for a JP debut!', cost: {}, trust: 4, fans: 1000, flag: 'jp' },
  { id: 'dance', t: 'Upload the dance practice video!', cost: { cond: 3 }, trust: 5, fans: 4000 },
  { id: 'cover', t: 'Can {m} do a song cover? Their voice heals me', cost: { cond: 3 }, trust: 5, fans: 2500 },
  { id: 'merch', t: 'Season\'s greetings please 📅', cost: { money: 5e6 }, trust: 4, fans: 1500, money: 1.8e7 }
];
D.SNS_POS = [
  '{g} visuals today are illegal 😭', 'the {s} dance break lives in my head rent free', 'just bought 12 copies of {s} for the photocards',
  '{m} ending fairy pls I\'m on the floor', 'streaming party for {s} at 9pm!!', '{g} live vocals are actually insane',
  'nobody talks about how funny {m} is on variety', 'my bias {m} said good night to fans 🥹', '{f} we\'re going to the moon',
  '{s} MV theory thread 🧵 1/27', 'the way {m} looked at the camera...', '{g} deserve a daesang. I said what I said'
];
D.SNS_NEU = [
  '{r} comeback next week, who else is excited', 'music show lineup this week is stacked', 'which 5th gen group is your fave rn?',
  '{r} really carried this year', 'stan twitter is wild today', 'the year-end award season is coming 👀'
];
D.SNS_NEG = [
  'not {g} getting all this push from their agency', '{s} is mid, sorry', 'their agency needs to fix the line distribution',
  'why does {m} always get the center', 'live stage was rough today ngl', 'they\'re overworking {g}, let them sleep'
];
D.HANDLES = ['stan4life', 'kpopdaily', 'biasruiner', 'lightstick_ocean', 'pann_reader', 'fancam_queen', 'chart_watcher', 'dorm_tour', 'maknae_line', 'comeback_szn', 'netizen_93', 'vote_squad', 'mvtheories', 'photocard_mom', 'daesang_dreams'];

// ------------------------------------------------------------------ random weekly events
D.EVENTS = [
  { t: 'Two members of {g} argued about the choreography.', c: [['Talk it out together', { mood: 5, cond: -3 }], ['Let the leader handle it', { mood: 2 }], ['Ignore it', { mood: -8 }]] },
  { t: 'A famous variety PD wants {m} for a pilot episode.', c: [['Say yes', { fans: 8000, cond: -6, money: 3e6 }], ['Decline, they need rest', { cond: 5 }]] },
  { t: '{m} sprained an ankle in practice.', c: [['Two weeks of rest', { rest: 2 }], ['Keep going carefully', { cond: -15, risk: 'injury' }]] },
  { t: 'A dance cover of {s} by a famous dancer goes viral.', c: [['Repost and thank them', { fans: 15000 }], ['Do a duet challenge', { fans: 30000, cond: -4 }]] },
  { t: '{m} wants to write a song for the next album.', c: [['Support them', { mood: 10, flag: 'writer' }], ['Not yet', { mood: -5 }]] },
  { t: 'Fans sent a food truck to the dorm for {g}.', c: [['Post a thank-you video', { trust: 6, fans: 3000 }], ['Thank them on SNS', { trust: 3 }]] },
  { t: 'A luxury brand noticed {m}\'s airport fashion.', c: [['Take the photoshoot', { money: 1.5e7, fans: 10000, cond: -4 }], ['Pass this time', {}]] },
  { t: 'The dorm air conditioner broke during a heat wave.', c: [['Fix it right away', { money: -3e6, mood: 4 }], ['Wait until next month', { mood: -8, cond: -5 }]] },
  { t: '{m} is homesick and quiet in practice.', c: [['Send them home for a weekend', { mood: 12, cond: 8 }], ['Plan a group dinner', { mood: 6, money: -1e6 }]] },
  { t: 'A sasaeng fan followed {g} to the dorm.', c: [['Hire more security', { money: -1e7, mood: 6 }], ['Post a warning', { trust: 2, mood: -2 }]] }
];

// ------------------------------------------------------------------ achievements
D.ACH = [
  { id: 'scout', n: 'First scout', d: 'Sign your first trainee.' },
  { id: 'aplus', n: 'A+ trainee', d: 'Get an A grade at a monthly evaluation.' },
  { id: 'show', n: 'Survival star', d: 'Get a trainee into the final lineup of the survival show.' },
  { id: 'debut', n: 'Debut!', d: 'Debut your first group.' },
  { id: 'mv1m', n: 'A million views', d: 'Get 1M views on a music video.' },
  { id: 'mv100m', n: '100M club', d: 'Get 100M views on a music video.' },
  { id: 'win1', n: 'First win', d: 'Win a music show.' },
  { id: 'triple', n: 'Triple crown', d: 'Win the same song three weeks in a row.' },
  { id: 'chart1', n: 'Number one', d: 'Top the weekly chart.' },
  { id: 'allkill', n: 'All-kill', d: 'Stay #1 for four weeks.' },
  { id: 'bonsang', n: 'Bonsang', d: 'Win any award.' },
  { id: 'daesang', n: 'Daesang', d: 'Win a grand prize.' },
  { id: 'rookie', n: 'Rookie of the year', d: 'Win a rookie award.' },
  { id: 'tour', n: 'World tour', d: 'Finish a tour.' },
  { id: 'stadium', n: 'Stadium', d: 'Sell out a stadium.' },
  { id: 'fame4', n: 'Top tier', d: 'Reach Top tier fame.' },
  { id: 'fame6', n: 'Global icon', d: 'Reach Global icon fame.' },
  { id: 'brand1', n: 'Brand reputation #1', d: 'Rank #1 in brand reputation.' },
  { id: 'twogroups', n: 'Two groups', d: 'Run two debuted groups at once.' },
  { id: 'big4', n: 'Big 4', d: 'Reach Big 4 agency rank.' },
  { id: 'billion', n: 'Billionaire CEO', d: 'Have ₩10 billion.' },
  { id: 'survive', n: 'Survived the hate', d: 'Shut down a hate train.' },
  { id: 'content', n: 'Content king', d: 'Release 5 pieces of content.' },
  { id: 'viral', n: 'Viral challenge', d: 'Have a dance challenge go viral.' },
  { id: 'renew', n: 'Renewed', d: 'Renew a group\'s contract.' },
  { id: 'dd', n: 'Old friend', d: 'Sign your Debut Dream idol.' }
];

// ------------------------------------------------------------------ tutorial (guided, with Manager Bora)
// sel: element to highlight. go: action that moves the tutorial to the next step when the player does it.
D.TUTORIAL = [
  { t: 'Hi CEO! I\'m Bora, your manager. Welcome to your new agency. It\'s just a basement for now, but we\'re going to make it the biggest name in K-pop!' },
  { t: 'Up top you can see our money, the date and the agency rank. Every turn is one week. We pay salaries at the start of every month, so keep an eye on the money.', sel: '#topbar' },
  { t: 'This is our building. Each floor is a room. Tap a room to upgrade it. Better rooms make training faster.', sel: '#bldg' },
  { t: 'First we need trainees! Open the Trainees tab.', sel: '[data-tab="trainees"]', go: 'tab:trainees' },
  { t: 'Tap Scout to hold an audition. Different auditions find different kinds of trainees.', sel: '[data-a="scoutMenu"]', go: 'scouted' },
  { t: 'Nice signing! Each trainee has a training plan. Tap a trainee to change their plan, check their stats and find their hidden trait.', sel: '.tr-list' },
  { t: 'Watch their condition bar. If it drops too low, they get sick or upset. Rest fixes it.', sel: '.tr-list' },
  { t: 'When you have 3 or more good trainees, you can send them to the survival show or debut a group directly. Debut needs an album and a music video.', sel: '[data-a="debutMenu"]' },
  { t: 'Groups get schedules for money and fans, comebacks, tours and their own content. Fans send requests on the SNS tab. Answer them to build trust!', sel: '[data-tab="sns"]' },
  { t: 'Now tap Next week to train. Good luck, CEO! You can replay this tutorial any time from the menu.', sel: '[data-a="next"]', go: 'next' }
];
// Short one-time tips for later moments
D.TIPS = {
  eval: 'Monthly evaluation time! Grades go from F to A. Trainees with bad grades lose mood, and some might quit if it keeps up.',
  debut: 'Your first group! Plan their debut album. The title track, line distribution and music video all affect how it does.',
  release: 'Release week! Watch the chart and music shows. A song stays in promotion for 4 weeks.',
  hate: 'Uh oh, a hate train. The heat rises each week you leave it. Pick a response on the SNS tab. Some claims are false and can be proven wrong.',
  awards: 'Award season! Four shows in December. Nominations depend on this year\'s sales, streams and fans.',
  tour: 'Tours make a lot of money and grow fans in each region, but they cost condition. Pick cities where you have fans.',
  show: 'Survival show! Each week is one episode. Pick a storyline focus for each of your trainees.',
  request: 'A fan request! Fulfilling them raises fan trust, which protects you from hate trains.'
};

D.MANAGER = { n: 'Bora', look: { g: 'f', skin: 1, hair: 2, hairC: 1, top: 'suit', topC: 2, botC: 2, acc: 3, eye: 0 } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
