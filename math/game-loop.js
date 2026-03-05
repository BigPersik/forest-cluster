import { ROWS, COLS, SYMBOLS, NORMAL_WEIGHTS, SUPER_WEIGHTS, PAYTABLE_NORMAL, PAYTABLE_SUPER, FEATURE_TRIGGERS, KOALA_SPINS_COUNT, GUMLEAF_GROVE_PICKS, BILLABONG_MULTIPLIERS } from './constants.js';
import { createRng, randomInt } from './rng.js';
import { findClusters, resolveWildInClusters, applyGravity, fillBlanks } from './cluster.js';
import { generateGrid, generateFill } from './grid-gen.js';

const MAX_CASCADES = 20;

/**
 * Count scatters on grid (any position).
 */
function countScatters(grid) {
  let n = 0;
  for (let i = 0; i < grid.length; i++) if (grid[i] === SYMBOLS.SCATTER) n++;
  return n;
}

/**
 * One cascade step: find clusters, compute win, apply gravity, fill. Returns { win, clusters, nextGrid, fillCount }.
 */
function cascadeStep(grid, paytable, rng, weights) {
  const clusters = findClusters(grid);
  const resolved = resolveWildInClusters(clusters, grid, paytable);
  let totalWin = 0;
  for (const c of resolved) totalWin += c.pay;

  const removeSet = new Set();
  for (const c of resolved) c.positions.forEach(p => removeSet.add(p));
  const nextGrid = grid.map((s, i) => (removeSet.has(i) ? -1 : s));
  const { grid: afterGravity } = applyGravity(nextGrid);
  const emptyCount = afterGravity.filter(x => x === -1).length;
  const fill = generateFill(rng, weights, emptyCount);
  const finalGrid = fillBlanks(afterGravity, fill);

  return {
    win: totalWin,
    clusters: resolved,
    nextGrid: finalGrid,
    fillCount: emptyCount,
  };
}

/**
 * Run base game (one initial grid + cascades) and collect all wins. No feature trigger.
 */
function runBaseCascades(initialGrid, paytable, rng, weights) {
  const events = [];
  let grid = initialGrid;
  let totalWin = 0;
  let cascadeIndex = 0;

  while (cascadeIndex < MAX_CASCADES) {
    const step = cascadeStep(grid, paytable, rng, weights);
    totalWin += step.win;
    events.push({
      cascadeIndex,
      grid: [...grid],
      clusters: step.clusters,
      win: step.win,
    });
    if (step.win === 0) break;
    grid = step.nextGrid;
    cascadeIndex++;
  }

  return { totalWin, events, finalGrid: grid };
}

/**
 * Run Koala Spins (free spins). Count determined by trigger; each spin is cascade-based.
 * Pre-calculated: number of spins and each spin's outcome from rng.
 */
function runKoalaSpins(rng, paytable, weights, spinCount) {
  const spins = [];
  let totalWin = 0;
  for (let s = 0; s < spinCount; s++) {
    const grid = generateGrid(rng, weights);
    const { totalWin: spinWin, events } = runBaseCascades(grid, paytable, rng, weights);
    totalWin += spinWin;
    spins.push({ grid: events[0]?.grid || grid, events, spinWin });
  }
  return { totalWin, spins };
}

/**
 * Gumleaf Grove: pick game. Pre-calculated picks (indices) and rewards.
 */
function runGumleafGrove(rng, picksCount = GUMLEAF_GROVE_PICKS) {
  const options = [0.2, 0.4, 0.6, 1, 1.5, 2, 3, 5]; // multiplier options (RTP-friendly)
  const shuffled = [...options].sort(() => rng() - 0.5);
  const pickOrder = [];
  for (let i = 0; i < picksCount; i++) {
    const idx = randomInt(rng, 0, shuffled.length - 1);
    pickOrder.push({ index: idx, multiplier: shuffled[idx] });
  }
  const totalMultiplier = pickOrder.reduce((s, p) => s + p.multiplier, 0);
  return { picks: pickOrder, totalMultiplier };
}

/**
 * Billabong Bonus: pick multipliers from pool.
 */
function runBillabongBonus(rng, picksCount = 5) {
  const pool = [...BILLABONG_MULTIPLIERS];
  const picked = [];
  for (let i = 0; i < picksCount; i++) {
    const idx = randomInt(rng, 0, pool.length - 1);
    picked.push(pool[idx]);
  }
  const totalMultiplier = picked.reduce((a, b) => a + b, 0);
  return { picks: picked, totalMultiplier };
}

/**
 * Full spin: seed => deterministic outcome. Returns RGS-ready events and total payout multiplier (per 1 bet).
 * mode: 'NORMAL' | 'SUPER'
 * featureEntry: optional 'koala_spins' | 'gumleaf_grove' | 'billabong_bonus' for Direct Feature Entry (RTP unchanged: uses dedicated outcome pool).
 * All feature state is inside the returned object (stored in bet event).
 */
export function runSpin(seed, mode = 'NORMAL', featureEntry = null) {
  const rng = createRng(seed);
  const weights = mode === 'SUPER' ? SUPER_WEIGHTS : NORMAL_WEIGHTS;
  const paytable = mode === 'SUPER' ? PAYTABLE_SUPER : PAYTABLE_NORMAL;

  let initialGrid = generateGrid(rng, weights);
  let scatterCount = countScatters(initialGrid);
  let triggeredFeature = FEATURE_TRIGGERS[scatterCount] || null;

  if (featureEntry && triggeredFeature !== featureEntry) {
    for (let offset = 1; offset <= 1000; offset++) {
      const trySeed = seed + offset * 1e6;
      const subRound = runSpin(trySeed, mode, null);
      const subFeature = subRound.events.find(e => e.type === 'base')?.triggeredFeature;
      if (subFeature === featureEntry) {
        return subRound;
      }
    }
  }

  const events = [];
  let totalMultiplier = 0;

  // Base game cascades
  const baseResult = runBaseCascades(initialGrid, paytable, rng, weights);
  totalMultiplier += baseResult.totalWin;

  events.push({
    type: 'base',
    cascades: baseResult.events,
    scatterCount,
    triggeredFeature,
  });

  // Feature (pre-calculated, state in event)
  if (triggeredFeature === 'koala_spins') {
    const spinCount = randomInt(rng, KOALA_SPINS_COUNT.min, KOALA_SPINS_COUNT.max);
    const koalaResult = runKoalaSpins(rng, paytable, weights, spinCount);
    totalMultiplier += koalaResult.totalWin;
    events.push({
      type: 'koala_spins',
      spinCount,
      spins: koalaResult.spins,
      totalWin: koalaResult.totalWin,
    });
  } else if (triggeredFeature === 'gumleaf_grove') {
    const groveResult = runGumleafGrove(rng);
    totalMultiplier += groveResult.totalMultiplier;
    events.push({
      type: 'gumleaf_grove',
      picks: groveResult.picks,
      totalMultiplier: groveResult.totalMultiplier,
    });
  } else if (triggeredFeature === 'billabong_bonus') {
    const billabongResult = runBillabongBonus(rng);
    totalMultiplier += billabongResult.totalMultiplier;
    events.push({
      type: 'billabong_bonus',
      picks: billabongResult.picks,
      totalMultiplier: billabongResult.totalMultiplier,
    });
  }

  return {
    seed,
    mode,
    totalMultiplier,
    events,
  };
}

/**
 * Convert to RGS event list format (reveal, winInfo, setWin, setTotalWin, finalWin).
 */
export function toRGSEvents(round, gameType = 'basegame') {
  const out = [];
  let index = 0;
  const base = round.events.find(e => e.type === 'base');
  if (base) {
    for (const cascade of base.cascades) {
      out.push({
        index: index++,
        type: 'reveal',
        board: cascade.grid,
        gameType,
        cascadeIndex: cascade.cascadeIndex,
      });
      if (cascade.win > 0) {
        const wins = cascade.clusters.map(c => ({
          symbol: c.symbol,
          kind: c.positions.length,
          win: c.pay,
          positions: c.positions,
          meta: {},
        }));
        out.push({
          index: index++,
          type: 'winInfo',
          totalWin: cascade.win,
          wins,
        });
        out.push({ index: index++, type: 'setWin', amount: cascade.win });
      }
    }
    out.push({
      index: index++,
      type: 'scatterInfo',
      scatterCount: base.scatterCount,
      triggeredFeature: base.triggeredFeature,
    });
  }

  for (const ev of round.events) {
    if (ev.type === 'koala_spins') {
      out.push({
        index: index++,
        type: 'feature',
        feature: 'koala_spins',
        spinCount: ev.spinCount,
        spins: ev.spins,
        totalWin: ev.totalWin,
      });
    } else if (ev.type === 'gumleaf_grove') {
      out.push({
        index: index++,
        type: 'feature',
        feature: 'gumleaf_grove',
        picks: ev.picks,
        totalMultiplier: ev.totalMultiplier,
      });
    } else if (ev.type === 'billabong_bonus') {
      out.push({
        index: index++,
        type: 'feature',
        feature: 'billabong_bonus',
        picks: ev.picks,
        totalMultiplier: ev.totalMultiplier,
      });
    }
  }

  const total = round.totalMultiplier;
  out.push({ index: index++, type: 'setTotalWin', amount: total });
  out.push({ index: index++, type: 'finalWin', amount: total });
  return out;
}
