// File: src/components/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [resetToken, setResetToken] = useState(null); // Store token here, but don't display it
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Extract the token from the URL when the user visits the page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (token) {
      setResetToken(token); // Set token from URL in the state
    } else {
      setStatus('Invalid or missing reset token.');
    }
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!resetToken || !newPassword || !confirmPassword) {
      setStatus('Please provide and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);

    // Use the token from the URL to update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      access_token: resetToken, // Automatically uses token from URL
    });

    setLoading(false);

    if (error) {
      setStatus('Failed to reset password: ' + error.message);
    } else {
      setStatus('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after 2 seconds
      }, 2000);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {status && <p>{status}</p>}
      <form onSubmit={handlePasswordReset}>
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
          required
          disabled={loading}
        />

        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
