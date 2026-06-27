/**
 * Ulric-X MD - AI Image Style Commands (80+)
 * All use Pollinations AI (free, no key).
 * Each command generates an image with a specific style preset.
 */
const utils = require('../lib/utils');
const config= require('../config');

function aiUrl(prompt, opts = {}) {
  const seed = opts.seed || Math.floor(Math.random() * 1000000);
  return `${config.API.pollinations_img}${encodeURIComponent(prompt)}?width=${opts.width||1024}&height=${opts.height||1024}&seed=${seed}&model=flux&nologo=true`;
}

// Style presets (80+)
const STYLES = [
  ['cyberpunk2',  'cyberpunk neon city, blade runner style, dramatic lighting, futuristic'],
  ['fantasy2',    'high fantasy art, magical, ethereal, dragons, wizards'],
  ['scifi2',      'science fiction, spaceship, alien world, advanced tech'],
  ['steampunk2',  'steampunk, brass gears, victorian, steam-powered machines'],
  ['vaporwave2',  'vaporwave aesthetic, pink and cyan, retro 80s, palm trees'],
  ['synthwave',   'synthwave, neon grid, sunset, retrofuturistic'],
  ['retrowave',   'retrowave, 80s aesthetic, neon lights'],
  ['outrun',      'outrun style, neon, retro car, sunset'],
  ['noir',        'film noir, black and white, moody, detective'],
  ['horror2',     'horror art, dark, scary, eerie, haunted'],
  ['gothic2',     'gothic architecture, dark, medieval, dramatic'],
  ['baroque',     'baroque art style, ornate, classical, dramatic'],
  ['renaissance', 'renaissance painting style, classical art, da vinci'],
  ['romanticism', 'romanticism art, dramatic, emotional, classical landscape'],
  ['impressionism','impressionist painting, monet style, soft brush strokes'],
  ['surrealism',  'surrealist art, dali style, dreamlike, bizarre'],
  ['cubism',      'cubist art, picasso style, geometric, abstract'],
  ['expressionism','expressionist art, emotional, bold colors, distorted'],
  ['popart2',     'pop art, andy warhol style, bold colors, comic'],
  ['minimalist2', 'minimalist art, simple, clean, modern'],
  ['maximalist',  'maximalist art, busy, detailed, ornate'],
  ['watercolor2', 'watercolor painting, soft, dreamy, pastel'],
  ['oilpainting', 'oil painting, classical, textured, rich colors'],
  ['acrylic',     'acrylic painting, bold, textured, modern'],
  ['pencil',      'pencil sketch, graphite, detailed drawing'],
  ['charcoal',    'charcoal drawing, dramatic shadows, monochrome'],
  ['ink',         'ink drawing, bold lines, traditional'],
  ['crayon',      'crayon drawing, childlike, colorful'],
  ['pastel',      'pastel drawing, soft, dreamy, blended'],
  ['digital2',    'digital art, professional, high detail'],
  ['concept2',    'concept art, cinematic, professional'],
  ['mattepaint',  'matte painting, cinematic landscape, film'],
  ['pixel2',      'pixel art, 8-bit retro game style'],
  ['voxel',       'voxel art, 3D pixel, minecraft style'],
  ['lowpoly2',    'low poly 3D art, geometric, minimalist'],
  ['isometric',   'isometric art, 3D technical drawing'],
  ['celshaded',   'cel shaded art, anime style, bold outlines'],
  ['anime2',      'anime style, japanese animation, detailed'],
  ['manga2',      'manga style, black and white, japanese comic'],
  ['chibi',       'chibi style, cute, small characters, big heads'],
  ['kawaii2',     'kawaii style, ultra cute, pastel colors'],
  ['ghibli',      'studio ghibli style, miyazaki, dreamy anime'],
  ['shonen',      'shonen anime style, action, dynamic'],
  ['shoujo',      'shoujo anime style, romantic, sparkly'],
  ['mecha',       'mecha anime, giant robots, futuristic'],
  ['isekai',      'isekai anime style, fantasy world, hero'],
  ['magicalgirl', 'magical girl anime, sparkles, transformation'],
  ['samurai',     'samurai art, japanese, traditional, warrior'],
  ['ninja',       'ninja art, japanese, stealth, action'],
  ['cyber',       'cyber art, digital, glitch, futuristic'],
  ['matrix',      'matrix style, green code, cyberpunk'],
  ['dystopia',    'dystopian art, ruined city, post-apocalyptic'],
  ['utopia',      'utopian art, perfect future, bright'],
  ['postapoc',    'post-apocalyptic, ruined, survival, gritty'],
  ['wasteland',   'wasteland, desert, ruined, mad max'],
  ['space2',      'outer space, stars, planets, nebula'],
  ['galaxy2',     'galaxy art, cosmic, swirling colors'],
  ['nebula',      'nebula, cosmic clouds, colorful, vast'],
  ['blackhole',   'black hole, gravity, swirling, dramatic'],
  ['supernova',   'supernova, exploding star, bright, dramatic'],
  ['aurora2',     'aurora borealis, northern lights, ethereal'],
  ['ocean2',      'ocean art, waves, deep blue, marine'],
  ['reef',        'coral reef, underwater, colorful, marine life'],
  ['jungle2',     'jungle art, lush green, tropical, wild'],
  ['desert2',     'desert art, sand dunes, hot, vast'],
  ['tundra',      'tundra, frozen, arctic, cold'],
  ['volcano2',    'volcano, lava, eruption, dramatic'],
  ['waterfall',   'waterfall, lush, peaceful, nature'],
  ['mountain2',   'mountain art, peaks, snow, dramatic'],
  ['forest2',     'forest art, deep woods, mystical, green'],
  ['cave',        'cave art, underground, crystals, mysterious'],
  ['sky2',        'sky art, clouds, sunset, peaceful'],
  ['storm',       'storm art, lightning, dramatic, dark'],
  ['rain2',       'rain art, moody, atmospheric, droplets'],
  ['snow2',       'snow art, winter, white, cold'],
  ['fire2',       'fire art, flames, dramatic, hot'],
  ['ice2',        'ice art, frozen, crystalline, blue'],
  ['earth',       'earth art, planet, blue marble, space'],
  ['sun2',        'sun art, golden, rays, bright'],
  ['moon2',       'moon art, lunar, craters, night'],
  ['star2',       'star art, twinkling, night sky'],
  ['planet',      'planet art, fictional world, alien'],
  ['comet',       'comet, falling, tail, cosmic']
];

module.exports = STYLES.map(([name, style]) => ({
  name: `ai${name}`, alias: [`gen${name}`, `${name}gen`], category: 'ai', desc: `AI image - ${name} style`,
  handler: async (ctx) => {
    if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}ai${name} A robot warrior`);
    const url = aiUrl(`${ctx.q}, ${style}`);
    await ctx.replyImg(url, `🎨 ${name}: ${ctx.q}`);
  }
}));

// Additional AI text commands
const TEXT_CMDS = [
  {
    name: 'aiimage2', alias: ['aimg2','imagine2'], category: 'ai', desc: 'Generate AI image (alt)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aiimage2 A futuristic city`);
      await ctx.replyImg(aiUrl(ctx.q), `🎨 ${ctx.q}`);
    }
  },
  {
    name: 'aianime2', alias: ['animegen2'], category: 'ai', desc: 'AI anime image (alt)',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aianime2 A girl with cherry blossoms`);
      await ctx.replyImg(aiUrl(`anime style, ${ctx.q}, high quality, detailed`), `🎨 Anime: ${ctx.q}`);
    }
  },
  {
    name: 'aibg', alias: ['aibackground'], category: 'ai', desc: 'AI background image',
    handler: async (ctx) => {
      const q = ctx.q || 'abstract gradient';
      await ctx.replyImg(aiUrl(`${q}, background, wallpaper, 4k`), `🎨 Background: ${q}`);
    }
  },
  {
    name: 'aiposter', alias: ['poster'], category: 'ai', desc: 'AI movie poster',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aiposter A space adventure`);
      await ctx.replyImg(aiUrl(`movie poster, ${ctx.q}, cinematic, professional`, { width: 800, height: 1200 }), `🎬 Poster: ${ctx.q}`);
    }
  },
  {
    name: 'aiavatar', alias: ['genavatar'], category: 'ai', desc: 'AI avatar generator',
    handler: async (ctx) => {
      const q = ctx.q || 'cyberpunk character';
      await ctx.replyImg(aiUrl(`avatar portrait, ${q}, head and shoulders, square`), `🧑 Avatar: ${q}`);
    }
  },
  {
    name: 'aibookcover', alias: ['bookcover'], category: 'ai', desc: 'AI book cover',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aibookcover Mystery novel title`);
      await ctx.replyImg(aiUrl(`book cover, ${ctx.q}, professional design, atmospheric`, { width: 800, height: 1200 }), `📚 Book: ${ctx.q}`);
    }
  },
  {
    name: 'aithumbnail', alias: ['thumb2'], category: 'ai', desc: 'AI YouTube thumbnail',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}aithumbnail Gaming montage`);
      await ctx.replyImg(aiUrl(`YouTube thumbnail, ${ctx.q}, bold text, eye-catching`, { width: 1280, height: 720 }), `🖼️ Thumbnail: ${ctx.q}`);
    }
  }
];

module.exports.push(...TEXT_CMDS);
