/**
 * Gemini AI Client for Intelligent Document Parsing
 * Uses Gemini 3 Pro for multimodal PDF understanding and structured extraction
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not configured. AI parsing will fail.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface FinancialExtraction {
  totalDebt: number | null;
  ebitda: number | null;
  confidence: number;
  reasoning?: string;
  unsupportedType?: boolean; // True when document uses complex definitions (e.g., Net Debt)
}

/**
 * Parse financial document using Gemini multimodal AI
 * Supports PDF files via base64 encoding or URLs
 */
export async function parseFinancialDocument(
  fileData: string | Buffer,
  mimeType: string = 'application/pdf'
): Promise<FinancialExtraction> {
  try {
    // Use Gemini Pro Vision for multimodal understanding
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1, // Low temperature for deterministic extraction
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    // Convert Buffer to base64 if needed
    let base64Data: string;
    if (Buffer.isBuffer(fileData)) {
      base64Data = fileData.toString('base64');
    } else {
      base64Data = fileData;
    }

    const prompt = `
You are a financial document analysis expert. Extract the following key financial metrics from the provided document:

1. **Total Debt** - The total outstanding debt amount (may be labeled as "Total Debt", "Total Borrowings", "Long-term Debt + Short-term Debt", etc.)
2. **EBITDA** - Earnings Before Interest, Taxes, Depreciation, and Amortization (may be labeled as "EBITDA", "Operating Income", "Adjusted EBITDA", etc.)

IMPORTANT INSTRUCTIONS:
- Look for these values in financial statements, balance sheets, income statements, or covenant compliance reports
- Values may be in thousands or millions - convert all values to absolute USD amounts
- If you see "14,000" with a note saying "in thousands", the actual value is 14,000,000
- If you see "14.5M" or "14.5 million", the value is 14,500,000
- Return NULL for any metric you cannot find with high confidence
- Provide your reasoning for each extraction

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "totalDebt": <number or null>,
  "ebitda": <number or null>,
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief explanation of what you found>"
}

Example outputs:
{"totalDebt": 14000000, "ebitda": 3000000, "confidence": 0.95, "reasoning": "Found Total Debt on page 2 balance sheet, EBITDA on page 3 income statement"}
{"totalDebt": null, "ebitda": 3500000, "confidence": 0.6, "reasoning": "Found EBITDA clearly, but Total Debt label was ambiguous"}
`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse JSON response with resilient extraction
    let extracted: FinancialExtraction;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try standard JSON parse first
      try {
        extracted = JSON.parse(cleanedText);
      } catch {
        // Fallback: extract what we can from partial JSON
        console.warn('Failed to parse Gemini response as JSON, attempting partial extraction:', text);
        
        // Try to extract individual fields using regex
        const totalDebtMatch = cleanedText.match(/"totalDebt"\s*:\s*(\d+\.?\d*|null)/i);
        const ebitdaMatch = cleanedText.match(/"ebitda"\s*:\s*(\d+\.?\d*|null)/i);
        const confidenceMatch = cleanedText.match(/"confidence"\s*:\s*(\d+\.?\d*|null)/i);
        
        const totalDebt = totalDebtMatch ? (totalDebtMatch[1] === 'null' ? null : parseFloat(totalDebtMatch[1])) : null;
        const ebitda = ebitdaMatch ? (ebitdaMatch[1] === 'null' ? null : parseFloat(ebitdaMatch[1])) : null;
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0;
        
        extracted = {
          totalDebt,
          ebitda,
          confidence,
          reasoning: 'Extracted from partial AI response',
        };
        
        console.log('✅ Partial extraction successful:', extracted);
      }
    } catch {
      console.error('Complete parsing failure for Gemini response:', text);
      return {
        totalDebt: null,
        ebitda: null,
        confidence: 0,
        reasoning: 'AI returned malformed response',
      };
    }

    // Validate extracted data
    if (typeof extracted.totalDebt === 'number' && extracted.totalDebt < 0) {
      extracted.totalDebt = null;
    }
    if (typeof extracted.ebitda === 'number' && extracted.ebitda <= 0) {
      extracted.ebitda = null;
    }

    // Ensure confidence is between 0 and 1
    extracted.confidence = Math.max(0, Math.min(1, extracted.confidence || 0));

    // Detect unsupported document type: EBITDA found but Total Debt missing
    // This likely means complex debt definitions (e.g., Net Debt, Adjusted Debt)
    if (extracted.ebitda !== null && extracted.totalDebt === null && extracted.confidence > 0.5) {
      extracted.unsupportedType = true;
      extracted.reasoning = 'Document contains EBITDA but uses complex debt definitions (e.g., Net Debt). Automatic extraction not supported for this format.';
    }

    return extracted;
  } catch (error) {
    console.error('Gemini AI parsing error:', error);
    return {
      totalDebt: null,
      ebitda: null,
      confidence: 0,
      reasoning: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract financial metrics from OCR text using Gemini AI
 * Fallback method when direct PDF parsing fails
 */
export async function extractFromOCRText(ocrText: string): Promise<FinancialExtraction> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `
You are analyzing OCR-extracted text from a financial document. Extract:

1. **Total Debt** - Total outstanding debt amount
2. **EBITDA** - Earnings Before Interest, Taxes, Depreciation, and Amortization

OCR TEXT:
${ocrText.slice(0, 10000)} 

INSTRUCTIONS:
- Values may be in thousands or millions - convert to absolute USD
- Look for patterns like "Total Debt: $14,000,000" or "Debt 14.5M"
- Return NULL if you cannot find a value with reasonable confidence
- Handle OCR errors and typos intelligently

Output ONLY valid JSON (no markdown):
{
  "totalDebt": <number or null>,
  "ebitda": <number or null>,
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief explanation>"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response with resilient extraction
    let extracted: FinancialExtraction;
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try standard JSON parse first
      try {
        extracted = JSON.parse(cleanedText);
      } catch {
        // Fallback: extract what we can from partial JSON
        console.warn('Failed to parse Gemini OCR response, attempting partial extraction:', text);
        
        const totalDebtMatch = cleanedText.match(/"totalDebt"\s*:\s*(\d+\.?\d*|null)/i);
        const ebitdaMatch = cleanedText.match(/"ebitda"\s*:\s*(\d+\.?\d*|null)/i);
        const confidenceMatch = cleanedText.match(/"confidence"\s*:\s*(\d+\.?\d*|null)/i);
        
        const totalDebt = totalDebtMatch ? (totalDebtMatch[1] === 'null' ? null : parseFloat(totalDebtMatch[1])) : null;
        const ebitda = ebitdaMatch ? (ebitdaMatch[1] === 'null' ? null : parseFloat(ebitdaMatch[1])) : null;
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0;
        
        extracted = {
          totalDebt,
          ebitda,
          confidence,
          reasoning: 'Extracted from partial AI response',
        };
        
        console.log('✅ Partial OCR extraction successful:', extracted);
      }
    } catch {
      console.error('Complete parsing failure for Gemini OCR response:', text);
      return {
        totalDebt: null,
        ebitda: null,
        confidence: 0,
        reasoning: 'AI returned malformed response',
      };
    }

    // Validate
    if (typeof extracted.totalDebt === 'number' && extracted.totalDebt < 0) {
      extracted.totalDebt = null;
    }
    if (typeof extracted.ebitda === 'number' && extracted.ebitda <= 0) {
      extracted.ebitda = null;
    }

    extracted.confidence = Math.max(0, Math.min(1, extracted.confidence || 0));

    return extracted;
  } catch (error) {
    console.error('Gemini OCR extraction error:', error);
    return {
      totalDebt: null,
      ebitda: null,
      confidence: 0,
      reasoning: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for Gemini API availability
 */
export async function testGeminiConnection(): Promise<boolean> {
  if (!GEMINI_API_KEY) return false;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Respond with: OK');
    const text = result.response.text();
    return text.includes('OK');
  } catch {
    return false;
  }
}
