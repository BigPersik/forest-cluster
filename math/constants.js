/** Grid size */
export const ROWS = 7;
export const COLS = 7;
export const GRID_SIZE = ROWS * COLS;

/** Min cluster size for win (horizontal/vertical only) */
export const MIN_CLUSTER = 5;

/** Symbol IDs — match client assets */
export const SYMBOLS = {
  KOALA: 0,
  GUMLEAF: 1,
  BILLABONG: 2,
  A: 3,
  K: 4,
  Q: 5,
  J: 6,
  TEN: 7,
  WILD: 8,
  SCATTER: 9,
};

/** NORMAL mode weights — fewer WILD/SCATTER = fewer big wins and features. Target RTP ~96% */
export const NORMAL_WEIGHTS = [
  [0, 6, 10, 35, 35, 35, 35, 35, 1, 3],
  [0, 6, 10, 38, 38, 38, 38, 38, 1, 2],
  [0, 7, 11, 40, 40, 40, 40, 40, 1, 2],
  [0, 7, 11, 42, 42, 42, 42, 42, 1, 1],
  [0, 8, 12, 44, 44, 44, 44, 44, 1, 1],
  [0, 8, 12, 46, 46, 46, 46, 46, 1, 1],
  [0, 9, 13, 48, 48, 48, 48, 48, 1, 0],
];

/** SUPER mode — slightly more premium, target RTP ~96.50% */
export const SUPER_WEIGHTS = [
  [0, 8, 12, 32, 32, 32, 32, 32, 2, 4],
  [0, 8, 12, 35, 35, 35, 35, 35, 2, 3],
  [0, 9, 13, 37, 37, 37, 37, 37, 2, 3],
  [0, 9, 13, 40, 40, 40, 40, 40, 1, 2],
  [0, 10, 14, 42, 42, 42, 42, 42, 1, 2],
  [0, 10, 14, 44, 44, 44, 44, 44, 1, 2],
  [0, 11, 15, 46, 46, 46, 46, 46, 1, 1],
];

/** Cluster paytable (multiplier per 1 bet). NORMAL — reduced for ~96% RTP */
export const PAYTABLE_NORMAL = {
  [SYMBOLS.KOALA]:    [0, 0, 0, 0, 0.08, 0.16, 0.32, 0.8, 1.6, 3.2, 8],
  [SYMBOLS.GUMLEAF]:  [0, 0, 0, 0, 0.06, 0.12, 0.24, 0.6, 1.2, 2.4, 6],
  [SYMBOLS.BILLABONG]:[0, 0, 0, 0, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  [SYMBOLS.A]:        [0, 0, 0, 0, 0.04, 0.08, 0.16, 0.4, 0.8, 1.6, 4],
  [SYMBOLS.K]:        [0, 0, 0, 0, 0.03, 0.06, 0.12, 0.3, 0.6, 1.2, 3],
  [SYMBOLS.Q]:        [0, 0, 0, 0, 0.02, 0.04, 0.08, 0.2, 0.4, 0.8, 2],
  [SYMBOLS.J]:        [0, 0, 0, 0, 0.016, 0.032, 0.064, 0.16, 0.32, 0.64, 1.6],
  [SYMBOLS.TEN]:      [0, 0, 0, 0, 0.01, 0.02, 0.04, 0.1, 0.2, 0.4, 1],
  [SYMBOLS.WILD]:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [SYMBOLS.SCATTER]:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

/** SUPER paytable — slightly higher, target ~96.50% */
export const PAYTABLE_SUPER = {
  [SYMBOLS.KOALA]:    [0, 0, 0, 0, 0.09, 0.18, 0.36, 0.9, 1.8, 3.6, 9],
  [SYMBOLS.GUMLEAF]:  [0, 0, 0, 0, 0.07, 0.14, 0.28, 0.7, 1.4, 2.8, 7],
  [SYMBOLS.BILLABONG]:[0, 0, 0, 0, 0.06, 0.12, 0.24, 0.6, 1.2, 2.4, 6],
  [SYMBOLS.A]:        [0, 0, 0, 0, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  [SYMBOLS.K]:        [0, 0, 0, 0, 0.04, 0.08, 0.16, 0.4, 0.8, 1.6, 4],
  [SYMBOLS.Q]:        [0, 0, 0, 0, 0.03, 0.06, 0.12, 0.3, 0.6, 1.2, 3],
  [SYMBOLS.J]:        [0, 0, 0, 0, 0.024, 0.048, 0.096, 0.24, 0.48, 0.96, 2.4],
  [SYMBOLS.TEN]:      [0, 0, 0, 0, 0.015, 0.03, 0.06, 0.15, 0.3, 0.6, 1.5],
  [SYMBOLS.WILD]:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [SYMBOLS.SCATTER]:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

/** Scatter count -> feature. 3=Koala Spins, 4=Gumleaf Grove, 5=Billabong Bonus */
export const FEATURE_TRIGGERS = {
  3: 'koala_spins',
  4: 'gumleaf_grove',
  5: 'billabong_bonus',
};

/** Koala Spins: fewer free spins, lower impact on RTP */
export const KOALA_SPINS_COUNT = { min: 3, max: 6 };
/** Gumleaf Grove: picks count */
export const GUMLEAF_GROVE_PICKS = 5;
/** Billabong Bonus: lower multiplier pool */
export const BILLABONG_MULTIPLIERS = [0.5, 1, 1.5, 2, 3, 5, 8, 10, 15, 25];
