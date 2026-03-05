/**
 * Deterministic RNG — Mulberry32. Seed once per round; no client-side randomization.
 * Same seed => identical sequence. Required for Replay and RGS stateless.
 */
export function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0; // mulberry32
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Integer in [min, max] inclusive, deterministic.
 */
export function randomInt(rng, min, max) {
  const range = max - min + 1;
  return min + Math.floor(rng() * range);
}
