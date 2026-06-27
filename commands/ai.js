/**
 * Ulric-X MD - AI commands (using Pollinations free text/image API - no key)
 */
const axios = require('axios');
const utils = require('../lib/utils');
const config= require('../config');

// Pollinations text AI (uses OpenAI compatible format, no key needed)
async function aiText(prompt, system = '') {
  try {
    const r = await axios.post('https://text.pollinations.ai/openai', {
      model: 'openai',
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    }, { timeout: 60000 });
    return r.data?.choices?.[0]?.message?.content || r.data;
  } catch (e) {
    // Fallback to GET
    try {
      const r = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, { timeout: 60000 });
      return r.data;
    } catch { return null; }
  }
}

async function aiImage(prompt, opts = {}) {
  const seed = opts.seed || Math.floor(Math.random() * 1000000);
  const model = opts.model || 'flux';
  const url = `${config.API.pollinations_img}${encodeURIComponent(prompt)}?width=${opts.width||1024}&height=${opts.height||1024}&seed=${seed}&model=${model}&nologo=true`;
  return url;
}

module.exports = [
  {
    name: 'ai', alias: ['ask','gpt','chat','chatgpt'], category: 'ai', desc: 'Ask AI anything',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ai What is the meaning of life?`);
      await ctx.reply('🤖 Thinking...');
      const r = await aiText(ctx.q, `You are ${config.BOT_NAME}, a helpful WhatsApp bot assistant created by ${config.BOT_OWNER}. Be concise and helpful. Respond in the user's language.`);
      if (!r) return ctx.reply('❌ AI failed. Try again later.');
      ctx.reply(`🤖 ${r}`);
    }
  },
  {
    name: 'aicode', alias: ['code'], category: 'ai', desc: 'AI code assistant',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aicode Write a Python function to reverse a string`);
      await ctx.reply('💻 Coding...');
      const r = await aiText(ctx.q, 'You are a coding expert. Provide concise, working code with brief explanation. Use markdown code blocks.');
      if (!r) return ctx.reply('❌ AI failed');
      ctx.reply(`💻 ${r}`);
    }
  },
  {
    name: 'aimage', alias: ['aimg','dalle','imagine','generate'], category: 'ai', desc: 'Generate AI image',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aimage A futuristic city at sunset`);
      await ctx.reply('🎨 Generating image...');
      const url = await aiImage(ctx.q);
      await ctx.replyImg(url, `🎨 AI generated: ${ctx.q}`);
    }
  },
  {
    name: 'aianime', alias: ['aianime','animegen'], category: 'ai', desc: 'Generate anime-style image',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aianime A girl with cherry blossoms`);
      await ctx.reply('🎨 Generating anime image...');
      const url = await aiImage(`anime style, ${ctx.q}, high quality, detailed`);
      await ctx.replyImg(url, `🎨 Anime AI: ${ctx.q}`);
    }
  },
  {
    name: 'aiportrait', alias: ['portrait'], category: 'ai', desc: 'AI portrait generation',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aiportrait A warrior in golden armor`);
      const url = await aiImage(`portrait of ${ctx.q}, photorealistic, studio lighting`);
      await ctx.replyImg(url, `🎨 Portrait: ${ctx.q}`);
    }
  },
  {
    name: 'ailandscape', alias: ['landscape'], category: 'ai', desc: 'AI landscape',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ailandscape Mountains with waterfall`);
      const url = await aiImage(`beautiful landscape, ${ctx.q}, 4k, wide angle`);
      await ctx.replyImg(url, `🎨 Landscape: ${ctx.q}`);
    }
  },
  {
    name: 'aitranslate', alias: ['translate','tr'], category: 'ai', desc: 'Translate text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aitranslate Hello | to French`);
      const [text, lang] = ctx.q.split('|');
      if (!text || !lang) return ctx.reply('Format: .aitranslate text | to <language>');
      const r = await aiText(`Translate to ${lang.trim()}: ${text.trim()}`);
      ctx.reply(`🌐 ${r}`);
    }
  },
  {
    name: 'aisummary', alias: ['summarize','summarise'], category: 'ai', desc: 'Summarize text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aisummary <paste text>`);
      if (ctx.q.length < 50) return ctx.reply('Text too short');
      const r = await aiText(`Summarize in 3 bullet points:\n\n${ctx.q}`);
      ctx.reply(`📝 ${r}`);
    }
  },
  {
    name: 'aipoem', alias: ['poem'], category: 'ai', desc: 'AI poem',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aipoem About the sea`);
      const r = await aiText(`Write a short poem about: ${ctx.q}`);
      ctx.reply(`📜 ${r}`);
    }
  },
  {
    name: 'aijoke', alias: ['aijoke'], category: 'ai', desc: 'AI generated joke',
    handler: async (ctx) => {
      const r = await aiText('Tell a short funny joke.');
      ctx.reply(`😂 ${r}`);
    }
  },
  {
    name: 'aistory', alias: ['story'], category: 'ai', desc: 'AI short story',
    handler: async (ctx) => {
      const topic = ctx.q || 'a magical adventure';
      const r = await aiText(`Write a short 3-paragraph story about ${topic}.`);
      ctx.reply(`📖 ${r}`);
    }
  },
  {
    name: 'aichat', alias: ['simi','simsimi'], category: 'ai', desc: 'Casual AI chat',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aichat Hello!`);
      const r = await aiText(ctx.q, 'You are a fun casual chat friend. Keep responses short and friendly.');
      ctx.reply(`💬 ${r}`);
    }
  },
  // AI image variants - generate many text-to-image commands with different style presets
  ...[
    ['cyberpunk', 'cyberpunk neon city, futuristic, dramatic lighting'],
    ['fantasy',   'fantasy art, magical, ethereal lighting'],
    ['3drender',  '3D render, octane, photorealistic'],
    ['oilpaint',  'oil painting, classical art style'],
    ['watercolor','watercolor painting, soft pastel colors'],
    ['pixelart',  'pixel art, 8-bit retro game style'],
    ['lowpoly',   'low poly 3D art, geometric'],
    ['vaporwave', 'vaporwave aesthetic, pink and cyan, retro 80s'],
    ['streeart',  'street art, graffiti, urban'],
    ['concept',   'concept art, cinematic, professional'],
    ['comic',     'comic book style, inked, colored'],
    ['manga',     'manga style, black and white, detailed'],
    ['realistic', 'photorealistic, high detail, 8k'],
    ['minimal',   'minimalist, simple, clean'],
    ['surreal',   'surreal, dreamlike, salvador dali style'],
    ['gothic',    'gothic, dark, moody'],
    ['steampunk', 'steampunk, brass, victorian, gears'],
    ['cosmic',    'cosmic, galaxy, stars, nebula'],
    ['forest',    'enchanted forest, mystical, glowing'],
    ['underwater','underwater scene, ocean, marine life'],
    ['space',     'outer space, planets, stars'],
    ['desert',    'desert landscape, sand dunes, hot'],
    ['snow',      'snowy scene, winter, cold'],
    ['rain',      'rainy day, moody, atmospheric'],
    ['sunset',    'sunset, golden hour, warm light'],
    ['night',     'night scene, moonlight, dark'],
    ['fire',      'fire, flames, dramatic, hot'],
    ['ice',       'ice, frozen, cold, blue tones'],
    ['gold',      'gold, luxurious, shiny'],
    ['silver',    'silver, metallic, sleek'] // Note: this is a color, not branding
  ].map(([name, style]) => ({
    name: `ai${name}`, alias: [`gen${name}`], category: 'ai', desc: `AI image - ${name} style`,
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ai${name} A robot`);
      const url = await aiImage(`${ctx.q}, ${style}`);
      await ctx.replyImg(url, `🎨 ${name}: ${ctx.q}`);
    }
  }))
];
