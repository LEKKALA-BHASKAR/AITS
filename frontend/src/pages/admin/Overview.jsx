import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Building, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Overview({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="admin-dashboard-title">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="total-students-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-5 w-5 text-[#2563EB]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Active students</p>
          </CardContent>
        </Card>

        <Card data-testid="total-teachers-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-5 w-5 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{stats?.totalTeachers || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Active teachers</p>
          </CardContent>
        </Card>

        <Card data-testid="total-departments-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-5 w-5 text-[#FACC15]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{stats?.totalDepartments || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Active departments</p>
          </CardContent>
        </Card>

        <Card data-testid="at-risk-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#EF4444]">{stats?.atRiskStudents || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">Welcome to AITS Centralized Student Management System.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Manage all students, teachers, and departments</li>
            <li>Approve new user registrations</li>
            <li>Monitor student performance and attendance</li>
            <li>Track at-risk students for intervention</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
