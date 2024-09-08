import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../style/AdminLogin.css';  // Import the updated CSS

const AdminLogin = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);  // State to show success message
  const [forgotPassword, setForgotPassword] = useState(false);  // State to toggle forgot password mode
  const navigate = useNavigate();  // Hook to navigate to different routes

  // Handle admin login
  const handleLogin = async () => {
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('role')
      .ilike('email', sessionData.user.email)
      .single();

    if (adminError || !adminData) {
      setError("Failed to fetch user role or user not found.");
      return;
    }

    if (adminData.role.toLowerCase() !== 'admin') {
      setError("Access denied: You are not an admin.");
      await supabase.auth.signOut();
      return;
    }

    // Show success message and navigate to dashboard
    setIsAuthenticated(true);
    setIsSuccess(true);

    setTimeout(() => {
      navigate('/admin');  // Navigate to admin dashboard
    }, 900);  // 0.9 seconds delay
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',  // Change this to your actual reset password page URL
    });

    if (error) {
      setError("If this email is registered, you will receive a reset link.");
    } else {
      setError("If this email is registered, you will receive a reset link.");
    }
  };

  return (
    <div className="login-container">
      <h1>{forgotPassword ? "Reset Password" : "Admin Login"}</h1>
      {error && <p className="error-message">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter admin email"
      />

      {!forgotPassword && (
        <>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button onClick={handleLogin}>Login</button>
        </>
      )}

      {forgotPassword && (
        <>
          <button onClick={handlePasswordReset}>Send Reset Link</button>
        </>
      )}

      {!forgotPassword ? (
        <p className="forgot-password-link" onClick={() => setForgotPassword(true)}>
          Forgot Password?
        </p>
      ) : (
        <p className="forgot-password-link" onClick={() => setForgotPassword(false)}>
          Back to Login
        </p>
      )}
    </div>
  );
};

export default AdminLogin;
