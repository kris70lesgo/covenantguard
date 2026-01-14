
'use client';

import React from 'react';
import Link from 'next/link';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  Shield, 
  ArrowRight, 
  Play, 
  Activity, 
  Database, 
  FileCheck, 
  ShieldCheck, 
  FileText, 
  Search,
  ArrowUpRight,
  User,
  Menu,
  ChevronUp,
  ChevronDown,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  AlertCircle,
  TrendingUp,
  FileSearch,
  Fingerprint,
  Zap,
  Cpu
} from 'lucide-react';
import { TextScramble } from '@/components/ui/text-scramble';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface FloatingNodeProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  position: string;
  delay?: string;
  align?: 'left' | 'right';
  status?: 'green' | 'amber' | 'red';
}

interface LogoProps {
  name: string;
  icon?: React.ReactNode;
}

interface ComplianceCardProps {
  label: string;
  value: string;
  source: string;
  status?: 'Reviewed' | 'Sealed' | 'Amber';
  delay?: string;
  position: string;
}

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  [key: string]: unknown;
}

// --- Components ---

function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex shrink-0 justify-around [gap:var(--gap)]",
              {
                "animate-marquee flex-row": !vertical,
                "animate-marquee-vertical flex-col": vertical,
                "group-hover:[animation-play-state:paused]": pauseOnHover,
                "[animation-direction:reverse]": reverse,
              },
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}

const FloatingNode: React.FC<FloatingNodeProps> = ({ label, value, icon, position, delay = "0s", align = 'left', status = 'green' }) => {
  const statusColor = status === 'green' ? 'bg-emerald-400/80' : status === 'amber' ? 'bg-orange-400/80' : 'bg-rose-400/80';
  const shadowColor = status === 'green' ? 'shadow-[0_0_5px_rgba(52,211,153,0.5)]' : status === 'amber' ? 'shadow-[0_0_5px_rgba(251,146,60,0.5)]' : 'shadow-[0_0_5px_rgba(248,113,113,0.5)]';

  return (
    <div 
      className={`absolute ${position} flex items-center gap-4 animate-float pointer-events-none z-30 ${align === 'right' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
      style={{ animationDelay: delay }}
    >
      <div className="relative group">
        <div className="absolute -inset-2 bg-white/5 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="w-10 h-10 rounded-full bg-[#1A1D21]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-300 shadow-xl relative z-10">
          {icon}
        </div>
        <div className={`absolute top-1/2 ${align === 'right' ? '-left-8' : '-right-8'} -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40`}></div>
      </div>
      <div className="flex flex-col">
        <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
            {align === 'left' && <div className={cn("w-1 h-1 rounded-full", statusColor, shadowColor)}></div>}
            <span className="text-sm font-medium text-gray-200 tracking-wide">{label}</span>
            {align === 'right' && <div className={cn("w-1 h-1 rounded-full", statusColor, shadowColor)}></div>}
        </div>
        <span className="text-xs text-gray-500 font-sans font-light mt-0.5 tracking-wider">{value}</span>
      </div>
    </div>
  );
};

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between px-6 lg:px-8 py-4 w-full max-w-[1600px] mx-auto">
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-white opacity-100"></div>
          <ShieldCheck size={24} strokeWidth={2.5} className="relative z-10" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white ml-1">Credexia</span>
      </div>

      <div className="hidden md:flex items-center gap-1 bg-[#111316] border border-white/10 rounded-full px-1.5 py-1.5 shadow-2xl">
        {['Home', 'Platform', 'Compliance Engine', 'Portfolio', 'Reports', 'Pricing'].map((item, idx) => (
          <Link 
            key={item}
            href="/login"
            className={`px-5 py-2 text-[13px] font-medium rounded-full transition-all duration-300 cursor-pointer ${
              idx === 0 
                ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item}
          </Link>
        ))}
        
        <button className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 ml-2 text-[13px] font-medium text-gray-300 hover:text-white transition-colors group border-l border-white/10 cursor-pointer">
          Security
          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Shield size={12} fill="black" />
          </div>
        </button>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/login" className="hidden md:flex items-center gap-2.5 text-sm font-medium text-white hover:text-gray-200 transition-colors group cursor-pointer">
          <User size={18} className="text-gray-400 group-hover:text-white transition-colors" />
          <span className="tracking-wide">Officer Login</span>
        </Link>
        <button className="md:hidden text-white cursor-pointer">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

const PartnerLogo: React.FC<LogoProps> = ({ name, icon }) => (
  <div className="flex items-center gap-2 opacity-40 hover:opacity-90 transition-opacity duration-300 grayscale cursor-pointer group mx-4">
    <div className="group-hover:scale-110 transition-transform duration-300">
        {icon || <Database size={20} />}
    </div>
    <span className="text-lg font-bold font-sans tracking-tight">{name}</span>
  </div>
);

const ComplianceCard: React.FC<ComplianceCardProps> = ({ label, value, source, status = 'Reviewed', delay = '0s', position }) => (
  <div 
    className={`absolute ${position} p-4 rounded-2xl bg-[#1A1D21]/80 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col gap-2 min-w-[220px] animate-float hover:-translate-y-1 transition-transform duration-300 group z-20`}
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-between">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'Amber' ? 'bg-orange-500/10 text-orange-400' : 'bg-white/10 text-white'}`}>
        {status === 'Sealed' ? <ShieldCheck size={14} /> : status === 'Amber' ? <AlertCircle size={14} /> : <FileText size={14} />}
      </div>
      <span className="text-[10px] uppercase font-sans text-gray-500 tracking-wider font-medium">{status}</span>
    </div>
    <div className="flex flex-col">
       <div className="flex items-baseline gap-1">
          <span className="text-lg font-medium text-white">{value}</span>
          <span className="text-[10px] text-gray-500 font-medium ml-1">USD</span>
       </div>
       <span className="text-[11px] text-gray-400 font-sans mt-0.5 font-medium">{label}</span>
       <span className="text-[9px] text-gray-600 font-sans">Source: {source}</span>
    </div>
    <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
  </div>
);

const ComplianceEngineSection: React.FC = () => {
    return (
        <section className="relative w-full min-h-[900px] flex flex-col items-center pt-20 pb-32 px-6 z-20 bg-black font-sans">
            <div className="text-center mb-24 relative z-10">
                <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-white">Monitoring Engine</h2>
                <p className="text-gray-400 max-w-xl mx-auto font-light leading-relaxed text-sm md:text-base">
                    A deterministic covenant engine designed for agent banks and credit officers to monitor borrower compliance with confidence.
                </p>
                <button className="mt-8 px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 cursor-pointer">
                    See Compliance Flow
                </button>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
                <div className="relative h-[600px] w-full flex flex-col justify-center">
                    <div className="absolute top-[10%] left-0 z-10">
                        <h3 className="text-7xl font-light text-white tracking-tighter mb-2">7.75x</h3>
                        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Covenant Ratio Detected</p>
                    </div>

                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 220 200 Q 150 350 100 500" fill="none" stroke="white" strokeDasharray="4 4" />
                        <path d="M 400 250 Q 350 400 300 480" fill="none" stroke="white" strokeOpacity="0.5" />
                        <circle cx="100" cy="500" r="3" fill="white" />
                        <circle cx="300" cy="480" r="3" fill="white" />
                    </svg>

                    <ComplianceCard label="EBITDA Extracted" value="$12.4M" source="Annual Report 2024" position="top-[30%] left-[0%]" delay="0s" status="Reviewed" />
                    <ComplianceCard label="Total Debt Extracted" value="$96.2M" source="SEC Filing Q4" position="top-[20%] right-[10%]" delay="2s" status="Sealed" />
                    <ComplianceCard label="Compliance Warning" value="7.75x" source="Leverage Test" position="bottom-[35%] left-[20%]" delay="1.5s" status="Amber" />

                    <div className="absolute bottom-[10%] left-[10%] text-xs font-sans text-gray-500 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div> Reviewed
                    </div>
                     <div className="absolute bottom-[15%] right-[30%] text-xs font-sans text-gray-500 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"></div> Sealed
                    </div>
                </div>

                <div className="relative flex flex-col items-center">
                    <div className="relative w-[320px] h-[320px] md:w-[380px] md:h-[380px] flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-white/5 bg-[#111] shadow-2xl"></div>
                        <div className="absolute inset-4 rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-transparent opacity-50"></div>
                        <div className="absolute inset-0 rounded-full rotate-[-45deg]">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="40%" stroke="rgba(255,255,255,0.05)" strokeWidth="15" fill="none" />
                                <circle cx="50%" cy="50%" r="40%" stroke="url(#progressGradient)" strokeWidth="15" fill="none" strokeDasharray="600" strokeDashoffset="350" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#333" />
                                        <stop offset="100%" stopColor="#fff" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="absolute w-32 h-32 md:w-40 md:h-40 bg-black rounded-full border border-white/10 flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(255,255,255,0.1)] z-10">
                            <FileText size={28} className="text-white fill-white mb-2 animate-pulse" />
                            <span className="text-sm font-medium text-white text-center px-4">Upload Borrower Report</span>
                            <div className="absolute -top-1 w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute bottom-[20%] right-[10%] text-[10px] text-gray-400 font-sans rotate-[0deg]">Next: Extract Financials</div>
                    </div>

                    <div className="w-full max-lg mt-16 flex flex-col gap-4">
                         <div className="flex justify-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-[#1A1D21] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 cursor-pointer transition-colors">
                                <ChevronUp size={16} />
                             </div>
                             <div className="w-8 h-8 rounded-full bg-[#1A1D21] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 cursor-pointer transition-colors">
                                <ChevronDown size={16} />
                             </div>
                         </div>
                         <div className="flex flex-wrap justify-center gap-3">
                            {['Deterministic Engine', 'Audit Trail', 'Regulatory Ready', 'Blockchain Verified', 'Manual Review'].map((tag, i) => (
                                <div 
                                    key={i} 
                                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-default ${tag === 'Deterministic Engine' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-[#15171A] text-gray-400 border-white/5 hover:border-white/20'}`}
                                >
                                    {tag === 'Deterministic Engine' ? <div className="flex items-center gap-1"><Zap size={10} fill="black" /> {tag}</div> : 
                                     tag === 'Audit Trail' ? <div className="flex items-center gap-1"><Fingerprint size={10} /> {tag}</div> : 
                                     tag}
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </section>
    );
}

const HeroVideoSection: React.FC = () => {
    return (
        <section className="relative w-full max-w-[1400px] px-6 py-24 mx-auto z-20 font-sans">
             <div className="text-center mb-16 relative z-10">
                 <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-white tracking-tight">See It In Action</h2>
                 <p className="text-gray-500 font-light text-sm md:text-base max-w-lg mx-auto">
                     Watch how Credexia transforms complex borrower data into verified compliance records in seconds.
                 </p>
             </div>
             
             <div className="w-full max-w-4xl mx-auto">
                <HeroVideoDialog
                    animationStyle="from-center"
                    videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                    thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
                    thumbnailAlt="Credexia Platform Demo"
                />
             </div>
        </section>
    );
}

const InsightsSection: React.FC = () => {
    return (
        <section className="relative w-full max-w-[1400px] px-6 py-24 mx-auto z-20 font-sans">
             <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-30"></div>
             <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-20"></div>

             <div className="text-center mb-20 relative z-10">
                 <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-white tracking-tight drop-shadow-xl">Compliance Intelligence</h2>
                 <p className="text-gray-500 font-light text-sm md:text-base max-w-lg mx-auto">
                     Replace weeks of spreadsheet covenant testing with instant, verifiable compliance decisions.
                 </p>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                 <div className="col-span-1 lg:col-span-7 min-h-[440px] rounded-[32px] bg-[#0F1115]/80 backdrop-blur-xl border border-white/5 p-6 md:p-10 relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-[0_0_40px_-10px_rgba(255,255,255,0.02)]">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                      <div className="relative z-10 h-full flex flex-col justify-between">
                          <div>
                              <div className="text-6xl md:text-7xl font-light tracking-tighter text-white mb-2 drop-shadow-2xl">99.8<span className="text-4xl text-gray-500 font-thin">%</span></div>
                              <div className="text-gray-400 text-sm tracking-wide font-medium flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
                                  Compliance Accuracy . Verified
                              </div>
                          </div>
                          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[180px] opacity-80 pointer-events-none">
                               <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                                   <defs>
                                       <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                           <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                                           <stop offset="50%" stopColor="rgba(255,255,255,0.5)" />
                                           <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                                       </linearGradient>
                                   </defs>
                                   <path d="M 0 100 Q 250 180 500 80" fill="none" stroke="url(#orbitGrad)" strokeWidth="1" className="animate-pulse-slow" />
                                   <g className="animate-float" style={{ animationDelay: '0s' }}>
                                       <circle cx="120" cy="125" r="4" fill="#111" stroke="white" strokeWidth="2" />
                                       <text x="120" y="145" textAnchor="middle" fill="#666" fontSize="10" fontFamily="sans-serif">Node A</text>
                                   </g>
                                   <g className="animate-float" style={{ animationDelay: '2s' }}>
                                       <circle cx="280" cy="120" r="4" fill="#111" stroke="white" strokeWidth="2" />
                                       <text x="280" y="100" textAnchor="middle" fill="#666" fontSize="10" fontFamily="sans-serif">Verification</text>
                                   </g>
                                    <g className="animate-float" style={{ animationDelay: '4s' }}>
                                       <circle cx="420" cy="90" r="4" fill="#111" stroke="white" strokeWidth="2" />
                                       <text x="420" y="70" textAnchor="middle" fill="#666" fontSize="10" fontFamily="sans-serif">Node B</text>
                                   </g>
                               </svg>
                          </div>
                          <div className="flex flex-col items-center z-20 mt-32 md:mt-0">
                              <h4 className="text-xl text-white font-medium mb-2">Deterministic Audit Trail</h4>
                              <p className="text-xs text-gray-500 text-center max-w-sm mb-6 leading-relaxed">Financial reports are parsed, normalized, and tested against deterministic logic to ensure zero-dispute audit readiness.</p>
                              <div className="flex flex-wrap justify-center gap-2">
                                  <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] text-gray-400 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                                      <FileSearch size={10} /> Full Audit Report
                                  </button>
                                  <button className="px-4 py-1.5 rounded-full bg-white text-[11px] text-black font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                                      Request Officer Review
                                  </button>
                              </div>
                          </div>
                      </div>
                 </div>

                 <div className="col-span-1 lg:col-span-5 min-h-[440px] rounded-[32px] bg-[#0F1115]/80 backdrop-blur-xl border border-white/5 p-6 md:p-10 relative overflow-hidden flex flex-col items-center justify-end group hover:border-white/10 transition-all duration-500 shadow-[0_0_40px_-10px_rgba(255,255,255,0.02)]">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                      <div className="absolute inset-0 flex items-center justify-center pb-24">
                          <div className="flex items-end gap-4 h-[200px]">
                              {[40, 70, 50, 80, 60, 90, 45].map((h, i) => (
                                  <div key={i} className="relative w-3 group/bar">
                                      <div 
                                          style={{ height: `${h}%` }} 
                                          className="w-full bg-gradient-to-t from-white/0 via-white/10 to-white/30 rounded-t-full rounded-b-sm backdrop-blur-sm transition-all duration-1000 ease-out group-hover/bar:via-white/20"
                                      ></div>
                                      <div 
                                          className="absolute top-0 w-full h-1.5 bg-white/40 rounded-full -mt-0.5 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                          style={{ top: `${100 - h}%` }}
                                      ></div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="relative z-10 text-center">
                          <h4 className="text-xl text-white font-medium mb-2">Breach Detection Speed</h4>
                          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Instant alerts on leverage thresholds and interest coverage deviations across the entire portfolio.</p>
                      </div>
                 </div>

                 <div className="col-span-1 lg:col-span-5 min-h-[380px] rounded-[32px] bg-[#0F1115]/80 backdrop-blur-xl border border-white/5 p-6 md:p-10 flex flex-col justify-end group hover:border-white/10 transition-all duration-500 shadow-[0_0_40px_-10px_rgba(255,255,255,0.02)] relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                      <div className="flex gap-4 mb-8">
                          <div className="flex-1 bg-[#15171B] rounded-2xl p-4 md:p-5 border border-white/5 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl -mr-10 -mt-10"></div>
                             <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-6 border-l-2 border-emerald-400 pl-2 font-medium">Loans Monitored</div>
                             <div className="text-emerald-400 text-xs font-medium mb-1">Active</div>
                             <div className="text-3xl md:text-4xl text-white font-light tracking-tight mb-1">1,248</div>
                             <div className="text-gray-500 text-xs font-sans">Across 14 Sectors</div>
                          </div>
                          <div className="flex-1 bg-[#15171B] rounded-2xl p-4 md:p-5 border border-white/5 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl -mr-10 -mt-10"></div>
                             <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-6 border-l-2 border-white pl-2 font-medium">Verified Records</div>
                             <div className="text-white text-xs font-medium mb-1">Compliance</div>
                             <div className="text-3xl md:text-4xl text-white font-light tracking-tight mb-1">98.2<span className="text-xl">%</span></div>
                             <div className="text-gray-500 text-xs font-sans">Deterministic Seal</div>
                          </div>
                      </div>
                      <h4 className="text-lg text-white font-medium mb-2">Portfolio Risk Distribution</h4>
                      <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Watch your assets under management stay within policy limits with real-time risk grading.</p>
                 </div>
                 
                 <div className="col-span-1 lg:col-span-7 min-h-[380px] rounded-[32px] bg-[#0F1115]/80 backdrop-blur-xl border border-white/5 p-6 md:p-10 relative overflow-hidden flex flex-col group hover:border-white/10 transition-all duration-500 shadow-[0_0_40px_-10px_rgba(255,255,255,0.02)]">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                      <div className="text-center mb-8 relative z-10">
                          <h4 className="text-lg text-white font-medium mb-2">Covenant Compliance Rate %</h4>
                          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">Every record is a deterministic contract, ensuring compliance is not just reported, but verified.</p>
                      </div>
                      <div className="flex-1 flex items-end justify-center gap-3 md:gap-6 px-4 relative z-10 pb-4">
                           <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                               <div className="w-full h-px bg-white"></div>
                               <div className="w-full h-px bg-white"></div>
                               <div className="w-full h-px bg-white"></div>
                           </div>
                           {[
                             { h: 85, c: '#10B981', l: 'Q1' }, 
                             { h: 75, c: '#10B981', l: 'Q2' }, 
                             { h: 90, c: '#10B981', l: 'Q3' }, 
                             { h: 65, c: '#F59E0B', l: 'Q4' },
                             { h: 80, c: '#10B981', l: 'Est' }
                           ].map((item, i) => (
                               <div key={i} className="flex flex-col items-center gap-2 group/chart">
                                   <div className="text-[10px] text-white opacity-0 group-hover/chart:opacity-100 transition-opacity -translate-y-2 transform">{item.h}%</div>
                                   <div 
                                       className="w-8 md:w-10 rounded-sm transition-all duration-700 ease-out hover:opacity-100 opacity-80" 
                                       style={{ height: `${item.h * 1.5}px`, backgroundColor: item.c }}
                                   ></div>
                                   <div className="text-[10px] text-gray-500 font-sans">{item.l}</div>
                               </div>
                           ))}
                      </div>
                      <div className="flex justify-center gap-1 mt-2">
                          <div className="w-8 h-1 bg-white rounded-full"></div>
                          <div className="w-8 h-1 bg-white/10 rounded-full"></div>
                          <div className="w-8 h-1 bg-white/10 rounded-full"></div>
                      </div>
                 </div>
             </div>
        </section>
    )
}

const FooterSection: React.FC = () => {
  return (
    <div className="w-full max-w-[1600px] px-4 lg:px-6 pb-8 font-sans">
      <div className="relative w-full bg-[#080A0C] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
         <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] mix-blend-screen opacity-20"></div>
             <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] mix-blend-screen opacity-10"></div>
         </div>
         <div className="relative z-10 py-32 px-6 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-10 max-w-3xl leading-tight">
               Every loan deserves a compliance record you can trust — even years later.
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
               <Link href="/login" className="px-8 py-3 rounded-full bg-white text-black font-medium text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer flex items-center justify-center">
                 Upload Your First Report
               </Link>
               <button className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 backdrop-blur-md transition-colors cursor-pointer">
                 Watch Compliance Demo
               </button>
            </div>
         </div>
         <div className="relative z-10 border-t border-white/5 bg-[#030405]/50 backdrop-blur-xl px-10 py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-12">
               <div className="md:col-span-4 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <ShieldCheck size={20} className="text-black" />
                     </div>
                     <span className="text-xl font-bold tracking-tight text-white">Credexia</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                     Automated covenant monitoring with deterministic logic and verifiable audit trails.
                  </p>
               </div>
               <div className="md:col-span-4 flex justify-start md:justify-center items-center">
                  <div className="flex gap-8 text-sm text-gray-400 font-medium">
                     <a href="#" className="hover:text-white transition-colors">Regulatory Compliance</a>
                     <a href="#" className="hover:text-white transition-colors">Portfolio Review</a>
                     <a href="#" className="hover:text-white transition-colors">Audit Engine</a>
                  </div>
               </div>
               <div className="md:col-span-4 flex justify-start md:justify-end items-center gap-6">
                  <Github size={20} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                  <Twitter size={20} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                  <Linkedin size={20} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                  <Instagram size={20} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
               </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
               <span>&copy; 2025 Credexia Systems. Built for Enterprise Banking.</span>
               <a href="#" className="hover:text-gray-400 transition-colors">Privacy & Security Policy</a>
            </div>
         </div>
      </div>
    </div>
  )
}

const BackgroundEffects: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    <div className="absolute top-[-30%] right-[-10%] w-[1000px] h-[1000px] bg-white/5 rounded-full blur-[150px] mix-blend-screen opacity-50"></div>
    <div className="absolute top-[0%] right-[20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] opacity-30"></div>
    <div className="absolute bottom-[-30%] left-[-10%] w-[1000px] h-[1000px] bg-gray-200/5 rounded-full blur-[150px] mix-blend-screen opacity-40"></div>
  </div>
);

const RainEffect: React.FC = () => {
  const [drops, setDrops] = React.useState<Array<{
    left: number;
    delay: number;
    duration: number;
    opacity: number;
  }>>([]);

  React.useEffect(() => {
    setDrops(
      Array.from({ length: 12 }).map((_, i) => ({
        left: 5 + (i * 8) + (Math.random() * 5 - 2.5),
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 3,
        opacity: 0.05 + Math.random() * 0.15
      }))
    );
  }, []);

  if (drops.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
       {drops.map((drop, i) => (
         <div 
           key={i}
           className="absolute top-[-20%] w-[1px] h-[40%] bg-gradient-to-b from-transparent via-white/40 to-transparent animate-fall"
           style={{
             left: `${drop.left}%`,
             animationDuration: `${drop.duration}s`,
             animationDelay: `-${drop.delay}s`,
             opacity: drop.opacity
           }}
         />
       ))}
    </div>
  );
}

const CurvedLines: React.FC = () => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="gradRight" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d="M 15% 25% C 25% 25%, 30% 35%, 45% 40%" fill="none" stroke="url(#gradLeft)" strokeWidth="1" />
      <path d="M 12% 65% C 20% 65%, 25% 60%, 40% 55%" fill="none" stroke="url(#gradLeft)" strokeWidth="1" />
      <path d="M 85% 28% C 75% 28%, 70% 35%, 55% 38%" fill="none" stroke="url(#gradRight)" strokeWidth="1" />
      <path d="M 88% 60% C 78% 60%, 75% 58%, 60% 55%" fill="none" stroke="url(#gradRight)" strokeWidth="1" />
    </svg>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-x-hidden">
      <div className="w-full z-50 pt-4 pb-2 bg-black/80 backdrop-blur-md sticky top-0">
        <Navbar />
      </div>

      <main className="flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-[1600px] px-4 lg:px-6 mb-12">
            <div className="relative w-full min-h-[80vh] md:min-h-[850px] bg-[#080A0C] rounded-[32px] border border-white/10 shadow-[0_0_60px_-15px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col items-center justify-center">
                <BackgroundEffects />
                <CurvedLines />
                <RainEffect />
                
                <div className="hidden md:block">
                    <FloatingNode label="Debt / EBITDA" value="4.2x" icon={<TrendingUp size={18} />} position="top-[20%] left-[10%] lg:left-[12%]" delay="0s" status="green" />
                    <FloatingNode label="Interest Coverage" value="3.1x" icon={<Activity size={18} />} position="bottom-[35%] left-[8%] lg:left-[10%]" delay="2s" status="amber" />
                    <FloatingNode label="Leverage Ratio" value="7.75x" icon={<AlertCircle size={18} />} position="top-[23%] right-[10%] lg:right-[12%]" delay="1.5s" align="right" status="red" />
                    <FloatingNode label="Audit Trail" value="100% Sealed" icon={<Fingerprint size={18} />} position="bottom-[35%] right-[8%] lg:right-[10%]" delay="3.5s" align="right" status="green" />
                </div>

                <div className="max-w-5xl w-full text-center px-6 relative z-20">
                  <div className="flex justify-center mb-8 md:mb-10">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer group">
                          <Play size={16} fill="white" className="ml-1 text-white/80 group-hover:text-white" />
                      </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md mb-6 md:mb-8 transition-all hover:bg-white/10 cursor-default">
                    <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center border border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <span className="text-[13px] font-medium text-gray-300">Deterministic Compliance Engine Active</span>
                    <ArrowRight size={12} className="text-gray-500 ml-1" />
                  </div>

                  <h1 className="text-5xl md:text-8xl font-[550] tracking-tight leading-[1.05] mb-6 md:mb-8">
                    <TextScramble as="span" className="text-white block" duration={1.2}>
                      One-click
                    </TextScramble>
                    <TextScramble as="span" className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent" duration={1.5} speed={0.03}>
                      Covenant Monitoring
                    </TextScramble>
                  </h1>

                  <p className="text-base md:text-lg text-gray-400/70 max-w-2xl mx-auto mb-10 md:mb-12 font-light leading-relaxed tracking-wide">
                    Turn borrower financial reports into verified covenant compliance in seconds — no spreadsheets, no manual risk, no disputes.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5">
                    <button className="w-full sm:w-auto group relative px-9 py-4 bg-[#111316] text-white rounded-full font-medium text-sm transition-all duration-300 hover:bg-[#16181c] border border-white/10 flex items-center justify-center gap-2 overflow-hidden shadow-lg cursor-pointer">
                      <span className="relative z-10 tracking-wide">Upload Compliance Report</span>
                      <ArrowUpRight size={14} className="relative z-10 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                    <Link href="/login" className="w-full sm:w-auto px-9 py-4 bg-white text-black rounded-full font-medium text-sm transition-all duration-300 hover:bg-gray-100 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer flex items-center justify-center">
                      Get Started
                    </Link>
                  </div>
                </div>

                <div className="absolute bottom-10 left-12 hidden lg:flex items-center gap-4 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-white/10 border border-white/5 text-white flex items-center justify-center animate-bounce">
                        <ArrowRight size={18} className="rotate-90" />
                    </div>
                    <span className="text-xs text-gray-400 font-sans tracking-widest uppercase">Portfolio Overview</span>
                </div>
            </div>
        </div>

        <div className="w-full max-w-[1400px] px-8 py-12 border-t border-white/5 border-b border-white/5 mb-12 opacity-80 overflow-hidden relative">
            <Marquee pauseOnHover className="[--duration:20s] [--gap:3rem]">
                <PartnerLogo name="J.P. Morgan" icon={<Database size={20} />} />
                <PartnerLogo name="Goldman Sachs" icon={<ShieldCheck size={20} />} />
                <PartnerLogo name="Morgan Stanley" icon={<Activity size={20} />} />
                <PartnerLogo name="BlackRock" icon={<Search size={20} />} />
                <PartnerLogo name="Citi" icon={<FileCheck size={20} />} />
                <PartnerLogo name="HSBC" icon={<Cpu size={20} />} />
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black via-transparent to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black via-transparent to-transparent"></div>
        </div>

        {/* Hero Video Dialog Section */}
        <HeroVideoSection />

        <div className="w-full max-w-[1600px] px-4 lg:px-6 pb-24">
             <ComplianceEngineSection />
        </div>
        
        <div className="w-full pb-32">
             <InsightsSection />
        </div>
        
        <FooterSection />
      </main>
    </div>
  );
};

export default App;
