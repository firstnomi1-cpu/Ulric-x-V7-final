/**
 * Ulric-X MD - Religion (Islam) commands
 * Uses free Quran & Hadith APIs (no key).
 */
const axios = require('axios');
const utils = require('../lib/utils');
const config= require('../config');

async function quranGet(path) {
  try { const r = await axios.get(`${config.API.quran}${path}`, { timeout: 15000 }); return r.data?.data || r.data; }
  catch { return null; }
}

module.exports = [
  {
    name: 'quran', alias: ['quranverse','ayah'], category: 'religion', desc: 'Random Quran verse',
    handler: async (ctx) => {
      const num = utils.randInt(1, 6236);
      const v = await quranGet(`/ayah/${num}/editions/quran-uthmani,en.asad`);
      if (!v) return ctx.reply('❌ Failed');
      const [ar, en] = Array.isArray(v) ? v : [v];
      const text = `╭━━❖ 𝐐𝐔𝐑𝐀𝐍 ❖━┈⊷\n┃│ 📖 Surah ${ar.surah.englishName}:${ar.numberInSurah}\n┃│\n┃│ 🕋 Arabic:\n┃│ ${ar.text}\n┃│\n┃│ 🌐 Translation:\n┃│ ${en.text}\n╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(text);
    }
  },
  {
    name: 'surah', alias: ['surahlist'], category: 'religion', desc: 'List of Quran surahs',
    handler: async (ctx) => {
      const list = await quranGet('/surah');
      if (!list?.length) return ctx.reply('❌ Failed');
      let t = '╭━━❖ 𝐒𝐔𝐑𝐀𝐇𝐒 (114) ❖━┈⊷\n';
      list.slice(0, 20).forEach(s => t += `┃│ ${s.number}. ${s.englishName} (${s.name})\n`);
      t += `╰━━━━━━━━━━━━━━━┈⊷\n... and ${list.length - 20} more`;
      ctx.reply(t);
    }
  },
  {
    name: 'readsurah', alias: ['getssurah'], category: 'religion', desc: 'Read a specific surah',
    handler: async (ctx) => {
      const n = parseInt(ctx.args[0], 10);
      if (!n || n < 1 || n > 114) return ctx.reply(`Example: ${ctx.prefix}readsurah 1`);
      const s = await quranGet(`/surah/${n}/editions/quran-uthmani,en.asad`);
      if (!s) return ctx.reply('❌ Failed');
      const [ar, en] = Array.isArray(s) ? s : [s];
      let text = `╭━━❖ 𝐒𝐔𝐑𝐀𝐇 ${ar.englishName} ❖━┈⊷\n┃│ 🕋 ${ar.name}\n`;
      ar.ayahs.slice(0, 10).forEach((a, i) => {
        text += `┃│\n┃│ ${i+1}. ${a.text}\n┃│    ${en.ayahs[i].text}\n`;
      });
      text += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(text);
    }
  },
  {
    name: 'hadith', alias: ['hadees'], category: 'religion', desc: 'Random Hadith',
    handler: async (ctx) => {
      const books = ['bukhari','muslim','abudaud','tirmidhi','nasai','ibnmajah','malik','ahmad'];
      const book = utils.pickRandom(books);
      try {
        const r = await axios.get(`${config.API.hadith}/${book}`, { timeout: 15000 });
        const items = r.data?.data?.contents || [];
        if (!items.length) return ctx.reply('❌ Failed');
        const item = utils.pickRandom(items);
        const text = `╭━━❖ 𝐇𝐀𝐃𝐈𝐓𝐇 ❖━┈⊷\n┃│ 📚 Book: ${book}\n┃│ 🔢 Number: ${item.number}\n┃│\n┃│ 🌐 ${item.id}\n┃│ 🕋 ${item.arab}\n┃│\n┃│ 🌐 Translation:\n┃│ ${item.id}\n╰━━━━━━━━━━━━━━━┈⊷`;
        ctx.reply(text);
      } catch (e) { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'prayer', alias: ['salah','prayertime'], category: 'religion', desc: 'Prayer times',
    handler: async (ctx) => {
      const city = ctx.q || 'Karachi';
      try {
        // Use open-meteo geocoding + aladhan (free)
        const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { timeout: 10000 });
        const g = geo.data?.results?.[0];
        if (!g) return ctx.reply('❌ City not found');
        const r = await axios.get(`https://api.aladhan.com/v1/timings?latitude=${g.latitude}&longitude=${g.longitude}&method=2`, { timeout: 10000 });
        const t = r.data?.data?.timings;
        if (!t) return ctx.reply('❌ Failed');
        const text = `╭━━❖ 𝐏𝐑𝐀𝐘𝐄𝐑 𝐓𝐈𝐌𝐄𝐒 ❖━┈⊷\n┃│ 📍 ${g.name}, ${g.country}\n┃│\n┃│ 🌅 Fajr:    ${t.Fajr}\n┃│ ☀️ Dhuhr:   ${t.Dhuhr}\n┃│ 🌤️ Asr:     ${t.Asr}\n┃│ 🌇 Maghrib: ${t.Maghrib}\n┃│ 🌙 Isha:    ${t.Isha}\n╰━━━━━━━━━━━━━━━┈⊷`;
        ctx.reply(text);
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'qibla', alias: ['qibladirection'], category: 'religion', desc: 'Qibla direction',
    handler: async (ctx) => {
      const city = ctx.q || 'Karachi';
      try {
        const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { timeout: 10000 });
        const g = geo.data?.results?.[0];
        if (!g) return ctx.reply('❌ City not found');
        const r = await axios.get(`https://api.aladhan.com/v1/qibla/${g.latitude}/${g.longitude}`, { timeout: 10000 });
        const dir = r.data?.data?.direction;
        ctx.reply(`╭━━❖ 𝐐𝐈𝐁𝐋𝐀 ❖━┈⊷\n┃│ 📍 ${g.name}\n┃│ 🧭 Direction: ${dir?.toFixed(2)}° from North\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch (e) { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'islamicdate', alias: ['hijridate'], category: 'religion', desc: 'Islamic/Hijri date',
    handler: async (ctx) => {
      try {
        const r = await axios.get('https://api.aladhan.com/v1/gToH/' + new Date().toISOString().slice(0,10), { timeout: 10000 });
        const h = r.data?.data?.hijri;
        ctx.reply(`╭━━❖ 𝐇𝐈𝐉𝐑𝐈 𝐃𝐀𝐓𝐄 ❖━┈⊷\n┃│ 📅 ${h.day} ${h.month.en} ${h.year} AH\n┃│ 🌙 ${h.weekday.en}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'asmaulhusna', alias: ['namesofallah'], category: 'religion', desc: '99 names of Allah',
    handler: async (ctx) => {
      const n = parseInt(ctx.args[0], 10) || utils.randInt(1, 99);
      try {
        const r = await axios.get(`https://api.aladhan.com/v1/asmaAlHusna/${n}`, { timeout: 10000 });
        const name = r.data?.data?.[0];
        if (!name) return ctx.reply('❌ Failed');
        ctx.reply(`╭━━❖ 𝐀𝐒𝐌𝐀 𝐔𝐋 𝐇𝐔𝐒𝐍𝐀 ❖━┈⊷\n┃│ ${n}. ${name.name}\n┃│ 🌐 ${name.transliteration}\n┃│ 📝 ${name.en?.meaning}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'dua', alias: ['supplication'], category: 'religion', desc: 'Random dua',
    handler: async (ctx) => {
      const duas = [
        { ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', tr: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanah', en: 'Our Lord, give us good in this world and good in the Hereafter' },
        { ar: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ', tr: 'Allahummaghfir li dhanbi kullah', en: 'O Allah, forgive all my sins' },
        { ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', tr: 'Hasbunallahu wa ni\'mal wakeel', en: 'Sufficient for us is Allah, and the best Disposer of affairs' },
        { ar: 'اللَّهُمَّ ارْزُقْنَا حَلَالًا طَيِّبًا', tr: 'Allahummarzuqna halalan tayyiban', en: 'O Allah, provide us with halal and pure sustenance' }
      ];
      const d = utils.pickRandom(duas);
      ctx.reply(`╭━━❖ 𝐃𝐔𝐀 ❖━┈⊷\n┃│ 🕋 ${d.ar}\n┃│ 🌐 ${d.tr}\n┃│ 📝 ${d.en}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'kalima', alias: ['kalimah'], category: 'religion', desc: 'Six Kalima',
    handler: async (ctx) => {
      const n = parseInt(ctx.args[0], 10) || 1;
      const kalimas = [
        'لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ\n(There is no god but Allah, Muhammad is the messenger of Allah)',
        'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ\n(I bear witness that none has the right to be worshipped except Allah, alone, without partner, and that Muhammad is His servant and messenger)',
        'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ\n(Glory be to Allah, all praise is for Allah, there is no god but Allah, and Allah is the Greatest)',
        'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ\n(There is no god but Allah alone, with no partner. His is the dominion and praise, and He is able to do all things)',
        'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ\n(O Allah, I seek refuge in You from knowingly associating partners with You, and I seek Your forgiveness for what I do not know)',
        'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ\n(Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire)'
      ];
      const idx = Math.min(Math.max(n, 1), 6) - 1;
      ctx.reply(`╭━━❖ 𝐊𝐀𝐋𝐈𝐌𝐀 ${idx+1} ❖━┈⊷\n┃│ ${kalimas[idx]}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  }
];
