/**
 * Ulric-X MD - Group commands
 */
const config = require('../config');
const utils  = require('../lib/utils');
const store  = require('../lib/store');

module.exports = [
  {
    name: 'add', alias: ['invite'], category: 'group', desc: 'Add user to group',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      const num = ctx.args[0]?.replace(/\D/g, '');
      if (!num) return ctx.reply(`Example: ${ctx.prefix}add 923xxxxxxxxx`);
      try { await ctx.sock.groupParticipantsUpdate(ctx.jid, [num+'@s.whatsapp.net'], 'add'); ctx.reply('✅ Added'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'kick', alias: ['remove'], category: 'group', desc: 'Kick user from group',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      const target = ctx.mentionedJid?.[0] || (ctx.args[0] ? ctx.args[0].replace(/\D/g,'')+'@s.whatsapp.net' : null);
      if (!target) return ctx.reply(`Example: ${ctx.prefix}kick @user`);
      try { await ctx.sock.groupParticipantsUpdate(ctx.jid, [target], 'remove'); ctx.reply('✅ Kicked'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'kickall', alias: ['everyoneout'], category: 'group', desc: 'Kick all non-admins',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      const nonAdmins = ctx.groupMetadata.participants.filter(p => !p.admin && p.id !== ctx.sock.user.id).map(p => p.id);
      for (const id of nonAdmins) {
        try { await ctx.sock.groupParticipantsUpdate(ctx.jid, [id], 'remove'); } catch {}
        await utils.sleep(500);
      }
      ctx.reply(`✅ Kicked ${nonAdmins.length} non-admins`);
    }
  },
  {
    name: 'promote', alias: ['makeadmin'], category: 'group', desc: 'Promote user to admin',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      const target = ctx.mentionedJid?.[0];
      if (!target) return ctx.reply(`Example: ${ctx.prefix}promote @user`);
      try { await ctx.sock.groupParticipantsUpdate(ctx.jid, [target], 'promote'); ctx.reply('✅ Promoted'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'demote', alias: ['unadmin'], category: 'group', desc: 'Demote admin',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      const target = ctx.mentionedJid?.[0];
      if (!target) return ctx.reply(`Example: ${ctx.prefix}demote @user`);
      try { await ctx.sock.groupParticipantsUpdate(ctx.jid, [target], 'demote'); ctx.reply('✅ Demoted'); }
      catch (e) { ctx.reply('❌ ' + e.message); }
    }
  },
  {
    name: 'tagall', alias: ['mentionall'], category: 'group', desc: 'Mention everyone',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      const ps = ctx.groupMetadata.participants;
      let txt = `╭━━❖ 𝐓𝐀𝐆 𝐀𝐋𝐋 ❖━┈⊷\n`;
      for (const p of ps) txt += `┃│ @${p.id.split('@')[0]}\n`;
      txt += `╰━━━━━━━━━━━━━━━┈⊷\n${ctx.q || ''}`;
      await ctx.sock.sendMessage(ctx.jid, { text: txt, mentions: ps.map(p => p.id) }, { quoted: ctx.m });
    }
  },
  {
    name: 'hidetag', alias: ['ht'], category: 'group', desc: 'Hidden tag all',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      const ps = ctx.groupMetadata.participants.map(p => p.id);
      await ctx.sock.sendMessage(ctx.jid, { text: ctx.q || '🔔', mentions: ps }, { quoted: ctx.m });
    }
  },
  {
    name: 'tag', alias: ['t'], category: 'group', desc: 'Tag specific user',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      const target = ctx.mentionedJid?.[0];
      if (!target) return ctx.reply(`Example: ${ctx.prefix}tag @user message`);
      await ctx.sock.sendMessage(ctx.jid, { text: `${ctx.q || ''} @${target.split('@')[0]}`, mentions: [target] }, { quoted: ctx.m });
    }
  },
  {
    name: 'groupjid', alias: ['jid'], category: 'group', desc: 'Get group JID',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      ctx.reply(`Group JID: ${ctx.jid}`);
    }
  },
  {
    name: 'listadmin', alias: ['admins'], category: 'group', desc: 'List group admins',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      const admins = ctx.groupAdmins;
      let t = `╭━━❖ 𝐀𝐃𝐌𝐈𝐍𝐒 (${admins.length}) ❖━┈⊷\n`;
      admins.forEach((a, i) => t += `┃│ ${i+1}. @${a.split('@')[0]}\n`);
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.sock.sendMessage(ctx.jid, { text: t, mentions: admins }, { quoted: ctx.m });
    }
  },
  {
    name: 'mute', alias: ['closegc','lockgc'], category: 'group', desc: 'Mute group (admin only)',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      await ctx.sock.groupSettingUpdate(ctx.jid, 'announcement');
      ctx.reply('✅ Group muted');
    }
  },
  {
    name: 'unmute', alias: ['opengc','unlockgc'], category: 'group', desc: 'Unmute group',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      await ctx.sock.groupSettingUpdate(ctx.jid, 'not_announcement');
      ctx.reply('✅ Group unmuted');
    }
  },
  {
    name: 'linkgc', alias: ['gclink'], category: 'group', desc: 'Get group invite link',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      const link = await ctx.sock.groupInviteCode(ctx.jid);
      ctx.reply(`https://chat.whatsapp.com/${link}`);
    }
  },
  {
    name: 'resetlink', alias: ['revoke'], category: 'group', desc: 'Revoke group invite link',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      await ctx.sock.groupRevokeInvite(ctx.jid);
      ctx.reply('✅ Link revoked');
    }
  },
  {
    name: 'setnamegc', alias: ['setsubject'], category: 'group', desc: 'Set group name',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setnamegc New Name`);
      await ctx.sock.groupUpdateSubject(ctx.jid, ctx.q);
      ctx.reply('✅ Group name updated');
    }
  },
  {
    name: 'setdesc', alias: ['setdescgc'], category: 'group', desc: 'Set group description',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('GroupMultipurpose only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}setdesc New description`);
      await ctx.sock.groupUpdateDescription(ctx.jid, ctx.q);
      ctx.reply('✅ Description updated');
    }
  },
  {
    name: 'setppgc', alias: ['setgcpp'], category: 'group', desc: 'Set group profile picture',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.isBotAdmin) return ctx.reply('Make bot admin first');
      const buf = await ctx.downloadQuoted();
      if (!buf) return ctx.reply('Reply to an image');
      await ctx.sock.updateProfilePicture(ctx.jid, buf);
      ctx.reply('✅ Group picture updated');
    }
  },
  {
    name: 'poll', alias: ['vote'], category: 'group', desc: 'Create a poll',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}poll Question|opt1|opt2|opt3`);
      const [q, ...opts] = ctx.q.split('|');
      if (!q || opts.length < 2) return ctx.reply('Need question and at least 2 options');
      await ctx.sock.sendMessage(ctx.jid, { poll: { name: q.trim(), values: opts.map(o=>o.trim()), selectableCount: 1 } });
    }
  },
  {
    name: 'del', alias: ['delete'], category: 'group', desc: 'Delete bot message',
    handler: async (ctx) => {
      if (!ctx.m.quoted) return ctx.reply('Reply to a message');
      await ctx.sock.sendMessage(ctx.jid, { delete: ctx.m.quoted.key });
    }
  },
  {
    name: 'info', alias: ['groupinfo'], category: 'group', desc: 'Group info',
    handler: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply('Group only');
      const m = ctx.groupMetadata;
      let t = `╭━━❖ 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 ❖━┈⊷\n`;
      t += `┃│ 📛 Name: ${m.subject}\n`;
      t += `┃│ 👥 Members: ${m.participants.length}\n`;
      t += `┃│ 👑 Owner: ${m.owner?.split('@')[0] || 'Unknown'}\n`;
      t += `┃│ 🆔 ID: ${m.id}\n`;
      t += `┃│ 📅 Created: ${new Date(m.creation*1000).toDateString()}\n`;
      t += `┃│ 🔒 Restrict: ${m.restrict ? 'Yes' : 'No'}\n`;
      t += `┃│ 📢 Announce: ${m.announce ? 'Yes' : 'No'}\n`;
      t += `╰━━━━━━━━━━━━━━━┈⊷`;
      ctx.reply(t);
    }
  },
  {
    name: 'creategc', alias: ['newgroup'], category: 'group', desc: 'Create a new group',
    handler: async (ctx) => {
      if (!ctx.isOwner) return ctx.reply('❌ Owner only');
      if (!ctx.q) return ctx.reply(`Example: ${ctx.prefix}creategc Group Name`);
      const res = await ctx.sock.groupCreate(ctx.q, [ctx.sender]);
      ctx.reply(`✅ Created: ${res.id}`);
    }
  },
  // Group feature toggles
  {
    name: 'antilink', alias: [], category: 'group', desc: 'Toggle anti-link',
    handler: async (ctx) => toggleFeature(ctx, 'antilink')
  },
  {
    name: 'antidelete', alias: [], category: 'group', desc: 'Toggle anti-delete',
    handler: async (ctx) => toggleFeature(ctx, 'antidelete')
  },
  {
    name: 'welcome', alias: [], category: 'group', desc: 'Toggle welcome message',
    handler: async (ctx) => toggleFeature(ctx, 'welcome')
  },
  {
    name: 'goodbye', alias: [], category: 'group', desc: 'Toggle goodbye message',
    handler: async (ctx) => toggleFeature(ctx, 'goodbye')
  },
  {
    name: 'antibadword', alias: [], category: 'group', desc: 'Toggle anti-bad-word',
    handler: async (ctx) => toggleFeature(ctx, 'antibadword')
  },
  {
    name: 'antibot', alias: [], category: 'group', desc: 'Toggle anti-bot',
    handler: async (ctx) => toggleFeature(ctx, 'antibot')
  },
  {
    name: 'antiviewonce', alias: ['avo'], category: 'group', desc: 'Toggle anti-view-once',
    handler: async (ctx) => toggleFeature(ctx, 'antiviewonce')
  },
  {
    name: 'autosticker', alias: [], category: 'group', desc: 'Toggle auto-sticker',
    handler: async (ctx) => toggleFeature(ctx, 'autosticker')
  },
  {
    name: 'leveling', alias: ['lvl'], category: 'group', desc: 'Toggle leveling system',
    handler: async (ctx) => toggleFeature(ctx, 'leveling')
  }
];

function toggleFeature(ctx, key) {
  if (!ctx.isGroup) return ctx.reply('Group only');
  if (!ctx.isBotAdmin && !ctx.isOwner) return ctx.reply('Admin only');
  const k = `${key}_${ctx.jid}`;
  const cur = store.getSetting(k, false);
  store.setSetting(k, !cur);
  ctx.reply(`✅ ${key}: ${!cur ? 'ON' : 'OFF'} for this group`);
}
