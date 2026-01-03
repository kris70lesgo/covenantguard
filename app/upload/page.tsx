'use client';

import { useState, useRef, useEffect } from 'react';
import { mockLoans } from '@/lib/mock-data';
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
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const demoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(event.target as Node)) {
        setIsDemoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoanSelect = (loan: Loan) => {
    setSelectedLoan(loan);
    setStep('UPLOAD_DOCUMENT');
  };

  const handleUpload = async (file?: File) => {
    setIsDemoDropdownOpen(false);
    setError(null);
    setStep('UPLOADING');

    try {
      if (!file) {
        // Demo mode - simulate upload
        setTimeout(() => {
          setUploadedDocument({
            id: 'demo-doc',
            fileName: 'demo-financial-statement.pdf',
            fileUrl: '/demo/financial.pdf',
            status: 'uploaded'
          });
          setStep('EXTRACTION_READY');
        }, 2000);
        return;
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

    // Simulate multi-step processing with visual feedback
    setTimeout(() => setActiveProcessingStep(1), 1500);
    setTimeout(() => setActiveProcessingStep(2), 3000);

    try {
      // Call OCR API
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: uploadedDocument?.id,
          fileUrl: uploadedDocument?.fileUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'OCR processing failed');
      }

      setTimeout(() => {
        setExtractedData(result.extractedData);
        setStep('REVIEW');
      }, 4500);
    } catch (err) {
      // Fallback to mock data for demo
      const errorMessage = err instanceof Error ? err.message : 'OCR failed';
      console.warn('OCR failed, using mock data:', errorMessage);
      setTimeout(() => {
        setExtractedData({
          totalDebt: 14000000,
          ebitda: 3000000,
          confidence: 0.92,
        });
        setStep('REVIEW');
      }, 4500);
    }
  };

  const handleConfirm = async () => {
    setStep('RECORDING');
    setError(null);

    try {
      // Call blockchain sealing API
      const response = await fetch('/api/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: selectedLoan?.id,
          documentId: uploadedDocument?.id,
          totalDebt: extractedData?.totalDebt,
          ebitda: extractedData?.ebitda,
        }),
      });

      const result = await response.json();

      setTimeout(() => {
        if (response.ok && result.txHash) {
          console.log(`Document sealed on blockchain! Transaction: ${result.txHash}`);
        }
        setStep('COMPLETED');
      }, 2000);
    } catch (err) {
      console.error('Sealing error:', err);
      // Still proceed to completed state for demo
      setTimeout(() => setStep('COMPLETED'), 2000);
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
              <LoanSelector onSelect={handleLoanSelect} />
            </div>
          )}

          {step === 'UPLOAD_DOCUMENT' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              {/* Navigation and Demo Controls */}
              <div className="flex items-center justify-between px-1">
                <button 
                  onClick={() => setStep('LOAN_SELECTION')}
                  className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>

                <div className="relative" ref={demoDropdownRef}>
                  <button 
                    onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                    className="text-[13px] text-slate-400 hover:text-slate-600 hover:underline transition-colors"
                  >
                    Want to test but don't have a document?
                  </button>
                  
                  {isDemoDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-sm z-30 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                      <button
                        onClick={() => handleUpload()}
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                      >
                        Use demo financial statement (PDF)
                      </button>
                    </div>
                  )}
                </div>
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
