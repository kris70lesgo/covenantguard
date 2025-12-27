/**
 * Covenant Engine Test Script
 * Run with: npx tsx scripts/test-covenant-engine.ts
 */

import { 
  calculateDebtToEbitda, 
  calculateInterestCoverage, 
  runCovenantTests 
} from '../lib/covenant-engine';

console.log('═══════════════════════════════════════════════════');
console.log('   CovenantGuard - Covenant Engine Tests');
console.log('═══════════════════════════════════════════════════\n');

// Run the built-in tests
const { passed, results } = runCovenantTests();

results.forEach(result => console.log(result));

console.log('\n═══════════════════════════════════════════════════');
console.log('   MANDATORY VERIFICATION (Task 5)');
console.log('═══════════════════════════════════════════════════\n');

// Task 5 specific test from requirements
const totalDebt = 14000000;
const ebitda = 3000000;
const limit = 3.5;

const result = calculateDebtToEbitda(totalDebt, ebitda, limit);

console.log(`Input:`);
console.log(`  Total Debt: $${totalDebt.toLocaleString()}`);
console.log(`  EBITDA: $${ebitda.toLocaleString()}`);
console.log(`  Covenant Limit: ${limit}x`);
console.log('');
console.log(`Output:`);
console.log(`  Ratio: ${result.ratio.toFixed(2)}`);
console.log(`  Status: ${result.status}`);
console.log('');

// Verify expected values
const expectedRatio = 4.67;
const expectedStatus = 'RED';

const ratioMatch = Math.abs(result.ratio - expectedRatio) < 0.01;
const statusMatch = result.status === expectedStatus;

if (ratioMatch && statusMatch) {
  console.log('✅ COVENANT LOGIC: PASS');
  console.log(`   Ratio=${result.ratio.toFixed(2)}, Status=${result.status} (correct)`);
} else {
  console.log('❌ COVENANT LOGIC: FAIL');
  console.log(`   Expected: Ratio=${expectedRatio}, Status=${expectedStatus}`);
  console.log(`   Got: Ratio=${result.ratio.toFixed(2)}, Status=${result.status}`);
}

console.log('\n═══════════════════════════════════════════════════');
console.log(`   FINAL RESULT: ${passed && ratioMatch && statusMatch ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log('═══════════════════════════════════════════════════\n');

process.exit(passed && ratioMatch && statusMatch ? 0 : 1);
