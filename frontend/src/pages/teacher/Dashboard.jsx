import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

function Overview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="teacher-dashboard-title">Teacher Dashboard</h1>
      <Card>
        <CardContent className="p-6">
          <p>Welcome to your teacher dashboard. Your sections and students will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeacherDashboard({ user, onLogout }) {
  const menuItems = [
    { name: 'Dashboard', path: '/teacher', icon: 'LayoutDashboard' },
    { name: 'Profile', path: '/teacher/profile', icon: 'User' },
    { name: 'Sections', path: '/teacher/sections', icon: 'Users' },
    { name: 'Students', path: '/teacher/students', icon: 'GraduationCap' },
  ];

  return (
    <Layout user={user} onLogout={onLogout} menuItems={menuItems}>
      <Routes>
        <Route index element={<Overview />} />
      </Routes>
    </Layout>
  );
}
