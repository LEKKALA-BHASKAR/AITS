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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="student-dashboard-title">Welcome, {user.name}!</h1>
        <p className="text-gray-600 mt-1">Here's your academic overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="attendance-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-5 w-5 text-[#2563EB]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{calculateAttendance()}%</div>
            <p className="text-xs text-gray-600 mt-1">Overall attendance rate</p>
          </CardContent>
        </Card>

        <Card data-testid="backlogs-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Backlogs</CardTitle>
            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{profile?.backlogCount || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Pending subjects</p>
          </CardContent>
        </Card>

        <Card data-testid="results-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Results</CardTitle>
            <GraduationCap className="h-5 w-5 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{profile?.results?.length || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Total exams</p>
          </CardContent>
        </Card>

        <Card data-testid="achievements-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-5 w-5 text-[#FACC15]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{profile?.achievements?.length || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Total achievements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Roll Number:</span>
              <span className="font-semibold">{profile?.rollNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-semibold">{profile?.departmentId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Section:</span>
              <span className="font-semibold">{profile?.sectionId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${profile?.atRisk ? 'text-red-600' : 'text-green-600'}`}>
                {profile?.atRisk ? 'At Risk' : 'Good Standing'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-60 overflow-y-auto">
            {notifications.slice(0, 3).map((notif, idx) => (
              <div key={idx} className="border-l-4 border-[#2563EB] bg-blue-50 p-3 rounded">
                <h4 className="font-semibold text-sm">{notif.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-gray-600 text-sm">No notifications</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
