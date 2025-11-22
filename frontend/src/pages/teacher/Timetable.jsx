import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TeacherTimetable({ user }) {
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaySchedule();
    
    // Refresh every minute to update current period
    const interval = setInterval(fetchTodaySchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/timetable/teacher/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodaySchedule(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch today\'s schedule. Please try again later.';
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPeriod = (period) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= period.startTime && currentTime < period.endTime;
  };

  const isPastPeriod = (period) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= period.endTime;
  };

  const getTimeDisplay = (time) => {
    const [start, end] = time.split('-');
    return `${start}:00 - ${end}:00`;
  };

  const getDayName = (dayCode) => {
    const days = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday'
    };
    return days[dayCode] || dayCode;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading schedule...</div>;
  }

  const currentPeriod = todaySchedule?.periods?.find(isCurrentPeriod);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Teaching Schedule</h1>

      {/* Current Period Card */}
      {todaySchedule && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Clock className="w-5 h-5" />
              {currentPeriod ? 'Current Period' : 'No Class Right Now'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPeriod ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-900">{currentPeriod.subject}</p>
                    <p className="text-purple-700">{getTimeDisplay(currentPeriod.time)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-700">Section</p>
                    <p className="font-semibold text-purple-900 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {currentPeriod.section}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-purple-700">
                {todaySchedule.periods && todaySchedule.periods.length > 0
                  ? 'Free period - Next class starts soon'
                  : 'No classes scheduled for today'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Teaching Periods */}
      {todaySchedule && todaySchedule.periods && todaySchedule.periods.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Classes - {getDayName(todaySchedule.day)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.periods.map((period, idx) => {
                const isCurrent = isCurrentPeriod(period);
                const isPast = isPastPeriod(period);

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrent
                        ? 'bg-purple-50 border-purple-500 shadow-md'
                        : isPast
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-center ${isCurrent ? 'text-purple-600' : 'text-gray-600'}`}>
                          <Clock className="w-5 h-5 mx-auto mb-1" />
                          <p className="text-sm font-medium">{period.time}</p>
                        </div>
                        <div>
                          <p className={`font-semibold text-lg ${isCurrent ? 'text-purple-900' : 'text-gray-900'}`}>
                            {period.subject}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Section: {period.section}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                            NOW
                          </span>
                        </div>
                      )}
                      {isPast && (
                        <span className="px-3 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Total periods today:</strong> {todaySchedule.periods.length}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                You can mark attendance during class time or within 15 minutes after the period ends.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No classes scheduled for today</p>
            <p className="text-gray-500 text-sm mt-2">Enjoy your day off!</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {todaySchedule && todaySchedule.periods && todaySchedule.periods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(todaySchedule.periods.map(p => p.subject)).size}
                </p>
                <p className="text-sm text-gray-600">Unique Subjects</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(todaySchedule.periods.map(p => p.section)).size}
                </p>
                <p className="text-sm text-gray-600">Different Sections</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {todaySchedule.periods.length}
                </p>
                <p className="text-sm text-gray-600">Total Periods</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
