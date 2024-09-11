import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation and getting query params

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token'); // Supabase uses 'access_token' as the reset token

    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [location.search]);

  const handlePasswordReset = async () => {
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    const { error: resetError } = await supabase.auth.updateUser({
      access_token: token,  // Use the token to reset the password
      password: newPassword,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login'); // Redirect to login after success
      }, 2000);
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      {success ? (
        <p>Password reset successful. Redirecting to login...</p>
      ) : (
        <div>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordReset}>Reset Password</button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
