import crypto from 'crypto';

// Simple CSRF token manager (can be enhanced with Redis)
const csrfTokens = new Map<string, number>();

const CSRF_TOKEN_TTL = 1000 * 60 * 60; // 1 hour

// Generate CSRF token
export const generateCsrfToken = (): string => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, Date.now() + CSRF_TOKEN_TTL);
  
  // Cleanup expired tokens
  if (csrfTokens.size > 1000) {
    const now = Date.now();
    for (const [key, expiry] of csrfTokens.entries()) {
      if (expiry < now) csrfTokens.delete(key);
    }
  }
  
  return token;
};

// Validate CSRF token
export const validateCsrfToken = (token: string): boolean => {
  if (!token) return false;
  const expiry = csrfTokens.get(token);
  if (!expiry || expiry < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }
  csrfTokens.delete(token); // One-time use
  return true;
};
