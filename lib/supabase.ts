import { createClient } from '@supabase/supabase-js';

// Supabase client singleton for API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase client for browser/server (factory function)
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Supabase admin client (server-side only, with service role key)
export function createSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Database types
export interface DbLoan {
  id: string;
  borrower_name: string;
  facility_amount: number;
  outstanding_amount: number;
  maturity_date: string;
  covenant_type: string;
  covenant_limit: number;
  created_at: string;
  updated_at: string;
}

export interface DbDocument {
  id: string;
  loan_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
  status: 'pending' | 'processing' | 'extracted' | 'confirmed' | 'sealed';
  extracted_text?: string;
  ocr_confidence?: number;
}

export interface DbComplianceEvent {
  id: string;
  loan_id: string;
  document_id: string;
  timestamp: string;
  total_debt: number;
  ebitda: number;
  ratio: number;
  status: 'GREEN' | 'AMBER' | 'RED';
  tx_hash?: string;
  block_number?: number;
}
