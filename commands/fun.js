/**
 * Ulric-X MD - Fun commands
 * Pure JS - no API needed, generates many text/joke/ships etc.
 */
const utils = require('../lib/utils');

const FUN_TEXTS = {
  truth: ['What is your biggest fear?', 'Who is your secret crush?', 'What is the most embarrassing thing you have done?', 'Have you ever lied to a friend?', 'What is your worst habit?', 'What is the silliest thing you are afraid of?', 'Have you ever cheated on a test?', 'What is the weirdest dream you have ever had?', 'What is your most useless talent?', 'Have you ever pretended to be sick to skip school/work?'],
  dare: ['Sing a song for 30 seconds', 'Do 10 pushups', 'Send a voice note saying I love you', 'Speak in a funny accent for the next 5 minutes', 'Tell a joke', 'Imitate a monkey', 'Do a dance move', 'Send your last photo', 'Call someone and sing happy birthday', 'Talk in rhymes for 2 minutes'],
  would: ['Would you rather fly or be invisible?', 'Would you rather be rich or famous?', 'Would you rather have pizza or burger for life?', 'Would you rather time travel to past or future?', 'Would you rather have 3 wishes or 1 million dollars?', 'Would you rather live without internet or without music?', 'Would you rather fight 100 duck-sized horses or 1 horse-sized duck?', 'Would you rather always be 10 minutes late or 20 minutes early?', 'Would you rather speak all languages or play all instruments?', 'Would you rather have unlimited sushi or unlimited tacos?']
};

const SHIP_QUOTES = ['A match made in heaven 💕', 'Soulmates for sure 💖', 'Cute couple! 😍', 'A perfect pair 💑', 'Made for each other 💞', 'Forever together 💗', 'True love 💝', 'Magic connection ✨', 'Destined to be 💗', 'Beautiful bond 💕'];

module.exports = [
  {
    name: 'ship', alias: ['love','couple'], category: 'fun', desc: 'Ship two users',
    handler: async (ctx) => {
      const mentions = ctx.mentionedJid || [];
      if (mentions.length < 2) return ctx.reply(`Mention 2 users: ${ctx.prefix}ship @user1 @user2`);
      const pct = utils.randInt(0, 100);
      const quote = utils.pickRandom(SHIP_QUOTES);
      ctx.reply(`╭━━❖ 💕 𝐒𝐇𝐈𝐏 ❖━┈⊷\n┃│ @${mentions[0].split('@')[0]} ❤️ @${mentions[1].split('@')[0]}\n┃│ Love: ${pct}%\n┃│ ${quote}\n╰━━━━━━━━━━━━━━━┈⊷`, { mentions });
    }
  },
  {
    name: 'truth', alias: ['truthordare'], category: 'fun', desc: 'Random truth question',
    handler: async (ctx) => ctx.reply(`🤔 Truth:\n${utils.pickRandom(FUN_TEXTS.truth)}`)
  },
  {
    name: 'dare', alias: [], category: 'fun', desc: 'Random dare',
    handler: async (ctx) => ctx.reply(`😈 Dare:\n${utils.pickRandom(FUN_TEXTS.dare)}`)
  },
  {
    name: 'wouldyourather', alias: ['wyr','would'], category: 'fun', desc: 'Would you rather',
    handler: async (ctx) => ctx.reply(`🤷 ${utils.pickRandom(FUN_TEXTS.would)}`)
  },
  {
    name: '8ball', alias: ['eightball','magicball'], category: 'fun', desc: 'Magic 8 ball',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}8ball Will I be rich?`);
      const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Not in a million years', 'Ask again later', 'Without a doubt', 'Very doubtful', 'Yes definitely', 'My reply is no', 'Outlook good', 'Outlook not so good', 'Signs point to yes', 'Cannot predict now', 'Better not tell you now'];
      ctx.reply(`🎱 ${utils.pickRandom(answers)}`);
    }
  },
  {
    name: 'rate', alias: ['rating'], category: 'fun', desc: 'Rate something',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}rate my profile`);
      ctx.reply(`⭐ ${ctx.q}: ${utils.randInt(0,10)}/10`);
    }
  },
  {
    name: 'flip', alias: ['coinflip','coin'], category: 'fun', desc: 'Flip a coin',
    handler: async (ctx) => ctx.reply(`🪙 ${utils.pickRandom(['Heads','Tails'])}`)
  },
  {
    name: 'dice', alias: ['roll','rolldice'], category: 'fun', desc: 'Roll a dice',
    handler: async (ctx) => ctx.reply(`🎲 You rolled: ${utils.randInt(1,6)}`)
  },
  {
    name: 'pick', alias: ['choose'], category: 'fun', desc: 'Pick from options',
    handler: async (ctx) => {
      if (!ctx.q?.includes('|')) return ctx.reply(`Example: ${ctx.prefix}pick pizza|burger|pizza`);
      const opts = ctx.q.split('|').map(s => s.trim()).filter(Boolean);
      ctx.reply(`🤔 I pick: ${utils.pickRandom(opts)}`);
    }
  },
  {
    name: 'rizz', alias: ['pickup'], category: 'fun', desc: 'Random pickup line',
    handler: async (ctx) => {
      const lines = ['Are you a magician? Because whenever I look at you, everyone else disappears.', 'Do you have a map? I got lost in your eyes.', 'Are you WiFi? Because I am feeling a connection.', 'Is your name Google? Because you have everything I have been searching for.', 'Are you a parking ticket? Because you have got fine written all over you.', 'Do you believe in love at first sight or should I walk by again?', 'Is your dad a baker? Because you are a cutie pie.', 'Are you a camera? Because every time I look at you, I smile.', 'Can I borrow a kiss? I promise I will give it back.', 'Are you a banana? Because I find you a-peeling.'];
      ctx.reply(`💬 ${utils.pickRandom(lines)}`);
    }
  },
  {
    name: 'gaytest', alias: ['gay'], category: 'fun', desc: 'Fun gay test',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`🌈 ${target.split('@')[0]} is ${utils.randInt(0,100)}% gay`);
    }
  },
  {
    name: 'smarttest', alias: ['smart'], category: 'fun', desc: 'Smart test',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`🧠 ${target.split('@')[0]} is ${utils.randInt(0,100)}% smart`);
    }
  },
  {
    name: 'uglytest', alias: ['ugly'], category: 'fun', desc: 'Ugly test',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`😬 ${target.split('@')[0]} is ${utils.randInt(0,100)}% ugly`);
    }
  },
  {
    name: 'beautiful', alias: ['pretty'], category: 'fun', desc: 'Beautiful test',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`😍 ${target.split('@')[0]} is ${utils.randInt(0,100)}% beautiful`);
    }
  },
  {
    name: 'character', alias: ['charactertest'], category: 'fun', desc: 'Character test',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      const chars = ['Kind','Loyal','Honest','Brave','Smart','Funny','Caring','Mysterious','Confident','Creative'];
      ctx.reply(`🎭 ${target.split('@')[0]} is ${utils.pickRandom(chars)}`);
    }
  },
  {
    name: 'hack', alias: ['fakehack'], category: 'fun', desc: 'Fake hack animation',
    handler: async (ctx) => {
      const target = ctx.args[0] || 'target';
      const steps = [`[🔧] Injecting trojan into ${target}...`, '[📦] Stealing cookies...', '[📸] Accessing camera...', '[📂] Downloading messages...', '[🔐] Cracking passwords...', '[✅] Hack complete! Just kidding 😄'];
      for (const s of steps) { await ctx.reply(s); await utils.sleep(800); }
    }
  },
  {
    name: 'joke', alias: ['telljoke'], category: 'fun', desc: 'Random joke',
    handler: async (ctx) => {
      const j = ['Why did the scarecrow win an award? Because he was outstanding in his field!', 'I told my wife she was drawing her eyebrows too high. She looked surprised.', 'Why do not scientists trust atoms? Because they make up everything!', 'I am reading a book about anti-gravity. It is impossible to put down!', 'Why did the bicycle fall over? It was two-tired!', 'What do you call fake spaghetti? An impasta!', 'I used to hate facial hair, but then it grew on me.', 'Why did the coffee file a police report? It got mugged!', 'I would tell you a construction joke, but I am still working on it.', 'What is orange and sounds like a parrot? A carrot!'];
      ctx.reply(`😂 ${utils.pickRandom(j)}`);
    }
  },
  {
    name: 'compliment', alias: ['complimentme'], category: 'fun', desc: 'Random compliment',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      const comps = ['You are amazing! 🌟', 'You light up every room! ✨', 'You are incredibly kind! 💖', 'You have a great sense of humor! 😄', 'You are stronger than you think! 💪', 'You inspire others! 🌈', 'You are one of a kind! 💎', 'You make the world better! 🌍'];
      ctx.reply(`💝 ${target.split('@')[0]}: ${utils.pickRandom(comps)}`);
    }
  },
  {
    name: 'insult', alias: ['roast'], category: 'fun', desc: 'Mild roast',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      const roasts = ['You are as bright as a black hole, and twice as dense.', 'You are not stupid, you just have bad luck thinking.', 'I would agree with you but then we would both be wrong.', 'You bring everyone so much joy when you leave the room.', 'You are like a cloud. When you disappear, it is a beautiful day.', 'I envy people who have not met you.', 'You are the reason the gene pool needs a lifeguard.', 'I am jealous of people who do not know you.'];
      ctx.reply(`🔥 ${target.split('@')[0]}: ${utils.pickRandom(roasts)}`);
    }
  },
  {
    name: 'slots', alias: ['slot'], category: 'fun', desc: 'Slot machine',
    handler: async (ctx) => {
      const e = ['🍎','🍊','🍋','🍇','🍒','🍉','7️⃣'];
      const a = utils.pickRandom(e), b = utils.pickRandom(e), c = utils.pickRandom(e);
      const win = a === b && b === c;
      ctx.reply(`🎰 [ ${a} ${b} ${c} ]\n${win ? '🎉 JACKPOT! You won!' : '😢 Try again'}`);
    }
  },
  {
    name: 'slap', alias: ['punch'], category: 'fun', desc: 'Slap someone',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0] : 'themselves');
      const verbs = ['slapped','punched','kicked','smacked','bonked'];
      ctx.reply(`👋 ${ctx.pushname} ${utils.pickRandom(verbs)} ${target}!`);
    }
  },
  {
    name: 'hug', alias: ['embrace'], category: 'fun', desc: 'Hug someone',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] ? `@${ctx.mentionedJid[0].split('@')[0]}` : 'everyone';
      ctx.reply(`🤗 ${ctx.pushname} hugs ${target}!`);
    }
  },
  {
    name: 'pat', alias: ['pet'], category: 'fun', desc: 'Pat someone',
    handler: async (ctx) => ctx.reply(`🫳 ${ctx.pushname} pats ${ctx.mentionedJid?.[0] ? '@'+ctx.mentionedJid[0].split('@')[0] : 'someone'}`)
  },
  {
    name: 'kill', alias: ['murder'], category: 'fun', desc: 'Kill someone (in game)',
    handler: async (ctx) => ctx.reply(`💀 ${ctx.pushname} killed ${ctx.mentionedJid?.[0] ? '@'+ctx.mentionedJid[0].split('@')[0] : 'themself'}`)
  },
  {
    name: 'kiss', alias: ['smooch'], category: 'fun', desc: 'Kiss someone',
    handler: async (ctx) => ctx.reply(`💋 ${ctx.pushname} kissed ${ctx.mentionedJid?.[0] ? '@'+ctx.mentionedJid[0].split('@')[0] : 'thin air'}`)
  },
  {
    name: 'highfive', alias: ['hi5'], category: 'fun', desc: 'High five',
    handler: async (ctx) => ctx.reply(`🖐️ ${ctx.pushname} high-fived ${ctx.mentionedJid?.[0] ? '@'+ctx.mentionedJid[0].split('@')[0] : 'the air'}`)
  },
  {
    name: 'fart', alias: ['toot'], category: 'fun', desc: 'Fart joke',
    handler: async (ctx) => ctx.reply(`💨 ${ctx.pushname} farted! The room is now toxic 💀`)
  },
  {
    name: 'dance', alias: ['boogie'], category: 'fun', desc: 'Dance',
    handler: async (ctx) => ctx.reply(`🕺 ${ctx.pushname} is dancing! 💃`)
  },
  {
    name: 'cry', alias: ['sob'], category: 'fun', desc: 'Cry',
    handler: async (ctx) => ctx.reply(`😭 ${ctx.pushname} is crying...`)
  },
  {
    name: 'laugh', alias: ['lol'], category: 'fun', desc: 'Laugh',
    handler: async (ctx) => ctx.reply(`😂 ${ctx.pushname} is laughing hard!`)
  },
  {
    name: 'sleep', alias: ['nap'], category: 'fun', desc: 'Sleep',
    handler: async (ctx) => ctx.reply(`😴 ${ctx.pushname} is sleeping. Shhh...`)
  },
  {
    name: 'clap', alias: ['applaud'], category: 'fun', desc: 'Clap',
    handler: async (ctx) => ctx.reply(`👏 ${ctx.pushname} is clapping for ${ctx.mentionedJid?.[0] ? '@'+ctx.mentionedJid[0].split('@')[0] : 'you'}`)
  },
  {
    name: 'vomit', alias: ['puke'], category: 'fun', desc: 'Vomit',
    handler: async (ctx) => ctx.reply(`🤮 ${ctx.pushname} vomited on ${ctx.mentionedJid?.[0] ? '@'+ctx.mentionedJid[0].split('@')[0] : 'the floor'}!`)
  },
  {
    name: 'wink', alias: ['winker'], category: 'fun', desc: 'Wink',
    handler: async (ctx) => ctx.reply(`😉 ${ctx.pushname} winked at ${ctx.mentionedJid?.[0] ? '@'+ctx.mentionedJid[0].split('@')[0] : 'you'}`)
  },
  {
    name: 'shrug', alias: [], category: 'fun', desc: 'Shrug',
    handler: async (ctx) => ctx.reply(`🤷 ${ctx.pushname} shrugs.`)
  },
  {
    name: 'facepalm', alias: ['fp'], category: 'fun', desc: 'Facepalm',
    handler: async (ctx) => ctx.reply(`🤦 ${ctx.pushname} facepalmed.`)
  },
  {
    name: 'calculate', alias: ['calc','math'], category: 'fun', desc: 'Quick calculator',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}calc 2+2*5`);
      try {
        const r = Function(`"use strict"; return (${ctx.q.replace(/[^0-9+\-*/().% ]/g,'')})`)();
        ctx.reply(`🧮 ${ctx.q} = ${r}`);
      } catch (e) { ctx.reply('❌ Invalid expression'); }
    }
  },
  // Add many text-art commands
  ...['ascii','asciicat','asciidog','asciiheart','asciiflower','asciiwelcome','asciibye','asciiwave','asciibday','asciixmas'].map((n,i) => ({
    name: n, alias: [], category: 'fun', desc: `ASCII art ${n}`,
    handler: async (ctx) => {
      const arts = [`  /\_/\  \n ( o.o ) \n  > ^ <`, `   __\n  / \\\n /   \\\n/_____\\\n|     |\n|     |\n|_____|`, `  ____\n /    \\\n|      |\n \\____/`, `   ^\n  / \\\n /   \\\n/_____\\"`, `  (((\n  (((\n  (((`, `  ♥\n ♥ ♥\n♥ ♥ ♥`];
      ctx.reply(`\`\`\`${utils.pickRandom(arts)}\`\`\``);
    }
  }))
];
