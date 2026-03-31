// File location: pages/Admin/index.jsx
// Thin wrapper — protects the dashboard behind Cloudflare Access verification.

import AdminRoute from './AdminRoute';
import AdminDashboard from './AdminDashboard';

const AdminPage = () => {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
};

export default AdminPage;