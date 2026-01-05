import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

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
    <div className="bg-[#8af4a7] rounded-3xl p-6 shadow-sm h-[320px] relative flex flex-col justify-between overflow-hidden border border-[#6cd48c]/60">
      
      {/* Header */}
      <div className="flex justify-between items-start z-10">
      <h3 className="text-sm font-medium text-gray-900 tracking-tight max-w-[160px] leading-tight">Aggregate Headroom</h3>
      <div className="flex gap-2" />
      </div>

      {/* Gauge */}
      <div className="absolute inset-0 flex items-center justify-center top-6 pointer-events-none">
        <svg width="300" height="320" viewBox="0 0 300 320" className="overflow-visible">
          <defs>
             <pattern id="hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
               <line x1="0" y1="0" x2="0" y2="6" style={{stroke:'#c4f0cf', strokeWidth:1, opacity: 0.35}} />
             </pattern>
             <mask id="arcMask">
               <path d={describeArc(cx, cy, r, splitAngle, endAngle)} stroke="white" strokeWidth="40" fill="none" strokeLinecap="round" />
             </mask>
          </defs>
          <g>
             <path d={describeArc(cx, cy, r, splitAngle, endAngle)} stroke="url(#hatch)" strokeWidth="26" fill="none" strokeLinecap="round" className="opacity-70" />
             <path d={describeArc(cx, cy, r, splitAngle, endAngle)} stroke="#1f1f1f" strokeWidth="1" fill="none" strokeLinecap="round" className="opacity-25" />
          </g>
           <path d={describeArc(cx, cy, r, startAngle, splitAngle)} stroke="#0f0f0f" strokeWidth="28" fill="none" strokeLinecap="round" className="drop-shadow-sm" />
           <circle cx={ix} cy={iy} r="7" fill="#a38bff" stroke="white" strokeWidth="2" className="shadow-sm transition-all duration-75" />
          
          <text x={cx} y={cy - 20} textAnchor="middle" fontSize="30" fontWeight="700" fill="#1C1C1E" className="font-sans">
             ${displayValue}M
          </text>
        </svg>
      </div>

      {/* Footer */}
      <div className="z-10 mt-auto flex justify-between items-end">
         <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-semibold text-gray-900">Safe</span>
            </div>
            <p className="text-gray-700 text-xs font-medium">Weighted Avg</p>
         </div>
           <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 text-gray-900">
             <ShieldCheck size={20} strokeWidth={1.3} />
         </div>
      </div>
    </div>
  );
};

export default CurrentBalanceCard;
