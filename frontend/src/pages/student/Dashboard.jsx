import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

function Overview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="student-dashboard-title">Student Dashboard</h1>
      <Card>
        <CardContent className="p-6">
          <p>Welcome to your student dashboard. Your profile and data will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentDashboard({ user, onLogout }) {
  const menuItems = [
    { name: 'Dashboard', path: '/student', icon: 'LayoutDashboard' },
    { name: 'Profile', path: '/student/profile', icon: 'User' },
    { name: 'Attendance', path: '/student/attendance', icon: 'Calendar' },
    { name: 'Results', path: '/student/results', icon: 'FileText' },
    { name: 'Achievements', path: '/student/achievements', icon: 'Award' },
    { name: 'Remarks', path: '/student/remarks', icon: 'MessageSquare' },
  ];

  return (
    <Layout user={user} onLogout={onLogout} menuItems={menuItems}>
      <Routes>
        <Route index element={<Overview />} />
      </Routes>
    </Layout>
  );
}
