/**
 * Ulric-X MD - Menu commands
 * Renders all category menus using the user-supplied logo image.
 */
const config = require('../config');
const menu   = require('../lib/menu');
const handler= require('../handler');
const utils  = require('../lib/utils');

module.exports = [
  {
    name: 'menu', alias: ['listmenu','help','h','?'], category: 'main', desc: 'Show main menu',
    handler: async (ctx) => {
      await menu.sendMenu(ctx.sock, ctx.jid, menu.mainMenu(ctx.prefix), ctx.m);
    }
  },
  {
    name: 'allmenu', alias: ['allcmds','menu2','commands'], category: 'main', desc: 'Show all commands',
    handler: async (ctx) => {
      const cats = handler.getAllCategories();
      let text = `${menu.HEADER('𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒')}\n┃│ 🤖 ${config.BOT_NAME} | 👑 ${config.BOT_OWNER} | 📦 v${config.BOT_VERSION}\n${menu.FOOTER}\n\n`;
      for (const cat of cats) {
        const cmds = handler.getCommandsByCategory(cat);
        text += `\n╭━━❖ 𝐔𝐋𝐑𝐈𝐂-𝐗 ${cat.toUpperCase()} ❖━┈⊷\n`;
        for (const c of cmds.slice(0, 200)) {
          text += `┃│ ➤ ${ctx.prefix}${c.name}\n`;
        }
        text += `╰━━━━━━━━━━━━━━━┈⊷\n`;
      }
      text += `\n> ${config.BOT_FOOTER}`;
      await menu.sendMenu(ctx.sock, ctx.jid, text, ctx.m);
    }
  },
  {
    name: 'ownermenu', alias: ['om'], category: 'main', desc: 'Owner commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('owner').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'groupmenu', alias: ['gm','groupmenu1'], category: 'main', desc: 'Group commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('group').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'downloadmenu', alias: ['dlmenu'], category: 'main', desc: 'Download commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('download').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'stickermenu', alias: ['smenu','stmenu'], category: 'main', desc: 'Sticker commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('sticker').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐒𝐓𝐈𝐂𝐊𝐄𝐑 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'funmenu', alias: ['fmenu'], category: 'main', desc: 'Fun commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('fun').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐅𝐔𝐍 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'gamemenu', alias: ['gmenu'], category: 'main', desc: 'Game commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('game').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐆𝐀𝐌𝐄 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'animemenu', alias: ['amenu'], category: 'main', desc: 'Anime commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('anime').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐀𝐍𝐈𝐌𝐄 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'aimenu', alias: ['ai'], category: 'main', desc: 'AI commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('ai').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐀𝐈 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'logomenu', alias: ['lgmenu'], category: 'main', desc: 'Logo/text-to-image commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('logo').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐋𝐎𝐆𝐎 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'voicemenu', alias: ['vmenu'], category: 'main', desc: 'Voice/TTS commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('voice').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐕𝐎𝐈𝐂𝐄 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'imagemenu', alias: ['imenu'], category: 'main', desc: 'Image effect commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('image').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐈𝐌𝐀𝐆𝐄 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'utilitymenu', alias: ['umenu','utilmenu'], category: 'main', desc: 'Utility commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('utility').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐔𝐓𝐈𝐋𝐈𝐓𝐘 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'religionmenu', alias: ['rmenu','islammenu'], category: 'main', desc: 'Religion commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('religion').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐑𝐄𝐋𝐈𝐆𝐈𝐎𝐍 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'infomenu', alias: ['imenu2'], category: 'main', desc: 'Info commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('info').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐈𝐍𝐅𝐎 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'textmenu', alias: ['tmenu'], category: 'main', desc: 'Text formatting commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('text').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐓𝐄𝐗𝐓 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'randommenu', alias: ['rdmenu'], category: 'main', desc: 'Random commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('random').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐑𝐀𝐍𝐃𝐎𝐌 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'reactionmenu', alias: ['rcmenu'], category: 'main', desc: 'Reaction commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('reaction').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐑𝐄𝐀𝐂𝐓𝐈𝐎𝐍 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'convertmenu', alias: ['cmenu'], category: 'main', desc: 'Conversion commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('convert').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐂𝐎𝐍𝐕𝐄𝐑𝐓 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  },
  {
    name: 'databasemenu', alias: ['dbmenu'], category: 'main', desc: 'Database commands',
    handler: async (ctx) => {
      const cmds = handler.getCommandsByCategory('database').map(c => c.name);
      await menu.sendMenu(ctx.sock, ctx.jid, menu.listCommands(ctx.prefix, '𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄 𝐌𝐄𝐍𝐔', cmds), ctx.m);
    }
  }
];
