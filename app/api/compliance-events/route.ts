import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { 
  rateLimit, 
  validateLoanId,
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

/**
 * Compliance Events API - Historical Event Log
 * Returns all covenant test submissions in chronological order
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Validate loanId if provided
    if (loanId && !validateLoanId(loanId)) {
      logSecurityEvent('Invalid loan ID in compliance-events', { loanId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid loanId format' },
        { status: 400 }
      ));
    }

    const supabase = createSupabaseAdmin();

    // Build query - fetch covenant results with loan details
    let query = supabase
      .from('covenant_results')
      .select(`
        id,
        loan_id,
        upload_id,
        test_date,
        total_debt,
        ebitda,
        debt_to_ebitda_ratio,
        covenant_status,
        tx_hash,
        block_number,
        loans!inner(
          name,
          covenant_limit
        )
      `)
      .order('test_date', { ascending: false })
      .limit(Math.min(limit, 1000)); // Cap at 1000 for safety

    // Filter by loan if specified
    if (loanId) {
      query = query.eq('loan_id', loanId);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      logSecurityEvent('Failed to fetch compliance events', { error: eventsError.message });
      return addSecurityHeaders(NextResponse.json(
        { error: sanitizeError(eventsError) },
        { status: 500 }
      ));
    }

    // Transform data for frontend
    const formattedEvents = (events || []).map((event) => {
      // Supabase returns loans as array even with !inner, get first element
      const loan = Array.isArray(event.loans) ? event.loans[0] : event.loans;
      
      return {
        id: event.id,
        eventId: `EVT-${event.id.slice(0, 8).toUpperCase()}`,
        loanId: event.loan_id,
        borrowerName: loan?.name || 'Unknown',
        covenantType: 'Debt/EBITDA', // MVP only supports Debt/EBITDA
        exposure: null, // Not tracked in MVP
        totalDebt: event.total_debt,
        ebitda: event.ebitda,
        ratio: event.debt_to_ebitda_ratio,
        covenantLimit: loan?.covenant_limit || 3.5,
        status: event.covenant_status,
        testDate: event.test_date,
        txHash: event.tx_hash,
        blockNumber: event.block_number,
        uploadId: event.upload_id,
      };
    });

    return addSecurityHeaders(NextResponse.json({
      success: true,
      events: formattedEvents,
      count: formattedEvents.length,
    }));

  } catch (error: unknown) {
    logSecurityEvent('Compliance events API error', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}
