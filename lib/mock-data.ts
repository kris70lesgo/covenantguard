// Mock data for Stage 1 - Static Frontend
import { Loan, UploadedDocument, ComplianceEvent, CovenantStatus } from './types';

export const mockLoans: Loan[] = [
  {
    id: 'loan-001',
    borrowerName: 'Acme Manufacturing Corp',
    facilityAmount: 50000000,
    outstandingAmount: 42000000,
    maturityDate: '2027-06-15',
    covenantType: 'Debt/EBITDA',
    covenantLimit: 4.0,
    lastTestDate: '2025-12-15',
    totalDebt: 35000000,
    ebitda: 12000000,
    interestExpense: 2100000,
    tangibleNetWorth: 28000000,
    currentRatio: 1.8,
    debtToEbitda: 2.92,
    interestCoverage: 5.71,
    status: 'GREEN' as CovenantStatus,
    covenantLimits: {
      maxDebtToEbitda: 4.0,
      minInterestCoverage: 2.0,
      minCurrentRatio: 1.2,
    },
    lastTxHash: '0x8f4e3b2a1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2',
    isSealed: true,
  },
  {
    id: 'loan-002',
    borrowerName: 'TechFlow Industries Ltd',
    facilityAmount: 25000000,
    outstandingAmount: 22500000,
    maturityDate: '2026-09-30',
    covenantType: 'Debt/EBITDA',
    covenantLimit: 3.5,
    lastTestDate: '2025-12-10',
    totalDebt: 18000000,
    ebitda: 5500000,
    interestExpense: 1350000,
    tangibleNetWorth: 12000000,
    currentRatio: 1.4,
    debtToEbitda: 3.27,
    interestCoverage: 4.07,
    status: 'AMBER' as CovenantStatus,
    covenantLimits: {
      maxDebtToEbitda: 3.5,
      minInterestCoverage: 2.0,
      minCurrentRatio: 1.2,
    },
    lastTxHash: '0x2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    isSealed: true,
  },
  {
    id: 'loan-003',
    borrowerName: 'GlobalRetail Holdings Inc',
    facilityAmount: 75000000,
    outstandingAmount: 68000000,
    maturityDate: '2026-03-31',
    covenantType: 'Debt/EBITDA',
    covenantLimit: 3.5,
    lastTestDate: '2025-12-20',
    totalDebt: 52000000,
    ebitda: 11000000,
    interestExpense: 4200000,
    tangibleNetWorth: 15000000,
    currentRatio: 1.1,
    debtToEbitda: 4.73,
    interestCoverage: 2.62,
    status: 'RED' as CovenantStatus,
    covenantLimits: {
      maxDebtToEbitda: 3.5,
      minInterestCoverage: 2.0,
      minCurrentRatio: 1.2,
    },
    lastTxHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    isSealed: true,
  },
];

export const mockDocuments: UploadedDocument[] = [
  {
    id: 'doc-001',
    loanId: 'loan-001',
    fileName: 'Acme_Q4_2025_Financials.pdf',
    uploadDate: '2025-12-15T10:30:00Z',
    fileUrl: '/documents/acme-q4.pdf',
    extractedText: 'EBITDA: $12,000,000 | Total Debt: $35,000,000',
    ocrConfidence: 0.94,
    status: 'sealed',
  },
  {
    id: 'doc-002',
    loanId: 'loan-002',
    fileName: 'TechFlow_Q4_2025_Report.pdf',
    uploadDate: '2025-12-10T14:22:00Z',
    fileUrl: '/documents/techflow-q4.pdf',
    extractedText: 'EBITDA: $5,500,000 | Total Debt: $18,000,000',
    ocrConfidence: 0.89,
    status: 'sealed',
  },
  {
    id: 'doc-003',
    loanId: 'loan-003',
    fileName: 'GlobalRetail_Q4_2025_Audit.pdf',
    uploadDate: '2025-12-20T09:15:00Z',
    fileUrl: '/documents/globalretail-q4.pdf',
    extractedText: 'EBITDA: $11,000,000 | Total Debt: $52,000,000',
    ocrConfidence: 0.91,
    status: 'sealed',
  },
];

export const mockComplianceEvents: ComplianceEvent[] = [
  {
    id: 'event-001',
    loanId: 'loan-001',
    documentId: 'doc-001',
    timestamp: '2025-12-15T10:35:00Z',
    totalDebt: 35000000,
    ebitda: 12000000,
    ratio: 2.92,
    status: 'GREEN',
    txHash: '0x8f4e3b2a1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2',
    blockNumber: 15234567,
  },
  {
    id: 'event-002',
    loanId: 'loan-002',
    documentId: 'doc-002',
    timestamp: '2025-12-10T14:28:00Z',
    totalDebt: 18000000,
    ebitda: 5500000,
    ratio: 3.27,
    status: 'AMBER',
    txHash: '0x2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 15234123,
  },
  {
    id: 'event-003',
    loanId: 'loan-003',
    documentId: 'doc-003',
    timestamp: '2025-12-20T09:22:00Z',
    totalDebt: 52000000,
    ebitda: 11000000,
    ratio: 4.73,
    status: 'RED',
    txHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    blockNumber: 15235890,
  },
];

// Portfolio summary stats
export const getPortfolioStats = () => {
  const totalLoans = mockLoans.length;
  const greenCount = mockLoans.filter(l => l.status === 'GREEN').length;
  const amberCount = mockLoans.filter(l => l.status === 'AMBER').length;
  const redCount = mockLoans.filter(l => l.status === 'RED').length;
  const totalExposure = mockLoans.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const atRiskExposure = mockLoans
    .filter(l => l.status === 'RED' || l.status === 'AMBER')
    .reduce((sum, l) => sum + l.outstandingAmount, 0);

  return {
    totalLoans,
    greenCount,
    amberCount,
    redCount,
    totalExposure,
    atRiskExposure,
    complianceRate: (greenCount / totalLoans) * 100,
  };
};
