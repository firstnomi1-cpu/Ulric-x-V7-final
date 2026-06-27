/**
 * Ulric-X MD - Sticker Variation Commands (80+)
 * Each command creates a sticker from text/emoji with different style presets.
 */
const sharp = require('sharp');
const utils = require('../lib/utils');
const config= require('../config');

// Generate text-based sticker using SVG
async function textSticker(text, opts = {}) {
  const w = 512, h = 512;
  const bg = opts.bg || '#000000';
  const fg = opts.fg || '#ffffff';
  const fontSize = opts.fontSize || 48;
  const fontFamily = opts.fontFamily || 'Arial, sans-serif';

  // Truncate long text
  const displayText = text.length > 50 ? text.slice(0, 50) + '...' : text;

  // Escape XML special chars
  const safeText = displayText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Word wrap
  const words = safeText.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).length > 18) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  const displayLines = lines.slice(0, 8);

  const textY = (h - displayLines.length * (fontSize + 6)) / 2;
  const tspans = displayLines.map((l, i) =>
    `<text x="50%" y="${textY + i * (fontSize + 6)}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fg}" text-anchor="middle" font-weight="bold">${l}</text>`
  ).join('');

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bg}"/>
    ${tspans}
  </svg>`;

  return sharp(Buffer.from(svg)).webp({ quality: 95 }).toBuffer();
}

// Sticker style presets
const STYLES = [
  ['blackwhite', { bg: '#000000', fg: '#ffffff' }],
  ['whiteblack', { bg: '#ffffff', fg: '#000000' }],
  ['redwhite',   { bg: '#dc2626', fg: '#ffffff' }],
  ['bluewhite',  { bg: '#2563eb', fg: '#ffffff' }],
  ['greenwhite', { bg: '#16a34a', fg: '#ffffff' }],
  ['yellowblack',{ bg: '#facc15', fg: '#000000' }],
  ['purplewhite',{ bg: '#9333ea', fg: '#ffffff' }],
  ['pinkwhite',  { bg: '#ec4899', fg: '#ffffff' }],
  ['orangewhite',{ bg: '#f97316', fg: '#ffffff' }],
  ['tealwhite',  { bg: '#14b8a6', fg: '#ffffff' }],
  ['neonpink',   { bg: '#1a0033', fg: '#ff00ff' }],
  ['neongreen',  { bg: '#001a00', fg: '#00ff00' }],
  ['neonblue',   { bg: '#000033', fg: '#00ffff' }],
  ['goldblack',  { bg: '#000000', fg: '#ffd700' }],
  ['silverblack',{ bg: '#000000', fg: '#c0c0c0' }],
  ['rainbow',    { bg: '#000000', fg: '#ffffff' }], // simplified
  ['gradient1',  { bg: '#ff6b6b', fg: '#ffffff' }],
  ['gradient2',  { bg: '#4ecdc4', fg: '#ffffff' }],
  ['gradient3',  { bg: '#45b7d1', fg: '#ffffff' }],
  ['gradient4',  { bg: '#f9ca24', fg: '#000000' }],
  ['gradient5',  { bg: '#6c5ce7', fg: '#ffffff' }],
  ['gradient6',  { bg: '#a29bfe', fg: '#ffffff' }],
  ['gradient7',  { bg: '#fd79a8', fg: '#ffffff' }],
  ['gradient8',  { bg: '#e17055', fg: '#ffffff' }],
  ['gradient9',  { bg: '#00cec9', fg: '#ffffff' }],
  ['gradient10', { bg: '#0984e3', fg: '#ffffff' }],
  ['gradient11', { bg: '#6c5ce7', fg: '#ffffff' }],
  ['gradient12', { bg: '#fdcb6e', fg: '#000000' }],
  ['dark1',      { bg: '#1a1a1a', fg: '#ffffff' }],
  ['dark2',      { bg: '#2d2d2d', fg: '#ffffff' }],
  ['dark3',      { bg: '#0f0f0f', fg: '#ffffff' }],
  ['dark4',      { bg: '#1e293b', fg: '#ffffff' }],
  ['dark5',      { bg: '#0f172a', fg: '#ffffff' }],
  ['light1',     { bg: '#f8fafc', fg: '#000000' }],
  ['light2',     { bg: '#f1f5f9', fg: '#000000' }],
  ['light3',     { bg: '#e2e8f0', fg: '#000000' }],
  ['light4',     { bg: '#cbd5e1', fg: '#000000' }],
  ['light5',     { bg: '#94a3b8', fg: '#ffffff' }],
  ['pastel1',    { bg: '#fce4ec', fg: '#880e4f' }],
  ['pastel2',    { bg: '#f3e5f5', fg: '#4a148c' }],
  ['pastel3',    { bg: '#e8eaf6', fg: '#1a237e' }],
  ['pastel4',    { bg: '#e0f7fa', fg: '#006064' }],
  ['pastel5',    { bg: '#e8f5e9', fg: '#1b5e20' }],
  ['pastel6',    { bg: '#fff3e0', fg: '#e65100' }],
  ['pastel7',    { bg: '#fffde7', fg: '#f57f17' }],
  ['pastel8',    { bg: '#fce4ec', fg: '#4a148c' }],
  ['retro1',     { bg: '#ff006e', fg: '#ffffff' }],
  ['retro2',     { bg: '#8338ec', fg: '#ffffff' }],
  ['retro3',     { bg: '#3a86ff', fg: '#ffffff' }],
  ['retro4',     { bg: '#06ffa5', fg: '#000000' }],
  ['retro5',     { bg: '#ffbe0b', fg: '#000000' }],
  ['retro6',     { bg: '#fb5607', fg: '#ffffff' }],
  ['darkgreen',  { bg: '#022c22', fg: '#10b981' }],
  ['darkred',    { bg: '#450a0a', fg: '#ef4444' }],
  ['darkblue',   { bg: '#0c1e3a', fg: '#3b82f6' }],
  ['darkpurple', { bg: '#2e1065', fg: '#a855f7' }],
  ['darkpink',   { bg: '#500724', fg: '#ec4899' }],
  ['vintage1',   { bg: '#3d2817', fg: '#e8c39e' }],
  ['vintage2',   { bg: '#1f1611', fg: '#c9a57b' }],
  ['vintage3',   { bg: '#2a1f1a', fg: '#d4a373' }],
  ['matrix',     { bg: '#000000', fg: '#00ff00' }],
  ['terminal',   { bg: '#000000', fg: '#00ff00' }],
  ['ocean1',     { bg: '#0c4a6e', fg: '#7dd3fc' }],
  ['ocean2',     { bg: '#0e7490', fg: '#67e8f9' }],
  ['ocean3',     { bg: '#155e75', fg: '#a5f3fc' }],
  ['forest1',    { bg: '#14532d', fg: '#86efac' }],
  ['forest2',    { bg: '#166534', fg: '#bbf7d0' }],
  ['forest3',    { bg: '#365314', fg: '#d9f99d' }],
  ['sunset1',    { bg: '#7c2d12', fg: '#fed7aa' }],
  ['sunset2',    { bg: '#9a3412', fg: '#ffedd5' }],
  ['sunset3',    { bg: '#c2410c', fg: '#fff7ed' }],
  ['galaxy',     { bg: '#020617', fg: '#c084fc' }],
  ['cyber1',     { bg: '#000000', fg: '#00ffff' }],
  ['cyber2',     { bg: '#000000', fg: '#ff00ff' }],
  ['cyber3',     { bg: '#000000', fg: '#ffff00' }],
  ['royal1',     { bg: '#1e1b4b', fg: '#fbbf24' }],
  ['royal2',     { bg: '#312e81', fg: '#fde047' }],
  ['royal3',     { bg: '#3730a3', fg: '#fef08a' }]
];

module.exports = STYLES.map(([name, opts]) => ({
  name: `st${name}`, alias: [`sticker${name}`, `txt${name}`], category: 'sticker', desc: `Text sticker - ${name}`,
  handler: async (ctx) => {
    if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}st${name} Hello World`);
    try {
      const buf = await textSticker(ctx.q, opts);
      await ctx.replySticker(buf);
    } catch (e) { ctx.reply('❌ ' + e.message); }
  }
}));

// Also add some emoji-based sticker commands (different themes)
const EMOJI_THEMES = [
  ['loveemoji', ['❤️','💖','💕','💝','💘','💗','💓','💞']],
  ['sademoji',  ['😢','😭','😔','😞','💔','😩','😫','🥺']],
  ['funemoji',  ['😂','🤣','😅','😄','😁','😆','🤣','😃']],
  ['coolemoji', ['😎','🤙','👌','🤘','👋','🤙','💪','🔥']],
  ['animeemoji',['🌸','🎌','🎌','🎌','💮','🍡','🍱','🍙']],
  ['natureemoji',['🌹','🌷','🌻','🌼','🌸','🌺','🍀','🌿']],
  ['animalmoji',['🐶','🐱','🦊','🦁','🐯','🐨','🐼','🦒']],
  ['foodemoji', ['🍕','🍔','🍟','🌭','🍿','🥨','🥐','🧀']],
  ['spookyemoji',['👻','💀','🎃','🦇','🕷️','🕸️','😈','👹']],
  ['partyemoji',['🎉','🎊','🎈','🎁','🎂','🥳','🍾','✨']]
];

const emojiCmds = EMOJI_THEMES.map(([name, emojis]) => ({
  name: `stick${name}`, alias: [`s${name}`], category: 'sticker', desc: `Random ${name} sticker`,
  handler: async (ctx) => {
    const emoji = utils.pickRandom(emojis);
    // Create a sticker with a big emoji
    try {
      const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#000"/>
        <text x="50%" y="50%" font-size="350" text-anchor="middle" dominant-baseline="central">${emoji}</text>
      </svg>`;
      const buf = await sharp(Buffer.from(svg)).webp().toBuffer();
      await ctx.replySticker(buf);
    } catch (e) { ctx.reply('❌ ' + e.message); }
  }
}));

module.exports.push(...emojiCmds);
