import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../style/ResetPassword.css';   // For reset password styling

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordUpdate = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Failed to reset password.");
    } else {
      setMessage("Password updated successfully.");
    }
  };

  return (
    <div className="reset-password-container">
      <h1>Reset Password</h1>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm New Password"
      />
      <button onClick={handlePasswordUpdate}>Update Password</button>
    </div>
  );
};

export default ResetPassword;
