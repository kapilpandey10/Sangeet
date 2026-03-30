// File location: pages/Admin/index.jsx
// This is your main admin page — it is protected by AdminRoute

import AdminRoute from '../pages/Admin/AdminRoute';
import AdminDashboard from '../pages/Admin/index';

const AdminPage = () => {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
};

export default AdminPage;
