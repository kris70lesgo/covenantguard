'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ExtractionReviewProps {
  data?: {
    totalDebt: number;
    ebitda: number;
    confidence: number;
  };
  covenantResult?: {
    ratio: number;
    status: 'GREEN' | 'AMBER' | 'RED';
    limit: number;
  };
}

const ExtractionReview: React.FC<ExtractionReviewProps> = ({ 
  data = { totalDebt: 14000000, ebitda: 3000000, confidence: 0.92 },
  covenantResult = { ratio: 4.67, status: 'RED', limit: 3.5 }
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'GREEN':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          label: '🟢 COMPLIANT',
        };
      case 'AMBER':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          label: '🟠 WARNING',
        };
      case 'RED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: '🔴 BREACH DETECTED',
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          label: 'UNKNOWN',
        };
    }
  };

  const statusConfig = getStatusConfig(covenantResult.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Confidence Banner */}
      <div className={`flex items-center justify-between px-4 py-3 ${statusConfig.bg} border ${statusConfig.border} rounded-lg`}>
        <div className="flex items-center space-x-3">
          <StatusIcon className={statusConfig.color} size={20} />
          <span className={`text-sm font-medium ${statusConfig.color}`}>
            AI extraction complete with {(data.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>

      {/* Extracted Data Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Extracted Values
        </p>
        
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-sm text-slate-600">Total Debt</span>
            <span className="text-sm font-medium text-slate-900">
              ${data.totalDebt.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-sm text-slate-600">EBITDA</span>
            <span className="text-sm font-medium text-slate-900">
              ${data.ebitda.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-sm text-slate-600">Debt/EBITDA Ratio</span>
            <span className={`text-sm font-semibold ${statusConfig.color}`}>
              {covenantResult.ratio != null ? `${covenantResult.ratio.toFixed(2)}x` : '—'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Status</span>
            <span className={`text-sm font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Blockchain Notice */}
      <div className="flex items-start space-x-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm text-blue-900">
          Once confirmed, this compliance event will be automatically sealed on the Polygon blockchain.
        </span>
      </div>
    </div>
  );
};

export default ExtractionReview;
