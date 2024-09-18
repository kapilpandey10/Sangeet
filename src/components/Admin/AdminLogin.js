import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import './style/AdminLogin.css';  // Import the updated CSS

const AdminLogin = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to show/hide password
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);  // State to toggle forgot password mode
  const [isResetLoading, setIsResetLoading] = useState(false);
  const navigate = useNavigate();  // Hook to navigate to different routes

  // Handle login process
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

    if (!sessionData || !sessionData.user) {
      setError('An unexpected error occurred. Please try again.');
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
      await supabase.auth.signOut();
      return;
    }

    if (adminData.role.toLowerCase() !== 'admin') {
      setError("Access denied: You are not an admin.");
      await supabase.auth.signOut();
      return;
    }

    // If login and role verification succeed
    setIsAuthenticated(true);

    // Navigate to the admin dashboard
    navigate('/admin');
  };

  // Logout the user
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/1234/secret');  // Redirect to the login page
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

  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);  // User is already logged in
        navigate('/admin');  // Redirect to admin dashboard
      }
    };
    checkSession();
  }, [navigate, setIsAuthenticated]);

  return (
    <div className="login-container">
      <h1>{forgotPassword ? "Reset Password" : "Admin Login"}</h1>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); forgotPassword ? handlePasswordReset() : handleLogin(); }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter admin email"
        />

        {!forgotPassword && (
          <>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'} // Toggle password visibility
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button" // Use button to avoid form submission
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : 'Login'}
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
      </form>
    </div>
  );
};

export default AdminLogin;
