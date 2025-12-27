'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loan } from '@/lib/types';
import { mockLoans } from '@/lib/mock-data';

interface PortfolioStats {
  totalLoans: number;
  totalExposure: number;
  greenCount: number;
  amberCount: number;
  redCount: number;
  complianceRate: number;
  atRiskExposure: number;
}

interface UsePortfolioResult {
  loans: Loan[];
  stats: PortfolioStats;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  source: 'database' | 'mock' | 'loading';
}

function calculateStats(loans: Loan[]): PortfolioStats {
  const greenCount = loans.filter((l) => l.status === 'GREEN').length;
  const amberCount = loans.filter((l) => l.status === 'AMBER').length;
  const redCount = loans.filter((l) => l.status === 'RED').length;
  const totalExposure = loans.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const atRiskExposure = loans
    .filter((l) => l.status !== 'GREEN')
    .reduce((sum, l) => sum + l.outstandingAmount, 0);

  return {
    totalLoans: loans.length,
    totalExposure,
    greenCount,
    amberCount,
    redCount,
    complianceRate: loans.length > 0 ? (greenCount / loans.length) * 100 : 100,
    atRiskExposure,
  };
}

export function usePortfolio(): UsePortfolioResult {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'mock' | 'loading'>('loading');

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/loans');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch loans');
      }

      // If database has loans, use them; otherwise fall back to mock data
      if (data.loans && data.loans.length > 0) {
        setLoans(data.loans);
        setSource('database');
      } else {
        // Use mock data for demo purposes
        setLoans(mockLoans);
        setSource('mock');
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fall back to mock data on error
      setLoans(mockLoans);
      setSource('mock');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const stats = calculateStats(loans);

  return {
    loans,
    stats,
    loading,
    error,
    refresh: fetchLoans,
    source,
  };
}

// Hook for individual loan details
export function useLoan(id: string) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoan() {
      try {
        setLoading(true);
        
        // First try to fetch from API
        const response = await fetch('/api/loans');
        const data = await response.json();
        
        if (data.loans && data.loans.length > 0) {
          const found = data.loans.find((l: Loan) => l.id === id);
          if (found) {
            setLoan(found);
            return;
          }
        }
        
        // Fall back to mock data
        const mockLoan = mockLoans.find((l) => l.id === id);
        if (mockLoan) {
          setLoan(mockLoan);
        } else {
          setError('Loan not found');
        }
      } catch (err) {
        console.error('Error fetching loan:', err);
        // Fall back to mock data
        const mockLoan = mockLoans.find((l) => l.id === id);
        if (mockLoan) {
          setLoan(mockLoan);
        } else {
          setError('Loan not found');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLoan();
  }, [id]);

  return { loan, loading, error };
}
