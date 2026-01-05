'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white text-slate-900 px-6 py-16">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">CovenantGuard</h1>
        <p className="text-slate-600 text-base sm:text-lg">
          AI-driven loan covenant monitoring with blockchain-verifiable audit trails.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-medium shadow-sm hover:bg-black transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
