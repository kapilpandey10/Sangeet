import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../style/AdminLogin.css';  // Import the updated CSS

const AdminLogin = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);  // State to show success message
  const [forgotPassword, setForgotPassword] = useState(false);  // State to toggle forgot password mode
  const [isResetLoading, setIsResetLoading] = useState(false);
  const navigate = useNavigate();  // Hook to navigate to different routes

  // Handle admin login
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    setError('');  // Reset the error message before login

    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (loginError) {
      setError('Invalid login credentials. Please try again.');
      return;
    }

    // Fetch user role from the admin table
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

    // If login and role verification succeed
    setIsAuthenticated(true);
    setIsSuccess(true);

    // Navigate to the admin dashboard after a short delay
    setTimeout(() => {
      navigate('/admin');  // Navigate to admin dashboard
    }, 900);  // 0.9 seconds delay
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.REACT_APP_RESET_PASSWORD_URL || 'https://pandeykapil.com.np/reset-password',  // Adjust URL
    });

    setIsResetLoading(false);

    if (error) {
      setError("Failed to send password reset link. Please try again later.");
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
          <button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </>
      )}

      {forgotPassword && (
        <>
          <button onClick={handlePasswordReset} disabled={isResetLoading}>
            {isResetLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
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
