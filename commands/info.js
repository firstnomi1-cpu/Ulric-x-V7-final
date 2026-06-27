/**
 * Ulric-X MD - Info commands (lookup, status, system info, etc.)
 */
const axios = require('axios');
const os = require('os');
const fs = require('fs');
const utils = require('../lib/utils');
const config= require('../config');
const store = require('../lib/store');
const pairMgr= require('../pair');
const handler= require('../handler');

module.exports = [
  {
    name: 'botinfo', alias: ['info','about'], category: 'info', desc: 'Show bot information',
    handler: async (ctx) => {
      const mem = process.memoryUsage();
      const text = `╭━━❖. 𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔. ❖━┈⊷
┃╭────────────────
┃│⌬ ›  𝐁𝐎𝐓    : ${config.BOT_NAME}
┃│⌬ ›  𝐎𝐖𝐍𝐄𝐑  : *${config.BOT_OWNER}*
┃│⌬ ›  𝐕𝐄𝐑𝐒𝐈𝐎𝐍 : *${config.BOT_VERSION}*
┃│⌬ ›  𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌 : *${config.BOT_PLATFORM}*
┃╰───────────────
╰━━━━━━━━━━━━━━━┈⊷

> ${config.BOT_FOOTER}`;
      await ctx.replyImg(config.BOT_LOGO, text);
    }
  },
  {
    name: 'owner', alias: ['creator'], category: 'info', desc: 'Show owner info',
    handler: async (ctx) => {
      const text = `╭━━❖ 𝐎𝐖𝐍𝐄𝐑 ❖━┈⊷
┃│ 👑 ${config.BOT_OWNER}
┃│ 📞 +${config.BOT_OWNER_NUM}
┃│ 🤖 ${config.BOT_NAME}
┃╰───────────────
╰━━━━━━━━━━━━━━━┈⊷
> ${config.BOT_FOOTER}`;
      await ctx.replyImg(config.BOT_LOGO, text);
    }
  },
  {
    name: 'system', alias: ['sysinfo'], category: 'info', desc: 'System information',
    handler: async (ctx) => {
      const mem = process.memoryUsage();
      const text = `╭━━❖ 𝐒𝐘𝐒𝐓𝐄𝐌 ❖━┈⊷
┃│ 🖥️ ${os.platform()} ${os.arch()}
┃│ 🧠 ${utils.formatBytes(mem.rss)} / ${utils.formatBytes(os.totalmem())}
┃│ ⏱️ ${utils.runtime(process.uptime())}
┃│ 📦 Node ${process.version}
┃│ 🚀 ${require('os').cpus().length} CPUs
┃╰───────────────
╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(text);
    }
  },
  {
    name: 'me', alias: ['profile'], category: 'info', desc: 'Your profile info',
    handler: async (ctx) => {
      const text = `╭━━❖ 𝐘𝐎𝐔𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ❖━┈⊷
┃│ 👤 Name: ${ctx.pushname}
┃│ 📞 Number: ${ctx.senderNumber}
┃│ 🌍 Country: ${utils.getCountry(ctx.senderNumber)}
┃│ 🆔 ${ctx.sender}
┃╰───────────────
╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(text);
    }
  },
  {
    name: 'chatinfo', alias: ['groupstats'], category: 'info', desc: 'Chat info',
    handler: async (ctx) => {
      if (!ctx.isGroup) {
        ctx.reply(`DM info:\n👤 ${ctx.pushname}\n📞 ${ctx.senderNumber}`);
      } else {
        const m = ctx.groupMetadata;
        ctx.reply(`Group: ${m.subject}\nMembers: ${m.participants.length}\nAdmins: ${ctx.groupAdmins.length}`);
      }
    }
  },
  {
    name: 'ping', alias: ['p'], category: 'info', desc: 'Pong!',
    handler: async (ctx) => ctx.reply('🏓 Pong!')
  },
  {
    name: 'alive', alias: ['online'], category: 'info', desc: 'Check if bot is alive',
    handler: async (ctx) => ctx.reply(`✅ ${config.BOT_NAME} is alive!\n⏱️ Uptime: ${utils.runtime(process.uptime())}`)
  },
  {
    name: 'listcmd', alias: ['cmdlist'], category: 'info', desc: 'Count of commands',
    handler: async (ctx) => ctx.reply(`📦 Total commands: ${handler.getTotalCommands()}\n📂 Categories: ${handler.getAllCategories().length}`)
  },
  {
    name: 'premiumlist', alias: ['premlist'], category: 'info', desc: 'List premium users',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const list = store.getPremium();
      let t = `Premium users (${list.length}):\n`;
      list.forEach((j, i) => t += `${i+1}. ${j.split('@')[0]}\n`);
      ctx.reply(t || 'None');
    }
  },
  {
    name: 'adminlist', alias: ['adminlist2'], category: 'info', desc: 'List admins',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const list = store.getAdmins();
      let t = `Admins (${list.length}):\n`;
      list.forEach((j, i) => t += `${i+1}. ${j.split('@')[0]}\n`);
      ctx.reply(t);
    }
  },
  {
    name: 'version', alias: ['v'], category: 'info', desc: 'Bot version',
    handler: async (ctx) => ctx.reply(`📦 ${config.BOT_NAME} v${config.BOT_VERSION}`)
  },
  {
    name: 'count', alias: ['total'], category: 'info', desc: 'Total commands count',
    handler: async (ctx) => {
      const stats = store.getStats();
      ctx.reply(`╭━━❖ 𝐂𝐎𝐔𝐍𝐓𝐒 ❖━┈⊷\n┃│ 📦 Commands: ${handler.getTotalCommands()}\n┃│ 📊 Total run: ${stats.totalCommandsRun || 0}\n┃│ 👥 Users ever: ${stats.totalUsersEver || 0}\n┃│ 🟢 Online: ${pairMgr.getAllConnections().filter(c=>c.status==='open').length}\n╰━━━━━━━━━━━━━━━┈⊷`);
    }
  }
];
