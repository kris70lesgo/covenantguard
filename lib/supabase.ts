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
export interface DbUpload {
  id: string;
  loan_id: string;
  file_url: string;
  file_path: string;
  file_name?: string;
  file_size?: number;
  file_hash?: string;
  mime_type?: string;
  uploaded_at: string;
  parsing_status: 'uploaded' | 'ai_in_progress' | 'parsed' | 'parsed_incomplete' | 'ocr_fallback' | 'validated' | 'failed' | 'unsupported_format';
  parsed_total_debt?: number;
  parsed_ebitda?: number;
  ai_confidence?: number;
  parsing_error?: string;
  parsing_attempts: number;
  updated_at?: string;
}

export interface DbLoan {
  id: string;
  name: string; // Actual column name in loans table
  covenant_limit: number;
  created_at: string;
  updated_at: string;
  // Note: MVP does not track facility_amount, outstanding_amount, maturity_date, or covenant_type
  // covenant_type is hardcoded as "Debt/EBITDA" in API responses
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
