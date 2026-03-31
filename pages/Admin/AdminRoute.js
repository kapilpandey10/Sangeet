// File location: pages/Admin/AdminRoute.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'unauthorized'
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch('/api/verify-admin');
        const data = await res.json();

        if (data.authorized) {
          setStatus('authorized');
        } else {
          // KICK UNAUTHORIZED USERS TO THE HOME PAGE TO PREVENT INFINITE LOOPS
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        window.location.href = '/';
      }
    };

    checkAccess();
  }, []);

  // Show a loading screen while checking the token
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07080f',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '2px',
        gap: '12px',
      }}>
        <span style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(0,229,200,0.2)',
          borderTopColor: '#00e5c8',
          borderRadius: '50%',
          animation: 'spin 0.65s linear infinite',
          display: 'inline-block',
        }} />
        INITIALIZING COMMAND CENTER…
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // Only render children if authorized
  return status === 'authorized' ? <>{children}</> : null;
};

export default AdminRoute;