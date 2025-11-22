import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import Overview from './Overview';
import Profile from './Profile';
import Attendance from './Attendance';
import Results from './Results';
import Achievements from './Achievements';
import Remarks from './Remarks';
import Notifications from './Notifications';
import SupportTickets from './SupportTickets';
import Timetable from './Timetable';
import Student360Profile from '../Student360Profile';

export default function StudentDashboard({ user, onLogout }) {
  const menuItems = [
    { name: 'Dashboard', path: '/student', icon: 'LayoutDashboard' },
    { name: 'Profile', path: '/student/profile', icon: 'User' },
    { name: '360° View', path: `/student/360-profile/${user.id}`, icon: 'Activity' },
    { name: 'Attendance', path: '/student/attendance', icon: 'Calendar' },
    { name: 'Results', path: '/student/results', icon: 'FileText' },
    { name: 'Achievements', path: '/student/achievements', icon: 'Award' },
    { name: 'Remarks', path: '/student/remarks', icon: 'MessageSquare' },
    { name: 'Notifications', path: '/student/notifications', icon: 'Bell' },
    { name: 'Support', path: '/student/support', icon: 'MessageSquare' },
    { name: 'Timetable', path: '/student/timetable', icon: 'Calendar' },
  ];

  return (
    <Layout user={user} onLogout={onLogout} menuItems={menuItems}>
      <Routes>
        <Route index element={<Overview user={user} />} />
        <Route path="profile" element={<Profile user={user} />} />
        <Route path="360-profile/:studentId" element={<Student360Profile />} />
        <Route path="attendance" element={<Attendance user={user} />} />
        <Route path="results" element={<Results user={user} />} />
        <Route path="achievements" element={<Achievements user={user} />} />
        <Route path="remarks" element={<Remarks user={user} />} />
        <Route path="notifications" element={<Notifications user={user} />} />
        <Route path="support" element={<SupportTickets user={user} />} />
        <Route path="timetable" element={<Timetable user={user} />} />
      </Routes>
    </Layout>
  );
}
