import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { extractFromOCRText } from '@/lib/gemini';
import { 
  rateLimit, 
  validateDocumentId, 
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

const OCR_API_KEY = process.env.OCR_SPACE_API_KEY;
const OCR_API_URL = 'https://api.ocr.space/parse/image';

interface OCRResult {
  ParsedResults?: Array<{
    ParsedText: string;
    ErrorMessage?: string;
    FileParseExitCode: number;
  }>;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string[];
  OCRExitCode: number;
}

/**
 * OCR Fallback API
 * This route is ONLY used when AI parsing fails or has low confidence.
 * It uses OCR.space to extract text, then uses Gemini AI to intelligently parse the text.
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
      logSecurityEvent('Invalid document ID in OCR fallback', { documentId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid documentId format' },
        { status: 400 }
      ));
    }

    if (!OCR_API_KEY) {
      logSecurityEvent('OCR API key not configured', {});
      return addSecurityHeaders(NextResponse.json(
        { error: 'OCR service not configured - cannot perform fallback' },
        { status: 503 }
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
      logSecurityEvent('Document not found in OCR fallback', { documentId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      ));
    }

    // Update status to indicate OCR fallback is in progress
    await supabase
      .from('uploads')
      .update({ 
        parsing_status: 'ocr_fallback',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    console.log(`🔄 Starting OCR fallback for document ${documentId}`);

    let ocrText = '';
    let ocrSuccess = false;

    // Try URL-based OCR first
    try {
      // Get public URL for the file
      const { data: urlData } = supabase
        .storage
        .from('financials')
        .getPublicUrl(document.file_path);

      if (urlData?.publicUrl) {
        console.log(`🔗 Attempting OCR with URL: ${urlData.publicUrl}`);
        
        const formData = new FormData();
        formData.append('apikey', OCR_API_KEY);
        formData.append('url', urlData.publicUrl);
        formData.append('filetype', 'PDF');
        formData.append('language', 'eng');
        formData.append('OCREngine', '2');
        formData.append('isTable', 'true');
        formData.append('scale', 'true');
        formData.append('isCreateSearchablePdf', 'false');

        const ocrResponse = await fetch(OCR_API_URL, {
          method: 'POST',
          body: formData,
        });

        if (ocrResponse.ok) {
          const ocrResult: OCRResult = await ocrResponse.json();
          
          // Handle page limit errors for URL method too
          if (ocrResult.IsErroredOnProcessing) {
            const errorMsg = ocrResult.ErrorMessage?.join(', ') || '';
            if (errorMsg.toLowerCase().includes('page limit') && ocrResult.ParsedResults?.[0]?.ParsedText) {
              console.warn(`⚠️ URL OCR page limit reached - using partial results`);
              ocrText = ocrResult.ParsedResults[0].ParsedText;
              ocrSuccess = true;
              console.log(`✅ URL-based OCR partial success - ${ocrText.length} characters`);
            }
          } else if (ocrResult.ParsedResults?.[0]?.ParsedText) {
            ocrText = ocrResult.ParsedResults[0].ParsedText;
            ocrSuccess = true;
            console.log(`✅ URL-based OCR successful - ${ocrText.length} characters`);
          }
        }
      }
    } catch (urlError) {
      console.warn('URL-based OCR failed, trying base64...', urlError);
    }

    // Fallback to base64 if URL failed
    if (!ocrSuccess) {
      console.log(`📄 Attempting OCR with base64 file upload...`);
      
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('financials')
        .download(document.file_path);

      if (downloadError || !fileData) {
        throw new Error('Could not download file for OCR processing');
      }

      // Convert to base64
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');

      const formData = new FormData();
      formData.append('apikey', OCR_API_KEY);
      formData.append('base64Image', `data:application/pdf;base64,${base64}`);
      formData.append('filetype', 'PDF');
      formData.append('language', 'eng');
      formData.append('OCREngine', '2');
      formData.append('isTable', 'true');
      formData.append('scale', 'true');
      formData.append('isCreateSearchablePdf', 'false');

      const ocrResponse = await fetch(OCR_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error(`OCR service returned status ${ocrResponse.status}`);
      }

      const ocrResult: OCRResult = await ocrResponse.json();
      
      if (ocrResult.IsErroredOnProcessing || !ocrResult.ParsedResults?.[0]?.ParsedText) {
        const errorMsg = ocrResult.ErrorMessage?.join(', ') || 'OCR processing failed';
        
        // Handle page limit errors more gracefully
        if (errorMsg.toLowerCase().includes('page limit')) {
          console.warn(`⚠️ OCR page limit reached - attempting to process available pages`);
          // If we got partial text, still try to extract from it
          if (ocrResult.ParsedResults?.[0]?.ParsedText) {
            ocrText = ocrResult.ParsedResults[0].ParsedText;
            ocrSuccess = true;
            console.log(`✅ Base64 OCR partial success - ${ocrText.length} characters`);
          } else {
            throw new Error(`OCR page limit reached: ${errorMsg}`);
          }
        } else {
          throw new Error(`OCR failed: ${errorMsg}`);
        }
      } else {
        ocrText = ocrResult.ParsedResults[0].ParsedText;
        ocrSuccess = true;
        console.log(`✅ Base64 OCR successful - ${ocrText.length} characters`);
      }
    }

    // Only proceed if we got OCR text
    if (!ocrSuccess || !ocrText) {
      throw new Error('OCR failed to extract any text from document');
    }

    // Use Gemini AI to intelligently extract from OCR text
    console.log(`🤖 Using AI to parse OCR text...`);
    const extracted = await extractFromOCRText(ocrText);

    console.log(`✅ AI extraction from OCR complete - Confidence: ${extracted.confidence}`);
    console.log(`   Total Debt: ${extracted.totalDebt}, EBITDA: ${extracted.ebitda}`);

    // Determine if extraction was successful
    const isSuccess = extracted.confidence >= 0.5 && 
                      extracted.totalDebt !== null && 
                      extracted.ebitda !== null;

    // Update document with OCR results
    await supabase
      .from('uploads')
      .update({
        parsed_total_debt: extracted.totalDebt,
        parsed_ebitda: extracted.ebitda,
        ai_confidence: extracted.confidence,
        parsing_status: isSuccess ? 'parsed' : 'failed',
        parsing_error: isSuccess ? null : (extracted.reasoning || 'Could not extract financial data'),
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (!isSuccess) {
      // Hard fail - no mock data
      return addSecurityHeaders(NextResponse.json({
        success: false,
        error: 'OCR fallback failed to extract financial data',
        details: extracted.reasoning,
        extractedData: null,
        message: 'Unable to parse document. Please verify the document contains clear financial statements or enter data manually.'
      }, { status: 422 }));
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      method: 'ocr_fallback',
      ocrSuccess,
      extractedData: {
        totalDebt: extracted.totalDebt,
        ebitda: extracted.ebitda,
        confidence: extracted.confidence,
        reasoning: extracted.reasoning,
        rawTextPreview: ocrText.slice(0, 500),
      },
      message: 'Document parsed using OCR + AI fallback'
    }));

  } catch (error: unknown) {
    logSecurityEvent('OCR fallback error', { error: sanitizeError(error) });
    
    // Update document status to reflect hard failure
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

    // Hard fail - no mock data
    return addSecurityHeaders(NextResponse.json(
      { 
        success: false,
        error: 'OCR fallback failed',
        details: sanitizeError(error),
        message: 'Unable to process document. Please check the file quality or enter data manually.'
      },
      { status: 500 }
    ));
  }
}
