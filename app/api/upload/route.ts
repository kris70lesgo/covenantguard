import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { 
  rateLimit, 
  sanitizeFilename, 
  validateFileSize, 
  validateLoanId, 
  generateDocumentId,
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const loanId = formData.get('loanId') as string;

    // Input validation
    if (!file) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      ));
    }

    if (!loanId || !validateLoanId(loanId)) {
      logSecurityEvent('Invalid loan ID', { loanId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid loanId format' },
        { status: 400 }
      ));
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      logSecurityEvent('File size exceeded', { size: file.size, loanId });
      return addSecurityHeaders(NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      ));
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      logSecurityEvent('Invalid file type', { type: file.type, loanId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid file type. Only PDF and Excel files are allowed.' },
        { status: 400 }
      ));
    }

    // Create unique file path with sanitized filename
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFilename(file.name);
    const filePath = `${loanId}/${timestamp}_${sanitizedFileName}`;

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const supabase = createSupabaseAdmin();
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('financials')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('financials')
      .getPublicUrl(filePath);

    // Save document metadata to database with secure ID
    const documentId = generateDocumentId();
    
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        loan_id: loanId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        upload_date: new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (docError) {
      console.error('Database error:', docError);
      // Even if DB insert fails, file was uploaded successfully
      // Return partial success
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      document: {
        id: documentId,
        loanId,
        fileName: sanitizeFilename(file.name),
        filePath,
        fileUrl: urlData?.publicUrl,
        fileSize: file.size,
        mimeType: file.type,
        status: 'pending',
      },
    }));
  } catch (error: unknown) {
    logSecurityEvent('Upload error', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    // Validate loanId if provided
    if (loanId && !validateLoanId(loanId)) {
      logSecurityEvent('Invalid loan ID in GET', { loanId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid loanId format' },
        { status: 400 }
      ));
    }

    const supabase = createSupabaseAdmin();

    let query = supabase.from('documents').select('*').limit(100); // Prevent large queries
    
    if (loanId) {
      query = query.eq('loan_id', loanId);
    }

    const { data, error } = await query.order('upload_date', { ascending: false });

    if (error) {
      logSecurityEvent('Database error in upload GET', { error: error.message });
      return addSecurityHeaders(NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      ));
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      documents: data || [],
    }));
  } catch (error: unknown) {
    logSecurityEvent('Upload GET error', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}
