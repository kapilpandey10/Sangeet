// File location: pages/Admin/AdminRoute.js
// Checks Cloudflare Access JWT via /api/verify-admin before rendering children.
// On failure: redirects to the Cloudflare Access login page (not the homepage),
// so the user gets a login prompt instead of silently landing on /.

import { useEffect, useState } from 'react';

// Your Cloudflare Access login URL.
// When a user isn't authenticated, sending them here shows the CF login page.
// After they log in, Cloudflare redirects them back to the original URL.
const CF_LOGIN_URL = 'https://kapilpandey2068.cloudflareaccess.com/';

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
          // ── NOT authorized ──
          // Redirect to Cloudflare Access login page so the user can authenticate.
          // CF will redirect them back to /Admin after a successful login.
          window.location.href = `${CF_LOGIN_URL}?redirect_url=${encodeURIComponent(window.location.href)}`;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Network error — same redirect, let CF handle it.
        window.location.href = CF_LOGIN_URL;
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