import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Fixed: Use Next.js router
import { supabase } from '../../supabaseClient';

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // 1. Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/Admin/AdminLogin');
        return;
      }

      // 2. Verify role against your 'admin' database table for extra security
      const { data: adminData } = await supabase
        .from('admin')
        .select('role')
        .ilike('email', user.email)
        .single();

      if (adminData && adminData.role.toLowerCase() === 'admin') {
        setIsAdmin(true);
      } else {
        router.push('/404'); // Stealth security: redirect unauthorized to 404
      }
      setLoading(false);
    };

    checkAdminAccess();
  }, [router]);

  if (loading) return <div className="admin-loader">Initializing Command Center...</div>;

  return isAdmin ? <>{children}</> : null;
};

export default AdminRoute;