/**
 * Credexia - Covenant Engine
 * 
 * Pure, deterministic covenant calculation logic.
 * No API calls, no side effects - just math.
 */

import { CovenantStatus, CovenantResult } from './types';

/**
 * Calculate Debt-to-EBITDA covenant ratio
 * 
 * @param totalDebt - Total debt amount
 * @param ebitda - EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)
 * @param limit - Covenant limit (maximum allowed ratio)
 * @param amberThreshold - Percentage of limit to trigger amber warning (default 90%)
 * @returns CovenantResult with ratio and status
 */
export function calculateDebtToEbitda(
  totalDebt: number,
  ebitda: number,
  limit: number,
  amberThreshold: number = 0.9
): CovenantResult {
  // Validate inputs
  if (ebitda <= 0) {
    // If EBITDA is zero or negative, automatic breach
    return {
      ratio: Infinity,
      status: 'RED',
      limit,
    };
  }

  if (totalDebt < 0) {
    // Negative debt is technically compliant
    return {
      ratio: 0,
      status: 'GREEN',
      limit,
    };
  }

  // Calculate ratio
  const ratio = totalDebt / ebitda;

  // Determine status
  let status: CovenantStatus;
  
  if (ratio > limit) {
    // Breach: ratio exceeds limit
    status = 'RED';
  } else if (ratio >= limit * amberThreshold) {
    // Warning: ratio is approaching limit (within 10% by default)
    status = 'AMBER';
  } else {
    // Compliant: ratio is safely below limit
    status = 'GREEN';
  }

  return {
    ratio,
    status,
    limit,
  };
}

/**
 * Calculate Interest Coverage Ratio
 * 
 * ICR = EBITDA / Interest Expense
 * Higher is better - measures ability to pay interest
 * 
 * @param ebitda - EBITDA
 * @param interestExpense - Interest expense
 * @param minLimit - Minimum required ratio
 * @returns CovenantResult
 */
export function calculateInterestCoverage(
  ebitda: number,
  interestExpense: number,
  minLimit: number,
  amberThreshold: number = 1.1
): CovenantResult {
  if (interestExpense <= 0) {
    // No interest expense - always compliant
    return {
      ratio: Infinity,
      status: 'GREEN',
      limit: minLimit,
    };
  }

  if (ebitda <= 0) {
    // Zero or negative EBITDA - breach
    return {
      ratio: 0,
      status: 'RED',
      limit: minLimit,
    };
  }

  const ratio = ebitda / interestExpense;

  let status: CovenantStatus;
  
  if (ratio < minLimit) {
    // Breach: ratio below minimum
    status = 'RED';
  } else if (ratio <= minLimit * amberThreshold) {
    // Warning: ratio is close to minimum
    status = 'AMBER';
  } else {
    // Compliant: ratio is safely above minimum
    status = 'GREEN';
  }

  return {
    ratio,
    status,
    limit: minLimit,
  };
}

/**
 * Calculate Tangible Net Worth covenant
 * 
 * @param tangibleNetWorth - Current tangible net worth
 * @param minRequired - Minimum required tangible net worth
 * @returns CovenantResult
 */
export function calculateTangibleNetWorth(
  tangibleNetWorth: number,
  minRequired: number,
  amberThreshold: number = 1.1
): CovenantResult {
  const ratio = tangibleNetWorth / minRequired;

  let status: CovenantStatus;
  
  if (tangibleNetWorth < minRequired) {
    status = 'RED';
  } else if (tangibleNetWorth <= minRequired * amberThreshold) {
    status = 'AMBER';
  } else {
    status = 'GREEN';
  }

  return {
    ratio,
    status,
    limit: minRequired,
  };
}

/**
 * Generate a cryptographic hash of covenant data for blockchain sealing
 * 
 * @param data - Covenant calculation data
 * @returns Hash string suitable for blockchain storage
 */
export function generateComplianceHash(data: {
  loanId: string;
  timestamp: string;
  totalDebt: number;
  ebitda: number;
  ratio: number;
  status: CovenantStatus;
}): string {
  // Create deterministic JSON string
  const payload = JSON.stringify({
    loanId: data.loanId,
    timestamp: data.timestamp,
    totalDebt: data.totalDebt,
    ebitda: data.ebitda,
    ratio: Math.round(data.ratio * 10000) / 10000, // Round to 4 decimal places
    status: data.status,
  });

  // For now, return a simple hash representation
  // In production, use ethers.keccak256
  return `0x${Buffer.from(payload).toString('hex').slice(0, 64)}`;
}

// ========================================
// UNIT TESTS (inline for demo purposes)
// ========================================

export function runCovenantTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  // Test 1: Standard Debt/EBITDA calculation
  const test1 = calculateDebtToEbitda(14000000, 3000000, 3.5);
  const test1Expected = { ratio: 4.666666666666667, status: 'RED' as CovenantStatus };
  
  if (Math.abs(test1.ratio - test1Expected.ratio) < 0.001 && test1.status === test1Expected.status) {
    results.push('✅ Test 1 PASSED: Debt/EBITDA = 4.67, Status = RED');
  } else {
    results.push(`❌ Test 1 FAILED: Expected ratio=${test1Expected.ratio.toFixed(2)}, status=${test1Expected.status}. Got ratio=${test1.ratio.toFixed(2)}, status=${test1.status}`);
    allPassed = false;
  }

  // Test 2: Compliant loan
  const test2 = calculateDebtToEbitda(35000000, 12000000, 4.0);
  if (test2.ratio < 3.0 && test2.status === 'GREEN') {
    results.push(`✅ Test 2 PASSED: Debt/EBITDA = ${test2.ratio.toFixed(2)}, Status = GREEN`);
  } else {
    results.push(`❌ Test 2 FAILED: Expected GREEN status. Got ${test2.status}`);
    allPassed = false;
  }

  // Test 3: Amber warning zone
  const test3 = calculateDebtToEbitda(18000000, 5500000, 3.5);
  if (test3.ratio > 3.0 && test3.ratio < 3.5 && test3.status === 'AMBER') {
    results.push(`✅ Test 3 PASSED: Debt/EBITDA = ${test3.ratio.toFixed(2)}, Status = AMBER`);
  } else {
    results.push(`❌ Test 3 FAILED: Expected AMBER status. Got ${test3.status}`);
    allPassed = false;
  }

  // Test 4: Zero EBITDA (edge case)
  const test4 = calculateDebtToEbitda(10000000, 0, 4.0);
  if (test4.status === 'RED') {
    results.push('✅ Test 4 PASSED: Zero EBITDA = RED (breach)');
  } else {
    results.push(`❌ Test 4 FAILED: Expected RED for zero EBITDA. Got ${test4.status}`);
    allPassed = false;
  }

  // Test 5: Negative debt (edge case)
  const test5 = calculateDebtToEbitda(-5000000, 3000000, 4.0);
  if (test5.status === 'GREEN') {
    results.push('✅ Test 5 PASSED: Negative debt = GREEN (compliant)');
  } else {
    results.push(`❌ Test 5 FAILED: Expected GREEN for negative debt. Got ${test5.status}`);
    allPassed = false;
  }

  // Test 6: Interest Coverage Ratio
  const test6 = calculateInterestCoverage(12000000, 2100000, 5.0);
  if (test6.ratio > 5.0 && test6.status === 'GREEN') {
    results.push(`✅ Test 6 PASSED: ICR = ${test6.ratio.toFixed(2)}, Status = GREEN`);
  } else {
    results.push(`❌ Test 6 FAILED: Expected GREEN ICR. Got ${test6.status}`);
    allPassed = false;
  }

  return { passed: allPassed, results };
}
