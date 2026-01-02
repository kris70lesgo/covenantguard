import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createSupabaseAdmin } from '@/lib/supabase';
import { calculateDebtToEbitda, generateComplianceHash } from '@/lib/covenant-engine';
import { 
  rateLimit, 
  validateLoanId, 
  validateNumber,
  sanitizeError,
  addSecurityHeaders,
  logSecurityEvent 
} from '@/lib/security';

// ABI for the CovenantRegistry contract (minimal interface)
const COVENANT_REGISTRY_ABI = [
  'function sealComplianceEvent(bytes32 _dataHash, string memory _loanId, string memory _status) external returns (bytes32 eventId)',
  'event ComplianceSealed(bytes32 indexed eventId, bytes32 dataHash, string loanId, string status, uint256 timestamp, address sealedBy)',
];

// Contract address (will be set after deployment)
const CONTRACT_ADDRESS = process.env.COVENANT_REGISTRY_ADDRESS || '';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const body = await request.json();
    const { loanId, documentId, totalDebt, ebitda, covenantLimit = 3.5 } = body;

    // Input validation
    if (!loanId || !validateLoanId(loanId)) {
      logSecurityEvent('Invalid loan ID in seal', { loanId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid loanId format' },
        { status: 400 }
      ));
    }

    if (!validateNumber(totalDebt, 0, 1e15) || !validateNumber(ebitda, 0.01, 1e15)) {
      logSecurityEvent('Invalid financial data in seal', { totalDebt, ebitda });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid financial data: totalDebt and ebitda must be valid positive numbers' },
        { status: 400 }
      ));
    }

    if (!validateNumber(covenantLimit, 0.1, 100)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid covenant limit' },
        { status: 400 }
      ));
    }

    // Calculate covenant result
    const covenantResult = calculateDebtToEbitda(totalDebt, ebitda, covenantLimit);

    // Create timestamp
    const timestamp = new Date().toISOString();

    // Generate data hash for blockchain
    const complianceData = {
      loanId,
      timestamp,
      totalDebt,
      ebitda,
      ratio: covenantResult.ratio,
      status: covenantResult.status,
    };

    // Check if blockchain is configured
    const rpcUrl = process.env.POLYGON_RPC_URL;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    let txHash: string | null = null;
    let blockNumber: number | null = null;

    if (rpcUrl && privateKey && CONTRACT_ADDRESS) {
      try {
        // Connect to Polygon Amoy
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, COVENANT_REGISTRY_ABI, wallet);

        // Create data hash
        const dataHashInput = JSON.stringify(complianceData);
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataHashInput));

        // Seal on blockchain
        const tx = await contract.sealComplianceEvent(
          dataHash,
          loanId,
          covenantResult.status
        );

        // Wait for confirmation
        const receipt = await tx.wait();
        
        txHash = receipt.hash;
        blockNumber = receipt.blockNumber;
      } catch (blockchainError: any) {
        console.error('Blockchain error:', blockchainError);
        // Continue without blockchain - demo mode
      }
    } else {
      // Demo mode - generate mock tx hash
      const mockHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(complianceData)));
      txHash = mockHash;
      console.log('Demo mode: Generated mock transaction hash');
    }

    // Save compliance event to database
    const supabase = createSupabaseAdmin();
    const eventId = `event-${Date.now()}`;

    const { error: dbError } = await supabase
      .from('compliance_events')
      .insert({
        id: eventId,
        loan_id: loanId,
        document_id: documentId,
        timestamp,
        total_debt: totalDebt,
        ebitda,
        ratio: covenantResult.ratio,
        status: covenantResult.status,
        tx_hash: txHash,
        block_number: blockNumber,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB fails
    }

    // Update loan status in database
    await supabase
      .from('loans')
      .update({
        current_ratio: covenantResult.ratio,
        status: covenantResult.status,
        last_test_date: timestamp,
        last_tx_hash: txHash,
        is_sealed: true,
      })
      .eq('id', loanId);

    // Update document status
    if (documentId) {
      await supabase
        .from('documents')
        .update({ status: 'sealed' })
        .eq('id', documentId);
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      eventId,
      loanId,
      covenantResult: {
        ratio: Math.round(covenantResult.ratio * 100) / 100,
        status: covenantResult.status,
        limit: covenantResult.limit,
      },
      blockchain: {
        txHash,
        blockNumber,
        network: 'Polygon Amoy',
        explorerUrl: txHash ? `https://www.oklink.com/amoy/tx/${txHash}` : null,
      },
      timestamp,
    }));
  } catch (error: unknown) {
    logSecurityEvent('Seal error', { error: sanitizeError(error) });
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
      logSecurityEvent('Invalid loan ID in seal GET', { loanId });
      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid loanId format' },
        { status: 400 }
      ));
    }

    const supabase = createSupabaseAdmin();

    let query = supabase.from('compliance_events').select('*').limit(100); // Prevent large queries
    
    if (loanId) {
      query = query.eq('loan_id', loanId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      logSecurityEvent('Database error in seal GET', { error: error.message });
      return addSecurityHeaders(NextResponse.json(
        { error: sanitizeError(error) },
        { status: 500 }
      ));
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      events: data || [],
    }));
  } catch (error: unknown) {
    logSecurityEvent('Seal GET error', { error: sanitizeError(error) });
    return addSecurityHeaders(NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    ));
  }
}
