import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../style/ForgotPassword.css';  // For forgot password styling

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',  // Change this to your actual redirect URL
    });

    if (error) {
      setError("If this email is registered, you will receive a reset link.");
    } else {
      setMessage("If this email is registered, you will receive a reset link.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>Forgot Password</h1>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handlePasswordReset}>Send Reset Link</button>
    </div>
  );
};

export default ForgotPassword;
