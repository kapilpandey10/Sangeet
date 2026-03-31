// File location: pages/Admin/AdminRoute.js
// Checks Cloudflare Access JWT via /api/verify-admin before rendering children.
//
// HOW CF ACCESS WORKS:
// - Cloudflare Access sits in FRONT of your site at the network edge.
// - When an unauthenticated user hits /Admin, CF intercepts it and shows
//   its own login page BEFORE your Next.js code ever runs.
// - After login, CF sets the CF_Authorization cookie and lets the request
//   through to your app — at which point verify-admin succeeds.
//
// This means AdminRoute should only ever run for:
//   (a) authenticated users  → show the dashboard
//   (b) users on localhost   → CF is bypassed, verify-admin returns false
//
// In case (b) we do a hard reload of the same URL so CF can intercept it
// on the live domain. On localhost you'll need to test with a real session
// cookie copied from the live site, or bypass the guard for local dev.

import { useEffect, useState } from 'react';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized'

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res  = await fetch('/api/verify-admin');
        const data = await res.json();

        if (data.authorized) {
          setStatus('authorized');
        } else {
          // Not authorized — this should rarely happen on the live site because
          // Cloudflare Access blocks unauthenticated requests before they reach
          // Next.js. If it does happen (e.g. expired token), reload the current
          // URL so Cloudflare can intercept it and show the login page.
          window.location.reload();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        window.location.reload();
      }
    };

    checkAccess();
  }, []);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#07080f',
        fontFamily:     "'JetBrains Mono', monospace",
        fontSize:       '13px',
        color:          'rgba(255,255,255,0.35)',
        letterSpacing:  '2px',
        gap:            '12px',
      }}>
        <span style={{
          width:          '16px',
          height:         '16px',
          border:         '2px solid rgba(0,229,200,0.2)',
          borderTopColor: '#00e5c8',
          borderRadius:   '50%',
          animation:      'spin 0.65s linear infinite',
          display:        'inline-block',
        }} />
        INITIALIZING COMMAND CENTER…
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return status === 'authorized' ? <>{children}</> : null;
};

export default AdminRoute;