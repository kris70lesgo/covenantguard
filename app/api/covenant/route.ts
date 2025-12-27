import { NextRequest, NextResponse } from 'next/server';
import { calculateDebtToEbitda, runCovenantTests } from '@/lib/covenant-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalDebt, ebitda, limit = 3.5 } = body;

    if (typeof totalDebt !== 'number' || typeof ebitda !== 'number') {
      return NextResponse.json(
        { error: 'totalDebt and ebitda must be numbers' },
        { status: 400 }
      );
    }

    const result = calculateDebtToEbitda(totalDebt, ebitda, limit);

    return NextResponse.json({
      success: true,
      input: { totalDebt, ebitda, limit },
      result: {
        ratio: Math.round(result.ratio * 100) / 100,
        status: result.status,
        limit: result.limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate covenant' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Run unit tests
  const testResults = runCovenantTests();

  return NextResponse.json({
    success: testResults.passed,
    tests: testResults.results,
    summary: testResults.passed ? 'All tests passed' : 'Some tests failed',
  });
}
