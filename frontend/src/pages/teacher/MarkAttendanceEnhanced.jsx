import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

/**
 * Enhanced Mark Attendance Component
 * With real-time countdown timer and period detection
 */
export default function MarkAttendanceEnhanced() {
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [upcomingPeriods, setUpcomingPeriods] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    fetchCurrentPeriod();
    fetchTodaySchedule();
    
    // Refresh every minute
    const interval = setInterval(() => {
      fetchCurrentPeriod();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update countdown every second
    if (currentPeriod && currentPeriod.length > 0) {
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentPeriod]);

  const fetchCurrentPeriod = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/attendance-v2/current-period`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPeriod(response.data.current);
      setUpcomingPeriods(response.data.upcoming);
    } catch (err) {
      console.error('Error fetching current period:', err);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/attendance-v2/today-schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodaySchedule(response.data.schedule);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  const updateCountdown = () => {
    if (!currentPeriod || currentPeriod.length === 0) return;
    
    const period = currentPeriod[0];
    const now = new Date();
    const [endHour, endMinute] = period.endTime.split(':').map(Number);
    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const diff = endTime - now;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    setCountdown({ minutes, seconds });
  };

  const selectPeriod = async (period) => {
    setSelectedPeriod(period);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/section/${period.sectionId._id || period.sectionId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(response.data.students || []);
      
      // Initialize attendance state
      const initialAttendance = {};
      (response.data.students || []).forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const markAllPresent = () => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = 'present';
    });
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = 'absent';
    });
    setAttendance(newAttendance);
  };

  const submitAttendance = async () => {
    if (!selectedPeriod) {
      toast.error('Please select a period');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const studentsList = students.map(student => ({
        studentId: student._id,
        status: attendance[student._id] || 'present'
      }));

      await axios.post(
        `${API_URL}/attendance-v2/mark-enhanced`,
        {
          sectionId: selectedPeriod.sectionId._id || selectedPeriod.sectionId,
          subject: selectedPeriod.subject,
          time: selectedPeriod.time,
          students: studentsList
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Attendance marked successfully!');
      setSelectedPeriod(null);
      setStudents([]);
      setAttendance({});
      fetchCurrentPeriod();
      fetchTodaySchedule();
    } catch (err) {
      console.error('Error marking attendance:', err);
      toast.error(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const attendancePercentage = students.length > 0 ? (presentCount / students.length) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mark Attendance</h1>
          <p className="text-gray-600 mt-1">Real-time period tracking with countdown</p>
        </div>
      </div>

      {/* Current Period Alert */}
      {currentPeriod && currentPeriod.length > 0 && (
        <Card className="border-l-4 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">
                  Class In Progress
                </h3>
                <div className="mt-2 space-y-2">
                  {currentPeriod.map((period, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{period.subject} - {period.section}</p>
                        <p className="text-sm text-green-700">{period.time} | {period.startTime} - {period.endTime}</p>
                      </div>
                      {countdown && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-green-600">Time Remaining</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {!selectedPeriod && currentPeriod[0]?.canMarkAttendance && (
                  <Button 
                    onClick={() => selectPeriod(currentPeriod[0])}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Attendance Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Periods */}
      {upcomingPeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPeriods.map((period, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">{period.subject} - {period.section}</p>
                    <p className="text-sm text-gray-600">{period.time} | {period.startTime} - {period.endTime}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    In {period.minutesUntilStart} min
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySchedule.length > 0 ? (
            <div className="space-y-2">
              {todaySchedule.map((period, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    period.isMarked ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{period.subject} - {period.section}</p>
                    <p className="text-sm text-gray-600">{period.time} | {period.startTime} - {period.endTime}</p>
                  </div>
                  {period.isMarked ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Marked
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectPeriod(period)}
                      disabled={loading}
                    >
                      Mark Attendance
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No classes scheduled for today</p>
          )}
        </CardContent>
      </Card>

      {/* Mark Attendance Form */}
      {selectedPeriod && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>
              Mark Attendance: {selectedPeriod.subject} - {selectedPeriod.section}
            </CardTitle>
            <CardDescription>
              {selectedPeriod.time} | {selectedPeriod.startTime} - {selectedPeriod.endTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                    <div className="text-sm text-gray-600">Absent</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Attendance</span>
                    <span className="text-sm font-bold text-blue-600">{attendancePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={attendancePercentage} className="h-3" />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={markAllPresent} size="sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    All Present
                  </Button>
                  <Button variant="outline" onClick={markAllAbsent} size="sm">
                    <XCircle className="w-4 h-4 mr-2" />
                    All Absent
                  </Button>
                </div>

                {/* Student List */}
                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {students.map((student, idx) => (
                    <div key={student._id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-8">{idx + 1}.</span>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={attendance[student._id] === 'present' ? 'default' : 'outline'}
                          onClick={() => setAttendance(prev => ({ ...prev, [student._id]: 'present' }))}
                          className={attendance[student._id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student._id] === 'absent' ? 'default' : 'outline'}
                          onClick={() => setAttendance(prev => ({ ...prev, [student._id]: 'absent' }))}
                          className={attendance[student._id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <Button onClick={submitAttendance} className="flex-1" disabled={loading}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Attendance
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedPeriod(null);
                    setStudents([]);
                    setAttendance({});
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
