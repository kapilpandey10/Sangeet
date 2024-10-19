import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/router';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './style/AdminLogin.module.css';  // Import the updated CSS

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);  
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Handle auth state locally
  const router = useRouter();  

  // Handle login process
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    setError(''); 

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

    // Set local auth state and navigate
    setIsAuthenticated(true);
    router.push('/Admin');
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.REACT_APP_RESET_PASSWORD_URL || 'https://pandeykapil.com.np/reset-password',
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
        router.push('/Admin');  // Redirect to admin dashboard
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.loginTitle}>{forgotPassword ? "Reset Password" : "Admin Login"}</h1>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <form onSubmit={(e) => { e.preventDefault(); forgotPassword ? handlePasswordReset() : handleLogin(); }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email"
            className={styles.inputField}
          />

          {!forgotPassword && (
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={styles.inputField}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ?   <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? <span className={styles.spinner}></span> : 'Login'}
          </button>

          <p
            className={styles.forgotPasswordLink}
            onClick={() => setForgotPassword(!forgotPassword)}
          >
            {forgotPassword ? "Back to Login" : "Forgot Password?"}
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
