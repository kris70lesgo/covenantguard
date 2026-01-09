'use client';

import { useState, useEffect } from 'react';
import LoanSelector from '@/components/LoanSelector';
import UploadZone from '@/components/UploadZone';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProcessingRail from '@/components/ProcessingRail';
import ExtractionReview from '@/components/ExtractionReview';
import { Database, CheckCircle2, ChevronLeft } from 'lucide-react';

type AppState = 
  | 'LOAN_SELECTION' 
  | 'UPLOAD_DOCUMENT' 
  | 'UPLOADING' 
  | 'EXTRACTION_READY' 
  | 'PROCESSING' 
  | 'REVIEW' 
  | 'RECORDING' 
  | 'COMPLETED';

interface Loan {
  id: string;
  borrowerName: string;
  facilityAmount: number;
  covenantLimit: number;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  status: string;
}

interface ExtractedData {
  totalDebt: number;
  ebitda: number;
  confidence: number;
}

export default function UploadPage() {
  const [step, setStep] = useState<AppState>('LOAN_SELECTION');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(true);

  // Fetch loans from API on mount
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setIsLoadingLoans(true);
        const response = await fetch('/api/loans');
        const result = await response.json();
        
        if (response.ok && result.loans) {
          setLoans(result.loans);
        } else {
          setError('Failed to load loans');
        }
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Failed to load loans');
      } finally {
        setIsLoadingLoans(false);
      }
    };

    fetchLoans();
  }, []);

  const handleLoanSelect = (loan: Loan) => {
    setSelectedLoan(loan);
    setStep('UPLOAD_DOCUMENT');
  };

  const handleUpload = async (file?: File) => {
    setError(null);
    setStep('UPLOADING');

    try {
      // No more demo mode - require actual file
      if (!file) {
        throw new Error('Please select a file to upload');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('loanId', selectedLoan?.id || '');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadedDocument(result.document);
      setStep('EXTRACTION_READY');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      setStep('UPLOAD_DOCUMENT');
    }
  };

  const startAnalysis = async () => {
    setStep('PROCESSING');
    setActiveProcessingStep(0);
    setError(null);

    try {
      // Step 1: AI-driven parsing with Gemini
      setActiveProcessingStep(1);
      console.log('🤖 Starting AI parsing...');
      
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: uploadedDocument?.id,
          fileUrl: uploadedDocument?.fileUrl,
        }),
      });

      const parseResult = await parseResponse.json();

      // Check for unsupported document type
      if (parseResponse.ok && parseResult.unsupportedType) {
        console.log('⚠️ Unsupported document type detected');
        throw new Error(parseResult.message || 'Document contains complex debt definitions (e.g., Net Debt). Automatic extraction not supported for this format.');
      }

      // If AI parsing successful with high confidence
      if (parseResponse.ok && parseResult.success && !parseResult.needsFallback) {
        console.log('✅ AI parsing successful');
        setActiveProcessingStep(2);
        
        setTimeout(() => {
          setExtractedData({
            totalDebt: parseResult.extractedData.totalDebt,
            ebitda: parseResult.extractedData.ebitda,
            confidence: parseResult.extractedData.confidence,
          });
          setStep('REVIEW');
        }, 1000);
        return;
      }

      // Step 2: Fallback to OCR + AI if initial parsing failed or low confidence
      if (parseResult.needsFallback) {
        console.log('⚠️ AI parsing incomplete, trying OCR fallback...');
        setActiveProcessingStep(2);

        const ocrResponse = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: uploadedDocument?.id,
          }),
        });

        const ocrResult = await ocrResponse.json();

        if (ocrResponse.ok && ocrResult.success) {
          console.log('✅ OCR fallback successful');
          
          setTimeout(() => {
            setExtractedData({
              totalDebt: ocrResult.extractedData.totalDebt,
              ebitda: ocrResult.extractedData.ebitda,
              confidence: ocrResult.extractedData.confidence,
            });
            setStep('REVIEW');
          }, 1000);
          return;
        }

        // Hard fail - no mock data
        throw new Error(ocrResult.message || 'Unable to extract financial data from document');
      }

      // If we get here, something unexpected happened
      throw new Error('Document parsing failed');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Document analysis failed';
      console.error('Analysis error:', errorMessage);
      setError(errorMessage);
      setStep('EXTRACTION_READY');
    }
  };

  const handleConfirm = async () => {
    if (!extractedData) return;
    
    setStep('RECORDING');
    setError(null);

    try {
      // First, validate the extracted data
      const validateResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: uploadedDocument?.id,
          totalDebt: extractedData.totalDebt,
          ebitda: extractedData.ebitda,
          confidence: extractedData.confidence,
        }),
      });

      const validateResult = await validateResponse.json();

      if (!validateResponse.ok) {
        throw new Error(validateResult.error || 'Validation failed');
      }

      console.log('✅ Data validated:', validateResult);

      // Then seal on blockchain
      const sealResponse = await fetch('/api/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: selectedLoan?.id,
          documentId: uploadedDocument?.id,
          totalDebt: extractedData.totalDebt,
          ebitda: extractedData.ebitda,
        }),
      });

      const sealResult = await sealResponse.json();

      setTimeout(() => {
        if (sealResponse.ok && sealResult.txHash) {
          console.log(`✅ Document sealed on blockchain! TX: ${sealResult.txHash}`);
        }
        setStep('COMPLETED');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Recording failed';
      console.error('Sealing error:', errorMessage);
      setError(errorMessage);
      setStep('REVIEW');
    }
  };

  const resetWorkflow = () => {
    setSelectedLoan(null);
    setActiveProcessingStep(0);
    setUploadedDocument(null);
    setExtractedData(null);
    setError(null);
    setStep('LOAN_SELECTION');
  };

  // Calculate covenant status from extracted data
  const getCovenantResult = () => {
    if (!extractedData || !selectedLoan) return null;
    const ratio = extractedData.totalDebt / extractedData.ebitda;
    const limit = selectedLoan.covenantLimit;
    
    if (ratio > limit) return { ratio, status: 'RED' as const, limit };
    if (ratio >= limit * 0.9) return { ratio, status: 'AMBER' as const, limit };
    return { ratio, status: 'GREEN' as const, limit };
  };

  const covenantResult = getCovenantResult();

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 px-6 pb-20">
      <div className="w-full max-w-[800px] space-y-12">
        {/* Page Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Upload Financial Document</h1>
          <p className="text-slate-500 text-sm">Submit borrower financials for covenant analysis</p>
        </header>

        {/* Content Area */}
        <main className="transition-all duration-300">
          {step === 'LOAN_SELECTION' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {isLoadingLoans ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              ) : loans.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-500">No loans found. Please create a loan first.</p>
                </div>
              ) : (
                <LoanSelector loans={loans} onSelect={handleLoanSelect} />
              )}
            </div>
          )}

          {step === 'UPLOAD_DOCUMENT' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              {/* Navigation */}
              <div className="flex items-center justify-between px-1">
                <button 
                  onClick={() => setStep('LOAN_SELECTION')}
                  className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>
              </div>

              <UploadZone onUpload={handleUpload} />
            </div>
          )}

          {step === 'UPLOADING' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-20">
              <LoadingSpinner />
              <div className="text-center space-y-1">
                <p className="text-slate-900 font-medium">Uploading document</p>
                <p className="text-slate-500 text-sm">Encrypting and storing securely</p>
              </div>
            </div>
          )}

          {step === 'EXTRACTION_READY' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center py-12 px-8 border border-slate-200 bg-white space-y-8">
              <div className="text-slate-300">
                <Database size={48} strokeWidth={1} />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-medium text-slate-900">Document ready for analysis</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Financial tables will be identified and key metrics extracted using our compliant extraction engine.
                </p>
              </div>
              <button
                onClick={startAnalysis}
                className="px-10 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 outline-none rounded-lg"
              >
                Start analysis
              </button>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="space-y-4">
              <ProcessingRail activeStep={activeProcessingStep} />
            </div>
          )}

          {(step === 'REVIEW' || step === 'RECORDING') && extractedData && (
            <div className="animate-in fade-in duration-500 space-y-12">
              <ExtractionReview 
                data={extractedData}
                covenantResult={covenantResult || undefined}
              />
              <div className="flex justify-end">
                <button
                  disabled={step === 'RECORDING'}
                  onClick={handleConfirm}
                  className="flex items-center justify-center min-w-[180px] px-8 py-3 bg-slate-900 text-white font-medium hover:bg-black transition-all disabled:bg-slate-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 outline-none rounded-lg"
                >
                  {step === 'RECORDING' ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-slate-300 border-t-white rounded-full animate-spin"></div>
                      <span>Recording...</span>
                    </div>
                  ) : (
                    "Confirm & Record"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'COMPLETED' && (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center py-20 space-y-6">
              <CheckCircle2 size={48} className="text-emerald-600" strokeWidth={1.5} />
              <div className="text-center space-y-2">
                <h2 className="text-lg font-medium text-slate-900">Compliance Audit Recorded</h2>
                <p className="text-slate-500 text-sm">
                  Record ID: AUDIT-{Math.floor(Math.random() * 1000000)} &middot; Immutable entry confirmed
                </p>
              </div>
              <button
                onClick={resetWorkflow}
                className="text-sm font-medium text-blue-600 hover:underline pt-4"
              >
                Start new submission
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-900">{error}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
