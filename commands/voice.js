/**
 * Ulric-X MD - Voice / TTS commands
 * Uses google-tts-api (free, no key) to generate voice notes in 50+ languages.
 */
const googleTTS = require('google-tts-api');
const utils     = require('../lib/utils');
const config    = require('../config');

// Language presets: code -> [name, alias]
const LANGS = [
  ['en','English','eng'], ['ur','Urdu','urdu'], ['hi','Hindi','hindi'], ['ar','Arabic','arabic'],
  ['bn','Bengali','bengali'], ['fa','Persian','farsi'], ['fr','French','french'], ['es','Spanish','spanish'],
  ['pt','Portuguese','portuguese'], ['ru','Russian','russian'], ['de','German','german'], ['it','Italian','italian'],
  ['tr','Turkish','turkish'], ['id','Indonesian','indo'], ['ms','Malay','malay'], ['nl','Dutch','dutch'],
  ['pl','Polish','polish'], ['ja','Japanese','japanese'], ['ko','Korean','korean'], ['zh-CN','Chinese','chinese'],
  ['th','Thai','thai'], ['vi','Vietnamese','vietnamese'], ['fil','Filipino','filipino'], ['sv','Swedish','swedish'],
  ['no','Norwegian','norwegian'], ['da','Danish','danish'], ['fi','Finnish','finnish'], ['cs','Czech','czech'],
  ['sk','Slovak','slovak'], ['hu','Hungarian','hungarian'], ['ro','Romanian','romanian'], ['bg','Bulgarian','bulgarian'],
  ['hr','Croatian','croatian'], ['sr','Serbian','serbian'], ['sl','Slovenian','slovenian'], ['uk','Ukrainian','ukrainian'],
  ['el','Greek','greek'], ['he','Hebrew','hebrew'], ['sw','Swahili','swahili'], ['af','Afrikaans','afrikaans'],
  ['ta','Tamil','tamil'], ['te','Telugu','telugu'], ['ml','Malayalam','malayalam'], ['kn','Kannada','kannada'],
  ['mr','Marathi','marathi'], ['gu','Gujarati','gujarati'], ['pa','Punjabi','punjabi'], ['ne','Nepali','nepali'],
  ['si','Sinhala','sinhala'], ['my','Burmese','burmese'], ['km','Khmer','khmer'], ['lo','Lao','lao'],
  ['ka','Georgian','georgian'], ['am','Amharic','amharic'], ['cy','Welsh','welsh'], ['ga','Irish','irish'],
  ['is','Icelandic','icelandic'], ['lv','Latvian','latvian'], ['lt','Lithuanian','lithuanian'], ['et','Estonian','estonian']
];

// Base TTS command (default English)
module.exports = [
  {
    name: 'tts', alias: ['speak','say','voice'], category: 'voice', desc: 'Text to speech (English)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}tts Hello world`);
      await sendTTS(ctx, ctx.q, 'en');
    }
  },
  {
    name: 'ttsur', alias: ['urdutts','urduvoice'], category: 'voice', desc: 'Urdu TTS',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ttsur آپ کیسے ہیں`);
      await sendTTS(ctx, ctx.q, 'ur');
    }
  },
  {
    name: 'ttshi', alias: ['hinditts'], category: 'voice', desc: 'Hindi TTS',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ttshi नमस्ते`);
      await sendTTS(ctx, ctx.q, 'hi');
    }
  },
  {
    name: 'ttsar', alias: ['arabictts'], category: 'voice', desc: 'Arabic TTS',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ttsar مرحبا`);
      await sendTTS(ctx, ctx.q, 'ar');
    }
  },
  // Generate one TTS command per language
  ...LANGS.map(([code, name, alias]) => ({
    name: `tts${code.toLowerCase().replace('-cn','')}`,
    alias: [`${alias}tts`, `${alias}voice`],
    category: 'voice',
    desc: `Text to speech in ${name}`,
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}tts${code.toLowerCase().replace('-cn','')} Hello in ${name}`);
      await sendTTS(ctx, ctx.q, code);
    }
  }))
];

async function sendTTS(ctx, text, lang) {
  try {
    if (text.length > 200) text = text.slice(0, 200);
    const results = await googleTTS.getAllAudioUrls(text, { lang, slow: false, splitPunct: ',' });
    if (!results.length) return ctx.reply('❌ TTS failed');
    const buf = await utils.getBuffer(results[0].url);
    if (!buf) return ctx.reply('❌ TTS download failed');
    await ctx.sock.sendMessage(ctx.jid, {
      audio: buf,
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `tts-${lang}.mp3`
    }, { quoted: ctx.m });
  } catch (e) { ctx.reply('❌ ' + e.message); }
}
