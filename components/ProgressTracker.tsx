import React from 'react';
import { Loader2, Calculator, Lock } from 'lucide-react';

interface ProgressTrackerProps {
  currentStep: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep }) => {
  const steps = [
    { icon: Loader2, label: 'Extracting Data', step: 1 },
    { icon: Calculator, label: 'Calculating Covenant', step: 2 },
    { icon: Lock, label: 'Sealing on Blockchain', step: 3 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-xl px-10 py-5 shadow-sm border border-gray-100 flex items-center justify-between relative">
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.step;
          const isCompleted = currentStep > step.step;
          const isInactive = currentStep < step.step;

          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center gap-2 relative z-10 w-40">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive ? 'bg-white border border-primary text-primary shadow-sm shadow-indigo-50' : ''}
                  ${isCompleted ? 'bg-primary border border-primary text-white' : ''}
                  ${isInactive ? 'bg-white border border-gray-200 text-gray-300' : ''}
                `}>
                  {isActive && Icon === Loader2 ? (
                    <Icon size={16} className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Icon size={16} strokeWidth={1.5} />
                  )}
                </div>
                <span className={`
                  text-[11px] font-medium tracking-wide text-center
                  ${isActive || isCompleted ? 'text-gray-900 font-semibold' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
              </div>

              {/* Divider */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-[1px] mx-4 relative top-[-12px] transition-all duration-300
                  ${isCompleted ? 'bg-primary' : 'bg-gray-100'}
                `} />
              )}
            </React.Fragment>
          );
        })}

      </div>
    </div>
  );
};
