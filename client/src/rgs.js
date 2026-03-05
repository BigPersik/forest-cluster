/**
 * RGS client — all results from server; no client-side randomization.
 */

export function getUrlParams() {
  const q = new URLSearchParams(window.location.search);
  const defaultRgs = import.meta.env.VITE_RGS_URL || '/rgs';
  return {
    sessionID: q.get('sessionID'),
    lang: q.get('lang') || 'en',
    device: q.get('device') || 'desktop',
    rgs_url: q.get('rgs_url') || defaultRgs,
  };
}

function resolveUrl(base, path) {
  const baseClean = base.startsWith('http') ? base.replace(/\/$/, '') : base.replace(/\/$/, '');
  const pathNorm = path.startsWith('/') ? path : '/' + path;
  return base.startsWith('http') ? baseClean + pathNorm : baseClean + pathNorm;
}

export async function rgsAuthenticate(rgsUrl, sessionID) {
  const url = resolveUrl(rgsUrl, '/wallet/authenticate');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionID }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function rgsPlay(rgsUrl, sessionID, amount, mode = 'BASE') {
  const url = resolveUrl(rgsUrl, '/play');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionID, amount: String(amount), mode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function rgsEndRound(rgsUrl, sessionID) {
  const url = resolveUrl(rgsUrl, '/wallet/end-round');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionID }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function rgsBetEvent(rgsUrl, sessionID, event) {
  const url = resolveUrl(rgsUrl, '/bet/event');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionID, event: JSON.stringify(event) }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
