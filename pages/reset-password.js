// File: pages/reset-password.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client
import { useRouter } from 'next/router'; // Use Next.js useRouter

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Next.js router

  // Extract the token from the URL when the user visits the page
  useEffect(() => {
    const { access_token } = router.query; // Extract the access_token from query params

    if (access_token) {
      // Supabase takes care of setting the session with the token
      supabase.auth.setSession(access_token)
        .then(({ error }) => {
          if (error) {
            setStatus('Invalid or expired reset token.');
          }
        });
    } else {
      // If no token is found, redirect or show an error message
      setStatus('Invalid or missing reset token.');
      router.push('/'); // Optionally redirect to home or an error page
    }
  }, [router.query]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setStatus('Please provide and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);

    // Use the token that was set in Supabase's session to update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setStatus('Failed to reset password: ' + error.message);
    } else {
      setStatus('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login'); // Redirect to login page after 2 seconds
      }, 2000);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {status && <p>{status}</p>}
      {status === '' && ( // Only show the form if there is no error status
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
      )}
    </div>
  );
};

export default ResetPassword;
