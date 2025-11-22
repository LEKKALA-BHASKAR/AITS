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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent" data-testid="admin-dashboard-title">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="total-students-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Students</CardTitle>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {stats?.totalStudents || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active students</p>
          </CardContent>
        </Card>

        <Card data-testid="total-teachers-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Teachers</CardTitle>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {stats?.totalTeachers || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active teachers</p>
          </CardContent>
        </Card>

        <Card data-testid="total-departments-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-900 dark:to-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Departments</CardTitle>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
              <Building className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
              {stats?.totalDepartments || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active departments</p>
          </CardContent>
        </Card>

        <Card data-testid="at-risk-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">At Risk Students</CardTitle>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats?.atRiskStudents || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-xl transition-shadow border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">System Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">Welcome to AITS Centralized Student Management System.</p>
          <ul className="space-y-2">
            {[
              'Manage all students, teachers, and departments',
              'Approve new user registrations',
              'Monitor student performance and attendance',
              'Track at-risk students for intervention'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mt-0.5">
                  <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
