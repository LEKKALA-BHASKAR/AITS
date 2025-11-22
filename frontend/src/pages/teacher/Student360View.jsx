import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, User, Mail, Phone, Award, TrendingUp, 
  Calendar, BookOpen, MessageSquare, AlertCircle, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Teacher360StudentView() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [results, setResults] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudent360Data();
    }
  }, [studentId]);

  const fetchStudent360Data = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [studentRes, attendanceRes, resultsRes, achievementsRes, remarksRes] = await Promise.all([
        axios.get(`${API}/admin/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/attendance/student/${studentId}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/results/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/student/achievements`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API}/student/remarks`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      setStudent(studentRes.data);
      setAttendance(attendanceRes.data);
      setResults(resultsRes.data.results || []);
      setAchievements(achievementsRes.data.achievements || []);
      setRemarks(remarksRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch student data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'UN';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'O': 'bg-purple-100 text-purple-800',
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-blue-100 text-blue-800',
      'B+': 'bg-cyan-100 text-cyan-800',
      'B': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading student data...</div>;
  }

  if (!student) {
    return <div className="flex justify-center items-center h-64">Student not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Student 360° View</h1>
      </div>

      {/* Student Profile Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={student.imageURL} />
              <AvatarFallback className="text-4xl bg-white text-blue-600">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{student.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-50">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Roll: {student.rollNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{student.departmentId?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Section: {student.sectionId?.name || 'N/A'}</span>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex gap-3 mt-4">
                <Badge className={student.isActive ? 'bg-green-500' : 'bg-red-500'}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {student.atRisk && (
                  <Badge className="bg-red-500">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    At Risk
                  </Badge>
                )}
                {student.backlogCount > 0 && (
                  <Badge className="bg-orange-500">
                    {student.backlogCount} Backlogs
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {attendance?.overall?.percentage || 0}%
              </div>
              <CheckCircle className={`w-8 h-8 ${parseFloat(attendance?.overall?.percentage || 0) >= 75 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <Progress 
              value={parseFloat(attendance?.overall?.percentage || 0)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {results[0]?.cgpa || 'N/A'}
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Out of 10.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{achievements.length}</div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Total count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{remarks.length}</div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Total count</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="remarks">Remarks</TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendance?.bySubject?.map((subject, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{subject.subject}</span>
                      <span className={`text-lg font-bold ${parseFloat(subject.percentage) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                        {subject.percentage}%
                      </span>
                    </div>
                    <Progress value={parseFloat(subject.percentage)} />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Present: {subject.present}</span>
                      <span>Total: {subject.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Academic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((semesterResult, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold">Semester {semesterResult.semester}</h3>
                      {semesterResult.sgpa && (
                        <Badge className="bg-blue-500">SGPA: {semesterResult.sgpa}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {semesterResult.subjects?.map((subject, sIdx) => (
                        <div key={sIdx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{subject.subjectName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{subject.totalMarks}/100</span>
                            <Badge className={getGradeColor(subject.grade)}>
                              {subject.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-yellow-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        <Badge className="mt-2">{achievement.type}</Badge>
                        {achievement.certificateUrl && (
                          <a 
                            href={achievement.certificateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 block"
                          >
                            View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remarks Tab */}
        <TabsContent value="remarks">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {remarks.map((remark, idx) => (
                  <div key={idx} className={`border-l-4 p-4 rounded ${
                    remark.type === 'positive' ? 'border-green-500 bg-green-50' :
                    remark.type === 'negative' ? 'border-red-500 bg-red-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={
                        remark.type === 'positive' ? 'bg-green-500' :
                        remark.type === 'negative' ? 'bg-red-500' :
                        'bg-blue-500'
                      }>
                        {remark.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(remark.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{remark.remark}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      By: {remark.teacherId?.name || 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
