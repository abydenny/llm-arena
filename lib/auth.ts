import { NextRequest } from 'next/server';
import crypto from 'crypto';

const COOKIE_NAME = 'arena_session';
const SECRET = process.env.PIN_SESSION_SECRET || 'llm-arena-default-secret-salt-2026';

export function getExpectedPin(): string {
  return process.env.APP_PIN || '1234';
}

/**
 * Creates a signed session token
 */
export function createSessionToken(): string {
  const payload = JSON.stringify({
    authenticated: true,
    issuedAt: Date.now(),
  });
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return Buffer.from(`${payload}::${signature}`).toString('base64');
}

/**
 * Validates a session token
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const [payloadStr, signature] = raw.split('::');
    if (!payloadStr || !signature) return false;

    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(payloadStr);
    const expectedSig = hmac.digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      const payload = JSON.parse(payloadStr);
      // Valid for 7 days
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - payload.issuedAt < maxAge) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Checks request cookies for authentication
 */
export function isAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
