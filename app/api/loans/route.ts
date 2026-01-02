import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Loan, CovenantStatus } from '@/lib/types';
import { 
  rateLimit, 
  validateNumber,
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

// GET /api/loans - Fetch all loans with aggregated data
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    // Fetch loans from Supabase with limit
    const { data: dbLoans, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000); // Prevent massive queries

    if (error) {
      logSecurityEvent('Supabase error in loans GET', { error: error.message, code: error.code });
      // Return empty array if table doesn't exist yet
      if (error.code === '42P01') {
        return addSecurityHeaders(NextResponse.json({ loans: [], source: 'empty' }));
      }
      throw error;
    }

    // Transform database loans to app format
    const loans: Loan[] = (dbLoans || []).map((loan: Record<string, unknown>) => ({
      id: String(loan.id || ''),
      borrowerName: String(loan.borrower_name || loan.borrower || ''),
      facilityAmount: Number(loan.facility_amount) || 0,
      outstandingAmount: Number(loan.outstanding_amount) || 0,
      maturityDate: String(loan.maturity_date || ''),
      covenantType: String(loan.covenant_type || 'Debt/EBITDA'),
      covenantLimit: Number(loan.covenant_limit) || 4.0,
      lastTestDate: String(loan.last_test_date || ''),
      totalDebt: Number(loan.total_debt) || 0,
      ebitda: Number(loan.ebitda) || 1, // Avoid division by zero
      interestExpense: Number(loan.interest_expense) || undefined,
      tangibleNetWorth: Number(loan.tangible_net_worth) || undefined,
      currentRatio: Number(loan.current_ratio) || 1.5,
      debtToEbitda: Number(loan.debt_to_ebitda) || 0,
      interestCoverage: Number(loan.interest_coverage) || 0,
      status: (loan.status as CovenantStatus) || 'GREEN',
      covenantLimits: {
        maxDebtToEbitda: Number(loan.max_debt_to_ebitda) || 4.0,
        minInterestCoverage: Number(loan.min_interest_coverage) || 2.0,
        minCurrentRatio: Number(loan.min_current_ratio) || 1.2,
      },
      lastTxHash: loan.last_tx_hash ? String(loan.last_tx_hash) : undefined,
      isSealed: Boolean(loan.is_sealed),
    }));

    return addSecurityHeaders(NextResponse.json({
      loans,
      source: 'database',
      count: loans.length,
    }));
  } catch (error) {
    logSecurityEvent('Error fetching loans', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error), loans: [] },
      { status: 500 }
    ));
  }
}

// POST /api/loans - Create a new loan
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const body = await request.json();
    
    // Input validation
    if (!body.borrower || typeof body.borrower !== 'string') {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid borrower name' },
        { status: 400 }
      ));
    }

    if (!validateNumber(body.loanAmount, 1, 1e15)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid loan amount' },
        { status: 400 }
      ));
    }
    
    const { data, error } = await supabase
      .from('loans')
      .insert({
        borrower: body.borrower,
        loan_amount: body.loanAmount,
        outstanding_balance: body.outstandingBalance || body.loanAmount,
        interest_rate: body.interestRate,
        maturity_date: body.maturityDate,
        covenant_status: body.covenantStatus || 'GREEN',
        debt_to_ebitda: body.debtToEbitda || 0,
        interest_coverage: body.interestCoverage || 0,
        current_ratio: body.currentRatio || 0,
        last_review_date: body.lastReviewDate || new Date().toISOString().split('T')[0],
        next_review_date: body.nextReviewDate,
        max_debt_to_ebitda: body.covenantLimits?.maxDebtToEbitda || 4.0,
        min_interest_coverage: body.covenantLimits?.minInterestCoverage || 2.0,
        min_current_ratio: body.covenantLimits?.minCurrentRatio || 1.2,
      })
      .select()
      .single();

    if (error) throw error;

    return addSecurityHeaders(NextResponse.json({ success: true, loan: data }));
  } catch (error) {
    logSecurityEvent('Error creating loan', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}
