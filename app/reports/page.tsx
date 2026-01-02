'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  MoreHorizontal,
  Layers,
  PieChart,
  Activity
} from 'lucide-react';

// --- Types ---

type ComplianceStatus = 'Compliant' | 'Warning' | 'Breach';
type ExportFormat = 'PDF' | 'CSV' | 'Excel';

interface ComplianceEvent {
  id: string;
  loanId: string;
  entityName: string;
  covenantType: string;
  eventDate: string;
  exposure: number;
  status: ComplianceStatus;
}

// --- Mock Data ---

const MOCK_EVENTS: ComplianceEvent[] = [
  { id: 'EVT-2024-001', loanId: 'LN-8392', entityName: 'Alpha Logistics Corp', covenantType: 'Debt Service Coverage', eventDate: '2024-05-14', exposure: 2450000, status: 'Compliant' },
  { id: 'EVT-2024-002', loanId: 'LN-9921', entityName: 'Summit Manufacturing', covenantType: 'Leverage Ratio', eventDate: '2024-05-13', exposure: 1200000, status: 'Warning' },
  { id: 'EVT-2024-003', loanId: 'LN-1023', entityName: 'Greenfield Energy', covenantType: 'Reporting Deadline', eventDate: '2024-05-12', exposure: 5600000, status: 'Compliant' },
  { id: 'EVT-2024-004', loanId: 'LN-4451', entityName: 'Apex Retail Group', covenantType: 'Liquidity Min', eventDate: '2024-05-10', exposure: 890000, status: 'Breach' },
  { id: 'EVT-2024-005', loanId: 'LN-3329', entityName: 'Maritime Ventures', covenantType: 'Interest Coverage', eventDate: '2024-05-09', exposure: 3100000, status: 'Compliant' },
  { id: 'EVT-2024-006', loanId: 'LN-7721', entityName: 'TechFlow Systems', covenantType: 'Change of Control', eventDate: '2024-05-08', exposure: 1800000, status: 'Compliant' },
  { id: 'EVT-2024-007', loanId: 'LN-8832', entityName: 'Global Freight', covenantType: 'Leverage Ratio', eventDate: '2024-05-08', exposure: 4200000, status: 'Warning' },
  { id: 'EVT-2024-008', loanId: 'LN-1192', entityName: 'North Star Properties', covenantType: 'LTV Ratio', eventDate: '2024-05-05', exposure: 6700000, status: 'Compliant' },
  { id: 'EVT-2024-009', loanId: 'LN-2291', entityName: 'Omega Healthcare', covenantType: 'EBITDA Min', eventDate: '2024-05-02', exposure: 950000, status: 'Breach' },
  { id: 'EVT-2024-010', loanId: 'LN-5520', entityName: 'Vanguard Construction', covenantType: 'Debt Service Coverage', eventDate: '2024-05-01', exposure: 2100000, status: 'Compliant' },
];

const INITIAL_VISIBLE_COUNT = 5;

// --- Helpers ---

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(dateStr));
};

const getStatusStyles = (status: ComplianceStatus) => {
  switch (status) {
    case 'Compliant':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Warning':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Breach':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: ComplianceStatus) => {
  switch (status) {
    case 'Compliant': return <CheckCircle2 className="w-3 h-3 mr-1.5" />;
    case 'Warning': return <AlertCircle className="w-3 h-3 mr-1.5" />;
    case 'Breach': return <XCircle className="w-3 h-3 mr-1.5" />;
  }
};

// --- Components ---

interface StatProps {
  label: string;
  endValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  statusColor?: 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
}

const StatItem = ({ 
  label, 
  endValue, 
  prefix = '', 
  suffix = '', 
  decimals = 0, 
  duration = 400,
  statusColor,
  icon
}: StatProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease-out cubic: 1 - (1 - x)^3 for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setCount(easeProgress * endValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  const getDotColor = () => {
    switch(statusColor) {
      case 'green': return 'bg-emerald-500';
      case 'yellow': return 'bg-amber-400';
      case 'red': return 'bg-rose-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="flex flex-col px-6 py-3 lg:py-0 flex-1 lg:border-r border-gray-100 last:border-none">
      <dd className="text-2xl font-semibold text-gray-900 tracking-tight tabular-nums flex items-baseline">
        {prefix && <span className="text-base text-gray-400 mr-0.5 font-medium">{prefix}</span>}
        {count.toFixed(decimals)}
        {suffix && <span className="text-base text-gray-400 ml-0.5 font-medium">{suffix}</span>}
      </dd>
      <dt className="mt-1.5 flex items-center gap-1.5">
        {statusColor ? (
          <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
        ) : icon ? (
          <div className="text-gray-400">{React.cloneElement(icon as React.ReactElement<any>, { size: 12 })}</div>
        ) : null}
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      </dt>
    </div>
  );
};

export default function ReportsPage() {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('CSV');
  const [isExporting, setIsExporting] = useState(false);
  const [isEventsExpanded, setIsEventsExpanded] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Simulate API call
    setTimeout(() => {
      setIsExporting(false);
      alert(`Exported portfolio data as ${exportFormat}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-gray-200">
      
      {/* 1. Page Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 border-b border-transparent">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Export</h1>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          Generate compliance audit logs and export raw portfolio performance data.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20 space-y-8">

        {/* 2. Primary Export Section */}
        <section 
          aria-labelledby="export-section-title"
          className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm transition-shadow hover:shadow-md hover:border-gray-300"
        >
          <div className="mb-4 sm:mb-0">
            <h2 id="export-section-title" className="text-base font-medium text-gray-900">Export Portfolio Data</h2>
            <p className="text-xs text-gray-500 mt-0.5">Download the complete dataset for current reporting period.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select 
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
              >
                <option value="PDF">PDF Report</option>
                <option value="CSV">CSV Data</option>
                <option value="Excel">Excel Workbook</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isExporting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? 'Processing...' : 'Download'}
            </button>
          </div>
        </section>

        {/* 3. Portfolio Summary */}
        <section aria-label="Portfolio Statistics">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-gray-100 py-3">
            <StatItem 
              label="Total Loans" 
              endValue={142} 
              icon={<Layers />}
            />
            <StatItem 
              label="Total Exposure" 
              endValue={1.24} 
              prefix="$"
              suffix="B"
              decimals={2}
              duration={700}
              icon={<PieChart />}
            />
            <StatItem 
              label="Compliant" 
              endValue={128}
              statusColor="green"
            />
            <StatItem 
              label="Warning" 
              endValue={11} 
              statusColor="yellow"
            />
            <StatItem 
              label="Breach" 
              endValue={3} 
              statusColor="red"
            />
             <StatItem 
              label="Compliance Rate" 
              endValue={90.1}
              suffix="%"
              decimals={1}
              icon={<Activity />}
            />
          </div>
        </section>

        {/* 4. Recent Compliance Events */}
        <section aria-labelledby="events-table-title" className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 id="events-table-title" className="text-base font-medium text-gray-900">Recent Compliance Events</h2>
             <button className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                View All History
             </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div 
              className="overflow-y-hidden overflow-x-auto transition-all duration-300 ease-out"
              style={{ maxHeight: isEventsExpanded ? '1000px' : '285px' }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-32">Event ID</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Entity & Loan</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Covenant Type</th>
                    <th scope="col" className="px-5 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Exposure</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-32">Date</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-32">Status</th>
                    <th scope="col" className="relative px-5 py-2.5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {MOCK_EVENTS.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900">
                        {event.id}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">{event.entityName}</span>
                          <span className="text-[10px] text-gray-500">{event.loanId}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs text-gray-600">
                        {event.covenantType}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs text-gray-900 text-right font-mono">
                        {formatCurrency(event.exposure)}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(event.eventDate)}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyles(event.status)}`}>
                          {getStatusIcon(event.status)}
                          {event.status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-right text-xs font-medium">
                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {MOCK_EVENTS.length > INITIAL_VISIBLE_COUNT && (
              <button 
                onClick={() => setIsEventsExpanded(!isEventsExpanded)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all border-t border-gray-200 rounded-b-lg group"
                aria-expanded={isEventsExpanded}
              >
                <span>{isEventsExpanded ? 'Show less' : 'Show more'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isEventsExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
              </button>
            )}
          </div>
          <div className="text-[10px] text-gray-400 pt-1 text-right">
            Showing {isEventsExpanded ? MOCK_EVENTS.length : INITIAL_VISIBLE_COUNT} of {MOCK_EVENTS.length} events.
          </div>
        </section>

      </main>
    </div>
  );
}
