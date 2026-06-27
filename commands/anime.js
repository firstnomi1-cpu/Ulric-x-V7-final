/**
 * Ulric-X MD - Anime commands (Jikan API - free, no key)
 */
const axios = require('axios');
const utils = require('../lib/utils');
const config= require('../config');

async function jikanGet(path) {
  try {
    const r = await axios.get(`${config.API.jikan}${path}`, { timeout: 15000 });
    return r.data?.data || null;
  } catch (e) { return null; }
}

async function jikanSearch(path, q) {
  try {
    const r = await axios.get(`${config.API.jikan}${path}`, { params: { q, limit: 1, sfw: true }, timeout: 15000 });
    return r.data?.data?.[0] || null;
  } catch (e) { return null; }
}

module.exports = [
  {
    name: 'anime', alias: ['animesearch'], category: 'anime', desc: 'Search anime info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}anime Naruto`);
      await ctx.reply('🔍 Searching...');
      const a = await jikanSearch('/anime', ctx.q);
      if (!a) return ctx.reply('❌ Not found');
      const text = `╭━━❖ 𝐀𝐍𝐈𝐌𝐄 𝐈𝐍𝐅𝐎 ❖━┈⊷\n┃│ 📺 ${a.title}\n┃│ ⭐ Score: ${a.score || 'N/A'}\n┃│ 📊 Rank: #${a.rank || 'N/A'}\n┃│ 📅 ${a.aired?.string || 'N/A'}\n┃│ 🎬 ${a.type} | ${a.episodes || '?'} eps\n┃│ 🏷️ ${(a.genres||[]).map(g=>g.name).join(', ')}\n┃│ 📝 ${(a.synopsis||'').slice(0,200)}\n╰━━━━━━━━━━━━━━━┈⊷`;
      await ctx.replyImg(a.images?.jpg?.image_url, text);
    }
  },
  {
    name: 'manga', alias: ['mangasearch'], category: 'anime', desc: 'Search manga info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}manga One Piece`);
      const m = await jikanSearch('/manga', ctx.q);
      if (!m) return ctx.reply('❌ Not found');
      const text = `╭━━❖ 𝐌𝐀𝐍𝐆𝐀 𝐈𝐍𝐅𝐎 ❖━┈⊷\n┃│ 📚 ${m.title}\n┃│ ⭐ Score: ${m.score || 'N/A'}\n┃│ 📊 Rank: #${m.rank || 'N/A'}\n┃│ 📅 ${m.published?.string || 'N/A'}\n┃│ 📖 Chapters: ${m.chapters || '?'} | Volumes: ${m.volumes || '?'}\n┃│ 🏷️ ${(m.genres||[]).map(g=>g.name).join(', ')}\n┃│ 📝 ${(m.synopsis||'').slice(0,200)}\n╰━━━━━━━━━━━━━━━┈⊷`;
      await ctx.replyImg(m.images?.jpg?.image_url, text);
    }
  },
  {
    name: 'character', alias: ['char','animechar'], category: 'anime', desc: 'Search anime character',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}character Naruto Uzumaki`);
      const c = await jikanSearch('/characters', ctx.q);
      if (!c) return ctx.reply('❌ Not found');
      const text = `╭━━❖ 𝐂𝐇𝐀𝐑𝐀𝐂𝐓𝐄𝐑 ❖━┈⊷\n┃│ 👤 ${c.name}\n┃│ ❤️ Favorites: ${c.favorites || 0}\n┃│ 📝 ${(c.about||'').slice(0,300)}\n╰━━━━━━━━━━━━━━━┈⊷`;
      await ctx.replyImg(c.images?.jpg?.image_url, text);
    }
  },
  {
    name: 'topanime', alias: ['topa'], category: 'anime', desc: 'Top anime list',
    handler: async (ctx) => {
      const list = await jikanGet('/top/anime');
      if (!list?.length) return ctx.reply('❌ Failed');
      let t = '╭━━❖ 𝐓𝐎𝐏 𝐀𝐍𝐈𝐌𝐄 ❖━┈⊷\n';
      list.slice(0,10).forEach((a, i) => t += `┃│ ${i+1}. ${a.title} (${a.score||'N/A'})\n`);
      t += '╰━━━━━━━━━━━━━━━┈⊷';
      ctx.reply(t);
    }
  },
  {
    name: 'topmanga', alias: ['topm'], category: 'anime', desc: 'Top manga list',
    handler: async (ctx) => {
      const list = await jikanGet('/top/manga');
      if (!list?.length) return ctx.reply('❌ Failed');
      let t = '╭━━❖ 𝐓𝐎𝐏 𝐌𝐀𝐍𝐆𝐀 ❖━┈⊷\n';
      list.slice(0,10).forEach((a, i) => t += `┃│ ${i+1}. ${a.title} (${a.score||'N/A'})\n`);
      t += '╰━━━━━━━━━━━━━━━┈⊷';
      ctx.reply(t);
    }
  },
  {
    name: 'animenews', alias: ['aninews'], category: 'anime', desc: 'Latest anime news',
    handler: async (ctx) => {
      try {
        const r = await axios.get(`${config.API.jikan}/watch/episodes`, { timeout: 15000 });
        const eps = r.data?.data || [];
        if (!eps.length) return ctx.reply('❌ No data');
        let t = '╭━━❖ 𝐋𝐀𝐓𝐄𝐒𝐓 𝐄𝐏𝐈𝐒𝐎𝐃𝐄𝐒 ❖━┈⊷\n';
        eps.slice(0,10).forEach(e => t += `┃│ 📺 ${e.entry?.title} - ep ${e.episodes?.[0]?.mal_id || '?'}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'waifu', alias: ['randomwaifu'], category: 'anime', desc: 'Random waifu image',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://waifu.pics/api/sfw/waifu', { timeout: 10000 });
        await ctx.replyImg(r.data.url, '🎀 Random Waifu');
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'neko', alias: ['catgirl'], category: 'anime', desc: 'Random neko image',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://waifu.pics/api/sfw/neko', { timeout: 10000 });
        await ctx.replyImg(r.data.url, '🐱 Random Neko');
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'shinobu', alias: [], category: 'anime', desc: 'Random shinobu image',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://waifu.pics/api/sfw/shinobu', { timeout: 10000 });
        await ctx.replyImg(r.data.url, '🗡️ Shinobu');
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'megumin', alias: [], category: 'anime', desc: 'Random megumin image',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://waifu.pics/api/sfw/megumin', { timeout: 10000 });
        await ctx.replyImg(r.data.url, '💥 Megumin');
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'animewallpaper', alias: ['awall','animewall'], category: 'anime', desc: 'Anime wallpaper',
    handler: async (ctx) => {
      const tag = ctx.q || 'anime';
      const url = `${config.API.pollinations_img}${encodeURIComponent('anime wallpaper ' + tag + ', high quality, 4k')}`;
      await ctx.replyImg(url, `🎨 Anime wallpaper: ${tag}`);
    }
  },
  {
    name: 'animequote', alias: ['aquote'], category: 'anime', desc: 'Random anime quote',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://animechan.xyz/api/random', { timeout: 10000 });
        if (r.data) ctx.reply(`💬 "${r.data.quote}"\n— ${r.data.character} (${r.data.anime})`);
        else ctx.reply('❌ Failed');
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'weeb', alias: ['weebcheck'], category: 'anime', desc: 'Are you a weeb?',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      ctx.reply(`🇯🇵 ${target.split('@')[0]} is ${utils.randInt(0,100)}% weeb!`);
    }
  }
];
