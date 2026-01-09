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
  eventId: string;
  loanId: string;
  borrowerName: string;
  covenantType: string;
  testDate: string;
  exposure: number | null;
  status: ComplianceStatus;
  ratio: number;
  covenantLimit: number;
}

// Mock data for initial display
const MOCK_EVENTS: ComplianceEvent[] = [
  { id: 'mock-001', eventId: 'EVT-DEMO-001', loanId: 'LN-8392', borrowerName: 'Alpha Logistics Corp', covenantType: 'Debt/EBITDA', testDate: '2024-05-14', exposure: 2450000, status: 'Compliant', ratio: 2.1, covenantLimit: 3.5 },
  { id: 'mock-002', eventId: 'EVT-DEMO-002', loanId: 'LN-9921', borrowerName: 'Summit Manufacturing', covenantType: 'Debt/EBITDA', testDate: '2024-05-13', exposure: 1200000, status: 'Warning', ratio: 3.3, covenantLimit: 3.5 },
  { id: 'mock-003', eventId: 'EVT-DEMO-003', loanId: 'LN-1023', borrowerName: 'Greenfield Energy', covenantType: 'Debt/EBITDA', testDate: '2024-05-12', exposure: 5600000, status: 'Compliant', ratio: 1.8, covenantLimit: 3.5 },
  { id: 'mock-004', eventId: 'EVT-DEMO-004', loanId: 'LN-4451', borrowerName: 'Apex Retail Group', covenantType: 'Debt/EBITDA', testDate: '2024-05-10', exposure: 890000, status: 'Breach', ratio: 4.2, covenantLimit: 3.5 },
  { id: 'mock-005', eventId: 'EVT-DEMO-005', loanId: 'LN-3329', borrowerName: 'Maritime Ventures', covenantType: 'Debt/EBITDA', testDate: '2024-05-09', exposure: 3100000, status: 'Compliant', ratio: 2.5, covenantLimit: 3.5 },
  { id: 'mock-006', eventId: 'EVT-DEMO-006', loanId: 'LN-7721', borrowerName: 'TechFlow Systems', covenantType: 'Debt/EBITDA', testDate: '2024-05-08', exposure: 1800000, status: 'Compliant', ratio: 2.8, covenantLimit: 3.5 },
  { id: 'mock-007', eventId: 'EVT-DEMO-007', loanId: 'LN-8832', borrowerName: 'Global Freight', covenantType: 'Debt/EBITDA', testDate: '2024-05-08', exposure: 4200000, status: 'Warning', ratio: 3.4, covenantLimit: 3.5 },
  { id: 'mock-008', eventId: 'EVT-DEMO-008', loanId: 'LN-1192', borrowerName: 'North Star Properties', covenantType: 'Debt/EBITDA', testDate: '2024-05-05', exposure: 6700000, status: 'Compliant', ratio: 2.2, covenantLimit: 3.5 },
  { id: 'mock-009', eventId: 'EVT-DEMO-009', loanId: 'LN-2291', borrowerName: 'Omega Healthcare', covenantType: 'Debt/EBITDA', testDate: '2024-05-02', exposure: 950000, status: 'Breach', ratio: 3.8, covenantLimit: 3.5 },
  { id: 'mock-010', eventId: 'EVT-DEMO-010', loanId: 'LN-5520', borrowerName: 'Vanguard Construction', covenantType: 'Debt/EBITDA', testDate: '2024-05-01', exposure: 2100000, status: 'Compliant', ratio: 1.9, covenantLimit: 3.5 },
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
      <dd className="text-2xl font-medium text-gray-900 tracking-tight tabular-nums flex items-baseline">
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
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalExposure: 0,
    compliant: 0,
    warning: 0,
    breach: 0,
    complianceRate: 0,
  });

  // Fetch compliance events and merge with mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Start with mock data
        setEvents(MOCK_EVENTS);
        
        // Calculate initial stats from mock data
        const mockCompliant = MOCK_EVENTS.filter(e => e.status === 'Compliant').length;
        const mockWarning = MOCK_EVENTS.filter(e => e.status === 'Warning').length;
        const mockBreach = MOCK_EVENTS.filter(e => e.status === 'Breach').length;
        const mockTotal = MOCK_EVENTS.length;
        const mockExposure = MOCK_EVENTS.reduce((sum, e) => sum + (e.exposure || 0), 0);
        
        setStats({
          totalLoans: mockTotal,
          totalExposure: mockExposure / 1_000_000_000,
          compliant: mockCompliant,
          warning: mockWarning,
          breach: mockBreach,
          complianceRate: mockTotal > 0 ? (mockCompliant / mockTotal) * 100 : 0,
        });
        
        // Fetch real compliance events
        const eventsResponse = await fetch('/api/compliance-events?limit=100');
        const eventsResult = await eventsResponse.json();
        
        console.log('📋 Compliance Events API response:', {
          ok: eventsResponse.ok,
          eventCount: eventsResult.events?.length || 0,
          events: eventsResult.events
        });

        if (eventsResponse.ok && eventsResult.events && eventsResult.events.length > 0) {
          // Transform live events
          const liveEvents: ComplianceEvent[] = eventsResult.events.map((event: any) => ({
            id: event.id,
            eventId: event.eventId,
            loanId: event.loanId,
            borrowerName: event.borrowerName,
            covenantType: event.covenantType,
            testDate: event.testDate,
            exposure: event.exposure,
            status: event.status === 'GREEN' ? 'Compliant' as ComplianceStatus :
                   event.status === 'AMBER' ? 'Warning' as ComplianceStatus :
                   'Breach' as ComplianceStatus,
            ratio: event.ratio,
            covenantLimit: event.covenantLimit,
          }));

          // Live events override mock data - prepend live events
          const mergedEvents = [...liveEvents, ...MOCK_EVENTS];
          setEvents(mergedEvents);

          // Calculate stats from merged data
          const compliantCount = mergedEvents.filter(e => e.status === 'Compliant').length;
          const warningCount = mergedEvents.filter(e => e.status === 'Warning').length;
          const breachCount = mergedEvents.filter(e => e.status === 'Breach').length;
          const totalCount = mergedEvents.length;
          const totalExp = mergedEvents.reduce((sum, e) => sum + (e.exposure || 0), 0);

          setStats({
            totalLoans: totalCount,
            totalExposure: totalExp / 1_000_000_000,
            compliant: compliantCount,
            warning: warningCount,
            breach: breachCount,
            complianceRate: totalCount > 0 ? (compliantCount / totalCount) * 100 : 0,
          });
        }
      } catch (err) {
        console.error('Error fetching compliance events:', err);
        // Keep mock data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Reports & Export</h1>
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
              label="Total Events" 
              endValue={stats.totalLoans} 
              icon={<Layers />}
            />
            <StatItem 
              label="Total Exposure" 
              endValue={stats.totalExposure} 
              prefix="$"
              suffix="B"
              decimals={2}
              duration={700}
              icon={<PieChart />}
            />
            <StatItem 
              label="Compliant" 
              endValue={stats.compliant}
              statusColor="green"
            />
            <StatItem 
              label="Warning" 
              endValue={stats.warning} 
              statusColor="yellow"
            />
            <StatItem 
              label="Breach" 
              endValue={stats.breach} 
              statusColor="red"
            />
             <StatItem 
              label="Compliance Rate" 
              endValue={stats.complianceRate}
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
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-32">Event ID</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Entity & Loan</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Covenant Type</th>
                    <th scope="col" className="px-5 py-2.5 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Exposure</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-32">Date</th>
                    <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
                    <th scope="col" className="relative px-5 py-2.5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {(isEventsExpanded ? events : events.slice(0, INITIAL_VISIBLE_COUNT)).map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900">
                        {event.eventId}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">{event.borrowerName}</span>
                          <span className="text-[10px] text-gray-500">{event.loanId}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs text-gray-600">
                        {event.covenantType}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs text-gray-900 text-right font-mono">
                        {event.exposure ? formatCurrency(event.exposure) : 'N/A'}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(event.testDate)}
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
            
            {events.length > INITIAL_VISIBLE_COUNT && (
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
          {!isLoading && events.length > 0 && (
            <div className="text-[10px] text-gray-400 pt-1 text-right">
              Showing {isEventsExpanded ? events.length : Math.min(INITIAL_VISIBLE_COUNT, events.length)} of {events.length} events.
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
