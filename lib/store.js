/**
 * Ulric-X MD - Persistent storage (JSON-based)
 * Stores: paired users, settings, broadcast queue, premium list, banned users
 */
const fs = require('fs');
const path = require('path');
const { ensureDir, readJSON, writeJSON } = require('./utils');

const DB = path.join(__dirname, '..', 'database');
ensureDir(DB);

const FILES = {
  users    : path.join(DB, 'users.json'),
  premium  : path.join(DB, 'premium.json'),
  banned   : path.join(DB, 'banned.json'),
  settings : path.join(DB, 'settings.json'),
  bcast    : path.join(DB, 'broadcast.json'),
  admins   : path.join(DB, 'admins.json'),
  stats    : path.join(DB, 'stats.json')
};

// Cached in-memory
let users    = readJSON(FILES.users, []);
let premium  = readJSON(FILES.premium, []);
let banned   = readJSON(FILES.banned, []);
let settings = readJSON(FILES.settings, {});
let bcast    = readJSON(FILES.bcast, []);
let admins   = readJSON(FILES.admins, []);
let stats    = readJSON(FILES.stats, { totalCommandsRun: 0, totalUsersEver: 0, startedAt: Date.now() });

// Users -----------------------------------------------------------------
const getUsers = () => users;
const getUser  = (jid) => users.find(u => u.jid === jid);
const isPaired = (jid) => users.some(u => u.jid === jid);
const addUser  = (jid, meta = {}) => {
  if (isPaired(jid)) return false;
  const u = {
    jid, number: jid.split('@')[0],
    pairedAt: Date.now(),
    lastSeen: Date.now(),
    commandsRun: 0,
    country: meta.country || 'Unknown',
    ...meta
  };
  users.push(u);
  stats.totalUsersEver = (stats.totalUsersEver || 0) + 1;
  writeJSON(FILES.users, users);
  writeJSON(FILES.stats, stats);
  return true;
};
const removeUser = (jid) => {
  const before = users.length;
  users = users.filter(u => u.jid !== jid);
  writeJSON(FILES.users, users);
  return users.length < before;
};
const updateUser = (jid, patch) => {
  const u = users.find(x => x.jid === jid);
  if (!u) return false;
  Object.assign(u, patch);
  writeJSON(FILES.users, users);
  return true;
};
const incCommandCount = (jid) => {
  const u = users.find(x => x.jid === jid);
  if (u) { u.commandsRun = (u.commandsRun || 0) + 1; u.lastSeen = Date.now(); writeJSON(FILES.users, users); }
  stats.totalCommandsRun = (stats.totalCommandsRun || 0) + 1;
  writeJSON(FILES.stats, stats);
};

// Premium ---------------------------------------------------------------
const getPremium   = () => premium;
const isPremium    = (jid) => premium.includes(jid) || jid === global.BOT_OWNER_JID;
const addPremium   = (jid) => { if (!premium.includes(jid)) { premium.push(jid); writeJSON(FILES.premium, premium); } };
const removePremium= (jid) => { premium = premium.filter(x => x !== jid); writeJSON(FILES.premium, premium); };

// Banned ----------------------------------------------------------------
const getBanned    = () => banned;
const isBanned     = (jid) => banned.includes(jid);
const banUser      = (jid) => { if (!banned.includes(jid)) { banned.push(jid); writeJSON(FILES.banned, banned); } };
const unbanUser    = (jid) => { banned = banned.filter(x => x !== jid); writeJSON(FILES.banned, banned); };

// Admins (additional admins besides owner) ------------------------------
const getAdmins    = () => [...new Set([global.BOT_OWNER_JID, ...admins])];
const isAdmin      = (jid) => getAdmins().includes(jid);
const addAdmin     = (jid) => { if (!admins.includes(jid) && jid !== global.BOT_OWNER_JID) { admins.push(jid); writeJSON(FILES.admins, admins); } };
const removeAdmin  = (jid) => { admins = admins.filter(x => x !== jid); writeJSON(FILES.admins, admins); };

// Settings (per group/DM toggles) --------------------------------------
const getSetting = (key, def = null) => (key in settings) ? settings[key] : def;
const setSetting = (key, val) => { settings[key] = val; writeJSON(FILES.settings, settings); };

// Broadcast queue ------------------------------------------------------
const getBcast    = () => bcast;
const addBcast    = (msg) => { bcast.push({ id: Date.now()+'', msg, ts: Date.now(), sent: 0, failed: 0 }); writeJSON(FILES.bcast, bcast); return bcast[bcast.length-1]; };
const updateBcast = (id, patch) => { const b = bcast.find(x => x.id === id); if (b) { Object.assign(b, patch); writeJSON(FILES.bcast, bcast); } };

// Stats ----------------------------------------------------------------
const getStats = () => stats;

// Reset ----------------------------------------------------------------
const resetStats = () => { stats = { totalCommandsRun: 0, totalUsersEver: users.length, startedAt: Date.now() }; writeJSON(FILES.stats, stats); };

module.exports = {
  FILES,
  getUsers, getUser, isPaired, addUser, removeUser, updateUser, incCommandCount,
  getPremium, isPremium, addPremium, removePremium,
  getBanned, isBanned, banUser, unbanUser,
  getAdmins, isAdmin, addAdmin, removeAdmin,
  getSetting, setSetting,
  getBcast, addBcast, updateBcast,
  getStats, resetStats
};
