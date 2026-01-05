'use client';

import React from 'react';
import { FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

const RecentTransactionsCard: React.FC = () => {
  const events = [
    { id: 1, type: 'audit', label: 'Covenant Check', detail: 'Pass: Debt Service Coverage', time: '2m ago' },
    { id: 2, type: 'alert', label: 'Hash Mismatch', detail: 'Polygon Block #89211', time: '14m ago' },
    { id: 3, type: 'doc', label: 'AI Extraction', detail: 'Q3 Financials.pdf', time: '1h ago' },
  ];

  const getIcon = (type: string) => {
    switch(type) {
        case 'audit': return <CheckCircle2 size={18} className="text-green-600" />;
        case 'alert': return <ShieldAlert size={18} className="text-orange-600" />;
        default: return <FileText size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="bg-[#f8faf7] rounded-3xl p-6 shadow-sm flex flex-col h-[320px] transition-all duration-300 cursor-default border border-gray-200/60">
      <div className="flex justify-between items-center mb-5">
        <div>
           <h3 className="font-medium text-sm text-gray-900 tracking-tight">Audit Log</h3>
           <p className="text-xs text-gray-500 font-medium mt-1">Immutable ledger</p>
        </div>
      </div>

      {/* List */}
        <div className="flex flex-col gap-2 overflow-hidden">
        {events.map((evt) => (
          <div key={evt.id} className="bg-white rounded-2xl p-4 flex justify-between items-center group border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                <div className="flex items-center gap-4">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        {getIcon(evt.type)}
                    </div>
                    <div>
                <span className="block font-semibold text-gray-800 text-sm">{evt.label}</span>
                <span className="text-xs text-gray-500 font-medium">{evt.detail}</span>
                    </div>
                </div>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{evt.time}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsCard;