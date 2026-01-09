import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { calculateDebtToEbitda } from '@/lib/covenant-engine';
import { 
  rateLimit, 
  validateDocumentId,
  validateNumber,
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

/**
 * Extract and Validate Financial Data API
 * Processes parsed data, validates it, and prepares for blockchain sealing
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const body = await request.json();
    const { documentId, totalDebt, ebitda, confidence } = body;

    // Validate documentId
    if (!documentId || !validateDocumentId(documentId)) {
      logSecurityEvent('Invalid document ID in extract', { documentId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid documentId format' },
        { status: 400 }
      ));
    }

    // Validate financial data
    if (!validateNumber(totalDebt, 0, 1e15)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid totalDebt: must be a positive number' },
        { status: 400 }
      ));
    }

    if (!validateNumber(ebitda, 0.01, 1e15)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid ebitda: must be a positive number greater than 0' },
        { status: 400 }
      ));
    }

    // Initialize Supabase
    const supabase = createSupabaseAdmin();

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('uploads')
      .select('*, loans(*)')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      logSecurityEvent('Document not found in extract', { documentId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      ));
    }

    // Get covenant limit from associated loan
    let covenantLimit = 3.5; // Default
    if (document.loans && document.loans.covenant_limit) {
      covenantLimit = document.loans.covenant_limit;
    }

    // Calculate covenant ratio and status
    const covenantResult = calculateDebtToEbitda(
      totalDebt,
      ebitda,
      covenantLimit
    );

    // Round ratio to 2 decimal places
    const ratio = Math.round(covenantResult.ratio * 100) / 100;

    // Update document with validated extraction
    await supabase
      .from('uploads')
      .update({
        parsed_total_debt: totalDebt,
        parsed_ebitda: ebitda,
        ai_confidence: confidence || document.ai_confidence,
        parsing_status: 'validated',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    console.log(`✅ Extraction validated for document ${documentId}`);
    console.log(`   Ratio: ${ratio}x, Status: ${covenantResult.status}, Limit: ${covenantLimit}x`);

    return addSecurityHeaders(NextResponse.json({
      success: true,
      validated: true,
      extractedData: {
        totalDebt,
        ebitda,
        confidence: confidence || document.ai_confidence,
      },
      covenantResult: {
        ratio,
        status: covenantResult.status,
        limit: covenantLimit,
      },
      message: 'Data validated successfully - ready for blockchain sealing'
    }));

  } catch (error: unknown) {
    logSecurityEvent('Extract API error', { error: sanitizeError(error) });
    
    return addSecurityHeaders(NextResponse.json(
      { 
        error: 'Validation failed',
        details: sanitizeError(error)
      },
      { status: 500 }
    ));
  }
}

/**
 * GET endpoint to retrieve extracted data for a document
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId || !validateDocumentId(documentId)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid documentId' },
        { status: 400 }
      ));
    }

    const supabase = createSupabaseAdmin();

    const { data: document, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      ));
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      document: {
        id: document.id,
        loanId: document.loan_id,
        fileUrl: document.file_url,
        parsingStatus: document.parsing_status,
        totalDebt: document.parsed_total_debt,
        ebitda: document.parsed_ebitda,
        confidence: document.ai_confidence,
        uploadDate: document.uploaded_at,
        error: document.parsing_error,
      }
    }));

  } catch (error: unknown) {
    logSecurityEvent('Extract GET error', { error: sanitizeError(error) });
    
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}
