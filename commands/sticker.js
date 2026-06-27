/**
 * Ulric-X MD - Sticker commands
 * Creates stickers from images/videos/replies, plus many text + emoji sticker effects.
 * Uses sharp for image manipulation (free, no API).
 */
const sharp = require('sharp');
const utils = require('../lib/utils');
const config= require('../config');

async function makeSticker(ctx, buffer, opts = {}) {
  if (!buffer) return ctx.reply('❌ No image. Reply to an image or send one with caption.');
  try {
    const webp = await sharp(buffer, { failOnError: false })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();
    await ctx.sock.sendMessage(ctx.jid, {
      sticker: webp,
      packname: opts.packname || 'Ulric-X MD',
      author: opts.author || 'ULRIC X SHAH'
    }, { quoted: ctx.m });
  } catch (e) { ctx.reply('❌ ' + e.message); }
}

module.exports = [
  {
    name: 'sticker', alias: ['s','stiker','st'], category: 'sticker', desc: 'Create sticker from image',
    handler: async (ctx) => {
      const buf = await ctx.downloadMsg().catch(()=>null) || await ctx.downloadQuoted().catch(()=>null);
      await makeSticker(ctx, buf);
    }
  },
  {
    name: 'take', alias: ['steal','swm','stickerwm'], category: 'sticker', desc: 'Recreate sticker with custom pack/author',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      const [p, a] = (ctx.q || 'Ulric-X|ULRIC X SHAH').split('|');
      await makeSticker(ctx, buf, { packname: p, author: a });
    }
  },
  {
    name: 'smemecaption', alias: ['smeme','stickermeme'], category: 'sticker', desc: 'Sticker with text caption',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}smeme Hello|World`);
      const buf = await ctx.downloadQuoted().catch(()=>null);
      const [top, bottom] = ctx.q.split('|');
      // Use a simple approach: add text via image magick
      try {
        const composite = await sharp(buf).resize(512,512,{fit:'contain'}).composite([{
          input: Buffer.from(`<svg width="512" height="512"><text x="50%" y="10%" font-family="Arial" font-size="40" fill="white" stroke="black" stroke-width="2" text-anchor="middle">${top||''}</text><text x="50%" y="90%" font-family="Arial" font-size="40" fill="white" stroke="black" stroke-width="2" text-anchor="middle">${bottom||''}</text></svg>`),
          gravity: 'center'
        }]).webp().toBuffer();
        await ctx.replySticker(composite);
      } catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'toimg', alias: ['toimage'], category: 'sticker', desc: 'Convert sticker to image',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to a sticker');
      const png = await sharp(buf, { failOnError: false }).png().toBuffer();
      await ctx.sock.sendMessage(ctx.jid, { image: png }, { quoted: ctx.m });
    }
  },
  {
    name: 'tomp3', alias: ['toaudio'], category: 'sticker', desc: 'Convert video/audio to mp3',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to a video/audio');
      // Use ffmpeg
      const { exec } = require('child_process');
      const fs = require('fs'); const os = require('os');
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.in`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.mp3`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -vn -acodec libmp3lame -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message);
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.m });
        fs.unlinkSync(inPath); fs.unlinkSync(outPath);
      });
    }
  },
  {
    name: 'tovideo', alias: ['tomp4'], category: 'sticker', desc: 'Convert sticker/audio to video',
    handler: async (ctx) => {
      const buf = await ctx.downloadQuoted().catch(()=>null);
      if (!buf) return ctx.reply('Reply to a sticker or audio');
      const { exec } = require('child_process');
      const fs = require('fs'); const os = require('os');
      const inPath = `${os.tmpdir()}/ulric-${Date.now()}.webp`;
      const outPath = `${os.tmpdir()}/ulric-${Date.now()}.mp4`;
      fs.writeFileSync(inPath, buf);
      exec(`ffmpeg -i "${inPath}" -y "${outPath}"`, (e) => {
        if (e) return ctx.reply('❌ ' + e.message);
        const out = fs.readFileSync(outPath);
        ctx.sock.sendMessage(ctx.jid, { video: out }, { quoted: ctx.m });
        fs.unlinkSync(inPath); fs.unlinkSync(outPath);
      });
    }
  },
  // Generate text-based stickers with different styles (uses Pollinations AI free)
  {
    name: 'attp', alias: ['attp1'], category: 'sticker', desc: 'Animated text sticker',
    handler: async (ctx) => textSticker(ctx, 'https://api.xteam.xyz/attp?text=', false)
  },
  {
    name: 'ttp', alias: ['ttp1'], category: 'sticker', desc: 'Text to sticker',
    handler: async (ctx) => textSticker(ctx, 'https://hurterir.my.id/api/textmaker/ttp?text=', true)
  },
  // Emoji stickers - many of them, each emoji generates a sticker
  // We'll programmatically register many emoji-sticker commands
];

// Helper for text-to-sticker via simple API
async function textSticker(ctx, url, isPng) {
  if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}${ctx.command} Hello`);
  const buf = await utils.getBuffer(url + encodeURIComponent(ctx.q));
  if (!buf) return ctx.reply('❌ Failed');
  if (isPng) {
    const webp = await sharp(buf).webp().toBuffer();
    await ctx.replySticker(webp);
  } else {
    await ctx.replySticker(buf);
  }
}

// ─── Programmatic emoji sticker commands ───────────────────────────
// Each emoji becomes a sticker command using Pollinations or direct emoji render
const emojis = ['😀','😂','😍','🥰','😎','🤩','😘','😇','🤔','😭','😡','😱','🥳','🤯','🤝','👍','👎','🙏','👏','💪','🔥','💯','✨','⭐','🌟','💥','🎉','🎁','🎊','🎈','🌹','🌸','🌺','🌻','🌷','💐','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','💕','💖','💗','💘','💝','💌','💋','👑','💎','🏆','🥇','🥈','🥉','🏅','🎖️','🔱','⚜️','💪','🦾','🦿','👅','👀','👁️','👄','💋','💧','💦','💨','🌪️','🌈','☀️','🌙','⚡','❄️','🌊','🔥','🌋','⛰️','🏔️','🗻','🏕️','🏖️','🏜️','🗺️','🧭','🍎','🍊','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🥔','🍠','🥐','🥯','🍞','🥖','🧀','🥚','🍳','🥞','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🌮','🌯','🥙','🍜','🍲','🍝','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍯','🥛','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥃','🍸','🍹','🍷','🥢','🍴','🥄','🏺','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩','🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍️','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','⛽','🚧','🚦','🚥','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🕍','🛕','🕋','⛩️','🛤️','🛣️','🗾','🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌌','🌉','🌁','⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🧰','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','盾','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪒','🧽','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🖼️','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'];

// Each emoji registers a hidden sticker command
const emojiCmds = emojis.slice(0, 200).map((emoji, i) => ({
  name: `emoji${i+1}`,
  alias: [`e${i+1}`],
  category: 'sticker',
  desc: `Sticker for ${emoji}`,
  handler: async (ctx) => {
    // Use Pollinations to generate an image with the emoji
    const url = `${config.API.pollinations_img}${encodeURIComponent(emoji + ' sticker, high quality, white background')}`;
    const buf = await utils.getBuffer(url);
    if (!buf) return ctx.reply('❌ Failed');
    const webp = await sharp(buf).resize(512,512,{fit:'contain'}).webp().toBuffer();
    await ctx.replySticker(webp);
  }
}));

// Sticker effects - filters applied via sharp
const effects = [
  ['sepia',  async (b) => sharp(b).resize(512,512,{fit:'contain'}).modulate({saturation:1.2}).tint({r:112,g:66,b:20}).webp().toBuffer()],
  ['grayscale', async (b) => sharp(b).resize(512,512,{fit:'contain'}).grayscale().webp().toBuffer()],
  ['invert',    async (b) => sharp(b).resize(512,512,{fit:'contain'}).negate().webp().toBuffer()],
  ['blur',      async (b) => sharp(b).resize(512,512,{fit:'contain'}).blur(5).webp().toBuffer()],
  ['sharpen',   async (b) => sharp(b).resize(512,512,{fit:'contain'}).sharpen().webp().toBuffer()],
  ['border',    async (b) => sharp(b).resize(508,508,{fit:'contain'}).extend({top:2,bottom:2,left:2,right:2,background:'#000'}).webp().toBuffer()],
  ['circle',    async (b) => sharp(b).resize(512,512,{fit:'cover'}).composite([{input: Buffer.from(`<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="white"/></svg>`), blend: 'dest-in'}]).webp().toBuffer()],
  ['rotate',    async (b) => sharp(b).resize(512,512,{fit:'contain'}).rotate(90).webp().toBuffer()],
  ['flip',      async (b) => sharp(b).resize(512,512,{fit:'contain'}).flip().webp().toBuffer()],
  ['flop',      async (b) => sharp(b).resize(512,512,{fit:'contain'}).flop().webp().toBuffer()],
  ['bright',    async (b) => sharp(b).resize(512,512,{fit:'contain'}).modulate({brightness:1.5}).webp().toBuffer()],
  ['dark',      async (b) => sharp(b).resize(512,512,{fit:'contain'}).modulate({brightness:0.5}).webp().toBuffer()],
  ['tintred',   async (b) => sharp(b).resize(512,512,{fit:'contain'}).tint({r:255,g:0,b:0}).webp().toBuffer()],
  ['tintblue',  async (b) => sharp(b).resize(512,512,{fit:'contain'}).tint({r:0,g:0,b:255}).webp().toBuffer()],
  ['tintgreen', async (b) => sharp(b).resize(512,512,{fit:'contain'}).tint({r:0,g:255,b:0}).webp().toBuffer()]
];

const effectCmds = effects.map(([name, fn]) => ({
  name: `s${name}`, alias: [`stiker${name}`, `sticker${name}`], category: 'sticker', desc: `Sticker effect ${name}`,
  handler: async (ctx) => {
    const buf = await ctx.downloadQuoted().catch(()=>null) || await ctx.downloadMsg().catch(()=>null);
    if (!buf) return ctx.reply('Reply to an image');
    try { const out = await fn(buf); await ctx.replySticker(out); }
    catch (e) { ctx.reply('❌ ' + e.message); }
  }
}));

// Append programmatic commands
module.exports.push(...emojiCmds, ...effectCmds);
