'use client';

import React, { useMemo, useState, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { StatisticsData } from '../types';

interface StatisticsCardProps {
  total: string;
  points: StatisticsData[];
}

/**
 * StatisticsCard
 * 
 * Interaction Logic:
 * - Uses `onMouseMove` on the chart container to calculate the cursor's relative X position.
 * - Maps the X position to the nearest data point index (`interactionIndex`).
 * - Updates the vertical highlight bar and tooltip based on this index.
 * - Resets to the last data point when the mouse leaves (`onMouseLeave`).
 * 
 * Animation:
 * - Tooltip and Highlight Bar use CSS transitions to snap smoothly between points.
 * - SVG path generation logic remains smooth (cubic bezier).
 */
const StatisticsCard: React.FC<StatisticsCardProps> = ({ total, points }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Default to the last item being highlighted
  const [highlightIndex, setHighlightIndex] = useState<number>(points.length - 1);
  const [isHovering, setIsHovering] = useState(false);

  // Calculate SVG path
  const pathData = useMemo(() => {
    if (points.length === 0) return { d: '', coords: [] };
    
    // Grid dimensions
    const width = 100; // viewBox units
    const height = 40;
    
    // Normalize data
    const maxVal = Math.max(...points.map(p => p.value)) * 1.2;
    const minVal = Math.min(...points.map(p => p.value)) * 0.8;
    const range = (maxVal - minVal) || 1;
    
    const coords = points.map((p, i) => ({
      x: (i / (Math.max(points.length - 1, 1))) * width,
      y: height - ((p.value - minVal) / range) * height
    }));

    if (coords.length === 0) return { d: '', coords: [] };

    let d = `M ${coords[0].x},${coords[0].y}`;
    
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) * 0.2;
      const cp1y = p1.y + (p2.y - p0.y) * 0.2;
      const cp2x = p2.x - (p3.x - p1.x) * 0.2;
      const cp2y = p2.y - (p3.y - p1.y) * 0.2;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return { d, coords };
  }, [points]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || points.length === 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Calculate index 0..N-1
    const rawIndex = (x / width) * (points.length - 1);
    const index = Math.round(rawIndex);
    
    // Clamp
    const safeIndex = Math.max(0, Math.min(index, points.length - 1));
    
    setHighlightIndex(safeIndex);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Optional: reset to last index or keep last interaction
    setHighlightIndex(points.length - 1); 
  };

  const highlightPoint = pathData.coords[highlightIndex];
  const activeValue = points[highlightIndex]?.value;

  return (
    <div className="bg-[#FF4C29] rounded-3xl p-8 shadow-sm flex flex-col h-[360px] text-white relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-orange-200/50 hover:shadow-lg">
       {/* Background Decoration */}
       <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B4A] to-[#FF4C29] z-0" />
       
       <div className="relative z-10 flex flex-col h-full pointer-events-none"> {/* Content wrapper */}
        {/* Header */}
        <div className="flex justify-between items-start mb-2 pointer-events-auto">
          <h3 className="font-medium text-lg text-white/90">Statistics</h3>
          <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Amount */}
        <div className="mb-8 pointer-events-auto">
          <div className="text-4xl font-bold tracking-tight transition-all duration-300">
             {total}
          </div>
          <div className="text-sm text-white/70 font-medium h-5">
            {isHovering ? `Value: ${activeValue}` : 'Weekly Overview'}
          </div>
        </div>
      </div>

      {/* Interactive Chart Area */}
      <div 
        ref={containerRef}
        className="absolute inset-x-8 bottom-8 top-32 z-20 cursor-crosshair touch-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
          {/* Vertical Grid Lines (Visual only) */}
          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
            {points.map((_, i) => (
              <div key={i} className="w-px h-full bg-white" />
            ))}
          </div>

          {/* Highlight Column */}
          {highlightPoint && points.length > 1 && (
            <div 
              className="absolute top-0 bottom-0 w-px bg-white/50 pointer-events-none transition-all duration-150 ease-out"
              style={{ 
                left: `${(highlightIndex / (points.length - 1)) * 100}%`,
              }}
            >
              <div className="absolute top-0 -translate-x-1/2 w-12 h-full bg-gradient-to-b from-white/10 to-transparent" />
            </div>
          )}

           {/* Tooltip */}
           {highlightPoint && (
             <div 
              className={`absolute bg-white text-gray-900 text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg transform -translate-x-1/2 -translate-y-full mb-3 pointer-events-none transition-all duration-150 ease-out z-30
                ${isHovering ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
              `}
              style={{ 
                left: points.length > 1 ? `${(highlightIndex / (points.length - 1)) * 100}%` : '50%',
                top: `${highlightPoint.y / 40 * 100}%`
              }}
            >
               {activeValue}
            </div>
           )}

          {/* SVG Graph */}
          <div className="absolute inset-0 pointer-events-none">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 40" 
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              {/* The Line */}
              <path 
                d={pathData.d} 
                fill="none" 
                stroke="white" 
                strokeWidth="0.8" 
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-md"
              />
              
              {/* The Highlight Dot */}
              {highlightPoint && (
                <circle 
                  cx={highlightPoint.x} 
                  cy={highlightPoint.y} 
                  r="2" 
                  fill="white"
                  className={`drop-shadow-md transition-all duration-150 ease-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="absolute bottom-0 inset-x-0 flex justify-between text-xs font-medium text-white/60 pointer-events-none translate-y-6">
             {points.map((p, i) => (
               <span key={i} className={`w-8 text-center transition-colors duration-200 ${i === highlightIndex && isHovering ? 'text-white scale-110' : ''}`}>
                 {p.label}
               </span>
             ))}
          </div>
        </div>
    </div>
  );
};

export default StatisticsCard;