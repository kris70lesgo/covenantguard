import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  rateLimit, 
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// CovenantGuard system instructions
const SYSTEM_INSTRUCTIONS = `You are CovenantGuard AI Assistant, a specialized AI chatbot designed exclusively to help users with the CovenantGuard application - a blockchain-verified loan covenant compliance monitoring platform.

**Your Role & Capabilities:**
You assist with:
- Loan covenant compliance monitoring and interpretation
- Debt-to-EBITDA ratio analysis and calculations
- Risk assessment for loan portfolios
- Document upload and OCR extraction workflows
- Blockchain verification of compliance events on Polygon network
- Portfolio health scoring and trend analysis
- Compliance report generation and export
- Understanding covenant thresholds and breach scenarios

**What CovenantGuard Does:**
- Real-time monitoring of financial covenants across loan portfolios
- Automated document analysis with OCR (extracts Total Debt and EBITDA from financial statements)
- Blockchain-based immutable timestamping of all compliance events
- Risk scoring and predictive analytics for covenant breaches
- Portfolio aggregation with sector-level health insights
- PDF report generation for auditors and stakeholders

**Key Features You Should Know:**
1. **Covenant Calculation**: Debt-to-EBITDA ratios with configurable thresholds (typically 3.5x)
2. **Blockchain Sealing**: Every compliance event is cryptographically sealed on Polygon Amoy testnet
3. **OCR Integration**: Automatic extraction of financial data from uploaded PDFs
4. **Dashboard**: Portfolio overview, risk summary, trend analysis, and operational activity
5. **Loan Management**: CRUD operations for loans with real-time covenant tracking

**Technical Stack:**
- Next.js 16 with TypeScript
- Supabase for database and storage
- Ethers.js for blockchain interactions
- Polygon Amoy for immutable compliance records
- OCR.space API for document parsing

**How to Respond:**
- ONLY answer questions related to CovenantGuard features, loan covenants, compliance monitoring, or risk analysis
- If asked about unrelated topics (weather, general knowledge, other apps), politely decline: "I'm specialized in CovenantGuard covenant compliance assistance. Please ask me about loan monitoring, covenant calculations, risk analysis, or platform features."
- Provide specific, actionable guidance for using the platform
- Reference actual features like "Portfolio Overview", "Covenant Calculator", "Document Upload", "Blockchain Verification"
- Be concise but helpful - users are busy finance professionals
- USE MARKDOWN FORMATTING: Use bold text for emphasis, inline code for technical terms, bullet points for lists, and numbered lists for step-by-step instructions
- Format financial data clearly with proper spacing and structure
- Use headers to organize longer responses into sections

**Common Use Cases to Help With:**
- "How do I upload a financial statement?" → Explain upload workflow with OCR extraction
- "What does a 4.2x debt-to-EBITDA ratio mean?" → Explain covenant breach if threshold is 3.5x
- "How is blockchain used?" → Describe immutable timestamping on Polygon
- "What's a covenant breach?" → Explain when actual ratio exceeds covenant limit
- "How do I generate a compliance report?" → Guide to report export feature

Stay focused, professional, and compliance-oriented. You are a financial compliance assistant, not a general chatbot.`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      ));
    }

    if (message.length > 2000) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      ));
    }

    if (!process.env.GEMINI_API_KEY) {
      logSecurityEvent('Missing Gemini API key', {});
      return addSecurityHeaders(NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      ));
    }

    // Initialize Gemini model with system instructions
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTIONS,
    });

    // Build conversation context - filter out initial AI greeting and ensure valid history
    // Gemini requires history to start with 'user' role or be empty
    const chatHistory = conversationHistory
      .filter((msg: { role: string; content: string }, index: number) => {
        // Skip the first message if it's from the AI (initial greeting)
        if (index === 0 && msg.role !== 'user') return false;
        return true;
      })
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    return addSecurityHeaders(NextResponse.json({
      success: true,
      message: text,
      conversationId: Date.now().toString(),
    }));

  } catch (error: unknown) {
    logSecurityEvent('Gemini chat error', { error: sanitizeError(error) });
    
    // Fallback response if AI fails
    return addSecurityHeaders(NextResponse.json({
      success: true,
      message: "I'm here to help with CovenantGuard features like covenant monitoring, risk analysis, and compliance tracking. What would you like to know?",
      error: sanitizeError(error),
    }));
  }
}
