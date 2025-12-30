import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

/**
 * CurrentBalanceCard -> Covenant Headroom Card
 */
const CurrentBalanceCard: React.FC = () => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = 42; // $42M headroom
  const progressPercent = 65; 
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Number((ease * targetValue).toFixed(1)));
      setAnimatedProgress(ease * progressPercent);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);
  
  const cx = 150;
  const cy = 160;
  const r = 100;
  const startAngle = 150;
  const endAngle = 390;
  const totalAngle = endAngle - startAngle;

  const d2r = (d: number) => (d * Math.PI) / 180;

  const describeArc = (x: number, y: number, radius: number, start: number, end: number) => {
    const startRad = d2r(start);
    const endRad = d2r(end);
    const x1 = x + radius * Math.cos(startRad);
    const y1 = y + radius * Math.sin(startRad);
    const x2 = x + radius * Math.cos(endRad);
    const y2 = y + radius * Math.sin(endRad);
    const largeArc = end - start <= 180 ? "0" : "1";
    return ["M", x1, y1, "A", radius, radius, 0, largeArc, 1, x2, y2].join(" ");
  };

  const splitAngle = startAngle + (animatedProgress / 100) * totalAngle;
  const indicatorRad = d2r(splitAngle);
  const ix = cx + (r - 18) * Math.cos(indicatorRad);
  const iy = cy + (r - 18) * Math.sin(indicatorRad);

  return (
    <div className="bg-card-mint rounded-3xl p-8 shadow-soft h-[360px] relative flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-transform duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight max-w-[150px] leading-tight">Aggregate Headroom</h3>
        <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-105 hover:bg-white transition-all duration-300 shadow-sm">
                <ArrowUpRight size={20} className="text-gray-900" />
            </button>
        </div>
      </div>

      {/* Gauge */}
      <div className="absolute inset-0 flex items-center justify-center top-8 pointer-events-none">
        <svg width="300" height="320" viewBox="0 0 300 320" className="overflow-visible">
          <defs>
             <pattern id="hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
               <line x1="0" y1="0" x2="0" y2="6" style={{stroke:'black', strokeWidth:1, opacity: 0.3}} />
             </pattern>
             <mask id="arcMask">
               <path d={describeArc(cx, cy, r, splitAngle, endAngle)} stroke="white" strokeWidth="40" fill="none" strokeLinecap="round" />
             </mask>
          </defs>
          <g>
             <path d={describeArc(cx, cy, r, splitAngle, endAngle)} stroke="url(#hatch)" strokeWidth="32" fill="none" strokeLinecap="round" className="opacity-60" />
             <path d={describeArc(cx, cy, r, splitAngle, endAngle)} stroke="black" strokeWidth="1" fill="none" strokeLinecap="round" className="opacity-20" />
          </g>
          <path d={describeArc(cx, cy, r, startAngle, splitAngle)} stroke="#1C1C1E" strokeWidth="32" fill="none" strokeLinecap="round" className="drop-shadow-lg" />
          <circle cx={ix} cy={iy} r="6" fill="#A78BFA" stroke="white" strokeWidth="2" className="shadow-md transition-all duration-75" />
          
          <text x={cx} y={cy - 20} textAnchor="middle" fontSize="32" fontWeight="700" fill="#1C1C1E" className="font-sans">
             ${displayValue}M
          </text>
        </svg>
      </div>

      {/* Footer */}
      <div className="z-10 mt-auto flex justify-between items-end">
         <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-gray-900">Safe</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Weighted Avg</p>
         </div>
         <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft hover:scale-110 transition-transform duration-300 text-gray-900">
             <ShieldCheck size={26} strokeWidth={1.5} />
         </div>
      </div>
    </div>
  );
};

export default CurrentBalanceCard;
