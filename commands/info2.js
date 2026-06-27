/**
 * Ulric-X MD - Additional Info / Lookup Commands (50+)
 */
const axios = require('axios');
const utils = require('../lib/utils');
const config= require('../config');
const os = require('os');

async function apiGet(url, timeout = 10000) {
  try { return (await axios.get(url, { timeout })).data; } catch { return null; }
}

module.exports = [
  // ─── System & Bot ───────────────────────────────────────────
  {
    name: 'botstatus', alias: ['status'], category: 'info', desc: 'Detailed bot status',
    handler: async (ctx) => {
      const mem = process.memoryUsage();
      const cpu = os.loadavg();
      ctx.reply(`╭━━❖ 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 ❖━┈⊷
┃│ 🤖 ${config.BOT_NAME} v${config.BOT_VERSION}
┃│ ⏱️ Uptime: ${utils.runtime(process.uptime())}
┃│ 💾 Memory: ${utils.formatBytes(mem.rss)} / ${utils.formatBytes(os.totalmem())}
┃│ 🧠 Heap: ${utils.formatBytes(mem.heapUsed)}/${utils.formatBytes(mem.heapTotal)}
┃│ 🚀 CPU load: ${cpu[0].toFixed(2)}, ${cpu[1].toFixed(2)}, ${cpu[2].toFixed(2)}
┃│ 🖥️ ${os.platform()} ${os.arch()} | ${os.cpus().length} cores
┃│ 📦 Node ${process.version}
┃│ 👑 Owner: ${config.BOT_OWNER}
┃╰───────────────
╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'serverinfo', alias: ['srv'], category: 'info', desc: 'Server info',
    handler: async (ctx) => {
      ctx.reply(`╭━━❖ 𝐒𝐄𝐑𝐕𝐄𝐑 ❖━┈⊷\n┃│ 🖥️ ${os.hostname()}\n┃│ 💻 ${os.platform()} ${os.release()} ${os.arch()}\n┃│ 🚀 ${os.cpus().length}x ${os.cpus()[0]?.model}\n┃│ 💾 ${utils.formatBytes(os.freemem())} free of ${utils.formatBytes(os.totalmem())}\n┃│ ⏱️ Uptime: ${utils.runtime(os.uptime())}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'meminfo', alias: ['memory'], category: 'info', desc: 'Memory info',
    handler: async (ctx) => {
      const m = process.memoryUsage();
      ctx.reply(`╭━━❖ 𝐌𝐄𝐌𝐎𝐑𝐘 ❖━┈⊷\n┃│ RSS: ${utils.formatBytes(m.rss)}\n┃│ Heap Used: ${utils.formatBytes(m.heapUsed)}\n┃│ Heap Total: ${utils.formatBytes(m.heapTotal)}\n┃│ External: ${utils.formatBytes(m.external)}\n┃│ Free: ${utils.formatBytes(os.freemem())}\n┃│ Total: ${utils.formatBytes(os.totalmem())}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'cpuinfo', alias: ['cpu'], category: 'info', desc: 'CPU info',
    handler: async (ctx) => {
      const c = os.cpus()[0];
      ctx.reply(`╭━━❖ 𝐂𝐏𝐔 ❖━┈⊷\n┃│ 🏷️ ${c.model}\n┃│ ⚡ ${c.speed} MHz\n┃│ 💪 ${os.cpus().length} cores\n┃│ 📊 Load: ${os.loadavg().map(x=>x.toFixed(2)).join(', ')}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },

  // ─── User Info ──────────────────────────────────────────────
  {
    name: 'userinfo', alias: ['whois2'], category: 'info', desc: 'User details',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      let pp = null;
      try { pp = await ctx.sock.profilePictureUrl(target, 'image'); } catch {}
      const text = `╭━━❖ 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 ❖━┈⊷\n┃│ 👤 Number: ${target.split('@')[0]}\n┃│ 🌍 Country: ${utils.getCountry(target.split('@')[0])}\n┃│ 🆔 ${target}\n┃│ 📞 JID: ${target}\n╰━━━━━━━━━━━━━━━┈⊷`;
      if (pp) await ctx.replyImg(pp, text);
      else ctx.reply(text + '\n\n(No profile picture)');
    }
  },
  {
    name: 'userstatus', alias: ['aboutuser'], category: 'info', desc: 'User about/status',
    handler: async (ctx) => {
      const target = ctx.mentionedJid?.[0] || ctx.sender;
      try {
        const status = await ctx.sock.fetchStatus(target);
        ctx.reply(`╭━━❖ 𝐔𝐒𝐄𝐑 𝐒𝐓𝐀𝐓𝐔𝐒 ❖━┈⊷\n┃│ 👤 ${target.split('@')[0]}\n┃│ 📝 ${status.status || 'No status'}\n┃│ 📅 ${status.setAt ? new Date(status.setAt).toDateString() : 'Unknown'}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Status not available'); }
    }
  },

  // ─── Group Info ─────────────────────────────────────────────
  {
    name: 'groupinfo2', alias: ['gcinfo'], category: 'info', desc: 'Detailed group info',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      const m = ctx.groupMetadata;
      const admins = ctx.groupAdmins.length;
      const members = m.participants.length;
      ctx.reply(`╭━━❖ 𝐆𝐑𝐎𝐔𝐏 ❖━┈⊷\n┃│ 📛 ${m.subject}\n┃│ 👥 Members: ${members}\n┃│ 👑 Admins: ${admins}\n┃│ 🆔 ${m.id}\n┃│ 📅 Created: ${new Date(m.creation*1000).toDateString()}\n┃│ 🔒 Restrict: ${m.restrict ? 'Yes' : 'No'}\n┃│ 📢 Announce: ${m.announce ? 'Yes' : 'No'}\n┃│ 👑 Owner: ${m.owner?.split('@')[0] || 'Unknown'}\n┃│ 📝 Desc: ${(m.desc || 'No description').slice(0, 200)}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'gcmembers', alias: ['membercount'], category: 'info', desc: 'Member count',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      ctx.reply(`👥 Members in ${ctx.groupMetadata.subject}: ${ctx.groupMetadata.participants.length}`);
    }
  },
  {
    name: 'gconline', alias: ['gconline2'], category: 'info', desc: 'Online members in group',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      ctx.reply(`⚠️ WhatsApp does not expose online status for privacy reasons. Cannot list online members.`);
    }
  },

  // ─── Time & Date ────────────────────────────────────────────
  {
    name: 'time2', alias: ['clock2'], category: 'info', desc: 'Current time',
    handler: async (ctx) => ctx.reply(`🕐 ${utils.getTime()}\n📅 ${utils.tanggal()}`)
  },
  {
    name: 'date2', alias: ['today2'], category: 'info', desc: 'Today date',
    handler: async (ctx) => ctx.reply(`📅 ${utils.tanggal()}\n🌍 Unix: ${Math.floor(Date.now()/1000)}`)
  },
  {
    name: 'worldtime', alias: ['timezone'], category: 'info', desc: 'Time in any timezone',
    handler: async (ctx) => {
      const tz = ctx.q || 'Asia/Karachi';
      try {
        const m = require('moment-timezone');
        ctx.reply(`🕐 ${tz}: ${m().tz(tz).format('YYYY-MM-DD HH:mm:ss')}`);
      } catch { ctx.reply('❌ Invalid timezone'); }
    }
  },
  {
    name: 'newyorktime', alias: ['nytime'], category: 'info', desc: 'New York time',
    handler: async (ctx) => {
      const m = require('moment-timezone');
      ctx.reply(`🗽 New York: ${m().tz('America/New_York').format('YYYY-MM-DD HH:mm:ss')}`);
    }
  },
  {
    name: 'londontime', alias: ['uktime'], category: 'info', desc: 'London time',
    handler: async (ctx) => {
      const m = require('moment-timezone');
      ctx.reply(`🇬🇧 London: ${m().tz('Europe/London').format('YYYY-MM-DD HH:mm:ss')}`);
    }
  },
  {
    name: 'tokyotime', alias: ['jptime'], category: 'info', desc: 'Tokyo time',
    handler: async (ctx) => {
      const m = require('moment-timezone');
      ctx.reply(`🇯🇵 Tokyo: ${m().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')}`);
    }
  },
  {
    name: 'dubaitime', alias: ['uaetime'], category: 'info', desc: 'Dubai time',
    handler: async (ctx) => {
      const m = require('moment-timezone');
      ctx.reply(`🇦🇪 Dubai: ${m().tz('Asia/Dubai').format('YYYY-MM-DD HH:mm:ss')}`);
    }
  },

  // ─── Network ────────────────────────────────────────────────
  {
    name: 'ip2', alias: ['myip'], category: 'info', desc: 'Server public IP',
    handler: async (ctx) => {
      const r = await apiGet('https://api.ipify.org?format=json');
      if (r) ctx.reply(`🌐 Server IP: ${r.ip}`);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'ipinfo2', alias: ['iplookup'], category: 'info', desc: 'IP geolocation',
    handler: async (ctx) => {
      const ip = ctx.args[0] || '';
      const r = await apiGet(`https://ipapi.co/${ip}/json/`);
      if (r) ctx.reply(`╭━━❖ 𝐈𝐏 ❖━┈⊷\n┃│ 🌐 ${r.ip}\n┃│ 📍 ${r.city}, ${r.region}, ${r.country_name}\n┃│ 🏢 ${r.org}\n┃│ 🕐 ${r.timezone}\n╰━━━━━━━━━━━━━━━┈⊷`);
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'dns', alias: ['dnslookup'], category: 'info', desc: 'DNS lookup',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}dns google.com`);
      try {
        const r = await axios.get(`https://dns.google/resolve?name=${encodeURIComponent(ctx.q)}&type=A`, { timeout: 10000 });
        const answers = r.data?.Answer || [];
        if (!answers.length) return ctx.reply('❌ No records');
        let t = `DNS for ${ctx.q}:\n`;
        answers.forEach(a => t += `${a.name} (${a.type}) → ${a.data}\n`);
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'httpheaders', alias: ['headers'], category: 'info', desc: 'Get HTTP headers',
    handler: async (ctx) => {
      if (!ctx.q || !utils.isUrl(ctx.q)) return ctx.reply(`Example: ${ctx.prefix}httpheaders https://google.com`);
      try {
        const r = await axios.get(ctx.q, { timeout: 10000, validateStatus: () => true });
        let t = 'Headers:\n';
        for (const [k, v] of Object.entries(r.headers)) t += `${k}: ${v}\n`;
        ctx.reply(t.slice(0, 1500));
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Country / Currency ─────────────────────────────────────
  {
    name: 'countryinfo', alias: ['cinfo'], category: 'info', desc: 'Country info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}countryinfo Pakistan`);
      try {
        const r = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        const d = r.data?.[0];
        if (!d) return ctx.reply('❌ Not found');
        const text = `╭━━❖ 𝐂𝐎𝐔𝐍𝐓𝐑𝐘 ❖━┈⊷\n┃│ 🏳️ ${d.flag} ${d.name.common}\n┃│ 🌍 ${d.region} / ${d.subregion || ''}\n┃│ 🏙️ Capital: ${d.capital?.[0] || 'N/A'}\n┃│ 👥 Pop: ${d.population?.toLocaleString()}\n┃│ 📞 +${d.idd?.root}${d.idd?.suffixes?.[0] || ''}\n┃│ 💱 ${(Object.keys(d.currencies||{}).join(', '))}\n┃│ 🗣️ ${(Object.values(d.languages||{}).join(', ')).slice(0,80)}\n╰━━━━━━━━━━━━━━━┈⊷`;
        ctx.reply(text);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'currencies', alias: ['currencylist'], category: 'info', desc: 'List currencies',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://open.er-api.com/v6/currencies', { timeout: 10000 });
        const list = Object.keys(r.data || {}).slice(0, 50);
        ctx.reply(`💱 Currencies: ${list.join(', ')}\n\n... and more. Use ${ctx.prefix}currency <amount> <from> <to>`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Crypto ─────────────────────────────────────────────────
  {
    name: 'cryptoprice', alias: ['crypto2'], category: 'info', desc: 'Crypto price',
    handler: async (ctx) => {
      const coin = (ctx.args[0] || 'bitcoin').toLowerCase();
      try {
        const r = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}`, { timeout: 10000 });
        const d = r.data;
        const m = d.market_data;
        ctx.reply(`╭━━❖ 𝐂𝐑𝐘𝐏𝐓𝐎 ❖━┈⊷\n┃│ 🪙 ${d.name} (${d.symbol.toUpperCase()})\n┃│ 💵 $${m.current_price.usd}\n┃│ 📈 24h: ${m.price_change_percentage_24h?.toFixed(2)}%\n┃│ 📊 Market Cap: $${m.market_cap.usd?.toLocaleString()}\n┃│ 🥇 Rank: #${m.market_cap_rank}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'cryptolist', alias: ['topcrypto'], category: 'info', desc: 'Top 10 cryptocurrencies',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10', { timeout: 10000 });
        let t = '╭━━❖ 𝐓𝐎𝐏 𝟏𝟎 𝐂𝐑𝐘𝐏𝐓𝐎 ❖━┈⊷\n';
        r.data.forEach((c, i) => t += `┃│ ${i+1}. ${c.name} ($${c.current_price})\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Science ────────────────────────────────────────────────
  {
    name: 'element', alias: ['periodic'], category: 'info', desc: 'Periodic table element',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}element H`);
      try {
        const r = await axios.get(`https://neelpatel05-element-api.herokuapp.com/element?symbol=${encodeURIComponent(ctx.q.toUpperCase())}`, { timeout: 10000 });
        if (!r.data) return ctx.reply('❌ Not found');
        const d = r.data;
        ctx.reply(`╭━━❖ 𝐄𝐋𝐄𝐌𝐄𝐍𝐓 ❖━┈⊷\n┃│ ⚛️ ${d.name} (${d.symbol})\n┃│ 🔢 Atomic #: ${d.atomicNumber}\n┃│ 📦 ${d.atomicMass} u\n┃│ 🏷️ Group ${d.groupBlock}\n┃│ 🌡️ ${d.boilingPoint}K boil | ${d.meltingPoint}K melt\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'nasaapod', alias: ['apod2'], category: 'info', desc: 'NASA astronomy picture',
    handler: async (ctx) => {
      const r = await apiGet('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      if (r?.url) {
        if (r.media_type === 'image') await ctx.replyImg(r.url, `🌌 ${r.title}\n\n${r.explanation?.slice(0,400)}`);
        else ctx.reply('🎬 ' + r.url);
      } else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'marsweather', alias: ['mars'], category: 'info', desc: 'Mars weather (NASA)',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://api.nasa.gov/insight_weather/?api_key=DEMO_KEY&feedtype=json&ver=1.0', { timeout: 10000 });
        const sols = r.data?.sol_keys || [];
        if (!sols.length) return ctx.reply('❌ No data');
        const last = r.data[sols[sols.length-1]];
        ctx.reply(`╭━━❖ 𝐌𝐀𝐑𝐒 ❖━┈⊷\n┃│ 🪐 Sol ${sols[sols.length-1]}\n┃│ 🌡️ ${last.AT?.av}°C\n┃│ 💨 ${last.HWS?.av} m/s\n┃│ 📊 ${last.PRE?.av} Pa\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ─── Phone Number Info ──────────────────────────────────────
  {
    name: 'phonenumber', alias: ['phoneinfo'], category: 'info', desc: 'Phone number info',
    handler: async (ctx) => {
      if (!ctx.args[0]) return ctx.reply(`Example: ${ctx.prefix}phonenumber 923189335011`);
      const num = ctx.args[0].replace(/\D/g, '');
      ctx.reply(`╭━━❖ 𝐏𝐇𝐎𝐍𝐄 ❖━┈⊷\n┃│ 📞 ${num}\n┃│ 🌍 ${utils.getCountry(num)}\n┃│ 🆔 ${num}@s.whatsapp.net\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },

  // ─── Quotes & Facts ─────────────────────────────────────────
  {
    name: 'todayhistory', alias: ['onthisday'], category: 'info', desc: 'Historical events today',
    handler: async (ctx) => {
      const d = new Date();
      const r = await apiGet(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${d.getMonth()+1}/${d.getDate()}`);
      if (r?.events?.length) {
        const list = r.events.slice(0, 5);
        let t = '╭━━❖ 𝐓𝐎𝐃𝐀𝐘 𝐈𝐍 𝐇𝐈𝐒𝐓𝐎𝐑𝐘 ❖━┈⊷\n';
        list.forEach((e, i) => t += `┃│ ${i+1}. ${e.year} - ${e.text.slice(0, 80)}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } else ctx.reply('❌ Failed');
    }
  },

  // ─── Holidays ───────────────────────────────────────────────
  {
    name: 'holiday', alias: ['holidays'], category: 'info', desc: 'Holidays today',
    handler: async (ctx) => {
      const r = await apiGet('https://holidays.abstractapi.com/v1/?api_key=missing');
      ctx.reply('⚠️ Holiday API needs a key. Try https://www.timeanddate.com/holidays/');
    }
  },

  // ─── Astronomy ──────────────────────────────────────────────
  {
    name: 'moonphase', alias: ['moon'], category: 'info', desc: 'Current moon phase',
    handler: async (ctx) => {
      const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
      const lp = 2551443; // lunar period in seconds
      const now = Date.now() / 1000;
      const newMoon = 592500; // Jan 7 1970 20:15 UTC
      const phase = ((now - newMoon) % lp) / lp;
      const idx = Math.floor(phase * 8) % 8;
      const emoji = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][idx];
      ctx.reply(`╭━━❖ 𝐌𝐎𝐎𝐍 ❖━┈⊷\n┃│ ${emoji} ${phases[idx]}\n┃│ 📊 ${Math.round(phase*100)}% through cycle\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },

  // ─── Birthday / Age ─────────────────────────────────────────
  {
    name: 'age', alias: ['agecalc'], category: 'info', desc: 'Calculate age',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}age 2000-05-15`);
      try {
        const bday = new Date(ctx.q);
        const now = new Date();
        const years = now.getFullYear() - bday.getFullYear();
        const months = now.getMonth() - bday.getMonth();
        const days = now.getDate() - bday.getDate();
        ctx.reply(`🎂 Age: ${years} years, ${months < 0 ? 12+months : months} months, ${days < 0 ? 30+days : days} days`);
      } catch { ctx.reply('❌ Use YYYY-MM-DD format'); }
    }
  },

  // ─── Bot Help ───────────────────────────────────────────────
  {
    name: 'help2', alias: ['commands2'], category: 'info', desc: 'Quick help',
    handler: async (ctx) => {
      ctx.reply(`╭━━❖ 𝐇𝐄𝐋𝐏 ❖━┈⊷\n┃│ 🤖 ${config.BOT_NAME} v${config.BOT_VERSION}\n┃│\n┃│ Quick commands:\n┃│ • ${ctx.prefix}menu - Main menu\n┃│ • ${ctx.prefix}allmenu - All commands\n┃│ • ${ctx.prefix}ai <q> - Ask AI\n┃│ • ${ctx.prefix}ytmp3 <url> - YouTube audio\n┃│ • ${ctx.prefix}tiktok <url> - TikTok video\n┃│ • ${ctx.prefix}sticker - Make sticker\n┃│ • ${ctx.prefix}quran - Random verse\n┃│ • ${ctx.prefix}weather <city> - Weather\n┃╰───────────────\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'support', alias: ['contact'], category: 'info', desc: 'Contact owner',
    handler: async (ctx) => ctx.reply(`📞 Owner: ${config.BOT_OWNER}\n📱 WhatsApp: +${config.BOT_OWNER_NUM}\n🤖 Bot: ${config.BOT_NAME}`)
  }
];
