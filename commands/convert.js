/**
 * Ulric-X MD - Conversion commands (units, media, etc.)
 */
const utils = require('../lib/utils');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const sharp = require('sharp');

module.exports = [
  {
    name: 'tojpg', alias: ['tojpeg'], category: 'convert', desc: 'Convert image to JPG',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).jpeg({ quality: 90 }).toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✅ Converted to JPG' }, { quoted: ctx.m });
    }
  },
  {
    name: 'topng', alias: [], category: 'convert', desc: 'Convert image to PNG',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).png().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✅ Converted to PNG' }, { quoted: ctx.m });
    }
  },
  {
    name: 'towebp', alias: [], category: 'convert', desc: 'Convert image to WebP',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).webp().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✅ Converted to WebP' }, { quoted: ctx.m });
    }
  },
  {
    name: 'resize', alias: ['scale'], category: 'convert', desc: 'Resize image',
    handler: async (ctx) => {
      const [w, h] = (ctx.args[0] || '500x500').split('x').map(n => parseInt(n, 10));
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).resize(w||500, h||500, { fit: 'inside' }).jpeg().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: `✅ Resized to ${w||500}x${h||500}` }, { quoted: ctx.m });
    }
  },
  {
    name: 'crop', alias: [], category: 'convert', desc: 'Crop image',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).resize(500, 500, { fit: 'cover' }).jpeg().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✅ Cropped to square' }, { quoted: ctx.m });
    }
  },
  {
    name: 'rotate', alias: ['rot'], category: 'convert', desc: 'Rotate image',
    handler: async (ctx) => {
      const deg = parseInt(ctx.args[0], 10) || 90;
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).rotate(deg).jpeg().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: `✅ Rotated ${deg}°` }, { quoted: ctx.m });
    }
  },
  {
    name: 'flip', alias: ['vflip'], category: 'convert', desc: 'Flip image vertically',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).flip().jpeg().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✅ Flipped' }, { quoted: ctx.m });
    }
  },
  {
    name: 'mirror', alias: ['hflip','flop'], category: 'convert', desc: 'Mirror image',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).flop().jpeg().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: '✅ Mirrored' }, { quoted: ctx.m });
    }
  },
  {
    name: 'compress', alias: ['optimize'], category: 'convert', desc: 'Compress image',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an image');
      const out = await sharp(buf).jpeg({ quality: 50 }).toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: out, caption: `✅ Compressed: ${utils.formatBytes(buf.length)} → ${utils.formatBytes(out.length)}` }, { quoted: ctx.m });
    }
  },
  {
    name: 'tovoice', alias: ['ptt'], category: 'convert', desc: 'Convert audio to voice note',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to an audio');
      await ctx.sock.sendMessage(ctx.jid, { audio: buf, mimetype: 'audio/mpeg', ptt: true }, { quoted: ctx.m });
    }
  },
  {
    name: 'toaudio2', alias: ['mp3'], category: 'convert', desc: 'Convert to MP3 audio',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to media');
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.mp3`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -vn -acodec libmp3lame -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message);
        ctx.sock.sendMessage(ctx.jid, { audio: fs.readFileSync(outPath), mimetype: 'audio/mpeg' }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  },
  {
    name: 'togif', alias: ['gif'], category: 'convert', desc: 'Convert video to GIF',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to a video');
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.mp4`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.gif`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -vf "fps=10,scale=320:-1" -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message);
        ctx.sock.sendMessage(ctx.jid, { video: fs.readFileSync(outPath), caption: '✅ GIF', gifPlayback: true }, { quoted: ctx.m });
        try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
      });
    }
  },
  // Unit conversion commands
  {
    name: 'length', alias: ['distance'], category: 'convert', desc: 'Length conversion',
    handler: async (ctx) => {
      const [val, from, to] = (ctx.q || '').split(' ');
      if (!val || !from || !to) return ctx.reply(`Example: ${ctx.prefix}length 1 km mi`);
      const units = { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, ft:0.3048, in:0.0254, yd:0.9144 };
      const v = parseFloat(val);
      const fromM = v * (units[from.toLowerCase()] || 1);
      const result = fromM / (units[to.toLowerCase()] || 1);
      ctx.reply(`📏 ${v} ${from} = ${result.toFixed(4)} ${to}`);
    }
  },
  {
    name: 'weight', alias: ['mass'], category: 'convert', desc: 'Weight conversion',
    handler: async (ctx) => {
      const [val, from, to] = (ctx.q || '').split(' ');
      if (!val || !from || !to) return ctx.reply(`Example: ${ctx.prefix}weight 1 kg lb`);
      const units = { g:1, kg:1000, mg:0.001, lb:453.592, oz:28.3495, ton:1000000 };
      const v = parseFloat(val);
      const fromG = v * (units[from.toLowerCase()] || 1);
      const result = fromG / (units[to.toLowerCase()] || 1);
      ctx.reply(`⚖️ ${v} ${from} = ${result.toFixed(4)} ${to}`);
    }
  },
  {
    name: 'temperature', alias: ['temp'], category: 'convert', desc: 'Temperature conversion',
    handler: async (ctx) => {
      const [val, from, to] = (ctx.q || '').split(' ');
      if (!val || !from || !to) return ctx.reply(`Example: ${ctx.prefix}temperature 100 C F`);
      let v = parseFloat(val);
      const f = from.toUpperCase(), t = to.toUpperCase();
      let celsius;
      if (f === 'C') celsius = v;
      else if (f === 'F') celsius = (v - 32) * 5/9;
      else if (f === 'K') celsius = v - 273.15;
      else return ctx.reply('Invalid from unit');
      let result;
      if (t === 'C') result = celsius;
      else if (t === 'F') result = celsius * 9/5 + 32;
      else if (t === 'K') result = celsius + 273.15;
      else return ctx.reply('Invalid to unit');
      ctx.reply(`🌡️ ${v}°${f} = ${result.toFixed(2)}°${t}`);
    }
  },
  {
    name: 'speedconv', alias: ['speed2'], category: 'convert', desc: 'Speed conversion',
    handler: async (ctx) => {
      const [val, from, to] = (ctx.q || '').split(' ');
      if (!val || !from || !to) return ctx.reply(`Example: ${ctx.prefix}speedconv 100 kmh mph`);
      const units = { ms:1, kmh:0.277778, mph:0.44704, knot:0.514444 };
      const v = parseFloat(val);
      const fromMs = v * (units[from.toLowerCase()] || 1);
      const result = fromMs / (units[to.toLowerCase()] || 1);
      ctx.reply(`💨 ${v} ${from} = ${result.toFixed(4)} ${to}`);
    }
  },
  {
    name: 'volume', alias: ['vol'], category: 'convert', desc: 'Volume conversion',
    handler: async (ctx) => {
      const [val, from, to] = (ctx.q || '').split(' ');
      if (!val || !from || !to) return ctx.reply(`Example: ${ctx.prefix}volume 1 l gal`);
      const units = { ml:0.001, l:1, gal:3.78541, qt:0.946353, pt:0.473176, cup:0.236588, floz:0.0295735 };
      const v = parseFloat(val);
      const fromL = v * (units[from.toLowerCase()] || 1);
      const result = fromL / (units[to.toLowerCase()] || 1);
      ctx.reply(`🥤 ${v} ${from} = ${result.toFixed(4)} ${to}`);
    }
  }
];
