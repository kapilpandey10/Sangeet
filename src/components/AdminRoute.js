import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: user, error } = await supabase.auth.getUser();

      if (user && user.user_metadata.role === 'admin') {
        setIsAdmin(true);
      } else {
        navigate('/no-access');
      }
      setLoading(false);
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <div>No Access</div>;
};

export default AdminRoute;
