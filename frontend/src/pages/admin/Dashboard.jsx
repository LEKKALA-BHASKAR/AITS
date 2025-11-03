import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Overview from './Overview';
import ManageStudents from './ManageStudents';
import ManageTeachers from './ManageTeachers';
import ManageDepartments from './ManageDepartments';
import Approvals from './Approvals';

export default function AdminDashboard({ user, onLogout }) {
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
    { name: 'Approvals', path: '/admin/approvals', icon: 'User' },
    { name: 'Students', path: '/admin/students', icon: 'GraduationCap' },
    { name: 'Teachers', path: '/admin/teachers', icon: 'Users' },
    { name: 'Departments', path: '/admin/departments', icon: 'Building' },
  ];

  return (
    <Layout user={user} onLogout={onLogout} menuItems={menuItems}>
      <Routes>
        <Route index element={<Overview user={user} />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="teachers" element={<ManageTeachers />} />
        <Route path="departments" element={<ManageDepartments />} />
      </Routes>
    </Layout>
  );
}
