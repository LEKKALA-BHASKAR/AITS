import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Overview from './Overview';
import Profile from './Profile';
import Sections from './Sections';
import Students from './Students';

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
        <Route index element={<Overview user={user} />} />
        <Route path="profile" element={<Profile user={user} />} />
        <Route path="sections" element={<Sections user={user} />} />
        <Route path="students" element={<Students user={user} />} />
      </Routes>
    </Layout>
  );
}
