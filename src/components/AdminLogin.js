import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../style/AdminLogin.css'; // Assuming you have the CSS ready

const AdminLogin = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('role')
      .ilike('email', sessionData.user.email)
      .single();

    if (adminError || !adminData) {
      setError("Failed to fetch user role or user not found.");
      setLoading(false);
      return;
    }

    if (adminData.role.toLowerCase() !== 'admin') {
      setError("Access denied: You are not an admin.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    navigate('/admin');
  };

  return (
    <div className="login-container">
      <h1>Admin Login</h1>
      {error && <p className="error-message">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter admin email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

export default AdminLogin;
