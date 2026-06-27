/**
 * Ulric-X MD - Live Status Tracker
 *
 * Tracks per-user login status so the web panel can show real-time progress.
 *
 * Status lifecycle:
 *   idle → requesting → code_generated → connecting → connected
 *                                                    ↘ failed
 *                                                    ↘ expired
 *
 * Each user (jid) has a status object:
 *   { status, code, ts, error, expiresAt }
 */
const statuses = new Map();  // jid -> status object

/**
 * Set status for a user
 */
function setStatus(jid, status, extra = {}) {
  const current = statuses.get(jid) || {};
  statuses.set(jid, {
    status,
    ts: Date.now(),
    code: current.code,
    expiresAt: current.expiresAt,
    error: null,
    ...extra
  });
}

/**
 * Get status for a user
 */
function getStatus(jid) {
  const s = statuses.get(jid);
  if (!s) return { status: 'idle', ts: Date.now() };
  // Auto-expire if past expiry
  if (s.expiresAt && Date.now() > s.expiresAt && s.status === 'code_generated') {
    s.status = 'expired';
  }
  return s;
}

/**
 * Get all statuses (for admin panel)
 */
function getAllStatuses() {
  const result = [];
  for (const [jid, s] of statuses.entries()) {
    if (s.expiresAt && Date.now() > s.expiresAt && s.status === 'code_generated') {
      s.status = 'expired';
    }
    result.push({ jid, ...s });
  }
  return result;
}

/**
 * Clear status for a user
 */
function clearStatus(jid) {
  statuses.delete(jid);
}

/**
 * Check if a user has an active pairing in progress
 * (prevents duplicate requests)
 */
function isPairingInProgress(jid) {
  const s = statuses.get(jid);
  if (!s) return false;
  const activeStates = ['requesting', 'code_generated', 'connecting'];
  if (activeStates.includes(s.status)) {
    // Code generated + still within expiry window
    if (s.status === 'code_generated' && s.expiresAt && Date.now() > s.expiresAt) {
      return false;  // expired, allow new request
    }
    return true;
  }
  return false;
}

module.exports = {
  setStatus,
  getStatus,
  getAllStatuses,
  clearStatus,
  isPairingInProgress
};
