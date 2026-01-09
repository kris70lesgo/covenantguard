# Quick Start Guide - AI Parsing System

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create/update `.env.local`:

```bash
# Gemini AI (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here

# OCR.space Fallback (REQUIRED)
OCR_SPACE_API_KEY=your_ocr_space_api_key_here

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Blockchain (Optional for testing parsing)
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology/
BLOCKCHAIN_PRIVATE_KEY=your_private_key
COVENANT_REGISTRY_ADDRESS=0x...
```

### 3. Run Database Migration

Execute the SQL script in Supabase SQL Editor to extend the `uploads` table:
```bash
# Copy contents of scripts/database-migration.sql
# Paste into Supabase SQL Editor
# Run the migration
```

Or via command line:
```bash
psql -h your-supabase-host -U postgres -d postgres -f scripts/database-migration.sql
```

### 4. Start Development Server
```bash
npm run dev
```

## Testing Workflow

### End-to-End Test

1. **Navigate to Upload Page**
   ```
   http://localhost:3000/upload
   ```

2. **Select a Loan**
   - Choose from the loan selector

3. **Upload a PDF**
   - Must be a real financial statement PDF
   - Supported formats: PDF only
   - Max size: 10MB

4. **Watch AI Processing**
   - Step 1: AI Parsing (3-8 seconds)
   - Step 2: OCR Fallback if needed (8-15 seconds)

5. **Review Extracted Data**
   - Total Debt: displayed in millions
   - EBITDA: displayed in millions
   - Confidence score: 0.0 to 1.0
   - Covenant ratio calculated automatically

6. **Confirm & Record**
   - Validates data
   - Seals on blockchain (if configured)

## API Testing with cURL

### 1. Upload Document
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/financial-statement.pdf" \
  -F "loanId=loan-123" \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "document": {
    "id": "doc-abc123",
    "status": "uploaded",
    "parsingStatus": "uploaded"
  }
}
```

### 2. Parse with AI
```bash
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-abc123"
  }' \
  | jq
```

**Expected Response (Success):**
```json
{
  "success": true,
  "extractedData": {
    "totalDebt": 14000000,
    "ebitda": 3000000,
    "confidence": 0.92,
    "reasoning": "Found Total Debt on balance sheet..."
  }
}
```

**Expected Response (Needs Fallback):**
```json
{
  "success": false,
  "needsFallback": true,
  "extractedData": {
    "totalDebt": null,
    "ebitda": 3000000,
    "confidence": 0.45
  }
}
```

### 3. OCR Fallback (if needed)
```bash
curl -X POST http://localhost:3000/api/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-abc123"
  }' \
  | jq
```

### 4. Validate & Extract
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-abc123",
    "totalDebt": 14000000,
    "ebitda": 3000000,
    "confidence": 0.92
  }' \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "validated": true,
  "covenantResult": {
    "ratio": 4.67,
    "status": "RED",
    "limit": 3.5
  }
}
```

### 5. Seal on Blockchain
```bash
curl -X POST http://localhost:3000/api/seal \
  -H "Content-Type: application/json" \
  -d '{
    "loanId": "loan-123",
    "documentId": "doc-abc123",
    "totalDebt": 14000000,
    "ebitda": 3000000
  }' \
  | jq
```

## Common Issues

### ❌ "GEMINI_API_KEY not configured"
**Solution:** Add Gemini API key to `.env.local`
```bash
GEMINI_API_KEY=AIza...
```

### ❌ "OCR service not configured"
**Solution:** Add OCR.space API key to `.env.local`
```bash
OCR_SPACE_API_KEY=K8...
```

### ❌ "Document not found"
**Solution:** 
1. Check database connection
2. Run migration script
3. Verify document was uploaded successfully

### ❌ "Unable to extract financial data"
**Possible Causes:**
- PDF is scanned image (poor quality)
- Document doesn't contain financial statements
- Text is in non-English language
- Heavy formatting/tables

**Solution:** 
- Ensure PDF contains clear balance sheet or income statement
- Try OCR fallback
- Enter data manually if all else fails

### ⚠️ Low Confidence Score (< 0.6)
**Meaning:** AI is uncertain about extracted values

**Action:**
- System automatically tries OCR fallback
- Review extracted values carefully
- Consider manual verification

## Monitoring Parsing Status

### Check Document Status in Database
```sql
SELECT 
  id,
  file_url,
  parsing_status,
  ai_confidence,
  parsed_total_debt,
  parsed_ebitda,
  parsing_error,
  updated_at
FROM uploads
ORDER BY uploaded_at DESC
LIMIT 10;
```

### View Parsing Analytics
```sql
SELECT 
  parsing_status,
  COUNT(*) as count,
  AVG(ai_confidence) as avg_confidence
FROM uploads
WHERE parsing_status IS NOT NULL
GROUP BY parsing_status;
```

### Use the Parsing Status View
```sql
-- This view includes calculated covenant ratio
SELECT * FROM upload_parsing_status
ORDER BY uploaded_at DESC
LIMIT 10;
```

## Performance Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Upload | < 1s | Depends on file size |
| AI Parse | 3-8s | Gemini processing time |
| OCR Fallback | 8-15s | OCR + AI extraction |
| Validation | < 1s | Local calculation |
| Blockchain Seal | 2-5s | Polygon Amoy confirmation |

## Next Steps

1. ✅ Upload real financial statements
2. ✅ Test with various document formats
3. ✅ Monitor confidence scores
4. ✅ Review extraction accuracy
5. ✅ Configure blockchain sealing
6. ✅ Train team on new workflow

## Support

For issues or questions:
1. Check [docs/AI-PARSING.md](./AI-PARSING.md)
2. Review console logs
3. Check database parsing_status and parsing_error fields
4. Verify all environment variables are set

## Success Criteria

✅ Upload completes successfully  
✅ AI parsing returns confidence ≥ 0.6  
✅ Extracted values match actual document  
✅ Covenant ratio calculated correctly  
✅ Blockchain sealing succeeds (if configured)  

---

**Note:** The system no longer returns mock data. All failures are explicit and require real document parsing or manual data entry.
