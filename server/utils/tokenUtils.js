import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token (for email verification, password reset).
 * Store hashed version in DB; send plain token to user.
 */
export function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token for safe storage in DB (compare with hash when verifying).
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
