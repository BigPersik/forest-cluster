import { ROWS, COLS, MIN_CLUSTER, SYMBOLS } from './constants.js';

/**
 * Get all horizontal and vertical clusters of size >= MIN_CLUSTER.
 * Returns array of { symbol, positions: number[] } (positions are indices 0..48).
 */
export function findClusters(grid) {
  const used = new Set();
  const clusters = [];

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const idx = i * COLS + j;
      if (used.has(idx)) continue;
      const sym = grid[idx];
      if (sym === undefined || sym === null) continue;
      const isWild = sym === SYMBOLS.WILD;
      if (isWild) continue; // wild doesn't form its own cluster; it joins others

      // Horizontal run from (i,j)
      let run = [idx];
      let k = j + 1;
      while (k < COLS) {
        const ni = i * COLS + k;
        const s = grid[ni];
        if (s === sym || s === SYMBOLS.WILD) {
          run.push(ni);
          k++;
        } else break;
      }
      if (run.length >= MIN_CLUSTER) {
        run.forEach(p => used.add(p));
        clusters.push({ symbol: sym, positions: run });
      }

      // Vertical run from (i,j) — only if not already in a horizontal cluster
      run = [idx];
      let r = i + 1;
      while (r < ROWS) {
        const ni = r * COLS + j;
        const s = grid[ni];
        if (s === sym || s === SYMBOLS.WILD) {
          run.push(ni);
          r++;
        } else break;
      }
      if (run.length >= MIN_CLUSTER) {
        run.forEach(p => used.add(p));
        clusters.push({ symbol: sym, positions: run });
      }
    }
  }

  return clusters;
}

/**
 * Resolve wild in clusters: assign wild to best paying symbol in that cluster.
 * For simplicity we treat wild as matching the symbol it's adjacent to in the cluster.
 */
export function resolveWildInClusters(clusters, grid, paytable) {
  const out = [];
  for (const c of clusters) {
    let symbol = c.symbol;
    const hasWild = c.positions.some(p => grid[p] === SYMBOLS.WILD);
    if (hasWild) {
      const nonWild = c.positions.find(p => grid[p] !== SYMBOLS.WILD);
      symbol = nonWild !== undefined ? grid[nonWild] : c.symbol;
    }
    const len = Math.min(c.positions.length, 10);
    const pay = (paytable[symbol] && paytable[symbol][len]) || 0;
    out.push({ symbol, positions: c.positions, pay });
  }
  return out;
}

/**
 * Gravity: drop symbols down, fill empty from top (new random will be filled by caller).
 * Returns new grid and list of (fromIndex, toIndex) moves for animation.
 */
export function applyGravity(grid) {
  const next = [...grid];
  const moves = [];
  for (let col = 0; col < COLS; col++) {
    let write = ROWS - 1;
    for (let row = ROWS - 1; row >= 0; row--) {
      const idx = row * COLS + col;
      if (next[idx] !== -1) {
        if (write !== row) {
          const toIdx = write * COLS + col;
          next[toIdx] = next[idx];
          next[idx] = -1;
          moves.push({ from: idx, to: toIdx });
        }
        write--;
      }
    }
  }
  return { grid: next, moves };
}

/**
 * Fill empty (-1) positions from top with values from fillBag (in order).
 */
export function fillBlanks(grid, fillBag) {
  const next = [...grid];
  let f = 0;
  for (let i = 0; i < next.length && f < fillBag.length; i++) {
    if (next[i] === -1) next[i] = fillBag[f++];
  }
  return next;
}
