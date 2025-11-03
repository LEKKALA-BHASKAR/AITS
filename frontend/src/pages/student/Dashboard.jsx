import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Overview from './Overview';
import Profile from './Profile';
import Attendance from './Attendance';
import Results from './Results';
import Achievements from './Achievements';
import Remarks from './Remarks';

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
        <Route index element={<Overview user={user} />} />
        <Route path="profile" element={<Profile user={user} />} />
        <Route path="attendance" element={<Attendance user={user} />} />
        <Route path="results" element={<Results user={user} />} />
        <Route path="achievements" element={<Achievements user={user} />} />
        <Route path="remarks" element={<Remarks user={user} />} />
      </Routes>
    </Layout>
  );
}
