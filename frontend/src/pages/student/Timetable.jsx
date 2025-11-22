import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Clock, BookOpen, User } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StudentTimetable({ user }) {
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [fullTimetable, setFullTimetable] = useState(null);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.sectionId?.name) {
      fetchTodaySchedule();
      fetchFullTimetable();
      
      // Update current slot every minute
      const interval = setInterval(() => {
        updateCurrentSlot();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchTodaySchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const sectionName = user.sectionId.name;
      const response = await axios.get(`${API}/timetable/today/${sectionName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodaySchedule(response.data);
      updateCurrentSlot(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch today\'s schedule');
      }
    }
  };

  const fetchFullTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      const sectionName = user.sectionId.name;
      const response = await axios.get(`${API}/timetable/section/${sectionName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFullTimetable(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch timetable');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentSlot = (schedule = todaySchedule) => {
    if (!schedule?.schedule) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const current = schedule.schedule.find(slot => 
      currentTime >= slot.startTime && currentTime < slot.endTime
    );

    setCurrentSlot(current || null);
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

  const getTimeDisplay = (time) => {
    const [start, end] = time.split('-');
    return `${start}:00 - ${end}:00`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading timetable...</div>;
  }

  if (!fullTimetable && !todaySchedule) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No timetable available for your section</p>
          <p className="text-gray-500 text-sm mt-2">Please contact your HOD to upload the timetable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>

      {/* Current Class Card */}
      {todaySchedule && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="w-5 h-5" />
              {currentSlot ? 'Current Class' : 'No Class Right Now'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSlot ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{currentSlot.subject}</p>
                    <p className="text-blue-700">{getTimeDisplay(currentSlot.time)}</p>
                  </div>
                  {currentSlot.teacher && (
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Teacher</p>
                      <p className="font-semibold text-blue-900">{currentSlot.teacher.name}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-blue-700">Enjoy your break! Next class starts soon.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      {todaySchedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule - {getDayName(todaySchedule.day)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.schedule && todaySchedule.schedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.schedule.map((slot, idx) => {
                  const isCurrent = currentSlot?.time === slot.time;
                  const now = new Date();
                  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  const isPast = currentTime > slot.endTime;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-500 shadow-md'
                          : isPast
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-center ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                            <Clock className="w-5 h-5 mx-auto mb-1" />
                            <p className="text-sm font-medium">{slot.time}</p>
                          </div>
                          <div>
                            <p className={`font-semibold text-lg ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                              {slot.subject}
                            </p>
                            {slot.teacher && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {slot.teacher.name}
                              </p>
                            )}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                            NOW
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No classes scheduled for today</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weekly Timetable */}
      {fullTimetable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Weekly Timetable - {fullTimetable.section}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left font-semibold">Time</th>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => (
                      <th key={day} className="border p-3 text-center font-semibold">
                        {getDayName(day)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Get all unique time slots */}
                  {(() => {
                    const allSlots = new Set();
                    ['MON', 'TUE', 'WED', 'THU', 'FRI'].forEach(day => {
                      if (fullTimetable.schedule[day]) {
                        fullTimetable.schedule[day].forEach(slot => allSlots.add(slot.time));
                      }
                    });
                    
                    return Array.from(allSlots).sort().map(time => (
                      <tr key={time}>
                        <td className="border p-3 font-medium text-gray-700 whitespace-nowrap">
                          {getTimeDisplay(time)}
                        </td>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => {
                          const slot = fullTimetable.schedule[day]?.find(s => s.time === time);
                          return (
                            <td key={day} className={`border p-3 text-center ${slot ? 'bg-blue-50' : 'bg-gray-50'}`}>
                              {slot ? (
                                <div>
                                  <p className="font-semibold text-blue-900">{slot.subject}</p>
                                  {slot.teacher && (
                                    <p className="text-xs text-blue-700 mt-1">{slot.teacher.name}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
