import { ROWS, COLS, GRID_SIZE } from './constants.js';
import { createRng, randomInt } from './rng.js';

/**
 * Build cumulative weight array from row weights (symbol indices 0..9).
 */
function getCumulativeWeights(weightsRow) {
  const cum = [];
  let sum = 0;
  for (const w of weightsRow) {
    sum += w;
    cum.push(sum);
  }
  return { cum, total: sum };
}

/**
 * Pick symbol index 0..9 from cumulative weights.
 */
function pickSymbol(rng, cum, total) {
  const r = rng() * total;
  for (let i = 0; i < cum.length; i++) {
    if (r < cum[i]) return i;
  }
  return cum.length - 1;
}

/**
 * Generate one row of symbols using row-specific weights.
 */
function generateRow(rng, weightsRow) {
  const { cum, total } = getCumulativeWeights(weightsRow);
  const row = [];
  for (let c = 0; c < COLS; c++) {
    row.push(pickSymbol(rng, cum, total));
  }
  return row;
}

/**
 * Generate full 7×7 grid. Weights per row (array of 7 rows).
 */
export function generateGrid(rng, weights) {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = generateRow(rng, weights[r] || weights[0]);
    grid.push(...row);
  }
  return grid;
}

/**
 * Generate symbols for filling cascading blanks (same weight set).
 */
export function generateFill(rng, weights, count) {
  const out = [];
  const { cum, total } = getCumulativeWeights(weights[0]);
  for (let i = 0; i < count; i++) {
    out.push(pickSymbol(rng, cum, total));
  }
  return out;
}
