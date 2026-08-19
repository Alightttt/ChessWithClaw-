/**
 * Diagnostics and Structured Event Logger for ChessWithClaw
 * Ensures no silent failures occur for state-changing operations.
 */

const MAX_DIAGNOSTICS_LOG = 50;
const diagnosticEvents = [];
const listeners = new Set();

export function recordDiagnostic(category, action, details = {}, error = null) {
  const event = {
    id: 'diag_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    timestamp: new Date().toISOString(),
    category, // 'move' | 'chat' | 'draw' | 'resign' | 'join' | 'heartbeat' | 'thought' | 'realtime' | 'state'
    action,   // e.g. 'send_failed', 'reconnect_attempt', 'subscription_error'
    details,
    error: error ? (error.message || String(error)) : null,
    stack: error?.stack || null
  };

  diagnosticEvents.unshift(event);
  if (diagnosticEvents.length > MAX_DIAGNOSTICS_LOG) {
    diagnosticEvents.pop();
  }

  // Structured console output for dev & forensic capture
  if (error || details?.failed) {
    console.error(`[CWC-DIAGNOSTIC][${category.toUpperCase()}][${action}]`, {
      ...details,
      error: event.error,
      timestamp: event.timestamp
    });
  } else {
    console.warn(`[CWC-DIAGNOSTIC][${category.toUpperCase()}][${action}]`, details);
  }

  listeners.forEach((listener) => {
    try {
      listener(event, diagnosticEvents);
    } catch (e) {
      console.error('Error in diagnostic listener:', e);
    }
  });

  return event;
}

export function getRecentDiagnostics() {
  return [...diagnosticEvents];
}

export function subscribeToDiagnostics(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
