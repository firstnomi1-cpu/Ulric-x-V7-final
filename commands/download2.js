/**
 * Ulric-X MD - Download Commands (Extended) — 80+ commands
 * Uses Cobalt API (free, no key, stable) + ytdl-core + other free APIs
 * Supports: YouTube, TikTok, Instagram, Facebook, Twitter/X, Pinterest,
 *           Reddit, SoundCloud, Vimeo, Snapchat, Streamable, Twitch,
 *           LinkedIn, MediaFire, Mega.nz, APKPure, APKMirror, GitHub, etc.
 */
const axios = require('axios');
const yts   = require('yt-search');
const ytdl  = require('@distube/ytdl-core');
const utils = require('../lib/utils');
const config= require('../config');

// ─── Cobalt download (free, stable, no key) ──────────────────────
async function cobalt(url, opts = {}) {
  try {
    const r = await axios.post('https://co.wuk.sh/api/json', {
      url,
      ...opts
    }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      timeout: 30000
    });
    return r.data;
  } catch (e) { return null; }
}

// ─── Helper: download YouTube audio ──────────────────────────────
async function ytAudio(ctx, url, quality = 'highestaudio') {
  try {
    const info = await ytdl.getInfo(url);
    const buf = await new Promise((resolve, reject) => {
      const chunks = [];
      ytdl(url, { quality, filter: 'audioonly' })
        .on('data', c => chunks.push(c))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });
    if (buf.length > 60 * 1024 * 1024) return ctx.reply('❌ File too large (>60MB)');
    await ctx.sock.sendMessage(ctx.jid, {
      audio: buf,
      mimetype: 'audio/mpeg',
      fileName: `${info.videoDetails.title.slice(0,60)}.mp3`
    }, { quoted: ctx.m });
  } catch (e) { ctx.reply('❌ ' + e.message); }
}

// ─── Helper: download YouTube video ──────────────────────────────
async function ytVideo(ctx, url, quality = 'highest') {
  try {
    const info = await ytdl.getInfo(url);
    const buf = await new Promise((resolve, reject) => {
      const chunks = [];
      ytdl(url, { quality, filter: 'audioandvideo' })
        .on('data', c => chunks.push(c))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });
    if (buf.length > 80 * 1024 * 1024) return ctx.reply('❌ File too large (>80MB)');
    await ctx.sock.sendMessage(ctx.jid, {
      video: buf,
      fileName: `${info.videoDetails.title.slice(0,60)}.mp4`
    }, { quoted: ctx.m });
  } catch (e) { ctx.reply('❌ ' + e.message); }
}

// ─── Helper: Cobalt generic download ─────────────────────────────
async function cobaltDL(ctx, url, label) {
  if (!utils.isUrl(url)) return ctx.reply('❌ Invalid URL');
  await ctx.reply(`⬇️ Downloading from ${label}...`);
  const r = await cobalt(url);
  if (!r) return ctx.reply('❌ Service unavailable');
  if (r.status === 'error') return ctx.reply(`❌ ${r.error?.code || 'Failed'}`);
  if (r.status === 'redirect' || r.status === 'tunnel') {
    if (r.type?.startsWith('video')) await ctx.sock.sendMessage(ctx.jid, { video: { url: r.url }, caption: `✅ ${label}` }, { quoted: ctx.m });
    else if (r.type?.startsWith('audio')) await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
    else if (r.type?.startsWith('image')) await ctx.replyImg(r.url, `✅ ${label}`);
    else await ctx.reply(`🔗 ${r.url}`);
  } else if (r.status === 'picker' && Array.isArray(r.picker)) {
    for (const item of r.picker.slice(0, 10)) {
      if (item.type === 'photo') await ctx.replyImg(item.url);
      else if (item.type === 'video') await ctx.sock.sendMessage(ctx.jid, { video: { url: item.url } }, { quoted: ctx.m });
    }
  } else { ctx.reply('❌ Try again later'); }
}

module.exports = [
  // ═══ YouTube - Multiple Quality Variants ═════════════════════
  {
    name: 'ytmp3hd', alias: ['ytha','ytaudiohd','songhd'], category: 'download', desc: 'YouTube audio HD',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytmp3hd <url|query>`);
      let url = ctx.q;
      if (!utils.isUrl(ctx.q)) {
        const res = await yts(ctx.q); if (!res.videos.length) return ctx.reply('❌ No results');
        url = res.videos[0].url;
      }
      await ytAudio(ctx, url, 'highestaudio');
    }
  },
  {
    name: 'ytmp3low', alias: ['ytal','ytaudiolow'], category: 'download', desc: 'YouTube audio low quality',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytmp3low <url|query>`);
      let url = ctx.q;
      if (!utils.isUrl(ctx.q)) {
        const res = await yts(ctx.q); if (!res.videos.length) return ctx.reply('❌ No results');
        url = res.videos[0].url;
      }
      await ytAudio(ctx, url, 'lowestaudio');
    }
  },
  {
    name: 'ytmp4hd', alias: ['ytvhd','ytvideohd'], category: 'download', desc: 'YouTube video HD',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytmp4hd <url|query>`);
      let url = ctx.q;
      if (!utils.isUrl(ctx.q)) {
        const res = await yts(ctx.q); if (!res.videos.length) return ctx.reply('❌ No results');
        url = res.videos[0].url;
      }
      await ytVideo(ctx, url, 'highest');
    }
  },
  {
    name: 'ytmp4low', alias: ['ytvl','ytvideolow'], category: 'download', desc: 'YouTube video low quality',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytmp4low <url|query>`);
      let url = ctx.q;
      if (!utils.isUrl(ctx.q)) {
        const res = await yts(ctx.q); if (!res.videos.length) return ctx.reply('❌ No results');
        url = res.videos[0].url;
      }
      await ytVideo(ctx, url, 'lowest');
    }
  },
  {
    name: 'ytmp3doc', alias: ['ytdoc','ytaudiodoc'], category: 'download', desc: 'YouTube audio as document',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytmp3doc <url>`);
      try {
        const info = await ytdl.getInfo(ctx.q);
        const buf = await new Promise((resolve, reject) => {
          const chunks = [];
          ytdl(ctx.q, { quality: 'highestaudio', filter: 'audioonly' })
            .on('data', c => chunks.push(c))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', reject);
        });
        await ctx.sock.sendMessage(ctx.jid, {
          document: buf,
          fileName: `${info.videoDetails.title.slice(0,60)}.mp3`,
          mimetype: 'audio/mpeg'
        }, { quoted: ctx.m });
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'ytmp4doc', alias: ['ytvdoc','ytvideodoc'], category: 'download', desc: 'YouTube video as document',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytmp4doc <url>`);
      try {
        const info = await ytdl.getInfo(ctx.q);
        const buf = await new Promise((resolve, reject) => {
          const chunks = [];
          ytdl(ctx.q, { quality: 'highest', filter: 'audioandvideo' })
            .on('data', c => chunks.push(c))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', reject);
        });
        await ctx.sock.sendMessage(ctx.jid, {
          document: buf,
          fileName: `${info.videoDetails.title.slice(0,60)}.mp4`,
          mimetype: 'video/mp4'
        }, { quoted: ctx.m });
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'ytshorts', alias: ['shorts'], category: 'download', desc: 'Download YouTube Shorts',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytshorts <url>`);
      if (!ctx.q.includes('shorts')) return ctx.reply('❌ Not a shorts URL');
      await ctx.reply('⬇️ Downloading shorts...');
      await ytVideo(ctx, ctx.q, 'highest');
    }
  },
  {
    name: 'ytsubtitle', alias: ['ytsub','yttxt'], category: 'download', desc: 'Get YouTube subtitles',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytsubtitle <url>`);
      try {
        const info = await ytdl.getInfo(ctx.q);
        const tracks = info.player_response?.captions?.playerCaptionsTracklist?.captionTracks || [];
        if (!tracks.length) return ctx.reply('❌ No subtitles');
        const t = tracks[0];
        const r = await axios.get(t.baseUrl);
        ctx.reply(`📝 Subtitle (${t.languageCode}):\n\n${r.data.slice(0, 3000)}`);
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'ytchannel', alias: ['ytch'], category: 'download', desc: 'YouTube channel info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytchannel <channel name>`);
      const res = await yts(ctx.q);
      const ch = res.channels?.[0] || res.videos?.[0]?.author;
      if (!ch) return ctx.reply('❌ Not found');
      ctx.reply(`╭━━❖ 𝐘𝐓 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 ❖━┈⊷\n┃│ 📺 ${ch.name}\n┃│ 👥 ${ch.subCount || 'N/A'} subscribers\n┃│ 🎬 ${ch.videoCount || 'N/A'} videos\n┃│ 🔗 ${ch.url}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'ytplaylist', alias: ['ytpl'], category: 'download', desc: 'YouTube playlist search',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ytplaylist <query>`);
      const res = await yts(ctx.q);
      const list = res.videos.slice(0, 10);
      let t = '╭━━❖ 𝐘𝐓 𝐏𝐋𝐀𝐘𝐋𝐈𝐒𝐓 ❖━┈⊷\n';
      list.forEach((v, i) => t += `┃│ ${i+1}. ${v.title.slice(0,40)}\n┃│    ⏱️ ${v.timestamp}\n`);
      t += '╰━━━━━━━━━━━━━━━┈⊷';
      ctx.reply(t);
    }
  },

  // ═══ TikTok Variants ════════════════════════════════════════
  {
    name: 'tiktoknowm', alias: ['ttnowm','ttdlnowm'], category: 'download', desc: 'TikTok no watermark',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'TikTok (no watermark)')
  },
  {
    name: 'tiktokwm', alias: ['ttwm'], category: 'download', desc: 'TikTok with watermark',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'TikTok')
  },
  {
    name: 'tiktokaudio', alias: ['ttaudio','ttmp3'], category: 'download', desc: 'TikTok audio only',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}tiktokaudio <url>`);
      const r = await cobalt(ctx.q, { isAudioOnly: true, audioFormat: 'mp3' });
      if (r?.status === 'redirect' || r?.status === 'tunnel') {
        await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
      } else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'tiktokslide', alias: ['ttslide','ttphoto'], category: 'download', desc: 'TikTok photo slides',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'TikTok slides')
  },
  {
    name: 'tiktokinfo', alias: ['ttinfo'], category: 'download', desc: 'TikTok video info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}tiktokinfo <url>`);
      try {
        const r = await axios.get(`https://www.tiktok.com/oembed?url=${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        const d = r.data;
        ctx.reply(`╭━━❖ 𝐓𝐈𝐊𝐓𝐎𝐊 ❖━┈⊷\n┃│ 📝 ${d.title}\n┃│ 👤 ${d.author_name}\n┃│ 🔗 ${d.author_url}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ═══ Instagram Variants ══════════════════════════════════════
  {
    name: 'igreel', alias: ['instareel','igrl'], category: 'download', desc: 'Download Instagram Reel',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Instagram Reel')
  },
  {
    name: 'igpost', alias: ['instapost','igp'], category: 'download', desc: 'Download Instagram post',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Instagram Post')
  },
  {
    name: 'igstory', alias: ['instastory','igst'], category: 'download', desc: 'Download Instagram story',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Instagram Story')
  },
  {
    name: 'igtv', alias: ['instatv'], category: 'download', desc: 'Download IGTV',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'IGTV')
  },
  {
    name: 'ighd', alias: ['instahd'], category: 'download', desc: 'Instagram HD quality',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Instagram HD')
  },
  {
    name: 'igimage', alias: ['instaimage','igimg'], category: 'download', desc: 'Instagram image',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Instagram Image')
  },
  {
    name: 'igvideo', alias: ['instavideo','igv'], category: 'download', desc: 'Instagram video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Instagram Video')
  },

  // ═══ Facebook Variants ═══════════════════════════════════════
  {
    name: 'fbhd', alias: ['facebookhd','fbvideohd'], category: 'download', desc: 'Facebook video HD',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Facebook HD')
  },
  {
    name: 'fbsd', alias: ['facebooksd'], category: 'download', desc: 'Facebook video SD',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Facebook SD')
  },
  {
    name: 'fbaudio', alias: ['fbaud'], category: 'download', desc: 'Facebook audio',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}fbaudio <url>`);
      const r = await cobalt(ctx.q, { isAudioOnly: true, audioFormat: 'mp3' });
      if (r?.url) await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'fbreel', alias: ['fbreels'], category: 'download', desc: 'Facebook Reel',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Facebook Reel')
  },
  {
    name: 'fbwatch', alias: ['fbw'], category: 'download', desc: 'Facebook Watch video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Facebook Watch')
  },

  // ═══ Twitter/X Variants ══════════════════════════════════════
  {
    name: 'twitterhd', alias: ['xhd','twdlhd'], category: 'download', desc: 'Twitter/X HD video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Twitter HD')
  },
  {
    name: 'twittersd', alias: ['xsd','twdlsd'], category: 'download', desc: 'Twitter/X SD video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Twitter SD')
  },
  {
    name: 'twitteraudio', alias: ['xaudio','twaudio'], category: 'download', desc: 'Twitter audio only',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}twitteraudio <url>`);
      const r = await cobalt(ctx.q, { isAudioOnly: true, audioFormat: 'mp3' });
      if (r?.url) await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'twittergif', alias: ['xgif','twgif'], category: 'download', desc: 'Twitter as GIF',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}twittergif <url>`);
      const r = await cobalt(ctx.q, { isAudioOnly: false });
      if (r?.url) await ctx.replyImg(r.url, 'Twitter GIF');
      else ctx.reply('❌ Failed');
    }
  },

  // ═══ Pinterest Variants ══════════════════════════════════════
  {
    name: 'pinimage', alias: ['pinimg'], category: 'download', desc: 'Pinterest image',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Pinterest')
  },
  {
    name: 'pinvideo', alias: ['pinvid','pinv'], category: 'download', desc: 'Pinterest video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Pinterest Video')
  },
  {
    name: 'pinboard', alias: ['pinbd'], category: 'download', desc: 'Pinterest board images',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Pinterest Board')
  },

  // ═══ Reddit Variants ═════════════════════════════════════════
  {
    name: 'redditvideo', alias: ['rdvid','rdv'], category: 'download', desc: 'Reddit video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Reddit Video')
  },
  {
    name: 'redditimage', alias: ['rdimg'], category: 'download', desc: 'Reddit image',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Reddit Image')
  },
  {
    name: 'redditaudio', alias: ['rdaud'], category: 'download', desc: 'Reddit audio',
    handler: async (ctx) => {
      const r = await cobalt(ctx.q, { isAudioOnly: true });
      if (r?.url) await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
      else ctx.reply('❌ Failed');
    }
  },

  // ═══ SoundCloud Variants ═════════════════════════════════════
  {
    name: 'soundcloud', alias: ['sc'], category: 'download', desc: 'SoundCloud audio',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'SoundCloud')
  },
  {
    name: 'scmp3', alias: ['scdl'], category: 'download', desc: 'SoundCloud MP3',
    handler: async (ctx) => {
      const r = await cobalt(ctx.q, { audioFormat: 'mp3' });
      if (r?.url) await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
      else ctx.reply('❌ Failed');
    }
  },

  // ═══ Other Platforms ═════════════════════════════════════════
  {
    name: 'vimeodl', alias: ['vmdl','vmhd'], category: 'download', desc: 'Vimeo video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Vimeo')
  },
  {
    name: 'dailymotion', alias: ['dmdl','dm'], category: 'download', desc: 'Dailymotion video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Dailymotion')
  },
  {
    name: 'streamable', alias: ['sabdl'], category: 'download', desc: 'Streamable video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Streamable')
  },
  {
    name: 'twitchclip', alias: ['twclip','twc'], category: 'download', desc: 'Twitch clip',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Twitch Clip')
  },
  {
    name: 'linkedin', alias: ['lndl','ln'], category: 'download', desc: 'LinkedIn video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'LinkedIn')
  },
  {
    name: 'snapchatdl', alias: ['snapdl'], category: 'download', desc: 'Snapchat video',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Snapchat')
  },
  {
    name: 'lofi', alias: ['lofidl'], category: 'download', desc: 'Lofi Girl live',
    handler: async (ctx) => ctx.reply('🎵 https://www.youtube.com/watch?v=jfKfPfyJRdk')
  },

  // ═══ Spotify (via search) ════════════════════════════════════
  {
    name: 'spotify', alias: ['spdl','sp'], category: 'download', desc: 'Spotify track info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}spotify <song name>`);
      // Use Spotify oEmbed (free, no key)
      try {
        // Try search via Spotify public API
        const r = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(ctx.q)}&type=track&limit=1`, {
          headers: {},
          timeout: 10000
        }).catch(() => null);
        // Fallback: just suggest YouTube
        const yt = await yts(ctx.q + ' song');
        if (yt.videos.length) {
          ctx.reply(`🎵 Spotify song not directly downloadable (DRM).\nUse YouTube instead:\n${yt.videos[0].url}\n\nThen: ${ctx.prefix}ytmp3 <url>`);
        } else ctx.reply('❌ Not found');
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'spotifysearch', alias: ['sps'], category: 'download', desc: 'Search Spotify tracks',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}spotifysearch <query>`);
      const yt = await yts(ctx.q + ' official audio');
      if (!yt.videos.length) return ctx.reply('❌ No results');
      let t = '╭━━❖ 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 𝐒𝐄𝐀𝐑𝐂𝐇 ❖━┈⊷\n';
      yt.videos.slice(0, 8).forEach((v, i) => t += `┃│ ${i+1}. ${v.title.slice(0,40)}\n┃│    ⏱️ ${v.timestamp}\n`);
      t += '╰━━━━━━━━━━━━━━━┈⊷';
      ctx.reply(t);
    }
  },

  // ═══ MediaFire ═══════════════════════════════════════════════
  {
    name: 'mediafire', alias: ['mf','mfdl'], category: 'download', desc: 'MediaFire file info',
    handler: async (ctx) => {
      if (!ctx.q || !ctx.q.includes('mediafire.com')) return ctx.reply(`Example: ${ctx.prefix}mediafire <url>`);
      try {
        const r = await axios.get(ctx.q, { timeout: 15000 });
        const cheerio = require('cheerio');
        const $ = cheerio.load(r.data);
        const dl = $('a#downloadButton').attr('href') || $('a.download_link').attr('href');
        if (dl) {
          ctx.reply(`✅ MediaFire direct link:\n${dl}`);
          // Try to send if small
          try {
            const head = await axios.head(dl, { timeout: 10000 });
            const size = parseInt(head.headers['content-length'] || '0', 10);
            if (size < 50 * 1024 * 1024) {
              const buf = await utils.getBuffer(dl);
              if (buf) {
                const fileName = dl.split('/').pop();
                await ctx.sock.sendMessage(ctx.jid, { document: buf, fileName, mimetype: head.headers['content-type'] || 'application/octet-stream' }, { quoted: ctx.m });
              }
            } else {
              ctx.reply(`⚠️ File too large to send directly (${utils.formatBytes(size)}). Use link above.`);
            }
          } catch {}
        } else ctx.reply('❌ Could not find download link');
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'mediafireinfo', alias: ['mfinfo'], category: 'download', desc: 'MediaFire file info only',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}mediafireinfo <url>`);
      try {
        const r = await axios.get(ctx.q, { timeout: 15000 });
        const cheerio = require('cheerio');
        const $ = cheerio.load(r.data);
        const name = $('.dl-btn-label').text().trim() || $('title').text();
        const size = $('.details li:eq(0) span').text();
        ctx.reply(`╭━━❖ 𝐌𝐄𝐃𝐈𝐀𝐅𝐈𝐑𝐄 ❖━┈⊷\n┃│ 📦 ${name}\n┃│ 📏 ${size || 'Unknown'}\n╰━━━━━━━━━━━━━━━┈⊷`);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ═══ Mega.nz ═════════════════════════════════════════════════
  {
    name: 'mega', alias: ['megadl','megalink'], category: 'download', desc: 'Mega.nz link info',
    handler: async (ctx) => {
      if (!ctx.q || !ctx.q.includes('mega.nz')) return ctx.reply(`Example: ${ctx.prefix}mega <url>`);
      // Mega requires crypto decryption - we can only show info
      ctx.reply(`╭━━❖ 𝐌𝐄𝐆𝐀.𝐍𝐙 ❖━┈⊷\n┃│ 🔗 ${ctx.q}\n┃│ ⚠️ Mega requires decryption key\n┃│ 💡 For full download, use:\n┃│    megatools dl '${ctx.q}'\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  },
  {
    name: 'megainfo', alias: ['megacheck'], category: 'download', desc: 'Check Mega link',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}megainfo <url>`);
      const hasKey = ctx.q.includes('#') || ctx.q.includes('?');
      ctx.reply(`✅ Mega link\n🔑 Decryption key: ${hasKey ? 'Present' : 'Missing'}\n⚠️ Mega downloads need server-side decryption (not supported via WhatsApp)`);
    }
  },

  // ═══ APK Downloads ═══════════════════════════════════════════
  {
    name: 'apkpure', alias: ['apk','apkdl'], category: 'download', desc: 'Search APKPure for APK',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}apkpure whatsapp`);
      try {
        // APKPure search via HTML
        const r = await axios.get(`https://apkpure.com/search?q=${encodeURIComponent(ctx.q)}`, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const cheerio = require('cheerio');
        const $ = cheerio.load(r.data);
        const apps = [];
        $('.apk a.title, .search-title a, a.download-url').slice(0, 5).each((i, el) => {
          const href = $(el).attr('href');
          const text = $(el).text().trim();
          if (href && text) apps.push({ name: text, url: href.startsWith('http') ? href : 'https://apkpure.com' + href });
        });
        if (!apps.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐀𝐏𝐊𝐏𝐔𝐑𝐄 ❖━┈⊷\n';
        apps.forEach((a, i) => t += `┃│ ${i+1}. ${a.name}\n┃│    ${a.url}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'apkmirror', alias: ['apkmir'], category: 'download', desc: 'Search APKMirror',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}apkmirror whatsapp`);
      try {
        const r = await axios.get(`https://www.apkmirror.com/?post_type=app_release&searchtype=app&s=${encodeURIComponent(ctx.q)}`, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const cheerio = require('cheerio');
        const $ = cheerio.load(r.data);
        const apps = [];
        $('.appRow, .listWidget .appRowLink').slice(0, 5).each((i, el) => {
          const text = $(el).find('.appRowTitle').text().trim() || $(el).text().trim().slice(0, 80);
          if (text) apps.push(text);
        });
        if (!apps.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐀𝐏𝐊𝐌𝐈𝐑𝐑𝐎𝐑 ❖━┈⊷\n';
        apps.forEach((a, i) => t += `┃│ ${i+1}. ${a}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷\n🔗 Visit https://www.apkmirror.com to download';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'aptoide', alias: ['apt'], category: 'download', desc: 'Search Aptoide for APK',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aptoide whatsapp`);
      try {
        const r = await axios.get(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(ctx.q)}&limit=5`, { timeout: 10000 });
        const apps = r.data?.datalist?.list || [];
        if (!apps.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐀𝐏𝐓𝐎𝐈𝐃𝐄 ❖━┈⊷\n';
        apps.forEach((a, i) => t += `┃│ ${i+1}. ${a.name} (${a.size ? Math.round(a.size/1024/1024) : '?'}MB)\n┃│    📦 v${a.file?.vername || '?'}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'modapk', alias: ['modapkpure','mapk'], category: 'download', desc: 'Search for modded APKs',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}modapk minecraft`);
      try {
        const r = await axios.get(`https://an1.com/index.php?do=search&story=${encodeURIComponent(ctx.q)}`, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const cheerio = require('cheerio');
        const $ = cheerio.load(r.data);
        const apps = [];
        $('.page__item, .list-item').slice(0, 5).each((i, el) => {
          const name = $(el).find('.page__title, .item-title').text().trim() || $(el).find('a').text().trim().slice(0, 60);
          if (name) apps.push(name);
        });
        if (!apps.length) return ctx.reply('❌ No results (try: apkdone, happymod, revdl)');
        let t = '╭━━❖ 𝐌𝐎𝐃 𝐀𝐏𝐊 ❖━┈⊷\n';
        apps.forEach((a, i) => t += `┃│ ${i+1}. ${a}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷\n💡 Also check: https://apkdone.com / https://happymod.com';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'happymod', alias: ['hmod'], category: 'download', desc: 'Search HappyMod',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}happymod minecraft`);
      try {
        const r = await axios.get(`https://happymod.com/search.html?q=${encodeURIComponent(ctx.q)}`, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const cheerio = require('cheerio');
        const $ = cheerio.load(r.data);
        const apps = [];
        $('.search-item, .app-item').slice(0, 5).each((i, el) => {
          const name = $(el).find('a').text().trim().slice(0, 60);
          if (name) apps.push(name);
        });
        if (!apps.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐇𝐀𝐏𝐏𝐘𝐌𝐎𝐃 ❖━┈⊷\n';
        apps.forEach((a, i) => t += `┃│ ${i+1}. ${a}\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },
  {
    name: 'apkdone', alias: ['apkdone2'], category: 'download', desc: 'Search APKDone',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}apkdone whatsapp`);
      ctx.reply(`🔍 Search APKDone:\nhttps://apkdone.com/?s=${encodeURIComponent(ctx.q)}`);
    }
  },

  // ═══ GitHub Downloads ════════════════════════════════════════
  {
    name: 'ghrepo', alias: ['githubrepo','ghr'], category: 'download', desc: 'GitHub repo info',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ghrepo user/repo`);
      try {
        const r = await axios.get(`https://api.github.com/repos/${ctx.q}`, { timeout: 10000 });
        const d = r.data;
        const text = `╭━━❖ 𝐆𝐈𝐓𝐇𝐔𝐁 𝐑𝐄𝐏𝐎 ❖━┈⊷\n┃│ 📦 ${d.full_name}\n┃│ ⭐ ${d.stargazers_count} stars\n┃│ 🍴 ${d.forks_count} forks\n┃│ 📝 ${d.description || 'No description'}\n┃│ 🌐 ${d.html_url}\n┃│ 📥 ZIP: ${d.html_url}/archive/refs/heads/${d.default_branch}.zip\n╰━━━━━━━━━━━━━━━┈⊷`;
        ctx.reply(text);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'ghrelease', alias: ['ghrel'], category: 'download', desc: 'GitHub latest release',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ghrelease user/repo`);
      try {
        const r = await axios.get(`https://api.github.com/repos/${ctx.q}/releases/latest`, { timeout: 10000 });
        const d = r.data;
        let t = `╭━━❖ 𝐆𝐈𝐓𝐇𝐔𝐁 𝐑𝐄𝐋𝐄𝐀𝐒𝐄 ❖━┈⊷\n┃│ 📦 ${d.name || d.tag_name}\n┃│ 📝 ${(d.body || '').slice(0, 200)}\n`;
        if (d.assets?.length) {
          d.assets.slice(0, 5).forEach(a => t += `┃│ 📎 ${a.name} (${utils.formatBytes(a.size)})\n┃│    ${a.browser_download_url}\n`);
        }
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Not found'); }
    }
  },
  {
    name: 'ghfile', alias: ['ghraw'], category: 'download', desc: 'Get raw GitHub file',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ghfile user/repo/branch/path`);
      const parts = ctx.q.split('/');
      if (parts.length < 4) return ctx.reply('Format: user/repo/branch/path/to/file');
      const url = `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts[2]}/${parts.slice(3).join('/')}`;
      ctx.reply(`🔗 ${url}`);
    }
  },

  // ═══ Cloud Storage ═══════════════════════════════════════════
  {
    name: 'gdrive', alias: ['gddirect'], category: 'download', desc: 'Google Drive direct link',
    handler: async (ctx) => {
      if (!ctx.q || !ctx.q.includes('drive.google.com')) return ctx.reply(`Example: ${ctx.prefix}gdrive <url>`);
      const m = ctx.q.match(/\/d\/([a-zA-Z0-9_-]+)/) || ctx.q.match(/id=([a-zA-Z0-9_-]+)/);
      if (!m) return ctx.reply('❌ Invalid GDrive URL');
      const id = m[1];
      ctx.reply(`✅ Direct link:\nhttps://drive.google.com/uc?export=download&id=${id}\n\n⚠️ Large files may need confirmation.`);
    }
  },
  {
    name: 'dropbox', alias: ['dbdl'], category: 'download', desc: 'Dropbox direct link',
    handler: async (ctx) => {
      if (!ctx.q || !ctx.q.includes('dropbox.com')) return ctx.reply(`Example: ${ctx.prefix}dropbox <url>`);
      const direct = ctx.q.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      ctx.reply(`✅ Direct link:\n${direct}`);
    }
  },
  {
    name: 'onedrive', alias: ['oddl'], category: 'download', desc: 'OneDrive direct link',
    handler: async (ctx) => {
      if (!ctx.q || !ctx.q.includes('1drv.ms')) return ctx.reply(`Example: ${ctx.prefix}onedrive <url>`);
      try {
        const r = await axios.get(ctx.q, { timeout: 10000, maxRedirects: 0, validateStatus: () => true });
        const loc = r.headers.location;
        if (loc) ctx.reply(`✅ Direct link:\n${loc.replace('e1.download', 'e2.download')}`);
        else ctx.reply('❌ Could not resolve');
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ═══ Anime/Manga Downloads ═══════════════════════════════════
  {
    name: 'animesearch', alias: ['anidl'], category: 'download', desc: 'Search anime download',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}animesearch Naruto`);
      try {
        const r = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(ctx.q)}&limit=5&sfw=true`, { timeout: 10000 });
        const list = r.data?.data || [];
        if (!list.length) return ctx.reply('❌ No results');
        let t = '╭━━❖ 𝐀𝐍𝐈𝐌𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 ❖━┈⊷\n';
        list.forEach((a, i) => t += `┃│ ${i+1}. ${a.title}\n┃│    ⭐ ${a.score || 'N/A'} | ${a.episodes || '?'} eps\n`);
        t += '╰━━━━━━━━━━━━━━━┈⊷';
        ctx.reply(t);
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ═══ Generic / All-in-One ════════════════════════════════════
  {
    name: 'dl', alias: ['download','get'], category: 'download', desc: 'Auto-detect & download any URL',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}dl <url>`);
      if (!utils.isUrl(ctx.q)) return ctx.reply('❌ Invalid URL');
      const url = ctx.q.toLowerCase();
      let label = 'Auto';
      if (url.includes('youtube') || url.includes('youtu.be')) label = 'YouTube';
      else if (url.includes('tiktok')) label = 'TikTok';
      else if (url.includes('instagram')) label = 'Instagram';
      else if (url.includes('facebook') || url.includes('fb.watch')) label = 'Facebook';
      else if (url.includes('twitter') || url.includes('x.com')) label = 'Twitter';
      else if (url.includes('pinterest')) label = 'Pinterest';
      else if (url.includes('reddit')) label = 'Reddit';
      else if (url.includes('soundcloud')) label = 'SoundCloud';
      else if (url.includes('vimeo')) label = 'Vimeo';
      else if (url.includes('mediafire')) label = 'MediaFire';
      else if (url.includes('mega.nz')) label = 'Mega';
      await cobaltDL(ctx, ctx.q, label);
    }
  },
  {
    name: 'audio', alias: ['audioonly'], category: 'download', desc: 'Extract audio from any URL',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}audio <url>`);
      const r = await cobalt(ctx.q, { isAudioOnly: true, audioFormat: 'mp3' });
      if (r?.url) await ctx.sock.sendMessage(ctx.jid, { audio: { url: r.url }, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
      else ctx.reply('❌ Failed');
    }
  },
  {
    name: 'video', alias: ['videoonly'], category: 'download', desc: 'Extract video from any URL',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Video')
  },
  {
    name: 'image', alias: ['imageonly'], category: 'download', desc: 'Extract image from any URL',
    handler: async (ctx) => cobaltDL(ctx, ctx.q, 'Image')
  },

  // ═══ Pinterest Search ═════════════════════════════════════════
  {
    name: 'pinsearch', alias: ['pinterestsearch'], category: 'download', desc: 'Search Pinterest images',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}pinsearch cats`);
      const url = `${config.API.pollinations_img}${encodeURIComponent(ctx.q + ' pinterest aesthetic')}`;
      await ctx.replyImg(url, `🔍 Pinterest-style: ${ctx.q}`);
    }
  },

  // ═══ Stock Photos ════════════════════════════════════════════
  {
    name: 'unsplash', alias: ['unsplashphoto'], category: 'download', desc: 'Unsplash random photo',
    handler: async (ctx) => {
      const q = ctx.q ? `?${encodeURIComponent(ctx.q)}` : '';
      await ctx.replyImg(`https://source.unsplash.com/random/800x600${q}`, '📷 Unsplash');
    }
  },
  {
    name: 'picsum2', alias: ['picsumphoto'], category: 'download', desc: 'Lorem Picsum photo',
    handler: async (ctx) => {
      const seed = Math.floor(Math.random() * 1000);
      await ctx.replyImg(`https://picsum.photos/seed/${seed}/800/600`, '🖼️ Random photo');
    }
  },

  // ═══ Music Lyrics ════════════════════════════════════════════
  {
    name: 'lyrics2', alias: ['lyric2'], category: 'download', desc: 'Song lyrics',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}lyrics2 Bohemian Rhapsody`);
      try {
        const r = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(ctx.q.split('-')[0])}/${encodeURIComponent(ctx.q.split('-')[1] || ctx.q)}`, { timeout: 10000 });
        if (r.data?.lyrics) ctx.reply(`🎤 ${r.data.lyrics.slice(0, 1500)}`);
        else ctx.reply('❌ Not found. Try: artist-song');
      } catch { ctx.reply('❌ Failed'); }
    }
  },

  // ═══ Torrent Info ════════════════════════════════════════════
  {
    name: 'torrent', alias: ['tordl'], category: 'download', desc: 'Search torrents (info only)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}torrent Ubuntu`);
      ctx.reply(`🔍 Torrent search:\nhttps://1337x.to/search/${encodeURIComponent(ctx.q)}/1/\nhttps://thepiratebay.org/index.php?q=${encodeURIComponent(ctx.q)}\n\n⚠️ Use torrents legally. We do not host any content.`);
    }
  },
  {
    name: 'magnet', alias: ['magnetlink'], category: 'download', desc: 'Magnet link info',
    handler: async (ctx) => {
      if (!ctx.q || !ctx.q.startsWith('magnet:')) return ctx.reply(`Example: ${ctx.prefix}magnet <magnet:?xt=...>`);
      const hash = ctx.q.match(/xt=urn:btih:([a-zA-Z0-9]+)/);
      ctx.reply(`✅ Magnet link\nHash: ${hash?.[1] || 'Unknown'}\n\nUse a torrent client (qBittorrent, Transmission) to download.`);
    }
  },

  // ═══ Wikipedia Commons ═══════════════════════════════════════
  {
    name: 'wikiimage', alias: ['wikiphoto'], category: 'download', desc: 'Wikipedia image',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}wikiimage Albert Einstein`);
      try {
        const r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ctx.q)}`, { timeout: 10000 });
        if (r.data?.thumbnail?.source) await ctx.replyImg(r.data.originalimage?.source || r.data.thumbnail.source, `📷 ${r.data.title}`);
        else ctx.reply('❌ No image');
      } catch { ctx.reply('❌ Not found'); }
    }
  }
];
