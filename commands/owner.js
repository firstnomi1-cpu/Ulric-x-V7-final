/**
 * Ulric-X MD - Owner commands
 */
const config = require('../config');
const utils  = require('../lib/utils');
const store  = require('../lib/store');
const pairMgr= require('../pair');
const fs = require('fs');
const path = require('path');

module.exports = [
  {
    name: 'self', alias: ['private'], category: 'owner', desc: 'Self mode (only owner)',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      config.SELF_MODE = true;
      store.setSetting('mode', 'self');
      ctx.reply('✅ Self mode active. Bot only responds to owner.');
    }
  },
  {
    name: 'public', alias: ['pub'], category: 'owner', desc: 'Public mode (everyone)',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      config.SELF_MODE = false;
      store.setSetting('mode', 'public');
      ctx.reply('✅ Public mode active. Bot responds to everyone.');
    }
  },
  {
    name: 'block', alias: ['ban'], category: 'owner', desc: 'Block a user',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const target = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0].replace(/\D/g,'')+'@s.whatsapp.net' : null);
      if (!target) return ctx.reply(`Example: ${ctx.prefix}block @user`);
      store.banUser(target);
      try { await ctx.sock.updateBlockStatus(target, 'block'); } catch {}
      ctx.reply(`✅ Blocked ${target.split('@')[0]}`);
    }
  },
  {
    name: 'unblock', alias: ['unban'], category: 'owner', desc: 'Unblock a user',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const target = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0].replace(/\D/g,'')+'@s.whatsapp.net' : null);
      if (!target) return ctx.reply(`Example: ${ctx.prefix}unblock @user`);
      store.unbanUser(target);
      try { await ctx.sock.updateBlockStatus(target, 'unblock'); } catch {}
      ctx.reply(`✅ Unblocked ${target.split('@')[0]}`);
    }
  },
  {
    name: 'broadcast', alias: ['bcast','bc'], category: 'owner', desc: 'Broadcast to all paired users',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}broadcast Hello everyone!`);
      const targets = await pairMgr.broadcastAll(ctx.q);
      ctx.reply(`✅ Broadcast sent to ${targets.length} chats/users.`);
    }
  },
  {
    name: 'bcastgc', alias: ['broadcastgroup'], category: 'owner', desc: 'Broadcast to owner groups only',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}bcastgc Hello groups!`);
      const targets = await pairMgr.broadcastOwnerGroups(ctx.q);
      ctx.reply(`✅ Broadcast sent to ${targets.length} groups.`);
    }
  },
  {
    name: 'setppbot', alias: ['setbotpp'], category: 'owner', desc: 'Set bot profile picture',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const buf = await ctx.downloadQuoted();
      if (!buf) return ctx.reply('Reply to an image');
      try { await ctx.sock.updateProfilePicture(ctx.sock.user.id, buf); ctx.reply('✅ Profile picture updated'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'setname', alias: ['setbotname'], category: 'owner', desc: 'Set bot display name',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setname My Bot`);
      try { await ctx.sock.updateProfileName(ctx.q); ctx.reply('✅ Name updated'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'setbio', alias: ['setstatus'], category: 'owner', desc: 'Set bot about/bio',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setbio Available`);
      try { await ctx.sock.updateProfileStatus(ctx.q); ctx.reply('✅ Bio updated'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'autobio', alias: [], category: 'owner', desc: 'Toggle auto bio with time',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const cur = store.getSetting('autobio', false);
      store.setSetting('autobio', !cur);
      ctx.reply(`✅ Auto-bio: ${!cur ? 'ON' : 'OFF'}`);
    }
  },
  {
    name: 'autoread', alias: [], category: 'owner', desc: 'Toggle auto read messages',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      config.AUTO_READ = !config.AUTO_READ;
      store.setSetting('autoread', config.AUTO_READ);
      ctx.reply(`✅ Auto-read: ${config.AUTO_READ ? 'ON' : 'OFF'}`);
    }
  },
  {
    name: 'autoviewstatus', alias: ['avs'], category: 'owner', desc: 'Toggle auto view status',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      config.AUTO_VIEW_STATUS = !config.AUTO_VIEW_STATUS;
      store.setSetting('autoviewstatus', config.AUTO_VIEW_STATUS);
      ctx.reply(`✅ Auto-view status: ${config.AUTO_VIEW_STATUS ? 'ON' : 'OFF'}`);
    }
  },
  {
    name: 'autotyping', alias: [], category: 'owner', desc: 'Toggle auto typing presence',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      config.AUTO_PRESENCE = (config.AUTO_PRESENCE === 'composing') ? 'available' : 'composing';
      store.setSetting('autopresence', config.AUTO_PRESENCE);
      ctx.reply(`✅ Auto-presence: ${config.AUTO_PRESENCE}`);
    }
  },
  {
    name: 'autorecording', alias: [], category: 'owner', desc: 'Toggle auto recording presence',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      config.AUTO_PRESENCE = (config.AUTO_PRESENCE === 'recording') ? 'available' : 'recording';
      store.setSetting('autopresence', config.AUTO_PRESENCE);
      ctx.reply(`✅ Auto-presence: ${config.AUTO_PRESENCE}`);
    }
  },
  {
    name: 'addowner', alias: ['addadmin'], category: 'owner', desc: 'Add another owner/admin',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const t = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0].replace(/\D/g,'')+'@s.whatsapp.net' : null);
      if (!t) return ctx.reply(`Example: ${ctx.prefix}addowner @user`);
      store.addAdmin(t);
      ctx.reply(`✅ Added admin: ${t.split('@')[0]}`);
    }
  },
  {
    name: 'delowner', alias: ['deladmin'], category: 'owner', desc: 'Remove admin',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const t = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0].replace(/\D/g,'')+'@s.whatsapp.net' : null);
      if (!t) return ctx.reply(`Example: ${ctx.prefix}delowner @user`);
      store.removeAdmin(t);
      ctx.reply(`✅ Removed admin: ${t.split('@')[0]}`);
    }
  },
  {
    name: 'addprem', alias: ['addpremium'], category: 'owner', desc: 'Add premium user',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const t = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0].replace(/\D/g,'')+'@s.whatsapp.net' : null);
      if (!t) return ctx.reply(`Example: ${ctx.prefix}addprem @user`);
      store.addPremium(t);
      ctx.reply(`✅ Premium added: ${t.split('@')[0]}`);
    }
  },
  {
    name: 'delprem', alias: ['delpremium'], category: 'owner', desc: 'Remove premium user',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const t = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0].replace(/\D/g,'')+'@s.whatsapp.net' : null);
      if (!t) return ctx.reply(`Example: ${ctx.prefix}delprem @user`);
      store.removePremium(t);
      ctx.reply(`✅ Premium removed: ${t.split('@')[0]}`);
    }
  },
  {
    name: 'runtime', alias: ['uptime'], category: 'owner', desc: 'Show bot uptime',
    handler: async (ctx) => ctx.reply(`⏱️ Runtime: ${utils.runtime(process.uptime())}`)
  },
  {
    name: 'speed', alias: ['ping'], category: 'owner', desc: 'Bot speed/ping',
    handler: async (ctx) => {
      const t = Date.now();
      await ctx.reply('⚡ Speed test...');
      ctx.reply(`⚡ Response: ${Date.now() - t}ms`);
    }
  },
  {
    name: 'getpp', alias: ['getpic'], category: 'owner', desc: 'Get profile picture of user',
    handler: async (ctx) => {
      const t = ctx.mentionedJid?.[0] || ctx.sender;
      try {
        const url = await ctx.sock.profilePictureUrl(t, 'image');
        await ctx.replyImg(url, `Profile picture of ${t.split('@')[0]}`);
      } catch { ctx.reply('No profile picture or private'); }
    }
  },
  {
    name: 'setprefix', alias: ['prefix'], category: 'owner', desc: 'Change bot prefix',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.args[0]) return ctx.reply(`Current prefix: ${config.BOT_PREFIX}\nExample: ${ctx.prefix}setprefix !`);
      config.BOT_PREFIX = ctx.args[0];
      store.setSetting('prefix', ctx.args[0]);
      ctx.reply(`✅ Prefix set to: ${ctx.args[0]}`);
    }
  },
  {
    name: 'cleartmp', alias: ['clear'], category: 'owner', desc: 'Clear temp files',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const tmp = require('os').tmpdir();
      let count = 0;
      try { fs.readdirSync(tmp).forEach(f => { if (f.startsWith('ulric-')) { try { fs.unlinkSync(path.join(tmp, f)); count++; } catch {} } }); } catch {}
      ctx.reply(`✅ Cleared ${count} temp files`);
    }
  },
  {
    name: 'restart', alias: ['reboot'], category: 'owner', desc: 'Restart bot (PM2)',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      ctx.reply('🔄 Restarting...');
      setTimeout(() => process.exit(0), 1000);
    }
  },
  {
    name: 'shutdown', alias: ['kill'], category: 'owner', desc: 'Stop bot',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      ctx.reply('🛑 Shutting down...');
      setTimeout(() => process.exit(0), 1000);
    }
  },
  {
    name: 'listuser', alias: ['users','pairedusers'], category: 'owner', desc: 'List all paired users',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const us = store.getUsers();
      if (!us.length) return ctx.reply('No paired users');
      let t = `╭━━❖ 𝐏𝐀𝐈𝐑𝐄𝐃 𝐔𝐒𝐄𝐑𝐒 (${us.length}) ❖━┈⊷\n`;
      us.slice(0, 50).forEach((u, i) => { t += `┃│ ${i+1}. ${u.number} | cmds: ${u.commandsRun||0} | ${new Date(u.pairedAt).toDateString()}\n`; });
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(t);
    }
  },
  {
    name: 'listonline', alias: ['online'], category: 'owner', desc: 'List online/connected users',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const conns = pairMgr.getAllConnections().filter(c => c.status === 'open');
      if (!conns.length) return ctx.reply('No active connections');
      let t = `╭━━❖ 𝐎𝐍𝐋𝐈𝐍𝐄 (${conns.length}) ❖━┈⊷\n`;
      conns.forEach((c, i) => { t += `┃│ ${i+1}. ${c.jid.split('@')[0]} | ${c.status}\n`; });
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(t);
    }
  },
  {
    name: 'unpair', alias: ['kickuser'], category: 'owner', desc: 'Unpair a user by number',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const num = ctx.args[0]?.replace(/\D/g, '');
      if (!num) return ctx.reply(`Example: ${ctx.prefix}unpair 923xxxxxxxxx`);
      pairMgr.unpairUser(num + '@s.whatsapp.net', true);
      ctx.reply(`✅ Unpaired ${num}`);
    }
  },
  {
    name: 'stats', alias: ['botstats'], category: 'owner', desc: 'Show bot statistics',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      const s = store.getStats();
      const mem = process.memoryUsage();
      let t = `╭━━❖ 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐒 ❖━┈⊷\n`;
      t += `┃│ 🤖 Bot: ${config.BOT_NAME}\n`;
      t += `┃│ ⏱️ Uptime: ${utils.runtime(process.uptime())}\n`;
      t += `┃│ 💾 Memory: ${utils.formatBytes(mem.rss)}\n`;
      t += `┃│ 👥 Paired users: ${store.getUsers().length}\n`;
      t += `┃│ 🟢 Online: ${pairMgr.getAllConnections().filter(c=>c.status==='open').length}\n`;
      t += `┃│ 💎 Premium: ${store.getPremium().length}\n`;
      t += `┃│ 🚫 Banned: ${store.getBanned().length}\n`;
      t += `┃│ 📊 Total cmds run: ${s.totalCommandsRun||0}\n`;
      t += `┃│ 📦 Commands available: ${require('../handler').getTotalCommands()}\n`;
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(t);
    }
  },
  {
    name: 'ccgen', alias: ['creditcard'], category: 'owner', desc: 'Generate test credit card number (educational)',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      // Generates a Luhn-valid test number (not real)
      const prefixes = ['4','5','3','6'];
      const p = utils.pickRandom(prefixes);
      let num = p;
      for (let i = 0; i < 14; i++) num += utils.randInt(0, 9);
      // Luhn checksum
      let sum = 0; let alt = false;
      for (let i = num.length - 1; i >= 0; i--) {
        let n = parseInt(num[i], 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n; alt = !alt;
      }
      const check = (10 - (sum % 10)) % 10;
      num += check;
      ctx.reply(`Test card (Luhn-valid, NOT real):\n${num}\nEXP: 12/30\nCVV: ${utils.randInt(100,999)}\n\n⚠️ For educational/testing only.`);
    }
  },
  {
    name: 'join', alias: ['join gc'], category: 'owner', desc: 'Join group via invite link',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.args[0]) return ctx.reply(`Example: ${ctx.prefix}join https://chat.whatsapp.com/abc`);
      const link = ctx.args[0].split('/').pop();
      try { await ctx.sock.groupAcceptInvite(link); ctx.reply('✅ Joined'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'leave', alias: ['leavegc'], category: 'owner', desc: 'Leave current group',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.isGroup) return ctx.reply('Group only');
      await ctx.reply('👋 Leaving...');
      await ctx.sock.groupLeave(ctx.jid);
    }
  },
  {
    name: 'fixowner', alias: ['fix'], category: 'owner', desc: 'Reset owner settings',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      store.setSetting('mode', 'public');
      config.SELF_MODE = false;
      ctx.reply('✅ Settings reset');
    }
  }
];
