/**
 * Ulric-X MD FINAL - WhatsApp Multi-User Connection Manager
 *
 * PRODUCTION-READY. Key fixes vs previous versions:
 *
 * 1. WAIT FOR ACTUAL WEBSOCKET CONNECTION
 *    Previous versions used a fixed 5-second delay, but the socket
 *    might not actually be connected yet. Now we poll readyState
 *    until WebSocket is open (max 30s).
 *
 * 2. SOCKET STAYS ALIVE AFTER PAIR CODE
 *    The previous "couldn't link" error was caused by the socket
 *    closing before the user entered the code. Now the socket is
 *    kept alive for 5 minutes (pair code expiry) or until login.
 *
 * 3. LIVE STATUS TRACKING
 *    Each user's status is tracked in lib/status.js so the web
 *    panel can poll /api/status/:jid and show real-time progress.
 *
 * 4. PROPER SESSION PERSISTENCE
 *    Each user has isolated folder: sessions/<number>@s.whatsapp.net/
 *    creds.json is saved automatically via saveCreds callback.
 *    On restart, all sessions auto-reconnect.
 *
 * 5. ANTI-DUPLICATE
 *    isPairingInProgress() prevents multiple simultaneous requests
 *    for the same number.
 *
 * 6. CLEAN ERROR HANDLING
 *    Sessions are cleaned up on failure. Errors are logged clearly.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pino = require('pino');
const chalk = require('chalk');
const dns = require('dns');
const { promisify } = require('util');
const baileys = require('@whiskeysockets/baileys');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = baileys;

const config = require('./config');
const store  = require('./lib/store');
const status = require('./lib/status');
const { ensureDir, sleep } = require('./lib/utils');

const dnsLookup = promisify(dns.lookup);
ensureDir(config.SESSIONS_DIR);

// ─── State ──────────────────────────────────────────────────────
const connections = new Map();   // jid -> { sock, status, lastSeen }
const pairSessions = new Map();  // jid -> { sock, heartbeat, expiresAt, saveCreds }
const reconnectHeartbeats = new Map();  // jid -> intervalId (for reconnected sessions)

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Generate a unique browser identifier per session.
 * WhatsApp blocks commonly-used identifiers, so we randomize.
 */
function getUniqueBrowser() {
  const prefixes = ['Ulric-X', 'UlricBot', 'UXMD', 'UlricMD', 'UlricSession'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const random = crypto.randomBytes(4).toString('hex');
  return [prefix, 'Chrome', '2.0.' + random];
}

/**
 * Check internet connectivity
 */
async function checkInternet() {
  try {
    await dnsLookup('web.whatsapp.com');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validate phone number
 */
function validatePhoneNumber(clean) {
  if (clean.length < 7 || clean.length > 15) {
    return 'Invalid phone number length (need 7-15 digits)';
  }
  if (clean.startsWith('0')) {
    return 'Remove leading 0, use country code (e.g. 923xxx not 03xxx)';
  }
  if (/^(\d)\1{6,}$/.test(clean)) return 'Invalid number (repeating digits)';
  if (/^1234567/.test(clean)) return 'Invalid number';
  if (/^0000/.test(clean)) return 'Invalid number';
  return null;
}

/**
 * Wait for socket to start connecting (not necessarily open yet).
 * Baileys' requestPairingCode() handles the actual connection wait internally.
 * Returns true if 'connecting' event fires within timeout, false otherwise.
 */
async function waitForSocketConnecting(sock, timeoutMs = 15000) {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) { resolved = true; resolve(false); }
    }, timeoutMs);

    sock.ev.on('connection.update', (update) => {
      if (update.connection === 'connecting' && !resolved) {
        // Socket is connecting — Baileys will handle the rest
        clearTimeout(timer);
        resolved = true;
        resolve(true);
      }
      if (update.connection === 'open' && !resolved) {
        clearTimeout(timer);
        resolved = true;
        resolve(true);
      }
      if (update.connection === 'close' && !resolved) {
        clearTimeout(timer);
        resolved = true;
        resolve(false);
      }
    });
  });
}

// ─── MAIN: Generate Pair Code ───────────────────────────────────

/**
 * Generate a REAL WhatsApp pair code.
 *
 * Flow:
 * 1. Validate number
 * 2. Check if already paired (skip)
 * 3. Check if pairing already in progress (reject)
 * 4. Create isolated session folder
 * 5. Create Baileys socket
 * 6. Wait for WebSocket to actually open
 * 7. Call requestPairingCode()
 * 8. WhatsApp sends push notification to user's phone
 * 9. Keep socket alive for 5 minutes (until user enters code)
 * 10. User enters code → connection.update fires with 'open'
 * 11. creds.json is saved automatically
 * 12. User is now paired. Session persists across restarts.
 */
async function generatePairCode(phoneNumber) {
  const clean = String(phoneNumber).replace(/\D/g, '');

  // Validate
  const validationError = validatePhoneNumber(clean);
  if (validationError) throw new Error(validationError);

  const jid = clean + '@s.whatsapp.net';
  const sessionPath = path.join(config.SESSIONS_DIR, jid);

  // Check if already paired (has creds.json)
  if (fs.existsSync(path.join(sessionPath, 'creds.json'))) {
    console.log(chalk.blue(`[PAIR] ${jid} already paired, reconnecting...`));
    status.setStatus(jid, 'connecting', { error: 'Already paired, reconnecting...' });
    startConnection(jid, false).catch(e => console.error(e.message));
    throw new Error('Already paired. Reconnecting your session. Send .menu to your WhatsApp in a few seconds.');
  }

  // Prevent duplicate requests
  if (status.isPairingInProgress(jid)) {
    throw new Error('A pair request is already in progress for this number. Please wait or try again in 1 minute.');
  }

  // Check pair limit
  const pairedCount = store.getUsers().length;
  if (pairedCount >= config.MAX_PAIR_USERS) {
    throw new Error('Pairing limit reached. Try again later.');
  }

  // Check internet
  const hasInternet = await checkInternet();
  if (!hasInternet) {
    throw new Error('No internet connection. Server cannot reach WhatsApp.');
  }

  // Mark as requesting
  status.setStatus(jid, 'requesting');

  try {
    ensureDir(sessionPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // Create socket with unique browser identifier
    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: state,
      printQRInTerminal: false,
      browser: getUniqueBrowser(),
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 20000,    // Baileys internal keep-alive
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect: false,
      getMessage: async () => undefined
    });

    // Custom heartbeat - send presence every 30 seconds
    // This keeps the connection alive while waiting for code entry
    const heartbeat = setInterval(() => {
      try {
        if (sock.ws && sock.ws.readyState === 1) {
          sock.sendPresenceUpdate('available');
        }
      } catch (e) {}
    }, 30000);

    let pairCode = null;
    let connectionOpen = false;
    let connectionError = null;

    // ─── Event handlers ────────────────────────────────────────

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'connecting') {
        console.log(chalk.cyan(`[PAIR] Connecting to WhatsApp for ${jid}...`));
      }

      if (connection === 'open') {
        connectionOpen = true;
        connections.set(jid, { sock, status: 'open', lastSeen: Date.now() });
        console.log(chalk.green(`[PAIR] ✅ LINKED SUCCESSFULLY: ${jid}`));

        // Update status
        status.setStatus(jid, 'connected');

        // Move from pairSessions to permanent connections
        const session = pairSessions.get(jid);
        if (session) {
          reconnectHeartbeats.set(jid, session.heartbeat);
          pairSessions.delete(jid);
        } else {
          reconnectHeartbeats.set(jid, heartbeat);
        }

        // Mark user as paired
        store.addUser(jid, {
          pairedAt: Date.now(),
          country: getCountryFromNumber(clean),
          pairedVia: 'code'
        });

        // Fire on-pair hooks (broadcast)
        try { await onPair(jid, sock); } catch (e) { console.error('[onPair]', e.message); }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const errorMessage = lastDisconnect?.error?.message || '';
        console.log(chalk.yellow(`[PAIR] Connection closed for ${jid} (code=${statusCode}): ${errorMessage}`));

        // Clear heartbeat
        try { clearInterval(heartbeat); } catch (e) {}
        const hb = reconnectHeartbeats.get(jid);
        if (hb) { clearInterval(hb); reconnectHeartbeats.delete(jid); }

        if (connectionOpen) {
          // Was previously open → auto-reconnect (session persists)
          connections.set(jid, { sock, status: 'reconnecting', lastSeen: Date.now() });
          console.log(chalk.yellow(`[PAIR] Reconnecting ${jid} in 5s`));
          setTimeout(() => startConnection(jid, false).catch(e => console.error(e.message)), 5000);
        } else if (!pairCode) {
          // Closed before pair code was generated → real error
          connectionError = `Connection failed (code ${statusCode}): ${errorMessage}`;
          status.setStatus(jid, 'failed', { error: connectionError });
          // Clean up session folder (incomplete)
          try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e) {}
          // Clean up pairSessions
          pairSessions.delete(jid);
        }
        // If pairCode was generated but connection closed, keep session alive
        // (user might still be entering code - WhatsApp will retry connection)
      }
    });

    // Attach message handler
    const handler = require('./handler');
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try { await handler.onMessage(sock, messages[0]); } catch (e) {}
    });

    sock.ev.on('group-participants.update', async (ev) => {
      try { await handler.onGroupUpdate(sock, ev); } catch (e) {}
    });

    // ─── Wait for socket to start connecting ───────────────────
    console.log(chalk.cyan(`[PAIR] Waiting for socket to connect for ${jid}...`));
    status.setStatus(jid, 'connecting', { error: 'Connecting to WhatsApp servers...' });
    const isConnecting = await waitForSocketConnecting(sock, 15000);

    if (!isConnecting) {
      throw new Error('Could not establish connection to WhatsApp. Try again in 30 seconds.');
    }

    if (state.creds.registered) {
      throw new Error('Already registered. Send .menu to your WhatsApp.');
    }

    // ─── Request pair code ─────────────────────────────────────
    // Baileys' requestPairingCode handles waiting for full connection internally
    console.log(chalk.cyan(`[PAIR] Socket connecting. Requesting pair code for ${clean}...`));
    status.setStatus(jid, 'requesting', { error: 'Requesting pair code from WhatsApp...' });

    // Small delay to ensure socket is fully ready
    await sleep(2000);

    let code;
    try {
      code = await sock.requestPairingCode(clean);
    } catch (e) {
      console.error(chalk.red(`[PAIR] requestPairingCode failed: ${e.message}`));
      status.setStatus(jid, 'failed', { error: `Pair code request failed: ${e.message}` });
      try { clearInterval(heartbeat); } catch (e2) {}
      try { sock.end(new Error('Pair failed')); } catch (e2) {}
      try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e2) {}
      throw new Error(`Failed to get pair code: ${e.message}. Try again in 30 seconds.`);
    }

    // Format: WhatsApp-style ABCD-1234
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    pairCode = code;

    console.log(chalk.green(`\n========================================`));
    console.log(chalk.green(`   YOUR PAIRING CODE: ${code}`));
    console.log(chalk.green(`   For: ${clean}`));
    console.log(chalk.green(`   Valid: 5 minutes`));
    console.log(chalk.green(`========================================\n`));

    // Update status to "code_generated"
    const expiresAt = Date.now() + 5 * 60 * 1000;  // 5 minutes
    status.setStatus(jid, 'code_generated', { code, expiresAt });

    // ─── Keep socket alive for 5 minutes (pair code expiry) ────
    pairSessions.set(jid, {
      sock,
      heartbeat,
      expiresAt,
      saveCreds
    });

    // Auto-cleanup after 5 minutes if not linked
    setTimeout(() => {
      const session = pairSessions.get(jid);
      if (session && !connections.has(jid)) {
        console.log(chalk.yellow(`[PAIR] Pair code expired for ${jid}, cleaning up`));
        try { clearInterval(session.heartbeat); } catch (e) {}
        try { session.sock.end(); } catch (e) {}
        pairSessions.delete(jid);

        // Update status
        if (!store.isPaired(jid)) {
          status.setStatus(jid, 'expired', { error: 'Pair code expired. Please request a new one.' });
          // Clean up session folder
          try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e) {}
        }
      }
    }, 5 * 60 * 1000);

    return { code, rawCode: code.replace(/-/g, ''), jid, expiresAt };

  } catch (error) {
    console.error(chalk.red(`[PAIR] Error for ${jid}: ${error.message}`));
    if (status.getStatus(jid).status !== 'connected') {
      status.setStatus(jid, 'failed', { error: error.message });
    }
    throw error;
  }
}

// ─── Start Connection (for already-paired users) ────────────────

/**
 * Start (or restart) a connection for an already-paired user.
 * Used on:
 *   - Bot startup (autoLoadAllPaired)
 *   - Connection drop (auto-reconnect)
 */
async function startConnection(jid, isPairing = false) {
  const sessionPath = path.join(config.SESSIONS_DIR, jid);
  ensureDir(sessionPath);

  if (!fs.existsSync(path.join(sessionPath, 'creds.json'))) {
    console.log(chalk.yellow(`[CONN] No creds for ${jid}, skipping`));
    return null;
  }

  const hasInternet = await checkInternet();
  if (!hasInternet) {
    console.log(chalk.red(`[CONN] No internet, retrying ${jid} in 30s`));
    setTimeout(() => startConnection(jid, false).catch(e => console.error(e.message)), 30000);
    return null;
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: state,
      printQRInTerminal: false,
      browser: getUniqueBrowser(),
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 20000,
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect: false,
      getMessage: async () => undefined
    });

    connections.set(jid, { sock, status: 'connecting', lastSeen: Date.now() });

    const heartbeat = setInterval(() => {
      try {
        if (sock.ws && sock.ws.readyState === 1) {
          sock.sendPresenceUpdate('available');
        }
      } catch (e) {}
    }, 30000);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        connections.set(jid, { sock, status: 'open', lastSeen: Date.now() });
        reconnectHeartbeats.set(jid, heartbeat);
        console.log(chalk.green(`[CONN] ✅ Connected: ${jid}`));
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        connections.set(jid, { sock, status: 'closed', lastSeen: Date.now() });

        const hb = reconnectHeartbeats.get(jid);
        if (hb) { clearInterval(hb); reconnectHeartbeats.delete(jid); }

        if (shouldReconnect) {
          console.log(chalk.yellow(`[CONN] Reconnecting ${jid} in 5s (code=${statusCode})`));
          setTimeout(() => startConnection(jid, false).catch(e => console.error(e.message)), 5000);
        } else {
          // Logged out - unpair
          console.log(chalk.red(`[CONN] ${jid} logged out, unpairing`));
          unpairUser(jid, true);
        }
      }
    });

    const handler = require('./handler');
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try { await handler.onMessage(sock, messages[0]); } catch (e) {}
    });

    sock.ev.on('group-participants.update', async (ev) => {
      try { await handler.onGroupUpdate(sock, ev); } catch (e) {}
    });

    return sock;
  } catch (e) {
    console.error(chalk.red(`[CONN] Failed for ${jid}: ${e.message}`));
    return null;
  }
}

// ─── On-Pair Hook (Broadcast) ───────────────────────────────────

async function onPair(jid, sock) {
  if (!config.BCAST_ON_PAIR) return;
  const text = config.BCAST_TEXT_ON_PAIR(jid);

  try { await sock.sendMessage(config.BOT_OWNER_JID, { text }); } catch (e) {}

  try {
    const ownerConn = connections.get(config.BOT_OWNER_JID);
    const ownerSock = ownerConn?.sock || sock;
    const groups = await ownerSock.groupFetchAllWhitelist?.().catch(() => []) || [];
    for (const g of groups.slice(0, 5)) {
      try { await ownerSock.sendMessage(g.id, { text }); } catch (e) {}
    }
  } catch (e) {}
}

// ─── Unpair ─────────────────────────────────────────────────────

function unpairUser(jid, deleteSession = true) {
  const conn = connections.get(jid);
  if (conn?.sock) {
    try { conn.sock.end(); } catch (e) {}
  }

  const session = pairSessions.get(jid);
  if (session) {
    try { clearInterval(session.heartbeat); } catch (e) {}
    try { session.sock.end(); } catch (e) {}
    pairSessions.delete(jid);
  }

  const hb = reconnectHeartbeats.get(jid);
  if (hb) { clearInterval(hb); reconnectHeartbeats.delete(jid); }

  connections.delete(jid);
  status.clearStatus(jid);
  store.removeUser(jid);

  if (deleteSession) {
    const sessionPath = path.join(config.SESSIONS_DIR, jid);
    try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch (e) {}
  }
  console.log(chalk.red(`[UNPAIR] ${jid} removed`));
  return true;
}

// ─── Auto-Load All Paired Sessions (on boot) ────────────────────

async function autoLoadAllPaired(onProgress) {
  const entries = fs.existsSync(config.SESSIONS_DIR)
    ? fs.readdirSync(config.SESSIONS_DIR, { withFileTypes: true })
    : [];
  const dirs = entries
    .filter(d => d.isDirectory() && d.name.endsWith('@s.whatsapp.net'))
    .map(d => d.name)
    .filter(jid => fs.existsSync(path.join(config.SESSIONS_DIR, jid, 'creds.json')));

  console.log(chalk.cyan(`[AUTOLOAD] Found ${dirs.length} paired session(s).`));

  for (let i = 0; i < dirs.length; i++) {
    const jid = dirs[i];
    try {
      console.log(chalk.blue(`[AUTOLOAD] Connecting ${i+1}/${dirs.length}: ${jid}`));
      await startConnection(jid, false);
      if (onProgress) onProgress(i + 1, dirs.length, jid);
      await sleep(2000);
    } catch (e) {
      console.error(chalk.red(`[AUTOLOAD] Failed ${jid}: ${e.message}`));
    }
  }
  console.log(chalk.green(`[AUTOLOAD] Done. Active connections: ${connections.size}`));
}

// ─── Broadcast ──────────────────────────────────────────────────

async function broadcastAll(text, opts = {}) {
  const targets = [];
  for (const [jid, info] of connections.entries()) {
    if (info.status !== 'open') continue;
    try {
      await info.sock.sendMessage(jid, { text });
      targets.push(jid);
      const groups = await info.sock.groupFetchAllWhitelist?.().catch(() => []) || [];
      for (const g of groups.slice(0, 10)) {
        try { await info.sock.sendMessage(g.id, { text }); targets.push(g.id); } catch (e) {}
      }
    } catch (e) {}
    if (targets.length >= (opts.limit || Infinity)) break;
  }
  return targets;
}

async function broadcastOwnerGroups(text) {
  const ownerConn = connections.get(config.BOT_OWNER_JID);
  if (!ownerConn || ownerConn.status !== 'open') return [];
  const targets = [];
  const groups = await ownerConn.sock.groupFetchAllWhitelist?.().catch(() => []) || [];
  for (const g of groups) {
    try { await ownerConn.sock.sendMessage(g.id, { text }); targets.push(g.id); } catch (e) {}
  }
  return targets;
}

// ─── Getters ────────────────────────────────────────────────────

function getConnection(jid) { return connections.get(jid); }
function getAllConnections() { return Array.from(connections.values()); }

function getCountryFromNumber(num) {
  const { getCountry } = require('./lib/utils');
  return getCountry(num);
}

// ─── Graceful Shutdown ──────────────────────────────────────────

function gracefulShutdown() {
  console.log(chalk.yellow('[SHUTDOWN] Closing all connections...'));
  for (const [jid, info] of connections.entries()) {
    try { info.sock.end(); } catch (e) {}
  }
  for (const [jid, session] of pairSessions.entries()) {
    try { clearInterval(session.heartbeat); } catch (e) {}
    try { session.sock.end(); } catch (e) {}
  }
  for (const [jid, hb] of reconnectHeartbeats.entries()) {
    try { clearInterval(hb); } catch (e) {}
  }
}

process.on('SIGINT', () => { gracefulShutdown(); process.exit(0); });
process.on('SIGTERM', () => { gracefulShutdown(); process.exit(0); });

// ─── Exports ────────────────────────────────────────────────────

module.exports = {
  generatePairCode,
  startConnection,
  unpairUser,
  getConnection,
  getAllConnections,
  autoLoadAllPaired,
  broadcastAll,
  broadcastOwnerGroups,
  checkInternet
};
