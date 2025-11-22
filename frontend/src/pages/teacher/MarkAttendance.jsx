import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MarkAttendance({ user }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [currentSlot, setCurrentSlot] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchCurrentSlot();
      fetchStudents();
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/teacher/sections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(response.data);
      
      if (response.data.length > 0) {
        setSelectedSection(response.data[0].name);
      }
    } catch (error) {
      toast.error('Failed to fetch sections');
    }
  };

  const fetchCurrentSlot = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/attendance/current-slot/${selectedSection}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentSlot(response.data);
      
      if (response.data.alreadyMarked) {
        toast.info('Attendance already marked for this session');
      } else if (!response.data.canMarkAttendance) {
        if (!response.data.isAuthorized) {
          toast.warning('You are not assigned to teach this subject');
        }
      }
    } catch (error) {
      console.error('Failed to fetch current slot:', error);
      setCurrentSlot(null);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const section = sections.find(s => s.name === selectedSection);
      
      if (!section) return;

      const response = await axios.get(`${API}/teacher/students/${section._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(response.data);
      
      // Initialize all students as present by default
      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach(student => {
      allPresent[student._id] = 'present';
    });
    setAttendance(allPresent);
    toast.success('All students marked as present');
  };

  const markAllAbsent = () => {
    const allAbsent = {};
    students.forEach(student => {
      allAbsent[student._id] = 'absent';
    });
    setAttendance(allAbsent);
    toast.success('All students marked as absent');
  };

  const handleSubmit = async () => {
    if (!currentSlot?.canMarkAttendance) {
      toast.error('Cannot mark attendance at this time');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const studentAttendance = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));

      await axios.post(
        `${API}/attendance/mark`,
        {
          section: selectedSection,
          studentAttendance
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Attendance marked successfully!');
      
      // Refresh current slot to update status
      await fetchCurrentSlot();
      
      // Clear attendance selections but keep students loaded
      const resetAttendance = {};
      students.forEach(student => {
        resetAttendance[student._id] = 'present';
      });
      setAttendance(resetAttendance);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to mark attendance';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSummary = () => {
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const late = Object.values(attendance).filter(s => s === 'late').length;
    return { present, absent, late };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
      </div>

      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Section</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full p-2 border rounded-lg"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Select a section</option>
            {sections.map(section => (
              <option key={section._id} value={section.name}>
                {section.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Current Slot Info */}
      {selectedSection && currentSlot && (
        <Card className={`border-2 ${
          currentSlot.canMarkAttendance 
            ? 'border-green-500 bg-green-50' 
            : currentSlot.alreadyMarked
            ? 'border-blue-500 bg-blue-50'
            : 'border-yellow-500 bg-yellow-50'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Class Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSlot.currentSlot ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-semibold text-lg">{currentSlot.currentSlot.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-lg">{currentSlot.currentSlot.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Section</p>
                    <p className="font-semibold text-lg">{currentSlot.section}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Day</p>
                    <p className="font-semibold text-lg">{currentSlot.day}</p>
                  </div>
                </div>

                {currentSlot.alreadyMarked && (
                  <div className="flex items-center gap-2 text-blue-700 mt-3">
                    <CheckCircle className="w-5 h-5" />
                    <p>Attendance already marked for this session</p>
                  </div>
                )}

                {!currentSlot.isAuthorized && (
                  <div className="flex items-center gap-2 text-yellow-700 mt-3">
                    <AlertCircle className="w-5 h-5" />
                    <p>You are not assigned to teach this subject</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600">
                <AlertCircle className="w-5 h-5" />
                <p>No class in session currently. Attendance can only be marked during class time.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Marking */}
      {selectedSection && currentSlot?.canMarkAttendance && students.length > 0 && (
        <>
          {/* Summary and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{getSummary().present}</p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{getSummary().absent}</p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{getSummary().late}</p>
                    <p className="text-sm text-gray-600">Late</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={markAllAbsent}>
                    Mark All Absent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle>Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map(student => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {student.imageURL ? (
                        <img
                          src={student.imageURL}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.rollNumber}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          attendance[student._id] === 'present'
                            ? getStatusColor('present')
                            : 'bg-white border-gray-300 hover:border-green-300'
                        }`}
                        onClick={() => handleAttendanceChange(student._id, 'present')}
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Present
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          attendance[student._id] === 'late'
                            ? getStatusColor('late')
                            : 'bg-white border-gray-300 hover:border-yellow-300'
                        }`}
                        onClick={() => handleAttendanceChange(student._id, 'late')}
                      >
                        <Clock className="w-4 h-4 inline mr-1" />
                        Late
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          attendance[student._id] === 'absent'
                            ? getStatusColor('absent')
                            : 'bg-white border-gray-300 hover:border-red-300'
                        }`}
                        onClick={() => handleAttendanceChange(student._id, 'absent')}
                      >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setAttendance({})}>
                  Reset
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Attendance'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600">Loading students...</p>
        </div>
      )}
    </div>
  );
}
