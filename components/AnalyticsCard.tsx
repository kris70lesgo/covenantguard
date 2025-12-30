'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AnalyticsData } from '../types';

interface AnalyticsCardProps {
  data: AnalyticsData[];
}

/**
 * AnalyticsCard
 * 
 * Interaction Logic:
 * - Manages `activeIndex` state to track the currently selected data point.
 * - Derived `currentTotal` based on the active index.
 * - Clicking a bar updates the index and the main displayed total.
 * - Supports Keyboard navigation (Tab to focus, Enter/Space to select).
 * 
 * Animation:
 * - Bars animate height and color using CSS transitions (`transition-all`).
 * - The card lifts slightly on hover (`hover:-translate-y-1`).

 */
const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Derive the total from the currently selected bar
  const currentTotal = useMemo(() => {
    const value = data[activeIndex]?.amount || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }, [activeIndex, data]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-between h-[360px] relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-start mb-2 z-20 relative">
        <h3 className="text-gray-900 font-medium text-lg">Analytics</h3>
        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer active:scale-95">
          <ArrowUpRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Amount - transitions when value changes */}
      <div className="z-20 relative">
        <div className="text-4xl font-bold text-gray-900 tracking-tight transition-all duration-300">
          {currentTotal}
        </div>
        <p className="text-sm text-gray-400 mt-1 font-medium transition-opacity duration-300">
          Revenue for {data[activeIndex]?.label}
        </p>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex items-end justify-between gap-4 relative mt-4">
        {/* Background Stripes Pattern Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 5px, #f3f4f6 5px, #f3f4f6 10px)'
          }}
        />

        {data.map((item, index) => {
          const isActive = index === activeIndex;
          
          return (
            <div key={index} className="flex flex-col items-center w-full z-10 h-full justify-end">
              {/* Bar Container */}
              <div 
                className="relative w-full flex items-end h-full cursor-pointer group"
                onClick={() => setActiveIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`Select ${item.label} with revenue ${item.amount}`}
                aria-pressed={isActive}
              > 
                 {/* The Bar */}
                <div 
                  className={`w-full rounded-2xl transition-all duration-500 ease-out relative
                    ${isActive 
                      ? 'bg-[#00C255] shadow-[0_10px_20px_-5px_rgba(0,194,85,0.4)]' 
                      : 'bg-[#E7F2E9] hover:bg-[#d1e6d5]'
                    }`}
                  style={{ height: `${item.percentage}%` }}
                >
                  {/* Top Indicator Line (Only visible on active) */}
                  <div 
                    className={`absolute top-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full transition-all duration-500
                    ${isActive ? 'bg-white/30 opacity-100' : 'bg-transparent opacity-0'}`} 
                  />
                  
                  {/* Percentage Label inside bar */}
                  <span className={`absolute top-6 left-1/2 -translate-x-1/2 font-medium text-sm transition-colors duration-300
                     ${isActive ? 'text-white' : 'text-gray-500 opacity-0 group-hover:opacity-100'}`}>
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              </div>
              
              {/* X-Axis Label */}
              <span className={`mt-3 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsCard;