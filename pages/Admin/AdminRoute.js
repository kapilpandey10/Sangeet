// File location: pages/Admin/AdminRoute.js
// Wraps the dashboard — calls /api/verify-admin to confirm the CF Access JWT
// is valid and the email is on the allow-list.
// Renders a clean "Access Denied" screen if not authorized.

import { useEffect, useState } from 'react';

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'denied'
  const [email,  setEmail]  = useState('');

  useEffect(() => {
    fetch('/api/verify-admin')
      .then(r => r.json())
      .then(data => {
        if (data.authorized) {
          setEmail(data.email);
          setStatus('authorized');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => setStatus('denied'));
  }, []);

  // ── Loading ──
  if (status === 'loading') {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Verifying access…</p>
      </div>
    );
  }

  // ── Access Denied ──
  if (status === 'denied') {
    return (
      <div style={styles.center}>
        <div style={styles.deniedCard}>
          <div style={styles.lockIcon}>🔒</div>
          <h1 style={styles.deniedTitle}>Access Denied</h1>
          <p style={styles.deniedText}>
            Your session is invalid or your account is not authorised to access this area.
          </p>
          <button
            style={styles.loginBtn}
            onClick={() => {
              window.location.href =
                `https://${process.env.NEXT_PUBLIC_CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/login` +
                `?redirect_url=${encodeURIComponent(window.location.href)}`;
            }}
          >
            Sign in with Cloudflare Access
          </button>
        </div>
      </div>
    );
  }

  // ── Authorized ──
  return children;
}

// ─── Inline styles (no extra CSS file needed) ────────────────────────────────
const styles = {
  center: {
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       '100vh',
    background:      '#0a0a0a',
    fontFamily:      'system-ui, sans-serif',
  },
  spinner: {
    width:           '40px',
    height:          '40px',
    border:          '3px solid #333',
    borderTop:       '3px solid #f97316',
    borderRadius:    '50%',
    animation:       'spin 0.8s linear infinite',
  },
  loadingText: {
    color:           '#888',
    marginTop:       '16px',
    fontSize:        '14px',
    letterSpacing:   '0.05em',
  },
  deniedCard: {
    background:      '#111',
    border:          '1px solid #222',
    borderRadius:    '12px',
    padding:         '48px 40px',
    textAlign:       'center',
    maxWidth:        '400px',
    width:           '90%',
  },
  lockIcon: {
    fontSize:        '48px',
    marginBottom:    '16px',
  },
  deniedTitle: {
    color:           '#fff',
    fontSize:        '24px',
    fontWeight:      '700',
    margin:          '0 0 12px',
  },
  deniedText: {
    color:           '#888',
    fontSize:        '14px',
    lineHeight:      '1.6',
    margin:          '0 0 28px',
  },
  loginBtn: {
    background:      '#f97316',
    color:           '#fff',
    border:          'none',
    borderRadius:    '8px',
    padding:         '12px 24px',
    fontSize:        '14px',
    fontWeight:      '600',
    cursor:          'pointer',
    width:           '100%',
  },
};