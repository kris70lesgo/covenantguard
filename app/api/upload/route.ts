import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const loanId = formData.get('loanId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!loanId) {
      return NextResponse.json(
        { error: 'No loanId provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Excel files are allowed.' },
        { status: 400 }
      );
    }

    // Create unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
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

    // Save document metadata to database
    const documentId = `doc-${timestamp}`;
    
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

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        loanId,
        fileName: file.name,
        filePath,
        fileUrl: urlData?.publicUrl,
        fileSize: file.size,
        mimeType: file.type,
        status: 'pending',
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');

    const supabase = createSupabaseAdmin();

    let query = supabase.from('documents').select('*');
    
    if (loanId) {
      query = query.eq('loan_id', loanId);
    }

    const { data, error } = await query.order('upload_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
