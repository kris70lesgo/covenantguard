# Credexia

A Next.js + Supabase + Ethers-powered platform for blockchain-verified loan covenant monitoring, OCR-driven data extraction, and portfolio analytics.

## Features
- AI-assisted chat for covenant guidance (Gemini)
- OCR-backed document intake with fallback parsing
- Covenant calculations (Debt/EBITDA, ICR, current ratio)
- Polygon Amoy sealing for compliance events
- Dashboard for loans, uploads, reports, and trade utilities

## Stack
- Next.js 16, TypeScript, Tailwind
- Supabase (auth, DB, storage)
- Ethers.js for Polygon interactions
- Google Gemini for AI responses and parsing

## Prerequisites
- Node 18+ and npm
- Supabase project with SUPABASE_URL and service key
- Polygon Amoy RPC endpoint and funded deployer key
- Gemini API key for AI features

## Setup
1) Install deps: npm install
2) Copy .env.local.example to .env.local (if present) and set:
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
GEMINI_API_KEY=
POLYGON_RPC_URL=
BLOCKCHAIN_PRIVATE_KEY=
API_KEY=                  # optional API auth
ALLOWED_ORIGINS=*         # comma-separated list in prod
```
3) Run dev server: npm run dev
4) Optional: compile contracts: npx hardhat compile

## Scripts
- npm run dev – start Next.js dev server
- npm run lint – lint codebase
- npx hardhat compile – compile contracts
- npx tsx scripts/deploy.ts – deploy CovenantRegistry to Polygon Amoy
- npx tsx scripts/test-covenant-engine.ts – run covenant logic tests
- npx tsx scripts/verify-infrastructure.ts – smoke-check Supabase, OCR, blockchain readiness

## Testing Notes
- Covenant logic tests are deterministic (pure math)
- OCR/Gemini flows require valid credentials and network access

## Operational Tips
- Use separate Supabase buckets for financial docs; restrict RLS in production
- Keep GEMINI_API_KEY and blockchain keys out of client bundles
- Rotate keys and enforce HTTPS in production
