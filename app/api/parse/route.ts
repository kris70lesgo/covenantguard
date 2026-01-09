import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { parseFinancialDocument } from '@/lib/gemini';
import { 
  rateLimit, 
  validateDocumentId, 
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

/**
 * AI-Driven Document Parsing API
 * Uses Gemini 3 Pro multimodal AI to intelligently extract financial data from PDFs
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const body = await request.json();
    const { documentId } = body;

    // Validate documentId
    if (!documentId || !validateDocumentId(documentId)) {
      logSecurityEvent('Invalid document ID in parse', { documentId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid documentId format' },
        { status: 400 }
      ));
    }

    // Initialize Supabase
    const supabase = createSupabaseAdmin();

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      logSecurityEvent('Document not found in parse', { documentId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      ));
    }

    // Update status to indicate AI parsing is in progress
    await supabase
      .from('uploads')
      .update({ 
        parsing_status: 'ai_in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('financials')
      .download(document.file_path);

    if (downloadError || !fileData) {
      logSecurityEvent('Failed to download file for parsing', { documentId, error: downloadError });
      
      // Update status to reflect failure
      await supabase
        .from('uploads')
        .update({ 
          parsing_status: 'failed',
          parsing_error: 'File download failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      return addSecurityHeaders(NextResponse.json(
        { error: 'Failed to download file for processing' },
        { status: 500 }
      ));
    }

    // Convert Blob to Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse document using Gemini AI
    console.log(`🤖 Starting AI parsing for document ${documentId}`);
    const mimeType = document.mime_type || 'application/pdf';
    const extracted = await parseFinancialDocument(buffer, mimeType);

    console.log(`✅ AI parsing complete - Confidence: ${extracted.confidence}`);
    console.log(`   Total Debt: ${extracted.totalDebt}, EBITDA: ${extracted.ebitda}`);

    // Check for unsupported document type
    if (extracted.unsupportedType) {
      console.log(`⚠️ Unsupported document type detected - complex debt definitions`);
      
      await supabase
        .from('uploads')
        .update({
          parsed_total_debt: extracted.totalDebt,
          parsed_ebitda: extracted.ebitda,
          ai_confidence: extracted.confidence,
          parsing_status: 'unsupported_format',
          parsing_error: extracted.reasoning || 'Document uses complex debt definitions (e.g., Net Debt) not supported for automatic extraction',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      return addSecurityHeaders(NextResponse.json({
        success: false,
        needsFallback: false, // Don't fallback to OCR - it won't help
        unsupportedType: true,
        extractedData: {
          totalDebt: extracted.totalDebt,
          ebitda: extracted.ebitda,
          confidence: extracted.confidence,
          reasoning: extracted.reasoning,
        },
        message: 'Document contains complex debt definitions (e.g., Net Debt). Automatic extraction not supported for this format.'
      }));
    }

    // Determine if extraction was successful based on confidence
    const isSuccess = extracted.confidence >= 0.6 && 
                      extracted.totalDebt !== null && 
                      extracted.ebitda !== null;

    // Update database with parsed results
    await supabase
      .from('uploads')
      .update({
        parsed_total_debt: extracted.totalDebt,
        parsed_ebitda: extracted.ebitda,
        ai_confidence: extracted.confidence,
        parsing_status: isSuccess ? 'parsed' : 'parsed_incomplete',
        parsing_error: isSuccess ? null : (extracted.reasoning || 'Low confidence or missing data'),
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return addSecurityHeaders(NextResponse.json({
      success: isSuccess,
      needsFallback: !isSuccess,
      unsupportedType: false,
      extractedData: {
        totalDebt: extracted.totalDebt,
        ebitda: extracted.ebitda,
        confidence: extracted.confidence,
        reasoning: extracted.reasoning,
      },
      message: isSuccess 
        ? 'Document parsed successfully with AI'
        : 'AI parsing incomplete - fallback to OCR recommended'
    }));

  } catch (error: unknown) {
    logSecurityEvent('Parse API error', { error: sanitizeError(error) });
    
    // Update document status to reflect failure
    try {
      const body = await request.json();
      const supabase = createSupabaseAdmin();
      await supabase
        .from('uploads')
        .update({ 
          parsing_status: 'failed',
          parsing_error: sanitizeError(error),
          updated_at: new Date().toISOString()
        })
        .eq('id', body.documentId);
    } catch {}

    return addSecurityHeaders(NextResponse.json(
      { 
        error: 'AI parsing failed',
        details: sanitizeError(error),
        needsFallback: true
      },
      { status: 500 }
    ));
  }
}
