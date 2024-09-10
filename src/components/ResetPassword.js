import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token'); // Get the access token from the URL

  const handlePasswordReset = async () => {
    if (!accessToken) {
      setError('Invalid or missing reset token.');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      accessToken,  // Use the token provided in the URL
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Your password has been reset successfully.');
    }
  };

  return (
    <div className="reset-password-container">
      <h1>Reset Password</h1>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter your new password"
      />
      <button onClick={handlePasswordReset}>Reset Password</button>
    </div>
  );
};

export default ResetPassword;
