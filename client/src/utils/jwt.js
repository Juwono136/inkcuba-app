/**
 * Decode JWT payload without verification (client-side expiry check only).
 * Returns payload object or null if invalid.
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token is missing, malformed, or past its exp claim.
 * Uses a 60s buffer so we don't use a token that expires in the next minute.
 */
export function isTokenExpired(token, bufferSeconds = 60) {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.exp == null) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - bufferSeconds < now;
}
