import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

function Overview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="admin-dashboard-title">Admin Dashboard</h1>
      <Card>
        <CardContent className="p-6">
          <p>Welcome to the admin dashboard. System statistics and management options will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }) {
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
    { name: 'Students', path: '/admin/students', icon: 'GraduationCap' },
    { name: 'Teachers', path: '/admin/teachers', icon: 'Users' },
    { name: 'Departments', path: '/admin/departments', icon: 'Building' },
  ];

  return (
    <Layout user={user} onLogout={onLogout} menuItems={menuItems}>
      <Routes>
        <Route index element={<Overview />} />
      </Routes>
    </Layout>
  );
}
