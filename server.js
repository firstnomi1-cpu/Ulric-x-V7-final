/**
 * Ulric-X MD FINAL - Web Panel (Express)
 *
 * Clean API:
 *   POST /api/pair              - Generate pair code
 *   GET  /api/status/:jid       - Live status for a user (poll this)
 *   GET  /api/state             - Overall bot state
 *   GET  /api/commands          - List all commands
 *   POST /api/login             - Admin login
 *   POST /api/unpair            - Admin: unpair user
 *   POST /api/broadcast         - Admin: broadcast message
 */
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const chalk = require('chalk');

const config = require('./config');
const store  = require('./lib/store');
const status = require('./lib/status');
const utils  = require('./lib/utils');
const pairMgr= require('./pair');
const handler= require('./handler');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ ok: false, error: 'Unauthorized' });
}

// ─── Pages ────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/panel', (req, res) => res.sendFile(path.join(__dirname, 'public', 'panel.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ─── State API ────────────────────────────────────────────────────
app.get('/api/state', (req, res) => {
  try {
    const conns = pairMgr.getAllConnections().map(c => ({
      jid: c.jid,
      number: c.jid.split('@')[0],
      status: c.status,
      lastSeen: c.lastSeen,
      country: utils.getCountry(c.jid.split('@')[0]),
      hidden: utils.hideNumber(c.jid.split('@')[0])
    }));
    const users = store.getUsers().map(u => ({
      jid: u.jid,
      number: u.number,
      pairedAt: u.pairedAt,
      lastSeen: u.lastSeen,
      commandsRun: u.commandsRun || 0,
      country: utils.getCountry(u.number),
      hidden: utils.hideNumber(u.number)
    }));
    const stats = store.getStats();
    return res.json({
      ok: true,
      bot: { name: config.BOT_NAME, version: config.BOT_VERSION, owner: config.BOT_OWNER },
      connections: conns,
      users,
      stats: {
        ...stats,
        totalCommands: handler.getTotalCommands(),
        uptime: utils.runtime(process.uptime())
      }
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── Pair (POST /api/pair) ────────────────────────────────────────
app.post('/api/pair', async (req, res) => {
  const startTime = Date.now();
  try {
    const { number } = req.body || {};
    if (!number) return res.json({ ok: false, error: 'Phone number is required' });

    const clean = String(number).replace(/\D/g, '');
    if (clean.length < 7 || clean.length > 15) {
      return res.json({ ok: false, error: 'Invalid number length (need 7-15 digits)' });
    }
    if (clean.startsWith('0')) {
      return res.json({ ok: false, error: 'Remove leading 0, use country code (e.g. 923xxx)' });
    }

    const jid = clean + '@s.whatsapp.net';

    // Check for duplicate request
    if (status.isPairingInProgress(jid)) {
      const current = status.getStatus(jid);
      if (current.status === 'code_generated' && current.code) {
        return res.json({
          ok: true,
          code: current.code,
          jid,
          elapsed: Date.now() - startTime,
          message: 'Pair code already generated. Use the existing code.',
          expiresAt: current.expiresAt
        });
      }
      return res.json({ ok: false, error: 'A pair request is already in progress. Please wait.' });
    }

    // Generate pair code
    const result = await pairMgr.generatePairCode(clean);
    const elapsed = Date.now() - startTime;
    console.log(chalk.green(`[API] Pair code generated in ${elapsed}ms for ${clean}`));

    return res.json({
      ok: true,
      code: result.code,
      rawCode: result.rawCode,
      jid: result.jid,
      elapsed,
      expiresAt: result.expiresAt,
      instructions: {
        step1: 'Open WhatsApp on your phone',
        step2: 'Go to Settings → Linked Devices',
        step3: 'Tap "Link a Device"',
        step4: 'Tap "Link with phone number instead"',
        step5: `Enter this code: ${result.code}`
      }
    });
  } catch (e) {
    console.error(chalk.red(`[API] Pair error: ${e.message}`));
    return res.json({ ok: false, error: e.message });
  }
});

// ─── Live Status (GET /api/status/:jid) ──────────────────────────
// The web panel polls this every 2 seconds to update the UI
app.get('/api/status/:jid', (req, res) => {
  const jid = req.params.jid;
  const s = status.getStatus(jid);
  const conn = pairMgr.getConnection(jid);

  return res.json({
    ok: true,
    jid,
    status: s.status,
    code: s.code,
    error: s.error,
    ts: s.ts,
    expiresAt: s.expiresAt,
    connected: conn ? conn.status === 'open' : false,
    connectionStatus: conn ? conn.status : 'disconnected'
  });
});

// ─── Cancel pairing (POST /api/cancel) ───────────────────────────
app.post('/api/cancel', (req, res) => {
  const { jid } = req.body || {};
  if (!jid) return res.json({ ok: false, error: 'jid required' });

  // Clean up
  try { pairMgr.unpairUser(jid, true); } catch (e) {}
  status.clearStatus(jid);
  return res.json({ ok: true });
});

// ─── Unpair (admin only) ─────────────────────────────────────────
app.post('/api/unpair', requireAdmin, (req, res) => {
  const { jid } = req.body || {};
  if (!jid) return res.json({ ok: false, error: 'jid required' });
  pairMgr.unpairUser(jid, true);
  return res.json({ ok: true });
});

// ─── Broadcast (admin only) ──────────────────────────────────────
app.post('/api/broadcast', requireAdmin, async (req, res) => {
  const { text, mode } = req.body || {};
  if (!text) return res.json({ ok: false, error: 'text required' });
  const rec = store.addBcast(text);
  let targets = [];
  try {
    if (mode === 'owner_groups') {
      targets = await pairMgr.broadcastOwnerGroups(text);
    } else {
      targets = await pairMgr.broadcastAll(text);
    }
    store.updateBcast(rec.id, { sent: targets.length, failed: 0 });
    return res.json({ ok: true, sent: targets.length });
  } catch (e) {
    return res.json({ ok: false, error: e.message });
  }
});

// ─── Admin login ─────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password === config.ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Wrong password' });
});
app.post('/api/logout', (req, res) => { req.session.destroy(); res.json({ ok: true }); });

// ─── Commands list ───────────────────────────────────────────────
app.get('/api/commands', (req, res) => {
  const all = [];
  for (const cat of handler.getAllCategories()) {
    for (const c of handler.getCommandsByCategory(cat)) {
      all.push({ name: c.name, alias: c.alias || [], desc: c.desc || '', category: cat });
    }
  }
  return res.json({ ok: true, total: handler.getTotalCommands(), commands: all });
});

// ─── Ban / unban / premium ───────────────────────────────────────
app.post('/api/ban', requireAdmin, (req, res) => {
  const { jid } = req.body;
  if (!jid) return res.json({ ok: false, error: 'jid required' });
  store.banUser(jid);
  return res.json({ ok: true });
});
app.post('/api/unban', requireAdmin, (req, res) => {
  const { jid } = req.body;
  if (!jid) return res.json({ ok: false, error: 'jid required' });
  store.unbanUser(jid);
  return res.json({ ok: true });
});
app.post('/api/premium', requireAdmin, (req, res) => {
  const { jid, action } = req.body;
  if (!jid) return res.json({ ok: false, error: 'jid required' });
  if (action === 'add') store.addPremium(jid); else store.removePremium(jid);
  return res.json({ ok: true });
});

// ─── Start ───────────────────────────────────────────────────────
function startServer(port = config.PORT) {
  return app.listen(port, '0.0.0.0', () => {
    console.log(chalk.green(`[WEB] Panel running on http://0.0.0.0:${port}`));
  });
}

module.exports = { startServer, app };
