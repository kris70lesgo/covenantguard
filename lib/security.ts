// Security middleware and utilities for CovenantGuard APIs

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiter configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 requests per minute

/**
 * Rate limiting middleware
 */
export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const rateLimitKey = `rate_${ip}`;
  const existing = rateLimitStore.get(rateLimitKey);

  if (existing && existing.resetTime > now) {
    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((existing.resetTime - now) / 1000)),
          }
        }
      );
    }
    existing.count++;
  } else {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
  }

  // Cleanup old entries (run occasionally)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  return null;
}

/**
 * Simple API key validation (for demo - use proper auth in production)
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validKey = process.env.API_KEY;
  
  // For demo, allow requests without API key
  if (!validKey) return true;
  
  return apiKey === validKey;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\./, '')
    .slice(0, 255);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validate loan ID format (UUID v4)
 */
export function validateLoanId(loanId: string): boolean {
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(loanId);
}

/**
 * Validate numeric input
 */
export function validateNumber(value: unknown, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): boolean {
  if (typeof value !== 'number') return false;
  if (isNaN(value) || !isFinite(value)) return false;
  return value >= min && value <= max;
}

/**
 * Sanitize error messages to prevent information disclosure
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred processing your request';
    }
    return error.message;
  }
  return 'Unknown error occurred';
}

/**
/**
 * Validate document ID format (UUID v4)
 */
export function validateDocumentId(id: string): boolean {
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * CORS headers for API responses
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  // In production, restrict to specific domains
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

/**
 * Security headers for all responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

/**
 * Input validation for covenant calculation
 */
export interface CovenantInput {
  totalDebt: number;
  ebitda: number;
  limit?: number;
}

export function validateCovenantInput(input: unknown): input is CovenantInput {
  if (typeof input !== 'object' || input === null) return false;
  
  const obj = input as Record<string, unknown>;
  
  if (!validateNumber(obj.totalDebt, 0, 1e15)) return false;
  if (!validateNumber(obj.ebitda, 0.01, 1e15)) return false; // Prevent division by zero
  if (obj.limit !== undefined && !validateNumber(obj.limit, 0.1, 100)) return false;
  
  return true;
}

/**
 * Log security events (in production, send to monitoring service)
 */
export function logSecurityEvent(event: string, details: Record<string, unknown>) {
  console.warn('[SECURITY]', event, JSON.stringify(details));
  
  // In production: send to monitoring service like Sentry, DataDog, etc.
}

/**
 * Check if request is from localhost (for testing)
 */
export function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}
