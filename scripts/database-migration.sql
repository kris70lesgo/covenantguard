-- Database Schema Updates for AI-Driven Parsing
-- Extend the existing 'uploads' table with AI parsing fields

-- Migration: Add AI parsing fields to uploads table
-- Using separate statements to handle existing columns gracefully

DO $$ 
BEGIN
  -- Add file_path column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='file_path') THEN
    ALTER TABLE uploads ADD COLUMN file_path TEXT;
  END IF;

  -- Add file_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='file_name') THEN
    ALTER TABLE uploads ADD COLUMN file_name TEXT;
  END IF;

  -- Add file_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='file_size') THEN
    ALTER TABLE uploads ADD COLUMN file_size BIGINT;
  END IF;

  -- Add file_hash column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='file_hash') THEN
    ALTER TABLE uploads ADD COLUMN file_hash TEXT;
  END IF;

  -- Add mime_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='mime_type') THEN
    ALTER TABLE uploads ADD COLUMN mime_type TEXT;
  END IF;

  -- Add parsing_status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='parsing_status') THEN
    ALTER TABLE uploads ADD COLUMN parsing_status TEXT DEFAULT 'uploaded';
  END IF;

  -- Add parsed_total_debt column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='parsed_total_debt') THEN
    ALTER TABLE uploads ADD COLUMN parsed_total_debt BIGINT;
  END IF;

  -- Add parsed_ebitda column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='parsed_ebitda') THEN
    ALTER TABLE uploads ADD COLUMN parsed_ebitda BIGINT;
  END IF;

  -- Add ai_confidence column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='ai_confidence') THEN
    ALTER TABLE uploads ADD COLUMN ai_confidence NUMERIC(3,2);
  END IF;

  -- Add parsing_error column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='parsing_error') THEN
    ALTER TABLE uploads ADD COLUMN parsing_error TEXT;
  END IF;

  -- Add parsing_attempts column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='parsing_attempts') THEN
    ALTER TABLE uploads ADD COLUMN parsing_attempts INTEGER DEFAULT 0;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='uploads' AND column_name='updated_at') THEN
    ALTER TABLE uploads ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- Add constraints
DO $$
BEGIN
  -- Add check constraint for parsing_status
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uploads_parsing_status_check') THEN
    ALTER TABLE uploads ADD CONSTRAINT uploads_parsing_status_check 
      CHECK (parsing_status IN ('uploaded', 'ai_in_progress', 'parsed', 'parsed_incomplete', 'ocr_fallback', 'validated', 'failed', 'unsupported_format'));
  END IF;

  -- Add check constraint for ai_confidence
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uploads_ai_confidence_check') THEN
    ALTER TABLE uploads ADD CONSTRAINT uploads_ai_confidence_check 
      CHECK (ai_confidence >= 0 AND ai_confidence <= 1);
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_uploads_parsing_status ON uploads(parsing_status);
CREATE INDEX IF NOT EXISTS idx_uploads_loan_id ON uploads(loan_id);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_uploads_file_hash ON uploads(file_hash);

-- Add unique constraint for file_hash per loan (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_uploads_unique_hash_per_loan ON uploads(loan_id, file_hash);

-- Add comments for documentation
COMMENT ON COLUMN uploads.file_hash IS 'SHA-256 hash of file contents for duplicate detection';
COMMENT ON COLUMN uploads.parsed_total_debt IS 'Total debt extracted by AI/OCR in USD';
COMMENT ON COLUMN uploads.parsed_ebitda IS 'EBITDA extracted by AI/OCR in USD';
COMMENT ON COLUMN uploads.ai_confidence IS 'AI extraction confidence score (0.0 to 1.0)';
COMMENT ON COLUMN uploads.parsing_status IS 'Current parsing lifecycle status';
COMMENT ON COLUMN uploads.parsing_error IS 'Error message if parsing failed';
COMMENT ON COLUMN uploads.parsing_attempts IS 'Number of parsing attempts made';

-- Create a view for easy monitoring of parsing status
CREATE OR REPLACE VIEW upload_parsing_status AS
SELECT 
  u.id,
  u.loan_id,
  u.file_url,
  u.parsing_status,
  u.ai_confidence,
  u.parsed_total_debt,
  u.parsed_ebitda,
  u.parsing_error,
  u.parsing_attempts,
  u.uploaded_at,
  u.updated_at,
  CASE 
    WHEN u.parsed_total_debt IS NOT NULL AND u.parsed_ebitda IS NOT NULL AND u.parsed_ebitda > 0
    THEN ROUND((u.parsed_total_debt::NUMERIC / u.parsed_ebitda::NUMERIC), 2)
    ELSE NULL
  END as calculated_ratio,
  CASE
    WHEN u.parsed_total_debt IS NOT NULL AND u.parsed_ebitda IS NOT NULL AND u.parsed_ebitda > 0
    THEN 
      CASE
        WHEN (u.parsed_total_debt::NUMERIC / u.parsed_ebitda::NUMERIC) > 3.5 THEN 'RED'
        WHEN (u.parsed_total_debt::NUMERIC / u.parsed_ebitda::NUMERIC) >= 3.15 THEN 'AMBER'
        ELSE 'GREEN'
      END
    ELSE NULL
  END as covenant_status
FROM uploads u
ORDER BY u.uploaded_at DESC;

-- Grant permissions
GRANT SELECT ON upload_parsing_status TO authenticated;

-- Add covenant_results table columns if missing
DO $$
BEGIN
  -- Add block_number column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='covenant_results' AND column_name='block_number') THEN
    ALTER TABLE covenant_results ADD COLUMN block_number BIGINT;
  END IF;
END $$;
