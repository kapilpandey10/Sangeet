import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/AdminLogin.css';
<title>Admin Login Pin</title>
const AdminLogin = ({ setIsAuthenticated }) => {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPin = process.env.REACT_APP_ADMIN_PIN; // Directly accessing the pin

    if (pin === adminPin) {
      setIsAuthenticated(true); // Set authentication to true
      navigate('/admin/lyrics'); // Redirect to the admin page
    } else {
      alert('Invalid PIN. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="pin">Enter Access PIN</label>
          <input
            type="password"
            id="pin"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
