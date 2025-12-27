// Core types for CovenantGuard

export type CovenantStatus = 'GREEN' | 'AMBER' | 'RED';

export interface CovenantResult {
  ratio: number;
  status: CovenantStatus;
  limit: number;
}

export interface CovenantLimits {
  maxDebtToEbitda: number;
  minInterestCoverage: number;
  minCurrentRatio: number;
}

export interface Loan {
  id: string;
  borrowerName: string;
  facilityAmount: number;
  outstandingAmount: number;
  maturityDate: string;
  covenantType: string;
  covenantLimit: number;
  lastTestDate: string;
  // Financial metrics
  totalDebt: number;
  ebitda: number;
  interestExpense?: number;
  tangibleNetWorth?: number;
  // Calculated values
  currentRatio: number;
  debtToEbitda: number;
  interestCoverage: number;
  status: CovenantStatus;
  covenantLimits: CovenantLimits;
  // Blockchain
  lastTxHash?: string;
  isSealed: boolean;
}

export interface UploadedDocument {
  id: string;
  loanId: string;
  fileName: string;
  uploadDate: string;
  fileUrl: string;
  extractedText?: string;
  ocrConfidence?: number;
  status: 'pending' | 'processing' | 'extracted' | 'confirmed' | 'sealed';
}

export interface ComplianceEvent {
  id: string;
  loanId: string;
  documentId: string;
  timestamp: string;
  totalDebt: number;
  ebitda: number;
  ratio: number;
  status: CovenantStatus;
  txHash?: string;
  blockNumber?: number;
}
