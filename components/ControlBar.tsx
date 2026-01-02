import React, { useState, useRef } from 'react';
import { Filter, Download, Upload, SlidersHorizontal, Search, ListFilter } from 'lucide-react';
import { LoanStatus, FilterState } from '../types';
import { FilterPopover } from './FilterPopover';

interface ControlBarProps {
  currentFilter: LoanStatus | 'All';
  onFilterChange: (status: LoanStatus | 'All') => void;
  onSearch: (term: string) => void;
  advancedFilters: FilterState;
  onApplyAdvancedFilters: (filters: FilterState) => void;
  onClearAdvancedFilters: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  currentFilter, 
  onFilterChange, 
  onSearch,
  advancedFilters,
  onApplyAdvancedFilters,
  onClearAdvancedFilters
}) => {
  const tabs = ['All', ...Object.values(LoanStatus)];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = [
    advancedFilters.status.length > 0,
    advancedFilters.covenantTypes.length > 0,
    !!advancedFilters.ratioMin || !!advancedFilters.ratioMax,
    !!advancedFilters.amountMin || !!advancedFilters.amountMax,
    !!advancedFilters.dateFrom || !!advancedFilters.dateTo
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative">
      
      {/* Left: Filter Pills */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onFilterChange(tab as LoanStatus | 'All')}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ease-in-out
              ${currentFilter === tab 
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto z-40">
        
        {/* Search */}
        <div className="relative group flex-grow sm:flex-grow-0">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search borrowers..." 
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 transition-all placeholder-gray-400 text-gray-700"
          />
        </div>

        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        {/* Filter Button & Popover */}
        <div className="relative" ref={filterButtonRef}>
          <button 
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-medium transition-all shadow-sm ${
              isPopoverOpen || activeFilterCount > 0
                ? 'bg-gray-50 border-gray-300 text-gray-900 ring-1 ring-gray-200'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 flex items-center justify-center bg-gray-900 text-white text-[10px] h-4 w-4 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          <FilterPopover 
            isOpen={isPopoverOpen}
            anchorRef={filterButtonRef}
            onClose={() => setIsPopoverOpen(false)}
            currentFilters={advancedFilters}
            onApply={onApplyAdvancedFilters}
            onClear={onClearAdvancedFilters}
          />
        </div>

        <div className="flex items-center gap-2">
           <button className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded hover:bg-gray-100">
              <Upload className="w-4 h-4" />
           </button>
           <button className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded hover:bg-gray-100">
              <Download className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};