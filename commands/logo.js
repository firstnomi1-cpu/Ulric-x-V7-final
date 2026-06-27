/**
 * Ulric-X MD - Logo / Text-to-Image commands
 * Generates 200+ text-to-image commands using Pollinations AI (free, no key).
 * Each command takes a text input and produces a styled logo/banner image.
 */
const utils = require('../lib/utils');
const config= require('../config');

// Helper: build a Pollinations image URL with a styled prompt
function logoUrl(text, style) {
  const prompt = `${style}, text "${text}", high quality, 4k, professional design`;
  return `${config.API.pollinations_img}${encodeURIComponent(prompt)}?width=1024&height=512&nologo=true&model=flux`;
}

// Style presets - 200+ of them, each becomes its own command
const STYLES = [
  // 3D text effects
  '3d neon text effect', '3d gold text effect', '3d silver text effect', '3d chrome text effect',
  '3d ice text effect', '3d fire text effect', '3d glass text effect', '3d metal text effect',
  '3d rainbow text effect', '3d crystal text effect', '3d wooden text effect', '3d stone text effect',
  '3d water text effect', '3d shadow text effect', '3d glowing text effect', '3d holographic text',
  '3d candy text effect', '3d chocolate text effect', '3d metallic gold text', '3d glowing neon',
  // Fire & light effects
  'fire text effect, flames', 'lightning text effect, electric', 'glowing neon text effect',
  'lava text effect, molten', 'plasma text effect, energy', 'laser text effect, beams',
  'glow text effect, soft light', 'sparkle text effect, glitter', 'fireworks text effect',
  'sunburst text effect, rays', 'starlight text effect, stars', 'aurora text effect, northern lights',
  // Water & nature
  'water text effect, liquid', 'ice text effect, frozen', 'ocean text effect, waves',
  'rain text effect, droplets', 'cloud text effect, fluffy', 'forest text effect, leaves',
  'stone text effect, rock', 'sand text effect, desert', 'flower text effect, petals',
  'leaf text effect, green', 'wood text effect, grain', 'marble text effect, elegant',
  // Metal & industrial
  'gold text effect, luxurious', 'silver text effect, shiny', 'bronze text effect, vintage',
  'copper text effect, warm', 'steel text effect, industrial', 'iron text effect, rustic',
  'rust text effect, weathered', 'chrome text effect, mirror', 'platinum text effect, premium',
  'diamond text effect, jeweled', 'mercury text effect, liquid metal',
  // Galaxy & space
  'galaxy text effect, stars', 'space text effect, cosmos', 'nebula text effect, colorful',
  'planet text effect, planetary', 'moon text effect, lunar', 'sun text effect, solar',
  'meteor text effect, falling', 'black hole text effect, gravity', 'comet text effect, tail',
  'aurora borealis text effect',
  // Horror & dark
  'horror text effect, scary', 'blood text effect, dripping', 'zombie text effect, decay',
  'ghost text effect, spooky', 'skeleton text effect, bones', 'vampire text effect, gothic',
  'witch text effect, magical', 'demon text effect, evil', 'dark magic text effect',
  'haunted text effect, eerie', 'creepy text effect, unsettling',
  // Cute & playful
  'cute text effect, kawaii', 'candy text effect, sweet', 'bubble text effect, soap',
  'balloon text effect, floating', 'rainbow text effect, colorful', 'unicorn text effect, magical',
  'princess text effect, royal', 'fairy text effect, sparkles', 'mermaid text effect, ocean',
  'cartoon text effect, fun', 'comic text effect, bold',
  // Vintage & retro
  'retro text effect, 80s', 'vintage text effect, old', 'classic text effect, timeless',
  'art deco text effect, 1920s', 'art nouveau text effect, organic', 'pixel text effect, 8-bit',
  'arcade text effect, retro game', 'vaporwave text effect, aesthetic',
  'synthwave text effect, neon', 'cassette text effect, 80s music',
  // Sports & gaming
  'esports logo text, gaming', 'football text effect, sports', 'basketball text effect',
  'soccer text effect, team', 'cricket text effect', 'racing text effect, speed',
  'boxing text effect, fight', 'wrestling text effect, smackdown',
  // Festival & celebration
  'birthday text effect, cake', 'christmas text effect, festive', 'halloween text effect, spooky',
  'new year text effect, celebration', 'eid text effect, islamic', 'diwali text effect, lights',
  'valentine text effect, hearts', 'anniversary text effect, love',
  // Luxury & premium
  'luxury logo text, premium', 'royal text effect, king', 'crown text effect, royal',
  'palace text effect, grand', 'diamond text effect, gems', 'pearl text effect, ocean',
  'silk text effect, fabric', 'velvet text effect, soft',
  // Tech & digital
  'matrix text effect, green code', 'cyberpunk text effect, neon', 'hologram text effect, future',
  'digital text effect, pixels', 'glitch text effect, error', 'terminal text effect, code',
  'circuit text effect, electronics', 'robot text effect, mechanical',
  // Calligraphy & typography
  'calligraphy text effect, elegant', 'graffiti text effect, street', 'typography text effect, bold',
  'serif text effect, classic', 'sans-serif text effect, modern', 'script text effect, handwriting',
  'blackletter text effect, gothic', 'italic text effect, slanted',
  // Background scenes
  'text on mountain background', 'text on beach background', 'text on city background',
  'text on forest background', 'text on desert background', 'text on space background',
  'text on underwater background', 'text on sky background', 'text on sunset background',
  'text on night sky background',
  // Weather effects
  'text in rain effect', 'text in snow effect', 'text in storm effect',
  'text in fog effect', 'text in sunshine effect', 'text in wind effect',
  // Abstract
  'abstract text effect, artistic', 'fractal text effect, mathematical', 'geometric text effect, shapes',
  'minimalist text effect, clean', 'surreal text effect, dreamlike', 'pop art text effect, andy warhol',
  // Birthday names
  'birthday cake with name', 'birthday banner with name', 'birthday card with name',
  // Festival greetings
  'eid mubarak banner text', 'christmas greeting banner', 'new year greeting banner',
  'happy birthday banner', 'happy anniversary banner', 'congratulations banner',
  // Logo styles
  'gaming clan logo with text', 'youtube logo with text', 'brand logo with text',
  'team logo with text', 'community logo with text', 'server logo with text',
  // Islamic
  'islamic calligraphy text', 'arabic text effect', 'mosque silhouette with text',
  'quran verse text effect', 'ramadan kareem text', 'eid mubarak calligraphy',
  // Sci-fi
  'sci-fi text effect, future', 'alien text effect, extraterrestrial', 'spaceship text effect',
  'cyber text effect, hacked', 'futuristic text effect, tech',
  // Magical & fantasy
  'magic text effect, spell', 'wizard text effect, mystical', 'dragon text effect, fire',
  'phoenix text effect, flames', 'unicorn text effect, rainbow', 'fairy text effect, sparkles',
  'elf text effect, fantasy', 'knight text effect, medieval', 'castle text effect, stone',
  'sword text effect, blade',
  // Food themed
  'chocolate text effect, sweet', 'pizza text effect, food', 'burger text effect, fast food',
  'ice cream text effect, dessert', 'donut text effect, glazed', 'cake text effect, baked',
  'coffee text effect, morning', 'fruit text effect, fresh',
  // Nature scenes
  'text with flowers background', 'text with trees background', 'text with waterfall background',
  'text with mountain peak background', 'text with ocean waves background',
  'text with sunset sky background', 'text with starry night background',
  // Embossed & engraved
  'embossed text effect, raised', 'engraved text effect, carved', 'etched text effect, glass',
  'stamped text effect, ink', 'printed text effect, paper',
  // Smoke & mist
  'smoke text effect, swirling', 'mist text effect, foggy', 'cloud text effect, soft',
  'steam text effect, vapor', 'gas text effect, ethereal',
  // Electric & energy
  'electric text effect, sparks', 'energy text effect, glowing', 'power text effect, force',
  'plasma ball text effect', 'tesla coil text effect',
  // Glitter & sparkles
  'glitter text effect, sparkly', 'sparkle text effect, shining', 'shimmer text effect, glistening',
  'twinkle text effect, stars', 'shine text effect, polished',
  // Painted effects
  'spray paint text effect, graffiti', 'brush stroke text effect, painted', 'ink text effect, tattoo',
  'watercolor text effect, soft', 'acrylic text effect, bold',
  // Stone & rock
  'granite text effect, speckled', 'slate text effect, dark', 'limestone text effect, pale',
  'sandstone text effect, layered', 'obsidian text effect, glassy',
  // Wood & natural
  'oak text effect, sturdy', 'pine text effect, light', 'cedar text effect, fragrant',
  'bamboo text effect, asian', 'palm text effect, tropical',
  // Fabric & textile
  'silk text effect, smooth', 'denim text effect, blue', 'leather text effect, rugged',
  'wool text effect, warm', 'cotton text effect, soft',
  // Glass & crystal
  'stained glass text effect, colorful', 'frosted glass text effect, icy',
  'crystal text effect, faceted', 'diamond text effect, brilliant',
  // Sky & weather
  'sunny sky text effect', 'cloudy sky text effect', 'starry sky text effect',
  'rainbow sky text effect', 'lightning sky text effect'
];

// Build commands from styles
const styleCmds = STYLES.map((style, i) => {
  // Generate a command name from the style
  const name = style.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 18) + (i < STYLES.length ? '' : '2');
  return {
    name: `logo${i+1}`,
    alias: [`text${i+1}`, `txt${i+1}`],
    category: 'logo',
    desc: `Logo style: ${style.slice(0, 40)}`,
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}logo${i+1} Your Text`);
      const url = logoUrl(ctx.q, style);
      await ctx.replyImg(url, `🎨 ${style}`);
    }
  };
});

// Additional explicit logo commands
const extraLogos = [
  { name: 'wolflogo',  text: 'wolf logo with glowing eyes',  desc: 'Wolf logo text' },
  { name: 'dragonlogo', text: 'dragon logo with fire',  desc: 'Dragon logo text' },
  { name: 'lionlogo',  text: 'lion logo with golden mane',  desc: 'Lion logo text' },
  { name: 'eaglelogo', text: 'eagle logo with wings',  desc: 'Eagle logo text' },
  { name: 'tigerlogo', text: 'tiger logo with stripes',  desc: 'Tiger logo text' },
  { name: 'snakelogo', text: 'snake logo with venom',  desc: 'Snake logo text' },
  { name: 'phoenixlogo', text: 'phoenix logo with flames',  desc: 'Phoenix logo text' },
  { name: 'catlogo',   text: 'cat logo with whiskers',  desc: 'Cat logo text' },
  { name: 'gaminglogo',text: 'gaming logo esports style',  desc: 'Gaming logo' },
  { name: 'youtubelogo', text: 'youtube channel logo',  desc: 'YouTube logo' }
].map(l => ({
  name: l.name, alias: [], category: 'logo', desc: l.desc,
  handler: async (ctx) => {
    if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}${l.name} Your Text`);
    const url = logoUrl(ctx.q, l.text);
    await ctx.replyImg(url, `🎨 ${l.desc}`);
  }
}));

module.exports = [...styleCmds, ...extraLogos];
