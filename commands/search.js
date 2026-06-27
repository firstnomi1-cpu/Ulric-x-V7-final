/**
 * Ulric-X MD - Search Commands (50+)
 * Uses free search APIs: DuckDuckGo, Wikipedia, Jikan, Open Library, etc.
 */
const axios = require('axios');
const utils = require('../lib/utils');
const config= require('../config');

async function apiGet(url, timeout = 12000) {
  try { return (await axios.get(url, { timeout })).data; } catch { return null; }
}

module.exports = [
  // ─── Web Search Engines ─────────────────────────────────────
  {
    name: 'google2', alias: ['g2','googlesearch'], category: 'search', desc: 'Google search link',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}google2 WhatsApp bot`);
      ctx.reply(`🔍 Google results:\nhttps://www.google.com/search?q=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'bing', alias: ['bingsearch'], category: 'search', desc: 'Bing search link',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}bing WhatsApp bot`);
      ctx.reply(`🔍 Bing results:\nhttps://www.bing.com/search?q=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'duckduckgo', alias: ['ddg','duckduck'], category: 'search', desc: 'DuckDuckGo search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}duckduckgo WhatsApp bot`);
      ctx.reply(`🔍 DuckDuckGo results:\nhttps://duckduckgo.com/?q=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'yandex', alias: ['ydex'], category: 'search', desc: 'Yandex search link',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}yandex WhatsApp bot`);
      ctx.reply(`🔍 Yandex results:\nhttps://yandex.com/search/?text=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'baidu', alias: ['baidusearch'], category: 'search', desc: 'Baidu search link',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}baidu WhatsApp bot`);
      ctx.reply(`🔍 Baidu results:\nhttps://www.baidu.com/s?wd=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'yahoo', alias: ['yh'], category: 'search', desc: 'Yahoo search link',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}yahoo WhatsApp bot`);
      ctx.reply(`🔍 Yahoo results:\nhttps://search.yahoo.com/search?p=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'ask', alias: ['askjeeves'], category: 'search', desc: 'Ask.com search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ask WhatsApp bot`);
      ctx.reply(`🔍 Ask.com results:\nhttps://www.ask.com/web?q=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'ecosia', alias: ['eco'], category: 'search', desc: 'Ecosia (plants trees!)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ecosia trees`);
      ctx.reply(`🌱 Ecosia results:\nhttps://www.ecosia.org/search?q=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'startpage', alias: ['sp'], category: 'search', desc: 'Startpage private search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}startpage WhatsApp bot`);
      ctx.reply(`🔒 Startpage results:\nhttps://www.startpage.com/sp/search?query=${encodeURIComponent(ctx.q)}`);
    }
  },
  {
    name: 'brave', alias: ['bravesearch'], category: 'search', desc: 'Brave search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}brave WhatsApp bot`);
      ctx.reply(`🦁 Brave results:\nhttps://search.brave.com/search?q=${encodeURIComponent(ctx.q)}`);
    }
  },

  // ─── Image Search ───────────────────────────────────────────
  {
    name: 'googleimage', alias: ['gimage','gimg'], category: 'search', desc: 'Google image search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}googleimage cats`);
      // Use Pollinations AI to generate a similar image
      const url = `${config.API.pollinations_img}${encodeURIComponent(ctx.q)}`;
      await ctx.replyImg(url, `🖼️ Image for: ${ctx.q}`);
    }
  },
  {
    name: 'image2', alias: ['img2'], category: 'search', desc: 'Search images (AI)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}image2 sunset`);
      const url = `${config.API.pollinations_img}${encodeURIComponent(ctx.q + ' high quality photo')}`;
      await ctx.replyImg(url, `🖼️ ${ctx.q}`);
    }
  },
  {
    name: 'pinterest2', alias: ['pin2'], category: 'search', desc: 'Pinterest image search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}pinterest2 aesthetic`);
      const url = `${config.API.pollinations_img}${encodeURIComponent(ctx.q + ' pinterest aesthetic photo')}`;
      await ctx.replyImg(url, `📌 Pinterest: ${ctx.q}`);
    }
  },
  {
    name: 'wallpaper', alias: ['wall','wp'], category: 'search', desc: 'Wallpaper search',
    handler: async (ctx) => {
      const q = ctx.q || 'nature';
      const url = `${config.API.pollinations_img}${encodeURIComponent(q + ' wallpaper 4k high resolution')}`;
      await ctx.replyImg(url, `🖼️ Wallpaper: ${q}`);
    }
  },

  // ─── Knowledge Bases ────────────────────────────────────────
  {
    name: 'wiki2', alias: ['wikipedia2','wkp'], category: 'search', desc: 'Wikipedia summary',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wiki2 Albert Einstein`);
      const r = await apiGet(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`);
      if (!r) return ctx.reply('❌ Not found');
      const text = `📚 ${r.title}\n\n${r.extract}\n\n🔗 ${r.content_urls?.desktop?.page}`;
      if (r.thumbnail?.source) await ctx.replyImg(r.thumbnail.source, text);
      else ctx.reply(text);
    }
  },
  {
    name: 'wikies', alias: ['wikispanish'], category: 'search', desc: 'Wikipedia (Spanish)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wikies Argentina`);
      const r = await apiGet(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`);
      if (r) ctx.reply(`📚 ${r.title}\n\n${r.extract}`);
      else ctx.reply('❌ Not found');
    }
  },
  {
    name: 'wikifrance', alias: ['wikifr'], category: 'search', desc: 'Wikipedia (French)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wikifrance Paris`);
      const r = await apiGet(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`);
      if (r) ctx.reply(`📚 ${r.title}\n\n${r.extract}`);
      else ctx.reply('❌ Not found');
    }
  },
  {
    name: 'wikigerman', alias: ['wikide'], category: 'search', desc: 'Wikipedia (German)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wikigerman Berlin`);
      const r = await apiGet(`https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`);
      if (r) ctx.reply(`📚 ${r.title}\n\n${r.extract}`);
      else ctx.reply('❌ Not found');
    }
  },
  {
    name: 'wikiurdu', alias: ['wikiur'], category: 'search', desc: 'Wikipedia (Urdu)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wikiurdu پاکستان`);
      const r = await apiGet(`https://ur.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`);
      if (r) ctx.reply(`📚 ${r.title}\n\n${r.extract}`);
      else ctx.reply('❌ Not found');
    }
  },
  {
    name: 'wikihindi', alias: ['wikihi'], category: 'search', desc: 'Wikipedia (Hindi)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wikihindi भारत`);
      const r = await apiGet(`https://hi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`);
      if (r) ctx.reply(`📚 ${r.title}\n\n${r.extract}`);
      else ctx.reply('❌ Not found');
    }
  },
  {
    name: 'wikiarabic', alias: ['wikiar'], category: 'search', desc: 'Wikipedia (Arabic)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wikiarabic مصر`);
      const r = await apiGet(`https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`);
      if (r) ctx.reply(`📚 ${r.title}\n\n${r.extract}`);
      else ctx.reply('❌ Not found');
    }
  },

  // ─── Programming ────────────────────────────────────────────
  {
    name: 'stackoverflow', alias: ['so','stack'], category: 'search', desc: 'Stack Overflow search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}stackoverflow how to read file python`);
      try {
        const r = await axios.get(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(ctx.q)}&site=stackoverflow`, { timeout: 10000 });
        const items = r.data?.items?.slice(0, 5) || [];
        if (!items.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐒𝐓𝐀𝐂𝐊 𝐎𝐕𝐄𝐑𝐅𝐋𝐎𝐖 ❖━┈⊷\n';
        items.forEach((i, idx) => t += `┃│ ${idx+1}. ${i.title.slice(0,60)}\n┃│    ⬆️ ${i.score} | 💬 ${i.answer_count}\n┃│    ${i.link}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'github2', alias: ['gh2','ghsearch'], category: 'search', desc: 'GitHub repo search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}github2 whatsapp bot`);
      try {
        const r = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(ctx.q)}&sort=stars&per_page=5`, { timeout: 10000 });
        const items = r.data?.items || [];
        if (!items.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄𝐀𝐑𝐂𝐇 ❖━┈⊷\n';
        items.forEach((i, idx) => t += `┃│ ${idx+1}. ${i.full_name}\n┃│    ⭐ ${i.stargazers_count} | 📝 ${(i.description||'').slice(0,60)}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'npm', alias: ['npmpackage'], category: 'search', desc: 'Search npm packages',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}npm express`);
      try {
        const r = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(ctx.q)}&size=5`, { timeout: 10000 });
        const items = r.data?.objects || [];
        if (!items.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐍𝐏𝐌 ❖━┈⊷\n';
        items.forEach((o, idx) => t += `┃│ ${idx+1}. ${o.package.name}\n┃│    📦 v${o.package.version}\n┃│    ${o.package.links.npm}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'pypi', alias: ['pypisearch'], category: 'search', desc: 'Search PyPI packages',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}pypi flask`);
      try {
        const r = await axios.get(`https://pypi.org/simple/${encodeURIComponent(ctx.q.toLowerCase())}/`, { timeout: 10000, headers: { 'Accept': 'application/vnd.pypi.simple.v1+json' } });
        ctx.reply(`📦 PyPI: ${ctx.q}\n🔗 https://pypi.org/project/${ctx.q.toLowerCase()}/`);
      } catch { ctx.reply('❌ Not found'); }
    }
  },

  // ─── Books ──────────────────────────────────────────────────
  {
    name: 'book', alias: ['booksearch','openlibrary'], category: 'search', desc: 'Search books',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}book Harry Potter`);
      try {
        const r = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(ctx.q)}&limit=5`, { timeout: 10000 });
        const docs = r.data?.docs || [];
        if (!docs.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐁𝐎𝐎𝐊𝐒 ❖━┈⊷\n';
        docs.forEach((d, i) => t += `┃│ ${i+1}. ${d.title}\n┃│    ✍️ ${d.author_name?.[0] || 'Unknown'} (${d.first_publish_year || '?'})\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'bookinfo', alias: ['bookdetails'], category: 'search', desc: 'Book details by ISBN',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}bookinfo 9780747532699`);
      const r = await apiGet(`https://openlibrary.org/api/books?bibkeys=ISBN:${ctx.q}&format=json&jscmd=data`);
      if (r?.[`ISBN:${ctx.q}`]) {
        const b = r[`ISBN:${ctx.q}`];
        ctx.reply(`📚 ${b.title}\n✍️ ${b.authors?.[0]?.name}\n📅 ${b.publish_date}\n📄 ${b.number_of_pages} pages`);
      } else ctx.reply('❌ Not found');
    }
  },

  // ─── Movies / TV ────────────────────────────────────────────
  {
    name: 'movie', alias: ['moviesearch','tmdb'], category: 'search', desc: 'Search movies',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}movie Inception`);
      try {
        const r = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=8265bd1679663a7ea12ac168da84d2e8&query=${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        const m = r.data?.results?.[0];
        if (!m) return ctx.reply('❌ Not found');
        const text = `╭━━❖ 𝐌𝐎𝐕𝐈𝐄 ❖━┈⊷\n┃│ 🎬 ${m.title}\n┃│ 📅 ${m.release_date}\n┃│ ⭐ ${m.vote_average}/10\n┃│ 📝 ${m.overview?.slice(0, 300)}\n╰━━━━━━━━━━━━━━━┈⊷`;
        if (m.poster_path) await ctx.replyImg(`https://image.tmdb.org/t/p/w500${m.poster_path}`, text);
        else ctx.reply(text);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'tvshow', alias: ['tv','tvsearch'], category: 'search', desc: 'Search TV shows',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}tvshow Breaking Bad`);
      try {
        const r = await axios.get(`https://api.themoviedb.org/3/search/tv?api_key=8265bd1679663a7ea12ac168da84d2e8&query=${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        const m = r.data?.results?.[0];
        if (!m) return ctx.reply('❌ Not found');
        const text = `╭━━❖ 𝐓𝐕 𝐒𝐇𝐎𝐖 ❖━┈⊷\n┃│ 📺 ${m.name}\n┃│ 📅 ${m.first_air_date}\n┃│ ⭐ ${m.vote_average}/10\n┃│ 📝 ${m.overview?.slice(0, 300)}\n╰━━━━━━━━━━━━━━━┈⊷`;
        if (m.poster_path) await ctx.replyImg(`https://image.tmdb.org/t/p/w500${m.poster_path}`, text);
        else ctx.reply(text);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'topmovies', alias: ['topmovie'], category: 'search', desc: 'Top rated movies',
    handler: async (ctx) => {
      try {
        const r = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=8265bd1679663a7ea12ac168da84d2e8`, { timeout: 10000 });
        const list = r.data?.results?.slice(0, 10) || [];
        let t = '╭━━❖ 𝐓𝐎𝐏 𝐌𝐎𝐕𝐈𝐄𝐒 ❖━┈⊷\n';
        list.forEach((m, i) => t += `┃│ ${i+1}. ${m.title} (${m.vote_average}/10)\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'nowplaying', alias: ['intheaters'], category: 'search', desc: 'Movies in theaters now',
    handler: async (ctx) => {
      try {
        const r = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=8265bd1679663a7ea12ac168da84d2e8`, { timeout: 10000 });
        const list = r.data?.results?.slice(0, 10) || [];
        let t = '╭━━❖ 𝐍𝐎𝐖 𝐏𝐋𝐀𝐘𝐈𝐍𝐆 ❖━┈⊷\n';
        list.forEach((m, i) => t += `┃│ ${i+1}. ${m.title} (${m.vote_average}/10)\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Music ──────────────────────────────────────────────────
  {
    name: 'musicsearch', alias: ['musics'], category: 'search', desc: 'Search music (YouTube)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}musicsearch Imagine Dragons`);
      const yts = require('yt-search');
      const r = await yts(ctx.q + ' official audio');
      if (!r.videos.length) return ctx.reply('❌ No results');
      let t = '╭━━❖ 𝐌𝐔𝐒𝐈𝐂 ❖━┈⊷\n';
      r.videos.slice(0, 8).forEach((v, i) => t += `┃│ ${i+1}. ${v.title.slice(0,40)}\n┃│    ⏱️ ${v.timestamp} | 👁️ ${v.views}\n┃│    ${v.url}\n`);
      t += '╰━━━━━━━━━━━━━━━┈⊷';
      ctx.reply(t);
    }
  },
  {
    name: 'artistinfo', alias: ['artist'], category: 'search', desc: 'Artist info (MusicBrainz)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}artistinfo Coldplay`);
      try {
        const r = await axios.get(`https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(ctx.q)}&fmt=json&limit=1`, { timeout: 10000, headers: { 'User-Agent': 'Ulric-X-MD/2.0' } });
        const a = r.data?.artists?.[0];
        if (!a) return ctx.reply('❌ Not found');
        ctx.reply(`╭━━❖ 𝐀𝐑𝐓𝐈𝐒𝐓 ❖━┈⊷\n┃│ 🎤 ${a.name}\n┃│ 🌍 ${a.area?.name || 'Unknown'}\n┃│ 🎵 Type: ${a.type || 'Unknown'}\n┃│ 📅 ${a['life-span']?.begin || '?'} - ${a['life-span']?.end || 'present'}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── News ───────────────────────────────────────────────────
  {
    name: 'news2', alias: ['headlines2'], category: 'search', desc: 'Latest tech news',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json', { timeout: 10000 });
        const ids = r.data.slice(0, 8);
        const items = [];
        for (const id of ids) {
          const item = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 });
          items.push(item.data);
        }
        let t = '╭━━❖ 𝐇𝐀𝐂𝐊𝐄𝐑 𝐍𝐄𝐖𝐒 ❖━┈⊷\n';
        items.forEach((it, i) => t += `┃│ ${i+1}. ${it.title?.slice(0,60)}\n┃│    ⬆️ ${it.score} | ${it.url?.slice(0,50) || '(HN internal)'}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Sports ─────────────────────────────────────────────────
  {
    name: 'football', alias: ['soccer'], category: 'search', desc: 'Football matches (free API)',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://www.scorebat.com/video-api/v1/', { timeout: 10000 });
        const items = r.data?.slice(0, 5) || [];
        if (!items.length) return ctx.reply('❌ No matches');
        let t = '╭━━❖ 𝐅𝐎𝐎𝐓𝐁𝐀𝐋𝐋 ❖━┈⊷\n';
        items.forEach((m, i) => t += `┃│ ${i+1}. ${m.title?.slice(0,60)}\n┃│    📅 ${m.date}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Definitions ────────────────────────────────────────────
  {
    name: 'define', alias: ['definition','dict'], category: 'search', desc: 'Dictionary definition',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}define ephemeral`);
      try {
        const r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        const d = r.data?.[0];
        if (!d) return ctx.reply('❌ Not found');
        const meaning = d.meanings?.[0];
        const def = meaning?.definitions?.[0];
        ctx.reply(`╭━━❖ 𝐃𝐄𝐅𝐈𝐍𝐈𝐓𝐈𝐎𝐍 ❖━┈⊷\n┃│ 📖 ${d.word} (${meaning?.partOfSpeech})\n┃│ 🔊 ${d.phonetic || ''}\n┃│ 📝 ${def?.definition}\n┃│ 💡 ${def?.example || 'No example'}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'synonym', alias: ['syn'], category: 'search', desc: 'Word synonyms',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}synonym happy`);
      try {
        const r = await axios.get(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(ctx.q)}&max=10`, { timeout: 10000 });
        const list = r.data || [];
        if (!list.length) return ctx.reply('❌ None');
        ctx.reply(`📝 Synonyms of ${ctx.q}:\n${list.map(x => x.word).join(', ')}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'antonym', alias: ['ant'], category: 'search', desc: 'Word antonyms',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}antonym happy`);
      try {
        const r = await axios.get(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(ctx.q)}&max=10`, { timeout: 10000 });
        const list = r.data || [];
        if (!list.length) return ctx.reply('❌ None');
        ctx.reply(`📝 Antonyms of ${ctx.q}:\n${list.map(x => x.word).join(', ')}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'rhyme', alias: ['rhymes'], category: 'search', desc: 'Find rhyming words',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}rhyme cat`);
      try {
        const r = await axios.get(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(ctx.q)}&max=10`, { timeout: 10000 });
        const list = r.data || [];
        if (!list.length) return ctx.reply('❌ None');
        ctx.reply(`🎵 Rhymes with ${ctx.q}:\n${list.map(x => x.word).join(', ')}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Religion (additional) ──────────────────────────────────
  {
    name: 'bible', alias: ['bibleverse'], category: 'search', desc: 'Bible verse',
    handler: async (ctx) => {
      const ref = ctx.q || 'John 3:16';
      try {
        const r = await axios.get(`https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`, { timeout: 10000 });
        if (r.data) ctx.reply(`╭━━❖ 𝐁𝐈𝐁𝐋𝐄 ❖━┈⊷\n┃│ 📖 ${r.data.reference}\n┃│ 📝 ${r.data.text}\n┃│ 🌐 ${r.data.translation_name}\n╰━━━━━━━━━━━━━━━┈⊷`);
        else ctx.reply('❌ Not found');
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Recipes ────────────────────────────────────────────────
  {
    name: 'recipe', alias: ['cook','food'], category: 'search', desc: 'Search recipes',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}recipe pasta`);
      try {
        const r = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        const m = r.data?.meals?.[0];
        if (!m) return ctx.reply('❌ Not found');
        ctx.reply(`╭━━❖ 𝐑𝐄𝐂𝐈𝐏𝐄 ❖━┈⊷\n┃│ 🍽️ ${m.strMeal}\n┃│ 🌍 ${m.strArea} ${m.strCategory}\n┃│ 📝 ${m.strInstructions?.slice(0, 500)}\n┃│ 🔗 ${m.strYoutube}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'randomrecipe', alias: ['rndrecipe'], category: 'search', desc: 'Random recipe',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php', { timeout: 10000 });
        const m = r.data?.meals?.[0];
        if (!m) return ctx.reply('❌ Failed');
        await ctx.replyImg(m.strMealThumb, `🍽️ ${m.strMeal}\n\n${m.strInstructions?.slice(0, 300)}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Products ───────────────────────────────────────────────
  {
    name: 'product', alias: ['openfood'], category: 'search', desc: 'Food product info (barcode)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}product 737628064502`);
      try {
        const r = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${ctx.q}.json`, { timeout: 10000 });
        const p = r.data?.product;
        if (!p) return ctx.reply('❌ Not found');
        ctx.reply(`╭━━❖ 𝐏𝐑𝐎𝐃𝐔𝐂𝐓 ❖━┈⊷\n┃│ 📦 ${p.product_name}\n┃│ 🏢 ${p.brands}\n┃│ 🌍 ${p.countries}\n┃│ 🍫 ${p.nutriments?.['energy-kcal_100g'] || '?'} kcal/100g\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  }
];
