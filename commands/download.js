/**
 * Ulric-X MD - Download commands (YouTube, social media, etc.)
 * Uses free APIs only (Cobalt, yt-search, ytdl-core).
 */
const axios = require('axios');
const yts   = require('yt-search');
const ytdl  = require('@distube/ytdl-core');
const utils = require('../lib/utils');
const config= require('../config');

// Cobalt API - free, no key, supports many social platforms
async function cobaltDownload(url) {
  try {
    const r = await axios.post(config.API.cobalt, { url }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      timeout: 30000
    });
    return r.data;
  } catch (e) { return null; }
}

module.exports = [
  {
    name: 'ytmp3', alias: ['play','song','ytaudio'], category: 'download', desc: 'Download YouTube audio',
    handler: async (ctx) => {
      const q = ctx.q;
      if (!q) return ctx.reply(`Example: ${ctx.prefix}ytmp3 <url|query>`);
      await ctx.reply('🔍 Searching...');
      let url = q;
      if (!utils.isUrl(q)) {
        const res = await yts(q);
        if (!res.videos.length) return ctx.reply('❌ No results');
        url = res.videos[0].url;
      }
      try {
        const info = await ytdl.getInfo(url);
        const fmt = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        await ctx.reply(`⬇️ Downloading: ${info.videoDetails.title}\n⏱️ ${info.videoDetails.lengthSeconds}s`);
        // Stream directly to WhatsApp
        const buf = await new Promise((resolve, reject) => {
          const chunks = [];
          ytdl(url, { quality: 'highestaudio', filter: 'audioonly' })
            .on('data', c => chunks.push(c))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', reject);
        });
        if (buf.length > 60 * 1024 * 1024) return ctx.reply('❌ File too large (>60MB). Try shorter video.');
        await ctx.sock.sendMessage(ctx.jid, { audio: buf, mimetype: 'audio/mpeg', fileName: `${info.videoDetails.title}.mp3`.slice(0,80) }, { quoted: ctx.m });
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'ytmp4', alias: ['video','ytvideo','ytv'], category: 'download', desc: 'Download YouTube video',
    handler: async (ctx) => {
      const q = ctx.q;
      if (!q) return ctx.reply(`Example: ${ctx.prefix}ytmp4 <url|query>`);
      await ctx.reply('🔍 Searching...');
      let url = q;
      if (!utils.isUrl(q)) {
        const res = await yts(q);
        if (!res.videos.length) return ctx.reply('❌ No results');
        url = res.videos[0].url;
      }
      try {
        const info = await ytdl.getInfo(url);
        await ctx.reply(`⬇️ Downloading: ${info.videoDetails.title}`);
        const buf = await new Promise((resolve, reject) => {
          const chunks = [];
          ytdl(url, { quality: 'highest', filter: 'audioandvideo' })
            .on('data', c => chunks.push(c))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', reject);
        });
        if (buf.length > 80 * 1024 * 1024) return ctx.reply('❌ File too large (>80MB). Try shorter video.');
        await ctx.sock.sendMessage(ctx.jid, { video: buf, fileName: `${info.videoDetails.title}.mp4`.slice(0,80) }, { quoted: ctx.m });
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'ytsrc', alias: ['ytsearch','yts'], category: 'download', desc: 'Search YouTube',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytsrc <query>`);
      const res = await yts(ctx.q);
      if (!res.videos.length) return ctx.reply('❌ No results');
      let t = `╭━━❖ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 ❖━┈⊷\n`;
      res.videos.slice(0, 10).forEach((v, i) => {
        t += `┃│ ${i+1}. ${v.title.slice(0,40)}\n┃│    ⏱️ ${v.timestamp} | 👁️ ${v.views}\n┃│    ${v.url}\n`;
      });
      t += `╰━━━━━━━━━━━━━━━┈⊷\nUse ${ctx.prefix}ytmp3 <url> to download`;
      ctx.reply(t);
    }
  },
  {
    name: 'ytinfo', alias: ['ytinfo','ytdata'], category: 'download', desc: 'YouTube video info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytinfo <url>`);
      try {
        const info = await ytdl.getInfo(ctx.q);
        const d = info.videoDetails;
        let t = `╭━━❖ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐈𝐍𝐅𝐎 ❖━┈⊷\n`;
        t += `┃│ 📺 Title: ${d.title}\n`;
        t += `┃│ 👤 Author: ${d.author.name}\n`;
        t += `┃│ 👁️ Views: ${d.viewCount}\n`;
        t += `┃│ ⏱️ Duration: ${d.lengthSeconds}s\n`;
        t += `┃│ 👍 Likes: ${d.likes}\n`;
        t += `┃│ 📝 ${d.description?.slice(0,100)}\n`;
        t += `╰━━━━━━━━━━━━━━━┈⊷`;
        ctx.reply(t);
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'tiktok', alias: ['tt','ttdl'], category: 'download', desc: 'Download TikTok video',
    handler: async (ctx) => genericCobalt(ctx, 'TikTok')
  },
  {
    name: 'instagram', alias: ['ig','igdl'], category: 'download', desc: 'Download Instagram post',
    handler: async (ctx) => genericCobalt(ctx, 'Instagram')
  },
  {
    name: 'facebook', alias: ['fb','fbdl'], category: 'download', desc: 'Download Facebook video',
    handler: async (ctx) => genericCobalt(ctx, 'Facebook')
  },
  {
    name: 'twitter', alias: ['tw','twdl','xdl'], category: 'download', desc: 'Download Twitter video',
    handler: async (ctx) => genericCobalt(ctx, 'Twitter')
  },
  {
    name: 'pinterest', alias: ['pin','pindl'], category: 'download', desc: 'Download Pinterest image',
    handler: async (ctx) => genericCobalt(ctx, 'Pinterest')
  },
  {
    name: 'reddit', alias: ['rdd','redditdl'], category: 'download', desc: 'Download Reddit media',
    handler: async (ctx) => genericCobalt(ctx, 'Reddit')
  },
  {
    name: 'soundcloud', alias: ['sc','scdl'], category: 'download', desc: 'Download SoundCloud audio',
    handler: async (ctx) => genericCobalt(ctx, 'SoundCloud')
  },
  {
    name: 'vimeo', alias: ['vm','vimeodl'], category: 'download', desc: 'Download Vimeo video',
    handler: async (ctx) => genericCobalt(ctx, 'Vimeo')
  },
  {
    name: 'snapchat', alias: ['snap','scdl2'], category: 'download', desc: 'Download Snapchat',
    handler: async (ctx) => genericCobalt(ctx, 'Snapchat')
  },
  {
    name: 'mediafire', alias: ['mf','mfdl'], category: 'download', desc: 'Download MediaFire file',
    handler: async (ctx) => genericCobalt(ctx, 'MediaFire')
  }
];

async function genericCobalt(ctx, label) {
  if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}${ctx.command} <url>`);
  if (!utils.isUrl(ctx.q)) return ctx.reply('❌ Invalid URL');
  await ctx.reply(`⬇️ Downloading from ${label}...`);
  const r = await cobaltDownload(ctx.q);
  if (!r) return ctx.reply('❌ Download failed (service unavailable)');
  if (r.status === 'error' || r.status === 'error') return ctx.reply(`❌ ${r.error?.code || 'Failed'}`);
  if (r.status === 'redirect' || r.status === 'tunnel') {
    if (r.type?.startsWith('video')) {
      await ctx.sock.sendMessage(ctx.jid, { video: { url: r.url }, caption: `✅ ${label} video` }, { quoted: ctx.m });
    } else if (r.type?.startsWith('audio')) {
      await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
    } else if (r.type?.startsWith('image')) {
      await ctx.replyImg(r.url, `✅ ${label} image`);
    } else {
      await ctx.reply(`🔗 ${label} link: ${r.url}`);
    }
  } else if (r.status === 'picker' && Array.isArray(r.picker)) {
    for (const item of r.picker.slice(0, 10)) {
      if (item.type === 'photo') await ctx.replyImg(item.url);
      else if (item.type === 'video') await ctx.sock.sendMessage(ctx.jid, { video: { url: item.url } }, { quoted: ctx.m });
    }
  } else {
    ctx.reply(`❌ Unexpected response. Try again later.`);
  }
}
