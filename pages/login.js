// File location: pages/Admin/index.jsx
// Thin wrapper — protects the dashboard behind Cloudflare Access verification.

import AdminRoute from './Admin/AdminRoute';
import AdminDashboard from './Admin/index';

const AdminPage = () => {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
};

export default AdminPage;