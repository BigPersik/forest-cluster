/**
 * Stake Engine–compatible RGS mock.
 * Stateless: every /play computes result at initiation (deterministic seed from session + round).
 * No client-side randomization. Supports Replay (return same events) and Social mode (config flag).
 */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runSpin, toRGSEvents } from '../math/game-loop.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());

const PRECISION = 1e6; // 1 = 1_000_000
const DEFAULT_BALANCE = 100 * PRECISION; // 100.00
const sessions = new Map();

function parseAmount(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : 0;
}

function getOrCreateSession(sessionID) {
  if (!sessions.has(sessionID)) {
    sessions.set(sessionID, {
      balance: DEFAULT_BALANCE,
      round: null,
      roundId: 0,
    });
  }
  return sessions.get(sessionID);
}

// Deterministic seed: session hash + roundId (no client input).
function seedFromSession(sessionID, roundId) {
  let h = 0;
  const s = sessionID + '|' + roundId;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  return h;
}

app.post('/wallet/authenticate', (req, res) => {
  const sessionID = req.body?.sessionID;
  if (!sessionID) {
    return res.status(400).json({ code: 'ERR_VAL', message: 'Invalid Request' });
  }
  const sess = getOrCreateSession(sessionID);
  res.json({
    balance: { amount: String(sess.balance), currency: 'USD' },
    config: {
      minBet: 100000,
      maxBet: 1000000000,
      stepBet: 100000,
      defaultBetLevel: 1000000,
      betLevels: [100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000, 100000000],
      jurisdiction: {
        socialCasino: false,
        disabledFullscreen: false,
        disabledTurbo: false,
      },
    },
    round: sess.round,
  });
});

app.post('/wallet/balance', (req, res) => {
  const sessionID = req.body?.sessionID;
  if (!sessionID) return res.status(400).json({ code: 'ERR_VAL' });
  const sess = getOrCreateSession(sessionID);
  res.json({ balance: { amount: String(sess.balance), currency: 'USD' } });
});

app.post('/play', (req, res) => {
  const sessionID = req.body?.sessionID;
  const amount = parseAmount(req.body?.amount);
  const mode = (req.body?.mode || 'BASE').toUpperCase();
  const featureEntry = req.body?.featureEntry || null;

  if (!sessionID || amount < 100000) {
    return res.status(400).json({ code: 'ERR_VAL', message: 'Invalid Request' });
  }

  const sess = getOrCreateSession(sessionID);
  if (sess.balance < amount) {
    return res.status(400).json({ code: 'ERR_IPB', message: 'Insufficient Player Balance' });
  }

  sess.roundId += 1;
  const seed = seedFromSession(sessionID, sess.roundId);
  const gameMode = mode === 'SUPER' ? 'SUPER' : 'NORMAL';
  const round = runSpin(seed, gameMode, featureEntry);

  const payoutMultiplier = round.totalMultiplier;
  const winAmount = Math.floor(amount * payoutMultiplier);
  sess.balance = sess.balance - amount + winAmount;

  const events = toRGSEvents(round, gameMode === 'SUPER' ? 'super' : 'basegame');
  sess.round = {
    id: String(sess.roundId),
    bet: amount,
    win: winAmount,
    payoutMultiplier,
    events,
    seed,
    mode: gameMode,
  };

  res.json({
    balance: { amount: String(sess.balance), currency: 'USD' },
    round: {
      id: sess.round.id,
      bet: String(sess.round.bet),
      win: String(sess.round.win),
      payoutMultiplier: sess.round.payoutMultiplier,
      events: sess.round.events,
    },
  });
});

app.post('/wallet/end-round', (req, res) => {
  const sessionID = req.body?.sessionID;
  if (!sessionID) return res.status(400).json({ code: 'ERR_VAL' });
  const sess = getOrCreateSession(sessionID);
  sess.round = null;
  res.json({ balance: { amount: String(sess.balance), currency: 'USD' } });
});

app.post('/bet/event', (req, res) => {
  const sessionID = req.body?.sessionID;
  const event = req.body?.event;
  if (!sessionID) return res.status(400).json({ code: 'ERR_VAL' });
  getOrCreateSession(sessionID);
  res.json({ event: event || '' });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`RGS mock at http://localhost:${PORT}`);
});
