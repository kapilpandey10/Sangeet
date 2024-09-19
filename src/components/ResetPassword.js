// File: src/components/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();

  // Extract the token from the URL when the user visits the page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (token) {
      setResetToken(token);
    } else {
      setStatus('Invalid or missing reset token.');
    }
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!resetToken || !newPassword) {
      setStatus('Please provide a new password.');
      return;
    }

    // Use the token from the URL to update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      access_token: resetToken, // Automatically uses token from URL
    });

    if (error) {
      setStatus('Failed to reset password: ' + error.message);
    } else {
      setStatus('Password reset successfully! You can now log in.');
      navigate('/login'); // Redirect to login page after successful reset
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
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
