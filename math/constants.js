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

/** NORMAL mode weights — fewer WILD/SCATTER = fewer big wins and features. Target RTP ~95% */
export const NORMAL_WEIGHTS = [
  [0, 6, 10, 35, 35, 35, 35, 35, 1, 3],
  [0, 6, 10, 38, 38, 38, 38, 38, 1, 2],
  [0, 7, 11, 40, 40, 40, 40, 40, 1, 2],
  [0, 7, 11, 42, 42, 42, 42, 42, 1, 1],
  [0, 8, 12, 44, 44, 44, 44, 44, 1, 1],
  [0, 8, 12, 46, 46, 46, 46, 46, 1, 1],
  [0, 9, 13, 48, 48, 48, 48, 48, 1, 0],
];

/** SUPER mode — slightly more premium, target RTP ~95% */
export const SUPER_WEIGHTS = [
  [0, 8, 12, 32, 32, 32, 32, 32, 2, 4],
  [0, 8, 12, 35, 35, 35, 35, 35, 2, 3],
  [0, 9, 13, 37, 37, 37, 37, 37, 2, 3],
  [0, 9, 13, 40, 40, 40, 40, 40, 1, 2],
  [0, 10, 14, 42, 42, 42, 42, 42, 1, 2],
  [0, 10, 14, 44, 44, 44, 44, 44, 1, 2],
  [0, 11, 15, 46, 46, 46, 46, 46, 1, 1],
];

/** Cluster paytable (multiplier per 1 bet). NORMAL — scaled for ~95% RTP */
export const PAYTABLE_NORMAL = {
  [SYMBOLS.KOALA]:    [0, 0, 0, 0, 0.079, 0.158, 0.317, 0.792, 1.583, 3.167, 7.917],
  [SYMBOLS.GUMLEAF]:  [0, 0, 0, 0, 0.059, 0.119, 0.237, 0.594, 1.188, 2.375, 5.938],
  [SYMBOLS.BILLABONG]:[0, 0, 0, 0, 0.049, 0.099, 0.198, 0.495, 0.99, 1.979, 4.948],
  [SYMBOLS.A]:        [0, 0, 0, 0, 0.04, 0.079, 0.158, 0.396, 0.792, 1.583, 3.958],
  [SYMBOLS.K]:        [0, 0, 0, 0, 0.03, 0.059, 0.119, 0.297, 0.594, 1.188, 2.969],
  [SYMBOLS.Q]:        [0, 0, 0, 0, 0.02, 0.04, 0.079, 0.198, 0.396, 0.792, 1.979],
  [SYMBOLS.J]:        [0, 0, 0, 0, 0.016, 0.032, 0.063, 0.158, 0.317, 0.633, 1.583],
  [SYMBOLS.TEN]:      [0, 0, 0, 0, 0.01, 0.02, 0.04, 0.099, 0.198, 0.396, 0.99],
  [SYMBOLS.WILD]:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [SYMBOLS.SCATTER]:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

/** SUPER paytable — scaled for ~95% RTP */
export const PAYTABLE_SUPER = {
  [SYMBOLS.KOALA]:    [0, 0, 0, 0, 0.089, 0.177, 0.354, 0.886, 1.772, 3.544, 8.86],
  [SYMBOLS.GUMLEAF]:  [0, 0, 0, 0, 0.069, 0.138, 0.276, 0.689, 1.378, 2.756, 6.891],
  [SYMBOLS.BILLABONG]:[0, 0, 0, 0, 0.059, 0.118, 0.236, 0.591, 1.182, 2.364, 5.909],
  [SYMBOLS.A]:        [0, 0, 0, 0, 0.049, 0.099, 0.197, 0.492, 0.984, 1.969, 4.922],
  [SYMBOLS.K]:        [0, 0, 0, 0, 0.039, 0.079, 0.157, 0.394, 0.787, 1.575, 3.938],
  [SYMBOLS.Q]:        [0, 0, 0, 0, 0.03, 0.059, 0.118, 0.295, 0.591, 1.182, 2.954],
  [SYMBOLS.J]:        [0, 0, 0, 0, 0.024, 0.047, 0.094, 0.236, 0.472, 0.945, 2.362],
  [SYMBOLS.TEN]:      [0, 0, 0, 0, 0.015, 0.03, 0.059, 0.148, 0.295, 0.591, 1.477],
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
/** Billabong Bonus: multiplier pool scaled for ~95% RTP */
export const BILLABONG_MULTIPLIERS = [0.49, 0.99, 1.48, 1.98, 2.97, 4.95, 7.92, 9.9, 14.84, 24.74];
