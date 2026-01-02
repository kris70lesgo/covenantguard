import React, { useState, useEffect } from 'react';
import { LoanStatus, FilterState } from '../types';

interface FilterPopoverProps {
  isOpen: boolean;
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
  onClear: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({ 
  isOpen, 
  currentFilters, 
  onApply, 
  onClose, 
  onClear,
  anchorRef 
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  // Sync internal state when popover opens or currentFilters change
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        anchorRef.current && 
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const handleStatusChange = (status: LoanStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 text-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-5">
          
          {/* Status Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
            <div className="space-y-1.5">
              {Object.values(LoanStatus).map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleStatusChange(status)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ratio Range */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ratio Range</h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                 <input
                  type="number"
                  placeholder="Min"
                  value={filters.ratioMin}
                  onChange={e => setFilters(prev => ({ ...prev, ratioMin: e.target.value }))}
                  className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                />
                <span className="absolute right-2 top-1.5 text-gray-400 text-xs select-none">x</span>
              </div>
              <span className="text-gray-300">-</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.ratioMax}
                  onChange={e => setFilters(prev => ({ ...prev, ratioMax: e.target.value }))}
                  className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                />
                <span className="absolute right-2 top-1.5 text-gray-400 text-xs select-none">x</span>
              </div>
            </div>
          </div>

          {/* Outstanding Amount */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Outstanding Amount</h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1.5 text-gray-400 text-xs select-none">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.amountMin}
                  onChange={e => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                  className="w-full pl-5 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors text-right"
                />
              </div>
              <span className="text-gray-300">-</span>
              <div className="relative flex-1">
                <span className="absolute left-2 top-1.5 text-gray-400 text-xs select-none">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.amountMax}
                  onChange={e => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                  className="w-full pl-5 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors text-right"
                />
              </div>
            </div>
          </div>

          {/* Last Test Date */}
           <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Test Date</h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="flex-1 py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-gray-900 text-xs focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
              />
              <span className="text-gray-300">-</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="flex-1 py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-gray-900 text-xs focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200">
        <button 
          onClick={() => {
            onClear();
            onClose();
          }}
          className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors px-2 py-1"
        >
          Clear all
        </button>
        <button 
          onClick={() => {
            onApply(filters);
            onClose();
          }}
          className="bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded shadow-sm hover:bg-gray-800 transition-all focus:ring-2 focus:ring-gray-200"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
};