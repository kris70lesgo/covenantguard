
import React from 'react';

interface ProcessingRailProps {
  activeStep: number; // 0, 1, 2
}

const ProcessingRail: React.FC<ProcessingRailProps> = ({ activeStep }) => {
  const steps = [
    "Extracting data",
    "Calculating covenants",
    "Recording audit trail"
  ];

  return (
    <div className="w-full flex items-center justify-between py-8">
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex items-center space-x-3">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              idx <= activeStep ? 'bg-blue-600' : 'bg-slate-200'
            } ${idx === activeStep ? 'animate-pulse scale-125' : ''}`} />
            <span className={`text-sm font-medium transition-colors duration-500 ${
              idx <= activeStep ? 'text-slate-900' : 'text-slate-400'
            }`}>
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="flex-1 h-[1px] mx-6 bg-slate-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProcessingRail;
