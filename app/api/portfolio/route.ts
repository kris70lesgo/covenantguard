import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { 
  rateLimit, 
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

/**
 * Portfolio API - Latest Compliance Status per Loan
 * Returns loan facilities with their most recent covenant test results
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const supabase = createSupabaseAdmin();

    // Fetch all loans
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (loansError) {
      logSecurityEvent('Failed to fetch loans for portfolio', { error: loansError.message });
      return addSecurityHeaders(NextResponse.json(
        { error: sanitizeError(loansError) },
        { status: 500 }
      ));
    }

    // For each loan, fetch the most recent covenant result
    const portfolioData = await Promise.all(
      (loans || []).map(async (loan) => {
        const { data: latestResult } = await supabase
          .from('covenant_results')
          .select('*')
          .eq('loan_id', loan.id)
          .order('test_date', { ascending: false })
          .limit(1)
          .single();

        // Merge loan data with latest compliance result
        return {
          id: loan.id,
          borrowerName: loan.name,
          facilityAmount: null, // Not tracked in MVP
          outstandingAmount: null, // Not tracked in MVP
          covenantType: 'Debt/EBITDA', // MVP only supports Debt/EBITDA
          covenantLimit: loan.covenant_limit,
          maturityDate: null, // Not tracked in MVP
          
          // Latest compliance status (from covenant_results or defaults)
          currentRatio: latestResult?.debt_to_ebitda_ratio ?? null,
          status: latestResult?.covenant_status ?? 'PENDING',
          lastTestDate: latestResult?.test_date ?? null,
          lastTxHash: latestResult?.tx_hash ?? null,
          isSealed: !!latestResult,
          
          // Additional metadata
          createdAt: loan.created_at,
          updatedAt: loan.updated_at,
        };
      })
    );

    return addSecurityHeaders(NextResponse.json({
      success: true,
      loans: portfolioData,
      count: portfolioData.length,
    }));

  } catch (error: unknown) {
    logSecurityEvent('Portfolio API error', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}
