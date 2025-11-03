import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Students({ user }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/teacher/sections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(response.data);
      if (response.data.length > 0) {
        setSelectedSection(response.data[0]._id);
        fetchStudents(response.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (sectionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/teacher/students/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    fetchStudents(sectionId);
  };

  const calculateAttendance = (student) => {
    if (!student.attendance || student.attendance.length === 0) return 0;
    const present = student.attendance.filter(a => a.status === 'present').length;
    return ((present / student.attendance.length) * 100).toFixed(1);
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="students-title">Students</h1>
        {sections.length > 0 && (
          <div className="w-64">
            <Select value={selectedSection} onValueChange={handleSectionChange}>
              <SelectTrigger data-testid="section-select">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section._id} value={section._id}>{section.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Backlogs</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, idx) => {
                    const attendance = calculateAttendance(student);
                    return (
                      <TableRow key={idx} data-testid={`student-row-${idx}`}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.departmentId?.name}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${parseFloat(attendance) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                            {attendance}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${student.backlogCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {student.backlogCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.atRisk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {student.atRisk ? 'At Risk' : 'Good'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No students in this section</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
