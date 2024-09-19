// File: src/components/RequestResetCode.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client

const RequestResetCode = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading
    setStatus(''); // Clear any previous status

    // Send reset email with token to user's email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: null, // No redirect; handle manually in the reset flow
    });

    setLoading(false); // Stop loading

    if (error) {
      setStatus('Failed to send reset email with link. Please try again later.');
    } else {
      setStatus('A reset link has been sent to your email.');
    }
  };

  return (
    <div>
      <h1>Request Password Reset</h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading} // Disable input during loading
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default RequestResetCode;
