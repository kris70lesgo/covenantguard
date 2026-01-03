'use client';

import React, { useState, useRef, useEffect } from 'react';
import { mockLoans } from '@/lib/mock-data';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Loan {
  id: string;
  borrowerName: string;
  facilityAmount: number;
  covenantLimit: number;
}

interface LoanSelectorProps {
  onSelect: (loan: Loan) => void;
}

const LoanSelector: React.FC<LoanSelectorProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredLoans = mockLoans.filter(l => 
    l.borrowerName.toLowerCase().includes(search.toLowerCase()) || 
    l.id.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredLoans.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredLoans[selectedIndex]) {
        handleSelect(filteredLoans[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsOpen(false);
    onSelect(loan);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">
        Borrower Loan Selection
      </label>
      
      {/* Input Field (Closed State) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[44px] flex items-center justify-between px-4 bg-white border border-slate-200 rounded-lg text-left transition-all duration-150 outline-none ${
          isOpen ? 'border-blue-600 ring-[1.5px] ring-blue-600/10' : 'hover:border-slate-300'
        }`}
      >
        <span className={`text-sm truncate ${selectedLoan ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedLoan ? selectedLoan.borrowerName : 'Select borrower'}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Panel (Open State) */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
          {/* Internal Search */}
          <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <Search size={14} className="text-slate-400 mr-2.5 shrink-0" />
            <input
              autoFocus
              className="w-full text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
              placeholder="Search borrower or loan ID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Options List */}
          <div className="max-h-[280px] overflow-y-auto py-1 custom-scrollbar">
            {filteredLoans.length > 0 ? (
              filteredLoans.map((loan, index) => {
                const isSelected = selectedLoan?.id === loan.id;
                const isFocused = index === selectedIndex;
                
                return (
                  <div
                    key={loan.id}
                    onClick={() => handleSelect(loan)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`px-4 py-2.5 cursor-pointer transition-colors flex items-center justify-between group ${
                      isFocused ? 'bg-slate-50' : isSelected ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                        {loan.borrowerName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider font-medium">
                        Loan ID &middot; {loan.id}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-sm text-slate-400 text-center">
                No borrowers found matching search criteria
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default LoanSelector;
