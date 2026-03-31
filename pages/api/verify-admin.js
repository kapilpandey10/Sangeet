// File location: pages/api/verify-admin.js
// Validates the Cloudflare Access JWT from the CF_Authorization cookie.
// Called by AdminDashboard.jsx on mount to get the admin's email.

import jwt from 'jsonwebtoken';

const CERTS_URL = `https://${process.env.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;

// Cache public keys so we don't fetch on every request
let cachedKeys = null;
let cacheTime  = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getPublicKeys() {
  if (cachedKeys && Date.now() - cacheTime < CACHE_TTL) return cachedKeys;

  const res  = await fetch(CERTS_URL);
  const data = await res.json();

  // Cloudflare returns { keys: [...] } — we index by kid for fast lookup
  cachedKeys = {};
  for (const key of data.keys) {
    cachedKeys[key.kid] = key;
  }
  cacheTime = Date.now();
  return cachedKeys;
}

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ authorized: false, error: 'Method not allowed' });
  }

  const token = req.cookies['CF_Authorization'];

  if (!token) {
    return res.status(401).json({ authorized: false, error: 'No token found' });
  }

  try {
    // Decode header to get kid (key ID)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token format');

    const { kid } = decoded.header;
    const keys    = await getPublicKeys();
    const jwk     = keys[kid];

    if (!jwk) throw new Error('Public key not found for kid: ' + kid);

    // Convert JWK to PEM-compatible format for jsonwebtoken
    const publicKey = require('jwk-to-pem')(jwk);

    // Verify signature + claims
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience:   process.env.CF_ACCESS_AUD,
      issuer:     `https://${process.env.CF_ACCESS_TEAM_DOMAIN}`,
    });

    // Only allow your specific verified email(s)
    const ALLOWED_EMAILS = (process.env.CF_ALLOWED_EMAILS || '').split(',').map(e => e.trim());

    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(payload.email)) {
      return res.status(403).json({ authorized: false, error: 'Email not permitted' });
    }

    return res.status(200).json({
      authorized: true,
      email:      payload.email,
    });

  } catch (err) {
    console.error('[verify-admin] JWT error:', err.message);
    return res.status(401).json({ authorized: false, error: 'Invalid or expired token' });
  }
}