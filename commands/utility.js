/**
 * Ulric-X MD - Utility commands
 */
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const utils = require('../lib/utils');
const config= require('../config');
const store = require('../lib/store');

module.exports = [
  {
    name: 'weather', alias: ['w'], category: 'utility', desc: 'Get weather for a city',
    handler: async (ctx) => {
      const city = ctx.q || 'Karachi';
      try {
        const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { timeout: 10000 });
        const g = geo.data?.results?.[0];
        if (!g) return ctx.reply('❌ City not found');
        const r = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`, { timeout: 10000 });
        const c = r.data?.current;
        const code = c?.weather_code;
        const desc = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',51:'Light drizzle',61:'Light rain',71:'Light snow',80:'Rain showers',95:'Thunderstorm'}[code] || 'Unknown';
        ctx.reply(`╭━━❖ 𝐖𝐄𝐀𝐓𝐇𝐄𝐑 ❖━┈⊷\n┃│ 📍 ${g.name}, ${g.country}\n┃│ 🌡️ ${c.temperature_2m}°C\n┃│ 💧 ${c.relative_humidity_2m}%\n┃│ 💨 ${c.wind_speed_10m} km/h\n┃│ 🌤️ ${desc}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'time', alias: ['clock'], category: 'utility', desc: 'Current time',
    handler: async (ctx) => ctx.reply(`🕐 ${utils.getTime()}\n📅 ${utils.tanggal()}`)
  },
  {
    name: 'date', alias: ['today'], category: 'utility', desc: 'Current date',
    handler: async (ctx) => ctx.reply(`📅 ${utils.tanggal()}`)
  },
  {
    name: 'qr', alias: ['qrcode'], category: 'utility', desc: 'Generate QR code',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}qr Hello`);
      await ctx.replyImg(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ctx.q)}`, 'QR Code');
    }
  },
  {
    name: 'shorten', alias: ['shorturl'], category: 'utility', desc: 'Shorten a URL',
    handler: async (ctx) => {
      if (!ctx.q || !utils.isUrl(ctx.q)) return ctx.reply(`Example: ${ctx.prefix}shorten https://example.com`);
      try {
        const r = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        ctx.reply(`🔗 ${r.data}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'translate', alias: ['tr2'], category: 'utility', desc: 'Translate text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}translate Hello|fr`);
      const [text, lang] = ctx.q.split('|');
      if (!text || !lang) return ctx.reply('Format: .translate text|language_code');
      try {
        const r = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang.trim()}&dt=t&q=${encodeURIComponent(text.trim())}`, { timeout: 10000 });
        const tr = r.data?.[0]?.map(x => x[0]).join('');
        ctx.reply(`🌐 ${tr}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'currency', alias: ['forex'], category: 'utility', desc: 'Currency conversion',
    handler: async (ctx) => {
      const [amt, from, to] = (ctx.q || '').split(' ');
      if (!amt || !from || !to) return ctx.reply(`Example: ${ctx.prefix}currency 100 USD PKR`);
      try {
        const r = await axios.get(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`, { timeout: 10000 });
        const rate = r.data?.rates?.[to.toUpperCase()];
        if (!rate) return ctx.reply('❌ Currency not found');
        ctx.reply(`💵 ${amt} ${from.toUpperCase()} = ${(amt * rate).toFixed(2)} ${to.toUpperCase()}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'crypto', alias: ['cryptoPrice'], category: 'utility', desc: 'Crypto price',
    handler: async (ctx) => {
      const coin = (ctx.args[0] || 'bitcoin').toLowerCase();
      try {
        const r = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, { timeout: 10000 });
        const p = r.data?.[coin]?.usd;
        if (!p) return ctx.reply('❌ Coin not found');
        ctx.reply(`🪙 ${coin}: $${p}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'ipinfo', alias: ['ip'], category: 'utility', desc: 'IP information',
    handler: async (ctx) => {
      const ip = ctx.args[0] || '';
      try {
        const r = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 10000 });
        const d = r.data;
        ctx.reply(`╭━━❖ 𝐈𝐏 𝐈𝐍𝐅𝐎 ❖━┈⊷\n┃│ 🌐 ${d.ip}\n┃│ 📍 ${d.city}, ${d.region}, ${d.country_name}\n┃│ 🏢 ${d.org}\n┃│ 🕐 ${d.timezone}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'whois', alias: ['domain'], category: 'utility', desc: 'Domain whois lookup',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}whois google.com`);
      try {
        const r = await axios.get(`https://rdap.org/domain/${ctx.q}`, { timeout: 10000 });
        const d = r.data;
        ctx.reply(`╭━━❖ 𝐖𝐇𝐎𝐈𝐒 ❖━┈⊷\n┃│ 🌐 ${d.ldhName}\n┃│ 📅 Status: ${(d.status||[]).join(', ')}\n┃│ 📝 Events: ${(d.events||[]).map(e=>`${e.eventAction}: ${e.eventDate}`).join('\n┃│ ')}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'github', alias: ['gh'], category: 'utility', desc: 'GitHub user info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}github username`);
      try {
        const r = await axios.get(`https://api.github.com/users/${ctx.q}`, { timeout: 10000 });
        const d = r.data;
        const text = `╭━━❖ 𝐆𝐈𝐓𝐇𝐔𝐁 ❖━┈⊷\n┃│ 👤 ${d.name || d.login}\n┃│ 📦 Repos: ${d.public_repos}\n┃│ 👥 Followers: ${d.followers}\n┃│ 🫂 Following: ${d.following}\n┃│ 🌐 ${d.html_url}\n┃│ 📝 ${d.bio || 'No bio'}\n╰━━━━━━━━━━━━━━━┈⊷`;
        await ctx.replyImg(d.avatar_url, text);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'tempmail', alias: ['tmpmail'], category: 'utility', desc: 'Generate temp mail',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1', { timeout: 10000 });
        ctx.reply(`📧 Temp mail: ${r.data[0]}`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'google', alias: ['g','search'], category: 'utility', desc: 'Google search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}google WhatsApp bot`);
      const url = `https://www.google.com/search?q=${encodeURIComponent(ctx.q)}`;
      ctx.reply(`🔍 Google search:\n${url}`);
    }
  },
  {
    name: 'lyrics', alias: ['lyric'], category: 'utility', desc: 'Search song lyrics',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}lyrics Bohemian Rhapsody`);
      try {
        const r = await axios.get(`https://api.lyrics.ovh/v1/${ctx.q.split('/')[0]}/${ctx.q.split('/')[1] || ''}`, { timeout: 10000 });
        if (r.data?.error) return ctx.reply('❌ Not found');
        ctx.reply(`🎤 ${r.data.lyrics?.slice(0, 1000) || 'No lyrics'}`);
      } catch { ctx.reply('❌ Format: artist/song'); }
    }
  },
  {
    name: 'calculator', alias: ['calc2'], category: 'utility', desc: 'Math calculator',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}calc 2+2*5`);
      try {
        const r = Function(`"use strict"; return (${ctx.q.replace(/[^0-9+\-*/().% ]/g,'')})`)();
        ctx.reply(`🧮 ${ctx.q} = ${r}`);
      } catch { ctx.reply('❌ Invalid'); }
    }
  },
  {
    name: 'randompass', alias: ['password','genpass'], category: 'utility', desc: 'Generate random password',
    handler: async (ctx) => {
      const len = parseInt(ctx.args[0], 10) || 12;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let p = '';
      for (let i = 0; i < len; i++) p += chars[utils.randInt(0, chars.length-1)];
      ctx.reply(`🔐 Password: \`${p}\``);
    }
  },
  {
    name: 'uuid', alias: ['guid'], category: 'utility', desc: 'Generate UUID',
    handler: async (ctx) => {
      const u = require('crypto').randomUUID();
      ctx.reply(`🆔 ${u}`);
    }
  },
  {
    name: 'hash', alias: ['md5','sha256'], category: 'utility', desc: 'Hash text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}hash Hello`);
      const crypto = require('crypto');
      const md5 = crypto.createHash('md5').update(ctx.q).digest('hex');
      const sha256 = crypto.createHash('sha256').update(ctx.q).digest('hex');
      ctx.reply(`🔐 MD5: ${md5}\n🔒 SHA256: ${sha256}`);
    }
  },
  {
    name: 'bin', alias: ['binlookup'], category: 'utility', desc: 'BIN lookup',
    handler: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply(`Example: ${ctx.prefix}bin 457173`);
      try {
        const r = await axios.get(`https://lookup.binlist.net/${ctx.args[0]}`, { timeout: 10000 });
        const d = r.data;
        ctx.reply(`╭━━❖ 𝐁𝐈𝐍 𝐋𝐎𝐎𝐊𝐔𝐏 ❖━┈⊷\n┃│ 🏦 ${d.bank?.name || 'Unknown'}\n┃│ 🌍 ${d.country?.name} ${d.country?.emoji}\n┃│ 💳 ${d.scheme} ${d.type}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'timestamp', alias: ['ts'], category: 'utility', desc: 'Current Unix timestamp',
    handler: async (ctx) => ctx.reply(`🕐 Unix timestamp: ${Math.floor(Date.now()/1000)}`)
  },
  {
    name: 'base64', alias: ['b64'], category: 'utility', desc: 'Base64 encode/decode',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}base64 encode|text OR decode|dGV4dA==`);
      const [op, ...rest] = ctx.q.split('|');
      const text = rest.join('|');
      try {
        if (op.trim() === 'encode') ctx.reply(Buffer.from(text).toString('base64'));
        else if (op.trim() === 'decode') ctx.reply(Buffer.from(text, 'base64').toString('utf8'));
        else ctx.reply('Use encode| or decode|');
      } catch { ctx.reply('❌ Invalid'); }
    }
  },
  {
    name: 'reminder', alias: ['remind'], category: 'utility', desc: 'Set a reminder (basic)',
    handler: async (ctx) => {
      if (!ctx.q?.includes('|')) return ctx.reply(`Example: ${ctx.prefix}reminder 5|Call mom (5=minutes)`);
      const [min, ...msg] = ctx.q.split('|');
      const ms = parseInt(min, 10) * 60 * 1000;
      ctx.reply(`⏰ Reminder set for ${min} minutes`);
      setTimeout(() => ctx.sock.sendMessage(ctx.jid, { text: `⏰ Reminder: ${msg.join('|')}` }), ms);
    }
  },
  {
    name: 'afk', alias: ['away'], category: 'utility', desc: 'Set AFK status',
    handler: async (ctx) => {
      const reason = ctx.q || 'AFK';
      store.setSetting(`afk_${ctx.sender}`, { reason, ts: Date.now() });
      ctx.reply(`✅ You are now AFK: ${reason}`);
    }
  },
  {
    name: 'unafk', alias: ['back'], category: 'utility', desc: 'Remove AFK status',
    handler: async (ctx) => {
      store.setSetting(`afk_${ctx.sender}`, null);
      ctx.reply('✅ Welcome back!');
    }
  },
  {
    name: 'country', alias: ['countryinfo'], category: 'utility', desc: 'Country information',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}country Pakistan`);
      try {
        const r = await axios.get(`https://restcountries.com/v3.1/name/${ctx.q}`, { timeout: 10000 });
        const d = r.data?.[0];
        if (!d) return ctx.reply('❌ Not found');
        ctx.reply(`╭━━❖ 𝐂𝐎𝐔𝐍𝐓𝐑𝐘 ❖━┈⊷\n┃│ 🏳️ ${d.name.common}\n┃│ 🌍 ${d.region}\n┃│ 🏙️ Capital: ${d.capital?.[0]}\n┃│ 👥 Pop: ${d.population?.toLocaleString()}\n┃│ 💱 ${(Object.keys(d.currencies||{}).join(', '))}\n┃│ 📞 +${d.idd?.root}${d.idd?.suffixes?.[0] || ''}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'zipcode', alias: ['postal'], category: 'utility', desc: 'Zip code lookup',
    handler: async (ctx) => {
      if (!ctx.q?.includes('|')) return ctx.reply(`Example: ${ctx.prefix}zipcode US|90210`);
      const [country, zip] = ctx.q.split('|');
      try {
        const r = await axios.get(`https://api.zippopotam.us/${country.trim()}/${zip.trim()}`, { timeout: 10000 });
        const d = r.data;
        const place = d.places?.[0];
        ctx.reply(`╭━━❖ 𝐙𝐈𝐏𝐂𝐎𝐃𝐄 ❖━┈⊷\n┃│ 📮 ${zip}\n┃│ 📍 ${place?.['place name']}, ${d.country}\n┃│ 🌐 ${place?.longitude}, ${place?.latitude}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'speedtest', alias: ['nettest'], category: 'utility', desc: 'Quick network test',
    handler: async (ctx) => {
      const start = Date.now();
      await axios.get('https://www.google.com', { timeout: 10000 });
      const ms = Date.now() - start;
      ctx.reply(`⚡ Network latency: ${ms}ms`);
    }
  },
  {
    name: 'wikipedia', alias: ['wiki'], category: 'utility', desc: 'Wikipedia search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wiki Albert Einstein`);
      try {
        const r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        const d = r.data;
        const text = `╭━━❖ 𝐖𝐈𝐊𝐈𝐏𝐄𝐃𝐈𝐀 ❖━┈⊷\n┃│ 📚 ${d.title}\n┃│ 📝 ${d.extract}\n┃│ 🔗 ${d.content_urls?.desktop?.page}\n╰━━━━━━━━━━━━━━━┈⊷`;
        if (d.thumbnail?.source) await ctx.replyImg(d.thumbnail.source, text);
        else ctx.reply(text);
      } catch { ctx.reply('❌ Not found'); }
    }
  }
];
