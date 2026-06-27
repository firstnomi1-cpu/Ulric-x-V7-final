/**
 * Ulric-X MD - Text formatting commands
 * Many text-transform generators (fancy text, zalgo, leetspeak, etc.)
 * Pure JS - no API needed.
 */
const utils = require('../lib/utils');

// Fancy text maps
const FONTS = {
  bold:      {'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷','k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁','u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇'},
  italic:    {'a':'𝘢','b':'𝘣','c':'𝘤','d':'𝘥','e':'𝘦','f':'𝘧','g':'𝘨','h':'𝘩','i':'𝘪','j':'𝘫','k':'𝘬','l':'𝘭','m':'𝘮','n':'𝘯','o':'𝘰','p':'𝘱','q':'𝘲','r':'𝘳','s':'𝘴','t':'𝘵','u':'𝘶','v':'𝘷','w':'𝘸','x':'𝘹','y':'𝘺','z':'𝘻'},
  boldItalic:{'a':'𝙖','b':'𝙗','c':'𝙘','d':'𝙙','e':'𝙚','f':'𝙛','g':'𝙜','h':'𝙝','i':'𝙞','j':'𝙟','k':'𝙠','l':'𝙡','m':'𝙢','n':'𝙣','o':'𝙤','p':'𝙥','q':'𝙦','r':'𝙧','s':'𝙨','t':'𝙩','u':'𝙪','v':'𝙫','w':'𝙬','x':'𝙭','y':'𝙮','z':'𝙯'},
  script:    {'a':'𝒶','b':'𝒷','c':'𝒸','d':'𝒹','e':'𝑒','f':'𝒻','g':'𝑔','h':'𝒽','i':'𝒾','j':'𝒿','k':'𝓀','l':'𝓁','m':'𝓂','n':'𝓃','o':'𝑜','p':'𝓅','q':'𝓆','r':'𝓇','s':'𝓈','t':'𝓉','u':'𝓊','v':'𝓋','w':'𝓌','x':'𝓍','y':'𝓎','z':'𝓏'},
  fraktur:   {'a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦','j':'𝔧','k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯','s':'𝔰','t':'𝔱','u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷'},
  mono:      {'a':'𝚊','b':'𝚋','c':'𝚌','d':'𝚍','e':'𝚎','f':'𝚏','g':'𝚐','h':'𝚑','i':'𝚒','j':'𝚓','k':'𝚔','l':'𝚕','m':'𝚖','n':'𝚗','o':'𝚘','p':'𝚙','q':'𝚚','r':'𝚛','s':'𝚜','t':'𝚝','u':'𝚞','v':'𝚟','w':'𝚠','x':'𝚡','y':'𝚢','z':'𝚣'},
  circle:    {'a':'ⓐ','b':'ⓑ','c':'ⓒ','d':'ⓓ','e':'ⓔ','f':'ⓕ','g':'ⓖ','h':'ⓗ','i':'ⓘ','j':'ⓙ','k':'ⓚ','l':'ⓛ','m':'ⓜ','n':'ⓝ','o':'ⓞ','p':'ⓟ','q':'ⓠ','r':'ⓡ','s':'ⓢ','t':'ⓣ','u':'ⓤ','v':'ⓥ','w':'ⓦ','x':'ⓧ','y':'ⓨ','z':'ⓩ'},
  square:    {'a':'🄰','b':'🄱','c':'🄲','d':'🄳','e':'🄴','f':'🄵','g':'🄶','h':'🄷','i':'🄸','j':'🄹','k':'🄺','l':'🄻','m':'🄼','n':'🄽','o':'🄾','p':'🄿','q':'🅀','r':'🅁','s':'🅂','t':'🅃','u':'🅄','v':'🅅','w':'🅆','x':'🅇','y':'🅈','z':'🅉'},
  bubble:    {'a':'🅐','b':'🅑','c':'🅒','d':'🅓','e':'🅔','f':'🅕','g':'🅖','h':'🅗','i':'🅘','j':'🅙','k':'🅚','l':'🅛','m':'🅜','n':'🅝','o':'🅞','p':'🅟','q':'🅠','r':'🅡','s':'🅢','t':'🅣','u':'🅤','v':'🅥','w':'🅦','x':'🅧','y':'🅨','z':'🅩'}
};

function convert(text, fontMap) {
  return text.split('').map(c => {
    const lower = c.toLowerCase();
    if (fontMap[lower]) {
      const converted = fontMap[lower];
      return c === lower ? converted : converted.toUpperCase();
    }
    return c;
  }).join('');
}

// Leetspeak
function leet(text) {
  return text.toLowerCase().replace(/a/g,'4').replace(/e/g,'3').replace(/i/g,'1').replace(/o/g,'0').replace(/s/g,'5').replace(/t/g,'7').replace(/b/g,'8').replace(/g/g,'9');
}

// Zalgo (light)
function zalgo(text) {
  const marks = ['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030A','\u030B','\u030C','\u030D','\u030E'];
  return text.split('').map(c => c + marks[utils.randInt(0, marks.length-1)] + marks[utils.randInt(0, marks.length-1)]).join('');
}

// Build font commands
const FONT_NAMES = Object.keys(FONTS);
const fontCmds = FONT_NAMES.map(name => ({
  name: `font${name.toLowerCase()}`, alias: [`f${name.toLowerCase()}`], category: 'text', desc: `${name} font`,
  handler: async (ctx) => {
    if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}font${name.toLowerCase()} Hello`);
    ctx.reply(convert(ctx.q, FONTS[name]));
  }
}));

module.exports = [
  ...fontCmds,
  {
    name: 'leet', alias: ['leetspeak','hacker'], category: 'text', desc: 'Leetspeak converter',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}leet Hello`);
      ctx.reply(leet(ctx.q));
    }
  },
  {
    name: 'zalgo', alias: ['cursed'], category: 'text', desc: 'Zalgo/cursed text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}zalgo Hello`);
      ctx.reply(zalgo(ctx.q));
    }
  },
  {
    name: 'reverse', alias: ['rev'], category: 'text', desc: 'Reverse text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}reverse Hello`);
      ctx.reply(ctx.q.split('').reverse().join(''));
    }
  },
  {
    name: 'upper', alias: ['uppercase'], category: 'text', desc: 'UPPERCASE',
    handler: async (ctx) => ctx.q ? ctx.reply(ctx.q.toUpperCase()) : ctx.reply('Provide text')
  },
  {
    name: 'lower', alias: ['lowercase'], category: 'text', desc: 'lowercase',
    handler: async (ctx) => ctx.q ? ctx.reply(ctx.q.toLowerCase()) : ctx.reply('Provide text')
  },
  {
    name: 'titlecase', alias: ['title'], category: 'text', desc: 'Title Case',
    handler: async (ctx) => ctx.q ? ctx.reply(ctx.q.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase())) : ctx.reply('Provide text')
  },
  {
    name: 'binary', alias: ['bin2'], category: 'text', desc: 'Text to binary',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}binary Hello`);
      ctx.reply(ctx.q.split('').map(c => c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '));
    }
  },
  {
    name: 'frombinary', alias: ['unbinary'], category: 'text', desc: 'Binary to text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}frombinary 01001000 01101001`);
      try {
        ctx.reply(ctx.q.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join(''));
      } catch { ctx.reply('❌ Invalid'); }
    }
  },
  {
    name: 'morse', alias: ['morsecode'], category: 'text', desc: 'Text to morse',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}morse SOS`);
      const map = {'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
      ctx.reply(ctx.q.toUpperCase().split('').map(c => map[c] || c).join(' '));
    }
  },
  {
    name: 'vaporwave', alias: ['vapor'], category: 'text', desc: 'Vaporwave text',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}vaporwave Hello`);
      ctx.reply(ctx.q.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)).join(''));
    }
  },
  {
    name: 'fancy', alias: ['fancytext'], category: 'text', desc: 'All fancy fonts at once',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}fancy Hello`);
      let result = '';
      for (const name of FONT_NAMES) {
        result += `${name}: ${convert(ctx.q, FONTS[name])}\n`;
      }
      ctx.reply(result);
    }
  },
  {
    name: 'repeat', alias: ['spamtext'], category: 'text', desc: 'Repeat text',
    handler: async (ctx) => {
      const [count, ...text] = (ctx.q || '').split(' ');
      const n = parseInt(count, 10) || 5;
      if (n > 20) return ctx.reply('Max 20');
      ctx.reply(text.join(' ').repeat(n).slice(0, 4000));
    }
  },
  {
    name: 'counttext', alias: ['textcount'], category: 'text', desc: 'Count characters/words',
    handler: async (ctx) => {
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}counttext Hello world`);
      ctx.reply(`📊 Characters: ${ctx.q.length}\n📝 Words: ${ctx.q.split(' ').filter(Boolean).length}`);
    }
  },
  {
    name: 'azan', alias: ['adhan'], category: 'text', desc: 'Azan text',
    handler: async (ctx) => ctx.reply('Allahu Akbar! Allahu Akbar! (4x)\nAsh-hadu an-la ilaha illa Allah (2x)\nAsh-hadu anna Muhammadan rasul Allah (2x)\nHayya \'ala as-salah (2x)\nHayya \'ala al-falah (2x)\nAllahu Akbar! Allahu Akbar! (2x)\nLa ilaha illa Allah')
  }
];
