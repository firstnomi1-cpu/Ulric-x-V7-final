/**
 * Ulric-X MD  -  Configuration (v3)
 * Owner   : ULRIC X SHAH
 * Owner # : 923189335011
 * Version : 3.0
 */

const path = require('path');

global.BOT_NAME      = 'Ulric-X MD';
global.BOT_SHORT     = 'ULRIC-X';
global.BOT_VERSION   = '3.0';
global.BOT_OWNER     = 'ULRIC X SHAH';
global.BOT_OWNER_NUM = '923189335011';
global.BOT_OWNER_JID = '923189335011@s.whatsapp.net';
global.BOT_PREFIX    = '.';
global.BOT_LOGO      = 'https://i.postimg.cc/yx314j9t/WA-1781354644910.jpg';
global.BOT_FOOTER    = 'ULRIC X MISTER SHAH';
global.BOT_PLATFORM  = 'WhatsApp Web';

global.PORT          = process.env.PORT || 3000;
global.ADMIN_PASS    = process.env.ADMIN_PASS || 'ulricx_admin_2024';
global.SESSION_SECRET= process.env.SESSION_SECRET || 'ulric-x-secret-key-change-me';

global.BASE_DIR      = __dirname;
global.SESSIONS_DIR  = path.join(__dirname, 'sessions');
global.DB_DIR        = path.join(__dirname, 'database');
global.LOGS_DIR      = path.join(__dirname, 'logs');

global.MAX_PAIR_USERS= parseInt(process.env.MAX_PAIR_USERS || '1000', 10);
global.PAIR_CODE_TTL = 2 * 60 * 1000; // 2 minutes

// Free public API endpoints (no key required)
global.API = {
  pollinations_img: 'https://image.pollinations.ai/prompt/',
  pollinations_txt: 'https://text.pollinations.ai/',
  quran            : 'https://api.alquran.cloud/v1',
  hadith           : 'https://api.hadith.gading.dev',
  jikan            : 'https://api.jikan.moe/v4',
  catbox           : 'https://catbox.moe/user/api.php',
  cobalt           : 'https://co.wuk.sh/api/json',
  jokeAPI          : 'https://v2.jokeapi.dev/joke',
  quotable         : 'https://api.quotable.io',
  advice           : 'https://api.adviceslip.com',
  bored            : 'https://www.boredapi.com/api',
  dogceo           : 'https://dog.ceo/api',
  catfact          : 'https://catfact.ninja',
  fox              : 'https://randomfox.ca/floof',
  duck             : 'https://random-d.uk/api/v2/random',
  bunny            : 'https://api.bunnies.io/v2/loop/random/?media=mp4',
  pokemon          : 'https://pokeapi.co/api/v2',
  weather          : 'https://api.open-meteo.com/v1',
  geocode          : 'https://geocoding-api.open-meteo.com/v1',
  github           : 'https://api.github.com',
  wikipedia        : 'https://en.wikipedia.org/api/rest_v1',
  urbandict        : 'https://api.urbandictionary.com/v0',
  numbersapi       : 'http://numbersapi.com',
  newsdata         : 'https://www.newsapi.ai',
  robohash         : 'https://robohash.org',
  dicebear         : 'https://api.dicebear.com/7.x',
  picsum           : 'https://picsum.photos',
  unsplash_src     : 'https://source.unsplash.com',
  jokepo           : 'https://api.jokes.one',
 OfficialJoke      : 'https://official-joke-api.appspot.com',
  fakeperson       : 'https://api.namefake.com',
  zippopotam       : 'http://api.zippopotam.us',
  countdownapi     : 'https://day.app',
  restcountries    : 'https://restcountries.com/v3.1',
  coingecko        : 'https://api.coingecko.com/api/v3',
  ollama           : 'https://ollama.ai'
};

// Broadcast defaults
global.BCAST_ON_PAIR     = true;
global.BCAST_TEXT_ON_PAIR = (jid) => `╭━━❖ 𝐔𝐋𝐑𝐈𝐂-𝐗 𝐍𝐄𝐖 𝐔𝐒𝐄𝐑 ❖━┈⊷
┃╭────────────────
┃│ 🤖  𝐁𝐎𝐓     : Ulric-X MD
┃│ 📞  𝐍𝐔𝐌𝐁𝐄𝐑 : ${jid.split('@')[0]}
┃│ 🌐  𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌 : WhatsApp
┃│ ⏱️  𝐓𝐈𝐌𝐄    : ${new Date().toLocaleString()}
┃╰────────────────
╰━━━━━━━━━━━━━━━┈⊷

> ${global.BOT_FOOTER}`;

console.log('[CONFIG] Loaded →', global.BOT_NAME, 'v' + global.BOT_VERSION);

module.exports = {
  BOT_NAME: global.BOT_NAME,
  BOT_SHORT: global.BOT_SHORT,
  BOT_VERSION: global.BOT_VERSION,
  BOT_OWNER: global.BOT_OWNER,
  BOT_OWNER_NUM: global.BOT_OWNER_NUM,
  BOT_OWNER_JID: global.BOT_OWNER_JID,
  BOT_PREFIX: global.BOT_PREFIX,
  BOT_LOGO: global.BOT_LOGO,
  BOT_FOOTER: global.BOT_FOOTER,
  BOT_PLATFORM: global.BOT_PLATFORM,
  PORT: global.PORT,
  ADMIN_PASS: global.ADMIN_PASS,
  SESSION_SECRET: global.SESSION_SECRET,
  BASE_DIR: global.BASE_DIR,
  SESSIONS_DIR: global.SESSIONS_DIR,
  DB_DIR: global.DB_DIR,
  LOGS_DIR: global.LOGS_DIR,
  MAX_PAIR_USERS: global.MAX_PAIR_USERS,
  PAIR_CODE_TTL: global.PAIR_CODE_TTL,
  API: global.API,
  BCAST_ON_PAIR: global.BCAST_ON_PAIR,
  BCAST_TEXT_ON_PAIR: global.BCAST_TEXT_ON_PAIR
};
