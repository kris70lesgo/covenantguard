'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from 'lucide-react';
import { ControlBar } from '@/components/ControlBar';
import { LoanTable } from '@/components/LoanTablerevamp';
import { generateData } from '@/services/mockData';
import { LoanFacility, LoanStatus, FilterState } from '@/types';

const initialFilterState: FilterState = {
  status: [],
  covenantTypes: [],
  ratioMin: '',
  ratioMax: '',
  amountMin: '',
  amountMax: '',
  dateFrom: '',
  dateTo: '',
};

export default function LoansPage() {
  const [data, setData] = useState<LoanFacility[]>([]);
  const [quickFilter, setQuickFilter] = useState<LoanStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>(initialFilterState);

  // Initial Data Load
  useEffect(() => {
    const initialData = generateData(40); // Generate 40 rows
    setData(initialData);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Quick Filter (Pills)
      const matchesQuickStatus = quickFilter === 'All' || item.status === quickFilter;
      
      // 2. Search
      const matchesSearch = item.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.loanId.toLowerCase().includes(searchTerm.toLowerCase());

      // 3. Advanced Filters
      
      // Status (Multi-select from popover)
      const matchesAdvStatus = advancedFilters.status.length === 0 || advancedFilters.status.includes(item.status);

      // Covenant Type
      const matchesCovenant = advancedFilters.covenantTypes.length === 0 || advancedFilters.covenantTypes.includes(item.covenantType);

      // Ratio Range
      const ratio = item.currentRatio;
      const minRatio = advancedFilters.ratioMin ? parseFloat(advancedFilters.ratioMin) : -Infinity;
      const maxRatio = advancedFilters.ratioMax ? parseFloat(advancedFilters.ratioMax) : Infinity;
      const matchesRatio = ratio >= minRatio && ratio <= maxRatio;

      // Outstanding Amount
      const amount = item.outstandingAmount;
      const minAmount = advancedFilters.amountMin ? parseFloat(advancedFilters.amountMin) : -Infinity;
      const maxAmount = advancedFilters.amountMax ? parseFloat(advancedFilters.amountMax) : Infinity;
      const matchesAmount = amount >= minAmount && amount <= maxAmount;

      // Date Range
      const date = new Date(item.lastTestDate).getTime();
      const fromDate = advancedFilters.dateFrom ? new Date(advancedFilters.dateFrom).getTime() : -Infinity;
      const toDate = advancedFilters.dateTo ? new Date(advancedFilters.dateTo).getTime() : Infinity;
      const matchesDate = date >= fromDate && date <= toDate;

      return matchesQuickStatus && matchesSearch && matchesAdvStatus && matchesCovenant && matchesRatio && matchesAmount && matchesDate;
    });
  }, [data, quickFilter, searchTerm, advancedFilters]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Main Content Area */}
      <main className="flex-grow p-6 sm:p-8 max-w-[1600px] mx-auto w-full flex flex-col h-screen">
        
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Loan Facilities</h1>
          <p className="text-sm text-gray-500 mt-1">Manage compliance, covenants, and testing schedules across your portfolio.</p>
        </div>

        <ControlBar 
          currentFilter={quickFilter} 
          onFilterChange={setQuickFilter} 
          onSearch={setSearchTerm}
          advancedFilters={advancedFilters}
          onApplyAdvancedFilters={setAdvancedFilters}
          onClearAdvancedFilters={() => setAdvancedFilters(initialFilterState)}
        />

        <div className="flex-grow overflow-hidden relative pb-1">
          <LoanTable data={filteredData} />
        </div>
      </main>
    </div>
  );
}
