import { strict as assert } from 'assert';
import { test } from 'node:test';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const engine = require('../engine.js');

// Read sample CSV from disk
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sampleCSVPath = resolve(__dirname, '../data/sample-statement.csv');
const sampleCSV = readFileSync(sampleCSVPath, 'utf8');

test('sample.test.js: import sample CSV — exactly 180 transactions, 0 skipped', () => {
  const result = engine.importCSV(sampleCSV);
  
  assert.strictEqual(result.transactions.length, 180, `Expected exactly 180 transactions, got ${result.transactions.length}`);
  assert.strictEqual(result.skipped, 0, `Expected 0 skipped, got ${result.skipped}`);
  
  // All transactions should have category and confidence
  for (const txn of result.transactions) {
    assert(txn.category, `Transaction ${txn.id} missing category`);
    assert(typeof txn.confidence === 'number', `Transaction ${txn.id} confidence not a number`);
  }
});

test('sample.test.js: income is exactly 1,920,000 cents (6 × 320000)', () => {
  const result = engine.importCSV(sampleCSV);
  const summary = engine.summarize(result.transactions);
  
  // 6 months × 3200.00 = 19200.00 = 1920000 cents
  assert.strictEqual(summary.incomeCents, 1920000, `Expected income of 1920000 cents, got ${summary.incomeCents}`);
});

test('sample.test.js: totals balance (income - spending = net)', () => {
  const result = engine.importCSV(sampleCSV);
  const summary = engine.summarize(result.transactions);
  
  const expectedNet = summary.incomeCents - summary.spendingCents;
  assert.strictEqual(summary.netCents, expectedNet, 'Totals must balance');
});

test('sample.test.js: all amountCents are integers', () => {
  const result = engine.importCSV(sampleCSV);
  
  for (const txn of result.transactions) {
    assert.strictEqual(
      txn.amountCents,
      Math.floor(txn.amountCents),
      `Transaction ${txn.id} has non-integer cents: ${txn.amountCents}`
    );
  }
});

test('sample.test.js: detect subscriptions — exactly 11 recurring charges found', () => {
  const result = engine.importCSV(sampleCSV);
  const subs = engine.detectSubscriptions(result.transactions);
  
  assert.strictEqual(subs.length, 11, `Expected exactly 11 recurring charges, got ${subs.length}`);
  
  console.log('Subscriptions found:');
  for (const sub of subs) {
    console.log(`  ${sub.displayName}: ${engine.formatCents(sub.monthlyCents, '$')}/month (${sub.count} charges, ${sub.cadence})`);
  }
});

test('sample.test.js: planted ghost subscriptions found with exact monthly amounts', () => {
  const result = engine.importCSV(sampleCSV);
  const subs = engine.detectSubscriptions(result.transactions);
  
  // The 4 planted ghosts: FitZone Gym, CloudVault Pro, StreamBox Plus, Retro Gamer Monthly
  const fitzone = subs.find(s => s.displayName.toLowerCase().includes('fitzone'));
  const cloudvault = subs.find(s => s.displayName.toLowerCase().includes('cloudvault'));
  const streambox = subs.find(s => s.displayName.toLowerCase().includes('streambox'));
  const retrogamer = subs.find(s => s.displayName.toLowerCase().includes('retro gamer'));
  
  assert(fitzone, 'FitZone Gym should be detected as subscription');
  assert(cloudvault, 'CloudVault Pro should be detected as subscription');
  assert(streambox, 'StreamBox Plus should be detected as subscription');
  assert(retrogamer, 'Retro Gamer Monthly should be detected as subscription');
  
  // Check exact monthly amounts
  assert.strictEqual(fitzone.monthlyCents, 2999, `FitZone monthly: expected 2999, got ${fitzone.monthlyCents}`);
  assert.strictEqual(cloudvault.monthlyCents, 1999, `CloudVault monthly: expected 1999, got ${cloudvault.monthlyCents}`);
  assert.strictEqual(streambox.monthlyCents, 1899, `StreamBox monthly: expected 1899, got ${streambox.monthlyCents}`);
  assert.strictEqual(retrogamer.monthlyCents, 999, `Retro Gamer monthly: expected 999, got ${retrogamer.monthlyCents}`);
  
  // Check total of the 4 planted ghosts
  const plantedTotal = fitzone.monthlyCents + cloudvault.monthlyCents + streambox.monthlyCents + retrogamer.monthlyCents;
  assert.strictEqual(plantedTotal, 7896, `4 planted ghosts total: expected 7896, got ${plantedTotal}`);
});

test('sample.test.js: used subscriptions also detected (Netflix, Spotify, iCloud Storage)', () => {
  const result = engine.importCSV(sampleCSV);
  const subs = engine.detectSubscriptions(result.transactions);
  
  const netflix = subs.find(s => s.displayName.toLowerCase().includes('netflix'));
  const spotify = subs.find(s => s.displayName.toLowerCase().includes('spotify'));
  const icloud = subs.find(s => s.displayName.toLowerCase().includes('icloud'));
  
  assert(netflix, 'Netflix should be detected as subscription');
  assert(spotify, 'Spotify should be detected as subscription');
  assert(icloud, 'iCloud Storage should be detected as subscription');
});

test('sample.test.js: total monthly cost of all 11 recurring charges is exactly 36,142 cents', () => {
  const result = engine.importCSV(sampleCSV);
  const subs = engine.detectSubscriptions(result.transactions);
  
  const totalMonthlyCents = subs.reduce((sum, sub) => sum + sub.monthlyCents, 0);
  assert.strictEqual(totalMonthlyCents, 36142, `Total monthly cost: expected 36142, got ${totalMonthlyCents}`);
  
  console.log(`Total monthly cost of all 11 subscriptions: ${engine.formatCents(totalMonthlyCents, '$')} (${totalMonthlyCents} cents)`);
});

test('sample.test.js: non-subscriptions NOT reported as subscriptions', () => {
  const result = engine.importCSV(sampleCSV);
  const subs = engine.detectSubscriptions(result.transactions);
  
  const wholeFoods = subs.find(s => s.displayName.toLowerCase().includes('whole foods'));
  const shell = subs.find(s => s.displayName.toLowerCase().includes('shell'));
  const amazon = subs.find(s => s.displayName.toLowerCase().includes('amazon'));
  
  assert(!wholeFoods, 'Whole Foods Market should NOT be detected as subscription');
  assert(!shell, 'Shell Fuel should NOT be detected as subscription');
  assert(!amazon, 'Amazon should NOT be detected as subscription');
});
