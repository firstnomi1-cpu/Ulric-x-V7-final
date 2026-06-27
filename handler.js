/**
 * Ulric-X MD - Main message handler / command dispatcher
 *
 * Loads all command modules from /commands/, builds a lookup table of
 * command name -> handler, and dispatches incoming messages.
 *
 * Each command module exports an array of command objects:
 *   { name, alias: [], desc, category, use, handler: async (ctx) => {} }
 *
 * The handler receives a `ctx` object:
 *   { sock, m, jid, from, sender, senderNumber, isGroup, isOwner,
 *     isAdmin, isPremium, isBotAdmin, reply, replyImg, replyAudio,
 *     args, q, text, command, prefix, quoted, downloadQuoted, downloadMsg,
 *     groupMetadata, groupAdmins, pushname, store, lib }
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const config = require('./config');
const store  = require('./lib/store');
const utils  = require('./lib/utils');
const menu   = require('./lib/menu');
const pairMgr= require('./pair');

// Aggregate commands from all modules
const commands = new Map();  // lowercased command name -> cmd object
const categories = new Map();// category -> [cmd, ...]
let totalCount = 0;

function loadCommands() {
  const dir = path.join(__dirname, 'commands');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  let total = 0;
  for (const f of files) {
    try {
      const mod = require(path.join(dir, f));
      if (!Array.isArray(mod)) continue;
      for (const cmd of mod) {
        if (!cmd || !cmd.name || typeof cmd.handler !== 'function') continue;
        const names = [cmd.name, ...(cmd.alias || [])].map(s => String(s).toLowerCase());
        for (const n of names) {
          if (!commands.has(n)) commands.set(n, cmd);
        }
        const cat = cmd.category || 'misc';
        if (!categories.has(cat)) categories.set(cat, []);
        categories.get(cat).push(cmd);
        total++;
      }
    } catch (e) {
      console.error(chalk.red(`[CMD LOAD] Failed ${f}: ${e.message}`));
    }
  }
  totalCount = total;
  console.log(chalk.green(`[CMD] Loaded ${total} commands across ${categories.size} categories.`));
  return { total, categories: categories.size };
}

function getCommandsByCategory(cat) { return categories.get(cat) || []; }
function getCommand(name) { return commands.get(name.toLowerCase()); }
function getTotalCommands() { return totalCount; }
function getAllCategories() { return Array.from(categories.keys()); }

// Build context for a command handler
async function buildContext(sock, m) {
  m = utils.smsg(sock, m);
  const baileys = require('@whiskeysockets/baileys');
  const jid = m.key.remoteJid;
  const sender = m.key.participant || m.key.remoteJid;
  const senderNumber = sender.split('@')[0].split(':')[0];
  const isGroup = jid.endsWith('@g.us');
  const isBot = !!m.key.fromMe;

  // Group metadata
  let groupMetadata = null, groupAdmins = [];
  if (isGroup) {
    try { groupMetadata = await sock.groupMetadata(jid); groupAdmins = utils.getGroupAdmins(groupMetadata.participants); } catch {}
  }

  const isOwner = (sender === config.BOT_OWNER_JID) || (senderNumber === config.BOT_OWNER_NUM);
  const isAdmin = isOwner || store.isAdmin(sender);
  const isPremiumUser = store.isPremium(sender);
  const isBotAdmin = isGroup && groupAdmins.some(a => utils.parseMention(a)[0] === sock.user.id);
  const isBanned = store.isBanned(sender);

  const pushname = m.pushName || senderNumber;

  // Body parsing
  const body = m.body || m.text || '';
  const prefix = (body.match(/^[^.?#!~`*-]/) ? '' : (body.match(/^[^.?#!~`*-]+/) || ['.'])[0]) || config.BOT_PREFIX;
  const isCmd = body.startsWith(prefix);
  const withoutPrefix = isCmd ? body.slice(prefix.length) : '';
  const parts = withoutPrefix.split(/\s+/).filter(Boolean);
  const command = (parts[0] || '').toLowerCase();
  const args = parts.slice(1);
  const text = args.join(' ');
  const q = m.quoted?.text || text;

  // Reply helpers
  const reply = async (txt, opts = {}) => {
    if (typeof txt !== 'string') txt = String(txt ?? '');
    return sock.sendMessage(jid, { text: txt, mentions: utils.parseMention(txt), ...opts }, { quoted: m });
  };
  const replyImg = async (url, caption = '', opts = {}) => sock.sendMessage(jid, { image: { url }, caption, ...opts }, { quoted: m });
  const replyAudio = async (url, opts = {}) => sock.sendMessage(jid, { audio: { url }, mimetype: 'audio/mpeg', ...opts }, { quoted: m });
  const replySticker = async (buffer, opts = {}) => sock.sendMessage(jid, { sticker: buffer, ...opts }, { quoted: m });
  const react = async (emoji) => sock.sendMessage(jid, { react: { text: emoji || '✅', key: m.key } });

  // Quoted media download
  const downloadQuoted = async () => m.quoted ? utils.downloadMediaMessage({ message: { [m.quoted.type]: { ...m.quoted } } }, sock) : null;
  const downloadMsg    = async () => utils.downloadMediaMessage(m, sock);

  return {
    sock, m, jid, from: jid, sender, senderNumber, isGroup, isBot, isOwner,
    isAdmin, isPremium: isPremiumUser, isBotAdmin, isBanned,
    reply, replyImg, replyAudio, replySticker, react,
    args, q, text, command, prefix, body, quoted: m.quoted, pushname,
    downloadQuoted, downloadMsg, groupMetadata, groupAdmins,
    store, lib: utils, menu, config
  };
}

// Process a single incoming message
async function onMessage(sock, m) {
  if (!m || !m.message) return;

  const ctx = await buildContext(sock, m).catch(e => null);
  if (!ctx) return;

  // Auto-read & presence
  try {
    if (config.AUTO_READ) await sock.sendReadReceipt(ctx.jid, ctx.sender, [m.key]);
    if (config.AUTO_PRESENCE) await sock.sendPresenceUpdate(config.AUTO_PRESENCE, ctx.jid);
  } catch {}

  // Auto-status view (if it's a status message)
  if (m.key.remoteJid === 'status@broadcast') {
    if (config.AUTO_VIEW_STATUS) {
      try { await sock.readMessages([m.key]); } catch {}
    }
    return;
  }

  const { isCmd, command, isBanned } = ctx;

  // Ban check
  if (isBanned && isCmd) {
    return ctx.reply('╭━━❖ ❌ 𝐁𝐀𝐍𝐍𝐄𝐃 ❖━┈⊷\n┃\n┃ You are banned from using this bot.\n┃ Contact owner to appeal.\n╰━━━━━━━━━━━━━━━┈⊷');
  }

  // Log command
  if (isCmd) {
    console.log(chalk.cyan(`[CMD] ${ctx.senderNumber}: ${ctx.prefix}${command} ${ctx.args.join(' ')}`));
    store.incCommandCount(sock.user.id.split(':')[0] + '@s.whatsapp.net');
  }

  if (!isCmd) {
    // Non-command message -> maybe auto-reply / chatbot / AFK / etc.
    return;
  }

  // Dispatch
  const cmd = getCommand(command);
  if (!cmd) {
    // unknown command -> ignore (or send "unknown" if you prefer)
    return;
  }

  try {
    await cmd.handler(ctx);
  } catch (e) {
    console.error(chalk.red(`[CMD ERR] ${command}: ${e.message}`));
    try { await ctx.reply(`❌ Error executing ${command}: ${e.message}`); } catch {}
  }
}

// Group join/leave events
async function onGroupUpdate(sock, ev) {
  // Could implement welcome/goodbye here
}

module.exports = {
  loadCommands, getCommandsByCategory, getCommand, getTotalCommands, getAllCategories,
  buildContext, onMessage, onGroupUpdate
};
