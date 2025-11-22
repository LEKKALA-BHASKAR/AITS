import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import Overview from './Overview';
import ManageStudents from './ManageStudents';
import ManageTeachers from './ManageTeachers';
import ManageDepartments from './ManageDepartments';
import ManageSections from './ManageSections';
import Approvals from './Approvals';
import Analytics from './Analytics';
import CreateNotification from './CreateNotification';
import TimetableUpload from './TimetableUpload';
import Student360Profile from '../Student360Profile';
import RemarksManagement from '../RemarksManagement';

export default function AdminDashboard({ user, onLogout }) {
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
    { name: 'Approvals', path: '/admin/approvals', icon: 'User' },
    { name: 'Students', path: '/admin/students', icon: 'GraduationCap' },
    { name: 'Teachers', path: '/admin/teachers', icon: 'Users' },
    { name: 'Departments', path: '/admin/departments', icon: 'Building' },
    { name: 'Sections', path: '/admin/sections', icon: 'Users' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'BarChart' },
    { name: 'Notifications', path: '/admin/notifications', icon: 'Bell' },
    { name: 'Timetable', path: '/admin/timetable', icon: 'Calendar' },
  ];

  return (
    <Layout user={user} onLogout={onLogout} menuItems={menuItems}>
      <Routes>
        <Route index element={<Overview user={user} />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="students/:studentId/profile" element={<Student360Profile />} />
        <Route path="students/:studentId/remarks" element={<RemarksManagement />} />
        <Route path="teachers" element={<ManageTeachers />} />
        <Route path="departments" element={<ManageDepartments />} />
        <Route path="sections" element={<ManageSections />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<CreateNotification />} />
        <Route path="timetable" element={<TimetableUpload />} />
      </Routes>
    </Layout>
  );
}
