// File: src/components/RequestResetCode.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client

const RequestResetCode = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send reset email with token to user's email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: null, // No redirect; handle manually
    });

    if (error) {
      setStatus('Failed to send reset code. Please try again.');
    } else {
      setStatus('Reset code sent to your email.');
    }
  };

  return (
    <div>
      <h1>Request Password Reset Code</h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Send Reset Code</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default RequestResetCode;
