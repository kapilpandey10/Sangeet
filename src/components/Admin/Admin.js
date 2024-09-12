import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './style/Admin.css'; // Create this file for styling

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch all admins from the Supabase auth system
    const fetchAdmins = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('user_roles').select('*').eq('role', 'admin');
      if (error) {
        setErrorMessage('Failed to load admin users');
      } else {
        setAdmins(data);
      }
      setLoading(false);
    };
    fetchAdmins();
  }, []);

  // Add a new admin
  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      setErrorMessage('Please enter an email');
      return;
    }
    setLoading(true);

    // Create a user in Supabase Auth but don't set a password
    const { data, error } = await supabase.auth.admin.createUser({
      email: newAdminEmail,
      email_confirm: true, // Force the email to be confirmed automatically
    });

    if (error) {
      setErrorMessage('Error adding admin: ' + error.message);
    } else {
      // Send a password reset link to the new admin so they can create a password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(newAdminEmail);

      if (resetError) {
        setErrorMessage('Error sending password reset email: ' + resetError.message);
      } else {
        // After creating the user, set the role to "admin"
        const { error: roleError } = await supabase.from('user_roles').insert([
          { email: newAdminEmail, role: 'admin' },
        ]);

        if (roleError) {
          setErrorMessage('Failed to assign admin role: ' + roleError.message);
        } else {
          setSuccessMessage(`Admin ${newAdminEmail} added successfully. An email has been sent to set the password.`);
          setNewAdminEmail(''); // Reset input field
          const updatedAdmins = await supabase.from('user_roles').select('*').eq('role', 'admin');
          setAdmins(updatedAdmins.data); // Refresh the admin list
        }
      }
    }

    setLoading(false);
  };
  const addAdminUser = async (email) => {
    try {
      // Add user and assign the role of 'super-admin'
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Automatically confirm the email
        user_metadata: {
          role: 'super-admin', // Assign the 'super-admin' role in user metadata
        },
      });
  
      if (error) {
        console.error("Error adding admin user:", error.message);
        return;
      }
  
      console.log("Admin user added successfully:", data);
      
      // Send a password reset link to allow the user to set their password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.REACT_APP_RESET_PASSWORD_URL || 'https://pandeykapil.com.np/reset-password', // Adjust your URL accordingly
      });
  
      if (resetError) {
        console.error("Error sending password reset email:", resetError.message);
      } else {
        console.log(`Password reset link sent to ${email}.`);
      }
    } catch (err) {
      console.error("Unexpected error occurred:", err.message);
    }
  };
  
  // Delete an admin
  const handleDeleteAdmin = async (adminEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${adminEmail} as an admin?`)) return;

    setLoading(true);
    const { error: roleError } = await supabase.from('user_roles').delete().eq('email', adminEmail);
    if (roleError) {
      setErrorMessage('Failed to delete admin: ' + roleError.message);
    } else {
      // Optionally, you could also disable or delete the user from Supabase Auth
      const { error: authError } = await supabase.auth.api.deleteUserByEmail(adminEmail);
      if (authError) {
        setErrorMessage('Failed to delete admin from Auth: ' + authError.message);
      } else {
        setSuccessMessage(`Admin ${adminEmail} removed successfully`);
        setAdmins(admins.filter((admin) => admin.email !== adminEmail)); // Remove from state
      }
    }
    setLoading(false);
  };

  return (
    <div className="admin-container">
      <h2>Manage Admins</h2>

      {loading && <p>Loading...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="admin-form">
        <input
          type="email"
          placeholder="Enter new admin email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
        />
        <button onClick={handleAddAdmin} disabled={loading}>
          Add Admin
        </button>
      </div>

      <h3>Existing Admins</h3>
      <ul className="admin-list">
        {admins.map((admin) => (
          <li key={admin.email}>
            {admin.email}
            <button onClick={() => handleDeleteAdmin(admin.email)} className="delete-btn" disabled={loading}>
              Remove Admin
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
