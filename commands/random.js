/**
 * Ulric-X MD - Random commands (jokes, quotes, facts, animal pics, etc.)
 * All use free public APIs (no key).
 */
const axios = require('axios');
const utils = require('../lib/utils');
const config= require('../config');

async function apiGet(url, timeout = 10000) {
  try { return (await axios.get(url, { timeout })).data; } catch { return null; }
}

module.exports = [
  // ─── Jokes ──────────────────────────────────────────────────────
  {
    name: 'dadjoke', alias: ['djoke'], category: 'random', desc: 'Random dad joke',
    handler: async (ctx) => {
      const r = await apiGet('https://icanhazdadjoke.com/', 8000);
      if (typeof r === 'string') return ctx.reply('😂 ' + r.split('\n')[0]);
      if (r?.joke) return ctx.reply('😂 ' + r.joke);
      ctx.reply('❌ Failed');
    }
  },
  {
    name: 'joke2', alias: ['programmerjoke'], category: 'random', desc: 'Programming joke',
    handler: async (ctx) => {
      const r = await apiGet('https://v2.jokeapi.dev/joke/Programming?safe-mode&type=single');
      if (r?.joke) ctx.reply('💻 ' + r.joke);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'chucknorris', alias: ['chuck','cn'], category: 'random', desc: 'Chuck Norris joke',
    handler: async (ctx) => {
      const r = await apiGet('https://api.chucknorris.io/jokes/random');
      if (r?.value) ctx.reply('👊 ' + r.value);
      else ctx.reply('❌ Failed');
    }
  },
  // ─── Quotes ─────────────────────────────────────────────────────
  {
    name: 'quote', alias: ['q'], category: 'random', desc: 'Random quote',
    handler: async (ctx) => {
      const r = await apiGet('https://api.quotable.io/random');
      if (r) ctx.reply(`💬 "${r.content}"\n— ${r.author}`);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'todayquote', alias: ['qotd'], category: 'random', desc: 'Quote of the day',
    handler: async (ctx) => {
      const r = await apiGet('https://api.quotable.io/random');
      if (r) ctx.reply(`📜 "${r.content}"\n— ${r.author}`);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'advice', alias: ['tip'], category: 'random', desc: 'Random advice',
    handler: async (ctx) => {
      const r = await apiGet('https://api.adviceslip.com/advice');
      if (r?.slip?.advice) ctx.reply('💡 ' + r.slip.advice);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'bored', alias: ['activity'], category: 'random', desc: 'Random activity suggestion',
    handler: async (ctx) => {
      const r = await apiGet('https://www.boredapi.com/api/activity');
      if (r?.activity) ctx.reply('🎯 ' + r.activity);
      else ctx.reply('❌ Failed');
    }
  },
  // ─── Facts ──────────────────────────────────────────────────────
  {
    name: 'fact', alias: ['randomfact'], category: 'random', desc: 'Random fact',
    handler: async (ctx) => {
      const r = await apiGet('https://uselessfacts.jsph.pl/api/v2/today.json?language=en');
      if (r?.text) ctx.reply('🧠 ' + r.text);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'numberfact', alias: ['numfact'], category: 'random', desc: 'Fact about a number',
    handler: async (ctx) => {
      const n = ctx.args[0] || utils.randInt(1, 100);
      const r = await apiGet(`http://numbersapi.com/${n}`);
      if (r && typeof r === 'string') ctx.reply('🔢 ' + r);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'datefact', alias: ['dayfact'], category: 'random', desc: 'Fact about a date',
    handler: async (ctx) => {
      const d = new Date();
      const r = await apiGet(`http://numbersapi.com/${d.getMonth()+1}/${d.getDate()}/date`);
      if (r && typeof r === 'string') ctx.reply('📅 ' + r);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'yearfact', alias: [], category: 'random', desc: 'Fact about a year',
    handler: async (ctx) => {
      const y = ctx.args[0] || utils.randInt(1900, 2024);
      const r = await apiGet(`http://numbersapi.com/${y}/year`);
      if (r && typeof r === 'string') ctx.reply('📅 ' + r);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'mathfact', alias: [], category: 'random', desc: 'Math fact',
    handler: async (ctx) => {
      const n = ctx.args[0] || utils.randInt(1, 100);
      const r = await apiGet(`http://numbersapi.com/${n}/math`);
      if (r && typeof r === 'string') ctx.reply('🧮 ' + r);
      else ctx.reply('❌ Failed');
    }
  },
  // ─── Animal pictures ────────────────────────────────────────────
  {
    name: 'dog', alias: ['doggo','puppy'], category: 'random', desc: 'Random dog image',
    handler: async (ctx) => {
      const r = await apiGet('https://dog.ceo/api/breeds/image/random');
      if (r?.message) await ctx.replyImg(r.message, '🐶 Random dog');
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'cat', alias: ['kitty','meow'], category: 'random', desc: 'Random cat fact+image',
    handler: async (ctx) => {
      const [fact, img] = await Promise.all([
        apiGet('https://catfact.ninja/fact'),
        apiGet('https://api.thecatapi.com/v1/images/search')
      ]);
      if (img?.[0]?.url) await ctx.replyImg(img[0].url, `🐱 Cat fact: ${fact?.fact || 'N/A'}`);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'fox', alias: ['foxy'], category: 'random', desc: 'Random fox image',
    handler: async (ctx) => {
      const r = await apiGet('https://randomfox.ca/floof/');
      if (r?.image) await ctx.replyImg(r.image, '🦊 Random fox');
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'duck', alias: ['quack'], category: 'random', desc: 'Random duck image',
    handler: async (ctx) => {
      const r = await apiGet('https://random-d.uk/api/v2/random');
      if (r?.url) await ctx.replyImg(r.url, '🦆 Random duck');
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'bunny', alias: ['rabbit'], category: 'random', desc: 'Random bunny image',
    handler: async (ctx) => {
      const r = await apiGet('https://api.bunnies.io/v2/loop/random/?media=jpg');
      if (r?.media) await ctx.replyImg(r.media, '🐰 Random bunny');
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'bird', alias: ['birb'], category: 'random', desc: 'Random bird image',
    handler: async (ctx) => {
      const r = await apiGet('https://shibe.online/api/birds?count=1&urls=true');
      if (Array.isArray(r) && r[0]) await ctx.replyImg(r[0], '🐦 Random bird');
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'shiba', alias: ['shibainu'], category: 'random', desc: 'Random Shiba Inu',
    handler: async (ctx) => {
      const r = await apiGet('https://shibe.online/api/shibes?count=1&urls=true');
      if (Array.isArray(r) && r[0]) await ctx.replyImg(r[0], '🐕 Random Shiba');
      else ctx.reply('❌ Failed');
    }
  },
  // ─── Pokemon ────────────────────────────────────────────────────
  {
    name: 'pokemon', alias: ['pkmn'], category: 'random', desc: 'Pokemon info',
    handler: async (ctx) => {
      const name = (ctx.args[0] || '').toLowerCase() || 'pikachu';
      const r = await apiGet(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!r) return ctx.reply('❌ Not found');
      const text = `╭━━❖ 𝐏𝐎𝐊𝐄𝐌𝐎𝐍 ❖━┈⊷\n┃│ 🎮 ${r.name.toUpperCase()}\n┃│ 🆔 #${r.id}\n┃│ 📏 ${r.height/10}m | ${r.weight/10}kg\n┃│ 🎯 Type: ${r.types.map(t=>t.type.name).join(', ')}\n┃│ ⚡ Abilities: ${r.abilities.map(a=>a.ability.name).join(', ')}\n╰━━━━━━━━━━━━━━━┈⊷`;
      await ctx.replyImg(r.sprites?.front_default, text);
    }
  },
  // ─── Space & NASA ───────────────────────────────────────────────
  {
    name: 'apod', alias: ['nasapod','space'], category: 'random', desc: 'NASA astronomy picture',
    handler: async (ctx) => {
      const r = await apiGet('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      if (r?.url) {
        if (r.media_type === 'image') await ctx.replyImg(r.url, `🌌 ${r.title}\n\n${r.explanation?.slice(0,500)}`);
        else ctx.reply('🎬 ' + r.url);
      } else ctx.reply('❌ Failed');
    }
  },
  // ─── Wikipedia random ───────────────────────────────────────────
  {
    name: 'randomwiki', alias: ['rwiki'], category: 'random', desc: 'Random Wikipedia article',
    handler: async (ctx) => {
      const r = await apiGet('https://en.wikipedia.org/api/rest_v1/page/random/summary');
      if (r) {
        const text = `📚 ${r.title}\n\n${r.extract}`;
        if (r.thumbnail?.source) await ctx.replyImg(r.thumbnail.source, text);
        else ctx.reply(text);
      } else ctx.reply('❌ Failed');
    }
  },
  // ─── Urban Dictionary ───────────────────────────────────────────
  {
    name: 'urban', alias: ['ud','urbandict'], category: 'random', desc: 'Urban dictionary',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}urban rizz`);
      const r = await apiGet(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(ctx.q)}`);
      const d = r?.list?.[0];
      if (!d) return ctx.reply('❌ Not found');
      ctx.reply(`📖 ${d.word}\n\n${d.definition.slice(0,500)}\n\nExample: ${d.example?.slice(0,200) || 'N/A'}`);
    }
  },
  // ─── News ───────────────────────────────────────────────────────
  {
    name: 'news', alias: ['headlines'], category: 'random', desc: 'Latest BBC news headlines',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://feeds.bbci.co.uk/news/world/rss.xml', { timeout: 10000, responseType: 'text' });
        const cheerio = require('cheerio');
        const $ = cheerio.load(r.data, { xml: true });
        const items = $('item').slice(0, 8).map((i, el) => `${i+1}. ${$(el).find('title').text()}`).get();
        ctx.reply('📰 BBC News:\n\n' + items.join('\n'));
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  // ─── Coin flip / dice (also random but simpler) ─────────────────
  {
    name: 'heads', alias: [], category: 'random', desc: 'Random heads',
    handler: async (ctx) => ctx.reply('🪙 Heads!')
  },
  {
    name: 'tails', alias: [], category: 'random', desc: 'Random tails',
    handler: async (ctx) => ctx.reply('🪙 Tails!')
  },
  {
    name: 'yesno', alias: ['decide'], category: 'random', desc: 'Random yes/no',
    handler: async (ctx) => {
      const r = await apiGet('https://yesno.wtf/api');
      if (r?.answer) ctx.reply(`🤔 ${r.answer.toUpperCase()}`);
      else ctx.reply('❌ Failed');
    }
  },
  // ─── Color ──────────────────────────────────────────────────────
  {
    name: 'color', alias: ['randomcolor'], category: 'random', desc: 'Random color',
    handler: async (ctx) => {
      const hex = utils.randHex();
      await ctx.replyImg(`https://singlecolorimage.com/get/${hex.replace('#','')}/400x200.png`, `🎨 ${hex}`);
    }
  },
  // ─── Random user ────────────────────────────────────────────────
  {
    name: 'fakeperson', alias: ['randomuser'], category: 'random', desc: 'Random fake person',
    handler: async (ctx) => {
      const r = await apiGet('https://randomuser.me/api/');
      const u = r?.results?.[0];
      if (!u) return ctx.reply('❌ Failed');
      const text = `╭━━❖ 𝐅𝐀𝐊𝐄 𝐏𝐄𝐑𝐒𝐎𝐍 ❖━┈⊷\n┃│ 👤 ${u.name.first} ${u.name.last}\n┃│ 📧 ${u.email}\n┃│ 📞 ${u.phone}\n┃│ 📍 ${u.location.city}, ${u.location.country}\n┃│ 🎂 ${u.dob.age} years old\n╰━━━━━━━━━━━━━━━┈⊷`;
      await ctx.replyImg(u.picture?.large, text);
    }
  },
  // ─── Lorem Picsum (random images) ───────────────────────────────
  {
    name: 'randomimage', alias: ['randimg','lorem'], category: 'random', desc: 'Random image',
    handler: async (ctx) => {
      const seed = Math.floor(Math.random() * 1000);
      await ctx.replyImg(`https://picsum.photos/seed/${seed}/600/400.jpg`, '🖼️ Random image');
    }
  },
  // ─── Robohash (avatar) ──────────────────────────────────────────
  {
    name: 'avatar', alias: ['robohash','robotavatar'], category: 'random', desc: 'Random avatar',
    handler: async (ctx) => {
      const seed = ctx.q || Math.floor(Math.random() * 1000);
      await ctx.replyImg(`https://robohash.org/${encodeURIComponent(seed)}.png?size=400x400`, `🤖 Avatar: ${seed}`);
    }
  },
  // ─── DiceBear avatars (many styles) ─────────────────────────────
  ...['adventurer','avataaars','big-ears','big-smile','bottts','croodles','fun-emoji','icons','identicon','micah','miniavs','open-peeps','personas','pixel-art'].map(style => ({
    name: `avatar${style.replace(/[-]/g,'')}`, alias: [], category: 'random', desc: `Avatar style ${style}`,
    handler: async (ctx) => {
      const seed = ctx.q || Math.floor(Math.random() * 1000);
      await ctx.replyImg(`https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`, `🎭 ${style} avatar`);
    }
  })),
  // ─── Random quotes by topic ─────────────────────────────────────
  ...['love','success','life','motivation','happy','sad','friendship','family','work','dreams'].map(topic => ({
    name: `quote${topic}`, alias: [`q${topic}`], category: 'random', desc: `Quote about ${topic}`,
    handler: async (ctx) => {
      // Use quotable with tags
      try {
        const r = await axios.get(`https://api.quotable.io/random?tags=${topic}`, { timeout: 8000 });
        if (r.data?.content) return ctx.reply(`💬 "${r.data.content}"\n— ${r.data.author}`);
      } catch {}
      const fallback = {
        love: ['"Where there is love there is life." - Mahatma Gandhi','"Love is composed of a single soul inhabiting two bodies." - Aristotle'],
        success: ['"Success is not final, failure is not fatal." - Winston Churchill','"The only way to do great work is to love what you do." - Steve Jobs'],
        life: ['"Life is what happens when you are busy making other plans." - John Lennon','"The purpose of our lives is to be happy." - Dalai Lama'],
        motivation: ['"The harder you work for something, the greater you will feel when you achieve it."','"Push yourself, because no one else is going to do it for you."'],
        happy: ['"Happiness is not something ready made. It comes from your own actions." - Dalai Lama','"For every minute you are angry you lose sixty seconds of happiness." - Ralph Waldo Emerson'],
        sad: ['"Tears come from the heart and not from the brain." - Leonardo da Vinci','"The walls we build around us to keep sadness out also keeps out the joy." - Jim Rohn'],
        friendship: ['"A friend is one who knows you and loves you just the same." - Elbert Hubbard','"Friendship is the only cement that will ever hold the world together." - Woodrow Wilson'],
        family: ['"Family is not an important thing. It is everything." - Michael J. Fox','"The love of a family is life\'s greatest blessing." - Unknown'],
        work: ['"The only way to do great work is to love what you do." - Steve Jobs','"Choose a job you love, and you will never have to work a day in your life." - Confucius'],
        dreams: ['"All our dreams can come true, if we have the courage to pursue them." - Walt Disney','"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt']
      };
      ctx.reply('💬 ' + utils.pickRandom(fallback[topic]));
    }
  }))
];
