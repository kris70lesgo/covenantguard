'use client';

import React from 'react';
import { MoreVertical, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

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
    <div className="bg-white rounded-3xl p-8 shadow-soft flex flex-col h-[360px] hover:-translate-y-1 hover:shadow-lg transition-all duration-500 cursor-default">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="font-semibold text-gray-900 text-lg tracking-tight">Audit Log</h3>
           <p className="text-gray-400 text-sm font-medium mt-1">Immutable Ledger</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <MoreVertical size={20} className="text-gray-500" />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 overflow-hidden">
        {events.map((evt) => (
            <div key={evt.id} className="bg-card-light rounded-2xl p-4 flex justify-between items-center group hover:bg-gray-200 transition-colors duration-200">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm">
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