import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, GraduationCap, AlertTriangle, Award } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Overview({ user }) {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [profileRes, notifRes] = await Promise.all([
        axios.get(`${API}/student/profile`, { headers: { Authorization: `Bearer ${token}` }}),
        axios.get(`${API}/student/notifications`, { headers: { Authorization: `Bearer ${token}` }})
      ]);
      setProfile(profileRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendance = () => {
    if (!profile?.attendance || profile.attendance.length === 0) return 0;
    const present = profile.attendance.filter(a => a.status === 'present').length;
    return ((present / profile.attendance.length) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent" data-testid="student-dashboard-title">
          Welcome, {user.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your academic overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="attendance-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance</CardTitle>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {calculateAttendance()}%
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall attendance rate</p>
          </CardContent>
        </Card>

        <Card data-testid="backlogs-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Backlogs</CardTitle>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
              {profile?.backlogCount || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pending subjects</p>
          </CardContent>
        </Card>

        <Card data-testid="results-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Results</CardTitle>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {profile?.results?.length || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total exams</p>
          </CardContent>
        </Card>

        <Card data-testid="achievements-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-900 dark:to-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievements</CardTitle>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
              {profile?.achievements?.length || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total achievements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-xl transition-shadow border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-gray-600 dark:text-gray-400">Roll Number:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{profile?.rollNumber}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-gray-600 dark:text-gray-400">Department:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{profile?.departmentId?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-gray-600 dark:text-gray-400">Section:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{profile?.sectionId?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-semibold ${profile?.atRisk ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {profile?.atRisk ? 'At Risk' : 'Good Standing'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-60 overflow-y-auto">
            {notifications.slice(0, 3).map((notif, idx) => (
              <div key={idx} className="border-l-4 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-r-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{notif.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 text-sm">No notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
