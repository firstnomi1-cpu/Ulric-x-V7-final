/**
 * Ulric-X MD - Utility helpers
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const chalk = require('chalk');

const sleep   = (ms) => new Promise(r => setTimeout(r, ms));
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt   = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const isUrl     = (s) => /^https?:\/\//i.test(s);
const getRandom = (ext = '') => `${Math.random().toString(36).slice(2)}${ext}`;

const runtime   = (seconds) => {
  seconds = parseInt(seconds, 10);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
};

const clockString = (seconds) => runtime(seconds);

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024; const sizes = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatNumber = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const tanggal = (d = new Date()) => {
  const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getTime = (tz = 'Asia/Karachi') => {
  const m = require('moment-timezone');
  return m().tz(tz).format('HH:mm:ss');
};

// URL safe base64
const b64 = {
  encode: (s) => Buffer.from(s).toString('base64'),
  decode: (s) => Buffer.from(s, 'base64').toString('utf8')
};

// Color helpers for console
const color = (txt, c = 'green') => chalk[c] ? chalk[c](txt) : txt;

// JSON fetcher with timeout
async function fetchJson(url, opts = {}) {
  try {
    const r = await axios({ url, method: opts.method || 'GET', timeout: opts.timeout || 15000, ...opts });
    return r.data;
  } catch (e) { return null; }
}

async function getBuffer(url, opts = {}) {
  try {
    const r = await axios({ url, method: 'GET', responseType: 'arraybuffer', timeout: opts.timeout || 30000, ...opts });
    return Buffer.from(r.data);
  } catch (e) { return null; }
}

// Download media message helper using Baileys
async function downloadMediaMessage(msg, sock) {
  try {
    if (!msg || !msg.message) return null;
    const baileys = require('@whiskeysockets/baileys');
    const { downloadContentFromMessage } = baileys;
    let type = Object.keys(msg.message)[0];
    let m = msg.message[type];
    if (type === 'viewOnceMessage')  { type = Object.keys(m.message)[0]; m = m.message[type]; }
    if (type === 'viewOnceMessageV2'){ type = Object.keys(m.message)[0]; m = m.message[type]; }
    const mime = (m.mimetype || '').split('/')[0];
    const stream = await downloadContentFromMessage(m, mime);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
  } catch (e) { return null; }
}

// File system helpers
const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); return p; };
const readJSON  = (p, def = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return def; } };
const writeJSON = (p, v) => { ensureDir(path.dirname(p)); fs.writeFileSync(p, JSON.stringify(v, null, 2)); return v; };

// Pick field from message
function smsg(conn, m) {
  try {
    if (!m.message) return m;
    const baileys = require('@whiskeysockets/baileys');
    const { getContentType } = baileys;
    const type = getContentType(m.message);
    if (!type) return m;
    m.type = type.replace('Message', '');
    try { m.mentionedJid = (m.message[type].contextInfo && m.message[type].contextInfo.mentionedJid) || []; } catch { m.mentionedJid = []; }
    try { m.quoted = m.message[type].contextInfo?.quotedMessage || null; } catch { m.quoted = null; }
    if (m.quoted) {
      const qtype = Object.keys(m.quoted)[0];
      m.quoted.type = qtype ? qtype.replace('Message','') : null;
      m.quoted.sender = m.message[type].contextInfo.participant || '';
      m.quoted.fromMe = m.quoted.sender === (conn.user?.id || '');
      m.quoted.text = m.quoted[qtype]?.caption || m.quoted[qtype]?.text || '';
    }
    let body = (type === 'conversation') ? m.message.conversation
             : (type === 'imageMessage') ? m.message.imageMessage.caption
             : (type === 'videoMessage') ? m.message.videoMessage.caption
             : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text
             : (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId
             : (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply?.selectedRowId
             : '';
    m.body = body || '';
    m.text = body || '';
    return m;
  } catch (e) { return m; }
}

// Tag someone
const parseMention = (text = '') => [...text.matchAll(/@(\d{5,16})\b/g)].map(x => x[1] + '@s.whatsapp.net');

const getGroupAdmins = (participants) => participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);

// Banner
const banner = () => {
  try {
    const figlet = require('figlet');
    return figlet.textSync('ULRIC-X MD', { font: 'Standard', horizontalLayout: 'default' });
  } catch { return 'ULRIC-X MD'; }
};

// HTML escape for web
const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

// Country code lookup (compact)
function getCountry(num) {
  const c = {
    '93':'🇦🇫 Afghanistan','355':'🇦🇱 Albania','213':'🇩🇿 Algeria','20':'🇪🇬 Egypt','92':'🇵🇰 Pakistan',
    '91':'🇮🇳 India','880':'🇧🇩 Bangladesh','977':'🇳🇵 Nepal','94':'🇱🇰 Sri Lanka','960':'🇲🇻 Maldives',
    '971':'🇦🇪 UAE','966':'🇸🇦 Saudi Arabia','98':'🇮🇷 Iran','964':'🇮🇶 Iraq','90':'🇹🇷 Turkey',
    '1':'🇺🇸 USA','44':'🇬🇧 UK','49':'🇩🇪 Germany','33':'🇫🇷 France','39':'🇮🇹 Italy','34':'🇪🇸 Spain',
    '7':'🇷🇺 Russia','86':'🇨🇳 China','81':'🇯🇵 Japan','82':'🇰🇷 Korea','62':'🇮🇩 Indonesia',
    '60':'🇲🇾 Malaysia','65':'🇸🇬 Singapore','66':'🇹🇭 Thailand','84':'🇻🇳 Vietnam','61':'🇦🇺 Australia',
    '55':'🇧🇷 Brazil','52':'🇲🇽 Mexico','54':'🇦🇷 Argentina','234':'🇳🇬 Nigeria','254':'🇰🇪 Kenya',
    '27':'🇿🇦 South Africa','212':'🇲🇦 Morocco','233':'🇬🇭 Ghana','256':'🇺🇬 Uganda','255':'🇹🇿 Tanzania'
  };
  const keys = Object.keys(c).sort((a,b) => b.length - a.length);
  for (const k of keys) if (num.startsWith(k)) return c[k];
  return '🌍 Unknown';
}

function hideNumber(num) {
  if (!num || num.length < 6) return num;
  return num.slice(0,3) + '****' + num.slice(-4);
}

// Random hex color
const randHex = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6,'0');

// Pretty JSON
const jsonformat = (obj) => JSON.stringify(obj, null, 2);

module.exports = {
  sleep, pickRandom, randInt, isUrl, getRandom, runtime, clockString, formatBytes, formatNumber,
  tanggal, getTime, b64, color, fetchJson, getBuffer, downloadMediaMessage, ensureDir, readJSON,
  writeJSON, smsg, parseMention, getGroupAdmins, banner, escapeHtml, getCountry, hideNumber,
  randHex, jsonformat
};
