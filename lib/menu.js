/**
 * Ulric-X MD - Menu builder
 * Renders the WhatsApp-style ASCII menus with the user-supplied logo image
 */
const { BOT_NAME, BOT_OWNER, BOT_VERSION, BOT_PLATFORM, BOT_LOGO, BOT_FOOTER, BOT_PREFIX } = require('../config');

// Box-drawing header used everywhere
const HEADER = (title) => `╭━━❖. ${title}. ❖━┈⊷\n┃╭────────────────`;
const FOOTER = `\n┃╰───────────────\n╰━━━━━━━━━━━━━━━┈⊷`;
const FOOTER_TEXT = `\n\n> ${BOT_FOOTER}`;

function ownerBox() {
  return `${HEADER('𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔')}
┃│⌬ ›  𝐁𝐎𝐓    : ${BOT_NAME}
┃│⌬ ›  𝐎𝐖𝐍𝐄𝐑  : *${BOT_OWNER}*
┃│⌬ ›  𝐕𝐄𝐑𝐒𝐈𝐎𝐍 : *${BOT_VERSION}*
┃│⌬ ›  𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌 : *${BOT_PLATFORM}*${FOOTER}${FOOTER_TEXT}`;
}

function mainMenu(prefix = BOT_PREFIX) {
  return `${HEADER('𝐔𝐋𝐑𝐈𝐂-𝐗 𝐌𝐄𝐍𝐔')}
┃│ 🤖 𝐁𝐎𝐓    : ${BOT_NAME}
┃│ 👑 𝐎𝐖𝐍𝐄𝐑  : ${BOT_OWNER}
┃│ 📦 𝐕𝐄𝐑    : ${BOT_VERSION}
┃│ 🌐 𝐏𝐋𝐀𝐓  : ${BOT_PLATFORM}${FOOTER}

╭━━❖ 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓 ❖━┈⊷
┃│ ➤ ${prefix}allmenu
┃│ ➤ ${prefix}ownermenu
┃│ ➤ ${prefix}groupmenu
┃│ ➤ ${prefix}downloadmenu
┃│ ➤ ${prefix}stickermenu
┃│ ➤ ${prefix}funmenu
┃│ ➤ ${prefix}gamemenu
┃│ ➤ ${prefix}animemenu
┃│ ➤ ${prefix}aimenu
┃│ ➤ ${prefix}logomenu
┃│ ➤ ${prefix}voicemenu
┃│ ➤ ${prefix}imagemenu
┃│ ➤ ${prefix}utilitymenu
┃│ ➤ ${prefix}religionmenu
┃│ ➤ ${prefix}infomenu
┃│ ➤ ${prefix}textmenu
┃│ ➤ ${prefix}randommenu
┃│ ➤ ${prefix}reactionmenu
┃│ ➤ ${prefix}convertmenu
┃│ ➤ ${prefix}databasemenu${FOOTER}${FOOTER_TEXT}`;
}

function listCommands(prefix, title, cmds) {
  const lines = cmds.map(c => `┃│ ➤ ${prefix}${c}`).join('\n');
  return `${HEADER(title)}\n${lines}${FOOTER}${FOOTER_TEXT}`;
}

// Send a menu message with the logo image, contextInfo newsletter forward
async function sendMenu(sock, jid, text, quoted) {
  const baileys = require('@whiskeysockets/baileys');
  return sock.sendMessage(jid, {
    image: { url: BOT_LOGO },
    caption: text,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '@newsletter',
        newsletterName: BOT_NAME,
        serverMessageId: -1
      }
    }
  }, { quoted });
}

module.exports = { HEADER, FOOTER, FOOTER_TEXT, ownerBox, mainMenu, listCommands, sendMenu };
  
