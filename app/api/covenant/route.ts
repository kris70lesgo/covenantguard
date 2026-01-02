import { NextRequest, NextResponse } from 'next/server';
import { calculateDebtToEbitda, runCovenantTests } from '@/lib/covenant-engine';
import { 
  rateLimit, 
  validateCovenantInput, 
  sanitizeError, 
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const body = await request.json();
    
    // Input validation
    if (!validateCovenantInput(body)) {
      logSecurityEvent('Invalid covenant input', { body });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid input: totalDebt and ebitda must be valid positive numbers' },
        { status: 400 }
      ));
    }

    const { totalDebt, ebitda, limit = 3.5 } = body;
    const result = calculateDebtToEbitda(totalDebt, ebitda, limit);

    return addSecurityHeaders(NextResponse.json({
      success: true,
      input: { totalDebt, ebitda, limit },
      result: {
        ratio: Math.round(result.ratio * 100) / 100,
        status: result.status,
        limit: result.limit,
      },
    }));
  } catch (error) {
    logSecurityEvent('Covenant calculation error', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

  // Run unit tests
  const testResults = runCovenantTests();

  return addSecurityHeaders(NextResponse.json({
    success: testResults.passed,
    tests: testResults.results,
    summary: testResults.passed ? 'All tests passed' : 'Some tests failed',
  }));
}
