// File: src/components/ResetPassword.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client

const ResetPassword = () => {
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!resetToken || !newPassword) {
      setStatus('Please provide both the reset code and a new password.');
      return;
    }

    // Use the reset token (code) to update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      access_token: resetToken, // The reset token (code) from the email
    });

    if (error) {
      setStatus('Failed to reset password. Please try again.');
    } else {
      setStatus('Password reset successfully! You can now log in.');
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handlePasswordReset}>
        <label>Reset Code:</label>
        <input
          type="text"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          placeholder="Enter the reset code"
          required
        />

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
      {status && <p>{status}</p>}
    </div>
  );
};

export default ResetPassword;
