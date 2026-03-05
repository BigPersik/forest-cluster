/**
 * Simulation runner: NORMAL and SUPER modes.
 * Target: 100M+ spins per mode for RTP ±0.05%, hit frequency, volatility, feature frequency, max win.
 * Run: node math/run-simulation.js [--quick for 1M]
 */
import { runSpin, toRGSEvents } from './game-loop.js';
import { writeFileSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';

const QUICK = process.argv.includes('--quick');
const TOTAL_NORMAL = QUICK ? 1_000_000 : 100_000_000;
const TOTAL_SUPER = QUICK ? 1_000_000 : 100_000_000;
const BATCH = 100_000;
const OUT_DIR = join(process.cwd(), 'library');
const PUBLISH_DIR = join(OUT_DIR, 'publish_files');

function runBatch(mode, startId, count, seedBase) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const seed = seedBase + startId + i;
    const round = runSpin(seed, mode);
    results.push({
      id: startId + i + 1,
      payoutMultiplier: Math.round(round.totalMultiplier * 1000),
      events: toRGSEvents(round, mode === 'SUPER' ? 'super' : 'basegame'),
      criteria: mode.toLowerCase(),
    });
  }
  return results;
}

function simulateMode(mode, total, seedBase) {
  const all = [];
  let done = 0;
  const start = Date.now();
  while (done < total) {
    const batchSize = Math.min(BATCH, total - done);
    const batch = runBatch(mode, done, batchSize, seedBase);
    all.push(...batch);
    done += batchSize;
    if (done % 500_000 === 0 || done === total) {
      process.stdout.write(`\r${mode}: ${done}/${total}`);
    }
  }
  console.log(`\n${mode} done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  return all;
}

function computeStats(results) {
  const n = results.length;
  const payouts = results.map(r => r.payoutMultiplier / 1000);
  const sum = payouts.reduce((a, b) => a + b, 0);
  const rtp = sum / n;
  const wins = payouts.filter(p => p > 0);
  const hitFreq = wins.length / n;
  const mean = sum / n;
  const variance = payouts.reduce((a, p) => a + (p - mean) ** 2, 0) / n;
  const volatility = Math.sqrt(variance);
  let maxWin = 0;
  for (const p of payouts) if (p > maxWin) maxWin = p;
  const featureCount = results.filter(r => r.events.some(e => e.type === 'feature')).length;
  const featureFreq = featureCount / n;

  return {
    spins: n,
    rtp: (rtp * 100).toFixed(4) + '%',
    hitFrequency: (hitFreq * 100).toFixed(4) + '%',
    volatility: volatility.toFixed(4),
    maxWin: maxWin.toFixed(2),
    featureFrequency: (featureFreq * 100).toFixed(4) + '%',
  };
}

function writeLookupTable(results, path) {
  const lines = ['simulation number,round probability,payout multiplier'];
  for (const r of results) {
    lines.push(`${r.id},1,${r.payoutMultiplier}`);
  }
  writeFileSync(path, lines.join('\n'), 'utf8');
}

function writeBooks(results, path) {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(path, { encoding: 'utf8' });
    stream.on('error', reject);
    stream.on('finish', resolve);
    for (const r of results) {
      stream.write(JSON.stringify({
        id: r.id,
        payoutMultiplier: r.payoutMultiplier,
        events: r.events,
        criteria: r.criteria,
      }) + '\n');
    }
    stream.end();
  });
}

async function main() {
  mkdirSync(join(OUT_DIR, 'lookup_tables'), { recursive: true });
  mkdirSync(join(OUT_DIR, 'books'), { recursive: true });
  mkdirSync(PUBLISH_DIR, { recursive: true });

  console.log('Running NORMAL mode...');
  const normalResults = simulateMode('NORMAL', TOTAL_NORMAL, 0);
  const normalStats = computeStats(normalResults);
  console.log('NORMAL stats:', normalStats);
  writeLookupTable(normalResults, join(OUT_DIR, 'lookup_tables', 'lookUpTable_base.csv'));
  await writeBooks(normalResults, join(OUT_DIR, 'books', 'books_base.jsonl'));

  console.log('Running SUPER mode...');
  const superResults = simulateMode('SUPER', TOTAL_SUPER, 1e9);
  const superStats = computeStats(superResults);
  console.log('SUPER stats:', superStats);
  writeLookupTable(superResults, join(OUT_DIR, 'lookup_tables', 'lookUpTable_super.csv'));
  await writeBooks(superResults, join(OUT_DIR, 'books', 'books_super.jsonl'));

  const index = {
    version: '1.0.0',
    modes: [
      { name: 'base', cost: 1.0, events: 'books_base.jsonl', weights: 'lookUpTable_base.csv' },
      { name: 'super', cost: 1.0, events: 'books_super.jsonl', weights: 'lookUpTable_super.csv' },
    ],
  };
  writeFileSync(join(PUBLISH_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf8');

  const report = {
    simulationDate: new Date().toISOString(),
    NORMAL: { ...normalStats, targetRTP: '96.00%', tolerance: '±0.05%' },
    SUPER: { ...superStats, targetRTP: '96.50%', tolerance: '±0.05%' },
  };
  writeFileSync(join(OUT_DIR, 'rtp_report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log('RTP report written to library/rtp_report.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
