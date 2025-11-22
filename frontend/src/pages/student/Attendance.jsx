import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Attendance({ user }) {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchAttendance();
      fetchStats();
    }
  }, [user]);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      // Try new API first, fallback to old one
      try {
        const response = await axios.get(`${API}/attendance/student/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(response.data);
      } catch (err) {
        // Fallback to old embedded attendance
        const response = await axios.get(`${API}/student/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API}/attendance/student/${user._id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        // Fallback to old stats endpoint
        const response = await axios.get(`${API}/student/attendance/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({ overall: response.data, bySubject: [] });
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const calculateSubjectAttendance = (subject) => {
    const subjectRecords = attendance.filter(a => a.subject === subject);
    if (subjectRecords.length === 0) return { percentage: 0, present: 0, total: 0 };
    const present = subjectRecords.filter(a => a.status === 'present').length;
    return {
      percentage: ((present / subjectRecords.length) * 100).toFixed(1),
      present,
      total: subjectRecords.length
    };
  };

  const uniqueSubjects = [...new Set(attendance.map(a => a.subject))];

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="attendance-title">Attendance</h1>

      {/* Overall Stats */}
      {stats?.overall && (
        <Card className={`border-2 ${stats.overall.lowAttendanceWarning ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-5xl font-bold ${parseFloat(stats.overall.percentage) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.overall.percentage}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.overall.presentCount} / {stats.overall.totalClasses} classes attended
                </p>
              </div>
              {stats.overall.lowAttendanceWarning && (
                <div className="text-red-600 text-sm">
                  ⚠️ Below 75% - Attendance required!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject-wise Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats?.bySubject && stats.bySubject.length > 0 ? (
          // Use stats from new API if available
          stats.bySubject.map((subjectStat, idx) => (
            <Card key={idx} data-testid={`subject-card-${idx}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{subjectStat.subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold mb-2 ${parseFloat(subjectStat.percentage) >= 75 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {subjectStat.percentage}%
                </div>
                <p className="text-sm text-gray-600">
                  {subjectStat.present} / {subjectStat.total} classes attended
                </p>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${parseFloat(subjectStat.percentage) >= 75 ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                    style={{ width: `${subjectStat.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Fallback to calculated subject stats
          uniqueSubjects.map((subject, idx) => {
            const stats = calculateSubjectAttendance(subject);
            return (
              <Card key={idx} data-testid={`subject-card-${idx}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold mb-2 ${parseFloat(stats.percentage) >= 75 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {stats.percentage}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats.present} / {stats.total} classes attended
                  </p>
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${parseFloat(stats.percentage) >= 75 ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {attendance.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No attendance records found</p>
          </CardContent>
        </Card>
      )}

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {attendance.slice().reverse().map((record, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{record.subject}</p>
                  <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
