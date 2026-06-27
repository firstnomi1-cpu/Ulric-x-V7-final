/**
 * Ulric-X MD - Fun Commands (Extended) — 50+ more
 */
const utils = require('../lib/utils');

module.exports = [
  // ─── Random Text Generators ─────────────────────────────────
  {
    name: 'quote2', alias: ['q2'], category: 'fun', desc: 'Random inspirational quote',
    handler: async (ctx) => {
      const q = ['The only way to do great work is to love what you do. - Steve Jobs', 'Believe you can and you are halfway there. - Theodore Roosevelt', 'Success is not final, failure is not fatal. - Winston Churchill', 'The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt', 'In the middle of every difficulty lies opportunity. - Albert Einstein', 'Life is what happens when you are busy making other plans. - John Lennon', 'The only limit to our realization of tomorrow is our doubts of today. - FDR', 'Be the change you wish to see in the world. - Gandhi'];
      ctx.reply('💬 ' + utils.pickRandom(q));
    }
  },
  {
    name: 'fact2', alias: ['randomfact2'], category: 'fun', desc: 'Random fun fact',
    handler: async (ctx) => {
      const f = ['Honey never spoils.', 'Octopuses have three hearts.', 'A group of flamingos is called a "flamboyance".', 'Bananas are berries, but strawberries are not.', 'A jiffy is an actual unit of time (1/100 of a second).', 'The shortest war in history lasted 38 minutes.', 'Cows have best friends.', 'Sharks existed before trees.', 'Wombat poop is cube-shaped.', 'A group of crows is called a "murder".', 'The first computer bug was an actual moth.', 'Humans share 50% of their DNA with bananas.', 'A cloud can weigh over a million pounds.', 'The Eiffel Tower can grow taller in summer.', 'There are more stars in the universe than grains of sand on Earth.'];
      ctx.reply('🧠 ' + utils.pickRandom(f));
    }
  },
  {
    name: 'wordofday', alias: ['wotd'], category: 'fun', desc: 'Word of the day',
    handler: async (ctx) => {
      const words = ['Ephemeral - lasting for a very short time', 'Serendipity - finding good things by chance', 'Eloquent - fluent and persuasive in speech', 'Resilient - able to recover quickly', 'Quintessential - representing the most perfect example', 'Mellifluous - sweet-sounding', 'Petrichor - the smell of earth after rain', 'Euphoria - intense happiness', 'Nostalgia - sentimental longing for the past', 'Wanderlust - strong desire to travel'];
      ctx.reply('📖 ' + utils.pickRandom(words));
    }
  },
  {
    name: 'riddle', alias: ['puzzle'], category: 'fun', desc: 'Random riddle',
    handler: async (ctx) => {
      const r = [
        { q: 'I am not alive, but I grow. I do not have lungs, but I need air. What am I?', a: 'Fire' },
        { q: 'The more you take, the more you leave behind. What are they?', a: 'Footsteps' },
        { q: 'What has a head, a tail, is brown, and has no legs?', a: 'A penny' },
        { q: 'What can travel around the world while staying in a corner?', a: 'A stamp' },
        { q: 'What gets wetter as it dries?', a: 'A towel' }
      ];
      const x = utils.pickRandom(r);
      ctx.reply(`🤔 ${x.q}\n\nReply with .answer ${x.a}`);
    }
  },

  // ─── Character Tests ────────────────────────────────────────
  {
    name: 'stupidtest', alias: ['stupid'], category: 'fun', desc: 'Stupid test',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`🤪 ${t.split('@')[0]} is ${utils.randInt(0,100)}% stupid!`);
    }
  },
  {
    name: 'crazytest', alias: ['crazy'], category: 'fun', desc: 'Crazy test',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`🤯 ${t.split('@')[0]} is ${utils.randInt(0,100)}% crazy!`);
    }
  },
  {
    name: 'lazytest', alias: ['lazy'], category: 'fun', desc: 'Lazy test',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`😴 ${t.split('@')[0]} is ${utils.randInt(0,100)}% lazy!`);
    }
  },
  {
    name: 'kindtest', alias: ['kind'], category: 'fun', desc: 'Kind test',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`💝 ${t.split('@')[0]} is ${utils.randInt(0,100)}% kind!`);
    }
  },
  {
    name: 'hot', alias: ['hot2'], category: 'fun', desc: 'Hot test',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`🔥 ${t.split('@')[0]} is ${utils.randInt(50,100)}% hot! 😍`);
    }
  },
  {
    name: 'cool2', alias: ['cooltest'], category: 'fun', desc: 'Cool test',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`😎 ${t.split('@')[0]} is ${utils.randInt(0,100)}% cool!`);
    }
  },
  {
    name: 'mentalage', alias: ['mature'], category: 'fun', desc: 'Mental age',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`🧠 ${t.split('@')[0]}'s mental age is ${utils.randInt(5,80)} years old!`);
    }
  },
  {
    name: 'soulmate', alias: ['soul'], category: 'fun', desc: 'Find soulmate',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`💕 ${t.split('@')[0]}'s soulmate is... @${ctx.sender.split('@')[0]}! 💞`);
    }
  },

  // ─── Fortune / 8Ball Variants ───────────────────────────────
  {
    name: 'fortune', alias: ['cookie'], category: 'fun', desc: 'Random fortune',
    handler: async (ctx) => {
      const f = ['A pleasant surprise is in store for you.', 'You will find inner peace soon.', 'Good things come to those who wait.', 'Your hard work will pay off.', 'Adventure awaits you next week.', 'A new opportunity will present itself.', 'Trust your instincts.', 'Today is your lucky day.', 'Someone is thinking of you right now.', 'You will soon receive good news.'];
      ctx.reply('🥠 ' + utils.pickRandom(f));
    }
  },
  {
    name: 'magicconch', alias: ['conch'], category: 'fun', desc: 'Magic conch shell',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Ask the magic conch: ${ctx.prefix}magicconch Will I be rich?`);
      const answers = ['Yes', 'No', 'Maybe someday', 'Try asking again', 'I cannot answer that', 'Definitely', 'Never', 'The future is unclear', 'Absolutely yes', 'Absolutely not'];
      ctx.reply(`🐚 ${utils.pickRandom(answers)}`);
    }
  },

  // ─── Random Generators ──────────────────────────────────────
  {
    name: 'randomname', alias: ['fakename'], category: 'fun', desc: 'Random name',
    handler: async (ctx) => {
      const first = ['Alex', 'Sam', 'Chris', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Avery', 'Quinn', 'Jamie', 'Drew', 'Skyler', 'Cameron', 'Reese', 'Hayden', 'Logan', 'Avery', 'Parker', 'Sage'];
      const last = ['Smith', 'Johnson', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
      ctx.reply(`👤 Random name: ${utils.pickRandom(first)} ${utils.pickRandom(last)}`);
    }
  },
  {
    name: 'randomnumber', alias: ['rnd'], category: 'fun', desc: 'Random number 1-100',
    handler: async (ctx) => ctx.reply(`🎲 Your number: ${utils.randInt(1, 100)}`)
  },
  {
    name: 'randomcolor', alias: ['randcolor'], category: 'fun', desc: 'Random color name',
    handler: async (ctx) => {
      const colors = ['Crimson', 'Azure', 'Emerald', 'Goldenrod', 'Lavender', 'Magenta', 'Turquoise', 'Coral', 'Indigo', 'Maroon', 'Teal', 'Violet', 'Bronze', 'Champagne', 'Cobalt', 'Fuchsia'];
      ctx.reply(`🎨 ${utils.pickRandom(colors)} (${utils.randHex()})`);
    }
  },
  {
    name: 'randomword', alias: ['randword'], category: 'fun', desc: 'Random English word',
    handler: async (ctx) => {
      const words = ['serendipity', 'ephemeral', 'eloquent', 'mellifluous', 'luminous', 'ethereal', 'petrichor', 'wanderlust', 'solitude', 'tranquil', 'mystical', 'curious', 'resilient', 'quaint', 'whimsical', 'nostalgia'];
      ctx.reply(`📝 ${utils.pickRandom(words)}`);
    }
  },

  // ─── Math & Logic ───────────────────────────────────────────
  {
    name: 'lucky', alias: ['luckynumber'], category: 'fun', desc: 'Your lucky number',
    handler: async (ctx) => ctx.reply(`🍀 Your lucky number today: ${utils.randInt(1, 99)}`)
  },
  {
    name: 'horoscope2', alias: ['horo2'], category: 'fun', desc: 'Daily horoscope',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}horoscope2 Aries`);
      const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
      if (!signs.includes(ctx.q.toLowerCase())) return ctx.reply('Invalid sign. Try: Aries, Taurus, Gemini, etc.');
      const predictions = ['Today is your lucky day!', 'Be cautious in financial matters.', 'Love is in the air.', 'A new opportunity will come.', 'Trust your intuition today.', 'Avoid conflicts today.', 'Good news awaits you.', 'Take time for self-care.'];
      ctx.reply(`🔮 ${ctx.q}: ${utils.pickRandom(predictions)}`);
    }
  },
  {
    name: 'zodiac', alias: ['zodiacsign'], category: 'fun', desc: 'Get zodiac sign from date',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}zodiac 2000-05-15`);
      const d = new Date(ctx.q);
      const m = d.getMonth() + 1, day = d.getDate();
      const z = [['Capricorn', 1, 19], ['Aquarius', 2, 18], ['Pisces', 3, 20], ['Aries', 4, 19], ['Taurus', 5, 20], ['Gemini', 6, 20], ['Cancer', 7, 22], ['Leo', 8, 22], ['Virgo', 9, 22], ['Libra', 10, 22], ['Scorpio', 11, 21], ['Sagittarius', 12, 21], ['Capricorn', 12, 31]];
      const sign = (m === 1 && day <= 19) || (m === 12 && day >= 22) ? 'Capricorn' :
                   (m === 2 && day <= 18) || (m === 1 && day >= 20) ? 'Aquarius' :
                   (m === 3 && day <= 20) || (m === 2 && day >= 19) ? 'Pisces' :
                   (m === 4 && day <= 19) || (m === 3 && day >= 21) ? 'Aries' :
                   (m === 5 && day <= 20) || (m === 4 && day >= 20) ? 'Taurus' :
                   (m === 6 && day <= 20) || (m === 5 && day >= 21) ? 'Gemini' :
                   (m === 7 && day <= 22) || (m === 6 && day >= 21) ? 'Cancer' :
                   (m === 8 && day <= 22) || (m === 7 && day >= 23) ? 'Leo' :
                   (m === 9 && day <= 22) || (m === 8 && day >= 23) ? 'Virgo' :
                   (m === 10 && day <= 22) || (m === 9 && day >= 23) ? 'Libra' :
                   (m === 11 && day <= 21) || (m === 10 && day >= 23) ? 'Scorpio' :
                   (m === 12 && day <= 21) || (m === 11 && day >= 22) ? 'Sagittarius' : 'Unknown';
      ctx.reply(`♈ Your zodiac sign: ${sign}`);
    }
  },

  // ─── Confessions / Compliments ──────────────────────────────
  {
    name: 'compliment2', alias: ['compl2'], category: 'fun', desc: 'Random compliment',
    handler: async (ctx) => {
      const c = ['You have an amazing smile!', 'Your positivity is contagious.', 'You light up every room.', 'You are stronger than you think.', 'Your kindness makes the world better.', 'You are incredibly talented!', 'You inspire others around you.', 'Your laugh is the best.', 'You bring out the best in people.', 'You are one of a kind!'];
      ctx.reply('💝 ' + utils.pickRandom(c));
    }
  },
  {
    name: 'roast2', alias: ['burn'], category: 'fun', desc: 'Mild roast',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      const r = ['You are like a cloud. When you disappear, it is a beautiful day.', 'You are not stupid, you just have bad luck thinking.', 'I would agree with you but then we would both be wrong.', 'You are the reason the gene pool needs a lifeguard.', 'You are as bright as a black hole.', 'If I threw a stick, you would fetch it.', 'You have got two brain cells and they are both fighting for third place.', 'You are proof that evolution can go in reverse.'];
      ctx.reply(`🔥 @${t.split('@')[0]}: ${utils.pickRandom(r)}`);
    }
  },

  // ─── Magic ──────────────────────────────────────────────────
  {
    name: 'spell', alias: ['castspell'], category: 'fun', desc: 'Cast a random spell',
    handler: async (ctx) => {
      const spells = ['✨ Abracadabra! ✨', '🔮 Hocus Pocus! 🔮', '⚡ Expecto Patronum! ⚡', '🪄 Wingardium Leviosa! 🪄', '🌟 Alakazam! 🌟', '💫 Expelliarmus! 💫', '🔮 Sim Sala Bim! 🔮', '✨ Open Sesame! ✨'];
      ctx.reply(utils.pickRandom(spells));
    }
  },

  // ─── Random Choices ─────────────────────────────────────────
  {
    name: 'yesno2', alias: ['decide2'], category: 'fun', desc: 'Random yes/no',
    handler: async (ctx) => {
      const answers = ['Yes, definitely!', 'No way!', 'Maybe...', 'Ask again later', 'Without a doubt', 'My sources say no', 'Yes!', 'No!', 'Hmm, not sure', 'Absolutely!'];
      ctx.reply(`🤔 ${utils.pickRandom(answers)}`);
    }
  },
  {
    name: 'choose2', alias: ['pick2'], category: 'fun', desc: 'Choose between options',
    handler: async (ctx) => {
      if (!ctx.q?.includes(',')) return ctx.reply(`Example: ${ctx.prefix}choose2 pizza, burger, sushi`);
      const opts = ctx.q.split(',').map(s => s.trim()).filter(Boolean);
      ctx.reply(`🎯 I choose: ${utils.pickRandom(opts)}`);
    }
  },

  // ─── Day Facts ──────────────────────────────────────────────
  {
    name: 'today', alias: ['todayfact'], category: 'fun', desc: 'Random fact about today',
    handler: async (ctx) => {
      const d = new Date();
      ctx.reply(`📅 Today is ${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n🌟 Day of year: ${Math.ceil((d - new Date(d.getFullYear(),0,0)) / 86400000)}`);
    }
  },

  // ─── Trivia Categories ──────────────────────────────────────
  {
    name: 'trivia2', alias: ['quiz2'], category: 'fun', desc: 'Random trivia',
    handler: async (ctx) => {
      const t = [
        { q: 'What is the largest country in the world?', a: 'Russia' },
        { q: 'What is the smallest country?', a: 'Vatican City' },
        { q: 'How many bones in the human body?', a: '206' },
        { q: 'What is the chemical symbol for water?', a: 'H2O' },
        { q: 'Who painted the Mona Lisa?', a: 'Da Vinci' },
        { q: 'What is the tallest mountain?', a: 'Everest' },
        { q: 'How many continents are there?', a: '7' },
        { q: 'What is the largest planet?', a: 'Jupiter' },
        { q: 'What is the speed of light?', a: '300,000 km/s' },
        { q: 'In what year did WW2 end?', a: '1945' }
      ];
      const x = utils.pickRandom(t);
      ctx.reply(`🧠 Trivia:\n${x.q}\n\nReply: .answer ${x.a}`);
    }
  },

  // ─── Text Games ─────────────────────────────────────────────
  {
    name: 'would', alias: ['wyr2'], category: 'fun', desc: 'Would you rather',
    handler: async (ctx) => {
      const w = ['Have the ability to fly OR be invisible?', 'Be rich OR famous?', 'Live without internet OR without music?', 'Time travel to past OR future?', 'Have 3 wishes OR 1 million dollars?', 'Speak all languages OR play all instruments?', 'Be the best at one thing OR average at many?', 'Have unlimited money OR unlimited time?', 'Live forever OR live 100 happy years?', 'Always be 10 minutes late OR 20 minutes early?'];
      ctx.reply('🤔 Would you rather: ' + utils.pickRandom(w));
    }
  },
  {
    name: 'never', alias: ['nhie'], category: 'fun', desc: 'Never have I ever',
    handler: async (ctx) => {
      const n = ['Never have I ever skipped school.', 'Never have I ever lied to my parents.', 'Never have I ever eaten food off the floor.', 'Never have I ever sung in the shower.', 'Never have I ever pretended to be sick.', 'Never have I ever sent a text to the wrong person.', 'Never have I ever broken a bone.', 'Never have I ever been lost in a new city.', 'Never have I ever stayed up all night.', 'Never have I ever cried during a movie.'];
      ctx.reply('🤐 ' + utils.pickRandom(n));
    }
  },

  // ─── Emoji Games ────────────────────────────────────────────
  {
    name: 'emojiguess', alias: ['guessemoji'], category: 'fun', desc: 'Guess the movie from emoji',
    handler: async (ctx) => {
      const movies = [
        { e: '🦁👑', a: 'Lion King' },
        { e: '🕷️🕸️-hero', a: 'Spider-Man' },
        { e: '🤖🌳🌍', a: 'WALL-E' },
        { e: '🐠🐟🌊', a: 'Finding Nemo' },
        { e: '🧊🚢💔', a: 'Titanic' },
        { e: '👻🚫👻', a: 'Ghostbusters' },
        { e: '👑💍🌋', a: 'Lord of the Rings' },
        { e: '🌪️🌪️🌪️', a: 'Twister' }
      ];
      const m = utils.pickRandom(movies);
      ctx.reply(`🎬 Guess the movie: ${m.e}\n\nReply: .answer ${m.a}`);
    }
  },

  // ─── Random Word Games ──────────────────────────────────────
  {
    name: 'anagram', alias: ['scramble'], category: 'fun', desc: 'Word scramble game',
    handler: async (ctx) => {
      const words = ['javascript', 'whatsapp', 'computer', 'programming', 'developer', 'algorithm', 'database', 'network'];
      const w = utils.pickRandom(words);
      const shuffled = w.split('').sort(() => Math.random() - 0.5).join('');
      ctx.reply(`🔤 Unscramble: ${shuffled}\n\nReply: .answer ${w}`);
    }
  },

  // ─── Fun Stats ──────────────────────────────────────────────
  {
    name: 'messagesent', alias: ['msgcount'], category: 'fun', desc: 'Random message count',
    handler: async (ctx) => ctx.reply(`📊 You have sent approximately ${utils.randInt(1000, 50000)} messages this month!`)
  },

  // ─── Decision Maker ─────────────────────────────────────────
  {
    name: 'decide', alias: ['decideforme'], category: 'fun', desc: 'Bot decides for you',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}decide Should I order pizza?`);
      const decisions = ['YES! Do it now!', 'No, definitely not.', 'Wait a bit longer.', 'Ask a friend first.', 'Go for it!', 'Maybe later.', 'Trust your gut - YES.', 'Reconsider this.', 'The stars say YES.', 'Not today.'];
      ctx.reply(`🤖 Decision: ${utils.pickRandom(decisions)}`);
    }
  },

  // ─── Useless Talents ────────────────────────────────────────
  {
    name: 'talent', alias: ['uselesstalent'], category: 'fun', desc: 'Random useless talent',
    handler: async (ctx) => {
      const t = ['Wiggle your ears', 'Touch your nose with your tongue', 'Roll your tongue into a U', 'Raise one eyebrow', 'Solve a Rubik\'s cube in 30 seconds', 'Memorize pi to 100 digits', 'Whistle with your fingers', 'Snap with both hands', 'Juggle 3 objects', 'Speak backwards fluently'];
      ctx.reply('🎭 Random useless talent: ' + utils.pickRandom(t));
    }
  },

  // ─── ASCII Art ──────────────────────────────────────────────
  {
    name: 'ascii2', alias: ['asciitext'], category: 'fun', desc: 'ASCII art',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ascii2 Hello`);
      try {
        const r = await require('axios').default.get(`https://artii.herokuapp.com/make?text=${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        ctx.reply('```\n' + r.data + '\n```');
      } catch { ctx.reply('❌ Failed'); }
    }
  }
];
