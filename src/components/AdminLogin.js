import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa'; // Importing icons
import '../style/AdminLogin.css';

const AdminLogin = ({ setIsAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false); // Toggle for showing/hiding PIN
  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false); // For success animation
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPin = process.env.REACT_APP_ADMIN_PIN; // Access the admin pin from .env

    if (pin === adminPin) {
      setIsAuthenticated(true);
      setIsLoginSuccessful(true); // Trigger success animation
      setTimeout(() => {
        navigate('/admin/lyrics'); // Redirect after the animation
      }, 2000); // 2 seconds delay to show the animation
    } else {
      alert('Invalid PIN. Please try again.');
    }
  };

  return (
    <div className="main-content">
      <div className={`admin-login-container ${isLoginSuccessful ? 'login-success' : ''}`}>
        {isLoginSuccessful ? (
          <div className="success-animation">
            <FaCheckCircle className="success-icon" />
            <h2>Login Successful!</h2>
          </div>
        ) : (
          <>
            <h1>Admin Login</h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="pin">Enter Access PIN</label>
                <div className="pin-input-wrapper">
                  <input
                    type={showPin ? 'text' : 'password'}
                    id="pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                  />
                  <span
                    className="toggle-pin-visibility"
                    onClick={() => setShowPin((prev) => !prev)}
                  >
                    {showPin ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>
              <button type="submit">Login</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
